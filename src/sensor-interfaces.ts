// Sensor Interface Definitions for Vibelux Platform

export interface SensorReading {
  timestamp: Date
  value: number | number[] | object
  unit: string
  quality: 'good' | 'warning' | 'error'
  rawData?: any
}

export interface SensorDevice {
  id: string
  name: string
  type: SensorType
  manufacturer: string
  model: string
  interface: 'i2c' | 'spi' | 'uart' | 'usb' | 'ethernet' | 'wifi' | 'modbus'
  address?: string // IP address or device address
  port?: number
  status: 'connected' | 'disconnected' | 'error'
  lastReading?: SensorReading
  config?: any
}

export enum SensorType {
  WEIGHT = 'weight',
  CAMERA = 'camera',
  THERMAL_CAMERA = 'thermal',
  CO2 = 'co2',
  TEMPERATURE_HUMIDITY = 'temp_humidity',
  SPECTROMETER = 'spectrometer',
  PAR = 'par',
  PH = 'ph',
  EC = 'ec',
  FLOW = 'flow',
  PRESSURE = 'pressure'
}

// HX711 Weight Sensor (Raspberry Pi)
export interface HX711Config {
  doutPin: number // Data pin (GPIO)
  sckPin: number // Clock pin (GPIO)
  calibrationFactor: number
  tareOffset: number
  units: 'kg' | 'lbs' | 'g'
}

export interface WeightReading extends SensorReading {
  value: number
  unit: 'kg' | 'lbs' | 'g'
  stability: 'stable' | 'unstable'
  raw: number
}

// IP Camera Interface
export interface IPCameraConfig {
  streamUrl: string // RTSP or HTTP stream URL
  username?: string
  password?: string
  resolution: { width: number; height: number }
  fps: number
  codec: 'h264' | 'h265' | 'mjpeg'
  features?: {
    ptz?: boolean // Pan-Tilt-Zoom
    nightVision?: boolean
    motion?: boolean
  }
}

export interface CameraFrame {
  timestamp: Date
  image: Buffer | string // Base64 or buffer
  resolution: { width: number; height: number }
  metadata?: {
    exposure?: number
    gain?: number
    whiteBalance?: number
  }
}

// FLIR Thermal Camera
export interface FLIRConfig {
  model: 'FLIR_ONE' | 'FLIR_C3' | 'FLIR_E8' | 'FLIR_T540' | string
  connectionType: 'usb' | 'wifi' | 'ethernet'
  emissivity: number // 0-1
  reflectedTemp: number // °C
  distance: number // meters
  palette: 'iron' | 'rainbow' | 'grayscale' | 'hot' | 'cold'
}

export interface ThermalReading extends SensorReading {
  value: {
    matrix: number[][] // Temperature matrix
    min: number
    max: number
    average: number
    spotTemp?: { x: number; y: number; temp: number }[]
  }
  unit: '°C' | '°F'
  resolution: { width: number; height: number }
}

// Research IR Sensor
export interface ResearchIRConfig {
  model: string
  wavelengthRange: { min: number; max: number } // nm
  resolution: number // nm
  integrationTime: number // ms
}

// EE870 CO2 Sensor (E+E Elektronik)
export interface EE870Config {
  interface: 'modbus' | 'analog'
  modbusAddress?: number
  baudRate?: number
  measurementRange: { min: number; max: number } // ppm
}

export interface CO2Reading extends SensorReading {
  value: number // ppm
  temperature?: number // °C
  pressure?: number // hPa
  unit: 'ppm'
}

// ENS210 Temperature/Humidity Sensor (ams)
export interface ENS210Config {
  i2cAddress: number // Default 0x43
  measurementMode: 'single' | 'continuous'
  lowPower: boolean
}

export interface TempHumidityReading extends SensorReading {
  value: {
    temperature: number // °C
    humidity: number // %RH
    dewPoint?: number // °C
    vpd?: number // kPa
  }
  unit: 'mixed'
}

// AMS Spectral Sensor (AS7341 or similar)
export interface SpectralSensorConfig {
  model: 'AS7341' | 'AS7262' | 'AS7265x' | 'Moonlight'
  integrationTime: number // ms
  gain: number
  channels: {
    wavelength: number // nm
    bandwidth: number // nm
    enabled: boolean
  }[]
}

export interface SpectralReading extends SensorReading {
  value: {
    channels: {
      wavelength: number
      intensity: number
      unit: 'counts' | 'µW/cm²' | 'µmol/m²/s'
    }[]
    par?: number // µmol/m²/s
    ppfd?: number // µmol/m²/s
    lux?: number
    cct?: number // Correlated Color Temperature (K)
    cri?: number // Color Rendering Index
  }
  unit: 'spectrum'
}

// Sensor Data Collection Interface
export interface SensorDataPoint {
  sensorId: string
  timestamp: Date
  reading: SensorReading
  location?: { x: number; y: number; z: number }
  metadata?: any
}

// Aggregated Sensor Data
export interface SensorDataAggregate {
  sensorId: string
  period: 'minute' | 'hour' | 'day' | 'week'
  startTime: Date
  endTime: Date
  samples: number
  average: number | object
  min: number | object
  max: number | object
  stdDev?: number
}

// Alert Configuration
export interface SensorAlert {
  id: string
  sensorId: string
  condition: 'above' | 'below' | 'outside' | 'rate'
  threshold: number | { min: number; max: number }
  duration?: number // seconds
  enabled: boolean
  action: 'notify' | 'email' | 'sms' | 'webhook' | 'control'
  actionConfig?: any
}

// Calibration Data
export interface SensorCalibration {
  sensorId: string
  timestamp: Date
  points: {
    reference: number
    measured: number
  }[]
  coefficients?: {
    offset: number
    scale: number
    polynomial?: number[]
  }
  expires?: Date
}

// WebSocket/MQTT Message Format
export interface SensorMessage {
  type: 'reading' | 'status' | 'alert' | 'config'
  sensorId: string
  timestamp: Date
  payload: any
}

// Sensor Hub Configuration (Raspberry Pi or similar)
export interface SensorHub {
  id: string
  name: string
  platform: 'raspberry-pi' | 'arduino' | 'esp32' | 'industrial-pc'
  ipAddress: string
  sensors: SensorDevice[]
  polling: {
    [sensorId: string]: {
      interval: number // ms
      enabled: boolean
    }
  }
}

// Data Export Formats
export interface SensorDataExport {
  format: 'csv' | 'json' | 'influxdb' | 'prometheus'
  sensors: string[] // sensor IDs
  timeRange: { start: Date; end: Date }
  aggregation?: 'raw' | 'minute' | 'hour' | 'day'
  includeMetadata: boolean
}