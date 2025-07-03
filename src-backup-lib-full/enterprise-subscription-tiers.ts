// Enterprise subscription tiers reflecting true platform capabilities
export interface EnterpriseSubscriptionTier {
  id: string;
  name: string;
  tagline: string;
  price: number;
  priceAnnual?: number;
  description: string;
  targetAudience: string;
  color: string;
  icon: string;
  badge?: string;
  limits: {
    projects: number;
    teamMembers: number;
    facilities: number;
    sensors: number;
    aiQueries: number;
    cfdAnalyses: number;
    exportFormats: string[];
    supportLevel: string;
    dataRetention: number;
    apiCalls: number;
  };
  features: string[];
  modules: {
    aiAutoPilot: boolean;
    cfdAnalysis: boolean;
    iotPlatform: boolean;
    investmentTools: boolean;
    carbonCredits: boolean;
    statisticalAnalysis: boolean;
    consultingTools: boolean;
    researchSuite: boolean;
    whiteLabelBranding: boolean;
  };
  highlighted?: boolean;
  popular?: boolean;
  enterprise?: boolean;
}

export const ENTERPRISE_SUBSCRIPTION_TIERS: EnterpriseSubscriptionTier[] = [
  // TIER 1: FREE EXPLORER
  {
    id: 'free',
    name: 'Free Explorer',
    tagline: 'Learn cultivation lighting basics',
    price: 0,
    description: 'Essential calculators for students and hobbyists',
    targetAudience: 'Students, home growers',
    color: 'gray',
    icon: 'Sparkles',
    limits: {
      projects: 1,
      teamMembers: 1,
      facilities: 1,
      sensors: 0,
      aiQueries: 0,
      cfdAnalyses: 0,
      exportFormats: ['pdf'],
      supportLevel: 'Community',
      dataRetention: 7,
      apiCalls: 0
    },
    features: [
      'Basic PPFD, DLI, VPD calculators',
      'Simple 2D room designer',
      '50 DLC fixtures database',
      'Basic energy cost estimation',
      'Educational resources'
    ],
    modules: {
      aiAutoPilot: false,
      cfdAnalysis: false,
      iotPlatform: false,
      investmentTools: false,
      carbonCredits: false,
      statisticalAnalysis: false,
      consultingTools: false,
      researchSuite: false,
      whiteLabelBranding: false
    }
  },

  // TIER 2: HOBBYIST
  {
    id: 'hobbyist',
    name: 'Hobbyist',
    tagline: 'Perfect for home grows',
    price: 19,
    priceAnnual: 182,
    description: 'Advanced calculators and design tools for personal cultivation',
    targetAudience: 'Home growers, small operations',
    color: 'green',
    icon: 'Home',
    limits: {
      projects: 5,
      teamMembers: 1,
      facilities: 1,
      sensors: 5,
      aiQueries: 50,
      cfdAnalyses: 0,
      exportFormats: ['pdf', 'csv'],
      supportLevel: 'Email',
      dataRetention: 30,
      apiCalls: 1000
    },
    features: [
      'Advanced DLI & heat load calculators',
      'Interactive psychrometric charts',
      'Weather integration',
      '500 DLC fixtures with comparison',
      'Basic IoT sensor integration (5 sensors)',
      'Mobile app access',
      'Priority email support'
    ],
    modules: {
      aiAutoPilot: false,
      cfdAnalysis: false,
      iotPlatform: true,
      investmentTools: false,
      carbonCredits: false,
      statisticalAnalysis: false,
      consultingTools: false,
      researchSuite: false,
      whiteLabelBranding: false
    }
  },

  // TIER 3: PROFESSIONAL
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Complete design & analysis suite',
    price: 199,
    priceAnnual: 1910,
    description: 'Full design tools with 3D visualization and AI assistance',
    targetAudience: 'Consultants, design professionals',
    color: 'purple',
    icon: 'Zap',
    popular: true,
    limits: {
      projects: 25,
      teamMembers: 5,
      facilities: 5,
      sensors: 50,
      aiQueries: 500,
      cfdAnalyses: 10,
      exportFormats: ['pdf', 'csv', 'excel', 'dwg'],
      supportLevel: 'Priority',
      dataRetention: 365,
      apiCalls: 10000
    },
    features: [
      'Everything in Hobbyist',
      'AI design assistant with ANOVA',
      'Statistical analysis & experimental design',
      '3D visualization with PPFD heatmaps',
      'Advanced 3D room designer',
      'Basic CFD thermal analysis (10/month)',
      'Professional reporting suite',
      'Team collaboration tools',
      'Advanced IoT platform (50 sensors)',
      'Energy & moisture balance modeling',
      'RTR monitoring dashboard',
      'Multi-site management'
    ],
    modules: {
      aiAutoPilot: true,
      cfdAnalysis: true,
      iotPlatform: true,
      investmentTools: false,
      carbonCredits: false,
      statisticalAnalysis: true,
      consultingTools: true,
      researchSuite: true,
      whiteLabelBranding: false
    }
  },

  // TIER 4: BUSINESS
  {
    id: 'business',
    name: 'Business',
    tagline: 'Complete facility management',
    price: 599,
    priceAnnual: 5750,
    description: 'Advanced facility management with unlimited CFD and IoT',
    targetAudience: 'Commercial operations, medium facilities',
    color: 'blue',
    icon: 'Building',
    limits: {
      projects: 100,
      teamMembers: 25,
      facilities: 25,
      sensors: 500,
      aiQueries: 2000,
      cfdAnalyses: 100,
      exportFormats: ['pdf', 'csv', 'excel', 'dwg', 'step'],
      supportLevel: 'Phone + Email',
      dataRetention: 1095,
      apiCalls: 50000
    },
    features: [
      'Everything in Professional',
      'Unlimited CFD thermal analysis',
      'Advanced IoT platform (500 sensors)',
      'Predictive maintenance with ML',
      'Advanced multi-site management',
      'Investment ROI modeling',
      'Carbon footprint tracking',
      'Advanced API access (50K calls/month)',
      'Custom integrations support',
      'Phone support with 4-hour response',
      'Advanced security & compliance'
    ],
    modules: {
      aiAutoPilot: true,
      cfdAnalysis: true,
      iotPlatform: true,
      investmentTools: true,
      carbonCredits: true,
      statisticalAnalysis: true,
      consultingTools: true,
      researchSuite: true,
      whiteLabelBranding: true
    }
  },

  // TIER 5: ENTERPRISE
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Complete CEA technology platform',
    price: 1999,
    priceAnnual: 19190,
    description: 'Full platform access with unlimited everything',
    targetAudience: 'Large operations, enterprise facilities',
    color: 'emerald',
    icon: 'Crown',
    enterprise: true,
    badge: 'Most Advanced',
    limits: {
      projects: -1,
      teamMembers: -1,
      facilities: -1,
      sensors: -1,
      aiQueries: -1,
      cfdAnalyses: -1,
      exportFormats: ['pdf', 'csv', 'excel', 'dwg', 'step', 'iges'],
      supportLevel: 'Dedicated Success Manager',
      dataRetention: -1,
      apiCalls: -1
    },
    features: [
      'Everything in Business',
      'Unlimited everything (sensors, CFD, AI)',
      'VibeLux Capital investment platform',
      'Greenhouse-as-a-Service (GaaS) modeling',
      'Blockchain carbon credit generation',
      'Advanced neural network yield prediction',
      'Complete white-label branding',
      'Multi-physics CFD simulation',
      'Advanced statistical research suite',
      'Custom development support',
      'Dedicated success manager',
      '24/7 priority support',
      'On-site training available',
      'Custom contract terms'
    ],
    modules: {
      aiAutoPilot: true,
      cfdAnalysis: true,
      iotPlatform: true,
      investmentTools: true,
      carbonCredits: true,
      statisticalAnalysis: true,
      consultingTools: true,
      researchSuite: true,
      whiteLabelBranding: true
    }
  },

  // SPECIALIZED TIERS

  // RESEARCH TIER
  {
    id: 'research',
    name: 'Research Pro',
    tagline: 'Academic research & development',
    price: 399,
    priceAnnual: 3830,
    description: 'Research-grade tools for universities and R&D',
    targetAudience: 'Universities, research institutions',
    color: 'cyan',
    icon: 'Microscope',
    limits: {
      projects: 50,
      teamMembers: 100,
      facilities: 10,
      sensors: 200,
      aiQueries: 1000,
      cfdAnalyses: 50,
      exportFormats: ['pdf', 'csv', 'excel', 'matlab'],
      supportLevel: 'Academic',
      dataRetention: 1825,
      apiCalls: 25000
    },
    features: [
      'Full statistical analysis suite (ANOVA, t-tests)',
      'Experimental design wizard',
      'Publication-ready reports',
      'Research collaboration tools',
      'Data sharing with peers',
      'Academic pricing (50% off)',
      'Student account management',
      'Curriculum integration tools',
      'Academic support team'
    ],
    modules: {
      aiAutoPilot: true,
      cfdAnalysis: true,
      iotPlatform: true,
      investmentTools: false,
      carbonCredits: false,
      statisticalAnalysis: true,
      consultingTools: false,
      researchSuite: true,
      whiteLabelBranding: false
    }
  }
];

// Add-on Modules (can be purchased separately)
export interface AddonModule {
  id: string;
  name: string;
  description: string;
  price: number;
  priceAnnual?: number;
  features: string[];
  availableForTiers: string[];
}

export const ADDON_MODULES: AddonModule[] = [
  {
    id: 'ai-autopilot',
    name: 'AI AutoPilot',
    description: 'Fully automated facility optimization',
    price: 499,
    priceAnnual: 4790,
    features: [
      'Automated lighting control',
      'Predictive environmental adjustment',
      'Yield optimization algorithms',
      'Automated alert responses',
      'ML-based decision making'
    ],
    availableForTiers: ['hobbyist', 'professional', 'business']
  },
  {
    id: 'investment-platform',
    name: 'VibeLux Capital',
    description: 'Complete investment and financing tools',
    price: 1999,
    priceAnnual: 19190,
    features: [
      'Greenhouse-as-a-Service modeling',
      'Yield-Equity Partnership tools',
      'Portfolio analytics',
      'Investment tracking',
      'Financial reporting'
    ],
    availableForTiers: ['business', 'enterprise']
  },
  {
    id: 'carbon-credits',
    name: 'Carbon Credit Suite',
    description: 'Blockchain carbon credit generation and trading',
    price: 199,
    priceAnnual: 1910,
    features: [
      'Carbon footprint calculation',
      'Blockchain verification',
      'Credit generation protocols',
      'Trading platform access',
      'Compliance reporting'
    ],
    availableForTiers: ['professional', 'business', 'enterprise']
  },
  {
    id: 'consulting-suite',
    name: 'Professional Consulting Tools',
    description: 'White-label tools for consultants',
    price: 299,
    priceAnnual: 2870,
    features: [
      'White-label branding',
      'Client portal system',
      'Professional report templates',
      'Project management tools',
      'Client billing integration'
    ],
    availableForTiers: ['professional', 'business', 'enterprise']
  }
];

export const formatPrice = (price: number, annual?: number, billingPeriod: 'monthly' | 'annual' = 'monthly') => {
  if (price === -1) return 'Custom';
  if (price === 0) return 'Free';
  
  if (billingPeriod === 'annual' && annual) {
    return `$${annual}/year`;
  }
  
  return `$${price}/month`;
};

export const calculateSavings = (tier: EnterpriseSubscriptionTier) => {
  if (!tier.priceAnnual || tier.price === 0) return 0;
  const monthlyTotal = tier.price * 12;
  return monthlyTotal - tier.priceAnnual;
};