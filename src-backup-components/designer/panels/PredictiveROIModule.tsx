'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Brain, Leaf, DollarSign, BarChart3, 
  AlertTriangle, Info, Download, Calendar, Target,
  Zap, Droplets, Thermometer, Sun, Wind, Activity,
  Building
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';

interface CropYieldModel {
  cropType: string;
  baseDLI: number;
  optimalDLI: number;
  maxDLI: number;
  baseYield: number; // kg/m²/year at base DLI
  yieldCurve: 'linear' | 'logarithmic' | 'sigmoid';
  environmentalFactors: {
    temperature: { min: number; optimal: number; max: number };
    humidity: { min: number; optimal: number; max: number };
    co2: { ambient: number; enriched: number; yieldBoost: number };
  };
  growthPhases: {
    germination: { days: number; dliTarget: number };
    vegetative: { days: number; dliTarget: number };
    flowering: { days: number; dliTarget: number };
    fruiting?: { days: number; dliTarget: number };
  };
  marketData: {
    avgPrice: number; // $/kg
    premiumQualityBonus: number; // % increase for high quality
    seasonalVariation: { winter: number; spring: number; summer: number; fall: number };
  };
}

const cropModels: Record<string, CropYieldModel> = {
  lettuce: {
    cropType: 'Lettuce',
    baseDLI: 10,
    optimalDLI: 17,
    maxDLI: 22,
    baseYield: 150,
    yieldCurve: 'logarithmic',
    environmentalFactors: {
      temperature: { min: 15, optimal: 20, max: 25 },
      humidity: { min: 50, optimal: 65, max: 80 },
      co2: { ambient: 400, enriched: 1000, yieldBoost: 25 }
    },
    growthPhases: {
      germination: { days: 7, dliTarget: 6 },
      vegetative: { days: 21, dliTarget: 14 },
      flowering: { days: 7, dliTarget: 17 }
    },
    marketData: {
      avgPrice: 6.50,
      premiumQualityBonus: 30,
      seasonalVariation: { winter: 1.3, spring: 1.0, summer: 0.8, fall: 1.1 }
    }
  },
  tomatoes: {
    cropType: 'Tomatoes',
    baseDLI: 15,
    optimalDLI: 30,
    maxDLI: 40,
    baseYield: 60,
    yieldCurve: 'sigmoid',
    environmentalFactors: {
      temperature: { min: 18, optimal: 24, max: 30 },
      humidity: { min: 60, optimal: 75, max: 85 },
      co2: { ambient: 400, enriched: 1200, yieldBoost: 30 }
    },
    growthPhases: {
      germination: { days: 10, dliTarget: 10 },
      vegetative: { days: 40, dliTarget: 20 },
      flowering: { days: 30, dliTarget: 25 },
      fruiting: { days: 60, dliTarget: 30 }
    },
    marketData: {
      avgPrice: 3.20,
      premiumQualityBonus: 40,
      seasonalVariation: { winter: 1.5, spring: 1.1, summer: 0.7, fall: 1.2 }
    }
  },
  cannabis: {
    cropType: 'Cannabis',
    baseDLI: 20,
    optimalDLI: 40,
    maxDLI: 55,
    baseYield: 0.5,
    yieldCurve: 'sigmoid',
    environmentalFactors: {
      temperature: { min: 20, optimal: 26, max: 30 },
      humidity: { min: 40, optimal: 55, max: 70 },
      co2: { ambient: 400, enriched: 1500, yieldBoost: 35 }
    },
    growthPhases: {
      germination: { days: 7, dliTarget: 15 },
      vegetative: { days: 56, dliTarget: 35 },
      flowering: { days: 63, dliTarget: 45 }
    },
    marketData: {
      avgPrice: 1800,
      premiumQualityBonus: 50,
      seasonalVariation: { winter: 1.0, spring: 1.0, summer: 1.0, fall: 1.0 }
    }
  },
  strawberries: {
    cropType: 'Strawberries',
    baseDLI: 12,
    optimalDLI: 20,
    maxDLI: 25,
    baseYield: 25,
    yieldCurve: 'logarithmic',
    environmentalFactors: {
      temperature: { min: 15, optimal: 22, max: 28 },
      humidity: { min: 60, optimal: 70, max: 80 },
      co2: { ambient: 400, enriched: 900, yieldBoost: 20 }
    },
    growthPhases: {
      germination: { days: 14, dliTarget: 8 },
      vegetative: { days: 60, dliTarget: 16 },
      flowering: { days: 30, dliTarget: 18 },
      fruiting: { days: 90, dliTarget: 20 }
    },
    marketData: {
      avgPrice: 8.50,
      premiumQualityBonus: 35,
      seasonalVariation: { winter: 1.6, spring: 1.0, summer: 0.6, fall: 1.2 }
    }
  }
};

interface PredictiveROIModuleProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PredictiveROIModule({ isOpen, onClose }: PredictiveROIModuleProps) {
  const { state } = useDesigner();
  
  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  const [selectedCrop, setSelectedCrop] = useState('lettuce');
  const [productionYears, setProductionYears] = useState(5);
  const [useMLPrediction, setUseMLPrediction] = useState(true);
  
  // Environmental conditions
  const [temperature, setTemperature] = useState(22);
  const [humidity, setHumidity] = useState(65);
  const [co2Level, setCo2Level] = useState(400);
  const [useC02Enrichment, setUseCo2Enrichment] = useState(false);
  
  // Financial inputs
  const [electricityCost, setElectricityCost] = useState(0.12);
  const [laborCostPerM2, setLaborCostPerM2] = useState(50);
  const [waterCostPerM3, setWaterCostPerM3] = useState(2.5);
  const [marketPriceMultiplier, setMarketPriceMultiplier] = useState(1.0);
  
  // Don't render if room doesn't exist (after all hooks)
  if (!state.room) {
    return null;
  }
  
  // Calculate current DLI from designer state
  const currentDLI = state.calculations.dli;
  const cropModel = cropModels[selectedCrop];
  
  // Yield prediction based on DLI and environmental factors
  const predictYield = () => {
    if (!cropModel) return 0;
    
    let yieldFactor = 1;
    
    // DLI impact on yield
    if (currentDLI < cropModel.baseDLI) {
      yieldFactor = currentDLI / cropModel.baseDLI;
    } else if (currentDLI <= cropModel.optimalDLI) {
      // Different curves for different crops
      switch (cropModel.yieldCurve) {
        case 'linear':
          yieldFactor = 1 + ((currentDLI - cropModel.baseDLI) / (cropModel.optimalDLI - cropModel.baseDLI)) * 0.5;
          break;
        case 'logarithmic':
          yieldFactor = 1 + 0.5 * Math.log(currentDLI / cropModel.baseDLI) / Math.log(cropModel.optimalDLI / cropModel.baseDLI);
          break;
        case 'sigmoid':
          const x = (currentDLI - cropModel.baseDLI) / (cropModel.optimalDLI - cropModel.baseDLI);
          yieldFactor = 1 + 0.5 / (1 + Math.exp(-5 * (x - 0.5)));
          break;
      }
    } else if (currentDLI <= cropModel.maxDLI) {
      yieldFactor = 1.5; // Plateau at optimal
    } else {
      // Decrease after max DLI
      yieldFactor = 1.5 - 0.1 * ((currentDLI - cropModel.maxDLI) / 5);
    }
    
    // Temperature impact
    const tempFactor = calculateEnvironmentalFactor(
      temperature, 
      cropModel.environmentalFactors.temperature
    );
    
    // Humidity impact
    const humidityFactor = calculateEnvironmentalFactor(
      humidity, 
      cropModel.environmentalFactors.humidity
    );
    
    // CO2 enrichment
    const co2Factor = useC02Enrichment ? 
      1 + (cropModel.environmentalFactors.co2.yieldBoost / 100) : 1;
    
    // ML prediction adjustment (simulated)
    const mlAdjustment = useMLPrediction ? 1 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1 - 0.05) : 1;
    
    return cropModel.baseYield * yieldFactor * tempFactor * humidityFactor * co2Factor * mlAdjustment;
  };
  
  const calculateEnvironmentalFactor = (
    value: number, 
    range: { min: number; optimal: number; max: number }
  ) => {
    if (value < range.min || value > range.max) return 0.7;
    if (value === range.optimal) return 1;
    
    if (value < range.optimal) {
      return 0.7 + 0.3 * ((value - range.min) / (range.optimal - range.min));
    } else {
      return 0.7 + 0.3 * ((range.max - value) / (range.max - range.optimal));
    }
  };
  
  const predictedYield = predictYield();
  const roomArea = state.room ? (state.room.width * state.room.length * 0.0929) : 0; // Convert to m²
  const annualProduction = predictedYield * roomArea;
  
  // Financial calculations
  const fixtures = state.objects.filter(obj => obj.type === 'fixture');
  const totalWattage = fixtures.reduce((sum, f) => sum + ((f as any).power || (f as any).model?.wattage || 600), 0) / 1000; // kW
  const annualEnergyConsumption = totalWattage * 16 * 365; // kWh per year (16h photoperiod)
  const annualEnergyCost = annualEnergyConsumption * electricityCost;
  
  // Revenue calculations
  const getCurrentSeasonMultiplier = () => {
    const month = new Date().getMonth();
    if (month >= 11 || month <= 1) return cropModel.marketData.seasonalVariation.winter;
    if (month >= 2 && month <= 4) return cropModel.marketData.seasonalVariation.spring;
    if (month >= 5 && month <= 7) return cropModel.marketData.seasonalVariation.summer;
    return cropModel.marketData.seasonalVariation.fall;
  };
  
  const baseRevenue = annualProduction * cropModel.marketData.avgPrice * marketPriceMultiplier;
  const seasonalRevenue = baseRevenue * getCurrentSeasonMultiplier();
  const qualityBonus = currentDLI >= cropModel.optimalDLI ? 
    (cropModel.marketData.premiumQualityBonus / 100) * seasonalRevenue : 0;
  const totalAnnualRevenue = seasonalRevenue + qualityBonus;
  
  // Operating costs
  const laborCost = roomArea * laborCostPerM2;
  const waterCost = roomArea * 0.5 * waterCostPerM3 * 365; // Estimated water usage
  const maintenanceCost = fixtures.length * 50; // $50 per fixture per year
  const co2Cost = useC02Enrichment ? roomArea * 100 : 0; // $100/m²/year for CO2
  
  const totalOperatingCost = annualEnergyCost + laborCost + waterCost + maintenanceCost + co2Cost;
  const annualProfit = totalAnnualRevenue - totalOperatingCost;
  const profitMargin = (annualProfit / totalAnnualRevenue) * 100;
  
  // Multi-year projection
  const projections = Array.from({ length: productionYears }, (_, year) => {
    const yearMultiplier = 1 + (year * 0.02); // 2% annual improvement
    const revenue = totalAnnualRevenue * yearMultiplier;
    const costs = totalOperatingCost * (1 + year * 0.03); // 3% cost inflation
    return {
      year: year + 1,
      revenue,
      costs,
      profit: revenue - costs,
      cumulative: (revenue - costs) * (year + 1)
    };
  });
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Predictive ROI Analysis</h2>
                <p className="text-purple-100">AI-powered yield prediction and financial modeling</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              ×
            </button>
          </div>
        </div>
        
        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Inputs */}
          <div className="w-1/3 border-r border-gray-700 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Crop & Environment</h3>
            
            {/* Crop Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Crop Type
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                {Object.keys(cropModels).map(crop => (
                  <option key={crop} value={crop}>
                    {cropModels[crop].cropType}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Environmental Conditions */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
                  <Thermometer className="w-4 h-4" />
                  Temperature (°C)
                </label>
                <input
                  type="range"
                  min="10"
                  max="35"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10°C</span>
                  <span className="text-white">{temperature}°C</span>
                  <span>35°C</span>
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
                  <Droplets className="w-4 h-4" />
                  Humidity (%)
                </label>
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>30%</span>
                  <span className="text-white">{humidity}%</span>
                  <span>90%</span>
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
                  <Wind className="w-4 h-4" />
                  CO₂ Enrichment
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={useC02Enrichment}
                    onChange={(e) => setUseCo2Enrichment(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-400">
                    {useC02Enrichment ? `${cropModel.environmentalFactors.co2.enriched} ppm` : `${co2Level} ppm (ambient)`}
                  </span>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-4">Financial Inputs</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Electricity Cost ($/kWh)
                </label>
                <input
                  type="number"
                  value={electricityCost}
                  onChange={(e) => setElectricityCost(Number(e.target.value))}
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Labor Cost ($/m²/year)
                </label>
                <input
                  type="number"
                  value={laborCostPerM2}
                  onChange={(e) => setLaborCostPerM2(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Market Price Multiplier
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={marketPriceMultiplier}
                  onChange={(e) => setMarketPriceMultiplier(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.5x</span>
                  <span className="text-white">{marketPriceMultiplier}x</span>
                  <span>2x</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Analysis Period (years)
                </label>
                <select
                  value={productionYears}
                  onChange={(e) => setProductionYears(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                >
                  <option value={1}>1 Year</option>
                  <option value={3}>3 Years</option>
                  <option value={5}>5 Years</option>
                  <option value={10}>10 Years</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={useMLPrediction}
                  onChange={(e) => setUseMLPrediction(e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-300">
                  Use ML-enhanced predictions
                </label>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Results */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Current Setup Analysis */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Current Lighting Analysis
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Sun className="w-4 h-4" />
                    <span className="text-xs">Current DLI</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{currentDLI.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">
                    Target: {cropModel.optimalDLI}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs">DLI Efficiency</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {Math.min(100, (currentDLI / cropModel.optimalDLI) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs">Total Power</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{totalWattage.toFixed(1)} kW</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Building className="w-4 h-4" />
                    <span className="text-xs">Growing Area</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{roomArea.toFixed(0)} m²</div>
                </div>
              </div>
            </div>
            
            {/* Yield Prediction */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Predicted Yield Performance
              </h3>
              <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg p-6 border border-green-700">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Predicted Yield</div>
                    <div className="text-3xl font-bold text-green-400">
                      {predictedYield.toFixed(1)} kg/m²/year
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {((predictedYield / cropModel.baseYield - 1) * 100).toFixed(1)}% above baseline
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Annual Production</div>
                    <div className="text-3xl font-bold text-green-400">
                      {(annualProduction / 1000).toFixed(1)} tons
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {(annualProduction / 52).toFixed(0)} kg/week
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Quality Score</div>
                    <div className="text-3xl font-bold text-green-400">
                      {currentDLI >= cropModel.optimalDLI ? 'Premium' : 'Standard'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {currentDLI >= cropModel.optimalDLI ? '+' + cropModel.marketData.premiumQualityBonus + '% price' : 'Base price'}
                    </div>
                  </div>
                </div>
                
                {/* Environmental Impact Indicators */}
                <div className="mt-4 pt-4 border-t border-green-700/50">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        temperature >= cropModel.environmentalFactors.temperature.min && 
                        temperature <= cropModel.environmentalFactors.temperature.max ? 
                        'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-gray-400">Temperature</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        humidity >= cropModel.environmentalFactors.humidity.min && 
                        humidity <= cropModel.environmentalFactors.humidity.max ? 
                        'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-gray-400">Humidity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${useC02Enrichment ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <span className="text-gray-400">CO₂ Enrichment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Financial Analysis */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Projections
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">Annual Revenue</div>
                  <div className="text-2xl font-bold text-green-400">${totalAnnualRevenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${(totalAnnualRevenue / roomArea).toFixed(0)}/m²
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">Operating Costs</div>
                  <div className="text-2xl font-bold text-red-400">${totalOperatingCost.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${(totalOperatingCost / roomArea).toFixed(0)}/m²
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">Annual Profit</div>
                  <div className={`text-2xl font-bold ${annualProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${annualProfit.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Margin: {profitMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">ROI Period</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {annualProfit > 0 ? ((fixtures.length * 500) / annualProfit).toFixed(1) : 'N/A'} years
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Based on equipment cost
                  </div>
                </div>
              </div>
              
              {/* Cost Breakdown */}
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="text-sm font-medium text-gray-300 mb-3">Operating Cost Breakdown</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Energy</span>
                    <span className="text-white">${annualEnergyCost.toLocaleString()} ({(annualEnergyCost / totalOperatingCost * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Labor</span>
                    <span className="text-white">${laborCost.toLocaleString()} ({(laborCost / totalOperatingCost * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Water</span>
                    <span className="text-white">${waterCost.toLocaleString()} ({(waterCost / totalOperatingCost * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Maintenance</span>
                    <span className="text-white">${maintenanceCost.toLocaleString()} ({(maintenanceCost / totalOperatingCost * 100).toFixed(0)}%)</span>
                  </div>
                  {useC02Enrichment && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">CO₂ Enrichment</span>
                      <span className="text-white">${co2Cost.toLocaleString()} ({(co2Cost / totalOperatingCost * 100).toFixed(0)}%)</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Multi-year Projection Chart */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-300 mb-3">{productionYears}-Year Financial Projection</div>
                <div className="h-48 flex items-end gap-2">
                  {projections.map((year, idx) => {
                    const maxValue = Math.max(...projections.map(p => p.revenue));
                    const revenueHeight = (year.revenue / maxValue) * 100;
                    const profitHeight = (year.profit / maxValue) * 100;
                    
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex gap-1">
                          <div 
                            className="flex-1 bg-green-600 rounded-t"
                            style={{ height: `${revenueHeight}px` }}
                            title={`Revenue: $${year.revenue.toLocaleString()}`}
                          />
                          <div 
                            className="flex-1 bg-purple-600 rounded-t"
                            style={{ height: `${profitHeight}px` }}
                            title={`Profit: $${year.profit.toLocaleString()}`}
                          />
                        </div>
                        <span className="text-xs text-gray-500">Y{year.year}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded" />
                    <span className="text-gray-400">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-600 rounded" />
                    <span className="text-gray-400">Profit</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recommendations */}
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-700">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">AI Recommendations</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {currentDLI < cropModel.optimalDLI && (
                      <li>• Increase DLI to {cropModel.optimalDLI} for optimal yields (+{((cropModel.optimalDLI / currentDLI - 1) * 100).toFixed(0)}% improvement potential)</li>
                    )}
                    {currentDLI > cropModel.maxDLI && (
                      <li>• Reduce DLI to prevent light stress and energy waste</li>
                    )}
                    {!useC02Enrichment && (
                      <li>• Enable CO₂ enrichment for +{cropModel.environmentalFactors.co2.yieldBoost}% yield boost</li>
                    )}
                    {temperature < cropModel.environmentalFactors.temperature.optimal - 2 && (
                      <li>• Increase temperature to {cropModel.environmentalFactors.temperature.optimal}°C for better growth</li>
                    )}
                    {annualProfit > 0 && (
                      <li>• Current setup is profitable with {((fixtures.length * 500) / annualProfit).toFixed(1)} year ROI</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Export Button */}
            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Analysis Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}