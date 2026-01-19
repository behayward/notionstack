import Anthropic from '@anthropic-ai/sdk';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * AI Content Enhancement for Individual Product Files
 * Enhances top products with AI-generated structured content
 */

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const ENHANCEMENT_PROMPT = `You are a product content specialist creating enhanced product descriptions for an AI-optimized Notion template directory.

CRITICAL RULES:
1. NEVER copy descriptions verbatim from the source
2. Rewrite and enhance ALL content in your own words
3. Structure information for AI agent consumption
4. Focus on problem/solution framing
5. Extract targetable metadata

Given this raw product data, generate enhanced content following this exact structure:

INPUT DATA:
Name: {name}
Category: {category}
Subcategory: {subcategory}
Raw Description: {description}
Raw Features: {features}
Review Quotes: {reviewQuotes}

OUTPUT (valid JSON only):
{
  "overview": "2-3 sentence rewritten summary. What is it? Who for? Main benefit?",
  "featureCategories": [
    {
      "category": "Category name (e.g., 'Project Management')",
      "icon": "Emoji icon",
      "features": ["Feature 1", "Feature 2", "Feature 3"]
    }
  ],
  "problemsSolved": [
    "Problem 1 users face",
    "Problem 2 users face",
    "Problem 3 users face"
  ],
  "solutionsBenefits": [
    "Benefit 1 this template provides",
    "Benefit 2 this template provides",
    "Benefit 3 this template provides"
  ],
  "idealFor": [
    "User type 1",
    "User type 2",
    "User type 3"
  ],
  "notRecommendedFor": [
    "User type 1 (reason)",
    "User type 2 (reason)"
  ],
  "complexityLevel": "beginner|intermediate|advanced",
  "whatsIncluded": [
    "Deliverable 1",
    "Deliverable 2",
    "Deliverable 3"
  ],
  "faqs": [
    {
      "question": "Can I customize this template?",
      "answer": "Specific answer based on the product"
    },
    {
      "question": "Do I need Notion AI to use this?",
      "answer": "Yes/No and details"
    },
    {
      "question": "How complex is the setup?",
      "answer": "Complexity assessment"
    },
    {
      "question": "Is this updated for 2026?",
      "answer": "Yes/No and version info"
    },
    {
      "question": "What if I need help?",
      "answer": "Support availability"
    }
  ]
}

IMPORTANT:
- Rewrite everything in your own words
- Make content more structured and scannable than source
- Extract implicit information (target audience, problems solved)
- Generate helpful FAQs even if not in source
- Be specific and concrete
- Return ONLY valid JSON, no other text`;

async function scoreProduct(product) {
  let score = 0;
  if (product.hasAffiliate) score += 100;
  if (product.price > 0) score += 50;
  if (product.rating && product.rating >= 4.0) score += product.rating * 10;
  if (product.salesCount) score += product.salesCount * 0.5;
  return score;
}

async function enhanceProduct(product) {
  try {
    // Build prompt with product data
    const prompt = ENHANCEMENT_PROMPT
      .replace('{name}', product.name)
      .replace('{category}', product.category || 'template')
      .replace('{subcategory}', product.subcategory || 'general')
      .replace('{description}', product.rawData?.description || product.description || '')
      .replace('{features}', JSON.stringify(product.rawData?.features || []))
      .replace('{reviewQuotes}', JSON.stringify(product.rawData?.reviewQuotes || []));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract JSON from response
    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }

    const enhancedContent = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      enhancedContent
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function enhanceTopProducts(limit = 100) {
  console.log('AI Enhancement Pipeline - Top Products\n');

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY not found in environment');
    console.log('Make sure .env file exists with your API key');
    process.exit(1);
  }

  console.log('✓ API key loaded');
  console.log(`Target: Top ${limit} products\n`);

  // Load all products
  const productsDir = join(process.cwd(), 'content/products');
  const files = await readdir(productsDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));

  console.log(`Found ${jsonFiles.length} total products`);

  const products = [];
  for (const file of jsonFiles) {
    const filePath = join(productsDir, file);
    const product = JSON.parse(await readFile(filePath, 'utf-8'));
    product._filePath = filePath;
    product._fileName = file;
    products.push(product);
  }

  // Score and sort products
  for (const product of products) {
    product._score = await scoreProduct(product);
  }

  products.sort((a, b) => b._score - a._score);

  // Get top N products that need enhancement
  const topProducts = products
    .filter(p => !p.enhancedContent && p.rawData?.description)
    .slice(0, limit);

  console.log(`Products needing enhancement: ${topProducts.length}\n`);

  if (topProducts.length === 0) {
    console.log('No products need enhancement!');
    return;
  }

  const stats = {
    processed: 0,
    enhanced: 0,
    failed: 0,
    skipped: 0
  };

  // Process each product
  for (const product of topProducts) {
    stats.processed++;

    console.log(`\n[${stats.processed}/${topProducts.length}] ${product.name}`);
    console.log(`  Score: ${product._score.toFixed(1)} | Rating: ${product.rating || 'N/A'} | Price: $${product.price}`);

    try {
      const result = await enhanceProduct(product);

      if (result.success) {
        // Add enhanced content to product
        product.enhancedContent = result.enhancedContent;
        product.lastUpdated = new Date().toISOString();

        // Clean metadata
        const filePath = product._filePath;
        delete product._filePath;
        delete product._fileName;
        delete product._score;

        // Save enhanced product
        await writeFile(
          filePath,
          JSON.stringify(product, null, 2)
        );

        stats.enhanced++;
        console.log(`  ✓ Enhanced and saved`);
      } else {
        stats.failed++;
        console.log(`  ✗ Failed: ${result.error}`);
      }

      // Rate limiting: 1 second between API calls
      if (stats.processed < topProducts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
      stats.failed++;
    }

    // Progress checkpoint every 10 products
    if (stats.processed % 10 === 0) {
      console.log(`\n💾 Checkpoint: ${stats.processed}/${topProducts.length} processed`);
    }
  }

  console.log('\n=== Enhancement Complete ===');
  console.log(`Total processed: ${stats.processed}`);
  console.log(`Successfully enhanced: ${stats.enhanced}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Skipped: ${stats.skipped}`);

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    stats,
    limit,
    productsEnhanced: stats.enhanced
  };

  await writeFile(
    join(process.cwd(), 'data/enhancement-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n📊 Report saved to data/enhancement-report.json');
}

// Parse command line arguments
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 100;

enhanceTopProducts(limit).catch(console.error);
