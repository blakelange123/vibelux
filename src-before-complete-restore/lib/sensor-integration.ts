import {
  SensorDevice,
  SensorReading,
  SensorType,
  WeightReading,
  CO2Reading,
  TempHumidityReading,
  SpectralReading,
  ThermalReading,
  HX711Config,
  EE870Config,
  ENS210Config,
  SpectralSensorConfig,
  FLIRConfig
} from './sensor-interfaces'

// Mock sensor data generators for development
// In production, these would be replaced with actual sensor communication

export class SensorIntegrationService {
  private sensors: Map<string, SensorDevice> = new Map()
  private readings: Map<string, SensorReading[]> = new Map()
  private callbacks: Map<string, ((reading: SensorReading) => void)[]> = new Map()
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()

  // Initialize sensor connection
  async connectSensor(sensor: SensorDevice): Promise<boolean> {
    try {
      // In production, this would establish actual connection
      console.log(`Connecting to ${sensor.type} sensor: ${sensor.name}`)
      
      // Store sensor
      this.sensors.set(sensor.id, sensor)
      
      // Initialize readings array
      if (!this.readings.has(sensor.id)) {
        this.readings.set(sensor.id, [])
      }

      // Update status
      sensor.status = 'connected'
      
      // Start polling based on sensor type
      this.startPolling(sensor)
      
      return true
    } catch (error) {
      console.error(`Failed to connect sensor ${sensor.id}:`, error)
      sensor.status = 'error'
      return false
    }
  }

  // Start polling sensor data
  private startPolling(sensor: SensorDevice) {
    // Clear existing interval if any
    if (this.pollingIntervals.has(sensor.id)) {
      clearInterval(this.pollingIntervals.get(sensor.id)!)
    }

    // Set polling interval based on sensor type
    const interval = this.getPollingInterval(sensor.type)
    
    const pollInterval = setInterval(async () => {
      const reading = await this.readSensor(sensor)
      if (reading) {
        this.storeReading(sensor.id, reading)
        this.notifyCallbacks(sensor.id, reading)
      }
    }, interval)

    this.pollingIntervals.set(sensor.id, pollInterval)
  }

  // Get appropriate polling interval for sensor type
  private getPollingInterval(type: SensorType): number {
    switch (type) {
      case SensorType.WEIGHT:
        return 1000 // 1 second
      case SensorType.CO2:
        return 5000 // 5 seconds
      case SensorType.TEMPERATURE_HUMIDITY:
        return 2000 // 2 seconds
      case SensorType.SPECTROMETER:
        return 10000 // 10 seconds
      case SensorType.THERMAL_CAMERA:
        return 5000 // 5 seconds
      default:
        return 5000
    }
  }

  // Read sensor data (mock implementation)
  private async readSensor(sensor: SensorDevice): Promise<SensorReading | null> {
    switch (sensor.type) {
      case SensorType.WEIGHT:
        return this.readHX711(sensor)
      case SensorType.CO2:
        return this.readEE870(sensor)
      case SensorType.TEMPERATURE_HUMIDITY:
        return this.readENS210(sensor)
      case SensorType.SPECTROMETER:
        return this.readSpectralSensor(sensor)
      case SensorType.THERMAL_CAMERA:
        return this.readFLIR(sensor)
      default:
        return null
    }
  }

  // HX711 Weight Sensor Reading
  private async readHX711(sensor: SensorDevice): Promise<WeightReading> {
    const config = sensor.config as HX711Config
    
    // Simulate weight reading with some variation
    const baseWeight = 25.5 // kg
    const variation = (Math.random() - 0.5) * 0.1
    const weight = baseWeight + variation

    return {
      timestamp: new Date(),
      value: weight,
      unit: config?.units || 'kg',
      quality: 'good',
      stability: Math.abs(variation) < 0.05 ? 'stable' : 'unstable',
      raw: weight * (config?.calibrationFactor || 2280)
    }
  }

  // EE870 CO2 Sensor Reading
  private async readEE870(sensor: SensorDevice): Promise<CO2Reading> {
    // Simulate CO2 with daily variation
    const hour = new Date().getHours()
    const baseCO2 = 800
    const variation = Math.sin((hour / 24) * Math.PI * 2) * 200 + (Math.random() - 0.5) * 50
    const co2 = Math.round(baseCO2 + variation)

    return {
      timestamp: new Date(),
      value: co2,
      unit: 'ppm',
      quality: co2 > 1500 ? 'warning' : 'good',
      temperature: 22 + (Math.random() - 0.5) * 2,
      pressure: 1013 + (Math.random() - 0.5) * 5
    }
  }

  // ENS210 Temperature/Humidity Reading
  private async readENS210(sensor: SensorDevice): Promise<TempHumidityReading> {
    const temp = 23 + (Math.random() - 0.5) * 4
    const humidity = 60 + (Math.random() - 0.5) * 10
    
    // Calculate dew point
    const a = 17.27
    const b = 237.7
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100)
    const dewPoint = (b * alpha) / (a - alpha)
    
    // Calculate VPD
    const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3))
    const avp = svp * (humidity / 100)
    const vpd = svp - avp

    return {
      timestamp: new Date(),
      value: {
        temperature: Math.round(temp * 10) / 10,
        humidity: Math.round(humidity * 10) / 10,
        dewPoint: Math.round(dewPoint * 10) / 10,
        vpd: Math.round(vpd * 100) / 100
      },
      unit: 'mixed',
      quality: 'good'
    }
  }

  // Spectral Sensor Reading (AMS or Moonlight)
  private async readSpectralSensor(sensor: SensorDevice): Promise<SpectralReading> {
    const config = sensor.config as SpectralSensorConfig
    
    // Simulate spectrum based on typical LED grow light
    const channels = [
      { wavelength: 415, intensity: 850, unit: 'counts' as const },
      { wavelength: 445, intensity: 2200, unit: 'counts' as const },
      { wavelength: 480, intensity: 1100, unit: 'counts' as const },
      { wavelength: 515, intensity: 600, unit: 'counts' as const },
      { wavelength: 555, intensity: 800, unit: 'counts' as const },
      { wavelength: 590, intensity: 700, unit: 'counts' as const },
      { wavelength: 630, intensity: 3200, unit: 'counts' as const },
      { wavelength: 680, intensity: 4500, unit: 'counts' as const },
      { wavelength: 730, intensity: 1200, unit: 'counts' as const },
      { wavelength: 760, intensity: 400, unit: 'counts' as const },
      { wavelength: 810, intensity: 200, unit: 'counts' as const }
    ]

    // Calculate PAR (400-700nm)
    const parChannels = channels.filter(ch => ch.wavelength >= 400 && ch.wavelength <= 700)
    const totalPar = parChannels.reduce((sum, ch) => sum + ch.intensity, 0)
    const par = totalPar * 0.15 // Conversion factor to µmol/m²/s

    return {
      timestamp: new Date(),
      value: {
        channels,
        par: Math.round(par),
        ppfd: Math.round(par),
        lux: Math.round(par * 54), // Rough conversion
        cct: 4200, // Typical grow light CCT
        cri: 85
      },
      unit: 'spectrum',
      quality: 'good'
    }
  }

  // FLIR Thermal Camera Reading
  private async readFLIR(sensor: SensorDevice): Promise<ThermalReading> {
    const config = sensor.config as FLIRConfig
    
    // Generate mock thermal matrix (simplified)
    const width = 80
    const height = 60
    const baseTemp = 24
    const matrix: number[][] = []
    
    // Create hot spots to simulate plant canopy temperatures
    for (let y = 0; y < height; y++) {
      matrix[y] = []
      for (let x = 0; x < width; x++) {
        // Create temperature gradient with hot spots
        const distFromCenter = Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2))
        const temp = baseTemp + (Math.random() - 0.5) * 2 - distFromCenter * 0.05
        matrix[y][x] = Math.round(temp * 10) / 10
      }
    }

    // Find min/max/avg
    const flatMatrix = matrix.flat()
    const min = Math.min(...flatMatrix)
    const max = Math.max(...flatMatrix)
    const average = flatMatrix.reduce((a, b) => a + b) / flatMatrix.length

    return {
      timestamp: new Date(),
      value: {
        matrix,
        min: Math.round(min * 10) / 10,
        max: Math.round(max * 10) / 10,
        average: Math.round(average * 10) / 10,
        spotTemp: [
          { x: 40, y: 30, temp: max },
          { x: 20, y: 20, temp: min }
        ]
      },
      unit: '°C',
      resolution: { width, height },
      quality: 'good'
    }
  }

  // Store reading in memory (in production, this would go to a database)
  private storeReading(sensorId: string, reading: SensorReading) {
    const readings = this.readings.get(sensorId) || []
    readings.push(reading)
    
    // Keep only last 1000 readings in memory
    if (readings.length > 1000) {
      readings.shift()
    }
    
    this.readings.set(sensorId, readings)
    
    // Update sensor's last reading
    const sensor = this.sensors.get(sensorId)
    if (sensor) {
      sensor.lastReading = reading
    }
  }

  // Subscribe to sensor readings
  subscribe(sensorId: string, callback: (reading: SensorReading) => void) {
    const callbacks = this.callbacks.get(sensorId) || []
    callbacks.push(callback)
    this.callbacks.set(sensorId, callbacks)
  }

  // Unsubscribe from sensor readings
  unsubscribe(sensorId: string, callback: (reading: SensorReading) => void) {
    const callbacks = this.callbacks.get(sensorId) || []
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
    this.callbacks.set(sensorId, callbacks)
  }

  // Notify all callbacks for a sensor
  private notifyCallbacks(sensorId: string, reading: SensorReading) {
    const callbacks = this.callbacks.get(sensorId) || []
    callbacks.forEach(cb => cb(reading))
  }

  // Get historical readings
  getReadings(sensorId: string, limit?: number): SensorReading[] {
    const readings = this.readings.get(sensorId) || []
    if (limit) {
      return readings.slice(-limit)
    }
    return readings
  }

  // Get all connected sensors
  getSensors(): SensorDevice[] {
    return Array.from(this.sensors.values())
  }

  // Disconnect sensor
  disconnectSensor(sensorId: string) {
    const sensor = this.sensors.get(sensorId)
    if (sensor) {
      sensor.status = 'disconnected'
    }
    
    // Clear polling interval
    const interval = this.pollingIntervals.get(sensorId)
    if (interval) {
      clearInterval(interval)
      this.pollingIntervals.delete(sensorId)
    }
  }

  // Calculate statistics for a time period
  getStatistics(sensorId: string, startTime: Date, endTime: Date) {
    const readings = this.readings.get(sensorId) || []
    const filtered = readings.filter(r => 
      r.timestamp >= startTime && r.timestamp <= endTime
    )

    if (filtered.length === 0) {
      return null
    }

    // Extract numeric values
    const values = filtered
      .map(r => typeof r.value === 'number' ? r.value : null)
      .filter(v => v !== null) as number[]

    if (values.length === 0) {
      return null
    }

    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    // Calculate standard deviation
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2))
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
    const stdDev = Math.sqrt(avgSquaredDiff)

    return {
      count: values.length,
      average: avg,
      min,
      max,
      stdDev,
      startTime,
      endTime
    }
  }
}

// Singleton instance
export const sensorService = new SensorIntegrationService()

// Helper function to create mock sensors for testing
export function createMockSensors(): SensorDevice[] {
  return [
    {
      id: 'hx711-1',
      name: 'Plant Weight Scale 1',
      type: SensorType.WEIGHT,
      manufacturer: 'Generic',
      model: 'HX711',
      interface: 'spi',
      status: 'disconnected',
      config: {
        doutPin: 5,
        sckPin: 6,
        calibrationFactor: 2280,
        tareOffset: 0,
        units: 'kg'
      } as HX711Config
    },
    {
      id: 'ee870-1',
      name: 'Room CO2 Sensor',
      type: SensorType.CO2,
      manufacturer: 'E+E Elektronik',
      model: 'EE870',
      interface: 'modbus',
      address: '192.168.1.100',
      port: 502,
      status: 'disconnected',
      config: {
        interface: 'modbus',
        modbusAddress: 1,
        baudRate: 9600,
        measurementRange: { min: 0, max: 5000 }
      } as EE870Config
    },
    {
      id: 'ens210-1',
      name: 'Canopy Temp/RH',
      type: SensorType.TEMPERATURE_HUMIDITY,
      manufacturer: 'ams',
      model: 'ENS210',
      interface: 'i2c',
      address: '0x43',
      status: 'disconnected',
      config: {
        i2cAddress: 0x43,
        measurementMode: 'continuous',
        lowPower: false
      } as ENS210Config
    },
    {
      id: 'moonlight-1',
      name: 'Moonlight Spectrum Sensor',
      type: SensorType.SPECTROMETER,
      manufacturer: 'ams',
      model: 'Moonlight',
      interface: 'i2c',
      address: '0x39',
      status: 'disconnected',
      config: {
        model: 'Moonlight',
        integrationTime: 100,
        gain: 1,
        channels: []
      } as SpectralSensorConfig
    },
    {
      id: 'flir-1',
      name: 'FLIR Thermal Camera',
      type: SensorType.THERMAL_CAMERA,
      manufacturer: 'FLIR',
      model: 'FLIR_E8',
      interface: 'wifi',
      address: '192.168.1.101',
      status: 'disconnected',
      config: {
        model: 'FLIR_E8',
        connectionType: 'wifi',
        emissivity: 0.95,
        reflectedTemp: 20,
        distance: 2,
        palette: 'iron'
      } as FLIRConfig
    }
  ]
}