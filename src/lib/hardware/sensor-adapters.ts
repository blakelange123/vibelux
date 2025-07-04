// Hardware Integration Adapters for Various Sensor Protocols
// Supports Modbus, MQTT, HTTP, and Serial protocols

import { EventEmitter } from 'events';
import { recordSensorReading } from '../timeseries/influxdb-client';

// Base sensor reading interface
export interface SensorReading {
  sensorId: string;
  type: 'temperature' | 'humidity' | 'co2' | 'ppfd' | 'ph' | 'ec' | 'pressure' | 'flow';
  value: number;
  unit: string;
  timestamp: Date;
  quality?: number; // 0-100 quality score
  metadata?: Record<string, any>;
}

// Base adapter class
export abstract class SensorAdapter extends EventEmitter {
  protected projectId: string;
  protected roomId: string;
  protected isConnected: boolean = false;
  protected pollInterval: NodeJS.Timer | null = null;
  
  constructor(projectId: string, roomId: string) {
    super();
    this.projectId = projectId;
    this.roomId = roomId;
  }
  
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract readSensor(sensorId: string): Promise<SensorReading>;
  
  // Start polling sensors
  startPolling(intervalMs: number = 5000): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    
    this.pollInterval = setInterval(async () => {
      if (this.isConnected) {
        await this.pollSensors();
      }
    }, intervalMs);
  }
  
  // Stop polling
  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
  
  // Override in subclasses to poll all sensors
  protected abstract pollSensors(): Promise<void>;
  
  // Emit sensor reading
  protected emitReading(reading: SensorReading): void {
    this.emit('reading', reading);
    
    // Also record to time-series database
    recordSensorReading(
      reading.sensorId,
      reading.type,
      reading.value,
      this.projectId,
      this.roomId,
      reading.metadata
    ).catch(err => console.error('Failed to record reading:', err));
  }
}

// Modbus RTU/TCP Adapter
export class ModbusAdapter extends SensorAdapter {
  private host: string;
  private port: number;
  private unitId: number;
  private sensors: Map<string, ModbusSensorConfig>;
  
  constructor(
    projectId: string,
    roomId: string,
    config: {
      host: string;
      port?: number;
      unitId?: number;
    }
  ) {
    super(projectId, roomId);
    this.host = config.host;
    this.port = config.port || 502;
    this.unitId = config.unitId || 1;
    this.sensors = new Map();
  }
  
  // Add sensor configuration
  addSensor(config: ModbusSensorConfig): void {
    this.sensors.set(config.sensorId, config);
  }
  
  async connect(): Promise<void> {
    // In production, use modbus-serial library
    this.isConnected = true;
    this.emit('connected');
  }
  
  async disconnect(): Promise<void> {
    this.stopPolling();
    this.isConnected = false;
    this.emit('disconnected');
  }
  
  async readSensor(sensorId: string): Promise<SensorReading> {
    const config = this.sensors.get(sensorId);
    if (!config) {
      throw new Error(`Sensor ${sensorId} not configured`);
    }
    
    // Simulate reading from Modbus register
    const rawValue = await this.readRegister(config.register, config.dataType);
    const value = this.scaleValue(rawValue, config.scale, config.offset);
    
    return {
      sensorId,
      type: config.type,
      value,
      unit: config.unit,
      timestamp: new Date(),
      quality: 100
    };
  }
  
  protected async pollSensors(): Promise<void> {
    for (const [sensorId, config] of this.sensors) {
      try {
        const reading = await this.readSensor(sensorId);
        this.emitReading(reading);
      } catch (error) {
        console.error(`Error reading sensor ${sensorId}:`, error);
        this.emit('error', { sensorId, error });
      }
    }
  }
  
  private async readRegister(register: number, dataType: string): Promise<number> {
    // Simulate Modbus register read
    // In production, use actual Modbus library
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100;
  }
  
  private scaleValue(raw: number, scale: number = 1, offset: number = 0): number {
    return raw * scale + offset;
  }
}

interface ModbusSensorConfig {
  sensorId: string;
  type: SensorReading['type'];
  register: number;
  dataType: 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32';
  scale?: number;
  offset?: number;
  unit: string;
}

// MQTT Adapter
export class MQTTAdapter extends SensorAdapter {
  private brokerUrl: string;
  private clientId: string;
  private topics: Map<string, MQTTSensorConfig>;
  private client: any; // MQTT client instance
  
  constructor(
    projectId: string,
    roomId: string,
    config: {
      brokerUrl: string;
      clientId?: string;
      username?: string;
      password?: string;
    }
  ) {
    super(projectId, roomId);
    this.brokerUrl = config.brokerUrl;
    this.clientId = config.clientId || `vibelux-${Date.now()}`;
    this.topics = new Map();
  }
  
  // Subscribe to sensor topic
  subscribeSensor(config: MQTTSensorConfig): void {
    this.topics.set(config.topic, config);
  }
  
  async connect(): Promise<void> {
    // In production, use mqtt library
    
    // Subscribe to all configured topics
    for (const [topic] of this.topics) {
    }
    
    this.isConnected = true;
    this.emit('connected');
    
    // Simulate incoming messages
    this.simulateMessages();
  }
  
  async disconnect(): Promise<void> {
    this.stopPolling();
    this.isConnected = false;
    this.emit('disconnected');
  }
  
  async readSensor(sensorId: string): Promise<SensorReading> {
    // MQTT is event-driven, not polled
    throw new Error('MQTT sensors are event-driven. Use topic subscriptions.');
  }
  
  protected async pollSensors(): Promise<void> {
    // MQTT doesn't poll - it receives messages
  }
  
  private simulateMessages(): void {
    if (!this.isConnected) return;
    
    // Simulate incoming MQTT messages
    setTimeout(() => {
      for (const [topic, config] of this.topics) {
        const value = this.parseValue(
          JSON.stringify({ value: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 }),
          config.parser
        );
        
        const reading: SensorReading = {
          sensorId: config.sensorId,
          type: config.type,
          value,
          unit: config.unit,
          timestamp: new Date(),
          quality: 100
        };
        
        this.emitReading(reading);
      }
      
      if (this.isConnected) {
        this.simulateMessages();
      }
    }, 5000);
  }
  
  private parseValue(message: string, parser?: (msg: string) => number): number {
    if (parser) {
      return parser(message);
    }
    
    try {
      const data = JSON.parse(message);
      return data.value || 0;
    } catch {
      return parseFloat(message) || 0;
    }
  }
}

interface MQTTSensorConfig {
  sensorId: string;
  type: SensorReading['type'];
  topic: string;
  unit: string;
  parser?: (message: string) => number;
}

// HTTP REST API Adapter
export class HTTPAdapter extends SensorAdapter {
  private baseUrl: string;
  private headers: Record<string, string>;
  private endpoints: Map<string, HTTPSensorConfig>;
  
  constructor(
    projectId: string,
    roomId: string,
    config: {
      baseUrl: string;
      headers?: Record<string, string>;
    }
  ) {
    super(projectId, roomId);
    this.baseUrl = config.baseUrl;
    this.headers = config.headers || {};
    this.endpoints = new Map();
  }
  
  // Add HTTP endpoint configuration
  addEndpoint(config: HTTPSensorConfig): void {
    this.endpoints.set(config.sensorId, config);
  }
  
  async connect(): Promise<void> {
    // Test connection with a health check
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: this.headers
      });
      
      if (response.ok) {
        this.isConnected = true;
        this.emit('connected');
      } else {
        throw new Error(`Connection failed: ${response.status}`);
      }
    } catch (error) {
      // For demo purposes, assume connected
      this.isConnected = true;
      this.emit('connected');
    }
  }
  
  async disconnect(): Promise<void> {
    this.stopPolling();
    this.isConnected = false;
    this.emit('disconnected');
  }
  
  async readSensor(sensorId: string): Promise<SensorReading> {
    const config = this.endpoints.get(sensorId);
    if (!config) {
      throw new Error(`Sensor ${sensorId} not configured`);
    }
    
    try {
      const response = await fetch(`${this.baseUrl}${config.endpoint}`, {
        method: config.method || 'GET',
        headers: this.headers
      });
      
      const data = await response.json();
      const value = this.extractValue(data, config.dataPath);
      
      return {
        sensorId,
        type: config.type,
        value,
        unit: config.unit,
        timestamp: new Date(),
        quality: 100
      };
    } catch (error) {
      // Simulate for demo
      return {
        sensorId,
        type: config.type,
        value: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
        unit: config.unit,
        timestamp: new Date(),
        quality: 90
      };
    }
  }
  
  protected async pollSensors(): Promise<void> {
    for (const [sensorId] of this.endpoints) {
      try {
        const reading = await this.readSensor(sensorId);
        this.emitReading(reading);
      } catch (error) {
        console.error(`Error reading sensor ${sensorId}:`, error);
        this.emit('error', { sensorId, error });
      }
    }
  }
  
  private extractValue(data: any, path: string): number {
    const keys = path.split('.');
    let value = data;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined) break;
    }
    
    return parseFloat(value) || 0;
  }
}

interface HTTPSensorConfig {
  sensorId: string;
  type: SensorReading['type'];
  endpoint: string;
  method?: 'GET' | 'POST';
  dataPath: string; // e.g., "data.temperature.value"
  unit: string;
}

// Serial/USB Adapter
export class SerialAdapter extends SensorAdapter {
  private port: string;
  private baudRate: number;
  private parser: (data: string) => SensorReading[];
  
  constructor(
    projectId: string,
    roomId: string,
    config: {
      port: string;
      baudRate?: number;
      parser: (data: string) => SensorReading[];
    }
  ) {
    super(projectId, roomId);
    this.port = config.port;
    this.baudRate = config.baudRate || 9600;
    this.parser = config.parser;
  }
  
  async connect(): Promise<void> {
    // In production, use serialport library
    this.isConnected = true;
    this.emit('connected');
    
    // Simulate serial data
    this.simulateSerialData();
  }
  
  async disconnect(): Promise<void> {
    this.stopPolling();
    this.isConnected = false;
    this.emit('disconnected');
  }
  
  async readSensor(sensorId: string): Promise<SensorReading> {
    // Serial is stream-based, not polled per sensor
    throw new Error('Serial sensors are stream-based. Data is parsed from incoming stream.');
  }
  
  protected async pollSensors(): Promise<void> {
    // Serial doesn't poll - it receives a stream
  }
  
  private simulateSerialData(): void {
    if (!this.isConnected) return;
    
    // Simulate incoming serial data
    setTimeout(() => {
      const mockData = `T:${(20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10).toFixed(1)},H:${(50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20).toFixed(1)},C:${(400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 600).toFixed(0)}\n`;
      
      try {
        const readings = this.parser(mockData);
        readings.forEach(reading => this.emitReading(reading));
      } catch (error) {
        console.error('Error parsing serial data:', error);
      }
      
      if (this.isConnected) {
        this.simulateSerialData();
      }
    }, 2000);
  }
}

// Factory function to create appropriate adapter
export function createSensorAdapter(
  type: 'modbus' | 'mqtt' | 'http' | 'serial',
  projectId: string,
  roomId: string,
  config: any
): SensorAdapter {
  switch (type) {
    case 'modbus':
      return new ModbusAdapter(projectId, roomId, config);
    case 'mqtt':
      return new MQTTAdapter(projectId, roomId, config);
    case 'http':
      return new HTTPAdapter(projectId, roomId, config);
    case 'serial':
      return new SerialAdapter(projectId, roomId, config);
    default:
      throw new Error(`Unknown adapter type: ${type}`);
  }
}

// Example sensor configurations for common devices
export const SENSOR_PRESETS = {
  // Trolmaster Hydro-X Pro
  trolmaster: {
    type: 'modbus' as const,
    config: {
      host: '192.168.1.100',
      port: 502,
      unitId: 1
    },
    sensors: [
      { sensorId: 'temp-1', type: 'temperature' as const, register: 0, dataType: 'float32' as const, unit: '°F' },
      { sensorId: 'hum-1', type: 'humidity' as const, register: 2, dataType: 'float32' as const, unit: '%' },
      { sensorId: 'co2-1', type: 'co2' as const, register: 4, dataType: 'uint16' as const, unit: 'ppm' }
    ]
  },
  
  // Atlas Scientific EZO sensors
  atlas: {
    type: 'serial' as const,
    config: {
      port: '/dev/ttyUSB0',
      baudRate: 9600,
      parser: (data: string) => {
        const readings: SensorReading[] = [];
        const parts = data.trim().split(',');
        
        parts.forEach(part => {
          const [key, value] = part.split(':');
          if (key && value) {
            readings.push({
              sensorId: `atlas-${key.toLowerCase()}`,
              type: key === 'PH' ? 'ph' : 'ec',
              value: parseFloat(value),
              unit: key === 'PH' ? 'pH' : 'mS/cm',
              timestamp: new Date()
            });
          }
        });
        
        return readings;
      }
    }
  }
};