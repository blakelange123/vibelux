/**
 * Advanced Fixture Aging Simulation
 * L70, L80, L90 degradation modeling based on LM-80 standards
 */

export interface LEDDegradationModel {
  l90Hours: number;    // Hours to 90% light output
  l80Hours: number;    // Hours to 80% light output
  l70Hours: number;    // Hours to 70% light output
  degradationRate: number;  // Per hour degradation factor
  temperatureFactor: number; // Temperature acceleration factor
}

export interface EnvironmentalFactors {
  temperature: {
    optimal: number;     // °C optimal operating temperature
    factorPer10C: number; // Degradation doubles every 10°C above optimal
  };
  humidity: {
    optimal: number;     // % optimal relative humidity
    factorHigh: number;  // High humidity acceleration
    factorLow: number;   // Low humidity acceleration
  };
  dutyCycle: {
    continuous: number;  // 24/7 operation
    standard: number;    // 12-16 hours/day
    lightDuty: number;   // 8-12 hours/day
  };
}

export interface MaintenanceMilestone {
  hours: number;
  days: number;
  years: number;
  description: string;
}

export interface AgingSimulationResult {
  timeHours: number[];
  timeYears: number[];
  lightOutputPercent: number[];
  dliImpactPercent: number[];
  milestones: {
    l90: MaintenanceMilestone;
    l80: MaintenanceMilestone;
    l70: MaintenanceMilestone;
  };
  accelerationFactor: number;
  environmentalConditions: {
    temperature: number;
    humidity: number;
    hoursPerDay: number;
  };
}

export class FixtureAgingSimulator {
  private ledDegradationModels: { [key: string]: LEDDegradationModel } = {
    'high_quality_led': {
      l90Hours: 50000,
      l80Hours: 75000,
      l70Hours: 100000,
      degradationRate: 0.0002,
      temperatureFactor: 1.0
    },
    'standard_led': {
      l90Hours: 35000,
      l80Hours: 50000,
      l70Hours: 70000,
      degradationRate: 0.0003,
      temperatureFactor: 1.2
    },
    'budget_led': {
      l90Hours: 25000,
      l80Hours: 35000,
      l70Hours: 50000,
      degradationRate: 0.0005,
      temperatureFactor: 1.5
    },
    'hps': {
      l90Hours: 15000,
      l80Hours: 20000,
      l70Hours: 24000,
      degradationRate: 0.001,
      temperatureFactor: 0.8
    },
    'metal_halide': {
      l90Hours: 12000,
      l80Hours: 15000,
      l70Hours: 20000,
      degradationRate: 0.0012,
      temperatureFactor: 0.9
    },
    'fluorescent_t5': {
      l90Hours: 18000,
      l80Hours: 22000,
      l70Hours: 30000,
      degradationRate: 0.0008,
      temperatureFactor: 1.1
    }
  };

  private environmentalFactors: EnvironmentalFactors = {
    temperature: {
      optimal: 25,
      factorPer10C: 2.0
    },
    humidity: {
      optimal: 50,
      factorHigh: 1.3,
      factorLow: 1.1
    },
    dutyCycle: {
      continuous: 1.0,
      standard: 0.6,
      lightDuty: 0.4
    }
  };

  /**
   * Simulate fixture aging over time with environmental factors
   */
  simulateAgingCurve(
    fixtureType: string,
    operatingHoursPerDay: number = 16,
    operatingTemperature: number = 30,
    humidity: number = 60,
    simulationYears: number = 10
  ): AgingSimulationResult {
    const model = this.ledDegradationModels[fixtureType] || this.ledDegradationModels.standard_led;
    
    // Calculate environmental acceleration factors
    const tempAcceleration = this.calculateTemperatureFactor(operatingTemperature, model.temperatureFactor);
    const humidityAcceleration = this.calculateHumidityFactor(humidity);
    const dutyCycleFactor = operatingHoursPerDay / 24;
    
    // Combined acceleration factor
    const accelerationFactor = tempAcceleration * humidityAcceleration * dutyCycleFactor;
    
    // Adjusted degradation rate
    const adjustedDegradationRate = model.degradationRate * accelerationFactor;
    
    // Generate time series data (monthly points)
    const dataPoints = simulationYears * 12;
    const totalHours = simulationYears * 365 * operatingHoursPerDay;
    const timeHours: number[] = [];
    const timeYears: number[] = [];
    const lightOutputPercent: number[] = [];
    
    for (let i = 0; i <= dataPoints; i++) {
      const hours = (totalHours * i) / dataPoints;
      const years = hours / (365 * operatingHoursPerDay);
      const lightOutput = this.calculateLightOutput(hours, adjustedDegradationRate);
      
      timeHours.push(hours);
      timeYears.push(years);
      lightOutputPercent.push(lightOutput);
    }
    
    // Calculate maintenance milestones
    const milestones = this.calculateMaintenanceMilestones(model, accelerationFactor, operatingHoursPerDay);
    
    return {
      timeHours,
      timeYears,
      lightOutputPercent,
      dliImpactPercent: lightOutputPercent, // DLI scales directly with light output
      milestones,
      accelerationFactor,
      environmentalConditions: {
        temperature: operatingTemperature,
        humidity,
        hoursPerDay: operatingHoursPerDay
      }
    };
  }

  /**
   * Calculate projected maintenance costs over fixture lifetime
   */
  calculateLifetimeCosts(
    fixtureType: string,
    fixtureCost: number,
    electricityRate: number, // $/kWh
    fixtureWattage: number,
    operatingHoursPerDay: number = 16,
    operatingTemperature: number = 30,
    humidity: number = 60
  ) {
    const simulation = this.simulateAgingCurve(
      fixtureType,
      operatingHoursPerDay,
      operatingTemperature,
      humidity,
      10 // 10 year simulation
    );
    
    const l70Years = simulation.milestones.l70.years;
    const totalOperatingHours = l70Years * 365 * operatingHoursPerDay;
    
    // Energy costs
    const totalKWh = (fixtureWattage / 1000) * totalOperatingHours;
    const energyCost = totalKWh * electricityRate;
    
    // Replacement costs (assume replacement at L70)
    const replacementCost = fixtureCost;
    
    // Maintenance costs (assume 2% of fixture cost per year)
    const annualMaintenanceCost = fixtureCost * 0.02;
    const totalMaintenanceCost = annualMaintenanceCost * l70Years;
    
    // Total cost of ownership
    const totalCost = fixtureCost + energyCost + replacementCost + totalMaintenanceCost;
    
    // Cost per operating hour
    const costPerHour = totalCost / totalOperatingHours;
    
    // Annual costs
    const annualEnergyCost = energyCost / l70Years;
    const annualTotalCost = totalCost / l70Years;
    
    return {
      lifetimeYears: l70Years,
      totalOperatingHours,
      costs: {
        initial: fixtureCost,
        energy: energyCost,
        replacement: replacementCost,
        maintenance: totalMaintenanceCost,
        total: totalCost
      },
      annualCosts: {
        energy: annualEnergyCost,
        maintenance: annualMaintenanceCost,
        total: annualTotalCost
      },
      metrics: {
        costPerHour,
        costPerYear: annualTotalCost,
        energyEfficiencyLoss: 30 // 30% loss at L70
      }
    };
  }

  /**
   * Compare different fixture types for total cost of ownership
   */
  compareFixtureTypes(
    fixtureOptions: Array<{
      type: string;
      cost: number;
      wattage: number;
      ppf: number;
    }>,
    electricityRate: number,
    operatingHoursPerDay: number = 16,
    operatingTemperature: number = 30,
    humidity: number = 60
  ) {
    const comparisons = fixtureOptions.map(fixture => {
      const lifetimeCosts = this.calculateLifetimeCosts(
        fixture.type,
        fixture.cost,
        electricityRate,
        fixture.wattage,
        operatingHoursPerDay,
        operatingTemperature,
        humidity
      );
      
      const simulation = this.simulateAgingCurve(
        fixture.type,
        operatingHoursPerDay,
        operatingTemperature,
        humidity,
        10
      );
      
      return {
        ...fixture,
        ...lifetimeCosts,
        l90Years: simulation.milestones.l90.years,
        l80Years: simulation.milestones.l80.years,
        l70Years: simulation.milestones.l70.years,
        ppfPerDollar: fixture.ppf / lifetimeCosts.costs.total * lifetimeCosts.totalOperatingHours
      };
    });
    
    // Sort by total cost of ownership
    comparisons.sort((a, b) => a.costs.total - b.costs.total);
    
    return comparisons;
  }

  private calculateTemperatureFactor(operatingTemp: number, baseTempFactor: number): number {
    const optimalTemp = this.environmentalFactors.temperature.optimal;
    const factorPer10C = this.environmentalFactors.temperature.factorPer10C;
    
    if (operatingTemp <= optimalTemp) {
      return baseTempFactor;
    }
    
    const tempExcess = operatingTemp - optimalTemp;
    const tempFactor = baseTempFactor * Math.pow(factorPer10C, tempExcess / 10);
    
    return tempFactor;
  }

  private calculateHumidityFactor(humidity: number): number {
    const optimalHumidity = this.environmentalFactors.humidity.optimal;
    
    if (humidity > 70) {
      return this.environmentalFactors.humidity.factorHigh;
    } else if (humidity < 30) {
      return this.environmentalFactors.humidity.factorLow;
    } else {
      return 1.0;
    }
  }

  private calculateLightOutput(timeHours: number, degradationRate: number): number {
    // Exponential decay model
    let lightOutput = 100 * Math.exp(-degradationRate * timeHours);
    
    // Ensure output doesn't go below practical minimum
    lightOutput = Math.max(lightOutput, 30); // 30% minimum output
    
    return lightOutput;
  }

  private calculateMaintenanceMilestones(
    model: LEDDegradationModel,
    accelerationFactor: number,
    hoursPerDay: number
  ) {
    // Adjust milestone hours for environmental conditions
    const l90HoursAdjusted = model.l90Hours / accelerationFactor;
    const l80HoursAdjusted = model.l80Hours / accelerationFactor;
    const l70HoursAdjusted = model.l70Hours / accelerationFactor;
    
    return {
      l90: {
        hours: l90HoursAdjusted,
        days: l90HoursAdjusted / hoursPerDay,
        years: l90HoursAdjusted / (hoursPerDay * 365),
        description: '90% light output - First noticeable degradation'
      },
      l80: {
        hours: l80HoursAdjusted,
        days: l80HoursAdjusted / hoursPerDay,
        years: l80HoursAdjusted / (hoursPerDay * 365),
        description: '80% light output - Recommended replacement consideration'
      },
      l70: {
        hours: l70HoursAdjusted,
        days: l70HoursAdjusted / hoursPerDay,
        years: l70HoursAdjusted / (hoursPerDay * 365),
        description: '70% light output - End of useful life'
      }
    };
  }

  /**
   * Generate replacement schedule for facility
   */
  generateReplacementSchedule(
    fixtures: Array<{
      id: string;
      type: string;
      installDate: Date;
      quantity: number;
    }>,
    operatingHoursPerDay: number = 16,
    operatingTemperature: number = 30,
    humidity: number = 60
  ) {
    const schedule: Array<{
      fixtureId: string;
      replacementDate: Date;
      milestone: 'L90' | 'L80' | 'L70';
      daysFromNow: number;
      quantity: number;
    }> = [];
    
    const now = new Date();
    
    fixtures.forEach(fixture => {
      const model = this.ledDegradationModels[fixture.type] || this.ledDegradationModels.standard_led;
      const milestones = this.calculateMaintenanceMilestones(
        model,
        this.calculateTemperatureFactor(operatingTemperature, model.temperatureFactor) *
        this.calculateHumidityFactor(humidity) *
        (operatingHoursPerDay / 24),
        operatingHoursPerDay
      );
      
      // Calculate days since installation
      const daysSinceInstall = Math.floor((now.getTime() - fixture.installDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Add replacement milestones
      ['l90', 'l80', 'l70'].forEach(milestone => {
        const milestoneDays = milestones[milestone as keyof typeof milestones].days;
        const daysUntilMilestone = milestoneDays - daysSinceInstall;
        
        if (daysUntilMilestone > 0) {
          const replacementDate = new Date(now);
          replacementDate.setDate(replacementDate.getDate() + daysUntilMilestone);
          
          schedule.push({
            fixtureId: fixture.id,
            replacementDate,
            milestone: milestone.toUpperCase() as 'L90' | 'L80' | 'L70',
            daysFromNow: daysUntilMilestone,
            quantity: fixture.quantity
          });
        }
      });
    });
    
    // Sort by replacement date
    schedule.sort((a, b) => a.daysFromNow - b.daysFromNow);
    
    return schedule;
  }
}

// Export singleton instance
export const fixtureAgingSimulator = new FixtureAgingSimulator();