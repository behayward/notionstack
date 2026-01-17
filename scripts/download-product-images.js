import fetch from 'node-fetch';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

/**
 * Download product images from Gumroad and save locally
 * Updates product files with local image paths
 */

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  await pipeline(response.body, createWriteStream(filepath));
}

async function downloadProductImages() {
  console.log('Downloading product images...\n');

  // Ensure public/images/products directory exists
  const imagesDir = join(process.cwd(), 'public/images/products');
  await mkdir(imagesDir, { recursive: true });

  // Read all product files
  const productsDir = join(process.cwd(), 'content/products');
  const { readdir } = await import('fs/promises');
  const files = await readdir(productsDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));

  const stats = {
    total: 0,
    downloaded: 0,
    skipped: 0,
    errors: 0
  };

  for (const file of jsonFiles) {
    try {
      const filePath = join(productsDir, file);
      const product = JSON.parse(await readFile(filePath, 'utf-8'));

      // Skip if no image or already local
      if (!product.image) {
        stats.skipped++;
        continue;
      }

      if (product.image.startsWith('/images/')) {
        console.log(`✓ Already local: ${product.name}`);
        stats.skipped++;
        continue;
      }

      stats.total++;

      // Generate filename from slug
      const ext = product.image.includes('.jpg') || product.image.includes('jpeg') ? '.jpg' :
                  product.image.includes('.png') ? '.png' : '.jpg';
      const filename = `${product.slug}${ext}`;
      const localPath = join(imagesDir, filename);
      const publicPath = `/images/products/${filename}`;

      // Download image
      console.log(`Downloading: ${product.name}`);
      await downloadImage(product.image, localPath);

      // Update product file
      product.image = publicPath;
      await writeFile(filePath, JSON.stringify(product, null, 2));

      stats.downloaded++;
      console.log(`✓ Downloaded: ${filename}\n`);

    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
      stats.errors++;
    }
  }

  console.log('\n=== Download Complete ===');
  console.log(`Total with images: ${stats.total}`);
  console.log(`Downloaded: ${stats.downloaded}`);
  console.log(`Skipped (already local): ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
}

downloadProductImages().catch(console.error);
