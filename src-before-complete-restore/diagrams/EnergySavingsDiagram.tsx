'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowRight, Zap, DollarSign, Leaf, TrendingDown, Building, Users } from 'lucide-react';

export default function EnergySavingsDiagram() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">VibeLux Energy Savings Program</h1>
        <p className="text-xl text-muted-foreground">Comprehensive utility rebate & efficiency platform for cultivation facilities</p>
        <div className="flex justify-center gap-4">
          <Badge variant="default" className="text-lg px-4 py-2">15-30% Energy Reduction</Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">$20K-80K Annual Savings</Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">Utility Rebate Eligible</Badge>
        </div>
      </div>

      {/* Main Flow Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Phase 1: Assessment */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <CardTitle className="text-blue-800">Energy Assessment</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-blue-600 mt-1" />
                <div className="text-sm">
                  <strong>Baseline Analysis</strong><br/>
                  Current kWh usage patterns
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 text-blue-600 mt-1" />
                <div className="text-sm">
                  <strong>Equipment Audit</strong><br/>
                  HVAC, lighting, dehumidification
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingDown className="h-4 w-4 text-blue-600 mt-1" />
                <div className="text-sm">
                  <strong>Inefficiency ID</strong><br/>
                  Peak demand, waste heat
                </div>
              </div>
            </div>
            
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="text-xs font-medium text-blue-800">TYPICAL FINDINGS</div>
              <div className="text-sm text-blue-700">
                • 40-60% HVAC waste<br/>
                • 20-30% lighting inefficiency<br/>
                • Poor demand management
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="hidden lg:flex items-center justify-center">
          <ArrowRight className="h-8 w-8 text-gray-400" />
        </div>

        {/* Phase 2: Optimization */}
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-green-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <CardTitle className="text-green-800">Smart Optimization</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-green-600 mt-1" />
                <div className="text-sm">
                  <strong>AI Control Systems</strong><br/>
                  Quantum-optimized HVAC
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingDown className="h-4 w-4 text-green-600 mt-1" />
                <div className="text-sm">
                  <strong>Demand Response</strong><br/>
                  Peak shaving automation
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Leaf className="h-4 w-4 text-green-600 mt-1" />
                <div className="text-sm">
                  <strong>VPD Optimization</strong><br/>
                  Perfect climate efficiency
                </div>
              </div>
            </div>
            
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="text-xs font-medium text-green-800">ENERGY REDUCTIONS</div>
              <div className="text-sm text-green-700">
                • 15-25% HVAC savings<br/>
                • 10-20% lighting reduction<br/>
                • 10-25% peak demand cut
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="hidden lg:flex items-center justify-center">
          <ArrowRight className="h-8 w-8 text-gray-400" />
        </div>

        {/* Phase 3: Rebates & ROI */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-purple-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <CardTitle className="text-purple-800">Utility Rebates</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-purple-600 mt-1" />
                <div className="text-sm">
                  <strong>Rebate Applications</strong><br/>
                  Automated filing & tracking
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-purple-600 mt-1" />
                <div className="text-sm">
                  <strong>NSave Partnership</strong><br/>
                  Multi-utility programs
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingDown className="h-4 w-4 text-purple-600 mt-1" />
                <div className="text-sm">
                  <strong>Performance Tracking</strong><br/>
                  Guaranteed savings verification
                </div>
              </div>
            </div>
            
            <div className="bg-purple-100 p-3 rounded-lg">
              <div className="text-xs font-medium text-purple-800">TYPICAL REBATES</div>
              <div className="text-sm text-purple-700">
                • $0.10-0.30/kWh saved<br/>
                • $50-200/kW demand reduction<br/>
                • Up to 50% project cost
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NSave Integration Section */}
      <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="text-2xl text-orange-800 flex items-center gap-2">
            <Users className="h-6 w-6" />
            NSave Partnership Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-bold text-orange-700">Utility Network Access</h3>
              <ul className="space-y-1 text-sm">
                <li>• 200+ utility partnerships</li>
                <li>• Pre-qualified rebate programs</li>
                <li>• Streamlined application process</li>
                <li>• Regional program expertise</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-orange-700">Technical Integration</h3>
              <ul className="space-y-1 text-sm">
                <li>• VibeLux energy data → NSave platform</li>
                <li>• Automated M&V reporting</li>
                <li>• Real-time savings verification</li>
                <li>• Compliance documentation</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-orange-700">Customer Benefits</h3>
              <ul className="space-y-1 text-sm">
                <li>• Single point of contact</li>
                <li>• Guaranteed rebate processing</li>
                <li>• Performance-based payments</li>
                <li>• Ongoing optimization support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROI Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Financial Impact Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Timeline visualization */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold relative z-10">
                    0
                  </div>
                  <div>
                    <h4 className="font-bold">Month 0-1: Assessment & Setup</h4>
                    <p className="text-sm text-muted-foreground">VibeLux deployment, energy audit, rebate pre-qualification</p>
                    <div className="text-sm text-green-600 font-medium">Cost: $5K-15K | Rebate Coverage: 50-75%</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold relative z-10">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold">Month 3: Optimization Active</h4>
                    <p className="text-sm text-muted-foreground">AI systems optimizing, demand response operational</p>
                    <div className="text-sm text-green-600 font-medium">Monthly Savings: $4K-12K</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold relative z-10">
                    6
                  </div>
                  <div>
                    <h4 className="font-bold">Month 6: Rebate Received</h4>
                    <p className="text-sm text-muted-foreground">Utility rebates processed, M&V documentation complete</p>
                    <div className="text-sm text-green-600 font-medium">Rebate Amount: $15K-75K</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold relative z-10">
                    12
                  </div>
                  <div>
                    <h4 className="font-bold">Year 1: Full ROI</h4>
                    <p className="text-sm text-muted-foreground">Complete payback through savings + rebates</p>
                    <div className="text-sm text-green-600 font-medium">Total Savings: $50K-150K | ROI: 300-800%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">15-30%</div>
                <div className="text-sm text-muted-foreground">Energy Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">12-24mo</div>
                <div className="text-sm text-muted-foreground">Payback Period</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">200-400%</div>
                <div className="text-sm text-muted-foreground">3-Year ROI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">$20K-80K</div>
                <div className="text-sm text-muted-foreground">Annual Savings</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}