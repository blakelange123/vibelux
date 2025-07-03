// Comprehensive subscription tier system with granular feature flags
export interface SubscriptionTierV2 {
  id: string;
  name: string;
  price: number;
  priceAnnual?: number; // Annual price (usually 20% discount)
  priceId?: string; // Stripe price ID monthly
  priceIdAnnual?: string; // Stripe price ID annual
  description: string;
  targetAudience: string;
  features: string[];
  limits: {
    projects: number;
    teamMembers: number;
    fixtures: number;
    apiCalls?: number;
    sopGeneration?: number; // AI-powered SOPs per month
    aiCredits?: number; // For AI features
    exportFormats: string[];
    supportLevel: 'community' | 'email' | 'priority' | 'phone' | 'dedicated';
    dataRetention: number; // days
  };
  permissions: {
    // Basic Calculators
    ppfdCalculator: boolean;
    dliCalculator: boolean;
    vpgCalculator: boolean;
    basicDesigner: boolean;
    
    // Fixture Management
    fixtureLibraryLimited: boolean; // 100 fixtures
    fixtureLibraryFull: boolean; // 5000+ fixtures
    customFixtures: boolean;
    fixtureComparison: boolean;
    
    // Design Features
    designer2D: boolean;
    designer3D: boolean;
    heatMapVisualization: boolean;
    autoArrangement: boolean;
    multiLayerDesign: boolean;
    shadowMapping: boolean;
    objectProperties: boolean;
    
    // Electrical Features
    basicElectricalCalc: boolean; // Simple load calculations
    electricalEstimator: boolean; // Full estimation tool
    electricalLoadBalancing: boolean; // Advanced phase balancing
    circuitPlanning: boolean;
    wireGaugeRecommendations: boolean;
    
    // Energy & Cost Analysis
    basicEnergyCost: boolean; // Simple calculations
    advancedEnergyCost: boolean; // With tariff optimization
    peakDemandAnalysis: boolean;
    carbonFootprint: boolean;
    roiCalculator: boolean;
    
    // Environmental Monitoring
    basicEnvironmentalAlerts: boolean;
    advancedEnvironmentalAlerts: boolean;
    sensorIntegration: boolean;
    weatherAdaptive: boolean;
    
    // Planning & Scheduling
    basicScheduler: boolean;
    lightingScheduler: boolean;
    maintenanceScheduler: boolean;
    cropRotationPlanner: boolean;
    
    // AI-Powered Features
    sopGenerator: boolean; // Uses ChatGPT API
    aiSpectrumRecommendations: boolean;
    mlYieldPrediction: boolean;
    predictiveMaintenance: boolean;
    aiCropAdvisor: boolean;
    
    // Professional Tools
    spectrumAnalysis: boolean;
    photosyntheticModeling: boolean;
    customSpectrumDesigner: boolean;
    heatLoadCalculator: boolean;
    complianceChecker: boolean;
    
    // Data & Analytics
    basicReporting: boolean;
    advancedAnalytics: boolean;
    customDashboards: boolean;
    dataExportAdvanced: boolean;
    
    // Compliance & Documentation
    basicCompliance: boolean;
    complianceAuditTrail: boolean;
    documentGeneration: boolean;
    certificateGeneration: boolean;
    
    // Integration & API
    apiAccess: boolean;
    webhooks: boolean;
    iotIntegration: boolean;
    erpIntegration: boolean;
    customIntegrations: boolean;
    
    // Collaboration
    teamSharing: boolean;
    projectComments: boolean;
    versionControl: boolean;
    roleBasedAccess: boolean;
    
    // Enterprise Features
    multiSiteManagement: boolean;
    whiteLabel: boolean;
    ssoIntegration: boolean;
    customTraining: boolean;
    dedicatedInfrastructure: boolean;
  };
  highlighted?: boolean;
  popular?: boolean;
}

export const SUBSCRIPTION_TIERS_V2: SubscriptionTierV2[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Essential tools for learning and small personal grows',
    targetAudience: 'Students, hobbyists, home growers',
    features: [
      'Basic PPFD/DLI/VPD calculators',
      'Limited fixture library (100 fixtures)',
      '1 saved project',
      'Basic 2D designer',
      'Simple energy cost calculator',
      'Community support',
      'PDF export only',
      '7-day data retention'
    ],
    limits: {
      projects: 1,
      teamMembers: 1,
      fixtures: 100,
      exportFormats: ['pdf'],
      supportLevel: 'community',
      dataRetention: 7
    },
    permissions: {
      ppfdCalculator: true,
      dliCalculator: true,
      vpgCalculator: true,
      basicDesigner: true,
      fixtureLibraryLimited: true,
      designer2D: true,
      basicEnergyCost: true,
      basicReporting: true,
      // Everything else false
      fixtureLibraryFull: false,
      customFixtures: false,
      fixtureComparison: false,
      designer3D: false,
      heatMapVisualization: false,
      autoArrangement: false,
      multiLayerDesign: false,
      shadowMapping: false,
      objectProperties: false,
      basicElectricalCalc: false,
      electricalEstimator: false,
      electricalLoadBalancing: false,
      circuitPlanning: false,
      wireGaugeRecommendations: false,
      advancedEnergyCost: false,
      peakDemandAnalysis: false,
      carbonFootprint: false,
      roiCalculator: false,
      basicEnvironmentalAlerts: false,
      advancedEnvironmentalAlerts: false,
      sensorIntegration: false,
      weatherAdaptive: false,
      basicScheduler: false,
      lightingScheduler: false,
      maintenanceScheduler: false,
      cropRotationPlanner: false,
      sopGenerator: false,
      aiSpectrumRecommendations: false,
      mlYieldPrediction: false,
      predictiveMaintenance: false,
      aiCropAdvisor: false,
      spectrumAnalysis: false,
      photosyntheticModeling: false,
      customSpectrumDesigner: false,
      heatLoadCalculator: false,
      complianceChecker: false,
      advancedAnalytics: false,
      customDashboards: false,
      dataExportAdvanced: false,
      basicCompliance: false,
      complianceAuditTrail: false,
      documentGeneration: false,
      certificateGeneration: false,
      apiAccess: false,
      webhooks: false,
      iotIntegration: false,
      erpIntegration: false,
      customIntegrations: false,
      teamSharing: false,
      projectComments: false,
      versionControl: false,
      roleBasedAccess: false,
      multiSiteManagement: false,
      whiteLabel: false,
      ssoIntegration: false,
      customTraining: false,
      dedicatedInfrastructure: false
    }
  },
  {
    id: 'hobbyist',
    name: 'Hobbyist Plus',
    price: 9,
    priceAnnual: 86, // ~20% discount
    description: 'Advanced tools for serious hobbyists and small grows',
    targetAudience: 'Dedicated hobbyists, medical growers, small greenhouses',
    features: [
      'Everything in Free',
      'Full DLC fixture database (5000+)',
      '5 saved projects',
      'Heat map visualization',
      'Basic electrical calculations',
      'Fixture comparison tool',
      'Environmental alerts',
      'CSV export',
      '30-day data retention',
      'Email support'
    ],
    limits: {
      projects: 5,
      teamMembers: 1,
      fixtures: -1,
      exportFormats: ['pdf', 'csv'],
      supportLevel: 'email',
      dataRetention: 30
    },
    permissions: {
      // Everything from Free
      ppfdCalculator: true,
      dliCalculator: true,
      vpgCalculator: true,
      basicDesigner: true,
      designer2D: true,
      basicEnergyCost: true,
      basicReporting: true,
      
      // New in Hobbyist Plus
      fixtureLibraryLimited: false,
      fixtureLibraryFull: true,
      fixtureComparison: true,
      heatMapVisualization: true,
      basicElectricalCalc: true,
      basicEnvironmentalAlerts: true,
      
      // Still restricted
      customFixtures: false,
      designer3D: false,
      autoArrangement: false,
      multiLayerDesign: false,
      shadowMapping: false,
      objectProperties: false,
      electricalEstimator: false,
      electricalLoadBalancing: false,
      circuitPlanning: false,
      wireGaugeRecommendations: false,
      advancedEnergyCost: false,
      peakDemandAnalysis: false,
      carbonFootprint: false,
      roiCalculator: false,
      advancedEnvironmentalAlerts: false,
      sensorIntegration: false,
      weatherAdaptive: false,
      basicScheduler: false,
      lightingScheduler: false,
      maintenanceScheduler: false,
      cropRotationPlanner: false,
      sopGenerator: false,
      aiSpectrumRecommendations: false,
      mlYieldPrediction: false,
      predictiveMaintenance: false,
      aiCropAdvisor: false,
      spectrumAnalysis: false,
      photosyntheticModeling: false,
      customSpectrumDesigner: false,
      heatLoadCalculator: false,
      complianceChecker: false,
      advancedAnalytics: false,
      customDashboards: false,
      dataExportAdvanced: false,
      basicCompliance: false,
      complianceAuditTrail: false,
      documentGeneration: false,
      certificateGeneration: false,
      apiAccess: false,
      webhooks: false,
      iotIntegration: false,
      erpIntegration: false,
      customIntegrations: false,
      teamSharing: false,
      projectComments: false,
      versionControl: false,
      roleBasedAccess: false,
      multiSiteManagement: false,
      whiteLabel: false,
      ssoIntegration: false,
      customTraining: false,
      dedicatedInfrastructure: false
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceAnnual: 278,
    description: 'Professional tools for small commercial operations',
    targetAudience: 'Small farms, consultants starting out, pilot facilities',
    features: [
      'Everything in Hobbyist Plus',
      '20 saved projects',
      'Basic 3D visualization',
      'Electrical load estimator',
      'ROI calculator',
      'Heat load calculator',
      'Basic scheduling tools',
      'Advanced energy cost analysis',
      'JSON export',
      '90-day data retention',
      'Basic compliance tools'
    ],
    limits: {
      projects: 20,
      teamMembers: 2,
      fixtures: -1,
      exportFormats: ['pdf', 'csv', 'json'],
      supportLevel: 'email',
      dataRetention: 90
    },
    permissions: {
      // Everything from Hobbyist Plus
      ppfdCalculator: true,
      dliCalculator: true,
      vpgCalculator: true,
      basicDesigner: true,
      designer2D: true,
      basicEnergyCost: true,
      basicReporting: true,
      fixtureLibraryFull: true,
      fixtureComparison: true,
      heatMapVisualization: true,
      basicElectricalCalc: true,
      basicEnvironmentalAlerts: true,
      
      // New in Starter
      designer3D: true,
      electricalEstimator: true,
      advancedEnergyCost: true,
      roiCalculator: true,
      heatLoadCalculator: true,
      basicScheduler: true,
      basicCompliance: true,
      customFixtures: true,
      
      // Still restricted
      autoArrangement: false,
      multiLayerDesign: false,
      shadowMapping: false,
      objectProperties: false,
      electricalLoadBalancing: false,
      circuitPlanning: false,
      wireGaugeRecommendations: false,
      peakDemandAnalysis: false,
      carbonFootprint: false,
      advancedEnvironmentalAlerts: false,
      sensorIntegration: false,
      weatherAdaptive: false,
      lightingScheduler: false,
      maintenanceScheduler: false,
      cropRotationPlanner: false,
      sopGenerator: false,
      aiSpectrumRecommendations: false,
      mlYieldPrediction: false,
      predictiveMaintenance: false,
      aiCropAdvisor: false,
      spectrumAnalysis: false,
      photosyntheticModeling: false,
      customSpectrumDesigner: false,
      complianceChecker: false,
      advancedAnalytics: false,
      customDashboards: false,
      dataExportAdvanced: false,
      complianceAuditTrail: false,
      documentGeneration: false,
      certificateGeneration: false,
      apiAccess: false,
      webhooks: false,
      iotIntegration: false,
      erpIntegration: false,
      customIntegrations: false,
      teamSharing: false,
      projectComments: false,
      versionControl: false,
      roleBasedAccess: false,
      multiSiteManagement: false,
      whiteLabel: false,
      ssoIntegration: false,
      customTraining: false,
      dedicatedInfrastructure: false
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    priceAnnual: 758,
    description: 'Complete toolkit for lighting professionals',
    targetAudience: 'Lighting designers, growing consultants, medium farms',
    features: [
      'Everything in Starter',
      '100 saved projects',
      'Auto-arrangement AI',
      'Object properties panel',
      'Electrical load balancing',
      'Circuit planning tools',
      'Wire gauge recommendations',
      'Spectrum analysis',
      'Lighting scheduler',
      'Maintenance scheduler',
      'Team sharing (3 users)',
      'CAD/IES export',
      'Priority email support',
      '1-year data retention',
      'AI spectrum recommendations (100/mo)',
      'SOP generator (10/mo)'
    ],
    limits: {
      projects: 100,
      teamMembers: 3,
      fixtures: -1,
      sopGeneration: 10,
      aiCredits: 100,
      exportFormats: ['pdf', 'csv', 'json', 'cad', 'ies'],
      supportLevel: 'priority',
      dataRetention: 365
    },
    permissions: {
      // Everything from Starter
      ppfdCalculator: true,
      dliCalculator: true,
      vpgCalculator: true,
      basicDesigner: true,
      designer2D: true,
      designer3D: true,
      basicEnergyCost: true,
      basicReporting: true,
      fixtureLibraryFull: true,
      fixtureComparison: true,
      heatMapVisualization: true,
      basicElectricalCalc: true,
      basicEnvironmentalAlerts: true,
      electricalEstimator: true,
      advancedEnergyCost: true,
      roiCalculator: true,
      heatLoadCalculator: true,
      basicScheduler: true,
      basicCompliance: true,
      customFixtures: true,
      
      // New in Professional
      autoArrangement: true,
      objectProperties: true,
      electricalLoadBalancing: true,
      circuitPlanning: true,
      wireGaugeRecommendations: true,
      spectrumAnalysis: true,
      lightingScheduler: true,
      maintenanceScheduler: true,
      teamSharing: true,
      sopGenerator: true,
      aiSpectrumRecommendations: true,
      shadowMapping: true,
      
      // Still restricted
      multiLayerDesign: false,
      peakDemandAnalysis: false,
      carbonFootprint: false,
      advancedEnvironmentalAlerts: false,
      sensorIntegration: false,
      weatherAdaptive: false,
      cropRotationPlanner: false,
      mlYieldPrediction: false,
      predictiveMaintenance: false,
      aiCropAdvisor: false,
      photosyntheticModeling: false,
      customSpectrumDesigner: false,
      complianceChecker: false,
      advancedAnalytics: false,
      customDashboards: false,
      dataExportAdvanced: false,
      complianceAuditTrail: false,
      documentGeneration: false,
      certificateGeneration: false,
      apiAccess: false,
      webhooks: false,
      iotIntegration: false,
      erpIntegration: false,
      customIntegrations: false,
      projectComments: false,
      versionControl: false,
      roleBasedAccess: false,
      multiSiteManagement: false,
      whiteLabel: false,
      ssoIntegration: false,
      customTraining: false,
      dedicatedInfrastructure: false
    },
    highlighted: true,
    popular: true
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: 149,
    priceAnnual: 1430,
    description: 'Scientific tools for optimization and compliance',
    targetAudience: 'Large farms, research facilities, compliance-focused operations',
    features: [
      'Everything in Professional',
      'Unlimited projects',
      'Multi-layer canopy design',
      'Crop rotation planner',
      'Peak demand analysis',
      'Carbon footprint tracking',
      'Advanced environmental monitoring',
      'Weather adaptive lighting',
      'Photosynthetic modeling',
      'Compliance audit trail',
      'Document generation',
      'API access (5000 calls/mo)',
      'Team collaboration (10 users)',
      'Advanced analytics',
      'Unlimited data retention',
      'AI features (500/mo)',
      'SOP generator (50/mo)',
      'Priority phone support'
    ],
    limits: {
      projects: -1,
      teamMembers: 10,
      fixtures: -1,
      apiCalls: 5000,
      sopGeneration: 50,
      aiCredits: 500,
      exportFormats: ['pdf', 'csv', 'json', 'cad', 'ies', 'xml', 'xlsx'],
      supportLevel: 'phone',
      dataRetention: -1
    },
    permissions: {
      // Everything from Professional
      ppfdCalculator: true,
      dliCalculator: true,
      vpgCalculator: true,
      basicDesigner: true,
      designer2D: true,
      designer3D: true,
      basicEnergyCost: true,
      basicReporting: true,
      fixtureLibraryFull: true,
      fixtureComparison: true,
      heatMapVisualization: true,
      basicElectricalCalc: true,
      basicEnvironmentalAlerts: true,
      electricalEstimator: true,
      advancedEnergyCost: true,
      roiCalculator: true,
      heatLoadCalculator: true,
      basicScheduler: true,
      basicCompliance: true,
      customFixtures: true,
      autoArrangement: true,
      objectProperties: true,
      electricalLoadBalancing: true,
      circuitPlanning: true,
      wireGaugeRecommendations: true,
      spectrumAnalysis: true,
      lightingScheduler: true,
      maintenanceScheduler: true,
      teamSharing: true,
      sopGenerator: true,
      aiSpectrumRecommendations: true,
      shadowMapping: true,
      
      // New in Advanced
      multiLayerDesign: true,
      cropRotationPlanner: true,
      peakDemandAnalysis: true,
      carbonFootprint: true,
      advancedEnvironmentalAlerts: true,
      weatherAdaptive: true,
      photosyntheticModeling: true,
      complianceAuditTrail: true,
      documentGeneration: true,
      apiAccess: true,
      advancedAnalytics: true,
      projectComments: true,
      complianceChecker: true,
      
      // Still restricted
      sensorIntegration: false,
      mlYieldPrediction: false,
      predictiveMaintenance: false,
      aiCropAdvisor: false,
      customSpectrumDesigner: false,
      customDashboards: false,
      dataExportAdvanced: false,
      certificateGeneration: false,
      webhooks: false,
      iotIntegration: false,
      erpIntegration: false,
      customIntegrations: false,
      versionControl: false,
      roleBasedAccess: false,
      multiSiteManagement: false,
      whiteLabel: false,
      ssoIntegration: false,
      customTraining: false,
      dedicatedInfrastructure: false
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    priceAnnual: 2870,
    description: 'AI-powered platform for large-scale operations',
    targetAudience: 'Large commercial farms, multi-site operations',
    features: [
      'Everything in Advanced',
      'ML yield prediction',
      'Predictive maintenance',
      'AI crop advisor',
      'Custom spectrum designer',
      'Sensor integration',
      'IoT device management',
      'Custom dashboards',
      'Certificate generation',
      'API access (unlimited)',
      'Webhooks',
      'Team collaboration (25 users)',
      'Version control',
      'Role-based access',
      'Unlimited AI features',
      'Unlimited SOP generation',
      'Dedicated phone support'
    ],
    limits: {
      projects: -1,
      teamMembers: 25,
      fixtures: -1,
      apiCalls: -1,
      sopGeneration: -1,
      aiCredits: -1,
      exportFormats: ['all'],
      supportLevel: 'phone',
      dataRetention: -1
    },
    permissions: {
      // Everything enabled except corporate features
      ppfdCalculator: true,
      dliCalculator: true,
      vpgCalculator: true,
      basicDesigner: true,
      fixtureLibraryLimited: true,
      fixtureLibraryFull: true,
      customFixtures: true,
      fixtureComparison: true,
      designer2D: true,
      designer3D: true,
      heatMapVisualization: true,
      autoArrangement: true,
      multiLayerDesign: true,
      shadowMapping: true,
      objectProperties: true,
      basicElectricalCalc: true,
      electricalEstimator: true,
      electricalLoadBalancing: true,
      circuitPlanning: true,
      wireGaugeRecommendations: true,
      basicEnergyCost: true,
      advancedEnergyCost: true,
      peakDemandAnalysis: true,
      carbonFootprint: true,
      roiCalculator: true,
      basicEnvironmentalAlerts: true,
      advancedEnvironmentalAlerts: true,
      sensorIntegration: true,
      weatherAdaptive: true,
      basicScheduler: true,
      lightingScheduler: true,
      maintenanceScheduler: true,
      cropRotationPlanner: true,
      sopGenerator: true,
      aiSpectrumRecommendations: true,
      mlYieldPrediction: true,
      predictiveMaintenance: true,
      aiCropAdvisor: true,
      spectrumAnalysis: true,
      photosyntheticModeling: true,
      customSpectrumDesigner: true,
      heatLoadCalculator: true,
      complianceChecker: true,
      basicReporting: true,
      advancedAnalytics: true,
      customDashboards: true,
      dataExportAdvanced: true,
      basicCompliance: true,
      complianceAuditTrail: true,
      documentGeneration: true,
      certificateGeneration: true,
      apiAccess: true,
      webhooks: true,
      iotIntegration: true,
      teamSharing: true,
      projectComments: true,
      versionControl: true,
      roleBasedAccess: true,
      
      // Corporate features still restricted
      erpIntegration: false,
      customIntegrations: false,
      multiSiteManagement: false,
      whiteLabel: false,
      ssoIntegration: false,
      customTraining: false,
      dedicatedInfrastructure: false
    }
  },
  {
    id: 'corporate',
    name: 'Corporate',
    price: 599,
    priceAnnual: 5750,
    description: 'White-label solution for consultants and multi-site operations',
    targetAudience: 'Consulting firms, franchise operations, equipment manufacturers',
    features: [
      'Everything in Enterprise',
      'Multi-site management',
      'White-label branding',
      'SSO integration',
      'ERP integration',
      'Custom integrations',
      'Unlimited team members',
      'Dedicated account manager',
      'Custom training sessions',
      'SLA guarantee',
      'On-premise option available',
      'Source code escrow',
      'Custom feature development'
    ],
    limits: {
      projects: -1,
      teamMembers: -1,
      fixtures: -1,
      apiCalls: -1,
      sopGeneration: -1,
      aiCredits: -1,
      exportFormats: ['all'],
      supportLevel: 'dedicated',
      dataRetention: -1
    },
    permissions: {
      // Everything enabled
      ppfdCalculator: true,
      dliCalculator: true,
      vpgCalculator: true,
      basicDesigner: true,
      fixtureLibraryLimited: true,
      fixtureLibraryFull: true,
      customFixtures: true,
      fixtureComparison: true,
      designer2D: true,
      designer3D: true,
      heatMapVisualization: true,
      autoArrangement: true,
      multiLayerDesign: true,
      shadowMapping: true,
      objectProperties: true,
      basicElectricalCalc: true,
      electricalEstimator: true,
      electricalLoadBalancing: true,
      circuitPlanning: true,
      wireGaugeRecommendations: true,
      basicEnergyCost: true,
      advancedEnergyCost: true,
      peakDemandAnalysis: true,
      carbonFootprint: true,
      roiCalculator: true,
      basicEnvironmentalAlerts: true,
      advancedEnvironmentalAlerts: true,
      sensorIntegration: true,
      weatherAdaptive: true,
      basicScheduler: true,
      lightingScheduler: true,
      maintenanceScheduler: true,
      cropRotationPlanner: true,
      sopGenerator: true,
      aiSpectrumRecommendations: true,
      mlYieldPrediction: true,
      predictiveMaintenance: true,
      aiCropAdvisor: true,
      spectrumAnalysis: true,
      photosyntheticModeling: true,
      customSpectrumDesigner: true,
      heatLoadCalculator: true,
      complianceChecker: true,
      basicReporting: true,
      advancedAnalytics: true,
      customDashboards: true,
      dataExportAdvanced: true,
      basicCompliance: true,
      complianceAuditTrail: true,
      documentGeneration: true,
      certificateGeneration: true,
      apiAccess: true,
      webhooks: true,
      iotIntegration: true,
      erpIntegration: true,
      customIntegrations: true,
      teamSharing: true,
      projectComments: true,
      versionControl: true,
      roleBasedAccess: true,
      multiSiteManagement: true,
      whiteLabel: true,
      ssoIntegration: true,
      customTraining: true,
      dedicatedInfrastructure: true
    }
  },
  {
    id: 'academic',
    name: 'Academic',
    price: 99,
    priceAnnual: 950,
    description: 'Special pricing for educational institutions',
    targetAudience: 'Universities, colleges, agricultural schools, research labs',
    features: [
      'All Enterprise features',
      '100 student accounts',
      'Classroom management tools',
      'Curriculum integration',
      'Research data export',
      'Publication templates',
      'Grant writing assistance',
      'Academic support',
      'Workshop materials',
      'Guest lecturer access',
      'Non-commercial use only'
    ],
    limits: {
      projects: -1,
      teamMembers: 100,
      fixtures: -1,
      apiCalls: -1,
      sopGeneration: -1,
      aiCredits: 1000,
      exportFormats: ['all'],
      supportLevel: 'priority',
      dataRetention: -1
    },
    permissions: {
      // Same as Enterprise but with academic pricing
      ppfdCalculator: true,
      dliCalculator: true,
      vpgCalculator: true,
      basicDesigner: true,
      fixtureLibraryLimited: true,
      fixtureLibraryFull: true,
      customFixtures: true,
      fixtureComparison: true,
      designer2D: true,
      designer3D: true,
      heatMapVisualization: true,
      autoArrangement: true,
      multiLayerDesign: true,
      shadowMapping: true,
      objectProperties: true,
      basicElectricalCalc: true,
      electricalEstimator: true,
      electricalLoadBalancing: true,
      circuitPlanning: true,
      wireGaugeRecommendations: true,
      basicEnergyCost: true,
      advancedEnergyCost: true,
      peakDemandAnalysis: true,
      carbonFootprint: true,
      roiCalculator: true,
      basicEnvironmentalAlerts: true,
      advancedEnvironmentalAlerts: true,
      sensorIntegration: true,
      weatherAdaptive: true,
      basicScheduler: true,
      lightingScheduler: true,
      maintenanceScheduler: true,
      cropRotationPlanner: true,
      sopGenerator: true,
      aiSpectrumRecommendations: true,
      mlYieldPrediction: true,
      predictiveMaintenance: true,
      aiCropAdvisor: true,
      spectrumAnalysis: true,
      photosyntheticModeling: true,
      customSpectrumDesigner: true,
      heatLoadCalculator: true,
      complianceChecker: true,
      basicReporting: true,
      advancedAnalytics: true,
      customDashboards: true,
      dataExportAdvanced: true,
      basicCompliance: true,
      complianceAuditTrail: true,
      documentGeneration: true,
      certificateGeneration: true,
      apiAccess: true,
      webhooks: true,
      iotIntegration: true,
      teamSharing: true,
      projectComments: true,
      versionControl: true,
      roleBasedAccess: true,
      // Academic restrictions
      erpIntegration: false,
      customIntegrations: false,
      multiSiteManagement: false,
      whiteLabel: false,
      ssoIntegration: false,
      customTraining: true, // Academic training
      dedicatedInfrastructure: false
    }
  }
];

// Helper functions
export function hasFeatureAccessV2(
  tierName: string,
  feature: keyof SubscriptionTierV2['permissions']
): boolean {
  const tier = SUBSCRIPTION_TIERS_V2.find(t => 
    t.name.toLowerCase() === tierName.toLowerCase() || 
    t.id === tierName.toLowerCase()
  );
  return tier?.permissions[feature] ?? false;
}

export function getTierByIdV2(tierId: string): SubscriptionTierV2 | undefined {
  return SUBSCRIPTION_TIERS_V2.find(t => t.id === tierId);
}

export function getTierLimitsV2(tierName: string) {
  const tier = SUBSCRIPTION_TIERS_V2.find(t => 
    t.name.toLowerCase() === tierName.toLowerCase() ||
    t.id === tierName.toLowerCase()
  );
  return tier?.limits ?? {
    projects: 1,
    teamMembers: 1,
    fixtures: 100,
    apiCalls: 0,
    sopGeneration: 0,
    aiCredits: 0,
    exportFormats: ['pdf'],
    supportLevel: 'community' as const,
    dataRetention: 7
  };
}

// Calculate savings for annual billing
export function calculateAnnualSavings(tierId: string): number {
  const tier = getTierByIdV2(tierId);
  if (!tier || !tier.priceAnnual || tier.price === 0) return 0;
  
  const monthlyTotal = tier.price * 12;
  const annualPrice = tier.priceAnnual;
  return monthlyTotal - annualPrice;
}

// Get tier recommendations based on needs
export function recommendTier(needs: {
  projects?: number;
  teamSize?: number;
  requiresCompliance?: boolean;
  requiresAI?: boolean;
  requiresAPI?: boolean;
  budget?: number;
}): string {
  const { projects = 1, teamSize = 1, requiresCompliance, requiresAI, requiresAPI, budget } = needs;

  // Filter tiers by requirements
  const eligibleTiers = SUBSCRIPTION_TIERS_V2.filter(tier => {
    if (tier.limits.projects !== -1 && tier.limits.projects < projects) return false;
    if (tier.limits.teamMembers !== -1 && tier.limits.teamMembers < teamSize) return false;
    if (requiresCompliance && !tier.permissions.complianceAuditTrail) return false;
    if (requiresAI && !tier.permissions.mlYieldPrediction) return false;
    if (requiresAPI && !tier.permissions.apiAccess) return false;
    if (budget && tier.price > budget) return false;
    return true;
  });

  // Return the most affordable eligible tier
  return eligibleTiers.sort((a, b) => a.price - b.price)[0]?.id || 'free';
}