/**
 * Physics-Informed Reinforcement Learning Engine for Cultivation Optimization
 * Combines Q-Learning with greenhouse physics and economics optimization (Koidra-style)
 */

// Physics model for greenhouse behavior prediction
export interface GreenhousePhysicsModel {
  predictNextState(currentState: EnvironmentState, action: Action): EnvironmentState;
  validateAction(state: EnvironmentState, action: Action): { valid: boolean; reason?: string };
  calculateEnergyConsumption(state: EnvironmentState, action: Action): number;
  calculatePlantStress(state: EnvironmentState): number;
}

// Economics optimizer for profit maximization
export interface EconomicsOptimizer {
  calculateProfitImpact(state: EnvironmentState, action: Action): number;
  getMarketPrice(crop: string): number;
  calculateResourceCost(action: Action): number;
  optimizeForProfit(state: EnvironmentState, possibleActions: Action[]): Action[];
}

export interface EnvironmentState {
  // Environmental parameters
  temperature: number;
  humidity: number;
  co2Level: number;
  lightIntensity: number;
  lightSpectrum: {
    red: number;
    blue: number;
    green: number;
    farRed: number;
    uv: number;
  };
  vpd: number;
  soilMoisture: number;
  ph: number;
  ec: number;
  
  // Plant state indicators
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
  plantHeight: number;
  leafCount: number;
  biomass: number;
  stressLevel: number;
  
  // Time factors
  dayOfGrowth: number;
  timeOfDay: number;
  photoperiod: number;
}

export interface Action {
  id: string;
  type: 'environmental' | 'lighting' | 'irrigation' | 'nutrition';
  parameter: string;
  adjustment: number; // -1 to 1 normalized adjustment
  intensity: number; // 0 to 1 intensity of action
}

export interface Reward {
  immediate: number;
  growthRate: number;
  efficiency: number;
  quality: number;
  sustainability: number;
  total: number;
}

export interface QTableEntry {
  stateHash: string;
  actionId: string;
  qValue: number;
  visits: number;
  lastUpdated: Date;
}

export interface TrainingEpisode {
  id: string;
  startTime: Date;
  endTime?: Date;
  initialState: EnvironmentState;
  actions: Array<{
    action: Action;
    state: EnvironmentState;
    reward: Reward;
    nextState: EnvironmentState;
    timestamp: Date;
  }>;
  totalReward: number;
  episodeLength: number;
  averageReward: number;
}

export class ReinforcementLearningEngine {
  private qTable: Map<string, Map<string, number>>;
  private actionSpace: Action[];
  private learningRate: number;
  private discountFactor: number;
  private explorationRate: number;
  private explorationDecay: number;
  private minExplorationRate: number;
  private episodeHistory: TrainingEpisode[];
  private currentEpisode: TrainingEpisode | null;
  private physicsModel: GreenhousePhysicsModel;
  private economicsModel: EconomicsOptimizer;
  
  constructor(config: {
    learningRate?: number;
    discountFactor?: number;
    explorationRate?: number;
    explorationDecay?: number;
    minExplorationRate?: number;
  } = {}) {
    this.qTable = new Map();
    this.learningRate = config.learningRate || 0.1;
    this.discountFactor = config.discountFactor || 0.95;
    this.explorationRate = config.explorationRate || 0.9;
    this.explorationDecay = config.explorationDecay || 0.995;
    this.minExplorationRate = config.minExplorationRate || 0.01;
    this.episodeHistory = [];
    this.currentEpisode = null;
    
    // Initialize physics and economics models
    this.physicsModel = new SimpleGreenhousePhysics();
    this.economicsModel = new ProfitOptimizer();
    
    this.initializeActionSpace();
  }

  private initializeActionSpace(): void {
    this.actionSpace = [
      // Environmental controls
      { id: 'temp_increase', type: 'environmental', parameter: 'temperature', adjustment: 0.1, intensity: 0.5 },
      { id: 'temp_decrease', type: 'environmental', parameter: 'temperature', adjustment: -0.1, intensity: 0.5 },
      { id: 'humidity_increase', type: 'environmental', parameter: 'humidity', adjustment: 0.05, intensity: 0.5 },
      { id: 'humidity_decrease', type: 'environmental', parameter: 'humidity', adjustment: -0.05, intensity: 0.5 },
      { id: 'co2_increase', type: 'environmental', parameter: 'co2Level', adjustment: 0.1, intensity: 0.5 },
      { id: 'co2_decrease', type: 'environmental', parameter: 'co2Level', adjustment: -0.1, intensity: 0.5 },
      
      // Lighting controls
      { id: 'light_intensity_up', type: 'lighting', parameter: 'lightIntensity', adjustment: 0.1, intensity: 0.5 },
      { id: 'light_intensity_down', type: 'lighting', parameter: 'lightIntensity', adjustment: -0.1, intensity: 0.5 },
      { id: 'red_spectrum_up', type: 'lighting', parameter: 'red', adjustment: 0.1, intensity: 0.5 },
      { id: 'red_spectrum_down', type: 'lighting', parameter: 'red', adjustment: -0.1, intensity: 0.5 },
      { id: 'blue_spectrum_up', type: 'lighting', parameter: 'blue', adjustment: 0.1, intensity: 0.5 },
      { id: 'blue_spectrum_down', type: 'lighting', parameter: 'blue', adjustment: -0.1, intensity: 0.5 },
      { id: 'far_red_up', type: 'lighting', parameter: 'farRed', adjustment: 0.1, intensity: 0.5 },
      { id: 'far_red_down', type: 'lighting', parameter: 'farRed', adjustment: -0.1, intensity: 0.5 },
      
      // Irrigation controls
      { id: 'water_increase', type: 'irrigation', parameter: 'soilMoisture', adjustment: 0.1, intensity: 0.5 },
      { id: 'water_decrease', type: 'irrigation', parameter: 'soilMoisture', adjustment: -0.1, intensity: 0.5 },
      
      // Nutrition controls
      { id: 'ph_increase', type: 'nutrition', parameter: 'ph', adjustment: 0.1, intensity: 0.5 },
      { id: 'ph_decrease', type: 'nutrition', parameter: 'ph', adjustment: -0.1, intensity: 0.5 },
      { id: 'ec_increase', type: 'nutrition', parameter: 'ec', adjustment: 0.1, intensity: 0.5 },
      { id: 'ec_decrease', type: 'nutrition', parameter: 'ec', adjustment: -0.1, intensity: 0.5 },
      
      // No action
      { id: 'no_action', type: 'environmental', parameter: 'none', adjustment: 0, intensity: 0 }
    ];
  }

  private hashState(state: EnvironmentState): string {
    // Discretize continuous values for Q-table lookup
    const discretized = {
      temp: Math.round(state.temperature * 2) / 2, // 0.5°C precision
      humidity: Math.round(state.humidity * 10) / 10, // 0.1% precision
      co2: Math.round(state.co2Level / 50) * 50, // 50ppm precision
      light: Math.round(state.lightIntensity * 10) / 10,
      vpd: Math.round(state.vpd * 10) / 10,
      moisture: Math.round(state.soilMoisture * 10) / 10,
      ph: Math.round(state.ph * 10) / 10,
      ec: Math.round(state.ec * 10) / 10,
      stage: state.growthStage,
      day: Math.floor(state.dayOfGrowth / 7), // Weekly precision
      timeOfDay: Math.floor(state.timeOfDay / 4) * 4 // 4-hour precision
    };
    
    return JSON.stringify(discretized);
  }

  private calculateReward(
    state: EnvironmentState,
    action: Action,
    nextState: EnvironmentState
  ): Reward {
    let immediate = 0;
    let growthRate = 0;
    let efficiency = 0;
    let quality = 0;
    let sustainability = 0;

    // Growth rate reward (positive for growth increase)
    const growthChange = nextState.biomass - state.biomass;
    growthRate = Math.max(0, growthChange) * 10;

    // Efficiency reward (penalize excessive resource use)
    if (action.type === 'environmental') {
      efficiency = -Math.abs(action.adjustment) * 0.5;
    }

    // Quality reward (based on stress reduction)
    const stressReduction = state.stressLevel - nextState.stressLevel;
    quality = stressReduction * 5;

    // Sustainability reward (encourage balanced actions)
    sustainability = action.intensity < 0.7 ? 1 : -1;

    // Immediate reward for staying within optimal ranges
    const optimalRanges = this.getOptimalRanges(state.growthStage);
    immediate += this.calculateRangeReward(nextState.temperature, optimalRanges.temperature);
    immediate += this.calculateRangeReward(nextState.humidity, optimalRanges.humidity);
    immediate += this.calculateRangeReward(nextState.vpd, optimalRanges.vpd);
    immediate += this.calculateRangeReward(nextState.ph, optimalRanges.ph);

    const total = immediate + growthRate + efficiency + quality + sustainability;

    return {
      immediate,
      growthRate,
      efficiency,
      quality,
      sustainability,
      total
    };
  }

  private getOptimalRanges(stage: string) {
    const ranges = {
      seedling: {
        temperature: { min: 20, max: 25, optimal: 22.5 },
        humidity: { min: 65, max: 80, optimal: 72.5 },
        vpd: { min: 0.4, max: 0.8, optimal: 0.6 },
        ph: { min: 5.8, max: 6.2, optimal: 6.0 }
      },
      vegetative: {
        temperature: { min: 22, max: 28, optimal: 25 },
        humidity: { min: 55, max: 70, optimal: 62.5 },
        vpd: { min: 0.8, max: 1.2, optimal: 1.0 },
        ph: { min: 5.8, max: 6.2, optimal: 6.0 }
      },
      flowering: {
        temperature: { min: 20, max: 26, optimal: 23 },
        humidity: { min: 40, max: 55, optimal: 47.5 },
        vpd: { min: 1.0, max: 1.5, optimal: 1.25 },
        ph: { min: 6.0, max: 6.5, optimal: 6.2 }
      },
      harvest: {
        temperature: { min: 18, max: 22, optimal: 20 },
        humidity: { min: 30, max: 45, optimal: 37.5 },
        vpd: { min: 1.2, max: 2.0, optimal: 1.6 },
        ph: { min: 6.0, max: 6.5, optimal: 6.2 }
      }
    };

    return ranges[stage as keyof typeof ranges] || ranges.vegetative;
  }

  private calculateRangeReward(value: number, range: { min: number; max: number; optimal: number }): number {
    if (value >= range.min && value <= range.max) {
      // Within acceptable range, reward based on proximity to optimal
      const distanceFromOptimal = Math.abs(value - range.optimal);
      const maxDistance = Math.max(range.optimal - range.min, range.max - range.optimal);
      return 2 * (1 - distanceFromOptimal / maxDistance);
    } else {
      // Outside acceptable range, penalize based on distance
      const penalty = value < range.min ? range.min - value : value - range.max;
      return -penalty * 2;
    }
  }

  public selectAction(state: EnvironmentState): Action {
    // Physics-informed action selection (Koidra-style)
    const validActions = this.getPhysicsValidatedActions(state);
    const profitOptimizedActions = this.economicsModel.optimizeForProfit(state, validActions);
    
    const stateHash = this.hashState(state);
    
    // Epsilon-greedy exploration with physics constraints
    if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < this.explorationRate) {
      // Explore: random action from valid/profitable actions
      if (profitOptimizedActions.length > 0) {
        const randomIndex = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * profitOptimizedActions.length);
        return profitOptimizedActions[randomIndex];
      }
      return validActions[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * validActions.length)];
    } else {
      // Exploit: best known action from valid actions
      return this.getBestPhysicsInformedAction(stateHash, profitOptimizedActions);
    }
  }

  private getPhysicsValidatedActions(state: EnvironmentState): Action[] {
    return this.actionSpace.filter(action => {
      const validation = this.physicsModel.validateAction(state, action);
      return validation.valid;
    });
  }

  private getBestPhysicsInformedAction(stateHash: string, validActions: Action[]): Action {
    const stateActions = this.qTable.get(stateHash);
    
    if (!stateActions || stateActions.size === 0 || validActions.length === 0) {
      // No learned actions, return safest valid action
      return validActions[0] || this.actionSpace.find(a => a.id === 'no_action')!;
    }

    let bestAction = validActions[0];
    let bestQValue = -Infinity;

    for (const action of validActions) {
      const qValue = stateActions.get(action.id) || 0;
      if (qValue > bestQValue) {
        bestQValue = qValue;
        bestAction = action;
      }
    }

    return bestAction;
  }

  private getBestAction(stateHash: string): Action {
    const stateActions = this.qTable.get(stateHash);
    
    if (!stateActions || stateActions.size === 0) {
      // No learned actions for this state, return random action
      const randomIndex = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * this.actionSpace.length);
      return this.actionSpace[randomIndex];
    }

    let bestAction = this.actionSpace[0];
    let bestQValue = -Infinity;

    for (const action of this.actionSpace) {
      const qValue = stateActions.get(action.id) || 0;
      if (qValue > bestQValue) {
        bestQValue = qValue;
        bestAction = action;
      }
    }

    return bestAction;
  }

  public updateQValue(
    state: EnvironmentState,
    action: Action,
    reward: Reward,
    nextState: EnvironmentState
  ): void {
    const stateHash = this.hashState(state);
    const nextStateHash = this.hashState(nextState);

    // Initialize Q-table entries if they don't exist
    if (!this.qTable.has(stateHash)) {
      this.qTable.set(stateHash, new Map());
    }
    if (!this.qTable.has(nextStateHash)) {
      this.qTable.set(nextStateHash, new Map());
    }

    const stateActions = this.qTable.get(stateHash)!;
    const nextStateActions = this.qTable.get(nextStateHash)!;

    // Get current Q-value
    const currentQ = stateActions.get(action.id) || 0;

    // Find maximum Q-value for next state
    let maxNextQ = 0;
    for (const nextAction of this.actionSpace) {
      const nextQ = nextStateActions.get(nextAction.id) || 0;
      maxNextQ = Math.max(maxNextQ, nextQ);
    }

    // Q-learning update rule
    const newQ = currentQ + this.learningRate * (
      reward.total + this.discountFactor * maxNextQ - currentQ
    );

    stateActions.set(action.id, newQ);

    // Decay exploration rate
    this.explorationRate = Math.max(
      this.minExplorationRate,
      this.explorationRate * this.explorationDecay
    );
  }

  public startEpisode(initialState: EnvironmentState): string {
    const episodeId = `episode_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
    
    this.currentEpisode = {
      id: episodeId,
      startTime: new Date(),
      initialState: { ...initialState },
      actions: [],
      totalReward: 0,
      episodeLength: 0,
      averageReward: 0
    };

    return episodeId;
  }

  public addStep(
    state: EnvironmentState,
    action: Action,
    reward: Reward,
    nextState: EnvironmentState
  ): void {
    if (!this.currentEpisode) {
      throw new Error('No active episode. Call startEpisode() first.');
    }

    this.currentEpisode.actions.push({
      action: { ...action },
      state: { ...state },
      reward: { ...reward },
      nextState: { ...nextState },
      timestamp: new Date()
    });

    this.currentEpisode.totalReward += reward.total;
    this.currentEpisode.episodeLength++;
    this.currentEpisode.averageReward = this.currentEpisode.totalReward / this.currentEpisode.episodeLength;

    // Update Q-values
    this.updateQValue(state, action, reward, nextState);
  }

  public endEpisode(): TrainingEpisode {
    if (!this.currentEpisode) {
      throw new Error('No active episode to end.');
    }

    this.currentEpisode.endTime = new Date();
    this.episodeHistory.push({ ...this.currentEpisode });

    const completedEpisode = this.currentEpisode;
    this.currentEpisode = null;

    return completedEpisode;
  }

  public getTrainingStats() {
    const recentEpisodes = this.episodeHistory.slice(-100); // Last 100 episodes
    
    if (recentEpisodes.length === 0) {
      return {
        totalEpisodes: 0,
        averageReward: 0,
        bestReward: 0,
        explorationRate: this.explorationRate,
        qTableSize: this.qTable.size,
        convergenceRate: 0
      };
    }

    const totalReward = recentEpisodes.reduce((sum, ep) => sum + ep.totalReward, 0);
    const averageReward = totalReward / recentEpisodes.length;
    const bestReward = Math.max(...recentEpisodes.map(ep => ep.totalReward));

    // Calculate convergence rate (reward improvement trend)
    const half = Math.floor(recentEpisodes.length / 2);
    const firstHalfAvg = recentEpisodes.slice(0, half).reduce((sum, ep) => sum + ep.totalReward, 0) / half;
    const secondHalfAvg = recentEpisodes.slice(half).reduce((sum, ep) => sum + ep.totalReward, 0) / (recentEpisodes.length - half);
    const convergenceRate = secondHalfAvg > firstHalfAvg ? (secondHalfAvg - firstHalfAvg) / firstHalfAvg : 0;

    return {
      totalEpisodes: this.episodeHistory.length,
      averageReward,
      bestReward,
      explorationRate: this.explorationRate,
      qTableSize: this.qTable.size,
      convergenceRate,
      recentEpisodes: recentEpisodes.slice(-10) // Last 10 episodes for detailed view
    };
  }

  public exportModel(): string {
    const modelData = {
      qTable: Array.from(this.qTable.entries()).map(([state, actions]) => ({
        state,
        actions: Array.from(actions.entries())
      })),
      config: {
        learningRate: this.learningRate,
        discountFactor: this.discountFactor,
        explorationRate: this.explorationRate,
        explorationDecay: this.explorationDecay,
        minExplorationRate: this.minExplorationRate
      },
      episodeHistory: this.episodeHistory,
      actionSpace: this.actionSpace
    };

    return JSON.stringify(modelData, null, 2);
  }

  public importModel(modelJson: string): void {
    try {
      const modelData = JSON.parse(modelJson);
      
      // Restore Q-table
      this.qTable = new Map();
      for (const { state, actions } of modelData.qTable) {
        this.qTable.set(state, new Map(actions));
      }

      // Restore configuration
      if (modelData.config) {
        this.learningRate = modelData.config.learningRate;
        this.discountFactor = modelData.config.discountFactor;
        this.explorationRate = modelData.config.explorationRate;
        this.explorationDecay = modelData.config.explorationDecay;
        this.minExplorationRate = modelData.config.minExplorationRate;
      }

      // Restore episode history
      if (modelData.episodeHistory) {
        this.episodeHistory = modelData.episodeHistory;
      }

      // Restore action space
      if (modelData.actionSpace) {
        this.actionSpace = modelData.actionSpace;
      }
    } catch (error) {
      throw new Error(`Failed to import model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getRecommendations(state: EnvironmentState): Promise<Array<{
    action: Action;
    confidence: number;
    expectedReward: number;
    reasoning: string;
  }>> {
    const stateHash = this.hashState(state);
    const stateActions = this.qTable.get(stateHash);
    
    if (!stateActions || stateActions.size === 0) {
      return [{
        action: this.actionSpace.find(a => a.id === 'no_action')!,
        confidence: 0.1,
        expectedReward: 0,
        reasoning: 'No learned behavior for this state. Recommend no action until more training data is available.'
      }];
    }

    // Get top 3 actions with highest Q-values
    const sortedActions = this.actionSpace
      .map(action => ({
        action,
        qValue: stateActions.get(action.id) || 0
      }))
      .sort((a, b) => b.qValue - a.qValue)
      .slice(0, 3);

    // Use Claude to generate intelligent reasoning for each recommendation
    const recommendations = await Promise.all(
      sortedActions.map(async ({ action, qValue }) => {
        const confidence = Math.max(0, Math.min(1, (qValue + 10) / 20)); // Normalize to 0-1
        
        const reasoning = await this.generateClaudeReasoning(state, action, qValue);

        return {
          action,
          confidence,
          expectedReward: qValue,
          reasoning
        };
      })
    );

    return recommendations;
  }

  private async generateClaudeReasoning(
    state: EnvironmentState, 
    action: Action, 
    qValue: number
  ): Promise<string> {
    try {
      const prompt = `As an expert cultivation AI, analyze this reinforcement learning recommendation:

CURRENT PLANT STATE:
- Growth Stage: ${state.growthStage}
- Day of Growth: ${state.dayOfGrowth}
- Temperature: ${state.temperature}°C
- Humidity: ${state.humidity}%
- VPD: ${state.vpd} kPa
- Light Intensity: ${state.lightIntensity} PPFD
- pH: ${state.ph}
- EC: ${state.ec}
- Stress Level: ${(state.stressLevel * 100).toFixed(0)}%
- Biomass: ${state.biomass}g

RECOMMENDED ACTION:
- Type: ${action.type}
- Parameter: ${action.parameter}
- Adjustment: ${action.adjustment > 0 ? 'increase' : 'decrease'} by ${Math.abs(action.adjustment)}
- Q-Value: ${qValue.toFixed(2)}

TRAINING CONTEXT:
- Total Episodes: ${this.episodeHistory.length}
- Recent Performance: ${this.episodeHistory.length > 0 ? 'Learning from ' + this.episodeHistory.length + ' episodes' : 'Initial training phase'}

Provide a concise 1-2 sentence explanation of WHY this action is recommended based on:
1. Current plant physiology and growth stage
2. Environmental optimization principles
3. The learned Q-value indicating past success

Focus on the scientific rationale and expected plant response.`;

      const response = await fetch('/api/ai-assistant/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'reinforcement_learning_reasoning',
          maxTokens: 150
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get Claude reasoning');
      }

      const data = await response.json();
      return data.response || this.getFallbackReasoning(action, state);
      
    } catch (error) {
      console.error('Error generating Claude reasoning:', error);
      return this.getFallbackReasoning(action, state);
    }
  }

  private getFallbackReasoning(action: Action, state: EnvironmentState): string {
    let reasoning = `Based on ${this.episodeHistory.length} training episodes, `;
    
    if (action.type === 'environmental') {
      reasoning += `adjusting ${action.parameter} by ${action.adjustment > 0 ? 'increasing' : 'decreasing'} `;
    } else if (action.type === 'lighting') {
      reasoning += `modifying light ${action.parameter} `;
    } else if (action.type === 'irrigation') {
      reasoning += `adjusting irrigation ${action.parameter} `;
    } else if (action.type === 'nutrition') {
      reasoning += `changing nutrient ${action.parameter} `;
    }
    
    reasoning += `has shown positive results for similar growth conditions.`;
    return reasoning;
  }
}

// Simple Greenhouse Physics Model Implementation
class SimpleGreenhousePhysics implements GreenhousePhysicsModel {
  predictNextState(currentState: EnvironmentState, action: Action): EnvironmentState {
    const nextState = { ...currentState };
    
    // Apply action effects with physics-based constraints
    switch (action.parameter) {
      case 'temperature':
        // Temperature change with thermal inertia
        const tempChange = action.adjustment * 2; // Scale factor
        nextState.temperature = Math.max(10, Math.min(40, currentState.temperature + tempChange));
        
        // VPD adjusts with temperature
        nextState.vpd = this.calculateVPD(nextState.temperature, nextState.humidity);
        break;
        
      case 'humidity':
        // Humidity change affects VPD
        const humidityChange = action.adjustment * 5;
        nextState.humidity = Math.max(20, Math.min(90, currentState.humidity + humidityChange));
        nextState.vpd = this.calculateVPD(nextState.temperature, nextState.humidity);
        break;
        
      case 'lightIntensity':
        // Light intensity affects temperature slightly
        const lightChange = action.adjustment * 100;
        nextState.lightIntensity = Math.max(0, Math.min(1000, currentState.lightIntensity + lightChange));
        nextState.temperature += lightChange * 0.01; // Heat from lights
        break;
        
      case 'co2Level':
        // CO2 changes with ventilation
        const co2Change = action.adjustment * 200;
        nextState.co2Level = Math.max(400, Math.min(1500, currentState.co2Level + co2Change));
        break;
    }
    
    // Update plant stress based on environmental conditions
    nextState.stressLevel = this.calculatePlantStress(nextState);
    
    // Simulate plant growth
    if (nextState.stressLevel < 0.3) {
      nextState.biomass += 0.1; // Growth when stress is low
      nextState.plantHeight += 0.05;
    }
    
    return nextState;
  }
  
  validateAction(state: EnvironmentState, action: Action): { valid: boolean; reason?: string } {
    // Physics-based validation rules
    switch (action.parameter) {
      case 'temperature':
        const newTemp = state.temperature + (action.adjustment * 2);
        if (newTemp < 15 || newTemp > 35) {
          return { valid: false, reason: 'Temperature out of safe range (15-35°C)' };
        }
        break;
        
      case 'humidity':
        const newHumidity = state.humidity + (action.adjustment * 5);
        if (newHumidity < 30 || newHumidity > 85) {
          return { valid: false, reason: 'Humidity out of safe range (30-85%)' };
        }
        break;
        
      case 'lightIntensity':
        const newLight = state.lightIntensity + (action.adjustment * 100);
        if (newLight < 0 || newLight > 1200) {
          return { valid: false, reason: 'Light intensity out of range (0-1200 PPFD)' };
        }
        break;
        
      case 'co2Level':
        const newCO2 = state.co2Level + (action.adjustment * 200);
        if (newCO2 < 350 || newCO2 > 1800) {
          return { valid: false, reason: 'CO2 level out of safe range (350-1800 ppm)' };
        }
        break;
    }
    
    return { valid: true };
  }
  
  calculateEnergyConsumption(state: EnvironmentState, action: Action): number {
    let energy = 0;
    
    // Base energy consumption
    energy += state.lightIntensity * 0.1; // Lighting energy
    energy += Math.abs(state.temperature - 20) * 0.05; // Heating/cooling
    energy += state.co2Level > 800 ? 0.02 : 0; // CO2 injection
    
    // Additional energy for actions
    if (action.type === 'environmental') {
      energy += Math.abs(action.adjustment) * 0.1;
    } else if (action.type === 'lighting') {
      energy += Math.abs(action.adjustment) * 0.2;
    }
    
    return energy;
  }
  
  calculatePlantStress(state: EnvironmentState): number {
    let stress = 0;
    
    // Temperature stress
    const optimalTemp = this.getOptimalTemp(state.growthStage);
    stress += Math.abs(state.temperature - optimalTemp) * 0.05;
    
    // VPD stress
    const optimalVPD = this.getOptimalVPD(state.growthStage);
    stress += Math.abs(state.vpd - optimalVPD) * 0.3;
    
    // Light stress
    const optimalLight = this.getOptimalLight(state.growthStage);
    stress += Math.abs(state.lightIntensity - optimalLight) / optimalLight * 0.2;
    
    return Math.min(1, stress);
  }
  
  private calculateVPD(temp: number, humidity: number): number {
    // Simplified VPD calculation
    const satVP = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    const actualVP = satVP * (humidity / 100);
    return Math.max(0, satVP - actualVP);
  }
  
  private getOptimalTemp(stage: string): number {
    const temps = { seedling: 22, vegetative: 25, flowering: 23, harvest: 20 };
    return temps[stage as keyof typeof temps] || 24;
  }
  
  private getOptimalVPD(stage: string): number {
    const vpds = { seedling: 0.6, vegetative: 1.0, flowering: 1.2, harvest: 1.4 };
    return vpds[stage as keyof typeof vpds] || 1.0;
  }
  
  private getOptimalLight(stage: string): number {
    const lights = { seedling: 200, vegetative: 600, flowering: 800, harvest: 400 };
    return lights[stage as keyof typeof lights] || 500;
  }
}

// Profit Optimizer Implementation
class ProfitOptimizer implements EconomicsOptimizer {
  private marketPrices = {
    lettuce: 4.50, // $/kg
    tomato: 6.80,
    herbs: 12.00,
    microgreens: 25.00
  };
  
  private resourceCosts = {
    electricity: 0.12, // $/kWh
    co2: 0.50, // $/kg
    water: 0.001, // $/L
    nutrients: 0.10 // $/application
  };
  
  calculateProfitImpact(state: EnvironmentState, action: Action): number {
    // Calculate immediate cost
    const cost = this.calculateResourceCost(action);
    
    // Estimate yield impact (simplified)
    const stressBefore = state.stressLevel;
    const stressAfter = Math.max(0, stressBefore - 0.1); // Assume action reduces stress
    const yieldImpact = (stressBefore - stressAfter) * state.biomass * 2; // kg
    
    // Calculate revenue impact
    const revenue = yieldImpact * this.getMarketPrice('lettuce'); // Default crop
    
    return revenue - cost;
  }
  
  getMarketPrice(crop: string): number {
    return this.marketPrices[crop as keyof typeof this.marketPrices] || 5.0;
  }
  
  calculateResourceCost(action: Action): number {
    let cost = 0;
    
    switch (action.type) {
      case 'environmental':
        if (action.parameter === 'temperature') {
          cost = Math.abs(action.adjustment) * 0.5; // Heating/cooling cost
        } else if (action.parameter === 'co2Level') {
          cost = action.adjustment > 0 ? action.adjustment * 0.1 : 0;
        }
        break;
        
      case 'lighting':
        cost = Math.abs(action.adjustment) * 0.02; // Electricity cost
        break;
        
      case 'irrigation':
        cost = Math.abs(action.adjustment) * 0.01; // Water cost
        break;
        
      case 'nutrition':
        cost = Math.abs(action.adjustment) * 0.05; // Nutrient cost
        break;
    }
    
    return cost;
  }
  
  optimizeForProfit(state: EnvironmentState, possibleActions: Action[]): Action[] {
    return possibleActions
      .map(action => ({
        action,
        profitImpact: this.calculateProfitImpact(state, action)
      }))
      .filter(item => item.profitImpact >= 0) // Only profitable actions
      .sort((a, b) => b.profitImpact - a.profitImpact) // Sort by profit
      .slice(0, 5) // Top 5 most profitable
      .map(item => item.action);
  }
}