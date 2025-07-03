import { prisma } from '@/lib/prisma';

export interface MaintenanceAlert {
  id: string;
  type: 'overdue' | 'upcoming' | 'predictive' | 'guarantee_violation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  facilityId: string;
  facilityName: string;
  equipmentId: string;
  equipmentName: string;
  scheduleId?: string;
  guaranteeId?: string;
  dueDate?: Date;
  healthScore?: number;
  createdAt: Date;
}

export interface PredictiveMaintenanceCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  consecutiveReadings?: number;
}

export class MaintenanceScheduler {
  
  /**
   * Get all maintenance alerts for a facility
   */
  static async getMaintenanceAlerts(facilityId?: string): Promise<MaintenanceAlert[]> {
    const alerts: MaintenanceAlert[] = [];
    const now = new Date();
    const upcoming = new Date();
    upcoming.setDate(upcoming.getDate() + 7);

    // Overdue maintenance
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
      type: 'overdue' as const,
      priority: 'critical' as const,
      title: `Overdue Maintenance: ${schedule.name}`,
      message: `${schedule.equipment.name} maintenance is overdue since ${schedule.nextDue.toDateString()}`,
      facilityId: schedule.equipment.facilityId,
      facilityName: schedule.equipment.facility.name,
      equipmentId: schedule.equipmentId,
      equipmentName: schedule.equipment.name,
      scheduleId: schedule.id,
      dueDate: schedule.nextDue,
      createdAt: schedule.nextDue,
    })));

    // Upcoming maintenance
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
      type: 'upcoming' as const,
      priority: schedule.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
      title: `Upcoming Maintenance: ${schedule.name}`,
      message: `${schedule.equipment.name} maintenance due on ${schedule.nextDue.toDateString()}`,
      facilityId: schedule.equipment.facilityId,
      facilityName: schedule.equipment.facility.name,
      equipmentId: schedule.equipmentId,
      equipmentName: schedule.equipment.name,
      scheduleId: schedule.id,
      dueDate: schedule.nextDue,
      createdAt: new Date(),
    })));

    // Predictive maintenance alerts
    const predictiveAlerts = await this.checkPredictiveMaintenanceConditions(facilityId);
    alerts.push(...predictiveAlerts);

    // Performance guarantee violations
    const guaranteeAlerts = await this.checkPerformanceGuaranteeViolations(facilityId);
    alerts.push(...guaranteeAlerts);

    return alerts.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * Check predictive maintenance conditions
   */
  static async checkPredictiveMaintenanceConditions(facilityId?: string): Promise<MaintenanceAlert[]> {
    const alerts: MaintenanceAlert[] = [];

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

    for (const schedule of predictiveSchedules) {
      const conditions = schedule.triggerConditions as any;
      
      // Check equipment health score
      if (schedule.equipment.healthScore < 80) {
        alerts.push({
          id: `predictive-health-${schedule.id}`,
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

      // Check custom trigger conditions
      if (conditions && Array.isArray(conditions)) {
        const triggeredConditions = await this.evaluatePredictiveConditions(
          schedule.equipmentId,
          conditions
        );

        for (const condition of triggeredConditions) {
          alerts.push({
            id: `predictive-${condition.metric}-${schedule.id}`,
            type: 'predictive',
            priority: 'medium',
            title: `Predictive Alert: ${condition.metric}`,
            message: `${schedule.equipment.name} ${condition.metric} is ${condition.operator} ${condition.threshold}`,
            facilityId: schedule.equipment.facilityId,
            facilityName: schedule.equipment.facility.name,
            equipmentId: schedule.equipmentId,
            equipmentName: schedule.equipment.name,
            scheduleId: schedule.id,
            createdAt: new Date(),
          });
        }
      }
    }

    return alerts;
  }

  /**
   * Check performance guarantee violations
   */
  static async checkPerformanceGuaranteeViolations(facilityId?: string): Promise<MaintenanceAlert[]> {
    const alerts: MaintenanceAlert[] = [];

    const guarantees = await prisma.performanceGuarantee.findMany({
      where: {
        status: 'ACTIVE',
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

    for (const guarantee of guarantees) {
      // Check if current value violates the guarantee
      const deviationPercent = Math.abs(
        (guarantee.currentValue - guarantee.targetValue) / guarantee.targetValue * 100
      );

      if (deviationPercent > 5) { // 5% tolerance
        alerts.push({
          id: `guarantee-${guarantee.id}`,
          type: 'guarantee_violation',
          priority: deviationPercent > 20 ? 'high' : 'medium',
          title: `Performance Guarantee Violation: ${guarantee.equipment.name}`,
          message: `${guarantee.guaranteeType} guarantee violated. Current: ${guarantee.currentValue} ${guarantee.measurementUnit}, Target: ${guarantee.targetValue} ${guarantee.measurementUnit}`,
          facilityId: guarantee.equipment.facilityId,
          facilityName: guarantee.equipment.facility.name,
          equipmentId: guarantee.equipmentId,
          equipmentName: guarantee.equipment.name,
          guaranteeId: guarantee.id,
          createdAt: guarantee.lastViolation || new Date(),
        });
      }
    }

    return alerts;
  }

  /**
   * Evaluate predictive maintenance conditions
   */
  static async evaluatePredictiveConditions(
    equipmentId: string,
    conditions: PredictiveMaintenanceCondition[]
  ): Promise<PredictiveMaintenanceCondition[]> {
    const triggeredConditions: PredictiveMaintenanceCondition[] = [];

    // Get recent sensor readings for the equipment
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        facility: {
          include: {
            sensorReadings: {
              where: {
                timestamp: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                },
              },
              orderBy: { timestamp: 'desc' },
            },
          },
        },
      },
    });

    if (!equipment) return triggeredConditions;

    for (const condition of conditions) {
      const relevantReadings = equipment.facility.sensorReadings.filter(
        reading => reading.sensorType === condition.metric
      );

      if (relevantReadings.length === 0) continue;

      const latestValue = relevantReadings[0].value;
      const isTriggered = this.evaluateCondition(latestValue, condition.operator, condition.threshold);

      if (isTriggered) {
        // Check for consecutive readings if specified
        if (condition.consecutiveReadings) {
          const consecutiveCount = this.countConsecutiveViolations(
            relevantReadings,
            condition.operator,
            condition.threshold
          );
          
          if (consecutiveCount >= condition.consecutiveReadings) {
            triggeredConditions.push(condition);
          }
        } else {
          triggeredConditions.push(condition);
        }
      }
    }

    return triggeredConditions;
  }

  /**
   * Evaluate a single condition
   */
  static evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      default: return false;
    }
  }

  /**
   * Count consecutive violations
   */
  static countConsecutiveViolations(
    readings: any[],
    operator: string,
    threshold: number
  ): number {
    let count = 0;
    
    for (const reading of readings) {
      if (this.evaluateCondition(reading.value, operator, threshold)) {
        count++;
      } else {
        break;
      }
    }
    
    return count;
  }

  /**
   * Schedule maintenance based on equipment runtime
   */
  static async scheduleRuntimeBasedMaintenance(equipmentId: string): Promise<void> {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        maintenanceSchedules: {
          where: {
            active: true,
            frequency: 'RUNTIME_BASED',
          },
        },
      },
    });

    if (!equipment) return;

    // Calculate runtime hours (this would typically come from equipment telemetry)
    const runtimeHours = await this.calculateEquipmentRuntime(equipmentId);

    for (const schedule of equipment.maintenanceSchedules) {
      if (schedule.intervalHours && runtimeHours >= schedule.intervalHours) {
        // Create maintenance record
        await prisma.maintenanceRecord.create({
          data: {
            equipmentId: equipmentId,
            maintenanceScheduleId: schedule.id,
            serviceType: schedule.scheduleType,
            description: `Runtime-based maintenance after ${runtimeHours} hours`,
            scheduledDate: new Date(),
            status: 'SCHEDULED',
          },
        });

        // Update next due date
        const nextDue = new Date();
        nextDue.setHours(nextDue.getHours() + schedule.intervalHours);
        
        await prisma.maintenanceSchedule.update({
          where: { id: schedule.id },
          data: { 
            nextDue: nextDue,
            lastPerformed: new Date(),
          },
        });
      }
    }
  }

  /**
   * Calculate equipment runtime (placeholder - would integrate with equipment APIs)
   */
  static async calculateEquipmentRuntime(equipmentId: string): Promise<number> {
    // This would typically integrate with equipment control systems
    // For now, return a placeholder value
    return 100; // hours
  }

  /**
   * Update maintenance schedule after completion
   */
  static async updateScheduleAfterMaintenance(
    scheduleId: string,
    maintenanceRecordId: string
  ): Promise<void> {
    const schedule = await prisma.maintenanceSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) return;

    // Calculate next due date
    const now = new Date();
    const nextDue = new Date(now);

    switch (schedule.frequency) {
      case 'DAILY':
        nextDue.setDate(nextDue.getDate() + (schedule.intervalDays || 1));
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
        // For runtime-based, we don't update here as it's based on actual runtime
        return;
      default:
        nextDue.setDate(nextDue.getDate() + (schedule.intervalDays || 30));
    }

    await prisma.maintenanceSchedule.update({
      where: { id: scheduleId },
      data: {
        nextDue: nextDue,
        lastPerformed: now,
      },
    });
  }

  /**
   * Get maintenance statistics for a facility
   */
  static async getMaintenanceStatistics(facilityId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalEquipment,
      overdueCount,
      upcomingCount,
      completedThisMonth,
      completedThisYear,
      averageHealthScore,
      guaranteeViolations,
    ] = await Promise.all([
      prisma.equipment.count({
        where: { facilityId },
      }),
      prisma.maintenanceSchedule.count({
        where: {
          active: true,
          nextDue: { lt: now },
          equipment: { facilityId },
        },
      }),
      prisma.maintenanceSchedule.count({
        where: {
          active: true,
          nextDue: { 
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
          equipment: { facilityId },
        },
      }),
      prisma.maintenanceRecord.count({
        where: {
          status: 'COMPLETED',
          startTime: { gte: startOfMonth },
          equipment: { facilityId },
        },
      }),
      prisma.maintenanceRecord.count({
        where: {
          status: 'COMPLETED',
          startTime: { gte: startOfYear },
          equipment: { facilityId },
        },
      }),
      prisma.equipment.aggregate({
        where: { facilityId },
        _avg: { healthScore: true },
      }),
      prisma.performanceGuarantee.count({
        where: {
          status: 'VIOLATED',
          equipment: { facilityId },
        },
      }),
    ]);

    return {
      totalEquipment,
      overdueCount,
      upcomingCount,
      completedThisMonth,
      completedThisYear,
      averageHealthScore: averageHealthScore._avg.healthScore || 0,
      guaranteeViolations,
      complianceRate: totalEquipment > 0 ? 
        ((totalEquipment - overdueCount) / totalEquipment * 100) : 100,
    };
  }
}