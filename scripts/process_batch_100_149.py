#!/usr/bin/env python3
"""
Process templates 100-149 and generate enhanced content
"""
import json
from pathlib import Path
from datetime import datetime

# File paths
BASE_DIR = Path("/Users/blakehayward/Documents/Claude Projects/notionstack")
PRODUCTS_DIR = BASE_DIR / "content/products"
TEMPLATES_LIST = BASE_DIR / "scripts/templates-to-enhance.json"

# Templates 100-149 filenames (manually extracted from the list)
BATCH_FILES = [
    "muslim-life-os-islamic-notion-template-minimalistic-version.json",
    "product-requirement-document-free-notion-template.json",
    "139-social-media-copywriting-prompts.json",
    "panic-button.json",
    "notion-p-a-r-a-dashboard.json",
    "reading-tracker-notion-template.json",
    "budget-und-ausgabenplaner-notion-vorlage.json",
    "effective-1-1s-notion-templates.json",
    "notion-wedding-planner-template.json",
    "twitter-thread-master-class.json",
    "travel-planner-notion.json",
    "ultimate-notion-travel-planner-1.json",
    "free-skincare-tracker.json",
    "notion-ai-notion-ai-templates.json",
    "notion-fitness-wellness-planner.json",
    "perfect-day-planner.json",
    "simple-project-task-manager.json",
    "notion-free-template-bundle-12-free-templates-in-one-place.json",
    "the-justin-welsh-content-system-notion-template.json",
    "gumroad-launch-checklist.json",
    "notion-project-tracker.json",
    "notion-template-simple-trip-planner-doodables.json",
    "notion-gtd.json",
    "notion-habit-tracker-pro.json",
    "notion-template-for-writers.json",
    "280-chatgpt-prompts-to-build-a-10-000-month-business-in-90-days.json",
    "wheel-of-life-notion-template-limitless-os.json",
    "free-student-general-printables-essays-projects-etc.json",
    "product-launch-manager-v1.json",
    "gamify-your-habit-tracker.json",
    "world-building-bible.json",
    "watchlist-movies-tv-books-music-notion-template.json",
    "endless-tweet-generator-notion-template.json",
    "notion-icons-vol-8.json",
    "notion-icons.json",
    "notionists-avatar-library.json",
    "complete-finance-tracker-notion-template.json",
    "notion-project-management-1.json",
    "the-ultimate-notion-resumes-cover-letters.json",
    "bard-for-passive-income.json",
    "the-quran-journal-1-0.json",
    "free-tv-show-and-movie-tracker-notion-template.json",
    "notion-macro-tracker.json",
    "notion-portfolio-template.json",
    "sistema-de-tareas-de-ruben-loan-notion-template.json",
    "notion-50-30-20-budgeting-system.json",
    "twitter-growth-cheat-sheet.json",
    "ai-prompt-assistant-notion-resource.json",
    "get-things-done-notion-template.json",
    "notion-covers-pack-1.json",
    "website-os.json",
]

def load_product(filename):
    """Load a product JSON file"""
    filepath = PRODUCTS_DIR / filename
    if not filepath.exists():
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_product(filename, data):
    """Save a product JSON file"""
    filepath = PRODUCTS_DIR / filename
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')  # Add trailing newline

def has_enhanced_content(product):
    """Check if product already has enhanced content"""
    return 'enhancedContent' in product and product['enhancedContent'] is not None

def main():
    print("=" * 70)
    print("CHECKING TEMPLATES 100-149 FOR ENHANCEMENT NEEDS")
    print("=" * 70)

    needs_enhancement = []
    already_has_content = []
    errors = []

    for filename in BATCH_FILES:
        product = load_product(filename)

        if not product:
            errors.append(filename)
            print(f"❌ ERROR: {filename}")
            continue

        name = product.get('name', 'Unknown')

        if has_enhanced_content(product):
            already_has_content.append(filename)
            print(f"✓ SKIP: {name[:60]}")
        else:
            needs_enhancement.append((filename, product))
            print(f"→ NEEDS: {name[:60]}")

    print("\n" + "=" * 70)
    print("SUMMARY:")
    print(f"  Total files: {len(BATCH_FILES)}")
    print(f"  Needs enhancement: {len(needs_enhancement)}")
    print(f"  Already has content: {len(already_has_content)}")
    print(f"  Errors: {len(errors)}")
    print("=" * 70)

    if needs_enhancement:
        print("\nFILES THAT NEED ENHANCEMENT:")
        for i, (filename, product) in enumerate(needs_enhancement, 1):
            print(f"{i}. {filename}")
            print(f"   Name: {product.get('name', 'N/A')}")
            print(f"   Subcategory: {product.get('subcategory', 'N/A')}")
            print(f"   Price: ${product.get('price', 0)}")
            print()

if __name__ == "__main__":
    main()
