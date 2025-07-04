// CO2 Null-Balance Enrichment Control System
// Advanced CO2 management for commercial plant factories following Kozai standards

export interface CO2ControllerConfig {
  facilityId: string;
  zoneId: string;
  targetConcentration: number; // 1000-2000 ppm for plant factories
  nullBalanceMode: boolean;
  leafAreaIndexAdjustment: boolean;
  co2UseEfficiencyTarget: number; // 0.87-0.89 CUE target
  ventilationRate: number; // m³/h
  cropType: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
}

export interface CO2Measurement {
  timestamp: Date;
  concentration: number; // ppm
  injectionRate: number; // L/min
  ventilationRate: number; // m³/h
  leafAreaIndex: number; // m²/m²
  photosynthesisRate: number; // µmol CO2/m²/s
  co2UseEfficiency: number; // ratio
  ambientCO2: number; // ppm
  temperature: number; // °C
  relativeHumidity: number; // %
  ppfd: number; // µmol/m²/s
}

export interface CO2InjectionEvent {
  id: string;
  timestamp: Date;
  duration: number; // seconds
  flowRate: number; // L/min
  totalVolume: number; // L
  preConcentration: number; // ppm
  postConcentration: number; // ppm
  reason: 'scheduled' | 'deficit' | 'photosynthesis_boost' | 'null_balance';
  effectivenessScore: number; // 0-1
}

export interface CO2OptimizationResult {
  recommendedConcentration: number;
  injectionSchedule: CO2InjectionSchedule[];
  expectedYieldIncrease: number; // %
  energyCost: number; // $/day
  co2Cost: number; // $/day
  roi: number; // days to payback
  ventilationAdjustment: number; // %
}

export interface CO2InjectionSchedule {
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  targetConcentration: number; // ppm
  injectionRate: number; // L/min
  photoPeriodPhase: 'photoperiod' | 'dark_period';
}

export class CO2EnrichmentController {
  private config: CO2ControllerConfig;
  private measurements: CO2Measurement[] = [];
  private injectionEvents: CO2InjectionEvent[] = [];
  private isActive: boolean = false;
  private currentInjectionRate: number = 0;
  private nullBalanceSetpoint: number = 0;
  
  constructor(config: CO2ControllerConfig) {
    this.config = config;
    this.nullBalanceSetpoint = this.calculateNullBalanceSetpoint();
  }

  // Calculate null-balance setpoint based on Kozai methodology
  private calculateNullBalanceSetpoint(): number {
    const baselineConcentration = 400; // ambient CO2 ppm
    const photosynthesisEnhancement = this.getPhotosynthesisEnhancement();
    const ventilationLoss = this.calculateVentilationLoss();
    const plantUptake = this.calculatePlantUptake();
    
    // Null-balance equation: Injection = Ventilation Loss + Plant Uptake
    const requiredConcentration = baselineConcentration + 
      (ventilationLoss + plantUptake) / photosynthesisEnhancement;
    
    return Math.min(Math.max(requiredConcentration, 800), 2000);
  }

  private getPhotosynthesisEnhancement(): number {
    // Based on crop type and growth stage
    const enhancements = {
      'Cannabis': { seedling: 1.2, vegetative: 1.35, flowering: 1.25, harvest: 1.0 },
      'Lettuce': { seedling: 1.15, vegetative: 1.3, flowering: 1.2, harvest: 1.0 },
      'Tomato': { seedling: 1.25, vegetative: 1.4, flowering: 1.35, harvest: 1.1 },
      'Herbs': { seedling: 1.1, vegetative: 1.25, flowering: 1.2, harvest: 1.0 },
      'Strawberry': { seedling: 1.2, vegetative: 1.3, flowering: 1.4, harvest: 1.15 }
    };
    
    return enhancements[this.config.cropType]?.[this.config.growthStage] || 1.2;
  }

  private calculateVentilationLoss(): number {
    // CO2 loss through ventilation (ppm/h)
    const airExchangeRate = this.config.ventilationRate / 1000; // m³/h to m³/min
    const facilityVolume = 1000; // m³ (would come from facility data)
    const ambientCO2 = 400; // ppm
    
    return (airExchangeRate * ambientCO2) / facilityVolume * 60; // ppm/h
  }

  private calculatePlantUptake(): number {
    // CO2 uptake by plants based on LAI and photosynthesis rate
    const leafAreaIndex = this.getCurrentLAI();
    const maxPhotosynthesisRate = 30; // µmol CO2/m²/s (typical max)
    const currentLightLevel = this.getCurrentPPFD();
    const lightSaturationPoint = 800; // µmol/m²/s
    
    // Light response curve
    const lightEfficiency = Math.min(currentLightLevel / lightSaturationPoint, 1.0);
    const photosynthesisRate = maxPhotosynthesisRate * lightEfficiency;
    
    // Convert to ppm/h uptake
    const molecularWeight = 44.01; // g/mol CO2
    const plantUptake = (leafAreaIndex * photosynthesisRate * 3600 * molecularWeight) / 
                       (1000000 * 1.225); // Convert to ppm/h
    
    return plantUptake;
  }

  // Main control algorithm
  public async updateCO2Control(
    currentCO2: number,
    temperature: number,
    humidity: number,
    ppfd: number,
    lai: number
  ): Promise<CO2Measurement> {
    const timestamp = new Date();
    
    // Calculate target concentration based on null-balance
    let targetConcentration = this.config.nullBalanceMode 
      ? this.nullBalanceSetpoint 
      : this.config.targetConcentration;

    // Adjust for environmental conditions
    targetConcentration = this.adjustForEnvironment(
      targetConcentration, 
      temperature, 
      humidity, 
      ppfd
    );

    // Calculate required injection rate
    const deficitPPM = Math.max(0, targetConcentration - currentCO2);
    const injectionRate = this.calculateInjectionRate(deficitPPM, ppfd, lai);
    
    // Update injection system
    await this.setInjectionRate(injectionRate);
    
    // Calculate photosynthesis rate and CO2 use efficiency
    const photosynthesisRate = this.calculatePhotosynthesisRate(
      currentCO2, temperature, ppfd, lai
    );
    const co2UseEfficiency = this.calculateCO2UseEfficiency(
      photosynthesisRate, injectionRate
    );

    const measurement: CO2Measurement = {
      timestamp,
      concentration: currentCO2,
      injectionRate: this.currentInjectionRate,
      ventilationRate: this.config.ventilationRate,
      leafAreaIndex: lai,
      photosynthesisRate,
      co2UseEfficiency,
      ambientCO2: 400,
      temperature,
      relativeHumidity: humidity,
      ppfd
    };

    this.measurements.push(measurement);
    
    // Log injection event if significant
    if (injectionRate > 0.1) {
      await this.logInjectionEvent(deficitPPM, injectionRate, targetConcentration);
    }

    return measurement;
  }

  private adjustForEnvironment(
    baseTarget: number, 
    temperature: number, 
    humidity: number, 
    ppfd: number
  ): number {
    let adjustedTarget = baseTarget;
    
    // Temperature adjustment (optimal 22-26°C)
    if (temperature < 20) {
      adjustedTarget *= 0.85; // Reduce CO2 in cold conditions
    } else if (temperature > 28) {
      adjustedTarget *= 0.9; // Reduce CO2 in hot conditions
    }
    
    // Light level adjustment
    if (ppfd < 200) {
      adjustedTarget *= 0.7; // Low light = less CO2 needed
    } else if (ppfd > 1000) {
      adjustedTarget *= 1.1; // High light = more CO2 beneficial
    }
    
    // Humidity adjustment (optimal 60-70%)
    if (humidity > 80) {
      adjustedTarget *= 0.95; // High humidity reduces CO2 benefit
    }
    
    return Math.round(adjustedTarget);
  }

  private calculateInjectionRate(deficitPPM: number, ppfd: number, lai: number): number {
    if (deficitPPM <= 0 || ppfd < 50) return 0; // No injection needed or too dark
    
    const facilityVolume = 1000; // m³ (would come from facility data)
    const airDensity = 1.225; // kg/m³
    const co2Density = 1.98; // kg/m³
    
    // Base injection rate calculation
    const baseRate = (deficitPPM * facilityVolume * co2Density) / 
                     (1000000 * 60); // L/min
    
    // Adjust for plant demand
    const plantDemandMultiplier = Math.min(lai * 0.5 + 0.5, 2.0);
    const lightDemandMultiplier = Math.min(ppfd / 800, 1.5);
    
    const adjustedRate = baseRate * plantDemandMultiplier * lightDemandMultiplier;
    
    // Safety limits
    return Math.min(Math.max(adjustedRate, 0), 10); // 0-10 L/min max
  }

  private calculatePhotosynthesisRate(
    co2: number, 
    temperature: number, 
    ppfd: number, 
    lai: number
  ): number {
    // Simplified Farquhar model
    const vcmax = 100; // Maximum carboxylation rate
    const jmax = 200; // Maximum electron transport rate
    const rd = 2; // Dark respiration rate
    
    // CO2 response
    const kc = 300; // Michaelis constant for CO2
    const ko = 300000; // Michaelis constant for O2
    const o2 = 210000; // O2 concentration (µmol/mol)
    const gamma = 0.5 * o2 / (2600 * Math.exp(-1700 / (temperature + 273.15)));
    
    // Light response
    const alpha = 0.24; // Quantum efficiency
    const j = (alpha * ppfd * jmax) / (alpha * ppfd + jmax);
    
    // Temperature response
    const tempFactor = Math.exp(65.33 - 0.2 * temperature);
    const vcmaxTemp = vcmax * tempFactor;
    
    // Carboxylation-limited rate
    const wc = (vcmaxTemp * (co2 - gamma)) / (co2 + kc * (1 + o2 / ko));
    
    // Light-limited rate
    const wj = (j * (co2 - gamma)) / (4 * (co2 + 2 * gamma));
    
    // Net photosynthesis rate
    const netRate = Math.min(wc, wj) - rd;
    
    return Math.max(netRate * lai, 0); // µmol CO2/m²/s
  }

  private calculateCO2UseEfficiency(
    photosynthesisRate: number, 
    injectionRate: number
  ): number {
    if (injectionRate === 0) return 0;
    
    // Convert injection rate to CO2 uptake rate
    const co2MassFlow = injectionRate * 1.98 / 60; // kg/s
    const co2MolarFlow = (co2MassFlow / 44.01) * 1000000; // µmol/s
    
    // CO2 use efficiency = photosynthesis / injection
    const efficiency = photosynthesisRate / co2MolarFlow;
    
    return Math.min(Math.max(efficiency, 0), 1);
  }

  // Optimization and scheduling methods
  public optimizeCO2Strategy(
    historicalData: CO2Measurement[],
    cropSchedule: any,
    energyCosts: number[],
    co2Costs: number
  ): CO2OptimizationResult {
    // Analyze historical performance
    const avgEfficiency = this.calculateAverageEfficiency(historicalData);
    const yieldCorrelation = this.analyzeYieldCorrelation(historicalData);
    
    // Optimize concentration based on cost-benefit
    const optimalConcentration = this.findOptimalConcentration(
      avgEfficiency, yieldCorrelation, energyCosts, co2Costs
    );
    
    // Generate injection schedule
    const schedule = this.generateInjectionSchedule(optimalConcentration);
    
    // Calculate expected benefits
    const expectedYieldIncrease = this.calculateYieldIncrease(optimalConcentration);
    const dailyCO2Cost = this.calculateDailyCO2Cost(schedule, co2Costs);
    const roi = this.calculateROI(expectedYieldIncrease, dailyCO2Cost);
    
    return {
      recommendedConcentration: optimalConcentration,
      injectionSchedule: schedule,
      expectedYieldIncrease,
      energyCost: 0, // CO2 injection has minimal energy cost
      co2Cost: dailyCO2Cost,
      roi,
      ventilationAdjustment: this.calculateVentilationAdjustment(optimalConcentration)
    };
  }

  private calculateAverageEfficiency(data: CO2Measurement[]): number {
    if (data.length === 0) return 0.5;
    
    const validEfficiencies = data
      .filter(m => m.co2UseEfficiency > 0 && m.co2UseEfficiency <= 1)
      .map(m => m.co2UseEfficiency);
    
    return validEfficiencies.reduce((sum, eff) => sum + eff, 0) / validEfficiencies.length;
  }

  private analyzeYieldCorrelation(data: CO2Measurement[]): number {
    // Simplified correlation analysis
    // In real implementation, this would use historical yield data
    const avgCO2 = data.reduce((sum, m) => sum + m.concentration, 0) / data.length;
    const avgPhotosynthesis = data.reduce((sum, m) => sum + m.photosynthesisRate, 0) / data.length;
    
    // Estimate yield correlation based on photosynthesis rates
    return Math.min((avgPhotosynthesis / 25) * (avgCO2 / 1000), 2.0);
  }

  private findOptimalConcentration(
    efficiency: number,
    yieldCorrelation: number,
    energyCosts: number[],
    co2Cost: number
  ): number {
    const baseConcentration = 400;
    const maxBeneficialConcentration = 1800;
    
    let optimalConcentration = baseConcentration;
    let maxBenefit = 0;
    
    // Test concentrations from 600 to 1800 ppm
    for (let conc = 600; conc <= maxBeneficialConcentration; conc += 50) {
      const yieldBenefit = this.calculateYieldBenefit(conc, yieldCorrelation);
      const cost = this.calculateConcentrationCost(conc, co2Cost);
      const netBenefit = yieldBenefit - cost;
      
      if (netBenefit > maxBenefit) {
        maxBenefit = netBenefit;
        optimalConcentration = conc;
      }
    }
    
    return optimalConcentration;
  }

  private calculateYieldBenefit(concentration: number, correlation: number): number {
    const baseYield = 100; // kg/m²/year baseline
    const co2Enhancement = Math.min((concentration - 400) / 1000, 1.0);
    const yieldIncrease = baseYield * co2Enhancement * correlation * 0.3; // 30% max increase
    
    return yieldIncrease * 5; // $5/kg value
  }

  private calculateConcentrationCost(concentration: number, co2Cost: number): number {
    const dailyVolume = (concentration - 400) * 0.01; // Simplified cost model
    return dailyVolume * co2Cost;
  }

  private generateInjectionSchedule(targetConcentration: number): CO2InjectionSchedule[] {
    const schedule: CO2InjectionSchedule[] = [];
    
    // Photoperiod injection (when lights are on)
    schedule.push({
      startTime: '06:00',
      endTime: '18:00',
      targetConcentration: targetConcentration,
      injectionRate: this.calculateScheduledInjectionRate(targetConcentration),
      photoPeriodPhase: 'photoperiod'
    });
    
    // Dark period (reduced CO2)
    schedule.push({
      startTime: '18:00',
      endTime: '06:00',
      targetConcentration: 600, // Lower during dark period
      injectionRate: this.calculateScheduledInjectionRate(600),
      photoPeriodPhase: 'dark_period'
    });
    
    return schedule;
  }

  private calculateScheduledInjectionRate(targetConcentration: number): number {
    const ambientCO2 = 400;
    const deficit = Math.max(0, targetConcentration - ambientCO2);
    return deficit * 0.005; // L/min per ppm deficit
  }

  private calculateYieldIncrease(concentration: number): number {
    const baselineYield = 100; // %
    const co2Enhancement = Math.min((concentration - 400) / 1200, 1.0);
    return co2Enhancement * 25; // Up to 25% yield increase
  }

  private calculateDailyCO2Cost(schedule: CO2InjectionSchedule[], co2Cost: number): number {
    return schedule.reduce((total, period) => {
      const periodHours = this.calculatePeriodHours(period.startTime, period.endTime);
      const periodCost = period.injectionRate * periodHours * 60 * co2Cost * 0.001;
      return total + periodCost;
    }, 0);
  }

  private calculatePeriodHours(startTime: string, endTime: string): number {
    const start = this.parseTimeString(startTime);
    const end = this.parseTimeString(endTime);
    
    if (end < start) {
      return (24 - start) + end; // Crosses midnight
    }
    return end - start;
  }

  private parseTimeString(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  }

  private calculateROI(yieldIncrease: number, dailyCost: number): number {
    const dailyRevenue = yieldIncrease * 0.1; // $0.10 per % yield increase per day
    const dailyProfit = dailyRevenue - dailyCost;
    
    if (dailyProfit <= 0) return -1; // No payback
    
    const initialInvestment = 5000; // $5000 CO2 system cost
    return initialInvestment / dailyProfit; // Days to payback
  }

  private calculateVentilationAdjustment(targetConcentration: number): number {
    // Reduce ventilation to maintain higher CO2 levels
    const baseVentilation = 100; // %
    const co2Factor = (targetConcentration - 400) / 1000;
    const reduction = co2Factor * 30; // Up to 30% reduction
    
    return Math.max(baseVentilation - reduction, 50); // Minimum 50% ventilation
  }

  // System control methods
  private async setInjectionRate(rate: number): Promise<void> {
    this.currentInjectionRate = rate;
    // In real implementation, this would control physical CO2 injection valves
    console.log(`CO2 injection rate set to: ${rate.toFixed(2)} L/min`);
  }

  private async logInjectionEvent(
    deficit: number, 
    rate: number, 
    target: number
  ): Promise<void> {
    const event: CO2InjectionEvent = {
      id: `co2_${Date.now()}`,
      timestamp: new Date(),
      duration: 60, // 1 minute default
      flowRate: rate,
      totalVolume: rate,
      preConcentration: target - deficit,
      postConcentration: target,
      reason: this.config.nullBalanceMode ? 'null_balance' : 'scheduled',
      effectivenessScore: Math.min(rate / 5, 1) // 0-1 based on rate
    };
    
    this.injectionEvents.push(event);
  }

  // Utility methods
  private getCurrentLAI(): number {
    // In real implementation, this would come from plant monitoring systems
    const stageLAI = {
      'seedling': 0.5,
      'vegetative': 2.5,
      'flowering': 4.0,
      'harvest': 3.5
    };
    
    return stageLAI[this.config.growthStage] || 2.0;
  }

  private getCurrentPPFD(): number {
    // In real implementation, this would come from light sensors
    return 600; // µmol/m²/s default
  }

  // Public API methods
  public getRecentMeasurements(hours: number = 24): CO2Measurement[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.measurements.filter(m => m.timestamp >= cutoff);
  }

  public getInjectionHistory(hours: number = 24): CO2InjectionEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.injectionEvents.filter(e => e.timestamp >= cutoff);
  }

  public getCurrentStatus() {
    return {
      isActive: this.isActive,
      currentInjectionRate: this.currentInjectionRate,
      nullBalanceSetpoint: this.nullBalanceSetpoint,
      targetConcentration: this.config.targetConcentration,
      lastMeasurement: this.measurements[this.measurements.length - 1],
      config: this.config
    };
  }

  public updateConfig(newConfig: Partial<CO2ControllerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.nullBalanceMode !== undefined || 
        newConfig.targetConcentration !== undefined) {
      this.nullBalanceSetpoint = this.calculateNullBalanceSetpoint();
    }
  }

  public startController(): void {
    this.isActive = true;
    console.log(`CO2 Enrichment Controller started for ${this.config.facilityId}/${this.config.zoneId}`);
  }

  public stopController(): void {
    this.isActive = false;
    this.currentInjectionRate = 0;
    console.log(`CO2 Enrichment Controller stopped for ${this.config.facilityId}/${this.config.zoneId}`);
  }
}