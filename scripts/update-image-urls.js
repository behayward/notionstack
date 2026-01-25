// Update product JSON files with imageUrl paths
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_DIR = path.join(__dirname, '../content/products');
const IMAGES_DIR = path.join(__dirname, '../public/images/products');

async function main() {
  console.log('🔄 Updating product JSON files with image URLs...\n');

  // Get list of image files
  const imageFiles = await fs.readdir(IMAGES_DIR);
  const imageMap = new Map();

  imageFiles.forEach(file => {
    const slug = file.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    const ext = file.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[1];
    if (ext) {
      imageMap.set(slug, ext);
    }
  });

  console.log(`Found ${imageMap.size} images\n`);

  // Update product files
  const productFiles = await fs.readdir(PRODUCTS_DIR);
  const jsonFiles = productFiles.filter(f => f.endsWith('.json'));

  let updatedCount = 0;
  let skippedCount = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(PRODUCTS_DIR, file);
    const content = await fs.readFile(filePath, 'utf8');
    const product = JSON.parse(content);

    // Only update products with enhanced content
    if (!product.enhancedContent) {
      continue;
    }

    const slug = product.slug;
    const imageExt = imageMap.get(slug);

    if (imageExt) {
      // Update the imageUrl field
      product.imageUrl = `/images/products/${slug}.${imageExt}`;
      product.lastUpdated = new Date().toISOString().split('T')[0];

      await fs.writeFile(filePath, JSON.stringify(product, null, 2));
      console.log(`✓ Updated: ${slug}`);
      updatedCount++;
    } else {
      console.log(`⚠️  No image: ${slug}`);
      skippedCount++;
    }
  }

  console.log(`\n✅ Complete!`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`No image: ${skippedCount}`);
}

main().catch(console.error);
