'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Lightbulb,
  Zap,
  Target,
  TrendingUp,
  Settings,
  Calculator,
  Activity,
  AlertTriangle,
  CheckCircle,
  Sun,
  Thermometer,
  BarChart3,
  Sliders,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart,
  Bar
} from 'recharts';

interface FixtureControl {
  id: string;
  name: string;
  zone: string;
  currentDimming: number; // 0-100%
  maxPPFD: number;
  x: number;
  y: number;
  enabled: boolean;
}

interface RTROptimizationResult {
  targetRTR: number;
  currentRTR: number;
  requiredPPFDChange: number;
  suggestedDimming: number;
  temperatureAdjustment: number;
  expectedBalance: 'optimal' | 'vegetative' | 'generative';
  energySavings: number; // watts
  recommendations: string[];
}

interface LightingScenario {
  name: string;
  description: string;
  fixtures: { id: string; dimming: number }[];
  expectedRTR: number;
  energyUsage: number;
  plantBalance: string;
}

export function RTRLightingIntegration() {
  const [fixtures, setFixtures] = useState<FixtureControl[]>([]);
  const [currentTemperature, setCurrentTemperature] = useState(22.5);
  const [currentPPFD, setCurrentPPFD] = useState(450);
  const [targetRTR, setTargetRTR] = useState(1.5);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<RTROptimizationResult | null>(null);
  const [lightingScenarios] = useState<LightingScenario[]>([
    {
      name: 'Morning Startup',
      description: 'Gradual ramp-up for optimal plant response',
      fixtures: [
        { id: 'zone1', dimming: 60 },
        { id: 'zone2', dimming: 55 },
        { id: 'zone3', dimming: 65 }
      ],
      expectedRTR: 1.4,
      energyUsage: 1250,
      plantBalance: 'Optimal'
    },
    {
      name: 'Peak Production',
      description: 'Maximum PPFD for high-production periods',
      fixtures: [
        { id: 'zone1', dimming: 95 },
        { id: 'zone2', dimming: 90 },
        { id: 'zone3', dimming: 100 }
      ],
      expectedRTR: 1.8,
      energyUsage: 2100,
      plantBalance: 'Generative'
    },
    {
      name: 'Energy Save',
      description: 'Reduced lighting while maintaining plant balance',
      fixtures: [
        { id: 'zone1', dimming: 40 },
        { id: 'zone2', dimming: 35 },
        { id: 'zone3', dimming: 45 }
      ],
      expectedRTR: 1.2,
      energyUsage: 850,
      plantBalance: 'Vegetative'
    },
    {
      name: 'Night Cycle',
      description: 'Minimal lighting for security/monitoring',
      fixtures: [
        { id: 'zone1', dimming: 5 },
        { id: 'zone2', dimming: 0 },
        { id: 'zone3', dimming: 5 }
      ],
      expectedRTR: 0.5,
      energyUsage: 120,
      plantBalance: 'Rest'
    }
  ]);

  // Initialize mock fixtures
  useEffect(() => {
    const mockFixtures: FixtureControl[] = [
      {
        id: 'zone1',
        name: 'Zone 1 - North',
        zone: 'north',
        currentDimming: 75,
        maxPPFD: 800,
        x: 10,
        y: 10,
        enabled: true
      },
      {
        id: 'zone2',
        name: 'Zone 2 - Center',
        zone: 'center',
        currentDimming: 80,
        maxPPFD: 900,
        x: 20,
        y: 15,
        enabled: true
      },
      {
        id: 'zone3',
        name: 'Zone 3 - South',
        zone: 'south',
        currentDimming: 70,
        maxPPFD: 850,
        x: 30,
        y: 20,
        enabled: true
      }
    ];
    setFixtures(mockFixtures);
  }, []);

  // Calculate current RTR
  const currentRTR = useMemo(() => {
    if (currentPPFD === 0) return 0;
    return currentTemperature / (currentPPFD / 100);
  }, [currentTemperature, currentPPFD]);

  // RTR optimization algorithm
  const optimizeRTR = () => {
    const targetPPFD = (currentTemperature / targetRTR) * 100;
    const ppfdChange = targetPPFD - currentPPFD;
    const percentageChange = (ppfdChange / currentPPFD) * 100;
    
    // Calculate new dimming levels
    const avgDimming = fixtures.reduce((sum, f) => sum + f.currentDimming, 0) / fixtures.length;
    const newDimming = Math.max(0, Math.min(100, avgDimming + percentageChange));
    
    // Estimate energy savings
    const currentPower = fixtures.reduce((sum, f) => sum + (f.maxPPFD * (f.currentDimming / 100) * 1.5), 0);
    const newPower = fixtures.reduce((sum, f) => sum + (f.maxPPFD * (newDimming / 100) * 1.5), 0);
    const energySavings = currentPower - newPower;
    
    // Determine expected plant balance
    let expectedBalance: RTROptimizationResult['expectedBalance'] = 'optimal';
    if (targetRTR < 1.2) expectedBalance = 'vegetative';
    else if (targetRTR > 1.8) expectedBalance = 'generative';
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (ppfdChange > 100) {
      recommendations.push('Increase lighting gradually over 30 minutes');
      recommendations.push('Monitor plant response for stress indicators');
    } else if (ppfdChange < -100) {
      recommendations.push('Reduce lighting gradually to prevent shock');
      recommendations.push('Consider increasing temperature slightly');
    }
    
    if (energySavings > 100) {
      recommendations.push(`Energy savings: ${energySavings.toFixed(0)}W`);
    } else if (energySavings < -100) {
      recommendations.push(`Additional energy required: ${Math.abs(energySavings).toFixed(0)}W`);
    }
    
    const result: RTROptimizationResult = {
      targetRTR,
      currentRTR,
      requiredPPFDChange: ppfdChange,
      suggestedDimming: newDimming,
      temperatureAdjustment: 0,
      expectedBalance,
      energySavings,
      recommendations
    };
    
    setOptimizationResult(result);
  };

  // Apply lighting scenario
  const applyScenario = (scenario: LightingScenario) => {
    const updatedFixtures = fixtures.map(fixture => {
      const scenarioFixture = scenario.fixtures.find(sf => sf.id === fixture.id);
      return scenarioFixture 
        ? { ...fixture, currentDimming: scenarioFixture.dimming }
        : fixture;
    });
    
    setFixtures(updatedFixtures);
    
    // Update current PPFD based on new dimming levels
    const newPPFD = updatedFixtures.reduce((sum, f) => {
      return sum + (f.maxPPFD * (f.currentDimming / 100));
    }, 0) / updatedFixtures.length;
    
    setCurrentPPFD(newPPFD);
  };

  // Update individual fixture dimming
  const updateFixtureDimming = (fixtureId: string, dimming: number) => {
    const updatedFixtures = fixtures.map(f => 
      f.id === fixtureId ? { ...f, currentDimming: dimming } : f
    );
    setFixtures(updatedFixtures);
    
    // Recalculate current PPFD
    const newPPFD = updatedFixtures.reduce((sum, f) => {
      return sum + (f.maxPPFD * (f.currentDimming / 100));
    }, 0) / updatedFixtures.length;
    
    setCurrentPPFD(newPPFD);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">RTR Lighting Integration</h1>
            <p className="text-gray-400">Optimize lighting for ideal plant balance using RTR methodology</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Auto Optimize:</span>
            <button
              onClick={() => setAutoOptimize(!autoOptimize)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoOptimize ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoOptimize ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <button
            onClick={optimizeRTR}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            Optimize RTR
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="font-semibold">Current RTR</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {currentRTR.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {currentRTR >= 1.2 && currentRTR <= 1.8 ? 'Optimal Range' : 
             currentRTR < 1.2 ? 'Vegetative' : 'Generative'}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Thermometer className="w-5 h-5 text-red-400" />
            <span className="font-semibold">Temperature</span>
          </div>
          <div className="text-3xl font-bold text-red-400">
            {currentTemperature.toFixed(1)}°C
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="range"
              min="18"
              max="28"
              step="0.1"
              value={currentTemperature}
              onChange={(e) => setCurrentTemperature(parseFloat(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sun className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold">Average PPFD</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            {currentPPFD.toFixed(0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            μmol/m²/s
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-green-400" />
            <span className="font-semibold">Target RTR</span>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {targetRTR.toFixed(1)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.1"
              value={targetRTR}
              onChange={(e) => setTargetRTR(parseFloat(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Optimization Results */}
      {optimizationResult && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            RTR Optimization Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Required Changes</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">PPFD Adjustment:</span>
                  <span className={optimizationResult.requiredPPFDChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {optimizationResult.requiredPPFDChange >= 0 ? '+' : ''}
                    {optimizationResult.requiredPPFDChange.toFixed(0)} μmol/m²/s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Suggested Dimming:</span>
                  <span className="text-blue-400">{optimizationResult.suggestedDimming.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Energy Impact:</span>
                  <span className={optimizationResult.energySavings >= 0 ? 'text-green-400' : 'text-orange-400'}>
                    {optimizationResult.energySavings >= 0 ? '-' : '+'}
                    {Math.abs(optimizationResult.energySavings).toFixed(0)}W
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Expected Outcome</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Plant Balance:</span>
                  <span className={`capitalize ${
                    optimizationResult.expectedBalance === 'optimal' ? 'text-green-400' :
                    optimizationResult.expectedBalance === 'vegetative' ? 'text-blue-400' :
                    'text-yellow-400'
                  }`}>
                    {optimizationResult.expectedBalance}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current RTR:</span>
                  <span className="text-gray-300">{optimizationResult.currentRTR.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Target RTR:</span>
                  <span className="text-green-400">{optimizationResult.targetRTR.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Recommendations</h4>
              <div className="space-y-2">
                {optimizationResult.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixture Controls */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          Lighting Zone Controls
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fixtures.map(fixture => (
            <div key={fixture.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{fixture.name}</span>
                <div className={`w-3 h-3 rounded-full ${fixture.enabled ? 'bg-green-400' : 'bg-gray-500'}`} />
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Dimming</span>
                    <span className="text-sm text-blue-400">{fixture.currentDimming}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={fixture.currentDimming}
                    onChange={(e) => updateFixtureDimming(fixture.id, parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current PPFD:</span>
                  <span className="text-yellow-400">
                    {(fixture.maxPPFD * (fixture.currentDimming / 100)).toFixed(0)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Max PPFD:</span>
                  <span className="text-gray-300">{fixture.maxPPFD}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lighting Scenarios */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Preset Lighting Scenarios
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {lightingScenarios.map(scenario => (
            <div key={scenario.name} className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2">{scenario.name}</h4>
              <p className="text-sm text-gray-400 mb-3">{scenario.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Expected RTR:</span>
                  <span className="text-blue-400">{scenario.expectedRTR}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Energy Usage:</span>
                  <span className="text-green-400">{scenario.energyUsage}W</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Plant Balance:</span>
                  <span className="text-yellow-400">{scenario.plantBalance}</span>
                </div>
              </div>
              
              <button
                onClick={() => applyScenario(scenario)}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm"
              >
                Apply Scenario
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}