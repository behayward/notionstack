#!/usr/bin/env python3
"""
Process templates 350-399 from templates-to-enhance.json
"""

import json
import os
from datetime import date

# Paths
SCRIPT_DIR = "/Users/blakehayward/Documents/Claude Projects/notionstack/scripts"
PRODUCTS_DIR = "/Users/blakehayward/Documents/Claude Projects/notionstack/content/products"
TEMPLATES_FILE = os.path.join(SCRIPT_DIR, "templates-to-enhance.json")

# Load templates list
with open(TEMPLATES_FILE, 'r') as f:
    all_templates = json.load(f)

# Get batch 350-399 (0-indexed: 349-398)
batch = all_templates[349:399]

print(f"Processing {len(batch)} templates (350-399)")
print("=" * 60)

# Extract filenames for this batch
filenames = [t['file'] for t in batch]

# Write filenames to a file for reference
with open(os.path.join(SCRIPT_DIR, 'batch-350-399-files.txt'), 'w') as f:
    for i, filename in enumerate(filenames, start=350):
        f.write(f"{i}. {filename}\n")

print(f"Saved {len(filenames)} filenames to batch-350-399-files.txt")
print("\nFirst 10 files in this batch:")
for i, filename in enumerate(filenames[:10], start=350):
    print(f"  {i}. {filename}")
