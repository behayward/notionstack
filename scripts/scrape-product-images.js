const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const INPUT_FILE = '/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/enhanced-products-for-images.json';
const PRODUCTS_DIR = '/Users/blakehayward/Documents/Claude Projects/notionstack/content/products';
const IMAGES_DIR = '/Users/blakehayward/Documents/Claude Projects/notionstack/public/images/products';
const ERROR_LOG = '/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/image-scrape-errors.log';
const DELAY_MS = 1500; // 1.5 second delay between requests

// Counters
let successCount = 0;
let errorCount = 0;
const errors = [];

// Helper: Delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Fetch HTML from URL
async function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Helper: Extract og:image URL from HTML
function extractOgImage(html) {
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  return ogImageMatch ? ogImageMatch[1] : null;
}

// Helper: Download image from URL
async function downloadImage(imageUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http;

    protocol.get(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (res) => {
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

      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

// Helper: Get file extension from URL or default to jpg
function getExtension(imageUrl) {
  const urlPath = imageUrl.split('?')[0]; // Remove query params
  const match = urlPath.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

// Helper: Update product JSON file
async function updateProductJSON(productFile, imageUrl, slug) {
  const filePath = path.join(PRODUCTS_DIR, productFile);

  try {
    const content = await fs.readFile(filePath, 'utf8');
    const product = JSON.parse(content);

    // Get extension from image URL
    const ext = getExtension(imageUrl);

    // Add imageUrl field
    product.imageUrl = `/images/products/${slug}.${ext}`;

    // Update lastUpdated
    const today = new Date().toISOString().split('T')[0];
    product.lastUpdated = today;

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(product, null, 2), 'utf8');

    return ext;
  } catch (error) {
    throw new Error(`Failed to update JSON: ${error.message}`);
  }
}

// Main processing function
async function processProduct(product, index, total) {
  console.log(`[${index + 1}/${total}] Processing: ${product.name}`);

  try {
    // Step 1: Fetch HTML
    const html = await fetchHTML(product.url);

    // Step 2: Extract og:image
    const ogImageUrl = extractOgImage(html);
    if (!ogImageUrl) {
      throw new Error('No og:image found');
    }

    // Step 3: Update product JSON and get extension
    const ext = await updateProductJSON(product.file, ogImageUrl, product.slug);

    // Step 4: Download image
    const imagePath = path.join(IMAGES_DIR, `${product.slug}.${ext}`);
    await downloadImage(ogImageUrl, imagePath);

    successCount++;
    console.log(`✓ Success: ${product.slug}.${ext}`);

  } catch (error) {
    errorCount++;
    const errorMsg = `${product.slug}: ${error.message}`;
    errors.push(errorMsg);
    console.log(`✗ Error: ${errorMsg}`);
  }
}

// Main execution
async function main() {
  console.log('Starting image scraper...\n');

  // Ensure images directory exists
  try {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create images directory:', error);
    process.exit(1);
  }

  // Load products
  let products;
  try {
    const data = await fs.readFile(INPUT_FILE, 'utf8');
    products = JSON.parse(data);
  } catch (error) {
    console.error('Failed to load products file:', error);
    process.exit(1);
  }

  console.log(`Loaded ${products.length} products\n`);

  // Process each product
  for (let i = 0; i < products.length; i++) {
    await processProduct(products[i], i, products.length);

    // Delay between requests (except for last one)
    if (i < products.length - 1) {
      await delay(DELAY_MS);
    }
  }

  // Write error log
  if (errors.length > 0) {
    await fs.writeFile(ERROR_LOG, errors.join('\n'), 'utf8');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total products: ${products.length}`);
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${errorCount}`);
  console.log(`Success rate: ${((successCount / products.length) * 100).toFixed(1)}%`);

  if (errors.length > 0) {
    console.log(`\nErrors logged to: ${ERROR_LOG}`);
  }
}

// Run the script
main().catch(console.error);
