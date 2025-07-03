/**
 * Browser-safe climate computer adapters
 * 
 * These are mock implementations that work in the browser for demo purposes
 * Real implementations would run server-side or via API calls
 */

import { EquipmentDefinition, EquipmentType } from '@/lib/hmi/equipment-registry';

// Mock configurations for demo purposes
export interface MockClimateConfig {
  id: string;
  name: string;
  brand: 'priva' | 'hortimax' | 'argus';
  host: string;
  port?: number;
  username: string;
  facilityId: string;
}

export interface MockDataPoint {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  status: 'good' | 'bad' | 'uncertain';
  type: 'sensor' | 'setpoint' | 'output';
  category: string;
}

export class BrowserSafeClimateAdapter {
  private config: MockClimateConfig;
  private isConnected = false;
  private mockData = new Map<string, MockDataPoint>();

  constructor(config: MockClimateConfig) {
    this.config = config;
    this.initializeMockData();
  }

  async connect(): Promise<boolean> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.isConnected = true;
    return true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async discoverEquipment(): Promise<EquipmentDefinition[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to climate computer');
    }

    // Return mock equipment based on brand
    return this.getMockEquipment();
  }

  async readData(pointIds: string[]): Promise<MockDataPoint[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to climate computer');
    }

    const dataPoints: MockDataPoint[] = [];
    
    for (const pointId of pointIds) {
      const mockPoint = this.mockData.get(pointId);
      if (mockPoint) {
        // Add some random variation to simulate live data
        const variation = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.1;
        dataPoints.push({
          ...mockPoint,
          value: mockPoint.value + variation,
          timestamp: new Date()
        });
      }
    }

    return dataPoints;
  }

  async writeSetpoint(pointId: string, value: number): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Not connected to climate computer');
    }

    // Simulate writing setpoint
    const mockPoint = this.mockData.get(pointId);
    if (mockPoint && mockPoint.type === 'setpoint') {
      this.mockData.set(pointId, {
        ...mockPoint,
        value,
        timestamp: new Date()
      });
      return true;
    }

    return false;
  }

  private initializeMockData(): void {
    // Initialize with typical climate computer data points
    const mockPoints: MockDataPoint[] = [
      {
        id: 'temp_air_1',
        name: 'Air Temperature 1',
        value: 24.5,
        unit: '°C',
        timestamp: new Date(),
        status: 'good',
        type: 'sensor',
        category: 'environmental'
      },
      {
        id: 'humidity_1',
        name: 'Relative Humidity 1',
        value: 65,
        unit: '%',
        timestamp: new Date(),
        status: 'good',
        type: 'sensor',
        category: 'environmental'
      },
      {
        id: 'co2_1',
        name: 'CO2 Concentration',
        value: 1200,
        unit: 'ppm',
        timestamp: new Date(),
        status: 'good',
        type: 'sensor',
        category: 'environmental'
      },
      {
        id: 'temp_setpoint',
        name: 'Temperature Setpoint',
        value: 24,
        unit: '°C',
        timestamp: new Date(),
        status: 'good',
        type: 'setpoint',
        category: 'environmental'
      },
      {
        id: 'humidity_setpoint',
        name: 'Humidity Setpoint',
        value: 60,
        unit: '%',
        timestamp: new Date(),
        status: 'good',
        type: 'setpoint',
        category: 'environmental'
      },
      {
        id: 'heating_output',
        name: 'Heating Output',
        value: 35,
        unit: '%',
        timestamp: new Date(),
        status: 'good',
        type: 'output',
        category: 'environmental'
      },
      {
        id: 'ventilation_output',
        name: 'Ventilation Output',
        value: 45,
        unit: '%',
        timestamp: new Date(),
        status: 'good',
        type: 'output',
        category: 'environmental'
      }
    ];

    for (const point of mockPoints) {
      this.mockData.set(point.id, point);
    }
  }

  private getMockEquipment(): EquipmentDefinition[] {
    const basePosition = { x: 0, y: 0, z: 0 };
    
    return [
      {
        id: `${this.config.brand}-temp-sensor-1`,
        type: EquipmentType.TEMP_SENSOR,
        name: `${this.config.brand} Temperature Sensor 1`,
        location: this.config.facilityId,
        specifications: { brand: this.config.brand },
        connections: [],
        controlPoints: [],
        telemetry: [{
          id: 'temp_air_1',
          name: 'Air Temperature',
          value: 24.5,
          unit: '°C',
          min: 0,
          max: 50
        }],
        animations: [],
        position: { ...basePosition, x: -2 }
      },
      {
        id: `${this.config.brand}-humidity-sensor-1`,
        type: EquipmentType.HUMIDITY_SENSOR,
        name: `${this.config.brand} Humidity Sensor 1`,
        location: this.config.facilityId,
        specifications: { brand: this.config.brand },
        connections: [],
        controlPoints: [],
        telemetry: [{
          id: 'humidity_1',
          name: 'Relative Humidity',
          value: 65,
          unit: '%',
          min: 0,
          max: 100
        }],
        animations: [],
        position: { ...basePosition, x: 2 }
      },
      {
        id: `${this.config.brand}-co2-sensor-1`,
        type: EquipmentType.CO2_SENSOR,
        name: `${this.config.brand} CO2 Sensor`,
        location: this.config.facilityId,
        specifications: { brand: this.config.brand },
        connections: [],
        controlPoints: [],
        telemetry: [{
          id: 'co2_1',
          name: 'CO2 Concentration',
          value: 1200,
          unit: 'ppm',
          min: 300,
          max: 2000
        }],
        animations: [],
        position: { ...basePosition, y: 3 }
      },
      {
        id: `${this.config.brand}-heater-1`,
        type: EquipmentType.HEATER,
        name: `${this.config.brand} Heating System`,
        location: this.config.facilityId,
        specifications: { brand: this.config.brand },
        connections: [],
        controlPoints: [{
          id: 'heating_output',
          name: 'Heating Output',
          type: 'range',
          value: 35,
          min: 0,
          max: 100,
          unit: '%',
          writeEnabled: true
        }],
        telemetry: [{
          id: 'heating_power',
          name: 'Power Consumption',
          value: 2.5,
          unit: 'kW',
          min: 0,
          max: 10
        }],
        animations: [],
        position: { ...basePosition, x: -5, y: -2 }
      },
      {
        id: `${this.config.brand}-fan-1`,
        type: EquipmentType.FAN,
        name: `${this.config.brand} Ventilation Fan`,
        location: this.config.facilityId,
        specifications: { brand: this.config.brand },
        connections: [],
        controlPoints: [{
          id: 'ventilation_output',
          name: 'Fan Speed',
          type: 'range',
          value: 45,
          min: 0,
          max: 100,
          unit: '%',
          writeEnabled: true
        }],
        telemetry: [{
          id: 'fan_rpm',
          name: 'RPM',
          value: 1350,
          unit: 'RPM',
          min: 0,
          max: 3000
        }],
        animations: [],
        position: { ...basePosition, x: 5, y: -2 }
      }
    ];
  }
}

// Browser-safe discovery functions
export async function discoverMockSystems(networkRange: string = '192.168.1'): Promise<MockClimateConfig[]> {
  // Simulate discovery delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock discovered systems
  return [
    {
      id: 'mock-priva-1',
      name: 'Priva Connext (Demo)',
      brand: 'priva',
      host: '192.168.1.101',
      port: 502,
      username: 'admin',
      facilityId: 'facility-1'
    },
    {
      id: 'mock-hortimax-1', 
      name: 'Hortimax Synopta (Demo)',
      brand: 'hortimax',
      host: '192.168.1.102',
      port: 1200,
      username: 'admin',
      facilityId: 'facility-1'
    },
    {
      id: 'mock-argus-1',
      name: 'Argus Titan (Demo)',
      brand: 'argus',
      host: '192.168.1.103',
      port: 502,
      username: 'admin',
      facilityId: 'facility-1'
    }
  ];
}

export function createBrowserSafeAdapter(config: MockClimateConfig): BrowserSafeClimateAdapter {
  return new BrowserSafeClimateAdapter(config);
}