#!/usr/bin/env python3
"""Check which templates in batch 200-249 need enhancement."""

import json
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
QUEUE_FILE = SCRIPT_DIR / "templates-to-enhance.json"
PRODUCTS_DIR = PROJECT_ROOT / "content" / "products"

def load_queue():
    with open(QUEUE_FILE, 'r') as f:
        return json.load(f)

def check_product(filename):
    """Check if product has enhancedContent."""
    filepath = PRODUCTS_DIR / filename
    try:
        with open(filepath, 'r') as f:
            product = json.load(f)
        return 'enhancedContent' in product and product['enhancedContent']
    except:
        return None

# Load queue and get batch 200-249 (indices 199-248)
queue = load_queue()
batch = queue[199:249]

need_enhancement = []
already_enhanced = []
errors = []

print("Checking batch 200-249...\n")

for idx, item in enumerate(batch, start=200):
    filename = item['file']
    name = item['name']

    has_content = check_product(filename)

    if has_content is None:
        errors.append((idx, name, filename))
        print(f"[{idx}] ERROR: {filename}")
    elif has_content:
        already_enhanced.append((idx, name, filename))
        print(f"[{idx}] ✓ SKIP: {name}")
    else:
        need_enhancement.append((idx, name, filename))
        print(f"[{idx}] ○ NEEDS: {name}")

print("\n" + "="*70)
print(f"Need Enhancement: {len(need_enhancement)}")
print(f"Already Enhanced: {len(already_enhanced)}")
print(f"Errors: {len(errors)}")
print(f"Total: {len(batch)}")
print("="*70)

if need_enhancement:
    print("\nTemplates to enhance:")
    for idx, name, filename in need_enhancement[:10]:  # Show first 10
        print(f"  [{idx}] {filename}")
    if len(need_enhancement) > 10:
        print(f"  ... and {len(need_enhancement) - 10} more")

# Save list of files needing enhancement
output = {
    "need_enhancement": [{"index": idx, "name": name, "file": filename}
                         for idx, name, filename in need_enhancement]
}

output_file = SCRIPT_DIR / "batch-200-249-to-enhance.json"
with open(output_file, 'w') as f:
    json.dump(output, f, indent=2)

print(f"\nSaved list to: {output_file}")
