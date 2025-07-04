// Revenue Sharing Service
// Core service for managing revenue sharing calculations and operations

export interface Baseline {
  id: string;
  facilityId: string;
  metricType: 'energy' | 'yield' | 'cost' | 'quality';
  baselineValue: number;
  measurementUnit: string;
  effectiveDate: Date;
  verificationStatus: 'pending' | 'verified' | 'disputed';
  metadata?: Record<string, any>;
}

export interface PerformanceMetric {
  id: string;
  facilityId: string;
  metricType: 'energy' | 'yield' | 'cost' | 'quality';
  actualValue: number;
  baselineValue: number;
  savingsAmount: number;
  measurementDate: Date;
  dataSource: string;
  confidence: number;
  // Enhanced for dual unit cost tracking
  weightInGrams?: number;
  costPerGram?: number;
  costPerPound?: number;
  productType?: 'cannabis' | 'lettuce' | 'tomatoes' | 'herbs' | 'other';
}

export interface RevenueShareCalculation {
  billingPeriod: string;
  facilityId: string;
  metrics: {
    type: string;
    baseline: number;
    actual: number;
    savings: number;
    sharePercentage: number;
    shareAmount: number;
  }[];
  totalSavings: number;
  totalRevenueShare: number;
  status: 'draft' | 'pending' | 'approved' | 'disputed';
}

export class RevenueShareService {
  // Unit conversion constants
  static readonly GRAMS_PER_POUND = 453.592;
  static readonly POUNDS_PER_GRAM = 1 / 453.592;

  // Convert grams to pounds
  static convertGramsToPounds(grams: number): number {
    return grams * this.POUNDS_PER_GRAM;
  }

  // Convert pounds to grams
  static convertPoundsToGrams(pounds: number): number {
    return pounds * this.GRAMS_PER_POUND;
  }

  // Calculate cost per gram
  static calculateCostPerGram(totalCost: number, weightInGrams: number): number {
    if (weightInGrams <= 0) return 0;
    return totalCost / weightInGrams;
  }

  // Calculate cost per pound
  static calculateCostPerPound(totalCost: number, weightInPounds: number): number {
    if (weightInPounds <= 0) return 0;
    return totalCost / weightInPounds;
  }

  // Calculate both cost per gram and pound from total cost and weight in grams
  static calculateDualUnitCosts(totalCost: number, weightInGrams: number): {
    costPerGram: number;
    costPerPound: number;
    weightInPounds: number;
  } {
    const weightInPounds = this.convertGramsToPounds(weightInGrams);
    return {
      costPerGram: this.calculateCostPerGram(totalCost, weightInGrams),
      costPerPound: this.calculateCostPerPound(totalCost, weightInPounds),
      weightInPounds
    };
  }

  // Get preferred unit for different product types
  static getPreferredUnit(productType: string): 'gram' | 'pound' {
    switch (productType) {
      case 'cannabis':
        return 'gram'; // Cannabis typically priced per gram
      case 'lettuce':
      case 'tomatoes':
      case 'herbs':
        return 'pound'; // Produce typically priced per pound
      default:
        return 'gram';
    }
  }

  // Format cost for display based on product type
  static formatCostDisplay(costPerGram: number, costPerPound: number, productType: string): {
    primary: { value: number; unit: string; formatted: string };
    secondary: { value: number; unit: string; formatted: string };
  } {
    const preferredUnit = this.getPreferredUnit(productType);
    
    if (preferredUnit === 'gram') {
      return {
        primary: {
          value: costPerGram,
          unit: 'gram',
          formatted: `$${costPerGram.toFixed(2)}/g`
        },
        secondary: {
          value: costPerPound,
          unit: 'pound',
          formatted: `$${costPerPound.toFixed(2)}/lb`
        }
      };
    } else {
      return {
        primary: {
          value: costPerPound,
          unit: 'pound',
          formatted: `$${costPerPound.toFixed(2)}/lb`
        },
        secondary: {
          value: costPerGram,
          unit: 'gram',
          formatted: `$${costPerGram.toFixed(2)}/g`
        }
      };
    }
  }

  // Enhanced cost savings calculation with dual units
  static calculateCostSavingsWithUnits(
    baselineCostPerGram: number,
    actualCostPerGram: number,
    totalWeightInGrams: number,
    productType: string
  ): {
    savingsPerGram: number;
    savingsPerPound: number;
    totalSavings: number;
    percentImprovement: number;
    displayFormat: ReturnType<typeof RevenueShareService.formatCostDisplay>;
  } {
    const savingsPerGram = Math.max(0, baselineCostPerGram - actualCostPerGram);
    const savingsPerPound = this.convertGramsToPounds(savingsPerGram) * this.GRAMS_PER_POUND;
    const totalSavings = savingsPerGram * totalWeightInGrams;
    const percentImprovement = baselineCostPerGram > 0 
      ? (savingsPerGram / baselineCostPerGram) * 100 
      : 0;

    return {
      savingsPerGram,
      savingsPerPound,
      totalSavings,
      percentImprovement,
      displayFormat: this.formatCostDisplay(savingsPerGram, savingsPerPound, productType)
    };
  }

  // Calculate savings for a specific metric
  static calculateSavings(baseline: number, actual: number, metricType: string): number {
    switch (metricType) {
      case 'energy':
      case 'cost':
        // Lower is better - savings when actual < baseline
        return Math.max(0, baseline - actual);
      case 'yield':
      case 'quality':
        // Higher is better - savings when actual > baseline
        return Math.max(0, actual - baseline);
      default:
        return 0;
    }
  }

  // Calculate revenue share based on tiered model
  static calculateRevenueShare(
    savings: number,
    metricType: string,
    tier: 'professional' | 'enterprise' = 'professional'
  ): number {
    const sharePercentages = {
      professional: {
        energy: 0.20,    // 20% of energy savings
        yield: 0.25,     // 25% of yield improvement value
        cost: 0.15,      // 15% of cost savings
        quality: 0.20    // 20% of quality improvement value
      },
      enterprise: {
        energy: 0.15,    // 15% of energy savings (volume discount)
        yield: 0.20,     // 20% of yield improvement value
        cost: 0.12,      // 12% of cost savings
        quality: 0.15    // 15% of quality improvement value
      }
    };

    const percentage = sharePercentages[tier][metricType as keyof typeof sharePercentages.professional] || 0;
    return savings * percentage;
  }

  // Validate baseline data
  static validateBaseline(baseline: Baseline): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (baseline.baselineValue <= 0) {
      errors.push('Baseline value must be positive');
    }

    if (!baseline.measurementUnit) {
      errors.push('Measurement unit is required');
    }

    if (baseline.effectiveDate > new Date()) {
      errors.push('Effective date cannot be in the future');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Enhanced calculation with dual unit support
  static calculateEnhancedMonthlyMetrics(
    metrics: PerformanceMetric[],
    baselines: Baseline[]
  ): {
    costMetrics: {
      totalCostSavings: number;
      avgCostPerGram: number;
      avgCostPerPound: number;
      productBreakdown: Record<string, {
        costPerGram: number;
        costPerPound: number;
        totalWeight: number;
        savings: number;
      }>;
    };
    traditionalMetrics: {
      energy: number;
      yield: number;
      quality: number;
    };
  } {
    const costMetrics = metrics.filter(m => m.metricType === 'cost' && m.costPerGram && m.weightInGrams);
    const productBreakdown: Record<string, any> = {};
    let totalCostSavings = 0;
    let totalWeightGrams = 0;
    let totalCostGrams = 0;

    // Process cost metrics by product type
    costMetrics.forEach(metric => {
      const productType = metric.productType || 'other';
      const baseline = baselines.find(b => b.metricType === 'cost' && b.metadata?.productType === productType);
      
      if (baseline && metric.weightInGrams && metric.costPerGram) {
        const baselineCostPerGram = baseline.baselineValue;
        const savings = this.calculateCostSavingsWithUnits(
          baselineCostPerGram,
          metric.costPerGram,
          metric.weightInGrams,
          productType
        );

        if (!productBreakdown[productType]) {
          productBreakdown[productType] = {
            costPerGram: 0,
            costPerPound: 0,
            totalWeight: 0,
            savings: 0
          };
        }

        productBreakdown[productType].totalWeight += metric.weightInGrams;
        productBreakdown[productType].savings += savings.totalSavings;
        totalCostSavings += savings.totalSavings;
        totalWeightGrams += metric.weightInGrams;
        totalCostGrams += metric.costPerGram * metric.weightInGrams;
      }
    });

    // Calculate weighted averages
    Object.keys(productBreakdown).forEach(productType => {
      const data = productBreakdown[productType];
      const avgCostPerGram = totalCostGrams / totalWeightGrams || 0;
      const dualCosts = this.calculateDualUnitCosts(totalCostGrams, data.totalWeight);
      data.costPerGram = dualCosts.costPerGram;
      data.costPerPound = dualCosts.costPerPound;
    });

    return {
      costMetrics: {
        totalCostSavings,
        avgCostPerGram: totalWeightGrams > 0 ? totalCostGrams / totalWeightGrams : 0,
        avgCostPerPound: totalWeightGrams > 0 ? this.calculateCostPerPound(totalCostGrams, this.convertGramsToPounds(totalWeightGrams)) : 0,
        productBreakdown
      },
      traditionalMetrics: {
        energy: metrics.filter(m => m.metricType === 'energy').reduce((sum, m) => sum + m.actualValue, 0),
        yield: metrics.filter(m => m.metricType === 'yield').reduce((sum, m) => sum + m.actualValue, 0),
        quality: metrics.filter(m => m.metricType === 'quality').reduce((sum, m) => sum + m.actualValue, 0)
      }
    };
  }

  // Calculate monthly revenue share
  static async calculateMonthlyRevenueShare(
    facilityId: string,
    month: Date,
    baselines: Baseline[],
    metrics: PerformanceMetric[]
  ): Promise<RevenueShareCalculation> {
    const calculation: RevenueShareCalculation = {
      billingPeriod: month.toISOString().slice(0, 7), // YYYY-MM format
      facilityId,
      metrics: [],
      totalSavings: 0,
      totalRevenueShare: 0,
      status: 'draft'
    };

    // Group metrics by type
    const metricsByType = metrics.reduce((acc, metric) => {
      if (!acc[metric.metricType]) acc[metric.metricType] = [];
      acc[metric.metricType].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);

    // Calculate for each metric type
    for (const [metricType, typeMetrics] of Object.entries(metricsByType)) {
      const baseline = baselines.find(b => b.metricType === metricType);
      if (!baseline || baseline.verificationStatus !== 'verified') continue;

      // Average the metrics for the month
      const avgActual = typeMetrics.reduce((sum, m) => sum + m.actualValue, 0) / typeMetrics.length;
      const savings = this.calculateSavings(baseline.baselineValue, avgActual, metricType);
      const shareAmount = this.calculateRevenueShare(savings, metricType);

      calculation.metrics.push({
        type: metricType,
        baseline: baseline.baselineValue,
        actual: avgActual,
        savings,
        sharePercentage: this.getSharePercentage(metricType),
        shareAmount
      });

      calculation.totalSavings += savings;
      calculation.totalRevenueShare += shareAmount;
    }

    // Apply minimum billing threshold
    if (calculation.totalRevenueShare < 100) {
      calculation.totalRevenueShare = 0; // No billing under $100
    }

    return calculation;
  }

  // Get share percentage for display
  private static getSharePercentage(metricType: string, tier: string = 'professional'): number {
    const percentages: Record<string, Record<string, number>> = {
      professional: {
        energy: 20,
        yield: 25,
        cost: 15,
        quality: 20
      },
      enterprise: {
        energy: 15,
        yield: 20,
        cost: 12,
        quality: 15
      }
    };

    return percentages[tier][metricType] || 0;
  }

  // Weather normalize energy data
  static weatherNormalizeEnergy(
    actualUsage: number,
    avgTemp: number,
    baselineTemp: number = 70
  ): number {
    // Simple degree-day normalization
    const coolingDegreeDays = Math.max(0, avgTemp - baselineTemp);
    const heatingDegreeDays = Math.max(0, baselineTemp - avgTemp);
    
    // Assume 2% change per degree day
    const adjustmentFactor = 1 + (0.02 * (coolingDegreeDays - heatingDegreeDays));
    
    return actualUsage / adjustmentFactor;
  }

  // Verify data quality
  static verifyDataQuality(metrics: PerformanceMetric[]): {
    quality: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let qualityScore = 100;

    // Check for data gaps
    const dates = metrics.map(m => m.measurementDate.getTime());
    const gaps = this.findDataGaps(dates, 3600000); // 1 hour gaps
    if (gaps.length > 0) {
      issues.push(`Found ${gaps.length} data gaps`);
      qualityScore -= gaps.length * 2;
    }

    // Check for outliers
    const values = metrics.map(m => m.actualValue);
    const outliers = this.findOutliers(values);
    if (outliers.length > 0) {
      issues.push(`Found ${outliers.length} potential outliers`);
      qualityScore -= outliers.length * 5;
    }

    // Check confidence scores
    const lowConfidence = metrics.filter(m => m.confidence < 0.95).length;
    if (lowConfidence > 0) {
      issues.push(`${lowConfidence} readings with low confidence`);
      qualityScore -= lowConfidence * 3;
    }

    return {
      quality: Math.max(0, qualityScore),
      issues
    };
  }

  // Find gaps in time series data
  private static findDataGaps(timestamps: number[], expectedInterval: number): number[] {
    const gaps: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      const gap = timestamps[i] - timestamps[i - 1];
      if (gap > expectedInterval * 1.5) {
        gaps.push(timestamps[i - 1]);
      }
    }
    return gaps;
  }

  // Simple outlier detection using IQR method
  private static findOutliers(values: number[]): number[] {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(v => v < lowerBound || v > upperBound);
  }
}