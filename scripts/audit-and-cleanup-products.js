import { readdir, readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';

/**
 * Audit product catalog and mark/remove low-quality products
 *
 * Issues to address:
 * 1. Duplicate products (same name, different slugs)
 * 2. Outdated year-specific products (2021-2023)
 * 3. Non-Notion products
 */

async function auditAndCleanup() {
  console.log('Starting product catalog audit...\n');

  const productsDir = join(process.cwd(), 'content/products');
  const files = await readdir(productsDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));

  const issues = {
    outdated: [],
    duplicates: [],
    notNotion: [],
    toDelete: [],
    toMark: []
  };

  // First pass: identify all issues
  const productsByName = new Map();

  for (const file of jsonFiles) {
    const filePath = join(productsDir, file);
    const product = JSON.parse(await readFile(filePath, 'utf-8'));
    product._file = file;

    // Track duplicates by name
    if (!productsByName.has(product.name)) {
      productsByName.set(product.name, []);
    }
    productsByName.get(product.name).push(product);

    // Check for outdated years
    if (/(2021|2022|2023)/.test(product.name)) {
      issues.outdated.push(product);
    }

    // Check for non-Notion products (only for templates, not tools)
    if (product.category === 'template') {
      const lowerName = product.name.toLowerCase();
      const lowerDesc = (product.description || '').toLowerCase();
      if (!lowerName.includes('notion') && !lowerDesc.includes('notion')) {
        issues.notNotion.push(product);
      }
    }
  }

  // Identify duplicates - keep the one with best data
  for (const [name, products] of productsByName) {
    if (products.length > 1) {
      // Sort by quality: has rating > has affiliate > has image
      products.sort((a, b) => {
        const scoreA = (a.rating ? 100 : 0) + (a.hasAffiliate ? 50 : 0) + (a.image ? 25 : 0);
        const scoreB = (b.rating ? 100 : 0) + (b.hasAffiliate ? 50 : 0) + (b.image ? 25 : 0);
        return scoreB - scoreA;
      });

      // Keep the best one, mark others for deletion
      const [keep, ...remove] = products;
      issues.duplicates.push({
        name,
        keep: keep.slug,
        remove: remove.map(p => p.slug)
      });

      remove.forEach(p => issues.toDelete.push(p._file));
    }
  }

  // Mark outdated products as inactive instead of deleting
  for (const product of issues.outdated) {
    if (!issues.toDelete.includes(product._file)) {
      issues.toMark.push(product._file);
    }
  }

  // Report findings
  console.log('=== Audit Results ===');
  console.log(`Total products: ${jsonFiles.length}`);
  console.log(`Duplicate sets: ${issues.duplicates.length}`);
  console.log(`Products to delete (duplicates): ${issues.toDelete.length}`);
  console.log(`Outdated year products (2021-2023): ${issues.outdated.length}`);
  console.log(`Possibly non-Notion templates: ${issues.notNotion.length}`);
  console.log();

  // Show examples
  console.log('=== Sample Duplicates ===');
  issues.duplicates.slice(0, 5).forEach(dup => {
    console.log(`"${dup.name}"`);
    console.log(`  Keep: ${dup.keep}`);
    console.log(`  Remove: ${dup.remove.join(', ')}`);
  });
  console.log();

  console.log('=== Outdated Products (to mark inactive) ===');
  issues.outdated.slice(0, 10).forEach(p => {
    console.log(`  ${p.name} (${p.slug})`);
  });
  console.log();

  // Ask for confirmation
  console.log('\n=== Proposed Actions ===');
  console.log(`1. Delete ${issues.toDelete.length} duplicate products`);
  console.log(`2. Mark ${issues.toMark.length} outdated products as inactive`);
  console.log(`3. Keep ${issues.notNotion.length} possibly non-Notion products for manual review`);
  console.log('\nTo execute cleanup, run: node scripts/audit-and-cleanup-products.js --execute');

  return {
    issues,
    stats: {
      total: jsonFiles.length,
      toDelete: issues.toDelete.length,
      toMark: issues.toMark.length,
      remaining: jsonFiles.length - issues.toDelete.length
    }
  };
}

async function executeCleanup() {
  console.log('Executing cleanup...\n');

  const productsDir = join(process.cwd(), 'content/products');
  const { issues } = await auditAndCleanup();

  // Delete duplicate files
  console.log(`\nDeleting ${issues.toDelete.length} duplicate products...`);
  for (const file of issues.toDelete) {
    await unlink(join(productsDir, file));
    console.log(`  ✓ Deleted: ${file}`);
  }

  // Mark outdated products as inactive
  console.log(`\nMarking ${issues.toMark.length} outdated products as inactive...`);
  for (const file of issues.toMark) {
    const filePath = join(productsDir, file);
    const product = JSON.parse(await readFile(filePath, 'utf-8'));
    product.status = 'inactive';
    product.inactiveReason = 'Outdated year-specific product';
    await writeFile(filePath, JSON.stringify(product, null, 2));
    console.log(`  ✓ Marked inactive: ${file}`);
  }

  console.log('\n=== Cleanup Complete ===');
  console.log(`Deleted: ${issues.toDelete.length} duplicates`);
  console.log(`Marked inactive: ${issues.toMark.length} outdated products`);
  console.log(`Active products remaining: ${issues.stats.remaining - issues.toMark.length}`);
}

// Parse command line args
const args = process.argv.slice(2);
const shouldExecute = args.includes('--execute');

if (shouldExecute) {
  executeCleanup().catch(console.error);
} else {
  auditAndCleanup().catch(console.error);
}
