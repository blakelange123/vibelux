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
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, BarChart, Bar } from 'recharts';
import { TreePine, Camera, Calendar, TrendingUp, Leaf, Eye, Target, Settings } from 'lucide-react';

interface PlantParameters {
  species: string;
  plantingDensity: number; // plants per m²
  initialLeafArea: number; // cm² per plant
  maxLeafArea: number; // cm² per plant
  growthRate: number; // LAI units per day
  leafAreaIndex: number; // current LAI
  plantHeight: number; // cm
  canopyWidth: number; // cm
  leafAngle: number; // degrees from horizontal
  branchingFactor: number; // number of branches per node
}

interface EnvironmentalFactors {
  lightIntensity: number; // PPFD μmol/m²/s
  photoperiod: number; // hours
  temperature: number; // °C
  humidity: number; // %
  co2: number; // ppm
  windSpeed: number; // m/s
  fertilizerLevel: number; // relative scale 0-100
}

interface CanopyData {
  day: number;
  leafAreaIndex: number;
  canopyClosure: number; // percentage
  lightInterception: number; // percentage
  plantHeight: number;
  biomass: number; // relative
  photosynthesis: number; // relative
  competitionIndex: number; // 0-1 scale
}

interface PredictionSettings {
  predictionDays: number;
  measurementInterval: number; // days
  includePruning: boolean;
  pruningDay: number;
  pruningIntensity: number; // percentage of biomass removed
  harvestCycle: boolean;
  harvestInterval: number; // days
}

const cropModels = {
  'Lettuce': {
    maxLAI: 4.5,
    growthRate: 0.15,
    maturityDays: 45,
    optimalDensity: 25,
    lightExtinction: 0.6,
    heightGrowthRate: 0.3,
    leafAngle: 45
  },
  'Cannabis': {
    maxLAI: 8.0,
    growthRate: 0.25,
    maturityDays: 120,
    optimalDensity: 1,
    lightExtinction: 0.7,
    heightGrowthRate: 2.5,
    leafAngle: 60
  },
  'Tomato': {
    maxLAI: 6.0,
    growthRate: 0.20,
    maturityDays: 90,
    optimalDensity: 4,
    lightExtinction: 0.65,
    heightGrowthRate: 1.8,
    leafAngle: 50
  },
  'Basil': {
    maxLAI: 3.5,
    growthRate: 0.18,
    maturityDays: 60,
    optimalDensity: 16,
    lightExtinction: 0.55,
    heightGrowthRate: 0.8,
    leafAngle: 40
  },
  'Kale': {
    maxLAI: 5.0,
    growthRate: 0.16,
    maturityDays: 70,
    optimalDensity: 9,
    lightExtinction: 0.68,
    heightGrowthRate: 0.5,
    leafAngle: 55
  },
  'Strawberry': {
    maxLAI: 4.0,
    growthRate: 0.12,
    maturityDays: 120,
    optimalDensity: 12,
    lightExtinction: 0.58,
    heightGrowthRate: 0.2,
    leafAngle: 35
  }
};

export default function CanopyClosurePredictor() {
  const [selectedCrop, setSelectedCrop] = useState<string>('Lettuce');
  const [plantParameters, setPlantParameters] = useState<PlantParameters>({
    species: 'Lettuce',
    plantingDensity: 25,
    initialLeafArea: 10,
    maxLeafArea: 180,
    growthRate: 0.15,
    leafAreaIndex: 0.25,
    plantHeight: 5,
    canopyWidth: 15,
    leafAngle: 45,
    branchingFactor: 2
  });

  const [environmentalFactors, setEnvironmentalFactors] = useState<EnvironmentalFactors>({
    lightIntensity: 300,
    photoperiod: 16,
    temperature: 22,
    humidity: 65,
    co2: 400,
    windSpeed: 0.1,
    fertilizerLevel: 80
  });

  const [predictionSettings, setPredictionSettings] = useState<PredictionSettings>({
    predictionDays: 60,
    measurementInterval: 1,
    includePruning: false,
    pruningDay: 30,
    pruningIntensity: 20,
    harvestCycle: false,
    harvestInterval: 45
  });

  const [predictionData, setPredictionData] = useState<CanopyData[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Beer-Lambert law for light extinction through canopy
  const calculateLightInterception = (lai: number, extinctionCoeff: number): number => {
    return (1 - Math.exp(-extinctionCoeff * lai)) * 100;
  };

  // Canopy closure based on LAI and planting density
  const calculateCanopyClosure = (lai: number, density: number, leafAngle: number): number => {
    const angularFactor = Math.cos(leafAngle * Math.PI / 180);
    const closureRate = 1 - Math.exp(-lai * angularFactor * Math.sqrt(density) * 0.1);
    return Math.min(100, closureRate * 100);
  };

  // Environmental growth modifiers
  const calculateGrowthModifiers = (env: EnvironmentalFactors): number => {
    // Temperature response (Arrhenius-type)
    const tempOptimal = 24;
    const tempFactor = Math.exp(-Math.pow(env.temperature - tempOptimal, 2) / 50);
    
    // Light response (saturating)
    const lightFactor = env.lightIntensity / (env.lightIntensity + 300);
    
    // CO2 response
    const co2Factor = env.co2 / (env.co2 + 200);
    
    // Photoperiod response
    const photoFactor = Math.min(1, env.photoperiod / 14);
    
    // Humidity stress
    const humidityFactor = 1 - Math.abs(env.humidity - 65) / 100;
    
    // Fertility factor
    const fertilityFactor = env.fertilizerLevel / 100;
    
    return tempFactor * lightFactor * co2Factor * photoFactor * 
           Math.max(0.3, humidityFactor) * fertilityFactor;
  };

  // Competition index based on canopy closure
  const calculateCompetitionIndex = (canopyClosure: number, density: number): number => {
    const densityFactor = Math.min(1, density / cropModels[selectedCrop as keyof typeof cropModels].optimalDensity);
    const closureFactor = canopyClosure / 100;
    return Math.min(1, densityFactor * closureFactor * 1.2);
  };

  // Growth prediction algorithm
  const predictCanopyGrowth = (): CanopyData[] => {
    const cropModel = cropModels[selectedCrop as keyof typeof cropModels];
    const data: CanopyData[] = [];
    
    let currentLAI = plantParameters.leafAreaIndex;
    let currentHeight = plantParameters.plantHeight;
    let currentBiomass = currentLAI * 10; // Simplified biomass calculation
    
    for (let day = 0; day <= predictionSettings.predictionDays; day += predictionSettings.measurementInterval) {
      // Environmental modifiers
      const growthModifier = calculateGrowthModifiers(environmentalFactors);
      
      // Calculate current metrics
      const canopyClosure = calculateCanopyClosure(currentLAI, plantParameters.plantingDensity, plantParameters.leafAngle);
      const lightInterception = calculateLightInterception(currentLAI, cropModel.lightExtinction);
      const competitionIndex = calculateCompetitionIndex(canopyClosure, plantParameters.plantingDensity);
      
      // Growth rates affected by competition and environment
      const competitionReduction = 1 - (competitionIndex * 0.5);
      const actualGrowthRate = cropModel.growthRate * growthModifier * competitionReduction;
      const actualHeightGrowthRate = cropModel.heightGrowthRate * growthModifier * competitionReduction;
      
      // Pruning effects
      if (predictionSettings.includePruning && day === predictionSettings.pruningDay) {
        currentLAI *= (1 - predictionSettings.pruningIntensity / 100);
        currentHeight *= (1 - predictionSettings.pruningIntensity / 200); // Less height reduction
        currentBiomass *= (1 - predictionSettings.pruningIntensity / 100);
      }
      
      // Harvest cycle effects
      if (predictionSettings.harvestCycle && 
          predictionSettings.harvestInterval > 0 && 
          day > 0 && 
          day % predictionSettings.harvestInterval === 0) {
        currentLAI *= 0.3; // Cut back to 30% of current LAI
        currentHeight *= 0.7; // Maintain some height
        currentBiomass *= 0.3;
      }
      
      // Photosynthesis calculation based on light interception and LAI
      const photosynthesis = (lightInterception / 100) * (currentLAI / cropModel.maxLAI) * 100;
      
      data.push({
        day,
        leafAreaIndex: currentLAI,
        canopyClosure,
        lightInterception,
        plantHeight: currentHeight,
        biomass: currentBiomass,
        photosynthesis,
        competitionIndex
      });
      
      // Growth for next iteration (if not last day)
      if (day < predictionSettings.predictionDays) {
        const daysIncrement = predictionSettings.measurementInterval;
        
        // LAI growth with asymptotic approach to maximum
        const laiGrowthPotential = (cropModel.maxLAI - currentLAI) / cropModel.maxLAI;
        currentLAI += actualGrowthRate * laiGrowthPotential * daysIncrement;
        currentLAI = Math.min(currentLAI, cropModel.maxLAI);
        
        // Height growth
        currentHeight += actualHeightGrowthRate * daysIncrement;
        
        // Biomass accumulation
        currentBiomass += (photosynthesis / 100) * actualGrowthRate * 5 * daysIncrement;
      }
    }
    
    return data;
  };

  const runPrediction = () => {
    const data = predictCanopyGrowth();
    setPredictionData(data);
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setCurrentDay(0);
    
    const interval = setInterval(() => {
      setCurrentDay(prev => {
        if (prev >= predictionSettings.predictionDays) {
          setIsSimulating(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 100); // Fast simulation
  };

  // Update crop model when crop changes
  useEffect(() => {
    const cropModel = cropModels[selectedCrop as keyof typeof cropModels];
    setPlantParameters(prev => ({
      ...prev,
      species: selectedCrop,
      plantingDensity: cropModel.optimalDensity,
      maxLeafArea: (cropModel.maxLAI * 10000) / cropModel.optimalDensity, // Convert to cm² per plant
      growthRate: cropModel.growthRate,
      leafAngle: cropModel.leafAngle
    }));
  }, [selectedCrop]);

  // Auto-run prediction when parameters change
  useEffect(() => {
    runPrediction();
  }, [plantParameters, environmentalFactors, predictionSettings, selectedCrop]);

  const currentData = predictionData.find(d => d.day <= currentDay) || predictionData[0];
  const maxCanopyClosure = Math.max(...predictionData.map(d => d.canopyClosure), 0);
  const daysToMaxClosure = predictionData.find(d => d.canopyClosure >= maxCanopyClosure * 0.95)?.day || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      {/* Beautiful gradient header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Canopy Closure Predictor
            </h1>
            <p className="text-green-100 text-lg font-medium">
              Predict canopy development, light interception, and optimal harvest timing
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={runPrediction} 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium h-12 px-5"
            >
              <Target className="w-5 h-5 mr-2" />
              Update Prediction
            </Button>
            <Button
              onClick={startSimulation}
              disabled={isSimulating}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 font-semibold h-12 px-6"
            >
              <TreePine className="w-5 h-5 mr-2" />
              {isSimulating ? 'Simulating...' : 'Simulate Growth'}
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </div>

      <div className="space-y-8">

        {/* Current Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {currentData ? currentData.canopyClosure.toFixed(1) : '0.0'}%
              </p>
              <p className="text-base font-medium text-gray-600">Canopy Closure</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {currentData ? currentData.leafAreaIndex.toFixed(2) : '0.00'}
              </p>
              <p className="text-base font-medium text-gray-600">Leaf Area Index</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-orange-600">
                {currentData ? currentData.lightInterception.toFixed(1) : '0.0'}%
              </p>
              <p className="text-base font-medium text-gray-600">Light Interception</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">
                {daysToMaxClosure}
              </p>
              <p className="text-base font-medium text-gray-600">Days to Max Closure</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Plant Parameters */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Leaf className="w-6 h-6 mr-3 text-green-500" />
                Plant Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-base font-semibold">Crop Species</Label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(cropModels).map(crop => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold">Planting Density: <span className="text-lg font-bold text-green-600">{plantParameters.plantingDensity} plants/m²</span></Label>
                <Slider
                  value={[plantParameters.plantingDensity]}
                  onValueChange={(value) => setPlantParameters(prev => ({ ...prev, plantingDensity: value[0] }))}
                  max={50}
                  min={1}
                  step={1}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Initial LAI: <span className="text-lg font-bold text-blue-600">{plantParameters.leafAreaIndex.toFixed(2)}</span></Label>
                <Slider
                  value={[plantParameters.leafAreaIndex]}
                  onValueChange={(value) => setPlantParameters(prev => ({ ...prev, leafAreaIndex: value[0] }))}
                  max={2}
                  min={0.1}
                  step={0.05}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Plant Height: <span className="text-lg font-bold text-purple-600">{plantParameters.plantHeight} cm</span></Label>
                <Slider
                  value={[plantParameters.plantHeight]}
                  onValueChange={(value) => setPlantParameters(prev => ({ ...prev, plantHeight: value[0] }))}
                  max={50}
                  min={1}
                  step={1}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Leaf Angle: <span className="text-lg font-bold text-orange-600">{plantParameters.leafAngle}°</span></Label>
                <Slider
                  value={[plantParameters.leafAngle]}
                  onValueChange={(value) => setPlantParameters(prev => ({ ...prev, leafAngle: value[0] }))}
                  max={90}
                  min={0}
                  step={5}
                  className="mt-3"
                />
              </div>
          </CardContent>
        </Card>

          {/* Environmental Factors */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Settings className="w-6 h-6 mr-3 text-blue-500" />
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-base font-semibold">Light Intensity: <span className="text-lg font-bold text-yellow-600">{environmentalFactors.lightIntensity} μmol/m²/s</span></Label>
                <Slider
                  value={[environmentalFactors.lightIntensity]}
                  onValueChange={(value) => setEnvironmentalFactors(prev => ({ ...prev, lightIntensity: value[0] }))}
                  max={1000}
                  min={50}
                  step={10}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Photoperiod: <span className="text-lg font-bold text-orange-600">{environmentalFactors.photoperiod}h</span></Label>
                <Slider
                  value={[environmentalFactors.photoperiod]}
                  onValueChange={(value) => setEnvironmentalFactors(prev => ({ ...prev, photoperiod: value[0] }))}
                  max={24}
                  min={8}
                  step={1}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Temperature: <span className="text-lg font-bold text-red-600">{environmentalFactors.temperature}°C</span></Label>
                <Slider
                  value={[environmentalFactors.temperature]}
                  onValueChange={(value) => setEnvironmentalFactors(prev => ({ ...prev, temperature: value[0] }))}
                  max={35}
                  min={15}
                  step={1}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">CO₂: <span className="text-lg font-bold text-green-600">{environmentalFactors.co2} ppm</span></Label>
                <Slider
                  value={[environmentalFactors.co2]}
                  onValueChange={(value) => setEnvironmentalFactors(prev => ({ ...prev, co2: value[0] }))}
                  max={1500}
                  min={300}
                  step={50}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Fertilizer Level: <span className="text-lg font-bold text-teal-600">{environmentalFactors.fertilizerLevel}%</span></Label>
                <Slider
                  value={[environmentalFactors.fertilizerLevel]}
                  onValueChange={(value) => setEnvironmentalFactors(prev => ({ ...prev, fertilizerLevel: value[0] }))}
                  max={100}
                  min={20}
                  step={5}
                  className="mt-3"
                />
              </div>
          </CardContent>
        </Card>

          {/* Prediction Settings */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="w-6 h-6 mr-3 text-purple-500" />
                Prediction Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-base font-semibold">Prediction Period: <span className="text-lg font-bold text-blue-600">{predictionSettings.predictionDays} days</span></Label>
                <Slider
                  value={[predictionSettings.predictionDays]}
                  onValueChange={(value) => setPredictionSettings(prev => ({ ...prev, predictionDays: value[0] }))}
                  max={150}
                  min={30}
                  step={5}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Measurement Interval: <span className="text-lg font-bold text-indigo-600">{predictionSettings.measurementInterval} days</span></Label>
                <Slider
                  value={[predictionSettings.measurementInterval]}
                  onValueChange={(value) => setPredictionSettings(prev => ({ ...prev, measurementInterval: value[0] }))}
                  max={7}
                  min={1}
                  step={1}
                  className="mt-3"
                />
              </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={predictionSettings.includePruning}
                onChange={(e) => setPredictionSettings(prev => ({ ...prev, includePruning: e.target.checked }))}
              />
              <Label>Include Pruning</Label>
            </div>

            {predictionSettings.includePruning && (
              <>
                <div>
                  <Label>Pruning Day: {predictionSettings.pruningDay}</Label>
                  <Slider
                    value={[predictionSettings.pruningDay]}
                    onValueChange={(value) => setPredictionSettings(prev => ({ ...prev, pruningDay: value[0] }))}
                    max={predictionSettings.predictionDays}
                    min={10}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Pruning Intensity: {predictionSettings.pruningIntensity}%</Label>
                  <Slider
                    value={[predictionSettings.pruningIntensity]}
                    onValueChange={(value) => setPredictionSettings(prev => ({ ...prev, pruningIntensity: value[0] }))}
                    max={50}
                    min={10}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={predictionSettings.harvestCycle}
                onChange={(e) => setPredictionSettings(prev => ({ ...prev, harvestCycle: e.target.checked }))}
              />
              <Label>Harvest Cycles</Label>
            </div>

            {predictionSettings.harvestCycle && (
              <div>
                <Label>Harvest Interval: {predictionSettings.harvestInterval} days</Label>
                <Slider
                  value={[predictionSettings.harvestInterval]}
                  onValueChange={(value) => setPredictionSettings(prev => ({ ...prev, harvestInterval: value[0] }))}
                  max={90}
                  min={20}
                  step={5}
                  className="mt-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

          {/* Current Metrics */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Eye className="w-6 h-6 mr-3 text-orange-500" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {isSimulating && (
                <div>
                  <Label className="text-base font-semibold">Simulation Day: <span className="text-lg font-bold text-blue-600">{currentDay}</span></Label>
                  <Progress value={(currentDay / predictionSettings.predictionDays) * 100} className="mt-3 h-3" />
                </div>
              )}

              {currentData && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium">Canopy Closure:</span>
                    <Badge 
                      className="px-3 py-1 text-base font-semibold"
                      variant={currentData.canopyClosure > 80 ? "default" : "secondary"}
                    >
                      {currentData.canopyClosure.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium">LAI:</span>
                    <span className="text-lg font-bold text-green-600">{currentData.leafAreaIndex.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium">Light Interception:</span>
                    <span className="text-lg font-bold text-yellow-600">{currentData.lightInterception.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium">Plant Height:</span>
                    <span className="text-lg font-bold text-purple-600">{currentData.plantHeight.toFixed(1)} cm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium">Competition Index:</span>
                    <span className="text-lg font-bold text-orange-600">{currentData.competitionIndex.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium">Photosynthesis:</span>
                    <span className="text-lg font-bold text-blue-600">{currentData.photosynthesis.toFixed(1)}%</span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-base font-medium text-gray-600">Growth Stage:</p>
                <Badge 
                  variant="outline"
                  className="mt-2 px-3 py-1 text-base font-semibold"
                >
                  {currentData && currentData.canopyClosure < 25 ? 'Early Growth' :
                   currentData && currentData.canopyClosure < 75 ? 'Active Growth' :
                   currentData && currentData.canopyClosure < 95 ? 'Canopy Formation' :
                   'Full Canopy'}
                </Badge>
              </div>
          </CardContent>
        </Card>
      </div>

        {/* Prediction Charts */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold">
              <TrendingUp className="w-6 h-6 mr-3 text-green-500" />
              Canopy Development Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
          <Tabs defaultValue="closure" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="closure">Canopy Closure</TabsTrigger>
              <TabsTrigger value="lai">Leaf Area Index</TabsTrigger>
              <TabsTrigger value="light">Light Dynamics</TabsTrigger>
              <TabsTrigger value="competition">Competition</TabsTrigger>
            </TabsList>
            
            <TabsContent value="closure" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: 'Canopy Closure (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="canopyClosure" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                      strokeWidth={3}
                      name="Canopy Closure (%)"
                    />
                    {isSimulating && (
                      <Line 
                        type="monotone" 
                        dataKey="day" 
                        stroke="#ff0000" 
                        strokeWidth={3}
                        dot={false}
                        name="Current Day"
                        data={[{ day: currentDay, canopyClosure: 0 }, { day: currentDay, canopyClosure: 100 }]}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="lai" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: 'Leaf Area Index', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="leafAreaIndex" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="LAI"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="plantHeight" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      name="Height (cm ÷ 10)"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="light" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="lightInterception" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      name="Light Interception (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="photosynthesis" 
                      stroke="#06b6d4" 
                      strokeWidth={3}
                      name="Photosynthesis (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="competition" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: 'Index / Biomass', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="competitionIndex" 
                      stroke="#a855f7" 
                      strokeWidth={3}
                      name="Competition Index"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="biomass" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      name="Biomass (relative)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}