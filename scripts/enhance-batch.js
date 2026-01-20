#!/usr/bin/env node

/**
 * Enhanced Content Generator for Notion Templates
 *
 * This script reads templates needing enhancement and generates
 * a prompt file that can be processed by Claude Code to generate
 * enhanced content for each template.
 *
 * Usage: node scripts/enhance-batch.js <start> <end>
 * Example: node scripts/enhance-batch.js 0 10
 */

import fs from 'fs';
import path from 'path';

const templatesFile = path.join(process.cwd(), 'scripts/templates-to-enhance.json');
const templates = JSON.parse(fs.readFileSync(templatesFile, 'utf-8'));

// Get batch range from command line args
const startIdx = parseInt(process.argv[2]) || 0;
const endIdx = parseInt(process.argv[3]) || Math.min(startIdx + 10, templates.length);

const batch = templates.slice(startIdx, endIdx);

console.log(`\nPreparing batch ${startIdx + 1} to ${endIdx}...`);
console.log(`Total templates in batch: ${batch.length}\n`);

// Create output directory
const outputDir = path.join(process.cwd(), 'scripts/enhancement-batches');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate batch file
const batchData = {
  startIdx,
  endIdx,
  totalCount: batch.length,
  createdAt: new Date().toISOString(),
  templates: batch.map(t => ({
    file: t.file,
    name: t.name,
    slug: t.slug,
    price: t.price,
    subcategory: t.subcategory,
    description: t.description,
    score: t.score
  }))
};

const batchFile = path.join(outputDir, `batch-${startIdx}-${endIdx}.json`);
fs.writeFileSync(batchFile, JSON.stringify(batchData, null, 2));

console.log(`✓ Batch file created: ${batchFile}`);
console.log(`\nTemplates in this batch:`);
batch.forEach((t, i) => {
  console.log(`  ${i + 1}. ${t.name}`);
});

console.log(`\n✓ Ready for enhancement processing`);
