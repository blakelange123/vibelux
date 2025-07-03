'use client';

import { ModuleFeatureGate, useModuleAccess } from '@/components/ModuleFeatureGate';
import { ModuleType } from '@/lib/subscription-modules';
import { LineChart, Brain, TrendingUp, Lock } from 'lucide-react';

export default function AnalyticsWithGatedFeatures() {
  // Check access programmatically
  const mlAccess = useModuleAccess(ModuleType.ADVANCED_ML);
  const analyticsAccess = useModuleAccess(ModuleType.ANALYTICS);
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      
      {/* Basic analytics - available to Business tier */}
      <ModuleFeatureGate module={ModuleType.ANALYTICS}>
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Performance Analytics
          </h2>
          <p>Your facility performance metrics...</p>
          {/* Full analytics content here */}
        </div>
      </ModuleFeatureGate>
      
      {/* Advanced ML predictions - requires add-on or Enterprise */}
      <ModuleFeatureGate 
        module={ModuleType.ADVANCED_ML}
        soft={true}
        customMessage="ML-powered predictions require the Advanced ML add-on or Enterprise tier"
      >
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Predictions
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-medium mb-2">Yield Forecast</h3>
              <p className="text-2xl font-bold">+15.3%</p>
              <p className="text-sm text-gray-400">Next 30 days</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-medium mb-2">Quality Score</h3>
              <p className="text-2xl font-bold">94/100</p>
              <p className="text-sm text-gray-400">Predicted</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-medium mb-2">Risk Alert</h3>
              <p className="text-2xl font-bold text-yellow-400">Medium</p>
              <p className="text-sm text-gray-400">Pest risk detected</p>
            </div>
          </div>
        </div>
      </ModuleFeatureGate>
      
      {/* Conditionally show different UI based on access */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Available Features</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <span>Basic Analytics</span>
            {analyticsAccess.hasAccess ? (
              <span className="text-green-400">✓ Active</span>
            ) : (
              <span className="text-gray-500">Upgrade to Business</span>
            )}
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <span>ML Predictions</span>
            {mlAccess.hasAccess ? (
              <span className="text-green-400">✓ Active</span>
            ) : (
              <button className="text-purple-400 hover:text-purple-300">
                Add for $300/mo →
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Feature that shows different content based on tier */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trend Analysis
        </h2>
        
        {/* Always show basic trends */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">7-Day Trends</h3>
          <p>Basic trend visualization...</p>
        </div>
        
        {/* Only show advanced trends with ML module */}
        <ModuleFeatureGate 
          module={ModuleType.ADVANCED_ML}
          fallback={
            <div className="p-4 bg-gray-700 rounded text-center">
              <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                30-day predictions and anomaly detection require Advanced ML
              </p>
            </div>
          }
        >
          <div>
            <h3 className="font-medium mb-2">30-Day Predictions</h3>
            <p>Advanced ML-powered forecasting...</p>
          </div>
        </ModuleFeatureGate>
      </div>
    </div>
  );
}