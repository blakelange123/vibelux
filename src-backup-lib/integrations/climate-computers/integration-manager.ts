/**
 * Climate Computer Integration Manager
 * 
 * Unified interface for managing multiple climate computer integrations
 * Supports Priva, Hortimax, Argus Controls, and other major brands
 */

import { EquipmentDefinition } from '@/lib/hmi/equipment-registry';
import { 
  BrowserSafeClimateAdapter, 
  MockClimateConfig, 
  discoverMockSystems,
  createBrowserSafeAdapter 
} from './browser-safe-adapters';

// Server-side adapter imports will be done dynamically to avoid browser issues

export type ClimateComputerBrand = 'priva' | 'hortimax' | 'argus' | 'trolmaster' | 'growlink' | 'autogrow' | 'netafim';

export interface ClimateComputerConfig {
  id: string;
  name: string;
  brand: ClimateComputerBrand;
  facilityId: string;
  config: any; // Generic config since we can't import types in browser
  enabled: boolean;
  lastSync?: Date;
}

export interface UnifiedDataPoint {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  status: 'good' | 'bad' | 'uncertain' | 'maintenance';
  type: 'sensor' | 'setpoint' | 'output' | 'calculated';
  category: 'environmental' | 'irrigation' | 'lighting' | 'co2' | 'energy' | 'security';
  source: {
    brand: ClimateComputerBrand;
    integrationId: string;
    originalId: string;
  };
  zone?: string;
  facility?: string;
}

export interface SyncResult {
  integrationId: string;
  success: boolean;
  dataPointsRead: number;
  equipmentDiscovered: number;
  errors: string[];
  syncTime: Date;
}

export class ClimateComputerIntegrationManager {
  private integrations = new Map<string, any>();
  private configs = new Map<string, ClimateComputerConfig>();
  private dataCache = new Map<string, UnifiedDataPoint[]>();
  private syncInterval?: NodeJS.Timeout;

  constructor() {
    // Initialize with auto-discovery on startup
    this.initialize();
  }

  /**
   * Initialize the integration manager
   */
  private async initialize(): Promise<void> {
    // Load saved configurations from database/storage
    await this.loadConfigurations();
    
    // Start periodic sync if enabled
    this.startPeriodicSync();
  }

  /**
   * Add a new climate computer integration
   */
  async addIntegration(config: ClimateComputerConfig): Promise<boolean> {
    try {
      let adapter: any;

      // Use browser-safe adapters in browser environment
      if (typeof window !== 'undefined') {
        // Convert config to mock format for browser demo
        const mockConfig: MockClimateConfig = {
          id: config.id,
          name: config.name,
          brand: config.brand as any,
          host: config.config.host || 'localhost',
          port: config.config.port || 502,
          username: config.config.username || 'admin',
          facilityId: config.facilityId
        };
        adapter = createBrowserSafeAdapter(mockConfig);
      } else {
        // Server-side real adapters - use dynamic imports
        switch (config.brand) {
          case 'priva':
            const privaModule = await import('./priva-adapter');
            adapter = privaModule.createPrivaAdapter(config.config);
            break;
          case 'hortimax':
            const hortimaxModule = await import('./hortimax-adapter');
            adapter = hortimaxModule.createHortimaxAdapter(config.config);
            break;
          case 'argus':
            const argusModule = await import('./argus-adapter');
            adapter = argusModule.createArgusAdapter(config.config);
            break;
          case 'trolmaster':
            adapter = await this.createTrolmasterAdapter(config.config);
            break;
          case 'growlink':
            adapter = await this.createGrowlinkAdapter(config.config);
            break;
          default:
            throw new Error(`Unsupported brand: ${config.brand}`);
        }
      }

      // Test connection
      const connected = await adapter.connect();
      if (!connected) {
        throw new Error('Failed to connect to climate computer');
      }

      // Store the adapter and config
      this.integrations.set(config.id, adapter);
      this.configs.set(config.id, config);

      // Save configuration
      await this.saveConfiguration(config);

      // Perform initial sync
      await this.syncIntegration(config.id);

      return true;
    } catch (error) {
      console.error(`Failed to add integration ${config.id}:`, error);
      return false;
    }
  }

  /**
   * Remove an integration
   */
  async removeIntegration(integrationId: string): Promise<boolean> {
    try {
      const adapter = this.integrations.get(integrationId);
      if (adapter) {
        await adapter.disconnect();
        this.integrations.delete(integrationId);
      }

      this.configs.delete(integrationId);
      this.dataCache.delete(integrationId);

      // Remove from storage
      await this.deleteConfiguration(integrationId);

      return true;
    } catch (error) {
      console.error(`Failed to remove integration ${integrationId}:`, error);
      return false;
    }
  }

  /**
   * Auto-discover climate computers on the network
   */
  async autoDiscover(networkRange: string = '192.168.1'): Promise<ClimateComputerConfig[]> {
    const discovered: ClimateComputerConfig[] = [];

    try {
      if (typeof window !== 'undefined') {
        // Browser environment - use mock discovery
        const mockSystems = await discoverMockSystems(networkRange);
        
        for (const mockSystem of mockSystems) {
          discovered.push({
            id: mockSystem.id,
            name: mockSystem.name,
            brand: mockSystem.brand,
            facilityId: mockSystem.facilityId,
            config: {
              host: mockSystem.host,
              port: mockSystem.port,
              username: mockSystem.username,
              facilityId: mockSystem.facilityId
            },
            enabled: false
          });
        }
      } else {
        // Server environment - use real discovery with dynamic imports
        try {
          const [privaModule, hortimaxModule, argusModule] = await Promise.allSettled([
            import('./priva-adapter'),
            import('./hortimax-adapter'),
            import('./argus-adapter')
          ]);

          const discoveryPromises = [];
          
          if (privaModule.status === 'fulfilled') {
            discoveryPromises.push(privaModule.value.discoverPrivaSystems(networkRange));
          }
          if (hortimaxModule.status === 'fulfilled') {
            discoveryPromises.push(hortimaxModule.value.discoverHortimaxSystems(networkRange));
          }
          if (argusModule.status === 'fulfilled') {
            discoveryPromises.push(argusModule.value.discoverArgusSystems(networkRange));
          }

          const results = await Promise.allSettled(discoveryPromises);
          
          // Process Priva results
          if (results[0]?.status === 'fulfilled') {
            for (const config of results[0].value) {
              discovered.push({
                id: `priva-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
                name: `Priva System (${config.host})`,
                brand: 'priva',
                facilityId: config.facilityId,
                config,
                enabled: false
              });
            }
          }

          // Process Hortimax results
          if (results[1]?.status === 'fulfilled') {
            for (const config of results[1].value) {
              discovered.push({
                id: `hortimax-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
                name: `Hortimax ${config.type} (${config.host})`,
                brand: 'hortimax',
                facilityId: config.greenhouseId,
                config,
                enabled: false
              });
            }
          }

          // Process Argus results
          if (results[2]?.status === 'fulfilled') {
            for (const config of results[2].value) {
              discovered.push({
                id: `argus-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
                name: `Argus ${config.systemType} (${config.host})`,
                brand: 'argus',
                facilityId: config.facilityId,
                config,
                enabled: false
              });
            }
          }
        } catch (error) {
          console.error('Server-side discovery failed:', error);
        }
      }
    } catch (error) {
      console.error('Auto-discovery failed:', error);
    }

    return discovered;
  }

  /**
   * Sync data from all enabled integrations
   */
  async syncAll(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const [integrationId, config] of this.configs.entries()) {
      if (config.enabled) {
        const result = await this.syncIntegration(integrationId);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Sync data from a specific integration
   */
  async syncIntegration(integrationId: string): Promise<SyncResult> {
    const result: SyncResult = {
      integrationId,
      success: false,
      dataPointsRead: 0,
      equipmentDiscovered: 0,
      errors: [],
      syncTime: new Date()
    };

    try {
      const adapter = this.integrations.get(integrationId);
      const config = this.configs.get(integrationId);

      if (!adapter || !config) {
        throw new Error('Integration not found');
      }

      // Discover equipment
      const equipment = await adapter.discoverEquipment();
      result.equipmentDiscovered = equipment.length;

      // Get all data point IDs
      const pointIds = this.extractDataPointIds(equipment);

      // Read current data
      const dataPoints = await adapter.readData(pointIds);
      result.dataPointsRead = dataPoints.length;

      // Convert to unified format
      const unifiedDataPoints = dataPoints.map(point => this.convertToUnifiedDataPoint(point, config));

      // Cache the data
      this.dataCache.set(integrationId, unifiedDataPoints);

      // Update last sync time
      config.lastSync = new Date();
      await this.saveConfiguration(config);

      result.success = true;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      console.error(`Sync failed for integration ${integrationId}:`, error);
    }

    return result;
  }

  /**
   * Get unified data from all integrations
   */
  getUnifiedData(facilityId?: string): UnifiedDataPoint[] {
    const allData: UnifiedDataPoint[] = [];

    for (const [integrationId, dataPoints] of this.dataCache.entries()) {
      for (const point of dataPoints) {
        if (!facilityId || point.facility === facilityId) {
          allData.push(point);
        }
      }
    }

    return allData;
  }

  /**
   * Write setpoint across all relevant integrations
   */
  async writeSetpoint(pointId: string, value: number, facilityId?: string): Promise<boolean> {
    let success = false;

    for (const [integrationId, adapter] of this.integrations.entries()) {
      const config = this.configs.get(integrationId);
      
      if (config && config.enabled && (!facilityId || config.facilityId === facilityId)) {
        try {
          const result = await adapter.writeSetpoint(pointId, value);
          if (result) success = true;
        } catch (error) {
          console.error(`Failed to write setpoint via ${integrationId}:`, error);
        }
      }
    }

    return success;
  }

  /**
   * Get all discovered equipment from all integrations
   */
  async getAllEquipment(facilityId?: string): Promise<EquipmentDefinition[]> {
    const allEquipment: EquipmentDefinition[] = [];

    for (const [integrationId, adapter] of this.integrations.entries()) {
      const config = this.configs.get(integrationId);
      
      if (config && config.enabled && (!facilityId || config.facilityId === facilityId)) {
        try {
          const equipment = await adapter.discoverEquipment();
          
          // Add source metadata to each equipment
          for (const eq of equipment) {
            eq.id = `${integrationId}-${eq.id}`;
            eq.specifications = {
              ...eq.specifications,
              source: {
                brand: config.brand,
                integrationId,
                originalId: eq.id
              }
            };
          }
          
          allEquipment.push(...equipment);
        } catch (error) {
          console.error(`Failed to get equipment from ${integrationId}:`, error);
        }
      }
    }

    return allEquipment;
  }

  /**
   * Get integration status summary
   */
  getIntegrationStatus(): Array<{
    id: string;
    name: string;
    brand: ClimateComputerBrand;
    enabled: boolean;
    connected: boolean;
    lastSync?: Date;
    dataPointCount: number;
  }> {
    const status = [];

    for (const [integrationId, config] of this.configs.entries()) {
      const dataPoints = this.dataCache.get(integrationId) || [];
      
      status.push({
        id: integrationId,
        name: config.name,
        brand: config.brand,
        enabled: config.enabled,
        connected: this.integrations.has(integrationId),
        lastSync: config.lastSync,
        dataPointCount: dataPoints.length
      });
    }

    return status;
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(intervalMs: number = 300000): void { // 5 minutes
    this.syncInterval = setInterval(() => {
      this.syncAll().catch(error => {
        console.error('Periodic sync failed:', error);
      });
    }, intervalMs);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  /**
   * Convert adapter-specific data point to unified format
   */
  private convertToUnifiedDataPoint(dataPoint: any, config: ClimateComputerConfig): UnifiedDataPoint {
    return {
      id: `${config.id}-${dataPoint.id}`,
      name: dataPoint.name,
      value: dataPoint.value,
      unit: dataPoint.unit,
      timestamp: dataPoint.timestamp,
      status: dataPoint.status || dataPoint.quality || 'good',
      type: dataPoint.type,
      category: dataPoint.category || dataPoint.group || 'environmental',
      source: {
        brand: config.brand,
        integrationId: config.id,
        originalId: dataPoint.id
      },
      zone: dataPoint.zone,
      facility: config.facilityId
    };
  }

  /**
   * Extract data point IDs from equipment definitions
   */
  private extractDataPointIds(equipment: EquipmentDefinition[]): string[] {
    const pointIds: string[] = [];

    for (const eq of equipment) {
      // Extract from control points
      for (const cp of eq.controlPoints) {
        pointIds.push(cp.id);
      }
      
      // Extract from telemetry
      for (const tp of eq.telemetry) {
        pointIds.push(tp.id);
      }
    }

    return [...new Set(pointIds)]; // Remove duplicates
  }

  /**
   * Helper methods for specific brand adapters
   */

  private async createTrolmasterAdapter(config: any): Promise<any> {
    // Placeholder for Trolmaster adapter
    throw new Error('Trolmaster adapter not yet implemented');
  }

  private async createGrowlinkAdapter(config: any): Promise<any> {
    // Placeholder for Growlink adapter
    throw new Error('Growlink adapter not yet implemented');
  }

  /**
   * Configuration persistence methods
   */
  private async loadConfigurations(): Promise<void> {
    // In a real implementation, this would load from database
    // For now, we'll use localStorage if available
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('climate-computer-configs');
      if (saved) {
        const configs = JSON.parse(saved);
        for (const config of configs) {
          this.configs.set(config.id, config);
        }
      }
    }
  }

  private async saveConfiguration(config: ClimateComputerConfig): Promise<void> {
    // In a real implementation, this would save to database
    if (typeof window !== 'undefined' && window.localStorage) {
      const allConfigs = Array.from(this.configs.values());
      localStorage.setItem('climate-computer-configs', JSON.stringify(allConfigs));
    }
  }

  private async deleteConfiguration(integrationId: string): Promise<void> {
    // Remove from storage
    if (typeof window !== 'undefined' && window.localStorage) {
      const allConfigs = Array.from(this.configs.values());
      localStorage.setItem('climate-computer-configs', JSON.stringify(allConfigs));
    }
  }
}

// Singleton instance
export const climateComputerManager = new ClimateComputerIntegrationManager();

// Export types and utilities
export type { 
  ClimateComputerConfig, 
  UnifiedDataPoint, 
  SyncResult 
};