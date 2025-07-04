/**
 * Energy Rate API Integration
 * Fetches real-time energy pricing for ML optimization
 */

interface EnergyRate {
  timestamp: Date;
  rate: number; // $/kWh
  currency: 'USD';
  provider: string;
  zone: string;
  forecastHours: number[];
}

interface EnergyForecast {
  hourlyRates: Array<{
    hour: number;
    rate: number;
    demand: 'low' | 'medium' | 'high' | 'peak';
  }>;
  peakHours: number[];
  offPeakHours: number[];
  recommendations: {
    optimalLightingHours: number[];
    energySavingPotential: number;
    costReduction: number;
  };
}

export class EnergyAPI {
  private apiKey: string;
  private baseUrl: string;
  private zone: string;

  constructor() {
    this.apiKey = process.env.ENERGY_API_KEY || '';
    this.baseUrl = 'https://api.eia.gov/v2'; // US Energy Information Administration
    this.zone = process.env.ENERGY_ZONE || 'NYISO'; // Default to NY ISO
  }

  /**
   * Get current energy rates
   */
  async getCurrentRates(): Promise<EnergyRate> {
    try {
      const response = await fetch(
        `${this.baseUrl}/electricity/rto/region-data/data/?frequency=hourly&data[0]=value&facets[respondent][]=${this.zone}&start=2024-01-01T00&end=2024-12-31T23&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=1&api_key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Energy API error: ${response.status}`);
      }

      const data = await response.json();
      const latest = data.response.data[0];

      return {
        timestamp: new Date(latest.period),
        rate: latest.value / 1000, // Convert from $/MWh to $/kWh
        currency: 'USD',
        provider: this.zone,
        zone: this.zone,
        forecastHours: []
      };
    } catch (error) {
      console.error('Failed to fetch energy rates:', error);
      
      // Fallback to static rates
      return {
        timestamp: new Date(),
        rate: 0.12, // Average US rate
        currency: 'USD',
        provider: 'fallback',
        zone: this.zone,
        forecastHours: []
      };
    }
  }

  /**
   * Get 24-hour energy forecast
   */
  async getEnergyForecast(): Promise<EnergyForecast> {
    try {
      const response = await fetch(
        `${this.baseUrl}/electricity/rto/region-data/data/?frequency=hourly&data[0]=value&facets[respondent][]=${this.zone}&start=${this.getTodayStart()}&end=${this.getTomorrowEnd()}&sort[0][column]=period&sort[0][direction]=asc&offset=0&length=48&api_key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Energy forecast API error: ${response.status}`);
      }

      const data = await response.json();
      const hourlyData = data.response.data;

      const hourlyRates = hourlyData.map((item: any, index: number) => ({
        hour: index,
        rate: item.value / 1000,
        demand: this.categorizeDemand(item.value / 1000)
      }));

      const peakHours = hourlyRates
        .filter(h => h.demand === 'peak')
        .map(h => h.hour);

      const offPeakHours = hourlyRates
        .filter(h => h.demand === 'low')
        .map(h => h.hour);

      const optimalLightingHours = this.calculateOptimalLightingHours(hourlyRates);

      return {
        hourlyRates,
        peakHours,
        offPeakHours,
        recommendations: {
          optimalLightingHours,
          energySavingPotential: this.calculateSavingsPotential(hourlyRates),
          costReduction: this.calculateCostReduction(hourlyRates, optimalLightingHours)
        }
      };
    } catch (error) {
      console.error('Failed to fetch energy forecast:', error);
      return this.getFallbackForecast();
    }
  }

  /**
   * Calculate optimal lighting schedule based on energy rates and DLI requirements
   */
  calculateOptimalLightingHours(
    hourlyRates: Array<{ hour: number; rate: number; demand: string }>,
    requiredDLI: number = 45, // mol/m²/day
    maxPPFD: number = 800 // µmol/m²/s
  ): number[] {
    // Sort hours by energy rate (lowest first)
    const sortedHours = [...hourlyRates].sort((a, b) => a.rate - b.rate);
    
    // Calculate hours needed to achieve DLI
    const secondsPerDay = 24 * 60 * 60;
    const secondsNeeded = (requiredDLI * 1000000) / maxPPFD;
    const hoursNeeded = Math.ceil(secondsNeeded / 3600);
    
    // Select cheapest hours
    return sortedHours
      .slice(0, Math.min(hoursNeeded, 18)) // Max 18 hours
      .map(h => h.hour)
      .sort((a, b) => a - b);
  }

  /**
   * Get deep red spectrum optimization schedule
   */
  async getSpectrumOptimizationSchedule(
    peakEnergyHours: number[],
    requiredDLI: number = 45
  ): Promise<{
    schedule: Array<{
      hour: number;
      redPercentage: number; // 0-100
      totalIntensity: number; // 0-100
      energyEfficiency: number;
    }>;
    dailyEnergyReduction: number;
  }> {
    const schedule = [];
    let totalEnergyReduction = 0;

    for (let hour = 0; hour < 24; hour++) {
      const isPeakHour = peakEnergyHours.includes(hour);
      
      if (isPeakHour) {
        // Use deep red spectrum during peak hours
        // Deep red (660-730nm) is 20% more efficient for photosynthesis
        schedule.push({
          hour,
          redPercentage: 85, // Heavy deep red
          totalIntensity: 60, // Reduced overall intensity
          energyEfficiency: 1.2 // 20% more efficient
        });
        totalEnergyReduction += 0.4; // 40% energy reduction
      } else {
        // Normal spectrum during off-peak
        schedule.push({
          hour,
          redPercentage: 30, // Normal spectrum mix
          totalIntensity: 100,
          energyEfficiency: 1.0
        });
      }
    }

    return {
      schedule,
      dailyEnergyReduction: totalEnergyReduction
    };
  }

  private categorizeDemand(rate: number): 'low' | 'medium' | 'high' | 'peak' {
    if (rate < 0.08) return 'low';
    if (rate < 0.12) return 'medium';
    if (rate < 0.20) return 'high';
    return 'peak';
  }

  private calculateSavingsPotential(hourlyRates: Array<{ rate: number }>): number {
    const avgRate = hourlyRates.reduce((sum, h) => sum + h.rate, 0) / hourlyRates.length;
    const minRate = Math.min(...hourlyRates.map(h => h.rate));
    return ((avgRate - minRate) / avgRate) * 100;
  }

  private calculateCostReduction(
    hourlyRates: Array<{ hour: number; rate: number }>,
    optimalHours: number[]
  ): number {
    const avgRate = hourlyRates.reduce((sum, h) => sum + h.rate, 0) / hourlyRates.length;
    const optimalAvgRate = optimalHours.reduce((sum, hour) => {
      return sum + hourlyRates[hour].rate;
    }, 0) / optimalHours.length;

    return ((avgRate - optimalAvgRate) / avgRate) * 100;
  }

  private getTodayStart(): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().slice(0, 13) + ':00';
  }

  private getTomorrowEnd(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    return tomorrow.toISOString().slice(0, 13) + ':00';
  }

  private getFallbackForecast(): EnergyForecast {
    // Typical peak hours pattern
    const peakHours = [7, 8, 9, 17, 18, 19, 20];
    const offPeakHours = [0, 1, 2, 3, 4, 5, 22, 23];

    const hourlyRates = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      rate: peakHours.includes(hour) ? 0.18 : offPeakHours.includes(hour) ? 0.08 : 0.12,
      demand: peakHours.includes(hour) ? 'peak' as const : 
               offPeakHours.includes(hour) ? 'low' as const : 'medium' as const
    }));

    return {
      hourlyRates,
      peakHours,
      offPeakHours,
      recommendations: {
        optimalLightingHours: [0, 1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 22, 23],
        energySavingPotential: 35,
        costReduction: 25
      }
    };
  }
}

export const energyAPI = new EnergyAPI();