import { NextRequest, NextResponse } from 'next/server';
import { emergencyStopSystem } from '@/services/emergency-stop-system';

export async function GET(req: NextRequest) {
  try {
    const status = emergencyStopSystem.getStatus();

    return NextResponse.json(status);

  } catch (error) {
    console.error('Failed to get emergency stop status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}