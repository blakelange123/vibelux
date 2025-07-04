import { NextRequest, NextResponse } from 'next/server';
import { runtimeMonitor } from '@/lib/equipment-runtime-monitor';

// POST /api/equipment/runtime
// Webhook endpoint for IoT devices to report runtime data
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Validate payload
    if (!payload.deviceId) {
      return NextResponse.json(
        { error: 'Missing deviceId' },
        { status: 400 }
      );
    }

    // Process runtime data
    runtimeMonitor.processWebhookData(payload);

    // You can also store this data in a database for historical tracking
    // await db.runtimeLogs.create({ data: payload });

    return NextResponse.json({ 
      success: true, 
      message: 'Runtime data processed',
      deviceId: payload.deviceId 
    });
  } catch (error) {
    console.error('Runtime webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process runtime data' },
      { status: 500 }
    );
  }
}

// GET /api/equipment/runtime?equipmentId=xxx
// Get current runtime data for equipment
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const equipmentId = searchParams.get('equipmentId');

    if (!equipmentId) {
      // Return all active sessions if no specific equipment requested
      const activeSessions = runtimeMonitor.getActiveSessions();
      return NextResponse.json({
        activeSessions,
        count: activeSessions.length
      });
    }

    // Get runtime data for specific equipment
    const currentRuntime = runtimeMonitor.getCurrentRuntime(equipmentId);
    const statistics = runtimeMonitor.getRuntimeStatistics(equipmentId, 'week');

    return NextResponse.json({
      equipmentId,
      currentRuntime,
      statistics,
      isRunning: currentRuntime > 0
    });
  } catch (error) {
    console.error('Get runtime error:', error);
    return NextResponse.json(
      { error: 'Failed to get runtime data' },
      { status: 500 }
    );
  }
}