'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Check, X, TrendingUp, DollarSign,
  Zap, Shield, Award, Calculator, Info
} from 'lucide-react';
import { 
  calculateRevenueSharingCost,
  REVENUE_SHARING_MODELS,
  type CostScenario 
} from '@/lib/revenue-sharing-pricing';
import { SAFE_SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers-safe';
import PricingNavigation from '@/components/PricingNavigation';

export default function ComparePricingPage() {
  const [scenario, setScenario] = useState<CostScenario>({
    facilitySize: 10000,
    monthlyEnergyBill: 5000,
    currentYield: 0.5,
    cropPrice: 1200
  });

  // Calculate costs for different models
  const traditionalCost = 299; // Professional tier
  const revenueSharingCalc = calculateRevenueSharingCost(
    REVENUE_SHARING_MODELS.find(m => m.id === 'hybrid-optimizer')!,
    scenario
  );

  const breakEvenMonths = Math.ceil(
    traditionalCost / (revenueSharingCalc.growerSavings / 12)
  );

  return (
    <div className="min-h-screen bg-black">
      <PricingNavigation />
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-cyan-400 bg-clip-text text-transparent">
              Traditional vs Revenue Sharing
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Compare our pricing models to find the best fit for your operation. 
              See real numbers based on your facility.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Calculator */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Your Facility Details</h2>
            
            <div className="grid md:grid-cols-4 gap-6 mb-8">
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
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Traditional Fixed Pricing
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Monthly Cost</p>
                    <p className="text-3xl font-bold text-white">${traditionalCost}</p>
                    <p className="text-xs text-gray-500 mt-1">Fixed regardless of results</p>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Annual Cost</p>
                    <p className="text-2xl font-semibold text-gray-300">
                      ${(traditionalCost * 12).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Your Net Savings</p>
                    <p className="text-2xl font-semibold text-green-400">
                      ${(revenueSharingCalc.estimatedMonthlySavings - traditionalCost).toLocaleString()}/mo
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Predictable costs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Full feature access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <X className="w-4 h-4 text-red-500" />
                    <span className="text-gray-300">Pay even if no savings</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <X className="w-4 h-4 text-red-500" />
                    <span className="text-gray-300">All risk on grower</span>
                  </div>
                </div>
              </div>

              {/* Revenue Sharing */}
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-600/30">
                <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Revenue Sharing Model
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Base + Performance</p>
                    <p className="text-3xl font-bold text-green-400">
                      ${revenueSharingCalc.totalMonthlyCost.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      $199 base + ${revenueSharingCalc.vibeluxShare.toLocaleString()} (20% share)
                    </p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Your Savings</p>
                    <p className="text-2xl font-semibold text-green-400">
                      ${revenueSharingCalc.growerSavings.toLocaleString()}/mo
                    </p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">ROI</p>
                    <p className="text-2xl font-semibold text-green-400">
                      {revenueSharingCalc.roi.toFixed(1)}x
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Pay based on results</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Shared risk model</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Aligned incentives</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300">Higher net savings</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="mt-8 p-6 bg-blue-900/20 rounded-xl border border-blue-600/30">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <h4 className="font-semibold text-white mb-2">Recommendation</h4>
                  <p className="text-gray-300">
                    Based on your facility size and energy costs, revenue sharing would save you an extra{' '}
                    <span className="font-semibold text-green-400">
                      ${((revenueSharingCalc.growerSavings - (revenueSharingCalc.estimatedMonthlySavings - traditionalCost)) * 12).toLocaleString()}/year
                    </span>{' '}
                    compared to traditional pricing. Break-even is in {breakEvenMonths} months.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* When to Choose Each */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Which Model Is Right For You?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-6 text-white">
                Choose Traditional Pricing If:
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600/20 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-white">You prefer predictable costs</p>
                    <p className="text-sm text-gray-400">Fixed monthly pricing makes budgeting simple</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600/20 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Your facility is already optimized</p>
                    <p className="text-sm text-gray-400">Limited room for improvement means less upside to share</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600/20 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-white">You need advanced features immediately</p>
                    <p className="text-sm text-gray-400">Full access from day one without performance requirements</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-600/30">
              <h3 className="text-2xl font-semibold mb-6 text-white">
                Choose Revenue Sharing If:
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-600/20 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-white">You want to minimize risk</p>
                    <p className="text-sm text-gray-400">Pay only when you see real savings</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-600/20 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Your energy costs are high</p>
                    <p className="text-sm text-gray-400">More savings potential means better ROI</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-600/20 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-white">You value aligned incentives</p>
                    <p className="text-sm text-gray-400">VibeLux only succeeds when you succeed</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Choose the pricing model that works best for your operation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              View Traditional Plans
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing/revenue-sharing"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Explore Revenue Sharing
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}