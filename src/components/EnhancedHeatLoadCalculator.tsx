'use client';

import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Zap, 
  Sun, 
  Snowflake, 
  Calculator, 
  TrendingUp, 
  Building, 
  Leaf,
  AlertCircle,
  Info,
  Gauge,
  Activity,
  Fan,
  Home
} from 'lucide-react';

interface HeatLoadInputs {
  // Room dimensions
  length: number;
  width: number;
  height: number;
  
  // Lighting
  totalPowerWatts: number;
  ledEfficiency: number; // As decimal (0.50 = 50%)
  ppf: number; // Total PPF of all fixtures
  dliTarget: number; // Daily Light Integral target
  photoperiod: number; // Hours of light per day
  
  // Environmental
  outdoorTemp: number;
  indoorTemp: number;
  outdoorHumidity: number;
  indoorHumidity: number;
  ambientCO2: number; // ppm
  targetCO2: number; // ppm
  
  // Crop
  cropType: 'cannabis' | 'tomato' | 'lettuce' | 'cucumber' | 'herbs' | 'strawberry' | 'microgreens' | 'basil';
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting';
  leafAreaIndex: number; // LAI
  plantDensity: number; // plants/m²
  
  // Ventilation & Air Movement
  airChangesPerHour: number;
  airVelocity: number; // m/s
  infiltrationRate: number; // ACH from leaks
  
  // Building envelope
  wallUValue: number; // BTU/hr·ft²·°F
  ceilingUValue: number;
  floorUValue: number;
  glazingArea: number; // ft² of windows/transparent surfaces
  glazingUValue: number;
  wallArea: number; // ft²
  roofArea: number; // ft²
  
  // Equipment
  ballastHeat: number; // Additional heat from ballasts/drivers (%)
  equipmentLoad: number; // Other equipment heat load (W)
  occupancy: number; // Number of people
  
  // Unit system
  unitSystem: 'metric' | 'imperial';
}

interface HeatLoadResults {
  // Sensible heat loads (BTU/hr or kW)
  lightingSensibleHeat: number;
  envelopeSensibleHeat: number;
  ventilationSensibleHeat: number;
  equipmentSensibleHeat: number;
  occupancySensibleHeat: number;
  infiltrationSensibleHeat: number;
  solarGainSensibleHeat: number;
  totalSensibleHeat: number;
  
  // Latent heat loads (BTU/hr or kW)
  transpirationLatentHeat: number;
  ventilationLatentHeat: number;
  occupancyLatentHeat: number;
  infiltrationLatentHeat: number;
  totalLatentHeat: number;
  
  // Total loads
  totalHeatLoad: number;
  totalHeatLoadWithSafety: number;
  coolingTonsRequired: number;
  coolingKwRequired: number;
  heatingKwRequired: number;
  recommendedUnitSize: number;
  
  // Detailed analysis
  transpirationRate: number; // g/m²/hr
  waterEvaporated: number; // gallons/day or L/day
  dehumidificationRequired: number; // pints/day or L/day
  sensibleHeatRatio: number;
  heatDensity: number; // BTU/hr/ft² or W/m²
  
  // VPD and plant analysis
  currentVPD: number;
  optimalVPD: number;
  vpdStatus: 'low' | 'optimal' | 'high';
  
  // Energy analysis
  dailyEnergyConsumption: number; // kWh/day
  annualEnergyConsumption: number; // kWh/year
  estimatedEnergyCost: number; // $/year
  
  // Environmental analysis
  co2RequiredFlow: number; // CFM or L/min
  airflowRequired: number; // CFM or m³/h
  
  // Recommendations
  warnings: string[];
  recommendations: string[];
  efficiencyRating: 'poor' | 'fair' | 'good' | 'excellent';
}

// Crop-specific parameters based on research
const CROP_PARAMETERS = {
  cannabis: {
    transpirationCoeff: 4.5, // g/kWh of light
    optimalVPD: { seedling: 0.6, vegetative: 1.0, flowering: 1.2, fruiting: 1.1 },
    stomatalConductance: 0.4,
    lightSaturationPoint: 1500, // μmol/m²/s
    co2CompensationPoint: 50, // ppm
    optimalCO2: { seedling: 600, vegetative: 800, flowering: 1000, fruiting: 900 },
    dliOptimal: { seedling: 20, vegetative: 35, flowering: 45, fruiting: 40 }
  },
  tomato: {
    transpirationCoeff: 4.0,
    optimalVPD: { seedling: 0.6, vegetative: 0.9, flowering: 1.1, fruiting: 1.0 },
    stomatalConductance: 0.5,
    lightSaturationPoint: 1200,
    co2CompensationPoint: 40,
    optimalCO2: { seedling: 500, vegetative: 700, flowering: 900, fruiting: 800 },
    dliOptimal: { seedling: 15, vegetative: 25, flowering: 35, fruiting: 30 }
  },
  lettuce: {
    transpirationCoeff: 3.5,
    optimalVPD: { seedling: 0.5, vegetative: 0.8, flowering: 0.9, fruiting: 0.8 },
    stomatalConductance: 0.3,
    lightSaturationPoint: 600,
    co2CompensationPoint: 35,
    optimalCO2: { seedling: 400, vegetative: 600, flowering: 700, fruiting: 600 },
    dliOptimal: { seedling: 12, vegetative: 17, flowering: 18, fruiting: 17 }
  },
  cucumber: {
    transpirationCoeff: 4.2,
    optimalVPD: { seedling: 0.6, vegetative: 0.9, flowering: 1.0, fruiting: 0.9 },
    stomatalConductance: 0.45,
    lightSaturationPoint: 1000,
    co2CompensationPoint: 45,
    optimalCO2: { seedling: 500, vegetative: 700, flowering: 800, fruiting: 750 },
    dliOptimal: { seedling: 15, vegetative: 22, flowering: 28, fruiting: 25 }
  },
  herbs: {
    transpirationCoeff: 3.8,
    optimalVPD: { seedling: 0.5, vegetative: 0.8, flowering: 0.9, fruiting: 0.8 },
    stomatalConductance: 0.35,
    lightSaturationPoint: 800,
    co2CompensationPoint: 40,
    optimalCO2: { seedling: 400, vegetative: 600, flowering: 700, fruiting: 650 },
    dliOptimal: { seedling: 12, vegetative: 18, flowering: 20, fruiting: 18 }
  },
  strawberry: {
    transpirationCoeff: 3.2,
    optimalVPD: { seedling: 0.7, vegetative: 0.9, flowering: 1.1, fruiting: 1.0 },
    stomatalConductance: 0.38,
    lightSaturationPoint: 900,
    co2CompensationPoint: 50,
    optimalCO2: { seedling: 500, vegetative: 700, flowering: 900, fruiting: 800 },
    dliOptimal: { seedling: 15, vegetative: 20, flowering: 25, fruiting: 22 }
  },
  microgreens: {
    transpirationCoeff: 2.8,
    optimalVPD: { seedling: 0.4, vegetative: 0.6, flowering: 0.7, fruiting: 0.6 },
    stomatalConductance: 0.25,
    lightSaturationPoint: 400,
    co2CompensationPoint: 30,
    optimalCO2: { seedling: 400, vegetative: 500, flowering: 600, fruiting: 500 },
    dliOptimal: { seedling: 8, vegetative: 12, flowering: 14, fruiting: 12 }
  },
  basil: {
    transpirationCoeff: 3.6,
    optimalVPD: { seedling: 0.5, vegetative: 0.8, flowering: 0.9, fruiting: 0.8 },
    stomatalConductance: 0.33,
    lightSaturationPoint: 700,
    co2CompensationPoint: 42,
    optimalCO2: { seedling: 450, vegetative: 650, flowering: 750, fruiting: 700 },
    dliOptimal: { seedling: 14, vegetative: 20, flowering: 22, fruiting: 20 }
  }
};

export function EnhancedHeatLoadCalculator() {
  const [inputs, setInputs] = useState<HeatLoadInputs>({
    length: 40,
    width: 25,
    height: 12,
    totalPowerWatts: 10000,
    ledEfficiency: 0.50,
    ppf: 25000,
    dliTarget: 35,
    photoperiod: 18,
    outdoorTemp: 95,
    indoorTemp: 75,
    outdoorHumidity: 50,
    indoorHumidity: 60,
    ambientCO2: 400,
    targetCO2: 800,
    cropType: 'cannabis',
    growthStage: 'flowering',
    leafAreaIndex: 3.5,
    plantDensity: 25,
    airChangesPerHour: 6,
    airVelocity: 0.5,
    infiltrationRate: 0.5,
    wallUValue: 0.10,
    ceilingUValue: 0.05,
    floorUValue: 0.15,
    glazingArea: 0,
    glazingUValue: 0.50,
    wallArea: 2600,
    roofArea: 1000,
    ballastHeat: 10,
    equipmentLoad: 500,
    occupancy: 2,
    unitSystem: 'imperial'
  });

  const [results, setResults] = useState<HeatLoadResults | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'envelope' | 'equipment'>('basic');

  // Calculate saturated vapor pressure (kPa)
  const calculateSVP = (tempC: number): number => {
    return 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  };

  // Calculate VPD
  const calculateVPD = (tempC: number, rh: number): number => {
    const svp = calculateSVP(tempC);
    const avp = (svp * rh) / 100;
    return svp - avp;
  };

  // Enhanced transpiration calculation using modified Penman-Monteith approach
  const calculateTranspiration = (): { rate: number; latentHeat: number; waterVolume: number } => {
    const cropParams = CROP_PARAMETERS[inputs.cropType];
    const growArea = inputs.length * inputs.width; // ft²
    const growAreaM2 = growArea * 0.092903;
    
    // Method 1: Light-based transpiration (from Excel insights)
    const lightTranspiration = inputs.totalPowerWatts * cropParams.transpirationCoeff / 1000; // kg/hr
    
    // Method 2: Penman-Monteith simplified for indoor environments
    const tempC = (inputs.indoorTemp - 32) * 5/9;
    const vpd = calculateVPD(tempC, inputs.indoorHumidity);
    
    // Radiation term (simplified for artificial lighting)
    const netRadiation = inputs.ppf * 0.219; // Convert PPF to W/m² (approximate)
    
    // Aerodynamic term
    const windSpeed = 0.5; // m/s (typical for indoor with circulation fans)
    const aerodynamicResistance = 208 / windSpeed; // s/m
    
    // Stomatal resistance adjusted by growth stage and VPD
    let stomatalResistance = 100 / cropParams.stomatalConductance;
    if (vpd > 1.5) stomatalResistance *= 1.5; // Stomata close under high VPD
    
    // Simplified PM equation for transpiration rate (kg/m²/hr)
    const gamma = 0.067; // Psychrometric constant (kPa/°C)
    const lambda = 2.45; // Latent heat of vaporization (MJ/kg)
    const rho = 1.2; // Air density (kg/m³)
    const cp = 1.013; // Specific heat of air (kJ/kg/°C)
    
    // Slope of saturation vapor pressure curve
    const delta = 4098 * calculateSVP(tempC) / Math.pow(tempC + 237.3, 2);
    
    // PM transpiration rate (kg/m²/hr)
    const pmNumerator = (delta * netRadiation) + (rho * cp * vpd * 3600 / aerodynamicResistance);
    const pmDenominator = (delta + gamma * (1 + stomatalResistance / aerodynamicResistance));
    const pmTranspirationRate = pmNumerator / (pmDenominator * lambda * 1000); // kg/m²/hr
    
    // Total transpiration (average of two methods, adjusted by LAI)
    const avgTranspirationRate = ((lightTranspiration / growAreaM2) + pmTranspirationRate) / 2;
    const totalTranspiration = avgTranspirationRate * growAreaM2 * inputs.leafAreaIndex / 3; // kg/hr
    
    // Convert to latent heat (BTU/hr)
    const latentHeatBtu = totalTranspiration * 2.20462 * 970; // kg to lb, then multiply by latent heat
    
    // Water volume (gallons/day)
    const waterGallonsPerDay = totalTranspiration * 24 / 3.78541; // kg/day to gallons/day
    
    return {
      rate: avgTranspirationRate * 1000, // Convert to g/m²/hr
      latentHeat: latentHeatBtu,
      waterVolume: waterGallonsPerDay
    };
  };

  // Calculate all heat loads
  const calculateHeatLoads = () => {
    // 1. Lighting sensible heat
    const photosynthesisEfficiency = 0.05; // 5% used for photosynthesis
    const lightToPlantHeat = inputs.totalPowerWatts * inputs.ledEfficiency * (1 - photosynthesisEfficiency);
    const driverHeat = inputs.totalPowerWatts * (1 - inputs.ledEfficiency);
    const totalLightingHeat = (lightToPlantHeat + driverHeat) * 3.412; // Convert W to BTU/hr
    
    // 2. Building envelope sensible heat
    const wallArea = 2 * (inputs.length + inputs.width) * inputs.height;
    const ceilingArea = inputs.length * inputs.width;
    const floorArea = ceilingArea;
    
    const tempDiff = inputs.outdoorTemp - inputs.indoorTemp;
    const wallHeat = wallArea * inputs.wallUValue * tempDiff;
    const ceilingHeat = ceilingArea * inputs.ceilingUValue * tempDiff;
    const floorHeat = floorArea * inputs.floorUValue * tempDiff * 0.5; // Floor typically less impact
    const totalEnvelopeHeat = wallHeat + ceilingHeat + floorHeat;
    
    // 3. Ventilation loads (sensible and latent)
    const roomVolume = inputs.length * inputs.width * inputs.height;
    const airFlowCFM = (roomVolume * inputs.airChangesPerHour) / 60;
    
    // Sensible ventilation heat
    const ventilationSensible = 1.08 * airFlowCFM * tempDiff;
    
    // Latent ventilation heat
    const outdoorHumidityRatio = 0.622 * calculateSVP((inputs.outdoorTemp - 32) * 5/9) * inputs.outdoorHumidity / 100;
    const indoorHumidityRatio = 0.622 * calculateSVP((inputs.indoorTemp - 32) * 5/9) * inputs.indoorHumidity / 100;
    const humidityDiff = Math.max(0, outdoorHumidityRatio - indoorHumidityRatio);
    const ventilationLatent = 4840 * airFlowCFM * humidityDiff;
    
    // 4. Equipment heat (fans, pumps, etc.) - estimate 5% of lighting
    const equipmentHeat = inputs.totalPowerWatts * 0.05 * 3.412;
    
    // 5. Transpiration latent heat
    const transpiration = calculateTranspiration();
    
    // Calculate totals
    const totalSensible = totalLightingHeat + totalEnvelopeHeat + ventilationSensible + equipmentHeat;
    const totalLatent = transpiration.latentHeat + ventilationLatent;
    const totalHeat = totalSensible + totalLatent;
    const totalWithSafety = totalHeat * 1.2; // 20% safety factor
    
    // Cooling capacity
    const coolingTons = totalWithSafety / 12000;
    const recommendedSize = Math.ceil(coolingTons * 2) / 2; // Round to nearest 0.5 ton
    
    // Dehumidification requirement
    const dehumidPintsPerDay = transpiration.waterVolume * 8; // gallons to pints
    
    // Calculate current VPD and status
    const currentTempC = (inputs.indoorTemp - 32) * 5/9;
    const currentVPD = calculateVPD(currentTempC, inputs.indoorHumidity);
    const optimalVPD = CROP_PARAMETERS[inputs.cropType].optimalVPD[inputs.growthStage];
    let vpdStatus: 'low' | 'optimal' | 'high' = 'optimal';
    if (currentVPD < optimalVPD - 0.2) vpdStatus = 'low';
    else if (currentVPD > optimalVPD + 0.2) vpdStatus = 'high';
    
    setResults({
      lightingSensibleHeat: totalLightingHeat,
      envelopeSensibleHeat: totalEnvelopeHeat,
      ventilationSensibleHeat: ventilationSensible,
      equipmentSensibleHeat: equipmentHeat,
      totalSensibleHeat: totalSensible,
      transpirationLatentHeat: transpiration.latentHeat,
      ventilationLatentHeat: ventilationLatent,
      totalLatentHeat: totalLatent,
      totalHeatLoad: totalHeat,
      totalHeatLoadWithSafety: totalWithSafety,
      coolingTonsRequired: coolingTons,
      recommendedUnitSize: recommendedSize,
      transpirationRate: transpiration.rate,
      waterEvaporated: transpiration.waterVolume,
      dehumidificationRequired: dehumidPintsPerDay,
      sensibleHeatRatio: totalSensible / totalHeat,
      currentVPD: currentVPD,
      optimalVPD: optimalVPD,
      vpdStatus: vpdStatus
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-red-400" />
          Enhanced Heat Load Calculator
        </h3>
        <div className="text-sm text-gray-400">
          Advanced HVAC sizing with transpiration modeling
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Dimensions */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-red-400" />
              Room Dimensions
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400">Length (ft)</label>
                <input
                  type="number"
                  value={inputs.length}
                  onChange={(e) => setInputs({...inputs, length: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Width (ft)</label>
                <input
                  type="number"
                  value={inputs.width}
                  onChange={(e) => setInputs({...inputs, width: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Height (ft)</label>
                <input
                  type="number"
                  value={inputs.height}
                  onChange={(e) => setInputs({...inputs, height: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* Lighting Parameters */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-400" />
              Lighting System
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Total Power (Watts)</label>
                <input
                  type="number"
                  value={inputs.totalPowerWatts}
                  onChange={(e) => setInputs({...inputs, totalPowerWatts: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">LED Efficiency (%)</label>
                <input
                  type="number"
                  value={inputs.ledEfficiency * 100}
                  onChange={(e) => setInputs({...inputs, ledEfficiency: Number(e.target.value) / 100})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Total PPF (μmol/s)</label>
                <input
                  type="number"
                  value={inputs.ppf}
                  onChange={(e) => setInputs({...inputs, ppf: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">PPE (μmol/J)</label>
                <div className="mt-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white">
                  {(inputs.ppf / inputs.totalPowerWatts).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Conditions */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-red-400" />
              Environmental Conditions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Outdoor Temp (°F)</label>
                <input
                  type="number"
                  value={inputs.outdoorTemp}
                  onChange={(e) => setInputs({...inputs, outdoorTemp: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Indoor Temp (°F)</label>
                <input
                  type="number"
                  value={inputs.indoorTemp}
                  onChange={(e) => setInputs({...inputs, indoorTemp: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Outdoor RH (%)</label>
                <input
                  type="number"
                  value={inputs.outdoorHumidity}
                  onChange={(e) => setInputs({...inputs, outdoorHumidity: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Indoor RH (%)</label>
                <input
                  type="number"
                  value={inputs.indoorHumidity}
                  onChange={(e) => setInputs({...inputs, indoorHumidity: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* Crop Parameters */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-red-400" />
              Crop Parameters
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Crop Type</label>
                <select
                  value={inputs.cropType}
                  onChange={(e) => setInputs({...inputs, cropType: e.target.value as any})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="cannabis">Cannabis</option>
                  <option value="tomato">Tomato</option>
                  <option value="lettuce">Lettuce</option>
                  <option value="cucumber">Cucumber</option>
                  <option value="herbs">Herbs</option>
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
                  <option value="flowering">Flowering/Fruiting</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Leaf Area Index (LAI)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.leafAreaIndex}
                  onChange={(e) => setInputs({...inputs, leafAreaIndex: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Typical: 2-4 for most crops</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Air Changes/Hour</label>
                <input
                  type="number"
                  value={inputs.airChangesPerHour}
                  onChange={(e) => setInputs({...inputs, airChangesPerHour: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-4 flex items-center justify-between text-white hover:bg-gray-800/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Home className="w-5 h-5 text-red-400" />
                Advanced Building Envelope Settings
              </span>
              <span className="text-gray-400">{showAdvanced ? '−' : '+'}</span>
            </button>
            
            {showAdvanced && (
              <div className="p-6 pt-0">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Wall U-Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.wallUValue}
                      onChange={(e) => setInputs({...inputs, wallUValue: Number(e.target.value)})}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">BTU/hr·ft²·°F</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Ceiling U-Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.ceilingUValue}
                      onChange={(e) => setInputs({...inputs, ceilingUValue: Number(e.target.value)})}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">BTU/hr·ft²·°F</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Floor U-Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.floorUValue}
                      onChange={(e) => setInputs({...inputs, floorUValue: Number(e.target.value)})}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">BTU/hr·ft²·°F</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400">
                    <strong>U-Value Guidelines:</strong> Lower values = better insulation
                  </p>
                  <ul className="text-xs text-gray-500 mt-2 space-y-1">
                    <li>• Well insulated: 0.03-0.05</li>
                    <li>• Average insulation: 0.05-0.15</li>
                    <li>• Poor insulation: 0.15-0.30</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={calculateHeatLoads}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            Calculate Heat Loads
          </button>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {results && (
            <>
              {/* Primary Result */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-center">
                  <Snowflake className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Total Cooling Required</p>
                  <p className="text-5xl font-bold text-white mb-2">
                    {results.coolingTonsRequired.toFixed(1)}
                  </p>
                  <p className="text-xl text-gray-300 mb-4">tons</p>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-sm text-gray-400">Recommended Unit Size</p>
                    <p className="text-2xl font-semibold text-orange-400">
                      {results.recommendedUnitSize} tons
                    </p>
                  </div>
                </div>
              </div>

              {/* Heat Load Breakdown */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Heat Load Breakdown</h3>
                
                {/* Sensible Heat */}
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Sensible Heat Sources</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Lighting</span>
                      <span className="text-white">{results.lightingSensibleHeat.toFixed(0)} BTU/hr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Envelope</span>
                      <span className="text-white">{results.envelopeSensibleHeat.toFixed(0)} BTU/hr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Ventilation</span>
                      <span className="text-white">{results.ventilationSensibleHeat.toFixed(0)} BTU/hr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Equipment</span>
                      <span className="text-white">{results.equipmentSensibleHeat.toFixed(0)} BTU/hr</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-700">
                      <span className="text-orange-400">Total Sensible</span>
                      <span className="text-orange-400">{results.totalSensibleHeat.toFixed(0)} BTU/hr</span>
                    </div>
                  </div>
                </div>

                {/* Latent Heat */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">Latent Heat Sources</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Transpiration</span>
                      <span className="text-white">{results.transpirationLatentHeat.toFixed(0)} BTU/hr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Ventilation</span>
                      <span className="text-white">{results.ventilationLatentHeat.toFixed(0)} BTU/hr</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-700">
                      <span className="text-cyan-400">Total Latent</span>
                      <span className="text-cyan-400">{results.totalLatentHeat.toFixed(0)} BTU/hr</span>
                    </div>
                  </div>
                </div>

                {/* Sensible Heat Ratio */}
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Sensible Heat Ratio</span>
                    <span className="text-lg font-semibold text-white">
                      {(results.sensibleHeatRatio * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                      style={{ width: `${results.sensibleHeatRatio * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Environmental Metrics */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Environmental Metrics</h3>
                
                {/* VPD Status */}
                <div className={`mb-4 p-4 rounded-lg ${
                  results.vpdStatus === 'optimal' 
                    ? 'bg-green-500/10 border border-green-500/30'
                    : results.vpdStatus === 'low'
                    ? 'bg-blue-500/10 border border-blue-500/30'
                    : 'bg-orange-500/10 border border-orange-500/30'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">VPD Status</span>
                    <span className={`text-sm font-semibold ${
                      results.vpdStatus === 'optimal' ? 'text-green-400' :
                      results.vpdStatus === 'low' ? 'text-blue-400' : 'text-orange-400'
                    }`}>
                      {results.vpdStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current: {results.currentVPD.toFixed(2)} kPa</span>
                    <span className="text-gray-400">Target: {results.optimalVPD.toFixed(2)} kPa</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      Transpiration Rate
                    </span>
                    <span className="text-white">{results.transpirationRate.toFixed(0)} g/m²/hr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      Water Usage
                    </span>
                    <span className="text-white">{results.waterEvaporated.toFixed(1)} gal/day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <Wind className="w-4 h-4" />
                      Dehumidification
                    </span>
                    <span className="text-white">{results.dehumidificationRequired.toFixed(0)} pints/day</span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-red-400" />
                  Recommendations
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {results.sensibleHeatRatio > 0.8 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      High sensible heat ratio - ensure adequate cooling capacity
                    </li>
                  )}
                  {results.sensibleHeatRatio < 0.6 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      High latent load - prioritize dehumidification capacity
                    </li>
                  )}
                  {results.vpdStatus !== 'optimal' && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      VPD is {results.vpdStatus} - adjust temperature or humidity
                    </li>
                  )}
                  {results.coolingTonsRequired > 20 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      Consider multiple HVAC units for redundancy
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    Install environmental monitoring for optimal control
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}