// Generate list of enhanced products needing images
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsDir = path.join(__dirname, '../content/products');
const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.json'));

const enhancedProducts = [];

for (const file of files) {
  const filePath = path.join(productsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  try {
    const product = JSON.parse(content);

    // Only include products with enhanced content
    if (product.enhancedContent) {
      enhancedProducts.push({
        slug: product.slug,
        url: product.productUrl || product.affiliateUrl,
        name: product.name,
        file: file,
        platform: product.platform
      });
    }
  } catch (err) {
    console.error(`Error parsing ${file}:`, err.message);
  }
}

console.log(`Found ${enhancedProducts.length} enhanced products`);

// Save to file
fs.writeFileSync(
  path.join(__dirname, 'enhanced-products-for-images.json'),
  JSON.stringify(enhancedProducts, null, 2)
);

console.log('Saved to scripts/enhanced-products-for-images.json');
