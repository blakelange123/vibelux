'use client'

import { useState, useEffect } from 'react'
import { 
  Zap, 
  TrendingUp, 
  Clock,
  AlertCircle,
  ChevronRight,
  Sparkles,
  CreditCard
} from 'lucide-react'
import { AI_USAGE_LIMITS } from '@/lib/ai-usage-tracker'

interface UsageStats {
  monthlyTokensUsed: number
  dailyRequestsCount: number
  remainingTokens: number
  tokensByFeature: Record<string, number>
  userTier: string
}

export function AIUsageDisplay({ 
  compact = false,
  onUpgrade 
}: { 
  compact?: boolean
  onUpgrade?: () => void 
}) {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsageStats()
  }, [])

  const fetchUsageStats = async () => {
    try {
      // In production, this would fetch from an API endpoint
      // For now, using mock data
      setStats({
        monthlyTokensUsed: 245000,
        dailyRequestsCount: 45,
        remainingTokens: 255000,
        tokensByFeature: {
          basicChat: 120000,
          gapAnalysis: 85000,
          recommendations: 40000
        },
        userTier: 'professional'
      })
    } catch (error) {
      console.error('Failed to fetch usage stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) return null

  const limits = AI_USAGE_LIMITS[stats.userTier] || AI_USAGE_LIMITS.free
  const usagePercentage = (stats.monthlyTokensUsed / limits.monthlyTokens) * 100
  const dailyPercentage = (stats.dailyRequestsCount / limits.dailyRequests) * 100

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${usagePercentage > 80 ? 'text-yellow-400' : 'text-green-400'}`} />
          <span className="text-gray-400">
            {Math.round(usagePercentage)}% used
          </span>
        </div>
        <div className="text-gray-600">•</div>
        <span className="text-gray-400">
          {(stats.remainingTokens / 1000).toFixed(0)}k tokens left
        </span>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Usage</h3>
            <p className="text-sm text-gray-400 capitalize">{stats.userTier} Plan</p>
          </div>
        </div>
        {usagePercentage > 80 && (
          <button
            onClick={onUpgrade}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Upgrade Plan
          </button>
        )}
      </div>

      {/* Monthly Token Usage */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Monthly Tokens</span>
            <span className="text-sm text-white">
              {(stats.monthlyTokensUsed / 1000).toFixed(0)}k / {(limits.monthlyTokens / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                usagePercentage > 90 ? 'bg-red-500' :
                usagePercentage > 70 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Daily Requests</span>
            <span className="text-sm text-white">
              {stats.dailyRequestsCount} / {limits.dailyRequests}
            </span>
          </div>
          <div className="bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                dailyPercentage > 90 ? 'bg-red-500' :
                dailyPercentage > 70 ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Usage by Feature */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-300">Usage by Feature</h4>
        {Object.entries(stats.tokensByFeature).map(([feature, tokens]) => {
          const percentage = (tokens / stats.monthlyTokensUsed) * 100
          return (
            <div key={feature} className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {feature.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-gray-800 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-purple-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {(tokens / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Estimated Cost */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Estimated Value Used</span>
          </div>
          <span className="text-lg font-semibold text-white">
            ${((stats.monthlyTokensUsed / 1000) * 0.045).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Warning Messages */}
      {usagePercentage > 80 && (
        <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-300 font-medium">
                {usagePercentage > 90 ? 'Critical: ' : ''}
                {Math.round(100 - usagePercentage)}% of monthly tokens remaining
              </p>
              <p className="text-yellow-400 mt-1">
                Consider upgrading to avoid service interruption.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}