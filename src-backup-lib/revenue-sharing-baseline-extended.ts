// Extended baseline metrics for comprehensive revenue sharing
// These additional metrics capture areas where VibeLux creates value

export interface ExtendedBaselineMetrics {
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

  // Training & Knowledge
  training: {
    trainingHoursPerEmployee: number;
    trainingCostPerEmployee: number;
    mistakesFromLackOfTraining: number;
    employeeTurnoverRate: number;
    onboardingTime: number;
    skillGapCount: number;
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

  // Climate Control Precision
  climateControl: {
    temperatureDeviationEvents: number;
    humidityDeviationEvents: number;
    co2WasteFromPoorControl: number;
    hvacRuntimeHours: number;
    unnecessaryCoolingHeatingCycles: number;
    equipmentStressFromFluctuations: number;
  };

  // Scheduling & Coordination
  scheduling: {
    scheduleConflictsPerMonth: number;
    idleTimeHoursPerMonth: number;
    overtimeFromPoorScheduling: number;
    missedTasksPerMonth: number;
    rushJobsPerMonth: number;
    communicationDelaysHours: number;
  };

  // Insurance & Risk
  insurance: {
    annualPremium: number;
    deductible: number;
    claimsPerYear: number;
    claimsDeniedPerYear: number;
    uninsuredLosses: number;
    riskScore: number;
  };

  // Utility Rebates & Incentives
  incentives: {
    missedRebateOpportunities: number;
    currentRebatesReceived: number;
    potentialRebatesAvailable: number;
    applicationHoursRequired: number;
    consultantFeesForApplications: number;
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

  // Cultivation Expertise
  cultivation: {
    strainOptimizationScore: number; // 1-10
    environmentalControlScore: number; // 1-10
    nutritionOptimizationScore: number; // 1-10
    ipmEffectivenessScore: number; // 1-10
    harvestTimingAccuracy: number; // percentage
    cureOptimizationScore: number; // 1-10
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

  // Carbon & Sustainability
  sustainability: {
    carbonFootprintTons: number;
    renewableEnergyPercent: number;
    waterRecyclingPercent: number;
    wasteToLandfillTons: number;
    sustainabilityCertifications: number;
    carbonOffsetCost: number;
  };

  // Research & Development
  research: {
    rdHoursPerMonth: number;
    experimentalBatchesPerMonth: number;
    failedExperimentsPercent: number;
    timeToMarketNewProducts: number;
    innovationScore: number; // 1-10
  };
}

// Combine with main baseline metrics
export interface ComprehensiveBaselineMetrics extends ExtendedBaselineMetrics {
  // Include all the original baseline metrics
  energy: any;
  production: any;
  environmental: any;
  waterNutrients: any;
  labor: any;
  equipment: any;
  financial: any;
  quality: any;
}

// Value calculation helpers
export const calculateExtendedSavings = {
  // Compliance savings
  complianceSavings: (baseline: ExtendedBaselineMetrics, current: ExtendedBaselineMetrics) => {
    const testingReduction = (baseline.compliance.testingCostsPerMonth - current.compliance.testingCostsPerMonth) * 12;
    const fineReduction = baseline.compliance.complianceFinesPerYear - current.compliance.complianceFinesPerYear;
    const auditEfficiency = (baseline.compliance.auditHoursPerMonth - current.compliance.auditHoursPerMonth) * 12 * 50; // $50/hour
    return testingReduction + fineReduction + auditEfficiency;
  },

  // IPM savings
  pestDiseaseSavings: (baseline: ExtendedBaselineMetrics, current: ExtendedBaselineMetrics) => {
    const incidentReduction = (baseline.pestDisease.pestIncidentsPerMonth - current.pestDisease.pestIncidentsPerMonth) * 12 * 5000; // $5k per incident
    const cropLossReduction = (baseline.pestDisease.cropLossFromPestsDiseasePercent - current.pestDisease.cropLossFromPestsDiseasePercent) / 100 * 1000000; // Assuming $1M annual revenue
    const treatmentSavings = (baseline.pestDisease.pestControlCostPerMonth - current.pestDisease.pestControlCostPerMonth) * 12;
    return incidentReduction + cropLossReduction + treatmentSavings;
  },

  // Space optimization value
  spaceUtilizationSavings: (baseline: ExtendedBaselineMetrics, current: ExtendedBaselineMetrics) => {
    const additionalProductiveSpace = current.spaceUtilization.productiveSquareFeet - baseline.spaceUtilization.productiveSquareFeet;
    const revenuePerSqFt = 200; // Industry average $200/sqft/year
    return additionalProductiveSpace * revenuePerSqFt;
  },

  // Technology efficiency
  technologySavings: (baseline: ExtendedBaselineMetrics, current: ExtendedBaselineMetrics) => {
    const integrationTimeSaved = (baseline.technology.manualDataTransferHours - current.technology.manualDataTransferHours) * 12 * 30; // $30/hour
    const downtimeReduction = (baseline.technology.systemDowntimeHours - current.technology.systemDowntimeHours) * 12 * 1000; // $1000/hour downtime cost
    const licensingOptimization = (baseline.technology.licenseFeesPerMonth - current.technology.licenseFeesPerMonth) * 12;
    return integrationTimeSaved + downtimeReduction + licensingOptimization;
  },

  // Market timing optimization
  marketTimingSavings: (baseline: ExtendedBaselineMetrics, current: ExtendedBaselineMetrics) => {
    const priceImprovement = (current.marketTiming.averageSellingPrice - baseline.marketTiming.averageSellingPrice) * 10000; // 10,000 units
    const cycleTimeValue = (baseline.marketTiming.salesCycleTime - current.marketTiming.salesCycleTime) * 500; // $500/day faster sales
    const discountReduction = (baseline.marketTiming.discountsGivenPercent - current.marketTiming.discountsGivenPercent) / 100 * 1000000; // On $1M sales
    return priceImprovement + cycleTimeValue + discountReduction;
  },

  // Sustainability benefits (including potential carbon credits)
  sustainabilitySavings: (baseline: ExtendedBaselineMetrics, current: ExtendedBaselineMetrics) => {
    const carbonReduction = (baseline.sustainability.carbonFootprintTons - current.sustainability.carbonFootprintTons) * 50; // $50/ton carbon credit
    const wasteReduction = (baseline.sustainability.wasteToLandfillTons - current.sustainability.wasteToLandfillTons) * 100; // $100/ton disposal cost
    const waterSavings = (baseline.sustainability.waterRecyclingPercent < current.sustainability.waterRecyclingPercent) ? 5000 : 0; // Water recycling incentive
    return carbonReduction + wasteReduction + waterSavings;
  }
};

// Risk mitigation value (harder to quantify but important)
export const calculateRiskMitigationValue = {
  // Reduced insurance premiums from better safety/compliance
  insuranceValue: (baseline: ExtendedBaselineMetrics, current: ExtendedBaselineMetrics) => {
    return (baseline.insurance.annualPremium - current.insurance.annualPremium) + 
           (baseline.insurance.uninsuredLosses - current.insurance.uninsuredLosses);
  },

  // Value of avoided stockouts
  inventoryValue: (baseline: ExtendedBaselineMetrics, current: ExtendedBaselineMetrics) => {
    const stockoutReduction = (baseline.inventory.stockoutEventsPerMonth - current.inventory.stockoutEventsPerMonth) * 12;
    const lostSalesPerStockout = 10000; // $10k lost sales per stockout
    return stockoutReduction * lostSalesPerStockout;
  },

  // Training ROI
  trainingValue: (baseline: ExtendedBaselineMetrics, current: ExtendedBaselineMetrics) => {
    const turnoverReduction = (baseline.training.employeeTurnoverRate - current.training.employeeTurnoverRate) / 100 * 20 * 50000; // 20 employees, $50k replacement cost
    const mistakeReduction = (baseline.training.mistakesFromLackOfTraining - current.training.mistakesFromLackOfTraining) * 2000; // $2k per mistake
    return turnoverReduction + mistakeReduction;
  }
};

// Competitive advantage metrics (qualitative but valuable)
export interface CompetitiveAdvantageMetrics {
  timeToMarketImprovement: number; // days faster
  innovationIndexImprovement: number; // 1-10 scale
  customerSatisfactionImprovement: number; // NPS points
  employeeSatisfactionImprovement: number; // eNPS points
  brandReputationScore: number; // 1-10 scale
  regulatoryRelationshipScore: number; // 1-10 scale
  investorConfidenceScore: number; // 1-10 scale
}