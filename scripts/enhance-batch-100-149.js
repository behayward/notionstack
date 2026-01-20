#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const TEMPLATES_LIST = path.join(__dirname, 'templates-to-enhance.json');
const PRODUCTS_DIR = path.join(__dirname, '..', 'content', 'products');

// Load templates list
const allTemplates = JSON.parse(fs.readFileSync(TEMPLATES_LIST, 'utf8'));
const batch = allTemplates.slice(100, 150); // Templates 100-149

console.log(`Processing ${batch.length} templates (100-149)...`);

let successCount = 0;
let errorCount = 0;
const errors = [];

// Enhancement generator function
function generateEnhancement(product) {
  const name = product.name || '';
  const description = product.description || '';
  const subcategory = product.subcategory || '';
  const price = product.price || 0;

  // Extract key info from description
  const descLower = description.toLowerCase();
  const nameLower = name.toLowerCase();

  // Generate contextual content based on template characteristics
  let overview, featureCategories, problemsSolved, solutionsBenefits, idealFor, notRecommendedFor, complexityLevel;

  // Determine complexity based on description
  if (descLower.includes('beginner') || descLower.includes('simple') || descLower.includes('easy')) {
    complexityLevel = 'beginner';
  } else if (descLower.includes('advanced') || descLower.includes('complex') || descLower.includes('professional')) {
    complexityLevel = 'advanced';
  } else {
    complexityLevel = 'intermediate';
  }

  // Generate based on subcategory
  if (subcategory === 'planner') {
    overview = `This Notion ${name} is a comprehensive planning solution designed to help users organize their schedule, tasks, and goals in one centralized system. Whether you're managing personal projects, work responsibilities, or daily routines, this template provides the structure and flexibility to stay on top of everything. Built with Notion's powerful database and view options, it transforms chaotic to-do lists into an organized, actionable system that adapts to your workflow.`;

    featureCategories = [
      {
        category: "Planning & Scheduling",
        icon: "📅",
        features: [
          "Daily, weekly, and monthly planning views",
          "Task management with priorities and deadlines",
          "Goal tracking with progress indicators",
          "Calendar integration and timeline views"
        ]
      },
      {
        category: "Organization System",
        icon: "📊",
        features: [
          "Customizable database structures",
          "Multiple view options (calendar, list, board, gallery)",
          "Tags and categories for easy filtering",
          "Quick capture inbox for rapid task entry"
        ]
      },
      {
        category: "Productivity Tools",
        icon: "⚡",
        features: [
          "Habit tracking and routine builders",
          "Progress dashboards and analytics",
          "Note-taking and documentation spaces",
          "Template buttons for recurring tasks"
        ]
      }
    ];

    problemsSolved = [
      "Scattered tasks and commitments across multiple apps, notebooks, and sticky notes",
      "Difficulty prioritizing what matters most when everything feels urgent",
      "Lost track of long-term goals while managing daily firefighting"
    ];

    solutionsBenefits = [
      "Centralizes all planning, tasks, and goals in one Notion workspace with linked databases",
      "Provides visual priority systems and filtering to focus on high-impact work",
      "Connects daily actions to bigger goals with progress tracking and regular review prompts"
    ];

    idealFor = [
      "Busy professionals juggling multiple projects and responsibilities",
      "Students managing coursework, extracurriculars, and personal goals",
      "Entrepreneurs and freelancers who need flexible planning systems",
      "Anyone transitioning from paper planners to digital organization"
    ];

    notRecommendedFor = [
      "Users who prefer simple, linear to-do lists without customization options",
      "People completely new to Notion who haven't explored the basics yet"
    ];

  } else if (subcategory === 'dashboard') {
    overview = `The ${name} is an all-in-one command center that brings together your most important information, metrics, and tools into a single Notion interface. Instead of jumping between multiple pages and databases, this dashboard provides instant visibility into your work, goals, habits, and progress. Designed for users who want a comprehensive overview at a glance, it combines widgets, embedded views, and quick-access links to create your personal productivity headquarters.`;

    featureCategories = [
      {
        category: "Central Hub",
        icon: "🎯",
        features: [
          "Unified view of all active projects and tasks",
          "Quick-access navigation to key pages",
          "Embedded database views and widgets",
          "Customizable layout and sections"
        ]
      },
      {
        category: "Analytics & Insights",
        icon: "📈",
        features: [
          "Progress tracking for goals and projects",
          "Visual charts and progress bars",
          "Streak counters and completion rates",
          "Summary statistics and key metrics"
        ]
      },
      {
        category: "Quick Actions",
        icon: "⚡",
        features: [
          "Template buttons for common workflows",
          "Quick capture forms and inputs",
          "Linked database filters and views",
          "One-click access to frequently used pages"
        ]
      }
    ];

    problemsSolved = [
      "Information scattered across dozens of Notion pages makes it hard to see the big picture",
      "Starting each day unsure of priorities because there's no central overview",
      "Wasting time navigating through nested pages to find what you need"
    ];

    solutionsBenefits = [
      "Creates a single source of truth that aggregates all important data and links in one view",
      "Surfaces today's priorities, active projects, and key metrics automatically on the dashboard",
      "Reduces clicks and navigation time with quick-access links and embedded views"
    ];

    idealFor = [
      "Power users managing multiple projects and life areas in Notion",
      "Professionals who need instant visibility into work progress and priorities",
      "Anyone with a complex Notion workspace that's become difficult to navigate",
      "Visual thinkers who benefit from seeing everything at a glance"
    ];

    notRecommendedFor = [
      "Notion beginners who haven't built out their workspace yet",
      "Minimalists who prefer simple, focused single-purpose pages"
    ];

  } else if (subcategory === 'tracker') {
    overview = `This ${name} is a specialized tracking system built in Notion to help you monitor, measure, and improve specific aspects of your life or work. Whether you're tracking habits, expenses, projects, or other metrics, this template provides a structured approach to data collection and analysis. With customizable fields, multiple views, and progress visualizations, it transforms raw tracking data into actionable insights that help you make better decisions and stay accountable to your goals.`;

    featureCategories = [
      {
        category: "Data Tracking",
        icon: "📊",
        features: [
          "Custom database fields for your specific tracking needs",
          "Easy data entry with templates and forms",
          "Date-based tracking with calendar views",
          "Tags and categories for detailed organization"
        ]
      },
      {
        category: "Visualization & Analysis",
        icon: "📈",
        features: [
          "Multiple view options (table, calendar, timeline, gallery)",
          "Progress indicators and completion tracking",
          "Filtering and sorting for pattern identification",
          "Summary statistics and rollup calculations"
        ]
      },
      {
        category: "Insights & Reporting",
        icon: "💡",
        features: [
          "Trend analysis over time periods",
          "Comparative views for before/after analysis",
          "Goal progress monitoring",
          "Reflection prompts and notes sections"
        ]
      }
    ];

    problemsSolved = [
      "Inconsistent tracking across different apps, spreadsheets, and notebooks",
      "Difficulty spotting patterns and trends without proper visualization",
      "Lost motivation from tracking without seeing progress or insights"
    ];

    solutionsBenefits = [
      "Centralizes all tracking in Notion alongside your other productivity systems",
      "Provides visual feedback and analytics that reveal patterns and progress over time",
      "Makes tracking habitual with easy entry methods and motivating progress views"
    ];

    idealFor = [
      "Data-driven individuals who want to measure and optimize specific areas",
      "People building new habits who need accountability and visibility",
      "Users tracking business metrics, personal finance, or health data",
      "Anyone who's tried tracking before but struggled with complicated systems"
    ];

    notRecommendedFor = [
      "Users seeking automated tracking without manual data entry",
      "People who find detailed tracking demotivating rather than helpful"
    ];

  } else if (subcategory === 'productivity') {
    overview = `The ${name} is a comprehensive productivity system designed to help you work smarter, accomplish more, and maintain sustainable high performance. This template combines proven productivity methodologies with Notion's flexibility, offering tools for task management, time blocking, focus sessions, and progress tracking. Whether you're fighting procrastination, drowning in tasks, or simply want to optimize your workflow, this system provides the structure and accountability needed to reach your peak productivity.`;

    featureCategories = [
      {
        category: "Task Management",
        icon: "✅",
        features: [
          "Priority-based task organization",
          "Project and sub-task breakdown structures",
          "Deadline tracking with reminders",
          "Multiple productivity views (Kanban, list, calendar)"
        ]
      },
      {
        category: "Focus & Time Management",
        icon: "⏰",
        features: [
          "Time blocking and schedule planning",
          "Focus session tracking",
          "Pomodoro timer integration suggestions",
          "Deep work vs. shallow work categorization"
        ]
      },
      {
        category: "Progress & Analytics",
        icon: "📈",
        features: [
          "Completion rate tracking",
          "Productivity metrics and insights",
          "Weekly review templates",
          "Goal progress visualization"
        ]
      },
      {
        category: "Workflow Optimization",
        icon: "⚡",
        features: [
          "Template buttons for recurring workflows",
          "Quick capture inbox",
          "Linked databases for context switching",
          "Custom views for different work modes"
        ]
      }
    ];

    problemsSolved = [
      "Constant feeling of being busy but not actually accomplishing meaningful work",
      "Difficulty focusing with distractions and lack of structured work periods",
      "No clear system for prioritizing tasks, leading to working on urgent but unimportant items"
    ];

    solutionsBenefits = [
      "Separates busy work from high-impact tasks with built-in prioritization frameworks",
      "Creates dedicated focus blocks and tracks deep work sessions for better concentration",
      "Provides a clear decision-making system for what to work on next based on priorities and deadlines"
    ];

    idealFor = [
      "Knowledge workers and creatives who struggle with focus and prioritization",
      "Entrepreneurs and freelancers managing their own time and multiple projects",
      "Students wanting to optimize study time and academic performance",
      "Anyone feeling overwhelmed by tasks and seeking a proven productivity system"
    ];

    notRecommendedFor = [
      "People who work better with minimal structure and spontaneous workflows",
      "Users seeking simple to-do lists without advanced productivity features"
    ];

  } else if (subcategory === 'finance') {
    overview = `This ${name} is a comprehensive financial management system built in Notion to help you take control of your money, track spending, and work toward your financial goals. From budgeting and expense tracking to savings goals and financial analytics, this template provides the tools and structure needed for complete financial visibility. Unlike complex spreadsheets or rigid budgeting apps, this Notion-based system offers flexibility, customization, and the ability to integrate your financial tracking with your broader life management workspace.`;

    featureCategories = [
      {
        category: "Income & Expense Tracking",
        icon: "💰",
        features: [
          "Transaction logging with categories",
          "Income source tracking",
          "Expense categorization and tagging",
          "Receipt and document attachment"
        ]
      },
      {
        category: "Budgeting & Planning",
        icon: "📊",
        features: [
          "Monthly budget creation and monitoring",
          "Category-based spending limits",
          "Budget vs. actual comparisons",
          "Savings and investment goal tracking"
        ]
      },
      {
        category: "Financial Analytics",
        icon: "📈",
        features: [
          "Spending patterns and trend analysis",
          "Net worth tracking over time",
          "Category breakdowns and visualizations",
          "Monthly and yearly financial summaries"
        ]
      },
      {
        category: "Goal Management",
        icon: "🎯",
        features: [
          "Savings goals with progress tracking",
          "Debt payoff planning and monitoring",
          "Emergency fund tracking",
          "Long-term financial milestone planning"
        ]
      }
    ];

    problemsSolved": [
      "No clear picture of where money is actually going each month",
      "Budgets created but never followed due to lack of tracking and accountability",
      "Financial stress from not knowing if you're on track to meet savings goals"
    ];

    solutionsBenefits": [
      "Provides complete spending visibility through categorized transaction tracking and visual analytics",
      "Makes budgets actionable with real-time tracking against limits and automatic calculations",
      "Creates motivation and clarity by visualizing progress toward savings goals and debt payoff"
    ];

    idealFor": [
      "Individuals and couples wanting to take control of their personal finances",
      "Freelancers and entrepreneurs tracking business and personal expenses separately",
      "Anyone working toward specific financial goals like debt freedom or large purchases",
      "Notion users who want financial tracking integrated with their productivity system"
    ];

    notRecommendedFor": [
      "Users needing automatic bank feed integration (Notion requires manual entry)",
      "People who prefer dedicated financial apps with built-in investment tracking"
    ];

  } else {
    // Generic template enhancement
    overview = `This ${name} provides a structured Notion workspace designed to help users organize, track, and manage their ${subcategory || 'work'} more effectively. Built with Notion's flexible database system, this template offers pre-configured pages, views, and workflows that you can immediately start using and customize to match your specific needs. Whether you're looking to streamline existing processes or build new organizational systems, this template provides a solid foundation.`;

    featureCategories = [
      {
        category: "Core Organization",
        icon: "📋",
        features: [
          "Pre-built database structures",
          "Multiple view options (list, board, calendar, gallery)",
          "Customizable properties and fields",
          "Tags and categories for filtering"
        ]
      },
      {
        category: "Workflow Tools",
        icon: "⚙️",
        features: [
          "Template buttons for common tasks",
          "Linked databases for connected information",
          "Quick capture and entry methods",
          "Custom filters and sorting options"
        ]
      },
      {
        category: "Tracking & Progress",
        icon: "📈",
        features: [
          "Progress indicators and status tracking",
          "Timeline and calendar views",
          "Summary rollups and calculations",
          "Archive and historical record keeping"
        ]
      }
    ];

    problemsSolved = [
      "Starting from scratch in Notion feels overwhelming without a clear structure",
      "Existing systems are chaotic and difficult to navigate",
      "No standardized process for tracking and managing information"
    ];

    solutionsBenefits = [
      "Provides a ready-to-use structure that eliminates blank page paralysis",
      "Organizes information with proven database designs and view configurations",
      "Establishes consistent workflows through templates and linked systems"
    ];

    idealFor = [
      "Notion users wanting a head start with proven templates",
      "People new to Notion seeking structured examples to learn from",
      "Anyone looking to save time building organizational systems from scratch",
      "Users wanting to standardize their workflow and processes"
    ];

    notRecommendedFor = [
      "Advanced Notion users who prefer building fully custom systems",
      "People seeking highly specialized workflows not covered by the template"
    ];
  }

  // Generate FAQs
  const faqs = [
    {
      question: "How do I get started with this template?",
      answer: `After duplicating this template to your Notion workspace, spend a few minutes exploring the pre-built pages and databases to understand the structure. Then, start customizing the properties, views, and content to match your specific needs. Most users find it helpful to start with one section and gradually expand usage as they become comfortable with the system.`
    },
    {
      question: "What's included in this template?",
      answer: `This template includes ${featureCategories.length} main organizational sections with pre-configured databases, multiple view options, customizable properties, and workflow tools. You'll find ready-to-use pages for tracking, planning, and organizing your ${subcategory || 'work'}, along with template buttons and linked databases for efficient workflows.`
    },
    {
      question: "Can I customize this template?",
      answer: "Yes, this template is fully customizable within Notion. You can modify database properties, add or remove fields, create new views, adjust the layout, change colors and icons, and adapt any part of the structure to match your workflow. The template serves as a foundation that you can build upon and personalize."
    },
    {
      question: "What are the main use cases?",
      answer: `This template is ideal for ${idealFor[0]?.toLowerCase() || 'organizing your work'}. Common use cases include daily planning and tracking, project management, progress monitoring, centralized information organization, and building consistent workflows. It's designed to adapt to various ${subcategory || 'organizational'} needs.`
    }
  ];

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

// Process each template
batch.forEach((template, index) => {
  const templateNum = 100 + index;
  try {
    const filename = template.file;
    if (!filename) {
      console.log(`Template ${templateNum}: Skipping - no filename`);
      errorCount++;
      return;
    }

    const productPath = path.join(PRODUCTS_DIR, filename);

    if (!fs.existsSync(productPath)) {
      console.log(`Template ${templateNum}: ERROR - File not found: ${filename}`);
      errors.push({ templateNum, filename, error: 'File not found' });
      errorCount++;
      return;
    }

    // Read product file
    const product = JSON.parse(fs.readFileSync(productPath, 'utf8'));

    // Skip if already enhanced
    if (product.enhancedContent) {
      console.log(`Template ${templateNum}: Skipping - already enhanced (${product.name})`);
      return;
    }

    // Generate enhancement
    const enhancement = generateEnhancement(product);

    // Add enhancement to product
    product.enhancedContent = enhancement;
    product.lastUpdated = new Date().toISOString();

    // Save updated product
    fs.writeFileSync(productPath, JSON.stringify(product, null, 2));

    console.log(`Template ${templateNum}: ✓ Enhanced - ${product.name}`);
    successCount++;

  } catch (error) {
    console.log(`Template ${templateNum}: ERROR - ${error.message}`);
    errors.push({ templateNum, filename: template.file, error: error.message });
    errorCount++;
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('ENHANCEMENT COMPLETE');
console.log('='.repeat(60));
console.log(`Successfully enhanced: ${successCount} templates`);
console.log(`Errors: ${errorCount}`);
console.log(`Total processed: ${batch.length}`);

if (errors.length > 0) {
  console.log('\nErrors encountered:');
  errors.forEach(err => {
    console.log(`  Template ${err.templateNum} (${err.filename}): ${err.error}`);
  });
}
