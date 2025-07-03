'use client';

import { HMIDashboard } from '@/components/hmi/HMIDashboard';
import { ErrorBoundary } from '@/components/hmi/ErrorBoundary';

export default function HMIPage() {
  // In a real app, these would come from the session/context
  const facilityId = 'facility-1';
  const roomId = 'room-a';
  
  return (
    <div className="min-h-screen bg-gray-950">
      <ErrorBoundary>
        <HMIDashboard facilityId={facilityId} roomId={roomId} />
      </ErrorBoundary>
    </div>
  );
}