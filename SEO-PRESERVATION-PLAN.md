# NotionStack 2.0 SEO Preservation Plan

## Current Site Analysis (Super.so)

**Estimated Content:**
- 300+ template pages
- 14 course pages
- 40+ tool pages
- 30 blog posts
- 50+ creator profiles
- 19 category pages
- Static pages (about, team, contact, legal)

**URL Structure:**
- Templates: `/templates/[slug]`
- Courses: `/courses/[slug]`
- Tools: `/tools/[slug]`
- Blog: `/blog/[slug]`
- Creators: `/creator/[slug]`
- Categories: Various category paths

**Total Estimated Pages:** ~500+ indexed URLs

## SEO Risks & Mitigation

### Risk 1: Broken Links (404 errors)
**Problem:** Changing URL structure will break existing links and hurt SEO
**Solution:** Implement 301 redirects for ALL old URLs

### Risk 2: Lost Link Equity
**Problem:** External backlinks pointing to old URLs will lose value
**Solution:** 301 redirects preserve ~90-99% of link equity

### Risk 3: Duplicate Content During Transition
**Problem:** Both old and new sites could be indexed simultaneously
**Solution:** Proper DNS/deployment sequence to avoid overlap

### Risk 4: Lost Blog Content
**Problem:** Your 30 blog posts provide valuable SEO content
**Solution:** Either migrate blog posts OR keep them on subdomain

## Recommended Approach: Phased Migration

### Phase 1: Audit & Export (Do This First)
Before changing anything:

1. **Export Full Sitemap**
   - Save the complete sitemap.xml from current site
   - Document every URL (we have ~500)

2. **Export Content**
   - Download/export all product data from current Notion
   - Save blog posts (30 articles)
   - Export creator profiles if migrating

3. **Identify Top Pages**
   - Use analytics to find top 20 most-visited URLs
   - These need perfect redirects

4. **Check Backlinks**
   - Use Google Search Console or Ahrefs
   - Identify which pages have external backlinks
   - Prioritize redirect accuracy for these

### Phase 2: Build Redirect Map

Create a complete mapping file:

```
OLD URL → NEW URL
/templates/ultimate-brain-for-notion → /products/ultimate-brain-for-notion
/courses/notion-mastery → /products/notion-mastery
/tools/super → /products/super (or custom handling)
/blog/[article] → Keep on subdomain OR migrate to /blog/[article]
/creator/[name] → Remove OR redirect to homepage
```

### Phase 3: Implementation Options

**Option A: Keep Both Sites Running (Recommended)**
- **Old content:** blog.notionstack.so (current Super.so site)
- **New products:** notionstack.so (new Astro site)
- **Benefits:**
  - Zero content loss
  - No redirects needed for blog
  - SEO stays intact
  - Can migrate gradually

**Option B: Full Migration**
- Move everything to new Astro site
- Requires migrating 30 blog posts
- Need comprehensive redirect file
- Higher risk but cleaner

**Option C: Hybrid Approach (Best for You)**
- **Product pages:** New Astro site (templates, courses, tools)
- **Blog & static:** Keep on Super.so at blog.notionstack.so
- **Redirects:** Only for product pages
- **Benefit:** Preserve SEO while building new product system

## Recommended Strategy: Option C (Hybrid)

### Step 1: Set Up Subdomain (BEFORE launch)
```
1. Point blog.notionstack.so → Current Super.so site
2. Keep all blog posts, about pages, static content there
3. Zero SEO loss for blog content
```

### Step 2: Build Redirect File
Create `/public/_redirects` (Netlify format):

```
# Template redirects (300+ URLs)
/templates/ultimate-brain-for-notion  /products/ultimate-brain-for-notion  301
/templates/notion-startup-os          /products/notion-startup-os          301
/templates/super-life                 /products/super-life                 301
... (300+ more)

# Course redirects
/courses/notion-mastery               /products/notion-mastery             301
... (14+ more)

# Tool redirects
/tools/super                          /products/super                      301
... (40+ more)

# Blog → subdomain redirect
/blog/*                               https://blog.notionstack.so/blog/:splat  301

# Static pages
/about                                https://blog.notionstack.so/about    301
/about/*                              https://blog.notionstack.so/about/:splat  301

# Fallback
/*                                    /  301
```

### Step 3: Deploy Sequence (No Downtime)

1. **Build new Astro site** with all product data
2. **Test on staging URL** (e.g., Netlify preview)
3. **Create redirect file** with all mappings
4. **Set up blog subdomain** pointing to Super.so
5. **Switch DNS** for notionstack.so → new Netlify site
6. **Monitor** for 404 errors and fix immediately

### Step 4: Post-Launch Monitoring

**Week 1:**
- Check Google Search Console for 404 errors
- Fix any missing redirects immediately
- Monitor traffic for drops

**Week 2-4:**
- Submit new sitemap to Google
- Monitor rankings for key pages
- Adjust redirects as needed

**Month 2-3:**
- Evaluate blog subdomain performance
- Consider migrating blog if desired
- Optimize new product pages

## Technical Implementation

### 1. Create Netlify Redirects File

```javascript
// /public/_redirects
// This file handles all URL redirects

# Product redirects - CRITICAL for SEO
/templates/:slug  /products/:slug  301
/courses/:slug    /products/:slug  301
/tools/:slug      /products/:slug  301

# Blog to subdomain
/blog/*  https://blog.notionstack.so/blog/:splat  301

# Static pages to subdomain
/about              https://blog.notionstack.so/about  301
/about/*            https://blog.notionstack.so/about/:splat  301
/creator/*          https://blog.notionstack.so/creator/:splat  301
/hire               https://blog.notionstack.so/hire  301
/stack              https://blog.notionstack.so/stack  301
```

### 2. Create robots.txt

```
# /public/robots.txt
User-agent: *
Allow: /

# Allow AI crawlers (for your AI discovery thesis)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot
Allow: /

Sitemap: https://notionstack.so/sitemap.xml
```

### 3. Generate Comprehensive Sitemap

The Optimize agent will generate this, but structure should be:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://notionstack.so/</loc>
    <lastmod>2026-01-09</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://notionstack.so/products/ultimate-brain-for-notion</loc>
    <lastmod>2024-12-15</lastmod>
    <priority>0.8</priority>
  </url>
  <!-- All product pages -->
</urlset>
```

### 4. Preserve Meta Data

For each product, ensure:
- Title matches or improves old page
- Description is similar or better
- Same or better content quality
- Schema.org markup (improves upon old site)

## Pre-Launch Checklist

**BEFORE switching DNS:**

- [ ] Export complete sitemap from current site
- [ ] Document all URL patterns
- [ ] Export all product data from Notion
- [ ] Create comprehensive redirect mapping
- [ ] Set up blog.notionstack.so subdomain
- [ ] Build and test new Astro site on staging
- [ ] Create _redirects file with all mappings
- [ ] Test redirects on staging URL
- [ ] Create new sitemap.xml
- [ ] Set up robots.txt
- [ ] Verify all product data is imported

**Launch day:**

- [ ] Point blog.notionstack.so to Super.so
- [ ] Verify blog subdomain works
- [ ] Switch notionstack.so DNS to Netlify
- [ ] Wait for DNS propagation (15-60 min)
- [ ] Test random old URLs for proper redirects
- [ ] Submit new sitemap to Google Search Console
- [ ] Monitor for 404 errors

**Post-launch (Week 1):**

- [ ] Check Search Console daily for crawl errors
- [ ] Fix any 404s immediately
- [ ] Monitor traffic in analytics
- [ ] Check rankings for key terms
- [ ] Test backlinks still work

## Slug Matching Strategy

**CRITICAL:** New product slugs MUST match old URLs

Old: `/templates/ultimate-brain-for-notion`
New: `/products/ultimate-brain-for-notion`

The slug `ultimate-brain-for-notion` must be identical!

When importing products, use the exact slug from the old URL.

## Questions to Answer Before Launch

1. **Do you want to migrate blog posts or keep them separate?**
   - Separate (recommended): Less work, zero SEO risk
   - Migrate: More complete new site, but need to move 30 posts

2. **What about creator profiles?**
   - Remove and redirect to homepage?
   - Keep on subdomain?
   - Migrate to new site?

3. **Static pages (About, Contact, etc.)?**
   - Keep on blog subdomain (easy)
   - Recreate on new site (more work)

4. **Category pages?**
   - Your new site has category filtering
   - Can redirect `/categories/productivity` → `/products?category=template`
   - Or create dedicated category pages

## Expected SEO Impact

**Best Case (with proper redirects):**
- Maintain 90-99% of current rankings
- Improve over time due to better structure
- AI discoverability increases
- Faster site = better SEO

**Worst Case (without redirects):**
- Lose 50-70% of traffic initially
- Take 3-6 months to recover
- Lose valuable backlinks
- Drop in rankings

**With This Plan:**
- Expect 5-15% traffic dip for 2-4 weeks
- Recovery within 1-2 months
- Improved rankings after 3 months
- Better long-term trajectory

## Next Steps

1. **Export current site data** (URLs, products, blog posts)
2. **Decide on blog strategy** (subdomain vs migrate)
3. **Create redirect mapping** from old to new URLs
4. **Import products with matching slugs**
5. **Set up staging site to test**
6. **Execute phased migration**

## Tools Needed

- Google Search Console (monitor SEO health)
- Netlify (handles redirects automatically)
- Current Super.so export (get all content)
- Redirect mapping spreadsheet

---

**Bottom Line:** With proper redirects and a phased approach, you can preserve your SEO while upgrading to the new system. The key is matching slugs and implementing comprehensive 301 redirects.
