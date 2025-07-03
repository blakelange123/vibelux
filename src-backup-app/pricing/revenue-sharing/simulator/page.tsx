'use client';

import React, { useState } from 'react';
import { 
  Calculator, TrendingUp, Calendar, Leaf, DollarSign,
  ChevronRight, Info, Award, BarChart3
} from 'lucide-react';
import { 
  calculateRevenueSharingCost,
  REVENUE_SHARING_MODELS,
  type CostScenario 
} from '@/lib/revenue-sharing-pricing';
import PricingNavigation from '@/components/PricingNavigation';

export default function RevenueSharingSimulatorPage() {
  const [scenarios, setScenarios] = useState<{
    name: string;
    scenario: CostScenario;
    modelId: string;
  }[]>([
    {
      name: 'Small Indoor Cannabis',
      scenario: {
        facilitySize: 5000,
        monthlyEnergyBill: 3000,
        currentYield: 0.4,
        cropPrice: 1500,
        cropType: 'cannabis',
        contractYears: 2,
        currentMonth: 7 // July - summer discount
      },
      modelId: 'yield-enhancement'
    },
    {
      name: 'Medium Greenhouse',
      scenario: {
        facilitySize: 25000,
        monthlyEnergyBill: 8000,
        currentYield: 0.3,
        cropPrice: 800,
        cropType: 'tomatoes',
        contractYears: 3,
        currentMonth: 1 // January - winter discount
      },
      modelId: 'hybrid-optimizer'
    },
    {
      name: 'Large Vertical Farm',
      scenario: {
        facilitySize: 50000,
        monthlyEnergyBill: 25000,
        currentYield: 0.8,
        cropPrice: 12,
        cropType: 'leafy-greens',
        contractYears: 5,
        currentMonth: 6 // June - summer discount
      },
      modelId: 'energy-optimizer'
    }
  ]);

  const [customScenario, setCustomScenario] = useState<CostScenario>({
    facilitySize: 10000,
    monthlyEnergyBill: 5000,
    currentYield: 0.5,
    cropPrice: 1200,
    cropType: 'cannabis',
    contractYears: 1,
    currentMonth: new Date().getMonth() + 1
  });
  const [customModelId, setCustomModelId] = useState('hybrid-optimizer');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-black">
      <PricingNavigation />
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-green-600/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-full mb-8 border border-white/10">
              <Calculator className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">
                Revenue Sharing Simulator
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-green-200 to-emerald-400 bg-clip-text text-transparent">
              See Your Exact Savings
            </h1>
            
            <p className="text-xl text-gray-400 leading-relaxed">
              Explore different scenarios and see how tiered pricing, seasonal discounts, 
              and multi-year contracts affect your costs.
            </p>
          </div>
        </div>
      </section>

      {/* Pre-built Scenarios */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8 text-white">
            Common Facility Scenarios
          </h2>

          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {scenarios.map((preset, idx) => {
              const model = REVENUE_SHARING_MODELS.find(m => m.id === preset.modelId)!;
              const calc = calculateRevenueSharingCost(model, preset.scenario);
              
              return (
                <div key={idx} className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-850 transition-colors">
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    {preset.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white">{preset.scenario.facilitySize.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Energy Bill:</span>
                      <span className="text-white">${preset.scenario.monthlyEnergyBill.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Crop:</span>
                      <span className="text-white capitalize">{preset.scenario.cropType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contract:</span>
                      <span className="text-white">{preset.scenario.contractYears} year{preset.scenario.contractYears > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Month:</span>
                      <span className="text-white">{months[preset.scenario.currentMonth! - 1]}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Savings:</span>
                        <span className="text-green-400 font-semibold">
                          ${calc.estimatedMonthlySavings.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">VibeLux Cost:</span>
                        <span className="text-white">
                          ${calc.totalMonthlyCost.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Your Net:</span>
                        <span className="text-green-500 font-bold">
                          ${calc.growerSavings.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Effective Rate:</span>
                        <span className="text-purple-400">
                          {calc.effectivePercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {calc.appliedDiscounts.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-600/30">
                        <p className="text-xs font-semibold text-blue-400 mb-1">Discounts Applied:</p>
                        <ul className="text-xs text-gray-300 space-y-0.5">
                          {calc.appliedDiscounts.map((discount, i) => (
                            <li key={i}>• {discount}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Custom Simulator */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Build Your Custom Scenario
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="bg-gray-800 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6 text-white">
                Facility Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Revenue Sharing Model
                  </label>
                  <select
                    value={customModelId}
                    onChange={(e) => setCustomModelId(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    {REVENUE_SHARING_MODELS.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.performanceFee}% base rate
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Facility Size (sq ft)
                    </label>
                    <input
                      type="number"
                      value={customScenario.facilitySize}
                      onChange={(e) => setCustomScenario({
                        ...customScenario,
                        facilitySize: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Energy Bill ($/mo)
                    </label>
                    <input
                      type="number"
                      value={customScenario.monthlyEnergyBill}
                      onChange={(e) => setCustomScenario({
                        ...customScenario,
                        monthlyEnergyBill: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Current Yield (lbs/sqft/yr)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={customScenario.currentYield}
                      onChange={(e) => setCustomScenario({
                        ...customScenario,
                        currentYield: parseFloat(e.target.value) || 0
                      })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Crop Price ($/lb)
                    </label>
                    <input
                      type="number"
                      value={customScenario.cropPrice}
                      onChange={(e) => setCustomScenario({
                        ...customScenario,
                        cropPrice: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Crop Type
                  </label>
                  <select
                    value={customScenario.cropType}
                    onChange={(e) => setCustomScenario({
                      ...customScenario,
                      cropType: e.target.value
                    })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="cannabis">Cannabis</option>
                    <option value="leafy-greens">Leafy Greens</option>
                    <option value="tomatoes">Tomatoes</option>
                    <option value="strawberries">Strawberries</option>
                    <option value="herbs">Herbs</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Contract Length
                    </label>
                    <select
                      value={customScenario.contractYears}
                      onChange={(e) => setCustomScenario({
                        ...customScenario,
                        contractYears: parseInt(e.target.value)
                      })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value={1}>1 Year</option>
                      <option value={2}>2 Years</option>
                      <option value={3}>3 Years</option>
                      <option value={5}>5 Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Start Month
                    </label>
                    <select
                      value={customScenario.currentMonth}
                      onChange={(e) => setCustomScenario({
                        ...customScenario,
                        currentMonth: parseInt(e.target.value)
                      })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={idx + 1}>{month}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div>
              {(() => {
                const model = REVENUE_SHARING_MODELS.find(m => m.id === customModelId)!;
                const calc = calculateRevenueSharingCost(model, customScenario);
                const annualNet = calc.growerSavings * 12;
                const fiveYearNet = calc.growerSavings * 60;

                return (
                  <div className="space-y-6">
                    {/* Main Results */}
                    <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-600/30">
                      <h3 className="text-2xl font-semibold mb-6 text-white">
                        Your Custom Results
                      </h3>

                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Total Monthly Savings</p>
                          <p className="text-3xl font-bold text-green-400">
                            ${calc.estimatedMonthlySavings.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">VibeLux Cost</p>
                          <p className="text-3xl font-bold text-white">
                            ${calc.totalMonthlyCost.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Your Net Savings</p>
                          <p className="text-3xl font-bold text-green-500">
                            ${calc.growerSavings.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">ROI</p>
                          <p className="text-3xl font-bold text-purple-400">
                            {calc.roi.toFixed(1)}x
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-green-700/50 pt-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xs text-gray-400">Monthly Net</p>
                            <p className="text-lg font-semibold text-white">
                              ${calc.growerSavings.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Annual Net</p>
                            <p className="text-lg font-semibold text-white">
                              ${annualNet.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">5-Year Net</p>
                            <p className="text-lg font-semibold text-white">
                              ${fiveYearNet.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Applied Discounts */}
                    {calc.appliedDiscounts.length > 0 && (
                      <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-600/30">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5 text-blue-400" />
                          Your Discounts & Benefits
                        </h4>
                        <ul className="space-y-2">
                          {calc.appliedDiscounts.map((discount, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                              <ChevronRight className="w-4 h-4 text-blue-400" />
                              {discount}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 p-3 bg-blue-800/20 rounded-lg">
                          <p className="text-sm text-blue-300">
                            <strong>Effective Rate:</strong> {calc.effectivePercentage.toFixed(1)}% 
                            (reduced from {model.performanceFee}%)
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Breakdown Chart */}
                    <div className="bg-gray-800 rounded-xl p-6">
                      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                        Cost Breakdown
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Base Fee</span>
                            <span className="text-white">${model.basePrice}</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-600"
                              style={{ width: `${(model.basePrice / calc.totalMonthlyCost) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Performance Fee</span>
                            <span className="text-white">${calc.vibeluxShare.toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-600"
                              style={{ width: `${(calc.vibeluxShare / calc.totalMonthlyCost) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-600/30">
            <h3 className="text-2xl font-semibold mb-6 text-white text-center">
              Maximize Your Savings
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Tiered Pricing Benefits
                </h4>
                <p className="text-sm text-gray-300">
                  As your savings increase, your rate automatically decreases. 
                  Large operations can pay as little as 10-15% on savings over $50K/month.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  Seasonal & Contract Discounts
                </h4>
                <p className="text-sm text-gray-300">
                  Start during peak seasons for up to 20% off. Commit to multi-year 
                  contracts for up to 40% off base fees and 30% off performance fees.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-400" />
                  Crop-Specific Programs
                </h4>
                <p className="text-sm text-gray-300">
                  Get bonus optimization for your specific crop type. Cannabis growers 
                  can optimize potency, while leafy greens focus on growth speed.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  No Risk Guarantee
                </h4>
                <p className="text-sm text-gray-300">
                  If we don't save you money, you don't pay performance fees. 
                  Our success is directly tied to yours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}