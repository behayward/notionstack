#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const INPUT_FILE = process.argv[2] || '/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/enhanced-products-for-images.json';
const PRODUCTS_DIR = '/Users/blakehayward/Documents/Claude Projects/notionstack/content/products';
const IMAGES_DIR = '/Users/blakehayward/Documents/Claude Projects/notionstack/public/images/products';
const ERROR_LOG = '/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/image-scrape-errors.log';
const PROGRESS_FILE = '/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/image-scrape-progress.json';

// Batch settings from command line or defaults
const START_INDEX = parseInt(process.argv[3]) || 0;
const BATCH_SIZE = parseInt(process.argv[4]) || 50;
const DELAY_MS = 1500;

// Counters
let successCount = 0;
let errorCount = 0;
const errors = [];

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch HTML
async function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = setTimeout(() => reject(new Error('Timeout')), 10000);

    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (res) => {
      clearTimeout(timeout);

      if (res.statusCode === 301 || res.statusCode === 302) {
        resolve(fetchHTML(res.headers.location));
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// Extract og:image
function extractOgImage(html) {
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  return ogImageMatch ? ogImageMatch[1] : null;
}

// Download image
async function downloadImage(imageUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http;
    const timeout = setTimeout(() => reject(new Error('Download timeout')), 30000);

    protocol.get(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (res) => {
      clearTimeout(timeout);

      if (res.statusCode === 301 || res.statusCode === 302) {
        resolve(downloadImage(res.headers.location, outputPath));
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const fileStream = require('fs').createWriteStream(outputPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fileStream.close();
        reject(err);
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// Get file extension
function getExtension(imageUrl) {
  const urlPath = imageUrl.split('?')[0];
  const match = urlPath.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

// Update product JSON
async function updateProductJSON(productFile, imageUrl, slug) {
  const filePath = path.join(PRODUCTS_DIR, productFile);

  const content = await fs.readFile(filePath, 'utf8');
  const product = JSON.parse(content);

  const ext = getExtension(imageUrl);
  product.imageUrl = `/images/products/${slug}.${ext}`;

  const today = new Date().toISOString().split('T')[0];
  product.lastUpdated = today;

  await fs.writeFile(filePath, JSON.stringify(product, null, 2), 'utf8');

  return ext;
}

// Process one product
async function processProduct(product, index, total) {
  const progress = `[${index + 1}/${total}]`;
  console.log(`${progress} ${product.name}`);

  try {
    const html = await fetchHTML(product.url);
    const ogImageUrl = extractOgImage(html);

    if (!ogImageUrl) {
      throw new Error('No og:image found');
    }

    const ext = await updateProductJSON(product.file, ogImageUrl, product.slug);
    const imagePath = path.join(IMAGES_DIR, `${product.slug}.${ext}`);

    await downloadImage(ogImageUrl, imagePath);

    successCount++;
    console.log(`  ✓ ${product.slug}.${ext}`);
    return { success: true, slug: product.slug };

  } catch (error) {
    errorCount++;
    const errorMsg = `${product.slug}: ${error.message}`;
    errors.push(errorMsg);
    console.log(`  ✗ ${error.message}`);
    return { success: false, slug: product.slug, error: error.message };
  }
}

// Main
async function main() {
  console.log('Image Scraper');
  console.log('='.repeat(60));

  // Create images directory
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  // Load products
  const data = await fs.readFile(INPUT_FILE, 'utf8');
  const allProducts = JSON.parse(data);

  // Determine batch
  const endIndex = Math.min(START_INDEX + BATCH_SIZE, allProducts.length);
  const products = allProducts.slice(START_INDEX, endIndex);

  console.log(`Total products: ${allProducts.length}`);
  console.log(`Processing: ${START_INDEX + 1} to ${endIndex} (${products.length} items)`);
  console.log('='.repeat(60));
  console.log('');

  const results = [];

  // Process each product
  for (let i = 0; i < products.length; i++) {
    const result = await processProduct(products[i], START_INDEX + i, allProducts.length);
    results.push(result);

    if (i < products.length - 1) {
      await delay(DELAY_MS);
    }
  }

  // Save progress
  const progress = {
    lastIndex: endIndex - 1,
    totalProcessed: endIndex,
    totalProducts: allProducts.length,
    successCount,
    errorCount,
    timestamp: new Date().toISOString()
  };
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));

  // Save errors
  if (errors.length > 0) {
    const existingErrors = await fs.readFile(ERROR_LOG, 'utf8').catch(() => '');
    await fs.writeFile(ERROR_LOG, existingErrors + errors.join('\n') + '\n', 'utf8');
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('BATCH SUMMARY');
  console.log('='.repeat(60));
  console.log(`Processed: ${products.length}`);
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${errorCount}`);
  console.log(`Success rate: ${((successCount / products.length) * 100).toFixed(1)}%`);
  console.log('');
  console.log(`Progress: ${endIndex}/${allProducts.length} (${((endIndex / allProducts.length) * 100).toFixed(1)}%)`);

  if (endIndex < allProducts.length) {
    console.log('');
    console.log('To continue:');
    console.log(`node scripts/scrape-images-batch.js "${INPUT_FILE}" ${endIndex} ${BATCH_SIZE}`);
  } else {
    console.log('');
    console.log('ALL PRODUCTS PROCESSED!');
  }
}

main().catch(console.error);
