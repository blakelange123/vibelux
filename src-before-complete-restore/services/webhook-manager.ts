/**
 * Webhook Manager Service
 * 
 * Manages webhook subscriptions, event triggers, and delivery
 * for real-time notifications and automation
 */

import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import axios from 'axios'
import crypto from 'crypto'
import { z } from 'zod'
import PQueue from 'p-queue'

const prisma = new PrismaClient()
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
})

// Webhook event types
export enum WebhookEvent {
  // Yield events
  YIELD_TARGET_MISS = 'yield.target.miss',
  YIELD_TARGET_EXCEED = 'yield.target.exceed',
  HARVEST_COMPLETE = 'harvest.complete',
  
  // Energy events
  ENERGY_SPIKE = 'energy.spike',
  ENERGY_ANOMALY = 'energy.anomaly',
  DEMAND_PEAK_WARNING = 'demand.peak.warning',
  
  // Environmental events
  ENVIRONMENT_OUT_OF_RANGE = 'environment.out_of_range',
  VPD_CRITICAL = 'vpd.critical',
  CO2_LOW = 'co2.low',
  
  // Equipment events
  EQUIPMENT_FAILURE = 'equipment.failure',
  MAINTENANCE_DUE = 'maintenance.due',
  RUNTIME_THRESHOLD = 'runtime.threshold',
  
  // Plant health events
  PEST_DETECTED = 'pest.detected',
  DISEASE_RISK_HIGH = 'disease.risk.high',
  STRESS_DETECTED = 'stress.detected',
  
  // Automation events
  AUTOMATION_TRIGGERED = 'automation.triggered',
  AUTOMATION_FAILED = 'automation.failed',
  RECIPE_CHANGED = 'recipe.changed',
  
  // ML events
  ML_PREDICTION_READY = 'ml.prediction.ready',
  ML_ANOMALY_DETECTED = 'ml.anomaly.detected',
  ML_MODEL_UPDATED = 'ml.model.updated'
}

// Webhook payload schemas
export const WebhookPayloadSchemas = {
  [WebhookEvent.YIELD_TARGET_MISS]: z.object({
    facilityId: z.string(),
    cultivar: z.string(),
    cycleId: z.string(),
    targetYield: z.number(),
    actualYield: z.number(),
    variance: z.number(),
    timestamp: z.date()
  }),
  
  [WebhookEvent.ENERGY_SPIKE]: z.object({
    facilityId: z.string(),
    timestamp: z.date(),
    peakDemand: z.number(),
    threshold: z.number(),
    duration: z.number(),
    estimatedCost: z.number()
  }),
  
  [WebhookEvent.ENVIRONMENT_OUT_OF_RANGE]: z.object({
    facilityId: z.string(),
    zoneId: z.string(),
    parameter: z.string(),
    currentValue: z.number(),
    targetRange: z.object({
      min: z.number(),
      max: z.number()
    }),
    duration: z.number(),
    timestamp: z.date()
  }),
  
  [WebhookEvent.EQUIPMENT_FAILURE]: z.object({
    facilityId: z.string(),
    equipmentId: z.string(),
    equipmentType: z.string(),
    failureType: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    diagnostics: z.record(z.any()),
    timestamp: z.date()
  }),
  
  [WebhookEvent.PEST_DETECTED]: z.object({
    facilityId: z.string(),
    zoneId: z.string(),
    pestType: z.string(),
    confidence: z.number(),
    affectedArea: z.number(),
    imageUrl: z.string().optional(),
    recommendedActions: z.array(z.string()),
    timestamp: z.date()
  })
}

// Webhook subscription configuration
export interface WebhookSubscription {
  id: string
  userId: string
  url: string
  events: WebhookEvent[]
  secret: string
  active: boolean
  filters?: {
    facilityIds?: string[]
    severity?: string[]
    cultivars?: string[]
  }
  retryConfig?: {
    maxRetries: number
    backoffMultiplier: number
    maxBackoffSeconds: number
  }
  headers?: Record<string, string>
}

// Webhook delivery status
export interface WebhookDelivery {
  id: string
  subscriptionId: string
  event: WebhookEvent
  payload: any
  status: 'pending' | 'delivered' | 'failed'
  attempts: number
  lastAttemptAt?: Date
  responseStatus?: number
  responseBody?: string
  error?: string
}

export class WebhookManager {
  private deliveryQueue: PQueue
  private subscriptions: Map<string, WebhookSubscription> = new Map()
  
  constructor() {
    // Initialize delivery queue with concurrency limit
    this.deliveryQueue = new PQueue({ 
      concurrency: 10,
      interval: 1000,
      intervalCap: 50 // Max 50 webhooks per second
    })
    
    this.loadSubscriptions()
  }

  /**
   * Load active webhook subscriptions
   */
  private async loadSubscriptions() {
    const subs = await prisma.webhookSubscription.findMany({
      where: { active: true }
    })
    
    subs.forEach(sub => {
      this.subscriptions.set(sub.id, {
        id: sub.id,
        userId: sub.user_id,
        url: sub.url,
        events: sub.events as WebhookEvent[],
        secret: sub.secret,
        active: sub.active,
        filters: sub.filters as any,
        retryConfig: sub.retry_config as any,
        headers: sub.headers as any
      })
    })
  }

  /**
   * Subscribe to webhook events
   */
  async subscribe(
    userId: string,
    config: {
      url: string
      events: WebhookEvent[]
      filters?: any
      headers?: Record<string, string>
    }
  ): Promise<WebhookSubscription> {
    // Validate URL
    if (!this.isValidWebhookUrl(config.url)) {
      throw new Error('Invalid webhook URL')
    }
    
    // Generate secret
    const secret = crypto.randomBytes(32).toString('hex')
    
    // Create subscription
    const subscription = await prisma.webhookSubscription.create({
      data: {
        user_id: userId,
        url: config.url,
        events: config.events,
        secret,
        filters: config.filters || {},
        headers: config.headers || {},
        retry_config: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffSeconds: 300
        },
        active: true
      }
    })
    
    const sub: WebhookSubscription = {
      id: subscription.id,
      userId,
      url: config.url,
      events: config.events,
      secret,
      active: true,
      filters: config.filters,
      headers: config.headers,
      retryConfig: subscription.retry_config as any
    }
    
    // Add to cache
    this.subscriptions.set(subscription.id, sub)
    
    // Send verification webhook
    await this.sendVerificationWebhook(sub)
    
    return sub
  }

  /**
   * Unsubscribe from webhook
   */
  async unsubscribe(subscriptionId: string, userId: string): Promise<void> {
    const subscription = await prisma.webhookSubscription.findFirst({
      where: {
        id: subscriptionId,
        user_id: userId
      }
    })
    
    if (!subscription) {
      throw new Error('Subscription not found')
    }
    
    // Mark as inactive
    await prisma.webhookSubscription.update({
      where: { id: subscriptionId },
      data: { active: false }
    })
    
    // Remove from cache
    this.subscriptions.delete(subscriptionId)
  }

  /**
   * Trigger webhook event
   */
  async triggerEvent(
    event: WebhookEvent,
    payload: any,
    context?: {
      facilityId?: string
      severity?: string
      cultivar?: string
    }
  ): Promise<void> {
    // Validate payload against schema
    const schema = WebhookPayloadSchemas[event]
    if (schema) {
      try {
        payload = schema.parse(payload)
      } catch (error) {
        console.error(`Invalid webhook payload for ${event}:`, error)
        return
      }
    }
    
    // Find matching subscriptions
    const matchingSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => {
        // Check if subscribed to this event
        if (!sub.events.includes(event)) return false
        
        // Apply filters
        if (sub.filters) {
          if (sub.filters.facilityIds && context?.facilityId) {
            if (!sub.filters.facilityIds.includes(context.facilityId)) return false
          }
          if (sub.filters.severity && context?.severity) {
            if (!sub.filters.severity.includes(context.severity)) return false
          }
          if (sub.filters.cultivars && context?.cultivar) {
            if (!sub.filters.cultivars.includes(context.cultivar)) return false
          }
        }
        
        return true
      })
    
    // Queue deliveries
    for (const subscription of matchingSubscriptions) {
      await this.queueDelivery(subscription, event, payload)
    }
  }

  /**
   * Queue webhook delivery
   */
  private async queueDelivery(
    subscription: WebhookSubscription,
    event: WebhookEvent,
    payload: any
  ): Promise<void> {
    // Create delivery record
    const delivery = await prisma.webhookDelivery.create({
      data: {
        subscription_id: subscription.id,
        event,
        payload,
        status: 'pending',
        attempts: 0
      }
    })
    
    // Add to delivery queue
    this.deliveryQueue.add(async () => {
      await this.deliverWebhook(delivery.id, subscription, event, payload)
    })
  }

  /**
   * Deliver webhook
   */
  private async deliverWebhook(
    deliveryId: string,
    subscription: WebhookSubscription,
    event: WebhookEvent,
    payload: any,
    attempt: number = 1
  ): Promise<void> {
    const timestamp = Date.now()
    const webhookId = crypto.randomUUID()
    
    // Prepare webhook payload
    const webhookPayload = {
      id: webhookId,
      event,
      timestamp: new Date(timestamp).toISOString(),
      data: payload
    }
    
    // Generate signature
    const signature = this.generateSignature(
      JSON.stringify(webhookPayload),
      subscription.secret,
      timestamp
    )
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-Id': webhookId,
      'X-Webhook-Event': event,
      'X-Webhook-Timestamp': timestamp.toString(),
      'X-Webhook-Signature': signature,
      ...subscription.headers
    }
    
    try {
      // Send webhook
      const response = await axios.post(subscription.url, webhookPayload, {
        headers,
        timeout: 30000, // 30 second timeout
        validateStatus: () => true // Don't throw on any status
      })
      
      // Update delivery status
      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: response.status >= 200 && response.status < 300 ? 'delivered' : 'failed',
          attempts: attempt,
          last_attempt_at: new Date(),
          response_status: response.status,
          response_body: response.data ? JSON.stringify(response.data).slice(0, 1000) : null
        }
      })
      
      // If failed and retries available, schedule retry
      if (response.status >= 400 && attempt < (subscription.retryConfig?.maxRetries || 3)) {
        const backoffSeconds = Math.min(
          Math.pow(subscription.retryConfig?.backoffMultiplier || 2, attempt) * 10,
          subscription.retryConfig?.maxBackoffSeconds || 300
        )
        
        setTimeout(() => {
          this.deliveryQueue.add(async () => {
            await this.deliverWebhook(deliveryId, subscription, event, payload, attempt + 1)
          })
        }, backoffSeconds * 1000)
      }
      
    } catch (error: any) {
      // Update delivery with error
      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'failed',
          attempts: attempt,
          last_attempt_at: new Date(),
          error: error.message
        }
      })
      
      // Retry if attempts remaining
      if (attempt < (subscription.retryConfig?.maxRetries || 3)) {
        const backoffSeconds = Math.min(
          Math.pow(subscription.retryConfig?.backoffMultiplier || 2, attempt) * 10,
          subscription.retryConfig?.maxBackoffSeconds || 300
        )
        
        setTimeout(() => {
          this.deliveryQueue.add(async () => {
            await this.deliverWebhook(deliveryId, subscription, event, payload, attempt + 1)
          })
        }, backoffSeconds * 1000)
      }
    }
  }

  /**
   * Send verification webhook
   */
  private async sendVerificationWebhook(subscription: WebhookSubscription): Promise<void> {
    const verificationToken = crypto.randomBytes(32).toString('hex')
    
    // Store verification token
    await redis.setex(
      `webhook:verify:${subscription.id}`,
      300, // 5 minute expiry
      verificationToken
    )
    
    // Send verification webhook
    await this.triggerEvent(
      'webhook.verification' as any,
      {
        subscriptionId: subscription.id,
        verificationToken,
        message: 'Please verify this webhook endpoint'
      }
    )
  }

  /**
   * Verify webhook subscription
   */
  async verifySubscription(subscriptionId: string, token: string): Promise<boolean> {
    const storedToken = await redis.get(`webhook:verify:${subscriptionId}`)
    
    if (storedToken === token) {
      await prisma.webhookSubscription.update({
        where: { id: subscriptionId },
        data: { verified: true }
      })
      
      await redis.del(`webhook:verify:${subscriptionId}`)
      return true
    }
    
    return false
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(payload: string, secret: string, timestamp: number): string {
    const message = `${timestamp}.${payload}`
    return crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex')
  }

  /**
   * Validate webhook signature
   */
  validateSignature(
    payload: string,
    signature: string,
    secret: string,
    timestamp: number
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret, timestamp)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }

  /**
   * Get webhook delivery history
   */
  async getDeliveryHistory(
    subscriptionId: string,
    filters?: {
      event?: WebhookEvent
      status?: 'pending' | 'delivered' | 'failed'
      startDate?: Date
      endDate?: Date
    }
  ): Promise<WebhookDelivery[]> {
    const where: any = { subscription_id: subscriptionId }
    
    if (filters?.event) where.event = filters.event
    if (filters?.status) where.status = filters.status
    if (filters?.startDate || filters?.endDate) {
      where.created_at = {}
      if (filters.startDate) where.created_at.gte = filters.startDate
      if (filters.endDate) where.created_at.lte = filters.endDate
    }
    
    const deliveries = await prisma.webhookDelivery.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 100
    })
    
    return deliveries.map(d => ({
      id: d.id,
      subscriptionId: d.subscription_id,
      event: d.event as WebhookEvent,
      payload: d.payload,
      status: d.status as any,
      attempts: d.attempts,
      lastAttemptAt: d.last_attempt_at || undefined,
      responseStatus: d.response_status || undefined,
      responseBody: d.response_body || undefined,
      error: d.error || undefined
    }))
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(
    subscriptionId: string,
    event: WebhookEvent
  ): Promise<{ success: boolean; response?: any; error?: string }> {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription) {
      return { success: false, error: 'Subscription not found' }
    }
    
    // Generate test payload
    const testPayload = this.generateTestPayload(event)
    
    try {
      // Send test webhook
      const timestamp = Date.now()
      const webhookId = crypto.randomUUID()
      
      const webhookPayload = {
        id: webhookId,
        event,
        timestamp: new Date(timestamp).toISOString(),
        data: testPayload,
        test: true
      }
      
      const signature = this.generateSignature(
        JSON.stringify(webhookPayload),
        subscription.secret,
        timestamp
      )
      
      const response = await axios.post(subscription.url, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Id': webhookId,
          'X-Webhook-Event': event,
          'X-Webhook-Timestamp': timestamp.toString(),
          'X-Webhook-Signature': signature,
          'X-Webhook-Test': 'true',
          ...subscription.headers
        },
        timeout: 10000
      })
      
      return {
        success: response.status >= 200 && response.status < 300,
        response: {
          status: response.status,
          headers: response.headers,
          body: response.data
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Generate test payload for event
   */
  private generateTestPayload(event: WebhookEvent): any {
    const testPayloads = {
      [WebhookEvent.YIELD_TARGET_MISS]: {
        facilityId: 'test-facility',
        cultivar: 'Test Cultivar',
        cycleId: 'test-cycle',
        targetYield: 1000,
        actualYield: 850,
        variance: -15,
        timestamp: new Date()
      },
      [WebhookEvent.ENERGY_SPIKE]: {
        facilityId: 'test-facility',
        timestamp: new Date(),
        peakDemand: 150,
        threshold: 100,
        duration: 15,
        estimatedCost: 250
      }
    }
    
    return testPayloads[event] || { test: true, event }
  }

  /**
   * Validate webhook URL
   */
  private isValidWebhookUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(userId: string): Promise<WebhookStats> {
    const subscriptions = await prisma.webhookSubscription.findMany({
      where: { user_id: userId },
      include: {
        _count: {
          select: {
            deliveries: true
          }
        }
      }
    })
    
    const deliveryStats = await prisma.webhookDelivery.groupBy({
      by: ['status'],
      where: {
        subscription: {
          user_id: userId
        }
      },
      _count: true
    })
    
    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(s => s.active).length,
      totalDeliveries: deliveryStats.reduce((sum, stat) => sum + stat._count, 0),
      successfulDeliveries: deliveryStats.find(s => s.status === 'delivered')?._count || 0,
      failedDeliveries: deliveryStats.find(s => s.status === 'failed')?._count || 0,
      pendingDeliveries: deliveryStats.find(s => s.status === 'pending')?._count || 0
    }
  }
}

// Type definitions
interface WebhookStats {
  totalSubscriptions: number
  activeSubscriptions: number
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  pendingDeliveries: number
}

export default WebhookManager