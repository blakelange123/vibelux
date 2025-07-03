// Revenue Sharing Baseline Establishment and Verification System
// This module handles baseline metrics capture, verification, and savings calculation

import { prisma } from './prisma';

export interface BaselineMetrics {
  // Energy Metrics - Detailed
  energy: {
    totalKwh: number;
    peakDemandKw: number;
    avgCostPerKwh: number;
    peakRateCostPerKwh: number;
    offPeakRateCostPerKwh: number;
    totalEnergyCost: number;
    powerFactor: number;
    monthlyDemandCharges: number;
    lightingKwh: number;
    hvacKwh: number;
    otherKwh: number;
  };
  
  // Production Metrics - Comprehensive
  production: {
    totalYield: number;
    yieldPerSqFt: number;
    yieldPerPlant: number;
    gradeAPercentage: number;
    gradeBPercentage: number;
    wastePercentage: number;
    averageCycleTime: number;
    plantsPerCycle: number;
    cyclesPerYear: number;
    harvestEfficiency: number;
  };
  
  // Environmental Data - Detailed with ranges
  environmental: {
    temperature: {
      avg: number;
      min: number;
      max: number;
      outOfRangeHours: number;
    };
    humidity: {
      avg: number;
      min: number;
      max: number;
      outOfRangeHours: number;
    };
    co2: {
      avg: number;
      min: number;
      max: number;
      enrichmentCost: number;
    };
    vpd: {
      avg: number;
      min: number;
      max: number;
      optimalHours: number;
    };
    lighting: {
      photoperiodHours: number;
      averagePPFD: number;
      averageDLI: number;
      spectrumEfficiency: number;
    };
  };
  
  // Water & Nutrients
  waterNutrients: {
    totalWaterUsage: number; // gallons
    waterCostPerGallon: number;
    runoffPercentage: number;
    nutrientCostPerMonth: number;
    ecAverage: number;
    phAverage: number;
    dossingAccuracy: number;
  };
  
  // Labor Metrics
  labor: {
    totalMonthlyHours: number;
    hourlyRate: number;
    overtimeHours: number;
    tasksPerHour: number;
    harvestHoursPerPound: number;
    maintenanceHours: number;
  };
  
  // Equipment & Maintenance
  equipment: {
    lightingFixtures: {
      count: number;
      avgAge: number;
      failureRate: number;
      maintenanceCostPerYear: number;
    };
    hvac: {
      units: number;
      avgEfficiency: number;
      maintenanceCostPerYear: number;
      breakdownsPerYear: number;
    };
    otherEquipment: {
      totalValue: number;
      avgDowntimeHours: number;
      repairCostsPerYear: number;
    };
  };
  
  // Financial Summary
  financial: {
    totalOperationalCost: number;
    costPerPound: number;
    revenuePerPound: number;
    grossMargin: number;
    ebitda: number;
  };
  
  // Quality Metrics
  quality: {
    thcAverage?: number;
    cbdAverage?: number;
    terpeneAverage?: number;
    microbialFailRate: number;
    pesticideFailRate: number;
    shelfLife: number;
    customerComplaints: number;
  };

  // Compliance & Testing
  compliance: {
    testingCostsPerMonth: number;
    retestingFrequency: number;
    complianceViolationsPerYear: number;
    complianceFinesPerYear: number;
    certificationCosts: number;
    auditHoursPerMonth: number;
  };

  // Pest & Disease Management
  pestDisease: {
    pestIncidentsPerMonth: number;
    diseaseIncidentsPerMonth: number;
    pestControlCostPerMonth: number;
    cropLossFromPestsDiseasePercent: number;
    preventativeTreatmentCost: number;
    ipmLaborHours: number;
  };

  // Inventory & Supply Chain
  inventory: {
    inventoryTurnoverRate: number;
    stockoutEventsPerMonth: number;
    excessInventoryValue: number;
    supplierLeadTime: number;
    rushOrderPremiumsPerMonth: number;
    inventoryCarryingCostPercent: number;
    shrinkagePercent: number;
  };

  // Data & Reporting
  dataManagement: {
    manualDataEntryHoursPerMonth: number;
    reportGenerationHoursPerMonth: number;
    dataErrorsPerMonth: number;
    decisionDelayDays: number;
    missedOptimizationOpportunities: number;
  };

  // Space Utilization
  spaceUtilization: {
    totalSquareFeet: number;
    productiveSquareFeet: number;
    utilizationPercent: number;
    rentPerSquareFoot: number;
    unproductiveSpaceCost: number;
    expansionConstraints: boolean;
  };

  // Technology Stack
  technology: {
    numberOfSystems: number;
    integrationIssuesPerMonth: number;
    systemDowntimeHours: number;
    manualDataTransferHours: number;
    licenseFeesPerMonth: number;
    itSupportHoursPerMonth: number;
  };

  // Market Timing & Sales
  marketTiming: {
    averageSellingPrice: number;
    priceVolatilityPercent: number;
    salesCycleTime: number;
    inventoryAgeAtSale: number;
    discountsGivenPercent: number;
    contractVsSpotSalesRatio: number;
  };
}

export interface BaselineRecord {
  id: string;
  facilityId: string;
  createdAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  status: 'draft' | 'pending_verification' | 'verified' | 'active';
  metrics: BaselineMetrics;
  dataCollectionPeriod: {
    startDate: Date;
    endDate: Date;
    daysCollected: number;
  };
  signature?: {
    customerName: string;
    customerEmail: string;
    signedAt: Date;
    ipAddress: string;
  };
  notes?: string;
}

export interface SavingsCalculation {
  baselineId: string;
  calculationDate: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  currentMetrics: BaselineMetrics;
  savings: {
    // Energy Savings
    energy: {
      kwhReduction: number;
      demandReduction: number;
      costSavings: number;
      demandChargeSavings: number;
      powerFactorImprovement: number;
    };
    
    // Production Improvements
    production: {
      yieldIncrease: number;
      yieldValue: number;
      gradeAImprovement: number;
      wasteReduction: number;
      wasteReductionValue: number;
      cycleTimeReduction: number;
      cycleTimeValue: number;
    };
    
    // Environmental Optimization
    environmental: {
      stabilityImprovement: number; // % time in optimal range
      co2SavingsValue: number;
      hvacEfficiencyValue: number;
    };
    
    // Water & Nutrient Savings
    waterNutrients: {
      waterReduction: number;
      waterCostSavings: number;
      nutrientSavings: number;
      runoffReduction: number;
    };
    
    // Labor Efficiency
    labor: {
      hoursSaved: number;
      laborCostSavings: number;
      overtimeReduction: number;
      productivityGain: number;
    };
    
    // Maintenance & Equipment
    equipment: {
      maintenanceSavings: number;
      downtimeReduction: number;
      lifespanExtension: number;
      failureReduction: number;
    };
    
    // Quality Improvements
    quality: {
      qualityScoreImprovement: number;
      failureRateReduction: number;
      complianceValue: number;
    };
    
    // Total Summary
    totalSavings: number;
    savingsPercentage: number;
    roi: number;
  };
  revenueShare: {
    percentage: number;
    amount: number;
    status: 'pending' | 'invoiced' | 'paid';
  };
}

export class BaselineManager {
  // Create a new baseline record
  async createBaseline(
    facilityId: string,
    metrics: BaselineMetrics,
    startDate: Date,
    endDate: Date
  ): Promise<BaselineRecord> {
    const baseline: BaselineRecord = {
      id: `baseline_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      facilityId,
      createdAt: new Date(),
      status: 'draft',
      metrics,
      dataCollectionPeriod: {
        startDate,
        endDate,
        daysCollected: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    };

    // Store in database (mock for now)
    await this.saveBaseline(baseline);
    
    return baseline;
  }

  // Verify baseline with customer signature
  async verifyBaseline(
    baselineId: string,
    customerInfo: {
      name: string;
      email: string;
      ipAddress: string;
    }
  ): Promise<BaselineRecord> {
    const baseline = await this.getBaseline(baselineId);
    
    if (!baseline) {
      throw new Error('Baseline not found');
    }

    baseline.verifiedAt = new Date();
    baseline.verifiedBy = customerInfo.email;
    baseline.status = 'verified';
    baseline.signature = {
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      signedAt: new Date(),
      ipAddress: customerInfo.ipAddress
    };

    await this.saveBaseline(baseline);
    
    return baseline;
  }

  // Calculate current savings compared to baseline
  async calculateSavings(
    baselineId: string,
    currentMetrics: BaselineMetrics,
    periodStart: Date,
    periodEnd: Date,
    revenueSharePercentage: number = 0.20 // Default 20%
  ): Promise<SavingsCalculation> {
    const baseline = await this.getBaseline(baselineId);
    
    if (!baseline || baseline.status !== 'verified') {
      throw new Error('Verified baseline not found');
    }

    const baselineMetrics = baseline.metrics;
    
    // Energy Savings
    const energy = {
      kwhReduction: baselineMetrics.energy.totalKwh - currentMetrics.energy.totalKwh,
      demandReduction: baselineMetrics.energy.peakDemandKw - currentMetrics.energy.peakDemandKw,
      costSavings: 0,
      demandChargeSavings: 0,
      powerFactorImprovement: currentMetrics.energy.powerFactor - baselineMetrics.energy.powerFactor
    };
    energy.costSavings = energy.kwhReduction * baselineMetrics.energy.avgCostPerKwh;
    energy.demandChargeSavings = energy.demandReduction * 15 * 12; // $15/kW/month

    // Production Improvements
    const production = {
      yieldIncrease: currentMetrics.production.totalYield - baselineMetrics.production.totalYield,
      yieldValue: 0,
      gradeAImprovement: currentMetrics.production.gradeAPercentage - baselineMetrics.production.gradeAPercentage,
      wasteReduction: baselineMetrics.production.wastePercentage - currentMetrics.production.wastePercentage,
      wasteReductionValue: 0,
      cycleTimeReduction: baselineMetrics.production.averageCycleTime - currentMetrics.production.averageCycleTime,
      cycleTimeValue: 0
    };
    production.yieldValue = production.yieldIncrease * (baselineMetrics.financial.revenuePerPound || 1000);
    production.wasteReductionValue = (production.wasteReduction / 100) * baselineMetrics.production.totalYield * (baselineMetrics.financial.revenuePerPound || 1000);
    production.cycleTimeValue = production.cycleTimeReduction > 0 ? (production.cycleTimeReduction / baselineMetrics.production.averageCycleTime) * baselineMetrics.financial.totalOperationalCost * 0.1 : 0;

    // Environmental Optimization
    const environmental = {
      stabilityImprovement: 0,
      co2SavingsValue: 0,
      hvacEfficiencyValue: 0
    };
    // Calculate stability improvement based on reduced out-of-range hours
    const tempImprovement = baselineMetrics.environmental.temperature.outOfRangeHours - currentMetrics.environmental.temperature.outOfRangeHours;
    const humidityImprovement = baselineMetrics.environmental.humidity.outOfRangeHours - currentMetrics.environmental.humidity.outOfRangeHours;
    environmental.stabilityImprovement = ((tempImprovement + humidityImprovement) / (baselineMetrics.environmental.temperature.outOfRangeHours + baselineMetrics.environmental.humidity.outOfRangeHours)) * 100;
    environmental.co2SavingsValue = (baselineMetrics.environmental.co2.enrichmentCost - currentMetrics.environmental.co2.enrichmentCost) * 12;
    environmental.hvacEfficiencyValue = energy.kwhReduction * 0.3 * baselineMetrics.energy.avgCostPerKwh; // Assume 30% of energy savings from HVAC

    // Water & Nutrient Savings
    const waterNutrients = {
      waterReduction: baselineMetrics.waterNutrients.totalWaterUsage - currentMetrics.waterNutrients.totalWaterUsage,
      waterCostSavings: 0,
      nutrientSavings: (baselineMetrics.waterNutrients.nutrientCostPerMonth - currentMetrics.waterNutrients.nutrientCostPerMonth) * 12,
      runoffReduction: baselineMetrics.waterNutrients.runoffPercentage - currentMetrics.waterNutrients.runoffPercentage
    };
    waterNutrients.waterCostSavings = waterNutrients.waterReduction * baselineMetrics.waterNutrients.waterCostPerGallon * 12;

    // Labor Efficiency
    const labor = {
      hoursSaved: baselineMetrics.labor.totalMonthlyHours - currentMetrics.labor.totalMonthlyHours,
      laborCostSavings: 0,
      overtimeReduction: baselineMetrics.labor.overtimeHours - currentMetrics.labor.overtimeHours,
      productivityGain: 0
    };
    labor.laborCostSavings = (labor.hoursSaved * baselineMetrics.labor.hourlyRate + labor.overtimeReduction * baselineMetrics.labor.hourlyRate * 1.5) * 12;
    labor.productivityGain = currentMetrics.labor.tasksPerHour > 0 ? ((currentMetrics.labor.tasksPerHour - baselineMetrics.labor.tasksPerHour) / baselineMetrics.labor.tasksPerHour) * 100 : 0;

    // Maintenance & Equipment
    const equipment = {
      maintenanceSavings: 0,
      downtimeReduction: 0,
      lifespanExtension: 0,
      failureReduction: 0
    };
    equipment.maintenanceSavings = (baselineMetrics.equipment.lightingFixtures.maintenanceCostPerYear - currentMetrics.equipment.lightingFixtures.maintenanceCostPerYear) +
                                  (baselineMetrics.equipment.hvac.maintenanceCostPerYear - currentMetrics.equipment.hvac.maintenanceCostPerYear);
    equipment.downtimeReduction = baselineMetrics.equipment.otherEquipment.avgDowntimeHours - currentMetrics.equipment.otherEquipment.avgDowntimeHours;
    equipment.failureReduction = baselineMetrics.equipment.lightingFixtures.failureRate - currentMetrics.equipment.lightingFixtures.failureRate;

    // Quality Improvements
    const quality = {
      qualityScoreImprovement: 0,
      failureRateReduction: 0,
      complianceValue: 0
    };
    quality.failureRateReduction = (baselineMetrics.quality.microbialFailRate - currentMetrics.quality.microbialFailRate) + 
                                   (baselineMetrics.quality.pesticideFailRate - currentMetrics.quality.pesticideFailRate);
    quality.complianceValue = quality.failureRateReduction * 0.01 * baselineMetrics.production.totalYield * (baselineMetrics.financial.revenuePerPound || 1000);

    // Calculate extended metric savings
    let extendedSavings = 0;

    // Compliance savings
    if (currentMetrics.compliance) {
      const complianceSavings = (baselineMetrics.compliance.testingCostsPerMonth - currentMetrics.compliance.testingCostsPerMonth) * 12 +
                               (baselineMetrics.compliance.complianceFinesPerYear - currentMetrics.compliance.complianceFinesPerYear) +
                               (baselineMetrics.compliance.auditHoursPerMonth - currentMetrics.compliance.auditHoursPerMonth) * 12 * 50;
      extendedSavings += complianceSavings;
    }

    // Pest & Disease savings
    if (currentMetrics.pestDisease) {
      const pestSavings = (baselineMetrics.pestDisease.pestControlCostPerMonth - currentMetrics.pestDisease.pestControlCostPerMonth) * 12 +
                         (baselineMetrics.pestDisease.cropLossFromPestsDiseasePercent - currentMetrics.pestDisease.cropLossFromPestsDiseasePercent) * 0.01 * 
                         baselineMetrics.production.totalYield * (baselineMetrics.financial.revenuePerPound || 1000);
      extendedSavings += pestSavings;
    }

    // Inventory savings
    if (currentMetrics.inventory) {
      const inventorySavings = (baselineMetrics.inventory.stockoutEventsPerMonth - currentMetrics.inventory.stockoutEventsPerMonth) * 12 * 10000 + // $10k per stockout
                              (baselineMetrics.inventory.rushOrderPremiumsPerMonth - currentMetrics.inventory.rushOrderPremiumsPerMonth) * 12;
      extendedSavings += inventorySavings;
    }

    // Technology savings
    if (currentMetrics.technology) {
      const techSavings = (baselineMetrics.technology.manualDataTransferHours - currentMetrics.technology.manualDataTransferHours) * 12 * 30 +
                         (baselineMetrics.technology.systemDowntimeHours - currentMetrics.technology.systemDowntimeHours) * 12 * 1000;
      extendedSavings += techSavings;
    }

    // Total Savings Calculation
    const totalSavings = energy.costSavings + energy.demandChargeSavings +
                        production.yieldValue + production.wasteReductionValue + production.cycleTimeValue +
                        environmental.co2SavingsValue + environmental.hvacEfficiencyValue +
                        waterNutrients.waterCostSavings + waterNutrients.nutrientSavings +
                        labor.laborCostSavings +
                        equipment.maintenanceSavings +
                        quality.complianceValue +
                        extendedSavings;

    const savingsPercentage = (totalSavings / baselineMetrics.financial.totalOperationalCost) * 100;
    const roi = (totalSavings / (totalSavings * revenueSharePercentage)) * 100;

    const savingsCalc: SavingsCalculation = {
      baselineId,
      calculationDate: new Date(),
      period: {
        startDate: periodStart,
        endDate: periodEnd
      },
      currentMetrics,
      savings: {
        energy,
        production,
        environmental,
        waterNutrients,
        labor,
        equipment,
        quality,
        totalSavings,
        savingsPercentage,
        roi
      },
      revenueShare: {
        percentage: revenueSharePercentage * 100,
        amount: totalSavings * revenueSharePercentage,
        status: 'pending'
      }
    };

    return savingsCalc;
  }

  // Generate baseline report as PDF data
  async generateBaselineReport(baselineId: string): Promise<any> {
    const baseline = await this.getBaseline(baselineId);
    
    if (!baseline) {
      throw new Error('Baseline not found');
    }

    return {
      title: 'VibeLux Revenue Sharing Baseline Report',
      baselineId: baseline.id,
      facilityId: baseline.facilityId,
      createdAt: baseline.createdAt,
      status: baseline.status,
      dataCollectionPeriod: baseline.dataCollectionPeriod,
      metrics: {
        'Energy Metrics': {
          'Total Energy Usage': `${baseline.metrics.energyUsageKwh.toLocaleString()} kWh`,
          'Energy Cost per kWh': `$${baseline.metrics.energyCostPerKwh.toFixed(3)}`,
          'Total Energy Cost': `$${baseline.metrics.totalEnergyCost.toLocaleString()}`,
          'Lighting Hours': `${baseline.metrics.lightingHours} hours/day`
        },
        'Production Metrics': {
          'Yield per Sq Ft': `${baseline.metrics.yieldPerSqFt.toFixed(2)} units/sqft`,
          'Total Yield': `${baseline.metrics.totalYield.toLocaleString()} units`,
          'Average PPFD': `${baseline.metrics.averagePPFD} μmol/m²/s`
        },
        'Environmental Metrics': {
          'Average Temperature': `${baseline.metrics.environmentalMetrics.avgTemperature}°F`,
          'Average Humidity': `${baseline.metrics.environmentalMetrics.avgHumidity}%`,
          'Average CO₂': `${baseline.metrics.environmentalMetrics.avgCO2} ppm`,
          'Average VPD': `${baseline.metrics.environmentalMetrics.avgVPD.toFixed(2)} kPa`
        }
      },
      signature: baseline.signature || null
    };
  }

  // Generate savings invoice data
  async generateSavingsInvoice(
    savingsCalc: SavingsCalculation,
    facilityInfo: any
  ): Promise<any> {
    return {
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      billTo: facilityInfo,
      baselineId: savingsCalc.baselineId,
      period: savingsCalc.period,
      lineItems: [
        {
          description: 'Energy Cost Savings',
          amount: savingsCalc.savings.energyCostSavings,
          quantity: 1
        },
        {
          description: 'Yield Improvement Value',
          amount: savingsCalc.savings.yieldValueImprovement,
          quantity: 1
        }
      ],
      totalSavings: savingsCalc.savings.totalSavings,
      revenueSharePercentage: savingsCalc.revenueShare.percentage,
      revenueShareAmount: savingsCalc.revenueShare.amount,
      paymentTerms: 'Net 30',
      paymentMethods: ['ACH Transfer', 'Check', 'Wire Transfer']
    };
  }

  // Helper methods
  private async saveBaseline(baseline: BaselineRecord): Promise<void> {
    // In production, this would save to database
    // For now, we'll use localStorage or in-memory storage
    if (typeof window !== 'undefined') {
      const baselines = JSON.parse(localStorage.getItem('vibelux_baselines') || '{}');
      baselines[baseline.id] = baseline;
      localStorage.setItem('vibelux_baselines', JSON.stringify(baselines));
    }
  }

  private async getBaseline(baselineId: string): Promise<BaselineRecord | null> {
    // In production, this would fetch from database
    if (typeof window !== 'undefined') {
      const baselines = JSON.parse(localStorage.getItem('vibelux_baselines') || '{}');
      return baselines[baselineId] || null;
    }
    return null;
  }

  // Get all baselines for a facility
  async getFacilityBaselines(facilityId: string): Promise<BaselineRecord[]> {
    if (typeof window !== 'undefined') {
      const baselines = JSON.parse(localStorage.getItem('vibelux_baselines') || '{}');
      return Object.values(baselines).filter((b: any) => b.facilityId === facilityId);
    }
    return [];
  }

  // Validate baseline data quality
  validateBaselineData(metrics: BaselineMetrics): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Energy validation
    if (metrics.energy.totalKwh <= 0) {
      errors.push('Energy usage must be greater than 0');
    }
    if (metrics.energy.avgCostPerKwh <= 0) {
      errors.push('Energy cost per kWh must be greater than 0');
    }
    if (metrics.energy.powerFactor < 0 || metrics.energy.powerFactor > 1) {
      errors.push('Power factor must be between 0 and 1');
    }

    // Production validation
    if (metrics.production.totalYield < 0) {
      errors.push('Total yield cannot be negative');
    }
    if (metrics.production.gradeAPercentage < 0 || metrics.production.gradeAPercentage > 100) {
      errors.push('Grade A percentage must be between 0 and 100');
    }
    if (metrics.production.wastePercentage < 0 || metrics.production.wastePercentage > 100) {
      errors.push('Waste percentage must be between 0 and 100');
    }

    // Environmental validation
    if (metrics.environmental.lighting.photoperiodHours < 0 || metrics.environmental.lighting.photoperiodHours > 24) {
      errors.push('Photoperiod hours must be between 0 and 24');
    }
    if (metrics.environmental.lighting.averagePPFD < 0 || metrics.environmental.lighting.averagePPFD > 2000) {
      errors.push('Average PPFD must be between 0 and 2000');
    }

    // Water & Nutrients validation
    if (metrics.waterNutrients.runoffPercentage < 0 || metrics.waterNutrients.runoffPercentage > 100) {
      errors.push('Runoff percentage must be between 0 and 100');
    }
    if (metrics.waterNutrients.phAverage < 0 || metrics.waterNutrients.phAverage > 14) {
      errors.push('pH must be between 0 and 14');
    }

    // Financial validation
    if (metrics.financial.grossMargin < -100 || metrics.financial.grossMargin > 100) {
      errors.push('Gross margin must be between -100 and 100');
    }

    // Quality validation
    if (metrics.quality.microbialFailRate < 0 || metrics.quality.microbialFailRate > 100) {
      errors.push('Microbial fail rate must be between 0 and 100');
    }
    if (metrics.quality.pesticideFailRate < 0 || metrics.quality.pesticideFailRate > 100) {
      errors.push('Pesticide fail rate must be between 0 and 100');
    }

    // Extended metrics validation
    if (metrics.compliance && metrics.compliance.complianceViolationsPerYear < 0) {
      errors.push('Compliance violations cannot be negative');
    }
    
    if (metrics.pestDisease && metrics.pestDisease.cropLossFromPestsDiseasePercent < 0) {
      errors.push('Crop loss percentage cannot be negative');
    }

    if (metrics.inventory && metrics.inventory.inventoryTurnoverRate < 0) {
      errors.push('Inventory turnover rate cannot be negative');
    }

    if (metrics.spaceUtilization && metrics.spaceUtilization.utilizationPercent > 100) {
      errors.push('Space utilization cannot exceed 100%');
    }

    if (metrics.marketTiming && metrics.marketTiming.priceVolatilityPercent < 0) {
      errors.push('Price volatility cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const baselineManager = new BaselineManager();