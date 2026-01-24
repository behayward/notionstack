const fs = require('fs');
const path = require('path');

// Load templates queue
const templatesQueue = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'templates-to-enhance.json'), 'utf8')
);

// Get batch 350-399
const batch = templatesQueue.slice(350, 400);
const productDir = path.join(__dirname, '../content/products');

let enhanced = 0;
let skipped = 0;
let errors = [];

// Process each template
batch.forEach((template, index) => {
  const globalIndex = 350 + index;
  const slug = template.slug;

  if (!slug) {
    console.log(`[${globalIndex}] SKIP: Missing slug`);
    errors.push({ index: globalIndex, error: 'Missing slug' });
    return;
  }

  const productPath = path.join(productDir, `${slug}.json`);

  if (!fs.existsSync(productPath)) {
    console.log(`[${globalIndex}] SKIP: File not found - ${slug}`);
    errors.push({ index: globalIndex, slug, error: 'File not found' });
    return;
  }

  try {
    const product = JSON.parse(fs.readFileSync(productPath, 'utf8'));

    // Check if already enhanced
    if (product.enhancedContent && Object.keys(product.enhancedContent).length > 0) {
      console.log(`[${globalIndex}] SKIP: Already enhanced - ${slug}`);
      skipped++;
      return;
    }

    // Generate enhancedContent here
    console.log(`[${globalIndex}] ENHANCING: ${slug} - "${product.name}"`);

    // For now, just mark that it needs enhancement
    // The actual enhancement will happen through manual processing
    enhanced++;

  } catch (error) {
    console.log(`[${globalIndex}] ERROR: ${slug} - ${error.message}`);
    errors.push({ index: globalIndex, slug, error: error.message });
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total in batch: ${batch.length}`);
console.log(`Enhanced: ${enhanced}`);
console.log(`Already had enhancedContent: ${skipped}`);
console.log(`Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log(`\n=== ERRORS ===`);
  errors.forEach(e => console.log(`[${e.index}] ${e.slug || 'UNKNOWN'}: ${e.error}`));
}
