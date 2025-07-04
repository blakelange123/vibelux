// Notification Service for Alerts and Communications
// Supports Email, SMS, Push, and In-App notifications

import { prisma } from '@/lib/db';
import { EventEmitter } from 'events';

// Notification types
export type NotificationType = 'alert' | 'warning' | 'info' | 'success' | 'critical';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'inapp' | 'webhook';

export interface NotificationConfig {
  channels: NotificationChannel[];
  email?: {
    provider: 'sendgrid' | 'smtp' | 'ses';
    from: string;
    config: any;
  };
  sms?: {
    provider: 'twilio' | 'sns';
    from: string;
    config: any;
  };
  push?: {
    provider: 'fcm' | 'apns' | 'onesignal';
    config: any;
  };
  webhook?: {
    url: string;
    headers?: Record<string, string>;
  };
}

export interface Alert {
  id: string;
  type: NotificationType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  source: string;
  projectId: string;
  roomId?: string;
  deviceId?: string;
  sensorId?: string;
  value?: number;
  threshold?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inapp: boolean;
  };
  alertTypes: {
    temperature: boolean;
    humidity: boolean;
    co2: boolean;
    ph: boolean;
    ec: boolean;
    equipment: boolean;
    system: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
  thresholds: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    co2: { min: number; max: number };
    ph: { min: number; max: number };
    ec: { min: number; max: number };
    vpd: { min: number; max: number };
  };
}

export class NotificationService extends EventEmitter {
  private config: NotificationConfig;
  private alertQueue: Alert[] = [];
  private processing: boolean = false;
  
  constructor(config: NotificationConfig) {
    super();
    this.config = config;
    
    // Start processing queue
    this.startProcessing();
  }
  
  // Send alert to all configured channels
  async sendAlert(alert: Alert, userIds: string[]): Promise<void> {
    // Get user preferences
    const users = await this.getUsersWithPreferences(userIds);
    
    for (const user of users) {
      // Check if user wants this type of alert
      if (!this.shouldNotifyUser(user, alert)) {
        continue;
      }
      
      // Send to each enabled channel
      const promises = [];
      
      if (user.preferences.channels.email && this.config.channels.includes('email')) {
        promises.push(this.sendEmail(user, alert));
      }
      
      if (user.preferences.channels.sms && this.config.channels.includes('sms')) {
        promises.push(this.sendSMS(user, alert));
      }
      
      if (user.preferences.channels.push && this.config.channels.includes('push')) {
        promises.push(this.sendPushNotification(user, alert));
      }
      
      if (user.preferences.channels.inapp && this.config.channels.includes('inapp')) {
        promises.push(this.sendInAppNotification(user, alert));
      }
      
      await Promise.all(promises);
    }
    
    // Send to webhooks if configured
    if (this.config.channels.includes('webhook') && this.config.webhook) {
      await this.sendWebhook(alert);
    }
    
    // Log notification
    await this.logNotification(alert, userIds);
  }
  
  // Queue alert for batch processing
  queueAlert(alert: Alert): void {
    this.alertQueue.push(alert);
    this.emit('alert:queued', alert);
  }
  
  // Process queued alerts
  private async startProcessing(): Promise<void> {
    setInterval(async () => {
      if (this.processing || this.alertQueue.length === 0) {
        return;
      }
      
      this.processing = true;
      
      try {
        // Group alerts by project and type
        const groupedAlerts = this.groupAlerts(this.alertQueue);
        
        // Process each group
        for (const [key, alerts] of groupedAlerts) {
          const [projectId, type] = key.split(':');
          
          // Get users for project
          const users = await this.getProjectUsers(projectId);
          
          // Create summary alert if multiple
          if (alerts.length > 1) {
            const summaryAlert = this.createSummaryAlert(alerts);
            await this.sendAlert(summaryAlert, users);
          } else {
            await this.sendAlert(alerts[0], users);
          }
        }
        
        // Clear processed alerts
        this.alertQueue = [];
      } catch (error) {
        console.error('Error processing alerts:', error);
      } finally {
        this.processing = false;
      }
    }, 5000); // Process every 5 seconds
  }
  
  // Send email notification
  private async sendEmail(user: any, alert: Alert): Promise<void> {
    if (!this.config.email) return;
    
    const subject = `[${alert.severity.toUpperCase()}] ${alert.title}`;
    const html = this.generateEmailHTML(alert);
    
    // In production, use actual email service
    
    // Example for SendGrid
    if (this.config.email.provider === 'sendgrid') {
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(this.config.email.config.apiKey);
      // await sgMail.send({
      //   to: user.email,
      //   from: this.config.email.from,
      //   subject,
      //   html
      // });
    }
  }
  
  // Send SMS notification
  private async sendSMS(user: any, alert: Alert): Promise<void> {
    if (!this.config.sms || !user.phone) return;
    
    const message = `${alert.title}\n${alert.message}\n- Vibelux`;
    
    // In production, use actual SMS service
    
    // Example for Twilio
    if (this.config.sms.provider === 'twilio') {
      // const client = require('twilio')(
      //   this.config.sms.config.accountSid,
      //   this.config.sms.config.authToken
      // );
      // await client.messages.create({
      //   body: message,
      //   from: this.config.sms.from,
      //   to: user.phone
      // });
    }
  }
  
  // Send push notification
  private async sendPushNotification(user: any, alert: Alert): Promise<void> {
    if (!this.config.push || !user.pushToken) return;
    
    const notification = {
      title: alert.title,
      body: alert.message,
      data: {
        alertId: alert.id,
        type: alert.type,
        projectId: alert.projectId,
        roomId: alert.roomId
      }
    };
    
    // In production, use actual push service
  }
  
  // Send in-app notification
  private async sendInAppNotification(user: any, alert: Alert): Promise<void> {
    // Store in database for in-app display
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        data: alert as any,
        read: false,
        createdAt: new Date()
      }
    });
    
    // Emit event for real-time updates
    this.emit('notification:created', {
      userId: user.id,
      alert
    });
  }
  
  // Send webhook notification
  private async sendWebhook(alert: Alert): Promise<void> {
    if (!this.config.webhook) return;
    
    try {
      await fetch(this.config.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.webhook.headers
        },
        body: JSON.stringify({
          event: 'alert',
          data: alert,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Webhook error:', error);
    }
  }
  
  // Check if user should be notified
  private shouldNotifyUser(user: any, alert: Alert): boolean {
    const prefs = user.preferences;
    
    // Check quiet hours
    if (prefs.quietHours?.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = prefs.quietHours.start.split(':').map(Number);
      const [endHour, endMin] = prefs.quietHours.end.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      
      if (startTime <= endTime) {
        if (currentTime >= startTime && currentTime < endTime) {
          return false; // Within quiet hours
        }
      } else {
        // Quiet hours span midnight
        if (currentTime >= startTime || currentTime < endTime) {
          return false;
        }
      }
    }
    
    // Check alert type preferences
    const alertCategory = this.getAlertCategory(alert);
    if (alertCategory && !prefs.alertTypes[alertCategory]) {
      return false;
    }
    
    // Check severity threshold
    if (alert.severity === 'low' && !prefs.lowSeverityAlerts) {
      return false;
    }
    
    return true;
  }
  
  // Get alert category from source
  private getAlertCategory(alert: Alert): string | null {
    if (alert.source.includes('temperature')) return 'temperature';
    if (alert.source.includes('humidity')) return 'humidity';
    if (alert.source.includes('co2')) return 'co2';
    if (alert.source.includes('ph')) return 'ph';
    if (alert.source.includes('ec')) return 'ec';
    if (alert.source.includes('equipment')) return 'equipment';
    if (alert.source.includes('system')) return 'system';
    return null;
  }
  
  // Group alerts by project and type
  private groupAlerts(alerts: Alert[]): Map<string, Alert[]> {
    const groups = new Map<string, Alert[]>();
    
    alerts.forEach(alert => {
      const key = `${alert.projectId}:${alert.type}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(alert);
    });
    
    return groups;
  }
  
  // Create summary alert for multiple alerts
  private createSummaryAlert(alerts: Alert[]): Alert {
    const first = alerts[0];
    return {
      ...first,
      title: `Multiple ${first.type} alerts (${alerts.length})`,
      message: alerts.map(a => `• ${a.message}`).join('\n'),
      metadata: {
        count: alerts.length,
        alerts: alerts.map(a => a.id)
      }
    };
  }
  
  // Generate email HTML
  private generateEmailHTML(alert: Alert): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7C3AED; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .alert-${alert.severity} { color: ${this.getSeverityColor(alert.severity)}; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Vibelux Alert</h2>
          </div>
          <div class="content">
            <h3 class="alert-${alert.severity}">${alert.title}</h3>
            <p>${alert.message}</p>
            <table>
              <tr><td>Time:</td><td>${alert.timestamp.toLocaleString()}</td></tr>
              <tr><td>Source:</td><td>${alert.source}</td></tr>
              ${alert.value ? `<tr><td>Value:</td><td>${alert.value}</td></tr>` : ''}
              ${alert.threshold ? `<tr><td>Threshold:</td><td>${alert.threshold}</td></tr>` : ''}
            </table>
          </div>
          <div class="footer">
            <p>Manage your notification preferences at app.vibelux.com/settings</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }
  
  // Database queries (simplified)
  private async getUsersWithPreferences(userIds: string[]): Promise<any[]> {
    // In production, fetch from database
    return userIds.map(id => ({
      id,
      email: 'user@example.com',
      phone: '+1234567890',
      pushToken: 'token123',
      preferences: {
        channels: {
          email: true,
          sms: true,
          push: true,
          inapp: true
        },
        alertTypes: {
          temperature: true,
          humidity: true,
          co2: true,
          ph: true,
          ec: true,
          equipment: true,
          system: true
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      }
    }));
  }
  
  private async getProjectUsers(projectId: string): Promise<string[]> {
    // In production, fetch from database
    return ['user1', 'user2'];
  }
  
  private async logNotification(alert: Alert, userIds: string[]): Promise<void> {
    // Log to database for audit trail
    // Notification broadcast debug info would be logged here
  }
}

// Alert Builder helper class
export class AlertBuilder {
  private alert: Partial<Alert> = {
    id: `alert_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
    timestamp: new Date()
  };
  
  type(type: NotificationType): this {
    this.alert.type = type;
    return this;
  }
  
  severity(severity: Alert['severity']): this {
    this.alert.severity = severity;
    return this;
  }
  
  title(title: string): this {
    this.alert.title = title;
    return this;
  }
  
  message(message: string): this {
    this.alert.message = message;
    return this;
  }
  
  source(source: string): this {
    this.alert.source = source;
    return this;
  }
  
  project(projectId: string): this {
    this.alert.projectId = projectId;
    return this;
  }
  
  room(roomId: string): this {
    this.alert.roomId = roomId;
    return this;
  }
  
  device(deviceId: string): this {
    this.alert.deviceId = deviceId;
    return this;
  }
  
  sensor(sensorId: string): this {
    this.alert.sensorId = sensorId;
    return this;
  }
  
  value(value: number, threshold?: number): this {
    this.alert.value = value;
    if (threshold) {
      this.alert.threshold = threshold;
    }
    return this;
  }
  
  metadata(metadata: Record<string, any>): this {
    this.alert.metadata = metadata;
    return this;
  }
  
  build(): Alert {
    if (!this.alert.type || !this.alert.severity || !this.alert.title || 
        !this.alert.message || !this.alert.source || !this.alert.projectId) {
      throw new Error('Missing required alert fields');
    }
    
    return this.alert as Alert;
  }
}

// Singleton instance
let notificationService: NotificationService | null = null;

export function getNotificationService(config?: NotificationConfig): NotificationService {
  if (!notificationService && config) {
    notificationService = new NotificationService(config);
  }
  
  if (!notificationService) {
    throw new Error('Notification service not initialized');
  }
  
  return notificationService;
}