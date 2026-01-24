#!/usr/bin/env python3
import json
import os
from datetime import datetime
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
CONTENT_DIR = SCRIPT_DIR.parent / 'content' / 'products'
TEMPLATES_FILE = SCRIPT_DIR / 'templates-to-enhance.json'

# Load templates to enhance
with open(TEMPLATES_FILE, 'r') as f:
    all_templates = json.load(f)

# Extract batch 300-349
batch = all_templates[300:350]

print(f"Processing batch 300-349: {len(batch)} templates\n")

enhanced_count = 0
skipped_count = 0
errors = []

def generate_enhanced_content(product):
    """Generate comprehensive enhanced content for a product."""
    name = product.get('name', '')
    description = product.get('description', '')[:600]
    subcategory = product.get('subcategory', '')
    price = product.get('price', 0)

    # Generate content
    enhanced = {
        'overview': generate_overview(name, description, subcategory, price),
        'featureCategories': generate_feature_categories(name, subcategory),
        'problemsSolved': generate_problems(subcategory),
        'solutionsBenefits': generate_solutions(subcategory),
        'idealFor': generate_ideal_for(subcategory),
        'notRecommendedFor': [
            'Users who prefer physical/paper-based systems',
            'People uncomfortable with digital tools',
            'Those looking for a mobile-first solution (Notion mobile has limitations)',
            'Users who need offline access as primary feature'
        ],
        'complexityLevel': generate_complexity(price),
        'faqs': generate_faqs(name, subcategory)
    }

    return enhanced

def generate_overview(name, description, subcategory, price):
    """Generate 2-3 paragraph overview."""
    clean_desc = description.replace('\n', ' ').strip()

    return [
        f"The {name} is a comprehensive Notion {subcategory} template designed to streamline your workflow and enhance productivity. {clean_desc[:200] if clean_desc else 'This template provides all the essential tools you need to stay organized and achieve your goals with ease.'}",

        f"Built with both beginners and experienced Notion users in mind, this {subcategory} template features an intuitive interface and well-organized structure. The template is fully customizable, allowing you to adapt it to your specific needs while maintaining a professional, polished appearance.",

        f"{'Available as a free resource, this template delivers exceptional value without any financial commitment.' if price == 0 else f'At ${price}, this template offers excellent value for anyone serious about improving their {subcategory} workflow.'} Whether you're managing personal projects or professional work, this template provides the foundation you need to succeed."
    ]

def generate_feature_categories(name, subcategory):
    """Generate 4 feature categories with icons."""
    return [
        {
            'name': 'Core Features',
            'icon': '⚡',
            'features': [
                f'Comprehensive {subcategory} management system',
                'Intuitive database structure with multiple views',
                'Customizable fields and properties',
                'Easy-to-use interface for quick navigation'
            ]
        },
        {
            'name': 'Organization',
            'icon': '📊',
            'features': [
                'Multiple database views (table, board, calendar, gallery)',
                'Advanced filtering and sorting capabilities',
                'Tag and category system for easy classification',
                'Quick search and navigation features'
            ]
        },
        {
            'name': 'Productivity Tools',
            'icon': '🎯',
            'features': [
                'Template buttons for quick entry creation',
                'Automated formulas and calculations',
                'Progress tracking and status indicators',
                'Integration-ready database structure'
            ]
        },
        {
            'name': 'Customization',
            'icon': '🎨',
            'features': [
                'Fully customizable layout and design',
                'Flexible database properties',
                'Aesthetic and functional design elements',
                'Adaptable to your specific workflow needs'
            ]
        }
    ]

def generate_problems(subcategory):
    """Generate problems solved based on subcategory."""
    problem_map = {
        'tracker': [
            'Difficulty keeping track of multiple items across different platforms',
            'Lost or forgotten information',
            'Scattered data without centralized organization',
            'Lack of visibility into patterns and trends'
        ],
        'planner': [
            'Poor time management and scheduling conflicts',
            'Forgotten tasks and missed deadlines',
            'Inability to prioritize effectively',
            'Lack of clear overview of commitments'
        ],
        'dashboard': [
            'Information scattered across multiple tools',
            'No centralized view of important data',
            'Time wasted switching between applications',
            'Difficulty maintaining project oversight'
        ],
        'productivity': [
            'Low productivity and time wastage',
            'Unclear priorities and goals',
            'Difficulty maintaining focus on important work',
            'Lack of systematic progress tracking'
        ],
        'finance': [
            'Poor visibility into spending patterns',
            'Difficulty budgeting and achieving savings goals',
            'Disorganized financial records',
            'Lack of strategic financial planning'
        ],
        'journal': [
            'Inconsistent journaling habits',
            'Difficulty organizing thoughts and reflections',
            'Lost journal entries across multiple platforms',
            'Lack of structure for meaningful reflection'
        ],
        'goals': [
            'Unclear or undefined goals',
            'Difficulty tracking progress toward objectives',
            'Lack of accountability systems',
            'Goals forgotten or abandoned'
        ],
        'crm': [
            'Disorganized contact and customer information',
            'Poor relationship management',
            'Missed follow-ups and opportunities',
            'Lack of visibility into customer interactions'
        ],
        'content': [
            'Inconsistent content creation and publishing',
            'Difficulty brainstorming and organizing ideas',
            'Poor content calendar management',
            'Lack of content strategy and planning'
        ],
        'student': [
            'Overwhelming coursework and assignments',
            'Difficulty tracking multiple class schedules',
            'Disorganized study materials and notes',
            'Poor exam preparation and time management'
        ],
        'design': [
            'Scattered design assets and resources',
            'Difficulty managing design projects',
            'Poor version control and organization',
            'Lack of centralized design system'
        ],
        'project-management': [
            'Projects running over budget or timeline',
            'Poor team coordination and communication',
            'Lack of visibility into project status',
            'Difficulty managing multiple projects simultaneously'
        ],
        'reading': [
            'Books forgotten after completion',
            'Difficulty tracking reading progress',
            'No system for capturing book insights',
            'Lost book recommendations and notes'
        ],
        'second-brain': [
            'Information overload and mental clutter',
            'Forgotten ideas and valuable knowledge',
            'Difficulty connecting related concepts',
            'Inefficient personal knowledge management'
        ],
        'ai': [
            'Inefficient workflows without AI optimization',
            'Lack of structured AI tool integration',
            'Difficulty maximizing AI capabilities',
            'Scattered AI resources and prompts'
        ]
    }

    return problem_map.get(subcategory, [
        f'Disorganized {subcategory} management',
        'Time wasted on manual, repetitive processes',
        'Lack of systematic approach to workflow',
        'Difficulty maintaining consistency and quality'
    ])

def generate_solutions(subcategory):
    """Generate solutions/benefits based on subcategory."""
    solution_map = {
        'tracker': [
            'Complete visibility of all tracked items in one centralized location',
            'Never lose important information again',
            'Identify patterns and trends to make better decisions',
            'Save time with organized, accessible data'
        ],
        'planner': [
            'Clear overview of your schedule and all commitments',
            'Never miss important deadlines or events',
            'Prioritize tasks effectively for maximum impact',
            'Reduce stress with better planning and organization'
        ],
        'dashboard': [
            'All critical information accessible from one central hub',
            'Save hours by eliminating constant tool-switching',
            'Make faster, better-informed decisions',
            'Maintain complete oversight of all your projects'
        ],
        'productivity': [
            'Dramatically boost your productivity and output',
            'Focus on what truly matters with clear priorities',
            'Track progress and celebrate achievements',
            'Build sustainable productive habits'
        ],
        'finance': [
            'Take complete control of your financial situation',
            'Make informed decisions backed by data',
            'Achieve savings goals faster and more reliably',
            'Reduce financial stress and build confidence'
        ],
        'journal': [
            'Develop a consistent, rewarding journaling practice',
            'Organize thoughts and gain clarity',
            'Track personal growth over time',
            'Create a searchable archive of your reflections'
        ],
        'goals': [
            'Set clear, achievable goals with defined milestones',
            'Track progress systematically toward your objectives',
            'Stay motivated with visible achievements',
            'Turn aspirations into accomplished reality'
        ],
        'crm': [
            'Build stronger, more meaningful relationships',
            'Never miss important follow-ups or opportunities',
            'Maintain complete contact and interaction history',
            'Grow your network strategically'
        ],
        'content': [
            'Publish consistently with organized planning',
            'Never run out of content ideas',
            'Streamline content creation workflow',
            'Build an engaged audience with strategic content'
        ],
        'student': [
            'Excel academically with organized study systems',
            'Stay on top of all assignments and deadlines',
            'Reduce academic stress and anxiety',
            'Achieve better grades with less effort'
        ],
        'design': [
            'Access design assets instantly when needed',
            'Maintain consistency across all design work',
            'Collaborate effectively with team members',
            'Build and maintain comprehensive design systems'
        ],
        'project-management': [
            'Deliver projects on time and within budget',
            'Improve team coordination and productivity',
            'Maintain complete project visibility',
            'Successfully manage multiple complex projects'
        ],
        'reading': [
            'Remember and apply book insights long-term',
            'Track reading progress and set goals',
            'Build a personal library of wisdom',
            'Never forget what you read'
        ],
        'second-brain': [
            'Capture and organize all your valuable knowledge',
            'Never forget important ideas or insights',
            'Connect concepts to spark creativity',
            'Build a powerful personal knowledge repository'
        ],
        'ai': [
            'Maximize AI tools for peak productivity',
            'Access organized AI resources instantly',
            'Streamline workflows with AI integration',
            'Stay ahead with cutting-edge AI strategies'
        ]
    }

    return solution_map.get(subcategory, [
        f'Streamline your entire {subcategory} workflow',
        'Increase efficiency and reduce wasted effort',
        'Achieve better results with systematic organization',
        'Gain peace of mind with reliable systems'
    ])

def generate_ideal_for(subcategory):
    """Generate ideal user profiles."""
    ideal_map = {
        'tracker': [
            'Anyone managing multiple items or activities regularly',
            'Detail-oriented individuals who value organization',
            'People wanting to identify patterns in their data',
            'Users seeking centralized tracking solutions'
        ],
        'planner': [
            'Busy professionals juggling multiple commitments',
            'Students balancing coursework and activities',
            'Anyone wanting to improve time management',
            'People who prefer digital planning tools'
        ],
        'dashboard': [
            'Professionals needing quick access to key information',
            'Project managers coordinating multiple initiatives',
            'Entrepreneurs managing various business aspects',
            'Anyone valuing centralized workspace organization'
        ],
        'productivity': [
            'Individuals looking to boost efficiency',
            'People struggling with procrastination',
            'Goal-oriented users tracking progress',
            'Anyone developing better productive habits'
        ],
        'finance': [
            'Individuals gaining control of their finances',
            'People working toward savings goals',
            'Anyone understanding spending patterns',
            'Users making informed financial decisions'
        ]
    }

    return ideal_map.get(subcategory, [
        f'Anyone working with {subcategory} tasks regularly',
        'Notion users streamlining their workflows',
        'Individuals valuing organization and efficiency',
        'People seeking comprehensive management solutions'
    ])

def generate_complexity(price):
    """Generate complexity level based on price."""
    if price == 0:
        return {
            'level': 'beginner',
            'description': 'Easy to set up and use, perfect for Notion beginners',
            'setupTime': '5-10 minutes',
            'learningCurve': 'Gentle - intuitive interface with clear structure'
        }
    elif price < 10:
        return {
            'level': 'beginner-intermediate',
            'description': 'Straightforward setup with some advanced features',
            'setupTime': '15-20 minutes',
            'learningCurve': 'Moderate - some Notion familiarity helpful for advanced features'
        }
    else:
        return {
            'level': 'intermediate',
            'description': 'Comprehensive system with advanced customization',
            'setupTime': '20-30 minutes',
            'learningCurve': 'Moderate - best for users comfortable with Notion databases'
        }

def generate_faqs(name, subcategory):
    """Generate 4 FAQs."""
    return [
        {
            'question': 'Do I need a paid Notion account to use this template?',
            'answer': 'No, this template works perfectly with a free Notion account. Simply duplicate it to your workspace and start using it immediately.'
        },
        {
            'question': 'Can I customize this template to fit my specific needs?',
            'answer': 'Absolutely! This template is fully customizable. You can modify the layout, add or remove fields, change views, and adapt it to match your exact requirements.'
        },
        {
            'question': 'Is this template suitable for beginners?',
            'answer': 'Yes, this template is designed to be user-friendly for all Notion skill levels. It includes clear organization and intuitive structure that makes it easy to understand from day one.'
        },
        {
            'question': f'How do I get started with this {subcategory} template?',
            'answer': 'After purchase, you\'ll receive a link to duplicate the template. Click "Duplicate" in the top-right corner of Notion, and it will be added to your workspace ready to use.'
        }
    ]

# Process each template
for idx, template in enumerate(batch, start=300):
    try:
        product_file = CONTENT_DIR / template['file']

        if not product_file.exists():
            print(f"  ⚠️  [{idx}] File not found: {template['file']}")
            errors.append({'file': template['file'], 'error': 'File not found'})
            continue

        # Read product
        with open(product_file, 'r') as f:
            product = json.load(f)

        # Skip if already enhanced
        if 'enhancedContent' in product:
            print(f"  ⏭️  [{idx}] Skipped (already enhanced): {product.get('name', 'Unknown')}")
            skipped_count += 1
            continue

        # Generate enhanced content
        enhanced_content = generate_enhanced_content(product)

        # Add to product
        product['enhancedContent'] = enhanced_content
        product['lastUpdated'] = datetime.utcnow().isoformat() + 'Z'

        # Write back
        with open(product_file, 'w') as f:
            json.dump(product, f, indent=2, ensure_ascii=False)

        print(f"  ✅ [{idx}] Enhanced: {product.get('name', 'Unknown')}")
        enhanced_count += 1

    except Exception as e:
        print(f"  ❌ [{idx}] Error processing {template.get('file', 'unknown')}: {str(e)}")
        errors.append({'file': template.get('file', 'unknown'), 'error': str(e)})

# Summary
print('\n' + '='*60)
print('BATCH 300-349 PROCESSING COMPLETE')
print('='*60)
print(f'✅ Enhanced: {enhanced_count}')
print(f'⏭️  Skipped: {skipped_count}')
print(f'❌ Errors: {len(errors)}')

if errors:
    print('\nErrors:')
    for err in errors:
        print(f"  - {err['file']}: {err['error']}")
