/**
 * REST API CHP Control Adapter
 * Implements HTTP/HTTPS API communication for modern CHP systems
 */

import { BaseCHPAdapter, CHPOperationalData, CHPControlCommand, CHPControlResponse, CHPSystemInfo } from './base-adapter'

interface APIEndpoints {
  status: string
  control: string
  systemInfo: string
  alarms: string
  maintenance: string
}

interface APIConfig {
  baseUrl: string
  endpoints: APIEndpoints
  authType: 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2'
  rateLimiting?: {
    requestsPerMinute: number
    burstLimit: number
  }
  retryConfig?: {
    maxRetries: number
    backoffMs: number
  }
}

export class APICHPAdapter extends BaseCHPAdapter {
  private apiConfig: APIConfig
  private authHeaders: { [key: string]: string } = {}
  private rateLimiter: RateLimiter
  private lastReadData?: CHPOperationalData

  constructor(config: any, apiConfig: APIConfig) {
    super(config)
    this.apiConfig = apiConfig
    this.rateLimiter = new RateLimiter(
      apiConfig.rateLimiting?.requestsPerMinute || 60,
      apiConfig.rateLimiting?.burstLimit || 10
    )
    this.setupAuthentication()
  }

  private setupAuthentication(): void {
    switch (this.apiConfig.authType) {
      case 'basic':
        if (this.config.authentication?.username && this.config.authentication?.password) {
          const credentials = Buffer.from(
            `${this.config.authentication.username}:${this.config.authentication.password}`
          ).toString('base64')
          this.authHeaders['Authorization'] = `Basic ${credentials}`
        }
        break
      case 'bearer':
        if (this.config.authentication?.apiKey) {
          this.authHeaders['Authorization'] = `Bearer ${this.config.authentication.apiKey}`
        }
        break
      case 'api-key':
        if (this.config.authentication?.apiKey) {
          this.authHeaders['X-API-Key'] = this.config.authentication.apiKey
        }
        break
      case 'oauth2':
        // OAuth2 would require additional token management
        console.warn('OAuth2 authentication not fully implemented')
        break
    }
  }

  async connect(): Promise<boolean> {
    try {
      // Test connection by calling the system info endpoint
      const response = await this.makeAPIRequest('GET', this.apiConfig.endpoints.systemInfo)
      
      if (response.ok) {
        this.connected = true
        return true
      } else {
        throw new Error(`API connection failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      this.setError(error as Error)
      this.connected = false
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
  }

  async readOperationalData(): Promise<CHPOperationalData> {
    if (!this.connected) {
      throw new Error('Not connected to CHP API')
    }

    try {
      await this.rateLimiter.waitForToken()
      
      const response = await this.makeAPIRequest('GET', this.apiConfig.endpoints.status)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const operationalData = this.parseAPIResponse(data)
      
      this.lastReadData = operationalData
      return operationalData
    } catch (error) {
      this.setError(error as Error)
      
      // Return last known data if available
      if (this.lastReadData) {
        return {
          ...this.lastReadData,
          timestamp: new Date()
        }
      }
      
      return this.getDefaultOperationalData()
    }
  }

  private parseAPIResponse(data: any): CHPOperationalData {
    // Handle different API response formats
    const status = data.status || data
    const electrical = status.electrical || {}
    const engine = status.engine || {}
    const chp = status.chp || {}
    const alarms = status.alarms || {}

    return this.validateOperationalData({
      isRunning: Boolean(status.isRunning || status.running || status.state === 'running'),
      powerOutput: Number(electrical.powerOutput || electrical.power || 0),
      co2Output: Number(chp.co2Output || chp.co2Flow || 0),
      heatOutput: Number(chp.heatOutput || chp.thermalOutput || 0),
      fuelConsumption: Number(engine.fuelFlow || engine.fuelConsumption || 0),
      efficiency: Number(status.efficiency || chp.efficiency || 0),
      engineSpeed: Number(engine.speed || engine.rpm || 0),
      engineTemp: Number(engine.temperature || engine.temp || 0),
      coolantTemp: Number(engine.coolantTemp || engine.coolantTemperature || 0),
      oilPressure: Number(engine.oilPressure || 0),
      voltage: [
        Number(electrical.voltageA || electrical.voltage?.[0] || 0),
        Number(electrical.voltageB || electrical.voltage?.[1] || 0),
        Number(electrical.voltageC || electrical.voltage?.[2] || 0)
      ],
      current: [
        Number(electrical.currentA || electrical.current?.[0] || 0),
        Number(electrical.currentB || electrical.current?.[1] || 0),
        Number(electrical.currentC || electrical.current?.[2] || 0)
      ],
      powerFactor: Number(electrical.powerFactor || 0),
      frequency: Number(electrical.frequency || 60),
      alarms: Array.isArray(alarms.active) ? alarms.active : 
              Array.isArray(status.alarms) ? status.alarms : [],
      warnings: Array.isArray(alarms.warnings) ? alarms.warnings : 
                Array.isArray(status.warnings) ? status.warnings : [],
      runtimeHours: Number(status.runtimeHours || status.operatingHours || 0),
      timestamp: new Date(status.timestamp || Date.now())
    })
  }

  async sendCommand(command: CHPControlCommand): Promise<CHPControlResponse> {
    if (!this.connected) {
      return {
        success: false,
        message: 'Not connected to CHP API',
        executionTime: 0,
        errors: ['Connection not established']
      }
    }

    const startTime = Date.now()

    try {
      await this.rateLimiter.waitForToken()

      const requestBody = this.buildCommandRequest(command)
      const response = await this.makeAPIRequest('POST', this.apiConfig.endpoints.control, requestBody)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API command failed: ${response.status} ${errorData.message || response.statusText}`)
      }

      const result = await response.json()
      const executionTime = Date.now() - startTime

      // Wait a moment and read back the status to get new state
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newData = await this.readOperationalData()

      return {
        success: true,
        message: result.message || `Command ${command.command} executed successfully`,
        executionTime,
        newState: newData
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      this.setError(error as Error)

      return {
        success: false,
        message: `Failed to execute command ${command.command}`,
        executionTime,
        errors: [(error as Error).message]
      }
    }
  }

  private buildCommandRequest(command: CHPControlCommand): any {
    const request: any = {
      command: command.command.toLowerCase(),
      timestamp: command.timestamp.toISOString()
    }

    if (command.operatorId) {
      request.operatorId = command.operatorId
    }

    if (command.reason) {
      request.reason = command.reason
    }

    if (command.parameters) {
      request.parameters = command.parameters
    }

    return request
  }

  async getSystemInfo(): Promise<CHPSystemInfo> {
    try {
      await this.rateLimiter.waitForToken()
      
      const response = await this.makeAPIRequest('GET', this.apiConfig.endpoints.systemInfo)
      
      if (!response.ok) {
        throw new Error(`Failed to get system info: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        manufacturer: data.manufacturer || 'API CHP System',
        model: data.model || 'Unknown Model',
        serialNumber: data.serialNumber || data.serial || 'Unknown',
        ratedPowerKW: Number(data.ratedPowerKW || data.maxPower || 500),
        ratedThermalKW: Number(data.ratedThermalKW || data.maxThermal || 1200),
        ratedCO2CFH: Number(data.ratedCO2CFH || data.maxCO2 || 2500),
        firmwareVersion: data.firmwareVersion || data.firmware || 'Unknown',
        protocolVersion: data.protocolVersion || 'REST API v1.0',
        lastMaintenance: new Date(data.lastMaintenance || Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(data.nextMaintenance || Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    } catch (error) {
      this.setError(error as Error)
      
      return {
        manufacturer: 'API CHP System',
        model: 'Communication Error',
        serialNumber: 'Unknown',
        ratedPowerKW: 500,
        ratedThermalKW: 1200,
        ratedCO2CFH: 2500,
        firmwareVersion: 'Unknown',
        protocolVersion: 'REST API',
        lastMaintenance: new Date(),
        nextMaintenance: new Date()
      }
    }
  }

  private async makeAPIRequest(method: string, endpoint: string, body?: any): Promise<Response> {
    const url = `${this.apiConfig.baseUrl}${endpoint}`
    
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Vibelux-CHP-Adapter/1.0',
      ...this.authHeaders
    }

    const options: RequestInit = {
      method,
      headers,
      timeout: this.config.timeout || 10000
    }

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body)
    }

    // Add SSL/TLS configuration if specified
    if (this.config.encryption?.enabled) {
      // In a real implementation, you would configure SSL/TLS options here
    }

    const response = await fetch(url, options)
    
    // Log the request for debugging
    
    return response
  }

  private getDefaultOperationalData(): CHPOperationalData {
    return this.validateOperationalData({
      isRunning: false,
      powerOutput: 0,
      co2Output: 0,
      heatOutput: 0,
      fuelConsumption: 0,
      efficiency: 0,
      engineSpeed: 0,
      engineTemp: 70,
      coolantTemp: 70,
      oilPressure: 0,
      voltage: [0, 0, 0],
      current: [0, 0, 0],
      powerFactor: 0,
      frequency: 60,
      alarms: ['API Communication Lost'],
      warnings: [],
      runtimeHours: 0,
      timestamp: new Date()
    })
  }

  // Additional API-specific methods
  async getAlarmHistory(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      await this.rateLimiter.waitForToken()
      
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      })
      
      const response = await this.makeAPIRequest('GET', `${this.apiConfig.endpoints.alarms}?${params}`)
      
      if (response.ok) {
        return await response.json()
      }
      
      return []
    } catch (error) {
      this.setError(error as Error)
      return []
    }
  }

  async getMaintenanceSchedule(): Promise<any[]> {
    try {
      await this.rateLimiter.waitForToken()
      
      const response = await this.makeAPIRequest('GET', this.apiConfig.endpoints.maintenance)
      
      if (response.ok) {
        return await response.json()
      }
      
      return []
    } catch (error) {
      this.setError(error as Error)
      return []
    }
  }

  // WebSocket support for real-time updates
  async subscribeToRealTimeUpdates(callback: (data: CHPOperationalData) => void): Promise<void> {
    const wsUrl = this.apiConfig.baseUrl.replace('http', 'ws') + '/ws/status'
    
    try {
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const operationalData = this.parseAPIResponse(data)
          callback(operationalData)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
      ws.onclose = () => {
      }
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error)
    }
  }
}

// Rate limiting utility class
class RateLimiter {
  private tokens: number
  private maxTokens: number
  private refillRate: number // tokens per minute
  private lastRefill: number

  constructor(requestsPerMinute: number, burstLimit: number) {
    this.maxTokens = burstLimit
    this.tokens = burstLimit
    this.refillRate = requestsPerMinute
    this.lastRefill = Date.now()
  }

  async waitForToken(): Promise<void> {
    this.refillTokens()
    
    if (this.tokens >= 1) {
      this.tokens -= 1
      return
    }
    
    // Wait until we can get a token
    const waitTime = (60 * 1000) / this.refillRate // Time to get one token
    await new Promise(resolve => setTimeout(resolve, waitTime))
    
    return this.waitForToken()
  }

  private refillTokens(): void {
    const now = Date.now()
    const timePassed = now - this.lastRefill
    const tokensToAdd = (timePassed / (60 * 1000)) * this.refillRate
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
    this.lastRefill = now
  }
}