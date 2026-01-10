import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import dotenv from 'dotenv';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

// Slug generation - same as current site
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

// Extract URL slug from NotionStack URL
function extractSlugFromUrl(url) {
  if (!url) return null;
  const match = url.match(/notionstack\.so\/(?:templates|courses|tools|blog)\/([^/?]+)/);
  return match ? match[1] : null;
}

// Property extractors
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
    case 'checkbox':
      return property.checkbox || false;
    case 'date':
      return property.date?.start || '';
    case 'formula':
      if (property.formula?.type === 'string') return property.formula.string;
      if (property.formula?.type === 'number') return property.formula.number;
      return null;
    case 'relation':
      return property.relation || [];
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

// Transform templates to product JSON
async function transformTemplate(page, index) {
  const props = page.properties;

  // Get the title
  const title = getPropertyValue(props['Template']) ||
                getPropertyValue(props['Product Name']) ||
                getPropertyValue(props['Updated Title']);

  // Try to get slug from NotionStack URL first (preserves SEO)
  let slug = extractSlugFromUrl(getPropertyValue(props['NotionStack page']));

  // If no URL, generate from title
  if (!slug) {
    slug = generateSlug(title);
  }

  // Get description
  const description = getPropertyValue(props['Short Description']) ||
                      getPropertyValue(props['Description']) ||
                      getPropertyValue(props['Desc']) ||
                      '';

  // Get price
  const price = getPropertyValue(props['Price']) || 0;

  // Get affiliate URL
  const affiliateUrl = getPropertyValue(props['AffLink']) ||
                       getPropertyValue(props['Purchase']);
  const productUrl = getPropertyValue(props['Product page']) ||
                     getPropertyValue(props['BuyLink']) ||
                     affiliateUrl;

  // Get creator (will need to fetch from relation if needed)
  const creatorName = getPropertyValue(props['Creator G']) || 'Unknown Creator';

  // Get tags
  const tags = getPropertyValue(props['Tags']) || [];

  // Get platform
  const paymentPlatform = getPropertyValue(props['Payment platform']) || [];
  const platform = Array.isArray(paymentPlatform) ? paymentPlatform[0]?.toLowerCase() : paymentPlatform.toLowerCase();

  // Get affiliate rate
  const affiliateRate = getPropertyValue(props['Affiliate Rate']) || 30;

  // Generate unique ID
  const id = `${slug}-${String(index + 1).padStart(3, '0')}`;

  return {
    id,
    name: title,
    slug,
    description: description.substring(0, 300), // Keep it concise
    price,
    currency: 'USD',
    creator: {
      name: creatorName,
      url: getPropertyValue(props['Creator profile page']) || ''
    },
    platform: platform || 'gumroad',
    productUrl: productUrl || '',
    affiliateUrl: affiliateUrl || productUrl || '',
    category: 'template',
    subcategory: tags[0]?.toLowerCase() || 'productivity',
    tags: tags.slice(0, 10), // Limit tags
    useCases: ['personal', 'business', 'students'], // Default, can refine later
    hasAffiliate: !!affiliateUrl,
    affiliateRate: affiliateRate < 1 ? affiliateRate * 100 : affiliateRate, // Convert 0.3 to 30
    status: 'active',
    dateAdded: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    _notionId: page.id, // Keep for reference
    _originalUrl: getPropertyValue(props['NotionStack page']) || null
  };
}

// Transform courses to product JSON
async function transformCourse(page, index) {
  const props = page.properties;

  const title = getPropertyValue(props['Name']);

  let slug = extractSlugFromUrl(getPropertyValue(props['NotionStack page']));
  if (!slug) {
    slug = generateSlug(title);
  }

  const description = getPropertyValue(props['Description']) || '';
  const price = getPropertyValue(props['Price']) || 0;

  const affiliateUrl = getPropertyValue(props['Product Page']);
  const productUrl = getPropertyValue(props['Purchase page']) || affiliateUrl;

  const tags = getPropertyValue(props['Tags']) || [];
  const platform = getPropertyValue(props['Payment Platform'])?.toLowerCase() || 'gumroad';

  const id = `${slug}-${String(index + 1).padStart(3, '0')}`;

  return {
    id,
    name: title,
    slug,
    description: description.substring(0, 300),
    price,
    currency: 'USD',
    creator: {
      name: 'Creator', // Will need to fetch from relation
      url: ''
    },
    platform,
    productUrl: productUrl || '',
    affiliateUrl: affiliateUrl || productUrl || '',
    category: 'course',
    subcategory: tags[0]?.toLowerCase() || 'beginner',
    tags: tags.slice(0, 10),
    useCases: ['personal', 'business', 'students'],
    hasAffiliate: !!affiliateUrl,
    affiliateRate: 30,
    status: 'active',
    dateAdded: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    _notionId: page.id,
    _originalUrl: getPropertyValue(props['NotionStack page']) || null
  };
}

// Transform tools to product JSON
async function transformTool(page, index) {
  const props = page.properties;

  const title = getPropertyValue(props['Name']);

  let slug = extractSlugFromUrl(getPropertyValue(props['NotionStack URL']));
  if (!slug) {
    slug = generateSlug(title);
  }

  const description = getPropertyValue(props['About']) || '';
  const websiteUrl = getPropertyValue(props['Website']) || '';
  const affiliateUrl = getPropertyValue(props['Affiliate']) || '';

  const tags = getPropertyValue(props['Tags']) || [];
  const pricing = getPropertyValue(props['Pricing']) || [];

  // Determine price based on pricing tags
  let price = 0;
  if (pricing.includes('Paid')) price = 29; // Default price for paid tools
  else if (pricing.includes('Freemium')) price = 0;
  else price = 0;

  const id = `${slug}-${String(index + 1).padStart(3, '0')}`;

  return {
    id,
    name: title,
    slug,
    description: description.substring(0, 300),
    price,
    currency: 'USD',
    creator: {
      name: title, // Tools typically self-branded
      url: websiteUrl
    },
    platform: 'tool',
    productUrl: websiteUrl || '',
    affiliateUrl: affiliateUrl || websiteUrl || '',
    category: 'tool',
    subcategory: tags[0]?.toLowerCase() || 'integration',
    tags: tags.slice(0, 10),
    useCases: ['personal', 'business'],
    hasAffiliate: !!affiliateUrl,
    affiliateRate: 30,
    status: 'active',
    dateAdded: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    _notionId: page.id,
    _originalUrl: getPropertyValue(props['NotionStack URL']) || null
  };
}

// Save product JSON file
async function saveProduct(product) {
  const filename = `${product.slug}-${product.id.split('-').pop()}.json`;
  const filepath = join(process.cwd(), 'content', 'products', filename);

  // Remove internal fields before saving
  const { _notionId, _originalUrl, ...cleanProduct } = product;

  await writeFile(filepath, JSON.stringify(cleanProduct, null, 2));
  return filename;
}

// Main import function
async function importProducts() {
  console.log('\n📦 Starting Notion Import...\n');

  let stats = {
    templates: 0,
    courses: 0,
    tools: 0,
    errors: 0,
    duplicateSlugs: new Set()
  };

  const allSlugs = new Set();
  const slugToUrl = new Map(); // Track slug -> original URL mapping

  try {
    // Import Templates
    console.log('Fetching templates...');
    const templates = await fetchAllPages(process.env.NOTION_TEMPLATES_DB);
    console.log(`Found ${templates.length} templates\n`);

    for (let i = 0; i < templates.length; i++) {
      try {
        const product = await transformTemplate(templates[i], i);

        // Check for duplicate slugs
        if (allSlugs.has(product.slug)) {
          stats.duplicateSlugs.add(product.slug);
          product.slug = `${product.slug}-${i}`;
        }

        allSlugs.add(product.slug);
        if (product._originalUrl) {
          slugToUrl.set(product.slug, product._originalUrl);
        }

        const filename = await saveProduct(product);
        stats.templates++;

        if ((i + 1) % 50 === 0) {
          console.log(`  Processed ${i + 1}/${templates.length} templates...`);
        }
      } catch (error) {
        console.error(`  Error processing template ${i}:`, error.message);
        stats.errors++;
      }
    }

    console.log(`✓ Imported ${stats.templates} templates\n`);

    // Import Courses
    console.log('Fetching courses...');
    const courses = await fetchAllPages(process.env.NOTION_COURSES_DB);
    console.log(`Found ${courses.length} courses\n`);

    for (let i = 0; i < courses.length; i++) {
      try {
        const product = await transformCourse(courses[i], i);

        if (allSlugs.has(product.slug)) {
          stats.duplicateSlugs.add(product.slug);
          product.slug = `${product.slug}-${i}`;
        }

        allSlugs.add(product.slug);
        if (product._originalUrl) {
          slugToUrl.set(product.slug, product._originalUrl);
        }

        await saveProduct(product);
        stats.courses++;
      } catch (error) {
        console.error(`  Error processing course ${i}:`, error.message);
        stats.errors++;
      }
    }

    console.log(`✓ Imported ${stats.courses} courses\n`);

    // Import Tools
    console.log('Fetching tools...');
    const tools = await fetchAllPages(process.env.NOTION_TOOLS_DB);
    console.log(`Found ${tools.length} tools\n`);

    for (let i = 0; i < tools.length; i++) {
      try {
        const product = await transformTool(tools[i], i);

        if (allSlugs.has(product.slug)) {
          stats.duplicateSlugs.add(product.slug);
          product.slug = `${product.slug}-${i}`;
        }

        allSlugs.add(product.slug);
        if (product._originalUrl) {
          slugToUrl.set(product.slug, product._originalUrl);
        }

        await saveProduct(product);
        stats.tools++;
      } catch (error) {
        console.error(`  Error processing tool ${i}:`, error.message);
        stats.errors++;
      }
    }

    console.log(`✓ Imported ${stats.tools} tools\n`);

    // Save redirect mapping
    const redirects = [];
    for (const [slug, originalUrl] of slugToUrl.entries()) {
      if (originalUrl) {
        const oldPath = originalUrl.replace('https://notionstack.so', '');
        const newPath = `/products/${slug}`;
        redirects.push(`${oldPath} ${newPath} 301`);
      }
    }

    await writeFile(
      join(process.cwd(), 'public', '_redirects'),
      redirects.join('\n')
    );

    console.log('📊 Import Summary:');
    console.log('═'.repeat(50));
    console.log(`  Templates: ${stats.templates}`);
    console.log(`  Courses:   ${stats.courses}`);
    console.log(`  Tools:     ${stats.tools}`);
    console.log(`  Total:     ${stats.templates + stats.courses + stats.tools}`);
    console.log(`  Errors:    ${stats.errors}`);
    if (stats.duplicateSlugs.size > 0) {
      console.log(`  Duplicate slugs fixed: ${stats.duplicateSlugs.size}`);
    }
    console.log('═'.repeat(50));
    console.log(`\n✅ Import complete! Redirect file created.\n`);

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    throw error;
  }
}

importProducts().catch(console.error);
