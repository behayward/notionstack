const fs = require('fs');
const path = require('path');

// Read the templates list
const templatesList = JSON.parse(
  fs.readFileSync('/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/templates-to-enhance.json', 'utf8')
);

// Get templates 150-199 (indices 149-198)
const templatesToProcess = templatesList.slice(149, 199);

console.log(`Processing ${templatesToProcess.length} templates (150-199)`);
console.log('\nTemplates to process:');
templatesToProcess.forEach((t, i) => {
  console.log(`${150 + i}. ${t.name} (${t.file})`);
});

// Write to a temporary file for easier processing
fs.writeFileSync(
  '/tmp/batch-150-199.json',
  JSON.stringify(templatesToProcess, null, 2)
);

console.log('\nBatch written to /tmp/batch-150-199.json');
