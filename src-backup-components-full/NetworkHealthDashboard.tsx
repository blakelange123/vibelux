'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle,
  Zap,
  Droplets,
  DollarSign,
  MapPin,
  BarChart3
} from 'lucide-react';
import { siteAnalytics } from '@/lib/multi-site/site-analytics';

interface NetworkHealthDashboardProps {
  sites: any[];
  className?: string;
}

export function NetworkHealthDashboard({ sites, className = '' }: NetworkHealthDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState<'yield' | 'energy' | 'water'>('yield');
  
  useEffect(() => {
    const data = siteAnalytics.calculateNetworkAnalytics(sites);
    setAnalytics(data);
  }, [sites]);

  if (!analytics) return null;

  const healthScore = Math.round(
    (analytics.activeSites / analytics.totalSites) * 100 * 0.4 +
    (1 - analytics.alertCount / (analytics.totalSites * 5)) * 100 * 0.3 +
    (analytics.avgEfficiency < 5 ? 100 : 50) * 0.3
  );

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Network Health</h3>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>

      {/* Health Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Overall Health</span>
          <span className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
            {healthScore}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all ${
              healthScore >= 80 ? 'bg-green-500' :
              healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${healthScore}%` }}
          />
        </div>
        <p className={`text-sm mt-1 ${getHealthColor(healthScore)}`}>
          {getHealthLabel(healthScore)}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Sites</span>
          </div>
          <p className="text-xl font-bold text-white">
            {analytics.activeSites}/{analytics.totalSites}
          </p>
          <p className="text-xs text-green-400">Active</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Alerts</span>
          </div>
          <p className="text-xl font-bold text-white">{analytics.alertCount}</p>
          <p className="text-xs text-yellow-400">Pending</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-3">
        <div 
          className={`p-3 rounded-lg cursor-pointer transition-all ${
            selectedMetric === 'yield' ? 'bg-green-900/30 border border-green-700' : 'bg-gray-700'
          }`}
          onClick={() => setSelectedMetric('yield')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Monthly Yield</span>
            </div>
            <span className="text-sm font-medium text-white">
              {analytics.totalProduction.toLocaleString()} lbs
            </span>
          </div>
          {selectedMetric === 'yield' && (
            <div className="mt-2 text-xs text-gray-400">
              {(analytics.totalProduction / analytics.totalArea).toFixed(2)} lbs/sq ft average
            </div>
          )}
        </div>

        <div 
          className={`p-3 rounded-lg cursor-pointer transition-all ${
            selectedMetric === 'energy' ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-gray-700'
          }`}
          onClick={() => setSelectedMetric('energy')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Energy Usage</span>
            </div>
            <span className="text-sm font-medium text-white">
              {analytics.totalEnergy.toLocaleString()} kWh
            </span>
          </div>
          {selectedMetric === 'energy' && (
            <div className="mt-2 text-xs text-gray-400">
              {analytics.avgEfficiency.toFixed(1)} kWh/lb efficiency
            </div>
          )}
        </div>

        <div 
          className={`p-3 rounded-lg cursor-pointer transition-all ${
            selectedMetric === 'water' ? 'bg-blue-900/30 border border-blue-700' : 'bg-gray-700'
          }`}
          onClick={() => setSelectedMetric('water')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Water Usage</span>
            </div>
            <span className="text-sm font-medium text-white">
              {analytics.totalWater.toLocaleString()} gal
            </span>
          </div>
          {selectedMetric === 'water' && (
            <div className="mt-2 text-xs text-gray-400">
              {(analytics.totalWater / analytics.totalProduction).toFixed(1)} gal/lb efficiency
            </div>
          )}
        </div>
      </div>

      {/* Top Performers */}
      {analytics.topPerformers.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Top Performers</h4>
          <div className="space-y-2">
            {analytics.topPerformers.map((siteId: string, index: number) => {
              const site = sites.find(s => s.id === siteId);
              if (!site) return null;
              
              return (
                <div key={siteId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <span className="text-gray-300">{site.name}</span>
                  </div>
                  <span className="text-green-400">
                    {(site.metrics.yield / site.size).toFixed(2)} lbs/ft²
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}