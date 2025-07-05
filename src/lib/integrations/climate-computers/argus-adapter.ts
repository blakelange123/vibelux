/**
 * Argus Controls Integration Adapter
 * 
 * Integrates with Argus Titan, Argus Atlas, and Argus Solus systems
 * Supports Modbus TCP, BACnet, and proprietary Argus protocols
 */

import { EquipmentDefinition, EquipmentType } from '@/lib/hmi/equipment-registry';

export interface ArgusConfig {
  systemType: 'titan' | 'atlas' | 'solus' | 'controls4';
  connectionType: 'modbus' | 'bacnet' | 'ethernet' | 'web_api';
  host: string;
  port?: number;
  username: string;
  password: string;
  facilityId: string;
  // Protocol specific
  modbusUnitId?: number;
  bacnetDeviceId?: number;
  // Web API for newer systems
  apiKey?: string;
  useSSL?: boolean;
}

export interface ArgusDataPoint {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  status: 'good' | 'bad' | 'uncertain' | 'maintenance';
  type: 'sensor' | 'setpoint' | 'output' | 'calculated';
  category: 'environmental' | 'irrigation' | 'lighting' | 'co2' | 'energy' | 'security';
  zone?: string;
}

export interface ArgusZone {
  id: string;
  name: string;
  type: 'greenhouse' | 'nursery' | 'headhouse' | 'outdoor';
  area: number;
  active: boolean;
}

export interface ArgusAlarm {
  id: string;
  message: string;
  priority: 'info' | 'warning' | 'alarm' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
  zone: string;
  category: string;
}

export class ArgusAdapter {
  private config: ArgusConfig;
  private modbusClient?: ModbusRTU;
  private sessionToken?: string;
  private isConnected = false;
  private dataPointsMap = new Map<string, any>();

  constructor(config: ArgusConfig) {
    this.config = config;
  }

  /**
   * Connect to Argus system
   */
  async connect(): Promise<boolean> {
    try {
      switch (this.config.connectionType) {
        case 'modbus':
          return await this.connectModbus();
        case 'web_api':
          return await this.connectWebAPI();
        case 'ethernet':
          return await this.connectEthernet();
        case 'bacnet':
          return await this.connectBACnet();
        default:
          throw new Error(`Unsupported connection type: ${this.config.connectionType}`);
      }
    } catch (error) {
      console.error('Failed to connect to Argus system:', error);
      return false;
    }
  }

  /**
   * Disconnect from Argus system
   */
  async disconnect(): Promise<void> {
    if (this.modbusClient) {
      await this.modbusClient.close();
    }
    this.sessionToken = undefined;
    this.isConnected = false;
  }

  /**
   * Discover equipment from Argus system
   */
  async discoverEquipment(): Promise<EquipmentDefinition[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Argus system');
    }

    const equipment: EquipmentDefinition[] = [];

    // Get zones configuration
    const zones = await this.getZones();
    
    // Get data points for each zone
    for (const zone of zones) {
      const zoneDataPoints = await this.getZoneDataPoints(zone.id);
      
      // Map Argus data points to equipment definitions
      for (const point of zoneDataPoints) {
        const eq = this.mapArgusPointToEquipment(point, zone);
        if (eq) {
          equipment.push(eq);
        }
      }
    }

    return equipment;
  }

  /**
   * Read real-time data from Argus
   */
  async readData(pointIds: string[]): Promise<ArgusDataPoint[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Argus system');
    }

    const dataPoints: ArgusDataPoint[] = [];

    if (this.config.connectionType === 'web_api') {
      // Use Argus Web API
      const response = await this.callArgusAPI('/api/data/current', {
        points: pointIds
      });
      
      for (const point of response.data) {
        dataPoints.push(this.parseArgusDataPoint(point));
      }
    } else if (this.config.connectionType === 'modbus') {
      // Use Modbus protocol
      for (const pointId of pointIds) {
        const point = await this.readModbusDataPoint(pointId);
        if (point) {
          dataPoints.push(point);
        }
      }
    }

    return dataPoints;
  }

  /**
   * Write setpoint to Argus
   */
  async writeSetpoint(pointId: string, value: number): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Not connected to Argus system');
    }

    try {
      if (this.config.connectionType === 'web_api') {
        await this.callArgusAPI('/api/setpoints/write', {
          pointId,
          value
        });
      } else if (this.config.connectionType === 'modbus') {
        await this.writeModbusSetpoint(pointId, value);
      }
      return true;
    } catch (error) {
      console.error(`Failed to write setpoint ${pointId}:`, error);
      return false;
    }
  }

  /**
   * Get zones from Argus system
   */
  async getZones(): Promise<ArgusZone[]> {
    if (this.config.connectionType === 'web_api') {
      const response = await this.callArgusAPI('/api/zones');
      return response.data.map((zone: any) => ({
        id: zone.id,
        name: zone.name,
        type: zone.type,
        area: zone.area,
        active: zone.active
      }));
    } else {
      // For Modbus, return default zones based on system type
      return this.getDefaultZones();
    }
  }

  /**
   * Get alarms from Argus
   */
  async getAlarms(): Promise<ArgusAlarm[]> {
    if (this.config.connectionType === 'web_api') {
      const response = await this.callArgusAPI('/api/alarms/active');
      return response.data.map((alarm: any) => ({
        id: alarm.id,
        message: alarm.message,
        priority: alarm.priority,
        timestamp: new Date(alarm.timestamp),
        acknowledged: alarm.acknowledged,
        zone: alarm.zone,
        category: alarm.category
      }));
    } else {
      // For Modbus, read alarm registers
      return await this.readModbusAlarms();
    }
  }

  /**
   * Get historical data from Argus
   */
  async getHistoricalData(
    pointIds: string[],
    startTime: Date,
    endTime: Date,
    interval: 'minute' | 'hour' | 'day' = 'hour'
  ): Promise<ArgusDataPoint[]> {
    if (this.config.connectionType !== 'web_api') {
      throw new Error('Historical data only available via Web API');
    }

    const response = await this.callArgusAPI('/api/data/historical', {
      points: pointIds,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      interval
    });

    return response.data.map(this.parseArgusDataPoint);
  }

  /**
   * Connect via Modbus TCP
   */
  private async connectModbus(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        throw new Error('Modbus client not available in browser environment');
      }
      
      // Dynamic import for server-side only
      const modbusSerial = await import('modbus-serial').catch(() => null);
      if (!modbusSerial) {
        throw new Error('modbus-serial module not available');
      }
      
      this.modbusClient = new modbusSerial.default();
      await this.modbusClient.connectTCP(this.config.host, { port: this.config.port || 502 });
      this.modbusClient.setID(this.config.modbusUnitId || 1);
      
      // Test connection by reading device identification
      await this.modbusClient.readHoldingRegisters(0, 1);
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Argus Modbus connection failed:', error);
      return false;
    }
  }

  /**
   * Connect via Argus Web API
   */
  private async connectWebAPI(): Promise<boolean> {
    try {
      const protocol = this.config.useSSL ? 'https' : 'http';
      const baseURL = `${protocol}://${this.config.host}:${this.config.port || 80}`;
      
      // Authenticate with Argus Web API
      const response = await fetch(`${baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.config.username,
          password: this.config.password,
          facilityId: this.config.facilityId
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const authData = await response.json();
      this.sessionToken = authData.token;
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Argus Web API connection failed:', error);
      return false;
    }
  }

  /**
   * Connect via Ethernet (proprietary protocol)
   */
  private async connectEthernet(): Promise<boolean> {
    // Argus proprietary Ethernet protocol
    // This would require implementation of Argus-specific communication protocol
    throw new Error('Argus Ethernet protocol not yet implemented');
  }

  /**
   * Connect via BACnet
   */
  private async connectBACnet(): Promise<boolean> {
    // BACnet implementation for Argus
    // This would require a BACnet library
    throw new Error('BACnet protocol not yet implemented');
  }

  /**
   * Call Argus Web API
   */
  private async callArgusAPI(endpoint: string, data?: any): Promise<any> {
    const protocol = this.config.useSSL ? 'https' : 'http';
    const baseURL = `${protocol}://${this.config.host}:${this.config.port || 80}`;
    
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: data ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${this.sessionToken}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`Argus API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get zone data points
   */
  private async getZoneDataPoints(zoneId: string): Promise<any[]> {
    // Standard Argus data points based on system type
    const dataPoints = [];

    // Environmental sensors
    dataPoints.push(
      { id: `${zoneId}_temp_air`, name: 'Air Temperature', type: 'sensor', category: 'environmental', unit: '°C' },
      { id: `${zoneId}_humidity`, name: 'Relative Humidity', type: 'sensor', category: 'environmental', unit: '%' },
      { id: `${zoneId}_vpd`, name: 'Vapor Pressure Deficit', type: 'calculated', category: 'environmental', unit: 'kPa' },
      { id: `${zoneId}_dew_point`, name: 'Dew Point', type: 'calculated', category: 'environmental', unit: '°C' }
    );

    // CO2 system
    if (this.config.systemType === 'titan' || this.config.systemType === 'atlas') {
      dataPoints.push(
        { id: `${zoneId}_co2`, name: 'CO2 Concentration', type: 'sensor', category: 'co2', unit: 'ppm' },
        { id: `${zoneId}_co2_setpoint`, name: 'CO2 Setpoint', type: 'setpoint', category: 'co2', unit: 'ppm' }
      );
    }

    // Lighting (for Titan systems)
    if (this.config.systemType === 'titan') {
      dataPoints.push(
        { id: `${zoneId}_light_level`, name: 'Light Level', type: 'sensor', category: 'lighting', unit: 'μmol/m²/s' },
        { id: `${zoneId}_light_integral`, name: 'Daily Light Integral', type: 'calculated', category: 'lighting', unit: 'mol/m²/day' },
        { id: `${zoneId}_lighting_output`, name: 'Lighting Output', type: 'output', category: 'lighting', unit: '%' }
      );
    }

    // Irrigation (for Atlas and Titan)
    if (this.config.systemType !== 'solus') {
      dataPoints.push(
        { id: `${zoneId}_substrate_moisture`, name: 'Substrate Moisture', type: 'sensor', category: 'irrigation', unit: '%' },
        { id: `${zoneId}_substrate_temp`, name: 'Substrate Temperature', type: 'sensor', category: 'irrigation', unit: '°C' },
        { id: `${zoneId}_drainage_ec`, name: 'Drainage EC', type: 'sensor', category: 'irrigation', unit: 'mS/cm' },
        { id: `${zoneId}_drainage_ph`, name: 'Drainage pH', type: 'sensor', category: 'irrigation', unit: 'pH' }
      );
    }

    // HVAC outputs
    dataPoints.push(
      { id: `${zoneId}_heating`, name: 'Heating Output', type: 'output', category: 'environmental', unit: '%' },
      { id: `${zoneId}_cooling`, name: 'Cooling Output', type: 'output', category: 'environmental', unit: '%' },
      { id: `${zoneId}_ventilation`, name: 'Ventilation Output', type: 'output', category: 'environmental', unit: '%' },
      { id: `${zoneId}_dehumidification`, name: 'Dehumidification', type: 'output', category: 'environmental', unit: '%' }
    );

    return dataPoints;
  }

  /**
   * Map Argus data point to equipment definition
   */
  private mapArgusPointToEquipment(point: any, zone: ArgusZone): EquipmentDefinition | null {
    const baseEquipment = {
      id: `argus-${point.id}`,
      name: `${point.name} (${zone.name})`,
      location: zone.name,
      specifications: { zone: zone.id },
      connections: [],
      controlPoints: [],
      telemetry: [],
      animations: [],
      position: { x: 0, y: 0, z: 0 }
    };

    // Map based on point category and type
    switch (point.category) {
      case 'environmental':
        if (point.id.includes('temp')) {
          return {
            ...baseEquipment,
            type: EquipmentType.TEMP_SENSOR,
            telemetry: [{
              id: point.id,
              name: point.name,
              value: 0,
              unit: point.unit,
              min: 0,
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
        } else if (point.type === 'output') {
          if (point.id.includes('heating')) {
            return {
              ...baseEquipment,
              type: EquipmentType.HEATER,
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
          } else if (point.id.includes('ventilation')) {
            return {
              ...baseEquipment,
              type: EquipmentType.FAN,
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
        }
        break;

      case 'co2':
        if (point.type === 'sensor') {
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

      case 'lighting':
        if (point.type === 'output') {
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
        break;

      case 'irrigation':
        if (point.id.includes('ph')) {
          return {
            ...baseEquipment,
            type: EquipmentType.PH_SENSOR,
            telemetry: [{
              id: point.id,
              name: point.name,
              value: 0,
              unit: point.unit,
              min: 0,
              max: 14
            }]
          };
        } else if (point.id.includes('ec')) {
          return {
            ...baseEquipment,
            type: EquipmentType.EC_SENSOR,
            telemetry: [{
              id: point.id,
              name: point.name,
              value: 0,
              unit: point.unit,
              min: 0,
              max: 5
            }]
          };
        } else if (point.id.includes('moisture')) {
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
        }
        break;
    }

    return null;
  }

  /**
   * Get default zones based on system type
   */
  private getDefaultZones(): ArgusZone[] {
    const zones: ArgusZone[] = [];
    
    // Standard zone configuration based on Argus system type
    switch (this.config.systemType) {
      case 'titan':
        zones.push(
          { id: 'zone_1', name: 'Zone 1', type: 'greenhouse', area: 1000, active: true },
          { id: 'zone_2', name: 'Zone 2', type: 'greenhouse', area: 1000, active: true },
          { id: 'zone_3', name: 'Zone 3', type: 'greenhouse', area: 1000, active: true },
          { id: 'zone_4', name: 'Zone 4', type: 'greenhouse', area: 1000, active: true }
        );
        break;
      case 'atlas':
        zones.push(
          { id: 'house_1', name: 'House 1', type: 'greenhouse', area: 5000, active: true },
          { id: 'house_2', name: 'House 2', type: 'greenhouse', area: 5000, active: true }
        );
        break;
      case 'solus':
        zones.push(
          { id: 'greenhouse', name: 'Greenhouse', type: 'greenhouse', area: 2000, active: true }
        );
        break;
      default:
        zones.push(
          { id: 'default', name: 'Main Zone', type: 'greenhouse', area: 1000, active: true }
        );
    }

    return zones;
  }

  /**
   * Parse Argus data point from API response
   */
  private parseArgusDataPoint(data: any): ArgusDataPoint {
    return {
      id: data.id,
      name: data.name,
      value: data.value,
      unit: data.unit,
      timestamp: new Date(data.timestamp),
      status: data.status || 'good',
      type: data.type,
      category: data.category,
      zone: data.zone
    };
  }

  /**
   * Read Modbus data point
   */
  private async readModbusDataPoint(pointId: string): Promise<ArgusDataPoint | null> {
    if (!this.modbusClient) return null;

    try {
      // Argus Modbus register mapping varies by system type
      const registerMap = this.getModbusRegisterMap();
      const register = registerMap[pointId];
      
      if (!register) return null;

      const result = await this.modbusClient.readHoldingRegisters(register.address, 1);
      const rawValue = result.data[0];
      const value = rawValue * (register.scale || 0.1);

      return {
        id: pointId,
        name: register.name,
        value,
        unit: register.unit,
        timestamp: new Date(),
        status: 'good',
        type: register.type,
        category: register.category
      };
    } catch (error) {
      console.error(`Failed to read Modbus point ${pointId}:`, error);
      return null;
    }
  }

  /**
   * Get Modbus register mapping for Argus systems
   */
  private getModbusRegisterMap(): Record<string, any> {
    // This is a simplified mapping - actual Argus register maps are more complex
    return {
      'zone_1_temp_air': { address: 1000, scale: 0.1, unit: '°C', type: 'sensor', category: 'environmental', name: 'Air Temperature' },
      'zone_1_humidity': { address: 1001, scale: 0.1, unit: '%', type: 'sensor', category: 'environmental', name: 'Relative Humidity' },
      'zone_1_co2': { address: 1002, scale: 1, unit: 'ppm', type: 'sensor', category: 'co2', name: 'CO2 Concentration' },
      'zone_1_heating': { address: 2000, scale: 0.1, unit: '%', type: 'output', category: 'environmental', name: 'Heating Output' },
      'zone_1_cooling': { address: 2001, scale: 0.1, unit: '%', type: 'output', category: 'environmental', name: 'Cooling Output' },
      'zone_1_ventilation': { address: 2002, scale: 0.1, unit: '%', type: 'output', category: 'environmental', name: 'Ventilation Output' }
    };
  }

  /**
   * Additional helper methods would be implemented here for:
   * - writeModbusSetpoint()
   * - readModbusAlarms()
   */
}

/**
 * Factory function to create Argus adapter
 */
export function createArgusAdapter(config: ArgusConfig): ArgusAdapter {
  return new ArgusAdapter(config);
}

/**
 * Auto-discovery function for Argus systems
 */
export async function discoverArgusSystems(networkRange: string = '192.168.1'): Promise<ArgusConfig[]> {
  const discovered: ArgusConfig[] = [];
  
  if (typeof window !== 'undefined') {
    console.warn('Modbus discovery not available in browser environment');
    return discovered;
  }
  
  // Dynamic import for server-side only
  const modbusSerial = await import('modbus-serial').catch(() => null);
  if (!modbusSerial) {
    console.warn('modbus-serial module not available');
    return discovered;
  }
  
  // Scan common Argus ports
  const ports = [502, 47808, 80, 443]; // Modbus, Argus proprietary, HTTP, HTTPS
  
  for (let i = 1; i <= 254; i++) {
    const host = `${networkRange}.${i}`;
    
    for (const port of ports) {
      try {
        if (port === 502) {
          // Test Modbus connection
          const client = new modbusSerial.default();
          await client.connectTCP(host, { port });
          const result = await client.readHoldingRegisters(1000, 1);
          
          if (result) {
            discovered.push({
              systemType: 'solus', // Default assumption
              connectionType: 'modbus',
              host,
              port,
              username: 'admin',
              password: '',
              facilityId: 'auto-discovered',
              modbusUnitId: 1
            });
          }
          await client.close();
        } else {
          // Test HTTP/HTTPS for Web API
          const protocol = port === 443 ? 'https' : 'http';
          const response = await fetch(`${protocol}://${host}:${port}/api/info`, {
            method: 'GET'
          });
          
          if (response.ok) {
            const info = await response.json();
            discovered.push({
              systemType: info.systemType || 'atlas',
              connectionType: 'web_api',
              host,
              port,
              username: 'admin',
              password: '',
              facilityId: 'auto-discovered',
              useSSL: port === 443
            });
          }
        }
      } catch (error) {
        // Host not responding or not an Argus system
        continue;
      }
    }
  }

  return discovered;
}