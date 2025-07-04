// Referral Program for VibeLux Revenue Sharing
// Existing growers can refer new facilities for mutual benefits

import { prisma } from './prisma';

export interface ReferralProgram {
  id: string;
  referrerId: string;
  referrerFacilityId: string;
  referredFacilityId: string;
  status: 'pending' | 'active' | 'completed' | 'expired';
  createdAt: Date;
  activatedAt?: Date;
  benefits: {
    referrer: ReferralBenefit;
    referred: ReferralBenefit;
  };
  milestones: ReferralMilestone[];
}

export interface ReferralBenefit {
  revenueShareDiscount: number; // Percentage discount (e.g., 0.05 = 5% discount)
  bonusMonths: number; // Free months of service
  cashBonus?: number; // One-time cash bonus
  duration: number; // Months the benefit lasts
}

export interface ReferralMilestone {
  id: string;
  name: string;
  requirement: string;
  achieved: boolean;
  achievedAt?: Date;
  reward: {
    type: 'revenue_share_reduction' | 'cash' | 'service_credit';
    amount: number;
  };
}

export class ReferralProgramManager {
  // Create a new referral
  async createReferral(
    referrerId: string,
    referrerFacilityId: string,
    referredEmail: string,
    referredFacilityName: string
  ): Promise<ReferralProgram> {
    const referralCode = this.generateReferralCode(referrerId);
    
    const referral: ReferralProgram = {
      id: `ref_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      referrerId,
      referrerFacilityId,
      referredFacilityId: '', // Will be set when referred facility signs up
      status: 'pending',
      createdAt: new Date(),
      benefits: {
        referrer: {
          revenueShareDiscount: 0.02, // 2% discount on revenue share
          bonusMonths: 0,
          cashBonus: 500, // $500 when referral activates
          duration: 12 // 12 months of discount
        },
        referred: {
          revenueShareDiscount: 0.05, // 5% discount for new facility
          bonusMonths: 1, // 1 free month
          duration: 6 // 6 months of discount
        }
      },
      milestones: [
        {
          id: 'signup',
          name: 'Referral Signs Up',
          requirement: 'Referred facility creates account and verifies baseline',
          achieved: false,
          reward: {
            type: 'cash',
            amount: 500
          }
        },
        {
          id: 'first_payment',
          name: 'First Payment',
          requirement: 'Referred facility makes first revenue share payment',
          achieved: false,
          reward: {
            type: 'revenue_share_reduction',
            amount: 0.01 // Additional 1% discount
          }
        },
        {
          id: 'six_months',
          name: '6 Months Active',
          requirement: 'Referred facility remains active for 6 months',
          achieved: false,
          reward: {
            type: 'service_credit',
            amount: 1000
          }
        }
      ]
    };

    // Send referral email
    await this.sendReferralInvite(referralCode, referredEmail, referredFacilityName, referral);
    
    // Store referral (mock storage)
    await this.saveReferral(referral);
    
    return referral;
  }

  // Calculate effective revenue share with referral benefits
  calculateEffectiveRevenueShare(
    baseRate: number,
    referralBenefit?: ReferralBenefit,
    activeSince?: Date
  ): number {
    if (!referralBenefit || !activeSince) {
      return baseRate;
    }

    const monthsActive = this.getMonthsDifference(activeSince, new Date());
    
    if (monthsActive <= referralBenefit.duration) {
      return baseRate * (1 - referralBenefit.revenueShareDiscount);
    }
    
    return baseRate;
  }

  // Group buy coordination
  async createGroupBuy(
    organizerId: string,
    facilityIds: string[],
    investmentType: 'YEP' | 'GAAS' | 'HYBRID'
  ): Promise<GroupBuy> {
    const groupBuy: GroupBuy = {
      id: `group_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      organizerId,
      participantIds: facilityIds,
      status: 'forming',
      createdAt: new Date(),
      investmentType,
      benefits: {
        volumeDiscount: this.calculateVolumeDiscount(facilityIds.length),
        sharedKnowledge: true,
        groupSupport: true,
        combinedNegotiatingPower: true
      },
      requirements: {
        minParticipants: 3,
        maxParticipants: 10,
        minTotalSqFt: 50000,
        sameRegion: false,
        similarCrops: false
      }
    };

    return groupBuy;
  }

  // Success-based graduation system
  async checkGraduation(facilityId: string, currentMetrics: any): Promise<GraduationStatus> {
    const history = await this.getPerformanceHistory(facilityId);
    const improvements = this.calculateImprovements(history, currentMetrics);
    
    const graduationLevels = [
      {
        level: 'bronze',
        requirements: {
          monthsActive: 6,
          avgYieldImprovement: 10,
          avgEnergyReduction: 10,
          onTimePayments: 6
        },
        benefits: {
          revenueShareReduction: 0.01, // 1% reduction
          prioritySupport: true,
          advancedFeatures: ['ml_predictions']
        }
      },
      {
        level: 'silver',
        requirements: {
          monthsActive: 12,
          avgYieldImprovement: 15,
          avgEnergyReduction: 15,
          onTimePayments: 12
        },
        benefits: {
          revenueShareReduction: 0.02,
          prioritySupport: true,
          advancedFeatures: ['ml_predictions', 'custom_reports', 'api_access']
        }
      },
      {
        level: 'gold',
        requirements: {
          monthsActive: 24,
          avgYieldImprovement: 20,
          avgEnergyReduction: 20,
          onTimePayments: 24
        },
        benefits: {
          revenueShareReduction: 0.03,
          dedicatedSupport: true,
          advancedFeatures: ['all'],
          referralBonusMultiplier: 2
        }
      }
    ];

    const currentLevel = this.determineLevel(improvements, graduationLevels);
    
    return {
      currentLevel,
      improvements,
      nextLevel: this.getNextLevel(currentLevel, graduationLevels),
      benefits: graduationLevels.find(l => l.level === currentLevel)?.benefits
    };
  }

  // Peer guarantee system
  async createPeerGuarantee(
    guarantorId: string,
    guarantorFacilityId: string,
    beneficiaryEmail: string,
    guaranteeDetails: PeerGuaranteeDetails
  ): Promise<PeerGuarantee> {
    // Verify guarantor eligibility
    const guarantorStatus = await this.checkGraduation(guarantorFacilityId, {});
    
    if (!['silver', 'gold'].includes(guarantorStatus.currentLevel)) {
      throw new Error('Guarantor must be Silver or Gold level to provide guarantees');
    }

    const guarantee: PeerGuarantee = {
      id: `guarantee_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      guarantorId,
      guarantorFacilityId,
      beneficiaryId: '', // Set when beneficiary signs up
      status: 'pending',
      createdAt: new Date(),
      details: guaranteeDetails,
      terms: {
        maxLiability: guaranteeDetails.amount * 0.5, // Guarantor liable for 50% max
        duration: 12, // 12 months
        conditions: [
          'Beneficiary must maintain baseline reporting',
          'Guarantor has dashboard access (read-only)',
          'Monthly check-ins required',
          'Guarantee void if beneficiary violates terms'
        ]
      },
      benefits: {
        guarantor: {
          revenueShareCredit: guaranteeDetails.amount * 0.02, // 2% of guarantee as credit
          reputationPoints: 100,
          networkExpansion: true
        },
        beneficiary: {
          lowerBarrier: true,
          mentorship: true,
          fasterApproval: true,
          betterTerms: 0.02 // 2% better revenue share rate
        }
      }
    };

    return guarantee;
  }

  // Helper methods
  private generateReferralCode(referrerId: string): string {
    return `VLX-${referrerId.substr(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  }

  private async sendReferralInvite(
    code: string, 
    email: string, 
    facilityName: string,
    referral: ReferralProgram
  ): Promise<void> {
    // Email sending logic would go here
  }

  private calculateVolumeDiscount(participantCount: number): number {
    if (participantCount >= 10) return 0.05; // 5% discount
    if (participantCount >= 7) return 0.04;  // 4% discount
    if (participantCount >= 5) return 0.03;  // 3% discount
    if (participantCount >= 3) return 0.02;  // 2% discount
    return 0;
  }

  private getMonthsDifference(date1: Date, date2: Date): number {
    const months = (date2.getFullYear() - date1.getFullYear()) * 12;
    return months + date2.getMonth() - date1.getMonth();
  }

  private async getPerformanceHistory(facilityId: string): Promise<any> {
    // In production, fetch from database
    return [];
  }

  private calculateImprovements(history: any[], currentMetrics: any): any {
    // Calculate average improvements over time
    return {
      monthsActive: history.length,
      avgYieldImprovement: 15, // Mock data
      avgEnergyReduction: 20,
      onTimePayments: history.length
    };
  }

  private determineLevel(improvements: any, levels: any[]): string {
    for (let i = levels.length - 1; i >= 0; i--) {
      const level = levels[i];
      if (
        improvements.monthsActive >= level.requirements.monthsActive &&
        improvements.avgYieldImprovement >= level.requirements.avgYieldImprovement &&
        improvements.avgEnergyReduction >= level.requirements.avgEnergyReduction &&
        improvements.onTimePayments >= level.requirements.onTimePayments
      ) {
        return level.level;
      }
    }
    return 'starter';
  }

  private getNextLevel(currentLevel: string, levels: any[]): any {
    const currentIndex = levels.findIndex(l => l.level === currentLevel);
    if (currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }
    return null;
  }

  // Storage methods (mock implementation)
  private async saveReferral(referral: ReferralProgram): Promise<void> {
    if (typeof window !== 'undefined') {
      const referrals = JSON.parse(localStorage.getItem('vibelux_referrals') || '{}');
      referrals[referral.id] = referral;
      localStorage.setItem('vibelux_referrals', JSON.stringify(referrals));
    }
  }

  async getReferrals(facilityId: string): Promise<ReferralProgram[]> {
    if (typeof window !== 'undefined') {
      const referrals = JSON.parse(localStorage.getItem('vibelux_referrals') || '{}');
      return Object.values(referrals).filter((r: any) => 
        r.referrerFacilityId === facilityId || r.referredFacilityId === facilityId
      );
    }
    return [];
  }
}

// Type definitions
export interface GroupBuy {
  id: string;
  organizerId: string;
  participantIds: string[];
  status: 'forming' | 'active' | 'completed';
  createdAt: Date;
  investmentType: 'YEP' | 'GAAS' | 'HYBRID';
  benefits: {
    volumeDiscount: number;
    sharedKnowledge: boolean;
    groupSupport: boolean;
    combinedNegotiatingPower: boolean;
  };
  requirements: {
    minParticipants: number;
    maxParticipants: number;
    minTotalSqFt: number;
    sameRegion: boolean;
    similarCrops: boolean;
  };
}

export interface GraduationStatus {
  currentLevel: string;
  improvements: any;
  nextLevel: any;
  benefits: any;
}

export interface PeerGuaranteeDetails {
  amount: number;
  purpose: string;
  expectedROI: number;
}

export interface PeerGuarantee {
  id: string;
  guarantorId: string;
  guarantorFacilityId: string;
  beneficiaryId: string;
  status: 'pending' | 'active' | 'completed' | 'defaulted';
  createdAt: Date;
  details: PeerGuaranteeDetails;
  terms: {
    maxLiability: number;
    duration: number;
    conditions: string[];
  };
  benefits: {
    guarantor: any;
    beneficiary: any;
  };
}

// Export singleton instance
export const referralProgram = new ReferralProgramManager();