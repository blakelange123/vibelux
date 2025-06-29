// Safe subscription system without patent-risky features
export interface SubscriptionTierSafe {
  id: string;
  name: string;
  tagline: string;
  price: number;
  priceAnnual?: number;
  description: string;
  targetAudience: string;
  color: string;
  icon: string;
  limits: {
    projects: number;
    teamMembers: number;
    fixtures: number;
    exportFormats: string[];
    supportLevel: string;
    dataRetention: number; // days
    monthlySOPs?: number;
  };
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
  newTier?: boolean;
}

export const SAFE_SUBSCRIPTION_TIERS: SubscriptionTierSafe[] = [
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
      '5 saved projects with 30-day cloud storage',
      'CSV data export capabilities',
      'Priority email support'
    ]
  },

  // TIER 3: GROWER
  {
    id: 'grower',
    name: 'Grower',
    tagline: 'For serious personal cultivation',
    price: 19,
    priceAnnual: 182,
    description: 'Professional design tools and advanced calculations for dedicated growers',
    targetAudience: 'Experienced home growers, micro-cultivators, caregivers',
    color: 'blue',
    icon: 'Leaf',
    limits: {
      projects: 10,
      teamMembers: 1,
      fixtures: 1000,
      exportFormats: ['pdf', 'csv', 'xlsx'],
      supportLevel: 'Email support',
      dataRetention: 90
    },
    features: [
      'Everything in Hobbyist',
      'Advanced lighting design with 3D visualization',
      'Multi-zone lighting control planning',
      'Advanced psychrometric calculator',
      'Production planning with crop scheduling',
      'Detailed environmental optimization guides',
      'Access to complete DLC database (2,437+ fixtures)',
      'Advanced fixture comparison (up to 10)',
      'Custom spectrum design tools',
      'Detailed uniformity analysis (CV calculations)',
      'Equipment maintenance scheduling',
      '10 saved projects with 90-day cloud storage',
      'Excel export with detailed calculations',
      'Priority email support'
    ]
  },

  // TIER 4: PROFESSIONAL
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Complete toolkit for commercial growing',
    price: 49,
    priceAnnual: 470,
    description: 'Full-featured platform for commercial operations and consultants',
    targetAudience: 'Commercial growers, consultants, facility designers',
    color: 'purple',
    icon: 'Building',
    limits: {
      projects: 25,
      teamMembers: 3,
      fixtures: -1, // unlimited
      exportFormats: ['pdf', 'csv', 'xlsx', 'dwg'],
      supportLevel: 'Priority email + chat',
      dataRetention: 365,
      monthlySOPs: 10
    },
    popular: true,
    features: [
      'Everything in Grower',
      'Unlimited access to complete fixture database',
      'Professional CAD export (DWG format)',
      'Team collaboration (up to 3 members)',
      'Advanced multi-zone control system design',
      'Complete electrical load calculations',
      'Detailed energy audit capabilities',
      'Standard Operating Procedure generator (10/month)',
      'Professional reporting templates',
      'Custom branding for client reports',
      'Environmental monitoring data logging',
      'Compliance documentation tools',
      'Insurance integration with risk scoring',
      'Basic energy grid pricing optimization',
      'Equipment failure prediction (7-day)',
      '25 saved projects with 1-year cloud storage',
      'Priority email and chat support'
    ]
  },

  // TIER 5: ENTERPRISE
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Scalable solutions for large operations',
    price: 149,
    priceAnnual: 1428,
    description: 'Enterprise-grade tools with unlimited usage and premium support',
    targetAudience: 'Large commercial operations, multi-site businesses',
    color: 'gold',
    icon: 'Factory',
    limits: {
      projects: -1, // unlimited
      teamMembers: 10,
      fixtures: -1,
      exportFormats: ['pdf', 'csv', 'xlsx', 'dwg', 'step'],
      supportLevel: 'Phone + chat + email',
      dataRetention: -1, // permanent
      monthlySOPs: -1 // unlimited
    },
    features: [
      'Everything in Professional',
      'Unlimited projects and team members (up to 10)',
      'Advanced 3D CAD integration (STEP export)',
      'Multi-facility management dashboard',
      'Unlimited SOP generation with custom templates',
      'Advanced compliance tracking and reporting',
      'Custom integrations and API access',
      'AI-powered predictive maintenance (30-day predictions)',
      'Complete energy grid integration with VPP enrollment',
      'Automated insurance compliance and claims processing',
      'Demand response program management',
      'Real-time carbon credit tracking and monetization',
      'Automated parts inventory with predictive ordering',
      'Dedicated account manager',
      'On-site training and implementation',
      'Custom feature development priority',
      'White-label licensing options',
      'Permanent data storage and backup',
      'Phone, chat, and email support with SLA'
    ]
  }
];

// Safe feature categories (no patent risks)
export const SAFE_FEATURE_CATEGORIES = {
  'Core Calculations': [
    'PPFD/DLI Calculators',
    'VPD Calculator',
    'Energy Cost Analysis',
    'Heat Load Calculations',
    'Fertilizer Formulation'
  ],
  'Design & Planning': [
    '2D/3D Layout Designer',
    'Multi-zone Planning',
    'Fixture Comparison',
    'Heat Map Visualization',
    'Uniformity Analysis'
  ],
  'Data & Reporting': [
    'PDF/Excel Export',
    'Custom Report Templates',
    'Data Logging',
    'Compliance Documentation'
  ],
  'Collaboration': [
    'Team Workspaces',
    'Project Sharing',
    'Client Presentations',
    'SOP Generation'
  ],
  'Professional Tools': [
    'CAD Integration',
    'API Access',
    'Custom Branding',
    'Multi-facility Management'
  ],
  'AI & Predictive Analytics': [
    'Equipment failure prediction',
    'Predictive maintenance scheduling',
    'Parts inventory optimization',
    'Risk scoring algorithms'
  ],
  'Energy & Revenue': [
    'Grid pricing optimization',
    'Demand response programs',
    'Virtual Power Plant enrollment',
    'Carbon credit monetization'
  ],
  'Risk & Compliance': [
    'Insurance integration',
    'Automated compliance tracking',
    'Claims processing automation',
    'Real-time risk monitoring'
  ]
};

// Function to get safe subscription tiers
export function getSafeSubscriptionTiers(): SubscriptionTierSafe[] {
  return SAFE_SUBSCRIPTION_TIERS;
}

// Function to check if a tier has a specific feature category
export function tierHasFeatureCategory(tier: SubscriptionTierSafe, category: string): boolean {
  const categoryFeatures = SAFE_FEATURE_CATEGORIES[category as keyof typeof SAFE_FEATURE_CATEGORIES];
  if (!categoryFeatures) return false;
  
  return categoryFeatures.some(feature => 
    tier.features.some(tierFeature => 
      tierFeature.toLowerCase().includes(feature.toLowerCase())
    )
  );
}