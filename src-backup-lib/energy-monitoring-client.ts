// Client-safe version of energy monitoring types and interfaces
// This file contains only types and client-side logic, no server dependencies

export interface EnergyMeter {
  id: string;
  type: 'energy-meter';
  subType: 'main' | 'lighting' | 'hvac' | 'equipment' | 'sub-panel';
  utilityAccount?: string;
  ratedCapacity?: number;
  specifications: {
    accuracy: number;
    protocol: 'modbus' | 'bacnet' | 'mqtt' | 'api';
    pollingInterval: number;
  };
}

export interface EnergyReading {
  facilityId: string;
  deviceId: string;
  sensorType: 'energy-meter';
  timestamp: Date;
  metrics: {
    instantaneousPower: number;
    totalEnergy: number;
    powerFactor: number;
    voltage: number;
    current: number;
    frequency: number;
    peakDemand?: number;
    reactiveEnergy?: number;
  };
  cost?: {
    rate: number;
    demandCharge?: number;
    timeOfUse?: string;
  };
}

export interface EnergySavingsVerification {
  facilityId: string;
  baselinePeriod: {
    start: Date;
    end: Date;
    avgDailyKWh: number;
    avgPeakDemand: number;
    totalCost: number;
    weatherNormalized: boolean;
  };
  currentPeriod: {
    start: Date;
    end: Date;
    avgDailyKWh: number;
    avgPeakDemand: number;
    totalCost: number;
  };
  savings: {
    energySaved: number;
    costSaved: number;
    percentageReduction: number;
    co2Avoided: number;
    confidence: number;
  };
  adjustments: {
    weather: number;
    production: number;
    schedule: number;
  };
  verificationMethod: 'IPMVP' | 'ASHRAE' | 'CUSTOM';
  certifiedBy?: string;
  certificationDate?: Date;
}

// Client-side energy monitoring API
export class EnergyMonitoringClient {
  private baseUrl = '/api/energy-monitoring';

  async getVerificationData(
    facilityId: string,
    startDate: Date,
    endDate: Date,
    baselineId?: string
  ): Promise<EnergySavingsVerification> {
    const params = new URLSearchParams({
      facilityId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      ...(baselineId && { baselineId })
    });

    const response = await fetch(`${this.baseUrl}/verification?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch verification data');
    }

    const data = await response.json();
    // Convert date strings back to Date objects
    return {
      ...data,
      baselinePeriod: {
        ...data.baselinePeriod,
        start: new Date(data.baselinePeriod.start),
        end: new Date(data.baselinePeriod.end)
      },
      currentPeriod: {
        ...data.currentPeriod,
        start: new Date(data.currentPeriod.start),
        end: new Date(data.currentPeriod.end)
      },
      certificationDate: data.certificationDate ? new Date(data.certificationDate) : undefined
    };
  }

  async generateReport(
    verification: EnergySavingsVerification,
    format: 'pdf' | 'json' | 'csv'
  ): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ verification, format })
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    return response.blob();
  }

  async getEnergyTrends(
    facilityId: string,
    timeRange: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/trends?facilityId=${facilityId}&range=${timeRange}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch energy trends');
    }

    return response.json();
  }

  async getAlerts(facilityId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/alerts?facilityId=${facilityId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }

    return response.json();
  }
}

// Export singleton instance
export const energyMonitoringClient = new EnergyMonitoringClient();