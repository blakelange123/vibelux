import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's facilities
    const facilities = await prisma.facility.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        cameras: true,
      },
    });

    const cameras = facilities.flatMap(f => f.cameras || []);

    return NextResponse.json({ cameras });
  } catch (error) {
    console.error('Failed to get cameras:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { facilityId, ...cameraData } = data;

    // Verify user has access to facility
    const facility = await prisma.facility.findFirst({
      where: {
        id: facilityId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId, role: { in: ['admin', 'manager'] } } } },
        ],
      },
    });

    if (!facility) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create camera
    const camera = await prisma.camera.create({
      data: {
        facilityId,
        ...cameraData,
      },
    });

    return NextResponse.json({ camera });
  } catch (error) {
    console.error('Failed to create camera:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}