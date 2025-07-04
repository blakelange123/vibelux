'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Zap, Leaf, Clock } from 'lucide-react';

interface ROIInputs {
  facilitySize: number; // sq ft
  currentLightType: 'hps' | 'led' | 'fluorescent' | 'none';
  currentWattagePerSqFt: number;
  hoursPerDay: number;
  daysPerYear: number;
  electricityRate: number; // $/kWh
  currentYieldPerSqFt: number; // grams
  productValuePerGram: number; // $
  laborHoursPerWeek: number;
  laborRate: number; // $/hour
}

interface ROIResults {
  energySavingsPerYear: number;
  yieldIncreasePerYear: number;
  laborSavingsPerYear: number;
  totalSavingsPerYear: number;
  vibeluxCostPerYear: number;
  netROIPerYear: number;
  paybackPeriodMonths: number;
  fiveYearROI: number;
  carbonReduction: number; // tons CO2
}

export function InteractiveROICalculator() {
  const [inputs, setInputs] = useState<ROIInputs>({
    facilitySize: 10000,
    currentLightType: 'hps',
    currentWattagePerSqFt: 50,
    hoursPerDay: 18,
    daysPerYear: 365,
    electricityRate: 0.12,
    currentYieldPerSqFt: 50,
    productValuePerGram: 5,
    laborHoursPerWeek: 40,
    laborRate: 20,
  });

  const [results, setResults] = useState<ROIResults | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const calculateROI = () => {
    // Energy calculations
    const currentWattage = inputs.facilitySize * inputs.currentWattagePerSqFt;
    const optimizedWattage = currentWattage * 0.6; // 40% reduction with LED + optimization
    const energySavingsKwh = (currentWattage - optimizedWattage) * inputs.hoursPerDay * inputs.daysPerYear / 1000;
    const energySavingsPerYear = energySavingsKwh * inputs.electricityRate;

    // Yield improvements
    const yieldImprovement = inputs.currentLightType === 'hps' ? 0.25 : 0.15; // 25% for HPS, 15% for others
    const additionalYield = inputs.facilitySize * inputs.currentYieldPerSqFt * yieldImprovement;
    const yieldIncreasePerYear = additionalYield * inputs.productValuePerGram;

    // Labor savings (automation and optimization)
    const laborSavingsPercent = 0.20; // 20% reduction in labor
    const laborSavingsPerYear = inputs.laborHoursPerWeek * 52 * inputs.laborRate * laborSavingsPercent;

    // Vibelux subscription cost (based on facility size)
    let vibeluxCostPerYear = 0;
    if (inputs.facilitySize < 5000) {
      vibeluxCostPerYear = 79 * 12; // Professional
    } else if (inputs.facilitySize < 20000) {
      vibeluxCostPerYear = 299 * 12; // Enterprise
    } else {
      vibeluxCostPerYear = 799 * 12; // Corporate
    }

    // Total calculations
    const totalSavingsPerYear = energySavingsPerYear + yieldIncreasePerYear + laborSavingsPerYear;
    const netROIPerYear = totalSavingsPerYear - vibeluxCostPerYear;
    const paybackPeriodMonths = vibeluxCostPerYear > 0 ? (vibeluxCostPerYear / (totalSavingsPerYear / 12)) : 0;
    const fiveYearROI = netROIPerYear * 5;

    // Environmental impact
    const carbonReduction = energySavingsKwh * 0.0004; // tons CO2 per kWh

    setResults({
      energySavingsPerYear,
      yieldIncreasePerYear,
      laborSavingsPerYear,
      totalSavingsPerYear,
      vibeluxCostPerYear,
      netROIPerYear,
      paybackPeriodMonths,
      fiveYearROI,
      carbonReduction,
    });
  };

  useEffect(() => {
    calculateROI();
  }, [inputs]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-8 h-8 text-purple-400" />
        <h2 className="text-3xl font-bold text-white">ROI Calculator</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white mb-4">Your Facility</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Facility Size (sq ft)
            </label>
            <input
              type="number"
              value={inputs.facilitySize}
              onChange={(e) => setInputs({ ...inputs, facilitySize: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Current Lighting Type
            </label>
            <select
              value={inputs.currentLightType}
              onChange={(e) => setInputs({ ...inputs, currentLightType: e.target.value as any })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="hps">HPS</option>
              <option value="led">Basic LED</option>
              <option value="fluorescent">Fluorescent</option>
              <option value="none">No Lighting</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Electricity Rate ($/kWh)
            </label>
            <input
              type="number"
              value={inputs.electricityRate}
              onChange={(e) => setInputs({ ...inputs, electricityRate: Number(e.target.value) })}
              step="0.01"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Current Yield (g/sq ft/year)
            </label>
            <input
              type="number"
              value={inputs.currentYieldPerSqFt}
              onChange={(e) => setInputs({ ...inputs, currentYieldPerSqFt: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Product Value ($/gram)
            </label>
            <input
              type="number"
              value={inputs.productValuePerGram}
              onChange={(e) => setInputs({ ...inputs, productValuePerGram: Number(e.target.value) })}
              step="0.1"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </button>

          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Watts per sq ft
                </label>
                <input
                  type="number"
                  value={inputs.currentWattagePerSqFt}
                  onChange={(e) => setInputs({ ...inputs, currentWattagePerSqFt: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Hours per Day
                </label>
                <input
                  type="number"
                  value={inputs.hoursPerDay}
                  onChange={(e) => setInputs({ ...inputs, hoursPerDay: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Labor Hours/Week
                </label>
                <input
                  type="number"
                  value={inputs.laborHoursPerWeek}
                  onChange={(e) => setInputs({ ...inputs, laborHoursPerWeek: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Projected Annual Savings</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300">Energy Savings</span>
                  </div>
                  <span className="text-xl font-bold text-green-400">
                    {formatCurrency(results.energySavingsPerYear)}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  40% reduction in energy consumption
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Yield Increase</span>
                  </div>
                  <span className="text-xl font-bold text-green-400">
                    {formatCurrency(results.yieldIncreasePerYear)}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {inputs.currentLightType === 'hps' ? '25%' : '15%'} yield improvement
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">Labor Savings</span>
                  </div>
                  <span className="text-xl font-bold text-green-400">
                    {formatCurrency(results.laborSavingsPerYear)}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  20% reduction through automation
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Total Annual Savings</span>
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(results.totalSavingsPerYear)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Vibelux Investment</span>
                  <span className="text-lg text-gray-400">
                    -{formatCurrency(results.vibeluxCostPerYear)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <span className="text-lg font-semibold text-white">Net Annual ROI</span>
                  <span className="text-3xl font-bold text-green-400">
                    {formatCurrency(results.netROIPerYear)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-purple-900/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {results.paybackPeriodMonths.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-300">Months to Payback</div>
                </div>
                <div className="bg-green-900/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {formatCurrency(results.fiveYearROI)}
                  </div>
                  <div className="text-sm text-gray-300">5-Year ROI</div>
                </div>
              </div>

              <div className="bg-blue-900/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Leaf className="w-5 h-5 text-blue-400" />
                  <span className="text-lg font-semibold text-white">Environmental Impact</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {results.carbonReduction.toFixed(1)} tons CO₂
                </div>
                <div className="text-sm text-gray-400">Annual carbon reduction</div>
              </div>
            </div>

            <div className="pt-4">
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
                Start Saving Now
              </button>
              <p className="text-center text-sm text-gray-400 mt-2">
                No credit card required • 14-day free trial
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}