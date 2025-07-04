'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Lightbulb,
  Zap,
  Target,
  Activity,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  GitBranch,
  Microscope
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';

interface DesignCorrelationDashboardProps {
  facilityId?: string;
  projectMode?: boolean; // true for design phase, false for operational phase
}

interface CorrelationData {
  parameter: string;
  performanceMetric: string;
  correlation: number;
  pValue: number;
  confidence: 'high' | 'medium' | 'low';
  optimalRange?: { min: number; max: number };
  dataPoints: Array<{ x: number; y: number }>;
}

interface DesignInsight {
  id: string;
  type: 'success' | 'failure' | 'optimization' | 'discovery' | 'warning';
  title: string;
  description: string;
  impact: number;
  recommendations: string[];
}

export function DesignCorrelationDashboard({ facilityId, projectMode = false }: DesignCorrelationDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [insights, setInsights] = useState<DesignInsight[]>([]);
  const [selectedParameter, setSelectedParameter] = useState<string>('ppfd');
  const [selectedMetric, setSelectedMetric] = useState<string>('yield');
  const [activeTab, setActiveTab] = useState('correlations');

  // Mock data for demonstration
  useEffect(() => {
    loadCorrelationData();
  }, [facilityId]);

  const loadCorrelationData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock correlation data
      const mockCorrelations: CorrelationData[] = [
        {
          parameter: 'ppfd',
          performanceMetric: 'yield',
          correlation: 0.82,
          pValue: 0.001,
          confidence: 'high',
          optimalRange: { min: 600, max: 900 },
          dataPoints: generateScatterData(0.82, 50)
        },
        {
          parameter: 'dli',
          performanceMetric: 'quality',
          correlation: 0.75,
          pValue: 0.003,
          confidence: 'high',
          optimalRange: { min: 20, max: 35 },
          dataPoints: generateScatterData(0.75, 45)
        },
        {
          parameter: 'temperature',
          performanceMetric: 'growth_rate',
          correlation: -0.65,
          pValue: 0.012,
          confidence: 'medium',
          optimalRange: { min: 22, max: 26 },
          dataPoints: generateScatterData(-0.65, 40)
        },
        {
          parameter: 'humidity',
          performanceMetric: 'pest_pressure',
          correlation: 0.58,
          pValue: 0.023,
          confidence: 'medium',
          optimalRange: { min: 55, max: 65 },
          dataPoints: generateScatterData(0.58, 35)
        }
      ];

      const mockInsights: DesignInsight[] = [
        {
          id: '1',
          type: 'discovery',
          title: 'Optimal PPFD Range Identified',
          description: 'Strong correlation found between PPFD 600-900 μmol/m²/s and yield optimization',
          impact: 0.82,
          recommendations: [
            'Target PPFD of 750 μmol/m²/s for balanced yield and energy efficiency',
            'Consider spectrum optimization within this PPFD range'
          ]
        },
        {
          id: '2',
          type: 'optimization',
          title: 'Temperature Control Opportunity',
          description: 'Tighter temperature control (±0.5°C) could improve growth rate by 12%',
          impact: 0.65,
          recommendations: [
            'Upgrade HVAC control algorithms',
            'Add zone-specific temperature sensors'
          ]
        },
        {
          id: '3',
          type: 'warning',
          title: 'Diminishing Returns Above 900 PPFD',
          description: 'Data shows no yield improvement above 900 μmol/m²/s, only increased energy costs',
          impact: 0.45,
          recommendations: [
            'Cap maximum PPFD at 900 to optimize energy efficiency',
            'Redirect saved energy to improved uniformity'
          ]
        }
      ];

      setCorrelations(mockCorrelations);
      setInsights(mockInsights);
      
    } catch (error) {
      console.error('Error loading correlation data:', error);
      toast.error('Failed to load correlation analysis');
    } finally {
      setLoading(false);
    }
  };

  const generateScatterData = (correlation: number, points: number) => {
    const data = [];
    for (let i = 0; i < points; i++) {
      const x = Math.random() * 100;
      const noise = (Math.random() - 0.5) * 30 * (1 - Math.abs(correlation));
      const y = correlation > 0 
        ? x * correlation + noise + 20
        : 100 - x * Math.abs(correlation) + noise;
      data.push({ x, y: Math.max(0, Math.min(100, y)) });
    }
    return data;
  };

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs > 0.7) return 'text-green-600';
    if (abs > 0.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[confidence as keyof typeof colors]}>{confidence} confidence</Badge>;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failure': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'optimization': return <Target className="w-5 h-5 text-blue-600" />;
      case 'discovery': return <Microscope className="w-5 h-5 text-purple-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <Lightbulb className="w-5 h-5 text-gray-600" />;
    }
  };

  const selectedCorrelation = correlations.find(
    c => c.parameter === selectedParameter && c.performanceMetric === selectedMetric
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Design Performance Correlation
          </h1>
          <p className="text-gray-600 mt-2">
            {projectMode 
              ? 'Evidence-based design recommendations from facility performance data'
              : 'Real-time correlation analysis between design and performance'
            }
          </p>
        </div>
        
        <Badge variant="outline" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          {correlations.length} Active Correlations
        </Badge>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Correlations Tab */}
        <TabsContent value="correlations" className="space-y-4">
          {/* Parameter Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Correlation Analysis</CardTitle>
              <CardDescription>
                Explore relationships between design parameters and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Design Parameter</label>
                  <Select value={selectedParameter} onValueChange={setSelectedParameter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ppfd">PPFD (Light Intensity)</SelectItem>
                      <SelectItem value="dli">DLI (Daily Light Integral)</SelectItem>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="humidity">Humidity</SelectItem>
                      <SelectItem value="co2">CO2 Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Performance Metric</label>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yield">Yield</SelectItem>
                      <SelectItem value="quality">Quality Score</SelectItem>
                      <SelectItem value="growth_rate">Growth Rate</SelectItem>
                      <SelectItem value="energy_efficiency">Energy Efficiency</SelectItem>
                      <SelectItem value="pest_pressure">Pest Pressure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Correlation Visualization */}
              {selectedCorrelation && (
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold flex items-center gap-2">
                          <span className={getCorrelationColor(selectedCorrelation.correlation)}>
                            r = {selectedCorrelation.correlation.toFixed(3)}
                          </span>
                          {selectedCorrelation.correlation > 0 ? 
                            <ArrowUpRight className="w-5 h-5 text-green-600" /> :
                            <ArrowDownRight className="w-5 h-5 text-red-600" />
                          }
                        </div>
                        <p className="text-sm text-gray-600">Correlation Coefficient</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          p = {selectedCorrelation.pValue.toFixed(3)}
                        </div>
                        <p className="text-sm text-gray-600">Statistical Significance</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          {getConfidenceBadge(selectedCorrelation.confidence)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Analysis Confidence</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Scatter Plot */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {selectedParameter} vs {selectedMetric}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="x" 
                            name={selectedParameter}
                            label={{ value: selectedParameter, position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            dataKey="y" 
                            name={selectedMetric}
                            label={{ value: selectedMetric, angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          {selectedCorrelation.optimalRange && (
                            <ReferenceArea
                              x1={selectedCorrelation.optimalRange.min}
                              x2={selectedCorrelation.optimalRange.max}
                              fill="#10b981"
                              fillOpacity={0.1}
                              label="Optimal Range"
                            />
                          )}
                          <Scatter
                            name="Data Points"
                            data={selectedCorrelation.dataPoints}
                            fill="#8884d8"
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Optimal Range */}
                  {selectedCorrelation.optimalRange && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">Optimal Range</h4>
                            <p className="text-sm text-gray-600">
                              Based on {selectedCorrelation.dataPoints.length} data points
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-green-600">
                              {selectedCorrelation.optimalRange.min} - {selectedCorrelation.optimalRange.max}
                            </span>
                            <p className="text-sm text-gray-600">
                              {selectedParameter === 'ppfd' && 'μmol/m²/s'}
                              {selectedParameter === 'temperature' && '°C'}
                              {selectedParameter === 'humidity' && '%'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Correlations Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Discovered Correlations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {correlations.map((corr, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedParameter(corr.parameter);
                      setSelectedMetric(corr.performanceMetric);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {corr.parameter} → {corr.performanceMetric}
                        </p>
                        <p className="text-sm text-gray-600">
                          r = <span className={getCorrelationColor(corr.correlation)}>
                            {corr.correlation.toFixed(3)}
                          </span>
                          {corr.optimalRange && (
                            <span className="ml-2">
                              Optimal: {corr.optimalRange.min}-{corr.optimalRange.max}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getConfidenceBadge(corr.confidence)}
                      {Math.abs(corr.correlation) > 0.7 && (
                        <Badge className="bg-green-100 text-green-800">Strong</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                    <p className="text-gray-700 mb-4">{insight.description}</p>
                    
                    {/* Impact Meter */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Impact Score</span>
                        <span>{(insight.impact * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={insight.impact * 100} className="h-2" />
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Recommendations:</h4>
                      {insight.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Design Recommendations</CardTitle>
              <CardDescription>
                Evidence-based recommendations for optimal facility design
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Priority Recommendations */}
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-green-600 bg-green-50 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-green-600" />
                      Optimize Light Intensity
                    </h4>
                    <Badge className="bg-red-100 text-red-800">High Priority</Badge>
                  </div>
                  <p className="text-gray-700 mb-3">
                    Set PPFD to 750 μmol/m²/s based on strong correlation with yield (r=0.82)
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Expected Impact:</span>
                      <p className="text-gray-600">+15% yield improvement</p>
                    </div>
                    <div>
                      <span className="font-medium">Investment:</span>
                      <p className="text-gray-600">$5,000 fixture upgrade</p>
                    </div>
                    <div>
                      <span className="font-medium">ROI Period:</span>
                      <p className="text-gray-600">2.5 years</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-l-4 border-blue-600 bg-blue-50 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Enhance Temperature Control
                    </h4>
                    <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
                  </div>
                  <p className="text-gray-700 mb-3">
                    Implement ±0.5°C control precision for 12% growth rate improvement
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Expected Impact:</span>
                      <p className="text-gray-600">+12% growth rate</p>
                    </div>
                    <div>
                      <span className="font-medium">Investment:</span>
                      <p className="text-gray-600">$3,000 control upgrade</p>
                    </div>
                    <div>
                      <span className="font-medium">ROI Period:</span>
                      <p className="text-gray-600">1.8 years</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-l-4 border-purple-600 bg-purple-50 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-purple-600" />
                      Design Alternative Analysis
                    </h4>
                    <Badge>Comparison</Badge>
                  </div>
                  <p className="text-gray-700 mb-3">
                    Based on correlation analysis, LED Option B shows best performance potential
                  </p>
                  <Button className="w-full" variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Detailed Comparison
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}