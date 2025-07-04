import { Trial, TrialResults, StatisticalAnalysis, AnalysisResult } from '@/types/trials'

interface RevenueValidationResult {
  trial: Trial
  validatedSavings: {
    energySavings: {
      baseline: number // kWh/year
      optimized: number // kWh/year
      reduction: number // kWh/year
      percentReduction: number
      dollarSavings: number // $/year
      confidence: number // 0-1
      pValue: number
    }
    yieldIncrease: {
      baseline: number // kg/m²/year
      optimized: number // kg/m²/year
      increase: number // kg/m²/year
      percentIncrease: number
      dollarValue: number // $/year
      confidence: number
      pValue: number
    }
    operationalEfficiency: {
      laborHourReduction: number // hours/week
      maintenanceCostReduction: number // $/year
      totalSavings: number // $/year
      confidence: number
    }
  }
  totalAnnualSavings: number
  implementationCost: number
  paybackPeriod: number // months
  riskAssessment: RevenueRiskProfile
  contractRecommendation: RevenueContractTerms
}

interface RevenueRiskProfile {
  technicalRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  marketRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  implementationRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  mitigationStrategies: string[]
  confidenceLevel: number // 0-1
  guaranteeRecommendation: {
    canGuarantee: boolean
    maxGuaranteePercentage: number
    guaranteeConditions: string[]
  }
}

interface RevenueContractTerms {
  revenueSharingPercentage: number // 15-25%
  guaranteedMinimumSavings: number // $/year
  contractDuration: number // years
  performanceMonitoring: {
    frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'
    metrics: string[]
    reportingRequirements: string[]
  }
  penaltyClause: {
    enabled: boolean
    underperformanceThreshold: number // percentage below guarantee
    penaltyPercentage: number
  }
  terminationClauses: string[]
}

export class RevenueValidationEngine {
  
  /**
   * Analyze trial results for revenue sharing validation
   */
  async validateTrialForRevenue(
    trial: Trial, 
    results: TrialResults,
    facilityParameters: FacilityParameters
  ): Promise<RevenueValidationResult> {
    
    // Extract energy savings
    const energySavings = await this.calculateEnergySavings(trial, results, facilityParameters)
    
    // Extract yield improvements
    const yieldIncrease = await this.calculateYieldImprovements(trial, results, facilityParameters)
    
    // Calculate operational efficiency gains
    const operationalEfficiency = await this.calculateOperationalSavings(trial, results, facilityParameters)
    
    // Total financial impact
    const totalAnnualSavings = energySavings.dollarSavings + 
                              yieldIncrease.dollarValue + 
                              operationalEfficiency.totalSavings
    
    // Implementation cost estimation
    const implementationCost = await this.estimateImplementationCost(trial, facilityParameters)
    
    // Risk assessment
    const riskAssessment = await this.assessImplementationRisk(trial, results, facilityParameters)
    
    // Generate contract recommendations
    const contractRecommendation = await this.generateContractTerms(
      totalAnnualSavings, 
      implementationCost, 
      riskAssessment
    )
    
    return {
      trial,
      validatedSavings: {
        energySavings,
        yieldIncrease,
        operationalEfficiency
      },
      totalAnnualSavings,
      implementationCost,
      paybackPeriod: implementationCost / (totalAnnualSavings / 12),
      riskAssessment,
      contractRecommendation
    }
  }

  /**
   * Calculate energy savings from trial results
   */
  private async calculateEnergySavings(
    trial: Trial, 
    results: TrialResults,
    facility: FacilityParameters
  ) {
    // Find energy-related measurements
    const energyResults = results.statisticalAnalysis.primaryResults.filter(
      result => this.isEnergyMeasurement(result, trial)
    )
    
    if (energyResults.length === 0) {
      return this.getZeroEnergySavings()
    }
    
    // Calculate baseline vs optimized energy consumption
    const bestTreatment = this.findBestEnergyTreatment(energyResults)
    const controlTreatment = this.findControlTreatment(energyResults)
    
    const energyReduction = this.calculateEnergyReduction(bestTreatment, controlTreatment)
    const annualEnergyReduction = energyReduction * facility.operatingHours * 365
    
    return {
      baseline: controlTreatment.mean * facility.operatingHours * 365,
      optimized: bestTreatment.mean * facility.operatingHours * 365,
      reduction: annualEnergyReduction,
      percentReduction: (energyReduction / controlTreatment.mean) * 100,
      dollarSavings: annualEnergyReduction * facility.electricityRate,
      confidence: this.calculateConfidence(bestTreatment.pValue),
      pValue: bestTreatment.pValue
    }
  }

  /**
   * Calculate yield improvements from trial results
   */
  private async calculateYieldImprovements(
    trial: Trial,
    results: TrialResults,
    facility: FacilityParameters
  ) {
    // Find yield-related measurements
    const yieldResults = results.statisticalAnalysis.primaryResults.filter(
      result => this.isYieldMeasurement(result, trial)
    )
    
    if (yieldResults.length === 0) {
      return this.getZeroYieldIncrease()
    }
    
    const bestTreatment = this.findBestYieldTreatment(yieldResults)
    const controlTreatment = this.findControlTreatment(yieldResults)
    
    const yieldIncrease = bestTreatment.mean - controlTreatment.mean
    const annualYieldIncrease = yieldIncrease * facility.growingArea * facility.cropsPerYear
    
    return {
      baseline: controlTreatment.mean * facility.growingArea * facility.cropsPerYear,
      optimized: bestTreatment.mean * facility.growingArea * facility.cropsPerYear,
      increase: annualYieldIncrease,
      percentIncrease: (yieldIncrease / controlTreatment.mean) * 100,
      dollarValue: annualYieldIncrease * facility.cropValuePerKg,
      confidence: this.calculateConfidence(bestTreatment.pValue),
      pValue: bestTreatment.pValue
    }
  }

  /**
   * Calculate operational efficiency savings
   */
  private async calculateOperationalSavings(
    trial: Trial,
    results: TrialResults,
    facility: FacilityParameters
  ) {
    // Estimate labor savings from automation/optimization
    const laborSavings = this.estimateLaborSavings(trial, facility)
    
    // Estimate maintenance cost reductions
    const maintenanceSavings = this.estimateMaintenanceSavings(trial, facility)
    
    return {
      laborHourReduction: laborSavings.hoursPerWeek,
      maintenanceCostReduction: maintenanceSavings,
      totalSavings: laborSavings.dollarValue + maintenanceSavings,
      confidence: 0.7 // Conservative estimate for operational savings
    }
  }

  /**
   * Assess implementation risk for revenue sharing
   */
  private async assessImplementationRisk(
    trial: Trial,
    results: TrialResults,
    facility: FacilityParameters
  ): Promise<RevenueRiskProfile> {
    
    // Technical risk assessment
    const technicalRisk = this.assessTechnicalRisk(trial, results)
    
    // Market risk assessment
    const marketRisk = this.assessMarketRisk(facility)
    
    // Implementation risk assessment
    const implementationRisk = this.assessImplementationComplexity(trial, facility)
    
    // Overall risk calculation
    const overallRisk = this.calculateOverallRisk(technicalRisk, marketRisk, implementationRisk)
    
    // Confidence level based on statistical power and effect sizes
    const confidenceLevel = this.calculateOverallConfidence(results.statisticalAnalysis)
    
    return {
      technicalRisk,
      marketRisk,
      implementationRisk,
      overallRisk,
      mitigationStrategies: this.generateMitigationStrategies(trial, overallRisk),
      confidenceLevel,
      guaranteeRecommendation: {
        canGuarantee: confidenceLevel > 0.8 && overallRisk === 'LOW',
        maxGuaranteePercentage: this.calculateMaxGuarantee(confidenceLevel, overallRisk),
        guaranteeConditions: this.generateGuaranteeConditions(trial, overallRisk)
      }
    }
  }

  /**
   * Generate contract terms based on validation results
   */
  private async generateContractTerms(
    totalSavings: number,
    implementationCost: number,
    risk: RevenueRiskProfile
  ): Promise<RevenueContractTerms> {
    
    // Calculate revenue sharing percentage based on risk and savings
    const revenueSharingPercentage = this.calculateRevenueSharingRate(totalSavings, risk)
    
    // Set guaranteed minimum based on confidence level
    const guaranteedMinimumSavings = totalSavings * risk.guaranteeRecommendation.maxGuaranteePercentage / 100
    
    // Contract duration based on payback period and risk
    const contractDuration = this.calculateContractDuration(implementationCost, totalSavings, risk)
    
    return {
      revenueSharingPercentage,
      guaranteedMinimumSavings,
      contractDuration,
      performanceMonitoring: {
        frequency: risk.overallRisk === 'HIGH' ? 'MONTHLY' : 'QUARTERLY',
        metrics: this.generateMonitoringMetrics(risk),
        reportingRequirements: this.generateReportingRequirements(risk)
      },
      penaltyClause: {
        enabled: risk.guaranteeRecommendation.canGuarantee,
        underperformanceThreshold: 80, // 80% of guaranteed savings
        penaltyPercentage: 10 // 10% penalty on revenue sharing
      },
      terminationClauses: this.generateTerminationClauses(risk)
    }
  }

  // === HELPER METHODS ===

  private isEnergyMeasurement(result: AnalysisResult, trial: Trial): boolean {
    const measurement = trial.measurements.find(m => m.id === result.measurementId)
    return measurement?.type === 'ECONOMIC' && 
           (measurement.name.toLowerCase().includes('energy') || 
            measurement.name.toLowerCase().includes('power') ||
            measurement.unit.toLowerCase().includes('kwh'))
  }

  private isYieldMeasurement(result: AnalysisResult, trial: Trial): boolean {
    const measurement = trial.measurements.find(m => m.id === result.measurementId)
    return measurement?.type === 'YIELD' || 
           (measurement?.name.toLowerCase().includes('yield') ||
            measurement?.name.toLowerCase().includes('weight') ||
            measurement?.unit.toLowerCase().includes('kg'))
  }

  private findBestEnergyTreatment(results: AnalysisResult[]) {
    // Find treatment with lowest energy consumption (highest efficiency)
    return results[0].means.reduce((best, current) => 
      current.mean < best.mean ? current : best
    )
  }

  private findBestYieldTreatment(results: AnalysisResult[]) {
    // Find treatment with highest yield
    return results[0].means.reduce((best, current) => 
      current.mean > best.mean ? current : best
    )
  }

  private findControlTreatment(results: AnalysisResult[]) {
    // Find control treatment (usually first in list or marked as control)
    return results[0].means[0] // Simplified - in practice would need better control identification
  }

  private calculateEnergyReduction(best: any, control: any): number {
    return Math.max(0, control.mean - best.mean)
  }

  private calculateConfidence(pValue: number): number {
    return 1 - pValue
  }

  private assessTechnicalRisk(trial: Trial, results: TrialResults): 'LOW' | 'MEDIUM' | 'HIGH' {
    const dataQuality = results.dataQuality.completeness
    const effectSizes = results.statisticalAnalysis.effectSizes
    
    if (dataQuality > 0.95 && effectSizes.some(es => es.interpretation === 'LARGE')) {
      return 'LOW'
    } else if (dataQuality > 0.85 && effectSizes.some(es => es.interpretation === 'MEDIUM')) {
      return 'MEDIUM'
    } else {
      return 'HIGH'
    }
  }

  private assessMarketRisk(facility: FacilityParameters): 'LOW' | 'MEDIUM' | 'HIGH' {
    // Assess based on crop type, market stability, etc.
    // Simplified implementation
    if (facility.cropType === 'leafy_greens') return 'LOW'
    if (facility.cropType === 'herbs') return 'MEDIUM'
    return 'HIGH'
  }

  private assessImplementationComplexity(trial: Trial, facility: FacilityParameters): 'LOW' | 'MEDIUM' | 'HIGH' {
    const treatmentComplexity = trial.treatments.length
    const infrastructureChanges = this.estimateInfrastructureChanges(trial)
    
    if (treatmentComplexity <= 2 && infrastructureChanges === 'MINIMAL') {
      return 'LOW'
    } else if (treatmentComplexity <= 4 && infrastructureChanges === 'MODERATE') {
      return 'MEDIUM'
    } else {
      return 'HIGH'
    }
  }

  private calculateOverallRisk(tech: string, market: string, impl: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const riskScore = 
      (tech === 'HIGH' ? 3 : tech === 'MEDIUM' ? 2 : 1) +
      (market === 'HIGH' ? 3 : market === 'MEDIUM' ? 2 : 1) +
      (impl === 'HIGH' ? 3 : impl === 'MEDIUM' ? 2 : 1)
    
    if (riskScore <= 4) return 'LOW'
    if (riskScore <= 7) return 'MEDIUM'
    return 'HIGH'
  }

  private calculateOverallConfidence(analysis: StatisticalAnalysis): number {
    const avgPValue = analysis.primaryResults.reduce((sum, r) => sum + r.pValue, 0) / analysis.primaryResults.length
    const power = analysis.powerAnalysis.achievedPower
    
    return (1 - avgPValue) * power
  }

  private calculateRevenueSharingRate(savings: number, risk: RevenueRiskProfile): number {
    // Base rate: 20%
    let rate = 20
    
    // Adjust for risk
    if (risk.overallRisk === 'LOW') rate -= 2
    if (risk.overallRisk === 'HIGH') rate += 3
    
    // Adjust for savings magnitude
    if (savings > 100000) rate -= 1 // Large savings get better rate
    if (savings < 25000) rate += 2  // Small savings get higher rate
    
    return Math.max(15, Math.min(25, rate))
  }

  private calculateMaxGuarantee(confidence: number, risk: RevenueRiskProfile): number {
    let guarantee = confidence * 100
    
    // Reduce guarantee based on risk
    if (risk.overallRisk === 'MEDIUM') guarantee *= 0.8
    if (risk.overallRisk === 'HIGH') guarantee *= 0.6
    
    return Math.max(50, Math.min(90, guarantee))
  }

  private calculateContractDuration(cost: number, savings: number, risk: RevenueRiskProfile): number {
    const paybackYears = cost / savings
    
    // Contract should be 2-3x payback period
    let duration = Math.ceil(paybackYears * 2.5)
    
    // Adjust for risk
    if (risk.overallRisk === 'HIGH') duration += 1
    
    return Math.max(3, Math.min(7, duration))
  }

  // Simplified placeholder methods
  private getZeroEnergySavings() {
    return {
      baseline: 0, optimized: 0, reduction: 0, percentReduction: 0,
      dollarSavings: 0, confidence: 0, pValue: 1
    }
  }

  private getZeroYieldIncrease() {
    return {
      baseline: 0, optimized: 0, increase: 0, percentIncrease: 0,
      dollarValue: 0, confidence: 0, pValue: 1
    }
  }

  private estimateLaborSavings(trial: Trial, facility: FacilityParameters) {
    return { hoursPerWeek: 5, dollarValue: 2600 } // $26/hour * 5 hours * 52 weeks
  }

  private estimateMaintenanceSavings(trial: Trial, facility: FacilityParameters): number {
    return 5000 // $5,000/year in maintenance savings
  }

  private estimateImplementationCost(trial: Trial, facility: FacilityParameters): Promise<number> {
    // Simplified cost estimation
    return Promise.resolve(50000) // $50,000 implementation cost
  }

  private estimateInfrastructureChanges(trial: Trial): 'MINIMAL' | 'MODERATE' | 'EXTENSIVE' {
    // Simplified assessment
    return 'MODERATE'
  }

  private generateMitigationStrategies(trial: Trial, risk: string): string[] {
    return [
      'Phased implementation approach',
      'Continuous monitoring and adjustment',
      'Backup system integration',
      'Staff training and support'
    ]
  }

  private generateGuaranteeConditions(trial: Trial, risk: string): string[] {
    return [
      'Customer maintains equipment as specified',
      'Growing practices follow recommended protocols',
      'Environmental conditions within specified ranges',
      'Regular system maintenance performed'
    ]
  }

  private generateMonitoringMetrics(risk: RevenueRiskProfile): string[] {
    return [
      'Energy consumption (kWh)',
      'Yield per square meter',
      'Operating efficiency metrics',
      'Equipment performance indicators'
    ]
  }

  private generateReportingRequirements(risk: RevenueRiskProfile): string[] {
    return [
      'Monthly energy bills and consumption data',
      'Harvest records and yield measurements',
      'Equipment maintenance logs',
      'Performance deviation reports'
    ]
  }

  private generateTerminationClauses(risk: RevenueRiskProfile): string[] {
    return [
      'Mutual termination with 90-day notice',
      'Performance-based termination if savings < 50% of guarantee',
      'Force majeure clause for uncontrollable events',
      'Equipment ownership transfer provisions'
    ]
  }
}

// Supporting interfaces
interface FacilityParameters {
  growingArea: number // m²
  operatingHours: number // hours/day
  electricityRate: number // $/kWh
  cropsPerYear: number
  cropValuePerKg: number // $/kg
  cropType: 'leafy_greens' | 'herbs' | 'tomatoes' | 'cannabis' | 'other'
  annualRevenue: number
  facilityType: 'greenhouse' | 'indoor_farm' | 'vertical_farm'
  automationLevel: 'manual' | 'semi_automated' | 'fully_automated'
}

// Export singleton
export const revenueValidationEngine = new RevenueValidationEngine()

// Export utility functions
export const RevenueValidationUtils = {
  /**
   * Quick validation check for trial eligibility
   */
  isTrialEligibleForRevenue(trial: Trial): { eligible: boolean; reasons: string[] } {
    const reasons: string[] = []
    
    if (!trial.results) {
      reasons.push('Trial results not available')
    }
    
    if (trial.status !== 'COMPLETED') {
      reasons.push('Trial not completed')
    }
    
    const hasEnergyMeasurements = trial.measurements.some(m => 
      m.type === 'ECONOMIC' || m.name.toLowerCase().includes('energy')
    )
    const hasYieldMeasurements = trial.measurements.some(m => 
      m.type === 'YIELD' || m.name.toLowerCase().includes('yield')
    )
    
    if (!hasEnergyMeasurements && !hasYieldMeasurements) {
      reasons.push('No energy or yield measurements found')
    }
    
    return {
      eligible: reasons.length === 0,
      reasons
    }
  },

  /**
   * Calculate minimum facility size for revenue sharing viability
   */
  calculateMinimumViableFacility(expectedSavingsPerSqM: number, implementationCost: number): number {
    const minimumAnnualSavings = implementationCost * 0.3 // 30% of implementation cost
    return Math.ceil(minimumAnnualSavings / expectedSavingsPerSqM)
  },

  /**
   * Generate revenue sharing proposal summary
   */
  generateProposalSummary(validation: RevenueValidationResult): {
    headline: string
    guaranteedSavings: string
    paybackPeriod: string
    riskLevel: string
    recommendation: string
  } {
    return {
      headline: `$${Math.round(validation.totalAnnualSavings).toLocaleString()} Annual Savings Potential`,
      guaranteedSavings: `$${Math.round(validation.contractRecommendation.guaranteedMinimumSavings).toLocaleString()} guaranteed minimum`,
      paybackPeriod: `${Math.round(validation.paybackPeriod)} month payback`,
      riskLevel: `${validation.riskAssessment.overallRisk.toLowerCase()} risk implementation`,
      recommendation: validation.riskAssessment.guaranteeRecommendation.canGuarantee 
        ? 'Recommended for revenue sharing'
        : 'Additional validation recommended'
    }
  }
}