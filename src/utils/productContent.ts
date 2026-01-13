// Generate compelling headline from product name and description
export function generateHeadline(name: string, description: string, subcategory?: string): string {
  // Try to extract a benefit-focused headline
  const firstSentence = description.split(/[.!?]/)[0];

  // If first sentence is short and compelling, use it
  if (firstSentence.length > 0 && firstSentence.length <= 60) {
    return firstSentence.trim();
  }

  // Otherwise create one from the product name and subcategory
  const categoryContext = subcategory ? ` ${subcategory}` : '';
  const headline = `${name}${categoryContext ? ` for${categoryContext.replace('-', ' ')}` : ''}`;

  // Truncate if too long
  return headline.length <= 60 ? headline : headline.substring(0, 57) + '...';
}

// Generate descriptive first paragraph
export function generateFirstParagraph(description: string): string {
  // Clean up the description
  let cleaned = description.trim();

  // If description is very short, return it as-is
  if (cleaned.length < 150) {
    return cleaned;
  }

  // Find the first 2-3 sentences
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
  const firstFew = sentences.slice(0, 2).join(' ');

  return firstFew.trim();
}

// Extract features from description and features field
export function extractFeatures(description: string, features: string): string[] {
  const featureList: string[] = [];

  // Parse features field if it exists
  if (features) {
    // Features might be semicolon or newline separated
    const parsedFeatures = features
      .split(/[;\n]/)
      .map(f => f.trim())
      .filter(f => f.length > 0 && f.length < 150);

    featureList.push(...parsedFeatures);
  }

  // If we don't have enough features, try to extract from description
  if (featureList.length < 3) {
    // Look for bulleted lists or numbered lists in description
    const bulletPoints = description.match(/[•\-\*]\s*([^\n•\-\*]+)/g);
    if (bulletPoints) {
      bulletPoints.forEach(bullet => {
        const cleaned = bullet.replace(/^[•\-\*]\s*/, '').trim();
        if (cleaned.length > 10 && cleaned.length < 150) {
          featureList.push(cleaned);
        }
      });
    }
  }

  // Limit to 5 features
  return featureList.slice(0, 5);
}

// Add affiliate tracking to creator URL
export function addAffiliateTracking(url: string): string {
  if (!url) return '';

  // If it's a Gumroad URL without tracking, add it
  if (url.includes('gumroad.com') && !url.includes('?a=962870099')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}a=962870099`;
  }

  return url;
}
