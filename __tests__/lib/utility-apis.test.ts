import { UtilityAPIClient } from '@/lib/utility-apis/utilityapi-client'
import { ArcadiaClient } from '@/lib/utility-apis/arcadia-client'
import { TestHelpers } from '@/lib/testing/test-helpers'

// Mock fetch globally
global.fetch = jest.fn()

describe('UtilityAPIClient', () => {
  let client: UtilityAPIClient
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
    client = new UtilityAPIClient()
    
    // Set up environment variables
    process.env.UTILITYAPI_TOKEN = 'test-token'
    process.env.UTILITYAPI_BASE_URL = 'https://utilityapi.com/api/v2'
  })

  describe('initiateConnection', () => {
    it('should initiate connection successfully', async () => {
      const mockResponse = {
        authorizationUrl: 'https://utilityapi.com/auth/123',
        state: 'auth-state-123',
        uid: 'connection-123',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await client.initiateConnection('customer-123', 'pge')

      expect(result.authorizationUrl).toBe('https://utilityapi.com/auth/123')
      expect(result.state).toBe('auth-state-123')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://utilityapi.com/api/v2/authorizations',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid utility provider' }),
      } as Response)

      await expect(
        client.initiateConnection('customer-123', 'invalid-utility')
      ).rejects.toThrow('UtilityAPI request failed: 400')
    })
  })

  describe('syncBillData', () => {
    it('should sync bill data successfully', async () => {
      const mockBillsResponse = {
        bills: [
          {
            uid: 'bill-123',
            statementDate: '2024-01-15',
            serviceStartDate: '2023-12-15',
            serviceEndDate: '2024-01-14',
            totalCost: 150.00,
            totalUsageKwh: 1000,
            peakDemandKw: 50,
            lineItems: [
              { name: 'Energy Charge', cost: 100.00, usage: 1000, rate: 0.10, unit: 'kWh' },
              { name: 'Demand Charge', cost: 30.00, usage: 50, rate: 0.60, unit: 'kW' },
              { name: 'Taxes', cost: 20.00 },
            ],
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBillsResponse,
      } as Response)

      // Mock prisma operations
      const { prisma } = require('@/lib/prisma')
      prisma.utilityConnection = {
        findUnique: jest.fn().mockResolvedValue({
          id: 'connection-123',
          customerId: 'customer-123',
          utilityAccountId: 'account-123',
        }),
      }
      prisma.utilityBillData = {
        upsert: jest.fn().mockResolvedValue({
          id: 'bill-data-123',
          customerId: 'customer-123',
        }),
      }

      const result = await client.syncBillData('connection-123')

      expect(result.success).toBe(true)
      expect(result.billsProcessed).toBe(1)
      expect(result.newBills).toBe(1)
    })

    it('should handle empty bill data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bills: [] }),
      } as Response)

      const { prisma } = require('@/lib/prisma')
      prisma.utilityConnection = {
        findUnique: jest.fn().mockResolvedValue({
          id: 'connection-123',
          customerId: 'customer-123',
        }),
      }

      const result = await client.syncBillData('connection-123')

      expect(result.success).toBe(true)
      expect(result.billsProcessed).toBe(0)
      expect(result.newBills).toBe(0)
    })
  })

  describe('getBillData', () => {
    it('should fetch bill data for date range', async () => {
      const mockResponse = TestHelpers.mockUtilityAPIResponse()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      
      const result = await client.getBillData('account-123', startDate, endDate)

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('bills'),
        expect.objectContaining({
          method: 'GET',
        })
      )
    })
  })
})

describe('ArcadiaClient', () => {
  let client: ArcadiaClient
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
    client = new ArcadiaClient()
    
    // Set up environment variables
    process.env.ARCADIA_CLIENT_ID = 'test-client-id'
    process.env.ARCADIA_CLIENT_SECRET = 'test-client-secret'
    process.env.ARCADIA_BASE_URL = 'https://api.arcadia.com/v1'
  })

  describe('initiateConnection', () => {
    it('should initiate connection successfully', async () => {
      const mockResponse = {
        connectUrl: 'https://api.arcadia.com/connect/123',
        state: 'arcadia-state-123',
        requestId: 'request-123',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await client.initiateConnection('customer-123', 'pge')

      expect(result.connectUrl).toBe('https://api.arcadia.com/connect/123')
      expect(result.state).toBe('arcadia-state-123')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.arcadia.com/v1/connect/initiate',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should handle authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      } as Response)

      await expect(
        client.initiateConnection('customer-123', 'pge')
      ).rejects.toThrow('Arcadia API request failed: 401')
    })
  })

  describe('syncBillData', () => {
    it('should sync bill data from Arcadia', async () => {
      const mockBillData = {
        data: {
          bills: [
            {
              id: 'arcadia-bill-123',
              statementDate: '2024-01-15',
              serviceStartDate: '2023-12-15',
              serviceEndDate: '2024-01-14',
              totalAmount: 150.00,
              totalUsage: 1000,
              peakDemand: 50,
              utility: 'Pacific Gas & Electric',
            },
          ],
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBillData,
      } as Response)

      // Mock prisma operations
      const { prisma } = require('@/lib/prisma')
      prisma.utilityConnection = {
        findUnique: jest.fn().mockResolvedValue({
          id: 'connection-123',
          customerId: 'customer-123',
        }),
      }
      prisma.utilityBillData = {
        upsert: jest.fn().mockResolvedValue({
          id: 'bill-data-123',
        }),
      }

      const result = await client.syncBillData('connection-123')

      expect(result.success).toBe(true)
      expect(result.billsProcessed).toBe(1)
    })
  })

  describe('getAccessToken', () => {
    it('should get access token with client credentials', async () => {
      const mockTokenResponse = {
        access_token: 'access-token-123',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response)

      const token = await client.getAccessToken()

      expect(token).toBe('access-token-123')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.arcadia.com/v1/oauth/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      )
    })

    it('should cache access token', async () => {
      const mockTokenResponse = {
        access_token: 'cached-token-123',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response)

      const token1 = await client.getAccessToken()
      const token2 = await client.getAccessToken()

      expect(token1).toBe('cached-token-123')
      expect(token2).toBe('cached-token-123')
      expect(mockFetch).toHaveBeenCalledTimes(1) // Only called once due to caching
    })
  })
})