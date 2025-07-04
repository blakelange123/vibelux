'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, ThermometerSun, Lightbulb, TrendingDown, Settings, Activity } from 'lucide-react';

interface LightBurnData {
  ppfdLevel: number;
  leafTemperature: number;
  airTemperature: number;
  humidity: number;
  co2Level: number;
  plantSpecies: string;
  growthStage: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number;
  recommendations: string[];
}

interface LightBurnThresholds {
  species: string;
  maxPPFD: {
    seedling: number;
    vegetative: number;
    flowering: number;
    fruiting: number;
  };
  leafTempThreshold: number;
  adaptationRate: number; // µmol/m²/s per day
}

const LIGHT_BURN_THRESHOLDS: LightBurnThresholds[] = [
  {
    species: 'lettuce',
    maxPPFD: { seedling: 150, vegetative: 250, flowering: 200, fruiting: 200 },
    leafTempThreshold: 28,
    adaptationRate: 25
  },
  {
    species: 'tomato',
    maxPPFD: { seedling: 200, vegetative: 400, flowering: 600, fruiting: 500 },
    leafTempThreshold: 32,
    adaptationRate: 50
  },
  {
    species: 'cannabis',
    maxPPFD: { seedling: 200, vegetative: 600, flowering: 1000, fruiting: 800 },
    leafTempThreshold: 30,
    adaptationRate: 75
  },
  {
    species: 'basil',
    maxPPFD: { seedling: 150, vegetative: 300, flowering: 250, fruiting: 250 },
    leafTempThreshold: 29,
    adaptationRate: 30
  },
  {
    species: 'strawberry',
    maxPPFD: { seedling: 180, vegetative: 350, flowering: 400, fruiting: 450 },
    leafTempThreshold: 27,
    adaptationRate: 40
  }
];

interface LightBurnPreventionSystemProps {
  currentConditions: {
    ppfd: number;
    airTemp: number;
    humidity: number;
    co2: number;
  };
  plantData: {
    species: string;
    growthStage: string;
    daysUnderLight: number;
  };
  onAutoDimming?: (newIntensity: number) => void;
  onAlert?: (alert: { level: string; message: string }) => void;
}

export function LightBurnPreventionSystem({
  currentConditions,
  plantData,
  onAutoDimming,
  onAlert
}: LightBurnPreventionSystemProps) {
  const [lightBurnData, setLightBurnData] = useState<LightBurnData | null>(null);
  const [autoDimmingEnabled, setAutoDimmingEnabled] = useState(true);
  const [adaptationProgress, setAdaptationProgress] = useState(0);
  const [alertHistory, setAlertHistory] = useState<Array<{timestamp: Date, level: string, message: string}>>([]);

  // Calculate leaf temperature based on PPFD and environmental conditions
  const calculateLeafTemperature = useCallback((ppfd: number, airTemp: number, humidity: number): number => {
    // Simplified leaf energy balance model
    // Higher PPFD increases leaf temperature above air temperature
    const radiativeHeating = (ppfd / 100) * 0.8; // ~0.8°C per 100 µmol/m²/s
    const evaporativeCooling = (100 - humidity) / 100 * 2; // Transpiration cooling
    
    return airTemp + radiativeHeating - evaporativeCooling;
  }, []);

  // Calculate light burn risk based on multiple factors
  const calculateLightBurnRisk = useCallback((
    ppfd: number,
    leafTemp: number,
    species: string,
    growthStage: string,
    co2: number,
    daysUnderLight: number
  ): { riskLevel: LightBurnData['riskLevel'], riskScore: number, recommendations: string[] } => {
    const thresholds = LIGHT_BURN_THRESHOLDS.find(t => t.species === species) || LIGHT_BURN_THRESHOLDS[0];
    const maxPPFD = thresholds.maxPPFD[growthStage as keyof typeof thresholds.maxPPFD] || thresholds.maxPPFD.vegetative;
    
    let riskScore = 0;
    const recommendations: string[] = [];

    // PPFD risk factor (0-40 points)
    const ppfdRatio = ppfd / maxPPFD;
    if (ppfdRatio > 1.2) {
      riskScore += 40;
      recommendations.push(`PPFD too high: ${ppfd.toFixed(0)} µmol/m²/s exceeds safe limit of ${maxPPFD} µmol/m²/s`);
    } else if (ppfdRatio > 1.0) {
      riskScore += 25;
      recommendations.push(`PPFD at upper limit. Consider gradual reduction.`);
    } else if (ppfdRatio > 0.8) {
      riskScore += 10;
    }

    // Leaf temperature risk factor (0-30 points)
    if (leafTemp > thresholds.leafTempThreshold + 3) {
      riskScore += 30;
      recommendations.push(`Critical leaf temperature: ${leafTemp.toFixed(1)}°C. Immediate cooling required.`);
    } else if (leafTemp > thresholds.leafTempThreshold) {
      riskScore += 15;
      recommendations.push(`Elevated leaf temperature: ${leafTemp.toFixed(1)}°C. Monitor closely.`);
    }

    // CO2 compensation (can allow higher light levels with higher CO2)
    if (co2 > 800) {
      riskScore -= 10; // CO2 enrichment allows higher light tolerance
    } else if (co2 < 400) {
      riskScore += 10; // Low CO2 increases light stress risk
      recommendations.push('Low CO2 levels increase light stress sensitivity.');
    }

    // Adaptation factor (plants gradually adapt to higher light levels)
    const adaptationFactor = Math.min(daysUnderLight * thresholds.adaptationRate / 7, thresholds.adaptationRate);
    const adaptationDiscount = (adaptationFactor / thresholds.adaptationRate) * 15;
    riskScore -= adaptationDiscount;

    // Calculate adaptation progress
    setAdaptationProgress((adaptationFactor / thresholds.adaptationRate) * 100);

    // Determine risk level
    let riskLevel: LightBurnData['riskLevel'];
    if (riskScore >= 60) {
      riskLevel = 'critical';
      recommendations.unshift('CRITICAL: Immediate light reduction required to prevent permanent damage.');
    } else if (riskScore >= 40) {
      riskLevel = 'high';
      recommendations.unshift('HIGH RISK: Reduce light intensity by 20-30%.');
    } else if (riskScore >= 20) {
      riskLevel = 'moderate';
      recommendations.unshift('MODERATE RISK: Monitor closely and consider slight intensity reduction.');
    } else {
      riskLevel = 'low';
      if (recommendations.length === 0) {
        recommendations.push('Light levels are within safe parameters.');
      }
    }

    return { riskLevel, riskScore: Math.max(0, riskScore), recommendations };
  }, []);

  // Auto-dimming logic
  const handleAutoDimming = useCallback((riskLevel: LightBurnData['riskLevel'], riskScore: number) => {
    if (!autoDimmingEnabled || !onAutoDimming) return;

    let targetReduction = 0;
    if (riskLevel === 'critical') {
      targetReduction = 0.4; // 40% reduction
    } else if (riskLevel === 'high') {
      targetReduction = 0.25; // 25% reduction
    } else if (riskLevel === 'moderate') {
      targetReduction = 0.15; // 15% reduction
    }

    if (targetReduction > 0) {
      const newIntensity = Math.max(0.3, 1 - targetReduction); // Never go below 30%
      onAutoDimming(newIntensity);
      
      const alert = {
        level: riskLevel,
        message: `Auto-dimming activated: Reduced to ${(newIntensity * 100).toFixed(0)}% intensity due to ${riskLevel} light burn risk.`
      };
      
      onAlert?.(alert);
      setAlertHistory(prev => [{ ...alert, timestamp: new Date() }, ...prev.slice(0, 9)]);
    }
  }, [autoDimmingEnabled, onAutoDimming, onAlert]);

  // Main risk calculation effect
  useEffect(() => {
    const leafTemp = calculateLeafTemperature(
      currentConditions.ppfd,
      currentConditions.airTemp,
      currentConditions.humidity
    );

    const { riskLevel, riskScore, recommendations } = calculateLightBurnRisk(
      currentConditions.ppfd,
      leafTemp,
      plantData.species,
      plantData.growthStage,
      currentConditions.co2,
      plantData.daysUnderLight
    );

    const burnData: LightBurnData = {
      ppfdLevel: currentConditions.ppfd,
      leafTemperature: leafTemp,
      airTemperature: currentConditions.airTemp,
      humidity: currentConditions.humidity,
      co2Level: currentConditions.co2,
      plantSpecies: plantData.species,
      growthStage: plantData.growthStage,
      riskLevel,
      riskScore,
      recommendations
    };

    setLightBurnData(burnData);
    handleAutoDimming(riskLevel, riskScore);
  }, [currentConditions, plantData, calculateLeafTemperature, calculateLightBurnRisk, handleAutoDimming]);

  const getRiskColor = (level: LightBurnData['riskLevel']) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-400/20';
      case 'moderate': return 'text-yellow-400 bg-yellow-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/20';
      case 'critical': return 'text-red-400 bg-red-400/20';
    }
  };

  const getRiskIcon = (level: LightBurnData['riskLevel']) => {
    switch (level) {
      case 'low': return <Shield className="w-5 h-5" />;
      case 'moderate': return <Activity className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <ThermometerSun className="w-5 h-5" />;
    }
  };

  if (!lightBurnData) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Light Burn Prevention</h2>
            <p className="text-sm text-gray-400">Real-time protection for {plantData.species} ({plantData.growthStage})</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={autoDimmingEnabled}
              onChange={(e) => setAutoDimmingEnabled(e.target.checked)}
              className="rounded"
            />
            Auto-Dimming
          </label>
        </div>
      </div>

      {/* Risk Status */}
      <div className={`p-4 rounded-lg border ${getRiskColor(lightBurnData.riskLevel)} border-current/30`}>
        <div className="flex items-center gap-3 mb-2">
          {getRiskIcon(lightBurnData.riskLevel)}
          <div>
            <h3 className="font-semibold">
              {lightBurnData.riskLevel.toUpperCase()} RISK - Score: {lightBurnData.riskScore.toFixed(0)}/100
            </h3>
            <p className="text-sm opacity-90">
              PPFD: {lightBurnData.ppfdLevel.toFixed(0)} µmol/m²/s | Leaf Temp: {lightBurnData.leafTemperature.toFixed(1)}°C
            </p>
          </div>
        </div>
      </div>

      {/* Environmental Conditions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">PPFD</span>
          </div>
          <div className="text-lg font-semibold text-white">{lightBurnData.ppfdLevel.toFixed(0)}</div>
          <div className="text-xs text-gray-400">µmol/m²/s</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <ThermometerSun className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Leaf Temp</span>
          </div>
          <div className="text-lg font-semibold text-white">{lightBurnData.leafTemperature.toFixed(1)}°C</div>
          <div className="text-xs text-gray-400">Air: {lightBurnData.airTemperature}°C</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Humidity</span>
          </div>
          <div className="text-lg font-semibold text-white">{lightBurnData.humidity}%</div>
          <div className="text-xs text-gray-400">RH</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">CO₂</span>
          </div>
          <div className="text-lg font-semibold text-white">{lightBurnData.co2Level}</div>
          <div className="text-xs text-gray-400">ppm</div>
        </div>
      </div>

      {/* Light Adaptation Progress */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white">Light Adaptation Progress</h3>
          <span className="text-sm text-gray-400">{adaptationProgress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-green-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, adaptationProgress)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Plants adapt to higher light levels over {plantData.daysUnderLight} days under current conditions
        </p>
      </div>

      {/* Recommendations */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-3">Recommendations</h3>
        <div className="space-y-2">
          {lightBurnData.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-300">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alert History */}
      {alertHistory.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Recent Alerts</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {alertHistory.map((alert, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <span className="text-gray-500">{alert.timestamp.toLocaleTimeString()}</span>
                <span className={`font-medium ${
                  alert.level === 'critical' ? 'text-red-400' :
                  alert.level === 'high' ? 'text-orange-400' :
                  alert.level === 'moderate' ? 'text-yellow-400' : 'text-blue-400'
                }`}>
                  {alert.level.toUpperCase()}
                </span>
                <span className="text-gray-300">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}