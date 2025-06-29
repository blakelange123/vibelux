// Greenhouse Automation Rules Engine
// Implements intelligent control logic for greenhouse operations

export interface SensorData {
  temperature: number;
  humidity: number;
  co2: number;
  lightLevel: number;
  vpd: number;
  soilMoisture?: number;
  ph?: number;
  ec?: number;
  timestamp: Date;
}

export interface Actuator {
  id: string;
  type: 'heating' | 'cooling' | 'ventilation' | 'lighting' | 'irrigation' | 'co2' | 'shade';
  state: 'on' | 'off' | 'auto';
  value?: number; // 0-100 for variable control
  lastChange: Date;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number; // Higher number = higher priority
  conditions: Condition[];
  actions: Action[];
  schedule?: Schedule;
  cooldownMinutes?: number; // Prevent rapid cycling
}

export interface Condition {
  type: 'sensor' | 'time' | 'date' | 'weather' | 'stage';
  parameter: string;
  operator: '<' | '>' | '=' | '<=' | '>=' | '!=' | 'between' | 'outside';
  value: number | string | [number, number];
  duration?: number; // Minutes the condition must be true
}

export interface Action {
  actuatorId: string;
  command: 'on' | 'off' | 'set' | 'increment' | 'decrement';
  value?: number;
  rampTime?: number; // Minutes to gradually change
}

export interface Schedule {
  type: 'daily' | 'weekly' | 'stage-based';
  startTime?: string; // HH:MM format
  endTime?: string;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  stageName?: string;
}

export interface RuleLog {
  ruleId: string;
  timestamp: Date;
  triggered: boolean;
  conditions: { met: boolean; value: any }[];
  actionsExecuted: string[];
}

// Pre-defined rule templates
export const RULE_TEMPLATES = {
  temperature_control: {
    heating: {
      id: 'temp_heating',
      name: 'Temperature - Heating Control',
      description: 'Turn on heating when temperature drops below setpoint',
      enabled: true,
      priority: 10,
      conditions: [
        {
          type: 'sensor' as const,
          parameter: 'temperature',
          operator: '<' as const,
          value: 20,
          duration: 5
        }
      ],
      actions: [
        {
          actuatorId: 'heating_system',
          command: 'on' as const
        }
      ],
      cooldownMinutes: 15
    },
    cooling: {
      id: 'temp_cooling',
      name: 'Temperature - Cooling Control',
      description: 'Activate cooling when temperature exceeds setpoint',
      enabled: true,
      priority: 10,
      conditions: [
        {
          type: 'sensor' as const,
          parameter: 'temperature',
          operator: '>' as const,
          value: 28,
          duration: 5
        }
      ],
      actions: [
        {
          actuatorId: 'cooling_system',
          command: 'on' as const
        },
        {
          actuatorId: 'ventilation',
          command: 'set' as const,
          value: 100
        }
      ],
      cooldownMinutes: 15
    }
  },
  
  humidity_control: {
    dehumidify: {
      id: 'humidity_high',
      name: 'Humidity - Dehumidification',
      description: 'Reduce humidity when too high',
      enabled: true,
      priority: 8,
      conditions: [
        {
          type: 'sensor' as const,
          parameter: 'humidity',
          operator: '>' as const,
          value: 80,
          duration: 10
        }
      ],
      actions: [
        {
          actuatorId: 'ventilation',
          command: 'set' as const,
          value: 75
        },
        {
          actuatorId: 'heating_system',
          command: 'increment' as const,
          value: 2
        }
      ]
    }
  },
  
  co2_enrichment: {
    id: 'co2_control',
    name: 'CO2 Enrichment Control',
    description: 'Maintain optimal CO2 levels during light period',
    enabled: true,
    priority: 6,
    conditions: [
      {
        type: 'sensor' as const,
        parameter: 'co2',
        operator: '<' as const,
        value: 800
      },
      {
        type: 'sensor' as const,
        parameter: 'lightLevel',
        operator: '>' as const,
        value: 200
      }
    ],
    actions: [
      {
        actuatorId: 'co2_system',
        command: 'on' as const
      }
    ],
    schedule: {
      type: 'daily' as const,
      startTime: '06:00',
      endTime: '22:00'
    }
  },
  
  irrigation_control: {
    moisture_based: {
      id: 'irrigation_moisture',
      name: 'Moisture-Based Irrigation',
      description: 'Water when soil moisture is low',
      enabled: true,
      priority: 7,
      conditions: [
        {
          type: 'sensor' as const,
          parameter: 'soilMoisture',
          operator: '<' as const,
          value: 40
        }
      ],
      actions: [
        {
          actuatorId: 'irrigation_zone_1',
          command: 'on' as const,
          value: 300 // seconds
        }
      ],
      cooldownMinutes: 120
    },
    
    scheduled: {
      id: 'irrigation_schedule',
      name: 'Scheduled Irrigation',
      description: 'Water at specific times',
      enabled: true,
      priority: 5,
      conditions: [
        {
          type: 'time' as const,
          parameter: 'current',
          operator: '=' as const,
          value: '08:00'
        }
      ],
      actions: [
        {
          actuatorId: 'irrigation_all_zones',
          command: 'on' as const,
          value: 600
        }
      ]
    }
  },
  
  emergency_rules: {
    high_temp_emergency: {
      id: 'emergency_high_temp',
      name: 'Emergency High Temperature',
      description: 'Emergency cooling when temperature is critical',
      enabled: true,
      priority: 20, // Highest priority
      conditions: [
        {
          type: 'sensor' as const,
          parameter: 'temperature',
          operator: '>' as const,
          value: 35
        }
      ],
      actions: [
        {
          actuatorId: 'all_vents',
          command: 'set' as const,
          value: 100
        },
        {
          actuatorId: 'shade_screen',
          command: 'set' as const,
          value: 100
        },
        {
          actuatorId: 'emergency_cooling',
          command: 'on' as const
        }
      ]
    }
  }
};

export class GreenhouseAutomationEngine {
  private rules: Rule[] = [];
  private actuators: Map<string, Actuator> = new Map();
  private ruleHistory: RuleLog[] = [];
  private lastExecutionTime: Map<string, Date> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  // Initialize with default rules
  private initializeDefaultRules() {
    const templates = [
      RULE_TEMPLATES.temperature_control.heating,
      RULE_TEMPLATES.temperature_control.cooling,
      RULE_TEMPLATES.humidity_control.dehumidify,
      RULE_TEMPLATES.co2_enrichment,
      RULE_TEMPLATES.irrigation_control.moisture_based,
      RULE_TEMPLATES.emergency_rules.high_temp_emergency
    ];

    templates.forEach(template => this.addRule(template));
  }

  // Add a new rule
  addRule(rule: Rule) {
    this.rules.push(rule);
    this.sortRulesByPriority();
  }

  // Remove a rule
  removeRule(ruleId: string) {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  // Enable/disable a rule
  toggleRule(ruleId: string, enabled: boolean) {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  // Sort rules by priority (highest first)
  private sortRulesByPriority() {
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  // Main evaluation loop
  evaluateRules(sensorData: SensorData, currentTime: Date = new Date()): Action[] {
    const executedActions: Action[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (rule.cooldownMinutes && this.isInCooldown(rule.id, rule.cooldownMinutes)) {
        continue;
      }

      // Check schedule
      if (rule.schedule && !this.isScheduleActive(rule.schedule, currentTime)) {
        continue;
      }

      // Evaluate conditions
      const conditionResults = this.evaluateConditions(rule.conditions, sensorData, currentTime);
      const allConditionsMet = conditionResults.every(result => result.met);

      // Log rule evaluation
      this.logRuleEvaluation(rule.id, currentTime, allConditionsMet, conditionResults, []);

      if (allConditionsMet) {
        // Execute actions
        rule.actions.forEach(action => {
          executedActions.push(action);
          this.executeAction(action);
        });

        // Update last execution time
        this.lastExecutionTime.set(rule.id, currentTime);

        // Log successful execution
        this.logRuleEvaluation(
          rule.id, 
          currentTime, 
          true, 
          conditionResults, 
          rule.actions.map(a => `${a.actuatorId}: ${a.command}`)
        );
      }
    }

    return executedActions;
  }

  // Evaluate all conditions for a rule
  private evaluateConditions(
    conditions: Condition[], 
    sensorData: SensorData, 
    currentTime: Date
  ): { met: boolean; value: any }[] {
    return conditions.map(condition => {
      let value: any;
      let met = false;

      switch (condition.type) {
        case 'sensor':
          value = sensorData[condition.parameter as keyof SensorData];
          met = this.evaluateComparison(value, condition.operator, condition.value);
          break;

        case 'time':
          const currentTimeStr = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
          value = currentTimeStr;
          met = this.evaluateComparison(currentTimeStr, condition.operator, condition.value);
          break;

        case 'date':
          value = currentTime.toISOString().split('T')[0];
          met = this.evaluateComparison(value, condition.operator, condition.value);
          break;

        // Add more condition types as needed
      }

      return { met, value };
    });
  }

  // Evaluate comparison operators
  private evaluateComparison(
    value: any, 
    operator: Condition['operator'], 
    target: number | string | [number, number]
  ): boolean {
    switch (operator) {
      case '<': return value < target;
      case '>': return value > target;
      case '=': return value === target;
      case '<=': return value <= target;
      case '>=': return value >= target;
      case '!=': return value !== target;
      case 'between':
        if (Array.isArray(target)) {
          return value >= target[0] && value <= target[1];
        }
        return false;
      case 'outside':
        if (Array.isArray(target)) {
          return value < target[0] || value > target[1];
        }
        return false;
      default:
        return false;
    }
  }

  // Check if rule is in cooldown period
  private isInCooldown(ruleId: string, cooldownMinutes: number): boolean {
    const lastExecution = this.lastExecutionTime.get(ruleId);
    if (!lastExecution) return false;

    const minutesSinceExecution = (Date.now() - lastExecution.getTime()) / (1000 * 60);
    return minutesSinceExecution < cooldownMinutes;
  }

  // Check if schedule is active
  private isScheduleActive(schedule: Schedule, currentTime: Date): boolean {
    switch (schedule.type) {
      case 'daily':
        if (schedule.startTime && schedule.endTime) {
          const current = currentTime.getHours() * 60 + currentTime.getMinutes();
          const [startHour, startMin] = schedule.startTime.split(':').map(Number);
          const [endHour, endMin] = schedule.endTime.split(':').map(Number);
          const start = startHour * 60 + startMin;
          const end = endHour * 60 + endMin;
          
          return current >= start && current <= end;
        }
        break;

      case 'weekly':
        if (schedule.daysOfWeek) {
          const currentDay = currentTime.getDay();
          return schedule.daysOfWeek.includes(currentDay);
        }
        break;

      // Add more schedule types as needed
    }

    return true;
  }

  // Execute an action
  private executeAction(action: Action) {
    const actuator = this.actuators.get(action.actuatorId);
    if (!actuator) {
      console.warn(`Actuator ${action.actuatorId} not found`);
      return;
    }

    switch (action.command) {
      case 'on':
        actuator.state = 'on';
        actuator.value = 100;
        break;
      case 'off':
        actuator.state = 'off';
        actuator.value = 0;
        break;
      case 'set':
        actuator.value = action.value || 0;
        actuator.state = actuator.value > 0 ? 'on' : 'off';
        break;
      case 'increment':
        actuator.value = Math.min(100, (actuator.value || 0) + (action.value || 10));
        break;
      case 'decrement':
        actuator.value = Math.max(0, (actuator.value || 100) - (action.value || 10));
        break;
    }

    actuator.lastChange = new Date();
  }

  // Log rule evaluation
  private logRuleEvaluation(
    ruleId: string,
    timestamp: Date,
    triggered: boolean,
    conditions: { met: boolean; value: any }[],
    actionsExecuted: string[]
  ) {
    this.ruleHistory.push({
      ruleId,
      timestamp,
      triggered,
      conditions,
      actionsExecuted
    });

    // Keep only last 1000 logs
    if (this.ruleHistory.length > 1000) {
      this.ruleHistory = this.ruleHistory.slice(-1000);
    }
  }

  // Get rule execution history
  getRuleHistory(ruleId?: string, limit: number = 100): RuleLog[] {
    let history = ruleId 
      ? this.ruleHistory.filter(log => log.ruleId === ruleId)
      : this.ruleHistory;

    return history.slice(-limit);
  }

  // Register an actuator
  registerActuator(actuator: Actuator) {
    this.actuators.set(actuator.id, actuator);
  }

  // Get current actuator states
  getActuatorStates(): Map<string, Actuator> {
    return new Map(this.actuators);
  }

  // Generate rule suggestions based on sensor data patterns
  suggestRules(historicalData: SensorData[]): Rule[] {
    const suggestions: Rule[] = [];

    // Analyze temperature patterns
    const temps = historicalData.map(d => d.temperature);
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);

    // Suggest temperature rules if high variation
    if (maxTemp - minTemp > 10) {
      suggestions.push({
        id: `suggested_temp_${Date.now()}`,
        name: 'Suggested: Temperature Stabilization',
        description: `Keep temperature between ${minTemp + 2}°C and ${maxTemp - 2}°C`,
        enabled: false,
        priority: 8,
        conditions: [
          {
            type: 'sensor',
            parameter: 'temperature',
            operator: 'outside',
            value: [minTemp + 2, maxTemp - 2]
          }
        ],
        actions: [
          {
            actuatorId: 'climate_control',
            command: 'set',
            value: 50
          }
        ]
      });
    }

    // Analyze humidity patterns for VPD optimization
    const vpds = historicalData.map(d => d.vpd);
    const avgVPD = vpds.reduce((a, b) => a + b, 0) / vpds.length;

    if (avgVPD < 0.8 || avgVPD > 1.2) {
      suggestions.push({
        id: `suggested_vpd_${Date.now()}`,
        name: 'Suggested: VPD Optimization',
        description: 'Maintain optimal VPD range for plant growth',
        enabled: false,
        priority: 7,
        conditions: [
          {
            type: 'sensor',
            parameter: 'vpd',
            operator: 'outside',
            value: [0.8, 1.2]
          }
        ],
        actions: [
          {
            actuatorId: 'humidity_control',
            command: 'set',
            value: 65
          }
        ]
      });
    }

    return suggestions;
  }

  // Export rules configuration
  exportRules(): string {
    return JSON.stringify(this.rules, null, 2);
  }

  // Import rules configuration
  importRules(rulesJson: string) {
    try {
      const importedRules = JSON.parse(rulesJson) as Rule[];
      importedRules.forEach(rule => this.addRule(rule));
    } catch (error) {
      console.error('Failed to import rules:', error);
      throw new Error('Invalid rules configuration');
    }
  }
}