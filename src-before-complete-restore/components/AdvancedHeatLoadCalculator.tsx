'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Thermometer, Wind, Droplets, Zap, Sun, Snowflake, 
  Flame, Calculator, TrendingUp, Building, Leaf 
} from 'lucide-react';
import { advancedCalculations } from '@/lib/advanced-scientific-calculations';

interface RoomDimensions {
  length: number;
  width: number;
  height: number;
}

interface HeatLoadBreakdown {
  lighting: number;
  transpiration: number;
  envelope: number;
  ventilation: number;
  equipment?: number;
  people?: number;
  solar?: number;
}

export default function AdvancedHeatLoadCalculator() {
  const [totalPowerWatts, setTotalPowerWatts] = useState('5000');
  const [growAreaSqft, setGrowAreaSqft] = useState('1000');
  const [cropType, setCropType] = useState('cannabis');
  const [ppfd, setPPFD] = useState('800');
  const [roomDimensions, setRoomDimensions] = useState<RoomDimensions>({
    length: 40,
    width: 25,
    height: 12
  });
  const [outdoorTemp, setOutdoorTemp] = useState('85');
  const [indoorTemp, setIndoorTemp] = useState('75');
  const [heatLoadResult, setHeatLoadResult] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced parameters
  const [ledEfficiency, setLEDEfficiency] = useState('50');
  const [airChangesPerHour, setAirChangesPerHour] = useState('6');
  const [wallInsulation, setWallInsulation] = useState('0.10'); // U-value
  const [ceilingInsulation, setCeilingInsulation] = useState('0.05'); // U-value

  const calculateHeatLoad = () => {
    const result = advancedCalculations.calculateComprehensiveHeatLoad(
      parseFloat(totalPowerWatts),
      parseFloat(growAreaSqft),
      cropType,
      parseFloat(ppfd),
      [roomDimensions.length, roomDimensions.width, roomDimensions.height],
      parseFloat(outdoorTemp),
      parseFloat(indoorTemp)
    );
    setHeatLoadResult(result);
  };

  const getHeatLoadBreakdown = (): HeatLoadBreakdown | null => {
    if (!heatLoadResult) return null;
    
    return {
      lighting: heatLoadResult.lighting_heat_btu,
      transpiration: heatLoadResult.transpiration_load_btu,
      envelope: heatLoadResult.envelope_load_btu,
      ventilation: heatLoadResult.ventilation_load_btu
    };
  };

  const getHeatLoadPercentages = () => {
    const breakdown = getHeatLoadBreakdown();
    if (!breakdown || !heatLoadResult) return null;
    
    const total = heatLoadResult.total_cooling_btu / 1.2; // Remove safety factor
    
    return {
      lighting: (breakdown.lighting / total * 100).toFixed(1),
      transpiration: (breakdown.transpiration / total * 100).toFixed(1),
      envelope: (breakdown.envelope / total * 100).toFixed(1),
      ventilation: (breakdown.ventilation / total * 100).toFixed(1)
    };
  };

  const getRecommendations = () => {
    if (!heatLoadResult) return [];
    
    const recommendations = [];
    const percentages = getHeatLoadPercentages();
    
    if (percentages && parseFloat(percentages.lighting) > 60) {
      recommendations.push({
        type: 'warning',
        message: 'Lighting accounts for >60% of heat load. Consider remote drivers or more efficient fixtures.'
      });
    }
    
    if (heatLoadResult.cooling_tons_required > 10) {
      recommendations.push({
        type: 'info',
        message: 'Large cooling capacity required. Consider multiple units for redundancy.'
      });
    }
    
    if (percentages && parseFloat(percentages.transpiration) > 30) {
      recommendations.push({
        type: 'info',
        message: 'High transpiration load. Ensure proper dehumidification capacity.'
      });
    }
    
    const tempDiff = Math.abs(parseFloat(outdoorTemp) - parseFloat(indoorTemp));
    if (tempDiff > 30) {
      recommendations.push({
        type: 'warning',
        message: 'Large temperature differential. Improve insulation to reduce energy costs.'
      });
    }
    
    return recommendations;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-6 w-6" />
            Advanced HVAC Heat Load Calculator
          </CardTitle>
          <CardDescription>
            Physics-based heat load calculations for precise HVAC sizing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Inputs</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
              <TabsTrigger value="results">Results & Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="total-power">Total Lighting Power (Watts)</Label>
                    <Input
                      id="total-power"
                      type="number"
                      value={totalPowerWatts}
                      onChange={(e) => setTotalPowerWatts(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="grow-area">Grow Area (sq ft)</Label>
                    <Input
                      id="grow-area"
                      type="number"
                      value={growAreaSqft}
                      onChange={(e) => setGrowAreaSqft(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="crop-type">Crop Type</Label>
                    <Select value={cropType} onValueChange={setCropType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cannabis">Cannabis</SelectItem>
                        <SelectItem value="tomatoes">Tomatoes</SelectItem>
                        <SelectItem value="lettuce">Lettuce</SelectItem>
                        <SelectItem value="herbs">Herbs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="ppfd">Average PPFD (μmol/m²/s)</Label>
                    <Input
                      id="ppfd"
                      type="number"
                      value={ppfd}
                      onChange={(e) => setPPFD(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Room Dimensions (feet)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Input
                          type="number"
                          placeholder="Length"
                          value={roomDimensions.length}
                          onChange={(e) => setRoomDimensions(prev => ({ 
                            ...prev, 
                            length: parseFloat(e.target.value) || 0 
                          }))}
                        />
                        <span className="text-xs text-gray-500">Length</span>
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Width"
                          value={roomDimensions.width}
                          onChange={(e) => setRoomDimensions(prev => ({ 
                            ...prev, 
                            width: parseFloat(e.target.value) || 0 
                          }))}
                        />
                        <span className="text-xs text-gray-500">Width</span>
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Height"
                          value={roomDimensions.height}
                          onChange={(e) => setRoomDimensions(prev => ({ 
                            ...prev, 
                            height: parseFloat(e.target.value) || 0 
                          }))}
                        />
                        <span className="text-xs text-gray-500">Height</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="outdoor-temp">Outdoor Temp (°F)</Label>
                      <Input
                        id="outdoor-temp"
                        type="number"
                        value={outdoorTemp}
                        onChange={(e) => setOutdoorTemp(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="indoor-temp">Indoor Temp (°F)</Label>
                      <Input
                        id="indoor-temp"
                        type="number"
                        value={indoorTemp}
                        onChange={(e) => setIndoorTemp(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={calculateHeatLoad} className="w-full">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Heat Load
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Equipment Parameters</h3>
                  <div>
                    <Label htmlFor="led-efficiency">LED Efficiency (%)</Label>
                    <Input
                      id="led-efficiency"
                      type="number"
                      value={ledEfficiency}
                      onChange={(e) => setLEDEfficiency(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Typical: 40-55% for modern LEDs
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="ach">Air Changes per Hour</Label>
                    <Input
                      id="ach"
                      type="number"
                      value={airChangesPerHour}
                      onChange={(e) => setAirChangesPerHour(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 4-8 for grow rooms
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Building Envelope</h3>
                  <div>
                    <Label htmlFor="wall-u">Wall U-Value (BTU/hr·ft²·°F)</Label>
                    <Input
                      id="wall-u"
                      type="number"
                      step="0.01"
                      value={wallInsulation}
                      onChange={(e) => setWallInsulation(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower is better insulated (0.05-0.20)
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="ceiling-u">Ceiling U-Value (BTU/hr·ft²·°F)</Label>
                    <Input
                      id="ceiling-u"
                      type="number"
                      step="0.01"
                      value={ceilingInsulation}
                      onChange={(e) => setCeilingInsulation(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower is better insulated (0.03-0.10)
                    </p>
                  </div>
                </div>
              </div>
              
              <Alert>
                <Building className="h-4 w-4" />
                <AlertTitle>Advanced Settings</AlertTitle>
                <AlertDescription>
                  These parameters allow fine-tuning of heat load calculations based on specific 
                  building characteristics and equipment specifications.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="results" className="space-y-4">
              {heatLoadResult ? (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Snowflake className="h-5 w-5 text-blue-500" />
                          Cooling Required
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                          {heatLoadResult.cooling_tons_required.toFixed(1)} tons
                        </div>
                        <div className="text-sm text-gray-500">
                          {heatLoadResult.total_cooling_btu.toFixed(0).toLocaleString()} BTU/hr
                        </div>
                        <Badge variant="outline" className="mt-2">
                          {heatLoadResult.recommended_unit_size_tons} ton unit recommended
                        </Badge>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Thermometer className="h-5 w-5 text-orange-500" />
                          Sensible Heat
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {heatLoadResult.total_sensible_btu.toFixed(0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">BTU/hr</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Droplets className="h-5 w-5 text-cyan-500" />
                          Latent Heat
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {heatLoadResult.total_latent_btu.toFixed(0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">BTU/hr</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Heat Load Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {getHeatLoadBreakdown() && getHeatLoadPercentages() && (
                        <>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm flex items-center gap-2">
                                  <Zap className="h-4 w-4 text-yellow-500" />
                                  Lighting Heat
                                </span>
                                <span className="text-sm font-medium">
                                  {getHeatLoadBreakdown()!.lighting.toFixed(0).toLocaleString()} BTU/hr 
                                  ({getHeatLoadPercentages()!.lighting}%)
                                </span>
                              </div>
                              <Progress value={parseFloat(getHeatLoadPercentages()!.lighting)} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm flex items-center gap-2">
                                  <Leaf className="h-4 w-4 text-green-500" />
                                  Plant Transpiration
                                </span>
                                <span className="text-sm font-medium">
                                  {getHeatLoadBreakdown()!.transpiration.toFixed(0).toLocaleString()} BTU/hr 
                                  ({getHeatLoadPercentages()!.transpiration}%)
                                </span>
                              </div>
                              <Progress value={parseFloat(getHeatLoadPercentages()!.transpiration)} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm flex items-center gap-2">
                                  <Building className="h-4 w-4 text-gray-500" />
                                  Building Envelope
                                </span>
                                <span className="text-sm font-medium">
                                  {getHeatLoadBreakdown()!.envelope.toFixed(0).toLocaleString()} BTU/hr 
                                  ({getHeatLoadPercentages()!.envelope}%)
                                </span>
                              </div>
                              <Progress value={parseFloat(getHeatLoadPercentages()!.envelope)} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm flex items-center gap-2">
                                  <Wind className="h-4 w-4 text-blue-500" />
                                  Ventilation
                                </span>
                                <span className="text-sm font-medium">
                                  {getHeatLoadBreakdown()!.ventilation.toFixed(0).toLocaleString()} BTU/hr 
                                  ({getHeatLoadPercentages()!.ventilation}%)
                                </span>
                              </div>
                              <Progress value={parseFloat(getHeatLoadPercentages()!.ventilation)} className="h-2" />
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t">
                            <p className="text-sm text-gray-600">
                              * Includes 20% safety factor for equipment sizing
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  
                  {getRecommendations().length > 0 && (
                    <div className="space-y-3">
                      {getRecommendations().map((rec, index) => (
                        <Alert key={index} variant={rec.type === 'warning' ? 'destructive' : 'default'}>
                          <TrendingUp className="h-4 w-4" />
                          <AlertDescription>{rec.message}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Additional Considerations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Dehumidification: ~{(parseFloat(growAreaSqft) * 0.1).toFixed(0)} pints/day estimated</li>
                        <li>• Ensure proper air distribution to avoid hot spots</li>
                        <li>• Consider redundant units for critical operations</li>
                        <li>• Account for future expansion in equipment sizing</li>
                        <li>• Install monitoring systems for temperature and humidity</li>
                      </ul>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Alert>
                  <Calculator className="h-4 w-4" />
                  <AlertTitle>No Results Yet</AlertTitle>
                  <AlertDescription>
                    Enter your facility parameters and click Calculate Heat Load to see results.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}