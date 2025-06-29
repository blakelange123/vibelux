// Data Collection Service
// Manages sensor data, API integrations, and data quality

export interface SensorReading {
  sensorId: string;
  timestamp: Date;
  value: number;
  unit: string;
  quality: number; // 0-100 confidence score
  metadata?: Record<string, any>;
}

export interface SensorConfig {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'power' | 'water' | 'nutrients';
  protocol: 'modbus' | 'mqtt' | 'http' | 'bacnet';
  connectionString: string;
  pollingInterval: number; // seconds
  calibration: {
    offset: number;
    scale: number;
    lastCalibrated: Date;
  };
}

export interface APIIntegration {
  id: string;
  name: string;
  type: 'utility' | 'weather' | 'equipment' | 'compliance';
  endpoint: string;
  apiKey?: string;
  headers?: Record<string, string>;
  refreshInterval: number; // minutes
  dataMapping: Record<string, string>;
}

export interface DataQualityMetrics {
  completeness: number;    // % of expected data points received
  accuracy: number;        // % within expected ranges
  timeliness: number;      // % received on time
  consistency: number;     // % passing validation rules
  overall: number;         // weighted average
}

export class DataCollectionService {
  // Collect sensor data
  static async collectSensorData(
    sensor: SensorConfig
  ): Promise<SensorReading | null> {
    try {
      // In production, this would connect to actual sensors
      // Simulate different protocols
      let value: number;
      let quality: number = 100;

      switch (sensor.protocol) {
        case 'modbus':
          value = await this.readModbus(sensor.connectionString);
          break;
        case 'mqtt':
          value = await this.readMQTT(sensor.connectionString);
          break;
        case 'http':
          value = await this.readHTTP(sensor.connectionString);
          break;
        case 'bacnet':
          value = await this.readBACnet(sensor.connectionString);
          break;
        default:
          throw new Error(`Unsupported protocol: ${sensor.protocol}`);
      }

      // Apply calibration
      value = (value * sensor.calibration.scale) + sensor.calibration.offset;

      // Validate reading
      const validation = this.validateReading(value, sensor.type);
      if (!validation.valid) {
        quality = 50; // Reduce quality score for out-of-range values
      }

      return {
        sensorId: sensor.id,
        timestamp: new Date(),
        value,
        unit: this.getUnitForType(sensor.type),
        quality,
        metadata: {
          raw: value / sensor.calibration.scale - sensor.calibration.offset,
          validation: validation.issues
        }
      };
    } catch (error) {
      console.error(`Failed to read sensor ${sensor.id}:`, error);
      return null;
    }
  }

  // Simulate Modbus reading
  private static async readModbus(connection: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 70 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10; // Simulated temperature
  }

  // Simulate MQTT reading
  private static async readMQTT(connection: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20; // Simulated humidity
  }

  // Simulate HTTP API reading
  private static async readHTTP(endpoint: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return 1000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 500; // Simulated CO2
  }

  // Simulate BACnet reading
  private static async readBACnet(connection: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return 40 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20; // Simulated power
  }

  // Validate sensor reading
  static validateReading(
    value: number,
    sensorType: string
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    const ranges: Record<string, [number, number]> = {
      temperature: [50, 100],      // °F
      humidity: [20, 80],          // %
      co2: [400, 2000],           // ppm
      light: [0, 2000],           // μmol/m²/s
      power: [0, 1000],           // kW
      water: [0, 100],            // gal/min
      nutrients: [0, 5000]        // ppm
    };

    const [min, max] = ranges[sensorType] || [0, Infinity];
    
    if (value < min || value > max) {
      issues.push(`Value ${value} outside expected range [${min}, ${max}]`);
    }

    if (isNaN(value)) {
      issues.push('Value is not a number');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Get unit for sensor type
  private static getUnitForType(type: string): string {
    const units: Record<string, string> = {
      temperature: '°F',
      humidity: '%',
      co2: 'ppm',
      light: 'μmol/m²/s',
      power: 'kW',
      water: 'gal/min',
      nutrients: 'ppm'
    };
    return units[type] || '';
  }

  // Fetch data from API integration
  static async fetchAPIData(
    integration: APIIntegration
  ): Promise<Record<string, any> | null> {
    try {
      // In production, this would make actual API calls
      switch (integration.type) {
        case 'utility':
          return this.fetchUtilityData(integration);
        case 'weather':
          return this.fetchWeatherData(integration);
        case 'equipment':
          return this.fetchEquipmentData(integration);
        case 'compliance':
          return this.fetchComplianceData(integration);
        default:
          throw new Error(`Unknown integration type: ${integration.type}`);
      }
    } catch (error) {
      console.error(`Failed to fetch data from ${integration.name}:`, error);
      return null;
    }
  }

  // Simulate utility API data
  private static async fetchUtilityData(integration: APIIntegration): Promise<Record<string, any>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      currentUsage: 45.2,
      currentRate: 0.12,
      todayTotal: 780,
      monthTotal: 18500,
      demandPeak: 62.3,
      timeOfUseSchedule: 'off-peak'
    };
  }

  // Simulate weather API data
  private static async fetchWeatherData(integration: APIIntegration): Promise<Record<string, any>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      temperature: 72,
      humidity: 55,
      solarRadiation: 650,
      windSpeed: 12,
      precipitation: 0,
      forecast: 'partly_cloudy'
    };
  }

  // Simulate equipment API data
  private static async fetchEquipmentData(integration: APIIntegration): Promise<Record<string, any>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      lightsOn: 120,
      totalFixtures: 150,
      averageDimming: 85,
      operatingHours: 4320,
      maintenanceAlerts: 2
    };
  }

  // Simulate compliance API data
  private static async fetchComplianceData(integration: APIIntegration): Promise<Record<string, any>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      activePlants: 1200,
      harvestedThisMonth: 450,
      wasteDisposed: 120,
      complianceScore: 98,
      lastAudit: '2024-11-15'
    };
  }

  // Calculate data quality metrics
  static calculateDataQuality(
    readings: SensorReading[],
    expectedInterval: number, // seconds
    timeWindow: number // hours
  ): DataQualityMetrics {
    const now = Date.now();
    const windowStart = now - (timeWindow * 3600 * 1000);
    const expectedCount = (timeWindow * 3600) / expectedInterval;

    // Filter readings within time window
    const windowReadings = readings.filter(r => r.timestamp.getTime() >= windowStart);

    // Completeness: % of expected data points
    const completeness = Math.min(100, (windowReadings.length / expectedCount) * 100);

    // Accuracy: % with high quality scores
    const accurateReadings = windowReadings.filter(r => r.quality >= 95).length;
    const accuracy = windowReadings.length > 0 
      ? (accurateReadings / windowReadings.length) * 100 
      : 0;

    // Timeliness: % received within expected interval
    let timelyReadings = 0;
    for (let i = 1; i < windowReadings.length; i++) {
      const gap = windowReadings[i].timestamp.getTime() - windowReadings[i-1].timestamp.getTime();
      if (gap <= expectedInterval * 1500) { // 150% of expected interval
        timelyReadings++;
      }
    }
    const timeliness = windowReadings.length > 1 
      ? (timelyReadings / (windowReadings.length - 1)) * 100 
      : 100;

    // Consistency: % without sudden jumps
    let consistentReadings = 0;
    for (let i = 1; i < windowReadings.length; i++) {
      const change = Math.abs(windowReadings[i].value - windowReadings[i-1].value);
      const avgValue = (windowReadings[i].value + windowReadings[i-1].value) / 2;
      const changePercent = (change / avgValue) * 100;
      if (changePercent < 20) { // Less than 20% change
        consistentReadings++;
      }
    }
    const consistency = windowReadings.length > 1 
      ? (consistentReadings / (windowReadings.length - 1)) * 100 
      : 100;

    // Overall score (weighted average)
    const overall = (
      completeness * 0.3 +
      accuracy * 0.3 +
      timeliness * 0.2 +
      consistency * 0.2
    );

    return {
      completeness: Math.round(completeness * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      timeliness: Math.round(timeliness * 10) / 10,
      consistency: Math.round(consistency * 10) / 10,
      overall: Math.round(overall * 10) / 10
    };
  }

  // Aggregate sensor data for analysis
  static aggregateSensorData(
    readings: SensorReading[],
    interval: 'hour' | 'day' | 'week' | 'month'
  ): Array<{
    timestamp: Date;
    average: number;
    min: number;
    max: number;
    count: number;
  }> {
    if (readings.length === 0) return [];

    // Group readings by interval
    const groups = new Map<string, SensorReading[]>();
    
    readings.forEach(reading => {
      const key = this.getIntervalKey(reading.timestamp, interval);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(reading);
    });

    // Calculate aggregates
    const aggregates = Array.from(groups.entries()).map(([key, group]) => {
      const values = group.map(r => r.value);
      const timestamp = new Date(key);
      
      return {
        timestamp,
        average: values.reduce((sum, v) => sum + v, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    });

    return aggregates.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Get interval key for grouping
  private static getIntervalKey(date: Date, interval: string): string {
    const d = new Date(date);
    switch (interval) {
      case 'hour':
        d.setMinutes(0, 0, 0);
        break;
      case 'day':
        d.setHours(0, 0, 0, 0);
        break;
      case 'week':
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        break;
      case 'month':
        d.setHours(0, 0, 0, 0);
        d.setDate(1);
        break;
    }
    return d.toISOString();
  }

  // Detect anomalies in sensor data
  static detectAnomalies(
    readings: SensorReading[],
    sensitivity: number = 2 // standard deviations
  ): SensorReading[] {
    if (readings.length < 10) return []; // Need sufficient data

    const values = readings.map(r => r.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const lowerBound = mean - (sensitivity * stdDev);
    const upperBound = mean + (sensitivity * stdDev);

    return readings.filter(r => r.value < lowerBound || r.value > upperBound);
  }
}