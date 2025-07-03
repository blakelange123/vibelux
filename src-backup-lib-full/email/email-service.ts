// Enhanced Email Infrastructure Service
// Handles transactional emails, templates, and bulk sending

import { createTransport, Transporter } from 'nodemailer';
import { compile } from 'handlebars';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/db';
import { auditLogger } from '../audit-logger';
import { Language, t } from '@/lib/i18n/translations';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  html?: string;
  text?: string;
  data?: Record<string, any>;
  attachments?: EmailAttachment[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  headers?: Record<string, string>;
  language?: Language;
  tags?: string[];
  metadata?: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
}

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
  cid?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  language: Language;
  category: string;
  isActive: boolean;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  recipients: string[];
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  sentCount: number;
  failedCount: number;
  openCount: number;
  clickCount: number;
}

export class EmailService {
  private transporter: Transporter;
  private defaultFrom: string;
  private templatesPath: string;
  private rateLimits: Map<string, { count: number; resetAt: Date }> = new Map();
  
  constructor() {
    // Configure email transporter
    this.transporter = createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5
    });
    
    this.defaultFrom = process.env.EMAIL_FROM || 'noreply@vibelux.com';
    this.templatesPath = join(process.cwd(), 'email-templates');
  }
  
  // Send single email
  async sendEmail(options: EmailOptions): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      // Check rate limiting
      if (!this.checkRateLimit(options.to)) {
        throw new Error('Rate limit exceeded');
      }
      
      // Prepare email content
      let html = options.html;
      let text = options.text;
      let subject = options.subject;
      
      // Use template if specified
      if (options.template) {
        const template = await this.loadTemplate(options.template, options.language || 'en');
        html = await this.renderTemplate(template.htmlContent, options.data || {});
        text = template.textContent ? await this.renderTemplate(template.textContent, options.data || {}) : undefined;
        subject = await this.renderTemplate(template.subject, options.data || {});
      }
      
      // Validate recipients
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      const validRecipients = await this.validateEmails(recipients);
      
      if (validRecipients.length === 0) {
        throw new Error('No valid recipients');
      }
      
      // Send email
      const result = await this.transporter.sendMail({
        from: this.defaultFrom,
        to: validRecipients.join(', '),
        cc: options.cc,
        bcc: options.bcc,
        subject,
        html,
        text,
        attachments: options.attachments,
        replyTo: options.replyTo,
        headers: {
          ...options.headers,
          'X-Priority': options.priority === 'high' ? '1' : options.priority === 'low' ? '5' : '3',
          'X-Vibelux-Tags': options.tags?.join(',') || ''
        }
      });
      
      // Track email
      await this.trackEmail({
        messageId: result.messageId,
        to: validRecipients,
        subject,
        template: options.template,
        tags: options.tags,
        metadata: options.metadata,
        sentAt: new Date()
      });
      
      // Log success
      await auditLogger.log({
        action: 'email.sent',
        resourceType: 'email',
        resourceId: result.messageId,
        userId: 'system',
        details: {
          to: validRecipients,
          subject,
          template: options.template
        }
      });
      
      return {
        success: true,
        messageId: result.messageId
      };
      
    } catch (error) {
      await auditLogger.log({
        action: 'email.failed',
        resourceType: 'email',
        resourceId: 'unknown',
        userId: 'system',
        details: {
          to: options.to,
          subject: options.subject,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      };
    }
  }
  
  // Send bulk emails
  async sendBulkEmails(
    recipients: Array<{ email: string; data?: Record<string, any> }>,
    options: Omit<EmailOptions, 'to'>
  ): Promise<{
    sent: number;
    failed: number;
    results: Array<{ email: string; success: boolean; messageId?: string; error?: string }>;
  }> {
    const results = [];
    let sent = 0;
    let failed = 0;
    
    // Process in batches
    const batchSize = 50;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (recipient) => {
          const result = await this.sendEmail({
            ...options,
            to: recipient.email,
            data: { ...options.data, ...recipient.data }
          });
          
          if (result.success) {
            sent++;
          } else {
            failed++;
          }
          
          results.push({
            email: recipient.email,
            ...result
          });
        })
      );
      
      // Rate limiting between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return { sent, failed, results };
  }
  
  // Create email campaign
  async createCampaign(campaign: Omit<EmailCampaign, 'id' | 'status' | 'sentCount' | 'failedCount' | 'openCount' | 'clickCount'>): Promise<EmailCampaign> {
    const newCampaign: EmailCampaign = {
      id: `campaign_${Date.now()}`,
      ...campaign,
      status: campaign.scheduledFor ? 'scheduled' : 'draft',
      sentCount: 0,
      failedCount: 0,
      openCount: 0,
      clickCount: 0
    };
    
    // Save campaign to database
    await prisma.emailCampaign.create({
      data: newCampaign
    });
    
    // Schedule if needed
    if (campaign.scheduledFor) {
      await this.scheduleCampaign(newCampaign);
    }
    
    return newCampaign;
  }
  
  // Send campaign
  async sendCampaign(campaignId: string): Promise<{
    success: boolean;
    sent: number;
    failed: number;
  }> {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId }
    });
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    
    // Update status
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'sending' }
    });
    
    // Load template
    const template = await prisma.emailTemplate.findUnique({
      where: { id: campaign.templateId }
    });
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Send to recipients
    const recipients = campaign.recipients.map(email => ({ email }));
    const result = await this.sendBulkEmails(recipients, {
      subject: campaign.subject,
      template: template.id,
      tags: ['campaign', campaignId],
      metadata: { campaignId }
    });
    
    // Update campaign stats
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'sent',
        sentCount: result.sent,
        failedCount: result.failed
      }
    });
    
    return {
      success: true,
      sent: result.sent,
      failed: result.failed
    };
  }
  
  // Load email template
  private async loadTemplate(templateId: string, language: Language): Promise<EmailTemplate> {
    // First, check database
    let template = await prisma.emailTemplate.findFirst({
      where: {
        id: templateId,
        language,
        isActive: true
      }
    });
    
    // Fallback to file system
    if (!template) {
      const htmlPath = join(this.templatesPath, language, `${templateId}.html`);
      const textPath = join(this.templatesPath, language, `${templateId}.txt`);
      
      try {
        const htmlContent = await readFile(htmlPath, 'utf-8');
        const textContent = await readFile(textPath, 'utf-8').catch(() => undefined);
        
        template = {
          id: templateId,
          name: templateId,
          subject: 'Email from Vibelux',
          htmlContent,
          textContent,
          variables: this.extractTemplateVariables(htmlContent),
          language,
          category: 'general',
          isActive: true
        };
      } catch (error) {
        throw new Error(`Template ${templateId} not found for language ${language}`);
      }
    }
    
    return template;
  }
  
  // Render template with data
  private async renderTemplate(template: string, data: Record<string, any>): Promise<string> {
    const compiledTemplate = compile(template);
    return compiledTemplate({
      ...data,
      year: new Date().getFullYear(),
      companyName: 'Vibelux',
      supportEmail: 'support@vibelux.com',
      websiteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.com'
    });
  }
  
  // Extract template variables
  private extractTemplateVariables(template: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const variables = new Set<string>();
    let match;
    
    while ((match = regex.exec(template)) !== null) {
      variables.add(match[1]);
    }
    
    return Array.from(variables);
  }
  
  // Validate email addresses
  private async validateEmails(emails: string[]): Promise<string[]> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = [];
    
    for (const email of emails) {
      if (emailRegex.test(email)) {
        // Check if email is not blacklisted
        const isBlacklisted = await prisma.emailBlacklist.findUnique({
          where: { email }
        });
        
        if (!isBlacklisted) {
          validEmails.push(email);
        }
      }
    }
    
    return validEmails;
  }
  
  // Check rate limiting
  private checkRateLimit(recipient: string | string[]): boolean {
    const key = Array.isArray(recipient) ? recipient.join(',') : recipient;
    const now = new Date();
    
    const limit = this.rateLimits.get(key);
    if (!limit || limit.resetAt < now) {
      this.rateLimits.set(key, {
        count: 1,
        resetAt: new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
      });
      return true;
    }
    
    if (limit.count >= 10) { // Max 10 emails per hour per recipient
      return false;
    }
    
    limit.count++;
    return true;
  }
  
  // Track email
  private async trackEmail(data: {
    messageId: string;
    to: string[];
    subject: string;
    template?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    sentAt: Date;
  }): Promise<void> {
    try {
      await prisma.emailLog.create({
        data: {
          messageId: data.messageId,
          to: data.to,
          subject: data.subject,
          template: data.template,
          tags: data.tags,
          metadata: data.metadata,
          sentAt: data.sentAt,
          status: 'sent'
        }
      });
    } catch (error) {
      console.error('Failed to track email:', error);
    }
  }
  
  // Track email open
  async trackOpen(messageId: string, recipient: string): Promise<void> {
    try {
      await prisma.emailLog.update({
        where: { messageId },
        data: {
          openedAt: new Date(),
          openCount: { increment: 1 }
        }
      });
      
      // Update campaign stats if applicable
      const emailLog = await prisma.emailLog.findUnique({
        where: { messageId }
      });
      
      if (emailLog?.metadata?.campaignId) {
        await prisma.emailCampaign.update({
          where: { id: emailLog.metadata.campaignId },
          data: { openCount: { increment: 1 } }
        });
      }
    } catch (error) {
      console.error('Failed to track email open:', error);
    }
  }
  
  // Track email click
  async trackClick(messageId: string, url: string): Promise<void> {
    try {
      await prisma.emailLog.update({
        where: { messageId },
        data: {
          clickedAt: new Date(),
          clickCount: { increment: 1 },
          clickedUrls: { push: url }
        }
      });
      
      // Update campaign stats if applicable
      const emailLog = await prisma.emailLog.findUnique({
        where: { messageId }
      });
      
      if (emailLog?.metadata?.campaignId) {
        await prisma.emailCampaign.update({
          where: { id: emailLog.metadata.campaignId },
          data: { clickCount: { increment: 1 } }
        });
      }
    } catch (error) {
      console.error('Failed to track email click:', error);
    }
  }
  
  // Add email to blacklist
  async blacklistEmail(email: string, reason?: string): Promise<void> {
    await prisma.emailBlacklist.create({
      data: { email, reason, blacklistedAt: new Date() }
    });
  }
  
  // Remove email from blacklist
  async unblacklistEmail(email: string): Promise<void> {
    await prisma.emailBlacklist.delete({
      where: { email }
    });
  }
  
  // Schedule campaign
  private async scheduleCampaign(campaign: EmailCampaign): Promise<void> {
    if (!campaign.scheduledFor) return;
    
    const delay = campaign.scheduledFor.getTime() - Date.now();
    if (delay <= 0) {
      // Send immediately
      await this.sendCampaign(campaign.id);
    } else {
      // Schedule for later
      setTimeout(() => {
        this.sendCampaign(campaign.id);
      }, delay);
    }
  }
  
  // Get email statistics
  async getEmailStats(
    filters?: {
      startDate?: Date;
      endDate?: Date;
      template?: string;
      tag?: string;
    }
  ): Promise<{
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
    openRate: number;
    clickRate: number;
  }> {
    const where: any = {};
    
    if (filters?.startDate) {
      where.sentAt = { gte: filters.startDate };
    }
    if (filters?.endDate) {
      where.sentAt = { ...where.sentAt, lte: filters.endDate };
    }
    if (filters?.template) {
      where.template = filters.template;
    }
    if (filters?.tag) {
      where.tags = { has: filters.tag };
    }
    
    const [sent, opened, clicked, bounced] = await Promise.all([
      prisma.emailLog.count({ where }),
      prisma.emailLog.count({ where: { ...where, openedAt: { not: null } } }),
      prisma.emailLog.count({ where: { ...where, clickedAt: { not: null } } }),
      prisma.emailLog.count({ where: { ...where, status: 'bounced' } })
    ]);
    
    return {
      sent,
      opened,
      clicked,
      bounced,
      openRate: sent > 0 ? (opened / sent) * 100 : 0,
      clickRate: sent > 0 ? (clicked / sent) * 100 : 0
    };
  }
  
  // Test email configuration
  async testConfiguration(testEmail: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await this.transporter.verify();
      
      const result = await this.sendEmail({
        to: testEmail,
        subject: 'Vibelux Email Configuration Test',
        html: `
          <h1>Email Configuration Test</h1>
          <p>This is a test email from Vibelux to verify your email configuration.</p>
          <p>If you received this email, your configuration is working correctly!</p>
          <hr>
          <p>Configuration details:</p>
          <ul>
            <li>SMTP Host: ${process.env.SMTP_HOST}</li>
            <li>SMTP Port: ${process.env.SMTP_PORT}</li>
            <li>From Address: ${this.defaultFrom}</li>
          </ul>
        `,
        text: 'This is a test email from Vibelux to verify your email configuration.'
      });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Configuration test failed'
      };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Common email templates
export const emailTemplates = {
  welcome: 'welcome',
  passwordReset: 'password-reset',
  emailVerification: 'email-verification',
  subscriptionConfirmation: 'subscription-confirmation',
  invoiceCreated: 'invoice-created',
  paymentReceived: 'payment-received',
  paymentFailed: 'payment-failed',
  affiliateApproved: 'affiliate-approved',
  affiliatePayout: 'affiliate-payout',
  systemAlert: 'system-alert',
  newsletter: 'newsletter',
  productUpdate: 'product-update',
  supportTicketCreated: 'support-ticket-created',
  supportTicketUpdated: 'support-ticket-updated',
  dataExportReady: 'data-export-ready'
};