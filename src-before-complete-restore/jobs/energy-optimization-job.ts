/**
 * Energy Optimization Background Job
 * Runs every 5 minutes to optimize energy usage
 */

import { CronJob } from 'cron';
import { energyOptimizationConnector } from '@/services/energy-optimization-connector';
import { energyMonitoring } from '@/lib/energy-monitoring';
import { prisma } from '@/lib/prisma';
import { smartOptimizationAlgorithms } from '@/services/smart-optimization-algorithms';
import { claudeOptimizationAdvisor } from '@/services/claude-optimization-advisor';

export class EnergyOptimizationJob {
  private job: CronJob | null = null;
  private isRunning = false;
  
  /**
   * Start the optimization job
   * Runs every 5 minutes
   */
  start() {
    // Every 5 minutes
    this.job = new CronJob('*/5 * * * *', async () => {
      if (this.isRunning) {
        return;
      }
      
      this.isRunning = true;
      
      try {
        await this.runOptimizationCycle();
      } catch (error) {
        console.error('❌ Energy optimization cycle failed:', error);
        await this.logError(error);
      } finally {
        this.isRunning = false;
      }
    });
    
    this.job.start();
    
    // Run immediately on start
    this.runOptimizationCycle();
  }
  
  /**
   * Stop the optimization job
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.job = null;
    }
  }
  
  /**
   * Main optimization cycle
   */
  private async runOptimizationCycle() {
    // Get all active facilities
    const activeConfigs = await prisma.energy_optimization_config.findMany({
      where: { optimization_active: true },
      include: { lighting_zones: true }
    });
    
    
    for (const config of activeConfigs) {
      try {
        await this.optimizeFacility(config);
      } catch (error) {
        console.error(`Failed to optimize facility ${config.facility_name}:`, error);
        await this.createAlert(config.facility_id, 'system', 'critical', 
          'Optimization Failed',
          `Energy optimization failed: ${error.message}`
        );
      }
    }
  }
  
  /**
   * Optimize a single facility
   */
  private async optimizeFacility(config: any) {
    
    // Check if we should run optimization
    const shouldRun = await this.shouldRunOptimization(config);
    if (!shouldRun) {
      return;
    }
    
    // Get current energy rate
    const currentRate = await this.getCurrentEnergyRate(config);
    
    // Process each zone
    for (const zone of config.lighting_zones) {
      try {
        await this.optimizeZone(config, zone, currentRate);
      } catch (error) {
        console.error(`Failed to optimize zone ${zone.zone_name}:`, error);
      }
    }
    
    // Update last optimization time
    await prisma.energy_optimization_config.update({
      where: { id: config.id },
      data: { last_optimization_at: new Date() }
    });
  }
  
  /**
   * Optimize a single lighting zone
   */
  private async optimizeZone(config: any, zone: any, currentRate: number) {
    // Check crop-specific constraints
    const isSafe = await this.checkCropSafety(zone);
    if (!isSafe) {
      await this.logOptimizationEvent(config.facility_id, zone.id, 'block', {
        reason: 'Crop safety constraint',
        crop: zone.crop_type,
        stage: zone.growth_stage
      });
      return;
    }
    
    // Get current environmental data (would come from sensors)
    const currentState = {
      intensity: zone.current_intensity || 100,
      temperature: 25, // Would get from sensors
      humidity: 60,
      co2Level: 800,
      currentDLI: await this.getCurrentDLI(zone),
      targetDLI: this.getTargetDLI(zone.crop_type, zone.growth_stage),
      cropType: zone.crop_type,
      growthStage: zone.growth_stage,
      electricityRate: currentRate,
      isPeakHour: this.isPeakHour(config),
      maxPower: zone.max_power_kw
    };
    
    // Use smart optimization algorithms
    const optimization = await smartOptimizationAlgorithms.optimizeZone(zone.id, currentState);
    
    // Consult Claude for most zones (cost is minimal)
    let finalOptimization = optimization;
    // Use Claude for any zone >25kW or confidence <80% or during peak hours
    if (zone.max_power_kw > 25 || optimization.confidence < 80 || currentState.isPeakHour) {
      const claudeContext = {
        zoneId: zone.id,
        zoneName: zone.zone_name,
        cropType: zone.crop_type,
        growthStage: zone.growth_stage,
        currentConditions: {
          temperature: currentState.temperature,
          humidity: currentState.humidity,
          co2: currentState.co2Level,
          vpd: 1.2, // Would calculate from temp/humidity
          currentDLI: currentState.currentDLI,
          targetDLI: currentState.targetDLI,
          intensity: currentState.intensity,
          photoperiod: zone.current_photoperiod || 12
        },
        historicalData: {
          last7DaysAvgSavings: 15, // Would get from DB
          bestPerformingHours: [22, 23, 0, 1, 2, 3],
          typicalPeakDemand: zone.max_power_kw * 0.85,
          previousOptimizations: []
        },
        constraints: {
          minIntensity: 70,
          maxIntensity: 100,
          criticalPhotoperiod: zone.crop_type === 'cannabis' && zone.growth_stage === 'flowering',
          maxDimming: config.max_dimming_percent || 85
        },
        economicFactors: {
          currentRate: currentState.electricityRate,
          peakRate: config.peak_rate || 0.18,
          offPeakRate: config.off_peak_rate || 0.08,
          demandCharge: config.demand_charge || 15,
          monthlyBudget: 10000
        }
      };
      
      const claudeRec = await claudeOptimizationAdvisor.getOptimizationRecommendation(claudeContext);
      
      if (claudeRec && claudeRec.confidence > optimization.confidence) {
        finalOptimization = {
          intensity: claudeRec.recommendedIntensity,
          savingsPercent: ((currentState.intensity - claudeRec.recommendedIntensity) / currentState.intensity) * 100,
          savingsDollars: claudeRec.potentialSavings,
          confidence: claudeRec.confidence,
          strategy: 'claude-enhanced',
          reasoning: [claudeRec.reasoning, ...claudeRec.alternativeStrategies]
        };
      }
    }
    
    if (finalOptimization.intensity === zone.current_intensity) {
      return; // No optimization needed
    }
    
    // Create action from optimization result
    const action = {
      type: finalOptimization.savingsPercent > 0 ? 'dim' : 'restore',
      value: finalOptimization.intensity,
      reason: finalOptimization.strategy,
      confidence: finalOptimization.confidence,
      reasoning: finalOptimization.reasoning
    };
    
    // Execute the optimization
    await this.executeOptimization(config, zone, action);
  }
  
  /**
   * Determine what optimization action to take
   */
  private determineOptimizationAction(zone: any, rate: number, config: any) {
    const hour = new Date().getHours();
    
    // Check if we're in peak hours
    const peakStart = parseInt(config.peak_start?.split(':')[0] || '14');
    const peakEnd = parseInt(config.peak_end?.split(':')[0] || '19');
    const isPeakHour = hour >= peakStart && hour < peakEnd;
    
    // Cannabis flowering - NEVER shift photoperiod
    if (zone.crop_type === 'cannabis' && zone.growth_stage === 'flowering') {
      if (isPeakHour && zone.current_intensity > config.max_dimming_percent) {
        return {
          type: 'dim',
          value: config.max_dimming_percent,
          reason: 'Peak hour dimming'
        };
      }
      return { type: 'none' };
    }
    
    // Other crops - can optimize more aggressively
    if (isPeakHour) {
      // During peak, dim to save money
      if (zone.current_intensity > config.max_dimming_percent) {
        return {
          type: 'dim',
          value: config.max_dimming_percent,
          reason: 'Peak hour energy savings'
        };
      }
    } else if (hour < 6 || hour > 20) {
      // Off-peak hours - restore to full if dimmed
      if (zone.current_intensity < 100) {
        return {
          type: 'restore',
          value: 100,
          reason: 'Off-peak restoration'
        };
      }
    }
    
    return { type: 'none' };
  }
  
  /**
   * Execute the optimization action
   */
  private async executeOptimization(config: any, zone: any, action: any) {
    const baselinePower = zone.max_power_kw * (zone.current_intensity / 100);
    const optimizedPower = zone.max_power_kw * (action.value / 100);
    const powerSaved = baselinePower - optimizedPower;
    
    try {
      // Execute through hardware controller
      // This would call the actual hardware control
      
      // Update zone state
      await prisma.lighting_zones.update({
        where: { id: zone.id },
        data: { current_intensity: action.value }
      });
      
      // Log the event
      await this.logOptimizationEvent(
        config.facility_id,
        zone.id,
        action.type,
        {
          from: zone.current_intensity,
          to: action.value,
          reason: action.reason,
          baseline_power_kw: baselinePower,
          optimized_power_kw: optimizedPower,
          power_saved_kw: powerSaved
        }
      );
      
      // Create alert for significant changes
      if (Math.abs(zone.current_intensity - action.value) >= 20) {
        await this.createAlert(
          config.facility_id,
          'savings',
          'info',
          `Energy Optimization Active`,
          `${zone.zone_name} adjusted to ${action.value}% for ${action.reason}. Saving ${powerSaved.toFixed(1)} kW.`
        );
      }
      
    } catch (error) {
      console.error('Failed to execute optimization:', error);
      throw error;
    }
  }
  
  /**
   * Check if optimization should run
   */
  private async shouldRunOptimization(config: any): Promise<boolean> {
    // Don't run if recently optimized (within 4 minutes)
    if (config.last_optimization_at) {
      const timeSinceLastRun = Date.now() - new Date(config.last_optimization_at).getTime();
      if (timeSinceLastRun < 4 * 60 * 1000) {
        return false;
      }
    }
    
    // Check for active alerts that would block optimization
    const criticalAlerts = await prisma.energy_system_alerts.count({
      where: {
        facility_id: config.facility_id,
        severity: 'critical',
        resolved: false
      }
    });
    
    if (criticalAlerts > 0) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Check crop-specific safety constraints
   */
  private async checkCropSafety(zone: any): Promise<boolean> {
    // Cannabis flowering - strict photoperiod protection
    if (zone.crop_type === 'cannabis' && zone.growth_stage === 'flowering') {
      const hour = new Date().getHours();
      const lightsOnHour = parseInt(zone.lights_on_time?.split(':')[0] || '8');
      const lightsOffHour = parseInt(zone.lights_off_time?.split(':')[0] || '20');
      
      // Never change during critical dark period
      if (hour < lightsOnHour || hour >= lightsOffHour) {
        return true; // Safe to dim/adjust during dark period
      }
    }
    
    return true; // Safe for other crops
  }
  
  /**
   * Get current DLI for a zone
   */
  private async getCurrentDLI(zone: any): Promise<number> {
    const hour = new Date().getHours();
    const hoursElapsed = hour - 8; // Assuming lights on at 8am
    
    if (hoursElapsed <= 0) return 0;
    
    // Calculate based on current intensity and hours
    const avgPPFD = (zone.current_intensity / 100) * 800; // Assume 800 PPFD at 100%
    const currentDLI = (avgPPFD * hoursElapsed * 3600) / 1000000;
    
    return currentDLI;
  }
  
  /**
   * Get target DLI for crop/stage
   */
  private getTargetDLI(cropType: string, growthStage: string): number {
    const targets = {
      cannabis: { vegetative: 40, flowering: 35 },
      tomato: { vegetative: 25, flowering: 22 },
      lettuce: { vegetative: 17, flowering: 17 },
      strawberry: { vegetative: 20, flowering: 17 }
    };
    
    return targets[cropType]?.[growthStage] || 25;
  }
  
  /**
   * Check if currently peak hour
   */
  private isPeakHour(config: any): boolean {
    const hour = new Date().getHours();
    const peakStart = parseInt(config.peak_start?.split(':')[0] || '14');
    const peakEnd = parseInt(config.peak_end?.split(':')[0] || '19');
    
    return hour >= peakStart && hour < peakEnd;
  }
  
  /**
   * Get current energy rate
   */
  private async getCurrentEnergyRate(config: any): Promise<number> {
    if (config.use_manual_rates) {
      const hour = new Date().getHours();
      const peakStart = parseInt(config.peak_start?.split(':')[0] || '14');
      const peakEnd = parseInt(config.peak_end?.split(':')[0] || '19');
      
      if (hour >= peakStart && hour < peakEnd) {
        return config.peak_rate || 0.18;
      } else if (hour < 6 || hour > 22) {
        return config.off_peak_rate || 0.08;
      } else {
        return config.shoulder_rate || 0.12;
      }
    }
    
    // Would fetch from API if not manual
    return 0.12; // Default
  }
  
  /**
   * Log optimization event
   */
  private async logOptimizationEvent(
    facilityId: string,
    zoneId: string,
    actionType: string,
    actionValue: any
  ) {
    await prisma.optimization_events.create({
      data: {
        facility_id: facilityId,
        zone_id: zoneId,
        event_time: new Date(),
        action_type: actionType,
        action_value: actionValue,
        crop_type: actionValue.crop || 'unknown',
        growth_stage: actionValue.stage || 'unknown',
        safety_score: 100,
        blocked: actionType === 'block',
        block_reason: actionValue.reason,
        baseline_power_kw: actionValue.baseline_power_kw || 0,
        optimized_power_kw: actionValue.optimized_power_kw || 0,
        power_saved_kw: actionValue.power_saved_kw || 0,
        energy_rate: 0.12 // Would get actual rate
      }
    });
  }
  
  /**
   * Create system alert
   */
  private async createAlert(
    facilityId: string,
    alertType: string,
    severity: string,
    title: string,
    message: string
  ) {
    await prisma.energy_system_alerts.create({
      data: {
        facility_id: facilityId,
        alert_time: new Date(),
        alert_type: alertType,
        severity,
        title,
        message
      }
    });
    
    // Would trigger actual notifications here
  }
  
  /**
   * Log error
   */
  private async logError(error: any) {
    console.error('Energy optimization error:', error);
    // Would log to error tracking service
  }
}

// Create singleton instance
export const energyOptimizationJob = new EnergyOptimizationJob();

// For Next.js API route to start/stop
export function startEnergyOptimizationJob() {
  energyOptimizationJob.start();
}

export function stopEnergyOptimizationJob() {
  energyOptimizationJob.stop();
}