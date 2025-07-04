'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ComposedChart, Bar, ReferenceLine } from 'recharts';
import { Play, Pause, RotateCcw, Settings, Eye, Leaf, Sun, Zap, Beaker, TrendingUp, AlertCircle, Info, Download, Upload } from 'lucide-react';

interface LightSpectrum {
  blue: number; // 400-500nm
  green: number; // 500-600nm
  red: number; // 600-700nm
  farRed: number; // 700-800nm
  uv: number; // 280-400nm
}

interface PlantParameters {
  stemElongation: number;
  leafArea: number;
  leafThickness: number;
  chlorophyllContent: number;
  anthocyaninContent: number;
  floweringTime: number;
  rootLength: number;
  biomassAllocation: {
    shoot: number;
    root: number;
    leaf: number;
    stem: number;
  };
}

interface PhotomorphogenicResponse {
  parameter: keyof PlantParameters;
  lightFactor: keyof LightSpectrum;
  sensitivity: number;
  threshold: number;
  saturation: number;
}

interface SimulationData {
  timepoint: number;
  stemHeight: number;
  leafArea: number;
  leafThickness: number;
  chlorophyll: number;
  anthocyanin: number;
  floweringInduction: number;
  phytochromeRatio: number;
  cryptochromeActivity: number;
  phototropinActivity: number;
}

// Research-grade photomorphogenic responses based on scientific literature
const cropResponses: Record<string, PhotomorphogenicResponse[]> = {
  'Lettuce': [
    { parameter: 'stemElongation', lightFactor: 'farRed', sensitivity: 0.25, threshold: 5, saturation: 50 },
    { parameter: 'leafArea', lightFactor: 'blue', sensitivity: 0.15, threshold: 30, saturation: 200 },
    { parameter: 'leafThickness', lightFactor: 'blue', sensitivity: 0.12, threshold: 50, saturation: 150 },
    { parameter: 'chlorophyllContent', lightFactor: 'red', sensitivity: 0.18, threshold: 80, saturation: 400 },
    { parameter: 'anthocyaninContent', lightFactor: 'uv', sensitivity: 0.35, threshold: 2, saturation: 25 }
  ],
  'Cannabis': [
    { parameter: 'stemElongation', lightFactor: 'farRed', sensitivity: 0.45, threshold: 10, saturation: 120 },
    { parameter: 'leafArea', lightFactor: 'blue', sensitivity: 0.22, threshold: 40, saturation: 300 },
    { parameter: 'leafThickness', lightFactor: 'blue', sensitivity: 0.18, threshold: 60, saturation: 250 },
    { parameter: 'chlorophyllContent', lightFactor: 'red', sensitivity: 0.28, threshold: 120, saturation: 600 },
    { parameter: 'anthocyaninContent', lightFactor: 'uv', sensitivity: 0.55, threshold: 5, saturation: 80 },
    { parameter: 'floweringTime', lightFactor: 'farRed', sensitivity: -0.15, threshold: 20, saturation: 100 }
  ],
  'Tomato': [
    { parameter: 'stemElongation', lightFactor: 'farRed', sensitivity: 0.35, threshold: 8, saturation: 80 },
    { parameter: 'leafArea', lightFactor: 'blue', sensitivity: 0.18, threshold: 35, saturation: 220 },
    { parameter: 'leafThickness', lightFactor: 'blue', sensitivity: 0.14, threshold: 55, saturation: 180 },
    { parameter: 'chlorophyllContent', lightFactor: 'red', sensitivity: 0.24, threshold: 100, saturation: 500 },
    { parameter: 'anthocyaninContent', lightFactor: 'uv', sensitivity: 0.28, threshold: 3, saturation: 40 }
  ],
  'Basil': [
    { parameter: 'stemElongation', lightFactor: 'farRed', sensitivity: 0.20, threshold: 6, saturation: 45 },
    { parameter: 'leafArea', lightFactor: 'blue', sensitivity: 0.16, threshold: 25, saturation: 160 },
    { parameter: 'leafThickness', lightFactor: 'blue', sensitivity: 0.10, threshold: 40, saturation: 120 },
    { parameter: 'chlorophyllContent', lightFactor: 'red', sensitivity: 0.20, threshold: 70, saturation: 350 },
    { parameter: 'anthocyaninContent', lightFactor: 'uv', sensitivity: 0.45, threshold: 4, saturation: 35 }
  ],
  'Kale': [
    { parameter: 'stemElongation', lightFactor: 'farRed', sensitivity: 0.18, threshold: 7, saturation: 40 },
    { parameter: 'leafArea', lightFactor: 'blue', sensitivity: 0.14, threshold: 28, saturation: 180 },
    { parameter: 'leafThickness', lightFactor: 'blue', sensitivity: 0.16, threshold: 45, saturation: 140 },
    { parameter: 'chlorophyllContent', lightFactor: 'red', sensitivity: 0.22, threshold: 85, saturation: 420 },
    { parameter: 'anthocyaninContent', lightFactor: 'uv', sensitivity: 0.38, threshold: 3, saturation: 30 }
  ],
  'Spinach': [
    { parameter: 'stemElongation', lightFactor: 'farRed', sensitivity: 0.16, threshold: 6, saturation: 35 },
    { parameter: 'leafArea', lightFactor: 'blue', sensitivity: 0.18, threshold: 25, saturation: 170 },
    { parameter: 'leafThickness', lightFactor: 'blue', sensitivity: 0.14, threshold: 40, saturation: 130 },
    { parameter: 'chlorophyllContent', lightFactor: 'red', sensitivity: 0.24, threshold: 75, saturation: 380 },
    { parameter: 'anthocyaninContent', lightFactor: 'uv', sensitivity: 0.42, threshold: 4, saturation: 35 }
  ],
  'Cucumber': [
    { parameter: 'stemElongation', lightFactor: 'farRed', sensitivity: 0.38, threshold: 12, saturation: 90 },
    { parameter: 'leafArea', lightFactor: 'blue', sensitivity: 0.20, threshold: 40, saturation: 280 },
    { parameter: 'leafThickness', lightFactor: 'blue', sensitivity: 0.12, threshold: 60, saturation: 200 },
    { parameter: 'chlorophyllContent', lightFactor: 'red', sensitivity: 0.26, threshold: 110, saturation: 520 },
    { parameter: 'anthocyaninContent', lightFactor: 'uv', sensitivity: 0.25, threshold: 3, saturation: 28 }
  ],
  'Pepper': [
    { parameter: 'stemElongation', lightFactor: 'farRed', sensitivity: 0.32, threshold: 10, saturation: 75 },
    { parameter: 'leafArea', lightFactor: 'blue', sensitivity: 0.17, threshold: 38, saturation: 240 },
    { parameter: 'leafThickness', lightFactor: 'blue', sensitivity: 0.15, threshold: 58, saturation: 190 },
    { parameter: 'chlorophyllContent', lightFactor: 'red', sensitivity: 0.25, threshold: 105, saturation: 480 },
    { parameter: 'anthocyaninContent', lightFactor: 'uv', sensitivity: 0.48, threshold: 4, saturation: 45 }
  ],
  'Strawberry': [
    { parameter: 'stemElongation', lightFactor: 'farRed', sensitivity: 0.12, threshold: 5, saturation: 30 },
    { parameter: 'leafArea', lightFactor: 'blue', sensitivity: 0.15, threshold: 22, saturation: 150 },
    { parameter: 'leafThickness', lightFactor: 'blue', sensitivity: 0.13, threshold: 35, saturation: 110 },
    { parameter: 'chlorophyllContent', lightFactor: 'red', sensitivity: 0.19, threshold: 65, saturation: 320 },
    { parameter: 'anthocyaninContent', lightFactor: 'uv', sensitivity: 0.55, threshold: 2, saturation: 40 }
  ],
  'Microgreens': [
    { parameter: 'stemElongation', lightFactor: 'farRed', sensitivity: 0.28, threshold: 4, saturation: 25 },
    { parameter: 'leafArea', lightFactor: 'blue', sensitivity: 0.22, threshold: 20, saturation: 120 },
    { parameter: 'leafThickness', lightFactor: 'blue', sensitivity: 0.18, threshold: 30, saturation: 80 },
    { parameter: 'chlorophyllContent', lightFactor: 'red', sensitivity: 0.26, threshold: 50, saturation: 280 },
    { parameter: 'anthocyaninContent', lightFactor: 'uv', sensitivity: 0.65, threshold: 2, saturation: 50 }
  ],
  'Herbs': [
    { parameter: 'stemElongation', lightFactor: 'farRed', sensitivity: 0.22, threshold: 8, saturation: 50 },
    { parameter: 'leafArea', lightFactor: 'blue', sensitivity: 0.19, threshold: 28, saturation: 160 },
    { parameter: 'leafThickness', lightFactor: 'blue', sensitivity: 0.11, threshold: 42, saturation: 125 },
    { parameter: 'chlorophyllContent', lightFactor: 'red', sensitivity: 0.21, threshold: 72, saturation: 350 },
    { parameter: 'anthocyaninContent', lightFactor: 'uv', sensitivity: 0.52, threshold: 3, saturation: 38 }
  ],
  'Arugula': [
    { parameter: 'stemElongation', lightFactor: 'farRed', sensitivity: 0.24, threshold: 6, saturation: 38 },
    { parameter: 'leafArea', lightFactor: 'blue', sensitivity: 0.17, threshold: 26, saturation: 165 },
    { parameter: 'leafThickness', lightFactor: 'blue', sensitivity: 0.15, threshold: 38, saturation: 120 },
    { parameter: 'chlorophyllContent', lightFactor: 'red', sensitivity: 0.23, threshold: 78, saturation: 370 },
    { parameter: 'anthocyaninContent', lightFactor: 'uv', sensitivity: 0.46, threshold: 3, saturation: 32 }
  ]
};

export default function PhotomorphogenesisSimulator() {
  const [selectedCrop, setSelectedCrop] = useState<string>('Lettuce');
  const [lightSpectrum, setLightSpectrum] = useState<LightSpectrum>({
    blue: 150,
    green: 80,
    red: 200,
    farRed: 25,
    uv: 3
  });
  const [simulationTime, setSimulationTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [selectedPhotoperiod, setSelectedPhotoperiod] = useState<number>(16);
  const [temperature, setTemperature] = useState<number>(22);
  const [co2Level, setCo2Level] = useState<number>(400);
  const [maxSimulationTime] = useState<number>(720); // 30 days in hours
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Improved photoreceptor calculations based on scientific literature
  const calculatePhytochromeRatio = (red: number, farRed: number): number => {
    // Pfr/Ptotal ratio using established photoequilibrium values
    const kRed = 0.95; // Absorption coefficient for red light
    const kFarRed = 0.85; // Absorption coefficient for far-red light
    const pfr = (red * kRed) / (red * kRed + farRed * kFarRed + 0.1);
    return Math.min(1, Math.max(0, pfr));
  };

  const calculateCryptocromeActivity = (blue: number, uv: number): number => {
    // Cryptochrome activation follows saturation kinetics
    const blueResponse = (blue * 100) / (blue + 50); // Michaelis-Menten kinetics
    const uvResponse = (uv * 150) / (uv + 10); // Higher sensitivity to UV
    return Math.min(100, blueResponse + uvResponse * 0.3);
  };

  const calculatePhototropinActivity = (blue: number): number => {
    // Phototropin 1 and 2 responses to blue light
    const phot1 = (blue * 80) / (blue + 30); // Lower threshold
    const phot2 = (blue * 120) / (blue + 80); // Higher threshold, stronger response
    return Math.min(100, Math.max(phot1, phot2 * 0.8));
  };

  const simulatePhotomorphogenesis = (time: number): SimulationData => {
    try {
      const responses = cropResponses[selectedCrop] || [];
      const phyRatio = calculatePhytochromeRatio(lightSpectrum.red, lightSpectrum.farRed);
      const cryptoActivity = calculateCryptocromeActivity(lightSpectrum.blue, lightSpectrum.uv);
      const photoActivity = calculatePhototropinActivity(lightSpectrum.blue);

      // Base values representing young seedlings
      let stemHeight = 2.5;
      let leafArea = 1.2; 
      let leafThickness = 0.15;
      let chlorophyll = 25;
      let anthocyanin = 2;
      let floweringInduction = 0;

      // Time factor with realistic growth curves
      const timeDays = time / 24; // Convert hours to days
      const growthFactor = Math.log(1 + timeDays) / 5; // Logarithmic growth

      // Environmental stress factors
      const tempOptimal = selectedCrop === 'Lettuce' ? 20 : selectedCrop === 'Cannabis' ? 26 : 24;
      const tempStress = Math.exp(-Math.pow(temperature - tempOptimal, 2) / 50);
      const photoperiodStress = selectedCrop === 'Cannabis' && selectedPhotoperiod < 12 ? 0.7 : 1.0;
      const co2Enhancement = Math.min(1.8, (co2Level / 400) ** 0.5);

      responses.forEach(response => {
        const lightValue = lightSpectrum[response.lightFactor];
        
        // Michaelis-Menten response to light
        const responseStrength = (response.saturation * lightValue) / 
                                (response.threshold + lightValue) * response.sensitivity;

        switch (response.parameter) {
          case 'stemElongation':
            // Shade avoidance response - high FR:R ratio promotes stem elongation
            const shadeResponse = 1 + (1 - phyRatio) * 2;
            stemHeight += responseStrength * growthFactor * shadeResponse * tempStress;
            break;
          case 'leafArea':
            // Blue light promotes leaf expansion
            leafArea += responseStrength * growthFactor * 0.08 * tempStress * co2Enhancement;
            break;
          case 'leafThickness':
            // Blue light increases leaf thickness (sun vs shade adaptation)
            leafThickness += responseStrength * growthFactor * 0.0008 * tempStress;
            break;
          case 'chlorophyllContent':
            // Red light optimizes photosystem development
            const lightStress = lightSpectrum.red > 500 ? 0.9 : 1.0; // High light stress
            chlorophyll += responseStrength * growthFactor * 0.03 * tempStress * lightStress;
            break;
          case 'anthocyaninContent':
            // UV protection and cold stress response
            const uvStress = lightSpectrum.uv > 10 ? 1.5 : 1.0;
            const coldStress = temperature < 15 ? 1.3 : 1.0;
            anthocyanin += responseStrength * growthFactor * 0.015 * uvStress * coldStress;
            break;
          case 'floweringTime':
            // Photoperiodic flowering response
            if (selectedCrop === 'Cannabis') {
              const criticalPhotoperiod = 14;
              if (selectedPhotoperiod < criticalPhotoperiod) {
                const floweringStrength = (criticalPhotoperiod - selectedPhotoperiod) / criticalPhotoperiod;
                floweringInduction += floweringStrength * 0.8 * (timeDays / 30) * 100;
              }
            }
            break;
        }
      });

      return {
        timepoint: time,
        stemHeight: Math.max(2.5, stemHeight),
        leafArea: Math.max(1.2, leafArea),
        leafThickness: Math.max(0.15, leafThickness),
        chlorophyll: Math.max(25, Math.min(80, chlorophyll)),
        anthocyanin: Math.max(2, Math.min(50, anthocyanin)),
        floweringInduction: Math.min(100, Math.max(0, floweringInduction)),
        phytochromeRatio: phyRatio,
        cryptochromeActivity: cryptoActivity,
        phototropinActivity: photoActivity
      };
    } catch (error) {
      console.error('Simulation calculation error:', error);
      setError('Error in photomorphogenesis calculation');
      return {
        timepoint: time,
        stemHeight: 2.5,
        leafArea: 1.2,
        leafThickness: 0.15,
        chlorophyll: 25,
        anthocyanin: 2,
        floweringInduction: 0,
        phytochromeRatio: 0.5,
        cryptochromeActivity: 0,
        phototropinActivity: 0
      };
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && simulationTime < maxSimulationTime) {
      interval = setInterval(() => {
        setSimulationTime(prev => {
          const newTime = prev + simulationSpeed;
          if (newTime >= maxSimulationTime) {
            setIsRunning(false);
            return maxSimulationTime;
          }
          const newData = simulatePhotomorphogenesis(newTime);
          setSimulationData(prevData => [...prevData.slice(-199), newData]); // Keep more data points
          return newTime;
        });
      }, 50); // Smoother animation
    } else if (simulationTime >= maxSimulationTime) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed, lightSpectrum, selectedCrop, selectedPhotoperiod, temperature, co2Level, simulationTime, maxSimulationTime]);

  const resetSimulation = () => {
    setSimulationTime(0);
    setSimulationData([]);
    setIsRunning(false);
    setError(null);
    // Initialize with starting data point
    const initialData = simulatePhotomorphogenesis(0);
    setSimulationData([initialData]);
  };

  // Export simulation data
  const exportData = () => {
    const dataStr = JSON.stringify({
      crop: selectedCrop,
      lightSpectrum,
      environment: { photoperiod: selectedPhotoperiod, temperature, co2Level },
      simulationData
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `photomorphogenesis-${selectedCrop.toLowerCase()}-${timestamp}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', filename);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  // Light spectrum presets for easier use
  const lightPresets = {
    'Sunlight': { blue: 180, green: 120, red: 200, farRed: 35, uv: 8 },
    'LED Full Spectrum': { blue: 150, green: 80, red: 200, farRed: 25, uv: 3 },
    'Blue Heavy': { blue: 300, green: 60, red: 150, farRed: 20, uv: 5 },
    'Red Heavy': { blue: 100, green: 50, red: 350, farRed: 30, uv: 2 },
    'Shade Simulation': { blue: 80, green: 100, red: 120, farRed: 80, uv: 1 },
    'UV Stress': { blue: 120, green: 70, red: 180, farRed: 25, uv: 15 }
  };

  const applyLightPreset = (presetName: keyof typeof lightPresets) => {
    setLightSpectrum(lightPresets[presetName]);
  };

  const currentData = simulatePhotomorphogenesis(simulationTime);
  const progressPercentage = (simulationTime / maxSimulationTime) * 100;

  // Initialize simulation data on mount
  useEffect(() => {
    if (simulationData.length === 0) {
      resetSimulation();
    }
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Beautiful Header */}
      <div className="text-center space-y-6 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border">
        <div className="flex items-center justify-center space-x-4">
          <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full shadow-lg">
            <Zap className="w-10 h-10 text-purple-600" />
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Photomorphogenesis Simulator
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mt-3 font-medium">
              Research-grade simulation of plant responses to light spectra and photoreceptor signaling
            </p>
          </div>
        </div>
        
        <div className="flex justify-center flex-wrap gap-4">
          <Badge variant="outline" className="flex items-center space-x-2 px-4 py-2 text-base">
            <Beaker className="w-5 h-5" />
            <span className="font-semibold">Scientific Model</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-2 px-4 py-2 text-base">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Real-time Analysis</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-2 px-4 py-2 text-base">
            <Leaf className="w-5 h-5" />
            <span className="font-semibold">{Object.keys(cropResponses).length} Crop Models</span>
          </Badge>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Control Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 border-blue-200 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Simulation Controls</h3>
                <Badge 
                  variant={isRunning ? "default" : "secondary"} 
                  className="flex items-center space-x-2 px-3 py-1 text-base font-semibold"
                >
                  {isRunning ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span>{isRunning ? 'Running' : 'Paused'}</span>
                </Badge>
              </div>
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Time: <span className="text-blue-600 dark:text-blue-400 font-bold">{(simulationTime / 24).toFixed(1)} days</span> 
                <span className="mx-2">•</span> 
                Crop: <span className="text-green-600 dark:text-green-400 font-bold">{selectedCrop}</span>
              </div>
              <div className="w-full max-w-md">
                <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={exportData}
                variant="outline"
                disabled={simulationData.length === 0}
                size="lg"
                className="font-semibold"
              >
                <Download className="w-5 h-5 mr-2" />
                Export Data
              </Button>
              <Button
                onClick={() => setIsRunning(!isRunning)}
                variant={isRunning ? "destructive" : "default"}
                disabled={simulationTime >= maxSimulationTime}
                size="lg"
                className="font-semibold px-6"
              >
                {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isRunning ? 'Pause' : 'Start Simulation'}
              </Button>
              <Button onClick={resetSimulation} variant="outline" size="lg" className="font-semibold">
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Plant & Environment Settings */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg font-bold">
              <Settings className="w-6 h-6 mr-3 text-blue-600" />
              Plant & Environment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">Crop Species</Label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger className="mt-3 h-12 text-base font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(cropResponses).map(crop => (
                    <SelectItem key={crop} value={crop} className="text-base py-3">{crop}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">
                Simulation Speed: <span className="text-blue-600 dark:text-blue-400">{simulationSpeed}x</span>
              </Label>
              <Slider
                value={[simulationSpeed]}
                onValueChange={(value) => setSimulationSpeed(value[0])}
                max={5}
                min={0.1}
                step={0.1}
                className="mt-3"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Real-time to 5x accelerated</div>
            </div>

            <div>
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">
                Photoperiod: <span className="text-orange-600 dark:text-orange-400">{selectedPhotoperiod}h</span>
              </Label>
              <Slider
                value={[selectedPhotoperiod]}
                onValueChange={(value) => setSelectedPhotoperiod(value[0])}
                max={24}
                min={8}
                step={1}
                className="mt-3"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Hours of light per day</div>
            </div>

            <div>
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">
                Temperature: <span className="text-red-600 dark:text-red-400">{temperature}°C</span>
              </Label>
              <Slider
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
                max={35}
                min={15}
                step={1}
                className="mt-3"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Growth chamber temperature</div>
            </div>

            <div>
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">
                CO₂ Level: <span className="text-green-600 dark:text-green-400">{co2Level} ppm</span>
              </Label>
              <Slider
                value={[co2Level]}
                onValueChange={(value) => setCo2Level(value[0])}
                max={1500}
                min={300}
                step={50}
                className="mt-3"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Atmospheric CO₂ concentration</div>
            </div>
          </CardContent>
        </Card>

        {/* Light Spectrum Control */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg font-bold">
              <Sun className="w-6 h-6 mr-3 text-yellow-600" />
              Light Spectrum Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Light Presets */}
            <div>
              <Label className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 block">Quick Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(lightPresets).map(preset => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => applyLightPreset(preset as keyof typeof lightPresets)}
                    className="text-xs font-medium"
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-base font-semibold flex items-center text-gray-800 dark:text-gray-200">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3 shadow-md"></div>
                Blue (400-500nm): <span className="text-blue-600 dark:text-blue-400 ml-2">{lightSpectrum.blue} μmol/m²/s</span>
              </Label>
              <Slider
                value={[lightSpectrum.blue]}
                onValueChange={(value) => setLightSpectrum(prev => ({ ...prev, blue: value[0] }))}
                max={500}
                min={0}
                step={10}
                className="mt-3"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Cryptochrome, phototropin activation</div>
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center text-gray-800 dark:text-gray-200">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3 shadow-md"></div>
                Green (500-600nm): <span className="text-green-600 dark:text-green-400 ml-2">{lightSpectrum.green} μmol/m²/s</span>
              </Label>
              <Slider
                value={[lightSpectrum.green]}
                onValueChange={(value) => setLightSpectrum(prev => ({ ...prev, green: value[0] }))}
                max={300}
                min={0}
                step={10}
                className="mt-3"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Canopy penetration, stomatal control</div>
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center text-gray-800 dark:text-gray-200">
                <div className="w-4 h-4 bg-red-600 rounded-full mr-3 shadow-md"></div>
                Red (600-700nm): <span className="text-red-600 dark:text-red-400 ml-2">{lightSpectrum.red} μmol/m²/s</span>
              </Label>
              <Slider
                value={[lightSpectrum.red]}
                onValueChange={(value) => setLightSpectrum(prev => ({ ...prev, red: value[0] }))}
                max={800}
                min={0}
                step={10}
                className="mt-3"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Photosynthesis, phytochrome activation</div>
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center text-gray-800 dark:text-gray-200">
                <div className="w-4 h-4 bg-red-900 rounded-full mr-3 shadow-md"></div>
                Far-Red (700-800nm): <span className="text-red-800 dark:text-red-300 ml-2">{lightSpectrum.farRed} μmol/m²/s</span>
              </Label>
              <Slider
                value={[lightSpectrum.farRed]}
                onValueChange={(value) => setLightSpectrum(prev => ({ ...prev, farRed: value[0] }))}
                max={200}
                min={0}
                step={5}
                className="mt-3"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Shade avoidance, stem elongation</div>
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center text-gray-800 dark:text-gray-200">
                <div className="w-4 h-4 bg-purple-600 rounded-full mr-3 shadow-md"></div>
                UV (280-400nm): <span className="text-purple-600 dark:text-purple-400 ml-2">{lightSpectrum.uv} μmol/m²/s</span>
              </Label>
              <Slider
                value={[lightSpectrum.uv]}
                onValueChange={(value) => setLightSpectrum(prev => ({ ...prev, uv: value[0] }))}
                max={50}
                min={0}
                step={1}
                className="mt-3"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">UV protection, anthocyanin synthesis</div>
            </div>

            <div className="pt-6 border-t space-y-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between text-base font-semibold">
                <span className="text-gray-700 dark:text-gray-300">Total PPFD:</span>
                <span className="text-green-600 dark:text-green-400 text-lg">
                  {lightSpectrum.blue + lightSpectrum.green + lightSpectrum.red} μmol/m²/s
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span className="text-gray-700 dark:text-gray-300">R:FR Ratio:</span>
                <span className="text-blue-600 dark:text-blue-400 text-lg">
                  {(lightSpectrum.red / Math.max(1, lightSpectrum.farRed)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span className="text-gray-700 dark:text-gray-300">Blue:Red Ratio:</span>
                <span className="text-purple-600 dark:text-purple-400 text-lg">
                  {(lightSpectrum.blue / Math.max(1, lightSpectrum.red)).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Plant State */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Current Plant State
              </span>
              <Badge variant="outline" className="text-sm">
                Day {(simulationTime / 24).toFixed(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="morphology" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="morphology">Morphology</TabsTrigger>
                <TabsTrigger value="physiology">Physiology</TabsTrigger>
                <TabsTrigger value="photoreceptors">Photoreceptors</TabsTrigger>
              </TabsList>
              
              <TabsContent value="morphology" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Stem Height:</span>
                      <span className="font-bold text-blue-600">{currentData.stemHeight.toFixed(1)} cm</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Leaf Area:</span>
                      <span className="font-bold text-green-600">{currentData.leafArea.toFixed(1)} cm²</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">Leaf Thickness:</span>
                      <span className="font-bold text-purple-600">{currentData.leafThickness.toFixed(2)} mm</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium">Biomass Index:</span>
                      <span className="font-bold text-orange-600">
                        {(currentData.stemHeight * currentData.leafArea / 10).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="physiology" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Chlorophyll:</span>
                      <span className="font-bold text-green-600">{currentData.chlorophyll.toFixed(1)} SPAD</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Anthocyanin:</span>
                      <span className="font-bold text-red-600">{currentData.anthocyanin.toFixed(1)} units</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium">Flowering:</span>
                      <span className="font-bold text-pink-600">{currentData.floweringInduction.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Stress Index:</span>
                      <span className="font-bold text-gray-600">
                        {Math.max(0, Math.min(100, (1 - currentData.phytochromeRatio) * 50 + 
                        (lightSpectrum.uv > 10 ? 20 : 0))).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="photoreceptors" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Phytochrome Pfr/Ptotal:</span>
                      <span className="font-bold text-red-600">{currentData.phytochromeRatio.toFixed(3)}</span>
                    </div>
                    <Progress value={currentData.phytochromeRatio * 100} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">Red/Far-red light detection</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Cryptochrome Activity:</span>
                      <span className="font-bold text-blue-600">{currentData.cryptochromeActivity.toFixed(1)}%</span>
                    </div>
                    <Progress value={currentData.cryptochromeActivity} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">Blue/UV light detection</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Phototropin Activity:</span>
                      <span className="font-bold text-purple-600">{currentData.phototropinActivity.toFixed(1)}%</span>
                    </div>
                    <Progress value={currentData.phototropinActivity} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">Blue light phototropism</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Photomorphogenic Responses Over Time
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Info className="w-4 h-4 mr-2" />
                {showAdvanced ? 'Hide' : 'Show'} Details
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="morphology" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="morphology">Morphology</TabsTrigger>
              <TabsTrigger value="physiology">Physiology</TabsTrigger>
              <TabsTrigger value="photoreceptors">Photoreceptors</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="morphology" className="space-y-4">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="timepoint" 
                      label={{ value: 'Time (hours)', position: 'insideBottom', offset: -10 }}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      label={{ value: 'Height (cm) / Area (cm²)', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      label={{ value: 'Thickness (mm)', angle: 90, position: 'insideRight' }}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value, name) => [Number(value).toFixed(2), name]}
                      labelFormatter={(value) => `Time: ${value}h (Day ${(Number(value) / 24).toFixed(1)})`}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone" 
                      dataKey="stemHeight" 
                      stroke="#3b82f6" 
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Stem Height (cm)" 
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="leafArea" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Leaf Area (cm²)" 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="leafThickness" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Leaf Thickness (mm)" 
                    />
                    {isRunning && (
                      <ReferenceLine 
                        x={simulationTime} 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        label={{ value: "Current", position: "top" }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="physiology" className="space-y-4">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="timepoint" 
                      label={{ value: 'Time (hours)', position: 'insideBottom', offset: -10 }}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      label={{ value: 'Pigment Content / Flowering (%)', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value, name) => [Number(value).toFixed(2), name]}
                      labelFormatter={(value) => `Time: ${value}h (Day ${(Number(value) / 24).toFixed(1)})`}
                    />
                    <Legend />
                    <Area
                      type="monotone" 
                      dataKey="chlorophyll" 
                      stroke="#22c55e" 
                      fill="#22c55e"
                      fillOpacity={0.4}
                      name="Chlorophyll (SPAD)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="anthocyanin" 
                      stroke="#dc2626" 
                      strokeWidth={3}
                      name="Anthocyanin (units)" 
                    />
                    {selectedCrop === 'Cannabis' && (
                      <Line 
                        type="monotone" 
                        dataKey="floweringInduction" 
                        stroke="#7c3aed" 
                        strokeWidth={2}
                        name="Flowering Induction (%)" 
                      />
                    )}
                    {isRunning && (
                      <ReferenceLine 
                        x={simulationTime} 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        label={{ value: "Current", position: "top" }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="photoreceptors" className="space-y-4">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="timepoint" 
                      label={{ value: 'Time (hours)', position: 'insideBottom', offset: -10 }}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      label={{ value: 'Photoreceptor Activity', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value, name) => [Number(value).toFixed(3), name]}
                      labelFormatter={(value) => `Time: ${value}h (Day ${(Number(value) / 24).toFixed(1)})`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="phytochromeRatio" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      name="Phytochrome Pfr/Ptotal" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cryptochromeActivity" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Cryptochrome Activity (%)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="phototropinActivity" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      name="Phototropin Activity (%)" 
                    />
                    {isRunning && (
                      <ReferenceLine 
                        x={simulationTime} 
                        stroke="#374151" 
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        label={{ value: "Current", position: "top" }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="timepoint" 
                      label={{ value: 'Time (hours)', position: 'insideBottom', offset: -10 }}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      label={{ value: 'Growth Parameters', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      label={{ value: 'Photoreceptor Activity', angle: 90, position: 'insideRight' }}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value, name) => [Number(value).toFixed(2), name]}
                      labelFormatter={(value) => `Time: ${value}h (Day ${(Number(value) / 24).toFixed(1)})`}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone" 
                      dataKey="stemHeight" 
                      stroke="#3b82f6" 
                      fill="#3b82f6"
                      fillOpacity={0.2}
                      name="Stem Height (cm)" 
                    />
                    <Area
                      yAxisId="left"
                      type="monotone" 
                      dataKey="leafArea" 
                      stroke="#10b981" 
                      fill="#10b981"
                      fillOpacity={0.2}
                      name="Leaf Area (cm²)" 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="phytochromeRatio" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Phytochrome Activity" 
                    />
                    {isRunning && (
                      <ReferenceLine 
                        x={simulationTime} 
                        stroke="#374151" 
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        label={{ value: "Current", position: "top" }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}