'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Droplets,
  ThermometerSun,
  Wind,
  Home,
  Leaf,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Info,
  Settings,
  Download,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar
} from 'recharts';
import { weatherGeoService, type WeatherData, type LocationData } from '@/lib/weather-geolocation';

interface EnvironmentalInputs {
  // Space characteristics
  spaceVolume: number; // m³
  floorArea: number; // m²
  ceilingHeight: number; // m
  insulation: 'poor' | 'average' | 'good' | 'excellent';
  
  // Desired indoor conditions
  targetTemperature: number; // °C
  targetHumidity: number; // %
  targetCO2: number; // ppm
  
  // Ventilation system
  ventilationRate: number; // air changes per hour
  heatRecoveryEfficiency: number; // %
  
  // Plant load
  plantDensity: number; // plants per m²
  cropType: 'lettuce' | 'tomato' | 'cannabis' | 'herbs' | 'microgreens';
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
  
  // Equipment
  lightingLoad: number; // watts
  lightingEfficiency: number; // μmol/J
  dehumidificationCapacity: number; // L/day
  humidificationCapacity: number; // L/day
  
  // Operational hours
  operatingHours: number; // hours per day
}

interface EnergyMoistureResults {
  // Energy loads (watts)
  heatingLoad: number;
  coolingLoad: number;
  ventilationLoad: number;
  dehumidificationLoad: number;
  humidificationLoad: number;
  lightingLoad: number;
  totalEnergyLoad: number;
  
  // Moisture balance (kg/hour)
  plantTranspiration: number;
  moistureFromVentilation: number;
  moistureRemovalNeeded: number;
  moistureAdditionNeeded: number;
  
  // Operational costs (per day)
  energyCost: number;
  waterCost: number;
  totalOperatingCost: number;
  
  // Environmental performance
  energyEfficiency: number; // kWh per kg dry weight
  waterUseEfficiency: number; // L per kg dry weight
  carbonFootprint: number; // kg CO2 per day
  
  // Recommendations
  recommendations: string[];
  alerts: Array<{type: 'info' | 'warning' | 'critical', message: string}>;
}

interface TranspirationModel {
  baseRate: number; // L per plant per day
  temperatureCoefficient: number;
  humidityCoefficient: number;
  lightCoefficient: number;
  co2Coefficient: number;
  stageMultiplier: number;
}

export function EnergyMoistureBalanceCalculator() {
  const [inputs, setInputs] = useState<EnvironmentalInputs>({
    spaceVolume: 1000,
    floorArea: 100,
    ceilingHeight: 10,
    insulation: 'good',
    targetTemperature: 22,
    targetHumidity: 65,
    targetCO2: 800,
    ventilationRate: 2,
    heatRecoveryEfficiency: 70,
    plantDensity: 25,
    cropType: 'lettuce',
    growthStage: 'vegetative',
    lightingLoad: 20000,
    lightingEfficiency: 2.5,
    dehumidificationCapacity: 200,
    humidificationCapacity: 100,
    operatingHours: 16
  });

  const [results, setResults] = useState<EnergyMoistureResults | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'energy' | 'moisture' | 'cost'>('energy');

  // Crop transpiration models
  const transpirationModels: Record<string, TranspirationModel> = {
    lettuce: {
      baseRate: 0.05, // L per plant per day
      temperatureCoefficient: 0.15,
      humidityCoefficient: -0.08,
      lightCoefficient: 0.0001,
      co2Coefficient: 0.0005,
      stageMultiplier: inputs.growthStage === 'seedling' ? 0.3 : 
                      inputs.growthStage === 'vegetative' ? 1.0 :
                      inputs.growthStage === 'flowering' ? 0.8 : 0.5
    },
    tomato: {
      baseRate: 0.25,
      temperatureCoefficient: 0.12,
      humidityCoefficient: -0.06,
      lightCoefficient: 0.00015,
      co2Coefficient: 0.0008,
      stageMultiplier: inputs.growthStage === 'seedling' ? 0.2 : 
                      inputs.growthStage === 'vegetative' ? 1.0 :
                      inputs.growthStage === 'flowering' ? 1.5 : 0.8
    },
    cannabis: {
      baseRate: 0.15,
      temperatureCoefficient: 0.18,
      humidityCoefficient: -0.10,
      lightCoefficient: 0.00012,
      co2Coefficient: 0.001,
      stageMultiplier: inputs.growthStage === 'seedling' ? 0.3 : 
                      inputs.growthStage === 'vegetative' ? 1.0 :
                      inputs.growthStage === 'flowering' ? 1.8 : 0.4
    },
    herbs: {
      baseRate: 0.08,
      temperatureCoefficient: 0.14,
      humidityCoefficient: -0.07,
      lightCoefficient: 0.00008,
      co2Coefficient: 0.0006,
      stageMultiplier: inputs.growthStage === 'seedling' ? 0.4 : 
                      inputs.growthStage === 'vegetative' ? 1.0 :
                      inputs.growthStage === 'flowering' ? 0.9 : 0.7
    },
    microgreens: {
      baseRate: 0.02,
      temperatureCoefficient: 0.10,
      humidityCoefficient: -0.05,
      lightCoefficient: 0.00005,
      co2Coefficient: 0.0003,
      stageMultiplier: inputs.growthStage === 'seedling' ? 0.8 : 
                      inputs.growthStage === 'vegetative' ? 1.0 :
                      inputs.growthStage === 'flowering' ? 0.5 : 1.2
    }
  };

  // Calculate plant transpiration
  const calculatePlantTranspiration = (): number => {
    const model = transpirationModels[inputs.cropType];
    const totalPlants = inputs.floorArea * inputs.plantDensity;
    
    const temperatureFactor = 1 + model.temperatureCoefficient * (inputs.targetTemperature - 20);
    const humidityFactor = 1 + model.humidityCoefficient * (inputs.targetHumidity - 60) / 100;
    const lightFactor = 1 + model.lightCoefficient * inputs.lightingLoad;
    const co2Factor = 1 + model.co2Coefficient * (inputs.targetCO2 - 400);
    
    const transpirationRate = model.baseRate * model.stageMultiplier * 
                             temperatureFactor * humidityFactor * 
                             lightFactor * co2Factor;
    
    return totalPlants * transpirationRate * (inputs.operatingHours / 24); // L/hour
  };

  // Calculate energy loads
  const calculateEnergyLoads = (): Partial<EnergyMoistureResults> => {
    // Use actual weather data or default outdoor conditions if no weather data
    const currentWeatherData = weatherData || {
      temperature: 15,
      humidity: 50,
      pressure: 101.325,
      windSpeed: 2,
      windDirection: 0,
      cloudCover: 50,
      visibility: 10,
      uvIndex: 5,
      dewPoint: 5,
      timestamp: new Date()
    } as WeatherData;

    const outdoorTemp = currentWeatherData.temperature;
    const outdoorHumidity = currentWeatherData.humidity;
    
    // Insulation factors
    const insulationFactors = {
      poor: 0.4,
      average: 0.6,
      good: 0.8,
      excellent: 0.95
    };
    
    const insulationFactor = insulationFactors[inputs.insulation];
    
    // Air properties
    const airDensity = 1.2; // kg/m³
    const specificHeat = 1005; // J/kg·K
    const ventilationVolume = inputs.spaceVolume * inputs.ventilationRate; // m³/hour
    const ventilationMass = ventilationVolume * airDensity; // kg/hour
    
    // Temperature differences
    const tempDiff = inputs.targetTemperature - outdoorTemp;
    const heatRecoveryFactor = inputs.heatRecoveryEfficiency / 100;
    const effectiveTempDiff = tempDiff * (1 - heatRecoveryFactor);
    
    // Ventilation load
    const ventilationLoad = Math.abs(effectiveTempDiff) * ventilationMass * specificHeat / 3600; // watts
    
    // Building envelope load (simplified)
    const envelopeArea = inputs.floorArea * 6; // Approximate total surface area
    const heatTransferCoefficient = (1 - insulationFactor) * 5; // W/m²·K
    const envelopeLoad = Math.abs(tempDiff) * envelopeArea * heatTransferCoefficient;
    
    // Lighting heat gain
    const lightingHeatGain = inputs.lightingLoad * 0.85; // 85% of lighting becomes heat
    
    // Total heating/cooling loads
    const totalHeatingLoad = Math.max(0, -(ventilationLoad + envelopeLoad - lightingHeatGain));
    const totalCoolingLoad = Math.max(0, ventilationLoad + envelopeLoad + lightingHeatGain);
    
    // Moisture calculations
    const plantTranspiration = calculatePlantTranspiration(); // L/hour
    const outdoorAbsoluteHumidity = calculateAbsoluteHumidity(outdoorTemp, outdoorHumidity);
    const indoorAbsoluteHumidity = calculateAbsoluteHumidity(inputs.targetTemperature, inputs.targetHumidity);
    
    const moistureFromVentilation = (outdoorAbsoluteHumidity - indoorAbsoluteHumidity) * 
                                   ventilationMass / 1000; // kg/hour
    
    const netMoistureGain = plantTranspiration + moistureFromVentilation; // kg/hour
    
    // Dehumidification/humidification loads
    const dehumidificationLoad = Math.max(0, netMoistureGain) * 2500; // watts (latent heat)
    const humidificationLoad = Math.max(0, -netMoistureGain) * 2500; // watts
    
    return {
      heatingLoad: totalHeatingLoad,
      coolingLoad: totalCoolingLoad,
      ventilationLoad,
      dehumidificationLoad,
      humidificationLoad,
      lightingLoad: inputs.lightingLoad,
      totalEnergyLoad: totalHeatingLoad + totalCoolingLoad + inputs.lightingLoad + 
                      dehumidificationLoad + humidificationLoad,
      plantTranspiration,
      moistureFromVentilation,
      moistureRemovalNeeded: Math.max(0, netMoistureGain),
      moistureAdditionNeeded: Math.max(0, -netMoistureGain)
    };
  };

  // Calculate absolute humidity
  const calculateAbsoluteHumidity = (temp: number, rh: number): number => {
    const saturationPressure = 0.6108 * Math.exp(17.27 * temp / (temp + 237.3));
    const vaporPressure = saturationPressure * (rh / 100);
    return 621.98 * vaporPressure / (101.325 - vaporPressure); // g/kg
  };

  // Calculate operational costs
  const calculateCosts = (energyData: Partial<EnergyMoistureResults>): Partial<EnergyMoistureResults> => {
    const electricityRate = 0.12; // $/kWh
    const waterRate = 0.003; // $/L
    
    const dailyEnergyConsumption = (energyData.totalEnergyLoad || 0) * inputs.operatingHours / 1000; // kWh
    const dailyWaterConsumption = (energyData.plantTranspiration || 0) * inputs.operatingHours; // L
    
    const energyCost = dailyEnergyConsumption * electricityRate;
    const waterCost = dailyWaterConsumption * waterRate;
    
    return {
      ...energyData,
      energyCost,
      waterCost,
      totalOperatingCost: energyCost + waterCost
    };
  };

  // Generate recommendations
  const generateRecommendations = (data: Partial<EnergyMoistureResults>): string[] => {
    const recommendations: string[] = [];
    
    if ((data.totalEnergyLoad || 0) > 50000) {
      recommendations.push('High energy consumption detected. Consider improving insulation or reducing lighting load.');
    }
    
    if ((data.plantTranspiration || 0) > 5) {
      recommendations.push('High transpiration rate. Monitor for excessive water use or humidity issues.');
    }
    
    if ((data.dehumidificationLoad || 0) > 10000) {
      recommendations.push('Significant dehumidification required. Consider increasing ventilation rate.');
    }
    
    if ((data.humidificationLoad || 0) > 5000) {
      recommendations.push('Humidification needed. Consider reducing ventilation or adding moisture sources.');
    }
    
    if (inputs.heatRecoveryEfficiency < 50) {
      recommendations.push('Low heat recovery efficiency. Upgrading HRV system could reduce energy costs.');
    }
    
    return recommendations;
  };

  // Main calculation function
  const calculateBalance = (): EnergyMoistureResults => {
    const energyData = calculateEnergyLoads();
    const costData = calculateCosts(energyData);
    const recommendations = generateRecommendations(costData);
    
    // Calculate efficiency metrics
    const cropYield = inputs.floorArea * inputs.plantDensity * 0.1; // kg dry weight per day (simplified)
    const energyEfficiency = ((costData.totalEnergyLoad || 0) * inputs.operatingHours / 1000) / cropYield;
    const waterUseEfficiency = ((costData.plantTranspiration || 0) * inputs.operatingHours) / cropYield;
    const carbonFootprint = ((costData.totalEnergyLoad || 0) * inputs.operatingHours / 1000) * 0.5; // kg CO2 per kWh
    
    const alerts: Array<{type: 'info' | 'warning' | 'critical', message: string}> = [];
    
    if ((costData.totalEnergyLoad || 0) > 100000) {
      alerts.push({type: 'critical', message: 'Extremely high energy consumption'});
    } else if ((costData.totalEnergyLoad || 0) > 50000) {
      alerts.push({type: 'warning', message: 'High energy consumption'});
    }
    
    if ((costData.totalOperatingCost || 0) > 100) {
      alerts.push({type: 'warning', message: 'High daily operating costs'});
    }
    
    return {
      heatingLoad: costData.heatingLoad || 0,
      coolingLoad: costData.coolingLoad || 0,
      ventilationLoad: costData.ventilationLoad || 0,
      dehumidificationLoad: costData.dehumidificationLoad || 0,
      humidificationLoad: costData.humidificationLoad || 0,
      lightingLoad: costData.lightingLoad || 0,
      totalEnergyLoad: costData.totalEnergyLoad || 0,
      plantTranspiration: costData.plantTranspiration || 0,
      moistureFromVentilation: costData.moistureFromVentilation || 0,
      moistureRemovalNeeded: costData.moistureRemovalNeeded || 0,
      moistureAdditionNeeded: costData.moistureAdditionNeeded || 0,
      energyCost: costData.energyCost || 0,
      waterCost: costData.waterCost || 0,
      totalOperatingCost: costData.totalOperatingCost || 0,
      energyEfficiency,
      waterUseEfficiency,
      carbonFootprint,
      recommendations,
      alerts
    };
  };

  useEffect(() => {
    setResults(calculateBalance());
  }, [inputs, weatherData]);

  // Load weather data on component mount
  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        const cached = weatherGeoService.getCachedWeather();
        if (cached) {
          setWeatherData(cached);
        } else {
          const weather = await weatherGeoService.getCurrentWeather();
          setWeatherData(weather);
        }
      } catch (error) {
        console.warn('Could not load weather data:', error);
      }
    };
    
    loadWeatherData();
  }, []);

  const chartData = useMemo(() => {
    if (!results) return [];
    
    return [
      { name: 'Heating', energy: results.heatingLoad, cost: results.energyCost * 0.3 },
      { name: 'Cooling', energy: results.coolingLoad, cost: results.energyCost * 0.3 },
      { name: 'Lighting', energy: results.lightingLoad, cost: results.energyCost * 0.3 },
      { name: 'Dehumid', energy: results.dehumidificationLoad, cost: results.energyCost * 0.1 },
      { name: 'Other', energy: results.ventilationLoad, cost: results.energyCost * 0.1 }
    ];
  }, [results]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl shadow-lg shadow-green-500/20 mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Energy & Moisture Balance Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Model energy consumption, moisture balance, and operational costs for controlled environment agriculture
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Space Configuration */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-400" />
            Space Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Floor Area (m²)</label>
              <input
                type="number"
                value={inputs.floorArea}
                onChange={(e) => setInputs({...inputs, floorArea: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Ceiling Height (m)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.ceilingHeight}
                onChange={(e) => setInputs({...inputs, ceilingHeight: Number(e.target.value), spaceVolume: inputs.floorArea * Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Insulation Quality</label>
              <select
                value={inputs.insulation}
                onChange={(e) => setInputs({...inputs, insulation: e.target.value as any})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="poor">Poor</option>
                <option value="average">Average</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Ventilation Rate (ACH)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.ventilationRate}
                onChange={(e) => setInputs({...inputs, ventilationRate: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Environmental Targets */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ThermometerSun className="w-5 h-5 text-orange-400" />
            Environmental Targets
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Target Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.targetTemperature}
                onChange={(e) => setInputs({...inputs, targetTemperature: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Target Humidity (%)</label>
              <input
                type="number"
                value={inputs.targetHumidity}
                onChange={(e) => setInputs({...inputs, targetHumidity: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Target CO₂ (ppm)</label>
              <input
                type="number"
                value={inputs.targetCO2}
                onChange={(e) => setInputs({...inputs, targetCO2: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Operating Hours/Day</label>
              <input
                type="number"
                value={inputs.operatingHours}
                onChange={(e) => setInputs({...inputs, operatingHours: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Crop & Equipment */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-400" />
            Crop & Equipment
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Crop Type</label>
              <select
                value={inputs.cropType}
                onChange={(e) => setInputs({...inputs, cropType: e.target.value as any})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="lettuce">Lettuce</option>
                <option value="tomato">Tomato</option>
                <option value="cannabis">Cannabis</option>
                <option value="herbs">Herbs</option>
                <option value="microgreens">Microgreens</option>
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
                <option value="harvest">Harvest</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Plant Density (plants/m²)</label>
              <input
                type="number"
                value={inputs.plantDensity}
                onChange={(e) => setInputs({...inputs, plantDensity: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Lighting Load (W)</label>
              <input
                type="number"
                value={inputs.lightingLoad}
                onChange={(e) => setInputs({...inputs, lightingLoad: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {results && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Total Energy</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {(results.totalEnergyLoad / 1000).toFixed(1)} kW
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">Transpiration</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {results.plantTranspiration.toFixed(1)} L/hr
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Daily Cost</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                ${results.totalOperatingCost.toFixed(0)}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium">Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {results.energyEfficiency.toFixed(1)} kWh/kg
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Energy Breakdown */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Energy Load Breakdown</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    />
                    <Bar dataKey="energy" fill="#3b82f6" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Detailed Analysis</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-gray-400 text-sm">Heating Load</p>
                    <p className="text-white font-semibold">{(results.heatingLoad / 1000).toFixed(1)} kW</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-gray-400 text-sm">Cooling Load</p>
                    <p className="text-white font-semibold">{(results.coolingLoad / 1000).toFixed(1)} kW</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-gray-400 text-sm">Dehumidification</p>
                    <p className="text-white font-semibold">{(results.dehumidificationLoad / 1000).toFixed(1)} kW</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-gray-400 text-sm">Carbon Footprint</p>
                    <p className="text-white font-semibold">{results.carbonFootprint.toFixed(1)} kg CO₂/day</p>
                  </div>
                </div>

                {/* Alerts */}
                {results.alerts.length > 0 && (
                  <div className="space-y-2">
                    {results.alerts.map((alert, idx) => (
                      <div 
                        key={idx}
                        className={`flex items-center gap-2 p-3 rounded-lg ${
                          alert.type === 'critical' ? 'bg-red-900/20 border border-red-700' :
                          alert.type === 'warning' ? 'bg-yellow-900/20 border border-yellow-700' :
                          'bg-blue-900/20 border border-blue-700'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">{alert.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              Optimization Recommendations
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {results.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-300">{rec}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Key Metrics</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Energy Efficiency:</span>
                    <span className="text-white">{results.energyEfficiency.toFixed(2)} kWh/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Water Efficiency:</span>
                    <span className="text-white">{results.waterUseEfficiency.toFixed(1)} L/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily Energy Cost:</span>
                    <span className="text-white">${results.energyCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily Water Cost:</span>
                    <span className="text-white">${results.waterCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}