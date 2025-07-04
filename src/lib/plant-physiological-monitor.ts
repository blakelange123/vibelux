/**
 * Tomato Plant Physiological Monitor - VeGe Balance & Exhaustion Detection
 * Based on Advanced Dutch Research tomato cultivation protocols
 * CROP-SPECIFIC: Optimized for tomato plants only
 */

export interface PlantPhysiologyData {
  headWidth: number; // mm - target 12mm
  stemDiameter: number; // mm
  leafAngle: number; // degrees from horizontal
  leafColor: 'dark-green' | 'light-green' | 'yellow-green' | 'purple-tinge';
  internodeLength: number; // cm
  trussAngle: number; // degrees - generative indicator
  fruitSet: FruitSetData[];
  transpirationRate: number; // g/m²/hour
}

export interface FruitSetData {
  trussNumber: number;
  flowersPerTruss: number;
  fruitsSet: number;
  setPercentage: number;
  fruitQuality: 'excellent' | 'good' | 'poor' | 'deformed';
  pollinationSuccess: boolean;
}

export interface VeGeBalanceResult {
  balance: 'vegetative' | 'balanced' | 'generative';
  score: number; // -10 (very vegetative) to +10 (very generative)
  recommendations: string[];
  climateAdjustments: ClimateAdjustments;
  riskFactors: string[];
}

export interface ClimateAdjustments {
  temperatureAdjustment: number; // °C
  humidityAdjustment: number; // %
  lightAdjustment: number; // %
  co2Adjustment: number; // ppm
  irrigationAdjustment: number; // %
}

export interface ExhaustionAnalysis {
  isExhausted: boolean;
  exhaustionLevel: 'none' | 'mild' | 'moderate' | 'severe';
  affectedTrusses: number[];
  recoveryTimeEstimate: number; // days
  interventionRequired: boolean;
  recommendations: string[];
}

export class PlantPhysiologicalMonitor {
  // Target values from Advanced Dutch Research - TOMATO SPECIFIC
  static readonly CROP_TYPE = 'tomato';
  static readonly TARGET_HEAD_WIDTH_MIN = 6; // mm - tomato minimum
  static readonly TARGET_HEAD_WIDTH_MAX = 9.5; // mm - tomato maximum  
  static readonly TARGET_HEAD_WIDTH_OPTIMAL = 7.75; // mm - tomato optimal center
  static readonly OPTIMAL_INTERNODE_LENGTH = 25; // cm
  static readonly HEALTHY_TRUSS_ANGLE_MIN = 45; // degrees
  static readonly HEALTHY_TRUSS_ANGLE_MAX = 75; // degrees
  static readonly MIN_SET_PERCENTAGE = 85; // %
  
  // Tomato fruit size targets from Advanced Dutch Research
  static readonly FRUIT_SIZE_TARGETS = {
    winter: { min: 11 }, // grams - minimum winter fruit size
    summer: { min: 14 }  // grams - minimum summer fruit size
  };

  /**
   * Calculate head width score for tomatoes (6-9.5mm optimal range)
   */
  private static calculateHeadWidthScore(headWidth: number): number {
    if (headWidth >= this.TARGET_HEAD_WIDTH_MIN && headWidth <= this.TARGET_HEAD_WIDTH_MAX) {
      return 0; // Optimal range
    } else if (headWidth > this.TARGET_HEAD_WIDTH_MAX) {
      return -(headWidth - this.TARGET_HEAD_WIDTH_MAX) * 0.5; // Penalty for too thick (vegetative)
    } else {
      return (this.TARGET_HEAD_WIDTH_MIN - headWidth) * 0.5; // Penalty for too thin (generative)
    }
  }

  /**
   * Calculate VeGe balance score
   */
  static calculateVeGeBalance(data: PlantPhysiologyData): VeGeBalanceResult {
    let score = 0;
    const factors: string[] = [];
    
    // Head width assessment (tomato target 6-9.5mm)
    const headWidthFactor = this.calculateHeadWidthScore(data.headWidth);
    score += headWidthFactor;
    if (data.headWidth > this.TARGET_HEAD_WIDTH_MAX) {
      factors.push(`Head too thick (${data.headWidth}mm) - indicates vegetative growth (target: ${this.TARGET_HEAD_WIDTH_MIN}-${this.TARGET_HEAD_WIDTH_MAX}mm)`);
    } else if (data.headWidth < this.TARGET_HEAD_WIDTH_MIN) {
      factors.push(`Head too thin (${data.headWidth}mm) - indicates generative stress (target: ${this.TARGET_HEAD_WIDTH_MIN}-${this.TARGET_HEAD_WIDTH_MAX}mm)`);
    }
    
    // Stem diameter
    if (data.stemDiameter > 25) {
      score -= 2; // More vegetative
      factors.push('Thick stem - vegetative');
    } else if (data.stemDiameter < 18) {
      score += 2; // More generative
      factors.push('Thin stem - generative');
    }
    
    // Leaf angle
    if (data.leafAngle > 30) {
      score -= 1; // Drooping leaves = vegetative
      factors.push('Drooping leaves indicate vegetative state');
    } else if (data.leafAngle < 15) {
      score += 1; // Upright leaves = generative
      factors.push('Upright leaves indicate generative state');
    }
    
    // Internode length
    const internodeFactor = (data.internodeLength - this.OPTIMAL_INTERNODE_LENGTH) / 5;
    score += internodeFactor;
    if (data.internodeLength > 30) {
      factors.push('Long internodes - too vegetative');
    } else if (data.internodeLength < 20) {
      factors.push('Short internodes - generative stress');
    }
    
    // Truss angle
    if (data.trussAngle < this.HEALTHY_TRUSS_ANGLE_MIN) {
      score -= 2; // Drooping trusses = vegetative
      factors.push('Drooping trusses indicate vegetative growth');
    } else if (data.trussAngle > this.HEALTHY_TRUSS_ANGLE_MAX) {
      score += 1; // Upright trusses = generative
      factors.push('Upright trusses show generative balance');
    }
    
    // Determine balance
    let balance: VeGeBalanceResult['balance'];
    if (score < -3) balance = 'vegetative';
    else if (score > 3) balance = 'generative';
    else balance = 'balanced';
    
    return {
      balance,
      score,
      recommendations: this.generateVeGeRecommendations(balance, score, data),
      climateAdjustments: this.getClimateAdjustments(balance, score),
      riskFactors: factors
    };
  }

  /**
   * Analyze plant exhaustion from fruit set patterns
   */
  static analyzeExhaustion(fruitSetData: FruitSetData[]): ExhaustionAnalysis {
    if (fruitSetData.length < 3) {
      return {
        isExhausted: false,
        exhaustionLevel: 'none',
        affectedTrusses: [],
        recoveryTimeEstimate: 0,
        interventionRequired: false,
        recommendations: ['Insufficient data - collect more truss information']
      };
    }

    const recentTrusses = fruitSetData.slice(-6); // Last 6 trusses
    const poorSetTrusses = recentTrusses.filter(t => t.setPercentage < this.MIN_SET_PERCENTAGE);
    
    // Check for alternating pattern (exhaustion indicator)
    let alternatingPattern = 0;
    for (let i = 1; i < recentTrusses.length; i++) {
      const current = recentTrusses[i].setPercentage;
      const previous = recentTrusses[i-1].setPercentage;
      
      if ((current < this.MIN_SET_PERCENTAGE && previous >= this.MIN_SET_PERCENTAGE) ||
          (current >= this.MIN_SET_PERCENTAGE && previous < this.MIN_SET_PERCENTAGE)) {
        alternatingPattern++;
      }
    }

    const exhaustionLevel = this.determineExhaustionLevel(poorSetTrusses.length, alternatingPattern);
    const isExhausted = exhaustionLevel !== 'none';
    
    return {
      isExhausted,
      exhaustionLevel,
      affectedTrusses: poorSetTrusses.map(t => t.trussNumber),
      recoveryTimeEstimate: this.calculateRecoveryTime(exhaustionLevel),
      interventionRequired: exhaustionLevel === 'severe' || alternatingPattern >= 3,
      recommendations: this.generateExhaustionRecommendations(exhaustionLevel, alternatingPattern)
    };
  }

  /**
   * Assess pollination success
   */
  static assessPollinationSuccess(fruitSetData: FruitSetData[]) {
    const recentData = fruitSetData.slice(-3);
    const avgSetPercentage = recentData.reduce((sum, t) => sum + t.setPercentage, 0) / recentData.length;
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    if (avgSetPercentage < 85) {
      issues.push('Low fruit set percentage');
      recommendations.push('Check climate conditions: temperature 20-25°C, humidity 65-80%');
    }
    
    // Check for deformed fruit (pollination issues)
    const deformedFruit = recentData.filter(t => t.fruitQuality === 'deformed').length;
    if (deformedFruit > 0) {
      issues.push('Deformed fruit indicates pollination problems');
      recommendations.push('Improve air circulation, check temperature stress');
    }
    
    // Check flower number consistency
    const flowerVariation = this.calculateVariation(recentData.map(t => t.flowersPerTruss));
    if (flowerVariation > 20) {
      issues.push('Inconsistent flower development');
      recommendations.push('Stabilize growing conditions, check nutritional balance');
    }
    
    return {
      avgSetPercentage,
      pollinationSuccess: avgSetPercentage >= 85 && deformedFruit === 0,
      issues,
      recommendations,
      qualityDistribution: this.calculateQualityDistribution(recentData)
    };
  }

  /**
   * Generate climate adjustment recommendations
   */
  private static getClimateAdjustments(balance: string, score: number): ClimateAdjustments {
    const adjustments: ClimateAdjustments = {
      temperatureAdjustment: 0,
      humidityAdjustment: 0,
      lightAdjustment: 0,
      co2Adjustment: 0,
      irrigationAdjustment: 0
    };

    if (balance === 'vegetative') {
      // Steer towards generative
      adjustments.temperatureAdjustment = 1; // Slightly warmer
      adjustments.humidityAdjustment = -5; // Lower humidity
      adjustments.lightAdjustment = 5; // More light
      adjustments.irrigationAdjustment = -10; // Less frequent irrigation
    } else if (balance === 'generative') {
      // Steer towards vegetative
      adjustments.temperatureAdjustment = -1; // Slightly cooler
      adjustments.humidityAdjustment = 5; // Higher humidity
      adjustments.lightAdjustment = -5; // Reduce light stress
      adjustments.irrigationAdjustment = 10; // More frequent irrigation
    }
    
    return adjustments;
  }

  /**
   * Generate VeGe balance recommendations
   */
  private static generateVeGeRecommendations(
    balance: string, 
    score: number, 
    data: PlantPhysiologyData
  ): string[] {
    const recommendations: string[] = [];
    
    if (balance === 'vegetative') {
      recommendations.push('Plant is too vegetative - increase fruit load');
      recommendations.push('Reduce night temperature by 1-2°C');
      recommendations.push('Increase day/night temperature difference');
      if (data.headWidth > 15) {
        recommendations.push('Consider fruit thinning to stress plant generatively');
      }
    } else if (balance === 'generative') {
      recommendations.push('Plant is too generative - reduce stress');
      recommendations.push('Increase night temperature by 1°C');
      recommendations.push('Ensure adequate irrigation');
      recommendations.push('Check for root zone problems');
    } else {
      recommendations.push('Plant balance is optimal - maintain current strategy');
      recommendations.push('Monitor for any drift in either direction');
    }
    
    // Tomato head width specific recommendations
    if (data.headWidth < this.TARGET_HEAD_WIDTH_MIN) {
      recommendations.push(`Head too thin (${data.headWidth}mm) - reduce fruit load temporarily (target: ${this.TARGET_HEAD_WIDTH_MIN}-${this.TARGET_HEAD_WIDTH_MAX}mm)`);
    } else if (data.headWidth > this.TARGET_HEAD_WIDTH_MAX) {
      recommendations.push(`Head too thick (${data.headWidth}mm) - increase fruit load or reduce irrigation (target: ${this.TARGET_HEAD_WIDTH_MIN}-${this.TARGET_HEAD_WIDTH_MAX}mm)`);
    } else {
      recommendations.push(`Head width optimal (${data.headWidth}mm) - maintain current strategy`);
    }
    
    return recommendations;
  }

  /**
   * Determine exhaustion level
   */
  private static determineExhaustionLevel(
    poorSetCount: number, 
    alternatingPattern: number
  ): ExhaustionAnalysis['exhaustionLevel'] {
    if (poorSetCount === 0 && alternatingPattern === 0) return 'none';
    if (poorSetCount <= 2 && alternatingPattern <= 1) return 'mild';
    if (poorSetCount <= 4 && alternatingPattern <= 2) return 'moderate';
    return 'severe';
  }

  /**
   * Calculate recovery time estimate
   */
  private static calculateRecoveryTime(level: ExhaustionAnalysis['exhaustionLevel']): number {
    const recoveryTimes = {
      none: 0,
      mild: 7,     // 1 week
      moderate: 14, // 2 weeks  
      severe: 28    // 4 weeks
    };
    return recoveryTimes[level];
  }

  /**
   * Generate exhaustion recommendations
   */
  private static generateExhaustionRecommendations(
    level: ExhaustionAnalysis['exhaustionLevel'],
    alternatingPattern: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (level === 'none') {
      recommendations.push('Plant energy balance is healthy');
      return recommendations;
    }
    
    recommendations.push('Reduce fruit load on affected trusses');
    recommendations.push('Optimize climate for recovery (stable temperatures)');
    recommendations.push('Ensure adequate root zone conditions');
    
    if (level === 'moderate' || level === 'severe') {
      recommendations.push('Consider temporary CO₂ enrichment boost');
      recommendations.push('Monitor carefully for 2-3 weeks');
    }
    
    if (level === 'severe') {
      recommendations.push('URGENT: Remove 30-50% of developing fruit');
      recommendations.push('Implement stress-reducing climate strategy');
      recommendations.push('Consider expert consultation');
    }
    
    if (alternatingPattern >= 3) {
      recommendations.push('Clear alternating pattern detected - systematic exhaustion');
      recommendations.push('Review overall crop load strategy');
    }
    
    return recommendations;
  }

  /**
   * Helper methods
   */
  private static calculateVariation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return (Math.sqrt(variance) / mean) * 100; // Coefficient of variation
  }

  private static calculateQualityDistribution(data: FruitSetData[]) {
    const total = data.length;
    const distribution = {
      excellent: data.filter(t => t.fruitQuality === 'excellent').length / total * 100,
      good: data.filter(t => t.fruitQuality === 'good').length / total * 100,
      poor: data.filter(t => t.fruitQuality === 'poor').length / total * 100,
      deformed: data.filter(t => t.fruitQuality === 'deformed').length / total * 100
    };
    return distribution;
  }

  /**
   * Generate comprehensive plant health report
   */
  static generatePlantHealthReport(data: PlantPhysiologyData, fruitSetHistory: FruitSetData[]) {
    const vegeBalance = this.calculateVeGeBalance(data);
    const exhaustionAnalysis = this.analyzeExhaustion(fruitSetHistory);
    const pollinationAssessment = this.assessPollinationSuccess(fruitSetHistory);
    
    return {
      timestamp: new Date(),
      plantData: data,
      vegeBalance,
      exhaustionAnalysis,
      pollinationAssessment,
      overallHealth: this.calculateOverallHealth(vegeBalance, exhaustionAnalysis, pollinationAssessment),
      priorityActions: this.getPriorityActions(vegeBalance, exhaustionAnalysis, pollinationAssessment)
    };
  }

  private static calculateOverallHealth(
    vegeBalance: VeGeBalanceResult,
    exhaustion: ExhaustionAnalysis,
    pollination: any
  ): { score: number; status: string; concerns: string[] } {
    let score = 100;
    const concerns: string[] = [];
    
    // VeGe balance impact
    if (vegeBalance.balance !== 'balanced') {
      score -= Math.abs(vegeBalance.score) * 5;
      concerns.push(`Plant balance is ${vegeBalance.balance}`);
    }
    
    // Exhaustion impact
    const exhaustionPenalty = {
      none: 0,
      mild: 10,
      moderate: 25,
      severe: 50
    };
    score -= exhaustionPenalty[exhaustion.exhaustionLevel];
    if (exhaustion.isExhausted) {
      concerns.push(`Plant exhaustion: ${exhaustion.exhaustionLevel}`);
    }
    
    // Pollination impact
    if (pollination.avgSetPercentage < 85) {
      score -= (85 - pollination.avgSetPercentage) * 2;
      concerns.push('Poor pollination success');
    }
    
    let status: string;
    if (score >= 90) status = 'Excellent';
    else if (score >= 75) status = 'Good';
    else if (score >= 60) status = 'Fair';
    else if (score >= 40) status = 'Poor';
    else status = 'Critical';
    
    return { score: Math.max(0, score), status, concerns };
  }

  private static getPriorityActions(
    vegeBalance: VeGeBalanceResult,
    exhaustion: ExhaustionAnalysis,
    pollination: any
  ): string[] {
    const actions: string[] = [];
    
    // Priority 1: Severe exhaustion
    if (exhaustion.exhaustionLevel === 'severe') {
      actions.push('URGENT: Reduce fruit load immediately');
    }
    
    // Priority 2: Poor pollination
    if (pollination.avgSetPercentage < 70) {
      actions.push('HIGH: Address pollination issues (climate, air movement)');
    }
    
    // Priority 3: Balance correction
    if (Math.abs(vegeBalance.score) > 5) {
      actions.push(`MEDIUM: Correct ${vegeBalance.balance} imbalance`);
    }
    
    if (actions.length === 0) {
      actions.push('Continue current management strategy');
    }
    
    return actions;
  }
}