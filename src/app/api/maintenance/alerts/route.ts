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
    const type = searchParams.get('type'); // 'overdue', 'upcoming', 'predictive'

    const now = new Date();
    const upcoming = new Date();
    upcoming.setDate(upcoming.getDate() + 7); // Next 7 days

    let alerts: any[] = [];

    // Overdue maintenance alerts
    if (!type || type === 'overdue') {
      const overdueSchedules = await prisma.maintenanceSchedule.findMany({
        where: {
          active: true,
          nextDue: { lt: now },
          ...(facilityId && {
            equipment: { facilityId },
          }),
        },
        include: {
          equipment: {
            include: {
              facility: { select: { id: true, name: true } },
            },
          },
        },
      });

      alerts.push(...overdueSchedules.map(schedule => ({
        id: `overdue-${schedule.id}`,
        type: 'overdue',
        priority: 'critical',
        title: `Overdue Maintenance: ${schedule.name}`,
        message: `${schedule.equipment.name} maintenance is overdue since ${schedule.nextDue.toISOString().split('T')[0]}`,
        facilityId: schedule.equipment.facilityId,
        facilityName: schedule.equipment.facility.name,
        equipmentId: schedule.equipmentId,
        equipmentName: schedule.equipment.name,
        scheduleId: schedule.id,
        createdAt: schedule.nextDue,
      })));
    }

    // Upcoming maintenance alerts
    if (!type || type === 'upcoming') {
      const upcomingSchedules = await prisma.maintenanceSchedule.findMany({
        where: {
          active: true,
          nextDue: { 
            gte: now,
            lte: upcoming,
          },
          ...(facilityId && {
            equipment: { facilityId },
          }),
        },
        include: {
          equipment: {
            include: {
              facility: { select: { id: true, name: true } },
            },
          },
        },
      });

      alerts.push(...upcomingSchedules.map(schedule => ({
        id: `upcoming-${schedule.id}`,
        type: 'upcoming',
        priority: schedule.priority.toLowerCase(),
        title: `Upcoming Maintenance: ${schedule.name}`,
        message: `${schedule.equipment.name} maintenance due on ${schedule.nextDue.toISOString().split('T')[0]}`,
        facilityId: schedule.equipment.facilityId,
        facilityName: schedule.equipment.facility.name,
        equipmentId: schedule.equipmentId,
        equipmentName: schedule.equipment.name,
        scheduleId: schedule.id,
        createdAt: schedule.nextDue,
      })));
    }

    // Predictive maintenance alerts
    if (!type || type === 'predictive') {
      const predictiveSchedules = await prisma.maintenanceSchedule.findMany({
        where: {
          active: true,
          predictiveEnabled: true,
          ...(facilityId && {
            equipment: { facilityId },
          }),
        },
        include: {
          equipment: {
            include: {
              facility: { select: { id: true, name: true } },
            },
          },
        },
      });

      // Check equipment health scores for predictive alerts
      for (const schedule of predictiveSchedules) {
        if (schedule.equipment.healthScore < 80) {
          alerts.push({
            id: `predictive-${schedule.id}`,
            type: 'predictive',
            priority: schedule.equipment.healthScore < 60 ? 'high' : 'medium',
            title: `Predictive Maintenance Alert: ${schedule.equipment.name}`,
            message: `Equipment health score is ${schedule.equipment.healthScore}%. Consider scheduling maintenance.`,
            facilityId: schedule.equipment.facilityId,
            facilityName: schedule.equipment.facility.name,
            equipmentId: schedule.equipmentId,
            equipmentName: schedule.equipment.name,
            scheduleId: schedule.id,
            healthScore: schedule.equipment.healthScore,
            createdAt: new Date(),
          });
        }
      }
    }

    // Performance guarantee violation alerts
    const guaranteeViolations = await prisma.performanceGuarantee.findMany({
      where: {
        status: 'ACTIVE',
        violations: { gt: 0 },
        ...(facilityId && {
          equipment: { facilityId },
        }),
      },
      include: {
        equipment: {
          include: {
            facility: { select: { id: true, name: true } },
          },
        },
        violations: {
          where: { resolved: false },
          orderBy: { violationDate: 'desc' },
          take: 1,
        },
      },
    });

    alerts.push(...guaranteeViolations.map(guarantee => ({
      id: `guarantee-${guarantee.id}`,
      type: 'guarantee_violation',
      priority: 'high',
      title: `Performance Guarantee Violation: ${guarantee.equipment.name}`,
      message: `${guarantee.guaranteeType} guarantee violated. Current: ${guarantee.currentValue}, Target: ${guarantee.targetValue}`,
      facilityId: guarantee.equipment.facilityId,
      facilityName: guarantee.equipment.facility.name,
      equipmentId: guarantee.equipmentId,
      equipmentName: guarantee.equipment.name,
      guaranteeId: guarantee.id,
      createdAt: guarantee.lastViolation || new Date(),
    })));

    // Sort alerts by priority and date
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    alerts.sort((a, b) => {
      const priorityDiff = (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
                          (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching maintenance alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}