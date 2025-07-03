import * as tf from '@tensorflow/tfjs';
import { Matrix } from 'ml-matrix';
import { RandomForestRegression } from 'ml-random-forest';
import { 
  SpectralData, 
  PlantResponse, 
  SpectralCorrelation,
  RegressionType,
  EnvironmentType 
} from '@prisma/client';

// Types for spectral analysis
export interface SpectralFeatures {
  // Individual bands
  uv365_400: number;
  violet400_430: number;
  blue430_480: number;
  cyan480_520: number;
  green520_565: number;
  yellow565_590: number;
  orange590_625: number;
  red625_660: number;
  deepRed660_700: number;
  farRed700_800: number;
  
  // Ratios and percentages
  rbrRatio: number;
  rfrRatio: number;
  bluePercent: number;
  greenPercent: number;
  redPercent: number;
  
  // Environmental context
  temperature: number;
  humidity: number;
  co2: number;
  vpd: number;
  environmentType: EnvironmentType;
  naturalLightContribution: number;
}

export interface RegressionResult {
  modelType: RegressionType;
  targetMetric: string;
  coefficients: number[];
  intercept: number;
  r2Score: number;
  rmse: number;
  mape: number;
  pValues: number[];
  featureImportance: Record<string, number>;
  predictions?: number[];
  residuals?: number[];
  confidenceIntervals?: Array<{ lower: number; upper: number }>;
}

export interface CorrelationResult {
  spectralBand: string;
  correlation: number;
  pValue: number;
  confidenceInterval: { lower: number; upper: number };
  sampleSize: number;
}

export interface SpectralOptimizationResult {
  optimalSpectrum: Partial<SpectralFeatures>;
  predictedOutcome: number;
  confidenceScore: number;
  improvementPercent: number;
  energySavings: number;
}

export class SpectralRegressionEngine {
  private featureNames: string[] = [
    'uv365_400', 'violet400_430', 'blue430_480', 'cyan480_520',
    'green520_565', 'yellow565_590', 'orange590_625', 'red625_660',
    'deepRed660_700', 'farRed700_800', 'rbrRatio', 'rfrRatio',
    'bluePercent', 'greenPercent', 'redPercent', 'temperature',
    'humidity', 'co2', 'vpd', 'naturalLightContribution'
  ];

  constructor() {}

  // Extract features from spectral data
  private extractFeatures(spectralData: SpectralData): number[] {
    return [
      spectralData.uv365_400 || 0,
      spectralData.violet400_430 || 0,
      spectralData.blue430_480 || 0,
      spectralData.cyan480_520 || 0,
      spectralData.green520_565 || 0,
      spectralData.yellow565_590 || 0,
      spectralData.orange590_625 || 0,
      spectralData.red625_660 || 0,
      spectralData.deepRed660_700 || 0,
      spectralData.farRed700_800 || 0,
      spectralData.rbrRatio || 0,
      spectralData.rfrRatio || 0,
      spectralData.bluePercent || 0,
      spectralData.greenPercent || 0,
      spectralData.redPercent || 0,
      // Environmental factors - these would come from associated sensor readings
      25, // temperature placeholder
      65, // humidity placeholder
      800, // CO2 placeholder
      1.2, // VPD placeholder
      spectralData.naturalLightContribution
    ];
  }

  // Calculate correlation between spectral bands and plant responses
  async calculateCorrelations(
    spectralData: SpectralData[],
    plantResponses: PlantResponse[],
    targetMetric: keyof PlantResponse
  ): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];
    const spectralBands = [
      'uv365_400', 'violet400_430', 'blue430_480', 'cyan480_520',
      'green520_565', 'yellow565_590', 'orange590_625', 'red625_660',
      'deepRed660_700', 'farRed700_800'
    ];

    for (const band of spectralBands) {
      const x: number[] = [];
      const y: number[] = [];

      // Match spectral data with plant responses
      for (let i = 0; i < spectralData.length; i++) {
        const spectral = spectralData[i];
        const response = plantResponses.find(r => 
          Math.abs(new Date(r.timestamp).getTime() - new Date(spectral.timestamp).getTime()) < 86400000 // Within 24 hours
        );

        if (response && response[targetMetric] !== null) {
          x.push(spectral[band as keyof SpectralData] as number || 0);
          y.push(response[targetMetric] as number);
        }
      }

      if (x.length > 10) { // Need sufficient data
        const correlation = this.pearsonCorrelation(x, y);
        const pValue = this.correlationPValue(correlation, x.length);
        const ci = this.correlationConfidenceInterval(correlation, x.length);

        results.push({
          spectralBand: band,
          correlation,
          pValue,
          confidenceInterval: ci,
          sampleSize: x.length
        });
      }
    }

    return results;
  }

  // Multiple regression analysis
  async runMultipleRegression(
    spectralData: SpectralData[],
    plantResponses: PlantResponse[],
    targetMetric: keyof PlantResponse,
    modelType: RegressionType = RegressionType.LINEAR
  ): Promise<RegressionResult> {
    // Prepare data
    const X: number[][] = [];
    const y: number[] = [];

    for (let i = 0; i < spectralData.length; i++) {
      const response = plantResponses.find(r => 
        Math.abs(new Date(r.timestamp).getTime() - new Date(spectralData[i].timestamp).getTime()) < 86400000
      );

      if (response && response[targetMetric] !== null) {
        X.push(this.extractFeatures(spectralData[i]));
        y.push(response[targetMetric] as number);
      }
    }

    if (X.length < 30) {
      throw new Error('Insufficient data for regression analysis');
    }

    // Split data
    const splitIdx = Math.floor(X.length * 0.8);
    const XTrain = X.slice(0, splitIdx);
    const yTrain = y.slice(0, splitIdx);
    const XTest = X.slice(splitIdx);
    const yTest = y.slice(splitIdx);

    let result: RegressionResult;

    switch (modelType) {
      case RegressionType.LINEAR:
        result = await this.linearRegression(XTrain, yTrain, XTest, yTest);
        break;
      case RegressionType.RIDGE:
        result = await this.ridgeRegression(XTrain, yTrain, XTest, yTest, 0.1);
        break;
      case RegressionType.LASSO:
        result = await this.lassoRegression(XTrain, yTrain, XTest, yTest, 0.1);
        break;
      case RegressionType.RANDOM_FOREST:
        result = await this.randomForestRegression(XTrain, yTrain, XTest, yTest);
        break;
      case RegressionType.NEURAL_NETWORK:
        result = await this.neuralNetworkRegression(XTrain, yTrain, XTest, yTest);
        break;
      default:
        result = await this.linearRegression(XTrain, yTrain, XTest, yTest);
    }

    result.targetMetric = targetMetric;
    return result;
  }

  // Linear regression implementation
  private async linearRegression(
    XTrain: number[][],
    yTrain: number[],
    XTest: number[][],
    yTest: number[]
  ): Promise<RegressionResult> {
    // Add intercept term
    const XTrainWithIntercept = XTrain.map(row => [1, ...row]);
    const XTestWithIntercept = XTest.map(row => [1, ...row]);

    // Convert to matrices
    const X = new Matrix(XTrainWithIntercept);
    const y = Matrix.columnVector(yTrain);

    // Calculate coefficients: β = (X'X)^(-1)X'y
    const XtX = X.transpose().mmul(X);
    const Xty = X.transpose().mmul(y);
    const beta = XtX.inverse().mmul(Xty);
    const coefficients = beta.to1DArray();

    // Make predictions
    const XTestMatrix = new Matrix(XTestWithIntercept);
    const predictions = XTestMatrix.mmul(beta).to1DArray();

    // Calculate metrics
    const rmse = this.calculateRMSE(yTest, predictions);
    const r2 = this.calculateR2(yTest, predictions);
    const mape = this.calculateMAPE(yTest, predictions);

    // Calculate p-values
    const residuals = yTrain.map((actual, i) => {
      const predicted = XTrainWithIntercept[i].reduce((sum, x, j) => sum + x * coefficients[j], 0);
      return actual - predicted;
    });
    const mse = residuals.reduce((sum, r) => sum + r * r, 0) / (yTrain.length - coefficients.length);
    const pValues = this.calculatePValues(XTrainWithIntercept, coefficients, mse);

    // Feature importance (absolute coefficients normalized)
    const featureImportance: Record<string, number> = {};
    const absCoeffs = coefficients.slice(1).map(Math.abs);
    const maxCoeff = Math.max(...absCoeffs);
    
    this.featureNames.forEach((name, i) => {
      featureImportance[name] = absCoeffs[i] / maxCoeff;
    });

    return {
      modelType: RegressionType.LINEAR,
      targetMetric: '',
      coefficients: coefficients.slice(1),
      intercept: coefficients[0],
      r2Score: r2,
      rmse,
      mape,
      pValues,
      featureImportance,
      predictions,
      residuals: yTest.map((actual, i) => actual - predictions[i])
    };
  }

  // Ridge regression with L2 regularization
  private async ridgeRegression(
    XTrain: number[][],
    yTrain: number[],
    XTest: number[][],
    yTest: number[],
    alpha: number = 0.1
  ): Promise<RegressionResult> {
    // Standardize features
    const { normalizedX: XTrainNorm, mean, std } = this.standardizeFeatures(XTrain);
    const XTestNorm = this.applyStandardization(XTest, mean, std);

    // Add intercept
    const XTrainWithIntercept = XTrainNorm.map(row => [1, ...row]);
    const XTestWithIntercept = XTestNorm.map(row => [1, ...row]);

    // Convert to matrices
    const X = new Matrix(XTrainWithIntercept);
    const y = Matrix.columnVector(yTrain);
    const n = X.columns;

    // Create identity matrix for regularization (exclude intercept)
    const I = Matrix.identity(n, n);
    I.set(0, 0, 0); // Don't regularize intercept

    // Ridge coefficients: β = (X'X + αI)^(-1)X'y
    const XtX = X.transpose().mmul(X);
    const XtXPlusAlphaI = XtX.add(I.mul(alpha));
    const Xty = X.transpose().mmul(y);
    const beta = XtXPlusAlphaI.inverse().mmul(Xty);
    const coefficients = beta.to1DArray();

    // Make predictions
    const XTestMatrix = new Matrix(XTestWithIntercept);
    const predictions = XTestMatrix.mmul(beta).to1DArray();

    // Calculate metrics
    const rmse = this.calculateRMSE(yTest, predictions);
    const r2 = this.calculateR2(yTest, predictions);
    const mape = this.calculateMAPE(yTest, predictions);

    // Feature importance
    const featureImportance: Record<string, number> = {};
    const absCoeffs = coefficients.slice(1).map(Math.abs);
    const maxCoeff = Math.max(...absCoeffs);
    
    this.featureNames.forEach((name, i) => {
      featureImportance[name] = absCoeffs[i] / maxCoeff;
    });

    return {
      modelType: RegressionType.RIDGE,
      targetMetric: '',
      coefficients: coefficients.slice(1),
      intercept: coefficients[0],
      r2Score: r2,
      rmse,
      mape,
      pValues: [], // P-values less meaningful for regularized regression
      featureImportance,
      predictions,
      residuals: yTest.map((actual, i) => actual - predictions[i])
    };
  }

  // Lasso regression with L1 regularization (using coordinate descent)
  private async lassoRegression(
    XTrain: number[][],
    yTrain: number[],
    XTest: number[][],
    yTest: number[],
    alpha: number = 0.1
  ): Promise<RegressionResult> {
    // Use TensorFlow for Lasso implementation
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 1,
          inputShape: [XTrain[0].length],
          kernelRegularizer: tf.regularizers.l1({ l1: alpha })
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'meanSquaredError'
    });

    // Convert to tensors
    const XTrainTensor = tf.tensor2d(XTrain);
    const yTrainTensor = tf.tensor2d(yTrain, [yTrain.length, 1]);
    const XTestTensor = tf.tensor2d(XTest);

    // Train model
    await model.fit(XTrainTensor, yTrainTensor, {
      epochs: 100,
      validationSplit: 0.2,
      verbose: 0
    });

    // Make predictions
    const predictionsTensor = model.predict(XTestTensor) as tf.Tensor;
    const predictions = await predictionsTensor.array() as number[][];
    const flatPredictions = predictions.map(p => p[0]);

    // Get weights
    const weights = model.getWeights();
    const kernelWeights = await weights[0].array() as number[][];
    const bias = await weights[1].array() as number[];
    const coefficients = kernelWeights.map(w => w[0]);

    // Calculate metrics
    const rmse = this.calculateRMSE(yTest, flatPredictions);
    const r2 = this.calculateR2(yTest, flatPredictions);
    const mape = this.calculateMAPE(yTest, flatPredictions);

    // Feature importance (non-zero coefficients)
    const featureImportance: Record<string, number> = {};
    const absCoeffs = coefficients.map(Math.abs);
    const maxCoeff = Math.max(...absCoeffs);
    
    this.featureNames.forEach((name, i) => {
      featureImportance[name] = absCoeffs[i] / maxCoeff;
    });

    // Cleanup
    XTrainTensor.dispose();
    yTrainTensor.dispose();
    XTestTensor.dispose();
    predictionsTensor.dispose();

    return {
      modelType: RegressionType.LASSO,
      targetMetric: '',
      coefficients,
      intercept: bias[0],
      r2Score: r2,
      rmse,
      mape,
      pValues: [],
      featureImportance,
      predictions: flatPredictions,
      residuals: yTest.map((actual, i) => actual - flatPredictions[i])
    };
  }

  // Random Forest regression
  private async randomForestRegression(
    XTrain: number[][],
    yTrain: number[],
    XTest: number[][],
    yTest: number[]
  ): Promise<RegressionResult> {
    const options = {
      nEstimators: 100,
      maxDepth: 10,
      minSamplesSplit: 5,
      minSamplesLeaf: 2
    };

    const rf = new RandomForestRegression(options);
    rf.train(XTrain, yTrain);

    const predictions = rf.predict(XTest);

    // Calculate metrics
    const rmse = this.calculateRMSE(yTest, predictions);
    const r2 = this.calculateR2(yTest, predictions);
    const mape = this.calculateMAPE(yTest, predictions);

    // Feature importance from Random Forest
    const importances = rf.featureImportances || new Array(this.featureNames.length).fill(1 / this.featureNames.length);
    const featureImportance: Record<string, number> = {};
    
    this.featureNames.forEach((name, i) => {
      featureImportance[name] = importances[i];
    });

    return {
      modelType: RegressionType.RANDOM_FOREST,
      targetMetric: '',
      coefficients: [],
      intercept: 0,
      r2Score: r2,
      rmse,
      mape,
      pValues: [],
      featureImportance,
      predictions,
      residuals: yTest.map((actual, i) => actual - predictions[i])
    };
  }

  // Neural Network regression
  private async neuralNetworkRegression(
    XTrain: number[][],
    yTrain: number[],
    XTest: number[][],
    yTest: number[]
  ): Promise<RegressionResult> {
    // Normalize data
    const { normalizedX: XTrainNorm, mean, std } = this.standardizeFeatures(XTrain);
    const XTestNorm = this.applyStandardization(XTest, mean, std);

    // Build model
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          inputShape: [XTrain[0].length]
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    // Convert to tensors
    const XTrainTensor = tf.tensor2d(XTrainNorm);
    const yTrainTensor = tf.tensor2d(yTrain, [yTrain.length, 1]);
    const XTestTensor = tf.tensor2d(XTestNorm);

    // Train model
    await model.fit(XTrainTensor, yTrainTensor, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      verbose: 0,
      callbacks: tf.callbacks.earlyStopping({
        monitor: 'val_loss',
        patience: 10
      })
    });

    // Make predictions
    const predictionsTensor = model.predict(XTestTensor) as tf.Tensor;
    const predictions = await predictionsTensor.array() as number[][];
    const flatPredictions = predictions.map(p => p[0]);

    // Calculate metrics
    const rmse = this.calculateRMSE(yTest, flatPredictions);
    const r2 = this.calculateR2(yTest, flatPredictions);
    const mape = this.calculateMAPE(yTest, flatPredictions);

    // Feature importance using permutation importance
    const featureImportance = await this.calculatePermutationImportance(
      model, XTestNorm, yTest, this.featureNames
    );

    // Cleanup
    XTrainTensor.dispose();
    yTrainTensor.dispose();
    XTestTensor.dispose();
    predictionsTensor.dispose();

    return {
      modelType: RegressionType.NEURAL_NETWORK,
      targetMetric: '',
      coefficients: [],
      intercept: 0,
      r2Score: r2,
      rmse,
      mape,
      pValues: [],
      featureImportance,
      predictions: flatPredictions,
      residuals: yTest.map((actual, i) => actual - flatPredictions[i])
    };
  }

  // Optimize spectrum for target outcome
  async optimizeSpectrum(
    currentSpectrum: Partial<SpectralFeatures>,
    targetMetric: string,
    targetValue: number,
    constraints: {
      maxPower?: number;
      minDLI?: number;
      maxDLI?: number;
      environmentType: EnvironmentType;
    },
    model: tf.LayersModel | any
  ): Promise<SpectralOptimizationResult> {
    // Genetic algorithm for spectrum optimization
    const populationSize = 100;
    const generations = 50;
    const mutationRate = 0.1;
    const crossoverRate = 0.7;

    // Initialize population
    let population = this.initializePopulation(populationSize, constraints);

    for (let gen = 0; gen < generations; gen++) {
      // Evaluate fitness
      const fitness = await this.evaluateFitness(population, targetMetric, targetValue, model);
      
      // Selection
      const selected = this.tournamentSelection(population, fitness);
      
      // Crossover and mutation
      population = this.evolvePopulation(selected, crossoverRate, mutationRate, constraints);
    }

    // Get best solution
    const finalFitness = await this.evaluateFitness(population, targetMetric, targetValue, model);
    const bestIdx = finalFitness.indexOf(Math.max(...finalFitness));
    const bestSpectrum = population[bestIdx];

    // Calculate improvements
    const currentPrediction = await this.predictOutcome(currentSpectrum, model);
    const optimizedPrediction = await this.predictOutcome(bestSpectrum, model);
    const improvement = ((optimizedPrediction - currentPrediction) / currentPrediction) * 100;

    // Estimate energy savings
    const currentPower = this.calculatePower(currentSpectrum);
    const optimizedPower = this.calculatePower(bestSpectrum);
    const energySavings = ((currentPower - optimizedPower) / currentPower) * 100;

    return {
      optimalSpectrum: bestSpectrum,
      predictedOutcome: optimizedPrediction,
      confidenceScore: 0.85, // Would be calculated based on model uncertainty
      improvementPercent: improvement,
      energySavings: Math.max(0, energySavings)
    };
  }

  // Helper methods
  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private correlationPValue(r: number, n: number): number {
    const t = r * Math.sqrt((n - 2) / (1 - r * r));
    const df = n - 2;
    // Simplified p-value calculation
    return 2 * (1 - this.tCDF(Math.abs(t), df));
  }

  private correlationConfidenceInterval(r: number, n: number, alpha: number = 0.05): { lower: number; upper: number } {
    const z = 0.5 * Math.log((1 + r) / (1 - r));
    const se = 1 / Math.sqrt(n - 3);
    const critical = 1.96; // For 95% CI
    
    const zLower = z - critical * se;
    const zUpper = z + critical * se;
    
    return {
      lower: (Math.exp(2 * zLower) - 1) / (Math.exp(2 * zLower) + 1),
      upper: (Math.exp(2 * zUpper) - 1) / (Math.exp(2 * zUpper) + 1)
    };
  }

  private calculateRMSE(actual: number[], predicted: number[]): number {
    const mse = actual.reduce((sum, a, i) => sum + Math.pow(a - predicted[i], 2), 0) / actual.length;
    return Math.sqrt(mse);
  }

  private calculateR2(actual: number[], predicted: number[]): number {
    const meanActual = actual.reduce((sum, a) => sum + a, 0) / actual.length;
    const ssTotal = actual.reduce((sum, a) => sum + Math.pow(a - meanActual, 2), 0);
    const ssResidual = actual.reduce((sum, a, i) => sum + Math.pow(a - predicted[i], 2), 0);
    return 1 - (ssResidual / ssTotal);
  }

  private calculateMAPE(actual: number[], predicted: number[]): number {
    return actual.reduce((sum, a, i) => {
      if (a !== 0) {
        return sum + Math.abs((a - predicted[i]) / a);
      }
      return sum;
    }, 0) / actual.length * 100;
  }

  private calculatePValues(X: number[][], coefficients: number[], mse: number): number[] {
    const n = X.length;
    const p = coefficients.length;
    const XMatrix = new Matrix(X);
    const XtX = XMatrix.transpose().mmul(XMatrix);
    const XtXInv = XtX.inverse();
    
    return coefficients.map((coef, i) => {
      const se = Math.sqrt(mse * XtXInv.get(i, i));
      const t = coef / se;
      const df = n - p;
      return 2 * (1 - this.tCDF(Math.abs(t), df));
    });
  }

  private tCDF(t: number, df: number): number {
    // Simplified t-distribution CDF approximation
    const x = df / (df + t * t);
    return 0.5 + 0.5 * (1 - Math.pow(x, 0.5)) * (t > 0 ? 1 : -1);
  }

  private standardizeFeatures(X: number[][]): { normalizedX: number[][], mean: number[], std: number[] } {
    const n = X.length;
    const p = X[0].length;
    const mean = new Array(p).fill(0);
    const std = new Array(p).fill(0);

    // Calculate mean
    for (let j = 0; j < p; j++) {
      mean[j] = X.reduce((sum, row) => sum + row[j], 0) / n;
    }

    // Calculate std
    for (let j = 0; j < p; j++) {
      std[j] = Math.sqrt(X.reduce((sum, row) => sum + Math.pow(row[j] - mean[j], 2), 0) / n);
      if (std[j] === 0) std[j] = 1; // Avoid division by zero
    }

    // Standardize
    const normalizedX = X.map(row => 
      row.map((val, j) => (val - mean[j]) / std[j])
    );

    return { normalizedX, mean, std };
  }

  private applyStandardization(X: number[][], mean: number[], std: number[]): number[][] {
    return X.map(row => 
      row.map((val, j) => (val - mean[j]) / std[j])
    );
  }

  private async calculatePermutationImportance(
    model: tf.LayersModel,
    X: number[][],
    y: number[],
    featureNames: string[]
  ): Promise<Record<string, number>> {
    const baseline = await this.modelScore(model, X, y);
    const importance: Record<string, number> = {};

    for (let i = 0; i < featureNames.length; i++) {
      const XPermuted = X.map(row => [...row]);
      
      // Shuffle feature i
      const featureValues = XPermuted.map(row => row[i]);
      for (let j = featureValues.length - 1; j > 0; j--) {
        const k = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * (j + 1));
        [featureValues[j], featureValues[k]] = [featureValues[k], featureValues[j]];
      }
      XPermuted.forEach((row, j) => row[i] = featureValues[j]);

      const permutedScore = await this.modelScore(model, XPermuted, y);
      importance[featureNames[i]] = baseline - permutedScore;
    }

    // Normalize
    const maxImportance = Math.max(...Object.values(importance));
    Object.keys(importance).forEach(key => {
      importance[key] = importance[key] / maxImportance;
    });

    return importance;
  }

  private async modelScore(model: tf.LayersModel, X: number[][], y: number[]): Promise<number> {
    const XTensor = tf.tensor2d(X);
    const predictionsTensor = model.predict(XTensor) as tf.Tensor;
    const predictions = await predictionsTensor.array() as number[][];
    const flatPredictions = predictions.map(p => p[0]);
    
    const score = this.calculateR2(y, flatPredictions);
    
    XTensor.dispose();
    predictionsTensor.dispose();
    
    return score;
  }

  private initializePopulation(size: number, constraints: any): Partial<SpectralFeatures>[] {
    const population: Partial<SpectralFeatures>[] = [];
    
    for (let i = 0; i < size; i++) {
      const individual: Partial<SpectralFeatures> = {
        uv365_400: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
        violet400_430: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
        blue430_480: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
        cyan480_520: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50,
        green520_565: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30,
        yellow565_590: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
        orange590_625: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30,
        red625_660: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 150,
        deepRed660_700: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
        farRed700_800: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50
      };
      
      // Ensure constraints are met
      const totalPPFD = Object.values(individual).reduce((sum, val) => sum + (val || 0), 0);
      if (constraints.maxPower) {
        const scale = constraints.maxPower / totalPPFD;
        Object.keys(individual).forEach(key => {
          individual[key as keyof SpectralFeatures] = (individual[key as keyof SpectralFeatures] as number) * scale;
        });
      }
      
      population.push(individual);
    }
    
    return population;
  }

  private async evaluateFitness(
    population: Partial<SpectralFeatures>[],
    targetMetric: string,
    targetValue: number,
    model: any
  ): Promise<number[]> {
    const fitness: number[] = [];
    
    for (const individual of population) {
      const prediction = await this.predictOutcome(individual, model);
      const error = Math.abs(prediction - targetValue);
      fitness.push(1 / (1 + error)); // Convert error to fitness
    }
    
    return fitness;
  }

  private async predictOutcome(spectrum: Partial<SpectralFeatures>, model: any): Promise<number> {
    // This would use the trained model to predict the outcome
    // For now, return a mock prediction
    const total = Object.values(spectrum).reduce((sum, val) => sum + (val || 0), 0);
    return total * 0.1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10;
  }

  private tournamentSelection(population: Partial<SpectralFeatures>[], fitness: number[]): Partial<SpectralFeatures>[] {
    const selected: Partial<SpectralFeatures>[] = [];
    const tournamentSize = 3;
    
    for (let i = 0; i < population.length; i++) {
      const tournament: number[] = [];
      for (let j = 0; j < tournamentSize; j++) {
        tournament.push(Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * population.length));
      }
      
      const winner = tournament.reduce((best, idx) => 
        fitness[idx] > fitness[best] ? idx : best
      );
      
      selected.push(population[winner]);
    }
    
    return selected;
  }

  private evolvePopulation(
    selected: Partial<SpectralFeatures>[],
    crossoverRate: number,
    mutationRate: number,
    constraints: any
  ): Partial<SpectralFeatures>[] {
    const newPopulation: Partial<SpectralFeatures>[] = [];
    
    for (let i = 0; i < selected.length; i += 2) {
      let parent1 = selected[i];
      let parent2 = selected[i + 1] || selected[0];
      
      if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < crossoverRate) {
        const [child1, child2] = this.crossover(parent1, parent2);
        parent1 = child1;
        parent2 = child2;
      }
      
      if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < mutationRate) {
        parent1 = this.mutate(parent1, constraints);
      }
      
      if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < mutationRate) {
        parent2 = this.mutate(parent2, constraints);
      }
      
      newPopulation.push(parent1, parent2);
    }
    
    return newPopulation.slice(0, selected.length);
  }

  private crossover(
    parent1: Partial<SpectralFeatures>,
    parent2: Partial<SpectralFeatures>
  ): [Partial<SpectralFeatures>, Partial<SpectralFeatures>] {
    const keys = Object.keys(parent1) as Array<keyof SpectralFeatures>;
    const crossoverPoint = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * keys.length);
    
    const child1: Partial<SpectralFeatures> = {};
    const child2: Partial<SpectralFeatures> = {};
    
    keys.forEach((key, i) => {
      if (i < crossoverPoint) {
        child1[key] = parent1[key];
        child2[key] = parent2[key];
      } else {
        child1[key] = parent2[key];
        child2[key] = parent1[key];
      }
    });
    
    return [child1, child2];
  }

  private mutate(individual: Partial<SpectralFeatures>, constraints: any): Partial<SpectralFeatures> {
    const mutated = { ...individual };
    const keys = Object.keys(mutated) as Array<keyof SpectralFeatures>;
    const keyToMutate = keys[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * keys.length)];
    
    // Gaussian mutation
    const currentValue = mutated[keyToMutate] as number || 0;
    const mutation = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * currentValue * 0.2;
    mutated[keyToMutate] = Math.max(0, currentValue + mutation) as any;
    
    return mutated;
  }

  private calculatePower(spectrum: Partial<SpectralFeatures>): number {
    // Simplified power calculation
    const ppfd = Object.values(spectrum).reduce((sum, val) => sum + (val || 0), 0);
    return ppfd * 0.3; // Rough conversion to watts
  }
}