import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For demo purposes, return a default facility
    // In production, this would query the actual database
    const facilities = [
      {
        id: 'demo-facility-1',
        name: 'Main Cultivation Facility',
        controlSystem: 'Argus Controls',
        zones: [
          { id: 'zone-1', name: 'Flowering Room A', area: 2000 },
          { id: 'zone-2', name: 'Vegetative Room B', area: 1500 },
          { id: 'zone-3', name: 'Mother Room', area: 800 }
        ],
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({ facilities });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facilities' },
      { status: 500 }
    );
  }
}