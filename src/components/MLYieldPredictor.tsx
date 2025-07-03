'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Leaf, DollarSign } from 'lucide-react';
import { yieldPredictor } from '@/lib/ml-yield-predictor';

interface YieldInputs {
  ppfd: string;
  dli: string;
  redRatio: string;
  blueRatio: string;
  temperature: string;
  co2PPM: string;
  vpd: string;
}

export default function MLYieldPredictor() {
  const [inputs, setInputs] = useState<YieldInputs>({
    ppfd: '600',
    dli: '20',
    redRatio: '0.65',
    blueRatio: '0.20',
    temperature: '22',
    co2PPM: '400',
    vpd: '1.0'
  });
  
  const [yieldResult, setYieldResult] = useState<any>(null);
  const [showModelInfo, setShowModelInfo] = useState(false);

  const updateInput = (field: keyof YieldInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const predictYield = () => {
    const prediction = yieldPredictor.predictYield({
      ppfd: parseFloat(inputs.ppfd),
      dli: parseFloat(inputs.dli),
      redRatio: parseFloat(inputs.redRatio),
      blueRatio: parseFloat(inputs.blueRatio),
      temperature: parseFloat(inputs.temperature),
      co2PPM: parseFloat(inputs.co2PPM),
      vpd: parseFloat(inputs.vpd)
    });
    setYieldResult(prediction);
  };

  const getFeatureImportanceData = () => {
    return yieldPredictor.getFeatureImportance().map(fi => ({
      feature: fi.feature.replace('PPM', '').replace('Ratio', ''),
      importance: fi.importance * 100
    }));
  };

  const getRadarData = () => {
    if (!yieldResult) return [];
    
    // Calculate how close each parameter is to optimal (0-100 scale)
    const optimalRanges = {
      ppfd: { optimal: 600, range: 400 },
      dli: { optimal: 20, range: 20 },
      temperature: { optimal: 22, range: 10 },
      co2PPM: { optimal: 1000, range: 600 },
      vpd: { optimal: 1.0, range: 0.8 },
      spectrum: { optimal: 1.0, range: 0.5 }
    };
    
    const ppfdScore = Math.max(0, 100 - Math.abs(parseFloat(inputs.ppfd) - optimalRanges.ppfd.optimal) / optimalRanges.ppfd.range * 100);
    const dliScore = Math.max(0, 100 - Math.abs(parseFloat(inputs.dli) - optimalRanges.dli.optimal) / optimalRanges.dli.range * 100);
    const tempScore = Math.max(0, 100 - Math.abs(parseFloat(inputs.temperature) - optimalRanges.temperature.optimal) / optimalRanges.temperature.range * 100);
    const co2Score = Math.max(0, 100 - Math.abs(parseFloat(inputs.co2PPM) - optimalRanges.co2PPM.optimal) / optimalRanges.co2PPM.range * 100);
    const vpdScore = Math.max(0, 100 - Math.abs(parseFloat(inputs.vpd) - optimalRanges.vpd.optimal) / optimalRanges.vpd.range * 100);
    
    // Spectrum score based on how close red and blue ratios are to optimal
    const redScore = Math.max(0, 100 - Math.abs(parseFloat(inputs.redRatio) - 0.65) / 0.15 * 100);
    const blueScore = Math.max(0, 100 - Math.abs(parseFloat(inputs.blueRatio) - 0.20) / 0.10 * 100);
    const spectrumScore = (redScore + blueScore) / 2;
    
    return [
      { factor: 'Light (PPFD)', value: ppfdScore },
      { factor: 'Daily Light (DLI)', value: dliScore },
      { factor: 'Temperature', value: tempScore },
      { factor: 'CO₂', value: co2Score },
      { factor: 'VPD', value: vpdScore },
      { factor: 'Spectrum', value: spectrumScore }
    ];
  };

  const calculateROI = () => {
    if (!yieldResult) return null;
    
    const growAreaM2 = 100; // Example: 100 m²
    const cyclesPerYear = 4;
    const pricePerKg = 2000; // Example price
    
    const annualYield = yieldResult.predictedYield * growAreaM2 * cyclesPerYear;
    const potentialAnnualYield = yieldResult.potentialYield * growAreaM2 * cyclesPerYear;
    
    const currentRevenue = annualYield * pricePerKg;
    const potentialRevenue = potentialAnnualYield * pricePerKg;
    const revenueIncrease = potentialRevenue - currentRevenue;
    
    return {
      currentRevenue,
      potentialRevenue,
      revenueIncrease,
      percentIncrease: (revenueIncrease / currentRevenue * 100).toFixed(1)
    };
  };

  const modelMetrics = yieldPredictor.getModelMetrics();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Machine Learning Yield Predictor
          </CardTitle>
          <CardDescription>
            AI-powered yield predictions based on environmental conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="predictor" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="predictor">Yield Predictor</TabsTrigger>
              <TabsTrigger value="analysis">Factor Analysis</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
              <TabsTrigger value="model">Model Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="predictor" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Environmental Inputs</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="ppfd">PPFD (μmol/m²/s)</Label>
                      <Input
                        id="ppfd"
                        type="number"
                        value={inputs.ppfd}
                        onChange={(e) => updateInput('ppfd', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dli">DLI (mol/m²/day)</Label>
                      <Input
                        id="dli"
                        type="number"
                        value={inputs.dli}
                        onChange={(e) => updateInput('dli', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        value={inputs.temperature}
                        onChange={(e) => updateInput('temperature', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="co2">CO₂ (ppm)</Label>
                      <Input
                        id="co2"
                        type="number"
                        value={inputs.co2PPM}
                        onChange={(e) => updateInput('co2PPM', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="vpd">VPD (kPa)</Label>
                      <Input
                        id="vpd"
                        type="number"
                        step="0.1"
                        value={inputs.vpd}
                        onChange={(e) => updateInput('vpd', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Spectrum Ratios</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Red"
                          value={inputs.redRatio}
                          onChange={(e) => updateInput('redRatio', e.target.value)}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Blue"
                          value={inputs.blueRatio}
                          onChange={(e) => updateInput('blueRatio', e.target.value)}
                        />
                      </div>
                      <span className="text-xs text-gray-500">Red / Blue ratios</span>
                    </div>
                  </div>
                  
                  <Button onClick={predictYield} className="w-full">
                    <Brain className="mr-2 h-4 w-4" />
                    Predict Yield
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {yieldResult && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Yield Prediction</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center p-6 bg-green-50 rounded-lg">
                            <div className="text-4xl font-bold text-green-600">
                              {yieldResult.predictedYield} kg/m²
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              per growth cycle
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Model Confidence</span>
                            <div className="flex items-center gap-2">
                              <Progress value={yieldResult.confidence * 100} className="w-24 h-2" />
                              <span className="text-sm font-medium">
                                {(yieldResult.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm font-medium text-blue-900 mb-1">
                              Potential Yield with Optimization:
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {yieldResult.potentialYield} kg/m²
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {yieldResult.limitingFactors.length > 0 && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Limiting Factors</AlertTitle>
                          <AlertDescription>
                            <ul className="mt-2 space-y-1">
                              {yieldResult.limitingFactors.map((factor: string, index: number) => (
                                <li key={index} className="text-sm">• {factor}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Feature Importance</CardTitle>
                    <CardDescription>
                      Relative importance of each factor in yield prediction
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getFeatureImportanceData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="feature" />
                        <YAxis label={{ value: 'Importance (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="importance" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Environmental Optimization</CardTitle>
                    <CardDescription>
                      How close your conditions are to optimal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {yieldResult && (
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={getRadarData()}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="factor" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          <Radar 
                            name="Current" 
                            dataKey="value" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.6} 
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="optimization" className="space-y-4">
              {yieldResult && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Optimization Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {yieldResult.optimizationSuggestions.map((suggestion: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                          <p className="text-sm text-blue-900">{suggestion}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  {calculateROI() && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Potential ROI from Optimization
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">Current Annual Revenue</div>
                            <div className="text-2xl font-bold">${calculateROI()!.currentRevenue.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">per 100m²</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-sm text-gray-600">Optimized Revenue</div>
                            <div className="text-2xl font-bold text-green-600">
                              ${calculateROI()!.potentialRevenue.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">per 100m²</div>
                          </div>
                        </div>
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-center">
                          <div className="text-sm text-gray-600">Potential Revenue Increase</div>
                          <div className="text-3xl font-bold text-yellow-700">
                            +{calculateROI()!.percentIncrease}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="model" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Model Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Model Type</div>
                      <div className="font-medium">Random Forest-Inspired</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Training Data</div>
                      <div className="font-medium">1000+ Research Points</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-gray-600">R² Score</div>
                      <div className="font-medium text-green-600">{modelMetrics.r2Score}</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">RMSE</div>
                      <div className="font-medium text-blue-600">{modelMetrics.rmse} kg/m²</div>
                    </div>
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>About This Model</AlertTitle>
                    <AlertDescription>
                      <p className="mt-2 text-sm">
                        This yield prediction model is based on extensive horticultural research and 
                        incorporates complex interactions between environmental factors. The model uses:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Photosynthetic response curves</li>
                        <li>• Morphological development patterns</li>
                        <li>• Nutrient use efficiency models</li>
                        <li>• Stress response functions</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}