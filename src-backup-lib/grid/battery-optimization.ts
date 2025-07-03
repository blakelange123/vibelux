interface BatterySystem {
  systemId: string
  facilityId: string
  specifications: {
    capacity: number // kWh
    maxPower: number // kW
    efficiency: number // 0-1
    cycleLife: number // number of cycles
    degradationRate: number // % per cycle
    technology: 'lithium_ion' | 'lead_acid' | 'flow' | 'sodium'
  }
  currentState: {
    soc: number // State of charge (0-1)
    temperature: number // °C
    voltage: number // V
    current: number // A
    power: number // kW (positive = charging, negative = discharging)
    cycleCount: number
    health: number // 0-1
  }
  operationalLimits: {
    minSoc: number // 0-1
    maxSoc: number // 0-1
    maxChargeRate: number // C-rate
    maxDischargeRate: number // C-rate
    temperatureRange: { min: number; max: number }
    maxDepthOfDischarge: number // 0-1
  }
  economics: {
    capitalCost: number // $
    operationalCost: number // $/MWh
    maintenanceCost: number // $/year
    replacementCost: number // $
    degradationCost: number // $/cycle
  }
}

interface OptimizationObjective {
  primary: 'revenue' | 'cost_savings' | 'peak_shaving' | 'backup_power' | 'grid_support'
  weights: {
    energy_arbitrage: number // 0-1
    demand_charges: number // 0-1
    frequency_regulation: number // 0-1
    backup_reserve: number // 0-1
    grid_services: number // 0-1
  }
  constraints: {
    minBackupReserve: number // % of capacity reserved
    maxDailyThroughput: number // kWh
    operationalWindow: { start: number; end: number } // Hours (0-23)
  }
}

interface BatterySchedule {
  scheduleId: string
  batteryId: string
  timeHorizon: number // hours
  intervals: BatteryInterval[]
  optimization: {
    objective: string
    expectedRevenue: number // $
    expectedCycles: number
    degradationCost: number // $
    netBenefit: number // $
  }
}

interface BatteryInterval {
  timestamp: Date
  duration: number // minutes
  action: 'charge' | 'discharge' | 'idle'
  power: number // kW
  energy: number // kWh
  soc: number // 0-1
  price: number // $/MWh
  purpose: 'arbitrage' | 'demand_response' | 'frequency_reg' | 'backup' | 'peak_shaving'
  confidence: number // 0-1
}

interface MarketOpportunity {
  opportunityId: string
  type: 'energy_arbitrage' | 'demand_response' | 'frequency_regulation' | 'capacity_market'
  timeframe: Date[]
  priceSignal: number[] // $/MWh
  powerRequirement: number // kW
  duration: number // minutes
  compensation: number // $/MWh
  probability: number // 0-1
  risk: 'low' | 'medium' | 'high'
}

export class BatteryOptimizationEngine {
  private batteries: Map<string, BatterySystem> = new Map()
  private schedules: Map<string, BatterySchedule> = new Map()
  private objectives: Map<string, OptimizationObjective> = new Map()
  private marketData: any
  private forecastHorizon: number = 24 // hours

  constructor(marketData: any) {
    this.marketData = marketData
    this.initializeDefaultObjectives()
  }

  private initializeDefaultObjectives(): void {
    // Revenue maximization objective
    this.objectives.set('revenue_max', {
      primary: 'revenue',
      weights: {
        energy_arbitrage: 0.4,
        demand_charges: 0.3,
        frequency_regulation: 0.2,
        backup_reserve: 0.05,
        grid_services: 0.05
      },
      constraints: {
        minBackupReserve: 0.1, // 10% reserve
        maxDailyThroughput: 2.0, // 2 full cycles per day max
        operationalWindow: { start: 0, end: 23 }
      }
    })

    // Cost savings objective
    this.objectives.set('cost_savings', {
      primary: 'cost_savings',
      weights: {
        energy_arbitrage: 0.3,
        demand_charges: 0.5,
        frequency_regulation: 0.1,
        backup_reserve: 0.1,
        grid_services: 0.0
      },
      constraints: {
        minBackupReserve: 0.2, // 20% reserve
        maxDailyThroughput: 1.5, // 1.5 cycles per day max
        operationalWindow: { start: 6, end: 22 }
      }
    })

    // Peak shaving objective
    this.objectives.set('peak_shaving', {
      primary: 'peak_shaving',
      weights: {
        energy_arbitrage: 0.1,
        demand_charges: 0.7,
        frequency_regulation: 0.05,
        backup_reserve: 0.15,
        grid_services: 0.0
      },
      constraints: {
        minBackupReserve: 0.3, // 30% reserve
        maxDailyThroughput: 1.0, // 1 cycle per day max
        operationalWindow: { start: 8, end: 20 }
      }
    })

    // Grid support objective
    this.objectives.set('grid_support', {
      primary: 'grid_support',
      weights: {
        energy_arbitrage: 0.2,
        demand_charges: 0.2,
        frequency_regulation: 0.3,
        backup_reserve: 0.1,
        grid_services: 0.2
      },
      constraints: {
        minBackupReserve: 0.15, // 15% reserve
        maxDailyThroughput: 3.0, // 3 cycles per day max
        operationalWindow: { start: 0, end: 23 }
      }
    })
  }

  async registerBattery(battery: BatterySystem): Promise<void> {
    this.batteries.set(battery.systemId, battery)
  }

  async optimizeBatterySchedule(
    batteryId: string,
    objectiveId: string = 'revenue_max',
    timeHorizon: number = 24
  ): Promise<BatterySchedule> {
    const battery = this.batteries.get(batteryId)
    const objective = this.objectives.get(objectiveId)
    
    if (!battery || !objective) {
      throw new Error('Battery or objective not found')
    }

    // Get price forecasts and market opportunities
    const priceForecast = await this.getPriceForecast(timeHorizon)
    const marketOpportunities = await this.identifyMarketOpportunities(battery, timeHorizon)
    const demandForecast = await this.getDemandForecast(battery.facilityId, timeHorizon)

    // Generate optimal schedule
    const schedule = await this.generateOptimalSchedule(
      battery,
      objective,
      priceForecast,
      marketOpportunities,
      demandForecast,
      timeHorizon
    )

    this.schedules.set(batteryId, schedule)
    return schedule
  }

  private async getPriceForecast(hours: number): Promise<Array<{ timestamp: Date; price: number }>> {
    // Get day-ahead pricing and real-time forecasts
    const forecast = []
    const basePrice = 50 // $/MWh
    const now = new Date()

    for (let i = 0; i < hours; i++) {
      const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000)
      const hour = timestamp.getHours()
      
      // Simulate price patterns (higher during peak hours)
      let price = basePrice
      if (hour >= 7 && hour <= 10) price *= 1.8 // Morning peak
      else if (hour >= 17 && hour <= 21) price *= 2.2 // Evening peak
      else if (hour >= 22 || hour <= 6) price *= 0.6 // Off-peak
      
      // Add some volatility
      price *= (0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4)
      
      forecast.push({ timestamp, price: Math.round(price * 100) / 100 })
    }

    return forecast
  }

  private async identifyMarketOpportunities(
    battery: BatterySystem,
    hours: number
  ): Promise<MarketOpportunity[]> {
    const opportunities: MarketOpportunity[] = []
    const now = new Date()

    // Energy arbitrage opportunities
    const priceForecast = await this.getPriceForecast(hours)
    const priceRanges = this.findArbitrageOpportunities(priceForecast, battery)
    
    for (const range of priceRanges) {
      opportunities.push({
        opportunityId: `arbitrage_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF}`,
        type: 'energy_arbitrage',
        timeframe: range.timeframe,
        priceSignal: range.prices,
        powerRequirement: battery.specifications.maxPower * 0.8,
        duration: range.duration,
        compensation: range.profit,
        probability: range.confidence,
        risk: range.risk
      })
    }

    // Frequency regulation opportunities (continuous)
    opportunities.push({
      opportunityId: `freq_reg_${Date.now()}`,
      type: 'frequency_regulation',
      timeframe: [now, new Date(now.getTime() + hours * 60 * 60 * 1000)],
      priceSignal: [12], // $/MWh
      powerRequirement: battery.specifications.maxPower * 0.3,
      duration: hours * 60,
      compensation: 12,
      probability: 0.9,
      risk: 'low'
    })

    // Demand response opportunities (random events)
    if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.7) { // 30% chance of DR event
      const startHour = 14 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4 // Between 2-6 PM
      const startTime = new Date(now)
      startTime.setHours(Math.floor(startHour), (startHour % 1) * 60, 0, 0)
      
      opportunities.push({
        opportunityId: `dr_${Date.now()}`,
        type: 'demand_response',
        timeframe: [startTime, new Date(startTime.getTime() + 2 * 60 * 60 * 1000)],
        priceSignal: [150], // $/MWh
        powerRequirement: battery.specifications.maxPower,
        duration: 120,
        compensation: 150,
        probability: 0.8,
        risk: 'medium'
      })
    }

    return opportunities
  }

  private findArbitrageOpportunities(
    priceForecast: Array<{ timestamp: Date; price: number }>,
    battery: BatterySystem
  ): Array<{
    timeframe: Date[]
    prices: number[]
    duration: number
    profit: number
    confidence: number
    risk: 'low' | 'medium' | 'high'
  }> {
    const opportunities = []
    const minPriceDiff = 30 // $/MWh minimum spread
    const chargeDuration = Math.ceil(battery.specifications.capacity / battery.specifications.maxPower) // hours
    
    for (let i = 0; i < priceForecast.length - chargeDuration * 2; i++) {
      const chargeWindow = priceForecast.slice(i, i + chargeDuration)
      const avgChargePrice = chargeWindow.reduce((sum, p) => sum + p.price, 0) / chargeWindow.length
      
      // Look for discharge opportunities in the following hours
      for (let j = i + chargeDuration; j < Math.min(priceForecast.length, i + 12); j++) {
        const dischargeWindow = priceForecast.slice(j, j + chargeDuration)
        if (dischargeWindow.length < chargeDuration) continue
        
        const avgDischargePrice = dischargeWindow.reduce((sum, p) => sum + p.price, 0) / dischargeWindow.length
        const priceDiff = avgDischargePrice - avgChargePrice
        
        if (priceDiff > minPriceDiff) {
          const capacity = battery.specifications.capacity
          const efficiency = battery.specifications.efficiency
          const profit = capacity * priceDiff * efficiency / 1000 // Convert to MWh
          
          opportunities.push({
            timeframe: [chargeWindow[0].timestamp, dischargeWindow[dischargeWindow.length - 1].timestamp],
            prices: [...chargeWindow.map(p => p.price), ...dischargeWindow.map(p => p.price)],
            duration: chargeDuration * 2 * 60, // minutes
            profit,
            confidence: Math.min(0.95, 0.6 + (priceDiff / 100)), // Higher confidence for larger spreads
            risk: priceDiff > 100 ? 'high' : priceDiff > 50 ? 'medium' : 'low'
          })
        }
      }
    }
    
    return opportunities.sort((a, b) => b.profit - a.profit).slice(0, 5) // Top 5 opportunities
  }

  private async getDemandForecast(
    facilityId: string,
    hours: number
  ): Promise<Array<{ timestamp: Date; demand: number }>> {
    // Simulate facility demand forecast
    const forecast = []
    const now = new Date()
    const baseDemand = 500 // kW

    for (let i = 0; i < hours; i++) {
      const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000)
      const hour = timestamp.getHours()
      
      let demand = baseDemand
      if (hour >= 6 && hour <= 18) demand *= 1.4 // Daytime operations
      else demand *= 0.6 // Nighttime
      
      // Add some variability
      demand *= (0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4)
      
      forecast.push({ timestamp, demand: Math.round(demand) })
    }

    return forecast
  }

  private async generateOptimalSchedule(
    battery: BatterySystem,
    objective: OptimizationObjective,
    priceForecast: Array<{ timestamp: Date; price: number }>,
    opportunities: MarketOpportunity[],
    demandForecast: Array<{ timestamp: Date; demand: number }>,
    timeHorizon: number
  ): Promise<BatterySchedule> {
    const intervals: BatteryInterval[] = []
    let currentSoc = battery.currentState.soc
    let totalRevenue = 0
    let totalCycles = 0
    let degradationCost = 0

    // Initialize with 15-minute intervals
    const intervalDuration = 15 // minutes
    const totalIntervals = (timeHorizon * 60) / intervalDuration

    for (let i = 0; i < totalIntervals; i++) {
      const timestamp = new Date(Date.now() + i * intervalDuration * 60 * 1000)
      const priceData = this.getDataAtTime(priceForecast, timestamp)
      const demandData = this.getDataAtTime(demandForecast, timestamp)
      
      // Find relevant opportunities at this time
      const activeOpportunities = opportunities.filter(opp => 
        timestamp >= opp.timeframe[0] && timestamp <= opp.timeframe[1]
      )

      // Determine optimal action
      const action = this.determineOptimalAction(
        battery,
        objective,
        currentSoc,
        priceData,
        demandData,
        activeOpportunities,
        timestamp
      )

      // Calculate energy and power for this interval
      const power = this.calculateOptimalPower(battery, action, currentSoc)
      const energy = (power * intervalDuration) / 60 // kWh
      
      // Update SOC
      const efficiency = power > 0 ? battery.specifications.efficiency : 1 / battery.specifications.efficiency
      currentSoc += (energy * efficiency) / battery.specifications.capacity
      currentSoc = Math.max(battery.operationalLimits.minSoc, 
                           Math.min(battery.operationalLimits.maxSoc, currentSoc))

      // Calculate revenue for this interval
      const intervalRevenue = this.calculateIntervalRevenue(action, power, priceData, activeOpportunities, intervalDuration)
      totalRevenue += intervalRevenue

      intervals.push({
        timestamp,
        duration: intervalDuration,
        action: action.type,
        power,
        energy,
        soc: currentSoc,
        price: priceData?.price || 0,
        purpose: action.purpose,
        confidence: action.confidence
      })
    }

    // Calculate total cycles and degradation cost
    totalCycles = this.calculateTotalCycles(intervals)
    degradationCost = totalCycles * battery.economics.degradationCost

    const schedule: BatterySchedule = {
      scheduleId: `schedule_${battery.systemId}_${Date.now()}`,
      batteryId: battery.systemId,
      timeHorizon,
      intervals,
      optimization: {
        objective: objective.primary,
        expectedRevenue: Math.round(totalRevenue * 100) / 100,
        expectedCycles: Math.round(totalCycles * 100) / 100,
        degradationCost: Math.round(degradationCost * 100) / 100,
        netBenefit: Math.round((totalRevenue - degradationCost) * 100) / 100
      }
    }

    return schedule
  }

  private getDataAtTime<T extends { timestamp: Date }>(data: T[], timestamp: Date): T | null {
    return data.find(d => Math.abs(d.timestamp.getTime() - timestamp.getTime()) < 30 * 60 * 1000) || null
  }

  private determineOptimalAction(
    battery: BatterySystem,
    objective: OptimizationObjective,
    currentSoc: number,
    priceData: any,
    demandData: any,
    opportunities: MarketOpportunity[],
    timestamp: Date
  ): { type: 'charge' | 'discharge' | 'idle'; purpose: string; confidence: number } {
    const hour = timestamp.getHours()
    
    // Safety constraints first
    if (currentSoc <= battery.operationalLimits.minSoc + 0.05) {
      return { type: 'charge', purpose: 'safety', confidence: 1.0 }
    }
    if (currentSoc >= battery.operationalLimits.maxSoc - 0.05) {
      return { type: 'discharge', purpose: 'safety', confidence: 1.0 }
    }

    // Check for high-value opportunities
    const drOpportunity = opportunities.find(opp => opp.type === 'demand_response')
    if (drOpportunity && currentSoc > 0.5) {
      return { type: 'discharge', purpose: 'demand_response', confidence: drOpportunity.probability }
    }

    // Frequency regulation (if significant weight and adequate SOC)
    if (objective.weights.frequency_regulation > 0.15 && currentSoc > 0.4 && currentSoc < 0.8) {
      return { type: 'idle', purpose: 'frequency_reg', confidence: 0.9 }
    }

    // Energy arbitrage logic
    if (priceData) {
      const priceThreshold = this.getArbitrageThreshold(objective)
      
      if (priceData.price < priceThreshold.buy && currentSoc < 0.9) {
        return { type: 'charge', purpose: 'arbitrage', confidence: 0.8 }
      }
      if (priceData.price > priceThreshold.sell && currentSoc > 0.3) {
        return { type: 'discharge', purpose: 'arbitrage', confidence: 0.8 }
      }
    }

    // Peak shaving (during peak hours with high demand)
    if (objective.weights.demand_charges > 0.3 && 
        (hour >= 14 && hour <= 20) && 
        demandData && demandData.demand > 400 && 
        currentSoc > 0.4) {
      return { type: 'discharge', purpose: 'peak_shaving', confidence: 0.9 }
    }

    // Backup reserve maintenance
    const reserveTarget = objective.constraints.minBackupReserve + 0.1
    if (currentSoc < reserveTarget) {
      return { type: 'charge', purpose: 'backup', confidence: 0.7 }
    }

    return { type: 'idle', purpose: 'standby', confidence: 0.5 }
  }

  private getArbitrageThreshold(objective: OptimizationObjective): { buy: number; sell: number } {
    const baseThreshold = { buy: 40, sell: 80 } // $/MWh
    
    // Adjust based on objective weights
    if (objective.weights.energy_arbitrage > 0.3) {
      return { buy: baseThreshold.buy * 1.2, sell: baseThreshold.sell * 0.8 } // More aggressive
    }
    
    return baseThreshold
  }

  private calculateOptimalPower(
    battery: BatterySystem,
    action: { type: 'charge' | 'discharge' | 'idle' },
    currentSoc: number
  ): number {
    if (action.type === 'idle') return 0

    const maxPower = battery.specifications.maxPower
    let power = 0

    if (action.type === 'charge') {
      // Reduce charging power as SOC approaches maximum
      const socFactor = Math.max(0.1, 1 - (currentSoc - 0.8) * 5)
      power = maxPower * socFactor * 0.8 // 80% of max to extend battery life
    } else if (action.type === 'discharge') {
      // Reduce discharging power as SOC approaches minimum
      const socFactor = Math.max(0.1, (currentSoc - 0.2) * 2.5)
      power = -maxPower * socFactor * 0.8 // Negative for discharge
    }

    return Math.round(power * 100) / 100
  }

  private calculateIntervalRevenue(
    action: { type: 'charge' | 'discharge' | 'idle'; purpose: string },
    power: number,
    priceData: any,
    opportunities: MarketOpportunity[],
    duration: number
  ): number {
    let revenue = 0
    const energy = Math.abs(power) * duration / 60 / 1000 // MWh

    if (action.type === 'discharge') {
      // Revenue from energy sales
      if (priceData) {
        revenue += energy * priceData.price
      }

      // Additional revenue from market opportunities
      const drOpportunity = opportunities.find(opp => opp.type === 'demand_response')
      if (drOpportunity && action.purpose === 'demand_response') {
        revenue += energy * drOpportunity.compensation
      }

      const freqRegOpportunity = opportunities.find(opp => opp.type === 'frequency_regulation')
      if (freqRegOpportunity && action.purpose === 'frequency_reg') {
        revenue += energy * freqRegOpportunity.compensation
      }
    } else if (action.type === 'charge') {
      // Cost of energy purchase (negative revenue)
      if (priceData) {
        revenue -= energy * priceData.price
      }
    }

    return revenue
  }

  private calculateTotalCycles(intervals: BatteryInterval[]): number {
    let totalThroughput = 0

    for (const interval of intervals) {
      if (interval.action === 'charge' || interval.action === 'discharge') {
        totalThroughput += Math.abs(interval.energy)
      }
    }

    // Find the battery capacity to calculate cycles
    const batteryId = intervals[0] ? this.findBatteryIdFromSchedule(intervals[0]) : null
    const battery = batteryId ? this.batteries.get(batteryId) : null
    const capacity = battery?.specifications.capacity || 1000 // Default 1000 kWh

    return totalThroughput / (capacity * 2) // Full cycle = capacity * 2 (charge + discharge)
  }

  private findBatteryIdFromSchedule(interval: BatteryInterval): string | null {
    // In a real implementation, this would be tracked properly
    // For now, return the first battery ID
    return Array.from(this.batteries.keys())[0] || null
  }

  async executeBatterySchedule(scheduleId: string): Promise<boolean> {
    const schedule = this.schedules.get(scheduleId)
    if (!schedule) {
      console.error(`Schedule ${scheduleId} not found`)
      return false
    }

    
    // Start real-time execution
    this.executeScheduleRealTime(schedule)
    return true
  }

  private async executeScheduleRealTime(schedule: BatterySchedule): Promise<void> {
    const now = new Date()
    const futureIntervals = schedule.intervals.filter(interval => interval.timestamp > now)

    for (const interval of futureIntervals) {
      const delay = interval.timestamp.getTime() - Date.now()
      
      if (delay > 0) {
        setTimeout(async () => {
          await this.executeInterval(schedule.batteryId, interval)
        }, delay)
      }
    }
  }

  private async executeInterval(batteryId: string, interval: BatteryInterval): Promise<void> {
    const battery = this.batteries.get(batteryId)
    if (!battery) return

    
    // Update battery state
    battery.currentState.power = interval.power
    
    // In a real implementation, this would send commands to the battery management system
    await this.sendBatteryCommand(batteryId, interval.action, interval.power)
  }

  private async sendBatteryCommand(
    batteryId: string,
    action: 'charge' | 'discharge' | 'idle',
    power: number
  ): Promise<void> {
    // Interface with actual battery management system
  }

  getBatteryStatus(batteryId: string): BatterySystem | null {
    return this.batteries.get(batteryId) || null
  }

  getCurrentSchedule(batteryId: string): BatterySchedule | null {
    return this.schedules.get(batteryId) || null
  }

  async predictBatteryPerformance(
    batteryId: string,
    days: number = 30
  ): Promise<{
    expectedRevenue: number
    expectedCycles: number
    capacityDegradation: number
    efficiency: number
    optimalStrategy: string
  }> {
    const battery = this.batteries.get(batteryId)
    if (!battery) {
      throw new Error(`Battery ${batteryId} not found`)
    }

    // Test different strategies over the prediction period
    const strategies = ['revenue_max', 'cost_savings', 'peak_shaving', 'grid_support']
    const results = []

    for (const strategy of strategies) {
      const schedule = await this.optimizeBatterySchedule(batteryId, strategy, 24)
      const dailyRevenue = schedule.optimization.expectedRevenue
      const dailyCycles = schedule.optimization.expectedCycles

      results.push({
        strategy,
        revenue: dailyRevenue * days,
        cycles: dailyCycles * days,
        degradation: dailyCycles * days * battery.specifications.degradationRate / 100,
        efficiency: battery.specifications.efficiency * (1 - dailyCycles * days * battery.specifications.degradationRate / 10000)
      })
    }

    // Find optimal strategy
    const optimal = results.reduce((best, current) => 
      (current.revenue - current.cycles * battery.economics.degradationCost) > 
      (best.revenue - best.cycles * battery.economics.degradationCost) ? current : best
    )

    return {
      expectedRevenue: Math.round(optimal.revenue * 100) / 100,
      expectedCycles: Math.round(optimal.cycles * 100) / 100,
      capacityDegradation: Math.round(optimal.degradation * 100) / 100,
      efficiency: Math.round(optimal.efficiency * 10000) / 100, // Percentage
      optimalStrategy: optimal.strategy
    }
  }

  getAllBatteryStatuses(): Array<{ batteryId: string; status: BatterySystem; schedule?: BatterySchedule }> {
    const statuses = []
    
    for (const [batteryId, battery] of this.batteries) {
      const schedule = this.schedules.get(batteryId)
      statuses.push({ batteryId, status: battery, schedule })
    }

    return statuses
  }
}