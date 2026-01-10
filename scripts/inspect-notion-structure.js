import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });

async function inspectDatabase(databaseId, name) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Inspecting ${name} Database`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Get database structure
    const database = await notion.databases.retrieve({ database_id: databaseId });

    console.log(`Database Title: ${database.title?.[0]?.plain_text || 'Untitled'}`);
    console.log(`\nProperties:`);
    console.log('-'.repeat(60));

    for (const [propName, propData] of Object.entries(database.properties)) {
      console.log(`  ${propName}:`);
      console.log(`    Type: ${propData.type}`);

      // Show select/multi-select options
      if (propData.type === 'select' && propData.select?.options) {
        console.log(`    Options: ${propData.select.options.map(o => o.name).join(', ')}`);
      }
      if (propData.type === 'multi_select' && propData.multi_select?.options) {
        console.log(`    Options: ${propData.multi_select.options.map(o => o.name).join(', ')}`);
      }
    }

    // Get first few entries as examples
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Sample Entries (first 3):`);
    console.log(`${'='.repeat(60)}\n`);

    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 3,
    });

    response.results.forEach((page, index) => {
      console.log(`\nEntry ${index + 1}:`);
      console.log('-'.repeat(40));

      for (const [propName, propData] of Object.entries(page.properties)) {
        const value = extractPropertyValue(propData);
        if (value) {
          console.log(`  ${propName}: ${value}`);
        }
      }
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Total entries in database: ${response.results.length} (showing first 3)`);
    console.log(`Has more: ${response.has_more}`);
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error(`Error inspecting ${name}:`, error.message);
    if (error.code === 'object_not_found') {
      console.error('\nMake sure you:');
      console.error('1. Shared the database with your integration');
      console.error('2. The database ID is correct');
    }
  }
}

function extractPropertyValue(property) {
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
      return property.multi_select?.map(s => s.name).join(', ') || '';
    case 'date':
      return property.date?.start || '';
    case 'checkbox':
      return property.checkbox ? 'Yes' : 'No';
    case 'url':
      return property.url || '';
    case 'email':
      return property.email || '';
    case 'phone_number':
      return property.phone_number || '';
    case 'status':
      return property.status?.name || '';
    case 'people':
      return property.people?.map(p => p.name).join(', ') || '';
    case 'files':
      return property.files?.map(f => f.name).join(', ') || '';
    case 'relation':
      return `${property.relation?.length || 0} relation(s)`;
    case 'formula':
      return extractPropertyValue({ type: property.formula?.type, ...property.formula });
    case 'rollup':
      return `Rollup (${property.rollup?.type})`;
    default:
      return `[${property.type}]`;
  }
}

async function main() {
  console.log('\n🔍 NotionStack Database Structure Inspector\n');

  await inspectDatabase(process.env.NOTION_TEMPLATES_DB, 'Templates');
  await inspectDatabase(process.env.NOTION_COURSES_DB, 'Courses');
  await inspectDatabase(process.env.NOTION_TOOLS_DB, 'Tools');
  await inspectDatabase(process.env.NOTION_BLOG_DB, 'Blog');

  console.log('\n✅ Inspection complete!\n');
}

main().catch(console.error);
