'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, AlertTriangle, CheckCircle, Info, TrendingDown, 
  TrendingUp, Grid, Zap, MapPin, Gauge 
} from 'lucide-react';
import { 
  uniformityAnalyzer, 
  type UniformityMetrics, 
  type HotSpotAnalysis,
  type DeficiencyZones,
  type SpatialDistribution,
  type UniformityRecommendation
} from '@/lib/uniformity-analysis';

interface AdvancedUniformityAnalyzerProps {
  ppfdGrid: number[][];
  cropType: string;
  roomDimensions?: { width: number; length: number };
}

export default function AdvancedUniformityAnalyzer({ 
  ppfdGrid, 
  cropType,
  roomDimensions 
}: AdvancedUniformityAnalyzerProps) {
  const [uniformityMetrics, setUniformityMetrics] = useState<UniformityMetrics | null>(null);
  const [hotSpots, setHotSpots] = useState<HotSpotAnalysis | null>(null);
  const [deficiencyZones, setDeficiencyZones] = useState<DeficiencyZones | null>(null);
  const [spatialDistribution, setSpatialDistribution] = useState<SpatialDistribution | null>(null);
  const [recommendations, setRecommendations] = useState<UniformityRecommendation[]>([]);
  const [severityScore, setSeverityScore] = useState<number>(0);

  useEffect(() => {
    if (ppfdGrid && ppfdGrid.length > 0) {
      analyzeUniformity();
    }
  }, [ppfdGrid, cropType]);

  const analyzeUniformity = () => {
    // Run all analyses
    const metrics = uniformityAnalyzer.analyzeUniformity(ppfdGrid);
    const hotSpotData = uniformityAnalyzer.detectHotSpots(ppfdGrid, cropType);
    const deficiencyData = uniformityAnalyzer.identifyDeficiencyZones(ppfdGrid, cropType);
    const spatialData = uniformityAnalyzer.analyzeSpatialDistribution(ppfdGrid);
    
    // Generate recommendations
    const recs = uniformityAnalyzer.generateRecommendations(
      metrics,
      deficiencyData,
      hotSpotData,
      spatialData
    );
    
    // Calculate severity score
    const score = uniformityAnalyzer.calculateSeverityScore(
      metrics,
      deficiencyData,
      hotSpotData
    );
    
    // Update state
    setUniformityMetrics(metrics);
    setHotSpots(hotSpotData);
    setDeficiencyZones(deficiencyData);
    setSpatialDistribution(spatialData);
    setRecommendations(recs);
    setSeverityScore(score);
  };

  const getScoreColor = (score: number) => {
    if (score < 20) return 'text-green-600';
    if (score < 40) return 'text-yellow-600';
    if (score < 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'acceptable': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'unacceptable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info': return <Info className="h-5 w-5 text-blue-600" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!uniformityMetrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No PPFD data available for analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Uniformity Analysis Overview
            </span>
            <Badge className={getGradeColor(uniformityMetrics.uniformityGrade)}>
              {uniformityMetrics.uniformityGrade.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of light distribution and uniformity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Gauge className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{(uniformityMetrics.iesUniformity * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-600">IES Uniformity</div>
              <div className="text-xs text-gray-500 mt-1">Min/Avg Ratio</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Activity className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{uniformityMetrics.coefficientOfVariation.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Coefficient of Variation</div>
              <div className="text-xs text-gray-500 mt-1">Lower is better</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Zap className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${getScoreColor(severityScore)}`}>
                {severityScore.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Issue Severity Score</div>
              <div className="text-xs text-gray-500 mt-1">0-100 (lower is better)</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Min/Max Ratio</span>
              <div className="flex items-center gap-2">
                <Progress value={uniformityMetrics.minMaxRatio * 100} className="w-32 h-2" />
                <span className="text-sm font-medium w-12 text-right">
                  {(uniformityMetrics.minMaxRatio * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CV Uniformity</span>
              <div className="flex items-center gap-2">
                <Progress value={uniformityMetrics.cvUniformity * 100} className="w-32 h-2" />
                <span className="text-sm font-medium w-12 text-right">
                  {(uniformityMetrics.cvUniformity * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="zones" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="zones">Problem Zones</TabsTrigger>
          <TabsTrigger value="spatial">Spatial Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="heatmap">Visual Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="zones" className="space-y-4">
          {/* Deficiency Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                Deficiency Zones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Severe Deficiency</span>
                    <Badge variant="destructive">
                      {deficiencyZones?.severeDeficiency.areaPercent.toFixed(1)}% of area
                    </Badge>
                  </div>
                  {deficiencyZones?.severeDeficiency?.areaPercent && deficiencyZones.severeDeficiency.areaPercent > 0 && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Min PPFD: {deficiencyZones.severeDeficiency.minPPFDInZone?.toFixed(0)} μmol/m²/s</p>
                      <p>Locations: {deficiencyZones.severeDeficiency.locations.length} points</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Moderate Deficiency</span>
                    <Badge variant="outline">
                      {deficiencyZones?.moderateDeficiency.areaPercent.toFixed(1)}% of area
                    </Badge>
                  </div>
                  {deficiencyZones?.moderateDeficiency?.areaPercent && deficiencyZones.moderateDeficiency.areaPercent > 0 && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Mean PPFD: {deficiencyZones.moderateDeficiency.meanPPFDInZone?.toFixed(0)} μmol/m²/s</p>
                      <p>Locations: {deficiencyZones.moderateDeficiency.locations.length} points</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hot Spots */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-red-500" />
                Hot Spots Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Severe Excess ({'>'}20% over max)</span>
                    <Badge variant={hotSpots?.severeExcess?.areaPercent && hotSpots.severeExcess.areaPercent > 0 ? "destructive" : "secondary"}>
                      {hotSpots?.severeExcess?.areaPercent?.toFixed(1) || '0.0'}% of area
                    </Badge>
                  </div>
                  {hotSpots?.severeExcess?.areaPercent && hotSpots.severeExcess.areaPercent > 0 && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Max PPFD: {hotSpots.severeExcess.maxPPFDInZone?.toFixed(0)} μmol/m²/s</p>
                      <p>Locations: {hotSpots.severeExcess.locations.length} points</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Moderate Excess</span>
                    <Badge variant="outline">
                      {hotSpots?.moderateExcess?.areaPercent?.toFixed(1) || '0.0'}% of area
                    </Badge>
                  </div>
                  {hotSpots?.moderateExcess?.areaPercent && hotSpots.moderateExcess.areaPercent > 0 && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Mean PPFD: {hotSpots.moderateExcess.meanPPFDInZone?.toFixed(0)} μmol/m²/s</p>
                      <p>Locations: {hotSpots.moderateExcess.locations.length} points</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="spatial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Grid className="h-5 w-5" />
                Spatial Distribution Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Edge Effects */}
                <div>
                  <h4 className="font-medium mb-3">Edge Effects</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-semibold">
                        {spatialDistribution?.edgeEffects.meanEdgePPFD.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-600">Edge PPFD</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-semibold">
                        {spatialDistribution?.edgeEffects.meanCenterPPFD.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-600">Center PPFD</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-semibold">
                        {((spatialDistribution?.edgeEffects.edgeToCenterRatio || 0) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-600">Edge/Center Ratio</div>
                    </div>
                  </div>
                </div>

                {/* Center Zone Analysis */}
                <div>
                  <h4 className="font-medium mb-3">Center Zone (60% of area)</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-semibold">
                        {spatialDistribution?.centerUniformity.centerMeanPPFD.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-600">Mean PPFD</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-semibold">
                        {((spatialDistribution?.centerUniformity.centerUniformity || 0) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-600">Uniformity</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-semibold">
                        {spatialDistribution?.centerUniformity.centerCV.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">CV</div>
                    </div>
                  </div>
                </div>

                {/* Gradient Analysis */}
                <div>
                  <h4 className="font-medium mb-3">Gradient Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maximum Gradient</span>
                      <span className="font-medium">
                        {spatialDistribution?.gradientAnalysis.maxGradient.toFixed(1)} μmol/m²/s per unit
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mean Gradient</span>
                      <span className="font-medium">
                        {spatialDistribution?.gradientAnalysis.meanGradient.toFixed(1)} μmol/m²/s per unit
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gradient Hotspots</span>
                      <span className="font-medium">
                        {spatialDistribution?.gradientAnalysis.gradientHotspots} locations
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-3">
          {recommendations.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>No Issues Found</AlertTitle>
              <AlertDescription>
                Your lighting uniformity meets all requirements.
              </AlertDescription>
            </Alert>
          ) : (
            recommendations.map((rec, index) => (
              <Alert key={index} variant={rec.type === 'critical' ? 'destructive' : 'default'}>
                {getRecommendationIcon(rec.type)}
                <AlertTitle>{rec.message}</AlertTitle>
                <AlertDescription>
                  <p className="mt-2">{rec.action}</p>
                  <Badge variant="outline" className="mt-2">{rec.category}</Badge>
                </AlertDescription>
              </Alert>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visual Problem Areas</CardTitle>
              <CardDescription>
                Heatmap visualization of uniformity issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* Deficiency Visualization */}
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">Deficiency Zones</h4>
                  <div className="text-sm text-orange-700">
                    <p>🔴 Severe: {deficiencyZones?.severeDeficiency.locations.length || 0} points</p>
                    <p>🟡 Moderate: {deficiencyZones?.moderateDeficiency.locations.length || 0} points</p>
                  </div>
                </div>
                
                {/* Hot Spot Visualization */}
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Hot Spots</h4>
                  <div className="text-sm text-red-700">
                    <p>🔥 Severe: {hotSpots?.severeExcess.locations.length || 0} points</p>
                    <p>⚡ Moderate: {hotSpots?.moderateExcess.locations.length || 0} points</p>
                  </div>
                </div>
              </div>
              
              <Alert className="mt-4">
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Problem areas have been identified. Adjust fixture placement or power settings 
                  in these zones to improve uniformity.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}