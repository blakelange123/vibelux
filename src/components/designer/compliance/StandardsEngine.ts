/**
 * Professional Lighting Standards Compliance Engine
 * Supports major international lighting standards and codes
 */

export interface ComplianceStandard {
  id: string;
  name: string;
  version: string;
  jurisdiction: 'US' | 'EU' | 'International' | 'Canada' | 'Australia';
  category: 'general' | 'emergency' | 'energy' | 'outdoor' | 'sports' | 'workplace';
  requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  id: string;
  parameter: string;
  description: string;
  minValue?: number;
  maxValue?: number;
  targetValue?: number;
  unit: string;
  tolerance?: number;
  conditions?: string[];
  critical: boolean; // Must pass for compliance
}

export interface ComplianceResult {
  standardId: string;
  overallStatus: 'pass' | 'fail' | 'warning' | 'not-applicable';
  requirements: RequirementResult[];
  score: number; // 0-100
  summary: string;
  recommendations: string[];
  certificationLevel?: string;
}

export interface RequirementResult {
  requirementId: string;
  status: 'pass' | 'fail' | 'warning' | 'not-applicable';
  measuredValue: number | string;
  targetValue: number | string;
  deviation: number;
  message: string;
}

export interface ProjectData {
  type: string;
  area: number; // square feet/meters
  ceilingHeight: number;
  workingPlaneHeight: number;
  occupancyType: string;
  fixtures: FixtureData[];
  calculations: CalculationResults;
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

export interface FixtureData {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  wattage: number;
  lumens: number;
  iesData?: any;
  emergencyCapable?: boolean;
  dimmable?: boolean;
}

export interface CalculationResults {
  averageIlluminance: number;
  minIlluminance: number;
  maxIlluminance: number;
  uniformityRatio: number;
  diversityRatio: number;
  cylindricalIlluminance?: number;
  luminanceRatio?: number;
  glareRating?: number;
  energyDensity: number;
  annualEnergyUse?: number;
}

export class StandardsEngine {
  private standards: Map<string, ComplianceStandard> = new Map();
  
  constructor() {
    this.initializeStandards();
  }
  
  /**
   * Initialize all supported standards
   */
  private initializeStandards() {
    // IES Standards
    this.addStandard(this.createIESRP1());
    this.addStandard(this.createIESRP7());
    this.addStandard(this.createIESRP8());
    this.addStandard(this.createIESRP28());
    
    // ASHRAE Standards
    this.addStandard(this.createASHRAE901());
    
    // European Standards
    this.addStandard(this.createEN12464_1());
    this.addStandard(this.createEN1838());
    
    // Emergency Lighting
    this.addStandard(this.createNFPA101());
    
    // Energy Codes
    this.addStandard(this.createTitleIII());
    this.addStandard(this.createIECC());
  }
  
  private addStandard(standard: ComplianceStandard) {
    this.standards.set(standard.id, standard);
  }
  
  /**
   * IES RP-1: Office Lighting
   */
  private createIESRP1(): ComplianceStandard {
    return {
      id: 'ies-rp1',
      name: 'IES RP-1 Office Lighting',
      version: '2012',
      jurisdiction: 'US',
      category: 'workplace',
      requirements: [
        {
          id: 'avg-illuminance',
          parameter: 'Average Illuminance',
          description: 'Maintained horizontal illuminance on work plane',
          minValue: 30,
          targetValue: 50,
          maxValue: 100,
          unit: 'fc',
          critical: true
        },
        {
          id: 'uniformity-ratio',
          parameter: 'Uniformity Ratio',
          description: 'Ratio of minimum to average illuminance',
          minValue: 0.6,
          unit: 'ratio',
          critical: true
        },
        {
          id: 'max-uniformity',
          parameter: 'Maximum Uniformity',
          description: 'Ratio of maximum to minimum illuminance',
          maxValue: 3.0,
          unit: 'ratio',
          critical: false
        },
        {
          id: 'vertical-illuminance',
          parameter: 'Vertical Illuminance',
          description: 'Vertical illuminance for visual communication',
          minValue: 10,
          targetValue: 15,
          unit: 'fc',
          critical: false
        },
        {
          id: 'cylindrical-illuminance',
          parameter: 'Cylindrical Illuminance',
          description: 'Cylindrical illuminance for facial recognition',
          minValue: 5,
          targetValue: 10,
          unit: 'fc',
          critical: false
        },
        {
          id: 'glare-rating',
          parameter: 'Visual Comfort Probability',
          description: 'Probability of visual comfort (VCP)',
          minValue: 70,
          unit: '%',
          critical: false
        }
      ]
    };
  }
  
  /**
   * IES RP-7: Industrial Lighting
   */
  private createIESRP7(): ComplianceStandard {
    return {
      id: 'ies-rp7',
      name: 'IES RP-7 Industrial Lighting',
      version: '2015',
      jurisdiction: 'US',
      category: 'workplace',
      requirements: [
        {
          id: 'avg-illuminance',
          parameter: 'Average Illuminance',
          description: 'Maintained horizontal illuminance',
          minValue: 20,
          targetValue: 50,
          maxValue: 200,
          unit: 'fc',
          conditions: ['Varies by task complexity'],
          critical: true
        },
        {
          id: 'uniformity-ratio',
          parameter: 'Uniformity Ratio',
          description: 'Minimum to average illuminance ratio',
          minValue: 0.4,
          unit: 'ratio',
          critical: true
        },
        {
          id: 'safety-lighting',
          parameter: 'Safety/Security Lighting',
          description: 'Minimum illuminance for safety',
          minValue: 1.0,
          unit: 'fc',
          critical: true
        }
      ]
    };
  }
  
  /**
   * ASHRAE 90.1 Energy Standard
   */
  private createASHRAE901(): ComplianceStandard {
    return {
      id: 'ashrae-901',
      name: 'ASHRAE 90.1 Energy Standard',
      version: '2019',
      jurisdiction: 'US',
      category: 'energy',
      requirements: [
        {
          id: 'lpd-office',
          parameter: 'Lighting Power Density - Office',
          description: 'Maximum allowed lighting power density',
          maxValue: 0.9,
          unit: 'W/sq ft',
          critical: true
        },
        {
          id: 'lpd-warehouse',
          parameter: 'Lighting Power Density - Warehouse',
          description: 'Maximum allowed lighting power density',
          maxValue: 0.8,
          unit: 'W/sq ft',
          critical: true
        },
        {
          id: 'lpd-retail',
          parameter: 'Lighting Power Density - Retail',
          description: 'Maximum allowed lighting power density',
          maxValue: 1.4,
          unit: 'W/sq ft',
          critical: true
        },
        {
          id: 'automatic-shutoff',
          parameter: 'Automatic Shutoff Controls',
          description: 'Required automatic shutoff capability',
          targetValue: 1,
          unit: 'boolean',
          critical: true
        },
        {
          id: 'occupancy-sensors',
          parameter: 'Occupancy Sensors',
          description: 'Required in specific spaces',
          targetValue: 1,
          unit: 'boolean',
          conditions: ['Private offices', 'Conference rooms', 'Storage areas'],
          critical: true
        }
      ]
    };
  }
  
  /**
   * EN 12464-1 European Workplace Lighting
   */
  private createEN12464_1(): ComplianceStandard {
    return {
      id: 'en-12464-1',
      name: 'EN 12464-1 Workplace Lighting',
      version: '2021',
      jurisdiction: 'EU',
      category: 'workplace',
      requirements: [
        {
          id: 'maintained-illuminance',
          parameter: 'Maintained Illuminance',
          description: 'Average maintained illuminance',
          minValue: 500,
          unit: 'lux',
          critical: true
        },
        {
          id: 'uniformity',
          parameter: 'Uniformity',
          description: 'Uniformity of illuminance',
          minValue: 0.6,
          unit: 'ratio',
          critical: true
        },
        {
          id: 'ugr-limit',
          parameter: 'Unified Glare Rating',
          description: 'Maximum UGR for visual comfort',
          maxValue: 19,
          unit: 'UGR',
          critical: true
        },
        {
          id: 'color-rendering',
          parameter: 'Color Rendering Index',
          description: 'Minimum color rendering index',
          minValue: 80,
          unit: 'Ra',
          critical: false
        },
        {
          id: 'color-temperature',
          parameter: 'Correlated Color Temperature',
          description: 'Recommended color temperature range',
          minValue: 3000,
          maxValue: 6500,
          unit: 'K',
          critical: false
        }
      ]
    };
  }
  
  /**
   * EN 1838 Emergency Lighting
   */
  private createEN1838(): ComplianceStandard {
    return {
      id: 'en-1838',
      name: 'EN 1838 Emergency Lighting',
      version: '2019',
      jurisdiction: 'EU',
      category: 'emergency',
      requirements: [
        {
          id: 'escape-route-min',
          parameter: 'Escape Route Minimum',
          description: 'Minimum illuminance on escape routes',
          minValue: 1.0,
          unit: 'lux',
          critical: true
        },
        {
          id: 'escape-route-uniformity',
          parameter: 'Escape Route Uniformity',
          description: 'Maximum to minimum ratio on escape routes',
          maxValue: 40,
          unit: 'ratio',
          critical: true
        },
        {
          id: 'center-line-min',
          parameter: 'Center Line Minimum',
          description: 'Minimum illuminance on center line',
          minValue: 1.0,
          unit: 'lux',
          critical: true
        },
        {
          id: 'center-line-uniformity',
          parameter: 'Center Line Uniformity',
          description: 'Maximum to minimum ratio on center line',
          maxValue: 40,
          unit: 'ratio',
          critical: true
        },
        {
          id: 'duration',
          parameter: 'Duration',
          description: 'Minimum operating duration',
          minValue: 60,
          targetValue: 180,
          unit: 'minutes',
          critical: true
        }
      ]
    };
  }
  
  /**
   * NFPA 101 Life Safety Code
   */
  private createNFPA101(): ComplianceStandard {
    return {
      id: 'nfpa-101',
      name: 'NFPA 101 Life Safety Code',
      version: '2021',
      jurisdiction: 'US',
      category: 'emergency',
      requirements: [
        {
          id: 'egress-illumination',
          parameter: 'Egress Illumination',
          description: 'Minimum illumination on egress paths',
          minValue: 1.0,
          unit: 'fc',
          critical: true
        },
        {
          id: 'exit-sign-illumination',
          parameter: 'Exit Sign Illumination',
          description: 'Illumination on exit signs',
          minValue: 5.0,
          unit: 'fc',
          critical: true
        },
        {
          id: 'uniformity-ratio',
          parameter: 'Uniformity Ratio',
          description: 'Maximum to minimum illumination ratio',
          maxValue: 10,
          unit: 'ratio',
          critical: true
        },
        {
          id: 'duration-battery',
          parameter: 'Battery Duration',
          description: 'Minimum battery backup duration',
          minValue: 90,
          unit: 'minutes',
          critical: true
        }
      ]
    };
  }
  
  /**
   * IES RP-28 Parking Lighting
   */
  private createIESRP28(): ComplianceStandard {
    return {
      id: 'ies-rp28',
      name: 'IES RP-28 Parking Lighting',
      version: '2012',
      jurisdiction: 'US',
      category: 'outdoor',
      requirements: [
        {
          id: 'avg-horizontal',
          parameter: 'Average Horizontal Illuminance',
          description: 'Maintained average horizontal illuminance',
          minValue: 2.0,
          unit: 'fc',
          critical: true
        },
        {
          id: 'min-horizontal',
          parameter: 'Minimum Horizontal Illuminance',
          description: 'Maintained minimum horizontal illuminance',
          minValue: 0.5,
          unit: 'fc',
          critical: true
        },
        {
          id: 'uniformity-ratio',
          parameter: 'Uniformity Ratio',
          description: 'Average to minimum illuminance ratio',
          maxValue: 4.0,
          unit: 'ratio',
          critical: true
        },
        {
          id: 'vertical-illuminance',
          parameter: 'Vertical Illuminance',
          description: 'Minimum vertical illuminance for security',
          minValue: 0.5,
          unit: 'fc',
          critical: false
        }
      ]
    };
  }
  
  /**
   * Additional standards creation methods...
   */
  private createIESRP8(): ComplianceStandard {
    // IES RP-8 Roadway Lighting - implementation similar to above
    return {
      id: 'ies-rp8',
      name: 'IES RP-8 Roadway Lighting',
      version: '2014',
      jurisdiction: 'US',
      category: 'outdoor',
      requirements: []
    };
  }
  
  private createTitleIII(): ComplianceStandard {
    // California Title III Energy Efficiency Standards
    return {
      id: 'title-iii',
      name: 'California Title III',
      version: '2022',
      jurisdiction: 'US',
      category: 'energy',
      requirements: []
    };
  }
  
  private createIECC(): ComplianceStandard {
    // International Energy Conservation Code
    return {
      id: 'iecc',
      name: 'International Energy Conservation Code',
      version: '2021',
      jurisdiction: 'International',
      category: 'energy',
      requirements: []
    };
  }
  
  /**
   * Evaluate project compliance against a standard
   */
  public evaluateCompliance(standardId: string, projectData: ProjectData): ComplianceResult {
    const standard = this.standards.get(standardId);
    if (!standard) {
      throw new Error(`Standard ${standardId} not found`);
    }
    
    const requirementResults: RequirementResult[] = [];
    let totalScore = 0;
    let criticalFailures = 0;
    
    for (const requirement of standard.requirements) {
      const result = this.evaluateRequirement(requirement, projectData);
      requirementResults.push(result);
      
      if (result.status === 'pass') {
        totalScore += requirement.critical ? 20 : 10;
      } else if (result.status === 'fail' && requirement.critical) {
        criticalFailures++;
      }
    }
    
    const maxScore = standard.requirements.reduce((sum, req) => sum + (req.critical ? 20 : 10), 0);
    const score = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    
    let overallStatus: 'pass' | 'fail' | 'warning' | 'not-applicable';
    if (criticalFailures > 0) {
      overallStatus = 'fail';
    } else if (score >= 90) {
      overallStatus = 'pass';
    } else if (score >= 70) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'fail';
    }
    
    const summary = this.generateSummary(standard, overallStatus, score, criticalFailures);
    const recommendations = this.generateRecommendations(requirementResults);
    
    return {
      standardId: standard.id,
      overallStatus,
      requirements: requirementResults,
      score: Math.round(score),
      summary,
      recommendations
    };
  }
  
  /**
   * Evaluate individual requirement
   */
  private evaluateRequirement(requirement: ComplianceRequirement, projectData: ProjectData): RequirementResult {
    let measuredValue: number | string;
    let status: 'pass' | 'fail' | 'warning' | 'not-applicable' = 'not-applicable';
    let deviation = 0;
    let message = '';
    
    // Map requirement parameters to project data
    switch (requirement.parameter) {
      case 'Average Illuminance':
      case 'Maintained Illuminance':
        measuredValue = projectData.calculations.averageIlluminance;
        if (requirement.unit === 'lux') {
          measuredValue *= 10.764; // Convert fc to lux
        }
        break;
        
      case 'Uniformity Ratio':
        measuredValue = projectData.calculations.uniformityRatio;
        break;
        
      case 'Maximum Uniformity':
        measuredValue = projectData.calculations.diversityRatio || 1;
        break;
        
      case 'Lighting Power Density - Office':
      case 'Lighting Power Density - Warehouse':
      case 'Lighting Power Density - Retail':
        measuredValue = projectData.calculations.energyDensity;
        break;
        
      case 'Unified Glare Rating':
        measuredValue = projectData.calculations.glareRating || 0;
        break;
        
      default:
        measuredValue = 'N/A';
        status = 'not-applicable';
        message = 'Parameter not measured in current analysis';
        break;
    }
    
    if (typeof measuredValue === 'number') {
      // Evaluate against requirements
      if (requirement.minValue !== undefined && measuredValue < requirement.minValue) {
        status = 'fail';
        deviation = ((requirement.minValue - measuredValue) / requirement.minValue) * 100;
        message = `Below minimum requirement of ${requirement.minValue} ${requirement.unit}`;
      } else if (requirement.maxValue !== undefined && measuredValue > requirement.maxValue) {
        status = 'fail';
        deviation = ((measuredValue - requirement.maxValue) / requirement.maxValue) * 100;
        message = `Above maximum limit of ${requirement.maxValue} ${requirement.unit}`;
      } else if (requirement.targetValue !== undefined) {
        const targetDeviation = Math.abs(measuredValue - requirement.targetValue) / requirement.targetValue * 100;
        if (targetDeviation <= (requirement.tolerance || 10)) {
          status = 'pass';
          message = 'Meets target requirement';
        } else {
          status = 'warning';
          deviation = targetDeviation;
          message = `Deviates from target by ${targetDeviation.toFixed(1)}%`;
        }
      } else {
        status = 'pass';
        message = 'Meets requirement';
      }
    }
    
    return {
      requirementId: requirement.id,
      status,
      measuredValue,
      targetValue: requirement.targetValue || requirement.minValue || requirement.maxValue || 'N/A',
      deviation: Math.round(deviation * 100) / 100,
      message
    };
  }
  
  /**
   * Generate compliance summary
   */
  private generateSummary(standard: ComplianceStandard, status: string, score: number, criticalFailures: number): string {
    const statusText = {
      'pass': 'COMPLIANT',
      'warning': 'CONDITIONALLY COMPLIANT',
      'fail': 'NON-COMPLIANT',
      'not-applicable': 'NOT APPLICABLE'
    };
    
    let summary = `${standard.name}: ${statusText[status as keyof typeof statusText]} (Score: ${score}%)`;
    
    if (criticalFailures > 0) {
      summary += `\n${criticalFailures} critical requirement(s) failed.`;
    }
    
    return summary;
  }
  
  /**
   * Generate recommendations
   */
  private generateRecommendations(results: RequirementResult[]): string[] {
    const recommendations: string[] = [];
    
    for (const result of results) {
      if (result.status === 'fail') {
        recommendations.push(`Address ${result.requirementId}: ${result.message}`);
      } else if (result.status === 'warning') {
        recommendations.push(`Consider improving ${result.requirementId}: ${result.message}`);
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Design meets all evaluated requirements.');
    }
    
    return recommendations;
  }
  
  /**
   * Get all available standards
   */
  public getAvailableStandards(): ComplianceStandard[] {
    return Array.from(this.standards.values());
  }
  
  /**
   * Get standards by category
   */
  public getStandardsByCategory(category: string): ComplianceStandard[] {
    return Array.from(this.standards.values()).filter(standard => standard.category === category);
  }
  
  /**
   * Get standards by jurisdiction
   */
  public getStandardsByJurisdiction(jurisdiction: string): ComplianceStandard[] {
    return Array.from(this.standards.values()).filter(standard => standard.jurisdiction === jurisdiction);
  }
}