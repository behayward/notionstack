#!/bin/bash

# Image scraper batch runner
# Processes all 205 products in batches of 50

INPUT_FILE="/Users/blakehayward/Documents/Claude Projects/notionstack/scripts/enhanced-products-for-images.json"
BATCH_SIZE=50

echo "Starting image scraper..."
echo "Processing 205 products in batches of $BATCH_SIZE"
echo ""

# Batch 1: 0-49
echo "=== Batch 1: Products 1-50 ==="
node /Users/blakehayward/Documents/Claude\ Projects/notionstack/scripts/scrape-images-batch.js "$INPUT_FILE" 0 $BATCH_SIZE
echo ""

# Batch 2: 50-99
echo "=== Batch 2: Products 51-100 ==="
node /Users/blakehayward/Documents/Claude\ Projects/notionstack/scripts/scrape-images-batch.js "$INPUT_FILE" 50 $BATCH_SIZE
echo ""

# Batch 3: 100-149
echo "=== Batch 3: Products 101-150 ==="
node /Users/blakehayward/Documents/Claude\ Projects/notionstack/scripts/scrape-images-batch.js "$INPUT_FILE" 100 $BATCH_SIZE
echo ""

# Batch 4: 150-199
echo "=== Batch 4: Products 151-200 ==="
node /Users/blakehayward/Documents/Claude\ Projects/notionstack/scripts/scrape-images-batch.js "$INPUT_FILE" 150 $BATCH_SIZE
echo ""

# Batch 5: 200-204
echo "=== Batch 5: Products 201-205 ==="
node /Users/blakehayward/Documents/Claude\ Projects/notionstack/scripts/scrape-images-batch.js "$INPUT_FILE" 200 5
echo ""

echo "All batches complete!"
echo "Check image-scrape-errors.log for any failures"
