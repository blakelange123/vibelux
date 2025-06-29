/**
 * Spectrum ML Engine - Real machine learning for spectrum optimization
 * Uses TensorFlow.js for client-side model training and prediction
 */

import * as tf from '@tensorflow/tfjs';

export interface SpectrumFeatures {
  red: number;           // 0-100%
  blue: number;          // 0-100%
  green: number;         // 0-100%
  white: number;         // 0-100%
  farRed: number;        // 0-100%
  uv: number;            // 0-100%
  rbRatio: number;       // Red:Blue ratio
  photoperiod: number;   // Hours
  dli: number;           // mol/m²/day
  ppfd: number;          // µmol/m²/s
  temperature: number;   // °C
  humidity: number;      // %
  co2: number;           // ppm
  vpd: number;           // kPa
  growthStage: number;   // 0-1 (normalized stage)
}

export interface SpectrumOutcomes {
  yield: number;         // kg/m²
  quality: number;       // 1-10 scale
  growthRate: number;    // g/day
  energyEfficiency: number; // g/kWh
  morphologyScore: number;  // Composite score
}

export interface ModelMetrics {
  mse: number;           // Mean Squared Error
  mae: number;           // Mean Absolute Error
  r2: number;            // R-squared
  confidence: number;    // 0-1 confidence score
}

export class SpectrumMLEngine {
  private model: tf.LayersModel | null = null;
  private scaler: { mean: tf.Tensor; std: tf.Tensor } | null = null;
  private featureNames: string[] = [];
  private isTraining: boolean = false;
  
  constructor() {
    // Initialize TensorFlow.js
    tf.setBackend('webgl'); // Use GPU acceleration if available
  }
  
  /**
   * Prepare features from raw grow cycle data
   */
  prepareFeatures(data: any[]): tf.Tensor2D {
    const features = data.map(cycle => {
      const spectrum = cycle.spectrum;
      const lighting = cycle.lightingData;
      const env = cycle.environmentalData;
      
      return [
        spectrum.red / 100,
        spectrum.blue / 100,
        spectrum.green / 100,
        spectrum.white / 100,
        spectrum.farRed / 100,
        (spectrum.uv || 0) / 100,
        spectrum.red / (spectrum.blue || 1), // R:B ratio
        lighting.photoperiod / 24,
        lighting.avgDLI / 50,  // Normalize to typical max
        lighting.avgPPFD / 1000,
        env.avgTemp / 40,
        env.avgHumidity / 100,
        env.avgCO2 / 2000,
        env.avgVPD / 3,
        this.encodeGrowthStage(cycle.stage || 'vegetative')
      ];
    });
    
    return tf.tensor2d(features);
  }
  
  /**
   * Prepare target outcomes from grow cycle data
   */
  prepareTargets(data: any[]): tf.Tensor2D {
    const targets = data.map(cycle => {
      const yield_ = cycle.yieldData;
      const lighting = cycle.lightingData;
      
      return [
        yield_.totalYield / 10,  // Normalize
        yield_.quality / 10,
        yield_.growthRate / 100,
        (yield_.totalYield / lighting.energyUsed) * 1000, // g/kWh
        this.calculateMorphologyScore(yield_.morphology) / 10
      ];
    });
    
    return tf.tensor2d(targets);
  }
  
  /**
   * Build neural network architecture
   */
  buildModel(inputShape: number): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // Input layer with batch normalization
        tf.layers.dense({
          inputShape: [inputShape],
          units: 64,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.2 }),
        
        // Hidden layers
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.2 }),
        
        tf.layers.dense({
          units: 16,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        
        // Output layer - 5 outcomes
        tf.layers.dense({
          units: 5,
          activation: 'sigmoid' // All outputs are normalized 0-1
        })
      ]
    });
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    return model;
  }
  
  /**
   * Train the model with grow cycle data using cross-validation
   */
  async train(
    growCycles: any[],
    options: {
      epochs?: number;
      batchSize?: number;
      validationSplit?: number;
      kFolds?: number;
      callbacks?: {
        onEpochEnd?: (epoch: number, logs: any) => void;
        onTrainingComplete?: (history: any) => void;
        onFoldComplete?: (fold: number, metrics: ModelMetrics) => void;
      };
    } = {}
  ): Promise<{
    avgMetrics: ModelMetrics;
    foldMetrics: ModelMetrics[];
    confidenceIntervals: {
      mse: { lower: number; upper: number };
      mae: { lower: number; upper: number };
      r2: { lower: number; upper: number };
    };
  }> {
    const {
      epochs = 100,
      batchSize = 32,
      validationSplit = 0.2,
      kFolds = 5,
      callbacks
    } = options;
    
    if (growCycles.length < 20) {
      throw new Error('Insufficient data: Need at least 20 grow cycles for robust cross-validation');
    }
    
    this.isTraining = true;
    
    try {
      // Prepare data
      const features = this.prepareFeatures(growCycles);
      const targets = this.prepareTargets(growCycles);
      
      // Perform k-fold cross validation
      const foldMetrics: ModelMetrics[] = [];
      const foldSize = Math.floor(growCycles.length / kFolds);
      
      for (let fold = 0; fold < kFolds; fold++) {
        
        // Split data for this fold
        const testStart = fold * foldSize;
        const testEnd = fold === kFolds - 1 ? growCycles.length : testStart + foldSize;
        
        // Create train/test splits
        const trainIndices = [...Array(growCycles.length).keys()]
          .filter(i => i < testStart || i >= testEnd);
        const testIndices = [...Array(testEnd - testStart).keys()]
          .map(i => i + testStart);
        
        const trainFeatures = tf.gather(features, trainIndices);
        const trainTargets = tf.gather(targets, trainIndices);
        const testFeatures = tf.gather(features, testIndices);
        const testTargets = tf.gather(targets, testIndices);
        
        // Normalize features using training data statistics
        const { normalized: normalizedTrain, mean, std } = this.normalizeData(trainFeatures);
        const normalizedTest = testFeatures.sub(mean).div(std.add(1e-7));
        
        // Create fresh model for this fold
        const foldModel = this.buildModel(features.shape[1]);
        
        // Train model on this fold
        await foldModel.fit(normalizedTrain, trainTargets, {
          epochs,
          batchSize,
          validationSplit: 0.1, // Use small validation split within training
          shuffle: true,
          verbose: 0
        });
        
        // Evaluate on test set
        const predictions = foldModel.predict(normalizedTest) as tf.Tensor;
        const metrics = await this.calculateMetrics(testTargets, predictions);
        foldMetrics.push(metrics);
        
        callbacks?.onFoldComplete?.(fold, metrics);
        
        // Cleanup fold tensors
        trainFeatures.dispose();
        trainTargets.dispose();
        testFeatures.dispose();
        testTargets.dispose();
        normalizedTrain.dispose();
        normalizedTest.dispose();
        predictions.dispose();
        mean.dispose();
        std.dispose();
        foldModel.dispose();
      }
      
      // Calculate average metrics and confidence intervals
      const avgMetrics = this.calculateAverageMetrics(foldMetrics);
      const confidenceIntervals = this.calculateConfidenceIntervals(foldMetrics);
      
      // Train final model on all data
      const { normalized, mean, std } = this.normalizeData(features);
      this.scaler = { mean, std };
      
      if (!this.model) {
        this.model = this.buildModel(features.shape[1]);
      }
      
      const history = await this.model.fit(normalized, targets, {
        epochs,
        batchSize,
        validationSplit,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            callbacks?.onEpochEnd?.(epoch, logs);
          }
        }
      });
      
      callbacks?.onTrainingComplete?.(history);
      
      // Cleanup tensors
      features.dispose();
      targets.dispose();
      normalized.dispose();
      
      this.isTraining = false;
      
      return {
        avgMetrics,
        foldMetrics,
        confidenceIntervals
      };
    } catch (error) {
      this.isTraining = false;
      throw error;
    }
  }
  
  /**
   * Make predictions for new spectrum configurations
   */
  async predict(spectrum: Partial<SpectrumFeatures>): Promise<{
    predictions: SpectrumOutcomes;
    confidence: number;
    uncertainties: Partial<SpectrumOutcomes>;
  }> {
    if (!this.model || !this.scaler) {
      throw new Error('Model not trained yet');
    }
    
    // Prepare single feature vector
    const features = tf.tensor2d([[
      (spectrum.red || 60) / 100,
      (spectrum.blue || 30) / 100,
      (spectrum.green || 5) / 100,
      (spectrum.white || 5) / 100,
      (spectrum.farRed || 0) / 100,
      (spectrum.uv || 0) / 100,
      (spectrum.rbRatio || 2),
      (spectrum.photoperiod || 18) / 24,
      (spectrum.dli || 20) / 50,
      (spectrum.ppfd || 400) / 1000,
      (spectrum.temperature || 23) / 40,
      (spectrum.humidity || 65) / 100,
      (spectrum.co2 || 800) / 2000,
      (spectrum.vpd || 1.0) / 3,
      (spectrum.growthStage || 0.5)
    ]]);
    
    // Normalize
    const normalized = features.sub(this.scaler.mean).div(this.scaler.std);
    
    // Make predictions with uncertainty estimation (Monte Carlo dropout)
    const numPredictions = 100;
    const predictions: tf.Tensor[] = [];
    
    for (let i = 0; i < numPredictions; i++) {
      const pred = this.model.predict(normalized, { training: true }) as tf.Tensor;
      predictions.push(pred);
    }
    
    // Calculate mean and std of predictions
    const stacked = tf.stack(predictions);
    const mean = stacked.mean(0);
    const std = stacked.std(0);
    
    // Convert to outcomes
    const meanValues = await mean.array() as number[][];
    const stdValues = await std.array() as number[][];
    
    const outcomes: SpectrumOutcomes = {
      yield: meanValues[0][0] * 10,
      quality: meanValues[0][1] * 10,
      growthRate: meanValues[0][2] * 100,
      energyEfficiency: meanValues[0][3] / 1000,
      morphologyScore: meanValues[0][4] * 10
    };
    
    const uncertainties: Partial<SpectrumOutcomes> = {
      yield: stdValues[0][0] * 10,
      quality: stdValues[0][1] * 10,
      growthRate: stdValues[0][2] * 100,
      energyEfficiency: stdValues[0][3] / 1000,
      morphologyScore: stdValues[0][4] * 10
    };
    
    // Calculate confidence based on uncertainty
    const avgUncertainty = stdValues[0].reduce((a, b) => a + b) / stdValues[0].length;
    const confidence = Math.max(0, Math.min(1, 1 - avgUncertainty * 2));
    
    // Cleanup
    features.dispose();
    normalized.dispose();
    predictions.forEach(p => p.dispose());
    stacked.dispose();
    mean.dispose();
    std.dispose();
    
    return { predictions: outcomes, confidence, uncertainties };
  }
  
  /**
   * Find optimal spectrum for given objectives
   */
  async optimizeSpectrum(
    objectives: {
      maximizeYield?: number;      // Weight 0-1
      maximizeQuality?: number;    // Weight 0-1
      minimizeEnergy?: number;     // Weight 0-1
      targetMorphology?: number;   // Weight 0-1
    },
    constraints: {
      minRed?: number;
      maxRed?: number;
      minBlue?: number;
      maxBlue?: number;
      totalPower?: number;        // Max watts
      stage?: string;
    } = {}
  ): Promise<{
    optimal: Partial<SpectrumFeatures>;
    expectedOutcomes: SpectrumOutcomes;
    confidence: number;
  }> {
    if (!this.model) {
      throw new Error('Model not trained yet');
    }
    
    // Genetic algorithm for optimization
    const populationSize = 100;
    const generations = 50;
    const mutationRate = 0.1;
    
    // Initialize population
    let population = this.initializePopulation(populationSize, constraints);
    
    for (let gen = 0; gen < generations; gen++) {
      // Evaluate fitness for each individual
      const fitness = await Promise.all(
        population.map(async (individual) => {
          const { predictions } = await this.predict(individual);
          return this.calculateFitness(predictions, objectives);
        })
      );
      
      // Select best individuals
      const selected = this.selection(population, fitness);
      
      // Crossover and mutation
      population = this.crossoverAndMutate(selected, mutationRate, constraints);
    }
    
    // Get best solution
    const finalFitness = await Promise.all(
      population.map(async (individual) => {
        const { predictions, confidence } = await this.predict(individual);
        return { individual, predictions, confidence, fitness: this.calculateFitness(predictions, objectives) };
      })
    );
    
    const best = finalFitness.reduce((a, b) => a.fitness > b.fitness ? a : b);
    
    return {
      optimal: best.individual,
      expectedOutcomes: best.predictions,
      confidence: best.confidence
    };
  }
  
  /**
   * Perform statistical analysis on historical data
   */
  async analyzeCorrelations(growCycles: any[]): Promise<{
    correlations: Record<string, Record<string, number>>;
    pValues: Record<string, Record<string, number>>;
    confidenceIntervals: Record<string, { lower: number; upper: number }>;
  }> {
    // Extract features and outcomes
    const features = this.prepareFeatures(growCycles);
    const outcomes = this.prepareTargets(growCycles);
    
    const featureArray = await features.array();
    const outcomeArray = await outcomes.array();
    
    // Calculate Pearson correlations
    const correlations: Record<string, Record<string, number>> = {};
    const pValues: Record<string, Record<string, number>> = {};
    
    const featureLabels = [
      'red', 'blue', 'green', 'white', 'farRed', 'uv',
      'rbRatio', 'photoperiod', 'dli', 'ppfd',
      'temperature', 'humidity', 'co2', 'vpd', 'stage'
    ];
    
    const outcomeLabels = ['yield', 'quality', 'growthRate', 'efficiency', 'morphology'];
    
    for (let i = 0; i < featureLabels.length; i++) {
      correlations[featureLabels[i]] = {};
      pValues[featureLabels[i]] = {};
      
      for (let j = 0; j < outcomeLabels.length; j++) {
        const x = featureArray.map(row => row[i]);
        const y = outcomeArray.map(row => row[j]);
        
        const { correlation, pValue } = this.pearsonCorrelation(x, y);
        correlations[featureLabels[i]][outcomeLabels[j]] = correlation;
        pValues[featureLabels[i]][outcomeLabels[j]] = pValue;
      }
    }
    
    // Calculate confidence intervals using bootstrap
    const confidenceIntervals = await this.bootstrapConfidenceIntervals(
      growCycles,
      outcomeLabels
    );
    
    // Cleanup
    features.dispose();
    outcomes.dispose();
    
    return { correlations, pValues, confidenceIntervals };
  }
  
  /**
   * Validate model predictions against actual outcomes
   */
  async validatePredictions(
    testCycles: any[]
  ): Promise<{
    accuracy: number;
    mse: number;
    mae: number;
    r2: number;
    perMetric: Record<string, ModelMetrics>;
  }> {
    if (!this.model) {
      throw new Error('Model not trained yet');
    }
    
    const features = this.prepareFeatures(testCycles);
    const actualOutcomes = this.prepareTargets(testCycles);
    
    // Normalize features
    const normalized = features.sub(this.scaler!.mean).div(this.scaler!.std);
    
    // Make predictions
    const predictions = this.model.predict(normalized) as tf.Tensor;
    
    // Calculate overall metrics
    const overallMetrics = await this.calculateMetrics(actualOutcomes, predictions);
    
    // Calculate per-metric performance
    const actualArray = await actualOutcomes.array();
    const predArray = await predictions.array();
    
    const outcomeLabels = ['yield', 'quality', 'growthRate', 'efficiency', 'morphology'];
    const perMetric: Record<string, ModelMetrics> = {};
    
    for (let i = 0; i < outcomeLabels.length; i++) {
      const actual = actualArray.map(row => row[i]);
      const pred = predArray.map(row => row[i]);
      
      perMetric[outcomeLabels[i]] = {
        mse: this.meanSquaredError(actual, pred),
        mae: this.meanAbsoluteError(actual, pred),
        r2: this.rSquared(actual, pred),
        confidence: 1 - this.meanAbsoluteError(actual, pred)
      };
    }
    
    // Cleanup
    features.dispose();
    actualOutcomes.dispose();
    normalized.dispose();
    predictions.dispose();
    
    return {
      accuracy: overallMetrics.r2,
      mse: overallMetrics.mse,
      mae: overallMetrics.mae,
      r2: overallMetrics.r2,
      perMetric
    };
  }
  
  /**
   * Save model to browser storage
   */
  async saveModel(name: string): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save');
    }
    
    await this.model.save(`localstorage://${name}`);
    
    // Save scaler parameters
    if (this.scaler) {
      const scalerData = {
        mean: await this.scaler.mean.array(),
        std: await this.scaler.std.array()
      };
      localStorage.setItem(`${name}_scaler`, JSON.stringify(scalerData));
    }
  }
  
  /**
   * Load model from browser storage
   */
  async loadModel(name: string): Promise<void> {
    this.model = await tf.loadLayersModel(`localstorage://${name}`);
    
    // Load scaler parameters
    const scalerData = localStorage.getItem(`${name}_scaler`);
    if (scalerData) {
      const { mean, std } = JSON.parse(scalerData);
      this.scaler = {
        mean: tf.tensor(mean),
        std: tf.tensor(std)
      };
    }
  }
  
  // Helper methods
  
  private normalizeData(data: tf.Tensor2D): {
    normalized: tf.Tensor2D;
    mean: tf.Tensor;
    std: tf.Tensor;
  } {
    const mean = data.mean(0);
    const std = data.sub(mean).square().mean(0).sqrt();
    const normalized = data.sub(mean).div(std.add(1e-7)); // Add small epsilon
    
    return { normalized, mean, std };
  }
  
  private encodeGrowthStage(stage: string): number {
    const stages: Record<string, number> = {
      'seedling': 0.0,
      'vegetative': 0.33,
      'flowering': 0.66,
      'fruiting': 1.0
    };
    return stages[stage] || 0.5;
  }
  
  private calculateMorphologyScore(morphology: any): number {
    // Composite score based on ideal morphology
    const idealHeight = 20; // cm
    const idealLeafArea = 500; // cm²
    const idealInternodeSpacing = 2; // cm
    
    const heightScore = 1 - Math.abs(morphology.height - idealHeight) / idealHeight;
    const leafScore = 1 - Math.abs(morphology.leafArea - idealLeafArea) / idealLeafArea;
    const internodeScore = 1 - Math.abs(morphology.internodeSpacing - idealInternodeSpacing) / idealInternodeSpacing;
    
    return (heightScore + leafScore + internodeScore) / 3 * 10;
  }
  
  private async calculateMetrics(
    actual: tf.Tensor,
    predicted: tf.Tensor
  ): Promise<ModelMetrics> {
    const mse = tf.losses.meanSquaredError(actual, predicted);
    const mae = tf.losses.absoluteDifference(actual, predicted);
    
    const actualMean = actual.mean();
    const totalSS = actual.sub(actualMean).square().sum();
    const residualSS = actual.sub(predicted).square().sum();
    const r2 = tf.sub(1, residualSS.div(totalSS));
    
    const [mseVal, maeVal, r2Val] = await Promise.all([
      mse.data(),
      mae.mean().data(),
      r2.data()
    ]);
    
    return {
      mse: mseVal[0],
      mae: maeVal[0],
      r2: r2Val[0],
      confidence: Math.max(0, Math.min(1, r2Val[0]))
    };
  }
  
  private pearsonCorrelation(x: number[], y: number[]): {
    correlation: number;
    pValue: number;
  } {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    // Calculate p-value using t-distribution approximation
    const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
    const pValue = 2 * (1 - this.tCDF(Math.abs(t), n - 2));
    
    return { correlation, pValue };
  }
  
  private tCDF(t: number, df: number): number {
    // Approximation of t-distribution CDF
    const x = df / (df + t * t);
    return 0.5 + 0.5 * Math.sign(t) * (1 - this.betaIncomplete(x, df / 2, 0.5));
  }
  
  private betaIncomplete(x: number, a: number, b: number): number {
    // Simple approximation
    return Math.pow(x, a) * Math.pow(1 - x, b);
  }
  
  private meanSquaredError(actual: number[], predicted: number[]): number {
    return actual.reduce((sum, a, i) => sum + Math.pow(a - predicted[i], 2), 0) / actual.length;
  }
  
  private meanAbsoluteError(actual: number[], predicted: number[]): number {
    return actual.reduce((sum, a, i) => sum + Math.abs(a - predicted[i]), 0) / actual.length;
  }
  
  private rSquared(actual: number[], predicted: number[]): number {
    const mean = actual.reduce((a, b) => a + b) / actual.length;
    const totalSS = actual.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0);
    const residualSS = actual.reduce((sum, a, i) => sum + Math.pow(a - predicted[i], 2), 0);
    return 1 - (residualSS / totalSS);
  }
  
  private async bootstrapConfidenceIntervals(
    data: any[],
    metrics: string[],
    numBootstraps: number = 1000,
    confidenceLevel: number = 0.95
  ): Promise<Record<string, { lower: number; upper: number }>> {
    const results: Record<string, number[]> = {};
    
    for (let i = 0; i < numBootstraps; i++) {
      // Resample with replacement
      const sample = Array.from({ length: data.length }, () => 
        data[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * data.length)]
      );
      
      // Calculate metrics for this sample
      const outcomes = this.prepareTargets(sample);
      const outcomeArray = await outcomes.array();
      
      metrics.forEach((metric, idx) => {
        if (!results[metric]) results[metric] = [];
        const values = outcomeArray.map(row => row[idx]);
        results[metric].push(values.reduce((a, b) => a + b) / values.length);
      });
      
      outcomes.dispose();
    }
    
    // Calculate confidence intervals
    const alpha = (1 - confidenceLevel) / 2;
    const intervals: Record<string, { lower: number; upper: number }> = {};
    
    for (const [metric, values] of Object.entries(results)) {
      values.sort((a, b) => a - b);
      const lowerIdx = Math.floor(alpha * values.length);
      const upperIdx = Math.floor((1 - alpha) * values.length);
      
      intervals[metric] = {
        lower: values[lowerIdx],
        upper: values[upperIdx]
      };
    }
    
    return intervals;
  }
  
  private calculateFitness(
    outcomes: SpectrumOutcomes,
    objectives: any
  ): number {
    let fitness = 0;
    
    if (objectives.maximizeYield) {
      fitness += objectives.maximizeYield * outcomes.yield / 10;
    }
    if (objectives.maximizeQuality) {
      fitness += objectives.maximizeQuality * outcomes.quality / 10;
    }
    if (objectives.minimizeEnergy) {
      fitness += objectives.minimizeEnergy * (10 - outcomes.energyEfficiency) / 10;
    }
    if (objectives.targetMorphology) {
      fitness += objectives.targetMorphology * outcomes.morphologyScore / 10;
    }
    
    return fitness;
  }
  
  private initializePopulation(
    size: number,
    constraints: any
  ): Partial<SpectrumFeatures>[] {
    return Array.from({ length: size }, () => ({
      red: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * (constraints.maxRed || 100 - (constraints.minRed || 0)) + (constraints.minRed || 0),
      blue: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * (constraints.maxBlue || 100 - (constraints.minBlue || 0)) + (constraints.minBlue || 0),
      green: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      white: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      farRed: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5,
      uv: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3
    }));
  }
  
  private selection(
    population: Partial<SpectrumFeatures>[],
    fitness: number[]
  ): Partial<SpectrumFeatures>[] {
    // Tournament selection
    const selected: Partial<SpectrumFeatures>[] = [];
    const tournamentSize = 3;
    
    for (let i = 0; i < population.length; i++) {
      const tournament = Array.from({ length: tournamentSize }, () => 
        Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * population.length)
      );
      
      const winner = tournament.reduce((best, idx) => 
        fitness[idx] > fitness[best] ? idx : best
      );
      
      selected.push({ ...population[winner] });
    }
    
    return selected;
  }
  
  private crossoverAndMutate(
    population: Partial<SpectrumFeatures>[],
    mutationRate: number,
    constraints: any
  ): Partial<SpectrumFeatures>[] {
    const newPopulation: Partial<SpectrumFeatures>[] = [];
    
    for (let i = 0; i < population.length; i += 2) {
      const parent1 = population[i];
      const parent2 = population[i + 1] || population[0];
      
      // Crossover
      const crossoverPoint = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
      const child1: Partial<SpectrumFeatures> = {
        red: crossoverPoint > 0.5 ? parent1.red : parent2.red,
        blue: crossoverPoint > 0.5 ? parent1.blue : parent2.blue,
        green: crossoverPoint > 0.5 ? parent1.green : parent2.green,
        white: crossoverPoint > 0.5 ? parent1.white : parent2.white,
        farRed: crossoverPoint > 0.5 ? parent1.farRed : parent2.farRed,
        uv: crossoverPoint > 0.5 ? parent1.uv : parent2.uv
      };
      
      // Mutation
      if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < mutationRate) {
        const mutationGene = ['red', 'blue', 'green', 'white', 'farRed', 'uv'][
          Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 6)
        ] as keyof SpectrumFeatures;
        
        (child1 as any)[mutationGene] = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100;
      }
      
      // Apply constraints
      if (constraints.minRed && child1.red! < constraints.minRed) child1.red = constraints.minRed;
      if (constraints.maxRed && child1.red! > constraints.maxRed) child1.red = constraints.maxRed;
      if (constraints.minBlue && child1.blue! < constraints.minBlue) child1.blue = constraints.minBlue;
      if (constraints.maxBlue && child1.blue! > constraints.maxBlue) child1.blue = constraints.maxBlue;
      
      newPopulation.push(child1);
    }
    
    return newPopulation;
  }
  
  /**
   * Calculate average metrics across folds
   */
  private calculateAverageMetrics(foldMetrics: ModelMetrics[]): ModelMetrics {
    const avgMse = foldMetrics.reduce((sum, m) => sum + m.mse, 0) / foldMetrics.length;
    const avgMae = foldMetrics.reduce((sum, m) => sum + m.mae, 0) / foldMetrics.length;
    const avgR2 = foldMetrics.reduce((sum, m) => sum + m.r2, 0) / foldMetrics.length;
    const avgConfidence = foldMetrics.reduce((sum, m) => sum + m.confidence, 0) / foldMetrics.length;
    
    return {
      mse: avgMse,
      mae: avgMae,
      r2: avgR2,
      confidence: avgConfidence
    };
  }
  
  /**
   * Calculate 95% confidence intervals for metrics
   */
  private calculateConfidenceIntervals(foldMetrics: ModelMetrics[]): {
    mse: { lower: number; upper: number };
    mae: { lower: number; upper: number };
    r2: { lower: number; upper: number };
  } {
    const calculateCI = (values: number[]) => {
      const n = values.length;
      const mean = values.reduce((a, b) => a + b) / n;
      const std = Math.sqrt(values.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1));
      const tValue = 2.776; // t-statistic for 95% CI with 4 degrees of freedom (5-fold CV)
      const margin = tValue * std / Math.sqrt(n);
      
      return {
        lower: mean - margin,
        upper: mean + margin
      };
    };
    
    return {
      mse: calculateCI(foldMetrics.map(m => m.mse)),
      mae: calculateCI(foldMetrics.map(m => m.mae)),
      r2: calculateCI(foldMetrics.map(m => m.r2))
    };
  }
  
  /**
   * Perform statistical significance testing between spectra
   */
  async performSignificanceTest(
    spectrumA: Partial<SpectrumFeatures>,
    spectrumB: Partial<SpectrumFeatures>,
    numSimulations: number = 1000
  ): Promise<{
    pValue: number;
    significant: boolean;
    effectSize: number;
    confidenceInterval: { lower: number; upper: number };
  }> {
    if (!this.model) {
      throw new Error('Model not trained yet');
    }
    
    // Generate predictions for both spectra
    const predictionsA: number[] = [];
    const predictionsB: number[] = [];
    
    for (let i = 0; i < numSimulations; i++) {
      // Add small random noise to simulate measurement uncertainty
      const noisySpectrumA = { ...spectrumA };
      const noisySpectrumB = { ...spectrumB };
      
      Object.keys(noisySpectrumA).forEach(key => {
        if (typeof noisySpectrumA[key as keyof SpectrumFeatures] === 'number') {
          noisySpectrumA[key as keyof SpectrumFeatures] += (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.02; // ±1% noise
        }
      });
      
      Object.keys(noisySpectrumB).forEach(key => {
        if (typeof noisySpectrumB[key as keyof SpectrumFeatures] === 'number') {
          noisySpectrumB[key as keyof SpectrumFeatures] += (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.02; // ±1% noise
        }
      });
      
      const predA = await this.predict(noisySpectrumA);
      const predB = await this.predict(noisySpectrumB);
      
      // Use composite yield score
      const scoreA = predA.predictions.yield * 0.4 + predA.predictions.quality * 0.3 + 
                   predA.predictions.energyEfficiency * 0.3;
      const scoreB = predB.predictions.yield * 0.4 + predB.predictions.quality * 0.3 + 
                   predB.predictions.energyEfficiency * 0.3;
      
      predictionsA.push(scoreA);
      predictionsB.push(scoreB);
    }
    
    // Perform two-sample t-test
    const meanA = predictionsA.reduce((a, b) => a + b) / predictionsA.length;
    const meanB = predictionsB.reduce((a, b) => a + b) / predictionsB.length;
    
    const varA = predictionsA.reduce((sum, x) => sum + Math.pow(x - meanA, 2), 0) / (predictionsA.length - 1);
    const varB = predictionsB.reduce((sum, x) => sum + Math.pow(x - meanB, 2), 0) / (predictionsB.length - 1);
    
    const pooledStd = Math.sqrt(((predictionsA.length - 1) * varA + (predictionsB.length - 1) * varB) / 
                               (predictionsA.length + predictionsB.length - 2));
    
    const tStat = (meanA - meanB) / (pooledStd * Math.sqrt(1/predictionsA.length + 1/predictionsB.length));
    const df = predictionsA.length + predictionsB.length - 2;
    
    // Calculate p-value (approximation)
    const pValue = 2 * (1 - this.tCDF(Math.abs(tStat), df));
    
    // Effect size (Cohen's d)
    const effectSize = (meanA - meanB) / pooledStd;
    
    // Confidence interval for difference
    const stdError = pooledStd * Math.sqrt(1/predictionsA.length + 1/predictionsB.length);
    const tCritical = 1.96; // 95% CI approximation
    const diff = meanA - meanB;
    
    return {
      pValue,
      significant: pValue < 0.05,
      effectSize,
      confidenceInterval: {
        lower: diff - tCritical * stdError,
        upper: diff + tCritical * stdError
      }
    };
  }
  
  /**
   * Generate synthetic training data for testing
   */
  generateSyntheticData(numSamples: number = 100): any[] {
    const cropTypes = ['lettuce', 'tomato', 'cannabis', 'basil', 'kale'];
    const stages = ['seedling', 'vegetative', 'flowering', 'fruiting'];
    
    return Array.from({ length: numSamples }, (_, i) => {
      const cropType = cropTypes[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * cropTypes.length)];
      const stage = stages[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * stages.length)];
      
      // Generate realistic spectrum based on crop type
      let baseSpectrum;
      switch (cropType) {
        case 'lettuce':
          baseSpectrum = { red: 60, blue: 30, green: 8, white: 2, farRed: 0, uv: 0 };
          break;
        case 'cannabis':
          baseSpectrum = { red: 65, blue: 25, green: 8, white: 2, farRed: 0, uv: 0 };
          break;
        default:
          baseSpectrum = { red: 65, blue: 25, green: 8, white: 2, farRed: 0, uv: 0 };
      }
      
      // Add realistic variation
      const spectrum = {
        red: Math.max(30, Math.min(80, baseSpectrum.red + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20)),
        blue: Math.max(15, Math.min(45, baseSpectrum.blue + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 15)),
        green: Math.max(2, Math.min(15, baseSpectrum.green + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 6)),
        white: Math.max(0, Math.min(10, baseSpectrum.white + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 4)),
        farRed: Math.max(0, Math.min(5, baseSpectrum.farRed + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2)),
        uv: Math.max(0, Math.min(3, baseSpectrum.uv + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1))
      };
      
      // Calculate realistic outcomes based on spectrum and crop
      const redBlueRatio = spectrum.red / spectrum.blue;
      const totalLight = spectrum.red + spectrum.blue + spectrum.green + spectrum.white;
      
      // Yield calculation with realistic relationships
      let baseYield = 2.5; // kg/m²
      if (cropType === 'tomato') baseYield = 15;
      if (cropType === 'cannabis') baseYield = 0.8;
      
      const yieldMultiplier = 0.8 + 0.4 * Math.min(totalLight / 100, 1) + 
                             0.2 * Math.sin(redBlueRatio * 0.5) +
                             (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.3; // Random variation
      
      const yield_ = Math.max(0.1, baseYield * yieldMultiplier);
      
      // Quality score (1-10)
      const quality = Math.max(1, Math.min(10, 
        5 + 2 * (spectrum.blue / 50) + 1.5 * (spectrum.red / 70) - 0.5 * (spectrum.green / 20) +
        (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2
      ));
      
      // Growth rate
      const growthRate = Math.max(1, 
        20 + 30 * Math.min(totalLight / 100, 1) + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10
      );
      
      return {
        id: `synthetic_${i}`,
        cropType,
        stage,
        startDate: new Date(Date.now() - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 365 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        spectrum,
        environmentalData: {
          avgTemp: 22 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 6,
          avgHumidity: 65 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20,
          avgCO2: 800 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 400,
          avgVPD: 1.0 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.8
        },
        lightingData: {
          avgPPFD: 200 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 600,
          avgDLI: 15 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 25,
          photoperiod: 12 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 6,
          energyUsed: 100 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200
        },
        yieldData: {
          totalYield: yield_,
          quality,
          growthRate,
          morphology: {
            height: 15 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
            leafArea: 200 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300,
            stemLength: 10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
            internodeSpacing: 1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3
          }
        },
        costData: {
          energyCost: 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
          yieldValue: yield_ * (10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5),
          profitMargin: 0.1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4
        }
      };
    });
  }
  
  /**
   * Dispose of all TensorFlow resources
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
    }
    if (this.scaler) {
      this.scaler.mean.dispose();
      this.scaler.std.dispose();
    }
  }
}