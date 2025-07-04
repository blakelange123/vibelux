/**
 * Light Requirement Calculator based on Advanced Dutch Research principles
 * Calculates light needs based on plant development stage and fruit load
 */

export interface LightRequirementResult {
  dailyLightRequirement: number; // J/cm²/day
  hourlyPAR: number; // μmol/m²/s
  supplementalLightNeeded: number; // hours
  energyCost: number; // estimated cost
  recommendations: string[];
}

export interface PlantLoadData {
  developmentStage: 'propagation' | 'vegetative' | 'flowering' | 'fruiting' | 'mature';
  numberOfTrusses: number;
  plantsPerM2: number;
  currentDLI: number; // mol/m²/day
  naturalLightHours: number;
  electricityCost: number; // $/kWh
}

export class LightRequirementCalculator {
  // Base requirements from Advanced Dutch Research
  static readonly BASE_LIGHT_REQUIREMENT = 200; // J/day for young plants
  static readonly LIGHT_PER_TRUSS_MIN = 150; // J per truss
  static readonly LIGHT_PER_TRUSS_MAX = 250; // J per truss
  static readonly J_TO_MOL_CONVERSION = 4.6; // μmol ≈ 4.6 J for typical grow lights

  /**
   * Calculate base light requirement based on development stage
   */
  static getBaseRequirement(stage: PlantLoadData['developmentStage']): number {
    const stageRequirements = {
      propagation: 100,
      vegetative: 200,
      flowering: 300,
      fruiting: 400,
      mature: 350
    };
    
    return stageRequirements[stage];
  }

  /**
   * Calculate additional light needed per truss
   */
  static calculateTrussLightRequirement(
    numberOfTrusses: number, 
    plantDensity: number
  ): number {
    // Higher density = more light per truss needed
    const densityFactor = Math.min(1.5, plantDensity / 2.5);
    const lightPerTruss = this.LIGHT_PER_TRUSS_MIN + 
      (this.LIGHT_PER_TRUSS_MAX - this.LIGHT_PER_TRUSS_MIN) * (densityFactor - 1);
    
    return numberOfTrusses * lightPerTruss;
  }

  /**
   * Convert J/cm²/day to mol/m²/day (DLI)
   */
  static convertJToDLI(jPerCm2Day: number): number {
    // Convert J/cm² to J/m²
    const jPerM2Day = jPerCm2Day * 10000;
    // Convert to mol using typical LED efficiency
    return jPerM2Day / (this.J_TO_MOL_CONVERSION * 1000000);
  }

  /**
   * Calculate required PAR intensity for supplemental lighting
   */
  static calculateRequiredPAR(
    targetDLI: number,
    lightingHours: number
  ): number {
    // DLI = PAR × hours × 3600 / 1,000,000
    return (targetDLI * 1000000) / (lightingHours * 3600);
  }

  /**
   * Main calculation method
   */
  static calculate(data: PlantLoadData): LightRequirementResult {
    const {
      developmentStage,
      numberOfTrusses,
      plantsPerM2,
      currentDLI,
      naturalLightHours,
      electricityCost
    } = data;

    // Calculate total light requirement
    const baseRequirement = this.getBaseRequirement(developmentStage);
    const trussRequirement = this.calculateTrussLightRequirement(numberOfTrusses, plantsPerM2);
    const totalJRequirement = baseRequirement + trussRequirement;
    
    // Convert to DLI
    const targetDLI = this.convertJToDLI(totalJRequirement);
    
    // Calculate supplemental light needed
    const dliDeficit = Math.max(0, targetDLI - currentDLI);
    
    // Determine supplemental lighting hours (max 18 hours total photoperiod)
    const maxSupplementalHours = Math.min(18 - naturalLightHours, 16);
    const supplementalLightNeeded = dliDeficit > 0 ? maxSupplementalHours : 0;
    
    // Calculate required PAR intensity
    const hourlyPAR = supplementalLightNeeded > 0 
      ? this.calculateRequiredPAR(dliDeficit, supplementalLightNeeded)
      : 0;
    
    // Estimate energy cost (assuming 2.7 μmol/J LED efficiency)
    const wattsPerM2 = hourlyPAR / 2.7; // Approximate for modern LEDs
    const kWhPerDay = (wattsPerM2 * supplementalLightNeeded) / 1000;
    const energyCost = kWhPerDay * electricityCost;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      targetDLI,
      currentDLI,
      hourlyPAR,
      developmentStage,
      numberOfTrusses
    );

    return {
      dailyLightRequirement: totalJRequirement,
      hourlyPAR,
      supplementalLightNeeded,
      energyCost,
      recommendations
    };
  }

  /**
   * Generate specific recommendations based on calculations
   */
  private static generateRecommendations(
    targetDLI: number,
    currentDLI: number,
    requiredPAR: number,
    stage: PlantLoadData['developmentStage'],
    trusses: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (currentDLI >= targetDLI) {
      recommendations.push('Natural light is sufficient for current growth stage');
    } else {
      const deficit = ((targetDLI - currentDLI) / targetDLI * 100).toFixed(1);
      recommendations.push(`Light deficit of ${deficit}% - supplemental lighting recommended`);
    }
    
    if (requiredPAR > 300) {
      recommendations.push('High PAR requirement - consider HPS or high-output LED fixtures');
    } else if (requiredPAR > 0) {
      recommendations.push(`Moderate PAR requirement - standard LED fixtures sufficient`);
    }
    
    // Stage-specific recommendations
    if (stage === 'flowering' && trusses > 5) {
      recommendations.push('Critical flowering stage - maintain consistent light levels');
    }
    
    if (trusses > 10) {
      recommendations.push('High fruit load - monitor for light stress and adjust accordingly');
    }
    
    // Light distribution recommendation
    if (requiredPAR > 200) {
      recommendations.push('Consider multiple light layers for uniform distribution');
    }
    
    return recommendations;
  }

  /**
   * Calculate light requirements throughout crop cycle
   */
  static calculateCropCycle(
    plantingDate: Date,
    expectedHarvestWeeks: number = 40
  ) {
    const weeklyRequirements = [];
    const currentDate = new Date(plantingDate);
    
    for (let week = 0; week < expectedHarvestWeeks; week++) {
      let stage: PlantLoadData['developmentStage'];
      let trusses = 0;
      
      if (week < 4) {
        stage = 'propagation';
      } else if (week < 8) {
        stage = 'vegetative';
      } else if (week < 12) {
        stage = 'flowering';
        trusses = week - 8;
      } else if (week < 35) {
        stage = 'fruiting';
        trusses = Math.min(15, week - 8);
      } else {
        stage = 'mature';
        trusses = 15 - (week - 35); // Topping begins
      }
      
      const baseReq = this.getBaseRequirement(stage);
      const trussReq = this.calculateTrussLightRequirement(trusses, 3.0);
      
      weeklyRequirements.push({
        week,
        date: new Date(currentDate),
        stage,
        trusses,
        lightRequirement: baseReq + trussReq,
        dli: this.convertJToDLI(baseReq + trussReq)
      });
      
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return weeklyRequirements;
  }

  /**
   * Climate-specific adjustments based on location
   */
  static getClimateAdjustment(
    latitude: number,
    season: 'winter' | 'spring' | 'summer' | 'fall'
  ): number {
    // Based on Advanced Dutch Research cold vs warm climate recommendations
    const isHighLatitude = Math.abs(latitude) > 45;
    
    const adjustments = {
      winter: isHighLatitude ? 1.5 : 1.2,
      spring: isHighLatitude ? 1.3 : 1.1,
      summer: isHighLatitude ? 1.0 : 0.9,
      fall: isHighLatitude ? 1.4 : 1.1
    };
    
    return adjustments[season];
  }
}