const fs = require('fs');

const templates = JSON.parse(fs.readFileSync('./templates-to-enhance.json', 'utf8'));
const batch = templates.slice(49, 99);

console.log(JSON.stringify(batch, null, 2));
