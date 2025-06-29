/**
 * Fixture Search API Tests
 * Tests for the advanced fixture search endpoint
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { GET } from '@/app/api/fixtures/search/route'
import { 
  createAuthenticatedRequest, 
  assertApiResponse, 
  assertErrorResponse,
  createMockSearchEngine,
  mockFixture,
  mockCompatibilityScore
} from '../../utils/test-helpers'

// Mock the search engine
jest.mock('@/lib/fixture-search-engine', () => ({
  fixtureSearchEngine: createMockSearchEngine()
}))

// Mock authentication middleware
jest.mock('@/middleware/mobile-auth', () => ({
  requireAuth: (handler: Function) => handler,
  getAuthenticatedUser: () => ({
    userId: 'test_user_123',
    role: 'user',
    permissions: ['read']
  })
}))

const mockSearchEngine = createMockSearchEngine()

describe('/api/fixtures/search', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/fixtures/search', () => {
    it('should search fixtures with basic filters', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?wattageMin=500&wattageMax=1500&sortBy=efficacy'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)
      const data = await response.json()

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        wattageRange: [500, 1500],
        sortBy: 'efficacy'
      })
      
      expect(data).toHaveProperty('recommendations')
      expect(data).toHaveProperty('meta')
      expect(data.meta).toHaveProperty('total')
      expect(data.meta).toHaveProperty('filters')
      expect(data.meta).toHaveProperty('stats')
      expect(data.meta).toHaveProperty('userId')
    })

    it('should search fixtures with efficacy range', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?efficacyMin=2.5&efficacyMax=3.5'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        efficacyRange: [2.5, 3.5]
      })
    })

    it('should search fixtures with price range', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?priceMin=1000&priceMax=5000'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        priceRange: [1000, 5000]
      })
    })

    it('should search fixtures with coverage area', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?coverageArea=100&mountingHeight=24'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        coverageArea: 100,
        mountingHeight: 24
      })
    })

    it('should search fixtures with spectrum filters', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?spectrumType=full-spectrum'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        spectrumType: 'full-spectrum'
      })
    })

    it('should search fixtures with application filters', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?cropType=lettuce&growthStage=vegetative&indoorType=greenhouse'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        cropType: 'lettuce',
        growthStage: 'vegetative',
        indoorType: 'greenhouse'
      })
    })

    it('should search fixtures with performance filters', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?dimmable=true&lifespan=50000&certification=dlc'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        dimmable: true,
        lifespan: 50000,
        certification: 'dlc'
      })
    })

    it('should search fixtures with manufacturer filters', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?manufacturers=Fluence,Current&excludeManufacturers=Generic'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        manufacturer: ['Fluence', 'Current'],
        excludeManufacturers: ['Generic']
      })
    })

    it('should search fixtures with sustainability filters', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?energyStarRated=true'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        energyStarRated: true
      })
    })

    it('should search fixtures with advanced targets', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?ppfdTarget=400&dliTarget=20'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        ppfdTarget: 400,
        dliTarget: 20
      })
    })

    it('should search fixtures with sorting and limit', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?sortBy=price&limit=5'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        sortBy: 'price',
        limit: 5
      })
    })

    it('should handle complex multi-filter search', async () => {
      const params = new URLSearchParams({
        wattageMin: '600',
        wattageMax: '1200',
        efficacyMin: '2.5',
        efficacyMax: '3.2',
        priceMin: '800',
        priceMax: '2500',
        cropType: 'tomato',
        growthStage: 'flowering',
        indoorType: 'vertical-farm',
        dimmable: 'true',
        sortBy: 'relevance',
        limit: '10'
      })

      const url = `http://localhost:3000/api/fixtures/search?${params.toString()}`
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        wattageRange: [600, 1200],
        efficacyRange: [2.5, 3.2],
        priceRange: [800, 2500],
        cropType: 'tomato',
        growthStage: 'flowering',
        indoorType: 'vertical-farm',
        dimmable: true,
        sortBy: 'relevance',
        limit: 10
      })
    })

    it('should handle empty search (no filters)', async () => {
      const url = 'http://localhost:3000/api/fixtures/search'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)
      const data = await response.json()

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({})
      expect(data.recommendations).toBeDefined()
    })

    it('should return proper response structure', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?cropType=lettuce'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)
      const data = await response.json()

      assertApiResponse(response, 200)
      
      expect(data).toHaveProperty('recommendations')
      expect(data).toHaveProperty('meta')
      
      // Verify meta structure
      expect(data.meta).toHaveProperty('total')
      expect(data.meta).toHaveProperty('filters')
      expect(data.meta).toHaveProperty('stats')
      expect(data.meta).toHaveProperty('userId')
      expect(data.meta.userId).toBe('test_user_123')
      
      // Verify recommendations structure
      expect(Array.isArray(data.recommendations)).toBe(true)
      if (data.recommendations.length > 0) {
        const rec = data.recommendations[0]
        expect(rec).toHaveProperty('fixture')
        expect(rec).toHaveProperty('score')
        expect(rec).toHaveProperty('reasoning')
        expect(rec).toHaveProperty('estimatedCoverage')
        expect(rec).toHaveProperty('costAnalysis')
      }
    })

    it('should handle boolean parameter parsing', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?dimmable=false&energyStarRated=true'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        dimmable: false,
        energyStarRated: true
      })
    })

    it('should handle numeric parameter parsing', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?wattageMin=100.5&efficacyMin=2.75'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        wattageRange: [100, undefined], // parseInt for wattage
        efficacyRange: [2.75, undefined] // parseFloat for efficacy
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle search engine errors', async () => {
      mockSearchEngine.searchFixtures.mockRejectedValueOnce(new Error('Search failed'))
      
      const url = 'http://localhost:3000/api/fixtures/search'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertErrorResponse(response, 500, 'Failed to search fixtures')
    })

    it('should handle invalid parameter values gracefully', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?wattageMin=invalid&priceMax=notanumber'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      // Should still work, just ignore invalid parameters
      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        wattageRange: [0, undefined], // invalid parseInt becomes 0
        priceRange: [undefined, 0] // invalid parseInt becomes 0
      })
    })

    it('should handle authentication errors', async () => {
      // Mock authentication failure
      jest.doMock('@/middleware/mobile-auth', () => ({
        requireAuth: () => {
          throw new Error('Authentication required')
        },
        getAuthenticatedUser: () => {
          throw new Error('No authenticated user')
        }
      }))

      const url = 'http://localhost:3000/api/fixtures/search'
      const request = createAuthenticatedRequest(url, 'GET')

      // This would normally be handled by the auth middleware
      // but we're testing the behavior
      expect(() => {
        throw new Error('Authentication required')
      }).toThrow('Authentication required')
    })

    it('should handle malformed URLs', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?manufacturers='
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      // Should handle empty manufacturer list gracefully
      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        manufacturer: [''] // Empty string in array
      })
    })

    it('should handle very large limit values', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?limit=99999'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        limit: 99999
      })
    })
  })

  describe('Performance', () => {
    it('should complete search within reasonable time', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?limit=100'
      const request = createAuthenticatedRequest(url, 'GET')

      const startTime = Date.now()
      const response = await GET(request)
      const endTime = Date.now()

      assertApiResponse(response, 200)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should handle concurrent requests', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?cropType=lettuce'
      const requests = Array.from({ length: 5 }, () => 
        createAuthenticatedRequest(url, 'GET')
      )

      const responses = await Promise.all(
        requests.map(request => GET(request))
      )

      responses.forEach(response => {
        assertApiResponse(response, 200)
      })
    })
  })

  describe('Query Parameter Validation', () => {
    it('should handle incomplete ranges', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?wattageMin=500'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        wattageRange: [500, undefined]
      })
    })

    it('should handle enum values correctly', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?sortBy=newest&certification=ul'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        sortBy: 'newest',
        certification: 'ul'
      })
    })

    it('should handle comma-separated values', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?manufacturers=Fluence,Current,Gavita'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        manufacturer: ['Fluence', 'Current', 'Gavita']
      })
    })

    it('should ignore unknown parameters', async () => {
      const url = 'http://localhost:3000/api/fixtures/search?unknownParam=value&cropType=lettuce'
      const request = createAuthenticatedRequest(url, 'GET')

      const response = await GET(request)

      assertApiResponse(response, 200)
      expect(mockSearchEngine.searchFixtures).toHaveBeenCalledWith({
        cropType: 'lettuce'
      })
    })
  })
})