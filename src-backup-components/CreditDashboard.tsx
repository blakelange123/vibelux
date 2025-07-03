'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  Shield,
  Award,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Building2,
  FileText,
  ExternalLink
} from 'lucide-react';
import { creditSystem, CreditProfile, PaymentRecord } from '@/lib/credit-building-system';

interface CreditDashboardProps {
  facilityId: string;
  userId: string;
}

export function CreditDashboard({ facilityId, userId }: CreditDashboardProps) {
  const [creditProfile, setCreditProfile] = useState<CreditProfile | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadCreditData();
  }, [facilityId]);

  const loadCreditData = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      // Mock data for demonstration
      const mockPaymentHistory: PaymentRecord[] = [
        {
          id: '1',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          amount: 5000,
          dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          paidDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
          status: 'on-time',
          daysLate: 0
        },
        {
          id: '2',
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          amount: 4800,
          dueDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
          paidDate: new Date(Date.now() - 54 * 24 * 60 * 60 * 1000),
          status: 'on-time',
          daysLate: 0
        },
        {
          id: '3',
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          amount: 5200,
          dueDate: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
          paidDate: new Date(Date.now() - 82 * 24 * 60 * 60 * 1000),
          status: 'late',
          daysLate: 3
        }
      ];

      setPaymentHistory(mockPaymentHistory);

      // Calculate credit score
      const mockPerformanceData = {
        production: { yieldPerSqFt: 0.28 },
        energy: { totalKwh: 95000 },
        quality: { microbialFailRate: 1.5 },
        spaceUtilization: { utilizationPercent: 75 },
        equipment: { otherEquipment: { avgDowntimeHours: 48 } }
      };

      const creditScore = creditSystem.calculateCreditScore(
        facilityId,
        mockPaymentHistory,
        mockPerformanceData as any,
        85 // reporting consistency
      );

      const profile: CreditProfile = {
        id: `credit_${facilityId}`,
        facilityId,
        creditScore,
        paymentHistory: mockPaymentHistory,
        performanceMetrics: {
          yieldConsistency: 85,
          energyEfficiency: 90,
          qualityMaintenance: 92,
          complianceRecord: 88,
          overallScore: 89
        },
        reportingConsistency: 85,
        verifiedData: true,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(),
        externalReporting: {
          enabled: true,
          bureaus: ['Experian Business', 'Dun & Bradstreet'],
          lastReported: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      };

      setCreditProfile(profile);
    } catch (error) {
      console.error('Error loading credit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCreditRating = (score: number): { rating: string; color: string } => {
    if (score >= 750) return { rating: 'Excellent', color: 'text-green-400' };
    if (score >= 700) return { rating: 'Good', color: 'text-blue-400' };
    if (score >= 650) return { rating: 'Fair', color: 'text-yellow-400' };
    if (score >= 600) return { rating: 'Average', color: 'text-orange-400' };
    return { rating: 'Poor', color: 'text-red-400' };
  };

  const getCreditScoreProgress = (score: number): number => {
    return ((score - 300) / 550) * 100; // 300-850 range
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading credit data...</div>
      </div>
    );
  }

  if (!creditProfile) {
    return (
      <Alert className="bg-red-900/20 border-red-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Unable to load credit profile</AlertDescription>
      </Alert>
    );
  }

  const { rating, color } = getCreditRating(creditProfile.creditScore);

  return (
    <div className="w-full space-y-6">
      {/* Credit Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              VibeLux Credit Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-4">
                <div className="text-5xl font-bold text-white">{creditProfile.creditScore}</div>
                <Badge className={`${color} bg-gray-800`}>{rating}</Badge>
              </div>
              <Progress value={getCreditScoreProgress(creditProfile.creditScore)} className="h-3" />
              <div className="flex justify-between text-xs text-gray-400">
                <span>300</span>
                <span>Credit Range</span>
                <span>850</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Payment History</CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {paymentHistory.filter(p => p.status === 'on-time').length}/{paymentHistory.length}
            </div>
            <p className="text-xs text-gray-500">On-time payments</p>
            <div className="mt-2">
              <Progress 
                value={(paymentHistory.filter(p => p.status === 'on-time').length / paymentHistory.length) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Credit Building</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              +{Math.round((creditProfile.creditScore - 600) / 6)} pts
            </div>
            <p className="text-xs text-gray-500">Last 6 months</p>
            {creditProfile.externalReporting.enabled && (
              <div className="mt-2 flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span className="text-xs text-gray-400">Reporting to bureaus</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
            Overview
          </TabsTrigger>
          <TabsTrigger value="factors" className="data-[state=active]:bg-gray-700">
            Score Factors
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gray-700">
            Payment History
          </TabsTrigger>
          <TabsTrigger value="reporting" className="data-[state=active]:bg-gray-700">
            Credit Reporting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Performance Metrics */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Performance Metrics</CardTitle>
              <CardDescription className="text-gray-400">
                Your facility's operational performance impacts credit score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Yield</span>
                    <span className="text-sm font-medium text-white">
                      {creditProfile.performanceMetrics.yieldConsistency}%
                    </span>
                  </div>
                  <Progress value={creditProfile.performanceMetrics.yieldConsistency} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Energy</span>
                    <span className="text-sm font-medium text-white">
                      {creditProfile.performanceMetrics.energyEfficiency}%
                    </span>
                  </div>
                  <Progress value={creditProfile.performanceMetrics.energyEfficiency} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Quality</span>
                    <span className="text-sm font-medium text-white">
                      {creditProfile.performanceMetrics.qualityMaintenance}%
                    </span>
                  </div>
                  <Progress value={creditProfile.performanceMetrics.qualityMaintenance} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Compliance</span>
                    <span className="text-sm font-medium text-white">
                      {creditProfile.performanceMetrics.complianceRecord}%
                    </span>
                  </div>
                  <Progress value={creditProfile.performanceMetrics.complianceRecord} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Building Tips */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Build Your Credit</CardTitle>
              <CardDescription className="text-gray-400">
                Actions to improve your VibeLux credit score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Make payments on time</p>
                    <p className="text-xs text-gray-400">Payment history accounts for 35% of your score</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Maintain consistent performance</p>
                    <p className="text-xs text-gray-400">Steady yield and quality metrics boost your score</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Report data regularly</p>
                    <p className="text-xs text-gray-400">Consistent reporting shows reliability</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Optimize resource usage</p>
                    <p className="text-xs text-gray-400">Efficient operations improve credit utilization</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-6 mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Score Breakdown</CardTitle>
              <CardDescription className="text-gray-400">
                How your credit score is calculated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-white">Payment History</span>
                    </div>
                    <span className="text-sm text-gray-400">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {paymentHistory.filter(p => p.status === 'on-time').length} on-time payments
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-white">Performance Metrics</span>
                    </div>
                    <span className="text-sm text-gray-400">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {creditProfile.performanceMetrics.overallScore}% overall performance
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">Credit Utilization</span>
                    </div>
                    <span className="text-sm text-gray-400">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">Resource efficiency score</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-white">Credit History Length</span>
                    </div>
                    <span className="text-sm text-gray-400">10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.floor((Date.now() - creditProfile.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000))} months
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium text-white">Reporting Consistency</span>
                    </div>
                    <span className="text-sm text-gray-400">10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{creditProfile.reportingConsistency}% consistency</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Simulator */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Score Simulator</CardTitle>
              <CardDescription className="text-gray-400">
                See how actions could impact your score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="bg-blue-900/20 border-blue-800">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Making all payments on time for 6 months could increase your score by +25-35 points
                  </AlertDescription>
                </Alert>
                <Alert className="bg-green-900/20 border-green-800">
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Improving yield consistency by 10% could add +15-20 points
                  </AlertDescription>
                </Alert>
                <Alert className="bg-purple-900/20 border-purple-800">
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    Reducing energy usage by 15% could boost your score by +10-15 points
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Payment History</CardTitle>
              <CardDescription className="text-gray-400">
                Your revenue sharing payment record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      {payment.status === 'on-time' ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">
                          ${payment.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          Due: {payment.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={payment.status === 'on-time' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                      {payment.daysLate > 0 && (
                        <p className="text-xs text-gray-400 mt-1">{payment.daysLate} days late</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-6 mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Credit Bureau Reporting</CardTitle>
              <CardDescription className="text-gray-400">
                Build business credit with major bureaus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Reporting Status */}
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="font-medium text-white">Active Reporting</span>
                    </div>
                    <Badge className="bg-green-800 text-green-200">Enabled</Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    Your payment history is being reported to:
                  </p>
                  <div className="space-y-2">
                    {creditProfile.externalReporting.bureaus.map((bureau) => (
                      <div key={bureau} className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{bureau}</span>
                        <span className="text-xs text-gray-500">
                          Last reported: {creditProfile.externalReporting.lastReported.toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="text-sm font-semibold text-purple-400 mb-3">Benefits of Credit Reporting</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Build Business Credit</p>
                        <p className="text-xs text-gray-400">
                          Establish creditworthiness beyond VibeLux platform
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Access Better Financing</p>
                        <p className="text-xs text-gray-400">
                          Qualify for traditional loans and credit lines
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ExternalLink className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Vendor Relationships</p>
                        <p className="text-xs text-gray-400">
                          Better terms with suppliers and partners
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => creditSystem.reportToCreditBureaus(creditProfile, paymentHistory)}
                  >
                    Update Credit Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Alert className="bg-gray-800 border-gray-700">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your financial data is encrypted and only shared with authorized credit bureaus. 
              You can disable reporting at any time in your settings.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}