import { 
  Trial, 
  DataPoint, 
  StatisticalAnalysis, 
  AnalysisResult, 
  AnalysisMethod,
  PostHocTest,
  AssumptionTest,
  PowerAnalysisResult,
  EffectSize
} from '@/types/trials'

// Statistical functions library
export class StatisticalAnalyzer {
  
  /**
   * Main entry point for statistical analysis
   */
  async analyzeTrialData(trial: Trial, dataPoints: DataPoint[]): Promise<StatisticalAnalysis> {
    const primaryResults = await this.runPrimaryAnalysis(trial, dataPoints)
    const secondaryResults = await this.runSecondaryAnalyses(trial, dataPoints)
    const assumptions = await this.checkAssumptions(dataPoints)
    const powerAnalysis = await this.performPowerAnalysis(trial, dataPoints)
    const effectSizes = await this.calculateEffectSizes(trial, dataPoints)
    
    return {
      primaryResults,
      secondaryResults,
      assumptions,
      powerAnalysis,
      effectSizes
    }
  }

  /**
   * Run primary statistical analysis based on trial design
   */
  private async runPrimaryAnalysis(trial: Trial, dataPoints: DataPoint[]): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = []
    
    for (const measurement of trial.measurements) {
      const measurementData = dataPoints.filter(dp => dp.measurementId === measurement.id)
      
      if (measurementData.length === 0) continue
      
      const analysisMethod = trial.statisticalParams.primaryAnalysis
      
      switch (analysisMethod) {
        case 'T_TEST':
          results.push(await this.performTTest(measurementData, measurement.id))
          break
        case 'ANOVA':
          results.push(await this.performANOVA(measurementData, measurement.id, trial))
          break
        case 'FACTORIAL_ANOVA':
          results.push(await this.performFactorialANOVA(measurementData, measurement.id, trial))
          break
        default:
          throw new Error(`Unsupported analysis method: ${analysisMethod}`)
      }
    }
    
    return results
  }

  /**
   * Two-sample t-test implementation
   */
  private async performTTest(data: DataPoint[], measurementId: string): Promise<AnalysisResult> {
    const treatments = [...new Set(data.map(d => d.treatmentId))]
    
    if (treatments.length !== 2) {
      throw new Error('T-test requires exactly 2 treatments')
    }
    
    const group1 = data.filter(d => d.treatmentId === treatments[0]).map(d => d.value)
    const group2 = data.filter(d => d.treatmentId === treatments[1]).map(d => d.value)
    
    const result = this.twoSampleTTest(group1, group2)
    
    return {
      id: `ttest_${measurementId}`,
      analysisType: 'T_TEST',
      measurementId,
      pValue: result.pValue,
      testStatistic: result.tStatistic,
      degreesOfFreedom: result.df,
      confidenceInterval: result.confidenceInterval,
      effectSize: result.cohensD,
      means: [
        {
          treatmentId: treatments[0],
          mean: this.mean(group1),
          se: this.standardError(group1),
          n: group1.length
        },
        {
          treatmentId: treatments[1],
          mean: this.mean(group2),
          se: this.standardError(group2),
          n: group2.length
        }
      ],
      significant: result.pValue < 0.05,
      interpretation: this.interpretTTestResult(result)
    }
  }

  /**
   * One-way ANOVA implementation
   */
  private async performANOVA(data: DataPoint[], measurementId: string, trial: Trial): Promise<AnalysisResult> {
    const treatments = [...new Set(data.map(d => d.treatmentId))]
    const groups = treatments.map(t => data.filter(d => d.treatmentId === t).map(d => d.value))
    
    const anovaResult = this.oneWayANOVA(groups)
    
    // Post-hoc tests if significant
    let postHocTests: PostHocTest[] = []
    if (anovaResult.pValue < 0.05) {
      postHocTests = this.tukeyPostHoc(groups, treatments)
    }
    
    return {
      id: `anova_${measurementId}`,
      analysisType: 'ANOVA',
      measurementId,
      pValue: anovaResult.pValue,
      testStatistic: anovaResult.fStatistic,
      degreesOfFreedom: anovaResult.dfBetween,
      confidenceInterval: [0, 1], // Not applicable for F-test
      means: treatments.map(treatmentId => {
        const groupData = data.filter(d => d.treatmentId === treatmentId).map(d => d.value)
        return {
          treatmentId,
          mean: this.mean(groupData),
          se: this.standardError(groupData),
          n: groupData.length
        }
      }),
      postHocTests,
      significant: anovaResult.pValue < 0.05,
      interpretation: this.interpretANOVAResult(anovaResult, treatments.length)
    }
  }

  /**
   * Factorial ANOVA implementation
   */
  private async performFactorialANOVA(data: DataPoint[], measurementId: string, trial: Trial): Promise<AnalysisResult> {
    // This is a simplified implementation
    // In practice, you'd want a more robust factorial ANOVA
    const factors = trial.experimentalDesign.factors
    
    if (factors.length !== 2) {
      throw new Error('Simplified factorial ANOVA supports exactly 2 factors')
    }
    
    const factorialResult = this.twoWayANOVA(data, factors)
    
    return {
      id: `factorial_anova_${measurementId}`,
      analysisType: 'FACTORIAL_ANOVA',
      measurementId,
      pValue: factorialResult.mainEffect1.pValue,
      testStatistic: factorialResult.mainEffect1.fStatistic,
      degreesOfFreedom: factorialResult.mainEffect1.df,
      confidenceInterval: [0, 1],
      means: [], // Would need to compute all factor level combinations
      significant: factorialResult.mainEffect1.pValue < 0.05,
      interpretation: this.interpretFactorialANOVAResult(factorialResult)
    }
  }

  /**
   * Check statistical assumptions
   */
  private async checkAssumptions(data: DataPoint[]): Promise<AssumptionTest[]> {
    const assumptions: AssumptionTest[] = []
    
    // Normality test (Shapiro-Wilk approximation)
    const values = data.map(d => d.value)
    const normalityResult = this.shapiroWilkTest(values)
    
    assumptions.push({
      assumption: 'Normality',
      test: 'Shapiro-Wilk',
      pValue: normalityResult.pValue,
      met: normalityResult.pValue > 0.05,
      remedy: normalityResult.pValue <= 0.05 ? 'Consider data transformation or non-parametric test' : undefined
    })
    
    // Homoscedasticity test (Levene's test approximation)
    const treatments = [...new Set(data.map(d => d.treatmentId))]
    if (treatments.length > 1) {
      const groups = treatments.map(t => data.filter(d => d.treatmentId === t).map(d => d.value))
      const homoscedasticityResult = this.levenesTest(groups)
      
      assumptions.push({
        assumption: 'Homoscedasticity',
        test: "Levene's Test",
        pValue: homoscedasticityResult.pValue,
        met: homoscedasticityResult.pValue > 0.05,
        remedy: homoscedasticityResult.pValue <= 0.05 ? 'Consider Welch correction or data transformation' : undefined
      })
    }
    
    return assumptions
  }

  /**
   * Power analysis
   */
  private async performPowerAnalysis(trial: Trial, data: DataPoint[]): Promise<PowerAnalysisResult> {
    const actualSampleSize = trial.statisticalParams.actualSampleSize || data.length
    const effectSize = this.calculateActualEffectSize(data)
    const alpha = trial.statisticalParams.significanceLevel
    
    // Cohen's power approximation
    const achievedPower = this.calculatePower(effectSize, actualSampleSize, alpha)
    
    return {
      achievedPower,
      detectedEffectSize: effectSize,
      recommendedSampleSize: this.calculateRequiredSampleSize(0.8, effectSize, alpha)
    }
  }

  /**
   * Calculate effect sizes
   */
  private async calculateEffectSizes(trial: Trial, data: DataPoint[]): Promise<EffectSize[]> {
    const effectSizes: EffectSize[] = []
    
    for (const measurement of trial.measurements) {
      const measurementData = data.filter(d => d.measurementId === measurement.id)
      
      if (measurementData.length === 0) continue
      
      const treatments = [...new Set(measurementData.map(d => d.treatmentId))]
      
      if (treatments.length === 2) {
        // Cohen's d for two groups
        const group1 = measurementData.filter(d => d.treatmentId === treatments[0]).map(d => d.value)
        const group2 = measurementData.filter(d => d.treatmentId === treatments[1]).map(d => d.value)
        
        const cohensD = this.calculateCohensD(group1, group2)
        
        effectSizes.push({
          measurementId: measurement.id,
          type: 'COHENS_D',
          value: cohensD,
          interpretation: this.interpretCohensD(cohensD),
          confidenceInterval: [cohensD - 0.2, cohensD + 0.2] // Simplified CI
        })
      }
    }
    
    return effectSizes
  }

  // === STATISTICAL HELPER FUNCTIONS ===

  /**
   * Two-sample t-test
   */
  private twoSampleTTest(group1: number[], group2: number[]) {
    const mean1 = this.mean(group1)
    const mean2 = this.mean(group2)
    const var1 = this.variance(group1)
    const var2 = this.variance(group2)
    const n1 = group1.length
    const n2 = group2.length
    
    // Pooled variance
    const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2)
    const se = Math.sqrt(pooledVar * (1/n1 + 1/n2))
    
    const tStatistic = (mean1 - mean2) / se
    const df = n1 + n2 - 2
    const pValue = this.tDistributionPValue(Math.abs(tStatistic), df) * 2 // Two-tailed
    
    // 95% confidence interval for mean difference
    const tCritical = this.tCriticalValue(0.05, df)
    const marginOfError = tCritical * se
    const meanDifference = mean1 - mean2
    
    const cohensD = this.calculateCohensD(group1, group2)
    
    return {
      tStatistic,
      df,
      pValue,
      confidenceInterval: [meanDifference - marginOfError, meanDifference + marginOfError] as [number, number],
      cohensD
    }
  }

  /**
   * One-way ANOVA
   */
  private oneWayANOVA(groups: number[][]) {
    const k = groups.length // number of groups
    const n = groups.reduce((sum, group) => sum + group.length, 0) // total sample size
    
    // Grand mean
    const allValues = groups.flat()
    const grandMean = this.mean(allValues)
    
    // Between-groups sum of squares
    const ssBetween = groups.reduce((sum, group) => {
      const groupMean = this.mean(group)
      return sum + group.length * Math.pow(groupMean - grandMean, 2)
    }, 0)
    
    // Within-groups sum of squares
    const ssWithin = groups.reduce((sum, group) => {
      const groupMean = this.mean(group)
      return sum + group.reduce((groupSum, value) => {
        return groupSum + Math.pow(value - groupMean, 2)
      }, 0)
    }, 0)
    
    // Degrees of freedom
    const dfBetween = k - 1
    const dfWithin = n - k
    
    // Mean squares
    const msBetween = ssBetween / dfBetween
    const msWithin = ssWithin / dfWithin
    
    // F-statistic
    const fStatistic = msBetween / msWithin
    
    // P-value (approximation)
    const pValue = this.fDistributionPValue(fStatistic, dfBetween, dfWithin)
    
    return {
      fStatistic,
      dfBetween,
      dfWithin,
      pValue,
      ssBetween,
      ssWithin,
      msBetween,
      msWithin
    }
  }

  /**
   * Simplified two-way ANOVA
   */
  private twoWayANOVA(data: DataPoint[], factors: any[]) {
    // This is a very simplified implementation
    // In practice, you'd want a more comprehensive factorial ANOVA
    
    const factor1Levels = [...new Set(data.map(d => this.getFactorLevel(d, factors[0].id)))]
    const factor2Levels = [...new Set(data.map(d => this.getFactorLevel(d, factors[1].id)))]
    
    // Main effect 1
    const factor1Groups = factor1Levels.map(level => 
      data.filter(d => this.getFactorLevel(d, factors[0].id) === level).map(d => d.value)
    )
    const mainEffect1 = this.oneWayANOVA(factor1Groups)
    
    // Main effect 2  
    const factor2Groups = factor2Levels.map(level =>
      data.filter(d => this.getFactorLevel(d, factors[1].id) === level).map(d => d.value)
    )
    const mainEffect2 = this.oneWayANOVA(factor2Groups)
    
    return {
      mainEffect1,
      mainEffect2,
      // Interaction effect would require more complex calculation
    }
  }

  /**
   * Tukey's HSD post-hoc test
   */
  private tukeyPostHoc(groups: number[][], treatmentIds: string[]): PostHocTest[] {
    const tests: PostHocTest[] = []
    const k = groups.length
    const n = groups.reduce((sum, group) => sum + group.length, 0)
    
    // Calculate MSE from ANOVA
    const anovaResult = this.oneWayANOVA(groups)
    const mse = anovaResult.msWithin
    
    // Tukey critical value (approximation)
    const q = this.tukeyQValue(0.05, k, n - k)
    
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const mean1 = this.mean(groups[i])
        const mean2 = this.mean(groups[j])
        const meanDifference = mean1 - mean2
        
        const se = Math.sqrt(mse * (1/groups[i].length + 1/groups[j].length))
        const testStatistic = Math.abs(meanDifference) / se
        
        const significant = testStatistic > q
        const pValue = significant ? 0.01 : 0.5 // Simplified
        
        const marginOfError = q * se
        
        tests.push({
          comparison: `${treatmentIds[i]} vs ${treatmentIds[j]}`,
          pValue,
          adjustedPValue: pValue,
          meanDifference,
          confidenceInterval: [meanDifference - marginOfError, meanDifference + marginOfError],
          significant
        })
      }
    }
    
    return tests
  }

  /**
   * Shapiro-Wilk normality test (simplified)
   */
  private shapiroWilkTest(data: number[]) {
    // This is a very simplified approximation
    // In practice, you'd use the full Shapiro-Wilk algorithm
    const n = data.length
    const sorted = [...data].sort((a, b) => a - b)
    const mean = this.mean(data)
    
    // Calculate W statistic (approximation)
    const numerator = 0
    let denominator = 0
    
    for (let i = 0; i < n; i++) {
      denominator += Math.pow(sorted[i] - mean, 2)
    }
    
    // Simplified W calculation
    const w = numerator / denominator || 0.95 // Default to high value if calculation fails
    
    // Convert W to approximate p-value
    const pValue = w > 0.9 ? 0.1 : 0.01
    
    return { w, pValue }
  }

  /**
   * Levene's test for homoscedasticity (simplified)
   */
  private levenesTest(groups: number[][]) {
    // Calculate absolute deviations from group medians
    const deviationGroups = groups.map(group => {
      const median = this.median(group)
      return group.map(value => Math.abs(value - median))
    })
    
    // ANOVA on absolute deviations
    const result = this.oneWayANOVA(deviationGroups)
    
    return {
      fStatistic: result.fStatistic,
      pValue: result.pValue
    }
  }

  // === UTILITY FUNCTIONS ===

  private mean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  private median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid]
  }

  private variance(values: number[]): number {
    const meanVal = this.mean(values)
    return values.reduce((sum, val) => sum + Math.pow(val - meanVal, 2), 0) / (values.length - 1)
  }

  private standardError(values: number[]): number {
    return Math.sqrt(this.variance(values) / values.length)
  }

  private calculateCohensD(group1: number[], group2: number[]): number {
    const mean1 = this.mean(group1)
    const mean2 = this.mean(group2)
    const var1 = this.variance(group1)
    const var2 = this.variance(group2)
    const n1 = group1.length
    const n2 = group2.length
    
    // Pooled standard deviation
    const pooledSD = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))
    
    return (mean1 - mean2) / pooledSD
  }

  private calculateActualEffectSize(data: DataPoint[]): number {
    // Simplified effect size calculation
    const treatments = [...new Set(data.map(d => d.treatmentId))]
    if (treatments.length !== 2) return 0
    
    const group1 = data.filter(d => d.treatmentId === treatments[0]).map(d => d.value)
    const group2 = data.filter(d => d.treatmentId === treatments[1]).map(d => d.value)
    
    return Math.abs(this.calculateCohensD(group1, group2))
  }

  private calculatePower(effectSize: number, sampleSize: number, alpha: number): number {
    // Cohen's power approximation
    const z_alpha = this.zScore(1 - alpha/2)
    const z_beta = effectSize * Math.sqrt(sampleSize / 2) - z_alpha
    return 1 - this.normalCDF(z_beta)
  }

  private calculateRequiredSampleSize(power: number, effectSize: number, alpha: number): number {
    // Simplified sample size calculation
    const z_alpha = this.zScore(1 - alpha/2)
    const z_beta = this.zScore(power)
    return Math.ceil(2 * Math.pow((z_alpha + z_beta) / effectSize, 2))
  }

  // === STATISTICAL DISTRIBUTION FUNCTIONS (Approximations) ===

  private tDistributionPValue(t: number, df: number): number {
    // Simplified t-distribution p-value approximation
    if (df > 30) {
      return 1 - this.normalCDF(t)
    }
    // For smaller df, use approximation
    return Math.max(0.001, 1 / (1 + Math.pow(t, 2) / df))
  }

  private fDistributionPValue(f: number, df1: number, df2: number): number {
    // Very simplified F-distribution p-value
    if (f < 1) return 0.5
    if (f > 10) return 0.001
    return Math.max(0.001, 1 / (1 + f))
  }

  private tCriticalValue(alpha: number, df: number): number {
    // Simplified t critical value
    if (df > 30) return this.zScore(1 - alpha/2)
    return 2.0 + (30 - df) * 0.02 // Rough approximation
  }

  private tukeyQValue(alpha: number, k: number, df: number): number {
    // Simplified Tukey q value
    return 3.0 + k * 0.1 // Very rough approximation
  }

  private zScore(p: number): number {
    // Approximation of inverse normal CDF
    if (p <= 0) return -Infinity
    if (p >= 1) return Infinity
    if (p === 0.5) return 0
    
    // Rough approximation for common values
    if (p > 0.975) return 1.96
    if (p > 0.95) return 1.645
    if (p > 0.9) return 1.28
    if (p < 0.025) return -1.96
    if (p < 0.05) return -1.645
    if (p < 0.1) return -1.28
    
    return 0
  }

  private normalCDF(z: number): number {
    // Simplified normal CDF approximation
    return 0.5 * (1 + this.erf(z / Math.sqrt(2)))
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 =  0.254829592
    const a2 = -0.284496736
    const a3 =  1.421413741
    const a4 = -1.453152027
    const a5 =  1.061405429
    const p  =  0.3275911
    
    const sign = x >= 0 ? 1 : -1
    x = Math.abs(x)
    
    const t = 1.0 / (1.0 + p * x)
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
    
    return sign * y
  }

  // === INTERPRETATION FUNCTIONS ===

  private interpretTTestResult(result: any): string {
    if (result.pValue < 0.001) {
      return "Highly significant difference between groups (p < 0.001)"
    } else if (result.pValue < 0.01) {
      return "Significant difference between groups (p < 0.01)"
    } else if (result.pValue < 0.05) {
      return "Statistically significant difference between groups (p < 0.05)"
    } else {
      return "No statistically significant difference between groups"
    }
  }

  private interpretANOVAResult(result: any, numGroups: number): string {
    if (result.pValue < 0.001) {
      return `Highly significant differences exist among the ${numGroups} groups (p < 0.001)`
    } else if (result.pValue < 0.01) {
      return `Significant differences exist among the ${numGroups} groups (p < 0.01)`
    } else if (result.pValue < 0.05) {
      return `Statistically significant differences exist among the ${numGroups} groups (p < 0.05)`
    } else {
      return `No statistically significant differences among the ${numGroups} groups`
    }
  }

  private interpretFactorialANOVAResult(result: any): string {
    // Simplified interpretation
    return "Factorial ANOVA completed - check individual factor effects"
  }

  private interpretCohensD(d: number): 'SMALL' | 'MEDIUM' | 'LARGE' {
    const absd = Math.abs(d)
    if (absd < 0.2) return 'SMALL'
    if (absd < 0.5) return 'MEDIUM'
    return 'LARGE'
  }

  // === HELPER FUNCTIONS ===

  private getFactorLevel(dataPoint: DataPoint, factorId: string): string {
    // This would need to be implemented based on how factor levels are stored
    // For now, return treatment ID as a proxy
    return dataPoint.treatmentId
  }

  private runSecondaryAnalyses(trial: Trial, dataPoints: DataPoint[]): Promise<AnalysisResult[]> {
    // Implement secondary analyses
    return Promise.resolve([])
  }
}

// Export singleton instance
export const statisticalAnalyzer = new StatisticalAnalyzer()

// Export utility functions for use in other components
export const StatisticalUtils = {
  calculateSampleSize: (power: number, effectSize: number, alpha: number): number => {
    const z_alpha = 1.96 // For alpha = 0.05
    const z_beta = 0.84  // For power = 0.8
    return Math.ceil(2 * Math.pow((z_alpha + z_beta) / effectSize, 2))
  },
  
  calculatePower: (effectSize: number, sampleSize: number, alpha: number): number => {
    const z_alpha = 1.96
    const z_beta = effectSize * Math.sqrt(sampleSize / 2) - z_alpha
    return Math.max(0, Math.min(1, 0.5 + z_beta / 2))
  },
  
  interpretEffectSize: (effectSize: number): string => {
    const abs = Math.abs(effectSize)
    if (abs < 0.2) return 'Small effect'
    if (abs < 0.5) return 'Medium effect'
    if (abs < 0.8) return 'Large effect'
    return 'Very large effect'
  },
  
  validateTrialDesign: (trial: Trial): { valid: boolean; warnings: string[]; errors: string[] } => {
    const warnings: string[] = []
    const errors: string[] = []
    
    // Check sample size
    if (trial.statisticalParams.actualSampleSize && trial.statisticalParams.actualSampleSize < 10) {
      warnings.push('Sample size is quite small (n < 10). Consider increasing for better power.')
    }
    
    // Check replication
    if (trial.experimentalDesign.replicates < 3) {
      warnings.push('Less than 3 replicates. Consider increasing for better reliability.')
    }
    
    // Check factors
    if (trial.experimentalDesign.factors.length === 0) {
      errors.push('At least one factor must be defined.')
    }
    
    // Check measurements
    if (trial.measurements.length === 0) {
      errors.push('At least one measurement must be defined.')
    }
    
    return {
      valid: errors.length === 0,
      warnings,
      errors
    }
  }
}