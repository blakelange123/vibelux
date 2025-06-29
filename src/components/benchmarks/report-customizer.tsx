'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Clock, 
  BarChart3, 
  Filter, 
  Sparkles,
  Download,
  Save,
  Play,
  Plus,
  X,
  Brain,
  TrendingUp,
  AlertTriangle,
  Link,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportCustomizerProps {
  facilityId: string;
  onGenerate: (config: any) => void;
}

export function ReportCustomizer({ facilityId, onGenerate }: ReportCustomizerProps) {
  const [reportName, setReportName] = useState('');
  const [timeRangeType, setTimeRangeType] = useState('rolling');
  const [rollingDays, setRollingDays] = useState(30);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [customMetrics, setCustomMetrics] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState({ primary: 'zone', secondary: '', tertiary: '' });
  const [filters, setFilters] = useState<any[]>([]);
  const [visualizations, setVisualizations] = useState<string[]>(['line', 'bar']);
  const [advancedFeatures, setAdvancedFeatures] = useState({
    predictive: false,
    anomalyDetection: false,
    correlationAnalysis: false,
    whatIfScenarios: false,
  });
  const [exportFormats, setExportFormats] = useState<string[]>(['pdf']);
  const [scheduling, setScheduling] = useState({ enabled: false, frequency: 'weekly' });

  const standardMetrics = [
    { id: 'yield_per_sqft', name: 'Yield per Sq Ft', category: 'Production' },
    { id: 'energy_per_gram', name: 'Energy per Gram', category: 'Efficiency' },
    { id: 'revenue_per_sqft', name: 'Revenue per Sq Ft', category: 'Financial' },
    { id: 'water_usage', name: 'Water Usage', category: 'Resource' },
    { id: 'labor_hours', name: 'Labor Hours', category: 'Operations' },
    { id: 'quality_score', name: 'Quality Score', category: 'Quality' },
    { id: 'waste_percentage', name: 'Waste %', category: 'Efficiency' },
    { id: 'cycle_time', name: 'Cycle Time', category: 'Operations' },
    { id: 'vpd_average', name: 'VPD Average', category: 'Environmental' },
    { id: 'co2_levels', name: 'CO2 Levels', category: 'Environmental' },
    { id: 'light_intensity', name: 'Light Intensity', category: 'Environmental' },
    { id: 'temperature_variance', name: 'Temperature Variance', category: 'Environmental' },
  ];

  const chartTypes = [
    { id: 'line', name: 'Line Chart', icon: '📈' },
    { id: 'bar', name: 'Bar Chart', icon: '📊' },
    { id: 'scatter', name: 'Scatter Plot', icon: '🔵' },
    { id: 'heatmap', name: 'Heat Map', icon: '🟥' },
    { id: 'sankey', name: 'Sankey Diagram', icon: '🌊' },
    { id: 'treemap', name: 'Treemap', icon: '🌳' },
    { id: 'gauge', name: 'Gauge Chart', icon: '🎯' },
    { id: 'radar', name: 'Radar Chart', icon: '🕸️' },
    { id: 'waterfall', name: 'Waterfall Chart', icon: '🏔️' },
  ];

  const addCustomMetric = () => {
    const newMetric = {
      id: `custom_${Date.now()}`,
      name: '',
      formula: '',
      unit: '',
      category: 'Custom',
    };
    setCustomMetrics([...customMetrics, newMetric]);
  };

  const updateCustomMetric = (id: string, field: string, value: string) => {
    setCustomMetrics(customMetrics.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const removeCustomMetric = (id: string) => {
    setCustomMetrics(customMetrics.filter(m => m.id !== id));
  };

  const addFilter = () => {
    const newFilter = {
      id: `filter_${Date.now()}`,
      field: '',
      operator: 'eq',
      value: '',
    };
    setFilters([...filters, newFilter]);
  };

  const updateFilter = (id: string, field: string, value: any) => {
    setFilters(filters.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const handleGenerate = () => {
    if (!reportName) {
      toast.error('Please enter a report name');
      return;
    }

    if (selectedMetrics.length === 0) {
      toast.error('Please select at least one metric');
      return;
    }

    const config = {
      reportId: `report_${Date.now()}`,
      name: reportName,
      facilityId,
      timeRange: {
        type: timeRangeType,
        rollingDays: timeRangeType === 'rolling' ? rollingDays : undefined,
      },
      metrics: {
        standard: selectedMetrics,
        custom: customMetrics.filter(m => m.name && m.formula),
      },
      groupBy,
      filters: filters.filter(f => f.field && f.value),
      visualizations: {
        chartTypes: visualizations,
        interactivity: 'advanced',
      },
      features: advancedFeatures,
      exportOptions: {
        formats: exportFormats,
        scheduling: scheduling.enabled ? scheduling : undefined,
      },
    };

    onGenerate(config);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
          <CardDescription>
            Create powerful, customized reports tailored to your specific needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g., Weekly Performance Analysis"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="time" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Range
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="visuals" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Visuals
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Period Selection</CardTitle>
              <CardDescription>Choose how to define the reporting period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Time Range Type</Label>
                <Select value={timeRangeType} onValueChange={setTimeRangeType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rolling">Rolling Window</SelectItem>
                    <SelectItem value="fixed">Fixed Period</SelectItem>
                    <SelectItem value="comparison">Period Comparison</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {timeRangeType === 'rolling' && (
                <div>
                  <Label>Number of Days</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Slider
                      value={[rollingDays]}
                      onValueChange={([value]) => setRollingDays(value)}
                      min={1}
                      max={365}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{rollingDays}</span>
                  </div>
                </div>
              )}

              {timeRangeType === 'comparison' && (
                <div className="space-y-2">
                  <Label>Compare Periods</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">This Month vs Last Month</Button>
                    <Button variant="outline" size="sm">This Quarter vs Last Quarter</Button>
                    <Button variant="outline" size="sm">This Year vs Last Year</Button>
                    <Button variant="outline" size="sm">Custom Comparison</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Metrics</CardTitle>
              <CardDescription>Choose standard metrics or create custom calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="standard">
                <TabsList>
                  <TabsTrigger value="standard">Standard Metrics</TabsTrigger>
                  <TabsTrigger value="custom">Custom Metrics</TabsTrigger>
                  <TabsTrigger value="calculated">Calculated Metrics</TabsTrigger>
                </TabsList>

                <TabsContent value="standard" className="mt-4">
                  <div className="space-y-4">
                    {Object.entries(
                      standardMetrics.reduce((acc, metric) => {
                        if (!acc[metric.category]) acc[metric.category] = [];
                        acc[metric.category].push(metric);
                        return acc;
                      }, {} as Record<string, typeof standardMetrics>)
                    ).map(([category, metrics]) => (
                      <div key={category}>
                        <h4 className="font-medium mb-2">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {metrics.map((metric) => (
                            <div key={metric.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={metric.id}
                                checked={selectedMetrics.includes(metric.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMetrics([...selectedMetrics, metric.id]);
                                  } else {
                                    setSelectedMetrics(selectedMetrics.filter(m => m !== metric.id));
                                  }
                                }}
                              />
                              <Label htmlFor={metric.id} className="cursor-pointer">
                                {metric.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="mt-4 space-y-4">
                  <Button onClick={addCustomMetric} variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Custom Metric
                  </Button>

                  {customMetrics.map((metric) => (
                    <Card key={metric.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-3">
                            <Input
                              placeholder="Metric Name"
                              value={metric.name}
                              onChange={(e) => updateCustomMetric(metric.id, 'name', e.target.value)}
                            />
                            <Textarea
                              placeholder="Formula (e.g., yield / energy_consumption * 100)"
                              value={metric.formula}
                              onChange={(e) => updateCustomMetric(metric.id, 'formula', e.target.value)}
                              rows={2}
                            />
                            <Input
                              placeholder="Unit (e.g., %, kg/kWh)"
                              value={metric.unit}
                              onChange={(e) => updateCustomMetric(metric.id, 'unit', e.target.value)}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomMetric(metric.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="calculated" className="mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="cursor-pointer hover:border-purple-500 transition-colors">
                        <CardContent className="p-4">
                          <Calculator className="h-8 w-8 mb-2 text-purple-600" />
                          <h4 className="font-medium">Growth Rate</h4>
                          <p className="text-sm text-gray-600">Period-over-period change</p>
                        </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:border-purple-500 transition-colors">
                        <CardContent className="p-4">
                          <TrendingUp className="h-8 w-8 mb-2 text-purple-600" />
                          <h4 className="font-medium">Moving Average</h4>
                          <p className="text-sm text-gray-600">Smooth out fluctuations</p>
                        </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:border-purple-500 transition-colors">
                        <CardContent className="p-4">
                          <Link className="h-8 w-8 mb-2 text-purple-600" />
                          <h4 className="font-medium">Correlation Index</h4>
                          <p className="text-sm text-gray-600">Measure relationships</p>
                        </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:border-purple-500 transition-colors">
                        <CardContent className="p-4">
                          <AlertTriangle className="h-8 w-8 mb-2 text-purple-600" />
                          <h4 className="font-medium">Variance Analysis</h4>
                          <p className="text-sm text-gray-600">Deviation from targets</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Grouping</CardTitle>
              <CardDescription>How to organize and aggregate your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Primary Grouping</Label>
                <Select value={groupBy.primary} onValueChange={(value) => 
                  setGroupBy({ ...groupBy, primary: value })
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zone">Zone</SelectItem>
                    <SelectItem value="crop">Crop Type</SelectItem>
                    <SelectItem value="strain">Strain</SelectItem>
                    <SelectItem value="stage">Growth Stage</SelectItem>
                    <SelectItem value="equipment">Equipment Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Secondary Grouping (Optional)</Label>
                <Select value={groupBy.secondary} onValueChange={(value) => 
                  setGroupBy({ ...groupBy, secondary: value })
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="zone">Zone</SelectItem>
                    <SelectItem value="crop">Crop Type</SelectItem>
                    <SelectItem value="strain">Strain</SelectItem>
                    <SelectItem value="stage">Growth Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Filters</CardTitle>
              <CardDescription>Filter data to focus on specific segments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={addFilter} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Filter
              </Button>

              {filters.map((filter) => (
                <div key={filter.id} className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label>Field</Label>
                    <Select value={filter.field} onValueChange={(value) => 
                      updateFilter(filter.id, 'field', value)
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zone">Zone</SelectItem>
                        <SelectItem value="crop">Crop Type</SelectItem>
                        <SelectItem value="quality">Quality Grade</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-32">
                    <Label>Operator</Label>
                    <Select value={filter.operator} onValueChange={(value) => 
                      updateFilter(filter.id, 'operator', value)
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eq">Equals</SelectItem>
                        <SelectItem value="ne">Not Equals</SelectItem>
                        <SelectItem value="gt">Greater Than</SelectItem>
                        <SelectItem value="lt">Less Than</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label>Value</Label>
                    <Input
                      value={filter.value}
                      onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                      placeholder="Filter value"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFilter(filter.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visuals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualization Options</CardTitle>
              <CardDescription>Choose how to display your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {chartTypes.map((chart) => (
                  <Card 
                    key={chart.id}
                    className={`cursor-pointer transition-all ${
                      visualizations.includes(chart.id) 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => {
                      if (visualizations.includes(chart.id)) {
                        setVisualizations(visualizations.filter(v => v !== chart.id));
                      } else {
                        setVisualizations([...visualizations, chart.id]);
                      }
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{chart.icon}</div>
                      <p className="text-sm font-medium">{chart.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <Label>Color Scheme</Label>
                  <Select defaultValue="vibelux">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vibelux">VibeLux Purple</SelectItem>
                      <SelectItem value="blue">Ocean Blue</SelectItem>
                      <SelectItem value="green">Forest Green</SelectItem>
                      <SelectItem value="warm">Warm Sunset</SelectItem>
                      <SelectItem value="mono">Monochrome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="animations">Enable Animations</Label>
                  <Switch id="animations" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="interactive">Interactive Charts</Label>
                  <Switch id="interactive" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Analytics</CardTitle>
              <CardDescription>Enable advanced analytics features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="predictive">Predictive Analytics</Label>
                    <p className="text-sm text-gray-600">Forecast future trends and outcomes</p>
                  </div>
                  <Switch 
                    id="predictive"
                    checked={advancedFeatures.predictive}
                    onCheckedChange={(checked) => 
                      setAdvancedFeatures({ ...advancedFeatures, predictive: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="anomaly">Anomaly Detection</Label>
                    <p className="text-sm text-gray-600">Identify unusual patterns automatically</p>
                  </div>
                  <Switch 
                    id="anomaly"
                    checked={advancedFeatures.anomalyDetection}
                    onCheckedChange={(checked) => 
                      setAdvancedFeatures({ ...advancedFeatures, anomalyDetection: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="correlation">Correlation Analysis</Label>
                    <p className="text-sm text-gray-600">Discover relationships between metrics</p>
                  </div>
                  <Switch 
                    id="correlation"
                    checked={advancedFeatures.correlationAnalysis}
                    onCheckedChange={(checked) => 
                      setAdvancedFeatures({ ...advancedFeatures, correlationAnalysis: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="whatif">What-If Scenarios</Label>
                    <p className="text-sm text-gray-600">Model potential changes and impacts</p>
                  </div>
                  <Switch 
                    id="whatif"
                    checked={advancedFeatures.whatIfScenarios}
                    onCheckedChange={(checked) => 
                      setAdvancedFeatures({ ...advancedFeatures, whatIfScenarios: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benchmark Groups</CardTitle>
              <CardDescription>Define custom peer groups for comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Custom Peer Group
                </Button>
                <div className="text-sm text-gray-600">
                  Compare against facilities with similar:
                  <ul className="list-disc list-inside mt-1">
                    <li>Size (±20% square footage)</li>
                    <li>Climate zone</li>
                    <li>Crop types</li>
                    <li>Technology level</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Choose how to share and distribute reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Export Formats</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['pdf', 'excel', 'pptx', 'csv', 'api', 'tableau'].map((format) => (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox
                        id={format}
                        checked={exportFormats.includes(format)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setExportFormats([...exportFormats, format]);
                          } else {
                            setExportFormats(exportFormats.filter(f => f !== format));
                          }
                        }}
                      />
                      <Label htmlFor={format} className="cursor-pointer uppercase">
                        {format}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="scheduling">Automated Scheduling</Label>
                  <Switch 
                    id="scheduling"
                    checked={scheduling.enabled}
                    onCheckedChange={(checked) => 
                      setScheduling({ ...scheduling, enabled: checked })
                    }
                  />
                </div>

                {scheduling.enabled && (
                  <div>
                    <Label>Frequency</Label>
                    <Select 
                      value={scheduling.frequency} 
                      onValueChange={(value) => 
                        setScheduling({ ...scheduling, frequency: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <Label>Distribution List</Label>
                <Textarea
                  placeholder="Enter email addresses (one per line)"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Save Template
        </Button>
        <Button onClick={handleGenerate}>
          <Play className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>
    </div>
  );
}