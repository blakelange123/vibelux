/**
 * Universal Control System Adapter
 * Provides a common interface to integrate with any existing control system
 */

import { CONTROL_SYSTEMS } from '@/lib/integrations/control-systems-catalog';
import { prisma } from '@/lib/prisma';

export interface ControlSystemConfig {
  systemType: string; // 'argus-titan', 'priva-connext', etc.
  connectionParams: {
    host?: string;
    port?: number;
    apiUrl?: string;
    apiKey?: string;
    username?: string;
    password?: string;
    customParams?: Record<string, any>;
  };
  capabilities: {
    canReadPower: boolean;
    canControlLights: boolean;
    canReadSensors: boolean;
    hasScheduling: boolean;
    supportsAlerts: boolean;
  };
  dataMapping: {
    powerReadingPath?: string;
    lightIntensityPath?: string;
    temperaturePath?: string;
    humidityPath?: string;
  };
}

export interface SystemReading {
  timestamp: Date;
  zones: {
    zoneId: string;
    zoneName: string;
    powerKw?: number;
    lightIntensity?: number;
    temperature?: number;
    humidity?: number;
    co2?: number;
    customData?: Record<string, any>;
  }[];
  systemStatus: 'online' | 'offline' | 'degraded';
  errors: string[];
}

export class ControlSystemAdapter {
  private static instance: ControlSystemAdapter;
  private adapters: Map<string, IControlSystemAdapter> = new Map();
  
  private constructor() {
    // Register all adapter implementations
    this.registerAdapters();
  }
  
  static getInstance(): ControlSystemAdapter {
    if (!ControlSystemAdapter.instance) {
      ControlSystemAdapter.instance = new ControlSystemAdapter();
    }
    return ControlSystemAdapter.instance;
  }
  
  /**
   * Connect to a control system
   */
  async connect(facilityId: string, config: ControlSystemConfig): Promise<boolean> {
    try {
      const adapter = this.getAdapter(config.systemType);
      if (!adapter) {
        throw new Error(`No adapter available for system type: ${config.systemType}`);
      }
      
      // Test connection
      const connected = await adapter.testConnection(config);
      
      if (connected) {
        // Store configuration
        await prisma.energy_optimization_config.update({
          where: { facility_id: facilityId },
          data: {
            control_system_type: config.systemType,
            control_system_config: config as any,
            last_connection_test: new Date()
          }
        });
        
      }
      
      return connected;
      
    } catch (error) {
      console.error('Failed to connect to control system:', error);
      return false;
    }
  }
  
  /**
   * Read current data from control system
   */
  async readCurrentData(facilityId: string): Promise<SystemReading | null> {
    try {
      // Get facility configuration
      const facility = await prisma.energy_optimization_config.findFirst({
        where: { facility_id: facilityId }
      });
      
      if (!facility || !facility.control_system_type) {
        throw new Error('No control system configured for facility');
      }
      
      const config = facility.control_system_config as ControlSystemConfig;
      const adapter = this.getAdapter(facility.control_system_type);
      
      if (!adapter) {
        throw new Error('Adapter not found');
      }
      
      // Read data from the control system
      const reading = await adapter.readData(config);
      
      // Store the reading
      if (reading.systemStatus === 'online') {
        for (const zone of reading.zones) {
          if (zone.powerKw !== undefined) {
            await prisma.power_readings.create({
              data: {
                facility_id: facilityId,
                zone_id: zone.zoneId,
                timestamp: reading.timestamp,
                power_kw: zone.powerKw,
                source: 'control_system',
                device_id: facility.control_system_type
              }
            });
          }
        }
      }
      
      return reading;
      
    } catch (error) {
      console.error('Failed to read from control system:', error);
      return null;
    }
  }
  
  /**
   * Send control command to system
   */
  async sendControlCommand(
    facilityId: string,
    command: {
      type: 'adjust_lighting' | 'override_schedule' | 'emergency_stop';
      zoneId: string;
      value: any;
      duration?: number; // minutes
    }
  ): Promise<boolean> {
    try {
      const facility = await prisma.energy_optimization_config.findFirst({
        where: { facility_id: facilityId }
      });
      
      if (!facility || !facility.control_system_type) {
        throw new Error('No control system configured');
      }
      
      const config = facility.control_system_config as ControlSystemConfig;
      const adapter = this.getAdapter(facility.control_system_type);
      
      // Check if system supports this command
      if (command.type === 'adjust_lighting' && !config.capabilities.canControlLights) {
        console.warn('Control system does not support lighting control');
        return false;
      }
      
      // Send command through adapter
      const success = await adapter.sendCommand(config, command);
      
      // Log the command
      await prisma.optimization_events.create({
        data: {
          facility_id: facilityId,
          zone_id: command.zoneId,
          event_time: new Date(),
          action_type: command.type,
          action_value: command,
          safety_score: 100,
          crop_type: 'unknown',
          growth_stage: 'unknown'
        }
      });
      
      return success;
      
    } catch (error) {
      console.error('Failed to send control command:', error);
      return false;
    }
  }
  
  /**
   * Get available control systems
   */
  getAvailableSystems() {
    return CONTROL_SYSTEMS.map(system => ({
      id: system.id,
      name: system.name,
      manufacturer: system.manufacturer,
      category: system.category,
      protocols: system.protocols,
      hasAdapter: this.adapters.has(system.id)
    }));
  }
  
  /**
   * Check system compatibility
   */
  async checkCompatibility(systemType: string): Promise<{
    compatible: boolean;
    requirements: string[];
    limitations: string[];
  }> {
    const system = CONTROL_SYSTEMS.find(s => s.id === systemType);
    if (!system) {
      return {
        compatible: false,
        requirements: [],
        limitations: ['System not recognized']
      };
    }
    
    const adapter = this.adapters.get(systemType);
    const hasAdapter = !!adapter;
    
    const limitations: string[] = [];
    
    // Check specific limitations
    if (!system.integration.controlCapabilities.includes('Adjust light intensity')) {
      limitations.push('Cannot dim lights - read-only optimization');
    }
    
    if (!system.integration.dataAvailable.includes('Power consumption')) {
      limitations.push('No power data - savings estimates only');
    }
    
    return {
      compatible: hasAdapter,
      requirements: system.integration.requirements,
      limitations
    };
  }
  
  /**
   * Register adapter implementations
   */
  private registerAdapters() {
    // Argus Adapter
    this.adapters.set('argus-titan', new ArgusAdapter());
    
    // Priva Adapter  
    this.adapters.set('priva-connext', new PrivaAdapter());
    
    // TrolMaster Adapter
    this.adapters.set('trolmaster-hydro-x', new TrolMasterAdapter());
    
    // Add more adapters as implemented...
  }
  
  /**
   * Get adapter for system type
   */
  private getAdapter(systemType: string): IControlSystemAdapter | undefined {
    return this.adapters.get(systemType);
  }
}

/**
 * Interface that all control system adapters must implement
 */
interface IControlSystemAdapter {
  testConnection(config: ControlSystemConfig): Promise<boolean>;
  readData(config: ControlSystemConfig): Promise<SystemReading>;
  sendCommand(config: ControlSystemConfig, command: any): Promise<boolean>;
}

/**
 * Argus Control System Adapter
 * Integrates with Argus Titan via Modbus TCP
 */
class ArgusAdapter implements IControlSystemAdapter {
  private modbusClient: any;
  
  async testConnection(config: ControlSystemConfig): Promise<boolean> {
    try {
      // Import modbus-serial dynamically to handle potential missing dependency
      const ModbusRTU = require('modbus-serial');
      const client = new ModbusRTU();
      
      // Connect to Argus controller
      await client.connectTCP(config.connectionParams.host, {
        port: config.connectionParams.port || 502
      });
      
      // Test read - Argus system status register
      await client.readHoldingRegisters(1000, 1);
      
      await client.close();
      return true;
      
    } catch (error) {
      console.error('Argus connection test failed:', error);
      return false;
    }
  }
  
  async readData(config: ControlSystemConfig): Promise<SystemReading> {
    try {
      const ModbusRTU = require('modbus-serial');
      const client = new ModbusRTU();
      
      await client.connectTCP(config.connectionParams.host, {
        port: config.connectionParams.port || 502
      });
      
      const zones = [];
      const errors = [];
      
      // Argus Titan register mapping (based on documentation)
      const zoneRegisters = [
        { id: 'zone-1', name: 'Compartment 1', powerReg: 2000, dimReg: 2100, tempReg: 3000, humReg: 3100 },
        { id: 'zone-2', name: 'Compartment 2', powerReg: 2010, dimReg: 2110, tempReg: 3010, humReg: 3110 },
        { id: 'zone-3', name: 'Compartment 3', powerReg: 2020, dimReg: 2120, tempReg: 3020, humReg: 3120 },
        { id: 'zone-4', name: 'Compartment 4', powerReg: 2030, dimReg: 2130, tempReg: 3030, humReg: 3130 }
      ];
      
      for (const zoneConfig of zoneRegisters) {
        try {
          // Read power consumption (kW)
          const powerData = await client.readHoldingRegisters(zoneConfig.powerReg, 2);
          const powerKw = (powerData.data[0] + (powerData.data[1] << 16)) / 1000;
          
          // Read light intensity (%)
          const dimData = await client.readHoldingRegisters(zoneConfig.dimReg, 1);
          const lightIntensity = dimData.data[0] / 10; // Scale from 0-1000 to 0-100
          
          // Read temperature (°C)
          const tempData = await client.readHoldingRegisters(zoneConfig.tempReg, 1);
          const temperature = tempData.data[0] / 10; // Scale from tenths
          
          // Read humidity (%)
          const humData = await client.readHoldingRegisters(zoneConfig.humReg, 1);
          const humidity = humData.data[0] / 10;
          
          zones.push({
            zoneId: zoneConfig.id,
            zoneName: zoneConfig.name,
            powerKw,
            lightIntensity,
            temperature,
            humidity,
            customData: {
              systemType: 'argus-titan',
              registers: {
                power: zoneConfig.powerReg,
                dimming: zoneConfig.dimReg,
                temperature: zoneConfig.tempReg,
                humidity: zoneConfig.humReg
              }
            }
          });
          
        } catch (zoneError) {
          errors.push(`Failed to read zone ${zoneConfig.name}: ${zoneError.message}`);
        }
      }
      
      await client.close();
      
      return {
        timestamp: new Date(),
        zones,
        systemStatus: zones.length > 0 ? 'online' : 'degraded',
        errors
      };
      
    } catch (error) {
      console.error('Failed to read Argus data:', error);
      return {
        timestamp: new Date(),
        zones: [],
        systemStatus: 'offline',
        errors: [error.message]
      };
    }
  }
  
  async sendCommand(config: ControlSystemConfig, command: any): Promise<boolean> {
    try {
      const ModbusRTU = require('modbus-serial');
      const client = new ModbusRTU();
      
      await client.connectTCP(config.connectionParams.host, {
        port: config.connectionParams.port || 502
      });
      
      let success = false;
      
      if (command.type === 'adjust_lighting') {
        // Map zone ID to dimming register
        const zoneRegisterMap: Record<string, number> = {
          'zone-1': 2100,
          'zone-2': 2110,
          'zone-3': 2120,
          'zone-4': 2130
        };
        
        const dimRegister = zoneRegisterMap[command.zoneId];
        if (dimRegister) {
          // Convert percentage to Argus scale (0-1000)
          const argusValue = Math.round(command.value * 10);
          
          // Write to dimming register
          await client.writeRegister(dimRegister, argusValue);
          success = true;
          
        }
      } else if (command.type === 'emergency_stop') {
        // Set all zones to 100% intensity
        const emergencyRegisters = [2100, 2110, 2120, 2130];
        for (const register of emergencyRegisters) {
          await client.writeRegister(register, 1000); // 100%
        }
        success = true;
      }
      
      await client.close();
      return success;
      
    } catch (error) {
      console.error('Failed to send Argus command:', error);
      return false;
    }
  }
}

/**
 * Priva Control System Adapter
 * Integrates with Priva Connext via REST API
 */
class PrivaAdapter implements IControlSystemAdapter {
  private baseUrl: string = '';
  private authToken: string = '';
  
  async testConnection(config: ControlSystemConfig): Promise<boolean> {
    try {
      this.baseUrl = config.connectionParams.apiUrl!;
      
      // Authenticate with Priva API
      const authResponse = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: config.connectionParams.username,
          password: config.connectionParams.password
        })
      });
      
      if (!authResponse.ok) {
        throw new Error('Authentication failed');
      }
      
      const authData = await authResponse.json();
      this.authToken = authData.token;
      
      // Test API connectivity
      const testResponse = await fetch(`${this.baseUrl}/api/v1/system/status`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (testResponse.ok) {
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Priva connection test failed:', error);
      return false;
    }
  }
  
  async readData(config: ControlSystemConfig): Promise<SystemReading> {
    try {
      // Ensure we have authentication
      if (!this.authToken) {
        await this.testConnection(config);
      }
      
      // Get compartment list
      const compartmentsResponse = await fetch(`${this.baseUrl}/api/v1/compartments`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      
      if (!compartmentsResponse.ok) {
        throw new Error('Failed to fetch compartments');
      }
      
      const compartments = await compartmentsResponse.json();
      const zones = [];
      const errors = [];
      
      // Read data for each compartment
      for (const comp of compartments) {
        try {
          // Get current measurements
          const measurementsResponse = await fetch(
            `${this.baseUrl}/api/v1/compartments/${comp.id}/measurements`,
            { headers: { 'Authorization': `Bearer ${this.authToken}` } }
          );
          
          if (measurementsResponse.ok) {
            const measurements = await measurementsResponse.json();
            
            // Get lighting controls
            const lightingResponse = await fetch(
              `${this.baseUrl}/api/v1/compartments/${comp.id}/lighting`,
              { headers: { 'Authorization': `Bearer ${this.authToken}` } }
            );
            
            const lighting = lightingResponse.ok ? await lightingResponse.json() : null;
            
            zones.push({
              zoneId: comp.id,
              zoneName: comp.name,
              powerKw: this.extractMeasurement(measurements, 'ElectricalPower') / 1000, // W to kW
              lightIntensity: lighting?.intensity || this.extractMeasurement(measurements, 'LightIntensity'),
              temperature: this.extractMeasurement(measurements, 'AirTemperature'),
              humidity: this.extractMeasurement(measurements, 'RelativeHumidity'),
              co2: this.extractMeasurement(measurements, 'CO2Concentration'),
              customData: {
                systemType: 'priva-connext',
                compartmentId: comp.id,
                lastUpdate: measurements.timestamp
              }
            });
          }
        } catch (zoneError) {
          errors.push(`Failed to read compartment ${comp.name}: ${zoneError.message}`);
        }
      }
      
      return {
        timestamp: new Date(),
        zones,
        systemStatus: zones.length > 0 ? 'online' : 'degraded',
        errors
      };
      
    } catch (error) {
      console.error('Failed to read Priva data:', error);
      return {
        timestamp: new Date(),
        zones: [],
        systemStatus: 'offline',
        errors: [error.message]
      };
    }
  }
  
  async sendCommand(config: ControlSystemConfig, command: any): Promise<boolean> {
    try {
      if (!this.authToken) {
        await this.testConnection(config);
      }
      
      let success = false;
      
      if (command.type === 'adjust_lighting') {
        // Send lighting intensity command
        const response = await fetch(
          `${this.baseUrl}/api/v1/compartments/${command.zoneId}/lighting/intensity`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${this.authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              intensity: command.value,
              duration: command.duration || 0, // 0 = permanent
              reason: 'VibeLux optimization'
            })
          }
        );
        
        success = response.ok;
        
        if (success) {
        }
        
      } else if (command.type === 'emergency_stop') {
        // Set all compartments to 100% lighting
        const compartmentsResponse = await fetch(`${this.baseUrl}/api/v1/compartments`, {
          headers: { 'Authorization': `Bearer ${this.authToken}` }
        });
        
        if (compartmentsResponse.ok) {
          const compartments = await compartmentsResponse.json();
          
          const emergencyPromises = compartments.map((comp: any) =>
            fetch(`${this.baseUrl}/api/v1/compartments/${comp.id}/lighting/intensity`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                intensity: 100,
                duration: 0,
                reason: 'VibeLux emergency stop'
              })
            })
          );
          
          const results = await Promise.allSettled(emergencyPromises);
          success = results.every(r => r.status === 'fulfilled');
          
          if (success) {
          }
        }
      }
      
      return success;
      
    } catch (error) {
      console.error('Failed to send Priva command:', error);
      return false;
    }
  }
  
  /**
   * Extract measurement value from Priva measurement array
   */
  private extractMeasurement(measurements: any[], type: string): number | undefined {
    const measurement = measurements.find(m => m.type === type);
    return measurement?.value;
  }
}

/**
 * TrolMaster Control System Adapter
 * Integrates with TrolMaster Hydro-X via local HTTP API
 */
class TrolMasterAdapter implements IControlSystemAdapter {
  private baseUrl: string = '';
  
  async testConnection(config: ControlSystemConfig): Promise<boolean> {
    try {
      this.baseUrl = `http://${config.connectionParams.host}:${config.connectionParams.port || 80}`;
      
      // Test TrolMaster API connectivity
      const response = await fetch(`${this.baseUrl}/api/system/info`, {
        timeout: 5000
      } as any);
      
      if (response.ok) {
        const info = await response.json();
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('TrolMaster connection test failed:', error);
      return false;
    }
  }
  
  async readData(config: ControlSystemConfig): Promise<SystemReading> {
    try {
      if (!this.baseUrl) {
        this.baseUrl = `http://${config.connectionParams.host}:${config.connectionParams.port || 80}`;
      }
      
      // Get device status from TrolMaster
      const statusResponse = await fetch(`${this.baseUrl}/api/devices/status`);
      
      if (!statusResponse.ok) {
        throw new Error('Failed to fetch device status');
      }
      
      const deviceStatus = await statusResponse.json();
      const zones = [];
      const errors = [];
      
      // Process each connected device/zone
      for (const [deviceId, device] of Object.entries(deviceStatus.devices || {})) {
        try {
          const deviceData = device as any;
          
          // Calculate power consumption based on device type and settings
          let powerKw = 0;
          if (deviceData.type === 'LMA' || deviceData.type === 'DSP') {
            // Lighting control devices
            const maxPower = deviceData.maxPower || 1000; // watts
            const dimLevel = deviceData.dimming || 100; // percentage
            powerKw = (maxPower * dimLevel / 100) / 1000;
          }
          
          zones.push({
            zoneId: deviceId,
            zoneName: deviceData.name || `Zone ${deviceId}`,
            powerKw,
            lightIntensity: deviceData.dimming,
            temperature: deviceData.temperature,
            humidity: deviceData.humidity,
            co2: deviceData.co2,
            customData: {
              systemType: 'trolmaster-hydro-x',
              deviceType: deviceData.type,
              deviceModel: deviceData.model,
              firmwareVersion: deviceData.firmware,
              lastSeen: deviceData.lastUpdate
            }
          });
          
        } catch (deviceError) {
          errors.push(`Failed to read device ${deviceId}: ${deviceError.message}`);
        }
      }
      
      return {
        timestamp: new Date(),
        zones,
        systemStatus: zones.length > 0 ? 'online' : 'degraded',
        errors
      };
      
    } catch (error) {
      console.error('Failed to read TrolMaster data:', error);
      return {
        timestamp: new Date(),
        zones: [],
        systemStatus: 'offline',
        errors: [error.message]
      };
    }
  }
  
  async sendCommand(config: ControlSystemConfig, command: any): Promise<boolean> {
    try {
      if (!this.baseUrl) {
        this.baseUrl = `http://${config.connectionParams.host}:${config.connectionParams.port || 80}`;
      }
      
      let success = false;
      
      if (command.type === 'adjust_lighting') {
        // Send dimming command to specific device
        const response = await fetch(`${this.baseUrl}/api/devices/${command.zoneId}/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'set_dimming',
            value: command.value,
            duration: command.duration || 0,
            source: 'VibeLux'
          })
        });
        
        success = response.ok;
        
        if (success) {
        }
        
      } else if (command.type === 'emergency_stop') {
        // Get all lighting devices and set to 100%
        const devicesResponse = await fetch(`${this.baseUrl}/api/devices`);
        
        if (devicesResponse.ok) {
          const devices = await devicesResponse.json();
          
          const lightingDevices = Object.entries(devices.devices || {})
            .filter(([_, device]: [string, any]) => 
              device.type === 'LMA' || device.type === 'DSP'
            );
          
          const emergencyPromises = lightingDevices.map(([deviceId, _]) =>
            fetch(`${this.baseUrl}/api/devices/${deviceId}/control`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'set_dimming',
                value: 100,
                duration: 0,
                source: 'VibeLux Emergency'
              })
            })
          );
          
          const results = await Promise.allSettled(emergencyPromises);
          success = results.every(r => r.status === 'fulfilled');
          
          if (success) {
          }
        }
      }
      
      return success;
      
    } catch (error) {
      console.error('Failed to send TrolMaster command:', error);
      return false;
    }
  }
}

// Export singleton
export const controlSystemAdapter = ControlSystemAdapter.getInstance();