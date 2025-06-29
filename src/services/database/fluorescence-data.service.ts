import { prisma } from '@/lib/prisma';
import { PAMReading } from '../sensors/pam-fluorometer.service';

export interface FluorescenceRecord {
  id: string;
  userId: string;
  projectId?: string;
  plantId: string;
  timestamp: Date;
  parameters: PAMReading;
  protocolName?: string;
  experimentId?: string;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FluorescenceQuery {
  userId?: string;
  projectId?: string;
  plantId?: string;
  experimentId?: string;
  startDate?: Date;
  endDate?: Date;
  protocolName?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  orderBy?: 'timestamp' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

export interface FluorescenceStats {
  count: number;
  avgFvFm: number;
  minFvFm: number;
  maxFvFm: number;
  avgPhi2: number;
  avgNPQ: number;
  avgETR: number;
  stressedReadings: number;
  healthyReadings: number;
  criticalReadings: number;
}

export class FluorescenceDataService {
  // Save single fluorescence reading
  async saveReading(
    userId: string,
    reading: PAMReading,
    metadata: {
      projectId?: string;
      plantId: string;
      protocolName?: string;
      experimentId?: string;
      notes?: string;
      tags?: string[];
    }
  ): Promise<FluorescenceRecord> {
    try {
      const record = await prisma.usageRecord.create({
        data: {
          userId,
          feature: 'fluorescence-measurement',
          action: 'record',
          metadata: {
            ...metadata,
            parameters: reading,
            timestamp: reading.timestamp.toISOString()
          }
        }
      });

      // Check for stress conditions and create alerts
      await this.checkStressConditions(userId, reading, metadata.plantId);

      return this.mapToFluorescenceRecord(record);
    } catch (error) {
      console.error('Failed to save fluorescence reading:', error);
      throw error;
    }
  }

  // Save batch of readings
  async saveBatch(
    userId: string,
    readings: Array<{
      reading: PAMReading;
      metadata: {
        projectId?: string;
        plantId: string;
        protocolName?: string;
        experimentId?: string;
      };
    }>
  ): Promise<FluorescenceRecord[]> {
    try {
      const records = await prisma.usageRecord.createMany({
        data: readings.map(({ reading, metadata }) => ({
          userId,
          feature: 'fluorescence-measurement',
          action: 'record',
          metadata: {
            ...metadata,
            parameters: reading,
            timestamp: reading.timestamp.toISOString()
          }
        }))
      });

      // Check stress conditions for all readings
      for (const { reading, metadata } of readings) {
        await this.checkStressConditions(userId, reading, metadata.plantId);
      }

      return readings.map((_, index) => ({
        id: `batch_${Date.now()}_${index}`,
        userId,
        ...readings[index].metadata,
        timestamp: readings[index].reading.timestamp,
        parameters: readings[index].reading,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    } catch (error) {
      console.error('Failed to save batch fluorescence readings:', error);
      throw error;
    }
  }

  // Query fluorescence data
  async queryReadings(query: FluorescenceQuery): Promise<{
    data: FluorescenceRecord[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const where: any = {
        feature: 'fluorescence-measurement'
      };

      if (query.userId) where.userId = query.userId;
      
      if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate) where.createdAt.gte = query.startDate;
        if (query.endDate) where.createdAt.lte = query.endDate;
      }

      // Filter by metadata fields
      if (query.projectId) {
        where.metadata = { ...where.metadata, path: ['projectId'], equals: query.projectId };
      }

      const [records, total] = await Promise.all([
        prisma.usageRecord.findMany({
          where,
          orderBy: { createdAt: query.orderDirection || 'desc' },
          skip: query.offset || 0,
          take: query.limit || 100
        }),
        prisma.usageRecord.count({ where })
      ]);

      const data = records.map(this.mapToFluorescenceRecord);
      
      // Additional filtering on metadata (since Prisma JSON queries are limited)
      let filteredData = data;
      
      if (query.plantId) {
        filteredData = filteredData.filter(r => r.plantId === query.plantId);
      }
      
      if (query.experimentId) {
        filteredData = filteredData.filter(r => r.experimentId === query.experimentId);
      }
      
      if (query.protocolName) {
        filteredData = filteredData.filter(r => r.protocolName === query.protocolName);
      }
      
      if (query.tags && query.tags.length > 0) {
        filteredData = filteredData.filter(r => 
          r.tags?.some(tag => query.tags?.includes(tag))
        );
      }

      return {
        data: filteredData,
        total: filteredData.length,
        hasMore: (query.offset || 0) + (query.limit || 100) < total
      };
    } catch (error) {
      console.error('Failed to query fluorescence data:', error);
      throw error;
    }
  }

  // Get statistics for a plant or experiment
  async getStatistics(params: {
    userId: string;
    plantId?: string;
    experimentId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<FluorescenceStats> {
    const { data } = await this.queryReadings({
      userId: params.userId,
      plantId: params.plantId,
      experimentId: params.experimentId,
      startDate: params.startDate,
      endDate: params.endDate,
      limit: 10000 // Get all readings for stats
    });

    if (data.length === 0) {
      return {
        count: 0,
        avgFvFm: 0,
        minFvFm: 0,
        maxFvFm: 0,
        avgPhi2: 0,
        avgNPQ: 0,
        avgETR: 0,
        stressedReadings: 0,
        healthyReadings: 0,
        criticalReadings: 0
      };
    }

    const fvFmValues = data.map(r => r.parameters.fvFm);
    const phi2Values = data.map(r => r.parameters.phi2);
    const npqValues = data.map(r => r.parameters.npq);
    const etrValues = data.map(r => r.parameters.etr);

    // Count stress levels
    let healthyCount = 0;
    let stressedCount = 0;
    let criticalCount = 0;

    data.forEach(record => {
      const fvFm = record.parameters.fvFm;
      if (fvFm >= 0.75) {
        healthyCount++;
      } else if (fvFm >= 0.60) {
        stressedCount++;
      } else {
        criticalCount++;
      }
    });

    return {
      count: data.length,
      avgFvFm: this.average(fvFmValues),
      minFvFm: Math.min(...fvFmValues),
      maxFvFm: Math.max(...fvFmValues),
      avgPhi2: this.average(phi2Values),
      avgNPQ: this.average(npqValues),
      avgETR: this.average(etrValues),
      stressedReadings: stressedCount,
      healthyReadings: healthyCount,
      criticalReadings: criticalCount
    };
  }

  // Get plant health history
  async getPlantHealthHistory(
    userId: string,
    plantId: string,
    days: number = 30
  ): Promise<Array<{
    date: string;
    avgFvFm: number;
    avgPhi2: number;
    avgNPQ: number;
    readingCount: number;
    healthStatus: 'healthy' | 'stressed' | 'critical';
  }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data } = await this.queryReadings({
      userId,
      plantId,
      startDate,
      orderBy: 'timestamp',
      orderDirection: 'asc'
    });

    // Group by date
    const groupedByDate = data.reduce((acc, record) => {
      const date = record.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {} as Record<string, FluorescenceRecord[]>);

    // Calculate daily averages
    return Object.entries(groupedByDate).map(([date, records]) => {
      const avgFvFm = this.average(records.map(r => r.parameters.fvFm));
      const avgPhi2 = this.average(records.map(r => r.parameters.phi2));
      const avgNPQ = this.average(records.map(r => r.parameters.npq));

      let healthStatus: 'healthy' | 'stressed' | 'critical' = 'healthy';
      if (avgFvFm < 0.60) {
        healthStatus = 'critical';
      } else if (avgFvFm < 0.75) {
        healthStatus = 'stressed';
      }

      return {
        date,
        avgFvFm,
        avgPhi2,
        avgNPQ,
        readingCount: records.length,
        healthStatus
      };
    });
  }

  // Delete old data
  async deleteOldData(userId: string, daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.usageRecord.deleteMany({
      where: {
        userId,
        feature: 'fluorescence-measurement',
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    return result.count;
  }

  // Export data
  async exportData(
    query: FluorescenceQuery,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const { data } = await this.queryReadings({
      ...query,
      limit: 10000 // Export up to 10k records
    });

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // CSV format
    const headers = [
      'timestamp',
      'plantId',
      'protocolName',
      'f0',
      'fm',
      'fv',
      'fvFm',
      'phi2',
      'npq',
      'etr',
      'qP',
      'lightIntensity',
      'temperature',
      'notes'
    ];

    const rows = data.map(record => [
      record.timestamp.toISOString(),
      record.plantId,
      record.protocolName || '',
      record.parameters.f0,
      record.parameters.fm,
      record.parameters.fv,
      record.parameters.fvFm,
      record.parameters.phi2,
      record.parameters.npq,
      record.parameters.etr,
      record.parameters.qP,
      record.parameters.metadata?.lightIntensity || '',
      record.parameters.metadata?.temperature || '',
      record.notes || ''
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // Private helper methods
  private mapToFluorescenceRecord(record: any): FluorescenceRecord {
    const metadata = record.metadata as any;
    return {
      id: record.id,
      userId: record.userId,
      projectId: metadata.projectId,
      plantId: metadata.plantId,
      timestamp: new Date(metadata.timestamp),
      parameters: {
        ...metadata.parameters,
        timestamp: new Date(metadata.parameters.timestamp)
      },
      protocolName: metadata.protocolName,
      experimentId: metadata.experimentId,
      notes: metadata.notes,
      tags: metadata.tags,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  private async checkStressConditions(
    userId: string,
    reading: PAMReading,
    plantId: string
  ): Promise<void> {
    const thresholds = {
      fvFm: { healthy: 0.75, critical: 0.60 },
      phi2: { healthy: 0.60, critical: 0.40 },
      npq: { warning: 2.0, critical: 3.0 }
    };

    const alerts = [];

    // Check Fv/Fm
    if (reading.fvFm < thresholds.fvFm.critical) {
      alerts.push({
        type: 'critical',
        parameter: 'Fv/Fm',
        value: reading.fvFm,
        threshold: thresholds.fvFm.critical,
        message: `Critical stress detected: Fv/Fm = ${reading.fvFm.toFixed(3)}`
      });
    } else if (reading.fvFm < thresholds.fvFm.healthy) {
      alerts.push({
        type: 'warning',
        parameter: 'Fv/Fm',
        value: reading.fvFm,
        threshold: thresholds.fvFm.healthy,
        message: `Moderate stress detected: Fv/Fm = ${reading.fvFm.toFixed(3)}`
      });
    }

    // Check ΦPSII
    if (reading.phi2 < thresholds.phi2.critical) {
      alerts.push({
        type: 'critical',
        parameter: 'ΦPSII',
        value: reading.phi2,
        threshold: thresholds.phi2.critical,
        message: `Low photosynthetic efficiency: ΦPSII = ${reading.phi2.toFixed(3)}`
      });
    }

    // Check NPQ
    if (reading.npq > thresholds.npq.critical) {
      alerts.push({
        type: 'critical',
        parameter: 'NPQ',
        value: reading.npq,
        threshold: thresholds.npq.critical,
        message: `High photoprotection stress: NPQ = ${reading.npq.toFixed(2)}`
      });
    }

    // Save alerts
    for (const alert of alerts) {
      await prisma.usageRecord.create({
        data: {
          userId,
          feature: 'alert',
          action: 'fluorescence-stress',
          metadata: {
            plantId,
            ...alert,
            timestamp: reading.timestamp.toISOString()
          }
        }
      });
    }
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
}

// Singleton instance
export const fluorescenceDataService = new FluorescenceDataService();