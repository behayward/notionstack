const fs = require('fs');
const path = require('path');

// Load the templates to enhance
const templatesQueue = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'templates-to-enhance.json'), 'utf8')
);

// Get batch 350-399 (50 templates)
const batch = templatesQueue.slice(350, 400);
const productDir = path.join(__dirname, '../content/products');

console.log('Templates needing enhancement in batch 350-399:\n');

let needsEnhancement = [];
let alreadyEnhanced = [];
let errors = [];

batch.forEach((template, index) => {
  const globalIndex = 350 + index;
  const slug = template.slug;

  if (!slug) {
    errors.push({ index: globalIndex, slug: 'UNKNOWN', error: 'Missing slug' });
    return;
  }

  const productPath = path.join(productDir, `${slug}.json`);

  if (!fs.existsSync(productPath)) {
    errors.push({ index: globalIndex, slug, error: 'File not found' });
    return;
  }

  try {
    const product = JSON.parse(fs.readFileSync(productPath, 'utf8'));

    if (product.enhancedContent && Object.keys(product.enhancedContent).length > 0) {
      alreadyEnhanced.push({ index: globalIndex, slug, name: product.name });
    } else {
      needsEnhancement.push({
        index: globalIndex,
        slug,
        name: product.name,
        subcategory: product.subcategory,
        description: product.description?.substring(0, 100) + '...'
      });
      console.log(`[${globalIndex}] ${slug}`);
      console.log(`    Name: ${product.name}`);
      console.log(`    Category: ${product.subcategory}`);
      console.log('');
    }
  } catch (error) {
    errors.push({ index: globalIndex, slug, error: error.message });
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total in batch: ${batch.length}`);
console.log(`Need enhancement: ${needsEnhancement.length}`);
console.log(`Already enhanced: ${alreadyEnhanced.length}`);
console.log(`Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('\n=== ERRORS ===');
  errors.forEach(e => {
    console.log(`[${e.index}] ${e.slug}: ${e.error}`);
  });
}

// Save the list of templates needing enhancement
fs.writeFileSync(
  path.join(__dirname, 'batch-350-399-to-enhance.json'),
  JSON.stringify(needsEnhancement, null, 2)
);

console.log(`\nSaved ${needsEnhancement.length} templates to batch-350-399-to-enhance.json`);
