const fs = require('fs');

const templates = JSON.parse(fs.readFileSync('./scripts/templates-to-enhance.json', 'utf8'));
const batch = templates.slice(49, 99); // indices 49-98 = items 50-99

console.log(`Total templates in batch: ${batch.length}\n`);

batch.forEach((t, idx) => {
    console.log(`${idx + 50}. ${t.file}`);
});
