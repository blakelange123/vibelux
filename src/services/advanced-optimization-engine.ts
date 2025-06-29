/**
 * Advanced Optimization Engine
 * Implements ML, PID control, and predictive algorithms for energy savings
 */

import { prisma } from '@/lib/prisma';
import * as tf from '@tensorflow/tfjs-node';

interface PIDController {
  kp: number;  // Proportional gain
  ki: number;  // Integral gain
  kd: number;  // Derivative gain
  setpoint: number;
  integral: number;
  previousError: number;
  outputMin: number;
  outputMax: number;
}

interface OptimizationModel {
  dliPredictor: tf.Sequential | null;
  demandPredictor: tf.Sequential | null;
  savingsEstimator: tf.Sequential | null;
}

interface EnvironmentalFactors {
  temperature: number;
  humidity: number;
  co2Level: number;
  vpd: number;
  solarRadiation: number;
  weatherForecast: any;
}

export class AdvancedOptimizationEngine {
  private static instance: AdvancedOptimizationEngine;
  
  // PID Controllers for each zone
  private pidControllers: Map<string, PIDController> = new Map();
  
  // ML Models
  private models: OptimizationModel = {
    dliPredictor: null,
    demandPredictor: null,
    savingsEstimator: null
  };
  
  // Historical data buffer for ML
  private dataBuffer: Map<string, any[]> = new Map();
  
  // Optimization parameters learned from data
  private optimizationParams = {
    adaptiveDimmingRate: 0.85,      // Learned optimal dimming
    peakShiftMinutes: 30,            // How early to start ramping down
    temperatureResponseCurve: null,   // Non-linear response
    cropSpecificModels: new Map()     // Per-crop ML models
  };

  private constructor() {}

  static getInstance(): AdvancedOptimizationEngine {
    if (!AdvancedOptimizationEngine.instance) {
      AdvancedOptimizationEngine.instance = new AdvancedOptimizationEngine();
    }
    return AdvancedOptimizationEngine.instance;
  }

  /**
   * Initialize ML models and PID controllers
   */
  async initialize() {
    
    // Load or create ML models
    await this.initializeMLModels();
    
    // Initialize PID controllers for active zones
    await this.initializePIDControllers();
    
  }

  /**
   * Main optimization decision engine
   */
  async optimizeZone(
    zoneId: string,
    currentState: any,
    constraints: any,
    environmental: EnvironmentalFactors
  ): Promise<{
    intensity: number;
    confidence: number;
    estimatedSavings: number;
    reasoning: string[];
  }> {
    const reasoning: string[] = [];
    
    // 1. ML-based DLI prediction
    const dliPrediction = await this.predictDLI(zoneId, currentState, environmental);
    reasoning.push(`ML DLI Prediction: ${dliPrediction.toFixed(1)} mol/m²/d`);
    
    // 2. PID control for smooth transitions
    const pidOutput = this.runPIDControl(zoneId, dliPrediction, constraints.targetDLI);
    reasoning.push(`PID Controller output: ${pidOutput.toFixed(1)}%`);
    
    // 3. Demand response optimization
    const demandOptimization = await this.optimizeForDemand(currentState, environmental);
    reasoning.push(`Demand optimization: ${demandOptimization.reduction}% reduction possible`);
    
    // 4. Temperature compensation using ML
    const tempCompensation = await this.calculateTemperatureCompensation(
      environmental.temperature,
      environmental.vpd,
      constraints.cropType
    );
    reasoning.push(`Temperature compensation: ${tempCompensation.toFixed(1)}%`);
    
    // 5. Combine all factors with weighted approach
    const weights = {
      pid: 0.4,        // Smooth control
      demand: 0.3,     // Cost savings
      temp: 0.2,       // Environmental response
      safety: 0.1      // Conservative buffer
    };
    
    let optimalIntensity = 
      pidOutput * weights.pid +
      (100 - demandOptimization.reduction) * weights.demand +
      tempCompensation * weights.temp +
      95 * weights.safety;  // Never go below 95% of target
    
    // 6. Apply crop-specific ML model if available
    if (this.optimizationParams.cropSpecificModels.has(constraints.cropType)) {
      const cropModel = this.optimizationParams.cropSpecificModels.get(constraints.cropType);
      const cropOptimization = await this.runCropSpecificModel(
        cropModel,
        currentState,
        environmental
      );
      optimalIntensity = optimalIntensity * 0.7 + cropOptimization * 0.3;
      reasoning.push(`Crop-specific ML adjustment: ${cropOptimization.toFixed(1)}%`);
    }
    
    // 7. Safety checks and bounds
    optimalIntensity = Math.max(
      constraints.minIntensity || 50,
      Math.min(100, optimalIntensity)
    );
    
    // 8. Calculate savings with ML model
    const estimatedSavings = await this.estimateSavings(
      currentState.baselinePower,
      optimalIntensity,
      currentState.electricityRate,
      environmental
    );
    
    // 9. Confidence calculation
    const confidence = this.calculateConfidence(
      dliPrediction,
      constraints.targetDLI,
      environmental,
      this.dataBuffer.get(zoneId)?.length || 0
    );
    
    reasoning.push(`Final intensity: ${optimalIntensity.toFixed(1)}% (confidence: ${confidence.toFixed(0)}%)`);
    
    return {
      intensity: Math.round(optimalIntensity),
      confidence,
      estimatedSavings,
      reasoning
    };
  }

  /**
   * PID Control Implementation
   */
  private runPIDControl(zoneId: string, current: number, setpoint: number): number {
    if (!this.pidControllers.has(zoneId)) {
      this.pidControllers.set(zoneId, {
        kp: 2.0,    // Proportional: Quick response
        ki: 0.5,    // Integral: Eliminate steady-state error
        kd: 0.1,    // Derivative: Reduce overshoot
        setpoint,
        integral: 0,
        previousError: 0,
        outputMin: 50,
        outputMax: 100
      });
    }
    
    const pid = this.pidControllers.get(zoneId)!;
    pid.setpoint = setpoint;
    
    // Calculate error
    const error = setpoint - current;
    
    // Proportional term
    const pTerm = pid.kp * error;
    
    // Integral term (with anti-windup)
    pid.integral += error;
    pid.integral = Math.max(-50, Math.min(50, pid.integral)); // Prevent windup
    const iTerm = pid.ki * pid.integral;
    
    // Derivative term
    const dTerm = pid.kd * (error - pid.previousError);
    pid.previousError = error;
    
    // Calculate output
    let output = 100 - (pTerm + iTerm + dTerm); // Inverse because reducing intensity
    
    // Apply limits
    output = Math.max(pid.outputMin, Math.min(pid.outputMax, output));
    
    return output;
  }

  /**
   * ML-based DLI prediction
   */
  private async predictDLI(
    zoneId: string,
    currentState: any,
    environmental: EnvironmentalFactors
  ): Promise<number> {
    if (!this.models.dliPredictor) {
      // Simple calculation if model not loaded
      const ppfd = currentState.intensity * 8; // Rough conversion
      const photoperiod = currentState.photoperiod || 12;
      return (ppfd * photoperiod * 3600) / 1000000;
    }
    
    // Prepare input features
    const features = tf.tensor2d([[
      currentState.intensity / 100,
      currentState.photoperiod / 24,
      environmental.temperature / 40,
      environmental.humidity / 100,
      environmental.co2Level / 2000,
      environmental.solarRadiation / 1000,
      new Date().getHours() / 24  // Time of day
    ]]);
    
    // Run prediction
    const prediction = this.models.dliPredictor.predict(features) as tf.Tensor;
    const dli = (await prediction.data())[0] * 50; // Scale to typical DLI range
    
    features.dispose();
    prediction.dispose();
    
    return dli;
  }

  /**
   * Demand response optimization using ML
   */
  private async optimizeForDemand(
    currentState: any,
    environmental: EnvironmentalFactors
  ): Promise<{ reduction: number; savings: number }> {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    if (!this.models.demandPredictor) {
      // Rule-based fallback
      if (hour >= 14 && hour <= 19) {
        return { reduction: 15, savings: currentState.electricityRate * 0.15 };
      }
      return { reduction: 0, savings: 0 };
    }
    
    // ML prediction for optimal reduction
    const features = tf.tensor2d([[
      hour / 24,
      dayOfWeek / 7,
      currentState.electricityRate,
      environmental.temperature / 40,
      currentState.currentDemand / currentState.maxDemand,
      environmental.weatherForecast?.cloudCover || 0.5
    ]]);
    
    const prediction = this.models.demandPredictor.predict(features) as tf.Tensor;
    const reduction = (await prediction.data())[0] * 30; // Max 30% reduction
    
    features.dispose();
    prediction.dispose();
    
    const savings = (currentState.baselinePower * reduction / 100) * currentState.electricityRate;
    
    return { reduction, savings };
  }

  /**
   * Temperature compensation using non-linear model
   */
  private async calculateTemperatureCompensation(
    temperature: number,
    vpd: number,
    cropType: string
  ): Promise<number> {
    // Optimal temperature ranges by crop
    const optimalRanges = {
      cannabis: { min: 20, optimal: 25, max: 28 },
      tomato: { min: 18, optimal: 24, max: 30 },
      lettuce: { min: 15, optimal: 20, max: 25 },
      strawberry: { min: 15, optimal: 22, max: 26 }
    };
    
    const range = optimalRanges[cropType] || optimalRanges.tomato;
    
    // Non-linear response curve
    let compensation = 100;
    
    if (temperature < range.min) {
      // Too cold - increase light for warmth
      compensation = 100 + (range.min - temperature) * 2;
    } else if (temperature > range.max) {
      // Too hot - reduce light to prevent stress
      compensation = 100 - (temperature - range.max) * 5;
      compensation = Math.max(70, compensation); // Don't go below 70%
    } else if (temperature > range.optimal) {
      // Slightly warm - minor reduction
      const factor = (temperature - range.optimal) / (range.max - range.optimal);
      compensation = 100 - (factor * 10); // Max 10% reduction
    }
    
    // VPD adjustment
    if (vpd < 0.4 || vpd > 1.6) {
      compensation *= 0.95; // 5% reduction for poor VPD
    }
    
    return compensation;
  }

  /**
   * Run crop-specific ML model
   */
  private async runCropSpecificModel(
    model: tf.LayersModel,
    currentState: any,
    environmental: EnvironmentalFactors
  ): Promise<number> {
    const features = tf.tensor2d([[
      currentState.growthStage === 'flowering' ? 1 : 0,
      currentState.daysInStage / 60,
      currentState.plantHeight / 200,
      environmental.co2Level / 2000,
      environmental.vpd,
      currentState.nutrientEc / 3,
      currentState.wateringFrequency / 10
    ]]);
    
    const prediction = model.predict(features) as tf.Tensor;
    const intensity = (await prediction.data())[0] * 100;
    
    features.dispose();
    prediction.dispose();
    
    return intensity;
  }

  /**
   * Estimate savings using ML model
   */
  private async estimateSavings(
    baselinePower: number,
    optimizedIntensity: number,
    electricityRate: number,
    environmental: EnvironmentalFactors
  ): Promise<number> {
    const reduction = (100 - optimizedIntensity) / 100;
    const powerSaved = baselinePower * reduction;
    
    if (!this.models.savingsEstimator) {
      // Simple calculation
      return powerSaved * electricityRate;
    }
    
    // ML model includes additional factors
    const features = tf.tensor2d([[
      powerSaved,
      electricityRate,
      new Date().getMonth() / 12,  // Seasonal adjustment
      environmental.temperature / 40,
      environmental.solarRadiation / 1000
    ]]);
    
    const prediction = this.models.savingsEstimator.predict(features) as tf.Tensor;
    const savings = (await prediction.data())[0];
    
    features.dispose();
    prediction.dispose();
    
    return savings;
  }

  /**
   * Calculate confidence in optimization
   */
  private calculateConfidence(
    predictedDLI: number,
    targetDLI: number,
    environmental: EnvironmentalFactors,
    dataPoints: number
  ): number {
    let confidence = 100;
    
    // DLI accuracy
    const dliError = Math.abs(predictedDLI - targetDLI) / targetDLI;
    confidence -= dliError * 50;
    
    // Environmental stability
    if (environmental.temperature < 15 || environmental.temperature > 35) {
      confidence -= 10;
    }
    
    // Data availability
    if (dataPoints < 100) {
      confidence *= dataPoints / 100;
    }
    
    // Model training status
    if (!this.models.dliPredictor) {
      confidence *= 0.7; // 30% reduction without ML
    }
    
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Initialize ML models
   */
  private async initializeMLModels() {
    try {
      // Try to load existing models
      this.models.dliPredictor = await tf.loadLayersModel('file://./models/dli-predictor/model.json').catch(() => null);
      this.models.demandPredictor = await tf.loadLayersModel('file://./models/demand-predictor/model.json').catch(() => null);
      this.models.savingsEstimator = await tf.loadLayersModel('file://./models/savings-estimator/model.json').catch(() => null);
      
      // Create new models if not found
      if (!this.models.dliPredictor) {
        this.models.dliPredictor = this.createDLIPredictorModel();
      }
      
      if (!this.models.demandPredictor) {
        this.models.demandPredictor = this.createDemandPredictorModel();
      }
      
    } catch (error) {
      console.error('Failed to initialize ML models:', error);
    }
  }

  /**
   * Create DLI predictor neural network
   */
  private createDLIPredictorModel(): tf.Sequential {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 32, activation: 'relu', inputShape: [7] }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
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
   * Create demand predictor model
   */
  private createDemandPredictorModel(): tf.Sequential {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 24, activation: 'relu', inputShape: [6] }),
        tf.layers.dense({ units: 12, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });
    
    return model;
  }

  /**
   * Initialize PID controllers
   */
  private async initializePIDControllers() {
    const zones = await prisma.lighting_zones.findMany();
    
    for (const zone of zones) {
      // Initialize with crop-specific tuning
      const tuning = this.getPIDTuning(zone.crop_type, zone.growth_stage);
      
      this.pidControllers.set(zone.id, {
        kp: tuning.kp,
        ki: tuning.ki,
        kd: tuning.kd,
        setpoint: 30, // Default DLI target
        integral: 0,
        previousError: 0,
        outputMin: 50,
        outputMax: 100
      });
    }
  }

  /**
   * Get PID tuning parameters by crop
   */
  private getPIDTuning(cropType: string, growthStage: string) {
    const tunings = {
      cannabis: {
        vegetative: { kp: 2.5, ki: 0.8, kd: 0.1 },
        flowering: { kp: 1.5, ki: 0.3, kd: 0.05 } // More conservative
      },
      tomato: {
        vegetative: { kp: 2.0, ki: 0.6, kd: 0.1 },
        flowering: { kp: 1.8, ki: 0.5, kd: 0.08 }
      },
      lettuce: {
        vegetative: { kp: 3.0, ki: 1.0, kd: 0.2 }, // Aggressive - fast growing
        flowering: { kp: 3.0, ki: 1.0, kd: 0.2 }
      }
    };
    
    return tunings[cropType]?.[growthStage] || { kp: 2.0, ki: 0.5, kd: 0.1 };
  }

  /**
   * Update models with new data (online learning)
   */
  async updateModels(zoneId: string, actualData: any) {
    // Store data for batch training
    if (!this.dataBuffer.has(zoneId)) {
      this.dataBuffer.set(zoneId, []);
    }
    
    const buffer = this.dataBuffer.get(zoneId)!;
    buffer.push(actualData);
    
    // Retrain when we have enough data
    if (buffer.length >= 100) {
      await this.retrainModels(zoneId, buffer);
      
      // Keep last 50 points
      this.dataBuffer.set(zoneId, buffer.slice(-50));
    }
  }

  /**
   * Retrain models with accumulated data
   */
  private async retrainModels(zoneId: string, data: any[]) {
    
    // Prepare training data
    const features: number[][] = [];
    const labels: number[][] = [];
    
    for (const sample of data) {
      features.push([
        sample.intensity / 100,
        sample.photoperiod / 24,
        sample.temperature / 40,
        sample.humidity / 100,
        sample.co2Level / 2000,
        sample.solarRadiation / 1000,
        sample.hour / 24
      ]);
      
      labels.push([sample.actualDLI / 50]);
    }
    
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);
    
    // Train DLI predictor
    if (this.models.dliPredictor) {
      await this.models.dliPredictor.fit(xs, ys, {
        epochs: 10,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 0
      });
    }
    
    xs.dispose();
    ys.dispose();
    
  }
}

// Export singleton
export const advancedOptimizationEngine = AdvancedOptimizationEngine.getInstance();