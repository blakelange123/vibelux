import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TrolmasterAdapter } from '@/lib/sensors/trolmaster-adapter';

// Initialize adapter
const trolmasterAdapter = new TrolmasterAdapter();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const deviceId = searchParams.get('deviceId');

    switch (action) {
      case 'devices':
        // Get all connected devices
        const devices = trolmasterAdapter.getDevices();
        return NextResponse.json({ devices });

      case 'environment':
        // Get current environmental data
        if (!deviceId) {
          return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
        }
        
        const environment = trolmasterAdapter.getCurrentEnvironment(deviceId);
        return NextResponse.json({ environment });

      case 'history':
        // Get historical data
        if (!deviceId) {
          return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
        }
        
        const sensorType = searchParams.get('sensorType') || 'temperature';
        const hours = parseInt(searchParams.get('hours') || '24');
        
        const history = trolmasterAdapter.getHistory(deviceId, sensorType, hours);
        return NextResponse.json({ history });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Trolmaster API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process Trolmaster request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'connect':
        // Connect to new device
        const { ipAddress, name } = data;
        const device = await trolmasterAdapter.connectDevice(ipAddress, name);
        return NextResponse.json({ success: true, device });

      case 'control':
        // Execute control command
        const { deviceId, command, value } = data;
        await trolmasterAdapter.executeControl({ deviceId, action: command, value });
        return NextResponse.json({ success: true });

      case 'setAlert':
        // Set alert rule
        const alertRule = data;
        trolmasterAdapter.setAlertRule(alertRule);
        return NextResponse.json({ success: true });

      case 'disconnect':
        // Disconnect device
        trolmasterAdapter.disconnectDevice(data.deviceId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Trolmaster API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process Trolmaster request' },
      { status: 500 }
    );
  }
}