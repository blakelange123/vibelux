// SCADA Protocol Implementation Library
// Support for Modbus, BACnet, OPC UA, MQTT protocols

export interface ProtocolConfig {
  type: 'modbus' | 'bacnet' | 'opcua' | 'mqtt';
  connection: any;
  options?: any;
}

export interface DataValue {
  value: any;
  quality: 'good' | 'bad' | 'uncertain';
  timestamp: Date;
  statusCode?: number;
}

// Modbus Protocol Implementation
export class ModbusProtocol {
  private config: any;
  private connected: boolean = false;
  
  constructor(config: any) {
    this.config = config;
  }
  
  async connect(): Promise<void> {
    // Modbus TCP or RTU connection
    console.log(`Connecting to Modbus device at ${this.config.host}:${this.config.port}`);
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 500));
    this.connected = true;
  }
  
  async readHoldingRegisters(address: number, quantity: number): Promise<number[]> {
    if (!this.connected) throw new Error('Not connected to Modbus device');
    
    // Simulate reading holding registers (function code 03)
    const values: number[] = [];
    for (let i = 0; i < quantity; i++) {
      values.push(Math.floor(Math.random() * 65535)); // 16-bit values
    }
    
    return values;
  }
  
  async readInputRegisters(address: number, quantity: number): Promise<number[]> {
    if (!this.connected) throw new Error('Not connected to Modbus device');
    
    // Simulate reading input registers (function code 04)
    const values: number[] = [];
    for (let i = 0; i < quantity; i++) {
      values.push(Math.floor(Math.random() * 65535));
    }
    
    return values;
  }
  
  async readCoils(address: number, quantity: number): Promise<boolean[]> {
    if (!this.connected) throw new Error('Not connected to Modbus device');
    
    // Simulate reading coils (function code 01)
    const values: boolean[] = [];
    for (let i = 0; i < quantity; i++) {
      values.push(Math.random() > 0.5);
    }
    
    return values;
  }
  
  async writeCoil(address: number, value: boolean): Promise<void> {
    if (!this.connected) throw new Error('Not connected to Modbus device');
    
    // Simulate writing single coil (function code 05)
    console.log(`Writing coil ${address}: ${value}`);
  }
  
  async writeRegister(address: number, value: number): Promise<void> {
    if (!this.connected) throw new Error('Not connected to Modbus device');
    
    // Simulate writing single register (function code 06)
    console.log(`Writing register ${address}: ${value}`);
  }
  
  async writeMultipleRegisters(address: number, values: number[]): Promise<void> {
    if (!this.connected) throw new Error('Not connected to Modbus device');
    
    // Simulate writing multiple registers (function code 16)
    console.log(`Writing ${values.length} registers starting at ${address}`);
  }
  
  disconnect(): void {
    this.connected = false;
  }
}

// BACnet Protocol Implementation
export class BACnetProtocol {
  private config: any;
  private devices: Map<number, BACnetDevice> = new Map();
  
  constructor(config: any) {
    this.config = config;
  }
  
  async discover(): Promise<BACnetDevice[]> {
    // Simulate BACnet device discovery
    console.log('Discovering BACnet devices...');
    
    const mockDevices: BACnetDevice[] = [
      {
        deviceId: 1001,
        name: 'HVAC Controller',
        address: '192.168.1.100',
        objects: [
          { type: 'analogInput', instance: 1, name: 'Room Temperature' },
          { type: 'analogInput', instance: 2, name: 'Room Humidity' },
          { type: 'binaryOutput', instance: 1, name: 'Fan Control' }
        ]
      },
      {
        deviceId: 1002,
        name: 'Lighting Controller',
        address: '192.168.1.101',
        objects: [
          { type: 'analogOutput', instance: 1, name: 'Dimming Level' },
          { type: 'binaryOutput', instance: 1, name: 'Zone 1 Control' }
        ]
      }
    ];
    
    mockDevices.forEach(device => this.devices.set(device.deviceId, device));
    return mockDevices;
  }
  
  async readProperty(
    deviceId: number,
    objectType: string,
    objectInstance: number,
    propertyId: string
  ): Promise<DataValue> {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error(`Device ${deviceId} not found`);
    
    // Simulate reading BACnet property
    let value: any;
    
    switch (objectType) {
      case 'analogInput':
        value = 20 + Math.random() * 10; // Temperature/humidity range
        break;
      case 'analogOutput':
        value = Math.random() * 100; // Percentage
        break;
      case 'binaryOutput':
      case 'binaryInput':
        value = Math.random() > 0.5;
        break;
      default:
        value = null;
    }
    
    return {
      value,
      quality: 'good',
      timestamp: new Date()
    };
  }
  
  async writeProperty(
    deviceId: number,
    objectType: string,
    objectInstance: number,
    propertyId: string,
    value: any
  ): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error(`Device ${deviceId} not found`);
    
    console.log(`Writing BACnet property: Device ${deviceId}, ${objectType}[${objectInstance}].${propertyId} = ${value}`);
  }
  
  async subscribeCOV(
    deviceId: number,
    objectType: string,
    objectInstance: number,
    callback: (value: DataValue) => void
  ): Promise<void> {
    // Subscribe to Change of Value notifications
    const interval = setInterval(async () => {
      const value = await this.readProperty(deviceId, objectType, objectInstance, 'presentValue');
      callback(value);
    }, 5000); // Simulate COV every 5 seconds
  }
}

interface BACnetDevice {
  deviceId: number;
  name: string;
  address: string;
  objects: BACnetObject[];
}

interface BACnetObject {
  type: string;
  instance: number;
  name: string;
}

// OPC UA Protocol Implementation
export class OPCUAProtocol {
  private config: any;
  private session: any = null;
  private nodes: Map<string, OPCUANode> = new Map();
  
  constructor(config: any) {
    this.config = config;
  }
  
  async connect(): Promise<void> {
    console.log(`Connecting to OPC UA server at ${this.config.endpoint}`);
    
    // Simulate OPC UA connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.session = {
      connected: true,
      sessionId: `session_${Date.now()}`
    };
    
    // Populate some nodes
    this.populateNodes();
  }
  
  private populateNodes(): void {
    const mockNodes: OPCUANode[] = [
      {
        nodeId: 'ns=2;s=Temperature.Room1',
        browseName: 'Room1 Temperature',
        dataType: 'Double',
        value: 75.5,
        accessLevel: 'read'
      },
      {
        nodeId: 'ns=2;s=Humidity.Room1',
        browseName: 'Room1 Humidity',
        dataType: 'Double',
        value: 65.2,
        accessLevel: 'read'
      },
      {
        nodeId: 'ns=2;s=Lighting.Zone1.Setpoint',
        browseName: 'Zone1 Lighting Setpoint',
        dataType: 'Int32',
        value: 80,
        accessLevel: 'readwrite'
      },
      {
        nodeId: 'ns=2;s=HVAC.Fan1.Status',
        browseName: 'Fan1 Status',
        dataType: 'Boolean',
        value: true,
        accessLevel: 'readwrite'
      }
    ];
    
    mockNodes.forEach(node => this.nodes.set(node.nodeId, node));
  }
  
  async browse(nodeId: string = 'RootFolder'): Promise<OPCUANode[]> {
    if (!this.session) throw new Error('Not connected to OPC UA server');
    
    // Return all nodes for simplicity
    return Array.from(this.nodes.values());
  }
  
  async read(nodeId: string): Promise<DataValue> {
    if (!this.session) throw new Error('Not connected to OPC UA server');
    
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);
    
    // Simulate value changes
    if (node.dataType === 'Double') {
      node.value = node.value + (Math.random() - 0.5) * 2;
    } else if (node.dataType === 'Boolean') {
      node.value = Math.random() > 0.5;
    }
    
    return {
      value: node.value,
      quality: 'good',
      timestamp: new Date(),
      statusCode: 0 // Good
    };
  }
  
  async write(nodeId: string, value: any): Promise<void> {
    if (!this.session) throw new Error('Not connected to OPC UA server');
    
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);
    
    if (node.accessLevel !== 'readwrite') {
      throw new Error(`Node ${nodeId} is read-only`);
    }
    
    node.value = value;
    console.log(`Wrote OPC UA node ${nodeId}: ${value}`);
  }
  
  async subscribe(
    nodeId: string,
    callback: (value: DataValue) => void,
    samplingInterval: number = 1000
  ): Promise<string> {
    if (!this.session) throw new Error('Not connected to OPC UA server');
    
    const subscriptionId = `sub_${Date.now()}`;
    
    // Simulate subscription with periodic updates
    const interval = setInterval(async () => {
      const value = await this.read(nodeId);
      callback(value);
    }, samplingInterval);
    
    return subscriptionId;
  }
  
  async disconnect(): Promise<void> {
    this.session = null;
    this.nodes.clear();
  }
}

interface OPCUANode {
  nodeId: string;
  browseName: string;
  dataType: string;
  value: any;
  accessLevel: 'read' | 'write' | 'readwrite';
}

// MQTT Protocol Implementation
export class MQTTProtocol {
  private config: any;
  private connected: boolean = false;
  private subscriptions: Map<string, (message: any) => void> = new Map();
  private mockData: Map<string, any> = new Map();
  
  constructor(config: any) {
    this.config = config;
  }
  
  async connect(): Promise<void> {
    console.log(`Connecting to MQTT broker at ${this.config.broker}`);
    
    // Simulate MQTT connection
    await new Promise(resolve => setTimeout(resolve, 500));
    this.connected = true;
    
    // Start mock data generation
    this.startMockDataGeneration();
  }
  
  private startMockDataGeneration(): void {
    // Generate mock sensor data
    setInterval(() => {
      // Temperature sensors
      this.mockData.set('sensors/temperature/room1', {
        value: 75 + Math.random() * 5,
        unit: 'F',
        timestamp: new Date().toISOString()
      });
      
      // Humidity sensors
      this.mockData.set('sensors/humidity/room1', {
        value: 60 + Math.random() * 10,
        unit: '%RH',
        timestamp: new Date().toISOString()
      });
      
      // Light sensors
      this.mockData.set('sensors/ppfd/zone1', {
        value: 600 + Math.random() * 200,
        unit: 'umol/m2/s',
        timestamp: new Date().toISOString()
      });
      
      // Control status
      this.mockData.set('control/lighting/zone1/status', {
        on: true,
        dimming: Math.floor(Math.random() * 100),
        mode: 'auto'
      });
      
      // Notify subscribers
      this.mockData.forEach((value, topic) => {
        this.notifySubscribers(topic, value);
      });
    }, 2000);
  }
  
  async subscribe(topic: string, callback: (message: any) => void): Promise<void> {
    if (!this.connected) throw new Error('Not connected to MQTT broker');
    
    this.subscriptions.set(topic, callback);
    console.log(`Subscribed to MQTT topic: ${topic}`);
    
    // Send current value if exists
    if (this.mockData.has(topic)) {
      callback(this.mockData.get(topic));
    }
  }
  
  async publish(topic: string, message: any): Promise<void> {
    if (!this.connected) throw new Error('Not connected to MQTT broker');
    
    console.log(`Publishing to MQTT topic ${topic}:`, message);
    this.mockData.set(topic, message);
    
    // Notify subscribers
    this.notifySubscribers(topic, message);
  }
  
  private notifySubscribers(topic: string, message: any): void {
    // Exact match
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic)!(message);
    }
    
    // Wildcard matching
    this.subscriptions.forEach((callback, pattern) => {
      if (this.topicMatches(pattern, topic)) {
        callback(message);
      }
    });
  }
  
  private topicMatches(pattern: string, topic: string): boolean {
    // Simple wildcard matching
    if (pattern === topic) return true;
    if (pattern.endsWith('/#')) {
      const prefix = pattern.slice(0, -2);
      return topic.startsWith(prefix);
    }
    if (pattern.includes('/+/')) {
      const parts = pattern.split('/+/');
      return topic.startsWith(parts[0]) && topic.endsWith(parts[1]);
    }
    return false;
  }
  
  async unsubscribe(topic: string): Promise<void> {
    this.subscriptions.delete(topic);
    console.log(`Unsubscribed from MQTT topic: ${topic}`);
  }
  
  disconnect(): void {
    this.connected = false;
    this.subscriptions.clear();
    this.mockData.clear();
  }
}

// Protocol Factory
export class ProtocolFactory {
  static create(config: ProtocolConfig): any {
    switch (config.type) {
      case 'modbus':
        return new ModbusProtocol(config.connection);
      case 'bacnet':
        return new BACnetProtocol(config.connection);
      case 'opcua':
        return new OPCUAProtocol(config.connection);
      case 'mqtt':
        return new MQTTProtocol(config.connection);
      default:
        throw new Error(`Unsupported protocol: ${config.type}`);
    }
  }
}

// Common data transformations
export class DataTransformer {
  // Convert raw register values to engineering units
  static registersToFloat(registers: number[]): number {
    if (registers.length !== 2) throw new Error('Float requires 2 registers');
    
    // IEEE 754 32-bit float from two 16-bit registers
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint16(0, registers[0]);
    view.setUint16(2, registers[1]);
    return view.getFloat32(0);
  }
  
  static floatToRegisters(value: number): number[] {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, value);
    return [view.getUint16(0), view.getUint16(2)];
  }
  
  // Scale raw values to engineering units
  static scale(rawValue: number, scale: number, offset: number = 0): number {
    return rawValue * scale + offset;
  }
  
  // Apply deadband to reduce noise
  static applyDeadband(currentValue: number, newValue: number, deadband: number): number {
    if (Math.abs(newValue - currentValue) > deadband) {
      return newValue;
    }
    return currentValue;
  }
  
  // Convert between data types
  static convertDataType(value: any, fromType: string, toType: string): any {
    if (fromType === toType) return value;
    
    switch (`${fromType}->${toType}`) {
      case 'string->number':
        return parseFloat(value);
      case 'number->string':
        return value.toString();
      case 'boolean->number':
        return value ? 1 : 0;
      case 'number->boolean':
        return value !== 0;
      default:
        return value;
    }
  }
}