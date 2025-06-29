/**
 * Master Automation Orchestrator
 * 
 * Central service that coordinates all automated systems:
 * - Real-time data collection
 * - Cultivar-specific optimization
 * - Spectral lighting control
 * - Weather normalization
 * - Energy savings verification
 * - Billing automation
 * 
 * This is the main entry point for complete facility automation.
 */

import { PrismaClient } from '@prisma/client';
import RealTimeDataPipeline from './real-time-data-pipeline';
import CultivarDataCollectionService from './cultivar-data-collection';
import AutomatedSpectralOptimization from './automated-spectral-optimization';
import { normalizeEnergyConsumption } from './weather-normalization';
import { verifySavings } from './savings-verification';

const prisma = new PrismaClient();

// System health and status interface
export interface SystemStatus {
  facilityId: string;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  subsystems: {
    dataCollection: {
      status: 'online' | 'offline' | 'degraded';
      lastUpdate: Date;
      sensorCount: number;
      dataQuality: number; // 0-100%
    };
    spectralOptimization: {
      status: 'active' | 'inactive' | 'optimizing';
      activeRecipe: string | null;
      lastOptimization: Date;
      performanceScore: number; // 0-100%
    };
    environmentalControl: {
      status: 'automated' | 'manual' | 'error';
      parametersInRange: number;
      totalParameters: number;
      interventionsToday: number;
    };
    energyTracking: {
      status: 'tracking' | 'error';
      currentUsage: number; // kW
      todaysSavings: number; // kWh
      efficiencyScore: number; // 0-100%
    };
    plantHealth: {
      status: 'healthy' | 'stressed' | 'critical';
      averageHealthScore: number; // 0-100%
      growthStage: string;
      daysInStage: number;
    };
  };
  alerts: SystemAlert[];
  performance: {
    yieldProjection: number; // % above baseline
    qualityProjection: number; // % above baseline
    energyEfficiency: number; // μmol/J
    roi: number; // % return on investment
  };
  automation: {
    level: 'full' | 'partial' | 'manual';
    interventionsPerDay: number;
    successRate: number; // % of successful interventions
    userOverrides: number; // Manual overrides today
  };
}

interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'environmental' | 'spectral' | 'energy' | 'plant_health' | 'system';
  message: string;
  timestamp: Date;
  resolved: boolean;
  action?: string;
}

// Automation configuration
export interface AutomationConfig {
  facilityId: string;
  cultivarId: string;
  automationLevel: 'full' | 'environmental_only' | 'lighting_only' | 'monitoring_only';
  constraints: {
    maxPowerConsumption: number; // kW
    maxDailyInterventions: number;
    environmentalLimits: {
      tempMin: number;
      tempMax: number;
      humidityMin: number;
      humidityMax: number;
      co2Max: number;
      vpdMin: number;
      vpdMax: number;
    };
    spectralLimits: {
      maxDLI: number;
      maxUVPercent: number;
      minEfficiency: number; // μmol/J
    };
  };
  targets: {
    primary: 'yield' | 'quality' | 'efficiency' | 'cost';
    yieldTarget: number; // % above baseline
    qualityTarget: number; // % above baseline
    efficiencyTarget: number; // μmol/J
    costTarget: number; // max $/month
  };
  safety: {
    emergencyShutdownEnabled: boolean;
    maxConsecutiveFailures: number;
    userApprovalRequired: boolean;
    criticalParameterLimits: any;
  };
}

// Main orchestrator class
export class MasterAutomationOrchestrator {
  private dataPipeline: RealTimeDataPipeline;
  private cultivarService: CultivarDataCollectionService;
  private spectralOptimizer: AutomatedSpectralOptimization;
  private activeFacilities: Map<string, AutomationConfig> = new Map();
  private systemStatus: Map<string, SystemStatus> = new Map();
  private orchestrationInterval: NodeJS.Timeout | null = null;
  private alertQueue: SystemAlert[] = [];

  constructor() {
    this.dataPipeline = new RealTimeDataPipeline();
    this.cultivarService = new CultivarDataCollectionService();
    this.spectralOptimizer = new AutomatedSpectralOptimization();
    
    this.startOrchestrationLoop();
    this.initializeSystemMonitoring();
  }

  // Initialize automation for a facility
  async initializeFacilityAutomation(config: AutomationConfig): Promise<void> {

    try {
      // Validate configuration
      await this.validateConfiguration(config);

      // Store configuration
      this.activeFacilities.set(config.facilityId, config);

      // Initialize subsystems
      await this.initializeDataCollection(config.facilityId);
      await this.initializeEnvironmentalControl(config);
      await this.initializeSpectralOptimization(config);
      await this.initializeEnergyTracking(config.facilityId);
      await this.initializePlantHealthMonitoring(config);

      // Create initial system status
      const status = await this.generateSystemStatus(config.facilityId);
      this.systemStatus.set(config.facilityId, status);

      // Store automation config in database
      await this.storeAutomationConfig(config);


      // Send notification
      await this.sendNotification(config.facilityId, {
        type: 'automation_started',
        message: `Full automation activated for facility ${config.facilityId}`,
        level: config.automationLevel
      });

    } catch (error) {
      console.error(`❌ Failed to initialize automation for ${config.facilityId}:`, error);
      throw error;
    }
  }

  // Main orchestration loop - runs every 5 minutes
  private startOrchestrationLoop(): void {
    this.orchestrationInterval = setInterval(async () => {
      await this.runOrchestrationCycle();
    }, 5 * 60 * 1000); // 5 minutes
  }

  private async runOrchestrationCycle(): Promise<void> {

    for (const [facilityId, config] of this.activeFacilities.entries()) {
      try {
        // Update system status
        const status = await this.generateSystemStatus(facilityId);
        this.systemStatus.set(facilityId, status);

        // Check for critical alerts
        await this.handleCriticalAlerts(facilityId, status);

        // Run automation decisions
        await this.runAutomationDecisions(facilityId, config, status);

        // Update performance metrics
        await this.updatePerformanceMetrics(facilityId, status);

        // Run energy savings verification
        await this.runEnergySavingsVerification(facilityId);

        // Check for optimization opportunities
        await this.checkOptimizationOpportunities(facilityId, config);

      } catch (error) {
        console.error(`Error in orchestration cycle for ${facilityId}:`, error);
        await this.handleOrchestrationError(facilityId, error);
      }
    }

    // Clean up old alerts and logs
    await this.cleanupSystemData();
  }

  // Generate comprehensive system status
  private async generateSystemStatus(facilityId: string): Promise<SystemStatus> {
    // Get latest sensor data
    const latestReading = await prisma.ioTReading.findFirst({
      where: { facilityId },
      orderBy: { timestamp: 'desc' }
    });

    // Get active experiment
    const activeExperiment = await prisma.experiment.findFirst({
      where: { 
        facility_id: facilityId,
        status: 'active'
      }
    });

    // Get recent alerts
    const recentAlerts = await prisma.systemAlert.findMany({
      where: {
        entityType: 'facility',
        entityId: facilityId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate subsystem statuses
    const dataCollectionStatus = this.calculateDataCollectionStatus(latestReading);
    const spectralStatus = await this.calculateSpectralOptimizationStatus(facilityId);
    const environmentalStatus = this.calculateEnvironmentalStatus(latestReading);
    const energyStatus = await this.calculateEnergyTrackingStatus(facilityId);
    const plantHealthStatus = await this.calculatePlantHealthStatus(facilityId);

    // Calculate overall health
    const overallHealth = this.calculateOverallHealth([
      dataCollectionStatus,
      spectralStatus,
      environmentalStatus,
      energyStatus,
      plantHealthStatus
    ]);

    // Calculate performance projections
    const performance = await this.calculatePerformanceProjections(facilityId);

    // Calculate automation metrics
    const automation = await this.calculateAutomationMetrics(facilityId);

    return {
      facilityId,
      overallHealth,
      subsystems: {
        dataCollection: dataCollectionStatus,
        spectralOptimization: spectralStatus,
        environmentalControl: environmentalStatus,
        energyTracking: energyStatus,
        plantHealth: plantHealthStatus
      },
      alerts: recentAlerts.map(alert => ({
        id: alert.id,
        severity: alert.severity as any,
        category: alert.type as any,
        message: alert.title,
        timestamp: alert.createdAt,
        resolved: alert.resolved,
        action: alert.resolution || undefined
      })),
      performance,
      automation
    };
  }

  // Run automated decision making
  private async runAutomationDecisions(
    facilityId: string,
    config: AutomationConfig,
    status: SystemStatus
  ): Promise<void> {
    
    if (config.automationLevel === 'monitoring_only') return;

    const decisions = [];

    // Environmental control decisions
    if (config.automationLevel === 'full' || config.automationLevel === 'environmental_only') {
      const envDecisions = await this.makeEnvironmentalDecisions(facilityId, config, status);
      decisions.push(...envDecisions);
    }

    // Spectral optimization decisions
    if (config.automationLevel === 'full' || config.automationLevel === 'lighting_only') {
      const spectralDecisions = await this.makeSpectralDecisions(facilityId, config, status);
      decisions.push(...spectralDecisions);
    }

    // Execute decisions
    for (const decision of decisions) {
      await this.executeAutomationDecision(facilityId, decision);
    }

    // Log automation activity
    if (decisions.length > 0) {
      await prisma.optimizationAction.createMany({
        data: decisions.map(decision => ({
          facilityId,
          type: decision.type,
          description: decision.description,
          expectedSavings: decision.expectedSavings,
          implementedAt: new Date()
        }))
      });
    }
  }

  // Make environmental control decisions
  private async makeEnvironmentalDecisions(
    facilityId: string,
    config: AutomationConfig,
    status: SystemStatus
  ): Promise<any[]> {
    
    const decisions = [];
    const env = status.subsystems.environmentalControl;
    const constraints = config.constraints.environmentalLimits;

    // Get current conditions
    const currentReading = await prisma.ioTReading.findFirst({
      where: { facilityId },
      orderBy: { timestamp: 'desc' }
    });

    if (!currentReading) return decisions;

    // Temperature decisions
    if (currentReading.temperature < constraints.tempMin) {
      decisions.push({
        type: 'temperature_increase',
        description: `Increase temperature from ${currentReading.temperature}°C to ${constraints.tempMin}°C`,
        expectedSavings: 0,
        parameters: { targetTemp: constraints.tempMin }
      });
    } else if (currentReading.temperature > constraints.tempMax) {
      decisions.push({
        type: 'temperature_decrease',
        description: `Decrease temperature from ${currentReading.temperature}°C to ${constraints.tempMax}°C`,
        expectedSavings: 2,
        parameters: { targetTemp: constraints.tempMax }
      });
    }

    // Humidity decisions
    if (currentReading.humidity < constraints.humidityMin) {
      decisions.push({
        type: 'humidity_increase',
        description: `Increase humidity from ${currentReading.humidity}% to ${constraints.humidityMin}%`,
        expectedSavings: 0,
        parameters: { targetHumidity: constraints.humidityMin }
      });
    } else if (currentReading.humidity > constraints.humidityMax) {
      decisions.push({
        type: 'humidity_decrease',
        description: `Decrease humidity from ${currentReading.humidity}% to ${constraints.humidityMax}%`,
        expectedSavings: 3,
        parameters: { targetHumidity: constraints.humidityMax }
      });
    }

    // CO2 decisions
    if (currentReading.co2Level > constraints.co2Max) {
      decisions.push({
        type: 'co2_decrease',
        description: `Reduce CO2 from ${currentReading.co2Level}ppm to ${constraints.co2Max}ppm`,
        expectedSavings: 1,
        parameters: { targetCO2: constraints.co2Max }
      });
    }

    // VPD optimization
    const vpd = this.calculateVPD(currentReading.temperature, currentReading.humidity);
    if (vpd < constraints.vpdMin || vpd > constraints.vpdMax) {
      const targetVPD = (constraints.vpdMin + constraints.vpdMax) / 2;
      decisions.push({
        type: 'vpd_optimization',
        description: `Optimize VPD from ${vpd.toFixed(2)}kPa to ${targetVPD.toFixed(2)}kPa`,
        expectedSavings: 5,
        parameters: { targetVPD }
      });
    }

    return decisions;
  }

  // Make spectral lighting decisions
  private async makeSpectralDecisions(
    facilityId: string,
    config: AutomationConfig,
    status: SystemStatus
  ): Promise<any[]> {
    
    const decisions = [];

    // Check if spectral optimization is needed
    const lastOptimization = status.subsystems.spectralOptimization.lastOptimization;
    const hoursSinceOptimization = (Date.now() - lastOptimization.getTime()) / (1000 * 60 * 60);

    // Run optimization if it's been more than 24 hours or performance is declining
    if (hoursSinceOptimization > 24 || status.subsystems.spectralOptimization.performanceScore < 80) {
      decisions.push({
        type: 'spectral_optimization',
        description: 'Run comprehensive spectral optimization',
        expectedSavings: 8,
        parameters: { optimizationType: 'full' }
      });
    }

    // Check for immediate adjustments based on plant response
    const plantHealth = status.subsystems.plantHealth;
    if (plantHealth.averageHealthScore < 70) {
      decisions.push({
        type: 'spectral_stress_response',
        description: 'Adjust spectrum to reduce plant stress',
        expectedSavings: 0,
        parameters: { adjustment: 'stress_reduction' }
      });
    }

    return decisions;
  }

  // Execute automation decisions
  private async executeAutomationDecision(facilityId: string, decision: any): Promise<void> {

    try {
      switch (decision.type) {
        case 'temperature_increase':
        case 'temperature_decrease':
          await this.adjustTemperature(facilityId, decision.parameters.targetTemp);
          break;

        case 'humidity_increase':
        case 'humidity_decrease':
          await this.adjustHumidity(facilityId, decision.parameters.targetHumidity);
          break;

        case 'co2_decrease':
          await this.adjustCO2(facilityId, decision.parameters.targetCO2);
          break;

        case 'vpd_optimization':
          await this.optimizeVPD(facilityId, decision.parameters.targetVPD);
          break;

        case 'spectral_optimization':
          await this.runSpectralOptimization(facilityId);
          break;

        case 'spectral_stress_response':
          await this.adjustSpectrumForStress(facilityId);
          break;

        default:
          console.warn(`Unknown decision type: ${decision.type}`);
      }

      // Log successful execution
      await this.logAutomationAction(facilityId, decision, 'success');

    } catch (error) {
      console.error(`Failed to execute decision ${decision.type}:`, error);
      await this.logAutomationAction(facilityId, decision, 'failed', error);
    }
  }

  // Actuator control methods
  private async adjustTemperature(facilityId: string, targetTemp: number): Promise<void> {
    // This would integrate with the autonomous actuator API
    
    // Send command to HVAC system
    const command = {
      type: 'hvac_control',
      parameters: {
        setpoint: targetTemp,
        mode: 'auto'
      }
    };

    // Execute through actuator control system
    await this.sendActuatorCommand(facilityId, 'hvac', command);
  }

  private async adjustHumidity(facilityId: string, targetHumidity: number): Promise<void> {
    
    const command = {
      type: 'humidity_control',
      parameters: {
        setpoint: targetHumidity,
        mode: 'auto'
      }
    };

    await this.sendActuatorCommand(facilityId, 'dehumidifier', command);
  }

  private async adjustCO2(facilityId: string, targetCO2: number): Promise<void> {
    
    const command = {
      type: 'co2_control',
      parameters: {
        setpoint: targetCO2,
        mode: 'auto'
      }
    };

    await this.sendActuatorCommand(facilityId, 'co2_controller', command);
  }

  private async optimizeVPD(facilityId: string, targetVPD: number): Promise<void> {
    
    // VPD optimization requires coordinated temp/humidity control
    const command = {
      type: 'vpd_optimization',
      parameters: {
        targetVPD,
        mode: 'coordinated'
      }
    };

    await this.sendActuatorCommand(facilityId, 'environmental_controller', command);
  }

  private async runSpectralOptimization(facilityId: string): Promise<void> {
    
    const config = this.activeFacilities.get(facilityId);
    if (!config) return;

    // Get current conditions
    const currentConditions = await this.getCurrentSpectralConditions(facilityId);
    
    // Run optimization
    const optimizationTarget = {
      primary: config.targets.primary as any,
      constraints: config.constraints.spectralLimits,
      weights: {
        yieldWeight: 0.4,
        qualityWeight: 0.3,
        energyWeight: 0.2,
        costWeight: 0.1
      }
    };

    const recipe = await this.spectralOptimizer.optimizeFacility(
      facilityId,
      config.cultivarId,
      optimizationTarget,
      currentConditions
    );

  }

  private async adjustSpectrumForStress(facilityId: string): Promise<void> {
    
    // Quick stress-reduction adjustments
    const command = {
      type: 'spectral_adjustment',
      parameters: {
        blue_reduction: 2, // Reduce blue light stress
        far_red_increase: 1, // Slight far-red increase for relaxation
        uv_reduction: 1 // Reduce UV stress
      }
    };

    await this.sendActuatorCommand(facilityId, 'led_controller', command);
  }

  // Energy savings verification
  private async runEnergySavingsVerification(facilityId: string): Promise<void> {
    try {
      // Get current billing period
      const now = new Date();
      const billingStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const billingEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Get actual consumption for the period
      const consumptionData = await prisma.ioTReading.aggregate({
        where: {
          facilityId,
          timestamp: {
            gte: billingStart,
            lte: billingEnd
          }
        },
        _sum: {
          energyUsage: true
        }
      });

      const actualConsumption = consumptionData._sum.energyUsage || 0;

      if (actualConsumption === 0) return; // No data to verify

      // Run weather normalization and savings verification
      const normalizedResult = await normalizeEnergyConsumption(
        facilityId,
        { start: billingStart, end: billingEnd },
        actualConsumption,
        'indoor' // Default facility type
      );

      // Store verification results
      await prisma.optimizationAction.create({
        data: {
          facilityId,
          type: 'energy_verification',
          description: `Energy savings verification for ${billingStart.toISOString().split('T')[0]}`,
          expectedSavings: normalizedResult.savingsPercent,
          actualSavings: normalizedResult.savingsPercent,
          implementedAt: new Date()
        }
      });


    } catch (error) {
      console.error(`Error in energy savings verification for ${facilityId}:`, error);
    }
  }

  // Utility methods
  private calculateVPD(temperature: number, humidity: number): number {
    const svp = 610.7 * Math.exp((17.38 * temperature) / (temperature + 239));
    const avp = svp * (humidity / 100);
    return (svp - avp) / 1000; // kPa
  }

  private async sendActuatorCommand(facilityId: string, deviceType: string, command: any): Promise<void> {
    // This would integrate with the autonomous actuator API
    
    // In production, this would call the actuator control system
    // await actuatorAPI.sendCommand(facilityId, deviceType, command);
  }

  private async logAutomationAction(
    facilityId: string, 
    decision: any, 
    status: 'success' | 'failed', 
    error?: any
  ): Promise<void> {
    await prisma.apiLog.create({
      data: {
        endpoint: `/automation/${facilityId}`,
        method: 'AUTO',
        statusCode: status === 'success' ? 200 : 500,
        requestData: decision,
        responseData: { status },
        errorMessage: error?.message,
        responseTime: 0,
        customerId: facilityId
      }
    });
  }

  // Placeholder methods for status calculations
  private calculateDataCollectionStatus(reading: any): any {
    return {
      status: reading ? 'online' : 'offline',
      lastUpdate: reading?.timestamp || new Date(),
      sensorCount: 12,
      dataQuality: reading ? 95 : 0
    };
  }

  private async calculateSpectralOptimizationStatus(facilityId: string): Promise<any> {
    const activeRecipe = await this.spectralOptimizer.getActiveRecipe(facilityId);
    
    return {
      status: activeRecipe ? 'active' : 'inactive',
      activeRecipe: activeRecipe?.id || null,
      lastOptimization: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      performanceScore: activeRecipe ? 85 : 50
    };
  }

  private calculateEnvironmentalStatus(reading: any): any {
    return {
      status: 'automated',
      parametersInRange: 4,
      totalParameters: 5,
      interventionsToday: 3
    };
  }

  private async calculateEnergyTrackingStatus(facilityId: string): Promise<any> {
    return {
      status: 'tracking',
      currentUsage: 125.5,
      todaysSavings: 23.2,
      efficiencyScore: 88
    };
  }

  private async calculatePlantHealthStatus(facilityId: string): Promise<any> {
    return {
      status: 'healthy',
      averageHealthScore: 85,
      growthStage: 'flowering',
      daysInStage: 28
    };
  }

  private calculateOverallHealth(subsystemStatuses: any[]): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    // Simple health calculation - in production this would be more sophisticated
    return 'good';
  }

  private async calculatePerformanceProjections(facilityId: string): Promise<any> {
    return {
      yieldProjection: 15.2,
      qualityProjection: 8.7,
      energyEfficiency: 2.8,
      roi: 23.5
    };
  }

  private async calculateAutomationMetrics(facilityId: string): Promise<any> {
    return {
      level: 'full',
      interventionsPerDay: 8,
      successRate: 94.2,
      userOverrides: 1
    };
  }

  // Placeholder helper methods
  private async validateConfiguration(config: AutomationConfig): Promise<void> {
    // Validate automation configuration
  }

  private async initializeDataCollection(facilityId: string): Promise<void> {
    // Initialize data collection subsystem
  }

  private async initializeEnvironmentalControl(config: AutomationConfig): Promise<void> {
    // Initialize environmental control
  }

  private async initializeSpectralOptimization(config: AutomationConfig): Promise<void> {
    // Initialize spectral optimization
  }

  private async initializeEnergyTracking(facilityId: string): Promise<void> {
    // Initialize energy tracking
  }

  private async initializePlantHealthMonitoring(config: AutomationConfig): Promise<void> {
    // Initialize plant health monitoring
  }

  private async storeAutomationConfig(config: AutomationConfig): Promise<void> {
    // Store configuration in database
  }

  private async sendNotification(facilityId: string, notification: any): Promise<void> {
    // Send notification to users
  }

  private async handleCriticalAlerts(facilityId: string, status: SystemStatus): Promise<void> {
    // Handle critical system alerts
  }

  private async updatePerformanceMetrics(facilityId: string, status: SystemStatus): Promise<void> {
    // Update performance metrics
  }

  private async checkOptimizationOpportunities(facilityId: string, config: AutomationConfig): Promise<void> {
    // Check for optimization opportunities
  }

  private async handleOrchestrationError(facilityId: string, error: any): Promise<void> {
    // Handle orchestration errors
  }

  private async cleanupSystemData(): Promise<void> {
    // Clean up old system data
  }

  private async getCurrentSpectralConditions(facilityId: string): Promise<any> {
    // Get current spectral conditions
    return {
      dli_total: 40,
      ppfd_average: 800,
      photoperiod_hours: 18,
      spectral_composition: {
        uv_a_percent: 2,
        violet_percent: 5,
        blue_percent: 18,
        cyan_percent: 8,
        green_percent: 12,
        yellow_percent: 7,
        red_percent: 45,
        far_red_percent: 3
      },
      light_quality_metrics: {
        red_far_red_ratio: 15,
        blue_green_ratio: 1.5,
        blue_red_ratio: 0.4,
        uniformity_coefficient: 0.85,
        canopy_penetration_index: 0.75
      },
      environmental_factors: {
        co2_ppm: 1000,
        vpd_kpa: 1.0,
        air_flow_rate: 0.5,
        nutrient_ec: 2.0,
        ph: 6.0,
        root_zone_temp: 21
      },
      plant_architecture: {
        lai: 3.0,
        canopy_height_cm: 100,
        plant_density_per_m2: 6.25,
        growth_stage: 'flowering',
        days_in_stage: 30
      }
    };
  }

  private initializeSystemMonitoring(): void {
    // Initialize system monitoring
  }

  // Public API methods
  public async getFacilityStatus(facilityId: string): Promise<SystemStatus | null> {
    return this.systemStatus.get(facilityId) || null;
  }

  public async getAllFacilityStatuses(): Promise<SystemStatus[]> {
    return Array.from(this.systemStatus.values());
  }

  public async updateAutomationConfig(facilityId: string, config: Partial<AutomationConfig>): Promise<void> {
    const currentConfig = this.activeFacilities.get(facilityId);
    if (currentConfig) {
      const updatedConfig = { ...currentConfig, ...config };
      this.activeFacilities.set(facilityId, updatedConfig);
      await this.storeAutomationConfig(updatedConfig);
    }
  }

  public async pauseAutomation(facilityId: string): Promise<void> {
    const config = this.activeFacilities.get(facilityId);
    if (config) {
      config.automationLevel = 'monitoring_only';
      this.activeFacilities.set(facilityId, config);
    }
  }

  public async resumeAutomation(facilityId: string): Promise<void> {
    const config = this.activeFacilities.get(facilityId);
    if (config) {
      config.automationLevel = 'full';
      this.activeFacilities.set(facilityId, config);
    }
  }

  public async emergencyShutdown(facilityId: string, reason: string): Promise<void> {
    
    // Stop all automation
    this.activeFacilities.delete(facilityId);
    
    // Send emergency shutdown commands
    await this.sendActuatorCommand(facilityId, 'all', { type: 'emergency_stop' });
    
    // Create critical alert
    await prisma.systemAlert.create({
      data: {
        type: 'EMERGENCY_SHUTDOWN',
        severity: 'critical',
        title: `Emergency shutdown: ${facilityId}`,
        description: reason,
        entityType: 'facility',
        entityId: facilityId
      }
    });
  }

  public disconnect(): void {
    if (this.orchestrationInterval) {
      clearInterval(this.orchestrationInterval);
    }
    
    this.dataPipeline.disconnect();
    this.spectralOptimizer.disconnect();
  }
}

export default MasterAutomationOrchestrator;