const fs = require('fs');
const path = require('path');

// Load the templates to enhance
const templatesQueue = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'templates-to-enhance.json'), 'utf8')
);

// Get batch 350-399 (50 templates)
const batch = templatesQueue.slice(350, 400);

console.log(`Processing batch 350-399: ${batch.length} templates`);

let enhanced = 0;
let skipped = 0;
let errors = 0;

const productDir = path.join(__dirname, '../content/products');

// Check each template
batch.forEach((template, index) => {
  const globalIndex = 350 + index;
  const slug = template.slug;

  if (!slug) {
    console.log(`[${globalIndex}] ERROR: Missing slug`);
    errors++;
    return;
  }

  const productPath = path.join(productDir, `${slug}.json`);

  if (!fs.existsSync(productPath)) {
    console.log(`[${globalIndex}] SKIP: File not found - ${slug}`);
    skipped++;
    return;
  }

  try {
    const product = JSON.parse(fs.readFileSync(productPath, 'utf8'));

    if (product.enhancedContent && Object.keys(product.enhancedContent).length > 0) {
      console.log(`[${globalIndex}] SKIP: Already enhanced - ${slug}`);
      skipped++;
    } else {
      console.log(`[${globalIndex}] NEEDS ENHANCEMENT: ${slug} - "${product.name}"`);
      enhanced++;
    }
  } catch (error) {
    console.log(`[${globalIndex}] ERROR: ${slug} - ${error.message}`);
    errors++;
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total in batch: ${batch.length}`);
console.log(`Need enhancement: ${enhanced}`);
console.log(`Already enhanced: ${skipped}`);
console.log(`Errors: ${errors}`);
