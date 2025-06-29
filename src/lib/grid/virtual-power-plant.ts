import { GridPricingAPI } from './pricing-api'
import { DemandResponseOptimizer } from './demand-response'

interface VPPResource {
  resourceId: string
  facilityId: string
  type: 'load' | 'generation' | 'storage'
  capacity: number // kW
  availability: number // 0-1
  flexibility: {
    rampRate: number // kW/min
    minOutput: number // kW
    maxOutput: number // kW
    responseTime: number // seconds
  }
  operationalConstraints: {
    maxDuration: number // minutes
    minRecoveryTime: number // minutes
    cycleLimit: number // per day
    efficiency: number // 0-1
  }
  economics: {
    operationalCost: number // $/MWh
    maintenanceCost: number // $/cycle
    degradationRate: number // per cycle
  }
}

interface VPPParticipant {
  participantId: string
  facilityIds: string[]
  resources: VPPResource[]
  contractTerms: {
    participationLevel: number // 0-1
    minimumRevenue: number // $/month
    performancePenalties: number // $/MWh
    exitClause: boolean
  }
  status: 'active' | 'inactive' | 'suspended'
}

interface MarketProduct {
  productId: string
  name: string
  type: 'energy' | 'capacity' | 'ancillary' | 'reserves'
  timeframe: 'real_time' | 'day_ahead' | 'hour_ahead'
  requirements: {
    minCapacity: number // MW
    minDuration: number // minutes
    responseTime: number // seconds
    availability: number // hours per day
  }
  compensation: {
    capacityRate: number // $/MW-month
    performanceRate: number // $/MWh
    availabilityRate: number // $/MW-hour
  }
  penalties: {
    nonPerformance: number // $/MWh
    unavailability: number // $/MW-hour
  }
}

interface VPPBid {
  bidId: string
  productId: string
  price: number // $/MWh
  quantity: number // MW
  duration: number // minutes
  startTime: Date
  endTime: Date
  resources: string[] // resourceIds
  confidence: number // 0-1
  risk: 'low' | 'medium' | 'high'
}

interface VPPDispatch {
  dispatchId: string
  bidId: string
  resources: Array<{
    resourceId: string
    targetOutput: number // kW
    duration: number // minutes
    startTime: Date
  }>
  totalOutput: number // MW
  expectedRevenue: number // $
  actualPerformance?: {
    output: number // MW
    revenue: number // $
    accuracy: number // 0-1
  }
}

export class VirtualPowerPlant {
  private gridAPI: GridPricingAPI
  private demandResponse: DemandResponseOptimizer
  private participants: Map<string, VPPParticipant> = new Map()
  private resources: Map<string, VPPResource> = new Map()
  private marketProducts: Map<string, MarketProduct> = new Map()
  private activeBids: Map<string, VPPBid> = new Map()
  private activeDispatches: Map<string, VPPDispatch> = new Map()
  private performanceHistory: Array<{
    date: Date
    revenue: number
    capacity: number
    availability: number
    performance: number
  }> = []

  constructor(gridAPI: GridPricingAPI, demandResponse: DemandResponseOptimizer) {
    this.gridAPI = gridAPI
    this.demandResponse = demandResponse
    this.initializeMarketProducts()
    this.setupMarketMonitoring()
  }

  private initializeMarketProducts(): void {
    // Real-time energy market
    this.marketProducts.set('rt_energy', {
      productId: 'rt_energy',
      name: 'Real-Time Energy',
      type: 'energy',
      timeframe: 'real_time',
      requirements: {
        minCapacity: 0.1, // 100 kW minimum
        minDuration: 5, // 5 minutes
        responseTime: 300, // 5 minutes
        availability: 24 // 24/7
      },
      compensation: {
        capacityRate: 0,
        performanceRate: 0, // Variable based on LMP
        availabilityRate: 0
      },
      penalties: {
        nonPerformance: 50, // $/MWh
        unavailability: 0
      }
    })

    // Day-ahead energy market
    this.marketProducts.set('da_energy', {
      productId: 'da_energy',
      name: 'Day-Ahead Energy',
      type: 'energy',
      timeframe: 'day_ahead',
      requirements: {
        minCapacity: 0.5, // 500 kW minimum
        minDuration: 60, // 1 hour
        responseTime: 600, // 10 minutes
        availability: 16 // 16 hours per day
      },
      compensation: {
        capacityRate: 0,
        performanceRate: 0, // Variable based on day-ahead prices
        availabilityRate: 5 // $/MW-hour
      },
      penalties: {
        nonPerformance: 75, // $/MWh
        unavailability: 25 // $/MW-hour
      }
    })

    // Frequency regulation
    this.marketProducts.set('freq_reg', {
      productId: 'freq_reg',
      name: 'Frequency Regulation',
      type: 'ancillary',
      timeframe: 'real_time',
      requirements: {
        minCapacity: 0.1, // 100 kW minimum
        minDuration: 15, // 15 minutes
        responseTime: 4, // 4 seconds
        availability: 24 // 24/7
      },
      compensation: {
        capacityRate: 4500, // $/MW-month
        performanceRate: 12, // $/MWh
        availabilityRate: 8 // $/MW-hour
      },
      penalties: {
        nonPerformance: 100, // $/MWh
        unavailability: 50 // $/MW-hour
      }
    })

    // Spinning reserves
    this.marketProducts.set('spin_reserves', {
      productId: 'spin_reserves',
      name: 'Spinning Reserves',
      type: 'reserves',
      timeframe: 'real_time',
      requirements: {
        minCapacity: 1.0, // 1 MW minimum
        minDuration: 60, // 1 hour
        responseTime: 600, // 10 minutes
        availability: 24 // 24/7
      },
      compensation: {
        capacityRate: 3000, // $/MW-month
        performanceRate: 25, // $/MWh when called
        availabilityRate: 12 // $/MW-hour
      },
      penalties: {
        nonPerformance: 150, // $/MWh
        unavailability: 75 // $/MW-hour
      }
    })

    // Demand response capacity
    this.marketProducts.set('dr_capacity', {
      productId: 'dr_capacity',
      name: 'Demand Response Capacity',
      type: 'capacity',
      timeframe: 'day_ahead',
      requirements: {
        minCapacity: 0.5, // 500 kW minimum
        minDuration: 240, // 4 hours
        responseTime: 1800, // 30 minutes
        availability: 8 // 8 hours per day during peak
      },
      compensation: {
        capacityRate: 8000, // $/MW-month
        performanceRate: 50, // $/MWh when called
        availabilityRate: 15 // $/MW-hour
      },
      penalties: {
        nonPerformance: 200, // $/MWh
        unavailability: 100 // $/MW-hour
      }
    })
  }

  private setupMarketMonitoring(): void {
    this.gridAPI.addEventListener('priceUpdate', (data) => {
      this.evaluateMarketOpportunities(data)
    })

    // Monitor every 5 minutes for bidding opportunities
    setInterval(() => {
      this.processMarketBids()
    }, 5 * 60 * 1000) // 5 minutes

    // Monitor every minute for dispatch optimization
    setInterval(() => {
      this.optimizeActiveDispatches()
    }, 60 * 1000) // 1 minute
  }

  async registerParticipant(participant: VPPParticipant): Promise<void> {
    this.participants.set(participant.participantId, participant)
    
    // Register all participant resources
    for (const resource of participant.resources) {
      this.resources.set(resource.resourceId, resource)
    }

  }

  async calculateVPPCapacity(): Promise<{
    totalCapacity: number
    availableCapacity: number
    byType: Record<string, number>
    byProduct: Record<string, number>
  }> {
    let totalCapacity = 0
    let availableCapacity = 0
    const byType = { load: 0, generation: 0, storage: 0 }
    const byProduct = {}

    for (const resource of this.resources.values()) {
      totalCapacity += resource.capacity
      availableCapacity += resource.capacity * resource.availability

      byType[resource.type] += resource.capacity

      // Calculate product-specific capacity
      for (const [productId, product] of this.marketProducts) {
        if (this.isResourceEligible(resource, product)) {
          if (!byProduct[productId]) byProduct[productId] = 0
          byProduct[productId] += resource.capacity * resource.availability
        }
      }
    }

    return {
      totalCapacity: Math.round(totalCapacity * 100) / 100,
      availableCapacity: Math.round(availableCapacity * 100) / 100,
      byType,
      byProduct
    }
  }

  private isResourceEligible(resource: VPPResource, product: MarketProduct): boolean {
    // Check capacity requirements
    if (resource.capacity < product.requirements.minCapacity * 1000) { // Convert MW to kW
      return false
    }

    // Check response time
    if (resource.flexibility.responseTime > product.requirements.responseTime) {
      return false
    }

    // Check duration capability
    if (resource.operationalConstraints.maxDuration < product.requirements.minDuration) {
      return false
    }

    // Check resource type compatibility with product type
    switch (product.type) {
      case 'energy':
        return resource.type === 'generation' || resource.type === 'storage'
      case 'capacity':
        return resource.type === 'load' || resource.type === 'storage'
      case 'ancillary':
        return resource.flexibility.rampRate > 1 // kW/min
      case 'reserves':
        return resource.type === 'generation' || resource.type === 'storage'
      default:
        return false
    }
  }

  async generateOptimalBids(timeHorizon: 'real_time' | 'hour_ahead' | 'day_ahead'): Promise<VPPBid[]> {
    const bids: VPPBid[] = []
    const capacity = await this.calculateVPPCapacity()
    const currentPricing = await this.gridAPI.getCurrentPricing()

    for (const [productId, product] of this.marketProducts) {
      if (product.timeframe !== timeHorizon) continue

      const availableCapacity = capacity.byProduct[productId]
      if (!availableCapacity || availableCapacity < product.requirements.minCapacity) {
        continue
      }

      const bid = await this.optimizeBidForProduct(product, availableCapacity, currentPricing)
      if (bid) {
        bids.push(bid)
      }
    }

    return bids.sort((a, b) => b.price - a.price) // Sort by price descending
  }

  private async optimizeBidForProduct(
    product: MarketProduct,
    availableCapacity: number,
    currentPricing: any
  ): Promise<VPPBid | null> {
    // Calculate optimal bid price based on market conditions
    let bidPrice = 0
    
    switch (product.type) {
      case 'energy':
        bidPrice = currentPricing.lmp * 0.9 // Bid slightly below current LMP
        break
      case 'capacity':
        bidPrice = product.compensation.capacityRate / (30 * 24) // Daily rate
        break
      case 'ancillary':
        bidPrice = product.compensation.performanceRate * 1.1 // Premium for ancillary services
        break
      case 'reserves':
        bidPrice = product.compensation.performanceRate * 0.95 // Competitive reserve pricing
        break
    }

    // Risk adjustment
    const riskMultiplier = this.calculateRiskMultiplier(product, currentPricing)
    bidPrice *= riskMultiplier

    // Resource selection for this bid
    const selectedResources = this.selectResourcesForBid(product, Math.min(availableCapacity, 10)) // Max 10 MW bid

    if (selectedResources.length === 0) return null

    const totalBidCapacity = selectedResources.reduce((sum, r) => sum + r.capacity, 0) / 1000 // Convert to MW
    
    return {
      bidId: `bid_${Date.now()}_${product.productId}`,
      productId: product.productId,
      price: Math.round(bidPrice * 100) / 100,
      quantity: Math.round(totalBidCapacity * 100) / 100,
      duration: product.requirements.minDuration,
      startTime: new Date(Date.now() + product.requirements.responseTime * 1000),
      endTime: new Date(Date.now() + (product.requirements.responseTime + product.requirements.minDuration * 60) * 1000),
      resources: selectedResources.map(r => r.resourceId),
      confidence: this.calculateBidConfidence(selectedResources, product),
      risk: this.assessBidRisk(selectedResources, product, currentPricing)
    }
  }

  private calculateRiskMultiplier(product: MarketProduct, currentPricing: any): number {
    let multiplier = 1.0

    // Price volatility risk
    if (currentPricing.realTime?.priceVolatility > 0.3) {
      multiplier += 0.2 // Increase bid price for volatile markets
    }

    // Performance penalty risk
    const penaltyRatio = product.penalties.nonPerformance / (product.compensation.performanceRate || 50)
    multiplier += penaltyRatio * 0.1

    // Historical accuracy adjustment
    const recentAccuracy = this.getRecentAccuracy()
    if (recentAccuracy < 0.9) {
      multiplier += (0.9 - recentAccuracy) * 0.5
    }

    return Math.max(0.8, Math.min(1.5, multiplier))
  }

  private selectResourcesForBid(product: MarketProduct, targetCapacityMW: number): VPPResource[] {
    const eligible = Array.from(this.resources.values())
      .filter(r => this.isResourceEligible(r, product))
      .sort((a, b) => this.calculateResourceScore(a, product) - this.calculateResourceScore(b, product))

    const selected = []
    let currentCapacity = 0

    for (const resource of eligible) {
      if (currentCapacity >= targetCapacityMW * 1000) break // Convert MW to kW
      
      selected.push(resource)
      currentCapacity += resource.capacity * resource.availability
    }

    return selected
  }

  private calculateResourceScore(resource: VPPResource, product: MarketProduct): number {
    let score = 0

    // Efficiency score
    score += resource.operationalConstraints.efficiency * 30

    // Response time score (lower is better)
    score += (product.requirements.responseTime - resource.flexibility.responseTime) / product.requirements.responseTime * 20

    // Operational cost score (lower is better)
    score -= resource.economics.operationalCost / 100 * 20

    // Reliability score
    score += resource.availability * 30

    return score
  }

  private calculateBidConfidence(resources: VPPResource[], product: MarketProduct): number {
    let confidence = 0.8 // Base confidence

    // Resource reliability
    const avgAvailability = resources.reduce((sum, r) => sum + r.availability, 0) / resources.length
    confidence += (avgAvailability - 0.8) * 0.3

    // Response capability
    const maxResponseTime = Math.max(...resources.map(r => r.flexibility.responseTime))
    if (maxResponseTime < product.requirements.responseTime * 0.5) {
      confidence += 0.1
    }

    // Historical performance
    confidence += (this.getRecentAccuracy() - 0.8) * 0.2

    return Math.max(0.1, Math.min(1.0, confidence))
  }

  private assessBidRisk(resources: VPPResource[], product: MarketProduct, currentPricing: any): 'low' | 'medium' | 'high' {
    let riskScore = 0

    // Market volatility risk
    if (currentPricing.realTime?.priceVolatility > 0.4) {
      riskScore += 0.3
    }

    // Resource reliability risk
    const minAvailability = Math.min(...resources.map(r => r.availability))
    if (minAvailability < 0.8) {
      riskScore += 0.3
    }

    // Performance penalty risk
    const penaltyRatio = product.penalties.nonPerformance / (product.compensation.performanceRate || 50)
    riskScore += penaltyRatio * 0.2

    // Complexity risk
    if (resources.length > 10) {
      riskScore += 0.2
    }

    if (riskScore > 0.6) return 'high'
    if (riskScore > 0.3) return 'medium'
    return 'low'
  }

  async submitBids(bids: VPPBid[]): Promise<{ successful: number; failed: number; errors: string[] }> {
    let successful = 0
    let failed = 0
    const errors = []

    for (const bid of bids) {
      try {
        const success = await this.submitSingleBid(bid)
        if (success) {
          this.activeBids.set(bid.bidId, bid)
          successful++
        } else {
          failed++
          errors.push(`Failed to submit bid ${bid.bidId}`)
        }
      } catch (error) {
        failed++
        errors.push(`Error submitting bid ${bid.bidId}: ${error.message}`)
      }
    }

    return { successful, failed, errors }
  }

  private async submitSingleBid(bid: VPPBid): Promise<boolean> {
    // This would interface with the actual market operator APIs
    // For now, we'll simulate the submission
    
    // Simulate market acceptance (80% success rate for demonstration)
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.2
  }

  async processMarketBids(): Promise<void> {
    try {
      const currentPricing = await this.gridAPI.getCurrentPricing()
      
      // Generate new bids for different time horizons
      const realTimeBids = await this.generateOptimalBids('real_time')
      const hourAheadBids = await this.generateOptimalBids('hour_ahead')
      
      const allBids = [...realTimeBids, ...hourAheadBids]
      
      if (allBids.length > 0) {
        const results = await this.submitBids(allBids)
      }
    } catch (error) {
      console.error('Error processing market bids:', error)
    }
  }

  async optimizeActiveDispatches(): Promise<void> {
    for (const dispatch of this.activeDispatches.values()) {
      // Real-time optimization of active dispatches
      await this.optimizeSingleDispatch(dispatch)
    }
  }

  private async optimizeSingleDispatch(dispatch: VPPDispatch): Promise<void> {
    // Continuously optimize resource allocation during dispatch
    const currentPricing = await this.gridAPI.getCurrentPricing()
    
    // Adjust resource output based on current conditions
    for (const resourceDispatch of dispatch.resources) {
      const resource = this.resources.get(resourceDispatch.resourceId)
      if (resource) {
        const optimalOutput = this.calculateOptimalOutput(resource, currentPricing, resourceDispatch)
        if (Math.abs(optimalOutput - resourceDispatch.targetOutput) > resource.capacity * 0.05) {
          // Significant change needed
          resourceDispatch.targetOutput = optimalOutput
          await this.updateResourceDispatch(resourceDispatch)
        }
      }
    }
  }

  private calculateOptimalOutput(resource: VPPResource, currentPricing: any, dispatch: any): number {
    // Optimize output based on current market conditions
    let optimalOutput = dispatch.targetOutput

    // Price-based optimization
    if (currentPricing.lmp > 100) {
      // High prices - maximize output if possible
      optimalOutput = Math.min(resource.flexibility.maxOutput, dispatch.targetOutput * 1.1)
    } else if (currentPricing.lmp < 30) {
      // Low prices - minimize output to reduce costs
      optimalOutput = Math.max(resource.flexibility.minOutput, dispatch.targetOutput * 0.9)
    }

    return Math.max(resource.flexibility.minOutput, Math.min(resource.flexibility.maxOutput, optimalOutput))
  }

  private async updateResourceDispatch(resourceDispatch: any): Promise<void> {
    // Interface with facility control systems
  }

  private evaluateMarketOpportunities(pricingData: any): void {
    // Look for immediate market opportunities
    if (pricingData.lmp > 200) {
      this.evaluateEmergencyDispatch(pricingData)
    }
  }

  private async evaluateEmergencyDispatch(pricingData: any): Promise<void> {
    // Emergency high-value dispatch opportunities
    const availableCapacity = await this.calculateVPPCapacity()
    if (availableCapacity.availableCapacity > 1) { // At least 1 MW available
    }
  }

  private getRecentAccuracy(): number {
    if (this.performanceHistory.length === 0) return 0.85

    const recent = this.performanceHistory.slice(-30) // Last 30 days
    return recent.reduce((sum, perf) => sum + perf.performance, 0) / recent.length
  }

  getVPPStatus(): {
    participants: number
    totalCapacity: number
    activeBids: number
    activeDispatches: number
    monthlyRevenue: number
    performance: number
  } {
    const monthlyRevenue = this.performanceHistory
      .filter(h => h.date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, h) => sum + h.revenue, 0)

    return {
      participants: this.participants.size,
      totalCapacity: Array.from(this.resources.values()).reduce((sum, r) => sum + r.capacity, 0) / 1000, // MW
      activeBids: this.activeBids.size,
      activeDispatches: this.activeDispatches.size,
      monthlyRevenue,
      performance: this.getRecentAccuracy()
    }
  }
}