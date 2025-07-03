import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get facilities that the user has access to
    const facilities = await prisma.facility.findMany({
      where: {
        OR: [
          {
            users: {
              some: {
                userId: userId,
              },
            },
          },
          {
            ownedFacilities: {
              some: {
                id: userId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        address: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,
        size: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(facilities);
  } catch (error) {
    // Error handling for facilities fetching
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}