import { NextRequest, NextResponse } from 'next/server';
import { MaintenanceScheduler } from '@/lib/maintenance-scheduler';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 });
    }

    const statistics = await MaintenanceScheduler.getMaintenanceStatistics(facilityId);

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching maintenance statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}