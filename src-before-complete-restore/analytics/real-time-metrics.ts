/**
 * Real-time Analytics Metrics Service
 * Connects facility data, harvest records, and energy consumption to analytics dashboard
 */

import { prisma } from '@/lib/prisma';
import { AccountingIntegrationService } from '@/lib/integrations/accounting-integration';

export interface FacilityMetrics {
  totalRevenue: number;
  energyEfficiency: number; // g/kWh
  averageYield: number; // kg/m²
  spaceUtilization: number; // percentage
  period: {
    start: Date;
    end: Date;
  };
}

export interface MetricDetails {
  revenue: {
    total: number;
    byProduct: Array<{ product: string; amount: number }>;
    trend: number; // percentage change
  };
  energy: {
    efficiency: number;
    totalConsumption: number; // kWh
    totalYield: number; // grams
    costPerKwh: number;
    trend: number;
  };
  yield: {
    average: number;
    byZone: Array<{ zone: string; yield: number }>;
    totalHarvests: number;
    trend: number;
  };
  space: {
    utilization: number;
    totalArea: number; // sq ft
    cultivationArea: number; // sq ft
    byZone: Array<{ zone: string; area: number; utilization: number }>;
  };
}

export class RealTimeMetricsService {
  /**
   * Calculate real-time metrics for a facility
   */
  async calculateFacilityMetrics(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FacilityMetrics> {
    // Get facility details
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        zones: true,
        expenses: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    });

    if (!facility) {
      throw new Error('Facility not found');
    }

    // Calculate total revenue from harvest batches
    const revenue = await this.calculateRevenue(facilityId, startDate, endDate);
    
    // Calculate energy efficiency
    const energyEfficiency = await this.calculateEnergyEfficiency(facilityId, startDate, endDate);
    
    // Calculate average yield
    const averageYield = await this.calculateAverageYield(facilityId, startDate, endDate);
    
    // Calculate space utilization
    const spaceUtilization = this.calculateSpaceUtilization(facility);

    return {
      totalRevenue: revenue,
      energyEfficiency,
      averageYield,
      spaceUtilization,
      period: {
        start: startDate,
        end: endDate
      }
    };
  }

  /**
   * Calculate total revenue from all sources
   */
  private async calculateRevenue(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Get harvest sales revenue
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
        sales: true
      }
    });

    const harvestRevenue = harvests.reduce((sum, harvest) => {
      const harvestRevenue = harvest.sales?.reduce((saleSum, sale) => {
        return saleSum + (sale.quantity * sale.pricePerUnit);
      }, 0) || 0;
      return sum + harvestRevenue;
    }, 0);

    // Get accounting system revenue if integrated
    let accountingRevenue = 0;
    
    const integrationConfig = await prisma.integrationConfig.findFirst({
      where: {
        facilityId,
        type: 'ACCOUNTING',
        enabled: true
      }
    });

    if (integrationConfig && integrationConfig.metadata) {
      try {
        const accountingService = new AccountingIntegrationService({
          provider: integrationConfig.config.provider,
          accessToken: integrationConfig.metadata.accessToken,
          refreshToken: integrationConfig.metadata.refreshToken,
          companyId: integrationConfig.metadata.companyId,
          environment: integrationConfig.config.environment || 'production'
        });

        const revenues = await accountingService.fetchRevenueData(startDate, endDate);
        accountingRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);
      } catch (error) {
        console.error('Failed to fetch accounting revenue:', error);
      }
    }

    // Get direct sales records
    const directSales = await prisma.sale.findMany({
      where: {
        facilityId,
        saleDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const directRevenue = directSales.reduce((sum, sale) => sum + sale.totalPrice, 0);

    // Return the maximum to avoid double counting
    // In production, you'd want more sophisticated deduplication
    return Math.max(harvestRevenue + directRevenue, accountingRevenue);
  }

  /**
   * Calculate energy efficiency (grams yield per kWh)
   */
  private async calculateEnergyEfficiency(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Get total energy consumption
    const energyReadings = await prisma.sensorReading.findMany({
      where: {
        facilityId,
        sensorType: 'POWER',
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    // Calculate total kWh consumed
    let totalKwh = 0;
    for (let i = 1; i < energyReadings.length; i++) {
      const timeDiff = (energyReadings[i].timestamp.getTime() - energyReadings[i-1].timestamp.getTime()) / (1000 * 60 * 60); // hours
      const avgPower = (energyReadings[i].value + energyReadings[i-1].value) / 2; // kW
      totalKwh += avgPower * timeDiff;
    }

    // Get total yield in grams
    const harvests = await prisma.harvestBatch.findMany({
      where: {
        facilityId,
        harvestDate: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      }
    });

    const totalYieldGrams = harvests.reduce((sum, harvest) => {
      return sum + (harvest.actualYield || 0) * 1000; // Convert kg to grams
    }, 0);

    // Calculate efficiency
    if (totalKwh === 0) return 0;
    return totalYieldGrams / totalKwh;
  }

  /**
   * Calculate average yield per square meter
   */
  private async calculateAverageYield(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Get all harvests in the period
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
        zone: true
      }
    });

    // Calculate total yield and area
    let totalYieldKg = 0;
    let totalAreaM2 = 0;

    for (const harvest of harvests) {
      totalYieldKg += harvest.actualYield || 0;
      if (harvest.zone?.area) {
        // Convert sq ft to sq m (1 sq ft = 0.092903 sq m)
        totalAreaM2 += harvest.zone.area * 0.092903;
      }
    }

    if (totalAreaM2 === 0) return 0;
    return totalYieldKg / totalAreaM2;
  }

  /**
   * Calculate space utilization percentage
   */
  private calculateSpaceUtilization(facility: any): number {
    const totalArea = facility.totalSquareFeet || 0;
    const cultivationArea = facility.cultivationSquareFeet || 0;
    
    if (totalArea === 0) return 0;
    return (cultivationArea / totalArea) * 100;
  }

  /**
   * Get detailed metrics with breakdowns
   */
  async getDetailedMetrics(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MetricDetails> {
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        zones: true,
        harvestBatches: {
          where: {
            harvestDate: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            sales: true,
            zone: true
          }
        }
      }
    });

    if (!facility) {
      throw new Error('Facility not found');
    }

    // Calculate previous period for trend comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStart = new Date(startDate.getTime() - periodLength);
    const previousEnd = new Date(startDate.getTime() - 1);

    // Current and previous metrics
    const currentMetrics = await this.calculateFacilityMetrics(facilityId, startDate, endDate);
    const previousMetrics = await this.calculateFacilityMetrics(facilityId, previousStart, previousEnd);

    // Calculate trends
    const revenueTrend = this.calculateTrend(currentMetrics.totalRevenue, previousMetrics.totalRevenue);
    const energyTrend = this.calculateTrend(currentMetrics.energyEfficiency, previousMetrics.energyEfficiency);
    const yieldTrend = this.calculateTrend(currentMetrics.averageYield, previousMetrics.averageYield);

    // Revenue by product
    const revenueByProduct = await this.getRevenueByProduct(facilityId, startDate, endDate);

    // Yield by zone
    const yieldByZone = await this.getYieldByZone(facilityId, startDate, endDate);

    // Space utilization by zone
    const spaceByZone = this.getSpaceUtilizationByZone(facility);

    return {
      revenue: {
        total: currentMetrics.totalRevenue,
        byProduct: revenueByProduct,
        trend: revenueTrend
      },
      energy: {
        efficiency: currentMetrics.energyEfficiency,
        totalConsumption: await this.getTotalEnergyConsumption(facilityId, startDate, endDate),
        totalYield: await this.getTotalYield(facilityId, startDate, endDate),
        costPerKwh: 0.12, // Default cost, should come from facility settings
        trend: energyTrend
      },
      yield: {
        average: currentMetrics.averageYield,
        byZone: yieldByZone,
        totalHarvests: await this.getTotalHarvests(facilityId, startDate, endDate),
        trend: yieldTrend
      },
      space: {
        utilization: currentMetrics.spaceUtilization,
        totalArea: facility.totalSquareFeet || 0,
        cultivationArea: facility.cultivationSquareFeet || 0,
        byZone: spaceByZone
      }
    };
  }

  /**
   * Calculate percentage change trend
   */
  private calculateTrend(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Get revenue breakdown by product/category
   */
  private async getRevenueByProduct(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ product: string; amount: number }>> {
    const revenueMap = new Map<string, number>();

    // Get harvest-based revenue
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
        sales: true
      }
    });

    harvests.forEach(harvest => {
      const product = harvest.strain || 'Unknown';
      const revenue = harvest.sales?.reduce((sum, sale) => {
        return sum + (sale.quantity * sale.pricePerUnit);
      }, 0) || 0;

      revenueMap.set(product, (revenueMap.get(product) || 0) + revenue);
    });

    // Get accounting system revenue breakdown if available
    const integrationConfig = await prisma.integrationConfig.findFirst({
      where: {
        facilityId,
        type: 'ACCOUNTING',
        enabled: true
      }
    });

    if (integrationConfig && integrationConfig.metadata) {
      try {
        const accountingService = new AccountingIntegrationService({
          provider: integrationConfig.config.provider,
          accessToken: integrationConfig.metadata.accessToken,
          refreshToken: integrationConfig.metadata.refreshToken,
          companyId: integrationConfig.metadata.companyId,
          environment: integrationConfig.config.environment || 'production'
        });

        const revenues = await accountingService.fetchRevenueData(startDate, endDate);
        
        // Group by category from accounting system
        revenues.forEach(rev => {
          const category = rev.category || 'Other Revenue';
          revenueMap.set(category, (revenueMap.get(category) || 0) + rev.amount);
        });
      } catch (error) {
        console.error('Failed to fetch accounting revenue breakdown:', error);
      }
    }

    // Sort by revenue amount
    return Array.from(revenueMap.entries())
      .map(([product, amount]) => ({ product, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Get yield breakdown by zone
   */
  private async getYieldByZone(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ zone: string; yield: number }>> {
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
        zone: true
      }
    });

    const yieldMap = new Map<string, { yield: number; area: number }>();

    harvests.forEach(harvest => {
      const zoneName = harvest.zone?.name || 'Unknown';
      const current = yieldMap.get(zoneName) || { yield: 0, area: 0 };
      
      current.yield += harvest.actualYield || 0;
      if (harvest.zone?.area && current.area === 0) {
        current.area = harvest.zone.area * 0.092903; // Convert to sq m
      }

      yieldMap.set(zoneName, current);
    });

    return Array.from(yieldMap.entries()).map(([zone, data]) => ({
      zone,
      yield: data.area > 0 ? data.yield / data.area : 0
    }));
  }

  /**
   * Get space utilization by zone
   */
  private getSpaceUtilizationByZone(facility: any): Array<{ zone: string; area: number; utilization: number }> {
    if (!facility.zones || facility.zones.length === 0) return [];

    const totalArea = facility.totalSquareFeet || 0;

    return facility.zones.map((zone: any) => ({
      zone: zone.name,
      area: zone.area || 0,
      utilization: totalArea > 0 ? (zone.area / totalArea) * 100 : 0
    }));
  }

  /**
   * Helper methods for detailed metrics
   */
  private async getTotalEnergyConsumption(facilityId: string, startDate: Date, endDate: Date): Promise<number> {
    const readings = await prisma.sensorReading.findMany({
      where: {
        facilityId,
        sensorType: 'POWER',
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    let totalKwh = 0;
    for (let i = 1; i < readings.length; i++) {
      const timeDiff = (readings[i].timestamp.getTime() - readings[i-1].timestamp.getTime()) / (1000 * 60 * 60);
      const avgPower = (readings[i].value + readings[i-1].value) / 2;
      totalKwh += avgPower * timeDiff;
    }

    return totalKwh;
  }

  private async getTotalYield(facilityId: string, startDate: Date, endDate: Date): Promise<number> {
    const harvests = await prisma.harvestBatch.findMany({
      where: {
        facilityId,
        harvestDate: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      }
    });

    return harvests.reduce((sum, harvest) => sum + (harvest.actualYield || 0) * 1000, 0);
  }

  private async getTotalHarvests(facilityId: string, startDate: Date, endDate: Date): Promise<number> {
    return await prisma.harvestBatch.count({
      where: {
        facilityId,
        harvestDate: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      }
    });
  }
}

// Export singleton instance
export const metricsService = new RealTimeMetricsService();