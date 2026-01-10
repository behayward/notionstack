# NotionStack 2.0

An AI-optimized Notion product directory for affiliate discovery and revenue.

## Project Status

✅ **Phase 1: Foundation - Complete**

The basic infrastructure is in place and ready for development.

## What's Built

- ✅ Astro static site generator setup
- ✅ Project folder structure
- ✅ Base layout and navigation
- ✅ Homepage with hero, categories, and featured products
- ✅ Product card component
- ✅ Dynamic product detail pages
- ✅ Product data schema (JSON)
- ✅ Example products (3 sample products)
- ✅ Custom agent definitions (Scout, Create, Optimize)
- ✅ Data files for categories and platforms

## Quick Start

### Development

```bash
npm install
npm run dev
```

Visit http://localhost:4321/

### Build

```bash
npm run build
```

Static files will be generated in `/dist/`

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
notionstack/
├── src/
│   ├── pages/           # Astro pages (index, product detail)
│   ├── components/      # Reusable components (ProductCard)
│   ├── layouts/         # Page layouts (BaseLayout)
│   └── styles/          # CSS/styling
├── content/
│   └── products/        # Product JSON files (3 examples)
├── data/
│   ├── categories.json  # Category definitions
│   └── platforms.json   # Platform information
├── .claude/
│   └── agents/          # Custom agents (Scout, Create, Optimize)
├── CLAUDE.md            # Project context for Claude Code
└── README.md            # This file
```

## Custom Agents

Three specialized agents are configured in `.claude/agents/`:

### Scout Agent
Find new Notion products across platforms (Gumroad, Lemon Squeezy, etc.)

### Create Agent
Generate and manage product JSON files from various data sources

### Optimize Agent
Ensure AI-discoverability with Schema.org markup, SEO, and quality audits

See CLAUDE.md for detailed agent usage instructions.

## Product Schema

Each product is stored as a JSON file following this structure:

```json
{
  "id": "unique-id-001",
  "name": "Product Name",
  "slug": "product-name",
  "description": "Product description...",
  "price": 29,
  "currency": "USD",
  "creator": {
    "name": "Creator Name",
    "url": "https://creator-url"
  },
  "platform": "gumroad",
  "productUrl": "https://product-url",
  "affiliateUrl": "https://affiliate-url",
  "category": "template",
  "subcategory": "productivity",
  "tags": ["tag1", "tag2"],
  "useCases": ["personal", "business"],
  "hasAffiliate": true,
  "affiliateRate": 30,
  "status": "active",
  "dateAdded": "2024-12-15",
  "lastUpdated": "2024-12-15"
}
```

## Next Steps

### Phase 2: Data Import
- [ ] Prepare Gumroad export file (5k products)
- [ ] Use Create agent to bulk import products
- [ ] Build product listing page with filters
- [ ] Implement search functionality
- [ ] Add pagination

### Phase 3: Affiliate Integration
- [ ] Audit affiliate link coverage
- [ ] Apply to additional affiliate programs
- [ ] Test affiliate tracking
- [ ] Optimize CTAs

### Phase 4: AI Optimization
- [ ] Add Schema.org Product markup
- [ ] Configure robots.txt for AI crawlers
- [ ] Generate sitemap.xml
- [ ] Test AI assistant discovery

### Phase 5: Deployment
- [ ] Create GitHub repository
- [ ] Connect to Netlify
- [ ] Point notionstack.so domain
- [ ] Set up auto-deployment

## Key Files

- **CLAUDE.md** - Complete project context for Claude Code
- **NotionStack-2.0-Roadmap.docx** - Original project roadmap
- **package.json** - Node dependencies and scripts
- **astro.config.mjs** - Astro configuration

## Tech Stack

- **Framework**: Astro 5.x
- **Content**: JSON files
- **Styling**: Native CSS (scoped to components)
- **Build**: Static site generation
- **Deployment**: Netlify (planned)

## 6-Month Goals

- 5,000+ product pages
- 2,000+ monthly visitors
- $2,000+ annual revenue
- <1 hour weekly maintenance

---

**Vision**: Learn Claude Code. Build something real. Make money.

Built with Claude Code in January 2026.
