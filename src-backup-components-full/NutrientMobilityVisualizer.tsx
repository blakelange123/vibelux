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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Droplets, TrendingUp, Leaf, FlaskConical, ArrowUpDown, Play, Pause, RotateCcw, Camera } from 'lucide-react';

interface NutrientData {
  element: string;
  symbol: string;
  concentration: number; // ppm or mg/L
  mobility: 'high' | 'medium' | 'low';
  deficiencySymptoms: string[];
  toxicitySymptoms: string[];
  optimalRange: { min: number; max: number };
  currentStatus: 'deficient' | 'optimal' | 'excessive';
}

interface PlantTissueData {
  tissue: string;
  nutrients: { [element: string]: number };
  age: number; // days
  position: 'top' | 'middle' | 'bottom';
  color: string;
}

interface TranslocationData {
  timepoint: number;
  source: string;
  sink: string;
  element: string;
  rate: number; // mg/g/day
  direction: 'upward' | 'downward' | 'lateral';
}

interface VisualizationSettings {
  timeScale: number; // hours
  selectedElements: string[];
  showDeficiencyZones: boolean;
  showTranslocationPaths: boolean;
  animationSpeed: number;
  tissueDetail: 'basic' | 'detailed';
}

const nutrientElements = {
  'N': {
    name: 'Nitrogen',
    mobility: 'high' as const,
    optimalRange: { min: 30000, max: 50000 },
    deficiencySymptoms: ['Yellowing of older leaves', 'Stunted growth', 'Reduced protein content'],
    toxicitySymptoms: ['Dark green foliage', 'Delayed maturity', 'Reduced flowering'],
    color: '#4CAF50'
  },
  'P': {
    name: 'Phosphorus',
    mobility: 'medium' as const,
    optimalRange: { min: 3000, max: 8000 },
    deficiencySymptoms: ['Purple leaf coloration', 'Poor root development', 'Delayed flowering'],
    toxicitySymptoms: ['Iron/zinc deficiency symptoms', 'Reduced mycorrhizal associations'],
    color: '#FF9800'
  },
  'K': {
    name: 'Potassium',
    mobility: 'high' as const,
    optimalRange: { min: 20000, max: 40000 },
    deficiencySymptoms: ['Leaf edge burn', 'Poor fruit quality', 'Increased disease susceptibility'],
    toxicitySymptoms: ['Magnesium deficiency symptoms', 'Salt stress'],
    color: '#2196F3'
  },
  'Ca': {
    name: 'Calcium',
    mobility: 'low' as const,
    optimalRange: { min: 5000, max: 15000 },
    deficiencySymptoms: ['Blossom end rot', 'Tip burn', 'Cell wall disorders'],
    toxicitySymptoms: ['Magnesium/potassium deficiency', 'Reduced iron uptake'],
    color: '#9C27B0'
  },
  'Mg': {
    name: 'Magnesium',
    mobility: 'medium' as const,
    optimalRange: { min: 2000, max: 6000 },
    deficiencySymptoms: ['Interveinal chlorosis', 'Leaf curling', 'Poor chlorophyll formation'],
    toxicitySymptoms: ['Rare in field conditions', 'Possible Ca/K antagonism'],
    color: '#795548'
  },
  'S': {
    name: 'Sulfur',
    mobility: 'medium' as const,
    optimalRange: { min: 1000, max: 5000 },
    deficiencySymptoms: ['Yellow young leaves', 'Reduced protein synthesis', 'Purple stems'],
    toxicitySymptoms: ['Rarely occurs', 'Possible growth reduction'],
    color: '#FFC107'
  },
  'Fe': {
    name: 'Iron',
    mobility: 'low' as const,
    optimalRange: { min: 100, max: 300 },
    deficiencySymptoms: ['Interveinal chlorosis in young leaves', 'White/yellow new growth'],
    toxicitySymptoms: ['Bronze spots on leaves', 'Reduced growth'],
    color: '#E91E63'
  },
  'Mn': {
    name: 'Manganese',
    mobility: 'medium' as const,
    optimalRange: { min: 30, max: 150 },
    deficiencySymptoms: ['Interveinal chlorosis', 'Gray speck disease', 'Poor pollen formation'],
    toxicitySymptoms: ['Brown spots on older leaves', 'Reduced iron uptake'],
    color: '#607D8B'
  },
  'Zn': {
    name: 'Zinc',
    mobility: 'medium' as const,
    optimalRange: { min: 20, max: 100 },
    deficiencySymptoms: ['Small leaves', 'Short internodes', 'Delayed maturity'],
    toxicitySymptoms: ['Iron deficiency symptoms', 'Reduced growth'],
    color: '#009688'
  },
  'B': {
    name: 'Boron',
    mobility: 'low' as const,
    optimalRange: { min: 10, max: 50 },
    deficiencySymptoms: ['Hollow stems', 'Flower/fruit abortion', 'Growing point death'],
    toxicitySymptoms: ['Leaf burn', 'Yellowing from tips', 'Reduced yield'],
    color: '#673AB7'
  }
};

const tissueTypes = [
  { name: 'Young Leaves', position: 'top', mobility: 1.0, color: '#8BC34A' },
  { name: 'Mature Leaves', position: 'middle', mobility: 0.7, color: '#4CAF50' },
  { name: 'Old Leaves', position: 'bottom', mobility: 0.3, color: '#2E7D32' },
  { name: 'Growing Points', position: 'top', mobility: 0.9, color: '#CDDC39' },
  { name: 'Stems', position: 'middle', mobility: 0.5, color: '#795548' },
  { name: 'Roots', position: 'bottom', mobility: 0.8, color: '#5D4037' },
  { name: 'Fruits/Flowers', position: 'top', mobility: 0.6, color: '#E91E63' },
  { name: 'Seeds', position: 'top', mobility: 0.4, color: '#FF5722' }
];

export default function NutrientMobilityVisualizer() {
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [selectedElements, setSelectedElements] = useState<string[]>(['N', 'P', 'K']);
  const [timepoint, setTimepoint] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  
  const [visualizationSettings, setVisualizationSettings] = useState<VisualizationSettings>({
    timeScale: 24,
    selectedElements: ['N', 'P', 'K'],
    showDeficiencyZones: true,
    showTranslocationPaths: true,
    animationSpeed: 1,
    tissueDetail: 'basic'
  });

  const [nutrientData, setNutrientData] = useState<NutrientData[]>([]);
  const [tissueData, setTissueData] = useState<PlantTissueData[]>([]);
  const [translocationData, setTranslocationData] = useState<TranslocationData[]>([]);
  const [stressConditions, setStressConditions] = useState<{
    waterStress: number;
    lightStress: number;
    temperatureStress: number;
    phStress: number;
  }>({
    waterStress: 0,
    lightStress: 0,
    temperatureStress: 0,
    phStress: 0
  });

  // Initialize nutrient data
  useEffect(() => {
    const initialNutrients: NutrientData[] = Object.entries(nutrientElements).map(([symbol, data]) => ({
      element: data.name,
      symbol,
      concentration: (data.optimalRange.min + data.optimalRange.max) / 2 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1000,
      mobility: data.mobility,
      deficiencySymptoms: data.deficiencySymptoms,
      toxicitySymptoms: data.toxicitySymptoms,
      optimalRange: data.optimalRange,
      currentStatus: 'optimal' as const
    }));
    
    // Update status based on concentration
    initialNutrients.forEach(nutrient => {
      if (nutrient.concentration < nutrient.optimalRange.min) {
        nutrient.currentStatus = 'deficient';
      } else if (nutrient.concentration > nutrient.optimalRange.max) {
        nutrient.currentStatus = 'excessive';
      }
    });
    
    setNutrientData(initialNutrients);
  }, []);

  // Generate tissue data
  useEffect(() => {
    const tissues: PlantTissueData[] = tissueTypes.map((tissue, index) => {
      const nutrients: { [element: string]: number } = {};
      
      selectedElements.forEach(element => {
        const baseConcentration = nutrientElements[element as keyof typeof nutrientElements].optimalRange.min;
        const mobilityFactor = tissue.mobility;
        const ageFactor = Math.max(0.3, 1 - (index * 0.1)); // Older tissues have less nutrients for mobile elements
        const stressFactor = 1 - (stressConditions.waterStress + stressConditions.lightStress) / 200;
        
        // Mobile nutrients are redistributed more easily
        const mobilityMultiplier = nutrientElements[element as keyof typeof nutrientElements].mobility === 'high' ? 
          mobilityFactor * ageFactor : 
          nutrientElements[element as keyof typeof nutrientElements].mobility === 'medium' ?
          (mobilityFactor + ageFactor) / 2 :
          ageFactor * 0.8; // Low mobility nutrients stay put
        
        nutrients[element] = baseConcentration * mobilityMultiplier * stressFactor * (0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4);
      });
      
      return {
        tissue: tissue.name,
        nutrients,
        age: index * 10 + 5,
        position: tissue.position as 'top' | 'middle' | 'bottom',
        color: tissue.color
      };
    });
    
    setTissueData(tissues);
  }, [selectedElements, stressConditions]);

  // Generate translocation data
  useEffect(() => {
    const translocations: TranslocationData[] = [];
    const timePoints = 48; // 48 hours
    
    for (let t = 0; t < timePoints; t += 2) {
      selectedElements.forEach(element => {
        const mobility = nutrientElements[element as keyof typeof nutrientElements].mobility;
        
        if (mobility === 'high') {
          // High mobility elements move readily
          translocations.push({
            timepoint: t,
            source: 'Old Leaves',
            sink: 'Young Leaves',
            element,
            rate: 5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
            direction: 'upward'
          });
          
          translocations.push({
            timepoint: t,
            source: 'Roots',
            sink: 'Fruits/Flowers',
            element,
            rate: 3 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 7,
            direction: 'upward'
          });
        } else if (mobility === 'medium') {
          // Medium mobility elements move under stress
          if (stressConditions.waterStress > 30 || t > 24) {
            translocations.push({
              timepoint: t,
              source: 'Mature Leaves',
              sink: 'Growing Points',
              element,
              rate: 2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5,
              direction: 'upward'
            });
          }
        }
        // Low mobility elements rarely translocate
      });
    }
    
    setTranslocationData(translocations);
  }, [selectedElements, stressConditions]);

  // Animation control
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnimating) {
      interval = setInterval(() => {
        setTimepoint(prev => {
          const next = prev + animationSpeed;
          return next > 48 ? 0 : next;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isAnimating, animationSpeed]);

  const getCurrentTranslocation = () => {
    return translocationData.filter(t => 
      Math.abs(t.timepoint - timepoint) < 2 && 
      selectedElements.includes(t.element)
    );
  };

  const getNutrientStatus = (element: string, tissue: string): { level: number; status: string; color: string } => {
    const tissueNutrients = tissueData.find(t => t.tissue === tissue)?.nutrients;
    if (!tissueNutrients || !tissueNutrients[element]) return { level: 0, status: 'unknown', color: '#gray' };
    
    const elementData = nutrientElements[element as keyof typeof nutrientElements];
    const concentration = tissueNutrients[element];
    const level = (concentration / elementData.optimalRange.max) * 100;
    
    let status = 'optimal';
    let color = '#4CAF50';
    
    if (concentration < elementData.optimalRange.min) {
      status = 'deficient';
      color = '#f44336';
    } else if (concentration > elementData.optimalRange.max) {
      status = 'excessive';
      color = '#FF9800';
    }
    
    return { level, status, color };
  };

  const getDeficiencyRisk = (): { element: string; risk: number; symptoms: string[] }[] => {
    return nutrientData
      .filter(n => selectedElements.includes(n.symbol))
      .map(nutrient => {
        const risk = nutrient.currentStatus === 'deficient' ? 100 :
                    nutrient.concentration < nutrient.optimalRange.min * 1.2 ? 70 :
                    nutrient.concentration < nutrient.optimalRange.min * 1.5 ? 40 : 10;
        
        return {
          element: nutrient.symbol,
          risk,
          symptoms: nutrient.deficiencySymptoms
        };
      })
      .sort((a, b) => b.risk - a.risk);
  };

  // Prepare data for charts
  const tissueConcentrationData = tissueData.map(tissue => {
    const data: any = { tissue: tissue.tissue.split(' ')[0] };
    selectedElements.forEach(element => {
      data[element] = tissue.nutrients[element] || 0;
    });
    return data;
  });

  const translocationTimeData = Array.from({ length: 49 }, (_, i) => {
    const hourData: any = { hour: i };
    selectedElements.forEach(element => {
      const flows = translocationData.filter(t => 
        Math.abs(t.timepoint - i) < 1 && t.element === element
      );
      hourData[element] = flows.reduce((sum, flow) => sum + flow.rate, 0);
    });
    return hourData;
  });

  const radarData = selectedElements.map(element => {
    const avgConcentration = tissueData.reduce((sum, tissue) => 
      sum + (tissue.nutrients[element] || 0), 0) / tissueData.length;
    const optimal = nutrientElements[element as keyof typeof nutrientElements].optimalRange.max;
    
    return {
      element,
      value: Math.min(100, (avgConcentration / optimal) * 100),
      fullMark: 100
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      {/* Beautiful gradient header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Nutrient Mobility Visualizer
            </h1>
            <p className="text-emerald-100 text-lg font-medium">
              Track nutrient movement and distribution throughout plant tissues in real-time
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`${isAnimating ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-white/20 hover:bg-white/30'} border-white/30 text-white font-semibold h-12 px-6`}
            >
              {isAnimating ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              {isAnimating ? 'Pause' : 'Animate'}
            </Button>
            <Button
              onClick={() => setTimepoint(0)}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium h-12 px-5"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
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
              <p className="text-3xl font-bold text-blue-600">{timepoint.toFixed(1)}h</p>
              <p className="text-base font-medium text-gray-600">Current Time</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {getCurrentTranslocation().length}
              </p>
              <p className="text-base font-medium text-gray-600">Active Flows</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-orange-600">
                {getDeficiencyRisk().filter(r => r.risk > 50).length}
              </p>
              <p className="text-base font-medium text-gray-600">High Risk Elements</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">
                {selectedElements.length}
              </p>
              <p className="text-base font-medium text-gray-600">Tracked Elements</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Control Panel */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FlaskConical className="w-6 h-6 mr-3 text-purple-500" />
                Controls
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
                    <SelectItem value="Tomato">Tomato</SelectItem>
                    <SelectItem value="Lettuce">Lettuce</SelectItem>
                    <SelectItem value="Cannabis">Cannabis</SelectItem>
                    <SelectItem value="Pepper">Pepper</SelectItem>
                    <SelectItem value="Cucumber">Cucumber</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold">Tracked Elements</Label>
                <div className="grid grid-cols-2 gap-2 mt-3">
                {Object.keys(nutrientElements).map(element => (
                  <Button
                    key={element}
                    variant={selectedElements.includes(element) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (selectedElements.includes(element)) {
                        setSelectedElements(prev => prev.filter(e => e !== element));
                      } else {
                        setSelectedElements(prev => [...prev, element]);
                      }
                    }}
                  >
                    {element}
                  </Button>
                ))}
              </div>
            </div>

              <div>
                <Label className="text-base font-semibold">Animation Speed: <span className="text-lg font-bold text-blue-600">{animationSpeed}x</span></Label>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={(value) => setAnimationSpeed(value[0])}
                  max={5}
                  min={0.1}
                  step={0.1}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Time: <span className="text-lg font-bold text-green-600">{timepoint.toFixed(1)} hours</span></Label>
                <Slider
                  value={[timepoint]}
                  onValueChange={(value) => setTimepoint(value[0])}
                  max={48}
                  min={0}
                  step={0.5}
                  className="mt-3"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Stress Conditions</Label>
                <div>
                  <Label className="text-sm font-medium">Water Stress: <span className="text-base font-bold text-blue-600">{stressConditions.waterStress}%</span></Label>
                  <Slider
                    value={[stressConditions.waterStress]}
                    onValueChange={(value) => setStressConditions(prev => ({ ...prev, waterStress: value[0] }))}
                    max={100}
                    min={0}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Light Stress: <span className="text-base font-bold text-yellow-600">{stressConditions.lightStress}%</span></Label>
                  <Slider
                    value={[stressConditions.lightStress]}
                    onValueChange={(value) => setStressConditions(prev => ({ ...prev, lightStress: value[0] }))}
                    max={100}
                    min={0}
                    className="mt-2"
                  />
                </div>
              </div>
          </CardContent>
        </Card>

          {/* Plant Visualization */}
          <Card className="lg:col-span-2 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Leaf className="w-6 h-6 mr-3 text-green-500" />
                Plant Nutrient Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 relative bg-gradient-to-b from-blue-50 to-green-50 rounded-xl p-6 shadow-inner">
              {/* Plant structure representation */}
              <div className="absolute inset-0 flex flex-col justify-between items-center p-8">
                {/* Top tissues */}
                <div className="flex space-x-4">
                  {['Young Leaves', 'Growing Points', 'Fruits/Flowers'].map(tissue => {
                    const tissueData = tissueData.find(t => t.tissue === tissue);
                    return (
                      <div
                        key={tissue}
                        className="flex flex-col items-center p-2 bg-white rounded-lg shadow-md border-2"
                        style={{ 
                          borderColor: selectedElements.length > 0 ? 
                            getNutrientStatus(selectedElements[0], tissue).color : '#gray'
                        }}
                      >
                        <div 
                          className="w-10 h-10 rounded-full shadow-lg"
                          style={{ backgroundColor: tissueData?.color || '#gray' }}
                        />
                        <span className="text-sm font-medium mt-1">{tissue.split(' ')[0]}</span>
                        {selectedElements.map(element => {
                          const status = getNutrientStatus(element, tissue);
                          return (
                            <div key={element} className="text-sm font-semibold">
                              {element}: <span style={{ color: status.color }}>{status.level.toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Middle tissues */}
                <div className="flex space-x-4">
                  {['Mature Leaves', 'Stems'].map(tissue => {
                    const tissueData = tissueData.find(t => t.tissue === tissue);
                    return (
                      <div
                        key={tissue}
                        className="flex flex-col items-center p-2 bg-white rounded-lg shadow-md border-2"
                        style={{ 
                          borderColor: selectedElements.length > 0 ? 
                            getNutrientStatus(selectedElements[0], tissue).color : '#gray'
                        }}
                      >
                        <div 
                          className="w-12 h-12 rounded-full shadow-lg"
                          style={{ backgroundColor: tissueData?.color || '#gray' }}
                        />
                        <span className="text-sm font-medium mt-1">{tissue.split(' ')[0]}</span>
                        {selectedElements.map(element => {
                          const status = getNutrientStatus(element, tissue);
                          return (
                            <div key={element} className="text-sm font-semibold">
                              {element}: <span style={{ color: status.color }}>{status.level.toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom tissues */}
                <div className="flex space-x-4">
                  {['Old Leaves', 'Roots'].map(tissue => {
                    const tissueData = tissueData.find(t => t.tissue === tissue);
                    return (
                      <div
                        key={tissue}
                        className="flex flex-col items-center p-2 bg-white rounded-lg shadow-md border-2"
                        style={{ 
                          borderColor: selectedElements.length > 0 ? 
                            getNutrientStatus(selectedElements[0], tissue).color : '#gray'
                        }}
                      >
                        <div 
                          className="w-10 h-10 rounded-full shadow-lg"
                          style={{ backgroundColor: tissueData?.color || '#gray' }}
                        />
                        <span className="text-sm font-medium mt-1">{tissue.split(' ')[0]}</span>
                        {selectedElements.map(element => {
                          const status = getNutrientStatus(element, tissue);
                          return (
                            <div key={element} className="text-sm font-semibold">
                              {element}: <span style={{ color: status.color }}>{status.level.toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Active translocation arrows */}
                {getCurrentTranslocation().map((flow, index) => (
                  <div
                    key={index}
                    className="absolute flex items-center justify-center"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <ArrowUpDown 
                      className="w-6 h-6 text-red-500 animate-pulse" 
                      style={{ 
                        color: nutrientElements[flow.element as keyof typeof nutrientElements].color 
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="text-sm space-y-2">
                  {selectedElements.map(element => (
                    <div key={element} className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded shadow"
                        style={{ backgroundColor: nutrientElements[element as keyof typeof nutrientElements].color }}
                      />
                      <span className="font-medium">{nutrientElements[element as keyof typeof nutrientElements].name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Deficiency Risk */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Camera className="w-6 h-6 mr-3 text-red-500" />
                Deficiency Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {getDeficiencyRisk().map(risk => (
                <div key={risk.element} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">{nutrientElements[risk.element as keyof typeof nutrientElements].name}</span>
                    <Badge 
                      className="px-3 py-1 text-base font-semibold"
                      variant={risk.risk > 70 ? "destructive" : risk.risk > 40 ? "secondary" : "default"}
                    >
                      {risk.risk}%
                    </Badge>
                  </div>
                  <Progress value={risk.risk} className="h-3" />
                  {risk.risk > 50 && (
                    <div className="text-sm text-gray-700 bg-red-50 rounded-lg p-3">
                      <p className="font-semibold mb-1">Symptoms:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {risk.symptoms.slice(0, 2).map((symptom, index) => (
                          <li key={index}>{symptom}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

        {/* Analysis Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Tissue Concentration Distribution</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tissueConcentrationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tissue" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedElements.map(element => (
                    <Bar 
                      key={element}
                      dataKey={element} 
                      fill={nutrientElements[element as keyof typeof nutrientElements].color}
                      name={nutrientElements[element as keyof typeof nutrientElements].name}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Nutrient Balance Radar</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="element" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar 
                    name="Nutrient Level" 
                    dataKey="value" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Translocation Timeline */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold">
              <TrendingUp className="w-6 h-6 mr-3 text-blue-500" />
              Nutrient Translocation Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={translocationTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  label={{ value: 'Time (hours)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: 'Translocation Rate (mg/g/day)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                {selectedElements.map(element => (
                  <Area
                    key={element}
                    type="monotone"
                    dataKey={element}
                    stackId="1"
                    stroke={nutrientElements[element as keyof typeof nutrientElements].color}
                    fill={nutrientElements[element as keyof typeof nutrientElements].color}
                    fillOpacity={0.6}
                    name={nutrientElements[element as keyof typeof nutrientElements].name}
                  />
                ))}
                {/* Current time indicator */}
                <Line
                  type="monotone"
                  data={[{ hour: timepoint, value: 0 }, { hour: timepoint, value: 100 }]}
                  stroke="#ff0000"
                  strokeWidth={2}
                  dot={false}
                  name="Current Time"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}