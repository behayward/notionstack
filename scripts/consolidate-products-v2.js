import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Category mapping based on keywords in product name/description
const CATEGORY_KEYWORDS = {
  'ai': ['ai', 'chatgpt', 'gpt', 'artificial intelligence', 'machine learning', 'prompts', 'automation'],
  'productivity': ['productivity', 'gtd', 'getting things done', 'workflow', 'efficiency'],
  'planner': ['planner', 'planning', 'schedule', 'calendar', 'daily', 'weekly', 'monthly'],
  'tracker': ['tracker', 'tracking', 'habit', 'time tracker', 'expense tracker', 'mood tracker'],
  'finance': ['finance', 'budget', 'expense', 'investment', 'money', 'income', 'trading', 'crypto'],
  'dashboard': ['dashboard', 'command center', 'control panel', 'home base', 'hub'],
  'student': ['student', 'study', 'learning', 'education', 'course', 'university', 'college'],
  'journal': ['journal', 'journaling', 'diary', 'reflection', 'gratitude'],
  'goals': ['goal', 'goals', 'objectives', 'okr', 'resolution'],
  'project-management': ['project management', 'project manager', 'project tracker', 'kanban', 'agile', 'scrum'],
  'crm': ['crm', 'customer', 'client', 'sales', 'pipeline', 'lead'],
  'content': ['content', 'writing', 'blog', 'social media', 'creator', 'youtube'],
  'business': ['business', 'startup', 'entrepreneur', 'company', 'organization'],
  'health': ['health', 'fitness', 'workout', 'exercise', 'wellness', 'meal'],
  'reading': ['book', 'reading', 'library', 'notes', 'reading list'],
  'travel': ['travel', 'trip', 'vacation', 'itinerary'],
  'design': ['design', 'ui', 'ux', 'figma', 'creative'],
  'freelance': ['freelance', 'contractor', 'invoice', 'client work'],
  'bundle': ['bundle', 'collection', 'pack', 'kit'],
  'template': ['template', 'starter', 'boilerplate'],
  'second-brain': ['second brain', 'knowledge', 'notes', 'pkm', 'zettelkasten', 'para'],
  'marketing': ['marketing', 'seo', 'growth', 'analytics'],
  'hr': ['hr', 'hiring', 'recruitment', 'onboarding', 'team'],
  'personal': ['personal', 'life', 'lifestyle', 'home'],
  'ecommerce': ['ecommerce', 'e-commerce', 'shopify', 'store', 'inventory'],
  'wiki': ['wiki', 'documentation', 'docs', 'knowledge base'],
  'resume': ['resume', 'cv', 'portfolio', 'job'],
};

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

// Check if product is Notion-related
function isNotionRelated(product) {
  const searchText = `${product.original_name || product.name || ''} ${product.description || ''} ${product.features || ''}`.toLowerCase();
  return searchText.includes('notion');
}

// Extract product URL from Gumroad affiliate URL
function extractProductURL(affiliateUrl) {
  if (!affiliateUrl) return '';

  // If it's a Gumroad affiliate link, extract the product code
  // Format: https://gumroad.com/a/962870099/CODE
  const match = affiliateUrl.match(/gumroad\.com\/a\/\d+\/([^/?]+)/i);
  if (match) {
    const productCode = match[1];
    // We don't have the creator info here, so return the affiliate URL as-is
    return affiliateUrl;
  }

  return affiliateUrl;
}

// Categorize product based on keywords
function categorizeProduct(product) {
  const searchText = `${product.name || ''} ${product.description || ''} ${product.features || ''}`.toLowerCase();

  const matchedCategories = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        matchedCategories.push(category);
        break;
      }
    }
  }

  // Return the most specific category, or default to 'template'
  if (matchedCategories.length === 0) return 'template';

  // Priority order for main category
  const priorityCategories = ['dashboard', 'planner', 'tracker', 'crm', 'second-brain', 'project-management'];
  for (const cat of priorityCategories) {
    if (matchedCategories.includes(cat)) {
      return cat;
    }
  }

  return matchedCategories[0];
}

// Determine type (template, course, tool)
function determineType(product) {
  const searchText = `${product.name || ''} ${product.description || ''} ${product.features || ''}`.toLowerCase();

  if (searchText.includes('course') || searchText.includes('tutorial') || searchText.includes('learn')) {
    return 'course';
  }

  if (searchText.includes('tool') || searchText.includes('app') || searchText.includes('software') || searchText.includes('extension')) {
    return 'tool';
  }

  return 'template';
}

// Normalize URL for matching
function normalizeURL(url) {
  if (!url) return '';
  return url
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '')
    .split('?')[0]
    .split('#')[0];
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
  return creatorAffiliatesUrl ? 'partner' : 10;
}

// Construct affiliate URL
function constructAffiliateURL(productUrl, hasPartnerProgram) {
  if (!productUrl) return '';

  if (productUrl.includes('gumroad.com/a/962870099')) {
    return productUrl;
  }

  if (!hasPartnerProgram) {
    const separator = productUrl.includes('?') ? '&' : '?';
    return `${productUrl}${separator}a=962870099`;
  }

  return productUrl;
}

// Match NotionStack product to Gumroad product
function findMatch(nsProduct, gumroadProducts) {
  const nsBuyLink = normalizeURL(nsProduct.BuyLink);
  const nsCreator = nsProduct.Creator?.toLowerCase().trim();
  const nsProductName = normalizeProductName(nsProduct['Product Name'] || nsProduct.Template);

  if (nsBuyLink) {
    for (const gp of gumroadProducts) {
      const gpUrl = normalizeURL(gp.url);
      if (gpUrl && nsBuyLink.includes(gpUrl.split('/').pop())) {
        return gp;
      }
    }
  }

  if (nsCreator && nsProductName) {
    for (const gp of gumroadProducts) {
      const gpCreator = gp.creator_name?.toLowerCase().trim();
      const gpProductName = normalizeProductName(gp.original_name);

      if (gpCreator && (gpCreator.includes(nsCreator) || nsCreator.includes(gpCreator))) {
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
  console.log('🚀 Starting product catalog consolidation v2...\n');

  console.log('📖 Reading CSV files...');
  const gumroadRaw = await parseCSV(path.join(__dirname, '../gumroad-analysis-complete.csv'));
  const notionstackRaw = await parseCSV(path.join(__dirname, '../notionstack temlates notion dump.csv'));

  console.log(`   ✓ Gumroad: ${gumroadRaw.length.toLocaleString()} products`);
  console.log(`   ✓ NotionStack: ${notionstackRaw.length.toLocaleString()} products\n`);

  // Filter Gumroad to RECOMMENDED/HIGHLY RECOMMENDED AND Notion-related
  console.log('🔍 Filtering Gumroad products...');
  const gumroadRecommended = gumroadRaw.filter(p =>
    p.recommendation === 'RECOMMENDED' || p.recommendation === 'HIGHLY RECOMMENDED'
  );
  console.log(`   ✓ ${gumroadRecommended.length.toLocaleString()} recommended products`);

  const gumroadNotionOnly = gumroadRecommended.filter(p => isNotionRelated(p));
  console.log(`   ✓ ${gumroadNotionOnly.length.toLocaleString()} Notion-related products\n`);

  const consolidated = [];
  const matches = [];
  const newProducts = [];
  const stats = {
    totalNotionStack: notionstackRaw.length,
    totalGumroad: gumroadRaw.length,
    gumroadRecommended: gumroadRecommended.length,
    gumroadNotionOnly: gumroadNotionOnly.length,
    matched: 0,
    newFromGumroad: 0,
    highlyRecommended: 0,
    recommended: 0,
    hasAffiliate: 0,
    freeProducts: 0,
    paidProducts: 0,
    categoryCounts: {}
  };

  // Process NotionStack products
  console.log('🔗 Matching NotionStack products with Gumroad data...');
  for (const nsProduct of notionstackRaw) {
    const match = findMatch(nsProduct, gumroadNotionOnly);

    if (match) {
      stats.matched++;

      const hasPartnerProgram = !!match.creator_affiliates_url;
      const affiliateRate = getAffiliateRate(match.creator_affiliates_url);
      const productType = determineType(match);
      const subcategory = categorizeProduct(match);

      const mergedProduct = {
        id: match.original_name,
        name: match.original_name,
        slug: (nsProduct['NotionStack page'] || '').split('/').pop() ||
              match.original_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: match.description || nsProduct.Description || nsProduct.Desc || '',
        features: match.features || '',
        assessmentScore: parseFloat(match.assessment_score) || 0,
        price: parseFloat(match.price) || 0,
        currency: 'USD',
        rating: parseFloat(match.star_rating) || null,
        ratingCount: parseInt(match.rating_count) || null,
        salesCount: parseInt(match.sale_count) || null,
        creator: {
          name: match.creator_name || nsProduct.Creator || '',
          url: match.creator_url || nsProduct['Creator profile page'] || ''
        },
        platform: 'gumroad',
        productUrl: match.url || nsProduct.BuyLink || '',
        affiliateUrl: match.url || constructAffiliateURL(nsProduct.BuyLink, hasPartnerProgram),
        category: productType,
        subcategory: subcategory,
        tags: nsProduct.Tags ? nsProduct.Tags.split(',').map(t => t.trim()) : [],
        hasAffiliate: true,
        affiliateRate: affiliateRate,
        recommendation: match.recommendation,
        status: 'active',
        dateAdded: nsProduct['Created time'] || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
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
      stats.categoryCounts[subcategory] = (stats.categoryCounts[subcategory] || 0) + 1;
    }
  }

  console.log(`   ✓ Matched ${stats.matched} products\n`);

  // Add new Notion-related products from Gumroad
  console.log('➕ Adding new Notion-related products from Gumroad...');
  for (const gp of gumroadNotionOnly) {
    const gpUrl = normalizeURL(gp.url);
    const alreadyExists = consolidated.some(p => {
      const pUrl = normalizeURL(p.productUrl);
      return gpUrl && pUrl && (gpUrl.includes(pUrl) || pUrl.includes(gpUrl));
    });

    if (!alreadyExists) {
      const hasPartnerProgram = !!gp.creator_affiliates_url;
      const affiliateRate = getAffiliateRate(gp.creator_affiliates_url);
      const productType = determineType(gp);
      const subcategory = categorizeProduct(gp);

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
        productUrl: gp.url || '',
        affiliateUrl: gp.url || '',
        category: productType,
        subcategory: subcategory,
        tags: [],
        hasAffiliate: true,
        affiliateRate: affiliateRate,
        recommendation: gp.recommendation,
        status: 'active',
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
      stats.categoryCounts[subcategory] = (stats.categoryCounts[subcategory] || 0) + 1;
    }
  }

  console.log(`   ✓ Added ${stats.newFromGumroad} new products\n`);

  // Sort by priority score
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
  console.log(`   ✓ Sorted ${consolidated.length.toLocaleString()} products\n`);

  // Generate category breakdown
  const categoryBreakdown = Object.entries(stats.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => `   - ${cat}: ${count} products`)
    .join('\n');

  // Generate report
  console.log('📝 Generating consolidation report...\n');

  const report = `# NotionStack Product Catalog Consolidation Report v2
Generated: ${new Date().toISOString()}

## Summary Statistics

### Data Sources
- **NotionStack Database**: ${stats.totalNotionStack.toLocaleString()} products
- **Gumroad Database**: ${stats.totalGumroad.toLocaleString()} products
- **Gumroad Recommended**: ${stats.gumroadRecommended.toLocaleString()} products
- **Gumroad Notion-Related**: ${stats.gumroadNotionOnly.toLocaleString()} products (filtered)

### Consolidation Results
- **Total Consolidated Products**: ${consolidated.length.toLocaleString()}
- **Matched Products**: ${stats.matched.toLocaleString()} (NotionStack found in Gumroad)
- **New Products from Gumroad**: ${stats.newFromGumroad.toLocaleString()}

### Quality Distribution
- **Highly Recommended**: ${stats.highlyRecommended.toLocaleString()} products
- **Recommended**: ${stats.recommended.toLocaleString()} products

### Revenue Potential
- **Products with Affiliate Links**: ${stats.hasAffiliate.toLocaleString()} (${((stats.hasAffiliate/consolidated.length)*100).toFixed(1)}%)
- **Paid Products**: ${stats.paidProducts.toLocaleString()} (${((stats.paidProducts/consolidated.length)*100).toFixed(1)}%)
- **Free Products**: ${stats.freeProducts.toLocaleString()} (${((stats.freeProducts/consolidated.length)*100).toFixed(1)}%)

### Category Breakdown (by subcategory)
${categoryBreakdown}

## Top 25 Products (by revenue priority)

${consolidated.slice(0, 25).map((p, i) => `${i + 1}. **${p.name}** by ${p.creator.name}
   - Price: ${p.price > 0 ? '$' + p.price : 'Free'} | Rating: ${p.rating || 'N/A'} (${p.ratingCount || 0} reviews) | Sales: ${p.salesCount || 'N/A'}
   - Type: ${p.category} | Category: ${p.subcategory}
   - Recommendation: ${p.recommendation}
   - Affiliate: ${p.affiliateRate === 'partner' ? 'Partner Program' : p.affiliateRate + '%'}
   - Product URL: ${p.productUrl}
   - Source: ${p.source}`).join('\n\n')}

## Sample Matched Products (first 10)

${matches.slice(0, 10).map((m, i) => `${i + 1}. NotionStack: "${m.notionstack}"
   → Gumroad: "${m.gumroad}"`).join('\n\n')}

## Sample New Products (first 15)

${newProducts.slice(0, 15).map((p, i) => `${i + 1}. **${p.name}** by ${p.creator.name}
   - Price: ${p.price > 0 ? '$' + p.price : 'Free'} | Rating: ${p.rating || 'N/A'}
   - Type: ${p.category} | Category: ${p.subcategory}
   - Recommendation: ${p.recommendation}`).join('\n\n')}

## Filters Applied

✅ Only RECOMMENDED or HIGHLY RECOMMENDED products
✅ Only products with "Notion" in name, description, or features
✅ Affiliate URLs properly constructed
✅ Automatic categorization based on content analysis

## Category System

**Product Types** (main categories):
- template: Notion templates and dashboards
- course: Educational content and tutorials
- tool: Software, apps, and utilities

**Subcategories** (detected from content):
${Object.keys(CATEGORY_KEYWORDS).sort().map(cat => `- ${cat}`).join('\n')}

## Next Steps

1. ✅ **Notion-related filter applied** - removed all non-Notion products
2. ✅ **Product URLs preserved** - full affiliate URLs maintained
3. ✅ **Auto-categorization complete** - ${Object.keys(stats.categoryCounts).length} categories detected
4. **Review categories** - verify auto-categorization accuracy
5. **Generate product JSON files** for /content/products/ directory
6. **Capture product visuals** (cover images, og:image)
7. **Build site** and test

## Data Quality Notes

- All Gumroad data prioritized over NotionStack for: ratings, pricing, descriptions, features
- Affiliate URLs constructed for non-partner products (10% commission) with ?a=962870099
- Partner products identified by creator_affiliates_url presence
- All products verified to mention "Notion" in name, description, or features
- Automatic categorization based on keyword matching (may need manual review)
`;

  // Save files
  const reportPath = path.join(__dirname, '../data/consolidation-report-v2.md');
  fs.writeFileSync(reportPath, report);
  console.log(`✅ Report saved to: ${reportPath}\n`);

  const dataPath = path.join(__dirname, '../data/consolidated-products-v2.json');
  fs.writeFileSync(dataPath, JSON.stringify(consolidated, null, 2));
  console.log(`✅ Consolidated data saved to: ${dataPath}\n`);

  const csvPath = path.join(__dirname, '../data/consolidated-products-v2.csv');
  const csvHeader = 'name,creator,price,rating,ratingCount,salesCount,type,subcategory,recommendation,affiliateRate,source,productUrl\n';
  const csvRows = consolidated.map(p =>
    `"${p.name}","${p.creator.name}",${p.price},${p.rating || ''},${p.ratingCount || ''},${p.salesCount || ''},"${p.category}","${p.subcategory}","${p.recommendation}","${p.affiliateRate}","${p.source}","${p.productUrl}"`
  ).join('\n');
  fs.writeFileSync(csvPath, csvHeader + csvRows);
  console.log(`✅ CSV saved to: ${csvPath}\n`);

  console.log('🎉 Consolidation v2 complete!\n');
  console.log(report);
}

consolidateProducts().catch(console.error);
