import Anthropic from '@anthropic-ai/sdk';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * AI Content Enhancement for Tool Files
 * Enhances Notion tools with AI-generated structured content
 */

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const TOOL_ENHANCEMENT_PROMPT = `You are a SaaS tool content specialist creating enhanced tool descriptions for an AI-optimized Notion tools directory.

CRITICAL RULES:
1. NEVER copy descriptions verbatim from the source
2. Rewrite and enhance ALL content in your own words
3. Structure information for AI agent consumption
4. Focus on problem/solution framing for Notion users
5. Extract targetable metadata

Given this raw tool data, generate enhanced content following this exact structure:

INPUT DATA:
Name: {name}
Category: {category}
Subcategory: {subcategory}
Tagline: {tagline}
Raw Description: {description}
Raw Features: {features}
Use Cases: {useCases}
Integration Method: {integrationMethod}

OUTPUT (valid JSON only):
{
  "overview": "2-3 paragraph rewritten summary. Start with what it is and its core purpose for Notion users. Explain how it works with Notion. Conclude with the main benefit or value proposition. Use clear, conversational language.",
  "featureCategories": [
    {
      "category": "Category name (e.g., 'Notion Integration')",
      "icon": "Emoji icon",
      "features": ["Feature 1", "Feature 2", "Feature 3"]
    }
  ],
  "problemsSolved": [
    "Specific problem Notion users face",
    "Another pain point this solves",
    "Third problem addressed"
  ],
  "solutionsBenefits": [
    "How this tool solves problem 1",
    "Benefit from solving problem 2",
    "Value from addressing problem 3"
  ],
  "idealFor": [
    "Specific user type 1 (e.g., 'Marketing teams managing campaigns in Notion')",
    "User type 2",
    "User type 3"
  ],
  "notRecommendedFor": [
    "User type 1 (specific reason)",
    "User type 2 (specific reason)"
  ],
  "complexityLevel": "beginner|intermediate|advanced",
  "faqs": [
    {
      "question": "How does this integrate with Notion?",
      "answer": "Specific answer about integration method and setup"
    },
    {
      "question": "What's the setup time?",
      "answer": "Realistic time estimate and complexity"
    },
    {
      "question": "Is there a free plan?",
      "answer": "Pricing information and free tier details"
    },
    {
      "question": "What are the main use cases for Notion users?",
      "answer": "Specific examples relevant to Notion workflows"
    }
  ]
}

IMPORTANT:
- Rewrite everything in your own words
- Make overview engaging and informative (2-3 paragraphs, not just 2-3 sentences)
- Focus on Notion-specific use cases and benefits
- Be specific about how the integration works
- Generate helpful FAQs that Notion users would actually ask
- Assess complexity realistically (beginner = easy setup, intermediate = some config, advanced = technical setup)
- Return ONLY valid JSON, no other text`;

async function scoreTool(tool) {
  let score = 0;
  if (tool.hasAffiliate) score += 100;
  if (tool.pricing === 'freemium') score += 30;
  if (tool.pricing === 'free') score += 20;
  if (tool.rating && tool.rating >= 4.0) score += tool.rating * 10;
  if (tool.integrationMethod === 'native') score += 50;
  if (tool.integrationMethod === 'zapier' || tool.integrationMethod === 'api') score += 30;
  return score;
}

async function enhanceTool(tool) {
  try {
    // Build prompt with tool data
    const prompt = TOOL_ENHANCEMENT_PROMPT
      .replace('{name}', tool.name)
      .replace('{category}', tool.category || 'tool')
      .replace('{subcategory}', tool.subcategory || 'general')
      .replace('{tagline}', tool.tagline || '')
      .replace('{description}', tool.rawData?.description || tool.description || '')
      .replace('{features}', JSON.stringify(tool.rawData?.features || tool.features || []))
      .replace('{useCases}', JSON.stringify(tool.useCases || []))
      .replace('{integrationMethod}', tool.integrationMethod || 'unknown');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
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

async function enhanceTools(limit = null) {
  console.log('AI Enhancement Pipeline - Notion Tools\n');

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY not found in environment');
    console.log('Make sure .env file exists with your API key');
    process.exit(1);
  }

  console.log('✓ API key loaded');
  if (limit) {
    console.log(`Target: Top ${limit} tools\n`);
  } else {
    console.log('Target: All tools\n');
  }

  // Load all tools
  const toolsDir = join(process.cwd(), 'content/tools');
  const files = await readdir(toolsDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));

  console.log(`Found ${jsonFiles.length} total tools`);

  const tools = [];
  for (const file of jsonFiles) {
    const filePath = join(toolsDir, file);
    const tool = JSON.parse(await readFile(filePath, 'utf-8'));
    tool._filePath = filePath;
    tool._fileName = file;
    tools.push(tool);
  }

  // Score and sort tools
  for (const tool of tools) {
    tool._score = await scoreTool(tool);
  }

  tools.sort((a, b) => b._score - a._score);

  // Get tools that need enhancement
  let toolsToEnhance = tools.filter(t => !t.enhancedContent);

  if (limit) {
    toolsToEnhance = toolsToEnhance.slice(0, limit);
  }

  console.log(`Tools needing enhancement: ${toolsToEnhance.length}\n`);

  if (toolsToEnhance.length === 0) {
    console.log('No tools need enhancement!');
    return;
  }

  const stats = {
    processed: 0,
    enhanced: 0,
    failed: 0,
    skipped: 0
  };

  // Process each tool
  for (const tool of toolsToEnhance) {
    stats.processed++;

    console.log(`\n[${stats.processed}/${toolsToEnhance.length}] ${tool.name}`);
    console.log(`  Score: ${tool._score.toFixed(1)} | Category: ${tool.category} | Integration: ${tool.integrationMethod}`);

    try {
      const result = await enhanceTool(tool);

      if (result.success) {
        // Add enhanced content to tool
        tool.enhancedContent = result.enhancedContent;
        tool.lastUpdated = new Date().toISOString();

        // Clean metadata
        const filePath = tool._filePath;
        delete tool._filePath;
        delete tool._fileName;
        delete tool._score;

        // Save enhanced tool
        await writeFile(
          filePath,
          JSON.stringify(tool, null, 2)
        );

        stats.enhanced++;
        console.log(`  ✓ Enhanced and saved`);
      } else {
        stats.failed++;
        console.log(`  ✗ Failed: ${result.error}`);
      }

      // Rate limiting: 1 second between API calls
      if (stats.processed < toolsToEnhance.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
      stats.failed++;
    }

    // Progress checkpoint every 10 tools
    if (stats.processed % 10 === 0) {
      console.log(`\n💾 Checkpoint: ${stats.processed}/${toolsToEnhance.length} processed`);
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
    toolsEnhanced: stats.enhanced
  };

  await writeFile(
    join(process.cwd(), 'data/tools-enhancement-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n📊 Report saved to data/tools-enhancement-report.json');
}

// Parse command line arguments
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

enhanceTools(limit).catch(console.error);
