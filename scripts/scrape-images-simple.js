// Simple ES module image scraper for Gumroad products
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'enhanced-products-for-images.json');
const PRODUCTS_DIR = path.join(__dirname, '../content/products');
const IMAGES_DIR = path.join(__dirname, '../public/images/products');
const ERROR_LOG = path.join(__dirname, 'image-scrape-errors.log');

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

async function downloadImage(imageUrl, savePath) {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http;
    const timeout = setTimeout(() => reject(new Error('Image download timeout')), 30000);

    protocol.get(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (res) => {
      clearTimeout(timeout);

      if (res.statusCode === 301 || res.statusCode === 302) {
        resolve(downloadImage(res.headers.location, savePath));
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(savePath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(savePath).catch(() => {});
        reject(err);
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

function getImageExtension(url) {
  const match = url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

async function logError(message) {
  const timestamp = new Date().toISOString();
  await fs.appendFile(ERROR_LOG, `[${timestamp}] ${message}\n`);
}

async function scrapeProduct(product, index, total) {
  const { slug, url, name, file } = product;

  console.log(`[${index + 1}/${total}] Processing: ${name}`);

  try {
    // Fetch the Gumroad page
    const html = await fetchHTML(url);

    // Extract og:image URL
    const imageUrl = extractOgImage(html);
    if (!imageUrl) {
      const msg = `No og:image found for ${slug}`;
      console.log(`  ⚠️  ${msg}`);
      await logError(msg);
      return false;
    }

    // Download the image
    const ext = getImageExtension(imageUrl);
    const imagePath = path.join(IMAGES_DIR, `${slug}.${ext}`);

    await downloadImage(imageUrl, imagePath);
    console.log(`  ✓ Downloaded image: ${slug}.${ext}`);

    // Update the product JSON
    const productPath = path.join(PRODUCTS_DIR, file);
    const productData = JSON.parse(await fs.readFile(productPath, 'utf8'));
    productData.imageUrl = `/images/products/${slug}.${ext}`;
    productData.lastUpdated = new Date().toISOString().split('T')[0];

    await fs.writeFile(productPath, JSON.stringify(productData, null, 2));
    console.log(`  ✓ Updated JSON: ${file}`);

    return true;
  } catch (error) {
    const msg = `Error for ${slug}: ${error.message}`;
    console.log(`  ✗ ${msg}`);
    await logError(msg);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting image scraper...\n');

  // Ensure images directory exists
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  // Load products list
  const productsData = await fs.readFile(INPUT_FILE, 'utf8');
  const products = JSON.parse(productsData);

  console.log(`Found ${products.length} products to process\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < products.length; i++) {
    const success = await scrapeProduct(products[i], i, products.length);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Rate limiting
    if (i < products.length - 1) {
      await delay(1500);
    }
  }

  console.log('\n✅ Scraping complete!');
  console.log(`Success: ${successCount}/${products.length}`);
  console.log(`Failed: ${failCount}/${products.length}`);
  console.log(`Success rate: ${((successCount / products.length) * 100).toFixed(1)}%`);
  console.log(`\nErrors logged to: ${ERROR_LOG}`);
}

main().catch(console.error);
