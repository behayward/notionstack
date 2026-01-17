import { scrapeGumroadProduct } from './scrape-gumroad-enhanced.js';

// Test with the 2026 Notion Journal we analyzed earlier
const testUrl = 'https://thenotionbar.gumroad.com/l/2026-notion-journal';

console.log('Testing Gumroad scraper...\n');
console.log(`URL: ${testUrl}\n`);

const result = await scrapeGumroadProduct(testUrl);

if (result) {
  console.log('✓ Scraping successful!\n');
  console.log('Extracted Data:');
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log('✗ Scraping failed');
}
