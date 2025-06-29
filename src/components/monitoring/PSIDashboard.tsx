'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Droplets,
  Thermometer,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  Settings,
  Download,
  Zap,
  Beaker,
  Gauge
} from 'lucide-react';
import { Line, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { 
  PhotobiologyStressIndex, 
  PSIResult, 
  calculateRealTimePSI 
} from '@/lib/photobiology-stress-index';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

interface PSIDashboardProps {
  zone?: string;
  sensorData?: any;
  plantData?: any;
}

export function PSIDashboard({ zone = 'all', sensorData, plantData }: PSIDashboardProps) {
  const [currentPSI, setCurrentPSI] = useState<PSIResult | null>(null);
  const [psiHistory, setPsiHistory] = useState<PSIResult[]>([]);
  const [historicalAnalysis, setHistoricalAnalysis] = useState<any>(null);
  const [updateInterval, setUpdateInterval] = useState(60); // seconds

  // Calculate PSI with real or mock data
  useEffect(() => {
    const calculatePSI = () => {
      // Use provided data or generate mock data
      const mockSensorData = sensorData || {
        ppfd: 600 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200,
        dli: 25 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
        photoperiod: 12,
        spectrum: {
          red: 35,
          blue: 25,
          farRed: 5,
          uv: 2
        },
        vpd: 1.0 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4,
        temperature: 24 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
        leafTemperature: 22 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
        co2: 800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200,
        humidity: 55 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
        ec: 1.4 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4,
        ph: 5.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4,
        nitrogen: 140 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40,
        phosphorus: 45 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
        potassium: 180 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40,
        calcium: 90 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30,
        magnesium: 45 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
        sulfur: 25 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10
      };

      const mockPlantData = plantData || {
        growthStage: 'flowering',
        cultivar: 'Blue Dream',
        chlorophyllContent: 38 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8,
        photosynthesisRate: 18 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 6,
        stomataConductance: 180 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40,
        sapFlow: 35 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
        leafWaterPotential: -0.9 - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4
      };

      const psiResult = calculateRealTimePSI(mockSensorData, mockPlantData);
      setCurrentPSI(psiResult);
      
      // Add to history
      setPsiHistory(prev => {
        const updated = [...prev, psiResult];
        // Keep last 24 hours of data (assuming 1-minute intervals)
        return updated.slice(-1440);
      });
    };

    // Initial calculation
    calculatePSI();

    // Set up interval
    const interval = setInterval(calculatePSI, updateInterval * 1000);
    return () => clearInterval(interval);
  }, [updateInterval, sensorData, plantData]);

  // Analyze historical data
  useEffect(() => {
    if (psiHistory.length > 10) {
      const psiCalculator = new PhotobiologyStressIndex();
      const analysis = psiCalculator.trackPSIHistory(psiHistory);
      setHistoricalAnalysis(analysis);
    }
  }, [psiHistory]);

  const getStressColor = (score: number): string => {
    if (score < 15) return 'text-green-400';
    if (score < 30) return 'text-yellow-400';
    if (score < 50) return 'text-orange-400';
    if (score < 70) return 'text-red-400';
    return 'text-red-600';
  };

  const getStressBgColor = (score: number): string => {
    if (score < 15) return 'bg-green-900/20 border-green-700';
    if (score < 30) return 'bg-yellow-900/20 border-yellow-700';
    if (score < 50) return 'bg-orange-900/20 border-orange-700';
    if (score < 70) return 'bg-red-900/20 border-red-700';
    return 'bg-red-900/30 border-red-600';
  };

  const getRadarData = () => {
    if (!currentPSI) return null;

    return {
      labels: ['Light', 'VPD', 'Nutrients', 'Temperature', 'Water'],
      datasets: [{
        label: 'Stress Level',
        data: [
          currentPSI.components.lightStress.score,
          currentPSI.components.vpdStress.score,
          currentPSI.components.nutrientStress.score,
          currentPSI.components.thermalStress.score,
          currentPSI.components.waterStress.score
        ],
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(168, 85, 247, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(168, 85, 247, 1)'
      }]
    };
  };

  const getHistoryChartData = () => {
    const labels = psiHistory.slice(-60).map((_, i) => `${60 - i}m ago`);
    const data = psiHistory.slice(-60).map(r => r.overallPSI);

    return {
      labels,
      datasets: [{
        label: 'PSI Score',
        data,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4
      }]
    };
  };

  if (!currentPSI) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading PSI data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Gauge className="w-6 h-6 text-purple-400" />
              Photobiology Stress Index (PSI)
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Multimodal plant health KPI combining light, VPD, nutrients, and environmental factors
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={updateInterval}
              onChange={(e) => setUpdateInterval(Number(e.target.value))}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value={60}>1 min</option>
              <option value={300}>5 min</option>
              <option value={900}>15 min</option>
              <option value={3600}>1 hour</option>
            </select>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Overall PSI Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-lg border ${getStressBgColor(currentPSI.overallPSI)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Overall PSI Score</h3>
              {historicalAnalysis && (
                <div className="flex items-center gap-1">
                  {historicalAnalysis.trend === 'improving' && (
                    <TrendingDown className="w-5 h-5 text-green-400" />
                  )}
                  {historicalAnalysis.trend === 'declining' && (
                    <TrendingUp className="w-5 h-5 text-red-400" />
                  )}
                  {historicalAnalysis.trend === 'stable' && (
                    <Activity className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${getStressColor(currentPSI.overallPSI)}`}>
                {currentPSI.overallPSI.toFixed(1)}
              </span>
              <span className="text-gray-400 text-lg">/100</span>
            </div>
            <p className={`mt-2 text-sm font-medium ${getStressColor(currentPSI.overallPSI)}`}>
              {currentPSI.stressCategory.toUpperCase()} STRESS
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Primary stressor: {currentPSI.primaryStressor}
            </p>
          </div>

          {/* Predicted Impact */}
          <div className="p-6 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Predicted Impact</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Yield Reduction</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-red-500 h-2 rounded-full"
                      style={{ width: `${currentPSI.predictedImpact.yieldReduction}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {currentPSI.predictedImpact.yieldReduction.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Quality Impact</p>
                <p className="text-sm text-white mt-1">{currentPSI.predictedImpact.qualityImpact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Recovery Time</p>
                <p className="text-sm text-white mt-1">{currentPSI.predictedImpact.recoveryTime} hours</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-6 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Recommendations</h3>
            <div className="space-y-2">
              {currentPSI.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stress Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Stress Component Analysis</h3>
          <div className="h-80">
            <Radar 
              data={getRadarData()!} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      color: 'gray',
                      backdropColor: 'transparent'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    pointLabels: {
                      color: 'white',
                      font: {
                        size: 12
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Historical Trend */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">PSI Trend (Last Hour)</h3>
          <div className="h-80">
            <Line 
              data={getHistoryChartData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    ticks: { 
                      color: 'gray',
                      maxTicksLimit: 8
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  },
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: 'gray' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Component Breakdown */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Component Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Light Stress */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-5 h-5 text-yellow-400" />
              <h4 className="font-medium text-white">Light Stress</h4>
            </div>
            <p className={`text-2xl font-bold ${getStressColor(currentPSI.components.lightStress.score)}`}>
              {currentPSI.components.lightStress.score.toFixed(0)}%
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Intensity</span>
                <span className="text-white">{currentPSI.components.lightStress.factors.intensity.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Photoperiod</span>
                <span className="text-white">{currentPSI.components.lightStress.factors.photoperiod.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Spectrum</span>
                <span className="text-white">{currentPSI.components.lightStress.factors.spectrum.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">DLI</span>
                <span className="text-white">{currentPSI.components.lightStress.factors.dli.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* VPD Stress */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-5 h-5 text-blue-400" />
              <h4 className="font-medium text-white">VPD Stress</h4>
            </div>
            <p className={`text-2xl font-bold ${getStressColor(currentPSI.components.vpdStress.score)}`}>
              {currentPSI.components.vpdStress.score.toFixed(0)}%
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Current</span>
                <span className="text-white">{currentPSI.components.vpdStress.factors.current.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Leaf-Air</span>
                <span className="text-white">{currentPSI.components.vpdStress.factors.leafAirDiff.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Transpiration</span>
                <span className="text-white">{currentPSI.components.vpdStress.factors.transpirationLoad.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Nutrient Stress */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Beaker className="w-5 h-5 text-green-400" />
              <h4 className="font-medium text-white">Nutrient Stress</h4>
            </div>
            <p className={`text-2xl font-bold ${getStressColor(currentPSI.components.nutrientStress.score)}`}>
              {currentPSI.components.nutrientStress.score.toFixed(0)}%
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Availability</span>
                <span className="text-white">{currentPSI.components.nutrientStress.factors.availability.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Balance</span>
                <span className="text-white">{currentPSI.components.nutrientStress.factors.balance.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deficiency</span>
                <span className="text-white">{currentPSI.components.nutrientStress.factors.deficiency.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Toxicity</span>
                <span className="text-white">{currentPSI.components.nutrientStress.factors.toxicity.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Thermal Stress */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Thermometer className="w-5 h-5 text-red-400" />
              <h4 className="font-medium text-white">Thermal Stress</h4>
            </div>
            <p className={`text-2xl font-bold ${getStressColor(currentPSI.components.thermalStress.score)}`}>
              {currentPSI.components.thermalStress.score.toFixed(0)}%
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Ambient</span>
                <span className="text-white">{currentPSI.components.thermalStress.factors.ambient.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Leaf</span>
                <span className="text-white">{currentPSI.components.thermalStress.factors.leaf.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Root Zone</span>
                <span className="text-white">{currentPSI.components.thermalStress.factors.rootZone.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Water Stress */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-purple-400" />
              <h4 className="font-medium text-white">Water Stress</h4>
            </div>
            <p className={`text-2xl font-bold ${getStressColor(currentPSI.components.waterStress.score)}`}>
              {currentPSI.components.waterStress.score.toFixed(0)}%
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">VPD</span>
                <span className="text-white">{currentPSI.components.waterStress.factors.vpd.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Potential</span>
                <span className="text-white">{currentPSI.components.waterStress.factors.waterPotential.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hydraulic</span>
                <span className="text-white">{currentPSI.components.waterStress.factors.hydraulic.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 rounded-lg border border-blue-800 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-white mb-1">About PSI</h4>
            <p className="text-sm text-gray-300">
              The Photobiology Stress Index (PSI) is a proprietary multimodal KPI that combines light, VPD, 
              photoperiod, nutrient, thermal, and water stress factors into a single comprehensive metric. 
              PSI values below 30 indicate optimal conditions, while values above 50 suggest intervention is needed.
              The system continuously learns and adapts weights based on growth stage and cultivar-specific responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}