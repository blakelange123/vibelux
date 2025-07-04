/**
 * Automated ASHRAE/IECC/Title 24 Compliance Checking
 * Professional building energy code compliance verification
 */

import { IlluminanceResult, Vector3D } from './monte-carlo-raytracing';

export interface ComplianceStandard {
  id: string;
  name: string;
  version: string;
  jurisdiction: string;
  applicableSpaces: string[];
}

export interface LightingPowerDensity {
  spaceType: string;
  allowedLPD: number; // Watts per square foot or square meter
  unit: 'W/sf' | 'W/m²';
  standard: string;
}

export interface IlluminanceRequirement {
  spaceType: string;
  minIlluminance: number; // lux or footcandles
  maxIlluminance?: number;
  uniformityRatio: number;
  unit: 'lux' | 'fc';
  standard: string;
  measurementHeight: number; // meters
}

export interface EnergyCodeRequirement {
  standard: string;
  spaceType: string;
  maxLPD: number;
  minEfficacy: number; // lm/W
  controlRequirements: {
    occupancySensing: boolean;
    daylightSensing: boolean;
    multiLevel: boolean;
    timeScheduling: boolean;
  };
  zoning: {
    maxAreaPerControl: number; // square feet/meters
    requiredSeparation: boolean;
  };
}

export interface ComplianceResult {
  standard: ComplianceStandard;
  spaceType: string;
  compliant: boolean;
  violations: ComplianceViolation[];
  recommendations: string[];
  metrics: {
    actualLPD: number;
    allowedLPD: number;
    averageIlluminance: number;
    minIlluminance: number;
    maxIlluminance: number;
    uniformityRatio: number;
    energyEfficiency: number;
    controlsCompliance: boolean;
  };
}

export interface ComplianceViolation {
  type: 'LPD' | 'Illuminance' | 'Uniformity' | 'Controls' | 'Zoning' | 'Efficacy';
  severity: 'Critical' | 'Major' | 'Minor' | 'Warning';
  description: string;
  requirement: string;
  actualValue: number;
  requiredValue: number;
  unit: string;
  remediation: string[];
}

export interface LightingDesign {
  fixtures: {
    id: string;
    position: Vector3D;
    wattage: number;
    lumens: number;
    controlZone: string;
    controlType: string[];
  }[];
  spaceGeometry: {
    area: number; // square meters
    volume: number; // cubic meters
    spaceType: string;
  };
  simulationResults: IlluminanceResult[];
  controlSystems: {
    occupancySensors: boolean;
    daylightSensors: boolean;
    dimming: boolean;
    scheduling: boolean;
    zoning: string[];
  };
}

export class ComplianceChecker {
  private standards: Map<string, ComplianceStandard>;
  private lpdRequirements: Map<string, LightingPowerDensity[]>;
  private illuminanceRequirements: Map<string, IlluminanceRequirement[]>;
  private energyCodeRequirements: Map<string, EnergyCodeRequirement[]>;

  constructor() {
    this.standards = new Map();
    this.lpdRequirements = new Map();
    this.illuminanceRequirements = new Map();
    this.energyCodeRequirements = new Map();
    
    this.initializeStandards();
    this.initializeLPDRequirements();
    this.initializeIlluminanceRequirements();
    this.initializeEnergyCodeRequirements();
  }

  /**
   * Initialize compliance standards
   */
  private initializeStandards(): void {
    const standards: ComplianceStandard[] = [
      {
        id: 'ashrae-90.1-2019',
        name: 'ASHRAE 90.1',
        version: '2019',
        jurisdiction: 'United States',
        applicableSpaces: ['office', 'retail', 'warehouse', 'education', 'healthcare', 'hotel', 'restaurant', 'gymnasium']
      },
      {
        id: 'iecc-2021',
        name: 'International Energy Conservation Code',
        version: '2021',
        jurisdiction: 'United States',
        applicableSpaces: ['office', 'retail', 'warehouse', 'education', 'healthcare', 'hotel', 'restaurant']
      },
      {
        id: 'title24-2022',
        name: 'California Title 24',
        version: '2022',
        jurisdiction: 'California, USA',
        applicableSpaces: ['office', 'retail', 'warehouse', 'education', 'healthcare', 'hotel', 'restaurant']
      },
      {
        id: 'ies-rp-1-21',
        name: 'IES Recommended Practice RP-1-21',
        version: '2021',
        jurisdiction: 'North America',
        applicableSpaces: ['office', 'retail', 'warehouse', 'education', 'healthcare', 'hotel', 'restaurant']
      }
    ];

    standards.forEach(standard => {
      this.standards.set(standard.id, standard);
    });
  }

  /**
   * Initialize Lighting Power Density requirements
   */
  private initializeLPDRequirements(): void {
    // ASHRAE 90.1-2019 LPD Requirements
    const ashrae2019LPD: LightingPowerDensity[] = [
      { spaceType: 'office', allowedLPD: 0.90, unit: 'W/sf', standard: 'ashrae-90.1-2019' },
      { spaceType: 'classroom', allowedLPD: 1.10, unit: 'W/sf', standard: 'ashrae-90.1-2019' },
      { spaceType: 'conference', allowedLPD: 1.20, unit: 'W/sf', standard: 'ashrae-90.1-2019' },
      { spaceType: 'corridor', allowedLPD: 0.50, unit: 'W/sf', standard: 'ashrae-90.1-2019' },
      { spaceType: 'retail', allowedLPD: 1.40, unit: 'W/sf', standard: 'ashrae-90.1-2019' },
      { spaceType: 'warehouse', allowedLPD: 0.80, unit: 'W/sf', standard: 'ashrae-90.1-2019' },
      { spaceType: 'gymnasium', allowedLPD: 1.00, unit: 'W/sf', standard: 'ashrae-90.1-2019' },
      { spaceType: 'kitchen', allowedLPD: 1.20, unit: 'W/sf', standard: 'ashrae-90.1-2019' },
      { spaceType: 'parking', allowedLPD: 0.20, unit: 'W/sf', standard: 'ashrae-90.1-2019' }
    ];

    // Title 24-2022 LPD Requirements (more stringent)
    const title24LPD: LightingPowerDensity[] = [
      { spaceType: 'office', allowedLPD: 0.75, unit: 'W/sf', standard: 'title24-2022' },
      { spaceType: 'classroom', allowedLPD: 0.95, unit: 'W/sf', standard: 'title24-2022' },
      { spaceType: 'conference', allowedLPD: 1.05, unit: 'W/sf', standard: 'title24-2022' },
      { spaceType: 'corridor', allowedLPD: 0.41, unit: 'W/sf', standard: 'title24-2022' },
      { spaceType: 'retail', allowedLPD: 1.20, unit: 'W/sf', standard: 'title24-2022' },
      { spaceType: 'warehouse', allowedLPD: 0.65, unit: 'W/sf', standard: 'title24-2022' },
      { spaceType: 'gymnasium', allowedLPD: 0.85, unit: 'W/sf', standard: 'title24-2022' },
      { spaceType: 'kitchen', allowedLPD: 1.05, unit: 'W/sf', standard: 'title24-2022' },
      { spaceType: 'parking', allowedLPD: 0.15, unit: 'W/sf', standard: 'title24-2022' }
    ];

    this.lpdRequirements.set('ashrae-90.1-2019', ashrae2019LPD);
    this.lpdRequirements.set('iecc-2021', ashrae2019LPD); // IECC references ASHRAE 90.1
    this.lpdRequirements.set('title24-2022', title24LPD);
  }

  /**
   * Initialize illuminance requirements
   */
  private initializeIlluminanceRequirements(): void {
    // IES RP-1-21 Illuminance Requirements
    const iesRP1: IlluminanceRequirement[] = [
      { 
        spaceType: 'office', 
        minIlluminance: 500, 
        maxIlluminance: 1000,
        uniformityRatio: 0.70,
        unit: 'lux', 
        standard: 'ies-rp-1-21',
        measurementHeight: 0.76
      },
      { 
        spaceType: 'classroom', 
        minIlluminance: 500, 
        maxIlluminance: 750,
        uniformityRatio: 0.60,
        unit: 'lux', 
        standard: 'ies-rp-1-21',
        measurementHeight: 0.76
      },
      { 
        spaceType: 'conference', 
        minIlluminance: 300, 
        maxIlluminance: 500,
        uniformityRatio: 0.70,
        unit: 'lux', 
        standard: 'ies-rp-1-21',
        measurementHeight: 0.76
      },
      { 
        spaceType: 'corridor', 
        minIlluminance: 100, 
        maxIlluminance: 200,
        uniformityRatio: 0.40,
        unit: 'lux', 
        standard: 'ies-rp-1-21',
        measurementHeight: 0.0
      },
      { 
        spaceType: 'retail', 
        minIlluminance: 750, 
        maxIlluminance: 1500,
        uniformityRatio: 0.50,
        unit: 'lux', 
        standard: 'ies-rp-1-21',
        measurementHeight: 0.76
      },
      { 
        spaceType: 'warehouse', 
        minIlluminance: 200, 
        maxIlluminance: 500,
        uniformityRatio: 0.40,
        unit: 'lux', 
        standard: 'ies-rp-1-21',
        measurementHeight: 0.0
      },
      { 
        spaceType: 'gymnasium', 
        minIlluminance: 300, 
        maxIlluminance: 750,
        uniformityRatio: 0.50,
        unit: 'lux', 
        standard: 'ies-rp-1-21',
        measurementHeight: 0.0
      },
      { 
        spaceType: 'kitchen', 
        minIlluminance: 500, 
        maxIlluminance: 750,
        uniformityRatio: 0.60,
        unit: 'lux', 
        standard: 'ies-rp-1-21',
        measurementHeight: 0.85
      },
      { 
        spaceType: 'parking', 
        minIlluminance: 50, 
        maxIlluminance: 100,
        uniformityRatio: 0.20,
        unit: 'lux', 
        standard: 'ies-rp-1-21',
        measurementHeight: 0.0
      }
    ];

    this.illuminanceRequirements.set('ies-rp-1-21', iesRP1);
    this.illuminanceRequirements.set('ashrae-90.1-2019', iesRP1);
    this.illuminanceRequirements.set('iecc-2021', iesRP1);
    this.illuminanceRequirements.set('title24-2022', iesRP1);
  }

  /**
   * Initialize energy code requirements
   */
  private initializeEnergyCodeRequirements(): void {
    const ashraeControls: EnergyCodeRequirement[] = [
      {
        standard: 'ashrae-90.1-2019',
        spaceType: 'office',
        maxLPD: 0.90,
        minEfficacy: 45,
        controlRequirements: {
          occupancySensing: true,
          daylightSensing: true,
          multiLevel: true,
          timeScheduling: true
        },
        zoning: {
          maxAreaPerControl: 2500, // sq ft
          requiredSeparation: true
        }
      },
      {
        standard: 'ashrae-90.1-2019',
        spaceType: 'classroom',
        maxLPD: 1.10,
        minEfficacy: 45,
        controlRequirements: {
          occupancySensing: true,
          daylightSensing: false,
          multiLevel: true,
          timeScheduling: true
        },
        zoning: {
          maxAreaPerControl: 1000,
          requiredSeparation: true
        }
      },
      {
        standard: 'ashrae-90.1-2019',
        spaceType: 'warehouse',
        maxLPD: 0.80,
        minEfficacy: 50,
        controlRequirements: {
          occupancySensing: true,
          daylightSensing: false,
          multiLevel: false,
          timeScheduling: true
        },
        zoning: {
          maxAreaPerControl: 10000,
          requiredSeparation: false
        }
      }
    ];

    const title24Controls: EnergyCodeRequirement[] = [
      {
        standard: 'title24-2022',
        spaceType: 'office',
        maxLPD: 0.75,
        minEfficacy: 55,
        controlRequirements: {
          occupancySensing: true,
          daylightSensing: true,
          multiLevel: true,
          timeScheduling: true
        },
        zoning: {
          maxAreaPerControl: 2000,
          requiredSeparation: true
        }
      }
    ];

    this.energyCodeRequirements.set('ashrae-90.1-2019', ashraeControls);
    this.energyCodeRequirements.set('iecc-2021', ashraeControls);
    this.energyCodeRequirements.set('title24-2022', title24Controls);
  }

  /**
   * Check compliance against specified standards
   */
  public checkCompliance(
    design: LightingDesign,
    standardIds: string[]
  ): ComplianceResult[] {
    const results: ComplianceResult[] = [];

    for (const standardId of standardIds) {
      const standard = this.standards.get(standardId);
      if (!standard) {
        console.warn(`Unknown standard: ${standardId}`);
        continue;
      }

      const result = this.checkStandardCompliance(design, standard);
      results.push(result);
    }

    return results;
  }

  /**
   * Check compliance against a single standard
   */
  private checkStandardCompliance(
    design: LightingDesign,
    standard: ComplianceStandard
  ): ComplianceResult {
    const violations: ComplianceViolation[] = [];
    const recommendations: string[] = [];

    // Calculate actual metrics
    const actualLPD = this.calculateLPD(design);
    const illuminanceStats = this.calculateIlluminanceStats(design.simulationResults);
    const energyEfficiency = this.calculateEnergyEfficiency(design);

    // Get requirements for this space type and standard
    const lpdReqs = this.lpdRequirements.get(standard.id) || [];
    const illumReqs = this.illuminanceRequirements.get(standard.id) || [];
    const energyReqs = this.energyCodeRequirements.get(standard.id) || [];

    const spaceType = design.spaceGeometry.spaceType;
    const lpdReq = lpdReqs.find(req => req.spaceType === spaceType);
    const illumReq = illumReqs.find(req => req.spaceType === spaceType);
    const energyReq = energyReqs.find(req => req.spaceType === spaceType);

    // Check LPD compliance
    if (lpdReq && actualLPD > lpdReq.allowedLPD) {
      violations.push({
        type: 'LPD',
        severity: 'Critical',
        description: `Lighting Power Density exceeds ${standard.name} requirements`,
        requirement: `Maximum ${lpdReq.allowedLPD} ${lpdReq.unit} for ${spaceType}`,
        actualValue: actualLPD,
        requiredValue: lpdReq.allowedLPD,
        unit: lpdReq.unit,
        remediation: [
          'Reduce fixture wattage',
          'Use higher-efficacy fixtures',
          'Implement dimming controls',
          'Optimize fixture layout'
        ]
      });
    }

    // Check illuminance compliance
    if (illumReq) {
      if (illuminanceStats.average < illumReq.minIlluminance) {
        violations.push({
          type: 'Illuminance',
          severity: 'Major',
          description: 'Average illuminance below minimum requirements',
          requirement: `Minimum ${illumReq.minIlluminance} ${illumReq.unit}`,
          actualValue: illuminanceStats.average,
          requiredValue: illumReq.minIlluminance,
          unit: illumReq.unit,
          remediation: [
            'Add more fixtures',
            'Use higher-lumen fixtures',
            'Improve fixture placement',
            'Consider task lighting'
          ]
        });
      }

      if (illumReq.maxIlluminance && illuminanceStats.average > illumReq.maxIlluminance) {
        violations.push({
          type: 'Illuminance',
          severity: 'Minor',
          description: 'Average illuminance exceeds recommended maximum',
          requirement: `Maximum ${illumReq.maxIlluminance} ${illumReq.unit}`,
          actualValue: illuminanceStats.average,
          requiredValue: illumReq.maxIlluminance,
          unit: illumReq.unit,
          remediation: [
            'Implement dimming controls',
            'Reduce fixture count',
            'Use lower-lumen fixtures'
          ]
        });
      }

      if (illuminanceStats.uniformity < illumReq.uniformityRatio) {
        violations.push({
          type: 'Uniformity',
          severity: 'Major',
          description: 'Illuminance uniformity below requirements',
          requirement: `Minimum uniformity ratio ${illumReq.uniformityRatio}`,
          actualValue: illuminanceStats.uniformity,
          requiredValue: illumReq.uniformityRatio,
          unit: 'ratio',
          remediation: [
            'Improve fixture spacing',
            'Add intermediate fixtures',
            'Adjust mounting height',
            'Use fixtures with wider beam angles'
          ]
        });
      }
    }

    // Check energy code requirements
    if (energyReq) {
      if (energyEfficiency < energyReq.minEfficacy) {
        violations.push({
          type: 'Efficacy',
          severity: 'Major',
          description: 'Fixture efficacy below code requirements',
          requirement: `Minimum ${energyReq.minEfficacy} lm/W`,
          actualValue: energyEfficiency,
          requiredValue: energyReq.minEfficacy,
          unit: 'lm/W',
          remediation: [
            'Upgrade to LED fixtures',
            'Select higher-efficacy fixtures',
            'Remove inefficient fixtures'
          ]
        });
      }

      // Check control requirements
      const controlsCompliant = this.checkControlsCompliance(design, energyReq);
      if (!controlsCompliant.compliant) {
        violations.push(...controlsCompliant.violations);
      }
    }

    // Generate recommendations
    if (violations.length === 0) {
      recommendations.push('Design meets all applicable code requirements');
    } else {
      if (violations.some(v => v.type === 'LPD')) {
        recommendations.push('Consider LED retrofit to reduce power consumption');
      }
      if (violations.some(v => v.type === 'Illuminance')) {
        recommendations.push('Review task requirements and fixture selection');
      }
      if (violations.some(v => v.type === 'Controls')) {
        recommendations.push('Implement required lighting controls for code compliance');
      }
    }

    return {
      standard,
      spaceType,
      compliant: violations.length === 0,
      violations,
      recommendations,
      metrics: {
        actualLPD,
        allowedLPD: lpdReq?.allowedLPD || 0,
        averageIlluminance: illuminanceStats.average,
        minIlluminance: illuminanceStats.min,
        maxIlluminance: illuminanceStats.max,
        uniformityRatio: illuminanceStats.uniformity,
        energyEfficiency,
        controlsCompliance: energyReq ? this.checkControlsCompliance(design, energyReq).compliant : true
      }
    };
  }

  /**
   * Calculate Lighting Power Density
   */
  private calculateLPD(design: LightingDesign): number {
    const totalWatts = design.fixtures.reduce((sum, fixture) => sum + fixture.wattage, 0);
    const areaInSqFt = design.spaceGeometry.area * 10.764; // Convert m² to sq ft
    return totalWatts / areaInSqFt;
  }

  /**
   * Calculate illuminance statistics
   */
  private calculateIlluminanceStats(results: IlluminanceResult[]): {
    average: number;
    min: number;
    max: number;
    uniformity: number;
  } {
    if (results.length === 0) {
      return { average: 0, min: 0, max: 0, uniformity: 0 };
    }

    const illuminanceValues = results.map(r => r.illuminance);
    const min = Math.min(...illuminanceValues);
    const max = Math.max(...illuminanceValues);
    const average = illuminanceValues.reduce((sum, val) => sum + val, 0) / illuminanceValues.length;
    const uniformity = max > 0 ? min / max : 0;

    return { average, min, max, uniformity };
  }

  /**
   * Calculate energy efficiency
   */
  private calculateEnergyEfficiency(design: LightingDesign): number {
    const totalWatts = design.fixtures.reduce((sum, fixture) => sum + fixture.wattage, 0);
    const totalLumens = design.fixtures.reduce((sum, fixture) => sum + fixture.lumens, 0);
    return totalWatts > 0 ? totalLumens / totalWatts : 0;
  }

  /**
   * Check lighting controls compliance
   */
  private checkControlsCompliance(
    design: LightingDesign,
    requirements: EnergyCodeRequirement
  ): { compliant: boolean; violations: ComplianceViolation[] } {
    const violations: ComplianceViolation[] = [];

    // Check occupancy sensing
    if (requirements.controlRequirements.occupancySensing && !design.controlSystems.occupancySensors) {
      violations.push({
        type: 'Controls',
        severity: 'Critical',
        description: 'Occupancy sensors required but not present',
        requirement: 'Automatic occupancy sensing controls',
        actualValue: 0,
        requiredValue: 1,
        unit: 'required',
        remediation: [
          'Install occupancy sensors',
          'Connect sensors to lighting controls',
          'Configure appropriate time delays'
        ]
      });
    }

    // Check daylight sensing
    if (requirements.controlRequirements.daylightSensing && !design.controlSystems.daylightSensors) {
      violations.push({
        type: 'Controls',
        severity: 'Major',
        description: 'Daylight sensors required but not present',
        requirement: 'Automatic daylight sensing controls',
        actualValue: 0,
        requiredValue: 1,
        unit: 'required',
        remediation: [
          'Install daylight sensors',
          'Implement photosensor controls',
          'Configure dimming response'
        ]
      });
    }

    // Check multi-level switching
    if (requirements.controlRequirements.multiLevel && !design.controlSystems.dimming) {
      violations.push({
        type: 'Controls',
        severity: 'Major',
        description: 'Multi-level switching required but not present',
        requirement: 'Multi-level or continuous dimming controls',
        actualValue: 0,
        requiredValue: 1,
        unit: 'required',
        remediation: [
          'Install dimming controls',
          'Implement multi-level switching',
          'Configure appropriate control zones'
        ]
      });
    }

    // Check time scheduling
    if (requirements.controlRequirements.timeScheduling && !design.controlSystems.scheduling) {
      violations.push({
        type: 'Controls',
        severity: 'Major',
        description: 'Automatic time scheduling required but not present',
        requirement: 'Automatic scheduling controls',
        actualValue: 0,
        requiredValue: 1,
        unit: 'required',
        remediation: [
          'Install scheduling controls',
          'Program automatic schedules',
          'Implement override controls'
        ]
      });
    }

    // Check control zoning
    const controlZones = design.controlSystems.zoning.length;
    const areaPerZone = design.spaceGeometry.area * 10.764 / controlZones; // sq ft per zone
    
    if (areaPerZone > requirements.zoning.maxAreaPerControl) {
      violations.push({
        type: 'Zoning',
        severity: 'Major',
        description: 'Control zones exceed maximum area requirements',
        requirement: `Maximum ${requirements.zoning.maxAreaPerControl} sq ft per control zone`,
        actualValue: areaPerZone,
        requiredValue: requirements.zoning.maxAreaPerControl,
        unit: 'sq ft',
        remediation: [
          'Add additional control zones',
          'Subdivide large areas',
          'Install independent controls'
        ]
      });
    }

    return {
      compliant: violations.length === 0,
      violations
    };
  }

  /**
   * Generate compliance report
   */
  public generateComplianceReport(results: ComplianceResult[]): {
    summary: {
      totalStandards: number;
      compliantStandards: number;
      totalViolations: number;
      criticalViolations: number;
    };
    recommendations: string[];
    priorityActions: string[];
  } {
    const totalStandards = results.length;
    const compliantStandards = results.filter(r => r.compliant).length;
    const allViolations = results.flatMap(r => r.violations);
    const totalViolations = allViolations.length;
    const criticalViolations = allViolations.filter(v => v.severity === 'Critical').length;

    // Collect unique recommendations
    const recommendations = Array.from(new Set(results.flatMap(r => r.recommendations)));

    // Generate priority actions based on violations
    const priorityActions: string[] = [];
    
    if (allViolations.some(v => v.type === 'LPD' && v.severity === 'Critical')) {
      priorityActions.push('URGENT: Reduce lighting power density to meet energy code requirements');
    }
    
    if (allViolations.some(v => v.type === 'Controls' && v.severity === 'Critical')) {
      priorityActions.push('REQUIRED: Install mandatory lighting controls for code compliance');
    }
    
    if (allViolations.some(v => v.type === 'Illuminance' && v.severity === 'Major')) {
      priorityActions.push('IMPORTANT: Address illuminance deficiencies for safety and productivity');
    }

    if (priorityActions.length === 0 && compliantStandards === totalStandards) {
      priorityActions.push('Design meets all applicable code requirements - ready for permit submission');
    }

    return {
      summary: {
        totalStandards,
        compliantStandards,
        totalViolations,
        criticalViolations
      },
      recommendations,
      priorityActions
    };
  }

  /**
   * Get applicable standards for a space type and jurisdiction
   */
  public getApplicableStandards(spaceType: string, jurisdiction?: string): ComplianceStandard[] {
    const applicable: ComplianceStandard[] = [];

    this.standards.forEach(standard => {
      if (standard.applicableSpaces.includes(spaceType)) {
        if (!jurisdiction || standard.jurisdiction.toLowerCase().includes(jurisdiction.toLowerCase())) {
          applicable.push(standard);
        }
      }
    });

    return applicable;
  }

  /**
   * Suggest design improvements for compliance
   */
  public suggestImprovements(results: ComplianceResult[]): {
    quickFixes: string[];
    majorChanges: string[];
    costImpact: 'Low' | 'Medium' | 'High';
  } {
    const allViolations = results.flatMap(r => r.violations);
    const quickFixes: string[] = [];
    const majorChanges: string[] = [];
    let costImpact: 'Low' | 'Medium' | 'High' = 'Low';

    // Analyze violations for improvement suggestions
    const lpdViolations = allViolations.filter(v => v.type === 'LPD');
    const illuminanceViolations = allViolations.filter(v => v.type === 'Illuminance');
    const controlViolations = allViolations.filter(v => v.type === 'Controls');

    if (controlViolations.length > 0) {
      quickFixes.push('Install occupancy sensors and time scheduling controls');
      quickFixes.push('Implement automatic dimming controls');
      costImpact = 'Medium';
    }

    if (lpdViolations.length > 0) {
      const avgExcess = lpdViolations.reduce((sum, v) => sum + (v.actualValue - v.requiredValue), 0) / lpdViolations.length;
      
      if (avgExcess > 0.3) {
        majorChanges.push('Replace fixtures with high-efficacy LED alternatives');
        costImpact = 'High';
      } else {
        quickFixes.push('Implement dimming to reduce effective power consumption');
      }
    }

    if (illuminanceViolations.length > 0) {
      const underLit = illuminanceViolations.filter(v => v.actualValue < v.requiredValue);
      const overLit = illuminanceViolations.filter(v => v.actualValue > v.requiredValue);

      if (underLit.length > 0) {
        majorChanges.push('Add fixtures or increase lumen output to meet minimum illuminance');
        costImpact = 'High';
      }

      if (overLit.length > 0) {
        quickFixes.push('Install dimming controls to reduce over-illumination');
      }
    }

    return {
      quickFixes,
      majorChanges,
      costImpact
    };
  }
}