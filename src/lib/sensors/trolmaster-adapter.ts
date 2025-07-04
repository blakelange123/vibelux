// Trolmaster Sensor Integration
// Supports Hydro-X Pro, Aqua-X Pro, and various sensor modules

import { EventEmitter } from 'events';
import axios from 'axios';

export interface TrolmasterReading {
  timestamp: Date;
  deviceId: string;
  sensorType: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'alert' | 'offline';
}

export interface EnvironmentalData {
  temperature: number;      // °F or °C
  humidity: number;         // %RH
  co2: number;             // ppm
  vpd: number;             // kPa
  light: number;           // μmol/m²/s
  soilMoisture?: number;   // %
  soilEC?: number;         // mS/cm
  soilTemp?: number;       // °F or °C
  waterPH?: number;        // pH
  waterEC?: number;        // mS/cm
  waterTemp?: number;      // °F or °C
}

export interface TrolmasterDevice {
  id: string;
  name: string;
  type: 'Hydro-X Pro' | 'Aqua-X Pro' | 'Carbon-X' | 'Lighting Controller';
  ipAddress: string;
  status: 'online' | 'offline';
  firmware: string;
  sensors: TrolmasterSensor[];
}

export interface TrolmasterSensor {
  id: string;
  type: 'TSH-1' | 'TCS-1' | 'TSS-2' | 'WCS-1' | 'LMA-14' | 'DSP-1';
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastReading?: TrolmasterReading;
}

interface AlertRule {
  id: string;
  parameter: keyof EnvironmentalData;
  condition: 'above' | 'below' | 'outside_range';
  threshold: number | [number, number];
  action: 'alert' | 'control' | 'both';
  deviceControl?: {
    deviceId: string;
    action: string;
    value?: number;
  };
}

export class TrolmasterAdapter extends EventEmitter {
  private devices: Map<string, TrolmasterDevice> = new Map();
  private readings: Map<string, TrolmasterReading[]> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;
  
  // Trolmaster API endpoints
  private readonly API_ENDPOINTS = {
    status: '/api/v1/status',
    sensors: '/api/v1/sensors',
    readings: '/api/v1/readings',
    control: '/api/v1/control',
    history: '/api/v1/history'
  };

  constructor() {
    super();
  }

  // Connect to Trolmaster device
  public async connectDevice(ipAddress: string, name: string): Promise<TrolmasterDevice> {
    try {
      const baseURL = `http://${ipAddress}`;
      
      // Get device status
      const statusResponse = await axios.get(`${baseURL}${this.API_ENDPOINTS.status}`);
      const status = statusResponse.data;
      
      // Get sensor list
      const sensorsResponse = await axios.get(`${baseURL}${this.API_ENDPOINTS.sensors}`);
      const sensors = sensorsResponse.data.sensors.map(this.mapSensorData);
      
      const device: TrolmasterDevice = {
        id: status.deviceId,
        name: name || status.deviceName,
        type: status.deviceType,
        ipAddress,
        status: 'online',
        firmware: status.firmware,
        sensors
      };
      
      this.devices.set(device.id, device);
      this.emit('deviceConnected', device);
      
      // Start polling this device
      this.startPolling(device.id);
      
      return device;
    } catch (error) {
      console.error('Failed to connect to Trolmaster device:', error);
      throw new Error(`Failed to connect to device at ${ipAddress}`);
    }
  }

  // Start polling for sensor data
  private startPolling(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (!device) return;
    
    // Poll every 5 seconds
    const pollDevice = async () => {
      try {
        const response = await axios.get(
          `http://${device.ipAddress}${this.API_ENDPOINTS.readings}`
        );
        
        const readings = response.data.readings;
        const timestamp = new Date();
        
        // Process each sensor reading
        readings.forEach((reading: any) => {
          const sensorReading: TrolmasterReading = {
            timestamp,
            deviceId: device.id,
            sensorType: reading.sensorType,
            value: reading.value,
            unit: reading.unit,
            status: this.evaluateStatus(reading)
          };
          
          this.bufferReading(sensorReading);
          this.emit('reading', sensorReading);
          
          // Check alert rules
          this.checkAlerts(sensorReading);
        });
        
        // Update device sensors
        device.sensors = readings.map((r: any) => ({
          ...device.sensors.find(s => s.id === r.sensorId),
          lastReading: {
            timestamp,
            deviceId: device.id,
            sensorType: r.sensorType,
            value: r.value,
            unit: r.unit,
            status: this.evaluateStatus(r)
          }
        }));
        
      } catch (error) {
        console.error(`Failed to poll device ${deviceId}:`, error);
        device.status = 'offline';
        this.emit('deviceOffline', device);
      }
    };
    
    // Start polling
    pollDevice();
    this.pollingInterval = setInterval(pollDevice, 5000);
  }

  // Map sensor data from API response
  private mapSensorData(sensor: any): TrolmasterSensor {
    const sensorTypeMap: { [key: string]: string } = {
      'temp_humidity': 'TSH-1',
      'co2': 'TCS-1',
      'soil': 'TSS-2',
      'water': 'WCS-1',
      'light': 'LMA-14',
      'par': 'DSP-1'
    };
    
    return {
      id: sensor.id,
      type: sensorTypeMap[sensor.category] as any || sensor.model,
      name: sensor.name,
      status: sensor.connected ? 'active' : 'inactive'
    };
  }

  // Evaluate sensor status based on reading
  private evaluateStatus(reading: any): 'normal' | 'warning' | 'alert' | 'offline' {
    if (!reading.connected) return 'offline';
    
    // Check if value is within normal range
    const ranges: { [key: string]: { min: number; max: number; warning: number } } = {
      temperature: { min: 65, max: 85, warning: 5 },
      humidity: { min: 40, max: 70, warning: 10 },
      co2: { min: 400, max: 1500, warning: 200 },
      vpd: { min: 0.8, max: 1.2, warning: 0.2 }
    };
    
    const range = ranges[reading.parameter];
    if (!range) return 'normal';
    
    if (reading.value < range.min || reading.value > range.max) {
      return 'alert';
    } else if (
      reading.value < range.min + range.warning || 
      reading.value > range.max - range.warning
    ) {
      return 'warning';
    }
    
    return 'normal';
  }

  // Buffer readings for historical data
  private bufferReading(reading: TrolmasterReading): void {
    const key = `${reading.deviceId}-${reading.sensorType}`;
    const buffer = this.readings.get(key) || [];
    
    buffer.push(reading);
    
    // Keep last 24 hours of data
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);
    
    const filtered = buffer.filter(r => r.timestamp > cutoff);
    this.readings.set(key, filtered);
  }

  // Get current environmental data
  public getCurrentEnvironment(deviceId: string): EnvironmentalData | null {
    const device = this.devices.get(deviceId);
    if (!device) return null;
    
    const data: Partial<EnvironmentalData> = {};
    
    device.sensors.forEach(sensor => {
      if (!sensor.lastReading) return;
      
      switch (sensor.type) {
        case 'TSH-1':
          if (sensor.lastReading.sensorType === 'temperature') {
            data.temperature = sensor.lastReading.value;
          } else if (sensor.lastReading.sensorType === 'humidity') {
            data.humidity = sensor.lastReading.value;
          }
          break;
        case 'TCS-1':
          data.co2 = sensor.lastReading.value;
          break;
        case 'DSP-1':
        case 'LMA-14':
          data.light = sensor.lastReading.value;
          break;
        case 'TSS-2':
          if (sensor.lastReading.sensorType === 'soil_moisture') {
            data.soilMoisture = sensor.lastReading.value;
          } else if (sensor.lastReading.sensorType === 'soil_ec') {
            data.soilEC = sensor.lastReading.value;
          } else if (sensor.lastReading.sensorType === 'soil_temp') {
            data.soilTemp = sensor.lastReading.value;
          }
          break;
        case 'WCS-1':
          if (sensor.lastReading.sensorType === 'water_ph') {
            data.waterPH = sensor.lastReading.value;
          } else if (sensor.lastReading.sensorType === 'water_ec') {
            data.waterEC = sensor.lastReading.value;
          } else if (sensor.lastReading.sensorType === 'water_temp') {
            data.waterTemp = sensor.lastReading.value;
          }
          break;
      }
    });
    
    // Calculate VPD if we have temp and humidity
    if (data.temperature !== undefined && data.humidity !== undefined) {
      data.vpd = this.calculateVPD(data.temperature, data.humidity);
    }
    
    return data as EnvironmentalData;
  }

  // Calculate Vapor Pressure Deficit
  private calculateVPD(tempF: number, rh: number): number {
    // Convert to Celsius
    const tempC = (tempF - 32) * 5/9;
    
    // Calculate saturation vapor pressure (kPa)
    const svp = 0.61078 * Math.exp((17.269 * tempC) / (tempC + 237.3));
    
    // Calculate actual vapor pressure
    const avp = svp * (rh / 100);
    
    // Calculate VPD
    const vpd = svp - avp;
    
    return Math.round(vpd * 100) / 100;
  }

  // Set alert rule
  public setAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    this.emit('alertRuleSet', rule);
  }

  // Check alerts based on reading
  private async checkAlerts(reading: TrolmasterReading): Promise<void> {
    this.alertRules.forEach(async (rule) => {
      const env = this.getCurrentEnvironment(reading.deviceId);
      if (!env) return;
      
      const value = env[rule.parameter];
      if (value === undefined) return;
      
      let triggered = false;
      
      switch (rule.condition) {
        case 'above':
          triggered = value > (rule.threshold as number);
          break;
        case 'below':
          triggered = value < (rule.threshold as number);
          break;
        case 'outside_range':
          const [min, max] = rule.threshold as [number, number];
          triggered = value < min || value > max;
          break;
      }
      
      if (triggered) {
        this.emit('alert', {
          rule,
          value,
          deviceId: reading.deviceId,
          timestamp: new Date()
        });
        
        // Execute control action if configured
        if (rule.action === 'control' || rule.action === 'both') {
          await this.executeControl(rule.deviceControl!);
        }
      }
    });
  }

  // Control Trolmaster devices
  public async executeControl(control: {
    deviceId: string;
    action: string;
    value?: number;
  }): Promise<void> {
    const device = this.devices.get(control.deviceId);
    if (!device) throw new Error('Device not found');
    
    try {
      await axios.post(
        `http://${device.ipAddress}${this.API_ENDPOINTS.control}`,
        {
          action: control.action,
          value: control.value
        }
      );
      
      this.emit('controlExecuted', control);
    } catch (error) {
      console.error('Failed to execute control:', error);
      throw error;
    }
  }

  // Get historical data
  public getHistory(
    deviceId: string,
    sensorType: string,
    hours: number = 24
  ): TrolmasterReading[] {
    const key = `${deviceId}-${sensorType}`;
    const readings = this.readings.get(key) || [];
    
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    return readings.filter(r => r.timestamp > cutoff);
  }

  // Disconnect device
  public disconnectDevice(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (!device) return;
    
    device.status = 'offline';
    this.devices.delete(deviceId);
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.emit('deviceDisconnected', device);
  }

  // Get all connected devices
  public getDevices(): TrolmasterDevice[] {
    return Array.from(this.devices.values());
  }
}