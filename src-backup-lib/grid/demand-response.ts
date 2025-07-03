import { GridPricingAPI, GridPricingData, UtilitySignal } from './pricing-api'

interface FacilityLoad {
  facilityId: string
  currentLoad: number // kW
  maxLoad: number // kW
  minLoad: number // kW
  flexibility: number // 0-1 (how much can be curtailed)
  priority: 'critical' | 'high' | 'medium' | 'low'
  equipment: EquipmentProfile[]
}

interface EquipmentProfile {
  equipmentId: string
  type: 'lighting' | 'hvac' | 'fans' | 'pumps' | 'sensors' | 'other'
  currentPower: number // kW
  maxPower: number // kW
  minPower: number // kW
  curtailmentCapability: number // kW that can be reduced
  responsiveness: number // seconds to respond
  operationalConstraints: {
    maxCurtailmentDuration: number // minutes
    recoveryTime: number // minutes after curtailment
    temperatureLimits?: { min: number; max: number }
    lightingLimits?: { minLevel: number } // 0-1
  }
}

interface OptimizationStrategy {
  strategyId: string
  name: string
  objective: 'cost_minimize' | 'revenue_maximize' | 'risk_minimize' | 'balanced'
  parameters: {
    priceThreshold: number // $/MWh
    curtailmentBudget: number // % of total load
    responseTimeLimit: number // seconds
    profitMargin: number // minimum $/MWh profit
    riskTolerance: number // 0-1
  }
  constraints: {
    maxEvents: number // per day
    maxDuration: number // minutes per event
    minRecoveryTime: number // minutes between events
    priorityPreservation: boolean // maintain critical loads
  }
}

interface DemandResponseEvent {
  eventId: string
  utilitySignal: UtilitySignal
  recommendation: {
    participate: boolean
    curtailmentAmount: number // kW
    expectedRevenue: number // $
    confidence: number // 0-1
    risk: 'low' | 'medium' | 'high'
  }
  implementation: {
    equipmentActions: Array<{
      equipmentId: string
      action: 'curtail' | 'shed' | 'delay' | 'optimize'
      reduction: number // kW
      duration: number // minutes
    }>
    totalReduction: number // kW
    estimatedImpact: {
      operational: string
      financial: number
      environmental: string
    }
  }
}

export class DemandResponseOptimizer {
  private gridAPI: GridPricingAPI
  private facilities: Map<string, FacilityLoad> = new Map()
  private strategies: Map<string, OptimizationStrategy> = new Map()
  private activeEvents: Map<string, DemandResponseEvent> = new Map()
  private historicalPerformance: Array<{
    eventId: string
    actual: number
    predicted: number
    revenue: number
    accuracy: number
  }> = []

  constructor(gridAPI: GridPricingAPI) {
    this.gridAPI = gridAPI
    this.initializeDefaultStrategies()
    this.setupEventListeners()
  }

  private initializeDefaultStrategies(): void {
    // Cost minimization strategy
    this.strategies.set('cost_minimize', {
      strategyId: 'cost_minimize',
      name: 'Cost Minimization',
      objective: 'cost_minimize',
      parameters: {
        priceThreshold: 100, // $/MWh
        curtailmentBudget: 0.3, // 30%
        responseTimeLimit: 300, // 5 minutes
        profitMargin: 25, // $/MWh
        riskTolerance: 0.3
      },
      constraints: {
        maxEvents: 3,
        maxDuration: 120, // 2 hours
        minRecoveryTime: 60, // 1 hour
        priorityPreservation: true
      }
    })

    // Revenue maximization strategy
    this.strategies.set('revenue_maximize', {
      strategyId: 'revenue_maximize', 
      name: 'Revenue Maximization',
      objective: 'revenue_maximize',
      parameters: {
        priceThreshold: 75, // $/MWh
        curtailmentBudget: 0.5, // 50%
        responseTimeLimit: 180, // 3 minutes
        profitMargin: 15, // $/MWh
        riskTolerance: 0.7
      },
      constraints: {
        maxEvents: 5,
        maxDuration: 180, // 3 hours
        minRecoveryTime: 30, // 30 minutes
        priorityPreservation: false
      }
    })

    // Balanced strategy
    this.strategies.set('balanced', {
      strategyId: 'balanced',
      name: 'Balanced Optimization',
      objective: 'balanced',
      parameters: {
        priceThreshold: 85, // $/MWh
        curtailmentBudget: 0.4, // 40%
        responseTimeLimit: 240, // 4 minutes
        profitMargin: 20, // $/MWh
        riskTolerance: 0.5
      },
      constraints: {
        maxEvents: 4,
        maxDuration: 150, // 2.5 hours
        minRecoveryTime: 45, // 45 minutes
        priorityPreservation: true
      }
    })
  }

  private setupEventListeners(): void {
    this.gridAPI.addEventListener('priceUpdate', (data: GridPricingData) => {
      this.evaluateOpportunities(data)
    })

    this.gridAPI.addEventListener('volatilityAlert', (data: GridPricingData) => {
      this.handleVolatilityAlert(data)
    })
  }

  async registerFacility(facility: FacilityLoad): Promise<void> {
    this.facilities.set(facility.facilityId, facility)
  }

  async optimizeDemandResponse(
    utilitySignal: UtilitySignal,
    strategyId: string = 'balanced'
  ): Promise<DemandResponseEvent> {
    const strategy = this.strategies.get(strategyId)
    if (!strategy) {
      throw new Error(`Strategy ${strategyId} not found`)
    }

    // Analyze the utility signal
    const signalAnalysis = this.analyzeUtilitySignal(utilitySignal)
    
    // Calculate potential curtailment across all facilities
    const curtailmentOptions = this.calculateCurtailmentOptions(utilitySignal, strategy)
    
    // Optimize facility participation
    const optimization = this.optimizeParticipation(
      utilitySignal,
      curtailmentOptions,
      strategy,
      signalAnalysis
    )

    // Create demand response event
    const event: DemandResponseEvent = {
      eventId: `dr_${Date.now()}`,
      utilitySignal,
      recommendation: optimization.recommendation,
      implementation: optimization.implementation
    }

    // Store active event
    if (optimization.recommendation.participate) {
      this.activeEvents.set(event.eventId, event)
    }

    return event
  }

  private analyzeUtilitySignal(signal: UtilitySignal): {
    attractiveness: number
    risk: 'low' | 'medium' | 'high'
    complexity: number
    timeConstraints: number
  } {
    const duration = (signal.endTime.getTime() - signal.startTime.getTime()) / (1000 * 60) // minutes
    const compensationPerMW = signal.compensationRate
    const penalty = signal.penalties.nonCompliance
    
    // Calculate attractiveness (0-1)
    let attractiveness = 0
    attractiveness += Math.min(1, compensationPerMW / 150) * 0.4 // Price component
    attractiveness += Math.min(1, signal.targetReduction / 10) * 0.3 // Scale component
    attractiveness += (signal.priority === 'high' ? 0.8 : signal.priority === 'medium' ? 0.6 : 0.4) * 0.3 // Priority component

    // Calculate risk
    const penaltyRatio = penalty / compensationPerMW
    const risk = penaltyRatio > 0.5 ? 'high' : penaltyRatio > 0.2 ? 'medium' : 'low'

    // Calculate complexity (0-1)
    const complexity = Math.min(1, (duration / 240) + (signal.targetReduction / 50))

    // Time constraints (0-1, lower is more constrained)
    const responseTime = (signal.startTime.getTime() - Date.now()) / (1000 * 60) // minutes
    const timeConstraints = Math.min(1, responseTime / 60) // Normalize to 1 hour

    return { attractiveness, risk, complexity, timeConstraints }
  }

  private calculateCurtailmentOptions(
    signal: UtilitySignal,
    strategy: OptimizationStrategy
  ): Array<{
    facilityId: string
    equipment: Array<{
      equipmentId: string
      maxCurtailment: number
      responsiveness: number
      operationalImpact: number
    }>
    totalCapacity: number
    flexibility: number
  }> {
    const options = []

    for (const [facilityId, facility] of this.facilities) {
      const facilityOption = {
        facilityId,
        equipment: [],
        totalCapacity: 0,
        flexibility: facility.flexibility
      }

      for (const equipment of facility.equipment) {
        if (this.canCurtailEquipment(equipment, signal, strategy)) {
          const curtailment = this.calculateEquipmentCurtailment(equipment, signal, strategy)
          
          facilityOption.equipment.push({
            equipmentId: equipment.equipmentId,
            maxCurtailment: curtailment.maxReduction,
            responsiveness: equipment.responsiveness,
            operationalImpact: curtailment.operationalImpact
          })
          
          facilityOption.totalCapacity += curtailment.maxReduction
        }
      }

      if (facilityOption.totalCapacity > 0) {
        options.push(facilityOption)
      }
    }

    return options
  }

  private canCurtailEquipment(
    equipment: EquipmentProfile,
    signal: UtilitySignal,
    strategy: OptimizationStrategy
  ): boolean {
    const duration = (signal.endTime.getTime() - signal.startTime.getTime()) / (1000 * 60)
    
    // Check if equipment can respond in time
    if (equipment.responsiveness > strategy.parameters.responseTimeLimit) {
      return false
    }

    // Check duration constraints
    if (duration > equipment.operationalConstraints.maxCurtailmentDuration) {
      return false
    }

    // Check if equipment has curtailment capability
    if (equipment.curtailmentCapability <= 0) {
      return false
    }

    return true
  }

  private calculateEquipmentCurtailment(
    equipment: EquipmentProfile,
    signal: UtilitySignal,
    strategy: OptimizationStrategy
  ): {
    maxReduction: number
    operationalImpact: number
    efficiency: number
  } {
    const duration = (signal.endTime.getTime() - signal.startTime.getTime()) / (1000 * 60)
    
    // Calculate maximum safe reduction
    let maxReduction = equipment.curtailmentCapability
    
    // Adjust for duration constraints
    if (duration > equipment.operationalConstraints.maxCurtailmentDuration * 0.8) {
      maxReduction *= 0.7 // Reduce capacity for longer events
    }

    // Calculate operational impact (0-1, higher is more disruptive)
    let operationalImpact = 0
    switch (equipment.type) {
      case 'lighting':
        operationalImpact = 0.3 // Moderate impact
        break
      case 'hvac':
        operationalImpact = 0.7 // High impact
        break
      case 'fans':
        operationalImpact = 0.4 // Moderate impact
        break
      case 'pumps':
        operationalImpact = 0.8 // Very high impact
        break
      case 'sensors':
        operationalImpact = 0.1 // Low impact
        break
      default:
        operationalImpact = 0.5
    }

    // Adjust for strategy risk tolerance
    if (strategy.parameters.riskTolerance < 0.5) {
      maxReduction *= 0.8 // Conservative approach
      operationalImpact *= 1.2
    }

    const efficiency = maxReduction / (operationalImpact + 0.1) // Avoid division by zero

    return {
      maxReduction: Math.max(0, maxReduction),
      operationalImpact: Math.min(1, operationalImpact),
      efficiency
    }
  }

  private optimizeParticipation(
    signal: UtilitySignal,
    options: any[],
    strategy: OptimizationStrategy,
    analysis: any
  ): {
    recommendation: DemandResponseEvent['recommendation']
    implementation: DemandResponseEvent['implementation']
  } {
    // Sort options by efficiency and impact
    const sortedOptions = options.sort((a, b) => {
      const aScore = a.equipment.reduce((sum, eq) => sum + eq.maxCurtailment / (eq.operationalImpact + 0.1), 0)
      const bScore = b.equipment.reduce((sum, eq) => sum + eq.maxCurtailment / (eq.operationalImpact + 0.1), 0)
      return bScore - aScore
    })

    let totalCurtailment = 0
    const equipmentActions = []
    const targetReduction = Math.min(signal.targetReduction * 1000, // Convert MW to kW
      this.getTotalFacilityCapacity() * strategy.parameters.curtailmentBudget)

    // Select equipment for curtailment
    for (const facilityOption of sortedOptions) {
      if (totalCurtailment >= targetReduction) break

      for (const equipment of facilityOption.equipment) {
        if (totalCurtailment >= targetReduction) break

        const curtailmentAmount = Math.min(
          equipment.maxCurtailment,
          targetReduction - totalCurtailment
        )

        if (curtailmentAmount > 0.1) { // Minimum 0.1 kW threshold
          equipmentActions.push({
            equipmentId: equipment.equipmentId,
            action: 'curtail' as const,
            reduction: curtailmentAmount,
            duration: (signal.endTime.getTime() - signal.startTime.getTime()) / (1000 * 60)
          })

          totalCurtailment += curtailmentAmount
        }
      }
    }

    // Calculate expected revenue
    const duration = (signal.endTime.getTime() - signal.startTime.getTime()) / (1000 * 60 * 60) // hours
    const expectedRevenue = (totalCurtailment / 1000) * signal.compensationRate * duration

    // Calculate operational cost
    const operationalCost = equipmentActions.reduce((sum, action) => {
      const impact = this.getEquipmentOperationalCost(action.equipmentId, action.reduction, action.duration)
      return sum + impact
    }, 0)

    const netRevenue = expectedRevenue - operationalCost

    // Decision logic
    const participate = 
      netRevenue > strategy.parameters.profitMargin &&
      analysis.attractiveness > 0.5 &&
      totalCurtailment >= signal.targetReduction * 1000 * 0.8 && // Can meet at least 80% of target
      analysis.risk !== 'high' || strategy.parameters.riskTolerance > 0.7

    return {
      recommendation: {
        participate,
        curtailmentAmount: totalCurtailment,
        expectedRevenue: Math.max(0, netRevenue),
        confidence: this.calculateConfidence(analysis, strategy, totalCurtailment, signal.targetReduction * 1000),
        risk: this.assessOverallRisk(analysis, strategy, equipmentActions)
      },
      implementation: {
        equipmentActions,
        totalReduction: totalCurtailment,
        estimatedImpact: {
          operational: this.assessOperationalImpact(equipmentActions),
          financial: netRevenue,
          environmental: `Reduced grid strain by ${(totalCurtailment / 1000).toFixed(2)} MW`
        }
      }
    }
  }

  private getTotalFacilityCapacity(): number {
    return Array.from(this.facilities.values())
      .reduce((sum, facility) => sum + facility.maxLoad, 0)
  }

  private getEquipmentOperationalCost(
    equipmentId: string,
    reduction: number,
    duration: number
  ): number {
    // Simplified operational cost calculation
    // In reality, this would be much more sophisticated
    return reduction * duration * 0.02 // $0.02 per kW per minute
  }

  private calculateConfidence(
    analysis: any,
    strategy: OptimizationStrategy,
    achievableCurtailment: number,
    targetCurtailment: number
  ): number {
    let confidence = 0.7 // Base confidence

    // Adjust for historical performance
    const recentAccuracy = this.getRecentAccuracy()
    confidence += (recentAccuracy - 0.8) * 0.3

    // Adjust for target achievement
    const achievementRatio = achievableCurtailment / targetCurtailment
    confidence += Math.min(0.2, (achievementRatio - 0.8) * 0.5)

    // Adjust for time constraints
    confidence += analysis.timeConstraints * 0.1

    return Math.max(0.1, Math.min(1, confidence))
  }

  private assessOverallRisk(
    analysis: any,
    strategy: OptimizationStrategy,
    actions: any[]
  ): 'low' | 'medium' | 'high' {
    let riskScore = 0

    // Base risk from signal analysis
    riskScore += analysis.risk === 'high' ? 0.6 : analysis.risk === 'medium' ? 0.3 : 0.1

    // Risk from equipment complexity
    const complexEquipment = actions.filter(a => ['hvac', 'pumps'].includes(this.getEquipmentType(a.equipmentId)))
    riskScore += (complexEquipment.length / actions.length) * 0.3

    // Risk from curtailment amount
    const totalCurtailment = actions.reduce((sum, a) => sum + a.reduction, 0)
    const curtailmentRatio = totalCurtailment / this.getTotalFacilityCapacity()
    if (curtailmentRatio > 0.4) riskScore += 0.4

    if (riskScore > 0.7) return 'high'
    if (riskScore > 0.4) return 'medium'
    return 'low'
  }

  private assessOperationalImpact(actions: any[]): string {
    const criticalActions = actions.filter(a => ['hvac', 'pumps'].includes(this.getEquipmentType(a.equipmentId)))
    const totalReduction = actions.reduce((sum, a) => sum + a.reduction, 0)

    if (criticalActions.length > 0 && totalReduction > 100) {
      return 'High impact - Critical systems affected'
    } else if (totalReduction > 50) {
      return 'Medium impact - Noticeable operational changes'
    } else {
      return 'Low impact - Minimal operational disruption'
    }
  }

  private getEquipmentType(equipmentId: string): string {
    for (const facility of this.facilities.values()) {
      const equipment = facility.equipment.find(eq => eq.equipmentId === equipmentId)
      if (equipment) return equipment.type
    }
    return 'other'
  }

  private getRecentAccuracy(): number {
    if (this.historicalPerformance.length === 0) return 0.8

    const recent = this.historicalPerformance.slice(-10)
    return recent.reduce((sum, perf) => sum + perf.accuracy, 0) / recent.length
  }

  async evaluateOpportunities(pricingData: GridPricingData): Promise<void> {
    // Check for autonomous demand response opportunities
    if (pricingData.lmp > 150) { // High price threshold
      const signals = await this.gridAPI.getUtilitySignals()
      
      for (const signal of signals) {
        if (signal.signalType === 'demand_response') {
          const event = await this.optimizeDemandResponse(signal)
          if (event.recommendation.participate) {
            // Could trigger automatic participation based on strategy
          }
        }
      }
    }
  }

  private async handleVolatilityAlert(pricingData: GridPricingData): Promise<void> {
    // Implement emergency response logic
  }

  getActiveEvents(): DemandResponseEvent[] {
    return Array.from(this.activeEvents.values())
  }

  async executeEvent(eventId: string): Promise<boolean> {
    const event = this.activeEvents.get(eventId)
    if (!event) return false

    // Execute equipment actions
    try {
      for (const action of event.implementation.equipmentActions) {
        await this.executeEquipmentAction(action)
      }
      
      return true
    } catch (error) {
      console.error(`Failed to execute demand response event ${eventId}:`, error)
      return false
    }
  }

  private async executeEquipmentAction(action: any): Promise<void> {
    // This would interface with the facility control systems
    // Implementation depends on the specific control protocols
  }
}