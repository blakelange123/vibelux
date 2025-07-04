'use client';

import React, { useState } from 'react';
import {
  Droplets,
  Leaf,
  Building,
  Truck,
  Sun,
  Shield,
  TrendingUp,
  Award,
  BarChart3,
  Layers,
  Scissors,
  Sprout,
  Factory,
  TreePine,
  Gauge
} from 'lucide-react';
import { ComprehensiveESGDashboard } from './ComprehensiveESGDashboard';

export function CEASpecificESGDashboard() {
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('year');
  const [showComprehensive, setShowComprehensive] = useState(false);
  
  // CEA-specific metrics based on actual indoor farming data
  const ceaMetrics = {
    waterEfficiency: {
      ceaUsage: 2.5, // gallons per kg lettuce
      fieldUsage: 50, // gallons per kg field lettuce
      recirculationRate: 95, // % water recirculated
      savings: 95 // % water saved vs field
    },
    landEfficiency: {
      ceaYield: 12, // kg per sq ft per year (vertical)
      fieldYield: 0.08, // kg per sq ft per year
      multiplier: 150, // times more productive
      landSaved: 99.3 // % land saved for same yield
    },
    pesticides: {
      ceaUse: 0, // kg pesticides
      fieldUse: 125, // kg pesticides per hectare equivalent
      reduction: 100 // % reduction
    },
    transportation: {
      ceaDistance: 15, // average miles to market
      fieldDistance: 1500, // average miles for field produce
      emissionsAvoided: 850 // kg CO2e saved
    },
    energy: {
      totalKWh: 180000, // annual
      ledEfficiency: 2.8, // μmol/J
      renewablePercent: 35,
      kWhPerKg: 45 // energy intensity
    },
    production: {
      yieldPerSqFt: 12, // kg/sq ft/year
      layers: 8, // vertical growing layers
      cropCycles: 18, // harvests per year
      consistency: 98 // % yield consistency
    }
  };

  // Calculate environmental impact comparison
  const environmentalComparison = [
    {
      metric: 'Water Usage',
      icon: Droplets,
      ceaValue: ceaMetrics.waterEfficiency.ceaUsage,
      fieldValue: ceaMetrics.waterEfficiency.fieldUsage,
      unit: 'gal/kg',
      improvement: ceaMetrics.waterEfficiency.savings,
      color: 'blue'
    },
    {
      metric: 'Land Requirement',
      icon: Building,
      ceaValue: 1 / ceaMetrics.landEfficiency.ceaYield,
      fieldValue: 1 / ceaMetrics.landEfficiency.fieldYield,
      unit: 'sq ft/kg',
      improvement: ceaMetrics.landEfficiency.landSaved,
      color: 'green'
    },
    {
      metric: 'Pesticide Use',
      icon: Shield,
      ceaValue: ceaMetrics.pesticides.ceaUse,
      fieldValue: ceaMetrics.pesticides.fieldUse,
      unit: 'kg/hectare',
      improvement: ceaMetrics.pesticides.reduction,
      color: 'purple'
    },
    {
      metric: 'Food Miles',
      icon: Truck,
      ceaValue: ceaMetrics.transportation.ceaDistance,
      fieldValue: ceaMetrics.transportation.fieldDistance,
      unit: 'miles',
      improvement: ((ceaMetrics.transportation.fieldDistance - ceaMetrics.transportation.ceaDistance) / ceaMetrics.transportation.fieldDistance) * 100,
      color: 'orange'
    }
  ];

  if (showComprehensive) {
    return <ComprehensiveESGDashboard />;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      {/* Comprehensive ESG Notice */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-400 mb-1">Complete ESG Tracking Available</h3>
            <p className="text-sm text-gray-300">
              This dashboard shows core CEA environmental advantages. For comprehensive ESG tracking including 
              packaging impact, employee commuting, supply chain emissions, governance metrics, and social impact, 
              view the full ESG dashboard.
            </p>
          </div>
          <button
            onClick={() => setShowComprehensive(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Comprehensive ESG
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Leaf className="w-8 h-8 text-green-400" />
          CEA Environmental Impact Dashboard
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
            <option value="year">Annual</option>
          </select>
        </div>
      </div>

      {/* CEA vs Traditional Farming Comparison */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          CEA Environmental Advantages vs Traditional Field Farming
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {environmentalComparison.map((item) => {
            const Icon = item.icon;
            const colorClasses = {
              blue: 'text-blue-400 bg-blue-900/20 border-blue-800',
              green: 'text-green-400 bg-green-900/20 border-green-800',
              purple: 'text-purple-400 bg-purple-900/20 border-purple-800',
              orange: 'text-orange-400 bg-orange-900/20 border-orange-800'
            };
            
            return (
              <div key={item.metric} className={`${colorClasses[item.color as keyof typeof colorClasses]} border rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-5 h-5 ${colorClasses[item.color as keyof typeof colorClasses].split(' ')[0]}`} />
                  <span className="text-sm font-medium text-gray-300">{item.metric}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">CEA:</span>
                    <span className="text-white font-medium">
                      {item.ceaValue.toFixed(1)} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Field:</span>
                    <span className="text-gray-500">
                      {item.fieldValue.toFixed(1)} {item.unit}
                    </span>
                  </div>
                  <div className={`text-center text-lg font-bold ${colorClasses[item.color as keyof typeof colorClasses].split(' ')[0]}`}>
                    {item.improvement.toFixed(0)}% better
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Vertical Efficiency
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Growing Layers</span>
                <span className="text-white font-medium">{ceaMetrics.production.layers}</span>
              </div>
              <div className="text-xs text-gray-500">
                {ceaMetrics.production.layers}x space utilization vs single-layer greenhouse
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Yield per Sq Ft</span>
                <span className="text-white font-medium">{ceaMetrics.production.yieldPerSqFt} kg/year</span>
              </div>
              <div className="text-xs text-purple-400">
                {ceaMetrics.landEfficiency.multiplier}x more than field farming
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Crop Cycles</span>
                <span className="text-white font-medium">{ceaMetrics.production.cropCycles}/year</span>
              </div>
              <div className="text-xs text-gray-500">
                vs 2-3 cycles for field farming
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            Water Systems
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Recirculation Rate</span>
                <span className="text-white font-medium">{ceaMetrics.waterEfficiency.recirculationRate}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full"
                  style={{ width: `${ceaMetrics.waterEfficiency.recirculationRate}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Water per Kg Yield</span>
                <span className="text-white font-medium">{ceaMetrics.waterEfficiency.ceaUsage} gal</span>
              </div>
              <div className="text-xs text-blue-400">
                {ceaMetrics.waterEfficiency.savings}% less than field farming
              </div>
            </div>
            
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <div className="text-sm font-medium text-blue-400">Water Saved Annually</div>
              <div className="text-lg font-bold text-white">
                {((ceaMetrics.waterEfficiency.fieldUsage - ceaMetrics.waterEfficiency.ceaUsage) * 
                  ceaMetrics.production.yieldPerSqFt * 1000 / 1000).toFixed(0)}k gallons
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            Chemical-Free Growing
          </h4>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">0</div>
              <div className="text-sm text-gray-400">Pesticides Used</div>
              <div className="text-xs text-green-400">100% pesticide-free</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">0</div>
              <div className="text-sm text-gray-400">Herbicides Used</div>
              <div className="text-xs text-green-400">No weeds in controlled environment</div>
            </div>
            
            <div className="p-3 bg-green-900/20 rounded-lg">
              <div className="text-sm font-medium text-green-400">Chemical Emissions Avoided</div>
              <div className="text-lg font-bold text-white">
                {(ceaMetrics.pesticides.fieldUse * 0.5).toFixed(0)} kg CO₂e
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy & Carbon Footprint */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">True Carbon Footprint Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-300 mb-3">Facility Emissions</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Direct Emissions (Scope 1)</span>
                <span className="text-white">2.1 tCO₂e</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Electricity (Scope 2)</span>
                <span className="text-white">58.4 tCO₂e</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Indirect (Scope 3)</span>
                <span className="text-white">8.7 tCO₂e</span>
              </div>
              <div className="border-t border-gray-700 pt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-300">Total Facility</span>
                  <span className="text-white">69.2 tCO₂e</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-300 mb-3">Emissions Avoided vs Field</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Transportation</span>
                <span className="text-green-400">-45.2 tCO₂e</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Land Use Change</span>
                <span className="text-green-400">-38.7 tCO₂e</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Chemical Production</span>
                <span className="text-green-400">-12.3 tCO₂e</span>
              </div>
              <div className="border-t border-gray-700 pt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-green-400">Net Carbon Benefit</span>
                  <span className="text-green-400">-27.0 tCO₂e</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">Carbon Negative Operation</div>
            <p className="text-sm text-gray-300">
              This CEA facility saves more carbon than it emits by avoiding the environmental 
              impacts of traditional field farming and long-distance transportation.
            </p>
          </div>
        </div>
      </div>

      {/* Environmental Impact Equivalents */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Environmental Impact Equivalents</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <TreePine className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">685</div>
            <div className="text-sm text-gray-400">Trees planted equivalent</div>
            <div className="text-xs text-green-400 mt-1">carbon sequestered</div>
          </div>
          
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <Truck className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">6</div>
            <div className="text-sm text-gray-400">Cars off the road</div>
            <div className="text-xs text-blue-400 mt-1">annually</div>
          </div>
          
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <Droplets className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">2.4M</div>
            <div className="text-sm text-gray-400">Gallons water saved</div>
            <div className="text-xs text-cyan-400 mt-1">vs field farming</div>
          </div>
          
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <Building className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">24.8</div>
            <div className="text-sm text-gray-400">Acres of farmland</div>
            <div className="text-xs text-purple-400 mt-1">equivalent production</div>
          </div>
        </div>
      </div>
    </div>
  );
}