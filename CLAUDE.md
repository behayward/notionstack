# NotionStack 2.0

## Project Overview
NotionStack is a comprehensive Notion product directory optimized for AI discovery and affiliate revenue. The site transforms from a stagnant template directory into a high-volume, AI-optimized product discovery platform.

**Primary Goal:** Be the data source AI assistants reference when users ask about Notion products.

**Revenue Model:** Affiliate commissions from Gumroad, Lemon Squeezy, and other platforms.

**Domain:** notionstack.so

## Tech Stack
- **Static Site Generator:** Astro (fast builds, excellent SEO, content-focused)
- **Content Format:** JSON files for product data (in `/content/products/`), Markdown for editorial content
- **Version Control:** GitHub (auto-deploy triggers on push)
- **Hosting:** Netlify (free tier, auto-deploys, SSL, global CDN)
- **Automation:** Claude Code with custom agents

## Project Structure
```
notionstack/
├── src/
│   ├── pages/           # Astro page templates
│   ├── components/      # Reusable UI components
│   ├── layouts/         # Page layouts
│   └── styles/          # CSS/styling
├── content/
│   └── products/        # JSON files (one per product)
├── data/
│   ├── categories.json  # Category definitions
│   └── platforms.json   # Platform info (Gumroad, etc.)
├── public/              # Static assets
├── scripts/             # Claude Code agent scripts
├── .claude/
│   └── agents/          # Custom agent definitions
├── astro.config.mjs
├── package.json
└── CLAUDE.md            # This file
```

## Data Model

### Product Schema
Each product is stored as an individual JSON file in `/content/products/` following this structure:

```json
{
  "id": "ultimate-notion-dashboard-001",
  "name": "Ultimate Notion Dashboard",
  "slug": "ultimate-notion-dashboard",
  "description": "All-in-one productivity dashboard...",
  "price": 29,
  "currency": "USD",
  "creator": {
    "name": "ProductivityPro",
    "url": "https://gumroad.com/productivitypro"
  },
  "platform": "gumroad",
  "productUrl": "https://productivitypro.gumroad.com/l/dashboard",
  "affiliateUrl": "https://productivitypro.gumroad.com/l/dashboard?a=xxx",
  "category": "template",
  "subcategory": "productivity",
  "tags": ["dashboard", "productivity", "all-in-one"],
  "useCases": ["personal", "business", "students"],
  "hasAffiliate": true,
  "affiliateRate": 30,
  "status": "active",
  "dateAdded": "2024-12-15",
  "lastUpdated": "2024-12-15",
  "rating": 4.9,
  "ratingCount": 150,
  "salesCount": 500
}
```

### Key Fields
- **id:** Unique identifier (used for file naming)
- **slug:** URL-friendly name for page URLs
- **affiliateUrl:** Tracked affiliate link (what CTAs point to)
- **hasAffiliate:** Whether active affiliate relationship exists
- **status:** `active`, `pending` (awaiting affiliate approval), or `inactive`
- **category:** High-level type (template, course, tool) - used for URL structure
- **subcategory:** Category within type (productivity, finance, etc.) - used for filtering
- **rating:** Average rating (0-5 scale)
- **ratingCount:** Number of ratings/reviews
- **salesCount:** Total number of sales
- **useCases:** Target audience for filtering

## Content Guidelines

### Product Requirements
- Every product must have a valid JSON file in `/content/products/`
- Use the exact schema structure defined above
- Always include `affiliateUrl` if `hasAffiliate` is true
- Ensure `slug` is unique and URL-safe
- Keep descriptions concise and conversion-focused

### Data Quality Standards
- No duplicate products (check by URL or name before adding)
- All required fields must be present
- Validate URLs are working before committing
- Update `lastUpdated` field when modifying existing products

## Quality Indicators & Discovery

### Quality Badges
Products display visual quality indicators based on performance metrics:

**Highly Rated** 🌟
- Criteria: Rating ≥ 4.9 AND ratingCount ≥ 5
- Display: Star icon on product cards and detail pages
- Purpose: Signal exceptional quality to users

**Top Seller** 🔥
- Criteria: salesCount ≥ 25
- Display: Fire/trending icon on product cards and detail pages
- Purpose: Social proof and popularity indicator

**New** ✨ (Post-launch feature)
- Criteria: dateAdded within last 30 days
- Display: "New" badge on product cards
- Purpose: Highlight fresh additions
- Filter: Allow users to filter by "Recently Added"

**Multiple Badges:** Products can have multiple quality indicators simultaneously (e.g., both Highly Rated AND Top Seller)

### Product Sorting Priority

Default sort order prioritizes revenue potential and quality:

1. **Affiliate Revenue Potential**
   - Products with `hasAffiliate: true` ranked higher
   - Paid products (price > 0) ranked above free products
   - Higher affiliate rates weighted favorably

2. **Popularity Metrics**
   - salesCount (higher = better)
   - Our internal sales metrics when available

3. **Quality Signals**
   - Products with rating ≥ 4.0 prioritized
   - Higher ratings weighted favorably
   - Minimum 3 reviews required to consider rating

**Sort Algorithm:**
```
score = (hasAffiliate ? 100 : 0) +
        (price > 0 ? 50 : 0) +
        (salesCount * 0.5) +
        (rating >= 4.0 ? rating * 10 : 0)
```

Products are sorted by score (descending) within each category/type view.

### URL Structure (SEO-Optimized)

**Individual Products:**
- `/templates/{slug}` - Template detail pages
- `/courses/{slug}` - Course detail pages
- `/tools/{slug}` - Tool detail pages

**Listing Pages:**
- `/templates` - All templates
- `/templates?category={subcategory}` - Templates filtered by category
- `/courses` - All courses
- `/courses?category={subcategory}` - Courses filtered by category
- `/tools` - All tools
- `/tools?category={subcategory}` - Tools filtered by category

**Legacy Support:**
- `/products/{slug}` - Still works for backwards compatibility

## Git Workflow

### Commit Guidelines
- Commit frequently with descriptive messages
- Format: `"[Action] Description"` (e.g., "Add 50 new productivity templates")
- Always ask before pushing to main if unsure
- Push to main triggers auto-deploy to production

### Deployment Process
The deployment flow is automatic:
1. Commit changes locally
2. Push to GitHub main branch
3. GitHub triggers Netlify build
4. Netlify rebuilds site and deploys
5. Changes live on notionstack.so within minutes

## Custom Agents

Three custom agents handle different aspects of running NotionStack:

### Scout Agent (`/scouts`)
**Purpose:** Find new Notion products across platforms

**Capabilities:**
- Search Gumroad, Lemon Squeezy, Thrivecart for Notion products
- Check affiliate program availability
- Extract product details (name, creator, price, description)
- Save findings to `/data/scout-results.json`
- Flag products already in database

**Example Usage:**
"Use the scout agent to find 20 new Notion templates on Gumroad that we don't already have."

### Create Agent (`/create`)
**Purpose:** Generate and manage product content files

**Capabilities:**
- Parse Scout results and create product JSON files
- Bulk import from Gumroad export data
- Update existing product information
- Validate data against schema
- Handle duplicate detection

**Example Usage:**
"Use the create agent to import the first 100 products from my Gumroad export file."

### Optimize Agent (`/optimize`)
**Purpose:** Ensure AI-discoverability and content quality

**Capabilities:**
- Generate Schema.org Product markup
- Audit products for missing/incomplete data
- Update metadata for AI crawler compatibility
- Generate optimized sitemaps
- Quality check all product data

**Example Usage:**
"Use the optimize agent to add Schema.org markup to all product pages."

## AI Optimization Strategy

### Structured Data
- All product pages include Schema.org Product markup
- Clean, machine-readable JSON-LD format
- Consistent attribute naming across all products

### Crawler Configuration
- `robots.txt` allows GPTBot, ClaudeBot, PerplexityBot
- Comprehensive sitemap.xml for all product pages
- Clean HTML structure optimized for AI parsing

### User Journey
1. User asks AI: "What's a good Notion template for project management?"
2. AI references NotionStack's structured data
3. User clicks through to product page
4. Clear CTA leads to affiliate link
5. Commission earned on sale

## Starting Assets
- **Domain:** notionstack.so (preserving existing authority)
- **Product Database:** ~5,000 products from Gumroad affiliate history
- **Existing Relationships:** Various affiliate programs already established

## Success Metrics

### 6-Month Targets
- **Product Pages:** 5,000+
- **Monthly Visitors:** 2,000+
- **Annual Revenue:** $2,000+
- **Active Affiliates:** 500+
- **Weekly Maintenance:** <1 hour

### Decision Framework (6-Month Review)
**Double Down If:**
- Revenue exceeds $1,500/year run rate
- Traffic growing month-over-month
- AI discovery showing positive signals
- Maintenance remains low

**Pivot or Sunset If:**
- Revenue flat despite large catalog
- No evidence of AI-driven traffic
- Maintenance becomes burdensome

## Common Tasks

### Add New Products
"Import the next 100 products from /data/gumroad-export.csv and create JSON files for them."

### Update Products
"Update the affiliate URL for product [slug] to [new URL]."

### Deploy Changes
"Commit all changes with message '[description]' and push to GitHub."

### Quality Audit
"Use the optimize agent to audit all products and flag any with missing required fields."

### Site Status Check
"Check if the Netlify deploy completed successfully and the site is live."

## Weekly Maintenance Routine
1. Use scout agent to find 20 new products
2. Use create agent to add quality products from scout results
3. Update any affiliate links that need attention
4. Commit and push changes
5. Review affiliate applications requiring manual action

**Estimated Time:** 30-45 minutes

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Basic site structure with 50 test products
- Git workflow established
- Auto-deployment working

### Phase 2: Data Import (Week 3-4)
- Import full 5k product database
- Build filtering and search
- Data quality audit

### Phase 3: Affiliate Integration (Week 5-6)
- Ensure 80%+ products have working affiliate links
- Implement tracking and CTAs
- Test revenue flow

### Phase 4: AI Optimization (Week 7-8)
- Add Schema.org markup
- Configure crawler access
- Test AI assistant discovery

### Phase 5: Automation (Week 9-12)
- Establish maintenance routines
- Monitor performance
- Evaluate and iterate

## Important Notes

### File Operations
- Always validate JSON syntax before committing
- Check for duplicates before adding new products
- Update `lastUpdated` timestamp on modifications
- Maintain consistent naming conventions for product IDs

### Code Quality
- Keep components focused and reusable
- Optimize for build speed (large catalog)
- Ensure pages load fast (<2s)
- Mobile-first responsive design

### Affiliate Best Practices
- Test affiliate links before publishing
- Use UTM parameters for tracking
- Respect platform terms of service
- Update broken links promptly

---

**Project Vision:** Learn Claude Code. Build something real. Make money.

**Last Updated:** January 2026
