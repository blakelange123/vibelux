import { GridPricingAPI, UtilitySignal } from './pricing-api'
import { DemandResponseOptimizer } from './demand-response'

interface SignalProcessor {
  signalType: UtilitySignal['signalType']
  priority: number // Higher number = higher priority
  handler: (signal: UtilitySignal, context: ProcessingContext) => Promise<SignalResponse>
}

interface ProcessingContext {
  facilityCapacity: number // kW
  currentLoad: number // kW
  availableFlexibility: number // kW
  batteryCapacity?: number // kWh
  batterySOC?: number // 0-1
  operationalConstraints: {
    criticalLoads: string[] // Equipment IDs that cannot be curtailed
    maxCurtailmentDuration: number // minutes
    recoveryTimeRequired: number // minutes
  }
  economicFactors: {
    currentElectricityRate: number // $/MWh
    demandChargeRate: number // $/kW
    peakDemandThreshold: number // kW
  }
}

interface SignalResponse {
  accept: boolean
  curtailmentAmount: number // kW
  responseTime: number // seconds
  confidence: number // 0-1
  estimatedRevenue: number // $
  estimatedCost: number // $
  operationalImpact: 'minimal' | 'moderate' | 'significant' | 'severe'
  alternativeActions?: Array<{
    action: string
    impact: number
    timeframe: number
  }>
}

interface CurtailmentAction {
  actionId: string
  equipmentId: string
  type: 'power_reduction' | 'load_shift' | 'complete_shutdown' | 'ramp_down'
  targetReduction: number // kW
  duration: number // minutes
  rampRate: number // kW/min
  constraints: {
    minRecoveryTime: number // minutes
    maxConsecutiveActions: number
    temperatureLimits?: { min: number; max: number }
    processConstraints?: string[]
  }
  executionStatus: 'pending' | 'executing' | 'completed' | 'failed'
  actualReduction?: number // kW (measured)
}

interface UtilityContract {
  contractId: string
  utilityId: string
  programType: 'demand_response' | 'interruptible_load' | 'time_of_use' | 'critical_peak'
  terms: {
    baseCompensation: number // $/kW-month
    performancePayment: number // $/kWh curtailed
    availabilityPayment: number // $/kW-month
    penaltyRate: number // $/kWh under-performance
    maxCallsPerMonth: number
    maxCallsPerYear: number
    maxDurationPerCall: number // hours
    minNoticeTime: number // minutes
  }
  participationLevel: number // kW enrolled
  optOutPenalties: {
    seasonal: number // $ per opt-out
    emergency: number // $ per emergency opt-out
    consecutive: number // $ per consecutive opt-out
  }
}

export class UtilitySignalProcessor {
  private gridAPI: GridPricingAPI
  private demandResponse: DemandResponseOptimizer
  private signalProcessors: Map<string, SignalProcessor> = new Map()
  private activeSignals: Map<string, UtilitySignal> = new Map()
  private activeCurtailments: Map<string, CurtailmentAction[]> = new Map()
  private contracts: Map<string, UtilityContract> = new Map()
  private signalHistory: Array<{
    signal: UtilitySignal
    response: SignalResponse
    actualPerformance: {
      curtailmentAchieved: number
      responseTime: number
      duration: number
      revenue: number
    }
    timestamp: Date
  }> = []

  constructor(gridAPI: GridPricingAPI, demandResponse: DemandResponseOptimizer) {
    this.gridAPI = gridAPI
    this.demandResponse = demandResponse
    this.initializeSignalProcessors()
    this.setupSignalMonitoring()
  }

  private initializeSignalProcessors(): void {
    // Demand Response Signal Processor
    this.signalProcessors.set('demand_response', {
      signalType: 'demand_response',
      priority: 100,
      handler: async (signal, context) => {
        return this.processDemandResponseSignal(signal, context)
      }
    })

    // Load Shed Signal Processor  
    this.signalProcessors.set('load_shed', {
      signalType: 'load_shed',
      priority: 200, // Higher priority than demand response
      handler: async (signal, context) => {
        return this.processLoadShedSignal(signal, context)
      }
    })

    // Frequency Regulation Signal Processor
    this.signalProcessors.set('frequency_regulation', {
      signalType: 'frequency_regulation',
      priority: 300, // Highest priority for grid stability
      handler: async (signal, context) => {
        return this.processFrequencyRegulationSignal(signal, context)
      }
    })

    // Voltage Support Signal Processor
    this.signalProcessors.set('voltage_support', {
      signalType: 'voltage_support',
      priority: 250,
      handler: async (signal, context) => {
        return this.processVoltageSupportSignal(signal, context)
      }
    })
  }

  private setupSignalMonitoring(): void {
    // Monitor for new utility signals every 30 seconds
    setInterval(async () => {
      await this.monitorUtilitySignals()
    }, 30 * 1000)

    // Process active signals every 10 seconds
    setInterval(async () => {
      await this.processActiveSignals()
    }, 10 * 1000)

    // Monitor curtailment performance every 5 seconds
    setInterval(async () => {
      await this.monitorCurtailmentPerformance()
    }, 5 * 1000)
  }

  async registerUtilityContract(contract: UtilityContract): Promise<void> {
    this.contracts.set(contract.contractId, contract)
  }

  private async monitorUtilitySignals(): Promise<void> {
    try {
      const signals = await this.gridAPI.getUtilitySignals()
      
      for (const signal of signals) {
        if (!this.activeSignals.has(signal.signalType)) {
          await this.processNewSignal(signal)
        }
      }
    } catch (error) {
      console.error('Error monitoring utility signals:', error)
    }
  }

  private async processNewSignal(signal: UtilitySignal): Promise<void> {
    
    const processor = this.signalProcessors.get(signal.signalType)
    if (!processor) {
      console.warn(`No processor found for signal type: ${signal.signalType}`)
      return
    }

    // Gather processing context
    const context = await this.gatherProcessingContext(signal)
    
    // Process the signal
    const response = await processor.handler(signal, context)
    
    // Store signal and response
    this.activeSignals.set(signal.signalType, signal)
    this.signalHistory.push({
      signal,
      response,
      actualPerformance: {
        curtailmentAchieved: 0,
        responseTime: 0,
        duration: 0,
        revenue: 0
      },
      timestamp: new Date()
    })

    // Execute response if accepted
    if (response.accept) {
      await this.executeSignalResponse(signal, response, context)
    } else {
    }
  }

  private async gatherProcessingContext(signal: UtilitySignal): Promise<ProcessingContext> {
    // In a real implementation, this would gather data from facility systems
    return {
      facilityCapacity: 2000, // kW
      currentLoad: 1200, // kW
      availableFlexibility: 400, // kW
      batteryCapacity: 1000, // kWh
      batterySOC: 0.7, // 70%
      operationalConstraints: {
        criticalLoads: ['lighting_zone_1', 'security_systems', 'hvac_critical'],
        maxCurtailmentDuration: 240, // 4 hours
        recoveryTimeRequired: 60 // 1 hour
      },
      economicFactors: {
        currentElectricityRate: 85, // $/MWh
        demandChargeRate: 15, // $/kW
        peakDemandThreshold: 1500 // kW
      }
    }
  }

  private async processDemandResponseSignal(
    signal: UtilitySignal,
    context: ProcessingContext
  ): Promise<SignalResponse> {
    const requiredReduction = signal.targetReduction * 1000 // Convert MW to kW
    const duration = (signal.endTime.getTime() - signal.startTime.getTime()) / (1000 * 60) // minutes
    
    // Check if we can meet the requirement
    const maxPossibleReduction = Math.min(
      context.availableFlexibility,
      context.currentLoad * 0.4 // Max 40% load reduction
    )

    const canMeetRequirement = maxPossibleReduction >= requiredReduction * 0.8 // 80% threshold
    
    // Calculate economic benefit
    const revenue = (requiredReduction / 1000) * signal.compensationRate * (duration / 60)
    const operationalCost = this.calculateOperationalCost(requiredReduction, duration, context)
    const netBenefit = revenue - operationalCost
    
    // Assess operational impact
    const loadReductionPercentage = requiredReduction / context.currentLoad
    let operationalImpact: SignalResponse['operationalImpact']
    
    if (loadReductionPercentage < 0.1) operationalImpact = 'minimal'
    else if (loadReductionPercentage < 0.25) operationalImpact = 'moderate'
    else if (loadReductionPercentage < 0.4) operationalImpact = 'significant'
    else operationalImpact = 'severe'

    // Decision logic
    const accept = canMeetRequirement && 
                   netBenefit > 100 && // Minimum $100 net benefit
                   operationalImpact !== 'severe' &&
                   duration <= context.operationalConstraints.maxCurtailmentDuration

    return {
      accept,
      curtailmentAmount: accept ? Math.min(requiredReduction, maxPossibleReduction) : 0,
      responseTime: accept ? 300 : 0, // 5 minutes response time
      confidence: this.calculateResponseConfidence(signal, context, accept),
      estimatedRevenue: accept ? revenue : 0,
      estimatedCost: accept ? operationalCost : 0,
      operationalImpact,
      alternativeActions: accept ? [] : this.generateAlternativeActions(signal, context)
    }
  }

  private async processLoadShedSignal(
    signal: UtilitySignal,
    context: ProcessingContext
  ): Promise<SignalResponse> {
    // Load shed is typically emergency - higher acceptance threshold
    const requiredReduction = signal.targetReduction * 1000 // Convert MW to kW
    const isEmergency = signal.priority === 'emergency'
    
    // Emergency signals get priority - shed non-critical loads immediately
    const maxEmergencyReduction = context.currentLoad * (isEmergency ? 0.6 : 0.3)
    const availableReduction = Math.min(context.availableFlexibility, maxEmergencyReduction)
    
    const canMeetRequirement = availableReduction >= requiredReduction * 0.7 // 70% threshold for emergency
    
    // Higher compensation for load shed typically
    const revenue = (requiredReduction / 1000) * signal.compensationRate * 2 // Assume 2x duration
    const operationalCost = this.calculateOperationalCost(requiredReduction, 120, context) // 2 hours
    
    const accept = canMeetRequirement && (isEmergency || revenue > operationalCost * 1.5)
    
    return {
      accept,
      curtailmentAmount: accept ? Math.min(requiredReduction, availableReduction) : 0,
      responseTime: accept ? (isEmergency ? 60 : 180) : 0, // 1-3 minutes
      confidence: isEmergency ? 0.95 : 0.8,
      estimatedRevenue: accept ? revenue : 0,
      estimatedCost: accept ? operationalCost : 0,
      operationalImpact: isEmergency ? 'significant' : 'moderate'
    }
  }

  private async processFrequencyRegulationSignal(
    signal: UtilitySignal,
    context: ProcessingContext
  ): Promise<SignalResponse> {
    // Frequency regulation requires fast response and flexibility
    const requiredCapacity = signal.targetReduction * 1000 // kW
    const hasQuickResponse = context.batteryCapacity && context.batterySOC > 0.3
    
    // Battery systems are ideal for frequency regulation
    const availableCapacity = hasQuickResponse ? 
      Math.min(requiredCapacity, context.batteryCapacity * 0.3) : // 30% of battery capacity
      Math.min(requiredCapacity, context.availableFlexibility * 0.2) // Limited without battery
    
    const canParticipate = availableCapacity >= requiredCapacity * 0.5
    
    // Frequency regulation typically has continuous compensation
    const hourlyRevenue = (availableCapacity / 1000) * signal.compensationRate
    const dailyRevenue = hourlyRevenue * 24
    
    return {
      accept: canParticipate && hasQuickResponse,
      curtailmentAmount: canParticipate ? availableCapacity : 0,
      responseTime: hasQuickResponse ? 4 : 30, // 4 seconds with battery, 30 without
      confidence: hasQuickResponse ? 0.9 : 0.6,
      estimatedRevenue: canParticipate ? dailyRevenue : 0,
      estimatedCost: canParticipate ? dailyRevenue * 0.1 : 0, // 10% operational cost
      operationalImpact: hasQuickResponse ? 'minimal' : 'moderate'
    }
  }

  private async processVoltageSupportSignal(
    signal: UtilitySignal,
    context: ProcessingContext
  ): Promise<SignalResponse> {
    // Voltage support through reactive power or load adjustment
    const requiredSupport = signal.targetReduction * 1000 // kW equivalent
    
    // Assume we can provide voltage support through load management
    const availableSupport = context.availableFlexibility * 0.3 // 30% can be used for voltage support
    
    const canProvideSupport = availableSupport >= requiredSupport * 0.6
    
    const revenue = (requiredSupport / 1000) * signal.compensationRate * 4 // 4 hours typical
    const operationalCost = revenue * 0.15 // 15% operational cost
    
    return {
      accept: canProvideSupport,
      curtailmentAmount: canProvideSupport ? Math.min(requiredSupport, availableSupport) : 0,
      responseTime: canProvideSupport ? 120 : 0, // 2 minutes
      confidence: 0.75,
      estimatedRevenue: canProvideSupport ? revenue : 0,
      estimatedCost: canProvideSupport ? operationalCost : 0,
      operationalImpact: 'minimal'
    }
  }

  private calculateOperationalCost(
    reductionAmount: number,
    duration: number,
    context: ProcessingContext
  ): number {
    // Base operational cost from lost productivity/comfort
    const baseCost = (reductionAmount / 1000) * 20 * (duration / 60) // $20/MWh-hour
    
    // Additional costs for critical operations
    const criticalLoadCost = Math.min(reductionAmount * 0.2, 50) * (duration / 60) // Max $50/hour
    
    // Recovery costs (equipment restart, temperature recovery, etc.)
    const recoveryCost = reductionAmount * 0.05 // $0.05/kW flat recovery cost
    
    return baseCost + criticalLoadCost + recoveryCost
  }

  private calculateResponseConfidence(
    signal: UtilitySignal,
    context: ProcessingContext,
    accepted: boolean
  ): number {
    if (!accepted) return 0
    
    let confidence = 0.8 // Base confidence
    
    // Historical performance adjustment
    const recentPerformance = this.getRecentPerformanceAccuracy()
    confidence += (recentPerformance - 0.8) * 0.3
    
    // Capacity margin adjustment
    const capacityMargin = context.availableFlexibility / (signal.targetReduction * 1000)
    if (capacityMargin > 1.5) confidence += 0.1
    else if (capacityMargin < 1.2) confidence -= 0.1
    
    // Signal priority adjustment
    if (signal.priority === 'emergency') confidence += 0.05
    
    return Math.max(0.1, Math.min(1.0, confidence))
  }

  private generateAlternativeActions(
    signal: UtilitySignal,
    context: ProcessingContext
  ): Array<{ action: string; impact: number; timeframe: number }> {
    const alternatives = []
    
    // Partial participation
    if (context.availableFlexibility > signal.targetReduction * 500) { // 50% of requirement
      alternatives.push({
        action: 'Partial curtailment (50% of requested)',
        impact: signal.targetReduction * 500,
        timeframe: 30 // 30 minutes notice needed
      })
    }
    
    // Battery-only response
    if (context.batteryCapacity && context.batterySOC > 0.4) {
      alternatives.push({
        action: 'Battery-only response',
        impact: Math.min(signal.targetReduction * 1000, context.batteryCapacity * 0.3),
        timeframe: 5 // 5 minutes
      })
    }
    
    // Delayed response
    alternatives.push({
      action: 'Delayed response (2 hours later)',
      impact: Math.min(signal.targetReduction * 1000, context.availableFlexibility),
      timeframe: 120 // 2 hours delay
    })
    
    return alternatives
  }

  private async executeSignalResponse(
    signal: UtilitySignal,
    response: SignalResponse,
    context: ProcessingContext
  ): Promise<void> {
    
    // Generate curtailment actions
    const actions = await this.generateCurtailmentActions(signal, response, context)
    
    // Store actions for monitoring
    this.activeCurtailments.set(signal.signalType, actions)
    
    // Execute actions with proper timing
    await this.executeCurtailmentActions(actions, signal.startTime)
    
    // Submit response to utility
    await this.submitUtilityResponse(signal, response)
  }

  private async generateCurtailmentActions(
    signal: UtilitySignal,
    response: SignalResponse,
    context: ProcessingContext
  ): Promise<CurtailmentAction[]> {
    const actions: CurtailmentAction[] = []
    const totalReduction = response.curtailmentAmount
    let remainingReduction = totalReduction
    
    // Equipment priority for curtailment (non-critical first)
    const equipmentPriority = [
      { id: 'hvac_non_critical', capacity: 200, type: 'ramp_down' as const },
      { id: 'lighting_non_essential', capacity: 150, type: 'power_reduction' as const },
      { id: 'auxiliary_equipment', capacity: 100, type: 'complete_shutdown' as const },
      { id: 'process_equipment_flexible', capacity: 250, type: 'power_reduction' as const },
      { id: 'battery_discharge', capacity: context.batteryCapacity ? 300 : 0, type: 'power_reduction' as const }
    ]
    
    for (const equipment of equipmentPriority) {
      if (remainingReduction <= 0) break
      if (equipment.capacity === 0) continue
      
      const reductionAmount = Math.min(remainingReduction, equipment.capacity)
      const duration = (signal.endTime.getTime() - signal.startTime.getTime()) / (1000 * 60)
      
      actions.push({
        actionId: `action_${equipment.id}_${Date.now()}`,
        equipmentId: equipment.id,
        type: equipment.type,
        targetReduction: reductionAmount,
        duration,
        rampRate: equipment.type === 'ramp_down' ? 2 : 10, // kW/min
        constraints: {
          minRecoveryTime: equipment.type === 'complete_shutdown' ? 30 : 15,
          maxConsecutiveActions: 3,
          temperatureLimits: equipment.id.includes('hvac') ? { min: 18, max: 26 } : undefined
        },
        executionStatus: 'pending'
      })
      
      remainingReduction -= reductionAmount
    }
    
    return actions
  }

  private async executeCurtailmentActions(
    actions: CurtailmentAction[],
    startTime: Date
  ): Promise<void> {
    const delay = startTime.getTime() - Date.now()
    
    if (delay > 0) {
      setTimeout(async () => {
        await this.performCurtailmentActions(actions)
      }, delay)
    } else {
      // Execute immediately if start time has passed
      await this.performCurtailmentActions(actions)
    }
  }

  private async performCurtailmentActions(actions: CurtailmentAction[]): Promise<void> {
    for (const action of actions) {
      try {
        action.executionStatus = 'executing'
        await this.executeEquipmentAction(action)
        action.executionStatus = 'completed'
      } catch (error) {
        action.executionStatus = 'failed'
        console.error(`Failed to execute curtailment action: ${action.equipmentId}`, error)
      }
    }
  }

  private async executeEquipmentAction(action: CurtailmentAction): Promise<void> {
    // Interface with facility management systems
    
    switch (action.type) {
      case 'power_reduction':
        await this.reducePower(action.equipmentId, action.targetReduction, action.rampRate)
        break
      case 'load_shift':
        await this.shiftLoad(action.equipmentId, action.duration)
        break
      case 'complete_shutdown':
        await this.shutdownEquipment(action.equipmentId)
        break
      case 'ramp_down':
        await this.rampDownEquipment(action.equipmentId, action.targetReduction, action.rampRate)
        break
    }
  }

  private async reducePower(equipmentId: string, reduction: number, rampRate: number): Promise<void> {
    // Gradually reduce power at specified ramp rate
    const steps = Math.ceil(reduction / rampRate)
    const stepSize = reduction / steps
    
    for (let i = 0; i < steps; i++) {
      // Send power reduction command
      await new Promise(resolve => setTimeout(resolve, 60000)) // 1 minute per step
    }
  }

  private async shiftLoad(equipmentId: string, duration: number): Promise<void> {
    // Implement load shifting logic
  }

  private async shutdownEquipment(equipmentId: string): Promise<void> {
    // Implement equipment shutdown logic
  }

  private async rampDownEquipment(equipmentId: string, targetReduction: number, rampRate: number): Promise<void> {
    // Implement gradual ramp down logic
  }

  private async submitUtilityResponse(signal: UtilitySignal, response: SignalResponse): Promise<void> {
    // Submit response to utility through grid API
    try {
      const success = await this.gridAPI.submitDemandResponseBid(
        `signal_${signal.signalType}_${Date.now()}`,
        response.estimatedRevenue / (response.curtailmentAmount / 1000), // $/MW
        response.curtailmentAmount / 1000, // MW
        signal.startTime,
        signal.endTime
      )
      
      if (success) {
      } else {
        console.error(`Failed to submit utility response for ${signal.signalType}`)
      }
    } catch (error) {
      console.error('Error submitting utility response:', error)
    }
  }

  private async processActiveSignals(): Promise<void> {
    // Monitor and adjust active signals
    for (const [signalType, signal] of this.activeSignals) {
      if (signal.endTime < new Date()) {
        // Signal has ended - clean up
        await this.concludeSignal(signalType)
      } else {
        // Signal is still active - monitor performance
        await this.monitorSignalPerformance(signalType, signal)
      }
    }
  }

  private async monitorCurtailmentPerformance(): Promise<void> {
    // Monitor actual performance vs. committed performance
    for (const [signalType, actions] of this.activeCurtailments) {
      const totalActualReduction = await this.measureActualReduction(actions)
      const targetReduction = actions.reduce((sum, action) => sum + action.targetReduction, 0)
      
      const performance = totalActualReduction / targetReduction
      
      if (performance < 0.9) { // Less than 90% performance
        console.warn(`Under-performing on ${signalType}: ${(performance * 100).toFixed(1)}% of target`)
        await this.adjustCurtailmentActions(signalType, actions, targetReduction - totalActualReduction)
      }
    }
  }

  private async measureActualReduction(actions: CurtailmentAction[]): Promise<number> {
    // In a real implementation, this would read from facility meters
    let totalReduction = 0
    
    for (const action of actions) {
      if (action.executionStatus === 'completed') {
        // Simulate 90-95% effectiveness
        action.actualReduction = action.targetReduction * (0.9 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.05)
        totalReduction += action.actualReduction
      }
    }
    
    return totalReduction
  }

  private async adjustCurtailmentActions(
    signalType: string,
    actions: CurtailmentAction[],
    additionalReductionNeeded: number
  ): Promise<void> {
    
    // Find additional equipment that can be curtailed
    // This would involve more sophisticated logic in a real implementation
    const additionalAction: CurtailmentAction = {
      actionId: `additional_${signalType}_${Date.now()}`,
      equipmentId: 'emergency_curtailment',
      type: 'power_reduction',
      targetReduction: additionalReductionNeeded,
      duration: 30, // 30 minutes
      rampRate: 5, // kW/min
      constraints: {
        minRecoveryTime: 15,
        maxConsecutiveActions: 1
      },
      executionStatus: 'pending'
    }
    
    actions.push(additionalAction)
    await this.performCurtailmentActions([additionalAction])
  }

  private async concludeSignal(signalType: string): Promise<void> {
    
    // Restore equipment to normal operation
    const actions = this.activeCurtailments.get(signalType)
    if (actions) {
      await this.restoreEquipment(actions)
    }
    
    // Clean up active signals and curtailments
    this.activeSignals.delete(signalType)
    this.activeCurtailments.delete(signalType)
    
    // Update performance history
    await this.updatePerformanceHistory(signalType, actions)
  }

  private async restoreEquipment(actions: CurtailmentAction[]): Promise<void> {
    
    for (const action of actions) {
      await this.restoreEquipmentFromAction(action)
    }
  }

  private async restoreEquipmentFromAction(action: CurtailmentAction): Promise<void> {
    
    // Wait for minimum recovery time
    await new Promise(resolve => setTimeout(resolve, action.constraints.minRecoveryTime * 60 * 1000))
    
    // Restore equipment gradually
    switch (action.type) {
      case 'power_reduction':
      case 'ramp_down':
        await this.restorePower(action.equipmentId, action.actualReduction || action.targetReduction)
        break
      case 'complete_shutdown':
        await this.startupEquipment(action.equipmentId)
        break
      case 'load_shift':
        // Load shifting typically handles its own restoration
        break
    }
  }

  private async restorePower(equipmentId: string, powerToRestore: number): Promise<void> {
    // Implement power restoration logic
  }

  private async startupEquipment(equipmentId: string): Promise<void> {
    // Implement equipment startup logic
  }

  private async updatePerformanceHistory(signalType: string, actions?: CurtailmentAction[]): Promise<void> {
    const historyEntry = this.signalHistory.find(h => h.signal.signalType === signalType)
    if (!historyEntry) return
    
    if (actions) {
      const actualReduction = actions.reduce((sum, action) => sum + (action.actualReduction || 0), 0)
      const targetReduction = actions.reduce((sum, action) => sum + action.targetReduction, 0)
      
      historyEntry.actualPerformance = {
        curtailmentAchieved: actualReduction,
        responseTime: 300, // Measured response time
        duration: actions[0]?.duration || 0,
        revenue: historyEntry.response.estimatedRevenue * (actualReduction / targetReduction)
      }
    }
  }

  private async monitorSignalPerformance(signalType: string, signal: UtilitySignal): Promise<void> {
    // Real-time monitoring of signal performance
    const actions = this.activeCurtailments.get(signalType)
    if (!actions) return
    
    const currentReduction = await this.measureActualReduction(actions)
    const targetReduction = signal.targetReduction * 1000
    
    const performance = currentReduction / targetReduction
  }

  private getRecentPerformanceAccuracy(): number {
    if (this.signalHistory.length === 0) return 0.85
    
    const recentHistory = this.signalHistory.slice(-10) // Last 10 signals
    const accuracyScores = recentHistory.map(entry => {
      if (!entry.actualPerformance.curtailmentAchieved) return 0.85 // Default if no actual data
      
      const promised = entry.response.curtailmentAmount
      const delivered = entry.actualPerformance.curtailmentAchieved
      return Math.min(1, delivered / promised)
    })
    
    return accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length
  }

  getSignalStatus(): {
    activeSignals: number
    activeCurtailments: number
    totalParticipation: number // kW
    recentPerformance: number
    monthlyRevenue: number
  } {
    const totalParticipation = Array.from(this.activeCurtailments.values())
      .flat()
      .reduce((sum, action) => sum + action.targetReduction, 0)
    
    const monthlyRevenue = this.signalHistory
      .filter(h => h.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, h) => sum + (h.actualPerformance.revenue || h.response.estimatedRevenue), 0)
    
    return {
      activeSignals: this.activeSignals.size,
      activeCurtailments: this.activeCurtailments.size,
      totalParticipation,
      recentPerformance: this.getRecentPerformanceAccuracy(),
      monthlyRevenue
    }
  }
}