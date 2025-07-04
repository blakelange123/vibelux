'use client';

import React from 'react';
import { FeatureGate, UsageLimitGate } from '@/components/FeatureGate';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  Zap, 
  Brain, 
  Download, 
  Users, 
  Building2, 
  BarChart3,
  Sparkles
} from 'lucide-react';

export function SubscriptionGatedFeatures() {
  const { plan, usage, limits } = useSubscription();

  return (
    <div className="space-y-6">
      {/* Display current plan */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Current Plan</h3>
            <p className="text-gray-400 capitalize">{plan}</p>
          </div>
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
      </div>

      {/* Example: AI Assistant Feature */}
      <FeatureGate feature="aiAssistant" soft>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">AI Design Assistant</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Get intelligent lighting recommendations powered by AI
          </p>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            Start AI Consultation
          </button>
        </div>
      </FeatureGate>

      {/* Example: Export with usage limits */}
      <UsageLimitGate 
        feature="exports" 
      >
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-8 h-8 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Export Reports</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Export detailed reports in PDF, Excel, or CSV format
          </p>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Export PDF
            </button>
            <span className="text-sm text-gray-400">
              {usage.exports || 0} / {limits.exports || '∞'} exports used
            </span>
          </div>
        </div>
      </UsageLimitGate>

      {/* Example: Multi-site feature (hard gate) */}
      <FeatureGate feature="multiSite">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-8 h-8 text-green-400" />
            <h3 className="text-xl font-semibold text-white">Multi-Site Management</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Manage multiple facilities from a single dashboard
          </p>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            Add New Site
          </button>
        </div>
      </FeatureGate>

      {/* Example: Advanced Analytics (soft gate with custom message) */}
      <FeatureGate 
        feature="advancedAnalytics" 
        soft
        fallback={
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Basic Analytics
            </h3>
            <p className="text-gray-400 mb-4">
              Upgrade to Professional for advanced analytics and insights
            </p>
          </div>
        }
      >
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-orange-400" />
            <h3 className="text-xl font-semibold text-white">Advanced Analytics</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Deep insights with predictive analytics and ML-powered recommendations
          </p>
          <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
            View Analytics Dashboard
          </button>
        </div>
      </FeatureGate>

      {/* Usage Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Usage</h3>
        <div className="space-y-3">
          {Object.entries(usage).map(([key, value]) => {
            const limit = limits[key];
            const percentage = limit && limit !== -1 ? (value / limit) * 100 : 0;
            
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-white">
                    {value} / {limit === -1 ? '∞' : limit || '∞'}
                  </span>
                </div>
                {limit && limit !== -1 && (
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        percentage > 90 ? 'bg-red-500' : 
                        percentage > 75 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}