interface GridRevenue {
  revenueId: string
  facilityId: string
  source: 'energy_sales' | 'demand_response' | 'frequency_regulation' | 'capacity_market' | 'ancillary_services' | 'vpp_participation'
  transactionType: 'credit' | 'debit'
  amount: number // $
  quantity: number // MWh or MW-month
  rate: number // $/MWh or $/MW-month
  settlementPeriod: {
    start: Date
    end: Date
    interval: 'hourly' | 'daily' | 'monthly' | 'annual'
  }
  marketData: {
    lmp?: number // $/MWh - Locational Marginal Price
    capacityPrice?: number // $/MW-month
    ancillaryRate?: number // $/MWh
    congestionCharge?: number // $/MWh
    transmissionCharge?: number // $/MWh
  }
  performanceMetrics: {
    committed: number
    delivered: number
    accuracy: number // 0-1
    penalty?: number // $
    bonus?: number // $
  }
  status: 'pending' | 'calculated' | 'invoiced' | 'paid' | 'disputed'
  metadata: {
    eventId?: string
    contractId?: string
    bidId?: string
    utilityId: string
    isoRtoId: string
  }
}

interface SettlementStatement {
  statementId: string
  facilityId: string
  period: {
    start: Date
    end: Date
    type: 'monthly' | 'quarterly' | 'annual'
  }
  revenues: GridRevenue[]
  summary: {
    totalRevenue: number
    totalPenalties: number
    totalBonuses: number
    netRevenue: number
    totalQuantity: number // MWh
    averageRate: number // $/MWh
  }
  breakdown: {
    energyRevenue: number
    capacityRevenue: number
    ancillaryRevenue: number
    demandResponseRevenue: number
    vppRevenue: number
    penalties: number
    bonuses: number
  }
  performanceMetrics: {
    overallAccuracy: number
    participationRate: number // % of eligible events participated
    reliabilityScore: number // 0-1
    responseTime: number // average seconds
  }
  taxInformation: {
    taxableIncome: number
    withholdingTax: number
    netAfterTax: number
    taxJurisdiction: string
  }
  disputes: Array<{
    disputeId: string
    amount: number
    reason: string
    status: 'open' | 'resolved' | 'escalated'
    dateRaised: Date
  }>
}

interface RevenueOptimization {
  optimizationId: string
  period: { start: Date; end: Date }
  currentRevenue: number
  optimizedRevenue: number
  improvementPotential: number // $
  improvements: Array<{
    strategy: string
    impact: number // $
    implementationCost: number // $
    paybackPeriod: number // months
    riskLevel: 'low' | 'medium' | 'high'
  }>
  marketAnalysis: {
    priceVolatility: number
    competitorPerformance: number
    marketTrends: string[]
    recommendations: string[]
  }
}

interface TaxCalculation {
  jurisdiction: string
  taxableRevenue: number
  taxRate: number // %
  taxOwed: number
  deductions: Array<{
    type: string
    amount: number
    description: string
  }>
  credits: Array<{
    type: string
    amount: number
    description: string
  }>
  netTaxLiability: number
}

export class GridRevenueSettlement {
  private revenues: Map<string, GridRevenue> = new Map()
  private statements: Map<string, SettlementStatement> = new Map()
  private optimizations: Map<string, RevenueOptimization> = new Map()
  private taxRates: Map<string, number> = new Map()
  private performanceHistory: Array<{
    date: Date
    revenue: number
    accuracy: number
    events: number
  }> = []

  constructor() {
    this.initializeTaxRates()
    this.setupSettlementSchedule()
  }

  private initializeTaxRates(): void {
    // Initialize tax rates by jurisdiction
    this.taxRates.set('federal', 0.21) // 21% federal corporate tax
    this.taxRates.set('california', 0.088) // 8.8% CA state tax
    this.taxRates.set('texas', 0.0) // No state income tax
    this.taxRates.set('new_york', 0.063) // 6.3% NY state tax
    this.taxRates.set('pjm', 0.0) // ISO/RTO specific rates
    this.taxRates.set('caiso', 0.0)
    this.taxRates.set('ercot', 0.0)
  }

  private setupSettlementSchedule(): void {
    // Set up automated settlement processing
    setInterval(() => {
      this.processHourlySettlements()
    }, 60 * 60 * 1000) // Every hour

    setInterval(() => {
      this.processDailySettlements()
    }, 24 * 60 * 60 * 1000) // Daily

    // Monthly settlement on the 5th of each month
    setInterval(() => {
      const now = new Date()
      if (now.getDate() === 5) {
        this.processMonthlySettlements()
      }
    }, 24 * 60 * 60 * 1000)
  }

  async recordRevenue(revenue: Omit<GridRevenue, 'revenueId' | 'status'>): Promise<string> {
    const revenueId = `rev_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`
    
    const fullRevenue: GridRevenue = {
      ...revenue,
      revenueId,
      status: 'pending'
    }

    this.revenues.set(revenueId, fullRevenue)
    
    return revenueId
  }

  async calculateSettlement(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SettlementStatement> {
    const statementId = `stmt_${facilityId}_${startDate.getTime()}`
    
    // Get all revenues for the period
    const periodRevenues = Array.from(this.revenues.values()).filter(
      rev => rev.facilityId === facilityId &&
             rev.settlementPeriod.start >= startDate &&
             rev.settlementPeriod.end <= endDate
    )

    // Calculate summary metrics
    const summary = this.calculateRevenueSummary(periodRevenues)
    const breakdown = this.calculateRevenueBreakdown(periodRevenues)
    const performanceMetrics = this.calculatePerformanceMetrics(periodRevenues)
    const taxInformation = this.calculateTaxInformation(summary.netRevenue, 'california')

    const statement: SettlementStatement = {
      statementId,
      facilityId,
      period: {
        start: startDate,
        end: endDate,
        type: this.determinePeriodType(startDate, endDate)
      },
      revenues: periodRevenues,
      summary,
      breakdown,
      performanceMetrics,
      taxInformation,
      disputes: []
    }

    this.statements.set(statementId, statement)
    
    // Update revenues to calculated status
    for (const revenue of periodRevenues) {
      revenue.status = 'calculated'
    }

    return statement
  }

  private calculateRevenueSummary(revenues: GridRevenue[]): SettlementStatement['summary'] {
    let totalRevenue = 0
    let totalPenalties = 0
    let totalBonuses = 0
    let totalQuantity = 0

    for (const revenue of revenues) {
      if (revenue.transactionType === 'credit') {
        totalRevenue += revenue.amount
        totalBonuses += revenue.performanceMetrics.bonus || 0
      } else {
        totalRevenue -= revenue.amount // Debit reduces revenue
      }
      
      totalPenalties += revenue.performanceMetrics.penalty || 0
      totalQuantity += revenue.quantity
    }

    const netRevenue = totalRevenue + totalBonuses - totalPenalties
    const averageRate = totalQuantity > 0 ? totalRevenue / totalQuantity : 0

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalPenalties: Math.round(totalPenalties * 100) / 100,
      totalBonuses: Math.round(totalBonuses * 100) / 100,
      netRevenue: Math.round(netRevenue * 100) / 100,
      totalQuantity: Math.round(totalQuantity * 100) / 100,
      averageRate: Math.round(averageRate * 100) / 100
    }
  }

  private calculateRevenueBreakdown(revenues: GridRevenue[]): SettlementStatement['breakdown'] {
    const breakdown = {
      energyRevenue: 0,
      capacityRevenue: 0,
      ancillaryRevenue: 0,
      demandResponseRevenue: 0,
      vppRevenue: 0,
      penalties: 0,
      bonuses: 0
    }

    for (const revenue of revenues) {
      const amount = revenue.transactionType === 'credit' ? revenue.amount : -revenue.amount

      switch (revenue.source) {
        case 'energy_sales':
          breakdown.energyRevenue += amount
          break
        case 'capacity_market':
          breakdown.capacityRevenue += amount
          break
        case 'ancillary_services':
        case 'frequency_regulation':
          breakdown.ancillaryRevenue += amount
          break
        case 'demand_response':
          breakdown.demandResponseRevenue += amount
          break
        case 'vpp_participation':
          breakdown.vppRevenue += amount
          break
      }

      breakdown.penalties += revenue.performanceMetrics.penalty || 0
      breakdown.bonuses += revenue.performanceMetrics.bonus || 0
    }

    // Round all values
    Object.keys(breakdown).forEach(key => {
      breakdown[key] = Math.round(breakdown[key] * 100) / 100
    })

    return breakdown
  }

  private calculatePerformanceMetrics(revenues: GridRevenue[]): SettlementStatement['performanceMetrics'] {
    if (revenues.length === 0) {
      return {
        overallAccuracy: 0,
        participationRate: 0,
        reliabilityScore: 0,
        responseTime: 0
      }
    }

    const accuracySum = revenues.reduce((sum, rev) => sum + rev.performanceMetrics.accuracy, 0)
    const overallAccuracy = accuracySum / revenues.length

    // Calculate participation rate (assuming eligible events are tracked elsewhere)
    const participatedEvents = revenues.filter(rev => rev.performanceMetrics.delivered > 0).length
    const participationRate = participatedEvents / revenues.length

    // Reliability score based on accuracy and consistency
    const reliabilityScore = overallAccuracy * 0.7 + participationRate * 0.3

    // Average response time (would be calculated from actual event data)
    const responseTime = 300 // seconds - placeholder

    return {
      overallAccuracy: Math.round(overallAccuracy * 1000) / 1000,
      participationRate: Math.round(participationRate * 1000) / 1000,
      reliabilityScore: Math.round(reliabilityScore * 1000) / 1000,
      responseTime
    }
  }

  private calculateTaxInformation(netRevenue: number, jurisdiction: string): SettlementStatement['taxInformation'] {
    const federalRate = this.taxRates.get('federal') || 0.21
    const stateRate = this.taxRates.get(jurisdiction) || 0

    const federalTax = netRevenue * federalRate
    const stateTax = netRevenue * stateRate
    const totalTax = federalTax + stateTax

    return {
      taxableIncome: Math.round(netRevenue * 100) / 100,
      withholdingTax: Math.round(totalTax * 100) / 100,
      netAfterTax: Math.round((netRevenue - totalTax) * 100) / 100,
      taxJurisdiction: jurisdiction
    }
  }

  private determinePeriodType(startDate: Date, endDate: Date): 'monthly' | 'quarterly' | 'annual' {
    const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth())
    
    if (diffMonths >= 12) return 'annual'
    if (diffMonths >= 3) return 'quarterly'
    return 'monthly'
  }

  async optimizeRevenue(
    facilityId: string,
    periodDays: number = 30
  ): Promise<RevenueOptimization> {
    const optimizationId = `opt_${facilityId}_${Date.now()}`
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000)

    // Calculate current revenue
    const currentRevenues = Array.from(this.revenues.values()).filter(
      rev => rev.facilityId === facilityId &&
             rev.settlementPeriod.start >= startDate &&
             rev.settlementPeriod.end <= endDate
    )

    const currentRevenue = currentRevenues.reduce((sum, rev) => 
      sum + (rev.transactionType === 'credit' ? rev.amount : -rev.amount), 0)

    // Analyze optimization opportunities
    const improvements = await this.identifyImprovements(currentRevenues, facilityId)
    const optimizedRevenue = currentRevenue + improvements.reduce((sum, imp) => sum + imp.impact, 0)
    const improvementPotential = optimizedRevenue - currentRevenue

    // Market analysis
    const marketAnalysis = await this.performMarketAnalysis(facilityId)

    const optimization: RevenueOptimization = {
      optimizationId,
      period: { start: startDate, end: endDate },
      currentRevenue: Math.round(currentRevenue * 100) / 100,
      optimizedRevenue: Math.round(optimizedRevenue * 100) / 100,
      improvementPotential: Math.round(improvementPotential * 100) / 100,
      improvements,
      marketAnalysis
    }

    this.optimizations.set(optimizationId, optimization)
    return optimization
  }

  private async identifyImprovements(
    revenues: GridRevenue[],
    facilityId: string
  ): Promise<RevenueOptimization['improvements']> {
    const improvements = []

    // Analyze performance accuracy
    const avgAccuracy = revenues.reduce((sum, rev) => sum + rev.performanceMetrics.accuracy, 0) / revenues.length
    if (avgAccuracy < 0.95) {
      improvements.push({
        strategy: 'Improve measurement and forecasting accuracy',
        impact: revenues.reduce((sum, rev) => sum + rev.amount, 0) * (0.95 - avgAccuracy) * 0.5,
        implementationCost: 25000,
        paybackPeriod: 6,
        riskLevel: 'low' as const
      })
    }

    // Analyze participation rate
    const participationRate = revenues.filter(rev => rev.performanceMetrics.delivered > 0).length / revenues.length
    if (participationRate < 0.8) {
      improvements.push({
        strategy: 'Increase market participation rate',
        impact: revenues.reduce((sum, rev) => sum + rev.amount, 0) * (0.8 - participationRate),
        implementationCost: 15000,
        paybackPeriod: 4,
        riskLevel: 'medium' as const
      })
    }

    // Analyze market diversification
    const sourcesUsed = new Set(revenues.map(rev => rev.source)).size
    if (sourcesUsed < 4) {
      improvements.push({
        strategy: 'Diversify into additional revenue streams',
        impact: revenues.reduce((sum, rev) => sum + rev.amount, 0) * 0.15,
        implementationCost: 50000,
        paybackPeriod: 8,
        riskLevel: 'medium' as const
      })
    }

    // Analyze penalty reduction opportunities
    const totalPenalties = revenues.reduce((sum, rev) => sum + (rev.performanceMetrics.penalty || 0), 0)
    if (totalPenalties > 1000) {
      improvements.push({
        strategy: 'Implement penalty reduction measures',
        impact: totalPenalties * 0.7,
        implementationCost: 20000,
        paybackPeriod: 3,
        riskLevel: 'low' as const
      })
    }

    // Energy storage optimization
    improvements.push({
      strategy: 'Deploy battery energy storage system',
      impact: revenues.reduce((sum, rev) => sum + rev.amount, 0) * 0.25,
      implementationCost: 200000,
      paybackPeriod: 18,
      riskLevel: 'high' as const
    })

    return improvements
  }

  private async performMarketAnalysis(facilityId: string): Promise<RevenueOptimization['marketAnalysis']> {
    // In a real implementation, this would analyze actual market data
    return {
      priceVolatility: 0.25, // 25% price volatility
      competitorPerformance: 0.88, // 88% average competitor performance
      marketTrends: [
        'Increasing demand for frequency regulation services',
        'Growing battery storage market participation',
        'Higher compensation rates for fast-responding resources',
        'Increasing grid flexibility requirements'
      ],
      recommendations: [
        'Invest in faster-responding equipment for frequency regulation',
        'Consider battery storage for energy arbitrage and grid services',
        'Improve forecasting accuracy to reduce penalties',
        'Participate in emerging flexibility markets'
      ]
    }
  }

  async processHourlySettlements(): Promise<void> {
    
    // Process real-time energy settlements
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    const hourlyRevenues = Array.from(this.revenues.values()).filter(
      rev => rev.settlementPeriod.interval === 'hourly' &&
             rev.status === 'pending' &&
             rev.settlementPeriod.end <= oneHourAgo
    )

    for (const revenue of hourlyRevenues) {
      await this.processIndividualSettlement(revenue)
    }
  }

  async processDailySettlements(): Promise<void> {
    
    // Process day-ahead and daily capacity settlements
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const dailyRevenues = Array.from(this.revenues.values()).filter(
      rev => rev.settlementPeriod.interval === 'daily' &&
             rev.status === 'pending' &&
             rev.settlementPeriod.end <= oneDayAgo
    )

    for (const revenue of dailyRevenues) {
      await this.processIndividualSettlement(revenue)
    }
  }

  async processMonthlySettlements(): Promise<void> {
    
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Get all facilities with revenues
    const facilities = new Set(Array.from(this.revenues.values()).map(rev => rev.facilityId))
    
    for (const facilityId of facilities) {
      await this.calculateSettlement(facilityId, lastMonth, thisMonth)
    }
  }

  private async processIndividualSettlement(revenue: GridRevenue): Promise<void> {
    // Calculate actual settlement amounts based on performance
    const performanceRatio = revenue.performanceMetrics.delivered / revenue.performanceMetrics.committed
    
    // Adjust revenue based on performance
    const adjustedAmount = revenue.amount * Math.min(1, performanceRatio)
    
    // Calculate penalties for under-performance
    let penalty = 0
    if (performanceRatio < 0.9) {
      const underPerformance = revenue.performanceMetrics.committed - revenue.performanceMetrics.delivered
      penalty = underPerformance * (revenue.rate * 0.5) // 50% of rate as penalty
    }
    
    // Calculate bonuses for over-performance
    let bonus = 0
    if (performanceRatio > 1.05) {
      const overPerformance = revenue.performanceMetrics.delivered - revenue.performanceMetrics.committed
      bonus = overPerformance * (revenue.rate * 0.1) // 10% bonus for over-delivery
    }
    
    // Update revenue with final amounts
    revenue.amount = adjustedAmount
    revenue.performanceMetrics.penalty = penalty
    revenue.performanceMetrics.bonus = bonus
    revenue.status = 'calculated'
    
  }

  async generateInvoice(statementId: string): Promise<{
    invoiceId: string
    amount: number
    dueDate: Date
    lineItems: Array<{
      description: string
      quantity: number
      rate: number
      amount: number
    }>
  }> {
    const statement = this.statements.get(statementId)
    if (!statement) {
      throw new Error(`Statement ${statementId} not found`)
    }

    const invoiceId = `inv_${statementId}_${Date.now()}`
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const lineItems = [
      {
        description: 'Energy Sales Revenue',
        quantity: statement.breakdown.energyRevenue > 0 ? statement.summary.totalQuantity : 0,
        rate: statement.summary.averageRate,
        amount: statement.breakdown.energyRevenue
      },
      {
        description: 'Capacity Market Revenue',
        quantity: 1,
        rate: statement.breakdown.capacityRevenue,
        amount: statement.breakdown.capacityRevenue
      },
      {
        description: 'Ancillary Services Revenue',
        quantity: 1,
        rate: statement.breakdown.ancillaryRevenue,
        amount: statement.breakdown.ancillaryRevenue
      },
      {
        description: 'Demand Response Revenue',
        quantity: 1,
        rate: statement.breakdown.demandResponseRevenue,
        amount: statement.breakdown.demandResponseRevenue
      },
      {
        description: 'VPP Participation Revenue',
        quantity: 1,
        rate: statement.breakdown.vppRevenue,
        amount: statement.breakdown.vppRevenue
      },
      {
        description: 'Performance Bonuses',
        quantity: 1,
        rate: statement.breakdown.bonuses,
        amount: statement.breakdown.bonuses
      },
      {
        description: 'Performance Penalties',
        quantity: 1,
        rate: -statement.breakdown.penalties,
        amount: -statement.breakdown.penalties
      }
    ].filter(item => item.amount !== 0)

    // Update statement status
    statement.revenues.forEach(rev => {
      rev.status = 'invoiced'
    })


    return {
      invoiceId,
      amount: statement.summary.netRevenue,
      dueDate,
      lineItems
    }
  }

  async raiseDispute(
    statementId: string,
    amount: number,
    reason: string
  ): Promise<string> {
    const statement = this.statements.get(statementId)
    if (!statement) {
      throw new Error(`Statement ${statementId} not found`)
    }

    const disputeId = `disp_${statementId}_${Date.now()}`
    
    statement.disputes.push({
      disputeId,
      amount,
      reason,
      status: 'open',
      dateRaised: new Date()
    })

    return disputeId
  }

  getRevenueAnalytics(facilityId: string, days: number = 30): {
    totalRevenue: number
    averageDailyRevenue: number
    revenueBySource: Record<string, number>
    performanceMetrics: {
      accuracy: number
      reliability: number
      participation: number
    }
    trends: {
      revenueGrowth: number // % change
      performanceImprovement: number // % change
    }
  } {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)
    
    const revenues = Array.from(this.revenues.values()).filter(
      rev => rev.facilityId === facilityId &&
             rev.settlementPeriod.start >= startDate &&
             rev.settlementPeriod.end <= endDate
    )

    const totalRevenue = revenues.reduce((sum, rev) => 
      sum + (rev.transactionType === 'credit' ? rev.amount : -rev.amount), 0)
    
    const averageDailyRevenue = totalRevenue / days

    const revenueBySource: Record<string, number> = {}
    for (const revenue of revenues) {
      const amount = revenue.transactionType === 'credit' ? revenue.amount : -revenue.amount
      revenueBySource[revenue.source] = (revenueBySource[revenue.source] || 0) + amount
    }

    const accuracy = revenues.length > 0 ? 
      revenues.reduce((sum, rev) => sum + rev.performanceMetrics.accuracy, 0) / revenues.length : 0
    
    const reliability = revenues.filter(rev => rev.performanceMetrics.delivered > 0).length / (revenues.length || 1)
    const participation = revenues.length // Simplified metric

    // Calculate trends (comparing to previous period)
    const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)
    const previousRevenues = Array.from(this.revenues.values()).filter(
      rev => rev.facilityId === facilityId &&
             rev.settlementPeriod.start >= previousStartDate &&
             rev.settlementPeriod.end <= startDate
    )

    const previousTotalRevenue = previousRevenues.reduce((sum, rev) => 
      sum + (rev.transactionType === 'credit' ? rev.amount : -rev.amount), 0)
    
    const revenueGrowth = previousTotalRevenue > 0 ? 
      ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100 : 0

    const previousAccuracy = previousRevenues.length > 0 ? 
      previousRevenues.reduce((sum, rev) => sum + rev.performanceMetrics.accuracy, 0) / previousRevenues.length : 0
    
    const performanceImprovement = previousAccuracy > 0 ? 
      ((accuracy - previousAccuracy) / previousAccuracy) * 100 : 0

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageDailyRevenue: Math.round(averageDailyRevenue * 100) / 100,
      revenueBySource,
      performanceMetrics: {
        accuracy: Math.round(accuracy * 1000) / 1000,
        reliability: Math.round(reliability * 1000) / 1000,
        participation
      },
      trends: {
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        performanceImprovement: Math.round(performanceImprovement * 100) / 100
      }
    }
  }

  getAllStatements(facilityId?: string): SettlementStatement[] {
    const statements = Array.from(this.statements.values())
    return facilityId ? statements.filter(stmt => stmt.facilityId === facilityId) : statements
  }

  getRevenueHistory(facilityId: string, months: number = 12): Array<{
    month: string
    revenue: number
    accuracy: number
    events: number
  }> {
    const history = []
    const now = new Date()
    
    for (let i = 0; i < months; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthRevenues = Array.from(this.revenues.values()).filter(
        rev => rev.facilityId === facilityId &&
               rev.settlementPeriod.start >= monthStart &&
               rev.settlementPeriod.end <= monthEnd
      )
      
      const revenue = monthRevenues.reduce((sum, rev) => 
        sum + (rev.transactionType === 'credit' ? rev.amount : -rev.amount), 0)
      
      const accuracy = monthRevenues.length > 0 ? 
        monthRevenues.reduce((sum, rev) => sum + rev.performanceMetrics.accuracy, 0) / monthRevenues.length : 0
      
      history.unshift({
        month: monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        revenue: Math.round(revenue * 100) / 100,
        accuracy: Math.round(accuracy * 1000) / 1000,
        events: monthRevenues.length
      })
    }
    
    return history
  }
}