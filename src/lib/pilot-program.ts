// Pilot Program Management for Energy Savings Verification
// Manages the structured rollout of guaranteed savings programs

import { BaselineMetrics } from './revenue-sharing-baseline';
import { energyMonitoring, EnergySavingsVerification } from './energy-monitoring';

export interface PilotFacility {
  id: string;
  facilityName: string;
  location: string;
  size: number; // sq ft
  cropType: string;
  enrollmentDate: Date;
  status: 'pending' | 'baseline' | 'monitoring' | 'verification' | 'graduated';
  phase: 'pilot' | 'limited' | 'full';
  riskProfile: {
    score: number; // 0-100
    factors: {
      facilityAge: number;
      equipmentCondition: number;
      operatorExperience: number;
      dataQuality: number;
      financialStability: number;
    };
  };
  guaranteeTerms?: {
    type: 'shared_savings' | 'guaranteed_savings' | 'performance_contract';
    targetSavings: number; // percentage
    guaranteedSavings?: number; // percentage (less than target)
    revenueShare: number; // VibeLux share percentage
    duration: number; // months
    insuranceCoverage?: boolean;
  };
  performanceMetrics: {
    baseline?: BaselineMetrics;
    currentSavings?: number;
    confidenceLevel?: number;
    lastVerified?: Date;
  };
}

export interface PilotProgramPhase {
  name: 'pilot' | 'limited' | 'full';
  startDate: Date;
  duration: number; // months
  maxFacilities: number;
  requirements: {
    minDataHistory: number; // days
    minConfidence: number; // percentage
    maxGuarantee: number; // percentage savings
    insuranceRequired: boolean;
  };
  riskMitigation: {
    reserveFund: number; // percentage of potential liability
    insurancePolicy?: string;
    performanceBond?: number;
  };
}

export class PilotProgramManager {
  private phases: PilotProgramPhase[] = [
    {
      name: 'pilot',
      startDate: new Date(),
      duration: 6,
      maxFacilities: 5,
      requirements: {
        minDataHistory: 30,
        minConfidence: 80,
        maxGuarantee: 0, // No guarantees in pilot phase
        insuranceRequired: false
      },
      riskMitigation: {
        reserveFund: 0,
        insurancePolicy: undefined,
        performanceBond: undefined
      }
    },
    {
      name: 'limited',
      startDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months later
      duration: 6,
      maxFacilities: 20,
      requirements: {
        minDataHistory: 90,
        minConfidence: 85,
        maxGuarantee: 15, // Conservative 15% guarantee
        insuranceRequired: true
      },
      riskMitigation: {
        reserveFund: 0.2, // 20% of potential liability
        insurancePolicy: 'performance_guarantee_insurance',
        performanceBond: 50000
      }
    },
    {
      name: 'full',
      startDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000), // 12 months later
      duration: -1, // Ongoing
      maxFacilities: -1, // Unlimited
      requirements: {
        minDataHistory: 180,
        minConfidence: 90,
        maxGuarantee: 30, // Full 30% guarantee possible
        insuranceRequired: true
      },
      riskMitigation: {
        reserveFund: 0.15, // 15% of potential liability
        insurancePolicy: 'comprehensive_performance_insurance',
        performanceBond: 100000
      }
    }
  ];

  // Enroll a facility in the pilot program
  async enrollFacility(
    facilityData: {
      facilityName: string;
      location: string;
      size: number;
      cropType: string;
      existingData?: any;
    }
  ): Promise<PilotFacility> {
    // Assess risk profile
    const riskProfile = await this.assessRiskProfile(facilityData);
    
    // Determine appropriate phase
    const currentPhase = this.getCurrentPhase();
    
    // Check if phase has capacity
    const enrolledFacilities = await this.getEnrolledFacilities(currentPhase.name);
    if (currentPhase.maxFacilities !== -1 && enrolledFacilities.length >= currentPhase.maxFacilities) {
      throw new Error(`${currentPhase.name} phase is at capacity`);
    }

    // Create pilot facility record
    const facility: PilotFacility = {
      id: `pilot_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      facilityName: facilityData.facilityName,
      location: facilityData.location,
      size: facilityData.size,
      cropType: facilityData.cropType,
      enrollmentDate: new Date(),
      status: 'pending',
      phase: currentPhase.name,
      riskProfile,
      performanceMetrics: {}
    };

    // Set guarantee terms based on phase and risk
    facility.guaranteeTerms = this.calculateGuaranteeTerms(currentPhase, riskProfile);

    // Store facility (in production, save to database)
    await this.saveFacility(facility);

    return facility;
  }

  // Calculate appropriate guarantee terms based on phase and risk
  private calculateGuaranteeTerms(
    phase: PilotProgramPhase,
    riskProfile: any
  ): PilotFacility['guaranteeTerms'] {
    const riskFactor = riskProfile.score / 100; // 0-1 scale

    if (phase.name === 'pilot') {
      // Pilot phase: Shared savings only, no guarantees
      return {
        type: 'shared_savings',
        targetSavings: 20, // Target 20% savings
        revenueShare: 50, // 50/50 split
        duration: 36, // 3 years
        insuranceCoverage: false
      };
    } else if (phase.name === 'limited') {
      // Limited phase: Conservative guarantees
      const maxGuarantee = phase.requirements.maxGuarantee;
      const adjustedGuarantee = maxGuarantee * riskFactor;
      
      return {
        type: 'guaranteed_savings',
        targetSavings: 20,
        guaranteedSavings: Math.max(10, adjustedGuarantee), // Min 10% guarantee
        revenueShare: 40, // VibeLux gets 40% of savings above guarantee
        duration: 36,
        insuranceCoverage: true
      };
    } else {
      // Full phase: Full guarantees available
      const maxGuarantee = phase.requirements.maxGuarantee;
      const adjustedGuarantee = maxGuarantee * riskFactor;
      
      return {
        type: 'performance_contract',
        targetSavings: 30,
        guaranteedSavings: Math.max(15, adjustedGuarantee), // Min 15% guarantee
        revenueShare: 35, // VibeLux gets 35% of savings above guarantee
        duration: 60, // 5 years for larger contracts
        insuranceCoverage: true
      };
    }
  }

  // Assess risk profile of a facility
  private async assessRiskProfile(facilityData: any): Promise<PilotFacility['riskProfile']> {
    const factors = {
      facilityAge: this.scoreFacilityAge(facilityData.age || 5),
      equipmentCondition: this.scoreEquipmentCondition(facilityData.equipment || 'good'),
      operatorExperience: this.scoreOperatorExperience(facilityData.experience || 3),
      dataQuality: await this.scoreDataQuality(facilityData.existingData),
      financialStability: this.scoreFinancialStability(facilityData.creditScore || 650)
    };

    // Calculate weighted average
    const weights = {
      facilityAge: 0.15,
      equipmentCondition: 0.25,
      operatorExperience: 0.20,
      dataQuality: 0.25,
      financialStability: 0.15
    };

    const score = Object.entries(factors).reduce((sum, [key, value]) => {
      return sum + (value * weights[key as keyof typeof weights]);
    }, 0);

    return { score: Math.round(score), factors };
  }

  // Progress a facility through pilot stages
  async progressFacility(facilityId: string): Promise<PilotFacility> {
    const facility = await this.getFacility(facilityId);
    
    switch (facility.status) {
      case 'pending':
        // Move to baseline establishment
        facility.status = 'baseline';
        facility.performanceMetrics.baseline = await this.establishBaseline(facility);
        break;
        
      case 'baseline':
        // Move to active monitoring
        facility.status = 'monitoring';
        break;
        
      case 'monitoring':
        // Verify savings and potentially graduate
        const verification = await this.verifySavings(facility);
        facility.status = 'verification';
        facility.performanceMetrics.currentSavings = verification.savings.percentageReduction;
        facility.performanceMetrics.confidenceLevel = verification.savings.confidence;
        facility.performanceMetrics.lastVerified = new Date();
        
        // Check if ready to graduate
        if (this.canGraduate(facility)) {
          facility.status = 'graduated';
        }
        break;
    }

    await this.saveFacility(facility);
    return facility;
  }

  // Generate pilot program report
  async generatePilotReport(): Promise<{
    summary: any;
    facilities: PilotFacility[];
    recommendations: string[];
    riskAssessment: any;
  }> {
    const allFacilities = await this.getAllPilotFacilities();
    const currentPhase = this.getCurrentPhase();

    // Calculate aggregate performance
    const performingFacilities = allFacilities.filter(f => 
      f.performanceMetrics.currentSavings && f.performanceMetrics.currentSavings > 0
    );

    const avgSavings = performingFacilities.length > 0
      ? performingFacilities.reduce((sum, f) => sum + (f.performanceMetrics.currentSavings || 0), 0) / performingFacilities.length
      : 0;

    const avgConfidence = performingFacilities.length > 0
      ? performingFacilities.reduce((sum, f) => sum + (f.performanceMetrics.confidenceLevel || 0), 0) / performingFacilities.length
      : 0;

    // Risk assessment
    const totalPotentialLiability = this.calculateTotalLiability(allFacilities);
    const reserveFundRequired = totalPotentialLiability * currentPhase.riskMitigation.reserveFund;

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      allFacilities,
      avgSavings,
      avgConfidence,
      currentPhase
    );

    return {
      summary: {
        currentPhase: currentPhase.name,
        totalFacilities: allFacilities.length,
        activeFacilities: allFacilities.filter(f => f.status === 'monitoring').length,
        graduatedFacilities: allFacilities.filter(f => f.status === 'graduated').length,
        averageSavings: avgSavings,
        averageConfidence: avgConfidence,
        successRate: performingFacilities.length / allFacilities.length * 100
      },
      facilities: allFacilities,
      recommendations,
      riskAssessment: {
        totalPotentialLiability,
        reserveFundRequired,
        currentReserveFund: 0, // Would come from financial system
        insuranceCoverage: currentPhase.riskMitigation.insurancePolicy,
        riskLevel: this.assessOverallRisk(avgSavings, avgConfidence, allFacilities.length)
      }
    };
  }

  // Helper methods
  private getCurrentPhase(): PilotProgramPhase {
    const now = new Date();
    
    for (let i = this.phases.length - 1; i >= 0; i--) {
      if (now >= this.phases[i].startDate) {
        return this.phases[i];
      }
    }
    
    return this.phases[0]; // Default to pilot phase
  }

  private async establishBaseline(facility: PilotFacility): Promise<BaselineMetrics> {
    // In production, would collect actual baseline data
    // For now, return mock baseline
    return {} as BaselineMetrics;
  }

  private async verifySavings(facility: PilotFacility): Promise<EnergySavingsVerification> {
    // Use energy monitoring system to verify savings
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days
    
    return await energyMonitoring.calculateVerifiedSavings(
      facility.id,
      startDate,
      endDate
    );
  }

  private canGraduate(facility: PilotFacility): boolean {
    const phase = this.getCurrentPhase();
    
    return !!(
      facility.performanceMetrics.confidenceLevel &&
      facility.performanceMetrics.confidenceLevel >= phase.requirements.minConfidence &&
      facility.performanceMetrics.currentSavings &&
      facility.performanceMetrics.currentSavings >= (facility.guaranteeTerms?.targetSavings || 0) * 0.8 // 80% of target
    );
  }

  private calculateTotalLiability(facilities: PilotFacility[]): number {
    return facilities.reduce((sum, facility) => {
      if (facility.guaranteeTerms?.guaranteedSavings) {
        // Estimate annual energy cost and potential liability
        const annualEnergyCost = facility.size * 0.5 * 12; // $0.50/sqft/month estimate
        const guaranteedAmount = annualEnergyCost * (facility.guaranteeTerms.guaranteedSavings / 100);
        return sum + guaranteedAmount;
      }
      return sum;
    }, 0);
  }

  private generateRecommendations(
    facilities: PilotFacility[],
    avgSavings: number,
    avgConfidence: number,
    currentPhase: PilotProgramPhase
  ): string[] {
    const recommendations = [];

    // Performance-based recommendations
    if (avgSavings > 25 && avgConfidence > 90) {
      recommendations.push('Consider accelerating progression to next phase - performance exceeds expectations');
    } else if (avgSavings < 15 || avgConfidence < 80) {
      recommendations.push('Focus on improving measurement accuracy and optimization algorithms before expanding');
    }

    // Capacity recommendations
    const capacityUsed = facilities.length / (currentPhase.maxFacilities || 100);
    if (capacityUsed > 0.8) {
      recommendations.push('Prepare for next phase expansion - current phase nearing capacity');
    }

    // Risk recommendations
    const highRiskFacilities = facilities.filter(f => f.riskProfile.score < 70);
    if (highRiskFacilities.length > facilities.length * 0.3) {
      recommendations.push('Improve facility screening criteria - too many high-risk enrollments');
    }

    // Technology recommendations
    if (avgConfidence < 85) {
      recommendations.push('Enhance IoT sensor deployment for better data quality');
      recommendations.push('Implement additional verification methods to increase confidence');
    }

    return recommendations;
  }

  private assessOverallRisk(avgSavings: number, avgConfidence: number, facilityCount: number): string {
    const riskScore = (avgSavings * 0.4) + (avgConfidence * 0.4) + (Math.min(facilityCount / 20, 1) * 20);
    
    if (riskScore > 80) return 'low';
    if (riskScore > 60) return 'moderate';
    return 'high';
  }

  // Scoring methods for risk assessment
  private scoreFacilityAge(age: number): number {
    if (age < 2) return 90;
    if (age < 5) return 80;
    if (age < 10) return 70;
    return 60;
  }

  private scoreEquipmentCondition(condition: string): number {
    const scores: Record<string, number> = {
      'excellent': 95,
      'good': 85,
      'fair': 70,
      'poor': 50
    };
    return scores[condition] || 70;
  }

  private scoreOperatorExperience(years: number): number {
    return Math.min(50 + (years * 10), 100);
  }

  private async scoreDataQuality(existingData: any): Promise<number> {
    if (!existingData) return 50;
    
    // Check data completeness, consistency, etc.
    let score = 60;
    if (existingData.hasEnergyMeters) score += 20;
    if (existingData.hasEnvironmentalSensors) score += 10;
    if (existingData.dataHistory > 90) score += 10;
    
    return Math.min(score, 100);
  }

  private scoreFinancialStability(creditScore: number): number {
    return Math.min(Math.max((creditScore - 500) / 3.5, 0), 100);
  }

  // Storage methods (mock implementation)
  private async saveFacility(facility: PilotFacility): Promise<void> {
    if (typeof window !== 'undefined') {
      const facilities = JSON.parse(localStorage.getItem('vibelux_pilot_facilities') || '{}');
      facilities[facility.id] = facility;
      localStorage.setItem('vibelux_pilot_facilities', JSON.stringify(facilities));
    }
  }

  private async getFacility(facilityId: string): Promise<PilotFacility> {
    if (typeof window !== 'undefined') {
      const facilities = JSON.parse(localStorage.getItem('vibelux_pilot_facilities') || '{}');
      return facilities[facilityId];
    }
    throw new Error('Facility not found');
  }

  private async getEnrolledFacilities(phase: string): Promise<PilotFacility[]> {
    if (typeof window !== 'undefined') {
      const facilities = JSON.parse(localStorage.getItem('vibelux_pilot_facilities') || '{}');
      return Object.values(facilities).filter((f: any) => f.phase === phase);
    }
    return [];
  }

  private async getAllPilotFacilities(): Promise<PilotFacility[]> {
    if (typeof window !== 'undefined') {
      const facilities = JSON.parse(localStorage.getItem('vibelux_pilot_facilities') || '{}');
      return Object.values(facilities);
    }
    return [];
  }
}

// Export singleton instance
export const pilotProgram = new PilotProgramManager();