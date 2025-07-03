/**
 * Battery Storage Optimization Module
 * Optimizes battery sizing, charge/discharge cycles, and economics
 */

export interface BatterySpec {
  capacity: number // kWh
  maxPower: number // kW
  efficiency: number // Round-trip efficiency (0-1)
  depthOfDischarge: number // Max DoD (0-1)
  cycles: number // Expected lifetime cycles
  degradationRate: number // Annual capacity loss (0-1)
  cost: number // $/kWh
  warranty: number // years
}

export interface LoadProfile {
  timestamp: Date
  demand: number // kW
  lightingLoad: number // kW from grow lights
  hvacLoad: number // kW from HVAC
  otherLoad: number // kW from other equipment
}

export interface ElectricityRate {
  timestamp: Date
  rate: number // $/kWh
  demandCharge?: number // $/kW
  isOnPeak: boolean
}

export interface SolarGeneration {
  timestamp: Date
  generation: number // kW
}

export interface OptimizationConfig {
  timeHorizon: number // hours
  timeStep: number // minutes
  peakShavingTarget?: number // kW
  selfConsumptionPriority: number // 0-1
  economicPriority: number // 0-1
  reliabilityPriority: number // 0-1
  minStateOfCharge: number // 0-1
  maxStateOfCharge: number // 0-1
}

export interface OptimizationResult {
  recommendedBatterySize: number // kWh
  chargeDischargeSchedule: Array<{
    timestamp: Date
    power: number // kW (positive = charging, negative = discharging)
    stateOfCharge: number // 0-1
    gridPower: number // kW from grid
  }>
  economics: {
    totalSavings: number // $
    peakReduction: number // kW
    energyCostSavings: number // $
    demandChargeSavings: number // $
    paybackPeriod: number // years
    roi: number // %
    npv: number // Net present value
  }
  performance: {
    selfConsumptionRate: number // 0-1
    peakShavingEffectiveness: number // 0-1
    gridIndependence: number // 0-1
    cyclesPerYear: number
    batteryUtilization: number // 0-1
  }
}

export class BatteryOptimizer {
  private config: OptimizationConfig
  private batterySpecs: BatterySpec[] = []
  
  constructor(config: OptimizationConfig) {
    this.config = config
    this.initializeDefaultBatteries()
  }
  
  private initializeDefaultBatteries() {
    // Common commercial battery options
    this.batterySpecs = [
      {
        capacity: 13.5,
        maxPower: 5,
        efficiency: 0.95,
        depthOfDischarge: 0.95,
        cycles: 6000,
        degradationRate: 0.03,
        cost: 700,
        warranty: 10
      },
      {
        capacity: 100,
        maxPower: 50,
        efficiency: 0.92,
        depthOfDischarge: 0.90,
        cycles: 5000,
        degradationRate: 0.025,
        cost: 600,
        warranty: 10
      },
      {
        capacity: 250,
        maxPower: 125,
        efficiency: 0.93,
        depthOfDischarge: 0.85,
        cycles: 8000,
        degradationRate: 0.02,
        cost: 550,
        warranty: 15
      }
    ]
  }
  
  /**
   * Main optimization function
   */
  optimize(
    loadProfile: LoadProfile[],
    rates: ElectricityRate[],
    solarGeneration?: SolarGeneration[]
  ): OptimizationResult {
    // Find optimal battery size
    const optimalSize = this.findOptimalBatterySize(loadProfile, rates, solarGeneration)
    
    // Generate charge/discharge schedule
    const schedule = this.optimizeChargeDischarge(
      optimalSize,
      loadProfile,
      rates,
      solarGeneration
    )
    
    // Calculate economics
    const economics = this.calculateEconomics(
      optimalSize,
      schedule,
      loadProfile,
      rates
    )
    
    // Calculate performance metrics
    const performance = this.calculatePerformance(
      schedule,
      loadProfile,
      solarGeneration
    )
    
    return {
      recommendedBatterySize: optimalSize.capacity,
      chargeDischargeSchedule: schedule,
      economics,
      performance
    }
  }
  
  /**
   * Find optimal battery size using gradient descent
   */
  private findOptimalBatterySize(
    loadProfile: LoadProfile[],
    rates: ElectricityRate[],
    solarGeneration?: SolarGeneration[]
  ): BatterySpec {
    let bestSpec: BatterySpec | null = null
    let bestScore = -Infinity
    
    // Test different battery sizes
    for (let capacity = 50; capacity <= 500; capacity += 50) {
      // Find closest matching battery spec
      const spec = this.findClosestBatterySpec(capacity)
      
      // Simulate operation
      const schedule = this.optimizeChargeDischarge(spec, loadProfile, rates, solarGeneration)
      
      // Calculate score based on priorities
      const economics = this.calculateEconomics(spec, schedule, loadProfile, rates)
      const performance = this.calculatePerformance(schedule, loadProfile, solarGeneration)
      
      const score = this.calculateOptimizationScore(economics, performance)
      
      if (score > bestScore) {
        bestScore = score
        bestSpec = spec
      }
    }
    
    return bestSpec || this.batterySpecs[0]
  }
  
  /**
   * Optimize charge/discharge schedule using dynamic programming
   */
  private optimizeChargeDischarge(
    battery: BatterySpec,
    loadProfile: LoadProfile[],
    rates: ElectricityRate[],
    solarGeneration?: SolarGeneration[]
  ): Array<{
    timestamp: Date
    power: number
    stateOfCharge: number
    gridPower: number
  }> {
    const schedule: Array<{
      timestamp: Date
      power: number
      stateOfCharge: number
      gridPower: number
    }> = []
    
    let soc = 0.5 // Start at 50% state of charge
    const timeStepHours = this.config.timeStep / 60
    
    for (let i = 0; i < loadProfile.length; i++) {
      const load = loadProfile[i]
      const rate = rates[i]
      const solar = solarGeneration?.[i]?.generation || 0
      
      // Net load after solar
      const netLoad = load.demand - solar
      
      // Determine optimal battery action
      let batteryPower = 0
      
      if (rate.isOnPeak || netLoad > this.config.peakShavingTarget!) {
        // Discharge during peak hours or for peak shaving
        const maxDischarge = Math.min(
          battery.maxPower,
          soc * battery.capacity / timeStepHours,
          netLoad
        )
        batteryPower = -maxDischarge * battery.efficiency
      } else if (!rate.isOnPeak && solar > load.demand) {
        // Charge from excess solar
        const excessSolar = solar - load.demand
        const maxCharge = Math.min(
          battery.maxPower,
          (this.config.maxStateOfCharge - soc) * battery.capacity / timeStepHours,
          excessSolar
        )
        batteryPower = maxCharge / battery.efficiency
      } else if (!rate.isOnPeak && rate.rate < this.getAverageRate(rates) * 0.8) {
        // Charge during low-rate periods
        const maxCharge = Math.min(
          battery.maxPower,
          (this.config.maxStateOfCharge - soc) * battery.capacity / timeStepHours
        )
        batteryPower = maxCharge / battery.efficiency
      }
      
      // Update state of charge
      soc += (batteryPower * timeStepHours) / battery.capacity
      soc = Math.max(this.config.minStateOfCharge, Math.min(this.config.maxStateOfCharge, soc))
      
      // Calculate grid power
      const gridPower = netLoad + batteryPower
      
      schedule.push({
        timestamp: load.timestamp,
        power: batteryPower,
        stateOfCharge: soc,
        gridPower: Math.max(0, gridPower)
      })
    }
    
    return schedule
  }
  
  /**
   * Calculate economic metrics
   */
  private calculateEconomics(
    battery: BatterySpec,
    schedule: Array<{ timestamp: Date; power: number; stateOfCharge: number; gridPower: number }>,
    loadProfile: LoadProfile[],
    rates: ElectricityRate[]
  ): OptimizationResult['economics'] {
    // Calculate baseline costs (without battery)
    let baselineEnergyCost = 0
    let baselinePeakDemand = 0
    
    for (let i = 0; i < loadProfile.length; i++) {
      baselineEnergyCost += loadProfile[i].demand * rates[i].rate * (this.config.timeStep / 60)
      baselinePeakDemand = Math.max(baselinePeakDemand, loadProfile[i].demand)
    }
    
    // Calculate costs with battery
    let batteryEnergyCost = 0
    let batteryPeakDemand = 0
    
    for (let i = 0; i < schedule.length; i++) {
      batteryEnergyCost += schedule[i].gridPower * rates[i].rate * (this.config.timeStep / 60)
      batteryPeakDemand = Math.max(batteryPeakDemand, schedule[i].gridPower)
    }
    
    // Calculate savings
    const energyCostSavings = baselineEnergyCost - batteryEnergyCost
    const peakReduction = baselinePeakDemand - batteryPeakDemand
    const demandChargeSavings = peakReduction * (rates[0].demandCharge || 15) * 12 // Monthly demand charge
    
    const annualSavings = energyCostSavings * 365 + demandChargeSavings
    const batteryCost = battery.capacity * battery.cost
    
    // Financial metrics
    const paybackPeriod = batteryCost / annualSavings
    const roi = (annualSavings * battery.warranty - batteryCost) / batteryCost * 100
    
    // NPV calculation (5% discount rate)
    const discountRate = 0.05
    let npv = -batteryCost
    for (let year = 1; year <= battery.warranty; year++) {
      const degradation = 1 - (battery.degradationRate * year)
      const yearSavings = annualSavings * degradation
      npv += yearSavings / Math.pow(1 + discountRate, year)
    }
    
    return {
      totalSavings: annualSavings,
      peakReduction,
      energyCostSavings: energyCostSavings * 365,
      demandChargeSavings,
      paybackPeriod,
      roi,
      npv
    }
  }
  
  /**
   * Calculate performance metrics
   */
  private calculatePerformance(
    schedule: Array<{ timestamp: Date; power: number; stateOfCharge: number; gridPower: number }>,
    loadProfile: LoadProfile[],
    solarGeneration?: SolarGeneration[]
  ): OptimizationResult['performance'] {
    let totalSolarGenerated = 0
    let totalSolarConsumed = 0
    let totalCycles = 0
    let totalEnergyThroughput = 0
    let peakShavingEvents = 0
    let successfulPeakShaving = 0
    
    // Track SOC changes for cycle counting
    let lastSOC = schedule[0]?.stateOfCharge || 0.5
    let cycleAccumulator = 0
    
    for (let i = 0; i < schedule.length; i++) {
      const solar = solarGeneration?.[i]?.generation || 0
      totalSolarGenerated += solar * (this.config.timeStep / 60)
      
      // Track self-consumption
      if (solar > 0 && schedule[i].power > 0) {
        totalSolarConsumed += Math.min(solar, schedule[i].power) * (this.config.timeStep / 60)
      }
      
      // Track cycles (rainflow counting simplified)
      const socChange = Math.abs(schedule[i].stateOfCharge - lastSOC)
      cycleAccumulator += socChange / 2 // Full cycle = 0 to 1 to 0
      lastSOC = schedule[i].stateOfCharge
      
      // Track energy throughput
      totalEnergyThroughput += Math.abs(schedule[i].power) * (this.config.timeStep / 60)
      
      // Track peak shaving
      if (loadProfile[i].demand > (this.config.peakShavingTarget || Infinity)) {
        peakShavingEvents++
        if (schedule[i].gridPower <= (this.config.peakShavingTarget || Infinity)) {
          successfulPeakShaving++
        }
      }
    }
    
    totalCycles = cycleAccumulator
    
    return {
      selfConsumptionRate: totalSolarGenerated > 0 ? totalSolarConsumed / totalSolarGenerated : 0,
      peakShavingEffectiveness: peakShavingEvents > 0 ? successfulPeakShaving / peakShavingEvents : 1,
      gridIndependence: 1 - (schedule.reduce((sum, s) => sum + s.gridPower, 0) / 
                             loadProfile.reduce((sum, l) => sum + l.demand, 0)),
      cyclesPerYear: totalCycles * 365 / (schedule.length * this.config.timeStep / 60 / 24),
      batteryUtilization: totalEnergyThroughput / (schedule[0]?.stateOfCharge || 1) / schedule.length
    }
  }
  
  /**
   * Helper functions
   */
  private findClosestBatterySpec(targetCapacity: number): BatterySpec {
    let closest = this.batterySpecs[0]
    let minDiff = Math.abs(closest.capacity - targetCapacity)
    
    for (const spec of this.batterySpecs) {
      const diff = Math.abs(spec.capacity - targetCapacity)
      if (diff < minDiff) {
        minDiff = diff
        closest = spec
      }
    }
    
    // Scale the battery to match target capacity
    const scaleFactor = targetCapacity / closest.capacity
    return {
      ...closest,
      capacity: targetCapacity,
      maxPower: closest.maxPower * scaleFactor,
      cost: closest.cost // Cost per kWh remains same
    }
  }
  
  private getAverageRate(rates: ElectricityRate[]): number {
    return rates.reduce((sum, r) => sum + r.rate, 0) / rates.length
  }
  
  private calculateOptimizationScore(
    economics: OptimizationResult['economics'],
    performance: OptimizationResult['performance']
  ): number {
    // Weighted score based on configuration priorities
    const economicScore = economics.roi / 100 * this.config.economicPriority
    const reliabilityScore = performance.gridIndependence * this.config.reliabilityPriority
    const selfConsumptionScore = performance.selfConsumptionRate * this.config.selfConsumptionPriority
    
    return economicScore + reliabilityScore + selfConsumptionScore
  }
}

/**
 * Utility functions for load profile generation
 */
export function generateTypicalGrowFacilityLoad(
  days: number = 7,
  facilitySize: number = 1000, // m²
  lightingSchedule: { on: number; off: number } = { on: 6, off: 0 }
): LoadProfile[] {
  const profile: LoadProfile[] = []
  const baseLoad = facilitySize * 0.01 // 10W/m² base load
  const lightingLoad = facilitySize * 0.4 // 400W/m² lighting
  const hvacLoadDay = facilitySize * 0.05 // 50W/m² HVAC during lights on
  const hvacLoadNight = facilitySize * 0.02 // 20W/m² HVAC during lights off
  
  for (let day = 0; day < days; day++) {
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timestamp = new Date(2024, 0, day + 1, hour, minute)
        const isLightOn = hour >= lightingSchedule.on && hour < lightingSchedule.off
        
        profile.push({
          timestamp,
          demand: baseLoad + (isLightOn ? lightingLoad + hvacLoadDay : hvacLoadNight),
          lightingLoad: isLightOn ? lightingLoad : 0,
          hvacLoad: isLightOn ? hvacLoadDay : hvacLoadNight,
          otherLoad: baseLoad
        })
      }
    }
  }
  
  return profile
}

export function generateTimeOfUseRates(
  days: number = 7,
  onPeakRate: number = 0.25,
  offPeakRate: number = 0.10,
  onPeakHours: { start: number; end: number } = { start: 14, end: 21 },
  demandCharge: number = 15
): ElectricityRate[] {
  const rates: ElectricityRate[] = []
  
  for (let day = 0; day < days; day++) {
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timestamp = new Date(2024, 0, day + 1, hour, minute)
        const isOnPeak = hour >= onPeakHours.start && hour < onPeakHours.end
        const isWeekend = timestamp.getDay() === 0 || timestamp.getDay() === 6
        
        rates.push({
          timestamp,
          rate: (isOnPeak && !isWeekend) ? onPeakRate : offPeakRate,
          demandCharge,
          isOnPeak: isOnPeak && !isWeekend
        })
      }
    }
  }
  
  return rates
}