import { EventEmitter } from 'events';

// PAM Fluorometer Service for Chlorophyll Fluorescence measurements
export interface PAMReading {
  f0: number;      // Initial fluorescence
  fm: number;      // Maximum fluorescence
  fv: number;      // Variable fluorescence (Fm - F0)
  fvFm: number;    // Maximum quantum efficiency (Fv/Fm)
  fvF0: number;    // Fv/F0 ratio
  fmF0: number;    // Fm/F0 ratio
  phi2: number;    // Effective quantum yield of PSII
  qP: number;      // Photochemical quenching
  qN: number;      // Non-photochemical quenching
  npq: number;     // Non-photochemical quenching coefficient
  etr: number;     // Electron transport rate
  rfd: number;     // Fluorescence decrease ratio
  timestamp: Date;
  metadata?: {
    lightIntensity?: number;
    temperature?: number;
    leafPosition?: string;
    plantId?: string;
  };
}

export interface PAMProtocol {
  name: string;
  darkAdaptationTime: number; // minutes
  saturatingPulseIntensity: number; // μmol/m²/s
  saturatingPulseDuration: number; // seconds
  actinicLightIntensity: number; // μmol/m²/s
  measurementInterval: number; // seconds
  totalMeasurementTime: number; // seconds
}

export class PAMFluorometerService extends EventEmitter {
  private isConnected: boolean = false;
  private currentProtocol: PAMProtocol | null = null;
  private measurementInterval: NodeJS.Timeout | null = null;
  private mockMode: boolean = true; // Start in mock mode, can be disabled when real device connected

  // Supported PAM devices
  private supportedDevices = {
    'WALZ_PAM2500': {
      name: 'Walz PAM-2500',
      connectionType: 'USB',
      baudRate: 115200,
      commands: {
        init: 'INIT\r\n',
        measure: 'MEAS\r\n',
        darkAdapt: 'DARK\r\n',
        saturatingPulse: 'SAT\r\n',
        actinicLight: 'AL'
      }
    },
    'HANSATECH_FMS2': {
      name: 'Hansatech FMS2',
      connectionType: 'USB',
      baudRate: 9600,
      commands: {
        init: '#INIT',
        measure: '#MEAS',
        darkAdapt: '#DARK',
        saturatingPulse: '#PULSE',
        actinicLight: '#LIGHT'
      }
    },
    'MOCK_DEVICE': {
      name: 'Mock PAM Device',
      connectionType: 'MOCK',
      baudRate: 0,
      commands: {}
    }
  };

  // Protocol presets
  static protocols: Record<string, PAMProtocol> = {
    'Standard PAM': {
      name: 'Standard PAM',
      darkAdaptationTime: 30,
      saturatingPulseIntensity: 8000,
      saturatingPulseDuration: 0.8,
      actinicLightIntensity: 200,
      measurementInterval: 30,
      totalMeasurementTime: 600
    },
    'Stress Detection': {
      name: 'Stress Detection',
      darkAdaptationTime: 45,
      saturatingPulseIntensity: 10000,
      saturatingPulseDuration: 1.0,
      actinicLightIntensity: 500,
      measurementInterval: 15,
      totalMeasurementTime: 300
    },
    'Light Curve': {
      name: 'Light Curve',
      darkAdaptationTime: 20,
      saturatingPulseIntensity: 8000,
      saturatingPulseDuration: 0.8,
      actinicLightIntensity: 50,
      measurementInterval: 60,
      totalMeasurementTime: 1200
    },
    'Rapid Light Curve': {
      name: 'Rapid Light Curve',
      darkAdaptationTime: 10,
      saturatingPulseIntensity: 8000,
      saturatingPulseDuration: 0.6,
      actinicLightIntensity: 0,
      measurementInterval: 10,
      totalMeasurementTime: 180
    }
  };

  constructor() {
    super();
  }

  // Connect to PAM device
  async connect(deviceType: keyof typeof this.supportedDevices = 'MOCK_DEVICE'): Promise<boolean> {
    try {
      const device = this.supportedDevices[deviceType];
      
      if (deviceType === 'MOCK_DEVICE') {
        this.mockMode = true;
        this.isConnected = true;
        this.emit('connected', { device: device.name });
        return true;
      }

      // In production, this would use WebUSB API or serial port connection
      // For now, we'll simulate connection
      this.mockMode = false;
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isConnected = true;
      this.emit('connected', { device: device.name });
      
      return true;
    } catch (error) {
      this.emit('error', { message: 'Failed to connect to PAM device', error });
      return false;
    }
  }

  // Disconnect from device
  disconnect(): void {
    if (this.measurementInterval) {
      clearInterval(this.measurementInterval);
    }
    this.isConnected = false;
    this.emit('disconnected');
  }

  // Start measurement with selected protocol
  async startMeasurement(protocol: PAMProtocol, metadata?: PAMReading['metadata']): Promise<void> {
    if (!this.isConnected) {
      throw new Error('PAM device not connected');
    }

    this.currentProtocol = protocol;
    this.emit('measurementStarted', { protocol });

    // Dark adaptation period
    if (protocol.darkAdaptationTime > 0) {
      this.emit('darkAdaptation', { duration: protocol.darkAdaptationTime });
      // In real implementation, would wait for dark adaptation
    }

    let elapsedTime = 0;
    
    this.measurementInterval = setInterval(async () => {
      if (elapsedTime >= protocol.totalMeasurementTime) {
        this.stopMeasurement();
        return;
      }

      try {
        const reading = await this.takeMeasurement(protocol.actinicLightIntensity, metadata);
        this.emit('reading', reading);
        elapsedTime += protocol.measurementInterval;
      } catch (error) {
        this.emit('error', { message: 'Measurement error', error });
      }
    }, protocol.measurementInterval * 1000);
  }

  // Stop current measurement
  stopMeasurement(): void {
    if (this.measurementInterval) {
      clearInterval(this.measurementInterval);
      this.measurementInterval = null;
    }
    this.emit('measurementStopped');
  }

  // Take single measurement
  async takeMeasurement(lightIntensity: number = 200, metadata?: PAMReading['metadata']): Promise<PAMReading> {
    if (!this.isConnected) {
      throw new Error('PAM device not connected');
    }

    if (this.mockMode) {
      return this.generateMockReading(lightIntensity, metadata);
    }

    // In production, this would communicate with actual device
    // For now, return mock data
    return this.generateMockReading(lightIntensity, metadata);
  }

  // Generate light response curve
  async generateLightCurve(lightLevels: number[] = [0, 25, 50, 100, 200, 400, 600, 800, 1000, 1200, 1500]): Promise<PAMReading[]> {
    if (!this.isConnected) {
      throw new Error('PAM device not connected');
    }

    const readings: PAMReading[] = [];
    
    for (const ppfd of lightLevels) {
      this.emit('lightCurveProgress', { current: ppfd, total: lightLevels.length });
      
      // Wait for light adjustment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reading = await this.takeMeasurement(ppfd);
      readings.push(reading);
    }

    this.emit('lightCurveComplete', { readings });
    return readings;
  }

  // Calibrate device (mock implementation)
  async calibrate(): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('PAM device not connected');
    }

    this.emit('calibrationStarted');
    
    // Simulate calibration process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    this.emit('calibrationComplete');
    return true;
  }

  // Generate mock reading (for development/testing)
  private generateMockReading(lightIntensity: number, metadata?: PAMReading['metadata']): PAMReading {
    // Simulate realistic fluorescence values
    const baseF0 = 300 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100;
    const maxFm = 1400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 - (lightIntensity * 0.2);
    const f0 = baseF0 + (lightIntensity * 0.1);
    const fm = Math.max(f0 + 200, maxFm);
    const fv = fm - f0;
    const fvFm = fv / fm;
    const fvF0 = fv / f0;
    const fmF0 = fm / f0;
    
    // Calculate light-dependent parameters
    const lightFactor = Math.min(1, lightIntensity / 500);
    const phi2 = Math.max(0.1, fvFm * (1 - lightFactor * 0.3) + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.1);
    const qP = Math.max(0.1, 0.8 - lightFactor * 0.3 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.1);
    const npq = Math.max(0, lightFactor * 2 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.5);
    const qN = Math.max(0, 1 - qP);
    const etr = phi2 * lightIntensity * 0.84 * 0.5; // Assuming 84% absorption, 50% to PSII
    const rfd = Math.max(0, (fm - f0) / f0);

    return {
      f0,
      fm,
      fv,
      fvFm,
      fvF0,
      fmF0,
      phi2,
      qP,
      qN,
      npq,
      etr,
      rfd,
      timestamp: new Date(),
      metadata: {
        lightIntensity,
        temperature: 22 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
        ...metadata
      }
    };
  }

  // Get device status
  getStatus(): {
    connected: boolean;
    device: string | null;
    protocol: PAMProtocol | null;
    measuring: boolean;
  } {
    return {
      connected: this.isConnected,
      device: this.isConnected ? 'Mock PAM Device' : null,
      protocol: this.currentProtocol,
      measuring: this.measurementInterval !== null
    };
  }

  // Export data to standard format
  exportData(readings: PAMReading[], format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(readings, null, 2);
    }
    
    // CSV format
    const headers = ['timestamp', 'f0', 'fm', 'fv', 'fvFm', 'phi2', 'npq', 'etr', 'lightIntensity', 'temperature'];
    const rows = readings.map(r => [
      r.timestamp.toISOString(),
      r.f0,
      r.fm,
      r.fv,
      r.fvFm,
      r.phi2,
      r.npq,
      r.etr,
      r.metadata?.lightIntensity || '',
      r.metadata?.temperature || ''
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

// Singleton instance
export const pamFluorometer = new PAMFluorometerService();