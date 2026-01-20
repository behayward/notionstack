#!/usr/bin/env python3
"""Extract filenames for templates 350-399"""
import json

with open('/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/templates-to-enhance.json', 'r') as f:
    templates = json.load(f)

# Get templates 350-399 (0-indexed: 349-398)
batch = templates[349:399]

print("Templates 350-399 filenames:")
print("=" * 60)
for i, t in enumerate(batch, start=350):
    print(f"{i}. {t['file']}")

# Also save to file
with open('/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/batch-350-399-files.txt', 'w') as f:
    for i, t in enumerate(batch, start=350):
        f.write(f"{t['file']}\n")

print(f"\n✅ Saved {len(batch)} filenames to batch-350-399-files.txt")
