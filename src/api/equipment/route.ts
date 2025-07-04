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
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const warrantyExpiring = searchParams.get('warrantyExpiring') === 'true';

    const whereClause: any = {};

    if (facilityId) {
      whereClause.facilityId = facilityId;
    }

    if (category) {
      whereClause.category = category.toUpperCase();
    }

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    if (warrantyExpiring) {
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      whereClause.warrantyEnd = {
        lte: threeMonthsFromNow,
        gte: new Date(),
      };
    }

    const equipment = await prisma.equipment.findMany({
      where: whereClause,
      include: {
        facility: {
          select: { id: true, name: true },
        },
        maintenanceSchedules: {
          where: { active: true },
          orderBy: { nextDue: 'asc' },
          take: 3,
        },
        maintenanceRecords: {
          orderBy: { scheduledDate: 'desc' },
          take: 5,
          include: {
            serviceProvider: {
              select: { companyName: true, rating: true },
            },
          },
        },
        performanceGuarantees: {
          where: { status: 'ACTIVE' },
          include: {
            violations: {
              where: { resolved: false },
              orderBy: { violationDate: 'desc' },
              take: 5,
            },
          },
        },
        serviceRequests: {
          where: { 
            status: { in: ['OPEN', 'BIDDING', 'ASSIGNED', 'IN_PROGRESS'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: [
        { healthScore: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
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

    const equipment = await prisma.equipment.create({
      data: {
        facilityId: data.facilityId,
        name: data.name,
        category: data.category,
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        installDate: new Date(data.installDate),
        installLocation: data.installLocation,
        installedBy: data.installedBy,
        warrantyStart: new Date(data.warrantyStart),
        warrantyEnd: new Date(data.warrantyEnd),
        warrantyTerms: data.warrantyTerms,
        warrantyProvider: data.warrantyProvider,
        maintenanceInterval: data.maintenanceInterval,
        purchasePrice: data.purchasePrice,
        currentValue: data.currentValue,
      },
      include: {
        facility: {
          select: { id: true, name: true },
        },
      },
    });

    // Create default maintenance schedules based on equipment category
    if (data.createDefaultSchedules) {
      await this.createDefaultMaintenanceSchedules(equipment.id, equipment.category);
    }

    // Create performance guarantees if provided
    if (data.performanceGuarantees && data.performanceGuarantees.length > 0) {
      await prisma.performanceGuarantee.createMany({
        data: data.performanceGuarantees.map((guarantee: any) => ({
          equipmentId: equipment.id,
          guaranteeType: guarantee.type,
          description: guarantee.description,
          startDate: new Date(guarantee.startDate),
          endDate: new Date(guarantee.endDate),
          targetMetric: guarantee.targetMetric,
          targetValue: guarantee.targetValue,
          measurementUnit: guarantee.measurementUnit,
          penaltyStructure: guarantee.penaltyStructure,
          maxPenalty: guarantee.maxPenalty,
        })),
      });
    }

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper method to create default maintenance schedules
async function createDefaultMaintenanceSchedules(equipmentId: string, category: string) {
  const defaultSchedules = {
    LIGHTING: [
      {
        name: 'LED Fixture Cleaning',
        description: 'Clean LED fixtures to maintain light output',
        scheduleType: 'CLEANING',
        frequency: 'MONTHLY',
        intervalDays: 30,
        priority: 'MEDIUM',
      },
      {
        name: 'Driver Inspection',
        description: 'Inspect LED drivers for signs of failure',
        scheduleType: 'INSPECTION',
        frequency: 'QUARTERLY',
        intervalDays: 90,
        priority: 'HIGH',
      },
    ],
    HVAC: [
      {
        name: 'Filter Replacement',
        description: 'Replace HVAC filters',
        scheduleType: 'PREVENTIVE',
        frequency: 'MONTHLY',
        intervalDays: 30,
        priority: 'HIGH',
      },
      {
        name: 'Coil Cleaning',
        description: 'Clean evaporator and condenser coils',
        scheduleType: 'CLEANING',
        frequency: 'QUARTERLY',
        intervalDays: 90,
        priority: 'MEDIUM',
      },
    ],
    IRRIGATION: [
      {
        name: 'Filter Cleaning',
        description: 'Clean irrigation filters',
        scheduleType: 'CLEANING',
        frequency: 'WEEKLY',
        intervalDays: 7,
        priority: 'HIGH',
      },
      {
        name: 'Sensor Calibration',
        description: 'Calibrate pH and EC sensors',
        scheduleType: 'CALIBRATION',
        frequency: 'MONTHLY',
        intervalDays: 30,
        priority: 'HIGH',
      },
    ],
    ELECTRICAL: [
      {
        name: 'Electrical Inspection',
        description: 'Inspect electrical connections and panels',
        scheduleType: 'INSPECTION',
        frequency: 'QUARTERLY',
        intervalDays: 90,
        priority: 'HIGH',
      },
    ],
    AUTOMATION: [
      {
        name: 'Software Update Check',
        description: 'Check for and install software updates',
        scheduleType: 'PREVENTIVE',
        frequency: 'MONTHLY',
        intervalDays: 30,
        priority: 'MEDIUM',
      },
      {
        name: 'Sensor Calibration',
        description: 'Calibrate automation sensors',
        scheduleType: 'CALIBRATION',
        frequency: 'QUARTERLY',
        intervalDays: 90,
        priority: 'HIGH',
      },
    ],
  };

  const schedules = defaultSchedules[category as keyof typeof defaultSchedules] || [];

  for (const schedule of schedules) {
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + schedule.intervalDays);

    await prisma.maintenanceSchedule.create({
      data: {
        equipmentId: equipmentId,
        name: schedule.name,
        description: schedule.description,
        scheduleType: schedule.scheduleType as any,
        frequency: schedule.frequency as any,
        intervalDays: schedule.intervalDays,
        nextDue: nextDue,
        priority: schedule.priority as any,
      },
    });
  }
}