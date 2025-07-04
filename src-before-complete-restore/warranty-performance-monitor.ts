import { prisma } from '@/lib/prisma';

export interface WarrantyAlert {
  id: string;
  type: 'warranty_expiring' | 'warranty_expired' | 'guarantee_violation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  equipmentId: string;
  equipmentName: string;
  facilityId: string;
  facilityName: string;
  expirationDate?: Date;
  violationAmount?: number;
  penaltyAmount?: number;
  createdAt: Date;
}

export interface GuaranteeViolationReport {
  guaranteeId: string;
  equipmentId: string;
  equipmentName: string;
  guaranteeType: string;
  targetValue: number;
  currentValue: number;
  deviation: number;
  deviationPercent: number;
  penaltyAmount: number;
  violationDate: Date;
  resolved: boolean;
}

export class WarrantyPerformanceMonitor {
  
  /**
   * Get all warranty and performance alerts
   */
  static async getWarrantyAndPerformanceAlerts(facilityId?: string): Promise<WarrantyAlert[]> {
    const alerts: WarrantyAlert[] = [];
    
    // Warranty expiration alerts
    const warrantyAlerts = await this.getWarrantyExpirationAlerts(facilityId);
    alerts.push(...warrantyAlerts);
    
    // Performance guarantee violations
    const performanceAlerts = await this.getPerformanceGuaranteeAlerts(facilityId);
    alerts.push(...performanceAlerts);
    
    return alerts.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * Get warranty expiration alerts
   */
  static async getWarrantyExpirationAlerts(facilityId?: string): Promise<WarrantyAlert[]> {
    const alerts: WarrantyAlert[] = [];
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    const whereClause: any = {};
    if (facilityId) {
      whereClause.facilityId = facilityId;
    }

    // Expired warranties
    const expiredEquipment = await prisma.equipment.findMany({
      where: {
        ...whereClause,
        warrantyEnd: { lt: now },
        status: { not: 'DECOMMISSIONED' },
      },
      include: {
        facility: {
          select: { id: true, name: true },
        },
      },
    });

    alerts.push(...expiredEquipment.map(equipment => ({
      id: `warranty-expired-${equipment.id}`,
      type: 'warranty_expired' as const,
      priority: 'high' as const,
      title: `Warranty Expired: ${equipment.name}`,
      message: `Warranty expired on ${equipment.warrantyEnd.toDateString()}`,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      facilityId: equipment.facilityId,
      facilityName: equipment.facility.name,
      expirationDate: equipment.warrantyEnd,
      createdAt: equipment.warrantyEnd,
    })));

    // Warranties expiring within 1 month (critical)
    const criticalExpiringEquipment = await prisma.equipment.findMany({
      where: {
        ...whereClause,
        warrantyEnd: { 
          gte: now,
          lte: oneMonthFromNow,
        },
        status: { not: 'DECOMMISSIONED' },
      },
      include: {
        facility: {
          select: { id: true, name: true },
        },
      },
    });

    alerts.push(...criticalExpiringEquipment.map(equipment => ({
      id: `warranty-expiring-critical-${equipment.id}`,
      type: 'warranty_expiring' as const,
      priority: 'critical' as const,
      title: `Warranty Expiring Soon: ${equipment.name}`,
      message: `Warranty expires on ${equipment.warrantyEnd.toDateString()} (within 1 month)`,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      facilityId: equipment.facilityId,
      facilityName: equipment.facility.name,
      expirationDate: equipment.warrantyEnd,
      createdAt: new Date(),
    })));

    // Warranties expiring within 3 months (medium priority)
    const mediumExpiringEquipment = await prisma.equipment.findMany({
      where: {
        ...whereClause,
        warrantyEnd: { 
          gt: oneMonthFromNow,
          lte: threeMonthsFromNow,
        },
        status: { not: 'DECOMMISSIONED' },
      },
      include: {
        facility: {
          select: { id: true, name: true },
        },
      },
    });

    alerts.push(...mediumExpiringEquipment.map(equipment => ({
      id: `warranty-expiring-medium-${equipment.id}`,
      type: 'warranty_expiring' as const,
      priority: 'medium' as const,
      title: `Warranty Expiring: ${equipment.name}`,
      message: `Warranty expires on ${equipment.warrantyEnd.toDateString()} (within 3 months)`,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      facilityId: equipment.facilityId,
      facilityName: equipment.facility.name,
      expirationDate: equipment.warrantyEnd,
      createdAt: new Date(),
    })));

    return alerts;
  }

  /**
   * Get performance guarantee violation alerts
   */
  static async getPerformanceGuaranteeAlerts(facilityId?: string): Promise<WarrantyAlert[]> {
    const alerts: WarrantyAlert[] = [];

    const whereClause: any = {
      status: 'ACTIVE',
    };

    if (facilityId) {
      whereClause.equipment = { facilityId };
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
          where: { resolved: false },
          orderBy: { violationDate: 'desc' },
          take: 1,
        },
      },
    });

    for (const guarantee of guarantees) {
      // Check current performance
      const deviationPercent = Math.abs(
        (guarantee.currentValue - guarantee.targetValue) / guarantee.targetValue * 100
      );

      if (deviationPercent > 5) { // 5% tolerance
        const penaltyAmount = this.calculatePenalty(guarantee, deviationPercent);
        
        alerts.push({
          id: `guarantee-violation-${guarantee.id}`,
          type: 'guarantee_violation',
          priority: deviationPercent > 20 ? 'critical' : deviationPercent > 10 ? 'high' : 'medium',
          title: `Performance Guarantee Violation: ${guarantee.equipment.name}`,
          message: `${guarantee.guaranteeType} target: ${guarantee.targetValue} ${guarantee.measurementUnit}, Current: ${guarantee.currentValue} ${guarantee.measurementUnit} (${deviationPercent.toFixed(1)}% deviation)`,
          equipmentId: guarantee.equipmentId,
          equipmentName: guarantee.equipment.name,
          facilityId: guarantee.equipment.facilityId,
          facilityName: guarantee.equipment.facility.name,
          violationAmount: deviationPercent,
          penaltyAmount: penaltyAmount,
          createdAt: guarantee.lastViolation || new Date(),
        });
      }
    }

    return alerts;
  }

  /**
   * Monitor and update equipment performance metrics
   */
  static async updateEquipmentPerformanceMetrics(equipmentId: string): Promise<void> {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        performanceGuarantees: {
          where: { status: 'ACTIVE' },
        },
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

    if (!equipment) return;

    // Calculate health score based on various factors
    let healthScore = 100;
    
    // Factor in age
    const ageInYears = (Date.now() - equipment.installDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
    healthScore -= Math.min(ageInYears * 2, 20); // Reduce up to 20 points for age

    // Factor in maintenance history
    const recentMaintenanceCount = await prisma.maintenanceRecord.count({
      where: {
        equipmentId: equipmentId,
        status: 'COMPLETED',
        startTime: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    const overdueMaintenanceCount = await prisma.maintenanceSchedule.count({
      where: {
        equipmentId: equipmentId,
        active: true,
        nextDue: { lt: new Date() },
      },
    });

    healthScore -= overdueMaintenanceCount * 10; // -10 points per overdue maintenance
    healthScore += Math.min(recentMaintenanceCount * 5, 15); // +5 points per recent maintenance, up to 15

    // Factor in sensor readings for equipment health
    const temperatureReadings = equipment.facility.sensorReadings.filter(r => r.sensorType === 'temperature');
    const vibrationReadings = equipment.facility.sensorReadings.filter(r => r.sensorType === 'vibration');

    if (temperatureReadings.length > 0) {
      const avgTemp = temperatureReadings.reduce((sum, r) => sum + r.value, 0) / temperatureReadings.length;
      // Assume optimal temperature is 20-25°C for most equipment
      if (avgTemp > 35 || avgTemp < 10) {
        healthScore -= 15;
      } else if (avgTemp > 30 || avgTemp < 15) {
        healthScore -= 5;
      }
    }

    if (vibrationReadings.length > 0) {
      const avgVibration = vibrationReadings.reduce((sum, r) => sum + r.value, 0) / vibrationReadings.length;
      // High vibration indicates potential issues
      if (avgVibration > 10) {
        healthScore -= 20;
      } else if (avgVibration > 5) {
        healthScore -= 10;
      }
    }

    healthScore = Math.max(0, Math.min(100, healthScore));

    // Update equipment health score
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { healthScore },
    });

    // Check performance guarantees
    for (const guarantee of equipment.performanceGuarantees) {
      await this.checkPerformanceGuarantee(guarantee.id, equipmentId);
    }
  }

  /**
   * Check and update a specific performance guarantee
   */
  static async checkPerformanceGuarantee(guaranteeId: string, equipmentId: string): Promise<void> {
    const guarantee = await prisma.performanceGuarantee.findUnique({
      where: { id: guaranteeId },
      include: {
        equipment: true,
      },
    });

    if (!guarantee) return;

    // Get current metric value based on guarantee type
    let currentValue = 0;

    switch (guarantee.guaranteeType) {
      case 'UPTIME':
        currentValue = guarantee.equipment.uptime;
        break;
      case 'EFFICIENCY':
        currentValue = await this.calculateEfficiency(equipmentId);
        break;
      case 'OUTPUT':
        currentValue = await this.calculateOutput(equipmentId);
        break;
      case 'QUALITY':
        currentValue = await this.calculateQuality(equipmentId);
        break;
      case 'ENERGY_SAVINGS':
        currentValue = await this.calculateEnergySavings(equipmentId);
        break;
      default:
        // For custom guarantees, try to get from sensor readings
        currentValue = await this.getCustomMetricValue(equipmentId, guarantee.targetMetric);
    }

    // Update current value
    await prisma.performanceGuarantee.update({
      where: { id: guaranteeId },
      data: { currentValue },
    });

    // Check for violation
    const deviationPercent = Math.abs(
      (currentValue - guarantee.targetValue) / guarantee.targetValue * 100
    );

    if (deviationPercent > 5) { // 5% tolerance
      // Create violation record
      const violationExists = await prisma.guaranteeViolation.findFirst({
        where: {
          performanceGuaranteeId: guaranteeId,
          violationDate: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
          resolved: false,
        },
      });

      if (!violationExists) {
        const penaltyAmount = this.calculatePenalty(guarantee, deviationPercent);

        await prisma.guaranteeViolation.create({
          data: {
            performanceGuaranteeId: guaranteeId,
            violationDate: new Date(),
            actualValue: currentValue,
            targetValue: guarantee.targetValue,
            deviationPercent: deviationPercent,
            penaltyAmount: penaltyAmount,
            description: `${guarantee.guaranteeType} guarantee violated. Target: ${guarantee.targetValue}, Actual: ${currentValue}`,
          },
        });

        // Update guarantee status and violation count
        await prisma.performanceGuarantee.update({
          where: { id: guaranteeId },
          data: {
            status: 'VIOLATED',
            violations: { increment: 1 },
            lastViolation: new Date(),
            penaltiesApplied: { increment: penaltyAmount },
          },
        });
      }
    } else {
      // Performance is within tolerance, update status if it was violated
      if (guarantee.status === 'VIOLATED') {
        await prisma.performanceGuarantee.update({
          where: { id: guaranteeId },
          data: { status: 'ACTIVE' },
        });
      }
    }
  }

  /**
   * Calculate penalty amount based on violation severity
   */
  static calculatePenalty(guarantee: any, deviationPercent: number): number {
    if (!guarantee.penaltyStructure) return 0;

    const structure = guarantee.penaltyStructure as any;
    let penalty = 0;

    // Example penalty structure:
    // { "5-10%": 100, "10-20%": 500, "20%+": 1000 }
    if (deviationPercent > 20 && structure['20%+']) {
      penalty = structure['20%+'];
    } else if (deviationPercent > 10 && structure['10-20%']) {
      penalty = structure['10-20%'];
    } else if (deviationPercent > 5 && structure['5-10%']) {
      penalty = structure['5-10%'];
    }

    // Cap penalty at maximum
    if (guarantee.maxPenalty && penalty > guarantee.maxPenalty) {
      penalty = guarantee.maxPenalty;
    }

    return penalty;
  }

  /**
   * Calculate equipment efficiency
   */
  static async calculateEfficiency(equipmentId: string): Promise<number> {
    // This would integrate with equipment control systems
    // For now, return a placeholder calculation
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) return 0;

    // Simple efficiency calculation based on health score
    return equipment.healthScore * 0.95; // Assume efficiency correlates with health
  }

  /**
   * Calculate equipment output
   */
  static async calculateOutput(equipmentId: string): Promise<number> {
    // This would measure actual vs expected output
    // For now, return a placeholder value
    return 85; // percentage of expected output
  }

  /**
   * Calculate quality metric
   */
  static async calculateQuality(equipmentId: string): Promise<number> {
    // This would measure quality metrics specific to equipment type
    // For now, return a placeholder value
    return 92; // quality score out of 100
  }

  /**
   * Calculate energy savings
   */
  static async calculateEnergySavings(equipmentId: string): Promise<number> {
    // This would compare current vs baseline energy consumption
    // For now, return a placeholder value
    return 15; // percentage savings
  }

  /**
   * Get custom metric value from sensor readings
   */
  static async getCustomMetricValue(equipmentId: string, metric: string): Promise<number> {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        facility: {
          include: {
            sensorReadings: {
              where: {
                sensorType: metric,
                timestamp: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                },
              },
              orderBy: { timestamp: 'desc' },
              take: 10,
            },
          },
        },
      },
    });

    if (!equipment || equipment.facility.sensorReadings.length === 0) return 0;

    // Calculate average value from recent readings
    const sum = equipment.facility.sensorReadings.reduce((acc, reading) => acc + reading.value, 0);
    return sum / equipment.facility.sensorReadings.length;
  }

  /**
   * Generate warranty and performance report
   */
  static async generateWarrantyPerformanceReport(facilityId: string) {
    const [
      totalEquipment,
      warrantyExpiredCount,
      warrantyExpiringCount,
      activeGuarantees,
      violatedGuarantees,
      totalPenalties,
      averageHealthScore,
    ] = await Promise.all([
      prisma.equipment.count({
        where: { facilityId },
      }),
      prisma.equipment.count({
        where: {
          facilityId,
          warrantyEnd: { lt: new Date() },
          status: { not: 'DECOMMISSIONED' },
        },
      }),
      prisma.equipment.count({
        where: {
          facilityId,
          warrantyEnd: {
            gte: new Date(),
            lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Next 90 days
          },
          status: { not: 'DECOMMISSIONED' },
        },
      }),
      prisma.performanceGuarantee.count({
        where: {
          status: 'ACTIVE',
          equipment: { facilityId },
        },
      }),
      prisma.performanceGuarantee.count({
        where: {
          status: 'VIOLATED',
          equipment: { facilityId },
        },
      }),
      prisma.performanceGuarantee.aggregate({
        where: {
          equipment: { facilityId },
        },
        _sum: { penaltiesApplied: true },
      }),
      prisma.equipment.aggregate({
        where: { facilityId },
        _avg: { healthScore: true },
      }),
    ]);

    const warrantyComplianceRate = totalEquipment > 0 ? 
      ((totalEquipment - warrantyExpiredCount) / totalEquipment * 100) : 100;

    const guaranteeComplianceRate = activeGuarantees > 0 ? 
      ((activeGuarantees - violatedGuarantees) / activeGuarantees * 100) : 100;

    return {
      totalEquipment,
      warrantyExpiredCount,
      warrantyExpiringCount,
      warrantyComplianceRate,
      activeGuarantees,
      violatedGuarantees,
      guaranteeComplianceRate,
      totalPenalties: totalPenalties._sum.penaltiesApplied || 0,
      averageHealthScore: averageHealthScore._avg.healthScore || 0,
    };
  }
}