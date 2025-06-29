/**
 * Energy System Startup Service
 * Initializes all energy optimization components in the correct order
 */

import { energyOptimizationConnector } from './energy-optimization-connector';
import { energyMonitoringService } from './energy-monitoring-service';
import { emergencyStopSystem } from './emergency-stop-system';
import { energyOptimizationJob } from '@/jobs/energy-optimization-job';
import { prisma } from '@/lib/prisma';

export class EnergySystemStartup {
  private static instance: EnergySystemStartup;
  private isInitialized = false;
  
  private constructor() {}
  
  static getInstance(): EnergySystemStartup {
    if (!EnergySystemStartup.instance) {
      EnergySystemStartup.instance = new EnergySystemStartup();
    }
    return EnergySystemStartup.instance;
  }
  
  /**
   * Initialize the entire energy optimization system
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }
    
    
    try {
      // 1. Initialize emergency stop system first (safety critical)
      await emergencyStopSystem.initialize();
      
      // 2. Start monitoring service
      await energyMonitoringService.start();
      
      // 3. Check for active configurations
      const activeConfigs = await prisma.energy_optimization_config.count({
        where: { optimization_active: true }
      });
      
      if (activeConfigs > 0) {
        
        // 4. Start optimization job
        energyOptimizationJob.start();
        
        // 5. Verify all systems
        await this.verifySystemHealth();
        
      } else {
      }
      
      this.isInitialized = true;
      
      // Log startup event
      await prisma.energy_system_alerts.create({
        data: {
          facility_id: 'system',
          alert_time: new Date(),
          alert_type: 'system',
          severity: 'info',
          title: 'Energy System Started',
          message: `Energy optimization system initialized successfully with ${activeConfigs} active configurations`
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize energy system:', error);
      
      // Log failure
      await prisma.energy_system_alerts.create({
        data: {
          facility_id: 'system',
          alert_time: new Date(),
          alert_type: 'system',
          severity: 'critical',
          title: 'System Startup Failed',
          message: `Energy system failed to initialize: ${error.message}`
        }
      });
      
      throw error;
    }
  }
  
  /**
   * Shutdown the energy system gracefully
   */
  async shutdown() {
    
    try {
      // 1. Stop optimization job first
      energyOptimizationJob.stop();
      
      // 2. Stop monitoring
      await energyMonitoringService.stop();
      
      // 3. Shutdown emergency stop system (will ensure safe lighting levels)
      await emergencyStopSystem.shutdown();
      
      // Log shutdown
      await prisma.energy_system_alerts.create({
        data: {
          facility_id: 'system',
          alert_time: new Date(),
          alert_type: 'system',
          severity: 'info',
          title: 'System Shutdown',
          message: 'Energy optimization system shut down gracefully'
        }
      });
      
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
    
    this.isInitialized = false;
  }
  
  /**
   * Verify system health after startup
   */
  private async verifySystemHealth() {
    
    const checks = [
      {
        name: 'Database Connection',
        check: async () => {
          await prisma.$queryRaw`SELECT 1`;
          return true;
        }
      },
      {
        name: 'Emergency Stop System',
        check: async () => {
          const status = emergencyStopSystem.getStatus();
          return !status.active && status.heartbeatAge < 5000;
        }
      },
      {
        name: 'Hardware Communication',
        check: async () => {
          // Would check actual hardware here
          return true;
        }
      }
    ];
    
    for (const { name, check } of checks) {
      try {
        const passed = await check();
        if (!passed) {
          throw new Error(`Health check failed: ${name}`);
        }
      } catch (error) {
        console.error(`  ❌ ${name}: ERROR - ${error.message}`);
        throw error;
      }
    }
    
  }
  
  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      emergencyStop: emergencyStopSystem.getStatus(),
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton
export const energySystemStartup = EnergySystemStartup.getInstance();

// For Next.js app initialization
export async function initializeEnergySystem() {
  try {
    await energySystemStartup.initialize();
  } catch (error) {
    console.error('Failed to initialize energy system:', error);
  }
}

// For graceful shutdown
export async function shutdownEnergySystem() {
  await energySystemStartup.shutdown();
}