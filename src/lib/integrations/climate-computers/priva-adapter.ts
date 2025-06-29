/**
 * Priva Climate Computer Integration Adapter
 * 
 * Integrates with Priva Connext and Priva Office systems
 * Supports both cloud and on-premise installations
 */

import { EquipmentDefinition, EquipmentType } from '@/lib/hmi/equipment-registry';

// Conditional import for Node.js only
let ModbusRTU: any;
if (typeof window === 'undefined') {
  try {
    ModbusRTU = require('modbus-serial').ModbusRTU;
  } catch (error) {
    console.warn('modbus-serial not available in browser environment');
  }
}

export interface PrivaConfig {
  type: 'cloud' | 'onpremise';
  host: string;
  port?: number;
  username: string;
  password: string;
  facilityId: string;
  // For cloud API
  apiKey?: string;
  clientId?: string;
  // For Modbus/BACnet
  modbusUnitId?: number;
  bacnetDeviceId?: number;
}

export interface PrivaDataPoint {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  type: 'sensor' | 'setpoint' | 'output';
  category: 'climate' | 'irrigation' | 'energy' | 'lighting';
}

export class PrivaAdapter {
  private config: PrivaConfig;
  private modbusClient?: ModbusRTU;
  private isConnected = false;

  constructor(config: PrivaConfig) {
    this.config = config;
  }

  /**
   * Connect to Priva system
   */
  async connect(): Promise<boolean> {
    try {
      if (this.config.type === 'cloud') {
        return await this.connectToCloud();
      } else {
        return await this.connectToOnPremise();
      }
    } catch (error) {
      console.error('Failed to connect to Priva system:', error);
      return false;
    }
  }

  /**
   * Disconnect from Priva system
   */
  async disconnect(): Promise<void> {
    if (this.modbusClient) {
      await this.modbusClient.close();
    }
    this.isConnected = false;
  }

  /**
   * Discover equipment from Priva system
   */
  async discoverEquipment(): Promise<EquipmentDefinition[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Priva system');
    }

    const equipment: EquipmentDefinition[] = [];

    // Get Priva configuration points
    const configPoints = await this.getConfigurationPoints();
    
    // Map Priva points to equipment definitions
    for (const point of configPoints) {
      const eq = this.mapPrivaPointToEquipment(point);
      if (eq) {
        equipment.push(eq);
      }
    }

    return equipment;
  }

  /**
   * Read real-time data from Priva
   */
  async readData(pointIds: string[]): Promise<PrivaDataPoint[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Priva system');
    }

    const dataPoints: PrivaDataPoint[] = [];

    if (this.config.type === 'cloud') {
      // Use Priva Cloud API
      const response = await this.callPrivaCloudAPI('/api/data/realtime', {
        pointIds,
        facilityId: this.config.facilityId
      });
      
      dataPoints.push(...response.data.map(this.parseCloudDataPoint));
    } else {
      // Use Modbus/BACnet for on-premise
      for (const pointId of pointIds) {
        const point = await this.readModbusPoint(pointId);
        if (point) {
          dataPoints.push(point);
        }
      }
    }

    return dataPoints;
  }

  /**
   * Write setpoint to Priva
   */
  async writeSetpoint(pointId: string, value: number): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Not connected to Priva system');
    }

    try {
      if (this.config.type === 'cloud') {
        await this.callPrivaCloudAPI('/api/setpoints/write', {
          pointId,
          value,
          facilityId: this.config.facilityId
        });
      } else {
        await this.writeModbusPoint(pointId, value);
      }
      return true;
    } catch (error) {
      console.error(`Failed to write setpoint ${pointId}:`, error);
      return false;
    }
  }

  /**
   * Get historical data from Priva
   */
  async getHistoricalData(
    pointIds: string[],
    startTime: Date,
    endTime: Date,
    interval: '1min' | '5min' | '15min' | '1hour' = '15min'
  ): Promise<PrivaDataPoint[]> {
    if (this.config.type === 'cloud') {
      const response = await this.callPrivaCloudAPI('/api/data/historical', {
        pointIds,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        interval,
        facilityId: this.config.facilityId
      });
      
      return response.data.map(this.parseCloudDataPoint);
    } else {
      // On-premise systems typically don't support historical data via Modbus
      // Would need to connect to Priva Office database directly
      throw new Error('Historical data not available for on-premise connections');
    }
  }

  /**
   * Get available compartments/zones from Priva
   */
  async getCompartments(): Promise<Array<{id: string, name: string, type: string}>> {
    const response = await this.callPrivaCloudAPI('/api/compartments', {
      facilityId: this.config.facilityId
    });
    
    return response.data;
  }

  /**
   * Connect to Priva Cloud API
   */
  private async connectToCloud(): Promise<boolean> {
    try {
      // Authenticate with Priva Cloud
      const authResponse = await fetch(`https://api.priva.com/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.password,
          scope: 'data:read data:write'
        })
      });

      if (!authResponse.ok) {
        throw new Error('Failed to authenticate with Priva Cloud');
      }

      const authData = await authResponse.json();
      // Store access token for future requests
      this.config.apiKey = authData.access_token;
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Priva Cloud connection failed:', error);
      return false;
    }
  }

  /**
   * Connect to on-premise Priva system via Modbus
   */
  private async connectToOnPremise(): Promise<boolean> {
    try {
      if (!ModbusRTU) {
        throw new Error('Modbus client not available in browser environment');
      }
      
      this.modbusClient = new ModbusRTU();
      await this.modbusClient.connectTCP(this.config.host, { port: this.config.port || 502 });
      this.modbusClient.setID(this.config.modbusUnitId || 1);
      
      // Test connection with a simple read
      await this.modbusClient.readHoldingRegisters(0, 1);
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Priva Modbus connection failed:', error);
      return false;
    }
  }

  /**
   * Call Priva Cloud API
   */
  private async callPrivaCloudAPI(endpoint: string, data?: any): Promise<any> {
    const response = await fetch(`https://api.priva.com${endpoint}`, {
      method: data ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`Priva API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get configuration points from Priva system
   */
  private async getConfigurationPoints(): Promise<any[]> {
    if (this.config.type === 'cloud') {
      const response = await this.callPrivaCloudAPI('/api/configuration/points', {
        facilityId: this.config.facilityId
      });
      return response.data;
    } else {
      // For on-premise, we'll use known Priva Modbus register mappings
      return this.getStandardPrivaPoints();
    }
  }

  /**
   * Standard Priva Modbus register mappings
   */
  private getStandardPrivaPoints(): any[] {
    return [
      // Climate control points
      { id: 'temp_air', name: 'Air Temperature', register: 1000, type: 'sensor', category: 'climate', unit: '°C' },
      { id: 'temp_setpoint', name: 'Temperature Setpoint', register: 1001, type: 'setpoint', category: 'climate', unit: '°C' },
      { id: 'humidity', name: 'Relative Humidity', register: 1002, type: 'sensor', category: 'climate', unit: '%' },
      { id: 'humidity_setpoint', name: 'Humidity Setpoint', register: 1003, type: 'setpoint', category: 'climate', unit: '%' },
      { id: 'co2', name: 'CO2 Concentration', register: 1004, type: 'sensor', category: 'climate', unit: 'ppm' },
      { id: 'co2_setpoint', name: 'CO2 Setpoint', register: 1005, type: 'setpoint', category: 'climate', unit: 'ppm' },
      
      // HVAC outputs
      { id: 'heating_valve', name: 'Heating Valve', register: 2000, type: 'output', category: 'climate', unit: '%' },
      { id: 'cooling_valve', name: 'Cooling Valve', register: 2001, type: 'output', category: 'climate', unit: '%' },
      { id: 'ventilation', name: 'Ventilation', register: 2002, type: 'output', category: 'climate', unit: '%' },
      
      // Irrigation
      { id: 'irrigation_pump', name: 'Irrigation Pump', register: 3000, type: 'output', category: 'irrigation', unit: '%' },
      { id: 'water_ph', name: 'Water pH', register: 3001, type: 'sensor', category: 'irrigation', unit: 'pH' },
      { id: 'water_ec', name: 'Water EC', register: 3002, type: 'sensor', category: 'irrigation', unit: 'mS/cm' },
      
      // Lighting
      { id: 'light_intensity', name: 'Light Intensity', register: 4000, type: 'output', category: 'lighting', unit: '%' },
      { id: 'light_hours', name: 'Light Hours', register: 4001, type: 'setpoint', category: 'lighting', unit: 'h' },
      
      // Energy
      { id: 'power_consumption', name: 'Power Consumption', register: 5000, type: 'sensor', category: 'energy', unit: 'kW' },
      { id: 'gas_consumption', name: 'Gas Consumption', register: 5001, type: 'sensor', category: 'energy', unit: 'm³/h' }
    ];
  }

  /**
   * Map Priva point to equipment definition
   */
  private mapPrivaPointToEquipment(point: any): EquipmentDefinition | null {
    const baseEquipment = {
      id: `priva-${point.id}`,
      name: point.name,
      location: 'Greenhouse',
      specifications: {},
      connections: [],
      controlPoints: [],
      telemetry: [],
      animations: []
    };

    // Map based on point category and type
    switch (point.category) {
      case 'climate':
        if (point.id.includes('temp')) {
          return {
            ...baseEquipment,
            type: EquipmentType.TEMP_SENSOR,
            telemetry: [{
              id: point.id,
              name: point.name,
              value: 0,
              unit: point.unit,
              min: -10,
              max: 50
            }]
          };
        } else if (point.id.includes('humidity')) {
          return {
            ...baseEquipment,
            type: EquipmentType.HUMIDITY_SENSOR,
            telemetry: [{
              id: point.id,
              name: point.name,
              value: 0,
              unit: point.unit,
              min: 0,
              max: 100
            }]
          };
        } else if (point.id.includes('co2')) {
          return {
            ...baseEquipment,
            type: EquipmentType.CO2_SENSOR,
            telemetry: [{
              id: point.id,
              name: point.name,
              value: 0,
              unit: point.unit,
              min: 300,
              max: 2000
            }]
          };
        }
        break;

      case 'irrigation':
        if (point.id.includes('pump')) {
          return {
            ...baseEquipment,
            type: EquipmentType.PUMP,
            controlPoints: [{
              id: point.id,
              name: point.name,
              type: 'range',
              value: 0,
              min: 0,
              max: 100,
              unit: '%',
              writeEnabled: true
            }]
          };
        }
        break;

      case 'lighting':
        return {
          ...baseEquipment,
          type: EquipmentType.LIGHT_CONTROLLER,
          controlPoints: [{
            id: point.id,
            name: point.name,
            type: 'range',
            value: 0,
            min: 0,
            max: 100,
            unit: '%',
            writeEnabled: true
          }]
        };
    }

    return null;
  }

  /**
   * Read Modbus point
   */
  private async readModbusPoint(pointId: string): Promise<PrivaDataPoint | null> {
    if (!this.modbusClient) return null;

    try {
      const pointConfig = this.getStandardPrivaPoints().find(p => p.id === pointId);
      if (!pointConfig) return null;

      const result = await this.modbusClient.readHoldingRegisters(pointConfig.register, 1);
      const value = result.data[0] / 10; // Priva typically uses 0.1 resolution

      return {
        id: pointId,
        name: pointConfig.name,
        value,
        unit: pointConfig.unit,
        timestamp: new Date(),
        type: pointConfig.type,
        category: pointConfig.category
      };
    } catch (error) {
      console.error(`Failed to read Modbus point ${pointId}:`, error);
      return null;
    }
  }

  /**
   * Write Modbus point
   */
  private async writeModbusPoint(pointId: string, value: number): Promise<void> {
    if (!this.modbusClient) throw new Error('Modbus client not connected');

    const pointConfig = this.getStandardPrivaPoints().find(p => p.id === pointId);
    if (!pointConfig) throw new Error(`Point ${pointId} not found`);

    const scaledValue = Math.round(value * 10); // Priva typically uses 0.1 resolution
    await this.modbusClient.writeRegister(pointConfig.register, scaledValue);
  }

  /**
   * Parse cloud API data point
   */
  private parseCloudDataPoint(data: any): PrivaDataPoint {
    return {
      id: data.pointId,
      name: data.pointName,
      value: data.value,
      unit: data.unit,
      timestamp: new Date(data.timestamp),
      type: data.type,
      category: data.category
    };
  }
}

/**
 * Factory function to create Priva adapter
 */
export function createPrivaAdapter(config: PrivaConfig): PrivaAdapter {
  return new PrivaAdapter(config);
}

/**
 * Auto-discovery function for Priva systems
 */
export async function discoverPrivaSystems(networkRange: string = '192.168.1'): Promise<PrivaConfig[]> {
  const discovered: PrivaConfig[] = [];
  
  if (!ModbusRTU) {
    console.warn('Modbus discovery not available in browser environment');
    return discovered;
  }
  
  // Scan common Priva ports and addresses
  const commonPorts = [502, 503, 504]; // Modbus TCP ports
  const hosts = [];
  
  // Generate IP range
  for (let i = 1; i <= 254; i++) {
    hosts.push(`${networkRange}.${i}`);
  }

  for (const host of hosts) {
    for (const port of commonPorts) {
      try {
        const client = new ModbusRTU();
        await client.connectTCP(host, { port });
        
        // Try to read a known Priva register
        const result = await client.readHoldingRegisters(1000, 1);
        
        if (result) {
          discovered.push({
            type: 'onpremise',
            host,
            port,
            username: 'admin',
            password: '',
            facilityId: 'auto-discovered',
            modbusUnitId: 1
          });
        }
        
        await client.close();
      } catch (error) {
        // Host not responding or not a Priva system
        continue;
      }
    }
  }

  return discovered;
}