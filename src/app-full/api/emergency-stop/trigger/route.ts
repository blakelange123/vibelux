import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { emergencyStopSystem } from '@/services/emergency-stop-system';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason } = await req.json();

    // Trigger emergency stop
    await emergencyStopSystem.manualEmergencyStop(
      userId,
      reason || 'Manual trigger from dashboard'
    );

    return NextResponse.json({ 
      success: true,
      message: 'Emergency stop activated',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Emergency stop trigger failed:', error);
    return NextResponse.json(
      { error: 'Failed to trigger emergency stop' },
      { status: 500 }
    );
  }
}