'use client';

import { useState, useEffect } from 'react';
import { InvestmentDataGenerator } from '@/lib/investment-data-generator';
import { 
  Investment, 
  Payment,
  PerformanceRecord,
  InvestmentType
} from '@/types/investment';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
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
  Calendar,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Receipt,
  Calculator
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface BillingData {
  investments: Investment[];
  performanceRecords: PerformanceRecord[];
  payments: Payment[];
  upcomingPayments: Payment[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  useEffect(() => {
    // Generate faux data
    const generatedData = InvestmentDataGenerator.generateFullDataset(5, 20, 15);
    
    // Generate payment records
    const payments: Payment[] = [];
    const upcomingPayments: Payment[] = [];
    
    generatedData.investments.forEach(investment => {
      // Generate historical payments
      const monthsSinceStart = Math.floor(
        (new Date().getTime() - investment.contractStartDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
      );
      
      for (let month = 0; month < monthsSinceStart; month++) {
        const paymentDate = new Date(investment.contractStartDate);
        paymentDate.setMonth(paymentDate.getMonth() + month);
        
        const performanceRecord = generatedData.performanceRecords.find(
          record => 
            record.investmentId === investment.id && 
            record.recordDate.getMonth() === paymentDate.getMonth()
        );
        
        let amount = 0;
        let paymentType: Payment['paymentType'] = 'service_fee';
        
        if (investment.investmentType === InvestmentType.GAAS || investment.investmentType === InvestmentType.HYBRID) {
          amount = investment.monthlyServiceFee;
          paymentType = 'service_fee';
        }
        
        if (investment.investmentType === InvestmentType.YEP || investment.investmentType === InvestmentType.HYBRID) {
          if (performanceRecord) {
            amount += performanceRecord.yepPaymentDue;
            paymentType = investment.investmentType === InvestmentType.HYBRID ? 'service_fee' : 'yield_share';
          }
        }
        
        const payment: Payment = {
          id: `pay_${investment.id}_${month}`,
          investmentId: investment.id,
          paymentType,
          amount,
          currency: 'USD',
          periodStart: paymentDate,
          periodEnd: new Date(paymentDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          status: month < monthsSinceStart - 1 ? 'processed' : 'pending',
          paymentDate: month < monthsSinceStart - 1 ? paymentDate : undefined,
          transactionId: month < monthsSinceStart - 1 ? `txn_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}` : undefined,
          baselineYield: performanceRecord?.baselineYieldPerSqft,
          actualYield: performanceRecord?.actualYieldPerSqft,
          improvementPercentage: performanceRecord?.yieldImprovementPercentage,
          createdAt: paymentDate
        };
        
        if (payment.status === 'processed') {
          payments.push(payment);
        } else {
          upcomingPayments.push(payment);
        }
      }
      
      // Generate next 3 months of upcoming payments
      for (let month = 0; month < 3; month++) {
        const paymentDate = new Date();
        paymentDate.setMonth(paymentDate.getMonth() + month + 1);
        
        let amount = 0;
        let paymentType: Payment['paymentType'] = 'service_fee';
        
        if (investment.investmentType === InvestmentType.GAAS || investment.investmentType === InvestmentType.HYBRID) {
          amount = investment.monthlyServiceFee;
          paymentType = 'service_fee';
        }
        
        if (investment.investmentType === InvestmentType.YEP || investment.investmentType === InvestmentType.HYBRID) {
          // Estimate based on target improvement
          const facility = generatedData.facilities.find(f => f.id === investment.facilityId);
          if (facility) {
            const estimatedImprovement = investment.targetYieldImprovement / 100;
            const yieldIncrease = facility.currentYieldPerSqft * estimatedImprovement;
            const monthlyRevenue = yieldIncrease * facility.activeGrowSqft * (facility.currentCyclesPerYear / 12) * facility.pricePerGram;
            amount += monthlyRevenue * (investment.yieldSharePercentage / 100);
          }
          paymentType = investment.investmentType === InvestmentType.HYBRID ? 'service_fee' : 'yield_share';
        }
        
        const upcomingPayment: Payment = {
          id: `pay_upcoming_${investment.id}_${month}`,
          investmentId: investment.id,
          paymentType,
          amount,
          currency: 'USD',
          periodStart: paymentDate,
          periodEnd: new Date(paymentDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          status: 'pending',
          createdAt: new Date()
        };
        
        upcomingPayments.push(upcomingPayment);
      }
    });
    
    // Add investment and facility data to the objects
    const enrichedInvestments = generatedData.investments.map(inv => ({
      ...inv,
      facility: generatedData.facilities.find(f => f.id === inv.facilityId),
      performanceRecords: generatedData.performanceRecords.filter(r => r.investmentId === inv.id)
    }));
    
    setData({
      investments: enrichedInvestments,
      performanceRecords: generatedData.performanceRecords,
      payments: payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      upcomingPayments: upcomingPayments.sort((a, b) => a.periodStart.getTime() - b.periodStart.getTime())
    });
    setLoading(false);
  }, []);

  if (loading || !data) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const { investments, payments, upcomingPayments, performanceRecords } = data;
  
  // Calculate summary metrics
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const monthlyRevenue = payments
    .filter(p => p.paymentDate && p.paymentDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, payment) => sum + payment.amount, 0);
  const projectedMonthlyRevenue = upcomingPayments
    .filter(p => p.periodStart < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Revenue by type
  const revenueByType = {
    gaas: payments.filter(p => p.paymentType === 'service_fee').reduce((sum, p) => sum + p.amount, 0),
    yep: payments.filter(p => p.paymentType === 'yield_share').reduce((sum, p) => sum + p.amount, 0),
    equipment: payments.filter(p => p.paymentType === 'equipment').reduce((sum, p) => sum + p.amount, 0)
  };
  
  // Prepare chart data
  const revenueChartData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - 11 + i);
    const monthPayments = payments.filter(p => 
      p.paymentDate && 
      p.paymentDate.getMonth() === date.getMonth() && 
      p.paymentDate.getFullYear() === date.getFullYear()
    );
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      gaas: monthPayments.filter(p => p.paymentType === 'service_fee').reduce((sum, p) => sum + p.amount, 0),
      yep: monthPayments.filter(p => p.paymentType === 'yield_share').reduce((sum, p) => sum + p.amount, 0),
      total: monthPayments.reduce((sum, p) => sum + p.amount, 0)
    };
  });

  const generateInvoice = (payment: Payment) => {
    const investment = investments.find(inv => inv.id === payment.investmentId);
    setSelectedInvestment(investment || null);
    setShowInvoiceDialog(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Billing & Revenue</h1>
          <p className="text-muted-foreground">Track payments and financial performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            Process Payments
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">
              All-time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{((projectedMonthlyRevenue / monthlyRevenue - 1) * 100).toFixed(1)}% next month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${upcomingPayments
                .filter(p => p.periodStart < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Due in next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.length}</div>
            <p className="text-xs text-muted-foreground">
              Generating revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
          <TabsTrigger value="performance">Performance Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue by investment type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="gaas" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981"
                    name="GaaS Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="yep" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#3b82f6"
                    name="YEP Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Type</CardTitle>
                <CardDescription>Distribution of payment types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'GaaS Service Fees', value: revenueByType.gaas, color: '#10b981' },
                        { name: 'YEP Revenue Share', value: revenueByType.yep, color: '#3b82f6' },
                        { name: 'Equipment', value: revenueByType.equipment, color: '#f59e0b' }
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performing Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>Top Revenue Generators</CardTitle>
                <CardDescription>Facilities by monthly revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments
                    .sort((a, b) => {
                      const aRevenue = payments
                        .filter(p => p.investmentId === a.id && p.paymentDate && 
                                p.paymentDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                        .reduce((sum, p) => sum + p.amount, 0);
                      const bRevenue = payments
                        .filter(p => p.investmentId === b.id && p.paymentDate && 
                                p.paymentDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                        .reduce((sum, p) => sum + p.amount, 0);
                      return bRevenue - aRevenue;
                    })
                    .slice(0, 5)
                    .map((investment, index) => {
                      const monthlyRev = payments
                        .filter(p => p.investmentId === investment.id && p.paymentDate && 
                                p.paymentDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                        .reduce((sum, p) => sum + p.amount, 0);
                      
                      return (
                        <div key={investment.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                              index === 0 ? 'bg-green-500' : 'bg-blue-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{investment.facility?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {investment.investmentType.toUpperCase()} • {investment.facility?.location}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${monthlyRev.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">per month</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All processed payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.slice(0, 20).map((payment) => {
                    const investment = investments.find(inv => inv.id === payment.investmentId);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.paymentDate?.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{investment?.facility?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {investment?.investmentType.toUpperCase()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.paymentType === 'yield_share' ? 'default' : 'secondary'}>
                            {payment.paymentType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.periodStart.toLocaleDateString()} - {payment.periodEnd.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">${payment.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Processed</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono">{payment.transactionId}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => generateInvoice(payment)}
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>Scheduled payments for the next 3 months</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingPayments.map((payment) => {
                    const investment = investments.find(inv => inv.id === payment.investmentId);
                    const daysUntilDue = Math.floor(
                      (payment.periodStart.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)
                    );
                    
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.periodStart.toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {daysUntilDue > 0 ? `In ${daysUntilDue} days` : 'Due today'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{investment?.facility?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {investment?.investmentType.toUpperCase()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.paymentType === 'yield_share' ? 'default' : 'secondary'}>
                            {payment.paymentType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">${payment.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={daysUntilDue < 7 ? 'destructive' : 'outline'}>
                            {daysUntilDue < 0 ? 'Overdue' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Send Reminder
                            </Button>
                            <Button size="sm">
                              Process
                            </Button>
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
          {/* YEP Performance Billing */}
          <Card>
            <CardHeader>
              <CardTitle>YEP Performance Billing</CardTitle>
              <CardDescription>Revenue sharing based on yield improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facility</TableHead>
                    <TableHead>Baseline Yield</TableHead>
                    <TableHead>Current Yield</TableHead>
                    <TableHead>Improvement</TableHead>
                    <TableHead>Revenue Share</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments
                    .filter(inv => inv.investmentType === InvestmentType.YEP || inv.investmentType === InvestmentType.HYBRID)
                    .map((investment) => {
                      const latestPerformance = investment.performanceRecords?.[0];
                      const facility = investment.facility;
                      
                      if (!latestPerformance || !facility) return null;
                      
                      const yieldIncrease = latestPerformance.actualYieldPerSqft - latestPerformance.baselineYieldPerSqft;
                      const monthlyRevenue = yieldIncrease * facility.activeGrowSqft * 
                                           (facility.currentCyclesPerYear / 12) * facility.pricePerGram;
                      const investorShare = monthlyRevenue * (investment.yieldSharePercentage / 100);
                      
                      return (
                        <TableRow key={investment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{facility.name}</p>
                              <p className="text-xs text-muted-foreground">{facility.location}</p>
                            </div>
                          </TableCell>
                          <TableCell>{latestPerformance.baselineYieldPerSqft.toFixed(1)} g/sqft</TableCell>
                          <TableCell>{latestPerformance.actualYieldPerSqft.toFixed(1)} g/sqft</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {latestPerformance.yieldImprovementPercentage > investment.minimumPerformanceThreshold ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className={`font-medium ${
                                latestPerformance.yieldImprovementPercentage > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                +{latestPerformance.yieldImprovementPercentage.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{investment.yieldSharePercentage}%</TableCell>
                          <TableCell className="font-medium">${investorShare.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="default">Active</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                    .filter(Boolean)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Billing Trends</CardTitle>
              <CardDescription>YEP payments based on actual yield improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart 
                  data={performanceRecords
                    .slice(0, 12)
                    .reverse()
                    .map(record => ({
                      date: new Date(record.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      improvement: record.yieldImprovementPercentage,
                      payment: record.yepPaymentDue
                    }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="improvement" 
                    stroke="#10b981" 
                    name="Yield Improvement %"
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="payment" 
                    stroke="#3b82f6" 
                    name="YEP Payment ($)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedInvestment?.facility?.name} - {selectedInvestment?.investmentType.toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Investor</h3>
                <p className="text-sm">VibeLux Capital Partners</p>
                <p className="text-sm text-muted-foreground">123 Investment Ave</p>
                <p className="text-sm text-muted-foreground">San Francisco, CA 94105</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Facility</h3>
                <p className="text-sm">{selectedInvestment?.facility?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedInvestment?.facility?.ownerName}</p>
                <p className="text-sm text-muted-foreground">{selectedInvestment?.facility?.location}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Payment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contract ID</span>
                  <span className="font-mono">{selectedInvestment?.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Investment Type</span>
                  <span>{selectedInvestment?.investmentType.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Billing Period</span>
                  <span>{new Date().toLocaleDateString()} - {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Charges</h3>
              <div className="space-y-2">
                {selectedInvestment?.investmentType !== InvestmentType.YEP && (
                  <div className="flex justify-between text-sm">
                    <span>Monthly Service Fee</span>
                    <span>${selectedInvestment?.monthlyServiceFee.toLocaleString()}</span>
                  </div>
                )}
                {selectedInvestment?.investmentType !== InvestmentType.GAAS && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Yield Improvement</span>
                      <span>+{selectedInvestment?.performanceRecords?.[0]?.yieldImprovementPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Revenue Share ({selectedInvestment?.yieldSharePercentage}%)</span>
                      <span>${selectedInvestment?.performanceRecords?.[0]?.yepPaymentDue.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-semibold">
              <span>Total Due</span>
              <span>
                ${((selectedInvestment?.monthlyServiceFee || 0) + 
                   (selectedInvestment?.performanceRecords?.[0]?.yepPaymentDue || 0)).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
                Close
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}