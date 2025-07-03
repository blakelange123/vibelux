'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar as CalendarIcon,
  Upload,
  FileText,
  BarChart3,
  Zap,
  Droplets,
  Thermometer,
  Leaf,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';

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

export default function PerformanceReportingPage() {
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for performance metrics
  const performanceData = {
    yield: {
      actual: 1250,
      target: 1200,
      unit: 'lbs',
      trend: 'up' as const,
      change: 4.2
    },
    energy: {
      actual: 85,
      target: 80,
      unit: 'kWh/lb',
      trend: 'down' as const,
      change: -6.25
    },
    water: {
      actual: 0.8,
      target: 1.0,
      unit: 'gal/lb',
      trend: 'down' as const,
      change: -20
    },
    revenue: {
      actual: 87500,
      target: 84000,
      unit: '$',
      trend: 'up' as const,
      change: 4.2
    }
  };

  const yieldChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Actual Yield',
        data: [1100, 1150, 1180, 1200, 1230, 1250],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      },
      {
        label: 'Target Yield',
        data: [1200, 1200, 1200, 1200, 1200, 1200],
        borderColor: 'rgb(156, 163, 175)',
        borderDash: [5, 5],
        tension: 0.4
      }
    ]
  };

  const resourceChartData = {
    labels: ['Energy', 'Water', 'Labor', 'Nutrients'],
    datasets: [{
      data: [35, 20, 25, 20],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(251, 146, 60, 0.8)'
      ]
    }]
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const MetricCard = ({ 
    title, 
    actual, 
    target, 
    unit, 
    trend, 
    change,
    icon 
  }: { 
    title: string;
    actual: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'neutral';
    change: number;
    icon: React.ReactNode;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {actual.toLocaleString()} {unit}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            Target: {target.toLocaleString()} {unit}
          </p>
          <div className="flex items-center space-x-1">
            <TrendIcon trend={trend} />
            <span className={cn(
              "text-xs font-medium",
              trend === 'up' ? "text-green-600" : 
              trend === 'down' ? "text-red-600" : 
              "text-gray-600"
            )}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full",
                actual >= target ? "bg-green-600" : "bg-yellow-600"
              )}
              style={{ width: `${Math.min((actual / target) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Reporting</h2>
          <p className="text-muted-foreground">
            Track and report your facility performance to investors
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              title="Yield"
              actual={performanceData.yield.actual}
              target={performanceData.yield.target}
              unit={performanceData.yield.unit}
              trend={performanceData.yield.trend}
              change={performanceData.yield.change}
              icon={<Leaf className="h-4 w-4 text-green-600" />}
            />
            <MetricCard 
              title="Energy Efficiency"
              actual={performanceData.energy.actual}
              target={performanceData.energy.target}
              unit={performanceData.energy.unit}
              trend={performanceData.energy.trend}
              change={performanceData.energy.change}
              icon={<Zap className="h-4 w-4 text-yellow-600" />}
            />
            <MetricCard 
              title="Water Usage"
              actual={performanceData.water.actual}
              target={performanceData.water.target}
              unit={performanceData.water.unit}
              trend={performanceData.water.trend}
              change={performanceData.water.change}
              icon={<Droplets className="h-4 w-4 text-blue-600" />}
            />
            <MetricCard 
              title="Revenue"
              actual={performanceData.revenue.actual}
              target={performanceData.revenue.target}
              unit={performanceData.revenue.unit}
              trend={performanceData.revenue.trend}
              change={performanceData.revenue.change}
              icon={<DollarSign className="h-4 w-4 text-green-600" />}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Yield Performance</CardTitle>
                <CardDescription>Actual vs Target Yield (lbs)</CardDescription>
              </CardHeader>
              <CardContent>
                <Line 
                  data={yieldChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: false
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Allocation</CardTitle>
                <CardDescription>Cost breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <Doughnut 
                  data={resourceChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Milestones</CardTitle>
              <CardDescription>Key achievements and issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Exceeded yield target by 4.2%</p>
                    <p className="text-xs text-muted-foreground">June 15, 2024</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Reduced water usage by 20%</p>
                    <p className="text-xs text-muted-foreground">June 10, 2024</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Energy costs increased by 5%</p>
                    <p className="text-xs text-muted-foreground">June 5, 2024</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">HVAC maintenance required</p>
                    <p className="text-xs text-muted-foreground">June 1, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Production Report</CardTitle>
              <CardDescription>
                Submit your production metrics for {format(selectedDate, 'MMMM yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="harvest-yield">Harvest Yield (lbs)</Label>
                  <Input id="harvest-yield" type="number" placeholder="1250" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plant-count">Active Plant Count</Label>
                  <Input id="plant-count" type="number" placeholder="5000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="harvest-cycles">Harvest Cycles Completed</Label>
                  <Input id="harvest-cycles" type="number" placeholder="2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plant-mortality">Plant Mortality Rate (%)</Label>
                  <Input id="plant-mortality" type="number" placeholder="2.5" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Save Draft</Button>
                <Button>Submit Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage Report</CardTitle>
              <CardDescription>
                Track resource consumption and efficiency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="energy-usage">Energy Usage (kWh)</Label>
                  <Input id="energy-usage" type="number" placeholder="10625" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="water-usage">Water Usage (gallons)</Label>
                  <Input id="water-usage" type="number" placeholder="1000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co2-usage">CO2 Usage (lbs)</Label>
                  <Input id="co2-usage" type="number" placeholder="150" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nutrient-cost">Nutrient Cost ($)</Label>
                  <Input id="nutrient-cost" type="number" placeholder="2500" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Save Draft</Button>
                <Button>Submit Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Performance</CardTitle>
              <CardDescription>
                Report revenue and expenses for investor transparency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gross-revenue">Gross Revenue ($)</Label>
                  <Input id="gross-revenue" type="number" placeholder="87500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operating-expenses">Operating Expenses ($)</Label>
                  <Input id="operating-expenses" type="number" placeholder="45000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ebitda">EBITDA ($)</Label>
                  <Input id="ebitda" type="number" placeholder="42500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investor-distribution">Investor Distribution ($)</Label>
                  <Input id="investor-distribution" type="number" placeholder="15000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="financial-notes">Financial Notes</Label>
                <textarea 
                  id="financial-notes"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Add any relevant financial notes or explanations..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
                <Button>Submit Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}