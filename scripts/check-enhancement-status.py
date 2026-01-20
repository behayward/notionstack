#!/usr/bin/env python3
"""
Check which templates in batch 50-99 have been enhanced
"""
import json
import os

# Load templates list
with open('scripts/templates-to-enhance.json', 'r') as f:
    all_templates = json.load(f)

# Get batch 50-99
batch = all_templates[49:99]

enhanced = []
not_enhanced = []
missing = []

for idx, template_info in enumerate(batch, start=50):
    filename = template_info['file']
    product_path = f"content/products/{filename}"

    try:
        with open(product_path, 'r') as f:
            product = json.load(f)

        if 'enhancedContent' in product:
            enhanced.append((idx, filename, template_info['name']))
        else:
            not_enhanced.append((idx, filename, template_info['name']))

    except FileNotFoundError:
        missing.append((idx, filename, template_info['name']))

print(f"BATCH 50-99 ENHANCEMENT STATUS")
print(f"{'='*70}")
print(f"\nENHANCED: {len(enhanced)}/{len(batch)}")
print(f"NOT ENHANCED: {len(not_enhanced)}/{len(batch)}")
print(f"MISSING FILES: {len(missing)}/{len(batch)}")
print(f"\n{'='*70}\n")

if not_enhanced:
    print(f"NOT ENHANCED ({len(not_enhanced)} templates):")
    for idx, filename, name in not_enhanced[:20]:  # Show first 20
        print(f"  {idx}. {name[:60]}")
    if len(not_enhanced) > 20:
        print(f"  ... and {len(not_enhanced) - 20} more")

print(f"\n{'='*70}")
print(f"\nSUMMARY:")
print(f"  Total in batch: {len(batch)}")
print(f"  Already enhanced: {len(enhanced)} ({len(enhanced)/len(batch)*100:.1f}%)")
print(f"  Still to enhance: {len(not_enhanced)} ({len(not_enhanced)/len(batch)*100:.1f}%)")
print(f"  Missing files: {len(missing)}")
