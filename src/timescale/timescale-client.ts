import { Pool, PoolClient, PoolConfig } from 'pg';
import { TimeSeriesData } from '../../services/data-architecture-service';

export interface TimescaleConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  maxConnections?: number;
}

export interface ContinuousAggregateConfig {
  viewName: string;
  selectQuery: string;
  timeInterval: string;
  refreshPolicy?: {
    startOffset: string;
    endOffset: string;
    scheduleInterval: string;
  };
}

export interface CompressionPolicy {
  tableName: string;
  compressAfter: string;
  segmentBy?: string;
  orderBy?: string;
}

export class TimescaleClient {
  private pool: Pool;
  private config: TimescaleConfig;

  constructor(config: TimescaleConfig) {
    this.config = config;
    
    const poolConfig: PoolConfig = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl,
      max: config.maxConnections || 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(poolConfig);
  }

  async connect(): Promise<void> {
    try {
      // Test connection
      const client = await this.pool.connect();
      
      // Enable TimescaleDB extension
      await client.query('CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;');
      
      client.release();
    } catch (error) {
      console.error('Failed to connect to TimescaleDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  // Create hypertable with optimal settings
  async createHypertable(
    tableName: string,
    timeColumn: string = 'timestamp',
    partitionColumn?: string,
    chunkTimeInterval: string = '1 day'
  ): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Create hypertable
      let hypertableQuery = `
        SELECT create_hypertable(
          '${tableName}', 
          '${timeColumn}',
          chunk_time_interval => INTERVAL '${chunkTimeInterval}'
      `;
      
      if (partitionColumn) {
        hypertableQuery += `, partitioning_column => '${partitionColumn}'`;
      }
      
      hypertableQuery += ');';
      
      await client.query(hypertableQuery);
      
      // Set up automatic compression
      await this.setupCompression(tableName, chunkTimeInterval);
      
    } finally {
      client.release();
    }
  }

  // Advanced compression setup
  async setupCompression(
    tableName: string,
    compressAfter: string = '7 days',
    segmentBy?: string,
    orderBy?: string
  ): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Enable compression
      let compressionQuery = `
        ALTER TABLE ${tableName} SET (
          timescaledb.compress = true
      `;
      
      if (segmentBy) {
        compressionQuery += `, timescaledb.compress_segmentby = '${segmentBy}'`;
      }
      
      if (orderBy) {
        compressionQuery += `, timescaledb.compress_orderby = '${orderBy}'`;
      }
      
      compressionQuery += ');';
      
      await client.query(compressionQuery);
      
      // Add compression policy
      await client.query(`
        SELECT add_compression_policy('${tableName}', INTERVAL '${compressAfter}');
      `);
      
    } finally {
      client.release();
    }
  }

  // Insert time-series data with optimized batching
  async insertTimeSeriesData(data: TimeSeriesData[]): Promise<void> {
    if (data.length === 0) return;

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Group data by measurement for batch insertion
      const groupedData = this.groupByMeasurement(data);
      
      for (const [measurement, records] of Object.entries(groupedData)) {
        await this.batchInsertMeasurement(client, measurement, records);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private groupByMeasurement(data: TimeSeriesData[]): Record<string, TimeSeriesData[]> {
    return data.reduce((groups, record) => {
      if (!groups[record.measurement]) {
        groups[record.measurement] = [];
      }
      groups[record.measurement].push(record);
      return groups;
    }, {} as Record<string, TimeSeriesData[]>);
  }

  private async batchInsertMeasurement(
    client: PoolClient,
    measurement: string,
    records: TimeSeriesData[]
  ): Promise<void> {
    // Ensure table exists
    await this.ensureTableExists(client, measurement, records[0]);
    
    // Build bulk insert query
    const values = records.map((record, index) => {
      const tagColumns = Object.keys(record.tags);
      const fieldColumns = Object.keys(record.fields);
      
      const tagValues = tagColumns.map(col => `$${index * (tagColumns.length + fieldColumns.length + 1) + tagColumns.indexOf(col) + 2}`);
      const fieldValues = fieldColumns.map(col => `$${index * (tagColumns.length + fieldColumns.length + 1) + tagColumns.length + fieldColumns.indexOf(col) + 2}`);
      
      return `($${index * (tagColumns.length + fieldColumns.length + 1) + 1}, ${tagValues.join(', ')}, ${fieldValues.join(', ')})`;
    });
    
    const tagColumns = Object.keys(records[0].tags);
    const fieldColumns = Object.keys(records[0].fields);
    const allColumns = ['timestamp', ...tagColumns, ...fieldColumns];
    
    const query = `
      INSERT INTO ${measurement} (${allColumns.join(', ')})
      VALUES ${values.join(', ')}
    `;
    
    // Flatten parameters
    const params = records.flatMap(record => [
      record.timestamp,
      ...Object.values(record.tags),
      ...Object.values(record.fields),
    ]);
    
    await client.query(query, params);
  }

  private async ensureTableExists(
    client: PoolClient,
    tableName: string,
    sampleRecord: TimeSeriesData
  ): Promise<void> {
    // Check if table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      );
    `, [tableName]);
    
    if (!tableExists.rows[0].exists) {
      // Create table with dynamic schema
      const tagColumns = Object.keys(sampleRecord.tags)
        .map(col => `${col} TEXT`)
        .join(', ');
      
      const fieldColumns = Object.keys(sampleRecord.fields)
        .map(col => `${col} DOUBLE PRECISION`)
        .join(', ');
      
      const createTableQuery = `
        CREATE TABLE ${tableName} (
          timestamp TIMESTAMPTZ NOT NULL,
          ${tagColumns ? tagColumns + ',' : ''}
          ${fieldColumns}
        );
      `;
      
      await client.query(createTableQuery);
      
      // Create hypertable
      await client.query(`
        SELECT create_hypertable('${tableName}', 'timestamp');
      `);
      
      // Create indexes for tags
      for (const tagColumn of Object.keys(sampleRecord.tags)) {
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_${tableName}_${tagColumn} 
          ON ${tableName} (${tagColumn}, timestamp);
        `);
      }
    }
  }

  // Create continuous aggregates for real-time analytics
  async createContinuousAggregate(config: ContinuousAggregateConfig): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Create continuous aggregate view
      await client.query(`
        CREATE MATERIALIZED VIEW ${config.viewName}
        WITH (timescaledb.continuous) AS
        ${config.selectQuery}
        WITH NO DATA;
      `);
      
      // Add refresh policy if specified
      if (config.refreshPolicy) {
        await client.query(`
          SELECT add_continuous_aggregate_policy(
            '${config.viewName}',
            start_offset => INTERVAL '${config.refreshPolicy.startOffset}',
            end_offset => INTERVAL '${config.refreshPolicy.endOffset}',
            schedule_interval => INTERVAL '${config.refreshPolicy.scheduleInterval}'
          );
        `);
      }
      
    } finally {
      client.release();
    }
  }

  // Get continuous aggregate data
  async getContinuousAggregates(
    viewName: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<any[]> {
    const client = await this.pool.connect();
    
    try {
      let query = `SELECT * FROM ${viewName}`;
      const params: any[] = [];
      
      if (timeRange) {
        query += ' WHERE timestamp >= $1 AND timestamp <= $2';
        params.push(timeRange.start, timeRange.end);
      }
      
      query += ' ORDER BY timestamp';
      
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Extract data for ELT pipelines
  async extractData(tables: string[]): Promise<any[]> {
    const client = await this.pool.connect();
    const results: any[] = [];
    
    try {
      for (const table of tables) {
        const result = await client.query(`
          SELECT * FROM ${table}
          WHERE timestamp >= NOW() - INTERVAL '1 hour'
          ORDER BY timestamp
        `);
        
        results.push({
          table,
          data: result.rows,
          extractedAt: new Date(),
        });
      }
      
      return results;
    } finally {
      client.release();
    }
  }

  // Advanced time-series queries
  async timeWeightedAverage(
    tableName: string,
    column: string,
    timeRange: { start: Date; end: Date },
    groupBy?: string
  ): Promise<any[]> {
    const client = await this.pool.connect();
    
    try {
      let query = `
        SELECT 
          ${groupBy ? `${groupBy},` : ''}
          time_weighted_average(
            ts_vector(timestamp, ${column})
          ) as twa
        FROM ${tableName}
        WHERE timestamp >= $1 AND timestamp <= $2
      `;
      
      if (groupBy) {
        query += ` GROUP BY ${groupBy}`;
      }
      
      const result = await client.query(query, [timeRange.start, timeRange.end]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Gap filling for missing data points
  async gapFill(
    tableName: string,
    column: string,
    interval: string,
    timeRange: { start: Date; end: Date },
    fillMethod: 'linear' | 'locf' | 'null' = 'linear'
  ): Promise<any[]> {
    const client = await this.pool.connect();
    
    try {
      let fillFunction = 'NULL';
      
      switch (fillMethod) {
        case 'linear':
          fillFunction = `interpolate(${column})`;
          break;
        case 'locf':
          fillFunction = `locf(${column})`;
          break;
      }
      
      const query = `
        SELECT 
          time_bucket_gapfill(INTERVAL '${interval}', timestamp) as timestamp,
          ${fillFunction} as ${column}
        FROM ${tableName}
        WHERE timestamp >= $1 AND timestamp <= $2
        GROUP BY 1
        ORDER BY 1;
      `;
      
      const result = await client.query(query, [timeRange.start, timeRange.end]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Data quality checks
  async runDataQualityChecks(): Promise<any> {
    const client = await this.pool.connect();
    
    try {
      const checks = [];
      
      // Check for duplicate timestamps
      const duplicateCheck = await client.query(`
        SELECT 
          schemaname,
          tablename,
          COUNT(*) as duplicate_count
        FROM (
          SELECT 
            schemaname,
            tablename,
            timestamp,
            COUNT(*) as cnt
          FROM information_schema.tables t
          JOIN pg_tables pt ON t.table_name = pt.tablename
          WHERE t.table_type = 'BASE TABLE'
          AND EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_name = t.table_name AND c.column_name = 'timestamp'
          )
          GROUP BY schemaname, tablename, timestamp
          HAVING COUNT(*) > 1
        ) duplicates
        GROUP BY schemaname, tablename;
      `);
      
      checks.push({
        name: 'duplicate_timestamps',
        result: duplicateCheck.rows,
        passed: duplicateCheck.rows.length === 0,
      });
      
      // Check for data freshness
      const freshnessCheck = await client.query(`
        SELECT 
          schemaname,
          tablename,
          MAX(timestamp) as latest_timestamp,
          NOW() - MAX(timestamp) as age
        FROM information_schema.tables t
        JOIN pg_tables pt ON t.table_name = pt.tablename
        WHERE t.table_type = 'BASE TABLE'
        AND EXISTS (
          SELECT 1 FROM information_schema.columns c
          WHERE c.table_name = t.table_name AND c.column_name = 'timestamp'
        )
        GROUP BY schemaname, tablename;
      `);
      
      checks.push({
        name: 'data_freshness',
        result: freshnessCheck.rows,
        passed: true, // Define your own freshness criteria
      });
      
      return {
        totalChecks: checks.length,
        passedChecks: checks.filter(c => c.passed).length,
        checks,
      };
    } finally {
      client.release();
    }
  }

  // Optimization utilities
  async optimizeTable(tableName: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Reorder chunks for better compression
      await client.query(`SELECT reorder_chunk(chunk) FROM show_chunks('${tableName}');`);
      
      // Update table statistics
      await client.query(`ANALYZE ${tableName};`);
      
    } finally {
      client.release();
    }
  }

  // Backup and restore utilities
  async createBackup(tableName: string, backupPath: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Use pg_dump for backup
      await client.query(`
        COPY (SELECT * FROM ${tableName}) 
        TO '${backupPath}' 
        WITH (FORMAT CSV, HEADER true);
      `);
      
    } finally {
      client.release();
    }
  }
}

// Utility functions for TimescaleDB operations
export class TimescaleUtils {
  static formatInterval(seconds: number): string {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  }

  static calculateChunkSize(expectedRowsPerDay: number, retentionDays: number): string {
    // Optimal chunk size calculation
    const totalRows = expectedRowsPerDay * retentionDays;
    
    if (totalRows < 1000000) return '1 day';
    if (totalRows < 10000000) return '7 days';
    return '30 days';
  }

  static generateCompressionPolicy(
    tableName: string,
    dataRetentionDays: number
  ): CompressionPolicy {
    const compressAfter = Math.max(1, Math.floor(dataRetentionDays * 0.1));
    
    return {
      tableName,
      compressAfter: `${compressAfter} days`,
      segmentBy: 'device_id', // Common segmentation column
      orderBy: 'timestamp DESC',
    };
  }
}