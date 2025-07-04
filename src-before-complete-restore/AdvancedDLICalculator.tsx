'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun, CloudRain, Mountain, Calendar, MapPin, AlertTriangle, Info } from 'lucide-react';
import { advancedCalculations } from '@/lib/advanced-scientific-calculations';
// import { getSolarRadiationData } from '@/lib/solar-radiation-data';

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  elevation?: number;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const commonLocations: LocationData[] = [
  { latitude: 39.7392, longitude: -104.9903, city: 'Denver', state: 'CO', elevation: 1609 },
  { latitude: 33.4484, longitude: -112.0740, city: 'Phoenix', state: 'AZ', elevation: 331 },
  { latitude: 47.6062, longitude: -122.3321, city: 'Seattle', state: 'WA', elevation: 56 },
  { latitude: 25.7617, longitude: -80.1918, city: 'Miami', state: 'FL', elevation: 2 },
  { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', state: 'IL', elevation: 181 },
  { latitude: 40.7128, longitude: -74.0060, city: 'New York', state: 'NY', elevation: 10 },
];

export default function AdvancedDLICalculator() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [customLatitude, setCustomLatitude] = useState('');
  const [customLongitude, setCustomLongitude] = useState('');
  const [customElevation, setCustomElevation] = useState('0');
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [advancedDLI, setAdvancedDLI] = useState<number | null>(null);
  const [nrelDLI, setNrelDLI] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);

  const calculateDLI = async () => {
    setIsCalculating(true);
    
    const lat = selectedLocation?.latitude || parseFloat(customLatitude);
    const lon = selectedLocation?.longitude || parseFloat(customLongitude);
    const elevation = selectedLocation?.elevation || parseFloat(customElevation) || 0;
    
    if (isNaN(lat) || isNaN(lon)) {
      alert('Please enter valid latitude and longitude');
      setIsCalculating(false);
      return;
    }
    
    // Calculate using advanced atmospheric model
    const advancedResult = advancedCalculations.calculateResearchBasedDLI(
      lat, lon, selectedMonth, elevation
    );
    setAdvancedDLI(advancedResult);
    
    // Get NREL data for comparison if available
    try {
      // const nrelData = getSolarRadiationData(lat, lon);
      const monthIndex = months.indexOf(selectedMonth);
      // if (nrelData && nrelData.monthly[monthIndex]) {
      //   setNrelDLI(nrelData.monthly[monthIndex]);
      //   setComparisonMode(true);
      // }
    } catch (error) {
      // NREL data not available for this location
      setComparisonMode(false);
    }
    
    setIsCalculating(false);
  };

  const getDLIDifference = () => {
    if (!advancedDLI || !nrelDLI) return 0;
    return ((advancedDLI - nrelDLI) / nrelDLI * 100).toFixed(1);
  };

  const getSeasonalTrend = () => {
    if (!selectedLocation && (!customLatitude || !customLongitude)) return null;
    
    const lat = selectedLocation?.latitude || parseFloat(customLatitude);
    const lon = selectedLocation?.longitude || parseFloat(customLongitude);
    const elevation = selectedLocation?.elevation || parseFloat(customElevation) || 0;
    
    return months.map(month => ({
      month,
      dli: advancedCalculations.calculateResearchBasedDLI(lat, lon, month, elevation)
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-6 w-6" />
            Advanced DLI Calculator
          </CardTitle>
          <CardDescription>
            Calculate Daily Light Integral using advanced atmospheric modeling with Bird & Hulstrom clear sky model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calculator" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
              <TabsTrigger value="seasonal">Seasonal Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculator" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location">Select Location</Label>
                    <Select onValueChange={(value: string) => {
                      const location = commonLocations.find(l => `${l.city}, ${l.state}` === value);
                      setSelectedLocation(location || null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a city or enter custom coordinates" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonLocations.map((loc) => (
                          <SelectItem key={`${loc.city}-${loc.state}`} value={`${loc.city}, ${loc.state}`}>
                            {loc.city}, {loc.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Custom Coordinates</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          type="number"
                          placeholder="Latitude"
                          value={customLatitude}
                          onChange={(e) => setCustomLatitude(e.target.value)}
                          disabled={!!selectedLocation}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Longitude"
                          value={customLongitude}
                          onChange={(e) => setCustomLongitude(e.target.value)}
                          disabled={!!selectedLocation}
                        />
                      </div>
                    </div>
                    <Input
                      type="number"
                      placeholder="Elevation (meters)"
                      value={customElevation}
                      onChange={(e) => setCustomElevation(e.target.value)}
                      disabled={!!selectedLocation}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="month">Month</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={calculateDLI} 
                    disabled={isCalculating || (!selectedLocation && (!customLatitude || !customLongitude))}
                    className="w-full"
                  >
                    {isCalculating ? 'Calculating...' : 'Calculate DLI'}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {advancedDLI !== null && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Results</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center p-6 bg-green-50 rounded-lg">
                          <div className="text-4xl font-bold text-green-600">
                            {advancedDLI.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            mol/m²/day
                          </div>
                        </div>
                        
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>Model Features</AlertTitle>
                          <AlertDescription>
                            <ul className="text-sm space-y-1 mt-2">
                              <li>• Solar declination and Earth-Sun distance corrections</li>
                              <li>• Atmospheric transmission modeling</li>
                              <li>• Elevation-based Rayleigh scattering adjustment</li>
                              <li>• Regional climate factors</li>
                              <li>• Seasonal cloud cover patterns</li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                        
                        {selectedLocation?.elevation && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mountain className="h-4 w-4" />
                            Elevation: {selectedLocation.elevation}m ({(selectedLocation.elevation * 3.28084).toFixed(0)}ft)
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-4">
              {comparisonMode && advancedDLI !== null && nrelDLI !== null ? (
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Advanced Model</CardTitle>
                      <CardDescription>Bird & Hulstrom Clear Sky</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {advancedDLI.toFixed(1)} mol/m²/day
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">NREL Database</CardTitle>
                      <CardDescription>30-year Average</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-600">
                        {nrelDLI.toFixed(1)} mol/m²/day
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Difference</CardTitle>
                      <CardDescription>Model vs NREL</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${parseFloat(String(getDLIDifference())) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {getDLIDifference()}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Calculate DLI First</AlertTitle>
                  <AlertDescription>
                    Run a calculation to see model comparisons when NREL data is available.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="seasonal" className="space-y-4">
              {(selectedLocation || (customLatitude && customLongitude)) ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Annual DLI Pattern</CardTitle>
                      <CardDescription>
                        Monthly DLI predictions using advanced atmospheric modeling
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {getSeasonalTrend()?.map(({ month, dli }) => (
                          <div key={month} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600">{month.slice(0, 3)}</div>
                            <div className="text-lg font-bold text-gray-900">{dli.toFixed(1)}</div>
                            <div className="text-xs text-gray-500">mol/m²/day</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Seasonal Insights</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Peak DLI typically occurs in June-July</li>
                          <li>• Minimum DLI in December-January</li>
                          <li>• Consider supplemental lighting during low DLI months</li>
                          <li>• Account for actual cloud cover in your region</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertTitle>Select Location</AlertTitle>
                  <AlertDescription>
                    Choose a location or enter coordinates to see seasonal DLI patterns.
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