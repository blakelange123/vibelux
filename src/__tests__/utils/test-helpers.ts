/**
 * Test Helper Utilities
 * Common utilities and mock data for testing
 */

import { NextRequest } from 'next/server'

// Mock fixture data
export const mockFixture = {
  id: 'test_fixture_001',
  manufacturer: 'Test Manufacturer',
  model: 'TM-LED-1000',
  type: 'LED Grow Light',
  specifications: {
    wattage: 1000,
    efficacy: 2.8,
    ppfd: 2800,
    spectrum: {
      red: 30,
      blue: 20,
      farRed: 10,
      green: 25,
      uv: 5
    },
    lifespan: 50000,
    dimmable: true,
    coverage: {
      flowering: 100,
      vegetative: 150
    }
  },
  pricing: {
    msrp: 1500,
    dealer: 1200,
    volume: 1000
  },
  features: {
    dimmable: true,
    waterproof: false,
    fanless: true,
    spectrum_control: false
  },
  certifications: ['dlc', 'etl'],
  dimensions: {
    length: 48,
    width: 12,
    height: 4,
    weight: 35
  },
  thermal: {
    heat_output: 3400,
    operating_temp: [-20, 40],
    ip_rating: 'IP65'
  },
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01')
}

// Mock user data
export const mockUser = {
  id: 'test_user_123',
  clerkId: 'clerk_user_123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  subscription: 'pro',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

// Mock project data
export const mockProject = {
  id: 'test_project_123',
  name: 'Test Grow Facility',
  description: 'Test indoor growing facility',
  userId: 'test_user_123',
  settings: {
    units: 'imperial',
    currency: 'USD'
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

// Mock sensor reading
export const mockSensorReading = {
  sensorId: 'test_sensor_001',
  type: 'temperature',
  value: 75.5,
  unit: '°F',
  timestamp: Date.now(),
  location: 'Zone A',
  projectId: 'test_project_123'
}

// Mock search filters
export const mockSearchFilters = {
  wattageRange: [500, 1500] as [number, number],
  efficacyRange: [2.0, 3.0] as [number, number],
  priceRange: [500, 2000] as [number, number],
  cropType: 'lettuce',
  growthStage: 'vegetative' as const,
  sortBy: 'relevance' as const,
  limit: 10
}

// Mock compatibility score
export const mockCompatibilityScore = {
  overall: 85,
  spectrum: 90,
  efficiency: 80,
  coverage: 85,
  growthStage: 80,
  cost: 75,
  breakdown: {
    spectrumMatch: 90,
    efficacyRating: 80,
    coverageRating: 85,
    stageOptimization: 80,
    costEffectiveness: 75,
    thermalPerformance: 85
  },
  recommendations: ['Excellent spectrum match for lettuce'],
  warnings: []
}

// Create mock NextRequest
export function createMockRequest(
  url: string = 'http://localhost:3000/test',
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  }

  if (body && method !== 'GET') {
    init.body = JSON.stringify(body)
  }

  return new NextRequest(url, init)
}

// Create authenticated request with mock user
export function createAuthenticatedRequest(
  url: string = 'http://localhost:3000/test',
  method: string = 'GET',
  body?: any,
  userId: string = 'test_user_123'
): NextRequest & { user?: any } {
  const request = createMockRequest(url, method, body, {
    'Authorization': `Bearer test_token_${userId}`
  })
  
  // Add mock user to request
  ;(request as any).user = {
    userId,
    role: 'user',
    permissions: ['read', 'write']
  }
  
  return request as NextRequest & { user?: any }
}

// Mock database responses
export const createMockDb = () => ({
  fixtures: {
    findMany: jest.fn().mockResolvedValue([mockFixture]),
    findUnique: jest.fn().mockResolvedValue(mockFixture),
    create: jest.fn().mockResolvedValue(mockFixture),
    update: jest.fn().mockResolvedValue(mockFixture),
    delete: jest.fn().mockResolvedValue(mockFixture)
  },
  users: {
    findMany: jest.fn().mockResolvedValue([mockUser]),
    findUnique: jest.fn().mockResolvedValue(mockUser),
    findByClerkId: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn().mockResolvedValue(mockUser)
  },
  projects: {
    findMany: jest.fn().mockResolvedValue([mockProject]),
    findUnique: jest.fn().mockResolvedValue(mockProject),
    create: jest.fn().mockResolvedValue(mockProject),
    update: jest.fn().mockResolvedValue(mockProject),
    delete: jest.fn().mockResolvedValue(mockProject)
  }
})

// Mock InfluxDB client
export const createMockInfluxClient = () => ({
  writeSensorData: jest.fn().mockResolvedValue(true),
  querySensorData: jest.fn().mockResolvedValue([mockSensorReading]),
  getRecentEnvironmentalData: jest.fn().mockResolvedValue([mockSensorReading]),
  getRecentLightingData: jest.fn().mockResolvedValue([]),
  testConnection: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(undefined)
})

// Mock WebSocket server
export const createMockWebSocketServer = () => ({
  start: jest.fn().mockResolvedValue(true),
  stop: jest.fn().mockResolvedValue(undefined),
  getStats: jest.fn().mockReturnValue({
    isRunning: true,
    clientCount: 5,
    authenticatedClients: 3,
    channelCount: 4,
    channels: {
      'sensors:environmental': 2,
      'lighting:status': 1,
      'system:alerts': 2
    }
  }),
  broadcastToChannel: jest.fn(),
  sendToClient: jest.fn()
})

// Mock fixture search engine
export const createMockSearchEngine = () => ({
  initialize: jest.fn().mockResolvedValue(undefined),
  searchFixtures: jest.fn().mockResolvedValue([{
    fixture: mockFixture,
    score: mockCompatibilityScore,
    reasoning: 'Excellent match for your requirements',
    alternatives: [],
    estimatedCoverage: {
      area: 100,
      ppfd: 400,
      dli: 17.3
    },
    costAnalysis: {
      initialCost: 1500,
      operatingCostPerYear: 876,
      totalCostOfOwnership: 6256,
      paybackPeriod: 7.1
    }
  }]),
  getRecommendationsForCrop: jest.fn().mockResolvedValue([]),
  calculateCompatibilityScore: jest.fn().mockResolvedValue(mockCompatibilityScore),
  getAvailableCrops: jest.fn().mockReturnValue(['lettuce', 'tomato', 'basil']),
  getManufacturers: jest.fn().mockReturnValue(['Test Manufacturer', 'Another Manufacturer']),
  getStats: jest.fn().mockReturnValue({
    totalFixtures: 2260,
    manufacturers: 45,
    crops: 28,
    avgEfficacy: 2.65,
    priceRange: [299, 15999]
  })
})

// Wait for async operations
export const waitFor = (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms))

// Assert response status and content type
export function assertApiResponse(response: Response, expectedStatus: number = 200) {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('content-type')).toContain('application/json')
}

// Assert error response format
export function assertErrorResponse(response: Response, expectedStatus: number, errorMessage?: string) {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('content-type')).toContain('application/json')
  
  if (errorMessage) {
    const error = response.json()
    expect(error).toMatchObject({ error: expect.stringContaining(errorMessage) })
  }
}

// Generate test data
export function generateFixtures(count: number = 5) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockFixture,
    id: `test_fixture_${String(i + 1).padStart(3, '0')}`,
    model: `TM-LED-${1000 + i * 100}`,
    specifications: {
      ...mockFixture.specifications,
      wattage: 1000 + i * 100,
      ppfd: 2800 + i * 200,
      efficacy: 2.5 + i * 0.1
    },
    pricing: {
      ...mockFixture.pricing,
      msrp: 1500 + i * 200
    }
  }))
}

export function generateSensorReadings(count: number = 10, sensorType: string = 'temperature') {
  return Array.from({ length: count }, (_, i) => ({
    ...mockSensorReading,
    type: sensorType,
    value: 70 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
    timestamp: Date.now() - i * 60000 // Every minute
  }))
}

// Mock React hooks
export const mockUseState = (initialValue: any) => {
  let value = initialValue
  const setValue = jest.fn((newValue) => {
    value = typeof newValue === 'function' ? newValue(value) : newValue
  })
  return [value, setValue]
}

export const mockUseEffect = jest.fn((fn, deps) => {
  fn()
})

export const mockUseCallback = jest.fn((fn, deps) => fn)

// Custom matchers
expect.extend({
  toBeValidFixture(received) {
    const requiredFields = ['id', 'manufacturer', 'model', 'specifications', 'pricing']
    const missingFields = requiredFields.filter(field => !(field in received))
    
    if (missingFields.length > 0) {
      return {
        message: () => `Expected fixture to have required fields: ${missingFields.join(', ')}`,
        pass: false
      }
    }
    
    return {
      message: () => 'Expected fixture to be invalid',
      pass: true
    }
  },
  
  toBeValidApiResponse(received) {
    const hasStatus = 'status' in received
    const hasHeaders = 'headers' in received
    const hasJson = typeof received.json === 'function'
    
    if (!hasStatus || !hasHeaders || !hasJson) {
      return {
        message: () => 'Expected valid API response with status, headers, and json method',
        pass: false
      }
    }
    
    return {
      message: () => 'Expected invalid API response',
      pass: true
    }
  }
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidFixture(): R
      toBeValidApiResponse(): R
    }
  }
}