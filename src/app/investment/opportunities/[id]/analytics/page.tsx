'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Zap,
  Droplets,
  Thermometer,
  Leaf,
  DollarSign,
  BarChart3,
  Activity,
  Calculator,
  Target,
  Package,
  Wrench,
  ChevronRight,
  Info,
  ArrowUpRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface EquipmentRecommendation {
  id: string;
  type: 'lighting' | 'hvac' | 'irrigation' | 'sensors';
  title: string;
  description: string;
  currentStatus: string;
  recommendation: string;
  investmentRequired: number;
  projectedROI: number;
  paybackPeriod: number;
  impactMetrics: {
    yield: number;
    energy: number;
    quality: number;
  };
  priority: 'high' | 'medium' | 'low';
}

export default function FacilityAnalyticsPage() {
  const params = useParams();
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  // Mock facility data - in real app, fetch based on params.id
  const facilityData = {
    name: 'AeroGreen Technologies - Vertical Farm',
    location: 'Columbus, OH',
    size: 50000,
    zones: [
      { name: 'Propagation', size: 5000, lightLevel: 150, status: 'underlit' },
      { name: 'Vegetative', size: 20000, lightLevel: 350, status: 'optimal' },
      { name: 'Flowering', size: 20000, lightLevel: 450, status: 'optimal' },
      { name: 'Mother Plants', size: 5000, lightLevel: 200, status: 'underlit' }
    ],
    currentMetrics: {
      yield: 1200, // lbs/month
      yieldPerSqFt: 0.024,
      energyEfficiency: 85, // kWh/lb
      waterEfficiency: 0.8, // gal/lb
      laborEfficiency: 0.15, // hours/lb
      qualityScore: 92, // %
      uptime: 96.5 // %
    },
    equipment: {
      lighting: {
        total: 450,
        byType: {
          'LED 600W': 300,
          'LED 800W': 100,
          'HPS 1000W': 50 // older fixtures
        },
        avgAge: 2.5, // years
        efficiency: 2.8 // μmol/J
      },
      hvac: {
        units: 12,
        avgAge: 4,
        efficiency: 'SEER 16'
      },
      irrigation: {
        type: 'Drip',
        zones: 8,
        automation: 'Semi-automated'
      }
    }
  };

  // Equipment recommendations based on analysis
  const recommendations: EquipmentRecommendation[] = [
    {
      id: '1',
      type: 'lighting',
      title: 'Upgrade Propagation Lighting',
      description: 'Current PPFD levels in propagation are 150 μmol/m²/s, below optimal 200-250 range',
      currentStatus: '50x LED 600W fixtures at 60% capacity',
      recommendation: 'Add 25x LED 600W fixtures or upgrade to higher efficiency 800W models',
      investmentRequired: 37500,
      projectedROI: 28,
      paybackPeriod: 18,
      impactMetrics: {
        yield: 15,
        energy: -5,
        quality: 10
      },
      priority: 'high'
    },
    {
      id: '2',
      type: 'lighting',
      title: 'Replace HPS with LED in Storage',
      description: '50 HPS fixtures consuming 30% more energy than modern LEDs',
      currentStatus: '50x 1000W HPS fixtures in mother plant area',
      recommendation: 'Replace with 40x LED 800W high-efficiency fixtures',
      investmentRequired: 60000,
      projectedROI: 35,
      paybackPeriod: 14,
      impactMetrics: {
        yield: 8,
        energy: -30,
        quality: 12
      },
      priority: 'high'
    },
    {
      id: '3',
      type: 'sensors',
      title: 'Add Environmental Sensors',
      description: 'Limited data collection in 3 zones affecting optimization',
      currentStatus: 'Basic temperature/humidity monitoring only',
      recommendation: 'Install comprehensive sensor package (CO2, light, VPD, soil moisture)',
      investmentRequired: 15000,
      projectedROI: 22,
      paybackPeriod: 24,
      impactMetrics: {
        yield: 5,
        energy: -8,
        quality: 15
      },
      priority: 'medium'
    },
    {
      id: '4',
      type: 'hvac',
      title: 'HVAC Optimization System',
      description: 'Current HVAC runs on fixed schedules, missing optimization opportunities',
      currentStatus: 'Traditional thermostatic control',
      recommendation: 'Install AI-driven HVAC control system with predictive management',
      investmentRequired: 25000,
      projectedROI: 18,
      paybackPeriod: 30,
      impactMetrics: {
        yield: 3,
        energy: -15,
        quality: 5
      },
      priority: 'medium'
    }
  ];

  // Performance trend data
  const performanceTrend = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Yield (lbs)',
        data: [1050, 1100, 1120, 1150, 1180, 1200],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Energy (kWh/lb)',
        data: [95, 92, 90, 88, 86, 85],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        yAxisID: 'y1',
      }
    ]
  };

  // Zone performance radar
  const zonePerformance = {
    labels: ['Light Levels', 'Temperature', 'Humidity', 'CO2', 'Airflow', 'Uniformity'],
    datasets: [
      {
        label: 'Propagation',
        data: [60, 90, 85, 80, 75, 70],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
      },
      {
        label: 'Vegetative',
        data: [95, 92, 90, 88, 85, 90],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
      },
      {
        label: 'Flowering',
        data: [92, 88, 92, 90, 88, 85],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
      }
    ]
  };

  const calculateTotalInvestment = () => {
    return recommendations.reduce((sum, rec) => sum + rec.investmentRequired, 0);
  };

  const calculateBlendedROI = () => {
    const totalInvestment = calculateTotalInvestment();
    const weightedROI = recommendations.reduce((sum, rec) => {
      return sum + (rec.projectedROI * rec.investmentRequired);
    }, 0);
    return (weightedROI / totalInvestment).toFixed(1);
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'lighting': return <Lightbulb className="h-5 w-5" />;
      case 'hvac': return <Thermometer className="h-5 w-5" />;
      case 'irrigation': return <Droplets className="h-5 w-5" />;
      case 'sensors': return <Activity className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Facility Analytics</h2>
          <p className="text-muted-foreground">
            {facilityData.name} • {facilityData.location}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Calculator className="mr-2 h-4 w-4" />
            ROI Calculator
          </Button>
        </div>
      </div>

      {/* Investment Opportunity Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Investment Opportunities Identified</AlertTitle>
        <AlertDescription className="text-blue-700">
          Our analysis has identified {recommendations.length} equipment upgrade opportunities that could improve 
          yield by up to 31% with a blended ROI of {calculateBlendedROI()}%. 
          Total investment needed: ${calculateTotalInvestment().toLocaleString()}.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zones">Zone Analysis</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Yield</CardTitle>
                <Leaf className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{facilityData.currentMetrics.yield} lbs</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+14.3% vs 6mo ago</span>
                </div>
                <Progress value={85} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">85% of optimal capacity</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Energy Efficiency</CardTitle>
                <Zap className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{facilityData.currentMetrics.energyEfficiency} kWh/lb</div>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">-10.5% improvement</span>
                </div>
                <Progress value={70} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Target: 75 kWh/lb</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{facilityData.currentMetrics.qualityScore}%</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+3% this month</span>
                </div>
                <Progress value={92} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Premium grade achieved</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{facilityData.currentMetrics.uptime}%</div>
                <div className="flex items-center mt-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">Above target</span>
                </div>
                <Progress value={96.5} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Industry avg: 94%</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Yield and efficiency over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Line 
                  data={performanceTrend}
                  options={{
                    responsive: true,
                    interaction: {
                      mode: 'index' as const,
                      intersect: false,
                    },
                    scales: {
                      y: {
                        type: 'linear' as const,
                        display: true,
                        position: 'left' as const,
                        title: {
                          display: true,
                          text: 'Yield (lbs)'
                        }
                      },
                      y1: {
                        type: 'linear' as const,
                        display: true,
                        position: 'right' as const,
                        title: {
                          display: true,
                          text: 'Energy (kWh/lb)'
                        },
                        grid: {
                          drawOnChartArea: false,
                        },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zone Performance</CardTitle>
                <CardDescription>Environmental control by zone</CardDescription>
              </CardHeader>
              <CardContent>
                <Radar 
                  data={zonePerformance}
                  options={{
                    responsive: true,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zones" className="space-y-6">
          <div className="grid gap-4">
            {facilityData.zones.map((zone, idx) => (
              <Card key={idx} className={cn(
                "border-l-4",
                zone.status === 'underlit' ? "border-l-red-500" : "border-l-green-500"
              )}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{zone.name}</CardTitle>
                      <CardDescription>{zone.size.toLocaleString()} sq ft</CardDescription>
                    </div>
                    <Badge 
                      variant={zone.status === 'underlit' ? 'destructive' : 'default'}
                      className="text-sm"
                    >
                      {zone.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Light Level</p>
                      <p className="text-2xl font-bold">{zone.lightLevel} μmol/m²/s</p>
                      {zone.status === 'underlit' && (
                        <p className="text-xs text-red-600 mt-1">Target: 200-250</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Uniformity</p>
                      <p className="text-2xl font-bold">
                        {zone.status === 'underlit' ? '72%' : '88%'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Coverage</p>
                      <p className="text-2xl font-bold">
                        {zone.status === 'underlit' ? '85%' : '95%'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Potential Yield Gain</p>
                      <p className="text-2xl font-bold text-green-600">
                        {zone.status === 'underlit' ? '+15-20%' : 'Optimized'}
                      </p>
                    </div>
                  </div>
                  {zone.status === 'underlit' && (
                    <Alert className="mt-4 border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-700">
                        This zone is operating below optimal light levels. Upgrading lighting could increase 
                        yield by 15-20% with proper spectrum and intensity adjustments.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lighting Infrastructure</CardTitle>
                <CardDescription>Current fixture inventory and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Total Fixtures</span>
                    <span className="text-2xl font-bold">{facilityData.equipment.lighting.total}</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(facilityData.equipment.lighting.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{type}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count}</span>
                          {type.includes('HPS') && (
                            <Badge variant="outline" className="text-xs text-orange-600">Legacy</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Efficiency</p>
                    <p className="text-lg font-semibold">{facilityData.equipment.lighting.efficiency} μmol/J</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Age</p>
                    <p className="text-lg font-semibold">{facilityData.equipment.lighting.avgAge} years</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment Health Score</CardTitle>
                <CardDescription>Overall system performance rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Lighting</span>
                      <span className="text-sm font-medium">78/100</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">HVAC</span>
                      <span className="text-sm font-medium">82/100</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Irrigation</span>
                      <span className="text-sm font-medium">75/100</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Sensors & Controls</span>
                      <span className="text-sm font-medium">65/100</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                </div>
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Equipment scoring below 70 indicates significant upgrade opportunities
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-4">
            {recommendations.map(rec => (
              <Card 
                key={rec.id}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedRecommendation === rec.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedRecommendation(rec.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        rec.type === 'lighting' ? "bg-yellow-100" :
                        rec.type === 'hvac' ? "bg-blue-100" :
                        rec.type === 'irrigation' ? "bg-cyan-100" :
                        "bg-purple-100"
                      )}>
                        {getRecommendationIcon(rec.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <CardDescription className="mt-1">{rec.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(rec.priority)} variant="secondary">
                      {rec.priority} priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Investment Required</p>
                      <p className="text-xl font-bold">${rec.investmentRequired.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Projected ROI</p>
                      <p className="text-xl font-bold text-green-600">{rec.projectedROI}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payback Period</p>
                      <p className="text-xl font-bold">{rec.paybackPeriod} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Impact Score</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex items-center">
                          <Leaf className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-sm font-medium">+{rec.impactMetrics.yield}%</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 text-yellow-600 mr-1" />
                          <span className="text-sm font-medium">{rec.impactMetrics.energy}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedRecommendation === rec.id && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-1">Current Status</p>
                          <p className="text-sm text-muted-foreground">{rec.currentStatus}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Recommendation</p>
                          <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                        </div>
                        <div className="pt-2">
                          <Button className="w-full">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Create Investment Proposal
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Investment Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle>Investment Summary</CardTitle>
              <CardDescription>Combined impact of all recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div>
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                  <p className="text-2xl font-bold">${calculateTotalInvestment().toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blended ROI</p>
                  <p className="text-2xl font-bold text-green-600">{calculateBlendedROI()}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Yield Increase</p>
                  <p className="text-2xl font-bold">+31%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Energy Savings</p>
                  <p className="text-2xl font-bold">-28%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quality Improvement</p>
                  <p className="text-2xl font-bold">+12pts</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Implementing all recommendations would position this facility in the top 10% for efficiency
                </p>
                <Button size="lg">
                  <Calculator className="mr-2 h-4 w-4" />
                  View Full ROI Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}