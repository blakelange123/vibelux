/**
 * Produce-Specific Analytics Metrics
 */

import { prisma } from '@/lib/prisma';

export interface ProduceMetrics {
  // Yield Metrics
  yieldPerSquareMeter: number; // kg/m²
  plantsPerSquareMeter: number;
  harvestsPerYear: number;
  
  // Quality Metrics
  averageBrix: number; // Sugar content
  shelfLifeDays: number;
  gradeAPercentage: number;
  packOutRate: number; // % of harvest that's sellable
  
  // Efficiency Metrics
  waterUsagePerKg: number; // Liters per kg
  daysToHarvest: number;
  laborHoursPerKg: number;
  postHarvestLoss: number; // percentage
  
  // Food Safety Metrics
  foodSafetyScore: number;
  gapCompliance: number;
  traceabilityScore: number;
  
  // Financial Metrics
  revenuePerSquareMeter: number;
  costPerKg: number;
  averagePricePerKg: number;
  directToConsumerRatio: number;
  
  // Sustainability Metrics
  organicPercentage: number;
  pesticidefreePercentage: number;
  carbonFootprint: number; // kg CO2 per kg produce
  renewableEnergyPercentage: number;
}

export class ProduceMetricsService {
  /**
   * Calculate produce-specific metrics
   */
  async calculateMetrics(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProduceMetrics> {
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
        qualityTests: true,
        crew: true
      }
    });

    // Get facility details
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        zones: {
          where: { 
            type: { in: ['GREENHOUSE', 'INDOOR', 'VERTICAL_FARM'] }
          }
        }
      }
    });

    // Calculate total growing area in square meters
    const totalAreaM2 = facility?.zones.reduce((sum, zone) => {
      return sum + ((zone.area || 0) * 0.092903); // Convert sq ft to m²
    }, 0) || 0;

    // Calculate yield metrics
    const totalYieldKg = harvests.reduce((sum, h) => sum + (h.actualYield || 0), 0);
    const totalPlants = harvests.reduce((sum, h) => sum + (h.plantCount || 0), 0);
    
    // Calculate harvests per year (extrapolated)
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const harvestsInPeriod = harvests.length;
    const harvestsPerYear = (harvestsInPeriod / periodDays) * 365;

    // Get quality metrics
    const qualityTests = await prisma.qualityTest.findMany({
      where: {
        harvestBatchId: {
          in: harvests.map(h => h.id)
        }
      }
    });

    const brixReadings = qualityTests.filter(t => t.testType === 'BRIX' && t.value !== null);
    const averageBrix = brixReadings.length > 0
      ? brixReadings.reduce((sum, t) => sum + (t.value || 0), 0) / brixReadings.length
      : 0;

    const shelfLifeTests = qualityTests.filter(t => t.testType === 'SHELF_LIFE');
    const avgShelfLife = shelfLifeTests.length > 0
      ? shelfLifeTests.reduce((sum, t) => sum + (t.value || 0), 0) / shelfLifeTests.length
      : 7; // Default 7 days

    // Calculate grade distribution
    const gradeA = harvests.filter(h => h.qualityGrade === 'A' || h.qualityGrade === 'A+').length;
    const gradeAPercentage = harvests.length > 0 ? (gradeA / harvests.length) * 100 : 0;

    // Calculate pack-out rate
    const totalHarvested = harvests.reduce((sum, h) => sum + (h.estimatedYield || 0), 0);
    const totalSold = harvests.reduce((sum, h) => sum + (h.actualYield || 0), 0);
    const packOutRate = totalHarvested > 0 ? (totalSold / totalHarvested) * 100 : 0;

    // Get water usage
    const waterReadings = await prisma.sensorReading.findMany({
      where: {
        facilityId,
        sensorType: 'WATER_FLOW',
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalWaterLiters = this.calculateTotalWaterUsage(waterReadings);
    const waterUsagePerKg = totalYieldKg > 0 ? totalWaterLiters / totalYieldKg : 0;

    // Calculate days to harvest
    const harvestCycles = harvests
      .filter(h => h.plantedDate && h.harvestDate)
      .map(h => Math.ceil((h.harvestDate!.getTime() - h.plantedDate!.getTime()) / (1000 * 60 * 60 * 24)));
    
    const avgDaysToHarvest = harvestCycles.length > 0
      ? harvestCycles.reduce((a, b) => a + b, 0) / harvestCycles.length
      : 0;

    // Calculate labor metrics
    const laborHours = await prisma.laborLog.aggregate({
      where: {
        facilityId,
        date: {
          gte: startDate,
          lte: endDate
        },
        taskType: { in: ['PLANTING', 'MAINTENANCE', 'HARVESTING', 'PACKING'] }
      },
      _sum: {
        hours: true
      }
    });

    const totalLaborHours = laborHours._sum.hours || 0;
    const laborHoursPerKg = totalYieldKg > 0 ? totalLaborHours / totalYieldKg : 0;

    // Calculate post-harvest loss
    const wasteRecords = await prisma.wasteRecord.aggregate({
      where: {
        facilityId,
        date: {
          gte: startDate,
          lte: endDate
        },
        reason: { in: ['QUALITY', 'EXPIRED', 'DAMAGED'] }
      },
      _sum: {
        quantity: true
      }
    });

    const totalWaste = wasteRecords._sum.quantity || 0;
    const postHarvestLoss = (totalYieldKg + totalWaste) > 0 
      ? (totalWaste / (totalYieldKg + totalWaste)) * 100 
      : 0;

    // Calculate food safety metrics
    const foodSafetyScore = await this.calculateFoodSafetyScore(facilityId, startDate, endDate);
    const gapCompliance = await this.calculateGAPCompliance(facilityId);
    const traceabilityScore = await this.calculateTraceabilityScore(facilityId, startDate, endDate);

    // Financial metrics
    const totalRevenue = harvests.reduce((sum, h) => {
      return sum + (h.sales?.reduce((s, sale) => s + sale.totalPrice, 0) || 0);
    }, 0);

    const expenses = await prisma.expense.aggregate({
      where: {
        facilityId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    });

    const totalCosts = expenses._sum.amount || 0;
    const costPerKg = totalYieldKg > 0 ? totalCosts / totalYieldKg : 0;
    const avgPricePerKg = totalYieldKg > 0 ? totalRevenue / totalYieldKg : 0;

    // Calculate sales channel distribution
    const directSales = harvests.reduce((sum, h) => {
      const direct = h.sales?.filter(s => s.saleType === 'DIRECT' || s.customer?.includes('Market')).reduce((s, sale) => s + sale.totalPrice, 0) || 0;
      return sum + direct;
    }, 0);

    const directToConsumerRatio = totalRevenue > 0 ? (directSales / totalRevenue) * 100 : 0;

    // Sustainability metrics
    const organicHarvests = harvests.filter(h => h.certifications?.includes('ORGANIC')).length;
    const organicPercentage = harvests.length > 0 ? (organicHarvests / harvests.length) * 100 : 0;

    const pesticideFreeHarvests = harvests.filter(h => !h.pesticidesUsed || h.pesticidesUsed.length === 0).length;
    const pesticidefreePercentage = harvests.length > 0 ? (pesticideFreeHarvests / harvests.length) * 100 : 0;

    // Calculate carbon footprint and renewable energy
    const energyData = await this.calculateEnergyMetrics(facilityId, startDate, endDate);

    return {
      yieldPerSquareMeter: totalAreaM2 > 0 ? totalYieldKg / totalAreaM2 : 0,
      plantsPerSquareMeter: totalAreaM2 > 0 ? totalPlants / totalAreaM2 : 0,
      harvestsPerYear,
      averageBrix,
      shelfLifeDays: avgShelfLife,
      gradeAPercentage,
      packOutRate,
      waterUsagePerKg,
      daysToHarvest: avgDaysToHarvest,
      laborHoursPerKg,
      postHarvestLoss,
      foodSafetyScore,
      gapCompliance,
      traceabilityScore,
      revenuePerSquareMeter: totalAreaM2 > 0 ? totalRevenue / totalAreaM2 : 0,
      costPerKg,
      averagePricePerKg: avgPricePerKg,
      directToConsumerRatio,
      organicPercentage,
      pesticidefreePercentage,
      carbonFootprint: energyData.carbonFootprint,
      renewableEnergyPercentage: energyData.renewablePercentage
    };
  }

  /**
   * Calculate total water usage from flow sensor readings
   */
  private calculateTotalWaterUsage(readings: any[]): number {
    if (readings.length === 0) return 0;

    // Sum up flow readings (assuming readings are in liters per minute)
    return readings.reduce((sum, reading) => {
      // Each reading represents flow at that moment
      // We'd need to integrate over time for accurate total
      return sum + (reading.value || 0) * 5; // Assuming 5-minute intervals
    }, 0);
  }

  /**
   * Calculate food safety score
   */
  private async calculateFoodSafetyScore(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    let score = 100;

    // Check for contamination incidents
    const contaminations = await prisma.foodSafetyIncident.count({
      where: {
        facilityId,
        incidentDate: {
          gte: startDate,
          lte: endDate
        },
        severity: { in: ['HIGH', 'CRITICAL'] }
      }
    });

    score -= contaminations * 20;

    // Check for temperature excursions
    const tempExcursions = await prisma.sensorAlert.count({
      where: {
        facilityId,
        alertType: 'TEMPERATURE_EXCURSION',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    score -= tempExcursions * 5;

    // Check for sanitation records
    const sanitationRecords = await prisma.sanitationLog.count({
      where: {
        facilityId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const expectedRecords = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const sanitationCompliance = Math.min(100, (sanitationRecords / expectedRecords) * 100);
    
    score = score * (sanitationCompliance / 100);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate GAP (Good Agricultural Practices) compliance
   */
  private async calculateGAPCompliance(facilityId: string): Promise<number> {
    const gapRequirements = [
      'water_testing',
      'soil_testing',
      'worker_hygiene_training',
      'harvest_sanitation',
      'storage_temperature_monitoring',
      'pest_management_plan',
      'traceability_system',
      'recall_plan'
    ];

    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        certifications: true,
        complianceRecords: {
          where: {
            recordType: 'GAP_AUDIT'
          },
          orderBy: {
            date: 'desc'
          },
          take: 1
        }
      }
    });

    if (facility?.certifications?.some(c => c.type === 'GAP' && c.active)) {
      return 100;
    }

    if (facility?.complianceRecords?.[0]) {
      return facility.complianceRecords[0].score || 0;
    }

    return 0;
  }

  /**
   * Calculate traceability score
   */
  private async calculateTraceabilityScore(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const harvests = await prisma.harvestBatch.count({
      where: {
        facilityId,
        harvestDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const tracedHarvests = await prisma.harvestBatch.count({
      where: {
        facilityId,
        harvestDate: {
          gte: startDate,
          lte: endDate
        },
        lotNumber: { not: null },
        zone: { isNot: null },
        plantedDate: { not: null }
      }
    });

    return harvests > 0 ? (tracedHarvests / harvests) * 100 : 100;
  }

  /**
   * Calculate energy and carbon metrics
   */
  private async calculateEnergyMetrics(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ carbonFootprint: number; renewablePercentage: number }> {
    const energyReadings = await prisma.sensorReading.findMany({
      where: {
        facilityId,
        sensorType: 'POWER',
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalKwh = energyReadings.reduce((sum, r) => sum + (r.value || 0), 0);
    
    // Get renewable energy percentage from facility settings
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId }
    });

    const renewablePercentage = facility?.renewableEnergyPercentage || 0;
    
    // Calculate carbon footprint (avg 0.92 lbs CO2 per kWh for US grid)
    const gridCO2 = totalKwh * 0.92 * 0.453592; // Convert to kg
    const carbonFootprint = gridCO2 * (1 - renewablePercentage / 100);

    return { carbonFootprint, renewablePercentage };
  }

  /**
   * Get crop performance analytics
   */
  async getCropPerformance(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    crop: string;
    avgYield: number;
    avgDaysToHarvest: number;
    avgPrice: number;
    profitMargin: number;
    customerSatisfaction: number;
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
        qualityTests: true,
        customerFeedback: true
      }
    });

    // Group by crop type
    const cropMap = new Map<string, any[]>();
    harvests.forEach(h => {
      const crop = h.cropType || h.strain || 'Unknown';
      if (!cropMap.has(crop)) {
        cropMap.set(crop, []);
      }
      cropMap.get(crop)!.push(h);
    });

    // Calculate metrics per crop
    return Array.from(cropMap.entries()).map(([crop, cropHarvests]) => {
      const totalYield = cropHarvests.reduce((sum, h) => sum + (h.actualYield || 0), 0);
      const avgYield = totalYield / cropHarvests.length;

      const cycleTimes = cropHarvests
        .filter(h => h.plantedDate && h.harvestDate)
        .map(h => Math.ceil((h.harvestDate!.getTime() - h.plantedDate!.getTime()) / (1000 * 60 * 60 * 24)));
      const avgDaysToHarvest = cycleTimes.length > 0 
        ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length 
        : 0;

      const totalRevenue = cropHarvests.reduce((sum, h) => {
        return sum + (h.sales?.reduce((s, sale) => s + sale.totalPrice, 0) || 0);
      }, 0);
      const avgPrice = totalYield > 0 ? totalRevenue / totalYield : 0;

      // Calculate simple profit margin (would need cost allocation by crop for accuracy)
      const estimatedCost = avgPrice * 0.6; // Assume 60% cost
      const profitMargin = avgPrice > 0 ? ((avgPrice - estimatedCost) / avgPrice) * 100 : 0;

      // Calculate customer satisfaction from feedback
      const allFeedback = cropHarvests.flatMap(h => h.customerFeedback || []);
      const avgRating = allFeedback.length > 0
        ? allFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / allFeedback.length
        : 4; // Default 4/5

      return {
        crop,
        avgYield,
        avgDaysToHarvest,
        avgPrice,
        profitMargin,
        customerSatisfaction: avgRating * 20 // Convert 5-star to percentage
      };
    }).sort((a, b) => b.profitMargin - a.profitMargin);
  }
}