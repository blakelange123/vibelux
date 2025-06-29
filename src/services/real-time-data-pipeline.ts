/**
 * Real-Time Data Pipeline for Automated Spectral Lighting Collection
 * 
 * Handles MQTT streaming, sensor integration, and automated data processing
 * for continuous spectral lighting optimization and regression model updates.
 */

import mqtt from 'mqtt';
import { PrismaClient } from '@prisma/client';
import { calculateSpectralLightingImpact, SpectralLightingData } from './weather-normalization';
import CultivarDataCollectionService from './cultivar-data-collection';

const prisma = new PrismaClient();
const cultivarService = new CultivarDataCollectionService();

// MQTT Configuration
const MQTT_CONFIG = {
  broker: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  clientId: `vibelux-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(16).slice(3)}`,
  topics: {
    environmental: 'vibelux/+/environmental/+',
    spectral: 'vibelux/+/spectral/+',
    plant_health: 'vibelux/+/plant/+',
    actuators: 'vibelux/+/actuators/+',
    alerts: 'vibelux/+/alerts/+',
    power: 'vibelux/+/power/+'
  }
};

// Sensor data interfaces
export interface EnvironmentalSensorData {
  facilityId: string;
  sensorId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  co2: number;
  airflow: number;
  pressure: number;
  vpd?: number;
}

export interface SpectralSensorData {
  facilityId: string;
  sensorId: string;
  timestamp: Date;
  ppfd: number;
  dli: number;
  photoperiod: number;
  spectralBands: {
    uv_b: number; // 280-315nm
    uv_a: number; // 315-380nm
    violet: number; // 380-420nm
    blue: number; // 420-490nm
    cyan: number; // 490-520nm
    green: number; // 520-565nm
    yellow: number; // 565-590nm
    orange: number; // 590-625nm
    red: number; // 625-700nm
    far_red: number; // 700-780nm
  };
  lightQualityMetrics: {
    uniformityIndex: number;
    canopyPenetration: number;
    redFarRedRatio: number;
    blueRedRatio: number;
    dliEfficiency: number;
  };
}

export interface PlantHealthData {
  facilityId: string;
  sensorId: string;
  timestamp: Date;
  growthStage: string;
  plantCount: number;
  visionMetrics: {
    averageHeight: number;
    averageWidth: number;
    leafAreaIndex: number;
    biomassEstimate: number;
    healthScore: number;
    stressIndicators: {
      leafWilting: boolean;
      colorStress: boolean;
      stretchiness: boolean;
      pestSigns: boolean;
    };
  };
  fluorescenceData?: {
    fvFm: number; // Photosystem II efficiency
    npqIndex: number; // Non-photochemical quenching
    etri: number; // Electron transport rate
  };
}

export interface PowerConsumptionData {
  facilityId: string;
  timestamp: Date;
  totalConsumption: number; // kWh
  lightingConsumption: number;
  hvacConsumption: number;
  equipmentConsumption: number;
  peakDemand: number; // kW
  powerFactor: number;
  harmonics: number;
}

// Main real-time data pipeline class
export class RealTimeDataPipeline {
  private mqttClient: mqtt.MqttClient | null = null;
  private dataBuffer: Map<string, any[]> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;
  private isConnected = false;

  constructor() {
    this.initializeMQTT();
    this.startDataProcessing();
  }

  private initializeMQTT(): void {
    try {
      this.mqttClient = mqtt.connect(MQTT_CONFIG.broker, {
        clientId: MQTT_CONFIG.clientId,
        keepalive: 60,
        reconnectPeriod: 5000,
        clean: true
      });

      this.mqttClient.on('connect', () => {
        this.isConnected = true;
        this.subscribeToTopics();
      });

      this.mqttClient.on('message', (topic, message) => {
        this.handleIncomingMessage(topic, message);
      });

      this.mqttClient.on('error', (error) => {
        console.error('❌ MQTT Connection error:', error);
        this.isConnected = false;
      });

      this.mqttClient.on('close', () => {
        this.isConnected = false;
      });

    } catch (error) {
      console.error('Failed to initialize MQTT:', error);
    }
  }

  private subscribeToTopics(): void {
    if (!this.mqttClient) return;

    Object.values(MQTT_CONFIG.topics).forEach(topic => {
      this.mqttClient!.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
        } else {
        }
      });
    });
  }

  private handleIncomingMessage(topic: string, message: Buffer): void {
    try {
      const data = JSON.parse(message.toString());
      const topicParts = topic.split('/');
      const facilityId = topicParts[1];
      const dataType = topicParts[2];
      const sensorId = topicParts[3];

      // Add timestamp if not present
      if (!data.timestamp) {
        data.timestamp = new Date();
      }

      // Buffer data for batch processing
      const bufferKey = `${facilityId}-${dataType}`;
      if (!this.dataBuffer.has(bufferKey)) {
        this.dataBuffer.set(bufferKey, []);
      }
      
      this.dataBuffer.get(bufferKey)!.push({
        ...data,
        facilityId,
        sensorId,
        dataType
      });

      // Immediate processing for critical alerts
      if (dataType === 'alerts') {
        this.processAlert(data, facilityId);
      }

    } catch (error) {
      console.error('Error parsing MQTT message:', error);
    }
  }

  private startDataProcessing(): void {
    // Process buffered data every 30 seconds
    this.processingInterval = setInterval(() => {
      this.processBatchedData();
    }, 30000);
  }

  private async processBatchedData(): Promise<void> {
    for (const [bufferKey, dataPoints] of this.dataBuffer.entries()) {
      if (dataPoints.length === 0) continue;

      const [facilityId, dataType] = bufferKey.split('-');

      try {
        switch (dataType) {
          case 'environmental':
            await this.processEnvironmentalData(facilityId, dataPoints);
            break;
          case 'spectral':
            await this.processSpectralData(facilityId, dataPoints);
            break;
          case 'plant':
            await this.processPlantHealthData(facilityId, dataPoints);
            break;
          case 'power':
            await this.processPowerData(facilityId, dataPoints);
            break;
        }

        // Clear processed data
        this.dataBuffer.set(bufferKey, []);

      } catch (error) {
        console.error(`Error processing ${dataType} data for ${facilityId}:`, error);
      }
    }

    // Run integrated analysis after all data is processed
    await this.runIntegratedAnalysis();
  }

  private async processEnvironmentalData(
    facilityId: string, 
    dataPoints: any[]
  ): Promise<void> {
    // Calculate averages for the batch
    const avgData = this.calculateAverages(dataPoints, [
      'temperature', 'humidity', 'co2', 'airflow', 'pressure'
    ]);

    // Calculate VPD
    avgData.vpd = this.calculateVPD(avgData.temperature, avgData.humidity);

    // Store in database
    await prisma.sensorReading.create({
      data: {
        facility_id: facilityId,
        sensor_type: 'environmental',
        reading_value: avgData.temperature,
        metadata: {
          humidity: avgData.humidity,
          co2: avgData.co2,
          vpd: avgData.vpd,
          airflow: avgData.airflow,
          pressure: avgData.pressure,
          sampleCount: dataPoints.length
        },
        timestamp: new Date(),
        data_quality_score: this.calculateDataQuality(dataPoints)
      }
    });

    // Check against cultivar preferences and trigger interventions
    await this.checkEnvironmentalOptimization(facilityId, avgData);
  }

  private async processSpectralData(
    facilityId: string, 
    dataPoints: any[]
  ): Promise<void> {
    const avgSpectral = this.calculateSpectralAverages(dataPoints);

    // Convert to standardized spectral format
    const spectralData: SpectralLightingData = {
      dli_total: avgSpectral.dli,
      ppfd_average: avgSpectral.ppfd,
      photoperiod_hours: avgSpectral.photoperiod,
      spectral_composition: {
        uv_a_percent: (avgSpectral.spectralBands.uv_a / avgSpectral.ppfd) * 100,
        violet_percent: (avgSpectral.spectralBands.violet / avgSpectral.ppfd) * 100,
        blue_percent: (avgSpectral.spectralBands.blue / avgSpectral.ppfd) * 100,
        cyan_percent: (avgSpectral.spectralBands.cyan / avgSpectral.ppfd) * 100,
        green_percent: (avgSpectral.spectralBands.green / avgSpectral.ppfd) * 100,
        yellow_percent: (avgSpectral.spectralBands.yellow / avgSpectral.ppfd) * 100,
        red_percent: (avgSpectral.spectralBands.red / avgSpectral.ppfd) * 100,
        far_red_percent: (avgSpectral.spectralBands.far_red / avgSpectral.ppfd) * 100
      },
      light_quality_metrics: {
        red_far_red_ratio: avgSpectral.lightQualityMetrics.redFarRedRatio,
        blue_green_ratio: avgSpectral.spectralBands.blue / avgSpectral.spectralBands.green,
        blue_red_ratio: avgSpectral.lightQualityMetrics.blueRedRatio,
        uniformity_coefficient: avgSpectral.lightQualityMetrics.uniformityIndex,
        canopy_penetration_index: avgSpectral.lightQualityMetrics.canopyPenetration
      },
      environmental_factors: {
        co2_ppm: 800, // Will be updated from environmental data
        vpd_kpa: 1.0, // Will be updated from environmental data
        air_flow_rate: 0.5,
        nutrient_ec: 2.0, // Default, needs nutrient sensor integration
        ph: 6.0,
        root_zone_temp: 21
      },
      plant_architecture: {
        lai: 3.0, // Will be updated from vision data
        canopy_height_cm: 100,
        plant_density_per_m2: 6.25,
        growth_stage: 'flowering',
        days_in_stage: 30
      }
    };

    // Store detailed spectral data
    await prisma.spectralData.create({
      data: {
        facility_id: facilityId,
        timestamp: new Date(),
        dli: spectralData.dli_total,
        ppfd: spectralData.ppfd_average,
        photoperiod: spectralData.photoperiod_hours,
        spectrum_280_315: avgSpectral.spectralBands.uv_b || 0,
        spectrum_315_380: avgSpectral.spectralBands.uv_a,
        spectrum_380_420: avgSpectral.spectralBands.violet,
        spectrum_420_490: avgSpectral.spectralBands.blue,
        spectrum_490_520: avgSpectral.spectralBands.cyan,
        spectrum_520_565: avgSpectral.spectralBands.green,
        spectrum_565_590: avgSpectral.spectralBands.yellow,
        spectrum_590_625: avgSpectral.spectralBands.orange || 0,
        spectrum_625_700: avgSpectral.spectralBands.red,
        spectrum_700_780: avgSpectral.spectralBands.far_red,
        environmental_context: spectralData.environmental_factors,
        light_quality_metrics: spectralData.light_quality_metrics
      }
    });

    // Run spectral optimization analysis
    await this.runSpectralOptimization(facilityId, spectralData);
  }

  private async processPlantHealthData(
    facilityId: string, 
    dataPoints: any[]
  ): Promise<void> {
    const avgHealth = this.calculateAverages(dataPoints, [
      'visionMetrics.averageHeight',
      'visionMetrics.averageWidth', 
      'visionMetrics.leafAreaIndex',
      'visionMetrics.biomassEstimate',
      'visionMetrics.healthScore'
    ]);

    // Store plant response data
    await prisma.plantResponse.create({
      data: {
        facility_id: facilityId,
        measurement_date: new Date(),
        height_cm: avgHealth['visionMetrics.averageHeight'],
        width_cm: avgHealth['visionMetrics.averageWidth'],
        leaf_area_cm2: avgHealth['visionMetrics.leafAreaIndex'] * 10000, // Convert to cm²
        fresh_weight_g: avgHealth['visionMetrics.biomassEstimate'],
        health_score: avgHealth['visionMetrics.healthScore'],
        stress_indicators: {
          wilting: dataPoints.some(d => d.visionMetrics?.stressIndicators?.leafWilting),
          color_stress: dataPoints.some(d => d.visionMetrics?.stressIndicators?.colorStress),
          pest_signs: dataPoints.some(d => d.visionMetrics?.stressIndicators?.pestSigns)
        }
      }
    });

    // Update LAI in plant architecture for spectral calculations
    await this.updatePlantArchitecture(facilityId, {
      lai: avgHealth['visionMetrics.leafAreaIndex'],
      canopy_height_cm: avgHealth['visionMetrics.averageHeight'],
      health_score: avgHealth['visionMetrics.healthScore']
    });
  }

  private async processPowerData(
    facilityId: string, 
    dataPoints: any[]
  ): Promise<void> {
    const avgPower = this.calculateAverages(dataPoints, [
      'totalConsumption', 'lightingConsumption', 'hvacConsumption', 
      'equipmentConsumption', 'peakDemand', 'powerFactor'
    ]);

    // Store energy consumption data
    await prisma.energyConsumption.create({
      data: {
        facility_id: facilityId,
        reading_date: new Date(),
        total_kwh: avgPower.totalConsumption,
        lighting_kwh: avgPower.lightingConsumption,
        hvac_kwh: avgPower.hvacConsumption,
        equipment_kwh: avgPower.equipmentConsumption,
        peak_demand_kw: avgPower.peakDemand,
        power_factor: avgPower.powerFactor,
        cost_per_kwh: 0.12, // Will be updated from utility rate data
        demand_charge: avgPower.peakDemand * 15 // Estimated demand charge
      }
    });
  }

  private async runIntegratedAnalysis(): Promise<void> {
    // Get active growing cycles for all facilities
    const activeCycles = await prisma.experiment.findMany({
      where: {
        status: 'active'
      },
      include: {
        measurements: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    for (const cycle of activeCycles) {
      try {
        // Run cultivar-specific optimization
        const cultivarId = cycle.cannabis_strain_id;
        if (cultivarId) {
          await this.optimizeForCultivar(cycle.facility_id, cultivarId, cycle.id);
        }

        // Update regression models with new data
        await this.updateRegressionModels(cycle.facility_id);

        // Check for automated interventions
        await this.checkAutomatedInterventions(cycle.id);

      } catch (error) {
        console.error(`Error in integrated analysis for cycle ${cycle.id}:`, error);
      }
    }
  }

  private async optimizeForCultivar(
    facilityId: string, 
    cultivarId: string, 
    cycleId: string
  ): Promise<void> {
    // Get current conditions
    const currentConditions = await this.getCurrentConditions(facilityId);
    
    // Get optimal conditions for cultivar
    const optimization = await cultivarService.getOptimalConditionsForCultivar(
      cultivarId,
      currentConditions.growthStage,
      currentConditions
    );

    // Execute high-priority adjustments
    for (const adjustment of optimization.adjustmentPriority.slice(0, 3)) {
      await this.executeOptimization(facilityId, adjustment, optimization.recommendations);
    }

    // Log optimization decision
    await prisma.measurement.create({
      data: {
        experiment_id: cycleId,
        measurement_type: 'optimization',
        value: optimization.predictedImpact,
        metadata: {
          adjustments: optimization.adjustmentPriority,
          recommendations: optimization.recommendations
        },
        timestamp: new Date()
      }
    });
  }

  private calculateVPD(temperature: number, humidity: number): number {
    const svp = 610.7 * Math.exp((17.38 * temperature) / (temperature + 239));
    const avp = svp * (humidity / 100);
    return (svp - avp) / 1000; // kPa
  }

  private calculateAverages(dataPoints: any[], fields: string[]): any {
    const result: any = {};
    
    for (const field of fields) {
      const values = dataPoints.map(point => this.getNestedValue(point, field))
                              .filter(val => val != null && !isNaN(val));
      
      if (values.length > 0) {
        result[field] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    }
    
    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private calculateSpectralAverages(dataPoints: any[]): any {
    // Average all spectral measurements
    const spectralFields = [
      'ppfd', 'dli', 'photoperiod',
      'spectralBands.uv_a', 'spectralBands.violet', 'spectralBands.blue',
      'spectralBands.cyan', 'spectralBands.green', 'spectralBands.yellow',
      'spectralBands.red', 'spectralBands.far_red',
      'lightQualityMetrics.uniformityIndex', 'lightQualityMetrics.canopyPenetration',
      'lightQualityMetrics.redFarRedRatio', 'lightQualityMetrics.blueRedRatio'
    ];

    return this.calculateAverages(dataPoints, spectralFields);
  }

  private calculateDataQuality(dataPoints: any[]): number {
    // Calculate data quality score based on consistency and completeness
    if (dataPoints.length === 0) return 0;

    const completeness = dataPoints.filter(p => p.temperature != null).length / dataPoints.length;
    
    // Calculate coefficient of variation for consistency
    const temperatures = dataPoints.map(p => p.temperature).filter(t => t != null);
    const mean = temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length;
    const variance = temperatures.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / temperatures.length;
    const cv = Math.sqrt(variance) / mean;
    
    const consistency = Math.max(0, 1 - cv); // Lower CV = higher consistency
    
    return Math.round((completeness * 0.6 + consistency * 0.4) * 100);
  }

  // Placeholder methods for integration points
  private async checkEnvironmentalOptimization(facilityId: string, data: any): Promise<void> {
    // Integration point for environmental control
  }

  private async runSpectralOptimization(facilityId: string, spectralData: SpectralLightingData): Promise<void> {
    // Integration point for spectral lighting control
  }

  private async updatePlantArchitecture(facilityId: string, architecture: any): Promise<void> {
    // Update plant architecture data for regression models
  }

  private async updateRegressionModels(facilityId: string): Promise<void> {
    // Update ML models with new data
  }

  private async checkAutomatedInterventions(cycleId: string): Promise<void> {
    // Check for and execute automated interventions
  }

  private async getCurrentConditions(facilityId: string): Promise<any> {
    // Get current environmental and spectral conditions
    return {
      temperature: 24,
      humidity: 60,
      co2: 1000,
      vpd: 1.0,
      growthStage: 'flowering'
    };
  }

  private async executeOptimization(facilityId: string, adjustment: string, recommendations: any): Promise<void> {
    // Execute optimization through actuator control
  }

  private async processAlert(data: any, facilityId: string): Promise<void> {
    // Handle critical alerts immediately
  }

  // Cleanup
  public disconnect(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    if (this.mqttClient) {
      this.mqttClient.end();
    }
  }
}

export default RealTimeDataPipeline;