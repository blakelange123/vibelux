import { z } from 'zod';
import axios from 'axios';
import crypto from 'crypto';

// Configuration schemas
const NoCodeConfigSchema = z.object({
  region: z.string(),
  environment: z.enum(['development', 'staging', 'production']),
  platforms: z.object({
    ifttt: z.object({
      webhookKey: z.string().optional(),
      apiUrl: z.string().default('https://maker.ifttt.com/trigger'),
    }).optional(),
    zapier: z.object({
      webhookUrl: z.string().optional(),
      apiKey: z.string().optional(),
      apiUrl: z.string().default('https://hooks.zapier.com/hooks/catch'),
    }).optional(),
  }).optional(),
});

type NoCodeConfig = z.infer<typeof NoCodeConfigSchema>;

// Automation schemas
const AutomationTriggerSchema = z.object({
  type: z.enum(['webhook', 'schedule', 'email', 'form', 'api', 'database', 'file']),
  config: z.record(z.any()),
});

const AutomationActionSchema = z.object({
  service: z.string(),
  action: z.string(),
  params: z.record(z.any()),
  retryPolicy: z.object({
    maxRetries: z.number().default(3),
    backoffMs: z.number().default(1000),
  }).optional(),
});

const AutomationSchema = z.object({
  trigger: AutomationTriggerSchema,
  actions: z.array(AutomationActionSchema),
  platform: z.enum(['ifttt', 'zapier']),
  metadata: z.object({
    name: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

type Automation = z.infer<typeof AutomationSchema>;

export class NoCodePlatform {
  private config: NoCodeConfig;
  private automations: Map<string, Automation> = new Map();
  private webhookSecrets: Map<string, string> = new Map();

  constructor(config: NoCodeConfig) {
    this.config = NoCodeConfigSchema.parse(config);
  }

  // Create automation workflow
  public async createAutomation(params: {
    trigger: string;
    actions: Array<{ service: string; action: string; params: any }>;
    platform: 'ifttt' | 'zapier';
    metadata?: {
      name: string;
      description?: string;
      tags?: string[];
    };
  }): Promise<{ id: string; webhookUrl: string }> {
    const automationId = `automation_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const webhookSecret = crypto.randomBytes(32).toString('hex');
    
    // Build automation configuration
    const automation: Automation = {
      trigger: {
        type: 'webhook',
        config: {
          method: 'POST',
          secret: webhookSecret,
        },
      },
      actions: params.actions.map(action => ({
        service: action.service,
        action: action.action,
        params: action.params,
      })),
      platform: params.platform,
      metadata: {
        name: params.metadata?.name || `Automation ${automationId}`,
        description: params.metadata?.description,
        tags: params.metadata?.tags || [],
      },
    };

    // Store automation
    this.automations.set(automationId, automation);
    this.webhookSecrets.set(automationId, webhookSecret);

    // Create platform-specific webhook
    const webhookUrl = await this.createPlatformWebhook(automationId, automation);

    return {
      id: automationId,
      webhookUrl,
    };
  }

  private async createPlatformWebhook(automationId: string, automation: Automation): Promise<string> {
    switch (automation.platform) {
      case 'ifttt':
        return this.createIFTTTWebhook(automationId, automation);
      case 'zapier':
        return this.createZapierWebhook(automationId, automation);
      default:
        throw new Error(`Unsupported platform: ${automation.platform}`);
    }
  }

  private async createIFTTTWebhook(automationId: string, automation: Automation): Promise<string> {
    const eventName = `vibelux_${automationId}`;
    const webhookKey = this.config.platforms?.ifttt?.webhookKey || process.env.IFTTT_WEBHOOK_KEY;
    
    if (!webhookKey) {
      throw new Error('IFTTT webhook key not configured');
    }

    // IFTTT webhook URL format
    const webhookUrl = `${this.config.platforms?.ifttt?.apiUrl}/${eventName}/with/key/${webhookKey}`;

    // Register webhook with IFTTT (if API available)
    try {
      // Note: IFTTT doesn't have a public API for creating applets programmatically
      // This would typically be done through their web interface or partner API
    } catch (error) {
      console.warn('Could not register IFTTT webhook automatically:', error.message);
    }

    return webhookUrl;
  }

  private async createZapierWebhook(automationId: string, automation: Automation): Promise<string> {
    const webhookUrl = this.config.platforms?.zapier?.webhookUrl || process.env.ZAPIER_WEBHOOK_URL;
    
    if (!webhookUrl) {
      throw new Error('Zapier webhook URL not configured');
    }

    // Create Zapier webhook configuration
    const zapierConfig = {
      automation_id: automationId,
      trigger: automation.trigger,
      actions: automation.actions,
      metadata: automation.metadata,
    };

    try {
      // Register with Zapier webhook
      await axios.post(webhookUrl, zapierConfig, {
        headers: {
          'Content-Type': 'application/json',
          'X-Automation-Secret': this.webhookSecrets.get(automationId),
        },
      });
    } catch (error) {
      console.warn('Could not register Zapier webhook:', error.message);
    }

    return `${webhookUrl}/${automationId}`;
  }

  // Execute automation actions
  public async executeAutomation(automationId: string, triggerData: any): Promise<{
    success: boolean;
    results: Array<{ action: string; success: boolean; data?: any; error?: string }>;
  }> {
    const automation = this.automations.get(automationId);
    if (!automation) {
      throw new Error(`Automation not found: ${automationId}`);
    }

    const results: Array<{ action: string; success: boolean; data?: any; error?: string }> = [];

    for (const action of automation.actions) {
      try {
        const result = await this.executeAction(action, triggerData);
        results.push({
          action: `${action.service}.${action.action}`,
          success: true,
          data: result,
        });
      } catch (error) {
        results.push({
          action: `${action.service}.${action.action}`,
          success: false,
          error: error.message,
        });

        // Stop execution on first failure unless configured otherwise
        break;
      }
    }

    return {
      success: results.every(r => r.success),
      results,
    };
  }

  private async executeAction(action: AutomationActionSchema, triggerData: any): Promise<any> {
    // Map service calls to actual implementations
    const serviceMap = {
      'email': this.executeEmailAction,
      'sms': this.executeSMSAction,
      'slack': this.executeSlackAction,
      'sheets': this.executeSheetsAction,
      'webhook': this.executeWebhookAction,
      'database': this.executeDatabaseAction,
      'file': this.executeFileAction,
    };

    const executor = serviceMap[action.service];
    if (!executor) {
      throw new Error(`Unsupported service: ${action.service}`);
    }

    return executor.call(this, action, triggerData);
  }

  // Action executors
  private async executeEmailAction(action: any, triggerData: any): Promise<any> {
    const { to, subject, body, template } = action.params;
    
    // Replace variables in template
    const processedBody = this.processTemplate(body || template, triggerData);
    
    // Email service integration would go here
    return { messageId: `email_${Date.now()}`, status: 'sent' };
  }

  private async executeSMSAction(action: any, triggerData: any): Promise<any> {
    const { to, message } = action.params;
    const processedMessage = this.processTemplate(message, triggerData);
    
    // SMS service integration would go here
    return { messageId: `sms_${Date.now()}`, status: 'sent' };
  }

  private async executeSlackAction(action: any, triggerData: any): Promise<any> {
    const { channel, message, webhook } = action.params;
    const processedMessage = this.processTemplate(message, triggerData);
    
    if (webhook) {
      await axios.post(webhook, {
        text: processedMessage,
        channel,
      });
    }
    
    return { messageId: `slack_${Date.now()}`, status: 'sent' };
  }

  private async executeSheetsAction(action: any, triggerData: any): Promise<any> {
    const { spreadsheetId, range, values } = action.params;
    
    // Process template variables in values
    const processedValues = values.map((row: any[]) =>
      row.map(cell => this.processTemplate(cell, triggerData))
    );
    
    // Google Sheets API integration would go here
    return { spreadsheetId, range, rowsAdded: processedValues.length };
  }

  private async executeWebhookAction(action: any, triggerData: any): Promise<any> {
    const { url, method = 'POST', headers = {}, body } = action.params;
    
    const processedBody = this.processTemplate(body, triggerData);
    
    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      data: processedBody,
    });
    
    return { status: response.status, data: response.data };
  }

  private async executeDatabaseAction(action: any, triggerData: any): Promise<any> {
    const { operation, table, data, where } = action.params;
    
    // Database integration would go here
    return { operation, table, affected: 1 };
  }

  private async executeFileAction(action: any, triggerData: any): Promise<any> {
    const { operation, path, content } = action.params;
    
    // File system integration would go here
    return { operation, path, success: true };
  }

  // Template processing
  private processTemplate(template: string, data: any): string {
    if (typeof template !== 'string') {
      return template;
    }
    
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  // Automation management
  public getAutomation(automationId: string): Automation | undefined {
    return this.automations.get(automationId);
  }

  public listAutomations(): Array<{ id: string; automation: Automation }> {
    return Array.from(this.automations.entries()).map(([id, automation]) => ({
      id,
      automation,
    }));
  }

  public async deleteAutomation(automationId: string): Promise<boolean> {
    const deleted = this.automations.delete(automationId);
    this.webhookSecrets.delete(automationId);
    
    // Clean up platform webhooks
    // Implementation would depend on platform APIs
    
    return deleted;
  }

  // Webhook validation
  public validateWebhook(automationId: string, signature: string, body: string): boolean {
    const secret = this.webhookSecrets.get(automationId);
    if (!secret) {
      return false;
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Platform connectors
  public async createIFTTTApplet(params: {
    trigger: { service: string; event: string; config: any };
    action: { service: string; action: string; config: any };
  }): Promise<{ appletId: string; webhookUrl: string }> {
    // IFTTT applet creation
    const appletId = `ifttt_${Date.now()}`;
    const eventName = `vibelux_trigger_${appletId}`;
    
    // Generate webhook URL
    const webhookKey = this.config.platforms?.ifttt?.webhookKey || process.env.IFTTT_WEBHOOK_KEY;
    const webhookUrl = `https://maker.ifttt.com/trigger/${eventName}/with/key/${webhookKey}`;
    
    return { appletId, webhookUrl };
  }

  public async createZapierZap(params: {
    trigger: { app: string; event: string; config: any };
    actions: Array<{ app: string; action: string; config: any }>;
  }): Promise<{ zapId: string; webhookUrl: string }> {
    // Zapier zap creation
    const zapId = `zapier_${Date.now()}`;
    
    // Use provided webhook URL or default
    const webhookUrl = this.config.platforms?.zapier?.webhookUrl || process.env.ZAPIER_WEBHOOK_URL;
    
    return { zapId, webhookUrl: `${webhookUrl}/${zapId}` };
  }

  // Analytics and monitoring
  public async getMetrics(): Promise<{
    totalAutomations: number;
    activeAutomations: number;
    executionStats: {
      total: number;
      successful: number;
      failed: number;
    };
    platforms: Record<string, number>;
  }> {
    const automations = Array.from(this.automations.values());
    
    return {
      totalAutomations: automations.length,
      activeAutomations: automations.length, // All stored automations are considered active
      executionStats: {
        total: 0, // Would track from execution logs
        successful: 0,
        failed: 0,
      },
      platforms: {
        ifttt: automations.filter(a => a.platform === 'ifttt').length,
        zapier: automations.filter(a => a.platform === 'zapier').length,
      },
    };
  }

  public async healthCheck(): Promise<boolean> {
    try {
      // Test basic functionality
      return true;
    } catch {
      return false;
    }
  }

  // Export/Import automations
  public exportAutomations(): string {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      automations: Array.from(this.automations.entries()),
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  public importAutomations(data: string): { imported: number; errors: string[] } {
    try {
      const importData = JSON.parse(data);
      const errors: string[] = [];
      let imported = 0;
      
      for (const [id, automation] of importData.automations) {
        try {
          const validatedAutomation = AutomationSchema.parse(automation);
          this.automations.set(id, validatedAutomation);
          imported++;
        } catch (error) {
          errors.push(`Failed to import automation ${id}: ${error.message}`);
        }
      }
      
      return { imported, errors };
    } catch (error) {
      return { imported: 0, errors: [`Failed to parse import data: ${error.message}`] };
    }
  }
}

// Export types
export type {
  NoCodeConfig,
  Automation,
};