#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const productsDir = path.join(process.cwd(), 'content/products');

// Read all products
const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.json'));

const templates = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(productsDir, file), 'utf-8');
  const product = JSON.parse(content);

  // Only templates that are active and don't have enhanced content
  if (product.category === 'template' &&
      product.status !== 'inactive' &&
      !product.enhancedContent) {

    // Calculate priority score (same as website sorting)
    const score =
      (product.hasAffiliate ? 100 : 0) +
      (product.price > 0 ? 50 : 0) +
      (product.salesCount ? product.salesCount * 0.5 : 0) +
      (product.rating && product.ratingCount >= 3 && product.rating >= 4.0 ? product.rating * 10 : 0);

    templates.push({
      file,
      name: product.name,
      slug: product.slug,
      score,
      price: product.price,
      hasAffiliate: product.hasAffiliate,
      rating: product.rating || 0,
      ratingCount: product.ratingCount || 0,
      salesCount: product.salesCount || 0,
      subcategory: product.subcategory,
      description: product.description
    });
  }
}

// Sort by priority score
templates.sort((a, b) => b.score - a.score);

// Take next 500
const next500 = templates.slice(0, 500);

// Save to file
fs.writeFileSync(
  path.join(process.cwd(), 'scripts/templates-to-enhance.json'),
  JSON.stringify(next500, null, 2)
);

console.log(`Found ${templates.length} templates without enhanced content`);
console.log(`Selected top 500 by priority score`);
console.log(`\nTop 10:`);
next500.slice(0, 10).forEach((t, i) => {
  console.log(`${i + 1}. ${t.name} (score: ${t.score}, $${t.price})`);
});

console.log(`\nSaved to scripts/templates-to-enhance.json`);
