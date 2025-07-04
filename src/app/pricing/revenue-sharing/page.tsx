'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, Zap, DollarSign, Calculator, Check, 
  ArrowRight, Info, Shield, Award, ChartBar, BarChart3,
  Battery, Leaf, PiggyBank, Percent
} from 'lucide-react';
import { 
  REVENUE_SHARING_MODELS, 
  calculateRevenueSharingCost,
  VIBELUX_SUCCESS_METRICS,
  type CostScenario 
} from '@/lib/revenue-sharing-pricing';
import PricingNavigation from '@/components/PricingNavigation';

export default function RevenueSharingPricingPage() {
  const [selectedModel, setSelectedModel] = useState(REVENUE_SHARING_MODELS[1]); // Default to YEP
  const [scenario, setScenario] = useState<CostScenario>({
    facilitySize: 10000,
    monthlyEnergyBill: 5000,
    currentYield: 0.5,
    cropPrice: 1200,
    cropType: 'cannabis',
    contractYears: 1,
    currentMonth: new Date().getMonth() + 1
  });

  const calculation = calculateRevenueSharingCost(selectedModel, scenario);

  return (
    <div className="min-h-screen bg-black">
      <PricingNavigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-green-600/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <Percent className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">
                New Revenue-Sharing Pricing Model
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-green-200 to-emerald-400 bg-clip-text text-transparent">
              Pay Only When You Save
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Split the upside with VibeLux. We only make money when we save you money or increase your yields. 
              No risk, all reward.
            </p>

            {/* Success Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-4xl font-bold text-white mb-1">
                  {VIBELUX_SUCCESS_METRICS.averageEnergySavings}%
                </div>
                <div className="text-sm text-gray-400">Avg Energy Savings</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-4xl font-bold text-white mb-1">
                  {VIBELUX_SUCCESS_METRICS.averageYieldImprovement}%
                </div>
                <div className="text-sm text-gray-400">Avg Yield Increase</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-4xl font-bold text-white mb-1">
                  {VIBELUX_SUCCESS_METRICS.averageROI}x
                </div>
                <div className="text-sm text-gray-400">Average ROI</div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-4xl font-bold text-white mb-1">
                  ${(VIBELUX_SUCCESS_METRICS.totalSavingsGenerated / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-400">Total Savings Generated</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Sharing Models */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Choose Your Performance Model
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {REVENUE_SHARING_MODELS.map(model => {
              const isSelected = selectedModel.id === model.id;
              const Icon = model.id.includes('energy') ? Battery : 
                         model.id.includes('yield') ? Leaf : 
                         model.id.includes('hybrid') ? TrendingUp :
                         model.id.includes('starter') ? PiggyBank : Shield;

              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 cursor-pointer transition-all duration-300 border-2
                    ${isSelected 
                      ? 'border-green-500 bg-green-500/10 transform scale-105' 
                      : 'border-white/10 hover:border-white/30'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${
                        isSelected ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{model.name}</h3>
                        <p className="text-sm text-gray-400">{model.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Structure */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Base Fee:</span>
                      <span className="text-white font-semibold">
                        ${model.basePrice}/month
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Performance Fee:</span>
                      <span className="text-green-400 font-semibold">
                        {model.performanceFee}% of savings
                      </span>
                    </div>
                    {model.minimumSavings && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Minimum Savings:</span>
                        <span className="text-white">
                          ${model.minimumSavings}/month
                        </span>
                      </div>
                    )}
                    {model.capAmount && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Monthly Cap:</span>
                        <span className="text-white">
                          ${model.capAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Shared Metrics */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-400 mb-2">We share in:</p>
                    <div className="space-y-1">
                      {model.sharedMetrics.map((metric, idx) => (
                        <div key={idx} className="text-sm text-gray-300">
                          • {metric.name} ({metric.sharePercentage}%)
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {model.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                    {model.features.length > 4 && (
                      <p className="text-sm text-gray-400 ml-6">
                        +{model.features.length - 4} more features
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cost Calculator */}
      <section className="py-16 bg-white/5 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            Calculate Your Costs & Savings
          </h2>

          <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-xl font-semibold mb-6 text-white">
              Your Facility Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
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
                  Current Yield (lbs/sq ft/year)
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
                  Crop Type
                </label>
                <select
                  value={scenario.cropType}
                  onChange={(e) => setScenario({
                    ...scenario,
                    cropType: e.target.value
                  })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="cannabis">Cannabis</option>
                  <option value="leafy-greens">Leafy Greens</option>
                  <option value="tomatoes">Tomatoes</option>
                  <option value="other">Other Crops</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Contract Length
                </label>
                <select
                  value={scenario.contractYears}
                  onChange={(e) => setScenario({
                    ...scenario,
                    contractYears: parseInt(e.target.value)
                  })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value={1}>1 Year</option>
                  <option value={2}>2 Years (Save 10-15%)</option>
                  <option value={3}>3 Years (Save 20-25%)</option>
                  <option value={5}>5 Years (Save 30%)</option>
                </select>
              </div>
            </div>

            {/* Results */}
            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-700/50">
              <h4 className="text-lg font-semibold mb-4 text-white">
                Projected Results with {selectedModel.name}
              </h4>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Monthly Savings/Gains</p>
                  <p className="text-3xl font-bold text-green-400">
                    ${calculation.estimatedMonthlySavings.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Your Share (After VibeLux Fee)</p>
                  <p className="text-3xl font-bold text-white">
                    ${calculation.growerSavings.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Total VibeLux Cost</p>
                  <p className="text-2xl font-semibold text-gray-300">
                    ${calculation.totalMonthlyCost.toLocaleString()}/month
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (${selectedModel.basePrice} base + ${calculation.vibeluxShare.toLocaleString()} performance)
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Your ROI</p>
                  <p className="text-2xl font-semibold text-green-400">
                    {calculation.roi.toFixed(1)}x
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    For every $1 spent, save ${calculation.roi.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Applied Discounts */}
              {calculation.appliedDiscounts.length > 0 && (
                <div className="mt-6 p-4 bg-blue-600/10 rounded-lg border border-blue-600/30">
                  <p className="text-sm font-semibold text-blue-400 mb-2">Applied Discounts:</p>
                  <ul className="space-y-1">
                    {calculation.appliedDiscounts.map((discount, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {discount}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-400 mt-2">
                    Effective rate: {calculation.effectivePercentage.toFixed(1)}% (down from {selectedModel.performanceFee}%)
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 bg-green-600/10 rounded-lg border border-green-600/30">
                <p className="text-sm text-green-400">
                  <Info className="w-4 h-4 inline mr-1" />
                  With revenue sharing, you keep {100 - selectedModel.performanceFee}% of all savings and gains. 
                  VibeLux only succeeds when you succeed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison with Traditional Pricing */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            Revenue Sharing vs. Traditional Pricing
          </h2>

          <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Traditional Fixed Pricing
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <span className="text-gray-300">Pay the same regardless of results</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <span className="text-gray-300">Risk is entirely on the grower</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <span className="text-gray-300">High upfront costs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <span className="text-gray-300">May pay for features you don't use</span>
                  </div>

                  <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-400">Typical Cost:</p>
                    <p className="text-2xl font-bold text-white">$299-999/month</p>
                  </div>
                </div>
              </div>

              {/* Revenue Sharing */}
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-700/50">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Revenue Sharing Model
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-gray-300">Pay based on actual savings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-gray-300">VibeLux shares the risk</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-gray-300">Low or no base fee</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-gray-300">Aligned incentives</span>
                  </div>

                  <div className="mt-6 p-4 bg-green-800/20 rounded-lg">
                    <p className="text-sm text-gray-400">Your Cost:</p>
                    <p className="text-2xl font-bold text-green-400">
                      Only {selectedModel.performanceFee}% of savings
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiered Pricing & Benefits */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            More Savings = Lower Rates
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Tiered Pricing */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                Tiered Performance Fees
              </h3>
              <p className="text-gray-400 mb-4">
                The more you save, the less we take:
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">$0 - $5K savings</span>
                  <span className="text-white font-semibold">30%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">$5K - $15K savings</span>
                  <span className="text-green-400 font-semibold">25%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">$15K - $50K savings</span>
                  <span className="text-green-400 font-semibold">20%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">$50K+ savings</span>
                  <span className="text-green-500 font-semibold">15%</span>
                </div>
              </div>
            </div>

            {/* Seasonal Discounts */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400" />
                Seasonal Discounts
              </h3>
              <p className="text-gray-400 mb-4">
                Extra savings during peak periods:
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
                  <p className="text-sm font-semibold text-yellow-400">Summer (Jun-Aug)</p>
                  <p className="text-xs text-gray-300">20% off during peak demand</p>
                </div>
                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-600/30">
                  <p className="text-sm font-semibold text-blue-400">Winter (Dec-Feb)</p>
                  <p className="text-xs text-gray-300">15% off during heating season</p>
                </div>
              </div>
            </div>

            {/* Multi-Year Benefits */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-400" />
                Multi-Year Rewards
              </h3>
              <p className="text-gray-400 mb-4">
                Lock in savings with longer contracts:
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">2-Year Contract</span>
                  <span className="text-purple-400 font-semibold">10-15% off</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">3-Year Contract</span>
                  <span className="text-purple-400 font-semibold">20-25% off</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">5-Year Contract</span>
                  <span className="text-purple-500 font-semibold">30% off</span>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Plus reduced base fees on select plans
                </p>
              </div>
            </div>
          </div>

          {/* Crop-Specific Programs */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-600/30">
            <h3 className="text-2xl font-semibold mb-6 text-white text-center">
              Crop-Specific Optimization Programs
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3">Cannabis Excellence</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• THC/CBD potency optimization</li>
                  <li>• Terpene profile enhancement</li>
                  <li>• Harvest weight maximization</li>
                  <li>• Custom metrics tracking</li>
                </ul>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3">Leafy Greens Speed</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• 30% faster growth cycles</li>
                  <li>• 40% longer shelf life</li>
                  <li>• Enhanced nutrient density</li>
                  <li>• Reduced waste metrics</li>
                </ul>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-3">Premium Produce</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Size & weight optimization</li>
                  <li>• Sugar content enhancement</li>
                  <li>• Yield per plant tracking</li>
                  <li>• Quality consistency</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            How Revenue Sharing Works
          </h2>

          <div className="space-y-6">
            {[
              {
                step: 1,
                title: 'Baseline Establishment',
                description: 'We analyze your historical data to establish clear baselines for energy costs, yields, and operational metrics.',
                icon: ChartBar
              },
              {
                step: 2,
                title: 'Implementation',
                description: 'Deploy VibeLux optimization tools including demand response, AI controls, and yield enhancement features.',
                icon: Zap
              },
              {
                step: 3,
                title: 'Continuous Optimization',
                description: 'Our AI continuously optimizes your operations, reducing costs and improving yields 24/7.',
                icon: TrendingUp
              },
              {
                step: 4,
                title: 'Transparent Tracking',
                description: 'Real-time dashboards show your savings, improvements, and VibeLux\'s share with full transparency.',
                icon: Shield
              },
              {
                step: 5,
                title: 'Automated Billing',
                description: 'Pay only your share based on actual verified savings. No savings = no performance fee.',
                icon: DollarSign
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    Step {item.step}: {item.title}
                  </h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-8 text-white">
            Explore Revenue Sharing Tools
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link 
              href="/pricing/revenue-sharing/simulator"
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors group"
            >
              <BarChart3 className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                Savings Simulator
              </h3>
              <p className="text-sm text-gray-400">
                Test different scenarios and see how discounts stack up
              </p>
            </Link>
            
            <Link 
              href="/pricing/calculator"
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors group"
            >
              <Calculator className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                ROI Calculator
              </h3>
              <p className="text-sm text-gray-400">
                Calculate detailed ROI with 5-year projections
              </p>
            </Link>
            
            <Link 
              href="/pricing/compare"
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors group"
            >
              <ChartBar className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                Compare Options
              </h3>
              <p className="text-sm text-gray-400">
                Side-by-side comparison of traditional vs revenue sharing
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to Share Success?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Start saving with zero risk. We only win when you win.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Get Started with Revenue Sharing
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              View Traditional Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}