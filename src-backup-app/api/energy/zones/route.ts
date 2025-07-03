import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, this would fetch from control system APIs
    const zones = [
      { 
        id: 'zone-1',
        zone: 'Flower Room 1', 
        status: 'active', 
        intensity: 85, 
        savings: 22,
        temperature: 75,
        humidity: 55,
        co2: 1200,
        vpd: 1.2,
        lights: 24,
        schedule: '12/12'
      },
      { 
        id: 'zone-2',
        zone: 'Flower Room 2', 
        status: 'active', 
        intensity: 82, 
        savings: 25,
        temperature: 74,
        humidity: 58,
        co2: 1150,
        vpd: 1.1,
        lights: 24,
        schedule: '12/12'
      },
      { 
        id: 'zone-3',
        zone: 'Veg Room 1', 
        status: 'active', 
        intensity: 90, 
        savings: 18,
        temperature: 78,
        humidity: 65,
        co2: 1000,
        vpd: 0.9,
        lights: 36,
        schedule: '18/6'
      },
      { 
        id: 'zone-4',
        zone: 'Veg Room 2', 
        status: 'paused', 
        intensity: 100, 
        savings: 0,
        temperature: 77,
        humidity: 62,
        co2: 950,
        vpd: 0.95,
        lights: 36,
        schedule: '18/6'
      },
      { 
        id: 'zone-5',
        zone: 'Clone Room', 
        status: 'active', 
        intensity: 75, 
        savings: 30,
        temperature: 72,
        humidity: 70,
        co2: 800,
        vpd: 0.7,
        lights: 12,
        schedule: '24/0'
      },
      { 
        id: 'zone-6',
        zone: 'Dry Room', 
        status: 'inactive', 
        intensity: 0, 
        savings: 0,
        temperature: 65,
        humidity: 45,
        co2: 400,
        vpd: 0.8,
        lights: 0,
        schedule: 'N/A'
      }
    ];

    const zoneSettings = {
      minimumIntensity: 70,
      responseTime: 5, // minutes
      priorityLevel: 3,
      safetyOverride: true,
      photoperiodProtection: true
    };

    return NextResponse.json({ zones, settings: zoneSettings });
  } catch (error) {
    console.error('Error fetching zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch zones' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { zoneId, updates } = await request.json();

    // In production, this would update the control system

    return NextResponse.json({ 
      success: true, 
      message: `Zone ${zoneId} updated successfully` 
    });
  } catch (error) {
    console.error('Error updating zone:', error);
    return NextResponse.json(
      { error: 'Failed to update zone' },
      { status: 500 }
    );
  }
}