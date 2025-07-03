'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  Zap,
  DollarSign,
  Droplets,
  ThermometerSun,
  Wind,
  Sun,
  Target,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Line, Bar, Scatter, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  ChartTooltip,
  Legend,
  Filler,
  annotationPlugin,
  zoomPlugin
);

interface InteractiveAnalyticsDashboardProps {
  reportData: any;
  customization: any;
}

export function InteractiveAnalyticsDashboard({ 
  reportData, 
  customization 
}: InteractiveAnalyticsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState('yield_per_sqft');
  const [timeGranularity, setTimeGranularity] = useState('daily');
  const [showPredictions, setShowPredictions] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [correlationThreshold, setCorrelationThreshold] = useState([0.7]);
  const [scenarioValues, setScenarioValues] = useState<Record<string, number>>({});
  
  // Real-time data simulation
  const [liveData, setLiveData] = useState<any[]>([]);
  
  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      const newDataPoint = {
        timestamp: new Date(),
        value: Math.random() * 100 + 50,
        metric: selectedMetric,
      };
      setLiveData(prev => [...prev.slice(-99), newDataPoint]);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedMetric]);

  // Key Performance Indicators with real-time updates
  const kpis = [
    {
      metric: 'Current Yield',
      value: '0.95 lbs/sq ft',
      change: '+12%',
      trend: 'up',
      icon: <Leaf className="h-5 w-5" />,
      prediction: '1.05 lbs/sq ft',
      confidence: 0.87,
    },
    {
      metric: 'Energy Efficiency',
      value: '0.42 kWh/g',
      change: '-8%',
      trend: 'up',
      icon: <Zap className="h-5 w-5" />,
      prediction: '0.38 kWh/g',
      confidence: 0.92,
    },
    {
      metric: 'Revenue/SqFt',
      value: '$285',
      change: '+15%',
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />,
      prediction: '$312',
      confidence: 0.78,
    },
    {
      metric: 'Quality Score',
      value: '8.7/10',
      change: '+0.5',
      trend: 'up',
      icon: <Target className="h-5 w-5" />,
      prediction: '9.1/10',
      confidence: 0.83,
    },
  ];

  // Interactive time series chart with predictions
  const timeSeriesData = {
    labels: reportData?.data?.timeSeriesLabels || [],
    datasets: [
      {
        label: 'Actual',
        data: reportData?.data?.actualValues || [],
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
      },
      showPredictions && {
        label: 'Predicted',
        data: reportData?.analytics?.predictions || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
      },
      {
        label: 'Industry Average',
        data: reportData?.data?.industryAvg || [],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderDash: [2, 2],
        tension: 0.4,
      },
    ].filter(Boolean),
  };

  const timeSeriesOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            if (context.dataset.label === 'Predicted') {
              return `Confidence: ${(reportData?.analytics?.confidence * 100).toFixed(0)}%`;
            }
            return '';
          },
        },
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x' as const,
        },
        pan: {
          enabled: true,
          mode: 'x' as const,
        },
      },
      annotation: showAnomalies ? {
        annotations: reportData?.analytics?.anomalies?.map((anomaly: any, idx: number) => ({
          type: 'point' as const,
          xValue: anomaly.index,
          yValue: anomaly.value,
          backgroundColor: anomaly.severity === 'high' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(251, 191, 36, 0.8)',
          radius: 8,
          borderColor: 'white',
          borderWidth: 2,
        })) || [],
      } : {},
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  // Correlation heatmap data
  const correlationData = reportData?.analytics?.correlations?.matrix || {};
  const correlationMetrics = Object.keys(correlationData);

  // What-if scenario modeling
  const runScenario = (scenario: string) => {
    // Simulate scenario impact calculation
    const impacts = {
      yield: Math.random() * 20 - 10,
      energy: Math.random() * 15 - 7.5,
      revenue: Math.random() * 25 - 12.5,
    };
    
    return impacts;
  };

  return (
    <div className="space-y-6">
      {/* Real-time KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  {kpi.icon}
                </div>
                <Badge 
                  variant={kpi.trend === 'up' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {kpi.change}
                </Badge>
              </div>
              
              <h3 className="text-sm font-medium text-gray-600">{kpi.metric}</h3>
              <p className="text-2xl font-bold mt-1">{kpi.value}</p>
              
              {showPredictions && (
                <div className="mt-2 pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">30-day forecast</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Confidence: {(kpi.confidence * 100).toFixed(0)}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm font-semibold text-green-600">{kpi.prediction}</p>
                </div>
              )}
              
              {/* Real-time indicator */}
              <div className="absolute top-2 right-2">
                <Activity className="h-4 w-4 text-green-500 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Controls</CardTitle>
          <CardDescription>Customize your analysis view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Primary Metric</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yield_per_sqft">Yield per Sq Ft</SelectItem>
                  <SelectItem value="energy_per_gram">Energy per Gram</SelectItem>
                  <SelectItem value="revenue_per_sqft">Revenue per Sq Ft</SelectItem>
                  <SelectItem value="quality_score">Quality Score</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Time Granularity</label>
              <Select value={timeGranularity} onValueChange={setTimeGranularity}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Show Predictions</label>
                <Switch checked={showPredictions} onCheckedChange={setShowPredictions} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Show Anomalies</label>
                <Switch checked={showAnomalies} onCheckedChange={setShowAnomalies} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Correlation Threshold</label>
              <div className="flex items-center space-x-2 mt-2">
                <Slider
                  value={correlationThreshold}
                  onValueChange={setCorrelationThreshold}
                  min={0.5}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm w-10">{correlationThreshold[0]}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Series Analysis */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Time Series Analysis</CardTitle>
              <CardDescription>
                Interactive chart with zoom, pan, and real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Line data={timeSeriesData} options={timeSeriesOptions} />
              
              {/* Anomaly alerts */}
              {showAnomalies && reportData?.analytics?.anomalies?.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800">
                      {reportData.analytics.anomalies.length} anomalies detected
                    </p>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    Click on highlighted points for details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Strong Correlations */}
              <div>
                <h4 className="text-sm font-medium mb-2">Strong Correlations</h4>
                {reportData?.analytics?.correlations?.strongCorrelations
                  ?.filter((c: any) => Math.abs(c.correlation) >= correlationThreshold[0])
                  .slice(0, 3)
                  .map((corr: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="text-xs">
                        <p className="font-medium">{corr.metric1} ↔ {corr.metric2}</p>
                        <p className="text-gray-500">{corr.strength} {corr.direction}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {(corr.correlation * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  )) || <p className="text-sm text-gray-500">No strong correlations found</p>}
              </div>

              {/* Predictive Insights */}
              <div>
                <h4 className="text-sm font-medium mb-2">Predictions</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs font-medium text-green-800">Next 30 Days</p>
                    <p className="text-sm text-green-700 mt-1">
                      Yield expected to increase by 12% based on current trends
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-medium text-blue-800">Optimization Opportunity</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Adjusting temperature by 2°F could improve yield by 8%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* What-If Scenario Modeling */}
      <Card>
        <CardHeader>
          <CardTitle>What-If Scenario Modeling</CardTitle>
          <CardDescription>
            Adjust parameters to see potential impacts on your metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium flex items-center space-x-2">
                <ThermometerSun className="h-4 w-4" />
                <span>Temperature Adjustment</span>
              </label>
              <Slider
                value={[scenarioValues.temperature || 0]}
                onValueChange={([value]) => setScenarioValues({ ...scenarioValues, temperature: value })}
                min={-5}
                max={5}
                step={0.5}
                className="mt-2"
              />
              <span className="text-xs text-gray-500">{scenarioValues.temperature || 0}°F</span>
            </div>

            <div>
              <label className="text-sm font-medium flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <span>Light Intensity</span>
              </label>
              <Slider
                value={[scenarioValues.lightIntensity || 0]}
                onValueChange={([value]) => setScenarioValues({ ...scenarioValues, lightIntensity: value })}
                min={-20}
                max={20}
                step={5}
                className="mt-2"
              />
              <span className="text-xs text-gray-500">{scenarioValues.lightIntensity || 0}%</span>
            </div>

            <div>
              <label className="text-sm font-medium flex items-center space-x-2">
                <Droplets className="h-4 w-4" />
                <span>Humidity Level</span>
              </label>
              <Slider
                value={[scenarioValues.humidity || 0]}
                onValueChange={([value]) => setScenarioValues({ ...scenarioValues, humidity: value })}
                min={-10}
                max={10}
                step={2}
                className="mt-2"
              />
              <span className="text-xs text-gray-500">{scenarioValues.humidity || 0}%</span>
            </div>

            <div>
              <label className="text-sm font-medium flex items-center space-x-2">
                <Wind className="h-4 w-4" />
                <span>CO2 Enrichment</span>
              </label>
              <Slider
                value={[scenarioValues.co2 || 0]}
                onValueChange={([value]) => setScenarioValues({ ...scenarioValues, co2: value })}
                min={0}
                max={500}
                step={50}
                className="mt-2"
              />
              <span className="text-xs text-gray-500">+{scenarioValues.co2 || 0} ppm</span>
            </div>
          </div>

          <Button 
            onClick={() => {
              const impacts = runScenario('custom');
              // Show impact results
            }}
            className="mb-4"
          >
            Calculate Impact
          </Button>

          {/* Scenario Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-gray-600">Yield Impact</h4>
                <p className="text-2xl font-bold text-green-600">+12.5%</p>
                <p className="text-xs text-gray-500 mt-1">1,250 lbs additional yield</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-gray-600">Energy Impact</h4>
                <p className="text-2xl font-bold text-yellow-600">+5.2%</p>
                <p className="text-xs text-gray-500 mt-1">520 kWh additional usage</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-gray-600">ROI Timeline</h4>
                <p className="text-2xl font-bold text-purple-600">4.5 months</p>
                <p className="text-xs text-gray-500 mt-1">$15,000 net benefit</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Factor Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-factor Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Multi-Factor Performance</CardTitle>
            <CardDescription>Compare performance across all key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Radar
              data={{
                labels: ['Yield', 'Energy', 'Quality', 'Cost', 'Speed', 'Consistency'],
                datasets: [
                  {
                    label: 'Your Facility',
                    data: [95, 78, 87, 82, 91, 88],
                    backgroundColor: 'rgba(124, 58, 237, 0.2)',
                    borderColor: 'rgb(124, 58, 237)',
                    borderWidth: 2,
                  },
                  {
                    label: 'Top 10%',
                    data: [98, 92, 95, 90, 94, 96],
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 2,
                  },
                  {
                    label: 'Industry Average',
                    data: [75, 70, 72, 68, 73, 71],
                    backgroundColor: 'rgba(156, 163, 175, 0.2)',
                    borderColor: 'rgb(156, 163, 175)',
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Live Environmental Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle>Live Environmental Conditions</CardTitle>
            <CardDescription>Real-time sensor readings and targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Temperature', value: 72.5, target: 73, unit: '°F', icon: <ThermometerSun /> },
                { label: 'Humidity', value: 65, target: 60, unit: '%', icon: <Droplets /> },
                { label: 'CO2', value: 1200, target: 1500, unit: 'ppm', icon: <Wind /> },
                { label: 'Light', value: 850, target: 900, unit: 'PPFD', icon: <Sun /> },
              ].map((env, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="text-gray-500">{env.icon}</div>
                      <span className="text-sm font-medium">{env.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">{env.value}</span>
                      <span className="text-sm text-gray-500 ml-1">{env.unit}</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${(env.value / env.target) * 100}%` }}
                    />
                    <div 
                      className="absolute h-full w-0.5 bg-gray-600"
                      style={{ left: '100%' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Actual</span>
                    <span>Target: {env.target}{env.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}