import { enhanceProduct } from './enhance-content-ai.js';

// Test with a sample product
const testProduct = {
  name: "2026 Notion Gratitude Journal",
  category: "template",
  subcategory: "journal",
  description: "A comprehensive gratitude journal template for Notion",
  rawData: {
    description: "Take control of your 2026 resolutions with the following features: Beautiful & mobile-friendly design. Conveniently pre-filled dates. 266 inspiring community-submitted wellness tips. Insightful weekly, monthly & quarterly automated mood summaries. Daily, Weekly, Monthly, and Quarterly Planner Templates. Memory Box with trackers for Wins, Adventures, TV/Film, Books, and Music. Sleep tracker with charts and automated summaries. Mood tracker with charts. Portable quick-journal widget and bookmark. Mood-boosting Happiness Station. Customizable with GIF stickers and quote widget.",
    features: [
      "Beautiful & mobile-friendly design",
      "Conveniently pre-filled dates",
      "266 inspiring community-submitted wellness tips",
      "Insightful weekly, monthly & quarterly automated mood summaries",
      "Daily Planner Notion Template",
      "Weekly Planner Notion Template",
      "Monthly Planner Notion Template",
      "Quarterly Planner Notion Template",
      "Memory Box with multiple trackers",
      "Sleep tracker + charts"
    ],
    reviewQuotes: []
  }
};

console.log('Testing AI Enhancement...\n');
console.log(`Product: ${testProduct.name}\n`);

const result = await enhanceProduct(testProduct);

if (result.success) {
  console.log('✓ Enhancement successful!\n');
  console.log('Generated Content:');
  console.log(JSON.stringify(result.enhancedContent, null, 2));
} else {
  console.log('✗ Enhancement failed:', result.error);
}
