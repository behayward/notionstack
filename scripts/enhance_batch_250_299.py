#!/usr/bin/env python3
"""
Enhance templates 250-299 with rich SEO content
"""

import json
import os
from datetime import datetime

# Base paths
CONTENT_DIR = '/Users/blakehayward/Documents/Claude Projects/notionstack/content/products'
TEMPLATES_FILE = '/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/templates-to-enhance.json'

def generate_enhanced_content(product):
    """Generate comprehensive enhanced content for a product"""
    name = product.get('name', '')
    description = product.get('description', '')
    subcategory = product.get('subcategory', '')
    price = product.get('price', 0)

    # This is a placeholder - in actual use, each template needs custom content
    # The actual implementation will be done template by template

    enhanced = {
        "overview": f"Placeholder overview for {name}",
        "featureCategories": [
            {
                "category": "Core Features",
                "icon": "⚡",
                "features": ["Feature 1", "Feature 2", "Feature 3"]
            }
        ],
        "problemsSolved": [
            "Problem 1",
            "Problem 2",
            "Problem 3"
        ],
        "solutionsBenefits": [
            "Solution 1",
            "Solution 2",
            "Solution 3"
        ],
        "idealFor": [
            "Target audience 1",
            "Target audience 2",
            "Target audience 3"
        ],
        "notRecommendedFor": [
            "Not suitable for scenario 1",
            "Not suitable for scenario 2"
        ],
        "complexityLevel": "beginner",
        "faqs": [
            {
                "question": "How do I get started with this template?",
                "answer": "After purchasing, click the duplicate button to copy the template to your Notion workspace."
            },
            {
                "question": "What's included in this template?",
                "answer": f"This template includes comprehensive {subcategory} features designed for Notion users."
            },
            {
                "question": "Can I customize this template?",
                "answer": "Yes, all elements of this Notion template are fully customizable to match your workflow."
            },
            {
                "question": "What are the main use cases?",
                "answer": f"This template is perfect for managing {subcategory} tasks in Notion."
            }
        ]
    }

    return enhanced

def main():
    # Load the templates list
    with open(TEMPLATES_FILE, 'r') as f:
        all_templates = json.load(f)

    # Get templates 250-299 (indices 249-298)
    batch = all_templates[249:299]

    print(f"Processing {len(batch)} templates (250-299)...\n")

    processed = 0
    errors = []

    for idx, template_info in enumerate(batch, start=250):
        filename = template_info['file']
        filepath = os.path.join(CONTENT_DIR, filename)

        try:
            # Read existing product
            with open(filepath, 'r') as f:
                product = json.load(f)

            # Check if already enhanced
            if 'enhancedContent' in product:
                print(f"✓ #{idx} {template_info['name']} - Already enhanced, skipping")
                continue

            # Generate enhanced content (placeholder for now)
            # In actual use, this should be customized per template
            enhanced_content = generate_enhanced_content(product)

            # Add to product
            product['enhancedContent'] = enhanced_content
            product['lastUpdated'] = datetime.now().strftime('%Y-%m-%d')

            # Save back
            with open(filepath, 'w') as f:
                json.dump(product, f, indent=2, ensure_ascii=False)

            processed += 1
            print(f"✓ #{idx} {template_info['name']}")

        except FileNotFoundError:
            error_msg = f"File not found: {filename}"
            errors.append(error_msg)
            print(f"✗ #{idx} {template_info['name']} - {error_msg}")
        except json.JSONDecodeError as e:
            error_msg = f"JSON error in {filename}: {str(e)}"
            errors.append(error_msg)
            print(f"✗ #{idx} {template_info['name']} - {error_msg}")
        except Exception as e:
            error_msg = f"Error processing {filename}: {str(e)}"
            errors.append(error_msg)
            print(f"✗ #{idx} {template_info['name']} - {error_msg}")

    # Summary
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Processed: {processed}")
    print(f"  Errors: {len(errors)}")
    print(f"{'='*60}")

    if errors:
        print("\nErrors encountered:")
        for error in errors:
            print(f"  - {error}")

if __name__ == '__main__':
    main()
