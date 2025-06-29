'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, Wind, AlertCircle, CheckCircle } from 'lucide-react';
import { AdvancedVPDCalculator, GreenhouseClimateData } from '@/lib/vpd-advanced-calculator';
import { PollinationSuccessAnalyzer, PollinationEnvironment } from '@/lib/pollination-success-analyzer';

export default function VPDAdvancedCalculator() {
  const [climateData, setClimateData] = useState<GreenhouseClimateData>({
    temperature: 24,
    relativeHumidity: 65,
    co2Level: 800,
    lightIntensity: 400
  });

  const [results, setResults] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [targetRH, setTargetRH] = useState<number>(0);
  const [pollinationData, setPollinationData] = useState<any>(null);
  const [airMovement, setAirMovement] = useState<number>(0.2);
  const [showTomatoMode, setShowTomatoMode] = useState<boolean>(true);

  useEffect(() => {
    // Calculate results
    const calcResults = AdvancedVPDCalculator.calculate(climateData);
    setResults(calcResults);

    // Calculate target RH for optimal HD
    const target = AdvancedVPDCalculator.getTargetRH(climateData.temperature);
    setTargetRH(target);

    // Calculate tomato pollination success if enabled
    if (showTomatoMode) {
      const pollinationEnv: PollinationEnvironment = {
        temperature: climateData.temperature,
        humidity: climateData.relativeHumidity,
        airMovement: airMovement,
        co2Level: climateData.co2Level,
        lightLevel: climateData.lightIntensity,
        timeOfDay: new Date().getHours(),
        plantEnergyBalance: 'balanced' // Default, could be made configurable
      };
      
      const pollinationResults = PollinationSuccessAnalyzer.assessPollinationSuccess(pollinationEnv);
      setPollinationData(pollinationResults);
    }

    // Generate chart data for temperature vs optimal RH
    const data = [];
    for (let temp = 18; temp <= 32; temp += 1) {
      const optimalRH = AdvancedVPDCalculator.getTargetRH(temp);
      const vpd = AdvancedVPDCalculator.calculateVPD(temp, optimalRH);
      data.push({
        temperature: temp,
        optimalRH: parseFloat(optimalRH.toFixed(1)),
        optimalVPD: parseFloat(vpd.toFixed(2)),
        currentRH: climateData.relativeHumidity
      });
    }
    setChartData(data);
  }, [climateData, airMovement, showTomatoMode]);

  const handleInputChange = (field: keyof GreenhouseClimateData, value: string) => {
    setClimateData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-6 w-6 text-blue-500" />
            Advanced VPD & Humidity Deficit Calculator
            {showTomatoMode && <span className="text-green-600 text-sm font-normal">🍅 with Tomato Pollination Analysis</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                value={climateData.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
                step="0.1"
                min="10"
                max="40"
              />
            </div>
            <div>
              <Label htmlFor="humidity">Relative Humidity (%)</Label>
              <Input
                id="humidity"
                type="number"
                value={climateData.relativeHumidity}
                onChange={(e) => handleInputChange('relativeHumidity', e.target.value)}
                step="1"
                min="20"
                max="95"
              />
            </div>
            <div>
              <Label htmlFor="co2">CO₂ Level (ppm)</Label>
              <Input
                id="co2"
                type="number"
                value={climateData.co2Level}
                onChange={(e) => handleInputChange('co2Level', e.target.value)}
                step="50"
                min="400"
                max="2000"
              />
            </div>
            <div>
              <Label htmlFor="light">Light Intensity (μmol/m²/s)</Label>
              <Input
                id="light"
                type="number"
                value={climateData.lightIntensity}
                onChange={(e) => handleInputChange('lightIntensity', e.target.value)}
                step="50"
                min="0"
                max="1500"
              />
            </div>
            
            {/* Tomato Mode Toggle and Air Movement Input */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-green-50 rounded-lg border">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="tomatoMode"
                  checked={showTomatoMode}
                  onChange={(e) => setShowTomatoMode(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <Label htmlFor="tomatoMode" className="text-sm font-medium text-green-800">
                  🍅 Tomato Pollination Analysis
                </Label>
              </div>
              
              {showTomatoMode && (
                <div>
                  <Label htmlFor="airMovement">Air Movement (m/s)</Label>
                  <Input
                    id="airMovement"
                    type="number"
                    value={airMovement}
                    onChange={(e) => setAirMovement(parseFloat(e.target.value))}
                    step="0.05"
                    min="0"
                    max="1"
                    className="border-green-300 focus:border-green-500"
                  />
                </div>
              )}
            </div>
          </div>

          {results && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className={results.isOptimal ? 'border-green-500' : 'border-orange-500'}>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{results.vpd.toFixed(2)} kPa</div>
                    <p className="text-sm text-muted-foreground">VPD</p>
                  </CardContent>
                </Card>
                <Card className={results.humidityDeficit >= 3 && results.humidityDeficit <= 7 ? 'border-green-500' : 'border-orange-500'}>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{results.humidityDeficit.toFixed(1)} g/m³</div>
                    <p className="text-sm text-muted-foreground">Humidity Deficit</p>
                    <p className="text-xs text-muted-foreground">Target: 5 g/m³</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{results.dewPoint.toFixed(1)} °C</div>
                    <p className="text-sm text-muted-foreground">Dew Point</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{targetRH.toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">Target RH</p>
                    <p className="text-xs text-muted-foreground">For optimal HD</p>
                  </CardContent>
                </Card>
              </div>

              <Alert className={results.isOptimal ? 'border-green-500' : 'border-orange-500'}>
                <div className="flex items-start gap-2">
                  {results.isOptimal ? 
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> : 
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  }
                  <AlertDescription>
                    <strong>Climate Assessment:</strong> {results.recommendation}
                  </AlertDescription>
                </div>
              </Alert>

              {/* Tomato Pollination Results */}
              {showTomatoMode && pollinationData && (
                <div className="mt-6">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        🍅 Tomato Pollination Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Card className={`${pollinationData.successProbability >= 85 ? 'border-green-500 bg-green-50' : 
                          pollinationData.successProbability >= 70 ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'}`}>
                          <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-center">
                              {pollinationData.successProbability.toFixed(0)}%
                            </div>
                            <p className="text-sm text-center text-muted-foreground">Success Probability</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-lg font-bold text-center capitalize">
                              {pollinationData.qualityPrediction}
                            </div>
                            <p className="text-sm text-center text-muted-foreground">Fruit Quality</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-lg font-bold text-center">
                              {pollinationData.environmentalScore.overall}/100
                            </div>
                            <p className="text-sm text-center text-muted-foreground">Environmental Score</p>
                          </CardContent>
                        </Card>
                      </div>

                      {pollinationData.limitingFactors.length > 0 && (
                        <Alert className="mb-4 border-orange-300 bg-orange-50">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <AlertDescription>
                            <div className="font-medium text-orange-800 mb-2">Limiting Factors:</div>
                            <ul className="space-y-1 text-sm text-orange-700">
                              {pollinationData.limitingFactors.map((factor: string, index: number) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-orange-600">•</span>
                                  {factor}
                                </li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {pollinationData.optimizationRecommendations.length > 0 && (
                        <Alert className="border-blue-300 bg-blue-50">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription>
                            <div className="font-medium text-blue-800 mb-2">Optimization Recommendations:</div>
                            <ul className="space-y-1 text-sm text-blue-700">
                              {pollinationData.optimizationRecommendations.slice(0, 4).map((rec: string, index: number) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-blue-600">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Temperature vs Optimal RH for HD Target (5 g/m³)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="temperature" label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Relative Humidity (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="optimalRH" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="Optimal RH for HD=5" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="currentRH" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Current RH" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Semi-Closed Greenhouse Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Wind className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span>8-9 air exchanges/hour maintains optimal HD</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Droplets className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span>Better humidity control vs. conventional systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>CO₂ enrichment feasible at current settings</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">24-Hour Climate Strategy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Day Temperature:</span>
                        <span className="font-medium">{(climateData.temperature + 2).toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Night Temperature:</span>
                        <span className="font-medium">{(climateData.temperature - 2).toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pre-night Treatment:</span>
                        <span className="font-medium">{(climateData.temperature + 1).toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target HD (24h):</span>
                        <span className="font-medium">5 g/m³</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}