'use client';

import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Calendar, CreditCard, AlertTriangle } from 'lucide-react';

interface UsageStats {
  monthlyUsed: number;
  monthlyLimit: number;
  dailyUsed: number;
  dailyLimit: number;
  tier: string;
  costEstimate: number;
  resetDate: string;
  features: {
    ai_designer: number;
    ai_assistant: number;
    gap_analysis: number;
    recommendations: number;
  };
}

export function AIUsageDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/ai-assistant/usage');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-700 h-12 w-12"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <p className="text-gray-400">Unable to load usage statistics</p>
      </div>
    );
  }

  const monthlyPercentage = (stats.monthlyUsed / stats.monthlyLimit) * 100;
  const dailyPercentage = (stats.dailyUsed / stats.dailyLimit) * 100;

  return (
    <div className="bg-gray-900 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">AI Usage</h3>
            <p className="text-sm text-gray-400 capitalize">{stats.tier} Plan</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">${stats.costEstimate.toFixed(2)}</p>
          <p className="text-xs text-gray-400">Est. monthly cost</p>
        </div>
      </div>

      {/* Usage Meters */}
      <div className="space-y-4">
        {/* Monthly Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">Monthly Usage</span>
            <span className="text-sm text-gray-400">
              {stats.monthlyUsed.toLocaleString()} / {stats.monthlyLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                monthlyPercentage > 90 ? 'bg-red-500' : 
                monthlyPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Resets {new Date(stats.resetDate).toLocaleDateString()}
          </p>
        </div>

        {/* Daily Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">Daily Usage</span>
            <span className="text-sm text-gray-400">
              {stats.dailyUsed} / {stats.dailyLimit}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                dailyPercentage > 90 ? 'bg-red-500' : 
                dailyPercentage > 75 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Feature Breakdown */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Feature Usage
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(stats.features).map(([feature, usage]) => (
            <div key={feature} className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400 capitalize">
                {feature.replace('_', ' ')}
              </p>
              <p className="text-lg font-semibold text-white">{usage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {monthlyPercentage > 80 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-300">
                Approaching Usage Limit
              </p>
              <p className="text-xs text-yellow-400">
                You've used {monthlyPercentage.toFixed(0)}% of your monthly allocation.
                {monthlyPercentage > 95 && " Consider upgrading to avoid interruption."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      {stats.tier === 'free' && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-300">
                Unlock More AI Power
              </p>
              <p className="text-xs text-purple-400">
                Upgrade to Professional for 50x more tokens and advanced features
              </p>
            </div>
            <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}