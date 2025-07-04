import { prisma } from '@/lib/prisma';
import { TwilioService } from '@/lib/communications/twilio-service';
import { getNotificationService, AlertBuilder } from '@/lib/notifications/notification-service';
import { CO2EnrichmentController } from '@/lib/environmental/co2-enrichment-controller';
import { PlantStressDetector } from '@/lib/monitoring/plant-stress-detector';
import { HydroponicSystemController } from '@/lib/hydroponic/hydroponic-system-controller';
import { EnergyOptimizationController } from '@/lib/energy/energy-optimization-controller';
import { FarquharPhotosynthesisModel } from '@/lib/plant-science/farquhar-photosynthesis-model';

interface SmartAlertConfig {
  facilityId: string;
  userId: string;
  preferences: any; // User alert preferences
  twilioService?: TwilioService;
  notificationService?: any;
}

export class SmartAlertService {
  private config: SmartAlertConfig;
  private alertHistory: Map<string, Date> = new Map(); // Prevent alert spam
  private alertThrottleMinutes = 30; // Minimum time between same alerts

  constructor(config: SmartAlertConfig) {
    this.config = config;
    
    // Initialize services if not provided
    if (!config.twilioService && config.preferences?.sms?.enabled) {
      this.config.twilioService = new TwilioService({
        region: process.env.TWILIO_REGION || 'us-east',
        multiRegion: {
          primary: 'us-east',
          fallback: ['us-west', 'eu-west'],
          loadBalancing: 'geographic',
        },
      });
    }
  }

  // Process sensor data and generate alerts
  async processSensorData(sensorData: any) {
    const alerts: any[] = [];

    // Environmental alerts
    if (this.isAlertEnabled('temp_high') && sensorData.temperature > this.getThreshold('temperature.max')) {
      alerts.push(this.createEnvironmentalAlert('temp_high', sensorData));
    }
    
    if (this.isAlertEnabled('humidity_low') && sensorData.humidity < this.getThreshold('humidity.min')) {
      alerts.push(this.createEnvironmentalAlert('humidity_low', sensorData));
    }

    if (this.isAlertEnabled('co2_high') && sensorData.co2 > 5000) {
      alerts.push(this.createCriticalCO2Alert(sensorData));
    }

    // Process all alerts
    for (const alert of alerts.filter(Boolean)) {
      await this.sendAlert(alert);
    }
  }

  // Process plant health data
  async processPlantHealth(stressReport: any) {
    const alerts: any[] = [];

    // High stress alert
    if (this.isAlertEnabled('plant_stress_high') && stressReport.overallStressScore > 30) {
      alerts.push({
        id: 'plant_stress_high',
        severity: stressReport.overallStressScore > 50 ? 'critical' : 'high',
        title: 'High Plant Stress Detected',
        message: `Plant stress level at ${stressReport.overallStressScore}% in ${stressReport.zone}`,
        metadata: {
          stressLevel: stressReport.overallStressScore,
          zone: stressReport.zone,
          stressFactors: stressReport.stressFactors,
        },
        cameraZone: stressReport.zone,
      });
    }

    // Nutrient deficiency alerts
    if (this.isAlertEnabled('nutrient_deficiency') && stressReport.nutrientDeficiencies) {
      const deficiencies = Object.entries(stressReport.nutrientDeficiencies)
        .filter(([_, def]: [string, any]) => def.severity > 10);
      
      if (deficiencies.length > 0) {
        alerts.push({
          id: 'nutrient_deficiency',
          severity: 'high',
          title: 'Nutrient Deficiency Detected',
          message: `${deficiencies.map(([n]) => n).join(', ')} deficiency in ${stressReport.zone}`,
          metadata: {
            nutrients: Object.fromEntries(deficiencies),
            zone: stressReport.zone,
          },
          cameraZone: stressReport.zone,
        });
      }
    }

    // Disease risk alert
    if (this.isAlertEnabled('disease_risk') && stressReport.diseaseRisk?.overall > 40) {
      alerts.push({
        id: 'disease_risk',
        severity: 'critical',
        title: 'High Disease Risk',
        message: `Disease risk at ${stressReport.diseaseRisk.overall}% - ${stressReport.diseaseRisk.type}`,
        metadata: {
          diseaseRisk: stressReport.diseaseRisk,
          zone: stressReport.zone,
          recommendedActions: [
            'Reduce humidity immediately',
            'Increase air circulation',
            'Inspect plants for symptoms',
            'Consider preventive treatment',
          ],
        },
        cameraZone: stressReport.zone,
      });
    }

    // Process all alerts
    for (const alert of alerts) {
      await this.sendAlert(alert);
    }
  }

  // Process equipment status
  async processEquipmentStatus(equipment: any) {
    if (!this.isAlertEnabled('equipment_failure')) return;

    if (equipment.status === 'offline' || equipment.status === 'error') {
      const alert = {
        id: 'equipment_failure',
        severity: equipment.critical ? 'critical' : 'high',
        title: `${equipment.type} Failure`,
        message: `${equipment.name} is ${equipment.status} in ${equipment.zone}`,
        metadata: {
          equipmentId: equipment.id,
          type: equipment.type,
          zone: equipment.zone,
          lastSeen: equipment.lastSeen,
        },
        cameraZone: equipment.zone,
      };

      await this.sendAlert(alert);
    }
  }

  // Process energy events
  async processEnergyEvent(event: any) {
    if (event.type === 'demand_response' && this.isAlertEnabled('demand_response')) {
      const alert = {
        id: 'demand_response',
        severity: 'medium',
        title: 'Demand Response Event',
        message: `Utility requesting ${event.reductionTarget}% load reduction from ${event.startTime} to ${event.endTime}`,
        metadata: {
          eventId: event.id,
          reductionTarget: event.reductionTarget,
          incentiveRate: event.incentiveRate,
          suggestedActions: [
            'Dim non-critical lighting by 30%',
            'Increase temperature setpoint by 2°F',
            'Delay nutrient mixing pumps',
          ],
        },
      };

      await this.sendAlert(alert);
    }

    if (event.type === 'peak_warning' && this.isAlertEnabled('demand_peak')) {
      const alert = {
        id: 'demand_peak',
        severity: 'high',
        title: 'Approaching Demand Peak',
        message: `Current demand ${event.currentDemand}kW approaching limit of ${event.peakLimit}kW`,
        metadata: {
          currentDemand: event.currentDemand,
          peakLimit: event.peakLimit,
          projectedCost: event.projectedCost,
        },
      };

      await this.sendAlert(alert);
    }
  }

  // Send alert through configured channels
  private async sendAlert(alert: any) {
    // Check throttling
    const throttleKey = `${alert.id}-${alert.metadata?.zone || 'facility'}`;
    const lastSent = this.alertHistory.get(throttleKey);
    if (lastSent && Date.now() - lastSent.getTime() < this.alertThrottleMinutes * 60 * 1000) {
      return; // Skip - too soon
    }

    const pref = this.config.preferences?.preferences?.[alert.id];
    if (!pref?.enabled) return;

    // Record alert
    this.alertHistory.set(throttleKey, new Date());

    // Save to database
    const dbAlert = await prisma.alert.create({
      data: {
        facilityId: this.config.facilityId,
        type: alert.id,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        metadata: alert.metadata,
        zone: alert.metadata?.zone,
        acknowledged: false,
      },
    });

    // Get camera for zone if available
    let camera;
    if (alert.cameraZone) {
      camera = await prisma.camera.findFirst({
        where: {
          facilityId: this.config.facilityId,
          zone: alert.cameraZone,
          alertAccess: true,
        },
      });
    }

    // Send through each configured method
    const promises = [];

    if (pref.methods.includes('sms') && this.config.preferences.phoneNumber) {
      promises.push(this.sendSMS(alert, camera));
    }

    if (pref.methods.includes('call') && alert.severity === 'critical' && this.config.preferences.phoneNumber) {
      promises.push(this.sendVoiceCall(alert));
    }

    if (pref.methods.includes('email') && this.config.preferences.email) {
      promises.push(this.sendEmail(alert, camera));
    }

    if (pref.methods.includes('push')) {
      promises.push(this.sendPushNotification(alert));
    }

    await Promise.allSettled(promises);
  }

  private async sendSMS(alert: any, camera?: any) {
    if (!this.config.twilioService) return;

    let message = `🚨 VibeLux Alert\n${alert.title}\n${alert.message}`;
    
    // Add key details based on alert type
    if (alert.metadata?.stressLevel) {
      message += `\nStress: ${alert.metadata.stressLevel}%`;
    }
    if (alert.metadata?.nutrients) {
      const nutrients = Object.keys(alert.metadata.nutrients).join(', ');
      message += `\nDeficient: ${nutrients}`;
    }
    
    // Add camera link if available
    if (camera) {
      message += `\nView camera: ${process.env.NEXT_PUBLIC_APP_URL}/camera/${camera.id}`;
    } else {
      message += `\nView details: ${process.env.NEXT_PUBLIC_APP_URL}/alerts`;
    }

    await this.config.twilioService.sendSMS({
      to: this.config.preferences.phoneNumber,
      message: message.substring(0, 160), // SMS limit
    });
  }

  private async sendVoiceCall(alert: any) {
    if (!this.config.twilioService) return;

    const message = `
      This is an urgent alert from VibeLux.
      ${alert.title}.
      ${alert.message}.
      Please check your VibeLux dashboard immediately.
      This message will repeat once.
      ${alert.title}.
      ${alert.message}.
      Thank you.
    `;

    await this.config.twilioService.makeVoiceCall({
      to: this.config.preferences.phoneNumber,
      message,
      voiceType: 'female',
    });
  }

  private async sendEmail(alert: any, camera?: any) {
    // Use notification service to send email with rich formatting
    const enrichedAlert = {
      ...alert,
      cameraUrl: camera ? `${process.env.NEXT_PUBLIC_APP_URL}/camera/${camera.id}` : null,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/alerts`,
      timestamp: new Date(),
    };

    // Email sending would be handled by notification service
  }

  private async sendPushNotification(alert: any) {
    // Send push notification through mobile app service
    // This would integrate with Firebase/OneSignal/etc
  }

  // Helper methods
  private isAlertEnabled(alertId: string): boolean {
    return this.config.preferences?.preferences?.[alertId]?.enabled || false;
  }

  private getThreshold(path: string): number {
    const parts = path.split('.');
    let value = this.config.preferences?.thresholds;
    for (const part of parts) {
      value = value?.[part];
    }
    return value || 0;
  }

  private createEnvironmentalAlert(type: string, sensorData: any) {
    const alerts: Record<string, any> = {
      temp_high: {
        id: 'temp_high',
        severity: sensorData.temperature > 90 ? 'critical' : 'high',
        title: 'High Temperature Alert',
        message: `Temperature at ${sensorData.temperature.toFixed(1)}°F in ${sensorData.zone}`,
        metadata: { 
          temperature: sensorData.temperature,
          zone: sensorData.zone,
        },
      },
      humidity_low: {
        id: 'humidity_low',
        severity: 'medium',
        title: 'Low Humidity Alert',
        message: `Humidity at ${sensorData.humidity.toFixed(0)}% in ${sensorData.zone}`,
        metadata: {
          humidity: sensorData.humidity,
          zone: sensorData.zone,
        },
      },
    };

    return alerts[type];
  }

  private createCriticalCO2Alert(sensorData: any) {
    return {
      id: 'co2_high',
      severity: 'critical',
      title: 'CRITICAL: High CO2 Levels',
      message: `CO2 at ${sensorData.co2}ppm - EVACUATE ${sensorData.zone} immediately!`,
      metadata: {
        currentLevel: sensorData.co2,
        zone: sensorData.zone,
        actions: [
          'Evacuate area immediately',
          'Increase ventilation to maximum',
          'Check CO2 system for leaks',
          'Do not re-enter until levels below 1000ppm',
        ],
      },
      cameraZone: sensorData.zone,
    };
  }

  // Batch processing for multiple facilities
  static async processAllFacilities() {
    const facilities = await prisma.facility.findMany({
      where: { active: true },
      include: {
        owner: true,
        alertPreferences: true,
      },
    });

    for (const facility of facilities) {
      try {
        const service = new SmartAlertService({
          facilityId: facility.id,
          userId: facility.ownerId,
          preferences: facility.alertPreferences,
        });

        // Process latest sensor data
        const sensorData = await prisma.sensorReading.findMany({
          where: {
            facilityId: facility.id,
            timestamp: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
          },
          orderBy: { timestamp: 'desc' },
        });

        for (const reading of sensorData) {
          await service.processSensorData(reading);
        }
      } catch (error) {
        console.error(`Failed to process alerts for facility ${facility.id}:`, error);
      }
    }
  }
}