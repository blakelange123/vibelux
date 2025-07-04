/**
 * Light-Based Irrigation Calculator
 * Based on Advanced Dutch Research drain percentage targets
 */

export interface IrrigationCalculationResult {
  irrigationVolume: number; // mL per plant
  drainTarget: number; // %
  ecTarget: number; // mS/cm
  numberOfIrrigations: number;
  timingRecommendations: string[];
  warnings: string[];
}

export interface IrrigationParameters {
  dailyLightIntegral: number; // J/cm²
  currentEC: number; // mS/cm in slab
  substrateType: 'rockwool' | 'coco' | 'perlite';
  plantStage: 'propagation' | 'vegetative' | 'flowering' | 'fruiting';
  timeOfDay: 'morning' | 'midday' | 'afternoon' | 'evening';
  lastIrrigationHours: number;
  currentDrainPercentage: number;
  slabWaterContent: number; // %
  plantSize: 'small' | 'medium' | 'large';
}

export class LightBasedIrrigationCalculator {
  // Drain targets based on daily light integral (from Advanced Dutch Research)
  static readonly DRAIN_TARGETS = [
    { maxLight: 500, minDrain: 0, maxDrain: 10 },
    { maxLight: 1000, minDrain: 10, maxDrain: 20 },
    { maxLight: 1500, minDrain: 20, maxDrain: 30 },
    { maxLight: Infinity, minDrain: 30, maxDrain: 40 }
  ];

  // EC targets by stage
  static readonly EC_TARGETS = {
    propagation: { min: 10, max: 16 }, // In propagation blocks
    vegetative: { min: 3.0, max: 4.0 }, // Slab filling
    flowering: { min: 3.0, max: 4.5 },  // Production
    fruiting: { min: 3.5, max: 5.0 }    // Higher EC for fruit quality
  };

  // Base irrigation volumes (mL per irrigation)
  static readonly BASE_VOLUMES = {
    small: { rockwool: 80, coco: 60, perlite: 50 },
    medium: { rockwool: 120, coco: 100, perlite: 80 },
    large: { rockwool: 150, coco: 130, perlite: 100 }
  };

  /**
   * Calculate drain target based on daily light integral
   */
  static getDrainTarget(dailyLight: number): { min: number; max: number } {
    const target = this.DRAIN_TARGETS.find(t => dailyLight <= t.maxLight);
    return {
      min: target?.minDrain || 30,
      max: target?.maxDrain || 40
    };
  }

  /**
   * Calculate irrigation volume per plant
   */
  static calculateIrrigationVolume(
    params: IrrigationParameters
  ): number {
    const baseVolume = this.BASE_VOLUMES[params.plantSize][params.substrateType];
    
    // Adjust based on current drain percentage
    let volumeAdjustment = 1.0;
    const drainTarget = this.getDrainTarget(params.dailyLightIntegral);
    
    if (params.currentDrainPercentage < drainTarget.min) {
      // Too little drain - reduce volume
      volumeAdjustment = 0.8;
    } else if (params.currentDrainPercentage > drainTarget.max) {
      // Too much drain - increase volume
      volumeAdjustment = 1.2;
    }
    
    // Adjust for EC
    const ecTarget = this.EC_TARGETS[params.plantStage];
    if (params.currentEC > ecTarget.max) {
      // EC too high - increase volume to flush
      volumeAdjustment *= 1.15;
    } else if (params.currentEC < ecTarget.min) {
      // EC too low - reduce volume
      volumeAdjustment *= 0.9;
    }
    
    // Time of day adjustment
    const timeAdjustments = {
      morning: 1.2,  // First irrigation larger
      midday: 1.0,
      afternoon: 0.9,
      evening: 0.8   // Smaller volumes before night
    };
    
    volumeAdjustment *= timeAdjustments[params.timeOfDay];
    
    return Math.round(baseVolume * volumeAdjustment);
  }

  /**
   * Calculate number of irrigations needed
   */
  static calculateIrrigationFrequency(
    dailyLight: number,
    plantSize: 'small' | 'medium' | 'large'
  ): number {
    // Base frequency on light accumulation
    const irrigationsPerLight = dailyLight / 100; // One irrigation per 100 J
    
    // Adjust for plant size
    const sizeMultiplier = {
      small: 0.8,
      medium: 1.0,
      large: 1.2
    };
    
    return Math.max(3, Math.round(irrigationsPerLight * sizeMultiplier[plantSize]));
  }

  /**
   * Generate timing recommendations
   */
  static generateTimingRecommendations(
    params: IrrigationParameters,
    numberOfIrrigations: number
  ): string[] {
    const recommendations: string[] = [];
    
    // First irrigation timing
    recommendations.push('First irrigation: 2 hours after sunrise');
    
    // Distribution throughout the day
    if (numberOfIrrigations <= 4) {
      recommendations.push('Space irrigations every 3-4 hours');
    } else if (numberOfIrrigations <= 8) {
      recommendations.push('Space irrigations every 1.5-2 hours during peak light');
    } else {
      recommendations.push('Frequent small irrigations every 45-60 minutes');
    }
    
    // Last irrigation
    recommendations.push('Last irrigation: 2-3 hours before sunset');
    
    // Night dry-down
    recommendations.push('Target 1-2% substrate dry-down overnight');
    
    // Light-based triggers
    if (params.dailyLightIntegral > 1000) {
      recommendations.push('Consider light sum triggers: irrigate every 100 J/cm²');
    }
    
    return recommendations;
  }

  /**
   * Generate warnings based on current conditions
   */
  static generateWarnings(params: IrrigationParameters): string[] {
    const warnings: string[] = [];
    
    // Check slab water content
    if (params.slabWaterContent < 60) {
      warnings.push('⚠️ Low slab water content - increase irrigation frequency');
    } else if (params.slabWaterContent > 85) {
      warnings.push('⚠️ High slab water content - risk of root problems');
    }
    
    // Check EC drift
    const ecTarget = this.EC_TARGETS[params.plantStage];
    if (params.currentEC > ecTarget.max + 0.5) {
      warnings.push('⚠️ EC too high - flush with larger irrigation volumes');
    }
    
    // Check drain percentage
    const drainTarget = this.getDrainTarget(params.dailyLightIntegral);
    if (params.currentDrainPercentage < drainTarget.min - 5) {
      warnings.push('⚠️ Insufficient drain - increase irrigation volume or frequency');
    }
    
    // Time since last irrigation
    if (params.lastIrrigationHours > 4 && params.timeOfDay !== 'evening') {
      warnings.push('⚠️ Long gap since last irrigation - plants may be stressed');
    }
    
    return warnings;
  }

  /**
   * Main calculation method
   */
  static calculate(params: IrrigationParameters): IrrigationCalculationResult {
    const irrigationVolume = this.calculateIrrigationVolume(params);
    const drainTarget = this.getDrainTarget(params.dailyLightIntegral);
    const ecTarget = this.EC_TARGETS[params.plantStage];
    const numberOfIrrigations = this.calculateIrrigationFrequency(
      params.dailyLightIntegral,
      params.plantSize
    );
    const timingRecommendations = this.generateTimingRecommendations(
      params,
      numberOfIrrigations
    );
    const warnings = this.generateWarnings(params);
    
    return {
      irrigationVolume,
      drainTarget: (drainTarget.min + drainTarget.max) / 2,
      ecTarget: (ecTarget.min + ecTarget.max) / 2,
      numberOfIrrigations,
      timingRecommendations,
      warnings
    };
  }

  /**
   * Calculate daily irrigation schedule
   */
  static generateDailySchedule(
    params: Omit<IrrigationParameters, 'timeOfDay' | 'lastIrrigationHours'>,
    sunrise: Date,
    sunset: Date
  ) {
    const schedule = [];
    const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60); // hours
    const numberOfIrrigations = this.calculateIrrigationFrequency(
      params.dailyLightIntegral,
      params.plantSize
    );
    
    // First irrigation 2 hours after sunrise
    const firstIrrigation = new Date(sunrise.getTime() + 2 * 60 * 60 * 1000);
    
    // Last irrigation 2.5 hours before sunset
    const lastIrrigation = new Date(sunset.getTime() - 2.5 * 60 * 60 * 1000);
    
    // Calculate interval
    const irrigationWindow = lastIrrigation.getTime() - firstIrrigation.getTime();
    const interval = irrigationWindow / (numberOfIrrigations - 1);
    
    for (let i = 0; i < numberOfIrrigations; i++) {
      const time = new Date(firstIrrigation.getTime() + i * interval);
      const timeOfDay = this.getTimeOfDay(time, sunrise, sunset);
      
      const volume = this.calculateIrrigationVolume({
        ...params,
        timeOfDay,
        lastIrrigationHours: i === 0 ? 12 : interval / (1000 * 60 * 60)
      });
      
      schedule.push({
        time,
        volume,
        lightSum: Math.round((params.dailyLightIntegral / numberOfIrrigations) * (i + 1)),
        expectedDrain: Math.round(volume * 0.01 * this.getDrainTarget(params.dailyLightIntegral).min)
      });
    }
    
    return schedule;
  }

  /**
   * Helper to determine time of day
   */
  private static getTimeOfDay(
    time: Date,
    sunrise: Date,
    sunset: Date
  ): IrrigationParameters['timeOfDay'] {
    const dayLength = sunset.getTime() - sunrise.getTime();
    const timeSinceSunrise = time.getTime() - sunrise.getTime();
    const percentOfDay = timeSinceSunrise / dayLength;
    
    if (percentOfDay < 0.25) return 'morning';
    if (percentOfDay < 0.5) return 'midday';
    if (percentOfDay < 0.75) return 'afternoon';
    return 'evening';
  }

  /**
   * EC management strategy
   */
  static getECManagementStrategy(
    currentEC: number,
    targetEC: number,
    stage: IrrigationParameters['plantStage']
  ) {
    const difference = currentEC - targetEC;
    
    if (Math.abs(difference) < 0.3) {
      return {
        strategy: 'maintain',
        action: 'Continue current irrigation EC',
        adjustment: 0
      };
    }
    
    if (difference > 0) {
      // EC too high
      return {
        strategy: 'flush',
        action: 'Reduce irrigation EC and increase volume',
        adjustment: -0.5,
        volumeIncrease: 20 // %
      };
    } else {
      // EC too low
      return {
        strategy: 'increase',
        action: 'Increase irrigation EC gradually',
        adjustment: 0.3,
        volumeDecrease: 10 // %
      };
    }
  }
}