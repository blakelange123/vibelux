// ML Model Training for Yield Prediction
// Uses TensorFlow.js for in-browser training

// Only import TensorFlow.js on the client side
let tf: any = null;
if (typeof window !== 'undefined') {
  tf = require('@tensorflow/tfjs');
}

export interface TrainingData {
  inputs: {
    ppfd: number;
    dli: number;
    temperature: number;
    humidity: number;
    co2: number;
    vpd: number;
    week: number; // Week of growth
    strain: string;
  };
  output: {
    yield: number; // grams per plant
  };
}

export interface TrainedModel {
  model: tf.LayersModel;
  metadata: {
    version: string;
    trainedAt: Date;
    metrics: {
      loss: number;
      mae: number;
      r2Score: number;
    };
    normalizationParams: NormalizationParams;
    strainEncoder: Map<string, number>;
  };
}

interface NormalizationParams {
  inputMeans: number[];
  inputStds: number[];
  outputMean: number;
  outputStd: number;
}

export class YieldModelTrainer {
  private model: tf.LayersModel | null = null;
  private normParams: NormalizationParams | null = null;
  private strainEncoder: Map<string, number> = new Map();
  
  constructor() {
    // Initialize TensorFlow.js only on client
    if (typeof window === 'undefined' || !tf) {
      return;
    }
    tf.setBackend('webgl');
  }
  
  // Create neural network architecture
  createModel(inputShape: number): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // Input layer
        tf.layers.dense({
          inputShape: [inputShape],
          units: 128,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        
        // Batch normalization
        tf.layers.batchNormalization(),
        
        // Dropout for regularization
        tf.layers.dropout({ rate: 0.3 }),
        
        // Hidden layers
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
        
        // Output layer
        tf.layers.dense({
          units: 1,
          activation: 'linear'
        })
      ]
    });
    
    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['meanAbsoluteError']
    });
    
    return model;
  }
  
  // Prepare data for training
  prepareData(data: TrainingData[]): {
    inputs: tf.Tensor2D;
    outputs: tf.Tensor1D;
    normParams: NormalizationParams;
    strainEncoder: Map<string, number>;
  } {
    // Encode strains
    const uniqueStrains = [...new Set(data.map(d => d.inputs.strain))];
    uniqueStrains.forEach((strain, idx) => {
      this.strainEncoder.set(strain, idx);
    });
    
    // Convert to arrays
    const inputArray = data.map(d => [
      d.inputs.ppfd,
      d.inputs.dli,
      d.inputs.temperature,
      d.inputs.humidity,
      d.inputs.co2,
      d.inputs.vpd,
      d.inputs.week,
      this.strainEncoder.get(d.inputs.strain) || 0
    ]);
    
    const outputArray = data.map(d => d.output.yield);
    
    // Create tensors
    const inputs = tf.tensor2d(inputArray);
    const outputs = tf.tensor1d(outputArray);
    
    // Calculate normalization parameters
    const inputMoments = tf.moments(inputs, 0);
    const outputMoments = tf.moments(outputs, 0);
    
    const normParams: NormalizationParams = {
      inputMeans: Array.from(inputMoments.mean.dataSync()),
      inputStds: Array.from(tf.sqrt(inputMoments.variance).dataSync()),
      outputMean: outputMoments.mean.dataSync()[0],
      outputStd: Math.sqrt(outputMoments.variance.dataSync()[0])
    };
    
    // Normalize data
    const normalizedInputs = tf.div(
      tf.sub(inputs, inputMoments.mean),
      tf.sqrt(inputMoments.variance)
    );
    
    const normalizedOutputs = tf.div(
      tf.sub(outputs, outputMoments.mean),
      tf.sqrt(outputMoments.variance)
    );
    
    // Clean up intermediate tensors
    inputMoments.mean.dispose();
    inputMoments.variance.dispose();
    outputMoments.mean.dispose();
    outputMoments.variance.dispose();
    inputs.dispose();
    outputs.dispose();
    
    return {
      inputs: normalizedInputs as tf.Tensor2D,
      outputs: normalizedOutputs as tf.Tensor1D,
      normParams,
      strainEncoder: this.strainEncoder
    };
  }
  
  // Train the model
  async train(
    data: TrainingData[],
    options: {
      epochs?: number;
      batchSize?: number;
      validationSplit?: number;
      callbacks?: {
        onEpochEnd?: (epoch: number, logs: tf.Logs) => void;
        onTrainEnd?: () => void;
      };
    } = {}
  ): Promise<TrainedModel> {
    const {
      epochs = 100,
      batchSize = 32,
      validationSplit = 0.2,
      callbacks = {}
    } = options;
    
    // Prepare data
    const { inputs, outputs, normParams, strainEncoder } = this.prepareData(data);
    this.normParams = normParams;
    
    // Create model
    this.model = this.createModel(inputs.shape[1]);
    
    // Train model
    const history = await this.model.fit(inputs, outputs, {
      epochs,
      batchSize,
      validationSplit,
      shuffle: true,
      callbacks: {
        onEpochEnd: callbacks.onEpochEnd,
        onTrainEnd: callbacks.onTrainEnd
      }
    });
    
    // Calculate final metrics
    const finalLoss = history.history.loss[history.history.loss.length - 1] as number;
    const finalMAE = history.history.meanAbsoluteError[history.history.meanAbsoluteError.length - 1] as number;
    
    // Calculate R² score on validation data
    const r2Score = await this.calculateR2Score(inputs, outputs);
    
    // Clean up tensors
    inputs.dispose();
    outputs.dispose();
    
    return {
      model: this.model,
      metadata: {
        version: '1.0.0',
        trainedAt: new Date(),
        metrics: {
          loss: finalLoss,
          mae: finalMAE,
          r2Score
        },
        normalizationParams: normParams,
        strainEncoder
      }
    };
  }
  
  // Calculate R² score
  private async calculateR2Score(inputs: tf.Tensor2D, outputs: tf.Tensor1D): Promise<number> {
    if (!this.model) return 0;
    
    const predictions = this.model.predict(inputs) as tf.Tensor;
    const ssTot = tf.sum(tf.pow(tf.sub(outputs, tf.mean(outputs)), 2));
    const ssRes = tf.sum(tf.pow(tf.sub(outputs, predictions), 2));
    const r2 = tf.sub(1, tf.div(ssRes, ssTot));
    
    const r2Value = await r2.data();
    
    // Clean up
    predictions.dispose();
    ssTot.dispose();
    ssRes.dispose();
    r2.dispose();
    
    return r2Value[0];
  }
  
  // Make predictions
  predict(inputs: {
    ppfd: number;
    dli: number;
    temperature: number;
    humidity: number;
    co2: number;
    vpd: number;
    week: number;
    strain: string;
  }): number {
    if (!this.model || !this.normParams) {
      throw new Error('Model not trained');
    }
    
    // Prepare input
    const inputArray = [
      inputs.ppfd,
      inputs.dli,
      inputs.temperature,
      inputs.humidity,
      inputs.co2,
      inputs.vpd,
      inputs.week,
      this.strainEncoder.get(inputs.strain) || 0
    ];
    
    // Normalize
    const normalizedInput = inputArray.map((val, idx) => {
      return (val - this.normParams!.inputMeans[idx]) / this.normParams!.inputStds[idx];
    });
    
    // Predict
    const inputTensor = tf.tensor2d([normalizedInput]);
    const normalizedPrediction = this.model.predict(inputTensor) as tf.Tensor;
    
    // Denormalize
    const prediction = normalizedPrediction.dataSync()[0] * this.normParams.outputStd + this.normParams.outputMean;
    
    // Clean up
    inputTensor.dispose();
    normalizedPrediction.dispose();
    
    return Math.max(0, prediction); // Ensure non-negative
  }
  
  // Save model
  async saveModel(name: string = 'yield-model'): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save');
    }
    
    await this.model.save(`localstorage://${name}`);
    
    // Save metadata
    const metadata = {
      normalizationParams: this.normParams,
      strainEncoder: Array.from(this.strainEncoder.entries())
    };
    
    localStorage.setItem(`${name}-metadata`, JSON.stringify(metadata));
  }
  
  // Load model
  async loadModel(name: string = 'yield-model'): Promise<void> {
    this.model = await tf.loadLayersModel(`localstorage://${name}`);
    
    // Load metadata
    const metadataStr = localStorage.getItem(`${name}-metadata`);
    if (metadataStr) {
      const metadata = JSON.parse(metadataStr);
      this.normParams = metadata.normalizationParams;
      this.strainEncoder = new Map(metadata.strainEncoder);
    }
  }
  
  // Generate synthetic training data for testing
  static generateSyntheticData(count: number = 1000): TrainingData[] {
    const strains = ['Blue Dream', 'OG Kush', 'Gorilla Glue', 'Purple Haze', 'Northern Lights'];
    const data: TrainingData[] = [];
    
    for (let i = 0; i < count; i++) {
      // Random environmental conditions
      const ppfd = 400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400; // 400-800
      const dli = 15 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 25; // 15-40
      const temperature = 65 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20; // 65-85
      const humidity = 40 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30; // 40-70
      const co2 = 400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000; // 400-1400
      const week = Math.floor(1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 12); // 1-12 weeks
      const strain = strains[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * strains.length)];
      
      // Calculate VPD
      const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
      const vpd = svp * (1 - humidity / 100);
      
      // Yield model (simplified but realistic)
      let baseYield = 50; // Base yield per plant
      
      // PPFD effect (sigmoid curve)
      const ppfdOptimal = 600;
      const ppfdEffect = 1 / (1 + Math.exp(-0.01 * (ppfd - ppfdOptimal)));
      baseYield *= (0.5 + ppfdEffect);
      
      // Temperature effect (quadratic, optimal at 75°F)
      const tempOptimal = 75;
      const tempEffect = 1 - Math.pow((temperature - tempOptimal) / 20, 2);
      baseYield *= Math.max(0.3, tempEffect);
      
      // CO2 effect (logarithmic)
      const co2Effect = Math.log(co2 / 400) / Math.log(3);
      baseYield *= (1 + co2Effect * 0.3);
      
      // VPD effect (optimal at 1.0 kPa)
      const vpdOptimal = 1.0;
      const vpdEffect = 1 - Math.abs(vpd - vpdOptimal) * 0.3;
      baseYield *= Math.max(0.5, vpdEffect);
      
      // Week effect (growth curve)
      const weekEffect = week < 8 ? week / 8 : 1;
      baseYield *= weekEffect;
      
      // Strain effect
      const strainMultipliers: Record<string, number> = {
        'Blue Dream': 1.1,
        'OG Kush': 0.9,
        'Gorilla Glue': 1.2,
        'Purple Haze': 1.0,
        'Northern Lights': 0.95
      };
      baseYield *= strainMultipliers[strain] || 1;
      
      // Add noise
      baseYield += (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20;
      
      data.push({
        inputs: {
          ppfd,
          dli,
          temperature,
          humidity,
          co2,
          vpd,
          week,
          strain
        },
        output: {
          yield: Math.max(10, baseYield)
        }
      });
    }
    
    return data;
  }
}

// Export TensorFlow types for use in components
export { tf };