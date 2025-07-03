'use client';

import React, { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Target, 
  Users, 
  MapPin,
  TrendingUp,
  DollarSign,
  Award,
  Info
} from 'lucide-react';
import { CreditDashboard } from '@/components/CreditDashboard';
import { MilestoneFunding } from '@/components/MilestoneFunding';
import { RegionalPools } from '@/components/RegionalPools';
import { ReferralDashboard } from '@/components/ReferralDashboard';

export default function CreditBuildingPage() {
  const { userId, isSignedIn } = useAuth();
  const [selectedTab, setSelectedTab] = useState('credit');

  // Mock facility ID - in production, this would come from user context
  const facilityId = `facility_${userId?.slice(-6) || 'demo'}`;

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Credit Building</h1>
          <p className="text-gray-400">Please sign in to access credit building features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Credit Building & Funding</h1>
          <p className="text-gray-400">
            Build business credit, access milestone funding, and connect with regional investment pools
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Credit Score</CardTitle>
              <Shield className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">720</div>
              <p className="text-xs text-gray-500">Good credit rating</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Available Funding</CardTitle>
              <Target className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$150K</div>
              <p className="text-xs text-gray-500">Milestone-based</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Regional Pools</CardTitle>
              <MapPin className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">3</div>
              <p className="text-xs text-gray-500">In your region</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Referral Earnings</CardTitle>
              <Award className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$2.5K</div>
              <p className="text-xs text-gray-500">From 3 referrals</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="credit" className="data-[state=active]:bg-gray-700">
              <Shield className="w-4 h-4 mr-2" />
              Credit Score
            </TabsTrigger>
            <TabsTrigger value="funding" className="data-[state=active]:bg-gray-700">
              <Target className="w-4 h-4 mr-2" />
              Funding
            </TabsTrigger>
            <TabsTrigger value="pools" className="data-[state=active]:bg-gray-700">
              <Users className="w-4 h-4 mr-2" />
              Regional Pools
            </TabsTrigger>
            <TabsTrigger value="referrals" className="data-[state=active]:bg-gray-700">
              <Award className="w-4 h-4 mr-2" />
              Referrals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credit" className="mt-6">
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  VibeLux Credit Building
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Build business credit through on-time payments and strong performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <TrendingUp className="h-8 w-8 text-green-400 mb-2" />
                    <h3 className="font-semibold text-white mb-1">Payment History</h3>
                    <p className="text-sm text-gray-400">35% of your credit score</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <DollarSign className="h-8 w-8 text-blue-400 mb-2" />
                    <h3 className="font-semibold text-white mb-1">Performance Metrics</h3>
                    <p className="text-sm text-gray-400">25% of your credit score</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <Award className="h-8 w-8 text-purple-400 mb-2" />
                    <h3 className="font-semibold text-white mb-1">Bureau Reporting</h3>
                    <p className="text-sm text-gray-400">Build external credit</p>
                  </div>
                </div>
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white mb-1">Why Build Credit with VibeLux?</p>
                      <p className="text-xs text-gray-400">
                        Your VibeLux credit score unlocks better funding terms, lower interest rates, 
                        and access to exclusive regional investment pools. We also report to major business credit bureaus.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <CreditDashboard facilityId={facilityId} userId={userId || 'demo'} />
          </TabsContent>

          <TabsContent value="funding" className="mt-6">
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Milestone-Based Funding
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Access capital that releases as you achieve performance milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3">How It Works</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                        <div>
                          <p className="text-sm font-medium text-white">Apply Based on Credit Score</p>
                          <p className="text-xs text-gray-400">Better credit = better terms</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                        <div>
                          <p className="text-sm font-medium text-white">Receive Initial 25%</p>
                          <p className="text-xs text-gray-400">Upon baseline verification</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                        <div>
                          <p className="text-sm font-medium text-white">Achieve Milestones</p>
                          <p className="text-xs text-gray-400">Energy, yield, and revenue targets</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</div>
                        <div>
                          <p className="text-sm font-medium text-white">Automatic Release</p>
                          <p className="text-xs text-gray-400">Funds released within 48 hours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-3">Interest Rates by Credit Score</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                        <span className="text-sm text-green-400">750+ Credit Score</span>
                        <span className="text-sm font-medium text-white">8% APR</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
                        <span className="text-sm text-blue-400">650-749 Credit Score</span>
                        <span className="text-sm font-medium text-white">12% APR</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-900/20 rounded-lg">
                        <span className="text-sm text-yellow-400">550-649 Credit Score</span>
                        <span className="text-sm font-medium text-white">16% APR</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <MilestoneFunding facilityId={facilityId} userId={userId || 'demo'} creditScore={720} />
          </TabsContent>

          <TabsContent value="pools" className="mt-6">
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Regional Investment Pools
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Join local investor groups to share risk and increase buying power
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3">Pool Benefits</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-300">Diversified risk across multiple facilities</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-sm text-gray-300">Collective expertise in due diligence</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-sm text-gray-300">Local market knowledge</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-sm text-gray-300">Volume discounts on terms</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-3">How Voting Works</h3>
                    <div className="space-y-2">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Voting Power</p>
                        <p className="text-sm text-white">1 vote per $25,000 invested</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Approval Threshold</p>
                        <p className="text-sm text-white">51-66% majority required</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Management Fee</p>
                        <p className="text-sm text-white">2-2.5% of successful investments</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <RegionalPools userId={userId || 'demo'} facilityId={facilityId} region="Pacific Northwest" />
          </TabsContent>

          <TabsContent value="referrals" className="mt-6">
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Referral Program
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Earn rewards by helping other growers join VibeLux and build their credit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3">Graduation Levels</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-orange-900/20 rounded-lg">
                        <Award className="h-5 w-5 text-orange-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Bronze (6+ months)</p>
                          <p className="text-xs text-gray-400">1% revenue share discount</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-600/20 rounded-lg">
                        <Award className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Silver (12+ months)</p>
                          <p className="text-xs text-gray-400">2% discount + API access</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-yellow-600/20 rounded-lg">
                        <Award className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Gold (24+ months)</p>
                          <p className="text-xs text-gray-400">3% discount + all features</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-3">Referral Rewards</h3>
                    <div className="space-y-2">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-400">You Earn</p>
                        <p className="text-sm text-white">$500 + 2% discount for 12 months</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-400">They Get</p>
                        <p className="text-sm text-white">1 month free + 5% discount for 6 months</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Milestone Bonuses</p>
                        <p className="text-sm text-white">Up to $1,500 additional rewards</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ReferralDashboard facilityId={facilityId} userId={userId || 'demo'} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}