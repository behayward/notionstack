import { scrapeGumroadProduct } from './scrape-gumroad-enhanced.js';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Fix the Expense Tracker rating by re-scraping from Gumroad
 */

async function fixExpenseTrackerRating() {
  console.log('Fixing Expense Tracker rating...\n');

  // Read the current product file
  const productPath = join(process.cwd(), 'content/products/notion-expense-tracker.json');
  const product = JSON.parse(await readFile(productPath, 'utf-8'));

  console.log(`Current rating: ${product.rating}`);
  console.log(`Current ratingCount: ${product.ratingCount}\n`);

  // Re-scrape from the original Gumroad URL
  const gumroadUrl = 'https://easlo.gumroad.com/l/expense';
  console.log(`Scraping: ${gumroadUrl}\n`);

  const scrapedData = await scrapeGumroadProduct(gumroadUrl);

  if (scrapedData && scrapedData.starRating) {
    console.log(`✓ Scraped star rating: ${scrapedData.starRating}`);
    console.log(`✓ Scraped review count: ${scrapedData.reviewCount}\n`);

    // Update the product with correct data
    product.rating = scrapedData.starRating;
    product.ratingCount = scrapedData.reviewCount;

    if (scrapedData.ogImage) {
      product.image = scrapedData.ogImage;
      console.log(`✓ Updated image: ${scrapedData.ogImage}\n`);
    }

    // Save back to file
    await writeFile(productPath, JSON.stringify(product, null, 2));

    console.log('✓ Product file updated successfully!');
  } else {
    console.log('✗ Failed to scrape rating data');
  }
}

fixExpenseTrackerRating().catch(console.error);
