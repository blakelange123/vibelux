'use client';

import React, { useEffect, useState } from 'react';
import { Brain, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface TokenUsage {
  used: number;
  limit: number;
  percentage: number;
  resetDate: Date;
}

export function TokenUsageTracker() {
  const { plan, usage, limits, checkUsageLimit } = useSubscription();
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [aiStatus, setAiStatus] = useState<'ready' | 'limited' | 'error'>('ready');

  useEffect(() => {
    checkAIStatus();
    const interval = setInterval(checkAIStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/ai-design-chat/status');
      const data = await response.json();
      
      if (data.status === 'operational') {
        setAiStatus('ready');
        
        // Calculate token usage for the month
        const aiQueries = usage.aiQueries || 0;
        const aiLimit = limits.aiQueries || 5;
        const percentage = aiLimit > 0 ? (aiQueries / aiLimit) * 100 : 0;
        
        setTokenUsage({
          used: aiQueries,
          limit: aiLimit,
          percentage: Math.min(100, percentage),
          resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
        
        // Set status based on usage
        if (percentage >= 90) {
          setAiStatus('limited');
        }
      } else {
        setAiStatus('error');
      }
    } catch (error) {
      console.error('Failed to check AI status:', error);
      setAiStatus('error');
    }
  };

  if (!tokenUsage) return null;

  const getStatusColor = () => {
    if (aiStatus === 'error') return 'text-red-400';
    if (tokenUsage.percentage >= 90) return 'text-yellow-400';
    if (tokenUsage.percentage >= 70) return 'text-orange-400';
    return 'text-green-400';
  };

  const getProgressColor = () => {
    if (tokenUsage.percentage >= 90) return 'bg-red-500';
    if (tokenUsage.percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="relative group">
      {/* Compact Display */}
      <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm">
        <Brain className={`w-4 h-4 ${getStatusColor()}`} />
        <span className="text-gray-300">
          AI: {tokenUsage.used}/{tokenUsage.limit === -1 ? '∞' : tokenUsage.limit}
        </span>
        {tokenUsage.percentage >= 70 && (
          <AlertCircle className="w-3 h-3 text-yellow-400" />
        )}
      </button>

      {/* Detailed Tooltip */}
      <div className="absolute top-full right-0 mt-2 w-72 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              AI Usage Tracker
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              aiStatus === 'ready' ? 'bg-green-900/50 text-green-400' :
              aiStatus === 'limited' ? 'bg-yellow-900/50 text-yellow-400' :
              'bg-red-900/50 text-red-400'
            }`}>
              {aiStatus === 'ready' ? 'Ready' : aiStatus === 'limited' ? 'Limited' : 'Error'}
            </span>
          </div>

          {/* Usage Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>AI Queries Used</span>
              <span>{tokenUsage.used} / {tokenUsage.limit === -1 ? 'Unlimited' : tokenUsage.limit}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full ${getProgressColor()} transition-all duration-300`}
                style={{ width: `${tokenUsage.percentage}%` }}
              />
            </div>
          </div>

          {/* Plan Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Current Plan</span>
              <span className="text-white capitalize">{plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Resets</span>
              <span className="text-white">{tokenUsage.resetDate.toLocaleDateString()}</span>
            </div>
          </div>

          {/* Warnings */}
          {tokenUsage.percentage >= 90 && (
            <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-600/50 rounded text-xs">
              <p className="text-yellow-300">
                {tokenUsage.percentage >= 100 
                  ? 'AI query limit reached. Upgrade for more.'
                  : `Only ${tokenUsage.limit - tokenUsage.used} queries remaining.`}
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              💡 Pro tip: Break large designs into zones to optimize token usage
            </p>
          </div>

          {/* Upgrade CTA */}
          {plan !== 'enterprise' && tokenUsage.percentage >= 70 && (
            <a
              href="/pricing"
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
            >
              <Zap className="w-4 h-4" />
              Upgrade for More AI Queries
            </a>
          )}
        </div>
      </div>
    </div>
  );
}