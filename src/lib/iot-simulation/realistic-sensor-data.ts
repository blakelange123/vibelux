import { prisma } from '@/lib/prisma';
import { addMinutes, subDays, startOfDay, format } from 'date-fns';

interface SensorConfig {
  facilityId: string;
  facilityType: 'greenhouse' | 'indoor_farm' | 'processing' | 'warehouse';
  squareFootage: number;
  location: {
    latitude: number;
    longitude: number;
    climateZone: string;
  };
  equipment: {
    lighting: { watts: number; efficiency: number; count: number };
    hvac: { tons: number; efficiency: number; type: string };
    pumps: { hp: number; count: number };
    fans: { watts: number; count: number };
    controllers: { watts: number; count: number };
  };
  baseline: {
    dailyKwh: number;
    peakKw: number;
    loadProfile: 'constant' | 'variable' | 'seasonal';
  };
}

interface WeatherData {
  temperature: number;
  humidity: number;
  solarRadiation: number;
  windSpeed: number;
  cloudCover: number;
}

interface OptimizationAction {
  timestamp: Date;
  type: 'lighting_dimming' | 'hvac_scheduling' | 'pump_control' | 'fan_optimization';
  description: string;
  expectedSavings: number;
  actualSavings?: number;
}

export class RealisticIoTDataGenerator {
  private weatherCache: Map<string, WeatherData[]> = new Map();
  private optimizationSchedule: Map<string, OptimizationAction[]> = new Map();

  /**
   * Generate realistic IoT data for facility over time period
   */
  async generateFacilityData(
    config: SensorConfig,
    startDate: Date,
    endDate: Date,
    optimization: boolean = true
  ): Promise<void> {

    // Get weather data for the period
    const weatherData = await this.getWeatherData(config.location, startDate, endDate);
    
    // Generate optimization schedule if enabled
    if (optimization) {
      await this.generateOptimizationSchedule(config, startDate, endDate);
    }

    // Generate readings every 15 minutes
    const interval = 15; // minutes
    let currentTime = new Date(startDate);
    let readingCount = 0;

    while (currentTime <= endDate) {
      try {
        const reading = await this.generateReading(config, currentTime, weatherData, optimization);
        await this.storeReading(reading);
        
        readingCount++;
        
        // Progress logging
        if (readingCount % 1000 === 0) {
        }
        
      } catch (error) {
        console.error(`Failed to generate reading at ${currentTime}:`, error);
      }
      
      currentTime = addMinutes(currentTime, interval);
    }

  }

  /**
   * Generate single realistic reading
   */
  private async generateReading(
    config: SensorConfig,
    timestamp: Date,
    weatherData: WeatherData[],
    optimization: boolean
  ): Promise<any> {
    const hour = timestamp.getHours();
    const dayOfYear = this.getDayOfYear(timestamp);
    const weather = this.getWeatherForTimestamp(weatherData, timestamp);
    
    // Base load calculation
    let energyUsage = this.calculateBaseLoad(config, hour, dayOfYear, weather);
    
    // Apply optimization effects
    if (optimization) {
      const optimizations = this.getActiveOptimizations(config.facilityId, timestamp);
      for (const opt of optimizations) {
        energyUsage *= (1 - opt.expectedSavings);
      }
    }
    
    // Add realistic variance (±5%)
    const variance = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.1;
    energyUsage *= (1 + variance);
    
    // Calculate other metrics
    const powerFactor = 0.85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1; // 0.85-0.95
    const voltage = 480 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20; // 470-490V
    const current = energyUsage / (voltage * Math.sqrt(3) * powerFactor / 1000);
    
    return {
      facilityId: config.facilityId,
      timestamp,
      energyUsage: Math.round(energyUsage * 100) / 100,
      powerDemand: Math.round(energyUsage * 4 * 100) / 100, // 15-min interval
      voltage: Math.round(voltage * 10) / 10,
      current: Math.round(current * 100) / 100,
      powerFactor: Math.round(powerFactor * 1000) / 1000,
      temperature: Math.round(weather.temperature * 10) / 10,
      humidity: Math.round(weather.humidity * 10) / 10,
      co2Level: 400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400, // 400-800 ppm
      lightLevel: this.calculateLightLevel(config, hour, weather),
      equipmentStatus: this.generateEquipmentStatus(config, hour, weather),
      alarms: this.generateAlarms(config, energyUsage, weather),
      baselineUsage: this.calculateBaselineUsage(config, hour, dayOfYear, weather),
      optimizationSavings: optimization ? energyUsage * 0.15 * crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF : 0,
      dataQuality: 0.95 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.05, // 95-100% quality
      sensorHealth: this.generateSensorHealth(),
      createdAt: new Date(),
    };
  }

  /**
   * Calculate base load based on facility type and conditions
   */
  private calculateBaseLoad(
    config: SensorConfig,
    hour: number,
    dayOfYear: number,
    weather: WeatherData
  ): number {
    let baseLoad = 0;
    
    // Lighting load
    const lightingFactor = this.getLightingFactor(config.facilityType, hour);
    const lightingLoad = config.equipment.lighting.watts * config.equipment.lighting.count * lightingFactor / 1000;
    baseLoad += lightingLoad;
    
    // HVAC load (weather dependent)
    const hvacFactor = this.getHVACFactor(weather.temperature, config.location.climateZone);
    const hvacLoad = config.equipment.hvac.tons * 3.5 * hvacFactor; // ~3.5 kW per ton
    baseLoad += hvacLoad;
    
    // Equipment load (pumps, fans, controllers)
    const equipmentFactor = this.getEquipmentFactor(config.facilityType, hour);
    const pumpLoad = config.equipment.pumps.hp * 0.746 * config.equipment.pumps.count * equipmentFactor;
    const fanLoad = config.equipment.fans.watts * config.equipment.fans.count * equipmentFactor / 1000;
    const controllerLoad = config.equipment.controllers.watts * config.equipment.controllers.count / 1000;
    
    baseLoad += pumpLoad + fanLoad + controllerLoad;
    
    // Seasonal adjustments
    const seasonalFactor = this.getSeasonalFactor(dayOfYear, config.facilityType);
    baseLoad *= seasonalFactor;
    
    return Math.max(baseLoad, config.baseline.dailyKwh / 96); // Minimum 1/96th of daily usage
  }

  /**
   * Calculate baseline usage (without optimization)
   */
  private calculateBaselineUsage(
    config: SensorConfig,
    hour: number,
    dayOfYear: number,
    weather: WeatherData
  ): number {
    // Use historical patterns without optimization
    return this.calculateBaseLoad(config, hour, dayOfYear, weather) * 1.2; // 20% higher
  }

  /**
   * Generate optimization schedule
   */
  private async generateOptimizationSchedule(
    config: SensorConfig,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    const optimizations: OptimizationAction[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Daily optimization opportunities
      if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.7) { // 70% chance of optimization each day
        
        // Lighting optimization (dim during high natural light)
        if (config.facilityType === 'greenhouse' && crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.8) {
          optimizations.push({
            timestamp: new Date(currentDate.getTime() + 10 * 60 * 60 * 1000), // 10 AM
            type: 'lighting_dimming',
            description: 'Reduced artificial lighting due to sufficient natural light',
            expectedSavings: 0.15 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.15, // 15-30% savings
          });
        }
        
        // HVAC scheduling
        if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.6) {
          optimizations.push({
            timestamp: new Date(currentDate.getTime() + 14 * 60 * 60 * 1000), // 2 PM
            type: 'hvac_scheduling',
            description: 'Optimized HVAC schedule based on weather forecast',
            expectedSavings: 0.08 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.12, // 8-20% savings
          });
        }
        
        // Pump control
        if (config.facilityType !== 'warehouse' && crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.5) {
          optimizations.push({
            timestamp: new Date(currentDate.getTime() + 6 * 60 * 60 * 1000), // 6 AM
            type: 'pump_control',
            description: 'Variable speed pump optimization based on demand',
            expectedSavings: 0.12 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.08, // 12-20% savings
          });
        }
        
        // Fan optimization
        if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.4) {
          optimizations.push({
            timestamp: new Date(currentDate.getTime() + 22 * 60 * 60 * 1000), // 10 PM
            type: 'fan_optimization',
            description: 'Reduced ventilation during optimal conditions',
            expectedSavings: 0.05 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1, // 5-15% savings
          });
        }
      }
      
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }
    
    this.optimizationSchedule.set(config.facilityId, optimizations);
    
    // Store optimization actions in database
    for (const action of optimizations) {
      await prisma.optimizationAction.create({
        data: {
          facilityId: config.facilityId,
          type: action.type,
          description: action.description,
          expectedSavings: action.expectedSavings,
          implementedAt: action.timestamp,
          status: 'ACTIVE',
          createdAt: new Date(),
        }
      });
    }
  }

  /**
   * Get active optimizations for timestamp
   */
  private getActiveOptimizations(facilityId: string, timestamp: Date): OptimizationAction[] {
    const optimizations = this.optimizationSchedule.get(facilityId) || [];
    
    return optimizations.filter(opt => {
      const timeDiff = timestamp.getTime() - opt.timestamp.getTime();
      return timeDiff >= 0 && timeDiff <= 4 * 60 * 60 * 1000; // Active for 4 hours
    });
  }

  /**
   * Get weather data for location and time period
   */
  private async getWeatherData(
    location: { latitude: number; longitude: number; climateZone: string },
    startDate: Date,
    endDate: Date
  ): Promise<WeatherData[]> {
    const cacheKey = `${location.latitude},${location.longitude}`;
    
    if (this.weatherCache.has(cacheKey)) {
      return this.weatherCache.get(cacheKey)!;
    }
    
    // Generate realistic weather data
    const weatherData: WeatherData[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfYear = this.getDayOfYear(currentDate);
      const hour = currentDate.getHours();
      
      // Base temperature by season and location
      const baseTemp = this.getBaseTemperature(location.climateZone, dayOfYear);
      const dailyTempVariation = 15; // ±15°F daily variation
      const hourlyTemp = baseTemp + Math.sin((hour - 6) * Math.PI / 12) * dailyTempVariation / 2;
      
      weatherData.push({
        temperature: hourlyTemp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5, // ±2.5°F random
        humidity: 40 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40, // 40-80%
        solarRadiation: this.getSolarRadiation(hour, dayOfYear, location.latitude),
        windSpeed: 2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8, // 2-10 mph
        cloudCover: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100, // 0-100%
      });
      
      currentDate = addMinutes(currentDate, 15);
    }
    
    this.weatherCache.set(cacheKey, weatherData);
    return weatherData;
  }

  /**
   * Store IoT reading in database
   */
  private async storeReading(reading: any): Promise<void> {
    await prisma.iotReading.create({ data: reading });
  }

  // Helper methods for realistic data generation
  
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private getWeatherForTimestamp(weatherData: WeatherData[], timestamp: Date): WeatherData {
    // Find closest weather data point
    const index = Math.floor((timestamp.getTime() % (24 * 60 * 60 * 1000)) / (15 * 60 * 1000));
    return weatherData[Math.min(index, weatherData.length - 1)];
  }

  private getLightingFactor(facilityType: string, hour: number): number {
    switch (facilityType) {
      case 'greenhouse':
        // Natural light supplement
        if (hour >= 6 && hour <= 18) return 0.3 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4; // 30-70%
        return 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2; // 80-100%
      
      case 'indoor_farm':
        // Photoperiod control
        if (hour >= 6 && hour <= 20) return 0.9 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1; // 90-100%
        return 0.1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1; // 10-20%
      
      case 'processing':
        // Business hours
        if (hour >= 7 && hour <= 17) return 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2; // 80-100%
        return 0.2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2; // 20-40%
      
      case 'warehouse':
        // Minimal lighting
        if (hour >= 8 && hour <= 16) return 0.6 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2; // 60-80%
        return 0.1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1; // 10-20%
      
      default:
        return 0.5;
    }
  }

  private getHVACFactor(temperature: number, climateZone: string): number {
    // Cooling load increases with temperature
    let factor = 0.3; // Base load
    
    if (temperature > 75) {
      factor += (temperature - 75) * 0.05; // 5% per degree above 75°F
    }
    
    if (temperature < 65) {
      factor += (65 - temperature) * 0.03; // 3% per degree below 65°F (heating)
    }
    
    // Climate zone adjustments
    const climateMultipliers: Record<string, number> = {
      'Hot-Humid': 1.3,
      'Hot-Dry': 1.2,
      'Mixed-Humid': 1.0,
      'Mixed-Dry': 1.0,
      'Cold': 1.1,
    };
    
    return Math.max(0.1, factor * (climateMultipliers[climateZone] || 1.0));
  }

  private getEquipmentFactor(facilityType: string, hour: number): number {
    switch (facilityType) {
      case 'greenhouse':
      case 'indoor_farm':
        // Irrigation and climate control
        if (hour >= 5 && hour <= 7) return 0.9; // Morning irrigation
        if (hour >= 17 && hour <= 19) return 0.8; // Evening irrigation
        return 0.4 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2; // 40-60% base
      
      case 'processing':
        // Production schedule
        if (hour >= 6 && hour <= 18) return 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2; // 80-100%
        return 0.2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1; // 20-30%
      
      case 'warehouse':
        // Minimal equipment
        if (hour >= 8 && hour <= 17) return 0.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2; // 50-70%
        return 0.1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1; // 10-20%
      
      default:
        return 0.5;
    }
  }

  private getSeasonalFactor(dayOfYear: number, facilityType: string): number {
    // Seasonal variation based on day of year
    const seasonalCurve = Math.sin((dayOfYear - 81) * 2 * Math.PI / 365); // Peak at summer solstice
    
    switch (facilityType) {
      case 'greenhouse':
        return 1.0 + seasonalCurve * 0.3; // ±30% seasonal variation
      
      case 'indoor_farm':
        return 1.0 + seasonalCurve * 0.1; // ±10% variation (controlled environment)
      
      case 'processing':
        return 1.0 + seasonalCurve * 0.2; // ±20% variation
      
      case 'warehouse':
        return 1.0 + seasonalCurve * 0.4; // ±40% variation (heating/cooling)
      
      default:
        return 1.0;
    }
  }

  private getBaseTemperature(climateZone: string, dayOfYear: number): number {
    const seasonalTemp = Math.sin((dayOfYear - 81) * 2 * Math.PI / 365) * 30; // ±30°F seasonal
    
    const baseTemps: Record<string, number> = {
      'Hot-Humid': 80,
      'Hot-Dry': 85,
      'Mixed-Humid': 70,
      'Mixed-Dry': 72,
      'Cold': 60,
    };
    
    return (baseTemps[climateZone] || 70) + seasonalTemp;
  }

  private getSolarRadiation(hour: number, dayOfYear: number, latitude: number): number {
    if (hour < 6 || hour > 18) return 0;
    
    // Simplified solar calculation
    const solarHour = hour - 12; // Solar noon = 0
    const hourAngle = solarHour * 15 * Math.PI / 180;
    const declination = 23.45 * Math.sin((dayOfYear - 81) * 2 * Math.PI / 365) * Math.PI / 180;
    const latRad = latitude * Math.PI / 180;
    
    const solarElevation = Math.asin(
      Math.sin(declination) * Math.sin(latRad) +
      Math.cos(declination) * Math.cos(latRad) * Math.cos(hourAngle)
    );
    
    return Math.max(0, Math.sin(solarElevation) * 1000); // W/m²
  }

  private calculateLightLevel(config: SensorConfig, hour: number, weather: WeatherData): number {
    // Indoor light levels (lux)
    const artificialLight = config.equipment.lighting.watts * config.equipment.lighting.count * 50; // ~50 lux per watt
    const naturalLight = weather.solarRadiation * 0.1 * (1 - weather.cloudCover / 100); // Simplified
    
    return artificialLight + naturalLight;
  }

  private generateEquipmentStatus(config: SensorConfig, hour: number, weather: WeatherData): any {
    return {
      lighting: {
        status: 'online',
        dimLevel: this.getLightingFactor(config.facilityType, hour) * 100,
        temperature: 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10, // LED temp
      },
      hvac: {
        status: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.99 ? 'alarm' : 'online', // 1% alarm rate
        setpoint: 72 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
        actualTemp: weather.temperature + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2,
        mode: weather.temperature > 75 ? 'cooling' : 'heating',
      },
      pumps: {
        status: 'online',
        pressure: 30 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10, // PSI
        flow: 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20, // GPM
      },
      fans: {
        status: 'online',
        speed: this.getEquipmentFactor(config.facilityType, hour) * 100,
        vibration: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2, // mm/s
      }
    };
  }

  private generateAlarms(config: SensorConfig, energyUsage: number, weather: WeatherData): string[] {
    const alarms: string[] = [];
    
    // High energy usage alarm
    if (energyUsage > config.baseline.peakKw * 1.2) {
      alarms.push('HIGH_ENERGY_USAGE');
    }
    
    // Temperature alarms
    if (weather.temperature > 90) {
      alarms.push('HIGH_TEMPERATURE');
    }
    
    if (weather.temperature < 40) {
      alarms.push('LOW_TEMPERATURE');
    }
    
    // Random equipment alarms (low probability)
    if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.001) { // 0.1% chance
      const equipmentAlarms = ['PUMP_FAULT', 'FAN_VIBRATION', 'LIGHTING_FAILURE', 'SENSOR_OFFLINE'];
      alarms.push(equipmentAlarms[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * equipmentAlarms.length)]);
    }
    
    return alarms;
  }

  private generateSensorHealth(): any {
    return {
      energyMeter: {
        status: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.995 ? 'fault' : 'healthy',
        lastCalibration: new Date(Date.now() - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 90 * 24 * 60 * 60 * 1000),
        accuracy: 0.98 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.02,
      },
      temperatureSensor: {
        status: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.99 ? 'drift' : 'healthy',
        lastCalibration: new Date(Date.now() - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 180 * 24 * 60 * 60 * 1000),
        accuracy: 0.95 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.05,
      },
      communicationModule: {
        status: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.998 ? 'offline' : 'online',
        signalStrength: -60 - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20, // dBm
        lastHeartbeat: new Date(),
      }
    };
  }

  /**
   * Generate historical data for multiple facilities
   */
  async generateHistoricalDataBulk(
    facilities: SensorConfig[],
    monthsBack: number = 12
  ): Promise<void> {
    const endDate = new Date();
    const startDate = subDays(endDate, monthsBack * 30);
    
    
    for (const facility of facilities) {
      try {
        await this.generateFacilityData(facility, startDate, endDate, true);
      } catch (error) {
        console.error(`Failed to generate data for facility ${facility.facilityId}:`, error);
      }
    }
    
  }
}