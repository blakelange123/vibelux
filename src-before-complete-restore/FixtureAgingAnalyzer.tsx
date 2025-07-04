'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  TrendingDown, Clock, DollarSign, AlertTriangle, 
  Calendar, Lightbulb, Calculator, BarChart3 
} from 'lucide-react';
import { fixtureAgingSimulator, type AgingSimulationResult } from '@/lib/fixture-aging-simulation';

export default function FixtureAgingAnalyzer() {
  const [fixtureType, setFixtureType] = useState('standard_led');
  const [operatingHours, setOperatingHours] = useState('16');
  const [temperature, setTemperature] = useState('30');
  const [humidity, setHumidity] = useState('60');
  const [simulationYears, setSimulationYears] = useState('10');
  const [simulationResult, setSimulationResult] = useState<AgingSimulationResult | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<any>(null);

  const fixtureTypes = [
    { value: 'high_quality_led', label: 'High Quality LED' },
    { value: 'standard_led', label: 'Standard LED' },
    { value: 'budget_led', label: 'Budget LED' },
    { value: 'hps', label: 'HPS' },
    { value: 'metal_halide', label: 'Metal Halide' },
    { value: 'fluorescent_t5', label: 'Fluorescent T5' }
  ];

  useEffect(() => {
    runSimulation();
  }, [fixtureType, operatingHours, temperature, humidity, simulationYears]);

  const runSimulation = () => {
    const result = fixtureAgingSimulator.simulateAgingCurve(
      fixtureType,
      parseFloat(operatingHours),
      parseFloat(temperature),
      parseFloat(humidity),
      parseFloat(simulationYears)
    );
    setSimulationResult(result);
    
    // Calculate cost analysis
    const costs = fixtureAgingSimulator.calculateLifetimeCosts(
      fixtureType,
      500, // Example fixture cost
      0.12, // Example electricity rate
      400, // Example wattage
      parseFloat(operatingHours),
      parseFloat(temperature),
      parseFloat(humidity)
    );
    setCostAnalysis(costs);
  };

  const getAccelerationColor = (factor: number) => {
    if (factor < 1.2) return 'text-green-600';
    if (factor < 1.5) return 'text-yellow-600';
    if (factor < 2.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatChartData = () => {
    if (!simulationResult) return [];
    
    // Sample every 6 months for cleaner chart
    const dataPoints: any[] = [];
    const interval = Math.floor(simulationResult.timeYears.length / 20);
    
    for (let i = 0; i < simulationResult.timeYears.length; i += interval) {
      dataPoints.push({
        years: simulationResult.timeYears[i].toFixed(1),
        lightOutput: simulationResult.lightOutputPercent[i].toFixed(1),
        l90: 90,
        l80: 80,
        l70: 70
      });
    }
    
    return dataPoints;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6" />
            Fixture Aging & Degradation Analysis
          </CardTitle>
          <CardDescription>
            Predict light output degradation and maintenance schedules based on LM-80 data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fixture-type">Fixture Type</Label>
                <Select value={fixtureType} onValueChange={setFixtureType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fixtureTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="operating-hours">Hours/Day</Label>
                  <Input
                    id="operating-hours"
                    type="number"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    min="1"
                    max="24"
                  />
                </div>
                <div>
                  <Label htmlFor="simulation-years">Years</Label>
                  <Input
                    id="simulation-years"
                    type="number"
                    value={simulationYears}
                    onChange={(e) => setSimulationYears(e.target.value)}
                    min="1"
                    max="20"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    min="10"
                    max="50"
                  />
                </div>
                <div>
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input
                    id="humidity"
                    type="number"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                    min="20"
                    max="80"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {simulationResult && (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Environmental Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Acceleration Factor</span>
                          <span className={`font-bold ${getAccelerationColor(simulationResult.accelerationFactor)}`}>
                            {simulationResult.accelerationFactor.toFixed(2)}x
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {simulationResult.accelerationFactor > 1.5 
                            ? 'High stress conditions - fixture will degrade faster'
                            : simulationResult.accelerationFactor > 1.2
                            ? 'Moderate stress - some acceleration expected'
                            : 'Good conditions - normal degradation rate'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Alert variant={simulationResult.accelerationFactor > 1.5 ? "destructive" : "default"}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Operating Conditions</AlertTitle>
                    <AlertDescription>
                      {parseFloat(temperature) > 35 && 'High temperature accelerates LED degradation. '}
                      {parseFloat(humidity) > 70 && 'High humidity may cause premature failure. '}
                      {parseFloat(operatingHours) > 18 && 'Extended operation reduces fixture lifetime. '}
                      {(parseFloat(temperature) <= 35 && parseFloat(humidity) <= 70 && parseFloat(operatingHours) <= 18) && 
                        'Operating conditions are within recommended range.'}
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>
          </div>

          <Tabs defaultValue="degradation" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="degradation">Degradation Curve</TabsTrigger>
              <TabsTrigger value="milestones">Maintenance Milestones</TabsTrigger>
              <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="degradation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Light Output Degradation</CardTitle>
                  <CardDescription>
                    Predicted light output over fixture lifetime
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={formatChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="years" 
                        label={{ value: 'Years', position: 'insideBottom', offset: -5 }} 
                      />
                      <YAxis 
                        label={{ value: 'Light Output (%)', angle: -90, position: 'insideLeft' }} 
                        domain={[60, 100]}
                      />
                      <Tooltip />
                      <Legend />
                      
                      <Line 
                        type="monotone" 
                        dataKey="lightOutput" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Light Output"
                        dot={false}
                      />
                      
                      <Line 
                        type="monotone" 
                        dataKey="l90" 
                        stroke="#10b981" 
                        strokeDasharray="5 5"
                        name="L90 Threshold"
                        dot={false}
                      />
                      
                      <Line 
                        type="monotone" 
                        dataKey="l80" 
                        stroke="#f59e0b" 
                        strokeDasharray="5 5"
                        name="L80 Threshold"
                        dot={false}
                      />
                      
                      <Line 
                        type="monotone" 
                        dataKey="l70" 
                        stroke="#ef4444" 
                        strokeDasharray="5 5"
                        name="L70 Threshold"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="milestones" className="space-y-4">
              {simulationResult && (
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">L90</Badge>
                        90% Output
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {simulationResult.milestones.l90.years.toFixed(1)} years
                        </div>
                        <div className="text-sm text-gray-600">
                          {simulationResult.milestones.l90.hours.toFixed(0).toLocaleString()} hours
                        </div>
                        <p className="text-xs text-gray-500">
                          {simulationResult.milestones.l90.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800">L80</Badge>
                        80% Output
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {simulationResult.milestones.l80.years.toFixed(1)} years
                        </div>
                        <div className="text-sm text-gray-600">
                          {simulationResult.milestones.l80.hours.toFixed(0).toLocaleString()} hours
                        </div>
                        <p className="text-xs text-gray-500">
                          {simulationResult.milestones.l80.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">L70</Badge>
                        70% Output
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {simulationResult.milestones.l70.years.toFixed(1)} years
                        </div>
                        <div className="text-sm text-gray-600">
                          {simulationResult.milestones.l70.hours.toFixed(0).toLocaleString()} hours
                        </div>
                        <p className="text-xs text-gray-500">
                          {simulationResult.milestones.l70.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertTitle>Maintenance Planning</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Schedule PPFD measurements at L90 to verify output</li>
                    <li>• Plan budget for replacement at L80</li>
                    <li>• Replace fixtures by L70 to maintain crop quality</li>
                    <li>• Consider group replacement to maintain uniformity</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="costs" className="space-y-4">
              {costAnalysis && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Total Cost of Ownership
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Initial Cost</span>
                            <span className="font-medium">${costAnalysis.costs.initial}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Energy Cost</span>
                            <span className="font-medium">${costAnalysis.costs.energy.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Maintenance</span>
                            <span className="font-medium">${costAnalysis.costs.maintenance.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Replacement</span>
                            <span className="font-medium">${costAnalysis.costs.replacement}</span>
                          </div>
                          <div className="pt-2 border-t flex justify-between">
                            <span className="font-medium">Total</span>
                            <span className="font-bold text-lg">${costAnalysis.costs.total.toFixed(0)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          Annual Costs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Energy/Year</span>
                            <span className="font-medium">${costAnalysis.annualCosts.energy.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Maintenance/Year</span>
                            <span className="font-medium">${costAnalysis.annualCosts.maintenance.toFixed(0)}</span>
                          </div>
                          <div className="pt-2 border-t">
                            <div className="flex justify-between">
                              <span className="font-medium">Total Annual Cost</span>
                              <span className="font-bold">${costAnalysis.annualCosts.total.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between mt-2">
                              <span className="text-sm text-gray-600">Cost per Hour</span>
                              <span className="text-sm font-medium">${costAnalysis.metrics.costPerHour.toFixed(3)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Alert>
                    <BarChart3 className="h-4 w-4" />
                    <AlertTitle>Cost Optimization Tips</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Higher quality fixtures have lower total cost despite higher initial price</li>
                        <li>• Improving environmental conditions can extend fixture life by 20-40%</li>
                        <li>• Group replacement reduces labor costs vs individual replacement</li>
                        <li>• Consider efficiency upgrades when energy costs exceed 60% of total</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}