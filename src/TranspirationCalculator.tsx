'use client';

import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Thermometer, 
  Wind, 
  Sun, 
  Leaf,
  Activity,
  Gauge,
  AlertCircle,
  Info,
  Settings,
  TrendingUp,
  Calculator,
  Target,
  Clock
} from 'lucide-react';

interface CropParameters {
  id: string;
  name: string;
  // Physiological parameters
  leafAreaIndex: { min: number; max: number; optimal: number };
  stomatalResistance: { min: number; max: number; typical: number }; // s/m
  albedo: number; // Light reflection coefficient
  cropHeight: number; // meters
  rootingDepth: number; // meters
  // Growth stage multipliers
  growthStageMultipliers: {
    seedling: number;
    vegetative: number;
    flowering: number;
    fruiting: number;
  };
}

interface EnvironmentalInputs {
  // Weather data
  temperature: number; // °C or °F
  humidity: number; // %
  windSpeed: number; // m/s or mph
  solarRadiation: number; // W/m² or BTU/hr/ft²
  
  // Indoor/greenhouse specific
  co2Concentration: number; // ppm
  lightIntensity: number; // μmol/m²/s from artificial lighting
  airCirculation: number; // m/s or mph internal air movement
  
  // Crop specific
  cropType: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting';
  leafAreaIndex: number;
  
  // Time and location
  photoperiod: number; // hours
  dayOfYear: number;
  latitude: number; // degrees
  
  // Unit system
  unitSystem: 'metric' | 'us';
}

interface TranspirationResults {
  // Primary outputs
  dailyTranspiration: number; // mm/day
  hourlyTranspiration: number; // mm/hour
  waterUse: number; // L/m²/day
  waterUseEfficiency: number; // g biomass/L water
  
  // Intermediate calculations
  netRadiation: number; // W/m²
  soilHeatFlux: number; // W/m²
  vaporPressureDeficit: number; // kPa
  aerodynamicResistance: number; // s/m
  surfaceResistance: number; // s/m
  
  // Environmental assessments
  stressLevel: 'optimal' | 'mild' | 'moderate' | 'severe';
  recommendations: string[];
  
  // Energy balance
  sensibleHeat: number; // W/m²
  latentHeat: number; // W/m²
  totalHeat: number; // W/m²
}

export function TranspirationCalculator() {
  // Crop database
  const cropDatabase: Record<string, CropParameters> = {
    tomato: {
      id: 'tomato',
      name: 'Tomato',
      leafAreaIndex: { min: 1.5, max: 5.0, optimal: 3.5 },
      stomatalResistance: { min: 40, max: 100, typical: 60 },
      albedo: 0.23,
      cropHeight: 2.0,
      rootingDepth: 0.8,
      growthStageMultipliers: {
        seedling: 0.3,
        vegetative: 0.8,
        flowering: 1.0,
        fruiting: 1.2
      }
    },
    lettuce: {
      id: 'lettuce',
      name: 'Lettuce',
      leafAreaIndex: { min: 1.0, max: 4.0, optimal: 2.5 },
      stomatalResistance: { min: 50, max: 120, typical: 80 },
      albedo: 0.25,
      cropHeight: 0.3,
      rootingDepth: 0.3,
      growthStageMultipliers: {
        seedling: 0.2,
        vegetative: 1.0,
        flowering: 0.8,
        fruiting: 0.8
      }
    },
    cannabis: {
      id: 'cannabis',
      name: 'Cannabis',
      leafAreaIndex: { min: 2.0, max: 6.0, optimal: 4.5 },
      stomatalResistance: { min: 30, max: 80, typical: 50 },
      albedo: 0.20,
      cropHeight: 1.5,
      rootingDepth: 0.6,
      growthStageMultipliers: {
        seedling: 0.3,
        vegetative: 0.9,
        flowering: 1.3,
        fruiting: 1.0
      }
    },
    cucumber: {
      id: 'cucumber',
      name: 'Cucumber',
      leafAreaIndex: { min: 1.8, max: 5.5, optimal: 4.0 },
      stomatalResistance: { min: 35, max: 90, typical: 55 },
      albedo: 0.22,
      cropHeight: 2.5,
      rootingDepth: 0.7,
      growthStageMultipliers: {
        seedling: 0.3,
        vegetative: 0.8,
        flowering: 1.1,
        fruiting: 1.3
      }
    },
    herbs: {
      id: 'herbs',
      name: 'Herbs (Basil)',
      leafAreaIndex: { min: 1.2, max: 3.5, optimal: 2.8 },
      stomatalResistance: { min: 60, max: 140, typical: 90 },
      albedo: 0.24,
      cropHeight: 0.5,
      rootingDepth: 0.4,
      growthStageMultipliers: {
        seedling: 0.2,
        vegetative: 1.0,
        flowering: 0.9,
        fruiting: 0.7
      }
    }
  };

  // Unit conversion functions
  const convertTemp = (temp: number, toMetric: boolean): number => {
    return toMetric ? (temp - 32) * 5/9 : temp * 9/5 + 32;
  };
  
  const convertSpeed = (speed: number, toMetric: boolean): number => {
    return toMetric ? speed * 0.44704 : speed / 0.44704; // mph to m/s or vice versa
  };
  
  const convertRadiation = (radiation: number, toMetric: boolean): number => {
    return toMetric ? radiation * 3.15459 : radiation / 3.15459; // BTU/hr/ft² to W/m² or vice versa
  };

  // State
  const [inputs, setInputs] = useState<EnvironmentalInputs>({
    temperature: 25,
    humidity: 65,
    windSpeed: 2.0,
    solarRadiation: 600,
    co2Concentration: 400,
    lightIntensity: 400,
    airCirculation: 0.5,
    cropType: 'tomato',
    growthStage: 'vegetative',
    leafAreaIndex: 3.5,
    photoperiod: 16,
    dayOfYear: 180,
    latitude: 40,
    unitSystem: 'metric'
  });

  const [results, setResults] = useState<TranspirationResults | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get current crop parameters
  const currentCrop = cropDatabase[inputs.cropType];

  // Calculate transpiration using Penman-Monteith equation
  const calculateTranspiration = (): TranspirationResults => {
    // Convert inputs to metric for calculations
    const T = inputs.unitSystem === 'metric' ? inputs.temperature : convertTemp(inputs.temperature, true);
    const RH = inputs.humidity; // Relative humidity in %
    const u2 = inputs.unitSystem === 'metric' ? inputs.windSpeed : convertSpeed(inputs.windSpeed, true);
    const Rs = inputs.unitSystem === 'metric' ? inputs.solarRadiation : convertRadiation(inputs.solarRadiation, true);
    const LAI = inputs.leafAreaIndex;
    
    // Constants
    const cp = 1.013; // Specific heat of air at constant pressure (kJ/kg/°C)
    const epsilon = 0.622; // Ratio of molecular weight of water vapor to dry air
    const lambda = 2.45; // Latent heat of vaporization (MJ/kg)
    const sigma = 4.903e-9; // Stefan-Boltzmann constant (MJ/K⁴/m²/day)
    const Gsc = 0.0820; // Solar constant (MJ/m²/min)
    
    // Psychrometric constant (kPa/°C)
    const gamma = 0.665 * 101.3 / 101.3; // Assuming standard atmospheric pressure
    
    // Saturation vapor pressure (kPa)
    const es = 0.6108 * Math.exp(17.27 * T / (T + 237.3));
    
    // Actual vapor pressure (kPa)
    const ea = es * RH / 100;
    
    // Vapor pressure deficit (kPa)
    const vpd = es - ea;
    
    // Slope of saturation vapor pressure curve (kPa/°C)
    const delta = 4098 * es / Math.pow(T + 237.3, 2);
    
    // Aerodynamic resistance (s/m)
    const ra = 208 / Math.max(u2, 0.1); // Avoid division by zero
    
    // Surface resistance (s/m) - adjusted by crop parameters and stress factors
    let rs = currentCrop.stomatalResistance.typical;
    
    // Adjust for growth stage
    rs *= (1 / currentCrop.growthStageMultipliers[inputs.growthStage]);
    
    // Adjust for VPD stress (stomata close under high VPD)
    if (vpd > 2.0) rs *= (1 + (vpd - 2.0) * 0.5);
    if (vpd < 0.5) rs *= (1 + (0.5 - vpd) * 0.3); // Slight increase under very low VPD
    
    // Adjust for CO2 concentration
    const co2Factor = 1 - (inputs.co2Concentration - 400) * 0.0003; // Reduced transpiration at high CO2
    rs *= Math.max(0.7, co2Factor);
    
    // Net radiation calculation
    // For controlled environments, use artificial lighting + any natural light
    const artificialRadiation = inputs.lightIntensity * 0.219; // Convert PPFD to W/m²
    const totalRadiation = Rs + artificialRadiation;
    
    // Net shortwave radiation
    const Rns = (1 - currentCrop.albedo) * totalRadiation;
    
    // Net longwave radiation (simplified for indoor)
    const Rnl = sigma * Math.pow(T + 273.16, 4) * (0.34 - 0.14 * Math.sqrt(ea)) * 0.1; // MJ/m²/day
    const RnlWatts = Rnl * 1000000 / 86400; // Convert to W/m²
    
    // Net radiation (W/m²)
    const Rn = Rns - RnlWatts;
    
    // Soil heat flux (simplified - assume 10% of net radiation for crops)
    const G = Rn * 0.1;
    
    // Reference evapotranspiration (mm/day) using Penman-Monteith
    const numerator = 0.408 * delta * (Rn - G) + gamma * 900 / (T + 273) * u2 * vpd;
    const denominator = delta + gamma * (1 + 0.34 * u2);
    const ET0 = numerator / denominator;
    
    // Crop evapotranspiration (mm/day)
    const Kc = Math.min(LAI / currentCrop.leafAreaIndex.optimal, 1.4); // Crop coefficient based on LAI
    const ETc = ET0 * Kc;
    
    // Actual evapotranspiration considering surface resistance
    const ETa = ETc * (ra / (ra + rs));
    
    // Convert to water use (L/m²/day)
    const waterUse = ETa;
    
    // Hourly transpiration (assuming daylight period)
    const hourlyET = ETa / inputs.photoperiod;
    
    // Water use efficiency (typical values adjusted by environment)
    let WUE = 3.5; // g biomass/L water baseline for C3 plants
    if (inputs.co2Concentration > 400) {
      WUE *= (1 + (inputs.co2Concentration - 400) * 0.0015); // Improved WUE with CO2
    }
    if (vpd > 1.5) {
      WUE *= (1 - (vpd - 1.5) * 0.1); // Reduced WUE under stress
    }
    
    // Energy balance components
    const latentHeatFlux = ETa * lambda * 1000000 / 86400; // W/m²
    const sensibleHeatFlux = Rn - G - latentHeatFlux;
    
    // Stress assessment
    let stressLevel: 'optimal' | 'mild' | 'moderate' | 'severe' = 'optimal';
    const recommendations: string[] = [];
    
    if (vpd > 2.5) {
      stressLevel = 'severe';
      recommendations.push('VPD too high - increase humidity or reduce temperature');
    } else if (vpd > 1.8) {
      stressLevel = 'moderate';
      recommendations.push('VPD elevated - monitor for stress signs');
    } else if (vpd < 0.4) {
      stressLevel = 'mild';
      recommendations.push('VPD too low - may reduce transpiration and nutrient uptake');
    }
    
    if (T > 30) {
      stressLevel = stressLevel === 'optimal' ? 'mild' : 'severe';
      recommendations.push('Temperature too high - increase cooling');
    } else if (T < 18) {
      stressLevel = stressLevel === 'optimal' ? 'mild' : 'moderate';
      recommendations.push('Temperature too low - increase heating');
    }
    
    if (inputs.lightIntensity > 800 && vpd > 1.5) {
      recommendations.push('High light + high VPD - ensure adequate irrigation');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Environmental conditions are optimal for transpiration');
    }

    return {
      dailyTranspiration: ETa,
      hourlyTranspiration: hourlyET,
      waterUse: waterUse,
      waterUseEfficiency: WUE,
      netRadiation: Rn,
      soilHeatFlux: G,
      vaporPressureDeficit: vpd,
      aerodynamicResistance: ra,
      surfaceResistance: rs,
      stressLevel: stressLevel,
      recommendations: recommendations,
      sensibleHeat: sensibleHeatFlux,
      latentHeat: latentHeatFlux,
      totalHeat: Rn - G
    };
  };

  // Update results when inputs change
  useEffect(() => {
    setResults(calculateTranspiration());
  }, [inputs]);

  // Update LAI when crop type changes
  useEffect(() => {
    if (currentCrop) {
      setInputs(prev => ({
        ...prev,
        leafAreaIndex: currentCrop.leafAreaIndex.optimal
      }));
    }
  }, [inputs.cropType]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/20 mb-4">
          <Droplets className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Transpiration Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Advanced Penman-Monteith model for precise water use and transpiration calculations
        </p>
      </div>

      {/* Unit System Toggle */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800 mb-6">
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${inputs.unitSystem === 'metric' ? 'text-white' : 'text-gray-400'}`}>
            Metric
          </span>
          <button
            onClick={() => setInputs(prev => ({ 
              ...prev, 
              unitSystem: prev.unitSystem === 'metric' ? 'us' : 'metric',
              temperature: prev.unitSystem === 'metric' ? convertTemp(prev.temperature, false) : convertTemp(prev.temperature, true),
              windSpeed: prev.unitSystem === 'metric' ? convertSpeed(prev.windSpeed, false) : convertSpeed(prev.windSpeed, true),
              solarRadiation: prev.unitSystem === 'metric' ? convertRadiation(prev.solarRadiation, false) : convertRadiation(prev.solarRadiation, true),
              airCirculation: prev.unitSystem === 'metric' ? convertSpeed(prev.airCirculation, false) : convertSpeed(prev.airCirculation, true)
            }))}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="switch"
            aria-checked={inputs.unitSystem === 'us'}
          >
            <span
              className={`${
                inputs.unitSystem === 'us' ? 'translate-x-7' : 'translate-x-1'
              } inline-block h-6 w-6 transform rounded-full bg-white transition-transform`}
            />
          </button>
          <span className={`text-sm font-medium ${inputs.unitSystem === 'us' ? 'text-white' : 'text-gray-400'}`}>
            US Customary
          </span>
        </div>
      </div>

      {/* Input Sections */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Environmental Conditions */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-orange-400" />
            Environmental Conditions
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">
                Temperature ({inputs.unitSystem === 'metric' ? '°C' : '°F'})
              </label>
              <input
                type="number"
                value={inputs.temperature.toFixed(1)}
                onChange={(e) => setInputs({...inputs, temperature: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Relative Humidity (%)</label>
              <input
                type="number"
                value={inputs.humidity}
                onChange={(e) => setInputs({...inputs, humidity: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">
                Wind Speed ({inputs.unitSystem === 'metric' ? 'm/s' : 'mph'})
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.windSpeed.toFixed(1)}
                onChange={(e) => setInputs({...inputs, windSpeed: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">
                Solar Radiation ({inputs.unitSystem === 'metric' ? 'W/m²' : 'BTU/hr/ft²'})
              </label>
              <input
                type="number"
                value={Math.round(inputs.solarRadiation)}
                onChange={(e) => setInputs({...inputs, solarRadiation: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Light Intensity (μmol/m²/s)</label>
              <input
                type="number"
                value={inputs.lightIntensity}
                onChange={(e) => setInputs({...inputs, lightIntensity: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Crop Parameters */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-400" />
            Crop Parameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Crop Type</label>
              <select
                value={inputs.cropType}
                onChange={(e) => setInputs({...inputs, cropType: e.target.value})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                {Object.values(cropDatabase).map(crop => (
                  <option key={crop.id} value={crop.id}>{crop.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Growth Stage</label>
              <select
                value={inputs.growthStage}
                onChange={(e) => setInputs({...inputs, growthStage: e.target.value as any})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="seedling">Seedling</option>
                <option value="vegetative">Vegetative</option>
                <option value="flowering">Flowering</option>
                <option value="fruiting">Fruiting</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Leaf Area Index</label>
              <input
                type="number"
                step="0.1"
                value={inputs.leafAreaIndex}
                onChange={(e) => setInputs({...inputs, leafAreaIndex: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optimal: {currentCrop?.leafAreaIndex.optimal} (Range: {currentCrop?.leafAreaIndex.min}-{currentCrop?.leafAreaIndex.max})
              </p>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Photoperiod (hours)</label>
              <input
                type="number"
                value={inputs.photoperiod}
                onChange={(e) => setInputs({...inputs, photoperiod: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-4 flex items-center justify-between text-white hover:bg-gray-800/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Advanced Parameters
            </span>
            <span className="text-gray-400">{showAdvanced ? '−' : '+'}</span>
          </button>
          
          {showAdvanced && (
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="text-sm text-gray-400">CO₂ Concentration (ppm)</label>
                <input
                  type="number"
                  value={inputs.co2Concentration}
                  onChange={(e) => setInputs({...inputs, co2Concentration: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">
                  Air Circulation ({inputs.unitSystem === 'metric' ? 'm/s' : 'mph'})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.airCirculation.toFixed(1)}
                  onChange={(e) => setInputs({...inputs, airCirculation: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Day of Year</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={inputs.dayOfYear}
                  onChange={(e) => setInputs({...inputs, dayOfYear: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Latitude (degrees)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.latitude}
                  onChange={(e) => setInputs({...inputs, latitude: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Primary Results */}
          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              Water Use Results
            </h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-cyan-400 text-sm mb-1">Daily Transpiration</p>
                <p className="text-4xl font-bold text-white">
                  {inputs.unitSystem === 'metric' 
                    ? results.dailyTranspiration.toFixed(1) 
                    : (results.dailyTranspiration * 0.0393701).toFixed(2)
                  }
                </p>
                <p className="text-cyan-300 text-sm">
                  {inputs.unitSystem === 'metric' ? 'mm/day' : 'in/day'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400">Hourly Rate</p>
                  <p className="text-white font-semibold">
                    {inputs.unitSystem === 'metric' 
                      ? `${results.hourlyTranspiration.toFixed(2)} mm/h`
                      : `${(results.hourlyTranspiration * 0.0393701).toFixed(3)} in/h`
                    }
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400">Water Use</p>
                  <p className="text-white font-semibold">
                    {inputs.unitSystem === 'metric' 
                      ? `${results.waterUse.toFixed(1)} L/m²/day`
                      : `${(results.waterUse * 0.0245).toFixed(2)} gal/ft²/day`
                    }
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400">WUE</p>
                  <p className="text-white font-semibold">{results.waterUseEfficiency.toFixed(1)} g/L</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400">VPD</p>
                  <p className="text-white font-semibold">{results.vaporPressureDeficit.toFixed(2)} kPa</p>
                </div>
              </div>
            </div>
          </div>

          {/* Energy Balance */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-400" />
              Energy Balance
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Net Radiation</span>
                <span className="text-white font-medium">
                  {inputs.unitSystem === 'metric' 
                    ? `${results.netRadiation.toFixed(1)} W/m²`
                    : `${(results.netRadiation / 3.15459).toFixed(1)} BTU/hr/ft²`
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Latent Heat</span>
                <span className="text-white font-medium">
                  {inputs.unitSystem === 'metric' 
                    ? `${results.latentHeat.toFixed(1)} W/m²`
                    : `${(results.latentHeat / 3.15459).toFixed(1)} BTU/hr/ft²`
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Sensible Heat</span>
                <span className="text-white font-medium">
                  {inputs.unitSystem === 'metric' 
                    ? `${results.sensibleHeat.toFixed(1)} W/m²`
                    : `${(results.sensibleHeat / 3.15459).toFixed(1)} BTU/hr/ft²`
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Soil Heat Flux</span>
                <span className="text-white font-medium">
                  {inputs.unitSystem === 'metric' 
                    ? `${results.soilHeatFlux.toFixed(1)} W/m²`
                    : `${(results.soilHeatFlux / 3.15459).toFixed(1)} BTU/hr/ft²`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Stress Assessment & Recommendations */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-green-400" />
              Plant Status
            </h3>
            
            <div className={`mb-4 p-4 rounded-lg border ${
              results.stressLevel === 'optimal' 
                ? 'bg-green-500/10 border-green-500/30'
                : results.stressLevel === 'mild'
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : results.stressLevel === 'moderate'
                ? 'bg-orange-500/10 border-orange-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  results.stressLevel === 'optimal' ? 'bg-green-400' :
                  results.stressLevel === 'mild' ? 'bg-yellow-400' :
                  results.stressLevel === 'moderate' ? 'bg-orange-400' : 'bg-red-400'
                }`} />
                <span className={`font-medium ${
                  results.stressLevel === 'optimal' ? 'text-green-400' :
                  results.stressLevel === 'mild' ? 'text-yellow-400' :
                  results.stressLevel === 'moderate' ? 'text-orange-400' : 'text-red-400'
                }`}>
                  {results.stressLevel.charAt(0).toUpperCase() + results.stressLevel.slice(1)} Conditions
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendations:</h4>
              {results.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Technical Details */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-xl rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-400" />
          Technical Parameters
        </h3>
        
        {results && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400">Aerodynamic Resistance</p>
              <p className="text-white font-medium">{results.aerodynamicResistance.toFixed(1)} s/m</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400">Surface Resistance</p>
              <p className="text-white font-medium">{results.surfaceResistance.toFixed(1)} s/m</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400">Stomatal Resistance</p>
              <p className="text-white font-medium">{currentCrop?.stomatalResistance.typical} s/m</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400">Crop Coefficient</p>
              <p className="text-white font-medium">{(inputs.leafAreaIndex / (currentCrop?.leafAreaIndex.optimal || 1)).toFixed(2)}</p>
            </div>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <p className="text-sm text-blue-400">
            <Info className="w-4 h-4 inline mr-1" />
            Calculations use the FAO Penman-Monteith equation for reference evapotranspiration, 
            adjusted for crop coefficients and environmental stress factors.
          </p>
        </div>
      </div>
    </div>
  );
}