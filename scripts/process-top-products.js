import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { scrapeGumroadProduct } from './scrape-gumroad-enhanced.js';

/**
 * Process top products in priority order:
 * 1. Scrape ratings and images from Gumroad
 * 2. Prepare for AI enhancement
 *
 * Priority scoring:
 * - Has affiliate link: +100
 * - Price > 0: +50
 * - Rating >= 4.0: +rating * 10
 * - Sales count: +salesCount * 0.5
 */

async function scoreProduct(product) {
  let score = 0;

  if (product.hasAffiliate) score += 100;
  if (product.price > 0) score += 50;
  if (product.rating && product.rating >= 4.0) score += product.rating * 10;
  if (product.salesCount) score += product.salesCount * 0.5;

  return score;
}

async function processTopProducts(limit = 100) {
  console.log('Loading and scoring all products...\n');

  const productsDir = join(process.cwd(), 'content/products');
  const files = await readdir(productsDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));

  // Load all products
  const products = [];
  for (const file of jsonFiles) {
    const filePath = join(productsDir, file);
    const product = JSON.parse(await readFile(filePath, 'utf-8'));
    product._filePath = filePath;
    product._fileName = file;
    products.push(product);
  }

  // Score and sort
  for (const product of products) {
    product._score = await scoreProduct(product);
  }

  products.sort((a, b) => b._score - a._score);

  console.log(`Total products: ${products.length}`);
  console.log(`Processing top ${limit} products\n`);

  // Process top N products
  const topProducts = products.slice(0, limit);

  const stats = {
    processed: 0,
    scraped: 0,
    prepped: 0,
    errors: 0,
    skipped: 0
  };

  for (let i = 0; i < topProducts.length; i++) {
    const product = topProducts[i];
    stats.processed++;

    console.log(`\n[${stats.processed}/${limit}] ${product.name}`);
    console.log(`  Score: ${product._score.toFixed(1)} | Price: $${product.price} | Platform: ${product.platform}`);

    try {
      // Skip if already has good data
      if (product.rating && product.rating <= 5 && product.image && product.rawData) {
        console.log(`  ✓ Already complete (rating: ${product.rating}, has image, has rawData)`);
        stats.skipped++;
        continue;
      }

      // Scrape from Gumroad if applicable
      if (product.platform === 'gumroad' && product.productUrl) {
        // Extract clean Gumroad URL
        let gumroadUrl = product.productUrl;

        // Handle affiliate URLs - follow redirect
        if (gumroadUrl.includes('gumroad.com/a/')) {
          console.log(`  → Following affiliate redirect...`);
          try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(gumroadUrl, {
              method: 'HEAD',
              redirect: 'manual'
            });

            const location = response.headers.get('location');
            if (location) {
              gumroadUrl = location;
              console.log(`  → Redirected to: ${gumroadUrl}`);
            } else {
              console.log(`  ⚠ No redirect found, using original URL`);
            }
          } catch (error) {
            console.log(`  ⚠ Redirect failed: ${error.message}`);
            stats.skipped++;
            continue;
          }
        }

        console.log(`  → Scraping: ${gumroadUrl}`);

        const scraped = await scrapeGumroadProduct(gumroadUrl);

        if (scraped && scraped.starRating) {
          // Update product with scraped data
          product.rating = scraped.starRating;
          product.ratingCount = scraped.reviewCount;

          if (scraped.ogImage) {
            product.image = scraped.ogImage;
          }

          if (scraped.salesCount) {
            product.salesCount = scraped.salesCount;
          }

          // Add raw data for AI enhancement
          if (!product.rawData && scraped.rawData) {
            product.rawData = scraped.rawData;
          }

          // Save updated product
          const filePath = product._filePath;
          delete product._filePath;
          delete product._fileName;
          delete product._score;

          await writeFile(
            filePath,
            JSON.stringify(product, null, 2)
          );

          stats.scraped++;
          console.log(`  ✓ Scraped: ${scraped.starRating}/5 stars, ${scraped.reviewCount} reviews`);
        } else {
          console.log(`  ✗ Scraping failed`);
          stats.errors++;
        }

        // Rate limiting: 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));

      } else {
        // Non-Gumroad or no URL - just prep rawData if needed
        if (!product.rawData && (product.description || product.features)) {
          product.rawData = {
            description: product.description || '',
            features: product.features ?
              (typeof product.features === 'string' ?
                product.features.split(';').map(f => f.trim()).filter(f => f.length > 0) :
                product.features) :
              [],
            reviewQuotes: []
          };

          const filePath2 = product._filePath;
          delete product._filePath;
          delete product._fileName;
          delete product._score;

          await writeFile(
            filePath2,
            JSON.stringify(product, null, 2)
          );

          stats.prepped++;
          console.log(`  ✓ Prepped rawData`);
        } else {
          console.log(`  ⚠ Skipped (not Gumroad or already has data)`);
          stats.skipped++;
        }
      }

    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
      stats.errors++;
    }
  }

  console.log('\n=== Processing Complete ===');
  console.log(`Processed: ${stats.processed}`);
  console.log(`Scraped from Gumroad: ${stats.scraped}`);
  console.log(`Prepped for AI: ${stats.prepped}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);

  return stats;
}

// Parse command line arguments
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 100;

processTopProducts(limit).catch(console.error);
