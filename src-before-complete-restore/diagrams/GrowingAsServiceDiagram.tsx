'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowRight, Zap, DollarSign, Leaf, Building2, Users, TrendingUp, Shield, Cpu, Lightbulb } from 'lucide-react';

export default function GrowingAsServiceDiagram() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Growing as a Service (GaaS)</h1>
        <p className="text-xl text-muted-foreground">Complete cultivation technology platform with energy optimization</p>
        <div className="flex justify-center gap-4">
          <Badge variant="default" className="text-lg px-4 py-2">No Upfront Costs</Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">Performance-Based Pricing</Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">Guaranteed ROI</Badge>
        </div>
      </div>

      {/* Service Model Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Traditional Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-600">❌ High Upfront Costs</div>
              <div className="text-sm">$100K-500K initial investment</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-600">❌ Technology Risk</div>
              <div className="text-sm">Obsolescence, maintenance burden</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-600">❌ Expertise Gap</div>
              <div className="text-sm">Need specialized staff</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-600">❌ Energy Inefficiency</div>
              <div className="text-sm">No optimization, high utility bills</div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center">
          <ArrowRight className="h-12 w-12 text-green-600" />
        </div>

        <Card className="border-2 border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              VibeLux GaaS Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-600">✅ Zero Upfront Costs</div>
              <div className="text-sm">Pay from energy savings</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-600">✅ Latest Technology</div>
              <div className="text-sm">Continuous updates, AI optimization</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-600">✅ Expert Support</div>
              <div className="text-sm">24/7 monitoring, optimization team</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-600">✅ Guaranteed Savings</div>
              <div className="text-sm">Performance-based contracts</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Components */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Complete Service Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Cpu className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-700">Technology Platform</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• VibeLux software suite</li>
                <li>• Quantum optimization engine</li>
                <li>• AI-powered automation</li>
                <li>• IoT sensor networks</li>
                <li>• Real-time monitoring</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold text-green-700">Energy Optimization</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• HVAC smart controls</li>
                <li>• LED lighting optimization</li>
                <li>• Demand response automation</li>
                <li>• Peak shaving algorithms</li>
                <li>• Utility rebate management</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-purple-700">Expert Services</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Cultivation consulting</li>
                <li>• Energy audits & planning</li>
                <li>• Compliance management</li>
                <li>• Training & support</li>
                <li>• Performance optimization</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-bold text-orange-700">Financial Benefits</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Utility rebate processing</li>
                <li>• Energy cost reduction</li>
                <li>• Yield optimization</li>
                <li>• Risk mitigation</li>
                <li>• Guaranteed ROI</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Model Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Revenue Model & Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Before GaaS */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-red-600">Before VibeLux GaaS</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">$200K</div>
                    <div className="text-sm text-muted-foreground">Technology Investment</div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">$15K/mo</div>
                    <div className="text-sm text-muted-foreground">Energy Costs</div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">$8K/mo</div>
                    <div className="text-sm text-muted-foreground">IT/Maintenance</div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">18-36mo</div>
                    <div className="text-sm text-muted-foreground">Payback Period</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="h-8 w-8 text-green-600" />
            </div>

            {/* With GaaS */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-green-600">With VibeLux GaaS</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">$0</div>
                    <div className="text-sm text-muted-foreground">Upfront Investment</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">$12K/mo</div>
                    <div className="text-sm text-muted-foreground">Optimized Energy</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">$2K/mo</div>
                    <div className="text-sm text-muted-foreground">GaaS Service Fee</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">Day 1</div>
                    <div className="text-sm text-muted-foreground">Immediate Savings</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Net Benefit */}
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-center">Net Monthly Benefit</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600">$1K/mo</div>
                  <div className="text-sm text-muted-foreground">Immediate Cash Flow</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">$12K/yr</div>
                  <div className="text-sm text-muted-foreground">Annual Savings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">$60K</div>
                  <div className="text-sm text-muted-foreground">5-Year Value</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partnership Integration */}
      <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="text-2xl text-orange-800 flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            NSave Partnership Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-orange-700">Enhanced GaaS Offering</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-orange-600 mt-0.5" />
                  <span><strong>Guaranteed Rebates:</strong> NSave's utility relationships ensure rebate processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5" />
                  <span><strong>Accelerated ROI:</strong> Faster rebate processing improves cash flow</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-orange-600 mt-0.5" />
                  <span><strong>Broader Market:</strong> Access to NSave's customer network</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-orange-600 mt-0.5" />
                  <span><strong>Higher Savings:</strong> Maximized utility incentives</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-orange-700">Market Expansion Potential</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">200+</div>
                  <div className="text-xs text-muted-foreground">Cultivation Facilities</div>
                  <div className="text-xs">Potential Market</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">$25M</div>
                  <div className="text-xs text-muted-foreground">Annual Energy Spend</div>
                  <div className="text-xs">Estimated Market</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">15%</div>
                  <div className="text-xs text-muted-foreground">Target Reduction</div>
                  <div className="text-xs">Conservative Goal</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">$3.75M</div>
                  <div className="text-xs text-muted-foreground">Market Opportunity</div>
                  <div className="text-xs">Annual Savings Pool</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">GaaS Implementation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold relative z-10">
                  0
                </div>
                <div>
                  <h4 className="font-bold">Day 1-30: Rapid Deployment</h4>
                  <p className="text-sm text-muted-foreground">VibeLux installation, initial optimization, baseline measurement</p>
                  <div className="text-sm text-green-600 font-medium">Customer Investment: $0 | Immediate Monitoring Active</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold relative z-10">
                  60
                </div>
                <div>
                  <h4 className="font-bold">Day 60: Savings Verification</h4>
                  <p className="text-sm text-muted-foreground">Performance validation, rebate applications submitted</p>
                  <div className="text-sm text-green-600 font-medium">Monthly Savings: $3K-8K | GaaS Fee Starts</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold relative z-10">
                  180
                </div>
                <div>
                  <h4 className="font-bold">Month 6: Full Optimization</h4>
                  <p className="text-sm text-muted-foreground">AI learning complete, maximum efficiency achieved</p>
                  <div className="text-sm text-green-600 font-medium">Peak Performance: 25-40% Energy Reduction</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold relative z-10">
                  365
                </div>
                <div>
                  <h4 className="font-bold">Year 1: Proven ROI</h4>
                  <p className="text-sm text-muted-foreground">Full year performance data, rebates received</p>
                  <div className="text-sm text-green-600 font-medium">Customer Net Benefit: $36K-96K</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}