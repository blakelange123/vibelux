/**
 * Tomato Pollination Success Analyzer
 * Based on Advanced Dutch Research tomato pollination optimization strategies
 * CROP-SPECIFIC: Optimized for tomato plants only
 */

export interface PollinationEnvironment {
  temperature: number; // °C
  humidity: number; // %
  airMovement: number; // m/s
  co2Level: number; // ppm
  lightLevel: number; // μmol/m²/s
  timeOfDay: number; // 0-23 hours
  plantEnergyBalance: 'vegetative' | 'balanced' | 'generative';
}

export interface PollinationAssessment {
  successProbability: number; // 0-100%
  qualityPrediction: 'excellent' | 'good' | 'fair' | 'poor';
  limitingFactors: string[];
  optimizationRecommendations: string[];
  environmentalScore: EnvironmentalScore;
  timingRecommendations: TimingRecommendation[];
}

export interface EnvironmentalScore {
  temperature: number; // 0-100
  humidity: number; // 0-100
  airMovement: number; // 0-100
  plantBalance: number; // 0-100
  overall: number; // 0-100
}

export interface TimingRecommendation {
  startTime: number; // hour
  endTime: number; // hour
  activity: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface FlowerDevelopmentData {
  flowerAge: number; // days since flower opening
  pollenViability: number; // %
  stigmaReceptivity: number; // %
  nectarProduction: number; // μL
  petalCondition: 'fresh' | 'mature' | 'aging' | 'wilted';
}

export interface PollinationHistoryData {
  date: Date;
  trussNumber: number;
  flowersTotal: number;
  flowersSet: number;
  setPercentage: number;
  fruitQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'deformed';
  environmentalConditions: PollinationEnvironment;
}

export class PollinationSuccessAnalyzer {
  // Optimal ranges from Advanced Dutch Research tomato research
  static readonly CROP_TYPE = 'tomato';
  static readonly OPTIMAL_TEMPERATURE = { min: 20, max: 25 }; // °C - tomato specific
  static readonly OPTIMAL_HUMIDITY = { min: 65, max: 80 }; // % - tomato specific
  static readonly OPTIMAL_AIR_MOVEMENT = { min: 0.1, max: 0.3 }; // m/s - tomato specific
  static readonly CRITICAL_TEMPERATURE_MAX = 30; // °C - tomato pollen damage threshold
  static readonly MIN_SET_PERCENTAGE = 85; // % - tomato target

  /**
   * Assess pollination success probability
   */
  static assessPollinationSuccess(environment: PollinationEnvironment): PollinationAssessment {
    const environmentalScore = this.calculateEnvironmentalScore(environment);
    const limitingFactors = this.identifyLimitingFactors(environment);
    const successProbability = this.calculateSuccessProbability(environmentalScore);
    const qualityPrediction = this.predictFruitQuality(environment, successProbability);
    const optimizationRecommendations = this.generateOptimizationRecommendations(environment, limitingFactors);
    const timingRecommendations = this.generateTimingRecommendations(environment);

    return {
      successProbability,
      qualityPrediction,
      limitingFactors,
      optimizationRecommendations,
      environmentalScore,
      timingRecommendations
    };
  }

  /**
   * Calculate environmental scores for each factor
   */
  private static calculateEnvironmentalScore(environment: PollinationEnvironment): EnvironmentalScore {
    // Temperature score (optimal 20-25°C)
    let tempScore = 100;
    if (environment.temperature < this.OPTIMAL_TEMPERATURE.min) {
      tempScore = Math.max(0, 100 - (this.OPTIMAL_TEMPERATURE.min - environment.temperature) * 15);
    } else if (environment.temperature > this.OPTIMAL_TEMPERATURE.max) {
      if (environment.temperature > this.CRITICAL_TEMPERATURE_MAX) {
        tempScore = 0; // Severe pollen damage
      } else {
        tempScore = Math.max(0, 100 - (environment.temperature - this.OPTIMAL_TEMPERATURE.max) * 20);
      }
    }

    // Humidity score (optimal 65-80%)
    let humidityScore = 100;
    if (environment.humidity < this.OPTIMAL_HUMIDITY.min) {
      humidityScore = Math.max(0, 100 - (this.OPTIMAL_HUMIDITY.min - environment.humidity) * 2);
    } else if (environment.humidity > this.OPTIMAL_HUMIDITY.max) {
      humidityScore = Math.max(0, 100 - (environment.humidity - this.OPTIMAL_HUMIDITY.max) * 3);
    }

    // Air movement score (optimal 0.1-0.3 m/s)
    let airScore = 100;
    if (environment.airMovement < this.OPTIMAL_AIR_MOVEMENT.min) {
      airScore = environment.airMovement / this.OPTIMAL_AIR_MOVEMENT.min * 100;
    } else if (environment.airMovement > this.OPTIMAL_AIR_MOVEMENT.max) {
      airScore = Math.max(20, 100 - (environment.airMovement - this.OPTIMAL_AIR_MOVEMENT.max) * 200);
    }

    // Plant balance score
    const balanceScores = {
      vegetative: 60, // Too vegetative reduces flower quality
      balanced: 100,  // Optimal for pollination
      generative: 80  // Acceptable but may affect flower development
    };
    const plantBalance = balanceScores[environment.plantEnergyBalance];

    // Overall score (weighted average)
    const overall = (tempScore * 0.35 + humidityScore * 0.25 + airScore * 0.25 + plantBalance * 0.15);

    return {
      temperature: Math.round(tempScore),
      humidity: Math.round(humidityScore),
      airMovement: Math.round(airScore),
      plantBalance: Math.round(plantBalance),
      overall: Math.round(overall)
    };
  }

  /**
   * Identify limiting factors for pollination
   */
  private static identifyLimitingFactors(environment: PollinationEnvironment): string[] {
    const factors: string[] = [];

    if (environment.temperature > this.CRITICAL_TEMPERATURE_MAX) {
      factors.push('CRITICAL: Temperature above 30°C - pollen damage likely');
    } else if (environment.temperature > this.OPTIMAL_TEMPERATURE.max) {
      factors.push('High temperature reducing pollen viability');
    } else if (environment.temperature < this.OPTIMAL_TEMPERATURE.min) {
      factors.push('Low temperature slowing flower development');
    }

    if (environment.humidity > 85) {
      factors.push('High humidity preventing pollen release');
    } else if (environment.humidity < 60) {
      factors.push('Low humidity causing pollen desiccation');
    }

    if (environment.airMovement < 0.05) {
      factors.push('Insufficient air movement for pollen transfer');
    } else if (environment.airMovement > 0.5) {
      factors.push('Excessive air movement disrupting pollination');
    }

    if (environment.plantEnergyBalance === 'vegetative') {
      factors.push('Plant too vegetative - poor flower quality');
    } else if (environment.plantEnergyBalance === 'generative') {
      factors.push('Plant stress may affect flower development');
    }

    if (environment.co2Level < 400) {
      factors.push('Low CO2 reducing photosynthesis and flower energy');
    }

    return factors;
  }

  /**
   * Calculate overall success probability
   */
  private static calculateSuccessProbability(scores: EnvironmentalScore): number {
    // Base probability from overall environmental score
    let probability = scores.overall;

    // Apply critical factor penalties
    if (scores.temperature < 20) {
      probability *= 0.5; // Severe penalty for critical temperature issues
    }

    if (scores.humidity < 50 || scores.airMovement < 30) {
      probability *= 0.7; // Moderate penalty for other critical factors
    }

    return Math.max(0, Math.min(100, probability));
  }

  /**
   * Predict fruit quality based on pollination conditions
   */
  private static predictFruitQuality(
    environment: PollinationEnvironment, 
    successProbability: number
  ): PollinationAssessment['qualityPrediction'] {
    if (successProbability >= 85 && 
        environment.temperature <= this.OPTIMAL_TEMPERATURE.max &&
        environment.plantEnergyBalance === 'balanced') {
      return 'excellent';
    } else if (successProbability >= 70) {
      return 'good';
    } else if (successProbability >= 50) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * Generate optimization recommendations
   */
  private static generateOptimizationRecommendations(
    environment: PollinationEnvironment,
    limitingFactors: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Temperature optimization
    if (environment.temperature > this.CRITICAL_TEMPERATURE_MAX) {
      recommendations.push('URGENT: Reduce temperature below 30°C immediately');
      recommendations.push('Increase ventilation and activate cooling systems');
      recommendations.push('Deploy shading if solar radiation is high');
    } else if (environment.temperature > this.OPTIMAL_TEMPERATURE.max) {
      recommendations.push('Reduce temperature to 20-25°C range');
      recommendations.push('Adjust ventilation settings');
    } else if (environment.temperature < this.OPTIMAL_TEMPERATURE.min) {
      recommendations.push('Increase temperature to 20-25°C range');
      recommendations.push('Reduce ventilation or increase heating');
    }

    // Humidity optimization
    if (environment.humidity > this.OPTIMAL_HUMIDITY.max) {
      recommendations.push('Reduce humidity to 65-80% range');
      recommendations.push('Increase air circulation');
      recommendations.push('Check for excess moisture sources');
    } else if (environment.humidity < this.OPTIMAL_HUMIDITY.min) {
      recommendations.push('Increase humidity to 65-80% range');
      recommendations.push('Reduce ventilation or add humidification');
    }

    // Air movement optimization
    if (environment.airMovement < this.OPTIMAL_AIR_MOVEMENT.min) {
      recommendations.push('Increase air circulation (target 0.1-0.3 m/s)');
      recommendations.push('Adjust fan speeds or add circulation fans');
    } else if (environment.airMovement > this.OPTIMAL_AIR_MOVEMENT.max) {
      recommendations.push('Reduce air movement to prevent pollen disruption');
      recommendations.push('Lower fan speeds or redirect airflow');
    }

    // Plant balance optimization
    if (environment.plantEnergyBalance === 'vegetative') {
      recommendations.push('Steer plant more generative');
      recommendations.push('Increase fruit load or reduce irrigation frequency');
    } else if (environment.plantEnergyBalance === 'generative') {
      recommendations.push('Reduce plant stress');
      recommendations.push('Check root zone conditions and irrigation');
    }

    // Timing recommendations
    recommendations.push('Schedule hand pollination during optimal morning hours (7-10 AM)');
    recommendations.push('Monitor flower development stage for optimal timing');

    return recommendations;
  }

  /**
   * Generate timing recommendations for pollination activities
   */
  private static generateTimingRecommendations(environment: PollinationEnvironment): TimingRecommendation[] {
    const recommendations: TimingRecommendation[] = [];

    // Morning pollination window
    recommendations.push({
      startTime: 7,
      endTime: 10,
      activity: 'Hand pollination (if needed)',
      reason: 'Optimal pollen viability and stigma receptivity',
      priority: 'high'
    });

    // Climate monitoring
    recommendations.push({
      startTime: 6,
      endTime: 18,
      activity: 'Monitor temperature and humidity',
      reason: 'Critical pollination period during light hours',
      priority: 'high'
    });

    // Evening assessment
    recommendations.push({
      startTime: 16,
      endTime: 18,
      activity: 'Assess flower condition and set',
      reason: 'Evaluate daily pollination success',
      priority: 'medium'
    });

    // Air circulation adjustment
    if (environment.airMovement < this.OPTIMAL_AIR_MOVEMENT.min) {
      recommendations.push({
        startTime: 8,
        endTime: 16,
        activity: 'Increase air circulation',
        reason: 'Improve pollen distribution during peak hours',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Analyze flower development stage
   */
  static analyzeFlowerDevelopment(flowerData: FlowerDevelopmentData): {
    pollinationWindow: string;
    viabilityScore: number;
    recommendations: string[];
  } {
    let viabilityScore = 100;
    const recommendations: string[] = [];
    let pollinationWindow = '';

    // Age-based viability
    if (flowerData.flowerAge <= 1) {
      pollinationWindow = 'Pre-optimal - wait 1-2 days';
      viabilityScore -= 20;
    } else if (flowerData.flowerAge <= 3) {
      pollinationWindow = 'Optimal pollination window';
    } else if (flowerData.flowerAge <= 5) {
      pollinationWindow = 'Good pollination window';
      viabilityScore -= 10;
    } else {
      pollinationWindow = 'Past optimal - reduced viability';
      viabilityScore -= 30;
    }

    // Petal condition assessment
    const petalPenalties = {
      fresh: 0,
      mature: 5,
      aging: 15,
      wilted: 40
    };
    viabilityScore -= petalPenalties[flowerData.petalCondition];

    // Pollen viability
    viabilityScore = (viabilityScore + flowerData.pollenViability) / 2;

    // Stigma receptivity
    if (flowerData.stigmaReceptivity < 80) {
      recommendations.push('Stigma receptivity low - check plant stress');
    }

    // Nectar production
    if (flowerData.nectarProduction < 0.5) {
      recommendations.push('Low nectar production may indicate plant stress');
    }

    return {
      pollinationWindow,
      viabilityScore: Math.max(0, viabilityScore),
      recommendations
    };
  }

  /**
   * Analyze historical pollination performance
   */
  static analyzePollinationHistory(historyData: PollinationHistoryData[]): {
    averageSetPercentage: number;
    trendAnalysis: string;
    correlations: { factor: string; correlation: number }[];
    improvementRecommendations: string[];
  } {
    if (historyData.length < 3) {
      return {
        averageSetPercentage: 0,
        trendAnalysis: 'Insufficient data for analysis',
        correlations: [],
        improvementRecommendations: ['Collect more pollination data for analysis']
      };
    }

    const recentData = historyData.slice(-10); // Last 10 records
    const averageSetPercentage = recentData.reduce((sum, d) => sum + d.setPercentage, 0) / recentData.length;

    // Trend analysis
    const oldAvg = recentData.slice(0, 5).reduce((sum, d) => sum + d.setPercentage, 0) / 5;
    const newAvg = recentData.slice(-5).reduce((sum, d) => sum + d.setPercentage, 0) / 5;
    const trend = newAvg - oldAvg;

    let trendAnalysis = '';
    if (trend > 5) {
      trendAnalysis = 'Improving pollination success';
    } else if (trend < -5) {
      trendAnalysis = 'Declining pollination success - investigation needed';
    } else {
      trendAnalysis = 'Stable pollination performance';
    }

    // Correlation analysis
    const correlations = this.calculateEnvironmentalCorrelations(recentData);

    // Improvement recommendations
    const improvementRecommendations = this.generateImprovementRecommendations(
      averageSetPercentage,
      correlations,
      recentData
    );

    return {
      averageSetPercentage,
      trendAnalysis,
      correlations,
      improvementRecommendations
    };
  }

  /**
   * Calculate correlations between environmental factors and pollination success
   */
  private static calculateEnvironmentalCorrelations(data: PollinationHistoryData[]): 
    { factor: string; correlation: number }[] {
    const correlations: { factor: string; correlation: number }[] = [];

    // Temperature correlation
    const tempCorr = this.calculateCorrelation(
      data.map(d => d.environmentalConditions.temperature),
      data.map(d => d.setPercentage)
    );
    correlations.push({ factor: 'Temperature', correlation: tempCorr });

    // Humidity correlation
    const humidityCorr = this.calculateCorrelation(
      data.map(d => d.environmentalConditions.humidity),
      data.map(d => d.setPercentage)
    );
    correlations.push({ factor: 'Humidity', correlation: humidityCorr });

    // Air movement correlation
    const airCorr = this.calculateCorrelation(
      data.map(d => d.environmentalConditions.airMovement),
      data.map(d => d.setPercentage)
    );
    correlations.push({ factor: 'Air Movement', correlation: airCorr });

    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Generate improvement recommendations based on historical analysis
   */
  private static generateImprovementRecommendations(
    averageSetPercentage: number,
    correlations: { factor: string; correlation: number }[],
    recentData: PollinationHistoryData[]
  ): string[] {
    const recommendations: string[] = [];

    if (averageSetPercentage < this.MIN_SET_PERCENTAGE) {
      recommendations.push('Overall pollination success below target (85%)');
      
      // Identify strongest negative correlations
      const strongestNegative = correlations.find(c => c.correlation < -0.5);
      if (strongestNegative) {
        recommendations.push(`Strong negative correlation with ${strongestNegative.factor} - focus optimization here`);
      }
    }

    // Quality issues
    const poorQualityCount = recentData.filter(d => 
      d.fruitQuality === 'poor' || d.fruitQuality === 'deformed'
    ).length;
    
    if (poorQualityCount > recentData.length * 0.3) {
      recommendations.push('High rate of poor quality fruit - check temperature stress and plant balance');
    }

    // Specific factor recommendations
    correlations.forEach(corr => {
      if (Math.abs(corr.correlation) > 0.6) {
        if (corr.correlation < 0) {
          recommendations.push(`${corr.factor} negatively impacts pollination - optimize this factor`);
        } else {
          recommendations.push(`${corr.factor} positively impacts pollination - maintain current levels`);
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Pollination performance is satisfactory - continue current management');
    }

    return recommendations;
  }
}