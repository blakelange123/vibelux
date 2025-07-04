/**
 * Statistical Analysis & Correlation Engine
 * Advanced regression modeling and correlation analysis for cultivation data
 */

export interface DataPoint {
  timestamp: Date;
  variables: Record<string, number>;
  metadata?: Record<string, any>;
}

export interface Variable {
  name: string;
  unit: string;
  type: 'continuous' | 'categorical' | 'ordinal';
  description?: string;
  range?: { min: number; max: number };
}

export interface CorrelationResult {
  variable1: string;
  variable2: string;
  coefficient: number; // Pearson correlation coefficient
  pValue: number;
  confidence: number;
  strength: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
  direction: 'positive' | 'negative' | 'none';
  sampleSize: number;
}

export interface RegressionResult {
  model: 'linear' | 'polynomial' | 'exponential' | 'logarithmic' | 'multivariate';
  equation: string;
  coefficients: Record<string, number>;
  rSquared: number;
  adjustedRSquared: number;
  pValue: number;
  standardError: number;
  confidenceIntervals: Record<string, { lower: number; upper: number }>;
  predictions?: Array<{
    x: number;
    y: number;
    yPredicted: number;
    residual: number;
  }>
  anova?: {
    fStatistic: number;
    dfModel: number;
    dfResidual: number;
    pValue: number;
  }
}

export interface StatisticalSummary {
  variable: string;
  count: number;
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  outliers: number[];
}

export interface TimeSeriesAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable' | 'cyclic';
  seasonality: {
    present: boolean;
    period?: number;
    amplitude?: number;
  }
  forecast: Array<{
    timestamp: Date;
    value: number;
    confidenceInterval: { lower: number; upper: number };
  }>
  decomposition: {
    trend: number[];
    seasonal: number[];
    residual: number[];
  }
}

export interface CultivationCorrelation {
  primaryFactor: string;
  outcome: string;
  correlation: CorrelationResult;
  regression: RegressionResult;
  insights: string[];
  recommendations: string[];
  economicImpact?: {
    potentialSavings: number;
    yieldIncrease: number;
    qualityImprovement: number;
  }
}

export class CorrelationEngine {
  private data: DataPoint[] = [];
  private variables: Map<string, Variable> = new Map();
  
  constructor() {
    this.initializeCommonVariables();
  }
  
  private initializeCommonVariables() {
    // Environmental variables
    this.addVariable({
      name: 'temperature',
      unit: '°C',
      type: 'continuous',
      description: 'Air temperature',
      range: { min: 15, max: 35 }
    });
    
    this.addVariable({
      name: 'humidity',
      unit: '%',
      type: 'continuous',
      description: 'Relative humidity',
      range: { min: 30, max: 80 }
    });
    
    this.addVariable({
      name: 'vpd',
      unit: 'kPa',
      type: 'continuous',
      description: 'Vapor pressure deficit',
      range: { min: 0.4, max: 1.6 }
    });
    
    this.addVariable({
      name: 'co2',
      unit: 'ppm',
      type: 'continuous',
      description: 'CO2 concentration',
      range: { min: 400, max: 1500 }
    });
    
    // Lighting variables
    this.addVariable({
      name: 'ppfd',
      unit: 'μmol/m²/s',
      type: 'continuous',
      description: 'Photosynthetic photon flux density',
      range: { min: 0, max: 2000 }
    });
    
    this.addVariable({
      name: 'dli',
      unit: 'mol/m²/day',
      type: 'continuous',
      description: 'Daily light integral',
      range: { min: 0, max: 65 }
    });
    
    this.addVariable({
      name: 'photoperiod',
      unit: 'hours',
      type: 'continuous',
      description: 'Light hours per day',
      range: { min: 0, max: 24 }
    });
    
    // Cultivation outcomes
    this.addVariable({
      name: 'yield',
      unit: 'g/m²',
      type: 'continuous',
      description: 'Dry weight yield per square meter'
    });
    
    this.addVariable({
      name: 'thc',
      unit: '%',
      type: 'continuous',
      description: 'THC percentage',
      range: { min: 0, max: 35 }
    });
    
    this.addVariable({
      name: 'terpenes',
      unit: '%',
      type: 'continuous',
      description: 'Total terpene percentage',
      range: { min: 0, max: 5 }
    });
    
    this.addVariable({
      name: 'energy_usage',
      unit: 'kWh/g',
      type: 'continuous',
      description: 'Energy consumption per gram yield'
    });
  }
  
  /**
   * Add a custom variable
   */
  addVariable(variable: Variable) {
    this.variables.set(variable.name, variable);
  }
  
  /**
   * Load cultivation data
   */
  loadData(data: DataPoint[]) {
    this.data = data;
  }
  
  /**
   * Calculate Pearson correlation between two variables
   */
  calculateCorrelation(var1: string, var2: string): CorrelationResult {
    const data1 = this.extractVariable(var1);
    const data2 = this.extractVariable(var2);
    
    if (data1.length !== data2.length || data1.length < 3) {
      throw new Error('Insufficient data for correlation analysis');
    }
    
    const n = data1.length;
    const mean1 = this.mean(data1);
    const mean2 = this.mean(data2);
    
    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = data1[i] - mean1;
      const diff2 = data2[i] - mean2;
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    }
    
    const coefficient = numerator / Math.sqrt(denominator1 * denominator2);
    
    // Calculate p-value (simplified for demonstration)
    const tStatistic = coefficient * Math.sqrt((n - 2) / (1 - coefficient * coefficient));
    const pValue = this.calculatePValue(tStatistic, n - 2);
    
    // Determine strength and direction
    const absCoeff = Math.abs(coefficient);
    let strength: CorrelationResult['strength'];
    if (absCoeff < 0.2) strength = 'very_weak';
    else if (absCoeff < 0.4) strength = 'weak';
    else if (absCoeff < 0.6) strength = 'moderate';
    else if (absCoeff < 0.8) strength = 'strong';
    else strength = 'very_strong';
    
    return {
      variable1: var1,
      variable2: var2,
      coefficient,
      pValue,
      confidence: (1 - pValue) * 100,
      strength,
      direction: coefficient > 0 ? 'positive' : coefficient < 0 ? 'negative' : 'none',
      sampleSize: n
    }
  }
  
  /**
   * Perform linear regression
   */
  linearRegression(
    independentVar: string,
    dependentVar: string
  ): RegressionResult {
    const x = this.extractVariable(independentVar);
    const y = this.extractVariable(dependentVar);
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    // Calculate coefficients
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    let ssTotal = 0;
    let ssResidual = 0;
    const predictions: RegressionResult['predictions'] = [];
    
    for (let i = 0; i < n; i++) {
      const yPredicted = slope * x[i] + intercept;
      const residual = y[i] - yPredicted;
      ssTotal += Math.pow(y[i] - yMean, 2);
      ssResidual += Math.pow(residual, 2)
      
      predictions.push({
        x: x[i],
        y: y[i],
        yPredicted,
        residual
      });
    }
    
    const rSquared = 1 - (ssResidual / ssTotal);
    const adjustedRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - 2));
    
    // Standard error
    const standardError = Math.sqrt(ssResidual / (n - 2));
    
    // Calculate p-value for slope
    const slopeStandardError = standardError / Math.sqrt(sumX2 - sumX * sumX / n);
    const tStatistic = slope / slopeStandardError;
    const pValue = this.calculatePValue(tStatistic, n - 2);
    
    return {
      model: 'linear',
      equation: `y = ${slope.toFixed(3)}x + ${intercept.toFixed(3)}`,
      coefficients: { slope, intercept },
      rSquared,
      adjustedRSquared,
      pValue,
      standardError,
      confidenceIntervals: {
        slope: {
          lower: slope - 1.96 * slopeStandardError,
          upper: slope + 1.96 * slopeStandardError
        },
        intercept: {
          lower: intercept - 1.96 * standardError,
          upper: intercept + 1.96 * standardError
        }
      },
      predictions
    };
  }
  
  /**
   * Perform multivariate regression
   */
  multivariateRegression(
    independentVars: string[],
    dependentVar: string
  ): RegressionResult {
    // Simplified implementation - in production would use matrix operations
    const y = this.extractVariable(dependentVar);
    const X = independentVars.map(v => this.extractVariable(v));
    const n = y.length;
    const k = independentVars.length;
    
    // Calculate coefficients using normal equations
    // This is a simplified version - real implementation would use QR decomposition
    const coefficients: Record<string, number> = {};
    
    // For demonstration, calculate simple averages
    independentVars.forEach((varName, i) => {
      const correlation = this.calculateCorrelation(varName, dependentVar);
      coefficients[varName] = correlation.coefficient * 
        (this.standardDeviation(y) / this.standardDeviation(X[i]));
    });
    
    // Calculate R-squared
    let ssTotal = 0;
    let ssResidual = 0;
    const yMean = this.mean(y);
    
    for (let i = 0; i < n; i++) {
      let yPredicted = 0;
      independentVars.forEach((varName, j) => {
        yPredicted += coefficients[varName] * X[j][i];
      });
      
      ssTotal += Math.pow(y[i] - yMean, 2);
      ssResidual += Math.pow(y[i] - yPredicted, 2);
    }
    
    const rSquared = 1 - (ssResidual / ssTotal);
    const adjustedRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - k - 1));
    
    // F-statistic for overall model significance
    const fStatistic = (rSquared / k) / ((1 - rSquared) / (n - k - 1));
    const pValue = this.calculateFPValue(fStatistic, k, n - k - 1);
    
    return {
      model: 'multivariate',
      equation: `y = ${Object.entries(coefficients)
        .map(([varName, coef]) => `${coef.toFixed(3)}*${varName}`)
        .join(' + ')}`,
      coefficients,
      rSquared,
      adjustedRSquared,
      pValue,
      standardError: Math.sqrt(ssResidual / (n - k - 1)),
      confidenceIntervals: {}, // Simplified
      anova: {
        fStatistic,
        dfModel: k,
        dfResidual: n - k - 1,
        pValue
      }
    };
  }
  
  /**
   * Find all significant correlations in the dataset
   */
  findAllCorrelations(
    minCorrelation: number = 0.3,
    maxPValue: number = 0.05
  ): CorrelationResult[] {
    const results: CorrelationResult[] = [];
    const varNames = Array.from(this.variables.keys());
    
    for (let i = 0; i < varNames.length; i++) {
      for (let j = i + 1; j < varNames.length; j++) {
        try {
          const correlation = this.calculateCorrelation(varNames[i], varNames[j]);
          if (Math.abs(correlation.coefficient) >= minCorrelation && 
              correlation.pValue <= maxPValue) {
            results.push(correlation);
          }
        } catch (error) {
          // Skip if insufficient data
        }
      }
    }
    
    // Sort by absolute correlation strength
    return results.sort((a, b) => 
      Math.abs(b.coefficient) - Math.abs(a.coefficient)
    );
  }
  
  /**
   * Analyze cultivation-specific correlations
   */
  analyzeCultivationCorrelations(): CultivationCorrelation[] {
    const results: CultivationCorrelation[] = [];
    
    // Key relationships to analyze
    const relationships = [
      { primary: 'dli', outcome: 'yield', insight: 'Light intensity impact on yield' },
      { primary: 'vpd', outcome: 'yield', insight: 'VPD optimization for growth' },
      { primary: 'co2', outcome: 'yield', insight: 'CO2 enrichment effectiveness' },
      { primary: 'temperature', outcome: 'terpenes', insight: 'Temperature effect on terpene production' },
      { primary: 'humidity', outcome: 'thc', insight: 'Humidity impact on cannabinoid production' },
      { primary: 'ppfd', outcome: 'energy_usage', insight: 'Light efficiency analysis' }
    ];
    
    for (const rel of relationships) {
      try {
        const correlation = this.calculateCorrelation(rel.primary, rel.outcome);
        const regression = this.linearRegression(rel.primary, rel.outcome);
        
        const insights = this.generateInsights(rel.primary, rel.outcome, correlation, regression);
        const recommendations = this.generateRecommendations(rel.primary, rel.outcome, correlation, regression);
        
        results.push({
          primaryFactor: rel.primary,
          outcome: rel.outcome,
          correlation,
          regression,
          insights,
          recommendations,
          economicImpact: this.calculateEconomicImpact(rel.primary, rel.outcome, regression)
        });;
      } catch (error) {
        // Skip if insufficient data
      }
    }
    
    return results;
  }
  
  /**
   * Generate insights from correlation and regression
   */
  private generateInsights(
    var1: string,
    var2: string,
    correlation: CorrelationResult,
    regression: RegressionResult
  ): string[] {
    const insights: string[] = [];
    
    // Correlation strength insight
    if (correlation.strength === 'very_strong') {
      insights.push(`${var1} has a very strong ${correlation.direction} relationship with ${var2}`);
    } else if (correlation.strength === 'strong') {
      insights.push(`Strong ${correlation.direction} correlation detected between ${var1} and ${var2}`);
    }
    
    // Statistical significance
    if (correlation.pValue < 0.001) {
      insights.push('This relationship is highly statistically significant (p < 0.001)');
    } else if (correlation.pValue < 0.01) {
      insights.push('Statistically significant relationship (p < 0.01)');
    }
    
    // Predictive power
    if (regression.rSquared > 0.7) {
      insights.push(`${var1} explains ${(regression.rSquared * 100).toFixed(1)}% of the variation in ${var2}`);
    }
    
    // Specific cultivation insights
    if (var1 === 'dli' && var2 === 'yield') {
      const optimalDLI = this.findOptimalValue(var1, var2);
      if (optimalDLI) {
        insights.push(`Optimal DLI appears to be around ${optimalDLI.toFixed(1)} mol/m²/day`);
      }
    }
    
    return insights;
  }
  
  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    var1: string,
    var2: string,
    correlation: CorrelationResult,
    regression: RegressionResult
  ): string[] {
    const recommendations: string[] = [];
    
    // Strong positive correlations
    if (correlation.strength === 'strong' && correlation.direction === 'positive') {
      if (var2 === 'yield') {
        recommendations.push(`Increase ${var1} to improve yield`);
      } else if (var2 === 'quality') {
        recommendations.push(`Optimize ${var1} levels for quality improvement`);
      }
    }
    
    // Energy efficiency recommendations
    if (var1 === 'ppfd' && var2 === 'energy_usage') {
      if (correlation.coefficient < -0.3) {
        recommendations.push('Higher light intensity is improving energy efficiency per gram');
      }
    }
    
    // VPD recommendations
    if (var1 === 'vpd') {
      const optimal = this.findOptimalValue(var1, var2);
      if (optimal) {
        recommendations.push(`Maintain VPD around ${optimal.toFixed(2)} kPa for best results`);
      }
    }
    
    return recommendations;
  }
  
  /**
   * Calculate economic impact of optimization
   */
  private calculateEconomicImpact(
    var1: string,
    var2: string,
    regression: RegressionResult
  ): CultivationCorrelation['economicImpact'] {
    // Simplified calculation - would be more complex in production
    let potentialSavings = 0;
    let yieldIncrease = 0;
    let qualityImprovement = 0;
    
    if (var2 === 'yield' && regression.coefficients.slope) {
      // Calculate potential yield increase
      const currentMean = this.mean(this.extractVariable(var1));
      const optimalValue = this.findOptimalValue(var1, var2) || currentMean * 1.1;
      yieldIncrease = (optimalValue - currentMean) * regression.coefficients.slope;
    }
    
    if (var2 === 'energy_usage') {
      // Calculate potential energy savings
      potentialSavings = Math.abs(regression.coefficients.slope || 0) * 1000; // $/year
    }
    
    if (var2 === 'thc' || var2 === 'terpenes') {
      qualityImprovement = regression.rSquared * 10; // % improvement potential
    }
    
    return {
      potentialSavings,
      yieldIncrease,
      qualityImprovement
    };
  }
  
  /**
   * Helper functions
   */
  private extractVariable(varName: string): number[] {
    return this.data
      .filter(d => varName in d.variables && !isNaN(d.variables[varName]))
      .map(d => d.variables[varName]);
  }
  
  private mean(data: number[]): number {
    return data.reduce((a, b) => a + b, 0) / data.length;
  }
  
  private standardDeviation(data: number[]): number {
    const avg = this.mean(data);
    const squareDiffs = data.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(this.mean(squareDiffs));
  }
  
  private calculatePValue(tStatistic: number, df: number): number {
    // Simplified p-value calculation
    // In production, would use a proper t-distribution
    const absT = Math.abs(tStatistic);
    if (absT > 3.5) return 0.001;
    if (absT > 2.8) return 0.01;
    if (absT > 2.0) return 0.05;
    if (absT > 1.6) return 0.1;
    return 0.5;
  }
  
  private calculateFPValue(fStatistic: number, df1: number, df2: number): number {
    // Simplified F-distribution p-value
    if (fStatistic > 4.0) return 0.001;
    if (fStatistic > 3.0) return 0.01;
    if (fStatistic > 2.5) return 0.05;
    return 0.1;
  }
  
  private findOptimalValue(var1: string, var2: string): number | null {
    // Find the value of var1 that maximizes var2
    const x = this.extractVariable(var1);
    const y = this.extractVariable(var2);
    
    let maxY = -Infinity;
    let optimalX = null;
    
    for (let i = 0; i < x.length; i++) {
      if (y[i] > maxY) {
        maxY = y[i];
        optimalX = x[i];
      }
    }
    
    return optimalX;
  }
}