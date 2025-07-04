/**
 * Energy Monitoring & Alert Service
 * Real-time monitoring, anomaly detection, and notifications
 */

import { prisma } from '@/lib/prisma';
import { energyMonitoring } from '@/lib/energy-monitoring';
import { HardwareController } from '@/lib/integrations/hardware-control';

interface Alert {
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  facilityId: string;
  zoneId?: string;
  data?: any;
}

interface MonitoringThresholds {
  maxPowerDeviation: number; // Percentage
  minPowerFactor: number;
  maxTemperature: number;
  maxResponseTime: number; // milliseconds
  minDataCompleteness: number; // Percentage
}

export class EnergyMonitoringService {
  private hardwareController: HardwareController;
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  
  private thresholds: MonitoringThresholds = {
    maxPowerDeviation: 30, // 30% deviation triggers alert
    minPowerFactor: 0.85,
    maxTemperature: 35, // Celsius
    maxResponseTime: 5000, // 5 seconds
    minDataCompleteness: 90 // 90% data required
  };
  
  constructor() {
    this.hardwareController = HardwareController.getInstance();
  }
  
  /**
   * Start monitoring service
   */
  async start() {
    if (this.isMonitoring) {
      return;
    }
    
    this.isMonitoring = true;
    
    // Main monitoring loop - every minute
    this.monitoringInterval = setInterval(() => {
      this.runMonitoringCycle();
    }, 60 * 1000);
    
    // Health check - every 5 minutes
    this.healthCheckInterval = setInterval(() => {
      this.runHealthCheck();
    }, 5 * 60 * 1000);
    
    // Run immediately
    await this.runMonitoringCycle();
    await this.runHealthCheck();
    
  }
  
  /**
   * Stop monitoring service
   */
  async stop() {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
  }
  
  /**
   * Main monitoring cycle
   */
  private async runMonitoringCycle() {
    try {
      // Get all active facilities
      const facilities = await prisma.energy_optimization_config.findMany({
        where: { optimization_active: true },
        include: { lighting_zones: true }
      });
      
      for (const facility of facilities) {
        await this.monitorFacility(facility);
      }
    } catch (error) {
      console.error('Monitoring cycle error:', error);
      await this.createAlert({
        type: 'critical',
        title: 'Monitoring System Error',
        message: `Monitoring cycle failed: ${error.message}`,
        facilityId: 'system'
      });
    }
  }
  
  /**
   * Monitor a single facility
   */
  private async monitorFacility(facility: any) {
    const startTime = Date.now();
    
    try {
      // Collect readings from all zones
      for (const zone of facility.lighting_zones) {
        await this.monitorZone(facility, zone);
      }
      
      // Check overall facility metrics
      await this.checkFacilityMetrics(facility);
      
      // Log monitoring success
      const responseTime = Date.now() - startTime;
      if (responseTime > this.thresholds.maxResponseTime) {
        await this.createAlert({
          type: 'warning',
          title: 'Slow Monitoring Response',
          message: `Monitoring took ${responseTime}ms (threshold: ${this.thresholds.maxResponseTime}ms)`,
          facilityId: facility.facility_id
        });
      }
      
    } catch (error) {
      console.error(`Failed to monitor facility ${facility.facility_name}:`, error);
      await this.createAlert({
        type: 'critical',
        title: 'Facility Monitoring Failed',
        message: `Cannot monitor ${facility.facility_name}: ${error.message}`,
        facilityId: facility.facility_id
      });
    }
  }
  
  /**
   * Monitor a single zone
   */
  private async monitorZone(facility: any, zone: any) {
    try {
      // Get current readings from hardware
      const reading = await this.getZoneReading(zone);
      
      if (!reading) {
        throw new Error('No reading received from hardware');
      }
      
      // Store reading
      await prisma.power_readings.create({
        data: {
          facility_id: facility.facility_id,
          zone_id: zone.id,
          timestamp: new Date(),
          power_kw: reading.power,
          energy_kwh: reading.energy || 0,
          power_factor: reading.powerFactor || 0.95,
          voltage: reading.voltage || 240,
          current: reading.current || reading.power / 240,
          frequency: 60,
          rate_per_kwh: 0.12, // Would get from rate service
          rate_schedule: this.getCurrentRateSchedule(),
          source: 'meter',
          device_id: zone.device_id
        }
      });
      
      // Check for anomalies
      await this.checkZoneAnomalies(facility, zone, reading);
      
      // Check crop safety
      await this.checkCropSafety(facility, zone, reading);
      
    } catch (error) {
      console.error(`Failed to monitor zone ${zone.zone_name}:`, error);
      
      // Zone monitoring failure is serious
      await this.createAlert({
        type: 'critical',
        title: 'Zone Monitoring Failed',
        message: `Lost communication with ${zone.zone_name}. Check hardware connection.`,
        facilityId: facility.facility_id,
        zoneId: zone.id,
        data: { error: error.message }
      });
    }
  }
  
  /**
   * Get reading from hardware
   */
  private async getZoneReading(zone: any): Promise<any> {
    try {
      // Get device status from hardware controller
      const status = await this.hardwareController.getDeviceStatus(zone.device_id);
      
      if (!status || !status.online) {
        throw new Error('Device offline');
      }
      
      return {
        power: status.values?.power || zone.max_power_kw * (zone.current_intensity / 100),
        energy: status.values?.energy || 0,
        powerFactor: status.values?.powerFactor || 0.95,
        voltage: status.values?.voltage || 240,
        current: status.values?.current || 0,
        temperature: status.values?.temperature || 25,
        intensity: status.values?.intensity || zone.current_intensity
      };
      
    } catch (error) {
      // Fallback to calculated values
      console.warn(`Using calculated values for ${zone.zone_name}:`, error.message);
      return {
        power: zone.max_power_kw * (zone.current_intensity / 100),
        energy: 0,
        powerFactor: 0.95,
        voltage: 240,
        current: (zone.max_power_kw * (zone.current_intensity / 100)) / 240,
        temperature: 25,
        intensity: zone.current_intensity
      };
    }
  }
  
  /**
   * Check for zone anomalies
   */
  private async checkZoneAnomalies(facility: any, zone: any, reading: any) {
    // Get historical average (last 7 days, same hour)
    const historicalAvg = await this.getHistoricalAverage(
      facility.facility_id,
      zone.id,
      new Date().getHours()
    );
    
    if (!historicalAvg) return; // No historical data yet
    
    // Check power deviation
    const deviation = Math.abs(reading.power - historicalAvg.avgPower) / historicalAvg.avgPower * 100;
    
    if (deviation > this.thresholds.maxPowerDeviation) {
      await this.createAlert({
        type: 'warning',
        title: 'Unusual Power Consumption',
        message: `${zone.zone_name} power is ${deviation.toFixed(1)}% ${reading.power > historicalAvg.avgPower ? 'above' : 'below'} normal`,
        facilityId: facility.facility_id,
        zoneId: zone.id,
        data: {
          currentPower: reading.power,
          expectedPower: historicalAvg.avgPower,
          deviation: deviation
        }
      });
    }
    
    // Check power factor
    if (reading.powerFactor < this.thresholds.minPowerFactor) {
      await this.createAlert({
        type: 'warning',
        title: 'Low Power Factor',
        message: `${zone.zone_name} power factor is ${reading.powerFactor.toFixed(2)} (below ${this.thresholds.minPowerFactor})`,
        facilityId: facility.facility_id,
        zoneId: zone.id,
        data: {
          powerFactor: reading.powerFactor,
          recommendation: 'Consider power factor correction capacitors'
        }
      });
    }
    
    // Check temperature
    if (reading.temperature > this.thresholds.maxTemperature) {
      await this.createAlert({
        type: 'critical',
        title: 'High Temperature Alert',
        message: `${zone.zone_name} temperature is ${reading.temperature}°C (max: ${this.thresholds.maxTemperature}°C)`,
        facilityId: facility.facility_id,
        zoneId: zone.id,
        data: {
          temperature: reading.temperature,
          action: 'Automatic dimming may be triggered'
        }
      });
    }
  }
  
  /**
   * Check crop safety parameters
   */
  private async checkCropSafety(facility: any, zone: any, reading: any) {
    // Cannabis flowering critical check
    if (zone.crop_type === 'cannabis' && zone.growth_stage === 'flowering') {
      const hour = new Date().getHours();
      const expectedLightOn = hour >= 8 && hour < 20; // 12/12 cycle
      const actualLightOn = reading.intensity > 10;
      
      if (expectedLightOn !== actualLightOn) {
        await this.createAlert({
          type: 'critical',
          title: 'CRITICAL: Photoperiod Violation',
          message: `${zone.zone_name} lighting does not match 12/12 flowering schedule!`,
          facilityId: facility.facility_id,
          zoneId: zone.id,
          data: {
            expected: expectedLightOn ? 'ON' : 'OFF',
            actual: actualLightOn ? 'ON' : 'OFF',
            risk: 'Crop may revert to vegetative growth or hermaphrodite'
          }
        });
        
        // Attempt emergency correction
        await this.attemptEmergencyCorrection(zone, expectedLightOn);
      }
    }
    
    // Check DLI tracking
    const projectedDLI = await this.calculateProjectedDLI(zone, reading);
    const targetDLI = this.getTargetDLI(zone.crop_type, zone.growth_stage);
    
    if (projectedDLI < targetDLI * 0.8) {
      await this.createAlert({
        type: 'warning',
        title: 'Low DLI Projection',
        message: `${zone.zone_name} projected DLI is ${projectedDLI.toFixed(1)} mol/m²/d (target: ${targetDLI})`,
        facilityId: facility.facility_id,
        zoneId: zone.id,
        data: {
          projectedDLI,
          targetDLI,
          recommendation: 'Consider increasing intensity or photoperiod'
        }
      });
    }
  }
  
  /**
   * Check overall facility metrics
   */
  private async checkFacilityMetrics(facility: any) {
    // Calculate total power and savings
    const currentHour = new Date().getHours();
    const readings = await prisma.power_readings.findMany({
      where: {
        facility_id: facility.facility_id,
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      },
      orderBy: { timestamp: 'desc' }
    });
    
    if (readings.length === 0) return;
    
    const totalPower = readings.reduce((sum, r) => sum + r.power_kw, 0) / readings.length;
    const baselinePower = facility.lighting_zones.reduce((sum: number, z: any) => sum + z.max_power_kw, 0);
    const savingsPercent = ((baselinePower - totalPower) / baselinePower) * 100;
    
    // Update facility metrics
    await prisma.energy_optimization_config.update({
      where: { id: facility.id },
      data: { last_optimization_at: new Date() }
    });
    
    // Alert on significant savings
    if (savingsPercent > 20) {
      await this.createAlert({
        type: 'info',
        title: 'Excellent Energy Savings',
        message: `${facility.facility_name} is saving ${savingsPercent.toFixed(1)}% energy (${(baselinePower - totalPower).toFixed(1)} kW)`,
        facilityId: facility.facility_id,
        data: {
          totalPower,
          baselinePower,
          savingsPercent,
          monthlySavings: (baselinePower - totalPower) * 0.12 * 720 // Rough estimate
        }
      });
    }
  }
  
  /**
   * Run system health check
   */
  private async runHealthCheck() {
    
    try {
      // Check hardware connections
      const devices = await this.hardwareController.getRegisteredDevices();
      let offlineCount = 0;
      
      for (const device of devices) {
        const status = await this.hardwareController.getDeviceStatus(device.id);
        if (!status?.online) {
          offlineCount++;
        }
      }
      
      if (offlineCount > 0) {
        await this.createAlert({
          type: 'warning',
          title: 'Devices Offline',
          message: `${offlineCount} devices are not responding`,
          facilityId: 'system',
          data: { offlineCount, totalDevices: devices.length }
        });
      }
      
      // Check data completeness
      const dataCompleteness = await this.checkDataCompleteness();
      if (dataCompleteness < this.thresholds.minDataCompleteness) {
        await this.createAlert({
          type: 'warning',
          title: 'Low Data Quality',
          message: `Only ${dataCompleteness.toFixed(1)}% of expected readings received`,
          facilityId: 'system'
        });
      }
      
      // Check database performance
      const dbResponseTime = await this.checkDatabasePerformance();
      if (dbResponseTime > 1000) {
        await this.createAlert({
          type: 'warning',
          title: 'Database Performance',
          message: `Database queries taking ${dbResponseTime}ms (normal: <1000ms)`,
          facilityId: 'system'
        });
      }
      
      
    } catch (error) {
      console.error('Health check failed:', error);
      await this.createAlert({
        type: 'critical',
        title: 'Health Check Failed',
        message: `System health check failed: ${error.message}`,
        facilityId: 'system'
      });
    }
  }
  
  /**
   * Create and send alert
   */
  private async createAlert(alert: Alert) {
    try {
      // Store in database
      const dbAlert = await prisma.energy_system_alerts.create({
        data: {
          facility_id: alert.facilityId,
          alert_time: new Date(),
          alert_type: this.getAlertType(alert),
          severity: alert.type,
          title: alert.title,
          message: alert.message,
          zone_id: alert.zoneId,
          related_event_id: alert.data?.eventId
        }
      });
      
      // Send notifications based on severity
      if (alert.type === 'critical') {
        await this.sendCriticalNotifications(alert, dbAlert.id);
      } else if (alert.type === 'warning') {
        await this.sendWarningNotifications(alert, dbAlert.id);
      } else {
        await this.sendInfoNotifications(alert, dbAlert.id);
      }
      
      
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  }
  
  /**
   * Send critical notifications (email + SMS)
   */
  private async sendCriticalNotifications(alert: Alert, alertId: string) {
    // Get facility contact info
    const facility = await prisma.energy_optimization_config.findFirst({
      where: { facility_id: alert.facilityId }
    });
    
    if (!facility) return;
    
    // Send email
    if (facility.emergency_contact_email) {
      await this.sendEmail(
        facility.emergency_contact_email,
        `CRITICAL ALERT: ${alert.title}`,
        this.formatAlertEmail(alert, 'critical')
      );
      
      await prisma.energy_system_alerts.update({
        where: { id: alertId },
        data: { email_sent: true }
      });
    }
    
    // Send SMS for critical alerts
    if (facility.emergency_contact_phone) {
      await this.sendSMS(
        facility.emergency_contact_phone,
        `VIBELUX CRITICAL: ${alert.title}. ${alert.message}`
      );
      
      await prisma.energy_system_alerts.update({
        where: { id: alertId },
        data: { sms_sent: true }
      });
    }
  }
  
  /**
   * Send warning notifications (email only)
   */
  private async sendWarningNotifications(alert: Alert, alertId: string) {
    const facility = await prisma.energy_optimization_config.findFirst({
      where: { facility_id: alert.facilityId }
    });
    
    if (!facility?.emergency_contact_email) return;
    
    await this.sendEmail(
      facility.emergency_contact_email,
      `Warning: ${alert.title}`,
      this.formatAlertEmail(alert, 'warning')
    );
    
    await prisma.energy_system_alerts.update({
      where: { id: alertId },
      data: { email_sent: true }
    });
  }
  
  /**
   * Send info notifications (dashboard only)
   */
  private async sendInfoNotifications(alert: Alert, alertId: string) {
    // Info alerts are shown in dashboard only
    // Could send to websocket for real-time updates
  }
  
  /**
   * Emergency correction attempt
   */
  private async attemptEmergencyCorrection(zone: any, shouldBeOn: boolean) {
    try {
      
      await this.hardwareController.controlLighting({
        fixtureId: zone.device_id,
        intensity: shouldBeOn ? zone.current_intensity : 0
      });
      
      
    } catch (error) {
      console.error(`❌ FAILED to correct ${zone.zone_name}:`, error);
    }
  }
  
  // Helper methods
  
  private async getHistoricalAverage(facilityId: string, zoneId: string, hour: number) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const readings = await prisma.power_readings.findMany({
      where: {
        facility_id: facilityId,
        zone_id: zoneId,
        timestamp: { gte: oneWeekAgo }
      }
    });
    
    if (readings.length === 0) return null;
    
    const avgPower = readings.reduce((sum, r) => sum + r.power_kw, 0) / readings.length;
    
    return { avgPower };
  }
  
  private async calculateProjectedDLI(zone: any, reading: any): Promise<number> {
    const ppfd = (reading.intensity / 100) * 800; // Assume 800 PPFD at 100%
    const hoursRemaining = 24 - new Date().getHours();
    const photoperiodRemaining = Math.min(hoursRemaining, zone.current_photoperiod || 12);
    
    return (ppfd * photoperiodRemaining * 3600) / 1000000;
  }
  
  private getTargetDLI(cropType: string, growthStage: string): number {
    const dliTargets: Record<string, Record<string, number>> = {
      cannabis: { vegetative: 40, flowering: 35 },
      tomato: { vegetative: 25, flowering: 22 },
      lettuce: { vegetative: 17, flowering: 17 },
      strawberry: { vegetative: 20, flowering: 17 }
    };
    
    return dliTargets[cropType]?.[growthStage] || 20;
  }
  
  private getCurrentRateSchedule(): string {
    const hour = new Date().getHours();
    if (hour >= 14 && hour <= 19) return 'peak';
    if (hour >= 22 || hour < 6) return 'off-peak';
    return 'shoulder';
  }
  
  private getAlertType(alert: Alert): string {
    if (alert.title.includes('Safety') || alert.title.includes('Photoperiod')) return 'safety';
    if (alert.title.includes('Hardware') || alert.title.includes('Device')) return 'hardware';
    if (alert.title.includes('Savings') || alert.title.includes('Energy')) return 'savings';
    return 'system';
  }
  
  private async checkDataCompleteness(): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const expectedReadings = 60; // One per minute
    
    const actualReadings = await prisma.power_readings.count({
      where: { timestamp: { gte: oneHourAgo } }
    });
    
    return (actualReadings / expectedReadings) * 100;
  }
  
  private async checkDatabasePerformance(): Promise<number> {
    const start = Date.now();
    
    await prisma.power_readings.findFirst({
      orderBy: { timestamp: 'desc' }
    });
    
    return Date.now() - start;
  }
  
  private formatAlertEmail(alert: Alert, severity: string): string {
    return `
      <h2 style="color: ${severity === 'critical' ? '#ef4444' : '#f59e0b'}">
        ${alert.title}
      </h2>
      <p>${alert.message}</p>
      ${alert.data ? `<pre>${JSON.stringify(alert.data, null, 2)}</pre>` : ''}
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/alerts">
          View in Dashboard
        </a>
      </p>
    `;
  }
  
  private async sendEmail(to: string, subject: string, html: string) {
    // Integration with email service (SendGrid, AWS SES, etc.)
  }
  
  private async sendSMS(to: string, message: string) {
    // Integration with SMS service (Twilio, AWS SNS, etc.)
  }
}

// Export singleton
export const energyMonitoringService = new EnergyMonitoringService();