import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { emergencyStopSystem } from '@/services/emergency-stop-system';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resetCode, reason } = await req.json();

    if (!resetCode) {
      return NextResponse.json(
        { error: 'Reset code required' },
        { status: 400 }
      );
    }

    // Reset emergency stop
    await emergencyStopSystem.resetEmergencyStop(userId, resetCode);

    return NextResponse.json({ 
      success: true,
      message: 'Emergency stop reset successfully',
      resumeTime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    });

  } catch (error: any) {
    console.error('Emergency stop reset failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset emergency stop' },
      { status: 500 }
    );
  }
}