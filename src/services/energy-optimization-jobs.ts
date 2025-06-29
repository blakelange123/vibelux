/**
 * Energy Optimization Background Jobs
 * Handles continuous monitoring, optimization, and billing
 */

import { controlSystemAdapter } from './control-system-adapter';
import { smartOptimizationAlgorithms } from './smart-optimization-algorithms';
import { energyBillingService } from './energy-billing-service';
import { claudeOptimizationAdvisor } from './claude-optimization-advisor';
import { emergencyStopSystem } from './emergency-stop-system';
import { prisma } from '@/lib/prisma';

export class EnergyOptimizationJobs {
  private static instance: EnergyOptimizationJobs;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  private constructor() {}

  static getInstance(): EnergyOptimizationJobs {
    if (!EnergyOptimizationJobs.instance) {
      EnergyOptimizationJobs.instance = new EnergyOptimizationJobs();
    }
    return EnergyOptimizationJobs.instance;
  }

  /**
   * Start all background jobs
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Data collection job - every 5 minutes
    this.scheduleJob('data-collection', () => this.collectDataFromAllFacilities(), 5 * 60 * 1000);

    // Optimization job - every 15 minutes
    this.scheduleJob('optimization', () => this.runOptimizationForAllFacilities(), 15 * 60 * 1000);

    // Emergency monitoring - every 30 seconds
    this.scheduleJob('emergency-monitor', () => this.monitorEmergencyConditions(), 30 * 1000);

    // Billing job - daily at 2 AM
    this.scheduleDailyJob('billing', () => this.runMonthlyBilling(), 2, 0);

    // Health check job - every hour
    this.scheduleJob('health-check', () => this.performHealthChecks(), 60 * 60 * 1000);

  }

  /**
   * Stop all background jobs
   */
  stop(): void {
    
    for (const [jobName, interval] of this.intervals) {
      clearInterval(interval);
    }
    
    this.intervals.clear();
    this.isRunning = false;
    
  }

  /**
   * Collect data from all active facilities
   */
  private async collectDataFromAllFacilities(): Promise<void> {
    try {
      const activeFacilities = await prisma.energy_optimization_config.findMany({
        where: { optimization_active: true }
      });


      const promises = activeFacilities.map(async (facility) => {
        try {
          const reading = await controlSystemAdapter.readCurrentData(facility.facility_id);
          
          if (reading && reading.systemStatus === 'online') {
          } else {
            console.warn(`  ⚠️ ${facility.facility_name}: Failed to read data`);
          }
        } catch (error) {
          console.error(`  ❌ ${facility.facility_name}: ${error.message}`);
        }
      });

      await Promise.allSettled(promises);
      
    } catch (error) {
      console.error('Failed to collect facility data:', error);
    }
  }

  /**
   * Run optimization for all active facilities
   */
  private async runOptimizationForAllFacilities(): Promise<void> {
    try {
      const activeFacilities = await prisma.energy_optimization_config.findMany({
        where: { optimization_active: true }
      });


      for (const facility of activeFacilities) {
        try {
          await this.optimizeFacility(facility);
        } catch (error) {
          console.error(`Failed to optimize ${facility.facility_name}:`, error);
        }
      }
      
    } catch (error) {
      console.error('Failed to run optimization:', error);
    }
  }

  /**
   * Optimize a single facility
   */
  private async optimizeFacility(facility: any): Promise<void> {
    // Get current system reading
    const reading = await controlSystemAdapter.readCurrentData(facility.facility_id);
    
    if (!reading || reading.systemStatus !== 'online') {
      console.warn(`  ⚠️ ${facility.facility_name}: System offline, skipping optimization`);
      return;
    }

    // Optimize each zone
    for (const zone of reading.zones) {
      try {
        // Get smart optimization recommendation
        const optimization = await smartOptimizationAlgorithms.optimizeZone(zone.zoneId, {
          currentPower: zone.powerKw,
          lightIntensity: zone.lightIntensity,
          temperature: zone.temperature,
          humidity: zone.humidity,
          facilityId: facility.facility_id,
          cropType: facility.crop_type,
          growthStage: facility.growth_stage
        });

        // Apply optimization if safe and beneficial
        if (optimization.shouldOptimize && optimization.confidence > 70) {
          // Use Claude AI for complex decisions (>25kW zones or low confidence)
          if (zone.powerKw! > 25 || optimization.confidence < 80) {
            const aiRecommendation = await claudeOptimizationAdvisor.getOptimizationRecommendation({
              facilityId: facility.facility_id,
              zoneId: zone.zoneId,
              currentState: zone,
              proposedOptimization: optimization,
              cropType: facility.crop_type,
              growthStage: facility.growth_stage
            });

            if (!aiRecommendation.approved) {
              continue;
            }
          }

          // Send optimization command
          const success = await controlSystemAdapter.sendControlCommand(facility.facility_id, {
            type: 'adjust_lighting',
            zoneId: zone.zoneId,
            value: optimization.recommendedIntensity,
            duration: optimization.duration
          });

          if (success) {
          }
        } else {
        }

      } catch (zoneError) {
        console.error(`  ❌ ${zone.zoneName}: Optimization failed - ${zoneError.message}`);
      }
    }
  }

  /**
   * Monitor for emergency conditions
   */
  private async monitorEmergencyConditions(): Promise<void> {
    try {
      const activeFacilities = await prisma.energy_optimization_config.findMany({
        where: { optimization_active: true }
      });

      for (const facility of activeFacilities) {
        // Check for emergency conditions
        const emergencyCheck = await emergencyStopSystem.checkEmergencyConditions(facility.facility_id);
        
        if (!emergencyCheck.safe) {
          console.warn(`🚨 Emergency condition detected at ${facility.facility_name}: ${emergencyCheck.reasons.join(', ')}`);
          
          await emergencyStopSystem.triggerEmergencyStop({
            type: 'system_malfunction',
            facilityId: facility.facility_id,
            reason: emergencyCheck.reasons.join(', '),
            severity: 'high'
          });
        }
      }
      
    } catch (error) {
      console.error('Failed to monitor emergency conditions:', error);
    }
  }

  /**
   * Run monthly billing process
   */
  private async runMonthlyBilling(): Promise<void> {
    try {
      // Only run on the first day of the month
      const today = new Date();
      if (today.getDate() !== 1) {
        return;
      }

      await energyBillingService.processMonthlyBilling();
      
    } catch (error) {
      console.error('Failed to run monthly billing:', error);
    }
  }

  /**
   * Perform system health checks
   */
  private async performHealthChecks(): Promise<void> {
    try {
      
      const activeFacilities = await prisma.energy_optimization_config.findMany({
        where: { optimization_active: true }
      });

      const healthReport = {
        totalFacilities: activeFacilities.length,
        onlineFacilities: 0,
        offlineFacilities: 0,
        healthyFacilities: 0,
        issues: [] as string[]
      };

      for (const facility of activeFacilities) {
        try {
          const reading = await controlSystemAdapter.readCurrentData(facility.facility_id);
          
          if (reading && reading.systemStatus === 'online') {
            healthReport.onlineFacilities++;
            
            if (reading.errors.length === 0) {
              healthReport.healthyFacilities++;
            } else {
              healthReport.issues.push(`${facility.facility_name}: ${reading.errors.join(', ')}`);
            }
          } else {
            healthReport.offlineFacilities++;
            healthReport.issues.push(`${facility.facility_name}: System offline`);
          }
        } catch (error) {
          healthReport.offlineFacilities++;
          healthReport.issues.push(`${facility.facility_name}: ${error.message}`);
        }
      }

      
      if (healthReport.issues.length > 0) {
        console.warn('  ⚠️ Issues detected:');
        healthReport.issues.forEach(issue => console.warn(`    - ${issue}`));
      }
      
    } catch (error) {
      console.error('Failed to perform health checks:', error);
    }
  }

  /**
   * Schedule a recurring job
   */
  private scheduleJob(name: string, task: () => Promise<void>, intervalMs: number): void {
    const interval = setInterval(async () => {
      try {
        await task();
      } catch (error) {
        console.error(`Job ${name} failed:`, error);
      }
    }, intervalMs);

    this.intervals.set(name, interval);
  }

  /**
   * Schedule a daily job at specific time
   */
  private scheduleDailyJob(name: string, task: () => Promise<void>, hour: number, minute: number): void {
    const scheduleNext = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);
      
      // If the time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      const msUntilRun = scheduledTime.getTime() - now.getTime();
      
      const timeout = setTimeout(async () => {
        try {
          await task();
        } catch (error) {
          console.error(`Daily job ${name} failed:`, error);
        }
        // Schedule the next run
        scheduleNext();
      }, msUntilRun);
      
      return timeout;
    };

    const timeout = scheduleNext();
    this.intervals.set(name, timeout as any);
  }

  /**
   * Get status of all jobs
   */
  getStatus(): {
    isRunning: boolean;
    activeJobs: string[];
    totalJobs: number;
  } {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.intervals.keys()),
      totalJobs: this.intervals.size
    };
  }
}

// Export singleton
export const energyOptimizationJobs = EnergyOptimizationJobs.getInstance();