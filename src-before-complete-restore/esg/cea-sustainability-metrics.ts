/**
 * CEA-Specific Sustainability Metrics
 * Tailored for Indoor Greenhouses and Vertical Farms
 */

export interface CEAEnvironmentalMetrics {
  // Water Efficiency - Critical for CEA
  water: {
    totalUsageGallons: number;
    recirculationRate: number; // % of water recirculated
    runoffRecoveryRate: number; // % of runoff captured and reused
    waterPerKgYield: number; // Gallons per kg produce
    comparisonToFieldFarming: number; // % reduction vs traditional
    evapotranspirationRecovery: number; // % of ET water recovered
  };
  
  // Energy - Major concern for indoor growing
  energy: {
    totalKWh: number;
    lightingKWh: number; // Typically 50-70% of total
    hvacKWh: number; // 20-30% of total
    otherKWh: number; // Pumps, controls, etc.
    renewableKWh: number;
    ledEfficiency: number; // μmol/J
    kWhPerKgYield: number; // Energy intensity
    dliDeliveredPerKWh: number; // Light use efficiency
  };
  
  // Land Use Efficiency - Key CEA advantage
  landUse: {
    growingAreaSqFt: number;
    verticalLayers: number;
    effectiveGrowingArea: number; // actual * layers
    yieldPerSqFt: number; // kg/sq ft/year
    comparisonToField: number; // X times more productive
  };
  
  // Transportation - Local food advantage
  transportation: {
    avgDistanceToMarket: number; // miles
    fieldFarmingDistance: number; // comparison miles
    transportEmissionsAvoided: number; // kg CO2e
    foodMiles: number; // total food miles
  };
  
  // Chemical Usage - CEA advantage
  chemicals: {
    pesticidesUsed: number; // Should be 0 for most CEA
    herbicidesUsed: number; // Should be 0
    fungicidesUsed: number; // Minimal in controlled environment
    beneficialInsectsUsed: boolean; // IPM approach
    organicNutrients: boolean;
    nutrientRecoveryRate: number; // % of nutrients recaptured
  };
  
  // Waste Management
  waste: {
    organicWasteKg: number;
    compostedKg: number;
    anaerobicDigestionKg: number;
    substratRecyclingRate: number; // Growing media recycling
    packagingWasteKg: number;
    plasticRecyclingRate: number;
  };
}

export interface CEAProductionMetrics {
  // Yield Metrics - Show CEA productivity
  yield: {
    totalKgProduced: number;
    yieldPerSqFt: number;
    yieldPerCubicFt: number; // For vertical farms
    cropCyclesPerYear: number;
    harvestFrequency: 'daily' | 'weekly' | 'batch';
    consistencyScore: number; // 0-100, yield predictability
  };
  
  // Quality Metrics
  quality: {
    gradeAPercent: number;
    shelfLifeDays: number;
    nutrientDensity: number; // relative to field grown
    pestResidueTests: number; // Should be 0
    microbiologicalPasses: number; // % passing tests
    customerComplaints: number;
  };
  
  // Resource Productivity
  productivity: {
    laborHoursPerKg: number;
    automationLevel: number; // 0-100%
    cropLossRate: number; // % loss from disease/pests
    germinationRate: number;
    spaceTurnoverDays: number; // Days from harvest to replant
  };
}

export interface CEASocialMetrics {
  // Local Food System Impact
  localImpact: {
    localJobsCreated: number;
    kmFromProductionToPlate: number;
    localFoodAccessPoints: number; // Stores, restaurants served
    communityEducationEvents: number;
    schoolProgramParticipants: number;
  };
  
  // Worker Safety - Indoor advantage
  safety: {
    daysWithoutInjury: number;
    ergonomicWorkstations: number; // % of work at comfortable height
    chemicalExposureIncidents: number; // Should be 0
    heatStressIncidents: number; // Climate controlled advantage
    slipTripFallIncidents: number;
  };
  
  // Food Security Contribution
  foodSecurity: {
    affordableProducePrograms: boolean;
    foodBankDonationsKg: number;
    snapEbtAccepted: boolean;
    yearRoundProductionMonths: number; // Should be 12
    weatherEventResilience: boolean; // Indoor advantage
  };
}

export class CEASustainabilityCalculator {
  /**
   * Calculate water savings vs traditional farming
   */
  calculateWaterSavings(metrics: CEAEnvironmentalMetrics): {
    percentSaved: number;
    gallonsSaved: number;
    comparisonText: string;
  } {
    // CEA typically uses 95% less water than field farming
    const fieldWaterUse = metrics.water.totalUsageGallons / 0.05; // CEA uses 5% of field
    const waterSaved = fieldWaterUse - metrics.water.totalUsageGallons;
    const percentSaved = (waterSaved / fieldWaterUse) * 100;
    
    return {
      percentSaved,
      gallonsSaved: waterSaved,
      comparisonText: `${percentSaved.toFixed(0)}% less water than field farming`
    };
  }
  
  /**
   * Calculate true carbon footprint including avoided impacts
   */
  calculateCEACarbonFootprint(
    facilityEmissions: number, // kg CO2e
    metrics: CEAEnvironmentalMetrics,
    production: CEAProductionMetrics
  ): {
    facilityEmissions: number;
    avoidedTransport: number;
    avoidedLandUseChange: number;
    avoidedChemicals: number;
    netEmissions: number;
    emissionsPerKg: number;
  } {
    // Transportation emissions avoided (0.5 kg CO2e per ton-mile)
    const transportDiff = metrics.transportation.fieldFarmingDistance - 
                         metrics.transportation.avgDistanceToMarket;
    const avoidedTransport = (production.yield.totalKgProduced / 1000) * 
                            transportDiff * 0.5;
    
    // Land use change emissions avoided (10 tons CO2e per hectare)
    const landSaved = (metrics.landUse.growingAreaSqFt / 43560) * 
                     (metrics.landUse.comparisonToField - 1);
    const avoidedLandUseChange = landSaved * 0.4047 * 10000; // Convert to hectares
    
    // Chemical production/application emissions avoided
    const avoidedChemicals = 50 * production.yield.totalKgProduced; // 50g CO2e/kg for pesticides
    
    const netEmissions = facilityEmissions - avoidedTransport - 
                        avoidedLandUseChange - avoidedChemicals;
    
    return {
      facilityEmissions,
      avoidedTransport,
      avoidedLandUseChange,
      avoidedChemicals,
      netEmissions,
      emissionsPerKg: netEmissions / production.yield.totalKgProduced
    };
  }
  
  /**
   * Calculate land use efficiency metrics
   */
  calculateLandUseEfficiency(metrics: CEAEnvironmentalMetrics): {
    effectiveYieldMultiplier: number;
    landSavedAcres: number;
    equivalentFieldAcres: number;
  } {
    const effectiveArea = metrics.landUse.growingAreaSqFt * metrics.landUse.verticalLayers;
    const ceaAcres = effectiveArea / 43560;
    
    // CEA typically produces 100-300x more per sq ft
    const yieldMultiplier = metrics.landUse.comparisonToField;
    const equivalentFieldAcres = ceaAcres * yieldMultiplier;
    const landSaved = equivalentFieldAcres - (metrics.landUse.growingAreaSqFt / 43560);
    
    return {
      effectiveYieldMultiplier: yieldMultiplier,
      landSavedAcres: landSaved,
      equivalentFieldAcres: equivalentFieldAcres
    };
  }
  
  /**
   * Generate CEA-specific sustainability score
   */
  calculateCEAScore(
    envMetrics: CEAEnvironmentalMetrics,
    prodMetrics: CEAProductionMetrics,
    socialMetrics: CEASocialMetrics
  ): {
    waterEfficiency: number; // 0-100
    energyEfficiency: number;
    landUseEfficiency: number;
    chemicalAvoidance: number;
    localFoodSystem: number;
    overallScore: number;
    grade: string;
  } {
    // Water efficiency score (based on recirculation and usage)
    const waterScore = (envMetrics.water.recirculationRate * 0.6) + 
                      ((100 - envMetrics.water.waterPerKgYield) * 0.4);
    
    // Energy efficiency score (based on LED efficiency and renewable %)
    const energyScore = (envMetrics.energy.ledEfficiency / 3.0) * 30 + // 3.0 μmol/J is excellent
                       (envMetrics.energy.renewableKWh / envMetrics.energy.totalKWh) * 70;
    
    // Land use efficiency score
    const landScore = Math.min(100, envMetrics.landUse.yieldPerSqFt * 10); // 10 kg/sq ft/year is excellent
    
    // Chemical avoidance score (pesticide-free is 100)
    const chemicalScore = envMetrics.chemicals.pesticidesUsed === 0 ? 100 : 0;
    
    // Local food system score
    const localScore = (100 - Math.min(100, socialMetrics.localImpact.kmFromProductionToPlate)) * 0.5 +
                      (socialMetrics.foodSecurity.yearRoundProductionMonths / 12) * 50;
    
    const overallScore = (waterScore * 0.25) + (energyScore * 0.25) + 
                        (landScore * 0.2) + (chemicalScore * 0.15) + (localScore * 0.15);
    
    const grade = overallScore >= 90 ? 'A+' :
                  overallScore >= 85 ? 'A' :
                  overallScore >= 80 ? 'A-' :
                  overallScore >= 75 ? 'B+' :
                  overallScore >= 70 ? 'B' :
                  overallScore >= 65 ? 'B-' :
                  overallScore >= 60 ? 'C' : 'D';
    
    return {
      waterEfficiency: waterScore,
      energyEfficiency: energyScore,
      landUseEfficiency: landScore,
      chemicalAvoidance: chemicalScore,
      localFoodSystem: localScore,
      overallScore,
      grade
    };
  }
  
  /**
   * Compare CEA facility to traditional farming
   */
  generateFieldComparison(
    envMetrics: CEAEnvironmentalMetrics,
    prodMetrics: CEAProductionMetrics
  ): {
    metric: string;
    ceaValue: number;
    fieldValue: number;
    advantage: string;
    percentBetter: number;
  }[] {
    return [
      {
        metric: 'Water Usage (gal/kg)',
        ceaValue: envMetrics.water.waterPerKgYield,
        fieldValue: envMetrics.water.waterPerKgYield * 20, // CEA uses 5% of field
        advantage: 'CEA',
        percentBetter: 95
      },
      {
        metric: 'Land Required (sq ft/kg/year)',
        ceaValue: 1 / prodMetrics.yield.yieldPerSqFt,
        fieldValue: (1 / prodMetrics.yield.yieldPerSqFt) * envMetrics.landUse.comparisonToField,
        advantage: 'CEA',
        percentBetter: ((envMetrics.landUse.comparisonToField - 1) / envMetrics.landUse.comparisonToField) * 100
      },
      {
        metric: 'Pesticide Use (g/kg)',
        ceaValue: envMetrics.chemicals.pesticidesUsed,
        fieldValue: 25, // Average field use
        advantage: 'CEA',
        percentBetter: 100
      },
      {
        metric: 'Transportation (miles)',
        ceaValue: envMetrics.transportation.avgDistanceToMarket,
        fieldValue: envMetrics.transportation.fieldFarmingDistance,
        advantage: 'CEA',
        percentBetter: ((envMetrics.transportation.fieldFarmingDistance - envMetrics.transportation.avgDistanceToMarket) / 
                       envMetrics.transportation.fieldFarmingDistance) * 100
      },
      {
        metric: 'Weather Risk',
        ceaValue: 0,
        fieldValue: 30, // % crop loss from weather
        advantage: 'CEA',
        percentBetter: 100
      },
      {
        metric: 'Crop Cycles/Year',
        ceaValue: prodMetrics.yield.cropCyclesPerYear,
        fieldValue: 2, // Typical field farming
        advantage: 'CEA',
        percentBetter: ((prodMetrics.yield.cropCyclesPerYear - 2) / 2) * 100
      }
    ];
  }
}

// CEA-specific benchmarks
export const CEABenchmarks = {
  waterEfficiency: {
    excellent: 5, // gallons per kg yield
    good: 10,
    average: 20,
    poor: 40
  },
  energyEfficiency: {
    excellent: 30, // kWh per kg yield
    good: 50,
    average: 80,
    poor: 120
  },
  ledEfficiency: {
    excellent: 3.0, // μmol/J
    good: 2.7,
    average: 2.4,
    poor: 2.0
  },
  yieldDensity: {
    excellent: 10, // kg per sq ft per year
    good: 7,
    average: 5,
    poor: 3
  }
};