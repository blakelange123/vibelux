'use client';

import { useState } from 'react';
import { IntegrationsDashboard } from '@/components/integrations/IntegrationsDashboard';
import { ClimateComputerAutoDiscovery } from '@/components/ClimateComputerAutoDiscovery';
import { ClimateIntegrationManager } from '@/components/ClimateIntegrationManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-950">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-gray-800">
          <TabsList className="bg-transparent border-0 px-6 pt-4">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              All Integrations
            </TabsTrigger>
            <TabsTrigger 
              value="discovery" 
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Climate Computer Discovery
            </TabsTrigger>
            <TabsTrigger 
              value="climate" 
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Climate Integration Manager
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="mt-0">
          <IntegrationsDashboard />
        </TabsContent>
        
        <TabsContent value="discovery" className="mt-0">
          <ClimateComputerAutoDiscovery />
        </TabsContent>
        
        <TabsContent value="climate" className="mt-0">
          <ClimateIntegrationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}