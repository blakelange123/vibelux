'use client';

import { PilotProgramDashboard } from '@/components/PilotProgramDashboard';

export default function PilotProgramPage() {
  // In production, you'd get the facilityId from user context or route params
  const facilityId = 'test-facility-001';

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Energy Savings Pilot Program</h1>
        <PilotProgramDashboard facilityId={facilityId} />
      </div>
    </div>
  );
}