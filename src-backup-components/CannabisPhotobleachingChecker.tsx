'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle, Info, Zap, Leaf } from 'lucide-react';
import { advancedCalculations } from '@/lib/advanced-scientific-calculations';

interface SpectrumInput {
  blue: number;
  green: number;
  red: number;
  farRed: number;
}

export default function CannabisPhotobleachingChecker() {
  const [totalPPFD, setTotalPPFD] = useState('800');
  const [spectrum, setSpectrum] = useState<SpectrumInput>({
    blue: 150,
    green: 100,
    red: 500,
    farRed: 50
  });
  const [growthStage, setGrowthStage] = useState('flowering');
  const [co2Level, setCO2Level] = useState('400');
  const [vpd, setVPD] = useState('1.0');
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [phytochromeData, setPhytochromeData] = useState<any>(null);

  useEffect(() => {
    // Auto-calculate total PPFD from spectrum
    const total = Object.values(spectrum).reduce((sum, val) => sum + val, 0);
    setTotalPPFD(total.toString());
  }, [spectrum]);

  const calculateRisk = () => {
    const ppfd = parseFloat(totalPPFD);
    const redRatio = spectrum.red / ppfd;
    
    // Calculate photobleaching risk
    const risk = advancedCalculations.checkCannabisPhotobleachingRisk(
      'Cannabis - ' + growthStage,
      ppfd,
      redRatio,
      growthStage
    );
    setRiskAssessment(risk);
    
    // Calculate phytochrome photoequilibrium
    const phyto = advancedCalculations.calculatePhytochromePhotoequilibrium(
      spectrum.red,
      spectrum.farRed
    );
    setPhytochromeData(phyto);
  };

  const updateSpectrum = (color: keyof SpectrumInput, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSpectrum(prev => ({ ...prev, [color]: numValue }));
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'high': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSpectrumPercentages = () => {
    const total = parseFloat(totalPPFD) || 1;
    return {
      blue: (spectrum.blue / total * 100).toFixed(1),
      green: (spectrum.green / total * 100).toFixed(1),
      red: (spectrum.red / total * 100).toFixed(1),
      farRed: (spectrum.farRed / total * 100).toFixed(1)
    };
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-6 w-6" />
            Cannabis Photobleaching Risk Assessment
          </CardTitle>
          <CardDescription>
            Advanced analysis based on Rodriguez-Morrison et al. (2021) and Westmoreland et al. (2021)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="growth-stage">Growth Stage</Label>
                <Select value={growthStage} onValueChange={setGrowthStage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seedling">Seedling</SelectItem>
                    <SelectItem value="vegetative">Vegetative</SelectItem>
                    <SelectItem value="flowering">Flowering</SelectItem>
                    <SelectItem value="late-flowering">Late Flowering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label>Spectrum Composition (μmol/m²/s)</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="w-20 text-sm">Blue:</Label>
                    <Input
                      type="number"
                      value={spectrum.blue}
                      onChange={(e) => updateSpectrum('blue', e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-12">{getSpectrumPercentages().blue}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-20 text-sm">Green:</Label>
                    <Input
                      type="number"
                      value={spectrum.green}
                      onChange={(e) => updateSpectrum('green', e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-12">{getSpectrumPercentages().green}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-20 text-sm">Red:</Label>
                    <Input
                      type="number"
                      value={spectrum.red}
                      onChange={(e) => updateSpectrum('red', e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-12">{getSpectrumPercentages().red}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-20 text-sm">Far-Red:</Label>
                    <Input
                      type="number"
                      value={spectrum.farRed}
                      onChange={(e) => updateSpectrum('farRed', e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-12">{getSpectrumPercentages().farRed}%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="total-ppfd">Total PPFD (μmol/m²/s)</Label>
                <Input
                  id="total-ppfd"
                  type="number"
                  value={totalPPFD}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="co2">CO₂ Level (ppm)</Label>
                  <Input
                    id="co2"
                    type="number"
                    value={co2Level}
                    onChange={(e) => setCO2Level(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="vpd">VPD (kPa)</Label>
                  <Input
                    id="vpd"
                    type="number"
                    step="0.1"
                    value={vpd}
                    onChange={(e) => setVPD(e.target.value)}
                  />
                </div>
              </div>
              
              <Button onClick={calculateRisk} className="w-full">
                <Zap className="mr-2 h-4 w-4" />
                Analyze Photobleaching Risk
              </Button>
            </div>
            
            <div className="space-y-4">
              {riskAssessment && (
                <>
                  <Card className={getRiskColor(riskAssessment.risk_level)}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getRiskIcon(riskAssessment.risk_level)}
                        Risk Level: {riskAssessment.risk_level.toUpperCase()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Red Light PPFD</div>
                          <div className="font-semibold">{spectrum.red} μmol/m²/s</div>
                          <Progress 
                            value={spectrum.red / riskAssessment.safe_red_ppfd_max * 100} 
                            className="mt-1 h-2"
                          />
                        </div>
                        <div>
                          <div className="text-gray-600">Total PPFD</div>
                          <div className="font-semibold">{totalPPFD} μmol/m²/s</div>
                          <Progress 
                            value={parseFloat(totalPPFD) / riskAssessment.safe_total_ppfd_max * 100} 
                            className="mt-1 h-2"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="text-sm text-gray-600 mb-1">Safe Thresholds:</div>
                        <div className="flex gap-3 text-xs">
                          <Badge variant="outline">Red: &lt;{riskAssessment.safe_red_ppfd_max} μmol/m²/s</Badge>
                          <Badge variant="outline">Total: &lt;{riskAssessment.safe_total_ppfd_max} μmol/m²/s</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {riskAssessment.warnings.map((warning: any, index: number) => (
                    <Alert key={index} variant={warning.type === 'error' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{warning.title}</AlertTitle>
                      <AlertDescription>
                        <p className="mb-2">{warning.message}</p>
                        <p className="font-medium">{warning.recommendation}</p>
                        {warning.research && (
                          <p className="text-xs mt-2 text-gray-500">Source: {warning.research}</p>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                  
                  {phytochromeData && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Phytochrome Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Pfr/Pr Ratio</div>
                            <div className="font-semibold">{phytochromeData.pfr_pr_ratio.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">R:FR Ratio</div>
                            <div className="font-semibold">
                              {phytochromeData.red_far_red_ratio === Infinity 
                                ? '∞' 
                                : phytochromeData.red_far_red_ratio.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-900 mb-1">
                            Morphological Response:
                          </div>
                          <div className="text-sm text-blue-700">
                            {phytochromeData.morphological_response}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            Stem Elongation Index: {phytochromeData.stem_elongation_index.toFixed(1)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Environmental Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {parseFloat(co2Level) < 800 && parseFloat(totalPPFD) > 600 && (
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-600">•</span>
                            Consider increasing CO₂ to 800-1200 ppm for high light conditions
                          </li>
                        )}
                        {parseFloat(vpd) < 0.8 || parseFloat(vpd) > 1.2 && (
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-600">•</span>
                            Maintain VPD between 0.8-1.2 kPa for optimal transpiration
                          </li>
                        )}
                        {growthStage === 'flowering' && spectrum.red > 600 && (
                          <li className="flex items-start gap-2">
                            <span className="text-red-600">•</span>
                            Monitor top colas daily for signs of bleaching (white/yellow tips)
                          </li>
                        )}
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          Ensure adequate air circulation to prevent hot spots
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}