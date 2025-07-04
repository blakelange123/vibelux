// Mobile Sensors API
// Real-time sensor data streaming for mobile app

import { NextRequest, NextResponse } from 'next/server';
import { verifyMobileToken } from '@/lib/mobile-auth';

// Get sensor data
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
    const sensorType = searchParams.get('type');
    const period = searchParams.get('period') || '1h';

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'Room ID required' },
        { status: 400 }
      );
    }

    // Get time range based on period
    const now = new Date();
    const startTime = new Date();
    switch (period) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '24h':
        startTime.setHours(now.getHours() - 24);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(now.getDate() - 30);
        break;
    }

    // Mock sensor data
    const sensorData = {
      roomId,
      roomName: 'Flower Room A',
      timestamp: now.toISOString(),
      current: {
        temperature: 75.2,
        humidity: 50.5,
        co2: 1200,
        vpd: 1.2,
        light: 800,
        ph: 6.0,
        ec: 1.8,
        waterTemp: 68,
        dissolved_oxygen: 7.2
      },
      sensors: [
        {
          id: 'sensor_temp_1',
          type: 'temperature',
          name: 'Canopy Temperature',
          status: 'active',
          value: 75.2,
          unit: '°F',
          lastUpdate: new Date(now.getTime() - 30000).toISOString(),
          battery: 85,
          signal: 92
        },
        {
          id: 'sensor_hum_1',
          type: 'humidity',
          name: 'Canopy Humidity',
          status: 'active',
          value: 50.5,
          unit: '%',
          lastUpdate: new Date(now.getTime() - 30000).toISOString(),
          battery: 85,
          signal: 92
        },
        {
          id: 'sensor_co2_1',
          type: 'co2',
          name: 'Room CO2',
          status: 'active',
          value: 1200,
          unit: 'ppm',
          lastUpdate: new Date(now.getTime() - 45000).toISOString(),
          battery: null,
          signal: 100
        },
        {
          id: 'sensor_light_1',
          type: 'light',
          name: 'Canopy PPFD',
          status: 'active',
          value: 800,
          unit: 'μmol/m²/s',
          lastUpdate: new Date(now.getTime() - 60000).toISOString(),
          battery: null,
          signal: 100
        }
      ],
      history: generateSensorHistory(startTime, now, sensorType),
      statistics: {
        temperature: {
          min: 72.1,
          max: 78.3,
          avg: 75.1,
          trend: 'stable'
        },
        humidity: {
          min: 48.2,
          max: 54.7,
          avg: 51.3,
          trend: 'decreasing'
        },
        co2: {
          min: 800,
          max: 1400,
          avg: 1150,
          trend: 'stable'
        },
        vpd: {
          min: 1.0,
          max: 1.4,
          avg: 1.2,
          trend: 'stable'
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: sensorData
    });
  } catch (error) {
    console.error('Get sensors error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load sensor data' },
      { status: 500 }
    );
  }
}

// WebSocket endpoint for real-time streaming
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
    const { action, roomIds, sensorTypes } = body;

    if (action === 'subscribe') {
      // Generate WebSocket token
      const wsToken = generateWebSocketToken(user.userId, roomIds, sensorTypes);
      
      return NextResponse.json({
        success: true,
        data: {
          wsUrl: `${process.env.WS_URL || 'ws://localhost:3001'}/mobile`,
          token: wsToken,
          protocol: 'wss',
          reconnectInterval: 5000
        }
      });
    } else if (action === 'unsubscribe') {
      // Handle unsubscribe
      return NextResponse.json({
        success: true,
        message: 'Unsubscribed from sensor updates'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Sensor subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage subscription' },
      { status: 500 }
    );
  }
}

// Helper function to generate sensor history
function generateSensorHistory(startTime: Date, endTime: Date, sensorType?: string) {
  const history: any = {};
  const interval = 5 * 60 * 1000; // 5 minutes
  const points = Math.floor((endTime.getTime() - startTime.getTime()) / interval);
  
  const types = sensorType ? [sensorType] : ['temperature', 'humidity', 'co2', 'vpd'];
  
  types.forEach(type => {
    history[type] = [];
    
    for (let i = 0; i < points; i++) {
      const timestamp = new Date(startTime.getTime() + i * interval);
      let value: number;
      
      // Generate realistic sensor variance based on time and environmental factors
      const timeNoise = Math.sin((timestamp + i * 300000) / (1000 * 60 * 60));
      const cryptoRandom = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5);
      
      switch (type) {
        case 'temperature':
          value = 75 + timeNoise * 2 + cryptoRandom * 1;
          break;
        case 'humidity':
          value = 50 + timeNoise * 5 + cryptoRandom * 2;
          break;
        case 'co2':
          value = 1200 + timeNoise * 200 + cryptoRandom * 50;
          break;
        case 'vpd':
          value = 1.2 + timeNoise * 0.1 + cryptoRandom * 0.05;
          break;
        default:
          value = 0;
      }
      
      history[type].push({
        timestamp: timestamp.toISOString(),
        value: Math.round(value * 10) / 10
      });
    }
  });
  
  return history;
}

// Generate WebSocket token for real-time streaming
function generateWebSocketToken(userId: string, roomIds: string[], sensorTypes?: string[]): string {
  // In production, use proper JWT generation
  const token = Buffer.from(JSON.stringify({
    userId,
    roomIds,
    sensorTypes,
    expires: Date.now() + 3600000 // 1 hour
  })).toString('base64');
  
  return token;
}