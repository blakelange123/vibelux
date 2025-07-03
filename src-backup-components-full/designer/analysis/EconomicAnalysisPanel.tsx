'use client';

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, Zap, Calendar, 
  BarChart3, PieChart, Calculator, Target,
  Lightbulb, Leaf, ArrowUp, ArrowDown,
  Info, Download, Share2, AlertTriangle
} from 'lucide-react';

interface EconomicAnalysisProps {
  fixtures: any[];
  room: { width: number; length: number; height: number };
  cropType?: string;
  electricityRate?: number; // $/kWh
  operatingHours?: number; // hours per day
}

interface CostBreakdown {
  equipment: number;
  installation: number;
  electrical: number;
  maintenance: number;
  total: number;
}

interface OperatingCosts {
  daily: number;
  monthly: number;
  annual: number;
  perSqFt: number;
}

interface ROIAnalysis {
  paybackPeriod: number; // months
  roi5Year: number; // percentage
  npv: number; // Net Present Value
  irr: number; // Internal Rate of Return
}

export function EconomicAnalysisPanel({ 
  fixtures, 
  room, 
  cropType = 'lettuce',
  electricityRate = 0.12,
  operatingHours = 18
}: EconomicAnalysisProps) {
  const [analysisSettings, setAnalysisSettings] = useState({
    electricityRate,
    operatingHours,
    cropType,
    laborCostPerSqFt: 15, // $/sq ft/year
    facilityCostPerSqFt: 25, // $/sq ft/year
    discountRate: 0.08, // 8% discount rate
    analysisYears: 5
  });

  // Calculate total fixture costs
  const costBreakdown = useMemo((): CostBreakdown => {
    let equipmentCost = 0;
    let totalWattage = 0;

    fixtures.forEach(fixture => {
      if (fixture.type === 'fixture' && fixture.enabled) {
        const wattage = fixture.wattage || fixture.model?.wattage || 200;
        const price = fixture.price || fixture.model?.price || wattage * 2.5; // Estimate $2.5/W
        
        equipmentCost += price * (fixture.quantity || 1);
        totalWattage += wattage * (fixture.quantity || 1);
      }
    });

    const facilityArea = room.width * room.length;
    const installationCost = equipmentCost * 0.3; // 30% of equipment cost
    const electricalCost = totalWattage * 0.5; // $0.5 per watt for electrical work
    const maintenanceCost = equipmentCost * 0.05; // 5% annually

    return {
      equipment: equipmentCost,
      installation: installationCost,
      electrical: electricalCost,
      maintenance: maintenanceCost,
      total: equipmentCost + installationCost + electricalCost
    };
  }, [fixtures, room]);

  // Calculate operating costs
  const operatingCosts = useMemo((): OperatingCosts => {
    let totalWattage = 0;
    
    fixtures.forEach(fixture => {
      if (fixture.type === 'fixture' && fixture.enabled) {
        const wattage = fixture.wattage || fixture.model?.wattage || 200;
        totalWattage += wattage * (fixture.quantity || 1) * (fixture.dimmingLevel || 100) / 100;
      }
    });

    const dailyKwh = (totalWattage / 1000) * analysisSettings.operatingHours;
    const dailyCost = dailyKwh * analysisSettings.electricityRate;
    const facilityArea = room.width * room.length;

    return {
      daily: dailyCost,
      monthly: dailyCost * 30,
      annual: dailyCost * 365,
      perSqFt: (dailyCost * 365) / facilityArea
    };
  }, [fixtures, room, analysisSettings]);

  // Calculate ROI based on crop yields
  const roiAnalysis = useMemo((): ROIAnalysis => {
    const facilityArea = room.width * room.length;
    
    // Crop-specific yield and pricing data
    const cropData: { [key: string]: { yield: number; price: number; cycles: number } } = {
      lettuce: { yield: 4.5, price: 2.5, cycles: 8 }, // lbs/sq ft/cycle, $/lb, cycles/year
      basil: { yield: 3.2, price: 8.0, cycles: 6 },
      tomato: { yield: 25, price: 4.0, cycles: 2.5 },
      strawberry: { yield: 8, price: 6.0, cycles: 2 },
      cannabis: { yield: 1.5, price: 2000, cycles: 4 }, // lbs/sq ft/cycle, $/lb
      microgreens: { yield: 2.8, price: 12, cycles: 12 }
    };

    const crop = cropData[analysisSettings.cropType] || cropData.lettuce;
    const annualRevenue = facilityArea * crop.yield * crop.price * crop.cycles;
    
    // Calculate total annual costs
    const annualOperatingCosts = operatingCosts.annual + 
                                costBreakdown.maintenance +
                                (facilityArea * analysisSettings.laborCostPerSqFt) +
                                (facilityArea * analysisSettings.facilityCostPerSqFt);
    
    const annualProfit = annualRevenue - annualOperatingCosts;
    const initialInvestment = costBreakdown.total;
    
    // Calculate payback period
    const paybackPeriod = annualProfit > 0 ? (initialInvestment / annualProfit) * 12 : Infinity;
    
    // Calculate 5-year ROI
    const totalProfit5Years = annualProfit * analysisSettings.analysisYears;
    const roi5Year = initialInvestment > 0 ? (totalProfit5Years / initialInvestment) * 100 : 0;
    
    // Calculate NPV (simplified)
    let npv = -initialInvestment;
    for (let year = 1; year <= analysisSettings.analysisYears; year++) {
      npv += annualProfit / Math.pow(1 + analysisSettings.discountRate, year);
    }
    
    // Estimate IRR (simplified approximation)
    const irr = annualProfit > 0 ? ((annualProfit / initialInvestment) * 100) : 0;

    return {
      paybackPeriod: Math.max(0, paybackPeriod),
      roi5Year,
      npv,
      irr
    };
  }, [costBreakdown, operatingCosts, analysisSettings, room]);

  return (
    <div className="h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Economic Analysis</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">ROI and cost analysis for your lighting design</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Settings Panel */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Analysis Parameters</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Electricity Rate ($/kWh)
              </label>
              <input
                type="number"
                step="0.01"
                value={analysisSettings.electricityRate}
                onChange={(e) => setAnalysisSettings(prev => ({ ...prev, electricityRate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Operating Hours/Day
              </label>
              <input
                type="number"
                value={analysisSettings.operatingHours}
                onChange={(e) => setAnalysisSettings(prev => ({ ...prev, operatingHours: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Crop Type
              </label>
              <select
                value={analysisSettings.cropType}
                onChange={(e) => setAnalysisSettings(prev => ({ ...prev, cropType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="lettuce">Lettuce</option>
                <option value="basil">Basil</option>
                <option value="tomato">Tomato</option>
                <option value="strawberry">Strawberry</option>
                <option value="cannabis">Cannabis</option>
                <option value="microgreens">Microgreens</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Analysis Period (Years)
              </label>
              <input
                type="number"
                value={analysisSettings.analysisYears}
                onChange={(e) => setAnalysisSettings(prev => ({ ...prev, analysisYears: parseInt(e.target.value) || 5 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Payback Period</h4>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {roiAnalysis.paybackPeriod === Infinity ? '∞' : `${roiAnalysis.paybackPeriod.toFixed(1)} months`}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Time to recover initial investment
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white">5-Year ROI</h4>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {roiAnalysis.roi5Year.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Return on investment over 5 years
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Initial Investment Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Equipment Costs</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${costBreakdown.equipment.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Installation & Electrical</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${(costBreakdown.installation + costBreakdown.electrical).toLocaleString()}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">Total Initial Cost</span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  ${costBreakdown.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Costs */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Operating Costs</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Daily Energy Cost</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${operatingCosts.daily.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Energy Cost</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${operatingCosts.monthly.toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Annual Energy Cost</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${operatingCosts.annual.toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cost per Sq Ft/Year</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${operatingCosts.perSqFt.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Metrics */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Advanced Financial Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Net Present Value (NPV)</div>
              <div className={`text-lg font-semibold ${roiAnalysis.npv >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ${roiAnalysis.npv.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Internal Rate of Return (IRR)</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {roiAnalysis.irr.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Investment Recommendations</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {roiAnalysis.paybackPeriod <= 24 && (
                  <li>✅ Excellent payback period - highly recommended investment</li>
                )}
                {roiAnalysis.paybackPeriod > 24 && roiAnalysis.paybackPeriod <= 48 && (
                  <li>⚠️ Moderate payback period - consider optimizing design</li>
                )}
                {roiAnalysis.paybackPeriod > 48 && (
                  <li>❌ Long payback period - review fixture selection and energy costs</li>
                )}
                {roiAnalysis.npv > 0 && (
                  <li>✅ Positive NPV indicates profitable investment</li>
                )}
                {operatingCosts.perSqFt > 2 && (
                  <li>⚠️ High operating costs - consider more efficient fixtures</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}