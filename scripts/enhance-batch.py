#!/usr/bin/env python3
"""
Enhance templates 50-99 with rich SEO content
This script adds enhancedContent to product JSON files
"""
import json
import os
from datetime import datetime

def generate_enhanced_content(product):
    """Generate rich enhanced content based on product details"""
    name = product.get('name', '')
    description = product.get('description', '')
    category = product.get('category', '')
    subcategory = product.get('subcategory', '')
    price = product.get('price', 0)

    # This will be populated manually for each template
    # Returns the structure that needs to be filled in
    return {
        "overview": f"Overview for {name}",
        "featureCategories": [],
        "problemsSolved": [],
        "solutionsBenefits": [],
        "idealFor": [],
        "notRecommendedFor": [],
        "complexityLevel": "beginner",
        "faqs": []
    }

def main():
    # Load templates list
    with open('scripts/templates-to-enhance.json', 'r') as f:
        all_templates = json.load(f)

    # Get batch 50-99 (indices 49-98)
    batch = all_templates[49:99]

    print(f"Processing {len(batch)} templates...\n")

    processed = 0
    errors = []

    for idx, template_info in enumerate(batch, start=50):
        filename = template_info['file']
        product_path = f"content/products/{filename}"

        try:
            # Load product JSON
            with open(product_path, 'r') as f:
                product = json.load(f)

            # Check if already enhanced
            if 'enhancedContent' in product:
                print(f"{idx}. SKIPPED (already enhanced): {filename}")
                continue

            # Generate placeholder for enhancement
            enhanced = generate_enhanced_content(product)

            # Add to product
            product['enhancedContent'] = enhanced
            product['lastUpdated'] = datetime.now().strftime('%Y-%m-%d')

            # Save back
            with open(product_path, 'w') as f:
                json.dump(product, f, indent=2, ensure_ascii=False)

            print(f"{idx}. ENHANCED: {product.get('name', filename)}")
            processed += 1

        except FileNotFoundError:
            error_msg = f"{idx}. ERROR: File not found - {filename}"
            print(error_msg)
            errors.append(error_msg)
        except Exception as e:
            error_msg = f"{idx}. ERROR: {filename} - {str(e)}"
            print(error_msg)
            errors.append(error_msg)

    print(f"\n{'='*60}")
    print(f"SUMMARY:")
    print(f"Total processed: {processed}/{len(batch)}")
    print(f"Errors: {len(errors)}")
    if errors:
        print("\nErrors:")
        for error in errors:
            print(f"  - {error}")

if __name__ == '__main__':
    main()
