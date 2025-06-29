// Modbus/SCADA Integration Client
// This would connect to real Modbus devices in production

import { EventEmitter } from 'events';

export interface ModbusConfig {
  host: string;
  port: number;
  unitId: number;
  timeout?: number;
  retries?: number;
}

export interface ModbusRegister {
  address: number;
  type: 'coil' | 'input' | 'holding' | 'inputRegister';
  length: number;
  scale?: number;
  offset?: number;
  unit?: string;
  description?: string;
}

export interface ScadaTag {
  tagName: string;
  register: ModbusRegister;
  value?: number | boolean;
  quality?: 'good' | 'bad' | 'uncertain';
  timestamp?: Date;
  alarmLimits?: {
    lowLow?: number;
    low?: number;
    high?: number;
    highHigh?: number;
  };
}

export interface ModbusDevice {
  id: string;
  name: string;
  config: ModbusConfig;
  tags: ScadaTag[];
  connected: boolean;
  lastUpdate?: Date;
}

// Mock Modbus data generator for demo
class MockModbusDataGenerator {
  private intervalId: NodeJS.Timeout | null = null;
  
  start(callback: (tag: string, value: number) => void) {
    this.intervalId = setInterval(() => {
      // Generate realistic facility data
      const data = {
        // Environmental sensors
        'env.zone1.temperature': 72 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4 - 2,
        'env.zone1.humidity': 65 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 - 5,
        'env.zone1.co2': 800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 - 100,
        'env.zone2.temperature': 73 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4 - 2,
        'env.zone2.humidity': 62 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 - 5,
        'env.zone2.co2': 850 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 - 100,
        
        // HVAC system
        'hvac.ahu1.supplyTemp': 55 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2 - 1,
        'hvac.ahu1.returnTemp': 75 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2 - 1,
        'hvac.ahu1.fanSpeed': 80 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 - 5,
        'hvac.ahu1.damperPosition': 70 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 - 10,
        
        // Lighting system
        'lighting.zone1.ppfd': 650 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50 - 25,
        'lighting.zone1.dimming': 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 - 2.5,
        'lighting.zone1.power': 4800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 - 100,
        'lighting.zone2.ppfd': 680 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50 - 25,
        'lighting.zone2.dimming': 90 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 - 2.5,
        'lighting.zone2.power': 5200 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 - 100,
        
        // Irrigation system
        'irrigation.zone1.flow': 12.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2 - 1,
        'irrigation.zone1.pressure': 45 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 - 2.5,
        'irrigation.zone1.ec': 1.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2 - 0.1,
        'irrigation.zone1.ph': 6.2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4 - 0.2,
        
        // Energy monitoring
        'energy.total.power': 125000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10000 - 5000,
        'energy.total.pf': 0.95 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.05 - 0.025,
        'energy.hvac.power': 45000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5000 - 2500,
        'energy.lighting.power': 65000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5000 - 2500,
        
        // Production metrics
        'production.yield.daily': 850 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50 - 25,
        'production.quality.score': 92 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 - 2.5,
      };
      
      // Send each value
      Object.entries(data).forEach(([tag, value]) => {
        callback(tag, value);
      });
    }, 1000); // Update every second
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export class ModbusClient extends EventEmitter {
  private devices: Map<string, ModbusDevice> = new Map();
  private mockGenerator: MockModbusDataGenerator;
  private subscribedTags: Set<string> = new Set();
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {
    super();
    this.mockGenerator = new MockModbusDataGenerator();
  }
  
  // Add a Modbus device
  async addDevice(device: ModbusDevice): Promise<void> {
    this.devices.set(device.id, device);
    
    // In production, this would establish actual Modbus connection
    // For demo, we'll simulate connection
    setTimeout(() => {
      device.connected = true;
      device.lastUpdate = new Date();
      this.emit('deviceConnected', device.id);
    }, 500);
  }
  
  // Remove a device
  async removeDevice(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (device) {
      device.connected = false;
      this.devices.delete(deviceId);
      this.emit('deviceDisconnected', deviceId);
    }
  }
  
  // Subscribe to specific tags
  subscribe(tags: string[]): void {
    tags.forEach(tag => this.subscribedTags.add(tag));
    
    // Start mock data generation if not already running
    if (this.subscribedTags.size > 0 && !this.mockGenerator) {
      this.startDataGeneration();
    }
  }
  
  // Unsubscribe from tags
  unsubscribe(tags: string[]): void {
    tags.forEach(tag => this.subscribedTags.delete(tag));
    
    // Stop data generation if no subscriptions
    if (this.subscribedTags.size === 0) {
      this.stopDataGeneration();
    }
  }
  
  // Read a specific tag value
  async readTag(deviceId: string, tagName: string): Promise<any> {
    const device = this.devices.get(deviceId);
    if (!device || !device.connected) {
      throw new Error(`Device ${deviceId} not connected`);
    }
    
    const tag = device.tags.find(t => t.tagName === tagName);
    if (!tag) {
      throw new Error(`Tag ${tagName} not found on device ${deviceId}`);
    }
    
    // In production, this would read from actual Modbus device
    // For demo, return mock value
    return {
      value: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
      quality: 'good',
      timestamp: new Date()
    };
  }
  
  // Write a value to a tag
  async writeTag(deviceId: string, tagName: string, value: any): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device || !device.connected) {
      throw new Error(`Device ${deviceId} not connected`);
    }
    
    const tag = device.tags.find(t => t.tagName === tagName);
    if (!tag) {
      throw new Error(`Tag ${tagName} not found on device ${deviceId}`);
    }
    
    // In production, this would write to actual Modbus device
    // For demo, just emit the change
    this.emit('tagWrite', { deviceId, tagName, value });
  }
  
  // Get all devices
  getDevices(): ModbusDevice[] {
    return Array.from(this.devices.values());
  }
  
  // Get device by ID
  getDevice(deviceId: string): ModbusDevice | undefined {
    return this.devices.get(deviceId);
  }
  
  // Start mock data generation
  private startDataGeneration(): void {
    this.mockGenerator.start((tag, value) => {
      if (this.subscribedTags.has(tag)) {
        this.emit('data', {
          tag,
          value,
          quality: 'good',
          timestamp: new Date()
        });
      }
    });
  }
  
  // Stop mock data generation
  private stopDataGeneration(): void {
    this.mockGenerator.stop();
  }
  
  // Reconnect logic for failed devices
  private scheduleReconnect(deviceId: string): void {
    // Clear existing timer if any
    const existingTimer = this.reconnectTimers.get(deviceId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Schedule reconnection attempt
    const timer = setTimeout(() => {
      const device = this.devices.get(deviceId);
      if (device && !device.connected) {
        this.connectDevice(device);
      }
    }, 5000); // Retry after 5 seconds
    
    this.reconnectTimers.set(deviceId, timer);
  }
  
  // Connect to a device
  private async connectDevice(device: ModbusDevice): Promise<void> {
    try {
      // In production, establish actual Modbus connection
      // For demo, simulate connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      device.connected = true;
      device.lastUpdate = new Date();
      this.emit('deviceConnected', device.id);
    } catch (error) {
      device.connected = false;
      this.emit('deviceError', { deviceId: device.id, error });
      this.scheduleReconnect(device.id);
    }
  }
  
  // Cleanup
  dispose(): void {
    this.stopDataGeneration();
    this.reconnectTimers.forEach(timer => clearTimeout(timer));
    this.reconnectTimers.clear();
    this.devices.clear();
    this.removeAllListeners();
  }
}

// Singleton instance
let modbusClient: ModbusClient | null = null;

export function getModbusClient(): ModbusClient {
  if (!modbusClient) {
    modbusClient = new ModbusClient();
  }
  return modbusClient;
}

// Helper function to create standard facility tags
export function createFacilityTags(): ScadaTag[] {
  return [
    // Environmental monitoring
    {
      tagName: 'env.zone1.temperature',
      register: { address: 30001, type: 'inputRegister', length: 1, scale: 0.1, unit: '°F' },
      alarmLimits: { low: 65, high: 80 }
    },
    {
      tagName: 'env.zone1.humidity',
      register: { address: 30002, type: 'inputRegister', length: 1, scale: 0.1, unit: '%' },
      alarmLimits: { low: 40, high: 70 }
    },
    {
      tagName: 'env.zone1.co2',
      register: { address: 30003, type: 'inputRegister', length: 1, unit: 'ppm' },
      alarmLimits: { high: 1500 }
    },
    
    // HVAC control
    {
      tagName: 'hvac.ahu1.supplyTemp',
      register: { address: 40001, type: 'holding', length: 1, scale: 0.1, unit: '°F' }
    },
    {
      tagName: 'hvac.ahu1.fanSpeed',
      register: { address: 40002, type: 'holding', length: 1, unit: '%' }
    },
    {
      tagName: 'hvac.ahu1.enable',
      register: { address: 10001, type: 'coil', length: 1 }
    },
    
    // Lighting control
    {
      tagName: 'lighting.zone1.dimming',
      register: { address: 40101, type: 'holding', length: 1, unit: '%' }
    },
    {
      tagName: 'lighting.zone1.ppfd',
      register: { address: 30101, type: 'inputRegister', length: 1, unit: 'μmol/m²/s' }
    },
    {
      tagName: 'lighting.zone1.enable',
      register: { address: 10101, type: 'coil', length: 1 }
    },
    
    // Energy monitoring
    {
      tagName: 'energy.total.power',
      register: { address: 30201, type: 'inputRegister', length: 2, scale: 0.001, unit: 'kW' }
    },
    {
      tagName: 'energy.total.energy',
      register: { address: 30203, type: 'inputRegister', length: 2, unit: 'kWh' }
    }
  ];
}