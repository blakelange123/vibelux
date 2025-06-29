/**
 * Demand Response Optimization Engine
 * Maximizes revenue through utility DR programs and TOU optimization
 */

export interface DRProgram {
  id: string
  name: string
  type: 'interruptible' | 'auto-dr' | 'cpp' | 'real-time'
  utility: string
  description: string
  requirements: {
    minLoad?: number // kW
    meterType?: string[]
    rateSchedule?: string[]
  }
  incentives: {
    monthlyCredit?: number // $/kW
    eventCredit?: number // $/kWh
    enrollmentBonus?: number // $
    technologyIncentive?: number // $
  }
  events: {
    maxPerYear?: number
    maxDuration?: number // hours
    advanceNotice?: number // minutes
    seasons?: string[]
  }
}

export interface FacilityProfile {
  // Basic info
  utilityAccount: string
  rateSchedule: string
  location: string
  facilityType: 'indoor' | 'greenhouse' | 'hybrid'
  
  // Load profile
  peakDemand: number // kW
  averageLoad: number // kW
  annualConsumption: number // kWh
  loadFactor: number // 0-1
  
  // Equipment
  lighting: {
    totalCapacity: number // kW
    dimmable: boolean
    zones: number
  }
  hvac: {
    totalCapacity: number // kW
    stages: number
  }
  pumps: {
    totalCapacity: number // kW
    vfd: boolean
  }
  
  // Flexibility
  sheddableLoad: number // kW
  shiftableLoad: number // kW
  criticalLoad: number // kW
  
  // Storage
  batteryCapacity?: number // kWh
  batteryPower?: number // kW
  solarCapacity?: number // kW
}

export interface DREvent {
  programId: string
  startTime: Date
  endTime: Date
  targetReduction: number // kW
  priceSignal?: number // $/kWh
  type: 'emergency' | 'economic' | 'test'
}

export interface DRStrategy {
  event: DREvent
  actions: LoadAction[]
  estimatedReduction: number // kW
  estimatedRevenue: number // $
  impactScore: number // 0-10 (0 = no impact, 10 = severe)
}

export interface LoadAction {
  equipment: string
  action: 'shed' | 'shift' | 'dim' | 'stage' | 'discharge'
  amount: number // kW or %
  startTime: Date
  endTime: Date
  priority: number // 1-5 (1 = first to shed)
}

export interface DRAssessment {
  eligiblePrograms: DRProgram[]
  annualRevenuePotential: number
  recommendedPrograms: string[]
  requiredUpgrades: string[]
  paybackPeriod: number // months
  implementationCost: number
}

export class DemandResponseOptimizer {
  private programs: Map<string, DRProgram> = new Map()
  
  constructor() {
    this.initializePrograms()
  }
  
  private initializePrograms() {
    // SCE Programs
    this.programs.set('sce-api', {
      id: 'sce-api',
      name: 'Agricultural & Pumping Interruptible (AP-I)',
      type: 'interruptible',
      utility: 'SCE',
      description: 'Radio-controlled load interruption for pumps and ag circuits',
      requirements: {
        meterType: ['SmartConnect', 'Interval'],
        rateSchedule: ['TOU-PA-2', 'TOU-PA-3']
      },
      incentives: {
        monthlyCredit: 15.50, // $/kW enrolled
        enrollmentBonus: 500
      },
      events: {
        maxPerYear: 15,
        maxDuration: 6,
        advanceNotice: 30,
        seasons: ['summer']
      }
    })
    
    this.programs.set('sce-autodr', {
      id: 'sce-autodr',
      name: 'Automated Demand Response (Auto-DR)',
      type: 'auto-dr',
      utility: 'SCE',
      description: 'OpenADR-enabled automatic load reduction',
      requirements: {
        minLoad: 50,
        meterType: ['SmartConnect', 'Interval']
      },
      incentives: {
        eventCredit: 1.00, // $/kWh reduced
        technologyIncentive: 200 // $/kW automated
      },
      events: {
        maxPerYear: 20,
        maxDuration: 4,
        advanceNotice: 120,
        seasons: ['summer', 'winter']
      }
    })
    
    this.programs.set('sce-cpp', {
      id: 'sce-cpp',
      name: 'Critical Peak Pricing (CPP)',
      type: 'cpp',
      utility: 'SCE',
      description: 'High prices during critical peak events with bill credits',
      requirements: {
        minLoad: 20,
        meterType: ['SmartConnect', 'Interval']
      },
      incentives: {
        eventCredit: 0.75 // $/kWh reduced from baseline
      },
      events: {
        maxPerYear: 12,
        maxDuration: 6,
        advanceNotice: 120,
        seasons: ['summer']
      }
    })
    
    // PG&E Programs
    this.programs.set('pge-bip', {
      id: 'pge-bip',
      name: 'Base Interruptible Program (BIP)',
      type: 'interruptible',
      utility: 'PG&E',
      description: 'Monthly credits for interruptible load',
      requirements: {
        minLoad: 100
      },
      incentives: {
        monthlyCredit: 8.00 // $/kW
      },
      events: {
        maxPerYear: 10,
        maxDuration: 4,
        advanceNotice: 30
      }
    })
  }
  
  /**
   * Assess facility for DR program eligibility
   */
  assessFacility(profile: FacilityProfile): DRAssessment {
    const eligible: DRProgram[] = []
    let totalRevenue = 0
    
    // Check each program
    for (const program of this.programs.values()) {
      if (this.isEligible(profile, program)) {
        eligible.push(program)
        totalRevenue += this.estimateProgramRevenue(profile, program)
      }
    }
    
    // Calculate implementation costs
    const costs = this.calculateImplementationCosts(profile, eligible)
    
    // Rank programs by ROI
    const ranked = eligible.sort((a, b) => {
      const roiA = this.estimateProgramRevenue(profile, a) / costs.programs[a.id]
      const roiB = this.estimateProgramRevenue(profile, b) / costs.programs[b.id]
      return roiB - roiA
    })
    
    return {
      eligiblePrograms: eligible,
      annualRevenuePotential: totalRevenue,
      recommendedPrograms: ranked.slice(0, 3).map(p => p.id),
      requiredUpgrades: costs.upgrades,
      paybackPeriod: costs.total / (totalRevenue / 12),
      implementationCost: costs.total
    }
  }
  
  /**
   * Check if facility is eligible for a DR program
   */
  private isEligible(profile: FacilityProfile, program: DRProgram): boolean {
    const req = program.requirements
    
    // Check minimum load
    if (req.minLoad && profile.peakDemand < req.minLoad) {
      return false
    }
    
    // Check rate schedule
    if (req.rateSchedule && !req.rateSchedule.includes(profile.rateSchedule)) {
      return false
    }
    
    // Check if facility has enough flexible load
    const flexibleLoad = profile.sheddableLoad + profile.shiftableLoad
    if (flexibleLoad < (req.minLoad || 20)) {
      return false
    }
    
    return true
  }
  
  /**
   * Estimate annual revenue from a DR program
   */
  private estimateProgramRevenue(profile: FacilityProfile, program: DRProgram): number {
    let revenue = 0
    
    // Monthly capacity payments
    if (program.incentives.monthlyCredit) {
      const enrolledCapacity = Math.min(
        profile.sheddableLoad,
        profile.peakDemand * 0.3 // Typical max enrollment
      )
      revenue += program.incentives.monthlyCredit * enrolledCapacity * 12
    }
    
    // Event performance payments
    if (program.incentives.eventCredit && program.events.maxPerYear) {
      const avgEventReduction = profile.sheddableLoad * 0.8 // 80% performance
      const avgEventDuration = program.events.maxDuration || 4
      revenue += program.incentives.eventCredit * avgEventReduction * 
                 avgEventDuration * program.events.maxPerYear
    }
    
    // One-time bonuses
    if (program.incentives.enrollmentBonus) {
      revenue += program.incentives.enrollmentBonus / 3 // Amortize over 3 years
    }
    
    return revenue
  }
  
  /**
   * Calculate implementation costs
   */
  private calculateImplementationCosts(
    profile: FacilityProfile, 
    programs: DRProgram[]
  ): { total: number; programs: Record<string, number>; upgrades: string[] } {
    let total = 0
    const programCosts: Record<string, number> = {}
    const upgrades: string[] = []
    
    for (const program of programs) {
      let cost = 0
      
      // Control system costs
      if (program.type === 'auto-dr') {
        if (!profile.lighting.dimmable) {
          cost += 50 * profile.lighting.totalCapacity // $/kW for dimmable ballasts
          upgrades.push('Dimmable lighting controls')
        }
        cost += 2000 // OpenADR client
        upgrades.push('OpenADR gateway')
      }
      
      if (program.type === 'interruptible') {
        cost += 500 // Radio control switch
        upgrades.push('Load control switches')
      }
      
      // Metering upgrades
      if (program.requirements.meterType?.includes('Interval')) {
        cost += 1500 // Interval meter installation
        upgrades.push('Interval meter')
      }
      
      programCosts[program.id] = cost
      total += cost
    }
    
    // Add soft costs (engineering, commissioning)
    total *= 1.3
    
    return { total, programs: programCosts, upgrades: [...new Set(upgrades)] }
  }
  
  /**
   * Optimize response strategy for a DR event
   */
  optimizeEventResponse(
    profile: FacilityProfile,
    event: DREvent,
    constraints?: {
      maxImpact?: number // 0-10
      protectedZones?: string[]
      minLightLevel?: number // %
    }
  ): DRStrategy {
    const actions: LoadAction[] = []
    let totalReduction = 0
    
    // Priority order for load shedding
    const priorities = [
      { equipment: 'lighting-supplemental', impact: 2, reduction: profile.lighting.totalCapacity * 0.2 },
      { equipment: 'hvac-stage2', impact: 3, reduction: profile.hvac.totalCapacity * 0.3 },
      { equipment: 'pumps-irrigation', impact: 4, reduction: profile.pumps.totalCapacity * 0.5 },
      { equipment: 'lighting-primary', impact: 6, reduction: profile.lighting.totalCapacity * 0.3 },
      { equipment: 'hvac-stage1', impact: 8, reduction: profile.hvac.totalCapacity * 0.4 }
    ]
    
    // Build load reduction strategy
    for (const load of priorities) {
      if (totalReduction >= event.targetReduction) break
      if (constraints?.maxImpact && load.impact > constraints.maxImpact) continue
      
      actions.push({
        equipment: load.equipment,
        action: 'shed',
        amount: load.reduction,
        startTime: event.startTime,
        endTime: event.endTime,
        priority: actions.length + 1
      })
      
      totalReduction += load.reduction
    }
    
    // If battery available, use it first
    if (profile.batteryPower && profile.batteryCapacity) {
      const batteryContribution = Math.min(
        profile.batteryPower,
        event.targetReduction
      )
      
      actions.unshift({
        equipment: 'battery',
        action: 'discharge',
        amount: batteryContribution,
        startTime: event.startTime,
        endTime: event.endTime,
        priority: 0
      })
      
      totalReduction = batteryContribution
    }
    
    // Calculate revenue
    const program = this.programs.get(event.programId)
    const eventHours = (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60)
    const revenue = program 
      ? (program.incentives.eventCredit || 0) * totalReduction * eventHours
      : 0
    
    // Calculate impact score
    const impactScore = this.calculateImpactScore(actions, profile)
    
    return {
      event,
      actions,
      estimatedReduction: totalReduction,
      estimatedRevenue: revenue,
      impactScore
    }
  }
  
  /**
   * Calculate operational impact score
   */
  private calculateImpactScore(actions: LoadAction[], profile: FacilityProfile): number {
    let score = 0
    let weights = 0
    
    for (const action of actions) {
      let impact = 0
      const weight = action.amount / profile.peakDemand
      
      // Assess impact by equipment type
      if (action.equipment.includes('lighting-primary')) {
        impact = 8 // High impact on plant growth
      } else if (action.equipment.includes('lighting-supplemental')) {
        impact = 3 // Low impact
      } else if (action.equipment.includes('hvac')) {
        impact = 5 // Medium impact on climate
      } else if (action.equipment.includes('pumps')) {
        impact = 4 // Medium impact, can be scheduled
      } else if (action.equipment === 'battery') {
        impact = 0 // No operational impact
      }
      
      score += impact * weight
      weights += weight
    }
    
    return weights > 0 ? Math.round(score / weights) : 0
  }
  
  /**
   * Analyze TOU rate optimization opportunities
   */
  analyzeTOUOptimization(
    profile: FacilityProfile,
    rates: {
      peak: number // $/kWh
      offPeak: number // $/kWh
      superOffPeak?: number // $/kWh
      peakHours: { start: number; end: number }[]
      offPeakHours: { start: number; end: number }[]
    },
    currentSchedule: { start: number; end: number }
  ): {
    currentCost: number
    optimizedCost: number
    savings: number
    recommendedSchedule: { start: number; end: number }
    shiftStrategy: string
  } {
    // Calculate current cost
    const dailyHours = this.calculateDailyHours(currentSchedule)
    const currentCost = this.calculateDailyCost(dailyHours, rates, profile.averageLoad)
    
    // Find optimal schedule
    let bestCost = currentCost
    let bestSchedule = currentSchedule
    let bestStrategy = 'No change recommended'
    
    // Test different schedules
    const schedules = [
      { start: 22, end: 16, strategy: 'Night operation (10pm - 4pm)' },
      { start: 0, end: 18, strategy: 'Early morning start (12am - 6pm)' },
      { start: 20, end: 14, strategy: 'Evening start (8pm - 2pm)' },
      { start: 18, end: 12, strategy: 'Split schedule with dark period' }
    ]
    
    for (const testSchedule of schedules) {
      const testHours = this.calculateDailyHours(testSchedule)
      const testCost = this.calculateDailyCost(testHours, rates, profile.averageLoad)
      
      if (testCost < bestCost) {
        bestCost = testCost
        bestSchedule = { start: testSchedule.start, end: testSchedule.end }
        bestStrategy = testSchedule.strategy
      }
    }
    
    const annualCurrentCost = currentCost * 365
    const annualOptimizedCost = bestCost * 365
    
    return {
      currentCost: annualCurrentCost,
      optimizedCost: annualOptimizedCost,
      savings: annualCurrentCost - annualOptimizedCost,
      recommendedSchedule: bestSchedule,
      shiftStrategy: bestStrategy
    }
  }
  
  /**
   * Calculate daily operating hours
   */
  private calculateDailyHours(schedule: { start: number; end: number }): number[] {
    const hours: number[] = new Array(24).fill(0)
    
    if (schedule.start < schedule.end) {
      // Same day operation
      for (let h = schedule.start; h < schedule.end; h++) {
        hours[h] = 1
      }
    } else {
      // Overnight operation
      for (let h = schedule.start; h < 24; h++) {
        hours[h] = 1
      }
      for (let h = 0; h < schedule.end; h++) {
        hours[h] = 1
      }
    }
    
    return hours
  }
  
  /**
   * Calculate daily energy cost
   */
  private calculateDailyCost(
    hours: number[],
    rates: any,
    avgLoad: number
  ): number {
    let cost = 0
    
    for (let h = 0; h < 24; h++) {
      if (!hours[h]) continue
      
      let rate = rates.offPeak
      
      // Check if peak hour
      for (const peak of rates.peakHours) {
        if (h >= peak.start && h < peak.end) {
          rate = rates.peak
          break
        }
      }
      
      // Check if super off-peak
      if (rates.superOffPeak) {
        if (h >= 0 && h < 6) {
          rate = rates.superOffPeak
        }
      }
      
      cost += rate * avgLoad
    }
    
    return cost
  }
}