import { createMocks } from 'node-mocks-http'
import readingsHandler from '@/pages/api/iot/readings'
import devicesHandler from '@/pages/api/iot/devices'
import { TestHelpers } from '@/lib/testing/test-helpers'

// Mock IoT services
jest.mock('@/lib/sensor-integration')
jest.mock('@/lib/auth/api-auth')
jest.mock('@/lib/prisma')

describe('/api/iot/readings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock the auth middleware
    const { withCustomerAuth } = require('@/lib/auth/api-auth')
    withCustomerAuth.mockImplementation((handler) => handler)
    
    const { withErrorHandler } = require('@/lib/monitoring/error-handler')
    withErrorHandler.mockImplementation((handler) => handler)
  })

  it('should get IoT readings for facility', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        facilityId: 'facility-123',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
    })

    const { prisma } = require('@/lib/prisma')
    const mockReadings = [
      {
        id: 'reading-1',
        facilityId: 'facility-123',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        energyUsage: 45.5,
        powerDemand: 180.2,
        temperature: 22.5,
        humidity: 65.0,
      },
      {
        id: 'reading-2',
        facilityId: 'facility-123',
        timestamp: new Date('2024-01-15T10:15:00Z'),
        energyUsage: 46.2,
        powerDemand: 185.1,
        temperature: 23.0,
        humidity: 64.5,
      },
    ]

    prisma.ioTReading = {
      findMany: jest.fn().mockResolvedValue(mockReadings),
    }

    await readingsHandler(req, res, {})

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.readings).toHaveLength(2)
    expect(data.readings[0].energyUsage).toBe(45.5)
  })

  it('should create new IoT reading', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        facilityId: 'facility-123',
        timestamp: '2024-01-15T10:30:00Z',
        energyUsage: 47.1,
        powerDemand: 190.5,
        temperature: 23.5,
        humidity: 63.0,
        equipmentStatus: {
          lighting: { status: 'online', dimLevel: 85 },
          hvac: { status: 'online', setpoint: 72 },
        },
      },
    })

    const { prisma } = require('@/lib/prisma')
    const mockCreatedReading = {
      id: 'reading-3',
      facilityId: 'facility-123',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      energyUsage: 47.1,
      powerDemand: 190.5,
      temperature: 23.5,
      humidity: 63.0,
    }

    prisma.ioTReading = {
      create: jest.fn().mockResolvedValue(mockCreatedReading),
    }

    await readingsHandler(req, res, {})

    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.reading.id).toBe('reading-3')
    expect(data.reading.energyUsage).toBe(47.1)
  })

  it('should return error for invalid facility ID', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    })

    await readingsHandler(req, res, {})

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Missing facilityId')
  })
})

describe('/api/iot/devices', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock the auth middleware
    const { withCustomerAuth } = require('@/lib/auth/api-auth')
    withCustomerAuth.mockImplementation((handler) => handler)
    
    const { withErrorHandler } = require('@/lib/monitoring/error-handler')
    withErrorHandler.mockImplementation((handler) => handler)
  })

  it('should register new IoT device', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        facilityId: 'facility-123',
        deviceType: 'ENERGY_METER',
        protocol: 'MODBUS',
        address: '192.168.1.100',
        port: 502,
        unitId: 1,
        configuration: {
          readInterval: 60,
          registers: [1001, 1002, 1003],
        },
      },
    })

    const { SensorIntegrationService } = require('@/lib/sensor-integration')
    const mockService = {
      registerDevice: jest.fn().mockResolvedValue({
        id: 'device-123',
        status: 'REGISTERED',
        connectionTest: 'PASSED',
      }),
    }
    SensorIntegrationService.mockImplementation(() => mockService)

    await devicesHandler(req, res, {})

    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.device.id).toBe('device-123')
    expect(data.device.status).toBe('REGISTERED')
  })

  it('should get IoT devices for facility', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        facilityId: 'facility-123',
      },
    })

    const { prisma } = require('@/lib/prisma')
    const mockDevices = [
      {
        id: 'device-1',
        facilityId: 'facility-123',
        deviceType: 'ENERGY_METER',
        protocol: 'MODBUS',
        status: 'ONLINE',
        lastSeen: new Date(),
      },
      {
        id: 'device-2',
        facilityId: 'facility-123',
        deviceType: 'TEMPERATURE_SENSOR',
        protocol: 'I2C',
        status: 'ONLINE',
        lastSeen: new Date(),
      },
    ]

    prisma.ioTDevice = {
      findMany: jest.fn().mockResolvedValue(mockDevices),
    }

    await devicesHandler(req, res, {})

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.devices).toHaveLength(2)
    expect(data.devices[0].deviceType).toBe('ENERGY_METER')
  })

  it('should test device connection', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: {
        action: 'test',
      },
      body: {
        deviceId: 'device-123',
      },
    })

    const { SensorIntegrationService } = require('@/lib/sensor-integration')
    const mockService = {
      testConnection: jest.fn().mockResolvedValue({
        success: true,
        responseTime: 45,
        lastReading: {
          timestamp: new Date(),
          value: 42.5,
          quality: 'good',
        },
      }),
    }
    SensorIntegrationService.mockImplementation(() => mockService)

    await devicesHandler(req, res, {})

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.connectionTest.success).toBe(true)
    expect(data.connectionTest.responseTime).toBe(45)
  })
})