// Comprehensive energy analysis and ROI calculations for greenhouse operations

export interface EnergyConsumption {
  lighting: number; // kWh/day
  heating: number; // kWh/day
  cooling: number; // kWh/day
  ventilation: number; // kWh/day
  pumps: number; // kWh/day
  controls: number; // kWh/day
  total: number; // kWh/day
}

export interface EnergyCosts {
  electricity: number; // $/kWh
  naturalGas: number; // $/therm
  propane: number; // $/gallon
  peakDemandCharge: number; // $/kW
  timeOfUseRates?: {
    peak: number; // $/kWh
    offPeak: number; // $/kWh
    peakHours: { start: number; end: number };
  };
}

export interface ROIMetrics {
  totalInvestment: number;
  annualOperatingCost: number;
  annualRevenue: number;
  netAnnualProfit: number;
  paybackPeriod: number; // years
  roi: number; // percentage
  npv: number; // net present value
  irr: number; // internal rate of return
}

export interface SustainabilityMetrics {
  carbonFootprint: number; // kg CO2/year
  waterUsage: number; // L/year
  waterRecycling: number; // percentage
  renewableEnergy: number; // percentage
  energyEfficiency: number; // kWh/kg produce
}

export class GreenhouseEnergyAnalyzer {
  // Calculate lighting energy consumption
  static calculateLightingEnergy(
    fixtureCount: number,
    wattagePerFixture: number,
    photoperiod: number,
    dimmingLevel: number = 1.0
  ): number {
    return (fixtureCount * wattagePerFixture * photoperiod * dimmingLevel) / 1000; // kWh/day
  }

  // Calculate heating energy requirement
  static calculateHeatingEnergy(
    surfaceArea: number,
    uValue: number,
    insideTemp: number,
    outsideTemp: number,
    efficiency: number = 0.85
  ): number {
    const deltaT = Math.max(0, insideTemp - outsideTemp);
    const heatLoss = surfaceArea * uValue * deltaT; // Watts
    return (heatLoss * 24) / (1000 * efficiency); // kWh/day
  }

  // Calculate cooling energy requirement
  static calculateCoolingEnergy(
    coolingLoad: number, // BTU/hr
    cop: number = 3.5, // Coefficient of Performance
    runHours: number = 12
  ): number {
    const watts = coolingLoad * 0.293; // Convert BTU/hr to watts
    return (watts * runHours) / (1000 * cop); // kWh/day
  }

  // Calculate ventilation energy
  static calculateVentilationEnergy(
    airVolume: number, // m³/hr
    staticPressure: number, // Pa
    fanEfficiency: number = 0.7,
    runHours: number = 24
  ): number {
    const power = (airVolume * staticPressure) / (3600 * fanEfficiency); // Watts
    return (power * runHours) / 1000; // kWh/day
  }

  // Calculate pump energy for irrigation
  static calculatePumpEnergy(
    flowRate: number, // L/min
    head: number, // meters
    pumpEfficiency: number = 0.6,
    runTime: number = 2 // hours/day
  ): number {
    const power = (flowRate * head * 9.81) / (60 * pumpEfficiency); // Watts
    return (power * runTime) / 1000; // kWh/day
  }

  // Calculate total energy consumption
  static calculateTotalEnergy(
    greenhouseArea: number,
    lighting: { fixtures: number; wattage: number; photoperiod: number; dimming: number },
    climate: { heating: number; cooling: number; ventilation: number },
    irrigation: { flowRate: number; head: number; runTime: number }
  ): EnergyConsumption {
    const lightingEnergy = this.calculateLightingEnergy(
      lighting.fixtures,
      lighting.wattage,
      lighting.photoperiod,
      lighting.dimming
    );

    const heatingEnergy = climate.heating; // Pre-calculated based on climate zone
    const coolingEnergy = climate.cooling;
    const ventilationEnergy = climate.ventilation;

    const pumpEnergy = this.calculatePumpEnergy(
      irrigation.flowRate,
      irrigation.head,
      0.6,
      irrigation.runTime
    );

    const controlsEnergy = 0.5; // Base load for controls and monitoring

    return {
      lighting: lightingEnergy,
      heating: heatingEnergy,
      cooling: coolingEnergy,
      ventilation: ventilationEnergy,
      pumps: pumpEnergy,
      controls: controlsEnergy,
      total: lightingEnergy + heatingEnergy + coolingEnergy + ventilationEnergy + pumpEnergy + controlsEnergy
    };
  }

  // Calculate energy costs with time-of-use rates
  static calculateEnergyCosts(
    consumption: EnergyConsumption,
    rates: EnergyCosts,
    lightingSchedule?: { start: number; end: number }
  ): number {
    let dailyCost = 0;

    if (rates.timeOfUseRates && lightingSchedule) {
      // Calculate peak vs off-peak usage
      const peakOverlap = this.calculateHourOverlap(
        lightingSchedule,
        rates.timeOfUseRates.peakHours
      );
      const offPeakHours = 24 - peakOverlap;

      // Lighting costs
      const peakLighting = consumption.lighting * (peakOverlap / 24);
      const offPeakLighting = consumption.lighting * (offPeakHours / 24);
      dailyCost += peakLighting * rates.timeOfUseRates.peak;
      dailyCost += offPeakLighting * rates.timeOfUseRates.offPeak;

      // Other loads (assume distributed throughout day)
      const otherLoads = consumption.total - consumption.lighting;
      const peakOther = otherLoads * (rates.timeOfUseRates.peakHours.end - rates.timeOfUseRates.peakHours.start) / 24;
      const offPeakOther = otherLoads - peakOther;
      dailyCost += peakOther * rates.timeOfUseRates.peak;
      dailyCost += offPeakOther * rates.timeOfUseRates.offPeak;
    } else {
      // Flat rate
      dailyCost = consumption.total * rates.electricity;
    }

    return dailyCost;
  }

  // Calculate ROI metrics
  static calculateROI(
    investment: {
      structure: number;
      equipment: number;
      installation: number;
    },
    annual: {
      revenue: number;
      operatingCosts: number;
      maintenanceCosts: number;
    },
    financials: {
      discountRate: number;
      projectLife: number; // years
      taxRate: number;
      incentives?: number;
    }
  ): ROIMetrics {
    const totalInvestment = investment.structure + investment.equipment + investment.installation - (financials.incentives || 0);
    const annualOperatingCost = annual.operatingCosts + annual.maintenanceCosts;
    const netAnnualProfit = annual.revenue - annualOperatingCost;
    const afterTaxProfit = netAnnualProfit * (1 - financials.taxRate);

    // Simple payback period
    const paybackPeriod = totalInvestment / afterTaxProfit;

    // ROI percentage
    const roi = (afterTaxProfit / totalInvestment) * 100;

    // NPV calculation
    let npv = -totalInvestment;
    for (let year = 1; year <= financials.projectLife; year++) {
      npv += afterTaxProfit / Math.pow(1 + financials.discountRate, year);
    }

    // IRR calculation (simplified)
    const irr = this.calculateIRR(
      -totalInvestment,
      afterTaxProfit,
      financials.projectLife
    );

    return {
      totalInvestment,
      annualOperatingCost,
      annualRevenue: annual.revenue,
      netAnnualProfit,
      paybackPeriod,
      roi,
      npv,
      irr
    };
  }

  // Calculate carbon footprint
  static calculateCarbonFootprint(
    energyConsumption: EnergyConsumption,
    energySources: {
      gridElectricity: number; // kg CO2/kWh
      naturalGas?: number; // kg CO2/therm
      renewablePercentage: number;
    }
  ): number {
    const electricityEmissions = energyConsumption.total * 365 * energySources.gridElectricity;
    const adjustedEmissions = electricityEmissions * (1 - energySources.renewablePercentage / 100);
    
    return adjustedEmissions;
  }

  // Calculate water efficiency metrics
  static calculateWaterEfficiency(
    waterUsage: {
      irrigation: number; // L/day
      cooling: number; // L/day
      cleaning: number; // L/day
    },
    recycling: {
      drainWaterRecovery: number; // percentage
      rainwaterHarvesting: number; // L/year
      condensateRecovery: number; // L/day
    },
    production: number // kg/year
  ): {
    totalUsage: number;
    recycledWater: number;
    waterEfficiency: number; // L/kg produce
  } {
    const dailyUsage = waterUsage.irrigation + waterUsage.cooling + waterUsage.cleaning;
    const annualUsage = dailyUsage * 365;
    
    const recycledDaily = (waterUsage.irrigation * recycling.drainWaterRecovery / 100) + recycling.condensateRecovery;
    const recycledAnnual = (recycledDaily * 365) + recycling.rainwaterHarvesting;
    
    const netUsage = annualUsage - recycledAnnual;
    const waterEfficiency = netUsage / production;

    return {
      totalUsage: annualUsage,
      recycledWater: recycledAnnual,
      waterEfficiency
    };
  }

  // Helper functions
  private static calculateHourOverlap(
    schedule1: { start: number; end: number },
    schedule2: { start: number; end: number }
  ): number {
    const start = Math.max(schedule1.start, schedule2.start);
    const end = Math.min(schedule1.end, schedule2.end);
    return Math.max(0, end - start);
  }

  private static calculateIRR(
    initialInvestment: number,
    annualCashFlow: number,
    years: number
  ): number {
    // Simplified IRR calculation using Newton's method
    let rate = 0.1; // Initial guess
    let npv = 0;
    let derivative = 0;

    for (let i = 0; i < 10; i++) {
      npv = initialInvestment;
      derivative = 0;

      for (let t = 1; t <= years; t++) {
        npv += annualCashFlow / Math.pow(1 + rate, t);
        derivative -= t * annualCashFlow / Math.pow(1 + rate, t + 1);
      }

      if (Math.abs(npv) < 0.01) break;
      rate = rate - npv / derivative;
    }

    return rate * 100; // Return as percentage
  }

  // Energy optimization recommendations
  static generateOptimizationRecommendations(
    consumption: EnergyConsumption,
    costs: EnergyCosts
  ): Array<{
    category: string;
    recommendation: string;
    potentialSaving: number; // $/year
    implementation: 'easy' | 'moderate' | 'complex';
  }> {
    const recommendations = [];

    // Lighting recommendations
    if (consumption.lighting > consumption.total * 0.5) {
      recommendations.push({
        category: 'Lighting',
        recommendation: 'Implement advanced dimming strategies based on natural light',
        potentialSaving: consumption.lighting * 0.15 * costs.electricity * 365,
        implementation: 'moderate' as const
      });
    }

    // Heating recommendations
    if (consumption.heating > consumption.total * 0.3) {
      recommendations.push({
        category: 'Heating',
        recommendation: 'Install thermal screens for night-time heat retention',
        potentialSaving: consumption.heating * 0.25 * costs.electricity * 365,
        implementation: 'moderate' as const
      });
    }

    // Time-of-use optimization
    if (costs.timeOfUseRates) {
      recommendations.push({
        category: 'Scheduling',
        recommendation: 'Shift lighting schedule to maximize off-peak usage',
        potentialSaving: consumption.lighting * 0.2 * (costs.timeOfUseRates.peak - costs.timeOfUseRates.offPeak) * 365,
        implementation: 'easy' as const
      });
    }

    // Renewable energy
    recommendations.push({
      category: 'Renewable Energy',
      recommendation: 'Install solar panels to offset 30% of electricity usage',
      potentialSaving: consumption.total * 0.3 * costs.electricity * 365,
      implementation: 'complex' as const
    });

    return recommendations.sort((a, b) => b.potentialSaving - a.potentialSaving);
  }
}