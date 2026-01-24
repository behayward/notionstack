const fs = require('fs');
const path = require('path');

// Load the templates to enhance
const templatesFile = './templates-to-enhance.json';
const templates = JSON.parse(fs.readFileSync(templatesFile, 'utf8'));

// Extract batch 300-349
const batch = templates.slice(300, 350);

console.log(`Processing batch 300-349: ${batch.length} templates`);

let enhanced = 0;
let skipped = 0;
let errors = [];

function generateEnhancedContent(product) {
  const name = product.name;
  const description = product.description || '';
  const subcategory = product.subcategory || '';
  const price = product.price || 0;

  // Generate overview (2-3 paragraphs)
  const overview = generateOverview(name, description, subcategory, price);

  // Generate feature categories
  const featureCategories = generateFeatureCategories(name, description, subcategory);

  // Generate problems and solutions
  const problemsSolved = generateProblemsSolved(subcategory, name);
  const solutionsBenefits = generateSolutionsBenefits(subcategory, name);

  // Generate ideal for / not recommended
  const idealFor = generateIdealFor(subcategory, name);
  const notRecommendedFor = generateNotRecommendedFor(subcategory, name);

  // Generate complexity level
  const complexityLevel = generateComplexityLevel(subcategory, price);

  // Generate FAQs
  const faqs = generateFAQs(name, subcategory);

  return {
    overview,
    featureCategories,
    problemsSolved,
    solutionsBenefits,
    idealFor,
    notRecommendedFor,
    complexityLevel,
    faqs
  };
}

function generateOverview(name, description, subcategory, price) {
  const cleanDesc = description.substring(0, 500).replace(/\s+/g, ' ').trim();

  return [
    `The ${name} is a powerful Notion ${subcategory} designed to streamline your workflow and boost productivity. ${cleanDesc.includes('template') ? 'This template' : 'This solution'} provides a comprehensive system for managing your ${subcategory}-related tasks with ease and efficiency.`,

    `Built with user experience in mind, this ${subcategory} template offers an intuitive interface that makes it easy to get started immediately. Whether you're a Notion beginner or an experienced user, you'll find the structure logical and the features accessible.`,

    `${price === 0 ? 'Available as a free resource, this template delivers exceptional value without any financial commitment.' : `At $${price}, this template offers excellent value for anyone looking to enhance their ${subcategory} workflow.`} The template includes all the essential features you need to stay organized and achieve your goals.`
  ];
}

function generateFeatureCategories(name, description, subcategory) {
  const categories = [];

  // Core features
  categories.push({
    name: 'Core Features',
    icon: '⚡',
    features: [
      `Comprehensive ${subcategory} management system`,
      'Intuitive database structure with multiple views',
      'Customizable fields and properties',
      'Easy-to-use interface for quick navigation'
    ]
  });

  // Organization
  categories.push({
    name: 'Organization',
    icon: '📊',
    features: [
      'Multiple database views (table, board, calendar)',
      'Advanced filtering and sorting options',
      'Tag and category system',
      'Quick search and navigation'
    ]
  });

  // Productivity
  categories.push({
    name: 'Productivity',
    icon: '🎯',
    features: [
      'Template buttons for quick entry creation',
      'Automated formulas and calculations',
      'Progress tracking and status updates',
      'Integration with other Notion databases'
    ]
  });

  // Customization
  categories.push({
    name: 'Customization',
    icon: '🎨',
    features: [
      'Fully customizable layout and design',
      'Flexible database properties',
      'Aesthetic and functional design',
      'Adaptable to your specific workflow'
    ]
  });

  return categories;
}

function generateProblemsSolved(subcategory, name) {
  const problemMap = {
    'tracker': [
      'Difficulty keeping track of multiple items or activities',
      'Lost or forgotten information',
      'Scattered data across multiple tools',
      'Lack of visibility into patterns and trends'
    ],
    'planner': [
      'Poor time management and scheduling conflicts',
      'Forgotten tasks and missed deadlines',
      'Inability to prioritize effectively',
      'Lack of overview of upcoming commitments'
    ],
    'dashboard': [
      'Information scattered across multiple sources',
      'No centralized view of important data',
      'Time wasted switching between different tools',
      'Difficulty maintaining an overview of projects'
    ],
    'productivity': [
      'Low productivity and wasted time',
      'Unclear priorities and goals',
      'Difficulty maintaining focus',
      'Lack of progress tracking'
    ],
    'finance': [
      'Poor visibility into spending patterns',
      'Difficulty budgeting and saving',
      'Disorganized financial records',
      'Lack of financial planning'
    ],
    'second-brain': [
      'Information overload and mental clutter',
      'Forgotten ideas and knowledge',
      'Difficulty connecting related concepts',
      'Inefficient knowledge management'
    ],
    'default': [
      `Disorganized ${subcategory} management`,
      'Time wasted on manual processes',
      'Lack of systematic approach',
      'Difficulty maintaining consistency'
    ]
  };

  return problemMap[subcategory] || problemMap['default'];
}

function generateSolutionsBenefits(subcategory, name) {
  const benefitMap = {
    'tracker': [
      'Complete visibility of all tracked items in one place',
      'Never lose important information again',
      'Identify patterns and trends easily',
      'Make data-driven decisions with confidence'
    ],
    'planner': [
      'Clear overview of your schedule and commitments',
      'Never miss important deadlines or events',
      'Prioritize tasks effectively',
      'Reduce stress with better planning'
    ],
    'dashboard': [
      'All your important information in one centralized location',
      'Save time by eliminating tool-switching',
      'Quick access to critical data',
      'Better decision-making with complete visibility'
    ],
    'productivity': [
      'Boost your productivity and accomplish more',
      'Clear priorities and focused work',
      'Track progress toward your goals',
      'Develop sustainable productive habits'
    ],
    'finance': [
      'Complete control over your finances',
      'Make informed financial decisions',
      'Achieve your savings goals faster',
      'Reduce financial stress and anxiety'
    ],
    'second-brain': [
      'Capture and organize all your knowledge',
      'Never forget important ideas',
      'Connect concepts and spark creativity',
      'Build a valuable personal knowledge base'
    ],
    'default': [
      `Streamlined ${subcategory} workflow`,
      'Increased efficiency and organization',
      'Better results with less effort',
      'Peace of mind with systematic management'
    ]
  };

  return benefitMap[subcategory] || benefitMap['default'];
}

function generateIdealFor(subcategory, name) {
  const idealMap = {
    'tracker': [
      'Anyone who needs to monitor multiple items or activities',
      'Detail-oriented individuals who value organization',
      'People who want to identify patterns in their data',
      'Users looking for a centralized tracking solution'
    ],
    'planner': [
      'Busy professionals managing multiple commitments',
      'Students balancing coursework and activities',
      'Anyone who wants to improve their time management',
      'People who prefer digital planning solutions'
    ],
    'dashboard': [
      'Professionals who need quick access to key information',
      'Project managers coordinating multiple initiatives',
      'Entrepreneurs managing various business aspects',
      'Anyone who values having a centralized workspace'
    ],
    'productivity': [
      'Individuals looking to boost their efficiency',
      'People struggling with procrastination',
      'Goal-oriented users who want to track progress',
      'Anyone seeking to develop better productive habits'
    ],
    'finance': [
      'Individuals wanting to gain control of their finances',
      'People working toward specific savings goals',
      'Anyone looking to understand their spending patterns',
      'Users who want to make informed financial decisions'
    ],
    'default': [
      `Anyone working with ${subcategory} tasks regularly`,
      'Notion users looking to streamline their workflow',
      'Individuals who value organization and efficiency',
      'People seeking a comprehensive management solution'
    ]
  };

  return idealMap[subcategory] || idealMap['default'];
}

function generateNotRecommendedFor(subcategory, name) {
  return [
    'Users who prefer physical/paper-based systems',
    'People uncomfortable with digital tools',
    'Those looking for a mobile-first solution (Notion mobile has limitations)',
    'Users who need offline access as primary feature'
  ];
}

function generateComplexityLevel(subcategory, price) {
  // Free templates tend to be simpler
  if (price === 0) {
    return {
      level: 'beginner',
      description: 'Easy to set up and use, perfect for Notion beginners',
      setupTime: '5-10 minutes',
      learningCurve: 'Gentle - intuitive interface with clear structure'
    };
  } else if (price < 10) {
    return {
      level: 'beginner-intermediate',
      description: 'Straightforward setup with some advanced features to grow into',
      setupTime: '15-20 minutes',
      learningCurve: 'Moderate - may require some Notion familiarity for advanced features'
    };
  } else {
    return {
      level: 'intermediate',
      description: 'Comprehensive system with advanced features and customization options',
      setupTime: '20-30 minutes',
      learningCurve: 'Moderate - best suited for users comfortable with Notion databases'
    };
  }
}

function generateFAQs(name, subcategory) {
  return [
    {
      question: 'Do I need a paid Notion account to use this template?',
      answer: 'No, this template works perfectly with a free Notion account. Simply duplicate it to your workspace and start using it immediately.'
    },
    {
      question: 'Can I customize this template to fit my specific needs?',
      answer: 'Absolutely! This template is fully customizable. You can modify the layout, add or remove fields, change views, and adapt it to match your exact workflow requirements.'
    },
    {
      question: 'Is this template suitable for beginners?',
      answer: 'Yes, this template is designed to be user-friendly for Notion users of all levels. It includes clear structure and organization that makes it easy to understand and use from day one.'
    },
    {
      question: `How do I get started with this ${subcategory} template?`,
      answer: 'After purchasing, you\'ll receive a link to duplicate the template into your Notion workspace. Click "Duplicate" in the top-right corner, and the template will be added to your workspace ready to use.'
    }
  ];
}

// Process each template
for (const template of batch) {
  try {
    const productPath = path.join(__dirname, '..', 'content', 'products', template.file);

    // Check if file exists
    if (!fs.existsSync(productPath)) {
      console.log(`  ⚠️  File not found: ${template.file}`);
      errors.push({ file: template.file, error: 'File not found' });
      continue;
    }

    // Read the product file
    const product = JSON.parse(fs.readFileSync(productPath, 'utf8'));

    // Check if already has enhancedContent
    if (product.enhancedContent) {
      console.log(`  ⏭️  Skipped (already enhanced): ${product.name}`);
      skipped++;
      continue;
    }

    // Generate enhanced content
    const enhancedContent = generateEnhancedContent(product);

    // Add enhanced content to product
    product.enhancedContent = enhancedContent;
    product.lastUpdated = new Date().toISOString();

    // Write back to file
    fs.writeFileSync(productPath, JSON.stringify(product, null, 2));

    console.log(`  ✅ Enhanced: ${product.name}`);
    enhanced++;

  } catch (error) {
    console.error(`  ❌ Error processing ${template.file}:`, error.message);
    errors.push({ file: template.file, error: error.message });
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('BATCH 300-349 PROCESSING COMPLETE');
console.log('='.repeat(60));
console.log(`✅ Enhanced: ${enhanced}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log(`❌ Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(err => {
    console.log(`  - ${err.file}: ${err.error}`);
  });
}
