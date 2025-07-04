'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Dynamically import the dashboard to avoid SSR issues
const EnergyVerificationDashboard = dynamic(
  () => import('@/components/EnergyVerificationDashboard').then(mod => ({ default: mod.EnergyVerificationDashboard })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading Energy Dashboard...</span>
      </div>
    )
  }
);

export default function EnergyMonitoringPage() {
  // Test facility ID - in production this would come from user context
  const facilityId = 'test-facility-001';
  const baselineId = 'baseline-001'; // Optional

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Energy Monitoring & Verification</h1>
          <p className="text-gray-400">
            Real-time energy savings tracking with IPMVP-certified verification
          </p>
        </div>
        
        <EnergyVerificationDashboard 
          facilityId={facilityId} 
          baselineId={baselineId}
        />
      </div>
    </div>
  );
}