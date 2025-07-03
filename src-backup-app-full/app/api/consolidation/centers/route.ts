import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET consolidation centers
export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get('state');
    const coldStorage = searchParams.get('coldStorage') === 'true';

    const centers = await prisma.consolidationCenter.findMany({
      where: {
        isActive: true,
        ...(state && { state }),
        ...(coldStorage && { coldStorage: true })
      },
      orderBy: { rating: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: centers
    });
  } catch (error) {
    console.error('Error fetching centers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consolidation centers' },
      { status: 500 }
    );
  }
}

// POST create new center (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.userId }
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    const center = await prisma.consolidationCenter.create({
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        latitude: body.latitude,
        longitude: body.longitude,
        coldStorage: body.coldStorage || false,
        temperatureRanges: body.temperatureRanges || [],
        maxCapacity: body.maxCapacity,
        capacityUnit: body.capacityUnit,
        services: body.services || [],
        operatingHours: body.operatingHours,
        certifications: body.certifications || [],
        storageFeePerDay: body.storageFeePerDay,
        handlingFee: body.handlingFee,
        consolidationFee: body.consolidationFee
      }
    });

    return NextResponse.json({
      success: true,
      data: center
    });
  } catch (error) {
    console.error('Error creating center:', error);
    return NextResponse.json(
      { error: 'Failed to create consolidation center' },
      { status: 500 }
    );
  }
}