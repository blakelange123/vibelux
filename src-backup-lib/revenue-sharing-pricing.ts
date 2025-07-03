/**
 * Revenue-Sharing Pricing Model for VibeLux
 * Split the upside with growers on cost-saving features
 */

export interface RevenueSharingModel {
  id: string;
  name: string;
  description: string;
  basePrice: number; // Monthly base fee
  performanceFee: number; // Percentage of savings/gains
  features: string[];
  sharedMetrics: SharedMetric[];
  minimumSavings?: number; // Minimum monthly savings to qualify
  capAmount?: number; // Maximum monthly performance fee
  tieredFees?: TieredFee[]; // Optional tiered performance fees
  seasonalAdjustments?: SeasonalAdjustment[]; // Optional seasonal adjustments
  multiYearDiscounts?: MultiYearDiscount[]; // Contract length discounts
  cropSpecificMetrics?: CropSpecificMetric[]; // Custom metrics by crop
}

export interface TieredFee {
  minSavings: number;
  maxSavings: number;
  percentage: number;
}

export interface SeasonalAdjustment {
  months: number[]; // 1-12
  adjustmentPercent: number; // e.g., -20 for 20% discount
  reason: string;
}

export interface MultiYearDiscount {
  years: number;
  discountPercent: number; // Discount on performance fee
  basePriceDiscount?: number; // Optional discount on base price
}

export interface CropSpecificMetric {
  cropType: string;
  metrics: {
    name: string;
    targetImprovement: number; // percentage
    sharePercentage: number; // VibeLux's share
    importance: 'high' | 'medium' | 'low';
  }[];
}

export interface SharedMetric {
  name: string;
  type: 'cost_savings' | 'yield_improvement' | 'energy_reduction' | 'revenue_increase';
  sharePercentage: number; // VibeLux's share
  baseline: 'historical' | 'industry_average' | 'custom';
  measurementPeriod: 'monthly' | 'quarterly' | 'annual';
}

export const REVENUE_SHARING_MODELS: RevenueSharingModel[] = [
  {
    id: 'energy-optimizer',
    name: 'Energy Optimizer',
    description: 'Pay only when we save you money on energy costs',
    basePrice: 0, // No base fee
    performanceFee: 30, // 30% of energy savings
    features: [
      'Demand response integration',
      'Time-of-use optimization',
      'Peak shaving algorithms',
      'Weather-adaptive lighting',
      'Battery optimization',
      'Grid integration',
      'Real-time energy monitoring',
      'Automated load balancing'
    ],
    sharedMetrics: [{
      name: 'Energy Cost Reduction',
      type: 'cost_savings',
      sharePercentage: 30,
      baseline: 'historical',
      measurementPeriod: 'monthly'
    }],
    minimumSavings: 500, // Only pay if we save you >$500/month
    tieredFees: [
      { minSavings: 0, maxSavings: 5000, percentage: 30 },
      { minSavings: 5000, maxSavings: 15000, percentage: 25 },
      { minSavings: 15000, maxSavings: 50000, percentage: 20 },
      { minSavings: 50000, maxSavings: Infinity, percentage: 15 }
    ],
    seasonalAdjustments: [
      { months: [6, 7, 8], adjustmentPercent: -20, reason: 'Summer peak demand periods' },
      { months: [12, 1, 2], adjustmentPercent: -15, reason: 'Winter heating season' }
    ],
    multiYearDiscounts: [
      { years: 1, discountPercent: 0 },
      { years: 2, discountPercent: 10 },
      { years: 3, discountPercent: 20 },
      { years: 5, discountPercent: 30 }
    ]
  },
  
  {
    id: 'yield-enhancement',
    name: 'Yield Enhancement Program (YEP)',
    description: 'Split the increased revenue from improved yields',
    basePrice: 99, // Small base fee for monitoring
    performanceFee: 25, // 25% of increased revenue
    features: [
      'AI-powered growth optimization',
      'Spectrum optimization',
      'Environmental controls',
      'Predictive analytics',
      'Crop health monitoring',
      'Harvest timing optimization',
      'Quality improvement tracking',
      'Market price integration'
    ],
    sharedMetrics: [{
      name: 'Yield Improvement',
      type: 'yield_improvement',
      sharePercentage: 25,
      baseline: 'historical',
      measurementPeriod: 'quarterly'
    }],
    minimumSavings: 2000,
    tieredFees: [
      { minSavings: 0, maxSavings: 10000, percentage: 25 },
      { minSavings: 10000, maxSavings: 50000, percentage: 20 },
      { minSavings: 50000, maxSavings: 100000, percentage: 15 },
      { minSavings: 100000, maxSavings: Infinity, percentage: 10 }
    ],
    cropSpecificMetrics: [
      {
        cropType: 'cannabis',
        metrics: [
          { name: 'THC/CBD Potency', targetImprovement: 15, sharePercentage: 30, importance: 'high' },
          { name: 'Terpene Profile', targetImprovement: 20, sharePercentage: 25, importance: 'high' },
          { name: 'Harvest Weight', targetImprovement: 25, sharePercentage: 20, importance: 'high' }
        ]
      },
      {
        cropType: 'leafy-greens',
        metrics: [
          { name: 'Growth Rate', targetImprovement: 30, sharePercentage: 20, importance: 'high' },
          { name: 'Shelf Life', targetImprovement: 40, sharePercentage: 25, importance: 'medium' },
          { name: 'Nutrient Density', targetImprovement: 15, sharePercentage: 20, importance: 'medium' }
        ]
      },
      {
        cropType: 'tomatoes',
        metrics: [
          { name: 'Fruit Size', targetImprovement: 20, sharePercentage: 15, importance: 'medium' },
          { name: 'Sugar Content', targetImprovement: 25, sharePercentage: 20, importance: 'high' },
          { name: 'Yield per Plant', targetImprovement: 30, sharePercentage: 25, importance: 'high' }
        ]
      }
    ],
    multiYearDiscounts: [
      { years: 1, discountPercent: 0 },
      { years: 2, discountPercent: 15, basePriceDiscount: 10 },
      { years: 3, discountPercent: 25, basePriceDiscount: 20 }
    ]
  },
  
  {
    id: 'hybrid-optimizer',
    name: 'Hybrid Optimizer',
    description: 'Comprehensive optimization with shared savings on multiple metrics',
    basePrice: 199,
    performanceFee: 20, // Lower percentage but multiple revenue streams
    features: [
      'All Energy Optimizer features',
      'All Yield Enhancement features',
      'Labor optimization',
      'Waste reduction tracking',
      'Water usage optimization',
      'Nutrient efficiency',
      'Carbon credit generation',
      'Insurance premium reduction'
    ],
    sharedMetrics: [
      {
        name: 'Energy Savings',
        type: 'cost_savings',
        sharePercentage: 20,
        baseline: 'historical',
        measurementPeriod: 'monthly'
      },
      {
        name: 'Yield Revenue',
        type: 'revenue_increase',
        sharePercentage: 20,
        baseline: 'historical',
        measurementPeriod: 'quarterly'
      },
      {
        name: 'Operational Savings',
        type: 'cost_savings',
        sharePercentage: 20,
        baseline: 'historical',
        measurementPeriod: 'monthly'
      }
    ],
    capAmount: 5000, // Cap at $5k/month to make it more affordable
    tieredFees: [
      { minSavings: 0, maxSavings: 10000, percentage: 20 },
      { minSavings: 10000, maxSavings: 30000, percentage: 17 },
      { minSavings: 30000, maxSavings: 75000, percentage: 14 },
      { minSavings: 75000, maxSavings: Infinity, percentage: 10 }
    ],
    seasonalAdjustments: [
      { months: [4, 5, 9, 10], adjustmentPercent: -10, reason: 'Spring/Fall optimization periods' }
    ],
    multiYearDiscounts: [
      { years: 1, discountPercent: 0 },
      { years: 2, discountPercent: 12, basePriceDiscount: 15 },
      { years: 3, discountPercent: 22, basePriceDiscount: 25 },
      { years: 5, discountPercent: 35, basePriceDiscount: 40 }
    ]
  },
  
  {
    id: 'starter-share',
    name: 'Starter Share',
    description: 'Low-cost entry with performance upside',
    basePrice: 49,
    performanceFee: 35, // Higher share but lower base
    features: [
      'Basic energy monitoring',
      'Simple demand response',
      'Basic yield tracking',
      'Standard reporting',
      'Email alerts',
      'Mobile app',
      'Community support'
    ],
    sharedMetrics: [{
      name: 'Combined Savings',
      type: 'cost_savings',
      sharePercentage: 35,
      baseline: 'industry_average',
      measurementPeriod: 'monthly'
    }],
    minimumSavings: 200
  },
  
  {
    id: 'enterprise-performance',
    name: 'Enterprise Performance',
    description: 'Large-scale operations with negotiated sharing',
    basePrice: 999,
    performanceFee: 15, // Lower percentage for scale
    features: [
      'Everything in Hybrid Optimizer',
      'Custom ML models',
      'Dedicated success team',
      'API access',
      'White-label options',
      'Multi-site management',
      'Priority support',
      'Custom integrations'
    ],
    sharedMetrics: [
      {
        name: 'Total Cost Reduction',
        type: 'cost_savings',
        sharePercentage: 15,
        baseline: 'custom',
        measurementPeriod: 'annual'
      },
      {
        name: 'Revenue Improvement',
        type: 'revenue_increase',
        sharePercentage: 15,
        baseline: 'custom',
        measurementPeriod: 'annual'
      }
    ],
    capAmount: 25000 // Higher cap for enterprise
  }
];

// Calculate estimated costs for different scenarios
export interface CostScenario {
  facilitySize: number; // sq ft
  monthlyEnergyBill: number;
  currentYield: number; // lbs/sq ft/year
  cropPrice: number; // $/lb
  cropType?: string;
  contractYears?: number;
  currentMonth?: number; // 1-12
}

export function calculateRevenueSharingCost(
  model: RevenueSharingModel,
  scenario: CostScenario
): {
  estimatedMonthlySavings: number;
  vibeluxShare: number;
  growerSavings: number;
  totalMonthlyCost: number;
  roi: number;
  effectivePercentage: number;
  appliedDiscounts: string[];
} {
  // Energy savings estimates (15-30% typical)
  const energySavingsRate = 0.22; // 22% average
  const monthlyEnergySavings = scenario.monthlyEnergyBill * energySavingsRate;
  
  // Yield improvement estimates (10-25% typical)
  const yieldImprovementRate = 0.18; // 18% average
  const currentMonthlyRevenue = (scenario.currentYield * scenario.facilitySize * scenario.cropPrice) / 12;
  const monthlyYieldRevenue = currentMonthlyRevenue * yieldImprovementRate;
  
  let totalSavings = 0;
  let vibeluxShare = 0;
  const appliedDiscounts: string[] = [];
  
  // Calculate based on shared metrics
  model.sharedMetrics.forEach(metric => {
    switch (metric.type) {
      case 'cost_savings':
      case 'energy_reduction':
        const savings = monthlyEnergySavings;
        totalSavings += savings;
        vibeluxShare += savings * (metric.sharePercentage / 100);
        break;
        
      case 'yield_improvement':
      case 'revenue_increase':
        const revenue = monthlyYieldRevenue;
        totalSavings += revenue;
        vibeluxShare += revenue * (metric.sharePercentage / 100);
        break;
    }
  });
  
  // Apply minimum savings threshold
  if (model.minimumSavings && totalSavings < model.minimumSavings) {
    vibeluxShare = 0; // No performance fee if below minimum
  }
  
  // Apply tiered fees if available
  let effectivePercentage = model.performanceFee;
  if (model.tieredFees && vibeluxShare > 0) {
    const tier = model.tieredFees.find(t => 
      totalSavings >= t.minSavings && totalSavings < t.maxSavings
    );
    if (tier) {
      effectivePercentage = tier.percentage;
      vibeluxShare = totalSavings * (effectivePercentage / 100);
      appliedDiscounts.push(`Tiered rate: ${effectivePercentage}% (saves ${model.performanceFee - effectivePercentage}%)`);
    }
  }
  
  // Apply seasonal adjustments
  const currentMonth = scenario.currentMonth || new Date().getMonth() + 1;
  if (model.seasonalAdjustments) {
    const adjustment = model.seasonalAdjustments.find(adj => 
      adj.months.includes(currentMonth)
    );
    if (adjustment) {
      const discount = 1 + (adjustment.adjustmentPercent / 100);
      vibeluxShare *= discount;
      effectivePercentage *= discount;
      appliedDiscounts.push(`${adjustment.reason}: ${Math.abs(adjustment.adjustmentPercent)}% discount`);
    }
  }
  
  // Apply multi-year discounts
  let basePrice = model.basePrice;
  if (model.multiYearDiscounts && scenario.contractYears) {
    const discount = model.multiYearDiscounts.find(d => d.years === scenario.contractYears);
    if (discount && discount.discountPercent > 0) {
      vibeluxShare *= (1 - discount.discountPercent / 100);
      effectivePercentage *= (1 - discount.discountPercent / 100);
      appliedDiscounts.push(`${scenario.contractYears}-year contract: ${discount.discountPercent}% discount`);
      
      if (discount.basePriceDiscount) {
        basePrice *= (1 - discount.basePriceDiscount / 100);
        appliedDiscounts.push(`Base price reduced by ${discount.basePriceDiscount}%`);
      }
    }
  }
  
  // Apply crop-specific adjustments
  if (model.cropSpecificMetrics && scenario.cropType) {
    const cropMetrics = model.cropSpecificMetrics.find(c => c.cropType === scenario.cropType);
    if (cropMetrics) {
      let cropBonus = 0;
      cropMetrics.metrics.forEach(metric => {
        if (metric.importance === 'high') {
          cropBonus += monthlyYieldRevenue * (metric.targetImprovement / 100) * (metric.sharePercentage / 100);
        }
      });
      if (cropBonus > 0) {
        totalSavings += cropBonus;
        vibeluxShare += cropBonus;
        appliedDiscounts.push(`${scenario.cropType} optimization bonus included`);
      }
    }
  }
  
  // Apply cap if exists
  if (model.capAmount && vibeluxShare > model.capAmount) {
    vibeluxShare = model.capAmount;
    appliedDiscounts.push(`Capped at $${model.capAmount.toLocaleString()}/month`);
  }
  
  const totalMonthlyCost = basePrice + vibeluxShare;
  const growerSavings = totalSavings - vibeluxShare;
  const roi = totalMonthlyCost > 0 ? growerSavings / totalMonthlyCost : 0;
  
  return {
    estimatedMonthlySavings: totalSavings,
    vibeluxShare,
    growerSavings,
    totalMonthlyCost,
    roi,
    effectivePercentage,
    appliedDiscounts
  };
}

// Hybrid pricing options combining traditional and revenue-sharing
export interface HybridPricingOption {
  id: string;
  name: string;
  description: string;
  traditionalPrice: number;
  revenueSharingOption: RevenueSharingModel;
  breakEvenPoint: number; // Monthly savings where both options cost the same
}

export const HYBRID_PRICING_OPTIONS: HybridPricingOption[] = [
  {
    id: 'professional-hybrid',
    name: 'Professional Choice',
    description: 'Choose between fixed pricing or performance-based',
    traditionalPrice: 299,
    revenueSharingOption: REVENUE_SHARING_MODELS.find(m => m.id === 'hybrid-optimizer')!,
    breakEvenPoint: 1000 // At $1k savings/month, both options equal
  },
  {
    id: 'enterprise-hybrid',
    name: 'Enterprise Flex',
    description: 'Flexible pricing for large operations',
    traditionalPrice: 999,
    revenueSharingOption: REVENUE_SHARING_MODELS.find(m => m.id === 'enterprise-performance')!,
    breakEvenPoint: 5000
  }
];

// Success metrics for transparency
export interface SuccessMetrics {
  averageEnergySavings: number; // percentage
  averageYieldImprovement: number; // percentage
  averageROI: number; // multiplier
  totalSavingsGenerated: number; // dollars
  activeRevenueSharingCustomers: number;
}

export const VIBELUX_SUCCESS_METRICS: SuccessMetrics = {
  averageEnergySavings: 23.4,
  averageYieldImprovement: 17.8,
  averageROI: 4.2,
  totalSavingsGenerated: 12500000, // $12.5M
  activeRevenueSharingCustomers: 847
};

// Contract terms for revenue sharing
export interface RevenueSharingTerms {
  minimumContract: number; // months
  measurementMethod: string;
  auditRights: boolean;
  disputeResolution: string;
  earlyTerminationFee: number; // percentage of projected savings
  successFeeStructure: 'flat' | 'tiered' | 'sliding';
}

export const STANDARD_TERMS: RevenueSharingTerms = {
  minimumContract: 12,
  measurementMethod: 'Third-party verified meter data and yield reports',
  auditRights: true,
  disputeResolution: 'Binding arbitration with shared costs',
  earlyTerminationFee: 25,
  successFeeStructure: 'tiered'
};