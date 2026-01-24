#!/usr/bin/env node

// Check status of image scraping progress
// Shows how many products have images, which are missing, etc.

const fs = require('fs').promises;
const path = require('path');

const INPUT_FILE = '/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/enhanced-products-for-images.json';
const PRODUCTS_DIR = '/Users/blakehayward/Documents/Claude Projects/notionstack/content/products';
const IMAGES_DIR = '/Users/blakehayward/Documents/Claude Projects/notionstack/public/images/products';

async function checkImageExists(slug) {
  const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

  for (const ext of extensions) {
    const imagePath = path.join(IMAGES_DIR, `${slug}.${ext}`);
    try {
      await fs.access(imagePath);
      return ext;
    } catch {
      // File doesn't exist, try next extension
    }
  }

  return null;
}

async function checkProductJSON(productFile) {
  const filePath = path.join(PRODUCTS_DIR, productFile);

  try {
    const content = await fs.readFile(filePath, 'utf8');
    const product = JSON.parse(content);
    return product.imageUrl ? true : false;
  } catch {
    return false;
  }
}

async function main() {
  console.log('Image Scraping Status Check');
  console.log('='.repeat(60));
  console.log('');

  // Load products list
  const data = await fs.readFile(INPUT_FILE, 'utf8');
  const products = JSON.parse(data);

  let hasImage = 0;
  let hasImageUrl = 0;
  let missingImage = 0;
  let missingImageUrl = 0;

  const missingProducts = [];

  console.log('Checking 205 products...\n');

  for (const product of products) {
    const imageExt = await checkImageExists(product.slug);
    const hasJsonField = await checkProductJSON(product.file);

    if (imageExt) {
      hasImage++;
    } else {
      missingImage++;
    }

    if (hasJsonField) {
      hasImageUrl++;
    } else {
      missingImageUrl++;
    }

    if (!imageExt || !hasJsonField) {
      missingProducts.push({
        slug: product.slug,
        name: product.name,
        hasImage: !!imageExt,
        hasJsonField: hasJsonField
      });
    }
  }

  console.log('='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Total products: ${products.length}`);
  console.log('');
  console.log('Image files downloaded:');
  console.log(`  ✓ Present: ${hasImage} (${((hasImage / products.length) * 100).toFixed(1)}%)`);
  console.log(`  ✗ Missing: ${missingImage}`);
  console.log('');
  console.log('Product JSON updated:');
  console.log(`  ✓ Has imageUrl: ${hasImageUrl} (${((hasImageUrl / products.length) * 100).toFixed(1)}%)`);
  console.log(`  ✗ Missing imageUrl: ${missingImageUrl}`);
  console.log('');

  const fullyComplete = products.length - missingProducts.length;
  console.log(`Fully complete: ${fullyComplete}/${products.length} (${((fullyComplete / products.length) * 100).toFixed(1)}%)`);

  if (missingProducts.length > 0) {
    console.log('');
    console.log('='.repeat(60));
    console.log(`INCOMPLETE PRODUCTS (${missingProducts.length})`);
    console.log('='.repeat(60));

    missingProducts.slice(0, 20).forEach((p, i) => {
      const imageStatus = p.hasImage ? '✓' : '✗';
      const jsonStatus = p.hasJsonField ? '✓' : '✗';
      console.log(`${i + 1}. ${p.slug}`);
      console.log(`   Image: ${imageStatus} | JSON: ${jsonStatus}`);
    });

    if (missingProducts.length > 20) {
      console.log(`\n... and ${missingProducts.length - 20} more`);
    }

    console.log('');
    console.log('Run scraper to complete missing products:');
    console.log('  node scripts/scrape-images-batch.js');
  } else {
    console.log('');
    console.log('✓ All products complete!');
  }

  console.log('');
}

main().catch(console.error);
