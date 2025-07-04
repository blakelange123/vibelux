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
import { Slider } from '@/components/ui/slider';
import { 
  Brain, 
  Zap, 
  DollarSign, 
  Target,
  Play,
  Pause,
  RotateCcw,
  Download,
  TrendingUp,
  Settings,
  Lightbulb,
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import * as d3 from 'd3';
import { 
  GeneticLightingOptimizer, 
  OptimizationConstraints, 
  OptimizationObjectives, 
  FixtureTemplate,
  OptimizationProgress,
  OptimizationResult,
  Individual
} from '@/lib/genetic-optimization';
import { Surface } from '@/lib/monte-carlo-raytracing';

interface AIOptimizationPanelProps {
  roomDimensions: { width: number; length: number; height: number };
  surfaces?: Surface[];
  onOptimizationComplete?: (result: OptimizationResult) => void;
}

export function AIOptimizationPanel({ 
  roomDimensions, 
  surfaces = [], 
  onOptimizationComplete 
}: AIOptimizationPanelProps) {
  const chartRef = useRef<SVGSVGElement>(null);
  const [optimizer] = useState(() => new GeneticLightingOptimizer(roomDimensions, surfaces));
  
  // Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState<OptimizationProgress | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [convergenceData, setConvergenceData] = useState<number[]>([]);
  
  // Configuration state
  const [constraints, setConstraints] = useState<OptimizationConstraints>({
    maxFixtures: 12,
    minFixtures: 4,
    targetPPFD: 400,
    uniformityTarget: 0.8,
    energyBudget: 600, // Watts
    installationHeight: { min: 2.5, max: 4.0 },
    excludedZones: [],
    fixtureSpacing: { min: 1.5, max: 4.0 }
  });
  
  const [objectives, setObjectives] = useState<OptimizationObjectives>({
    uniformity: 0.3,
    energyEfficiency: 0.25,
    cost: 0.2,
    coverage: 0.2,
    maintenance: 0.05
  });
  
  const [algorithmSettings, setAlgorithmSettings] = useState({
    populationSize: 50,
    generations: 100,
    mutationRate: 0.1,
    crossoverRate: 0.8,
    elitismRate: 0.2,
    convergenceThreshold: 0.001
  });
  
  // Sample fixture templates
  const [fixtureTemplates] = useState<FixtureTemplate[]>([
    {
      id: 'led-panel-50w',
      name: 'LED Panel 50W',
      lumens: 5000,
      watts: 50,
      beamAngle: 120,
      fieldAngle: 140,
      cost: 150,
      dimensions: { width: 0.6, length: 0.6, height: 0.05 }
    },
    {
      id: 'led-highbay-100w',
      name: 'LED High Bay 100W',
      lumens: 13000,
      watts: 100,
      beamAngle: 90,
      fieldAngle: 110,
      cost: 250,
      dimensions: { width: 0.4, length: 0.4, height: 0.15 }
    },
    {
      id: 'led-strip-30w',
      name: 'LED Strip 30W/m',
      lumens: 3000,
      watts: 30,
      beamAngle: 150,
      fieldAngle: 180,
      cost: 80,
      dimensions: { width: 1.0, length: 0.05, height: 0.02 }
    },
    {
      id: 'led-spot-75w',
      name: 'LED Spotlight 75W',
      lumens: 8000,
      watts: 75,
      beamAngle: 60,
      fieldAngle: 80,
      cost: 200,
      dimensions: { width: 0.2, length: 0.2, height: 0.3 }
    }
  ]);
  
  // Start optimization
  const startOptimization = async () => {
    setIsOptimizing(true);
    setProgress(null);
    setResult(null);
    setConvergenceData([]);
    
    try {
      const optimizationResult = await optimizer.optimize(
        fixtureTemplates,
        constraints,
        objectives,
        algorithmSettings,
        (progressUpdate) => {
          setProgress(progressUpdate);
          setConvergenceData(prev => [...prev, progressUpdate.bestFitness]);
        }
      );
      
      setResult(optimizationResult);
      onOptimizationComplete?.(optimizationResult);
      
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };
  
  // Stop optimization
  const stopOptimization = () => {
    setIsOptimizing(false);
    // Note: In a real implementation, you'd need to implement cancellation
  };
  
  // Update constraint
  const updateConstraint = (key: keyof OptimizationConstraints, value: any) => {
    setConstraints(prev => ({ ...prev, [key]: value }));
  };
  
  // Update objective weight
  const updateObjective = (key: keyof OptimizationObjectives, value: number) => {
    setObjectives(prev => ({ ...prev, [key]: value / 100 }));
  };
  
  // Render convergence chart
  const renderConvergenceChart = () => {
    if (!chartRef.current || convergenceData.length === 0) return;
    
    const svg = d3.select(chartRef.current);
    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, convergenceData.length - 1])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain(d3.extent(convergenceData) as [number, number])
      .range([innerHeight, 0]);
    
    // Line generator
    const line = d3.line<number>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);
    
    // Add line
    g.append("path")
      .datum(convergenceData)
      .attr("d", line)
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2)
      .attr("fill", "none");
    
    // Add dots
    g.selectAll(".dot")
      .data(convergenceData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", (_, i) => xScale(i))
      .attr("cy", d => yScale(d))
      .attr("r", 3)
      .attr("fill", "#1D4ED8");
    
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `Gen ${d}`));
    
    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => d3.format(".3f")(d)));
    
    // Labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 35)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .text("Generation");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .text("Fitness Score");
  };
  
  // Update chart when convergence data changes
  useEffect(() => {
    renderConvergenceChart();
  }, [convergenceData]);
  
  // Calculate objective totals for validation
  const objectiveTotal = Object.values(objectives).reduce((sum, weight) => sum + weight, 0);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Fixture Optimization
          </span>
          <div className="flex items-center gap-2">
            {isOptimizing && (
              <Badge variant="secondary" className="animate-pulse">
                Optimizing...
              </Badge>
            )}
            {result && (
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Optimized
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Genetic algorithm optimization for optimal fixture placement and selection
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="constraints">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="constraints">Constraints</TabsTrigger>
            <TabsTrigger value="objectives">Objectives</TabsTrigger>
            <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="constraints" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Lighting Requirements
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label>Target PPFD (μmol/m²/s)</Label>
                    <Input
                      type="number"
                      value={constraints.targetPPFD}
                      onChange={(e) => updateConstraint('targetPPFD', Number(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label>Uniformity Target (0-1)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={constraints.uniformityTarget}
                      onChange={(e) => updateConstraint('uniformityTarget', Number(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label>Energy Budget (Watts)</Label>
                    <Input
                      type="number"
                      value={constraints.energyBudget}
                      onChange={(e) => updateConstraint('energyBudget', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Physical Constraints
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Min Fixtures</Label>
                      <Input
                        type="number"
                        value={constraints.minFixtures}
                        onChange={(e) => updateConstraint('minFixtures', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Max Fixtures</Label>
                      <Input
                        type="number"
                        value={constraints.maxFixtures}
                        onChange={(e) => updateConstraint('maxFixtures', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Min Height (m)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={constraints.installationHeight.min}
                        onChange={(e) => updateConstraint('installationHeight', {
                          ...constraints.installationHeight,
                          min: Number(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label>Max Height (m)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={constraints.installationHeight.max}
                        onChange={(e) => updateConstraint('installationHeight', {
                          ...constraints.installationHeight,
                          max: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Min Spacing (m)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={constraints.fixtureSpacing.min}
                        onChange={(e) => updateConstraint('fixtureSpacing', {
                          ...constraints.fixtureSpacing,
                          min: Number(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label>Max Spacing (m)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={constraints.fixtureSpacing.max}
                        onChange={(e) => updateConstraint('fixtureSpacing', {
                          ...constraints.fixtureSpacing,
                          max: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="objectives" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Optimization Objectives</h3>
                <Badge variant={Math.abs(objectiveTotal - 1) < 0.01 ? "default" : "destructive"}>
                  Total: {(objectiveTotal * 100).toFixed(0)}%
                </Badge>
              </div>
              
              {Math.abs(objectiveTotal - 1) >= 0.01 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Objective weights should sum to 100%. Current total: {(objectiveTotal * 100).toFixed(0)}%
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Uniformity Weight
                    </Label>
                    <span className="text-sm font-medium">{Math.round(objectives.uniformity * 100)}%</span>
                  </div>
                  <Slider
                    value={[objectives.uniformity * 100]}
                    onValueChange={([value]) => updateObjective('uniformity', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Energy Efficiency Weight
                    </Label>
                    <span className="text-sm font-medium">{Math.round(objectives.energyEfficiency * 100)}%</span>
                  </div>
                  <Slider
                    value={[objectives.energyEfficiency * 100]}
                    onValueChange={([value]) => updateObjective('energyEfficiency', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cost Efficiency Weight
                    </Label>
                    <span className="text-sm font-medium">{Math.round(objectives.cost * 100)}%</span>
                  </div>
                  <Slider
                    value={[objectives.cost * 100]}
                    onValueChange={([value]) => updateObjective('cost', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Coverage Weight
                    </Label>
                    <span className="text-sm font-medium">{Math.round(objectives.coverage * 100)}%</span>
                  </div>
                  <Slider
                    value={[objectives.coverage * 100]}
                    onValueChange={([value]) => updateObjective('coverage', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Maintenance Weight
                    </Label>
                    <span className="text-sm font-medium">{Math.round(objectives.maintenance * 100)}%</span>
                  </div>
                  <Slider
                    value={[objectives.maintenance * 100]}
                    onValueChange={([value]) => updateObjective('maintenance', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="algorithm" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Population Settings</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label>Population Size</Label>
                    <Input
                      type="number"
                      value={algorithmSettings.populationSize}
                      onChange={(e) => setAlgorithmSettings(prev => ({
                        ...prev,
                        populationSize: Number(e.target.value)
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Generations</Label>
                    <Input
                      type="number"
                      value={algorithmSettings.generations}
                      onChange={(e) => setAlgorithmSettings(prev => ({
                        ...prev,
                        generations: Number(e.target.value)
                      }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Evolution Parameters</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label>Mutation Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={algorithmSettings.mutationRate}
                      onChange={(e) => setAlgorithmSettings(prev => ({
                        ...prev,
                        mutationRate: Number(e.target.value)
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Crossover Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={algorithmSettings.crossoverRate}
                      onChange={(e) => setAlgorithmSettings(prev => ({
                        ...prev,
                        crossoverRate: Number(e.target.value)
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Elitism Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={algorithmSettings.elitismRate}
                      onChange={(e) => setAlgorithmSettings(prev => ({
                        ...prev,
                        elitismRate: Number(e.target.value)
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={startOptimization}
                disabled={isOptimizing || Math.abs(objectiveTotal - 1) >= 0.01}
                className="flex items-center gap-2"
              >
                {isOptimizing ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Optimization
                  </>
                )}
              </Button>
              
              {isOptimizing && (
                <Button variant="outline" onClick={stopOptimization}>
                  Stop
                </Button>
              )}
              
              <Button variant="outline" onClick={() => setResult(null)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            {progress && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Optimization Progress</h3>
                  <Badge variant="secondary">
                    Generation {progress.generation}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Best Fitness</div>
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {progress.bestFitness.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Avg Fitness</div>
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {progress.averageFitness.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Elapsed</div>
                    <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                      {Math.round(progress.elapsedTime / 1000)}s
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Remaining</div>
                    <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {Math.round(progress.estimatedTimeRemaining / 1000)}s
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round((progress.generation / algorithmSettings.generations) * 100)}%</span>
                  </div>
                  <Progress value={(progress.generation / algorithmSettings.generations) * 100} />
                </div>
              </div>
            )}
            
            {convergenceData.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Convergence Chart
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <svg ref={chartRef} width="500" height="300" className="w-full" />
                </div>
              </div>
            )}
            
            {result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Final Results</h3>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Fixtures</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {result.finalStats.totalFixtures}
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Wattage</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {result.finalStats.totalWattage}W
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Average PPFD</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {Math.round(result.finalStats.averagePPFD)}
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Uniformity Ratio</div>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {result.finalStats.uniformityRatio.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Energy Efficiency</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {Math.round(result.finalStats.energyEfficiency)} lm/W
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Coverage</div>
                    <div className="text-2xl font-bold">
                      {result.finalStats.coveragePercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Recommendations</h4>
                  {optimizer.getOptimizationRecommendations(result).map((rec, index) => (
                    <Alert key={index}>
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>{rec}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
            
            {!isOptimizing && !result && (
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Configure your constraints and objectives, then start the optimization to see results.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}