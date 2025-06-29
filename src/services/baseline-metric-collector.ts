/**
 * Live Baseline Metric Collection Service
 * Collects real-time metrics from facilities to establish performance baselines
 */

import { prisma } from '@/lib/prisma';
import { getTimeSeriesDB } from '@/lib/timeseries/influxdb-client';
import { UtilityBillParser } from './utility-bill-parser';

interface MetricSnapshot {
  timestamp: Date;
  energy: {
    currentPowerKw: number;
    dailyKwhTotal: number;
    peakDemandKw: number;
    powerFactor: number;
  };
  production: {
    plantsActive: number;
    dailyHarvestGrams: number;
    qualityGrade: string;
    yieldPerSqFt: number;
  };
  environmental: {
    avgTemperature: number;
    avgHumidity: number;
    avgCO2: number;
    avgVPD: number;
  };
  financial: {
    dailyLaborHours: number;
    dailyMaterialCost: number;
    dailyEnergyDollar: number;
  };
}

export class BaselineMetricCollector {
  private influxDB: ReturnType<typeof getTimeSeriesDB>;
  private billParser: UtilityBillParser;

  constructor() {
    this.influxDB = getTimeSeriesDB();
    this.billParser = new UtilityBillParser();
  }

  /**
   * Collect live metrics from all active facilities
   */
  async collectLiveMetrics(facilityId: string): Promise<MetricSnapshot> {

    const now = new Date();
    const dayStart = new Date(now.setHours(0, 0, 0, 0));

    // Collect from multiple sources in parallel
    const [
      energyMetrics,
      productionMetrics,
      environmentalMetrics,
      financialMetrics
    ] = await Promise.all([
      this.collectEnergyMetrics(facilityId, dayStart, now),
      this.collectProductionMetrics(facilityId, dayStart, now),
      this.collectEnvironmentalMetrics(facilityId, dayStart, now),
      this.collectFinancialMetrics(facilityId, dayStart, now)
    ]);

    const snapshot: MetricSnapshot = {
      timestamp: now,
      energy: energyMetrics,
      production: productionMetrics,
      environmental: environmentalMetrics,
      financial: financialMetrics
    };

    // Store snapshot for baseline calculation
    await this.storeMetricSnapshot(facilityId, snapshot);

    return snapshot;
  }

  /**
   * Collect energy metrics from smart meters and sensors
   */
  private async collectEnergyMetrics(
    facilityId: string,
    startTime: Date,
    endTime: Date
  ): Promise<MetricSnapshot['energy']> {
    try {
      // Query InfluxDB for real-time power data
      const powerQuery = `
        from(bucket: "vibelux_sensors")
          |> range(start: ${startTime.toISOString()}, stop: ${endTime.toISOString()})
          |> filter(fn: (r) => r["_measurement"] == "power" and r["facility_id"] == "${facilityId}")
          |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
      `;

      const powerData = await this.influxDB.query(powerQuery);
      
      // Calculate metrics from sensor data
      const currentPower = await this.getCurrentPower(facilityId);
      const dailyTotal = await this.getDailyEnergyTotal(facilityId, dayStart);
      const peakDemand = await this.getPeakDemand(facilityId, dayStart);
      const powerFactor = await this.getPowerFactor(facilityId);

      return {
        currentPowerKw: currentPower || 0,
        dailyKwhTotal: dailyTotal || 0,
        peakDemandKw: peakDemand || 0,
        powerFactor: powerFactor || 0.95
      };
    } catch (error) {
      console.error('Error collecting energy metrics:', error);
      // Return defaults if real data unavailable
      return {
        currentPowerKw: 0,
        dailyKwhTotal: 0,
        peakDemandKw: 0,
        powerFactor: 0.95
      };
    }
  }

  /**
   * Collect production metrics from cultivation tracking systems
   */
  private async collectProductionMetrics(
    facilityId: string,
    startTime: Date,
    endTime: Date
  ): Promise<MetricSnapshot['production']> {
    try {
      // Get production data from database
      const batches = await prisma.productionBatch.findMany({
        where: {
          facilityId,
          status: 'ACTIVE'
        }
      });

      const harvestToday = await prisma.productionBatch.findMany({
        where: {
          facilityId,
          harvestDate: {
            gte: startTime,
            lte: endTime
          }
        }
      });

      // Calculate metrics
      const plantsActive = batches.reduce((sum, batch) => sum + batch.plantCount, 0);
      const dailyHarvestGrams = harvestToday.reduce((sum, batch) => 
        sum + (batch.dryWeight || 0), 0
      );

      // Get facility size for yield calculation
      const facility = await prisma.facility.findUnique({
        where: { id: facilityId }
      });
      const yieldPerSqFt = facility?.size ? dailyHarvestGrams / facility.size : 0;

      return {
        plantsActive,
        dailyHarvestGrams,
        qualityGrade: 'A', // Would come from quality testing system
        yieldPerSqFt
      };
    } catch (error) {
      console.error('Error collecting production metrics:', error);
      return {
        plantsActive: 0,
        dailyHarvestGrams: 0,
        qualityGrade: 'Unknown',
        yieldPerSqFt: 0
      };
    }
  }

  /**
   * Collect environmental metrics from sensors
   */
  private async collectEnvironmentalMetrics(
    facilityId: string,
    startTime: Date,
    endTime: Date
  ): Promise<MetricSnapshot['environmental']> {
    try {
      // Query recent sensor readings
      const sensorData = await prisma.sensorReading.findMany({
        where: {
          facilityId,
          timestamp: {
            gte: startTime,
            lte: endTime
          },
          sensorType: {
            in: ['temperature', 'humidity', 'co2', 'vpd']
          }
        }
      });

      // Calculate averages by type
      const avgByType = sensorData.reduce((acc, reading) => {
        if (!acc[reading.sensorType]) {
          acc[reading.sensorType] = { sum: 0, count: 0 };
        }
        acc[reading.sensorType].sum += reading.value;
        acc[reading.sensorType].count += 1;
        return acc;
      }, {} as Record<string, { sum: number; count: number }>);

      return {
        avgTemperature: avgByType.temperature ? 
          avgByType.temperature.sum / avgByType.temperature.count : 72,
        avgHumidity: avgByType.humidity ? 
          avgByType.humidity.sum / avgByType.humidity.count : 50,
        avgCO2: avgByType.co2 ? 
          avgByType.co2.sum / avgByType.co2.count : 800,
        avgVPD: avgByType.vpd ? 
          avgByType.vpd.sum / avgByType.vpd.count : 1.0
      };
    } catch (error) {
      console.error('Error collecting environmental metrics:', error);
      return {
        avgTemperature: 72,
        avgHumidity: 50,
        avgCO2: 800,
        avgVPD: 1.0
      };
    }
  }

  /**
   * Collect financial metrics from expense tracking
   */
  private async collectFinancialMetrics(
    facilityId: string,
    startTime: Date,
    endTime: Date
  ): Promise<MetricSnapshot['financial']> {
    try {
      // Get today's expenses
      const expenses = await prisma.expense.findMany({
        where: {
          facilityId,
          expenseDate: {
            gte: startTime,
            lte: endTime
          }
        },
        include: {
          category: true
        }
      });

      // Sum by category
      const laborHours = 0; // Would come from time tracking system
      const materialCost = expenses
        .filter(e => e.category.type === 'materials')
        .reduce((sum, e) => sum + e.amount, 0);
      const energyCost = expenses
        .filter(e => e.category.type === 'utilities')
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        dailyLaborHours: laborHours,
        dailyMaterialCost: materialCost,
        dailyEnergyDollar: energyCost
      };
    } catch (error) {
      console.error('Error collecting financial metrics:', error);
      return {
        dailyLaborHours: 0,
        dailyMaterialCost: 0,
        dailyEnergyDollar: 0
      };
    }
  }

  /**
   * Store metric snapshot for baseline calculation
   */
  private async storeMetricSnapshot(
    facilityId: string,
    snapshot: MetricSnapshot
  ): Promise<void> {
    // Store in InfluxDB for time-series analysis
    const points = [
      {
        measurement: 'baseline_metrics',
        tags: { facility_id: facilityId },
        fields: {
          // Energy metrics
          power_kw: snapshot.energy.currentPowerKw,
          daily_kwh: snapshot.energy.dailyKwhTotal,
          peak_demand_kw: snapshot.energy.peakDemandKw,
          power_factor: snapshot.energy.powerFactor,
          
          // Production metrics
          plants_active: snapshot.production.plantsActive,
          harvest_grams: snapshot.production.dailyHarvestGrams,
          yield_per_sqft: snapshot.production.yieldPerSqFt,
          
          // Environmental metrics
          avg_temperature: snapshot.environmental.avgTemperature,
          avg_humidity: snapshot.environmental.avgHumidity,
          avg_co2: snapshot.environmental.avgCO2,
          avg_vpd: snapshot.environmental.avgVPD,
          
          // Financial metrics
          labor_hours: snapshot.financial.dailyLaborHours,
          material_cost: snapshot.financial.dailyMaterialCost,
          energy_cost: snapshot.financial.dailyEnergyDollar
        },
        timestamp: snapshot.timestamp
      }
    ];

    await this.influxDB.writeBatch(points);
  }

  /**
   * Calculate 30-day baseline from collected metrics
   */
  async calculateBaseline(facilityId: string): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Query 30 days of baseline metrics
    const query = `
      from(bucket: "vibelux_sensors")
        |> range(start: ${thirtyDaysAgo.toISOString()})
        |> filter(fn: (r) => r["_measurement"] == "baseline_metrics" and r["facility_id"] == "${facilityId}")
        |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
    `;

    const historicalData = await this.influxDB.query(query);
    
    // Calculate baseline averages
    // This would process the InfluxDB results and create the baseline
    return {
      energy: {
        avgDailyKwh: 0, // Calculate from historicalData
        avgPeakDemand: 0,
        avgCostPerKwh: 0
      },
      production: {
        avgDailyYield: 0,
        avgQualityScore: 0,
        avgYieldPerSqFt: 0
      },
      environmental: {
        targetRanges: {
          temperature: { min: 68, max: 78 },
          humidity: { min: 45, max: 65 },
          co2: { min: 800, max: 1200 },
          vpd: { min: 0.8, max: 1.2 }
        }
      },
      financial: {
        avgDailyCost: 0,
        avgLaborHours: 0,
        avgMaterialCost: 0
      }
    };
  }

  // Helper methods for real-time data collection
  private async getCurrentPower(facilityId: string): Promise<number> {
    // Query latest power reading from InfluxDB
    const query = `
      from(bucket: "vibelux_sensors")
        |> range(start: -1m)
        |> filter(fn: (r) => r["_measurement"] == "power" and r["facility_id"] == "${facilityId}")
        |> last()
    `;
    
    const result = await this.influxDB.query(query);
    return result?.[0]?.value || 0;
  }

  private async getDailyEnergyTotal(facilityId: string, dayStart: Date): Promise<number> {
    // Query energy consumption for the day
    const query = `
      from(bucket: "vibelux_sensors")
        |> range(start: ${dayStart.toISOString()})
        |> filter(fn: (r) => r["_measurement"] == "energy" and r["facility_id"] == "${facilityId}")
        |> sum()
    `;
    
    const result = await this.influxDB.query(query);
    return result?.[0]?.value || 0;
  }

  private async getPeakDemand(facilityId: string, dayStart: Date): Promise<number> {
    // Query peak power for the day
    const query = `
      from(bucket: "vibelux_sensors")
        |> range(start: ${dayStart.toISOString()})
        |> filter(fn: (r) => r["_measurement"] == "power" and r["facility_id"] == "${facilityId}")
        |> max()
    `;
    
    const result = await this.influxDB.query(query);
    return result?.[0]?.value || 0;
  }

  private async getPowerFactor(facilityId: string): Promise<number> {
    // Query latest power factor
    const query = `
      from(bucket: "vibelux_sensors")
        |> range(start: -5m)
        |> filter(fn: (r) => r["_measurement"] == "power_factor" and r["facility_id"] == "${facilityId}")
        |> last()
    `;
    
    const result = await this.influxDB.query(query);
    return result?.[0]?.value || 0.95;
  }
}