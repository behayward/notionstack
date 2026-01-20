#!/usr/bin/env python3
"""
Process templates 50-99 with enhanced content
"""
import json
import os
from datetime import datetime

# Load the templates to enhance
with open('scripts/templates-to-enhance.json', 'r') as f:
    all_templates = json.load(f)

# Get templates 50-99 (indices 49-98)
batch = all_templates[49:99]

print(f"Processing {len(batch)} templates (indices 50-99)...\n")

for idx, template_info in enumerate(batch, start=50):
    filename = template_info['file']
    product_path = f"content/products/{filename}"

    print(f"{idx}. {filename}")
    print(f"   Name: {template_info['name']}")
    print(f"   Category: {template_info.get('subcategory', 'N/A')}")
    print()

print(f"\nTotal: {len(batch)} templates to process")
