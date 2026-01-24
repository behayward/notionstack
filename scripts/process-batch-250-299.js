const fs = require('fs');
const path = require('path');

// Read the templates to enhance list
const templatesFile = path.join(__dirname, 'templates-to-enhance.json');
const templates = JSON.parse(fs.readFileSync(templatesFile, 'utf8'));

// Get templates 250-299 (indices 250-299)
const batch = templates.slice(250, 300);

const productsDir = path.join(__dirname, '../content/products');

let needEnhancement = [];
let alreadyEnhanced = [];
let missing = [];

// Check each template
batch.forEach(template => {
  const filePath = path.join(productsDir, template.file);

  if (!fs.existsSync(filePath)) {
    missing.push(template.file);
    return;
  }

  const product = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (product.enhancedContent) {
    alreadyEnhanced.push(template.file);
  } else {
    needEnhancement.push({
      file: template.file,
      name: template.name,
      slug: template.slug,
      description: template.description,
      subcategory: template.subcategory,
      price: template.price
    });
  }
});

console.log('\n=== BATCH 250-299 STATUS ===');
console.log(`Total in batch: ${batch.length}`);
console.log(`Already enhanced: ${alreadyEnhanced.length}`);
console.log(`Need enhancement: ${needEnhancement.length}`);
console.log(`Missing files: ${missing.length}`);

if (needEnhancement.length > 0) {
  // Save the list of templates that need enhancement
  const outputFile = path.join(__dirname, 'batch-250-299-needs-enhancement.json');
  fs.writeFileSync(outputFile, JSON.stringify(needEnhancement, null, 2));
  console.log(`\nTemplates needing enhancement saved to: ${outputFile}`);
}

if (missing.length > 0) {
  console.log('\nMissing files:');
  missing.forEach(f => console.log(`  - ${f}`));
}
