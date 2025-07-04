import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { LICORAdapter } from '@/lib/sensors/licor-adapter';

// Initialize LI-COR adapter
const licorAdapter = new LICORAdapter();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const sensorId = searchParams.get('sensorId');

    switch (action) {
      case 'status':
        // Get all connected sensors status
        return NextResponse.json({
          connected: true,
          sensors: [
            {
              id: 'LI-190R-001',
              type: 'LI-190R',
              name: 'Canopy Center PAR',
              status: 'active',
              lastReading: new Date(),
              calibrationDate: new Date('2024-01-15'),
              location: { x: 10, y: 10, z: 2 }
            },
            {
              id: 'LI-200R-001',
              type: 'LI-200R',
              name: 'Greenhouse Solar',
              status: 'active',
              lastReading: new Date(),
              calibrationDate: new Date('2024-01-15'),
              location: { x: 5, y: 5, z: 3 }
            }
          ]
        });

      case 'readings':
        // Get latest readings
        if (!sensorId) {
          return NextResponse.json({ error: 'Sensor ID required' }, { status: 400 });
        }
        
        const readings = licorAdapter.getBufferedReadings(sensorId);
        return NextResponse.json({ readings });

      case 'dli':
        // Calculate DLI for a sensor
        if (!sensorId) {
          return NextResponse.json({ error: 'Sensor ID required' }, { status: 400 });
        }
        
        const dliReadings = licorAdapter.getBufferedReadings(sensorId);
        if (dliReadings.length === 0) {
          return NextResponse.json({ error: 'No readings available' }, { status: 404 });
        }
        
        const dli = licorAdapter.calculateDLI(dliReadings as any);
        return NextResponse.json({ dli });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('LI-COR API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process LI-COR sensor request' },
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
        // Connect to LI-1500 data logger
        const { host, port } = data;
        await licorAdapter.connectToDataLogger(host, port);
        return NextResponse.json({ success: true, message: 'Connected to data logger' });

      case 'calibrate':
        // Calibrate sensor
        const { sensorId, knownPPFD, measuredVoltage } = data;
        const newConstant = licorAdapter.calibrateSensor(sensorId, knownPPFD, measuredVoltage);
        
        // Save to database (implement this)
        // await saveSensorCalibration(sensorId, newConstant);
        
        return NextResponse.json({ 
          success: true, 
          calibrationConstant: newConstant 
        });

      case 'simulate':
        // Simulate sensor reading for testing with realistic values
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const timeOfDay = hour + minute / 60;
        
        // Calculate realistic PPFD based on time of day and sensor location
        let basePPFD = 0;
        if (hour >= 6 && hour <= 20) { // During photoperiod
          // Peak at noon, following a sine curve
          const dayProgress = (timeOfDay - 6) / 14; // 0 to 1 over 14-hour day
          basePPFD = 800 * Math.sin(dayProgress * Math.PI);
          
          // Add realistic variations based on canopy position
          const sensorPosition = data.position || 'canopy';
          if (sensorPosition === 'canopy') {
            basePPFD *= 0.85; // 85% of peak due to shading
          } else if (sensorPosition === 'lower') {
            basePPFD *= 0.45; // 45% at lower canopy
          }
          
          // Add small fluctuations (±2%)
          const fluctuation = Math.sin(now.getTime() / 1000) * 0.02;
          basePPFD *= (1 + fluctuation);
        }
        
        const ppfdValue = data.ppfd || Math.max(0, basePPFD);
        
        // Calculate voltage based on PPFD (typical sensor response)
        // LI-190R: ~5μA per 1000 μmol·m⁻²·s⁻¹
        const current = (ppfdValue / 1000) * 5; // μA
        const voltage = current * 199.8; // mV (using calibration constant)
        
        const reading = {
          timestamp: now,
          sensorId: data.sensorId || 'LI-190R-001',
          sensorType: 'LI-190R' as const,
          value: ppfdValue,
          ppfd: ppfdValue,
          par: ppfdValue,
          voltage: data.voltage || voltage,
          current: data.current || current,
          unit: 'μmol·m⁻²·s⁻¹',
          quality: 'good' as const,
          calibrationConstant: 199.8
        };
        
        // Emit to connected clients (implement WebSocket)
        // broadcastReading(reading);
        
        return NextResponse.json({ success: true, reading });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('LI-COR API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process LI-COR sensor request' },
      { status: 500 }
    );
  }
}