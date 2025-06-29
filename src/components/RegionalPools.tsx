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
  Users,
  DollarSign,
  MapPin,
  TrendingUp,
  Vote,
  Shield,
  Award,
  AlertCircle,
  Info,
  Building2,
  BarChart3,
  Briefcase,
  HandCoins,
  Target,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { creditSystem, RegionalPool, PoolInvestment } from '@/lib/credit-building-system';

interface RegionalPoolsProps {
  userId: string;
  facilityId: string;
  region?: string;
}

export function RegionalPools({ userId, facilityId, region = 'Pacific Northwest' }: RegionalPoolsProps) {
  const [pools, setPools] = useState<RegionalPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<RegionalPool | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [newPoolName, setNewPoolName] = useState('');
  const [newPoolCapital, setNewPoolCapital] = useState('');

  useEffect(() => {
    loadPoolsData();
  }, [region]);

  const loadPoolsData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockPools: RegionalPool[] = [
        {
          id: 'pool_1',
          name: 'Pacific Northwest Growers Fund',
          region: 'Pacific Northwest',
          totalCapital: 2500000,
          availableCapital: 875000,
          participants: [
            { userId: 'user_1', investmentAmount: 50000, votingPower: 2, joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), earnings: 12500 },
            { userId: 'user_2', investmentAmount: 100000, votingPower: 4, joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), earnings: 18000 },
            { userId: 'user_3', investmentAmount: 75000, votingPower: 3, joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), earnings: 9500 },
            { userId: 'user_4', investmentAmount: 150000, votingPower: 6, joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), earnings: 15000 }
          ],
          investments: [
            {
              facilityId: 'facility_1',
              amount: 250000,
              approvalVotes: 75,
              status: 'active',
              proposedBy: 'user_2',
              terms: { interestRate: 0.12, duration: 24 }
            },
            {
              facilityId: 'facility_2',
              amount: 175000,
              approvalVotes: 82,
              status: 'active',
              proposedBy: 'user_1',
              terms: { interestRate: 0.10, duration: 18 }
            }
          ],
          rules: {
            minInvestment: 10000,
            maxInvestment: 250000,
            votingThreshold: 0.51,
            managementFee: 0.02
          },
          performance: {
            avgROI: 18.5,
            defaultRate: 2.1,
            activeFacilities: 8
          }
        },
        {
          id: 'pool_2',
          name: 'West Coast Cannabis Collective',
          region: 'Pacific Northwest',
          totalCapital: 1500000,
          availableCapital: 450000,
          participants: [
            { userId: 'user_5', investmentAmount: 25000, votingPower: 2, joinedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), earnings: 4500 },
            { userId: 'user_6', investmentAmount: 50000, votingPower: 3, joinedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), earnings: 6800 }
          ],
          investments: [
            {
              facilityId: 'facility_3',
              amount: 150000,
              approvalVotes: 68,
              status: 'proposed',
              proposedBy: 'user_5',
              terms: { interestRate: 0.14, duration: 24 }
            }
          ],
          rules: {
            minInvestment: 5000,
            maxInvestment: 100000,
            votingThreshold: 0.66,
            managementFee: 0.025
          },
          performance: {
            avgROI: 22.3,
            defaultRate: 3.5,
            activeFacilities: 5
          }
        }
      ];

      setPools(mockPools);
      setSelectedPool(mockPools[0]);
    } catch (error) {
      console.error('Error loading pools data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPool = async () => {
    if (!selectedPool || !investmentAmount || parseFloat(investmentAmount) <= 0) return;

    setLoading(true);
    try {
      const amount = parseFloat(investmentAmount);
      
      // Validate investment amount
      if (amount < selectedPool.rules.minInvestment) {
        alert(`Minimum investment is $${selectedPool.rules.minInvestment.toLocaleString()}`);
        return;
      }
      if (amount > selectedPool.rules.maxInvestment) {
        alert(`Maximum investment is $${selectedPool.rules.maxInvestment.toLocaleString()}`);
        return;
      }

      // Add participant to pool
      const newParticipant = {
        userId,
        investmentAmount: amount,
        votingPower: Math.floor(amount / 25000), // 1 vote per $25k
        joinedAt: new Date(),
        earnings: 0
      };

      selectedPool.participants.push(newParticipant);
      selectedPool.totalCapital += amount;
      selectedPool.availableCapital += amount;

      alert(`Successfully joined ${selectedPool.name} with $${amount.toLocaleString()} investment!`);
      setInvestmentAmount('');
      
      // Refresh pools
      await loadPoolsData();
    } catch (error) {
      console.error('Error joining pool:', error);
      alert('Failed to join pool');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePool = async () => {
    if (!newPoolName || !newPoolCapital || parseFloat(newPoolCapital) <= 0) return;

    setLoading(true);
    try {
      const capital = parseFloat(newPoolCapital);
      
      const newPool = creditSystem.createRegionalPool(
        newPoolName,
        region,
        capital,
        {
          minInvestment: 5000,
          maxInvestment: 100000,
          votingThreshold: 0.51,
          managementFee: 0.02
        }
      );

      // Add creator as first participant
      newPool.participants.push({
        userId,
        investmentAmount: capital,
        votingPower: Math.floor(capital / 25000),
        joinedAt: new Date(),
        earnings: 0
      });

      alert(`Successfully created ${newPoolName}!`);
      setShowCreatePool(false);
      setNewPoolName('');
      setNewPoolCapital('');
      
      // Refresh pools
      await loadPoolsData();
    } catch (error) {
      console.error('Error creating pool:', error);
      alert('Failed to create pool');
    } finally {
      setLoading(false);
    }
  };

  const calculatePoolMetrics = (pool: RegionalPool) => {
    const totalInvested = pool.totalCapital - pool.availableCapital;
    const utilizationRate = (totalInvested / pool.totalCapital) * 100;
    const avgInvestment = pool.participants.length > 0 
      ? pool.participants.reduce((sum, p) => sum + p.investmentAmount, 0) / pool.participants.length
      : 0;

    return {
      utilizationRate,
      avgInvestment,
      totalInvested
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'proposed': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  if (loading && pools.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading regional pools...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Pools</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pools.length}</div>
            <p className="text-xs text-gray-500">In {region}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Capital</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${pools.reduce((sum, p) => sum + p.totalCapital, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              ${pools.reduce((sum, p) => sum + p.availableCapital, 0).toLocaleString()} available
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Avg ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {pools.length > 0 
                ? (pools.reduce((sum, p) => sum + p.performance.avgROI, 0) / pools.length).toFixed(1)
                : '0'}%
            </div>
            <p className="text-xs text-gray-500">Annual return</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {pools.reduce((sum, p) => sum + p.performance.activeFacilities, 0)}
            </div>
            <p className="text-xs text-gray-500">Receiving funding</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {showCreatePool ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Create Regional Pool</CardTitle>
            <CardDescription className="text-gray-400">
              Start a new investment pool for your region
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-300">Pool Name</Label>
              <Input
                placeholder="e.g., Oregon Indoor Growers Fund"
                value={newPoolName}
                onChange={(e) => setNewPoolName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Initial Capital</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  placeholder="50000"
                  value={newPoolCapital}
                  onChange={(e) => setNewPoolCapital(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <p className="text-xs text-gray-500">
                Minimum: $25,000 to start a pool
              </p>
            </div>

            <Alert className="bg-blue-900/20 border-blue-800">
              <Info className="h-4 w-4" />
              <AlertDescription>
                As pool creator, you'll have admin privileges and earn an additional 0.5% on successful investments.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button 
                onClick={handleCreatePool}
                disabled={loading || !newPoolName || !newPoolCapital || parseFloat(newPoolCapital) < 25000}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Create Pool
              </Button>
              <Button 
                onClick={() => setShowCreatePool(false)}
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 border-gray-700"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="pools" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger value="pools" className="data-[state=active]:bg-gray-700">
              Available Pools
            </TabsTrigger>
            <TabsTrigger value="investments" className="data-[state=active]:bg-gray-700">
              Pool Investments
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-gray-700">
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pools" className="space-y-6 mt-6">
            {pools.map((pool) => {
              const metrics = calculatePoolMetrics(pool);
              const isParticipant = pool.participants.some(p => p.userId === userId);
              
              return (
                <Card key={pool.id} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-purple-400" />
                        <div>
                          <CardTitle className="text-white">{pool.name}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {pool.participants.length} participants • {pool.region}
                          </CardDescription>
                        </div>
                      </div>
                      {isParticipant && (
                        <Badge className="bg-green-800 text-green-200">Member</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Pool Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Total Capital</p>
                          <p className="text-lg font-semibold text-white">
                            ${pool.totalCapital.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Available</p>
                          <p className="text-lg font-semibold text-green-400">
                            ${pool.availableCapital.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Avg ROI</p>
                          <p className="text-lg font-semibold text-white">
                            {pool.performance.avgROI}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Default Rate</p>
                          <p className="text-lg font-semibold text-white">
                            {pool.performance.defaultRate}%
                          </p>
                        </div>
                      </div>

                      {/* Utilization */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Capital Utilization</span>
                          <span className="text-white">{metrics.utilizationRate.toFixed(0)}%</span>
                        </div>
                        <Progress value={metrics.utilizationRate} className="h-2" />
                      </div>

                      {/* Pool Rules */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-400">Investment Range</p>
                          <p className="text-white font-medium">
                            ${pool.rules.minInvestment.toLocaleString()} - ${pool.rules.maxInvestment.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-400">Voting & Fees</p>
                          <p className="text-white font-medium">
                            {(pool.rules.votingThreshold * 100).toFixed(0)}% approval • {(pool.rules.managementFee * 100).toFixed(1)}% fee
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => setSelectedPool(pool)}
                          variant="outline"
                          className="flex-1 bg-gray-800 hover:bg-gray-700 border-gray-700"
                        >
                          View Details
                        </Button>
                        {!isParticipant && (
                          <Button 
                            onClick={() => {
                              setSelectedPool(pool);
                              // Show join dialog
                            }}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                          >
                            Join Pool
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Create New Pool */}
            <Card className="bg-gray-800 border-gray-700 border-dashed">
              <CardContent className="text-center py-8">
                <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-white mb-2">Start Your Own Pool</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Create a regional investment pool for your area
                </p>
                <Button 
                  onClick={() => setShowCreatePool(true)}
                  variant="outline"
                  className="bg-gray-700 hover:bg-gray-600 border-gray-600"
                >
                  Create Pool
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investments" className="space-y-6 mt-6">
            {selectedPool && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">{selectedPool.name} - Investments</CardTitle>
                  <CardDescription className="text-gray-400">
                    Active and proposed facility investments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPool.investments.map((investment, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border ${
                          investment.status === 'active' ? 'bg-green-900/20 border-green-800' :
                          investment.status === 'proposed' ? 'bg-yellow-900/20 border-yellow-800' :
                          'bg-gray-800 border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <Building2 className={`h-5 w-5 ${getStatusColor(investment.status)}`} />
                              <div>
                                <p className="font-medium text-white">
                                  Facility #{investment.facilityId.slice(-4)}
                                </p>
                                <p className="text-sm text-gray-400">
                                  Proposed by {investment.proposedBy === userId ? 'You' : `Member ${investment.proposedBy.slice(-4)}`}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Amount</p>
                                <p className="text-white font-medium">
                                  ${investment.amount.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Terms</p>
                                <p className="text-white font-medium">
                                  {(investment.terms.interestRate * 100).toFixed(0)}% • {investment.terms.duration}mo
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={investment.status === 'active' ? 'default' : 'secondary'}>
                              {investment.status}
                            </Badge>
                            {investment.status === 'proposed' && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-400">Approval</p>
                                <p className="text-sm font-medium text-white">
                                  {investment.approvalVotes}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {investment.status === 'proposed' && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Vote className="h-4 w-4 text-purple-400" />
                                <span className="text-sm text-gray-400">
                                  Needs {((selectedPool.rules.votingThreshold * 100) - investment.approvalVotes).toFixed(0)}% more votes
                                </span>
                              </div>
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                Vote
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {selectedPool.investments.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        No investments yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 mt-6">
            {selectedPool && (
              <>
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Pool Performance</CardTitle>
                    <CardDescription className="text-gray-400">
                      Historical returns and member earnings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <BarChart3 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">
                            {selectedPool.performance.avgROI}%
                          </p>
                          <p className="text-xs text-gray-400">Average ROI</p>
                        </div>
                        <div className="text-center">
                          <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">
                            {(100 - selectedPool.performance.defaultRate).toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-400">Success Rate</p>
                        </div>
                        <div className="text-center">
                          <Award className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">
                            {selectedPool.performance.activeFacilities}
                          </p>
                          <p className="text-xs text-gray-400">Active Facilities</p>
                        </div>
                      </div>

                      {/* Top Earners */}
                      <div>
                        <h4 className="text-sm font-semibold text-purple-400 mb-3">Top Earners</h4>
                        <div className="space-y-2">
                          {selectedPool.participants
                            .sort((a, b) => b.earnings - a.earnings)
                            .slice(0, 5)
                            .map((participant, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    index === 0 ? 'bg-yellow-600' :
                                    index === 1 ? 'bg-gray-500' :
                                    index === 2 ? 'bg-orange-600' :
                                    'bg-gray-700'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">
                                      {participant.userId === userId ? 'You' : `Member ${participant.userId.slice(-4)}`}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Invested ${participant.investmentAmount.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-green-400">
                                    +${participant.earnings.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {((participant.earnings / participant.investmentAmount) * 100).toFixed(1)}% return
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Benefits of Pooling */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Benefits of Regional Pools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <HandCoins className="h-5 w-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-white">Shared Risk</p>
                          <p className="text-xs text-gray-400">
                            Diversify across multiple facilities in your region
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-white">Better Due Diligence</p>
                          <p className="text-xs text-gray-400">
                            Collective expertise in evaluating opportunities
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-white">Community Support</p>
                          <p className="text-xs text-gray-400">
                            Local knowledge and peer mentorship
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-white">Professional Management</p>
                          <p className="text-xs text-gray-400">
                            Experienced pool managers handle operations
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Join Pool Modal */}
      {selectedPool && !pools.some(p => p.participants.some(participant => participant.userId === userId)) && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Join {selectedPool.name}</CardTitle>
            <CardDescription className="text-gray-400">
              Become a member and start investing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Investment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  placeholder="25000"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <p className="text-xs text-gray-500">
                Min: ${selectedPool.rules.minInvestment.toLocaleString()} | 
                Max: ${selectedPool.rules.maxInvestment.toLocaleString()}
              </p>
            </div>

            <Alert className="bg-blue-900/20 border-blue-800">
              <Info className="h-4 w-4" />
              <AlertDescription>
                You'll receive voting power based on your investment amount and share in the pool's returns.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleJoinPool}
              disabled={loading || !investmentAmount || parseFloat(investmentAmount) < selectedPool.rules.minInvestment}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Join Pool
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}