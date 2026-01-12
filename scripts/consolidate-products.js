import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CSV file
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Normalize URL for matching
function normalizeURL(url) {
  if (!url) return '';
  // Remove protocol, www, trailing slashes, query params for matching
  return url
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '')
    .split('?')[0]
    .split('#')[0];
}

// Extract creator identifier from URL
function getCreatorFromURL(url) {
  if (!url) return '';
  const match = url.match(/gumroad\.com\/a\/\d+\/([^/?]+)/i) || url.match(/([^/]+)\.gumroad\.com/i);
  return match ? match[1].toLowerCase() : '';
}

// Normalize product name for matching
function normalizeProductName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract affiliate commission rate from Gumroad data
function getAffiliateRate(creatorAffiliatesUrl) {
  // If there's an affiliates URL, it likely has a partner program
  // Otherwise, default 10% for non-partner referrals
  return creatorAffiliatesUrl ? 'partner' : 10;
}

// Construct affiliate URL
function constructAffiliateURL(productUrl, hasPartnerProgram) {
  if (!productUrl) return '';

  // If it's already an affiliate link, return as is
  if (productUrl.includes('gumroad.com/a/962870099')) {
    return productUrl;
  }

  // For non-partner products (10% commission), append tracking parameter
  if (!hasPartnerProgram) {
    const separator = productUrl.includes('?') ? '&' : '?';
    return `${productUrl}${separator}a=962870099`;
  }

  // For partner products, use the existing affiliate URL structure
  return productUrl;
}

// Match NotionStack product to Gumroad product
function findMatch(nsProduct, gumroadProducts) {
  const nsBuyLink = normalizeURL(nsProduct.BuyLink);
  const nsCreator = nsProduct.Creator?.toLowerCase().trim();
  const nsProductName = normalizeProductName(nsProduct['Product Name'] || nsProduct.Template);

  // Try URL match first (most reliable)
  if (nsBuyLink) {
    for (const gp of gumroadProducts) {
      const gpUrl = normalizeURL(gp.url);
      if (gpUrl && nsBuyLink.includes(gpUrl.split('/').pop())) {
        return gp;
      }
    }
  }

  // Try creator + product name match
  if (nsCreator && nsProductName) {
    for (const gp of gumroadProducts) {
      const gpCreator = gp.creator_name?.toLowerCase().trim();
      const gpProductName = normalizeProductName(gp.original_name);

      if (gpCreator && gpCreator.includes(nsCreator) || nsCreator.includes(gpCreator)) {
        // Check if product names are similar
        const similarity = calculateSimilarity(nsProductName, gpProductName);
        if (similarity > 0.6) {
          return gp;
        }
      }
    }
  }

  return null;
}

// Simple string similarity calculation
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Main consolidation function
async function consolidateProducts() {
  console.log('🚀 Starting product catalog consolidation...\n');

  // Parse both CSV files
  console.log('📖 Reading CSV files...');
  const gumroadRaw = await parseCSV(path.join(__dirname, '../gumroad-analysis-complete.csv'));
  const notionstackRaw = await parseCSV(path.join(__dirname, '../notionstack temlates notion dump.csv'));

  console.log(`   ✓ Gumroad: ${gumroadRaw.length.toLocaleString()} products`);
  console.log(`   ✓ NotionStack: ${notionstackRaw.length.toLocaleString()} products\n`);

  // Filter Gumroad to only RECOMMENDED or HIGHLY RECOMMENDED
  console.log('🔍 Filtering Gumroad products...');
  const gumroadFiltered = gumroadRaw.filter(p =>
    p.recommendation === 'RECOMMENDED' || p.recommendation === 'HIGHLY RECOMMENDED'
  );
  console.log(`   ✓ Filtered to ${gumroadFiltered.length.toLocaleString()} recommended products\n`);

  // Consolidation tracking
  const consolidated = [];
  const matches = [];
  const newProducts = [];
  const stats = {
    totalNotionStack: notionstackRaw.length,
    totalGumroad: gumroadRaw.length,
    gumroadRecommended: gumroadFiltered.length,
    matched: 0,
    newFromGumroad: 0,
    duplicates: 0,
    highlyRecommended: 0,
    recommended: 0,
    hasAffiliate: 0,
    freeProducts: 0,
    paidProducts: 0
  };

  // Process NotionStack products - match with Gumroad
  console.log('🔗 Matching NotionStack products with Gumroad data...');
  for (const nsProduct of notionstackRaw) {
    const match = findMatch(nsProduct, gumroadFiltered);

    if (match) {
      stats.matched++;

      // Merge with priority to Gumroad data
      const hasPartnerProgram = !!match.creator_affiliates_url;
      const affiliateRate = getAffiliateRate(match.creator_affiliates_url);

      const mergedProduct = {
        // Identity (from NotionStack, but updated with Gumroad if different)
        id: nsProduct.Template || nsProduct['Product Name'],
        name: match.original_name || nsProduct.Template || nsProduct['Product Name'],
        slug: (nsProduct['NotionStack page'] || '').split('/').pop() || '',

        // Content (from Gumroad - more current)
        description: match.description || nsProduct.Description || nsProduct.Desc || '',
        features: match.features || '',
        assessmentScore: parseFloat(match.assessment_score) || 0,

        // Pricing (from Gumroad)
        price: parseFloat(match.price) || 0,
        currency: 'USD',

        // Quality metrics (from Gumroad)
        rating: parseFloat(match.star_rating) || null,
        ratingCount: parseInt(match.rating_count) || null,
        salesCount: parseInt(match.sale_count) || null,

        // Creator (from Gumroad)
        creator: {
          name: match.creator_name || nsProduct.Creator || '',
          url: match.creator_url || nsProduct['Creator profile page'] || ''
        },

        // Platform & URLs
        platform: 'gumroad',
        productUrl: match.url?.replace('gumroad.com/a/962870099/', '') || nsProduct.BuyLink || '',
        affiliateUrl: match.url || constructAffiliateURL(nsProduct.BuyLink, hasPartnerProgram),

        // Category (from NotionStack)
        category: nsProduct.Category?.toLowerCase().replace(/\s+\(.*\)/, '') || 'template',
        subcategory: '',

        // Tags (from NotionStack)
        tags: nsProduct.Tags ? nsProduct.Tags.split(',').map(t => t.trim()) : [],

        // Affiliate info
        hasAffiliate: true,
        affiliateRate: affiliateRate,

        // Recommendation
        recommendation: match.recommendation,

        // Status
        status: 'active',
        dateAdded: nsProduct['Created time'] || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),

        // Source tracking
        source: 'notionstack_matched'
      };

      consolidated.push(mergedProduct);
      matches.push({
        notionstack: nsProduct.Template || nsProduct['Product Name'],
        gumroad: match.original_name
      });

      if (match.recommendation === 'HIGHLY RECOMMENDED') stats.highlyRecommended++;
      if (match.recommendation === 'RECOMMENDED') stats.recommended++;
      if (mergedProduct.price === 0) stats.freeProducts++;
      if (mergedProduct.price > 0) stats.paidProducts++;
      stats.hasAffiliate++;
    } else {
      // No match found - include NotionStack product as-is if it seems valid
      if (nsProduct.BuyLink && nsProduct.BuyLink.includes('gumroad')) {
        const mergedProduct = {
          id: nsProduct.Template || nsProduct['Product Name'],
          name: nsProduct.Template || nsProduct['Product Name'],
          slug: (nsProduct['NotionStack page'] || '').split('/').pop() || '',
          description: nsProduct.Description || nsProduct.Desc || '',
          features: '',
          assessmentScore: 0,
          price: parseFloat(nsProduct.Price?.replace('$', '')) || 0,
          currency: 'USD',
          rating: parseFloat(nsProduct.Stars) || null,
          ratingCount: parseInt(nsProduct.Reviews) || null,
          salesCount: parseInt(nsProduct.Sales) || null,
          creator: {
            name: nsProduct.Creator || '',
            url: nsProduct['Creator profile page'] || ''
          },
          platform: 'gumroad',
          productUrl: nsProduct.BuyLink || '',
          affiliateUrl: nsProduct.AffLink || constructAffiliateURL(nsProduct.BuyLink, false),
          category: nsProduct.Category?.toLowerCase().replace(/\s+\(.*\)/, '') || 'template',
          subcategory: '',
          tags: nsProduct.Tags ? nsProduct.Tags.split(',').map(t => t.trim()) : [],
          hasAffiliate: !!nsProduct.AffLink,
          affiliateRate: nsProduct['Affiliate Rate'] || 10,
          recommendation: 'UNKNOWN',
          status: 'review_needed',
          dateAdded: nsProduct['Created time'] || new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          source: 'notionstack_unmatched'
        };

        consolidated.push(mergedProduct);
      }
    }
  }

  console.log(`   ✓ Matched ${stats.matched} products\n`);

  // Add new products from Gumroad that weren't in NotionStack
  console.log('➕ Adding new products from Gumroad...');
  for (const gp of gumroadFiltered) {
    // Check if already in consolidated
    const gpUrl = normalizeURL(gp.url);
    const alreadyExists = consolidated.some(p => {
      const pUrl = normalizeURL(p.productUrl);
      return gpUrl && pUrl && (gpUrl.includes(pUrl) || pUrl.includes(gpUrl));
    });

    if (!alreadyExists) {
      const hasPartnerProgram = !!gp.creator_affiliates_url;
      const affiliateRate = getAffiliateRate(gp.creator_affiliates_url);

      const newProduct = {
        id: gp.original_name,
        name: gp.original_name,
        slug: gp.original_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: gp.description || '',
        features: gp.features || '',
        assessmentScore: parseFloat(gp.assessment_score) || 0,
        price: parseFloat(gp.price) || 0,
        currency: 'USD',
        rating: parseFloat(gp.star_rating) || null,
        ratingCount: parseInt(gp.rating_count) || null,
        salesCount: parseInt(gp.sale_count) || null,
        creator: {
          name: gp.creator_name || '',
          url: gp.creator_url || ''
        },
        platform: 'gumroad',
        productUrl: gp.url?.replace('gumroad.com/a/962870099/', '') || '',
        affiliateUrl: gp.url || '',
        category: 'template', // Default, needs manual categorization
        subcategory: '',
        tags: [],
        hasAffiliate: true,
        affiliateRate: affiliateRate,
        recommendation: gp.recommendation,
        status: 'needs_categorization',
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        source: 'gumroad_new'
      };

      consolidated.push(newProduct);
      newProducts.push(newProduct);
      stats.newFromGumroad++;

      if (gp.recommendation === 'HIGHLY RECOMMENDED') stats.highlyRecommended++;
      if (gp.recommendation === 'RECOMMENDED') stats.recommended++;
      if (newProduct.price === 0) stats.freeProducts++;
      if (newProduct.price > 0) stats.paidProducts++;
      stats.hasAffiliate++;
    }
  }

  console.log(`   ✓ Added ${stats.newFromGumroad} new products\n`);

  // Sort consolidated list by priority score
  console.log('📊 Sorting by revenue priority...');
  consolidated.sort((a, b) => {
    const scoreA =
      (a.hasAffiliate ? 100 : 0) +
      (a.price > 0 ? 50 : 0) +
      (a.salesCount ? a.salesCount * 0.5 : 0) +
      (a.rating && a.ratingCount >= 3 && a.rating >= 4.0 ? a.rating * 10 : 0) +
      (a.affiliateRate === 'partner' ? 50 : 0) +
      (typeof a.affiliateRate === 'number' ? a.affiliateRate : 0);

    const scoreB =
      (b.hasAffiliate ? 100 : 0) +
      (b.price > 0 ? 50 : 0) +
      (b.salesCount ? b.salesCount * 0.5 : 0) +
      (b.rating && b.ratingCount >= 3 && b.rating >= 4.0 ? b.rating * 10 : 0) +
      (b.affiliateRate === 'partner' ? 50 : 0) +
      (typeof b.affiliateRate === 'number' ? b.affiliateRate : 0);

    return scoreB - scoreA;
  });
  console.log(`   ✓ Sorted ${consolidated.length.toLocaleString()} products by priority\n`);

  // Generate report
  console.log('📝 Generating consolidation report...\n');

  const report = `# NotionStack Product Catalog Consolidation Report
Generated: ${new Date().toISOString()}

## Summary Statistics

### Data Sources
- **NotionStack Database**: ${stats.totalNotionStack.toLocaleString()} products
- **Gumroad Database**: ${stats.totalGumroad.toLocaleString()} products
- **Gumroad Recommended**: ${stats.gumroadRecommended.toLocaleString()} products (filtered)

### Consolidation Results
- **Total Consolidated Products**: ${consolidated.length.toLocaleString()}
- **Matched Products**: ${stats.matched.toLocaleString()} (NotionStack products found in Gumroad)
- **New Products from Gumroad**: ${stats.newFromGumroad.toLocaleString()}

### Quality Distribution
- **Highly Recommended**: ${stats.highlyRecommended.toLocaleString()} products
- **Recommended**: ${stats.recommended.toLocaleString()} products

### Revenue Potential
- **Products with Affiliate Links**: ${stats.hasAffiliate.toLocaleString()} (${((stats.hasAffiliate/consolidated.length)*100).toFixed(1)}%)
- **Paid Products**: ${stats.paidProducts.toLocaleString()} (${((stats.paidProducts/consolidated.length)*100).toFixed(1)}%)
- **Free Products**: ${stats.freeProducts.toLocaleString()} (${((stats.freeProducts/consolidated.length)*100).toFixed(1)}%)

## Top 20 Products (by revenue priority)

${consolidated.slice(0, 20).map((p, i) => `${i + 1}. **${p.name}** by ${p.creator.name}
   - Price: $${p.price} | Rating: ${p.rating || 'N/A'} (${p.ratingCount || 0} reviews) | Sales: ${p.salesCount || 'N/A'}
   - Recommendation: ${p.recommendation}
   - Affiliate: ${p.affiliateRate === 'partner' ? 'Partner Program' : p.affiliateRate + '%'}
   - Source: ${p.source}`).join('\n\n')}

## Sample Matched Products (first 10)

${matches.slice(0, 10).map((m, i) => `${i + 1}. NotionStack: "${m.notionstack}"
   → Gumroad: "${m.gumroad}"`).join('\n\n')}

## Sample New Products (first 10)

${newProducts.slice(0, 10).map((p, i) => `${i + 1}. **${p.name}** by ${p.creator.name}
   - Price: $${p.price} | Rating: ${p.rating || 'N/A'} | Recommendation: ${p.recommendation}
   - Needs categorization`).join('\n\n')}

## Next Steps

1. **Review categorization** for ${stats.newFromGumroad} new products (currently all set to "template")
2. **Validate affiliate URLs** for all ${consolidated.length.toLocaleString()} products
3. **Generate product JSON files** for /content/products/ directory
4. **Create product visuals** (cover images, og:image)
5. **Build site** and test

## Data Quality Notes

- All Gumroad data is prioritized over NotionStack for: ratings, pricing, descriptions, features
- Affiliate URLs constructed for non-partner products (10% commission) with ?a=962870099
- Partner products identified by presence of creator_affiliates_url
- Products requiring manual review: ${consolidated.filter(p => p.status === 'review_needed' || p.status === 'needs_categorization').length}
`;

  // Save report
  const reportPath = path.join(__dirname, '../data/consolidation-report.md');
  fs.writeFileSync(reportPath, report);
  console.log(`✅ Report saved to: ${reportPath}\n`);

  // Save consolidated data as JSON
  const dataPath = path.join(__dirname, '../data/consolidated-products.json');
  fs.writeFileSync(dataPath, JSON.stringify(consolidated, null, 2));
  console.log(`✅ Consolidated data saved to: ${dataPath}\n`);

  // Save CSV for review
  const csvPath = path.join(__dirname, '../data/consolidated-products.csv');
  const csvHeader = 'name,creator,price,rating,ratingCount,salesCount,recommendation,affiliateRate,category,source,productUrl\n';
  const csvRows = consolidated.map(p =>
    `"${p.name}","${p.creator.name}",${p.price},${p.rating || ''},${p.ratingCount || ''},${p.salesCount || ''},"${p.recommendation}","${p.affiliateRate}","${p.category}","${p.source}","${p.productUrl}"`
  ).join('\n');
  fs.writeFileSync(csvPath, csvHeader + csvRows);
  console.log(`✅ CSV saved to: ${csvPath}\n`);

  console.log('🎉 Consolidation complete!\n');
  console.log(report);
}

// Run consolidation
consolidateProducts().catch(console.error);
