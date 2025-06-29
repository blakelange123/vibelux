/**
 * Comprehensive ESG and Sustainability Metrics for CEA
 */

import { EmissionsCalculator, EmissionsReport } from './emissions-calculator';

export interface ResourceMetrics {
  energy: {
    totalKWh: number;
    renewableKWh: number;
    renewablePercent: number;
    energyIntensity: number; // kWh per kg yield
    pue: number; // Power Usage Effectiveness
  };
  water: {
    totalGallons: number;
    recycledGallons: number;
    recycledPercent: number;
    waterIntensity: number; // gallons per kg yield
    runoffCaptured: number;
  };
  waste: {
    totalKg: number;
    compostedKg: number;
    recycledKg: number;
    landfillKg: number;
    diversionRate: number;
  };
  chemicals: {
    pesticideUse: number; // kg
    fertilizerUse: number; // kg
    organicPercent: number;
  };
}

export interface SocialMetrics {
  labor: {
    totalEmployees: number;
    livingWagePercent: number;
    womenPercent: number;
    minorityPercent: number;
    trainingHours: number;
    safetyIncidents: number;
    turnoverRate: number;
  };
  community: {
    localHires: number;
    communityInvestment: number;
    educationPrograms: number;
    foodDonated: number; // kg
  };
  supply: {
    localSuppliers: number;
    certifiedSuppliers: number;
    supplierAudits: number;
  };
}

export interface GovernanceMetrics {
  certifications: string[];
  policies: string[];
  audits: {
    internal: number;
    external: number;
    findings: number;
  };
  transparency: {
    publicReporting: boolean;
    dataVerification: boolean;
    stakeholderEngagement: number;
  };
}

export interface ESGScore {
  environmental: number; // 0-100
  social: number; // 0-100
  governance: number; // 0-100
  overall: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface SustainabilityReport {
  period: {
    start: Date;
    end: Date;
  };
  emissions: EmissionsReport;
  resources: ResourceMetrics;
  social: SocialMetrics;
  governance: GovernanceMetrics;
  score: ESGScore;
  improvements: {
    metric: string;
    baseline: number;
    current: number;
    improvement: number;
    target: number;
  }[];
  certifications: {
    name: string;
    status: 'active' | 'pending' | 'expired';
    expiryDate?: Date;
  }[];
}

export class SustainabilityCalculator {
  private emissionsCalculator: EmissionsCalculator;

  constructor() {
    this.emissionsCalculator = new EmissionsCalculator();
  }

  /**
   * Calculate comprehensive ESG score
   */
  public calculateESGScore(
    emissions: EmissionsReport,
    resources: ResourceMetrics,
    social: SocialMetrics,
    governance: GovernanceMetrics
  ): ESGScore {
    // Environmental Score (40% weight)
    const envScore = this.calculateEnvironmentalScore(emissions, resources);
    
    // Social Score (30% weight)
    const socialScore = this.calculateSocialScore(social);
    
    // Governance Score (30% weight)
    const govScore = this.calculateGovernanceScore(governance);
    
    // Overall weighted score
    const overall = (envScore * 0.4) + (socialScore * 0.3) + (govScore * 0.3);
    
    // Grade assignment
    const grade = overall >= 90 ? 'A' :
                  overall >= 80 ? 'B' :
                  overall >= 70 ? 'C' :
                  overall >= 60 ? 'D' : 'F';
    
    return {
      environmental: envScore,
      social: socialScore,
      governance: govScore,
      overall,
      grade
    };
  }

  private calculateEnvironmentalScore(
    emissions: EmissionsReport,
    resources: ResourceMetrics
  ): number {
    let score = 100;
    
    // Emissions intensity (up to -30 points)
    if (emissions.emissionsIntensity > 1.0) score -= 30;
    else if (emissions.emissionsIntensity > 0.5) score -= 20;
    else if (emissions.emissionsIntensity > 0.3) score -= 10;
    
    // Renewable energy (up to -20 points)
    if (resources.energy.renewablePercent < 25) score -= 20;
    else if (resources.energy.renewablePercent < 50) score -= 10;
    else if (resources.energy.renewablePercent < 75) score -= 5;
    
    // Water recycling (up to -20 points)
    if (resources.water.recycledPercent < 25) score -= 20;
    else if (resources.water.recycledPercent < 50) score -= 10;
    else if (resources.water.recycledPercent < 75) score -= 5;
    
    // Waste diversion (up to -20 points)
    if (resources.waste.diversionRate < 50) score -= 20;
    else if (resources.waste.diversionRate < 75) score -= 10;
    else if (resources.waste.diversionRate < 90) score -= 5;
    
    // Chemical use (up to -10 points)
    if (resources.chemicals.organicPercent < 50) score -= 10;
    else if (resources.chemicals.organicPercent < 80) score -= 5;
    
    return Math.max(0, score);
  }

  private calculateSocialScore(social: SocialMetrics): number {
    let score = 100;
    
    // Fair wages (up to -25 points)
    if (social.labor.livingWagePercent < 100) {
      score -= (100 - social.labor.livingWagePercent) * 0.25;
    }
    
    // Diversity (up to -20 points)
    const diversityScore = (social.labor.womenPercent + social.labor.minorityPercent) / 2;
    if (diversityScore < 30) score -= 20;
    else if (diversityScore < 40) score -= 10;
    
    // Safety (up to -20 points)
    if (social.labor.safetyIncidents > 0) {
      score -= Math.min(20, social.labor.safetyIncidents * 5);
    }
    
    // Training (up to -15 points)
    const trainingPerEmployee = social.labor.trainingHours / social.labor.totalEmployees;
    if (trainingPerEmployee < 20) score -= 15;
    else if (trainingPerEmployee < 40) score -= 7;
    
    // Community engagement (up to -20 points)
    if (social.community.communityInvestment === 0) score -= 10;
    if (social.community.foodDonated === 0) score -= 10;
    
    return Math.max(0, score);
  }

  private calculateGovernanceScore(governance: GovernanceMetrics): number {
    let score = 100;
    
    // Certifications (up to -30 points)
    if (governance.certifications.length === 0) score -= 30;
    else if (governance.certifications.length < 3) score -= 15;
    
    // Policies (up to -20 points)
    const requiredPolicies = [
      'Environmental Policy',
      'Code of Conduct',
      'Supply Chain Policy',
      'Data Privacy Policy',
      'Anti-Corruption Policy'
    ];
    const missingPolicies = requiredPolicies.filter(
      p => !governance.policies.includes(p)
    ).length;
    score -= missingPolicies * 4;
    
    // Audits (up to -20 points)
    if (governance.audits.external === 0) score -= 20;
    else if (governance.audits.findings > 5) score -= 10;
    
    // Transparency (up to -30 points)
    if (!governance.transparency.publicReporting) score -= 15;
    if (!governance.transparency.dataVerification) score -= 15;
    
    return Math.max(0, score);
  }

  /**
   * Generate improvement recommendations
   */
  public generateRecommendations(report: SustainabilityReport): {
    category: string;
    priority: 'high' | 'medium' | 'low';
    action: string;
    impact: string;
    cost: 'low' | 'medium' | 'high';
    timeline: string;
  }[] {
    const recommendations = [];
    
    // Emissions recommendations
    if (report.emissions.emissionsIntensity > 0.5) {
      recommendations.push({
        category: 'Emissions',
        priority: 'high',
        action: 'Install LED lighting with smart controls',
        impact: '30-40% reduction in electricity use',
        cost: 'medium',
        timeline: '3-6 months'
      });
    }
    
    if (report.resources.energy.renewablePercent < 50) {
      recommendations.push({
        category: 'Energy',
        priority: 'high',
        action: 'Install rooftop solar or purchase renewable energy credits',
        impact: `Reduce Scope 2 emissions by ${100 - report.resources.energy.renewablePercent}%`,
        cost: 'high',
        timeline: '6-12 months'
      });
    }
    
    if (report.resources.water.recycledPercent < 50) {
      recommendations.push({
        category: 'Water',
        priority: 'medium',
        action: 'Implement water recirculation and treatment system',
        impact: '50-70% reduction in water use',
        cost: 'medium',
        timeline: '3-6 months'
      });
    }
    
    if (report.social.labor.trainingHours < 40) {
      recommendations.push({
        category: 'Social',
        priority: 'medium',
        action: 'Develop comprehensive training program',
        impact: 'Improve safety and productivity',
        cost: 'low',
        timeline: '1-3 months'
      });
    }
    
    return recommendations;
  }

  /**
   * Compare to industry benchmarks
   */
  public benchmarkPerformance(report: SustainabilityReport): {
    metric: string;
    value: number;
    benchmark: number;
    percentile: number;
    status: 'leader' | 'average' | 'laggard';
  }[] {
    return [
      {
        metric: 'Carbon Intensity',
        value: report.emissions.emissionsIntensity,
        benchmark: 0.5,
        percentile: report.emissions.emissionsIntensity < 0.3 ? 90 :
                    report.emissions.emissionsIntensity < 0.5 ? 70 :
                    report.emissions.emissionsIntensity < 0.8 ? 50 : 30,
        status: report.emissions.emissionsIntensity < 0.3 ? 'leader' :
                report.emissions.emissionsIntensity < 0.8 ? 'average' : 'laggard'
      },
      {
        metric: 'Energy Efficiency',
        value: report.resources.energy.energyIntensity,
        benchmark: 35,
        percentile: report.resources.energy.energyIntensity < 25 ? 90 :
                    report.resources.energy.energyIntensity < 35 ? 70 : 40,
        status: report.resources.energy.energyIntensity < 25 ? 'leader' :
                report.resources.energy.energyIntensity < 35 ? 'average' : 'laggard'
      },
      {
        metric: 'Water Efficiency',
        value: report.resources.water.waterIntensity,
        benchmark: 10,
        percentile: report.resources.water.waterIntensity < 5 ? 90 :
                    report.resources.water.waterIntensity < 10 ? 70 : 40,
        status: report.resources.water.waterIntensity < 5 ? 'leader' :
                report.resources.water.waterIntensity < 10 ? 'average' : 'laggard'
      }
    ];
  }

  /**
   * Project future emissions based on growth
   */
  public projectEmissions(
    current: EmissionsReport,
    growthRate: number,
    years: number,
    efficiencyImprovement: number = 0
  ): {
    year: number;
    emissions: number;
    reduction: number;
  }[] {
    const projections = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i <= years; i++) {
      const growth = Math.pow(1 + growthRate, i);
      const efficiency = Math.pow(1 - efficiencyImprovement, i);
      const emissions = current.totalEmissions * growth * efficiency;
      const reduction = (current.totalEmissions * growth) - emissions;
      
      projections.push({
        year: currentYear + i,
        emissions,
        reduction
      });
    }
    
    return projections;
  }
}

// Certification tracking
export const ESGCertifications = {
  'B-Corp': {
    requirements: ['Environmental Impact Assessment', 'Social Impact Assessment', 'Governance Review'],
    validityPeriod: 3, // years
    fee: 1000
  },
  'LEED': {
    requirements: ['Energy Efficiency', 'Water Conservation', 'Waste Management'],
    validityPeriod: 5,
    fee: 5000
  },
  'USDA Organic': {
    requirements: ['No Synthetic Pesticides', 'Organic Nutrients', 'Inspection'],
    validityPeriod: 1,
    fee: 1500
  },
  'Fair Trade': {
    requirements: ['Fair Wages', 'Safe Working Conditions', 'Community Development'],
    validityPeriod: 2,
    fee: 2000
  }
};