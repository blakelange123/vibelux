import { PrismaClient } from '@prisma/client';
import { normalizeEnergyConsumption } from './weather-normalization';

const prisma = new PrismaClient();

interface VerificationResult {
  verified: boolean;
  savingsKwh: number;
  savingsAmount: number;
  confidence: number;
  methodology: string;
  details: {
    baselineKwh: number;
    actualKwh: number;
    iotKwh?: number;
    utilityKwh?: number;
    variance: number;
  };
}

export async function verifySavings(
  clientId: string,
  billingPeriodStart: Date,
  billingPeriodEnd: Date
): Promise<VerificationResult | null> {
  try {
    // Get client baseline
    const baseline = await prisma.clientBaseline.findUnique({
      where: { clientId }
    });

    if (!baseline || baseline.status !== 'verified') {
      return null;
    }

    // Get utility bill data for the period
    const utilityBill = await prisma.utilityBillData.findFirst({
      where: {
        clientId,
        billingPeriodStart: {
          gte: billingPeriodStart
        },
        billingPeriodEnd: {
          lte: billingPeriodEnd
        },
        status: 'processed'
      }
    });

    if (!utilityBill || !utilityBill.totalKwh) {
      return null;
    }

    // Get IoT sensor data for the period (from power_readings table)
    const iotData = await getIoTDataForPeriod(clientId, billingPeriodStart, billingPeriodEnd);

    // Get facility type (for weather normalization)
    const facilityType = await getFacilityType(clientId);

    // Apply weather normalization to actual consumption
    const normalizedResult = await normalizeEnergyConsumption(
      clientId,
      { start: billingPeriodStart, end: billingPeriodEnd },
      utilityBill.totalKwh,
      facilityType as 'greenhouse' | 'indoor' | 'vertical'
    );

    // Calculate expected usage based on baseline and seasonal factors
    const season = getSeasonFromDate(billingPeriodStart);
    const seasonalFactor = (baseline.seasonalFactors as any)?.[season] || 1;
    const expectedKwh = baseline.averageMonthlyKwh * seasonalFactor;

    // Calculate weather-normalized savings
    const actualKwh = normalizedResult.normalizedConsumption;
    const savingsKwh = Math.max(0, expectedKwh - actualKwh);
    
    // Get utility rate for calculating dollar savings
    const ratePerKwh = await getUtilityRate(clientId, billingPeriodStart);
    const savingsAmount = savingsKwh * ratePerKwh;

    // Calculate variance between IoT and utility data
    const variance = iotData.totalKwh > 0 
      ? Math.abs((iotData.totalKwh - utilityBill.totalKwh) / utilityBill.totalKwh) 
      : 0;

    // Calculate confidence score (including weather normalization confidence)
    const dataConfidence = calculateVerificationConfidence(
      baseline.dataPoints,
      variance,
      !!iotData.totalKwh
    );
    const weatherConfidence = normalizedResult.confidence;
    const overallConfidence = (dataConfidence * 0.7) + (weatherConfidence * 0.3);

    // Determine if savings are verified
    const verified = overallConfidence >= 70 && variance < 0.1; // Within 10% variance

    return {
      verified,
      savingsKwh,
      savingsAmount,
      confidence: overallConfidence,
      methodology: 'IPMVP Option C - Whole Facility (Weather-Normalized)',
      details: {
        baselineKwh: expectedKwh,
        actualKwh: utilityBill.totalKwh,
        normalizedKwh: actualKwh,
        weatherImpact: normalizedResult.weatherImpact,
        iotKwh: iotData.totalKwh,
        utilityKwh: utilityBill.totalKwh,
        variance,
        weatherDetails: normalizedResult.details
      }
    };

  } catch (error) {
    console.error('Error verifying savings:', error);
    throw error;
  }
}

async function getIoTDataForPeriod(
  clientId: string,
  startDate: Date,
  endDate: Date
): Promise<{ totalKwh: number; readings: number }> {
  // This would query the power_readings table
  // For now, returning mock data
  return {
    totalKwh: 0,
    readings: 0
  };
}

async function getUtilityRate(clientId: string, date: Date): Promise<number> {
  // Query utility_rates table for the client's facility
  // For now, return average commercial rate
  return 0.12; // $0.12 per kWh
}

async function getFacilityType(clientId: string): Promise<string> {
  // In production, query the facility type from database
  // For now, return default
  return 'indoor';
}

function getSeasonFromDate(date: Date): string {
  const month = date.getMonth();
  if (month >= 11 || month <= 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  return 'fall';
}

function calculateVerificationConfidence(
  baselineDataPoints: number,
  variance: number,
  hasIoTData: boolean
): number {
  let confidence = 0;

  // Baseline quality (40 points max)
  if (baselineDataPoints >= 24) confidence += 40;
  else if (baselineDataPoints >= 12) confidence += 30;
  else if (baselineDataPoints >= 6) confidence += 20;
  else confidence += 10;

  // Data variance (30 points max)
  if (variance < 0.05) confidence += 30; // Within 5%
  else if (variance < 0.1) confidence += 20; // Within 10%
  else if (variance < 0.2) confidence += 10; // Within 20%

  // IoT data availability (30 points max)
  if (hasIoTData) confidence += 30;

  return Math.min(confidence, 100);
}

export async function createVerifiedSavingsRecord(
  clientId: string,
  verificationResult: VerificationResult,
  billingPeriod: { start: Date; end: Date }
): Promise<any> {
  // This would create a record in the verified_savings table
  const record = {
    facility_id: clientId, // Would need to map to facility
    billing_period_start: billingPeriod.start,
    billing_period_end: billingPeriod.end,
    baseline_kwh: verificationResult.details.baselineKwh,
    actual_kwh: verificationResult.details.actualKwh,
    kwh_saved: verificationResult.savingsKwh,
    dollars_saved: verificationResult.savingsAmount,
    percent_saved: (verificationResult.savingsKwh / verificationResult.details.baselineKwh) * 100,
    revenue_share_amount: verificationResult.savingsAmount * 0.5, // 50% share
    verification_method: verificationResult.methodology,
    confidence_score: verificationResult.confidence,
    verified_by: 'automated-system',
    verified_at: new Date()
  };

  // Save to database
  return record;
}