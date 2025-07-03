// InfluxDB integration for time-series data (sensor readings, tracking, performance metrics)
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';

interface TimeseriesConfig {
  url: string;
  token: string;
  org: string;
  bucket: string;
}

interface MetricPoint {
  measurement: string;
  tags: Record<string, string>;
  fields: Record<string, number | string | boolean>;
  timestamp?: Date;
}

export class TimeseriesDatabase {
  private client: InfluxDB;
  private writeApi: WriteApi;
  private bucket: string;

  constructor(config: TimeseriesConfig) {
    this.client = new InfluxDB({
      url: config.url,
      token: config.token
    });
    this.writeApi = this.client.getWriteApi(config.org, config.bucket);
    this.bucket = config.bucket;
  }

  /**
   * Write location tracking data
   */
  async writeLocationData(data: {
    userId: string;
    facilityId: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    battery: number;
    timestamp?: Date;
  }): Promise<void> {
    const point = new Point('location_tracking')
      .tag('user_id', data.userId)
      .tag('facility_id', data.facilityId)
      .floatField('latitude', data.latitude)
      .floatField('longitude', data.longitude)
      .floatField('accuracy', data.accuracy)
      .floatField('battery_level', data.battery)
      .timestamp(data.timestamp || new Date());

    this.writeApi.writePoint(point);
  }

  /**
   * Write environmental sensor data
   */
  async writeEnvironmentalData(data: {
    facilityId: string;
    zoneId: string;
    sensorId: string;
    temperature: number;
    humidity: number;
    co2: number;
    vpd: number;
    lightLevel: number;
    timestamp?: Date;
  }): Promise<void> {
    const point = new Point('environmental_data')
      .tag('facility_id', data.facilityId)
      .tag('zone_id', data.zoneId)
      .tag('sensor_id', data.sensorId)
      .floatField('temperature', data.temperature)
      .floatField('humidity', data.humidity)
      .floatField('co2', data.co2)
      .floatField('vpd', data.vpd)
      .floatField('light_level', data.lightLevel)
      .timestamp(data.timestamp || new Date());

    this.writeApi.writePoint(point);
  }

  /**
   * Write worker performance metrics
   */
  async writePerformanceMetrics(data: {
    userId: string;
    facilityId: string;
    taskType: string;
    duration: number;
    completionRate: number;
    qualityScore: number;
    timestamp?: Date;
  }): Promise<void> {
    const point = new Point('worker_performance')
      .tag('user_id', data.userId)
      .tag('facility_id', data.facilityId)
      .tag('task_type', data.taskType)
      .intField('duration_minutes', data.duration)
      .floatField('completion_rate', data.completionRate)
      .floatField('quality_score', data.qualityScore)
      .timestamp(data.timestamp || new Date());

    this.writeApi.writePoint(point);
  }

  /**
   * Write harvest yield data
   */
  async writeHarvestData(data: {
    facilityId: string;
    batchId: string;
    strain: string;
    actualYield: number;
    estimatedYield: number;
    plantCount: number;
    harvestDuration: number;
    timestamp?: Date;
  }): Promise<void> {
    const point = new Point('harvest_metrics')
      .tag('facility_id', data.facilityId)
      .tag('batch_id', data.batchId)
      .tag('strain', data.strain)
      .floatField('actual_yield', data.actualYield)
      .floatField('estimated_yield', data.estimatedYield)
      .intField('plant_count', data.plantCount)
      .intField('harvest_duration_hours', data.harvestDuration)
      .floatField('yield_per_plant', data.actualYield / data.plantCount)
      .floatField('yield_variance', ((data.actualYield - data.estimatedYield) / data.estimatedYield) * 100)
      .timestamp(data.timestamp || new Date());

    this.writeApi.writePoint(point);
  }

  /**
   * Write equipment utilization data
   */
  async writeEquipmentData(data: {
    facilityId: string;
    equipmentId: string;
    equipmentType: string;
    status: string;
    utilizationRate: number;
    maintenanceScore: number;
    timestamp?: Date;
  }): Promise<void> {
    const point = new Point('equipment_metrics')
      .tag('facility_id', data.facilityId)
      .tag('equipment_id', data.equipmentId)
      .tag('equipment_type', data.equipmentType)
      .tag('status', data.status)
      .floatField('utilization_rate', data.utilizationRate)
      .floatField('maintenance_score', data.maintenanceScore)
      .timestamp(data.timestamp || new Date());

    this.writeApi.writePoint(point);
  }

  /**
   * Flush all pending writes
   */
  async flush(): Promise<void> {
    await this.writeApi.flush();
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    await this.writeApi.close();
  }

  /**
   * Query time-series data
   */
  async query(fluxQuery: string): Promise<any[]> {
    const queryApi = this.client.getQueryApi(process.env.INFLUXDB_ORG!);
    const results: any[] = [];

    return new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row: string[], tableMeta: any) {
          const o = tableMeta.toObject(row);
          results.push(o);
        },
        error(error: Error) {
          reject(error);
        },
        complete() {
          resolve(results);
        },
      });
    });
  }

  /**
   * Get worker location history
   */
  async getLocationHistory(userId: string, hours: number = 24): Promise<any[]> {
    const query = `
      from(bucket: "${this.bucket}")
        |> range(start: -${hours}h)
        |> filter(fn: (r) => r._measurement == "location_tracking")
        |> filter(fn: (r) => r.user_id == "${userId}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;
    return this.query(query);
  }

  /**
   * Get environmental trends
   */
  async getEnvironmentalTrends(facilityId: string, zoneId: string, hours: number = 24): Promise<any[]> {
    const query = `
      from(bucket: "${this.bucket}")
        |> range(start: -${hours}h)
        |> filter(fn: (r) => r._measurement == "environmental_data")
        |> filter(fn: (r) => r.facility_id == "${facilityId}")
        |> filter(fn: (r) => r.zone_id == "${zoneId}")
        |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;
    return this.query(query);
  }

  /**
   * Get worker performance trends
   */
  async getPerformanceTrends(userId: string, days: number = 7): Promise<any[]> {
    const query = `
      from(bucket: "${this.bucket}")
        |> range(start: -${days}d)
        |> filter(fn: (r) => r._measurement == "worker_performance")
        |> filter(fn: (r) => r.user_id == "${userId}")
        |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;
    return this.query(query);
  }
}

// Create a lazy-loaded singleton instance
let timeseriesDBInstance: TimeseriesDatabase | null = null;

export function getTimeseriesDB(): TimeseriesDatabase {
  if (!timeseriesDBInstance) {
    timeseriesDBInstance = new TimeseriesDatabase({
      url: process.env.INFLUXDB_URL || 'http://localhost:8086',
      token: process.env.INFLUXDB_TOKEN || '',
      org: process.env.INFLUXDB_ORG || 'vibelux',
      bucket: process.env.INFLUXDB_BUCKET || 'greenhouse_data'
    });
  }
  return timeseriesDBInstance;
}

// For backward compatibility - lazy proxy
export const timeseriesDB = new Proxy({} as TimeseriesDatabase, {
  get(target, prop) {
    const db = getTimeseriesDB();
    return (db as any)[prop];
  }
});

// Helper function to write metrics from various components
export async function writeMetric(metric: MetricPoint): Promise<void> {
  const point = new Point(metric.measurement);
  
  // Add tags
  Object.entries(metric.tags).forEach(([key, value]) => {
    point.tag(key, value);
  });
  
  // Add fields
  Object.entries(metric.fields).forEach(([key, value]) => {
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        point.intField(key, value);
      } else {
        point.floatField(key, value);
      }
    } else if (typeof value === 'boolean') {
      point.booleanField(key, value);
    } else {
      point.stringField(key, String(value));
    }
  });
  
  if (metric.timestamp) {
    point.timestamp(metric.timestamp);
  }
  
  timeseriesDB['writeApi'].writePoint(point);
}