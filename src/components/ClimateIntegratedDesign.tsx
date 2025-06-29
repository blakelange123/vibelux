'use client';

import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Zap, 
  Target, 
  TrendingUp,
  AlertCircle,
  Info,
  Calculator,
  Fan,
  Settings,
  Eye,
  EyeOff,
  Building2
} from 'lucide-react';
import { HVACSystemSelector, type HVACSystemType } from './HVACSystemSelector';

interface ClimateImpactResults {
  // Heat loads from lighting
  sensibleHeatLoad: number; // watts
  latentHeatRequired: number; // watts from transpiration
  totalHeatLoad: number; // watts
  
  // Environmental requirements
  coolingRequired: number; // watts
  dehumidificationRequired: number; // L/day
  ventilationRequired: number; // m³/h
  
  // Energy impact
  dailyCoolingEnergy: number; // kWh/day
  dailyVentilationEnergy: number; // kWh/day
  totalEnvironmentalEnergy: number; // kWh/day
  annualEnvironmentalCost: number; // $/year
  
  // Environmental conditions
  estimatedRoomTemperature: number; // °C
  estimatedHumidity: number; // %
  estimatedVPD: number; // kPa
  
  // Recommendations
  alerts: string[];
  recommendations: string[];
}

interface LightingDesignData {
  roomWidth: number;
  roomLength: number;
  roomHeight: number;
  totalLightingPower: number;
  averagePPFD: number;
  fixtureCount: number;
  operatingHours: number;
  targetTemperature: number;
  targetHumidity: number;
  cropType: 'leafy' | 'fruiting' | 'herbs' | 'ornamental';
}

interface ClimateIntegratedDesignProps {
  lightingData?: LightingDesignData;
  onClimateUpdate?: (results: ClimateImpactResults) => void;
}

const defaultLightingData: LightingDesignData = {
  roomWidth: 10,
  roomLength: 10,
  roomHeight: 3,
  totalLightingPower: 1000,
  averagePPFD: 400,
  fixtureCount: 4,
  operatingHours: 18,
  targetTemperature: 25,
  targetHumidity: 65,
  cropType: 'leafy'
};

export function ClimateIntegratedDesign({ lightingData = defaultLightingData, onClimateUpdate }: ClimateIntegratedDesignProps) {
  const [showClimatePanel, setShowClimatePanel] = useState(true);
  const [showHVACSelector, setShowHVACSelector] = useState(false);
  const [selectedHVACSystem, setSelectedHVACSystem] = useState<HVACSystemType | null>(null);
  const [climateResults, setClimateResults] = useState<ClimateImpactResults | null>(null);
  const [advancedSettings, setAdvancedSettings] = useState({
    outsideTemperature: 25,
    outsideHumidity: 60,
    transpirationRate: 3.5, // L/m²/day
    lightingEfficiency: 2.8, // μmol/J
    safetyFactor: 1.2,
    electricityRate: 0.12 // $/kWh
  });

  // Calculate climate impact based on lighting design
  const calculateClimateImpact = (): ClimateImpactResults => {
    // Ensure we have valid data
    if (!lightingData) {
      return {
        sensibleHeatLoad: 0,
        latentHeatRequired: 0,
        totalHeatLoad: 0,
        coolingRequired: 0,
        dehumidificationRequired: 0,
        ventilationRequired: 0,
        dailyCoolingEnergy: 0,
        dailyVentilationEnergy: 0,
        totalEnvironmentalEnergy: 0,
        annualEnvironmentalCost: 0,
        estimatedRoomTemperature: 25,
        estimatedHumidity: 60,
        estimatedVPD: 1.0,
        alerts: [],
        recommendations: []
      };
    }
    
    const { roomWidth, roomLength, roomHeight, totalLightingPower, operatingHours, targetTemperature, targetHumidity, cropType } = lightingData;
    const floorArea = roomWidth * roomLength; // m²
    const roomVolume = floorArea * roomHeight; // m³
    
    // Convert units if needed (assuming input is in feet, convert to meters)
    const floorAreaM2 = floorArea * 0.092903; // ft² to m²
    const roomVolumeM3 = roomVolume * 0.0283168; // ft³ to m³
    
    // Heat load from lighting
    const photonEfficiency = Math.min(advancedSettings.lightingEfficiency / 4.6, 1.0);
    const lightingHeatConversion = 1 - photonEfficiency;
    const sensibleHeatFromLighting = totalLightingPower * lightingHeatConversion;
    
    // Additional heat sources
    const additionalHeat = totalLightingPower * 0.1; // 10% from ballasts, fans
    const sensibleHeatLoad = sensibleHeatFromLighting + additionalHeat;
    
    // Latent heat from transpiration
    const latentHeatOfVaporization = 2260; // kJ/kg
    const transpirationKgPerDay = (advancedSettings.transpirationRate * floorAreaM2) / 1000;
    const transpirationKgPerHour = transpirationKgPerDay / 24;
    const latentHeatRequired = transpirationKgPerHour * latentHeatOfVaporization * 1000 / 3600; // watts
    
    const totalHeatLoad = sensibleHeatLoad + latentHeatRequired;
    
    // Cooling requirements
    const coolingRequired = totalHeatLoad * advancedSettings.safetyFactor;
    
    // Dehumidification requirements (L/day)
    const dehumidificationRequired = advancedSettings.transpirationRate * floorAreaM2 * 1.2;
    
    // Ventilation requirements (m³/h)
    const baseVentilation = roomVolumeM3 * 6; // 6 ACH minimum
    const ventilationRequired = baseVentilation;
    
    // Energy calculations
    const coolingCOP = 3.5; // Typical for efficient cooling
    const dailyCoolingEnergy = (coolingRequired / 1000) * operatingHours / coolingCOP;
    
    const fanPower = ventilationRequired * 0.3; // W per m³/h
    const dailyVentilationEnergy = (fanPower / 1000) * 24;
    
    const totalEnvironmentalEnergy = dailyCoolingEnergy + dailyVentilationEnergy;
    const annualEnvironmentalCost = totalEnvironmentalEnergy * 365 * advancedSettings.electricityRate;
    
    // Environmental condition estimates
    const heatDensity = totalHeatLoad / floorAreaM2; // W/m²
    const temperatureRise = Math.min(heatDensity / 150, 8); // Simplified estimate
    const estimatedRoomTemperature = targetTemperature + temperatureRise;
    
    const humidityIncrease = Math.min((dehumidificationRequired / roomVolumeM3) * 5, 15);
    const estimatedHumidity = Math.min(targetHumidity + humidityIncrease, 90);
    
    // VPD calculation
    const saturationPressure = 0.6108 * Math.exp(17.27 * estimatedRoomTemperature / (estimatedRoomTemperature + 237.3));
    const actualPressure = saturationPressure * (estimatedHumidity / 100);
    const estimatedVPD = saturationPressure - actualPressure;
    
    // Alerts and recommendations
    const alerts: string[] = [];
    const recommendations: string[] = [];
    
    if (heatDensity > 400) {
      alerts.push('Very high heat density - significant cooling required');
    } else if (heatDensity > 250) {
      alerts.push('High heat density - monitor cooling capacity');
    }
    
    if (estimatedVPD > 1.6) {
      alerts.push('VPD may be too high - plants could experience stress');
    } else if (estimatedVPD < 0.6) {
      alerts.push('VPD may be too low - reduced transpiration expected');
    }
    
    if (totalEnvironmentalEnergy > totalLightingPower / 1000 * operatingHours * 0.5) {
      alerts.push('Environmental energy > 50% of lighting energy');
    }
    
    // Recommendations based on crop type
    const cropOptimalRanges = {
      leafy: { tempMax: 24, rhMax: 70, vpdMax: 1.0 },
      fruiting: { tempMax: 28, rhMax: 75, vpdMax: 1.2 },
      herbs: { tempMax: 26, rhMax: 70, vpdMax: 1.1 },
      ornamental: { tempMax: 25, rhMax: 65, vpdMax: 0.9 }
    };
    
    const cropRange = cropOptimalRanges[cropType];
    
    if (estimatedRoomTemperature > cropRange.tempMax) {
      recommendations.push(`Consider increasing cooling capacity for ${cropType} crops`);
    }
    
    if (estimatedHumidity > cropRange.rhMax) {
      recommendations.push(`Increase dehumidification for optimal ${cropType} conditions`);
    }
    
    if (estimatedVPD > cropRange.vpdMax) {
      recommendations.push(`Lower VPD by increasing humidity or reducing temperature`);
    }
    
    if (coolingRequired > 15000) {
      recommendations.push('Consider multiple smaller HVAC units for redundancy');
    }
    
    if (totalEnvironmentalEnergy > 50) {
      recommendations.push('Environmental energy consumption is significant - optimize schedules');
    }
    
    recommendations.push('Monitor actual conditions and adjust as needed');
    recommendations.push('Consider heat recovery systems for energy efficiency');
    
    if (recommendations.length === 0) {
      recommendations.push('Climate design appears well-balanced');
    }

    return {
      sensibleHeatLoad,
      latentHeatRequired,
      totalHeatLoad,
      coolingRequired,
      dehumidificationRequired,
      ventilationRequired,
      dailyCoolingEnergy,
      dailyVentilationEnergy,
      totalEnvironmentalEnergy,
      annualEnvironmentalCost,
      estimatedRoomTemperature,
      estimatedHumidity,
      estimatedVPD,
      alerts,
      recommendations
    };
  };

  // Update calculations when lighting data or settings change
  useEffect(() => {
    const results = calculateClimateImpact();
    setClimateResults(results);
    onClimateUpdate?.(results);
  }, [lightingData, advancedSettings]);

  const formatNumber = (value: number, decimals: number = 1): string => {
    return value.toFixed(decimals);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!climateResults) return null;

  return (
    <div className="space-y-4">
      {/* Climate Impact Toggle */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
        <button
          onClick={() => setShowClimatePanel(!showClimatePanel)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Wind className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Climate Impact Analysis</h3>
              <p className="text-sm text-gray-400">Environmental requirements for your lighting design</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {climateResults.alerts.length > 0 && (
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            )}
            {showClimatePanel ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
          </div>
        </button>
      </div>

      {showClimatePanel && (
        <div className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Heat Load */}
            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-xl rounded-xl p-4 border border-orange-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-200">Heat Load</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(climateResults.totalHeatLoad / 1000)} kW</p>
              <p className="text-xs text-orange-300">
                {formatNumber(climateResults.totalHeatLoad / (lightingData.roomWidth * lightingData.roomLength * 0.092903))} W/m²
              </p>
            </div>

            {/* Cooling Required */}
            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Fan className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-200">Cooling</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(climateResults.coolingRequired / 1000)} kW</p>
              <p className="text-xs text-blue-300">
                {formatNumber(climateResults.coolingRequired / 3517)} tons
              </p>
            </div>

            {/* Environmental Energy */}
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl rounded-xl p-4 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-200">Energy</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(climateResults.totalEnvironmentalEnergy)} kWh/day</p>
              <p className="text-xs text-green-300">
                {formatNumber((climateResults.totalEnvironmentalEnergy / (lightingData.totalLightingPower / 1000 * lightingData.operatingHours)) * 100)}% of lighting
              </p>
            </div>

            {/* Annual Cost */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-200">Annual Cost</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(climateResults.annualEnvironmentalCost)}</p>
              <p className="text-xs text-purple-300">
                Environmental systems
              </p>
            </div>
          </div>

          {/* Environmental Conditions */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Estimated Environmental Conditions
            </h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-400">Temperature</span>
                </div>
                <p className="text-xl font-bold text-white">{formatNumber(climateResults.estimatedRoomTemperature)}°C</p>
                <p className="text-xs text-gray-500">Target: {lightingData.targetTemperature}°C</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Humidity</span>
                </div>
                <p className="text-xl font-bold text-white">{formatNumber(climateResults.estimatedHumidity)}%</p>
                <p className="text-xs text-gray-500">Target: {lightingData.targetHumidity}%</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">VPD</span>
                </div>
                <p className="text-xl font-bold text-white">{formatNumber(climateResults.estimatedVPD, 2)} kPa</p>
                <p className={`text-xs ${
                  climateResults.estimatedVPD >= 0.8 && climateResults.estimatedVPD <= 1.4 
                    ? 'text-green-400' 
                    : 'text-yellow-400'
                }`}>
                  {climateResults.estimatedVPD >= 0.8 && climateResults.estimatedVPD <= 1.4 ? 'Optimal' : 'Sub-optimal'}
                </p>
              </div>
            </div>
          </div>

          {/* Equipment Requirements */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              Equipment Requirements
            </h4>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Dehumidification</span>
                <span className="text-white font-medium">{formatNumber(climateResults.dehumidificationRequired)} L/day</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Ventilation</span>
                <span className="text-white font-medium">{formatNumber(climateResults.ventilationRequired)} m³/h</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Air Changes</span>
                <span className="text-white font-medium">
                  {formatNumber(climateResults.ventilationRequired / (lightingData.roomWidth * lightingData.roomLength * lightingData.roomHeight * 0.0283168))} ACH
                </span>
              </div>
            </div>
          </div>

          {/* Alerts and Recommendations */}
          {(climateResults.alerts.length > 0 || climateResults.recommendations.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Alerts */}
              {climateResults.alerts.length > 0 && (
                <div className="bg-red-900/20 backdrop-blur-xl rounded-xl p-4 border border-red-500/30">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    Alerts
                  </h4>
                  <div className="space-y-2">
                    {climateResults.alerts.map((alert, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-red-300">{alert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-blue-900/20 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {climateResults.recommendations.slice(0, 4).map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-blue-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 overflow-hidden">
            <button
              onClick={() => setAdvancedSettings({...advancedSettings})} // Toggle state would go here
              className="w-full p-4 flex items-center justify-between text-white hover:bg-gray-800/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" />
                Advanced Climate Settings
              </span>
            </button>
            
            <div className="p-6 pt-0 grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400">Transpiration Rate (L/m²/day)</label>
                <input
                  type="number"
                  step="0.1"
                  value={advancedSettings.transpirationRate}
                  onChange={(e) => setAdvancedSettings({
                    ...advancedSettings, 
                    transpirationRate: Number(e.target.value)
                  })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">LED Efficiency (μmol/J)</label>
                <input
                  type="number"
                  step="0.1"
                  value={advancedSettings.lightingEfficiency}
                  onChange={(e) => setAdvancedSettings({
                    ...advancedSettings, 
                    lightingEfficiency: Number(e.target.value)
                  })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Safety Factor</label>
                <input
                  type="number"
                  step="0.1"
                  value={advancedSettings.safetyFactor}
                  onChange={(e) => setAdvancedSettings({
                    ...advancedSettings, 
                    safetyFactor: Number(e.target.value)
                  })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* HVAC System Selection Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowHVACSelector(!showHVACSelector)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Building2 className="w-5 h-5" />
              {showHVACSelector ? 'Hide' : 'Select'} HVAC System
            </button>
          </div>
          
          {/* HVAC System Selector */}
          {showHVACSelector && climateResults && (
            <div className="mt-6 p-6 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  HVAC System Selection
                </h3>
                <button
                  onClick={() => setShowHVACSelector(false)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>
              
              <HVACSystemSelector
                coolingLoad={climateResults.coolingRequired / 1000} // Convert W to kW
                heatingLoad={(climateResults.totalHeatLoad / 1000) * 0.3} // Assume 30% heating load
                roomArea={lightingData.roomWidth * lightingData.roomLength * 0.092903} // Convert ft² to m²
                onSystemSelect={(system) => {
                  setSelectedHVACSystem(system);
                }}
              />
              
              {selectedHVACSystem && (
                <div className="mt-4 p-4 bg-green-600/10 border border-green-600/50 rounded-lg">
                  <p className="text-sm text-green-400 font-medium mb-1">Selected System</p>
                  <p className="text-white font-semibold">{selectedHVACSystem.name}</p>
                  <p className="text-sm text-gray-400 mt-1">{selectedHVACSystem.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}