'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Building, 
  Ruler, 
  DollarSign, 
  TrendingUp,
  Info,
  Settings,
  ChevronUp,
  ChevronDown,
  Package,
  Zap,
  Droplets,
  Wind
} from 'lucide-react';
import { MultiLevelRackControl } from './MultiLevelRackControl';
import { RecipeControlSystem } from './RecipeControlSystem';

interface VerticalFarmConfig {
  totalHeight: number; // feet
  tiers: number;
  tierSpacing: number; // inches
  aisleWidth: number; // feet
  rackLength: number; // feet
  racksPerRow: number;
  rows: number;
  lightingType: 'LED' | 'Fluorescent';
  irrigationType: 'NFT' | 'Ebb-Flow' | 'Drip';
}

interface TierMetrics {
  tier: number;
  ppfd: number;
  dli: number;
  coverage: number; // percentage
  powerDensity: number; // W/sq ft
}

export function VerticalFarmingIntegration() {
  const [activeTab, setActiveTab] = useState<'design' | 'control' | 'recipes' | 'economics'>('design');
  const [config, setConfig] = useState<VerticalFarmConfig>({
    totalHeight: 10,
    tiers: 5,
    tierSpacing: 24,
    aisleWidth: 4,
    rackLength: 40,
    racksPerRow: 2,
    rows: 4,
    lightingType: 'LED',
    irrigationType: 'NFT'
  });

  const [expandedTier, setExpandedTier] = useState<number | null>(null);

  // Calculate key metrics
  const calculateMetrics = () => {
    const growingAreaPerTier = config.rackLength * config.racksPerRow * config.rows * 4; // 4 ft rack width
    const totalGrowingArea = growingAreaPerTier * config.tiers;
    const footprint = (config.rackLength * config.rows) + (config.aisleWidth * (config.rows - 1));
    const volumeUtilization = (totalGrowingArea / footprint) * 100;
    const maxPlantCapacity = Math.floor(totalGrowingArea / 1.5); // 1.5 sq ft per plant

    return {
      growingAreaPerTier,
      totalGrowingArea,
      footprint,
      volumeUtilization,
      maxPlantCapacity,
      spaceMultiplier: config.tiers
    };
  };

  const metrics = calculateMetrics();

  // Generate tier-specific light metrics
  const generateTierMetrics = (): TierMetrics[] => {
    return Array.from({ length: config.tiers }, (_, i) => ({
      tier: i + 1,
      ppfd: 250 - (i * 10), // Slight decrease in upper tiers due to heat
      dli: (250 - (i * 10)) * 0.0432 * 16, // 16 hour photoperiod
      coverage: 95 - (i * 2),
      powerDensity: config.lightingType === 'LED' ? 30 : 45
    }));
  };

  const tierMetrics = generateTierMetrics();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building className="w-6 h-6 text-purple-600" />
              Vertical Farming System
            </h1>
            <p className="text-gray-600 mt-1">
              Integrated vertical growing system with multi-tier optimization
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Space Multiplier</p>
            <p className="text-2xl font-bold text-purple-600">{metrics.spaceMultiplier}x</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 -mx-6 px-6 mt-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'design', label: 'System Design', icon: Layers },
              { id: 'control', label: 'Rack Control', icon: Settings },
              { id: 'recipes', label: 'Growth Recipes', icon: Package },
              { id: 'economics', label: 'Economics', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Design Tab */}
      {activeTab === 'design' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">System Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Height (ft)</label>
                  <input
                    type="number"
                    value={config.totalHeight}
                    onChange={(e) => setConfig({...config, totalHeight: Number(e.target.value)})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Number of Tiers</label>
                  <input
                    type="number"
                    value={config.tiers}
                    onChange={(e) => setConfig({...config, tiers: Number(e.target.value)})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Tier Spacing (inches)</label>
                  <input
                    type="number"
                    value={config.tierSpacing}
                    onChange={(e) => setConfig({...config, tierSpacing: Number(e.target.value)})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Rack Length (ft)</label>
                  <input
                    type="number"
                    value={config.rackLength}
                    onChange={(e) => setConfig({...config, rackLength: Number(e.target.value)})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Lighting Type</label>
                  <select
                    value={config.lightingType}
                    onChange={(e) => setConfig({...config, lightingType: e.target.value as any})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="LED">LED</option>
                    <option value="Fluorescent">Fluorescent</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Irrigation Type</label>
                  <select
                    value={config.irrigationType}
                    onChange={(e) => setConfig({...config, irrigationType: e.target.value as any})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="NFT">NFT</option>
                    <option value="Ebb-Flow">Ebb & Flow</option>
                    <option value="Drip">Drip</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics and Visualization */}
          <div className="lg:col-span-2 space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <Ruler className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-gray-500">Total Area</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.totalGrowingArea.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">sq ft growing</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <Package className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-gray-500">Capacity</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.maxPlantCapacity.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">plants max</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-gray-500">Efficiency</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.volumeUtilization.toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600">space utilized</p>
              </div>
            </div>

            {/* Tier-by-Tier Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tier Configuration</h3>
              
              <div className="space-y-2">
                {tierMetrics.map((tier) => (
                  <div
                    key={tier.tier}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedTier(expandedTier === tier.tier ? null : tier.tier)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">Tier {tier.tier}</span>
                        <span className="text-sm text-gray-600">
                          {tier.ppfd} PPFD • {tier.dli.toFixed(1)} DLI
                        </span>
                      </div>
                      {expandedTier === tier.tier ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {expandedTier === tier.tier && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Light Intensity</p>
                            <p className="font-medium text-gray-900">{tier.ppfd} μmol/m²/s</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Daily Light Integral</p>
                            <p className="font-medium text-gray-900">{tier.dli.toFixed(1)} mol/m²/day</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Coverage</p>
                            <p className="font-medium text-gray-900">{tier.coverage}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Power Density</p>
                            <p className="font-medium text-gray-900">{tier.powerDensity} W/sq ft</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3D Visualization Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">System Visualization</h3>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Layers className="w-12 h-12 mx-auto mb-2" />
                  <p>3D Rack Visualization</p>
                  <p className="text-sm mt-1">{config.tiers} tiers × {config.rows} rows</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rack Control Tab */}
      {activeTab === 'control' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Multi-Level Rack Control</h3>
          <MultiLevelRackControl />
        </div>
      )}

      {/* Recipes Tab */}
      {activeTab === 'recipes' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Vertical Farm Growth Recipes</h3>
          <RecipeControlSystem />
        </div>
      )}

      {/* Economics Tab */}
      {activeTab === 'economics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Cost Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Initial Investment</span>
                <span className="font-semibold text-gray-900">
                  ${(metrics.totalGrowingArea * 150).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Annual Operating</span>
                <span className="font-semibold text-gray-900">
                  ${(metrics.totalGrowingArea * 25).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Cost per sq ft</span>
                <span className="font-semibold text-gray-900">$150</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payback Period</span>
                <span className="font-semibold text-purple-600">2.5 years</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Production Value</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Annual Yield</span>
                <span className="font-semibold text-gray-900">
                  {(metrics.maxPlantCapacity * 12).toLocaleString()} plants
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Revenue per sq ft</span>
                <span className="font-semibold text-gray-900">$125/year</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Total Annual Revenue</span>
                <span className="font-semibold text-gray-900">
                  ${(metrics.totalGrowingArea * 125).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ROI</span>
                <span className="font-semibold text-green-600">40%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900">Vertical Farming Integration</h4>
            <p className="text-sm text-gray-600 mt-1">
              This integrated vertical farming system combines multi-tier rack control, environmental monitoring, 
              and growth recipes optimized for vertical production. All features are now accessible from the 
              main cultivation module for a unified growing experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}