import { z } from 'zod';
import twilio from 'twilio';
import { TwilioRestClient } from 'twilio/lib/rest/Twilio';

// Configuration schemas
const TwilioConfigSchema = z.object({
  accountSid: z.string().optional(),
  authToken: z.string().optional(),
  region: z.string(),
  multiRegion: z.object({
    primary: z.string(),
    fallback: z.array(z.string()),
    loadBalancing: z.enum(['round-robin', 'geographic', 'latency-based']),
  }),
  phoneNumbers: z.object({
    sms: z.array(z.string()).optional(),
    voice: z.array(z.string()).optional(),
  }).optional(),
  messaging: z.object({
    serviceSid: z.string().optional(),
    rateLimits: z.object({
      smsPerMinute: z.number().default(100),
      voicePerMinute: z.number().default(60),
    }),
  }).optional(),
});

type TwilioConfig = z.infer<typeof TwilioConfigSchema>;

// Regional configuration
const REGIONAL_ENDPOINTS = {
  'us-east': 'https://accounts.twilio.com',
  'us-west': 'https://accounts.twilio.com',
  'eu-west': 'https://accounts.dublin.twilio.com',
  'eu-central': 'https://accounts.dublin.twilio.com',
  'ap-southeast': 'https://accounts.sydney.twilio.com',
  'ap-northeast': 'https://accounts.sydney.twilio.com',
};

export class TwilioService {
  private client: TwilioRestClient;
  private config: TwilioConfig;
  private regionalClients: Map<string, TwilioRestClient> = new Map();
  private phoneNumberPools: Map<string, string[]> = new Map();
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(config: TwilioConfig) {
    this.config = TwilioConfigSchema.parse(config);
    this.initializeClients();
    this.setupPhoneNumberPools();
    this.startRateLimitReset();
  }

  private initializeClients(): void {
    const accountSid = this.config.accountSid || process.env.TWILIO_ACCOUNT_SID;
    const authToken = this.config.authToken || process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    // Initialize primary client
    this.client = twilio(accountSid, authToken, {
      region: this.config.region,
      edge: REGIONAL_ENDPOINTS[this.config.region] ? 'dublin' : 'sydney',
    });

    // Initialize regional clients for failover
    const allRegions = [this.config.multiRegion.primary, ...this.config.multiRegion.fallback];
    
    for (const region of allRegions) {
      const regionalClient = twilio(accountSid, authToken, {
        region,
        edge: REGIONAL_ENDPOINTS[region] ? 'dublin' : 'sydney',
      });
      this.regionalClients.set(region, regionalClient);
    }
  }

  private setupPhoneNumberPools(): void {
    // SMS phone number pool
    if (this.config.phoneNumbers?.sms) {
      this.phoneNumberPools.set('sms', [...this.config.phoneNumbers.sms]);
    }

    // Voice phone number pool
    if (this.config.phoneNumbers?.voice) {
      this.phoneNumberPools.set('voice', [...this.config.phoneNumbers.voice]);
    }
  }

  private startRateLimitReset(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, limiter] of this.rateLimiters.entries()) {
        if (now >= limiter.resetTime) {
          this.rateLimiters.set(key, { count: 0, resetTime: now + 60000 }); // Reset every minute
        }
      }
    }, 60000);
  }

  // SMS Methods
  public async sendSMS(params: {
    to: string;
    message: string;
    from?: string;
    region?: string;
    priority?: 'high' | 'normal' | 'low';
    scheduledTime?: Date;
    mediaUrls?: string[];
  }): Promise<{ messageId: string; status: string; cost?: number }> {
    // Rate limiting check
    if (!this.checkRateLimit('sms')) {
      throw new Error('SMS rate limit exceeded');
    }

    // Select optimal phone number
    const fromNumber = params.from || this.selectPhoneNumber('sms', params.to);
    
    // Select client based on region or failover
    const client = this.selectClient(params.region);

    try {
      const messageOptions: any = {
        body: params.message,
        from: fromNumber,
        to: params.to,
      };

      // Add media URLs if provided
      if (params.mediaUrls?.length) {
        messageOptions.mediaUrl = params.mediaUrls;
      }

      // Schedule message if specified
      if (params.scheduledTime) {
        messageOptions.sendAt = params.scheduledTime;
      }

      // Set priority
      if (params.priority === 'high') {
        messageOptions.attemptWhilelist = [params.to];
      }

      const message = await client.messages.create(messageOptions);

      return {
        messageId: message.sid,
        status: message.status,
        cost: parseFloat(message.price || '0'),
      };
    } catch (error) {
      // Attempt failover to another region
      if (params.region !== this.config.multiRegion.primary) {
        return this.sendSMS({ ...params, region: this.config.multiRegion.primary });
      }
      throw error;
    }
  }

  public async sendBulkSMS(params: {
    recipients: Array<{ to: string; message: string; variables?: Record<string, string> }>;
    template?: string;
    batchSize?: number;
    delayMs?: number;
  }): Promise<Array<{ to: string; messageId?: string; status: string; error?: string }>> {
    const batchSize = params.batchSize || 10;
    const delayMs = params.delayMs || 1000;
    const results: Array<{ to: string; messageId?: string; status: string; error?: string }> = [];

    // Process in batches to respect rate limits
    for (let i = 0; i < params.recipients.length; i += batchSize) {
      const batch = params.recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          let message = recipient.message;
          
          // Apply template if provided
          if (params.template && recipient.variables) {
            message = this.applyTemplate(params.template, recipient.variables);
          }

          const result = await this.sendSMS({
            to: recipient.to,
            message,
          });

          return {
            to: recipient.to,
            messageId: result.messageId,
            status: 'sent',
          };
        } catch (error) {
          return {
            to: recipient.to,
            status: 'failed',
            error: error.message,
          };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            to: 'unknown',
            status: 'failed',
            error: result.reason.message,
          });
        }
      }

      // Delay between batches
      if (i + batchSize < params.recipients.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  // Voice Methods
  public async makeVoiceCall(params: {
    to: string;
    message: string;
    from?: string;
    voiceType?: 'male' | 'female';
    language?: string;
    region?: string;
    recordCall?: boolean;
    maxDuration?: number;
  }): Promise<{ callId: string; status: string; duration?: number }> {
    // Rate limiting check
    if (!this.checkRateLimit('voice')) {
      throw new Error('Voice call rate limit exceeded');
    }

    const fromNumber = params.from || this.selectPhoneNumber('voice', params.to);
    const client = this.selectClient(params.region);

    try {
      // Create TwiML for text-to-speech
      const twiml = this.generateTwiML({
        message: params.message,
        voice: params.voiceType || 'female',
        language: params.language || 'en-US',
        recordCall: params.recordCall,
      });

      const call = await client.calls.create({
        twiml,
        from: fromNumber,
        to: params.to,
        timeout: params.maxDuration || 60,
      });

      return {
        callId: call.sid,
        status: call.status,
      };
    } catch (error) {
      // Attempt failover
      if (params.region !== this.config.multiRegion.primary) {
        return this.makeVoiceCall({ ...params, region: this.config.multiRegion.primary });
      }
      throw error;
    }
  }

  public async createConferenceCall(params: {
    participants: string[];
    moderator?: string;
    recordConference?: boolean;
    maxDuration?: number;
    waitMusic?: string;
  }): Promise<{ conferenceId: string; participantIds: string[] }> {
    const conferenceName = `conference_${Date.now()}`;
    const participantIds: string[] = [];

    // Create conference room
    const conference = await this.client.conferences(conferenceName).fetch();

    // Add participants
    for (const participant of params.participants) {
      try {
        const call = await this.client.calls.create({
          twiml: `<Response><Dial><Conference>${conferenceName}</Conference></Dial></Response>`,
          from: this.selectPhoneNumber('voice', participant),
          to: participant,
        });
        participantIds.push(call.sid);
      } catch (error) {
        console.warn(`Failed to add participant ${participant}:`, error.message);
      }
    }

    return {
      conferenceId: conferenceName,
      participantIds,
    };
  }

  // Messaging Service Methods
  public async createMessagingService(params: {
    friendlyName: string;
    inboundRequestUrl?: string;
    fallbackUrl?: string;
    statusCallback?: string;
  }): Promise<{ serviceSid: string; webhookUrls: string[] }> {
    const service = await this.client.messaging.services.create({
      friendlyName: params.friendlyName,
      inboundRequestUrl: params.inboundRequestUrl,
      fallbackUrl: params.fallbackUrl,
      statusCallback: params.statusCallback,
    });

    return {
      serviceSid: service.sid,
      webhookUrls: [
        params.inboundRequestUrl,
        params.statusCallback,
      ].filter(Boolean),
    };
  }

  // Emergency and Failsafe Methods
  public async sendEmergencyAlert(params: {
    recipients: string[];
    message: string;
    channels: Array<'sms' | 'voice' | 'both'>;
    priority: 'critical' | 'high' | 'urgent';
  }): Promise<{ sent: number; failed: number; details: any[] }> {
    const details: any[] = [];
    let sent = 0;
    let failed = 0;

    // Override rate limits for emergency
    this.rateLimiters.clear();

    for (const recipient of params.recipients) {
      for (const channel of params.channels) {
        try {
          if (channel === 'sms' || channel === 'both') {
            const smsResult = await this.sendSMS({
              to: recipient,
              message: `EMERGENCY: ${params.message}`,
              priority: 'high',
            });
            details.push({ recipient, channel: 'sms', result: smsResult });
            sent++;
          }

          if (channel === 'voice' || channel === 'both') {
            const voiceResult = await this.makeVoiceCall({
              to: recipient,
              message: `Emergency alert. ${params.message}. This message will repeat.`,
            });
            details.push({ recipient, channel: 'voice', result: voiceResult });
            sent++;
          }
        } catch (error) {
          details.push({ recipient, channel, error: error.message });
          failed++;
        }
      }
    }

    return { sent, failed, details };
  }

  // Utility Methods
  private selectClient(region?: string): TwilioRestClient {
    if (region && this.regionalClients.has(region)) {
      return this.regionalClients.get(region)!;
    }
    return this.client;
  }

  private selectPhoneNumber(type: 'sms' | 'voice', destination: string): string {
    const pool = this.phoneNumberPools.get(type);
    if (!pool || pool.length === 0) {
      throw new Error(`No ${type} phone numbers configured`);
    }

    // Simple round-robin selection
    // In production, could implement geographic or carrier-based selection
    const index = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * pool.length);
    return pool[index];
  }

  private checkRateLimit(type: 'sms' | 'voice'): boolean {
    const limiter = this.rateLimiters.get(type) || { count: 0, resetTime: Date.now() + 60000 };
    const maxCount = type === 'sms' 
      ? this.config.messaging?.rateLimits.smsPerMinute || 100
      : this.config.messaging?.rateLimits.voicePerMinute || 60;

    if (limiter.count >= maxCount) {
      return false;
    }

    limiter.count++;
    this.rateLimiters.set(type, limiter);
    return true;
  }

  private generateTwiML(params: {
    message: string;
    voice: string;
    language: string;
    recordCall?: boolean;
  }): string {
    const voiceMap = {
      'male': 'man',
      'female': 'woman',
    };

    let twiml = `<Response>`;
    
    if (params.recordCall) {
      twiml += `<Record maxLength="300" />`;
    }
    
    twiml += `<Say voice="${voiceMap[params.voice] || 'woman'}" language="${params.language}">${params.message}</Say>`;
    twiml += `</Response>`;

    return twiml;
  }

  private applyTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  // Analytics and Monitoring
  public async getMetrics(): Promise<{
    totalMessages: number;
    totalCalls: number;
    costToDate: number;
    regionStats: Record<string, any>;
    rateLimitStatus: Record<string, any>;
  }> {
    try {
      // Fetch usage statistics from Twilio
      const messages = await this.client.usage.records.list({
        category: 'sms',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      });

      const calls = await this.client.usage.records.list({
        category: 'calls',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      });

      return {
        totalMessages: messages.reduce((sum, record) => sum + parseInt(record.count), 0),
        totalCalls: calls.reduce((sum, record) => sum + parseInt(record.count), 0),
        costToDate: messages.reduce((sum, record) => sum + parseFloat(record.price), 0) +
                   calls.reduce((sum, record) => sum + parseFloat(record.price), 0),
        regionStats: Object.fromEntries(this.regionalClients.keys()),
        rateLimitStatus: Object.fromEntries(this.rateLimiters.entries()),
      };
    } catch (error) {
      console.warn('Could not fetch Twilio metrics:', error.message);
      return {
        totalMessages: 0,
        totalCalls: 0,
        costToDate: 0,
        regionStats: {},
        rateLimitStatus: Object.fromEntries(this.rateLimiters.entries()),
      };
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      // Test account access
      await this.client.accounts.get();
      return true;
    } catch {
      return false;
    }
  }

  // Webhook handling for inbound messages
  public validateWebhook(signature: string, url: string, params: any): boolean {
    const authToken = this.config.authToken || process.env.TWILIO_AUTH_TOKEN;
    if (!authToken) return false;

    return twilio.validateRequest(authToken, signature, url, params);
  }

  public async handleInboundSMS(params: {
    from: string;
    to: string;
    body: string;
    messageId: string;
  }): Promise<{ response?: string; actions?: any[] }> {
    // Handle inbound SMS processing
    // This could trigger automations, store messages, etc.
    
    return {
      response: 'Message received',
      actions: [
        {
          type: 'store_message',
          data: params,
        },
      ],
    };
  }

  public async handleInboundCall(params: {
    from: string;
    to: string;
    callId: string;
  }): Promise<string> {
    // Return TwiML response for inbound calls
    return `
      <Response>
        <Say>Thank you for calling. Your call is important to us.</Say>
        <Redirect>/handle-call-menu</Redirect>
      </Response>
    `;
  }
}

// Export types
export type {
  TwilioConfig,
};