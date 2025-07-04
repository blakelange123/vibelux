/**
 * Cannabis-Specific Analytics Metrics
 */

import { prisma } from '@/lib/prisma';
import { createTrackTraceService } from '@/lib/integrations/cannabis-track-trace';

export interface CannabisMetrics {
  // Yield Metrics
  gramsPerSquareFoot: number;
  gramsPerWatt: number;
  gramsPerPlant: number;
  
  // Quality Metrics
  averageThc: number;
  averageCbd: number;
  testingPassRate: number;
  premiumGradePercentage: number;
  
  // Compliance Metrics
  complianceScore: number;
  trackTraceAccuracy: number;
  testingCompliance: number;
  
  // Financial Metrics
  revenuePerGram: number;
  costPerGram: number;
  wholesaleVsRetailRatio: number;
  
  // Operational Metrics
  plantsInProduction: number;
  motherPlantCount: number;
  cloneSuccessRate: number;
  harvestCycleTime: number; // days
}

export class CannabisMetricsService {
  /**
   * Calculate cannabis-specific metrics
   */
  async calculateMetrics(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CannabisMetrics> {
    // Get all harvests in period
    const harvests = await prisma.harvestBatch.findMany({
      where: {
        facilityId,
        harvestDate: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        zone: true,
        sales: true,
        testResults: true
      }
    });

    // Get facility details
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        zones: {
          where: { type: 'FLOWER' }
        }
      }
    });

    // Calculate total canopy area in square feet
    const totalCanopyArea = facility?.zones.reduce((sum, zone) => sum + (zone.area || 0), 0) || 0;

    // Get power consumption for grams per watt
    const powerReadings = await prisma.sensorReading.findMany({
      where: {
        facilityId,
        sensorType: 'POWER',
        timestamp: {
          gte: startDate,
          lte: endDate
        },
        zoneId: {
          in: facility?.zones.map(z => z.id) || []
        }
      }
    });

    // Calculate metrics
    const totalYieldGrams = harvests.reduce((sum, h) => sum + (h.actualYield || 0) * 1000, 0);
    const totalPlants = harvests.reduce((sum, h) => sum + (h.plantCount || 0), 0);
    const totalRevenue = harvests.reduce((sum, h) => {
      const harvestRevenue = h.sales?.reduce((s, sale) => s + sale.totalPrice, 0) || 0;
      return sum + harvestRevenue;
    }, 0);

    // Calculate power consumption
    const totalKwh = this.calculateTotalPowerUsage(powerReadings);

    // Get test results
    const testResults = await prisma.testResult.findMany({
      where: {
        harvestBatchId: {
          in: harvests.map(h => h.id)
        }
      }
    });

    // Calculate quality metrics
    const thcResults = testResults.filter(t => t.testType === 'POTENCY' && t.thc !== null);
    const averageThc = thcResults.length > 0
      ? thcResults.reduce((sum, t) => sum + (t.thc || 0), 0) / thcResults.length
      : 0;

    const cbdResults = testResults.filter(t => t.testType === 'POTENCY' && t.cbd !== null);
    const averageCbd = cbdResults.length > 0
      ? cbdResults.reduce((sum, t) => sum + (t.cbd || 0), 0) / cbdResults.length
      : 0;

    const passedTests = testResults.filter(t => t.passed).length;
    const testingPassRate = testResults.length > 0 
      ? (passedTests / testResults.length) * 100 
      : 100;

    // Calculate grade distribution
    const premiumGrades = harvests.filter(h => ['A+', 'A'].includes(h.qualityGrade || '')).length;
    const premiumGradePercentage = harvests.length > 0
      ? (premiumGrades / harvests.length) * 100
      : 0;

    // Get compliance data
    const complianceScore = await this.calculateComplianceScore(facilityId, startDate, endDate);

    // Get operational data
    const plantInventory = await prisma.plantBatch.findMany({
      where: {
        facilityId,
        stage: { in: ['VEGETATIVE', 'FLOWERING'] },
        destroyed: false
      }
    });

    const motherPlants = await prisma.plantBatch.count({
      where: {
        facilityId,
        stage: 'MOTHER',
        destroyed: false
      }
    });

    const cloneBatches = await prisma.plantBatch.findMany({
      where: {
        facilityId,
        stage: 'CLONE',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const successfulClones = cloneBatches.filter(b => b.quantity > 0 && !b.destroyed);
    const cloneSuccessRate = cloneBatches.length > 0
      ? (successfulClones.length / cloneBatches.length) * 100
      : 0;

    // Calculate average harvest cycle time
    const harvestCycleTimes = harvests.map(h => {
      if (h.plantedDate && h.harvestDate) {
        return Math.floor((h.harvestDate.getTime() - h.plantedDate.getTime()) / (1000 * 60 * 60 * 24));
      }
      return null;
    }).filter(t => t !== null) as number[];

    const avgHarvestCycleTime = harvestCycleTimes.length > 0
      ? harvestCycleTimes.reduce((sum, t) => sum + t, 0) / harvestCycleTimes.length
      : 0;

    // Calculate costs
    const expenses = await prisma.expense.findMany({
      where: {
        facilityId,
        date: {
          gte: startDate,
          lte: endDate
        },
        category: {
          in: ['CULTIVATION', 'LABOR', 'UTILITIES', 'NUTRIENTS', 'TESTING']
        }
      }
    });

    const totalCosts = expenses.reduce((sum, e) => sum + e.amount, 0);
    const costPerGram = totalYieldGrams > 0 ? totalCosts / totalYieldGrams : 0;

    return {
      gramsPerSquareFoot: totalCanopyArea > 0 ? totalYieldGrams / totalCanopyArea : 0,
      gramsPerWatt: totalKwh > 0 ? totalYieldGrams / totalKwh : 0,
      gramsPerPlant: totalPlants > 0 ? totalYieldGrams / totalPlants : 0,
      averageThc,
      averageCbd,
      testingPassRate,
      premiumGradePercentage,
      complianceScore,
      trackTraceAccuracy: 98.5, // This would come from track & trace audits
      testingCompliance: testingPassRate,
      revenuePerGram: totalYieldGrams > 0 ? totalRevenue / totalYieldGrams : 0,
      costPerGram,
      wholesaleVsRetailRatio: this.calculateWholesaleVsRetailRatio(harvests),
      plantsInProduction: plantInventory.reduce((sum, b) => sum + b.quantity, 0),
      motherPlantCount: motherPlants,
      cloneSuccessRate,
      harvestCycleTime: avgHarvestCycleTime
    };
  }

  /**
   * Calculate total power usage from sensor readings
   */
  private calculateTotalPowerUsage(readings: any[]): number {
    if (readings.length < 2) return 0;

    let totalKwh = 0;
    const sortedReadings = readings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    for (let i = 1; i < sortedReadings.length; i++) {
      const timeDiff = (sortedReadings[i].timestamp.getTime() - sortedReadings[i-1].timestamp.getTime()) / (1000 * 60 * 60);
      const avgPower = (sortedReadings[i].value + sortedReadings[i-1].value) / 2;
      totalKwh += avgPower * timeDiff;
    }

    return totalKwh;
  }

  /**
   * Calculate compliance score based on various factors
   */
  private async calculateComplianceScore(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    let score = 100;
    const penalties: string[] = [];

    // Check for track & trace discrepancies
    const trackTraceAudits = await prisma.complianceAudit.findMany({
      where: {
        facilityId,
        auditDate: {
          gte: startDate,
          lte: endDate
        },
        type: 'TRACK_TRACE'
      }
    });

    const failedAudits = trackTraceAudits.filter(a => !a.passed).length;
    if (failedAudits > 0) {
      score -= failedAudits * 5;
      penalties.push(`${failedAudits} failed track & trace audits`);
    }

    // Check for missing test results
    const untestedBatches = await prisma.harvestBatch.count({
      where: {
        facilityId,
        harvestDate: {
          gte: startDate,
          lte: endDate
        },
        testResults: {
          none: {}
        }
      }
    });

    if (untestedBatches > 0) {
      score -= untestedBatches * 10;
      penalties.push(`${untestedBatches} untested batches`);
    }

    // Check for security violations
    const securityIncidents = await prisma.securityIncident.count({
      where: {
        facilityId,
        incidentDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    if (securityIncidents > 0) {
      score -= securityIncidents * 15;
      penalties.push(`${securityIncidents} security incidents`);
    }

    return Math.max(0, score);
  }

  /**
   * Calculate wholesale vs retail revenue ratio
   */
  private calculateWholesaleVsRetailRatio(harvests: any[]): number {
    let wholesaleRevenue = 0;
    let retailRevenue = 0;

    harvests.forEach(harvest => {
      harvest.sales?.forEach((sale: any) => {
        if (sale.saleType === 'WHOLESALE' || sale.customer?.includes('Dispensary')) {
          wholesaleRevenue += sale.totalPrice;
        } else {
          retailRevenue += sale.totalPrice;
        }
      });
    });

    const total = wholesaleRevenue + retailRevenue;
    return total > 0 ? (wholesaleRevenue / total) * 100 : 0;
  }

  /**
   * Get strain performance analytics
   */
  async getStrainPerformance(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    strain: string;
    avgYield: number;
    avgThc: number;
    avgPrice: number;
    cycleTime: number;
    profitability: number;
  }>> {
    const harvests = await prisma.harvestBatch.findMany({
      where: {
        facilityId,
        harvestDate: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        sales: true,
        testResults: {
          where: { testType: 'POTENCY' }
        }
      }
    });

    // Group by strain
    const strainMap = new Map<string, any[]>();
    harvests.forEach(h => {
      const strain = h.strain || 'Unknown';
      if (!strainMap.has(strain)) {
        strainMap.set(strain, []);
      }
      strainMap.get(strain)!.push(h);
    });

    // Calculate metrics per strain
    const strainPerformance = Array.from(strainMap.entries()).map(([strain, strainHarvests]) => {
      const totalYield = strainHarvests.reduce((sum, h) => sum + (h.actualYield || 0), 0);
      const avgYield = totalYield / strainHarvests.length;

      const thcValues = strainHarvests
        .flatMap(h => h.testResults)
        .filter(t => t.thc !== null)
        .map(t => t.thc || 0);
      const avgThc = thcValues.length > 0 ? thcValues.reduce((a, b) => a + b, 0) / thcValues.length : 0;

      const totalRevenue = strainHarvests.reduce((sum, h) => {
        return sum + (h.sales?.reduce((s, sale) => s + sale.totalPrice, 0) || 0);
      }, 0);
      const totalGrams = totalYield * 1000;
      const avgPrice = totalGrams > 0 ? totalRevenue / totalGrams : 0;

      const cycleTimes = strainHarvests
        .filter(h => h.plantedDate && h.harvestDate)
        .map(h => Math.floor((h.harvestDate!.getTime() - h.plantedDate!.getTime()) / (1000 * 60 * 60 * 24)));
      const avgCycleTime = cycleTimes.length > 0 
        ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length 
        : 0;

      // Simple profitability score (revenue per gram * yield * quality factor)
      const qualityFactor = avgThc / 20; // Assuming 20% THC is baseline
      const profitability = avgPrice * avgYield * qualityFactor * 1000;

      return {
        strain,
        avgYield,
        avgThc,
        avgPrice,
        cycleTime: avgCycleTime,
        profitability
      };
    });

    return strainPerformance.sort((a, b) => b.profitability - a.profitability);
  }
}