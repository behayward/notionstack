#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const templatesFile = path.join(process.cwd(), 'scripts/templates-to-enhance.json');
const templates = JSON.parse(fs.readFileSync(templatesFile, 'utf-8'));

// Get batch range from command line args
const startIdx = parseInt(process.argv[2]) || 0;
const endIdx = parseInt(process.argv[3]) || Math.min(startIdx + 50, templates.length);

console.log(`\nProcessing templates ${startIdx + 1} to ${endIdx}...`);

async function generateEnhancedContent(template) {
  const prompt = `You are a Notion template expert creating SEO-optimized product descriptions for a Notion template directory.

Template Details:
- Name: ${template.name}
- Price: $${template.price}
- Category: ${template.subcategory || 'general'}
- Description: ${template.description}

Generate a comprehensive JSON object with the following structure (return ONLY valid JSON, no markdown):

{
  "overview": "2-3 paragraph detailed overview explaining what this template does, who it's for, and its unique value. Focus on Notion-specific benefits.",
  "featureCategories": [
    {
      "category": "Category Name",
      "icon": "emoji",
      "features": ["feature 1", "feature 2", "feature 3"]
    }
  ],
  "problemsSolved": [
    "Problem statement 1",
    "Problem statement 2",
    "Problem statement 3"
  ],
  "solutionsBenefits": [
    "How this template solves problem 1",
    "How this template solves problem 2",
    "How this template solves problem 3"
  ],
  "idealFor": [
    "Target audience 1 with specific use case",
    "Target audience 2 with specific use case",
    "Target audience 3 with specific use case"
  ],
  "notRecommendedFor": [
    "Who shouldn't use this and why",
    "Another mismatch scenario"
  ],
  "complexityLevel": "beginner|intermediate|advanced",
  "faqs": [
    {
      "question": "How does this integrate with Notion?",
      "answer": "Specific answer about Notion integration"
    },
    {
      "question": "What's the setup time?",
      "answer": "Realistic time estimate"
    },
    {
      "question": "Is there a free plan?",
      "answer": "Answer about pricing/free options"
    },
    {
      "question": "What are the main use cases?",
      "answer": "Specific use case examples"
    }
  ]
}

Guidelines:
- Be specific and actionable
- Focus on Notion-specific features
- Use natural, conversational language
- Avoid generic marketing speak
- Make it SEO-friendly with relevant keywords`;

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = message.content[0].text;
    // Extract JSON from response (in case it's wrapped in markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`Error for ${template.name}:`, error.message);
    return null;
  }
}

async function processBatch() {
  const batch = templates.slice(startIdx, endIdx);
  let processed = 0;
  let failed = 0;

  for (const template of batch) {
    console.log(`\n[${processed + 1}/${batch.length}] Processing: ${template.name}`);

    const enhancedContent = await generateEnhancedContent(template);

    if (enhancedContent) {
      // Load the full product JSON
      const productPath = path.join(process.cwd(), 'content/products', template.file);
      const product = JSON.parse(fs.readFileSync(productPath, 'utf-8'));

      // Add enhanced content
      product.enhancedContent = enhancedContent;
      product.lastUpdated = new Date().toISOString();

      // Save back to file
      fs.writeFileSync(productPath, JSON.stringify(product, null, 2));

      processed++;
      console.log(`✓ Enhanced: ${template.name}`);
    } else {
      failed++;
      console.log(`✗ Failed: ${template.name}`);
    }

    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n\nBatch Complete:`);
  console.log(`✓ Processed: ${processed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`📊 Total in batch: ${batch.length}`);
}

processBatch().catch(console.error);
