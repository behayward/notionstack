#!/usr/bin/env python3
"""
Bulk enhancement script for templates 100-149
This script will be used to track which templates have been enhanced
"""

import json
from pathlib import Path
from datetime import datetime

BASE_DIR = Path("/Users/blakehayward/Documents/Claude Projects/notionstack")
PRODUCTS_DIR = BASE_DIR / "content/products"

# Templates in batch 100-149 that need enhancement
TEMPLATES_TO_ENHANCE = [
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
    "notion-expense-tracker-1.json",
]

# Track completion
COMPLETED = [
    "product-requirement-document-free-notion-template.json",
    "139-social-media-copywriting-prompts.json",
    "panic-button.json",
    "notion-p-a-r-a-dashboard.json",
]

def load_product(filename):
    """Load a product JSON file"""
    filepath = PRODUCTS_DIR / filename
    if not filepath.exists():
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def has_enhanced_content(product):
    """Check if product already has enhanced content"""
    return 'enhancedContent' in product and product['enhancedContent'] is not None

def main():
    print("ENHANCEMENT PROGRESS TRACKER")
    print("=" * 70)

    total_in_batch = 50
    already_had_content = 0
    newly_enhanced = len(COMPLETED)
    still_needs = 0

    print(f"\nCompleted so far ({len(COMPLETED)}):")
    for filename in COMPLETED:
        product = load_product(filename)
        if product:
            print(f"  ✓ {product.get('name', 'Unknown')[:60]}")

    print(f"\nStill needs enhancement:")
    for filename in TEMPLATES_TO_ENHANCE:
        product = load_product(filename)
        if product:
            if has_enhanced_content(product):
                already_had_content += 1
            else:
                still_needs += 1
                print(f"  → {product.get('name', 'Unknown')[:60]}")

    print("\n" + "=" * 70)
    print(f"Total templates in batch 100-149: {total_in_batch}")
    print(f"Already had enhanced content: {already_had_content}")
    print(f"Newly enhanced this session: {newly_enhanced}")
    print(f"Still needs enhancement: {still_needs}")
    print("=" * 70)

if __name__ == "__main__":
    main()
