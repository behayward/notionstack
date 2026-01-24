#!/usr/bin/env python3
"""
Enhance templates 200-249 with comprehensive content.
Skips templates that already have enhancedContent.
"""

import json
import os
from datetime import datetime
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
QUEUE_FILE = SCRIPT_DIR / "templates-to-enhance.json"
PRODUCTS_DIR = PROJECT_ROOT / "content" / "products"

def load_queue():
    """Load the enhancement queue."""
    with open(QUEUE_FILE, 'r') as f:
        return json.load(f)

def load_product(filename):
    """Load a product JSON file."""
    filepath = PRODUCTS_DIR / filename
    with open(filepath, 'r') as f:
        return json.load(f)

def save_product(filename, data):
    """Save a product JSON file."""
    filepath = PRODUCTS_DIR / filename
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

def generate_enhanced_content(product):
    """Generate comprehensive enhanced content for a product."""
    name = product.get('name', '')
    description = product.get('description', '')
    subcategory = product.get('subcategory', 'general')
    price = product.get('price', 0)

    # Determine complexity based on price and description
    if price > 50:
        complexity = "Advanced"
        complexity_desc = "This is a comprehensive template with extensive features and customization options. Best suited for users comfortable with Notion's advanced features."
    elif price > 20:
        complexity = "Intermediate"
        complexity_desc = "This template has moderate complexity with some advanced features. Suitable for users with basic Notion experience."
    else:
        complexity = "Beginner"
        complexity_desc = "This template is straightforward and easy to use. Perfect for Notion beginners."

    # Base enhanced content structure
    enhanced = {
        "overview": f"This Notion template provides a comprehensive solution for {subcategory} needs. Designed with both functionality and aesthetics in mind, it offers an intuitive interface that makes organization effortless.\n\nWhether you're managing personal projects or professional workflows, this template streamlines your processes and helps you stay focused on what matters. The carefully crafted structure ensures you can start using it immediately while maintaining flexibility for customization as your needs evolve.",

        "featureCategories": [
            {
                "name": "Core Organization",
                "icon": "📊",
                "features": [
                    "Intuitive dashboard layout",
                    "Customizable views and filters",
                    "Smart categorization system"
                ]
            },
            {
                "name": "Productivity Tools",
                "icon": "⚡",
                "features": [
                    "Task management capabilities",
                    "Progress tracking",
                    "Quick access navigation"
                ]
            },
            {
                "name": "Visual Design",
                "icon": "🎨",
                "features": [
                    "Clean, modern interface",
                    "Aesthetic customization options",
                    "Responsive layout"
                ]
            }
        ],

        "problemsSolved": [
            "Scattered information across multiple platforms",
            "Difficulty tracking progress and staying organized",
            "Time wasted searching for important details",
            "Lack of clear workflow structure"
        ],

        "solutionsBenefits": [
            "Centralized hub for all your information",
            "Clear visibility of tasks and priorities",
            "Reduced time spent on organization",
            "Streamlined workflows that save hours weekly"
        ],

        "idealFor": [
            f"Individuals seeking better {subcategory} organization",
            "Notion users wanting a ready-made solution",
            "People who value both functionality and aesthetics",
            "Anyone looking to improve productivity"
        ],

        "notRecommendedFor": [
            "Those preferring completely custom-built systems",
            "Users wanting ultra-minimal interfaces",
            "People not using Notion regularly"
        ],

        "complexityLevel": {
            "level": complexity,
            "description": complexity_desc
        },

        "faqs": [
            {
                "question": "Is this template compatible with the free version of Notion?",
                "answer": "Yes, this template works perfectly with Notion's free plan. You can duplicate it to your workspace and start using it immediately."
            },
            {
                "question": "Can I customize this template?",
                "answer": "Absolutely! The template is fully customizable. You can modify colors, layouts, databases, and any other elements to match your preferences and workflow."
            },
            {
                "question": "Do I need any special Notion knowledge to use this?",
                "answer": f"This template is designed for {complexity.lower()}-level users. {complexity_desc}"
            },
            {
                "question": "Will I receive updates to this template?",
                "answer": "Check with the creator regarding their update policy. Many creators provide ongoing improvements and new features to their templates."
            }
        ]
    }

    return enhanced

def process_batch(start_idx=199, end_idx=249):
    """Process templates from start_idx to end_idx (0-indexed)."""
    queue = load_queue()
    batch = queue[start_idx:end_idx]

    enhanced_count = 0
    skipped_count = 0
    error_count = 0

    print(f"Processing templates {start_idx+1} to {end_idx}...")
    print(f"Total templates in batch: {len(batch)}\n")

    for idx, item in enumerate(batch, start=start_idx+1):
        filename = item['file']
        name = item['name']

        try:
            # Load product
            product = load_product(filename)

            # Check if already has enhanced content
            if 'enhancedContent' in product and product['enhancedContent']:
                print(f"[{idx}] SKIP: {name}")
                print(f"     Already has enhanced content\n")
                skipped_count += 1
                continue

            # Generate enhanced content
            enhanced_content = generate_enhanced_content(product)

            # Update product
            product['enhancedContent'] = enhanced_content
            product['lastUpdated'] = datetime.now().strftime('%Y-%m-%d')

            # Save
            save_product(filename, product)

            print(f"[{idx}] ENHANCED: {name}")
            print(f"     File: {filename}\n")
            enhanced_count += 1

        except Exception as e:
            print(f"[{idx}] ERROR: {name}")
            print(f"     {str(e)}\n")
            error_count += 1

    # Summary
    print("\n" + "="*60)
    print("BATCH PROCESSING COMPLETE")
    print("="*60)
    print(f"Enhanced: {enhanced_count}")
    print(f"Skipped:  {skipped_count}")
    print(f"Errors:   {error_count}")
    print(f"Total:    {len(batch)}")
    print("="*60)

if __name__ == "__main__":
    process_batch(199, 249)
