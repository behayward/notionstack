#!/usr/bin/env python3
"""
Process templates 100-149 and add enhanced content
"""
import json
import os
from datetime import datetime
from pathlib import Path

# Define base paths
BASE_DIR = Path("/Users/blakehayward/Documents/Claude Projects/notionstack")
PRODUCTS_DIR = BASE_DIR / "content/products"
TEMPLATES_LIST = BASE_DIR / "scripts/templates-to-enhance.json"

def load_templates_list():
    """Load the templates to enhance list"""
    with open(TEMPLATES_LIST, 'r') as f:
        return json.load(f)

def load_product(filename):
    """Load a product JSON file"""
    filepath = PRODUCTS_DIR / filename
    if not filepath.exists():
        return None
    with open(filepath, 'r') as f:
        return json.load(f)

def save_product(filename, data):
    """Save a product JSON file"""
    filepath = PRODUCTS_DIR / filename
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def has_enhanced_content(product):
    """Check if product already has enhanced content"""
    return 'enhancedContent' in product and product['enhancedContent'] is not None

def main():
    # Load all templates
    all_templates = load_templates_list()

    # Get batch 100-149 (0-indexed)
    batch = all_templates[100:150]

    print(f"Processing templates 100-149 ({len(batch)} total)")
    print("=" * 60)

    enhanced_count = 0
    skipped_count = 0
    error_count = 0

    for i, template in enumerate(batch, start=100):
        filename = template['file']
        name = template['name']

        print(f"\n{i}. {name[:50]}...")
        print(f"   File: {filename}")

        # Load the product
        product = load_product(filename)
        if not product:
            print(f"   ❌ ERROR: Could not load product file")
            error_count += 1
            continue

        # Check if already has enhanced content
        if has_enhanced_content(product):
            print(f"   ⏭️  SKIPPED: Already has enhanced content")
            skipped_count += 1
            continue

        print(f"   ✅ NEEDS ENHANCEMENT")
        enhanced_count += 1

    print("\n" + "=" * 60)
    print("SUMMARY:")
    print(f"  Total processed: {len(batch)}")
    print(f"  Needs enhancement: {enhanced_count}")
    print(f"  Already enhanced: {skipped_count}")
    print(f"  Errors: {error_count}")

if __name__ == "__main__":
    main()
