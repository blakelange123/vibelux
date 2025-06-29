import { createMocks } from 'node-mocks-http'
import connectHandler from '@/pages/api/utility/connect'
import syncHandler from '@/pages/api/utility/sync'
import { TestHelpers } from '@/lib/testing/test-helpers'

// Mock utility clients
jest.mock('@/lib/utility-apis/utilityapi-client')
jest.mock('@/lib/utility-apis/arcadia-client')
jest.mock('@/lib/auth/api-auth')

describe('/api/utility/connect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock the auth middleware
    const { withCustomerAuth } = require('@/lib/auth/api-auth')
    withCustomerAuth.mockImplementation((handler) => handler)
    
    const { withErrorHandler } = require('@/lib/monitoring/error-handler')
    withErrorHandler.mockImplementation((handler) => handler)
  })

  it('should initiate utility connection with UtilityAPI', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'customer-123',
        utility: 'pge',
        provider: 'utilityapi',
      },
    })

    const { UtilityAPIClient } = require('@/lib/utility-apis/utilityapi-client')
    const mockClient = {
      initiateConnection: jest.fn().mockResolvedValue({
        authorizationUrl: 'https://utilityapi.com/auth/123',
        state: 'auth-state-123',
      }),
    }
    UtilityAPIClient.mockImplementation(() => mockClient)

    await connectHandler(req, res, {})

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.authorizationUrl).toBe('https://utilityapi.com/auth/123')
    expect(data.state).toBe('auth-state-123')
    expect(data.provider).toBe('utilityapi')
  })

  it('should initiate utility connection with Arcadia', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'customer-123',
        utility: 'pge',
        provider: 'arcadia',
      },
    })

    const { ArcadiaClient } = require('@/lib/utility-apis/arcadia-client')
    const mockClient = {
      initiateConnection: jest.fn().mockResolvedValue({
        connectUrl: 'https://api.arcadia.com/connect/123',
        state: 'arcadia-state-123',
      }),
    }
    ArcadiaClient.mockImplementation(() => mockClient)

    await connectHandler(req, res, {})

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.authorizationUrl).toBe('https://api.arcadia.com/connect/123')
    expect(data.state).toBe('arcadia-state-123')
    expect(data.provider).toBe('arcadia')
  })

  it('should return error for missing parameters', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'customer-123',
        // Missing utility
      },
    })

    await connectHandler(req, res, {})

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Missing customerId or utility')
  })

  it('should reject non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await connectHandler(req, res, {})

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})

describe('/api/utility/sync', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock the auth middleware
    const { withCustomerAuth } = require('@/lib/auth/api-auth')
    withCustomerAuth.mockImplementation((handler) => handler)
    
    const { withErrorHandler } = require('@/lib/monitoring/error-handler')
    withErrorHandler.mockImplementation((handler) => handler)
  })

  it('should sync utility data successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'customer-123',
        connectionId: 'connection-123',
      },
    })

    const { UtilityAPIClient } = require('@/lib/utility-apis/utilityapi-client')
    const mockClient = {
      syncBillData: jest.fn().mockResolvedValue({
        success: true,
        billsProcessed: 3,
        newBills: 1,
        updatedBills: 2,
      }),
    }
    UtilityAPIClient.mockImplementation(() => mockClient)

    await syncHandler(req, res, {})

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.billsProcessed).toBe(3)
    expect(data.newBills).toBe(1)
    expect(data.updatedBills).toBe(2)
  })

  it('should handle sync errors gracefully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'customer-123',
        connectionId: 'invalid-connection',
      },
    })

    const { UtilityAPIClient } = require('@/lib/utility-apis/utilityapi-client')
    const mockClient = {
      syncBillData: jest.fn().mockRejectedValue(new Error('Connection not found')),
    }
    UtilityAPIClient.mockImplementation(() => mockClient)

    await syncHandler(req, res, {})

    expect(res._getStatusCode()).toBe(500)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to sync utility data')
  })
})