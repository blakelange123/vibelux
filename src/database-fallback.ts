/**
 * Database Fallback Handler
 * Provides PostgreSQL fallback for time-series data when InfluxDB is not available
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface TimeSeriesReading {
  measurement: string
  tags: Record<string, string>
  fields: Record<string, number | string | boolean>
  timestamp?: Date
}

/**
 * Store sensor data in PostgreSQL when InfluxDB is unavailable
 */
export async function storeSensorDataInPostgres(readings: TimeSeriesReading[]): Promise<boolean> {
  try {
    // Convert readings to PostgreSQL format
    const sensorDataRecords = readings.map(reading => ({
      measurement: reading.measurement,
      tags: reading.tags,
      fields: reading.fields,
      timestamp: reading.timestamp || new Date(),
      deviceId: reading.tags.device_id || 'unknown',
      facilityId: reading.tags.facility_id || null,
      zone: reading.tags.zone || null
    }))

    // Store in a generic sensor_data table
    // Note: You'll need to add this table to your Prisma schema
    await prisma.$executeRaw`
      INSERT INTO sensor_readings (measurement, tags, fields, timestamp, device_id, facility_id, zone)
      VALUES ${sensorDataRecords.map(record => 
        `('${record.measurement}', '${JSON.stringify(record.tags)}', '${JSON.stringify(record.fields)}', '${record.timestamp.toISOString()}', '${record.deviceId}', ${record.facilityId ? `'${record.facilityId}'` : 'NULL'}, ${record.zone ? `'${record.zone}'` : 'NULL'})`
      ).join(', ')}
    `

    return true
  } catch (error) {
    console.error('Error storing sensor data in PostgreSQL:', error)
    return false
  }
}

/**
 * Query sensor data from PostgreSQL
 */
export async function querySensorDataFromPostgres(
  measurement: string,
  deviceId?: string,
  startTime?: Date,
  endTime?: Date,
  limit: number = 1000
): Promise<any[]> {
  try {
    const whereConditions: string[] = [`measurement = '${measurement}'`]
    
    if (deviceId) {
      whereConditions.push(`device_id = '${deviceId}'`)
    }
    
    if (startTime) {
      whereConditions.push(`timestamp >= '${startTime.toISOString()}'`)
    }
    
    if (endTime) {
      whereConditions.push(`timestamp <= '${endTime.toISOString()}'`)
    }

    const results = await prisma.$queryRaw`
      SELECT * FROM sensor_readings 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY timestamp DESC 
      LIMIT ${limit}
    `

    return results as any[]
  } catch (error) {
    console.error('Error querying sensor data from PostgreSQL:', error)
    return []
  }
}

/**
 * Hybrid sensor data storage - tries InfluxDB first, falls back to PostgreSQL
 */
export async function storeHybridSensorData(readings: TimeSeriesReading[]): Promise<boolean> {
  // Try InfluxDB first
  try {
    const { influxClient } = await import('./influxdb-client')
    
    if (influxClient.isReady()) {
      const influxReadings = readings.map(reading => ({
        measurement: reading.measurement,
        tags: reading.tags,
        fields: reading.fields,
        timestamp: reading.timestamp
      }))
      
      const success = await influxClient.writeSensorData(influxReadings)
      if (success) {
        return true
      }
    }
  } catch (error) {
    console.warn('InfluxDB not available, falling back to PostgreSQL')
  }

  // Fallback to PostgreSQL
  return storeSensorDataInPostgres(readings)
}

/**
 * Get recent environmental data from either database
 */
export async function getRecentEnvironmentalData(
  deviceId?: string,
  hours: number = 24
): Promise<any[]> {
  try {
    const { influxClient } = await import('./influxdb-client')
    
    if (influxClient.isReady()) {
      return influxClient.getRecentEnvironmentalData(deviceId, hours)
    }
  } catch (error) {
    console.warn('InfluxDB not available, using PostgreSQL')
  }

  // Fallback to PostgreSQL
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000)
  return querySensorDataFromPostgres('environment', deviceId, startTime)
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<{
  postgres: boolean
  influxdb: boolean
  primary: string
}> {
  let postgresHealthy = false
  let influxdbHealthy = false

  // Check PostgreSQL
  try {
    await prisma.$queryRaw`SELECT 1`
    postgresHealthy = true
  } catch (error) {
    console.error('PostgreSQL health check failed:', error)
  }

  // Check InfluxDB
  try {
    const { influxClient } = await import('./influxdb-client')
    influxdbHealthy = influxClient.isReady()
  } catch (error) {
    console.error('InfluxDB health check failed:', error)
  }

  return {
    postgres: postgresHealthy,
    influxdb: influxdbHealthy,
    primary: influxdbHealthy ? 'influxdb' : 'postgres'
  }
}