// Mobile Rooms API
// Provides room data and controls for mobile app

import { NextRequest, NextResponse } from 'next/server';
import { verifyMobileToken } from '@/lib/mobile-auth';

// GET all rooms or specific room
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
    const roomId = searchParams.get('id');

    if (roomId) {
      // Get specific room details
      const room = {
        id: roomId,
        name: 'Flower Room A',
        type: 'flower',
        stage: 'Flowering',
        currentDay: 35,
        totalDays: 63,
        strain: 'Blue Dream',
        plantCount: 64,
        healthScore: 92,
        environmental: {
          temperature: {
            current: 75.2,
            target: 75,
            min: 70,
            max: 80,
            history: generateHistory('temperature', 24)
          },
          humidity: {
            current: 50.5,
            target: 50,
            min: 45,
            max: 55,
            history: generateHistory('humidity', 24)
          },
          co2: {
            current: 1200,
            target: 1200,
            min: 1000,
            max: 1500,
            history: generateHistory('co2', 24)
          },
          vpd: {
            current: 1.2,
            target: 1.2,
            min: 1.0,
            max: 1.4,
            history: generateHistory('vpd', 24)
          },
          light: {
            status: 'on',
            intensity: 800,
            photoperiod: 12,
            spectrum: {
              red: 50,
              blue: 20,
              white: 25,
              farRed: 5
            }
          }
        },
        equipment: {
          hvac: { status: 'running', mode: 'cooling', power: 75 },
          dehumidifier: { status: 'idle', setpoint: 50 },
          co2: { status: 'supplementing', flow: 5 },
          lights: { status: 'on', dimmer: 100 },
          fans: { status: 'running', speed: 60 }
        },
        irrigation: {
          lastWatered: '2024-03-20T08:00:00Z',
          nextWatering: '2024-03-20T20:00:00Z',
          ec: 1.8,
          ph: 6.0,
          waterTemp: 68,
          runoff: {
            ec: 2.1,
            ph: 6.2
          }
        },
        alerts: [
          {
            id: 'alert_1',
            type: 'warning',
            message: 'Temperature slightly above target',
            timestamp: '2024-03-20T14:30:00Z'
          }
        ],
        cameras: [
          {
            id: 'cam_1',
            name: 'Overview',
            streamUrl: '/api/v1/mobile/stream/cam_1',
            snapshotUrl: '/api/v1/mobile/snapshot/cam_1'
          }
        ]
      };

      return NextResponse.json({
        success: true,
        data: room
      });
    } else {
      // Get all rooms summary
      const rooms = [
        {
          id: 'room_1',
          name: 'Flower Room A',
          type: 'flower',
          stage: 'Flowering',
          day: 35,
          plants: 64,
          health: 92,
          alerts: 1,
          temp: 75.2,
          humidity: 50.5,
          thumbnail: '/api/v1/mobile/snapshot/room_1'
        },
        {
          id: 'room_2',
          name: 'Flower Room B',
          type: 'flower',
          stage: 'Flowering',
          day: 21,
          plants: 64,
          health: 88,
          alerts: 0,
          temp: 73.8,
          humidity: 52.1,
          thumbnail: '/api/v1/mobile/snapshot/room_2'
        },
        {
          id: 'room_3',
          name: 'Veg Room',
          type: 'vegetative',
          stage: 'Vegetative',
          day: 14,
          plants: 96,
          health: 95,
          alerts: 0,
          temp: 77.1,
          humidity: 65.3,
          thumbnail: '/api/v1/mobile/snapshot/room_3'
        }
      ];

      return NextResponse.json({
        success: true,
        data: rooms
      });
    }
  } catch (error) {
    console.error('Rooms error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load rooms' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock history data
function generateHistory(type: string, hours: number) {
  const data = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    let value: number;
    
    switch (type) {
      case 'temperature':
        value = 75 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5;
        break;
      case 'humidity':
        value = 50 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10;
        break;
      case 'co2':
        value = 1200 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 200;
        break;
      case 'vpd':
        value = 1.2 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.2;
        break;
      default:
        value = 0;
    }
    
    data.push({
      timestamp: time.toISOString(),
      value: Math.round(value * 10) / 10
    });
  }
  
  return data;
}