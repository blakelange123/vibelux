/**
 * Tomato Nutrient Calculator
 * Based on Advanced Dutch Research tomato-specific nutrient requirements
 * CROP-SPECIFIC: Optimized for tomato cultivation only
 */

export interface TomatoNutrientTargets {
  // Drip irrigation targets (mMol and μMol)
  drip: {
    NH4: { max: number }; // mMol
    K: { min: number; max: number }; // mMol
    Na: { max: number }; // mMol
    Mg: { min: number; max: number }; // mMol
    NO3: { min: number; max: number }; // mMol
    Cl: { min: number; max: number }; // mMol
    S: { min: number; max: number }; // mMol
    HCO3: { max: number }; // mMol
    P: { min: number; max: number }; // mMol
    Fe: { min: number; max: number }; // μMol
    Mn: { min: number; max: number }; // μMol
    Zn: { min: number; max: number }; // μMol
    B: { min: number; max: number }; // μMol
    Cu: { min: number; max: number }; // μMol
  };
  
  // Drain water targets (mMol and μMol)
  drain: {
    NH4: { max: number }; // mMol
    K: { min: number; max: number }; // mMol
    Na: { max: number }; // mMol
    Mg: { min: number; max: number }; // mMol
    NO3: { min: number; max: number }; // mMol
    Cl: { min: number; max: number }; // mMol
    S: { min: number; max: number }; // mMol
    HCO3: { max: number }; // mMol
    P: { min: number; max: number }; // mMol
    Fe: { min: number; max: number }; // μMol
    Mn: { min: number; max: number }; // μMol
    Zn: { min: number; max: number }; // μMol
    B: { min: number; max: number }; // μMol
    Cu: { min: number; max: number }; // μMol
  };
}

export interface TomatoNutrientAnalysis {
  element: string;
  measured: number;
  target: { min?: number; max?: number };
  status: 'optimal' | 'low' | 'high' | 'critical';
  deviation: number; // percentage off target
  recommendations: string[];
  unit: 'mMol' | 'μMol';
}

export interface TomatoNutrientReport {
  sampleType: 'drip' | 'drain';
  timestamp: Date;
  overallScore: number; // 0-100
  analyses: TomatoNutrientAnalysis[];
  criticalIssues: string[];
  recommendations: string[];
  nextAnalysisDate: Date;
}

export class TomatoNutrientCalculator {
  // Tomato-specific nutrient targets from Advanced Dutch Research
  static readonly CROP_TYPE = 'tomato';
  
  static readonly TARGETS: TomatoNutrientTargets = {
    drip: {
      NH4: { max: 0.5 },
      K: { min: 6.0, max: 8.4 },
      Na: { max: 1.0 },
      Mg: { min: 4.2, max: 4.9 },
      NO3: { min: 10.8, max: 24 },
      Cl: { min: 2.5, max: 4.0 },
      S: { min: 4.2, max: 4.8 },
      HCO3: { max: 0.1 },
      P: { min: 1.7, max: 2.1 },
      Fe: { min: 32, max: 52 },
      Mn: { min: 14, max: 17 },
      Zn: { min: 12, max: 23 },
      B: { min: 85, max: 120 },
      Cu: { min: 0.8, max: 1.9 }
    },
    
    drain: {
      NH4: { max: 0.5 },
      K: { min: 7.8, max: 10.9 },
      Na: { max: 6.0 },
      Mg: { min: 5.5, max: 6.4 },
      NO3: { min: 14, max: 31.2 },
      Cl: { min: 3.2, max: 5.2 },
      S: { min: 5.5, max: 6.2 },
      HCO3: { max: 0.1 },
      P: { min: 2.2, max: 2.7 },
      Fe: { min: 42, max: 67 },
      Mn: { min: 18, max: 22 },
      Zn: { min: 16, max: 30 },
      B: { min: 110, max: 156 },
      Cu: { min: 1.0, max: 2.5 }
    }
  };

  /**
   * Analyze nutrient levels for tomato cultivation
   */
  static analyzeNutrients(
    measurements: Record<string, number>,
    sampleType: 'drip' | 'drain'
  ): TomatoNutrientReport {
    const targets = this.TARGETS[sampleType];
    const analyses: TomatoNutrientAnalysis[] = [];
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];
    let totalScore = 0;
    let analyzedElements = 0;

    // Analyze each element
    Object.entries(measurements).forEach(([element, measured]) => {
      const elementKey = element as keyof typeof targets;
      const target = targets[elementKey];
      
      if (!target) return; // Skip unknown elements
      
      const analysis = this.analyzeElement(
        element,
        measured,
        target,
        this.getElementUnit(element)
      );
      
      analyses.push(analysis);
      analyzedElements++;
      
      // Calculate score (100 for optimal, penalties for deviations)
      if (analysis.status === 'optimal') {
        totalScore += 100;
      } else if (analysis.status === 'low' || analysis.status === 'high') {
        totalScore += Math.max(0, 100 - Math.abs(analysis.deviation) * 2.5);
      } else { // critical
        totalScore += 0;
        criticalIssues.push(`CRITICAL: ${element} is ${analysis.status} (${measured} ${analysis.unit})`);
      }
      
      // Add recommendations for problematic elements
      if (analysis.status !== 'optimal') {
        recommendations.push(...analysis.recommendations);
      }
    });

    const overallScore = analyzedElements > 0 ? Math.round(totalScore / analyzedElements) : 0;
    
    // Add general recommendations based on score
    if (overallScore < 60) {
      recommendations.unshift('Overall nutrient balance is poor - consider complete solution revision');
    } else if (overallScore < 80) {
      recommendations.unshift('Several nutrients need adjustment - review irrigation strategy');
    }

    return {
      sampleType,
      timestamp: new Date(),
      overallScore,
      analyses,
      criticalIssues,
      recommendations: this.deduplicateRecommendations(recommendations),
      nextAnalysisDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
    };
  }

  /**
   * Analyze individual element
   */
  private static analyzeElement(
    element: string,
    measured: number,
    target: { min?: number; max?: number },
    unit: 'mMol' | 'μMol'
  ): TomatoNutrientAnalysis {
    let status: TomatoNutrientAnalysis['status'] = 'optimal';
    let deviation = 0;
    const recommendations: string[] = [];

    // Determine status and deviation
    if (target.min !== undefined && measured < target.min) {
      status = 'low';
      deviation = ((target.min - measured) / target.min) * 100;
      
      if (deviation > 25) {
        status = 'critical';
        recommendations.push(`URGENT: Increase ${element} in nutrient solution`);
      } else {
        recommendations.push(`Increase ${element} concentration gradually`);
      }
      
      // Element-specific recommendations
      if (element === 'K') {
        recommendations.push('Low potassium may affect fruit quality and plant stress tolerance');
      } else if (element === 'NO3') {
        recommendations.push('Low nitrate may limit vegetative growth and fruit development');
      } else if (element === 'P') {
        recommendations.push('Low phosphorus may affect root development and energy metabolism');
      } else if (element === 'Mg') {
        recommendations.push('Low magnesium may cause chlorosis and reduced photosynthesis');
      }
      
    } else if (target.max !== undefined && measured > target.max) {
      status = 'high';
      deviation = ((measured - target.max) / target.max) * 100;
      
      if (deviation > 25) {
        status = 'critical';
        recommendations.push(`URGENT: Reduce ${element} in nutrient solution`);
      } else {
        recommendations.push(`Reduce ${element} concentration gradually`);
      }
      
      // Element-specific recommendations
      if (element === 'Na') {
        recommendations.push('High sodium may cause salt stress and nutrient imbalances');
      } else if (element === 'Cl') {
        recommendations.push('High chloride may cause leaf burn and reduced water uptake');
      } else if (element === 'NH4') {
        recommendations.push('High ammonium may cause root damage and pH issues');
      }
    }

    return {
      element,
      measured,
      target,
      status,
      deviation: Math.round(deviation),
      recommendations,
      unit
    };
  }

  /**
   * Get the appropriate unit for an element
   */
  private static getElementUnit(element: string): 'mMol' | 'μMol' {
    const microMolElements = ['Fe', 'Mn', 'Zn', 'B', 'Cu'];
    return microMolElements.includes(element) ? 'μMol' : 'mMol';
  }

  /**
   * Remove duplicate recommendations
   */
  private static deduplicateRecommendations(recommendations: string[]): string[] {
    return [...new Set(recommendations)];
  }

  /**
   * Generate EC recommendations based on growth stage
   */
  static getECTargetsByStage(stage: 'propagation' | 'vegetative' | 'flowering' | 'fruiting'): {
    min: number;
    max: number;
    unit: string;
    recommendations: string[];
  } {
    const targets = {
      propagation: { min: 1.0, max: 1.6, unit: 'mS/cm' },
      vegetative: { min: 3.0, max: 4.0, unit: 'mS/cm' },
      flowering: { min: 3.0, max: 4.5, unit: 'mS/cm' },
      fruiting: { min: 3.5, max: 5.0, unit: 'mS/cm' }
    };

    const stageRecommendations = {
      propagation: [
        'Lower EC promotes root development',
        'Monitor carefully to prevent salt stress in young plants',
        'Gradually increase EC as plants establish'
      ],
      vegetative: [
        'Moderate EC supports balanced vegetative growth',
        'Monitor nitrogen levels for optimal leaf development',
        'Prepare for transition to flowering stage'
      ],
      flowering: [
        'Maintain steady EC during flower initiation',
        'Ensure adequate potassium for flower development',
        'Monitor calcium levels for strong flower formation'
      ],
      fruiting: [
        'Higher EC supports fruit development and quality',
        'Monitor potassium carefully for fruit sizing',
        'Balance nutrition to prevent blossom end rot'
      ]
    };

    return {
      ...targets[stage],
      recommendations: stageRecommendations[stage]
    };
  }

  /**
   * Calculate optimal drain percentage based on EC levels
   */
  static calculateOptimalDrainPercentage(
    dripEC: number,
    drainEC: number,
    targetEC: number
  ): {
    currentDrainPercentage: number;
    recommendedDrainPercentage: number;
    recommendations: string[];
  } {
    const ecBuildUp = drainEC - dripEC;
    const recommendations: string[] = [];
    
    let recommendedDrainPercentage = 20; // Base 20%
    
    if (ecBuildUp > 1.5) {
      recommendedDrainPercentage = 30;
      recommendations.push('High EC build-up detected - increase drain percentage');
    } else if (ecBuildUp > 1.0) {
      recommendedDrainPercentage = 25;
      recommendations.push('Moderate EC build-up - slightly increase drain percentage');
    } else if (ecBuildUp < 0.5) {
      recommendedDrainPercentage = 15;
      recommendations.push('Low EC build-up - can reduce drain percentage to save water');
    }

    if (drainEC > targetEC * 1.5) {
      recommendations.push('Drain EC significantly above target - consider flushing');
    }

    return {
      currentDrainPercentage: Math.round(((drainEC - dripEC) / dripEC) * 100),
      recommendedDrainPercentage,
      recommendations
    };
  }
}