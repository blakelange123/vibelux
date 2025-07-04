/**
 * Maintenance ROI Calculator
 * Calculates return on investment for maintenance activities based on performance degradation
 */

export interface MaintenanceROIConfig {
  facilityId: string;
  maintenanceType: 'FIXTURE_CLEANING' | 'FILTER_REPLACEMENT' | 'CALIBRATION' | 'GENERAL';
  currentPerformance: number; // Current performance percentage (0-100)
  expectedPerformance: number; // Expected performance after maintenance (0-100)
  maintenanceCost: number; // Cost of maintenance in dollars
  laborHours: number;
  laborRate: number; // $/hour
}

export interface MaintenanceROIResult {
  performanceGain: number; // Percentage improvement
  estimatedYieldGain: number; // kg or units
  estimatedRevenueGain: number; // $
  totalMaintenanceCost: number; // $
  roi: number; // Return on investment percentage
  paybackDays: number; // Days to recover maintenance cost
  recommendation: 'IMMEDIATE' | 'SCHEDULE' | 'DEFER' | 'MONITOR';
  explanation: string;
}

export interface LightTransmissionData {
  date: Date;
  transmissionPercentage: number;
  parReading: number;
}

export class MaintenanceROICalculator {
  /**
   * Calculate ROI for fixture cleaning based on light transmission degradation
   */
  calculateFixtureCleaningROI(
    transmissionHistory: LightTransmissionData[],
    facilityData: {
      area: number; // m²
      cropType: string;
      yieldPerM2: number; // kg/m²
      cropValuePerKg: number; // $/kg
      daysToHarvest: number;
      currentDLI: number;
      targetDLI: number;
    },
    maintenanceCost: {
      laborHours: number;
      laborRate: number; // $/hour
      suppliesCost: number; // cleaning supplies
    }
  ): MaintenanceROIResult {
    // Calculate current light loss
    const currentTransmission = transmissionHistory[transmissionHistory.length - 1].transmissionPercentage;
    const cleanTransmission = 98; // Assume 98% transmission when clean
    const transmissionGain = cleanTransmission - currentTransmission;

    // Calculate DLI improvement
    const dliImprovement = (facilityData.currentDLI * transmissionGain) / 100;
    const newDLI = facilityData.currentDLI + dliImprovement;

    // Estimate yield gain based on DLI improvement (simplified model)
    const dliYieldFactor = this.getDLIYieldFactor(facilityData.cropType);
    const yieldGainPercentage = Math.min(
      (dliImprovement / facilityData.targetDLI) * dliYieldFactor * 100,
      transmissionGain // Cap at transmission gain percentage
    );

    // Calculate financial impact
    const totalYield = facilityData.area * facilityData.yieldPerM2;
    const estimatedYieldGain = (totalYield * yieldGainPercentage) / 100;
    const estimatedRevenueGain = estimatedYieldGain * facilityData.cropValuePerKg;

    // Calculate maintenance cost
    const laborCost = maintenanceCost.laborHours * maintenanceCost.laborRate;
    const totalMaintenanceCost = laborCost + maintenanceCost.suppliesCost;

    // Calculate ROI
    const roi = ((estimatedRevenueGain - totalMaintenanceCost) / totalMaintenanceCost) * 100;
    
    // Calculate payback period
    const dailyRevenueGain = estimatedRevenueGain / facilityData.daysToHarvest;
    const paybackDays = totalMaintenanceCost / dailyRevenueGain;

    // Generate recommendation
    const recommendation = this.generateRecommendation(transmissionGain, roi, paybackDays);
    const explanation = this.generateExplanation(
      currentTransmission,
      transmissionGain,
      estimatedRevenueGain,
      totalMaintenanceCost,
      paybackDays
    );

    return {
      performanceGain: transmissionGain,
      estimatedYieldGain,
      estimatedRevenueGain,
      totalMaintenanceCost,
      roi,
      paybackDays,
      recommendation,
      explanation
    };
  }

  /**
   * Predict when maintenance will be needed based on degradation trend
   */
  predictMaintenanceSchedule(
    transmissionHistory: LightTransmissionData[],
    thresholds: {
      immediate: number; // % transmission requiring immediate action
      scheduled: number; // % transmission for scheduled maintenance
      monitor: number; // % transmission to start monitoring closely
    } = { immediate: 85, scheduled: 90, monitor: 93 }
  ): {
    currentStatus: 'GOOD' | 'MONITOR' | 'SCHEDULE' | 'IMMEDIATE';
    daysUntilScheduled: number | null;
    daysUntilCritical: number | null;
    degradationRatePerDay: number;
  } {
    if (transmissionHistory.length < 2) {
      return {
        currentStatus: 'GOOD',
        daysUntilScheduled: null,
        daysUntilCritical: null,
        degradationRatePerDay: 0
      };
    }

    // Calculate degradation rate using linear regression
    const degradationRate = this.calculateDegradationRate(transmissionHistory);
    const currentTransmission = transmissionHistory[transmissionHistory.length - 1].transmissionPercentage;

    // Determine current status
    let currentStatus: 'GOOD' | 'MONITOR' | 'SCHEDULE' | 'IMMEDIATE';
    if (currentTransmission <= thresholds.immediate) {
      currentStatus = 'IMMEDIATE';
    } else if (currentTransmission <= thresholds.scheduled) {
      currentStatus = 'SCHEDULE';
    } else if (currentTransmission <= thresholds.monitor) {
      currentStatus = 'MONITOR';
    } else {
      currentStatus = 'GOOD';
    }

    // Predict days until thresholds
    const daysUntilScheduled = currentTransmission > thresholds.scheduled
      ? (currentTransmission - thresholds.scheduled) / degradationRate
      : 0;
    
    const daysUntilCritical = currentTransmission > thresholds.immediate
      ? (currentTransmission - thresholds.immediate) / degradationRate
      : 0;

    return {
      currentStatus,
      daysUntilScheduled: daysUntilScheduled > 0 ? Math.round(daysUntilScheduled) : null,
      daysUntilCritical: daysUntilCritical > 0 ? Math.round(daysUntilCritical) : null,
      degradationRatePerDay: degradationRate
    };
  }

  /**
   * Calculate degradation rate using linear regression
   */
  private calculateDegradationRate(history: LightTransmissionData[]): number {
    const n = history.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    const startDate = history[0].date.getTime();

    history.forEach((point, index) => {
      const x = (point.date.getTime() - startDate) / (1000 * 60 * 60 * 24); // Days from start
      const y = point.transmissionPercentage;

      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return Math.abs(slope); // Return positive degradation rate
  }

  /**
   * Get crop-specific DLI to yield conversion factor
   */
  private getDLIYieldFactor(cropType: string): number {
    const factors: Record<string, number> = {
      'tomato': 0.8,
      'cucumber': 0.85,
      'lettuce': 0.9,
      'cannabis': 0.95,
      'strawberry': 0.75,
      'pepper': 0.7,
      'herbs': 0.85,
      'microgreens': 0.95
    };

    return factors[cropType.toLowerCase()] || 0.8;
  }

  /**
   * Generate maintenance recommendation based on ROI
   */
  private generateRecommendation(
    transmissionGain: number,
    roi: number,
    paybackDays: number
  ): 'IMMEDIATE' | 'SCHEDULE' | 'DEFER' | 'MONITOR' {
    if (transmissionGain >= 15 || roi >= 500) {
      return 'IMMEDIATE';
    } else if (transmissionGain >= 10 || (roi >= 200 && paybackDays <= 30)) {
      return 'SCHEDULE';
    } else if (transmissionGain >= 5) {
      return 'MONITOR';
    } else {
      return 'DEFER';
    }
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    currentTransmission: number,
    transmissionGain: number,
    revenueGain: number,
    cost: number,
    paybackDays: number
  ): string {
    if (transmissionGain >= 15) {
      return `Critical: Light transmission has degraded to ${currentTransmission.toFixed(1)}%. ` +
             `Cleaning will restore ${transmissionGain.toFixed(1)}% transmission, ` +
             `generating $${revenueGain.toFixed(0)} in additional revenue. ` +
             `Investment of $${cost.toFixed(0)} pays back in just ${Math.ceil(paybackDays)} days.`;
    } else if (transmissionGain >= 10) {
      return `Recommended: ${transmissionGain.toFixed(1)}% improvement in light transmission available. ` +
             `Expected return: $${revenueGain.toFixed(0)} for $${cost.toFixed(0)} investment. ` +
             `Schedule cleaning within the next week.`;
    } else if (transmissionGain >= 5) {
      return `Monitor: Light transmission at ${currentTransmission.toFixed(1)}%. ` +
             `Cleaning would provide ${transmissionGain.toFixed(1)}% improvement. ` +
             `Continue monitoring degradation rate.`;
    } else {
      return `Good condition: Light transmission at ${currentTransmission.toFixed(1)}%. ` +
             `Minimal benefit from cleaning at this time.`;
    }
  }
}

/**
 * Helper function to track transmission history
 */
export function updateTransmissionHistory(
  history: LightTransmissionData[],
  newReading: { parReading: number; expectedPar: number }
): LightTransmissionData[] {
  const transmissionPercentage = (newReading.parReading / newReading.expectedPar) * 100;
  
  return [
    ...history,
    {
      date: new Date(),
      transmissionPercentage: Math.min(100, transmissionPercentage),
      parReading: newReading.parReading
    }
  ];
}