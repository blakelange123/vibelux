// SCADA (Supervisory Control and Data Acquisition) Integration
// For industrial automation and control systems in cultivation facilities

export interface SCADATag {
  id: string;
  name: string;
  description: string;
  type: 'analog' | 'digital' | 'string';
  dataType: 'float' | 'int' | 'bool' | 'string';
  unit?: string;
  address: string; // PLC address or OPC tag
  value: any;
  quality: 'good' | 'bad' | 'uncertain';
  timestamp: Date;
  limits?: {
    min?: number;
    max?: number;
    lowAlarm?: number;
    highAlarm?: number;
  };
  scaling?: {
    rawMin: number;
    rawMax: number;
    engMin: number;
    engMax: number;
  };
}

export interface PLCDevice {
  id: string;
  name: string;
  type: 'allen-bradley' | 'siemens' | 'schneider' | 'omron' | 'modbus';
  ipAddress: string;
  port: number;
  slot?: number;
  rack?: number;
  status: 'online' | 'offline' | 'error';
  tags: SCADATag[];
}

export interface SCADAAlarm {
  id: string;
  tagId: string;
  type: 'high' | 'low' | 'deviation' | 'rate-of-change';
  priority: 1 | 2 | 3 | 4 | 5;
  active: boolean;
  acknowledged: boolean;
  timestamp: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  value: number;
  setpoint: number;
  message: string;
}

export interface ControlLoop {
  id: string;
  name: string;
  type: 'pid' | 'on-off' | 'cascade';
  processVariable: string; // Tag ID
  setpoint: number;
  controlOutput: string; // Tag ID
  enabled: boolean;
  mode: 'auto' | 'manual' | 'cascade';
  parameters?: {
    kp?: number; // Proportional gain
    ki?: number; // Integral gain
    kd?: number; // Derivative gain
    deadband?: number;
    outputMin?: number;
    outputMax?: number;
  };
  performance?: {
    error: number;
    output: number;
    integral: number;
    derivative: number;
  };
}

// Base SCADA Integration class
export abstract class SCADAIntegration {
  protected devices: Map<string, PLCDevice> = new Map();
  protected tags: Map<string, SCADATag> = new Map();
  protected alarms: Map<string, SCADAAlarm> = new Map();
  protected controlLoops: Map<string, ControlLoop> = new Map();
  protected scanRate: number = 1000; // milliseconds

  abstract connect(device: PLCDevice): Promise<boolean>;
  abstract disconnect(deviceId: string): Promise<void>;
  abstract readTag(tagId: string): Promise<any>;
  abstract writeTag(tagId: string, value: any): Promise<boolean>;
  abstract readMultipleTags(tagIds: string[]): Promise<Map<string, any>>;
  abstract subscribeToTag(tagId: string, callback: (value: any) => void): void;
  
  startScanning(): void {
    setInterval(() => {
      this.scanAllTags();
    }, this.scanRate);
  }

  protected async scanAllTags(): Promise<void> {
    for (const [tagId, tag] of this.tags) {
      try {
        const value = await this.readTag(tagId);
        this.updateTagValue(tagId, value);
        this.checkAlarms(tagId, value);
      } catch (error) {
        console.error(`Failed to read tag ${tagId}:`, error);
        tag.quality = 'bad';
      }
    }
  }

  protected updateTagValue(tagId: string, rawValue: any): void {
    const tag = this.tags.get(tagId);
    if (!tag) return;

    // Apply scaling if configured
    let value = rawValue;
    if (tag.scaling && typeof rawValue === 'number') {
      const { rawMin, rawMax, engMin, engMax } = tag.scaling;
      value = engMin + (rawValue - rawMin) * (engMax - engMin) / (rawMax - rawMin);
    }

    tag.value = value;
    tag.timestamp = new Date();
    tag.quality = 'good';
  }

  protected checkAlarms(tagId: string, value: number): void {
    const tag = this.tags.get(tagId);
    if (!tag || !tag.limits || typeof value !== 'number') return;

    // High alarm
    if (tag.limits.highAlarm !== undefined && value > tag.limits.highAlarm) {
      this.createOrUpdateAlarm(tagId, 'high', value, tag.limits.highAlarm);
    }

    // Low alarm
    if (tag.limits.lowAlarm !== undefined && value < tag.limits.lowAlarm) {
      this.createOrUpdateAlarm(tagId, 'low', value, tag.limits.lowAlarm);
    }
  }

  protected createOrUpdateAlarm(
    tagId: string, 
    type: 'high' | 'low', 
    value: number, 
    setpoint: number
  ): void {
    const alarmId = `${tagId}-${type}`;
    const existingAlarm = this.alarms.get(alarmId);

    if (existingAlarm && existingAlarm.active) {
      // Update existing alarm
      existingAlarm.value = value;
      existingAlarm.timestamp = new Date();
    } else {
      // Create new alarm
      const tag = this.tags.get(tagId)!;
      const alarm: SCADAAlarm = {
        id: alarmId,
        tagId,
        type,
        priority: type === 'high' ? 2 : 3,
        active: true,
        acknowledged: false,
        timestamp: new Date(),
        value,
        setpoint,
        message: `${tag.name} ${type} alarm: ${value} ${tag.unit || ''} (limit: ${setpoint})`
      };
      this.alarms.set(alarmId, alarm);
    }
  }

  getActiveAlarms(): SCADAAlarm[] {
    return Array.from(this.alarms.values()).filter(a => a.active);
  }

  acknowledgeAlarm(alarmId: string, user: string): boolean {
    const alarm = this.alarms.get(alarmId);
    if (alarm && alarm.active) {
      alarm.acknowledged = true;
      alarm.acknowledgedBy = user;
      alarm.acknowledgedAt = new Date();
      return true;
    }
    return false;
  }

  // Control loop management
  createControlLoop(config: Omit<ControlLoop, 'performance'>): void {
    const loop: ControlLoop = {
      ...config,
      performance: {
        error: 0,
        output: 0,
        integral: 0,
        derivative: 0
      }
    };
    this.controlLoops.set(loop.id, loop);
  }

  async executeControlLoop(loopId: string): Promise<void> {
    const loop = this.controlLoops.get(loopId);
    if (!loop || !loop.enabled) return;

    // Read process variable
    const pv = await this.readTag(loop.processVariable);
    if (typeof pv !== 'number') return;

    let output = 0;

    switch (loop.type) {
      case 'pid':
        output = this.calculatePID(loop, pv);
        break;
      case 'on-off':
        output = this.calculateOnOff(loop, pv);
        break;
    }

    // Apply output limits
    if (loop.parameters?.outputMin !== undefined) {
      output = Math.max(output, loop.parameters.outputMin);
    }
    if (loop.parameters?.outputMax !== undefined) {
      output = Math.min(output, loop.parameters.outputMax);
    }

    // Write control output
    if (loop.mode === 'auto') {
      await this.writeTag(loop.controlOutput, output);
    }

    // Update performance metrics
    if (loop.performance) {
      loop.performance.error = loop.setpoint - pv;
      loop.performance.output = output;
    }
  }

  private calculatePID(loop: ControlLoop, pv: number): number {
    if (!loop.parameters || !loop.performance) return 0;

    const error = loop.setpoint - pv;
    const dt = this.scanRate / 1000; // Convert to seconds

    // Proportional term
    const p = (loop.parameters.kp || 1) * error;

    // Integral term
    loop.performance.integral += error * dt;
    const i = (loop.parameters.ki || 0) * loop.performance.integral;

    // Derivative term
    const dError = (error - loop.performance.error) / dt;
    const d = (loop.parameters.kd || 0) * dError;

    return p + i + d;
  }

  private calculateOnOff(loop: ControlLoop, pv: number): number {
    const deadband = loop.parameters?.deadband || 0;
    const error = loop.setpoint - pv;

    if (error > deadband) {
      return loop.parameters?.outputMax || 100;
    } else if (error < -deadband) {
      return loop.parameters?.outputMin || 0;
    }

    // Within deadband, maintain current state
    return loop.performance?.output || 0;
  }
}

// Allen-Bradley (Rockwell) Integration
export class AllenBradleyIntegration extends SCADAIntegration {
  async connect(device: PLCDevice): Promise<boolean> {
    try {
      // EtherNet/IP connection
      const response = await fetch('/api/scada/ab/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: device.ipAddress,
          slot: device.slot || 0
        })
      });

      if (response.ok) {
        this.devices.set(device.id, device);
        // Load tags from L5X or online browsing
        await this.loadTags(device);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Allen-Bradley connection error:', error);
      return false;
    }
  }

  async disconnect(deviceId: string): Promise<void> {
    await fetch('/api/scada/ab/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId })
    });
    this.devices.delete(deviceId);
  }

  async readTag(tagId: string): Promise<any> {
    const tag = this.tags.get(tagId);
    if (!tag) throw new Error(`Tag ${tagId} not found`);

    const response = await fetch('/api/scada/ab/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: this.getDeviceIdForTag(tagId),
        tagName: tag.address
      })
    });

    const data = await response.json();
    return data.value;
  }

  async writeTag(tagId: string, value: any): Promise<boolean> {
    const tag = this.tags.get(tagId);
    if (!tag) return false;

    const response = await fetch('/api/scada/ab/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: this.getDeviceIdForTag(tagId),
        tagName: tag.address,
        value
      })
    });

    return response.ok;
  }

  async readMultipleTags(tagIds: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    
    // Group by device for efficiency
    const tagsByDevice = new Map<string, string[]>();
    tagIds.forEach(tagId => {
      const deviceId = this.getDeviceIdForTag(tagId);
      if (!tagsByDevice.has(deviceId)) {
        tagsByDevice.set(deviceId, []);
      }
      tagsByDevice.get(deviceId)!.push(tagId);
    });

    // Read from each device
    for (const [deviceId, deviceTagIds] of tagsByDevice) {
      const tagNames = deviceTagIds.map(id => this.tags.get(id)?.address).filter(Boolean);
      
      const response = await fetch('/api/scada/ab/read-multiple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, tagNames })
      });

      const data = await response.json();
      deviceTagIds.forEach((tagId, index) => {
        results.set(tagId, data.values[index]);
      });
    }

    return results;
  }

  subscribeToTag(tagId: string, callback: (value: any) => void): void {
    // Set up subscription via WebSocket or polling
    const tag = this.tags.get(tagId);
    if (!tag) return;

    // For real-time updates, would use WebSocket
    setInterval(async () => {
      const value = await this.readTag(tagId);
      callback(value);
    }, 100); // 100ms for critical tags
  }

  private async loadTags(device: PLCDevice): Promise<void> {
    // Load tag database from PLC
    const response = await fetch('/api/scada/ab/browse-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: device.id })
    });

    const tagList = await response.json();
    tagList.forEach((tagInfo: any) => {
      const tag: SCADATag = {
        id: `${device.id}-${tagInfo.name}`,
        name: tagInfo.name,
        description: tagInfo.description || '',
        type: tagInfo.type.includes('BOOL') ? 'digital' : 'analog',
        dataType: this.mapABDataType(tagInfo.type),
        address: tagInfo.name,
        value: null,
        quality: 'bad',
        timestamp: new Date()
      };
      this.tags.set(tag.id, tag);
    });
  }

  private mapABDataType(abType: string): SCADATag['dataType'] {
    if (abType.includes('BOOL')) return 'bool';
    if (abType.includes('INT')) return 'int';
    if (abType.includes('REAL')) return 'float';
    return 'string';
  }

  private getDeviceIdForTag(tagId: string): string {
    // Extract device ID from tag ID
    return tagId.split('-')[0];
  }
}

// Siemens S7 Integration
export class SiemensS7Integration extends SCADAIntegration {
  async connect(device: PLCDevice): Promise<boolean> {
    try {
      // S7 protocol connection
      const response = await fetch('/api/scada/s7/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: device.ipAddress,
          rack: device.rack || 0,
          slot: device.slot || 2
        })
      });

      if (response.ok) {
        this.devices.set(device.id, device);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Siemens S7 connection error:', error);
      return false;
    }
  }

  async disconnect(deviceId: string): Promise<void> {
    await fetch('/api/scada/s7/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId })
    });
    this.devices.delete(deviceId);
  }

  async readTag(tagId: string): Promise<any> {
    const tag = this.tags.get(tagId);
    if (!tag) throw new Error(`Tag ${tagId} not found`);

    // Parse S7 address (e.g., DB10.DBW20)
    const addressParts = this.parseS7Address(tag.address);
    
    const response = await fetch('/api/scada/s7/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: this.getDeviceIdForTag(tagId),
        area: addressParts.area,
        dbNumber: addressParts.dbNumber,
        start: addressParts.start,
        amount: addressParts.amount,
        wordLen: addressParts.wordLen
      })
    });

    const data = await response.json();
    return data.value;
  }

  async writeTag(tagId: string, value: any): Promise<boolean> {
    const tag = this.tags.get(tagId);
    if (!tag) return false;

    const addressParts = this.parseS7Address(tag.address);
    
    const response = await fetch('/api/scada/s7/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: this.getDeviceIdForTag(tagId),
        area: addressParts.area,
        dbNumber: addressParts.dbNumber,
        start: addressParts.start,
        value,
        wordLen: addressParts.wordLen
      })
    });

    return response.ok;
  }

  async readMultipleTags(tagIds: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    
    // S7 supports multi-var read
    const items = tagIds.map(tagId => {
      const tag = this.tags.get(tagId);
      if (!tag) return null;
      return this.parseS7Address(tag.address);
    }).filter(Boolean);

    const response = await fetch('/api/scada/s7/read-multi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });

    const data = await response.json();
    tagIds.forEach((tagId, index) => {
      results.set(tagId, data.values[index]);
    });

    return results;
  }

  subscribeToTag(tagId: string, callback: (value: any) => void): void {
    // S7 doesn't have native subscriptions, use polling
    setInterval(async () => {
      const value = await this.readTag(tagId);
      callback(value);
    }, this.scanRate);
  }

  private parseS7Address(address: string): any {
    // Parse addresses like DB10.DBW20, MB100, I0.0
    const match = address.match(/^(DB)(\d+)\.(\w+)(\d+)$/);
    if (match) {
      return {
        area: 0x84, // DB area
        dbNumber: parseInt(match[2]),
        start: parseInt(match[4]),
        amount: 1,
        wordLen: this.getWordLen(match[3])
      };
    }
    // Add more address parsing logic as needed
    return null;
  }

  private getWordLen(type: string): number {
    const wordLenMap: Record<string, number> = {
      'DBX': 0x01, // Bit
      'DBB': 0x02, // Byte
      'DBW': 0x04, // Word
      'DBD': 0x06, // DWord
      'DBR': 0x08  // Real
    };
    return wordLenMap[type] || 0x02;
  }

  private getDeviceIdForTag(tagId: string): string {
    return tagId.split('-')[0];
  }
}

// SCADA System Manager
export class SCADASystemManager {
  private integrations: Map<string, SCADAIntegration> = new Map();
  private historian: Map<string, Array<{ timestamp: Date; value: any }>> = new Map();
  private alarmSubscribers: ((alarm: SCADAAlarm) => void)[] = [];

  async addDevice(device: PLCDevice, integrationType: 'allen-bradley' | 'siemens' | 'modbus'): Promise<boolean> {
    let integration: SCADAIntegration;
    
    switch (integrationType) {
      case 'allen-bradley':
        integration = new AllenBradleyIntegration();
        break;
      case 'siemens':
        integration = new SiemensS7Integration();
        break;
      default:
        return false;
    }

    const connected = await integration.connect(device);
    if (connected) {
      this.integrations.set(device.id, integration);
      integration.startScanning();
      
      // Subscribe to alarms
      setInterval(() => {
        const alarms = integration.getActiveAlarms();
        alarms.forEach(alarm => {
          this.alarmSubscribers.forEach(subscriber => subscriber(alarm));
        });
      }, 1000);
      
      return true;
    }
    return false;
  }

  async removeDevice(deviceId: string): Promise<void> {
    const integration = this.integrations.get(deviceId);
    if (integration) {
      await integration.disconnect(deviceId);
      this.integrations.delete(deviceId);
    }
  }

  // Tag operations
  async readTag(tagId: string): Promise<any> {
    const integration = this.getIntegrationForTag(tagId);
    if (!integration) throw new Error(`No integration found for tag ${tagId}`);
    
    const value = await integration.readTag(tagId);
    
    // Store in historian
    if (!this.historian.has(tagId)) {
      this.historian.set(tagId, []);
    }
    this.historian.get(tagId)!.push({ timestamp: new Date(), value });
    
    // Keep only last 24 hours
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const history = this.historian.get(tagId)!;
    this.historian.set(tagId, history.filter(h => h.timestamp > cutoff));
    
    return value;
  }

  async writeTag(tagId: string, value: any): Promise<boolean> {
    const integration = this.getIntegrationForTag(tagId);
    if (!integration) return false;
    
    return integration.writeTag(tagId, value);
  }

  // Control operations for cultivation
  async setEnvironmentSetpoint(zone: string, parameter: 'temperature' | 'humidity' | 'co2', value: number): Promise<boolean> {
    // Find the appropriate control loop
    for (const integration of this.integrations.values()) {
      const loops = Array.from(integration['controlLoops'].values());
      const loop = loops.find(l => 
        l.name.toLowerCase().includes(zone) && 
        l.name.toLowerCase().includes(parameter)
      );
      
      if (loop) {
        loop.setpoint = value;
        return true;
      }
    }
    return false;
  }

  async setLightingSchedule(zone: string, schedule: {
    onTime: string; // HH:MM
    offTime: string; // HH:MM
    intensity: number; // 0-100%
  }): Promise<boolean> {
    // Find lighting control tags for zone
    const lightingTags = this.findTagsByPattern(`${zone}_lighting_`);
    
    if (lightingTags.length > 0) {
      // Write schedule to PLC
      await this.writeTag(`${zone}_lighting_on_hour`, parseInt(schedule.onTime.split(':')[0]));
      await this.writeTag(`${zone}_lighting_on_minute`, parseInt(schedule.onTime.split(':')[1]));
      await this.writeTag(`${zone}_lighting_off_hour`, parseInt(schedule.offTime.split(':')[0]));
      await this.writeTag(`${zone}_lighting_off_minute`, parseInt(schedule.offTime.split(':')[1]));
      await this.writeTag(`${zone}_lighting_intensity`, schedule.intensity);
      return true;
    }
    return false;
  }

  async setIrrigationSchedule(zone: string, schedule: {
    frequency: number; // minutes between irrigation
    duration: number; // seconds
    startTime: string; // HH:MM
    endTime: string; // HH:MM
  }): Promise<boolean> {
    const irrigationTags = this.findTagsByPattern(`${zone}_irrigation_`);
    
    if (irrigationTags.length > 0) {
      await this.writeTag(`${zone}_irrigation_frequency`, schedule.frequency);
      await this.writeTag(`${zone}_irrigation_duration`, schedule.duration);
      await this.writeTag(`${zone}_irrigation_start_hour`, parseInt(schedule.startTime.split(':')[0]));
      await this.writeTag(`${zone}_irrigation_end_hour`, parseInt(schedule.endTime.split(':')[0]));
      return true;
    }
    return false;
  }

  // Alarm management
  subscribeToAlarms(callback: (alarm: SCADAAlarm) => void): void {
    this.alarmSubscribers.push(callback);
  }

  getActiveAlarms(): SCADAAlarm[] {
    const allAlarms: SCADAAlarm[] = [];
    this.integrations.forEach(integration => {
      allAlarms.push(...integration.getActiveAlarms());
    });
    return allAlarms;
  }

  acknowledgeAlarm(alarmId: string, user: string): boolean {
    for (const integration of this.integrations.values()) {
      if (integration.acknowledgeAlarm(alarmId, user)) {
        return true;
      }
    }
    return false;
  }

  // Historical data
  getTagHistory(tagId: string, hours: number = 24): Array<{ timestamp: Date; value: any }> {
    const history = this.historian.get(tagId) || [];
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return history.filter(h => h.timestamp > cutoff);
  }

  // Utility methods
  private getIntegrationForTag(tagId: string): SCADAIntegration | undefined {
    const deviceId = tagId.split('-')[0];
    return this.integrations.get(deviceId);
  }

  private findTagsByPattern(pattern: string): string[] {
    const matchingTags: string[] = [];
    this.integrations.forEach(integration => {
      const tags = Array.from(integration['tags'].keys());
      matchingTags.push(...tags.filter(tag => tag.includes(pattern)));
    });
    return matchingTags;
  }
}

// Export singleton instance
export const scadaManager = new SCADASystemManager();