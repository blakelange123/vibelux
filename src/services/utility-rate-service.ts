/**
 * Utility Rate Service
 * Integrates with OpenEI API and utility providers for real-time electricity rates
 */

import { prisma } from '@/lib/prisma';

interface UtilityRate {
  utilityId: string;
  utilityName: string;
  rateScheduleName: string;
  currentRate: number; // $/kWh
  peakRate: number;
  offPeakRate: number;
  shoulderRate?: number;
  demandCharge: number; // $/kW
  timeOfUse: {
    peakStart: string; // "14:00"
    peakEnd: string;   // "19:00"
    weekdaysOnly: boolean;
  };
  seasonalRates?: {
    summer: { start: string; end: string; multiplier: number };
    winter: { start: string; end: string; multiplier: number };
  };
}

interface RealTimeRate {
  currentRate: number;
  rateSchedule: 'peak' | 'off-peak' | 'shoulder';
  demandCharge: number;
  projectedCost: number; // Next hour cost per kWh
  peakHoursRemaining: number;
  savingsOpportunity: number; // 0-100 scale
}

export class UtilityRateService {
  private static instance: UtilityRateService;
  private rateCache: Map<string, { rate: UtilityRate; expires: Date }> = new Map();
  private readonly OPENEI_API_KEY = process.env.OPENEI_API_KEY;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  private constructor() {}

  static getInstance(): UtilityRateService {
    if (!UtilityRateService.instance) {
      UtilityRateService.instance = new UtilityRateService();
    }
    return UtilityRateService.instance;
  }

  /**
   * Get real-time electricity rate for a facility
   */
  async getRealTimeRate(facilityId: string): Promise<RealTimeRate> {
    try {
      // Get facility location
      const facility = await prisma.energy_optimization_config.findFirst({
        where: { facility_id: facilityId }
      });

      if (!facility) {
        throw new Error('Facility not found');
      }

      // Get utility rate for facility location
      const utilityRate = await this.getUtilityRate(facilityId);
      
      // Calculate current rate based on time of day
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay(); // 0 = Sunday
      
      const isWeekday = currentDay >= 1 && currentDay <= 5;
      const isPeakTime = this.isPeakTime(currentHour, utilityRate.timeOfUse, isWeekday);
      
      let currentRate = utilityRate.offPeakRate;
      let rateSchedule: 'peak' | 'off-peak' | 'shoulder' = 'off-peak';
      
      if (isPeakTime) {
        currentRate = utilityRate.peakRate;
        rateSchedule = 'peak';
      } else if (utilityRate.shoulderRate && this.isShoulderTime(currentHour)) {
        currentRate = utilityRate.shoulderRate;
        rateSchedule = 'shoulder';
      }

      // Apply seasonal adjustments
      if (utilityRate.seasonalRates) {
        const seasonMultiplier = this.getSeasonalMultiplier(now, utilityRate.seasonalRates);
        currentRate *= seasonMultiplier;
      }

      // Calculate savings opportunity
      const savingsOpportunity = this.calculateSavingsOpportunity(
        currentRate,
        utilityRate.peakRate,
        utilityRate.offPeakRate,
        currentHour,
        utilityRate.timeOfUse
      );

      // Calculate peak hours remaining today
      const peakHoursRemaining = this.calculatePeakHoursRemaining(
        currentHour,
        utilityRate.timeOfUse
      );

      return {
        currentRate,
        rateSchedule,
        demandCharge: utilityRate.demandCharge,
        projectedCost: this.projectNextHourRate(currentHour, utilityRate),
        peakHoursRemaining,
        savingsOpportunity
      };

    } catch (error) {
      console.error('Failed to get real-time rate:', error);
      
      // Return default rates if API fails
      return {
        currentRate: 0.12,
        rateSchedule: 'off-peak',
        demandCharge: 15.0,
        projectedCost: 0.12,
        peakHoursRemaining: 0,
        savingsOpportunity: 50
      };
    }
  }

  /**
   * Get utility rate for a facility (with caching)
   */
  private async getUtilityRate(facilityId: string): Promise<UtilityRate> {
    const cached = this.rateCache.get(facilityId);
    
    if (cached && cached.expires > new Date()) {
      return cached.rate;
    }

    try {
      // Try to get from database first (with error handling)
      let storedRate;
      try {
        storedRate = await prisma.utility_rates?.findFirst({
          where: { facility_id: facilityId }
        });
      } catch (error) {
        console.warn('Database table utility_rates not found, using fallback rates');
        storedRate = null;
      }

      if (!storedRate || this.isRateStale(storedRate.updated_at)) {
        // Fetch fresh rate from OpenEI API
        const freshRate = await this.fetchFromOpenEI(facilityId);
        
        // Store in database
        storedRate = await prisma.utility_rates?.upsert({
          where: { facility_id: facilityId },
          update: {
            utility_name: freshRate.utilityName,
            rate_schedule_name: freshRate.rateScheduleName,
            peak_rate: freshRate.peakRate,
            off_peak_rate: freshRate.offPeakRate,
            shoulder_rate: freshRate.shoulderRate,
            demand_charge: freshRate.demandCharge,
            time_of_use_schedule: freshRate.timeOfUse,
            seasonal_rates: freshRate.seasonalRates,
            updated_at: new Date()
          },
          create: {
            facility_id: facilityId,
            utility_id: freshRate.utilityId,
            utility_name: freshRate.utilityName,
            rate_schedule_name: freshRate.rateScheduleName,
            peak_rate: freshRate.peakRate,
            off_peak_rate: freshRate.offPeakRate,
            shoulder_rate: freshRate.shoulderRate,
            demand_charge: freshRate.demandCharge,
            time_of_use_schedule: freshRate.timeOfUse,
            seasonal_rates: freshRate.seasonalRates
          }
        });
      }

      const utilityRate: UtilityRate = {
        utilityId: storedRate.utility_id,
        utilityName: storedRate.utility_name,
        rateScheduleName: storedRate.rate_schedule_name,
        currentRate: storedRate.off_peak_rate, // Will be calculated based on time
        peakRate: storedRate.peak_rate,
        offPeakRate: storedRate.off_peak_rate,
        shoulderRate: storedRate.shoulder_rate,
        demandCharge: storedRate.demand_charge,
        timeOfUse: storedRate.time_of_use_schedule as any,
        seasonalRates: storedRate.seasonal_rates as any
      };

      // Cache the rate
      this.rateCache.set(facilityId, {
        rate: utilityRate,
        expires: new Date(Date.now() + this.CACHE_DURATION)
      });

      return utilityRate;

    } catch (error) {
      console.error('Failed to get utility rate:', error);
      throw error;
    }
  }

  /**
   * Fetch utility rate from OpenEI API
   */
  private async fetchFromOpenEI(facilityId: string): Promise<UtilityRate> {
    try {
      // Get facility zip code
      const facility = await prisma.energy_optimization_config.findFirst({
        where: { facility_id: facilityId }
      });

      if (!facility) {
        throw new Error('Facility not found');
      }

      // Extract zip from facility data (would need zip field in schema)
      const zipCode = '90210'; // Placeholder - would get from facility data

      // OpenEI Utility Rate API
      const utilityResponse = await fetch(
        `https://api.openei.org/utility_rates?api_key=${this.OPENEI_API_KEY}&format=json&address=${zipCode}&approved=true&limit=1`,
        { timeout: 10000 } as any
      );

      if (!utilityResponse.ok) {
        throw new Error('OpenEI API request failed');
      }

      const utilityData = await utilityResponse.json();
      
      if (!utilityData.items || utilityData.items.length === 0) {
        throw new Error('No utility rates found for location');
      }

      const rateData = utilityData.items[0];

      // Parse OpenEI response into our format
      return {
        utilityId: rateData.utility,
        utilityName: rateData.utility_name || 'Unknown Utility',
        rateScheduleName: rateData.name,
        currentRate: 0, // Will be calculated
        peakRate: this.parseRate(rateData.energyratestructure, 'peak') || 0.18,
        offPeakRate: this.parseRate(rateData.energyratestructure, 'off-peak') || 0.08,
        shoulderRate: this.parseRate(rateData.energyratestructure, 'shoulder'),
        demandCharge: this.parseDemandCharge(rateData.demandratestructure) || 15.0,
        timeOfUse: this.parseTimeOfUse(rateData.energyratestructure) || {
          peakStart: '14:00',
          peakEnd: '19:00',
          weekdaysOnly: true
        },
        seasonalRates: this.parseSeasonalRates(rateData.energyratestructure)
      };

    } catch (error) {
      console.error('OpenEI API error:', error);
      
      // Return default California rates as fallback
      return {
        utilityId: 'default',
        utilityName: 'Default Utility',
        rateScheduleName: 'Default Time-of-Use',
        currentRate: 0.12,
        peakRate: 0.25,
        offPeakRate: 0.08,
        shoulderRate: 0.15,
        demandCharge: 15.0,
        timeOfUse: {
          peakStart: '16:00',
          peakEnd: '21:00',
          weekdaysOnly: true
        }
      };
    }
  }

  /**
   * Helper methods for rate calculations
   */
  private isPeakTime(hour: number, timeOfUse: any, isWeekday: boolean): boolean {
    if (!timeOfUse || (timeOfUse.weekdaysOnly && !isWeekday)) {
      return false;
    }

    const peakStart = parseInt(timeOfUse.peakStart.split(':')[0]);
    const peakEnd = parseInt(timeOfUse.peakEnd.split(':')[0]);

    return hour >= peakStart && hour < peakEnd;
  }

  private isShoulderTime(hour: number): boolean {
    // Typical shoulder hours: 8-10 AM and 8-10 PM
    return (hour >= 8 && hour < 10) || (hour >= 20 && hour < 22);
  }

  private calculateSavingsOpportunity(
    currentRate: number,
    peakRate: number,
    offPeakRate: number,
    currentHour: number,
    timeOfUse: any
  ): number {
    const rateDifference = peakRate - offPeakRate;
    const currentDifference = currentRate - offPeakRate;
    
    // Higher opportunity when rates are high
    const baseOpportunity = (currentDifference / rateDifference) * 100;
    
    // Bonus opportunity during peak hours
    const peakBonus = this.isPeakTime(currentHour, timeOfUse, true) ? 25 : 0;
    
    return Math.min(100, Math.max(0, baseOpportunity + peakBonus));
  }

  private calculatePeakHoursRemaining(currentHour: number, timeOfUse: any): number {
    if (!timeOfUse) return 0;

    const peakStart = parseInt(timeOfUse.peakStart.split(':')[0]);
    const peakEnd = parseInt(timeOfUse.peakEnd.split(':')[0]);

    if (currentHour < peakStart) {
      return peakEnd - peakStart; // Full peak period ahead
    } else if (currentHour >= peakStart && currentHour < peakEnd) {
      return peakEnd - currentHour; // Remaining peak hours today
    } else {
      return 0; // Past peak for today
    }
  }

  private projectNextHourRate(currentHour: number, utilityRate: UtilityRate): number {
    const nextHour = (currentHour + 1) % 24;
    const isWeekday = new Date().getDay() >= 1 && new Date().getDay() <= 5;
    
    if (this.isPeakTime(nextHour, utilityRate.timeOfUse, isWeekday)) {
      return utilityRate.peakRate;
    } else if (utilityRate.shoulderRate && this.isShoulderTime(nextHour)) {
      return utilityRate.shoulderRate;
    } else {
      return utilityRate.offPeakRate;
    }
  }

  private getSeasonalMultiplier(date: Date, seasonalRates: any): number {
    const month = date.getMonth() + 1; // 1-12
    
    if (seasonalRates.summer) {
      const summerStart = parseInt(seasonalRates.summer.start);
      const summerEnd = parseInt(seasonalRates.summer.end);
      
      if (month >= summerStart && month <= summerEnd) {
        return seasonalRates.summer.multiplier;
      }
    }
    
    if (seasonalRates.winter) {
      return seasonalRates.winter.multiplier;
    }
    
    return 1.0; // No adjustment
  }

  private isRateStale(lastUpdate: Date): boolean {
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 30; // Refresh rates older than 30 days
  }

  /**
   * OpenEI response parsing helpers
   */
  private parseRate(energyStructure: any[], period: string): number | undefined {
    if (!energyStructure) return undefined;
    
    for (const structure of energyStructure) {
      if (structure.period && structure.period.toLowerCase().includes(period)) {
        return structure.rate || structure.max;
      }
    }
    
    return undefined;
  }

  private parseDemandCharge(demandStructure: any[]): number | undefined {
    if (!demandStructure || demandStructure.length === 0) return undefined;
    
    // Return the highest demand charge found
    return Math.max(...demandStructure.map(d => d.rate || d.max || 0));
  }

  private parseTimeOfUse(energyStructure: any[]): any | undefined {
    // This would parse the complex OpenEI time-of-use structure
    // For now, return default values
    return {
      peakStart: '16:00',
      peakEnd: '21:00',
      weekdaysOnly: true
    };
  }

  private parseSeasonalRates(energyStructure: any[]): any | undefined {
    // Parse seasonal rate variations from OpenEI data
    // Implementation would depend on OpenEI structure
    return undefined;
  }

  /**
   * Manual rate override for facilities with custom rates
   */
  async setCustomRate(facilityId: string, customRate: Partial<UtilityRate>): Promise<void> {
    await prisma.utility_rates?.upsert({
      where: { facility_id: facilityId },
      update: {
        ...customRate,
        updated_at: new Date()
      },
      create: {
        facility_id: facilityId,
        utility_id: customRate.utilityId || 'custom',
        utility_name: customRate.utilityName || 'Custom Rate',
        rate_schedule_name: customRate.rateScheduleName || 'Custom',
        peak_rate: customRate.peakRate || 0.20,
        off_peak_rate: customRate.offPeakRate || 0.10,
        shoulder_rate: customRate.shoulderRate,
        demand_charge: customRate.demandCharge || 15.0,
        time_of_use_schedule: customRate.timeOfUse || {},
        seasonal_rates: customRate.seasonalRates || {}
      }
    });

    // Clear cache to force refresh
    this.rateCache.delete(facilityId);
  }
}

// Export singleton
export const utilityRateService = UtilityRateService.getInstance();