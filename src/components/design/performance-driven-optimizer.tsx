'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  Zap, 
  DollarSign, 
  Target,
  Clock,
  Lightbulb,
  Settings,
  Layout,
  ThermometerSun,
  Bot,
  Workflow,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Sparkles,
  Rocket
} from 'lucide-react';
import { toast } from 'sonner';
import { Line, Bar, Radar } from 'react-chartjs-2';

interface PerformanceDrivenOptimizerProps {
  facilityId: string;
  benchmarkData?: any;
}

export function PerformanceDrivenOptimizer({ facilityId, benchmarkData }: PerformanceDrivenOptimizerProps) {
  const [optimization, setOptimization] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [constraints, setConstraints] = useState({
    maxInvestment: 100000,
    maxPaybackMonths: 24,
    difficultyLevel: 'easy_medium',
    excludeCategories: [] as string[],
  });
  const [goals, setGoals] = useState({
    primaryGoal: 'yield',
  });
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (benchmarkData) {
      generateOptimization();
    }
  }, [benchmarkData, facilityId]);

  const generateOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/design/optimize-from-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId,
          performanceGoals: goals,
          constraints,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setOptimization(result);
        toast.success('Performance analysis complete!');
      } else {
        const error = await response.json();
        if (error.action === 'generate_benchmark') {
          toast.error('Generate a benchmark report first to enable optimization');
        } else {
          toast.error(error.message || 'Failed to generate optimization');
        }
      }
    } catch (error) {
      toast.error('Error generating optimization');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConstraintChange = (key: string, value: any) => {
    setConstraints(prev => ({ ...prev, [key]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setConstraints(prev => ({
      ...prev,
      excludeCategories: prev.excludeCategories.includes(category)
        ? prev.excludeCategories.filter(c => c !== category)
        : [...prev.excludeCategories, category],
    }));
  };

  const handleRecommendationToggle = (id: string) => {
    setSelectedRecommendations(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const categoryIcons = {
    lighting: <Lightbulb className="h-5 w-5" />,
    layout: <Layout className="h-5 w-5" />,
    environment: <ThermometerSun className="h-5 w-5" />,
    automation: <Bot className="h-5 w-5" />,
    workflow: <Workflow className="h-5 w-5" />,
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  const priorityColors = {
    low: 'border-gray-300',
    medium: 'border-yellow-400',
    high: 'border-orange-500',
    critical: 'border-red-600',
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Analyzing Performance Data</h3>
          <p className="text-gray-600">
            Comparing your metrics to industry benchmarks and generating optimization recommendations...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!optimization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Performance-Driven Design Optimization
          </CardTitle>
          <CardDescription>
            Analyze your benchmark data to identify facility design improvements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Constraints Configuration */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Optimization Constraints</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Maximum Investment</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[constraints.maxInvestment]}
                    onValueChange={([value]) => handleConstraintChange('maxInvestment', value)}
                    min={10000}
                    max={500000}
                    step={10000}
                    className="flex-1"
                  />
                  <span className="w-20 text-sm">${constraints.maxInvestment.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <Label>Maximum Payback Period</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[constraints.maxPaybackMonths]}
                    onValueChange={([value]) => handleConstraintChange('maxPaybackMonths', value)}
                    min={3}
                    max={60}
                    step={3}
                    className="flex-1"
                  />
                  <span className="w-16 text-sm">{constraints.maxPaybackMonths} months</span>
                </div>
              </div>
            </div>

            <div>
              <Label>Implementation Difficulty</Label>
              <Select value={constraints.difficultyLevel} onValueChange={(value) => handleConstraintChange('difficultyLevel', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy_only">Easy implementations only</SelectItem>
                  <SelectItem value="easy_medium">Easy to medium difficulty</SelectItem>
                  <SelectItem value="all">All difficulty levels</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Primary Goal</Label>
              <Select value={goals.primaryGoal} onValueChange={(value) => setGoals({ ...goals, primaryGoal: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yield">Maximize Yield</SelectItem>
                  <SelectItem value="efficiency">Improve Energy Efficiency</SelectItem>
                  <SelectItem value="quality">Enhance Quality</SelectItem>
                  <SelectItem value="cost">Reduce Operating Costs</SelectItem>
                  <SelectItem value="roi">Optimize ROI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Exclude Categories</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['lighting', 'layout', 'environment', 'automation', 'workflow'].map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={!constraints.excludeCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label htmlFor={category} className="capitalize cursor-pointer">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={generateOptimization} className="w-full" size="lg">
            <Rocket className="mr-2 h-5 w-5" />
            Generate Optimization Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <Badge variant="outline">ROI</Badge>
            </div>
            <h3 className="text-2xl font-bold text-green-600">
              {(optimization.optimization.predictedImpact.netROI * 100).toFixed(0)}%
            </h3>
            <p className="text-sm text-gray-600 mt-1">Expected ROI</p>
            <p className="text-xs text-gray-500">
              ${optimization.optimization.predictedImpact.revenueIncrease.toLocaleString()} revenue increase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
              <Badge variant="outline">Payback</Badge>
            </div>
            <h3 className="text-2xl font-bold text-blue-600">
              {Math.round(optimization.optimization.predictedImpact.paybackPeriod)} months
            </h3>
            <p className="text-sm text-gray-600 mt-1">Payback Period</p>
            <p className="text-xs text-gray-500">
              ${optimization.optimization.predictedImpact.investmentRequired.toLocaleString()} total investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-purple-600" />
              <Badge variant="outline">Yield</Badge>
            </div>
            <h3 className="text-2xl font-bold text-purple-600">
              +{optimization.optimization.predictedImpact.totalYieldIncrease.toFixed(1)}%
            </h3>
            <p className="text-sm text-gray-600 mt-1">Yield Increase</p>
            <p className="text-xs text-gray-500">
              {optimization.metadata.totalRecommendations} recommendations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Messages */}
      {optimization.insights && optimization.insights.length > 0 && (
        <div className="space-y-2">
          {optimization.insights.map((insight: any, index: number) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              insight.type === 'success' ? 'bg-green-50 border-green-500' :
              insight.type === 'opportunity' ? 'bg-blue-50 border-blue-500' :
              'bg-gray-50 border-gray-500'
            }`}>
              <div className="flex items-start space-x-3">
                {insight.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" /> :
                 insight.type === 'opportunity' ? <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" /> :
                 <AlertTriangle className="h-5 w-5 text-gray-600 mt-0.5" />}
                <div>
                  <h4 className="font-semibold">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="performance">Performance Impact</TabsTrigger>
          <TabsTrigger value="implementation">Implementation Plan</TabsTrigger>
          <TabsTrigger value="comparison">Before vs After</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {optimization.optimization.optimizations.length} Optimization Recommendations
            </h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Select All</Button>
              <Button size="sm">
                Implement Selected ({selectedRecommendations.length})
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {optimization.optimization.optimizations.map((rec: any, index: number) => (
              <Card key={index} className={`border-2 ${priorityColors[rec.priority]} transition-all hover:shadow-md`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedRecommendations.includes(rec.type)}
                        onCheckedChange={() => handleRecommendationToggle(rec.type)}
                      />
                      <div className="p-2 bg-purple-100 rounded-lg">
                        {categoryIcons[rec.category as keyof typeof categoryIcons]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{rec.description}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rec.reasoning}</p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Badge className={difficultyColors[rec.difficulty as keyof typeof difficultyColors]}>
                        {rec.difficulty}
                      </Badge>
                      <Badge variant="outline">{rec.priority} priority</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">
                        {(rec.expectedROI * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-600">ROI</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">
                        ${rec.investmentRequired.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Investment</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">
                        {rec.paybackMonths} mo
                      </p>
                      <p className="text-xs text-gray-600">Payback</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">
                        {(rec.confidence * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-600">Confidence</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium">Performance Impact:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(rec.performanceImpact).map(([metric, value]: [string, any]) => (
                        <div key={metric} className="flex items-center space-x-2">
                          <span className="text-sm capitalize">{metric}:</span>
                          <span className={`text-sm font-medium ${
                            value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {value > 0 ? '+' : ''}{value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium mb-2">Implementation Steps:</h5>
                    <div className="text-sm text-gray-600">
                      <p><strong>Timeframe:</strong> {rec.implementation.timeframe}</p>
                      <p><strong>Resources:</strong> {rec.implementation.resources.join(', ')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Impact Analysis</CardTitle>
              <CardDescription>
                Projected improvements across key metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceImpactChart 
                current={optimization.optimization.currentPerformance}
                target={optimization.optimization.targetPerformance}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Roadmap</CardTitle>
              <CardDescription>
                Phased approach to maximize impact while minimizing disruption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {optimization.optimization.implementationPlan.map((phase: any, index: number) => (
                  <div key={index} className="relative">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        {phase.phase}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold">{phase.title}</h4>
                        <p className="text-gray-600 mb-2">{phase.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Duration:</span> {phase.duration}
                          </div>
                          <div>
                            <span className="font-medium">Cost:</span> ${phase.cost.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Expected Impact:</span> {phase.expectedImpact.toFixed(1)}x ROI
                          </div>
                        </div>

                        {phase.dependencies.length > 0 && (
                          <div className="mt-2">
                            <span className="font-medium text-sm">Dependencies:</span>
                            <span className="text-sm text-gray-600"> {phase.dependencies.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {index < optimization.optimization.implementationPlan.length - 1 && (
                      <div className="absolute left-4 top-12 w-0.5 h-8 bg-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Before vs After Comparison</CardTitle>
              <CardDescription>
                Visual comparison of current vs optimized performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BeforeAfterComparison
                current={optimization.optimization.currentPerformance}
                optimized={optimization.optimization.targetPerformance}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PerformanceImpactChart({ current, target }: any) {
  const data = {
    labels: ['Yield per Sq Ft', 'Energy Efficiency', 'Quality Index', 'Revenue per Sq Ft'],
    datasets: [
      {
        label: 'Current',
        data: [current.yieldPerSqFt, 1/current.energyEfficiency, current.qualityIndex, current.revenuePerSqFt/100],
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 2,
      },
      {
        label: 'After Optimization',
        data: [target.yieldPerSqFt, 1/target.energyEfficiency, target.qualityIndex, target.revenuePerSqFt/100],
        backgroundColor: 'rgba(124, 58, 237, 0.5)',
        borderColor: 'rgb(124, 58, 237)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
}

function BeforeAfterComparison({ current, optimized }: any) {
  const metrics = [
    { key: 'yieldPerSqFt', label: 'Yield per Sq Ft', unit: 'lbs', icon: <Target /> },
    { key: 'energyEfficiency', label: 'Energy Efficiency', unit: 'kWh/g', icon: <Zap />, inverse: true },
    { key: 'qualityIndex', label: 'Quality Score', unit: '/10', icon: <BarChart3 />, multiplier: 10 },
    { key: 'revenuePerSqFt', label: 'Revenue per Sq Ft', unit: '$', icon: <DollarSign /> },
  ];

  return (
    <div className="space-y-4">
      {metrics.map((metric) => {
        const currentValue = current[metric.key] * (metric.multiplier || 1);
        const optimizedValue = optimized[metric.key] * (metric.multiplier || 1);
        const improvement = metric.inverse 
          ? ((currentValue - optimizedValue) / currentValue) * 100
          : ((optimizedValue - currentValue) / currentValue) * 100;

        return (
          <div key={metric.key} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="text-gray-600">{metric.icon}</div>
                <h4 className="font-medium">{metric.label}</h4>
              </div>
              <Badge variant={improvement > 0 ? 'default' : 'secondary'}>
                {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current</p>
                <p className="text-xl font-bold">{currentValue.toFixed(2)} {metric.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">After Optimization</p>
                <p className="text-xl font-bold text-purple-600">{optimizedValue.toFixed(2)} {metric.unit}</p>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs text-gray-500">{improvement.toFixed(1)}% improvement</span>
              </div>
              <Progress value={Math.min(100, Math.abs(improvement))} className="h-2" />
            </div>
          </div>
        );
      })}
    </div>
  );
}