'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  Zap,
  TrendingDown,
  DollarSign,
  Award,
  AlertCircle,
  CheckCircle,
  Download,
  Calendar,
  Activity,
  BarChart3,
  Gauge,
  Info,
  Shield,
  FileText,
  Send
} from 'lucide-react';
import { energyMonitoringClient, EnergySavingsVerification } from '@/lib/energy-monitoring-client';

interface EnergyVerificationDashboardProps {
  facilityId: string;
  baselineId?: string;
}

export function EnergyVerificationDashboard({ facilityId, baselineId }: EnergyVerificationDashboardProps) {
  const [verification, setVerification] = useState<EnergySavingsVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [energyData, setEnergyData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadVerificationData();
    loadEnergyTrends();
    loadAlerts();
  }, [facilityId, timeRange]);

  const loadVerificationData = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const verification = await energyMonitoringClient.getVerificationData(
        facilityId,
        startDate,
        endDate,
        baselineId
      );

      setVerification(verification);
    } catch (error) {
      console.error('Error loading verification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEnergyTrends = async () => {
    try {
      const data = await energyMonitoringClient.getEnergyTrends(facilityId, timeRange);
      setEnergyData(data);
    } catch (error) {
      console.error('Error loading energy trends:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const alerts = await energyMonitoringClient.getAlerts(facilityId);
      setAlerts(alerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const handleGenerateReport = async (format: 'pdf' | 'json' | 'csv') => {
    if (!verification) return;

    try {
      const report = await energyMonitoringClient.generateReport(verification, format);
      
      // Download the report
      const blob = new Blob([report], { 
        type: format === 'pdf' ? 'application/pdf' : format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `energy-verification-${facilityId}-${new Date().toISOString()}.${format}`;
      a.click();
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading verification data...</div>
      </div>
    );
  }

  const confidenceColor = verification?.savings.confidence! >= 90 ? 'text-green-400' : 
                         verification?.savings.confidence! >= 80 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="w-full space-y-6">
      {/* Header with Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Energy Saved</CardTitle>
            <Zap className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {verification?.savings.energySaved.toLocaleString()} kWh
            </div>
            <p className="text-xs text-gray-500">
              {verification?.savings.percentageReduction.toFixed(1)}% reduction
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Cost Saved</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${verification?.savings.costSaved.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">This {timeRange}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Peak Reduction</CardTitle>
            <Gauge className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {verification ? 
                ((verification.baselinePeriod.avgPeakDemand - verification.currentPeriod.avgPeakDemand) / 
                 verification.baselinePeriod.avgPeakDemand * 100).toFixed(0) : 0}%
            </div>
            <p className="text-xs text-gray-500">
              {verification?.currentPeriod.avgPeakDemand} kW peak
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">CO₂ Avoided</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(verification?.savings.co2Avoided! / 1000).toFixed(1)} tons
            </div>
            <p className="text-xs text-gray-500">Carbon reduction</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Confidence</CardTitle>
            <Shield className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${confidenceColor}`}>
              {verification?.savings.confidence}%
            </div>
            <p className="text-xs text-gray-500">Verification accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Energy Performance Analysis</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <Button
              key={range}
              size="sm"
              variant={timeRange === range ? 'default' : 'outline'}
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? 'bg-purple-600' : 'bg-gray-800 border-gray-700'}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger value="trends" className="data-[state=active]:bg-gray-700">
            Energy Trends
          </TabsTrigger>
          <TabsTrigger value="verification" className="data-[state=active]:bg-gray-700">
            Verification
          </TabsTrigger>
          <TabsTrigger value="realtime" className="data-[state=active]:bg-gray-700">
            Real-time
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gray-700">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6 mt-6">
          {/* Energy Consumption Chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Energy Consumption Comparison</CardTitle>
              <CardDescription className="text-gray-400">
                Baseline vs. actual consumption with savings highlighted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#999' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="baseline" 
                    stroke="#ef4444" 
                    fill="#ef444433" 
                    name="Baseline"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10b981" 
                    fill="#10b98133" 
                    name="Actual"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Savings Chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Daily Cost Savings</CardTitle>
              <CardDescription className="text-gray-400">
                Financial impact of energy optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={energyData.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    formatter={(value: any) => `$${value.toFixed(2)}`}
                  />
                  <Bar dataKey="savings" fill="#10b981" name="Savings ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6 mt-6">
          {/* Verification Details */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Savings Verification Certificate</CardTitle>
              <CardDescription className="text-gray-400">
                Third-party verifiable energy savings following IPMVP standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Certification Badge */}
              <div className="text-center py-6 bg-gray-800 rounded-lg">
                <Award className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {verification?.savings.percentageReduction.toFixed(1)}% Energy Reduction Verified
                </h3>
                <p className="text-gray-400">
                  Certification Date: {verification?.certificationDate.toLocaleDateString()}
                </p>
                <Badge className="mt-2 bg-green-800 text-green-200">
                  IPMVP Compliant
                </Badge>
              </div>

              {/* Verification Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-purple-400 mb-3">Baseline Period</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Period</span>
                      <span className="text-white">
                        {verification?.baselinePeriod.start.toLocaleDateString()} - 
                        {verification?.baselinePeriod.end.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Daily</span>
                      <span className="text-white">
                        {verification?.baselinePeriod.avgDailyKWh.toLocaleString()} kWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Cost</span>
                      <span className="text-white">
                        ${verification?.baselinePeriod.totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-3">Current Period</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Period</span>
                      <span className="text-white">
                        {verification?.currentPeriod.start.toLocaleDateString()} - 
                        {verification?.currentPeriod.end.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Daily</span>
                      <span className="text-white">
                        {verification?.currentPeriod.avgDailyKWh.toLocaleString()} kWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Cost</span>
                      <span className="text-white">
                        ${verification?.currentPeriod.totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adjustments */}
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-3">Normalization Adjustments</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">Weather</p>
                    <p className="text-lg font-semibold text-white">
                      {((verification?.adjustments.weather! - 1) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">Production</p>
                    <p className="text-lg font-semibold text-white">
                      {((verification?.adjustments.production! - 1) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">Schedule</p>
                    <p className="text-lg font-semibold text-white">
                      {((verification?.adjustments.schedule! - 1) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">Verification Confidence</span>
                  <span className={`text-sm font-bold ${confidenceColor}`}>
                    {verification?.savings.confidence}%
                  </span>
                </div>
                <Progress value={verification?.savings.confidence} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">
                  Based on data quality, completeness, and adjustment factors
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6 mt-6">
          {/* Real-time Monitoring */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                Live Energy Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Current Power</p>
                  <p className="text-2xl font-bold text-white">187.5 kW</p>
                  <p className="text-xs text-green-400">↓ 12% from baseline</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Power Factor</p>
                  <p className="text-2xl font-bold text-white">0.92</p>
                  <p className="text-xs text-blue-400">Optimal range</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Today's Usage</p>
                  <p className="text-2xl font-bold text-white">4,287 kWh</p>
                  <p className="text-xs text-gray-400">82% of daily target</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Cost Rate</p>
                  <p className="text-2xl font-bold text-white">$0.12/kWh</p>
                  <p className="text-xs text-yellow-400">Off-peak rate</p>
                </div>
              </div>

              {/* Recent Alerts */}
              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-3">Recent Alerts</h4>
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} className={`bg-gray-800 border-gray-700`}>
                      {alert.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                      )}
                      <AlertDescription className="text-gray-300">
                        <div className="flex items-center justify-between">
                          <span>{alert.message}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 mt-6">
          {/* Report Generation */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Verification Reports</CardTitle>
              <CardDescription className="text-gray-400">
                Generate certified energy savings reports for stakeholders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-900/20 border-blue-800">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  All reports are digitally signed and include verification methodology, 
                  baseline adjustments, and confidence intervals per IPMVP Option C standards.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      PDF Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4">
                      Comprehensive PDF with charts, certification, and detailed analysis
                    </p>
                    <Button 
                      onClick={() => handleGenerateReport('pdf')}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate PDF
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      CSV Export
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4">
                      Raw data export for custom analysis and integration
                    </p>
                    <Button 
                      onClick={() => handleGenerateReport('csv')}
                      variant="outline"
                      className="w-full bg-gray-700 hover:bg-gray-600 border-gray-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      API Export
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4">
                      JSON format for programmatic access and integration
                    </p>
                    <Button 
                      onClick={() => handleGenerateReport('json')}
                      variant="outline"
                      className="w-full bg-gray-700 hover:bg-gray-600 border-gray-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Get JSON
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Automated Reporting */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-base">Automated Monthly Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">
                        Automatically generate and send reports on the 1st of each month
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Recipients: facility manager, finance team, VibeLux
                      </p>
                    </div>
                    <Badge className="bg-green-800 text-green-200">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}