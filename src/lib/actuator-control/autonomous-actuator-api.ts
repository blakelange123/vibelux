/**
 * Autonomous Actuator Control API Bridge
 * Connects AI decision-making to physical greenhouse equipment
 */

import { EnvironmentState, Action } from '../reinforcement-learning/rl-engine';
import { DigitalTwinState } from '../digital-twin/greenhouse-digital-twin';
import { PlantAnalysis } from '../plant-vision-ai';

export interface ActuatorDevice {
  id: string;
  type: 'hvac' | 'lighting' | 'irrigation' | 'co2' | 'ventilation' | 'nutrient' | 'ph_control';
  zone: string;
  protocol: 'modbus' | 'bacnet' | 'mqtt' | 'http' | 'serial';
  address: string;
  parameters: {
    [key: string]: {
      address: number;
      dataType: 'boolean' | 'integer' | 'float';
      range: { min: number; max: number };
      unit: string;
    };
  };
  status: 'online' | 'offline' | 'error' | 'maintenance';
  lastResponse: Date;
  failureCount: number;
}

export interface ActuatorCommand {
  deviceId: string;
  parameter: string;
  value: number | boolean;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  source: 'ai_recommendation' | 'user_override' | 'schedule' | 'emergency_stop';
  reasoning: string;
  timestamp: Date;
  executionDeadline?: Date;
}

export interface ActuatorResponse {
  commandId: string;
  success: boolean;
  actualValue?: number | boolean;
  executionTime: number; // milliseconds
  error?: string;
  deviceStatus: 'ok' | 'warning' | 'error';
  timestamp: Date;
}

export interface SafetyConstraints {
  temperature: { min: number; max: number; rateLimit: number }; // °C/hour
  humidity: { min: number; max: number; rateLimit: number }; // %/hour
  co2: { min: number; max: number; rateLimit: number }; // ppm/hour
  lightIntensity: { min: number; max: number; rateLimit: number }; // PPFD/hour
  ph: { min: number; max: number; rateLimit: number }; // pH units/hour
  ec: { min: number; max: number; rateLimit: number }; // mS/cm/hour
}

export interface ControlStrategy {
  mode: 'manual' | 'scheduled' | 'ai_assisted' | 'fully_autonomous';
  aiConfidenceThreshold: number; // 0-1
  safetyOverrides: boolean;
  emergencyStopEnabled: boolean;
  userApprovalRequired: string[]; // Parameter names requiring approval
  maxSimultaneousChanges: number;
  changeValidationWindow: number; // seconds
}

export class AutonomousActuatorAPI {
  private devices: Map<string, ActuatorDevice>;
  private pendingCommands: Map<string, ActuatorCommand>;
  private executionHistory: ActuatorResponse[];
  private safetyConstraints: SafetyConstraints;
  private controlStrategy: ControlStrategy;
  private commandQueue: ActuatorCommand[];
  private isExecuting: boolean = false;
  private lastStateSnapshot: EnvironmentState | null = null;
  private emergencyStopActive: boolean = false;

  constructor() {
    this.devices = new Map();
    this.pendingCommands = new Map();
    this.executionHistory = [];
    this.commandQueue = [];
    
    this.safetyConstraints = {
      temperature: { min: 10, max: 40, rateLimit: 5 }, // Max 5°C change per hour
      humidity: { min: 20, max: 95, rateLimit: 20 }, // Max 20% change per hour
      co2: { min: 350, max: 2000, rateLimit: 300 }, // Max 300ppm change per hour
      lightIntensity: { min: 0, max: 1200, rateLimit: 200 }, // Max 200 PPFD change per hour
      ph: { min: 4.5, max: 8.0, rateLimit: 0.5 }, // Max 0.5 pH change per hour
      ec: { min: 0.8, max: 4.0, rateLimit: 0.5 } // Max 0.5 mS/cm change per hour
    };

    this.controlStrategy = {
      mode: 'ai_assisted',
      aiConfidenceThreshold: 0.8,
      safetyOverrides: true,
      emergencyStopEnabled: true,
      userApprovalRequired: ['ph', 'ec'], // Critical parameters need approval
      maxSimultaneousChanges: 3,
      changeValidationWindow: 30
    };

    this.initializeDevices();
    this.startCommandProcessor();
  }

  // Initialize default device configurations
  private initializeDevices(): void {
    const defaultDevices: ActuatorDevice[] = [
      {
        id: 'hvac_zone_a',
        type: 'hvac',
        zone: 'A',
        protocol: 'modbus',
        address: '192.168.1.100',
        parameters: {
          temperature_setpoint: { address: 1001, dataType: 'float', range: { min: 10, max: 35 }, unit: '°C' },
          humidity_setpoint: { address: 1002, dataType: 'float', range: { min: 30, max: 90 }, unit: '%' },
          fan_speed: { address: 1003, dataType: 'integer', range: { min: 0, max: 100 }, unit: '%' }
        },
        status: 'online',
        lastResponse: new Date(),
        failureCount: 0
      },
      {
        id: 'led_array_a1',
        type: 'lighting',
        zone: 'A1',
        protocol: 'mqtt',
        address: 'greenhouse/lighting/zone_a1',
        parameters: {
          intensity: { address: 0, dataType: 'integer', range: { min: 0, max: 100 }, unit: '%' },
          red_ratio: { address: 1, dataType: 'float', range: { min: 0, max: 1 }, unit: 'ratio' },
          blue_ratio: { address: 2, dataType: 'float', range: { min: 0, max: 1 }, unit: 'ratio' },
          spectrum_mode: { address: 3, dataType: 'integer', range: { min: 1, max: 5 }, unit: 'mode' }
        },
        status: 'online',
        lastResponse: new Date(),
        failureCount: 0
      },
      {
        id: 'irrigation_zone_a',
        type: 'irrigation',
        zone: 'A',
        protocol: 'http',
        address: 'http://192.168.1.120/api/v1',
        parameters: {
          flow_rate: { address: 0, dataType: 'float', range: { min: 0, max: 10 }, unit: 'L/min' },
          duration: { address: 1, dataType: 'integer', range: { min: 0, max: 3600 }, unit: 'seconds' },
          nutrient_ratio: { address: 2, dataType: 'float', range: { min: 0.5, max: 3.0 }, unit: 'mS/cm' }
        },
        status: 'online',
        lastResponse: new Date(),
        failureCount: 0
      },
      {
        id: 'co2_generator_main',
        type: 'co2',
        zone: 'MAIN',
        protocol: 'bacnet',
        address: '192.168.1.130',
        parameters: {
          setpoint: { address: 101, dataType: 'integer', range: { min: 400, max: 1500 }, unit: 'ppm' },
          enable: { address: 102, dataType: 'boolean', range: { min: 0, max: 1 }, unit: 'boolean' },
          flow_rate: { address: 103, dataType: 'float', range: { min: 0, max: 5 }, unit: 'L/min' }
        },
        status: 'online',
        lastResponse: new Date(),
        failureCount: 0
      }
    ];

    defaultDevices.forEach(device => {
      this.devices.set(device.id, device);
    });
  }

  // Start the command processing loop
  private startCommandProcessor(): void {
    setInterval(async () => {
      if (!this.isExecuting && this.commandQueue.length > 0 && !this.emergencyStopActive) {
        await this.processCommandQueue();
      }
    }, 1000); // Process every second
  }

  // Process AI recommendations into actuator commands
  public async processAIRecommendations(
    recommendations: Array<{
      action: Action;
      confidence: number;
      reasoning: string;
      expectedOutcome: EnvironmentState;
    }>,
    currentState: EnvironmentState,
    plantAnalysis?: PlantAnalysis
  ): Promise<{ 
    accepted: ActuatorCommand[]; 
    rejected: Array<{ command: ActuatorCommand; reason: string }>;
  }> {
    const accepted: ActuatorCommand[] = [];
    const rejected: Array<{ command: ActuatorCommand; reason: string }> = [];

    for (const rec of recommendations) {
      // Check AI confidence threshold
      if (rec.confidence < this.controlStrategy.aiConfidenceThreshold) {
        const cmd = this.actionToCommand(rec.action, rec.reasoning);
        rejected.push({ 
          command: cmd, 
          reason: `AI confidence ${rec.confidence} below threshold ${this.controlStrategy.aiConfidenceThreshold}` 
        });
        continue;
      }

      // Convert AI action to actuator command
      const command = this.actionToCommand(rec.action, rec.reasoning);
      
      if (!command) {
        rejected.push({ 
          command: command!, 
          reason: 'Unable to map AI action to actuator command' 
        });
        continue;
      }

      // Safety validation
      const safetyCheck = await this.validateSafety(command, currentState);
      if (!safetyCheck.safe) {
        rejected.push({ command, reason: safetyCheck.reason });
        continue;
      }

      // Check if user approval required
      if (this.requiresUserApproval(command)) {
        // In production, this would trigger a notification system
        // For now, auto-approve low-risk changes
        if (command.priority === 'low') {
          rejected.push({ command, reason: 'User approval required for this parameter' });
          continue;
        }
      }

      // Add to accepted commands
      command.priority = this.calculatePriority(rec.action, plantAnalysis);
      accepted.push(command);
    }

    // Add accepted commands to queue (respecting simultaneous change limits)
    const availableSlots = this.controlStrategy.maxSimultaneousChanges - this.pendingCommands.size;
    const commandsToQueue = accepted.slice(0, availableSlots);
    
    commandsToQueue.forEach(cmd => {
      this.commandQueue.push(cmd);
    });

    // Reject overflow commands
    const overflow = accepted.slice(availableSlots);
    overflow.forEach(cmd => {
      rejected.push({ command: cmd, reason: 'Queue full - too many simultaneous changes' });
    });

    return { accepted: commandsToQueue, rejected };
  }

  // Convert AI action to actuator command
  private actionToCommand(action: Action, reasoning: string): ActuatorCommand | null {
    const commandId = `cmd_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
    
    // Map AI parameters to device parameters
    const parameterMapping: Record<string, { deviceType: string; parameter: string }> = {
      'temperature': { deviceType: 'hvac', parameter: 'temperature_setpoint' },
      'humidity': { deviceType: 'hvac', parameter: 'humidity_setpoint' },
      'lightIntensity': { deviceType: 'lighting', parameter: 'intensity' },
      'co2Level': { deviceType: 'co2', parameter: 'setpoint' },
      'red': { deviceType: 'lighting', parameter: 'red_ratio' },
      'blue': { deviceType: 'lighting', parameter: 'blue_ratio' },
      'soilMoisture': { deviceType: 'irrigation', parameter: 'duration' },
      'ph': { deviceType: 'irrigation', parameter: 'ph_setpoint' },
      'ec': { deviceType: 'irrigation', parameter: 'nutrient_ratio' }
    };

    const mapping = parameterMapping[action.parameter];
    if (!mapping) return null;

    // Find appropriate device
    const device = Array.from(this.devices.values()).find(d => 
      d.type === mapping.deviceType && d.status === 'online'
    );
    
    if (!device) return null;

    // Calculate target value based on action adjustment
    let targetValue: number;
    if (action.parameter === 'temperature') {
      targetValue = 24 + (action.adjustment * 10); // Adjust around 24°C baseline
    } else if (action.parameter === 'humidity') {
      targetValue = 65 + (action.adjustment * 25); // Adjust around 65% baseline
    } else if (action.parameter === 'lightIntensity') {
      targetValue = Math.max(0, Math.min(100, action.adjustment * 100)); // 0-100%
    } else if (action.parameter === 'co2Level') {
      targetValue = 800 + (action.adjustment * 500); // Adjust around 800ppm baseline
    } else {
      targetValue = Math.max(0, Math.min(1, 0.5 + action.adjustment)); // Normalized 0-1
    }

    return {
      deviceId: device.id,
      parameter: mapping.parameter,
      value: targetValue,
      priority: 'normal',
      source: 'ai_recommendation',
      reasoning,
      timestamp: new Date()
    };
  }

  // Validate command safety
  private async validateSafety(
    command: ActuatorCommand, 
    currentState: EnvironmentState
  ): Promise<{ safe: boolean; reason: string }> {
    if (!this.controlStrategy.safetyOverrides) {
      return { safe: true, reason: 'Safety overrides disabled' };
    }

    // Check absolute limits
    const device = this.devices.get(command.deviceId);
    if (!device) {
      return { safe: false, reason: 'Device not found' };
    }

    const paramConfig = device.parameters[command.parameter];
    if (!paramConfig) {
      return { safe: false, reason: 'Parameter not found on device' };
    }

    if (typeof command.value === 'number') {
      if (command.value < paramConfig.range.min || command.value > paramConfig.range.max) {
        return { 
          safe: false, 
          reason: `Value ${command.value} outside safe range ${paramConfig.range.min}-${paramConfig.range.max}` 
        };
      }
    }

    // Check rate limits (prevent rapid changes)
    if (this.lastStateSnapshot && typeof command.value === 'number') {
      const timeDiff = (Date.now() - this.lastStateSnapshot.timeOfDay) / 3600000; // hours
      const rateLimit = this.getRateLimit(command.parameter);
      
      if (rateLimit && timeDiff > 0) {
        const currentValue = this.getCurrentStateValue(command.parameter, currentState);
        const changeRate = Math.abs(command.value - currentValue) / timeDiff;
        
        if (changeRate > rateLimit) {
          return { 
            safe: false, 
            reason: `Change rate ${changeRate.toFixed(2)}/hour exceeds limit ${rateLimit}/hour` 
          };
        }
      }
    }

    // Check for conflicting commands
    const conflictingCommand = Array.from(this.pendingCommands.values()).find(cmd => 
      cmd.deviceId === command.deviceId && cmd.parameter === command.parameter
    );
    
    if (conflictingCommand) {
      return { 
        safe: false, 
        reason: 'Conflicting command already pending for same device/parameter' 
      };
    }

    return { safe: true, reason: 'Safety validation passed' };
  }

  // Get rate limit for parameter
  private getRateLimit(parameter: string): number | null {
    const mapping: Record<string, keyof SafetyConstraints> = {
      'temperature_setpoint': 'temperature',
      'humidity_setpoint': 'humidity',
      'setpoint': 'co2',
      'intensity': 'lightIntensity',
      'ph_setpoint': 'ph',
      'nutrient_ratio': 'ec'
    };
    
    const constraintKey = mapping[parameter];
    return constraintKey ? this.safetyConstraints[constraintKey].rateLimit : null;
  }

  // Get current state value for parameter
  private getCurrentStateValue(parameter: string, state: EnvironmentState): number {
    const mapping: Record<string, keyof EnvironmentState> = {
      'temperature_setpoint': 'temperature',
      'humidity_setpoint': 'humidity',
      'setpoint': 'co2Level',
      'intensity': 'lightIntensity',
      'ph_setpoint': 'ph',
      'nutrient_ratio': 'ec'
    };
    
    const stateKey = mapping[parameter];
    return stateKey ? (state[stateKey] as number) : 0;
  }

  // Check if command requires user approval
  private requiresUserApproval(command: ActuatorCommand): boolean {
    return this.controlStrategy.userApprovalRequired.some(param => 
      command.parameter.includes(param)
    );
  }

  // Calculate command priority based on plant analysis
  private calculatePriority(action: Action, plantAnalysis?: PlantAnalysis): 'low' | 'normal' | 'high' | 'emergency' {
    if (!plantAnalysis) return 'normal';

    // High priority for plant stress
    if (plantAnalysis.healthScore < 70) return 'high';
    
    // Emergency for critical issues
    const criticalIssues = plantAnalysis.detectedIssues.filter(issue => 
      issue.severity === 'critical'
    );
    if (criticalIssues.length > 0) return 'emergency';

    // High priority for environmental stress
    if (plantAnalysis.advancedPhenotyping?.waterStressIndex > 0.7) return 'high';
    if (plantAnalysis.advancedPhenotyping?.environmentalResponse.temperatureStress !== 'optimal') return 'high';

    return action.intensity > 0.7 ? 'high' : 'normal';
  }

  // Process command queue
  private async processCommandQueue(): Promise<void> {
    if (this.commandQueue.length === 0 || this.isExecuting) return;

    this.isExecuting = true;

    try {
      // Sort by priority and timestamp
      this.commandQueue.sort((a, b) => {
        const priorityOrder = { emergency: 4, high: 3, normal: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp.getTime() - b.timestamp.getTime();
      });

      // Execute highest priority command
      const command = this.commandQueue.shift()!;
      const commandId = `${command.deviceId}_${Date.now()}`;
      
      this.pendingCommands.set(commandId, command);
      
      // Execute command
      const response = await this.executeCommand(commandId, command);
      
      // Record response
      this.executionHistory.push(response);
      this.pendingCommands.delete(commandId);
      
      // Limit history size
      if (this.executionHistory.length > 1000) {
        this.executionHistory = this.executionHistory.slice(-500);
      }

      
    } catch (error) {
      console.error('Error processing command queue:', error);
    } finally {
      this.isExecuting = false;
    }
  }

  // Execute individual command
  private async executeCommand(commandId: string, command: ActuatorCommand): Promise<ActuatorResponse> {
    const startTime = Date.now();
    
    try {
      const device = this.devices.get(command.deviceId);
      if (!device) {
        throw new Error(`Device ${command.deviceId} not found`);
      }

      // Simulate command execution based on protocol
      const success = await this.simulateDeviceCommunication(device, command);
      
      const executionTime = Date.now() - startTime;
      
      if (success) {
        // Update device last response time
        device.lastResponse = new Date();
        device.failureCount = 0;
        
        return {
          commandId,
          success: true,
          actualValue: command.value,
          executionTime,
          deviceStatus: 'ok',
          timestamp: new Date()
        };
      } else {
        device.failureCount++;
        if (device.failureCount >= 3) {
          device.status = 'error';
        }
        
        return {
          commandId,
          success: false,
          executionTime,
          error: 'Device communication failed',
          deviceStatus: 'error',
          timestamp: new Date()
        };
      }
      
    } catch (error) {
      return {
        commandId,
        success: false,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        deviceStatus: 'error',
        timestamp: new Date()
      };
    }
  }

  // Simulate device communication (replace with real protocol handlers)
  private async simulateDeviceCommunication(device: ActuatorDevice, command: ActuatorCommand): Promise<boolean> {
    // Simulate network delay and occasional failures
    await new Promise(resolve => setTimeout(resolve, 100 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300));
    
    // 95% success rate for simulation
    const success = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.05;
    
    if (success) {
    }
    
    return success;
  }

  // Emergency stop all operations
  public emergencyStop(): void {
    this.emergencyStopActive = true;
    this.commandQueue = [];
    this.pendingCommands.clear();
    
    
    // In production, this would send stop commands to all devices
  }

  // Resume operations after emergency stop
  public resumeOperations(): void {
    this.emergencyStopActive = false;
  }

  // Get system status
  public getSystemStatus(): {
    mode: string;
    emergencyStop: boolean;
    onlineDevices: number;
    totalDevices: number;
    pendingCommands: number;
    queuedCommands: number;
    recentErrors: number;
  } {
    const onlineDevices = Array.from(this.devices.values()).filter(d => d.status === 'online').length;
    const recentErrors = this.executionHistory
      .filter(r => r.timestamp > new Date(Date.now() - 3600000) && !r.success)
      .length;

    return {
      mode: this.controlStrategy.mode,
      emergencyStop: this.emergencyStopActive,
      onlineDevices,
      totalDevices: this.devices.size,
      pendingCommands: this.pendingCommands.size,
      queuedCommands: this.commandQueue.length,
      recentErrors
    };
  }

  // Update control strategy
  public updateControlStrategy(strategy: Partial<ControlStrategy>): void {
    this.controlStrategy = { ...this.controlStrategy, ...strategy };
  }

  // Add new device
  public addDevice(device: ActuatorDevice): void {
    this.devices.set(device.id, device);
  }

  // Remove device
  public removeDevice(deviceId: string): void {
    this.devices.delete(deviceId);
  }

  // Get execution history
  public getExecutionHistory(limit: number = 100): ActuatorResponse[] {
    return this.executionHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

// Export singleton instance
export const autonomousActuatorAPI = new AutonomousActuatorAPI();