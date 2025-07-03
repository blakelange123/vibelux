/**
 * Investment calculations for performance tracking and billing
 * Handles baseline comparisons, revenue sharing, and payment calculations
 */
import { 
  Investment, 
  Facility, 
  PerformanceRecord, 
  YieldBaseline,
  InvestmentType
} from '@/types/investment';

export class BaselineCalculationEngine {
  private confidenceLevel = 0.95; // 95% confidence interval
  private minimumDataPoints = 3; // Minimum cycles for baseline
  private outlierThreshold = 2.5; // Standard deviations for outlier detection

  /**
   * Calculate baseline metrics from historical performance data
   */
  calculateBaseline(
    historicalData: PerformanceRecord[], 
    startDate?: Date,
    endDate?: Date
  ): YieldBaseline {
    if (!historicalData || historicalData.length === 0) {
      throw new Error('No historical data provided');
    }

    // Filter by date range if provided
    let filteredData = historicalData;
    if (startDate || endDate) {
      filteredData = historicalData.filter(record => {
        const recordDate = new Date(record.recordDate);
        if (startDate && recordDate < startDate) return false;
        if (endDate && recordDate > endDate) return false;
        return true;
      });
    }

    if (filteredData.length < this.minimumDataPoints) {
      throw new Error(`Insufficient data points. Need at least ${this.minimumDataPoints}`);
    }

    // Extract yield data
    const yields = filteredData.map(record => record.actualYieldPerSqft);
    const cleanYields = this.removeOutliers(yields);

    // Calculate baseline statistics
    const avgYield = this.calculateMean(cleanYields);
    const stdDev = this.calculateStdDev(cleanYields);
    const confidenceInterval = this.calculateConfidenceInterval(cleanYields);

    // Calculate quality metrics
    const qualityScores = filteredData.map(record => record.qualityScore).filter(score => score != null);
    const avgQualityScore = qualityScores.length > 0 ? this.calculateMean(qualityScores) : 0;

    // Calculate environmental baselines
    const environmentalData = {
      avgTemperature: this.calculateMean(filteredData.map(r => r.avgTemperature)),
      avgHumidity: this.calculateMean(filteredData.map(r => r.avgHumidity)),
      avgCo2Ppm: this.calculateMean(filteredData.map(r => r.avgCo2Ppm)),
      avgPpfd: this.calculateMean(filteredData.map(r => r.avgPpfd)),
      avgDli: this.calculateMean(filteredData.map(r => r.avgDli))
    };

    // Calculate efficiency metrics
    const efficiencyData = {
      avgKwhPerGram: this.calculateMean(filteredData.map(r => r.kwhPerGram)),
      avgWaterGalPerGram: this.calculateMean(filteredData.map(r => r.waterGalConsumed / (r.actualYieldPerSqft * 1000))) // Convert to grams
    };

    const baseline: YieldBaseline = {
      id: `baseline-${Date.now()}`,
      facilityId: filteredData[0].facilityId,
      baselineStartDate: new Date(Math.min(...filteredData.map(r => new Date(r.recordDate).getTime()))),
      baselineEndDate: new Date(Math.max(...filteredData.map(r => new Date(r.recordDate).getTime()))),
      avgYieldPerSqft: avgYield,
      avgYieldPerCycle: avgYield, // Simplified - would need cycle data
      cyclesPerYear: 6, // Default estimate
      avgQualityScore,
      ...environmentalData,
      ...efficiencyData,
      dataPoints: cleanYields.length,
      confidenceInterval: confidenceInterval.upper - confidenceInterval.lower,
      createdAt: new Date()
    };

    return baseline;
  }

  private removeOutliers(data: number[]): number[] {
    if (data.length < 3) return data;

    const mean = this.calculateMean(data);
    const stdDev = this.calculateStdDev(data);

    if (stdDev === 0) return data;

    return data.filter(value => {
      const zScore = Math.abs((value - mean) / stdDev);
      return zScore <= this.outlierThreshold;
    });
  }

  private calculateMean(data: number[]): number {
    return data.reduce((sum, value) => sum + value, 0) / data.length;
  }

  private calculateStdDev(data: number[]): number {
    const mean = this.calculateMean(data);
    const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
    return Math.sqrt(this.calculateMean(squaredDiffs));
  }

  private calculateConfidenceInterval(data: number[]): { lower: number; upper: number } {
    const mean = this.calculateMean(data);
    const stdDev = this.calculateStdDev(data);
    const n = data.length;
    const standardError = stdDev / Math.sqrt(n);
    
    // Using t-distribution for small samples, approximating with 1.96 for 95% confidence
    const criticalValue = n < 30 ? 2.0 : 1.96;
    const marginOfError = criticalValue * standardError;

    return {
      lower: mean - marginOfError,
      upper: mean + marginOfError
    };
  }
}

export class PerformanceTracker {
  private baselineEngine: BaselineCalculationEngine;

  constructor() {
    this.baselineEngine = new BaselineCalculationEngine();
  }

  /**
   * Calculate performance metrics against baseline
   */
  calculatePerformanceMetrics(
    currentPerformance: Partial<PerformanceRecord>,
    baseline: YieldBaseline,
    investment: Investment,
    facility: Facility
  ): PerformanceMetrics {
    const currentYield = currentPerformance.actualYieldPerSqft || 0;
    const baselineYield = baseline.avgYieldPerSqft;

    // Calculate improvements
    const yieldImprovement = baselineYield > 0 ? (currentYield - baselineYield) / baselineYield : 0;
    const yieldImprovementPercentage = yieldImprovement * 100;

    // Check if meets minimum threshold
    const meetsMinimumThreshold = yieldImprovement >= (investment.minimumPerformanceThreshold / 100);

    // Calculate quality improvements
    let qualityImprovement = 0;
    if (currentPerformance.qualityScore && baseline.avgQualityScore) {
      qualityImprovement = (currentPerformance.qualityScore - baseline.avgQualityScore) / baseline.avgQualityScore;
    }

    // Calculate energy efficiency
    let energyReduction = 0;
    let energyCostSavings = 0;
    if (currentPerformance.kwhPerGram && baseline.avgKwhPerGram) {
      energyReduction = (baseline.avgKwhPerGram - currentPerformance.kwhPerGram) / baseline.avgKwhPerGram;
      const energySavedKwh = (baseline.avgKwhPerGram - currentPerformance.kwhPerGram) * currentYield * facility.activeGrowSqft;
      energyCostSavings = energySavedKwh * 0.12; // $0.12/kWh average
    }

    // Calculate revenue impact
    const revenueMetrics = this.calculateRevenueImpact(
      currentYield,
      baselineYield,
      investment,
      facility
    );

    return {
      yieldImprovementPercentage,
      yieldImprovementAbsolute: currentYield - baselineYield,
      meetsMinimumThreshold,
      qualityImprovementPercentage: qualityImprovement * 100,
      energyReductionPercentage: energyReduction * 100,
      energyCostSavings,
      ...revenueMetrics
    };
  }

  private calculateRevenueImpact(
    currentYield: number,
    baselineYield: number,
    investment: Investment,
    facility: Facility
  ): RevenueMetrics {
    const yieldIncrease = currentYield - baselineYield;
    const annualYieldIncrease = yieldIncrease * facility.activeGrowSqft * facility.currentCyclesPerYear;
    const annualRevenueIncrease = annualYieldIncrease * facility.pricePerGram;
    const monthlyRevenueIncrease = annualRevenueIncrease / 12;

    let monthlyPayment = 0;
    let growerBenefit = 0;

    switch (investment.investmentType) {
      case InvestmentType.YEP:
        // Yield Enhancement Program - revenue sharing
        const investorShare = investment.yieldSharePercentage / 100;
        monthlyPayment = monthlyRevenueIncrease * investorShare;
        growerBenefit = monthlyRevenueIncrease * (1 - investorShare);
        break;

      case InvestmentType.GAAS:
        // Growing as a Service - fixed monthly fee
        monthlyPayment = investment.monthlyServiceFee;
        growerBenefit = monthlyRevenueIncrease - monthlyPayment;
        break;

      case InvestmentType.HYBRID:
        // Combination of fixed fee and revenue sharing
        const fixedFee = investment.monthlyServiceFee;
        const revenueShare = (investment.yieldSharePercentage / 100) * monthlyRevenueIncrease;
        monthlyPayment = fixedFee + revenueShare;
        growerBenefit = monthlyRevenueIncrease - monthlyPayment;
        break;
    }

    return {
      annualRevenueIncrease,
      monthlyRevenueIncrease,
      monthlyPayment,
      growerBenefitMonthly: growerBenefit,
      investorROI: investment.totalInvestmentAmount > 0 
        ? (monthlyPayment * 12) / investment.totalInvestmentAmount 
        : Infinity
    };
  }
}

export class BillingCalculator {
  /**
   * Calculate payment amount for a given period
   */
  calculatePayment(
    investment: Investment,
    performanceRecord: PerformanceRecord,
    periodDays: number = 30
  ): PaymentCalculation {
    const periodMultiplier = periodDays / 30; // Adjust for non-monthly periods

    let baseAmount = 0;
    let performanceBonus = 0;
    let totalAmount = 0;
    let paymentType: 'service_fee' | 'yield_share' | 'hybrid' = 'service_fee';

    switch (investment.investmentType) {
      case InvestmentType.GAAS:
        // Fixed monthly service fee
        baseAmount = investment.monthlyServiceFee * periodMultiplier;
        totalAmount = baseAmount;
        paymentType = 'service_fee';
        break;

      case InvestmentType.YEP:
        // Pure performance-based payment
        baseAmount = performanceRecord.yepPaymentDue * periodMultiplier;
        totalAmount = baseAmount;
        paymentType = 'yield_share';
        break;

      case InvestmentType.HYBRID:
        // Fixed fee + performance bonus
        baseAmount = investment.monthlyServiceFee * periodMultiplier;
        performanceBonus = performanceRecord.yepPaymentDue * periodMultiplier;
        totalAmount = baseAmount + performanceBonus;
        paymentType = 'hybrid';
        break;
    }

    // Apply any adjustments for underperformance
    if (performanceRecord.yieldImprovementPercentage < investment.minimumPerformanceThreshold) {
      // Apply penalty or adjustment based on contract terms
      const performanceRatio = performanceRecord.yieldImprovementPercentage / investment.minimumPerformanceThreshold;
      totalAmount *= Math.max(0.5, performanceRatio); // Minimum 50% payment
    }

    return {
      baseAmount,
      performanceBonus,
      totalAmount,
      paymentType,
      periodStart: new Date(performanceRecord.recordDate),
      periodEnd: new Date(new Date(performanceRecord.recordDate).getTime() + periodDays * 24 * 60 * 60 * 1000),
      performanceMetrics: {
        yieldImprovement: performanceRecord.yieldImprovementPercentage,
        actualYield: performanceRecord.actualYieldPerSqft,
        baselineYield: performanceRecord.baselineYieldPerSqft
      }
    };
  }

  /**
   * Generate payment schedule for an investment
   */
  generatePaymentSchedule(
    investment: Investment,
    startDate: Date = new Date()
  ): PaymentScheduleItem[] {
    const schedule: PaymentScheduleItem[] = [];
    const monthsRemaining = Math.ceil(
      (investment.contractEndDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
    );

    for (let month = 0; month < monthsRemaining; month++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + month);

      let estimatedAmount = 0;
      switch (investment.investmentType) {
        case InvestmentType.GAAS:
          estimatedAmount = investment.monthlyServiceFee;
          break;
        case InvestmentType.YEP:
          // Estimate based on target improvement
          estimatedAmount = this.estimateYEPPayment(investment);
          break;
        case InvestmentType.HYBRID:
          estimatedAmount = investment.monthlyServiceFee + this.estimateYEPPayment(investment);
          break;
      }

      schedule.push({
        paymentNumber: month + 1,
        dueDate: paymentDate,
        estimatedAmount,
        status: paymentDate < new Date() ? 'paid' : 'scheduled'
      });
    }

    return schedule;
  }

  private estimateYEPPayment(investment: Investment): number {
    // Rough estimate based on target improvements
    const targetImprovement = investment.targetYieldImprovement / 100;
    const baselineYield = investment.baselineYield;
    const yieldIncrease = baselineYield * targetImprovement;
    
    // Assume some standard facility size and price for estimation
    const estimatedSqft = 10000;
    const estimatedPricePerGram = 2;
    const cyclesPerMonth = 0.5; // ~6 cycles per year

    const monthlyYieldIncrease = yieldIncrease * estimatedSqft * cyclesPerMonth;
    const monthlyRevenueIncrease = monthlyYieldIncrease * estimatedPricePerGram;
    
    return monthlyRevenueIncrease * (investment.yieldSharePercentage / 100);
  }
}

// Type definitions for calculation results
interface PerformanceMetrics {
  yieldImprovementPercentage: number;
  yieldImprovementAbsolute: number;
  meetsMinimumThreshold: boolean;
  qualityImprovementPercentage: number;
  energyReductionPercentage: number;
  energyCostSavings: number;
  annualRevenueIncrease: number;
  monthlyRevenueIncrease: number;
  monthlyPayment: number;
  growerBenefitMonthly: number;
  investorROI: number;
}

interface RevenueMetrics {
  annualRevenueIncrease: number;
  monthlyRevenueIncrease: number;
  monthlyPayment: number;
  growerBenefitMonthly: number;
  investorROI: number;
}

interface PaymentCalculation {
  baseAmount: number;
  performanceBonus: number;
  totalAmount: number;
  paymentType: 'service_fee' | 'yield_share' | 'hybrid';
  periodStart: Date;
  periodEnd: Date;
  performanceMetrics: {
    yieldImprovement: number;
    actualYield: number;
    baselineYield: number;
  };
}

interface PaymentScheduleItem {
  paymentNumber: number;
  dueDate: Date;
  estimatedAmount: number;
  status: 'paid' | 'scheduled' | 'overdue';
}

// Export calculation utilities
export const InvestmentCalculations = {
  baseline: new BaselineCalculationEngine(),
  performance: new PerformanceTracker(),
  billing: new BillingCalculator()
};