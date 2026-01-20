#!/usr/bin/env python3
"""
Enhance templates 350-399 with comprehensive SEO-optimized content.
This script processes templates from templates-to-enhance.json and adds enhanced content to each.
"""

import json
import os
from datetime import date
from anthropic import Anthropic

# Configuration
SCRIPT_DIR = "/Users/blakehayward/Documents/Claude Projects/notionstack/scripts"
PRODUCTS_DIR = "/Users/blakehayward/Documents/Claude Projects/notionstack/content/products"
TEMPLATES_FILE = os.path.join(SCRIPT_DIR, "templates-to-enhance.json")
BATCH_START = 349  # 0-indexed (template #350)
BATCH_END = 399    # 0-indexed (template #399)
TODAY = str(date.today())

# Initialize Anthropic client
client = Anthropic()

def generate_enhanced_content(product_data):
    """Generate enhanced content for a product using Claude API."""

    prompt = f"""Generate comprehensive enhanced content for this Notion template product.

Product Details:
- Name: {product_data.get('name', 'Unknown')}
- Description: {product_data.get('description', 'No description')}
- Category: {product_data.get('category', 'template')}
- Subcategory: {product_data.get('subcategory', 'general')}
- Price: ${product_data.get('price', 0)}

Create a JSON object with this exact structure:

{{
  "overview": "2-3 paragraphs explaining what this template does, who it's for, and unique value for Notion users",
  "featureCategories": [
    {{
      "category": "Category Name",
      "icon": "emoji",
      "features": ["specific feature 1", "specific feature 2", "specific feature 3"]
    }}
  ],
  "problemsSolved": [
    "Specific problem this template solves",
    "Another problem it addresses",
    "Third pain point it eliminates"
  ],
  "solutionsBenefits": [
    "How the template solves problem 1",
    "How it solves problem 2",
    "How it solves problem 3"
  ],
  "idealFor": [
    "Target audience 1 with specific use case",
    "Target audience 2 with specific use case",
    "Target audience 3 with specific use case",
    "Target audience 4"
  ],
  "notRecommendedFor": [
    "Who shouldn't use this and why",
    "Another mismatch scenario"
  ],
  "complexityLevel": "beginner|intermediate|advanced",
  "faqs": [
    {{
      "question": "How do I get started with this template?",
      "answer": "Specific answer about setup/getting started"
    }},
    {{
      "question": "What's included in this template?",
      "answer": "List key components"
    }},
    {{
      "question": "Can I customize this template?",
      "answer": "Answer about customization"
    }},
    {{
      "question": "What are the main use cases?",
      "answer": "Specific use case examples"
    }}
  ]
}}

Guidelines:
- Be specific and actionable, not generic
- Focus on Notion-specific benefits
- Use natural, conversational language
- Make it SEO-friendly with relevant keywords
- Include 3-4 feature categories with 3-5 features each
- Keep FAQ answers concise but informative (2-4 sentences)

Return ONLY the JSON object, no additional text."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )

        # Extract JSON from response
        content = message.content[0].text
        # Clean up any markdown code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        return json.loads(content)

    except Exception as e:
        print(f"  Error generating content: {e}")
        return None


def enhance_product(template_info, index):
    """Enhance a single product with enhanced content."""

    filename = template_info['file']
    product_path = os.path.join(PRODUCTS_DIR, filename)

    print(f"\n[{index}] Processing: {template_info['name']}")
    print(f"    File: {filename}")

    # Check if file exists
    if not os.path.exists(product_path):
        print(f"    ❌ File not found: {product_path}")
        return False

    # Load existing product data
    try:
        with open(product_path, 'r') as f:
            product_data = json.load(f)
    except Exception as e:
        print(f"    ❌ Error loading product: {e}")
        return False

    # Check if already enhanced
    if 'enhancedContent' in product_data:
        print(f"    ⏭️  Already enhanced, skipping...")
        return True

    # Generate enhanced content
    print(f"    🤖 Generating enhanced content...")
    enhanced_content = generate_enhanced_content(product_data)

    if not enhanced_content:
        print(f"    ❌ Failed to generate content")
        return False

    # Add enhanced content to product
    product_data['enhancedContent'] = enhanced_content
    product_data['lastUpdated'] = TODAY

    # Save updated product
    try:
        with open(product_path, 'w') as f:
            json.dump(product_data, f, indent=2, ensure_ascii=False)
        print(f"    ✅ Enhanced and saved successfully!")
        return True
    except Exception as e:
        print(f"    ❌ Error saving product: {e}")
        return False


def main():
    """Main execution function."""

    print("=" * 70)
    print("NOTIONSTACK TEMPLATE ENHANCEMENT - BATCH 350-399")
    print("=" * 70)

    # Load templates list
    print(f"\nLoading templates from: {TEMPLATES_FILE}")
    try:
        with open(TEMPLATES_FILE, 'r') as f:
            all_templates = json.load(f)
    except Exception as e:
        print(f"❌ Error loading templates file: {e}")
        return

    # Get batch
    batch = all_templates[BATCH_START:BATCH_END]
    print(f"Loaded {len(all_templates)} total templates")
    print(f"Processing batch: templates {BATCH_START + 1} to {BATCH_END}")
    print(f"Batch size: {len(batch)} templates")

    # Process each template
    success_count = 0
    skip_count = 0
    error_count = 0

    for i, template in enumerate(batch, start=BATCH_START + 1):
        result = enhance_product(template, i)
        if result:
            if 'enhancedContent' in json.load(open(os.path.join(PRODUCTS_DIR, template['file']))):
                success_count += 1
            else:
                skip_count += 1
        else:
            error_count += 1

    # Summary
    print("\n" + "=" * 70)
    print("ENHANCEMENT COMPLETE")
    print("=" * 70)
    print(f"✅ Successfully enhanced: {success_count}")
    print(f"⏭️  Skipped (already done): {skip_count}")
    print(f"❌ Errors: {error_count}")
    print(f"📊 Total processed: {len(batch)}")
    print("=" * 70)


if __name__ == "__main__":
    main()
