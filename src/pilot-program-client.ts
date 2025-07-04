// Client-safe version of pilot program management
// This file contains only types and client-side logic, no server dependencies

export interface PilotFacility {
  id: string;
  facilityName: string;
  location: string;
  size: number;
  cropType: string;
  enrollmentDate: Date;
  status: 'pending' | 'baseline' | 'monitoring' | 'verification' | 'graduated';
  phase: 'pilot' | 'limited' | 'full';
  riskProfile: {
    score: number;
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
    targetSavings: number;
    guaranteedSavings?: number;
    revenueShare: number;
    duration: number;
    insuranceCoverage?: boolean;
  };
  performanceMetrics: {
    baseline?: any;
    currentSavings?: number;
    confidenceLevel?: number;
    lastVerified?: Date;
  };
}

export interface PilotProgramPhase {
  name: 'pilot' | 'limited' | 'full';
  startDate: Date;
  duration: number;
  maxFacilities: number;
  requirements: {
    minDataHistory: number;
    minConfidence: number;
    maxGuarantee: number;
    insuranceRequired: boolean;
  };
  riskMitigation: {
    reserveFund: number;
    insurancePolicy?: string;
    performanceBond?: number;
  };
}

export interface PilotProgramReport {
  summary: {
    currentPhase: string;
    totalFacilities: number;
    activeFacilities: number;
    graduatedFacilities: number;
    averageSavings: number;
    averageConfidence: number;
    successRate: number;
  };
  facilities: PilotFacility[];
  recommendations: string[];
  riskAssessment: {
    totalPotentialLiability: number;
    reserveFundRequired: number;
    currentReserveFund: number;
    insuranceCoverage?: string;
    riskLevel: string;
  };
}

export class PilotProgramClient {
  private baseUrl = '/api/pilot-program';
  private mockPhases: PilotProgramPhase[] = [
    {
      name: 'pilot',
      startDate: new Date(),
      duration: 6,
      maxFacilities: 5,
      requirements: {
        minDataHistory: 30,
        minConfidence: 80,
        maxGuarantee: 0,
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
      startDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
      duration: 6,
      maxFacilities: 20,
      requirements: {
        minDataHistory: 90,
        minConfidence: 85,
        maxGuarantee: 15,
        insuranceRequired: true
      },
      riskMitigation: {
        reserveFund: 0.2,
        insurancePolicy: 'performance_guarantee_insurance',
        performanceBond: 50000
      }
    },
    {
      name: 'full',
      startDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
      duration: -1,
      maxFacilities: -1,
      requirements: {
        minDataHistory: 180,
        minConfidence: 90,
        maxGuarantee: 30,
        insuranceRequired: true
      },
      riskMitigation: {
        reserveFund: 0.15,
        insurancePolicy: 'comprehensive_performance_insurance',
        performanceBond: 100000
      }
    }
  ];

  async enrollFacility(facilityData: {
    facilityName: string;
    location: string;
    size: number;
    cropType: string;
    age?: number;
    equipment?: string;
    experience?: number;
    creditScore?: number;
    existingData?: any;
  }): Promise<PilotFacility> {
    // For now, create facility locally - in production this would call the API
    const riskProfile = this.calculateRiskProfile(facilityData);
    const currentPhase = this.getCurrentPhase();
    
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
      performanceMetrics: {},
      guaranteeTerms: this.calculateGuaranteeTerms(currentPhase, riskProfile)
    };

    // Save to localStorage for demo
    this.saveFacility(facility);
    
    return facility;
  }

  async progressFacility(facilityId: string): Promise<PilotFacility> {
    const facility = this.getFacility(facilityId);
    if (!facility) throw new Error('Facility not found');

    // Progress through stages
    switch (facility.status) {
      case 'pending':
        facility.status = 'baseline';
        facility.performanceMetrics.baseline = { /* mock baseline data */ };
        break;
      case 'baseline':
        facility.status = 'monitoring';
        break;
      case 'monitoring':
        facility.status = 'verification';
        facility.performanceMetrics.currentSavings = 18 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10;
        facility.performanceMetrics.confidenceLevel = 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10;
        facility.performanceMetrics.lastVerified = new Date();
        break;
      case 'verification':
        facility.status = 'graduated';
        break;
    }

    this.saveFacility(facility);
    return facility;
  }

  async generateReport(): Promise<PilotProgramReport> {
    const facilities = this.getAllFacilities();
    const currentPhase = this.getCurrentPhase();

    const performingFacilities = facilities.filter(f => 
      f.performanceMetrics.currentSavings && f.performanceMetrics.currentSavings > 0
    );

    const avgSavings = performingFacilities.length > 0
      ? performingFacilities.reduce((sum, f) => sum + (f.performanceMetrics.currentSavings || 0), 0) / performingFacilities.length
      : 0;

    const avgConfidence = performingFacilities.length > 0
      ? performingFacilities.reduce((sum, f) => sum + (f.performanceMetrics.confidenceLevel || 0), 0) / performingFacilities.length
      : 0;

    const totalLiability = this.calculateTotalLiability(facilities);
    const recommendations = this.generateRecommendations(facilities, avgSavings, avgConfidence);

    return {
      summary: {
        currentPhase: currentPhase.name,
        totalFacilities: facilities.length,
        activeFacilities: facilities.filter(f => f.status === 'monitoring').length,
        graduatedFacilities: facilities.filter(f => f.status === 'graduated').length,
        averageSavings: avgSavings,
        averageConfidence: avgConfidence,
        successRate: performingFacilities.length / Math.max(facilities.length, 1) * 100
      },
      facilities,
      recommendations,
      riskAssessment: {
        totalPotentialLiability: totalLiability,
        reserveFundRequired: totalLiability * currentPhase.riskMitigation.reserveFund,
        currentReserveFund: 0,
        insuranceCoverage: currentPhase.riskMitigation.insurancePolicy,
        riskLevel: this.assessOverallRisk(avgSavings, avgConfidence, facilities.length)
      }
    };
  }

  getAllFacilities(): PilotFacility[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('vibelux_pilot_facilities');
    if (!stored) return [];
    
    const facilities = JSON.parse(stored);
    // Convert date strings back to Date objects
    return Object.values(facilities).map((f: any) => ({
      ...f,
      enrollmentDate: new Date(f.enrollmentDate),
      performanceMetrics: {
        ...f.performanceMetrics,
        lastVerified: f.performanceMetrics.lastVerified ? new Date(f.performanceMetrics.lastVerified) : undefined
      }
    }));
  }

  getCurrentPhase(): PilotProgramPhase {
    const now = new Date();
    
    for (let i = this.mockPhases.length - 1; i >= 0; i--) {
      if (now >= this.mockPhases[i].startDate) {
        return this.mockPhases[i];
      }
    }
    
    return this.mockPhases[0];
  }

  private calculateRiskProfile(facilityData: any) {
    const factors = {
      facilityAge: this.scoreFacilityAge(facilityData.age || 5),
      equipmentCondition: this.scoreEquipmentCondition(facilityData.equipment || 'good'),
      operatorExperience: this.scoreOperatorExperience(facilityData.experience || 3),
      dataQuality: this.scoreDataQuality(facilityData.existingData),
      financialStability: this.scoreFinancialStability(facilityData.creditScore || 650)
    };

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

  private calculateGuaranteeTerms(phase: PilotProgramPhase, riskProfile: any) {
    const riskFactor = riskProfile.score / 100;

    if (phase.name === 'pilot') {
      return {
        type: 'shared_savings' as const,
        targetSavings: 20,
        revenueShare: 50,
        duration: 36,
        insuranceCoverage: false
      };
    } else if (phase.name === 'limited') {
      return {
        type: 'guaranteed_savings' as const,
        targetSavings: 20,
        guaranteedSavings: Math.max(10, phase.requirements.maxGuarantee * riskFactor),
        revenueShare: 40,
        duration: 36,
        insuranceCoverage: true
      };
    } else {
      return {
        type: 'performance_contract' as const,
        targetSavings: 30,
        guaranteedSavings: Math.max(15, phase.requirements.maxGuarantee * riskFactor),
        revenueShare: 35,
        duration: 60,
        insuranceCoverage: true
      };
    }
  }

  private calculateTotalLiability(facilities: PilotFacility[]): number {
    return facilities.reduce((sum, facility) => {
      if (facility.guaranteeTerms?.guaranteedSavings) {
        const annualEnergyCost = facility.size * 0.5 * 12;
        const guaranteedAmount = annualEnergyCost * (facility.guaranteeTerms.guaranteedSavings / 100);
        return sum + guaranteedAmount;
      }
      return sum;
    }, 0);
  }

  private generateRecommendations(facilities: PilotFacility[], avgSavings: number, avgConfidence: number): string[] {
    const recommendations = [];

    if (avgSavings > 25 && avgConfidence > 90) {
      recommendations.push('Consider accelerating progression to next phase - performance exceeds expectations');
    } else if (avgSavings < 15 || avgConfidence < 80) {
      recommendations.push('Focus on improving measurement accuracy and optimization algorithms before expanding');
    }

    const highRiskFacilities = facilities.filter(f => f.riskProfile.score < 70);
    if (highRiskFacilities.length > facilities.length * 0.3) {
      recommendations.push('Improve facility screening criteria - too many high-risk enrollments');
    }

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

  // Scoring methods
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

  private scoreDataQuality(existingData: any): number {
    if (!existingData) return 50;
    
    let score = 60;
    if (existingData.hasEnergyMeters) score += 20;
    if (existingData.hasEnvironmentalSensors) score += 10;
    if (existingData.dataHistory > 90) score += 10;
    
    return Math.min(score, 100);
  }

  private scoreFinancialStability(creditScore: number): number {
    return Math.min(Math.max((creditScore - 500) / 3.5, 0), 100);
  }

  // Storage methods
  private saveFacility(facility: PilotFacility): void {
    if (typeof window === 'undefined') return;
    
    const facilities = JSON.parse(localStorage.getItem('vibelux_pilot_facilities') || '{}');
    facilities[facility.id] = facility;
    localStorage.setItem('vibelux_pilot_facilities', JSON.stringify(facilities));
  }

  private getFacility(facilityId: string): PilotFacility | null {
    if (typeof window === 'undefined') return null;
    
    const facilities = JSON.parse(localStorage.getItem('vibelux_pilot_facilities') || '{}');
    const facility = facilities[facilityId];
    if (!facility) return null;
    
    // Convert date strings back to Date objects
    return {
      ...facility,
      enrollmentDate: new Date(facility.enrollmentDate),
      performanceMetrics: {
        ...facility.performanceMetrics,
        lastVerified: facility.performanceMetrics.lastVerified ? new Date(facility.performanceMetrics.lastVerified) : undefined
      }
    };
  }
}

// Export singleton instance
export const pilotProgramClient = new PilotProgramClient();