// Photobiology Stress Index (PSI) - Multimodal Plant Health KPI
// Combines light, VPD, photoperiod, and nutrient inputs for comprehensive stress assessment

export interface EnvironmentalInputs {
  ppfd: number;                // μmol/m²/s
  dli: number;                 // mol/m²/day
  photoperiod: number;         // hours
  spectrum: {
    red: number;               // 660nm
    blue: number;              // 450nm
    farRed: number;            // 730nm
    uv: number;                // 280-400nm
  };
  vpd: number;                 // kPa
  temperature: number;         // °C
  leafTemperature: number;     // °C
  co2: number;                 // ppm
  humidity: number;            // %
}

export interface NutrientInputs {
  ec: number;                  // mS/cm
  ph: number;
  nitrogen: number;            // ppm
  phosphorus: number;          // ppm
  potassium: number;           // ppm
  calcium: number;             // ppm
  magnesium: number;           // ppm
  sulfur: number;              // ppm
}

export interface PlantInputs {
  growthStage: 'seedling' | 'vegetative' | 'pre-flower' | 'flowering' | 'ripening';
  cultivar: string;
  chlorophyllContent: number;  // SPAD units
  photosynthesisRate: number;  // μmol CO2 m⁻² s⁻¹
  stomataConductance: number;  // mmol m⁻² s⁻¹
  sapFlow: number;             // ml/hr
  leafWaterPotential: number;  // MPa
}

export interface PSIComponents {
  lightStress: {
    score: number;             // 0-100
    factors: {
      intensity: number;       // PPFD stress
      photoperiod: number;     // Day length stress
      spectrum: number;        // Spectral quality stress
      dli: number;            // Daily light integral stress
    };
  };
  vpdStress: {
    score: number;             // 0-100
    factors: {
      current: number;         // Current VPD stress
      leafAirDiff: number;     // Leaf-air temperature differential
      transpirationLoad: number;
    };
  };
  nutrientStress: {
    score: number;             // 0-100
    factors: {
      availability: number;    // EC/pH impact
      balance: number;         // Nutrient ratios
      deficiency: number;      // Specific deficiencies
      toxicity: number;        // Excess nutrients
    };
  };
  thermalStress: {
    score: number;             // 0-100
    factors: {
      ambient: number;         // Air temperature stress
      leaf: number;            // Leaf temperature stress
      rootZone: number;        // Root temperature stress
    };
  };
  waterStress: {
    score: number;             // 0-100
    factors: {
      vpd: number;             // Atmospheric demand
      waterPotential: number;  // Plant water status
      hydraulic: number;       // Sap flow limitation
    };
  };
}

export interface PSIResult {
  timestamp: Date;
  overallPSI: number;          // 0-100 (0=optimal, 100=severe stress)
  components: PSIComponents;
  stressCategory: 'optimal' | 'mild' | 'moderate' | 'severe' | 'critical';
  primaryStressor: string;
  recommendations: string[];
  predictedImpact: {
    yieldReduction: number;    // Percentage
    qualityImpact: string;
    recoveryTime: number;      // Hours
  };
}

export class PhotobiologyStressIndex {
  // Optimal ranges by growth stage
  private optimalRanges = {
    seedling: {
      ppfd: { min: 150, max: 300, optimal: 200 },
      dli: { min: 8, max: 12, optimal: 10 },
      photoperiod: { min: 16, max: 18, optimal: 18 },
      vpd: { min: 0.4, max: 0.8, optimal: 0.6 },
      temperature: { min: 22, max: 26, optimal: 24 }
    },
    vegetative: {
      ppfd: { min: 300, max: 600, optimal: 450 },
      dli: { min: 15, max: 25, optimal: 20 },
      photoperiod: { min: 16, max: 18, optimal: 18 },
      vpd: { min: 0.8, max: 1.2, optimal: 1.0 },
      temperature: { min: 24, max: 28, optimal: 26 }
    },
    'pre-flower': {
      ppfd: { min: 400, max: 700, optimal: 550 },
      dli: { min: 20, max: 30, optimal: 25 },
      photoperiod: { min: 12, max: 14, optimal: 12 },
      vpd: { min: 0.9, max: 1.3, optimal: 1.1 },
      temperature: { min: 22, max: 26, optimal: 24 }
    },
    flowering: {
      ppfd: { min: 600, max: 900, optimal: 750 },
      dli: { min: 25, max: 40, optimal: 35 },
      photoperiod: { min: 11, max: 13, optimal: 12 },
      vpd: { min: 1.0, max: 1.5, optimal: 1.2 },
      temperature: { min: 20, max: 26, optimal: 23 }
    },
    ripening: {
      ppfd: { min: 500, max: 700, optimal: 600 },
      dli: { min: 20, max: 30, optimal: 25 },
      photoperiod: { min: 10, max: 12, optimal: 11 },
      vpd: { min: 1.2, max: 1.6, optimal: 1.4 },
      temperature: { min: 18, max: 24, optimal: 21 }
    }
  };

  calculatePSI(
    environmental: EnvironmentalInputs,
    nutrients: NutrientInputs,
    plant: PlantInputs
  ): PSIResult {
    const components = {
      lightStress: this.calculateLightStress(environmental, plant),
      vpdStress: this.calculateVPDStress(environmental, plant),
      nutrientStress: this.calculateNutrientStress(nutrients, plant),
      thermalStress: this.calculateThermalStress(environmental, plant),
      waterStress: this.calculateWaterStress(environmental, plant)
    };

    // Weight factors based on growth stage
    const weights = this.getStageWeights(plant.growthStage);
    
    // Calculate weighted overall PSI
    const overallPSI = this.calculateWeightedPSI(components, weights);
    
    // Determine stress category
    const stressCategory = this.categorizeStress(overallPSI);
    
    // Identify primary stressor
    const primaryStressor = this.identifyPrimaryStressor(components);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(components, plant);
    
    // Predict impact
    const predictedImpact = this.predictImpact(overallPSI, components, plant);

    return {
      timestamp: new Date(),
      overallPSI,
      components,
      stressCategory,
      primaryStressor,
      recommendations,
      predictedImpact
    };
  }

  private calculateLightStress(env: EnvironmentalInputs, plant: PlantInputs): PSIComponents['lightStress'] {
    const ranges = this.optimalRanges[plant.growthStage];
    
    // Calculate individual light stress factors
    const intensityStress = this.calculateStressFactor(env.ppfd, ranges.ppfd);
    const photoperiodStress = this.calculateStressFactor(env.photoperiod, ranges.photoperiod);
    const spectrumStress = this.calculateSpectrumStress(env.spectrum, plant.growthStage);
    const dliStress = this.calculateStressFactor(env.dli, ranges.dli);
    
    // Photoinhibition check
    const photoinhibition = env.ppfd > ranges.ppfd.max * 1.2 ? 20 : 0;
    
    // Weight light stress components
    const score = (
      intensityStress * 0.35 +
      photoperiodStress * 0.25 +
      spectrumStress * 0.20 +
      dliStress * 0.20 +
      photoinhibition
    );

    return {
      score: Math.min(100, score),
      factors: {
        intensity: intensityStress,
        photoperiod: photoperiodStress,
        spectrum: spectrumStress,
        dli: dliStress
      }
    };
  }

  private calculateVPDStress(env: EnvironmentalInputs, plant: PlantInputs): PSIComponents['vpdStress'] {
    const ranges = this.optimalRanges[plant.growthStage];
    
    // Base VPD stress
    const vpdStress = this.calculateStressFactor(env.vpd, ranges.vpd);
    
    // Leaf-air temperature differential stress
    const leafAirDiff = env.leafTemperature - env.temperature;
    const idealDiff = plant.growthStage === 'flowering' ? -1.5 : -2.0;
    const diffStress = Math.abs(leafAirDiff - idealDiff) * 10;
    
    // Transpiration load based on VPD and stomatal conductance
    const transpirationStress = this.calculateTranspirationStress(env.vpd, plant.stomataConductance);
    
    const score = (
      vpdStress * 0.50 +
      diffStress * 0.30 +
      transpirationStress * 0.20
    );

    return {
      score: Math.min(100, score),
      factors: {
        current: vpdStress,
        leafAirDiff: diffStress,
        transpirationLoad: transpirationStress
      }
    };
  }

  private calculateNutrientStress(nutrients: NutrientInputs, plant: PlantInputs): PSIComponents['nutrientStress'] {
    // EC/pH stress
    const ecStress = this.calculateECStress(nutrients.ec, plant.growthStage);
    const phStress = this.calculatePHStress(nutrients.ph);
    const availabilityStress = (ecStress + phStress) / 2;
    
    // Nutrient balance stress
    const npkRatio = this.calculateNPKBalance(nutrients);
    const balanceStress = npkRatio > 30 ? npkRatio : 0;
    
    // Deficiency stress based on minimum levels
    const deficiencyStress = this.calculateDeficiencyStress(nutrients, plant.growthStage);
    
    // Toxicity stress for excess nutrients
    const toxicityStress = this.calculateToxicityStress(nutrients, plant.growthStage);
    
    const score = (
      availabilityStress * 0.30 +
      balanceStress * 0.25 +
      deficiencyStress * 0.30 +
      toxicityStress * 0.15
    );

    return {
      score: Math.min(100, score),
      factors: {
        availability: availabilityStress,
        balance: balanceStress,
        deficiency: deficiencyStress,
        toxicity: toxicityStress
      }
    };
  }

  private calculateThermalStress(env: EnvironmentalInputs, plant: PlantInputs): PSIComponents['thermalStress'] {
    const ranges = this.optimalRanges[plant.growthStage];
    
    // Ambient temperature stress
    const ambientStress = this.calculateStressFactor(env.temperature, ranges.temperature);
    
    // Leaf temperature stress (more critical)
    const leafRanges = {
      min: ranges.temperature.min - 2,
      max: ranges.temperature.max - 1,
      optimal: ranges.temperature.optimal - 1.5
    };
    const leafStress = this.calculateStressFactor(env.leafTemperature, leafRanges);
    
    // Root zone temperature (assumed similar to ambient for now)
    const rootStress = ambientStress * 0.8;
    
    const score = (
      ambientStress * 0.25 +
      leafStress * 0.50 +
      rootStress * 0.25
    );

    return {
      score: Math.min(100, score),
      factors: {
        ambient: ambientStress,
        leaf: leafStress,
        rootZone: rootStress
      }
    };
  }

  private calculateWaterStress(env: EnvironmentalInputs, plant: PlantInputs): PSIComponents['waterStress'] {
    // VPD-driven water demand
    const vpdDemand = env.vpd > 1.5 ? (env.vpd - 1.5) * 30 : 0;
    
    // Water potential stress (more negative = more stress)
    const waterPotentialStress = plant.leafWaterPotential < -1.5 ? 
      Math.abs(plant.leafWaterPotential + 1.5) * 40 : 0;
    
    // Hydraulic stress based on sap flow
    const expectedSapFlow = this.getExpectedSapFlow(plant.growthStage, env.vpd);
    const hydraulicStress = plant.sapFlow < expectedSapFlow * 0.7 ? 
      ((expectedSapFlow - plant.sapFlow) / expectedSapFlow) * 50 : 0;
    
    const score = Math.max(vpdDemand, waterPotentialStress, hydraulicStress);

    return {
      score: Math.min(100, score),
      factors: {
        vpd: vpdDemand,
        waterPotential: waterPotentialStress,
        hydraulic: hydraulicStress
      }
    };
  }

  private calculateStressFactor(value: number, range: { min: number; max: number; optimal: number }): number {
    if (value >= range.min && value <= range.max) {
      // Calculate distance from optimal as percentage
      const deviation = Math.abs(value - range.optimal);
      const maxDeviation = Math.max(range.optimal - range.min, range.max - range.optimal);
      return (deviation / maxDeviation) * 30; // Max 30% stress within range
    } else if (value < range.min) {
      // Below minimum
      const deficit = range.min - value;
      return 30 + (deficit / range.min) * 70; // 30-100% stress
    } else {
      // Above maximum
      const excess = value - range.max;
      return 30 + (excess / range.max) * 70; // 30-100% stress
    }
  }

  private calculateSpectrumStress(spectrum: EnvironmentalInputs['spectrum'], stage: string): number {
    // Ideal R:B ratios by stage
    const idealRatios = {
      seedling: 1.0,
      vegetative: 1.2,
      'pre-flower': 1.5,
      flowering: 2.0,
      ripening: 2.5
    };
    
    const currentRatio = spectrum.red / (spectrum.blue || 1);
    const idealRatio = idealRatios[stage as keyof typeof idealRatios] || 1.5;
    const ratioDeviation = Math.abs(currentRatio - idealRatio) / idealRatio;
    
    // UV stress (too much UV is harmful)
    const uvStress = spectrum.uv > 20 ? (spectrum.uv - 20) * 2 : 0;
    
    // Far-red influence (affects morphology)
    const farRedRatio = spectrum.farRed / spectrum.red;
    const farRedStress = farRedRatio > 0.3 ? (farRedRatio - 0.3) * 50 : 0;
    
    return Math.min(100, ratioDeviation * 40 + uvStress + farRedStress);
  }

  private calculateTranspirationStress(vpd: number, stomatalConductance: number): number {
    // Expected conductance based on VPD
    const expectedConductance = 300 - (vpd * 150); // Simplified model
    const conductanceRatio = stomatalConductance / expectedConductance;
    
    if (conductanceRatio < 0.5) {
      return (0.5 - conductanceRatio) * 100;
    } else if (conductanceRatio > 1.5) {
      return (conductanceRatio - 1.5) * 50;
    }
    return 0;
  }

  private calculateECStress(ec: number, stage: string): number {
    const idealEC = {
      seedling: 0.8,
      vegetative: 1.4,
      'pre-flower': 1.6,
      flowering: 1.8,
      ripening: 1.4
    };
    
    const ideal = idealEC[stage as keyof typeof idealEC] || 1.5;
    const deviation = Math.abs(ec - ideal) / ideal;
    return Math.min(100, deviation * 80);
  }

  private calculatePHStress(ph: number): number {
    const ideal = 6.0;
    const range = { min: 5.5, max: 6.5 };
    
    if (ph >= range.min && ph <= range.max) {
      return Math.abs(ph - ideal) * 20;
    }
    return Math.abs(ph - ideal) * 40;
  }

  private calculateNPKBalance(nutrients: NutrientInputs): number {
    // Simplified NPK ratio stress
    const nRatio = nutrients.nitrogen / 150; // Normalize to typical values
    const pRatio = nutrients.phosphorus / 50;
    const kRatio = nutrients.potassium / 200;
    
    const maxRatio = Math.max(nRatio, pRatio, kRatio);
    const minRatio = Math.min(nRatio, pRatio, kRatio);
    
    return maxRatio > 0 ? ((maxRatio - minRatio) / maxRatio) * 100 : 0;
  }

  private calculateDeficiencyStress(nutrients: NutrientInputs, stage: string): number {
    // Minimum thresholds by stage (simplified)
    const minLevels = {
      nitrogen: stage === 'flowering' ? 100 : 150,
      phosphorus: stage === 'flowering' ? 60 : 40,
      potassium: stage === 'flowering' ? 250 : 150,
      calcium: 100,
      magnesium: 30
    };
    
    let deficiencyScore = 0;
    let deficiencyCount = 0;
    
    Object.entries(minLevels).forEach(([nutrient, minLevel]) => {
      const actual = nutrients[nutrient as keyof typeof nutrients] as number;
      if (actual < minLevel) {
        deficiencyScore += ((minLevel - actual) / minLevel) * 100;
        deficiencyCount++;
      }
    });
    
    return deficiencyCount > 0 ? deficiencyScore / deficiencyCount : 0;
  }

  private calculateToxicityStress(nutrients: NutrientInputs, stage: string): number {
    // Maximum thresholds (simplified)
    const maxLevels = {
      nitrogen: 300,
      phosphorus: 100,
      potassium: 400,
      calcium: 200,
      magnesium: 75
    };
    
    let toxicityScore = 0;
    let toxicityCount = 0;
    
    Object.entries(maxLevels).forEach(([nutrient, maxLevel]) => {
      const actual = nutrients[nutrient as keyof typeof nutrients] as number;
      if (actual > maxLevel) {
        toxicityScore += ((actual - maxLevel) / maxLevel) * 100;
        toxicityCount++;
      }
    });
    
    return toxicityCount > 0 ? toxicityScore / toxicityCount : 0;
  }

  private getExpectedSapFlow(stage: string, vpd: number): number {
    // Base sap flow by stage (ml/hr)
    const baseFlow = {
      seedling: 5,
      vegetative: 20,
      'pre-flower': 35,
      flowering: 50,
      ripening: 30
    };
    
    const base = baseFlow[stage as keyof typeof baseFlow] || 30;
    // Adjust for VPD
    return base * (0.5 + vpd * 0.5);
  }

  private getStageWeights(stage: string): Record<string, number> {
    // Stress component weights by growth stage
    const weights = {
      seedling: {
        light: 0.25,
        vpd: 0.15,
        nutrient: 0.20,
        thermal: 0.25,
        water: 0.15
      },
      vegetative: {
        light: 0.30,
        vpd: 0.20,
        nutrient: 0.25,
        thermal: 0.15,
        water: 0.10
      },
      'pre-flower': {
        light: 0.25,
        vpd: 0.25,
        nutrient: 0.20,
        thermal: 0.15,
        water: 0.15
      },
      flowering: {
        light: 0.20,
        vpd: 0.30,
        nutrient: 0.20,
        thermal: 0.20,
        water: 0.10
      },
      ripening: {
        light: 0.15,
        vpd: 0.35,
        nutrient: 0.15,
        thermal: 0.25,
        water: 0.10
      }
    };
    
    return weights[stage as keyof typeof weights] || weights.vegetative;
  }

  private calculateWeightedPSI(components: PSIComponents, weights: Record<string, number>): number {
    return (
      components.lightStress.score * weights.light +
      components.vpdStress.score * weights.vpd +
      components.nutrientStress.score * weights.nutrient +
      components.thermalStress.score * weights.thermal +
      components.waterStress.score * weights.water
    );
  }

  private categorizeStress(psi: number): PSIResult['stressCategory'] {
    if (psi < 15) return 'optimal';
    if (psi < 30) return 'mild';
    if (psi < 50) return 'moderate';
    if (psi < 70) return 'severe';
    return 'critical';
  }

  private identifyPrimaryStressor(components: PSIComponents): string {
    const stressors = [
      { name: 'Light', score: components.lightStress.score },
      { name: 'VPD', score: components.vpdStress.score },
      { name: 'Nutrients', score: components.nutrientStress.score },
      { name: 'Temperature', score: components.thermalStress.score },
      { name: 'Water', score: components.waterStress.score }
    ];
    
    const primary = stressors.reduce((max, current) => 
      current.score > max.score ? current : max
    );
    
    return primary.name;
  }

  private generateRecommendations(components: PSIComponents, plant: PlantInputs): string[] {
    const recommendations: string[] = [];
    
    // Light stress recommendations
    if (components.lightStress.score > 30) {
      if (components.lightStress.factors.intensity > 50) {
        recommendations.push('Adjust light intensity to optimal PPFD for growth stage');
      }
      if (components.lightStress.factors.photoperiod > 50) {
        recommendations.push('Modify photoperiod to match growth stage requirements');
      }
      if (components.lightStress.factors.spectrum > 50) {
        recommendations.push('Optimize light spectrum - adjust R:B ratio');
      }
    }
    
    // VPD stress recommendations
    if (components.vpdStress.score > 30) {
      if (components.vpdStress.factors.current > 50) {
        recommendations.push('Adjust temperature and humidity to optimize VPD');
      }
      if (components.vpdStress.factors.leafAirDiff > 50) {
        recommendations.push('Improve air circulation to reduce leaf temperature');
      }
    }
    
    // Nutrient stress recommendations
    if (components.nutrientStress.score > 30) {
      if (components.nutrientStress.factors.availability > 50) {
        recommendations.push('Check and adjust nutrient solution pH and EC');
      }
      if (components.nutrientStress.factors.deficiency > 50) {
        recommendations.push('Address nutrient deficiencies - increase feeding');
      }
      if (components.nutrientStress.factors.balance > 50) {
        recommendations.push('Rebalance nutrient ratios for growth stage');
      }
    }
    
    // Thermal stress recommendations
    if (components.thermalStress.score > 30) {
      recommendations.push('Optimize environmental temperature for current growth stage');
    }
    
    // Water stress recommendations
    if (components.waterStress.score > 30) {
      recommendations.push('Increase irrigation frequency or volume');
      if (components.waterStress.factors.vpd > 50) {
        recommendations.push('Reduce VPD to decrease transpiration demand');
      }
    }
    
    // Limit to top 3 recommendations
    return recommendations.slice(0, 3);
  }

  private predictImpact(psi: number, components: PSIComponents, plant: PlantInputs): PSIResult['predictedImpact'] {
    // Yield impact based on stress severity and growth stage
    let yieldReduction = 0;
    
    if (plant.growthStage === 'flowering') {
      // Flowering stage is most sensitive
      yieldReduction = psi * 0.8;
    } else if (plant.growthStage === 'vegetative') {
      // Vegetative can recover better
      yieldReduction = psi * 0.4;
    } else {
      yieldReduction = psi * 0.6;
    }
    
    // Quality impact
    let qualityImpact = 'Minimal';
    if (psi > 50) {
      qualityImpact = 'Moderate - potential terpene/cannabinoid reduction';
    }
    if (psi > 70) {
      qualityImpact = 'Severe - significant quality degradation expected';
    }
    
    // Recovery time based on stress type and severity
    let recoveryTime = 0;
    if (components.lightStress.score > 50) {
      recoveryTime += 24; // Light stress recovery
    }
    if (components.nutrientStress.score > 50) {
      recoveryTime += 48; // Nutrient recovery slower
    }
    if (components.vpdStress.score > 50) {
      recoveryTime += 12; // VPD recovers quickly
    }
    
    return {
      yieldReduction: Math.min(80, yieldReduction),
      qualityImpact,
      recoveryTime
    };
  }

  // Historical tracking
  trackPSIHistory(psiResults: PSIResult[]): {
    trend: 'improving' | 'stable' | 'declining';
    averagePSI: number;
    stressAccumulation: number;
    criticalPeriods: number;
  } {
    if (psiResults.length < 2) {
      return {
        trend: 'stable',
        averagePSI: psiResults[0]?.overallPSI || 0,
        stressAccumulation: 0,
        criticalPeriods: 0
      };
    }
    
    // Calculate trend
    const recentAvg = psiResults.slice(-10).reduce((sum, r) => sum + r.overallPSI, 0) / 10;
    const olderAvg = psiResults.slice(-20, -10).reduce((sum, r) => sum + r.overallPSI, 0) / 10;
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentAvg < olderAvg - 5) trend = 'improving';
    if (recentAvg > olderAvg + 5) trend = 'declining';
    
    // Calculate averages and accumulation
    const averagePSI = psiResults.reduce((sum, r) => sum + r.overallPSI, 0) / psiResults.length;
    const stressAccumulation = psiResults.reduce((sum, r) => sum + (r.overallPSI > 30 ? r.overallPSI : 0), 0);
    const criticalPeriods = psiResults.filter(r => r.stressCategory === 'severe' || r.stressCategory === 'critical').length;
    
    return {
      trend,
      averagePSI,
      stressAccumulation,
      criticalPeriods
    };
  }
}

// Export singleton instance
export const psiCalculator = new PhotobiologyStressIndex();

// Helper function for real-time monitoring
export function calculateRealTimePSI(
  sensorData: any,
  plantData: any
): PSIResult {
  // Transform sensor data to PSI inputs
  const environmental: EnvironmentalInputs = {
    ppfd: sensorData.ppfd || 0,
    dli: sensorData.dli || 0,
    photoperiod: sensorData.photoperiod || 12,
    spectrum: {
      red: sensorData.spectrum?.red || 0,
      blue: sensorData.spectrum?.blue || 0,
      farRed: sensorData.spectrum?.farRed || 0,
      uv: sensorData.spectrum?.uv || 0
    },
    vpd: sensorData.vpd || 1.0,
    temperature: sensorData.temperature || 25,
    leafTemperature: sensorData.leafTemperature || sensorData.temperature - 2,
    co2: sensorData.co2 || 800,
    humidity: sensorData.humidity || 60
  };
  
  const nutrients: NutrientInputs = {
    ec: sensorData.ec || 1.5,
    ph: sensorData.ph || 6.0,
    nitrogen: sensorData.nitrogen || 150,
    phosphorus: sensorData.phosphorus || 50,
    potassium: sensorData.potassium || 200,
    calcium: sensorData.calcium || 100,
    magnesium: sensorData.magnesium || 50,
    sulfur: sensorData.sulfur || 30
  };
  
  const plant: PlantInputs = {
    growthStage: plantData.growthStage || 'vegetative',
    cultivar: plantData.cultivar || 'unknown',
    chlorophyllContent: plantData.chlorophyllContent || 40,
    photosynthesisRate: plantData.photosynthesisRate || 20,
    stomataConductance: plantData.stomataConductance || 200,
    sapFlow: plantData.sapFlow || 30,
    leafWaterPotential: plantData.leafWaterPotential || -0.8
  };
  
  return psiCalculator.calculatePSI(environmental, nutrients, plant);
}