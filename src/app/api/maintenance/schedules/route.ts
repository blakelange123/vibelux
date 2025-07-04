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
    const overdue = searchParams.get('overdue') === 'true';
    const upcoming = searchParams.get('upcoming') === 'true';

    const whereClause: any = {
      active: true,
    };

    if (facilityId) {
      whereClause.equipment = {
        facilityId: facilityId,
      };
    }

    if (equipmentId) {
      whereClause.equipmentId = equipmentId;
    }

    if (overdue) {
      whereClause.nextDue = {
        lt: new Date(),
      };
    }

    if (upcoming) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      whereClause.nextDue = {
        lte: nextWeek,
        gte: new Date(),
      };
    }

    const schedules = await prisma.maintenanceSchedule.findMany({
      where: whereClause,
      include: {
        equipment: {
          include: {
            facility: {
              select: { id: true, name: true },
            },
          },
        },
        records: {
          orderBy: { scheduledDate: 'desc' },
          take: 5,
          include: {
            serviceProvider: {
              select: { companyName: true, contactName: true, phone: true },
            },
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { nextDue: 'asc' },
      ],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error);
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

    // Calculate next due date based on frequency
    const now = new Date();
    const nextDue = new Date(now);

    switch (data.frequency) {
      case 'DAILY':
        nextDue.setDate(nextDue.getDate() + (data.intervalDays || 1));
        break;
      case 'WEEKLY':
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case 'MONTHLY':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextDue.setMonth(nextDue.getMonth() + 3);
        break;
      case 'SEMI_ANNUAL':
        nextDue.setMonth(nextDue.getMonth() + 6);
        break;
      case 'ANNUAL':
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
      case 'RUNTIME_BASED':
        // For runtime-based, calculate based on hours
        if (data.intervalHours) {
          nextDue.setHours(nextDue.getHours() + data.intervalHours);
        }
        break;
      default:
        nextDue.setDate(nextDue.getDate() + (data.intervalDays || 30));
    }

    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        equipmentId: data.equipmentId,
        name: data.name,
        description: data.description,
        scheduleType: data.scheduleType,
        frequency: data.frequency,
        intervalDays: data.intervalDays,
        intervalHours: data.intervalHours,
        nextDue: nextDue,
        assignedTo: data.assignedTo,
        estimatedDuration: data.estimatedDuration,
        priority: data.priority || 'MEDIUM',
        predictiveEnabled: data.predictiveEnabled || false,
        triggerConditions: data.triggerConditions,
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

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}