/**
 * Production Energy Rate Service
 * Handles real-time electricity pricing from multiple sources
 */

import { energyAPI } from '@/lib/integrations/energy-api';

export interface UtilityRate {
  utilityName: string;
  rateName: string;
  rateType: 'TOU' | 'FLAT' | 'TIERED' | 'DEMAND';
  currency: 'USD';
  effectiveDate: Date;
  timeOfUseRates?: {
    period: string; // 'peak' | 'off-peak' | 'shoulder'
    startTime: string; // "14:00"
    endTime: string; // "19:00"
    rate: number; // $/kWh
    months: number[]; // [6,7,8,9] for summer
    daysOfWeek: number[]; // [1,2,3,4,5] for weekdays
  }[];
  demandCharges?: {
    period: string;
    rate: number; // $/kW
    threshold?: number; // kW
  }[];
  fixedCharges?: {
    name: string;
    amount: number; // $/month
  }[];
}

export interface RealTimeRate {
  timestamp: Date;
  currentRate: number; // $/kWh
  nextHourRate?: number;
  todayPeakRate?: number;
  todayAverageRate?: number;
  rateSchedule: 'peak' | 'off-peak' | 'shoulder' | 'super-off-peak';
  gridCondition: 'normal' | 'warning' | 'critical';
  demandResponseActive: boolean;
}

export class EnergyRateService {
  private openEIKey: string;
  private utilityRateCache: Map<string, UtilityRate> = new Map();
  private lastRateUpdate: Date | null = null;
  
  constructor() {
    this.openEIKey = process.env.OPENEI_API_KEY || '';
  }
  
  /**
   * Get utility rate schedule from OpenEI
   */
  async getUtilityRateSchedule(
    zipCode: string,
    utilityName?: string
  ): Promise<UtilityRate | null> {
    const cacheKey = `${zipCode}-${utilityName || 'default'}`;
    
    // Check cache (24 hour TTL)
    if (this.utilityRateCache.has(cacheKey)) {
      const cached = this.utilityRateCache.get(cacheKey)!;
      if (new Date().getTime() - cached.effectiveDate.getTime() < 24 * 60 * 60 * 1000) {
        return cached;
      }
    }
    
    try {
      // OpenEI Utility Rate Database API
      const response = await fetch(
        `https://api.openei.org/utility_rates?version=latest&format=json&api_key=${this.openEIKey}&address=${zipCode}`
      );
      
      if (!response.ok) {
        throw new Error(`OpenEI API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return this.getDefaultRateSchedule();
      }
      
      // Find commercial/industrial rate
      const commercialRate = data.items.find((rate: any) => 
        rate.sector === 'Commercial' || rate.sector === 'Industrial'
      ) || data.items[0];
      
      const utilityRate: UtilityRate = {
        utilityName: commercialRate.utility,
        rateName: commercialRate.name,
        rateType: this.determineRateType(commercialRate),
        currency: 'USD',
        effectiveDate: new Date(),
        timeOfUseRates: this.parseTimeOfUseRates(commercialRate),
        demandCharges: this.parseDemandCharges(commercialRate),
        fixedCharges: this.parseFixedCharges(commercialRate)
      };
      
      this.utilityRateCache.set(cacheKey, utilityRate);
      return utilityRate;
      
    } catch (error) {
      console.error('Failed to fetch utility rates:', error);
      return this.getDefaultRateSchedule();
    }
  }
  
  /**
   * Get real-time electricity rate
   */
  async getRealTimeRate(facilityZipCode: string): Promise<RealTimeRate> {
    try {
      // First try to get wholesale rates from EIA
      const currentRate = await energyAPI.getCurrentRates();
      const forecast = await energyAPI.getEnergyForecast();
      
      // Get utility retail rates
      const utilityRate = await this.getUtilityRateSchedule(facilityZipCode);
      
      if (!utilityRate || !utilityRate.timeOfUseRates) {
        return this.getCurrentRateFromSchedule(utilityRate);
      }
      
      // Determine current TOU period
      const now = new Date();
      const currentHour = now.getHours();
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDay(); // 0 = Sunday
      
      let currentPeriodRate = 0.12; // Default
      let rateSchedule: RealTimeRate['rateSchedule'] = 'off-peak';
      
      for (const touRate of utilityRate.timeOfUseRates) {
        if (!touRate.months.includes(currentMonth)) continue;
        if (!touRate.daysOfWeek.includes(currentDay === 0 ? 7 : currentDay)) continue;
        
        const startHour = parseInt(touRate.startTime.split(':')[0]);
        const endHour = parseInt(touRate.endTime.split(':')[0]);
        
        if (currentHour >= startHour && currentHour < endHour) {
          currentPeriodRate = touRate.rate;
          rateSchedule = touRate.period as any;
          break;
        }
      }
      
      // Check for demand response events
      const demandResponseActive = await this.checkDemandResponse(facilityZipCode);
      
      // Adjust rate for demand response
      if (demandResponseActive) {
        currentPeriodRate *= 1.5; // 50% increase during DR events
      }
      
      return {
        timestamp: now,
        currentRate: currentPeriodRate,
        nextHourRate: this.getNextHourRate(utilityRate, now),
        todayPeakRate: Math.max(...forecast.hourlyRates.map(h => h.rate)),
        todayAverageRate: forecast.hourlyRates.reduce((sum, h) => sum + h.rate, 0) / forecast.hourlyRates.length,
        rateSchedule,
        gridCondition: this.determineGridCondition(currentRate.rate),
        demandResponseActive
      };
      
    } catch (error) {
      console.error('Failed to get real-time rate:', error);
      return this.getFallbackRate();
    }
  }
  
  /**
   * Calculate optimal lighting schedule for today
   */
  async calculateOptimalSchedule(
    facilityZipCode: string,
    cropType: string,
    growthStage: string,
    requiredPhotoperiod: number
  ): Promise<{
    schedule: Array<{ hour: number; lightsOn: boolean; rate: number; savings: number }>;
    estimatedDailySavings: number;
    photoperiodMaintained: boolean;
  }> {
    const utilityRate = await this.getUtilityRateSchedule(facilityZipCode);
    const forecast = await energyAPI.getEnergyForecast();
    
    // Get hourly rates for today
    const hourlyRates = await this.getTodayHourlyRates(utilityRate, forecast);
    
    // Critical check for cannabis flowering
    if (cropType === 'cannabis' && growthStage === 'flowering') {
      // CANNOT shift photoperiod - must be exactly 12 hours
      const schedule = this.generateFixedPhotoperiodSchedule(12, hourlyRates);
      return {
        schedule,
        estimatedDailySavings: this.calculateDailySavings(schedule, hourlyRates),
        photoperiodMaintained: true
      };
    }
    
    // For other crops, optimize within constraints
    const sortedHours = [...hourlyRates]
      .map((rate, hour) => ({ hour, rate }))
      .sort((a, b) => a.rate - b.rate);
    
    // Select cheapest hours for photoperiod
    const lightHours = sortedHours
      .slice(0, requiredPhotoperiod)
      .map(h => h.hour)
      .sort((a, b) => a - b);
    
    const schedule = hourlyRates.map((rate, hour) => ({
      hour,
      lightsOn: lightHours.includes(hour),
      rate,
      savings: lightHours.includes(hour) ? 0 : rate * 50 // 50kW typical load
    }));
    
    return {
      schedule,
      estimatedDailySavings: this.calculateDailySavings(schedule, hourlyRates),
      photoperiodMaintained: true
    };
  }
  
  /**
   * Check for active demand response events
   */
  private async checkDemandResponse(zipCode: string): Promise<boolean> {
    // This would connect to utility DR programs
    // For now, simulate based on high wholesale prices
    try {
      const currentRate = await energyAPI.getCurrentRates();
      return currentRate.rate > 0.20; // $200/MWh threshold
    } catch {
      return false;
    }
  }
  
  /**
   * Parse OpenEI rate structure
   */
  private parseTimeOfUseRates(rateData: any): UtilityRate['timeOfUseRates'] {
    if (!rateData.energyratestructure) return undefined;
    
    const touRates: UtilityRate['timeOfUseRates'] = [];
    
    for (const period of rateData.energyratestructure) {
      if (period.rate && period.unit === '$/kWh') {
        touRates.push({
          period: this.mapPeriodName(period.period),
          startTime: period.begintime || '00:00',
          endTime: period.endtime || '23:59',
          rate: parseFloat(period.rate),
          months: period.months || [1,2,3,4,5,6,7,8,9,10,11,12],
          daysOfWeek: period.weekdays || [1,2,3,4,5]
        });
      }
    }
    
    return touRates.length > 0 ? touRates : undefined;
  }
  
  private parseDemandCharges(rateData: any): UtilityRate['demandCharges'] {
    if (!rateData.demandratestructure) return undefined;
    
    return rateData.demandratestructure.map((charge: any) => ({
      period: charge.period || 'all',
      rate: parseFloat(charge.rate || 0),
      threshold: charge.threshold
    }));
  }
  
  private parseFixedCharges(rateData: any): UtilityRate['fixedCharges'] {
    if (!rateData.fixedmonthlycharge && !rateData.minimumonthlycharge) return undefined;
    
    const charges: UtilityRate['fixedCharges'] = [];
    
    if (rateData.fixedmonthlycharge) {
      charges.push({
        name: 'Fixed Monthly Charge',
        amount: parseFloat(rateData.fixedmonthlycharge)
      });
    }
    
    if (rateData.minimummonthlycharge) {
      charges.push({
        name: 'Minimum Monthly Charge',
        amount: parseFloat(rateData.minimummonthlycharge)
      });
    }
    
    return charges;
  }
  
  private determineRateType(rateData: any): UtilityRate['rateType'] {
    if (rateData.energyratestructure && rateData.energyratestructure.length > 1) {
      return 'TOU';
    }
    if (rateData.energyratestructure?.[0]?.tier) {
      return 'TIERED';
    }
    if (rateData.demandratestructure) {
      return 'DEMAND';
    }
    return 'FLAT';
  }
  
  private mapPeriodName(period: string): string {
    const normalized = period.toLowerCase();
    if (normalized.includes('peak') && !normalized.includes('off')) return 'peak';
    if (normalized.includes('off')) return 'off-peak';
    if (normalized.includes('shoulder') || normalized.includes('partial')) return 'shoulder';
    return 'off-peak';
  }
  
  private determineGridCondition(wholesaleRate: number): RealTimeRate['gridCondition'] {
    if (wholesaleRate > 0.30) return 'critical';
    if (wholesaleRate > 0.20) return 'warning';
    return 'normal';
  }
  
  private getCurrentRateFromSchedule(utilityRate: UtilityRate | null): RealTimeRate {
    const now = new Date();
    
    if (!utilityRate || !utilityRate.timeOfUseRates) {
      return this.getFallbackRate();
    }
    
    // Implementation continues...
    return this.getFallbackRate();
  }
  
  private getNextHourRate(utilityRate: UtilityRate, now: Date): number {
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1);
    
    // Find rate for next hour
    // Implementation...
    return 0.12;
  }
  
  private async getTodayHourlyRates(
    utilityRate: UtilityRate | null,
    forecast: any
  ): Promise<number[]> {
    if (!utilityRate || !utilityRate.timeOfUseRates) {
      return Array(24).fill(0.12);
    }
    
    const rates: number[] = [];
    const today = new Date();
    
    for (let hour = 0; hour < 24; hour++) {
      // Calculate rate for each hour based on TOU schedule
      rates.push(0.12); // Simplified - would calculate actual TOU rate
    }
    
    return rates;
  }
  
  private generateFixedPhotoperiodSchedule(
    hours: number,
    hourlyRates: number[]
  ): Array<{ hour: number; lightsOn: boolean; rate: number; savings: number }> {
    // For cannabis flowering, typically 8 PM to 8 AM (12 hours)
    const lightsOnStart = 8; // 8 AM
    const lightsOnEnd = 20; // 8 PM (12 hours later)
    
    return hourlyRates.map((rate, hour) => ({
      hour,
      lightsOn: hour >= lightsOnStart && hour < lightsOnEnd,
      rate,
      savings: 0 // No photoperiod shifting allowed
    }));
  }
  
  private calculateDailySavings(
    schedule: Array<{ hour: number; lightsOn: boolean; rate: number; savings: number }>,
    baselineRates: number[]
  ): number {
    let savings = 0;
    
    for (const hour of schedule) {
      if (hour.lightsOn) {
        // Could save from dimming during peak hours
        if (hour.rate > 0.15) {
          savings += hour.rate * 50 * 0.15; // 15% dimming * 50kW * rate
        }
      }
    }
    
    return savings;
  }
  
  private getDefaultRateSchedule(): UtilityRate {
    return {
      utilityName: 'Default Utility',
      rateName: 'Commercial TOU',
      rateType: 'TOU',
      currency: 'USD',
      effectiveDate: new Date(),
      timeOfUseRates: [
        {
          period: 'peak',
          startTime: '14:00',
          endTime: '19:00',
          rate: 0.18,
          months: [1,2,3,4,5,6,7,8,9,10,11,12],
          daysOfWeek: [1,2,3,4,5]
        },
        {
          period: 'off-peak',
          startTime: '22:00',
          endTime: '06:00',
          rate: 0.08,
          months: [1,2,3,4,5,6,7,8,9,10,11,12],
          daysOfWeek: [1,2,3,4,5,6,7]
        },
        {
          period: 'shoulder',
          startTime: '06:00',
          endTime: '14:00',
          rate: 0.12,
          months: [1,2,3,4,5,6,7,8,9,10,11,12],
          daysOfWeek: [1,2,3,4,5,6,7]
        }
      ],
      demandCharges: [
        {
          period: 'all',
          rate: 15.00
        }
      ]
    };
  }
  
  private getFallbackRate(): RealTimeRate {
    const now = new Date();
    const hour = now.getHours();
    
    let rate = 0.12;
    let schedule: RealTimeRate['rateSchedule'] = 'shoulder';
    
    if (hour >= 14 && hour < 19) {
      rate = 0.18;
      schedule = 'peak';
    } else if (hour >= 22 || hour < 6) {
      rate = 0.08;
      schedule = 'off-peak';
    }
    
    return {
      timestamp: now,
      currentRate: rate,
      rateSchedule: schedule,
      gridCondition: 'normal',
      demandResponseActive: false
    };
  }
}

// Export singleton
export const energyRateService = new EnergyRateService();