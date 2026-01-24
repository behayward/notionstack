#!/usr/bin/env node

// Quick test script to verify the image scraping works
// Tests with just 3 products

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

const INPUT_FILE = '/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/enhanced-products-for-images.json';
const PRODUCTS_DIR = '/Users/blakehayward/Documents/Claude Projects/notionstack/content/products';
const IMAGES_DIR = '/Users/blakehayward/Documents/Claude Projects/notionstack/public/images/products';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

function extractOgImage(html) {
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  return ogImageMatch ? ogImageMatch[1] : null;
}

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

function getExtension(imageUrl) {
  const urlPath = imageUrl.split('?')[0];
  const match = urlPath.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

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

async function testProduct(product) {
  console.log(`\nTesting: ${product.name}`);
  console.log(`URL: ${product.url}`);

  try {
    console.log('  Fetching page...');
    const html = await fetchHTML(product.url);

    console.log('  Extracting og:image...');
    const ogImageUrl = extractOgImage(html);

    if (!ogImageUrl) {
      throw new Error('No og:image found');
    }

    console.log(`  Found: ${ogImageUrl}`);

    console.log('  Updating product JSON...');
    const ext = await updateProductJSON(product.file, ogImageUrl, product.slug);

    console.log('  Downloading image...');
    const imagePath = path.join(IMAGES_DIR, `${product.slug}.${ext}`);
    await downloadImage(ogImageUrl, imagePath);

    console.log(`  ✓ SUCCESS: ${product.slug}.${ext}`);
    return true;

  } catch (error) {
    console.log(`  ✗ FAILED: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Image Scraper Test');
  console.log('Testing with first 3 products...\n');

  await fs.mkdir(IMAGES_DIR, { recursive: true });

  const data = await fs.readFile(INPUT_FILE, 'utf8');
  const allProducts = JSON.parse(data);
  const testProducts = allProducts.slice(0, 3);

  let successCount = 0;

  for (let i = 0; i < testProducts.length; i++) {
    const success = await testProduct(testProducts[i]);
    if (success) successCount++;

    if (i < testProducts.length - 1) {
      console.log('\nWaiting 1.5 seconds...');
      await delay(1500);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Results: ${successCount}/${testProducts.length} successful`);
  console.log('='.repeat(60));

  if (successCount === testProducts.length) {
    console.log('\n✓ All tests passed! Ready to run full scraper.');
    console.log('\nRun the full scraper with:');
    console.log('  node scripts/scrape-images-batch.js');
    console.log('\nOr run all batches:');
    console.log('  bash scripts/run-image-scraper.sh');
  } else {
    console.log('\n✗ Some tests failed. Check errors above.');
  }
}

main().catch(console.error);
