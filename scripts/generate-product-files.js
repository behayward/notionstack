import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load consolidated products
const consolidatedPath = path.join(__dirname, '../data/consolidated-products-v2.json');
const products = JSON.parse(fs.readFileSync(consolidatedPath, 'utf-8'));

const productsDir = path.join(__dirname, '../content/products');

// Ensure products directory exists and is empty
console.log('🧹 Clearing existing products directory...');
if (fs.existsSync(productsDir)) {
  const files = fs.readdirSync(productsDir);
  for (const file of files) {
    if (file.endsWith('.json')) {
      fs.unlinkSync(path.join(productsDir, file));
    }
  }
} else {
  fs.mkdirSync(productsDir, { recursive: true });
}
console.log('   ✓ Directory ready\n');

// Download image from URL
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(filepath, () => {}); // Delete the file
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filepath, () => {}); // Delete the file
      resolve(false);
    });
  });
}

// Try to fetch product image from Gumroad
async function fetchProductImage(productUrl, slug) {
  // For now, we'll skip image downloading since it requires scraping
  // We'll add placeholder logic for cover images
  return null;
}

// Generate JSON files
console.log('📝 Generating product JSON files...');
let successCount = 0;
let errorCount = 0;

for (const product of products) {
  try {
    // Ensure unique slug
    let slug = product.slug;
    let counter = 1;
    let filename = `${slug}.json`;

    while (fs.existsSync(path.join(productsDir, filename))) {
      slug = `${product.slug}-${counter}`;
      filename = `${slug}.json`;
      counter++;
    }

    // Create product JSON with all required fields
    const productData = {
      id: product.id || product.name,
      name: product.name,
      slug: slug,
      description: product.description || '',
      price: product.price || 0,
      currency: product.currency || 'USD',
      category: product.category || 'template',
      subcategory: product.subcategory || '',
      creator: {
        name: product.creator?.name || 'Unknown',
        url: product.creator?.url || ''
      },
      platform: product.platform || 'gumroad',
      productUrl: product.productUrl || '',
      affiliateUrl: product.affiliateUrl || product.productUrl || '',
      hasAffiliate: product.hasAffiliate || true,
      affiliateRate: product.affiliateRate || 10,
      rating: product.rating || null,
      ratingCount: product.ratingCount || null,
      salesCount: product.salesCount || null,
      tags: product.tags || [],
      useCases: product.useCases || [],
      features: product.features || '',
      assessmentScore: product.assessmentScore || 0,
      recommendation: product.recommendation || '',
      status: product.status || 'active',
      dateAdded: product.dateAdded || new Date().toISOString(),
      lastUpdated: product.lastUpdated || new Date().toISOString()
    };

    // Write JSON file
    const filepath = path.join(productsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(productData, null, 2));

    successCount++;

    // Log progress every 100 products
    if (successCount % 100 === 0) {
      console.log(`   ✓ Generated ${successCount}/${products.length} products...`);
    }

  } catch (error) {
    errorCount++;
    console.error(`   ✗ Error generating ${product.name}: ${error.message}`);
  }
}

console.log(`\n✅ Generated ${successCount} product JSON files`);
if (errorCount > 0) {
  console.log(`⚠️  ${errorCount} products had errors\n`);
}

// Generate summary report
const summary = {
  totalProducts: products.length,
  filesGenerated: successCount,
  errors: errorCount,
  byCategory: {},
  bySubcategory: {},
  byRecommendation: {},
  priceDistribution: {
    free: 0,
    under10: 0,
    under50: 0,
    under100: 0,
    over100: 0
  }
};

// Analyze products
for (const product of products) {
  // By category
  summary.byCategory[product.category] = (summary.byCategory[product.category] || 0) + 1;

  // By subcategory
  summary.bySubcategory[product.subcategory] = (summary.bySubcategory[product.subcategory] || 0) + 1;

  // By recommendation
  summary.byRecommendation[product.recommendation] = (summary.byRecommendation[product.recommendation] || 0) + 1;

  // By price
  if (product.price === 0) {
    summary.priceDistribution.free++;
  } else if (product.price < 10) {
    summary.priceDistribution.under10++;
  } else if (product.price < 50) {
    summary.priceDistribution.under50++;
  } else if (product.price < 100) {
    summary.priceDistribution.under100++;
  } else {
    summary.priceDistribution.over100++;
  }
}

const summaryPath = path.join(__dirname, '../data/product-generation-summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
console.log(`📊 Summary saved to: ${summaryPath}\n`);

console.log('📈 Product Catalog Summary:');
console.log(`   Total Products: ${summary.totalProducts}`);
console.log(`\n   By Type:`);
Object.entries(summary.byCategory)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    console.log(`      ${cat}: ${count}`);
  });

console.log(`\n   By Recommendation:`);
Object.entries(summary.byRecommendation)
  .sort((a, b) => b[1] - a[1])
  .forEach(([rec, count]) => {
    console.log(`      ${rec}: ${count}`);
  });

console.log(`\n   By Price:`);
console.log(`      Free: ${summary.priceDistribution.free}`);
console.log(`      $0.01-$9.99: ${summary.priceDistribution.under10}`);
console.log(`      $10-$49: ${summary.priceDistribution.under50}`);
console.log(`      $50-$99: ${summary.priceDistribution.under100}`);
console.log(`      $100+: ${summary.priceDistribution.over100}`);

console.log(`\n   Top 10 Subcategories:`);
Object.entries(summary.bySubcategory)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([subcat, count]) => {
    console.log(`      ${subcat}: ${count}`);
  });

console.log('\n🎉 Product generation complete!');
