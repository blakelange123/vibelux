# LI-COR Sensor Integration Plan for Vibelux

## Executive Summary

This document provides a comprehensive technical implementation plan for integrating LI-COR scientific sensors into the Vibelux platform. LI-COR is renowned for their high-precision environmental monitoring instruments, particularly their quantum (PAR) sensors and solar radiation measurement devices.

## LI-COR Sensor Portfolio

### Primary Sensors for Integration

1. **LI-190R Quantum Sensor**
   - Measures Photosynthetically Active Radiation (PAR)
   - Range: 400-700 nm
   - Output: 5-10 μA per 1,000 μmol s⁻¹ m⁻²
   - Applications: Precise PPFD measurement for grow lights

2. **LI-200R Pyranometer**
   - Measures global solar radiation
   - Range: 400-1100 nm
   - Output: Current signal proportional to solar irradiance
   - Applications: Greenhouse solar DLI tracking

3. **LI-250A Light Meter**
   - Handheld display unit
   - Compatible with all LI-COR sensors
   - Digital readout with data logging capability

4. **LI-1500 Data Logger**
   - Multi-channel data acquisition
   - Supports up to 8 sensors simultaneously
   - USB/Ethernet connectivity

5. **LI-210R Photometric Sensor**
   - Measures illuminance (lux)
   - Photopic response curve
   - Applications: Human-centric lighting metrics

## Technical Integration Architecture

### 1. Hardware Interface Layer

```typescript
// New file: src/lib/hardware/licor-adapter.ts

import { SensorAdapter, SensorReading } from './sensor-adapters';

export interface LICORSensorConfig {
  model: 'LI-190R' | 'LI-200R' | 'LI-210R';
  calibrationConstant: number; // μA per 1000 μmol/m²/s
  cableLength: 2 | 5 | 15 | 50; // meters
  serialNumber?: string;
  lastCalibrationDate?: Date;
}

export class LICORAdapter extends SensorAdapter {
  private config: LICORSensorConfig;
  private analogInput: number; // ADC channel
  private voltageReference: number = 5.0; // V
  private loadResistor: number = 604; // Ohms (standard)
  
  constructor(
    projectId: string,
    roomId: string,
    config: {
      sensorConfig: LICORSensorConfig;
      analogInput: number;
      adcResolution?: number; // bits (default 12)
    }
  ) {
    super(projectId, roomId);
    this.config = config.sensorConfig;
    this.analogInput = config.analogInput;
  }
  
  async readSensor(sensorId: string): Promise<SensorReading> {
    // Read analog voltage from ADC
    const adcValue = await this.readADC(this.analogInput);
    
    // Convert to voltage
    const voltage = (adcValue / 4095) * this.voltageReference; // 12-bit ADC
    
    // Calculate current (μA)
    const current = (voltage / this.loadResistor) * 1000000;
    
    // Convert to measurement units based on sensor type
    let value: number;
    let unit: string;
    let type: SensorReading['type'];
    
    switch (this.config.model) {
      case 'LI-190R':
        // Quantum sensor - convert to PPFD
        value = current / (this.config.calibrationConstant / 1000);
        unit = 'μmol/m²/s';
        type = 'ppfd';
        break;
        
      case 'LI-200R':
        // Pyranometer - convert to W/m²
        value = current * 0.2; // Typical conversion factor
        unit = 'W/m²';
        type = 'solar_radiation';
        break;
        
      case 'LI-210R':
        // Photometric - convert to lux
        value = current * 100; // Typical conversion factor
        unit = 'lux';
        type = 'illuminance';
        break;
    }
    
    return {
      sensorId,
      type,
      value,
      unit,
      timestamp: new Date(),
      quality: this.assessSignalQuality(current),
      metadata: {
        rawCurrent: current,
        model: this.config.model,
        serialNumber: this.config.serialNumber
      }
    };
  }
  
  private assessSignalQuality(current: number): number {
    // LI-COR sensors have excellent linearity
    // Quality based on signal strength
    if (current < 0.1) return 50; // Very low signal
    if (current < 1) return 75; // Low signal
    if (current > 100) return 95; // Possible saturation
    return 100; // Optimal range
  }
}
```

### 2. Enhanced Sensor Interface Definitions

```typescript
// Update src/lib/sensor-interfaces.ts

export enum SensorType {
  // ... existing types ...
  QUANTUM_PAR = 'quantum_par',
  SOLAR_RADIATION = 'solar_radiation',
  ILLUMINANCE = 'illuminance',
}

export interface LICORReading extends SensorReading {
  value: number;
  unit: 'μmol/m²/s' | 'W/m²' | 'lux';
  quality: number;
  metadata: {
    rawCurrent: number;
    model: string;
    serialNumber?: string;
    calibrationDate?: Date;
    cosineCorrection?: boolean;
  };
}

export interface LICORDevice extends SensorDevice {
  manufacturer: 'LI-COR';
  model: 'LI-190R' | 'LI-200R' | 'LI-210R' | 'LI-250A' | 'LI-1500';
  calibrationConstant?: number;
  spectralResponse?: {
    min: number; // nm
    max: number; // nm
    peak?: number; // nm
  };
}
```

### 3. LI-COR Data Logger Integration

```typescript
// New file: src/lib/hardware/licor-datalogger.ts

export class LI1500DataLogger {
  private ipAddress: string;
  private port: number = 80;
  private channels: Map<number, LICORSensorConfig>;
  
  constructor(ipAddress: string) {
    this.ipAddress = ipAddress;
    this.channels = new Map();
  }
  
  async connect(): Promise<boolean> {
    try {
      // Establish HTTP connection to LI-1500
      const response = await fetch(`http://${this.ipAddress}/status`);
      return response.ok;
    } catch (error) {
      console.error('Failed to connect to LI-1500:', error);
      return false;
    }
  }
  
  async readAllChannels(): Promise<Map<number, number>> {
    const readings = new Map<number, number>();
    
    try {
      // LI-1500 provides JSON API for current readings
      const response = await fetch(`http://${this.ipAddress}/data/current`);
      const data = await response.json();
      
      // Parse channel data
      data.channels.forEach((channel: any, index: number) => {
        if (channel.enabled) {
          readings.set(index, channel.value);
        }
      });
    } catch (error) {
      console.error('Failed to read LI-1500 data:', error);
    }
    
    return readings;
  }
  
  async downloadHistoricalData(
    startDate: Date,
    endDate: Date,
    interval: 'raw' | '1min' | '5min' | '15min' | '1hour'
  ): Promise<any[]> {
    // Download historical data from LI-1500 memory
    const params = new URLSearchParams({
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      interval
    });
    
    const response = await fetch(
      `http://${this.ipAddress}/data/historical?${params}`
    );
    
    return response.json();
  }
}
```

### 4. Advanced PAR Calculations

```typescript
// New file: src/lib/calculations/licor-par-analysis.ts

export class LICORPARAnalysis {
  /**
   * Calculate Daily Light Integral from continuous PAR measurements
   */
  static calculateDLI(readings: Array<{ timestamp: Date; ppfd: number }>): number {
    if (readings.length < 2) return 0;
    
    // Sort by timestamp
    readings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    let totalLight = 0;
    
    // Integrate using trapezoidal rule
    for (let i = 1; i < readings.length; i++) {
      const dt = (readings[i].timestamp.getTime() - readings[i-1].timestamp.getTime()) / 1000; // seconds
      const avgPPFD = (readings[i].ppfd + readings[i-1].ppfd) / 2;
      totalLight += avgPPFD * dt;
    }
    
    // Convert to mol/m²/day
    return totalLight / 1000000;
  }
  
  /**
   * Calculate photoperiod metrics
   */
  static analyzePhotoperiod(
    readings: Array<{ timestamp: Date; ppfd: number }>,
    threshold: number = 10 // μmol/m²/s
  ): {
    photoperiodHours: number;
    sunriseTime?: Date;
    sunsetTime?: Date;
    peakPPFD: number;
    peakTime?: Date;
  } {
    let lightOn = false;
    let sunriseTime: Date | undefined;
    let sunsetTime: Date | undefined;
    let peakPPFD = 0;
    let peakTime: Date | undefined;
    let totalLightMinutes = 0;
    
    for (let i = 0; i < readings.length; i++) {
      const reading = readings[i];
      
      // Track peak
      if (reading.ppfd > peakPPFD) {
        peakPPFD = reading.ppfd;
        peakTime = reading.timestamp;
      }
      
      // Detect light transitions
      if (!lightOn && reading.ppfd >= threshold) {
        lightOn = true;
        if (!sunriseTime) sunriseTime = reading.timestamp;
      } else if (lightOn && reading.ppfd < threshold) {
        lightOn = false;
        sunsetTime = reading.timestamp;
      }
      
      // Count light minutes
      if (lightOn && i > 0) {
        const dt = (reading.timestamp.getTime() - readings[i-1].timestamp.getTime()) / 60000;
        totalLightMinutes += dt;
      }
    }
    
    return {
      photoperiodHours: totalLightMinutes / 60,
      sunriseTime,
      sunsetTime,
      peakPPFD,
      peakTime
    };
  }
  
  /**
   * Compare artificial light to natural sunlight
   */
  static compareToDaylight(
    artificialPAR: number,
    solarRadiation: number // from LI-200R
  ): {
    parEfficiency: number; // μmol/J
    equivalentSunlight: number; // percentage
  } {
    // Typical sunlight has ~2.0-2.3 μmol/J PAR efficiency
    const sunlightPAREfficiency = 2.15;
    const sunlightPAR = solarRadiation * sunlightPAREfficiency;
    
    // Calculate artificial light PAR efficiency
    // This requires power consumption data
    const parEfficiency = artificialPAR / solarRadiation; // Simplified
    
    return {
      parEfficiency,
      equivalentSunlight: (artificialPAR / sunlightPAR) * 100
    };
  }
}
```

### 5. React Component for LI-COR Sensors

```typescript
// New file: src/components/sensors/LICORSensorPanel.tsx

'use client'

import { useState, useEffect } from 'react';
import { Sun, Activity, TrendingUp, Zap } from 'lucide-react';
import { LICORPARAnalysis } from '@/lib/calculations/licor-par-analysis';

interface LICORSensorPanelProps {
  projectId: string;
  roomId: string;
}

export default function LICORSensorPanel({ projectId, roomId }: LICORSensorPanelProps) {
  const [sensors, setSensors] = useState<any[]>([]);
  const [currentReadings, setCurrentReadings] = useState<Map<string, any>>(new Map());
  const [dliData, setDliData] = useState<Map<string, number>>(new Map());
  const [photoperiodData, setPhotoperiodData] = useState<Map<string, any>>(new Map());
  
  // Real-time DLI calculation
  useEffect(() => {
    const calculateDLI = () => {
      sensors.forEach(sensor => {
        if (sensor.model === 'LI-190R') {
          // Get today's readings
          const readings = getStoredReadings(sensor.id, 'today');
          const dli = LICORPARAnalysis.calculateDLI(readings);
          setDliData(prev => new Map(prev).set(sensor.id, dli));
          
          // Calculate photoperiod
          const photoperiod = LICORPARAnalysis.analyzePhotoperiod(readings);
          setPhotoperiodData(prev => new Map(prev).set(sensor.id, photoperiod));
        }
      });
    };
    
    const interval = setInterval(calculateDLI, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [sensors]);
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-400" />
          LI-COR Environmental Sensors
        </h3>
        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">
          Add LI-COR Sensor
        </button>
      </div>
      
      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map(sensor => {
          const reading = currentReadings.get(sensor.id);
          const dli = dliData.get(sensor.id) || 0;
          const photoperiod = photoperiodData.get(sensor.id);
          
          return (
            <div key={sensor.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-white">{sensor.name}</h4>
                  <p className="text-xs text-gray-400">{sensor.model}</p>
                </div>
                <div className={`p-2 rounded-lg ${
                  sensor.model === 'LI-190R' ? 'bg-green-600/20 text-green-400' :
                  sensor.model === 'LI-200R' ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-blue-600/20 text-blue-400'
                }`}>
                  {sensor.model === 'LI-190R' ? <Activity className="w-4 h-4" /> :
                   sensor.model === 'LI-200R' ? <Sun className="w-4 h-4" /> :
                   <Zap className="w-4 h-4" />}
                </div>
              </div>
              
              {/* Current Reading */}
              <div className="text-center py-2">
                <div className="text-2xl font-bold">
                  {reading?.value.toFixed(1) || '--'}
                </div>
                <div className="text-xs text-gray-400">{reading?.unit}</div>
              </div>
              
              {/* Additional Metrics for PAR Sensor */}
              {sensor.model === 'LI-190R' && (
                <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Today's DLI</span>
                    <span className="font-medium text-green-400">
                      {dli.toFixed(1)} mol/m²/day
                    </span>
                  </div>
                  {photoperiod && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Photoperiod</span>
                        <span className="font-medium">
                          {photoperiod.photoperiodHours.toFixed(1)}h
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Peak PPFD</span>
                        <span className="font-medium">
                          {photoperiod.peakPPFD.toFixed(0)} μmol/m²/s
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Signal Quality Indicator */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-400">Signal Quality</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    reading?.quality > 90 ? 'bg-green-400' :
                    reading?.quality > 70 ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`} />
                  <span>{reading?.quality || 0}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Calibration Reminder */}
      <div className="mt-6 bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-medium text-yellow-400 mb-1">Calibration Status</h4>
            <p className="text-gray-300">
              LI-COR sensors should be recalibrated every 2 years for optimal accuracy.
              Factory calibration is traceable to NIST standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get stored readings
function getStoredReadings(sensorId: string, period: 'today' | 'week' | 'month'): any[] {
  // This would fetch from your time-series database
  return [];
}
```

### 6. Integration with Existing Vibelux Features

#### A. Enhanced PPFD Calculations

```typescript
// Update src/lib/ppfd-calculations.ts

import { LICORAdapter } from './hardware/licor-adapter';

export class EnhancedPPFDCalculations {
  /**
   * Combine LI-COR quantum sensor data with fixture calculations
   */
  static validateCalculatedPPFD(
    calculatedPPFD: number,
    measuredPPFD: number,
    tolerance: number = 0.15 // 15% tolerance
  ): {
    isValid: boolean;
    deviation: number;
    recommendation?: string;
  } {
    const deviation = Math.abs(calculatedPPFD - measuredPPFD) / measuredPPFD;
    
    return {
      isValid: deviation <= tolerance,
      deviation: deviation * 100,
      recommendation: deviation > tolerance 
        ? `Adjust fixture height or output. Calculated: ${calculatedPPFD.toFixed(0)}, Measured: ${measuredPPFD.toFixed(0)}`
        : undefined
    };
  }
  
  /**
   * Auto-calibrate fixture output based on LI-COR measurements
   */
  static calibrateFixtureOutput(
    fixtureId: string,
    targetPPFD: number,
    currentMeasuredPPFD: number,
    currentDimLevel: number
  ): {
    recommendedDimLevel: number;
    confidenceLevel: number;
  } {
    // Linear approximation (assumes linear dimming response)
    const scaleFactor = targetPPFD / currentMeasuredPPFD;
    const recommendedDimLevel = Math.min(100, currentDimLevel * scaleFactor);
    
    // Confidence based on how close we are to linear range
    const confidenceLevel = recommendedDimLevel <= 90 ? 0.95 : 0.80;
    
    return {
      recommendedDimLevel: Math.round(recommendedDimLevel),
      confidenceLevel
    };
  }
}
```

#### B. Solar DLI Integration for Greenhouses

```typescript
// Update src/components/designer/panels/SolarDLIPanel.tsx

import { LI200RData } from '@/lib/hardware/licor-adapter';

export function EnhancedSolarDLIPanel({ roomId }: { roomId: string }) {
  const [solarData, setSolarData] = useState<any>(null);
  const [supplementalNeeded, setSupplementalNeeded] = useState(0);
  
  useEffect(() => {
    // Subscribe to LI-200R pyranometer data
    const unsubscribe = subscribeLICORSensor('LI-200R', (reading) => {
      // Convert solar radiation to PAR
      const solarPAR = reading.value * 2.15; // μmol/J conversion
      
      // Calculate cumulative DLI
      updateSolarDLI(solarPAR);
      
      // Calculate supplemental lighting needs
      const targetDLI = 30; // mol/m²/day for tomatoes
      const currentDLI = calculateCurrentDLI();
      const hoursRemaining = calculateHoursToSunset();
      
      if (currentDLI < targetDLI && hoursRemaining < 4) {
        const supplementalPPFD = ((targetDLI - currentDLI) * 1000000) / (hoursRemaining * 3600);
        setSupplementalNeeded(supplementalPPFD);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  return (
    <div className="p-4 bg-gray-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Solar DLI Tracking</h3>
      
      {solarData && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-400">Current Solar PAR</label>
              <div className="text-xl font-bold">{solarData.currentPAR.toFixed(0)} μmol/m²/s</div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Today's Solar DLI</label>
              <div className="text-xl font-bold">{solarData.dli.toFixed(1)} mol/m²</div>
            </div>
          </div>
          
          {supplementalNeeded > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded p-3">
              <p className="text-sm text-yellow-400">
                Supplemental lighting needed: {supplementalNeeded.toFixed(0)} μmol/m²/s
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

### 7. Data Storage and Analytics

```typescript
// Update src/lib/timeseries/influxdb-client.ts

export async function recordLICORReading(
  sensorId: string,
  model: string,
  value: number,
  unit: string,
  metadata: any
) {
  const point = new Point('licor_sensor')
    .tag('sensor_id', sensorId)
    .tag('model', model)
    .tag('unit', unit)
    .floatField('value', value)
    .floatField('signal_quality', metadata.quality || 100)
    .timestamp(new Date());
    
  // Add model-specific fields
  if (model === 'LI-190R') {
    point.tag('measurement_type', 'par');
  } else if (model === 'LI-200R') {
    point.tag('measurement_type', 'solar_radiation');
  }
  
  await writeApi.writePoint(point);
}

// Query functions for LI-COR data
export async function queryLICORDailyStats(
  sensorId: string,
  date: Date
): Promise<{
  min: number;
  max: number;
  avg: number;
  dli?: number;
}> {
  const query = `
    from(bucket: "${bucket}")
      |> range(start: ${date.toISOString()}, stop: ${addDays(date, 1).toISOString()})
      |> filter(fn: (r) => r["_measurement"] == "licor_sensor")
      |> filter(fn: (r) => r["sensor_id"] == "${sensorId}")
      |> filter(fn: (r) => r["_field"] == "value")
  `;
  
  // Execute query and calculate statistics
  const result = await queryApi.collectRows(query);
  
  // Calculate DLI for PAR sensors
  if (result.some(r => r.measurement_type === 'par')) {
    const dli = calculateDLIFromTimeSeries(result);
    return { ...stats, dli };
  }
  
  return stats;
}
```

### 8. Automated Alerts and Monitoring

```typescript
// New file: src/lib/monitoring/licor-alerts.ts

export class LICORAlertSystem {
  static checkSensorHealth(reading: LICORReading): Alert[] {
    const alerts: Alert[] = [];
    
    // Check signal quality
    if (reading.quality < 70) {
      alerts.push({
        severity: 'warning',
        message: `Low signal quality (${reading.quality}%) on ${reading.metadata.model}`,
        action: 'Check sensor lens for contamination or obstruction'
      });
    }
    
    // Check for sensor saturation (LI-190R specific)
    if (reading.metadata.model === 'LI-190R' && reading.value > 2500) {
      alerts.push({
        severity: 'warning',
        message: 'Quantum sensor approaching saturation',
        action: 'Consider using neutral density filter for extreme light levels'
      });
    }
    
    // Check calibration date
    if (reading.metadata.calibrationDate) {
      const daysSinceCalibration = differenceInDays(new Date(), reading.metadata.calibrationDate);
      if (daysSinceCalibration > 730) { // 2 years
        alerts.push({
          severity: 'info',
          message: 'Sensor calibration recommended',
          action: 'Schedule factory recalibration for optimal accuracy'
        });
      }
    }
    
    return alerts;
  }
  
  static generateDLIAlert(
    currentDLI: number,
    targetDLI: number,
    hoursRemaining: number
  ): Alert | null {
    const projectedDLI = currentDLI + (currentDLI / (24 - hoursRemaining)) * hoursRemaining;
    
    if (projectedDLI < targetDLI * 0.9) {
      return {
        severity: 'warning',
        message: `Projected DLI (${projectedDLI.toFixed(1)}) below target (${targetDLI})`,
        action: 'Consider increasing supplemental lighting'
      };
    }
    
    return null;
  }
}
```

## Implementation Roadmap

### Phase 1: Core Integration (Week 1-2)
1. Implement LICORAdapter class for analog signal processing
2. Create sensor configuration UI for LI-COR devices
3. Set up real-time data acquisition pipeline
4. Test with LI-190R quantum sensor

### Phase 2: Advanced Features (Week 3-4)
1. Implement LI-1500 data logger integration
2. Add DLI calculations and photoperiod analysis
3. Create comparison tools for natural vs artificial light
4. Develop calibration tracking system

### Phase 3: Analytics & Automation (Week 5-6)
1. Build historical data analysis tools
2. Implement automated supplemental lighting control
3. Create sensor health monitoring system
4. Develop calibration reminder system

### Phase 4: Optimization (Week 7-8)
1. Fine-tune PAR efficiency calculations
2. Implement machine learning for DLI prediction
3. Create advanced reporting features
4. Optimize data storage and retrieval

## Hardware Requirements

### Minimum Setup
- Raspberry Pi 4 or equivalent with GPIO
- ADC module (12-bit or higher resolution)
- 604Ω precision resistor for current-to-voltage conversion
- Shielded cable for sensor connection

### Recommended Setup
- LI-1500 Data Logger for multi-sensor deployment
- Industrial PC with Ethernet connectivity
- UPS for continuous monitoring
- Weatherproof enclosures for greenhouse deployment

## Benefits of LI-COR Integration

1. **Scientific Accuracy**: NIST-traceable calibration ensures research-grade measurements
2. **Reliability**: Proven sensors with decades of field deployment
3. **Versatility**: Single platform for PAR, solar radiation, and illuminance
4. **Integration**: Seamless data flow into Vibelux analytics
5. **Validation**: Real measurements to validate calculated values

## Conclusion

Integrating LI-COR sensors into Vibelux will provide users with research-grade environmental monitoring capabilities. The combination of calculated predictions and measured validation creates a powerful platform for optimizing plant growth conditions.

The modular architecture allows for easy expansion to additional LI-COR sensors (CO2, leaf temperature, etc.) as needed, making Vibelux a comprehensive solution for both commercial growers and research facilities.