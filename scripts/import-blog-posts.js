import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import dotenv from 'dotenv';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

function extractSlugFromUrl(url) {
  if (!url) return null;
  const match = url.match(/notionstack\.so\/blog\/([^/?]+)/);
  return match ? match[1] : null;
}

function getPropertyValue(property) {
  if (!property) return null;

  switch (property.type) {
    case 'title':
      return property.title?.[0]?.plain_text || '';
    case 'rich_text':
      return property.rich_text?.[0]?.plain_text || '';
    case 'number':
      return property.number;
    case 'select':
      return property.select?.name || '';
    case 'multi_select':
      return property.multi_select?.map(s => s.name) || [];
    case 'url':
      return property.url || '';
    case 'date':
      return property.date?.start || '';
    default:
      return null;
  }
}

async function fetchAllPages(databaseId) {
  let allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
      page_size: 100,
    });

    allPages = allPages.concat(response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return allPages;
}

async function convertPageToMarkdown(pageId) {
  try {
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdBlocks);
    return mdString.parent || '';
  } catch (error) {
    console.error(`Error converting page ${pageId} to markdown:`, error.message);
    return '';
  }
}

async function transformBlogPost(page) {
  const props = page.properties;

  const title = getPropertyValue(props['Name']);
  if (!title) return null; // Skip empty posts

  let slug = extractSlugFromUrl(getPropertyValue(props['NotionStack URL']));
  if (!slug) {
    slug = generateSlug(title);
  }

  const description = getPropertyValue(props['Description']) ||
                      getPropertyValue(props['meta:description']) || '';
  const tags = getPropertyValue(props['Tags']) || [];
  const publishedDate = getPropertyValue(props['Published Date']) ||
                        getPropertyValue(props['Created']) || '';
  const lastUpdated = getPropertyValue(props['Last Updated']) || publishedDate;

  // Convert Notion page content to Markdown
  console.log(`  Converting "${title}" to markdown...`);
  const content = await convertPageToMarkdown(page.id);

  return {
    slug,
    title,
    description: description.substring(0, 300),
    tags,
    publishedDate: publishedDate || new Date().toISOString().split('T')[0],
    lastUpdated: lastUpdated || new Date().toISOString().split('T')[0],
    content,
    _notionId: page.id,
    _originalUrl: getPropertyValue(props['NotionStack URL']) || null
  };
}

async function saveBlogPost(post) {
  const filename = `${post.slug}.md`;
  const filepath = join(process.cwd(), 'content', 'blog', filename);

  // Create frontmatter
  const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
description: "${post.description.replace(/"/g, '\\"')}"
publishedDate: ${post.publishedDate}
lastUpdated: ${post.lastUpdated}
tags: [${post.tags.map(t => `"${t}"`).join(', ')}]
---

${post.content}
`;

  await writeFile(filepath, frontmatter);
  return filename;
}

async function importBlogPosts() {
  console.log('\n📝 Starting Blog Import...\n');

  // Ensure blog directory exists
  await mkdir(join(process.cwd(), 'content', 'blog'), { recursive: true });

  let stats = {
    imported: 0,
    skipped: 0,
    errors: 0
  };

  const redirects = [];

  try {
    console.log('Fetching blog posts...');
    const posts = await fetchAllPages(process.env.NOTION_BLOG_DB);
    console.log(`Found ${posts.length} blog posts\n`);

    for (let i = 0; i < posts.length; i++) {
      try {
        const post = await transformBlogPost(posts[i]);

        if (!post) {
          stats.skipped++;
          continue;
        }

        await saveBlogPost(post);
        stats.imported++;

        // Add to redirects
        if (post._originalUrl) {
          const oldPath = post._originalUrl.replace('https://notionstack.so', '');
          const newPath = `/blog/${post.slug}`;
          redirects.push(`${oldPath} ${newPath} 301`);
        }

        console.log(`  ✓ Imported: ${post.title}`);

      } catch (error) {
        console.error(`  ✗ Error processing post ${i}:`, error.message);
        stats.errors++;
      }
    }

    // Append blog redirects to existing redirects file
    const existingRedirects = await import('fs').then(fs =>
      fs.promises.readFile(join(process.cwd(), 'public', '_redirects'), 'utf-8')
    ).catch(() => '');

    const allRedirects = existingRedirects + '\n\n# Blog redirects\n' + redirects.join('\n');
    await writeFile(join(process.cwd(), 'public', '_redirects'), allRedirects);

    console.log('\n📊 Blog Import Summary:');
    console.log('═'.repeat(50));
    console.log(`  Imported:  ${stats.imported}`);
    console.log(`  Skipped:   ${stats.skipped}`);
    console.log(`  Errors:    ${stats.errors}`);
    console.log('═'.repeat(50));
    console.log(`\n✅ Blog import complete!\n`);

  } catch (error) {
    console.error('\n❌ Blog import failed:', error);
    throw error;
  }
}

importBlogPosts().catch(console.error);
