'use client';

import { AssetTrackingDashboard } from '@/components/tracking/AssetTrackingDashboard';

export default function TrackingPage() {
  // In a real app, this would come from user context or facility selection
  const facilityId = 'demo-facility-001';

  return <AssetTrackingDashboard facilityId={facilityId} />;
}