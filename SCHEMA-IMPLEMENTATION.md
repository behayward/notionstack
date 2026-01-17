# JSON-LD Schema Markup Implementation

## Overview
NotionStack now includes comprehensive JSON-LD structured data markup optimized for AI search engines (ChatGPT, Claude, Perplexity, Grok) and traditional search engines (Google, Bing).

## Schema Components

### 1. ProductSchema.astro
**Location:** `/src/components/schema/ProductSchema.astro`

**Purpose:** Markup for Notion templates, courses, and tools

**Includes:**
- Product name, description
- Brand/creator information
- Pricing (with currency, availability)
- Aggregate ratings (when available)
- Product category
- Offer details with price validity

**Usage Example:**
```astro
<ProductSchema
  name={product.name}
  description={product.description}
  brand={product.creator.name}
  price={product.price}
  currency={product.currency}
  url={product.affiliateUrl}
  rating={product.rating}
  reviewCount={product.ratingCount}
  category={product.subcategory}
/>
```

### 2. ArticleSchema.astro
**Location:** `/src/components/schema/ArticleSchema.astro`

**Purpose:** Markup for blog posts and editorial content

**Includes:**
- Article headline, description
- Author information
- Publication and modification dates
- Publisher organization details
- Article URL

**Usage Example:**
```astro
<ArticleSchema
  title={post.title}
  description={post.description}
  datePublished={post.publishedDate}
  dateModified={post.lastUpdated}
  url={postUrl}
/>
```

### 3. OrganizationSchema.astro
**Location:** `/src/components/schema/OrganizationSchema.astro`

**Purpose:** Site identity and organization information

**Includes:**
- Organization name
- Site description
- Logo
- Official URL
- Social media links (optional)

**Usage Example:**
```astro
<OrganizationSchema />
```

### 4. BreadcrumbSchema.astro
**Location:** `/src/components/schema/BreadcrumbSchema.astro`

**Purpose:** Navigation hierarchy for SEO and user context

**Includes:**
- Ordered list of navigation items
- Position-based hierarchy
- Full URLs for each breadcrumb

**Usage Example:**
```astro
<BreadcrumbSchema items={[
  { name: 'Home', url: 'https://notionstack.so/' },
  { name: 'Templates', url: 'https://notionstack.so/templates' },
  { name: 'Productivity', url: 'https://notionstack.so/templates?category=productivity' },
  { name: product.name, url: productUrl }
]} />
```

### 5. FAQSchema.astro
**Location:** `/src/components/schema/FAQSchema.astro`

**Purpose:** Q&A content markup (ready for future use)

**Includes:**
- Question/answer pairs
- Structured FAQ data

**Usage Example:**
```astro
<FAQSchema items={[
  { question: "What is this template?", answer: "..." },
  { question: "How do I install it?", answer: "..." }
]} />
```

## Integration Points

### Product Pages (Templates/Courses/Tools)
**Files:**
- `/src/pages/templates/[slug].astro`
- `/src/pages/courses/[slug].astro`
- `/src/pages/tools/[slug].astro`

**Schemas Applied:**
- ProductSchema (product details, pricing, ratings)
- BreadcrumbSchema (navigation context)

### Blog Posts
**File:** `/src/pages/blog/[slug].astro`

**Schemas Applied:**
- ArticleSchema (article metadata)
- BreadcrumbSchema (navigation context)

### Homepage
**File:** `/src/pages/index.astro`

**Schemas Applied:**
- OrganizationSchema (site identity)

## Validation & Testing

### 1. Google Rich Results Test
**URL:** https://search.google.com/test/rich-results

**Steps:**
1. Visit the tool
2. Enter a NotionStack product URL (e.g., `https://notionstack.so/templates/notion-life-planner`)
3. Click "Test URL"
4. Verify "Product" and "BreadcrumbList" are detected
5. Check for warnings or errors

### 2. Schema.org Validator
**URL:** https://validator.schema.org/

**Steps:**
1. Visit the tool
2. Enter a NotionStack URL
3. Review detected schemas
4. Verify all properties are valid

### 3. Manual Inspection
**Steps:**
1. Visit any product page
2. View page source (Cmd+Option+U on Mac)
3. Search for `application/ld+json`
4. Verify JSON structure is valid
5. Check all data matches visible content

### 4. AI Search Testing
**Test with AI Assistants:**

ChatGPT:
```
"What are the best Notion productivity templates on NotionStack?"
```

Claude:
```
"Find highly-rated Notion templates for project management on NotionStack"
```

Perplexity:
```
"Show me top Notion dashboard templates from NotionStack with ratings"
```

**Expected Behavior:**
- AI should accurately cite NotionStack data
- Ratings, prices, and descriptions should be included
- Product names and creators should be accurate

## Benefits

### For AI Search Engines
- Clear product hierarchy and categorization
- Explicit pricing and availability data
- Ratings signal quality and popularity
- Breadcrumbs provide context

### For Traditional Search
- Rich snippets in Google results
- Star ratings displayed in SERPs
- Price information shown
- Enhanced click-through rates

### For Crawlers
- Semantic understanding of content
- Clear site structure
- Relationship between products
- Author and publisher attribution

## Next Steps

### Phase 2: Data Quality Improvements
Before the schema markup can reach its full potential, we need to:

1. **Fix Star Ratings**
   - Current issue: Rating field contains review count instead of 1-5 score
   - Solution: Re-scrape Gumroad products for correct ratings
   - Extract actual star ratings (1.0 to 5.0 scale)

2. **Add Product Images**
   - Extract og:image from product pages
   - Add to product JSON files
   - Include in ProductSchema markup
   - Improves visual appeal in search results

3. **Scraper Updates Needed**
   - Scrape star rating (1-5 scale)
   - Extract og:image URL
   - Update all 3,500+ product JSON files

### Future Enhancements
- Add VideoObject schema for tutorial content
- Implement Review schema for user testimonials
- Add HowTo schema for setup guides
- Create CollectionPage schema for category pages

## Technical Notes

### Schema Format
All schemas use JSON-LD format:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  ...
}
</script>
```

### TypeScript Types
All schema components include TypeScript interfaces for type safety and autocomplete.

### Conditional Rendering
- Ratings only included if both rating AND reviewCount exist
- Images only included if image URL provided
- Breadcrumbs adapt to subcategory presence

### URL Requirements
- All URLs must be absolute (https://notionstack.so/...)
- Breadcrumb URLs must match actual page structure
- Product URLs should point to affiliate links when available

## Monitoring & Maintenance

### Regular Checks
- Monthly: Validate random product pages
- Quarterly: Full site schema audit
- After major changes: Re-validate all schemas

### Error Handling
- Missing ratings: Schema still valid without aggregateRating
- Missing images: Schema still valid, just less visual
- Broken URLs: Monitor 404s and update schemas

### Performance Impact
- Minimal: JSON-LD in `<script>` tags
- No render blocking
- ~1-2KB per page added
- No JavaScript execution required

---

**Last Updated:** January 16, 2026
**Status:** ✅ Deployed to production
**Next Action:** Fix Gumroad data (ratings + images)
