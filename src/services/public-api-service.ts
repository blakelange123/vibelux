/**
 * Public REST API Service
 * 
 * Provides public-facing REST API endpoints for yield data, system performance,
 * equipment runtime, and other operational metrics.
 */

import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import { z } from 'zod'
import crypto from 'crypto'
import { RateLimiter } from 'limiter'

const prisma = new PrismaClient()
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
})

// API Configuration
export const API_CONFIG = {
  versions: ['v1', 'v2'],
  defaultVersion: 'v1',
  rateLimit: {
    free: { requests: 100, window: '1h' },
    basic: { requests: 1000, window: '1h' },
    pro: { requests: 10000, window: '1h' },
    enterprise: { requests: 100000, window: '1h' }
  },
  cacheTTL: {
    short: 60, // 1 minute
    medium: 300, // 5 minutes
    long: 3600 // 1 hour
  }
}

// API Key tiers
export enum APITier {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

// API Response schemas
export const YieldDataSchema = z.object({
  facilityId: z.string(),
  cultivar: z.string(),
  cycleId: z.string(),
  harvestDate: z.date(),
  totalYield: z.number(),
  yieldPerSqFt: z.number(),
  qualityMetrics: z.object({
    thcContent: z.number().optional(),
    cbdContent: z.number().optional(),
    terpeneProfile: z.record(z.number()).optional(),
    moistureContent: z.number(),
    trimLoss: z.number()
  }),
  growthMetrics: z.object({
    vegetativeDays: z.number(),
    floweringDays: z.number(),
    totalCycleDays: z.number(),
    finalPlantHeight: z.number(),
    plantsPerSqFt: z.number()
  })
})

export const SystemPerformanceSchema = z.object({
  facilityId: z.string(),
  timestamp: z.date(),
  performance: z.object({
    overallEfficiency: z.number(),
    energyEfficiency: z.number(),
    waterEfficiency: z.number(),
    laborEfficiency: z.number(),
    yieldEfficiency: z.number()
  }),
  environmental: z.object({
    avgTemperature: z.number(),
    avgHumidity: z.number(),
    avgCO2: z.number(),
    avgVPD: z.number(),
    lightingDLI: z.number()
  }),
  alerts: z.array(z.object({
    type: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    message: z.string(),
    timestamp: z.date()
  }))
})

export const EquipmentRuntimeSchema = z.object({
  equipmentId: z.string(),
  equipmentType: z.string(),
  facilityId: z.string(),
  period: z.object({
    start: z.date(),
    end: z.date()
  }),
  runtime: z.object({
    totalHours: z.number(),
    onCycles: z.number(),
    avgCycleDuration: z.number(),
    efficiency: z.number()
  }),
  maintenance: z.object({
    lastServiceDate: z.date().optional(),
    nextServiceDue: z.date().optional(),
    totalServiceHours: z.number(),
    healthScore: z.number()
  }),
  energy: z.object({
    totalKwh: z.number(),
    avgPowerDraw: z.number(),
    peakPowerDraw: z.number(),
    powerFactor: z.number()
  })
})

// Rate limiting
const rateLimiters = new Map<string, RateLimiter>()

export class PublicAPIService {
  private apiKeys: Map<string, APIKeyData> = new Map()

  constructor() {
    this.initializeAPIKeys()
  }

  private async initializeAPIKeys() {
    // Load API keys from database
    const keys = await prisma.apiKey.findMany({
      where: { active: true }
    })
    
    keys.forEach(key => {
      this.apiKeys.set(key.key, {
        id: key.id,
        tier: key.tier as APITier,
        name: key.name,
        permissions: key.permissions as string[],
        webhookSecret: key.webhookSecret
      })
    })
  }

  /**
   * Validate API key and check rate limits
   */
  async validateRequest(apiKey: string, endpoint: string): Promise<APIValidationResult> {
    const keyData = this.apiKeys.get(apiKey)
    
    if (!keyData) {
      return { valid: false, error: 'Invalid API key' }
    }

    // Check rate limit
    const rateLimitKey = `${apiKey}:${endpoint}`
    let limiter = rateLimiters.get(rateLimitKey)
    
    if (!limiter) {
      const limits = API_CONFIG.rateLimit[keyData.tier]
      limiter = new RateLimiter(limits.requests, limits.window)
      rateLimiters.set(rateLimitKey, limiter)
    }

    const remaining = limiter.tryRemoveTokens(1)
    if (remaining === false) {
      return { 
        valid: false, 
        error: 'Rate limit exceeded',
        retryAfter: limiter.tokenBucket.interval
      }
    }

    // Log API usage
    await this.logAPIUsage(keyData.id, endpoint)

    return { 
      valid: true, 
      keyData,
      remaining: limiter.getTokensRemaining()
    }
  }

  /**
   * Get yield data with filters
   */
  async getYieldData(
    facilityId: string,
    filters?: {
      cultivar?: string
      startDate?: Date
      endDate?: Date
      minYield?: number
      limit?: number
      offset?: number
    }
  ): Promise<YieldDataResponse> {
    const cacheKey = `yield:${facilityId}:${JSON.stringify(filters)}`
    
    // Check cache
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // Build query
    const where: any = { facility_id: facilityId }
    
    if (filters?.cultivar) {
      where.cannabis_strain = { name: filters.cultivar }
    }
    
    if (filters?.startDate || filters?.endDate) {
      where.harvest_date = {}
      if (filters?.startDate) where.harvest_date.gte = filters.startDate
      if (filters?.endDate) where.harvest_date.lte = filters.endDate
    }

    // Fetch data
    const [yields, total] = await Promise.all([
      prisma.harvest.findMany({
        where,
        include: {
          cannabis_strain: true,
          experiment: {
            include: {
              measurements: {
                where: { measurement_type: 'environmental' },
                orderBy: { timestamp: 'desc' },
                take: 100
              }
            }
          }
        },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        orderBy: { harvest_date: 'desc' }
      }),
      prisma.harvest.count({ where })
    ])

    // Transform data
    const data = yields.map(harvest => ({
      facilityId,
      cultivar: harvest.cannabis_strain.name,
      cycleId: harvest.experiment_id,
      harvestDate: harvest.harvest_date,
      totalYield: harvest.total_yield_g,
      yieldPerSqFt: harvest.yield_per_sqft,
      qualityMetrics: {
        thcContent: harvest.thc_percentage,
        cbdContent: harvest.cbd_percentage,
        terpeneProfile: harvest.terpene_profile as Record<string, number>,
        moistureContent: harvest.moisture_content,
        trimLoss: harvest.trim_loss_percentage
      },
      growthMetrics: {
        vegetativeDays: harvest.experiment.vegetative_days,
        floweringDays: harvest.experiment.flowering_days,
        totalCycleDays: harvest.experiment.total_days,
        finalPlantHeight: harvest.avg_plant_height_cm,
        plantsPerSqFt: harvest.plants_per_sqft
      }
    }))

    const response = {
      data,
      meta: {
        total,
        limit: filters?.limit || 50,
        offset: filters?.offset || 0,
        cached: false
      }
    }

    // Cache response
    await redis.setex(cacheKey, API_CONFIG.cacheTTL.medium, JSON.stringify(response))

    return response
  }

  /**
   * Get system performance metrics
   */
  async getSystemPerformance(
    facilityId: string,
    timeRange: {
      start: Date
      end: Date
      granularity?: 'hour' | 'day' | 'week' | 'month'
    }
  ): Promise<SystemPerformanceResponse> {
    const cacheKey = `performance:${facilityId}:${timeRange.start.toISOString()}:${timeRange.end.toISOString()}`
    
    // Check cache
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // Fetch performance data
    const [environmental, energy, alerts] = await Promise.all([
      // Environmental averages
      prisma.sensorReading.groupBy({
        by: ['facility_id'],
        where: {
          facility_id: facilityId,
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        _avg: {
          reading_value: true
        }
      }),
      
      // Energy consumption
      prisma.energyConsumption.aggregate({
        where: {
          facility_id: facilityId,
          reading_date: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        _sum: {
          total_kwh: true,
          lighting_kwh: true
        },
        _avg: {
          power_factor: true
        }
      }),
      
      // Recent alerts
      prisma.alert.findMany({
        where: {
          facility_id: facilityId,
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { created_at: 'desc' },
        take: 10
      })
    ])

    // Calculate efficiency scores
    const efficiency = await this.calculateEfficiencyScores(facilityId, timeRange)

    const response = {
      facilityId,
      timestamp: new Date(),
      performance: {
        overallEfficiency: efficiency.overall,
        energyEfficiency: efficiency.energy,
        waterEfficiency: efficiency.water,
        laborEfficiency: efficiency.labor,
        yieldEfficiency: efficiency.yield
      },
      environmental: {
        avgTemperature: 24.5, // Placeholder - integrate with actual sensor data
        avgHumidity: 60,
        avgCO2: 1000,
        avgVPD: 1.0,
        lightingDLI: 35
      },
      alerts: alerts.map(alert => ({
        type: alert.type,
        severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
        message: alert.message,
        timestamp: alert.created_at
      }))
    }

    // Cache response
    await redis.setex(cacheKey, API_CONFIG.cacheTTL.short, JSON.stringify(response))

    return response
  }

  /**
   * Get equipment runtime data
   */
  async getEquipmentRuntime(
    equipmentId: string,
    period: { start: Date; end: Date }
  ): Promise<EquipmentRuntimeResponse> {
    const cacheKey = `equipment:${equipmentId}:${period.start.toISOString()}:${period.end.toISOString()}`
    
    // Check cache
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // Fetch equipment data
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        runtime_logs: {
          where: {
            timestamp: {
              gte: period.start,
              lte: period.end
            }
          }
        },
        maintenance_logs: {
          orderBy: { service_date: 'desc' },
          take: 1
        }
      }
    })

    if (!equipment) {
      throw new Error('Equipment not found')
    }

    // Calculate runtime metrics
    const runtimeMetrics = this.calculateRuntimeMetrics(equipment.runtime_logs)
    const energyMetrics = await this.calculateEnergyMetrics(equipmentId, period)

    const response = {
      equipmentId,
      equipmentType: equipment.type,
      facilityId: equipment.facility_id,
      period,
      runtime: {
        totalHours: runtimeMetrics.totalHours,
        onCycles: runtimeMetrics.cycles,
        avgCycleDuration: runtimeMetrics.avgDuration,
        efficiency: runtimeMetrics.efficiency
      },
      maintenance: {
        lastServiceDate: equipment.maintenance_logs[0]?.service_date,
        nextServiceDue: equipment.next_service_date,
        totalServiceHours: equipment.total_runtime_hours,
        healthScore: equipment.health_score || 95
      },
      energy: {
        totalKwh: energyMetrics.totalKwh,
        avgPowerDraw: energyMetrics.avgPower,
        peakPowerDraw: energyMetrics.peakPower,
        powerFactor: energyMetrics.powerFactor
      }
    }

    // Cache response
    await redis.setex(cacheKey, API_CONFIG.cacheTTL.medium, JSON.stringify(response))

    return response
  }

  /**
   * Search and filter API endpoints
   */
  async searchEndpoints(
    query: string,
    filters?: {
      category?: string
      version?: string
      method?: string
    }
  ): Promise<EndpointSearchResponse> {
    const endpoints = await this.getAvailableEndpoints(filters?.version || 'v1')
    
    // Filter by search query
    const filtered = endpoints.filter(endpoint => {
      const matchesQuery = !query || 
        endpoint.path.includes(query) || 
        endpoint.description.toLowerCase().includes(query.toLowerCase())
      
      const matchesCategory = !filters?.category || 
        endpoint.category === filters.category
      
      const matchesMethod = !filters?.method || 
        endpoint.methods.includes(filters.method.toUpperCase())
      
      return matchesQuery && matchesCategory && matchesMethod
    })

    return {
      endpoints: filtered,
      total: filtered.length
    }
  }

  /**
   * Generate API key
   */
  async generateAPIKey(
    userId: string,
    name: string,
    tier: APITier = APITier.FREE
  ): Promise<APIKeyGenerationResult> {
    const key = `vblx_${tier}_${crypto.randomBytes(32).toString('hex')}`
    const webhookSecret = crypto.randomBytes(32).toString('hex')

    // Store in database
    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name,
        user_id: userId,
        tier,
        permissions: this.getDefaultPermissions(tier),
        webhookSecret,
        active: true
      }
    })

    // Add to cache
    this.apiKeys.set(key, {
      id: apiKey.id,
      tier,
      name,
      permissions: apiKey.permissions as string[],
      webhookSecret
    })

    return {
      key,
      webhookSecret,
      tier,
      permissions: apiKey.permissions as string[],
      createdAt: apiKey.created_at
    }
  }

  // Helper methods
  private async calculateEfficiencyScores(
    facilityId: string,
    timeRange: { start: Date; end: Date }
  ) {
    // Placeholder - implement actual efficiency calculations
    return {
      overall: 87.5,
      energy: 82.3,
      water: 91.2,
      labor: 88.7,
      yield: 89.4
    }
  }

  private calculateRuntimeMetrics(logs: any[]) {
    // Calculate runtime statistics from logs
    let totalMinutes = 0
    let cycles = 0
    
    logs.forEach((log, index) => {
      if (log.state === 'on' && index < logs.length - 1) {
        const nextLog = logs[index + 1]
        if (nextLog.state === 'off') {
          const duration = (nextLog.timestamp.getTime() - log.timestamp.getTime()) / 60000
          totalMinutes += duration
          cycles++
        }
      }
    })

    return {
      totalHours: totalMinutes / 60,
      cycles,
      avgDuration: cycles > 0 ? totalMinutes / cycles : 0,
      efficiency: 95 // Placeholder
    }
  }

  private async calculateEnergyMetrics(
    equipmentId: string,
    period: { start: Date; end: Date }
  ) {
    // Placeholder - integrate with actual energy monitoring
    return {
      totalKwh: 1250,
      avgPower: 520,
      peakPower: 650,
      powerFactor: 0.95
    }
  }

  private getDefaultPermissions(tier: APITier): string[] {
    const permissions = {
      [APITier.FREE]: ['read:yield', 'read:performance'],
      [APITier.BASIC]: ['read:yield', 'read:performance', 'read:equipment', 'webhook:subscribe'],
      [APITier.PRO]: ['read:all', 'write:limited', 'webhook:all', 'ml:predict'],
      [APITier.ENTERPRISE]: ['read:all', 'write:all', 'webhook:all', 'ml:all', 'admin:limited']
    }
    
    return permissions[tier]
  }

  private async getAvailableEndpoints(version: string) {
    // Return available API endpoints
    return [
      {
        path: `/api/${version}/yield`,
        methods: ['GET'],
        category: 'production',
        description: 'Get yield data for facilities and cultivars'
      },
      {
        path: `/api/${version}/performance`,
        methods: ['GET'],
        category: 'analytics',
        description: 'Get system performance metrics'
      },
      {
        path: `/api/${version}/equipment/{id}/runtime`,
        methods: ['GET'],
        category: 'equipment',
        description: 'Get equipment runtime statistics'
      },
      {
        path: `/api/${version}/webhooks/subscribe`,
        methods: ['POST'],
        category: 'webhooks',
        description: 'Subscribe to webhook events'
      },
      {
        path: `/api/${version}/ml/predict`,
        methods: ['POST'],
        category: 'ml',
        description: 'Make predictions using ML models'
      }
    ]
  }

  private async logAPIUsage(apiKeyId: string, endpoint: string) {
    // Log to database for analytics
    await prisma.apiUsageLog.create({
      data: {
        api_key_id: apiKeyId,
        endpoint,
        timestamp: new Date()
      }
    })
  }
}

// Type definitions
interface APIKeyData {
  id: string
  tier: APITier
  name: string
  permissions: string[]
  webhookSecret: string
}

interface APIValidationResult {
  valid: boolean
  error?: string
  keyData?: APIKeyData
  remaining?: number
  retryAfter?: number
}

interface YieldDataResponse {
  data: any[]
  meta: {
    total: number
    limit: number
    offset: number
    cached: boolean
  }
}

interface SystemPerformanceResponse {
  facilityId: string
  timestamp: Date
  performance: any
  environmental: any
  alerts: any[]
}

interface EquipmentRuntimeResponse {
  equipmentId: string
  equipmentType: string
  facilityId: string
  period: any
  runtime: any
  maintenance: any
  energy: any
}

interface EndpointSearchResponse {
  endpoints: any[]
  total: number
}

interface APIKeyGenerationResult {
  key: string
  webhookSecret: string
  tier: APITier
  permissions: string[]
  createdAt: Date
}

export default PublicAPIService