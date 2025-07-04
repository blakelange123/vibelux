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
      'Basic PPFD Calculator',
      'Basic DLI Calculator',
      'Basic VPD Calculator',
      'Simple Energy Cost Calculator',
      '50 fixture library access',
      '1 saved project (7-day retention)',
      'PDF export only',
      'Community forum access',
      'Basic 2D designer',
      'Learning resources'
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
      'Everything in Free',
      'Advanced DLI Calculator',
      'Heat Load Calculator',
      'ROI Calculator',
      '500 DLC fixtures',
      'Fixture comparison tool',
      'Basic heat map visualization',
      '5 projects (30-day retention)',
      'CSV export',
      'Email support',
      'Basic environmental alerts'
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
    icon: 'Plant',
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
      'Full DLC database (5000+ fixtures)',
      'Basic 3D visualization',
      'Uniformity analyzer',
      'Basic electrical estimator',
      'Spectrum analysis',
      'Basic nutrient calculator',
      '10 projects (60-day retention)',
      'JSON export',
      'Fixture aging analyzer',
      'Basic scheduling tools'
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
      'Advanced 3D design studio',
      'Shadow mapping',
      'Electrical load balancing',
      'Wire gauge calculator',
      'Advanced energy cost analysis',
      'Photoperiod scheduler',
      'Maintenance scheduler',
      'AI spectrum recommendations (10/mo)',
      'CAD export (DWG)',
      'Custom fixtures',
      'Priority email support'
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
      'Auto-arrangement AI',
      'Object properties panel',
      'Multi-layer design',
      'Circuit planning tools',
      'Peak demand analysis',
      'SOP Generator (10/mo)',
      'Enhanced nutrient calculator',
      'Cross-section analyzer',
      'IES file import/export',
      'API access (1000 calls)',
      'Team sharing (3 users)',
      'Version control',
      'Priority chat support'
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
      'Photosynthetic modeling',
      'Carbon footprint tracking',
      'Weather adaptive lighting',
      'Advanced uniformity analyzer',
      'Crop rotation planner',
      'Compliance audit trail',
      'Document generation',
      'Custom spectrum designer',
      'Phytochrome calculations',
      'McCree action spectrum',
      'Solar radiation analysis',
      'Unlimited projects',
      'Phone support'
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
      'ML yield prediction',
      'Enhanced ML predictions',
      'Predictive maintenance',
      'AI crop advisor',
      'IoT device management',
      'Sensor integration',
      'Custom dashboards',
      'Blockchain carbon credits',
      'Multi-crop balancer',
      'Advanced export center',
      'Webhooks',
      'Unlimited API access',
      '24/7 phone support'
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
      'SSO integration',
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
      'Custom ML model training',
      'Priority feature development',
      'Executive dashboard',
      'Compliance certifications',
      'Source code escrow',
      'On-premise option',
      'Direct engineering support',
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
      'Air-gapped deployment',
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
  ]
};