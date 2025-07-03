/**
 * Advanced VPD Calculator based on Advanced Dutch Research principles
 * Includes humidity deficit calculations and optimal growing conditions
 */

export interface VPDCalculationResult {
  vpd: number; // kPa
  humidityDeficit: number; // g/m³
  dewPoint: number; // °C
  absoluteHumidity: number; // g/m³
  recommendation: string;
  isOptimal: boolean;
}

export interface GreenhouseClimateData {
  temperature: number; // °C
  relativeHumidity: number; // %
  co2Level?: number; // ppm
  lightIntensity?: number; // μmol/m²/s
}

export class AdvancedVPDCalculator {
  // Target humidity deficit as per Advanced Dutch Research: 5 g/m³
  static readonly TARGET_HD = 5;
  static readonly OPTIMAL_VPD_MIN = 0.8; // kPa
  static readonly OPTIMAL_VPD_MAX = 1.2; // kPa

  /**
   * Calculate saturated vapor pressure (es) at given temperature
   * Using Magnus formula
   */
  static calculateSVP(tempC: number): number {
    return 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  }

  /**
   * Calculate actual vapor pressure (ea)
   */
  static calculateActualVP(tempC: number, rhPercent: number): number {
    const svp = this.calculateSVP(tempC);
    return (rhPercent / 100) * svp;
  }

  /**
   * Calculate VPD (Vapor Pressure Deficit)
   */
  static calculateVPD(tempC: number, rhPercent: number): number {
    const svp = this.calculateSVP(tempC);
    const avp = this.calculateActualVP(tempC, rhPercent);
    return svp - avp;
  }

  /**
   * Calculate absolute humidity (g/m³)
   */
  static calculateAbsoluteHumidity(tempC: number, rhPercent: number): number {
    const avp = this.calculateActualVP(tempC, rhPercent);
    const tempK = tempC + 273.15;
    // Using ideal gas law for water vapor
    return (avp * 2.16679 * 1000) / tempK;
  }

  /**
   * Calculate humidity deficit (HD) - key metric from Advanced Dutch Research
   */
  static calculateHumidityDeficit(tempC: number, rhPercent: number): number {
    const maxAbsoluteHumidity = this.calculateAbsoluteHumidity(tempC, 100);
    const actualAbsoluteHumidity = this.calculateAbsoluteHumidity(tempC, rhPercent);
    return maxAbsoluteHumidity - actualAbsoluteHumidity;
  }

  /**
   * Calculate dew point temperature
   */
  static calculateDewPoint(tempC: number, rhPercent: number): number {
    const avp = this.calculateActualVP(tempC, rhPercent);
    const gamma = Math.log(avp / 0.6108);
    return (237.3 * gamma) / (17.27 - gamma);
  }

  /**
   * Get target RH for optimal HD at given temperature
   */
  static getTargetRH(tempC: number): number {
    const maxAbsoluteHumidity = this.calculateAbsoluteHumidity(tempC, 100);
    const targetAbsoluteHumidity = maxAbsoluteHumidity - this.TARGET_HD;
    
    // Reverse calculate RH from absolute humidity
    const tempK = tempC + 273.15;
    const targetAVP = (targetAbsoluteHumidity * tempK) / (2.16679 * 1000);
    const svp = this.calculateSVP(tempC);
    
    return (targetAVP / svp) * 100;
  }

  /**
   * Main calculation method with recommendations
   */
  static calculate(data: GreenhouseClimateData): VPDCalculationResult {
    const { temperature, relativeHumidity } = data;
    
    const vpd = this.calculateVPD(temperature, relativeHumidity);
    const humidityDeficit = this.calculateHumidityDeficit(temperature, relativeHumidity);
    const dewPoint = this.calculateDewPoint(temperature, relativeHumidity);
    const absoluteHumidity = this.calculateAbsoluteHumidity(temperature, relativeHumidity);
    
    // Generate recommendations based on Advanced Dutch Research principles
    let recommendation = '';
    let isOptimal = false;

    if (humidityDeficit < 3) {
      recommendation = 'HD too low: Increase ventilation or reduce humidity. Risk of fungal diseases.';
    } else if (humidityDeficit >= 3 && humidityDeficit <= 7) {
      isOptimal = true;
      recommendation = 'Optimal humidity deficit for most crops. Maintain current conditions.';
    } else if (humidityDeficit > 7 && humidityDeficit <= 10) {
      recommendation = 'HD slightly high: Monitor plant stress. Consider light misting if needed.';
    } else {
      recommendation = 'HD too high: Reduce temperature or increase humidity. Risk of plant stress.';
    }

    // Additional VPD-based recommendations
    if (vpd < this.OPTIMAL_VPD_MIN) {
      recommendation += ' VPD too low: Stomata may close, reducing transpiration.';
    } else if (vpd > this.OPTIMAL_VPD_MAX) {
      recommendation += ' VPD too high: Excessive transpiration may stress plants.';
    }

    return {
      vpd,
      humidityDeficit,
      dewPoint,
      absoluteHumidity,
      recommendation,
      isOptimal
    };
  }

  /**
   * Calculate 24-hour climate targets based on light integral
   */
  static calculate24HourTargets(dailyLightIntegral: number) {
    // Based on Advanced Dutch Research temperature strategies
    const baseTemp = 18; // °C
    const lightFactor = dailyLightIntegral / 1000; // Per 1000 J
    
    return {
      dayTemp: baseTemp + (lightFactor * 2), // Increase 2°C per 1000 J
      nightTemp: baseTemp - 2, // Night temperature drop
      preNightTemp: baseTemp + 1, // Pre-night treatment
      targetHD: this.TARGET_HD,
      targetVPD: (this.OPTIMAL_VPD_MIN + this.OPTIMAL_VPD_MAX) / 2
    };
  }

  /**
   * Semi-closed greenhouse specific calculations
   */
  static semiClosedOptimization(data: GreenhouseClimateData & { 
    airExchangeRate: number;
    padWallEfficiency?: number;
  }) {
    const baseCalc = this.calculate(data);
    
    // Semi-closed greenhouses maintain 8-9 air exchanges per hour
    const optimalAirExchange = data.airExchangeRate >= 8 && data.airExchangeRate <= 9;
    
    // CO2 enrichment feasibility
    const co2EnrichmentFeasible = data.airExchangeRate < 15; // Limited benefit above this
    
    return {
      ...baseCalc,
      airExchangeOptimal: optimalAirExchange,
      co2EnrichmentFeasible,
      energyEfficiencyScore: Math.max(0, 100 - (data.airExchangeRate * 3)), // Higher exchange = lower efficiency
      recommendations: [
        baseCalc.recommendation,
        optimalAirExchange ? 'Air exchange rate optimal for semi-closed operation' : 
          `Adjust air exchange to 8-9/hour (current: ${data.airExchangeRate}/hour)`,
        co2EnrichmentFeasible ? 'CO2 enrichment recommended' : 'High air exchange limits CO2 enrichment benefit'
      ]
    };
  }
}