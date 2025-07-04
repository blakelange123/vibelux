// Photobiology Stress Index (PSI) - Stub Implementation

export interface PSIResult {
  overallIndex: number;
  lightStress: number;
  temperatureStress: number;
  waterStress: number;
  nutrientStress: number;
  co2Stress: number;
  timestamp: Date;
  recommendations: string[];
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

export interface PSIMetrics {
  ppfd: number;
  temperature: number;
  humidity: number;
  vpd: number;
  co2: number;
  soilMoisture?: number;
  leafTemperature?: number;
  chlorophyllContent?: number;
}

export class PhotobiologyStressIndex {
  private metrics: PSIMetrics;
  private history: PSIResult[] = [];

  constructor(initialMetrics?: Partial<PSIMetrics>) {
    this.metrics = {
      ppfd: 800,
      temperature: 25,
      humidity: 60,
      vpd: 1.2,
      co2: 400,
      ...initialMetrics
    };
  }

  calculate(): PSIResult {
    // Stub calculation
    const result: PSIResult = {
      overallIndex: 0.75,
      lightStress: 0.2,
      temperatureStress: 0.1,
      waterStress: 0.15,
      nutrientStress: 0.1,
      co2Stress: 0.05,
      timestamp: new Date(),
      recommendations: [
        'Maintain current environmental conditions',
        'Monitor VPD levels closely'
      ],
      severity: 'low'
    };

    this.history.push(result);
    return result;
  }

  updateMetrics(metrics: Partial<PSIMetrics>): void {
    this.metrics = { ...this.metrics, ...metrics };
  }

  getHistory(): PSIResult[] {
    return this.history;
  }

  getLatestResult(): PSIResult | null {
    return this.history[this.history.length - 1] || null;
  }

  getTrends(hours: number = 24): any {
    // Stub trend analysis
    return {
      lightStressTrend: 'stable',
      temperatureStressTrend: 'decreasing',
      waterStressTrend: 'stable',
      overallTrend: 'improving'
    };
  }
}

export function calculateRealTimePSI(metrics: PSIMetrics): PSIResult {
  const psi = new PhotobiologyStressIndex(metrics);
  return psi.calculate();
}

// Export additional utilities
export function getStressSeverity(index: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (index < 0.3) return 'low';
  if (index < 0.6) return 'moderate';
  if (index < 0.8) return 'high';
  return 'critical';
}

export function getRecommendations(result: PSIResult): string[] {
  const recommendations: string[] = [];
  
  if (result.lightStress > 0.5) {
    recommendations.push('Reduce light intensity or adjust photoperiod');
  }
  if (result.temperatureStress > 0.5) {
    recommendations.push('Adjust temperature to optimal range (22-26°C)');
  }
  if (result.waterStress > 0.5) {
    recommendations.push('Check irrigation system and adjust VPD');
  }
  
  return recommendations;
}