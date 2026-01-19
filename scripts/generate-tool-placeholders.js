#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Tool name to color mapping
const tools = {
  'zapier': '#FF4A00',
  'make': '#6D00CC',
  'ifttt': '#000000',
  'pipedream': '#0099FF',
  'n8n': '#EA4B71',
  'super': '#6366F1',
  'potion': '#8B5CF6',
  'feather': '#10B981',
  'notaku': '#3B82F6',
  'fillout': '#F59E0B',
  'typeform': '#262627',
  'jotform': '#FF6100',
  'tally': '#5B45FF',
  'notionforms': '#000000',
  'softr': '#3B5998'
};

const imageDir = path.join(process.cwd(), 'public', 'images', 'tools');

// Ensure directory exists
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Generate SVG for each tool
Object.entries(tools).forEach(([name, color]) => {
  const initial = name.charAt(0).toUpperCase();
  const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="${color}"/>
  <text x="200" y="270" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="white" text-anchor="middle">${initial}</text>
</svg>`;

  const filename = path.join(imageDir, `${name}-logo.png`);
  fs.writeFileSync(filename, svg);
  console.log(`Created: ${name}-logo.png`);
});

console.log(`\n✅ Generated ${Object.keys(tools).length} placeholder images`);
