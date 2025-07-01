import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { TwilioService } from '@/lib/communications/twilio-service';
import { getNotificationService } from '@/lib/notifications/notification-service';

interface AlertConfig {
  email?: {
    enabled: boolean;
    recipients: string[];
    smtpConfig: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
  };
  sms?: {
    enabled: boolean;
    recipients: string[];
    criticalOnly: boolean;
  };
  slack?: {
    enabled: boolean;
    webhookUrl: string;
    channel: string;
  };
  teams?: {
    enabled: boolean;
    webhookUrl: string;
  };
}

export class AlertManager {
  private config: AlertConfig;
  private emailTransporter?: nodemailer.Transporter;
  private twilioService?: TwilioService;

  constructor() {
    this.config = {
      email: {
        enabled: process.env.ALERT_EMAIL_ENABLED === 'true',
        recipients: (process.env.ALERT_EMAIL_RECIPIENTS || '').split(',').filter(Boolean),
        smtpConfig: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASSWORD || '',
          },
        },
      },
      sms: {
        enabled: process.env.ALERT_SMS_ENABLED === 'true',
        recipients: (process.env.ALERT_SMS_RECIPIENTS || '').split(',').filter(Boolean),
        criticalOnly: process.env.ALERT_SMS_CRITICAL_ONLY === 'true',
      },
      slack: {
        enabled: process.env.SLACK_ALERTS_ENABLED === 'true',
        webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
        channel: process.env.SLACK_CHANNEL || '#alerts',
      },
      teams: {
        enabled: process.env.TEAMS_ALERTS_ENABLED === 'true',
        webhookUrl: process.env.TEAMS_WEBHOOK_URL || '',
      },
    };

    if (this.config.email?.enabled) {
      this.initializeEmailTransporter();
    }
    
    if (this.config.sms?.enabled) {
      this.initializeTwilioService();
    }
  }
  
  private initializeTwilioService(): void {
    try {
      this.twilioService = new TwilioService({
        region: process.env.TWILIO_REGION || 'us-east',
        multiRegion: {
          primary: 'us-east',
          fallback: ['us-west', 'eu-west'],
          loadBalancing: 'geographic',
        },
        phoneNumbers: {
          sms: process.env.TWILIO_SMS_NUMBERS?.split(',') || [],
        },
        messaging: {
          rateLimits: {
            smsPerMinute: 100,
            voicePerMinute: 60,
          },
        },
      });
    } catch (error) {
      console.error('Failed to initialize Twilio service:', error);
    }
  }

  private initializeEmailTransporter(): void {
    if (!this.config.email) return;

    this.emailTransporter = nodemailer.createTransporter(this.config.email.smtpConfig);
  }

  async processAlerts(): Promise<void> {
    try {
      // Get unacknowledged alerts
      const alerts = await prisma.systemAlert.findMany({
        where: {
          acknowledged: false,
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
          },
        },
        orderBy: [
          { severity: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 50,
      });

      if (alerts.length === 0) {
        return;
      }

      // Group alerts by severity
      const criticalAlerts = alerts.filter(a => a.severity === 'critical');
      const highAlerts = alerts.filter(a => a.severity === 'high');
      const mediumAlerts = alerts.filter(a => a.severity === 'medium');

      // Send immediate notifications for critical alerts
      for (const alert of criticalAlerts) {
        await this.sendImmediateAlert(alert);
      }

      // Send batched notifications for others
      if (highAlerts.length > 0 || mediumAlerts.length > 0) {
        await this.sendBatchedAlert([...highAlerts, ...mediumAlerts]);
      }

    } catch (error) {
      console.error('Failed to process alerts:', error);
    }
  }

  private async sendImmediateAlert(alert: any): Promise<void> {
    const message = this.formatAlertMessage(alert, true);

    await Promise.allSettled([
      this.sendEmailAlert(message, `CRITICAL: ${alert.title}`),
      this.sendSMSAlert(message, alert),
      this.sendSlackAlert(message, true),
      this.sendTeamsAlert(message, true),
    ]);
  }

  private async sendBatchedAlert(alerts: any[]): Promise<void> {
    const summary = this.formatBatchSummary(alerts);
    const subject = `VibeLux System Alerts - ${alerts.length} new alerts`;

    await Promise.allSettled([
      this.sendEmailAlert(summary, subject),
      this.sendSlackAlert(summary, false),
      this.sendTeamsAlert(summary, false),
    ]);
  }

  private async sendEmailAlert(message: string, subject: string): Promise<void> {
    if (!this.config.email?.enabled || !this.emailTransporter) {
      return;
    }

    try {
      await this.emailTransporter.sendMail({
        from: this.config.email.smtpConfig.auth.user,
        to: this.config.email.recipients.join(','),
        subject,
        html: this.formatEmailHTML(message),
        text: message,
      });
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  private async sendSlackAlert(message: string, urgent: boolean): Promise<void> {
    if (!this.config.slack?.enabled || !this.config.slack.webhookUrl) {
      return;
    }

    try {
      const payload = {
        channel: this.config.slack.channel,
        username: 'VibeLux Monitoring',
        icon_emoji: urgent ? ':rotating_light:' : ':warning:',
        text: message,
        attachments: urgent ? [{
          color: 'danger',
          text: 'Immediate attention required!',
        }] : undefined,
      };

      const response = await fetch(this.config.slack.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  private async sendTeamsAlert(message: string, urgent: boolean): Promise<void> {
    if (!this.config.teams?.enabled || !this.config.teams.webhookUrl) {
      return;
    }

    try {
      const payload = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: urgent ? 'FF0000' : 'FFA500',
        summary: urgent ? 'Critical Alert' : 'System Alert',
        sections: [{
          activityTitle: 'VibeLux System Alert',
          activitySubtitle: urgent ? '🚨 Critical Alert' : '⚠️ System Alert',
          text: message,
        }],
      };

      const response = await fetch(this.config.teams.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Teams API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send Teams alert:', error);
    }
  }

  private formatAlertMessage(alert: any, detailed: boolean = false): string {
    const timestamp = new Date(alert.createdAt).toLocaleString();
    const severityIcon = this.getSeverityIcon(alert.severity);
    
    let message = `${severityIcon} **${alert.title}**\n`;
    message += `**Severity:** ${alert.severity.toUpperCase()}\n`;
    message += `**Time:** ${timestamp}\n`;
    message += `**Type:** ${alert.type}\n`;
    
    if (alert.entityType && alert.entityId) {
      message += `**Entity:** ${alert.entityType} (${alert.entityId})\n`;
    }
    
    if (detailed) {
      message += `\n**Description:**\n${alert.description}\n`;
    }
    
    return message;
  }

  private formatBatchSummary(alerts: any[]): string {
    let message = `📊 **Alert Summary** - ${alerts.length} new alerts\n\n`;
    
    // Group by severity
    const severityGroups = alerts.reduce((groups, alert) => {
      const severity = alert.severity;
      if (!groups[severity]) groups[severity] = [];
      groups[severity].push(alert);
      return groups;
    }, {} as Record<string, any[]>);

    // Add summary by severity
    for (const [severity, severityAlerts] of Object.entries(severityGroups)) {
      const icon = this.getSeverityIcon(severity);
      message += `${icon} **${severity.toUpperCase()}** (${severityAlerts.length})\n`;
      
      severityAlerts.slice(0, 5).forEach(alert => {
        const time = new Date(alert.createdAt).toLocaleTimeString();
        message += `  • ${time} - ${alert.title}\n`;
      });
      
      if (severityAlerts.length > 5) {
        message += `  • ... and ${severityAlerts.length - 5} more\n`;
      }
      message += '\n';
    }

    return message;
  }

  private formatEmailHTML(message: string): string {
    // Convert markdown-style formatting to HTML
    const html = message
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/^(\s*•\s*)/gm, '<ul><li>')
      .replace(/<\/li><br><ul><li>/g, '</li><li>')
      .replace(/<ul><li>(.*?)<br>/g, '<ul><li>$1</li></ul><br>');

    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
            <h2 style="color: #333;">VibeLux System Alert</h2>
            <div style="background-color: white; padding: 15px; border-radius: 3px;">
              ${html}
            </div>
            <footer style="margin-top: 20px; font-size: 12px; color: #666;">
              <p>This is an automated message from VibeLux monitoring system.</p>
              <p>Dashboard: <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/alerts">View All Alerts</a></p>
            </footer>
          </div>
        </body>
      </html>
    `;
  }

  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚠️';
    }
  }
  
  private async sendSMSAlert(message: string, alert: any): Promise<void> {
    if (!this.config.sms?.enabled || !this.twilioService) {
      return;
    }
    
    // Skip non-critical alerts if configured
    if (this.config.sms.criticalOnly && alert.severity !== 'critical') {
      return;
    }
    
    try {
      const smsMessage = this.formatSMSMessage(alert);
      
      // Send to all configured recipients
      const results = await this.twilioService.sendBulkSMS({
        recipients: this.config.sms.recipients.map(to => ({
          to,
          message: smsMessage,
        })),
        batchSize: 5,
        delayMs: 500,
      });
      
      const failedCount = results.filter(r => r.status === 'failed').length;
      if (failedCount > 0) {
        console.error(`Failed to send ${failedCount} SMS alerts`);
      }
    } catch (error) {
      console.error('Failed to send SMS alert:', error);
    }
  }
  
  private formatSMSMessage(alert: any): string {
    const severityIcon = this.getSeverityIcon(alert.severity);
    const shortType = alert.type.replace(/_/g, ' ').toLowerCase();
    
    // Keep SMS messages concise
    let message = `${severityIcon} VibeLux Alert\n`;
    message += `${alert.title}\n`;
    message += `Type: ${shortType}\n`;
    
    // Add critical details for plant health alerts
    if (alert.type === 'PLANT_STRESS' && alert.metadata?.stressLevel) {
      message += `Stress: ${alert.metadata.stressLevel}%\n`;
    }
    if (alert.type === 'CO2_CRITICAL' && alert.metadata?.currentLevel) {
      message += `CO2: ${alert.metadata.currentLevel}ppm\n`;
    }
    if (alert.type === 'NUTRIENT_DEFICIENCY' && alert.metadata?.nutrients) {
      const deficientNutrients = Object.entries(alert.metadata.nutrients)
        .filter(([_, level]) => level > 10)
        .map(([nutrient, _]) => nutrient.charAt(0).toUpperCase())
        .join(', ');
      message += `Deficient: ${deficientNutrients}\n`;
    }
    
    message += `View: ${process.env.NEXT_PUBLIC_APP_URL}/alerts`;
    
    return message.substring(0, 160); // SMS character limit
  }

  // Health check monitoring
  async checkSystemHealth(): Promise<void> {
    try {
      const healthChecks = [
        { name: 'Database', check: () => this.checkDatabase() },
        { name: 'Payment Processing', check: () => this.checkPaymentSystems() },
        { name: 'Utility APIs', check: () => this.checkUtilityAPIs() },
        { name: 'Storage', check: () => this.checkStorage() },
        { name: 'ML Services', check: () => this.checkMLServices() },
      ];

      const results = await Promise.allSettled(
        healthChecks.map(async ({ name, check }) => {
          try {
            await check();
            return { name, status: 'healthy' };
          } catch (error) {
            return { name, status: 'unhealthy', error: (error as Error).message };
          }
        })
      );

      const unhealthyServices = results
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value.status === 'unhealthy')
        .map(result => result.value);

      if (unhealthyServices.length > 0) {
        await this.createHealthAlert(unhealthyServices);
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  private async checkDatabase(): Promise<void> {
    await prisma.$queryRaw`SELECT 1`;
  }

  private async checkPaymentSystems(): Promise<void> {
    // Check if payment processors are accessible
    // This would ping Stripe, Plaid APIs
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe configuration missing');
    }
  }

  private async checkUtilityAPIs(): Promise<void> {
    // Check if utility APIs are responding
    if (!process.env.UTILITYAPI_KEY) {
      throw new Error('UtilityAPI configuration missing');
    }
  }

  private async checkStorage(): Promise<void> {
    // Check S3 or storage service connectivity
    if (!process.env.AWS_ACCESS_KEY_ID) {
      throw new Error('Storage configuration missing');
    }
  }

  private async checkMLServices(): Promise<void> {
    // Check if ML models are loaded and responding
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ML service configuration missing');
    }
  }

  private async createHealthAlert(unhealthyServices: any[]): Promise<void> {
    const description = `The following services are unhealthy:\n\n${
      unhealthyServices.map(service => 
        `• ${service.name}: ${service.error}`
      ).join('\n')
    }`;

    await prisma.systemAlert.create({
      data: {
        type: 'HEALTH_CHECK_FAILURE',
        severity: 'high',
        title: `${unhealthyServices.length} system services are unhealthy`,
        description,
        acknowledged: false,
        resolved: false,
        createdAt: new Date(),
      },
    });
  }
}

// Singleton instance
export const alertManager = new AlertManager();