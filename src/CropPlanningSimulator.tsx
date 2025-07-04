'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  TrendingUp,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Zap,
  Activity,
  Eye,
  Download,
  Target,
  AlertCircle,
  Clock,
  Calendar,
  BarChart3,
  Gauge,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Leaf,
  Shield
} from 'lucide-react';

interface SimulationState {
  // Time
  currentHour: number; // 0-23
  currentDay: number; // Day of simulation
  timeSpeed: number; // 1x, 2x, 4x, 8x speed
  
  // Environmental conditions
  temperature: number;
  humidity: number;
  vpd: number;
  co2: number;
  lightIntensity: number;
  airflow: number;
  
  // Energy systems
  lightingPower: number;
  coolingPower: number;
  heatingPower: number;
  ventilationPower: number;
  totalEnergyConsumption: number;
  
  // Plant responses
  transpirationRate: number;
  photosynthesis: number;
  plantStress: number;
  growthRate: number;
}

interface SimulationSettings {
  // Facility
  facilityType: 'indoor' | 'greenhouse' | 'hybrid';
  roomWidth: number;
  roomLength: number;
  roomHeight: number;
  
  // Lighting schedule
  lightingSchedule: {
    startHour: number;
    endHour: number;
    maxIntensity: number;
    rampTime: number; // minutes
  };
  
  // Environmental targets
  dayTemperature: number;
  nightTemperature: number;
  targetHumidity: number;
  targetCO2: number;
  
  // Crop parameters
  cropType: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  plantDensity: number;
  leafAreaIndex: number;
  plantAge: number; // days since planting
  cycleNumber: number; // which growth cycle (for multi-harvest crops)
  
  // Multi-cycle planning
  planningMode: 'single' | 'multi-cycle' | 'annual';
  totalCycles: number;
  successionPlanting: boolean;
  successionInterval: number; // days between plantings
  seasonalAdjustments: boolean;
  currentSeason: 'winter' | 'spring' | 'summer' | 'fall';
  
  // HVAC settings
  hvacEnabled: boolean;
  co2Injection: boolean;
  adaptiveControl: boolean;
  energyOptimization: boolean;
  
  // Economic inputs
  electricityRate: number; // $/kWh
  naturalGasRate: number; // $/therm
  waterRate: number; // $/gallon
  laborRate: number; // $/hour
  nutrientCostPerKg: number; // $/kg
  marketPriceOverride?: number; // $/kg - override crop default
}

interface DailySchedule {
  hour: number;
  lightIntensity: number;
  targetTemp: number;
  co2Target: number;
  ventilationRate: number;
}

interface CropCycle {
  id: string;
  cropType: string;
  plantingDate: Date;
  harvestDate: Date;
  currentStage: string;
  plantAge: number;
  projectedYield: number;
  status: 'planned' | 'active' | 'harvested';
}

interface SeasonalAdjustments {
  winter: {
    temperatureOffset: number;
    humidityOffset: number;
    lightingBoost: number;
    heatingCosts: number;
  };
  spring: {
    temperatureOffset: number;
    humidityOffset: number;
    lightingBoost: number;
    heatingCosts: number;
  };
  summer: {
    temperatureOffset: number;
    humidityOffset: number;
    lightingBoost: number;
    coolingCosts: number;
  };
  fall: {
    temperatureOffset: number;
    humidityOffset: number;
    lightingBoost: number;
    heatingCosts: number;
  };
}

interface AnnualPlan {
  totalCycles: number;
  totalYield: number;
  totalRevenue: number;
  totalCosts: number;
  annualProfit: number;
  cycleSchedule: CropCycle[];
}

interface SimulationResults {
  energyConsumption: {
    lighting: number;
    cooling: number;
    heating: number;
    ventilation: number;
    total: number;
  };
  plantMetrics: {
    avgTranspiration: number;
    avgPhotosynthesis: number;
    maxStress: number;
    avgGrowthRate: number;
    biomassAccumulation: number;
    currentGrowthStage: string;
    daysToHarvest: number;
  };
  environmentalStats: {
    tempRange: { min: number; max: number };
    humidityRange: { min: number; max: number };
    vpdRange: { min: number; max: number };
    co2Range: { min: number; max: number };
  };
  efficiency: {
    lightUseEfficiency: number;
    waterUseEfficiency: number;
    energyUseEfficiency: number;
    overallScore: number;
  };
  economics: {
    inputCosts: {
      electricity: number;
      nutrients: number;
      water: number;
      labor: number;
      total: number;
    };
    projectedYield: number;
    projectedRevenue: number;
    profitMargin: number;
    roi: number;
  };
  pestRisk: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
  };
  multiCycle?: {
    currentCycle: number;
    totalCycles: number;
    annualPlan: AnnualPlan;
    nextPlantingDate: Date;
    successionSchedule: CropCycle[];
  };
}

export function CropPlanningSimulator() {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationState, setSimulationState] = useState<SimulationState>({
    currentHour: 6, // Start at 6 AM
    currentDay: 1,
    timeSpeed: 1,
    temperature: 22,
    humidity: 65,
    vpd: 0.9,
    co2: 400,
    lightIntensity: 0,
    airflow: 0.5,
    lightingPower: 0,
    coolingPower: 0,
    heatingPower: 0,
    ventilationPower: 200,
    totalEnergyConsumption: 0,
    transpirationRate: 0,
    photosynthesis: 0,
    plantStress: 0,
    growthRate: 0
  });

  const [settings, setSettings] = useState<SimulationSettings>({
    facilityType: 'indoor',
    roomWidth: 10,
    roomLength: 20,
    roomHeight: 3,
    lightingSchedule: {
      startHour: 6,
      endHour: 22,
      maxIntensity: 600,
      rampTime: 30
    },
    dayTemperature: 24,
    nightTemperature: 20,
    targetHumidity: 65,
    targetCO2: 800,
    cropType: 'lettuce_butterhead',
    growthStage: 'seedling' as const,
    plantDensity: 30,
    leafAreaIndex: 3.0,
    plantAge: 1,
    cycleNumber: 1,
    planningMode: 'single' as const,
    totalCycles: 1,
    successionPlanting: false,
    successionInterval: 14,
    seasonalAdjustments: false,
    currentSeason: 'spring' as const,
    hvacEnabled: true,
    co2Injection: true,
    adaptiveControl: true,
    energyOptimization: false,
    electricityRate: 0.12,
    naturalGasRate: 0.80,
    waterRate: 0.003,
    laborRate: 25,
    nutrientCostPerKg: 45,
    marketPriceOverride: undefined
  });

  const [showSettings, setShowSettings] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState<SimulationState[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'vpd' | 'co2' | 'light' | 'energy'>('temperature');
  
  const intervalRef = useRef<NodeJS.Timeout>();

  // Seasonal adjustment factors
  const seasonalAdjustments: SeasonalAdjustments = {
    winter: {
      temperatureOffset: -2, // Colder ambient, more heating needed
      humidityOffset: -5, // Drier air
      lightingBoost: 1.3, // Need more artificial light
      heatingCosts: 2.5 // Higher heating costs
    },
    spring: {
      temperatureOffset: 0, // Baseline conditions
      humidityOffset: 0,
      lightingBoost: 1.0,
      heatingCosts: 1.0
    },
    summer: {
      temperatureOffset: 3, // Warmer ambient, more cooling needed
      humidityOffset: 5, // More humid
      lightingBoost: 0.8, // Can use some natural light
      coolingCosts: 2.0 // Higher cooling costs
    },
    fall: {
      temperatureOffset: -1, // Slightly cooler
      humidityOffset: 2, // Slightly more humid
      lightingBoost: 1.1, // Decreasing daylight
      heatingCosts: 1.3 // Starting to heat more
    }
  };

  // Generate annual crop plan
  const generateAnnualPlan = (cropType: string, totalCycles: number, successionInterval: number): AnnualPlan => {
    const cropParams = cropParameters[cropType];
    if (!cropParams) return { totalCycles: 0, totalYield: 0, totalRevenue: 0, totalCosts: 0, annualProfit: 0, cycleSchedule: [] };

    const cycleSchedule: CropCycle[] = [];
    const roomArea = settings.roomWidth * settings.roomLength;
    const totalPlants = settings.plantDensity * roomArea;
    
    const currentDate = new Date();
    let totalYield = 0;
    let totalRevenue = 0;
    let totalCosts = 0;

    for (let i = 0; i < totalCycles; i++) {
      const plantingDate = new Date(currentDate);
      if (settings.successionPlanting && i > 0) {
        plantingDate.setDate(plantingDate.getDate() + (i * successionInterval));
      } else if (!settings.successionPlanting && i > 0) {
        plantingDate.setDate(plantingDate.getDate() + (i * cropParams.cycleDays));
      }
      
      const harvestDate = new Date(plantingDate);
      harvestDate.setDate(harvestDate.getDate() + cropParams.cycleDays);
      
      // Seasonal yield adjustments
      const season = getSeason(plantingDate);
      const seasonalYieldModifier = getSeasonalYieldModifier(season, cropType);
      
      const cycleYield = cropParams.yieldPerPlant * totalPlants * seasonalYieldModifier;
      const cycleRevenue = cycleYield * cropParams.marketPrice;
      const cycleCosts = calculateCycleCosts(cropParams.cycleDays, season);
      
      totalYield += cycleYield;
      totalRevenue += cycleRevenue;
      totalCosts += cycleCosts;
      
      cycleSchedule.push({
        id: `cycle-${i + 1}`,
        cropType,
        plantingDate,
        harvestDate,
        currentStage: 'planned',
        plantAge: 0,
        projectedYield: cycleYield,
        status: 'planned'
      });
    }

    return {
      totalCycles,
      totalYield,
      totalRevenue,
      totalCosts,
      annualProfit: totalRevenue - totalCosts,
      cycleSchedule
    };
  };

  // Get season from date
  const getSeason = (date: Date): 'winter' | 'spring' | 'summer' | 'fall' => {
    const month = date.getMonth() + 1; // 1-12
    if (month >= 12 || month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'fall';
  };

  // Get seasonal yield modifier
  const getSeasonalYieldModifier = (season: string, cropType: string): number => {
    const cropParams = cropParameters[cropType];
    if (!cropParams) return 1.0;
    
    // Some crops perform better in certain seasons
    const seasonalModifiers: Record<string, Record<string, number>> = {
      leafy: { winter: 1.1, spring: 1.2, summer: 0.9, fall: 1.1 }, // Prefer cooler weather
      herbs: { winter: 0.9, spring: 1.2, summer: 1.1, fall: 1.0 },
      fruiting: { winter: 0.8, spring: 1.0, summer: 1.3, fall: 1.0 }, // Prefer warmth
      cannabis: { winter: 0.9, spring: 1.1, summer: 1.2, fall: 1.0 },
      microgreens: { winter: 1.0, spring: 1.1, summer: 1.0, fall: 1.1 },
      ornamental: { winter: 0.8, spring: 1.3, summer: 1.1, fall: 1.0 }
    };
    
    const category = cropParams.category;
    return seasonalModifiers[category]?.[season] || 1.0;
  };

  // Calculate cycle costs with seasonal adjustments
  const calculateCycleCosts = (cycleDays: number, season: string): number => {
    const seasonal = seasonalAdjustments[season as keyof SeasonalAdjustments];
    const baseElectricityCost = 12.0; // Base daily electricity cost
    const baseLaborCost = 25.0; // Base daily labor cost
    const baseNutrientCost = 8.0; // Base daily nutrient cost
    
    const seasonalElectricityCost = baseElectricityCost * (seasonal.lightingBoost || 1.0) * ((seasonal as any).heatingCosts || (seasonal as any).coolingCosts || 1.0);
    const totalDailyCost = seasonalElectricityCost + baseLaborCost + baseNutrientCost;
    
    return totalDailyCost * cycleDays;
  };

  // Helper function to determine current growth stage based on plant age
  const getCurrentGrowthStage = (plantAge: number, cropParams: any): string => {
    const transitions = cropParams.stageTransitions;
    if (plantAge <= transitions.seedling) return 'seedling';
    if (plantAge <= transitions.vegetative) return 'vegetative';
    if (transitions.flowering && plantAge <= transitions.flowering) return 'flowering';
    if (transitions.fruiting && plantAge <= transitions.fruiting) return 'fruiting';
    return 'harvest';
  };

  // Helper function to get stage-specific optimal parameters
  const getStageSpecificParams = (stage: string, cropParams: any) => {
    return {
      optimalTemp: cropParams.optimalTemp[stage] || cropParams.optimalTemp.vegetative,
      optimalHumidity: cropParams.optimalHumidity[stage] || cropParams.optimalHumidity,
      optimalVPD: cropParams.optimalVPD[stage] || cropParams.optimalVPD,
      optimalCO2: cropParams.optimalCO2[stage] || cropParams.optimalCO2,
      lightSaturation: cropParams.lightSaturation[stage] || cropParams.lightSaturation,
      dli: cropParams.dli[stage] || cropParams.dli,
      nutrientEC: cropParams.nutrientEC[stage] || cropParams.nutrientEC
    };
  };

  // Comprehensive crop database with growth stage specifics
  const cropParameters: Record<string, any> = {
    // Leafy Greens
    lettuce_butterhead: {
      name: 'Butterhead Lettuce',
      category: 'leafy',
      cycleDays: 45,
      stageTransitions: { seedling: 7, vegetative: 35, harvest: 45 },
      optimalTemp: { seedling: { day: 20, night: 16 }, vegetative: { day: 22, night: 18 }, harvest: { day: 20, night: 16 } },
      optimalHumidity: { seedling: 75, vegetative: 65, harvest: 60 },
      optimalVPD: { seedling: 0.4, vegetative: 0.8, harvest: 0.9 },
      optimalCO2: { seedling: 600, vegetative: 1000, harvest: 800 },
      lightSaturation: { seedling: 150, vegetative: 350, harvest: 250 },
      dli: { seedling: 8, vegetative: 17, harvest: 12 },
      photoperiod: 16,
      transpirationRate: 2.8,
      stressTolerance: 0.8,
      yieldPerPlant: 0.25, // kg
      marketPrice: 4.5, // $/kg
      nutrientEC: { seedling: 0.8, vegetative: 1.4, harvest: 1.0 },
      pestsAndDiseases: ['aphids', 'pythium', 'tipburn'],
      harvestWindow: 10 // days
    },
    lettuce_romaine: {
      name: 'Romaine Lettuce',
      category: 'leafy',
      cycleDays: 55,
      stageTransitions: { seedling: 10, vegetative: 45, harvest: 55 },
      optimalTemp: { seedling: { day: 20, night: 16 }, vegetative: { day: 23, night: 19 }, harvest: { day: 21, night: 17 } },
      optimalHumidity: { seedling: 75, vegetative: 60, harvest: 55 },
      optimalVPD: { seedling: 0.4, vegetative: 0.9, harvest: 1.0 },
      optimalCO2: { seedling: 600, vegetative: 1100, harvest: 800 },
      lightSaturation: { seedling: 180, vegetative: 400, harvest: 300 },
      dli: { seedling: 10, vegetative: 20, harvest: 15 },
      photoperiod: 16,
      transpirationRate: 3.2,
      stressTolerance: 0.9,
      yieldPerPlant: 0.4,
      marketPrice: 3.8,
      nutrientEC: { seedling: 0.8, vegetative: 1.6, harvest: 1.2 },
      pestsAndDiseases: ['aphids', 'thrips', 'tipburn', 'downy_mildew'],
      harvestWindow: 14
    },
    spinach: {
      name: 'Spinach',
      category: 'leafy',
      cycleDays: 35,
      stageTransitions: { seedling: 7, vegetative: 28, harvest: 35 },
      optimalTemp: { seedling: { day: 18, night: 14 }, vegetative: { day: 20, night: 16 }, harvest: { day: 18, night: 14 } },
      optimalHumidity: { seedling: 80, vegetative: 70, harvest: 65 },
      optimalVPD: { seedling: 0.3, vegetative: 0.7, harvest: 0.8 },
      optimalCO2: { seedling: 500, vegetative: 900, harvest: 700 },
      lightSaturation: { seedling: 120, vegetative: 300, harvest: 200 },
      dli: { seedling: 6, vegetative: 15, harvest: 10 },
      photoperiod: 14,
      transpirationRate: 2.5,
      stressTolerance: 0.9,
      yieldPerPlant: 0.15,
      marketPrice: 6.2,
      nutrientEC: { seedling: 0.7, vegetative: 1.3, harvest: 0.9 },
      pestsAndDiseases: ['aphids', 'leafminers', 'downy_mildew'],
      harvestWindow: 8
    },
    kale: {
      name: 'Kale',
      category: 'leafy',
      cycleDays: 60,
      stageTransitions: { seedling: 14, vegetative: 50, harvest: 60 },
      optimalTemp: { seedling: { day: 22, night: 18 }, vegetative: { day: 24, night: 20 }, harvest: { day: 22, night: 18 } },
      optimalHumidity: { seedling: 75, vegetative: 65, harvest: 60 },
      optimalVPD: { seedling: 0.5, vegetative: 0.9, harvest: 1.0 },
      optimalCO2: { seedling: 600, vegetative: 1200, harvest: 900 },
      lightSaturation: { seedling: 200, vegetative: 450, harvest: 350 },
      dli: { seedling: 12, vegetative: 22, harvest: 18 },
      photoperiod: 16,
      transpirationRate: 3.8,
      stressTolerance: 0.95,
      yieldPerPlant: 0.6,
      marketPrice: 5.5,
      nutrientEC: { seedling: 0.9, vegetative: 1.8, harvest: 1.4 },
      pestsAndDiseases: ['aphids', 'caterpillars', 'black_rot'],
      harvestWindow: 21
    },
    
    // Herbs
    basil_genovese: {
      name: 'Genovese Basil',
      category: 'herbs',
      cycleDays: 40,
      stageTransitions: { seedling: 10, vegetative: 30, flowering: 40, harvest: 40 },
      optimalTemp: { seedling: { day: 24, night: 20 }, vegetative: { day: 26, night: 22 }, flowering: { day: 25, night: 21 } },
      optimalHumidity: { seedling: 70, vegetative: 60, flowering: 55 },
      optimalVPD: { seedling: 0.6, vegetative: 1.0, flowering: 1.1 },
      optimalCO2: { seedling: 600, vegetative: 1000, flowering: 800 },
      lightSaturation: { seedling: 180, vegetative: 400, flowering: 350 },
      dli: { seedling: 10, vegetative: 20, flowering: 18 },
      photoperiod: 16,
      transpirationRate: 3.5,
      stressTolerance: 0.7,
      yieldPerPlant: 0.08,
      marketPrice: 24.0,
      nutrientEC: { seedling: 0.8, vegetative: 1.4, flowering: 1.1 },
      pestsAndDiseases: ['aphids', 'thrips', 'fusarium_wilt', 'downy_mildew'],
      harvestWindow: 15,
      continuousHarvest: true
    },
    cilantro: {
      name: 'Cilantro',
      category: 'herbs',
      cycleDays: 30,
      stageTransitions: { seedling: 7, vegetative: 25, harvest: 30 },
      optimalTemp: { seedling: { day: 20, night: 16 }, vegetative: { day: 22, night: 18 }, harvest: { day: 20, night: 16 } },
      optimalHumidity: { seedling: 75, vegetative: 65, harvest: 60 },
      optimalVPD: { seedling: 0.4, vegetative: 0.8, harvest: 0.9 },
      optimalCO2: { seedling: 500, vegetative: 800, harvest: 600 },
      lightSaturation: { seedling: 150, vegetative: 300, harvest: 250 },
      dli: { seedling: 8, vegetative: 15, harvest: 12 },
      photoperiod: 14,
      transpirationRate: 2.8,
      stressTolerance: 0.8,
      yieldPerPlant: 0.05,
      marketPrice: 28.0,
      nutrientEC: { seedling: 0.7, vegetative: 1.2, harvest: 0.9 },
      pestsAndDiseases: ['aphids', 'leafminers'],
      harvestWindow: 10,
      continuousHarvest: true
    },
    
    // Fruiting Crops
    tomato_cherry: {
      name: 'Cherry Tomato',
      category: 'fruiting',
      cycleDays: 85,
      stageTransitions: { seedling: 14, vegetative: 35, flowering: 60, fruiting: 85 },
      optimalTemp: { seedling: { day: 24, night: 18 }, vegetative: { day: 26, night: 20 }, flowering: { day: 25, night: 19 }, fruiting: { day: 26, night: 20 } },
      optimalHumidity: { seedling: 70, vegetative: 65, flowering: 60, fruiting: 65 },
      optimalVPD: { seedling: 0.6, vegetative: 1.0, flowering: 1.2, fruiting: 1.1 },
      optimalCO2: { seedling: 800, vegetative: 1200, flowering: 1000, fruiting: 900 },
      lightSaturation: { seedling: 200, vegetative: 500, flowering: 700, fruiting: 650 },
      dli: { seedling: 12, vegetative: 25, flowering: 35, fruiting: 32 },
      photoperiod: 16,
      transpirationRate: 4.8,
      stressTolerance: 0.7,
      yieldPerPlant: 2.5,
      marketPrice: 8.5,
      nutrientEC: { seedling: 1.0, vegetative: 2.0, flowering: 2.4, fruiting: 2.2 },
      pestsAndDiseases: ['whiteflies', 'aphids', 'thrips', 'powdery_mildew', 'botrytis', 'blossom_end_rot'],
      harvestWindow: 45,
      continuousHarvest: true
    },
    cucumber: {
      name: 'Cucumber',
      category: 'fruiting',
      cycleDays: 70,
      stageTransitions: { seedling: 10, vegetative: 25, flowering: 45, fruiting: 70 },
      optimalTemp: { seedling: { day: 26, night: 20 }, vegetative: { day: 28, night: 22 }, flowering: { day: 26, night: 20 }, fruiting: { day: 27, night: 21 } },
      optimalHumidity: { seedling: 75, vegetative: 70, flowering: 65, fruiting: 70 },
      optimalVPD: { seedling: 0.5, vegetative: 0.9, flowering: 1.1, fruiting: 1.0 },
      optimalCO2: { seedling: 800, vegetative: 1300, flowering: 1100, fruiting: 1000 },
      lightSaturation: { seedling: 180, vegetative: 450, flowering: 600, fruiting: 550 },
      dli: { seedling: 10, vegetative: 22, flowering: 30, fruiting: 28 },
      photoperiod: 16,
      transpirationRate: 5.2,
      stressTolerance: 0.6,
      yieldPerPlant: 4.2,
      marketPrice: 3.2,
      nutrientEC: { seedling: 1.0, vegetative: 1.8, flowering: 2.2, fruiting: 2.0 },
      pestsAndDiseases: ['spider_mites', 'aphids', 'thrips', 'powdery_mildew', 'downy_mildew'],
      harvestWindow: 35,
      continuousHarvest: true
    },
    strawberry: {
      name: 'Strawberry',
      category: 'fruiting',
      cycleDays: 120,
      stageTransitions: { seedling: 21, vegetative: 60, flowering: 90, fruiting: 120 },
      optimalTemp: { seedling: { day: 22, night: 16 }, vegetative: { day: 24, night: 18 }, flowering: { day: 20, night: 14 }, fruiting: { day: 22, night: 16 } },
      optimalHumidity: { seedling: 70, vegetative: 60, flowering: 55, fruiting: 60 },
      optimalVPD: { seedling: 0.6, vegetative: 1.0, flowering: 1.2, fruiting: 1.0 },
      optimalCO2: { seedling: 600, vegetative: 1000, flowering: 800, fruiting: 700 },
      lightSaturation: { seedling: 150, vegetative: 350, flowering: 400, fruiting: 350 },
      dli: { seedling: 8, vegetative: 18, flowering: 20, fruiting: 18 },
      photoperiod: 12,
      transpirationRate: 3.2,
      stressTolerance: 0.8,
      yieldPerPlant: 0.8,
      marketPrice: 12.0,
      nutrientEC: { seedling: 0.8, vegetative: 1.4, flowering: 1.6, fruiting: 1.4 },
      pestsAndDiseases: ['spider_mites', 'aphids', 'thrips', 'powdery_mildew', 'botrytis', 'root_rot'],
      harvestWindow: 60,
      continuousHarvest: true
    },
    
    // Cannabis
    cannabis_indica: {
      name: 'Cannabis Indica',
      category: 'cannabis',
      cycleDays: 105,
      stageTransitions: { seedling: 14, vegetative: 49, flowering: 105 },
      optimalTemp: { seedling: { day: 24, night: 18 }, vegetative: { day: 26, night: 20 }, flowering: { day: 24, night: 18 } },
      optimalHumidity: { seedling: 70, vegetative: 55, flowering: 45 },
      optimalVPD: { seedling: 0.6, vegetative: 1.0, flowering: 1.3 },
      optimalCO2: { seedling: 600, vegetative: 1200, flowering: 800 },
      lightSaturation: { seedling: 200, vegetative: 600, flowering: 900 },
      dli: { seedling: 15, vegetative: 40, flowering: 50 },
      photoperiod: { vegetative: 18, flowering: 12 },
      transpirationRate: 5.5,
      stressTolerance: 0.8,
      yieldPerPlant: 0.6,
      marketPrice: 2500.0,
      nutrientEC: { seedling: 0.6, vegetative: 1.8, flowering: 2.0 },
      pestsAndDiseases: ['spider_mites', 'aphids', 'thrips', 'powdery_mildew', 'bud_rot', 'root_rot'],
      harvestWindow: 7
    },
    
    // Microgreens
    microgreens_pea: {
      name: 'Pea Microgreens',
      category: 'microgreens',
      cycleDays: 14,
      stageTransitions: { seedling: 4, vegetative: 10, harvest: 14 },
      optimalTemp: { seedling: { day: 20, night: 16 }, vegetative: { day: 22, night: 18 }, harvest: { day: 20, night: 16 } },
      optimalHumidity: { seedling: 85, vegetative: 70, harvest: 60 },
      optimalVPD: { seedling: 0.2, vegetative: 0.5, harvest: 0.7 },
      optimalCO2: { seedling: 400, vegetative: 600, harvest: 500 },
      lightSaturation: { seedling: 50, vegetative: 150, harvest: 200 },
      dli: { seedling: 2, vegetative: 8, harvest: 12 },
      photoperiod: 16,
      transpirationRate: 1.8,
      stressTolerance: 0.9,
      yieldPerPlant: 0.01,
      marketPrice: 45.0,
      nutrientEC: { seedling: 0.0, vegetative: 0.5, harvest: 0.8 },
      pestsAndDiseases: ['damping_off', 'aphids'],
      harvestWindow: 3
    },
    
    // Ornamentals
    petunia: {
      name: 'Petunia',
      category: 'ornamental',
      cycleDays: 90,
      stageTransitions: { seedling: 21, vegetative: 60, flowering: 90 },
      optimalTemp: { seedling: { day: 22, night: 16 }, vegetative: { day: 24, night: 18 }, flowering: { day: 22, night: 16 } },
      optimalHumidity: { seedling: 70, vegetative: 60, flowering: 55 },
      optimalVPD: { seedling: 0.5, vegetative: 0.8, flowering: 1.0 },
      optimalCO2: { seedling: 400, vegetative: 800, flowering: 600 },
      lightSaturation: { seedling: 150, vegetative: 350, flowering: 450 },
      dli: { seedling: 8, vegetative: 18, flowering: 22 },
      photoperiod: 14,
      transpirationRate: 2.5,
      stressTolerance: 0.8,
      yieldPerPlant: 1.0, // decorative value unit
      marketPrice: 3.5,
      nutrientEC: { seedling: 0.8, vegetative: 1.4, flowering: 1.6 },
      pestsAndDiseases: ['aphids', 'thrips', 'powdery_mildew', 'botrytis'],
      harvestWindow: 30
    }
  };

  // Generate daily schedule
  const generateDailySchedule = (): DailySchedule[] => {
    const schedule: DailySchedule[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      let lightIntensity = 0;
      let targetTemp = settings.nightTemperature;
      let co2Target = 400;
      let ventilationRate = 6; // Base ACH
      
      // Lighting schedule with ramp up/down
      if (hour >= settings.lightingSchedule.startHour && hour < settings.lightingSchedule.endHour) {
        const totalLightHours = settings.lightingSchedule.endHour - settings.lightingSchedule.startHour;
        const rampHours = settings.lightingSchedule.rampTime / 60;
        
        // Calculate natural light for greenhouse facilities
        let naturalLight = 0;
        if (settings.facilityType === 'greenhouse' || settings.facilityType === 'hybrid') {
          // Simple natural light model based on time of day and season
          const dayLength = settings.currentSeason === 'summer' ? 16 : 
                          settings.currentSeason === 'winter' ? 8 : 12;
          const sunrise = 12 - dayLength / 2;
          const sunset = 12 + dayLength / 2;
          
          if (hour >= sunrise && hour <= sunset) {
            const midday = (sunrise + sunset) / 2;
            const timeFromMidday = Math.abs(hour - midday);
            const maxNaturalLight = settings.currentSeason === 'summer' ? 800 : 
                                  settings.currentSeason === 'winter' ? 300 : 500;
            naturalLight = maxNaturalLight * Math.cos((timeFromMidday / (dayLength / 2)) * Math.PI / 2);
          }
        }
        
        // Calculate artificial light needed
        let artificialLight = 0;
        if (hour < settings.lightingSchedule.startHour + rampHours) {
          // Ramp up
          const progress = (hour - settings.lightingSchedule.startHour) / rampHours;
          artificialLight = settings.lightingSchedule.maxIntensity * progress;
        } else if (hour > settings.lightingSchedule.endHour - rampHours) {
          // Ramp down
          const progress = (settings.lightingSchedule.endHour - hour) / rampHours;
          artificialLight = settings.lightingSchedule.maxIntensity * progress;
        } else {
          // Full intensity
          artificialLight = settings.lightingSchedule.maxIntensity;
        }
        
        // For greenhouse/hybrid, only use artificial light to supplement
        if (settings.facilityType === 'greenhouse' || settings.facilityType === 'hybrid') {
          artificialLight = Math.max(0, artificialLight - naturalLight);
        }
        
        lightIntensity = naturalLight + artificialLight;
        
        targetTemp = settings.dayTemperature;
        co2Target = settings.co2Injection ? settings.targetCO2 : 400;
        ventilationRate = settings.co2Injection ? 2 : 8; // Lower ventilation when injecting CO2
      }
      
      schedule.push({
        hour,
        lightIntensity,
        targetTemp,
        co2Target,
        ventilationRate
      });
    }
    
    return schedule;
  };

  // Calculate environmental state for current hour
  const updateEnvironmentalState = () => {
    const schedule = generateDailySchedule();
    const currentSchedule = schedule[simulationState.currentHour];
    const roomArea = settings.roomWidth * settings.roomLength;
    const roomVolume = roomArea * settings.roomHeight;
    const cropParams = cropParameters[settings.cropType];
    
    if (!cropParams) {
      console.warn(`Crop parameters not found for: ${settings.cropType}`);
      return simulationState; // Return current state if crop not found
    }
    
    // Determine current growth stage based on plant age
    const currentStage = getCurrentGrowthStage(settings.plantAge, cropParams);
    const stageParams = getStageSpecificParams(currentStage, cropParams);
    
    // Lighting calculations - need to separate natural from artificial light
    let naturalLight = 0;
    let artificialLight = currentSchedule.lightIntensity;
    
    // Recalculate natural light for power consumption (natural light doesn't consume power)
    if (settings.facilityType === 'greenhouse' || settings.facilityType === 'hybrid') {
      const hour = simulationState.currentHour;
      const dayLength = settings.currentSeason === 'summer' ? 16 : 
                      settings.currentSeason === 'winter' ? 8 : 12;
      const sunrise = 12 - dayLength / 2;
      const sunset = 12 + dayLength / 2;
      
      if (hour >= sunrise && hour <= sunset) {
        const midday = (sunrise + sunset) / 2;
        const timeFromMidday = Math.abs(hour - midday);
        const maxNaturalLight = settings.currentSeason === 'summer' ? 800 : 
                              settings.currentSeason === 'winter' ? 300 : 500;
        naturalLight = maxNaturalLight * Math.cos((timeFromMidday / (dayLength / 2)) * Math.PI / 2);
      }
      
      // Artificial light is total minus natural
      artificialLight = Math.max(0, currentSchedule.lightIntensity - naturalLight);
    }
    
    const lightingPowerDensity = 35; // W/m² per 100 PPFD
    const lightingPower = (artificialLight / 100) * lightingPowerDensity * roomArea;
    
    // Heat load from lighting
    const lightingHeatFraction = 0.65; // 65% of lighting power becomes heat
    const lightingHeat = lightingPower * lightingHeatFraction;
    
    // Transpiration calculation
    const lightEffect = Math.min(currentSchedule.lightIntensity / cropParams.lightSaturation, 1);
    const baseTranspiration = cropParams.transpirationRate * settings.leafAreaIndex * lightEffect;
    const vpdEffect = Math.max(0.3, Math.min(1.5, simulationState.vpd / 1.0));
    const transpirationRate = baseTranspiration * vpdEffect;
    
    // Latent heat from transpiration
    const latentHeat = transpirationRate * roomArea * 2.26; // kJ/m²/day to W
    
    // Temperature calculation
    const targetTemp = currentSchedule.targetTemp;
    let actualTemp = targetTemp;
    
    if (settings.hvacEnabled) {
      // HVAC tries to maintain target temperature
      const heatLoad = lightingHeat + (roomArea * 50); // Base heat gain
      const coolingRequired = heatLoad > 0 ? heatLoad / 3500 : 0; // Tons
      const coolingPower = coolingRequired * 3500; // Watts
      const heatingPower = targetTemp > simulationState.temperature ? Math.abs(targetTemp - simulationState.temperature) * 1000 : 0;
      
      actualTemp = targetTemp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1; // ±0.5°C variation
    } else {
      // Free-running temperature
      actualTemp = 20 + (lightingHeat / 1000) + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 3;
    }
    
    // Humidity calculation
    const transpirationHumidityIncrease = transpirationRate * roomArea / (roomVolume * 10);
    let actualHumidity = settings.targetHumidity + transpirationHumidityIncrease;
    
    if (settings.hvacEnabled) {
      actualHumidity = settings.targetHumidity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5; // ±2.5% variation
    }
    
    actualHumidity = Math.max(30, Math.min(90, actualHumidity));
    
    // VPD calculation
    const satPressure = 0.6108 * Math.exp(17.27 * actualTemp / (actualTemp + 237.3));
    const actualVPD = satPressure * (1 - actualHumidity / 100);
    
    // CO2 calculation
    let actualCO2 = currentSchedule.co2Target;
    if (!settings.co2Injection) {
      actualCO2 = 400 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 100;
    } else {
      actualCO2 = currentSchedule.co2Target + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 50;
    }
    
    // Plant stress calculation
    const tempStress = Math.abs(actualTemp - (cropParams.optimalTemp.min + cropParams.optimalTemp.max) / 2) / 
                     ((cropParams.optimalTemp.max - cropParams.optimalTemp.min) / 2);
    const humidityStress = Math.abs(actualHumidity - (cropParams.optimalHumidity.min + cropParams.optimalHumidity.max) / 2) / 
                          ((cropParams.optimalHumidity.max - cropParams.optimalHumidity.min) / 2);
    const vpdStress = Math.abs(actualVPD - (cropParams.optimalVPD.min + cropParams.optimalVPD.max) / 2) / 
                     ((cropParams.optimalVPD.max - cropParams.optimalVPD.min) / 2);
    
    const plantStress = Math.max(0, Math.min(1, (tempStress + humidityStress + vpdStress) / 3));
    
    // Photosynthesis calculation
    const co2Effect = Math.min(actualCO2 / 800, 1.5); // CO2 enhancement up to 1.5x
    const lightPhotosynthesis = Math.min(currentSchedule.lightIntensity / cropParams.lightSaturation, 1);
    const stressEffect = 1 - (plantStress * 0.7);
    const photosynthesis = lightPhotosynthesis * co2Effect * stressEffect;
    
    // Growth rate calculation
    const growthRate = photosynthesis * (1 - plantStress) * 0.8;
    
    // Energy calculations
    const ventilationPower = currentSchedule.ventilationRate * roomVolume * 0.3; // W per m³/h
    const coolingPower = lightingHeat / 3.5; // Assuming COP of 3.5
    const heatingPower = actualTemp < targetTemp ? (targetTemp - actualTemp) * 500 : 0;
    const totalEnergyConsumption = lightingPower + coolingPower + heatingPower + ventilationPower;
    
    return {
      ...simulationState,
      temperature: actualTemp,
      humidity: actualHumidity,
      vpd: actualVPD,
      co2: actualCO2,
      lightIntensity: currentSchedule.lightIntensity,
      airflow: currentSchedule.ventilationRate / 10, // m/s approximation
      lightingPower,
      coolingPower,
      heatingPower,
      ventilationPower,
      totalEnergyConsumption,
      transpirationRate,
      photosynthesis,
      plantStress,
      growthRate
    };
  };

  // Advance simulation time
  const advanceTime = () => {
    setSimulationState(prevState => {
      const newState = updateEnvironmentalState();
      let newHour = prevState.currentHour + 1;
      let newDay = prevState.currentDay;
      
      if (newHour >= 24) {
        newHour = 0;
        newDay += 1;
      }
      
      const updatedState = {
        ...newState,
        currentHour: newHour,
        currentDay: newDay
      };
      
      // Add to history (keep last 48 hours)
      setSimulationHistory(prev => [...prev, updatedState].slice(-48));
      
      return updatedState;
    });
  };

  // Start/stop simulation
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(advanceTime, 1000 / simulationState.timeSpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, simulationState.timeSpeed]);

  // Calculate simulation results
  const calculateResults = (): SimulationResults => {
    const cropParams = cropParameters[settings.cropType];
    
    if (simulationHistory.length < 24 || !cropParams) {
      return {
        energyConsumption: { lighting: 0, cooling: 0, heating: 0, ventilation: 0, total: 0 },
        plantMetrics: { 
          avgTranspiration: 0, 
          avgPhotosynthesis: 0, 
          maxStress: 0, 
          avgGrowthRate: 0,
          biomassAccumulation: 0,
          currentGrowthStage: 'seedling',
          daysToHarvest: cropParams?.cycleDays || 0
        },
        environmentalStats: {
          tempRange: { min: 0, max: 0 },
          humidityRange: { min: 0, max: 0 },
          vpdRange: { min: 0, max: 0 },
          co2Range: { min: 0, max: 0 }
        },
        efficiency: { lightUseEfficiency: 0, waterUseEfficiency: 0, energyUseEfficiency: 0, overallScore: 0 },
        economics: {
          inputCosts: { electricity: 0, nutrients: 0, water: 0, labor: 0, total: 0 },
          projectedYield: 0,
          projectedRevenue: 0,
          profitMargin: 0,
          roi: 0
        },
        pestRisk: {
          level: 'low' as const,
          factors: [],
          recommendations: []
        }
      };
    }
    
    const last24h = simulationHistory.slice(-24);
    
    const energyConsumption = {
      lighting: last24h.reduce((sum, s) => sum + s.lightingPower, 0) / 1000,
      cooling: last24h.reduce((sum, s) => sum + s.coolingPower, 0) / 1000,
      heating: last24h.reduce((sum, s) => sum + s.heatingPower, 0) / 1000,
      ventilation: last24h.reduce((sum, s) => sum + s.ventilationPower, 0) / 1000,
      total: last24h.reduce((sum, s) => sum + s.totalEnergyConsumption, 0) / 1000
    };
    
    // Calculate plant metrics with biological modeling
    const avgTranspiration = last24h.reduce((sum, s) => sum + s.transpirationRate, 0) / 24;
    const avgPhotosynthesis = last24h.reduce((sum, s) => sum + s.photosynthesis, 0) / 24;
    const maxStress = Math.max(...last24h.map(s => s.plantStress));
    const avgGrowthRate = last24h.reduce((sum, s) => sum + s.growthRate, 0) / 24;
    
    // Calculate biomass accumulation (simplified model)
    const dailyGrowth = avgGrowthRate * avgPhotosynthesis * (1 - maxStress);
    const biomassAccumulation = dailyGrowth * settings.plantAge * settings.plantDensity;
    
    // Determine current growth stage and days to harvest
    const currentGrowthStage = getCurrentGrowthStage(settings.plantAge, cropParams);
    const daysToHarvest = Math.max(0, cropParams.cycleDays - settings.plantAge);
    
    const plantMetrics = {
      avgTranspiration,
      avgPhotosynthesis,
      maxStress,
      avgGrowthRate,
      biomassAccumulation,
      currentGrowthStage,
      daysToHarvest
    };
    
    const temps = last24h.map(s => s.temperature);
    const humidities = last24h.map(s => s.humidity);
    const vpds = last24h.map(s => s.vpd);
    const co2s = last24h.map(s => s.co2);
    
    const environmentalStats = {
      tempRange: { min: Math.min(...temps), max: Math.max(...temps) },
      humidityRange: { min: Math.min(...humidities), max: Math.max(...humidities) },
      vpdRange: { min: Math.min(...vpds), max: Math.max(...vpds) },
      co2Range: { min: Math.min(...co2s), max: Math.max(...co2s) }
    };
    
    const efficiency = {
      lightUseEfficiency: (plantMetrics.avgPhotosynthesis / (energyConsumption.lighting || 1)) * 100,
      waterUseEfficiency: (plantMetrics.avgGrowthRate / (plantMetrics.avgTranspiration || 1)) * 100,
      energyUseEfficiency: (plantMetrics.avgGrowthRate / (energyConsumption.total || 1)) * 100,
      overallScore: Math.max(0, Math.min(100, (1 - plantMetrics.maxStress) * plantMetrics.avgGrowthRate * 100))
    };
    
    // Economic calculations
    const roomArea = settings.roomWidth * settings.roomLength;
    const totalPlants = settings.plantDensity * roomArea;
    
    // Input costs (daily) - now using user inputs
    const electricityCost = energyConsumption.total * settings.electricityRate;
    
    // Heating costs (for greenhouse in winter)
    let heatingCost = 0;
    if (settings.facilityType === 'greenhouse' && settings.currentSeason === 'winter') {
      const heatingEnergy = energyConsumption.heating * 0.293; // kWh to therms
      heatingCost = heatingEnergy * settings.naturalGasRate;
    }
    
    // Nutrient calculations based on EC requirements
    const avgEC = (cropParams.nutrientEC.seedling + cropParams.nutrientEC.vegetative + (cropParams.nutrientEC.harvest || cropParams.nutrientEC.vegetative)) / 3;
    const nutrientKgPerPlant = avgEC * 0.001 * cropParams.cycleDays; // Simplified calculation
    const dailyNutrientCost = (nutrientKgPerPlant * settings.nutrientCostPerKg * totalPlants) / cropParams.cycleDays;
    
    const waterCostPerGallon = settings.waterRate;
    const dailyWaterCost = avgTranspiration * roomArea * 0.264172 * waterCostPerGallon; // L to gallons
    
    const laborHoursPerDay = settings.facilityType === 'indoor' ? 2 : 1.5; // Less labor for greenhouse
    const laborCostPerDay = laborHoursPerDay * settings.laborRate;
    
    const totalDailyCost = electricityCost + heatingCost + dailyNutrientCost + dailyWaterCost + laborCostPerDay;
    
    // Projected yield and revenue
    const yieldMultiplier = Math.max(0.3, Math.min(1.2, avgGrowthRate * (1 - maxStress * 0.5)));
    const projectedYieldPerPlant = cropParams.yieldPerPlant * yieldMultiplier;
    const totalProjectedYield = projectedYieldPerPlant * totalPlants;
    const marketPrice = settings.marketPriceOverride || cropParams.marketPrice;
    const projectedRevenue = totalProjectedYield * marketPrice;
    
    // Calculate full cycle economics
    const totalCycleCost = totalDailyCost * cropParams.cycleDays;
    const profitMargin = ((projectedRevenue - totalCycleCost) / projectedRevenue) * 100;
    const roi = ((projectedRevenue - totalCycleCost) / totalCycleCost) * 100;
    
    const economics = {
      inputCosts: {
        electricity: electricityCost,
        nutrients: dailyNutrientCost,
        water: dailyWaterCost,
        labor: laborCostPerDay,
        total: totalDailyCost
      },
      projectedYield: totalProjectedYield,
      projectedRevenue,
      profitMargin,
      roi
    };
    
    // Pest and disease risk assessment
    const pestFactors: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const recommendations: string[] = [];
    
    // High humidity increases disease risk
    if (environmentalStats.humidityRange.max > 80) {
      pestFactors.push('High humidity');
      riskLevel = 'medium';
      recommendations.push('Reduce humidity to prevent fungal diseases');
    }
    
    // High temperature + high humidity = very high risk
    if (environmentalStats.tempRange.max > 28 && environmentalStats.humidityRange.max > 75) {
      pestFactors.push('High temperature + humidity');
      riskLevel = 'high';
      recommendations.push('Improve ventilation and cooling');
    }
    
    // Stress increases susceptibility
    if (maxStress > 0.6) {
      pestFactors.push('Plant stress');
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      recommendations.push('Optimize environmental conditions to reduce plant stress');
    }
    
    // Check for crop-specific pest conditions
    const cropPests = cropParams.pestsAndDiseases || [];
    if (cropPests.includes('spider_mites') && environmentalStats.humidityRange.min < 50) {
      pestFactors.push('Low humidity (spider mites)');
      recommendations.push('Increase humidity to discourage spider mites');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Environmental conditions are within optimal ranges');
    }
    
    const pestRisk = {
      level: riskLevel,
      factors: pestFactors,
      recommendations
    };
    
    // Multi-cycle planning data
    let multiCycle;
    if (settings.planningMode !== 'single') {
      const annualPlan = generateAnnualPlan(settings.cropType, settings.totalCycles, settings.successionInterval);
      
      multiCycle = {
        currentCycle: settings.cycleNumber,
        totalCycles: settings.totalCycles,
        annualPlan,
        nextPlantingDate: new Date(Date.now() + (cropParams.cycleDays - settings.plantAge) * 24 * 60 * 60 * 1000),
        successionSchedule: annualPlan.cycleSchedule
      };
    }
    
    const result = { energyConsumption, plantMetrics, environmentalStats, efficiency, economics, pestRisk };
    
    if (multiCycle) {
      (result as any).multiCycle = multiCycle;
    }
    
    return result;
  };

  const results = calculateResults();

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  const exportSimulation = () => {
    const data = {
      settings,
      history: simulationHistory,
      results,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `environmental-simulation-day${simulationState.currentDay}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/20 mb-4">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Crop Planning & Profitability Simulator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Forward-looking intelligence for facility planning, environmental simulation, and profitability analysis
        </p>
      </div>

      {/* Control Panel */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Simulation Controls */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            Simulation Control
          </h3>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Day {simulationState.currentDay}</p>
              <p className="text-2xl font-bold text-white">{formatTime(simulationState.currentHour)}</p>
              <p className="text-gray-400 text-xs">
                {simulationState.currentHour >= settings.lightingSchedule.startHour && 
                 simulationState.currentHour < settings.lightingSchedule.endHour ? 'Lights On' : 'Lights Off'}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Simulation Speed</label>
              <select
                value={simulationState.timeSpeed}
                onChange={(e) => setSimulationState(prev => ({...prev, timeSpeed: Number(e.target.value)}))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value={1}>1x (Real time)</option>
                <option value={2}>2x Speed</option>
                <option value={4}>4x Speed</option>
                <option value={8}>8x Speed</option>
              </select>
            </div>
            
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pause Simulation' : 'Start Simulation'}
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSimulationState(prev => ({
                    ...prev,
                    currentHour: 6,
                    currentDay: 1,
                    totalEnergyConsumption: 0
                  }));
                  setSimulationHistory([]);
                }}
                className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all flex items-center justify-center gap-1"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
            
            <button
              onClick={exportSimulation}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Simulation
            </button>
          </div>
        </div>

        {/* Current Conditions */}
        <div className="lg:col-span-3 bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-blue-400" />
            Current Environmental Conditions
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-lg p-4 border border-orange-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-200">Temperature</span>
              </div>
              <p className="text-2xl font-bold text-white">{simulationState.temperature.toFixed(1)}°C</p>
              <p className="text-xs text-orange-300">Target: {
                simulationState.currentHour >= settings.lightingSchedule.startHour && 
                simulationState.currentHour < settings.lightingSchedule.endHour 
                  ? settings.dayTemperature : settings.nightTemperature
              }°C</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-200">Humidity</span>
              </div>
              <p className="text-2xl font-bold text-white">{simulationState.humidity.toFixed(0)}%</p>
              <p className="text-xs text-blue-300">Target: {settings.targetHumidity}%</p>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-900/30 to-teal-900/30 rounded-lg p-4 border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-200">VPD</span>
              </div>
              <p className="text-2xl font-bold text-white">{simulationState.vpd.toFixed(2)}</p>
              <p className="text-xs text-cyan-300">kPa</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-200">CO2</span>
              </div>
              <p className="text-2xl font-bold text-white">{simulationState.co2.toFixed(0)}</p>
              <p className="text-xs text-purple-300">ppm</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-lg p-4 border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-200">Light</span>
              </div>
              <p className="text-2xl font-bold text-white">{simulationState.lightIntensity.toFixed(0)}</p>
              <p className="text-xs text-yellow-300">PPFD</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-200">Energy</span>
              </div>
              <p className="text-2xl font-bold text-white">{(simulationState.totalEnergyConsumption / 1000).toFixed(1)}</p>
              <p className="text-xs text-green-300">kW</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plant Metrics */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          Plant Response Metrics
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Transpiration</span>
            </div>
            <p className="text-xl font-bold text-white">{simulationState.transpirationRate.toFixed(2)}</p>
            <p className="text-xs text-gray-500">L/m²/day</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Photosynthesis</span>
            </div>
            <p className="text-xl font-bold text-white">{(simulationState.photosynthesis * 100).toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Rate</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={`w-4 h-4 ${
                simulationState.plantStress < 0.3 ? 'text-green-400' :
                simulationState.plantStress < 0.6 ? 'text-yellow-400' : 'text-red-400'
              }`} />
              <span className="text-sm text-gray-400">Plant Stress</span>
            </div>
            <p className={`text-xl font-bold ${
              simulationState.plantStress < 0.3 ? 'text-green-400' :
              simulationState.plantStress < 0.6 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {(simulationState.plantStress * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500">Stress Level</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Growth Rate</span>
            </div>
            <p className="text-xl font-bold text-green-400">{(simulationState.growthRate * 100).toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Relative</p>
          </div>
        </div>
      </div>

      {/* Crop Information */}
      {cropParameters[settings.cropType] && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-400" />
            Current Crop: {cropParameters[settings.cropType].name}
          </h3>
          
          <div className="grid lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Growth Progress</span>
              </div>
              <p className="text-xl font-bold text-white capitalize">{results.plantMetrics.currentGrowthStage}</p>
              <p className="text-xs text-gray-500">Day {settings.plantAge} of {cropParameters[settings.cropType].cycleDays}</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(settings.plantAge / cropParameters[settings.cropType].cycleDays) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-400">Days to Harvest</span>
              </div>
              <p className="text-xl font-bold text-white">{results.plantMetrics.daysToHarvest}</p>
              <p className="text-xs text-gray-500">days remaining</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Biomass</span>
              </div>
              <p className="text-xl font-bold text-white">{results.plantMetrics.biomassAccumulation.toFixed(1)}</p>
              <p className="text-xs text-gray-500">kg accumulated</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Market Value</span>
              </div>
              <p className="text-xl font-bold text-white">${cropParameters[settings.cropType].marketPrice}</p>
              <p className="text-xs text-gray-500">per kg</p>
            </div>
          </div>
        </div>
      )}

      {/* 24-Hour Results */}
      {simulationHistory.length >= 24 && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            24-Hour Performance Analysis
          </h3>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Energy Breakdown */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Energy Consumption (kWh)</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Lighting</span>
                  <span className="text-white font-medium">{results.energyConsumption.lighting.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Cooling</span>
                  <span className="text-white font-medium">{results.energyConsumption.cooling.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Heating</span>
                  <span className="text-white font-medium">{results.energyConsumption.heating.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Ventilation</span>
                  <span className="text-white font-medium">{results.energyConsumption.ventilation.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-600/20 rounded border border-blue-500/30">
                  <span className="text-blue-300 font-medium">Total</span>
                  <span className="text-white font-bold">{results.energyConsumption.total.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            {/* Environmental Ranges */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Environmental Ranges</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Temperature</span>
                  <span className="text-white font-medium">
                    {results.environmentalStats.tempRange.min.toFixed(1)}°C - {results.environmentalStats.tempRange.max.toFixed(1)}°C
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Humidity</span>
                  <span className="text-white font-medium">
                    {results.environmentalStats.humidityRange.min.toFixed(0)}% - {results.environmentalStats.humidityRange.max.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">VPD</span>
                  <span className="text-white font-medium">
                    {results.environmentalStats.vpdRange.min.toFixed(2)} - {results.environmentalStats.vpdRange.max.toFixed(2)} kPa
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">CO2</span>
                  <span className="text-white font-medium">
                    {results.environmentalStats.co2Range.min.toFixed(0)} - {results.environmentalStats.co2Range.max.toFixed(0)} ppm
                  </span>
                </div>
              </div>
            </div>
            
            {/* Efficiency Metrics */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Efficiency Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Light Use Efficiency</span>
                  <span className="text-white font-medium">{results.efficiency.lightUseEfficiency.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Water Use Efficiency</span>
                  <span className="text-white font-medium">{results.efficiency.waterUseEfficiency.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Energy Use Efficiency</span>
                  <span className="text-white font-medium">{results.efficiency.energyUseEfficiency.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-600/20 rounded border border-green-500/30">
                  <span className="text-green-300 font-medium">Overall Score</span>
                  <span className="text-white font-bold">{results.efficiency.overallScore.toFixed(0)}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Economic Analysis */}
      {simulationHistory.length >= 24 && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            Economic Analysis
          </h3>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Daily Costs */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Daily Operating Costs</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Electricity</span>
                  <span className="text-white font-medium">${results.economics.inputCosts.electricity.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Nutrients</span>
                  <span className="text-white font-medium">${results.economics.inputCosts.nutrients.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Water</span>
                  <span className="text-white font-medium">${results.economics.inputCosts.water.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Labor</span>
                  <span className="text-white font-medium">${results.economics.inputCosts.labor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-600/20 rounded border border-blue-500/30">
                  <span className="text-blue-300 font-medium">Total Daily</span>
                  <span className="text-white font-bold">${results.economics.inputCosts.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Profitability */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Cycle Profitability</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Projected Yield</span>
                  <span className="text-white font-medium">{results.economics.projectedYield.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Projected Revenue</span>
                  <span className="text-white font-medium">${results.economics.projectedRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Profit Margin</span>
                  <span className={`font-medium ${results.economics.profitMargin > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.economics.profitMargin.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-600/20 rounded border border-green-500/30">
                  <span className="text-green-300 font-medium">ROI</span>
                  <span className={`font-bold ${results.economics.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.economics.roi.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pest & Disease Risk */}
      {simulationHistory.length >= 24 && (
        <div className={`backdrop-blur-xl rounded-xl p-6 border ${
          results.pestRisk.level === 'high' ? 'bg-red-900/20 border-red-500/30' :
          results.pestRisk.level === 'medium' ? 'bg-yellow-900/20 border-yellow-500/30' :
          'bg-green-900/20 border-green-500/30'
        }`}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" />
            Pest & Disease Risk Assessment
          </h3>
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Risk Level</h4>
              <div className={`p-4 rounded-lg text-center ${
                results.pestRisk.level === 'high' ? 'bg-red-600/20 border border-red-500/30' :
                results.pestRisk.level === 'medium' ? 'bg-yellow-600/20 border border-yellow-500/30' :
                'bg-green-600/20 border border-green-500/30'
              }`}>
                <p className={`text-2xl font-bold capitalize ${
                  results.pestRisk.level === 'high' ? 'text-red-400' :
                  results.pestRisk.level === 'medium' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {results.pestRisk.level}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Risk Factors</h4>
              <div className="space-y-2">
                {results.pestRisk.factors.length > 0 ? (
                  results.pestRisk.factors.map((factor, idx) => (
                    <div key={idx} className="p-2 bg-gray-800/50 rounded text-sm text-gray-300">
                      {factor}
                    </div>
                  ))
                ) : (
                  <div className="p-2 bg-green-600/20 rounded text-sm text-green-300">
                    No significant risk factors detected
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Recommendations</h4>
              <div className="space-y-2">
                {results.pestRisk.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-2 bg-blue-600/20 rounded text-sm text-blue-300">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Crop-specific pest info */}
          {cropParameters[settings.cropType]?.pestsAndDiseases && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Common Pests & Diseases for {cropParameters[settings.cropType].name}</h4>
              <div className="flex flex-wrap gap-2">
                {cropParameters[settings.cropType].pestsAndDiseases.map((pest: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 capitalize">
                    {pest.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multi-Cycle Planning Results */}
      {simulationHistory.length >= 24 && settings.planningMode !== 'single' && results.multiCycle && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            {settings.planningMode === 'annual' ? 'Annual Planning' : 'Multi-Cycle Planning'}
          </h3>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Annual Summary */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Annual Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Total Cycles</span>
                  <span className="text-white font-medium">{results.multiCycle.annualPlan.totalCycles}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Annual Yield</span>
                  <span className="text-white font-medium">{results.multiCycle.annualPlan.totalYield.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Annual Revenue</span>
                  <span className="text-white font-medium">${results.multiCycle.annualPlan.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Annual Costs</span>
                  <span className="text-white font-medium">${results.multiCycle.annualPlan.totalCosts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-600/20 rounded border border-green-500/30">
                  <span className="text-green-300 font-medium">Annual Profit</span>
                  <span className={`font-bold ${results.multiCycle.annualPlan.annualProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${results.multiCycle.annualPlan.annualProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Current Cycle Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Current Cycle Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-blue-600/20 rounded border border-blue-500/30">
                  <span className="text-blue-300 text-sm">Current Cycle</span>
                  <span className="text-white font-medium">{results.multiCycle.currentCycle} of {results.multiCycle.totalCycles}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Next Planting</span>
                  <span className="text-white font-medium">{results.multiCycle.nextPlantingDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                  <span className="text-gray-400 text-sm">Season</span>
                  <span className="text-white font-medium capitalize">{settings.currentSeason}</span>
                </div>
                {settings.successionPlanting && (
                  <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                    <span className="text-gray-400 text-sm">Succession Interval</span>
                    <span className="text-white font-medium">{settings.successionInterval} days</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Cycle Schedule */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Cycle Schedule</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 p-2">Cycle</th>
                    <th className="text-left text-gray-400 p-2">Planting Date</th>
                    <th className="text-left text-gray-400 p-2">Harvest Date</th>
                    <th className="text-left text-gray-400 p-2">Projected Yield</th>
                    <th className="text-left text-gray-400 p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.multiCycle.successionSchedule.slice(0, 8).map((cycle, idx) => (
                    <tr key={cycle.id} className="border-b border-gray-800">
                      <td className="p-2 text-white font-medium">{idx + 1}</td>
                      <td className="p-2 text-gray-300">{cycle.plantingDate.toLocaleDateString()}</td>
                      <td className="p-2 text-gray-300">{cycle.harvestDate.toLocaleDateString()}</td>
                      <td className="p-2 text-gray-300">{cycle.projectedYield.toFixed(1)} kg</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          cycle.status === 'planned' ? 'bg-blue-600/20 text-blue-300' :
                          cycle.status === 'active' ? 'bg-green-600/20 text-green-300' :
                          'bg-gray-600/20 text-gray-300'
                        }`}>
                          {cycle.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.multiCycle.successionSchedule.length > 8 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Showing first 8 cycles of {results.multiCycle.successionSchedule.length}
                </p>
              )}
            </div>
          </div>
          
          {/* Seasonal Information */}
          {settings.seasonalAdjustments && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Seasonal Adjustments (Current: {settings.currentSeason})</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Temperature</p>
                  <p className="text-white font-medium">
                    {seasonalAdjustments[settings.currentSeason].temperatureOffset >= 0 ? '+' : ''}
                    {seasonalAdjustments[settings.currentSeason].temperatureOffset}°C
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Humidity</p>
                  <p className="text-white font-medium">
                    {seasonalAdjustments[settings.currentSeason].humidityOffset >= 0 ? '+' : ''}
                    {seasonalAdjustments[settings.currentSeason].humidityOffset}%
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Lighting</p>
                  <p className="text-white font-medium">
                    {(seasonalAdjustments[settings.currentSeason].lightingBoost * 100 - 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Energy Costs</p>
                  <p className="text-white font-medium">
                    {(((seasonalAdjustments[settings.currentSeason] as any).heatingCosts || (seasonalAdjustments[settings.currentSeason] as any).coolingCosts || 1) * 100 - 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Simulation Settings
          </h3>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Facility Type Selection */}
            <div className="lg:col-span-3 mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                Facility Type
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSettings({...settings, facilityType: 'indoor'})}
                  className={`p-4 rounded-lg border transition-all ${
                    settings.facilityType === 'indoor'
                      ? 'bg-purple-600/20 border-purple-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    settings.facilityType === 'indoor' ? 'text-purple-300' : 'text-gray-300'
                  }`}>Indoor Facility</div>
                  <div className="text-xs text-gray-400">100% artificial lighting</div>
                  <div className="text-xs text-gray-500 mt-1">Higher energy costs</div>
                </button>
                <button
                  onClick={() => setSettings({...settings, facilityType: 'greenhouse'})}
                  className={`p-4 rounded-lg border transition-all ${
                    settings.facilityType === 'greenhouse'
                      ? 'bg-purple-600/20 border-purple-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    settings.facilityType === 'greenhouse' ? 'text-purple-300' : 'text-gray-300'
                  }`}>Greenhouse</div>
                  <div className="text-xs text-gray-400">Natural light primary</div>
                  <div className="text-xs text-gray-500 mt-1">Seasonal variations</div>
                </button>
                <button
                  onClick={() => setSettings({...settings, facilityType: 'hybrid'})}
                  className={`p-4 rounded-lg border transition-all ${
                    settings.facilityType === 'hybrid'
                      ? 'bg-purple-600/20 border-purple-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    settings.facilityType === 'hybrid' ? 'text-purple-300' : 'text-gray-300'
                  }`}>Hybrid</div>
                  <div className="text-xs text-gray-400">Supplemental lighting</div>
                  <div className="text-xs text-gray-500 mt-1">Best of both</div>
                </button>
              </div>
            </div>
            
            {/* Facility Settings */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Facility Dimensions</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Width (m)</label>
                    <input
                      type="number"
                      value={settings.roomWidth}
                      onChange={(e) => setSettings({...settings, roomWidth: Number(e.target.value)})}
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Length (m)</label>
                    <input
                      type="number"
                      value={settings.roomLength}
                      onChange={(e) => setSettings({...settings, roomLength: Number(e.target.value)})}
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Height (m)</label>
                    <input
                      type="number"
                      value={settings.roomHeight}
                      onChange={(e) => setSettings({...settings, roomHeight: Number(e.target.value)})}
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400">Crop Type</label>
                  <select
                    value={settings.cropType}
                    onChange={(e) => setSettings({...settings, cropType: e.target.value, plantAge: 1, growthStage: 'seedling' as const})}
                    className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  >
                    <optgroup label="Leafy Greens">
                      <option value="lettuce_butterhead">Butterhead Lettuce</option>
                      <option value="lettuce_romaine">Romaine Lettuce</option>
                      <option value="spinach">Spinach</option>
                      <option value="kale">Kale</option>
                    </optgroup>
                    <optgroup label="Herbs">
                      <option value="basil_genovese">Genovese Basil</option>
                      <option value="cilantro">Cilantro</option>
                    </optgroup>
                    <optgroup label="Fruiting Crops">
                      <option value="tomato_cherry">Cherry Tomato</option>
                      <option value="cucumber">Cucumber</option>
                      <option value="strawberry">Strawberry</option>
                    </optgroup>
                    <optgroup label="Cannabis">
                      <option value="cannabis_indica">Cannabis Indica</option>
                    </optgroup>
                    <optgroup label="Microgreens">
                      <option value="microgreens_pea">Pea Microgreens</option>
                    </optgroup>
                    <optgroup label="Ornamental">
                      <option value="petunia">Petunia</option>
                    </optgroup>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400">Growth Stage</label>
                  <select
                    value={settings.growthStage}
                    onChange={(e) => setSettings({...settings, growthStage: e.target.value as any})}
                    className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  >
                    <option value="seedling">Seedling</option>
                    <option value="vegetative">Vegetative</option>
                    <option value="flowering">Flowering</option>
                    <option value="fruiting">Fruiting</option>
                    <option value="harvest">Harvest</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400">Plant Age (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={settings.plantAge}
                    onChange={(e) => setSettings({...settings, plantAge: Number(e.target.value)})}
                    className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Lighting Schedule */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Lighting Schedule</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Start Hour</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={settings.lightingSchedule.startHour}
                      onChange={(e) => setSettings({
                        ...settings, 
                        lightingSchedule: {...settings.lightingSchedule, startHour: Number(e.target.value)}
                      })}
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">End Hour</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={settings.lightingSchedule.endHour}
                      onChange={(e) => setSettings({
                        ...settings, 
                        lightingSchedule: {...settings.lightingSchedule, endHour: Number(e.target.value)}
                      })}
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400">
                    Max Intensity (PPFD) {settings.facilityType === 'greenhouse' && '(Supplemental)'}
                  </label>
                  <input
                    type="number"
                    value={settings.lightingSchedule.maxIntensity}
                    onChange={(e) => setSettings({
                      ...settings, 
                      lightingSchedule: {...settings.lightingSchedule, maxIntensity: Number(e.target.value)}
                    })}
                    className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    placeholder={settings.facilityType === 'greenhouse' ? 'Supplemental only' : ''}
                  />
                </div>
              </div>
            </div>
            
            {/* Environmental Targets */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Environmental Targets</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Day Temp (°C)</label>
                    <input
                      type="number"
                      value={settings.dayTemperature}
                      onChange={(e) => setSettings({...settings, dayTemperature: Number(e.target.value)})}
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Night Temp (°C)</label>
                    <input
                      type="number"
                      value={settings.nightTemperature}
                      onChange={(e) => setSettings({...settings, nightTemperature: Number(e.target.value)})}
                      className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400">Target Humidity (%)</label>
                  <input
                    type="number"
                    value={settings.targetHumidity}
                    onChange={(e) => setSettings({...settings, targetHumidity: Number(e.target.value)})}
                    className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-400">Target CO2 (ppm)</label>
                  <input
                    type="number"
                    value={settings.targetCO2}
                    onChange={(e) => setSettings({...settings, targetCO2: Number(e.target.value)})}
                    className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Multi-Cycle Planning */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Planning Mode</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Planning Type</label>
                <select
                  value={settings.planningMode}
                  onChange={(e) => setSettings({...settings, planningMode: e.target.value as any})}
                  className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                >
                  <option value="single">Single Cycle</option>
                  <option value="multi-cycle">Multi-Cycle</option>
                  <option value="annual">Annual Planning</option>
                </select>
              </div>
              
              {settings.planningMode !== 'single' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400">Total Cycles</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={settings.totalCycles}
                        onChange={(e) => setSettings({...settings, totalCycles: Number(e.target.value)})}
                        className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Current Season</label>
                      <select
                        value={settings.currentSeason}
                        onChange={(e) => setSettings({...settings, currentSeason: e.target.value as any})}
                        className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      >
                        <option value="winter">Winter</option>
                        <option value="spring">Spring</option>
                        <option value="summer">Summer</option>
                        <option value="fall">Fall</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.successionPlanting}
                        onChange={(e) => setSettings({...settings, successionPlanting: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">Succession Planting</span>
                    </label>
                  </div>
                  
                  {settings.successionPlanting && (
                    <div>
                      <label className="text-xs text-gray-400">Succession Interval (days)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.successionInterval}
                        onChange={(e) => setSettings({...settings, successionInterval: Number(e.target.value)})}
                        className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.seasonalAdjustments}
                        onChange={(e) => setSettings({...settings, seasonalAdjustments: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">Seasonal Adjustments</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* System Options */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-3">System Options</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'hvacEnabled', label: 'HVAC Control' },
                { key: 'co2Injection', label: 'CO2 Injection' },
                { key: 'adaptiveControl', label: 'Adaptive Control' },
                { key: 'energyOptimization', label: 'Energy Optimization' }
              ].map(option => (
                <label key={option.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[option.key as keyof SimulationSettings] as boolean}
                    onChange={(e) => setSettings({
                      ...settings, 
                      [option.key]: e.target.checked
                    })}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Economic Inputs */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              Economic Inputs
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400">Electricity Rate ($/kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.electricityRate}
                  onChange={(e) => setSettings({...settings, electricityRate: Number(e.target.value)})}
                  className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400">Natural Gas Rate ($/therm)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.naturalGasRate}
                  onChange={(e) => setSettings({...settings, naturalGasRate: Number(e.target.value)})}
                  className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400">Water Rate ($/gallon)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={settings.waterRate}
                  onChange={(e) => setSettings({...settings, waterRate: Number(e.target.value)})}
                  className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400">Labor Rate ($/hour)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={settings.laborRate}
                  onChange={(e) => setSettings({...settings, laborRate: Number(e.target.value)})}
                  className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400">Nutrient Cost ($/kg)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={settings.nutrientCostPerKg}
                  onChange={(e) => setSettings({...settings, nutrientCostPerKg: Number(e.target.value)})}
                  className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400">Market Price Override ($/kg)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={settings.marketPriceOverride || ''}
                  onChange={(e) => setSettings({...settings, marketPriceOverride: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full mt-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  placeholder="Use crop default"
                />
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-400">
                <strong className="text-gray-300">Note:</strong> Economic inputs are used to calculate profitability projections. 
                {settings.facilityType === 'greenhouse' && ' Greenhouse operations typically have lower electricity costs but may have higher heating costs in winter.'}
                {settings.facilityType === 'indoor' && ' Indoor facilities have higher electricity costs but more predictable operating expenses.'}
                {settings.facilityType === 'hybrid' && ' Hybrid facilities balance natural light benefits with supplemental lighting costs.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}