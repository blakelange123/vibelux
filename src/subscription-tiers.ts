// Comprehensive subscription tier system with feature flags
export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  priceId?: string; // Stripe price ID
  description: string;
  features: string[];
  limits: {
    projects: number;
    teamMembers: number;
    fixtures: number;
    apiCalls?: number;
    exportFormats: string[];
  };
  permissions: {
    // Basic Tools
    ppfdCalculator: boolean;
    dliCalculator: boolean;
    sopGenerator: boolean;
    fixtureBrowser: boolean;
    basicDesigner: boolean;
    
    // Design Features
    advancedDesigner: boolean;
    designer3D: boolean;
    autoArrangement: boolean;
    objectProperties: boolean;
    shadowMapping: boolean;
    multiLayer: boolean;
    
    // Analysis Tools
    energyCostAnalysis: boolean;
    heatLoadCalculator: boolean;
    spectrumAnalysis: boolean;
    electricalLoadBalancing: boolean;
    
    // Planning & Optimization
    cropRotationPlanner: boolean;
    yieldPredictor: boolean;
    lightingScheduler: boolean;
    maintenanceScheduler: boolean;
    
    // Monitoring & Compliance
    environmentalAlerts: boolean;
    predictiveMaintenance: boolean;
    complianceAuditTrail: boolean;
    dlcCompliance: boolean;
    
    // Advanced Features
    mlYieldPrediction: boolean;
    weatherAdaptive: boolean;
    iotIntegration: boolean;
    packagingEquipmentAPI: boolean;
    customSpectrumDesigner: boolean;
    photosyntheticModeling: boolean;
    
    // Enterprise Features
    multiSiteManagement: boolean;
    teamCollaboration: boolean;
    whiteLabel: boolean;
    customIntegrations: boolean;
    apiAccess: boolean;
    bulkOperations: boolean;
  };
  highlighted?: boolean;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for hobbyists and students learning about grow lighting',
    features: [
      'Basic PPFD/DLI calculators',
      'SOP Generator (5 templates)',
      'Limited fixture library (100 fixtures)',
      '1 saved project',
      'Basic design tool',
      'Community support',
      'PDF export only'
    ],
    limits: {
      projects: 1,
      teamMembers: 1,
      fixtures: 100,
      exportFormats: ['pdf']
    },
    permissions: {
      // Basic Tools
      ppfdCalculator: true,
      dliCalculator: true,
      sopGenerator: true,
      fixtureBrowser: true,
      basicDesigner: true,
      
      // Everything else is false
      advancedDesigner: false,
      designer3D: false,
      autoArrangement: false,
      objectProperties: false,
      shadowMapping: false,
      multiLayer: false,
      energyCostAnalysis: false,
      heatLoadCalculator: false,
      spectrumAnalysis: false,
      electricalLoadBalancing: false,
      cropRotationPlanner: false,
      yieldPredictor: false,
      lightingScheduler: false,
      maintenanceScheduler: false,
      environmentalAlerts: false,
      predictiveMaintenance: false,
      complianceAuditTrail: false,
      dlcCompliance: false,
      mlYieldPrediction: false,
      weatherAdaptive: false,
      iotIntegration: false,
      packagingEquipmentAPI: false,
      customSpectrumDesigner: false,
      photosyntheticModeling: false,
      multiSiteManagement: false,
      teamCollaboration: false,
      whiteLabel: false,
      customIntegrations: false,
      apiAccess: false,
      bulkOperations: false
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    priceId: 'price_starter_monthly',
    description: 'For small-scale growers and consultants getting started',
    features: [
      'Everything in Free',
      'Full DLC fixture database (5000+ fixtures)',
      'Energy cost calculator & analysis',
      'Basic heat load calculator',
      'Environmental monitoring',
      '10 saved projects',
      'Email support',
      'CSV & JSON export',
      'Basic compliance tools'
    ],
    limits: {
      projects: 10,
      teamMembers: 1,
      fixtures: -1, // unlimited
      exportFormats: ['pdf', 'csv', 'json']
    },
    permissions: {
      // Basic Tools
      ppfdCalculator: true,
      dliCalculator: true,
      sopGenerator: true,
      fixtureBrowser: true,
      basicDesigner: true,
      
      // Starter additions
      energyCostAnalysis: true,
      heatLoadCalculator: true,
      dlcCompliance: true,
      environmentalAlerts: true,
      
      // Still limited
      advancedDesigner: false,
      designer3D: false,
      autoArrangement: false,
      objectProperties: false,
      shadowMapping: false,
      multiLayer: false,
      spectrumAnalysis: false,
      electricalLoadBalancing: false,
      cropRotationPlanner: false,
      yieldPredictor: false,
      lightingScheduler: false,
      maintenanceScheduler: false,
      predictiveMaintenance: false,
      complianceAuditTrail: false,
      mlYieldPrediction: false,
      weatherAdaptive: false,
      iotIntegration: false,
      packagingEquipmentAPI: false,
      customSpectrumDesigner: false,
      photosyntheticModeling: false,
      multiSiteManagement: false,
      teamCollaboration: false,
      whiteLabel: false,
      customIntegrations: false,
      apiAccess: false,
      bulkOperations: false
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49,
    priceId: 'price_professional_monthly',
    description: 'For professional growers and facility designers',
    features: [
      'Everything in Starter',
      'Advanced 3D design studio',
      'Auto-arrangement optimization',
      'Object properties panel',
      'Multi-layer canopy design',
      'Crop rotation planner',
      'Maintenance scheduler',
      'Spectrum analysis',
      'Electrical load balancing',
      '50 saved projects',
      'Priority email support',
      'CAD & IES export',
      'API access (1000 calls/month)'
    ],
    limits: {
      projects: 50,
      teamMembers: 3,
      fixtures: -1,
      apiCalls: 1000,
      exportFormats: ['pdf', 'csv', 'json', 'cad', 'ies']
    },
    permissions: {
      // All basic tools
      ppfdCalculator: true,
      dliCalculator: true,
      sopGenerator: true,
      fixtureBrowser: true,
      basicDesigner: true,
      
      // Professional features
      advancedDesigner: true,
      designer3D: true,
      autoArrangement: true,
      objectProperties: true,
      shadowMapping: true,
      multiLayer: true,
      energyCostAnalysis: true,
      heatLoadCalculator: true,
      spectrumAnalysis: true,
      electricalLoadBalancing: true,
      cropRotationPlanner: true,
      lightingScheduler: true,
      maintenanceScheduler: true,
      environmentalAlerts: true,
      dlcCompliance: true,
      apiAccess: true,
      
      // Still premium features
      yieldPredictor: false,
      predictiveMaintenance: false,
      complianceAuditTrail: false,
      mlYieldPrediction: false,
      weatherAdaptive: false,
      iotIntegration: false,
      packagingEquipmentAPI: false,
      customSpectrumDesigner: false,
      photosyntheticModeling: false,
      multiSiteManagement: false,
      teamCollaboration: false,
      whiteLabel: false,
      customIntegrations: false,
      bulkOperations: false
    },
    highlighted: true
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: 149,
    priceId: 'price_advanced_monthly',
    description: 'For large facilities with advanced optimization needs',
    features: [
      'Everything in Professional',
      'ML-powered yield predictions',
      'Predictive maintenance alerts',
      'Compliance audit trail',
      'Custom spectrum designer',
      'Photosynthetic modeling',
      'Weather adaptive lighting',
      'Basic IoT integration',
      'Packaging equipment API',
      'Unlimited projects',
      '10 team members',
      'Phone & chat support',
      'Unlimited API calls',
      'Bulk operations'
    ],
    limits: {
      projects: -1, // unlimited
      teamMembers: 10,
      fixtures: -1,
      apiCalls: -1,
      exportFormats: ['pdf', 'csv', 'json', 'cad', 'ies', 'xml', 'custom']
    },
    permissions: {
      // Everything except enterprise
      ppfdCalculator: true,
      dliCalculator: true,
      sopGenerator: true,
      fixtureBrowser: true,
      basicDesigner: true,
      advancedDesigner: true,
      designer3D: true,
      autoArrangement: true,
      objectProperties: true,
      shadowMapping: true,
      multiLayer: true,
      energyCostAnalysis: true,
      heatLoadCalculator: true,
      spectrumAnalysis: true,
      electricalLoadBalancing: true,
      cropRotationPlanner: true,
      yieldPredictor: true,
      lightingScheduler: true,
      maintenanceScheduler: true,
      environmentalAlerts: true,
      predictiveMaintenance: true,
      complianceAuditTrail: true,
      dlcCompliance: true,
      mlYieldPrediction: true,
      weatherAdaptive: true,
      iotIntegration: true,
      packagingEquipmentAPI: true,
      customSpectrumDesigner: true,
      photosyntheticModeling: true,
      apiAccess: true,
      bulkOperations: true,
      
      // Enterprise only
      multiSiteManagement: false,
      teamCollaboration: false,
      whiteLabel: false,
      customIntegrations: false
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 399,
    priceId: 'price_enterprise_monthly',
    description: 'For multi-site operations and large teams',
    features: [
      'Everything in Advanced',
      'Multi-site management',
      'Unlimited team members',
      'Advanced collaboration tools',
      'White-label options',
      'Custom integrations',
      'Dedicated account manager',
      'Custom training sessions',
      'SLA guarantee',
      '24/7 phone support',
      'On-premise deployment option',
      'Custom feature development'
    ],
    limits: {
      projects: -1,
      teamMembers: -1,
      fixtures: -1,
      apiCalls: -1,
      exportFormats: ['all']
    },
    permissions: {
      // Everything enabled
      ppfdCalculator: true,
      dliCalculator: true,
      sopGenerator: true,
      fixtureBrowser: true,
      basicDesigner: true,
      advancedDesigner: true,
      designer3D: true,
      autoArrangement: true,
      objectProperties: true,
      shadowMapping: true,
      multiLayer: true,
      energyCostAnalysis: true,
      heatLoadCalculator: true,
      spectrumAnalysis: true,
      electricalLoadBalancing: true,
      cropRotationPlanner: true,
      yieldPredictor: true,
      lightingScheduler: true,
      maintenanceScheduler: true,
      environmentalAlerts: true,
      predictiveMaintenance: true,
      complianceAuditTrail: true,
      dlcCompliance: true,
      mlYieldPrediction: true,
      weatherAdaptive: true,
      iotIntegration: true,
      packagingEquipmentAPI: true,
      customSpectrumDesigner: true,
      photosyntheticModeling: true,
      multiSiteManagement: true,
      teamCollaboration: true,
      whiteLabel: true,
      customIntegrations: true,
      apiAccess: true,
      bulkOperations: true
    }
  },
  {
    id: 'custom',
    name: 'Custom',
    price: -1, // Contact sales
    description: 'Tailored solutions for research institutions and unique requirements',
    features: [
      'Custom feature set',
      'Research-grade tools',
      'Academic licensing',
      'Custom deployment options',
      'Dedicated infrastructure',
      'Custom API limits',
      'Specialized support',
      'Co-development opportunities'
    ],
    limits: {
      projects: -1,
      teamMembers: -1,
      fixtures: -1,
      apiCalls: -1,
      exportFormats: ['all']
    },
    permissions: {
      // Customizable based on needs
      ppfdCalculator: true,
      dliCalculator: true,
      sopGenerator: true,
      fixtureBrowser: true,
      basicDesigner: true,
      advancedDesigner: true,
      designer3D: true,
      autoArrangement: true,
      objectProperties: true,
      shadowMapping: true,
      multiLayer: true,
      energyCostAnalysis: true,
      heatLoadCalculator: true,
      spectrumAnalysis: true,
      electricalLoadBalancing: true,
      cropRotationPlanner: true,
      yieldPredictor: true,
      lightingScheduler: true,
      maintenanceScheduler: true,
      environmentalAlerts: true,
      predictiveMaintenance: true,
      complianceAuditTrail: true,
      dlcCompliance: true,
      mlYieldPrediction: true,
      weatherAdaptive: true,
      iotIntegration: true,
      packagingEquipmentAPI: true,
      customSpectrumDesigner: true,
      photosyntheticModeling: true,
      multiSiteManagement: true,
      teamCollaboration: true,
      whiteLabel: true,
      customIntegrations: true,
      apiAccess: true,
      bulkOperations: true
    }
  }
];

// Helper function to check if a feature is available for a tier
export function hasFeatureAccess(
  tierName: string,
  feature: keyof SubscriptionTier['permissions']
): boolean {
  const tier = SUBSCRIPTION_TIERS.find(t => t.name.toLowerCase() === tierName.toLowerCase());
  return tier?.permissions[feature] ?? false;
}

// Get tier by ID
export function getTierById(tierId: string): SubscriptionTier | undefined {
  return SUBSCRIPTION_TIERS.find(t => t.id === tierId);
}

// Get tier limits
export function getTierLimits(tierName: string) {
  const tier = SUBSCRIPTION_TIERS.find(t => t.name.toLowerCase() === tierName.toLowerCase());
  return tier?.limits ?? {
    projects: 1,
    teamMembers: 1,
    fixtures: 100,
    apiCalls: 0,
    exportFormats: ['pdf']
  };
}