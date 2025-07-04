'use client';

import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Calendar,
  TrendingUp,
  Target,
  Zap,
  Thermometer,
  Droplets,
  Wind,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Download,
  RefreshCw,
  Clock,
  Award,
  Activity,
  Sun
} from 'lucide-react';

interface CannabisStrain {
  id: string;
  name: string;
  type: 'indica' | 'sativa' | 'hybrid';
  genetics: string;
  thcRange: [number, number]; // % THC
  cbdRange: [number, number]; // % CBD
  floweringTime: number; // days
  yieldExpected: number; // grams per plant
  growthCharacteristics: {
    heightMultiplier: number; // stretch factor during flower
    nodeSpacing: 'tight' | 'medium' | 'loose';
    branchingPattern: 'bushy' | 'tall' | 'balanced';
    lightSensitivity: 'low' | 'medium' | 'high';
  };
  environmentalPrefs: {
    temperature: { veg: [number, number], flower: [number, number] };
    humidity: { veg: [number, number], flower: [number, number] };
    co2: { veg: [number, number], flower: [number, number] };
  };
  lightingProfile: {
    vegetative: {
      ppfd: [number, number];
      dli: [number, number];
      spectrum: { blue: number, green: number, red: number, farRed: number, uv: number };
      photoperiod: number;
    };
    flowering: {
      ppfd: [number, number];
      dli: [number, number];
      spectrum: { blue: number, green: number, red: number, farRed: number, uv: number };
      photoperiod: number;
    };
  };
}

interface GrowthStageConfig {
  stage: 'seedling' | 'vegetative' | 'transition' | 'early-flower' | 'mid-flower' | 'late-flower' | 'harvest';
  duration: number; // days
  currentDay: number;
  lightingConfig: {
    ppfd: number;
    dli: number;
    photoperiod: number;
    spectrum: { blue: number, green: number, red: number, farRed: number, uv: number };
  };
  environmentalConfig: {
    temperature: { day: number, night: number };
    humidity: number;
    co2: number;
    airflow: number; // CFM
  };
  objectives: string[];
  keyMetrics: string[];
}

interface YieldProjection {
  estimatedYield: number; // grams per plant
  qualityScore: number; // 0-100
  potencyEstimate: { thc: number, cbd: number };
  harvestDate: Date;
  energyCost: number; // $ per gram
  roi: number; // return on investment %
  risksIdentified: string[];
  optimizationTips: string[];
}

interface CanopyAnalysis {
  coveragePercentage: number;
  uniformityScore: number;
  dliDistribution: { min: number, max: number, avg: number, cv: number };
  hotspots: Array<{ x: number, y: number, severity: 'low' | 'medium' | 'high' }>;
  plantCount: number;
  sqftPerPlant: number;
  recommendedActions: string[];
}

export function CannabisOptimizationPanel() {
  const [selectedStrain, setSelectedStrain] = useState<string>('gorilla-glue-4');
  const [currentStage, setCurrentStage] = useState<GrowthStageConfig | null>(null);
  const [yieldProjection, setYieldProjection] = useState<YieldProjection | null>(null);
  const [canopyAnalysis, setCanopyAnalysis] = useState<CanopyAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [facilityType, setFacilityType] = useState<'indoor' | 'greenhouse' | 'hybrid'>('indoor');
  const [cultivationMethod, setCultivationMethod] = useState<'soil' | 'hydro' | 'coco' | 'dwc' | 'nft'>('hydro');
  
  // Professional cannabis strain database
  const cannabisStrains: CannabisStrain[] = [
    {
      id: 'gorilla-glue-4',
      name: 'Gorilla Glue #4',
      type: 'hybrid',
      genetics: 'Chem Sis × Sour Dubb × Chocolate Diesel',
      thcRange: [25, 30],
      cbdRange: [0.1, 0.3],
      floweringTime: 63,
      yieldExpected: 450,
      growthCharacteristics: {
        heightMultiplier: 2.2,
        nodeSpacing: 'medium',
        branchingPattern: 'bushy',
        lightSensitivity: 'medium'
      },
      environmentalPrefs: {
        temperature: { veg: [24, 27], flower: [21, 24] },
        humidity: { veg: [60, 70], flower: [45, 55] },
        co2: { veg: [800, 1000], flower: [1000, 1200] }
      },
      lightingProfile: {
        vegetative: {
          ppfd: [400, 600],
          dli: [25, 35],
          spectrum: { blue: 30, green: 20, red: 45, farRed: 3, uv: 2 },
          photoperiod: 18
        },
        flowering: {
          ppfd: [700, 900],
          dli: [40, 50],
          spectrum: { blue: 15, green: 15, red: 60, farRed: 5, uv: 5 },
          photoperiod: 12
        }
      }
    },
    {
      id: 'blue-dream',
      name: 'Blue Dream',
      type: 'sativa',
      genetics: 'Blueberry × Haze',
      thcRange: [18, 24],
      cbdRange: [0.1, 0.2],
      floweringTime: 70,
      yieldExpected: 525,
      growthCharacteristics: {
        heightMultiplier: 2.8,
        nodeSpacing: 'loose',
        branchingPattern: 'tall',
        lightSensitivity: 'high'
      },
      environmentalPrefs: {
        temperature: { veg: [22, 26], flower: [20, 23] },
        humidity: { veg: [55, 65], flower: [40, 50] },
        co2: { veg: [900, 1100], flower: [1100, 1300] }
      },
      lightingProfile: {
        vegetative: {
          ppfd: [500, 700],
          dli: [30, 40],
          spectrum: { blue: 35, green: 20, red: 40, farRed: 3, uv: 2 },
          photoperiod: 18
        },
        flowering: {
          ppfd: [800, 1000],
          dli: [45, 55],
          spectrum: { blue: 20, green: 15, red: 55, farRed: 5, uv: 5 },
          photoperiod: 12
        }
      }
    },
    {
      id: 'og-kush',
      name: 'OG Kush',
      type: 'indica',
      genetics: 'Chemdawg × Lemon Thai × Pakistani Kush',
      thcRange: [20, 26],
      cbdRange: [0.1, 0.2],
      floweringTime: 56,
      yieldExpected: 380,
      growthCharacteristics: {
        heightMultiplier: 1.8,
        nodeSpacing: 'tight',
        branchingPattern: 'bushy',
        lightSensitivity: 'low'
      },
      environmentalPrefs: {
        temperature: { veg: [23, 26], flower: [22, 25] },
        humidity: { veg: [65, 75], flower: [50, 60] },
        co2: { veg: [700, 900], flower: [900, 1100] }
      },
      lightingProfile: {
        vegetative: {
          ppfd: [350, 550],
          dli: [22, 32],
          spectrum: { blue: 25, green: 25, red: 45, farRed: 3, uv: 2 },
          photoperiod: 18
        },
        flowering: {
          ppfd: [600, 800],
          dli: [35, 45],
          spectrum: { blue: 12, green: 18, red: 60, farRed: 5, uv: 5 },
          photoperiod: 12
        }
      }
    }
  ];

  // Generate growth stage configuration
  const generateStageConfig = (strain: CannabisStrain, stage: string, day: number): GrowthStageConfig => {
    const stageConfigs: Record<string, Partial<GrowthStageConfig>> = {
      'seedling': {
        stage: 'seedling',
        duration: 14,
        objectives: ['Root development', 'First true leaves', 'Disease resistance'],
        keyMetrics: ['Root zone temperature', 'Soil moisture', 'Cotyledon health']
      },
      'vegetative': {
        stage: 'vegetative',
        duration: 28,
        objectives: ['Biomass accumulation', 'Node development', 'Canopy formation'],
        keyMetrics: ['Node spacing', 'Leaf area index', 'Stem thickness']
      },
      'transition': {
        stage: 'transition',
        duration: 14,
        objectives: ['Sex identification', 'Stretch control', 'Flower site initiation'],
        keyMetrics: ['Height increase', 'Pre-flower development', 'Hormonal balance']
      },
      'early-flower': {
        stage: 'early-flower',
        duration: 21,
        objectives: ['Flower cluster development', 'Terpene initiation', 'Calyx formation'],
        keyMetrics: ['Flower site density', 'Trichome development', 'Bud structure']
      },
      'mid-flower': {
        stage: 'mid-flower',
        duration: 21,
        objectives: ['Bud density', 'Resin production', 'THC synthesis'],
        keyMetrics: ['Trichome density', 'Bud weight', 'Cannabinoid content']
      },
      'late-flower': {
        stage: 'late-flower',
        duration: 14,
        objectives: ['Final swell', 'Terpene maturation', 'Harvest timing'],
        keyMetrics: ['Trichome color', 'Pistil maturity', 'Final weight']
      }
    };

    const config = stageConfigs[stage];
    const isFlowering = ['transition', 'early-flower', 'mid-flower', 'late-flower'].includes(stage);
    const lightProfile = isFlowering ? strain.lightingProfile.flowering : strain.lightingProfile.vegetative;
    const tempProfile = isFlowering ? strain.environmentalPrefs.temperature.flower : strain.environmentalPrefs.temperature.veg;
    const humidityProfile = isFlowering ? strain.environmentalPrefs.humidity.flower : strain.environmentalPrefs.humidity.veg;
    const co2Profile = isFlowering ? strain.environmentalPrefs.co2.flower : strain.environmentalPrefs.co2.veg;

    return {
      stage: config?.stage as any || 'vegetative',
      duration: config?.duration || 28,
      currentDay: day,
      lightingConfig: {
        ppfd: lightProfile.ppfd[0] + (lightProfile.ppfd[1] - lightProfile.ppfd[0]) * 0.8,
        dli: lightProfile.dli[0] + (lightProfile.dli[1] - lightProfile.dli[0]) * 0.8,
        photoperiod: lightProfile.photoperiod,
        spectrum: lightProfile.spectrum
      },
      environmentalConfig: {
        temperature: { 
          day: tempProfile[0] + (tempProfile[1] - tempProfile[0]) * 0.7,
          night: tempProfile[0] + (tempProfile[1] - tempProfile[0]) * 0.3
        },
        humidity: humidityProfile[0] + (humidityProfile[1] - humidityProfile[0]) * 0.6,
        co2: co2Profile[0] + (co2Profile[1] - co2Profile[0]) * 0.8,
        airflow: 50 // CFM per plant
      },
      objectives: config?.objectives || [],
      keyMetrics: config?.keyMetrics || []
    };
  };

  // Calculate yield projection with advanced modeling
  const calculateYieldProjection = (strain: CannabisStrain, stage: GrowthStageConfig): YieldProjection => {
    // Base yield from strain genetics
    let estimatedYield = strain.yieldExpected;
    
    // Environmental factors
    const tempOptimal = stage.environmentalConfig.temperature.day >= strain.environmentalPrefs.temperature.flower[0] && 
                       stage.environmentalConfig.temperature.day <= strain.environmentalPrefs.temperature.flower[1];
    const humidityOptimal = stage.environmentalConfig.humidity >= strain.environmentalPrefs.humidity.flower[0] && 
                           stage.environmentalConfig.humidity <= strain.environmentalPrefs.humidity.flower[1];
    const co2Optimal = stage.environmentalConfig.co2 >= strain.environmentalPrefs.co2.flower[0] && 
                      stage.environmentalConfig.co2 <= strain.environmentalPrefs.co2.flower[1];
    
    // Lighting factors
    const ppfdOptimal = stage.lightingConfig.ppfd >= strain.lightingProfile.flowering.ppfd[0] && 
                       stage.lightingConfig.ppfd <= strain.lightingProfile.flowering.ppfd[1];
    const dliOptimal = stage.lightingConfig.dli >= strain.lightingProfile.flowering.dli[0] && 
                      stage.lightingConfig.dli <= strain.lightingProfile.flowering.dli[1];
    
    // Apply optimization multipliers
    if (tempOptimal) estimatedYield *= 1.1;
    if (humidityOptimal) estimatedYield *= 1.05;
    if (co2Optimal) estimatedYield *= 1.15;
    if (ppfdOptimal) estimatedYield *= 1.2;
    if (dliOptimal) estimatedYield *= 1.1;
    
    // Cultivation method bonus
    const methodMultiplier = {
      'dwc': 1.25,
      'hydro': 1.15,
      'coco': 1.1,
      'nft': 1.2,
      'soil': 1.0
    };
    estimatedYield *= methodMultiplier[cultivationMethod];
    
    // Quality scoring
    let qualityScore = 75; // Base score
    if (tempOptimal && humidityOptimal) qualityScore += 10;
    if (co2Optimal) qualityScore += 8;
    if (ppfdOptimal && dliOptimal) qualityScore += 12;
    
    // Potency estimation
    const thcBase = (strain.thcRange[0] + strain.thcRange[1]) / 2;
    const cbdBase = (strain.cbdRange[0] + strain.cbdRange[1]) / 2;
    const potencyMultiplier = qualityScore / 100;
    
    // Risk assessment
    const risks = [];
    if (!tempOptimal) risks.push('Temperature stress may reduce yield and quality');
    if (!humidityOptimal) risks.push('Humidity levels may increase disease risk');
    if (!ppfdOptimal) risks.push('Suboptimal light intensity may reduce photosynthesis');
    if (stage.lightingConfig.dli > 55) risks.push('Excessive DLI may cause light burn');
    
    // Optimization tips
    const tips = [];
    if (stage.lightingConfig.ppfd < strain.lightingProfile.flowering.ppfd[0]) {
      tips.push('Increase PPFD by lowering fixtures or increasing power');
    }
    if (stage.environmentalConfig.co2 < 1000) {
      tips.push('CO2 supplementation could increase yield by 15-20%');
    }
    if (cultivationMethod === 'soil') {
      tips.push('Consider hydroponic system for 15-25% yield increase');
    }
    
    return {
      estimatedYield: Math.round(estimatedYield),
      qualityScore: Math.min(100, Math.round(qualityScore)),
      potencyEstimate: {
        thc: Math.round(thcBase * potencyMultiplier * 10) / 10,
        cbd: Math.round(cbdBase * potencyMultiplier * 10) / 10
      },
      harvestDate: new Date(Date.now() + (strain.floweringTime - stage.currentDay) * 24 * 60 * 60 * 1000),
      energyCost: Math.round((stage.lightingConfig.ppfd * 0.002 + 0.5) * 100) / 100, // $/gram estimate
      roi: Math.round(((estimatedYield * 8 - estimatedYield * 2) / (estimatedYield * 2)) * 100), // Rough ROI %
      risksIdentified: risks,
      optimizationTips: tips
    };
  };

  // Generate canopy analysis
  const generateCanopyAnalysis = (): CanopyAnalysis => {
    return {
      coveragePercentage: 78 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
      uniformityScore: 82 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 12,
      dliDistribution: {
        min: 35 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5,
        max: 52 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8,
        avg: 43 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5,
        cv: 8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 7
      },
      hotspots: [
        { x: 0.3, y: 0.7, severity: 'medium' },
        { x: 0.8, y: 0.2, severity: 'low' }
      ],
      plantCount: 16,
      sqftPerPlant: 4,
      recommendedActions: [
        'Adjust fixture height in northwest corner',
        'Consider adding supplemental lighting for edge plants',
        'Implement SCROG netting for canopy uniformity'
      ]
    };
  };

  // Run comprehensive analysis
  const runOptimizationAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const strain = cannabisStrains.find(s => s.id === selectedStrain);
    if (strain) {
      const stageConfig = generateStageConfig(strain, 'mid-flower', 35);
      const yieldProjection = calculateYieldProjection(strain, stageConfig);
      const canopyAnalysis = generateCanopyAnalysis();
      
      setCurrentStage(stageConfig);
      setYieldProjection(yieldProjection);
      setCanopyAnalysis(canopyAnalysis);
    }
    
    setIsAnalyzing(false);
  };

  // Initialize with default analysis
  useEffect(() => {
    runOptimizationAnalysis();
  }, [selectedStrain, cultivationMethod, facilityType]);

  const selectedStrainData = cannabisStrains.find(s => s.id === selectedStrain);

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Leaf className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Cannabis Cultivation Optimizer</h2>
              <p className="text-sm text-gray-400">Strain-specific optimization for maximum yield and quality</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={runOptimizationAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Update Analysis
                </>
              )}
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Configuration */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Strain</label>
            <select
              value={selectedStrain}
              onChange={(e) => setSelectedStrain(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              {cannabisStrains.map(strain => (
                <option key={strain.id} value={strain.id}>{strain.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Facility Type</label>
            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              <option value="indoor">Indoor Grow</option>
              <option value="greenhouse">Greenhouse</option>
              <option value="hybrid">Hybrid Facility</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cultivation Method</label>
            <select
              value={cultivationMethod}
              onChange={(e) => setCultivationMethod(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              <option value="hydro">Hydroponic</option>
              <option value="dwc">Deep Water Culture</option>
              <option value="nft">NFT System</option>
              <option value="coco">Coco Coir</option>
              <option value="soil">Soil</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Current Stage</label>
            <div className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm">
              {currentStage ? `${currentStage.stage} (Day ${currentStage.currentDay})` : 'Loading...'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Strain Information */}
          {selectedStrainData && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3">Strain Profile</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Type</div>
                  <div className="text-white font-medium capitalize">{selectedStrainData.type}</div>
                </div>
                <div>
                  <div className="text-gray-400">THC Range</div>
                  <div className="text-white font-medium">{selectedStrainData.thcRange[0]}-{selectedStrainData.thcRange[1]}%</div>
                </div>
                <div>
                  <div className="text-gray-400">Flowering Time</div>
                  <div className="text-white font-medium">{selectedStrainData.floweringTime} days</div>
                </div>
                <div>
                  <div className="text-gray-400">Expected Yield</div>
                  <div className="text-white font-medium">{selectedStrainData.yieldExpected}g/plant</div>
                </div>
              </div>
              <div className="mt-3 text-sm">
                <div className="text-gray-400">Genetics</div>
                <div className="text-gray-300">{selectedStrainData.genetics}</div>
              </div>
            </div>
          )}

          {/* Yield Projection */}
          {yieldProjection && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Yield Projection
              </h3>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{yieldProjection.estimatedYield}g</div>
                  <div className="text-sm text-gray-400">Estimated Yield/Plant</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{yieldProjection.qualityScore}</div>
                  <div className="text-sm text-gray-400">Quality Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{yieldProjection.potencyEstimate.thc}%</div>
                  <div className="text-sm text-gray-400">Est. THC</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">${yieldProjection.energyCost}</div>
                  <div className="text-sm text-gray-400">Cost/Gram</div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Projected Harvest</div>
                  <div className="text-white">{yieldProjection.harvestDate.toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-gray-400">ROI Estimate</div>
                  <div className="text-white">{yieldProjection.roi}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Current Stage Configuration */}
          {currentStage && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Current Stage: {currentStage.stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-white mb-2">Lighting Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">PPFD</span>
                      <span className="text-white">{currentStage.lightingConfig.ppfd} µmol/m²/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">DLI</span>
                      <span className="text-white">{currentStage.lightingConfig.dli} mol/m²/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Photoperiod</span>
                      <span className="text-white">{currentStage.lightingConfig.photoperiod}h</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">Environmental Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Day Temp</span>
                      <span className="text-white">{currentStage.environmentalConfig.temperature.day}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Humidity</span>
                      <span className="text-white">{currentStage.environmentalConfig.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CO₂</span>
                      <span className="text-white">{currentStage.environmentalConfig.co2} ppm</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium text-white mb-2">Stage Objectives</h4>
                <div className="flex flex-wrap gap-2">
                  {currentStage.objectives.map((objective, index) => (
                    <span key={index} className="px-2 py-1 bg-green-600/20 text-green-300 text-xs rounded">
                      {objective}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Analysis & Recommendations */}
        <div className="w-80 border-l border-gray-700 p-6 overflow-y-auto space-y-6">
          {/* Canopy Analysis */}
          {canopyAnalysis && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
                Canopy Analysis
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Coverage</span>
                  <span className="text-white">{canopyAnalysis.coveragePercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Uniformity</span>
                  <span className="text-white">{canopyAnalysis.uniformityScore.toFixed(0)}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg DLI</span>
                  <span className="text-white">{canopyAnalysis.dliDistribution.avg.toFixed(1)} mol/m²/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">DLI CV</span>
                  <span className="text-white">{canopyAnalysis.dliDistribution.cv.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plants</span>
                  <span className="text-white">{canopyAnalysis.plantCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sq Ft/Plant</span>
                  <span className="text-white">{canopyAnalysis.sqftPerPlant}</span>
                </div>
              </div>
            </div>
          )}

          {/* Risk Assessment */}
          {yieldProjection && yieldProjection.risksIdentified.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Assessment
              </h3>
              
              <div className="space-y-2">
                {yieldProjection.risksIdentified.map((risk, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optimization Recommendations */}
          {yieldProjection && yieldProjection.optimizationTips.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-400 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Optimization Tips
              </h3>
              
              <div className="space-y-2">
                {yieldProjection.optimizationTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {canopyAnalysis && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-400 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recommended Actions
              </h3>
              
              <div className="space-y-2">
                {canopyAnalysis.recommendedActions.map((action, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}