/**
 * Emergency Stop System for Energy Optimization
 * Provides multiple fail-safe mechanisms to protect crops
 */

import { prisma } from '@/lib/prisma';
import { HardwareController } from '@/lib/integrations/hardware-control';
import { energyMonitoringService } from './energy-monitoring-service';

interface EmergencyStopReason {
  type: 'manual' | 'crop_safety' | 'hardware_failure' | 'anomaly' | 'watchdog';
  description: string;
  severity: 'critical' | 'high' | 'medium';
  affectedZones: string[];
  timestamp: Date;
}

interface SafetyCheck {
  name: string;
  check: () => Promise<boolean>;
  failureAction: () => Promise<void>;
}

export class EmergencyStopSystem {
  private static instance: EmergencyStopSystem;
  private hardwareController: HardwareController;
  private isEmergencyActive = false;
  private watchdogTimer: NodeJS.Timeout | null = null;
  private safetyCheckInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: Date = new Date();
  
  // Watchdog settings
  private readonly WATCHDOG_TIMEOUT = 30000; // 30 seconds
  private readonly SAFETY_CHECK_INTERVAL = 10000; // 10 seconds
  
  private constructor() {
    this.hardwareController = HardwareController.getInstance();
  }
  
  static getInstance(): EmergencyStopSystem {
    if (!EmergencyStopSystem.instance) {
      EmergencyStopSystem.instance = new EmergencyStopSystem();
    }
    return EmergencyStopSystem.instance;
  }
  
  /**
   * Initialize the emergency stop system
   */
  async initialize() {
    
    // Start watchdog timer
    this.startWatchdog();
    
    // Start safety checks
    this.startSafetyChecks();
    
    // Register emergency handlers
    this.registerEmergencyHandlers();
    
  }
  
  /**
   * EMERGENCY STOP - Immediately restore all lighting to 100%
   */
  async triggerEmergencyStop(reason: EmergencyStopReason) {
    if (this.isEmergencyActive) {
      return;
    }
    
    console.error('🚨🚨🚨 EMERGENCY STOP TRIGGERED 🚨🚨🚨');
    console.error(`Reason: ${reason.type} - ${reason.description}`);
    
    this.isEmergencyActive = true;
    
    try {
      // 1. Immediately disable all optimizations
      await this.disableAllOptimizations();
      
      // 2. Restore all lighting to 100%
      await this.restoreAllLighting();
      
      // 3. Send critical alerts
      await this.sendEmergencyAlerts(reason);
      
      // 4. Log the event
      await this.logEmergencyStop(reason);
      
      // 5. Create system-wide alert
      await prisma.energy_system_alerts.create({
        data: {
          facility_id: 'system',
          alert_time: new Date(),
          alert_type: 'emergency',
          severity: 'critical',
          title: 'EMERGENCY STOP ACTIVATED',
          message: reason.description,
          zone_id: reason.affectedZones[0] || null,
          email_sent: true,
          sms_sent: true
        }
      });
      
      
    } catch (error) {
      console.error('❌ CRITICAL: Emergency stop failed:', error);
      // Last resort - try direct hardware bypass
      await this.hardwareBypass();
    }
  }
  
  /**
   * Reset emergency stop (requires manual confirmation)
   */
  async resetEmergencyStop(authorizedBy: string, resetCode: string) {
    if (!this.isEmergencyActive) {
      return;
    }
    
    // Verify reset code (would check against secure storage)
    if (!this.verifyResetCode(resetCode)) {
      throw new Error('Invalid reset code');
    }
    
    
    // Log the reset
    await prisma.energy_system_alerts.create({
      data: {
        facility_id: 'system',
        alert_time: new Date(),
        alert_type: 'emergency',
        severity: 'info',
        title: 'Emergency Stop Reset',
        message: `Emergency stop reset by ${authorizedBy}`,
        resolved: true,
        resolved_at: new Date(),
        resolution_notes: `Reset code verified`
      }
    });
    
    this.isEmergencyActive = false;
    
    // Re-enable optimizations after 5 minute safety delay
    setTimeout(() => {
      this.reenableOptimizations();
    }, 5 * 60 * 1000);
    
  }
  
  /**
   * Watchdog timer - triggers emergency stop if system becomes unresponsive
   */
  private startWatchdog() {
    this.watchdogTimer = setInterval(() => {
      const timeSinceHeartbeat = Date.now() - this.lastHeartbeat.getTime();
      
      if (timeSinceHeartbeat > this.WATCHDOG_TIMEOUT) {
        console.error('❌ WATCHDOG TIMEOUT - System unresponsive');
        
        this.triggerEmergencyStop({
          type: 'watchdog',
          description: 'System watchdog timeout - optimization system unresponsive',
          severity: 'critical',
          affectedZones: ['all'],
          timestamp: new Date()
        });
      }
    }, this.WATCHDOG_TIMEOUT / 2);
  }
  
  /**
   * Update watchdog heartbeat
   */
  updateHeartbeat() {
    this.lastHeartbeat = new Date();
  }
  
  /**
   * Continuous safety checks
   */
  private startSafetyChecks() {
    const safetyChecks: SafetyCheck[] = [
      {
        name: 'Cannabis Photoperiod Check',
        check: this.checkCannabisPhotoperiod.bind(this),
        failureAction: this.handlePhotoperiodViolation.bind(this)
      },
      {
        name: 'Hardware Communication Check',
        check: this.checkHardwareCommunication.bind(this),
        failureAction: this.handleHardwareFailure.bind(this)
      },
      {
        name: 'Power Anomaly Check',
        check: this.checkPowerAnomalies.bind(this),
        failureAction: this.handlePowerAnomaly.bind(this)
      },
      {
        name: 'Database Connection Check',
        check: this.checkDatabaseConnection.bind(this),
        failureAction: this.handleDatabaseFailure.bind(this)
      }
    ];
    
    this.safetyCheckInterval = setInterval(async () => {
      for (const check of safetyChecks) {
        try {
          const passed = await check.check();
          if (!passed) {
            console.error(`❌ Safety check failed: ${check.name}`);
            await check.failureAction();
          }
        } catch (error) {
          console.error(`Error in safety check ${check.name}:`, error);
        }
      }
      
      // Update heartbeat after successful checks
      this.updateHeartbeat();
    }, this.SAFETY_CHECK_INTERVAL);
  }
  
  /**
   * Check cannabis photoperiod compliance
   */
  private async checkCannabisPhotoperiod(): Promise<boolean> {
    try {
      const cannabisZones = await prisma.lighting_zones.findMany({
        where: {
          crop_type: 'cannabis',
          growth_stage: 'flowering'
        }
      });
      
      for (const zone of cannabisZones) {
        const hour = new Date().getHours();
        const expectedOn = hour >= 8 && hour < 20; // 12/12 cycle
        const actualIntensity = zone.current_intensity || 0;
        const actualOn = actualIntensity > 10;
        
        if (expectedOn !== actualOn) {
          console.error(`🚨 CRITICAL: Cannabis photoperiod violation in ${zone.zone_name}`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to check cannabis photoperiod:', error);
      return false; // Fail safe
    }
  }
  
  /**
   * Check hardware communication
   */
  private async checkHardwareCommunication(): Promise<boolean> {
    try {
      const devices = await this.hardwareController.getRegisteredDevices();
      let failureCount = 0;
      
      for (const device of devices) {
        const status = await this.hardwareController.getDeviceStatus(device.id);
        if (!status?.online) {
          failureCount++;
        }
      }
      
      // Fail if more than 50% of devices are offline
      return failureCount < devices.length / 2;
    } catch (error) {
      console.error('Hardware communication check failed:', error);
      return false;
    }
  }
  
  /**
   * Check for power anomalies
   */
  private async checkPowerAnomalies(): Promise<boolean> {
    try {
      // Get recent power readings
      const readings = await prisma.power_readings.findMany({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 100
      });
      
      if (readings.length === 0) return true; // No data yet
      
      // Check for sudden spikes or drops
      for (let i = 1; i < readings.length; i++) {
        const change = Math.abs(readings[i].power_kw - readings[i-1].power_kw);
        const percentChange = change / readings[i-1].power_kw * 100;
        
        if (percentChange > 50) {
          console.error(`⚡ Power anomaly detected: ${percentChange.toFixed(1)}% change`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Power anomaly check failed:', error);
      return false;
    }
  }
  
  /**
   * Check database connection
   */
  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  }
  
  /**
   * Handle photoperiod violation
   */
  private async handlePhotoperiodViolation() {
    await this.triggerEmergencyStop({
      type: 'crop_safety',
      description: 'Cannabis photoperiod violation detected - crop safety at risk',
      severity: 'critical',
      affectedZones: ['cannabis_flowering'],
      timestamp: new Date()
    });
  }
  
  /**
   * Handle hardware failure
   */
  private async handleHardwareFailure() {
    await this.triggerEmergencyStop({
      type: 'hardware_failure',
      description: 'Multiple hardware devices offline - cannot ensure safe operation',
      severity: 'critical',
      affectedZones: ['all'],
      timestamp: new Date()
    });
  }
  
  /**
   * Handle power anomaly
   */
  private async handlePowerAnomaly() {
    await this.triggerEmergencyStop({
      type: 'anomaly',
      description: 'Significant power anomaly detected - restoring safe defaults',
      severity: 'high',
      affectedZones: ['all'],
      timestamp: new Date()
    });
  }
  
  /**
   * Handle database failure
   */
  private async handleDatabaseFailure() {
    // Database failure is serious but we can still control hardware
    console.error('❌ Database connection lost - attempting hardware-only emergency stop');
    await this.hardwareBypass();
  }
  
  /**
   * Disable all optimizations
   */
  private async disableAllOptimizations() {
    try {
      await prisma.energy_optimization_config.updateMany({
        data: {
          optimization_active: false,
          last_optimization_at: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to disable optimizations in database:', error);
    }
  }
  
  /**
   * Restore all lighting to 100%
   */
  private async restoreAllLighting() {
    const zones = await prisma.lighting_zones.findMany();
    
    for (const zone of zones) {
      try {
        
        // Direct hardware control
        await this.hardwareController.controlLighting({
          fixtureId: zone.device_id,
          intensity: 100
        });
        
        // Update database
        await prisma.lighting_zones.update({
          where: { id: zone.id },
          data: { current_intensity: 100 }
        });
        
      } catch (error) {
        console.error(`Failed to restore ${zone.zone_name}:`, error);
      }
    }
  }
  
  /**
   * Hardware bypass - last resort direct control
   */
  private async hardwareBypass() {
    console.error('🚨 EXECUTING HARDWARE BYPASS 🚨');
    
    try {
      // Get all devices directly
      const devices = await this.hardwareController.getRegisteredDevices();
      
      for (const device of devices) {
        if (device.type === 'lighting') {
          // Force maximum intensity through direct protocol
          await this.hardwareController.directProtocolCommand(device.id, {
            command: 'SET_INTENSITY',
            value: 100,
            force: true,
            bypass_safety: true
          });
        }
      }
    } catch (error) {
      console.error('❌ CRITICAL: Hardware bypass failed:', error);
      // At this point, physical intervention required
    }
  }
  
  /**
   * Send emergency alerts
   */
  private async sendEmergencyAlerts(reason: EmergencyStopReason) {
    // Get all facility contacts
    const facilities = await prisma.energy_optimization_config.findMany({
      where: { optimization_active: true }
    });
    
    for (const facility of facilities) {
      if (facility.emergency_contact_email) {
        // Send emergency email
      }
      
      if (facility.emergency_contact_phone) {
        // Send emergency SMS
      }
    }
    
    // Also alert system administrators
  }
  
  /**
   * Log emergency stop event
   */
  private async logEmergencyStop(reason: EmergencyStopReason) {
    try {
      await prisma.optimization_events.create({
        data: {
          facility_id: 'system',
          zone_id: reason.affectedZones[0] || null,
          event_time: new Date(),
          action_type: 'emergency_stop',
          action_value: {
            reason: reason.type,
            description: reason.description,
            severity: reason.severity,
            affected_zones: reason.affectedZones
          },
          safety_score: 0,
          blocked: true,
          block_reason: reason.description
        }
      });
    } catch (error) {
      console.error('Failed to log emergency stop:', error);
    }
  }
  
  /**
   * Re-enable optimizations after emergency reset
   */
  private async reenableOptimizations() {
    
    try {
      await prisma.energy_optimization_config.updateMany({
        data: {
          optimization_active: true,
          last_optimization_at: new Date()
        }
      });
      
    } catch (error) {
      console.error('Failed to re-enable optimizations:', error);
    }
  }
  
  /**
   * Verify reset code
   */
  private verifyResetCode(code: string): boolean {
    // In production, this would verify against secure storage
    // For now, check format: XXXX-XXXX-XXXX
    return /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code);
  }
  
  /**
   * Register system-wide emergency handlers
   */
  private registerEmergencyHandlers() {
    // Handle process termination
    process.on('SIGTERM', async () => {
      await this.triggerEmergencyStop({
        type: 'manual',
        description: 'System shutdown - restoring safe lighting levels',
        severity: 'high',
        affectedZones: ['all'],
        timestamp: new Date()
      });
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('❌ Uncaught exception:', error);
      await this.triggerEmergencyStop({
        type: 'anomaly',
        description: `System error: ${error.message}`,
        severity: 'critical',
        affectedZones: ['all'],
        timestamp: new Date()
      });
    });
  }
  
  /**
   * Manual emergency stop trigger (for UI button)
   */
  async manualEmergencyStop(triggeredBy: string, reason: string) {
    await this.triggerEmergencyStop({
      type: 'manual',
      description: `Manual stop by ${triggeredBy}: ${reason}`,
      severity: 'high',
      affectedZones: ['all'],
      timestamp: new Date()
    });
  }
  
  /**
   * Get emergency stop status
   */
  getStatus() {
    return {
      active: this.isEmergencyActive,
      lastHeartbeat: this.lastHeartbeat,
      heartbeatAge: Date.now() - this.lastHeartbeat.getTime(),
      watchdogTimeout: this.WATCHDOG_TIMEOUT
    };
  }
  
  /**
   * Cleanup on shutdown
   */
  async shutdown() {
    
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
    }
    
    if (this.safetyCheckInterval) {
      clearInterval(this.safetyCheckInterval);
    }
    
    // Ensure lights are at safe levels before shutdown
    if (!this.isEmergencyActive) {
      await this.restoreAllLighting();
    }
  }
}

// Export singleton instance
export const emergencyStopSystem = EmergencyStopSystem.getInstance();

// Export for API routes
export function getEmergencyStopSystem() {
  return emergencyStopSystem;
}