import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Enhanced Gumroad Scraper
 * Extracts: ratings, images, reviews, features, description
 * Does NOT copy content verbatim - stores raw for AI processing
 */

async function scrapeGumroadProduct(url) {
  try {
    console.log(`Scraping: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`HTTP ${response.status} for ${url}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract star rating (1-5 scale)
    let starRating = null;
    const ratingText = $('div[class*="rating"], span[class*="rating"], .product-rating').text();
    const ratingMatch = ratingText.match(/(\d+\.?\d*)\s*(?:stars?|\/5)/i);
    if (ratingMatch) {
      starRating = parseFloat(ratingMatch[1]);
    }

    // Alternative: Look for filled stars
    if (!starRating) {
      const filledStars = $('svg[class*="star-filled"], .star.filled, [class*="icon-star-filled"]').length;
      if (filledStars > 0) {
        starRating = filledStars;
      }
    }

    // Extract review count
    let reviewCount = null;
    const reviewText = $('div[class*="review"], span[class*="review"], .reviews-count').text();
    const reviewMatch = reviewText.match(/(\d+)\s*reviews?/i);
    if (reviewMatch) {
      reviewCount = parseInt(reviewMatch[1]);
    }

    // Extract og:image
    let ogImage = $('meta[property="og:image"]').attr('content');
    if (!ogImage) {
      ogImage = $('meta[name="twitter:image"]').attr('content');
    }

    // Extract product description (raw - for AI processing)
    const description = $('meta[property="og:description"]').attr('content') ||
                       $('meta[name="description"]').attr('content') || '';

    // Extract feature list (raw - for AI processing)
    const features = [];
    $('ul li, .features li, [class*="feature-item"]').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text && text.length > 10 && text.length < 200) {
        features.push(text);
      }
    });

    // Extract review quotes (top 3)
    const reviewQuotes = [];
    $('[class*="review-text"], .review-content, [class*="testimonial"]').each((i, elem) => {
      if (reviewQuotes.length >= 3) return;
      const text = $(elem).text().trim();
      if (text && text.length > 20 && text.length < 500) {
        reviewQuotes.push(text);
      }
    });

    // Extract last updated date
    let lastUpdated = null;
    const dateText = $('[class*="updated"], [class*="modified"], time[datetime]').first();
    if (dateText.length) {
      const datetime = dateText.attr('datetime') || dateText.text();
      lastUpdated = datetime.trim();
    }

    // Extract sales count
    let salesCount = null;
    const salesText = $('[class*="sales"], [class*="sold"]').text();
    const salesMatch = salesText.match(/(\d+)\s*(?:sales?|sold)/i);
    if (salesMatch) {
      salesCount = parseInt(salesMatch[1]);
    }

    return {
      starRating,
      reviewCount,
      ogImage,
      salesCount,
      lastUpdated,
      rawData: {
        description,
        features: features.slice(0, 10), // Limit to 10 features
        reviewQuotes: reviewQuotes.slice(0, 3)
      }
    };

  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return null;
  }
}

async function processAllProducts() {
  console.log('Starting enhanced Gumroad scraping...\n');

  const productsDir = join(process.cwd(), 'content/products');
  const files = await readFile(productsDir);

  // Read consolidated products data
  const consolidatedPath = join(process.cwd(), 'data/consolidated-products-v2.json');
  const consolidatedData = JSON.parse(await readFile(consolidatedPath, 'utf-8'));

  const results = {
    processed: 0,
    updated: 0,
    failed: 0,
    skipped: 0
  };

  // Process in batches to avoid rate limiting
  const batchSize = 5;
  const delayMs = 2000; // 2 seconds between requests

  for (let i = 0; i < consolidatedData.length; i += batchSize) {
    const batch = consolidatedData.slice(i, i + batchSize);

    await Promise.all(batch.map(async (product) => {
      results.processed++;

      // Only scrape Gumroad products with URLs
      if (!product.url || !product.url.includes('gumroad.com')) {
        results.skipped++;
        return;
      }

      // Skip if already has good data (rating > 0 and has image)
      if (product.rating > 0 && product.rating <= 5 && product.image) {
        results.skipped++;
        return;
      }

      const scrapedData = await scrapeGumroadProduct(product.url);

      if (scrapedData) {
        // Update product with scraped data
        if (scrapedData.starRating) {
          product.rating = scrapedData.starRating;
        }
        if (scrapedData.reviewCount) {
          product.ratingCount = scrapedData.reviewCount;
        }
        if (scrapedData.ogImage) {
          product.image = scrapedData.ogImage;
        }
        if (scrapedData.salesCount) {
          product.salesCount = scrapedData.salesCount;
        }
        if (scrapedData.lastUpdated) {
          product.lastVerified = scrapedData.lastUpdated;
        }

        // Store raw data for AI enhancement
        product.rawData = scrapedData.rawData;

        results.updated++;
        console.log(`✓ Updated: ${product.name} (${product.rating}/5, ${product.ratingCount} reviews)`);
      } else {
        results.failed++;
        console.log(`✗ Failed: ${product.name}`);
      }

      // Progress indicator
      if (results.processed % 50 === 0) {
        console.log(`\nProgress: ${results.processed}/${consolidatedData.length}`);
        console.log(`Updated: ${results.updated} | Failed: ${results.failed} | Skipped: ${results.skipped}\n`);
      }
    }));

    // Delay between batches
    if (i + batchSize < consolidatedData.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // Save updated data
  await writeFile(
    consolidatedPath,
    JSON.stringify(consolidatedData, null, 2)
  );

  console.log('\n=== Scraping Complete ===');
  console.log(`Total processed: ${results.processed}`);
  console.log(`Successfully updated: ${results.updated}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Skipped: ${results.skipped}`);

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    stats: results,
    productsWithRatings: consolidatedData.filter(p => p.rating > 0 && p.rating <= 5).length,
    productsWithImages: consolidatedData.filter(p => p.image).length,
    productsWithReviews: consolidatedData.filter(p => p.ratingCount > 0).length
  };

  await writeFile(
    join(process.cwd(), 'data/scraping-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\nProducts with valid ratings: ${report.productsWithRatings}`);
  console.log(`Products with images: ${report.productsWithImages}`);
  console.log(`Products with reviews: ${report.productsWithReviews}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  processAllProducts().catch(console.error);
}

export { scrapeGumroadProduct, processAllProducts };
