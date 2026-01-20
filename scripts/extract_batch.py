import json

# Read the full file
with open('/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/templates-to-enhance.json', 'r') as f:
    data = json.load(f)

# Extract templates 250-299 (indices 249-298 in zero-based)
templates_batch = data[249:299]

# Save to a temporary file
with open('/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/batch_250_299.json', 'w') as f:
    json.dump(templates_batch, f, indent=2)

print(f"Extracted {len(templates_batch)} templates")
