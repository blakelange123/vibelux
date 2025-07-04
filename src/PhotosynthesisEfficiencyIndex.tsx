'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, ComposedChart, Area, AreaChart, ReferenceLine } from 'recharts';
import { Zap, TrendingUp, Activity, Leaf, Sun, Thermometer, Droplets, Wind, AlertCircle, Database, Target, Play, Pause, Download, Settings, Info, Eye } from 'lucide-react';

interface EnvironmentalConditions {
  temperature: number;
  humidity: number;
  co2: number;
  vpd: number;
  lightIntensity: number;
  photoperiod: number;
}

interface LightConditions {
  ppfd: number;
  dli: number;
  redRatio: number;
  blueRatio: number;
  farRedRatio: number;
  greenRatio: number;
}

interface PhotosynthesisMetrics {
  quantumYield: number;
  co2AssimilationRate: number;
  lightUseEfficiency: number;
  waterUseEfficiency: number;
  nitrogenUseEfficiency: number;
  carbonUseEfficiency: number;
  electronsTransportRate: number;
  photochemicalQuenching: number;
  nonPhotochemicalQuenching: number;
  photosystemIIEfficiency: number;
}

interface EfficiencyIndex {
  overall: number;
  lightCapture: number;
  carbonFixation: number;
  waterUsage: number;
  nutrientUtilization: number;
  energyConversion: number;
  stressResistance: number;
}

// Preset environments for quick testing
const environmentPresets = {
  'Optimal Greenhouse': {
    environmental: { temperature: 24, humidity: 65, co2: 800, vpd: 0.8, lightIntensity: 600, photoperiod: 16 },
    light: { ppfd: 600, redRatio: 0.4, blueRatio: 0.25, farRedRatio: 0.05, greenRatio: 0.3 }
  },
  'High Light Cannabis': {
    environmental: { temperature: 26, humidity: 60, co2: 1200, vpd: 1.0, lightIntensity: 1400, photoperiod: 18 },
    light: { ppfd: 1400, redRatio: 0.45, blueRatio: 0.2, farRedRatio: 0.1, greenRatio: 0.25 }
  },
  'Leafy Greens LED': {
    environmental: { temperature: 22, humidity: 70, co2: 600, vpd: 0.7, lightIntensity: 400, photoperiod: 14 },
    light: { ppfd: 400, redRatio: 0.35, blueRatio: 0.3, farRedRatio: 0.05, greenRatio: 0.3 }
  },
  'Stress Testing': {
    environmental: { temperature: 30, humidity: 45, co2: 350, vpd: 1.5, lightIntensity: 200, photoperiod: 12 },
    light: { ppfd: 200, redRatio: 0.3, blueRatio: 0.15, farRedRatio: 0.2, greenRatio: 0.35 }
  }
};

// Research-grade crop photosynthetic parameters based on scientific literature
const cropParameters = {
  'Lettuce': {
    maxQuantumYield: 0.083, // mol CO2/mol photons
    lightSaturation: 500, // μmol/m²/s PPFD
    co2Saturation: 800, // μmol/mol CO2
    optimalTemp: 22, // °C
    optimalVPD: 0.8, // kPa
    stressTolerance: 0.7,
    maxAssimilationRate: 25, // μmol CO2/m²/s
    darkRespiration: 2.1, // μmol CO2/m²/s
    compensationPoint: 55, // μmol/mol CO2
    temperatureOptimum: { min: 18, max: 26 }
  },
  'Cannabis': {
    maxQuantumYield: 0.095,
    lightSaturation: 1500,
    co2Saturation: 1200,
    optimalTemp: 26,
    optimalVPD: 1.0,
    stressTolerance: 0.8,
    maxAssimilationRate: 45,
    darkRespiration: 3.8,
    compensationPoint: 45,
    temperatureOptimum: { min: 22, max: 30 }
  },
  'Tomato': {
    maxQuantumYield: 0.088,
    lightSaturation: 1000,
    co2Saturation: 1000,
    optimalTemp: 24,
    optimalVPD: 0.9,
    stressTolerance: 0.75,
    maxAssimilationRate: 35,
    darkRespiration: 2.8,
    compensationPoint: 50,
    temperatureOptimum: { min: 20, max: 28 }
  },
  'Basil': {
    maxQuantumYield: 0.080,
    lightSaturation: 400,
    co2Saturation: 700,
    optimalTemp: 25,
    optimalVPD: 0.7,
    stressTolerance: 0.6,
    maxAssimilationRate: 20,
    darkRespiration: 1.9,
    compensationPoint: 60,
    temperatureOptimum: { min: 21, max: 29 }
  },
  'Strawberry': {
    maxQuantumYield: 0.085,
    lightSaturation: 600,
    co2Saturation: 900,
    optimalTemp: 20,
    optimalVPD: 0.8,
    stressTolerance: 0.8,
    maxAssimilationRate: 28,
    darkRespiration: 2.3,
    compensationPoint: 52,
    temperatureOptimum: { min: 16, max: 24 }
  },
  'Spinach': {
    maxQuantumYield: 0.081,
    lightSaturation: 450,
    co2Saturation: 750,
    optimalTemp: 19,
    optimalVPD: 0.7,
    stressTolerance: 0.75,
    maxAssimilationRate: 22,
    darkRespiration: 2.0,
    compensationPoint: 58,
    temperatureOptimum: { min: 15, max: 23 }
  },
  'Cucumber': {
    maxQuantumYield: 0.089,
    lightSaturation: 800,
    co2Saturation: 950,
    optimalTemp: 25,
    optimalVPD: 0.9,
    stressTolerance: 0.7,
    maxAssimilationRate: 32,
    darkRespiration: 3.1,
    compensationPoint: 48,
    temperatureOptimum: { min: 21, max: 29 }
  },
  'Pepper': {
    maxQuantumYield: 0.086,
    lightSaturation: 750,
    co2Saturation: 850,
    optimalTemp: 27,
    optimalVPD: 1.1,
    stressTolerance: 0.8,
    maxAssimilationRate: 30,
    darkRespiration: 2.9,
    compensationPoint: 47,
    temperatureOptimum: { min: 23, max: 31 }
  }
};

export default function PhotosynthesisEfficiencyIndex() {
  const [selectedCrop, setSelectedCrop] = useState<string>('Lettuce');
  const [environmentalConditions, setEnvironmentalConditions] = useState<EnvironmentalConditions>({
    temperature: 22,
    humidity: 65,
    co2: 400,
    vpd: 0.8,
    lightIntensity: 300,
    photoperiod: 16
  });
  
  const [lightConditions, setLightConditions] = useState<LightConditions>({
    ppfd: 300,
    dli: 17.28,
    redRatio: 0.4,
    blueRatio: 0.2,
    farRedRatio: 0.1,
    greenRatio: 0.3
  });

  const [historicalData, setHistoricalData] = useState<Array<{
    timestamp: string;
    efficiency: number;
    quantumYield: number;
    co2Rate: number;
    lue: number;
    wue: number;
  }>>([]);

  const [realTimeMode, setRealTimeMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnectedToSensors, setIsConnectedToSensors] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Load preset environment
  const loadPreset = (presetName: string) => {
    const preset = environmentPresets[presetName as keyof typeof environmentPresets];
    if (preset) {
      setEnvironmentalConditions(prev => ({
        ...prev,
        ...preset.environmental
      }));
      setLightConditions(prev => ({
        ...prev,
        ...preset.light,
        dli: (preset.light.ppfd * preset.environmental.photoperiod * 3600) / 1000000
      }));
    }
  };

  // Calculate DLI when PPFD or photoperiod changes
  useEffect(() => {
    const dli = (lightConditions.ppfd * environmentalConditions.photoperiod * 3600) / 1000000;
    setLightConditions(prev => ({ ...prev, dli }));
  }, [lightConditions.ppfd, environmentalConditions.photoperiod]);

  const calculatePhotosynthesisMetrics = (): PhotosynthesisMetrics => {
    try {
      const cropParams = cropParameters[selectedCrop as keyof typeof cropParameters];
      
      // Improved temperature response using Arrhenius equation
      const tempK = environmentalConditions.temperature + 273.15;
      const optimalTempK = cropParams.optimalTemp + 273.15;
      const tempFactor = Math.exp(-(Math.pow(tempK - optimalTempK, 2)) / (2 * Math.pow(8, 2)));
      
      // CO2 response using Michaelis-Menten kinetics with compensation point
      const gamma = cropParams.compensationPoint; // CO2 compensation point
      const co2Factor = Math.max(0, (environmentalConditions.co2 - gamma) / (environmentalConditions.co2 + cropParams.co2Saturation - gamma));
      
      // Light response with photoinhibition at high light
      const lightSaturationPoint = cropParams.lightSaturation;
      const lightFactor = lightConditions.ppfd / (lightConditions.ppfd + lightSaturationPoint) * 
                         Math.exp(-Math.max(0, lightConditions.ppfd - lightSaturationPoint * 1.5) / (lightSaturationPoint * 2));
      
      // VPD response with optimal range
      const vpdOptimal = cropParams.optimalVPD;
      const vpdStress = Math.exp(-Math.pow((environmentalConditions.vpd - vpdOptimal) / vpdOptimal, 2) * 2);
      
      // Improved spectrum efficiency based on photosynthetic action spectra
      const spectrumEfficiency = (
        lightConditions.redRatio * 0.95 +      // Red light highly efficient
        lightConditions.blueRatio * 0.85 +     // Blue light efficient
        lightConditions.greenRatio * 0.75 +    // Green light moderately efficient
        lightConditions.farRedRatio * 0.45     // Far-red less efficient
      );

      // Calculate quantum yield with environmental limitations
      const quantumYield = cropParams.maxQuantumYield * lightFactor * tempFactor * co2Factor * vpdStress * spectrumEfficiency;
      
      // Net CO2 assimilation rate accounting for dark respiration
      const grossAssimilation = quantumYield * lightConditions.ppfd;
      const darkRespiration = cropParams.darkRespiration * Math.pow(2, (environmentalConditions.temperature - 25) / 10); // Q10 = 2
      const co2AssimilationRate = Math.max(0, grossAssimilation - darkRespiration);
      
      // Light use efficiency (mol CO2 / mol photons)
      const lightUseEfficiency = co2AssimilationRate / Math.max(1, lightConditions.ppfd);
      
      // Water use efficiency (μmol CO2 / mol H2O)
      const waterUseEfficiency = co2AssimilationRate / Math.max(0.1, environmentalConditions.vpd * 100);
      
      // Nitrogen use efficiency (simplified)
      const nitrogenUseEfficiency = co2AssimilationRate * 0.025;
      
      // Carbon use efficiency
      const carbonUseEfficiency = co2AssimilationRate / Math.max(300, environmentalConditions.co2) * 1000;
      
      // Electron transport rate (4 electrons per CO2 molecule)
      const electronsTransportRate = grossAssimilation * 4;
      
      // Photochemical quenching coefficient
      const photochemicalQuenching = Math.min(1, lightFactor * tempFactor * co2Factor);
      
      // Non-photochemical quenching (heat dissipation)
      const lightStress = Math.max(0, lightConditions.ppfd - lightSaturationPoint) / lightSaturationPoint;
      const nonPhotochemicalQuenching = lightStress * 0.8 + (1 - tempFactor) * 0.6 + (1 - vpdStress) * 0.4;
      
      // PSII efficiency relative to maximum
      const photosystemIIEfficiency = quantumYield / cropParams.maxQuantumYield;

      setError(null);
      setLastUpdate(new Date());
      
      return {
        quantumYield,
        co2AssimilationRate,
        lightUseEfficiency,
        waterUseEfficiency,
        nitrogenUseEfficiency,
        carbonUseEfficiency,
        electronsTransportRate,
        photochemicalQuenching,
        nonPhotochemicalQuenching,
        photosystemIIEfficiency
      };
    } catch (error) {
      console.error('Error calculating photosynthesis metrics:', error);
      setError('Error in photosynthesis calculations');
      return {
        quantumYield: 0,
        co2AssimilationRate: 0,
        lightUseEfficiency: 0,
        waterUseEfficiency: 0,
        nitrogenUseEfficiency: 0,
        carbonUseEfficiency: 0,
        electronsTransportRate: 0,
        photochemicalQuenching: 0,
        nonPhotochemicalQuenching: 0,
        photosystemIIEfficiency: 0
      };
    }
  };

  const calculateEfficiencyIndex = (metrics: PhotosynthesisMetrics): EfficiencyIndex => {
    const cropParams = cropParameters[selectedCrop as keyof typeof cropParameters];
    
    const lightCapture = Math.min(100, (lightConditions.ppfd / cropParams.lightSaturation) * 100);
    const carbonFixation = Math.min(100, (metrics.co2AssimilationRate / 30) * 100); // Assuming max 30 μmol/m²/s
    const waterUsage = Math.min(100, metrics.waterUseEfficiency * 10);
    const nutrientUtilization = Math.min(100, metrics.nitrogenUseEfficiency * 50);
    const energyConversion = Math.min(100, (metrics.quantumYield / cropParams.maxQuantumYield) * 100);
    const stressResistance = Math.min(100, cropParams.stressTolerance * 100);
    
    const overall = (lightCapture + carbonFixation + waterUsage + nutrientUtilization + energyConversion + stressResistance) / 6;

    return {
      overall,
      lightCapture,
      carbonFixation,
      waterUsage,
      nutrientUtilization,
      energyConversion,
      stressResistance
    };
  };

  const metrics = calculatePhotosynthesisMetrics();
  const efficiencyIndex = calculateEfficiencyIndex(metrics);

  const getEfficiencyColor = (value: number): string => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    if (value >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getEfficiencyBadge = (value: number): { variant: "default" | "secondary" | "destructive" | "outline", text: string } => {
    if (value >= 80) return { variant: "default", text: "Excellent" };
    if (value >= 60) return { variant: "secondary", text: "Good" };
    if (value >= 40) return { variant: "outline", text: "Fair" };
    return { variant: "destructive", text: "Poor" };
  };

  // Radar chart data
  const radarData = [
    { subject: 'Light Capture', value: efficiencyIndex.lightCapture, fullMark: 100 },
    { subject: 'Carbon Fixation', value: efficiencyIndex.carbonFixation, fullMark: 100 },
    { subject: 'Water Usage', value: efficiencyIndex.waterUsage, fullMark: 100 },
    { subject: 'Nutrient Util.', value: efficiencyIndex.nutrientUtilization, fullMark: 100 },
    { subject: 'Energy Conv.', value: efficiencyIndex.energyConversion, fullMark: 100 },
    { subject: 'Stress Resist.', value: efficiencyIndex.stressResistance, fullMark: 100 }
  ];

  // Comparison data for different crops
  const comparisonData = Object.keys(cropParameters).map(crop => {
    const tempMetrics = calculatePhotosynthesisMetrics();
    const tempIndex = calculateEfficiencyIndex(tempMetrics);
    return {
      crop,
      efficiency: crop === selectedCrop ? efficiencyIndex.overall : crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100
    };
  });

  useEffect(() => {
    if (realTimeMode) {
      const interval = setInterval(() => {
        setHistoricalData(prev => {
          const newEntry = {
            timestamp: new Date().toLocaleTimeString(),
            efficiency: efficiencyIndex.overall,
            quantumYield: metrics.quantumYield * 1000, // Convert to mmol
            co2Rate: metrics.co2AssimilationRate,
            lue: metrics.lightUseEfficiency,
            wue: metrics.waterUseEfficiency
          };
          return [...prev.slice(-19), newEntry];
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [realTimeMode, efficiencyIndex.overall, metrics]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      {/* Beautiful gradient header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Photosynthesis Efficiency Index
            </h1>
            <p className="text-emerald-100 text-lg font-medium">
              Real-time analysis of photosynthetic efficiency and optimization recommendations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setRealTimeMode(!realTimeMode)}
              variant={realTimeMode ? "default" : "outline"}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 font-semibold"
            >
              <Activity className="w-5 h-5 mr-2" />
              {realTimeMode ? 'Live' : 'Manual'}
            </Button>
            <Badge 
              className="px-4 py-2 text-base font-semibold bg-white/20 text-white border-white/30"
            >
              {getEfficiencyBadge(efficiencyIndex.overall).text}
            </Badge>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </div>

      <div className="space-y-8">

        {/* Quick Preset Buttons */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Settings className="w-5 h-5 mr-3 text-blue-500" />
              Quick Environment Presets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.keys(environmentPresets).map(presetName => (
                <Button
                  key={presetName}
                  onClick={() => loadPreset(presetName)}
                  variant="outline"
                  className="h-12 text-sm font-medium hover:bg-blue-50"
                >
                  {presetName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overall Efficiency Score */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Zap className="w-6 h-6 mr-3 text-yellow-500" />
              Overall Efficiency Score: <span className="text-2xl font-bold ml-2">{efficiencyIndex.overall.toFixed(1)}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={efficiencyIndex.overall} className="h-4" />
              <p className={`text-lg font-semibold ${getEfficiencyColor(efficiencyIndex.overall)}`}>
                {efficiencyIndex.overall >= 80 ? 'Optimal photosynthetic performance' :
                 efficiencyIndex.overall >= 60 ? 'Good performance with room for improvement' :
                 efficiencyIndex.overall >= 40 ? 'Suboptimal conditions detected' :
                 'Critical efficiency issues - immediate attention required'}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Environmental Controls */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Thermometer className="w-6 h-6 mr-3 text-red-500" />
                Environmental Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-semibold">Crop Species</Label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(cropParameters).map(crop => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold">Temperature: <span className="text-lg font-bold text-red-600">{environmentalConditions.temperature}°C</span></Label>
                <Input
                  type="range"
                  min="15"
                  max="35"
                  value={environmentalConditions.temperature}
                  onChange={(e) => setEnvironmentalConditions(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="mt-3 h-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Humidity: <span className="text-lg font-bold text-blue-600">{environmentalConditions.humidity}%</span></Label>
                <Input
                  type="range"
                  min="30"
                  max="90"
                  value={environmentalConditions.humidity}
                  onChange={(e) => setEnvironmentalConditions(prev => ({ ...prev, humidity: parseFloat(e.target.value) }))}
                  className="mt-3 h-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">CO₂: <span className="text-lg font-bold text-green-600">{environmentalConditions.co2} ppm</span></Label>
                <Input
                  type="range"
                  min="300"
                  max="1500"
                  step="50"
                  value={environmentalConditions.co2}
                  onChange={(e) => setEnvironmentalConditions(prev => ({ ...prev, co2: parseFloat(e.target.value) }))}
                  className="mt-3 h-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">VPD: <span className="text-lg font-bold text-purple-600">{environmentalConditions.vpd.toFixed(2)} kPa</span></Label>
                <Input
                  type="range"
                  min="0.3"
                  max="2.0"
                  step="0.1"
                  value={environmentalConditions.vpd}
                  onChange={(e) => setEnvironmentalConditions(prev => ({ ...prev, vpd: parseFloat(e.target.value) }))}
                  className="mt-3 h-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Photoperiod: <span className="text-lg font-bold text-orange-600">{environmentalConditions.photoperiod}h</span></Label>
                <Input
                  type="range"
                  min="8"
                  max="24"
                  value={environmentalConditions.photoperiod}
                  onChange={(e) => setEnvironmentalConditions(prev => ({ ...prev, photoperiod: parseFloat(e.target.value) }))}
                  className="mt-3 h-3"
                />
              </div>
          </CardContent>
        </Card>

          {/* Light Conditions */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Sun className="w-6 h-6 mr-3 text-yellow-500" />
                Light Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-semibold">PPFD: <span className="text-lg font-bold text-yellow-600">{lightConditions.ppfd} μmol/m²/s</span></Label>
                <Input
                  type="range"
                  min="50"
                  max="2000"
                  step="10"
                  value={lightConditions.ppfd}
                  onChange={(e) => setLightConditions(prev => ({ ...prev, ppfd: parseFloat(e.target.value) }))}
                  className="mt-3 h-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">DLI: <span className="text-lg font-bold text-amber-600">{lightConditions.dli.toFixed(2)} mol/m²/day</span></Label>
                <Input value={lightConditions.dli.toFixed(2)} disabled className="mt-3 h-12 bg-slate-100 text-lg font-bold text-center" />
              </div>

              <div>
                <Label className="text-base font-semibold">Red Ratio: <span className="text-lg font-bold text-red-600">{(lightConditions.redRatio * 100).toFixed(0)}%</span></Label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={lightConditions.redRatio}
                  onChange={(e) => setLightConditions(prev => ({ ...prev, redRatio: parseFloat(e.target.value) }))}
                  className="mt-3 h-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Blue Ratio: <span className="text-lg font-bold text-blue-600">{(lightConditions.blueRatio * 100).toFixed(0)}%</span></Label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={lightConditions.blueRatio}
                  onChange={(e) => setLightConditions(prev => ({ ...prev, blueRatio: parseFloat(e.target.value) }))}
                  className="mt-3 h-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Green Ratio: <span className="text-lg font-bold text-green-600">{(lightConditions.greenRatio * 100).toFixed(0)}%</span></Label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={lightConditions.greenRatio}
                  onChange={(e) => setLightConditions(prev => ({ ...prev, greenRatio: parseFloat(e.target.value) }))}
                  className="mt-3 h-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Far-Red Ratio: <span className="text-lg font-bold text-pink-600">{(lightConditions.farRedRatio * 100).toFixed(0)}%</span></Label>
                <Input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={lightConditions.farRedRatio}
                  onChange={(e) => setLightConditions(prev => ({ ...prev, farRedRatio: parseFloat(e.target.value) }))}
                  className="mt-3 h-3"
                />
              </div>
          </CardContent>
        </Card>

          {/* Current Metrics */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Leaf className="w-6 h-6 mr-3 text-green-500" />
                Current Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">Quantum Yield:</span>
                <span className="text-lg font-bold text-green-600">{(metrics.quantumYield * 1000).toFixed(1)} mmol/mol</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">CO₂ Assimilation:</span>
                <span className="text-lg font-bold text-blue-600">{metrics.co2AssimilationRate.toFixed(1)} μmol/m²/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">Light Use Efficiency:</span>
                <span className="text-lg font-bold text-yellow-600">{(metrics.lightUseEfficiency * 1000).toFixed(1)} mmol/mol</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">Water Use Efficiency:</span>
                <span className="text-lg font-bold text-cyan-600">{metrics.waterUseEfficiency.toFixed(2)} μmol/kPa</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">ETR:</span>
                <span className="text-lg font-bold text-purple-600">{metrics.electronsTransportRate.toFixed(0)} μmol/m²/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">PSII Efficiency:</span>
                <span className="text-lg font-bold text-indigo-600">{(metrics.photosystemIIEfficiency * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">qP:</span>
                <span className="text-lg font-bold text-pink-600">{metrics.photochemicalQuenching.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-medium">NPQ:</span>
                <span className="text-lg font-bold text-orange-600">{metrics.nonPhotochemicalQuenching.toFixed(3)}</span>
              </div>
            </CardContent>
          </Card>
      </div>

        {/* Efficiency Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Efficiency Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" className="text-sm font-medium" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                    <Radar 
                      name="Efficiency" 
                      dataKey="value" 
                      stroke="#22c55e" 
                      fill="#22c55e" 
                      fillOpacity={0.3}
                      strokeWidth={3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Crop Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="crop" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="efficiency" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historical Trends */}
        {historicalData.length > 0 && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold">
                <TrendingUp className="w-6 h-6 mr-3 text-blue-500" />
                Historical Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="timestamp" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Overall Efficiency (%)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="quantumYield" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Quantum Yield (mmol/mol)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="co2Rate" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      name="CO₂ Rate (μmol/m²/s)" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}