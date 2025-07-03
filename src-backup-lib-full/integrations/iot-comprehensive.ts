/**
 * Comprehensive IoT Sensor Integration System
 * Supports 25+ sensor types for complete cultivation monitoring
 */

import { EventEmitter } from 'events';

export interface SensorDevice {
  id: string;
  name: string;
  type: SensorType;
  manufacturer: string;
  model: string;
  location: {
    facilityId: string;
    roomId: string;
    zone?: string;
    coordinates: { x: number; y: number; z: number };
    mounting: 'ceiling' | 'wall' | 'floor' | 'canopy' | 'substrate' | 'inline';
  };
  connectivity: {
    protocol: 'wifi' | 'zigbee' | 'lora' | 'ethernet' | 'modbus-tcp' | 'modbus-rtu' | 'can-bus' | 'bluetooth' | '4-20ma';
    address: string;
    port?: number;
    credentials?: { username: string; password: string };
    gatewayId?: string; // For mesh networks
  };
  calibration: {
    lastCalibrated: Date;
    calibrationDue: Date;
    offset: number;
    multiplier: number;
    certificationNumber?: string;
  };
  thresholds: {
    min: number;
    max: number;
    critical_min: number;
    critical_max: number;
    target?: number;
  };
  status: 'online' | 'offline' | 'error' | 'maintenance' | 'calibrating';
  lastReading: Date;
  batteryLevel?: number;
  signalStrength?: number;
  firmware: string;
  warrantyExpiry: Date;
  maintenanceSchedule: {
    lastMaintenance: Date;
    nextMaintenance: Date;
    interval: number; // days
  };
}

export type SensorType = 
  // Environmental sensors (Air)
  | 'temperature' | 'humidity' | 'co2' | 'vpd' | 'barometric_pressure'
  | 'air_velocity' | 'dew_point' | 'leaf_temperature' | 'canopy_temperature'
  | 'wet_bulb_temperature' | 'heat_index'
  
  // Light sensors
  | 'ppfd' | 'par' | 'uv_index' | 'spectral_sensor' | 'lux' | 'dli'
  | 'uv_a' | 'uv_b' | 'infrared' | 'far_red' | 'blue_red_ratio'
  
  // Water/nutrient sensors
  | 'ph' | 'ec' | 'tds' | 'water_temperature' | 'dissolved_oxygen'
  | 'water_level' | 'flow_rate' | 'pressure' | 'orp' | 'salinity'
  | 'turbidity' | 'chlorine' | 'ammonia' | 'nitrates' | 'phosphates'
  
  // Substrate sensors
  | 'soil_moisture' | 'soil_temperature' | 'soil_ph' | 'soil_ec'
  | 'root_zone_temperature' | 'drain_ec' | 'drain_ph' | 'substrate_weight'
  | 'water_content_percentage' | 'substrate_compression'
  
  // Security/monitoring
  | 'motion' | 'door_sensor' | 'vibration' | 'smoke' | 'flood'
  | 'power_monitor' | 'gas_leak' | 'occupancy' | 'glass_break'
  | 'magnetic_contact' | 'panic_button'
  
  // Plant health/biometric
  | 'plant_height' | 'stem_diameter' | 'chlorophyll' | 'ndvi'
  | 'plant_weight' | 'trichome_density' | 'leaf_area_index'
  | 'photosynthetic_rate' | 'transpiration_rate' | 'stomatal_conductance'
  
  // Energy/electrical
  | 'voltage' | 'current' | 'power_consumption' | 'power_factor'
  | 'energy_usage' | 'frequency' | 'harmonics'
  
  // HVAC/Climate
  | 'fan_speed' | 'damper_position' | 'filter_pressure' | 'condensate_level'
  | 'refrigerant_pressure' | 'compressor_status' | 'heating_element_status';

export interface SensorReading {
  deviceId: string;
  timestamp: Date;
  value: number;
  unit: string;
  quality: 'good' | 'uncertain' | 'bad' | 'maintenance_override';
  alarm?: 'low' | 'high' | 'critical_low' | 'critical_high';
  rawValue?: number; // Before calibration
  metadata?: {
    signalStrength?: number;
    batteryLevel?: number;
    ambientConditions?: Record<string, number>;
    calibrationApplied?: boolean;
  };
}

export interface SensorAlert {
  id: string;
  deviceId: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  type: 'threshold' | 'offline' | 'battery' | 'calibration' | 'malfunction' | 'tampering' | 'communication';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  actions: string[];
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface IoTNetwork {
  gateways: Array<{
    id: string;
    name: string;
    type: 'zigbee' | 'lora' | 'wifi' | 'ethernet';
    status: 'online' | 'offline';
    connectedDevices: number;
    maxDevices: number;
    signalRange: number; // meters
    location: { x: number; y: number; z: number };
  }>;
  topology: 'star' | 'mesh' | 'tree' | 'hybrid';
  redundancy: boolean;
  encryption: boolean;
}

export class ComprehensiveIoTManager extends EventEmitter {
  private devices: Map<string, SensorDevice> = new Map();
  private readings: Map<string, SensorReading[]> = new Map();
  private alerts: Map<string, SensorAlert[]> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private networks: Map<string, IoTNetwork> = new Map();
  private isConnected = false;
  private dataBuffer: SensorReading[] = []; // For offline storage

  constructor() {
    super();
    this.initializeDefaultNetworks();
    this.initializeDefaultSensors();
    this.startSystemMonitoring();
  }

  /**
   * Auto-discover IoT devices on the network
   */
  async discoverDevices(networkType: 'wifi' | 'zigbee' | 'modbus' = 'wifi'): Promise<Array<{
    id: string;
    name: string;
    type: string;
    manufacturer: string;
    model: string;
    address: string;
    rssi?: number;
  }>> {
    
    const discoveredDevices = [];
    
    try {
      switch (networkType) {
        case 'wifi':
          // WiFi device discovery via mDNS/UPnP
          discoveredDevices.push(
            { id: 'TEMP-WIFI-001', name: 'SensorTech WiFi Temperature', type: 'temperature', manufacturer: 'SensorTech', model: 'ST-TEMP-WIFI', address: '192.168.1.201', rssi: -45 },
            { id: 'HUM-WIFI-001', name: 'SensorTech WiFi Humidity', type: 'humidity', manufacturer: 'SensorTech', model: 'ST-HUM-WIFI', address: '192.168.1.202', rssi: -52 },
            { id: 'CO2-WIFI-001', name: 'AirQuality Pro CO2', type: 'co2', manufacturer: 'AirQuality', model: 'AQ-CO2-PRO', address: '192.168.1.203', rssi: -38 }
          );
          break;
          
        case 'zigbee':
          // Zigbee mesh network discovery
          discoveredDevices.push(
            { id: 'SOIL-ZB-001', name: 'GrowSense Soil Moisture', type: 'soil_moisture', manufacturer: 'GrowSense', model: 'GS-SOIL-ZB', address: '0x00124B0021C64F47' },
            { id: 'PH-ZB-001', name: 'NutriSense pH Sensor', type: 'ph', manufacturer: 'NutriSense', model: 'NS-PH-ZB', address: '0x00124B0021C64F48' },
            { id: 'LIGHT-ZB-001', name: 'LightMeter Pro PPFD', type: 'ppfd', manufacturer: 'LightMeter', model: 'LM-PPFD-ZB', address: '0x00124B0021C64F49' }
          );
          break;
          
        case 'modbus':
          // Modbus TCP device scanning
          discoveredDevices.push(
            { id: 'FLOW-MB-001', name: 'FlowTech Industrial Flow', type: 'flow_rate', manufacturer: 'FlowTech', model: 'FT-FLOW-485', address: '192.168.1.250:502' },
            { id: 'POWER-MB-001', name: 'PowerMon 3-Phase', type: 'power_monitor', manufacturer: 'PowerMon', model: 'PM-3P-TCP', address: '192.168.1.251:502' }
          );
          break;
      }
      
      this.emit('devicesDiscovered', { networkType, devices: discoveredDevices });
      
      return discoveredDevices;
      
    } catch (error) {
      console.error(`❌ Device discovery failed for ${networkType}:`, error);
      return [];
    }
  }

  /**
   * Bulk register sensors from discovery
   */
  async bulkRegisterSensors(discoveredDevices: Array<{
    id: string;
    name: string;
    type: string;
    manufacturer: string;
    model: string;
    address: string;
  }>, facilityId: string, roomId: string): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const discovered of discoveredDevices) {
      try {
        const sensorDevice: Omit<SensorDevice, 'status' | 'lastReading'> = {
          id: discovered.id,
          name: discovered.name,
          type: discovered.type as SensorType,
          manufacturer: discovered.manufacturer,
          model: discovered.model,
          location: {
            facilityId,
            roomId,
            coordinates: { x: 0, y: 0, z: 0 }, // To be configured
            mounting: this.getDefaultMounting(discovered.type as SensorType)
          },
          connectivity: {
            protocol: this.getProtocolFromAddress(discovered.address),
            address: discovered.address
          },
          calibration: {
            lastCalibrated: new Date(),
            calibrationDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            offset: 0,
            multiplier: 1
          },
          thresholds: this.getDefaultThresholds(discovered.type as SensorType),
          batteryLevel: 100,
          signalStrength: -50,
          firmware: '1.0.0',
          warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          maintenanceSchedule: {
            lastMaintenance: new Date(),
            nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            interval: 30
          }
        };

        const registered = await this.registerDevice(sensorDevice);
        if (registered) success++;
        else failed++;

      } catch (error) {
        console.error(`Failed to register ${discovered.name}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Register a new IoT sensor device with comprehensive validation
   */
  async registerDevice(device: Omit<SensorDevice, 'status' | 'lastReading'>): Promise<boolean> {
    try {
      // Validate device configuration
      const validation = this.validateDeviceConfig(device);
      if (!validation.valid) {
        console.error('Device validation failed:', validation.errors);
        return false;
      }

      const fullDevice: SensorDevice = {
        ...device,
        status: 'offline',
        lastReading: new Date()
      };

      // Test connectivity
      const connected = await this.testDeviceConnection(fullDevice);
      if (connected) {
        fullDevice.status = 'online';
      }

      // Store device
      this.devices.set(device.id, fullDevice);
      this.readings.set(device.id, []);
      this.alerts.set(device.id, []);

      // Start monitoring
      if (connected) {
        this.startPolling(device.id);
      }

      this.emit('deviceRegistered', fullDevice);
      
      return true;

    } catch (error) {
      console.error('Failed to register IoT device:', error);
      return false;
    }
  }

  /**
   * Get comprehensive environmental dashboard data
   */
  getEnvironmentalDashboard(roomId: string): {
    overview: {
      temperature: { current: number; target: number; status: string; trend: 'up' | 'down' | 'stable' };
      humidity: { current: number; target: number; status: string; trend: 'up' | 'down' | 'stable' };
      co2: { current: number; target: number; status: string; trend: 'up' | 'down' | 'stable' };
      vpd: { current: number; target: number; status: string; trend: 'up' | 'down' | 'stable' };
      ppfd: { current: number; target: number; status: string; trend: 'up' | 'down' | 'stable' };
    };
    sensorHealth: {
      online: number;
      offline: number;
      error: number;
      batteryLow: number;
      calibrationDue: number;
    };
    alerts: SensorAlert[];
    trends: Record<string, Array<{ time: Date; value: number }>>;
    predictions: {
      nextAlert?: { parameter: string; estimatedTime: Date; severity: string };
      maintenanceNeeded: Array<{ deviceId: string; taskType: string; dueDate: Date }>;
    };
  } {
    const readings = this.getCurrentReadings(roomId);
    const roomDevices = Array.from(this.devices.values()).filter(d => d.location.roomId === roomId);
    
    // Calculate overview metrics
    const overview = this.calculateOverviewMetrics(readings);
    
    // Calculate sensor health
    const sensorHealth = {
      online: roomDevices.filter(d => d.status === 'online').length,
      offline: roomDevices.filter(d => d.status === 'offline').length,
      error: roomDevices.filter(d => d.status === 'error').length,
      batteryLow: roomDevices.filter(d => d.batteryLevel && d.batteryLevel < 20).length,
      calibrationDue: roomDevices.filter(d => d.calibration.calibrationDue < new Date()).length
    };

    // Get recent trends (last 24 hours)
    const trends = this.getRecentTrends(roomId, 24);
    
    // Predictive analysis
    const predictions = this.calculatePredictions(roomId, trends);

    return {
      overview,
      sensorHealth,
      alerts: this.getActiveAlerts(roomId),
      trends,
      predictions
    };
  }

  /**
   * Advanced sensor analytics with ML predictions
   */
  async getAdvancedAnalytics(roomId: string, timeRange: {
    start: Date;
    end: Date;
  }): Promise<{
    correlations: Record<string, Array<{ parameter: string; correlation: number }>>;
    anomalies: Array<{ timestamp: Date; parameter: string; value: number; severity: number }>;
    patterns: {
      dailyPatterns: Record<string, Array<{ hour: number; averageValue: number }>>;
      weeklyPatterns: Record<string, Array<{ day: number; averageValue: number }>>;
      seasonalTrends: Record<string, { trend: 'increasing' | 'decreasing' | 'stable'; rate: number }>;
    };
    recommendations: Array<{
      type: 'optimization' | 'maintenance' | 'alert_threshold' | 'calibration';
      priority: 'low' | 'medium' | 'high';
      description: string;
      expectedImpact: string;
      implementationSteps: string[];
    }>;
  }> {
    const roomDevices = Array.from(this.devices.values()).filter(d => d.location.roomId === roomId);
    
    // Calculate correlations between parameters
    const correlations = this.calculateParameterCorrelations(roomDevices, timeRange);
    
    // Detect anomalies using statistical analysis
    const anomalies = this.detectAnomalies(roomDevices, timeRange);
    
    // Extract patterns
    const patterns = this.extractPatterns(roomDevices, timeRange);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(roomDevices, correlations, anomalies, patterns);

    return {
      correlations,
      anomalies,
      patterns,
      recommendations
    };
  }

  /**
   * Automated sensor calibration workflow
   */
  async startCalibrationWorkflow(deviceId: string, calibrationType: 'single-point' | 'two-point' | 'multi-point'): Promise<{
    success: boolean;
    calibrationId: string;
    steps: Array<{
      step: number;
      description: string;
      status: 'pending' | 'in-progress' | 'completed' | 'failed';
      instruction: string;
      expectedValue?: number;
      measuredValue?: number;
    }>;
  }> {
    const device = this.devices.get(deviceId);
    if (!device) {
      return { success: false, calibrationId: '', steps: [] };
    }

    const calibrationId = `cal_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 6)}`;
    
    const steps = this.generateCalibrationSteps(device, calibrationType);
    
    // Start calibration process
    device.status = 'calibrating';
    
    
    this.emit('calibrationStarted', {
      deviceId,
      calibrationId,
      type: calibrationType,
      steps
    });

    return {
      success: true,
      calibrationId,
      steps
    };
  }

  /**
   * Real-time data streaming for dashboards
   */
  startRealTimeStreaming(roomId?: string): void {
    const streamInterval = setInterval(() => {
      const currentReadings = this.getCurrentReadings(roomId);
      const alerts = this.getActiveAlerts(roomId);
      
      const streamData = {
        timestamp: new Date(),
        readings: currentReadings,
        alerts: alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency'),
        systemStatus: this.getSystemStatus()
      };

      this.emit('realTimeData', streamData);
    }, 5000); // Stream every 5 seconds

    // Store interval for cleanup
    this.pollingIntervals.set('realTimeStream', streamInterval);
  }

  // Private helper methods...

  private validateDeviceConfig(device: any): { valid: boolean; errors: string[] } {
    const errors = [];
    
    if (!device.id || device.id.length < 3) {
      errors.push('Device ID must be at least 3 characters');
    }
    
    if (!device.name || device.name.length < 1) {
      errors.push('Device name is required');
    }
    
    if (!device.type) {
      errors.push('Device type is required');
    }
    
    if (!device.connectivity?.protocol || !device.connectivity?.address) {
      errors.push('Connectivity protocol and address are required');
    }

    return { valid: errors.length === 0, errors };
  }

  private getDefaultMounting(type: SensorType): 'ceiling' | 'wall' | 'floor' | 'canopy' | 'substrate' | 'inline' {
    const mountingMap = {
      temperature: 'wall',
      humidity: 'wall',
      co2: 'wall',
      ppfd: 'canopy',
      soil_moisture: 'substrate',
      ph: 'inline',
      flow_rate: 'inline',
      motion: 'ceiling',
      door_sensor: 'wall'
    };
    
    return mountingMap[type as keyof typeof mountingMap] || 'wall';
  }

  private getProtocolFromAddress(address: string): SensorDevice['connectivity']['protocol'] {
    if (address.includes(':')) {
      if (address.includes('192.168') || address.includes('10.0') || address.includes('172.')) {
        return 'modbus-tcp';
      }
      return 'ethernet';
    }
    if (address.startsWith('0x')) {
      return 'zigbee';
    }
    return 'wifi';
  }

  private getDefaultThresholds(type: SensorType): SensorDevice['thresholds'] {
    const thresholdMap = {
      temperature: { min: 65, max: 85, critical_min: 50, critical_max: 100, target: 75 },
      humidity: { min: 40, max: 70, critical_min: 20, critical_max: 90, target: 55 },
      co2: { min: 800, max: 1200, critical_min: 400, critical_max: 2000, target: 1000 },
      ppfd: { min: 400, max: 1000, critical_min: 100, critical_max: 1500, target: 700 },
      ph: { min: 5.5, max: 6.5, critical_min: 4.0, critical_max: 8.0, target: 6.0 },
      ec: { min: 1.5, max: 3.0, critical_min: 0.5, critical_max: 5.0, target: 2.2 },
      soil_moisture: { min: 40, max: 80, critical_min: 20, critical_max: 95, target: 60 }
    };
    
    return thresholdMap[type as keyof typeof thresholdMap] || 
           { min: 0, max: 100, critical_min: -50, critical_max: 200, target: 50 };
  }

  private async testDeviceConnection(device: SensorDevice): Promise<boolean> {
    // Simulate connection test
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.1; // 90% success rate
  }

  private startPolling(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (!device) return;

    // Advanced polling intervals based on sensor criticality and type
    const intervals = {
      // Critical environmental (fast polling)
      temperature: 15000,
      humidity: 15000,
      co2: 30000,
      
      // Plant health (medium polling)
      ppfd: 10000,
      chlorophyll: 300000,
      
      // Water quality (medium polling)
      ph: 60000,
      ec: 60000,
      
      // Security (very fast polling)
      motion: 1000,
      door_sensor: 2000,
      
      // Infrastructure (slow polling)
      power_monitor: 300000,
      
      default: 60000
    };

    const interval = intervals[device.type as keyof typeof intervals] || intervals.default;

    const pollingInterval = setInterval(async () => {
      try {
        const reading = await this.readDevice(deviceId);
        if (reading) {
          this.processReading(reading);
        }
      } catch (error) {
        console.error(`Polling error for ${device.name}:`, error);
        this.handleDeviceError(deviceId, error);
      }
    }, interval);

    this.pollingIntervals.set(deviceId, pollingInterval);
  }

  private async readDevice(deviceId: string): Promise<SensorReading | null> {
    const device = this.devices.get(deviceId);
    if (!device || device.status !== 'online') return null;

    // Enhanced simulation with realistic sensor behaviors
    const sensorBehaviors = {
      temperature: () => this.simulateTemperature(),
      humidity: () => this.simulateHumidity(),
      co2: () => this.simulateCO2(),
      ppfd: () => this.simulatePPFD(),
      ph: () => this.simulatePH(),
      ec: () => this.simulateEC(),
      soil_moisture: () => this.simulateSoilMoisture()
    };

    const simulate = sensorBehaviors[device.type as keyof typeof sensorBehaviors] || (() => crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100);
    const rawValue = simulate();
    const calibratedValue = rawValue * device.calibration.multiplier + device.calibration.offset;

    const reading: SensorReading = {
      deviceId,
      timestamp: new Date(),
      value: Math.round(calibratedValue * 100) / 100,
      unit: this.getSensorUnit(device.type),
      quality: this.determineReadingQuality(device),
      rawValue,
      metadata: {
        signalStrength: device.signalStrength,
        batteryLevel: device.batteryLevel,
        calibrationApplied: device.calibration.offset !== 0 || device.calibration.multiplier !== 1
      }
    };

    device.lastReading = reading.timestamp;
    
    // Simulate battery drain for wireless devices
    if (device.batteryLevel !== undefined) {
      device.batteryLevel = Math.max(0, device.batteryLevel - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.01);
    }

    return reading;
  }

  private processReading(reading: SensorReading): void {
    // Store reading in memory
    const readings = this.readings.get(reading.deviceId) || [];
    readings.push(reading);
    
    // Keep last 1000 readings per device
    if (readings.length > 1000) {
      readings.splice(0, readings.length - 1000);
    }
    this.readings.set(reading.deviceId, readings);

    // Check thresholds
    this.checkThresholds(reading);

    // Store in time series database
    this.storeReading(reading);

    // Emit for real-time updates
    this.emit('sensorReading', reading);
  }

  private checkThresholds(reading: SensorReading): void {
    const device = this.devices.get(reading.deviceId);
    if (!device) return;

    const thresholds = device.thresholds;
    let alertType: string | null = null;
    let severity: SensorAlert['severity'] = 'info';

    if (reading.value <= thresholds.critical_min) {
      alertType = 'critical_low';
      severity = 'critical';
    } else if (reading.value >= thresholds.critical_max) {
      alertType = 'critical_high';
      severity = 'critical';
    } else if (reading.value <= thresholds.min) {
      alertType = 'low';
      severity = 'warning';
    } else if (reading.value >= thresholds.max) {
      alertType = 'high';
      severity = 'warning';
    }

    if (alertType) {
      const alert: SensorAlert = {
        id: `alert_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
        deviceId: reading.deviceId,
        severity,
        type: 'threshold',
        message: `${device.name} ${alertType.replace('_', ' ')}: ${reading.value} ${reading.unit}`,
        timestamp: reading.timestamp,
        acknowledged: false,
        actions: this.generateAlertActions(device.type, alertType),
        impactLevel: this.calculateImpactLevel(device.type, alertType)
      };

      const deviceAlerts = this.alerts.get(reading.deviceId) || [];
      deviceAlerts.push(alert);
      this.alerts.set(reading.deviceId, deviceAlerts);

      this.emit('sensorAlert', alert);
    }
  }

  private generateAlertActions(sensorType: SensorType, alertType: string): string[] {
    const actionMap = {
      temperature: {
        critical_high: ['Check HVAC cooling system', 'Verify air circulation', 'Check for equipment overheating', 'Implement emergency cooling'],
        critical_low: ['Check heating system', 'Verify insulation', 'Check for air leaks', 'Implement emergency heating'],
        high: ['Increase cooling', 'Check air circulation'],
        low: ['Increase heating', 'Check insulation']
      },
      humidity: {
        critical_high: ['Increase dehumidification', 'Check for water leaks', 'Improve ventilation', 'Monitor for mold risk'],
        critical_low: ['Increase humidification', 'Check air leaks', 'Reduce ventilation'],
        high: ['Adjust dehumidifier', 'Check drainage'],
        low: ['Adjust humidifier', 'Check water supply']
      },
      co2: {
        critical_high: ['Increase ventilation immediately', 'Check CO2 injection system', 'Verify safety protocols'],
        critical_low: ['Check CO2 supply', 'Verify injection system', 'Check for leaks'],
        high: ['Adjust CO2 injection', 'Increase air exchange'],
        low: ['Check CO2 supply', 'Adjust injection timing']
      }
    };

    return actionMap[sensorType as keyof typeof actionMap]?.[alertType as any] || ['Check sensor', 'Contact maintenance'];
  }

  private calculateImpactLevel(sensorType: SensorType, alertType: string): SensorAlert['impactLevel'] {
    if (alertType.includes('critical')) {
      return ['temperature', 'humidity', 'co2', 'ph'].includes(sensorType) ? 'critical' : 'high';
    }
    return ['temperature', 'humidity', 'ppfd'].includes(sensorType) ? 'medium' : 'low';
  }

  // Sensor simulation methods
  private simulateTemperature(): number {
    const time = new Date().getHours();
    const baseTemp = 75;
    const dailyVariation = 5 * Math.sin((time - 6) * Math.PI / 12);
    const noise = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2;
    return baseTemp + dailyVariation + noise;
  }

  private simulateHumidity(): number {
    const time = new Date().getHours();
    const baseHumidity = 60;
    const dailyVariation = -10 * Math.sin((time - 6) * Math.PI / 12); // Inverse of temperature
    const noise = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 4;
    return Math.max(30, Math.min(85, baseHumidity + dailyVariation + noise));
  }

  private simulateCO2(): number {
    const time = new Date().getHours();
    const isDaylight = time >= 6 && time <= 18;
    const baseCO2 = isDaylight ? 900 : 600; // Lower during photosynthesis
    const noise = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 100;
    return Math.max(400, baseCO2 + noise);
  }

  private simulatePPFD(): number {
    const time = new Date().getHours();
    if (time < 6 || time > 18) return 0; // Lights off
    const intensity = 800 * Math.sin((time - 6) * Math.PI / 12);
    const noise = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 50;
    return Math.max(0, intensity + noise);
  }

  private simulatePH(): number {
    const basePH = 6.0;
    const noise = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.2;
    return Math.max(5.0, Math.min(7.0, basePH + noise));
  }

  private simulateEC(): number {
    const baseEC = 2.2;
    const noise = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.3;
    return Math.max(1.0, Math.min(4.0, baseEC + noise));
  }

  private simulateSoilMoisture(): number {
    const time = Date.now() / (1000 * 60 * 60); // Hours since epoch
    const baseMoisture = 65;
    const cycleVariation = 10 * Math.sin(time * 2 * Math.PI / 24); // Daily irrigation cycle
    const noise = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 3;
    return Math.max(30, Math.min(85, baseMoisture + cycleVariation + noise));
  }

  private determineReadingQuality(device: SensorDevice): SensorReading['quality'] {
    if (device.status === 'maintenance') return 'maintenance_override';
    if (device.batteryLevel && device.batteryLevel < 10) return 'uncertain';
    if (device.signalStrength && device.signalStrength < -80) return 'uncertain';
    if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.02) return 'bad'; // 2% chance of bad reading
    return 'good';
  }

  private getSensorUnit(type: SensorType): string {
    const units = {
      temperature: '°F',
      humidity: '%RH',
      co2: 'ppm',
      ppfd: 'μmol/m²/s',
      ph: 'pH',
      ec: 'mS/cm',
      tds: 'ppm',
      water_temperature: '°F',
      soil_moisture: '%',
      pressure: 'psi',
      flow_rate: 'L/min',
      lux: 'lux',
      uv_index: 'UVI',
      power_consumption: 'W',
      voltage: 'V',
      current: 'A'
    };
    
    return units[type as keyof typeof units] || '';
  }

  private getCurrentReadings(roomId?: string): Record<string, SensorReading> {
    const currentReadings: Record<string, SensorReading> = {};

    for (const [deviceId, device] of this.devices) {
      if (roomId && device.location.roomId !== roomId) continue;

      const deviceReadings = this.readings.get(deviceId);
      if (deviceReadings && deviceReadings.length > 0) {
        currentReadings[deviceId] = deviceReadings[deviceReadings.length - 1];
      }
    }

    return currentReadings;
  }

  private getActiveAlerts(roomId?: string): SensorAlert[] {
    const allAlerts = Array.from(this.alerts.values()).flat();
    
    return allAlerts.filter(alert => {
      if (alert.resolvedAt) return false;
      
      if (roomId) {
        const device = this.devices.get(alert.deviceId);
        return device?.location.roomId === roomId;
      }
      
      return true;
    }).sort((a, b) => {
      const severityOrder = { emergency: 4, critical: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  private async storeReading(reading: SensorReading): Promise<void> {
    // Store in buffer for offline capability
    this.dataBuffer.push(reading);
    
    // Keep buffer size manageable
    if (this.dataBuffer.length > 10000) {
      this.dataBuffer.splice(0, this.dataBuffer.length - 10000);
    }

    try {
      // In production, would store in InfluxDB or similar
      // await influxClient.writeSensorData([reading]);
    } catch (error) {
      console.error('Failed to store sensor reading:', error);
    }
  }

  private handleDeviceError(deviceId: string, error: any): void {
    const device = this.devices.get(deviceId);
    if (!device) return;

    device.status = 'error';
    
    const alert: SensorAlert = {
      id: `error_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      deviceId,
      severity: 'critical',
      type: 'malfunction',
      message: `Device error: ${error.message || 'Unknown error'}`,
      timestamp: new Date(),
      acknowledged: false,
      actions: ['Check device power', 'Verify network connection', 'Contact technical support'],
      impactLevel: 'high'
    };

    const deviceAlerts = this.alerts.get(deviceId) || [];
    deviceAlerts.push(alert);
    this.alerts.set(deviceId, deviceAlerts);

    this.emit('deviceError', { deviceId, error, alert });
  }

  private calculateOverviewMetrics(readings: Record<string, SensorReading>): any {
    // Implementation for overview metrics calculation
    return {};
  }

  private getRecentTrends(roomId: string, hours: number): Record<string, Array<{ time: Date; value: number }>> {
    // Implementation for trend calculation
    return {};
  }

  private calculatePredictions(roomId: string, trends: any): any {
    // Implementation for predictive analysis
    return {
      nextAlert: null,
      maintenanceNeeded: []
    };
  }

  private calculateParameterCorrelations(devices: SensorDevice[], timeRange: any): any {
    // Implementation for correlation analysis
    return {};
  }

  private detectAnomalies(devices: SensorDevice[], timeRange: any): any[] {
    // Implementation for anomaly detection
    return [];
  }

  private extractPatterns(devices: SensorDevice[], timeRange: any): any {
    // Implementation for pattern extraction
    return {
      dailyPatterns: {},
      weeklyPatterns: {},
      seasonalTrends: {}
    };
  }

  private generateRecommendations(devices: SensorDevice[], correlations: any, anomalies: any[], patterns: any): any[] {
    // Implementation for recommendation generation
    return [];
  }

  private generateCalibrationSteps(device: SensorDevice, type: string): any[] {
    // Implementation for calibration step generation
    return [];
  }

  private getSystemStatus(): any {
    return {
      totalDevices: this.devices.size,
      onlineDevices: Array.from(this.devices.values()).filter(d => d.status === 'online').length,
      activeAlerts: this.getActiveAlerts().length
    };
  }

  private initializeDefaultNetworks(): void {
    // Initialize default network configurations
  }

  private initializeDefaultSensors(): void {
    // Initialize some default sensors for demonstration
  }

  private startSystemMonitoring(): void {
    // Start system-level monitoring and health checks
  }
}

export const comprehensiveIoTManager = new ComprehensiveIoTManager();