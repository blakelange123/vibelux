/**
 * Hortimax Climate Computer Integration Adapter
 * 
 * Integrates with Hortimax Synopta and Hortimax Manager systems
 * Supports both TCP/IP and RS485 connections
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

export interface HortimaxConfig {
  type: 'synopta' | 'manager' | 'modbus';
  host: string;
  port?: number;
  username: string;
  password: string;
  greenhouseId: string;
  // Protocol specific
  modbusUnitId?: number;
  tcpPort?: number;
  // API access for newer systems
  apiVersion?: 'v1' | 'v2';
  clientCertificate?: string;
}

export interface HortimaxDataPoint {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  quality: 'good' | 'bad' | 'uncertain';
  type: 'measurement' | 'setpoint' | 'output' | 'alarm';
  group: 'climate' | 'irrigation' | 'lighting' | 'co2' | 'energy';
}

export interface HortimaxAlarm {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
  group: string;
}

export class HortimaxAdapter {
  private config: HortimaxConfig;
  private modbusClient?: ModbusRTU;
  private tcpSocket?: any;
  private isConnected = false;
  private dataCache = new Map<string, HortimaxDataPoint>();

  constructor(config: HortimaxConfig) {
    this.config = config;
  }

  /**
   * Connect to Hortimax system
   */
  async connect(): Promise<boolean> {
    try {
      switch (this.config.type) {
        case 'synopta':
          return await this.connectToSynopta();
        case 'manager':
          return await this.connectToManager();
        case 'modbus':
          return await this.connectToModbus();
        default:
          throw new Error(`Unsupported Hortimax type: ${this.config.type}`);
      }
    } catch (error) {
      console.error('Failed to connect to Hortimax system:', error);
      return false;
    }
  }

  /**
   * Disconnect from Hortimax system
   */
  async disconnect(): Promise<void> {
    if (this.modbusClient) {
      await this.modbusClient.close();
    }
    if (this.tcpSocket) {
      this.tcpSocket.destroy();
    }
    this.isConnected = false;
  }

  /**
   * Discover equipment from Hortimax system
   */
  async discoverEquipment(): Promise<EquipmentDefinition[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Hortimax system');
    }

    const equipment: EquipmentDefinition[] = [];

    // Get Hortimax I/O configuration
    const ioConfig = await this.getIOConfiguration();
    
    // Get data points configuration
    const dataPoints = await this.getDataPointsConfiguration();
    
    // Map Hortimax configuration to equipment definitions
    for (const point of dataPoints) {
      const eq = this.mapHortimaxPointToEquipment(point);
      if (eq) {
        equipment.push(eq);
      }
    }

    return equipment;
  }

  /**
   * Read real-time data from Hortimax
   */
  async readData(pointIds: string[]): Promise<HortimaxDataPoint[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Hortimax system');
    }

    const dataPoints: HortimaxDataPoint[] = [];

    for (const pointId of pointIds) {
      const point = await this.readDataPoint(pointId);
      if (point) {
        dataPoints.push(point);
        this.dataCache.set(pointId, point);
      }
    }

    return dataPoints;
  }

  /**
   * Write setpoint to Hortimax
   */
  async writeSetpoint(pointId: string, value: number): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Not connected to Hortimax system');
    }

    try {
      if (this.config.type === 'modbus') {
        await this.writeModbusSetpoint(pointId, value);
      } else {
        await this.writeTcpSetpoint(pointId, value);
      }
      return true;
    } catch (error) {
      console.error(`Failed to write setpoint ${pointId}:`, error);
      return false;
    }
  }

  /**
   * Get active alarms from Hortimax
   */
  async getAlarms(): Promise<HortimaxAlarm[]> {
    if (this.config.type === 'modbus') {
      return await this.readModbusAlarms();
    } else {
      return await this.readTcpAlarms();
    }
  }

  /**
   * Get historical data from Hortimax
   */
  async getHistoricalData(
    pointIds: string[],
    startTime: Date,
    endTime: Date,
    interval: number = 300 // seconds
  ): Promise<HortimaxDataPoint[]> {
    const historicalData: HortimaxDataPoint[] = [];

    if (this.config.type === 'synopta' || this.config.type === 'manager') {
      // Use TCP protocol for historical data requests
      for (const pointId of pointIds) {
        const data = await this.requestHistoricalData(pointId, startTime, endTime, interval);
        historicalData.push(...data);
      }
    } else {
      throw new Error('Historical data not available via Modbus connection');
    }

    return historicalData;
  }

  /**
   * Get greenhouse compartments/sections
   */
  async getCompartments(): Promise<Array<{id: string, name: string, type: string}>> {
    const compartments = [];
    
    // Hortimax typically organizes by sections or compartments
    const sectionConfig = await this.getSectionConfiguration();
    
    for (const section of sectionConfig) {
      compartments.push({
        id: section.id,
        name: section.name,
        type: section.type || 'greenhouse'
      });
    }

    return compartments;
  }

  /**
   * Connect to Hortimax Synopta system
   */
  private async connectToSynopta(): Promise<boolean> {
    try {
      // Synopta uses proprietary TCP protocol
      const net = require('net');
      this.tcpSocket = new net.Socket();
      
      return new Promise((resolve, reject) => {
        this.tcpSocket.connect(this.config.tcpPort || 1200, this.config.host, () => {
          // Send authentication packet
          const authPacket = this.buildSynoptaAuthPacket();
          this.tcpSocket.write(authPacket);
        });

        this.tcpSocket.on('data', (data: Buffer) => {
          if (this.processSynoptaResponse(data)) {
            this.isConnected = true;
            resolve(true);
          }
        });

        this.tcpSocket.on('error', (error: Error) => {
          reject(error);
        });

        setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);
      });
    } catch (error) {
      console.error('Synopta connection failed:', error);
      return false;
    }
  }

  /**
   * Connect to Hortimax Manager system
   */
  private async connectToManager(): Promise<boolean> {
    try {
      // Manager uses OPC or TCP/IP protocol
      const net = require('net');
      this.tcpSocket = new net.Socket();
      
      return new Promise((resolve, reject) => {
        this.tcpSocket.connect(this.config.tcpPort || 2000, this.config.host, () => {
          // Send Manager protocol handshake
          const handshakePacket = this.buildManagerHandshakePacket();
          this.tcpSocket.write(handshakePacket);
        });

        this.tcpSocket.on('data', (data: Buffer) => {
          if (this.processManagerResponse(data)) {
            this.isConnected = true;
            resolve(true);
          }
        });

        this.tcpSocket.on('error', (error: Error) => {
          reject(error);
        });

        setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);
      });
    } catch (error) {
      console.error('Manager connection failed:', error);
      return false;
    }
  }

  /**
   * Connect via Modbus TCP
   */
  private async connectToModbus(): Promise<boolean> {
    try {
      if (!ModbusRTU) {
        throw new Error('Modbus client not available in browser environment');
      }
      
      this.modbusClient = new ModbusRTU();
      await this.modbusClient.connectTCP(this.config.host, { port: this.config.port || 502 });
      this.modbusClient.setID(this.config.modbusUnitId || 1);
      
      // Test connection
      await this.modbusClient.readHoldingRegisters(0, 1);
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Hortimax Modbus connection failed:', error);
      return false;
    }
  }

  /**
   * Get I/O configuration from Hortimax
   */
  private async getIOConfiguration(): Promise<any[]> {
    if (this.config.type === 'modbus') {
      // For Modbus, use standard Hortimax register mapping
      return this.getStandardHortimaxIO();
    } else {
      // For TCP protocols, request I/O configuration
      return await this.requestIOConfiguration();
    }
  }

  /**
   * Get data points configuration
   */
  private async getDataPointsConfiguration(): Promise<any[]> {
    return [
      // Climate measurements
      { id: 'temp_air_1', name: 'Air Temperature 1', type: 'measurement', group: 'climate', unit: '°C', register: 1000 },
      { id: 'temp_air_2', name: 'Air Temperature 2', type: 'measurement', group: 'climate', unit: '°C', register: 1001 },
      { id: 'humidity_1', name: 'Relative Humidity 1', type: 'measurement', group: 'climate', unit: '%', register: 1002 },
      { id: 'humidity_2', name: 'Relative Humidity 2', type: 'measurement', group: 'climate', unit: '%', register: 1003 },
      
      // Climate setpoints
      { id: 'temp_setpoint_day', name: 'Temperature Setpoint Day', type: 'setpoint', group: 'climate', unit: '°C', register: 2000 },
      { id: 'temp_setpoint_night', name: 'Temperature Setpoint Night', type: 'setpoint', group: 'climate', unit: '°C', register: 2001 },
      { id: 'humidity_setpoint', name: 'Humidity Setpoint', type: 'setpoint', group: 'climate', unit: '%', register: 2002 },
      
      // HVAC outputs
      { id: 'heating_output', name: 'Heating Output', type: 'output', group: 'climate', unit: '%', register: 3000 },
      { id: 'cooling_output', name: 'Cooling Output', type: 'output', group: 'climate', unit: '%', register: 3001 },
      { id: 'ventilation_output', name: 'Ventilation Output', type: 'output', group: 'climate', unit: '%', register: 3002 },
      { id: 'dehumidification', name: 'Dehumidification', type: 'output', group: 'climate', unit: '%', register: 3003 },
      
      // CO2 system
      { id: 'co2_measurement', name: 'CO2 Concentration', type: 'measurement', group: 'co2', unit: 'ppm', register: 1010 },
      { id: 'co2_setpoint', name: 'CO2 Setpoint', type: 'setpoint', group: 'co2', unit: 'ppm', register: 2010 },
      { id: 'co2_dosing', name: 'CO2 Dosing', type: 'output', group: 'co2', unit: '%', register: 3010 },
      
      // Irrigation system
      { id: 'water_giving', name: 'Water Giving', type: 'output', group: 'irrigation', unit: 'ml/m²', register: 4000 },
      { id: 'drain_percentage', name: 'Drain Percentage', type: 'measurement', group: 'irrigation', unit: '%', register: 1020 },
      { id: 'substrate_moisture', name: 'Substrate Moisture', type: 'measurement', group: 'irrigation', unit: '%', register: 1021 },
      { id: 'ph_measurement', name: 'pH Measurement', type: 'measurement', group: 'irrigation', unit: 'pH', register: 1022 },
      { id: 'ec_measurement', name: 'EC Measurement', type: 'measurement', group: 'irrigation', unit: 'mS/cm', register: 1023 },
      
      // Lighting
      { id: 'light_intensity', name: 'Light Intensity', type: 'measurement', group: 'lighting', unit: 'W/m²', register: 1030 },
      { id: 'assimilation_light', name: 'Assimilation Light', type: 'output', group: 'lighting', unit: '%', register: 4010 },
      { id: 'photoperiod', name: 'Photoperiod', type: 'setpoint', group: 'lighting', unit: 'hours', register: 2020 },
      
      // Energy management
      { id: 'power_consumption', name: 'Power Consumption', type: 'measurement', group: 'energy', unit: 'kW', register: 1040 },
      { id: 'gas_consumption', name: 'Gas Consumption', type: 'measurement', group: 'energy', unit: 'm³/h', register: 1041 },
      { id: 'heat_consumption', name: 'Heat Consumption', type: 'measurement', group: 'energy', unit: 'GJ/h', register: 1042 }
    ];
  }

  /**
   * Standard Hortimax I/O configuration
   */
  private getStandardHortimaxIO(): any[] {
    return [
      // Analog inputs (AI)
      { type: 'AI', channel: 1, name: 'Temperature 1', unit: '°C' },
      { type: 'AI', channel: 2, name: 'Temperature 2', unit: '°C' },
      { type: 'AI', channel: 3, name: 'Humidity 1', unit: '%' },
      { type: 'AI', channel: 4, name: 'Humidity 2', unit: '%' },
      { type: 'AI', channel: 5, name: 'CO2 Sensor', unit: 'ppm' },
      { type: 'AI', channel: 6, name: 'Light Sensor', unit: 'W/m²' },
      
      // Analog outputs (AO)
      { type: 'AO', channel: 1, name: 'Heating Valve', unit: '%' },
      { type: 'AO', channel: 2, name: 'Cooling Valve', unit: '%' },
      { type: 'AO', channel: 3, name: 'Ventilation Motor', unit: '%' },
      { type: 'AO', channel: 4, name: 'CO2 Valve', unit: '%' },
      
      // Digital outputs (DO)
      { type: 'DO', channel: 1, name: 'Irrigation Pump' },
      { type: 'DO', channel: 2, name: 'Misting System' },
      { type: 'DO', channel: 3, name: 'Grow Lights' },
      { type: 'DO', channel: 4, name: 'Circulation Fan' }
    ];
  }

  /**
   * Map Hortimax point to equipment definition
   */
  private mapHortimaxPointToEquipment(point: any): EquipmentDefinition | null {
    const baseEquipment = {
      id: `hortimax-${point.id}`,
      name: point.name,
      location: 'Greenhouse',
      specifications: {},
      connections: [],
      controlPoints: [],
      telemetry: [],
      animations: [],
      position: { x: 0, y: 0, z: 0 }
    };

    switch (point.group) {
      case 'climate':
        if (point.type === 'measurement') {
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
          }
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
        if (point.type === 'measurement') {
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
    }

    return null;
  }

  /**
   * Read data point from Hortimax
   */
  private async readDataPoint(pointId: string): Promise<HortimaxDataPoint | null> {
    const pointConfig = this.getDataPointsConfiguration().find(p => p.id === pointId);
    if (!pointConfig) return null;

    try {
      let value: number;

      if (this.config.type === 'modbus') {
        const result = await this.modbusClient!.readHoldingRegisters(pointConfig.register, 1);
        value = result.data[0] / 10; // Hortimax typically uses 0.1 resolution
      } else {
        value = await this.readTcpDataPoint(pointId);
      }

      return {
        id: pointId,
        name: pointConfig.name,
        value,
        unit: pointConfig.unit,
        timestamp: new Date(),
        quality: 'good',
        type: pointConfig.type,
        group: pointConfig.group
      };
    } catch (error) {
      console.error(`Failed to read data point ${pointId}:`, error);
      return null;
    }
  }

  /**
   * Build Synopta authentication packet
   */
  private buildSynoptaAuthPacket(): Buffer {
    // Synopta protocol authentication packet structure
    const packet = Buffer.alloc(32);
    packet.writeUInt16BE(0x5359, 0); // 'SY' header
    packet.writeUInt16BE(0x0001, 2); // Version
    packet.writeUInt16BE(0x0000, 4); // Command: LOGIN
    packet.write(this.config.username, 6, 8, 'ascii');
    packet.write(this.config.password, 14, 8, 'ascii');
    packet.write(this.config.greenhouseId, 22, 8, 'ascii');
    return packet;
  }

  /**
   * Build Manager handshake packet
   */
  private buildManagerHandshakePacket(): Buffer {
    // Hortimax Manager protocol handshake
    const packet = Buffer.alloc(24);
    packet.writeUInt16BE(0x484D, 0); // 'HM' header
    packet.writeUInt16BE(0x0002, 2); // Version
    packet.writeUInt16BE(0x0001, 4); // Command: CONNECT
    packet.write(this.config.username, 6, 8, 'ascii');
    packet.write(this.config.password, 14, 8, 'ascii');
    return packet;
  }

  /**
   * Process Synopta response
   */
  private processSynoptaResponse(data: Buffer): boolean {
    if (data.length >= 4) {
      const header = data.readUInt16BE(0);
      const status = data.readUInt16BE(2);
      return header === 0x5359 && status === 0x0001; // Success
    }
    return false;
  }

  /**
   * Process Manager response
   */
  private processManagerResponse(data: Buffer): boolean {
    if (data.length >= 4) {
      const header = data.readUInt16BE(0);
      const status = data.readUInt16BE(2);
      return header === 0x484D && status === 0x0001; // Success
    }
    return false;
  }

  /**
   * Additional helper methods would be implemented here for:
   * - writeModbusSetpoint()
   * - writeTcpSetpoint()
   * - readModbusAlarms()
   * - readTcpAlarms()
   * - requestHistoricalData()
   * - getSectionConfiguration()
   * - requestIOConfiguration()
   * - readTcpDataPoint()
   */
}

/**
 * Factory function to create Hortimax adapter
 */
export function createHortimaxAdapter(config: HortimaxConfig): HortimaxAdapter {
  return new HortimaxAdapter(config);
}

/**
 * Auto-discovery function for Hortimax systems
 */
export async function discoverHortimaxSystems(networkRange: string = '192.168.1'): Promise<HortimaxConfig[]> {
  const discovered: HortimaxConfig[] = [];
  
  if (!ModbusRTU) {
    console.warn('Modbus discovery not available in browser environment');
    return discovered;
  }
  
  // Scan common Hortimax ports
  const ports = [
    { port: 502, type: 'modbus' as const },
    { port: 1200, type: 'synopta' as const },
    { port: 2000, type: 'manager' as const }
  ];
  
  for (let i = 1; i <= 254; i++) {
    const host = `${networkRange}.${i}`;
    
    for (const { port, type } of ports) {
      try {
        if (type === 'modbus') {
          const client = new ModbusRTU();
          await client.connectTCP(host, { port });
          const result = await client.readHoldingRegisters(1000, 1);
          
          if (result) {
            discovered.push({
              type,
              host,
              port,
              username: 'admin',
              password: '',
              greenhouseId: 'auto-discovered',
              modbusUnitId: 1
            });
          }
          await client.close();
        } else {
          // Test TCP connection for Synopta/Manager
          const net = require('net');
          const socket = new net.Socket();
          
          await new Promise((resolve, reject) => {
            socket.connect(port, host, () => {
              discovered.push({
                type,
                host,
                tcpPort: port,
                username: 'admin',
                password: '',
                greenhouseId: 'auto-discovered'
              });
              socket.destroy();
              resolve(true);
            });
            
            socket.on('error', () => {
              reject(false);
            });
            
            setTimeout(() => reject(false), 3000);
          });
        }
      } catch (error) {
        // Host not responding or not a Hortimax system
        continue;
      }
    }
  }

  return discovered;
}