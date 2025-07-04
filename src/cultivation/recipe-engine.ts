// Automated Cultivation Recipe Engine
// Manages cultivation recipes with automated environmental controls

import { EventEmitter } from 'events';
import { prisma } from '@/lib/db';

export interface RecipeStage {
  id: string;
  name: string;
  duration: number; // days
  order: number;
  environmental: {
    temperature: {
      day: { min: number; max: number; optimal: number };
      night: { min: number; max: number; optimal: number };
    };
    humidity: {
      day: { min: number; max: number; optimal: number };
      night: { min: number; max: number; optimal: number };
    };
    co2: {
      day: { min: number; max: number; optimal: number };
      night: { min: number; max: number; optimal: number };
    };
    vpd: {
      day: { min: number; max: number; optimal: number };
      night: { min: number; max: number; optimal: number };
    };
    light: {
      photoperiod: number; // hours of light
      intensity: number; // PPFD
      spectrum: {
        red: number;
        blue: number;
        white: number;
        farRed: number;
        uv: number;
      };
      sunrise: number; // minutes
      sunset: number; // minutes
    };
  };
  irrigation: {
    frequency: 'continuous' | 'hourly' | 'daily' | 'custom';
    customSchedule?: string[]; // times if custom
    duration: number; // minutes per irrigation
    ec: { min: number; max: number; optimal: number };
    ph: { min: number; max: number; optimal: number };
    nutrients: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
      calcium: number;
      magnesium: number;
      sulfur: number;
      micronutrients: Record<string, number>;
    };
  };
  automation: {
    adjustTemperature: boolean;
    adjustHumidity: boolean;
    adjustCO2: boolean;
    adjustLight: boolean;
    adjustIrrigation: boolean;
    notifyOnDeviation: boolean;
    autoCorrectDeviation: boolean;
    maxDeviationPercent: number;
  };
}

export interface CultivationRecipe {
  id: string;
  name: string;
  description: string;
  strainId?: string;
  strainName?: string;
  category: 'indica' | 'sativa' | 'hybrid' | 'autoflower' | 'custom';
  totalDuration: number; // days
  stages: RecipeStage[];
  metadata: {
    author: string;
    version: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    notes: string;
    expectedYield: {
      min: number; // g/plant
      max: number;
      average: number;
    };
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    tested: boolean;
    successRate?: number;
  };
}

export interface RecipeExecution {
  id: string;
  recipeId: string;
  projectId: string;
  roomId: string;
  startDate: Date;
  currentStageId: string;
  currentDay: number;
  status: 'active' | 'paused' | 'completed' | 'aborted';
  deviations: Deviation[];
  adjustments: Adjustment[];
  notes: Note[];
}

export interface Deviation {
  id: string;
  timestamp: Date;
  parameter: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolution?: string;
}

export interface Adjustment {
  id: string;
  timestamp: Date;
  parameter: string;
  oldValue: number;
  newValue: number;
  reason: string;
  automatic: boolean;
}

export interface Note {
  id: string;
  timestamp: Date;
  author: string;
  content: string;
  type: 'observation' | 'issue' | 'adjustment' | 'general';
}

export class RecipeEngine extends EventEmitter {
  private activeExecutions: Map<string, RecipeExecution> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startMonitoring();
  }

  // Create a new recipe
  async createRecipe(recipe: Omit<CultivationRecipe, 'id'>): Promise<CultivationRecipe> {
    const newRecipe: CultivationRecipe = {
      ...recipe,
      id: `recipe_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      metadata: {
        ...recipe.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    // Validate recipe stages
    this.validateRecipe(newRecipe);

    // Save to database
    await this.saveRecipe(newRecipe);

    this.emit('recipe:created', newRecipe);
    return newRecipe;
  }

  // Start executing a recipe
  async startRecipe(
    recipeId: string, 
    projectId: string, 
    roomId: string
  ): Promise<RecipeExecution> {
    const recipe = await this.getRecipe(recipeId);
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    const execution: RecipeExecution = {
      id: `exec_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      recipeId,
      projectId,
      roomId,
      startDate: new Date(),
      currentStageId: recipe.stages[0].id,
      currentDay: 1,
      status: 'active',
      deviations: [],
      adjustments: [],
      notes: []
    };

    this.activeExecutions.set(execution.id, execution);
    
    // Apply initial stage settings
    await this.applyStageSettings(execution, recipe.stages[0]);

    this.emit('recipe:started', { execution, recipe });
    return execution;
  }

  // Monitor active recipe executions
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      for (const [executionId, execution] of this.activeExecutions) {
        if (execution.status !== 'active') continue;

        try {
          await this.monitorExecution(execution);
        } catch (error) {
          console.error(`Error monitoring execution ${executionId}:`, error);
        }
      }
    }, 60000); // Check every minute
  }

  // Monitor a single execution
  private async monitorExecution(execution: RecipeExecution): Promise<void> {
    const recipe = await this.getRecipe(execution.recipeId);
    if (!recipe) return;

    const currentStage = recipe.stages.find(s => s.id === execution.currentStageId);
    if (!currentStage) return;

    // Check if we need to advance to next stage
    const stageDay = this.calculateStageDay(execution, recipe);
    if (stageDay > currentStage.duration) {
      await this.advanceStage(execution, recipe);
      return;
    }

    // Get current environmental readings
    const readings = await this.getCurrentReadings(execution.roomId);

    // Check for deviations
    const deviations = this.checkDeviations(currentStage, readings);
    
    for (const deviation of deviations) {
      // Log deviation
      execution.deviations.push(deviation);
      
      // Emit alert
      this.emit('recipe:deviation', {
        execution,
        stage: currentStage,
        deviation
      });

      // Auto-correct if enabled
      if (currentStage.automation.autoCorrectDeviation) {
        await this.autoCorrectDeviation(execution, currentStage, deviation);
      }
    }

    // Update execution
    this.activeExecutions.set(execution.id, execution);
  }

  // Calculate current day within stage
  private calculateStageDay(execution: RecipeExecution, recipe: CultivationRecipe): number {
    const totalDays = Math.floor(
      (Date.now() - execution.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    let dayCount = totalDays;
    for (const stage of recipe.stages) {
      if (stage.id === execution.currentStageId) {
        return dayCount;
      }
      dayCount -= stage.duration;
    }

    return 1;
  }

  // Advance to next stage
  private async advanceStage(
    execution: RecipeExecution, 
    recipe: CultivationRecipe
  ): Promise<void> {
    const currentIndex = recipe.stages.findIndex(s => s.id === execution.currentStageId);
    if (currentIndex === -1 || currentIndex === recipe.stages.length - 1) {
      // Recipe completed
      execution.status = 'completed';
      this.emit('recipe:completed', { execution, recipe });
      return;
    }

    const nextStage = recipe.stages[currentIndex + 1];
    execution.currentStageId = nextStage.id;
    execution.currentDay = Math.floor(
      (Date.now() - execution.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    // Apply new stage settings
    await this.applyStageSettings(execution, nextStage);

    this.emit('recipe:stage-advanced', {
      execution,
      previousStage: recipe.stages[currentIndex],
      newStage: nextStage
    });
  }

  // Apply stage environmental settings
  private async applyStageSettings(
    execution: RecipeExecution,
    stage: RecipeStage
  ): Promise<void> {
    const commands = [];

    // Temperature control
    if (stage.automation.adjustTemperature) {
      commands.push({
        type: 'temperature',
        dayTarget: stage.environmental.temperature.day.optimal,
        nightTarget: stage.environmental.temperature.night.optimal
      });
    }

    // Humidity control
    if (stage.automation.adjustHumidity) {
      commands.push({
        type: 'humidity',
        dayTarget: stage.environmental.humidity.day.optimal,
        nightTarget: stage.environmental.humidity.night.optimal
      });
    }

    // CO2 control
    if (stage.automation.adjustCO2) {
      commands.push({
        type: 'co2',
        dayTarget: stage.environmental.co2.day.optimal,
        nightTarget: stage.environmental.co2.night.optimal
      });
    }

    // Light control
    if (stage.automation.adjustLight) {
      commands.push({
        type: 'light',
        photoperiod: stage.environmental.light.photoperiod,
        intensity: stage.environmental.light.intensity,
        spectrum: stage.environmental.light.spectrum
      });
    }

    // Irrigation control
    if (stage.automation.adjustIrrigation) {
      commands.push({
        type: 'irrigation',
        schedule: stage.irrigation.frequency,
        duration: stage.irrigation.duration,
        ec: stage.irrigation.ec.optimal,
        ph: stage.irrigation.ph.optimal
      });
    }

    // Send commands to control system
    for (const command of commands) {
      await this.sendControlCommand(execution.roomId, command);
      
      // Log adjustment
      execution.adjustments.push({
        id: `adj_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        parameter: command.type,
        oldValue: 0, // Would get from current readings
        newValue: command.dayTarget || command.intensity || 0,
        reason: `Stage change to ${stage.name}`,
        automatic: true
      });
    }

    this.emit('recipe:settings-applied', { execution, stage, commands });
  }

  // Check for deviations from recipe
  private checkDeviations(
    stage: RecipeStage,
    readings: any
  ): Deviation[] {
    const deviations: Deviation[] = [];
    const isDay = this.isDaytime();

    // Temperature check
    const tempRange = isDay ? stage.environmental.temperature.day : stage.environmental.temperature.night;
    if (readings.temperature < tempRange.min || readings.temperature > tempRange.max) {
      deviations.push({
        id: `dev_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        parameter: 'temperature',
        expectedValue: tempRange.optimal,
        actualValue: readings.temperature,
        deviation: Math.abs(readings.temperature - tempRange.optimal),
        severity: this.calculateSeverity(readings.temperature, tempRange),
        resolved: false
      });
    }

    // Humidity check
    const humidityRange = isDay ? stage.environmental.humidity.day : stage.environmental.humidity.night;
    if (readings.humidity < humidityRange.min || readings.humidity > humidityRange.max) {
      deviations.push({
        id: `dev_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        parameter: 'humidity',
        expectedValue: humidityRange.optimal,
        actualValue: readings.humidity,
        deviation: Math.abs(readings.humidity - humidityRange.optimal),
        severity: this.calculateSeverity(readings.humidity, humidityRange),
        resolved: false
      });
    }

    // Add more parameter checks...

    return deviations;
  }

  // Calculate deviation severity
  private calculateSeverity(
    value: number,
    range: { min: number; max: number; optimal: number }
  ): 'low' | 'medium' | 'high' | 'critical' {
    const deviation = Math.min(
      Math.abs(value - range.min),
      Math.abs(value - range.max)
    );
    const rangeSize = range.max - range.min;
    const deviationPercent = (deviation / rangeSize) * 100;

    if (deviationPercent < 10) return 'low';
    if (deviationPercent < 20) return 'medium';
    if (deviationPercent < 30) return 'high';
    return 'critical';
  }

  // Auto-correct deviation
  private async autoCorrectDeviation(
    execution: RecipeExecution,
    stage: RecipeStage,
    deviation: Deviation
  ): Promise<void> {
    const command = {
      type: deviation.parameter,
      target: deviation.expectedValue,
      priority: deviation.severity === 'critical' ? 'high' : 'normal'
    };

    await this.sendControlCommand(execution.roomId, command);

    execution.adjustments.push({
      id: `adj_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      parameter: deviation.parameter,
      oldValue: deviation.actualValue,
      newValue: deviation.expectedValue,
      reason: `Auto-correction for ${deviation.severity} deviation`,
      automatic: true
    });

    this.emit('recipe:auto-corrected', { execution, deviation, command });
  }

  // Validate recipe structure
  private validateRecipe(recipe: CultivationRecipe): void {
    if (!recipe.stages || recipe.stages.length === 0) {
      throw new Error('Recipe must have at least one stage');
    }

    // Check stage order
    const orders = recipe.stages.map(s => s.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        throw new Error('Stage orders must be sequential starting from 1');
      }
    }

    // Validate stage durations
    const totalDuration = recipe.stages.reduce((sum, stage) => sum + stage.duration, 0);
    if (totalDuration !== recipe.totalDuration) {
      throw new Error('Total duration must equal sum of stage durations');
    }

    // Validate environmental ranges
    for (const stage of recipe.stages) {
      this.validateRange(stage.environmental.temperature.day, 'temperature.day');
      this.validateRange(stage.environmental.temperature.night, 'temperature.night');
      this.validateRange(stage.environmental.humidity.day, 'humidity.day');
      this.validateRange(stage.environmental.humidity.night, 'humidity.night');
      // Add more validations...
    }
  }

  // Validate parameter range
  private validateRange(
    range: { min: number; max: number; optimal: number },
    parameter: string
  ): void {
    if (range.min >= range.max) {
      throw new Error(`Invalid range for ${parameter}: min must be less than max`);
    }
    if (range.optimal < range.min || range.optimal > range.max) {
      throw new Error(`Invalid range for ${parameter}: optimal must be between min and max`);
    }
  }

  // Helper methods
  private isDaytime(): boolean {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18; // Simple day/night check
  }

  private async getCurrentReadings(roomId: string): Promise<any> {
    // In production, fetch from sensor database
    return {
      temperature: 75 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      humidity: 60 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20,
      co2: 800 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 400,
      ph: 6.0 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1,
      ec: 1.5 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1
    };
  }

  private async sendControlCommand(roomId: string, command: any): Promise<void> {
    // In production, send to control system
    this.emit('control:command-sent', { roomId, command });
  }

  private async getRecipe(recipeId: string): Promise<CultivationRecipe | null> {
    // In production, fetch from database
    // For demo, return mock recipe
    return null;
  }

  private async saveRecipe(recipe: CultivationRecipe): Promise<void> {
    // In production, save to database
  }

  // Get standard recipe templates
  static getTemplates(): Partial<CultivationRecipe>[] {
    return [
      {
        name: 'Standard Photoperiod - 10 Week',
        description: 'Classic 10-week photoperiod cultivation cycle',
        category: 'hybrid',
        totalDuration: 70,
        stages: [
          {
            id: 'veg',
            name: 'Vegetative',
            duration: 28,
            order: 1,
            environmental: {
              temperature: {
                day: { min: 70, max: 80, optimal: 75 },
                night: { min: 65, max: 75, optimal: 70 }
              },
              humidity: {
                day: { min: 55, max: 70, optimal: 65 },
                night: { min: 55, max: 70, optimal: 65 }
              },
              co2: {
                day: { min: 800, max: 1200, optimal: 1000 },
                night: { min: 400, max: 600, optimal: 500 }
              },
              vpd: {
                day: { min: 0.8, max: 1.2, optimal: 1.0 },
                night: { min: 0.7, max: 1.1, optimal: 0.9 }
              },
              light: {
                photoperiod: 18,
                intensity: 400,
                spectrum: { red: 30, blue: 40, white: 25, farRed: 3, uv: 2 },
                sunrise: 30,
                sunset: 30
              }
            },
            irrigation: {
              frequency: 'daily',
              duration: 5,
              ec: { min: 1.0, max: 1.6, optimal: 1.3 },
              ph: { min: 5.8, max: 6.2, optimal: 6.0 },
              nutrients: {
                nitrogen: 150,
                phosphorus: 50,
                potassium: 100,
                calcium: 150,
                magnesium: 50,
                sulfur: 60,
                micronutrients: {}
              }
            },
            automation: {
              adjustTemperature: true,
              adjustHumidity: true,
              adjustCO2: true,
              adjustLight: true,
              adjustIrrigation: true,
              notifyOnDeviation: true,
              autoCorrectDeviation: true,
              maxDeviationPercent: 15
            }
          },
          {
            id: 'flower',
            name: 'Flowering',
            duration: 42,
            order: 2,
            environmental: {
              temperature: {
                day: { min: 68, max: 78, optimal: 73 },
                night: { min: 62, max: 72, optimal: 67 }
              },
              humidity: {
                day: { min: 45, max: 55, optimal: 50 },
                night: { min: 45, max: 55, optimal: 50 }
              },
              co2: {
                day: { min: 1000, max: 1500, optimal: 1200 },
                night: { min: 400, max: 600, optimal: 500 }
              },
              vpd: {
                day: { min: 1.0, max: 1.4, optimal: 1.2 },
                night: { min: 0.9, max: 1.3, optimal: 1.1 }
              },
              light: {
                photoperiod: 12,
                intensity: 800,
                spectrum: { red: 50, blue: 20, white: 25, farRed: 5, uv: 0 },
                sunrise: 30,
                sunset: 30
              }
            },
            irrigation: {
              frequency: 'daily',
              duration: 8,
              ec: { min: 1.4, max: 2.0, optimal: 1.7 },
              ph: { min: 5.8, max: 6.2, optimal: 6.0 },
              nutrients: {
                nitrogen: 100,
                phosphorus: 150,
                potassium: 200,
                calcium: 180,
                magnesium: 70,
                sulfur: 80,
                micronutrients: {}
              }
            },
            automation: {
              adjustTemperature: true,
              adjustHumidity: true,
              adjustCO2: true,
              adjustLight: true,
              adjustIrrigation: true,
              notifyOnDeviation: true,
              autoCorrectDeviation: true,
              maxDeviationPercent: 10
            }
          }
        ]
      }
    ];
  }

  // Cleanup
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
export const recipeEngine = new RecipeEngine();