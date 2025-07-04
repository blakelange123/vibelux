/**
 * Energy Billing Service
 * Handles billing for verified energy savings using IPMVP standards
 */

import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

interface BillingPeriod {
  facilityId: string;
  startDate: Date;
  endDate: Date;
}

interface EnergyBaseline {
  facilityId: string;
  avgDailyKwh: number;
  avgDailyCost: number;
  weatherAdjustment: number;
  productionAdjustment: number;
  confidenceLevel: number;
}

interface SavingsCalculation {
  actualKwh: number;
  baselineKwh: number;
  kwhSaved: number;
  dollarsSaved: number;
  percentSaved: number;
  revenueShare: number;
  confidenceScore: number;
  ipmvpCompliant: boolean;
}

export class EnergyBillingService {
  private static instance: EnergyBillingService;
  
  // IPMVP settings
  private readonly MIN_CONFIDENCE_LEVEL = 90; // Minimum statistical confidence
  private readonly MIN_SAVINGS_THRESHOLD = 5; // Minimum 5% savings to bill
  private readonly REVENUE_SHARE_RATE = 0.20; // 20% of verified savings
  
  private constructor() {}
  
  static getInstance(): EnergyBillingService {
    if (!EnergyBillingService.instance) {
      EnergyBillingService.instance = new EnergyBillingService();
    }
    return EnergyBillingService.instance;
  }
  
  /**
   * Process monthly billing for all active facilities
   */
  async processMonthlyBilling(): Promise<void> {
    
    const facilities = await prisma.energy_optimization_config.findMany({
      where: { optimization_active: true }
    });
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    for (const facility of facilities) {
      try {
        await this.processFacilityBilling({
          facilityId: facility.facility_id,
          startDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
          endDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
        });
      } catch (error) {
        console.error(`Failed to process billing for ${facility.facility_name}:`, error);
      }
    }
  }
  
  /**
   * Process billing for a specific facility and period
   */
  async processFacilityBilling(period: BillingPeriod): Promise<void> {
    
    // 1. Get or establish baseline
    const baseline = await this.getOrCreateBaseline(period.facilityId, period.startDate);
    
    // 2. Calculate actual usage for the period
    const actualUsage = await this.calculateActualUsage(period);
    
    // 3. Calculate savings using IPMVP Option C
    const savings = await this.calculateSavings(baseline, actualUsage, period);
    
    // 4. Verify savings meet billing criteria
    if (!this.shouldBill(savings)) {
      return;
    }
    
    // 5. Create verified savings record
    const verifiedSavings = await this.createVerifiedSavingsRecord(period, baseline, savings);
    
    // 6. Generate and send invoice
    await this.generateInvoice(verifiedSavings);
    
  }
  
  /**
   * Get existing baseline or create new one using IPMVP standards
   */
  private async getOrCreateBaseline(facilityId: string, periodEnd: Date): Promise<EnergyBaseline> {
    // Check for existing approved baseline
    const existingBaseline = await prisma.energy_baselines.findFirst({
      where: {
        facility_id: facilityId,
        approved: true,
        end_date: { gte: periodEnd }
      },
      orderBy: { created_at: 'desc' }
    });
    
    if (existingBaseline) {
      return {
        facilityId,
        avgDailyKwh: existingBaseline.avg_daily_kwh,
        avgDailyCost: existingBaseline.avg_daily_cost,
        weatherAdjustment: 1.0, // Would calculate from weather data
        productionAdjustment: 1.0, // Would calculate from production data
        confidenceLevel: existingBaseline.data_quality_score || 95
      };
    }
    
    // Create new baseline using historical data
    return await this.establishBaseline(facilityId, periodEnd);
  }
  
  /**
   * Establish baseline using IPMVP Option C methodology
   */
  private async establishBaseline(facilityId: string, periodEnd: Date): Promise<EnergyBaseline> {
    // Get 12 months of historical data before optimization started
    const oneYearBefore = new Date(periodEnd);
    oneYearBefore.setFullYear(oneYearBefore.getFullYear() - 1);
    
    const baselineData = await prisma.power_readings.findMany({
      where: {
        facility_id: facilityId,
        timestamp: {
          gte: oneYearBefore,
          lte: periodEnd
        }
      },
      orderBy: { timestamp: 'asc' }
    });
    
    if (baselineData.length < 365) {
      throw new Error('Insufficient historical data for baseline establishment');
    }
    
    // Calculate daily totals
    const dailyTotals = this.groupByDay(baselineData);
    
    // Remove outliers (beyond 2 standard deviations)
    const cleanedData = this.removeOutliers(dailyTotals);
    
    // Calculate baseline metrics
    const avgDailyKwh = cleanedData.reduce((sum, day) => sum + day.kwh, 0) / cleanedData.length;
    const avgDailyCost = cleanedData.reduce((sum, day) => sum + day.cost, 0) / cleanedData.length;
    
    // Calculate statistical confidence
    const variance = cleanedData.reduce((sum, day) => sum + Math.pow(day.kwh - avgDailyKwh, 2), 0) / cleanedData.length;
    const standardError = Math.sqrt(variance / cleanedData.length);
    const confidenceLevel = this.calculateConfidenceLevel(avgDailyKwh, standardError);
    
    // Store baseline in database
    await prisma.energy_baselines.create({
      data: {
        facility_id: facilityId,
        baseline_name: `IPMVP Baseline ${new Date().toISOString().slice(0, 7)}`,
        start_date: oneYearBefore,
        end_date: periodEnd,
        avg_daily_kwh: avgDailyKwh,
        avg_daily_cost: avgDailyCost,
        data_quality_score: confidenceLevel,
        approved: confidenceLevel >= this.MIN_CONFIDENCE_LEVEL
      }
    });
    
    return {
      facilityId,
      avgDailyKwh,
      avgDailyCost,
      weatherAdjustment: 1.0,
      productionAdjustment: 1.0,
      confidenceLevel
    };
  }
  
  /**
   * Calculate actual usage for billing period
   */
  private async calculateActualUsage(period: BillingPeriod) {
    const readings = await prisma.power_readings.findMany({
      where: {
        facility_id: period.facilityId,
        timestamp: {
          gte: period.startDate,
          lte: period.endDate
        }
      }
    });
    
    const dailyTotals = this.groupByDay(readings);
    
    return {
      totalKwh: dailyTotals.reduce((sum, day) => sum + day.kwh, 0),
      totalCost: dailyTotals.reduce((sum, day) => sum + day.cost, 0),
      avgDailyKwh: dailyTotals.reduce((sum, day) => sum + day.kwh, 0) / dailyTotals.length,
      avgDailyCost: dailyTotals.reduce((sum, day) => sum + day.cost, 0) / dailyTotals.length,
      dataPoints: readings.length,
      daysInPeriod: dailyTotals.length
    };
  }
  
  /**
   * Calculate savings using IPMVP Option C with adjustments
   */
  private async calculateSavings(
    baseline: EnergyBaseline,
    actualUsage: any,
    period: BillingPeriod
  ): Promise<SavingsCalculation> {
    // Apply baseline adjustments for external factors
    const adjustedBaselineKwh = baseline.avgDailyKwh * 
      baseline.weatherAdjustment * 
      baseline.productionAdjustment * 
      actualUsage.daysInPeriod;
    
    const adjustedBaselineCost = baseline.avgDailyCost * 
      baseline.weatherAdjustment * 
      baseline.productionAdjustment * 
      actualUsage.daysInPeriod;
    
    // Calculate savings
    const kwhSaved = Math.max(0, adjustedBaselineKwh - actualUsage.totalKwh);
    const dollarsSaved = Math.max(0, adjustedBaselineCost - actualUsage.totalCost);
    const percentSaved = (kwhSaved / adjustedBaselineKwh) * 100;
    
    // Calculate revenue share
    const revenueShare = dollarsSaved * this.REVENUE_SHARE_RATE;
    
    // Calculate confidence score based on data quality
    const confidenceScore = this.calculateSavingsConfidence(
      baseline,
      actualUsage,
      kwhSaved,
      adjustedBaselineKwh
    );
    
    return {
      actualKwh: actualUsage.totalKwh,
      baselineKwh: adjustedBaselineKwh,
      kwhSaved,
      dollarsSaved,
      percentSaved,
      revenueShare,
      confidenceScore,
      ipmvpCompliant: confidenceScore >= this.MIN_CONFIDENCE_LEVEL
    };
  }
  
  /**
   * Determine if facility should be billed based on savings criteria
   */
  private shouldBill(savings: SavingsCalculation): boolean {
    return (
      savings.ipmvpCompliant &&
      savings.percentSaved >= this.MIN_SAVINGS_THRESHOLD &&
      savings.dollarsSaved > 0 &&
      savings.revenueShare >= 10 // Minimum $10 billing threshold
    );
  }
  
  /**
   * Create verified savings record for billing
   */
  private async createVerifiedSavingsRecord(
    period: BillingPeriod,
    baseline: EnergyBaseline,
    savings: SavingsCalculation
  ) {
    return await prisma.verified_savings.create({
      data: {
        facility_id: period.facilityId,
        billing_period_start: period.startDate,
        billing_period_end: period.endDate,
        baseline_kwh: savings.baselineKwh,
        baseline_cost: savings.baselineKwh * (baseline.avgDailyCost / baseline.avgDailyKwh),
        actual_kwh: savings.actualKwh,
        actual_cost: savings.actualKwh * (baseline.avgDailyCost / baseline.avgDailyKwh),
        kwh_saved: savings.kwhSaved,
        dollars_saved: savings.dollarsSaved,
        percent_saved: savings.percentSaved,
        revenue_share_amount: savings.revenueShare,
        verification_method: 'IPMVP Option C',
        confidence_score: savings.confidenceScore,
        verified_by: 'VibeLux Energy Service',
        verified_at: new Date()
      }
    });
  }
  
  /**
   * Generate and send invoice via Stripe
   */
  private async generateInvoice(verifiedSavings: any): Promise<void> {
    try {
      // Get facility configuration
      const facility = await prisma.energy_optimization_config.findFirst({
        where: { facility_id: verifiedSavings.facility_id }
      });
      
      if (!facility) {
        throw new Error('Facility not found');
      }
      
      // Create customer in Stripe if not exists
      let stripeCustomerId = facility.stripe_customer_id;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          name: facility.facility_name,
          email: facility.emergency_contact_email || '',
          metadata: {
            facilityId: facility.facility_id,
            vibeluxCustomer: 'energy-optimization'
          }
        });
        
        stripeCustomerId = customer.id;
        
        // Update facility with Stripe customer ID
        await prisma.energy_optimization_config.update({
          where: { id: facility.id },
          data: { stripe_customer_id: stripeCustomerId }
        });
      }
      
      // Create invoice in Stripe
      const invoice = await stripe.invoices.create({
        customer: stripeCustomerId,
        currency: 'usd',
        description: `Energy Optimization - Verified Savings`,
        metadata: {
          facilityId: verifiedSavings.facility_id,
          billingPeriod: `${verifiedSavings.billing_period_start.toISOString().slice(0, 7)}`,
          savingsPercent: verifiedSavings.percent_saved.toString(),
          verificationMethod: 'IPMVP Option C'
        },
        auto_advance: true, // Automatically finalize
        collection_method: 'send_invoice',
        days_until_due: 30
      });
      
      // Add line item for energy savings
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id,
        amount: Math.round(verifiedSavings.revenue_share_amount * 100), // Convert to cents
        currency: 'usd',
        description: `Energy Optimization (${verifiedSavings.percent_saved.toFixed(1)}% savings)`,
        metadata: {
          kwhSaved: verifiedSavings.kwh_saved.toString(),
          dollarsSaved: verifiedSavings.dollars_saved.toString(),
          confidenceScore: verifiedSavings.confidence_score.toString()
        }
      });
      
      // Finalize and send invoice
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
      await stripe.invoices.sendInvoice(invoice.id);
      
      // Update verified savings record
      await prisma.verified_savings.update({
        where: { id: verifiedSavings.id },
        data: {
          invoice_number: finalizedInvoice.number,
          invoice_sent_at: new Date(),
          payment_status: 'pending'
        }
      });
      
      
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      throw error;
    }
  }
  
  /**
   * Handle Stripe webhook for payment updates
   */
  async handlePaymentWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;
      default:
    }
  }
  
  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(invoice: any): Promise<void> {
    const facilityId = invoice.metadata?.facilityId;
    const billingPeriod = invoice.metadata?.billingPeriod;
    
    if (facilityId && billingPeriod) {
      await prisma.verified_savings.updateMany({
        where: {
          facility_id: facilityId,
          invoice_number: invoice.number
        },
        data: {
          payment_status: 'paid',
          payment_received_at: new Date()
        }
      });
      
    }
  }
  
  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(invoice: any): Promise<void> {
    const facilityId = invoice.metadata?.facilityId;
    
    if (facilityId) {
      await prisma.verified_savings.updateMany({
        where: {
          facility_id: facilityId,
          invoice_number: invoice.number
        },
        data: {
          payment_status: 'failed'
        }
      });
      
      // Could trigger follow-up actions here
    }
  }
  
  // Helper methods
  
  private groupByDay(readings: any[]): Array<{date: string, kwh: number, cost: number}> {
    const dailyMap = new Map();
    
    readings.forEach(reading => {
      const date = reading.timestamp.toISOString().slice(0, 10);
      const existing = dailyMap.get(date) || { kwh: 0, cost: 0 };
      
      dailyMap.set(date, {
        kwh: existing.kwh + (reading.energy_kwh || 0),
        cost: existing.cost + ((reading.energy_kwh || 0) * (reading.rate_per_kwh || 0.12))
      });
    });
    
    return Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      ...data
    }));
  }
  
  private removeOutliers(data: any[]): any[] {
    const values = data.map(d => d.kwh);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return data.filter(d => Math.abs(d.kwh - mean) <= 2 * stdDev);
  }
  
  private calculateConfidenceLevel(mean: number, standardError: number): number {
    // Simplified confidence calculation
    const coefficientOfVariation = standardError / mean;
    
    if (coefficientOfVariation < 0.05) return 99;
    if (coefficientOfVariation < 0.10) return 95;
    if (coefficientOfVariation < 0.15) return 90;
    if (coefficientOfVariation < 0.20) return 85;
    return 80;
  }
  
  private calculateSavingsConfidence(
    baseline: EnergyBaseline,
    actualUsage: any,
    kwhSaved: number,
    baselineKwh: number
  ): number {
    let confidence = baseline.confidenceLevel;
    
    // Reduce confidence for insufficient data
    if (actualUsage.dataPoints < 100) {
      confidence *= 0.9;
    }
    
    // Reduce confidence for small savings
    const savingsRatio = kwhSaved / baselineKwh;
    if (savingsRatio < 0.05) {
      confidence *= 0.8;
    }
    
    return Math.max(50, confidence);
  }
}

// Export singleton
export const energyBillingService = EnergyBillingService.getInstance();