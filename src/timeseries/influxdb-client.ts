// InfluxDB 3 Client for Time-Series Data
// Real implementation for sensor data storage and retrieval

export interface SensorDataPoint {
  measurement: string;
  tags: Record<string, string>;
  fields: Record<string, number | string | boolean>;
  timestamp?: Date;
}

export interface QueryOptions {
  bucket: string;
  measurement: string;
  start: Date | string;
  end?: Date | string;
  filters?: Record<string, string>;
  aggregation?: {
    window: string;
    fn: 'mean' | 'max' | 'min' | 'sum' | 'count';
  };
}

class TimeSeriesDB {
  private baseUrl: string;
  private database: string;
  private authToken?: string;
  
  constructor() {
    this.baseUrl = process.env.INFLUXDB_URL || 'http://localhost:8086';
    this.database = process.env.INFLUXDB_DATABASE || 'vibelux_sensors';
    this.authToken = process.env.INFLUXDB_TOKEN;
  }

  // Initialize connection
  async connect(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error('InfluxDB connection failed');
      }
    } catch (error) {
      console.error('Failed to connect to InfluxDB:', error);
      throw error;
    }
  }

  // Write sensor data
  async writeSensorData(data: SensorDataPoint): Promise<void> {
    const { measurement, tags, fields, timestamp = new Date() } = data;
    
    // Build SQL INSERT statement for InfluxDB 3
    const tagColumns = Object.keys(tags).join(', ');
    const tagValues = Object.values(tags).map(v => `'${v}'`).join(', ');
    
    const fieldColumns = Object.keys(fields).join(', ');
    const fieldValues = Object.values(fields).map(v => 
      typeof v === 'string' ? `'${v}'` : v
    ).join(', ');
    
    const sql = `
      INSERT INTO ${this.database}.${measurement} 
      (time, ${tagColumns}, ${fieldColumns})
      VALUES ('${timestamp.toISOString()}', ${tagValues}, ${fieldValues})
    `;

    try {
      const response = await fetch(`${this.baseUrl}/api/v3/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
        },
        body: JSON.stringify({
          database: this.database,
          sql: sql
        })
      });

      if (!response.ok) {
        throw new Error(`Write failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to write to InfluxDB:', error);
      throw error;
    }
  }

  // Batch write for multiple data points
  async writeBatch(dataPoints: SensorDataPoint[]): Promise<void> {
    // Group by measurement for efficient batch inserts
    const grouped = dataPoints.reduce((acc, point) => {
      if (!acc[point.measurement]) {
        acc[point.measurement] = [];
      }
      acc[point.measurement].push(point);
      return acc;
    }, {} as Record<string, SensorDataPoint[]>);

    const promises = Object.entries(grouped).map(([measurement, points]) => {
      return this.writeBatchForMeasurement(measurement, points);
    });

    await Promise.all(promises);
  }

  private async writeBatchForMeasurement(
    measurement: string, 
    points: SensorDataPoint[]
  ): Promise<void> {
    if (points.length === 0) return;

    // Get column names from first point
    const firstPoint = points[0];
    const tagColumns = Object.keys(firstPoint.tags);
    const fieldColumns = Object.keys(firstPoint.fields);
    
    const columns = ['time', ...tagColumns, ...fieldColumns].join(', ');
    
    const values = points.map(point => {
      const timestamp = (point.timestamp || new Date()).toISOString();
      const tagValues = tagColumns.map(col => `'${point.tags[col]}'`);
      const fieldValues = fieldColumns.map(col => {
        const value = point.fields[col];
        return typeof value === 'string' ? `'${value}'` : value;
      });
      
      return `('${timestamp}', ${[...tagValues, ...fieldValues].join(', ')})`;
    }).join(', ');

    const sql = `
      INSERT INTO ${this.database}.${measurement} (${columns})
      VALUES ${values}
    `;

    await this.executeQuery(sql);
  }

  // Query sensor data
  async query(options: QueryOptions): Promise<any[]> {
    const { measurement, start, end, filters, aggregation } = options;
    
    let sql = `SELECT * FROM ${this.database}.${measurement}`;
    
    // Build WHERE clause
    const conditions: string[] = [
      `time >= '${start instanceof Date ? start.toISOString() : start}'`
    ];
    
    if (end) {
      conditions.push(`time <= '${end instanceof Date ? end.toISOString() : end}'`);
    }
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        conditions.push(`${key} = '${value}'`);
      });
    }
    
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Add aggregation if specified
    if (aggregation) {
      sql = `
        SELECT 
          DATE_BIN(INTERVAL '${aggregation.window}', time) AS time,
          ${aggregation.fn}(value) AS value,
          room_id,
          sensor_id
        FROM ${this.database}.${measurement}
        WHERE ${conditions.join(' AND ')}
        GROUP BY DATE_BIN(INTERVAL '${aggregation.window}', time), room_id, sensor_id
        ORDER BY time
      `;
    } else {
      sql += ' ORDER BY time DESC LIMIT 1000';
    }

    return await this.executeQuery(sql);
  }

  // Execute raw SQL query
  private async executeQuery(sql: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v3/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
        },
        body: JSON.stringify({
          database: this.database,
          sql: sql
        })
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Query execution failed:', error);
      return [];
    }
  }

  // Get latest sensor reading
  async getLatestReading(
    measurement: string,
    roomId: string,
    sensorId?: string
  ): Promise<any | null> {
    let sql = `
      SELECT * FROM ${this.database}.${measurement}
      WHERE room_id = '${roomId}'
    `;
    
    if (sensorId) {
      sql += ` AND sensor_id = '${sensorId}'`;
    }
    
    sql += ' ORDER BY time DESC LIMIT 1';
    
    const results = await this.executeQuery(sql);
    return results[0] || null;
  }

  // Get aggregated data
  async getAggregatedData(
    measurement: string,
    roomId: string,
    interval: string,
    duration: string
  ): Promise<any[]> {
    const sql = `
      SELECT 
        DATE_BIN(INTERVAL '${interval}', time) AS time,
        AVG(value) AS avg_value,
        MIN(value) AS min_value,
        MAX(value) AS max_value,
        COUNT(value) AS count
      FROM ${this.database}.${measurement}
      WHERE room_id = '${roomId}'
        AND time >= NOW() - INTERVAL '${duration}'
      GROUP BY DATE_BIN(INTERVAL '${interval}', time)
      ORDER BY time
    `;
    
    return await this.executeQuery(sql);
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Create continuous query for automatic aggregation
  async createContinuousQuery(
    name: string,
    sourceTable: string,
    destinationTable: string,
    interval: string
  ): Promise<void> {
    const sql = `
      CREATE MATERIALIZED VIEW ${name} AS
      SELECT 
        DATE_BIN(INTERVAL '${interval}', time) AS time,
        room_id,
        metric,
        AVG(value) AS avg_value,
        MIN(value) AS min_value,
        MAX(value) AS max_value,
        COUNT(value) AS count
      FROM ${this.database}.${sourceTable}
      GROUP BY DATE_BIN(INTERVAL '${interval}', time), room_id, metric
    `;
    
    await this.executeQuery(sql);
  }
}

// Export singleton instance
let tsdbInstance: TimeSeriesDB | null = null;

export function getTimeSeriesDB(): TimeSeriesDB {
  if (!tsdbInstance) {
    tsdbInstance = new TimeSeriesDB();
  }
  return tsdbInstance;
}

// Helper function to record sensor readings
export async function recordSensorReading(
  roomId: string,
  sensorId: string,
  type: string,
  value: number,
  unit: string = '',
  quality: number = 100
): Promise<void> {
  const tsdb = getTimeSeriesDB();
  
  await tsdb.writeSensorData({
    measurement: type,
    tags: {
      room_id: roomId,
      sensor_id: sensorId
    },
    fields: {
      value,
      unit,
      quality
    }
  });
}

// Helper function to get sensor history
export async function getSensorHistory(
  roomId: string,
  sensorType: string,
  hours: number = 24
): Promise<any[]> {
  const tsdb = getTimeSeriesDB();
  
  return await tsdb.query({
    bucket: 'vibelux_sensors',
    measurement: sensorType,
    start: new Date(Date.now() - hours * 60 * 60 * 1000),
    filters: { room_id: roomId }
  });
}