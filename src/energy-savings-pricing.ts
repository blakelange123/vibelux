/**
 * Energy Savings Program Pricing Structure
 */

export const ENERGY_SAVINGS_TIERS = {
  // Standard Tier - All facilities get the best
  standard: {
    name: 'AI-Powered Smart Optimization',
    revenueSplit: 0.20, // 20% of savings
    features: [
      'Claude Opus AI optimization',
      'Adaptive baseline learning',
      'Peak demand response',
      'Temperature compensation',
      'DLI protection',
      'Real-time monitoring',
      'Emergency stop system',
      'Monthly savings reports'
    ],
    aiOptimization: {
      included: true,
      maxMonthlyConsultations: 500, // ~16 per day
      claudeModel: 'claude-3-opus', // Best model for everyone
      description: 'Premium AI optimization included'
    },
    minimumFacilitySize: 0, // kW
    setupFee: 0,
    monthlyFee: 0
  },

  // Premium Tier - For larger facilities (more consultations)
  premium: {
    name: 'AI-Enhanced Optimization Plus',
    revenueSplit: 0.20, // Same split, better service
    features: [
      '...all Standard features',
      'Unlimited AI consultations',
      'Predictive analytics dashboard',
      'Custom optimization strategies',
      'Weekly performance reviews',
      'Dedicated success manager',
      'API access for integration'
    ],
    aiOptimization: {
      included: true,
      maxMonthlyConsultations: 5000, // ~160 per day
      claudeModel: 'claude-3-opus', // Best model
      description: 'Unlimited premium AI optimization'
    },
    minimumFacilitySize: 100, // kW
    setupFee: 0,
    monthlyFee: 0,
    eligibility: 'Automatic for facilities >100kW or >$2k monthly savings'
  },

  // Enterprise Tier - Custom pricing
  enterprise: {
    name: 'Enterprise AI Platform',
    revenueSplit: 0.15, // Lower percentage, higher volume
    features: [
      '...all Premium features',
      'Unlimited AI consultations',
      'Custom ML model training',
      'Multi-site optimization',
      'White-label options',
      'SLA guarantees',
      'On-premise deployment option'
    ],
    aiOptimization: {
      included: true,
      maxMonthlyConsultations: -1, // Unlimited
      claudeModel: 'claude-3-opus',
      customModels: true,
      description: 'Dedicated AI resources'
    },
    minimumFacilitySize: 500, // kW
    setupFee: 0, // Negotiable
    monthlyFee: 0, // Negotiable
    eligibility: 'Contact sales'
  }
};

/**
 * Calculate which tier a facility qualifies for
 */
export function determineOptimizationTier(
  facilitySize: number, // in kW
  estimatedMonthlySavings: number
): keyof typeof ENERGY_SAVINGS_TIERS {
  if (facilitySize >= 500) {
    return 'enterprise';
  } else if (facilitySize >= 100 || estimatedMonthlySavings >= 2000) {
    return 'premium';
  }
  return 'standard';
}

/**
 * Calculate API cost allocation
 */
export function calculateAPICostAllocation(
  tier: keyof typeof ENERGY_SAVINGS_TIERS,
  monthlyRevenue: number,
  apiCosts: number
): {
  vibeluxPays: number;
  customerPays: number;
  margin: number;
  marginPercent: number;
} {
  // Vibelux always pays for API costs from revenue share
  return {
    vibeluxPays: apiCosts,
    customerPays: 0,
    margin: monthlyRevenue - apiCosts,
    marginPercent: ((monthlyRevenue - apiCosts) / monthlyRevenue) * 100
  };
}

/**
 * Marketing messages for different tiers
 */
export const TIER_MARKETING = {
  standard: {
    headline: 'Premium AI Energy Optimization',
    subheadline: 'Save 15-25% with Claude Opus AI included',
    bullets: [
      'Claude Opus AI (best model) included free',
      'No setup fees or monthly charges',
      'Pay only 20% of verified savings',
      'Cancel anytime, no contracts'
    ]
  },
  premium: {
    headline: 'Unlimited AI Optimization Plus',
    subheadline: 'Maximum savings with unlimited AI consultations',
    bullets: [
      'Unlimited Claude Opus consultations',
      'Real-time predictive analytics',
      'Dedicated success manager',
      'Still $0 upfront - pay from savings'
    ]
  },
  enterprise: {
    headline: 'Enterprise AI Platform',
    subheadline: 'Custom AI solutions for large operations',
    bullets: [
      'Unlimited Claude Opus usage',
      'Custom ML model training',
      'Lower revenue share (15%)',
      'White-label available'
    ]
  }
};