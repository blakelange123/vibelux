// Comprehensive 15-tier subscription system showcasing all Vibelux features
export interface SubscriptionTier15 {
  id: string;
  name: string;
  tagline: string;
  price: number;
  priceAnnual?: number;
  description: string;
  targetAudience: string;
  color: string; // For UI theming
  icon: string; // Icon name for the tier
  limits: {
    projects: number;
    teamMembers: number;
    fixtures: number;
    apiCalls?: number;
    aiCredits?: number;
    exportFormats: string[];
    supportLevel: string;
    dataRetention: number; // days
    monthlySOPs?: number;
    monthlyAIRecommendations?: number;
  };
  features: string[]; // Human-readable feature list
  highlighted?: boolean;
  popular?: boolean;
  newTier?: boolean; // For highlighting new additions
}

export const SUBSCRIPTION_TIERS_15: SubscriptionTier15[] = [
  // TIER 1: FREE
  {
    id: 'free',
    name: 'Free Explorer',
    tagline: 'Learn the basics of grow lighting',
    price: 0,
    description: 'Essential calculators and learning resources for beginners',
    targetAudience: 'Students, hobbyists exploring indoor growing',
    color: 'gray',
    icon: 'Sparkles',
    limits: {
      projects: 1,
      teamMembers: 1,
      fixtures: 50,
      exportFormats: ['pdf'],
      supportLevel: 'Community forums',
      dataRetention: 7
    },
    features: [
      'PPFD Calculator with instant μmol/m²/s calculations',
      'DLI Calculator for daily light integral planning',
      'VPD Calculator with temperature/humidity optimization',
      'Basic energy cost estimator (kWh usage)',
      'Fertilizer calculator with basic nutrient targets',
      'Access to 50 popular DLC-certified fixtures',
      'Simple 2D room layout designer',
      'Single point PPFD measurements',
      'Basic spectrum viewer (RGB ratios)',
      '1 saved project with 7-day cloud storage',
      'PDF export for basic reports',
      'Access to educational videos and guides',
      'Community forum participation',
      'Email support (48-hour response)'
    ]
  },

  // TIER 2: HOBBYIST
  {
    id: 'hobbyist',
    name: 'Hobbyist',
    tagline: 'Perfect for home grows and small tents',
    price: 9,
    priceAnnual: 86,
    description: 'Advanced calculators and basic design tools for personal grows',
    targetAudience: 'Home growers, medical patients, small tent growers',
    color: 'green',
    icon: 'Home',
    limits: {
      projects: 5,
      teamMembers: 1,
      fixtures: 500,
      exportFormats: ['pdf', 'csv'],
      supportLevel: 'Email support',
      dataRetention: 30
    },
    features: [
      'Everything in Free Explorer',
      'Advanced DLI Calculator with crop-specific targets',
      'Heat Load Calculator (BTU/hr from lighting)',
      'Simple ROI Calculator with energy savings',
      'Advanced fertilizer formulation calculator',
      'Nutrient dosing calculator with tank mixing',
      'Access to 500 DLC-certified fixtures',
      'Side-by-side fixture comparison (up to 3)',
      'Basic heat map visualization in 2D',
      'Multi-point PPFD grid calculations',
      'Canopy height adjustment tools',
      'Basic uniformity calculations',
      'Environmental alerts for temp/humidity',
      'Mobile app access (view-only)',
      '5 saved projects with 30-day storage',
      'CSV and PDF export options',
      'Priority email support'
    ]
  },

  // TIER 3: ENTHUSIAST
  {
    id: 'enthusiast',
    name: 'Enthusiast',
    tagline: 'For serious hobbyists with multiple grows',
    price: 19,
    priceAnnual: 182,
    description: 'Enhanced tools for dedicated growers managing multiple spaces',
    targetAudience: 'Serious hobbyists, small greenhouse owners, consultants starting out',
    color: 'blue',
    icon: 'Flower2',
    limits: {
      projects: 10,
      teamMembers: 1,
      fixtures: 1000,
      exportFormats: ['pdf', 'csv', 'json'],
      supportLevel: 'Email support',
      dataRetention: 60
    },
    features: [
      'Everything in Hobbyist',
      'Full DLC database access (2,437 DLC-certified fixtures)',
      'Basic 3D room visualization with multiple viewing angles',
      'Production planning system with crop templates',
      'Psychrometric calculator for greenhouse conditions',
      'Uniformity analyzer with CV% and min/max ratios',
      'Electrical estimator for basic load calculations',
      'Spectrum analysis with PAR breakdown by wavelength',
      'Basic nutrient calculator with N-P-K ratios',
      'Photoperiod scheduling for vegetative/flowering cycles',
      'Environmental monitoring dashboard',
      'Heat map generation with color gradients',
      'Fixture aging predictions and replacement alerts',
      'Custom fixture comparison tool',
      'CSV, PDF, and JSON export options',
      '10 saved projects with 60-day cloud storage',
      'Basic ROI calculator with payback period'
    ],
    newTier: true
  },

  // TIER 4: STARTER PRO
  {
    id: 'starter-pro',
    name: 'Starter Pro',
    tagline: 'Professional tools for small commercial ops',
    price: 39,
    priceAnnual: 374,
    description: 'Core professional features for commercial cultivation',
    targetAudience: 'Small farms, startup operations, junior consultants',
    color: 'purple',
    icon: 'Briefcase',
    limits: {
      projects: 25,
      teamMembers: 2,
      fixtures: -1,
      exportFormats: ['pdf', 'csv', 'json', 'dwg'],
      supportLevel: 'Priority email',
      dataRetention: 90,
      monthlyAIRecommendations: 10
    },
    features: [
      'Everything in Enthusiast',
      'Professional 3D design studio with ray tracing',
      'Advanced shadow mapping and overlap analysis',
      'Electrical load balancing across circuits',
      'Wire gauge calculator with voltage drop',
      'Detailed energy cost analysis with time-of-use rates',
      'Advanced photoperiod scheduler with dimming curves',
      'Maintenance scheduler with email reminders',
      'AI-powered spectrum recommendations (10/month)',
      'Multi-tier/vertical farming support',
      'Reflectance modeling for walls/surfaces',
      'Custom fixture creation and import',
      'CAD export (DWG/DXF formats)',
      'API access (1000 calls/month)',
      '25 projects with 90-day storage',
      '2 team member seats',
      'Priority email and chat support'
    ]
  },

  // TIER 5: PROFESSIONAL
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Complete toolkit for lighting professionals',
    price: 79,
    priceAnnual: 758,
    description: 'Comprehensive tools for professional designers and consultants',
    targetAudience: 'Lighting designers, consultants, medium-sized farms',
    color: 'indigo',
    icon: 'Zap',
    limits: {
      projects: 100,
      teamMembers: 3,
      fixtures: -1,
      apiCalls: 1000,
      aiCredits: 100,
      exportFormats: ['pdf', 'csv', 'json', 'dwg', 'ies'],
      supportLevel: 'Priority email + chat',
      dataRetention: 180,
      monthlySOPs: 10,
      monthlyAIRecommendations: 50
    },
    features: [
      'Everything in Starter Pro',
      'AI-powered auto-arrangement optimization',
      'Advanced object properties with custom parameters',
      'Multi-layer design for vertical farms',
      'Professional circuit planning with panel schedules',
      'Peak demand analysis and load shedding',
      'AI SOP Generator with intelligent automation (10/mo)',
      'Professional nutrient calculator with 20+ elements',
      'Cross-section analyzer for light penetration',
      'IES file import/export for manufacturer data',
      'Photosynthetic photon flux density (PPFD) animations',
      'Time-lapse growth simulations',
      'Custom report templates and branding',
      'Batch project operations',
      'Advanced API access (1000 calls/month)',
      'Team collaboration for 3 users',
      'Version control with rollback',
      'Priority phone and chat support',
      'Monthly webinar access'
    ],
    popular: true,
    highlighted: true
  },

  // TIER 6: ADVANCED
  {
    id: 'advanced',
    name: 'Advanced',
    tagline: 'Scientific precision for optimization',
    price: 149,
    priceAnnual: 1430,
    description: 'Advanced analytics and scientific modeling tools',
    targetAudience: 'Large farms, research facilities, senior consultants',
    color: 'orange',
    icon: 'Microscope',
    limits: {
      projects: -1,
      teamMembers: 5,
      fixtures: -1,
      apiCalls: 5000,
      aiCredits: 500,
      exportFormats: ['all'],
      supportLevel: 'Phone support',
      dataRetention: 365,
      monthlySOPs: 50,
      monthlyAIRecommendations: 200
    },
    features: [
      'Everything in Professional',
      'Advanced photosynthetic modeling with quantum yield',
      'Carbon footprint tracking and offset calculations',
      'Weather-adaptive lighting with real-time adjustments',
      'Professional uniformity analyzer with statistical tools',
      'Intelligent crop rotation planner with yield optimization',
      'Complete compliance audit trail for certifications',
      'Automated document generation for permits/reports',
      'Custom spectrum designer with photomorphogenic targets',
      'Phytochrome photostationary state (PSS) calculations',
      'McCree action spectrum integration',
      'Solar radiation and DLI supplementation analysis',
      'Greenhouse supplemental lighting optimization',
      'Water use efficiency calculations',
      'Integrated pest management (IPM) lighting protocols',
      'Research-grade data export',
      'Unlimited projects and team members (5)',
      'Dedicated phone support line',
      'Quarterly business reviews'
    ]
  },

  // TIER 7: ENTERPRISE
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'AI-powered platform for scale',
    price: 299,
    priceAnnual: 2870,
    description: 'Machine learning and predictive analytics for large operations',
    targetAudience: 'Large commercial farms, multi-site operations',
    color: 'red',
    icon: 'Building',
    limits: {
      projects: -1,
      teamMembers: 10,
      fixtures: -1,
      apiCalls: -1,
      aiCredits: 1000,
      exportFormats: ['all'],
      supportLevel: '24/7 phone support',
      dataRetention: -1,
      monthlySOPs: -1,
      monthlyAIRecommendations: -1
    },
    features: [
      'Everything in Advanced',
      'Machine learning yield prediction models',
      'AI-driven growth optimization algorithms',
      'Predictive maintenance with failure alerts',
      'AI crop advisor with real-time recommendations',
      'Complete IoT device management platform',
      'Sensor integration (temperature, humidity, CO2, light)',
      'Custom dashboard configurations',
      'Blockchain-verified carbon credit generation',
      'Multi-crop optimization and scheduling',
      'Advanced data export with SQL access',
      'Webhook integrations for automation',
      'RESTful API with unlimited calls',
      'Team workspace for up to 10 members',
      'White-label report generation',
      'Priority feature development input',
      'Priority customer support',
      'Priority email support with SLA',
      'SLA guarantee (99.9% uptime)'
    ]
  },

  // TIER 8: ENTERPRISE PLUS
  {
    id: 'enterprise-plus',
    name: 'Enterprise Plus',
    tagline: 'Premium features for industry leaders',
    price: 499,
    priceAnnual: 4790,
    description: 'Complete platform with advanced integrations',
    targetAudience: 'Industry leaders, large greenhouse operations',
    color: 'pink',
    icon: 'Rocket',
    limits: {
      projects: -1,
      teamMembers: 25,
      fixtures: -1,
      apiCalls: -1,
      aiCredits: -1,
      exportFormats: ['all'],
      supportLevel: 'Dedicated success manager',
      dataRetention: -1,
      monthlySOPs: -1,
      monthlyAIRecommendations: -1
    },
    features: [
      'Everything in Enterprise',
      'Smart greenhouse integration',
      'ERP integration',
      'Salesforce integration',
      'Packaging equipment API',
      'Custom nutrient formulations',
      'Regional solar analysis',
      'NREL API integration',
      'Thermal imaging viewer',
      'Certificate generation',
      'Role-based access control',
      '25 team members',
      'Dedicated success manager'
    ],
    newTier: true
  },

  // TIER 9: CORPORATE
  {
    id: 'corporate',
    name: 'Corporate',
    tagline: 'Multi-site management and white-label',
    price: 799,
    priceAnnual: 7670,
    description: 'Enterprise platform with multi-site and branding options',
    targetAudience: 'Multi-location operations, franchises, consultancy firms',
    color: 'yellow',
    icon: 'Globe',
    limits: {
      projects: -1,
      teamMembers: 50,
      fixtures: -1,
      apiCalls: -1,
      aiCredits: -1,
      exportFormats: ['all'],
      supportLevel: 'Dedicated account team',
      dataRetention: -1,
      monthlySOPs: -1,
      monthlyAIRecommendations: -1
    },
    features: [
      'Everything in Enterprise Plus',
      'Multi-site management',
      'White-label options',
      'Enterprise authentication (coming soon)',
      'Custom integrations',
      'Batch operations',
      'Advanced version control',
      'Custom reporting builder',
      'Equipment leasing calculator',
      'SLA guarantee',
      '50 team members',
      'Quarterly business reviews',
      'Custom training programs'
    ]
  },

  // TIER 10: CORPORATE ELITE
  {
    id: 'corporate-elite',
    name: 'Corporate Elite',
    tagline: 'Unlimited everything for mega operations',
    price: 1299,
    priceAnnual: 12470,
    description: 'No limits platform for the largest operations',
    targetAudience: 'Mega farms, equipment manufacturers, Fortune 500',
    color: 'emerald',
    icon: 'Crown',
    limits: {
      projects: -1,
      teamMembers: -1,
      fixtures: -1,
      apiCalls: -1,
      aiCredits: -1,
      exportFormats: ['all'],
      supportLevel: 'Executive support team',
      dataRetention: -1,
      monthlySOPs: -1,
      monthlyAIRecommendations: -1
    },
    features: [
      'Everything in Corporate',
      'Unlimited team members',
      'Private cloud deployment',
      'Advanced ML predictions',
      'Priority feature development',
      'Executive dashboard',
      'Compliance certifications',
      'Enterprise SLA agreement',
      'Dedicated cloud deployment',
      'Priority feature requests',
      'Custom API endpoints',
      'Guaranteed uptime 99.99%'
    ],
    newTier: true
  },

  // TIER 11: CONSULTANT
  {
    id: 'consultant',
    name: 'Consultant',
    tagline: 'Built for lighting design professionals',
    price: 199,
    priceAnnual: 1910,
    description: 'Specialized tools for consultants and designers',
    targetAudience: 'Independent consultants, design firms, contractors',
    color: 'teal',
    icon: 'Users',
    limits: {
      projects: -1,
      teamMembers: 5,
      fixtures: -1,
      apiCalls: 10000,
      aiCredits: 1000,
      exportFormats: ['all'],
      supportLevel: 'Priority phone support',
      dataRetention: -1,
      monthlySOPs: 100,
      monthlyAIRecommendations: 500
    },
    features: [
      'All Professional features',
      'Unlimited client projects',
      'White-label reports',
      'Client portal access',
      'Project templates library',
      'Bulk project import/export',
      'Custom branding options',
      'Proposal generator',
      'Time tracking integration',
      'Invoice integration',
      'Priority phone support',
      'Consultant community access'
    ],
    newTier: true
  },

  // TIER 12: ACADEMIC
  {
    id: 'academic',
    name: 'Academic',
    tagline: 'Education and research focused',
    price: 99,
    priceAnnual: 950,
    description: 'Full-featured platform for educational institutions',
    targetAudience: 'Universities, colleges, agricultural schools, research labs',
    color: 'cyan',
    icon: 'GraduationCap',
    limits: {
      projects: -1,
      teamMembers: 100,
      fixtures: -1,
      apiCalls: -1,
      aiCredits: 2000,
      exportFormats: ['all'],
      supportLevel: 'Academic support team',
      dataRetention: -1,
      monthlySOPs: -1,
      monthlyAIRecommendations: -1
    },
    features: [
      'All Advanced features',
      '100 student accounts',
      'Classroom management',
      'Curriculum integration',
      'Research data export',
      'Publication templates',
      'Grant writing tools',
      'Workshop materials',
      'Guest lecturer access',
      'Academic community',
      'Research collaboration tools',
      'Non-commercial use only'
    ]
  },

  // TIER 13: RESEARCH
  {
    id: 'research',
    name: 'Research Pro',
    tagline: 'Scientific precision for research',
    price: 399,
    priceAnnual: 3830,
    description: 'Advanced scientific tools for research institutions',
    targetAudience: 'Research institutions, R&D departments, plant scientists',
    color: 'violet',
    icon: 'Beaker',
    limits: {
      projects: -1,
      teamMembers: 25,
      fixtures: -1,
      apiCalls: -1,
      aiCredits: -1,
      exportFormats: ['all'],
      supportLevel: 'Research support team',
      dataRetention: -1,
      monthlySOPs: -1,
      monthlyAIRecommendations: -1
    },
    features: [
      'Everything in Academic',
      'Custom photosynthesis models',
      'Photomorphogenic modeling',
      'Advanced phytochrome tools',
      'Custom action spectra',
      'Research API access',
      'Raw data export',
      'Statistical analysis tools',
      'Peer review features',
      'Experiment tracking',
      'Custom algorithms',
      'Priority bug fixes',
      'Direct scientist support'
    ],
    newTier: true
  },

  // TIER 14: GOVERNMENT
  {
    id: 'government',
    name: 'Government',
    tagline: 'Secure platform for agencies',
    price: 599,
    priceAnnual: 5750,
    description: 'FedRAMP ready platform for government use',
    targetAudience: 'Government agencies, military, public institutions',
    color: 'slate',
    icon: 'Shield',
    limits: {
      projects: -1,
      teamMembers: -1,
      fixtures: -1,
      apiCalls: -1,
      aiCredits: -1,
      exportFormats: ['all'],
      supportLevel: 'Government liaison',
      dataRetention: -1,
      monthlySOPs: -1,
      monthlyAIRecommendations: -1
    },
    features: [
      'All Enterprise features',
      'FedRAMP compliance ready',
      'FISMA compliance tools',
      'Secure cloud deployment',
      'Enhanced security features',
      'Audit logging',
      'Data sovereignty options',
      'GSA schedule pricing',
      'Unlimited users',
      'Custom security review',
      'Dedicated gov cloud',
      'Clearance-based access'
    ],
    newTier: true
  },

  // TIER 15: CUSTOM
  {
    id: 'custom',
    name: 'Custom Enterprise',
    tagline: 'Tailored solutions for unique needs',
    price: -1, // Contact for pricing
    description: 'Completely customized platform for specific requirements',
    targetAudience: 'Unique use cases, special requirements, innovation partners',
    color: 'rose',
    icon: 'Wrench',
    limits: {
      projects: -1,
      teamMembers: -1,
      fixtures: -1,
      apiCalls: -1,
      aiCredits: -1,
      exportFormats: ['all'],
      supportLevel: 'Custom SLA',
      dataRetention: -1,
      monthlySOPs: -1,
      monthlyAIRecommendations: -1
    },
    features: [
      'Completely customizable feature set',
      'Custom development team',
      'Bespoke integrations',
      'Custom UI/UX design',
      'Proprietary algorithms',
      'Joint development opportunities',
      'Revenue sharing options',
      'Co-branding opportunities',
      'Innovation partnership',
      'Board advisory option',
      'Equity participation possible',
      'Define your own SLA'
    ]
  },

  // TIER 16: VIBELUX CAPITAL - Investment Platform
  {
    id: 'capital',
    name: 'VibeLux Capital',
    tagline: 'Investment platform for GaaS/YEP programs',
    price: 2999,
    priceAnnual: 29999,
    description: 'Complete investment management platform for Growing as a Service and Yield Enhancement Programs',
    targetAudience: 'Private equity, family offices, impact investors, infrastructure funds',
    color: 'emerald',
    icon: 'TrendingUp',
    limits: {
      projects: -1, // Unlimited facilities
      teamMembers: -1, // Unlimited team
      fixtures: -1, // Unlimited
      apiCalls: -1, // Unlimited
      aiCredits: -1, // Unlimited
      exportFormats: ['pdf', 'excel', 'csv', 'api', 'custom'],
      supportLevel: 'Priority 24/7 + Investment Advisory',
      dataRetention: -1, // Forever
      monthlySOPs: -1,
      monthlyAIRecommendations: -1
    },
    features: [
      // Everything from Enterprise tier
      'Everything in Enterprise tier',
      
      // Investment Platform Core
      'GaaS (Growing as a Service) platform',
      'YEP (Yield Enhancement Program) management',
      'Hybrid investment models',
      'Multi-facility portfolio management',
      'Investor portal with real-time dashboards',
      
      // Deal Flow Management
      'Deal pipeline CRM',
      'Investment proposal generator',
      'AI-powered opportunity scoring',
      'Risk assessment automation',
      'Due diligence workflow',
      'Contract template library',
      
      // Performance Tracking
      'Automated baseline establishment',
      'Real-time yield tracking across portfolio',
      'Performance-based billing engine',
      'Revenue sharing calculations',
      'Statistical confidence intervals',
      'Anomaly detection & alerts',
      
      // Financial Features
      'IRR & ROI calculations',
      'Cash flow projections',
      'Portfolio risk analytics',
      'Payment automation via ACH/wire',
      'Multi-party payment distribution',
      'Blockchain verification option',
      
      // Compliance & Reporting
      'Investment compliance tracking',
      'Automated investor reporting',
      'Audit trail for all transactions',
      'SEC-compliant documentation',
      'Tax reporting integration',
      'Legal document management',
      
      // Advanced Analytics
      'Portfolio optimization AI',
      'Predictive default modeling',
      'Market opportunity analysis',
      'Competitive benchmarking',
      'Environmental impact reporting',
      'ESG scoring & tracking',
      
      // Integration & Automation
      'Smart contract integration',
      'Banking API connections',
      'ERP system integration',
      'Automated KYC/AML checks',
      'DocuSign integration',
      'Quickbooks/Xero sync',
      
      // Exclusive Features
      'White-glove onboarding',
      'Quarterly strategy sessions',
      'Access to deal flow network',
      'Co-marketing opportunities',
      'Industry conference passes',
      'Executive briefings & reports'
    ],
    highlighted: true,
    newTier: true
  }
];

// Helper functions
export function getTier15ById(tierId: string): SubscriptionTier15 | undefined {
  return SUBSCRIPTION_TIERS_15.find(t => t.id === tierId);
}

export function getTier15ByPrice(price: number): SubscriptionTier15 | undefined {
  return SUBSCRIPTION_TIERS_15.find(t => t.price === price);
}

export function getRecommendedTier15(params: {
  budget?: number;
  teamSize?: number;
  projects?: number;
  needsAPI?: boolean;
  needsML?: boolean;
  needsCompliance?: boolean;
  isAcademic?: boolean;
  isGovernment?: boolean;
  isConsultant?: boolean;
}): string {
  const { 
    budget = 0, 
    teamSize = 1, 
    projects = 1, 
    needsAPI, 
    needsML, 
    needsCompliance,
    isAcademic,
    isGovernment,
    isConsultant
  } = params;

  // Special cases first
  if (isGovernment) return 'government';
  if (isAcademic) return 'academic';
  if (isConsultant && budget >= 199) return 'consultant';

  // Filter by requirements
  const eligibleTiers = SUBSCRIPTION_TIERS_15.filter(tier => {
    if (tier.price === -1) return false; // Skip custom
    if (tier.price > budget) return false;
    if (tier.limits.teamMembers !== -1 && tier.limits.teamMembers < teamSize) return false;
    if (tier.limits.projects !== -1 && tier.limits.projects < projects) return false;
    if (needsAPI && !tier.limits.apiCalls) return false;
    if (needsML && !tier.features.some(f => f.includes('ML') || f.includes('prediction'))) return false;
    if (needsCompliance && !tier.features.some(f => f.includes('compliance') || f.includes('audit'))) return false;
    return true;
  });

  // Return the highest tier within budget
  return eligibleTiers.sort((a, b) => b.price - a.price)[0]?.id || 'free';
}

// Feature categories for easier display
export const FEATURE_CATEGORIES_15 = {
  'Basic Tools': [
    'PPFD Calculator',
    'DLI Calculator', 
    'VPD Calculator',
    'Energy Cost Calculator',
    'Heat Load Calculator'
  ],
  'Design Tools': [
    '2D Designer',
    '3D Visualization',
    'Heat Maps',
    'Auto-arrangement AI',
    'Shadow Mapping',
    'Multi-layer Design'
  ],
  'Electrical Tools': [
    'Electrical Estimator',
    'Load Balancing',
    'Circuit Planning',
    'Wire Sizing'
  ],
  'AI/ML Features': [
    'SOP Generator',
    'ML Yield Prediction',
    'Predictive Maintenance',
    'AI Crop Advisor',
    'AI Spectrum Recommendations'
  ],
  'Professional Tools': [
    'Photosynthetic Modeling',
    'Spectrum Analysis',
    'Compliance Tools',
    'API Access',
    'Custom Dashboards'
  ],
  'Enterprise Features': [
    'Multi-site Management',
    'White-label Options',
    'SSO Integration',
    'Custom Integrations',
    'Unlimited Team Members'
  ],
  'Investment Platform': [
    'GaaS Platform',
    'YEP Management',
    'Portfolio Management',
    'Deal Flow CRM',
    'Performance Tracking',
    'Automated Billing',
    'Investment Analytics',
    'Compliance Tracking'
  ]
};