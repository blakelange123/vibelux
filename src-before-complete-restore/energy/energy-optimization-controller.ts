// Energy Optimization Controller with Demand Response
// Advanced energy management for commercial plant factories with grid integration

export interface EnergyOptimizationConfig {
  facilityId: string;
  utilityProvider: string;
  utilityAccountId: string;
  demandResponseProgram: string;
  peakDemandLimit: number; // kW
  energyBudget: number; // kWh per day
  costTarget: number; // $ per day
  
  // Rate schedules
  electricityRates: ElectricityRateSchedule;
  demandCharges: DemandChargeSchedule;
  
  // Optimization settings
  priorityLoads: string[]; // Critical systems that can't be curtailed
  curtailableLoads: CurtailableLoad[];
  energyStorage: EnergyStorageConfig;
  renewableGeneration: RenewableGenerationConfig;
  
  // Grid integration
  demandResponseSettings: DemandResponseConfig;
  gridServicesParticipation: GridServicesConfig;
}

export interface ElectricityRateSchedule {
  timeOfUseRates: {
    offPeak: { rate: number; hours: string[] }; // $/kWh
    midPeak: { rate: number; hours: string[] };
    onPeak: { rate: number; hours: string[] };
  };
  seasonalRates: {
    summer: { multiplier: number; months: number[] };
    winter: { multiplier: number; months: number[] };
  };
  realTimePricing: boolean;
  criticalPeakPricing: boolean;
}

export interface DemandChargeSchedule {
  monthlyDemandCharge: number; // $/kW
  coincidentPeakCharge: number; // $/kW
  demandRatchet: number; // % of peak demand
  demandWindow: number; // minutes for demand calculation
}

export interface CurtailableLoad {
  loadId: string;
  loadType: 'lighting' | 'hvac' | 'pumps' | 'fans' | 'processing';
  maxCurtailment: number; // % reduction possible
  curtailmentCost: number; // $/kWh lost production value
  responseTime: number; // seconds to respond
  minRunTime: number; // minimum minutes between curtailments
  priority: 'low' | 'medium' | 'high'; // Curtailment priority
}

export interface EnergyStorageConfig {
  batteryCapacity: number; // kWh
  maxChargeRate: number; // kW
  maxDischargeRate: number; // kW
  roundTripEfficiency: number; // %
  depthOfDischarge: number; // % max usable capacity
  cycleLife: number; // number of cycles
  degradationRate: number; // % per year
}

export interface RenewableGenerationConfig {
  solarCapacity: number; // kW
  windCapacity: number; // kW
  forecastHorizon: number; // hours
  curtailmentAllowed: boolean;
  gridTieEnabled: boolean;
  netMeteringRate: number; // $/kWh
}

export interface DemandResponseConfig {
  participationLevel: 'none' | 'voluntary' | 'mandatory';
  notificationMinutes: number; // minutes advance notice
  maxCurtailmentDuration: number; // hours
  maxCurtailmentPerDay: number; // kW
  incentiveRate: number; // $/kWh curtailed
  penaltyRate: number; // $/kWh if don't comply
}

export interface GridServicesConfig {
  frequencyRegulation: boolean;
  voltageSupport: boolean;
  peakShaving: boolean;
  loadFollowing: boolean;
  blackStart: boolean;
  revenueStreams: string[];
}

export interface EnergyMeasurement {
  timestamp: Date;
  facilityId: string;
  
  // Real-time consumption
  totalDemand: number; // kW
  activePower: number; // kW
  reactivePower: number; // kVAR
  powerFactor: number;
  frequency: number; // Hz
  voltage: number; // V
  
  // Load breakdown
  lightingLoad: number; // kW
  hvacLoad: number; // kW
  pumpLoad: number; // kW
  processLoad: number; // kW
  auxiliaryLoad: number; // kW
  
  // Generation and storage
  solarGeneration: number; // kW
  windGeneration: number; // kW
  batteryCharge: number; // kWh remaining
  batteryPower: number; // kW (+ charging, - discharging)
  
  // Grid interaction
  gridImport: number; // kW from grid
  gridExport: number; // kW to grid
  netDemand: number; // kW net from grid
  
  // Cost metrics
  instantaneousRate: number; // $/kWh current rate
  cumulativeCost: number; // $ today
  peakDemandToday: number; // kW highest today
  
  // Environmental
  carbonIntensity: number; // gCO2/kWh
  renewablePercentage: number; // % renewable
}

export interface DemandResponseEvent {
  eventId: string;
  timestamp: Date;
  eventType: 'peak_shaving' | 'load_shedding' | 'frequency_regulation' | 'voltage_support';
  startTime: Date;
  endTime: Date;
  targetReduction: number; // kW
  actualReduction: number; // kW
  participationRate: number; // %
  incentiveEarned: number; // $
  complianceStatus: 'compliant' | 'partial' | 'non_compliant';
  curtailedLoads: string[];
}

export interface EnergyForecast {
  timestamp: Date;
  forecastHours: number;
  
  // Load forecasts
  expectedDemand: number[]; // kW per hour
  lightingSchedule: number[]; // kW per hour
  hvacLoad: number[]; // kW per hour
  
  // Generation forecasts
  solarForecast: number[]; // kW per hour
  windForecast: number[]; // kW per hour
  
  // Price forecasts
  electricityPrices: number[]; // $/kWh per hour
  demandCharges: number[]; // $/kW for peak periods
  
  // Grid conditions
  gridStressLevel: ('normal' | 'elevated' | 'high' | 'critical')[];
  drEventProbability: number[]; // % probability per hour
}

export interface OptimizationResult {
  timestamp: Date;
  optimizationHorizon: number; // hours
  
  // Optimal dispatch
  lightingSchedule: { hour: number; power: number; dimming: number }[];
  hvacSchedule: { hour: number; power: number; setpoint: number }[];
  batterySchedule: { hour: number; power: number; soc: number }[];
  
  // Cost optimization
  projectedCost: number; // $ for optimization period
  costSavings: number; // $ vs baseline
  peakDemandReduction: number; // kW
  
  // Environmental benefits
  carbonReduction: number; // kg CO2
  renewableUtilization: number; // %
  
  // Demand response
  drParticipation: boolean;
  drRevenue: number; // $
  curtailmentSchedule: { hour: number; load: string; reduction: number }[];
}

export class EnergyOptimizationController {
  private config: EnergyOptimizationConfig;
  private measurements: EnergyMeasurement[] = [];
  private drEvents: DemandResponseEvent[] = [];
  private forecasts: EnergyForecast[] = [];
  private optimizationResults: OptimizationResult[] = [];
  private isOptimizing: boolean = false;
  
  constructor(config: EnergyOptimizationConfig) {
    this.config = config;
    this.initializeOptimization();
  }

  private initializeOptimization(): void {
    // Initialize optimization algorithms and models
    console.log(`Energy optimization initialized for facility ${this.config.facilityId}`);
  }

  // Main optimization control loop
  public async performEnergyOptimization(): Promise<OptimizationResult> {
    if (this.isOptimizing) {
      throw new Error('Optimization already in progress');
    }
    
    this.isOptimizing = true;
    
    try {
      // Get current measurements
      const currentMeasurement = await this.getCurrentMeasurement();
      
      // Generate forecasts
      const forecast = await this.generateEnergyForecast();
      
      // Run optimization algorithm
      const optimization = await this.runOptimizationAlgorithm(currentMeasurement, forecast);
      
      // Implement optimal dispatch
      await this.implementOptimalDispatch(optimization);
      
      // Store results
      this.optimizationResults.push(optimization);
      
      return optimization;
      
    } finally {
      this.isOptimizing = false;
    }
  }

  private async getCurrentMeasurement(): Promise<EnergyMeasurement> {
    // Simulate real-time energy measurement
    const baseLoad = 500; // kW base load
    const timeOfDay = new Date().getHours();
    const lightingMultiplier = timeOfDay >= 6 && timeOfDay <= 18 ? 1.0 : 0.3;
    const hvacMultiplier = 0.8 + Math.random() * 0.4;
    
    const lightingLoad = 200 * lightingMultiplier + Math.random() * 50;
    const hvacLoad = 150 * hvacMultiplier + Math.random() * 30;
    const pumpLoad = 50 + Math.random() * 20;
    const processLoad = 100 + Math.random() * 30;
    const auxiliaryLoad = 30 + Math.random() * 10;
    
    const totalDemand = lightingLoad + hvacLoad + pumpLoad + processLoad + auxiliaryLoad;
    
    // Solar generation (simplified model)
    const solarGeneration = this.calculateSolarGeneration();
    const windGeneration = this.calculateWindGeneration();
    
    // Battery state
    const batteryCharge = this.config.energyStorage.batteryCapacity * 0.7; // 70% charge
    const batteryPower = Math.random() * 20 - 10; // -10 to +10 kW
    
    const netDemand = totalDemand - solarGeneration - windGeneration + batteryPower;
    const gridImport = Math.max(0, netDemand);
    const gridExport = Math.max(0, -netDemand);
    
    const currentRate = this.getCurrentElectricityRate();
    const cumulativeCost = this.calculateCumulativeCost();
    const peakDemandToday = this.getTodaysPeakDemand();
    
    const measurement: EnergyMeasurement = {
      timestamp: new Date(),
      facilityId: this.config.facilityId,
      totalDemand,
      activePower: totalDemand,
      reactivePower: totalDemand * 0.1, // 10% reactive power
      powerFactor: 0.95,
      frequency: 60.0 + (Math.random() - 0.5) * 0.2,
      voltage: 480 + Math.random() * 10,
      lightingLoad,
      hvacLoad,
      pumpLoad,
      processLoad,
      auxiliaryLoad,
      solarGeneration,
      windGeneration,
      batteryCharge,
      batteryPower,
      gridImport,
      gridExport,
      netDemand,
      instantaneousRate: currentRate,
      cumulativeCost,
      peakDemandToday,
      carbonIntensity: 400 + Math.random() * 200, // gCO2/kWh
      renewablePercentage: ((solarGeneration + windGeneration) / totalDemand) * 100
    };
    
    this.measurements.push(measurement);
    return measurement;
  }

  private calculateSolarGeneration(): number {
    const hour = new Date().getHours();
    const solarCapacity = this.config.renewableGeneration.solarCapacity;
    
    if (hour < 6 || hour > 18) return 0;
    
    // Simplified solar production curve
    const peakHour = 12;
    const hoursFromPeak = Math.abs(hour - peakHour);
    const efficiency = Math.max(0, 1 - (hoursFromPeak / 6));
    
    return solarCapacity * efficiency * (0.8 + Math.random() * 0.4); // Weather variability
  }

  private calculateWindGeneration(): number {
    const windCapacity = this.config.renewableGeneration.windCapacity;
    const windSpeed = 5 + Math.random() * 15; // 5-20 mph
    
    if (windSpeed < 7) return 0; // Cut-in speed
    if (windSpeed > 25) return 0; // Cut-out speed
    
    const efficiency = Math.min((windSpeed - 7) / 13, 1); // Linear between 7-20 mph
    return windCapacity * efficiency;
  }

  private getCurrentElectricityRate(): number {
    const hour = new Date().getHours();
    const rates = this.config.electricityRates.timeOfUseRates;
    
    if (hour >= 0 && hour < 6) return rates.offPeak.rate;
    if (hour >= 6 && hour < 16) return rates.midPeak.rate;
    if (hour >= 16 && hour < 21) return rates.onPeak.rate;
    return rates.offPeak.rate;
  }

  private calculateCumulativeCost(): number {
    const todaysMeasurements = this.getTodaysMeasurements();
    return todaysMeasurements.reduce((cost, m) => {
      const hourlyConsumption = m.gridImport / 60; // Convert to kWh
      return cost + (hourlyConsumption * m.instantaneousRate);
    }, 0);
  }

  private getTodaysPeakDemand(): number {
    const todaysMeasurements = this.getTodaysMeasurements();
    return Math.max(...todaysMeasurements.map(m => m.totalDemand), 0);
  }

  private getTodaysMeasurements(): EnergyMeasurement[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.measurements.filter(m => m.timestamp >= today);
  }

  private async generateEnergyForecast(): Promise<EnergyForecast> {
    const forecastHours = 24;
    const currentHour = new Date().getHours();
    
    // Load forecasting
    const expectedDemand: number[] = [];
    const lightingSchedule: number[] = [];
    const hvacLoad: number[] = [];
    
    for (let h = 0; h < forecastHours; h++) {
      const hour = (currentHour + h) % 24;
      
      // Lighting forecast
      const lightingPower = hour >= 6 && hour <= 18 ? 
        200 + Math.random() * 50 : 60 + Math.random() * 20;
      lightingSchedule.push(lightingPower);
      
      // HVAC forecast
      const hvacPower = 120 + Math.sin((hour - 12) * Math.PI / 12) * 30 + Math.random() * 20;
      hvacLoad.push(Math.max(80, hvacPower));
      
      // Total demand
      expectedDemand.push(lightingPower + hvacPower + 180); // Other loads
    }
    
    // Generation forecasts
    const solarForecast = this.forecastSolarGeneration(forecastHours);
    const windForecast = this.forecastWindGeneration(forecastHours);
    
    // Price forecasts
    const electricityPrices = this.forecastElectricityPrices(forecastHours);
    const demandCharges = this.forecastDemandCharges(forecastHours);
    
    // Grid conditions
    const gridStressLevel = this.forecastGridStress(forecastHours);
    const drEventProbability = this.forecastDRProbability(forecastHours);
    
    const forecast: EnergyForecast = {
      timestamp: new Date(),
      forecastHours,
      expectedDemand,
      lightingSchedule,
      hvacLoad,
      solarForecast,
      windForecast,
      electricityPrices,
      demandCharges,
      gridStressLevel,
      drEventProbability
    };
    
    this.forecasts.push(forecast);
    return forecast;
  }

  private forecastSolarGeneration(hours: number): number[] {
    const forecast: number[] = [];
    const currentHour = new Date().getHours();
    const solarCapacity = this.config.renewableGeneration.solarCapacity;
    
    for (let h = 0; h < hours; h++) {
      const hour = (currentHour + h) % 24;
      
      if (hour < 6 || hour > 18) {
        forecast.push(0);
      } else {
        const peakHour = 12;
        const hoursFromPeak = Math.abs(hour - peakHour);
        const efficiency = Math.max(0, 1 - (hoursFromPeak / 6));
        const cloudFactor = 0.7 + Math.random() * 0.3; // Weather uncertainty
        
        forecast.push(solarCapacity * efficiency * cloudFactor);
      }
    }
    
    return forecast;
  }

  private forecastWindGeneration(hours: number): number[] {
    const forecast: number[] = [];
    const windCapacity = this.config.renewableGeneration.windCapacity;
    
    for (let h = 0; h < hours; h++) {
      const windSpeed = 8 + Math.random() * 10; // 8-18 mph forecast
      const efficiency = Math.min((windSpeed - 7) / 13, 1);
      
      forecast.push(windCapacity * efficiency * Math.max(0, efficiency));
    }
    
    return forecast;
  }

  private forecastElectricityPrices(hours: number): number[] {
    const forecast: number[] = [];
    const currentHour = new Date().getHours();
    const rates = this.config.electricityRates.timeOfUseRates;
    
    for (let h = 0; h < hours; h++) {
      const hour = (currentHour + h) % 24;
      let rate: number;
      
      if (hour >= 0 && hour < 6) rate = rates.offPeak.rate;
      else if (hour >= 6 && hour < 16) rate = rates.midPeak.rate;
      else if (hour >= 16 && hour < 21) rate = rates.onPeak.rate;
      else rate = rates.offPeak.rate;
      
      // Add market volatility
      const volatility = 1 + (Math.random() - 0.5) * 0.2; // ±10%
      forecast.push(rate * volatility);
    }
    
    return forecast;
  }

  private forecastDemandCharges(hours: number): number[] {
    const forecast: number[] = [];
    const demandCharge = this.config.demandCharges.monthlyDemandCharge;
    
    for (let h = 0; h < hours; h++) {
      // Demand charges typically apply during peak hours
      const hour = (new Date().getHours() + h) % 24;
      const isDemandPeriod = hour >= 16 && hour < 21;
      
      forecast.push(isDemandPeriod ? demandCharge : 0);
    }
    
    return forecast;
  }

  private forecastGridStress(hours: number): ('normal' | 'elevated' | 'high' | 'critical')[] {
    const forecast: ('normal' | 'elevated' | 'high' | 'critical')[] = [];
    
    for (let h = 0; h < hours; h++) {
      const hour = (new Date().getHours() + h) % 24;
      let stress: 'normal' | 'elevated' | 'high' | 'critical';
      
      if (hour >= 16 && hour < 21) {
        // Peak hours - higher stress probability
        const rand = Math.random();
        if (rand < 0.6) stress = 'normal';
        else if (rand < 0.8) stress = 'elevated';
        else if (rand < 0.95) stress = 'high';
        else stress = 'critical';
      } else {
        stress = Math.random() < 0.9 ? 'normal' : 'elevated';
      }
      
      forecast.push(stress);
    }
    
    return forecast;
  }

  private forecastDRProbability(hours: number): number[] {
    const forecast: number[] = [];
    
    for (let h = 0; h < hours; h++) {
      const hour = (new Date().getHours() + h) % 24;
      
      // Higher DR probability during peak hours and hot days
      let probability = 0.05; // 5% base probability
      
      if (hour >= 16 && hour < 21) {
        probability = 0.25; // 25% during peak hours
      }
      
      // Increase probability during summer months
      const month = new Date().getMonth();
      if (month >= 5 && month <= 8) { // June-September
        probability *= 1.5;
      }
      
      forecast.push(probability);
    }
    
    return forecast;
  }

  private async runOptimizationAlgorithm(
    currentMeasurement: EnergyMeasurement,
    forecast: EnergyForecast
  ): Promise<OptimizationResult> {
    
    const optimizationHorizon = forecast.forecastHours;
    
    // Initialize optimization variables
    const lightingSchedule: { hour: number; power: number; dimming: number }[] = [];
    const hvacSchedule: { hour: number; power: number; setpoint: number }[] = [];
    const batterySchedule: { hour: number; power: number; soc: number }[] = [];
    const curtailmentSchedule: { hour: number; load: string; reduction: number }[] = [];
    
    let totalCost = 0;
    let peakDemand = 0;
    let batterySOC = currentMeasurement.batteryCharge / this.config.energyStorage.batteryCapacity;
    
    // Optimization loop for each hour
    for (let h = 0; h < optimizationHorizon; h++) {
      const hour = (new Date().getHours() + h) % 24;
      const electricityPrice = forecast.electricityPrices[h];
      const demandCharge = forecast.demandCharges[h];
      const drProbability = forecast.drEventProbability[h];
      
      // Optimize lighting
      const lightingOptimal = this.optimizeLighting(
        hour, 
        forecast.lightingSchedule[h], 
        electricityPrice,
        drProbability
      );
      lightingSchedule.push(lightingOptimal);
      
      // Optimize HVAC
      const hvacOptimal = this.optimizeHVAC(
        hour,
        forecast.hvacLoad[h],
        electricityPrice,
        drProbability
      );
      hvacSchedule.push(hvacOptimal);
      
      // Optimize battery
      const batteryOptimal = this.optimizeBattery(
        batterySOC,
        electricityPrice,
        forecast.electricityPrices.slice(h),
        forecast.expectedDemand[h],
        forecast.solarForecast[h] + forecast.windForecast[h]
      );
      batterySchedule.push(batteryOptimal);
      batterySOC = batteryOptimal.soc;
      
      // Check for demand response opportunities
      if (drProbability > 0.5) {
        const curtailment = this.optimizeDemandResponse(
          hour,
          lightingOptimal.power + hvacOptimal.power,
          this.config.demandResponseSettings.incentiveRate
        );
        if (curtailment.reduction > 0) {
          curtailmentSchedule.push(curtailment);
        }
      }
      
      // Calculate costs
      const hourlyDemand = lightingOptimal.power + hvacOptimal.power + 
                          forecast.expectedDemand[h] - forecast.solarForecast[h] - 
                          forecast.windForecast[h] + batteryOptimal.power;
      
      const energyCost = Math.max(0, hourlyDemand) * electricityPrice;
      const demandCost = hourlyDemand * demandCharge;
      
      totalCost += energyCost + demandCost;
      peakDemand = Math.max(peakDemand, hourlyDemand);
    }
    
    // Calculate savings vs baseline
    const baselineCost = this.calculateBaselineCost(forecast);
    const costSavings = baselineCost - totalCost;
    
    // Environmental calculations
    const renewableGeneration = forecast.solarForecast.reduce((a, b) => a + b) + 
                               forecast.windForecast.reduce((a, b) => a + b);
    const totalGeneration = renewableGeneration + 
                           forecast.expectedDemand.reduce((a, b) => a + b);
    const renewableUtilization = (renewableGeneration / totalGeneration) * 100;
    
    const carbonReduction = costSavings * 0.5; // Simplified calculation
    
    return {
      timestamp: new Date(),
      optimizationHorizon,
      lightingSchedule,
      hvacSchedule,
      batterySchedule,
      projectedCost: totalCost,
      costSavings,
      peakDemandReduction: Math.max(0, this.config.peakDemandLimit - peakDemand),
      carbonReduction,
      renewableUtilization,
      drParticipation: curtailmentSchedule.length > 0,
      drRevenue: curtailmentSchedule.reduce((total, c) => 
        total + c.reduction * this.config.demandResponseSettings.incentiveRate, 0),
      curtailmentSchedule
    };
  }

  private optimizeLighting(
    hour: number,
    forecastPower: number,
    electricityPrice: number,
    drProbability: number
  ): { hour: number; power: number; dimming: number } {
    
    let optimalPower = forecastPower;
    let dimmingLevel = 1.0;
    
    // During high price periods, consider dimming
    if (electricityPrice > 0.15 || drProbability > 0.3) {
      const maxDimming = 0.8; // Don't dim below 80%
      const priceThreshold = 0.20; // $/kWh
      
      if (electricityPrice > priceThreshold) {
        dimmingLevel = Math.max(maxDimming, 1 - (electricityPrice - priceThreshold) / priceThreshold);
        optimalPower = forecastPower * dimmingLevel;
      }
    }
    
    // Ensure minimum lighting during photoperiod
    if (hour >= 6 && hour <= 18) {
      dimmingLevel = Math.max(0.7, dimmingLevel); // Minimum 70% during day
      optimalPower = Math.max(forecastPower * 0.7, optimalPower);
    }
    
    return {
      hour,
      power: optimalPower,
      dimming: dimmingLevel
    };
  }

  private optimizeHVAC(
    hour: number,
    forecastPower: number,
    electricityPrice: number,
    drProbability: number
  ): { hour: number; power: number; setpoint: number } {
    
    let optimalPower = forecastPower;
    let setpointAdjustment = 0;
    
    // During high price or DR events, adjust setpoints
    if (electricityPrice > 0.15 || drProbability > 0.4) {
      // Pre-cool during low price periods
      if (hour >= 22 || hour <= 6) {
        setpointAdjustment = -1; // 1°F lower (pre-cooling)
        optimalPower = forecastPower * 1.1;
      } else {
        setpointAdjustment = +2; // 2°F higher during peak
        optimalPower = forecastPower * 0.8;
      }
    }
    
    return {
      hour,
      power: optimalPower,
      setpoint: 72 + setpointAdjustment // Base 72°F setpoint
    };
  }

  private optimizeBattery(
    currentSOC: number,
    currentPrice: number,
    futurePrices: number[],
    demandForecast: number,
    generationForecast: number
  ): { hour: number; power: number; soc: number } {
    
    const maxCharge = this.config.energyStorage.maxChargeRate;
    const maxDischarge = this.config.energyStorage.maxDischargeRate;
    const capacity = this.config.energyStorage.batteryCapacity;
    const efficiency = this.config.energyStorage.roundTripEfficiency / 100;
    
    let optimalPower = 0;
    let newSOC = currentSOC;
    
    // Simple price-based charging strategy
    const avgFuturePrice = futurePrices.slice(0, 6).reduce((a, b) => a + b) / 6; // Next 6 hours
    
    if (currentPrice < avgFuturePrice * 0.8) {
      // Charge when prices are low
      optimalPower = Math.min(maxCharge, (1 - currentSOC) * capacity);
      newSOC = Math.min(1, currentSOC + (optimalPower * efficiency) / capacity);
    } else if (currentPrice > avgFuturePrice * 1.2 && currentSOC > 0.2) {
      // Discharge when prices are high
      optimalPower = -Math.min(maxDischarge, currentSOC * capacity);
      newSOC = Math.max(0, currentSOC + optimalPower / capacity);
    }
    
    // Consider demand response discharge
    const excessDemand = demandForecast - generationForecast;
    if (excessDemand > 0 && currentSOC > 0.3) {
      const dischargeAmount = Math.min(maxDischarge, excessDemand, currentSOC * capacity * 0.5);
      optimalPower = Math.min(optimalPower, -dischargeAmount);
      newSOC = currentSOC + optimalPower / capacity;
    }
    
    return {
      hour: new Date().getHours(),
      power: optimalPower,
      soc: newSOC
    };
  }

  private optimizeDemandResponse(
    hour: number,
    currentLoad: number,
    incentiveRate: number
  ): { hour: number; load: string; reduction: number } {
    
    let maxReduction = 0;
    let bestLoad = '';
    let totalReduction = 0;
    
    // Evaluate each curtailable load
    this.config.curtailableLoads.forEach(load => {
      const possibleReduction = currentLoad * (load.maxCurtailment / 100);
      const reductionValue = possibleReduction * incentiveRate;
      const productionLoss = possibleReduction * load.curtailmentCost;
      
      // Only curtail if incentive exceeds production loss
      if (reductionValue > productionLoss && possibleReduction > maxReduction) {
        maxReduction = possibleReduction;
        bestLoad = load.loadId;
        totalReduction += possibleReduction;
      }
    });
    
    return {
      hour,
      load: bestLoad,
      reduction: totalReduction
    };
  }

  private calculateBaselineCost(forecast: EnergyForecast): number {
    // Calculate cost without optimization
    let baselineCost = 0;
    
    for (let h = 0; h < forecast.forecastHours; h++) {
      const demand = forecast.expectedDemand[h] - 
                    forecast.solarForecast[h] - forecast.windForecast[h];
      const energyCost = Math.max(0, demand) * forecast.electricityPrices[h];
      const demandCost = demand * forecast.demandCharges[h];
      
      baselineCost += energyCost + demandCost;
    }
    
    return baselineCost;
  }

  private async implementOptimalDispatch(optimization: OptimizationResult): Promise<void> {
    const currentHour = new Date().getHours();
    
    // Find current hour's optimal settings
    const lightingSetting = optimization.lightingSchedule.find(s => s.hour === currentHour);
    const hvacSetting = optimization.hvacSchedule.find(s => s.hour === currentHour);
    const batterySetting = optimization.batterySchedule.find(s => s.hour === currentHour);
    
    // Implement lighting control
    if (lightingSetting) {
      await this.setLightingLevel(lightingSetting.dimming);
    }
    
    // Implement HVAC control
    if (hvacSetting) {
      await this.setHVACSetpoint(hvacSetting.setpoint);
    }
    
    // Implement battery control
    if (batterySetting) {
      await this.setBatteryPower(batterySetting.power);
    }
    
    // Check for demand response curtailment
    const currentCurtailment = optimization.curtailmentSchedule.find(c => c.hour === currentHour);
    if (currentCurtailment) {
      await this.implementCurtailment(currentCurtailment.load, currentCurtailment.reduction);
    }
  }

  // Implementation methods (would control actual hardware)
  private async setLightingLevel(dimmingLevel: number): Promise<void> {
    console.log(`Setting lighting level to ${(dimmingLevel * 100).toFixed(0)}%`);
    // Control lighting dimming systems
  }

  private async setHVACSetpoint(setpoint: number): Promise<void> {
    console.log(`Setting HVAC setpoint to ${setpoint}°F`);
    // Control HVAC system setpoints
  }

  private async setBatteryPower(power: number): Promise<void> {
    const action = power > 0 ? 'charging' : 'discharging';
    console.log(`Battery ${action} at ${Math.abs(power).toFixed(1)} kW`);
    // Control battery management system
  }

  private async implementCurtailment(loadId: string, reduction: number): Promise<void> {
    console.log(`Curtailing ${loadId} by ${reduction.toFixed(1)} kW`);
    // Implement load curtailment
  }

  // Demand response event handling
  public async handleDemandResponseEvent(
    eventType: string,
    startTime: Date,
    endTime: Date,
    targetReduction: number
  ): Promise<DemandResponseEvent> {
    
    const event: DemandResponseEvent = {
      eventId: `dr_${Date.now()}`,
      timestamp: new Date(),
      eventType: eventType as any,
      startTime,
      endTime,
      targetReduction,
      actualReduction: 0,
      participationRate: 0,
      incentiveEarned: 0,
      complianceStatus: 'partial',
      curtailedLoads: []
    };
    
    // Calculate optimal response
    const response = await this.calculateDRResponse(targetReduction);
    
    // Implement curtailment
    for (const curtailment of response.curtailments) {
      await this.implementCurtailment(curtailment.loadId, curtailment.reduction);
      event.curtailedLoads.push(curtailment.loadId);
      event.actualReduction += curtailment.reduction;
    }
    
    // Calculate participation rate and compliance
    event.participationRate = event.actualReduction / targetReduction;
    event.complianceStatus = event.participationRate >= 0.9 ? 'compliant' :
                            event.participationRate >= 0.5 ? 'partial' : 'non_compliant';
    
    // Calculate incentive
    event.incentiveEarned = event.actualReduction * 
                           this.config.demandResponseSettings.incentiveRate *
                           ((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)); // hours
    
    this.drEvents.push(event);
    return event;
  }

  private async calculateDRResponse(targetReduction: number): Promise<any> {
    const curtailments: { loadId: string; reduction: number }[] = [];
    let totalReduction = 0;
    
    // Sort loads by curtailment priority and cost
    const sortedLoads = [...this.config.curtailableLoads]
      .sort((a, b) => {
        const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.curtailmentCost - b.curtailmentCost;
      });
    
    // Curtail loads until target is met
    for (const load of sortedLoads) {
      if (totalReduction >= targetReduction) break;
      
      const remainingReduction = targetReduction - totalReduction;
      const currentLoad = this.getCurrentLoadPower(load.loadId);
      const maxReduction = currentLoad * (load.maxCurtailment / 100);
      const actualReduction = Math.min(remainingReduction, maxReduction);
      
      if (actualReduction > 0) {
        curtailments.push({
          loadId: load.loadId,
          reduction: actualReduction
        });
        totalReduction += actualReduction;
      }
    }
    
    return { curtailments, totalReduction };
  }

  private getCurrentLoadPower(loadId: string): number {
    const latestMeasurement = this.measurements[this.measurements.length - 1];
    if (!latestMeasurement) return 0;
    
    switch (loadId) {
      case 'lighting': return latestMeasurement.lightingLoad;
      case 'hvac': return latestMeasurement.hvacLoad;
      case 'pumps': return latestMeasurement.pumpLoad;
      default: return 0;
    }
  }

  // Public API methods
  public getEnergyStatus() {
    const latestMeasurement = this.measurements[this.measurements.length - 1];
    const latestOptimization = this.optimizationResults[this.optimizationResults.length - 1];
    
    return {
      currentMeasurement: latestMeasurement,
      optimization: latestOptimization,
      isOptimizing: this.isOptimizing,
      todaysCost: this.calculateCumulativeCost(),
      peakDemand: this.getTodaysPeakDemand(),
      batterySOC: latestMeasurement ? 
        (latestMeasurement.batteryCharge / this.config.energyStorage.batteryCapacity) * 100 : 0,
      renewableGeneration: latestMeasurement ? 
        latestMeasurement.solarGeneration + latestMeasurement.windGeneration : 0,
      activeDREvents: this.drEvents.filter(e => e.endTime > new Date()),
      config: this.config
    };
  }

  public getRecentMeasurements(hours: number = 24): EnergyMeasurement[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.measurements.filter(m => m.timestamp >= cutoff);
  }

  public getDREventHistory(days: number = 30): DemandResponseEvent[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.drEvents.filter(e => e.timestamp >= cutoff);
  }

  public generateEnergyReport(days: number = 7): any {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const periodMeasurements = this.measurements.filter(m => m.timestamp >= cutoff);
    const periodOptimizations = this.optimizationResults.filter(o => o.timestamp >= cutoff);
    const periodDREvents = this.drEvents.filter(e => e.timestamp >= cutoff);
    
    return {
      period: `${days} days`,
      totalConsumption: periodMeasurements.reduce((sum, m) => sum + m.totalDemand, 0),
      totalCost: periodMeasurements.reduce((sum, m) => sum + m.cumulativeCost, 0),
      peakDemand: Math.max(...periodMeasurements.map(m => m.totalDemand)),
      renewableGeneration: periodMeasurements.reduce((sum, m) => 
        sum + m.solarGeneration + m.windGeneration, 0),
      costSavings: periodOptimizations.reduce((sum, o) => sum + o.costSavings, 0),
      drRevenue: periodDREvents.reduce((sum, e) => sum + e.incentiveEarned, 0),
      carbonReduction: periodOptimizations.reduce((sum, o) => sum + o.carbonReduction, 0),
      batteryMetrics: this.calculateBatteryMetrics(periodMeasurements),
      efficiencyScore: this.calculateEfficiencyScore(periodMeasurements, periodOptimizations)
    };
  }

  private calculateBatteryMetrics(measurements: EnergyMeasurement[]): any {
    if (measurements.length === 0) return null;
    
    const cycles = measurements.filter(m => Math.abs(m.batteryPower) > 1).length;
    const energyThroughput = measurements.reduce((sum, m) => 
      sum + Math.abs(m.batteryPower), 0);
    
    return {
      cycles,
      energyThroughput,
      avgSOC: measurements.reduce((sum, m) => sum + m.batteryCharge, 0) / measurements.length,
      maxSOC: Math.max(...measurements.map(m => m.batteryCharge)),
      minSOC: Math.min(...measurements.map(m => m.batteryCharge))
    };
  }

  private calculateEfficiencyScore(
    measurements: EnergyMeasurement[],
    optimizations: OptimizationResult[]
  ): number {
    if (measurements.length === 0 || optimizations.length === 0) return 0;
    
    const avgRenewablePercentage = measurements.reduce((sum, m) => 
      sum + m.renewablePercentage, 0) / measurements.length;
    
    const avgCostSavings = optimizations.reduce((sum, o) => 
      sum + o.costSavings, 0) / optimizations.length;
    
    const drParticipation = optimizations.filter(o => o.drParticipation).length / optimizations.length;
    
    // Weighted efficiency score
    return (avgRenewablePercentage * 0.4 + 
            Math.min(avgCostSavings / 100, 1) * 100 * 0.4 + 
            drParticipation * 100 * 0.2);
  }

  public updateConfig(newConfig: Partial<EnergyOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log(`Energy optimization config updated for ${this.config.facilityId}`);
  }
}