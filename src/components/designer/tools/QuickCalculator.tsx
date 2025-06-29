'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, Zap, Sun, Target, TrendingUp, 
  Clock, DollarSign, Activity, CheckCircle,
  AlertTriangle, Info, Lightbulb, Grid3x3
} from 'lucide-react';

interface QuickCalcResult {
  ppfd: number;
  dli: number;
  uniformity: number;
  efficacy: number;
  powerDensity: number;
  coverage: number;
  dailyEnergyCost: number;
  annualEnergyCost: number;
  recommendation: string;
  status: 'excellent' | 'good' | 'warning' | 'poor';
}

export function QuickCalculator() {
  const [inputs, setInputs] = useState({
    roomWidth: 20,
    roomLength: 40,
    roomHeight: 10,
    fixtureWattage: 600,
    fixturePPF: 1600,
    fixtureCount: 12,
    mountingHeight: 7,
    photoperiod: 18,
    electricityRate: 0.12,
    cropType: 'lettuce'
  });

  const [result, setResult] = useState<QuickCalcResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Auto-calculate when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      performQuickCalculation();
    }, 300); // Debounce calculations

    return () => clearTimeout(timer);
  }, [inputs]);

  const performQuickCalculation = () => {
    setCalculating(true);
    
    // Simulate calculation time for visual feedback
    setTimeout(() => {
      const facilityArea = inputs.roomWidth * inputs.roomLength;
      const totalWattage = inputs.fixtureWattage * inputs.fixtureCount;
      const totalPPF = inputs.fixturePPF * inputs.fixtureCount;
      
      // Calculate PPFD using simplified photometric model
      const mountingHeightFromCanopy = inputs.mountingHeight - 0.5; // Assume 0.5ft canopy height
      const spreadArea = Math.PI * Math.pow(mountingHeightFromCanopy * 0.8, 2); // Approximate coverage area per fixture
      const effectiveArea = Math.min(facilityArea, spreadArea * inputs.fixtureCount);
      
      // Average PPFD calculation
      const avgPPFD = totalPPF / effectiveArea * 0.85; // 85% efficiency factor
      
      // DLI calculation
      const dli = (avgPPFD * inputs.photoperiod * 3600) / 1000000; // Convert to mol·m⁻²·d⁻¹
      
      // Estimate uniformity based on fixture spacing
      const optimalSpacing = mountingHeightFromCanopy * 1.2;
      const actualSpacing = Math.sqrt(facilityArea / inputs.fixtureCount);
      const uniformity = Math.max(0.4, 1 - Math.abs(actualSpacing - optimalSpacing) / optimalSpacing);
      
      // System efficacy
      const efficacy = totalPPF / totalWattage;
      
      // Power density
      const powerDensity = totalWattage / facilityArea;
      
      // Coverage percentage (simplified)
      const coverage = Math.min(100, (effectiveArea / facilityArea) * 100);
      
      // Energy costs
      const dailyKwh = (totalWattage / 1000) * inputs.photoperiod;
      const dailyEnergyCost = dailyKwh * inputs.electricityRate;
      const annualEnergyCost = dailyEnergyCost * 365;
      
      // Determine status and recommendation
      let status: 'excellent' | 'good' | 'warning' | 'poor' = 'good';
      let recommendation = '';
      
      // Crop-specific DLI targets
      const cropTargets: { [key: string]: { min: number; optimal: number; max: number } } = {
        lettuce: { min: 12, optimal: 14, max: 17 },
        basil: { min: 15, optimal: 18, max: 22 },
        tomato: { min: 20, optimal: 25, max: 35 },
        cannabis: { min: 25, optimal: 35, max: 45 },
        strawberry: { min: 16, optimal: 20, max: 25 }
      };
      
      const target = cropTargets[inputs.cropType] || cropTargets.lettuce;
      
      if (dli < target.min) {
        status = 'poor';
        recommendation = `DLI too low for ${inputs.cropType}. Add more fixtures or increase photoperiod.`;
      } else if (dli > target.max) {
        status = 'warning';
        recommendation = `DLI too high for ${inputs.cropType}. Reduce fixture count or add dimming.`;
      } else if (dli >= target.optimal * 0.9 && dli <= target.optimal * 1.1 && uniformity > 0.7) {
        status = 'excellent';
        recommendation = `Optimal lighting design for ${inputs.cropType} cultivation.`;
      } else if (uniformity < 0.6) {
        status = 'warning';
        recommendation = 'Poor uniformity. Adjust fixture spacing or add more fixtures.';
      } else if (efficacy < 2.5) {
        status = 'warning';
        recommendation = 'Low efficacy fixtures. Consider upgrading to more efficient LEDs.';
      } else {
        status = 'good';
        recommendation = `Good lighting design with room for optimization.`;
      }
      
      setResult({
        ppfd: Math.round(avgPPFD),
        dli: Math.round(dli * 10) / 10,
        uniformity: Math.round(uniformity * 100) / 100,
        efficacy: Math.round(efficacy * 10) / 10,
        powerDensity: Math.round(powerDensity * 10) / 10,
        coverage: Math.round(coverage),
        dailyEnergyCost: Math.round(dailyEnergyCost * 100) / 100,
        annualEnergyCost: Math.round(annualEnergyCost),
        recommendation,
        status
      });
      
      setCalculating(false);
    }, 150);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case 'good': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
      case 'poor': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-5 h-5" />;
      case 'good': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'poor': return <AlertTriangle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Calculator</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Instant lighting calculations without complex setup
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Input Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Design Parameters</h3>
          
          <div className="space-y-4">
            {/* Room Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Dimensions (ft)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Width"
                  value={inputs.roomWidth}
                  onChange={(e) => setInputs(prev => ({ ...prev, roomWidth: parseFloat(e.target.value) || 0 }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="number"
                  placeholder="Length"
                  value={inputs.roomLength}
                  onChange={(e) => setInputs(prev => ({ ...prev, roomLength: parseFloat(e.target.value) || 0 }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="number"
                  placeholder="Height"
                  value={inputs.roomHeight}
                  onChange={(e) => setInputs(prev => ({ ...prev, roomHeight: parseFloat(e.target.value) || 0 }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Fixture Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fixture Wattage
                </label>
                <input
                  type="number"
                  value={inputs.fixtureWattage}
                  onChange={(e) => setInputs(prev => ({ ...prev, fixtureWattage: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fixture PPF
                </label>
                <input
                  type="number"
                  value={inputs.fixturePPF}
                  onChange={(e) => setInputs(prev => ({ ...prev, fixturePPF: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fixture Count
                </label>
                <input
                  type="number"
                  value={inputs.fixtureCount}
                  onChange={(e) => setInputs(prev => ({ ...prev, fixtureCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mounting Height (ft)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.mountingHeight}
                  onChange={(e) => setInputs(prev => ({ ...prev, mountingHeight: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Growing Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Crop Type
                </label>
                <select
                  value={inputs.cropType}
                  onChange={(e) => setInputs(prev => ({ ...prev, cropType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="lettuce">Lettuce</option>
                  <option value="basil">Basil</option>
                  <option value="tomato">Tomato</option>
                  <option value="cannabis">Cannabis</option>
                  <option value="strawberry">Strawberry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Photoperiod (hours)
                </label>
                <input
                  type="number"
                  value={inputs.photoperiod}
                  onChange={(e) => setInputs(prev => ({ ...prev, photoperiod: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Electricity Rate ($/kWh)
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.electricityRate}
                onChange={(e) => setInputs(prev => ({ ...prev, electricityRate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className={`w-5 h-5 ${calculating ? 'text-blue-600 animate-spin' : 'text-green-600'}`} />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {calculating ? 'Calculating...' : 'Results'}
              </h3>
            </div>

            {/* Status Banner */}
            <div className={`rounded-xl p-4 border mb-4 ${getStatusColor(result.status)}`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)} Design
                  </div>
                  <div className="text-sm mt-1">
                    {result.recommendation}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg PPFD</span>
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {result.ppfd} μmol/m²/s
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-1">
                  <Sun className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">DLI</span>
                </div>
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {result.dli} mol/m²/d
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <Grid3x3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uniformity</span>
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {(result.uniformity * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Efficacy</span>
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {result.efficacy} μmol/J
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Power Density</span>
                <span className="font-medium text-gray-900 dark:text-white">{result.powerDensity} W/ft²</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Coverage</span>
                <span className="font-medium text-gray-900 dark:text-white">{result.coverage}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Daily Energy Cost</span>
                <span className="font-medium text-gray-900 dark:text-white">${result.dailyEnergyCost}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Annual Energy Cost</span>
                <span className="font-medium text-gray-900 dark:text-white">${result.annualEnergyCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}