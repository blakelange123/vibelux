"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dna, 
  Atom, 
  FlaskConical, 
  Microscope,
  Brain,
  TrendingUp,
  Zap,
  Shield,
  Download,
  Settings,
  PlayCircle,
  PauseCircle,
  RotateCcw
} from 'lucide-react';
import { 
  select, 
  scaleBand, 
  scaleLinear, 
  axisBottom, 
  axisLeft, 
  line, 
  extent,
  max,
  min
} from 'd3';
import { 
  GeneExpressionPredictor,
  GeneExpressionPrediction,
  MetabolicImpact,
  MicrobiomeResponse,
  OptimizationResult,
  LightingCondition,
  SpectrumProfile,
  EnvironmentalContext
} from '@/lib/biotechnology/gene-expression-predictor';
import { 
  QuantumOptimizationEngine,
  QuantumOptimizationProblem,
  QuantumVariable,
  QuantumConstraint,
  QuantumObjective,
  QuantumOptimizationResult
} from '@/lib/quantum/quantum-optimization-engine';

interface BiotechnologyOptimizationPanelProps {
  onOptimizationComplete?: (result: OptimizationResult) => void;
}

export function BiotechnologyOptimizationPanel({ onOptimizationComplete }: BiotechnologyOptimizationPanelProps) {
  const geneExpressionChartRef = useRef<SVGSVGElement>(null);
  const metaboliteChartRef = useRef<SVGSVGElement>(null);
  const quantumVisualizationRef = useRef<SVGSVGElement>(null);
  
  const [predictor] = useState(() => new GeneExpressionPredictor());
  const [quantumEngine] = useState(() => new QuantumOptimizationEngine(20));
  
  // Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [useQuantumOptimization, setUseQuantumOptimization] = useState(true);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [currentResult, setCurrentResult] = useState<OptimizationResult | null>(null);
  const [quantumResult, setQuantumResult] = useState<QuantumOptimizationResult | null>(null);
  
  // Configuration
  const [cropSpecies, setCropSpecies] = useState('Lactuca sativa'); // Lettuce
  const [targetObjective, setTargetObjective] = useState<'yield' | 'quality' | 'metabolites' | 'energy'>('metabolites');
  const [targetMetabolites, setTargetMetabolites] = useState<string[]>(['anthocyanins', 'chlorophyll', 'carotenoids']);
  
  // Environmental context
  const [environmentalContext, setEnvironmentalContext] = useState<EnvironmentalContext>({
    temperature: 22,
    humidity: 65,
    co2: 800,
    nutrients: { N: 150, P: 50, K: 200, Ca: 100, Mg: 50 },
    soilPH: 6.2,
    developmentalStage: 'vegetative'
  });
  
  // Current lighting condition
  const [currentLighting, setCurrentLighting] = useState<LightingCondition>({
    spectrumProfile: {
      wavelength380_400: 2,  // UV
      wavelength400_450: 20, // Blue
      wavelength450_500: 15, // Blue-Green
      wavelength500_550: 10, // Green
      wavelength550_600: 8,  // Yellow-Green
      wavelength600_650: 15, // Orange-Red
      wavelength650_700: 25, // Red
      wavelength700_750: 4,  // Far Red
      wavelength750_800: 1   // Near IR
    },
    intensity: 300,
    photoperiod: 16,
    dailyLightIntegral: 17.28,
    temporalVariation: {
      dawnDuration: 30,
      duskDuration: 30,
      midDayFluctuation: 5,
      circadianModulation: true
    }
  });

  // Run optimization
  const runOptimization = async () => {
    if (isOptimizing) return;
    
    setIsOptimizing(true);
    setOptimizationProgress(0);
    
    try {
      console.log('Starting biotechnology optimization...');
      
      if (useQuantumOptimization) {
        setOptimizationProgress(10);
        await runQuantumOptimization();
      } else {
        setOptimizationProgress(10);
        await runClassicalOptimization();
      }
      
      setOptimizationProgress(100);
      
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const runQuantumOptimization = async () => {
    console.log('Running quantum-enhanced biotechnology optimization...');
    
    // Define quantum optimization problem
    const quantumProblem: QuantumOptimizationProblem = {
      variables: [
        {
          id: 'red_ratio',
          name: 'Red Light Ratio',
          type: 'spectrum',
          range: [10, 40],
          currentValue: currentLighting.spectrumProfile.wavelength650_700,
          quantumEncoding: 4
        },
        {
          id: 'blue_ratio',
          name: 'Blue Light Ratio',
          type: 'spectrum',
          range: [10, 30],
          currentValue: currentLighting.spectrumProfile.wavelength400_450,
          quantumEncoding: 4
        },
        {
          id: 'far_red_ratio',
          name: 'Far Red Ratio',
          type: 'spectrum',
          range: [2, 10],
          currentValue: currentLighting.spectrumProfile.wavelength700_750,
          quantumEncoding: 3
        },
        {
          id: 'uv_ratio',
          name: 'UV Ratio',
          type: 'spectrum',
          range: [0, 8],
          currentValue: currentLighting.spectrumProfile.wavelength380_400,
          quantumEncoding: 3
        }
      ],
      constraints: [
        {
          type: 'equality',
          variables: ['red_ratio', 'blue_ratio', 'far_red_ratio', 'uv_ratio'],
          coefficients: [1, 1, 1, 1],
          bound: 100,
          penalty: 1000
        }
      ],
      objectiveFunction: {
        type: 'maximize',
        components: [
          {
            name: 'metabolite_production',
            function: 'quality',
            target: 1.0,
            importance: 0.6
          },
          {
            name: 'energy_efficiency',
            function: 'energy_efficiency',
            target: 0.8,
            importance: 0.4
          }
        ],
        weights: [0.6, 0.4]
      },
      maxIterations: 50,
      convergenceThreshold: 0.001
    };
    
    setOptimizationProgress(30);
    
    // Run quantum optimization
    const quantumResult = await quantumEngine.optimizeCultivationParameters(quantumProblem);
    setQuantumResult(quantumResult);
    
    setOptimizationProgress(60);
    
    // Apply quantum-optimized spectrum to gene expression prediction
    const optimizedSpectrum: SpectrumProfile = {
      ...currentLighting.spectrumProfile,
      wavelength650_700: quantumResult.optimalValues.red_ratio || currentLighting.spectrumProfile.wavelength650_700,
      wavelength400_450: quantumResult.optimalValues.blue_ratio || currentLighting.spectrumProfile.wavelength400_450,
      wavelength700_750: quantumResult.optimalValues.far_red_ratio || currentLighting.spectrumProfile.wavelength700_750,
      wavelength380_400: quantumResult.optimalValues.uv_ratio || currentLighting.spectrumProfile.wavelength380_400
    };
    
    const optimizedLighting: LightingCondition = {
      ...currentLighting,
      spectrumProfile: optimizedSpectrum
    };
    
    setOptimizationProgress(80);
    
    // Predict gene expression with optimized spectrum
    const geneExpressions = await predictor.predictGeneExpression(
      cropSpecies,
      currentLighting,
      optimizedLighting,
      environmentalContext
    );
    
    // Create optimization result
    const result: OptimizationResult = {
      optimalSpectrum: optimizedSpectrum,
      predictedOutcomes: {
        geneExpression: geneExpressions,
        metabolites: [],
        microbiome: []
      },
      qualityMetrics: {
        overallQuality: quantumResult.objectiveValue,
        nutritionalValue: 0.8,
        bioactiveCompounds: 0.75,
        marketValue: 1200
      },
      confidence: quantumResult.fidelity,
      experimentalValidation: []
    };
    
    setCurrentResult(result);
    onOptimizationComplete?.(result);
    
    // Update visualizations
    updateGeneExpressionChart(geneExpressions);
    updateQuantumVisualization(quantumResult);
  };

  const runClassicalOptimization = async () => {
    console.log('Running classical biotechnology optimization...');
    
    setOptimizationProgress(30);
    
    // Run classical optimization
    const result = await predictor.optimizeForMetabolites(
      targetMetabolites,
      cropSpecies,
      {
        baseSpectrum: currentLighting.spectrumProfile,
        intensity: currentLighting.intensity,
        photoperiod: currentLighting.photoperiod,
        temporalVariation: currentLighting.temporalVariation,
        currentLighting: currentLighting,
        objectives: { metabolites: 1.0 }
      },
      environmentalContext
    );
    
    setOptimizationProgress(80);
    setCurrentResult(result);
    onOptimizationComplete?.(result);
    
    // Update visualizations
    updateGeneExpressionChart(result.predictedOutcomes.geneExpression);
    updateMetaboliteChart(result.predictedOutcomes.metabolites);
  };

  const updateGeneExpressionChart = (predictions: GeneExpressionPrediction[]) => {
    if (!geneExpressionChartRef.current) return;
    
    const svg = select(geneExpressionChartRef.current);
    svg.selectAll("*").remove();
    
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const data = predictions.slice(0, 10); // Show top 10 genes
    
    const x = scaleBand()
      .domain(data.map(d => d.geneId))
      .range([0, width])
      .padding(0.1);
    
    const y = scaleLinear()
      .domain([0, max(data, d => d.foldChange) || 1])
      .range([height, 0]);
    
    // Add bars
    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.geneId) || 0)
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.foldChange))
      .attr("height", d => height - y(d.foldChange))
      .attr("fill", "#3b82f6");
    
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(axisBottom(x));
    
    g.append("g")
      .call(axisLeft(y));
  };

  const updateMetaboliteChart = (metabolites: MetabolicImpact[]) => {
    if (!metaboliteChartRef.current) return;
    
    const svg = select(metaboliteChartRef.current);
    svg.selectAll("*").remove();
    
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const data = metabolites.slice(0, 8);
    
    const x = scaleBand()
      .domain(data.map(d => d.metaboliteId))
      .range([0, width])
      .padding(0.1);
    
    const y = scaleLinear()
      .domain([min(data, d => d.concentrationChange) || 0, max(data, d => d.concentrationChange) || 1])
      .range([height, 0]);
    
    // Add bars
    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.metaboliteId) || 0)
      .attr("width", x.bandwidth())
      .attr("y", d => y(Math.max(0, d.concentrationChange)))
      .attr("height", d => Math.abs(height - y(d.concentrationChange) - (height - y(0))))
      .attr("fill", d => d.concentrationChange > 0 ? "#10b981" : "#ef4444");
    
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(axisBottom(x));
    
    g.append("g")
      .call(axisLeft(y));
  };

  const updateQuantumVisualization = (result: QuantumOptimizationResult) => {
    if (!quantumVisualizationRef.current) return;
    
    const svg = select(quantumVisualizationRef.current);
    svg.selectAll("*").remove();
    
    const width = 400;
    const height = 300;
    
    // Create quantum circuit visualization
    const g = svg.append("g");
    
    // Draw convergence history
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const chart = g.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const x = scaleLinear()
      .domain([0, result.convergenceHistory.length - 1])
      .range([0, chartWidth]);
    
    const y = scaleLinear()
      .domain(extent(result.convergenceHistory) as [number, number])
      .range([chartHeight, 0]);
    
    const line = line<number>()
      .x((d, i) => x(i))
      .y(d => y(d));
    
    chart.append("path")
      .datum(result.convergenceHistory)
      .attr("fill", "none")
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Add axes
    chart.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(axisBottom(x));
    
    chart.append("g")
      .call(axisLeft(y));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-5 w-5" />
            Biotechnology Optimization Panel
          </CardTitle>
          <CardDescription>
            Advanced gene expression prediction and metabolomics optimization with quantum enhancement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="crop-species">Crop Species</Label>
                  <Select value={cropSpecies} onValueChange={setCropSpecies}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lactuca sativa">Lettuce (Lactuca sativa)</SelectItem>
                      <SelectItem value="Lycopersicon esculentum">Tomato</SelectItem>
                      <SelectItem value="Cucumis sativus">Cucumber</SelectItem>
                      <SelectItem value="Fragaria ananassa">Strawberry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="target-objective">Optimization Target</Label>
                  <Select value={targetObjective} onValueChange={(value: any) => setTargetObjective(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metabolites">Secondary Metabolites</SelectItem>
                      <SelectItem value="yield">Biomass Yield</SelectItem>
                      <SelectItem value="quality">Nutritional Quality</SelectItem>
                      <SelectItem value="energy">Energy Efficiency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="quantum-optimization"
                    checked={useQuantumOptimization}
                    onChange={(e) => setUseQuantumOptimization(e.target.checked)}
                  />
                  <Label htmlFor="quantum-optimization" className="flex items-center gap-1">
                    <Atom className="h-3 w-3" />
                    Quantum Enhancement
                  </Label>
                </div>

                <Button 
                  onClick={runOptimization} 
                  disabled={isOptimizing}
                  className="w-full"
                >
                  {isOptimizing ? (
                    <>
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Optimization
                    </>
                  )}
                </Button>

                {isOptimizing && (
                  <div className="space-y-2">
                    <Progress value={optimizationProgress} />
                    <p className="text-sm text-muted-foreground">
                      Progress: {optimizationProgress}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Optimization Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Overall Quality</Label>
                        <div className="text-2xl font-bold text-green-600">
                          {(currentResult.qualityMetrics.overallQuality * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <Label>Confidence</Label>
                        <div className="text-2xl font-bold text-blue-600">
                          {(currentResult.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <Label>Market Value</Label>
                        <div className="text-2xl font-bold text-purple-600">
                          ${currentResult.qualityMetrics.marketValue}
                        </div>
                      </div>
                      <div>
                        <Label>Bioactive Compounds</Label>
                        <div className="text-2xl font-bold text-orange-600">
                          {(currentResult.qualityMetrics.bioactiveCompounds * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {quantumResult && (
                      <Alert>
                        <Atom className="h-4 w-4" />
                        <AlertDescription>
                          Quantum advantage: {quantumResult.quantumAdvantage.toFixed(2)}x speedup
                          <br />
                          Entanglement utilization: {(quantumResult.entanglementUtilization * 100).toFixed(1)}%
                          <br />
                          Converged in {quantumResult.iterationsUsed} iterations
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Run optimization to see results
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Environmental Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Environmental Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={environmentalContext.temperature}
                    onChange={(e) => setEnvironmentalContext({
                      ...environmentalContext,
                      temperature: Number(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input
                    id="humidity"
                    type="number"
                    value={environmentalContext.humidity}
                    onChange={(e) => setEnvironmentalContext({
                      ...environmentalContext,
                      humidity: Number(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="co2">CO₂ (ppm)</Label>
                  <Input
                    id="co2"
                    type="number"
                    value={environmentalContext.co2}
                    onChange={(e) => setEnvironmentalContext({
                      ...environmentalContext,
                      co2: Number(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="soil-ph">Soil pH</Label>
                  <Input
                    id="soil-ph"
                    type="number"
                    step="0.1"
                    value={environmentalContext.soilPH}
                    onChange={(e) => setEnvironmentalContext({
                      ...environmentalContext,
                      soilPH: Number(e.target.value)
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visualization Tabs */}
          <Tabs defaultValue="gene-expression" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gene-expression" className="flex items-center gap-2">
                <Dna className="h-4 w-4" />
                Gene Expression
              </TabsTrigger>
              <TabsTrigger value="metabolites" className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                Metabolites
              </TabsTrigger>
              <TabsTrigger value="quantum" className="flex items-center gap-2">
                <Atom className="h-4 w-4" />
                Quantum Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gene-expression">
              <Card>
                <CardHeader>
                  <CardTitle>Gene Expression Predictions</CardTitle>
                  <CardDescription>
                    Predicted fold changes in key photomorphogenic genes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <svg
                    ref={geneExpressionChartRef}
                    width={400}
                    height={300}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metabolites">
              <Card>
                <CardHeader>
                  <CardTitle>Metabolite Concentration Changes</CardTitle>
                  <CardDescription>
                    Predicted changes in secondary metabolite production
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <svg
                    ref={metaboliteChartRef}
                    width={400}
                    height={300}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quantum">
              <Card>
                <CardHeader>
                  <CardTitle>Quantum Optimization Analysis</CardTitle>
                  <CardDescription>
                    Convergence history and quantum metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <svg
                    ref={quantumVisualizationRef}
                    width={400}
                    height={300}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}