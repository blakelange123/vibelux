'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Link2, 
  RefreshCw, 
  Shield, 
  Zap,
  TrendingUp,
  Users,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

interface AutomationStatus {
  invoiceGeneration: {
    status: 'active' | 'error' | 'inactive';
    lastRun: Date;
    nextRun: Date;
    successRate: number;
  };
  paymentProcessing: {
    status: 'active' | 'error' | 'inactive';
    lastRun: Date;
    todayProcessed: number;
    todayAmount: number;
    failureRate: number;
  };
  utilityIntegration: {
    connectedAccounts: number;
    totalAccounts: number;
    lastSync: Date;
    dataQuality: number;
  };
  verification: {
    pendingValidations: number;
    completedToday: number;
    averageConfidence: number;
  };
}

export default function FinancialAutomationDashboard() {
  const [status, setStatus] = useState<AutomationStatus>({
    invoiceGeneration: {
      status: 'active',
      lastRun: new Date('2024-01-01T02:00:00'),
      nextRun: new Date('2024-02-01T02:00:00'),
      successRate: 98.5,
    },
    paymentProcessing: {
      status: 'active',
      lastRun: new Date(),
      todayProcessed: 47,
      todayAmount: 125340,
      failureRate: 2.1,
    },
    utilityIntegration: {
      connectedAccounts: 312,
      totalAccounts: 385,
      lastSync: new Date(),
      dataQuality: 94.2,
    },
    verification: {
      pendingValidations: 8,
      completedToday: 23,
      averageConfidence: 87.3,
    },
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'invoice',
      message: 'Generated invoice VL-2024-00145 for Green Acres Farm',
      amount: 3250,
      time: '10 minutes ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'payment',
      message: 'ACH payment collected from Sunrise Greenhouse',
      amount: 8420,
      time: '25 minutes ago',
      status: 'success',
    },
    {
      id: 3,
      type: 'utility',
      message: 'Synced PG&E data for 15 facilities',
      time: '1 hour ago',
      status: 'success',
    },
    {
      id: 4,
      type: 'payment',
      message: 'Payment failed for Valley Farms - retry scheduled',
      amount: 1850,
      time: '2 hours ago',
      status: 'error',
    },
    {
      id: 5,
      type: 'validation',
      message: 'Third-party verification completed with 92% confidence',
      time: '3 hours ago',
      status: 'success',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'inactive': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <FileText className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'utility': return <Zap className="h-4 w-4" />;
      case 'validation': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Financial Automation Dashboard</h2>
        <p className="text-gray-500 mt-2">
          Monitor and manage automated financial processes
        </p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Invoice Generation</CardTitle>
              <FileText className={`h-4 w-4 ${getStatusColor(status.invoiceGeneration.status)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.invoiceGeneration.successRate}%</div>
            <p className="text-xs text-gray-500">Success Rate</p>
            <div className="mt-2">
              <Badge variant={status.invoiceGeneration.status === 'active' ? 'default' : 'destructive'}>
                {status.invoiceGeneration.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Payment Processing</CardTitle>
              <CreditCard className={`h-4 w-4 ${getStatusColor(status.paymentProcessing.status)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(status.paymentProcessing.todayAmount / 1000).toFixed(1)}k</div>
            <p className="text-xs text-gray-500">Processed Today</p>
            <div className="mt-2 text-xs">
              {status.paymentProcessing.todayProcessed} transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Utility Integration</CardTitle>
              <Zap className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((status.utilityIntegration.connectedAccounts / status.utilityIntegration.totalAccounts) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-gray-500">Connected</p>
            <Progress 
              value={(status.utilityIntegration.connectedAccounts / status.utilityIntegration.totalAccounts) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Verification</CardTitle>
              <Shield className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.verification.averageConfidence}%</div>
            <p className="text-xs text-gray-500">Avg Confidence</p>
            <div className="mt-2 text-xs">
              {status.verification.pendingValidations} pending
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="utility">Utility Data</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Automation Status */}
            <Card>
              <CardHeader>
                <CardTitle>Automation Status</CardTitle>
                <CardDescription>Current state of automated processes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Invoice Generation</p>
                      <p className="text-sm text-gray-500">Next run: Feb 1, 2024 at 2:00 AM</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Now
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Payment Collection</p>
                      <p className="text-sm text-gray-500">Running daily at 2:00 PM EST</p>
                    </div>
                  </div>
                  <Badge>Active</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Utility Sync</p>
                      <p className="text-sm text-gray-500">73 accounts pending auth</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Weather Normalization</p>
                      <p className="text-sm text-gray-500">All facilities updated</p>
                    </div>
                  </div>
                  <Badge>Active</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest automated transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`mt-0.5 ${activity.status === 'error' ? 'text-red-500' : 'text-gray-400'}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.message}
                        </p>
                        <div className="flex items-center space-x-2">
                          {activity.amount && (
                            <span className="text-sm font-semibold">${activity.amount.toLocaleString()}</span>
                          )}
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System efficiency and reliability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Invoice Accuracy</span>
                    <span className="text-sm font-bold">99.2%</span>
                  </div>
                  <Progress value={99.2} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Payment Success Rate</span>
                    <span className="text-sm font-bold">97.9%</span>
                  </div>
                  <Progress value={97.9} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Verification</span>
                    <span className="text-sm font-bold">94.2%</span>
                  </div>
                  <Progress value={94.2} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-xs text-gray-500">Invoices This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">$3.2M</p>
                  <p className="text-xs text-gray-500">Collected MTD</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">15min</p>
                  <p className="text-xs text-gray-500">Avg Processing Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">0.3%</p>
                  <p className="text-xs text-gray-500">Error Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Action Required:</strong> 12 customers need to update their payment methods before the next billing cycle.
              <Button variant="link" className="pl-2">
                View Details →
              </Button>
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Automation</CardTitle>
              <CardDescription>Automated invoice generation and tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Invoice automation details would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Processing</CardTitle>
              <CardDescription>Automated payment collection and reconciliation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Payment processing details would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utility">
          <Card>
            <CardHeader>
              <CardTitle>Utility Data Integration</CardTitle>
              <CardDescription>Automated utility bill verification</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Utility integration details would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Validation</CardTitle>
              <CardDescription>Automated verification and auditing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Validation details would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}