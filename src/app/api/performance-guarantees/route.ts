import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const equipmentId = searchParams.get('equipmentId');
    const status = searchParams.get('status');
    const expiring = searchParams.get('expiring') === 'true';

    let whereClause: any = {};

    if (equipmentId) {
      whereClause.equipmentId = equipmentId;
    } else if (facilityId) {
      whereClause.equipment = {
        facilityId: facilityId,
      };
    }

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    if (expiring) {
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      whereClause.endDate = {
        lte: threeMonthsFromNow,
        gte: new Date(),
      };
    }

    const guarantees = await prisma.performanceGuarantee.findMany({
      where: whereClause,
      include: {
        equipment: {
          include: {
            facility: {
              select: { id: true, name: true },
            },
          },
        },
        violations: {
          orderBy: { violationDate: 'desc' },
          take: 10,
        },
      },
      orderBy: [
        { status: 'asc' },
        { endDate: 'asc' },
      ],
    });

    return NextResponse.json(guarantees);
  } catch (error) {
    console.error('Error fetching performance guarantees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const data = await request.json();

    const guarantee = await prisma.performanceGuarantee.create({
      data: {
        equipmentId: data.equipmentId,
        guaranteeType: data.guaranteeType,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetMetric: data.targetMetric,
        targetValue: data.targetValue,
        measurementUnit: data.measurementUnit,
        penaltyStructure: data.penaltyStructure,
        maxPenalty: data.maxPenalty,
      },
      include: {
        equipment: {
          include: {
            facility: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json(guarantee, { status: 201 });
  } catch (error) {
    console.error('Error creating performance guarantee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}