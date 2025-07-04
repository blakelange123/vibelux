// Enhanced Rebate Calculator with Advanced Features
// Includes TOU optimization, financial analysis, and comprehensive savings calculations

import { RebateProgram } from './utility-rebate-database'

export interface ProjectDetails {
  // Basic project info
  fixtures: number
  wattsPerFixture: number
  replacingType: 'HPS' | 'MH' | 'CMH' | 'T5' | 'T8' | 'LED'
  replacingWatts: number
  
  // Operational details
  dailyHours: number
  daysPerWeek: number
  weeksPerYear: number
  
  // Facility details
  facilityType: 'greenhouse' | 'indoor-sole-source-non-stacked' | 'indoor-sole-source-stacked' | 'vertical-farm'
  cropType: 'cannabis-flowering' | 'cannabis-vegetative' | 'non-cannabis-flowering' | 'non-cannabis-vegetative'
  facilityArea: number // sq ft
  
  // Financial inputs
  electricityCost?: number // $/kWh if flat rate
  installationCost: number
  maintenanceSavings?: number // annual
  hvacSavings?: number // % reduction in cooling load
  
  // Advanced options
  fixtureType: 'toplight' | 'ucl' | 'both'
  uclFixtures?: number
  financingRate?: number // interest rate if financed
  discountRate?: number // for NPV calculations
}

export interface EnhancedSavingsAnalysis {
  // Energy savings
  annualKwhSaved: number
  peakDemandReduction: number // kW
  annualEnergyCost: number
  annualEnergySavings: number
  
  // TOU optimization
  touSavings?: {
    currentCost: number
    optimizedCost: number
    additionalSavings: number
    recommendedSchedule: {
      period: string
      hours: string
      percentageOfOperation: number
    }[]
  }
  
  // Financial metrics
  totalRebates: number
  netProjectCost: number
  simplePayback: number
  npv: number
  irr: number
  monthlyPositiveCashFlow: number
  
  // Additional benefits
  carbonReduction: number // tons CO2/year
  waterSavings?: number // gallons/year
  productivityIncrease?: number // %
  
  // Rebate breakdown
  rebateDetails: {
    programName: string
    amount: number
    requirements: string[]
    deadline?: Date
  }[]
  
  // Stackable incentives
  additionalIncentives: {
    type: string
    name: string
    estimatedValue: number
    notes?: string
  }[]
}

export class EnhancedRebateCalculator {
  private carbonIntensity = 0.45 // kg CO2/kWh (US average)
  
  calculateComprehensiveSavings(
    project: ProjectDetails,
    rebates: RebateProgram[],
    utilityRate?: any
  ): EnhancedSavingsAnalysis {
    // Calculate basic energy savings
    const oldWatts = project.fixtures * project.replacingWatts
    const newWatts = project.fixtures * project.wattsPerFixture
    const wattsReduced = oldWatts - newWatts
    const annualHours = project.dailyHours * project.daysPerWeek * project.weeksPerYear
    const annualKwhSaved = (wattsReduced / 1000) * annualHours
    
    // Calculate demand reduction
    const peakDemandReduction = wattsReduced / 1000
    
    // Calculate energy costs
    let annualEnergyCost = 0
    let annualEnergySavings = 0
    let touSavings = undefined
    
    if (utilityRate && utilityRate.type === 'tou') {
      // Calculate TOU optimization
      touSavings = this.calculateTOUOptimization(project, utilityRate, annualKwhSaved)
      annualEnergySavings = touSavings.additionalSavings + (annualKwhSaved * (project.electricityCost || 0.12))
    } else {
      // Simple flat rate calculation
      const avgRate = project.electricityCost || 0.12
      annualEnergyCost = (newWatts / 1000) * annualHours * avgRate
      annualEnergySavings = annualKwhSaved * avgRate
    }
    
    // Add demand charge savings if applicable
    if (utilityRate?.demandCharge) {
      annualEnergySavings += peakDemandReduction * utilityRate.demandCharge * 12
    }
    
    // Calculate HVAC savings
    if (project.hvacSavings) {
      const hvacReduction = annualKwhSaved * (project.hvacSavings / 100) * 0.3 // 30% of energy goes to heat
      annualEnergySavings += hvacReduction * (project.electricityCost || 0.12)
    }
    
    // Calculate total rebates
    const rebateDetails = this.calculateRebateAmounts(project, rebates)
    const totalRebates = rebateDetails.reduce((sum, r) => sum + r.amount, 0)
    
    // Net project cost
    const netProjectCost = project.installationCost - totalRebates
    
    // Financial metrics
    const annualCashFlow = annualEnergySavings + (project.maintenanceSavings || 0)
    const simplePayback = netProjectCost / annualCashFlow
    
    // NPV calculation (10 year project life)
    const discountRate = project.discountRate || 0.08
    let npv = -netProjectCost
    for (let year = 1; year <= 10; year++) {
      npv += annualCashFlow / Math.pow(1 + discountRate, year)
    }
    
    // IRR calculation (simplified)
    const irr = this.calculateIRR(netProjectCost, annualCashFlow, 10)
    
    // Monthly positive cash flow
    const monthlyPositiveCashFlow = Math.ceil(netProjectCost / (annualCashFlow / 12))
    
    // Environmental benefits
    const carbonReduction = (annualKwhSaved * this.carbonIntensity) / 1000 // tons CO2
    
    // Identify stackable incentives
    const additionalIncentives = this.identifyStackableIncentives(project, rebates)
    
    return {
      annualKwhSaved,
      peakDemandReduction,
      annualEnergyCost,
      annualEnergySavings,
      touSavings,
      totalRebates,
      netProjectCost,
      simplePayback,
      npv,
      irr,
      monthlyPositiveCashFlow,
      carbonReduction,
      rebateDetails,
      additionalIncentives
    }
  }
  
  private calculateTOUOptimization(
    project: ProjectDetails,
    utilityRate: any,
    annualKwhSaved: number
  ): any {
    // Analyze current operation pattern
    const dailyHours = project.dailyHours
    const rates = utilityRate.rates
    
    // Calculate current cost based on typical operation
    let currentCost = 0
    let optimizedCost = 0
    const recommendedSchedule: any[] = []
    
    // Simplified TOU optimization
    // Assume current operation is evenly distributed
    rates.forEach((rate: any) => {
      const hoursInPeriod = this.parseHours(rate.hours)
      const percentInPeriod = hoursInPeriod / 24
      const kwhInPeriod = (annualKwhSaved * percentInPeriod)
      currentCost += kwhInPeriod * rate.rate
    })
    
    // Optimize by shifting load to off-peak
    const offPeakRate = Math.min(...rates.map((r: any) => r.rate))
    const peakRate = Math.max(...rates.map((r: any) => r.rate))
    
    // Calculate potential savings by shifting 70% of load to off-peak
    optimizedCost = annualKwhSaved * (0.7 * offPeakRate + 0.3 * peakRate)
    
    return {
      currentCost,
      optimizedCost,
      additionalSavings: currentCost - optimizedCost,
      recommendedSchedule: [
        { period: 'off-peak', hours: '9pm-2pm', percentageOfOperation: 70 },
        { period: 'peak', hours: '2pm-9pm', percentageOfOperation: 30 }
      ]
    }
  }
  
  private parseHours(hoursString: string): number {
    // Simple parser for hour ranges like "4pm-9pm"
    if (hoursString === 'all day') return 24
    
    const match = hoursString.match(/(\d+)(am|pm)-(\d+)(am|pm)/)
    if (!match) return 8 // default
    
    const start = parseInt(match[1]) + (match[2] === 'pm' && match[1] !== '12' ? 12 : 0)
    const end = parseInt(match[3]) + (match[4] === 'pm' && match[3] !== '12' ? 12 : 0)
    
    return end > start ? end - start : (24 - start + end)
  }
  
  private calculateRebateAmounts(
    project: ProjectDetails,
    rebates: RebateProgram[]
  ): any[] {
    const rebateDetails: any[] = []
    
    rebates.forEach(rebate => {
      const calculation = this.calculateIndividualRebate(project, rebate)
      
      if (calculation.amount > 0) {
        rebateDetails.push({
          programName: rebate.programName,
          utilityCompany: rebate.utilityCompany,
          amount: calculation.amount,
          calculationMethod: calculation.method,
          calculationDetails: calculation.details,
          requirements: rebate.requirements,
          deadline: rebate.deadline,
          contactInfo: rebate.contactInfo,
          applicationPDF: rebate.applicationPDF,
          processingTime: rebate.processingTime,
          maxRebate: rebate.maxRebate,
          programStatus: rebate.programStatus
        })
      }
    })
    
    return rebateDetails.sort((a, b) => b.amount - a.amount) // Sort by rebate amount descending
  }

  private calculateIndividualRebate(
    project: ProjectDetails,
    rebate: RebateProgram
  ): { amount: number; method: string; details: string } {
    let amount = 0
    let method = ''
    let details = ''
    
    // Calculate basic energy metrics
    const annualHours = project.dailyHours * project.daysPerWeek * project.weeksPerYear
    const kwhSaved = ((project.fixtures * project.replacingWatts - project.fixtures * project.wattsPerFixture) / 1000) * annualHours
    
    // 1. SCE AgEE Rates (Complex Matrix)
    if (rebate.ageeRates && rebate.ageeRates.length > 0) {
      const rate = rebate.ageeRates.find(r => 
        r.facilityType === project.facilityType && 
        r.cropType === project.cropType
      )
      
      if (rate) {
        const toplightAmount = project.fixtures * rate.toplightRebate
        const uclAmount = (project.uclFixtures || 0) * rate.uclRebate
        amount = toplightAmount + uclAmount
        
        method = 'SCE AgEE Matrix'
        details = `${project.fixtures} toplights × $${rate.toplightRebate} + ${project.uclFixtures || 0} UCL × $${rate.uclRebate}`
        
        if (project.facilityType && project.cropType) {
          details += ` (${project.facilityType}, ${project.cropType})`
        }
      }
    }
    
    // 2. Tiered Rate Structure (Consumers Energy)
    else if (rebate.tierStructure && rebate.tierStructure.length > 0) {
      const kwhSavedFirstYear = kwhSaved
      let tierAmount = 0
      const tierDetails = []
      
      for (const tier of rebate.tierStructure) {
        const tierKwh = Math.min(Math.max(kwhSavedFirstYear - tier.min, 0), tier.max - tier.min)
        if (tierKwh > 0) {
          const tierValue = tierKwh * tier.rate
          tierAmount += tierValue
          tierDetails.push(`${Math.round(tierKwh).toLocaleString()} kWh × $${tier.rate}`)
        }
      }
      
      amount = tierAmount
      method = 'Tiered per kWh'
      details = tierDetails.join(' + ')
    }
    
    // 3. Simple per-kWh Rate
    else if (rebate.rebateRate > 0 && rebate.rebateRate < 1) {
      amount = kwhSaved * rebate.rebateRate
      method = 'Per kWh Saved'
      details = `${Math.round(kwhSaved).toLocaleString()} kWh × $${rebate.rebateRate}/kWh`
    }
    
    // 4. Per-Fixture Rate
    else if (rebate.rebateRate >= 1) {
      amount = project.fixtures * rebate.rebateRate
      method = 'Per Fixture'
      details = `${project.fixtures} fixtures × $${rebate.rebateRate}/fixture`
    }
    
    // 5. Custom Calculation for Special Programs
    else if (rebate.rebateType === 'custom') {
      // Custom programs typically cover percentage of project cost
      const percentageCovered = this.estimateCustomPercentage(rebate)
      amount = project.installationCost * percentageCovered
      method = 'Custom Project'
      details = `${(percentageCovered * 100)}% of $${project.installationCost.toLocaleString()} project cost`
    }
    
    // 6. Apply Maximum Rebate Cap
    const originalAmount = amount
    amount = Math.min(amount, rebate.maxRebate || Infinity)
    
    if (originalAmount > amount && rebate.maxRebate) {
      details += ` (capped at $${rebate.maxRebate.toLocaleString()})`
    }
    
    return { amount, method, details }
  }

  private estimateCustomPercentage(rebate: RebateProgram): number {
    // Estimate percentage coverage for custom programs based on utility and program type
    if (rebate.utilityCompany.includes('Con Edison')) return 0.30 // 30%
    if (rebate.utilityCompany.includes('National Grid')) return 0.35 // 35%
    if (rebate.utilityCompany.includes('PG&E')) return 0.40 // 40%
    if (rebate.utilityCompany.includes('Dominion')) return 0.25 // 25%
    if (rebate.utilityCompany.includes('Centerpoint')) return 0.45 // 45%
    
    return 0.30 // Default 30%
  }
  
  private calculateIRR(initialInvestment: number, annualCashFlow: number, years: number): number {
    // Simplified IRR calculation
    // For more accurate results, use Newton's method or similar
    let low = 0
    let high = 1
    let guess = 0.1
    
    for (let i = 0; i < 20; i++) {
      let npv = -initialInvestment
      for (let year = 1; year <= years; year++) {
        npv += annualCashFlow / Math.pow(1 + guess, year)
      }
      
      if (Math.abs(npv) < 0.01) return guess
      
      if (npv > 0) {
        low = guess
        guess = (guess + high) / 2
      } else {
        high = guess
        guess = (low + guess) / 2
      }
    }
    
    return guess
  }
  
  private identifyStackableIncentives(
    project: ProjectDetails,
    rebates: RebateProgram[]
  ): any[] {
    const incentives: any[] = []
    
    // Federal 179D
    if (project.facilityArea > 5000) {
      incentives.push({
        type: 'federal',
        name: '179D Tax Deduction',
        estimatedValue: project.facilityArea * 0.60, // $0.60/sq ft for 40% savings
        notes: 'Requires 40% energy savings and certification'
      })
    }
    
    // USDA REAP
    if (project.facilityType === 'greenhouse') {
      incentives.push({
        type: 'federal',
        name: 'USDA REAP Grant',
        estimatedValue: project.installationCost * 0.25, // 25% of project cost
        notes: 'For rural agricultural producers'
      })
    }
    
    // Check utility-specific stackable incentives
    rebates.forEach(rebate => {
      if (rebate.stackableIncentives) {
        // Add state incentives
        rebate.stackableIncentives.state?.forEach(incentive => {
          if (!incentives.find(i => i.name === incentive)) {
            incentives.push({
              type: 'state',
              name: incentive,
              estimatedValue: 0, // Requires specific calculation
              notes: 'Contact utility for details'
            })
          }
        })
      }
    })
    
    return incentives
  }
}