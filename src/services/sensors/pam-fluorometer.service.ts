// PAM Fluorometer Service
// Pulse Amplitude Modulation fluorometry for measuring photosynthetic efficiency

export interface PAMReading {
  timestamp: Date;
  fvFm: number; // Maximum quantum yield of PSII
  fvFmPrime: number; // Effective quantum yield of PSII
  etr: number; // Electron transport rate (μmol electrons m⁻² s⁻¹)
  nfq: number; // Non-photochemical quenching
  qp: number; // Photochemical quenching
  temperature: number; // °C
  light: number; // PAR (μmol m⁻² s⁻¹)
  darkAdapted: boolean;
}

export interface PAMCalibration {
  lastCalibrated: Date;
  calibrationFactor: number;
  referenceStandard: string;
  temperature: number;
}

export interface PAMAnalysis {
  stressLevel: 'none' | 'mild' | 'moderate' | 'severe';
  photoinhibition: boolean;
  recommendations: string[];
  efficiency: number; // 0-100%
}

export class PAMFluorometerService {
  private static instance: PAMFluorometerService;
  private calibration: PAMCalibration | null = null;
  private baselineReadings: PAMReading[] = [];

  private constructor() {}

  static getInstance(): PAMFluorometerService {
    if (!PAMFluorometerService.instance) {
      PAMFluorometerService.instance = new PAMFluorometerService();
    }
    return PAMFluorometerService.instance;
  }

  // Connect to PAM device (mock implementation)
  async connectDevice(deviceId: string): Promise<boolean> {
    try {
      // Simulate device connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Connected to PAM device: ${deviceId}`);
      return true;
    } catch (error) {
      console.error('Failed to connect to PAM device:', error);
      return false;
    }
  }

  // Calibrate the PAM fluorometer
  async calibrate(referenceStandard: string = 'Chlorophyll standard'): Promise<PAMCalibration> {
    const calibration: PAMCalibration = {
      lastCalibrated: new Date(),
      calibrationFactor: 1.0 + (Math.random() * 0.1 - 0.05), // ±5% variation
      referenceStandard,
      temperature: 25
    };
    
    this.calibration = calibration;
    return calibration;
  }

  // Take a single PAM measurement
  async takeMeasurement(darkAdapted: boolean = false, lightIntensity: number = 0): Promise<PAMReading> {
    // Simulate measurement delay
    await new Promise(resolve => setTimeout(resolve, darkAdapted ? 3000 : 500));

    // Generate realistic PAM values
    const reading: PAMReading = {
      timestamp: new Date(),
      fvFm: darkAdapted ? 0.78 + Math.random() * 0.05 : 0, // 0.78-0.83 for healthy plants
      fvFmPrime: !darkAdapted ? 0.4 + Math.random() * 0.3 : 0, // 0.4-0.7 under light
      etr: !darkAdapted ? lightIntensity * 0.84 * (0.4 + Math.random() * 0.3) * 0.5 : 0,
      nfq: !darkAdapted ? 0.2 + Math.random() * 0.4 : 0,
      qp: !darkAdapted ? 0.5 + Math.random() * 0.3 : 0,
      temperature: 23 + Math.random() * 3,
      light: lightIntensity,
      darkAdapted
    };

    return reading;
  }

  // Analyze PAM readings for plant stress
  analyzePlantStress(readings: PAMReading[]): PAMAnalysis {
    if (readings.length === 0) {
      return {
        stressLevel: 'none',
        photoinhibition: false,
        recommendations: ['Take baseline measurements'],
        efficiency: 100
      };
    }

    // Get dark-adapted readings
    const darkReadings = readings.filter(r => r.darkAdapted);
    const lightReadings = readings.filter(r => !r.darkAdapted);

    // Calculate average Fv/Fm
    const avgFvFm = darkReadings.length > 0
      ? darkReadings.reduce((sum, r) => sum + r.fvFm, 0) / darkReadings.length
      : 0.8;

    // Determine stress level based on Fv/Fm
    let stressLevel: 'none' | 'mild' | 'moderate' | 'severe';
    let photoinhibition = false;
    const recommendations: string[] = [];

    if (avgFvFm >= 0.78) {
      stressLevel = 'none';
      recommendations.push('Plants are healthy, maintain current conditions');
    } else if (avgFvFm >= 0.75) {
      stressLevel = 'mild';
      recommendations.push('Monitor closely for changes');
      recommendations.push('Check water and nutrient levels');
    } else if (avgFvFm >= 0.70) {
      stressLevel = 'moderate';
      recommendations.push('Reduce light intensity temporarily');
      recommendations.push('Check for nutrient deficiencies');
      recommendations.push('Ensure proper irrigation');
    } else {
      stressLevel = 'severe';
      photoinhibition = true;
      recommendations.push('Immediately reduce light intensity');
      recommendations.push('Check for diseases or pests');
      recommendations.push('Review all environmental parameters');
    }

    // Calculate efficiency percentage
    const efficiency = Math.min(100, (avgFvFm / 0.83) * 100);

    return {
      stressLevel,
      photoinhibition,
      recommendations,
      efficiency
    };
  }

  // Calculate light response curve
  async measureLightResponseCurve(intensities: number[]): Promise<Map<number, PAMReading>> {
    const curve = new Map<number, PAMReading>();

    for (const intensity of intensities) {
      // Wait for acclimation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reading = await this.takeMeasurement(false, intensity);
      curve.set(intensity, reading);
    }

    return curve;
  }

  // Rapid light curves (RLC)
  async performRapidLightCurve(): Promise<PAMReading[]> {
    const intensities = [0, 50, 100, 200, 400, 800, 1200, 1600];
    const readings: PAMReading[] = [];

    for (const intensity of intensities) {
      // Short acclimation period for RLC
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds per step
      
      const reading = await this.takeMeasurement(false, intensity);
      readings.push(reading);
    }

    return readings;
  }

  // Calculate electron transport rate parameters
  calculateETRParameters(readings: PAMReading[]): {
    etrMax: number;
    alpha: number; // Initial slope
    ik: number; // Light saturation point
  } {
    const lightReadings = readings.filter(r => !r.darkAdapted && r.light > 0);
    
    if (lightReadings.length < 3) {
      return { etrMax: 0, alpha: 0, ik: 0 };
    }

    // Find maximum ETR
    const etrMax = Math.max(...lightReadings.map(r => r.etr));

    // Calculate initial slope (alpha) from low light readings
    const lowLightReadings = lightReadings.filter(r => r.light < 200);
    const alpha = lowLightReadings.length > 0
      ? lowLightReadings[0].etr / lowLightReadings[0].light
      : 0;

    // Calculate light saturation point
    const ik = alpha > 0 ? etrMax / alpha : 0;

    return { etrMax, alpha, ik };
  }

  // Export data to CSV format
  exportToCSV(readings: PAMReading[]): string {
    const headers = ['Timestamp', 'Fv/Fm', 'Fv\'/Fm\'', 'ETR', 'NFQ', 'qP', 'Temperature', 'Light', 'Dark Adapted'];
    const rows = readings.map(r => [
      r.timestamp.toISOString(),
      r.fvFm.toFixed(3),
      r.fvFmPrime.toFixed(3),
      r.etr.toFixed(1),
      r.nfq.toFixed(3),
      r.qp.toFixed(3),
      r.temperature.toFixed(1),
      r.light.toFixed(0),
      r.darkAdapted ? 'Yes' : 'No'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

// Export both named and default exports
export const pamFluorometer = PAMFluorometerService.getInstance();
export default pamFluorometer;