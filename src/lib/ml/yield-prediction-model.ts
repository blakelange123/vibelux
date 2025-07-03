// TensorFlow will be loaded dynamically to prevent build-time issues
import type * as tfType from '@tensorflow/tfjs';
import { getTensorFlow } from './dynamic-tensorflow';

export interface YieldFeatures {
  temperature: number;
  humidity: number;
  ppfd: number;
  co2: number;
  vpd: number;
  ec: number;
  ph: number;
  dli: number;
  growthStage: number; // 0-1 normalized
  plantDensity: number;
  waterUsage: number;
  previousYield?: number;
}

export interface YieldTarget {
  actualYield: number;
  qualityScore: number;
}

export class YieldPredictionModel {
  private model: tf.LayersModel | null = null;
  private normalizationParams: any = null;
  private readonly modelPath = '/models/yield-prediction';
  
  // Feature scaling parameters (learned from training data)
  private featureRanges = {
    temperature: { min: 15, max: 35 },
    humidity: { min: 30, max: 90 },
    ppfd: { min: 100, max: 1000 },
    co2: { min: 400, max: 1500 },
    vpd: { min: 0.4, max: 2.0 },
    ec: { min: 0.5, max: 3.5 },
    ph: { min: 5.0, max: 7.5 },
    dli: { min: 10, max: 40 },
    growthStage: { min: 0, max: 1 },
    plantDensity: { min: 10, max: 100 },
    waterUsage: { min: 1, max: 10 },
    previousYield: { min: 0, max: 5 }
  };

  constructor() {
    // Initialize TensorFlow.js
    tf.setBackend('webgl');
  }

  /**
   * Create a new neural network model
   */
  createModel(inputFeatures: number = 12): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // Input layer
        tf.layers.dense({
          inputShape: [inputFeatures],
          units: 64,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        
        // Batch normalization for stable training
        tf.layers.batchNormalization(),
        
        // Dropout for regularization
        tf.layers.dropout({ rate: 0.3 }),
        
        // Hidden layers with residual connections
        tf.layers.dense({
          units: 128,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.3 }),
        
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.2 }),
        
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        
        // Output layer (yield prediction + confidence)
        tf.layers.dense({
          units: 2, // [yield, confidence]
          activation: 'linear'
        })
      ]
    });

    // Compile with appropriate loss and metrics
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae', 'mse']
    });

    this.model = model;
    return model;
  }

  /**
   * Normalize features to 0-1 range
   */
  normalizeFeatures(features: YieldFeatures): tf.Tensor2D {
    const normalized = Object.entries(features).map(([key, value]) => {
      const range = this.featureRanges[key as keyof typeof this.featureRanges];
      if (range) {
        return (value - range.min) / (range.max - range.min);
      }
      return value;
    });

    return tf.tensor2d([normalized]);
  }

  /**
   * Denormalize predictions back to original scale
   */
  denormalizePrediction(prediction: tf.Tensor): { yield: number; confidence: number } {
    const values = prediction.dataSync();
    
    // Denormalize yield (assuming 0-5 kg/m² range)
    const yieldValue = values[0] * 5;
    
    // Confidence is already 0-1
    const confidence = Math.max(0, Math.min(1, values[1])) * 100;

    return {
      yield: Math.max(0, yieldValue),
      confidence: confidence
    };
  }

  /**
   * Train the model with historical data
   */
  async train(
    trainingData: { features: YieldFeatures; target: YieldTarget }[],
    validationSplit: number = 0.2,
    epochs: number = 100,
    callbacks?: any
  ): Promise<tf.History> {
    if (!this.model) {
      this.createModel();
    }

    // Prepare training data
    const features = trainingData.map(d => Object.values(d.features));
    const targets = trainingData.map(d => [
      d.target.actualYield / 5, // Normalize yield to 0-1
      d.target.qualityScore / 100 // Normalize quality to 0-1
    ]);

    const xTrain = tf.tensor2d(features);
    const yTrain = tf.tensor2d(targets);

    // Custom callbacks for training progress
    const customCallbacks = {
      onEpochEnd: async (epoch: number, logs: any) => {
        if (callbacks?.onEpochEnd) {
          await callbacks.onEpochEnd(epoch, logs);
        }
        
        // Save best model based on validation loss
        if (epoch % 10 === 0) {
          await this.saveModel(`checkpoint-${epoch}`);
        }
      },
      onTrainEnd: async () => {
        if (callbacks?.onTrainEnd) {
          await callbacks.onTrainEnd();
        }
        await this.saveModel();
      },
      ...callbacks
    };

    // Train the model
    const history = await this.model!.fit(xTrain, yTrain, {
      epochs,
      validationSplit,
      batchSize: 32,
      shuffle: true,
      callbacks: customCallbacks
    });

    // Clean up tensors
    xTrain.dispose();
    yTrain.dispose();

    return history;
  }

  /**
   * Make yield prediction
   */
  async predict(features: YieldFeatures): Promise<{
    yield: number;
    confidence: number;
    factors: { name: string; impact: number }[];
  }> {
    if (!this.model) {
      await this.loadModel();
    }

    if (!this.model) {
      throw new Error('Model not loaded');
    }

    // Normalize features
    const normalizedFeatures = this.normalizeFeatures(features);
    
    // Make prediction
    const prediction = this.model.predict(normalizedFeatures) as tf.Tensor;
    const result = this.denormalizePrediction(prediction);

    // Calculate feature importance using gradient analysis
    const factors = await this.calculateFeatureImportance(features, normalizedFeatures);

    // Clean up
    normalizedFeatures.dispose();
    prediction.dispose();

    return {
      yield: result.yield,
      confidence: result.confidence,
      factors
    };
  }

  /**
   * Calculate feature importance using gradient-based analysis
   */
  private async calculateFeatureImportance(
    features: YieldFeatures,
    normalizedFeatures: tf.Tensor2D
  ): Promise<{ name: string; impact: number }[]> {
    if (!this.model) return [];

    const featureNames = Object.keys(features);
    const importances: { name: string; impact: number }[] = [];

    // Use gradient tape to calculate feature importance
    const gradients = tf.tidy(() => {
      const tape = tf.grad((x: tf.Tensor) => {
        const pred = this.model!.predict(x) as tf.Tensor;
        return pred.slice([0, 0], [1, 1]); // Get yield prediction only
      });

      return tape(normalizedFeatures);
    });

    const gradientValues = await gradients.array();
    const gradientArray = gradientValues[0] as number[];

    // Calculate relative importance
    const totalGradient = gradientArray.reduce((sum, g) => sum + Math.abs(g), 0);

    featureNames.forEach((name, idx) => {
      const relativeImportance = (Math.abs(gradientArray[idx]) / totalGradient) * 100;
      const isPositive = gradientArray[idx] > 0;
      
      importances.push({
        name: this.formatFeatureName(name),
        impact: isPositive ? relativeImportance : -relativeImportance
      });
    });

    gradients.dispose();

    return importances.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  /**
   * Format feature names for display
   */
  private formatFeatureName(name: string): string {
    const nameMap: { [key: string]: string } = {
      temperature: 'Temperature',
      humidity: 'Humidity',
      ppfd: 'Light (PPFD)',
      co2: 'CO2',
      vpd: 'VPD',
      ec: 'Nutrients (EC)',
      ph: 'pH',
      dli: 'Daily Light (DLI)',
      growthStage: 'Growth Stage',
      plantDensity: 'Plant Density',
      waterUsage: 'Water Usage',
      previousYield: 'Historical Yield'
    };

    return nameMap[name] || name;
  }

  /**
   * Save model to IndexedDB and optionally to server
   */
  async saveModel(version?: string): Promise<void> {
    if (!this.model) return;

    const modelPath = version ? `${this.modelPath}-${version}` : this.modelPath;
    
    // Save to IndexedDB for offline use
    await this.model.save(`indexeddb://${modelPath}`);
    
    // Also save normalization parameters
    const params = {
      featureRanges: this.featureRanges,
      modelVersion: version || 'latest',
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`${modelPath}-params`, JSON.stringify(params));
  }

  /**
   * Load model from IndexedDB or server
   */
  async loadModel(version?: string): Promise<boolean> {
    try {
      const modelPath = version ? `${this.modelPath}-${version}` : this.modelPath;
      
      // Try loading from IndexedDB first
      try {
        this.model = await tf.loadLayersModel(`indexeddb://${modelPath}`);
      } catch (e) {
        // If not in IndexedDB, try loading from server
        this.model = await tf.loadLayersModel(`/api/ml/models/yield-prediction${version ? `?version=${version}` : ''}`);
        
        // Save to IndexedDB for future use
        await this.saveModel(version);
      }

      // Load normalization parameters
      const paramsStr = localStorage.getItem(`${modelPath}-params`);
      if (paramsStr) {
        const params = JSON.parse(paramsStr);
        this.featureRanges = params.featureRanges || this.featureRanges;
      }

      return true;
    } catch (error) {
      console.error('Failed to load model:', error);
      return false;
    }
  }

  /**
   * Evaluate model performance on test data
   */
  async evaluate(
    testData: { features: YieldFeatures; target: YieldTarget }[]
  ): Promise<{
    mae: number;
    mse: number;
    rmse: number;
    r2: number;
    accuracy: number;
  }> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    const predictions: number[] = [];
    const actuals: number[] = [];

    // Make predictions for all test samples
    for (const sample of testData) {
      const pred = await this.predict(sample.features);
      predictions.push(pred.yield);
      actuals.push(sample.target.actualYield);
    }

    // Calculate metrics
    const mae = this.calculateMAE(actuals, predictions);
    const mse = this.calculateMSE(actuals, predictions);
    const rmse = Math.sqrt(mse);
    const r2 = this.calculateR2(actuals, predictions);
    
    // Accuracy as percentage within 10% of actual
    const accuracy = this.calculateAccuracy(actuals, predictions, 0.1);

    return { mae, mse, rmse, r2, accuracy };
  }

  private calculateMAE(actual: number[], predicted: number[]): number {
    const sum = actual.reduce((acc, val, idx) => 
      acc + Math.abs(val - predicted[idx]), 0
    );
    return sum / actual.length;
  }

  private calculateMSE(actual: number[], predicted: number[]): number {
    const sum = actual.reduce((acc, val, idx) => 
      acc + Math.pow(val - predicted[idx], 2), 0
    );
    return sum / actual.length;
  }

  private calculateR2(actual: number[], predicted: number[]): number {
    const actualMean = actual.reduce((a, b) => a + b) / actual.length;
    const totalSS = actual.reduce((acc, val) => 
      acc + Math.pow(val - actualMean, 2), 0
    );
    const residualSS = actual.reduce((acc, val, idx) => 
      acc + Math.pow(val - predicted[idx], 2), 0
    );
    return 1 - (residualSS / totalSS);
  }

  private calculateAccuracy(actual: number[], predicted: number[], tolerance: number): number {
    const correct = actual.filter((val, idx) => {
      const error = Math.abs(val - predicted[idx]) / val;
      return error <= tolerance;
    }).length;
    return (correct / actual.length) * 100;
  }

  /**
   * Export model for deployment
   */
  async exportModel(format: 'tfjs' | 'onnx' = 'tfjs'): Promise<Blob> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    // For now, we'll export as TensorFlow.js format
    // In production, you might want to convert to ONNX or other formats
    const modelData = await this.model.save(tf.io.withSaveHandler(async (artifacts) => {
      const modelJSON = JSON.stringify(artifacts.modelTopology);
      const weightData = artifacts.weightData;
      
      // Create a blob with the model data
      return new Blob([modelJSON, weightData], { type: 'application/octet-stream' });
    }));

    return modelData as unknown as Blob;
  }

  /**
   * Dispose of the model and free memory
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}