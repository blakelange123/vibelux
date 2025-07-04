'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Info,
  Unlock,
  Lock,
  BarChart3,
  Zap,
  Award,
  Calendar,
  FileText,
  ArrowRight
} from 'lucide-react';
import { creditSystem, MilestoneFunding as MilestoneFundingType, FundingMilestone } from '@/lib/credit-building-system';

interface MilestoneFundingProps {
  facilityId: string;
  userId: string;
  creditScore?: number;
}

export function MilestoneFunding({ facilityId, userId, creditScore = 650 }: MilestoneFundingProps) {
  const [activeFunding, setActiveFunding] = useState<MilestoneFundingType[]>([]);
  const [requestAmount, setRequestAmount] = useState('');
  const [selectedFunding, setSelectedFunding] = useState<MilestoneFundingType | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);

  useEffect(() => {
    loadFundingData();
  }, [facilityId]);

  const loadFundingData = async () => {
    // In production, fetch from API
    // Mock data for demonstration
    const mockFunding: MilestoneFundingType = {
      id: 'funding_1',
      facilityId,
      totalAmount: 100000,
      releasedAmount: 25000,
      milestones: [
        {
          id: 'initial',
          name: 'Initial Disbursement',
          description: 'Upfront funding upon approval',
          amount: 25000,
          releasePercentage: 25,
          criteria: {
            type: 'compliance',
            metric: 'baseline_verified',
            target: 1,
            operator: 'equal',
            verificationRequired: true
          },
          status: 'released',
          achievedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          releasedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'performance_1',
          name: '30-Day Performance',
          description: 'First month performance targets',
          amount: 25000,
          releasePercentage: 25,
          criteria: {
            type: 'performance',
            metric: 'energy_reduction',
            target: 5,
            operator: 'greater',
            verificationRequired: true
          },
          status: 'pending'
        },
        {
          id: 'performance_2',
          name: '60-Day Performance',
          description: 'Second month targets',
          amount: 25000,
          releasePercentage: 25,
          criteria: {
            type: 'performance',
            metric: 'yield_improvement',
            target: 5,
            operator: 'greater',
            verificationRequired: true
          },
          status: 'pending'
        },
        {
          id: 'final',
          name: 'Final Milestone',
          description: '90-day combined metrics',
          amount: 25000,
          releasePercentage: 25,
          criteria: {
            type: 'revenue',
            metric: 'revenue_increase',
            target: 10,
            operator: 'greater',
            verificationRequired: true
          },
          status: 'pending'
        }
      ],
      status: 'active',
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      terms: {
        interestRate: 0.12,
        repaymentType: 'revenue-share',
        maxTerm: 36
      }
    };

    setActiveFunding([mockFunding]);
    setSelectedFunding(mockFunding);
  };

  const handleRequestFunding = async () => {
    if (!requestAmount || parseFloat(requestAmount) <= 0) return;

    setLoading(true);
    try {
      const amount = parseFloat(requestAmount);
      const newFunding = creditSystem.createMilestoneFunding(
        facilityId,
        amount,
        { creditScore }
      );

      setActiveFunding([...activeFunding, newFunding]);
      setSelectedFunding(newFunding);
      setShowNewRequest(false);
      setRequestAmount('');
      
      alert(`Funding request for $${amount.toLocaleString()} submitted successfully!`);
    } catch (error) {
      console.error('Error requesting funding:', error);
      alert('Failed to submit funding request');
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneIcon = (milestone: FundingMilestone) => {
    switch (milestone.criteria.type) {
      case 'compliance': return <FileText className="h-5 w-5" />;
      case 'performance': return <BarChart3 className="h-5 w-5" />;
      case 'revenue': return <TrendingUp className="h-5 w-5" />;
      case 'time': return <Calendar className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case 'released': return 'text-green-400';
      case 'achieved': return 'text-blue-400';
      case 'pending': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const calculateProgress = (funding: MilestoneFundingType): number => {
    return (funding.releasedAmount / funding.totalAmount) * 100;
  };

  const getInterestRateDisplay = (rate: number): string => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Funding</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${activeFunding.reduce((sum, f) => sum + f.totalAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              {activeFunding.length} active {activeFunding.length === 1 ? 'program' : 'programs'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Released Funds</CardTitle>
            <Unlock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${activeFunding.reduce((sum, f) => sum + f.releasedAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              Available for use
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Pending Release</CardTitle>
            <Lock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${activeFunding.reduce((sum, f) => sum + (f.totalAmount - f.releasedAmount), 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              Unlock with milestones
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Avg Interest Rate</CardTitle>
            <Award className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {activeFunding.length > 0 
                ? getInterestRateDisplay(
                    activeFunding.reduce((sum, f) => sum + f.terms.interestRate, 0) / activeFunding.length
                  )
                : 'N/A'}
            </div>
            <p className="text-xs text-gray-500">
              Based on credit score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {activeFunding.length === 0 && !showNewRequest ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Active Funding</h3>
            <p className="text-gray-400 mb-6">
              Get milestone-based funding to grow your facility
            </p>
            <Button 
              onClick={() => setShowNewRequest(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Request Funding
            </Button>
          </CardContent>
        </Card>
      ) : showNewRequest ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Request Milestone Funding</CardTitle>
            <CardDescription className="text-gray-400">
              Get funding released as you achieve performance milestones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Credit Score Info */}
            <Alert className="bg-blue-900/20 border-blue-800">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your credit score of {creditScore} qualifies you for {
                  creditScore >= 700 ? 'our best rates' :
                  creditScore >= 600 ? 'competitive rates' :
                  'starter rates'
                }. Interest rate: {
                  creditScore >= 700 ? '8%' :
                  creditScore >= 600 ? '12%' :
                  '16%'
                } APR
              </AlertDescription>
            </Alert>

            {/* Funding Amount */}
            <div className="space-y-2">
              <Label className="text-gray-300">Funding Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  placeholder="50000"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <p className="text-xs text-gray-500">
                Minimum: $10,000 | Maximum: $500,000
              </p>
            </div>

            {/* Milestone Preview */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-purple-400">Funding Milestones</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">Initial (25%)</span>
                  </div>
                  <span className="text-sm text-white">Upon approval</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Month 1 (25%)</span>
                  </div>
                  <span className="text-sm text-white">5% energy reduction</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">Month 2 (25%)</span>
                  </div>
                  <span className="text-sm text-white">5% yield improvement</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-300">Month 3 (25%)</span>
                  </div>
                  <span className="text-sm text-white">10% revenue increase</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                onClick={handleRequestFunding}
                disabled={loading || !requestAmount || parseFloat(requestAmount) <= 0}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Submit Request
              </Button>
              <Button 
                onClick={() => setShowNewRequest(false)}
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 border-gray-700"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : selectedFunding ? (
        <Tabs defaultValue="milestones" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger value="milestones" className="data-[state=active]:bg-gray-700">
              Milestones
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-gray-700">
              Details
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-gray-700">
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="milestones" className="space-y-6 mt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Funding Progress</CardTitle>
                    <CardDescription className="text-gray-400">
                      ${selectedFunding.releasedAmount.toLocaleString()} of ${selectedFunding.totalAmount.toLocaleString()} released
                    </CardDescription>
                  </div>
                  <Badge variant={selectedFunding.status === 'active' ? 'default' : 'secondary'}>
                    {selectedFunding.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={calculateProgress(selectedFunding)} className="h-3 mb-6" />
                
                <div className="space-y-4">
                  {selectedFunding.milestones.map((milestone, index) => (
                    <div 
                      key={milestone.id}
                      className={`p-4 rounded-lg border ${
                        milestone.status === 'released' ? 'bg-green-900/20 border-green-800' :
                        milestone.status === 'achieved' ? 'bg-blue-900/20 border-blue-800' :
                        'bg-gray-800 border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={getMilestoneColor(milestone.status)}>
                            {getMilestoneIcon(milestone)}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{milestone.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">{milestone.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-300">
                                ${milestone.amount.toLocaleString()} ({milestone.releasePercentage}%)
                              </span>
                              {milestone.criteria.verificationRequired && (
                                <Badge variant="outline" className="text-xs">
                                  Verification Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {milestone.status === 'released' ? (
                            <div>
                              <CheckCircle className="h-5 w-5 text-green-400 ml-auto mb-1" />
                              <p className="text-xs text-gray-500">
                                Released {milestone.releasedAt?.toLocaleDateString()}
                              </p>
                            </div>
                          ) : milestone.status === 'achieved' ? (
                            <div>
                              <Clock className="h-5 w-5 text-blue-400 ml-auto mb-1" />
                              <p className="text-xs text-gray-500">
                                Achieved {milestone.achievedAt?.toLocaleDateString()}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <Lock className="h-5 w-5 text-gray-500 ml-auto mb-1" />
                              <p className="text-xs text-gray-500">Pending</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Milestone Criteria */}
                      {milestone.status === 'pending' && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-xs text-gray-400">
                            Requirement: {milestone.criteria.metric.replace(/_/g, ' ')} {
                              milestone.criteria.operator === 'greater' ? '>' :
                              milestone.criteria.operator === 'less' ? '<' :
                              '='
                            } {milestone.criteria.target}
                            {milestone.criteria.type === 'performance' && '%'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!showNewRequest && activeFunding.length < 3 && (
                  <div className="mt-6">
                    <Button 
                      onClick={() => setShowNewRequest(true)}
                      variant="outline"
                      className="w-full bg-gray-800 hover:bg-gray-700 border-gray-700"
                    >
                      Request Additional Funding
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 mt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Funding Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="text-white font-medium">
                      ${selectedFunding.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Interest Rate</span>
                    <span className="text-white font-medium">
                      {getInterestRateDisplay(selectedFunding.terms.interestRate)} APR
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Repayment Type</span>
                    <span className="text-white font-medium capitalize">
                      {selectedFunding.terms.repaymentType.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Max Term</span>
                    <span className="text-white font-medium">
                      {selectedFunding.terms.maxTerm} months
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white font-medium">
                      {selectedFunding.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Alert className="mt-6 bg-blue-900/20 border-blue-800">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Funds are released automatically when milestones are achieved and verified. 
                    Performance data is collected from your VibeLux dashboard.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 rounded-full p-1 mt-1">
                      <span className="text-xs text-white font-bold px-1.5">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Apply & Get Approved</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Based on your credit score and baseline metrics
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 rounded-full p-1 mt-1">
                      <span className="text-xs text-white font-bold px-1.5">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Receive Initial Funding</p>
                      <p className="text-xs text-gray-400 mt-1">
                        25% released upon baseline verification
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 rounded-full p-1 mt-1">
                      <span className="text-xs text-white font-bold px-1.5">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Achieve Milestones</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Hit performance targets to unlock funds
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 rounded-full p-1 mt-1">
                      <span className="text-xs text-white font-bold px-1.5">4</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Automatic Release</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Funds released within 48 hours of verification
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 mt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Current Performance</CardTitle>
                <CardDescription className="text-gray-400">
                  Track your progress toward upcoming milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Energy Reduction */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium text-white">Energy Reduction</span>
                      </div>
                      <span className="text-sm text-gray-400">Target: 5%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Current: 3% reduction</p>
                  </div>

                  {/* Yield Improvement */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-white">Yield Improvement</span>
                      </div>
                      <span className="text-sm text-gray-400">Target: 5%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Current: 2% improvement</p>
                  </div>

                  {/* Revenue Increase */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">Revenue Increase</span>
                      </div>
                      <span className="text-sm text-gray-400">Target: 10%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Current: 2.5% increase</p>
                  </div>
                </div>

                <Alert className="mt-6 bg-green-900/20 border-green-800">
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    You're on track to achieve your 30-day milestone. Keep up the great work!
                  </AlertDescription>
                </Alert>

                {/* Tips */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-purple-400 mb-3">Performance Tips</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-gray-500 mt-0.5" />
                      <p className="text-xs text-gray-400">
                        Optimize lighting schedules during off-peak hours for energy savings
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-gray-500 mt-0.5" />
                      <p className="text-xs text-gray-400">
                        Fine-tune nutrient delivery based on VibeLux ML recommendations
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-gray-500 mt-0.5" />
                      <p className="text-xs text-gray-400">
                        Maintain consistent environmental conditions for yield improvement
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}