/**
 * Fixture Search Engine Tests
 * Tests for the AI-powered fixture search and recommendation system
 */

import { describe, it, expect, beforeEach, jest, beforeAll } from '@jest/globals'
import { fixtureSearchEngine } from '@/lib/fixture-search-engine'
import { 
  mockFixture, 
  mockSearchFilters, 
  mockCompatibilityScore,
  generateFixtures,
  createMockDb
} from '../utils/test-helpers'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  db: createMockDb()
}))

jest.mock('@/lib/crop-database', () => ({
  cropDatabase: {
    'Leafy Greens': [
      {
        name: 'Lettuce',
        growthRequirements: {
          temperature: { min: 60, max: 70, optimal: 65 },
          humidity: { min: 50, max: 70, optimal: 60 },
          co2: { min: 400, max: 1200, optimal: 800 }
        },
        lightingRequirements: {
          ppfd: { min: 150, max: 300, optimal: 200 },
          dli: { min: 12, max: 18, optimal: 14 },
          spectrum: 'full-spectrum with emphasis on blue and red'
        }
      }
    ],
    'Fruiting Plants': [
      {
        name: 'Tomato',
        growthRequirements: {
          temperature: { min: 65, max: 80, optimal: 72 },
          humidity: { min: 60, max: 80, optimal: 70 },
          co2: { min: 800, max: 1500, optimal: 1200 }
        },
        lightingRequirements: {
          ppfd: { min: 300, max: 600, optimal: 450 },
          dli: { min: 20, max: 35, optimal: 25 },
          spectrum: 'full-spectrum with far-red for flowering'
        }
      }
    ]
  }
}))

describe('Fixture Search Engine', () => {
  const mockFixtures = generateFixtures(10)

  beforeAll(async () => {
    // Mock the fixtures in the search engine
    ;(fixtureSearchEngine as any).fixtures = mockFixtures
    ;(fixtureSearchEngine as any).cropRequirements = new Map([
      ['lettuce', {
        crop: 'Lettuce',
        ppfdRange: [150, 300],
        dliRange: [12, 18],
        spectrumPreferences: {
          red: [25, 35],
          blue: [15, 25],
          farRed: [5, 15],
          green: [20, 30]
        },
        growthStages: {
          seedling: { ppfd: 100, spectrum: { blue: 30, red: 20 } },
          vegetative: { ppfd: 250, spectrum: { blue: 25, red: 25 } },
          flowering: { ppfd: 400, spectrum: { red: 35, farRed: 15 } }
        },
        environmentalNeeds: {
          temperature: [60, 70],
          humidity: [50, 70],
          co2: [400, 1200]
        }
      }]
    ])
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with fixture data', async () => {
      const stats = fixtureSearchEngine.getStats()
      
      expect(stats.totalFixtures).toBeGreaterThan(0)
      expect(stats.manufacturers).toBeGreaterThan(0)
      expect(stats.crops).toBeGreaterThan(0)
    })

    it('should load crop requirements', () => {
      const crops = fixtureSearchEngine.getAvailableCrops()
      
      expect(crops).toContain('lettuce')
      expect(crops.length).toBeGreaterThan(0)
    })

    it('should extract manufacturer list', () => {
      const manufacturers = fixtureSearchEngine.getManufacturers()
      
      expect(manufacturers).toContain('Test Manufacturer')
      expect(manufacturers.length).toBeGreaterThan(0)
    })
  })

  describe('Basic Search Functionality', () => {
    it('should search fixtures with wattage filter', async () => {
      const filters = {
        wattageRange: [800, 1200] as [number, number],
        limit: 5
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      expect(results).toHaveLength(4) // Fixtures with wattage 1000, 1100
      results.forEach(result => {
        expect(result.fixture.specifications.wattage).toBeGreaterThanOrEqual(800)
        expect(result.fixture.specifications.wattage).toBeLessThanOrEqual(1200)
      })
    })

    it('should search fixtures with efficacy filter', async () => {
      const filters = {
        efficacyRange: [2.7, 3.0] as [number, number],
        limit: 10
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      results.forEach(result => {
        expect(result.fixture.specifications.efficacy).toBeGreaterThanOrEqual(2.7)
        expect(result.fixture.specifications.efficacy).toBeLessThanOrEqual(3.0)
      })
    })

    it('should search fixtures with price filter', async () => {
      const filters = {
        priceRange: [1500, 2000] as [number, number],
        limit: 10
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      results.forEach(result => {
        expect(result.fixture.pricing.msrp).toBeGreaterThanOrEqual(1500)
        expect(result.fixture.pricing.msrp).toBeLessThanOrEqual(2000)
      })
    })

    it('should filter by manufacturer', async () => {
      const filters = {
        manufacturer: ['Test Manufacturer'],
        limit: 10
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      results.forEach(result => {
        expect(result.fixture.manufacturer).toBe('Test Manufacturer')
      })
    })

    it('should exclude manufacturers', async () => {
      const filters = {
        excludeManufacturers: ['Test Manufacturer'],
        limit: 10
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      results.forEach(result => {
        expect(result.fixture.manufacturer).not.toBe('Test Manufacturer')
      })
    })

    it('should filter by dimmable feature', async () => {
      const filters = {
        dimmable: true,
        limit: 10
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      results.forEach(result => {
        expect(result.fixture.features.dimmable).toBe(true)
      })
    })
  })

  describe('Compatibility Scoring', () => {
    it('should calculate compatibility score for crop', async () => {
      const score = await fixtureSearchEngine.calculateCompatibilityScore(
        mockFixtures[0],
        { cropType: 'lettuce', growthStage: 'vegetative' }
      )

      expect(score.overall).toBeGreaterThanOrEqual(0)
      expect(score.overall).toBeLessThanOrEqual(100)
      expect(score.spectrum).toBeGreaterThanOrEqual(0)
      expect(score.efficiency).toBeGreaterThanOrEqual(0)
      expect(score.coverage).toBeGreaterThanOrEqual(0)
      expect(score.growthStage).toBeGreaterThanOrEqual(0)
      expect(score.cost).toBeGreaterThanOrEqual(0)
    })

    it('should provide detailed breakdown', async () => {
      const score = await fixtureSearchEngine.calculateCompatibilityScore(
        mockFixtures[0],
        { cropType: 'lettuce' }
      )

      expect(score.breakdown).toHaveProperty('spectrumMatch')
      expect(score.breakdown).toHaveProperty('efficacyRating')
      expect(score.breakdown).toHaveProperty('coverageRating')
      expect(score.breakdown).toHaveProperty('stageOptimization')
      expect(score.breakdown).toHaveProperty('costEffectiveness')
      expect(score.breakdown).toHaveProperty('thermalPerformance')
    })

    it('should generate recommendations and warnings', async () => {
      const score = await fixtureSearchEngine.calculateCompatibilityScore(
        mockFixtures[0],
        { cropType: 'lettuce', coverageArea: 50 }
      )

      expect(Array.isArray(score.recommendations)).toBe(true)
      expect(Array.isArray(score.warnings)).toBe(true)
    })

    it('should score high efficiency fixtures higher', async () => {
      const highEfficiencyFixture = {
        ...mockFixtures[0],
        specifications: {
          ...mockFixtures[0].specifications,
          efficacy: 3.2
        }
      }

      const lowEfficiencyFixture = {
        ...mockFixtures[0],
        specifications: {
          ...mockFixtures[0].specifications,
          efficacy: 2.0
        }
      }

      const highScore = await fixtureSearchEngine.calculateCompatibilityScore(
        highEfficiencyFixture,
        mockSearchFilters
      )

      const lowScore = await fixtureSearchEngine.calculateCompatibilityScore(
        lowEfficiencyFixture,
        mockSearchFilters
      )

      expect(highScore.efficiency).toBeGreaterThan(lowScore.efficiency)
    })
  })

  describe('Crop-Specific Recommendations', () => {
    it('should get recommendations for specific crop', async () => {
      const recommendations = await fixtureSearchEngine.getRecommendationsForCrop('lettuce')
      
      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeGreaterThan(0)
      
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('fixture')
        expect(rec).toHaveProperty('score')
        expect(rec).toHaveProperty('reasoning')
        expect(rec).toHaveProperty('estimatedCoverage')
        expect(rec).toHaveProperty('costAnalysis')
      })
    })

    it('should get recommendations for growth stage', async () => {
      const recommendations = await fixtureSearchEngine.getRecommendationsForCrop(
        'lettuce',
        'vegetative'
      )
      
      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should include cost analysis in recommendations', async () => {
      const recommendations = await fixtureSearchEngine.getRecommendationsForCrop('lettuce')
      
      if (recommendations.length > 0) {
        const rec = recommendations[0]
        expect(rec.costAnalysis).toHaveProperty('initialCost')
        expect(rec.costAnalysis).toHaveProperty('operatingCostPerYear')
        expect(rec.costAnalysis).toHaveProperty('totalCostOfOwnership')
        expect(rec.costAnalysis.initialCost).toBeGreaterThan(0)
        expect(rec.costAnalysis.operatingCostPerYear).toBeGreaterThan(0)
      }
    })

    it('should include coverage estimates', async () => {
      const recommendations = await fixtureSearchEngine.getRecommendationsForCrop('lettuce')
      
      if (recommendations.length > 0) {
        const rec = recommendations[0]
        expect(rec.estimatedCoverage).toHaveProperty('area')
        expect(rec.estimatedCoverage).toHaveProperty('ppfd')
        expect(rec.estimatedCoverage).toHaveProperty('dli')
        expect(rec.estimatedCoverage.area).toBeGreaterThan(0)
        expect(rec.estimatedCoverage.ppfd).toBeGreaterThan(0)
        expect(rec.estimatedCoverage.dli).toBeGreaterThan(0)
      }
    })
  })

  describe('Sorting and Filtering', () => {
    it('should sort by price', async () => {
      const filters = {
        sortBy: 'price' as const,
        limit: 10
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      for (let i = 1; i < results.length; i++) {
        expect(results[i].fixture.pricing.msrp).toBeGreaterThanOrEqual(
          results[i - 1].fixture.pricing.msrp
        )
      }
    })

    it('should sort by efficacy', async () => {
      const filters = {
        sortBy: 'efficacy' as const,
        limit: 10
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      for (let i = 1; i < results.length; i++) {
        expect(results[i].fixture.specifications.efficacy).toBeLessThanOrEqual(
          results[i - 1].fixture.specifications.efficacy
        )
      }
    })

    it('should sort by relevance (compatibility score)', async () => {
      const filters = {
        cropType: 'lettuce',
        sortBy: 'relevance' as const,
        limit: 10
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      for (let i = 1; i < results.length; i++) {
        expect(results[i].score.overall).toBeLessThanOrEqual(
          results[i - 1].score.overall
        )
      }
    })

    it('should limit results', async () => {
      const filters = {
        limit: 3
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      expect(results.length).toBeLessThanOrEqual(3)
    })
  })

  describe('Advanced Filtering', () => {
    it('should combine multiple filters', async () => {
      const filters = {
        wattageRange: [800, 1200] as [number, number],
        efficacyRange: [2.5, 3.0] as [number, number],
        priceRange: [1000, 2000] as [number, number],
        dimmable: true,
        limit: 10
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      results.forEach(result => {
        const fixture = result.fixture
        expect(fixture.specifications.wattage).toBeGreaterThanOrEqual(800)
        expect(fixture.specifications.wattage).toBeLessThanOrEqual(1200)
        expect(fixture.specifications.efficacy).toBeGreaterThanOrEqual(2.5)
        expect(fixture.specifications.efficacy).toBeLessThanOrEqual(3.0)
        expect(fixture.pricing.msrp).toBeGreaterThanOrEqual(1000)
        expect(fixture.pricing.msrp).toBeLessThanOrEqual(2000)
        expect(fixture.features.dimmable).toBe(true)
      })
    })

    it('should handle empty filter results', async () => {
      const filters = {
        wattageRange: [10000, 20000] as [number, number], // No fixtures in this range
        limit: 10
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      expect(results).toHaveLength(0)
    })

    it('should handle coverage area calculations', async () => {
      const filters = {
        coverageArea: 100,
        limit: 5
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      results.forEach(result => {
        expect(result.estimatedCoverage.area).toBeDefined()
        expect(result.score.coverage).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Performance and Statistics', () => {
    it('should provide engine statistics', () => {
      const stats = fixtureSearchEngine.getStats()
      
      expect(stats).toHaveProperty('totalFixtures')
      expect(stats).toHaveProperty('manufacturers')
      expect(stats).toHaveProperty('crops')
      expect(stats).toHaveProperty('avgEfficacy')
      expect(stats).toHaveProperty('priceRange')
      
      expect(stats.totalFixtures).toBeGreaterThan(0)
      expect(stats.manufacturers).toBeGreaterThan(0)
      expect(Array.isArray(stats.priceRange)).toBe(true)
      expect(stats.priceRange).toHaveLength(2)
    })

    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now()
      
      const results = await fixtureSearchEngine.searchFixtures({
        limit: 100
      })
      
      const endTime = Date.now()
      const executionTime = endTime - startTime
      
      // Should complete within reasonable time (< 1 second)
      expect(executionTime).toBeLessThan(1000)
      expect(results.length).toBeLessThanOrEqual(100)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid crop names gracefully', async () => {
      const recommendations = await fixtureSearchEngine.getRecommendationsForCrop('nonexistent-crop')
      
      expect(Array.isArray(recommendations)).toBe(true)
      // Should still return some results with default scoring
    })

    it('should handle invalid filter values', async () => {
      const filters = {
        wattageRange: [-100, -50] as [number, number], // Invalid range
        limit: 10
      }

      const results = await fixtureSearchEngine.searchFixtures(filters)
      
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(0) // No fixtures match invalid criteria
    })

    it('should handle missing fixture data', async () => {
      const incompleteFixture = {
        ...mockFixtures[0],
        specifications: {
          // Missing some required fields
          wattage: 1000
        }
      }

      const score = await fixtureSearchEngine.calculateCompatibilityScore(
        incompleteFixture,
        { cropType: 'lettuce' }
      )

      expect(score.overall).toBeGreaterThanOrEqual(0)
      expect(score.overall).toBeLessThanOrEqual(100)
    })
  })
})