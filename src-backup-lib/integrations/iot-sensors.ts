// IoT Sensor Integration Framework
// Supports various industrial IoT sensor platforms for cultivation monitoring

export interface SensorReading {
  sensorId: string;
  timestamp: Date;
  value: number;
  unit: string;
  quality: 'good' | 'uncertain' | 'bad';
}

export interface SensorDevice {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'pH' | 'ec' | 'do' | 'pressure' | 'flow';
  manufacturer: string;
  model: string;
  location: {
    zone: string;
    position: { x: number; y: number; z: number };
  };
  status: 'online' | 'offline' | 'error';
  lastReading?: SensorReading;
  calibration?: {
    lastCalibrated: Date;
    nextCalibration: Date;
    offset: number;
  };
}

// Base class for sensor integrations
export abstract class IoTSensorIntegration {
  protected apiKey: string;
  protected baseUrl: string;
  protected pollingInterval: number = 60000; // 1 minute default
  protected devices: Map<string, SensorDevice> = new Map();

  constructor(config: { apiKey: string; baseUrl: string; pollingInterval?: number }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    if (config.pollingInterval) {
      this.pollingInterval = config.pollingInterval;
    }
  }

  abstract connect(): Promise<boolean>;
  abstract disconnect(): Promise<void>;
  abstract discoverDevices(): Promise<SensorDevice[]>;
  abstract getReading(deviceId: string): Promise<SensorReading>;
  abstract getBulkReadings(deviceIds: string[]): Promise<Map<string, SensorReading>>;
  abstract subscribeToUpdates(callback: (reading: SensorReading) => void): void;

  // Common methods
  async startPolling(callback: (readings: Map<string, SensorReading>) => void) {
    setInterval(async () => {
      const deviceIds = Array.from(this.devices.keys());
      const readings = await this.getBulkReadings(deviceIds);
      callback(readings);
    }, this.pollingInterval);
  }

  getDevice(deviceId: string): SensorDevice | undefined {
    return this.devices.get(deviceId);
  }

  getAllDevices(): SensorDevice[] {
    return Array.from(this.devices.values());
  }
}

// Onset HOBO Integration
export class OnsetHOBOIntegration extends IoTSensorIntegration {
  private wsConnection?: WebSocket;

  async connect(): Promise<boolean> {
    try {
      // Initialize HOBO API connection
      const response = await fetch(`${this.baseUrl}/api/v2/auth`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Establish WebSocket for real-time data
        this.wsConnection = new WebSocket(`wss://hobolink.com/ws?token=${this.apiKey}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('HOBO connection error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.wsConnection) {
      this.wsConnection.close();
    }
  }

  async discoverDevices(): Promise<SensorDevice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/devices`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      const data = await response.json();
      const devices: SensorDevice[] = data.devices.map((device: any) => ({
        id: device.serial_number,
        name: device.name,
        type: this.mapHOBOSensorType(device.sensor_type),
        manufacturer: 'Onset',
        model: device.model,
        location: {
          zone: device.location || 'unassigned',
          position: { x: 0, y: 0, z: device.height || 0 }
        },
        status: device.is_active ? 'online' : 'offline'
      }));

      devices.forEach(device => this.devices.set(device.id, device));
      return devices;
    } catch (error) {
      console.error('HOBO device discovery error:', error);
      return [];
    }
  }

  async getReading(deviceId: string): Promise<SensorReading> {
    const response = await fetch(`${this.baseUrl}/api/v2/data/${deviceId}/latest`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    const data = await response.json();
    return {
      sensorId: deviceId,
      timestamp: new Date(data.timestamp),
      value: data.value,
      unit: data.unit,
      quality: data.quality || 'good'
    };
  }

  async getBulkReadings(deviceIds: string[]): Promise<Map<string, SensorReading>> {
    const readings = new Map<string, SensorReading>();
    
    // HOBO supports bulk data retrieval
    const response = await fetch(`${this.baseUrl}/api/v2/data/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ devices: deviceIds })
    });

    const data = await response.json();
    data.readings.forEach((reading: any) => {
      readings.set(reading.device_id, {
        sensorId: reading.device_id,
        timestamp: new Date(reading.timestamp),
        value: reading.value,
        unit: reading.unit,
        quality: reading.quality || 'good'
      });
    });

    return readings;
  }

  subscribeToUpdates(callback: (reading: SensorReading) => void): void {
    if (this.wsConnection) {
      this.wsConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const reading: SensorReading = {
          sensorId: data.device_id,
          timestamp: new Date(data.timestamp),
          value: data.value,
          unit: data.unit,
          quality: 'good'
        };
        callback(reading);
      };
    }
  }

  private mapHOBOSensorType(hoboType: string): SensorDevice['type'] {
    const typeMap: Record<string, SensorDevice['type']> = {
      'Temperature': 'temperature',
      'RH': 'humidity',
      'CO2': 'co2',
      'Light Intensity': 'light',
      'PAR': 'light'
    };
    return typeMap[hoboType] || 'temperature';
  }
}

// Trolmaster Integration
export class TrolmasterIntegration extends IoTSensorIntegration {
  private mqttClient?: any; // Would use MQTT.js in production

  async connect(): Promise<boolean> {
    try {
      // Trolmaster uses MQTT protocol
      // In production, would use mqtt.js library
      const response = await fetch(`${this.baseUrl}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: this.apiKey
        })
      });

      if (response.ok) {
        const { mqtt_config } = await response.json();
        // Connect to MQTT broker
        // this.mqttClient = mqtt.connect(mqtt_config.broker_url, mqtt_config.options);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Trolmaster connection error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.mqttClient) {
      // this.mqttClient.end();
    }
  }

  async discoverDevices(): Promise<SensorDevice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/devices`, {
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      const data = await response.json();
      const devices: SensorDevice[] = data.devices.map((device: any) => ({
        id: device.device_id,
        name: device.name,
        type: this.mapTrolmasterSensorType(device.type),
        manufacturer: 'Trolmaster',
        model: device.model,
        location: {
          zone: device.zone || 'unassigned',
          position: { 
            x: device.position?.x || 0, 
            y: device.position?.y || 0, 
            z: device.position?.z || 0 
          }
        },
        status: device.online ? 'online' : 'offline'
      }));

      devices.forEach(device => this.devices.set(device.id, device));
      return devices;
    } catch (error) {
      console.error('Trolmaster device discovery error:', error);
      return [];
    }
  }

  async getReading(deviceId: string): Promise<SensorReading> {
    const response = await fetch(`${this.baseUrl}/api/devices/${deviceId}/data`, {
      headers: {
        'X-API-Key': this.apiKey
      }
    });

    const data = await response.json();
    return {
      sensorId: deviceId,
      timestamp: new Date(data.timestamp),
      value: data.current_value,
      unit: data.unit,
      quality: data.status === 'normal' ? 'good' : 'uncertain'
    };
  }

  async getBulkReadings(deviceIds: string[]): Promise<Map<string, SensorReading>> {
    const readings = new Map<string, SensorReading>();
    
    // Trolmaster supports zone-based bulk retrieval
    const zones = new Set(Array.from(this.devices.values())
      .filter(d => deviceIds.includes(d.id))
      .map(d => d.location.zone));

    for (const zone of zones) {
      const response = await fetch(`${this.baseUrl}/api/zones/${zone}/data`, {
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      const data = await response.json();
      data.sensors.forEach((sensor: any) => {
        if (deviceIds.includes(sensor.device_id)) {
          readings.set(sensor.device_id, {
            sensorId: sensor.device_id,
            timestamp: new Date(sensor.timestamp),
            value: sensor.value,
            unit: sensor.unit,
            quality: sensor.quality || 'good'
          });
        }
      });
    }

    return readings;
  }

  subscribeToUpdates(callback: (reading: SensorReading) => void): void {
    // Subscribe to MQTT topics for real-time updates
    if (this.mqttClient) {
      // this.mqttClient.subscribe('trolmaster/+/data');
      // this.mqttClient.on('message', (topic: string, message: Buffer) => {
      //   const data = JSON.parse(message.toString());
      //   callback({
      //     sensorId: data.device_id,
      //     timestamp: new Date(data.timestamp),
      //     value: data.value,
      //     unit: data.unit,
      //     quality: 'good'
      //   });
      // });
    }
  }

  private mapTrolmasterSensorType(trolType: string): SensorDevice['type'] {
    const typeMap: Record<string, SensorDevice['type']> = {
      'THC-1': 'temperature',
      'RH-1': 'humidity',
      'CO2-1': 'co2',
      'LMA-14': 'light',
      'AMP-2': 'pH',
      'AMP-3': 'ec'
    };
    return typeMap[trolType] || 'temperature';
  }
}

// Generic Modbus sensor integration for industrial sensors
export class ModbusSensorIntegration extends IoTSensorIntegration {
  private registers: Map<string, number> = new Map();

  async connect(): Promise<boolean> {
    try {
      // Initialize Modbus TCP connection
      const response = await fetch(`${this.baseUrl}/modbus/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          host: this.baseUrl,
          port: 502,
          unitId: 1
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Modbus connection error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    await fetch(`${this.baseUrl}/modbus/disconnect`, {
      method: 'POST'
    });
  }

  async discoverDevices(): Promise<SensorDevice[]> {
    // Modbus devices need to be configured manually
    // This would load from a configuration file
    return [];
  }

  async getReading(deviceId: string): Promise<SensorReading> {
    const register = this.registers.get(deviceId);
    if (!register) {
      throw new Error(`Unknown device: ${deviceId}`);
    }

    const response = await fetch(`${this.baseUrl}/modbus/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        register: register,
        count: 1
      })
    });

    const data = await response.json();
    return {
      sensorId: deviceId,
      timestamp: new Date(),
      value: data.value,
      unit: data.unit || '',
      quality: 'good'
    };
  }

  async getBulkReadings(deviceIds: string[]): Promise<Map<string, SensorReading>> {
    const readings = new Map<string, SensorReading>();
    
    for (const deviceId of deviceIds) {
      try {
        const reading = await this.getReading(deviceId);
        readings.set(deviceId, reading);
      } catch (error) {
        console.error(`Failed to read ${deviceId}:`, error);
      }
    }

    return readings;
  }

  subscribeToUpdates(callback: (reading: SensorReading) => void): void {
    // Modbus doesn't support push notifications
    // Use polling instead
    this.startPolling((readings) => {
      readings.forEach(reading => callback(reading));
    });
  }
}

// Sensor Integration Manager
export class SensorIntegrationManager {
  private integrations: Map<string, IoTSensorIntegration> = new Map();
  private allReadings: Map<string, SensorReading> = new Map();
  private subscribers: ((readings: Map<string, SensorReading>) => void)[] = [];

  async addIntegration(name: string, integration: IoTSensorIntegration): Promise<boolean> {
    const connected = await integration.connect();
    if (connected) {
      this.integrations.set(name, integration);
      
      // Subscribe to updates
      integration.subscribeToUpdates((reading) => {
        this.allReadings.set(reading.sensorId, reading);
        this.notifySubscribers();
      });

      // Discover devices
      await integration.discoverDevices();
      
      return true;
    }
    return false;
  }

  async removeIntegration(name: string): Promise<void> {
    const integration = this.integrations.get(name);
    if (integration) {
      await integration.disconnect();
      this.integrations.delete(name);
    }
  }

  getIntegration(name: string): IoTSensorIntegration | undefined {
    return this.integrations.get(name);
  }

  getAllSensors(): SensorDevice[] {
    const allSensors: SensorDevice[] = [];
    this.integrations.forEach(integration => {
      allSensors.push(...integration.getAllDevices());
    });
    return allSensors;
  }

  getSensorsByZone(zone: string): SensorDevice[] {
    return this.getAllSensors().filter(sensor => sensor.location.zone === zone);
  }

  getSensorsByType(type: SensorDevice['type']): SensorDevice[] {
    return this.getAllSensors().filter(sensor => sensor.type === type);
  }

  getLatestReading(sensorId: string): SensorReading | undefined {
    return this.allReadings.get(sensorId);
  }

  subscribeToReadings(callback: (readings: Map<string, SensorReading>) => void): void {
    this.subscribers.push(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.allReadings));
  }

  // Utility method to get environmental summary for a zone
  getZoneEnvironment(zone: string): {
    temperature?: number;
    humidity?: number;
    co2?: number;
    vpd?: number;
    light?: number;
  } {
    const zoneSensors = this.getSensorsByZone(zone);
    const environment: any = {};

    zoneSensors.forEach(sensor => {
      const reading = this.allReadings.get(sensor.id);
      if (reading && reading.quality === 'good') {
        switch (sensor.type) {
          case 'temperature':
            environment.temperature = reading.value;
            break;
          case 'humidity':
            environment.humidity = reading.value;
            break;
          case 'co2':
            environment.co2 = reading.value;
            break;
          case 'light':
            environment.light = reading.value;
            break;
        }
      }
    });

    // Calculate VPD if we have temp and humidity
    if (environment.temperature !== undefined && environment.humidity !== undefined) {
      environment.vpd = this.calculateVPD(environment.temperature, environment.humidity);
    }

    return environment;
  }

  private calculateVPD(tempF: number, rh: number): number {
    // Convert to Celsius
    const tempC = (tempF - 32) * 5/9;
    
    // Calculate saturated vapor pressure
    const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
    
    // Calculate actual vapor pressure
    const avp = svp * (rh / 100);
    
    // VPD in kPa
    return svp - avp;
  }
}

// Export singleton instance
export const sensorManager = new SensorIntegrationManager();