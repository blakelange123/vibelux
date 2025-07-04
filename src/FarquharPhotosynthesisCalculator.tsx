'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Thermometer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Leaf, Sun, Wind, Droplets, Info, TrendingUp } from 'lucide-react';
import { advancedCalculations } from '@/lib/advanced-scientific-calculations';

interface PhotosynthesisData {
  ppfd: number;
  temperature: number;
  co2: number;
  vpd: number;
  netAssimilation: number;
}

export default function FarquharPhotosynthesisCalculator() {
  const [ppfd, setPPFD] = useState(600);
  const [temperature, setTemperature] = useState(22);
  const [co2PPM, setCO2PPM] = useState(400);
  const [vpd, setVPD] = useState(1.0);
  const [photosyntheticRate, setPhotosyntheticRate] = useState<number | null>(null);
  const [lightResponseData, setLightResponseData] = useState<PhotosynthesisData[]>([]);
  const [co2ResponseData, setCO2ResponseData] = useState<PhotosynthesisData[]>([]);
  const [temperatureResponseData, setTemperatureResponseData] = useState<PhotosynthesisData[]>([]);

  useEffect(() => {
    calculatePhotosynthesis();
    generateResponseCurves();
  }, [ppfd, temperature, co2PPM, vpd]);

  const calculatePhotosynthesis = () => {
    const rate = advancedCalculations.estimatePhotosyntheticRate(
      ppfd, co2PPM, temperature, vpd
    );
    setPhotosyntheticRate(rate);
  };

  const generateResponseCurves = () => {
    // Light response curve
    const lightData: PhotosynthesisData[] = [];
    for (let p = 0; p <= 2000; p += 50) {
      lightData.push({
        ppfd: p,
        temperature,
        co2: co2PPM,
        vpd,
        netAssimilation: advancedCalculations.estimatePhotosyntheticRate(p, co2PPM, temperature, vpd)
      });
    }
    setLightResponseData(lightData);

    // CO2 response curve
    const co2Data: PhotosynthesisData[] = [];
    for (let c = 0; c <= 2000; c += 50) {
      co2Data.push({
        ppfd,
        temperature,
        co2: c,
        vpd,
        netAssimilation: advancedCalculations.estimatePhotosyntheticRate(ppfd, c, temperature, vpd)
      });
    }
    setCO2ResponseData(co2Data);

    // Temperature response curve
    const tempData: PhotosynthesisData[] = [];
    for (let t = 5; t <= 40; t += 1) {
      tempData.push({
        ppfd,
        temperature: t,
        co2: co2PPM,
        vpd,
        netAssimilation: advancedCalculations.estimatePhotosyntheticRate(ppfd, co2PPM, t, vpd)
      });
    }
    setTemperatureResponseData(tempData);
  };

  const getLimitingFactor = () => {
    if (!photosyntheticRate) return null;

    // Test which factor has the most impact
    const baseLine = photosyntheticRate;
    
    // Test 10% increases
    const lightIncrease = advancedCalculations.estimatePhotosyntheticRate(
      ppfd * 1.1, co2PPM, temperature, vpd
    );
    const co2Increase = advancedCalculations.estimatePhotosyntheticRate(
      ppfd, co2PPM * 1.1, temperature, vpd
    );
    const tempOptimal = advancedCalculations.estimatePhotosyntheticRate(
      ppfd, co2PPM, 25, vpd
    );

    const lightEffect = (lightIncrease - baseLine) / baseLine;
    const co2Effect = (co2Increase - baseLine) / baseLine;
    const tempEffect = (tempOptimal - baseLine) / baseLine;

    const maxEffect = Math.max(lightEffect, co2Effect, tempEffect);

    if (maxEffect === lightEffect) return 'Light-limited';
    if (maxEffect === co2Effect) return 'CO₂-limited';
    if (maxEffect === tempEffect) return 'Temperature-limited';
    return 'Balanced';
  };

  const getOptimizationSuggestions = () => {
    const suggestions = [];
    const limitingFactor = getLimitingFactor();

    if (limitingFactor === 'Light-limited' && ppfd < 800) {
      suggestions.push('Increase light intensity to 800-1000 μmol/m²/s for higher photosynthesis');
    }

    if (limitingFactor === 'CO₂-limited' && co2PPM < 800) {
      suggestions.push('Consider CO₂ supplementation to 800-1200 ppm');
    }

    if (temperature < 20 || temperature > 30) {
      suggestions.push('Optimize temperature to 22-28°C range');
    }

    if (vpd < 0.8 || vpd > 1.2) {
      suggestions.push('Adjust VPD to 0.8-1.2 kPa for optimal stomatal function');
    }

    return suggestions;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-6 w-6" />
            Farquhar Photosynthesis Model Calculator
          </CardTitle>
          <CardDescription>
            Advanced C3 photosynthesis modeling with temperature and VPD effects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calculator" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="light">Light Response</TabsTrigger>
              <TabsTrigger value="co2">CO₂ Response</TabsTrigger>
              <TabsTrigger value="temperature">Temperature Response</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculator" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="ppfd-slider" className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      PPFD: {ppfd} μmol/m²/s
                    </Label>
                    <Slider
                      id="ppfd-slider"
                      min={0}
                      max={2000}
                      step={50}
                      value={[ppfd]}
                      onValueChange={(value) => setPPFD(value[0])}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="temp-slider" className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Temperature: {temperature}°C
                    </Label>
                    <Slider
                      id="temp-slider"
                      min={10}
                      max={40}
                      step={1}
                      value={[temperature]}
                      onValueChange={(value) => setTemperature(value[0])}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="co2-slider" className="flex items-center gap-2">
                      <Wind className="h-4 w-4" />
                      CO₂: {co2PPM} ppm
                    </Label>
                    <Slider
                      id="co2-slider"
                      min={200}
                      max={1500}
                      step={50}
                      value={[co2PPM]}
                      onValueChange={(value) => setCO2PPM(value[0])}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vpd-slider" className="flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      VPD: {vpd.toFixed(1)} kPa
                    </Label>
                    <Slider
                      id="vpd-slider"
                      min={0.4}
                      max={2.0}
                      step={0.1}
                      value={[vpd]}
                      onValueChange={(value) => setVPD(value[0])}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {photosyntheticRate !== null && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Net Photosynthesis Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center p-6 bg-green-50 rounded-lg">
                            <div className="text-4xl font-bold text-green-600">
                              {photosyntheticRate.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              μmol CO₂/m²/s
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm font-medium text-blue-900">
                              Limiting Factor: {getLimitingFactor()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {getOptimizationSuggestions().length > 0 && (
                        <Alert>
                          <TrendingUp className="h-4 w-4" />
                          <AlertTitle>Optimization Suggestions</AlertTitle>
                          <AlertDescription>
                            <ul className="mt-2 space-y-1">
                              {getOptimizationSuggestions().map((suggestion, index) => (
                                <li key={index} className="text-sm">• {suggestion}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Model Information</AlertTitle>
                        <AlertDescription className="text-sm">
                          This calculator uses the Farquhar-von Caemmerer-Berry model for C3 photosynthesis, 
                          including Rubisco and RuBP-limited rates, temperature dependencies, and VPD effects 
                          on stomatal conductance.
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="light" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Light Response Curve</CardTitle>
                  <CardDescription>
                    Photosynthesis rate vs PPFD at {temperature}°C, {co2PPM} ppm CO₂, {vpd.toFixed(1)} kPa VPD
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={lightResponseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="ppfd" 
                        label={{ value: 'PPFD (μmol/m²/s)', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        label={{ value: 'Net Assimilation (μmol CO₂/m²/s)', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="netAssimilation" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={false}
                        name="Photosynthesis Rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Key Points:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Light saturation occurs around 800-1000 μmol/m²/s</li>
                      <li>• Initial slope represents quantum yield</li>
                      <li>• Plateau indicates Rubisco-limited photosynthesis</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="co2" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CO₂ Response Curve</CardTitle>
                  <CardDescription>
                    Photosynthesis rate vs CO₂ at {ppfd} μmol/m²/s, {temperature}°C, {vpd.toFixed(1)} kPa VPD
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={co2ResponseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="co2" 
                        label={{ value: 'CO₂ Concentration (ppm)', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        label={{ value: 'Net Assimilation (μmol CO₂/m²/s)', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="netAssimilation" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                        name="Photosynthesis Rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Key Points:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• CO₂ compensation point around 50-100 ppm</li>
                      <li>• Linear increase up to ~800 ppm</li>
                      <li>• Diminishing returns above 1000 ppm</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="temperature" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Temperature Response Curve</CardTitle>
                  <CardDescription>
                    Photosynthesis rate vs Temperature at {ppfd} μmol/m²/s, {co2PPM} ppm CO₂, {vpd.toFixed(1)} kPa VPD
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={temperatureResponseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="temperature" 
                        label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        label={{ value: 'Net Assimilation (μmol CO₂/m²/s)', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="netAssimilation" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={false}
                        name="Photosynthesis Rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Key Points:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Optimal temperature typically 20-30°C</li>
                      <li>• Enzyme kinetics determine temperature response</li>
                      <li>• High temperatures increase respiration</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}