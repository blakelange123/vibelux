// Mobile Dashboard API
// Provides summary data for mobile app home screen

import { NextRequest, NextResponse } from 'next/server';
import { verifyMobileToken } from '@/lib/mobile-auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyMobileToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get dashboard data
    const dashboardData = {
      summary: {
        activeRooms: 4,
        totalPlants: 256,
        alertsCount: 3,
        tasksToday: 12,
        harvestingSoon: 2
      },
      environmental: {
        averageTemp: 74.5,
        averageHumidity: 62.3,
        averageCO2: 850,
        averageVPD: 1.1
      },
      recent: {
        alerts: [
          {
            id: 'alert_1',
            type: 'warning',
            title: 'High Temperature',
            room: 'Flower Room A',
            time: '5 minutes ago',
            severity: 'medium'
          },
          {
            id: 'alert_2',
            type: 'info',
            title: 'Irrigation Complete',
            room: 'Veg Room',
            time: '1 hour ago',
            severity: 'low'
          }
        ],
        tasks: [
          {
            id: 'task_1',
            title: 'Check pH levels',
            room: 'Flower Room B',
            priority: 'high',
            dueTime: '10:00 AM'
          },
          {
            id: 'task_2',
            title: 'Refill nutrients',
            room: 'Nutrient Room',
            priority: 'medium',
            dueTime: '2:00 PM'
          }
        ]
      },
      rooms: [
        {
          id: 'room_1',
          name: 'Flower Room A',
          stage: 'Flower',
          day: 35,
          plants: 64,
          health: 92,
          temp: 75.2,
          humidity: 50.5,
          co2: 1200,
          vpd: 1.2
        },
        {
          id: 'room_2',
          name: 'Flower Room B',
          stage: 'Flower',
          day: 21,
          plants: 64,
          health: 88,
          temp: 73.8,
          humidity: 52.1,
          co2: 1150,
          vpd: 1.1
        },
        {
          id: 'room_3',
          name: 'Veg Room',
          stage: 'Vegetative',
          day: 14,
          plants: 96,
          health: 95,
          temp: 77.1,
          humidity: 65.3,
          co2: 800,
          vpd: 0.9
        },
        {
          id: 'room_4',
          name: 'Clone Room',
          stage: 'Clone',
          day: 7,
          plants: 32,
          health: 90,
          temp: 74.5,
          humidity: 70.2,
          co2: 600,
          vpd: 0.7
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}