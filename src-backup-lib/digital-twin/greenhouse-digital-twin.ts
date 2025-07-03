/**
 * Real-time Digital Twin for Greenhouse Environments
 * Integrates with physics-informed RL engine and provides virtual simulation
 */

import { EnvironmentState, Action, ReinforcementLearningEngine } from '../reinforcement-learning/rl-engine';
import { PlantAnalysis } from '../plant-vision-ai';

export interface SensorReading {
  sensorId: string;
  sensorType: 'temperature' | 'humidity' | 'co2' | 'light' | 'ph' | 'ec' | 'pressure' | 'flow';
  value: number;
  unit: string;
  timestamp: Date;
  location: {
    zone: string;
    x: number;
    y: number;
    z: number;
  };
  quality: 'good' | 'warning' | 'error';
  calibration: {
    lastCalibrated: Date;
    nextCalibration: Date;
    accuracy: number;
  };
}

export interface ActuatorCommand {
  actuatorId: string;
  actuatorType: 'heater' | 'cooler' | 'humidifier' | 'dehumidifier' | 'co2_injector' | 'ventilation' | 'lighting' | 'irrigation' | 'nutrient_pump';
  command: 'on' | 'off' | 'set_value';
  value?: number;
  duration?: number; // milliseconds
  timestamp: Date;
  zone: string;
  feedback?: {
    success: boolean;
    actualValue?: number;
    error?: string;
  };
}

export interface DigitalTwinState {
  realTime: EnvironmentState;
  predicted: EnvironmentState;
  virtual: EnvironmentState;
  sensorReadings: SensorReading[];
  actuatorStates: ActuatorCommand[];
  plantMetrics: {
    healthScore: number;
    growthRate: number;
    stressLevel: number;
    biomass: number;
    yieldPrediction: number;
  };
  systemPerformance: {
    energyConsumption: number;
    waterUsage: number;
    nutrientConsumption: number;
    co2Usage: number;
    efficiency: number;
  };
  timestamp: Date;
}

export interface DigitalTwinConfig {
  updateInterval: number; // milliseconds
  predictionHorizon: number; // hours
  sensorFusionEnabled: boolean;
  virtualSimulationEnabled: boolean;
  rlEngineEnabled: boolean;
  dataRetentionDays: number;
}

export class GreenhouseDigitalTwin {
  private config: DigitalTwinConfig;
  private rlEngine: ReinforcementLearningEngine;
  private currentState: DigitalTwinState;
  private sensorData: Map<string, SensorReading[]>;
  private actuatorHistory: ActuatorCommand[];
  private updateTimer: NodeJS.Timeout | null = null;
  private predictionCache: Map<string, EnvironmentState[]>;
  private callbacks: {
    onStateUpdate: ((state: DigitalTwinState) => void)[];
    onAnomaly: ((anomaly: { type: string; severity: string; data: any }) => void)[];
    onRecommendation: ((recommendation: { action: Action; confidence: number; reasoning: string }) => void)[];
  };

  constructor(config: Partial<DigitalTwinConfig> = {}) {
    this.config = {
      updateInterval: 30000, // 30 seconds
      predictionHorizon: 24, // 24 hours
      sensorFusionEnabled: true,
      virtualSimulationEnabled: true,
      rlEngineEnabled: true,
      dataRetentionDays: 30,
      ...config
    };
    
    this.rlEngine = new ReinforcementLearningEngine();
    this.sensorData = new Map();
    this.actuatorHistory = [];
    this.predictionCache = new Map();
    this.callbacks = {
      onStateUpdate: [],
      onAnomaly: [],
      onRecommendation: []
    };
    
    this.currentState = this.initializeState();
    this.startRealTimeUpdates();
  }

  // Public API
  public getCurrentState(): DigitalTwinState {
    return { ...this.currentState };
  }

  public async addSensorReading(reading: SensorReading): Promise<void> {
    // Store sensor reading
    if (!this.sensorData.has(reading.sensorId)) {
      this.sensorData.set(reading.sensorId, []);
    }
    
    const sensorHistory = this.sensorData.get(reading.sensorId)!;
    sensorHistory.push(reading);
    
    // Keep only recent data
    const cutoffTime = new Date(Date.now() - this.config.dataRetentionDays * 24 * 60 * 60 * 1000);
    this.sensorData.set(
      reading.sensorId,
      sensorHistory.filter(r => r.timestamp > cutoffTime)
    );

    // Update current state with new sensor data
    await this.updateStateFromSensors();
    
    // Check for anomalies
    this.checkForAnomalies(reading);
  }

  public async executeActuatorCommand(command: ActuatorCommand): Promise<boolean> {
    try {
      // Simulate actuator execution (in production, this would call actual hardware)
      const success = await this.simulateActuatorExecution(command);
      
      command.feedback = {
        success,
        actualValue: command.value,
        error: success ? undefined : 'Actuator execution failed'
      };
      
      this.actuatorHistory.push(command);
      
      // Update virtual state based on actuator action
      if (success) {
        await this.updateVirtualState(command);
      }
      
      return success;
    } catch (error) {
      console.error('Error executing actuator command:', error);
      command.feedback = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      return false;
    }
  }

  public async getRecommendations(): Promise<Array<{
    action: Action;
    confidence: number;
    reasoning: string;
    expectedOutcome: EnvironmentState;
  }>> {
    if (!this.config.rlEngineEnabled) {
      return [];
    }

    try {
      const recommendations = await this.rlEngine.getRecommendations(this.currentState.realTime);
      
      return await Promise.all(
        recommendations.map(async (rec) => ({
          ...rec,
          expectedOutcome: this.predictStateAfterAction(this.currentState.realTime, rec.action)
        }))
      );
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  public async predictFutureStates(hours: number = 24): Promise<EnvironmentState[]> {
    const cacheKey = `${hours}_${Date.now()}`;
    
    if (this.predictionCache.has(cacheKey)) {
      return this.predictionCache.get(cacheKey)!;
    }

    const predictions: EnvironmentState[] = [];
    let currentState = { ...this.currentState.realTime };
    
    // Predict state changes hour by hour
    for (let hour = 1; hour <= hours; hour++) {
      // Get recommended action for this hour
      const action = this.rlEngine.selectAction(currentState);
      
      // Predict next state
      currentState = this.predictStateAfterAction(currentState, action);
      predictions.push({ ...currentState });
    }
    
    this.predictionCache.set(cacheKey, predictions);
    
    // Clear cache after 5 minutes
    setTimeout(() => {
      this.predictionCache.delete(cacheKey);
    }, 5 * 60 * 1000);
    
    return predictions;
  }

  public async runVirtualExperiment(
    modifications: Partial<EnvironmentState>,
    durationHours: number = 168 // 1 week
  ): Promise<{
    states: EnvironmentState[];
    totalReward: number;
    averageReward: number;
    plantHealth: number[];
    resourceUsage: {
      energy: number;
      water: number;
      co2: number;
      nutrients: number;
    };
  }> {
    const virtualState = { ...this.currentState.realTime, ...modifications };
    const states: EnvironmentState[] = [virtualState];
    const rewards: number[] = [];
    const healthScores: number[] = [];
    let totalEnergy = 0, totalWater = 0, totalCO2 = 0, totalNutrients = 0;
    
    let currentState = virtualState;
    
    for (let hour = 0; hour < durationHours; hour++) {
      // Get optimal action for current state
      const action = this.rlEngine.selectAction(currentState);
      
      // Predict next state
      const nextState = this.predictStateAfterAction(currentState, action);
      
      // Calculate reward
      const reward = this.calculateReward(currentState, action, nextState);
      rewards.push(reward.total);
      
      // Track plant health
      healthScores.push(100 - nextState.stressLevel * 100);
      
      // Track resource usage
      totalEnergy += this.calculateEnergyUsage(action);
      totalWater += this.calculateWaterUsage(action);
      totalCO2 += this.calculateCO2Usage(action);
      totalNutrients += this.calculateNutrientUsage(action);
      
      states.push(nextState);
      currentState = nextState;
    }
    
    return {
      states,
      totalReward: rewards.reduce((a, b) => a + b, 0),
      averageReward: rewards.reduce((a, b) => a + b, 0) / rewards.length,
      plantHealth: healthScores,
      resourceUsage: {
        energy: totalEnergy,
        water: totalWater,
        co2: totalCO2,
        nutrients: totalNutrients
      }
    };
  }

  // Event handlers
  public onStateUpdate(callback: (state: DigitalTwinState) => void): void {
    this.callbacks.onStateUpdate.push(callback);
  }

  public onAnomaly(callback: (anomaly: { type: string; severity: string; data: any }) => void): void {
    this.callbacks.onAnomaly.push(callback);
  }

  public onRecommendation(callback: (recommendation: { action: Action; confidence: number; reasoning: string }) => void): void {
    this.callbacks.onRecommendation.push(callback);
  }

  // Private methods
  private initializeState(): DigitalTwinState {
    const baseState: EnvironmentState = {
      temperature: 24,
      humidity: 65,
      co2Level: 800,
      lightIntensity: 400,
      lightSpectrum: { red: 0.3, blue: 0.2, green: 0.1, farRed: 0.1, uv: 0.05 },
      vpd: 1.0,
      soilMoisture: 70,
      ph: 6.0,
      ec: 1.8,
      growthStage: 'vegetative',
      plantHeight: 15,
      leafCount: 12,
      biomass: 50,
      stressLevel: 0.1,
      dayOfGrowth: 21,
      timeOfDay: 12,
      photoperiod: 18
    };

    return {
      realTime: { ...baseState },
      predicted: { ...baseState },
      virtual: { ...baseState },
      sensorReadings: [],
      actuatorStates: [],
      plantMetrics: {
        healthScore: 90,
        growthRate: 0.8,
        stressLevel: 0.1,
        biomass: 50,
        yieldPrediction: 180
      },
      systemPerformance: {
        energyConsumption: 0,
        waterUsage: 0,
        nutrientConsumption: 0,
        co2Usage: 0,
        efficiency: 0.85
      },
      timestamp: new Date()
    };
  }

  private startRealTimeUpdates(): void {
    this.updateTimer = setInterval(async () => {
      await this.updateState();
    }, this.config.updateInterval);
  }

  private async updateState(): Promise<void> {
    // Update predicted state
    if (this.config.rlEngineEnabled) {
      const nextAction = this.rlEngine.selectAction(this.currentState.realTime);
      this.currentState.predicted = this.predictStateAfterAction(this.currentState.realTime, nextAction);
    }

    // Update virtual state simulation
    if (this.config.virtualSimulationEnabled) {
      await this.updateVirtualSimulation();
    }

    // Update plant metrics
    await this.updatePlantMetrics();

    // Update system performance
    this.updateSystemPerformance();

    // Update timestamp
    this.currentState.timestamp = new Date();

    // Notify callbacks
    this.callbacks.onStateUpdate.forEach(callback => {
      try {
        callback(this.currentState);
      } catch (error) {
        console.error('Error in state update callback:', error);
      }
    });
  }

  private async updateStateFromSensors(): Promise<void> {
    if (!this.config.sensorFusionEnabled) return;

    const latestReadings = new Map<string, SensorReading>();
    
    // Get latest reading for each sensor type
    this.sensorData.forEach((readings, sensorId) => {
      if (readings.length > 0) {
        const latest = readings[readings.length - 1];
        latestReadings.set(latest.sensorType, latest);
      }
    });

    // Update real-time state with sensor fusion
    const newState = { ...this.currentState.realTime };
    
    latestReadings.forEach((reading, sensorType) => {
      if (reading.quality === 'good') {
        switch (sensorType) {
          case 'temperature':
            newState.temperature = reading.value;
            break;
          case 'humidity':
            newState.humidity = reading.value;
            break;
          case 'co2':
            newState.co2Level = reading.value;
            break;
          case 'light':
            newState.lightIntensity = reading.value;
            break;
          case 'ph':
            newState.ph = reading.value;
            break;
          case 'ec':
            newState.ec = reading.value;
            break;
        }
      }
    });

    // Calculate VPD from temperature and humidity
    newState.vpd = this.calculateVPD(newState.temperature, newState.humidity);

    this.currentState.realTime = newState;
    this.currentState.sensorReadings = Array.from(latestReadings.values());
  }

  private predictStateAfterAction(state: EnvironmentState, action: Action): EnvironmentState {
    // Use the physics model from the RL engine
    // This is a simplified version - in production, use the actual physics model
    const nextState = { ...state };
    
    switch (action.parameter) {
      case 'temperature':
        nextState.temperature = Math.max(15, Math.min(35, state.temperature + action.adjustment * 2));
        nextState.vpd = this.calculateVPD(nextState.temperature, nextState.humidity);
        break;
      case 'humidity':
        nextState.humidity = Math.max(30, Math.min(85, state.humidity + action.adjustment * 5));
        nextState.vpd = this.calculateVPD(nextState.temperature, nextState.humidity);
        break;
      case 'lightIntensity':
        nextState.lightIntensity = Math.max(0, Math.min(1000, state.lightIntensity + action.adjustment * 100));
        break;
      case 'co2Level':
        nextState.co2Level = Math.max(400, Math.min(1500, state.co2Level + action.adjustment * 200));
        break;
    }
    
    // Update plant stress and growth
    nextState.stressLevel = this.calculateStress(nextState);
    if (nextState.stressLevel < 0.3) {
      nextState.biomass += 0.1;
      nextState.plantHeight += 0.05;
    }
    
    return nextState;
  }

  private calculateVPD(temperature: number, humidity: number): number {
    const satVP = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    const actualVP = satVP * (humidity / 100);
    return Math.max(0, satVP - actualVP);
  }

  private calculateStress(state: EnvironmentState): number {
    let stress = 0;
    
    // Temperature stress
    const optimalTemp = 24;
    stress += Math.abs(state.temperature - optimalTemp) * 0.05;
    
    // VPD stress
    const optimalVPD = 1.0;
    stress += Math.abs(state.vpd - optimalVPD) * 0.3;
    
    // Light stress
    const optimalLight = 600;
    stress += Math.abs(state.lightIntensity - optimalLight) / optimalLight * 0.2;
    
    return Math.min(1, stress);
  }

  private calculateReward(state: EnvironmentState, action: Action, nextState: EnvironmentState): { total: number; components: any } {
    // Simplified reward calculation
    const growthReward = (nextState.biomass - state.biomass) * 10;
    const stressReward = (state.stressLevel - nextState.stressLevel) * 5;
    const efficiencyReward = -Math.abs(action.adjustment) * 0.5;
    
    return {
      total: growthReward + stressReward + efficiencyReward,
      components: { growth: growthReward, stress: stressReward, efficiency: efficiencyReward }
    };
  }

  private async simulateActuatorExecution(command: ActuatorCommand): Promise<boolean> {
    // Simulate actuator response time and success rate
    await new Promise(resolve => setTimeout(resolve, 100 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200));
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.02; // 98% success rate
  }

  private async updateVirtualState(command: ActuatorCommand): Promise<void> {
    // Update virtual state based on actuator command
    const action: Action = {
      id: `actuator_${command.actuatorId}`,
      type: 'environmental',
      parameter: this.mapActuatorToParameter(command.actuatorType),
      adjustment: command.value ? command.value / 100 : 0,
      intensity: 0.5
    };
    
    this.currentState.virtual = this.predictStateAfterAction(this.currentState.virtual, action);
  }

  private mapActuatorToParameter(actuatorType: string): string {
    const mapping: Record<string, string> = {
      'heater': 'temperature',
      'cooler': 'temperature',
      'humidifier': 'humidity',
      'dehumidifier': 'humidity',
      'co2_injector': 'co2Level',
      'lighting': 'lightIntensity'
    };
    return mapping[actuatorType] || 'none';
  }

  private async updateVirtualSimulation(): Promise<void> {
    // Run one step of virtual simulation
    const action = this.rlEngine.selectAction(this.currentState.virtual);
    this.currentState.virtual = this.predictStateAfterAction(this.currentState.virtual, action);
  }

  private async updatePlantMetrics(): Promise<void> {
    const state = this.currentState.realTime;
    
    this.currentState.plantMetrics = {
      healthScore: Math.max(0, 100 - state.stressLevel * 100),
      growthRate: state.stressLevel < 0.3 ? 1.0 : 0.5,
      stressLevel: state.stressLevel,
      biomass: state.biomass,
      yieldPrediction: state.biomass * 3.5 // Simplified yield prediction
    };
  }

  private updateSystemPerformance(): void {
    // Calculate resource usage based on current state and recent actuator commands
    const recentCommands = this.actuatorHistory.slice(-10);
    
    let energy = 0, water = 0, co2 = 0, nutrients = 0;
    
    recentCommands.forEach(command => {
      energy += this.calculateEnergyUsage({ type: 'environmental', parameter: 'temperature', adjustment: 0.1, intensity: 0.5, id: '' });
      water += this.calculateWaterUsage({ type: 'irrigation', parameter: 'soilMoisture', adjustment: 0.1, intensity: 0.5, id: '' });
      co2 += this.calculateCO2Usage({ type: 'environmental', parameter: 'co2Level', adjustment: 0.1, intensity: 0.5, id: '' });
      nutrients += this.calculateNutrientUsage({ type: 'nutrition', parameter: 'ec', adjustment: 0.1, intensity: 0.5, id: '' });
    });
    
    this.currentState.systemPerformance = {
      energyConsumption: energy,
      waterUsage: water,
      nutrientConsumption: nutrients,
      co2Usage: co2,
      efficiency: this.currentState.plantMetrics.healthScore / 100
    };
  }

  private calculateEnergyUsage(action: Action): number {
    if (action.type === 'lighting') return Math.abs(action.adjustment) * 50;
    if (action.type === 'environmental') return Math.abs(action.adjustment) * 20;
    return 0;
  }

  private calculateWaterUsage(action: Action): number {
    if (action.type === 'irrigation') return Math.abs(action.adjustment) * 10;
    return 0;
  }

  private calculateCO2Usage(action: Action): number {
    if (action.parameter === 'co2Level' && action.adjustment > 0) return action.adjustment * 5;
    return 0;
  }

  private calculateNutrientUsage(action: Action): number {
    if (action.type === 'nutrition') return Math.abs(action.adjustment) * 2;
    return 0;
  }

  private checkForAnomalies(reading: SensorReading): void {
    // Simple anomaly detection
    const thresholds = {
      temperature: { min: 15, max: 35 },
      humidity: { min: 30, max: 85 },
      co2: { min: 400, max: 1500 },
      ph: { min: 5.5, max: 7.0 },
      ec: { min: 1.0, max: 3.0 }
    };
    
    const threshold = thresholds[reading.sensorType as keyof typeof thresholds];
    if (threshold && (reading.value < threshold.min || reading.value > threshold.max)) {
      const anomaly = {
        type: 'sensor_out_of_range',
        severity: 'high',
        data: {
          sensorId: reading.sensorId,
          sensorType: reading.sensorType,
          value: reading.value,
          expected: threshold,
          timestamp: reading.timestamp
        }
      };
      
      this.callbacks.onAnomaly.forEach(callback => {
        try {
          callback(anomaly);
        } catch (error) {
          console.error('Error in anomaly callback:', error);
        }
      });
    }
  }

  public cleanup(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    this.predictionCache.clear();
  }
}

// Export singleton instance
export const greenhouseDigitalTwin = new GreenhouseDigitalTwin();