'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Activity,
  Building2,
  Sprout,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Calculator,
  FileBarChart,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvestorRevenueShareView } from '@/components/InvestorRevenueShareView';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function InvestmentDashboard() {
  const { isSignedIn } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) return;
    
    fetchDashboardData();
  }, [isSignedIn]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/investments/portfolio');
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      // In development, use mock data when API is not available
      setDashboardData(getMockDashboardData());
      setError(null); // Clear error when using mock data
    } finally {
      setLoading(false);
    }
  };

  const getMockDashboardData = () => ({
    investor: {
      id: 'mock-investor-1',
      companyName: 'Demo Investment Company',
      investorType: 'FUND',
      accreditedStatus: 'ACCREDITED',
      targetIRR: 18,
      riskTolerance: 'MODERATE',
      investmentFocus: ['GaaS', 'Indoor Farming', 'Sustainable Agriculture']
    },
    portfolio: {
      totalInvested: 250000,
      currentValue: 285750,
      totalReturn: 35750,
      returnRate: 14.3,
      cashOnCash: 16.2,
      avgPaybackPeriod: 5.5,
      avgYieldImprovement: 22.5,
      totalEnergyProduced: 2150,
      totalCO2Saved: 1075,
      activeInvestments: 3,
      monthlyRevenue: 17200,
      lastMonthRevenue: 16400,
      gaasInvestments: 2,
      yepInvestments: 1,
      totalCapitalDeployed: 250000,
      totalInvestments: 3,
      portfolioIRR: 0.183,
      yepRevenue: 1800,
      gaasRevenue: 11700,
      avgEnergyReduction: 35
    },
    activeInvestments: [
      {
        id: '1',
        facilityName: 'GreenTech Indoor Farm A',
        location: 'Austin, TX',
        investmentAmount: 100000,
        currentValue: 115000,
        investmentType: 'GAAS',
        monthlyServiceFee: 8500,
        status: 'ACTIVE',
        roi: 15.0,
        riskScore: 35,
        minimumPerformanceThreshold: 15,
        targetEnergyReduction: 30,
        baselineYield: 10.5,
        startDate: new Date('2023-06-01').toISOString(),
        contractStartDate: new Date('2023-06-01').toISOString(),
        contractEndDate: new Date('2028-06-01').toISOString(),
        facility: {
          id: 'facility-1',
          name: 'GreenTech Indoor Farm A'
        },
        performanceRecords: [
          {
            yepPaymentDue: 2500,
            energyProduced: 125,
            co2Saved: 62.5,
            yieldImprovementPercentage: 18.5,
            kwhPerGram: 0.85
          }
        ]
      },
      {
        id: '2',
        facilityName: 'Vertical Greens Denver',
        location: 'Denver, CO',
        investmentAmount: 75000,
        currentValue: 82500,
        investmentType: 'YEP',
        status: 'ACTIVE',
        roi: 10.0,
        riskScore: 45,
        minimumPerformanceThreshold: 12,
        targetEnergyReduction: 25,
        baselineYield: 11.0,
        startDate: new Date('2023-08-15').toISOString(),
        contractStartDate: new Date('2023-08-15').toISOString(),
        contractEndDate: new Date('2026-08-15').toISOString(),
        facility: {
          id: 'facility-2',
          name: 'Vertical Greens Denver'
        },
        performanceRecords: [
          {
            yepPaymentDue: 1800,
            energyProduced: 98,
            co2Saved: 49,
            yieldImprovementPercentage: 22.0,
            kwhPerGram: 0.92
          }
        ]
      },
      {
        id: '3',
        facilityName: 'SolarLeaf Phoenix',
        location: 'Phoenix, AZ',
        investmentAmount: 75000,
        currentValue: 88250,
        investmentType: 'HYBRID',
        monthlyServiceFee: 3200,
        status: 'ACTIVE',
        roi: 17.7,
        riskScore: 55,
        minimumPerformanceThreshold: 18,
        targetEnergyReduction: 35,
        baselineYield: 12.8,
        startDate: new Date('2023-05-01').toISOString(),
        contractStartDate: new Date('2023-05-01').toISOString(),
        contractEndDate: new Date('2029-05-01').toISOString(),
        facility: {
          id: 'facility-3',
          name: 'SolarLeaf Phoenix'
        },
        performanceRecords: [
          {
            yepPaymentDue: 1500,
            energyProduced: 156,
            co2Saved: 78,
            yieldImprovementPercentage: 25.5,
            kwhPerGram: 0.78
          }
        ]
      }
    ],
    recentPerformance: [
      { 
        id: 'perf-1',
        month: 'January', 
        revenue: 13500, 
        target: 12000, 
        energyProduced: 320,
        investmentId: '1',
        facilityName: 'GreenTech Indoor Farm A',
        investmentType: 'GAAS',
        yieldImprovementPercentage: 18.5,
        yepPaymentDue: 0,
        totalProduced: 2500,
        energyCostSavings: 1250,
        recordDate: new Date('2024-01-15').toISOString(),
        actualYieldPerSqft: 12.5,
        qualityScore: 92,
        avgPpfd: 650,
        avgDli: 45.2,
        revenueGenerated: 13500
      },
      { 
        id: 'perf-2',
        month: 'February', 
        revenue: 14200, 
        target: 12500, 
        energyProduced: 335,
        investmentId: '2',
        facilityName: 'Vertical Greens Denver',
        investmentType: 'YEP',
        yieldImprovementPercentage: 22.3,
        yepPaymentDue: 1800,
        totalProduced: 2650,
        energyCostSavings: 1320,
        recordDate: new Date('2024-02-15').toISOString(),
        actualYieldPerSqft: 13.2,
        qualityScore: 88,
        avgPpfd: 620,
        avgDli: 43.1,
        revenueGenerated: 14200
      },
      { 
        id: 'perf-3',
        month: 'March', 
        revenue: 15100, 
        target: 13000, 
        energyProduced: 348,
        investmentId: '3',
        facilityName: 'SolarLeaf Phoenix',
        investmentType: 'HYBRID',
        yieldImprovementPercentage: 25.7,
        yepPaymentDue: 1500,
        totalProduced: 2800,
        energyCostSavings: 1400,
        recordDate: new Date('2024-03-15').toISOString(),
        actualYieldPerSqft: 14.5,
        qualityScore: 95,
        avgPpfd: 680,
        avgDli: 47.3,
        revenueGenerated: 15100
      },
      { 
        id: 'perf-4',
        month: 'April', 
        revenue: 15800, 
        target: 13500, 
        energyProduced: 365,
        investmentId: '1',
        facilityName: 'GreenTech Indoor Farm A',
        investmentType: 'GAAS',
        yieldImprovementPercentage: 19.2,
        yepPaymentDue: 0,
        totalProduced: 2900,
        energyCostSavings: 1450,
        recordDate: new Date('2024-04-15').toISOString(),
        actualYieldPerSqft: 13.8,
        qualityScore: 90,
        avgPpfd: 660,
        avgDli: 45.9,
        revenueGenerated: 15800
      },
      { 
        id: 'perf-5',
        month: 'May', 
        revenue: 16400, 
        target: 14000, 
        energyProduced: 378,
        investmentId: '2',
        facilityName: 'Vertical Greens Denver',
        investmentType: 'YEP',
        yieldImprovementPercentage: 23.8,
        yepPaymentDue: 1850,
        totalProduced: 3050,
        energyCostSavings: 1525,
        recordDate: new Date('2024-05-15').toISOString(),
        actualYieldPerSqft: 15.2,
        qualityScore: 93,
        avgPpfd: 670,
        avgDli: 46.6,
        revenueGenerated: 16400
      },
      { 
        id: 'perf-6',
        month: 'June', 
        revenue: 17200, 
        target: 14500, 
        energyProduced: 392,
        investmentId: '3',
        facilityName: 'SolarLeaf Phoenix',
        investmentType: 'HYBRID',
        yieldImprovementPercentage: 26.4,
        yepPaymentDue: 1600,
        totalProduced: 3200,
        energyCostSavings: 1600,
        recordDate: new Date('2024-06-15').toISOString(),
        actualYieldPerSqft: 16.1,
        qualityScore: 96,
        avgPpfd: 690,
        avgDli: 48.0,
        revenueGenerated: 17200
      }
    ]
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
          <p className="text-gray-600">Please sign in to access your investment dashboard</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="flex items-center justify-center min-h-screen">No data available</div>;
  }

  const { 
    investor = {}, 
    portfolio = {}, 
    activeInvestments = [], 
    recentPerformance = [] 
  } = dashboardData || {};

  // Calculate summary metrics
  const totalMonthlyRevenue = (activeInvestments || []).reduce((sum: number, inv: any) => {
    if (inv.investmentType === 'GAAS' || inv.investmentType === 'HYBRID') {
      return sum + inv.monthlyServiceFee;
    }
    // For YEP, calculate from recent performance
    const latestRecord = inv.performanceRecords?.[0];
    if (latestRecord) {
      return sum + latestRecord.yepPaymentDue;
    }
    return sum;
  }, 0);

  // Prepare chart data
  const performanceChartData = recentPerformance
    .slice(0, 6)
    .reverse()
    .map(record => ({
      date: new Date(record.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      yieldImprovement: record.yieldImprovementPercentage,
      energySavings: record.energyCostSavings
    }));

  const investmentTypeData = [
    { name: 'GaaS', value: portfolio?.gaasInvestments || 0, color: '#10b981' },
    { name: 'YEP', value: portfolio?.yepInvestments || 0, color: '#3b82f6' },
    { name: 'Hybrid', value: activeInvestments.filter((inv: any) => inv.investmentType === 'HYBRID').length, color: '#f59e0b' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Investment Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {investor.name}</p>
        </div>
        <Link href="/investment/opportunities">
          <Button size="lg">
            View New Opportunities
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deployed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${((portfolio?.totalCapitalDeployed || 0) / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">
              {portfolio?.totalInvestments || 0} active investments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMonthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{((totalMonthlyRevenue / ((portfolio?.totalCapitalDeployed || 250000) / 12)) * 100).toFixed(1)}% monthly return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Yield Improvement</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{(portfolio?.avgYieldImprovement || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all facilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio IRR</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((portfolio?.portfolioIRR || 0) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Target: {((investor?.targetIRR || 0.18) * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investments">Active Investments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue-sharing">Revenue Sharing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Performance</CardTitle>
                <CardDescription>Yield improvements and energy savings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="yieldImprovement" 
                      stroke="#10b981" 
                      name="Yield Improvement (%)"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="energySavings" 
                      stroke="#3b82f6" 
                      name="Energy Savings ($)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Investment Mix */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Mix</CardTitle>
                <CardDescription>Distribution by investment type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={investmentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {investmentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPerformance.slice(0, 5).map((record) => {
                  const investment = activeInvestments.find(inv => inv.id === record.investmentId);
                  return (
                    <div key={record.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          record.yieldImprovementPercentage > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{investment?.facility?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.recordDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          +{(record?.yieldImprovementPercentage || 0).toFixed(1)}% yield
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${(record?.yepPaymentDue || 0).toLocaleString()} payment
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Investments</CardTitle>
              <CardDescription>All current investment positions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facility</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Investment</TableHead>
                    <TableHead>Monthly Return</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Risk Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeInvestments.map((investment) => {
                    const latestPerformance = investment.performanceRecords?.[0];
                    const monthlyReturn = investment.investmentType === 'YEP'
                      ? latestPerformance?.yepPaymentDue || 0
                      : investment.monthlyServiceFee;
                    
                    return (
                      <TableRow key={investment.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{investment.facility?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {investment.facility?.location}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            investment.investmentType === 'GAAS' ? 'default' :
                            investment.investmentType === 'YEP' ? 'secondary' : 'outline'
                          }>
                            {investment.investmentType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            investment.status === 'ACTIVE' ? 'default' :
                            investment.status === 'PENDING' ? 'secondary' : 'outline'
                          }>
                            {investment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${(investment.totalInvestmentAmount / 1000).toFixed(0)}K</TableCell>
                        <TableCell>${monthlyReturn.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {latestPerformance && latestPerformance.yieldImprovementPercentage > investment.minimumPerformanceThreshold ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            )}
                            <span className="text-sm">
                              {latestPerformance ? `+${(latestPerformance.yieldImprovementPercentage || 0).toFixed(1)}%` : 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              (investment?.riskScore || 0) < 40 ? 'bg-green-500' :
                              (investment?.riskScore || 0) < 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm">{(investment?.riskScore || 0).toFixed(0)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Yield Performance by Facility */}
            <Card>
              <CardHeader>
                <CardTitle>Yield Performance by Facility</CardTitle>
                <CardDescription>Current vs baseline yields</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={activeInvestments.map(inv => {
                      const latestPerformance = inv.performanceRecords?.[0];
                      return {
                        name: inv.facility?.name?.split('-')[0] || 'Unknown',
                        baseline: inv.baselineYield,
                        current: latestPerformance?.actualYieldPerSqft || inv.baselineYield,
                        improvement: latestPerformance?.yieldImprovementPercentage || 0
                      };
                    })}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="baseline" fill="#94a3b8" name="Baseline Yield" />
                    <Bar dataKey="current" fill="#10b981" name="Current Yield" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Energy Reduction Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Energy Efficiency Gains</CardTitle>
                <CardDescription>kWh per gram reduction</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={activeInvestments.map(inv => {
                      const latestPerformance = inv.performanceRecords?.[0];
                      const facility = inv.facility;
                      const baselineKwhPerGram = facility ? 
                        (facility.currentEnergyUsageKwh / (facility.currentYieldPerSqft * facility.activeGrowSqft * facility.currentCyclesPerYear)) : 2.5;
                      
                      return {
                        name: inv.facility?.name?.split('-')[0] || 'Unknown',
                        target: inv.targetEnergyReduction,
                        actual: latestPerformance ? 
                          ((baselineKwhPerGram - latestPerformance.kwhPerGram) / baselineKwhPerGram * 100) : 0
                      };
                    })}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="target" fill="#94a3b8" name="Target Reduction %" />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual Reduction %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>Latest cycle data from all facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facility</TableHead>
                    <TableHead>Cycle Date</TableHead>
                    <TableHead>Yield/sqft</TableHead>
                    <TableHead>Quality Score</TableHead>
                    <TableHead>PPFD Avg</TableHead>
                    <TableHead>DLI Avg</TableHead>
                    <TableHead>Energy Cost</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPerformance.map((record) => {
                    const investment = activeInvestments.find(inv => inv.id === record.investmentId);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{investment?.facility?.name}</TableCell>
                        <TableCell>{new Date(record.recordDate).toLocaleDateString()}</TableCell>
                        <TableCell>{(record?.actualYieldPerSqft || 0).toFixed(1)}g</TableCell>
                        <TableCell>{(record?.qualityScore || 0).toFixed(0)}/100</TableCell>
                        <TableCell>{(record?.avgPpfd || 0).toFixed(0)} μmol</TableCell>
                        <TableCell>{(record?.avgDli || 0).toFixed(1)}</TableCell>
                        <TableCell>${(record?.energyCostSavings || 0).toFixed(0)}</TableCell>
                        <TableCell>${(record?.revenueGenerated || 0).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Risk Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Portfolio risk profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Low Risk (&lt;40)</span>
                      <span>{activeInvestments.filter(inv => (inv?.riskScore || 0) < 40).length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(activeInvestments.filter(inv => (inv?.riskScore || 0) < 40).length / activeInvestments.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Medium Risk (40-70)</span>
                      <span>{activeInvestments.filter(inv => (inv?.riskScore || 0) >= 40 && (inv?.riskScore || 0) < 70).length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(activeInvestments.filter(inv => (inv?.riskScore || 0) >= 40 && (inv?.riskScore || 0) < 70).length / activeInvestments.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>High Risk (&gt;70)</span>
                      <span>{activeInvestments.filter(inv => (inv?.riskScore || 0) >= 70).length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(activeInvestments.filter(inv => (inv?.riskScore || 0) >= 70).length / activeInvestments.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facility Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Facility Types</CardTitle>
                <CardDescription>Investment distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { 
                          name: 'Greenhouse', 
                          value: activeInvestments.filter(inv => inv.facility?.facilityType === 'greenhouse').length,
                          color: '#10b981'
                        },
                        { 
                          name: 'Indoor', 
                          value: activeInvestments.filter(inv => inv.facility?.facilityType === 'indoor').length,
                          color: '#3b82f6'
                        },
                        { 
                          name: 'Vertical', 
                          value: activeInvestments.filter(inv => inv.facility?.facilityType === 'vertical').length,
                          color: '#f59e0b'
                        }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Greenhouse</span>
                    </div>
                    <span>{activeInvestments.filter(inv => inv.facility?.facilityType === 'greenhouse').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Indoor</span>
                    </div>
                    <span>{activeInvestments.filter(inv => inv.facility?.facilityType === 'indoor').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span>Vertical</span>
                    </div>
                    <span>{activeInvestments.filter(inv => inv.facility?.facilityType === 'vertical').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>AI-generated analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Strong Performance</p>
                      <p className="text-xs text-muted-foreground">
                        {activeInvestments.filter(inv => {
                          const latest = inv.performanceRecords?.[0];
                          return latest && latest.yieldImprovementPercentage > inv.targetYieldImprovement;
                        }).length} facilities exceeding targets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Growth Opportunity</p>
                      <p className="text-xs text-muted-foreground">
                        YEP investments showing {(((portfolio?.yepRevenue || 0) / (portfolio?.gaasRevenue || 1) - 1) * 100).toFixed(0)}% higher returns
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Zap className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Energy Impact</p>
                      <p className="text-xs text-muted-foreground">
                        {(portfolio?.avgEnergyReduction || 0).toFixed(0)}% average energy reduction achieved
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Action Required</p>
                      <p className="text-xs text-muted-foreground">
                        {activeInvestments.filter((inv: any) => inv.status === 'PENDING').length} investments pending approval
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Timeline</CardTitle>
              <CardDescription>Contract terms and maturity dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeInvestments
                  .sort((a, b) => {
                    const aTime = a.contractEndDate ? new Date(a.contractEndDate).getTime() : 0;
                    const bTime = b.contractEndDate ? new Date(b.contractEndDate).getTime() : 0;
                    return aTime - bTime;
                  })
                  .map((investment) => {
                    const monthsRemaining = Math.floor(
                      investment.contractEndDate ? 
                        (new Date(investment.contractEndDate).getTime() - new Date().getTime()) / (30 * 24 * 60 * 60 * 1000) : 0
                    );
                    const percentComplete = 
                      investment.contractStartDate && investment.contractEndDate ?
                        ((new Date().getTime() - new Date(investment.contractStartDate).getTime()) / 
                      (new Date(investment.contractEndDate).getTime() - new Date(investment.contractStartDate).getTime())) * 100 : 0;
                    
                    return (
                      <div key={investment.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{investment.facility?.name}</span>
                          <span className="text-muted-foreground">
                            {monthsRemaining} months remaining
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(percentComplete, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{new Date(investment.contractStartDate).toLocaleDateString()}</span>
                          <span>{new Date(investment.contractEndDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Access Cards */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Investment Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Facility Platform */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/facility'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Building2 className="w-8 h-8 text-indigo-500" />
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle>Facility Platform</CardTitle>
                  <CardDescription>
                    View facilities seeking investment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Access facility dashboards and investment requests
                  </div>
                </CardContent>
              </Card>

              {/* Operations Monitor */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/investment/operations'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Users className="w-8 h-8 text-blue-500" />
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle>Operations Monitor</CardTitle>
                  <CardDescription>
                    Real-time monitoring of 50% yield partnerships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Track operator performance, alerts, and revenue splits
                  </div>
                </CardContent>
              </Card>
              
              {/* Cost Analysis */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/investment/cost-analysis'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Calculator className="w-8 h-8 text-green-500" />
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle>Cost Analysis</CardTitle>
                  <CardDescription>
                    Extract true upside from facility operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Identify cost savings and yield improvement opportunities
                  </div>
                </CardContent>
              </Card>
              
              {/* Deal Flow */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/investment/deal-flow'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <FileBarChart className="w-8 h-8 text-purple-500" />
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle>Deal Flow</CardTitle>
                  <CardDescription>
                    Manage investment pipeline and opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Review and approve new investment opportunities
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="revenue-sharing" className="space-y-4">
          <InvestorRevenueShareView 
            investmentId={investor.id}
            investments={activeInvestments.filter(inv => inv.investmentType === 'YEP' || inv.investmentType === 'HYBRID')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}