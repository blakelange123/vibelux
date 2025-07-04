import { Metadata } from 'next';
import EnergySavingsDiagram from '@/components/diagrams/EnergySavingsDiagram';
import GrowingAsServiceDiagram from '@/components/diagrams/GrowingAsServiceDiagram';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Zap, Users, TrendingUp, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'NSave Partnership Presentation | VibeLux Energy Solutions',
  description: 'Comprehensive overview of VibeLux energy savings programs and Growing as a Service model for utility rebate partnerships',
};

export default function NSavePresentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Executive Summary */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl text-blue-800">VibeLux × NSave Partnership</CardTitle>
                <p className="text-lg text-blue-600 mt-2">Transforming Cannabis Cultivation Through Energy Intelligence</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Live Demo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-blue-700">Energy Optimization</h3>
                <div className="text-2xl font-bold text-blue-800">15-30%</div>
                <p className="text-sm text-blue-600">Target energy reduction</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-bold text-green-700">Market Opportunity</h3>
                <div className="text-2xl font-bold text-green-800">$25M</div>
                <p className="text-sm text-green-600">Estimated energy spend</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-purple-700">Service Model</h3>
                <div className="text-2xl font-bold text-purple-800">$0</div>
                <p className="text-sm text-purple-600">Upfront customer cost</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-orange-700">Partnership Value</h3>
                <div className="text-2xl font-bold text-orange-800">200+</div>
                <p className="text-sm text-orange-600">Potential facilities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                For Cultivation Facilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Badge variant="default">Zero Upfront Investment</Badge>
                <p className="text-sm">Pay from energy savings, not capital</p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">Proven ROI</Badge>
                <p className="text-sm">15-30% energy reduction potential</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Risk-Free</Badge>
                <p className="text-sm">Performance guarantees & rebate assurance</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <Users className="h-5 w-5" />
                For NSave
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Badge variant="default">Proven Technology</Badge>
                <p className="text-sm">AI-powered optimization with track record</p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">Scalable Revenue</Badge>
                <p className="text-sm">Recurring revenue from service contracts</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Market Expansion</Badge>
                <p className="text-sm">Enter high-growth cannabis sector</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-700 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                For Utilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Badge variant="default">Demand Reduction</Badge>
                <p className="text-sm">Significant kW and kWh savings</p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">Grid Stability</Badge>
                <p className="text-sm">Automated demand response capabilities</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Program Success</Badge>
                <p className="text-sm">Guaranteed performance & compliance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="energy-program" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="energy-program">Energy Savings Program</TabsTrigger>
            <TabsTrigger value="gaas-model">Growing as a Service</TabsTrigger>
            <TabsTrigger value="implementation">Implementation Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="energy-program">
            <EnergySavingsDiagram />
          </TabsContent>

          <TabsContent value="gaas-model">
            <GrowingAsServiceDiagram />
          </TabsContent>

          <TabsContent value="implementation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Partnership Implementation Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Phase 1 */}
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-bold text-blue-700 mb-3">Phase 1: Partnership Foundation (Month 1-2)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold mb-2">Technical Integration</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• VibeLux API integration with NSave platform</li>
                          <li>• Automated M&V data sharing protocols</li>
                          <li>• Rebate application workflow setup</li>
                          <li>• Customer portal integration</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Business Development</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Joint sales training program</li>
                          <li>• Co-marketing material development</li>
                          <li>• Revenue sharing agreement</li>
                          <li>• Performance guarantee framework</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Phase 2 */}
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-xl font-bold text-green-700 mb-3">Phase 2: Pilot Program (Month 3-6)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold mb-2">Pilot Deployment</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• 5-10 cultivation facility pilots</li>
                          <li>• End-to-end process validation</li>
                          <li>• Performance data collection</li>
                          <li>• Customer satisfaction metrics</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Market Validation</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Utility rebate processing verification</li>
                          <li>• Customer acquisition cost analysis</li>
                          <li>• Financial model refinement</li>
                          <li>• Scalability assessment</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Phase 3 */}
                  <div className="border-l-4 border-purple-500 pl-6">
                    <h3 className="text-xl font-bold text-purple-700 mb-3">Phase 3: Market Expansion (Month 7-12)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold mb-2">Scale Operations</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Roll out to 50+ facilities</li>
                          <li>• Regional expansion strategy</li>
                          <li>• Additional utility partnerships</li>
                          <li>• Service team scaling</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Program Enhancement</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• AI optimization improvements</li>
                          <li>• New service offerings</li>
                          <li>• Advanced analytics features</li>
                          <li>• Performance optimization</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Success Metrics */}
                  <div className="bg-gradient-to-r from-blue-100 to-green-100 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Success Metrics & KPIs</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">25%</div>
                        <div className="text-sm text-muted-foreground">Min Energy Reduction</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">95%</div>
                        <div className="text-sm text-muted-foreground">Rebate Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">90%</div>
                        <div className="text-sm text-muted-foreground">Customer Retention</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">6mo</div>
                        <div className="text-sm text-muted-foreground">Payback Period</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to Transform Cannabis Energy Efficiency?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Partner with VibeLux to offer zero-upfront energy optimization to cultivation facilities, 
              guaranteed utility rebates, and proven 25-40% energy savings.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Schedule Partnership Meeting
              </Button>
              <Button size="lg" variant="outline">
                Request Technical Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}