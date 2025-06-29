/**
 * Unified Pricing Model
 * Resolves conflicts between subscription and revenue-sharing pricing
 */

import { SAFE_SUBSCRIPTION_TIERS, SubscriptionTierSafe } from './subscription-tiers-safe';
import { REVENUE_SHARING_MODELS, RevenueSharingModel } from './revenue-sharing-pricing';

export type PaymentModel = 'subscription' | 'revenue-sharing';
export type FeatureLevel = 'free' | 'hobbyist' | 'grower' | 'professional' | 'enterprise';

export interface UnifiedCustomer {
  id: string;
  userId: string;
  paymentModel: PaymentModel;
  
  // Subscription customers
  subscriptionTier?: string;
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'trialing';
  
  // Revenue sharing customers
  revenueSharingPlan?: string;
  revenueSharingStatus?: 'active' | 'pending' | 'suspended';
  monthlyRevenueShare?: number;
  
  // Unified feature access
  effectiveFeatureLevel: FeatureLevel;
  
  // Billing info
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerFeatureAccess {
  features: string[];
  limits: {
    projects: number;
    teamMembers: number;
    fixtures: number;
    exportFormats: string[];
    supportLevel: string;
    dataRetention: number;
    monthlySOPs?: number;
  };
  tier: SubscriptionTierSafe;
}

export interface MonthlyRevenue {
  customerId: string;
  subscriptionRevenue: number;
  revenueSharingPayments: number;
  totalRevenue: number;
  month: string; // YYYY-MM format
}

/**
 * Unified Pricing Manager
 * Handles both subscription and revenue-sharing customers
 */
export class UnifiedPricingManager {
  
  /**
   * Determine effective feature level for any customer
   */
  static getEffectiveFeatureLevel(customer: UnifiedCustomer): FeatureLevel {
    if (customer.paymentModel === 'subscription') {
      // Subscription customers get their tier's features
      return (customer.subscriptionTier as FeatureLevel) || 'free';
    } else {
      // Revenue sharing customers get Professional-level features by default
      // This ensures they have access to advanced tools they need for commercial operations
      return 'professional';
    }
  }

  /**
   * Get customer's feature access and limits
   */
  static getCustomerFeatures(customer: UnifiedCustomer): CustomerFeatureAccess {
    const effectiveLevel = this.getEffectiveFeatureLevel(customer);
    const tier = SAFE_SUBSCRIPTION_TIERS.find(t => t.id === effectiveLevel);
    
    if (!tier) {
      throw new Error(`Invalid feature level: ${effectiveLevel}`);
    }

    // For revenue sharing customers, override certain limits
    if (customer.paymentModel === 'revenue-sharing') {
      return {
        features: tier.features,
        limits: {
          ...tier.limits,
          // Revenue sharing customers typically need more capacity
          projects: Math.max(tier.limits.projects, 50),
          teamMembers: Math.max(tier.limits.teamMembers, 5),
          fixtures: -1, // Unlimited fixtures for revenue sharing
          dataRetention: 365, // 1 year retention minimum
        },
        tier
      };
    }

    return {
      features: tier.features,
      limits: tier.limits,
      tier
    };
  }

  /**
   * Calculate monthly revenue for a customer
   */
  static calculateMonthlyRevenue(
    customer: UnifiedCustomer,
    revenueSharingPayments: number = 0
  ): number {
    if (customer.paymentModel === 'subscription') {
      const tier = SAFE_SUBSCRIPTION_TIERS.find(t => t.id === customer.subscriptionTier);
      return tier?.price || 0;
    } else {
      // Revenue sharing customers pay based on their actual revenue sharing
      return revenueSharingPayments;
    }
  }

  /**
   * Determine if customer should be upgraded/recommended a different plan
   */
  static getUpgradeRecommendation(
    customer: UnifiedCustomer,
    usage: {
      projects: number;
      teamMembers: number;
      monthlyRevenue: number;
    }
  ): {
    shouldUpgrade: boolean;
    recommendedTier?: string;
    reason?: string;
  } {
    if (customer.paymentModel === 'revenue-sharing') {
      // Revenue sharing customers might benefit from switching to subscription
      // if their monthly payments exceed subscription costs
      const professionalTier = SAFE_SUBSCRIPTION_TIERS.find(t => t.id === 'professional');
      if (professionalTier && usage.monthlyRevenue > professionalTier.price * 2) {
        return {
          shouldUpgrade: true,
          recommendedTier: 'subscription-professional',
          reason: 'Subscription would be more cost-effective than revenue sharing'
        };
      }
    } else {
      // Check if subscription customer is hitting limits
      const currentFeatures = this.getCustomerFeatures(customer);
      
      if (usage.projects >= currentFeatures.limits.projects) {
        const nextTier = this.getNextTier(customer.subscriptionTier!);
        if (nextTier) {
          return {
            shouldUpgrade: true,
            recommendedTier: nextTier.id,
            reason: 'Project limit reached'
          };
        }
      }

      if (usage.teamMembers >= currentFeatures.limits.teamMembers) {
        const nextTier = this.getNextTier(customer.subscriptionTier!);
        if (nextTier) {
          return {
            shouldUpgrade: true,
            recommendedTier: nextTier.id,
            reason: 'Team member limit reached'
          };
        }
      }

      // Consider revenue sharing for high-value customers
      if (customer.subscriptionTier === 'enterprise' && usage.monthlyRevenue > 10000) {
        return {
          shouldUpgrade: true,
          recommendedTier: 'revenue-sharing-hybrid',
          reason: 'Revenue sharing could provide better value for your scale'
        };
      }
    }

    return { shouldUpgrade: false };
  }

  /**
   * Get the next tier up from current tier
   */
  private static getNextTier(currentTier: string): SubscriptionTierSafe | null {
    const tierOrder = ['free', 'hobbyist', 'grower', 'professional', 'enterprise'];
    const currentIndex = tierOrder.indexOf(currentTier);
    
    if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
      return null;
    }
    
    const nextTierId = tierOrder[currentIndex + 1];
    return SAFE_SUBSCRIPTION_TIERS.find(t => t.id === nextTierId) || null;
  }

  /**
   * Convert between pricing models
   */
  static convertPricingModel(
    customer: UnifiedCustomer,
    newModel: PaymentModel,
    newTier?: string
  ): Partial<UnifiedCustomer> {
    const updates: Partial<UnifiedCustomer> = {
      paymentModel: newModel,
      updatedAt: new Date()
    };

    if (newModel === 'subscription') {
      updates.subscriptionTier = newTier || 'professional';
      updates.subscriptionStatus = 'active';
      updates.revenueSharingPlan = undefined;
      updates.revenueSharingStatus = undefined;
      updates.effectiveFeatureLevel = newTier as FeatureLevel || 'professional';
    } else {
      updates.revenueSharingPlan = newTier || 'hybrid-optimizer';
      updates.revenueSharingStatus = 'active';
      updates.subscriptionTier = undefined;
      updates.subscriptionStatus = undefined;
      updates.effectiveFeatureLevel = 'professional'; // Revenue sharing gets professional features
    }

    return updates;
  }

  /**
   * Check if customer has access to a specific feature
   */
  static hasFeatureAccess(customer: UnifiedCustomer, feature: string): boolean {
    const features = this.getCustomerFeatures(customer);
    return features.features.some(f => 
      f.toLowerCase().includes(feature.toLowerCase())
    );
  }

  /**
   * Get customer's billing summary
   */
  static getBillingSummary(
    customer: UnifiedCustomer,
    revenueData?: {
      monthlyRevenue: number;
      revenueSharingPayments: number;
    }
  ) {
    const features = this.getCustomerFeatures(customer);
    
    if (customer.paymentModel === 'subscription') {
      return {
        model: 'subscription' as const,
        monthlyAmount: features.tier.price,
        annualAmount: features.tier.priceAnnual,
        nextBillingDate: null, // Would come from Stripe
        features: features.features,
        limits: features.limits
      };
    } else {
      const revenueSharingModel = REVENUE_SHARING_MODELS.find(
        m => m.id === customer.revenueSharingPlan
      );
      
      return {
        model: 'revenue-sharing' as const,
        baseAmount: revenueSharingModel?.basePrice || 0,
        variableAmount: revenueData?.revenueSharingPayments || 0,
        totalAmount: (revenueSharingModel?.basePrice || 0) + (revenueData?.revenueSharingPayments || 0),
        savingsGenerated: revenueData?.monthlyRevenue || 0,
        features: features.features,
        limits: features.limits
      };
    }
  }
}

/**
 * Feature access decorator for API endpoints
 */
export function requiresFeature(feature: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (this: any, customer: UnifiedCustomer, ...args: any[]) {
      if (!UnifiedPricingManager.hasFeatureAccess(customer, feature)) {
        throw new Error(`Feature '${feature}' not available on current plan`);
      }
      return originalMethod.apply(this, [customer, ...args]);
    };
    
    return descriptor;
  };
}

/**
 * Usage tracking for billing and limits
 */
export interface UsageMetrics {
  customerId: string;
  month: string;
  projects: number;
  teamMembers: number;
  fixtures: number;
  exports: number;
  supportTickets: number;
  sopGenerated: number;
  dataStorageGB: number;
}

export class UsageTracker {
  static async trackUsage(customerId: string, action: string, metadata?: any): Promise<void> {
    // Implementation would track usage in database
  }

  static async getUsageMetrics(customerId: string, month: string): Promise<UsageMetrics> {
    // Implementation would fetch from database
    return {
      customerId,
      month,
      projects: 5,
      teamMembers: 2,
      fixtures: 150,
      exports: 12,
      supportTickets: 3,
      sopGenerated: 5,
      dataStorageGB: 2.5
    };
  }

  static async checkLimits(customer: UnifiedCustomer, action: string): Promise<boolean> {
    const features = UnifiedPricingManager.getCustomerFeatures(customer);
    const usage = await this.getUsageMetrics(customer.id, new Date().toISOString().slice(0, 7));
    
    switch (action) {
      case 'create_project':
        return features.limits.projects === -1 || usage.projects < features.limits.projects;
      case 'add_team_member':
        return features.limits.teamMembers === -1 || usage.teamMembers < features.limits.teamMembers;
      case 'generate_sop':
        return !features.limits.monthlySOPs || features.limits.monthlySOPs === -1 || 
               usage.sopGenerated < features.limits.monthlySOPs;
      default:
        return true;
    }
  }
}

export default UnifiedPricingManager;