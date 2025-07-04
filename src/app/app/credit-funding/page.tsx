'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  DollarSign,
  Users,
  TrendingUp,
  Building2,
  Target,
  Award,
  Globe,
  ArrowRight,
  CheckCircle,
  Info,
  Calculator,
  Handshake,
  MapPin
} from 'lucide-react';
import { CreditDashboard } from '@/components/CreditDashboard';
import { MilestoneFunding } from '@/components/MilestoneFunding';
import { RegionalPools } from '@/components/RegionalPools';
import { ReferralDashboard } from '@/components/ReferralDashboard';

export default function CreditFundingPage() {
  const { isSignedIn, userId } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock facility ID for demo purposes
  const facilityId = 'facility_demo_123';

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-400">Access to credit and funding features requires authentication.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Credit & Funding</h1>
          <p className="text-gray-400">
            Build credit, access funding, and grow with the VibeLux community
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 border-gray-700 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
              <Building2 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="credit" className="data-[state=active]:bg-gray-700">
              <Shield className="h-4 w-4 mr-2" />
              Credit Score
            </TabsTrigger>
            <TabsTrigger value="funding" className="data-[state=active]:bg-gray-700">
              <Target className="h-4 w-4 mr-2" />
              Milestone Funding
            </TabsTrigger>
            <TabsTrigger value="pools" className="data-[state=active]:bg-gray-700">
              <Users className="h-4 w-4 mr-2" />
              Regional Pools
            </TabsTrigger>
            <TabsTrigger value="referrals" className="data-[state=active]:bg-gray-700">
              <Handshake className="h-4 w-4 mr-2" />
              Referrals
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Credit Score</CardTitle>
                  <Shield className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">725</div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <p className="text-xs text-green-400">+15 this month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Available Funding</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">$150K</div>
                  <p className="text-xs text-gray-500">Based on credit score</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Active Referrals</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">3</div>
                  <p className="text-xs text-gray-500">$1,500 earned</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Pool Investments</CardTitle>
                  <Globe className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">$25K</div>
                  <p className="text-xs text-gray-500">18.5% avg ROI</p>
                </CardContent>
              </Card>
            </div>

            {/* Featured Programs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Credit Building */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400" />
                    VibeLux Credit Building
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Build business credit with your revenue sharing payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">300-850 credit score range</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Report to major business bureaus</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Performance-based scoring</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedTab('credit')}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    View Credit Score
                  </Button>
                </CardContent>
              </Card>

              {/* Milestone Funding */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    Milestone-Based Funding
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Get funding released as you achieve performance milestones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">$10K - $500K available</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">8-16% APR based on credit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Performance-triggered releases</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedTab('funding')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Request Funding
                  </Button>
                </CardContent>
              </Card>

              {/* Regional Pools */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-yellow-400" />
                    Regional Investment Pools
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Join community pools for collective investment power
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Democratic voting system</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">20%+ average returns</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Risk diversification</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedTab('pools')}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    Explore Pools
                  </Button>
                </CardContent>
              </Card>

              {/* Referral Program */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Handshake className="h-5 w-5 text-green-400" />
                    Referral & Growth Program
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Earn rewards by helping other growers join VibeLux
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">$500 cash bonus per referral</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">2% revenue share discount</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Graduation level benefits</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedTab('referrals')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Start Referring
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Getting Started Guide */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Getting Started with Credit & Funding</CardTitle>
                <CardDescription className="text-gray-400">
                  Follow these steps to maximize your opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="bg-purple-600 rounded-full p-3 w-fit">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h4 className="font-semibold text-white">Establish Your Credit</h4>
                    <p className="text-sm text-gray-400">
                      Start making revenue sharing payments on time to build your VibeLux credit score.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTab('credit')}
                      className="bg-gray-800 hover:bg-gray-700 border-gray-700"
                    >
                      Check Score <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-blue-600 rounded-full p-3 w-fit">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h4 className="font-semibold text-white">Access Funding</h4>
                    <p className="text-sm text-gray-400">
                      Apply for milestone-based funding to expand your operation with performance guarantees.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTab('funding')}
                      className="bg-gray-800 hover:bg-gray-700 border-gray-700"
                    >
                      Apply Now <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-green-600 rounded-full p-3 w-fit">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h4 className="font-semibold text-white">Grow Together</h4>
                    <p className="text-sm text-gray-400">
                      Join regional pools and refer other growers to earn rewards and build community.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTab('referrals')}
                      className="bg-gray-800 hover:bg-gray-700 border-gray-700"
                    >
                      Get Started <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Summary */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-800">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Award className="h-12 w-12 text-purple-400 mx-auto" />
                  <h3 className="text-xl font-bold text-white">
                    Complete Financial Ecosystem for Growers
                  </h3>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    VibeLux provides the only integrated platform combining credit building, 
                    milestone funding, community investment, and growth rewards specifically 
                    designed for the controlled environment agriculture industry.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Badge className="bg-purple-800 text-purple-200">Credit Building</Badge>
                    <Badge className="bg-blue-800 text-blue-200">Smart Funding</Badge>
                    <Badge className="bg-green-800 text-green-200">Community Growth</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credit Dashboard Tab */}
          <TabsContent value="credit">
            <CreditDashboard facilityId={facilityId} userId={userId!} />
          </TabsContent>

          {/* Milestone Funding Tab */}
          <TabsContent value="funding">
            <MilestoneFunding facilityId={facilityId} userId={userId!} creditScore={725} />
          </TabsContent>

          {/* Regional Pools Tab */}
          <TabsContent value="pools">
            <RegionalPools userId={userId!} region="Pacific Northwest" />
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <ReferralDashboard facilityId={facilityId} userId={userId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}