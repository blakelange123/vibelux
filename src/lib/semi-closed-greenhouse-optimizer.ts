/**
 * Semi-Closed Greenhouse Optimization System
 * Based on Advanced Dutch Research advanced control strategies
 */

export interface GreenhouseType {
  type: 'semi-closed' | 'pad-fan' | 'conventional';
  airExchangeRate: number;
  coolingCapacity: number;
  energyEfficiency: number;
}

export interface OptimizationResult {
  currentPerformance: PerformanceMetrics;
  recommendations: Recommendation[];
  potentialSavings: SavingsAnalysis;
  automationStrategy: AutomationStrategy;
}

export interface PerformanceMetrics {
  climateUniformity: number; // 0-100%
  energyUsage: number; // kWh/m²/year
  waterUsage: number; // L/m²/year
  co2Efficiency: number; // kg CO2 used / kg produce
  yieldPotential: number; // kg/m²/year
}

export interface Recommendation {
  category: 'energy' | 'climate' | 'irrigation' | 'co2' | 'maintenance';
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
  implementation: string;
}

export interface SavingsAnalysis {
  energySavings: number; // %
  waterSavings: number; // %
  yieldIncrease: number; // %
  paybackPeriod: number; // months
  annualSavings: number; // $
}

export interface AutomationStrategy {
  fanSpeedAlgorithm: string;
  shadingStrategy: string;
  coolingSequence: string[];
  irrigationTriggers: string[];
}

export class SemiClosedGreenhouseOptimizer {
  // Constants from Advanced Dutch Research
  static readonly OPTIMAL_AIR_EXCHANGE = 8.5; // exchanges/hour
  static readonly MIN_FAN_SPEED = 30; // % to keep hoses inflated
  static readonly TARGET_CO2_RECIRC = 1000; // ppm in recirculation
  static readonly MOMENTUM_PREVENTION_TEMP = 3; // °C difference threshold

  /**
   * Analyze current greenhouse performance
   */
  static analyzePerformance(data: {
    greenhouseType: GreenhouseType;
    climateData: any[];
    energyData: any[];
    productionData: any[];
  }): PerformanceMetrics {
    const { greenhouseType, climateData, energyData, productionData } = data;
    
    // Calculate climate uniformity based on temperature variations
    const tempVariations = this.calculateTemperatureUniformity(climateData);
    const climateUniformity = Math.max(0, 100 - (tempVariations * 10));
    
    // Energy usage calculation
    const totalEnergy = energyData.reduce((sum, d) => sum + d.consumption, 0);
    const energyUsage = totalEnergy / (365 * greenhouseType.coolingCapacity);
    
    // Water usage efficiency
    const waterUsage = this.calculateWaterUsage(greenhouseType, climateData);
    
    // CO2 efficiency for semi-closed systems
    const co2Efficiency = greenhouseType.type === 'semi-closed' 
      ? 0.8 // Better retention
      : greenhouseType.type === 'pad-fan' 
      ? 0.3 // High losses
      : 0.5; // Conventional
    
    // Yield potential based on climate control
    const yieldPotential = this.calculateYieldPotential(
      climateUniformity,
      greenhouseType.type
    );
    
    return {
      climateUniformity,
      energyUsage,
      waterUsage,
      co2Efficiency,
      yieldPotential
    };
  }

  /**
   * Generate optimization recommendations
   */
  static generateRecommendations(
    currentPerformance: PerformanceMetrics,
    greenhouseType: GreenhouseType
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Fan speed optimization
    if (greenhouseType.airExchangeRate > 10) {
      recommendations.push({
        category: 'energy',
        priority: 'high',
        action: 'Reduce air exchange rate to 8-9 per hour',
        impact: '20-30% energy savings',
        implementation: 'Adjust fan speed controls and ventilation settings'
      });
    }
    
    // Momentum prevention
    recommendations.push({
      category: 'climate',
      priority: 'high',
      action: 'Implement momentum prevention algorithm',
      impact: 'Prevent hot air accumulation at crop level',
      implementation: 'Stop fans when inside temp > outside temp + 3°C'
    });
    
    // Shading optimization
    if (greenhouseType.type === 'semi-closed') {
      recommendations.push({
        category: 'energy',
        priority: 'medium',
        action: 'Install double shading screens (Par-Perfect system)',
        impact: 'Up to 60% shading capacity, better light diffusion',
        implementation: 'Install retractable screens with 30% + 30% shading'
      });
    }
    
    // Irrigation based on light sums
    recommendations.push({
      category: 'irrigation',
      priority: 'high',
      action: 'Implement light-based irrigation control',
      impact: 'Optimize water use and prevent over-irrigation',
      implementation: this.getLightBasedIrrigationStrategy()
    });
    
    // CO2 enrichment for semi-closed
    if (greenhouseType.type === 'semi-closed' && currentPerformance.co2Efficiency > 0.7) {
      recommendations.push({
        category: 'co2',
        priority: 'medium',
        action: 'Increase CO2 enrichment to 1000+ ppm',
        impact: '10-15% yield increase',
        implementation: 'Utilize recirculation mode for CO2 retention'
      });
    }
    
    // Maintenance recommendations
    recommendations.push({
      category: 'maintenance',
      priority: 'medium',
      action: 'Regular pad wall cleaning (monthly)',
      impact: 'Maintain cooling efficiency',
      implementation: 'Automated cleaning system or scheduled maintenance'
    });
    
    return recommendations;
  }

  /**
   * Calculate potential savings
   */
  static calculateSavings(
    currentPerformance: PerformanceMetrics,
    recommendations: Recommendation[],
    greenhouseSizeM2: number,
    energyCostPerKWh: number
  ): SavingsAnalysis {
    let energySavings = 0;
    let waterSavings = 0;
    let yieldIncrease = 0;
    
    // Calculate impact of each recommendation
    recommendations.forEach(rec => {
      if (rec.category === 'energy' && rec.priority === 'high') {
        energySavings += 25; // Conservative estimate
      }
      if (rec.category === 'irrigation') {
        waterSavings += 15;
      }
      if (rec.category === 'co2') {
        yieldIncrease += 12;
      }
    });
    
    // Calculate annual savings
    const currentEnergyCost = currentPerformance.energyUsage * greenhouseSizeM2 * energyCostPerKWh;
    const energySavingsAmount = currentEnergyCost * (energySavings / 100);
    
    const currentWaterCost = currentPerformance.waterUsage * greenhouseSizeM2 * 0.002; // $/L
    const waterSavingsAmount = currentWaterCost * (waterSavings / 100);
    
    const yieldValue = currentPerformance.yieldPotential * greenhouseSizeM2 * 3.5; // $/kg
    const yieldIncreaseAmount = yieldValue * (yieldIncrease / 100);
    
    const annualSavings = energySavingsAmount + waterSavingsAmount + yieldIncreaseAmount;
    
    // Estimate payback period (assuming moderate investment)
    const estimatedInvestment = greenhouseSizeM2 * 50; // $/m² for upgrades
    const paybackPeriod = (estimatedInvestment / annualSavings) * 12; // months
    
    return {
      energySavings,
      waterSavings,
      yieldIncrease,
      paybackPeriod,
      annualSavings
    };
  }

  /**
   * Generate automation strategy
   */
  static generateAutomationStrategy(greenhouseType: GreenhouseType): AutomationStrategy {
    const strategy: AutomationStrategy = {
      fanSpeedAlgorithm: '',
      shadingStrategy: '',
      coolingSequence: [],
      irrigationTriggers: []
    };
    
    // Fan speed algorithm for semi-closed
    if (greenhouseType.type === 'semi-closed') {
      strategy.fanSpeedAlgorithm = `
        IF (TempInside > TempOutside + 3°C) THEN FanSpeed = 0%
        ELSE IF (Humidity > 85%) THEN FanSpeed = 70%
        ELSE IF (CO2_Mode = Enrichment) THEN FanSpeed = 30%
        ELSE FanSpeed = LinearScale(30%, 100%, TempDifference)
      `;
      
      strategy.coolingSequence = [
        '1. Natural ventilation (if available)',
        '2. Increase fan speed to 50%',
        '3. Activate pad wall cooling',
        '4. Increase fan speed to 70%',
        '5. Deploy shading screens',
        '6. Maximum cooling mode (100% fans)'
      ];
    }
    
    // Shading strategy
    strategy.shadingStrategy = `
      Light > 800 W/m²: Deploy first screen (30%)
      Light > 1000 W/m²: Deploy second screen (total 60%)
      Temperature > 32°C: Deploy regardless of light
      Time 10:00-14:00: Minimum 30% shading in summer
    `;
    
    // Irrigation triggers based on light sums
    strategy.irrigationTriggers = [
      'Trigger: Every 100 J/cm² accumulated light',
      'Morning: First irrigation 2 hours after sunrise',
      'Light sum <500 J: 0-10% drain target',
      'Light sum 500-1000 J: 10-20% drain target',
      'Light sum 1000-1500 J: 20-30% drain target',
      'Light sum >1500 J: 30-40% drain target',
      'EC control: Maintain 3.0-4.5 in slab'
    ];
    
    return strategy;
  }

  /**
   * Helper methods
   */
  private static calculateTemperatureUniformity(climateData: any[]): number {
    if (!climateData.length) return 0;
    
    const temps = climateData.map(d => d.temperature);
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
    const variance = temps.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / temps.length;
    
    return Math.sqrt(variance);
  }

  private static calculateWaterUsage(
    greenhouseType: GreenhouseType,
    climateData: any[]
  ): number {
    // Base water usage L/m²/year
    const baseUsage = {
      'semi-closed': 800,
      'pad-fan': 1200, // Higher due to evaporative cooling
      'conventional': 1000
    };
    
    return baseUsage[greenhouseType.type] || 1000;
  }

  private static calculateYieldPotential(
    climateUniformity: number,
    type: GreenhouseType['type']
  ): number {
    // Base yield kg/m²/year
    const baseYield = {
      'semi-closed': 75,
      'pad-fan': 65,
      'conventional': 60
    };
    
    // Adjust based on climate uniformity
    const uniformityFactor = climateUniformity / 100;
    return baseYield[type] * uniformityFactor;
  }

  private static getLightBasedIrrigationStrategy(): string {
    return `
      1. Install radiation sensor for light measurement
      2. Program irrigation controller with light sum triggers
      3. Set drain percentage targets based on daily light integral
      4. Monitor EC and adjust irrigation volume accordingly
      5. Implement dry-down period before night (1-2% reduction)
    `;
  }

  /**
   * Generate complete optimization report
   */
  static generateOptimizationReport(data: {
    greenhouseType: GreenhouseType;
    climateData: any[];
    energyData: any[];
    productionData: any[];
    greenhouseSizeM2: number;
    energyCostPerKWh: number;
  }): OptimizationResult {
    const currentPerformance = this.analyzePerformance(data);
    const recommendations = this.generateRecommendations(
      currentPerformance,
      data.greenhouseType
    );
    const potentialSavings = this.calculateSavings(
      currentPerformance,
      recommendations,
      data.greenhouseSizeM2,
      data.energyCostPerKWh
    );
    const automationStrategy = this.generateAutomationStrategy(data.greenhouseType);
    
    return {
      currentPerformance,
      recommendations,
      potentialSavings,
      automationStrategy
    };
  }
}