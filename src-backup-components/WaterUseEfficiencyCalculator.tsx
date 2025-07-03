'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { Droplets, TrendingUp, Calculator, Leaf, Thermometer, Wind, Target, Info } from 'lucide-react';

interface WUEParameters {
  biomassProduced: number; // g dry weight
  waterConsumed: number; // L
  evapotranspiration: number; // mm/day
  photosynthesis: number; // μmol CO₂/m²/s
  transpiration: number; // mmol H₂O/m²/s
  leafAreaIndex: number;
  rootZoneDepth: number; // cm
  irrigationEfficiency: number; // percentage
}

interface EnvironmentalData {
  temperature: number; // °C
  humidity: number; // %
  vpd: number; // kPa
  lightIntensity: number; // μmol/m²/s
  co2Concentration: number; // ppm
  windSpeed: number; // m/s
  soilMoisture: number; // %
  airPressure: number; // kPa
}

interface WUECalculationResults {
  biomassWUE: number; // g biomass / L water
  photosynthicWUE: number; // μmol CO₂ / mmol H₂O
  instantaneousWUE: number; // Current efficiency
  integratedWUE: number; // Long-term efficiency
  cropWUE: number; // Economic yield / water
  irrigationWUE: number; // Accounting for irrigation losses
  efficiency: number; // Overall efficiency percentage
  category: 'Excellent' | 'Good' | 'Average' | 'Poor';
  recommendations: string[];
}

interface CropModel {
  maxWUE: number;
  optimalVPD: number;
  waterRequirement: number; // L/kg dry biomass
  droughtTolerance: number; // 0-1 scale
  leafWaterContent: number; // percentage
  rootingDepth: number; // cm
  criticalGrowthStages: string[];
}

const cropModels: Record<string, CropModel> = {
  'Tomato': {
    maxWUE: 4.5,
    optimalVPD: 0.8,
    waterRequirement: 300,
    droughtTolerance: 0.6,
    leafWaterContent: 93,
    rootingDepth: 60,
    criticalGrowthStages: ['Flowering', 'Fruit Set', 'Fruit Development']
  },
  'Lettuce': {
    maxWUE: 8.2,
    optimalVPD: 0.6,
    waterRequirement: 150,
    droughtTolerance: 0.4,
    leafWaterContent: 95,
    rootingDepth: 25,
    criticalGrowthStages: ['Head Formation', 'Mature Harvest']
  },
  'Cannabis': {
    maxWUE: 3.8,
    optimalVPD: 1.0,
    waterRequirement: 400,
    droughtTolerance: 0.7,
    leafWaterContent: 85,
    rootingDepth: 100,
    criticalGrowthStages: ['Flowering Initiation', 'Flower Development', 'Resin Production']
  },
  'Cucumber': {
    maxWUE: 5.1,
    optimalVPD: 0.9,
    waterRequirement: 250,
    droughtTolerance: 0.5,
    leafWaterContent: 96,
    rootingDepth: 40,
    criticalGrowthStages: ['Flowering', 'Fruit Formation', 'Harvest Period']
  },
  'Basil': {
    maxWUE: 6.8,
    optimalVPD: 0.7,
    waterRequirement: 200,
    droughtTolerance: 0.6,
    leafWaterContent: 90,
    rootingDepth: 30,
    criticalGrowthStages: ['Leaf Development', 'Essential Oil Formation']
  },
  'Pepper': {
    maxWUE: 4.2,
    optimalVPD: 0.8,
    waterRequirement: 320,
    droughtTolerance: 0.6,
    leafWaterContent: 88,
    rootingDepth: 50,
    criticalGrowthStages: ['Flowering', 'Fruit Set', 'Fruit Maturation']
  }
};

const wueCategories = {
  'Excellent': { min: 80, color: '#4CAF50', description: 'Optimal water use efficiency' },
  'Good': { min: 65, color: '#8BC34A', description: 'Above average efficiency' },
  'Average': { min: 45, color: '#FFC107', description: 'Moderate efficiency' },
  'Poor': { min: 0, color: '#F44336', description: 'Below optimal efficiency' }
};

export default function WaterUseEfficiencyCalculator() {
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [calculationMode, setCalculationMode] = useState<'instant' | 'integrated' | 'crop'>('instant');
  const [timeframe, setTimeframe] = useState<number>(7); // days
  
  const [wueParameters, setWueParameters] = useState<WUEParameters>({
    biomassProduced: 100,
    waterConsumed: 25,
    evapotranspiration: 4.5,
    photosynthesis: 15,
    transpiration: 2.8,
    leafAreaIndex: 3.2,
    rootZoneDepth: 40,
    irrigationEfficiency: 85
  });

  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData>({
    temperature: 24,
    humidity: 65,
    vpd: 0.8,
    lightIntensity: 400,
    co2Concentration: 400,
    windSpeed: 0.2,
    soilMoisture: 75,
    airPressure: 101.3
  });

  const [historicalData, setHistoricalData] = useState<Array<{
    day: number;
    wue: number;
    et: number;
    biomass: number;
    irrigation: number;
    vpd: number;
    efficiency: number;
  }>>([]);

  const [optimizationTargets, setOptimizationTargets] = useState<{
    targetWUE: number;
    maxWaterBudget: number;
    yieldGoal: number;
    sustainabilityGoal: number;
  }>({
    targetWUE: 5.0,
    maxWaterBudget: 1000,
    yieldGoal: 500,
    sustainabilityGoal: 80
  });

  // Calculate VPD from temperature and humidity
  useEffect(() => {
    const saturationVaporPressure = 0.6108 * Math.exp(17.27 * environmentalData.temperature / (environmentalData.temperature + 237.3));
    const actualVaporPressure = saturationVaporPressure * environmentalData.humidity / 100;
    const vpd = saturationVaporPressure - actualVaporPressure;
    setEnvironmentalData(prev => ({ ...prev, vpd }));
  }, [environmentalData.temperature, environmentalData.humidity]);

  // Main WUE calculation function
  const calculateWUE = (): WUECalculationResults => {
    const cropModel = cropModels[selectedCrop];
    
    // Biomass-based WUE (g biomass / L water)
    const biomassWUE = wueParameters.biomassProduced / wueParameters.waterConsumed;
    
    // Photosynthetic WUE (μmol CO₂ / mmol H₂O)
    const photosynthicWUE = wueParameters.photosynthesis / wueParameters.transpiration;
    
    // Environmental stress factors
    const temperatureStress = Math.exp(-Math.pow(environmentalData.temperature - 25, 2) / 50);
    const vpdStress = Math.exp(-Math.pow(environmentalData.vpd - cropModel.optimalVPD, 2) / 0.2);
    const lightFactor = Math.min(1, environmentalData.lightIntensity / 600);
    const co2Factor = environmentalData.co2Concentration / (environmentalData.co2Concentration + 200);
    const moistureStress = environmentalData.soilMoisture < 30 ? 0.5 : 
                          environmentalData.soilMoisture < 50 ? 0.8 : 1.0;
    
    // Overall environmental efficiency
    const environmentalEfficiency = temperatureStress * vpdStress * lightFactor * co2Factor * moistureStress;
    
    // Instantaneous WUE (current conditions)
    const instantaneousWUE = photosynthicWUE * environmentalEfficiency;
    
    // Integrated WUE (accounting for time and management)
    const irrigationLossFactor = wueParameters.irrigationEfficiency / 100;
    const integratedWUE = biomassWUE * irrigationLossFactor * environmentalEfficiency;
    
    // Crop-level WUE (economic yield basis)
    const harvestIndex = 0.4; // Simplified harvest index
    const cropWUE = integratedWUE * harvestIndex;
    
    // Irrigation WUE (accounting for system losses)
    const irrigationWUE = cropWUE * irrigationLossFactor;
    
    // Overall efficiency percentage
    const maxPossibleWUE = cropModel.maxWUE;
    const efficiency = Math.min(100, (integratedWUE / maxPossibleWUE) * 100);
    
    // Determine category
    let category: 'Excellent' | 'Good' | 'Average' | 'Poor' = 'Poor';
    if (efficiency >= wueCategories.Excellent.min) category = 'Excellent';
    else if (efficiency >= wueCategories.Good.min) category = 'Good';
    else if (efficiency >= wueCategories.Average.min) category = 'Average';
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (environmentalData.vpd > cropModel.optimalVPD + 0.3) {
      recommendations.push('Reduce VPD through increased humidity or reduced temperature');
    } else if (environmentalData.vpd < cropModel.optimalVPD - 0.2) {
      recommendations.push('Increase VPD through better ventilation or reduced humidity');
    }
    
    if (wueParameters.irrigationEfficiency < 80) {
      recommendations.push('Improve irrigation system efficiency (current: ' + wueParameters.irrigationEfficiency + '%)');
    }
    
    if (environmentalData.soilMoisture < 50) {
      recommendations.push('Increase soil moisture to optimal range (60-80%)');
    }
    
    if (environmentalData.lightIntensity < 300) {
      recommendations.push('Increase light intensity for better photosynthetic efficiency');
    }
    
    if (wueParameters.leafAreaIndex < 2.0) {
      recommendations.push('Promote leaf development to increase light interception');
    }
    
    if (environmentalData.co2Concentration < 800) {
      recommendations.push('Consider CO₂ enrichment to improve WUE');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Maintain current optimal conditions');
    }
    
    return {
      biomassWUE,
      photosynthicWUE,
      instantaneousWUE,
      integratedWUE,
      cropWUE,
      irrigationWUE,
      efficiency,
      category,
      recommendations
    };
  };

  const wueResults = calculateWUE();

  // Generate historical data for trends
  useEffect(() => {
    const generateHistoricalData = () => {
      const data = [];
      for (let day = 0; day <= timeframe; day++) {
        // Simulate daily variations
        const dayVariation = Math.sin(day * 0.5) * 0.2 + 1;
        const randomVariation = 0.9 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2;
        
        data.push({
          day,
          wue: wueResults.integratedWUE * dayVariation * randomVariation,
          et: wueParameters.evapotranspiration * dayVariation * randomVariation,
          biomass: wueParameters.biomassProduced * (day + 1) / timeframe * randomVariation,
          irrigation: wueParameters.waterConsumed / timeframe * randomVariation,
          vpd: environmentalData.vpd * (0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4),
          efficiency: wueResults.efficiency * dayVariation * randomVariation
        });
      }
      setHistoricalData(data);
    };
    
    generateHistoricalData();
  }, [timeframe, wueResults, wueParameters, environmentalData]);

  // Water budget analysis
  const calculateWaterBudget = () => {
    const dailyWaterNeed = wueParameters.waterConsumed / timeframe;
    const totalBudget = optimizationTargets.maxWaterBudget;
    const daysWithinBudget = Math.floor(totalBudget / dailyWaterNeed);
    const efficiency = (daysWithinBudget / timeframe) * 100;
    
    return {
      dailyNeed: dailyWaterNeed,
      totalNeed: wueParameters.waterConsumed,
      budgetRemaining: totalBudget - wueParameters.waterConsumed,
      efficiencyRating: efficiency,
      sustainable: efficiency >= optimizationTargets.sustainabilityGoal
    };
  };

  const waterBudget = calculateWaterBudget();

  // Optimization scenarios
  const generateOptimizationScenarios = () => {
    const scenarios = [
      {
        name: 'Current Conditions',
        wue: wueResults.integratedWUE,
        waterSaved: 0,
        costImpact: 0,
        implementation: 'No changes'
      },
      {
        name: 'Optimized VPD',
        wue: wueResults.integratedWUE * 1.15,
        waterSaved: 15,
        costImpact: 200,
        implementation: 'Climate control upgrade'
      },
      {
        name: 'Improved Irrigation',
        wue: wueResults.integratedWUE * 1.08,
        waterSaved: 8,
        costImpact: 500,
        implementation: 'Precision irrigation system'
      },
      {
        name: 'CO₂ Enrichment',
        wue: wueResults.integratedWUE * 1.25,
        waterSaved: 20,
        costImpact: 800,
        implementation: 'CO₂ injection system'
      },
      {
        name: 'Full Optimization',
        wue: wueResults.integratedWUE * 1.45,
        waterSaved: 35,
        costImpact: 1200,
        implementation: 'All systems integrated'
      }
    ];
    
    return scenarios;
  };

  const optimizationScenarios = generateOptimizationScenarios();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      {/* Beautiful gradient header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Water Use Efficiency Calculator
            </h1>
            <p className="text-cyan-100 text-lg font-medium">
              Analyze and optimize plant water use efficiency for sustainable cultivation
            </p>
          </div>
          <div className="flex space-x-3">
            <Badge 
              className="px-4 py-2 text-base font-semibold bg-white/20 border-white/30 text-white"
              variant={wueResults.category === 'Excellent' ? 'default' : 
                      wueResults.category === 'Good' ? 'secondary' : 
                      wueResults.category === 'Average' ? 'outline' : 'destructive'}
            >
              {wueResults.category}
            </Badge>
            <Button className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium h-12 px-5">
              <Target className="w-5 h-5 mr-2" />
              Optimize
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
              <p className="text-3xl font-bold text-blue-600">
                {wueResults.integratedWUE.toFixed(2)}
              </p>
              <p className="text-base font-medium text-gray-600">WUE (g/L)</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {wueResults.efficiency.toFixed(1)}%
              </p>
              <p className="text-base font-medium text-gray-600">Efficiency</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-orange-600">
                {wueParameters.evapotranspiration.toFixed(1)}
              </p>
              <p className="text-base font-medium text-gray-600">ET (mm/day)</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">
                {environmentalData.vpd.toFixed(2)}
              </p>
              <p className="text-base font-medium text-gray-600">VPD (kPa)</p>
            </CardContent>
          </Card>
        </div>

        {/* Water Budget Alert */}
        {!waterBudget.sustainable && (
          <Alert className="shadow-lg border-2 border-orange-500 bg-orange-50">
            <Info className="h-5 w-5" />
            <AlertDescription className="text-base">
              <strong className="text-lg">Water Budget Warning:</strong> Current water usage exceeds sustainability target. 
              Daily need: <span className="font-bold text-orange-600">{waterBudget.dailyNeed.toFixed(1)}L</span>, 
              Budget remaining: <span className="font-bold text-orange-600">{waterBudget.budgetRemaining.toFixed(1)}L</span>
            </AlertDescription>
          </Alert>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                <Label className="text-base font-semibold">Calculation Mode</Label>
                <Select value={calculationMode} onValueChange={(value: any) => setCalculationMode(value)}>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instantaneous</SelectItem>
                  <SelectItem value="integrated">Integrated</SelectItem>
                  <SelectItem value="crop">Crop Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

              <div>
                <Label className="text-base font-semibold">Biomass Produced: <span className="text-lg font-bold text-green-600">{wueParameters.biomassProduced}g</span></Label>
                <Slider
                  value={[wueParameters.biomassProduced]}
                  onValueChange={(value) => setWueParameters(prev => ({ ...prev, biomassProduced: value[0] }))}
                  max={500}
                  min={10}
                  step={5}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Water Consumed: <span className="text-lg font-bold text-blue-600">{wueParameters.waterConsumed}L</span></Label>
                <Slider
                  value={[wueParameters.waterConsumed]}
                  onValueChange={(value) => setWueParameters(prev => ({ ...prev, waterConsumed: value[0] }))}
                  max={100}
                  min={5}
                  step={1}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">ET Rate: <span className="text-lg font-bold text-orange-600">{wueParameters.evapotranspiration} mm/day</span></Label>
                <Slider
                  value={[wueParameters.evapotranspiration]}
                  onValueChange={(value) => setWueParameters(prev => ({ ...prev, evapotranspiration: value[0] }))}
                  max={10}
                  min={1}
                  step={0.1}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">LAI: <span className="text-lg font-bold text-purple-600">{wueParameters.leafAreaIndex.toFixed(1)}</span></Label>
                <Slider
                  value={[wueParameters.leafAreaIndex]}
                  onValueChange={(value) => setWueParameters(prev => ({ ...prev, leafAreaIndex: value[0] }))}
                  max={8}
                  min={0.5}
                  step={0.1}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Irrigation Efficiency: <span className="text-lg font-bold text-cyan-600">{wueParameters.irrigationEfficiency}%</span></Label>
                <Slider
                  value={[wueParameters.irrigationEfficiency]}
                  onValueChange={(value) => setWueParameters(prev => ({ ...prev, irrigationEfficiency: value[0] }))}
                  max={95}
                  min={50}
                  step={1}
                  className="mt-3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Environmental Conditions */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Thermometer className="w-6 h-6 mr-3 text-red-500" />
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-base font-semibold">Temperature: <span className="text-lg font-bold text-red-600">{environmentalData.temperature}°C</span></Label>
                <Slider
                  value={[environmentalData.temperature]}
                  onValueChange={(value) => setEnvironmentalData(prev => ({ ...prev, temperature: value[0] }))}
                  max={35}
                  min={15}
                  step={1}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Humidity: <span className="text-lg font-bold text-blue-600">{environmentalData.humidity}%</span></Label>
                <Slider
                  value={[environmentalData.humidity]}
                  onValueChange={(value) => setEnvironmentalData(prev => ({ ...prev, humidity: value[0] }))}
                  max={90}
                  min={30}
                  step={1}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">VPD: <span className="text-lg font-bold text-purple-600">{environmentalData.vpd.toFixed(2)} kPa</span></Label>
                <Input value={environmentalData.vpd.toFixed(2)} disabled className="mt-3 h-12" />
              </div>

              <div>
                <Label className="text-base font-semibold">Light Intensity: <span className="text-lg font-bold text-yellow-600">{environmentalData.lightIntensity} μmol/m²/s</span></Label>
                <Slider
                  value={[environmentalData.lightIntensity]}
                  onValueChange={(value) => setEnvironmentalData(prev => ({ ...prev, lightIntensity: value[0] }))}
                  max={1000}
                  min={100}
                  step={10}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">CO₂: <span className="text-lg font-bold text-green-600">{environmentalData.co2Concentration} ppm</span></Label>
                <Slider
                  value={[environmentalData.co2Concentration]}
                  onValueChange={(value) => setEnvironmentalData(prev => ({ ...prev, co2Concentration: value[0] }))}
                  max={1500}
                  min={300}
                  step={50}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Soil Moisture: <span className="text-lg font-bold text-teal-600">{environmentalData.soilMoisture}%</span></Label>
                <Slider
                  value={[environmentalData.soilMoisture]}
                  onValueChange={(value) => setEnvironmentalData(prev => ({ ...prev, soilMoisture: value[0] }))}
                  max={100}
                  min={20}
                  step={1}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Wind Speed: <span className="text-lg font-bold text-gray-600">{environmentalData.windSpeed} m/s</span></Label>
                <Slider
                  value={[environmentalData.windSpeed]}
                  onValueChange={(value) => setEnvironmentalData(prev => ({ ...prev, windSpeed: value[0] }))}
                  max={2}
                  min={0}
                  step={0.1}
                  className="mt-3"
                />
              </div>
            </CardContent>
          </Card>

          {/* WUE Results */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calculator className="w-6 h-6 mr-3 text-blue-500" />
                WUE Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="text-center p-6 border-2 rounded-xl shadow-inner" 
                   style={{ backgroundColor: wueCategories[wueResults.category].color + '20', borderColor: wueCategories[wueResults.category].color + '40' }}>
                <p className="text-3xl font-bold" style={{ color: wueCategories[wueResults.category].color }}>
                  {wueResults.efficiency.toFixed(1)}%
                </p>
                <p className="text-base font-medium text-gray-700 mt-1">Overall Efficiency</p>
                <Badge variant="outline" className="mt-3 px-3 py-1 text-base font-semibold">{wueResults.category}</Badge>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium">Biomass WUE:</span>
                  <span className="text-lg font-bold text-green-600">{wueResults.biomassWUE.toFixed(2)} g/L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium">Photosynthetic WUE:</span>
                  <span className="text-lg font-bold text-blue-600">{wueResults.photosynthicWUE.toFixed(1)} μmol/mmol</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium">Instantaneous WUE:</span>
                  <span className="text-lg font-bold text-purple-600">{wueResults.instantaneousWUE.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium">Integrated WUE:</span>
                  <span className="text-lg font-bold text-indigo-600">{wueResults.integratedWUE.toFixed(2)} g/L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium">Crop WUE:</span>
                  <span className="text-lg font-bold text-orange-600">{wueResults.cropWUE.toFixed(2)} g/L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium">Irrigation WUE:</span>
                  <span className="text-lg font-bold text-cyan-600">{wueResults.irrigationWUE.toFixed(2)} g/L</span>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200">
                <Label className="text-base font-semibold">Progress to Target</Label>
                <Progress 
                  value={(wueResults.integratedWUE / optimizationTargets.targetWUE) * 100} 
                  className="mt-3 h-3" 
                />
                <p className="text-sm font-medium text-gray-600 mt-2">
                  Target: <span className="text-base font-bold text-blue-600">{optimizationTargets.targetWUE} g/L</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Optimization Targets */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="w-6 h-6 mr-3 text-orange-500" />
                Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-base font-semibold">Target WUE: <span className="text-lg font-bold text-blue-600">{optimizationTargets.targetWUE} g/L</span></Label>
                <Slider
                  value={[optimizationTargets.targetWUE]}
                  onValueChange={(value) => setOptimizationTargets(prev => ({ ...prev, targetWUE: value[0] }))}
                  max={10}
                  min={2}
                  step={0.1}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Water Budget: <span className="text-lg font-bold text-cyan-600">{optimizationTargets.maxWaterBudget}L</span></Label>
                <Slider
                  value={[optimizationTargets.maxWaterBudget]}
                  onValueChange={(value) => setOptimizationTargets(prev => ({ ...prev, maxWaterBudget: value[0] }))}
                  max={2000}
                  min={100}
                  step={50}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Yield Goal: <span className="text-lg font-bold text-green-600">{optimizationTargets.yieldGoal}g</span></Label>
                <Slider
                  value={[optimizationTargets.yieldGoal]}
                  onValueChange={(value) => setOptimizationTargets(prev => ({ ...prev, yieldGoal: value[0] }))}
                  max={1000}
                  min={100}
                  step={25}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Sustainability: <span className="text-lg font-bold text-purple-600">{optimizationTargets.sustainabilityGoal}%</span></Label>
                <Slider
                  value={[optimizationTargets.sustainabilityGoal]}
                  onValueChange={(value) => setOptimizationTargets(prev => ({ ...prev, sustainabilityGoal: value[0] }))}
                  max={100}
                  min={60}
                  step={5}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Time Frame: <span className="text-lg font-bold text-indigo-600">{timeframe} days</span></Label>
                <Slider
                  value={[timeframe]}
                  onValueChange={(value) => setTimeframe(value[0])}
                  max={30}
                  min={3}
                  step={1}
                  className="mt-3"
                />
              </div>

              <div className="pt-5 border-t border-gray-200 space-y-3">
                <h4 className="text-base font-semibold">Water Budget Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium">Daily Need:</span>
                    <span className="text-lg font-bold text-blue-600">{waterBudget.dailyNeed.toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium">Remaining:</span>
                    <span className={`text-lg font-bold ${waterBudget.budgetRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {waterBudget.budgetRemaining.toFixed(1)}L
                    </span>
                  </div>
                  <Badge 
                    className="px-3 py-1 text-base font-semibold"
                    variant={waterBudget.sustainable ? "default" : "destructive"}
                  >
                    {waterBudget.sustainable ? 'Sustainable' : 'Over Budget'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Optimization Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-semibold mb-4">Current Issues & Solutions</h4>
                <div className="space-y-3">
                  {wueResults.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-base font-medium">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Optimization Scenarios</h4>
                <div className="space-y-3">
                  {optimizationScenarios.slice(1, 4).map((scenario, index) => (
                    <div key={index} className="p-4 border-2 border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-base font-semibold">{scenario.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{scenario.implementation}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">+{scenario.waterSaved}%</p>
                          <p className="text-sm font-medium text-gray-600">${scenario.costImpact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </CardContent>
      </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold">
                <TrendingUp className="w-6 h-6 mr-3 text-blue-500" />
                WUE Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: 'WUE (g/L)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="wue" stroke="#3b82f6" strokeWidth={3} name="WUE" />
                    <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={3} name="Efficiency (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Water Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: 'Water (L/mm)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="et" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="ET (mm)" />
                    <Area type="monotone" dataKey="irrigation" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Irrigation (L)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Optimization Scenarios Comparison */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Optimization Scenarios Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={optimizationScenarios}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="wue" fill="#3b82f6" name="WUE (g/L)" />
                  <Bar dataKey="waterSaved" fill="#10b981" name="Water Saved (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}