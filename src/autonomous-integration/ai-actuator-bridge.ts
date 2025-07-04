/**
 * AI-Actuator Integration Bridge
 * Connects digital twin AI recommendations to physical actuator control
 */

import { GreenhouseDigitalTwin, DigitalTwinState } from '../digital-twin/greenhouse-digital-twin';
import { AutonomousActuatorAPI, ActuatorCommand } from '../actuator-control/autonomous-actuator-api';
import { PlantVisionAI, PlantAnalysis } from '../plant-vision-ai';
import { ClaudeAnomalyDetector, AnomalyData } from '../ai-analysis/claude-anomaly-detector';
import { ReinforcementLearningEngine, Action, EnvironmentState } from '../reinforcement-learning/rl-engine';

export interface AIDecision {
  id: string;
  timestamp: Date;
  source: 'rl_engine' | 'anomaly_detector' | 'plant_vision' | 'user_override';
  confidence: number;
  reasoning: string;
  recommendations: Array<{
    action: Action;
    expectedOutcome: EnvironmentState;
    priority: 'low' | 'normal' | 'high' | 'emergency';
    timeToEffect: number; // minutes
  }>;
  plantContext?: PlantAnalysis;
  environmentalContext?: EnvironmentState;
}

export interface ExecutionResult {
  decisionId: string;
  executedCommands: ActuatorCommand[];
  rejectedCommands: Array<{ command: ActuatorCommand; reason: string }>;
  executionTime: number;
  success: boolean;
  errors: string[];
}

export interface AutonomousControlConfig {
  enableAIControl: boolean;
  interventionThreshold: number; // 0-1, when to intervene
  maxActionsPerCycle: number;
  decisionInterval: number; // seconds
  emergencyResponseEnabled: boolean;
  plantVisionIntegration: boolean;
  anomalyDetectionEnabled: boolean;
  learningEnabled: boolean;
}

export class AIActuatorBridge {
  private digitalTwin: GreenhouseDigitalTwin;
  private actuatorAPI: AutonomousActuatorAPI;
  private plantVision: PlantVisionAI;
  private anomalyDetector: ClaudeAnomalyDetector;
  private rlEngine: ReinforcementLearningEngine;
  
  private config: AutonomousControlConfig;
  private isRunning: boolean = false;
  private decisionHistory: AIDecision[] = [];
  private executionHistory: ExecutionResult[] = [];
  private controlLoop: NodeJS.Timeout | null = null;
  
  private callbacks: {
    onDecision: ((decision: AIDecision) => void)[];
    onExecution: ((result: ExecutionResult) => void)[];
    onAnomaly: ((anomaly: AnomalyData) => void)[];
    onEmergency: ((reason: string) => void)[];
  };

  constructor(
    digitalTwin: GreenhouseDigitalTwin,
    actuatorAPI: AutonomousActuatorAPI,
    plantVision: PlantVisionAI,
    config: Partial<AutonomousControlConfig> = {}
  ) {
    this.digitalTwin = digitalTwin;
    this.actuatorAPI = actuatorAPI;
    this.plantVision = plantVision;
    this.anomalyDetector = new ClaudeAnomalyDetector();
    this.rlEngine = new ReinforcementLearningEngine();
    
    this.config = {
      enableAIControl: true,
      interventionThreshold: 0.7,
      maxActionsPerCycle: 3,
      decisionInterval: 30, // 30 seconds
      emergencyResponseEnabled: true,
      plantVisionIntegration: true,
      anomalyDetectionEnabled: true,
      learningEnabled: true,
      ...config
    };
    
    this.callbacks = {
      onDecision: [],
      onExecution: [],
      onAnomaly: [],
      onEmergency: []
    };
    
    this.setupEventListeners();
  }

  // Setup event listeners for all AI systems
  private setupEventListeners(): void {
    // Digital twin anomaly detection
    this.digitalTwin.onAnomaly((anomaly) => {
      if (this.config.anomalyDetectionEnabled) {
        this.handleAnomaly(anomaly);
      }
    });
    
    // Digital twin state updates
    this.digitalTwin.onStateUpdate((state) => {
      if (this.config.enableAIControl && this.isRunning) {
        this.evaluateIntervention(state);
      }
    });
    
    // Actuator system emergency stop
    this.actuatorAPI.getSystemStatus();
  }

  // Start autonomous control system
  public async startAutonomousControl(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Initialize all AI systems
    await this.initializeAISystems();
    
    // Start main control loop
    this.controlLoop = setInterval(async () => {
      await this.executeControlCycle();
    }, this.config.decisionInterval * 1000);
    
  }

  // Stop autonomous control
  public stopAutonomousControl(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.controlLoop) {
      clearInterval(this.controlLoop);
      this.controlLoop = null;
    }
    
  }

  // Initialize AI systems
  private async initializeAISystems(): Promise<void> {
    // Load any pre-trained models
    // Start digital twin real-time updates
    // Initialize plant vision AI
  }

  // Main control cycle
  private async executeControlCycle(): Promise<void> {
    if (!this.config.enableAIControl || !this.isRunning) return;
    
    try {
      const startTime = Date.now();
      
      // Get current system state
      const digitalTwinState = this.digitalTwin.getCurrentState();
      const actuatorStatus = this.actuatorAPI.getSystemStatus();
      
      // Skip if actuator system is in emergency stop
      if (actuatorStatus.emergencyStop) {
        return;
      }
      
      // Generate AI decision
      const decision = await this.generateAIDecision(digitalTwinState);
      
      if (decision.recommendations.length === 0) {
        return; // No action needed
      }
      
      // Execute decision
      const result = await this.executeAIDecision(decision);
      
      // Record results
      this.decisionHistory.push(decision);
      this.executionHistory.push(result);
      
      // Limit history size
      if (this.decisionHistory.length > 1000) {
        this.decisionHistory = this.decisionHistory.slice(-500);
      }
      if (this.executionHistory.length > 1000) {
        this.executionHistory = this.executionHistory.slice(-500);
      }
      
      // Notify callbacks
      this.callbacks.onDecision.forEach(cb => cb(decision));
      this.callbacks.onExecution.forEach(cb => cb(result));
      
      // Learn from results if enabled
      if (this.config.learningEnabled) {
        await this.updateLearningModels(decision, result, digitalTwinState);
      }
      
      
    } catch (error) {
      console.error('Error in control cycle:', error);
    }
  }

  // Generate AI decision based on current state
  private async generateAIDecision(digitalTwinState: DigitalTwinState): Promise<AIDecision> {
    const decisionId = `decision_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
    
    // Get RL engine recommendations
    const rlRecommendations = await this.rlEngine.getRecommendations(digitalTwinState.realTime);
    
    // Get plant vision analysis if available
    let plantAnalysis: PlantAnalysis | undefined;
    if (this.config.plantVisionIntegration) {
      // In production, this would analyze recent camera captures
      plantAnalysis = await this.getMockPlantAnalysis();
    }
    
    // Combine and prioritize recommendations
    const recommendations = await this.combineRecommendations(
      rlRecommendations,
      digitalTwinState,
      plantAnalysis
    );
    
    // Calculate overall confidence
    const confidence = recommendations.length > 0 
      ? recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length
      : 0;
    
    return {
      id: decisionId,
      timestamp: new Date(),
      source: 'rl_engine',
      confidence,
      reasoning: this.generateDecisionReasoning(recommendations, digitalTwinState),
      recommendations: recommendations.map(rec => ({
        action: rec.action,
        expectedOutcome: digitalTwinState.predicted, // Use predicted state
        priority: this.calculateActionPriority(rec.action, plantAnalysis),
        timeToEffect: this.estimateTimeToEffect(rec.action)
      })),
      plantContext: plantAnalysis,
      environmentalContext: digitalTwinState.realTime
    };
  }

  // Combine recommendations from different AI sources
  private async combineRecommendations(
    rlRecommendations: Array<{
      action: Action;
      confidence: number;
      reasoning: string;
    }>,
    digitalTwinState: DigitalTwinState,
    plantAnalysis?: PlantAnalysis
  ): Promise<Array<{
    action: Action;
    confidence: number;
    reasoning: string;
  }>> {
    let combinedRecommendations = [...rlRecommendations];
    
    // Add plant vision recommendations
    if (plantAnalysis && this.config.plantVisionIntegration) {
      const visionRecommendations = this.generateVisionBasedRecommendations(plantAnalysis);
      combinedRecommendations.push(...visionRecommendations);
    }
    
    // Filter out low-confidence recommendations
    combinedRecommendations = combinedRecommendations.filter(rec => 
      rec.confidence >= this.config.interventionThreshold
    );
    
    // Remove duplicates and conflicts
    combinedRecommendations = this.resolveConflictingRecommendations(combinedRecommendations);
    
    // Limit to max actions per cycle
    combinedRecommendations = combinedRecommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.config.maxActionsPerCycle);
    
    return combinedRecommendations;
  }

  // Generate recommendations based on plant vision analysis
  private generateVisionBasedRecommendations(plantAnalysis: PlantAnalysis): Array<{
    action: Action;
    confidence: number;
    reasoning: string;
  }> {
    const recommendations: Array<{
      action: Action;
      confidence: number;
      reasoning: string;
    }> = [];
    
    // Check for nutrient deficiencies
    if (plantAnalysis.advancedPhenotyping) {
      const nutrientScores = plantAnalysis.advancedPhenotyping.nutrientDeficiencyScore;
      
      // Nitrogen deficiency
      if (nutrientScores.nitrogen > 0.6) {
        recommendations.push({
          action: {
            id: 'increase_nitrogen',
            type: 'nutrition',
            parameter: 'ec',
            adjustment: 0.2,
            intensity: 0.7
          },
          confidence: 0.8,
          reasoning: `Plant vision detected nitrogen deficiency (score: ${nutrientScores.nitrogen.toFixed(2)})`
        });
      }
      
      // Light stress
      if (plantAnalysis.advancedPhenotyping.environmentalResponse.lightSaturation) {
        recommendations.push({
          action: {
            id: 'reduce_light',
            type: 'lighting',
            parameter: 'lightIntensity',
            adjustment: -0.1,
            intensity: 0.6
          },
          confidence: 0.75,
          reasoning: 'Plant vision detected light saturation stress'
        });
      }
    }
    
    return recommendations;
  }

  // Resolve conflicting recommendations
  private resolveConflictingRecommendations(recommendations: Array<{
    action: Action;
    confidence: number;
    reasoning: string;
  }>): Array<{
    action: Action;
    confidence: number;
    reasoning: string;
  }> {
    const parameterGroups = new Map<string, Array<{
      action: Action;
      confidence: number;
      reasoning: string;
    }>>();
    
    // Group by parameter
    recommendations.forEach(rec => {
      const key = rec.action.parameter;
      if (!parameterGroups.has(key)) {
        parameterGroups.set(key, []);
      }
      parameterGroups.get(key)!.push(rec);
    });
    
    // Keep highest confidence recommendation for each parameter
    const resolved: Array<{
      action: Action;
      confidence: number;
      reasoning: string;
    }> = [];
    
    parameterGroups.forEach(group => {
      const best = group.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      resolved.push(best);
    });
    
    return resolved;
  }

  // Execute AI decision
  private async executeAIDecision(decision: AIDecision): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Convert recommendations to actuator format
      const recommendationsForActuator = decision.recommendations.map(rec => ({
        action: rec.action,
        confidence: decision.confidence,
        reasoning: decision.reasoning,
        expectedOutcome: rec.expectedOutcome
      }));
      
      // Send to actuator API
      const result = await this.actuatorAPI.processAIRecommendations(
        recommendationsForActuator,
        decision.environmentalContext!,
        decision.plantContext
      );
      
      return {
        decisionId: decision.id,
        executedCommands: result.accepted,
        rejectedCommands: result.rejected,
        executionTime: Date.now() - startTime,
        success: result.accepted.length > 0,
        errors: result.rejected.map(r => r.reason)
      };
      
    } catch (error) {
      return {
        decisionId: decision.id,
        executedCommands: [],
        rejectedCommands: [],
        executionTime: Date.now() - startTime,
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Handle anomaly detection
  private async handleAnomaly(anomaly: any): Promise<void> {
    
    // Emergency response for critical anomalies
    if (anomaly.severity === 'critical' && this.config.emergencyResponseEnabled) {
      await this.handleEmergency(`Critical anomaly: ${anomaly.type}`);
      return;
    }
    
    // Generate corrective action for non-critical anomalies
    if (anomaly.severity === 'high') {
      const correctiveDecision = await this.generateCorrectiveDecision(anomaly);
      if (correctiveDecision) {
        await this.executeAIDecision(correctiveDecision);
      }
    }
    
    // Notify callbacks
    this.callbacks.onAnomaly.forEach(cb => cb(anomaly));
  }

  // Handle emergency situations
  private async handleEmergency(reason: string): Promise<void> {
    
    // Stop autonomous control
    this.stopAutonomousControl();
    
    // Activate emergency stop on actuators
    this.actuatorAPI.emergencyStop();
    
    // Notify callbacks
    this.callbacks.onEmergency.forEach(cb => cb(reason));
  }

  // Generate corrective decision for anomalies
  private async generateCorrectiveDecision(anomaly: any): Promise<AIDecision | null> {
    // Simple corrective actions based on anomaly type
    const corrections: Record<string, Action> = {
      'temperature_high': {
        id: 'emergency_cooling',
        type: 'environmental',
        parameter: 'temperature',
        adjustment: -0.3,
        intensity: 0.9
      },
      'humidity_low': {
        id: 'emergency_humidify',
        type: 'environmental',
        parameter: 'humidity',
        adjustment: 0.2,
        intensity: 0.8
      }
    };
    
    const correction = corrections[anomaly.type];
    if (!correction) return null;
    
    return {
      id: `emergency_${Date.now()}`,
      timestamp: new Date(),
      source: 'anomaly_detector',
      confidence: 0.9,
      reasoning: `Emergency correction for ${anomaly.type}`,
      recommendations: [{
        action: correction,
        expectedOutcome: this.digitalTwin.getCurrentState().realTime,
        priority: 'emergency',
        timeToEffect: 5
      }]
    };
  }

  // Update learning models with execution results
  private async updateLearningModels(
    decision: AIDecision,
    result: ExecutionResult,
    initialState: DigitalTwinState
  ): Promise<void> {
    // Update RL engine with reward based on success
    for (const rec of decision.recommendations) {
      const reward = this.calculateReward(result, initialState);
      
      // Would update RL engine with actual state transition and reward
      // this.rlEngine.updateQValue(initialState.realTime, rec.action, reward, newState);
    }
  }

  // Calculate reward for learning
  private calculateReward(result: ExecutionResult, initialState: DigitalTwinState): any {
    let reward = result.success ? 5 : -5;
    
    // Bonus for successful execution without errors
    if (result.success && result.errors.length === 0) {
      reward += 2;
    }
    
    // Penalty for rejected commands
    reward -= result.rejectedCommands.length;
    
    return {
      immediate: reward,
      total: reward,
      growthRate: 0,
      efficiency: result.success ? 1 : -1,
      quality: 0,
      sustainability: 0
    };
  }

  // Helper methods
  private calculateActionPriority(action: Action, plantAnalysis?: PlantAnalysis): 'low' | 'normal' | 'high' | 'emergency' {
    if (plantAnalysis?.healthScore && plantAnalysis.healthScore < 60) return 'emergency';
    if (action.intensity > 0.8) return 'high';
    if (action.intensity > 0.5) return 'normal';
    return 'low';
  }

  private estimateTimeToEffect(action: Action): number {
    const timeMap: Record<string, number> = {
      'temperature': 15,
      'humidity': 20,
      'lightIntensity': 1,
      'co2Level': 5
    };
    return timeMap[action.parameter] || 10;
  }

  private generateDecisionReasoning(recommendations: any[], state: DigitalTwinState): string {
    if (recommendations.length === 0) return 'No intervention needed';
    
    const actions = recommendations.map(r => r.action.parameter).join(', ');
    return `AI recommends adjusting ${actions} based on current plant conditions and environmental analysis`;
  }

  private async getMockPlantAnalysis(): Promise<PlantAnalysis> {
    // Mock plant analysis for demo
    return {
      imageId: 'mock_image',
      timestamp: new Date(),
      healthScore: 85,
      growthStage: 'vegetative',
      canopyMetrics: {
        coverage: 75,
        height: 18,
        density: 0.8,
        color: { hue: 120, saturation: 0.8, brightness: 0.7 }
      },
      advancedPhenotyping: {
        leafAreaIndex: 3.2,
        biomassEstimate: 85,
        nodeCount: 12,
        leafWidth: 5.2,
        leafLength: 9.1,
        stemDiameter: 4.5,
        internodalLength: 3.1,
        chlorophyllIndex: 42,
        waterStressIndex: 0.2,
        nutrientDeficiencyScore: {
          nitrogen: 0.1,
          phosphorus: 0.05,
          potassium: 0.08,
          magnesium: 0.03,
          iron: 0.02
        },
        developmentalMetrics: {
          daysToFlower: 18,
          harvestReadiness: 0.3,
          yieldPotential: 220,
          qualityScore: 88
        },
        environmentalResponse: {
          lightSaturation: false,
          temperatureStress: 'optimal',
          vpgStress: 'optimal',
          rootZoneHealth: 0.9
        }
      },
      detectedIssues: [],
      recommendations: []
    };
  }

  // Evaluate if intervention is needed
  private evaluateIntervention(state: DigitalTwinState): void {
    // Check if plant metrics indicate intervention needed
    if (state.plantMetrics.healthScore < 70) {
    }
    
    if (state.plantMetrics.stressLevel > 0.6) {
    }
  }

  // Event handlers
  public onDecision(callback: (decision: AIDecision) => void): void {
    this.callbacks.onDecision.push(callback);
  }

  public onExecution(callback: (result: ExecutionResult) => void): void {
    this.callbacks.onExecution.push(callback);
  }

  public onAnomaly(callback: (anomaly: AnomalyData) => void): void {
    this.callbacks.onAnomaly.push(callback);
  }

  public onEmergency(callback: (reason: string) => void): void {
    this.callbacks.onEmergency.push(callback);
  }

  // Get system status
  public getSystemStatus(): {
    autonomous: boolean;
    lastDecision?: Date;
    decisionCount: number;
    executionCount: number;
    successRate: number;
    config: AutonomousControlConfig;
  } {
    const successfulExecutions = this.executionHistory.filter(r => r.success).length;
    const successRate = this.executionHistory.length > 0 
      ? successfulExecutions / this.executionHistory.length 
      : 0;

    return {
      autonomous: this.isRunning,
      lastDecision: this.decisionHistory.length > 0 
        ? this.decisionHistory[this.decisionHistory.length - 1].timestamp 
        : undefined,
      decisionCount: this.decisionHistory.length,
      executionCount: this.executionHistory.length,
      successRate,
      config: this.config
    };
  }

  // Update configuration
  public updateConfig(newConfig: Partial<AutonomousControlConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export convenience function to create integrated system
export function createAutonomousSystem(): AIActuatorBridge {
  const digitalTwin = new GreenhouseDigitalTwin();
  const actuatorAPI = new AutonomousActuatorAPI();
  const plantVision = new PlantVisionAI();
  
  return new AIActuatorBridge(digitalTwin, actuatorAPI, plantVision);
}