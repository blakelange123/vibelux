"use client"

import { useState, useEffect } from 'react'
import { 
  Wind, 
  TrendingUp, 
  Leaf, 
  Calculator,
  AlertCircle,
  Gauge,
  Target,
  Info,
  Flame,
  Factory,
  DollarSign,
  Thermometer,
  Droplets,
  Clock,
  BarChart3,
  Settings,
  CloudRain,
  Activity,
  Zap,
  FileText,
  Download
} from 'lucide-react'

interface CropCO2Requirements {
  cropType: string;
  baselineCompensation: number; // CO2 compensation point (ppm)
  saturationPoint: number; // CO2 saturation point (ppm)
  optimalRange: { min: number; max: number }; // Optimal CO2 range
  temperatureMultiplier: number; // Temperature adjustment factor
  lightResponseCurve: {
    threshold: number; // PPFD threshold for CO2 response
    maxResponse: number; // Maximum PPFD for CO2 benefit
    efficiency: number; // CO2 use efficiency
  };
  growthStageMultipliers: {
    seedling: number;
    vegetative: number;
    flowering: number;
    fruiting: number;
  };
}

interface EnvironmentalConditions {
  temperature: number; // °C
  humidity: number; // %
  airPressure: number; // kPa
  photoperiod: number; // hours
  seasonalCO2: number; // Seasonal ambient CO2 variation
}

interface EnrichmentSystem {
  type: 'tanks' | 'burner' | 'generator' | 'fermentation' | 'dry-ice';
  efficiency: number; // %
  heatProduction: number; // BTU/lb CO2
  waterProduction: number; // L/lb CO2
  costPerLb: number;
  maintenanceCost: number; // $/month
  equipmentCost: number; // Initial cost
  lifespan: number; // years
}

interface CO2Results {
  dailyRequirement: number;
  hourlyInjectionRate: number;
  totalDailyCost: number;
  photosynthesisEnhancement: number;
  yieldIncrease: number;
  waterUseEfficiency: number;
  heatLoad: number;
  humidityIncrease: number;
  roiPaybackPeriod: number;
  environmentalImpact: number;
}

export function CO2EnrichmentCalculator() {
  // Enhanced state management
  const [roomVolume, setRoomVolume] = useState(1000) // cubic feet
  const [roomHeight, setRoomHeight] = useState(10) // feet
  const [currentCO2, setCurrentCO2] = useState(400) // ppm
  const [targetCO2, setTargetCO2] = useState(1200) // ppm
  const [airExchanges, setAirExchanges] = useState(0.5) // per hour
  const [lightIntensity, setLightIntensity] = useState(600) // PPFD
  const [temperature, setTemperature] = useState(25) // Celsius
  const [humidity, setHumidity] = useState(65) // %
  const [plantCount, setPlantCount] = useState(100)
  const [plantDensity, setPlantDensity] = useState(4) // plants/m²
  const [cropType, setCropType] = useState('tomato')
  const [growthStage, setGrowthStage] = useState<'seedling' | 'vegetative' | 'flowering' | 'fruiting'>('vegetative')
  const [enrichmentMethod, setEnrichmentMethod] = useState<'tanks' | 'burner' | 'generator' | 'fermentation' | 'dry-ice'>('tanks')
  const [operatingHours, setOperatingHours] = useState(12)
  const [photoperiod, setPhotoperiod] = useState(16)
  const [outsideAirCO2, setOutsideAirCO2] = useState(420) // Current atmospheric level
  const [yieldGoal, setYieldGoal] = useState(50) // kg/m²/year
  const [co2Cost, setCo2Cost] = useState(0.50) // per pound
  const [electricityCost, setElectricityCost] = useState(0.12) // $/kWh
  const [unitSystem, setUnitSystem] = useState<'metric' | 'us'>('metric')
  const [results, setResults] = useState<CO2Results | null>(null)

  // Crop database with comprehensive CO2 response data
  const cropDatabase: Record<string, CropCO2Requirements> = {
    tomato: {
      cropType: 'Tomato',
      baselineCompensation: 50,
      saturationPoint: 1400,
      optimalRange: { min: 800, max: 1200 },
      temperatureMultiplier: 1.15,
      lightResponseCurve: {
        threshold: 200,
        maxResponse: 1000,
        efficiency: 0.85
      },
      growthStageMultipliers: {
        seedling: 0.6,
        vegetative: 1.0,
        flowering: 1.2,
        fruiting: 1.3
      }
    },
    lettuce: {
      cropType: 'Lettuce',
      baselineCompensation: 40,
      saturationPoint: 1000,
      optimalRange: { min: 600, max: 900 },
      temperatureMultiplier: 1.05,
      lightResponseCurve: {
        threshold: 150,
        maxResponse: 400,
        efficiency: 0.75
      },
      growthStageMultipliers: {
        seedling: 0.5,
        vegetative: 1.0,
        flowering: 0.8,
        fruiting: 0.8
      }
    },
    cannabis: {
      cropType: 'Cannabis',
      baselineCompensation: 65,
      saturationPoint: 1600,
      optimalRange: { min: 1000, max: 1400 },
      temperatureMultiplier: 1.25,
      lightResponseCurve: {
        threshold: 300,
        maxResponse: 1200,
        efficiency: 0.95
      },
      growthStageMultipliers: {
        seedling: 0.4,
        vegetative: 1.1,
        flowering: 1.4,
        fruiting: 1.0
      }
    },
    cucumber: {
      cropType: 'Cucumber',
      baselineCompensation: 55,
      saturationPoint: 1300,
      optimalRange: { min: 800, max: 1100 },
      temperatureMultiplier: 1.20,
      lightResponseCurve: {
        threshold: 250,
        maxResponse: 900,
        efficiency: 0.88
      },
      growthStageMultipliers: {
        seedling: 0.5,
        vegetative: 0.9,
        flowering: 1.1,
        fruiting: 1.3
      }
    },
    herbs: {
      cropType: 'Herbs (Basil)',
      baselineCompensation: 45,
      saturationPoint: 1100,
      optimalRange: { min: 600, max: 900 },
      temperatureMultiplier: 1.10,
      lightResponseCurve: {
        threshold: 200,
        maxResponse: 500,
        efficiency: 0.70
      },
      growthStageMultipliers: {
        seedling: 0.4,
        vegetative: 1.0,
        flowering: 0.7,
        fruiting: 0.6
      }
    }
  };

  // Enrichment systems database
  const enrichmentSystems: Record<string, EnrichmentSystem> = {
    tanks: {
      type: 'tanks',
      efficiency: 100,
      heatProduction: 0,
      waterProduction: 0,
      costPerLb: 0.75,
      maintenanceCost: 50,
      equipmentCost: 500,
      lifespan: 20
    },
    burner: {
      type: 'burner',
      efficiency: 95,
      heatProduction: 8500, // BTU/lb CO2
      waterProduction: 1.6, // L/lb CO2
      costPerLb: 0.35,
      maintenanceCost: 150,
      equipmentCost: 3500,
      lifespan: 15
    },
    generator: {
      type: 'generator',
      efficiency: 90,
      heatProduction: 7200,
      waterProduction: 1.2,
      costPerLb: 0.40,
      maintenanceCost: 200,
      equipmentCost: 8000,
      lifespan: 12
    },
    fermentation: {
      type: 'fermentation',
      efficiency: 70,
      heatProduction: 200,
      waterProduction: 0.8,
      costPerLb: 0.25,
      maintenanceCost: 75,
      equipmentCost: 1200,
      lifespan: 10
    },
    'dry-ice': {
      type: 'dry-ice',
      efficiency: 100,
      heatProduction: -1000, // Cooling effect
      waterProduction: 0,
      costPerLb: 1.20,
      maintenanceCost: 25,
      equipmentCost: 300,
      lifespan: 25
    }
  };

  const currentCrop = cropDatabase[cropType];
  const currentSystem = enrichmentSystems[enrichmentMethod];

  // Advanced CO2 calculation function
  const calculateCO2Requirements = (): CO2Results => {
    // Convert room volume to metric
    const roomVolumeM3 = unitSystem === 'metric' ? roomVolume : roomVolume * 0.0283168;
    const roomHeightM = unitSystem === 'metric' ? roomHeight : roomHeight * 0.3048;
    const growingArea = roomVolumeM3 / roomHeightM; // m²

    // Temperature adjustment for CO2 solubility and plant response
    const tempAdjustment = Math.max(0.5, Math.min(1.5, 
      currentCrop.temperatureMultiplier * (temperature / 25)
    ));

    // Light response curve for CO2 utilization
    let lightResponse = 1.0;
    if (lightIntensity >= currentCrop.lightResponseCurve.threshold) {
      const effectiveLight = Math.min(lightIntensity, currentCrop.lightResponseCurve.maxResponse);
      lightResponse = 1 + (effectiveLight - currentCrop.lightResponseCurve.threshold) / 
        currentCrop.lightResponseCurve.maxResponse * currentCrop.lightResponseCurve.efficiency;
    }

    // Growth stage adjustment
    const stageMultiplier = currentCrop.growthStageMultipliers[growthStage];

    // Calculate optimal CO2 target based on conditions
    let adjustedOptimalCO2 = currentCrop.optimalRange.min + 
      (currentCrop.optimalRange.max - currentCrop.optimalRange.min) * 
      (lightIntensity / currentCrop.lightResponseCurve.maxResponse);
    
    adjustedOptimalCO2 = Math.min(adjustedOptimalCO2 * tempAdjustment * stageMultiplier, 
      currentCrop.saturationPoint);

    // Calculate CO2 deficit
    const effectiveTargetCO2 = Math.min(targetCO2, adjustedOptimalCO2);
    const co2Deficit = Math.max(0, effectiveTargetCO2 - Math.max(currentCO2, outsideAirCO2));

    // CO2 mass calculations (more precise)
    const co2Density = 1.98; // kg/m³ at STP
    const ppmToKgM3 = co2Density / 1000000;
    const co2NeededKgM3 = co2Deficit * ppmToKgM3;
    const totalCO2NeededKg = co2NeededKgM3 * roomVolumeM3;
    const totalCO2NeededLbs = totalCO2NeededKg * 2.20462;

    // Calculate losses and consumption
    const ventilationLossRate = airExchanges; // ACH
    const plantConsumptionRate = plantDensity * 0.001 * lightResponse * stageMultiplier; // kg CO2/m²/hr
    const leakageLossRate = 0.1; // Additional 10% for leakage

    // Hourly CO2 requirements
    const hourlyVentilationLoss = totalCO2NeededKg * ventilationLossRate;
    const hourlyPlantConsumption = growingArea * plantConsumptionRate;
    const hourlyLeakageLoss = totalCO2NeededKg * leakageLossRate;
    const totalHourlyNeed = hourlyVentilationLoss + hourlyPlantConsumption + hourlyLeakageLoss;

    // Daily requirements (only during operating hours)
    const dailyRequirementKg = (totalCO2NeededKg + (totalHourlyNeed * operatingHours));
    const dailyRequirementLbs = dailyRequirementKg * 2.20462;

    // System efficiency adjustment
    const actualDailyNeed = dailyRequirementLbs / (currentSystem.efficiency / 100);

    // Cost calculations
    const systemCostPerLb = currentSystem.costPerLb + (currentSystem.maintenanceCost / 30 / actualDailyNeed);
    const dailyCost = actualDailyNeed * systemCostPerLb;
    const monthlyCost = dailyCost * 30;

    // Photosynthesis enhancement calculation
    const baselinePhotosynthesis = 100; // Baseline at 400 ppm
    const co2Enhancement = Math.min(
      ((effectiveTargetCO2 - currentCrop.baselineCompensation) / 
       (currentCrop.optimalRange.max - currentCrop.baselineCompensation)) * 100,
      100
    );
    const lightLimitation = Math.min(lightIntensity / currentCrop.lightResponseCurve.maxResponse, 1);
    const photosynthesisEnhancement = co2Enhancement * lightLimitation * tempAdjustment;

    // Yield increase calculation
    const yieldIncrease = photosynthesisEnhancement * 0.7; // 70% of photosynthesis increase translates to yield

    // Water use efficiency improvement
    const wueImprovement = Math.min(photosynthesisEnhancement * 0.4, 25); // Max 25% improvement

    // Heat and humidity production from CO2 system
    const heatProductionBtu = actualDailyNeed * currentSystem.heatProduction;
    const humidityIncrease = actualDailyNeed * currentSystem.waterProduction / growingArea; // L/m²/day

    // ROI calculation
    const yieldIncreaseKg = growingArea * yieldGoal * (yieldIncrease / 100);
    const revenuePerKg = 5; // Assumed revenue per kg
    const additionalRevenue = yieldIncreaseKg * revenuePerKg * 12; // Annual
    const annualCost = monthlyCost * 12 + currentSystem.maintenanceCost * 12;
    const roiPaybackPeriod = currentSystem.equipmentCost / Math.max(additionalRevenue - annualCost, 1);

    // Environmental impact (CO2 equivalent)
    const environmentalImpact = actualDailyNeed * 365 * 0.5; // Simplified carbon footprint

    return {
      dailyRequirement: actualDailyNeed,
      hourlyInjectionRate: totalHourlyNeed * 2.20462, // Convert to lbs
      totalDailyCost: dailyCost,
      photosynthesisEnhancement: photosynthesisEnhancement,
      yieldIncrease: yieldIncrease,
      waterUseEfficiency: wueImprovement,
      heatLoad: heatProductionBtu,
      humidityIncrease: humidityIncrease,
      roiPaybackPeriod: roiPaybackPeriod,
      environmentalImpact: environmentalImpact
    };
  };

  // Update results when inputs change
  useEffect(() => {
    setResults(calculateCO2Requirements());
  }, [roomVolume, roomHeight, currentCO2, targetCO2, airExchanges, lightIntensity, 
      temperature, humidity, cropType, growthStage, enrichmentMethod, operatingHours, 
      photoperiod, plantDensity, yieldGoal, co2Cost, unitSystem]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
          CO₂ Enrichment Calculator
        </h1>
        <p className="text-gray-400">
          Optimize CO₂ levels for maximum photosynthesis efficiency
        </p>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Parameters */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Factory className="w-5 h-5 text-blue-400" />
            Room Parameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Room Volume (ft³)
              </label>
              <input
                type="number"
                value={roomVolume}
                onChange={(e) => setRoomVolume(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Air Exchanges per Hour
              </label>
              <input
                type="number"
                value={airExchanges}
                onChange={(e) => setAirExchanges(Number(e.target.value))}
                step="0.1"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Light Intensity (PPFD)
              </label>
              <input
                type="number"
                value={lightIntensity}
                onChange={(e) => setLightIntensity(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Operating Hours per Day
              </label>
              <input
                type="number"
                value={operatingHours}
                onChange={(e) => setOperatingHours(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* CO2 Settings */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-green-400" />
            CO₂ Settings
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current CO₂ (ppm)
                </label>
                <input
                  type="number"
                  value={currentCO2}
                  onChange={(e) => setCurrentCO2(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target CO₂ (ppm)
                </label>
                <input
                  type="number"
                  value={targetCO2}
                  onChange={(e) => setTargetCO2(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enrichment Method
              </label>
              <select
                value={enrichmentMethod}
                onChange={(e) => setEnrichmentMethod(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
              >
                <option value="tanks">CO₂ Tanks</option>
                <option value="burner">Natural Gas Burner</option>
                <option value="generator">CO₂ Generator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Growth Stage
              </label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
              >
                <option value="seedling">Seedling</option>
                <option value="vegetative">Vegetative</option>
                <option value="flowering">Flowering</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CO₂ Cost ($/lb)
              </label>
              <input
                type="number"
                value={co2Cost}
                onChange={(e) => setCo2Cost(Number(e.target.value))}
                step="0.01"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-xl rounded-xl border border-green-500/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-green-400" />
              <p className="text-sm text-gray-400">Daily CO₂ Need</p>
            </div>
            <p className="text-2xl font-bold text-white">{results.dailyRequirement.toFixed(1)} lbs</p>
            <p className="text-xs text-gray-400 mt-1">{(results.dailyRequirement * 453.592).toFixed(0)}g</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-xl rounded-xl border border-blue-500/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <p className="text-sm text-gray-400">Photosynthesis Boost</p>
            </div>
            <p className="text-2xl font-bold text-white">+{results.photosynthesisEnhancement.toFixed(0)}%</p>
            <p className="text-xs text-gray-400 mt-1">From baseline</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-400" />
              <p className="text-sm text-gray-400">Monthly Cost</p>
            </div>
            <p className="text-2xl font-bold text-white">${(results.totalDailyCost * 30).toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">${(results.totalDailyCost * 365).toFixed(0)}/year</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur-xl rounded-xl border border-yellow-500/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-yellow-400" />
              <p className="text-sm text-gray-400">Optimal CO₂</p>
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(targetCO2)} ppm</p>
            <p className="text-xs text-gray-400 mt-1">For {lightIntensity} PPFD</p>
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supply Requirements */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Supply Requirements</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Room Volume</span>
                <span className="text-white font-medium">{(roomVolume * 0.0283168).toFixed(1)} m³</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">CO₂ Deficit</span>
                <span className="text-white font-medium">{Math.max(0, targetCO2 - currentCO2)} ppm</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Daily Need</span>
                <span className="text-white font-medium">{results.dailyRequirement.toFixed(2)} lbs</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Hourly Rate</span>
                <span className="text-white font-medium">{results.hourlyInjectionRate.toFixed(2)} lbs/hr</span>
              </div>
              
              {enrichmentMethod === 'tanks' && (
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <span className="text-green-400">Tanks per Month</span>
                  <span className="text-white font-bold">{Math.ceil(results.dailyRequirement * 30 / 50)} × 50lb</span>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
            
            <div className="space-y-3">
              {targetCO2 > 1400 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-medium">Target CO₂ Too High</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Your target exceeds optimal levels for {lightIntensity} PPFD. Consider reducing to 1200-1400 ppm.
                    </p>
                  </div>
                </div>
              )}
              
              {results.photosynthesisEnhancement > 20 && (
                <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <Leaf className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-400 font-medium">Significant Growth Boost</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Expect {results.photosynthesisEnhancement.toFixed(0)}% faster growth and higher yields.
                    </p>
                  </div>
                </div>
              )}
              
              {airExchanges > 1 && (
                <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-medium">High Air Exchange Rate</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Consider reducing ventilation during CO₂ enrichment to minimize losses.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      {results && (
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Daily Cost</p>
              <p className="text-2xl font-bold text-white">${results.totalDailyCost.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Weekly Cost</p>
              <p className="text-2xl font-bold text-white">${(results.totalDailyCost * 7).toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Monthly Cost</p>
              <p className="text-2xl font-bold text-white">${(results.totalDailyCost * 30).toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Yearly Cost</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ${(results.totalDailyCost * 365).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}