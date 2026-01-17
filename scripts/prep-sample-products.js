import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Prep first 10 products with rawData for testing
 * Uses existing description/features as rawData
 */

async function prepSampleProducts() {
  console.log('Preparing sample products for AI enhancement...\n');

  const consolidatedPath = join(process.cwd(), 'data/consolidated-products-v2.json');
  const products = JSON.parse(await readFile(consolidatedPath, 'utf-8'));

  let prepped = 0;

  for (const product of products) {
    if (prepped >= 10) break;

    // Skip if already has rawData or enhancedContent
    if (product.rawData || product.enhancedContent) continue;

    // Add rawData using existing description and features
    product.rawData = {
      description: product.description || '',
      features: product.features ? product.features.split(';').map(f => f.trim()).filter(f => f.length > 0) : [],
      reviewQuotes: []
    };

    prepped++;
    console.log(`✓ Prepped: ${product.name}`);
  }

  // Save
  await writeFile(consolidatedPath, JSON.stringify(products, null, 2));

  console.log(`\n✓ Prepared ${prepped} products for enhancement`);
  return prepped;
}

prepSampleProducts().catch(console.error);
