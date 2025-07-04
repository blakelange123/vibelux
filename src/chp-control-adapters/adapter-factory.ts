/**
 * CHP Control Adapter Factory
 * Creates and manages different types of CHP control system adapters
 */

import { BaseCHPAdapter, CHPConnectionConfig } from './base-adapter'
import { ModbusCHPAdapter } from './modbus-adapter'
import { BACnetCHPAdapter } from './bacnet-adapter'
import { APICHPAdapter } from './api-adapter'

export interface CHPAdapterConfig {
  type: 'modbus-tcp' | 'modbus-rtu' | 'bacnet-ip' | 'bacnet-mstp' | 'api' | 'opc-ua'
  connection: CHPConnectionConfig
  specific?: {
    // Modbus-specific configuration
    modbus?: {
      registerMap?: any
      scalingFactors?: { [key: string]: number }
      dataFormat?: 'int16' | 'uint16' | 'int32' | 'uint32' | 'float32'
      byteOrder?: 'big-endian' | 'little-endian'
    }
    // BACnet-specific configuration
    bacnet?: {
      deviceId: number
      objectMap?: any
      maxAPDU?: number
      segmentation?: boolean
    }
    // API-specific configuration
    api?: {
      baseUrl: string
      endpoints: {
        status: string
        control: string
        systemInfo: string
        alarms: string
        maintenance: string
      }
      authType: 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2'
      rateLimiting?: {
        requestsPerMinute: number
        burstLimit: number
      }
    }
    // OPC-UA specific configuration
    opcua?: {
      endpointUrl: string
      securityMode: string
      securityPolicy: string
      nodeIds: { [key: string]: string }
    }
  }
}

export class CHPAdapterFactory {
  private static adapters: Map<string, BaseCHPAdapter> = new Map()

  /**
   * Create a CHP adapter based on configuration
   */
  static async createAdapter(config: CHPAdapterConfig): Promise<BaseCHPAdapter> {
    const adapterId = this.generateAdapterId(config)
    
    // Return existing adapter if already created
    if (this.adapters.has(adapterId)) {
      const existingAdapter = this.adapters.get(adapterId)!
      if (await existingAdapter.isConnected()) {
        return existingAdapter
      } else {
        // Remove disconnected adapter
        this.adapters.delete(adapterId)
      }
    }

    let adapter: BaseCHPAdapter

    switch (config.type) {
      case 'modbus-tcp':
      case 'modbus-rtu':
        adapter = this.createModbusAdapter(config)
        break
      case 'bacnet-ip':
      case 'bacnet-mstp':
        adapter = this.createBACnetAdapter(config)
        break
      case 'api':
        adapter = this.createAPIAdapter(config)
        break
      case 'opc-ua':
        adapter = this.createOPCUAAdapter(config)
        break
      default:
        throw new Error(`Unsupported adapter type: ${config.type}`)
    }

    // Store the adapter for reuse
    this.adapters.set(adapterId, adapter)
    
    return adapter
  }

  /**
   * Create Modbus adapter with default configuration
   */
  private static createModbusAdapter(config: CHPAdapterConfig): ModbusCHPAdapter {
    const modbusConfig = {
      registerMap: config.specific?.modbus?.registerMap || ModbusCHPAdapter.createStandardRegisterMap(),
      scalingFactors: config.specific?.modbus?.scalingFactors || ModbusCHPAdapter.createStandardScalingFactors(),
      dataFormat: config.specific?.modbus?.dataFormat || 'uint16' as const,
      byteOrder: config.specific?.modbus?.byteOrder || 'big-endian' as const
    }

    return new ModbusCHPAdapter(config.connection, modbusConfig)
  }

  /**
   * Create BACnet adapter with default configuration
   */
  private static createBACnetAdapter(config: CHPAdapterConfig): BACnetCHPAdapter {
    const bacnetConfig = {
      deviceId: config.specific?.bacnet?.deviceId || 1001,
      objectMap: config.specific?.bacnet?.objectMap || BACnetCHPAdapter.createStandardObjectMap(),
      maxAPDU: config.specific?.bacnet?.maxAPDU || 1476,
      segmentation: config.specific?.bacnet?.segmentation || true
    }

    return new BACnetCHPAdapter(config.connection, bacnetConfig)
  }

  /**
   * Create API adapter with configuration
   */
  private static createAPIAdapter(config: CHPAdapterConfig): APICHPAdapter {
    if (!config.specific?.api) {
      throw new Error('API configuration is required for API adapter')
    }

    const apiConfig = {
      baseUrl: config.specific.api.baseUrl,
      endpoints: config.specific.api.endpoints,
      authType: config.specific.api.authType,
      rateLimiting: config.specific.api.rateLimiting
    }

    return new APICHPAdapter(config.connection, apiConfig)
  }

  /**
   * Create OPC-UA adapter (placeholder for future implementation)
   */
  private static createOPCUAAdapter(config: CHPAdapterConfig): BaseCHPAdapter {
    // This would be implemented with an actual OPC-UA library
    throw new Error('OPC-UA adapter not yet implemented')
  }

  /**
   * Get all active adapters
   */
  static getActiveAdapters(): Map<string, BaseCHPAdapter> {
    return new Map(this.adapters)
  }

  /**
   * Disconnect and remove an adapter
   */
  static async removeAdapter(adapterId: string): Promise<void> {
    const adapter = this.adapters.get(adapterId)
    if (adapter) {
      await adapter.disconnect()
      this.adapters.delete(adapterId)
    }
  }

  /**
   * Disconnect all adapters
   */
  static async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.adapters.values()).map(adapter => 
      adapter.disconnect().catch(error => 
        console.error('Error disconnecting adapter:', error)
      )
    )
    
    await Promise.all(disconnectPromises)
    this.adapters.clear()
  }

  /**
   * Health check for all adapters
   */
  static async healthCheckAll(): Promise<{ [adapterId: string]: any }> {
    const results: { [adapterId: string]: any } = {}
    
    for (const [adapterId, adapter] of this.adapters) {
      try {
        results[adapterId] = await adapter.healthCheck()
      } catch (error) {
        results[adapterId] = {
          connected: false,
          responsive: false,
          errors: [(error as Error).message]
        }
      }
    }
    
    return results
  }

  /**
   * Generate unique adapter ID
   */
  private static generateAdapterId(config: CHPAdapterConfig): string {
    const { host, port, protocol } = config.connection
    return `${protocol}-${host}-${port}`
  }

  /**
   * Create configuration for common CHP manufacturers
   */
  static createConfigForManufacturer(
    manufacturer: string, 
    model: string, 
    connectionConfig: CHPConnectionConfig
  ): CHPAdapterConfig {
    switch (manufacturer.toLowerCase()) {
      case 'caterpillar':
        return this.createCaterpillarConfig(model, connectionConfig)
      case 'ge':
      case 'general electric':
        return this.createGEConfig(model, connectionConfig)
      case 'clarke':
        return this.createClarkeConfig(model, connectionConfig)
      case 'cummins':
        return this.createCumminsConfig(model, connectionConfig)
      case 'capstone':
        return this.createCapstoneConfig(model, connectionConfig)
      default:
        // Return generic Modbus configuration
        return {
          type: 'modbus-tcp',
          connection: connectionConfig
        }
    }
  }

  private static createCaterpillarConfig(model: string, connection: CHPConnectionConfig): CHPAdapterConfig {
    return {
      type: 'modbus-tcp',
      connection,
      specific: {
        modbus: {
          registerMap: ModbusCHPAdapter.createStandardRegisterMap(),
          scalingFactors: {
            ...ModbusCHPAdapter.createStandardScalingFactors(),
            power: 1, // Caterpillar often uses 1:1 scaling for power
            voltage: 1,
            current: 0.1
          }
        }
      }
    }
  }

  private static createGEConfig(model: string, connection: CHPConnectionConfig): CHPAdapterConfig {
    return {
      type: 'bacnet-ip',
      connection,
      specific: {
        bacnet: {
          deviceId: 1001,
          objectMap: BACnetCHPAdapter.createStandardObjectMap()
        }
      }
    }
  }

  private static createClarkeConfig(model: string, connection: CHPConnectionConfig): CHPAdapterConfig {
    // Clarke often uses API-based communication
    return {
      type: 'api',
      connection,
      specific: {
        api: {
          baseUrl: `http://${connection.host}:${connection.port}`,
          endpoints: {
            status: '/api/v1/status',
            control: '/api/v1/control',
            systemInfo: '/api/v1/system',
            alarms: '/api/v1/alarms',
            maintenance: '/api/v1/maintenance'
          },
          authType: 'basic',
          rateLimiting: {
            requestsPerMinute: 60,
            burstLimit: 10
          }
        }
      }
    }
  }

  private static createCumminsConfig(model: string, connection: CHPConnectionConfig): CHPAdapterConfig {
    return {
      type: 'modbus-tcp',
      connection,
      specific: {
        modbus: {
          registerMap: {
            ...ModbusCHPAdapter.createStandardRegisterMap(),
            // Cummins-specific register adjustments
            powerOutput: 40001,
            engineSpeed: 40002,
            engineTemp: 40010
          },
          scalingFactors: ModbusCHPAdapter.createStandardScalingFactors()
        }
      }
    }
  }

  private static createCapstoneConfig(model: string, connection: CHPConnectionConfig): CHPAdapterConfig {
    // Capstone microturbines often use different scaling
    return {
      type: 'modbus-tcp',
      connection,
      specific: {
        modbus: {
          registerMap: ModbusCHPAdapter.createStandardRegisterMap(),
          scalingFactors: {
            ...ModbusCHPAdapter.createStandardScalingFactors(),
            power: 0.01, // Capstone uses different power scaling
            engineSpeed: 10 // Turbine speed in 10 RPM increments
          }
        }
      }
    }
  }
}

/**
 * Adapter Manager - High-level interface for managing multiple CHP units
 */
export class CHPAdapterManager {
  private adapters: Map<string, BaseCHPAdapter> = new Map()
  private healthCheckInterval?: NodeJS.Timeout
  private eventCallbacks: Map<string, Function[]> = new Map()

  constructor() {
    this.startHealthCheckMonitoring()
  }

  /**
   * Add a CHP unit with its adapter configuration
   */
  async addCHPUnit(unitId: string, config: CHPAdapterConfig): Promise<void> {
    try {
      const adapter = await CHPAdapterFactory.createAdapter(config)
      const connected = await adapter.connectWithRetry()
      
      if (!connected) {
        throw new Error(`Failed to connect to CHP unit ${unitId}`)
      }
      
      this.adapters.set(unitId, adapter)
      this.emit('unitAdded', { unitId, connected: true })
      
    } catch (error) {
      console.error(`Failed to add CHP unit ${unitId}:`, error)
      this.emit('unitError', { unitId, error: (error as Error).message })
      throw error
    }
  }

  /**
   * Remove a CHP unit
   */
  async removeCHPUnit(unitId: string): Promise<void> {
    const adapter = this.adapters.get(unitId)
    if (adapter) {
      await adapter.disconnect()
      this.adapters.delete(unitId)
      this.emit('unitRemoved', { unitId })
    }
  }

  /**
   * Get operational data for all units
   */
  async getAllOperationalData(): Promise<{ [unitId: string]: any }> {
    const results: { [unitId: string]: any } = {}
    
    const promises = Array.from(this.adapters.entries()).map(async ([unitId, adapter]) => {
      try {
        results[unitId] = await adapter.readOperationalData()
      } catch (error) {
        results[unitId] = {
          error: (error as Error).message,
          timestamp: new Date()
        }
      }
    })
    
    await Promise.all(promises)
    return results
  }

  /**
   * Send command to a specific unit
   */
  async sendCommandToUnit(unitId: string, command: any): Promise<any> {
    const adapter = this.adapters.get(unitId)
    if (!adapter) {
      throw new Error(`CHP unit ${unitId} not found`)
    }
    
    return adapter.sendCommand(command)
  }

  /**
   * Start health check monitoring
   */
  private startHealthCheckMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      const healthResults = await this.performHealthChecks()
      this.emit('healthCheck', healthResults)
    }, 60000) // Every minute
  }

  /**
   * Perform health checks on all adapters
   */
  private async performHealthChecks(): Promise<{ [unitId: string]: any }> {
    const results: { [unitId: string]: any } = {}
    
    for (const [unitId, adapter] of this.adapters) {
      try {
        results[unitId] = await adapter.healthCheck()
      } catch (error) {
        results[unitId] = {
          connected: false,
          responsive: false,
          errors: [(error as Error).message]
        }
      }
    }
    
    return results
  }

  /**
   * Event system for adapter management
   */
  on(event: string, callback: Function): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, [])
    }
    this.eventCallbacks.get(event)!.push(callback)
  }

  private emit(event: string, data: any): void {
    const callbacks = this.eventCallbacks.get(event) || []
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in event callback for ${event}:`, error)
      }
    })
  }

  /**
   * Cleanup
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    
    const disconnectPromises = Array.from(this.adapters.values()).map(adapter =>
      adapter.disconnect().catch(error =>
        console.error('Error disconnecting adapter:', error)
      )
    )
    
    await Promise.all(disconnectPromises)
    this.adapters.clear()
    this.eventCallbacks.clear()
  }
}