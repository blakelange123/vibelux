import { YieldPredictionModel } from './ml/yield-prediction-model';
import { SpectrumMLEngine } from './spectrum-ml-engine';
import { SpectralContinuousLearning } from './spectral-continuous-learning';
import { SpectralRegressionEngine } from './spectral-regression-engine';
import { GrowthStage, EnvironmentType } from '@prisma/client';

// Integration service to connect all ML systems
export class SpectralMLIntegration {
  private yieldModel: YieldPredictionModel;
  private spectrumEngine: SpectrumMLEngine;
  private continuousLearning: SpectralContinuousLearning;
  private regressionEngine: SpectralRegressionEngine;

  constructor() {
    this.yieldModel = new YieldPredictionModel();
    this.spectrumEngine = new SpectrumMLEngine();
    this.continuousLearning = new SpectralContinuousLearning();
    this.regressionEngine = new SpectralRegressionEngine();

    this.setupEventListeners();
  }

  // Setup event listeners for continuous learning
  private setupEventListeners() {
    // When new patterns are discovered, update the spectrum engine
    this.continuousLearning.on('patternsDiscovered', async ({ patterns }) => {
      for (const pattern of patterns) {
        await this.updateSpectrumEngine(pattern);
      }
    });

    // When training completes, update yield predictions
    this.continuousLearning.on('trainingCompleted', async ({ improvement }) => {
      if (improvement > 5) {
        await this.recalibrateYieldModel();
      }
    });
  }

  // Enhanced yield prediction that considers spectrum optimization
  async predictYieldWithSpectralOptimization(params: {
    temperature: number;
    humidity: number;
    ppfd: number;
    co2: number;
    vpd: number;
    ec: number;
    ph: number;
    dli: number;
    growthStage: string;
    currentSpectrum?: any;
    cropType?: string;
    environmentType?: EnvironmentType;
  }): Promise<{
    baseYield: number;
    optimizedYield: number;
    spectralImprovement: number;
    recommendedSpectrum: any;
    confidence: number;
  }> {
    // Get base yield prediction
    const basePrediction = await this.yieldModel.predict(params);

    // If no spectrum data, return base prediction
    if (!params.currentSpectrum || !params.cropType) {
      return {
        baseYield: basePrediction.yield,
        optimizedYield: basePrediction.yield,
        spectralImprovement: 0,
        recommendedSpectrum: null,
        confidence: basePrediction.confidence.overall
      };
    }

    // Get spectrum recommendations
    const recommendations = await this.continuousLearning.recommendAdjustments(
      params.currentSpectrum,
      params.cropType,
      params.growthStage as GrowthStage,
      'yieldWeight'
    );

    // Calculate optimized spectrum
    const optimizedSpectrum = this.applyRecommendations(
      params.currentSpectrum,
      recommendations.recommendations
    );

    // Predict yield with optimized spectrum
    const spectralPrediction = await this.continuousLearning.predict(
      optimizedSpectrum,
      params.cropType,
      params.growthStage as GrowthStage,
      'yieldWeight'
    );

    // Combine predictions
    const optimizedYield = basePrediction.yield * (1 + recommendations.expectedImprovement / 100);
    const spectralImprovement = ((optimizedYield - basePrediction.yield) / basePrediction.yield) * 100;

    return {
      baseYield: basePrediction.yield,
      optimizedYield,
      spectralImprovement,
      recommendedSpectrum: optimizedSpectrum,
      confidence: (basePrediction.confidence.overall + spectralPrediction.confidence) / 2
    };
  }

  // Analyze spectrum efficiency for current conditions
  async analyzeSpectrumEfficiency(params: {
    currentSpectrum: any;
    environmentalConditions: {
      temperature: number;
      humidity: number;
      co2: number;
      vpd: number;
    };
    cropType: string;
    growthStage: GrowthStage;
    targetMetric: 'yield' | 'quality' | 'efficiency';
  }): Promise<{
    currentEfficiency: number;
    potentialEfficiency: number;
    energyWaste: number;
    spectralBalance: {
      blue: { status: string; adjustment: number };
      red: { status: string; adjustment: number };
      farRed: { status: string; adjustment: number };
      green: { status: string; adjustment: number };
    };
    recommendations: string[];
  }> {
    // Calculate current spectrum efficiency
    const totalPPFD = Object.values(params.currentSpectrum)
      .reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);
    
    const powerConsumption = totalPPFD * 0.3; // Simplified power calculation

    // Get optimal spectrum for conditions
    const optimalResult = await this.spectrumEngine.optimizeSpectrum(
      params.currentSpectrum,
      params.targetMetric,
      params.environmentalConditions
    );

    // Calculate efficiencies
    const currentOutput = await this.continuousLearning.predict(
      params.currentSpectrum,
      params.cropType,
      params.growthStage,
      params.targetMetric === 'yield' ? 'yieldWeight' : 'qualityScore'
    );

    const optimalOutput = await this.continuousLearning.predict(
      optimalResult.spectrum,
      params.cropType,
      params.growthStage,
      params.targetMetric === 'yield' ? 'yieldWeight' : 'qualityScore'
    );

    const currentEfficiency = currentOutput.value / powerConsumption;
    const potentialEfficiency = optimalOutput.value / (totalPPFD * 0.28); // Optimized power
    const energyWaste = ((powerConsumption - totalPPFD * 0.28) / powerConsumption) * 100;

    // Analyze spectral balance
    const spectralBalance = this.analyzeSpectralBalance(
      params.currentSpectrum,
      optimalResult.spectrum
    );

    // Generate recommendations
    const recommendations = this.generateEfficiencyRecommendations(
      spectralBalance,
      energyWaste,
      params.growthStage
    );

    return {
      currentEfficiency,
      potentialEfficiency,
      energyWaste,
      spectralBalance,
      recommendations
    };
  }

  // Real-time spectrum adjustment based on plant feedback
  async adjustSpectrumBasedOnFeedback(params: {
    currentSpectrum: any;
    plantSensorData: {
      sapFlow?: number;
      stomatalConductance?: number;
      leafTemperature?: number;
      electricalActivity?: string;
    };
    environmentalData: {
      temperature: number;
      humidity: number;
      co2: number;
      vpd: number;
    };
    cropType: string;
    growthStage: GrowthStage;
  }): Promise<{
    adjustedSpectrum: any;
    adjustmentReason: string;
    expectedImpact: string;
    confidence: number;
  }> {
    let adjustmentReason = '';
    let adjustedSpectrum = { ...params.currentSpectrum };
    let confidence = 0.8;

    // Check for stress indicators
    if (params.plantSensorData.stomatalConductance && params.plantSensorData.stomatalConductance < 150) {
      // Stomata closing - reduce light intensity
      adjustmentReason = 'Stomatal closure detected - reducing light stress';
      Object.keys(adjustedSpectrum).forEach(key => {
        adjustedSpectrum[key] *= 0.85; // Reduce by 15%
      });
      confidence = 0.9;
    } else if (params.plantSensorData.sapFlow && params.plantSensorData.sapFlow < 80) {
      // Low sap flow - adjust spectrum for water stress
      adjustmentReason = 'Low sap flow detected - optimizing for water stress';
      adjustedSpectrum.blue430_480 *= 0.9;
      adjustedSpectrum.farRed700_800 *= 1.1;
      confidence = 0.85;
    } else if (params.plantSensorData.electricalActivity === 'stress') {
      // Electrical stress signals - immediate response
      adjustmentReason = 'Plant stress signals detected - emergency adjustment';
      adjustedSpectrum = await this.getStressOptimizedSpectrum(
        params.cropType,
        params.growthStage
      );
      confidence = 0.95;
    }

    // Calculate expected impact
    const currentPrediction = await this.continuousLearning.predict(
      params.currentSpectrum,
      params.cropType,
      params.growthStage,
      'yieldWeight'
    );

    const adjustedPrediction = await this.continuousLearning.predict(
      adjustedSpectrum,
      params.cropType,
      params.growthStage,
      'yieldWeight'
    );

    const impact = ((adjustedPrediction.value - currentPrediction.value) / currentPrediction.value) * 100;
    const expectedImpact = impact > 0 
      ? `${impact.toFixed(1)}% yield improvement expected`
      : `${Math.abs(impact).toFixed(1)}% yield protection (preventing loss)`;

    return {
      adjustedSpectrum,
      adjustmentReason: adjustmentReason || 'No adjustment needed',
      expectedImpact,
      confidence
    };
  }

  // Get correlations between spectrum and multiple plant metrics
  async getComprehensiveCorrelations(params: {
    timeRange: '7d' | '30d' | '90d' | 'all';
    cropType?: string;
    growthStage?: GrowthStage;
    environmentType?: EnvironmentType;
  }): Promise<{
    correlations: Map<string, any>;
    strongestPositive: { band: string; metric: string; correlation: number };
    strongestNegative: { band: string; metric: string; correlation: number };
    insights: string[];
  }> {
    // This would fetch from database in production
    const mockCorrelations = new Map<string, any>();
    
    // Yield correlations
    mockCorrelations.set('yield', {
      blue: 0.72,
      red: 0.85,
      farRed: 0.68,
      green: -0.15,
      uv: 0.45
    });

    // Quality correlations
    mockCorrelations.set('quality', {
      blue: 0.82,
      red: 0.65,
      farRed: 0.35,
      green: 0.12,
      uv: 0.78
    });

    // Growth rate correlations
    mockCorrelations.set('growthRate', {
      blue: 0.55,
      red: 0.78,
      farRed: 0.88,
      green: -0.08,
      uv: 0.22
    });

    // Find strongest correlations
    let strongestPositive = { band: '', metric: '', correlation: 0 };
    let strongestNegative = { band: '', metric: '', correlation: 0 };

    mockCorrelations.forEach((correlations, metric) => {
      Object.entries(correlations).forEach(([band, correlation]) => {
        if (correlation > strongestPositive.correlation) {
          strongestPositive = { band, metric, correlation };
        }
        if (correlation < strongestNegative.correlation) {
          strongestNegative = { band, metric, correlation };
        }
      });
    });

    // Generate insights
    const insights = [
      `Red light (625-660nm) shows the strongest positive correlation with yield (r=${strongestPositive.correlation})`,
      `Far-red light significantly impacts growth rate, especially stem elongation`,
      `UV light correlates strongly with quality metrics including flavor compounds`,
      `Green light shows minimal impact on most metrics, confirming efficiency opportunity`
    ];

    return {
      correlations: mockCorrelations,
      strongestPositive,
      strongestNegative,
      insights
    };
  }

  // Private helper methods
  private async updateSpectrumEngine(pattern: any) {
    // Update the spectrum ML engine with new discovered patterns
    // This would integrate with the existing spectrum engine
  }

  private async recalibrateYieldModel() {
    // Recalibrate yield prediction model with new spectral data
    // This would retrain or fine-tune the existing model
  }

  private applyRecommendations(currentSpectrum: any, recommendations: any[]): any {
    const optimized = { ...currentSpectrum };
    
    recommendations.forEach(rec => {
      if (optimized[rec.band]) {
        optimized[rec.band] = rec.recommendedValue;
      }
    });

    return optimized;
  }

  private analyzeSpectralBalance(current: any, optimal: any): any {
    const bands = ['blue', 'red', 'farRed', 'green'];
    const balance: any = {};

    bands.forEach(band => {
      const currentVal = current[band + '430_480'] || current[band + '625_660'] || 
                        current[band + '700_800'] || current[band + '520_565'] || 0;
      const optimalVal = optimal[band + '430_480'] || optimal[band + '625_660'] || 
                        optimal[band + '700_800'] || optimal[band + '520_565'] || 0;
      
      const diff = optimalVal - currentVal;
      const percentDiff = (diff / currentVal) * 100;

      balance[band] = {
        status: Math.abs(percentDiff) < 10 ? 'optimal' : 
                percentDiff > 0 ? 'deficient' : 'excess',
        adjustment: percentDiff
      };
    });

    return balance;
  }

  private generateEfficiencyRecommendations(
    spectralBalance: any,
    energyWaste: number,
    growthStage: GrowthStage
  ): string[] {
    const recommendations: string[] = [];

    // Energy waste recommendations
    if (energyWaste > 15) {
      recommendations.push(`Reduce overall intensity by ${energyWaste.toFixed(0)}% to improve efficiency`);
    }

    // Spectral balance recommendations
    Object.entries(spectralBalance).forEach(([band, data]: [string, any]) => {
      if (data.status === 'deficient') {
        recommendations.push(`Increase ${band} light by ${Math.abs(data.adjustment).toFixed(0)}%`);
      } else if (data.status === 'excess') {
        recommendations.push(`Reduce ${band} light by ${Math.abs(data.adjustment).toFixed(0)}%`);
      }
    });

    // Growth stage specific recommendations
    if (growthStage === GrowthStage.VEGETATIVE) {
      recommendations.push('Consider higher blue:red ratio for compact growth');
    } else if (growthStage === GrowthStage.FLOWERING) {
      recommendations.push('Increase red:far-red ratio to promote flowering');
    }

    return recommendations;
  }

  private async getStressOptimizedSpectrum(
    cropType: string,
    growthStage: GrowthStage
  ): Promise<any> {
    // Return a conservative spectrum for stress conditions
    return {
      uv365_400: 0,
      violet400_430: 10,
      blue430_480: 60,
      cyan480_520: 20,
      green520_565: 10,
      yellow565_590: 10,
      orange590_625: 20,
      red625_660: 80,
      deepRed660_700: 60,
      farRed700_800: 20
    };
  }

  // Cleanup
  async cleanup() {
    await this.continuousLearning.cleanup();
  }
}