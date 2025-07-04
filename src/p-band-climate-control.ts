/**
 * Tomato P-Band Climate Control System
 * Advanced temperature control based on Advanced Dutch Research tomato strategies
 * CROP-SPECIFIC: Optimized for tomato cultivation only
 */

export interface PBandConfiguration {
  pBandSize: 'small' | 'medium' | 'large';
  temperatureTarget: number; // °C
  outsideTemperature: number; // °C
  windSpeed: number; // m/s
  radiationLevel: number; // W/m²
  timeOfDay: 'night' | 'morning' | 'day' | 'evening';
  seasonalMode: 'winter' | 'spring' | 'summer' | 'fall';
}

export interface ClimateControlResult {
  ventilationPercentage: number; // 0-100%
  fanSpeed: number; // 0-100%
  heatingRequired: boolean;
  coolingMode: 'recirculation' | 'ventilation' | 'pad-cooling';
  guillotineDoorPosition: number; // 0-100%
  expectedTemperature: number; // °C
  controlStrategy: string;
  warnings: string[];
}

export interface TemperatureZoneAnalysis {
  cropLevel: number; // °C
  oneMeterAbove: number; // °C
  greenhouseTop: number; // °C
  temperatureGradient: number; // °C difference top to bottom
  hotSpots: HotSpotData[];
  uniformityScore: number; // 0-100%
}

export interface HotSpotData {
  location: string;
  temperature: number;
  severity: 'mild' | 'moderate' | 'severe';
  cause: string;
  mitigation: string;
}

export interface MomentumAnalysis {
  detected: boolean;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  affectedZones: string[];
  recommendedAction: string;
  fanSpeedAdjustment: number; // %
}

export class PBandClimateControl {
  // Critical thresholds from Advanced Dutch Research - TOMATO SPECIFIC
  static readonly CROP_TYPE = 'tomato';
  static readonly MAX_CROP_TEMPERATURE = 30; // °C - tomato tolerance limit
  static readonly MIN_CROP_TEMPERATURE = 13; // °C - tomato minimum
  static readonly OPTIMAL_AVERAGE_TEMPERATURE = 23; // °C - tomato optimal
  static readonly MAX_ZONE_DIFFERENTIAL = 6; // °C
  static readonly MOMENTUM_THRESHOLD = 3; // °C above outside temp
  static readonly RADIATION_MODE_SWITCH = 300; // W/m² threshold
  
  // Light-based temperature targets from Advanced Dutch Research (tomato-specific)
  static readonly LIGHT_TEMP_TARGETS = {
    low: { light: 1000, temp: 18 },      // Light<1000 = 18°C
    medium: { light: 1500, temp: 19 },   // Light<1500 = 19°C
    high: { light: 2000, temp: 20 },     // Light<2000 = 20°C
    veryHigh: { light: 2000, temp: 21 }  // Light>2000 = 21°C+
  };

  /**
   * Calculate optimal temperature based on light level (tomato-specific)
   */
  static calculateOptimalTemperatureForLight(lightLevel: number): number {
    if (lightLevel < this.LIGHT_TEMP_TARGETS.low.light) {
      return this.LIGHT_TEMP_TARGETS.low.temp;
    } else if (lightLevel < this.LIGHT_TEMP_TARGETS.medium.light) {
      return this.LIGHT_TEMP_TARGETS.medium.temp;
    } else if (lightLevel < this.LIGHT_TEMP_TARGETS.high.light) {
      return this.LIGHT_TEMP_TARGETS.high.temp;
    } else {
      return this.LIGHT_TEMP_TARGETS.veryHigh.temp;
    }
  }

  /**
   * Calculate P-band control strategy
   */
  static calculatePBandControl(config: PBandConfiguration): ClimateControlResult {
    const {
      pBandSize,
      temperatureTarget,
      outsideTemperature,
      windSpeed,
      radiationLevel,
      timeOfDay,
      seasonalMode
    } = config;

    // Determine control aggressiveness based on P-band size
    const controlSensitivity = this.getPBandSensitivity(pBandSize);
    
    // Calculate temperature differential
    const tempDifferential = temperatureTarget - outsideTemperature;
    
    // Determine operating mode
    const coolingMode = this.determineCoolingMode(radiationLevel, outsideTemperature, tempDifferential);
    
    // Calculate ventilation and fan settings
    const { ventilationPercentage, fanSpeed } = this.calculateVentilationSettings(
      tempDifferential,
      controlSensitivity,
      windSpeed,
      coolingMode
    );
    
    // Determine guillotine door position
    const guillotineDoorPosition = this.calculateGuillotinePosition(
      coolingMode,
      windSpeed,
      tempDifferential
    );
    
    // Check for heating requirement
    const heatingRequired = this.checkHeatingRequirement(
      outsideTemperature,
      temperatureTarget,
      timeOfDay,
      seasonalMode
    );
    
    // Calculate expected temperature
    const expectedTemperature = this.estimateResultingTemperature(
      outsideTemperature,
      ventilationPercentage,
      fanSpeed,
      heatingRequired,
      coolingMode
    );
    
    // Generate control strategy description
    const controlStrategy = this.generateControlStrategy(
      pBandSize,
      coolingMode,
      tempDifferential
    );
    
    // Generate warnings
    const warnings = this.generateWarnings(config, expectedTemperature);
    
    return {
      ventilationPercentage,
      fanSpeed,
      heatingRequired,
      coolingMode,
      guillotineDoorPosition,
      expectedTemperature,
      controlStrategy,
      warnings
    };
  }

  /**
   * Analyze temperature zones and detect problems
   */
  static analyzeTemperatureZones(
    cropLevelTemp: number,
    measurementTemp: number,
    topTemp: number
  ): TemperatureZoneAnalysis {
    const temperatureGradient = topTemp - cropLevelTemp;
    
    // Detect hot spots
    const hotSpots: HotSpotData[] = [];
    
    if (topTemp > 45) {
      hotSpots.push({
        location: 'Greenhouse roof area',
        temperature: topTemp,
        severity: topTemp > 55 ? 'severe' : 'moderate',
        cause: 'Excessive solar radiation or poor ventilation',
        mitigation: 'Increase roof ventilation, check shading systems'
      });
    }
    
    if (temperatureGradient > 15) {
      hotSpots.push({
        location: 'Upper greenhouse zone',
        temperature: topTemp,
        severity: 'moderate',
        cause: 'Poor air circulation or stratification',
        mitigation: 'Adjust fan speeds, improve air mixing'
      });
    }
    
    if (Math.abs(measurementTemp - cropLevelTemp) > 3) {
      hotSpots.push({
        location: 'Measurement vs crop level',
        temperature: measurementTemp,
        severity: 'mild',
        cause: 'Temperature sensor positioning issue',
        mitigation: 'Verify sensor placement at 1m above crop'
      });
    }
    
    // Calculate uniformity score
    const uniformityScore = Math.max(0, 100 - (temperatureGradient * 5));
    
    return {
      cropLevel: cropLevelTemp,
      oneMeterAbove: measurementTemp,
      greenhouseTop: topTemp,
      temperatureGradient,
      hotSpots,
      uniformityScore
    };
  }

  /**
   * Detect and analyze momentum effects
   */
  static analyzeMomentum(
    insideTemperature: number,
    outsideTemperature: number,
    fanSpeed: number,
    windDirection: 'favorable' | 'adverse' | 'neutral'
  ): MomentumAnalysis {
    const tempDifferential = insideTemperature - outsideTemperature;
    
    // Check for momentum conditions
    const momentumDetected = tempDifferential > this.MOMENTUM_THRESHOLD && fanSpeed > 50;
    
    let riskLevel: MomentumAnalysis['riskLevel'] = 'none';
    let recommendedAction = 'Continue current operation';
    let fanSpeedAdjustment = 0;
    
    if (momentumDetected) {
      if (tempDifferential > 6) {
        riskLevel = 'high';
        recommendedAction = 'STOP fans immediately - hot air circulation detected';
        fanSpeedAdjustment = -100; // Stop fans
      } else if (tempDifferential > 4) {
        riskLevel = 'medium';
        recommendedAction = 'Reduce fan speed by 50% - monitor temperature';
        fanSpeedAdjustment = -50;
      } else {
        riskLevel = 'low';
        recommendedAction = 'Reduce fan speed by 25% - watch for improvement';
        fanSpeedAdjustment = -25;
      }
    }
    
    // Adjust for wind direction
    if (windDirection === 'adverse' && riskLevel !== 'none') {
      fanSpeedAdjustment -= 10; // Additional reduction for adverse wind
    }
    
    const affectedZones = momentumDetected ? 
      ['Crop level area', 'Plant canopy', 'Growing points'] : [];
    
    return {
      detected: momentumDetected,
      riskLevel,
      affectedZones,
      recommendedAction,
      fanSpeedAdjustment
    };
  }

  /**
   * Generate 24-hour climate strategy
   */
  static generate24HourStrategy(
    outsideTemperatures: number[], // 24 hourly values
    radiationForecast: number[],   // 24 hourly values
    targetTemp: number
  ) {
    const strategy = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const outsideTemp = outsideTemperatures[hour];
      const radiation = radiationForecast[hour];
      const timeOfDay = this.getTimeOfDay(hour);
      
      // Adjust target based on time and radiation
      let adjustedTarget = targetTemp;
      if (hour >= 6 && hour <= 18 && radiation > 200) {
        adjustedTarget += 1; // Day temperature boost
      } else if (hour >= 22 || hour <= 5) {
        adjustedTarget -= 2; // Night temperature reduction
      }
      
      const config: PBandConfiguration = {
        pBandSize: radiation > 400 ? 'small' : 'large', // Quick response in high light
        temperatureTarget: adjustedTarget,
        outsideTemperature: outsideTemp,
        windSpeed: 3, // Average assumption
        radiationLevel: radiation,
        timeOfDay,
        seasonalMode: 'summer' // Can be parameterized
      };
      
      const control = this.calculatePBandControl(config);
      
      strategy.push({
        hour,
        outsideTemp,
        radiation,
        targetTemp: adjustedTarget,
        ...control
      });
    }
    
    return strategy;
  }

  /**
   * Helper methods
   */
  private static getPBandSensitivity(pBandSize: string): number {
    const sensitivities = {
      small: 0.5,  // Quick, aggressive response
      medium: 1.0, // Balanced response
      large: 2.0   // Patient, gradual response
    };
    return sensitivities[pBandSize] || 1.0;
  }

  private static determineCoolingMode(
    radiation: number,
    outsideTemp: number,
    tempDifferential: number
  ): ClimateControlResult['coolingMode'] {
    if (radiation < this.RADIATION_MODE_SWITCH) {
      return 'recirculation';
    } else if (outsideTemp > 35 || tempDifferential > 8) {
      return 'pad-cooling';
    } else {
      return 'ventilation';
    }
  }

  private static calculateVentilationSettings(
    tempDifferential: number,
    sensitivity: number,
    windSpeed: number,
    coolingMode: string
  ): { ventilationPercentage: number; fanSpeed: number } {
    let baseVentilation = 0;
    let baseFanSpeed = 0;
    
    if (coolingMode === 'recirculation') {
      // Minimal ventilation, focus on air circulation
      baseVentilation = Math.min(20, Math.max(5, tempDifferential * 2));
      baseFanSpeed = 30; // Minimum for air movement
    } else if (coolingMode === 'ventilation') {
      // Proportional response based on temperature differential
      baseVentilation = Math.min(80, Math.max(20, tempDifferential * 8 / sensitivity));
      baseFanSpeed = Math.min(70, Math.max(30, tempDifferential * 10 / sensitivity));
    } else { // pad-cooling
      // Maximum cooling effort
      baseVentilation = Math.min(100, Math.max(60, tempDifferential * 12 / sensitivity));
      baseFanSpeed = Math.min(100, Math.max(50, tempDifferential * 15 / sensitivity));
    }
    
    // Adjust for wind speed
    const windAdjustment = Math.min(1.2, Math.max(0.8, 1 + (windSpeed - 3) * 0.05));
    
    return {
      ventilationPercentage: Math.round(baseVentilation * windAdjustment),
      fanSpeed: Math.round(baseFanSpeed * windAdjustment)
    };
  }

  private static calculateGuillotinePosition(
    coolingMode: string,
    windSpeed: number,
    tempDifferential: number
  ): number {
    if (coolingMode === 'recirculation') {
      return 100; // Closed for recirculation
    } else if (coolingMode === 'pad-cooling') {
      return 0; // Open for maximum cooling
    } else {
      // Proportional opening based on conditions
      const baseOpening = Math.min(80, tempDifferential * 15);
      // Adjust for wind (close more in high wind)
      const windAdjustment = Math.max(0.5, 1 - (windSpeed - 3) * 0.1);
      return Math.round(baseOpening * windAdjustment);
    }
  }

  private static checkHeatingRequirement(
    outsideTemp: number,
    targetTemp: number,
    timeOfDay: string,
    season: string
  ): boolean {
    if (outsideTemp >= targetTemp) return false;
    
    const tempDeficit = targetTemp - outsideTemp;
    
    // More heating needed at night and in winter
    const timeMultiplier = timeOfDay === 'night' ? 1.2 : 1.0;
    const seasonMultiplier = season === 'winter' ? 1.5 : season === 'summer' ? 0.7 : 1.0;
    
    return (tempDeficit * timeMultiplier * seasonMultiplier) > 2;
  }

  private static estimateResultingTemperature(
    outsideTemp: number,
    ventilation: number,
    fanSpeed: number,
    heating: boolean,
    coolingMode: string
  ): number {
    let resultTemp = outsideTemp;
    
    // Greenhouse effect (solar gain)
    resultTemp += 5; // Base greenhouse warming
    
    // Ventilation cooling effect
    const ventilationCooling = (ventilation / 100) * Math.max(0, resultTemp - outsideTemp) * 0.8;
    resultTemp -= ventilationCooling;
    
    // Fan circulation effect
    if (fanSpeed > 50 && coolingMode === 'pad-cooling') {
      resultTemp -= 2; // Evaporative cooling
    }
    
    // Heating effect
    if (heating) {
      resultTemp += 3; // Heating boost
    }
    
    return Math.round(resultTemp * 10) / 10;
  }

  private static generateControlStrategy(
    pBandSize: string,
    coolingMode: string,
    tempDifferential: number
  ): string {
    const strategies = {
      small: 'Quick response strategy - immediate adjustments to maintain tight temperature control',
      medium: 'Balanced strategy - moderate response with stability focus',
      large: 'Patient strategy - gradual adjustments allowing 2-3°C higher temperatures'
    };
    
    let strategy = strategies[pBandSize];
    strategy += ` Operating in ${coolingMode} mode.`;
    
    if (tempDifferential > 5) {
      strategy += ' High temperature differential - aggressive cooling needed.';
    } else if (tempDifferential < 0) {
      strategy += ' Outside warmer than inside - minimal ventilation mode.';
    }
    
    return strategy;
  }

  private static generateWarnings(
    config: PBandConfiguration,
    expectedTemp: number
  ): string[] {
    const warnings: string[] = [];
    
    if (expectedTemp > this.MAX_CROP_TEMPERATURE) {
      warnings.push(`⚠️ Expected temperature (${expectedTemp}°C) exceeds crop tolerance (${this.MAX_CROP_TEMPERATURE}°C)`);
    }
    
    if (expectedTemp < this.MIN_CROP_TEMPERATURE) {
      warnings.push(`⚠️ Expected temperature (${expectedTemp}°C) below minimum (${this.MIN_CROP_TEMPERATURE}°C)`);
    }
    
    if (config.outsideTemperature - expectedTemp > this.MOMENTUM_THRESHOLD) {
      warnings.push('⚠️ Risk of hot air momentum - consider stopping fans');
    }
    
    if (config.windSpeed > 8) {
      warnings.push('⚠️ High wind speed - adjust vent positions accordingly');
    }
    
    if (config.radiationLevel > 800 && config.outsideTemperature > 35) {
      warnings.push('⚠️ Extreme conditions - monitor system closely');
    }
    
    return warnings;
  }

  private static getTimeOfDay(hour: number): PBandConfiguration['timeOfDay'] {
    if (hour >= 22 || hour <= 5) return 'night';
    if (hour >= 6 && hour <= 9) return 'morning';
    if (hour >= 10 && hour <= 17) return 'day';
    return 'evening';
  }
}