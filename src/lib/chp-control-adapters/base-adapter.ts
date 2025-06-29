/**
 * Base CHP Control Adapter
 * Defines the standard interface for CHP control system integration
 */

export interface CHPOperationalData {
  isRunning: boolean
  powerOutput: number // kW
  co2Output: number // CFH
  heatOutput: number // kW thermal
  fuelConsumption: number // therms/hour
  efficiency: number // %
  engineSpeed: number // RPM
  engineTemp: number // °F
  coolantTemp: number // °F
  oilPressure: number // PSI
  voltage: [number, number, number] // Phase A, B, C
  current: [number, number, number] // Phase A, B, C
  powerFactor: number
  frequency: number // Hz
  alarms: string[]
  warnings: string[]
  runtimeHours: number
  timestamp: Date
}

export interface CHPControlCommand {
  command: 'START' | 'STOP' | 'SET_LOAD' | 'EMERGENCY_STOP' | 'RESET_ALARMS'
  parameters?: {
    targetLoad?: number // % of rated capacity
    timeout?: number // seconds
    force?: boolean
  }
  timestamp: Date
  operatorId?: string
  reason?: string
}

export interface CHPControlResponse {
  success: boolean
  message: string
  executionTime: number // milliseconds
  newState?: Partial<CHPOperationalData>
  errors?: string[]
  warnings?: string[]
}

export interface CHPSystemInfo {
  manufacturer: string
  model: string
  serialNumber: string
  ratedPowerKW: number
  ratedThermalKW: number
  ratedCO2CFH: number
  firmwareVersion: string
  protocolVersion: string
  lastMaintenance: Date
  nextMaintenance: Date
}

export interface CHPConnectionConfig {
  host: string
  port: number
  protocol: 'modbus-tcp' | 'modbus-rtu' | 'bacnet' | 'api' | 'opc-ua'
  unitId?: number
  timeout: number
  retryAttempts: number
  authentication?: {
    username?: string
    password?: string
    apiKey?: string
    certificate?: string
  }
  encryption?: {
    enabled: boolean
    protocol: 'tls' | 'ssl'
    certificate?: string
  }
}

export abstract class BaseCHPAdapter {
  protected config: CHPConnectionConfig
  protected connected: boolean = false
  protected lastError?: Error
  protected connectionRetries: number = 0
  protected maxRetries: number = 3

  constructor(config: CHPConnectionConfig) {
    this.config = config
    this.maxRetries = config.retryAttempts || 3
  }

  // Abstract methods that must be implemented by specific adapters
  abstract connect(): Promise<boolean>
  abstract disconnect(): Promise<void>
  abstract readOperationalData(): Promise<CHPOperationalData>
  abstract sendCommand(command: CHPControlCommand): Promise<CHPControlResponse>
  abstract getSystemInfo(): Promise<CHPSystemInfo>

  // Common methods available to all adapters
  async isConnected(): Promise<boolean> {
    return this.connected
  }

  getLastError(): Error | undefined {
    return this.lastError
  }

  protected setError(error: Error): void {
    this.lastError = error
    console.error(`CHP Adapter Error (${this.config.protocol}):`, error.message)
  }

  protected clearError(): void {
    this.lastError = undefined
  }

  async connectWithRetry(): Promise<boolean> {
    this.connectionRetries = 0
    
    while (this.connectionRetries < this.maxRetries) {
      try {
        const success = await this.connect()
        if (success) {
          this.clearError()
          return true
        }
      } catch (error) {
        this.setError(error as Error)
      }
      
      this.connectionRetries++
      if (this.connectionRetries < this.maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, this.connectionRetries) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    return false
  }

  // Health check method
  async healthCheck(): Promise<{
    connected: boolean
    responsive: boolean
    lastDataAge: number // seconds
    systemStatus: string
    errors: string[]
  }> {
    const errors: string[] = []
    let responsive = false
    let lastDataAge = Infinity
    let systemStatus = 'unknown'

    try {
      if (!this.connected) {
        errors.push('Not connected to CHP system')
      } else {
        // Try to read operational data to test responsiveness
        const startTime = Date.now()
        const data = await this.readOperationalData()
        const responseTime = Date.now() - startTime
        
        responsive = responseTime < (this.config.timeout || 5000)
        lastDataAge = (Date.now() - data.timestamp.getTime()) / 1000
        systemStatus = data.isRunning ? 'running' : 'stopped'
        
        if (responseTime > 2000) {
          errors.push(`Slow response time: ${responseTime}ms`)
        }
        
        if (lastDataAge > 60) {
          errors.push(`Stale data: ${lastDataAge}s old`)
        }
        
        if (data.alarms.length > 0) {
          errors.push(`Active alarms: ${data.alarms.join(', ')}`)
        }
      }
    } catch (error) {
      errors.push(`Health check failed: ${(error as Error).message}`)
    }

    return {
      connected: this.connected,
      responsive,
      lastDataAge,
      systemStatus,
      errors
    }
  }

  // Utility method to validate operational data
  protected validateOperationalData(data: Partial<CHPOperationalData>): CHPOperationalData {
    const now = new Date()
    
    return {
      isRunning: data.isRunning ?? false,
      powerOutput: this.validateNumber(data.powerOutput, 0, 10000, 0),
      co2Output: this.validateNumber(data.co2Output, 0, 10000, 0),
      heatOutput: this.validateNumber(data.heatOutput, 0, 10000, 0),
      fuelConsumption: this.validateNumber(data.fuelConsumption, 0, 1000, 0),
      efficiency: this.validateNumber(data.efficiency, 0, 100, 0),
      engineSpeed: this.validateNumber(data.engineSpeed, 0, 5000, 0),
      engineTemp: this.validateNumber(data.engineTemp, -50, 500, 0),
      coolantTemp: this.validateNumber(data.coolantTemp, -50, 300, 0),
      oilPressure: this.validateNumber(data.oilPressure, 0, 200, 0),
      voltage: data.voltage ?? [0, 0, 0],
      current: data.current ?? [0, 0, 0],
      powerFactor: this.validateNumber(data.powerFactor, 0, 1, 0),
      frequency: this.validateNumber(data.frequency, 55, 65, 60),
      alarms: data.alarms ?? [],
      warnings: data.warnings ?? [],
      runtimeHours: this.validateNumber(data.runtimeHours, 0, 100000, 0),
      timestamp: data.timestamp ?? now
    }
  }

  private validateNumber(value: number | undefined, min: number, max: number, defaultValue: number): number {
    if (value === undefined || value === null || isNaN(value)) {
      return defaultValue
    }
    return Math.max(min, Math.min(max, value))
  }

  // Standard alarm codes mapping
  protected mapAlarmCodes(codes: number[]): string[] {
    const alarmMap: { [key: number]: string } = {
      1: 'Emergency Stop Active',
      2: 'High Engine Temperature',
      3: 'Low Oil Pressure',
      4: 'High Coolant Temperature',
      5: 'Generator Overvoltage',
      6: 'Generator Undervoltage',
      7: 'Generator Overcurrent',
      8: 'Generator Frequency Out of Range',
      9: 'Engine Overspeed',
      10: 'Engine Fail to Start',
      11: 'Engine Fail to Stop',
      12: 'Fuel System Fault',
      13: 'Ignition System Fault',
      14: 'Battery Charger Fault',
      15: 'Control System Fault'
    }

    return codes.map(code => alarmMap[code] || `Unknown Alarm ${code}`)
  }
}