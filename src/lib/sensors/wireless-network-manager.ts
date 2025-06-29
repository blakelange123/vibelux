import { EventEmitter } from 'events';

export interface WirelessSensor {
  id: string;
  macAddress: string;
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'soil' | 'multi';
  name: string;
  location: {
    room: string;
    zone?: string;
    position: { x: number; y: number; z: number };
  };
  status: 'online' | 'offline' | 'low-battery' | 'error';
  battery: number; // 0-100
  signalStrength: number; // -100 to 0 dBm
  firmware: string;
  lastSeen: Date;
  readings: SensorReading[];
  calibration?: {
    offset: number;
    lastCalibrated: Date;
  };
  alerts: SensorAlert[];
}

export interface SensorReading {
  timestamp: Date;
  values: {
    temperature?: number;
    humidity?: number;
    co2?: number;
    light?: number;
    soilMoisture?: number;
    soilEC?: number;
    soilTemp?: number;
    vpd?: number;
  };
  quality: 'good' | 'degraded' | 'poor';
}

export interface SensorAlert {
  id: string;
  type: 'low-battery' | 'offline' | 'out-of-range' | 'calibration';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface WirelessGateway {
  id: string;
  name: string;
  ipAddress: string;
  macAddress: string;
  status: 'online' | 'offline';
  connectedSensors: number;
  maxSensors: number;
  signalCoverage: number; // radius in feet
  firmware: string;
  lastSeen: Date;
}

export interface NetworkTopology {
  gateways: WirelessGateway[];
  sensors: WirelessSensor[];
  meshNetwork: boolean;
  signalMap: SignalMapPoint[];
}

export interface SignalMapPoint {
  x: number;
  y: number;
  signalStrength: number;
  sensorId?: string;
}

export class WirelessNetworkManager extends EventEmitter {
  private sensors: Map<string, WirelessSensor> = new Map();
  private gateways: Map<string, WirelessGateway> = new Map();
  private readingBuffer: Map<string, SensorReading[]> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeMockNetwork();
  }

  // Network Discovery
  public async discoverSensors(): Promise<WirelessSensor[]> {
    // Simulate network discovery
    const discovered: WirelessSensor[] = [
      {
        id: 'WS-001',
        macAddress: 'AA:BB:CC:DD:EE:01',
        type: 'multi',
        name: 'Unassigned Sensor 1',
        location: { room: 'unassigned', position: { x: 0, y: 0, z: 0 } },
        status: 'online',
        battery: 95,
        signalStrength: -45,
        firmware: '2.1.0',
        lastSeen: new Date(),
        readings: [],
        alerts: []
      }
    ];

    this.emit('sensorsDiscovered', discovered);
    return discovered;
  }

  // Sensor Management
  public async addSensor(sensor: WirelessSensor): Promise<void> {
    this.sensors.set(sensor.id, sensor);
    
    // Start monitoring
    if (!this.pollingInterval) {
      this.startPolling();
    }

    this.emit('sensorAdded', sensor);
  }

  public async removeSensor(sensorId: string): Promise<void> {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) throw new Error('Sensor not found');

    this.sensors.delete(sensorId);
    this.readingBuffer.delete(sensorId);
    this.reconnectAttempts.delete(sensorId);

    this.emit('sensorRemoved', sensor);
  }

  public async configureSensor(sensorId: string, config: {
    name?: string;
    location?: WirelessSensor['location'];
    calibration?: WirelessSensor['calibration'];
  }): Promise<void> {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) throw new Error('Sensor not found');

    Object.assign(sensor, config);
    this.emit('sensorUpdated', sensor);
  }

  // Gateway Management
  public async addGateway(gateway: Omit<WirelessGateway, 'id' | 'lastSeen'>): Promise<WirelessGateway> {
    const newGateway: WirelessGateway = {
      ...gateway,
      id: `GW-${Date.now()}`,
      lastSeen: new Date()
    };

    this.gateways.set(newGateway.id, newGateway);
    this.emit('gatewayAdded', newGateway);
    return newGateway;
  }

  public getGateways(): WirelessGateway[] {
    return Array.from(this.gateways.values());
  }

  // Data Collection
  public getLatestReading(sensorId: string): SensorReading | null {
    const sensor = this.sensors.get(sensorId);
    if (!sensor || sensor.readings.length === 0) return null;
    return sensor.readings[sensor.readings.length - 1];
  }

  public getHistoricalReadings(sensorId: string, hours: number = 24): SensorReading[] {
    const buffer = this.readingBuffer.get(sensorId) || [];
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return buffer.filter(reading => reading.timestamp > cutoff);
  }

  // Network Analysis
  public getNetworkTopology(): NetworkTopology {
    const signalMap = this.generateSignalMap();
    
    return {
      gateways: Array.from(this.gateways.values()),
      sensors: Array.from(this.sensors.values()),
      meshNetwork: this.isMeshNetwork(),
      signalMap
    };
  }

  public getNetworkHealth(): {
    totalSensors: number;
    onlineSensors: number;
    lowBatterySensors: number;
    weakSignalSensors: number;
    averageSignalStrength: number;
    gatewayUtilization: number;
  } {
    const sensors = Array.from(this.sensors.values());
    const onlineSensors = sensors.filter(s => s.status === 'online');
    
    return {
      totalSensors: sensors.length,
      onlineSensors: onlineSensors.length,
      lowBatterySensors: sensors.filter(s => s.battery < 20).length,
      weakSignalSensors: sensors.filter(s => s.signalStrength < -80).length,
      averageSignalStrength: onlineSensors.reduce((sum, s) => sum + s.signalStrength, 0) / onlineSensors.length || 0,
      gatewayUtilization: this.calculateGatewayUtilization()
    };
  }

  // Battery Management
  public getSensorsByBatteryLevel(threshold: number = 20): WirelessSensor[] {
    return Array.from(this.sensors.values())
      .filter(sensor => sensor.battery <= threshold)
      .sort((a, b) => a.battery - b.battery);
  }

  public estimateBatteryLife(sensorId: string): number {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return 0;

    // Estimate based on sensor type and polling frequency
    const baseLife = {
      temperature: 365,
      humidity: 365,
      co2: 180,
      light: 270,
      soil: 180,
      multi: 120
    };

    const daysPerPercent = baseLife[sensor.type] / 100;
    return Math.round(sensor.battery * daysPerPercent);
  }

  // Signal Analysis
  public analyzeSignalCoverage(roomId: string): {
    coverage: number; // percentage
    deadZones: { x: number; y: number; radius: number }[];
    recommendations: string[];
  } {
    const roomSensors = Array.from(this.sensors.values())
      .filter(s => s.location.room === roomId);

    if (roomSensors.length === 0) {
      return {
        coverage: 0,
        deadZones: [],
        recommendations: ['Add sensors to this room for monitoring']
      };
    }

    // Simulate coverage analysis
    const avgSignal = roomSensors.reduce((sum, s) => sum + s.signalStrength, 0) / roomSensors.length;
    const coverage = Math.min(100, Math.max(0, (avgSignal + 100) * 2));

    const recommendations: string[] = [];
    if (coverage < 80) {
      recommendations.push('Add a gateway or repeater to improve coverage');
    }
    if (roomSensors.some(s => s.signalStrength < -80)) {
      recommendations.push('Some sensors have weak signals - consider relocating');
    }

    return {
      coverage,
      deadZones: this.identifyDeadZones(roomId),
      recommendations
    };
  }

  // Alert Management
  public acknowledgeAlert(sensorId: string, alertId: string): void {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return;

    const alert = sensor.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit('alertAcknowledged', { sensorId, alertId });
    }
  }

  // Private Methods
  private startPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.pollSensors();
    }, 5000); // Poll every 5 seconds
  }

  private async pollSensors(): Promise<void> {
    for (const sensor of this.sensors.values()) {
      // Simulate sensor readings
      if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.05 || sensor.status === 'offline') {
        const reading = this.generateMockReading(sensor);
        sensor.readings.push(reading);
        
        // Keep only last 100 readings in sensor
        if (sensor.readings.length > 100) {
          sensor.readings.shift();
        }

        // Add to buffer for historical data
        if (!this.readingBuffer.has(sensor.id)) {
          this.readingBuffer.set(sensor.id, []);
        }
        const buffer = this.readingBuffer.get(sensor.id)!;
        buffer.push(reading);

        // Limit buffer size
        const maxBufferSize = 10000;
        if (buffer.length > maxBufferSize) {
          buffer.splice(0, buffer.length - maxBufferSize);
        }

        // Update sensor status
        sensor.lastSeen = new Date();
        if (sensor.status === 'offline') {
          sensor.status = 'online';
          this.emit('sensorReconnected', sensor);
        }

        // Check for alerts
        this.checkSensorAlerts(sensor, reading);

        // Emit reading
        this.emit('sensorReading', { sensor, reading });
      } else {
        // Simulate connection loss
        if (sensor.status === 'online') {
          sensor.status = 'offline';
          this.handleSensorOffline(sensor);
        }
      }

      // Update battery (slow drain)
      sensor.battery = Math.max(0, sensor.battery - 0.001);
    }
  }

  private generateMockReading(sensor: WirelessSensor): SensorReading {
    const values: SensorReading['values'] = {};

    if (sensor.type === 'multi' || sensor.type === 'temperature') {
      values.temperature = 70 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10;
    }
    if (sensor.type === 'multi' || sensor.type === 'humidity') {
      values.humidity = 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20;
    }
    if (sensor.type === 'multi' || sensor.type === 'co2') {
      values.co2 = 400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 600;
    }
    if (sensor.type === 'multi' || sensor.type === 'light') {
      values.light = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000;
    }
    if (sensor.type === 'soil') {
      values.soilMoisture = 40 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40;
      values.soilEC = 1.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1.5;
      values.soilTemp = 65 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10;
    }

    // Calculate VPD if we have temp and humidity
    if (values.temperature && values.humidity) {
      const tempC = (values.temperature - 32) * 5/9;
      const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
      const avp = svp * (values.humidity / 100);
      values.vpd = svp - avp;
    }

    return {
      timestamp: new Date(),
      values,
      quality: sensor.signalStrength > -70 ? 'good' : sensor.signalStrength > -85 ? 'degraded' : 'poor'
    };
  }

  private checkSensorAlerts(sensor: WirelessSensor, reading: SensorReading): void {
    // Low battery alert
    if (sensor.battery < 20 && !sensor.alerts.some(a => a.type === 'low-battery' && !a.acknowledged)) {
      const alert: SensorAlert = {
        id: `ALERT-${Date.now()}`,
        type: 'low-battery',
        severity: sensor.battery < 10 ? 'critical' : 'warning',
        message: `Battery at ${sensor.battery.toFixed(0)}% - replace soon`,
        timestamp: new Date(),
        acknowledged: false
      };
      sensor.alerts.push(alert);
      this.emit('sensorAlert', { sensor, alert });
    }

    // Out of range alerts
    const { values } = reading;
    if (values.temperature && (values.temperature < 60 || values.temperature > 85)) {
      this.createAlert(sensor, 'out-of-range', 'warning', 
        `Temperature ${values.temperature.toFixed(1)}°F out of optimal range`);
    }
  }

  private createAlert(sensor: WirelessSensor, type: SensorAlert['type'], 
    severity: SensorAlert['severity'], message: string): void {
    const alert: SensorAlert = {
      id: `ALERT-${Date.now()}`,
      type,
      severity,
      message,
      timestamp: new Date(),
      acknowledged: false
    };
    sensor.alerts.push(alert);
    this.emit('sensorAlert', { sensor, alert });
  }

  private handleSensorOffline(sensor: WirelessSensor): void {
    const attempts = this.reconnectAttempts.get(sensor.id) || 0;
    this.reconnectAttempts.set(sensor.id, attempts + 1);

    this.createAlert(sensor, 'offline', 
      attempts > 3 ? 'critical' : 'warning',
      `Sensor offline - ${attempts} reconnection attempts`);

    this.emit('sensorOffline', sensor);
  }

  private generateSignalMap(): SignalMapPoint[] {
    const points: SignalMapPoint[] = [];
    
    // Generate grid of signal strength points
    for (let x = 0; x <= 100; x += 10) {
      for (let y = 0; y <= 100; y += 10) {
        // Calculate signal based on distance to sensors
        let maxSignal = -100;
        let closestSensor: string | undefined;
        
        for (const sensor of this.sensors.values()) {
          const distance = Math.sqrt(
            Math.pow(x - sensor.location.position.x, 2) + 
            Math.pow(y - sensor.location.position.y, 2)
          );
          
          // Signal degrades with distance
          const signal = sensor.signalStrength + (distance * 0.5);
          if (signal > maxSignal) {
            maxSignal = signal;
            closestSensor = sensor.id;
          }
        }
        
        points.push({ x, y, signalStrength: maxSignal, sensorId: closestSensor });
      }
    }
    
    return points;
  }

  private identifyDeadZones(roomId: string): { x: number; y: number; radius: number }[] {
    // Simplified dead zone detection
    const deadZones: { x: number; y: number; radius: number }[] = [];
    const signalMap = this.generateSignalMap();
    
    // Find areas with very weak signals
    for (const point of signalMap) {
      if (point.signalStrength < -90) {
        // Check if this is part of an existing dead zone
        const nearbyZone = deadZones.find(zone => 
          Math.sqrt(Math.pow(zone.x - point.x, 2) + Math.pow(zone.y - point.y, 2)) < 20
        );
        
        if (!nearbyZone) {
          deadZones.push({ x: point.x, y: point.y, radius: 10 });
        }
      }
    }
    
    return deadZones;
  }

  private isMeshNetwork(): boolean {
    // Check if sensors can relay data through each other
    return this.sensors.size > 10 && 
           Array.from(this.sensors.values()).some(s => s.signalStrength > -60);
  }

  private calculateGatewayUtilization(): number {
    const totalCapacity = Array.from(this.gateways.values())
      .reduce((sum, gw) => sum + gw.maxSensors, 0);
    
    if (totalCapacity === 0) return 0;
    
    return (this.sensors.size / totalCapacity) * 100;
  }

  private initializeMockNetwork(): void {
    // Add mock gateway
    this.addGateway({
      name: 'Main Gateway',
      ipAddress: '192.168.1.100',
      macAddress: 'GW:01:02:03:04:05',
      status: 'online',
      connectedSensors: 0,
      maxSensors: 50,
      signalCoverage: 100,
      firmware: '3.2.1'
    });

    // Add mock sensors
    const mockSensors: Omit<WirelessSensor, 'id' | 'lastSeen' | 'readings' | 'alerts'>[] = [
      {
        macAddress: 'SE:01:02:03:04:01',
        type: 'multi',
        name: 'Flower Room 1 - Canopy',
        location: { 
          room: 'flower-1', 
          zone: 'canopy',
          position: { x: 25, y: 25, z: 6 }
        },
        status: 'online',
        battery: 87,
        signalStrength: -55,
        firmware: '2.1.0'
      },
      {
        macAddress: 'SE:01:02:03:04:02',
        type: 'soil',
        name: 'Flower Room 1 - Pot 15',
        location: { 
          room: 'flower-1', 
          zone: 'bench-a',
          position: { x: 30, y: 40, z: 3 }
        },
        status: 'online',
        battery: 45,
        signalStrength: -72,
        firmware: '2.1.0'
      },
      {
        macAddress: 'SE:01:02:03:04:03',
        type: 'co2',
        name: 'Veg Room - CO2 Monitor',
        location: { 
          room: 'veg-1', 
          zone: 'center',
          position: { x: 50, y: 50, z: 5 }
        },
        status: 'online',
        battery: 92,
        signalStrength: -48,
        firmware: '2.1.0'
      }
    ];

    mockSensors.forEach((sensorData, index) => {
      const sensor: WirelessSensor = {
        ...sensorData,
        id: `WS-${String(index + 1).padStart(3, '0')}`,
        lastSeen: new Date(),
        readings: [],
        alerts: []
      };
      this.addSensor(sensor);
    });
  }
}