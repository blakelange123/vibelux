'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Lightbulb,
  Zap,
  Leaf,
  Clock,
  BarChart3,
  Download,
  Save,
  Share2,
  Target,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface InvestmentScenario {
  id: string;
  name: string;
  investments: {
    lighting: number;
    hvac: number;
    sensors: number;
    automation: number;
  };
  expectedYieldIncrease: number;
  energySavings: number;
  qualityImprovement: number;
  operationalSavings: number;
}

interface ROICalculation {
  totalInvestment: number;
  annualReturns: number;
  paybackPeriod: number;
  roi5Year: number;
  npv: number;
  irr: number;
}

export default function ROICalculatorPage() {
  const params = useParams();
  
  // Investment parameters
  const [selectedScenario, setSelectedScenario] = useState<string>('recommended');
  const [customInvestments, setCustomInvestments] = useState({
    lighting: 97500,
    hvac: 25000,
    sensors: 15000,
    automation: 20000
  });
  
  // Facility parameters
  const [facilityParams, setFacilityParams] = useState({
    currentYield: 1200, // lbs/month
    currentRevenue: 4.50, // $/lb
    currentOpex: 65000, // $/month
    currentEnergyUsage: 102000, // kWh/month
    energyCost: 0.12, // $/kWh
    discountRate: 8, // %
    analysisYears: 5
  });

  // Baseline facility data
  const baselineData = {
    sqft: 50000,
    zones: 4,
    currentLightLevel: 275, // average PPFD
    currentEfficiency: 85, // kWh/lb
    currentQuality: 92 // %
  };

  // Predefined scenarios
  const scenarios: InvestmentScenario[] = [
    {
      id: 'minimal',
      name: 'Minimal Upgrade',
      investments: {
        lighting: 37500,
        hvac: 0,
        sensors: 15000,
        automation: 0
      },
      expectedYieldIncrease: 12,
      energySavings: 8,
      qualityImprovement: 5,
      operationalSavings: 3
    },
    {
      id: 'recommended',
      name: 'Recommended Package',
      investments: {
        lighting: 97500,
        hvac: 25000,
        sensors: 15000,
        automation: 20000
      },
      expectedYieldIncrease: 28,
      energySavings: 22,
      qualityImprovement: 12,
      operationalSavings: 15
    },
    {
      id: 'comprehensive',
      name: 'Full Optimization',
      investments: {
        lighting: 150000,
        hvac: 45000,
        sensors: 25000,
        automation: 35000
      },
      expectedYieldIncrease: 42,
      energySavings: 35,
      qualityImprovement: 18,
      operationalSavings: 25
    }
  ];

  const getActiveScenario = () => {
    if (selectedScenario === 'custom') {
      return {
        id: 'custom',
        name: 'Custom Configuration',
        investments: customInvestments,
        expectedYieldIncrease: calculateYieldIncrease(),
        energySavings: calculateEnergySavings(),
        qualityImprovement: calculateQualityImprovement(),
        operationalSavings: calculateOperationalSavings()
      };
    }
    return scenarios.find(s => s.id === selectedScenario) || scenarios[1];
  };

  const calculateYieldIncrease = () => {
    // Simplified calculation based on lighting investment
    const lightingRatio = customInvestments.lighting / 150000;
    const baseIncrease = lightingRatio * 35;
    const hvacBonus = (customInvestments.hvac / 45000) * 5;
    const automationBonus = (customInvestments.automation / 35000) * 8;
    return Math.min(baseIncrease + hvacBonus + automationBonus, 45);
  };

  const calculateEnergySavings = () => {
    const lightingEfficiency = (customInvestments.lighting / 150000) * 25;
    const hvacEfficiency = (customInvestments.hvac / 45000) * 15;
    const automationEfficiency = (customInvestments.automation / 35000) * 10;
    return Math.min(lightingEfficiency + hvacEfficiency + automationEfficiency, 40);
  };

  const calculateQualityImprovement = () => {
    const lightingQuality = (customInvestments.lighting / 150000) * 15;
    const sensorQuality = (customInvestments.sensors / 25000) * 8;
    return Math.min(lightingQuality + sensorQuality, 20);
  };

  const calculateOperationalSavings = () => {
    const automationSavings = (customInvestments.automation / 35000) * 20;
    const sensorSavings = (customInvestments.sensors / 25000) * 10;
    return Math.min(automationSavings + sensorSavings, 30);
  };

  const calculateROI = (scenario: InvestmentScenario): ROICalculation => {
    const totalInvestment = Object.values(scenario.investments).reduce((sum, val) => sum + val, 0);
    
    // Annual revenue increase from yield improvement
    const newYield = facilityParams.currentYield * (1 + scenario.expectedYieldIncrease / 100);
    const yieldRevenue = (newYield - facilityParams.currentYield) * 12 * facilityParams.currentRevenue;
    
    // Quality premium (assume 10% premium for quality improvement)
    const qualityRevenue = facilityParams.currentYield * 12 * facilityParams.currentRevenue * 
                          (scenario.qualityImprovement / 100) * 0.1;
    
    // Energy cost savings
    const energySavings = facilityParams.currentEnergyUsage * 12 * facilityParams.energyCost * 
                         (scenario.energySavings / 100);
    
    // Operational cost savings
    const opexSavings = facilityParams.currentOpex * 12 * (scenario.operationalSavings / 100);
    
    const annualReturns = yieldRevenue + qualityRevenue + energySavings + opexSavings;
    
    // Simple payback period
    const paybackPeriod = totalInvestment / annualReturns;
    
    // 5-year ROI
    const totalReturns = annualReturns * facilityParams.analysisYears;
    const roi5Year = ((totalReturns - totalInvestment) / totalInvestment) * 100;
    
    // NPV calculation
    let npv = -totalInvestment;
    for (let year = 1; year <= facilityParams.analysisYears; year++) {
      npv += annualReturns / Math.pow(1 + facilityParams.discountRate / 100, year);
    }
    
    // IRR approximation (simplified)
    const irr = ((Math.pow(totalReturns / totalInvestment, 1 / facilityParams.analysisYears) - 1) * 100);
    
    return {
      totalInvestment,
      annualReturns,
      paybackPeriod,
      roi5Year,
      npv,
      irr
    };
  };

  const activeScenario = getActiveScenario();
  const roiCalculation = calculateROI(activeScenario);

  // Chart data for cash flow projection
  const cashFlowData = {
    labels: Array.from({length: facilityParams.analysisYears + 1}, (_, i) => `Year ${i}`),
    datasets: [
      {
        label: 'Cumulative Cash Flow',
        data: [
          -roiCalculation.totalInvestment,
          ...Array.from({length: facilityParams.analysisYears}, (_, i) => 
            -roiCalculation.totalInvestment + (roiCalculation.annualReturns * (i + 1))
          )
        ],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1
      }
    ]
  };

  const returnsBreakdown = {
    labels: ['Yield Revenue', 'Quality Premium', 'Energy Savings', 'Operational Savings'],
    datasets: [{
      data: [
        (facilityParams.currentYield * (activeScenario.expectedYieldIncrease / 100) * 12 * facilityParams.currentRevenue),
        (facilityParams.currentYield * 12 * facilityParams.currentRevenue * (activeScenario.qualityImprovement / 100) * 0.1),
        (facilityParams.currentEnergyUsage * 12 * facilityParams.energyCost * (activeScenario.energySavings / 100)),
        (facilityParams.currentOpex * 12 * (activeScenario.operationalSavings / 100))
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ]
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ROI Calculator</h2>
          <p className="text-muted-foreground">
            Analyze investment scenarios and projected returns
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Analysis
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Investment Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Scenarios</CardTitle>
              <CardDescription>Choose a predefined scenario or customize</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {scenarios.map(scenario => (
                  <div key={scenario.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={scenario.id}
                      checked={selectedScenario === scenario.id}
                      onCheckedChange={() => setSelectedScenario(scenario.id)}
                    />
                    <Label htmlFor={scenario.id} className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">{scenario.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${Object.values(scenario.investments).reduce((sum, val) => sum + val, 0).toLocaleString()}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="custom"
                    checked={selectedScenario === 'custom'}
                    onCheckedChange={() => setSelectedScenario('custom')}
                  />
                  <Label htmlFor="custom" className="cursor-pointer font-medium">
                    Custom Configuration
                  </Label>
                </div>
              </div>

              {selectedScenario === 'custom' && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label>Lighting Investment</Label>
                    <div className="mt-2">
                      <Input
                        type="number"
                        value={customInvestments.lighting}
                        onChange={(e) => setCustomInvestments({
                          ...customInvestments,
                          lighting: Number(e.target.value)
                        })}
                      />
                      <Slider
                        value={[customInvestments.lighting]}
                        onValueChange={([value]) => setCustomInvestments({
                          ...customInvestments,
                          lighting: value
                        })}
                        max={200000}
                        step={2500}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>HVAC Investment</Label>
                    <div className="mt-2">
                      <Input
                        type="number"
                        value={customInvestments.hvac}
                        onChange={(e) => setCustomInvestments({
                          ...customInvestments,
                          hvac: Number(e.target.value)
                        })}
                      />
                      <Slider
                        value={[customInvestments.hvac]}
                        onValueChange={([value]) => setCustomInvestments({
                          ...customInvestments,
                          hvac: value
                        })}
                        max={100000}
                        step={2500}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Sensors & Monitoring</Label>
                    <div className="mt-2">
                      <Input
                        type="number"
                        value={customInvestments.sensors}
                        onChange={(e) => setCustomInvestments({
                          ...customInvestments,
                          sensors: Number(e.target.value)
                        })}
                      />
                      <Slider
                        value={[customInvestments.sensors]}
                        onValueChange={([value]) => setCustomInvestments({
                          ...customInvestments,
                          sensors: value
                        })}
                        max={50000}
                        step={1000}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Automation Systems</Label>
                    <div className="mt-2">
                      <Input
                        type="number"
                        value={customInvestments.automation}
                        onChange={(e) => setCustomInvestments({
                          ...customInvestments,
                          automation: Number(e.target.value)
                        })}
                      />
                      <Slider
                        value={[customInvestments.automation]}
                        onValueChange={([value]) => setCustomInvestments({
                          ...customInvestments,
                          automation: value
                        })}
                        max={75000}
                        step={2500}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facility Parameters</CardTitle>
              <CardDescription>Adjust baseline assumptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Yield (lbs/month)</Label>
                  <Input
                    type="number"
                    value={facilityParams.currentYield}
                    onChange={(e) => setFacilityParams({
                      ...facilityParams,
                      currentYield: Number(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Revenue ($/lb)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={facilityParams.currentRevenue}
                    onChange={(e) => setFacilityParams({
                      ...facilityParams,
                      currentRevenue: Number(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Energy Cost ($/kWh)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={facilityParams.energyCost}
                    onChange={(e) => setFacilityParams({
                      ...facilityParams,
                      energyCost: Number(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Discount Rate (%)</Label>
                  <Input
                    type="number"
                    value={facilityParams.discountRate}
                    onChange={(e) => setFacilityParams({
                      ...facilityParams,
                      discountRate: Number(e.target.value)
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${roiCalculation.totalInvestment.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  One-time capital investment
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annual Returns</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${roiCalculation.annualReturns.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Yearly benefit realization
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payback Period</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {roiCalculation.paybackPeriod.toFixed(1)} years
                </div>
                <p className="text-xs text-muted-foreground">
                  Time to recover investment
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">5-Year ROI</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {roiCalculation.roi5Year.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Total return over 5 years
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Projection</CardTitle>
                <CardDescription>Cumulative returns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Line
                  data={cashFlowData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: (value) => `$${(value as number / 1000).toFixed(0)}k`
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Return Sources</CardTitle>
                <CardDescription>Annual benefit breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <Bar
                  data={returnsBreakdown}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: (value) => `$${(value as number / 1000).toFixed(0)}k`
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expected Impacts</CardTitle>
              <CardDescription>Performance improvements from {activeScenario.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Leaf className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    +{activeScenario.expectedYieldIncrease}%
                  </div>
                  <p className="text-sm text-muted-foreground">Yield Increase</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{(facilityParams.currentYield * activeScenario.expectedYieldIncrease / 100).toFixed(0)} lbs/month
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    -{activeScenario.energySavings}%
                  </div>
                  <p className="text-sm text-muted-foreground">Energy Savings</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${(facilityParams.currentEnergyUsage * 12 * facilityParams.energyCost * activeScenario.energySavings / 100).toLocaleString()}/year
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    +{activeScenario.qualityImprovement}pts
                  </div>
                  <p className="text-sm text-muted-foreground">Quality Score</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Premium pricing opportunity
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calculator className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    -{activeScenario.operationalSavings}%
                  </div>
                  <p className="text-sm text-muted-foreground">OpEx Reduction</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${(facilityParams.currentOpex * 12 * activeScenario.operationalSavings / 100).toLocaleString()}/year
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Investment Recommendation:</strong> This scenario shows strong financial returns with a 
              {roiCalculation.paybackPeriod.toFixed(1)}-year payback period and {roiCalculation.roi5Year.toFixed(1)}% 
              five-year ROI. The NPV of ${roiCalculation.npv.toLocaleString()} indicates this is a profitable investment.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>Move forward with this investment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Ready to proceed with this investment scenario?</p>
                  <p className="text-sm text-muted-foreground">
                    Create a formal investment proposal based on this analysis
                  </p>
                </div>
                <Button size="lg">
                  Create Investment Proposal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}