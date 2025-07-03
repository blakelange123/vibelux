/**
 * HMI Equipment Registry and Auto-Configuration System
 * Automatically generates HMI interfaces based on user's equipment setup
 */

export interface EquipmentDefinition {
  id: string;
  type: EquipmentType;
  name: string;
  location: string;
  specifications: Record<string, any>;
  connections: ConnectionPoint[];
  controlPoints: ControlPoint[];
  telemetry: TelemetryPoint[];
  animations: AnimationConfig[];
}

export enum EquipmentType {
  // HVAC Equipment
  FAN = 'fan',
  EXHAUST_FAN = 'exhaust_fan',
  CIRCULATION_FAN = 'circulation_fan',
  AC_UNIT = 'ac_unit',
  HEATER = 'heater',
  DEHUMIDIFIER = 'dehumidifier',
  HUMIDIFIER = 'humidifier',
  
  // Water/Irrigation
  PUMP = 'pump',
  VALVE = 'valve',
  TANK = 'tank',
  FILTER = 'filter',
  DOSING_PUMP = 'dosing_pump',
  
  // Lighting
  LED_FIXTURE = 'led_fixture',
  HPS_FIXTURE = 'hps_fixture',
  LIGHT_CONTROLLER = 'light_controller',
  
  // Sensors
  TEMP_SENSOR = 'temp_sensor',
  HUMIDITY_SENSOR = 'humidity_sensor',
  CO2_SENSOR = 'co2_sensor',
  FLOW_METER = 'flow_meter',
  PRESSURE_SENSOR = 'pressure_sensor',
  PH_SENSOR = 'ph_sensor',
  EC_SENSOR = 'ec_sensor',
  
  // Power/Electrical
  PANEL = 'electrical_panel',
  RELAY = 'relay',
  VFD = 'vfd',
  CONTACTOR = 'contactor',
  
  // Special Equipment
  CO2_GENERATOR = 'co2_generator',
  CO2_TANK = 'co2_tank',
  CHILLER = 'chiller',
  BOILER = 'boiler'
}

export interface ConnectionPoint {
  id: string;
  type: 'input' | 'output' | 'bidirectional';
  medium: 'electrical' | 'water' | 'air' | 'data';
  position: { x: number; y: number };
}

export interface ControlPoint {
  id: string;
  name: string;
  type: 'boolean' | 'range' | 'enum';
  value: any;
  min?: number;
  max?: number;
  unit?: string;
  options?: string[];
  writeEnabled: boolean;
}

export interface TelemetryPoint {
  id: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  alarmLow?: number;
  alarmHigh?: number;
  trend?: number[]; // Last N values
}

export interface AnimationConfig {
  type: AnimationType;
  trigger: 'always' | 'onValue' | 'onState';
  condition?: string; // e.g., "speed > 0", "state === 'running'"
  parameters: Record<string, any>;
}

export enum AnimationType {
  ROTATION = 'rotation',
  LINEAR_MOTION = 'linear_motion',
  FILL_LEVEL = 'fill_level',
  COLOR_CHANGE = 'color_change',
  PARTICLE_FLOW = 'particle_flow',
  PULSATE = 'pulsate',
  VIBRATION = 'vibration'
}

// Equipment Templates - Pre-configured equipment types
export const EQUIPMENT_TEMPLATES: Record<EquipmentType, Partial<EquipmentDefinition>> = {
  [EquipmentType.FAN]: {
    controlPoints: [
      { id: 'power', name: 'Power', type: 'boolean', value: false, writeEnabled: true },
      { id: 'speed', name: 'Speed', type: 'range', value: 0, min: 0, max: 100, unit: '%', writeEnabled: true }
    ],
    telemetry: [
      { id: 'rpm', name: 'RPM', value: 0, unit: 'RPM', min: 0, max: 3000 },
      { id: 'power_consumption', name: 'Power', value: 0, unit: 'kW', min: 0, max: 10 }
    ],
    animations: [
      {
        type: AnimationType.ROTATION,
        trigger: 'onValue',
        condition: 'speed > 0',
        parameters: {
          speed: 'speed * 0.1', // Convert % to rotation speed
          axis: 'z'
        }
      }
    ]
  },
  
  [EquipmentType.PUMP]: {
    controlPoints: [
      { id: 'power', name: 'Power', type: 'boolean', value: false, writeEnabled: true },
      { id: 'flow_setpoint', name: 'Flow Setpoint', type: 'range', value: 0, min: 0, max: 100, unit: 'GPM', writeEnabled: true }
    ],
    telemetry: [
      { id: 'flow_rate', name: 'Flow Rate', value: 0, unit: 'GPM', min: 0, max: 100 },
      { id: 'pressure', name: 'Pressure', value: 0, unit: 'PSI', min: 0, max: 100 },
      { id: 'power_consumption', name: 'Power', value: 0, unit: 'kW', min: 0, max: 5 }
    ],
    animations: [
      {
        type: AnimationType.VIBRATION,
        trigger: 'onState',
        condition: 'power === true',
        parameters: { intensity: 0.1 }
      },
      {
        type: AnimationType.PARTICLE_FLOW,
        trigger: 'onValue',
        condition: 'flow_rate > 0',
        parameters: {
          speed: 'flow_rate * 0.01',
          particleCount: 20
        }
      }
    ]
  },
  
  [EquipmentType.TANK]: {
    controlPoints: [
      { id: 'inlet_valve', name: 'Inlet Valve', type: 'boolean', value: false, writeEnabled: true },
      { id: 'outlet_valve', name: 'Outlet Valve', type: 'boolean', value: false, writeEnabled: true }
    ],
    telemetry: [
      { id: 'level', name: 'Level', value: 50, unit: '%', min: 0, max: 100, alarmLow: 10, alarmHigh: 90 },
      { id: 'volume', name: 'Volume', value: 500, unit: 'gal', min: 0, max: 1000 }
    ],
    animations: [
      {
        type: AnimationType.FILL_LEVEL,
        trigger: 'onValue',
        condition: 'true',
        parameters: {
          level: 'level',
          liquidColor: '#3B82F6'
        }
      }
    ]
  },
  
  [EquipmentType.LED_FIXTURE]: {
    controlPoints: [
      { id: 'power', name: 'Power', type: 'boolean', value: false, writeEnabled: true },
      { id: 'dimming', name: 'Dimming', type: 'range', value: 0, min: 0, max: 100, unit: '%', writeEnabled: true },
      { id: 'spectrum', name: 'Spectrum', type: 'enum', value: 'full', options: ['full', 'veg', 'bloom'], writeEnabled: true }
    ],
    telemetry: [
      { id: 'ppfd', name: 'PPFD', value: 0, unit: 'μmol/m²/s', min: 0, max: 2000 },
      { id: 'power_consumption', name: 'Power', value: 0, unit: 'W', min: 0, max: 1000 },
      { id: 'temperature', name: 'Temperature', value: 25, unit: '°C', min: 0, max: 80, alarmHigh: 70 }
    ],
    animations: [
      {
        type: AnimationType.COLOR_CHANGE,
        trigger: 'onState',
        condition: 'power === true',
        parameters: {
          color: 'spectrum === "veg" ? "#4FC3F7" : spectrum === "bloom" ? "#FF6B6B" : "#FFFFFF"',
          intensity: 'dimming / 100'
        }
      }
    ]
  }
};

// Equipment Discovery Service
export class EquipmentDiscoveryService {
  /**
   * Auto-discover equipment from various sources
   */
  static async discoverEquipment(facilityId: string): Promise<EquipmentDefinition[]> {
    const equipment: EquipmentDefinition[] = [];
    
    // 1. Check integrated systems (Trolmaster, Argus, etc.)
    const integratedEquipment = await this.checkIntegratedSystems(facilityId);
    equipment.push(...integratedEquipment);
    
    // 2. Check modbus devices
    const modbusEquipment = await this.scanModbusDevices();
    equipment.push(...modbusEquipment);
    
    // 3. Check BACnet devices
    const bacnetEquipment = await this.scanBACnetDevices();
    equipment.push(...bacnetEquipment);
    
    // 4. Check database for manually configured equipment
    const manualEquipment = await this.loadManualEquipment(facilityId);
    equipment.push(...manualEquipment);
    
    return equipment;
  }
  
  private static async checkIntegratedSystems(facilityId: string): Promise<EquipmentDefinition[]> {
    // Check for Trolmaster, Argus, Priva, etc.
    // This would integrate with their APIs
    return [];
  }
  
  private static async scanModbusDevices(): Promise<EquipmentDefinition[]> {
    // Scan modbus network for devices
    return [];
  }
  
  private static async scanBACnetDevices(): Promise<EquipmentDefinition[]> {
    // Scan BACnet network for devices
    return [];
  }
  
  private static async loadManualEquipment(facilityId: string): Promise<EquipmentDefinition[]> {
    // Load from database
    return [];
  }
}

// HMI Layout Generator
export class HMILayoutGenerator {
  /**
   * Automatically generate HMI layout based on equipment and room configuration
   */
  static generateLayout(
    equipment: EquipmentDefinition[],
    roomConfig: RoomConfiguration
  ): HMILayout {
    const layout: HMILayout = {
      id: `hmi-${Date.now()}`,
      name: roomConfig.name,
      canvas: {
        width: 1920,
        height: 1080,
        backgroundColor: '#1F2937'
      },
      elements: [],
      connections: []
    };
    
    // Group equipment by type and location
    const grouped = this.groupEquipment(equipment);
    
    // Generate layout for each group
    grouped.forEach((group, index) => {
      const position = this.calculateGroupPosition(index, grouped.length);
      const groupElements = this.layoutEquipmentGroup(group, position);
      layout.elements.push(...groupElements);
    });
    
    // Auto-connect related equipment
    layout.connections = this.generateConnections(equipment);
    
    return layout;
  }
  
  private static groupEquipment(equipment: EquipmentDefinition[]): EquipmentDefinition[][] {
    // Group by location and type for logical layout
    const groups: Map<string, EquipmentDefinition[]> = new Map();
    
    equipment.forEach(eq => {
      const key = `${eq.location}-${eq.type}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(eq);
    });
    
    return Array.from(groups.values());
  }
  
  private static calculateGroupPosition(index: number, total: number): { x: number; y: number } {
    // Calculate position in a grid layout
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    return {
      x: 100 + (col * 400),
      y: 100 + (row * 300)
    };
  }
  
  private static layoutEquipmentGroup(
    group: EquipmentDefinition[],
    position: { x: number; y: number }
  ): HMIElement[] {
    // Layout equipment within a group
    return group.map((eq, index) => ({
      id: eq.id,
      type: 'equipment',
      equipmentId: eq.id,
      position: {
        x: position.x + (index % 3) * 120,
        y: position.y + Math.floor(index / 3) * 150
      },
      size: this.getEquipmentSize(eq.type),
      rotation: 0
    }));
  }
  
  private static getEquipmentSize(type: EquipmentType): { width: number; height: number } {
    // Return appropriate size based on equipment type
    const sizes: Record<EquipmentType, { width: number; height: number }> = {
      [EquipmentType.FAN]: { width: 80, height: 80 },
      [EquipmentType.PUMP]: { width: 60, height: 40 },
      [EquipmentType.TANK]: { width: 100, height: 120 },
      [EquipmentType.LED_FIXTURE]: { width: 120, height: 40 },
      // ... more sizes
    } as any;
    
    return sizes[type] || { width: 60, height: 60 };
  }
  
  private static generateConnections(equipment: EquipmentDefinition[]): HMIConnection[] {
    // Auto-generate connections based on equipment relationships
    const connections: HMIConnection[] = [];
    
    // Example: Connect pumps to tanks
    const pumps = equipment.filter(eq => eq.type === EquipmentType.PUMP);
    const tanks = equipment.filter(eq => eq.type === EquipmentType.TANK);
    
    pumps.forEach(pump => {
      // Find nearest tank
      const nearestTank = tanks[0]; // Simplified
      if (nearestTank) {
        connections.push({
          id: `conn-${pump.id}-${nearestTank.id}`,
          from: pump.id,
          to: nearestTank.id,
          type: 'water',
          animated: true
        });
      }
    });
    
    return connections;
  }
}

// Types for HMI Layout
export interface HMILayout {
  id: string;
  name: string;
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  elements: HMIElement[];
  connections: HMIConnection[];
}

export interface HMIElement {
  id: string;
  type: 'equipment' | 'label' | 'gauge' | 'chart';
  equipmentId?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
}

export interface HMIConnection {
  id: string;
  from: string;
  to: string;
  type: 'electrical' | 'water' | 'air' | 'data';
  animated: boolean;
}

export interface RoomConfiguration {
  id: string;
  name: string;
  type: 'grow' | 'dry' | 'processing' | 'mechanical';
  dimensions: { width: number; length: number; height: number };
}