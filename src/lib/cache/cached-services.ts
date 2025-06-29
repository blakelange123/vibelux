/**
 * Cached Service Layer
 * Enhanced database and API services with intelligent caching
 */

import { db } from '@/lib/db'
import { fixtureSearchEngine } from '@/lib/fixture-search-engine'
import { influxClient } from '@/lib/influxdb-client'
import { CacheUtils, CacheKeys } from './cache-decorators'
import { cacheManager } from './cache-manager'

/**
 * Cached Database Service
 * Wraps database operations with intelligent caching
 */
export class CachedDbService {
  /**
   * Get fixtures with caching
   */
  static async getFixtures(userId?: string, manufacturer?: string, filters?: any) {
    const key = CacheKeys.fixtureSearch(
      JSON.stringify({ userId, manufacturer, filters })
    )

    return await CacheUtils.computeAndCache(
      key,
      () => db.fixtures.findMany(userId, manufacturer, filters),
      {
        ttl: 3600, // 1 hour
        prefix: 'fixtures'
      }
    )
  }

  /**
   * Get single fixture with caching
   */
  static async getFixture(id: string) {
    const key = CacheKeys.fixture(id)

    return await CacheUtils.computeAndCache(
      key,
      () => db.fixtures.findById(id),
      {
        ttl: 86400, // 24 hours (fixtures don't change often)
        prefix: 'fixtures'
      }
    )
  }

  /**
   * Get user with session caching
   */
  static async getUser(userId: string) {
    return await CacheUtils.cacheUserSession(
      userId,
      'profile',
      undefined,
      {
        ttl: 3600, // 1 hour
      }
    ) || await this.fetchAndCacheUser(userId)
  }

  private static async fetchAndCacheUser(userId: string) {
    const user = await db.users.findById(userId)
    if (user) {
      await CacheUtils.cacheUserSession(userId, 'profile', user)
    }
    return user
  }

  /**
   * Get user projects with caching
   */
  static async getUserProjects(userId: string) {
    const key = `user:projects:${userId}`

    return await CacheUtils.computeAndCache(
      key,
      () => db.projects.findMany(userId),
      {
        ttl: 1800, // 30 minutes
        prefix: 'user'
      }
    )
  }

  /**
   * Update user and invalidate cache
   */
  static async updateUser(userId: string, data: any) {
    const result = await db.users.update(userId, data)
    
    // Invalidate user caches
    await CacheUtils.invalidateUser(userId)
    
    return result
  }

  /**
   * Create/update project and manage cache
   */
  static async saveProject(projectData: any) {
    const result = await db.projects.create(projectData)
    
    // Invalidate user's project cache
    if (result && projectData.userId) {
      await cacheManager.del(`user:projects:${projectData.userId}`)
    }
    
    return result
  }

  /**
   * Batch get fixtures with optimized caching
   */
  static async batchGetFixtures(ids: string[]) {
    const keys = ids.map(id => CacheKeys.fixture(id))
    const cached = await CacheUtils.batchGet(keys)
    
    // Find missing fixtures
    const missingIndices: number[] = []
    const missingIds: string[] = []
    
    cached.forEach((fixture, index) => {
      if (fixture === null) {
        missingIndices.push(index)
        missingIds.push(ids[index])
      }
    })

    // Fetch missing fixtures
    if (missingIds.length > 0) {
      const missingFixtures = await Promise.all(
        missingIds.map(id => db.fixtures.findById(id))
      )

      // Cache the fetched fixtures
      const cacheEntries = missingFixtures
        .filter(fixture => fixture !== null)
        .map((fixture, index) => ({
          key: CacheKeys.fixture(missingIds[index]),
          value: fixture
        }))

      if (cacheEntries.length > 0) {
        await CacheUtils.batchSet(cacheEntries, {
          ttl: 86400,
          prefix: 'fixtures'
        })
      }

      // Update results array
      missingIndices.forEach((originalIndex, missingIndex) => {
        cached[originalIndex] = missingFixtures[missingIndex]
      })
    }

    return cached
  }
}

/**
 * Cached Search Service
 * Enhanced fixture search with intelligent caching
 */
export class CachedSearchService {
  /**
   * Search fixtures with result caching
   */
  static async searchFixtures(filters: any) {
    const queryHash = this.hashQuery(filters)
    const key = CacheKeys.fixtureSearch(queryHash)

    return await CacheUtils.computeAndCache(
      key,
      () => fixtureSearchEngine.searchFixtures(filters),
      {
        ttl: 1800, // 30 minutes
        prefix: 'search'
      }
    )
  }

  /**
   * Get crop recommendations with caching
   */
  static async getCropRecommendations(cropName: string, options: any = {}) {
    const queryHash = this.hashQuery({ cropName, ...options })
    const key = `crop:recommendations:${queryHash}`

    return await CacheUtils.computeAndCache(
      key,
      () => fixtureSearchEngine.getRecommendationsForCrop(cropName, 'all', options),
      {
        ttl: 3600, // 1 hour
        prefix: 'search'
      }
    )
  }

  /**
   * Get search engine stats with short caching
   */
  static async getSearchStats() {
    const key = 'search:engine:stats'

    return await CacheUtils.computeAndCache(
      key,
      () => fixtureSearchEngine.getStats(),
      {
        ttl: 300, // 5 minutes
        prefix: 'search'
      }
    )
  }

  /**
   * Warm up search cache with popular queries
   */
  static async warmupSearchCache() {
    const popularQueries = [
      { cropType: 'lettuce', sortBy: 'relevance' },
      { cropType: 'tomato', sortBy: 'relevance' },
      { cropType: 'basil', sortBy: 'relevance' },
      { efficacyRange: [2.5, 3.5], sortBy: 'efficacy' },
      { priceRange: [500, 2000], sortBy: 'price' },
      { wattageRange: [400, 800], sortBy: 'relevance' }
    ]

    await CacheUtils.warmupCache(
      popularQueries.map(query => ({
        key: CacheKeys.fixtureSearch(this.hashQuery(query)),
        factory: () => fixtureSearchEngine.searchFixtures(query),
        strategy: { ttl: 1800, prefix: 'search' }
      }))
    )
  }

  private static hashQuery(query: any): string {
    return CacheUtils['hashString'](JSON.stringify(query))
  }
}

/**
 * Cached Sensor Service
 * Real-time sensor data with short-term caching
 */
export class CachedSensorService {
  /**
   * Get recent sensor data with short cache
   */
  static async getRecentSensorData(sensorId?: string, limit: number = 100) {
    const key = CacheKeys.sensorData(sensorId || 'all')

    return await CacheUtils.computeAndCache(
      key,
      () => influxClient.getRecentEnvironmentalData(sensorId, limit),
      {
        ttl: 60, // 1 minute
        l1: true,  // Use memory cache
        l2: false, // Skip Redis for real-time data
        prefix: 'sensors'
      }
    )
  }

  /**
   * Get aggregated sensor data with longer cache
   */
  static async getAggregatedSensorData(sensorId: string, timeRange: string) {
    const key = `sensors:aggregated:${sensorId}:${timeRange}`

    return await CacheUtils.computeAndCache(
      key,
      () => this.computeAggregatedData(sensorId, timeRange),
      {
        ttl: 600, // 10 minutes
        prefix: 'sensors'
      }
    )
  }

  private static async computeAggregatedData(sensorId: string, timeRange: string) {
    // This would implement actual aggregation logic
    return {
      sensorId,
      timeRange,
      avg: 75.5,
      min: 70.0,
      max: 80.0,
      count: 1440,
      timestamp: Date.now()
    }
  }
}

/**
 * Cached API Service
 * External API calls with intelligent caching
 */
export class CachedApiService {
  /**
   * Cached external API call
   */
  static async fetchWithCache<T>(
    url: string,
    options: RequestInit = {},
    cacheOptions: { ttl?: number; prefix?: string } = {}
  ): Promise<T> {
    const key = CacheKeys.apiResponse(url, JSON.stringify(options))

    return await CacheUtils.cacheApiResponse(
      url,
      () => this.performFetch<T>(url, options),
      {
        ttl: cacheOptions.ttl || 300, // 5 minutes default
        prefix: cacheOptions.prefix || 'api'
      }
    )
  }

  private static async performFetch<T>(url: string, options: RequestInit): Promise<T> {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  }

  /**
   * Cache configuration data
   */
  static async getConfig(configKey: string) {
    const key = `config:${configKey}`

    return await CacheUtils.computeAndCache(
      key,
      () => this.fetchConfig(configKey),
      {
        ttl: 3600, // 1 hour
        prefix: 'config'
      }
    )
  }

  private static async fetchConfig(configKey: string) {
    // This would fetch from configuration service
    return {
      key: configKey,
      value: 'cached_config_value',
      timestamp: Date.now()
    }
  }
}

/**
 * Cache warming service
 * Proactively warms up frequently accessed data
 */
export class CacheWarmupService {
  /**
   * Warm up all critical caches
   */
  static async warmupAll() {
    
    const startTime = Date.now()
    
    await Promise.allSettled([
      this.warmupFixtures(),
      this.warmupCropData(),
      CachedSearchService.warmupSearchCache(),
      this.warmupUserSessions()
    ])
    
    const duration = Date.now() - startTime
  }

  /**
   * Warm up popular fixtures
   */
  private static async warmupFixtures() {
    // Get most popular fixtures (mock - would come from analytics)
    const popularFixtureIds = ['fixture_001', 'fixture_002', 'fixture_003']
    
    await Promise.all(
      popularFixtureIds.map(id => CachedDbService.getFixture(id))
    )
  }

  /**
   * Warm up crop database
   */
  private static async warmupCropData() {
    const popularCrops = ['lettuce', 'tomato', 'basil', 'kale', 'spinach']
    
    await Promise.all(
      popularCrops.map(crop => 
        CachedSearchService.getCropRecommendations(crop)
      )
    )
  }

  /**
   * Warm up active user sessions
   */
  private static async warmupUserSessions() {
    // This would get active users from analytics/session store
    // For now, just ensure the cache structures are ready
  }
}

export {
  CachedDbService,
  CachedSearchService,
  CachedSensorService,
  CachedApiService,
  CacheWarmupService
}