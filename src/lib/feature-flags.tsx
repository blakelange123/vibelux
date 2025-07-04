import React, { useState, useEffect } from 'react';
import { prisma } from './prisma'
import { Redis } from 'ioredis'

// Initialize Redis for caching
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
})

// Feature flag types
export interface FeatureFlag {
  id: string
  name: string
  description: string
  enabled: boolean
  rolloutPercentage: number
  targetUsers: string[]
  targetTiers: string[]
  targetSegments: string[]
  variations?: {
    control: any
    treatment: any
  }
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface FeatureFlagContext {
  userId?: string
  userTier?: string
  userSegments?: string[]
  userAttributes?: Record<string, any>
}

// Main feature flag service
export class FeatureFlagService {
  private cacheExpiry = 300 // 5 minutes

  // Check if a feature is enabled for a user
  async isEnabled(
    flagKey: string,
    context: FeatureFlagContext = {}
  ): Promise<boolean> {
    try {
      // Check cache first
      const cacheKey = `feature:${flagKey}:${context.userId || 'anonymous'}`
      const cached = await redis.get(cacheKey)
      if (cached !== null) {
        return cached === 'true'
      }

      // Get feature flag from database
      const flag = await this.getFlag(flagKey)
      if (!flag) {
        return false
      }

      // Check if globally disabled
      if (!flag.enabled) {
        await this.cacheResult(cacheKey, false)
        return false
      }

      // Check if user is in target users
      if (context.userId && flag.targetUsers.includes(context.userId)) {
        await this.cacheResult(cacheKey, true)
        return true
      }

      // Check if user tier matches
      if (context.userTier && flag.targetTiers.includes(context.userTier)) {
        await this.cacheResult(cacheKey, true)
        return true
      }

      // Check if user is in target segments
      if (context.userSegments) {
        const hasMatchingSegment = context.userSegments.some(segment =>
          flag.targetSegments.includes(segment)
        )
        if (hasMatchingSegment) {
          await this.cacheResult(cacheKey, true)
          return true
        }
      }

      // Check rollout percentage
      if (flag.rolloutPercentage > 0 && flag.rolloutPercentage < 100) {
        const enabled = this.isInRollout(context.userId || 'anonymous', flag.rolloutPercentage)
        await this.cacheResult(cacheKey, enabled)
        return enabled
      }

      // Default to flag's enabled state
      const result = flag.rolloutPercentage === 100
      await this.cacheResult(cacheKey, result)
      return result
    } catch (error) {
      console.error(`Error checking feature flag ${flagKey}:`, error)
      return false // Fail closed
    }
  }

  // Get variation for A/B testing
  async getVariation(
    flagKey: string,
    context: FeatureFlagContext = {}
  ): Promise<'control' | 'treatment'> {
    const enabled = await this.isEnabled(flagKey, context)
    return enabled ? 'treatment' : 'control'
  }

  // Get feature flag value (for non-boolean flags)
  async getValue<T = any>(
    flagKey: string,
    defaultValue: T,
    context: FeatureFlagContext = {}
  ): Promise<T> {
    try {
      const flag = await this.getFlag(flagKey)
      if (!flag || !await this.isEnabled(flagKey, context)) {
        return defaultValue
      }

      const variation = await this.getVariation(flagKey, context)
      return flag.variations?.[variation] || defaultValue
    } catch (error) {
      console.error(`Error getting feature flag value ${flagKey}:`, error)
      return defaultValue
    }
  }

  // Get all flags for a user
  async getAllFlags(context: FeatureFlagContext = {}): Promise<Record<string, boolean>> {
    try {
      const flags = await this.getAllFlagsFromDB()
      const result: Record<string, boolean> = {}

      for (const flag of flags) {
        result[flag.id] = await this.isEnabled(flag.id, context)
      }

      return result
    } catch (error) {
      console.error('Error getting all feature flags:', error)
      return {}
    }
  }

  // Private methods
  private async getFlag(flagKey: string): Promise<FeatureFlag | null> {
    // In production, this would query the database
    // For now, return mock data
    const mockFlags: Record<string, FeatureFlag> = {
      'new-3d-renderer': {
        id: 'new-3d-renderer',
        name: 'New 3D Renderer',
        description: 'GPU-accelerated 3D rendering engine',
        enabled: true,
        rolloutPercentage: 50,
        targetUsers: [],
        targetTiers: ['enterprise'],
        targetSegments: ['beta_testers'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      'ai-assistant-v2': {
        id: 'ai-assistant-v2',
        name: 'AI Assistant v2',
        description: 'Enhanced AI assistant with advanced capabilities',
        enabled: true,
        rolloutPercentage: 0,
        targetUsers: ['user123', 'user456'],
        targetTiers: [],
        targetSegments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      'revenue-sharing-v2': {
        id: 'revenue-sharing-v2',
        name: 'Revenue Sharing v2',
        description: 'New revenue sharing model with 15 tiers',
        enabled: true,
        rolloutPercentage: 100,
        targetUsers: [],
        targetTiers: [],
        targetSegments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      'mobile-app': {
        id: 'mobile-app',
        name: 'Mobile App Access',
        description: 'Enable mobile app features',
        enabled: true,
        rolloutPercentage: 0,
        targetUsers: [],
        targetTiers: ['professional', 'enterprise'],
        targetSegments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      'advanced-reporting': {
        id: 'advanced-reporting',
        name: 'Advanced Reporting',
        description: 'Enhanced reporting and analytics',
        enabled: true,
        rolloutPercentage: 75,
        targetUsers: [],
        targetTiers: [],
        targetSegments: ['power_users'],
        variations: {
          control: { charts: ['basic'] },
          treatment: { charts: ['basic', 'advanced', 'custom'] }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    return mockFlags[flagKey] || null
  }

  private async getAllFlagsFromDB(): Promise<FeatureFlag[]> {
    // In production, query from database
    return [
      await this.getFlag('new-3d-renderer'),
      await this.getFlag('ai-assistant-v2'),
      await this.getFlag('revenue-sharing-v2'),
      await this.getFlag('mobile-app'),
      await this.getFlag('advanced-reporting')
    ].filter(Boolean) as FeatureFlag[]
  }

  private isInRollout(identifier: string, percentage: number): boolean {
    // Simple hash-based rollout
    let hash = 0
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash) % 100 < percentage
  }

  private async cacheResult(key: string, value: boolean): Promise<void> {
    await redis.set(key, value.toString(), 'EX', this.cacheExpiry)
  }

  // Admin methods
  async createFlag(flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeatureFlag> {
    // TODO: Implement database creation
    throw new Error('Not implemented')
  }

  async updateFlag(flagKey: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag> {
    // TODO: Implement database update
    // Clear cache after update
    const keys = await redis.keys(`feature:${flagKey}:*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    throw new Error('Not implemented')
  }

  async deleteFlag(flagKey: string): Promise<void> {
    // TODO: Implement database deletion
    // Clear cache
    const keys = await redis.keys(`feature:${flagKey}:*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    throw new Error('Not implemented')
  }

  // Clear all cached flags
  async clearCache(): Promise<void> {
    const keys = await redis.keys('feature:*')
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagService()

// React hook for feature flags
export function useFeatureFlag(flagKey: string, context?: FeatureFlagContext): boolean {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    featureFlags.isEnabled(flagKey, context)
      .then(setEnabled)
      .finally(() => setLoading(false))
  }, [flagKey, context])

  return enabled
}

// HOC for feature-flagged components
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  flagKey: string,
  fallback?: React.ComponentType<P>
): React.ComponentType<P> {
  return (props: P) => {
    const enabled = useFeatureFlag(flagKey)
    
    if (enabled) {
      return <Component {...props} />
    }
    
    if (fallback) {
      const Fallback = fallback
      return <Fallback {...props} />
    }
    
    return null
  }
}

// Middleware for API routes
export function requireFeatureFlag(flagKey: string) {
  return async (req: Request, res: Response, next: Function) => {
    const userId = req.headers.get('x-user-id')
    const userTier = req.headers.get('x-user-tier')
    
    const enabled = await featureFlags.isEnabled(flagKey, {
      userId: userId || undefined,
      userTier: userTier || undefined
    })
    
    if (!enabled) {
      return Response.json(
        { error: 'Feature not available' },
        { status: 403 }
      )
    }
    
    next()
  }
}