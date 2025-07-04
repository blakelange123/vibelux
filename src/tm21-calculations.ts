/**
 * TM-21 LED Lifetime Projection Calculations
 * Based on ANSI/IES TM-21-19 standard
 * 
 * TM-21 provides a method for projecting long-term lumen maintenance
 * of LED light sources using LM-80 test data
 */

export interface LM80DataPoint {
  hours: number;
  lumenMaintenance: number; // percentage (0-100)
  temperature: number; // Celsius
}

export interface LM80TestData {
  testDuration: number; // hours
  sampleSize: number;
  temperature: number; // Celsius
  driveCurrent: number; // mA
  dataPoints: LM80DataPoint[];
}

export interface TM21Result {
  L70: number | null; // Hours to 70% lumen maintenance
  L80: number | null; // Hours to 80% lumen maintenance
  L90: number | null; // Hours to 90% lumen maintenance
  reportedL70: number; // Limited by 6x rule
  reportedL80: number; // Limited by 6x rule
  reportedL90: number; // Limited by 6x rule
  alphaValue: number; // Decay rate constant
  betaValue: number; // Initial luminous flux constant
  projectionLimitHours: number; // Maximum allowed projection
  notation: {
    L70: string; // e.g., "L70(10k) = 60,000"
    L80: string;
    L90: string;
  };
}

export interface TemperatureInterpolationInput {
  inSituTemperature: number; // Actual operating temperature
  lm80Data: LM80TestData[]; // Multiple temperature test data
  targetLumenMaintenance: number; // e.g., 70 for L70
}

export interface ArrheniusParameters {
  activationEnergy: number; // eV
  boltzmannConstant: number; // eV/K
}

export class TM21Calculator {
  private readonly BOLTZMANN_CONSTANT = 8.617333262145e-5; // eV/K
  private readonly DEFAULT_ACTIVATION_ENERGY = 0.7; // eV (typical for LEDs)
  
  /**
   * Calculate TM-21 projections from LM-80 data
   * @param lm80Data - Test data from LM-80 testing
   * @returns TM21 projection results
   */
  calculateTM21(lm80Data: LM80TestData): TM21Result {
    // Validate input data
    this.validateLM80Data(lm80Data);
    
    // Determine data points to use based on TM-21 requirements
    const dataPointsToUse = this.selectDataPoints(lm80Data);
    
    // Perform exponential curve fitting (least squares method)
    const { alpha, beta } = this.performExponentialFit(dataPointsToUse);
    
    // Calculate projection limit based on sample size
    const projectionLimit = this.calculateProjectionLimit(
      lm80Data.testDuration,
      lm80Data.sampleSize
    );
    
    // Calculate hours to various lumen maintenance levels
    const L70 = this.calculateHoursToLumenMaintenance(70, alpha, beta);
    const L80 = this.calculateHoursToLumenMaintenance(80, alpha, beta);
    const L90 = this.calculateHoursToLumenMaintenance(90, alpha, beta);
    
    // Apply projection limits
    const reportedL70 = L70 ? Math.min(L70, projectionLimit) : projectionLimit;
    const reportedL80 = L80 ? Math.min(L80, projectionLimit) : projectionLimit;
    const reportedL90 = L90 ? Math.min(L90, projectionLimit) : projectionLimit;
    
    // Generate notation strings
    const testDurationInK = Math.round(lm80Data.testDuration / 1000);
    const notation = {
      L70: `L70(${testDurationInK}k) = ${reportedL70.toLocaleString()}`,
      L80: `L80(${testDurationInK}k) = ${reportedL80.toLocaleString()}`,
      L90: `L90(${testDurationInK}k) = ${reportedL90.toLocaleString()}`
    };
    
    return {
      L70,
      L80,
      L90,
      reportedL70,
      reportedL80,
      reportedL90,
      alphaValue: alpha,
      betaValue: beta,
      projectionLimitHours: projectionLimit,
      notation
    };
  }
  
  /**
   * Interpolate lifetime for in-situ temperature using Arrhenius equation
   * Based on TM-21-19 temperature interpolation method
   */
  interpolateForTemperature(input: TemperatureInterpolationInput): number {
    const { inSituTemperature, lm80Data, targetLumenMaintenance } = input;
    
    // Sort LM-80 data by temperature
    const sortedData = [...lm80Data].sort((a, b) => a.temperature - b.temperature);
    
    // Check if in-situ temperature is within test range
    const minTemp = sortedData[0].temperature;
    const maxTemp = sortedData[sortedData.length - 1].temperature;
    
    if (inSituTemperature < minTemp || inSituTemperature > maxTemp) {
      throw new Error(
        `In-situ temperature ${inSituTemperature}°C is outside test range ${minTemp}°C - ${maxTemp}°C`
      );
    }
    
    // Find the two closest test temperatures
    let lowerData: LM80TestData | null = null;
    let upperData: LM80TestData | null = null;
    
    for (let i = 0; i < sortedData.length - 1; i++) {
      if (sortedData[i].temperature <= inSituTemperature &&
          sortedData[i + 1].temperature >= inSituTemperature) {
        lowerData = sortedData[i];
        upperData = sortedData[i + 1];
        break;
      }
    }
    
    if (!lowerData || !upperData) {
      throw new Error('Unable to find appropriate temperature bounds');
    }
    
    // Calculate TM-21 for both temperatures
    const lowerResult = this.calculateTM21(lowerData);
    const upperResult = this.calculateTM21(upperData);
    
    // Get lifetime at target lumen maintenance
    const lowerLifetime = this.getLifetimeForLumenMaintenance(
      lowerResult,
      targetLumenMaintenance
    );
    const upperLifetime = this.getLifetimeForLumenMaintenance(
      upperResult,
      targetLumenMaintenance
    );
    
    // Apply Arrhenius interpolation
    return this.arrheniusInterpolation(
      lowerData.temperature,
      upperData.temperature,
      inSituTemperature,
      lowerLifetime,
      upperLifetime
    );
  }
  
  /**
   * Validate LM-80 data meets TM-21 requirements
   */
  private validateLM80Data(data: LM80TestData): void {
    if (data.testDuration < 6000) {
      throw new Error('LM-80 test duration must be at least 6,000 hours');
    }
    
    if (data.sampleSize < 10) {
      throw new Error('Sample size must be at least 10 units');
    }
    
    if (data.dataPoints.length < 10) {
      throw new Error('Insufficient data points for TM-21 calculation');
    }
  }
  
  /**
   * Select data points according to TM-21 requirements
   */
  private selectDataPoints(lm80Data: LM80TestData): LM80DataPoint[] {
    const { testDuration, dataPoints } = lm80Data;
    
    let startTime: number;
    
    if (testDuration >= 6000 && testDuration < 10000) {
      // Use last 5,000 hours
      startTime = testDuration - 5000;
    } else {
      // Use last 50% of data
      startTime = testDuration * 0.5;
    }
    
    return dataPoints.filter(point => point.hours >= startTime);
  }
  
  /**
   * Perform exponential curve fitting using least squares method
   * Model: Φ(t) = B * exp(-α * t)
   */
  private performExponentialFit(dataPoints: LM80DataPoint[]): { alpha: number; beta: number } {
    // Convert to natural log for linear regression
    const n = dataPoints.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    
    dataPoints.forEach(point => {
      const x = point.hours;
      const y = Math.log(point.lumenMaintenance);
      
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });
    
    // Calculate slope (alpha) and intercept (ln(beta))
    const alpha = -(n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const lnBeta = (sumY - (-alpha) * sumX) / n;
    const beta = Math.exp(lnBeta);
    
    return { alpha, beta };
  }
  
  /**
   * Calculate projection limit based on sample size
   */
  private calculateProjectionLimit(testDuration: number, sampleSize: number): number {
    let multiplier: number;
    
    if (sampleSize >= 20) {
      multiplier = 6.0;
    } else if (sampleSize >= 10) {
      // Linear interpolation between 5.5 and 6.0
      multiplier = 5.5 + (sampleSize - 10) * 0.05;
    } else {
      throw new Error('Sample size too small for TM-21 projection');
    }
    
    return testDuration * multiplier;
  }
  
  /**
   * Calculate hours to specific lumen maintenance percentage
   */
  private calculateHoursToLumenMaintenance(
    targetPercentage: number,
    alpha: number,
    beta: number
  ): number | null {
    if (beta <= targetPercentage) {
      // Already below target
      return null;
    }
    
    // Solve for t: targetPercentage = beta * exp(-alpha * t)
    const hours = -Math.log(targetPercentage / beta) / alpha;
    
    return hours > 0 ? hours : null;
  }
  
  /**
   * Get lifetime for specific lumen maintenance from TM-21 result
   */
  private getLifetimeForLumenMaintenance(
    result: TM21Result,
    targetPercentage: number
  ): number {
    switch (targetPercentage) {
      case 70:
        return result.reportedL70;
      case 80:
        return result.reportedL80;
      case 90:
        return result.reportedL90;
      default:
        // Calculate custom percentage
        return this.calculateHoursToLumenMaintenance(
          targetPercentage,
          result.alphaValue,
          result.betaValue
        ) || 0;
    }
  }
  
  /**
   * Arrhenius equation interpolation for temperature
   */
  private arrheniusInterpolation(
    T1: number, // Lower temperature (Celsius)
    T2: number, // Upper temperature (Celsius)
    Ti: number, // In-situ temperature (Celsius)
    L1: number, // Lifetime at T1
    L2: number  // Lifetime at T2
  ): number {
    // Convert to Kelvin
    const T1_K = T1 + 273.15;
    const T2_K = T2 + 273.15;
    const Ti_K = Ti + 273.15;
    
    // Calculate activation energy from the two test points
    const Ea = this.BOLTZMANN_CONSTANT * Math.log(L1 / L2) / (1 / T2_K - 1 / T1_K);
    
    // Calculate lifetime at in-situ temperature
    const Li = L1 * Math.exp(Ea / this.BOLTZMANN_CONSTANT * (1 / Ti_K - 1 / T1_K));
    
    return Math.round(Li);
  }
  
  /**
   * Generate TM-21 report summary
   */
  generateReport(
    lm80Data: LM80TestData,
    tm21Result: TM21Result,
    inSituTemp?: number
  ): string {
    const lines: string[] = [
      'TM-21 LED Lifetime Projection Report',
      '=' .repeat(40),
      '',
      'LM-80 Test Conditions:',
      `  Test Duration: ${lm80Data.testDuration.toLocaleString()} hours`,
      `  Test Temperature: ${lm80Data.temperature}°C`,
      `  Drive Current: ${lm80Data.driveCurrent} mA`,
      `  Sample Size: ${lm80Data.sampleSize} units`,
      '',
      'TM-21 Projection Results:',
      `  ${tm21Result.notation.L90}`,
      `  ${tm21Result.notation.L80}`,
      `  ${tm21Result.notation.L70}`,
      '',
      'Curve Fit Parameters:',
      `  Alpha (α): ${tm21Result.alphaValue.toExponential(4)}`,
      `  Beta (β): ${tm21Result.betaValue.toFixed(2)}`,
      `  Projection Limit: ${tm21Result.projectionLimitHours.toLocaleString()} hours`,
      ''
    ];
    
    if (inSituTemp !== undefined) {
      lines.push(
        'Temperature Interpolation:',
        `  In-Situ Temperature: ${inSituTemp}°C`,
        `  Interpolated L70: ${this.interpolateForTemperature({
          inSituTemperature: inSituTemp,
          lm80Data: [lm80Data],
          targetLumenMaintenance: 70
        }).toLocaleString()} hours`,
        ''
      );
    }
    
    lines.push(
      'Note: Projections are limited to 6x test duration per TM-21 standard.',
      'Actual lifetime may exceed reported values.'
    );
    
    return lines.join('\n');
  }
}

// Export singleton instance
export const tm21Calculator = new TM21Calculator();

// Example usage function
export function calculateLEDLifetime(
  testData: LM80TestData,
  operatingTemperature?: number
): TM21Result {
  const calculator = new TM21Calculator();
  const result = calculator.calculateTM21(testData);
  
  if (operatingTemperature !== undefined && 
      operatingTemperature !== testData.temperature) {
    // Would need multiple temperature test data for interpolation
    console.warn(
      'Temperature interpolation requires multiple LM-80 test temperatures'
    );
  }
  
  return result;
}