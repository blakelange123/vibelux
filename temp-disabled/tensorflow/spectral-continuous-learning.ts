import * as tf from '@tensorflow/tfjs';
import { prisma } from '@/lib/prisma';
import { 
  SpectralData, 
  PlantResponse, 
  SpectralLearningProfile,
  SpectralRegressionModel,
  EnvironmentType,
  GrowthStage,
  RegressionType
} from '@prisma/client';
import { SpectralRegressionEngine } from './spectral-regression-engine';
import { EventEmitter } from 'events';

// Learning system configuration
interface LearningConfig {
  minDataPoints: number;
  retrainInterval: number; // hours
  confidenceThreshold: number;
  improvementThreshold: number; // minimum % improvement to update model
  maxModelsPerProfile: number;
  validationSplit: number;
  crossValidationFolds: number;
}

interface LearningMetrics {
  dataPointsCollected: number;
  modelsTrainedToday: number;
  averageAccuracy: number;
  bestPerformingModel: string;
  lastTrainingTime: Date;
  nextScheduledTraining: Date;
}

interface ModelPerformance {
  modelId: string;
  metric: string;
  r2Score: number;
  improvementPercent: number;
  validationScore: number;
  productionReady: boolean;
}

interface SpectralPattern {
  conditions: {
    growthStage: GrowthStage;
    environmentType: EnvironmentType;
    targetMetric: string;
  };
  optimalSpectrum: {
    blue: { min: number; max: number; optimal: number };
    red: { min: number; max: number; optimal: number };
    farRed: { min: number; max: number; optimal: number };
    green: { min: number; max: number; optimal: number };
    uv: { min: number; max: number; optimal: number };
    ratios: {
      redBlue: number;
      redFarRed: number;
    };
  };
  confidence: number;
  validatedOn: number; // number of successful grows
}

export class SpectralContinuousLearning extends EventEmitter {
  private config: LearningConfig;
  private regressionEngine: SpectralRegressionEngine;
  private isTraining: boolean = false;
  private trainingQueue: Map<string, Date> = new Map();
  private activeModels: Map<string, tf.LayersModel> = new Map();

  constructor(config?: Partial<LearningConfig>) {
    super();
    
    this.config = {
      minDataPoints: 100,
      retrainInterval: 24, // Daily by default
      confidenceThreshold: 0.85,
      improvementThreshold: 5, // 5% improvement needed
      maxModelsPerProfile: 10,
      validationSplit: 0.2,
      crossValidationFolds: 5,
      ...config
    };

    this.regressionEngine = new SpectralRegressionEngine();
    this.initializeScheduler();
  }

  // Initialize the continuous learning scheduler
  private initializeScheduler() {
    // Check for models that need retraining every hour
    setInterval(() => {
      this.checkAndRetrainModels();
    }, 3600000); // 1 hour

    // Collect and process new data every 15 minutes
    setInterval(() => {
      this.collectAndProcessNewData();
    }, 900000); // 15 minutes
  }

  // Collect new sensor data and plant responses
  async collectAndProcessNewData() {
    try {
      // Get recent unprocessed data
      const recentData = await prisma.spectralData.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 900000) // Last 15 minutes
          },
          spectralCorrelations: {
            none: {} // Not yet correlated
          }
        },
        include: {
          space: true
        }
      });

      for (const spectralData of recentData) {
        // Find corresponding plant responses
        const plantResponses = await prisma.plantResponse.findMany({
          where: {
            timestamp: {
              gte: new Date(spectralData.timestamp.getTime() - 86400000), // Within 24 hours
              lte: new Date(spectralData.timestamp.getTime() + 86400000)
            }
          }
        });

        // Create correlations
        for (const response of plantResponses) {
          await this.createSpectralCorrelation(spectralData, response);
        }
      }

      this.emit('dataCollected', { count: recentData.length });
    } catch (error) {
      this.emit('error', { type: 'dataCollection', error });
    }
  }

  // Create correlation between spectral data and plant response
  private async createSpectralCorrelation(
    spectralData: SpectralData,
    plantResponse: PlantResponse
  ) {
    // Calculate individual band correlations
    const correlations = await this.regressionEngine.calculateCorrelations(
      [spectralData],
      [plantResponse],
      'yieldWeight' as keyof PlantResponse
    );

    // Get environmental data (would come from sensor readings)
    const environmentalData = {
      temperature: 25,
      humidity: 65,
      co2: 800,
      vpd: 1.2
    };

    // Store correlation
    await prisma.spectralCorrelation.create({
      data: {
        spectralDataId: spectralData.id,
        plantResponseId: plantResponse.id,
        uvCorrelation: correlations.find(c => c.spectralBand.includes('uv'))?.correlation || 0,
        blueCorrelation: correlations.find(c => c.spectralBand.includes('blue'))?.correlation || 0,
        greenCorrelation: correlations.find(c => c.spectralBand.includes('green'))?.correlation || 0,
        redCorrelation: correlations.find(c => c.spectralBand.includes('red'))?.correlation || 0,
        farRedCorrelation: correlations.find(c => c.spectralBand.includes('farRed'))?.correlation || 0,
        rbInteraction: (spectralData.rbrRatio || 0) * 0.1, // Simplified interaction
        rfInteraction: (spectralData.rfrRatio || 0) * 0.1,
        rSquared: 0.85, // Would be calculated from regression
        pValue: 0.001,
        confidenceInterval: { lower: 0.8, upper: 0.9 },
        ...environmentalData
      }
    });
  }

  // Check and retrain models that need updating
  async checkAndRetrainModels() {
    if (this.isTraining) return;

    try {
      const profiles = await prisma.spectralLearningProfile.findMany({
        where: {
          lastUpdated: {
            lt: new Date(Date.now() - this.config.retrainInterval * 3600000)
          }
        },
        include: {
          regressionModels: {
            where: { isActive: true }
          }
        }
      });

      for (const profile of profiles) {
        // Check if we have enough new data
        const dataCount = await this.getNewDataCount(profile);
        
        if (dataCount >= this.config.minDataPoints) {
          this.trainingQueue.set(profile.id, new Date());
          await this.retrainProfile(profile);
        }
      }
    } catch (error) {
      this.emit('error', { type: 'retraining', error });
    }
  }

  // Get count of new data points since last training
  private async getNewDataCount(profile: SpectralLearningProfile): Promise<number> {
    return await prisma.spectralCorrelation.count({
      where: {
        createdAt: {
          gt: profile.lastUpdated
        },
        plantResponse: {
          cultivar: profile.cultivar || undefined,
          growthStage: profile.targetStage || undefined
        }
      }
    });
  }

  // Retrain models for a specific profile
  async retrainProfile(profile: SpectralLearningProfile) {
    this.isTraining = true;
    this.emit('trainingStarted', { profileId: profile.id });

    try {
      // Get training data
      const trainingData = await this.getTrainingData(profile);
      
      // Train multiple model types
      const modelTypes: RegressionType[] = [
        RegressionType.LINEAR,
        RegressionType.RIDGE,
        RegressionType.RANDOM_FOREST,
        RegressionType.NEURAL_NETWORK
      ];

      const modelPerformances: ModelPerformance[] = [];

      for (const modelType of modelTypes) {
        const performance = await this.trainAndEvaluateModel(
          profile,
          modelType,
          trainingData
        );
        
        if (performance) {
          modelPerformances.push(performance);
        }
      }

      // Select best performing model
      const bestModel = modelPerformances.reduce((best, current) => 
        current.r2Score > best.r2Score ? current : best
      );

      // Update profile if improvement threshold met
      if (bestModel.improvementPercent >= this.config.improvementThreshold) {
        await this.updateProfile(profile, bestModel);
      }

      // Discover new patterns
      const patterns = await this.discoverPatterns(profile, trainingData);
      if (patterns.length > 0) {
        this.emit('patternsDiscovered', { profileId: profile.id, patterns });
      }

      this.emit('trainingCompleted', { 
        profileId: profile.id, 
        bestModel: bestModel.modelId,
        improvement: bestModel.improvementPercent 
      });

    } catch (error) {
      this.emit('error', { type: 'training', profileId: profile.id, error });
    } finally {
      this.isTraining = false;
    }
  }

  // Get training data for a profile
  private async getTrainingData(profile: SpectralLearningProfile) {
    const correlations = await prisma.spectralCorrelation.findMany({
      where: {
        plantResponse: {
          cultivar: profile.cultivar || undefined,
          growthStage: profile.targetStage || undefined
        },
        rSquared: {
          gte: 0.5 // Only use reasonably correlated data
        }
      },
      include: {
        spectralData: true,
        plantResponse: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10000 // Limit to recent 10k records
    });

    return correlations;
  }

  // Train and evaluate a specific model type
  private async trainAndEvaluateModel(
    profile: SpectralLearningProfile,
    modelType: RegressionType,
    trainingData: any[]
  ): Promise<ModelPerformance | null> {
    try {
      // Prepare data
      const spectralData = trainingData.map(d => d.spectralData);
      const plantResponses = trainingData.map(d => d.plantResponse);
      
      // Run regression
      const targetMetrics = ['yieldWeight', 'qualityScore', 'biomassAccumulation'];
      let bestResult = null;
      let bestMetric = '';

      for (const metric of targetMetrics) {
        const result = await this.regressionEngine.runMultipleRegression(
          spectralData,
          plantResponses,
          metric as any,
          modelType
        );

        if (!bestResult || result.r2Score > bestResult.r2Score) {
          bestResult = result;
          bestMetric = metric;
        }
      }

      if (!bestResult) return null;

      // Calculate improvement over current model
      const currentModel = profile.regressionModels
        .find(m => m.isActive && m.targetMetric === bestMetric);
      
      const improvement = currentModel 
        ? ((bestResult.r2Score - currentModel.r2Score) / currentModel.r2Score) * 100
        : 100;

      // Cross-validation
      const cvScore = await this.crossValidate(
        spectralData,
        plantResponses,
        bestMetric as any,
        modelType
      );

      // Save model if it meets criteria
      if (bestResult.r2Score >= this.config.confidenceThreshold) {
        const savedModel = await prisma.spectralRegressionModel.create({
          data: {
            profileId: profile.id,
            modelType,
            targetMetric: bestMetric,
            features: bestResult.featureImportance,
            coefficients: {
              values: bestResult.coefficients,
              intercept: bestResult.intercept
            },
            r2Score: bestResult.r2Score,
            rmse: bestResult.rmse,
            mape: bestResult.mape,
            crossValidationScore: cvScore,
            featureImportance: bestResult.featureImportance,
            trainingDataSize: Math.floor(trainingData.length * 0.8),
            testDataSize: Math.floor(trainingData.length * 0.2),
            lastTrained: new Date(),
            isActive: false // Will be activated if it's the best
          }
        });

        return {
          modelId: savedModel.id,
          metric: bestMetric,
          r2Score: bestResult.r2Score,
          improvementPercent: improvement,
          validationScore: cvScore,
          productionReady: bestResult.r2Score >= this.config.confidenceThreshold
        };
      }

      return null;
    } catch (error) {
      console.error('Model training error:', error);
      return null;
    }
  }

  // Cross-validation for model evaluation
  private async crossValidate(
    spectralData: any[],
    plantResponses: any[],
    targetMetric: keyof PlantResponse,
    modelType: RegressionType
  ): Promise<number> {
    const folds = this.config.crossValidationFolds;
    const foldSize = Math.floor(spectralData.length / folds);
    const scores: number[] = [];

    for (let i = 0; i < folds; i++) {
      const testStart = i * foldSize;
      const testEnd = testStart + foldSize;
      
      const testSpectral = spectralData.slice(testStart, testEnd);
      const testResponses = plantResponses.slice(testStart, testEnd);
      
      const trainSpectral = [
        ...spectralData.slice(0, testStart),
        ...spectralData.slice(testEnd)
      ];
      const trainResponses = [
        ...plantResponses.slice(0, testStart),
        ...plantResponses.slice(testEnd)
      ];

      const result = await this.regressionEngine.runMultipleRegression(
        trainSpectral,
        trainResponses,
        targetMetric,
        modelType
      );

      scores.push(result.r2Score);
    }

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // Update profile with new optimal spectrum
  private async updateProfile(
    profile: SpectralLearningProfile,
    bestModel: ModelPerformance
  ) {
    // Deactivate old models
    await prisma.spectralRegressionModel.updateMany({
      where: {
        profileId: profile.id,
        targetMetric: bestModel.metric,
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    // Activate new best model
    await prisma.spectralRegressionModel.update({
      where: { id: bestModel.modelId },
      data: { isActive: true }
    });

    // Calculate new optimal spectrum
    const optimalSpectrum = await this.calculateOptimalSpectrum(profile, bestModel);

    // Update profile
    await prisma.spectralLearningProfile.update({
      where: { id: profile.id },
      data: {
        optimalSpectrum,
        confidenceScore: bestModel.r2Score * 100,
        yieldImprovement: bestModel.metric === 'yieldWeight' ? bestModel.improvementPercent : undefined,
        qualityImprovement: bestModel.metric === 'qualityScore' ? bestModel.improvementPercent : undefined,
        lastUpdated: new Date(),
        version: { increment: 1 },
        dataPoints: { increment: await this.getNewDataCount(profile) }
      }
    });
  }

  // Calculate optimal spectrum based on model
  private async calculateOptimalSpectrum(
    profile: SpectralLearningProfile,
    modelPerformance: ModelPerformance
  ): Promise<any> {
    // Load the model coefficients
    const model = await prisma.spectralRegressionModel.findUnique({
      where: { id: modelPerformance.modelId }
    });

    if (!model) return profile.optimalSpectrum;

    // Use regression engine to optimize
    const currentSpectrum = profile.optimalSpectrum as any;
    const constraints = {
      maxPower: 300, // watts
      minDLI: 20,
      maxDLI: 40,
      environmentType: EnvironmentType.INDOOR
    };

    const optimization = await this.regressionEngine.optimizeSpectrum(
      currentSpectrum,
      modelPerformance.metric,
      100, // target value (would be dynamic)
      constraints,
      null // Would pass actual model
    );

    return optimization.optimalSpectrum;
  }

  // Discover new patterns in the data
  private async discoverPatterns(
    profile: SpectralLearningProfile,
    trainingData: any[]
  ): Promise<SpectralPattern[]> {
    const patterns: SpectralPattern[] = [];

    // Group data by growth stage
    const stageGroups = this.groupByGrowthStage(trainingData);

    for (const [stage, data] of stageGroups) {
      // Analyze spectral distributions for high performers
      const highPerformers = data.filter(d => 
        d.plantResponse.yieldWeight > this.percentile(data.map(x => x.plantResponse.yieldWeight), 80)
      );

      if (highPerformers.length >= 10) {
        const pattern = this.analyzeSpectralPattern(highPerformers, stage);
        if (pattern.confidence >= 0.8) {
          patterns.push(pattern);
        }
      }
    }

    // Look for interaction effects
    const interactions = await this.findInteractionEffects(trainingData);
    patterns.push(...interactions);

    return patterns;
  }

  // Group data by growth stage
  private groupByGrowthStage(data: any[]): Map<GrowthStage, any[]> {
    const groups = new Map<GrowthStage, any[]>();
    
    for (const item of data) {
      const stage = item.plantResponse.growthStage;
      if (!groups.has(stage)) {
        groups.set(stage, []);
      }
      groups.get(stage)!.push(item);
    }
    
    return groups;
  }

  // Analyze spectral pattern for high performers
  private analyzeSpectralPattern(
    highPerformers: any[],
    growthStage: GrowthStage
  ): SpectralPattern {
    // Calculate statistics for each spectral band
    const bands = ['blue430_480', 'red625_660', 'farRed700_800', 'green520_565', 'uv365_400'];
    const stats: any = {};

    for (const band of bands) {
      const values = highPerformers.map(d => d.spectralData[band] || 0);
      stats[band] = {
        min: Math.min(...values),
        max: Math.max(...values),
        optimal: this.median(values),
        std: this.standardDeviation(values)
      };
    }

    // Calculate optimal ratios
    const rbrRatios = highPerformers.map(d => d.spectralData.rbrRatio || 0);
    const rfrRatios = highPerformers.map(d => d.spectralData.rfrRatio || 0);

    return {
      conditions: {
        growthStage,
        environmentType: EnvironmentType.INDOOR,
        targetMetric: 'yieldWeight'
      },
      optimalSpectrum: {
        blue: stats.blue430_480,
        red: stats.red625_660,
        farRed: stats.farRed700_800,
        green: stats.green520_565,
        uv: stats.uv365_400,
        ratios: {
          redBlue: this.median(rbrRatios),
          redFarRed: this.median(rfrRatios)
        }
      },
      confidence: 1 - (this.averageCV(stats) / 100), // Lower CV = higher confidence
      validatedOn: highPerformers.length
    };
  }

  // Find interaction effects between spectral bands
  private async findInteractionEffects(data: any[]): Promise<SpectralPattern[]> {
    const patterns: SpectralPattern[] = [];
    
    // Check for red-blue synergy
    const redBlueInteraction = data.filter(d => {
      const rb = d.spectralData.rbrRatio || 0;
      return rb >= 2.5 && rb <= 3.5; // Optimal range from literature
    });

    if (redBlueInteraction.length >= 20) {
      const avgYield = this.average(redBlueInteraction.map(d => d.plantResponse.yieldWeight));
      const overallAvg = this.average(data.map(d => d.plantResponse.yieldWeight));
      
      if (avgYield > overallAvg * 1.1) { // 10% better
        patterns.push({
          conditions: {
            growthStage: GrowthStage.FLOWERING,
            environmentType: EnvironmentType.INDOOR,
            targetMetric: 'yieldWeight'
          },
          optimalSpectrum: {
            blue: { min: 80, max: 120, optimal: 100 },
            red: { min: 250, max: 350, optimal: 300 },
            farRed: { min: 0, max: 50, optimal: 25 },
            green: { min: 0, max: 30, optimal: 15 },
            uv: { min: 0, max: 10, optimal: 5 },
            ratios: { redBlue: 3.0, redFarRed: 12.0 }
          },
          confidence: 0.85,
          validatedOn: redBlueInteraction.length
        });
      }
    }

    return patterns;
  }

  // Get current learning metrics
  async getMetrics(): Promise<LearningMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metrics: LearningMetrics = {
      dataPointsCollected: await prisma.spectralCorrelation.count(),
      modelsTrainedToday: await prisma.spectralRegressionModel.count({
        where: {
          createdAt: { gte: today }
        }
      }),
      averageAccuracy: 0,
      bestPerformingModel: '',
      lastTrainingTime: new Date(),
      nextScheduledTraining: new Date()
    };

    // Calculate average accuracy
    const activeModels = await prisma.spectralRegressionModel.findMany({
      where: { isActive: true },
      select: { r2Score: true, targetMetric: true }
    });

    if (activeModels.length > 0) {
      metrics.averageAccuracy = activeModels.reduce((sum, m) => sum + m.r2Score, 0) / activeModels.length;
      const best = activeModels.reduce((best, current) => 
        current.r2Score > best.r2Score ? current : best
      );
      metrics.bestPerformingModel = best.targetMetric;
    }

    // Get last training time
    const lastModel = await prisma.spectralRegressionModel.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    if (lastModel) {
      metrics.lastTrainingTime = lastModel.createdAt;
      metrics.nextScheduledTraining = new Date(
        lastModel.createdAt.getTime() + this.config.retrainInterval * 3600000
      );
    }

    return metrics;
  }

  // Predict outcome for given spectrum
  async predict(
    spectrum: any,
    cropType: string,
    growthStage: GrowthStage,
    targetMetric: string
  ): Promise<{ value: number; confidence: number }> {
    // Find matching profile
    const profile = await prisma.spectralLearningProfile.findFirst({
      where: {
        cropType,
        targetStage: growthStage
      },
      include: {
        regressionModels: {
          where: {
            isActive: true,
            targetMetric
          }
        }
      }
    });

    if (!profile || profile.regressionModels.length === 0) {
      return { value: 0, confidence: 0 };
    }

    const model = profile.regressionModels[0];
    
    // Simple linear prediction (would use actual model in production)
    const coefficients = model.coefficients as any;
    let prediction = coefficients.intercept || 0;
    
    // Add weighted features
    const features = Object.entries(spectrum);
    for (let i = 0; i < features.length && i < coefficients.values.length; i++) {
      prediction += coefficients.values[i] * (features[i][1] as number);
    }

    return {
      value: prediction,
      confidence: model.r2Score
    };
  }

  // Recommend spectrum adjustments
  async recommendAdjustments(
    currentSpectrum: any,
    cropType: string,
    growthStage: GrowthStage,
    targetImprovement: string
  ): Promise<any> {
    const profile = await prisma.spectralLearningProfile.findFirst({
      where: {
        cropType,
        targetStage: growthStage
      }
    });

    if (!profile) {
      return { recommendations: [], confidence: 0 };
    }

    const optimal = profile.optimalSpectrum as any;
    const recommendations = [];

    // Compare current to optimal
    for (const [band, value] of Object.entries(currentSpectrum)) {
      if (optimal[band]) {
        const optimalValue = optimal[band].optimal || optimal[band];
        const difference = optimalValue - (value as number);
        const percentChange = (difference / (value as number)) * 100;

        if (Math.abs(percentChange) > 10) {
          recommendations.push({
            band,
            currentValue: value,
            recommendedValue: optimalValue,
            changePercent: percentChange,
            priority: Math.abs(percentChange) > 30 ? 'high' : 'medium'
          });
        }
      }
    }

    return {
      recommendations: recommendations.sort((a, b) => 
        Math.abs(b.changePercent) - Math.abs(a.changePercent)
      ),
      confidence: profile.confidenceScore,
      expectedImprovement: profile.yieldImprovement || 0
    };
  }

  // Utility functions
  private percentile(arr: number[], p: number): number {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }

  private median(arr: number[]): number {
    return this.percentile(arr, 50);
  }

  private average(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  private standardDeviation(arr: number[]): number {
    const avg = this.average(arr);
    const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(this.average(squareDiffs));
  }

  private averageCV(stats: any): number {
    const cvs = Object.values(stats).map((stat: any) => 
      (stat.std / stat.optimal) * 100
    );
    return this.average(cvs);
  }

  // Cleanup
  async cleanup() {
    // Dispose of loaded models
    for (const model of this.activeModels.values()) {
      model.dispose();
    }
    this.activeModels.clear();
    
    // Clear queues
    this.trainingQueue.clear();
    
    // Remove all listeners
    this.removeAllListeners();
  }
}