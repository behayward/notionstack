import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * AI Content Enhancement Pipeline
 * Transforms raw Gumroad data into NotionStack's superior structure
 * Uses Claude to generate unique, AI-optimized content
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
    console.error(`Error enhancing ${product.name}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function processAllProducts(limit = null) {
  console.log('Starting AI content enhancement...\n');

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY environment variable not set');
    console.log('Set it with: export ANTHROPIC_API_KEY=your_key_here');
    process.exit(1);
  }

  // Read consolidated products data
  const consolidatedPath = join(process.cwd(), 'data/consolidated-products-v2.json');
  const consolidatedData = JSON.parse(await readFile(consolidatedPath, 'utf-8'));

  // Filter to products that need enhancement
  const toProcess = consolidatedData.filter(p =>
    !p.enhancedContent &&
    p.rawData?.description
  );

  console.log(`Found ${toProcess.length} products needing enhancement`);

  if (limit) {
    console.log(`Processing first ${limit} products (limit set)`);
    toProcess.splice(limit);
  }

  const results = {
    processed: 0,
    enhanced: 0,
    failed: 0,
    skipped: 0
  };

  // Process sequentially to avoid rate limits
  for (const product of toProcess) {
    results.processed++;

    console.log(`\nProcessing ${results.processed}/${toProcess.length}: ${product.name}`);

    const result = await enhanceProduct(product);

    if (result.success) {
      // Add enhanced content to product
      product.enhancedContent = result.enhancedContent;
      results.enhanced++;
      console.log(`✓ Enhanced successfully`);
    } else {
      results.failed++;
      console.log(`✗ Failed: ${result.error}`);
    }

    // Save progress every 10 products
    if (results.processed % 10 === 0) {
      await writeFile(
        consolidatedPath,
        JSON.stringify(consolidatedData, null, 2)
      );
      console.log(`\n💾 Progress saved (${results.processed}/${toProcess.length})`);
    }

    // Rate limiting: 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Final save
  await writeFile(
    consolidatedPath,
    JSON.stringify(consolidatedData, null, 2)
  );

  console.log('\n=== Enhancement Complete ===');
  console.log(`Total processed: ${results.processed}`);
  console.log(`Successfully enhanced: ${results.enhanced}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Skipped: ${results.skipped}`);

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    stats: results,
    productsEnhanced: consolidatedData.filter(p => p.enhancedContent).length
  };

  await writeFile(
    join(process.cwd(), 'data/enhancement-report.json'),
    JSON.stringify(report, null, 2)
  );
}

// Parse command line arguments
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  processAllProducts(limit).catch(console.error);
}

export { enhanceProduct, processAllProducts };
