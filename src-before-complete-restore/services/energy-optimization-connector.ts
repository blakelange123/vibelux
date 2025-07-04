/**
 * Energy Optimization Connector
 * Bridges the existing control systems with the energy optimization engine
 */

import { controlSystemAdapter } from './control-system-adapter';
import { energyOptimizationJobs } from './energy-optimization-jobs';
import { prisma } from '@/lib/prisma';

export class EnergyOptimizationConnector {
  private static instance: EnergyOptimizationConnector;
  private isRunning = false;
  
  private constructor() {}
  
  static getInstance(): EnergyOptimizationConnector {
    if (!EnergyOptimizationConnector.instance) {
      EnergyOptimizationConnector.instance = new EnergyOptimizationConnector();
    }
    return EnergyOptimizationConnector.instance;
  }
  
  /**
   * Initialize and start the optimization system
   * Uses EXISTING control system integration
   */
  async start(facilityConfig: {
    id: string;
    facilityName: string;
    zipCode: string;
    controlSystemType: string;
    controlSystemConfig: any;
    selectedZones: string[];
    cropType: string;
    growthStage: string;
  }) {
    
    try {
      // 1. Create or update facility configuration
      await prisma.energy_optimization_config.upsert({
        where: { facility_id: facilityConfig.id },
        update: {
          facility_name: facilityConfig.facilityName,
          control_system_type: facilityConfig.controlSystemType,
          control_system_config: facilityConfig.controlSystemConfig,
          crop_type: facilityConfig.cropType,
          growth_stage: facilityConfig.growthStage,
          optimization_active: true,
          updated_at: new Date()
        },
        create: {
          facility_id: facilityConfig.id,
          facility_name: facilityConfig.facilityName,
          control_system_type: facilityConfig.controlSystemType,
          control_system_config: facilityConfig.controlSystemConfig,
          crop_type: facilityConfig.cropType,
          growth_stage: facilityConfig.growthStage,
          optimization_active: true
        }
      });
      
      // 2. Test connection to control system
      const connected = await controlSystemAdapter.connect(facilityConfig.id, {
        systemType: facilityConfig.controlSystemType,
        connectionParams: facilityConfig.controlSystemConfig,
        capabilities: {
          canReadPower: true,
          canControlLights: true,
          canReadSensors: true,
          hasScheduling: true,
          supportsAlerts: false
        },
        dataMapping: {}
      });
      
      if (!connected) {
        throw new Error('Failed to connect to control system');
      }
      
      
      // 3. Start background optimization jobs
      if (!this.isRunning) {
        await energyOptimizationJobs.start();
        this.isRunning = true;
      }
      
      
    } catch (error) {
      console.error('Failed to start energy optimization:', error);
      throw error;
    }
  }
  
  /**
   * Stop optimization system
   */
  async stop(facilityId: string) {
    
    try {
      // Disable optimization for facility
      await prisma.energy_optimization_config.update({
        where: { facility_id: facilityId },
        data: { optimization_active: false }
      });
      
      // Stop background jobs if no active facilities
      const activeFacilities = await prisma.energy_optimization_config.count({
        where: { optimization_active: true }
      });
      
      if (activeFacilities === 0) {
        energyOptimizationJobs.stop();
        this.isRunning = false;
      }
      
      
    } catch (error) {
      console.error('Failed to stop optimization:', error);
      throw error;
    }
  }
  
  /**
   * Get system status
   */
  getStatus(): {
    isRunning: boolean;
    activeFacilities: number;
  } {
    return {
      isRunning: this.isRunning,
      activeFacilities: 0 // Would query database in real implementation
    };
  }
}

// Export singleton
export const energyOptimizationConnector = EnergyOptimizationConnector.getInstance();