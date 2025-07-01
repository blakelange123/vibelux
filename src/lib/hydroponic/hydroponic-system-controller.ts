// Comprehensive Hydroponic System Integration
// Multi-system support for NFT, DWC, Aeroponics, Ebb & Flow with automated control

export interface HydroponicSystemConfig {
  systemId: string;
  facilityId: string;
  zoneId: string;
  systemType: 'nft' | 'dwc' | 'aeroponic' | 'ebb_flow' | 'drip' | 'flood_drain';
  capacity: number; // liters
  flowRate: number; // L/min
  cycleSettings: CycleSettings;
  nutrients: NutrientConfig;
  monitoring: MonitoringConfig;
  automation: AutomationConfig;
}

export interface CycleSettings {
  // NFT specific
  nftFlowRate?: number; // L/min
  nftSlope?: number; // degrees
  
  // Aeroponic specific
  mistingDuration?: number; // seconds
  mistingInterval?: number; // minutes
  dropletSize?: number; // microns
  pressure?: number; // PSI
  
  // Ebb & Flow specific
  floodDuration?: number; // minutes
  drainDuration?: number; // minutes
  floodFrequency?: number; // times per day
  
  // DWC specific
  oxygenationRate?: number; // L/min air flow
  waterChangeFrequency?: number; // days
  
  // General
  lightsCycleSync?: boolean;
  nightSettings?: CycleSettings;
}

export interface NutrientConfig {
  targetEC: number; // electrical conductivity (mS/cm)
  targetPH: number; // 5.5-6.5 optimal
  targetTDS: number; // total dissolved solids (ppm)
  targetDO: number; // dissolved oxygen (mg/L)
  
  // Nutrient ratios (NPK + micros)
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
  calcium: number; // ppm
  magnesium: number; // ppm
  sulfur: number; // ppm
  iron: number; // ppm
  micronutrients: { [element: string]: number };
  
  // Solution management
  concentrateRatio: number; // A:B ratio
  maxSolutionAge: number; // days
  changeThresholds: {
    ecDrift: number; // ±mS/cm
    phDrift: number; // ±pH units
    tdsDrift: number; // ±ppm
  };
}

export interface MonitoringConfig {
  sensors: {
    ph: boolean;
    ec: boolean;
    tds: boolean;
    dissolvedOxygen: boolean;
    temperature: boolean;
    waterLevel: boolean;
    flowRate: boolean;
    pressure: boolean;
  };
  
  samplingInterval: number; // minutes
  alertThresholds: {
    phMin: number;
    phMax: number;
    ecMin: number;
    ecMax: number;
    tempMin: number; // °C
    tempMax: number; // °C
    doMin: number; // mg/L
    lowWaterLevel: number; // %
    lowPressure: number; // PSI
  };
  
  dataLogging: boolean;
  remoteMonitoring: boolean;
}

export interface AutomationConfig {
  autoPhAdjustment: boolean;
  autoNutrientDosing: boolean;
  autoWaterRefill: boolean;
  autoSystemCleaning: boolean;
  emergencyShutoff: boolean;
  
  dosingPumps: {
    phUp: { enabled: boolean; maxDoseRate: number }; // mL/min
    phDown: { enabled: boolean; maxDoseRate: number };
    nutrientA: { enabled: boolean; maxDoseRate: number };
    nutrientB: { enabled: boolean; maxDoseRate: number };
    calmag: { enabled: boolean; maxDoseRate: number };
  };
  
  controlValves: {
    mainFlow: boolean;
    drain: boolean;
    refill: boolean;
    recirculation: boolean;
  };
}

export interface HydroponicMeasurement {
  timestamp: Date;
  systemId: string;
  
  // Water quality
  ph: number;
  ec: number; // electrical conductivity
  tds: number; // total dissolved solids
  dissolvedOxygen: number; // mg/L
  temperature: number; // °C
  
  // System metrics
  waterLevel: number; // %
  flowRate: number; // L/min
  pressure: number; // PSI
  cycleStatus: 'flooding' | 'draining' | 'misting' | 'flowing' | 'idle';
  
  // Root zone
  rootZoneTemp: number; // °C
  rootZoneOxygen: number; // mg/L
  rootHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  
  // Nutrient levels (estimated)
  nitrogenLevel: number; // ppm
  phosphorusLevel: number; // ppm
  potassiumLevel: number; // ppm
  
  // System status
  pumpStatus: 'running' | 'stopped' | 'maintenance';
  valvePositions: { [valve: string]: 'open' | 'closed' | 'partial' };
  alertsActive: string[];
}

export interface NutrientDosing {
  timestamp: Date;
  dosingType: 'ph_up' | 'ph_down' | 'nutrient_a' | 'nutrient_b' | 'calmag' | 'water';
  amount: number; // mL
  targetValue: number;
  preValue: number;
  postValue: number;
  success: boolean;
  reason: string;
}

export interface SystemMaintenance {
  type: 'cleaning' | 'calibration' | 'water_change' | 'filter_change' | 'inspection';
  scheduledDate: Date;
  completedDate?: Date;
  duration: number; // minutes
  notes: string;
  partsReplaced?: string[];
  nextMaintenanceDate: Date;
}

export interface RootZoneAnalysis {
  temperature: number; // °C
  oxygenLevel: number; // mg/L
  biofilmDetection: boolean;
  rootMassIndex: number; // 0-1
  rootColor: 'white' | 'cream' | 'brown' | 'black';
  rootHealthScore: number; // 0-100
  pythiumRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export class HydroponicSystemController {
  private config: HydroponicSystemConfig;
  private measurements: HydroponicMeasurement[] = [];
  private dosingHistory: NutrientDosing[] = [];
  private maintenanceSchedule: SystemMaintenance[] = [];
  private isRunning: boolean = false;
  private currentCycle: any = null;
  
  constructor(config: HydroponicSystemConfig) {
    this.config = config;
    this.initializeSystem();
  }

  private initializeSystem(): void {
    // Initialize based on system type
    switch (this.config.systemType) {
      case 'nft':
        this.initializeNFT();
        break;
      case 'dwc':
        this.initializeDWC();
        break;
      case 'aeroponic':
        this.initializeAeroponic();
        break;
      case 'ebb_flow':
        this.initializeEbbFlow();
        break;
      default:
        throw new Error(`Unsupported system type: ${this.config.systemType}`);
    }
  }

  private initializeNFT(): void {
    // Set up NFT-specific parameters
    const nftDefaults = {
      flowRate: 2, // L/min
      slope: 1, // degree
      channelDepth: 5, // cm
      optimalFilmThickness: 2 // mm
    };
    
    this.config.cycleSettings = {
      ...nftDefaults,
      ...this.config.cycleSettings
    };
  }

  private initializeDWC(): void {
    // Deep Water Culture setup
    const dwcDefaults = {
      oxygenationRate: 5, // L/min air
      waterChangeFrequency: 7, // days
      optimalWaterDepth: 15, // cm
      airStoneSize: 'large'
    };
    
    this.config.cycleSettings = {
      ...dwcDefaults,
      ...this.config.cycleSettings
    };
  }

  private initializeAeroponic(): void {
    // Aeroponic system setup
    const aeroDefaults = {
      mistingDuration: 5, // seconds
      mistingInterval: 5, // minutes
      dropletSize: 50, // microns
      pressure: 80, // PSI
      nozzleSpacing: 30 // cm
    };
    
    this.config.cycleSettings = {
      ...aeroDefaults,
      ...this.config.cycleSettings
    };
  }

  private initializeEbbFlow(): void {
    // Ebb & Flow setup
    const ebbFlowDefaults = {
      floodDuration: 15, // minutes
      drainDuration: 45, // minutes
      floodFrequency: 4, // times per day
      maxWaterLevel: 80 // % of container height
    };
    
    this.config.cycleSettings = {
      ...ebbFlowDefaults,
      ...this.config.cycleSettings
    };
  }

  // Main control loop
  public async updateSystemControl(): Promise<HydroponicMeasurement> {
    const measurement = await this.takeMeasurement();
    
    // System-specific control logic
    switch (this.config.systemType) {
      case 'nft':
        await this.controlNFT(measurement);
        break;
      case 'dwc':
        await this.controlDWC(measurement);
        break;
      case 'aeroponic':
        await this.controlAeroponic(measurement);
        break;
      case 'ebb_flow':
        await this.controlEbbFlow(measurement);
        break;
    }
    
    // Universal controls
    await this.controlNutrients(measurement);
    await this.controlPH(measurement);
    await this.monitorRootZone(measurement);
    
    // Check for alerts
    this.checkSystemAlerts(measurement);
    
    this.measurements.push(measurement);
    return measurement;
  }

  private async takeMeasurement(): Promise<HydroponicMeasurement> {
    // Simulate sensor readings (in real implementation, read from actual sensors)
    const baseTemp = 22 + Math.random() * 4; // 22-26°C
    const basePh = this.config.nutrients.targetPH + (Math.random() - 0.5) * 0.4;
    const baseEc = this.config.nutrients.targetEC + (Math.random() - 0.5) * 0.2;
    
    return {
      timestamp: new Date(),
      systemId: this.config.systemId,
      ph: Math.max(4.0, Math.min(8.0, basePh)),
      ec: Math.max(0.5, Math.min(3.0, baseEc)),
      tds: baseEc * 640, // Convert EC to TDS
      dissolvedOxygen: Math.max(4, Math.min(12, 8 + Math.random() * 2)),
      temperature: baseTemp,
      waterLevel: Math.max(10, Math.min(100, 75 + Math.random() * 20)),
      flowRate: this.config.flowRate + (Math.random() - 0.5) * 0.2,
      pressure: this.config.systemType === 'aeroponic' ? 
        (this.config.cycleSettings.pressure || 80) + (Math.random() - 0.5) * 10 : 0,
      cycleStatus: this.getCurrentCycleStatus(),
      rootZoneTemp: baseTemp - 1 + Math.random() * 2,
      rootZoneOxygen: Math.max(4, Math.min(10, 7 + Math.random() * 2)),
      rootHealth: this.assessRootHealth(baseTemp, basePh, baseEc),
      nitrogenLevel: this.config.nutrients.nitrogen + (Math.random() - 0.5) * 20,
      phosphorusLevel: this.config.nutrients.phosphorus + (Math.random() - 0.5) * 10,
      potassiumLevel: this.config.nutrients.potassium + (Math.random() - 0.5) * 30,
      pumpStatus: this.isRunning ? 'running' : 'stopped',
      valvePositions: this.getValvePositions(),
      alertsActive: []
    };
  }

  private getCurrentCycleStatus(): 'flooding' | 'draining' | 'misting' | 'flowing' | 'idle' {
    if (!this.isRunning) return 'idle';
    
    switch (this.config.systemType) {
      case 'nft':
        return 'flowing';
      case 'dwc':
        return 'idle'; // Continuous operation
      case 'aeroponic':
        return 'misting'; // Simplified
      case 'ebb_flow':
        return Math.random() > 0.5 ? 'flooding' : 'draining';
      default:
        return 'idle';
    }
  }

  private assessRootHealth(temp: number, ph: number, ec: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    let score = 100;
    
    // Temperature assessment
    if (temp < 18 || temp > 28) score -= 20;
    else if (temp < 20 || temp > 26) score -= 10;
    
    // pH assessment
    if (ph < 5.0 || ph > 7.0) score -= 25;
    else if (ph < 5.5 || ph > 6.8) score -= 10;
    
    // EC assessment
    if (ec < 0.8 || ec > 2.5) score -= 15;
    else if (ec < 1.0 || ec > 2.2) score -= 5;
    
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  private getValvePositions(): { [valve: string]: 'open' | 'closed' | 'partial' } {
    return {
      mainFlow: this.isRunning ? 'open' : 'closed',
      drain: 'closed',
      refill: 'closed',
      recirculation: this.isRunning ? 'open' : 'closed'
    };
  }

  // System-specific control methods
  private async controlNFT(measurement: HydroponicMeasurement): Promise<void> {
    const targetFlow = this.config.cycleSettings.nftFlowRate || 2;
    const flowDeviation = Math.abs(measurement.flowRate - targetFlow);
    
    if (flowDeviation > 0.3) {
      await this.adjustFlowRate(targetFlow);
    }
    
    // Check for channel blockages
    if (measurement.flowRate < targetFlow * 0.7) {
      measurement.alertsActive.push('Low flow rate - possible blockage');
    }
  }

  private async controlDWC(measurement: HydroponicMeasurement): Promise<void> {
    const targetDO = this.config.nutrients.targetDO;
    
    if (measurement.dissolvedOxygen < targetDO * 0.8) {
      await this.increaseOxygenation();
      measurement.alertsActive.push('Low dissolved oxygen - increasing aeration');
    }
    
    // Check water level
    if (measurement.waterLevel < 50) {
      await this.refillWater();
      measurement.alertsActive.push('Low water level - refilling');
    }
  }

  private async controlAeroponic(measurement: HydroponicMeasurement): Promise<void> {
    const { mistingDuration, mistingInterval, pressure } = this.config.cycleSettings;
    
    // Check pressure
    if (measurement.pressure < (pressure || 80) * 0.9) {
      await this.adjustPressure(pressure || 80);
      measurement.alertsActive.push('Low pressure - adjusting pump');
    }
    
    // Execute misting cycle
    if (this.shouldMist()) {
      await this.executeMistingCycle(mistingDuration || 5);
    }
  }

  private async controlEbbFlow(measurement: HydroponicMeasurement): Promise<void> {
    const { floodDuration, drainDuration, floodFrequency } = this.config.cycleSettings;
    
    // Check if it's time to flood
    if (this.shouldFlood()) {
      await this.startFloodCycle(floodDuration || 15);
    }
    
    // Check if it's time to drain
    if (this.shouldDrain()) {
      await this.startDrainCycle(drainDuration || 45);
    }
  }

  // Nutrient and pH control
  private async controlNutrients(measurement: HydroponicMeasurement): Promise<void> {
    const { targetEC, changeThresholds } = this.config.nutrients;
    const ecDeviation = Math.abs(measurement.ec - targetEC);
    
    if (ecDeviation > changeThresholds.ecDrift) {
      if (measurement.ec < targetEC) {
        await this.doseNutrients('nutrient_a', this.calculateNutrientDose(measurement.ec, targetEC));
      } else {
        await this.diluteSolution();
      }
    }
  }

  private async controlPH(measurement: HydroponicMeasurement): Promise<void> {
    const { targetPH, changeThresholds } = this.config.nutrients;
    const phDeviation = Math.abs(measurement.ph - targetPH);
    
    if (phDeviation > changeThresholds.phDrift) {
      if (measurement.ph < targetPH) {
        const dose = this.calculatePHDose(measurement.ph, targetPH);
        await this.doseNutrients('ph_up', dose);
      } else {
        const dose = this.calculatePHDose(measurement.ph, targetPH);
        await this.doseNutrients('ph_down', dose);
      }
    }
  }

  private async monitorRootZone(measurement: HydroponicMeasurement): Promise<void> {
    // Root zone temperature control
    if (measurement.rootZoneTemp > 25) {
      await this.activateRootCooling();
      measurement.alertsActive.push('Root zone overheating - cooling activated');
    }
    
    // Oxygen monitoring
    if (measurement.rootZoneOxygen < 6) {
      await this.increaseRootOxygenation();
      measurement.alertsActive.push('Low root zone oxygen');
    }
  }

  // Dosing methods
  private async doseNutrients(type: string, amount: number): Promise<void> {
    const dosing: NutrientDosing = {
      timestamp: new Date(),
      dosingType: type as any,
      amount,
      targetValue: this.getTargetValue(type),
      preValue: this.getCurrentValue(type),
      postValue: 0, // Will be measured after dosing
      success: true,
      reason: `Automatic ${type} adjustment`
    };
    
    // Simulate dosing delay
    await new Promise(resolve => setTimeout(resolve, amount * 100)); // 100ms per mL
    
    dosing.postValue = this.getCurrentValue(type);
    dosing.success = Math.abs(dosing.postValue - dosing.targetValue) < 0.1;
    
    this.dosingHistory.push(dosing);
    
    console.log(`Dosed ${amount}mL of ${type}`);
  }

  private calculateNutrientDose(currentEC: number, targetEC: number): number {
    const deficit = targetEC - currentEC;
    const systemVolume = this.config.capacity;
    
    // Rough calculation: 1mL concentrate per 10L increases EC by 0.1
    return Math.abs(deficit) * systemVolume / 10;
  }

  private calculatePHDose(currentPH: number, targetPH: number): number {
    const difference = Math.abs(currentPH - targetPH);
    const systemVolume = this.config.capacity;
    
    // Rough calculation: 1mL pH solution per 50L changes pH by 0.1
    return difference * systemVolume / 50;
  }

  private getTargetValue(type: string): number {
    switch (type) {
      case 'ph_up':
      case 'ph_down':
        return this.config.nutrients.targetPH;
      case 'nutrient_a':
      case 'nutrient_b':
        return this.config.nutrients.targetEC;
      default:
        return 0;
    }
  }

  private getCurrentValue(type: string): number {
    const lastMeasurement = this.measurements[this.measurements.length - 1];
    if (!lastMeasurement) return 0;
    
    switch (type) {
      case 'ph_up':
      case 'ph_down':
        return lastMeasurement.ph;
      case 'nutrient_a':
      case 'nutrient_b':
        return lastMeasurement.ec;
      default:
        return 0;
    }
  }

  // System operation methods
  private async adjustFlowRate(targetRate: number): Promise<void> {
    console.log(`Adjusting flow rate to ${targetRate} L/min`);
    // In real implementation, this would control pump speed
  }

  private async increaseOxygenation(): Promise<void> {
    console.log('Increasing oxygenation rate');
    // Control air pumps/venturi systems
  }

  private async refillWater(): Promise<void> {
    console.log('Refilling water reservoir');
    // Control refill valves
  }

  private async adjustPressure(targetPressure: number): Promise<void> {
    console.log(`Adjusting pressure to ${targetPressure} PSI`);
    // Control pressure pumps
  }

  private async executeMistingCycle(duration: number): Promise<void> {
    console.log(`Starting misting cycle for ${duration} seconds`);
    // Control misting nozzles
  }

  private async startFloodCycle(duration: number): Promise<void> {
    console.log(`Starting flood cycle for ${duration} minutes`);
    // Open flood valves
  }

  private async startDrainCycle(duration: number): Promise<void> {
    console.log(`Starting drain cycle for ${duration} minutes`);
    // Open drain valves
  }

  private async diluteSolution(): Promise<void> {
    console.log('Diluting nutrient solution');
    // Add fresh water to reduce EC
  }

  private async activateRootCooling(): Promise<void> {
    console.log('Activating root zone cooling');
    // Control chiller or cooling fans
  }

  private async increaseRootOxygenation(): Promise<void> {
    console.log('Increasing root zone oxygenation');
    // Boost air pumps in root zone
  }

  // Timing and scheduling methods
  private shouldMist(): boolean {
    // Check last misting time vs interval
    const interval = this.config.cycleSettings.mistingInterval || 5;
    const lastMisting = this.getLastCycleTime('misting');
    const timeSince = (Date.now() - lastMisting) / (1000 * 60); // minutes
    
    return timeSince >= interval;
  }

  private shouldFlood(): boolean {
    const frequency = this.config.cycleSettings.floodFrequency || 4;
    const minutesBetween = (24 * 60) / frequency;
    const lastFlood = this.getLastCycleTime('flooding');
    const timeSince = (Date.now() - lastFlood) / (1000 * 60);
    
    return timeSince >= minutesBetween;
  }

  private shouldDrain(): boolean {
    const duration = this.config.cycleSettings.floodDuration || 15;
    const lastFlood = this.getLastCycleTime('flooding');
    const timeSince = (Date.now() - lastFlood) / (1000 * 60);
    
    return timeSince >= duration;
  }

  private getLastCycleTime(cycleType: string): number {
    // Return timestamp of last cycle of this type
    return Date.now() - (Math.random() * 10 * 60 * 1000); // Random time in last 10 minutes
  }

  // Alert and maintenance methods
  private checkSystemAlerts(measurement: HydroponicMeasurement): void {
    const { alertThresholds } = this.config.monitoring;
    
    if (measurement.ph < alertThresholds.phMin || measurement.ph > alertThresholds.phMax) {
      measurement.alertsActive.push(`pH out of range: ${measurement.ph.toFixed(2)}`);
    }
    
    if (measurement.ec < alertThresholds.ecMin || measurement.ec > alertThresholds.ecMax) {
      measurement.alertsActive.push(`EC out of range: ${measurement.ec.toFixed(2)}`);
    }
    
    if (measurement.temperature < alertThresholds.tempMin || measurement.temperature > alertThresholds.tempMax) {
      measurement.alertsActive.push(`Temperature out of range: ${measurement.temperature.toFixed(1)}°C`);
    }
    
    if (measurement.dissolvedOxygen < alertThresholds.doMin) {
      measurement.alertsActive.push(`Low dissolved oxygen: ${measurement.dissolvedOxygen.toFixed(1)} mg/L`);
    }
    
    if (measurement.waterLevel < alertThresholds.lowWaterLevel) {
      measurement.alertsActive.push(`Low water level: ${measurement.waterLevel.toFixed(0)}%`);
    }
    
    if (this.config.systemType === 'aeroponic' && measurement.pressure < alertThresholds.lowPressure) {
      measurement.alertsActive.push(`Low pressure: ${measurement.pressure.toFixed(0)} PSI`);
    }
  }

  public scheduleMaintenence(maintenance: Omit<SystemMaintenance, 'nextMaintenanceDate'>): void {
    const nextDate = new Date(maintenance.scheduledDate);
    
    // Calculate next maintenance based on type
    switch (maintenance.type) {
      case 'cleaning':
        nextDate.setDate(nextDate.getDate() + 14); // Every 2 weeks
        break;
      case 'calibration':
        nextDate.setDate(nextDate.getDate() + 30); // Monthly
        break;
      case 'water_change':
        nextDate.setDate(nextDate.getDate() + 7); // Weekly
        break;
      case 'filter_change':
        nextDate.setDate(nextDate.getDate() + 90); // Quarterly
        break;
      case 'inspection':
        nextDate.setDate(nextDate.getDate() + 7); // Weekly
        break;
    }
    
    this.maintenanceSchedule.push({
      ...maintenance,
      nextMaintenanceDate: nextDate
    });
  }

  // Analysis and reporting methods
  public analyzeRootZone(): RootZoneAnalysis {
    const latestMeasurement = this.measurements[this.measurements.length - 1];
    if (!latestMeasurement) {
      throw new Error('No measurements available for root zone analysis');
    }
    
    const recommendations: string[] = [];
    let pythiumRisk: 'low' | 'medium' | 'high' = 'low';
    
    // Temperature analysis
    if (latestMeasurement.rootZoneTemp > 24) {
      recommendations.push('Reduce root zone temperature below 24°C');
      pythiumRisk = latestMeasurement.rootZoneTemp > 26 ? 'high' : 'medium';
    }
    
    // Oxygen analysis
    if (latestMeasurement.rootZoneOxygen < 6) {
      recommendations.push('Increase dissolved oxygen levels');
      pythiumRisk = 'high';
    }
    
    // pH analysis
    if (latestMeasurement.ph > 6.5) {
      recommendations.push('Lower pH to optimal range (5.5-6.2)');
    }
    
    return {
      temperature: latestMeasurement.rootZoneTemp,
      oxygenLevel: latestMeasurement.rootZoneOxygen,
      biofilmDetection: Math.random() > 0.8, // Simplified detection
      rootMassIndex: Math.min(latestMeasurement.ec / 2, 1), // Simplified calculation
      rootColor: latestMeasurement.rootHealth === 'excellent' ? 'white' : 
                 latestMeasurement.rootHealth === 'good' ? 'cream' : 'brown',
      rootHealthScore: this.calculateRootHealthScore(latestMeasurement),
      pythiumRisk,
      recommendations
    };
  }

  private calculateRootHealthScore(measurement: HydroponicMeasurement): number {
    let score = 100;
    
    // Temperature penalty
    if (measurement.rootZoneTemp > 24) score -= 15;
    if (measurement.rootZoneTemp > 26) score -= 25;
    
    // Oxygen penalty
    if (measurement.rootZoneOxygen < 6) score -= 20;
    if (measurement.rootZoneOxygen < 4) score -= 40;
    
    // pH penalty
    if (measurement.ph < 5.0 || measurement.ph > 7.0) score -= 20;
    if (measurement.ph < 4.5 || measurement.ph > 7.5) score -= 40;
    
    return Math.max(0, score);
  }

  // Public API methods
  public startSystem(): void {
    this.isRunning = true;
    console.log(`Hydroponic system ${this.config.systemId} started`);
  }

  public stopSystem(): void {
    this.isRunning = false;
    console.log(`Hydroponic system ${this.config.systemId} stopped`);
  }

  public getSystemStatus() {
    const latestMeasurement = this.measurements[this.measurements.length - 1];
    return {
      isRunning: this.isRunning,
      systemType: this.config.systemType,
      latestMeasurement,
      activeAlerts: latestMeasurement?.alertsActive || [],
      recentDosing: this.dosingHistory.slice(-5),
      nextMaintenance: this.getNextMaintenance(),
      config: this.config
    };
  }

  public getRecentMeasurements(hours: number = 24): HydroponicMeasurement[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.measurements.filter(m => m.timestamp >= cutoff);
  }

  public getDosingHistory(hours: number = 24): NutrientDosing[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.dosingHistory.filter(d => d.timestamp >= cutoff);
  }

  public updateConfig(newConfig: Partial<HydroponicSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log(`Configuration updated for system ${this.config.systemId}`);
  }

  private getNextMaintenance(): SystemMaintenance | null {
    const upcoming = this.maintenanceSchedule
      .filter(m => !m.completedDate && m.scheduledDate > new Date())
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
    
    return upcoming[0] || null;
  }

  public generateSystemReport(): any {
    const recentMeasurements = this.getRecentMeasurements(24);
    const recentDosing = this.getDosingHistory(24);
    
    return {
      systemOverview: {
        systemType: this.config.systemType,
        capacity: this.config.capacity,
        uptime: this.isRunning ? '24h' : '0h',
        efficiency: this.calculateSystemEfficiency(recentMeasurements)
      },
      waterQuality: this.analyzeWaterQuality(recentMeasurements),
      nutrientManagement: this.analyzeNutrientManagement(recentDosing),
      rootZoneHealth: this.analyzeRootZone(),
      maintenanceStatus: this.getMaintenanceStatus(),
      recommendations: this.generateSystemRecommendations(recentMeasurements)
    };
  }

  private calculateSystemEfficiency(measurements: HydroponicMeasurement[]): number {
    if (measurements.length === 0) return 0;
    
    let efficiency = 100;
    
    // Reduce efficiency for out-of-range values
    measurements.forEach(m => {
      if (m.alertsActive.length > 0) efficiency -= 5;
      if (m.rootHealth === 'poor' || m.rootHealth === 'critical') efficiency -= 10;
    });
    
    return Math.max(0, efficiency);
  }

  private analyzeWaterQuality(measurements: HydroponicMeasurement[]): any {
    if (measurements.length === 0) return null;
    
    const latest = measurements[measurements.length - 1];
    const stability = this.calculateStability(measurements);
    
    return {
      current: {
        ph: latest.ph,
        ec: latest.ec,
        tds: latest.tds,
        temperature: latest.temperature,
        dissolvedOxygen: latest.dissolvedOxygen
      },
      stability: {
        ph: stability.ph,
        ec: stability.ec,
        temperature: stability.temperature
      },
      trends: this.calculateTrends(measurements)
    };
  }

  private calculateStability(measurements: HydroponicMeasurement[]): any {
    if (measurements.length < 2) return { ph: 1, ec: 1, temperature: 1 };
    
    const phVariance = this.calculateVariance(measurements.map(m => m.ph));
    const ecVariance = this.calculateVariance(measurements.map(m => m.ec));
    const tempVariance = this.calculateVariance(measurements.map(m => m.temperature));
    
    return {
      ph: Math.max(0, 1 - phVariance),
      ec: Math.max(0, 1 - ecVariance / 0.5),
      temperature: Math.max(0, 1 - tempVariance / 2)
    };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b) / values.length;
  }

  private calculateTrends(measurements: HydroponicMeasurement[]): any {
    if (measurements.length < 10) return null;
    
    const recent = measurements.slice(-5);
    const older = measurements.slice(-10, -5);
    
    const recentAvgPh = recent.reduce((sum, m) => sum + m.ph, 0) / recent.length;
    const olderAvgPh = older.reduce((sum, m) => sum + m.ph, 0) / older.length;
    
    const recentAvgEc = recent.reduce((sum, m) => sum + m.ec, 0) / recent.length;
    const olderAvgEc = older.reduce((sum, m) => sum + m.ec, 0) / older.length;
    
    return {
      ph: recentAvgPh - olderAvgPh,
      ec: recentAvgEc - olderAvgEc,
      direction: {
        ph: recentAvgPh > olderAvgPh ? 'increasing' : 'decreasing',
        ec: recentAvgEc > olderAvgEc ? 'increasing' : 'decreasing'
      }
    };
  }

  private analyzeNutrientManagement(dosings: NutrientDosing[]): any {
    return {
      totalDosings: dosings.length,
      successRate: dosings.filter(d => d.success).length / dosings.length,
      dosingTypes: this.groupDosingsByType(dosings),
      averageDoseSize: dosings.reduce((sum, d) => sum + d.amount, 0) / dosings.length
    };
  }

  private groupDosingsByType(dosings: NutrientDosing[]): any {
    const groups = new Map<string, number>();
    dosings.forEach(d => {
      groups.set(d.dosingType, (groups.get(d.dosingType) || 0) + 1);
    });
    return Object.fromEntries(groups);
  }

  private getMaintenanceStatus(): any {
    const overdue = this.maintenanceSchedule.filter(m => 
      !m.completedDate && m.scheduledDate < new Date()
    );
    
    const upcoming = this.maintenanceSchedule.filter(m =>
      !m.completedDate && 
      m.scheduledDate > new Date() &&
      m.scheduledDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
    
    return {
      overdueCount: overdue.length,
      upcomingCount: upcoming.length,
      lastCompleted: this.getLastCompletedMaintenance(),
      nextScheduled: this.getNextMaintenance()
    };
  }

  private getLastCompletedMaintenance(): SystemMaintenance | null {
    const completed = this.maintenanceSchedule
      .filter(m => m.completedDate)
      .sort((a, b) => (b.completedDate?.getTime() || 0) - (a.completedDate?.getTime() || 0));
    
    return completed[0] || null;
  }

  private generateSystemRecommendations(measurements: HydroponicMeasurement[]): string[] {
    const recommendations: string[] = [];
    
    if (measurements.length === 0) {
      recommendations.push('Start monitoring to generate recommendations');
      return recommendations;
    }
    
    const latest = measurements[measurements.length - 1];
    
    // Root health recommendations
    if (latest.rootHealth === 'poor' || latest.rootHealth === 'critical') {
      recommendations.push('Immediate attention needed for root health');
    }
    
    // Maintenance recommendations
    const nextMaintenance = this.getNextMaintenance();
    if (nextMaintenance && nextMaintenance.scheduledDate < new Date(Date.now() + 24 * 60 * 60 * 1000)) {
      recommendations.push(`Upcoming maintenance: ${nextMaintenance.type}`);
    }
    
    // Alert-based recommendations
    if (latest.alertsActive.length > 0) {
      recommendations.push('Address active system alerts');
    }
    
    return recommendations;
  }
}