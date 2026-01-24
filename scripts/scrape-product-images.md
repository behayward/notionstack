# Product Image Scraping Task

## Objective
Scrape product images from Gumroad for 205 enhanced products and save them locally.

## Input File
`/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/enhanced-products-for-images.json`

Contains array of objects with:
- `slug`: Product slug (for filename)
- `url`: Gumroad product URL
- `name`: Product name
- `file`: JSON filename
- `platform`: Usually "gumroad"

## Process for Each Product

1. Navigate to the product URL
2. Look for the Open Graph image meta tag: `<meta property="og:image" content="...">`
3. Download the image from the og:image URL
4. Save to: `/Users/blakehayward/Documents/Claude Projects/notionstack/public/images/products/{slug}.jpg`
5. Update the product JSON file to add: `"imageUrl": "/images/products/{slug}.jpg"`
6. Handle errors gracefully:
   - If page doesn't load: skip and log
   - If no og:image found: skip and log
   - If download fails: skip and log

## Success Criteria
- At least 150+ images successfully downloaded (75%+ success rate)
- Product JSON files updated with local image paths
- Images saved to correct directory
- Error log of any failures

## Notes
- Some products may have been deleted or moved from Gumroad
- Image formats may vary (jpg, png, webp) - save as original format
- Rate limit: Add 1-2 second delay between requests to be respectful
