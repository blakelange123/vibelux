'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sun, Zap, DollarSign, TrendingUp, Flower2, AlertCircle } from 'lucide-react';
import { LightRequirementCalculator, PlantLoadData } from '@/lib/light-requirement-calculator';

export default function LightRequirementCalculatorComponent() {
  const [plantData, setPlantData] = useState<PlantLoadData>({
    developmentStage: 'vegetative',
    numberOfTrusses: 0,
    plantsPerM2: 3.0,
    currentDLI: 20,
    naturalLightHours: 8,
    electricityCost: 0.12
  });

  const [results, setResults] = useState<any>(null);
  const [cropCycleData, setCropCycleData] = useState<any[]>([]);
  const [showCropCycle, setShowCropCycle] = useState(false);

  useEffect(() => {
    const calcResults = LightRequirementCalculator.calculate(plantData);
    setResults(calcResults);

    // Generate crop cycle data
    if (showCropCycle) {
      const cycleData = LightRequirementCalculator.calculateCropCycle(new Date(), 40);
      setCropCycleData(cycleData);
    }
  }, [plantData, showCropCycle]);

  const handleInputChange = (field: keyof PlantLoadData, value: any) => {
    setPlantData(prev => ({
      ...prev,
      [field]: field === 'developmentStage' ? value : parseFloat(value) || 0
    }));
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'propagation': return '🌱';
      case 'vegetative': return '🌿';
      case 'flowering': return '🌸';
      case 'fruiting': return '🍅';
      case 'mature': return '🌾';
      default: return '🌱';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-yellow-500" />
            Light Requirement Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="stage">Development Stage</Label>
              <Select value={plantData.developmentStage} onValueChange={(value) => handleInputChange('developmentStage', value)}>
                <SelectTrigger id="stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="propagation">🌱 Propagation</SelectItem>
                  <SelectItem value="vegetative">🌿 Vegetative</SelectItem>
                  <SelectItem value="flowering">🌸 Flowering</SelectItem>
                  <SelectItem value="fruiting">🍅 Fruiting</SelectItem>
                  <SelectItem value="mature">🌾 Mature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="trusses">Number of Trusses</Label>
              <Input
                id="trusses"
                type="number"
                value={plantData.numberOfTrusses}
                onChange={(e) => handleInputChange('numberOfTrusses', e.target.value)}
                min="0"
                max="20"
                disabled={plantData.developmentStage === 'propagation' || plantData.developmentStage === 'vegetative'}
              />
            </div>
            <div>
              <Label htmlFor="density">Plants per m²</Label>
              <Input
                id="density"
                type="number"
                value={plantData.plantsPerM2}
                onChange={(e) => handleInputChange('plantsPerM2', e.target.value)}
                step="0.5"
                min="1"
                max="5"
              />
            </div>
            <div>
              <Label htmlFor="currentDLI">Current DLI (mol/m²/day)</Label>
              <Input
                id="currentDLI"
                type="number"
                value={plantData.currentDLI}
                onChange={(e) => handleInputChange('currentDLI', e.target.value)}
                step="1"
                min="0"
                max="60"
              />
            </div>
            <div>
              <Label htmlFor="naturalLight">Natural Light Hours</Label>
              <Input
                id="naturalLight"
                type="number"
                value={plantData.naturalLightHours}
                onChange={(e) => handleInputChange('naturalLightHours', e.target.value)}
                step="0.5"
                min="0"
                max="16"
              />
            </div>
            <div>
              <Label htmlFor="electricityCost">Electricity Cost ($/kWh)</Label>
              <Input
                id="electricityCost"
                type="number"
                value={plantData.electricityCost}
                onChange={(e) => handleInputChange('electricityCost', e.target.value)}
                step="0.01"
                min="0"
                max="1"
              />
            </div>
          </div>

          {results && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Sun className="h-5 w-5 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">J/cm²/day</span>
                    </div>
                    <div className="text-2xl font-bold">{results.dailyLightRequirement}</div>
                    <p className="text-sm text-muted-foreground">Daily Requirement</p>
                    <Progress 
                      value={(plantData.currentDLI / LightRequirementCalculator.convertJToDLI(results.dailyLightRequirement)) * 100} 
                      className="mt-2"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="h-5 w-5 text-blue-500" />
                      <span className="text-xs text-muted-foreground">μmol/m²/s</span>
                    </div>
                    <div className="text-2xl font-bold">{Math.round(results.hourlyPAR)}</div>
                    <p className="text-sm text-muted-foreground">Required PAR</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Flower2 className="h-5 w-5 text-purple-500" />
                      <span className="text-xs text-muted-foreground">hours/day</span>
                    </div>
                    <div className="text-2xl font-bold">{results.supplementalLightNeeded.toFixed(1)}</div>
                    <p className="text-sm text-muted-foreground">Supplemental Light</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <span className="text-xs text-muted-foreground">$/m²/day</span>
                    </div>
                    <div className="text-2xl font-bold">${results.energyCost.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground">Energy Cost</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {results.recommendations.map((rec: string, index: number) => (
                  <Alert key={index}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Light Requirements by Stage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['propagation', 'vegetative', 'flowering', 'fruiting', 'mature'].map(stage => {
                        const baseReq = LightRequirementCalculator.getBaseRequirement(stage as any);
                        const trussReq = stage === 'fruiting' ? LightRequirementCalculator.calculateTrussLightRequirement(10, plantData.plantsPerM2) : 0;
                        const total = baseReq + trussReq;
                        
                        return (
                          <div key={stage} className="flex items-center gap-3">
                            <span className="text-2xl">{getStageIcon(stage)}</span>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium capitalize">{stage}</span>
                                <span className="text-sm text-muted-foreground">{total} J/cm²/day</span>
                              </div>
                              <Progress value={(total / 600) * 100} className="h-2" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={() => setShowCropCycle(!showCropCycle)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {showCropCycle ? 'Hide' : 'Show'} Full Crop Cycle Analysis
                </button>
              </div>

              {showCropCycle && cropCycleData.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">40-Week Crop Cycle Light Requirements</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={cropCycleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="week" 
                        label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        yAxisId="left"
                        label={{ value: 'Light Requirement (J/cm²/day)', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'Number of Trusses', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded shadow">
                                <p className="font-semibold">Week {data.week}</p>
                                <p className="text-sm">Stage: {data.stage}</p>
                                <p className="text-sm">Light: {data.lightRequirement} J/cm²/day</p>
                                <p className="text-sm">DLI: {data.dli.toFixed(1)} mol/m²/day</p>
                                <p className="text-sm">Trusses: {data.trusses}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="lightRequirement" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Light Requirement"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="trusses" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Trusses"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}