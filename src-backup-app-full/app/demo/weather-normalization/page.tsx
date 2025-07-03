'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Calculator, Cloud, TrendingUp, Info, 
  ThermometerSun, Droplets, Sun, Wind, Activity,
  CheckCircle, AlertCircle, BarChart3, Play
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts';

interface CalculationStep {
  step: number;
  title: string;
  description: string;
  formula?: string;
  result?: number | string;
  data?: any;
}

export default function WeatherNormalizationDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Sample data for demonstration
  const sampleMonth = {
    date: 'February 2024',
    actualConsumption: 95000, // kWh
    avgTemperature: 52, // °F (warmer than baseline)
    humidity: 65, // %
    production: 450, // lbs
    baseline: {
      avgTemperature: 45, // °F (typical February)
      humidity: 70, // %
      expectedConsumption: 115000 // kWh
    }
  };

  const regressionModel = {
    intercept: 80000,
    hddCoef: 150,
    cddCoef: 200,
    humidityCoef: 50,
    productionCoef: 25,
    rSquared: 0.87
  };

  const calculationSteps: CalculationStep[] = [
    {
      step: 1,
      title: 'Collect Weather Data',
      description: 'Gather temperature, humidity, and solar radiation data for the billing period',
      data: {
        temperature: sampleMonth.avgTemperature,
        humidity: sampleMonth.humidity,
        hdd: Math.max(0, 65 - sampleMonth.avgTemperature),
        cdd: Math.max(0, sampleMonth.avgTemperature - 65)
      }
    },
    {
      step: 2,
      title: 'Calculate Degree Days',
      description: 'Determine heating and cooling degree days based on 65°F base temperature',
      formula: 'HDD = max(0, 65 - Tavg), CDD = max(0, Tavg - 65)',
      data: {
        currentHDD: 13, // 65 - 52
        currentCDD: 0,
        baselineHDD: 20, // 65 - 45
        baselineCDD: 0
      }
    },
    {
      step: 3,
      title: 'Apply Regression Model',
      description: 'Use the baseline regression model to calculate weather adjustments',
      formula: 'Energy = β₀ + β₁(HDD) + β₂(CDD) + β₃(Humidity) + β₄(Production)',
      data: {
        hddAdjustment: (20 - 13) * regressionModel.hddCoef, // 1,050 kWh
        cddAdjustment: 0,
        humidityAdjustment: (70 - 65) * regressionModel.humidityCoef, // 250 kWh
        totalAdjustment: 1300
      }
    },
    {
      step: 4,
      title: 'Normalize Consumption',
      description: 'Adjust actual consumption to baseline weather conditions',
      formula: 'Normalized = Actual + Weather Adjustments',
      result: 96300, // 95,000 + 1,300
      data: {
        actual: 95000,
        weatherAdjustment: 1300,
        normalized: 96300
      }
    },
    {
      step: 5,
      title: 'Calculate Verified Savings',
      description: 'Compare normalized consumption to baseline expectation',
      formula: 'Savings = Baseline - Normalized',
      result: 18700, // 115,000 - 96,300
      data: {
        baseline: 115000,
        normalized: 96300,
        savings: 18700,
        savingsPercent: 16.3
      }
    },
    {
      step: 6,
      title: 'Verify with Confidence Interval',
      description: 'Apply statistical confidence based on model R² and data quality',
      formula: 'CI = Savings ± (Standard Error × 1.96)',
      data: {
        savings: 18700,
        standardError: 1200,
        lowerBound: 16348,
        upperBound: 21052,
        confidence: 94.7
      }
    }
  ];

  const runCalculation = () => {
    setIsCalculating(true);
    setActiveStep(0);
    
    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= calculationSteps.length - 1) {
          clearInterval(interval);
          setIsCalculating(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  // Generate regression visualization data
  const regressionData = Array.from({ length: 24 }, (_, i) => {
    const hdd = i * 10;
    const energy = regressionModel.intercept + (hdd * regressionModel.hddCoef);
    return {
      hdd,
      energy,
      actual: energy + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10000 - 5000)
    };
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Features
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Weather Normalization Calculator</h1>
              <p className="text-gray-400">
                Interactive demonstration of how weather-normalized energy savings are calculated
              </p>
            </div>
            <button
              onClick={runCalculation}
              disabled={isCalculating}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isCalculating ? (
                <>
                  <Activity className="w-5 h-5 animate-pulse" />
                  Calculating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run Calculation
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Example Scenario */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Example Scenario</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">Period</span>
              </div>
              <p className="text-white font-medium">{sampleMonth.date}</p>
              <p className="text-sm text-gray-500">Cannabis Facility, Sacramento</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">Actual Usage</span>
              </div>
              <p className="text-white font-medium">{sampleMonth.actualConsumption.toLocaleString()} kWh</p>
              <p className="text-sm text-gray-500">From utility bill</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ThermometerSun className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">Weather</span>
              </div>
              <p className="text-white font-medium">{sampleMonth.avgTemperature}°F avg</p>
              <p className="text-sm text-green-400">7°F warmer than baseline</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">Baseline Expected</span>
              </div>
              <p className="text-white font-medium">{sampleMonth.baseline.expectedConsumption.toLocaleString()} kWh</p>
              <p className="text-sm text-gray-500">Historical average</p>
            </div>
          </div>
        </div>

        {/* Calculation Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps List */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Calculation Steps</h3>
            <div className="space-y-3">
              {calculationSteps.map((step, index) => (
                <div
                  key={step.step}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    activeStep >= index
                      ? 'bg-gray-800 border-purple-500'
                      : 'bg-gray-900/50 border-gray-800 opacity-50'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activeStep > index
                        ? 'bg-green-500 text-white'
                        : activeStep === index
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {activeStep > index ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{step.step}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{step.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculation Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              {activeStep < calculationSteps.length && (
                <>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Step {calculationSteps[activeStep].step}: {calculationSteps[activeStep].title}
                  </h3>
                  
                  {calculationSteps[activeStep].formula && (
                    <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400 mb-2">Formula:</p>
                      <code className="text-purple-400 font-mono">
                        {calculationSteps[activeStep].formula}
                      </code>
                    </div>
                  )}

                  {/* Step-specific visualizations */}
                  {activeStep === 0 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Temperature</span>
                            <ThermometerSun className="w-5 h-5 text-orange-400" />
                          </div>
                          <p className="text-2xl font-bold text-white">{sampleMonth.avgTemperature}°F</p>
                          <p className="text-sm text-gray-500">7°F above baseline</p>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Humidity</span>
                            <Droplets className="w-5 h-5 text-blue-400" />
                          </div>
                          <p className="text-2xl font-bold text-white">{sampleMonth.humidity}%</p>
                          <p className="text-sm text-gray-500">5% below baseline</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <h4 className="text-sm text-gray-400 mb-2">Current Month</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-300">HDD</span>
                              <span className="text-white font-medium">13</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">CDD</span>
                              <span className="text-white font-medium">0</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <h4 className="text-sm text-gray-400 mb-2">Baseline Month</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-300">HDD</span>
                              <span className="text-white font-medium">20</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">CDD</span>
                              <span className="text-white font-medium">0</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                        <p className="text-sm text-blue-300">
                          The warmer weather (52°F vs 45°F) means fewer Heating Degree Days, 
                          which should result in lower energy consumption for heating.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="hdd" stroke="#9CA3AF" label={{ value: 'Heating Degree Days', position: 'insideBottom', offset: -5 }} />
                            <YAxis stroke="#9CA3AF" label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Scatter name="Historical Data" data={regressionData} fill="#3B82F6" />
                            <ReferenceLine 
                              x={13} 
                              stroke="#F97316" 
                              strokeDasharray="5 5" 
                              label="Current Month"
                            />
                            <ReferenceLine 
                              x={20} 
                              stroke="#10B981" 
                              strokeDasharray="5 5" 
                              label="Baseline"
                            />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">HDD Adjustment</p>
                          <p className="text-lg font-medium text-white">+1,050 kWh</p>
                        </div>
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Humidity Adjustment</p>
                          <p className="text-lg font-medium text-white">+250 kWh</p>
                        </div>
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Total Adjustment</p>
                          <p className="text-lg font-medium text-purple-400">+1,300 kWh</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="space-y-4">
                      <div className="relative p-6 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <p className="text-sm text-gray-400">Actual Consumption</p>
                            <p className="text-2xl font-bold text-blue-400">95,000 kWh</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-400">Weather Impact</p>
                            <p className="text-xl font-bold text-orange-400">+1,300 kWh</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Normalized</p>
                            <p className="text-2xl font-bold text-green-400">96,300 kWh</p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 top-1/2 flex items-center justify-center">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-0.5 bg-gray-600"></div>
                            <Calculator className="w-5 h-5 text-gray-400" />
                            <div className="w-16 h-0.5 bg-gray-600"></div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                        <p className="text-sm text-green-300">
                          The normalized consumption shows what energy use would have been under baseline weather conditions, 
                          enabling fair comparison.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeStep === 4 && (
                    <div className="space-y-4">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Baseline Expected', value: 115000, fill: '#6B7280' },
                            { name: 'Actual', value: 95000, fill: '#3B82F6' },
                            { name: 'Normalized', value: 96300, fill: '#8B5CF6' },
                            { name: 'Savings', value: 18700, fill: '#10B981' }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip />
                            <Bar dataKey="value" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-400 mb-2">Weather-Normalized Savings</p>
                          <p className="text-3xl font-bold text-green-400">18,700 kWh</p>
                          <p className="text-sm text-gray-500 mt-1">16.3% reduction</p>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-400 mb-2">Revenue Share (50%)</p>
                          <p className="text-3xl font-bold text-white">$1,122</p>
                          <p className="text-sm text-gray-500 mt-1">@ $0.12/kWh</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 5 && (
                    <div className="space-y-4">
                      <div className="p-6 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-medium">Statistical Confidence</h4>
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                            94.7% Confidence
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Point Estimate</span>
                            <span className="text-white font-medium">18,700 kWh</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">95% CI Lower Bound</span>
                            <span className="text-white">16,348 kWh</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">95% CI Upper Bound</span>
                            <span className="text-white">21,052 kWh</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Model R²</span>
                            <span className="text-white">0.87</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-purple-300 font-medium mb-1">
                              Verification Complete
                            </p>
                            <p className="text-sm text-gray-300">
                              The calculated savings of 18,700 kWh (16.3%) are statistically significant 
                              with 94.7% confidence. This weather-normalized result is ready for billing.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <Info className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Key Takeaways</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Why Weather Normalization Matters</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Removes weather volatility from savings calculations</li>
                    <li>• Enables fair month-to-month comparisons</li>
                    <li>• Provides statistical confidence in results</li>
                    <li>• Follows industry-standard IPMVP protocols</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Benefits for All Parties</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• <strong>Growers:</strong> Fair savings regardless of weather</li>
                    <li>• <strong>Investors:</strong> Predictable returns</li>
                    <li>• <strong>Utilities:</strong> Verified methodology</li>
                    <li>• <strong>Regulators:</strong> IPMVP compliance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}