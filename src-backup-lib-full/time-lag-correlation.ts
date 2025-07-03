/**
 * Time-Lag Correlation Detection Engine
 * Analyzes delayed responses between environmental changes and plant reactions
 */

import { pearsonCorrelation } from './statistics/correlation-engine';

export interface TimeLagConfig {
  maxLagHours: number;
  lagIncrement: number; // in minutes
  minCorrelation: number; // minimum correlation to consider significant
}

export interface TimeLagResult {
  inputParameter: string;
  outputParameter: string;
  optimalLagMinutes: number;
  correlation: number;
  confidence: number;
}

export class TimeLagCorrelationEngine {
  private defaultConfig: TimeLagConfig = {
    maxLagHours: 24,
    lagIncrement: 15, // 15-minute increments
    minCorrelation: 0.6
  };

  /**
   * Detect optimal time lag between input and output parameters
   */
  detectTimeLag(
    inputData: Array<{ timestamp: Date; value: number }>,
    outputData: Array<{ timestamp: Date; value: number }>,
    config?: Partial<TimeLagConfig>
  ): TimeLagResult | null {
    const cfg = { ...this.defaultConfig, ...config };
    const maxLagMinutes = cfg.maxLagHours * 60;
    let bestCorrelation = 0;
    let optimalLag = 0;

    // Test different lag times
    for (let lag = 0; lag <= maxLagMinutes; lag += cfg.lagIncrement) {
      const correlation = this.calculateLaggedCorrelation(
        inputData,
        outputData,
        lag
      );

      if (Math.abs(correlation) > Math.abs(bestCorrelation)) {
        bestCorrelation = correlation;
        optimalLag = lag;
      }
    }

    // Return null if no significant correlation found
    if (Math.abs(bestCorrelation) < cfg.minCorrelation) {
      return null;
    }

    return {
      inputParameter: 'input',
      outputParameter: 'output',
      optimalLagMinutes: optimalLag,
      correlation: bestCorrelation,
      confidence: this.calculateConfidence(bestCorrelation, inputData.length)
    };
  }

  /**
   * Calculate correlation with a specific time lag
   */
  private calculateLaggedCorrelation(
    inputData: Array<{ timestamp: Date; value: number }>,
    outputData: Array<{ timestamp: Date; value: number }>,
    lagMinutes: number
  ): number {
    const alignedPairs: Array<{ x: number; y: number }> = [];

    // Align data points with the specified lag
    inputData.forEach(input => {
      const targetTime = new Date(input.timestamp.getTime() + lagMinutes * 60000);
      
      // Find closest output data point
      const closestOutput = this.findClosestDataPoint(outputData, targetTime);
      
      if (closestOutput && this.isWithinTolerance(closestOutput.timestamp, targetTime)) {
        alignedPairs.push({ x: input.value, y: closestOutput.value });
      }
    });

    if (alignedPairs.length < 10) {
      return 0; // Not enough data points
    }

    return pearsonCorrelation(alignedPairs);
  }

  /**
   * Find the closest data point to a target timestamp
   */
  private findClosestDataPoint(
    data: Array<{ timestamp: Date; value: number }>,
    targetTime: Date
  ): { timestamp: Date; value: number } | null {
    if (data.length === 0) return null;

    return data.reduce((closest, current) => {
      const currentDiff = Math.abs(current.timestamp.getTime() - targetTime.getTime());
      const closestDiff = Math.abs(closest.timestamp.getTime() - targetTime.getTime());
      
      return currentDiff < closestDiff ? current : closest;
    });
  }

  /**
   * Check if two timestamps are within acceptable tolerance (5 minutes)
   */
  private isWithinTolerance(time1: Date, time2: Date, toleranceMinutes: number = 5): boolean {
    const diffMinutes = Math.abs(time1.getTime() - time2.getTime()) / 60000;
    return diffMinutes <= toleranceMinutes;
  }

  /**
   * Calculate confidence based on correlation strength and sample size
   */
  private calculateConfidence(correlation: number, sampleSize: number): number {
    // Fisher's z-transformation for confidence
    const z = 0.5 * Math.log((1 + correlation) / (1 - correlation));
    const se = 1 / Math.sqrt(sampleSize - 3);
    const confidence = 1 - 2 * (1 - this.normalCDF(Math.abs(z) / se));
    
    return Math.min(0.99, Math.max(0, confidence));
  }

  /**
   * Normal cumulative distribution function
   */
  private normalCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453910204;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }
}

/**
 * Predefined lag patterns for common greenhouse scenarios
 */
export const COMMON_LAG_PATTERNS = {
  CO2_TO_PHOTOSYNTHESIS: {
    inputParameter: 'CO2 Concentration',
    outputParameter: 'Photosynthesis Rate',
    typicalLagMinutes: 120, // 2 hours as shown in photos
    description: 'CO2 enrichment to photosynthesis response'
  },
  LIGHT_TO_GROWTH: {
    inputParameter: 'Light Intensity',
    outputParameter: 'Biomass Gain',
    typicalLagMinutes: 360, // 6 hours as shown in photos
    description: 'Light changes to growth rate response'
  },
  IRRIGATION_TO_TRANSPIRATION: {
    inputParameter: 'Irrigation Volume',
    outputParameter: 'Transpiration Rate',
    typicalLagMinutes: 30,
    description: 'Water uptake to transpiration'
  },
  TEMPERATURE_TO_DEVELOPMENT: {
    inputParameter: 'Temperature',
    outputParameter: 'Development Rate',
    typicalLagMinutes: 240, // 4 hours
    description: 'Temperature change to growth response'
  },
  VPD_TO_STOMATA: {
    inputParameter: 'VPD',
    outputParameter: 'Stomatal Conductance',
    typicalLagMinutes: 15,
    description: 'Vapor pressure deficit to stomata response'
  }
};

/**
 * Alert generation for detected lag patterns
 */
export function generateLagAlert(result: TimeLagResult, pattern: keyof typeof COMMON_LAG_PATTERNS): string {
  const expected = COMMON_LAG_PATTERNS[pattern];
  const deviation = Math.abs(result.optimalLagMinutes - expected.typicalLagMinutes);
  
  if (deviation > 60) { // More than 1 hour deviation
    return `⚠️ Unusual ${expected.inputParameter} response time detected: ${result.optimalLagMinutes} minutes (expected ~${expected.typicalLagMinutes} minutes). Check environmental controls.`;
  }
  
  return `✓ Normal ${expected.inputParameter} response time: ${result.optimalLagMinutes} minutes`;
}