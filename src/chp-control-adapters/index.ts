/**
 * CHP Control Adapters - Main Export Module
 * Provides a unified interface for all CHP control system integrations
 */

// Base adapter and interfaces
export { 
  BaseCHPAdapter,
  type CHPOperationalData,
  type CHPControlCommand,
  type CHPControlResponse,
  type CHPSystemInfo,
  type CHPConnectionConfig
} from './base-adapter'

// Specific adapter implementations
export { ModbusCHPAdapter } from './modbus-adapter'
export { BACnetCHPAdapter } from './bacnet-adapter'
export { APICHPAdapter } from './api-adapter'

// Factory and management
export { 
  CHPAdapterFactory,
  CHPAdapterManager,
  type CHPAdapterConfig
} from './adapter-factory'

// Utility functions for quick setup
export const CHPAdapters = {
  /**
   * Quick setup for common CHP manufacturers
   */
  async createForManufacturer(
    manufacturer: string,
    model: string,
    host: string,
    port: number,
    options?: {
      protocol?: 'modbus-tcp' | 'modbus-rtu' | 'bacnet-ip' | 'api'
      authentication?: {
        username?: string
        password?: string
        apiKey?: string
      }
      timeout?: number
    }
  ) {
    const connectionConfig = {
      host,
      port,
      protocol: options?.protocol || 'modbus-tcp',
      timeout: options?.timeout || 5000,
      retryAttempts: 3,
      authentication: options?.authentication
    }

    const adapterConfig = CHPAdapterFactory.createConfigForManufacturer(
      manufacturer,
      model,
      connectionConfig
    )

    return CHPAdapterFactory.createAdapter(adapterConfig)
  },

  /**
   * Create a simple Modbus TCP adapter
   */
  async createModbusTCP(host: string, port: number = 502, unitId: number = 1) {
    const config = {
      type: 'modbus-tcp' as const,
      connection: {
        host,
        port,
        protocol: 'modbus-tcp' as const,
        unitId,
        timeout: 5000,
        retryAttempts: 3
      }
    }

    return CHPAdapterFactory.createAdapter(config)
  },

  /**
   * Create a BACnet IP adapter
   */
  async createBACnetIP(host: string, port: number = 47808, deviceId: number = 1001) {
    const config = {
      type: 'bacnet-ip' as const,
      connection: {
        host,
        port,
        protocol: 'bacnet' as const,
        timeout: 5000,
        retryAttempts: 3
      },
      specific: {
        bacnet: {
          deviceId
        }
      }
    }

    return CHPAdapterFactory.createAdapter(config)
  },

  /**
   * Create an API adapter
   */
  async createAPI(
    baseUrl: string,
    authType: 'none' | 'basic' | 'bearer' | 'api-key' = 'none',
    credentials?: { username?: string; password?: string; apiKey?: string }
  ) {
    const url = new URL(baseUrl)
    
    const config = {
      type: 'api' as const,
      connection: {
        host: url.hostname,
        port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
        protocol: 'api' as const,
        timeout: 10000,
        retryAttempts: 3,
        authentication: credentials
      },
      specific: {
        api: {
          baseUrl,
          endpoints: {
            status: '/api/v1/status',
            control: '/api/v1/control',
            systemInfo: '/api/v1/system',
            alarms: '/api/v1/alarms',
            maintenance: '/api/v1/maintenance'
          },
          authType,
          rateLimiting: {
            requestsPerMinute: 60,
            burstLimit: 10
          }
        }
      }
    }

    return CHPAdapterFactory.createAdapter(config)
  }
}

/**
 * Predefined configurations for popular CHP manufacturers
 */
export const CHPManufacturerConfigs = {
  caterpillar: {
    protocols: ['modbus-tcp', 'modbus-rtu'],
    defaultPort: 502,
    features: ['engine-monitoring', 'power-generation', 'heat-recovery'],
    scalingFactors: {
      power: 1,
      voltage: 1,
      current: 0.1,
      temperature: 0.1
    }
  },
  
  ge: {
    protocols: ['bacnet-ip', 'modbus-tcp'],
    defaultPort: 47808,
    features: ['comprehensive-monitoring', 'advanced-controls', 'predictive-maintenance'],
    objectMap: 'standard-bacnet'
  },
  
  clarke: {
    protocols: ['api', 'modbus-tcp'],
    defaultPort: 80,
    features: ['web-interface', 'cloud-connectivity', 'mobile-app'],
    apiEndpoints: {
      status: '/api/engine/status',
      control: '/api/engine/control',
      diagnostics: '/api/engine/diagnostics'
    }
  },
  
  cummins: {
    protocols: ['modbus-tcp', 'modbus-rtu'],
    defaultPort: 502,
    features: ['industrial-grade', 'high-reliability', 'remote-monitoring'],
    registerOffsets: {
      powerOutput: 40001,
      engineSpeed: 40002,
      engineTemp: 40010
    }
  },
  
  capstone: {
    protocols: ['modbus-tcp', 'api'],
    defaultPort: 502,
    features: ['microturbine', 'low-emissions', 'quiet-operation'],
    scalingFactors: {
      power: 0.01,
      engineSpeed: 10,
      temperature: 0.1
    }
  }
}

/**
 * Health monitoring utility
 */
export class CHPHealthMonitor {
  private manager: CHPAdapterManager
  private alertThresholds: { [metric: string]: number } = {
    responseTime: 5000, // ms
    dataAge: 60, // seconds
    engineTemp: 220, // °F
    coolantTemp: 190, // °F
    oilPressure: 30 // PSI minimum
  }

  constructor(manager: CHPAdapterManager) {
    this.manager = manager
    this.setupMonitoring()
  }

  private setupMonitoring(): void {
    this.manager.on('healthCheck', (results: any) => {
      this.analyzeHealthResults(results)
    })
  }

  private analyzeHealthResults(results: { [unitId: string]: any }): void {
    for (const [unitId, health] of Object.entries(results)) {
      const alerts = this.checkForAlerts(unitId, health as any)
      
      if (alerts.length > 0) {
        this.manager.emit('alerts', { unitId, alerts })
      }
    }
  }

  private checkForAlerts(unitId: string, health: any): string[] {
    const alerts: string[] = []

    if (!health.connected) {
      alerts.push('CHP unit disconnected')
    }

    if (!health.responsive) {
      alerts.push('CHP unit not responding')
    }

    if (health.lastDataAge > this.alertThresholds.dataAge) {
      alerts.push(`Stale data: ${health.lastDataAge}s old`)
    }

    if (health.errors && health.errors.length > 0) {
      alerts.push(...health.errors)
    }

    return alerts
  }

  setAlertThreshold(metric: string, value: number): void {
    this.alertThresholds[metric] = value
  }

  getAlertThresholds(): { [metric: string]: number } {
    return { ...this.alertThresholds }
  }
}

/**
 * Example usage and testing utilities
 */
export const CHPTestUtilities = {
  /**
   * Test connection to a CHP system
   */
  async testConnection(config: CHPAdapterConfig): Promise<{
    success: boolean
    message: string
    systemInfo?: CHPSystemInfo
    sampleData?: CHPOperationalData
  }> {
    try {
      const adapter = await CHPAdapterFactory.createAdapter(config)
      const connected = await adapter.connectWithRetry()

      if (!connected) {
        return {
          success: false,
          message: 'Failed to connect to CHP system'
        }
      }

      const systemInfo = await adapter.getSystemInfo()
      const sampleData = await adapter.readOperationalData()

      await adapter.disconnect()

      return {
        success: true,
        message: 'Successfully connected and read data',
        systemInfo,
        sampleData
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${(error as Error).message}`
      }
    }
  },

  /**
   * Simulate CHP data for development/testing
   */
  createSimulatedData(): CHPOperationalData {
    const now = new Date()
    const isRunning = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.2 // 80% chance of running

    return {
      isRunning,
      powerOutput: isRunning ? 450 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 : 0,
      co2Output: isRunning ? 2200 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 600 : 0,
      heatOutput: isRunning ? 1100 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 : 0,
      fuelConsumption: isRunning ? 55 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 : 0,
      efficiency: isRunning ? 80 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15 : 0,
      engineSpeed: isRunning ? 1800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400 : 0,
      engineTemp: 160 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 60,
      coolantTemp: 140 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50,
      oilPressure: isRunning ? 45 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 : 0,
      voltage: [480 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20, 480 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20, 480 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20],
      current: [
        isRunning ? 600 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 : 0,
        isRunning ? 600 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 : 0,
        isRunning ? 600 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 : 0
      ],
      powerFactor: isRunning ? 0.85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1 : 0,
      frequency: 59.9 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2,
      alarms: isRunning && crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.9 ? ['High Engine Temperature'] : [],
      warnings: isRunning && crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.8 ? ['Oil Change Due'] : [],
      runtimeHours: 5000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10000,
      timestamp: now
    }
  }
}

// Default export for convenience
export default {
  CHPAdapters,
  CHPAdapterFactory,
  CHPAdapterManager,
  CHPHealthMonitor,
  CHPManufacturerConfigs,
  CHPTestUtilities
}