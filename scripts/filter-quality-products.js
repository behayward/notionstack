// Remove non-English products and products without images from enhanced content
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_DIR = path.join(__dirname, '../content/products');

// Patterns to detect non-English content
const NON_ENGLISH_PATTERNS = [
  /[\u4e00-\u9fff]/,  // Chinese
  /[\u3040-\u309f\u30a0-\u30ff]/,  // Japanese
  /[\uac00-\ud7af]/,  // Korean
  /[\u0400-\u04ff]/,  // Cyrillic
  /español|français|deutsch|português/i,
  /模板|plantilla|vorlage|modelo/i,
  /🇩🇪|🇪🇸|🇫🇷|🇵🇹|🇨🇳|🇯🇵|🇰🇷/
];

function isNonEnglish(text) {
  return NON_ENGLISH_PATTERNS.some(pattern => pattern.test(text));
}

async function main() {
  console.log('🔍 Filtering products for quality...\n');

  const productFiles = await fs.readdir(PRODUCTS_DIR);
  const jsonFiles = productFiles.filter(f => f.endsWith('.json'));

  let removedNonEnglish = 0;
  let removedNoImage = 0;
  let kept = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(PRODUCTS_DIR, file);
    const content = await fs.readFile(filePath, 'utf8');
    const product = JSON.parse(content);

    // Only check products with enhanced content
    if (!product.enhancedContent) {
      continue;
    }

    const name = product.name || '';
    const description = product.description || '';
    const combinedText = `${name} ${description}`;

    let shouldRemoveEnhancement = false;
    let reason = '';

    // Check for non-English
    if (isNonEnglish(combinedText)) {
      shouldRemoveEnhancement = true;
      reason = 'Non-English';
      removedNonEnglish++;
    }
    // Check for missing image
    else if (!product.imageUrl) {
      shouldRemoveEnhancement = true;
      reason = 'No image';
      removedNoImage++;
    }

    if (shouldRemoveEnhancement) {
      console.log(`❌ ${reason}: ${name}`);
      // Remove enhanced content so it won't appear on site
      delete product.enhancedContent;
      product.lastUpdated = new Date().toISOString().split('T')[0];
      await fs.writeFile(filePath, JSON.stringify(product, null, 2));
    } else {
      kept++;
    }
  }

  console.log(`\n✅ Complete!`);
  console.log(`Kept: ${kept}`);
  console.log(`Removed (non-English): ${removedNonEnglish}`);
  console.log(`Removed (no image): ${removedNoImage}`);
  console.log(`Total removed: ${removedNonEnglish + removedNoImage}`);
}

main().catch(console.error);
