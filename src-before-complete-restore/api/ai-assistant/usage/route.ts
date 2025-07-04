import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { AIUsageTracker, AI_USAGE_LIMITS } from '@/lib/ai-usage-tracker'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's subscription tier (in production, fetch from database)
    const userTier: string = 'professional' // This would come from user profile/subscription data

    // Get usage statistics
    const stats = await AIUsageTracker.getUsageStats(userId)
    const limits = AI_USAGE_LIMITS[userTier]

    return NextResponse.json({
      usage: {
        monthlyTokensUsed: stats.monthlyTokensUsed,
        monthlyTokensLimit: limits.monthlyTokens,
        remainingTokens: stats.remainingTokens,
        dailyRequestsCount: stats.dailyRequestsCount,
        dailyRequestsLimit: limits.dailyRequests,
        tokensByFeature: stats.tokensByFeature,
        recentQueries: stats.recentQueries.map(q => ({
          timestamp: q.timestamp,
          feature: q.feature,
          tokensUsed: q.tokensUsed,
          success: q.success
        }))
      },
      subscription: {
        tier: userTier,
        features: limits.features,
        monthlyTokens: limits.monthlyTokens,
        dailyRequests: limits.dailyRequests
      },
      recommendations: generateUsageRecommendations(stats, limits)
    })
  } catch (error) {
    console.error('Usage stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    )
  }
}

function generateUsageRecommendations(
  stats: any,
  limits: any
): string[] {
  const recommendations: string[] = []
  const usagePercentage = (stats.monthlyTokensUsed / limits.monthlyTokens) * 100

  if (usagePercentage > 80) {
    recommendations.push('Consider upgrading your plan - you\'re using over 80% of your monthly tokens')
  }

  if (stats.tokensByFeature.basicChat > stats.monthlyTokensUsed * 0.5) {
    recommendations.push('Try using Gap Analysis or Recommendations features for more comprehensive insights')
  }

  if (stats.dailyRequestsCount > limits.dailyRequests * 0.8) {
    recommendations.push('You\'re approaching your daily request limit. Space out queries for optimal usage')
  }

  if (Object.keys(stats.tokensByFeature).length === 1) {
    recommendations.push('Explore other AI features to get the most value from your subscription')
  }

  return recommendations
}