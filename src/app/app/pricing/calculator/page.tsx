'use client';

import React, { useState } from 'react';
import { 
  Calculator, TrendingUp, DollarSign, Leaf, 
  Battery, Info, Download, Share2
} from 'lucide-react';
import { 
  calculateRevenueSharingCost,
  REVENUE_SHARING_MODELS,
  type CostScenario 
} from '@/lib/revenue-sharing-pricing';
import { SAFE_SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers-safe';
import PricingNavigation from '@/components/PricingNavigation';

interface ExtendedScenario extends CostScenario {
  growType: 'indoor' | 'greenhouse' | 'vertical';
  lightingType: 'hps' | 'led' | 'hybrid';
  hoursPerDay: number;
  daysPerYear: number;
  laborCostPerHour: number;
  waterCostPerGallon: number;
}

export default function PricingCalculatorPage() {
  const [scenario, setScenario] = useState<ExtendedScenario>({
    facilitySize: 10000,
    monthlyEnergyBill: 5000,
    currentYield: 0.5,
    cropPrice: 1200,
    growType: 'indoor',
    lightingType: 'led',
    hoursPerDay: 18,
    daysPerYear: 365,
    laborCostPerHour: 25,
    waterCostPerGallon: 0.003
  });

  const [selectedTier, setSelectedTier] = useState('professional');
  const [selectedRevShare, setSelectedRevShare] = useState('hybrid-optimizer');

  // Calculate various savings
  const energySavingsPercent = scenario.lightingType === 'hps' ? 0.35 : 0.22;
  const yieldImprovementPercent = 0.18;
  const laborSavingsPercent = 0.15;
  const waterSavingsPercent = 0.20;

  const monthlyEnergySavings = scenario.monthlyEnergyBill * energySavingsPercent;
  const currentMonthlyRevenue = (scenario.currentYield * scenario.facilitySize * scenario.cropPrice) / 12;
  const monthlyYieldRevenue = currentMonthlyRevenue * yieldImprovementPercent;
  const monthlyLaborCost = scenario.laborCostPerHour * 160 * (scenario.facilitySize / 1000) * 0.1; // Rough estimate
  const monthlyLaborSavings = monthlyLaborCost * laborSavingsPercent;
  const monthlyWaterCost = scenario.waterCostPerGallon * scenario.facilitySize * 2; // 2 gal/sqft/month estimate
  const monthlyWaterSavings = monthlyWaterCost * waterSavingsPercent;

  const totalMonthlySavings = monthlyEnergySavings + monthlyYieldRevenue + monthlyLaborSavings + monthlyWaterSavings;

  // Get selected models
  const traditionalTier = SAFE_SUBSCRIPTION_TIERS.find(t => t.id === selectedTier)!;
  const revShareModel = REVENUE_SHARING_MODELS.find(m => m.id === selectedRevShare)!;
  const revShareCalc = calculateRevenueSharingCost(revShareModel, scenario);

  // 5-year projections
  const fiveYearTraditional = traditionalTier.price * 12 * 5;
  const fiveYearRevShare = revShareCalc.totalMonthlyCost * 12 * 5;
  const fiveYearTotalSavings = totalMonthlySavings * 12 * 5;
  const fiveYearNetTraditional = fiveYearTotalSavings - fiveYearTraditional;
  const fiveYearNetRevShare = revShareCalc.growerSavings * 12 * 5;

  return (
    <div className="min-h-screen bg-black">
      <PricingNavigation />
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <Calculator className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                ROI & Savings Calculator
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-400 bg-clip-text text-transparent">
              Calculate Your VibeLux ROI
            </h1>
            
            <p className="text-xl text-gray-400 leading-relaxed">
              See exactly how much you'll save with detailed projections for both 
              traditional and revenue-sharing pricing models.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Inputs */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-2xl p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6 text-white">
                  Facility Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Grow Type
                    </label>
                    <select
                      value={scenario.growType}
                      onChange={(e) => setScenario({
                        ...scenario,
                        growType: e.target.value as any
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="indoor">Indoor</option>
                      <option value="greenhouse">Greenhouse</option>
                      <option value="vertical">Vertical Farm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Current Lighting
                    </label>
                    <select
                      value={scenario.lightingType}
                      onChange={(e) => setScenario({
                        ...scenario,
                        lightingType: e.target.value as any
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="hps">HPS</option>
                      <option value="led">LED</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Facility Size (sq ft)
                    </label>
                    <input
                      type="number"
                      value={scenario.facilitySize}
                      onChange={(e) => setScenario({
                        ...scenario,
                        facilitySize: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Monthly Energy Bill ($)
                    </label>
                    <input
                      type="number"
                      value={scenario.monthlyEnergyBill}
                      onChange={(e) => setScenario({
                        ...scenario,
                        monthlyEnergyBill: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Current Yield (lbs/sq ft/yr)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={scenario.currentYield}
                      onChange={(e) => setScenario({
                        ...scenario,
                        currentYield: parseFloat(e.target.value) || 0
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Crop Price ($/lb)
                    </label>
                    <input
                      type="number"
                      value={scenario.cropPrice}
                      onChange={(e) => setScenario({
                        ...scenario,
                        cropPrice: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Light Hours/Day
                    </label>
                    <input
                      type="number"
                      value={scenario.hoursPerDay}
                      onChange={(e) => setScenario({
                        ...scenario,
                        hoursPerDay: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Labor Cost ($/hour)
                    </label>
                    <input
                      type="number"
                      value={scenario.laborCostPerHour}
                      onChange={(e) => setScenario({
                        ...scenario,
                        laborCostPerHour: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2 space-y-8">
              {/* Savings Breakdown */}
              <div className="bg-gray-900 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold mb-6 text-white">
                  Projected Monthly Savings
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Battery className="w-8 h-8 text-yellow-400" />
                      <div>
                        <p className="text-sm text-gray-400">Energy Savings</p>
                        <p className="text-2xl font-bold text-white">
                          ${monthlyEnergySavings.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(energySavingsPercent * 100).toFixed(0)}% reduction
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Leaf className="w-8 h-8 text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Yield Revenue</p>
                        <p className="text-2xl font-bold text-white">
                          ${monthlyYieldRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(yieldImprovementPercent * 100).toFixed(0)}% increase
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <DollarSign className="w-8 h-8 text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">Labor Savings</p>
                        <p className="text-2xl font-bold text-white">
                          ${monthlyLaborSavings.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Through automation
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Total Monthly</p>
                        <p className="text-2xl font-bold text-green-400">
                          ${totalMonthlySavings.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          All savings combined
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Comparison */}
              <div className="bg-gray-900 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold mb-6 text-white">
                  Pricing Model Comparison
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Traditional */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h4 className="text-lg font-semibold mb-4 text-white">
                      Traditional: {traditionalTier.name}
                    </h4>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monthly Cost</span>
                        <span className="text-white font-semibold">${traditionalTier.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Annual Cost</span>
                        <span className="text-white">${traditionalTier.price * 12}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monthly Net</span>
                        <span className="text-green-400 font-semibold">
                          ${(totalMonthlySavings - traditionalTier.price).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    >
                      {SAFE_SUBSCRIPTION_TIERS.map(tier => (
                        <option key={tier.id} value={tier.id}>
                          {tier.name} - ${tier.price}/mo
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Revenue Sharing */}
                  <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-600/30">
                    <h4 className="text-lg font-semibold mb-4 text-white">
                      Revenue Share: {revShareModel.name}
                    </h4>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Your Cost</span>
                        <span className="text-white font-semibold">
                          ${revShareCalc.totalMonthlyCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">VibeLux Share</span>
                        <span className="text-white">{revShareModel.performanceFee}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Your Savings</span>
                        <span className="text-green-400 font-semibold">
                          ${revShareCalc.growerSavings.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <select
                      value={selectedRevShare}
                      onChange={(e) => setSelectedRevShare(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    >
                      {REVENUE_SHARING_MODELS.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 5-Year Projection */}
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-600/30">
                <h3 className="text-2xl font-semibold mb-6 text-white">
                  5-Year Financial Projection
                </h3>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">Total Savings Generated</p>
                    <p className="text-3xl font-bold text-green-400">
                      ${(fiveYearTotalSavings / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">Net w/ Traditional</p>
                    <p className="text-3xl font-bold text-white">
                      ${(fiveYearNetTraditional / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">Net w/ Rev Share</p>
                    <p className="text-3xl font-bold text-green-400">
                      ${(fiveYearNetRevShare / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>

                <div className="bg-purple-800/20 rounded-lg p-4">
                  <p className="text-sm text-purple-300">
                    <Info className="w-4 h-4 inline mr-2" />
                    Revenue sharing yields an additional{' '}
                    <span className="font-semibold text-white">
                      ${((fiveYearNetRevShare - fiveYearNetTraditional) / 1000).toFixed(0)}K
                    </span>{' '}
                    over 5 years compared to traditional pricing.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Report
                </button>
                <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}