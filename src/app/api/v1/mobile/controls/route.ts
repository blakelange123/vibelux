// Mobile Controls API
// Allows remote control of room equipment from mobile app

import { NextRequest, NextResponse } from 'next/server';
import { verifyMobileToken } from '@/lib/mobile-auth';

// Execute control command
export async function POST(request: NextRequest) {
  try {
    const user = await verifyMobileToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { roomId, deviceType, command, value } = body;

    // Validate input
    if (!roomId || !deviceType || !command) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check permissions
    if (!user.permissions?.includes('control_environment')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Log control action
    const controlLog = {
      id: `ctrl_${Date.now()}`,
      userId: user.userId,
      roomId,
      deviceType,
      command,
      value,
      timestamp: new Date(),
      status: 'pending'
    };

    // Execute control command (mock implementation)
    const result = await executeControl(roomId, deviceType, command, value);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          controlId: controlLog.id,
          status: 'executed',
          newValue: result.newValue,
          message: `${deviceType} ${command} command executed successfully`
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Control error:', error);
    return NextResponse.json(
      { success: false, error: 'Control command failed' },
      { status: 500 }
    );
  }
}

// Get control status and options
export async function GET(request: NextRequest) {
  try {
    const user = await verifyMobileToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'Room ID required' },
        { status: 400 }
      );
    }

    // Get available controls for room
    const controls = {
      temperature: {
        type: 'range',
        current: 75,
        min: 65,
        max: 85,
        step: 1,
        unit: '°F',
        modes: ['auto', 'heat', 'cool', 'off']
      },
      humidity: {
        type: 'range',
        current: 50,
        min: 30,
        max: 80,
        step: 5,
        unit: '%',
        modes: ['auto', 'humidify', 'dehumidify', 'off']
      },
      co2: {
        type: 'range',
        current: 1200,
        min: 400,
        max: 1500,
        step: 50,
        unit: 'ppm',
        modes: ['auto', 'supplement', 'off']
      },
      lights: {
        type: 'toggle',
        status: 'on',
        intensity: {
          current: 100,
          min: 0,
          max: 100,
          step: 10,
          unit: '%'
        },
        spectrum: {
          red: 50,
          blue: 20,
          white: 25,
          farRed: 5
        }
      },
      irrigation: {
        type: 'action',
        nextScheduled: '2024-03-20T20:00:00Z',
        duration: {
          current: 5,
          min: 1,
          max: 30,
          unit: 'minutes'
        },
        actions: ['water_now', 'skip_next', 'adjust_schedule']
      },
      fans: {
        type: 'range',
        current: 60,
        min: 0,
        max: 100,
        step: 10,
        unit: '%',
        zones: ['intake', 'exhaust', 'circulation']
      }
    };

    // Get recent control history
    const history = [
      {
        id: 'ctrl_1',
        user: 'John Grower',
        action: 'Temperature adjusted to 73°F',
        timestamp: '2024-03-20T10:30:00Z'
      },
      {
        id: 'ctrl_2',
        user: 'System',
        action: 'Lights turned on (schedule)',
        timestamp: '2024-03-20T06:00:00Z'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        controls,
        history,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Get controls error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load controls' },
      { status: 500 }
    );
  }
}

// Mock control execution
async function executeControl(
  roomId: string,
  deviceType: string,
  command: string,
  value: any
): Promise<{ success: boolean; newValue?: any; error?: string }> {
  // In production, this would interface with actual hardware controllers
  
  // Simulate some validation
  if (deviceType === 'temperature' && (value < 60 || value > 90)) {
    return { success: false, error: 'Temperature must be between 60-90°F' };
  }

  // Simulate successful execution
  
  return {
    success: true,
    newValue: value
  };
}