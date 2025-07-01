// Plant Stress Detection with Hyperspectral Analysis
// Advanced plant health monitoring using spectral analysis and machine learning

export interface HyperspectralData {
  timestamp: Date;
  wavelengths: number[]; // 350-1000nm range
  reflectance: number[]; // 0-1 reflectance values
  plantId: string;
  leafPosition: 'top' | 'middle' | 'bottom';
  measurementArea: number; // cm²
  ambientLight: number; // µmol/m²/s
}

export interface ChlorophyllFluorescence {
  timestamp: Date;
  fv: number; // Variable fluorescence
  fm: number; // Maximum fluorescence
  fo: number; // Minimum fluorescence
  fvFmRatio: number; // Photosystem II efficiency (0.75-0.85 healthy)
  qP: number; // Photochemical quenching
  qN: number; // Non-photochemical quenching
  etr: number; // Electron transport rate
  y2: number; // Quantum yield of PSII
}

export interface ThermalImageData {
  timestamp: Date;
  leafTemperature: number; // °C
  airTemperature: number; // °C
  temperatureDifference: number; // Leaf - Air (°C)
  stomatalConductance: number; // mol/m²/s (estimated)
  transpirationType: 'normal' | 'reduced' | 'excessive';
  heatStressLevel: 'none' | 'mild' | 'moderate' | 'severe';
}

export interface PlantStressIndicator {
  stressType: 'nutrient' | 'water' | 'heat' | 'light' | 'disease' | 'pest' | 'root' | 'air_quality';
  severity: 'none' | 'mild' | 'moderate' | 'severe' | 'critical';
  confidence: number; // 0-1
  earlyDetection: boolean; // Detected before visual symptoms
  affectedArea: number; // % of plant affected
  timeToAction: number; // hours before intervention needed
  recommendedAction: string[];
}

export interface VegetationIndex {
  ndvi: number; // Normalized Difference Vegetation Index (-1 to 1)
  savi: number; // Soil Adjusted Vegetation Index
  evi: number; // Enhanced Vegetation Index
  pri: number; // Photochemical Reflectance Index
  wbi: number; // Water Band Index
  cri: number; // Carotenoid Reflectance Index
  ari: number; // Anthocyanin Reflectance Index
  mcari: number; // Modified Chlorophyll Absorption Ratio Index
}

export interface NutrientDeficiencyAnalysis {
  nitrogen: { level: 'deficient' | 'adequate' | 'excessive'; confidence: number };
  phosphorus: { level: 'deficient' | 'adequate' | 'excessive'; confidence: number };
  potassium: { level: 'deficient' | 'adequate' | 'excessive'; confidence: number };
  magnesium: { level: 'deficient' | 'adequate' | 'excessive'; confidence: number };
  iron: { level: 'deficient' | 'adequate' | 'excessive'; confidence: number };
  calcium: { level: 'deficient' | 'adequate' | 'excessive'; confidence: number };
  sulfur: { level: 'deficient' | 'adequate' | 'excessive'; confidence: number };
  overallNutrientScore: number; // 0-100
}

export interface DiseaseDetection {
  diseaseType: 'powdery_mildew' | 'downy_mildew' | 'leaf_spot' | 'rust' | 'blight' | 'virus' | 'bacteria';
  probability: number; // 0-1
  affectedArea: number; // cm²
  progressionRate: number; // area increase per day
  infectiousStage: boolean;
  quarantineRecommended: boolean;
  treatment: string[];
}

export interface PlantStressReport {
  plantId: string;
  timestamp: Date;
  overallHealthScore: number; // 0-100
  stressIndicators: PlantStressIndicator[];
  vegetationIndices: VegetationIndex;
  nutrientAnalysis: NutrientDeficiencyAnalysis;
  diseaseDetection: DiseaseDetection[];
  chlorophyllFluorescence: ChlorophyllFluorescence;
  thermalAnalysis: ThermalImageData;
  actionPriority: 'immediate' | 'urgent' | 'moderate' | 'low' | 'monitor';
  recommendations: string[];
  trendAnalysis: {
    improving: boolean;
    stable: boolean;
    declining: boolean;
    rate: number; // change per day
  };
}

export class PlantStressDetector {
  private stressModels: Map<string, any> = new Map();
  private baselineData: Map<string, HyperspectralData[]> = new Map();
  private historicalReports: PlantStressReport[] = [];
  
  constructor() {
    this.initializeStressModels();
  }

  private initializeStressModels(): void {
    // Initialize machine learning models for stress detection
    // In real implementation, these would be trained models
    this.stressModels.set('nutrient_deficiency', {
      nitrogen: { wavelengths: [550, 680, 750], thresholds: [0.15, 0.25, 0.35] },
      phosphorus: { wavelengths: [520, 580, 750], thresholds: [0.12, 0.22, 0.32] },
      potassium: { wavelengths: [760, 900, 970], thresholds: [0.45, 0.55, 0.65] },
      magnesium: { wavelengths: [680, 720, 760], thresholds: [0.30, 0.40, 0.50] },
      iron: { wavelengths: [450, 520, 680], thresholds: [0.08, 0.18, 0.28] }
    });

    this.stressModels.set('water_stress', {
      wbi_threshold: 0.9,
      thermal_threshold: 3.0, // °C above air temp
      conductance_threshold: 0.1 // mol/m²/s
    });

    this.stressModels.set('disease_signatures', {
      powdery_mildew: { wavelengths: [550, 650, 750], pattern: [0.6, 0.4, 0.8] },
      downy_mildew: { wavelengths: [520, 680, 720], pattern: [0.3, 0.2, 0.5] },
      leaf_spot: { wavelengths: [680, 750, 850], pattern: [0.2, 0.4, 0.6] }
    });
  }

  // Main analysis method
  public async analyzeePlantStress(
    hyperspectralData: HyperspectralData,
    fluorescenceData: ChlorophyllFluorescence,
    thermalData: ThermalImageData,
    environmentalContext: any
  ): Promise<PlantStressReport> {
    
    // Calculate vegetation indices
    const vegetationIndices = this.calculateVegetationIndices(hyperspectralData);
    
    // Analyze nutrient status
    const nutrientAnalysis = this.analyzeNutrientStatus(hyperspectralData, vegetationIndices);
    
    // Detect diseases
    const diseaseDetection = this.detectDiseases(hyperspectralData);
    
    // Analyze water stress
    const waterStress = this.analyzeWaterStress(thermalData, vegetationIndices);
    
    // Analyze light stress
    const lightStress = this.analyzeLightStress(fluorescenceData, environmentalContext);
    
    // Compile stress indicators
    const stressIndicators = this.compileStressIndicators([
      ...nutrientAnalysis.indicators,
      ...waterStress,
      ...lightStress,
      ...this.analyzeAirQualityStress(hyperspectralData)
    ]);
    
    // Calculate overall health score
    const overallHealthScore = this.calculateOverallHealthScore(
      stressIndicators,
      vegetationIndices,
      fluorescenceData
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(stressIndicators, nutrientAnalysis);
    
    // Determine action priority
    const actionPriority = this.determineActionPriority(stressIndicators, overallHealthScore);
    
    // Analyze trends
    const trendAnalysis = this.analyzeTrends(hyperspectralData.plantId, overallHealthScore);
    
    const report: PlantStressReport = {
      plantId: hyperspectralData.plantId,
      timestamp: new Date(),
      overallHealthScore,
      stressIndicators,
      vegetationIndices,
      nutrientAnalysis: {
        ...nutrientAnalysis,
        indicators: undefined // Remove indicators as they're in stressIndicators
      } as NutrientDeficiencyAnalysis,
      diseaseDetection,
      chlorophyllFluorescence: fluorescenceData,
      thermalAnalysis: thermalData,
      actionPriority,
      recommendations,
      trendAnalysis
    };
    
    this.historicalReports.push(report);
    return report;
  }

  private calculateVegetationIndices(data: HyperspectralData): VegetationIndex {
    const getReflectance = (wavelength: number): number => {
      const index = data.wavelengths.findIndex(w => Math.abs(w - wavelength) < 5);
      return index >= 0 ? data.reflectance[index] : 0;
    };

    // Get key wavelength reflectances
    const red = getReflectance(680);
    const nir = getReflectance(800);
    const blue = getReflectance(450);
    const green = getReflectance(550);
    const swir = getReflectance(970);
    const redEdge = getReflectance(720);

    // Calculate vegetation indices
    const ndvi = (nir - red) / (nir + red);
    const evi = 2.5 * ((nir - red) / (nir + 6 * red - 7.5 * blue + 1));
    const savi = 1.5 * ((nir - red) / (nir + red + 0.5));
    const pri = (getReflectance(531) - getReflectance(570)) / (getReflectance(531) + getReflectance(570));
    const wbi = getReflectance(900) / getReflectance(970);
    const cri = (1 / getReflectance(510)) - (1 / getReflectance(550));
    const ari = (1 / getReflectance(550)) - (1 / getReflectance(700));
    const mcari = ((redEdge - red) - 0.2 * (redEdge - green)) * (redEdge / red);

    return { ndvi, savi, evi, pri, wbi, cri, ari, mcari };
  }

  private analyzeNutrientStatus(
    data: HyperspectralData, 
    indices: VegetationIndex
  ): NutrientDeficiencyAnalysis & { indicators: PlantStressIndicator[] } {
    const indicators: PlantStressIndicator[] = [];
    const model = this.stressModels.get('nutrient_deficiency');
    
    // Analyze nitrogen status
    const nitrogenReflectance = this.getWavelengthReflectance(data, 550);
    const nitrogenLevel = nitrogenReflectance > 0.25 ? 'adequate' : 
                         nitrogenReflectance > 0.15 ? 'deficient' : 'deficient';
    const nitrogenConfidence = Math.abs(0.2 - nitrogenReflectance) / 0.2;
    
    if (nitrogenLevel === 'deficient') {
      indicators.push({
        stressType: 'nutrient',
        severity: nitrogenReflectance < 0.1 ? 'severe' : 'moderate',
        confidence: nitrogenConfidence,
        earlyDetection: nitrogenReflectance > 0.12,
        affectedArea: this.estimateAffectedArea(nitrogenReflectance, 0.2),
        timeToAction: nitrogenReflectance < 0.1 ? 24 : 72,
        recommendedAction: ['Increase nitrogen fertilization', 'Check root health', 'Monitor pH levels']
      });
    }

    // Analyze phosphorus status
    const phosphorusReflectance = this.getWavelengthReflectance(data, 520);
    const phosphorusLevel = phosphorusReflectance > 0.22 ? 'adequate' : 'deficient';
    const phosphorusConfidence = Math.abs(0.17 - phosphorusReflectance) / 0.17;

    // Analyze potassium status (using NIR reflectance)
    const potassiumReflectance = this.getWavelengthReflectance(data, 760);
    const potassiumLevel = potassiumReflectance > 0.55 ? 'adequate' : 'deficient';
    const potassiumConfidence = Math.abs(0.5 - potassiumReflectance) / 0.5;

    // Analyze magnesium (chlorophyll-related)
    const magnesiumLevel = indices.ndvi > 0.7 ? 'adequate' : 'deficient';
    const magnesiumConfidence = Math.abs(0.7 - indices.ndvi) / 0.7;

    // Analyze iron (chlorosis detection)
    const ironReflectance = this.getWavelengthReflectance(data, 550);
    const ironLevel = ironReflectance < 0.18 ? 'adequate' : 'deficient';
    const ironConfidence = Math.abs(0.18 - ironReflectance) / 0.18;

    if (ironLevel === 'deficient') {
      indicators.push({
        stressType: 'nutrient',
        severity: ironReflectance > 0.25 ? 'severe' : 'moderate',
        confidence: ironConfidence,
        earlyDetection: ironReflectance < 0.22,
        affectedArea: this.estimateAffectedArea(ironReflectance, 0.18),
        timeToAction: 48,
        recommendedAction: ['Check iron availability', 'Adjust pH to 5.5-6.5', 'Foliar iron application']
      });
    }

    const overallNutrientScore = this.calculateNutrientScore([
      nitrogenLevel, phosphorusLevel, potassiumLevel, magnesiumLevel, ironLevel
    ]);

    return {
      nitrogen: { level: nitrogenLevel, confidence: nitrogenConfidence },
      phosphorus: { level: phosphorusLevel, confidence: phosphorusConfidence },
      potassium: { level: potassiumLevel, confidence: potassiumConfidence },
      magnesium: { level: magnesiumLevel, confidence: magnesiumConfidence },
      iron: { level: ironLevel, confidence: ironConfidence },
      calcium: { level: 'adequate', confidence: 0.8 }, // Simplified
      sulfur: { level: 'adequate', confidence: 0.8 }, // Simplified
      overallNutrientScore,
      indicators
    };
  }

  private detectDiseases(data: HyperspectralData): DiseaseDetection[] {
    const diseases: DiseaseDetection[] = [];
    const diseaseModel = this.stressModels.get('disease_signatures');
    
    // Check for powdery mildew
    const pmReflectance = [
      this.getWavelengthReflectance(data, 550),
      this.getWavelengthReflectance(data, 650),
      this.getWavelengthReflectance(data, 750)
    ];
    
    const pmPattern = diseaseModel.powdery_mildew.pattern;
    const pmSimilarity = this.calculatePatternSimilarity(pmReflectance, pmPattern);
    
    if (pmSimilarity > 0.7) {
      diseases.push({
        diseaseType: 'powdery_mildew',
        probability: pmSimilarity,
        affectedArea: this.estimateAffectedArea(pmSimilarity, 0.7) * 10, // cm²
        progressionRate: pmSimilarity > 0.8 ? 5 : 2, // cm²/day
        infectiousStage: pmSimilarity > 0.8,
        quarantineRecommended: pmSimilarity > 0.85,
        treatment: [
          'Reduce humidity below 60%',
          'Improve air circulation',
          'Apply fungicide treatment',
          'Remove affected leaves'
        ]
      });
    }

    // Check for downy mildew
    const dmReflectance = [
      this.getWavelengthReflectance(data, 520),
      this.getWavelengthReflectance(data, 680),
      this.getWavelengthReflectance(data, 720)
    ];
    
    const dmPattern = diseaseModel.downy_mildew.pattern;
    const dmSimilarity = this.calculatePatternSimilarity(dmReflectance, dmPattern);
    
    if (dmSimilarity > 0.6) {
      diseases.push({
        diseaseType: 'downy_mildew',
        probability: dmSimilarity,
        affectedArea: this.estimateAffectedArea(dmSimilarity, 0.6) * 8,
        progressionRate: dmSimilarity > 0.7 ? 7 : 3,
        infectiousStage: dmSimilarity > 0.75,
        quarantineRecommended: dmSimilarity > 0.8,
        treatment: [
          'Improve drainage',
          'Reduce leaf wetness',
          'Apply copper-based fungicide',
          'Increase ventilation'
        ]
      });
    }

    return diseases;
  }

  private analyzeWaterStress(
    thermalData: ThermalImageData, 
    indices: VegetationIndex
  ): PlantStressIndicator[] {
    const indicators: PlantStressIndicator[] = [];
    const waterModel = this.stressModels.get('water_stress');
    
    // Check thermal stress
    if (thermalData.temperatureDifference > waterModel.thermal_threshold) {
      const severity = thermalData.temperatureDifference > 5 ? 'severe' : 
                     thermalData.temperatureDifference > 4 ? 'moderate' : 'mild';
      
      indicators.push({
        stressType: 'water',
        severity,
        confidence: Math.min(thermalData.temperatureDifference / 6, 1),
        earlyDetection: thermalData.temperatureDifference < 4,
        affectedArea: 100, // Assume whole plant
        timeToAction: severity === 'severe' ? 12 : 24,
        recommendedAction: [
          'Increase irrigation frequency',
          'Check root zone moisture',
          'Reduce air temperature',
          'Increase humidity'
        ]
      });
    }

    // Check stomatal conductance
    if (thermalData.stomatalConductance < waterModel.conductance_threshold) {
      indicators.push({
        stressType: 'water',
        severity: thermalData.stomatalConductance < 0.05 ? 'severe' : 'moderate',
        confidence: 0.8,
        earlyDetection: true,
        affectedArea: 100,
        timeToAction: 24,
        recommendedAction: [
          'Increase humidity',
          'Check water quality',
          'Monitor root health',
          'Adjust VPD levels'
        ]
      });
    }

    // Check water band index
    if (indices.wbi < waterModel.wbi_threshold) {
      indicators.push({
        stressType: 'water',
        severity: indices.wbi < 0.8 ? 'severe' : 'moderate',
        confidence: 0.9,
        earlyDetection: indices.wbi > 0.85,
        affectedArea: this.estimateAffectedArea(indices.wbi, 0.9) * 100,
        timeToAction: 18,
        recommendedAction: [
          'Immediate irrigation',
          'Check irrigation system',
          'Monitor substrate moisture',
          'Adjust environmental conditions'
        ]
      });
    }

    return indicators;
  }

  private analyzeLightStress(
    fluorescenceData: ChlorophyllFluorescence,
    environmentalContext: any
  ): PlantStressIndicator[] {
    const indicators: PlantStressIndicator[] = [];
    
    // Check photosystem II efficiency
    if (fluorescenceData.fvFmRatio < 0.75) {
      const severity = fluorescenceData.fvFmRatio < 0.6 ? 'severe' : 
                     fluorescenceData.fvFmRatio < 0.7 ? 'moderate' : 'mild';
      
      indicators.push({
        stressType: 'light',
        severity,
        confidence: 0.95,
        earlyDetection: fluorescenceData.fvFmRatio > 0.7,
        affectedArea: 100,
        timeToAction: severity === 'severe' ? 6 : 24,
        recommendedAction: [
          severity === 'severe' ? 'Reduce light intensity immediately' : 'Adjust light levels',
          'Check for photoinhibition',
          'Monitor leaf temperature',
          'Adjust photoperiod'
        ]
      });
    }

    // Check non-photochemical quenching (heat dissipation)
    if (fluorescenceData.qN > 0.8) {
      indicators.push({
        stressType: 'light',
        severity: fluorescenceData.qN > 0.9 ? 'severe' : 'moderate',
        confidence: 0.8,
        earlyDetection: true,
        affectedArea: 100,
        timeToAction: 12,
        recommendedAction: [
          'Reduce PPFD levels',
          'Improve cooling',
          'Check CO2 levels',
          'Monitor zeaxanthin cycle'
        ]
      });
    }

    return indicators;
  }

  private analyzeAirQualityStress(data: HyperspectralData): PlantStressIndicator[] {
    const indicators: PlantStressIndicator[] = [];
    
    // Check for ethylene damage (affects NIR reflectance)
    const nirReflectance = this.getWavelengthReflectance(data, 800);
    if (nirReflectance < 0.4) {
      indicators.push({
        stressType: 'air_quality',
        severity: nirReflectance < 0.3 ? 'severe' : 'moderate',
        confidence: 0.7,
        earlyDetection: true,
        affectedArea: this.estimateAffectedArea(nirReflectance, 0.4) * 100,
        timeToAction: 24,
        recommendedAction: [
          'Check for ethylene sources',
          'Improve ventilation',
          'Monitor air filtration',
          'Check for gas leaks'
        ]
      });
    }

    return indicators;
  }

  // Utility methods
  private getWavelengthReflectance(data: HyperspectralData, targetWavelength: number): number {
    const index = data.wavelengths.findIndex(w => Math.abs(w - targetWavelength) < 5);
    return index >= 0 ? data.reflectance[index] : 0;
  }

  private calculatePatternSimilarity(observed: number[], expected: number[]): number {
    if (observed.length !== expected.length) return 0;
    
    let similarity = 0;
    for (let i = 0; i < observed.length; i++) {
      similarity += 1 - Math.abs(observed[i] - expected[i]);
    }
    return similarity / observed.length;
  }

  private estimateAffectedArea(value: number, threshold: number): number {
    const deviation = Math.abs(value - threshold) / threshold;
    return Math.min(deviation, 1.0);
  }

  private calculateNutrientScore(levels: string[]): number {
    const adequateCount = levels.filter(level => level === 'adequate').length;
    return (adequateCount / levels.length) * 100;
  }

  private compileStressIndicators(allIndicators: PlantStressIndicator[][]): PlantStressIndicator[] {
    return allIndicators.flat().sort((a, b) => {
      const severityOrder = { 'critical': 5, 'severe': 4, 'moderate': 3, 'mild': 2, 'none': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  private calculateOverallHealthScore(
    indicators: PlantStressIndicator[],
    indices: VegetationIndex,
    fluorescence: ChlorophyllFluorescence
  ): number {
    let score = 100;
    
    // Deduct points for stress indicators
    indicators.forEach(indicator => {
      const severityPenalty = {
        'critical': 30,
        'severe': 20,
        'moderate': 10,
        'mild': 5,
        'none': 0
      };
      score -= severityPenalty[indicator.severity] * indicator.confidence;
    });
    
    // Adjust based on vegetation indices
    if (indices.ndvi < 0.6) score -= 15;
    if (indices.pri < -0.1) score -= 10;
    
    // Adjust based on fluorescence
    if (fluorescence.fvFmRatio < 0.75) score -= 10;
    
    return Math.max(Math.min(score, 100), 0);
  }

  private generateRecommendations(
    indicators: PlantStressIndicator[],
    nutrientAnalysis: any
  ): string[] {
    const recommendations = new Set<string>();
    
    // Add recommendations from stress indicators
    indicators.forEach(indicator => {
      indicator.recommendedAction.forEach(action => recommendations.add(action));
    });
    
    // Add general health recommendations
    if (indicators.length === 0) {
      recommendations.add('Continue current management practices');
      recommendations.add('Monitor plant health regularly');
    }
    
    return Array.from(recommendations);
  }

  private determineActionPriority(
    indicators: PlantStressIndicator[],
    healthScore: number
  ): 'immediate' | 'urgent' | 'moderate' | 'low' | 'monitor' {
    const criticalStress = indicators.some(i => i.severity === 'critical');
    const severeStress = indicators.some(i => i.severity === 'severe');
    const immediateAction = indicators.some(i => i.timeToAction <= 12);
    
    if (criticalStress || immediateAction) return 'immediate';
    if (severeStress || healthScore < 50) return 'urgent';
    if (indicators.length > 0 || healthScore < 75) return 'moderate';
    if (healthScore < 90) return 'low';
    return 'monitor';
  }

  private analyzeTrends(plantId: string, currentScore: number): any {
    const recentReports = this.historicalReports
      .filter(r => r.plantId === plantId)
      .slice(-10)
      .map(r => r.overallHealthScore);
    
    if (recentReports.length < 3) {
      return { improving: false, stable: true, declining: false, rate: 0 };
    }
    
    const avgRecent = recentReports.slice(-3).reduce((a, b) => a + b) / 3;
    const avgOlder = recentReports.slice(0, -3).reduce((a, b) => a + b) / (recentReports.length - 3);
    
    const change = avgRecent - avgOlder;
    const rate = change / recentReports.length;
    
    return {
      improving: change > 2,
      stable: Math.abs(change) <= 2,
      declining: change < -2,
      rate
    };
  }

  // Public API methods
  public getPlantHealthHistory(plantId: string, days: number = 7): PlantStressReport[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.historicalReports.filter(r => 
      r.plantId === plantId && r.timestamp >= cutoff
    );
  }

  public getCriticalAlerts(facilityId?: string): PlantStressReport[] {
    return this.historicalReports
      .filter(r => r.actionPriority === 'immediate' || r.actionPriority === 'urgent')
      .slice(-20); // Last 20 critical alerts
  }

  public generateFacilitySummary(facilityId: string): any {
    const recentReports = this.historicalReports.slice(-100);
    
    const avgHealthScore = recentReports.reduce((sum, r) => sum + r.overallHealthScore, 0) / recentReports.length;
    const stressTypes = new Map<string, number>();
    
    recentReports.forEach(report => {
      report.stressIndicators.forEach(indicator => {
        stressTypes.set(indicator.stressType, (stressTypes.get(indicator.stressType) || 0) + 1);
      });
    });
    
    return {
      avgHealthScore,
      totalPlantsMonitored: new Set(recentReports.map(r => r.plantId)).size,
      criticalIssues: recentReports.filter(r => r.actionPriority === 'immediate').length,
      commonStressTypes: Array.from(stressTypes.entries()).sort((a, b) => b[1] - a[1]),
      trends: this.calculateFacilityTrends(recentReports)
    };
  }

  private calculateFacilityTrends(reports: PlantStressReport[]): any {
    // Group by day and calculate daily averages
    const dailyAverages = new Map<string, number[]>();
    
    reports.forEach(report => {
      const day = report.timestamp.toISOString().split('T')[0];
      if (!dailyAverages.has(day)) {
        dailyAverages.set(day, []);
      }
      dailyAverages.get(day)!.push(report.overallHealthScore);
    });
    
    const dailyScores = Array.from(dailyAverages.entries())
      .map(([day, scores]) => ({
        day,
        avgScore: scores.reduce((a, b) => a + b) / scores.length
      }))
      .sort((a, b) => a.day.localeCompare(b.day));
    
    return {
      dailyScores,
      overallTrend: dailyScores.length > 1 ? 
        dailyScores[dailyScores.length - 1].avgScore - dailyScores[0].avgScore : 0
    };
  }
}