/**
 * Module-based subscription system for VibeLux
 * Handles granular permissions for different packages and add-ons
 */

// Module definitions
export enum ModuleType {
  // Core Modules (included in base tiers)
  BASIC_CALCULATORS = 'basic_calculators',
  BASIC_DESIGN = 'basic_design',
  ADVANCED_DESIGN = 'advanced_design',
  OPERATIONS = 'operations',
  ANALYTICS = 'analytics',
  COMPLIANCE = 'compliance',
  API_ACCESS = 'api_access',
  
  // Add-on Modules
  AI_AUTOPILOT = 'ai_autopilot',
  DIGITAL_TWIN = 'digital_twin',
  INVESTMENT_PLATFORM = 'investment_platform',
  RESEARCH_TOOLS = 'research_tools',
  ENERGY_SUITE = 'energy_suite',
  CONSULTANT_TOOLS = 'consultant_tools',
  MULTI_SITE = 'multi_site',
  MARKETPLACE = 'marketplace',
  
  // Feature Modules
  WHITE_LABEL = 'white_label',
  CUSTOM_REPORTS = 'custom_reports',
  ADVANCED_ML = 'advanced_ml',
  SENSOR_INTEGRATION = 'sensor_integration',
  CAMERA_ANALYTICS = 'camera_analytics'
}

// Feature definitions within modules
export interface ModuleFeatures {
  [ModuleType.BASIC_CALCULATORS]: {
    ppfd_calculator: boolean;
    dli_calculator: boolean;
    vpd_calculator: boolean;
    basic_roi: boolean;
    coverage_area: boolean;
  };
  [ModuleType.ADVANCED_DESIGN]: {
    design_3d: boolean;
    fixture_library_size: number;
    max_projects: number;
    cad_export: boolean;
    collaboration: boolean;
  };
  [ModuleType.AI_AUTOPILOT]: {
    autonomous_control: boolean;
    predictive_maintenance: boolean;
    yield_optimization: boolean;
    energy_optimization: boolean;
    ml_model_access: string[];
  };
  [ModuleType.INVESTMENT_PLATFORM]: {
    portfolio_management: boolean;
    cost_analysis: boolean;
    yield_sharing: boolean;
    investor_dashboard: boolean;
    deal_flow: boolean;
  };
  [ModuleType.MARKETPLACE]: {
    view_listings: boolean;
    create_listings: boolean;
    bulk_discounts: boolean;
    analytics_dashboard: boolean;
    buyer_network: boolean;
    max_listings: number;
  };
}

// Base tier definitions
export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  includedModules: ModuleType[];
  limits: {
    users: number;
    sqft: number;
    apiCalls: number;
    projects: number;
    exports: number;
  };
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    includedModules: [
      ModuleType.BASIC_CALCULATORS
    ],
    limits: {
      users: 1,
      sqft: 1000,
      apiCalls: 0,
      projects: 1,
      exports: 3
    }
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 49,
    includedModules: [
      ModuleType.BASIC_CALCULATORS,
      ModuleType.BASIC_DESIGN
    ],
    limits: {
      users: 1,
      sqft: 5000,
      apiCalls: 0,
      projects: 3,
      exports: 10
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 299,
    includedModules: [
      ModuleType.BASIC_CALCULATORS,
      ModuleType.BASIC_DESIGN,
      ModuleType.ADVANCED_DESIGN,
      ModuleType.OPERATIONS,
      ModuleType.COMPLIANCE,
      ModuleType.API_ACCESS
    ],
    limits: {
      users: 5,
      sqft: 50000,
      apiCalls: 1000,
      projects: 10,
      exports: 100
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 799,
    includedModules: [
      ModuleType.BASIC_CALCULATORS,
      ModuleType.BASIC_DESIGN,
      ModuleType.ADVANCED_DESIGN,
      ModuleType.OPERATIONS,
      ModuleType.COMPLIANCE,
      ModuleType.API_ACCESS,
      ModuleType.ANALYTICS,
      ModuleType.DIGITAL_TWIN
    ],
    limits: {
      users: 15,
      sqft: -1, // unlimited
      apiCalls: 10000,
      projects: 50,
      exports: 500
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1999,
    includedModules: [
      ModuleType.BASIC_CALCULATORS,
      ModuleType.BASIC_DESIGN,
      ModuleType.ADVANCED_DESIGN,
      ModuleType.OPERATIONS,
      ModuleType.COMPLIANCE,
      ModuleType.API_ACCESS,
      ModuleType.ANALYTICS,
      ModuleType.DIGITAL_TWIN,
      ModuleType.MULTI_SITE,
      ModuleType.ADVANCED_ML
    ],
    limits: {
      users: 50,
      sqft: -1,
      apiCalls: -1, // unlimited
      projects: -1,
      exports: -1
    }
  }
};

// Add-on module definitions
export interface AddOnModule {
  id: ModuleType;
  name: string;
  price: number;
  description: string;
  features: string[];
  requiresTier?: string; // minimum tier required
}

export const ADD_ON_MODULES: Record<string, AddOnModule> = {
  [ModuleType.AI_AUTOPILOT]: {
    id: ModuleType.AI_AUTOPILOT,
    name: 'AI AutoPilot',
    price: 500,
    description: 'Autonomous facility operations with AI',
    features: [
      'Autonomous climate control',
      'Predictive maintenance',
      'Yield optimization AI',
      'Energy optimization'
    ],
    requiresTier: 'professional'
  },
  [ModuleType.INVESTMENT_PLATFORM]: {
    id: ModuleType.INVESTMENT_PLATFORM,
    name: 'VibeLux Capital',
    price: 2000,
    description: 'Investment and portfolio management platform',
    features: [
      'GaaS/YEP management',
      'Portfolio analytics',
      'Cost extraction',
      'Investor dashboard',
      'Deal flow management'
    ],
    requiresTier: 'business'
  },
  [ModuleType.MARKETPLACE]: {
    id: ModuleType.MARKETPLACE,
    name: 'CEA Marketplace',
    price: 99,
    description: 'Buy and sell fresh produce directly',
    features: [
      'Browse all produce listings',
      'Create unlimited listings',
      'Analytics dashboard',
      'Buyer network management',
      'Bulk discount tools',
      'Order management'
    ],
    requiresTier: 'starter'
  },
  [ModuleType.RESEARCH_TOOLS]: {
    id: ModuleType.RESEARCH_TOOLS,
    name: 'Research Tools',
    price: 200,
    description: 'Advanced tools for research institutions',
    features: [
      'Advanced data export',
      'Statistical analysis',
      'Student accounts',
      'Research protocols',
      'Publication tools'
    ]
  },
  [ModuleType.ENERGY_SUITE]: {
    id: ModuleType.ENERGY_SUITE,
    name: 'Energy Optimization Suite',
    price: 250,
    description: 'Complete energy management tools',
    features: [
      'Battery optimization',
      'Demand response',
      'Weather adaptive lighting',
      'Grid integration',
      'Carbon tracking'
    ]
  },
  [ModuleType.CONSULTANT_TOOLS]: {
    id: ModuleType.CONSULTANT_TOOLS,
    name: 'Consultant Package',
    price: 200,
    description: 'Tools for lighting consultants',
    features: [
      'White-label branding',
      'Client portal',
      'Multi-project management',
      'Proposal generation',
      'Client reporting'
    ]
  }
};

// Industry bundles
export interface Bundle {
  id: string;
  name: string;
  baseTier: string;
  includedAddOns: ModuleType[];
  price: number;
  savings: number;
}

export const BUNDLES: Record<string, Bundle> = {
  cannabis: {
    id: 'cannabis',
    name: 'Cannabis Cultivation Package',
    baseTier: 'professional',
    includedAddOns: [
      ModuleType.COMPLIANCE,
      ModuleType.ADVANCED_ML
    ],
    price: 599,
    savings: 150
  },
  vertical_farming: {
    id: 'vertical_farming',
    name: 'Vertical Farming Package',
    baseTier: 'business',
    includedAddOns: [
      ModuleType.ENERGY_SUITE,
      ModuleType.MULTI_SITE
    ],
    price: 999,
    savings: 250
  },
  consultant: {
    id: 'consultant',
    name: 'Consultant Package',
    baseTier: 'professional',
    includedAddOns: [
      ModuleType.CONSULTANT_TOOLS,
      ModuleType.WHITE_LABEL
    ],
    price: 449,
    savings: 100
  }
};

// User subscription class for permission checking
export class UserSubscription {
  private tier: SubscriptionTier;
  private addOns: Set<ModuleType>;
  private bundle?: Bundle;
  private usage: Map<string, number>;

  constructor(
    tierId: string,
    addOns: ModuleType[] = [],
    bundleId?: string
  ) {
    // Default to free tier if tierId is invalid or undefined
    this.tier = SUBSCRIPTION_TIERS[tierId] || SUBSCRIPTION_TIERS.free;
    if (!SUBSCRIPTION_TIERS[tierId]) {
      console.warn(`Invalid subscription tier ID: ${tierId}, defaulting to free`);
    }
    
    this.addOns = new Set(addOns);
    this.bundle = bundleId ? BUNDLES[bundleId] : undefined;
    this.usage = new Map();
    
    // Add bundle modules if applicable
    if (this.bundle) {
      this.bundle.includedAddOns.forEach(module => this.addOns.add(module));
    }
  }

  // Check if user has access to a module
  hasModule(module: ModuleType): boolean {
    // Safety check for undefined tier
    if (!this.tier || !this.tier.includedModules) {
      console.warn('User subscription tier is undefined, defaulting to no access');
      return this.addOns.has(module);
    }
    return this.tier.includedModules.includes(module) || this.addOns.has(module);
  }

  // Check if user has access to a specific feature
  hasFeature(module: ModuleType, feature: string): boolean {
    if (!this.hasModule(module)) return false;
    
    // Additional feature-level checks can be implemented here
    return true;
  }

  // Check usage limits
  checkLimit(limitType: keyof SubscriptionTier['limits']): boolean {
    // Safety check for undefined tier
    if (!this.tier || !this.tier.limits) {
      console.warn('User subscription tier is undefined in checkLimit');
      return false;
    }
    
    const limit = this.tier.limits[limitType];
    if (limit === -1) return true; // unlimited
    
    const currentUsage = this.usage.get(limitType) || 0;
    return currentUsage < limit;
  }

  // Increment usage
  incrementUsage(limitType: string, amount: number = 1): void {
    const current = this.usage.get(limitType) || 0;
    this.usage.set(limitType, current + amount);
  }

  // Get available features for UI display
  getAvailableFeatures(): {
    modules: ModuleType[];
    limits: SubscriptionTier['limits'];
    addOns: ModuleType[];
  } {
    // Safety check for undefined tier
    if (!this.tier) {
      console.warn('User subscription tier is undefined in getAvailableFeatures');
      return {
        modules: [],
        limits: {
          monthlyQueries: 0,
          savedDesigns: 0,
          teamMembers: 0,
          apiCalls: 0,
          exportFormats: 0,
          customReports: 0
        },
        addOns: Array.from(this.addOns)
      };
    }
    
    return {
      modules: this.tier.includedModules || [],
      limits: this.tier.limits || {},
      addOns: Array.from(this.addOns)
    };
  }

  // Check if user can upgrade to add-on
  canAddModule(moduleType: ModuleType): boolean {
    const module = ADD_ON_MODULES[moduleType];
    if (!module) return false;
    
    if (module.requiresTier) {
      // Safety check for undefined tier
      if (!this.tier || !this.tier.id) {
        console.warn('User subscription tier is undefined in canAddModule');
        return false;
      }
      
      // Check if user's tier meets minimum requirement
      const tierHierarchy = ['starter', 'professional', 'business', 'enterprise'];
      const userTierIndex = tierHierarchy.indexOf(this.tier.id);
      const requiredTierIndex = tierHierarchy.indexOf(module.requiresTier);
      
      return userTierIndex >= requiredTierIndex;
    }
    
    return true;
  }

  // Calculate total monthly cost
  getTotalCost(): number {
    let total = this.bundle?.price || this.tier?.price || 0;
    
    if (!this.bundle) {
      // Add individual add-on costs
      this.addOns.forEach(moduleType => {
        const module = ADD_ON_MODULES[moduleType];
        if (module) total += module.price;
      });
    }
    
    return total;
  }
}

// Helper function to check feature access in components
export function checkFeatureAccess(
  userSubscription: UserSubscription,
  requiredModule: ModuleType,
  feature?: string
): { hasAccess: boolean; reason?: string; upgradeOptions?: string[] } {
  if (!userSubscription.hasModule(requiredModule)) {
    const module = ADD_ON_MODULES[requiredModule];
    const canAdd = userSubscription.canAddModule(requiredModule);
    
    return {
      hasAccess: false,
      reason: canAdd 
        ? `This feature requires the ${module?.name} add-on ($${module?.price}/month)`
        : `This feature requires upgrading to ${module?.requiresTier} tier or above`,
      upgradeOptions: canAdd ? ['add-on', 'upgrade'] : ['upgrade']
    };
  }
  
  if (feature && !userSubscription.hasFeature(requiredModule, feature)) {
    return {
      hasAccess: false,
      reason: 'This specific feature is not included in your plan'
    };
  }
  
  return { hasAccess: true };
}

// Route-level middleware helper
export function requiresModule(module: ModuleType) {
  return (userSubscription: UserSubscription) => {
    return checkFeatureAccess(userSubscription, module);
  };
}

// Component wrapper helper
export function createFeatureGate(module: ModuleType, feature?: string) {
  return (userSubscription: UserSubscription, children: React.ReactNode) => {
    const access = checkFeatureAccess(userSubscription, module, feature);
    return access.hasAccess ? children : null;
  };
}