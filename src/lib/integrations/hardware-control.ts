/**
 * Hardware Control Integration
 * Supports Modbus TCP and BACnet protocols for lighting and environmental control
 */

import { EventEmitter } from 'events';

interface ModbusDevice {
  id: string;
  name: string;
  ip: string;
  port: number;
  unitId: number;
  type: 'lighting' | 'hvac' | 'irrigation' | 'sensor';
  registers: {
    [key: string]: {
      address: number;
      type: 'coil' | 'discrete' | 'holding' | 'input';
      dataType: 'boolean' | 'uint16' | 'int16' | 'uint32' | 'int32' | 'float';
      description: string;
    };
  };
}

interface BACnetDevice {
  id: string;
  name: string;
  ip: string;
  port: number;
  deviceId: number;
  type: 'lighting' | 'hvac' | 'irrigation' | 'sensor';
  objects: {
    [key: string]: {
      objectType: string;
      instanceNumber: number;
      propertyId: string;
      description: string;
    };
  };
}

interface ControlCommand {
  deviceId: string;
  action: string;
  value: number | boolean;
  timestamp: Date;
  userId?: string;
}

interface DeviceStatus {
  deviceId: string;
  online: boolean;
  lastSeen: Date;
  values: Record<string, any>;
  errors: string[];
}

export class HardwareController extends EventEmitter {
  private static instance: HardwareController;
  private modbusDevices: Map<string, ModbusDevice> = new Map();
  private bacnetDevices: Map<string, BACnetDevice> = new Map();
  private deviceStatus: Map<string, DeviceStatus> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;
  private isConnected = false;

  private constructor() {
    super();
    this.initializeDefaultDevices();
  }

  static getInstance(): HardwareController {
    if (!HardwareController.instance) {
      HardwareController.instance = new HardwareController();
    }
    return HardwareController.instance;
  }

  /**
   * Initialize connection to hardware devices
   */
  async connect(): Promise<boolean> {
    try {

      // Test Modbus connections
      await this.testModbusConnections();
      
      // Test BACnet connections
      await this.testBACnetConnections();

      // Start polling
      this.startPolling();

      this.isConnected = true;
      this.emit('connected');
      return true;

    } catch (error) {
      console.error('❌ Hardware connection failed:', error);
      this.emit('connectionError', error);
      return false;
    }
  }

  /**
   * Disconnect from hardware devices
   */
  async disconnect(): Promise<void> {
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.isConnected = false;
    this.emit('disconnected');
  }

  /**
   * Control lighting fixture
   */
  async controlLighting(command: {
    fixtureId: string;
    intensity?: number; // 0-100
    spectrum?: {
      red?: number;
      blue?: number;
      white?: number;
      green?: number;
      farRed?: number;
    };
    schedule?: {
      onTime: string;
      offTime: string;
      dimCurve?: Array<{ time: string; intensity: number }>;
    };
  }): Promise<{ success: boolean; message: string }> {
    try {
      const device = this.modbusDevices.get(command.fixtureId) || this.bacnetDevices.get(command.fixtureId);
      if (!device) {
        throw new Error(`Device not found: ${command.fixtureId}`);
      }

      const controlCommands: ControlCommand[] = [];

      // Intensity control
      if (command.intensity !== undefined) {
        controlCommands.push({
          deviceId: command.fixtureId,
          action: 'setIntensity',
          value: Math.max(0, Math.min(100, command.intensity)),
          timestamp: new Date()
        });
      }

      // Spectrum control
      if (command.spectrum) {
        Object.entries(command.spectrum).forEach(([color, value]) => {
          controlCommands.push({
            deviceId: command.fixtureId,
            action: `set${color.charAt(0).toUpperCase() + color.slice(1)}`,
            value: Math.max(0, Math.min(100, value || 0)),
            timestamp: new Date()
          });
        });
      }

      // Execute commands
      for (const cmd of controlCommands) {
        await this.executeCommand(cmd);
      }

      this.emit('lightingControl', { command, success: true });
      return { success: true, message: 'Lighting control executed successfully' };

    } catch (error) {
      console.error('Lighting control error:', error);
      this.emit('lightingControl', { command, success: false, error });
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Control environmental systems
   */
  async controlEnvironment(command: {
    zoneId: string;
    temperature?: number;
    humidity?: number;
    co2?: number;
    airflow?: number;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const device = this.bacnetDevices.get(command.zoneId);
      if (!device) {
        throw new Error(`Environmental device not found: ${command.zoneId}`);
      }

      const controlCommands: ControlCommand[] = [];

      if (command.temperature !== undefined) {
        controlCommands.push({
          deviceId: command.zoneId,
          action: 'setTemperature',
          value: command.temperature,
          timestamp: new Date()
        });
      }

      if (command.humidity !== undefined) {
        controlCommands.push({
          deviceId: command.zoneId,
          action: 'setHumidity',
          value: command.humidity,
          timestamp: new Date()
        });
      }

      if (command.co2 !== undefined) {
        controlCommands.push({
          deviceId: command.zoneId,
          action: 'setCO2',
          value: command.co2,
          timestamp: new Date()
        });
      }

      // Execute commands
      for (const cmd of controlCommands) {
        await this.executeCommand(cmd);
      }

      this.emit('environmentControl', { command, success: true });
      return { success: true, message: 'Environmental control executed successfully' };

    } catch (error) {
      console.error('Environmental control error:', error);
      this.emit('environmentControl', { command, success: false, error });
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Control irrigation system
   */
  async controlIrrigation(command: {
    zoneId: string;
    duration?: number; // minutes
    volume?: number; // liters
    ec?: number;
    ph?: number;
    start?: boolean;
    stop?: boolean;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const device = this.modbusDevices.get(command.zoneId);
      if (!device) {
        throw new Error(`Irrigation device not found: ${command.zoneId}`);
      }

      const controlCommands: ControlCommand[] = [];

      if (command.start) {
        controlCommands.push({
          deviceId: command.zoneId,
          action: 'startIrrigation',
          value: true,
          timestamp: new Date()
        });
      }

      if (command.stop) {
        controlCommands.push({
          deviceId: command.zoneId,
          action: 'stopIrrigation',
          value: false,
          timestamp: new Date()
        });
      }

      if (command.duration) {
        controlCommands.push({
          deviceId: command.zoneId,
          action: 'setDuration',
          value: command.duration,
          timestamp: new Date()
        });
      }

      // Execute commands
      for (const cmd of controlCommands) {
        await this.executeCommand(cmd);
      }

      this.emit('irrigationControl', { command, success: true });
      return { success: true, message: 'Irrigation control executed successfully' };

    } catch (error) {
      console.error('Irrigation control error:', error);
      this.emit('irrigationControl', { command, success: false, error });
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get real-time device status
   */
  getDeviceStatus(deviceId?: string): DeviceStatus | DeviceStatus[] {
    if (deviceId) {
      return this.deviceStatus.get(deviceId) || {
        deviceId,
        online: false,
        lastSeen: new Date(0),
        values: {},
        errors: ['Device not found']
      };
    }

    return Array.from(this.deviceStatus.values());
  }

  /**
   * Get all registered devices
   */
  getDevices(): { modbus: ModbusDevice[]; bacnet: BACnetDevice[] } {
    return {
      modbus: Array.from(this.modbusDevices.values()),
      bacnet: Array.from(this.bacnetDevices.values())
    };
  }

  /**
   * Add Modbus device
   */
  addModbusDevice(device: ModbusDevice): void {
    this.modbusDevices.set(device.id, device);
    this.deviceStatus.set(device.id, {
      deviceId: device.id,
      online: false,
      lastSeen: new Date(),
      values: {},
      errors: []
    });
  }

  /**
   * Add BACnet device
   */
  addBACnetDevice(device: BACnetDevice): void {
    this.bacnetDevices.set(device.id, device);
    this.deviceStatus.set(device.id, {
      deviceId: device.id,
      online: false,
      lastSeen: new Date(),
      values: {},
      errors: []
    });
  }

  private async testModbusConnections(): Promise<void> {
    // Simulate Modbus connection testing
    for (const [deviceId, device] of this.modbusDevices) {
      try {
        // In production, this would use actual Modbus library
        
        // Simulate connection test
        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.deviceStatus.set(deviceId, {
          deviceId,
          online: true,
          lastSeen: new Date(),
          values: {},
          errors: []
        });
        
      } catch (error) {
        console.error(`❌ Modbus device ${device.name} failed:`, error);
        this.deviceStatus.set(deviceId, {
          deviceId,
          online: false,
          lastSeen: new Date(),
          values: {},
          errors: [error instanceof Error ? error.message : 'Connection failed']
        });
      }
    }
  }

  private async testBACnetConnections(): Promise<void> {
    // Simulate BACnet connection testing
    for (const [deviceId, device] of this.bacnetDevices) {
      try {
        
        // Simulate connection test
        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.deviceStatus.set(deviceId, {
          deviceId,
          online: true,
          lastSeen: new Date(),
          values: {},
          errors: []
        });
        
      } catch (error) {
        console.error(`❌ BACnet device ${device.name} failed:`, error);
        this.deviceStatus.set(deviceId, {
          deviceId,
          online: false,
          lastSeen: new Date(),
          values: {},
          errors: [error instanceof Error ? error.message : 'Connection failed']
        });
      }
    }
  }

  private async executeCommand(command: ControlCommand): Promise<void> {
    
    // In production, this would execute actual hardware commands
    // For now, simulate the command execution
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Update device status
    const status = this.deviceStatus.get(command.deviceId);
    if (status) {
      status.values[command.action] = command.value;
      status.lastSeen = new Date();
    }
    
    this.emit('commandExecuted', command);
  }

  private startPolling(): void {
    this.pollInterval = setInterval(async () => {
      // Poll all devices for status updates
      for (const [deviceId] of this.deviceStatus) {
        await this.pollDevice(deviceId);
      }
    }, 5000); // Poll every 5 seconds
  }

  private async pollDevice(deviceId: string): Promise<void> {
    const status = this.deviceStatus.get(deviceId);
    if (!status || !status.online) return;

    try {
      // Simulate polling device for current values
      // In production, this would read actual sensor values
      const values = {
        temperature: 75 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
        humidity: 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
        intensity: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100),
        timestamp: new Date()
      };

      status.values = { ...status.values, ...values };
      status.lastSeen = new Date();
      
      this.emit('deviceData', { deviceId, values });
    } catch (error) {
      console.error(`Polling error for device ${deviceId}:`, error);
      status.errors.push(error instanceof Error ? error.message : 'Polling failed');
    }
  }

  private initializeDefaultDevices(): void {
    // Example LED lighting fixture
    this.addModbusDevice({
      id: 'led-fixture-001',
      name: 'Main Room LED Array',
      ip: process.env.MODBUS_TCP_HOST || '192.168.1.100',
      port: parseInt(process.env.MODBUS_TCP_PORT || '502'),
      unitId: 1,
      type: 'lighting',
      registers: {
        intensity: { address: 40001, type: 'holding', dataType: 'uint16', description: 'Overall intensity (0-100%)' },
        redChannel: { address: 40002, type: 'holding', dataType: 'uint16', description: 'Red channel (0-100%)' },
        blueChannel: { address: 40003, type: 'holding', dataType: 'uint16', description: 'Blue channel (0-100%)' },
        whiteChannel: { address: 40004, type: 'holding', dataType: 'uint16', description: 'White channel (0-100%)' },
        powerStatus: { address: 10001, type: 'coil', dataType: 'boolean', description: 'Power on/off' }
      }
    });

    // Example HVAC system
    this.addBACnetDevice({
      id: 'hvac-zone-001',
      name: 'Main Room HVAC',
      ip: process.env.BACNET_HOST || '192.168.1.101',
      port: 47808,
      deviceId: parseInt(process.env.BACNET_DEVICE_ID || '1001'),
      type: 'hvac',
      objects: {
        temperature: { objectType: 'analog-input', instanceNumber: 0, propertyId: 'present-value', description: 'Room temperature' },
        humidity: { objectType: 'analog-input', instanceNumber: 1, propertyId: 'present-value', description: 'Room humidity' },
        setpointTemp: { objectType: 'analog-value', instanceNumber: 0, propertyId: 'present-value', description: 'Temperature setpoint' },
        fanSpeed: { objectType: 'analog-output', instanceNumber: 0, propertyId: 'present-value', description: 'Fan speed (0-100%)' }
      }
    });
  }
}

export const hardwareController = HardwareController.getInstance();