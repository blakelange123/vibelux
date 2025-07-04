// AI Yield Prediction Model

import { 
  YieldPrediction, 
  PredictionResult, 
  ContributingFactor,
  RiskFactor,
  ModelType,
  ConfidenceInterval,
  ProbabilityDistribution,
  TimelinePrediction,
  QualityPrediction
} from './advanced-analytics-types';

export class YieldPredictionModel {
  private modelVersion = '2.0.1';
  private modelType = ModelType.Ensemble;
  
  // Feature weights learned from historical data
  private featureWeights = {
    environmental: {
      temperature: 0.15,
      humidity: 0.12,
      co2: 0.10,
      light: 0.18,
      vpd: 0.14
    },
    cultivation: {
      strainGenetics: 0.20,
      nutrientSchedule: 0.15,
      wateringFrequency: 0.08,
      pruningTechnique: 0.07,
      plantDensity: 0.10
    },
    historical: {
      previousYields: 0.25,
      strainPerformance: 0.15,
      roomPerformance: 0.10,
      seasonalFactors: 0.05
    }
  };

  async predictYield(input: PredictionInput): Promise<YieldPrediction> {
    // Collect and preprocess features
    const features = await this.extractFeatures(input);
    
    // Run ensemble prediction
    const predictions = await Promise.all([
      this.runRandomForest(features),
      this.runGradientBoosting(features),
      this.runNeuralNetwork(features),
      this.runTimeSeriesModel(features)
    ]);
    
    // Combine predictions
    const ensemblePrediction = this.combineEnsemble(predictions);
    
    // Calculate confidence and risks
    const confidence = this.calculateConfidence(predictions);
    const factors = this.analyzeContributingFactors(features);
    const risks = this.identifyRisks(features, input);
    const recommendations = this.generateRecommendations(factors, risks);
    
    return {
      id: this.generatePredictionId(),
      roomId: input.roomId,
      strainId: input.strainId,
      batchId: input.batchId,
      predictionDate: new Date(),
      harvestDate: ensemblePrediction.timeline.optimalHarvestWindow.end,
      model: {
        modelId: 'yield-ensemble-v2',
        modelName: 'VibeLux Yield Predictor',
        version: this.modelVersion,
        type: this.modelType
      },
      prediction: ensemblePrediction,
      confidence,
      factors,
      risks,
      recommendations
    };
  }

  private async extractFeatures(input: PredictionInput): Promise<FeatureVector> {
    const features: FeatureVector = {
      environmental: await this.getEnvironmentalFeatures(input),
      cultivation: await this.getCultivationFeatures(input),
      historical: await this.getHistoricalFeatures(input),
      temporal: await this.getTemporalFeatures(input)
    };
    
    return this.normalizeFeatures(features);
  }

  private async getEnvironmentalFeatures(input: PredictionInput): Promise<EnvironmentalFeatures> {
    // In production, these would come from sensor data
    return {
      avgTemperature: input.environmentData.temperature.avg,
      tempVariance: input.environmentData.temperature.variance,
      avgHumidity: input.environmentData.humidity.avg,
      humidityVariance: input.environmentData.humidity.variance,
      avgCO2: input.environmentData.co2.avg,
      co2Variance: input.environmentData.co2.variance,
      avgPPFD: input.environmentData.light.ppfd,
      dli: input.environmentData.light.dli,
      avgVPD: input.environmentData.vpd.avg,
      vpdVariance: input.environmentData.vpd.variance
    };
  }

  private async getCultivationFeatures(input: PredictionInput): Promise<CultivationFeatures> {
    return {
      strainId: input.strainId,
      growthStage: input.currentStage,
      plantCount: input.plantCount,
      plantDensity: input.plantCount / input.canopyArea,
      nutrientStrength: input.nutrientEC,
      phLevel: input.nutrientPH,
      irrigationFrequency: input.irrigationsPerDay,
      pruningMethod: input.pruningMethod,
      trainingMethod: input.trainingMethod,
      growMedium: input.growMedium
    };
  }

  private async getHistoricalFeatures(input: PredictionInput): Promise<HistoricalFeatures> {
    // Fetch historical data
    const strainHistory = await this.fetchStrainHistory(input.strainId);
    const roomHistory = await this.fetchRoomHistory(input.roomId);
    
    return {
      avgStrainYield: strainHistory.avgYield,
      strainYieldStdDev: strainHistory.stdDev,
      bestStrainYield: strainHistory.best,
      avgRoomYield: roomHistory.avgYield,
      roomYieldStdDev: roomHistory.stdDev,
      recentTrend: this.calculateTrend(roomHistory.recent),
      seasonalFactor: this.getSeasonalFactor(new Date())
    };
  }

  private async getTemporalFeatures(input: PredictionInput): Promise<TemporalFeatures> {
    const currentDate = new Date();
    const plantingDate = input.plantingDate;
    const daysInGrowth = Math.floor((currentDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      daysInGrowth,
      currentStage: input.currentStage,
      daysInStage: input.daysInCurrentStage,
      expectedFlowerTime: input.expectedFloweringDays,
      progressPercentage: (daysInGrowth / input.expectedTotalDays) * 100
    };
  }

  private async runRandomForest(features: FeatureVector): Promise<ModelPrediction> {
    // Simulate Random Forest prediction
    const baseYield = this.calculateBaseYield(features);
    const adjustment = this.randomForestAdjustment(features);
    
    return {
      yield: baseYield * adjustment,
      confidence: 0.85,
      modelType: 'RandomForest'
    };
  }

  private async runGradientBoosting(features: FeatureVector): Promise<ModelPrediction> {
    // Simulate Gradient Boosting prediction
    const prediction = this.gradientBoostingPredict(features);
    
    return {
      yield: prediction,
      confidence: 0.88,
      modelType: 'GradientBoosting'
    };
  }

  private async runNeuralNetwork(features: FeatureVector): Promise<ModelPrediction> {
    // Simulate Neural Network prediction
    const nnOutput = this.neuralNetworkForward(features);
    
    return {
      yield: nnOutput.yield,
      confidence: 0.82,
      modelType: 'NeuralNetwork'
    };
  }

  private async runTimeSeriesModel(features: FeatureVector): Promise<ModelPrediction> {
    // Simulate Time Series prediction
    const tsPrediction = this.arimaPredict(features);
    
    return {
      yield: tsPrediction,
      confidence: 0.79,
      modelType: 'TimeSeries'
    };
  }

  private combineEnsemble(predictions: ModelPrediction[]): PredictionResult {
    // Weighted average based on confidence
    const totalConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0);
    const weightedYield = predictions.reduce((sum, p) => sum + (p.yield * p.confidence), 0) / totalConfidence;
    
    // Calculate distribution
    const distribution = this.calculateDistribution(predictions, weightedYield);
    
    // Generate quality prediction
    const quality = this.predictQuality(weightedYield, predictions);
    
    // Generate timeline
    const timeline = this.predictTimeline(predictions);
    
    return {
      expectedYield: Math.round(weightedYield),
      yieldPerSqFt: weightedYield / 100, // Assuming 100 sq ft
      yieldPerPlant: weightedYield / 50, // Assuming 50 plants
      quality,
      timeline,
      probability: distribution
    };
  }

  private calculateDistribution(predictions: ModelPrediction[], mean: number): ProbabilityDistribution {
    const values = predictions.map(p => p.yield);
    const stdDev = this.calculateStdDev(values, mean);
    
    return {
      mean,
      median: this.calculateMedian(values),
      standardDeviation: stdDev,
      percentiles: [
        { percentile: 10, value: mean - 1.28 * stdDev },
        { percentile: 25, value: mean - 0.67 * stdDev },
        { percentile: 50, value: mean },
        { percentile: 75, value: mean + 0.67 * stdDev },
        { percentile: 90, value: mean + 1.28 * stdDev }
      ],
      distribution: this.generateDistributionCurve(mean, stdDev)
    };
  }

  private predictQuality(yield: number, predictions: ModelPrediction[]): QualityPrediction {
    // Quality correlation with yield
    const qualityScore = Math.min(100, 70 + (yield / 100) * 30);
    
    return {
      grade: qualityScore >= 90 ? 'A' : qualityScore >= 80 ? 'B' : 'C',
      thcContent: 18 + (qualityScore / 100) * 7, // 18-25% range
      cbdContent: 0.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1.5,
      terpeneProfile: {
        profile: {
          'Myrcene': 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4,
          'Limonene': 0.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.3,
          'Caryophyllene': 0.3 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2,
          'Pinene': 0.2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2,
          'Linalool': 0.1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1
        },
        dominantTerpenes: ['Myrcene', 'Limonene'],
        aromaProfile: ['Earthy', 'Citrus', 'Spicy']
      },
      defectProbability: Math.max(0, 10 - qualityScore / 10),
      trimRatio: 0.15 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.05
    };
  }

  private predictTimeline(predictions: ModelPrediction[]): TimelinePrediction {
    const today = new Date();
    const daysToHarvest = 21 + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 14); // 3-5 weeks
    
    return {
      daysToHarvest,
      optimalHarvestWindow: {
        start: new Date(today.getTime() + (daysToHarvest - 3) * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + (daysToHarvest + 3) * 24 * 60 * 60 * 1000)
      },
      growthStages: [
        { stage: 'Flowering', startDate: today, duration: 14, completed: false },
        { stage: 'Ripening', startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), duration: 7, completed: false },
        { stage: 'Flushing', startDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000), duration: 7, completed: false }
      ],
      criticalDates: [
        { event: 'Stop Nutrients', date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000), importance: 'High' },
        { event: 'Begin Flush', date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000), importance: 'High' },
        { event: 'Trichome Check', date: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000), importance: 'Medium' }
      ]
    };
  }

  private calculateConfidence(predictions: ModelPrediction[]): ConfidenceInterval {
    const yields = predictions.map(p => p.yield);
    const mean = yields.reduce((sum, y) => sum + y, 0) / yields.length;
    const stdDev = this.calculateStdDev(yields, mean);
    
    // 95% confidence interval
    const marginOfError = 1.96 * stdDev / Math.sqrt(yields.length);
    
    return {
      lower: mean - marginOfError,
      upper: mean + marginOfError,
      level: 0.95
    };
  }

  private analyzeContributingFactors(features: FeatureVector): ContributingFactor[] {
    const factors: ContributingFactor[] = [];
    
    // Environmental factors
    if (features.environmental.avgPPFD < 800) {
      factors.push({
        name: 'Light Intensity',
        category: 'Environmental',
        currentValue: features.environmental.avgPPFD,
        optimalValue: 900,
        impact: -15,
        direction: 'negative',
        controllable: true
      });
    }
    
    if (features.environmental.vpdVariance > 0.3) {
      factors.push({
        name: 'VPD Stability',
        category: 'Environmental',
        currentValue: features.environmental.vpdVariance,
        optimalValue: 0.1,
        impact: -8,
        direction: 'negative',
        controllable: true
      });
    }
    
    // Cultivation factors
    if (features.cultivation.plantDensity > 4) {
      factors.push({
        name: 'Plant Density',
        category: 'Cultivation',
        currentValue: features.cultivation.plantDensity,
        optimalValue: 3,
        impact: -10,
        direction: 'negative',
        controllable: true
      });
    }
    
    // Historical performance
    if (features.historical.recentTrend > 0) {
      factors.push({
        name: 'Recent Performance',
        category: 'Historical',
        currentValue: features.historical.recentTrend,
        optimalValue: features.historical.recentTrend,
        impact: 12,
        direction: 'positive',
        controllable: false
      });
    }
    
    return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  private identifyRisks(features: FeatureVector, input: PredictionInput): RiskFactor[] {
    const risks: RiskFactor[] = [];
    
    // Environmental risks
    if (features.environmental.tempVariance > 3) {
      risks.push({
        type: 'Temperature Fluctuation',
        probability: 0.7,
        impact: 0.15,
        description: 'High temperature variance may stress plants',
        mitigation: ['Improve HVAC control', 'Add buffer zones', 'Check sensor calibration']
      });
    }
    
    // Disease risks based on humidity
    if (features.environmental.avgHumidity > 65) {
      risks.push({
        type: 'Fungal Disease',
        probability: 0.4,
        impact: 0.25,
        description: 'High humidity increases mold/mildew risk',
        mitigation: ['Increase air circulation', 'Defoliate dense areas', 'Apply preventive IPM']
      });
    }
    
    // Operational risks
    if (input.daysInCurrentStage > input.expectedStageDuration * 1.2) {
      risks.push({
        type: 'Delayed Development',
        probability: 0.8,
        impact: 0.20,
        description: 'Plants progressing slower than expected',
        mitigation: ['Review nutrient levels', 'Check for root issues', 'Verify light schedule']
      });
    }
    
    return risks.sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact));
  }

  private generateRecommendations(factors: ContributingFactor[], risks: RiskFactor[]): string[] {
    const recommendations: string[] = [];
    
    // Top negative factors
    const negativeFactors = factors.filter(f => f.direction === 'negative' && f.controllable);
    negativeFactors.slice(0, 3).forEach(factor => {
      recommendations.push(`Optimize ${factor.name}: Adjust from ${factor.currentValue} to ${factor.optimalValue} for ~${Math.abs(factor.impact)}% yield improvement`);
    });
    
    // Top risks
    risks.slice(0, 2).forEach(risk => {
      recommendations.push(`Mitigate ${risk.type}: ${risk.mitigation[0]}`);
    });
    
    // Positive reinforcement
    const positiveFactors = factors.filter(f => f.direction === 'positive');
    if (positiveFactors.length > 0) {
      recommendations.push(`Maintain ${positiveFactors[0].name} at current levels`);
    }
    
    return recommendations;
  }

  // Helper methods
  private normalizeFeatures(features: FeatureVector): FeatureVector {
    // Normalize numerical features to 0-1 range
    return features; // Simplified for example
  }

  private calculateBaseYield(features: FeatureVector): number {
    // Base yield calculation using weighted features
    return 2000; // grams, simplified
  }

  private randomForestAdjustment(features: FeatureVector): number {
    // Simulate random forest adjustment
    return 0.9 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2;
  }

  private gradientBoostingPredict(features: FeatureVector): number {
    // Simulate gradient boosting
    return 2100 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200;
  }

  private neuralNetworkForward(features: FeatureVector): { yield: number } {
    // Simulate neural network
    return { yield: 2050 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 150 };
  }

  private arimaPredict(features: FeatureVector): number {
    // Simulate ARIMA time series
    return 2000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300;
  }

  private calculateStdDev(values: number[], mean: number): number {
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateMedian(values: number[]): number {
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private generateDistributionCurve(mean: number, stdDev: number): Array<{value: number, probability: number}> {
    const points = [];
    for (let i = -3; i <= 3; i += 0.5) {
      const value = mean + i * stdDev;
      const probability = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * 
                        Math.exp(-0.5 * Math.pow(i, 2));
      points.push({ value, probability });
    }
    return points;
  }

  private async fetchStrainHistory(strainId: string): Promise<any> {
    // Fetch from database
    return {
      avgYield: 2000,
      stdDev: 200,
      best: 2500,
      samples: 10
    };
  }

  private async fetchRoomHistory(roomId: string): Promise<any> {
    // Fetch from database
    return {
      avgYield: 1950,
      stdDev: 180,
      recent: [1900, 1950, 2000, 2050, 2100]
    };
  }

  private calculateTrend(recent: number[]): number {
    // Simple linear trend
    const n = recent.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = recent.reduce((sum, y) => sum + y, 0);
    const sumXY = recent.reduce((sum, y, i) => sum + i * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private getSeasonalFactor(date: Date): number {
    // Seasonal adjustment based on month
    const month = date.getMonth();
    const seasonalFactors = [0.95, 0.96, 0.98, 1.0, 1.02, 1.03, 1.03, 1.02, 1.0, 0.98, 0.96, 0.95];
    return seasonalFactors[month];
  }

  private generatePredictionId(): string {
    return `pred_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
  }
}

// Types for the model
interface PredictionInput {
  roomId: string;
  strainId: string;
  batchId: string;
  plantCount: number;
  canopyArea: number;
  plantingDate: Date;
  currentStage: string;
  daysInCurrentStage: number;
  expectedFloweringDays: number;
  expectedTotalDays: number;
  expectedStageDuration: number;
  nutrientEC: number;
  nutrientPH: number;
  irrigationsPerDay: number;
  pruningMethod: string;
  trainingMethod: string;
  growMedium: string;
  environmentData: {
    temperature: { avg: number; variance: number };
    humidity: { avg: number; variance: number };
    co2: { avg: number; variance: number };
    light: { ppfd: number; dli: number };
    vpd: { avg: number; variance: number };
  };
}

interface FeatureVector {
  environmental: EnvironmentalFeatures;
  cultivation: CultivationFeatures;
  historical: HistoricalFeatures;
  temporal: TemporalFeatures;
}

interface EnvironmentalFeatures {
  avgTemperature: number;
  tempVariance: number;
  avgHumidity: number;
  humidityVariance: number;
  avgCO2: number;
  co2Variance: number;
  avgPPFD: number;
  dli: number;
  avgVPD: number;
  vpdVariance: number;
}

interface CultivationFeatures {
  strainId: string;
  growthStage: string;
  plantCount: number;
  plantDensity: number;
  nutrientStrength: number;
  phLevel: number;
  irrigationFrequency: number;
  pruningMethod: string;
  trainingMethod: string;
  growMedium: string;
}

interface HistoricalFeatures {
  avgStrainYield: number;
  strainYieldStdDev: number;
  bestStrainYield: number;
  avgRoomYield: number;
  roomYieldStdDev: number;
  recentTrend: number;
  seasonalFactor: number;
}

interface TemporalFeatures {
  daysInGrowth: number;
  currentStage: string;
  daysInStage: number;
  expectedFlowerTime: number;
  progressPercentage: number;
}

interface ModelPrediction {
  yield: number;
  confidence: number;
  modelType: string;
}