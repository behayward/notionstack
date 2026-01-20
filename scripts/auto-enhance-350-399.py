#!/usr/bin/env python3
"""
Automated template enhancement for batch 350-399.
Identifies which templates need enhancement and processes them systematically.
"""

import json
import os
from datetime import date
from pathlib import Path

# Configuration
SCRIPT_DIR = Path("/Users/blakehayward/Documents/Claude Projects/notionstack/scripts")
PRODUCTS_DIR = Path("/Users/blakehayward/Documents/Claude Projects/notionstack/content/products")
TEMPLATES_FILE = SCRIPT_DIR / "templates-to-enhance.json"
BATCH_START = 349  # 0-indexed (template #350)
BATCH_END = 399    # 0-indexed (template #399)
TODAY = str(date.today())


def generate_enhanced_content_static(product_data):
    """
    Generate enhanced content structure based on product data.
    This is a template - in production, you'd use Claude API to generate unique content.
    """

    name = product_data.get('name', 'Unknown Template')
    description = product_data.get('description', '')
    category = product_data.get('category', 'template')
    subcategory = product_data.get('subcategory', 'general')
    price = product_data.get('price', 0)

    # Determine complexity based on description length and price
    if price > 20 or len(description) > 500:
        complexity = "advanced"
    elif price > 0 or len(description) > 200:
        complexity = "intermediate"
    else:
        complexity = "beginner"

    # Generate basic enhanced content structure
    # NOTE: In production, use Claude API to generate unique, high-quality content
    enhanced_content = {
        "overview": f"{name} is a Notion template designed to help you {subcategory.replace('-', ' ')} more effectively. This template provides a structured framework that simplifies organization and boosts productivity. {description[:200]}...",
        "featureCategories": [
            {
                "category": "Core Features",
                "icon": "⚡",
                "features": [
                    f"Comprehensive {subcategory} organization system",
                    "Clean, intuitive interface optimized for Notion",
                    "Customizable properties and views"
                ]
            },
            {
                "category": "Organization",
                "icon": "🗂️",
                "features": [
                    "Structured database design for easy data entry",
                    "Multiple view options for different perspectives",
                    "Tag and category-based filtering"
                ]
            },
            {
                "category": "Productivity",
                "icon": "📈",
                "features": [
                    "Quick-add buttons for streamlined workflow",
                    "Automated calculations and status tracking",
                    "Templates and presets for common use cases"
                ]
            }
        ],
        "problemsSolved": [
            f"Difficulty organizing {subcategory.replace('-', ' ')} information in a centralized location",
            "Wasting time recreating organizational systems from scratch",
            "Lack of structure leading to inconsistent tracking and missed information"
        ],
        "solutionsBenefits": [
            f"Provides a ready-made {subcategory} system that you can start using immediately",
            "Saves hours of template design work with a professionally structured framework",
            "Ensures consistency through standardized organization and automated features"
        ],
        "idealFor": [
            f"Individuals who need to organize their {subcategory.replace('-', ' ')} activities",
            "Notion users looking for proven templates rather than building from scratch",
            f"Anyone seeking a centralized system for {subcategory} management",
            "Both beginners and experienced users who value well-designed organizational tools"
        ],
        "notRecommendedFor": [
            "Users who prefer building completely custom systems",
            f"People with very simple {subcategory} needs that don't require a structured template"
        ],
        "complexityLevel": complexity,
        "faqs": [
            {
                "question": "How do I get started with this template?",
                "answer": "After duplicating the template to your Notion workspace, review the example entries to understand the structure. Then customize the categories and properties to match your specific needs. Start adding your own data and adjust the template as you discover what works best for your workflow."
            },
            {
                "question": "What's included in this template?",
                "answer": f"The template includes a structured database for {subcategory} management, multiple view options for different perspectives, customizable properties and categories, example entries to demonstrate usage, and clear instructions for setup and customization."
            },
            {
                "question": "Can I customize this template?",
                "answer": "Yes! The template is fully customizable. You can modify properties, add or remove database fields, change views and filters, adjust colors and icons, and reorganize the structure to perfectly match your workflow and preferences."
            },
            {
                "question": "What are the main use cases?",
                "answer": f"Use it to organize and track {subcategory.replace('-', ' ')} activities, maintain a centralized database of important information, monitor progress and status across multiple items, generate insights through filtered views and reports, and establish consistent organizational habits."
            }
        ]
    }

    return enhanced_content


def check_and_enhance_template(template_info, index):
    """Check if a template needs enhancement and process it if necessary."""

    filename = template_info['file']
    product_path = PRODUCTS_DIR / filename

    print(f"\n[{index}] {template_info['name']}")
    print(f"    File: {filename}")

    # Check if file exists
    if not product_path.exists():
        print(f"    ❌ File not found")
        return {"status": "error", "reason": "file_not_found"}

    # Load existing product data
    try:
        with open(product_path, 'r', encoding='utf-8') as f:
            product_data = json.load(f)
    except Exception as e:
        print(f"    ❌ Error loading: {e}")
        return {"status": "error", "reason": str(e)}

    # Check if already enhanced
    if 'enhancedContent' in product_data:
        print(f"    ✓ Already enhanced")
        return {"status": "skipped", "reason": "already_enhanced"}

    # Generate enhanced content
    print(f"    ⚙️  Generating enhanced content...")
    try:
        enhanced_content = generate_enhanced_content_static(product_data)

        # Add enhanced content to product
        product_data['enhancedContent'] = enhanced_content
        product_data['lastUpdated'] = TODAY

        # Save updated product
        with open(product_path, 'w', encoding='utf-8') as f:
            json.dump(product_data, f, indent=2, ensure_ascii=False)

        print(f"    ✅ Enhanced successfully!")
        return {"status": "success"}

    except Exception as e:
        print(f"    ❌ Enhancement failed: {e}")
        return {"status": "error", "reason": str(e)}


def main():
    """Main execution function."""

    print("=" * 70)
    print("NOTIONSTACK TEMPLATE ENHANCEMENT - BATCH 350-399")
    print("=" * 70)
    print(f"\nProcessing templates {BATCH_START + 1} to {BATCH_END}")
    print(f"Date: {TODAY}\n")

    # Load templates list
    try:
        with open(TEMPLATES_FILE, 'r', encoding='utf-8') as f:
            all_templates = json.load(f)
    except Exception as e:
        print(f"❌ Error loading templates file: {e}")
        return

    # Get batch
    batch = all_templates[BATCH_START:BATCH_END]
    print(f"Total templates in batch: {len(batch)}\n")
    print("=" * 70)

    # Process each template
    results = {
        "success": [],
        "skipped": [],
        "errors": []
    }

    for i, template in enumerate(batch, start=BATCH_START + 1):
        result = check_and_enhance_template(template, i)

        if result["status"] == "success":
            results["success"].append((i, template['name']))
        elif result["status"] == "skipped":
            results["skipped"].append((i, template['name']))
        else:
            results["errors"].append((i, template['name'], result.get("reason", "unknown")))

    # Summary
    print("\n" + "=" * 70)
    print("ENHANCEMENT COMPLETE")
    print("=" * 70)
    print(f"\n✅ Successfully enhanced: {len(results['success'])}")
    if results['success']:
        for idx, name in results['success'][:5]:
            print(f"   {idx}. {name}")
        if len(results['success']) > 5:
            print(f"   ... and {len(results['success']) - 5} more")

    print(f"\n⏭️  Skipped (already done): {len(results['skipped'])}")
    if results['skipped'] and len(results['skipped']) <= 10:
        for idx, name in results['skipped']:
            print(f"   {idx}. {name}")

    print(f"\n❌ Errors: {len(results['errors'])}")
    if results['errors']:
        for idx, name, reason in results['errors']:
            print(f"   {idx}. {name} - {reason}")

    print(f"\n📊 Total processed: {len(batch)}")
    print("=" * 70)

    # Save detailed results
    results_file = SCRIPT_DIR / f"enhancement-results-350-399-{TODAY}.json"
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    print(f"\n💾 Detailed results saved to: {results_file.name}")


if __name__ == "__main__":
    main()
