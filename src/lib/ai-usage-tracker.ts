// AI Usage Tracking and Limits by Subscription Tier

export interface AIUsageLimit {
  tier: 'free' | 'starter' | 'professional' | 'enterprise'
  monthlyTokens: number
  dailyRequests: number
  features: {
    basicChat: boolean
    gapAnalysis: boolean
    recommendations: boolean
    predictions: boolean
    customReports: boolean
    apiAccess: boolean
  }
}

export const AI_USAGE_LIMITS: Record<string, AIUsageLimit> = {
  free: {
    tier: 'free',
    monthlyTokens: 10000, // ~10-15 queries
    dailyRequests: 5,
    features: {
      basicChat: true,
      gapAnalysis: false,
      recommendations: false,
      predictions: false,
      customReports: false,
      apiAccess: false
    }
  },
  starter: {
    tier: 'starter',
    monthlyTokens: 100000, // ~100-150 queries
    dailyRequests: 50,
    features: {
      basicChat: true,
      gapAnalysis: true,
      recommendations: true,
      predictions: false,
      customReports: false,
      apiAccess: false
    }
  },
  professional: {
    tier: 'professional',
    monthlyTokens: 500000, // ~500-750 queries
    dailyRequests: 200,
    features: {
      basicChat: true,
      gapAnalysis: true,
      recommendations: true,
      predictions: true,
      customReports: true,
      apiAccess: false
    }
  },
  enterprise: {
    tier: 'enterprise',
    monthlyTokens: 2000000, // ~2000-3000 queries
    dailyRequests: 1000,
    features: {
      basicChat: true,
      gapAnalysis: true,
      recommendations: true,
      predictions: true,
      customReports: true,
      apiAccess: true
    }
  }
}

export interface AIUsageRecord {
  userId: string
  timestamp: Date
  endpoint: string
  tokensUsed: number
  feature: keyof AIUsageLimit['features']
  success: boolean
  error?: string
}

export class AIUsageTracker {
  // In production, this would use a database
  private static usage: Map<string, AIUsageRecord[]> = new Map()

  static async trackUsage(
    userId: string,
    feature: keyof AIUsageLimit['features'],
    tokensUsed: number,
    endpoint: string
  ): Promise<void> {
    const record: AIUsageRecord = {
      userId,
      timestamp: new Date(),
      endpoint,
      tokensUsed,
      feature,
      success: true
    }

    const userUsage = this.usage.get(userId) || []
    userUsage.push(record)
    this.usage.set(userId, userUsage)
  }

  static async canMakeRequest(
    userId: string,
    userTier: string,
    feature: keyof AIUsageLimit['features']
  ): Promise<{ allowed: boolean; reason?: string; remainingTokens?: number }> {
    const limits = AI_USAGE_LIMITS[userTier] || AI_USAGE_LIMITS.free

    // Check if feature is available for tier
    if (!limits.features[feature]) {
      return {
        allowed: false,
        reason: `${feature} is not available in your ${userTier} plan. Please upgrade to access this feature.`
      }
    }

    // Get user's usage for current month
    const userUsage = this.usage.get(userId) || []
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Calculate monthly token usage
    const monthlyUsage = userUsage
      .filter(record => record.timestamp >= monthStart)
      .reduce((sum, record) => sum + record.tokensUsed, 0)

    if (monthlyUsage >= limits.monthlyTokens) {
      return {
        allowed: false,
        reason: 'Monthly AI token limit reached. Resets on the 1st of next month.',
        remainingTokens: 0
      }
    }

    // Calculate daily request count
    const dailyRequests = userUsage
      .filter(record => record.timestamp >= todayStart)
      .length

    if (dailyRequests >= limits.dailyRequests) {
      return {
        allowed: false,
        reason: 'Daily request limit reached. Try again tomorrow.',
        remainingTokens: limits.monthlyTokens - monthlyUsage
      }
    }

    return {
      allowed: true,
      remainingTokens: limits.monthlyTokens - monthlyUsage
    }
  }

  static async getUsageStats(userId: string): Promise<{
    monthlyTokensUsed: number
    dailyRequestsCount: number
    remainingTokens: number
    tokensByFeature: Record<string, number>
    recentQueries: AIUsageRecord[]
  }> {
    const userUsage = this.usage.get(userId) || []
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const monthlyUsage = userUsage.filter(record => record.timestamp >= monthStart)
    const dailyUsage = userUsage.filter(record => record.timestamp >= todayStart)

    const tokensByFeature = monthlyUsage.reduce((acc, record) => {
      acc[record.feature] = (acc[record.feature] || 0) + record.tokensUsed
      return acc
    }, {} as Record<string, number>)

    const monthlyTokensUsed = monthlyUsage.reduce((sum, record) => sum + record.tokensUsed, 0)

    // Assume user tier for limit calculation (in production, fetch from database)
    const userTier = 'professional' // This would come from user profile
    const limits = AI_USAGE_LIMITS[userTier]

    return {
      monthlyTokensUsed,
      dailyRequestsCount: dailyUsage.length,
      remainingTokens: limits.monthlyTokens - monthlyTokensUsed,
      tokensByFeature,
      recentQueries: userUsage.slice(-10).reverse() // Last 10 queries
    }
  }

  // Estimate tokens before making request
  static estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4)
  }

  // Calculate cost for billing
  static calculateCost(tokensUsed: number): number {
    // Claude 3.5 Sonnet pricing: $3 per 1M input tokens + $15 per 1M output tokens
    // Average to $9 per 1M tokens = $0.009 per 1K tokens
    return (tokensUsed / 1000) * 0.009
  }
}

// Export convenience functions
export async function checkAIUsageLimit(
  userId: string,
  userTier: string,
  feature: keyof AIUsageLimit['features']
): Promise<{ allowed: boolean; reason?: string; remainingTokens?: number }> {
  return AIUsageTracker.canMakeRequest(userId, userTier, feature);
}

export async function trackAIUsage(
  userId: string,
  feature: keyof AIUsageLimit['features'],
  tokensUsed: number,
  endpoint: string
): Promise<void> {
  return AIUsageTracker.trackUsage(userId, feature, tokensUsed, endpoint);
}