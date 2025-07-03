'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Wrench, Users, Calendar, TrendingUp } from 'lucide-react';

import MaintenanceDashboard from '@/components/maintenance/MaintenanceDashboard';
import ServiceProviderDirectory from '@/components/service/ServiceProviderDirectory';
import ServiceRequestForm from '@/components/service/ServiceRequestForm';

export default function MaintenanceServicePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleCreateServiceRequest = () => {
    setShowRequestForm(true);
  };

  const handleServiceRequestSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setShowRequestForm(false);
        // TODO: Show success message and refresh data
      } else {
        throw new Error('Failed to create service request');
      }
    } catch (error) {
      console.error('Error creating service request:', error);
      // TODO: Show error message
    }
  };

  const handleServiceRequestCancel = () => {
    setShowRequestForm(false);
  };

  if (showRequestForm) {
    return (
      <ServiceRequestForm
        onSubmit={handleServiceRequestSubmit}
        onCancel={handleServiceRequestCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Maintenance & Service Network
              </h1>
              <p className="text-gray-300 text-lg">
                Comprehensive equipment maintenance and professional service management
              </p>
            </div>
            <Button
              onClick={handleCreateServiceRequest}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Service
            </Button>
          </div>

          {/* Key Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Wrench className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Predictive Maintenance</h3>
                    <p className="text-sm text-gray-300">AI-driven alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Certified Providers</h3>
                    <p className="text-sm text-gray-300">Verified technicians</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Smart Scheduling</h3>
                    <p className="text-sm text-gray-300">Automated planning</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Performance Guarantees</h3>
                    <p className="text-sm text-gray-300">SLA enforcement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-white/95 backdrop-blur border-white/20">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b bg-white/50">
                <TabsList className="grid w-full grid-cols-4 bg-transparent border-none">
                  <TabsTrigger 
                    value="dashboard" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger 
                    value="providers"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Providers
                  </TabsTrigger>
                  <TabsTrigger 
                    value="requests"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Requests
                  </TabsTrigger>
                  <TabsTrigger 
                    value="marketplace"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Marketplace
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="dashboard" className="m-0">
                <MaintenanceDashboard />
              </TabsContent>

              <TabsContent value="providers" className="m-0">
                <ServiceProviderDirectory />
              </TabsContent>

              <TabsContent value="requests" className="m-0">
                <div className="p-6">
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">Service Requests</h3>
                    <p className="text-gray-600 mb-6">
                      Manage and track your service requests
                    </p>
                    <Button onClick={handleCreateServiceRequest}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Request
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="marketplace" className="m-0">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Marketplace Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Marketplace Insights</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Active Providers</span>
                          <Badge variant="secondary">247</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg Response Time</span>
                          <Badge variant="secondary">2.3 hours</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Success Rate</span>
                          <Badge variant="secondary">97.8%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg Rating</span>
                          <Badge variant="secondary">4.7/5.0</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Popular Services */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Popular Services</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">HVAC Maintenance</span>
                          <Badge variant="outline">42%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Lighting Repair</span>
                          <Badge variant="outline">28%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Irrigation Service</span>
                          <Badge variant="outline">18%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Electrical Work</span>
                          <Badge variant="outline">12%</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm">
                          <div className="font-medium">HVAC Service Completed</div>
                          <div className="text-gray-600">Greenhouse A - 2 hours ago</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">New Provider Verified</div>
                          <div className="text-gray-600">GreenTech Solutions - 4 hours ago</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">Maintenance Alert</div>
                          <div className="text-gray-600">LED Driver Replacement - 6 hours ago</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Service Categories */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Service Categories</CardTitle>
                      <p className="text-sm text-gray-600">
                        Browse available services by category
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { name: 'Lighting Systems', count: 45, color: 'bg-blue-100 text-blue-800' },
                          { name: 'HVAC & Climate', count: 38, color: 'bg-green-100 text-green-800' },
                          { name: 'Irrigation', count: 32, color: 'bg-cyan-100 text-cyan-800' },
                          { name: 'Electrical', count: 28, color: 'bg-yellow-100 text-yellow-800' },
                          { name: 'Automation', count: 24, color: 'bg-purple-100 text-purple-800' },
                          { name: 'Pest Management', count: 19, color: 'bg-red-100 text-red-800' },
                          { name: 'Installation', count: 15, color: 'bg-indigo-100 text-indigo-800' },
                          { name: 'Emergency', count: 12, color: 'bg-orange-100 text-orange-800' },
                        ].map((category) => (
                          <Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4 text-center">
                              <div className="text-lg font-semibold">{category.count}</div>
                              <div className="text-sm text-gray-600 mb-2">{category.name}</div>
                              <Badge className={category.color}>
                                Active Providers
                              </Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}