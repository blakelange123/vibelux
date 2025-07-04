// Credit Building and Milestone-Based Funding System
// Medium-term features for VibeLux matchmaking and lending

import { baselineManager, BaselineMetrics } from './revenue-sharing-baseline';

export interface CreditProfile {
  id: string;
  facilityId: string;
  creditScore: number; // VibeLux internal score 300-850
  paymentHistory: PaymentRecord[];
  performanceMetrics: PerformanceScore;
  reportingConsistency: number; // 0-100%
  verifiedData: boolean;
  createdAt: Date;
  lastUpdated: Date;
  externalReporting: {
    enabled: boolean;
    bureaus: string[]; // ['Experian Business', 'Dun & Bradstreet']
    lastReported: Date;
  };
}

export interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  dueDate: Date;
  paidDate: Date;
  status: 'on-time' | 'late' | 'missed';
  daysLate: number;
}

export interface PerformanceScore {
  yieldConsistency: number; // 0-100
  energyEfficiency: number; // 0-100
  qualityMaintenance: number; // 0-100
  complianceRecord: number; // 0-100
  overallScore: number; // 0-100
}

export interface MilestoneFunding {
  id: string;
  facilityId: string;
  totalAmount: number;
  releasedAmount: number;
  milestones: FundingMilestone[];
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  terms: {
    interestRate: number;
    repaymentType: 'revenue-share' | 'fixed' | 'hybrid';
    maxTerm: number; // months
  };
}

export interface FundingMilestone {
  id: string;
  name: string;
  description: string;
  amount: number;
  releasePercentage: number;
  criteria: MilestoneCriteria;
  status: 'pending' | 'achieved' | 'released';
  achievedAt?: Date;
  releasedAt?: Date;
}

export interface MilestoneCriteria {
  type: 'performance' | 'time' | 'revenue' | 'compliance' | 'custom';
  metric: string;
  target: number;
  operator: 'greater' | 'less' | 'equal';
  verificationRequired: boolean;
}

export interface RegionalPool {
  id: string;
  name: string;
  region: string;
  totalCapital: number;
  availableCapital: number;
  participants: PoolParticipant[];
  investments: PoolInvestment[];
  rules: {
    minInvestment: number;
    maxInvestment: number;
    votingThreshold: number; // % needed for approval
    managementFee: number;
  };
  performance: {
    avgROI: number;
    defaultRate: number;
    activeFacilities: number;
  };
}

export interface PoolParticipant {
  userId: string;
  investmentAmount: number;
  votingPower: number; // Based on investment size
  joinedAt: Date;
  earnings: number;
}

export interface PoolInvestment {
  facilityId: string;
  amount: number;
  approvalVotes: number;
  status: 'proposed' | 'approved' | 'active' | 'completed';
  proposedBy: string;
  terms: any;
}

export class CreditBuildingSystem {
  // Calculate VibeLux credit score
  calculateCreditScore(
    facilityId: string,
    paymentHistory: PaymentRecord[],
    performanceData: BaselineMetrics,
    reportingConsistency: number
  ): number {
    let score = 600; // Base score

    // Payment history (35% weight)
    const paymentScore = this.calculatePaymentScore(paymentHistory);
    score += paymentScore * 0.35 * 2.5; // Max 87.5 points

    // Performance metrics (25% weight)
    const performanceScore = this.calculatePerformanceScore(performanceData);
    score += performanceScore * 0.25 * 2.5; // Max 62.5 points

    // Credit utilization (20% weight) - How well they use available resources
    const utilizationScore = this.calculateUtilizationScore(performanceData);
    score += utilizationScore * 0.20 * 2.5; // Max 50 points

    // Length of history (10% weight)
    const historyLength = paymentHistory.length;
    const historyScore = Math.min(historyLength / 24, 1) * 100; // Max at 24 months
    score += historyScore * 0.10 * 2.5; // Max 25 points

    // Reporting consistency (10% weight)
    score += reportingConsistency * 0.10 * 2.5; // Max 25 points

    return Math.round(Math.min(850, Math.max(300, score)));
  }

  // Create milestone-based funding plan
  createMilestoneFunding(
    facilityId: string,
    requestedAmount: number,
    facilityData: any
  ): MilestoneFunding {
    const creditScore = facilityData.creditScore || 600;
    const riskLevel = this.assessRiskLevel(creditScore);
    
    // Define milestones based on risk level
    const milestones: FundingMilestone[] = [
      {
        id: 'initial',
        name: 'Initial Disbursement',
        description: 'Upfront funding upon approval',
        amount: requestedAmount * 0.25,
        releasePercentage: 25,
        criteria: {
          type: 'compliance',
          metric: 'baseline_verified',
          target: 1,
          operator: 'equal',
          verificationRequired: true
        },
        status: 'pending'
      },
      {
        id: 'performance_1',
        name: '30-Day Performance',
        description: 'First month performance targets',
        amount: requestedAmount * 0.25,
        releasePercentage: 25,
        criteria: {
          type: 'performance',
          metric: 'energy_reduction',
          target: 5, // 5% reduction
          operator: 'greater',
          verificationRequired: true
        },
        status: 'pending'
      },
      {
        id: 'performance_2',
        name: '60-Day Performance',
        description: 'Second month targets',
        amount: requestedAmount * 0.25,
        releasePercentage: 25,
        criteria: {
          type: 'performance',
          metric: 'yield_improvement',
          target: 5, // 5% improvement
          operator: 'greater',
          verificationRequired: true
        },
        status: 'pending'
      },
      {
        id: 'final',
        name: 'Final Milestone',
        description: '90-day combined metrics',
        amount: requestedAmount * 0.25,
        releasePercentage: 25,
        criteria: {
          type: 'revenue',
          metric: 'revenue_increase',
          target: 10, // 10% revenue increase
          operator: 'greater',
          verificationRequired: true
        },
        status: 'pending'
      }
    ];

    // Adjust terms based on credit score
    const interestRate = riskLevel === 'low' ? 0.08 : riskLevel === 'medium' ? 0.12 : 0.16;
    
    const funding: MilestoneFunding = {
      id: `funding_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      facilityId,
      totalAmount: requestedAmount,
      releasedAmount: 0,
      milestones,
      status: 'active',
      createdAt: new Date(),
      terms: {
        interestRate,
        repaymentType: 'revenue-share',
        maxTerm: 36 // months
      }
    };

    return funding;
  }

  // Regional pool management
  createRegionalPool(
    name: string,
    region: string,
    initialCapital: number,
    rules: any
  ): RegionalPool {
    const pool: RegionalPool = {
      id: `pool_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      name,
      region,
      totalCapital: initialCapital,
      availableCapital: initialCapital,
      participants: [],
      investments: [],
      rules: {
        minInvestment: rules.minInvestment || 1000,
        maxInvestment: rules.maxInvestment || 50000,
        votingThreshold: rules.votingThreshold || 0.51, // 51% majority
        managementFee: rules.managementFee || 0.02 // 2%
      },
      performance: {
        avgROI: 0,
        defaultRate: 0,
        activeFacilities: 0
      }
    };

    return pool;
  }

  // Equipment marketplace for secondary market
  async createEquipmentListing(
    equipmentData: EquipmentListing
  ): Promise<string> {
    const listing = {
      ...equipmentData,
      id: `equip_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      status: 'active'
    };

    // Store listing (mock)
    await this.saveListing(listing);
    
    return listing.id;
  }

  // Helper methods
  private calculatePaymentScore(history: PaymentRecord[]): number {
    if (history.length === 0) return 50; // Neutral score for no history
    
    const onTimePayments = history.filter(p => p.status === 'on-time').length;
    const latePayments = history.filter(p => p.status === 'late').length;
    const missedPayments = history.filter(p => p.status === 'missed').length;
    
    const onTimeRatio = onTimePayments / history.length;
    const latePenalty = (latePayments * 5) / history.length;
    const missedPenalty = (missedPayments * 20) / history.length;
    
    return Math.max(0, Math.min(100, (onTimeRatio * 100) - latePenalty - missedPenalty));
  }

  private calculatePerformanceScore(metrics: BaselineMetrics): number {
    // Mock calculation - in production would compare against baselines
    let score = 70; // Base performance score
    
    // Adjust based on key metrics
    if (metrics.production.yieldPerSqFt > 0.25) score += 10;
    if (metrics.energy.totalKwh < 100000) score += 10;
    if (metrics.quality.microbialFailRate < 2) score += 10;
    
    return Math.min(100, score);
  }

  private calculateUtilizationScore(metrics: BaselineMetrics): number {
    // How efficiently they use resources
    const spaceUtilization = metrics.spaceUtilization?.utilizationPercent || 70;
    const equipmentUtilization = 100 - (metrics.equipment.otherEquipment.avgDowntimeHours / 720 * 100);
    
    return (spaceUtilization + equipmentUtilization) / 2;
  }

  private assessRiskLevel(creditScore: number): 'low' | 'medium' | 'high' {
    if (creditScore >= 700) return 'low';
    if (creditScore >= 600) return 'medium';
    return 'high';
  }

  // Check if milestone is achieved
  async checkMilestoneAchievement(
    milestone: FundingMilestone,
    currentMetrics: any,
    baselineMetrics: any
  ): Promise<boolean> {
    switch (milestone.criteria.type) {
      case 'performance':
        const improvement = this.calculateImprovement(
          baselineMetrics[milestone.criteria.metric],
          currentMetrics[milestone.criteria.metric]
        );
        return this.evaluateCriteria(improvement, milestone.criteria.target, milestone.criteria.operator);
      
      case 'time':
        // Check if enough time has passed
        return true; // Simplified
      
      case 'revenue':
        const revenueIncrease = ((currentMetrics.revenue - baselineMetrics.revenue) / baselineMetrics.revenue) * 100;
        return this.evaluateCriteria(revenueIncrease, milestone.criteria.target, milestone.criteria.operator);
      
      case 'compliance':
        return currentMetrics[milestone.criteria.metric] === milestone.criteria.target;
      
      default:
        return false;
    }
  }

  private calculateImprovement(baseline: number, current: number): number {
    return ((current - baseline) / baseline) * 100;
  }

  private evaluateCriteria(value: number, target: number, operator: string): boolean {
    switch (operator) {
      case 'greater': return value > target;
      case 'less': return value < target;
      case 'equal': return value === target;
      default: return false;
    }
  }

  // Storage methods (mock)
  private async saveListing(listing: any): Promise<void> {
    if (typeof window !== 'undefined') {
      const listings = JSON.parse(localStorage.getItem('vibelux_equipment_listings') || '{}');
      listings[listing.id] = listing;
      localStorage.setItem('vibelux_equipment_listings', JSON.stringify(listings));
    }
  }

  // Report to credit bureaus
  async reportToCreditBureaus(
    creditProfile: CreditProfile,
    paymentRecords: PaymentRecord[]
  ): Promise<void> {
    // In production, this would integrate with business credit bureau APIs
    // Credit bureau reporting debug info would be logged here
    
    // Update reporting status
    creditProfile.externalReporting.lastReported = new Date();
  }
}

// Type definitions
export interface EquipmentListing {
  sellerId: string;
  equipmentType: 'lighting' | 'hvac' | 'sensors' | 'controls' | 'other';
  brand: string;
  model: string;
  age: number; // months
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  askingPrice: number;
  originalPrice: number;
  location: string;
  images: string[];
  specifications: any;
  performanceHistory?: {
    totalHours: number;
    failureCount: number;
    lastMaintenance: Date;
  };
}

// Export singleton instance
export const creditSystem = new CreditBuildingSystem();