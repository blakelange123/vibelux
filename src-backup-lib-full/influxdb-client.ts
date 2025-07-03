/**
 * InfluxDB Client for Sensor Data
 * Handles time-series data for environmental sensors, lighting metrics, and system telemetry
 */

import { InfluxDB, Point, WriteApi, QueryApi } from '@influxdata/influxdb-client'
import { env } from '@/lib/env-validator'

export interface SensorReading {
  measurement: string
  tags: Record<string, string>
  fields: Record<string, number | string | boolean>
  timestamp?: Date
}

export interface QueryOptions {
  start?: string | Date
  stop?: string | Date
  limit?: number
  aggregateWindow?: string
  aggregateFn?: 'mean' | 'max' | 'min' | 'sum' | 'count'
}

class InfluxDBClient {
  private static instance: InfluxDBClient
  private client: InfluxDB | null = null
  private writeApi: WriteApi | null = null
  private queryApi: QueryApi | null = null
  private isConnected = false

  private constructor() {}

  static getInstance(): InfluxDBClient {
    if (!InfluxDBClient.instance) {
      InfluxDBClient.instance = new InfluxDBClient()
    }
    return InfluxDBClient.instance
  }

  /**
   * Initialize connection to InfluxDB
   */
  async connect(): Promise<boolean> {
    try {
      const url = env.get('INFLUXDB_URL')
      const token = env.get('INFLUXDB_TOKEN')
      const org = env.get('INFLUXDB_ORG')
      const bucket = env.get('INFLUXDB_BUCKET')

      if (!url || !token || !org || !bucket) {
        console.warn('InfluxDB configuration incomplete, using PostgreSQL for time-series data')
        return false
      }

      this.client = new InfluxDB({
        url,
        token,
        timeout: 10000, // 10 second timeout
      })

      // Test connection
      await this.testConnection()

      this.writeApi = this.client.getWriteApi(org, bucket, 'ms')
      this.queryApi = this.client.getQueryApi(org)

      // Configure write options
      this.writeApi.useDefaultTags({
        application: 'vibelux',
        version: '1.0.0'
      })

      this.isConnected = true
      return true

    } catch (error) {
      console.error('❌ InfluxDB connection failed:', error)
      this.isConnected = false
      return false
    }
  }

  /**
   * Test InfluxDB connection
   */
  private async testConnection(): Promise<void> {
    if (!this.client) throw new Error('InfluxDB client not initialized')

    const org = env.get('INFLUXDB_ORG')
    const health = await this.client.health()
    
    if (health.status !== 'pass') {
      throw new Error(`InfluxDB health check failed: ${health.status}`)
    }

    // Test org access
    const orgsAPI = this.client.getOrgsAPI()
    const orgs = await orgsAPI.getOrgs({ org })
    
    if (!orgs.orgs || orgs.orgs.length === 0) {
      throw new Error(`Organization '${org}' not found`)
    }
  }

  /**
   * Write sensor data to InfluxDB
   */
  async writeSensorData(readings: SensorReading[]): Promise<boolean> {
    if (!this.isConnected || !this.writeApi) {
      console.warn('InfluxDB not connected, skipping write')
      return false
    }

    try {
      const points = readings.map(reading => {
        const point = new Point(reading.measurement)
        
        // Add tags
        Object.entries(reading.tags).forEach(([key, value]) => {
          point.tag(key, value)
        })
        
        // Add fields
        Object.entries(reading.fields).forEach(([key, value]) => {
          if (typeof value === 'number') {
            point.floatField(key, value)
          } else if (typeof value === 'boolean') {
            point.booleanField(key, value)
          } else {
            point.stringField(key, String(value))
          }
        })
        
        // Set timestamp
        if (reading.timestamp) {
          point.timestamp(reading.timestamp)
        }
        
        return point
      })

      // Write points
      this.writeApi.writePoints(points)
      await this.writeApi.flush()
      
      return true

    } catch (error) {
      console.error('Error writing to InfluxDB:', error)
      return false
    }
  }

  /**
   * Query sensor data from InfluxDB
   */
  async querySensorData(
    measurement: string,
    options: QueryOptions = {}
  ): Promise<any[]> {
    if (!this.isConnected || !this.queryApi) {
      console.warn('InfluxDB not connected, returning empty data')
      return []
    }

    try {
      const bucket = env.get('INFLUXDB_BUCKET')
      const start = options.start || '-1h'
      const stop = options.stop || 'now()'
      const limit = options.limit || 1000

      let query = `
        from(bucket: "${bucket}")
          |> range(start: ${typeof start === 'string' ? start : start.toISOString()}, 
                   stop: ${typeof stop === 'string' ? stop : stop.toISOString()})
          |> filter(fn: (r) => r._measurement == "${measurement}")
      `

      if (options.aggregateWindow && options.aggregateFn) {
        query += `
          |> aggregateWindow(every: ${options.aggregateWindow}, fn: ${options.aggregateFn}, createEmpty: false)
        `
      }

      query += `
          |> limit(n: ${limit})
          |> sort(columns: ["_time"], desc: true)
      `

      const results: any[] = []
      await new Promise((resolve, reject) => {
        this.queryApi!.queryRows(query, {
          next: (row: string[], tableMeta: any) => {
            const record = tableMeta.toObject(row)
            results.push({
              time: record._time,
              measurement: record._measurement,
              field: record._field,
              value: record._value,
              tags: Object.fromEntries(
                Object.entries(record).filter(([key]) => 
                  !key.startsWith('_') && key !== 'result' && key !== 'table'
                )
              )
            })
          },
          error: reject,
          complete: resolve
        })
      })

      return results

    } catch (error) {
      console.error('Error querying InfluxDB:', error)
      return []
    }
  }

  /**
   * Write environmental sensor data
   */
  async writeEnvironmentalData(data: {
    deviceId: string
    location: string
    temperature?: number
    humidity?: number
    co2?: number
    light?: number
    ph?: number
    ec?: number
    vpd?: number
  }): Promise<boolean> {
    const reading: SensorReading = {
      measurement: 'environment',
      tags: {
        device_id: data.deviceId,
        location: data.location,
        sensor_type: 'environmental'
      },
      fields: {}
    }

    // Add available fields
    if (data.temperature !== undefined) reading.fields.temperature = data.temperature
    if (data.humidity !== undefined) reading.fields.humidity = data.humidity
    if (data.co2 !== undefined) reading.fields.co2 = data.co2
    if (data.light !== undefined) reading.fields.light_intensity = data.light
    if (data.ph !== undefined) reading.fields.ph = data.ph
    if (data.ec !== undefined) reading.fields.ec = data.ec
    if (data.vpd !== undefined) reading.fields.vpd = data.vpd

    return this.writeSensorData([reading])
  }

  /**
   * Write lighting system data
   */
  async writeLightingData(data: {
    fixtureId: string
    zone: string
    ppfd?: number
    dli?: number
    powerConsumption?: number
    efficiency?: number
    temperature?: number
    dimLevel?: number
    spectrum?: Record<string, number>
  }): Promise<boolean> {
    const readings: SensorReading[] = [
      {
        measurement: 'lighting',
        tags: {
          fixture_id: data.fixtureId,
          zone: data.zone,
          sensor_type: 'lighting'
        },
        fields: {
          ...(data.ppfd !== undefined && { ppfd: data.ppfd }),
          ...(data.dli !== undefined && { dli: data.dli }),
          ...(data.powerConsumption !== undefined && { power_consumption: data.powerConsumption }),
          ...(data.efficiency !== undefined && { efficiency: data.efficiency }),
          ...(data.temperature !== undefined && { fixture_temperature: data.temperature }),
          ...(data.dimLevel !== undefined && { dim_level: data.dimLevel })
        }
      }
    ]

    // Add spectrum data as separate reading if provided
    if (data.spectrum) {
      readings.push({
        measurement: 'spectrum',
        tags: {
          fixture_id: data.fixtureId,
          zone: data.zone,
          sensor_type: 'spectrum'
        },
        fields: data.spectrum
      })
    }

    return this.writeSensorData(readings)
  }

  /**
   * Get recent environmental data
   */
  async getRecentEnvironmentalData(
    deviceId?: string,
    hours: number = 24
  ): Promise<any[]> {
    return this.querySensorData('environment', {
      start: `-${hours}h`,
      aggregateWindow: '5m',
      aggregateFn: 'mean'
    })
  }

  /**
   * Get recent lighting data
   */
  async getRecentLightingData(
    fixtureId?: string,
    hours: number = 24
  ): Promise<any[]> {
    return this.querySensorData('lighting', {
      start: `-${hours}h`,
      aggregateWindow: '5m',
      aggregateFn: 'mean'
    })
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    if (this.writeApi) {
      await this.writeApi.close()
    }
    if (this.client) {
      this.client.close()
    }
    this.isConnected = false
  }

  /**
   * Check if connected
   */
  isReady(): boolean {
    return this.isConnected
  }
}

// Export singleton instance
export const influxClient = InfluxDBClient.getInstance()

// Auto-connect on import
influxClient.connect().catch(console.error)

export default influxClient