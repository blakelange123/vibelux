/**
 * Smart Optimization Algorithms
 * Practical energy savings without heavy ML dependencies
 */

import { prisma } from '@/lib/prisma';

interface OptimizationResult {
  intensity: number;
  savingsPercent: number;
  savingsDollars: number;
  confidence: number;
  strategy: string;
  reasoning: string[];
}

interface HistoricalPattern {
  hourlyAverages: number[];
  peakDemandHours: number[];
  temperatureResponse: Map<number, number>;
  savingsAchieved: number[];
}

export class SmartOptimizationAlgorithms {
  private static instance: SmartOptimizationAlgorithms;
  
  // Learning parameters (updated as system runs)
  private learningParams = {
    temperatureCoefficient: -0.5,     // % reduction per degree above optimal
    peakDemandMultiplier: 1.15,      // How aggressive during peak
    dliSafetyMargin: 0.95,            // Stay within 95% of target DLI
    rampDownMinutes: 20,              // Minutes before peak to start ramping
    adaptiveBaseline: new Map()       // Per-zone learned baselines
  };
  
  // Historical patterns for each zone
  private historicalPatterns: Map<string, HistoricalPattern> = new Map();
  
  // Real-time performance tracking
  private performanceMetrics = {
    totalSavingsAchieved: 0,
    averageAccuracy: 0,
    successfulOptimizations: 0,
    totalOptimizations: 0
  };

  private constructor() {}

  static getInstance(): SmartOptimizationAlgorithms {
    if (!SmartOptimizationAlgorithms.instance) {
      SmartOptimizationAlgorithms.instance = new SmartOptimizationAlgorithms();
    }
    return SmartOptimizationAlgorithms.instance;
  }

  /**
   * Main optimization algorithm
   */
  async optimizeZone(
    zoneId: string,
    currentState: {
      intensity: number;
      temperature: number;
      humidity: number;
      co2Level: number;
      currentDLI: number;
      targetDLI: number;
      cropType: string;
      growthStage: string;
      electricityRate: number;
      isPeakHour: boolean;
    }
  ): Promise<OptimizationResult> {
    const reasoning: string[] = [];
    let optimalIntensity = currentState.intensity;
    let strategy = 'none';
    
    // 1. Adaptive Baseline Learning
    const baseline = await this.getAdaptiveBaseline(zoneId, currentState);
    reasoning.push(`Adaptive baseline: ${baseline.toFixed(1)}% (learned from ${baseline.dataPoints} samples)`);
    
    // 2. DLI Protection Algorithm
    const dliProtection = this.calculateDLIProtection(currentState);
    if (dliProtection.needsAdjustment) {
      optimalIntensity = Math.max(optimalIntensity, dliProtection.minIntensity);
      reasoning.push(`DLI protection: min ${dliProtection.minIntensity}% to achieve ${currentState.targetDLI} mol/m²/d`);
      strategy = 'dli_protection';
    }
    
    // 3. Peak Demand Response
    if (currentState.isPeakHour) {
      const peakResponse = await this.calculatePeakDemandResponse(
        zoneId,
        currentState,
        optimalIntensity
      );
      
      if (peakResponse.canReduce) {
        optimalIntensity = peakResponse.intensity;
        reasoning.push(`Peak demand: reducing to ${peakResponse.intensity}% (saves $${peakResponse.savings.toFixed(2)}/hr)`);
        strategy = 'peak_shaving';
      }
    }
    
    // 4. Temperature Compensation
    const tempCompensation = this.calculateTemperatureCompensation(
      currentState.temperature,
      currentState.cropType,
      currentState.growthStage
    );
    
    if (tempCompensation.adjust) {
      optimalIntensity *= tempCompensation.factor;
      reasoning.push(`Temperature: ${tempCompensation.reason} (${(tempCompensation.factor * 100).toFixed(0)}% adjustment)`);
      if (strategy === 'none') strategy = 'temperature';
    }
    
    // 5. Predictive Ramp Down
    const rampDown = await this.predictiveRampDown(zoneId, currentState);
    if (rampDown.shouldRamp) {
      optimalIntensity = Math.min(optimalIntensity, rampDown.intensity);
      reasoning.push(`Predictive ramp: reducing to ${rampDown.intensity}% (${rampDown.minutesUntilPeak} min before peak)`);
      strategy = 'predictive';
    }
    
    // 6. Cannabis Flowering Protection (Override all)
    if (currentState.cropType === 'cannabis' && currentState.growthStage === 'flowering') {
      const hour = new Date().getHours();
      if (hour >= 8 && hour < 20) {
        // During light period - allow dimming but maintain photoperiod
        optimalIntensity = Math.max(85, optimalIntensity); // Never below 85% for flowering
        reasoning.push('Cannabis flowering: maintaining 12/12 photoperiod, min 85% intensity');
      }
    }
    
    // 7. Calculate actual savings
    const savingsCalc = this.calculateSavings(
      currentState.intensity,
      optimalIntensity,
      currentState.electricityRate,
      baseline
    );
    
    // 8. Confidence calculation based on historical performance
    const confidence = await this.calculateConfidence(zoneId, strategy, savingsCalc.percent);
    
    reasoning.push(`Final optimization: ${optimalIntensity.toFixed(0)}% (${savingsCalc.percent.toFixed(1)}% reduction)`);
    
    // Update learning parameters based on results
    this.updateLearningParameters(zoneId, currentState, optimalIntensity);
    
    return {
      intensity: Math.round(optimalIntensity),
      savingsPercent: savingsCalc.percent,
      savingsDollars: savingsCalc.dollars,
      confidence,
      strategy,
      reasoning
    };
  }

  /**
   * Adaptive baseline learning
   */
  private async getAdaptiveBaseline(zoneId: string, currentState: any): Promise<any> {
    // Get historical data for this hour
    const hour = new Date().getHours();
    const historicalData = await prisma.power_readings.findMany({
      where: {
        zone_id: zoneId,
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        power_kw: true,
        timestamp: true
      }
    });
    
    // Calculate adaptive baseline for this hour
    const hourlyData = historicalData.filter(d => 
      new Date(d.timestamp).getHours() === hour
    );
    
    if (hourlyData.length < 5) {
      // Not enough data, use simple baseline
      return { 
        intensity: 100, 
        dataPoints: hourlyData.length,
        confidence: 0.5 
      };
    }
    
    // Calculate weighted average (recent data weighted more)
    let weightedSum = 0;
    let weightSum = 0;
    
    hourlyData.forEach((data, index) => {
      const age = Date.now() - new Date(data.timestamp).getTime();
      const weight = Math.exp(-age / (7 * 24 * 60 * 60 * 1000)); // Decay over 7 days
      weightedSum += data.power_kw * weight;
      weightSum += weight;
    });
    
    const adaptiveBaseline = (weightedSum / weightSum) / currentState.maxPower * 100;
    
    return {
      intensity: adaptiveBaseline,
      dataPoints: hourlyData.length,
      confidence: Math.min(1, hourlyData.length / 20)
    };
  }

  /**
   * DLI protection algorithm
   */
  private calculateDLIProtection(currentState: any): {
    needsAdjustment: boolean;
    minIntensity: number;
  } {
    const hoursRemaining = 24 - new Date().getHours();
    const currentDLIRate = currentState.currentDLI / new Date().getHours();
    const projectedDLI = currentDLIRate * 24;
    
    if (projectedDLI < currentState.targetDLI * this.learningParams.dliSafetyMargin) {
      // Need to increase intensity to meet DLI target
      const dliDeficit = currentState.targetDLI - projectedDLI;
      const requiredIncrease = (dliDeficit / hoursRemaining) / currentDLIRate;
      const minIntensity = currentState.intensity * (1 + requiredIncrease);
      
      return {
        needsAdjustment: true,
        minIntensity: Math.min(100, minIntensity)
      };
    }
    
    return {
      needsAdjustment: false,
      minIntensity: currentState.intensity
    };
  }

  /**
   * Peak demand response calculation
   */
  private async calculatePeakDemandResponse(
    zoneId: string,
    currentState: any,
    currentIntensity: number
  ): Promise<{
    canReduce: boolean;
    intensity: number;
    savings: number;
  }> {
    // Get historical peak performance
    const pattern = this.historicalPatterns.get(zoneId);
    
    // Base reduction: 15%
    let reduction = 15;
    
    // Adjust based on historical success
    if (pattern && pattern.savingsAchieved.length > 0) {
      const avgSavings = pattern.savingsAchieved.reduce((a, b) => a + b, 0) / pattern.savingsAchieved.length;
      if (avgSavings > 20) {
        reduction = 20; // Can be more aggressive
      } else if (avgSavings < 10) {
        reduction = 10; // Be more conservative
      }
    }
    
    // Apply learning multiplier
    reduction *= this.learningParams.peakDemandMultiplier;
    
    const newIntensity = currentIntensity * (1 - reduction / 100);
    const powerReduction = currentState.maxPower * (reduction / 100);
    const savings = powerReduction * currentState.electricityRate;
    
    return {
      canReduce: newIntensity >= 70, // Never go below 70%
      intensity: Math.max(70, newIntensity),
      savings
    };
  }

  /**
   * Temperature compensation algorithm
   */
  private calculateTemperatureCompensation(
    temperature: number,
    cropType: string,
    growthStage: string
  ): {
    adjust: boolean;
    factor: number;
    reason: string;
  } {
    const optimalTemp = {
      cannabis: { vegetative: 25, flowering: 24 },
      tomato: { vegetative: 24, flowering: 22 },
      lettuce: { vegetative: 20, flowering: 20 },
      strawberry: { vegetative: 22, flowering: 20 }
    };
    
    const optimal = optimalTemp[cropType]?.[growthStage] || 24;
    const deviation = temperature - optimal;
    
    if (Math.abs(deviation) < 2) {
      return { adjust: false, factor: 1, reason: 'Temperature optimal' };
    }
    
    if (deviation > 0) {
      // Too hot - reduce intensity
      const factor = 1 + (this.learningParams.temperatureCoefficient * deviation / 10);
      return {
        adjust: true,
        factor: Math.max(0.8, factor), // Max 20% reduction
        reason: `${temperature}°C is ${deviation.toFixed(1)}° above optimal`
      };
    } else {
      // Too cold - increase intensity slightly
      const factor = 1 + (Math.abs(deviation) / 20); // Less aggressive increase
      return {
        adjust: true,
        factor: Math.min(1.1, factor), // Max 10% increase
        reason: `${temperature}°C is ${Math.abs(deviation).toFixed(1)}° below optimal`
      };
    }
  }

  /**
   * Predictive ramp down before peak hours
   */
  private async predictiveRampDown(
    zoneId: string,
    currentState: any
  ): Promise<{
    shouldRamp: boolean;
    intensity: number;
    minutesUntilPeak: number;
  }> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Peak hours typically 14:00-19:00
    const peakStart = 14;
    const minutesUntilPeak = (peakStart - currentHour) * 60 - currentMinute;
    
    if (minutesUntilPeak > 0 && minutesUntilPeak <= this.learningParams.rampDownMinutes) {
      // Start ramping down
      const rampProgress = (this.learningParams.rampDownMinutes - minutesUntilPeak) / this.learningParams.rampDownMinutes;
      const targetReduction = 15; // 15% reduction at peak
      const currentReduction = targetReduction * rampProgress;
      
      return {
        shouldRamp: true,
        intensity: currentState.intensity * (1 - currentReduction / 100),
        minutesUntilPeak
      };
    }
    
    return {
      shouldRamp: false,
      intensity: currentState.intensity,
      minutesUntilPeak: minutesUntilPeak > 0 ? minutesUntilPeak : 0
    };
  }

  /**
   * Calculate actual savings
   */
  private calculateSavings(
    currentIntensity: number,
    optimalIntensity: number,
    electricityRate: number,
    baseline: any
  ): {
    percent: number;
    dollars: number;
  } {
    const reduction = (currentIntensity - optimalIntensity) / currentIntensity;
    const percentSavings = reduction * 100;
    
    // Use baseline for more accurate calculation
    const baselinePower = baseline.intensity / 100;
    const dollarSavings = baselinePower * reduction * electricityRate;
    
    return {
      percent: percentSavings,
      dollars: dollarSavings
    };
  }

  /**
   * Calculate confidence based on historical performance
   */
  private async calculateConfidence(
    zoneId: string,
    strategy: string,
    projectedSavings: number
  ): Promise<number> {
    let confidence = 70; // Base confidence
    
    // Check historical accuracy
    const recentOptimizations = await prisma.optimization_events.findMany({
      where: {
        zone_id: zoneId,
        event_time: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: { event_time: 'desc' },
      take: 20
    });
    
    if (recentOptimizations.length > 5) {
      // Calculate accuracy of predictions
      let accuracySum = 0;
      recentOptimizations.forEach(opt => {
        const predicted = opt.action_value?.projectedSavings || 0;
        const actual = opt.power_saved_kw || 0;
        const accuracy = 1 - Math.abs(predicted - actual) / Math.max(predicted, actual);
        accuracySum += accuracy;
      });
      
      const avgAccuracy = accuracySum / recentOptimizations.length;
      confidence = 50 + (avgAccuracy * 50); // 50-100% based on accuracy
    }
    
    // Adjust for strategy
    const strategyConfidence = {
      dli_protection: 0.9,
      peak_shaving: 0.85,
      temperature: 0.8,
      predictive: 0.75,
      none: 0.6
    };
    
    confidence *= strategyConfidence[strategy] || 0.7;
    
    // Adjust for savings magnitude
    if (projectedSavings > 25) {
      confidence *= 0.9; // Less confident in large savings
    }
    
    return Math.round(confidence);
  }

  /**
   * Update learning parameters based on results
   */
  private updateLearningParameters(
    zoneId: string,
    currentState: any,
    optimalIntensity: number
  ) {
    // Store pattern for future use
    if (!this.historicalPatterns.has(zoneId)) {
      this.historicalPatterns.set(zoneId, {
        hourlyAverages: new Array(24).fill(100),
        peakDemandHours: [],
        temperatureResponse: new Map(),
        savingsAchieved: []
      });
    }
    
    const pattern = this.historicalPatterns.get(zoneId)!;
    const hour = new Date().getHours();
    
    // Update hourly average (exponential moving average)
    pattern.hourlyAverages[hour] = pattern.hourlyAverages[hour] * 0.9 + optimalIntensity * 0.1;
    
    // Track temperature response
    const tempKey = Math.round(currentState.temperature);
    const currentResponse = pattern.temperatureResponse.get(tempKey) || [];
    currentResponse.push(optimalIntensity);
    if (currentResponse.length > 10) currentResponse.shift(); // Keep last 10
    pattern.temperatureResponse.set(tempKey, currentResponse);
    
    // Update performance metrics
    this.performanceMetrics.totalOptimizations++;
  }

  /**
   * Get optimization statistics
   */
  getPerformanceStats() {
    return {
      ...this.performanceMetrics,
      averageAccuracy: this.performanceMetrics.successfulOptimizations / 
        Math.max(1, this.performanceMetrics.totalOptimizations) * 100,
      learningProgress: Math.min(100, this.performanceMetrics.totalOptimizations / 100 * 100)
    };
  }

  /**
   * Manual parameter tuning (for admin interface)
   */
  tuneLearningParameters(params: Partial<typeof this.learningParams>) {
    this.learningParams = { ...this.learningParams, ...params };
  }
}

// Export singleton
export const smartOptimizationAlgorithms = SmartOptimizationAlgorithms.getInstance();