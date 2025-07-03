// Facility Automation System
// Integrates sensors, alerts, and control systems for automated responses

import { EventEmitter } from 'events';
import { TrolmasterAdapter } from '../sensors/trolmaster-adapter';
import { LICORAdapter } from '../sensors/licor-adapter';
import { QRRFIDManager } from '../tracking/qr-rfid-manager';

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: TriggerCondition;
  conditions: Condition[];
  actions: Action[];
  schedule?: Schedule;
  priority: 'low' | 'medium' | 'high' | 'critical';
  cooldown?: number; // Minutes before rule can trigger again
  lastTriggered?: Date;
}

export interface TriggerCondition {
  type: 'sensor' | 'time' | 'event' | 'manual';
  sensorType?: string;
  parameter?: string;
  operator?: 'above' | 'below' | 'equals' | 'between' | 'outside';
  value?: number | [number, number];
  event?: string;
  schedule?: string; // Cron expression
}

export interface Condition {
  type: 'sensor' | 'time' | 'stage' | 'location';
  parameter: string;
  operator: string;
  value: any;
  logic?: 'AND' | 'OR';
}

export interface Action {
  type: 'control' | 'alert' | 'log' | 'email' | 'sms' | 'webhook';
  target?: string;
  command?: string;
  value?: any;
  message?: string;
  recipients?: string[];
  url?: string;
}

export interface Schedule {
  type: 'once' | 'recurring' | 'photoperiod';
  time?: string;
  days?: string[];
  photoperiod?: {
    lightOn: string;
    lightOff: string;
    stage: 'vegetative' | 'flowering';
  };
}

export interface Alert {
  id: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  title: string;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  actions?: string[];
}

export class FacilityAutomation extends EventEmitter {
  private rules: Map<string, AutomationRule> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private trolmaster: TrolmasterAdapter;
  private licor: LICORAdapter;
  private tracking: QRRFIDManager;
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();
  
  // Alert channels
  private twilioClient: any; // Twilio for SMS
  private emailService: any; // SendGrid/SES for email
  private slackWebhook: string = process.env.SLACK_WEBHOOK || '';
  
  constructor(
    trolmaster: TrolmasterAdapter,
    licor: LICORAdapter,
    tracking: QRRFIDManager
  ) {
    super();
    this.trolmaster = trolmaster;
    this.licor = licor;
    this.tracking = tracking;
    
    this.initializeEventListeners();
    this.loadDefaultRules();
  }

  private initializeEventListeners(): void {
    // Listen to sensor readings
    this.trolmaster.on('reading', (reading) => {
      this.evaluateRules('sensor', reading);
    });
    
    this.licor.on('reading', (reading) => {
      this.evaluateRules('sensor', reading);
    });
    
    // Listen to tracking events
    this.tracking.on('scan', (event) => {
      this.evaluateRules('event', event);
    });
  }

  private loadDefaultRules(): void {
    // Temperature control rule
    this.addRule({
      id: 'temp-control',
      name: 'Temperature Control',
      enabled: true,
      trigger: {
        type: 'sensor',
        sensorType: 'temperature',
        parameter: 'temperature',
        operator: 'outside',
        value: [68, 78] // Optimal range
      },
      conditions: [],
      actions: [
        {
          type: 'control',
          target: 'hvac',
          command: 'adjust'
        },
        {
          type: 'alert',
          message: 'Temperature out of range: {value}°F'
        }
      ],
      priority: 'high',
      cooldown: 10
    });

    // High CO2 alert
    this.addRule({
      id: 'co2-alert',
      name: 'High CO2 Alert',
      enabled: true,
      trigger: {
        type: 'sensor',
        sensorType: 'co2',
        parameter: 'co2',
        operator: 'above',
        value: 1500
      },
      conditions: [],
      actions: [
        {
          type: 'control',
          target: 'exhaust_fan',
          command: 'on',
          value: 100 // 100% speed
        },
        {
          type: 'sms',
          message: '🚨 High CO2 Alert: {value} ppm in {location}',
          recipients: [process.env.ALERT_PHONE || '']
        },
        {
          type: 'alert',
          message: 'CO2 levels critical'
        }
      ],
      priority: 'critical',
      cooldown: 15
    });

    // Photoperiod control
    this.addRule({
      id: 'photoperiod-veg',
      name: 'Vegetative Photoperiod',
      enabled: true,
      trigger: {
        type: 'time',
        schedule: '0 6 * * *' // 6 AM daily
      },
      conditions: [
        {
          type: 'stage',
          parameter: 'growthStage',
          operator: 'equals',
          value: 'vegetative'
        }
      ],
      actions: [
        {
          type: 'control',
          target: 'lights',
          command: 'on',
          value: 100
        }
      ],
      schedule: {
        type: 'photoperiod',
        photoperiod: {
          lightOn: '06:00',
          lightOff: '00:00', // 18 hours
          stage: 'vegetative'
        }
      },
      priority: 'high'
    });

    // DLI optimization
    this.addRule({
      id: 'dli-optimization',
      name: 'DLI Target Optimization',
      enabled: true,
      trigger: {
        type: 'sensor',
        sensorType: 'LI-190R',
        parameter: 'dli'
      },
      conditions: [
        {
          type: 'time',
          parameter: 'hour',
          operator: 'equals',
          value: 14 // 2 PM check
        }
      ],
      actions: [
        {
          type: 'control',
          target: 'lights',
          command: 'dim',
          value: 'calculated' // Will be calculated based on current DLI
        }
      ],
      priority: 'medium',
      cooldown: 60
    });

    // Water stress detection
    this.addRule({
      id: 'water-stress',
      name: 'Water Stress Detection',
      enabled: true,
      trigger: {
        type: 'sensor',
        sensorType: 'soil_moisture',
        parameter: 'moisture',
        operator: 'below',
        value: 30 // 30% moisture
      },
      conditions: [],
      actions: [
        {
          type: 'control',
          target: 'irrigation',
          command: 'water',
          value: 'calculated'
        },
        {
          type: 'alert',
          message: 'Low soil moisture detected'
        }
      ],
      priority: 'high',
      cooldown: 30
    });
  }

  // Add automation rule
  public addRule(rule: AutomationRule): void {
    this.rules.set(rule.id, rule);
    
    // Set up scheduled rules
    if (rule.trigger.type === 'time' && rule.trigger.schedule) {
      this.scheduleRule(rule);
    }
    
    this.emit('ruleAdded', rule);
  }

  // Evaluate rules based on trigger
  private async evaluateRules(triggerType: string, data: any): Promise<void> {
    for (const [id, rule] of this.rules) {
      if (!rule.enabled) continue;
      if (rule.trigger.type !== triggerType) continue;
      
      // Check cooldown
      if (rule.lastTriggered && rule.cooldown) {
        const cooldownMs = rule.cooldown * 60 * 1000;
        if (Date.now() - rule.lastTriggered.getTime() < cooldownMs) {
          continue;
        }
      }
      
      // Evaluate trigger condition
      if (this.evaluateTrigger(rule.trigger, data)) {
        // Evaluate additional conditions
        if (this.evaluateConditions(rule.conditions)) {
          // Execute actions
          await this.executeActions(rule, data);
          
          // Update last triggered
          rule.lastTriggered = new Date();
        }
      }
    }
  }

  // Evaluate trigger condition
  private evaluateTrigger(trigger: TriggerCondition, data: any): boolean {
    if (trigger.type === 'sensor' && data.sensorType === trigger.sensorType) {
      const value = data.value;
      
      switch (trigger.operator) {
        case 'above':
          return value > (trigger.value as number);
        case 'below':
          return value < (trigger.value as number);
        case 'between':
          const [min, max] = trigger.value as [number, number];
          return value >= min && value <= max;
        case 'outside':
          const [low, high] = trigger.value as [number, number];
          return value < low || value > high;
        default:
          return false;
      }
    }
    
    return false;
  }

  // Evaluate additional conditions
  private evaluateConditions(conditions: Condition[]): boolean {
    if (conditions.length === 0) return true;
    
    let result = true;
    let previousLogic = 'AND';
    
    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition);
      
      if (previousLogic === 'AND') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }
      
      previousLogic = condition.logic || 'AND';
    }
    
    return result;
  }

  // Evaluate single condition
  private evaluateCondition(condition: Condition): boolean {
    // Implementation depends on condition type
    switch (condition.type) {
      case 'time':
        const now = new Date();
        if (condition.parameter === 'hour') {
          return now.getHours() === condition.value;
        }
        break;
      case 'stage':
        // Check growth stage from tracking system
        // return this.tracking.getCurrentStage() === condition.value;
        break;
    }
    
    return true;
  }

  // Execute rule actions
  private async executeActions(rule: AutomationRule, data: any): Promise<void> {
    for (const action of rule.actions) {
      try {
        await this.executeAction(action, rule, data);
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
      }
    }
  }

  // Execute single action
  private async executeAction(
    action: Action, 
    rule: AutomationRule, 
    data: any
  ): Promise<void> {
    switch (action.type) {
      case 'control':
        await this.executeControl(action, data);
        break;
        
      case 'alert':
        await this.createAlert(rule, action, data);
        break;
        
      case 'sms':
        await this.sendSMS(action, data);
        break;
        
      case 'email':
        await this.sendEmail(action, data);
        break;
        
      case 'webhook':
        await this.callWebhook(action, data);
        break;
        
      case 'log':
        break;
    }
  }

  // Execute control action
  private async executeControl(action: Action, data: any): Promise<void> {
    if (!action.target || !action.command) return;
    
    // Calculate value if needed
    let value = action.value;
    if (value === 'calculated') {
      value = this.calculateControlValue(action, data);
    }
    
    // Execute control based on target
    switch (action.target) {
      case 'lights':
        await this.controlLights(action.command, value);
        break;
      case 'hvac':
        await this.controlHVAC(action.command, value);
        break;
      case 'irrigation':
        await this.controlIrrigation(action.command, value);
        break;
      default:
        // Generic Trolmaster control
        await this.trolmaster.executeControl({
          deviceId: action.target,
          action: action.command,
          value
        });
    }
    
    this.emit('controlExecuted', { action, value });
  }

  // Control lights
  private async controlLights(command: string, value: any): Promise<void> {
    
    // Integration with your lighting control system
    switch (command) {
      case 'on':
      case 'off':
        // Turn lights on/off
        break;
      case 'dim':
        // Dim to specific level
        break;
    }
  }

  // Control HVAC
  private async controlHVAC(command: string, value: any): Promise<void> {
    
    // Integration with HVAC control
  }

  // Control irrigation
  private async controlIrrigation(command: string, value: any): Promise<void> {
    
    // Integration with irrigation control
  }

  // Calculate control value based on sensor data
  private calculateControlValue(action: Action, data: any): any {
    // Example: Calculate dimming level based on current DLI
    if (action.target === 'lights' && action.command === 'dim') {
      const targetDLI = 40; // mol/m²/day
      const currentDLI = data.dli || 0;
      const hoursRemaining = 24 - new Date().getHours();
      
      if (currentDLI >= targetDLI) {
        return 0; // Turn off
      }
      
      const remainingDLI = targetDLI - currentDLI;
      const requiredPPFD = (remainingDLI * 1000000) / (hoursRemaining * 3600);
      const currentPPFD = data.ppfd || 0;
      
      return Math.round((requiredPPFD / currentPPFD) * 100);
    }
    
    return action.value;
  }

  // Create alert
  private async createAlert(
    rule: AutomationRule, 
    action: Action, 
    data: any
  ): Promise<void> {
    const alert: Alert = {
      id: `alert-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      severity: this.getSeverityFromPriority(rule.priority),
      source: rule.name,
      title: `${rule.name} Triggered`,
      message: this.formatMessage(action.message || '', data),
      acknowledged: false,
      resolved: false
    };
    
    this.alerts.set(alert.id, alert);
    this.emit('alert', alert);
    
    // Send notifications based on severity
    if (alert.severity === 'critical') {
      await this.sendCriticalAlert(alert);
    }
  }

  // Send SMS alert
  private async sendSMS(action: Action, data: any): Promise<void> {
    if (!action.recipients || action.recipients.length === 0) return;
    
    const message = this.formatMessage(action.message || '', data);
    
    // Using Twilio
    if (this.twilioClient) {
      for (const recipient of action.recipients) {
        try {
          await this.twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE,
            to: recipient
          });
        } catch (error) {
          console.error('Failed to send SMS:', error);
        }
      }
    }
  }

  // Send email alert
  private async sendEmail(action: Action, data: any): Promise<void> {
    if (!action.recipients || action.recipients.length === 0) return;
    
    const message = this.formatMessage(action.message || '', data);
    
    // Email implementation
  }

  // Call webhook
  private async callWebhook(action: Action, data: any): Promise<void> {
    if (!action.url) return;
    
    try {
      await fetch(action.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          data,
          timestamp: new Date()
        })
      });
    } catch (error) {
      console.error('Webhook call failed:', error);
    }
  }

  // Format message with data placeholders
  private formatMessage(template: string, data: any): string {
    return template.replace(/{(\w+)}/g, (match, key) => {
      return data[key] || match;
    });
  }

  // Get severity from priority
  private getSeverityFromPriority(priority: string): Alert['severity'] {
    switch (priority) {
      case 'critical': return 'critical';
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'info';
    }
  }

  // Send critical alert through all channels
  private async sendCriticalAlert(alert: Alert): Promise<void> {
    // SMS
    await this.sendSMS({
      type: 'sms',
      message: `🚨 CRITICAL: ${alert.title} - ${alert.message}`,
      recipients: [process.env.ALERT_PHONE || '']
    }, {});
    
    // Slack
    if (this.slackWebhook) {
      await fetch(this.slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *CRITICAL ALERT*\n*${alert.title}*\n${alert.message}`,
          color: 'danger'
        })
      });
    }
  }

  // Schedule time-based rule
  private scheduleRule(rule: AutomationRule): void {
    // Simple implementation - would use node-cron in production
    if (rule.schedule?.type === 'photoperiod' && rule.schedule.photoperiod) {
      const { lightOn, lightOff } = rule.schedule.photoperiod;
      
      // Schedule light on
      const [onHour, onMinute] = lightOn.split(':').map(Number);
      const onTime = new Date();
      onTime.setHours(onHour, onMinute, 0, 0);
      
      const onDelay = onTime.getTime() - Date.now();
      if (onDelay > 0) {
        const timer = setTimeout(() => {
          this.evaluateRules('time', { schedule: true });
        }, onDelay);
        
        this.activeTimers.set(`${rule.id}-on`, timer);
      }
    }
  }

  // Get active alerts
  public getAlerts(filter?: { 
    severity?: Alert['severity']; 
    acknowledged?: boolean;
    resolved?: boolean;
  }): Alert[] {
    let alerts = Array.from(this.alerts.values());
    
    if (filter) {
      if (filter.severity) {
        alerts = alerts.filter(a => a.severity === filter.severity);
      }
      if (filter.acknowledged !== undefined) {
        alerts = alerts.filter(a => a.acknowledged === filter.acknowledged);
      }
      if (filter.resolved !== undefined) {
        alerts = alerts.filter(a => a.resolved === filter.resolved);
      }
    }
    
    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Acknowledge alert
  public acknowledgeAlert(alertId: string, userId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date();
      this.emit('alertAcknowledged', alert);
    }
  }

  // Resolve alert
  public resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.emit('alertResolved', alert);
    }
  }

  // Get automation rules
  public getRules(): AutomationRule[] {
    return Array.from(this.rules.values());
  }

  // Enable/disable rule
  public setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      this.emit('ruleUpdated', rule);
    }
  }

  // Clean up
  public destroy(): void {
    // Clear all timers
    this.activeTimers.forEach(timer => clearTimeout(timer));
    this.activeTimers.clear();
    
    // Remove all listeners
    this.removeAllListeners();
  }
}