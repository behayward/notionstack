import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';

/**
 * Sync enhanced content from consolidated file to individual product files
 * This ensures Astro's getStaticPaths() picks up the enhanced content during build
 */

async function syncEnhancedContent() {
  console.log('Syncing enhanced content to individual product files...\n');

  // Read consolidated data with enhanced content
  const consolidatedPath = join(process.cwd(), 'data/consolidated-products-v2.json');
  const consolidatedData = JSON.parse(await readFile(consolidatedPath, 'utf-8'));

  // Get all individual product files
  const productsDir = join(process.cwd(), 'content/products');
  const files = await readdir(productsDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));

  const stats = {
    total: jsonFiles.length,
    updated: 0,
    skipped: 0,
    errors: 0
  };

  // Process each individual file
  for (const file of jsonFiles) {
    try {
      const filePath = join(productsDir, file);
      const fileContent = await readFile(filePath, 'utf-8');
      const product = JSON.parse(fileContent);

      // Find matching product in consolidated data by slug
      const consolidatedProduct = consolidatedData.find(p => p.slug === product.slug);

      if (!consolidatedProduct) {
        console.log(`⚠ No match in consolidated: ${product.name}`);
        stats.skipped++;
        continue;
      }

      // Check if consolidated has enhancedContent
      if (!consolidatedProduct.enhancedContent) {
        stats.skipped++;
        continue;
      }

      // Update individual file with enhanced content
      product.enhancedContent = consolidatedProduct.enhancedContent;

      // Also update other fields that may have been scraped
      if (consolidatedProduct.rating) product.rating = consolidatedProduct.rating;
      if (consolidatedProduct.ratingCount) product.ratingCount = consolidatedProduct.ratingCount;
      if (consolidatedProduct.image) product.image = consolidatedProduct.image;
      if (consolidatedProduct.salesCount) product.salesCount = consolidatedProduct.salesCount;
      if (consolidatedProduct.rawData) product.rawData = consolidatedProduct.rawData;

      // Write back to individual file
      await writeFile(filePath, JSON.stringify(product, null, 2));

      stats.updated++;
      console.log(`✓ Updated: ${product.name}`);

    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
      stats.errors++;
    }
  }

  console.log('\n=== Sync Complete ===');
  console.log(`Total files: ${stats.total}`);
  console.log(`Updated: ${stats.updated}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
}

syncEnhancedContent().catch(console.error);
