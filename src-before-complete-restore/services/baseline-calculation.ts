import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BaselineCalculationResult {
  averageMonthlyKwh: number;
  averagePeakDemand: number;
  dataPoints: number;
  seasonalFactors: {
    winter: number;
    spring: number;
    summer: number;
    fall: number;
  };
  confidence: number;
}

export async function calculateBaseline(clientId: string): Promise<BaselineCalculationResult | null> {
  try {
    // Get all historical bills for this client
    const historicalBills = await prisma.utilityBillData.findMany({
      where: {
        clientId,
        status: 'processed',
        billingPeriodEnd: {
          lt: new Date()
        },
        totalKwh: {
          not: null
        }
      },
      orderBy: {
        billingPeriodEnd: 'desc'
      },
      take: 24 // Last 24 months for better baseline
    });

    if (historicalBills.length < 3) {
      return null;
    }

    // Calculate averages
    const totalKwh = historicalBills.reduce((sum, bill) => sum + (bill.totalKwh || 0), 0);
    const totalDemand = historicalBills.reduce((sum, bill) => sum + (bill.peakDemand || 0), 0);
    
    const averageMonthlyKwh = totalKwh / historicalBills.length;
    const averagePeakDemand = totalDemand / historicalBills.length;

    // Calculate seasonal factors
    const seasonalData = calculateSeasonalFactors(historicalBills);

    // Calculate confidence score based on data quality
    const confidence = calculateConfidenceScore(historicalBills);

    // Update client baseline in database
    await prisma.clientBaseline.upsert({
      where: { clientId },
      update: {
        averageMonthlyKwh,
        averagePeakDemand,
        dataPoints: historicalBills.length,
        seasonalFactors: seasonalData,
        status: 'verified',
        lastUpdated: new Date()
      },
      create: {
        clientId,
        averageMonthlyKwh,
        averagePeakDemand,
        dataPoints: historicalBills.length,
        seasonalFactors: seasonalData,
        status: 'verified'
      }
    });

    return {
      averageMonthlyKwh,
      averagePeakDemand,
      dataPoints: historicalBills.length,
      seasonalFactors: seasonalData,
      confidence
    };

  } catch (error) {
    console.error('Error calculating baseline:', error);
    throw error;
  }
}

function calculateSeasonalFactors(bills: any[]) {
  const seasonalUsage = {
    winter: { total: 0, count: 0 },
    spring: { total: 0, count: 0 },
    summer: { total: 0, count: 0 },
    fall: { total: 0, count: 0 }
  };

  bills.forEach(bill => {
    if (!bill.billingPeriodEnd || !bill.totalKwh) return;
    
    const month = new Date(bill.billingPeriodEnd).getMonth();
    const season = getSeasonFromMonth(month);
    
    seasonalUsage[season].total += bill.totalKwh;
    seasonalUsage[season].count++;
  });

  // Calculate seasonal factors as ratio to annual average
  const annualAverage = bills.reduce((sum, bill) => sum + (bill.totalKwh || 0), 0) / bills.length;
  
  return {
    winter: seasonalUsage.winter.count > 0 
      ? (seasonalUsage.winter.total / seasonalUsage.winter.count) / annualAverage 
      : 1,
    spring: seasonalUsage.spring.count > 0 
      ? (seasonalUsage.spring.total / seasonalUsage.spring.count) / annualAverage 
      : 1,
    summer: seasonalUsage.summer.count > 0 
      ? (seasonalUsage.summer.total / seasonalUsage.summer.count) / annualAverage 
      : 1,
    fall: seasonalUsage.fall.count > 0 
      ? (seasonalUsage.fall.total / seasonalUsage.fall.count) / annualAverage 
      : 1
  };
}

function getSeasonFromMonth(month: number): 'winter' | 'spring' | 'summer' | 'fall' {
  if (month >= 11 || month <= 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  return 'fall';
}

function calculateConfidenceScore(bills: any[]): number {
  let score = 0;
  
  // More data points = higher confidence
  if (bills.length >= 24) score += 30;
  else if (bills.length >= 12) score += 20;
  else if (bills.length >= 6) score += 10;
  else score += 5;
  
  // Consistent data = higher confidence
  const kwhValues = bills.map(b => b.totalKwh || 0).filter(v => v > 0);
  if (kwhValues.length > 0) {
    const mean = kwhValues.reduce((a, b) => a + b) / kwhValues.length;
    const variance = kwhValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / kwhValues.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;
    
    if (coefficientOfVariation < 0.2) score += 30; // Low variation
    else if (coefficientOfVariation < 0.4) score += 20;
    else score += 10;
  }
  
  // Complete data fields = higher confidence
  const completeDataPoints = bills.filter(b => 
    b.totalKwh && b.peakDemand && b.billingPeriodStart && b.billingPeriodEnd
  ).length;
  score += (completeDataPoints / bills.length) * 40;
  
  return Math.min(score, 100);
}

export async function updateBaselineFromUtilityData(clientId: string): Promise<void> {
  try {
    const result = await calculateBaseline(clientId);
    
    if (result) {
      // Update baseline in database
      await updateClientBaseline(clientId, {
        averageKwh: result.averageMonthlyKwh,
        confidence: result.confidence,
        dataPoints: result.dataPoints
      });
    }
  } catch (error) {
    console.error(`Failed to update baseline for client ${clientId}:`, error);
    throw error;
  }
}