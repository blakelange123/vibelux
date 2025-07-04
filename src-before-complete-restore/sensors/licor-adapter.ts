// LI-COR Sensor Integration Adapter
// Supports LI-190R, LI-200R, LI-210R sensors and LI-1500 data logger

import { EventEmitter } from 'events';

export interface LICORSensorReading {
  timestamp: Date;
  sensorId: string;
  sensorType: 'LI-190R' | 'LI-200R' | 'LI-210R' | 'LI-250A';
  value: number;
  unit: string;
  quality: 'good' | 'warning' | 'error';
  calibrationDate?: Date;
  calibrationConstant?: number;
}

export interface LI190RReading extends LICORSensorReading {
  sensorType: 'LI-190R';
  ppfd: number;           // μmol·m⁻²·s⁻¹
  par: number;            // μmol·m⁻²·s⁻¹ (same as PPFD)
  voltage: number;        // mV
  current: number;        // μA
  unit: 'μmol·m⁻²·s⁻¹';
}

export interface LI200RReading extends LICORSensorReading {
  sensorType: 'LI-200R';
  irradiance: number;     // W·m⁻²
  voltage: number;        // mV
  current: number;        // μA
  unit: 'W·m⁻²';
}

export interface DLICalculation {
  timestamp: Date;
  dli: number;            // mol·m⁻²·d⁻¹
  peakPPFD: number;       // μmol·m⁻²·s⁻¹
  avgPPFD: number;        // μmol·m⁻²·s⁻¹
  photoperiod: number;    // hours
  readings: number;       // number of measurements
}

export class LICORAdapter extends EventEmitter {
  private sensors: Map<string, any> = new Map();
  private calibrationConstants: Map<string, number> = new Map();
  private dataBuffer: Map<string, LICORSensorReading[]> = new Map();
  
  // LI-COR sensor specifications
  private readonly SENSOR_SPECS = {
    'LI-190R': {
      sensitivity: 5.0,    // μA per 1000 μmol·m⁻²·s⁻¹
      loadResistor: 604,   // Ω (standard LI-COR load resistor)
      maxPPFD: 3000,       // μmol·m⁻²·s⁻¹
      spectralRange: { min: 400, max: 700 }, // nm
      calibrationMultiplier: 200.0, // Default calibration constant
      accuracy: 0.05       // ±5%
    },
    'LI-200R': {
      sensitivity: 75.0,   // μA per 1000 W·m⁻²
      loadResistor: 147,   // Ω
      maxIrradiance: 2000, // W·m⁻²
      spectralRange: { min: 400, max: 1100 }, // nm
      calibrationMultiplier: 13.33, // Default calibration constant
      accuracy: 0.05       // ±5%
    },
    'LI-210R': {
      sensitivity: 10.0,   // μA per 100 klux
      loadResistor: 147,   // Ω
      maxLux: 200000,      // lux
      accuracy: 0.03       // ±3%
    }
  };

  constructor() {
    super();
    this.initializeCalibrationConstants();
  }

  private initializeCalibrationConstants(): void {
    // Load stored calibration constants from database
    // These would typically come from your database
    this.calibrationConstants.set('LI-190R-001', 199.8);
    this.calibrationConstants.set('LI-200R-001', 13.41);
  }

  // Convert analog signal to PPFD for LI-190R
  public convertToPPFD(voltage: number, sensorId: string): number {
    const spec = this.SENSOR_SPECS['LI-190R'];
    const calibrationConstant = this.calibrationConstants.get(sensorId) || spec.calibrationMultiplier;
    
    // Convert voltage to current (μA)
    const current = (voltage * 1000) / spec.loadResistor; // mV to V, then V/Ω = A
    
    // Apply calibration constant to get PPFD
    const ppfd = current * calibrationConstant;
    
    return Math.round(ppfd * 10) / 10; // Round to 1 decimal place
  }

  // Calculate Daily Light Integral
  public calculateDLI(readings: LI190RReading[], date: Date = new Date()): DLICalculation {
    if (readings.length === 0) {
      throw new Error('No readings provided for DLI calculation');
    }

    // Sort readings by timestamp
    const sortedReadings = readings.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Calculate DLI using trapezoidal integration
    let totalLight = 0;
    let peakPPFD = 0;
    let sumPPFD = 0;

    for (let i = 1; i < sortedReadings.length; i++) {
      const prev = sortedReadings[i - 1];
      const curr = sortedReadings[i];
      
      // Time interval in seconds
      const intervalSeconds = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 1000;
      
      // Trapezoidal area (average PPFD × time)
      const avgPPFD = (prev.ppfd + curr.ppfd) / 2;
      totalLight += avgPPFD * intervalSeconds;
      
      // Track peak and sum
      peakPPFD = Math.max(peakPPFD, curr.ppfd);
      sumPPFD += curr.ppfd;
    }

    // Convert to mol·m⁻²·d⁻¹
    const dli = totalLight / 1000000; // μmol to mol
    
    // Calculate photoperiod
    const firstReading = sortedReadings[0].timestamp;
    const lastReading = sortedReadings[sortedReadings.length - 1].timestamp;
    const photoperiod = (lastReading.getTime() - firstReading.getTime()) / (1000 * 60 * 60);

    return {
      timestamp: date,
      dli: Math.round(dli * 100) / 100,
      peakPPFD: Math.round(peakPPFD),
      avgPPFD: Math.round(sumPPFD / sortedReadings.length),
      photoperiod: Math.round(photoperiod * 10) / 10,
      readings: sortedReadings.length
    };
  }

  // Connect to LI-1500 Data Logger
  public async connectToDataLogger(host: string, port: number = 80): Promise<void> {
    try {
      // In a real implementation, this would establish HTTP connection
      // to the LI-1500 data logger's web interface
      const response = await fetch(`http://${host}:${port}/api/status`);
      
      if (!response.ok) {
        throw new Error(`Failed to connect to LI-1500: ${response.statusText}`);
      }

      const status = await response.json();
      this.emit('connected', { host, port, status });
      
      // Start polling for data
      this.startDataPolling(host, port);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  private async startDataPolling(host: string, port: number): Promise<void> {
    // Poll every 5 seconds for new data
    setInterval(async () => {
      try {
        const response = await fetch(`http://${host}:${port}/api/readings`);
        const data = await response.json();
        
        // Process each channel
        data.channels.forEach((channel: any) => {
          const reading = this.processChannelData(channel);
          this.bufferReading(reading);
          this.emit('reading', reading);
        });
      } catch (error) {
        this.emit('error', error);
      }
    }, 5000);
  }

  private processChannelData(channel: any): LICORSensorReading {
    const { sensorType, value, voltage, timestamp } = channel;
    
    switch (sensorType) {
      case 'LI-190R':
        return {
          timestamp: new Date(timestamp),
          sensorId: channel.id,
          sensorType: 'LI-190R',
          value: this.convertToPPFD(voltage, channel.id),
          ppfd: this.convertToPPFD(voltage, channel.id),
          par: this.convertToPPFD(voltage, channel.id),
          voltage,
          current: (voltage * 1000) / this.SENSOR_SPECS['LI-190R'].loadResistor,
          unit: 'μmol·m⁻²·s⁻¹',
          quality: this.assessSignalQuality(voltage, 'LI-190R'),
          calibrationDate: new Date(channel.calibrationDate),
          calibrationConstant: this.calibrationConstants.get(channel.id)
        } as LI190RReading;
        
      case 'LI-200R':
        const irradiance = this.convertToIrradiance(voltage, channel.id);
        return {
          timestamp: new Date(timestamp),
          sensorId: channel.id,
          sensorType: 'LI-200R',
          value: irradiance,
          irradiance,
          voltage,
          current: (voltage * 1000) / this.SENSOR_SPECS['LI-200R'].loadResistor,
          unit: 'W·m⁻²',
          quality: this.assessSignalQuality(voltage, 'LI-200R'),
          calibrationDate: new Date(channel.calibrationDate),
          calibrationConstant: this.calibrationConstants.get(channel.id)
        } as LI200RReading;
        
      default:
        throw new Error(`Unsupported sensor type: ${sensorType}`);
    }
  }

  private convertToIrradiance(voltage: number, sensorId: string): number {
    const spec = this.SENSOR_SPECS['LI-200R'];
    const calibrationConstant = this.calibrationConstants.get(sensorId) || spec.calibrationMultiplier;
    
    const current = (voltage * 1000) / spec.loadResistor;
    const irradiance = current * calibrationConstant;
    
    return Math.round(irradiance * 10) / 10;
  }

  private assessSignalQuality(voltage: number, sensorType: string): 'good' | 'warning' | 'error' {
    // Check if voltage is within expected range
    if (voltage < 0.1) return 'error'; // Too low, possibly disconnected
    if (voltage > 4900) return 'error'; // Too high, possibly saturated
    if (voltage < 1 || voltage > 4800) return 'warning'; // Near limits
    return 'good';
  }

  private bufferReading(reading: LICORSensorReading): void {
    const buffer = this.dataBuffer.get(reading.sensorId) || [];
    buffer.push(reading);
    
    // Keep last 24 hours of data
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);
    
    const filtered = buffer.filter(r => r.timestamp > cutoff);
    this.dataBuffer.set(reading.sensorId, filtered);
  }

  // Get buffered readings for DLI calculation
  public getBufferedReadings(sensorId: string): LICORSensorReading[] {
    return this.dataBuffer.get(sensorId) || [];
  }

  // Manual reading from USB/Serial connection
  public async readFromUSB(port: string): Promise<LICORSensorReading> {
    // This would interface with USB/Serial port
    // Implementation depends on the specific hardware interface
    throw new Error('USB reading not implemented yet');
  }

  // Calibrate sensor with known light source
  public calibrateSensor(
    sensorId: string, 
    knownPPFD: number, 
    measuredVoltage: number
  ): number {
    const spec = this.SENSOR_SPECS['LI-190R'];
    const current = (measuredVoltage * 1000) / spec.loadResistor;
    const newConstant = knownPPFD / current;
    
    this.calibrationConstants.set(sensorId, newConstant);
    this.emit('calibrated', { sensorId, constant: newConstant });
    
    return newConstant;
  }

  // Export data in LI-COR format
  public exportData(readings: LICORSensorReading[], format: 'csv' | 'json' = 'csv'): string {
    if (format === 'json') {
      return JSON.stringify(readings, null, 2);
    }
    
    // CSV format matching LI-COR's standard output
    let csv = 'Timestamp,Sensor ID,Type,Value,Unit,Quality,Calibration Constant\n';
    
    readings.forEach(reading => {
      csv += `${reading.timestamp.toISOString()},${reading.sensorId},${reading.sensorType},`;
      csv += `${reading.value},${reading.unit},${reading.quality},`;
      csv += `${reading.calibrationConstant || 'N/A'}\n`;
    });
    
    return csv;
  }
}