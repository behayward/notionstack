# Image Scraper for NotionStack Products

This toolset scrapes product images from Gumroad pages and adds them to the NotionStack product database.

## Files Created

1. **test-image-scraper.js** - Test script (runs 3 products)
2. **scrape-images-batch.js** - Main scraper with batch support
3. **run-image-scraper.sh** - Shell script to run all batches automatically
4. **scrape-product-images.js** - Alternative: process all 205 in one run

## Quick Start

### Option 1: Test First (Recommended)

Test with 3 products to verify everything works:

```bash
node scripts/test-image-scraper.js
```

If successful, proceed to Option 2 or 3.

### Option 2: Run All Batches Automatically

Process all 205 products in 5 batches:

```bash
chmod +x scripts/run-image-scraper.sh
bash scripts/run-image-scraper.sh
```

This will process:
- Batch 1: Products 1-50
- Batch 2: Products 51-100
- Batch 3: Products 101-150
- Batch 4: Products 151-200
- Batch 5: Products 201-205

### Option 3: Run Batches Manually

Process specific batches:

```bash
# Batch 1 (products 1-50)
node scripts/scrape-images-batch.js /path/to/enhanced-products-for-images.json 0 50

# Batch 2 (products 51-100)
node scripts/scrape-images-batch.js /path/to/enhanced-products-for-images.json 50 50

# Continue from where you left off
node scripts/scrape-images-batch.js /path/to/enhanced-products-for-images.json 100 50
```

### Option 4: Run Everything at Once

Process all 205 products in one go (will take ~8-10 minutes):

```bash
node scripts/scrape-product-images.js
```

## What It Does

For each product in `enhanced-products-for-images.json`:

1. **Fetches the Gumroad page** from the product URL
2. **Extracts the `og:image` URL** from the HTML meta tags
3. **Downloads the image** to `/public/images/products/{slug}.{ext}`
4. **Updates the product JSON** file in `/content/products/`:
   - Adds `"imageUrl": "/images/products/{slug}.{ext}"`
   - Updates `"lastUpdated"` to current date

## Rate Limiting

- **Delay:** 1.5 seconds between requests
- **Estimated time:** ~8-10 minutes for all 205 products
- **Timeout:** 10 seconds for page fetch, 30 seconds for image download

## Error Handling

Errors are logged to: `scripts/image-scrape-errors.log`

Common errors:
- `HTTP 404` - Page not found
- `No og:image found` - Page doesn't have OpenGraph image
- `Timeout` - Request took too long
- `Download timeout` - Image download took too long

## Progress Tracking

The batch scraper saves progress to: `scripts/image-scrape-progress.json`

Contains:
```json
{
  "lastIndex": 99,
  "totalProcessed": 100,
  "totalProducts": 205,
  "successCount": 95,
  "errorCount": 5,
  "timestamp": "2026-01-24T12:00:00.000Z"
}
```

## Output Files

### Images
- Location: `/public/images/products/`
- Format: `{slug}.{ext}` (e.g., `habit-tracker.jpg`)
- Extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

### Updated Product JSONs
- Location: `/content/products/`
- Changes:
  - Added `imageUrl` field
  - Updated `lastUpdated` field

## Example

Before:
```json
{
  "slug": "habit-tracker",
  "name": "Habit Tracker",
  "file": "habit-tracker.json",
  "url": "https://gumroad.com/a/962870099/xyz"
}
```

After scraping:
```json
{
  "slug": "habit-tracker",
  "name": "Habit Tracker",
  "file": "habit-tracker.json",
  "url": "https://gumroad.com/a/962870099/xyz",
  "imageUrl": "/images/products/habit-tracker.jpg",
  "lastUpdated": "2026-01-24"
}
```

And the image file exists at:
```
/public/images/products/habit-tracker.jpg
```

## Troubleshooting

### Script won't run
```bash
# Make sure you're in the project root
cd /Users/blakehayward/Documents/Claude\ Projects/notionstack

# Install dependencies (if needed)
npm install

# Test with node directly
node scripts/test-image-scraper.js
```

### Permission denied
```bash
chmod +x scripts/run-image-scraper.sh
chmod +x scripts/scrape-images-batch.js
chmod +x scripts/test-image-scraper.js
```

### High error rate
- Check if Gumroad is blocking requests (429 errors)
- Increase delay between requests in the script
- Run smaller batches

## Success Metrics

Target: **150+ successful downloads out of 205**

Expected success rate: **70-85%**

Common reasons for failures:
- Product pages removed/redirected
- Missing og:image tags on some pages
- Network timeouts
- Rate limiting

## Next Steps After Scraping

1. Check error log: `cat scripts/image-scrape-errors.log`
2. Review failed products and handle manually if needed
3. Commit changes: `git add content/products/ public/images/products/`
4. Verify images display correctly on the site
