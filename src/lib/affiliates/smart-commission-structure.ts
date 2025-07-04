/**
 * Smart Commission Structure
 * Implements declining commission rates with performance bonuses
 */

export interface SmartCommissionTier {
  id: string;
  name: string;
  icon: string;
  color: string;
  requirements: string;
  subscriptionCustomers: CommissionSchedule;
  revenueSharingCustomers: CommissionSchedule;
  bonuses: CommissionBonuses;
}

export interface CommissionSchedule {
  months1to6: number;    // First 6 months rate
  months7to18: number;   // Months 7-18 rate  
  months19to36: number;  // Months 19-36 rate
  months37plus: number;  // 37+ months rate
}

export interface CommissionBonuses {
  signupBonus: number;        // Immediate bonus on signup
  qualityBonus: number;       // Bonus if customer stays 12+ months
  volumeBonus: number;        // Bonus for 10+ referrals per year
  growthBonus: number;        // Extra % if customer revenue grows 20%+
}

export interface CommissionCalculation {
  baseCommission: number;
  bonuses: {
    signup?: number;
    quality?: number;
    volume?: number;
    growth?: number;
  };
  totalCommission: number;
  currentRate: number;
  nextRateChange?: {
    date: Date;
    newRate: number;
  };
}

export const SMART_COMMISSION_TIERS: SmartCommissionTier[] = [
  {
    id: 'bronze',
    name: 'Bronze Partner',
    icon: 'Award',
    color: 'text-orange-400',
    requirements: '1-10 active referrals',
    subscriptionCustomers: {
      months1to6: 25,      // 25% for first 6 months
      months7to18: 15,     // 15% for months 7-18
      months19to36: 8,     // 8% for months 19-36
      months37plus: 3      // 3% maintenance rate
    },
    revenueSharingCustomers: {
      months1to6: 20,      // 20% for first 6 months
      months7to18: 12,     // 12% for months 7-18
      months19to36: 6,     // 6% for months 19-36
      months37plus: 2      // 2% maintenance rate
    },
    bonuses: {
      signupBonus: 50,     // $50 subscription signup
      qualityBonus: 100,   // $100 if customer stays 12+ months
      volumeBonus: 500,    // $500 for 10+ referrals/year
      growthBonus: 3       // +3% if customer grows 20%+
    }
  },
  {
    id: 'silver',
    name: 'Silver Partner',
    icon: 'Award',
    color: 'text-gray-300',
    requirements: '11-50 active referrals',
    subscriptionCustomers: {
      months1to6: 30,      // 30% for first 6 months
      months7to18: 20,     // 20% for months 7-18
      months19to36: 12,    // 12% for months 19-36
      months37plus: 5      // 5% maintenance rate
    },
    revenueSharingCustomers: {
      months1to6: 25,      // 25% for first 6 months
      months7to18: 15,     // 15% for months 7-18
      months19to36: 8,     // 8% for months 19-36
      months37plus: 4      // 4% maintenance rate
    },
    bonuses: {
      signupBonus: 100,    // $100 subscription signup
      qualityBonus: 200,   // $200 if customer stays 12+ months
      volumeBonus: 1000,   // $1000 for 25+ referrals/year
      growthBonus: 5       // +5% if customer grows 20%+
    }
  },
  {
    id: 'gold',
    name: 'Gold Partner',
    icon: 'Crown',
    color: 'text-yellow-400',
    requirements: '51+ active referrals',
    subscriptionCustomers: {
      months1to6: 35,      // 35% for first 6 months
      months7to18: 25,     // 25% for months 7-18
      months19to36: 15,    // 15% for months 19-36
      months37plus: 8      // 8% maintenance rate
    },
    revenueSharingCustomers: {
      months1to6: 30,      // 30% for first 6 months
      months7to18: 20,     // 20% for months 7-18
      months19to36: 12,    // 12% for months 19-36
      months37plus: 6      // 6% maintenance rate
    },
    bonuses: {
      signupBonus: 200,    // $200 subscription signup
      qualityBonus: 500,   // $500 if customer stays 12+ months
      volumeBonus: 2000,   // $2000 for 50+ referrals/year
      growthBonus: 8       // +8% if customer grows 20%+
    }
  }
];

export class SmartCommissionCalculator {
  
  /**
   * Calculate commission for a specific period
   */
  static calculateMonthlyCommission(
    tier: SmartCommissionTier,
    customerData: {
      paymentModel: 'subscription' | 'revenue-sharing';
      monthlyRevenue: number;
      signupDate: Date;
      hasGrown?: boolean; // 20%+ growth
    }
  ): CommissionCalculation {
    
    const monthsActive = this.getMonthsActive(customerData.signupDate);
    const schedule = customerData.paymentModel === 'subscription' 
      ? tier.subscriptionCustomers 
      : tier.revenueSharingCustomers;
    
    // Determine current commission rate
    const currentRate = this.getCurrentRate(schedule, monthsActive);
    
    // Calculate base commission
    let baseCommission = customerData.monthlyRevenue * (currentRate / 100);
    
    // Apply growth bonus if applicable
    if (customerData.hasGrown) {
      baseCommission += customerData.monthlyRevenue * (tier.bonuses.growthBonus / 100);
    }
    
    // Calculate one-time bonuses (for display purposes)
    const bonuses: CommissionCalculation['bonuses'] = {};
    
    // Signup bonus (first month only)
    if (monthsActive === 1) {
      const signupMultiplier = customerData.paymentModel === 'revenue-sharing' ? 4 : 1;
      bonuses.signup = tier.bonuses.signupBonus * signupMultiplier;
    }
    
    // Quality bonus (at 12 months)
    if (monthsActive === 12) {
      const qualityMultiplier = customerData.paymentModel === 'revenue-sharing' ? 3 : 1;
      bonuses.quality = tier.bonuses.qualityBonus * qualityMultiplier;
    }
    
    const totalBonuses = Object.values(bonuses).reduce((sum, bonus) => sum + (bonus || 0), 0);
    
    return {
      baseCommission: Math.round(baseCommission * 100) / 100,
      bonuses,
      totalCommission: Math.round((baseCommission + totalBonuses) * 100) / 100,
      currentRate,
      nextRateChange: this.getNextRateChange(schedule, monthsActive, customerData.signupDate)
    };
  }
  
  /**
   * Calculate total lifetime value of a referral
   */
  static calculateLifetimeValue(
    tier: SmartCommissionTier,
    customerData: {
      paymentModel: 'subscription' | 'revenue-sharing';
      monthlyRevenue: number;
      projectedLifetimeMonths?: number;
    }
  ): {
    totalCommissions: number;
    totalBonuses: number;
    grandTotal: number;
    breakdown: Array<{
      period: string;
      months: number;
      rate: number;
      totalCommission: number;
    }>;
  } {
    
    const lifetimeMonths = customerData.projectedLifetimeMonths || 60; // 5 years default
    const schedule = customerData.paymentModel === 'subscription' 
      ? tier.subscriptionCustomers 
      : tier.revenueSharingCustomers;
    
    const breakdown = [
      {
        period: 'Months 1-6',
        months: Math.min(6, lifetimeMonths),
        rate: schedule.months1to6,
        totalCommission: 0
      },
      {
        period: 'Months 7-18',
        months: Math.min(12, Math.max(0, lifetimeMonths - 6)),
        rate: schedule.months7to18,
        totalCommission: 0
      },
      {
        period: 'Months 19-36',
        months: Math.min(18, Math.max(0, lifetimeMonths - 18)),
        rate: schedule.months19to36,
        totalCommission: 0
      },
      {
        period: 'Months 37+',
        months: Math.max(0, lifetimeMonths - 36),
        rate: schedule.months37plus,
        totalCommission: 0
      }
    ];
    
    // Calculate commissions for each period
    breakdown.forEach(period => {
      period.totalCommission = period.months * customerData.monthlyRevenue * (period.rate / 100);
    });
    
    const totalCommissions = breakdown.reduce((sum, period) => sum + period.totalCommission, 0);
    
    // Calculate bonuses
    const signupMultiplier = customerData.paymentModel === 'revenue-sharing' ? 4 : 1;
    const qualityMultiplier = customerData.paymentModel === 'revenue-sharing' ? 3 : 1;
    
    const totalBonuses = 
      (tier.bonuses.signupBonus * signupMultiplier) +
      (lifetimeMonths >= 12 ? tier.bonuses.qualityBonus * qualityMultiplier : 0);
    
    return {
      totalCommissions: Math.round(totalCommissions * 100) / 100,
      totalBonuses: Math.round(totalBonuses * 100) / 100,
      grandTotal: Math.round((totalCommissions + totalBonuses) * 100) / 100,
      breakdown: breakdown.filter(p => p.months > 0)
    };
  }
  
  /**
   * Get affiliate's current tier based on active referrals
   */
  static getAffiliateTier(activeReferrals: number): SmartCommissionTier {
    if (activeReferrals >= 51) {
      return SMART_COMMISSION_TIERS.find(t => t.id === 'gold')!;
    } else if (activeReferrals >= 11) {
      return SMART_COMMISSION_TIERS.find(t => t.id === 'silver')!;
    } else {
      return SMART_COMMISSION_TIERS.find(t => t.id === 'bronze')!;
    }
  }
  
  /**
   * Get example earnings for marketing pages
   */
  static getMarketingExamples(): Array<{
    customerType: string;
    monthlyRevenue: number;
    year1Commission: number;
    year3Commission: number;
    lifetimeTotal: number;
    tier: string;
  }> {
    const goldTier = SMART_COMMISSION_TIERS.find(t => t.id === 'gold')!;
    
    const examples = [
      {
        customerType: 'Professional Subscription',
        monthlyRevenue: 49,
        paymentModel: 'subscription' as const,
        tier: 'Gold'
      },
      {
        customerType: 'Enterprise Subscription', 
        monthlyRevenue: 149,
        paymentModel: 'subscription' as const,
        tier: 'Gold'
      },
      {
        customerType: 'Small Revenue Sharing',
        monthlyRevenue: 500,
        paymentModel: 'revenue-sharing' as const,
        tier: 'Gold'
      },
      {
        customerType: 'Large Revenue Sharing',
        monthlyRevenue: 2000,
        paymentModel: 'revenue-sharing' as const,
        tier: 'Gold'
      }
    ];
    
    return examples.map(example => {
      const lifetime = this.calculateLifetimeValue(goldTier, example);
      const year1Commission = example.monthlyRevenue * 6 * (goldTier[`${example.paymentModel.replace('-', '')}Customers` as keyof SmartCommissionTier].months1to6 / 100) +
                             example.monthlyRevenue * 6 * (goldTier[`${example.paymentModel.replace('-', '')}Customers` as keyof SmartCommissionTier].months7to18 / 100);
      const year3Commission = example.monthlyRevenue * 12 * (goldTier[`${example.paymentModel.replace('-', '')}Customers` as keyof SmartCommissionTier].months19to36 / 100);
      
      return {
        customerType: example.customerType,
        monthlyRevenue: example.monthlyRevenue,
        year1Commission: Math.round(year1Commission * 100) / 100,
        year3Commission: Math.round(year3Commission * 100) / 100,
        lifetimeTotal: lifetime.grandTotal,
        tier: example.tier
      };
    });
  }
  
  // Private helper methods
  
  private static getMonthsActive(signupDate: Date): number {
    const now = new Date();
    const monthsDiff = (now.getFullYear() - signupDate.getFullYear()) * 12 + 
                       (now.getMonth() - signupDate.getMonth());
    return Math.max(1, monthsDiff + 1);
  }
  
  private static getCurrentRate(schedule: CommissionSchedule, monthsActive: number): number {
    if (monthsActive <= 6) return schedule.months1to6;
    if (monthsActive <= 18) return schedule.months7to18;
    if (monthsActive <= 36) return schedule.months19to36;
    return schedule.months37plus;
  }
  
  private static getNextRateChange(
    schedule: CommissionSchedule, 
    monthsActive: number, 
    signupDate: Date
  ): { date: Date; newRate: number } | undefined {
    
    let nextChangeMonth: number | null = null;
    let newRate: number;
    
    if (monthsActive <= 6) {
      nextChangeMonth = 7;
      newRate = schedule.months7to18;
    } else if (monthsActive <= 18) {
      nextChangeMonth = 19;
      newRate = schedule.months19to36;
    } else if (monthsActive <= 36) {
      nextChangeMonth = 37;
      newRate = schedule.months37plus;
    }
    
    if (nextChangeMonth) {
      const changeDate = new Date(signupDate);
      changeDate.setMonth(changeDate.getMonth() + nextChangeMonth - 1);
      
      return {
        date: changeDate,
        newRate
      };
    }
    
    return undefined;
  }
}

// Helper function to get commission rate for a tier and customer type
export function getSmartCommissionRate(
  tierId: string, 
  customerType: 'subscription' | 'revenueSharing',
  monthsActive: number
): number {
  const tier = SMART_COMMISSION_TIERS.find(t => t.id === tierId);
  if (!tier) return 0;
  
  const schedule = customerType === 'subscription' 
    ? tier.subscriptionCustomers 
    : tier.revenueSharingCustomers;
  
  if (monthsActive <= 6) return schedule.months1to6;
  if (monthsActive <= 18) return schedule.months7to18;
  if (monthsActive <= 36) return schedule.months19to36;
  return schedule.months37plus;
}

export default SmartCommissionCalculator;