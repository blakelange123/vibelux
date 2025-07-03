import { NextRequest } from 'next/server'
import { validateAPIKey, generateAPIResponse, generateErrorResponse, trackAPIUsage } from '@/middleware/api-auth'
import crypto from 'crypto'

interface WebhookSubscription {
  events: string[]
  url: string
  secret?: string
  filters?: {
    zones?: string[]
    severity?: string[]
    metrics?: string[]
  }
}

// Mock webhook storage (in production, use database)
const webhookSubscriptions = new Map<string, {
  id: string
  apiKey: string
  subscription: WebhookSubscription
  createdAt: string
  active: boolean
}>()

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiContext = await validateAPIKey(req)
    if (!apiContext) {
      return generateErrorResponse('Invalid or missing API key', 401)
    }
    
    // Track usage
    await trackAPIUsage(apiContext.apiKey, '/api/v1/webhooks/subscribe', 'POST')
    
    // Parse request body
    const body: WebhookSubscription = await req.json()
    
    // Validate webhook subscription
    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      return generateErrorResponse('Events array is required')
    }
    
    if (!body.url || !isValidUrl(body.url)) {
      return generateErrorResponse('Valid webhook URL is required')
    }
    
    // Validate events
    const validEvents = [
      'lighting.status_change',
      'lighting.fixture_offline',
      'environmental.threshold_exceeded',
      'environmental.sensor_error',
      'biology.growth_stage_change',
      'biology.stress_detected',
      'biology.harvest_ready',
      'compliance.audit_reminder',
      'compliance.certificate_expiring',
      'system.maintenance_required',
      'system.alert'
    ]
    
    const invalidEvents = body.events.filter(event => !validEvents.includes(event))
    if (invalidEvents.length > 0) {
      return generateErrorResponse(`Invalid events: ${invalidEvents.join(', ')}`)
    }
    
    // Generate webhook secret if not provided
    const webhookSecret = body.secret || crypto.randomBytes(32).toString('hex')
    
    // Create subscription
    const subscriptionId = `wh_${crypto.randomBytes(16).toString('hex')}`
    const subscription = {
      id: subscriptionId,
      apiKey: apiContext.apiKey,
      subscription: {
        ...body,
        secret: webhookSecret
      },
      createdAt: new Date().toISOString(),
      active: true
    }
    
    // Store subscription
    webhookSubscriptions.set(subscriptionId, subscription)
    
    // Test webhook with ping event
    const testResult = await testWebhook(body.url, webhookSecret)
    
    return generateAPIResponse({
      id: subscriptionId,
      events: body.events,
      url: body.url,
      secret: webhookSecret,
      filters: body.filters,
      status: 'active',
      testResult: testResult,
      createdAt: subscription.createdAt
    }, {
      version: '1.0',
      message: 'Webhook subscription created successfully'
    })
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Rate limit exceeded') {
        return generateErrorResponse('Rate limit exceeded', 429)
      }
      return generateErrorResponse(error.message)
    }
    return generateErrorResponse('Internal server error', 500)
  }
}

export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const apiContext = await validateAPIKey(req)
    if (!apiContext) {
      return generateErrorResponse('Invalid or missing API key', 401)
    }
    
    // Track usage
    await trackAPIUsage(apiContext.apiKey, '/api/v1/webhooks/subscribe', 'GET')
    
    // Get subscriptions for this API key
    const subscriptions = Array.from(webhookSubscriptions.values())
      .filter(sub => sub.apiKey === apiContext.apiKey)
      .map(sub => ({
        id: sub.id,
        events: sub.subscription.events,
        url: sub.subscription.url,
        filters: sub.subscription.filters,
        status: sub.active ? 'active' : 'inactive',
        createdAt: sub.createdAt
      }))
    
    return generateAPIResponse({
      subscriptions,
      total: subscriptions.length
    }, {
      version: '1.0'
    })
    
  } catch (error) {
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
      return generateErrorResponse('Rate limit exceeded', 429)
    }
    return generateErrorResponse('Internal server error', 500)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Validate API key
    const apiContext = await validateAPIKey(req)
    if (!apiContext) {
      return generateErrorResponse('Invalid or missing API key', 401)
    }
    
    // Get subscription ID from URL
    const { searchParams } = new URL(req.url)
    const subscriptionId = searchParams.get('id')
    
    if (!subscriptionId) {
      return generateErrorResponse('Subscription ID is required')
    }
    
    // Track usage
    await trackAPIUsage(apiContext.apiKey, '/api/v1/webhooks/subscribe', 'DELETE')
    
    // Check if subscription exists and belongs to this API key
    const subscription = webhookSubscriptions.get(subscriptionId)
    if (!subscription || subscription.apiKey !== apiContext.apiKey) {
      return generateErrorResponse('Subscription not found', 404)
    }
    
    // Delete subscription
    webhookSubscriptions.delete(subscriptionId)
    
    return generateAPIResponse({
      id: subscriptionId,
      status: 'deleted'
    }, {
      version: '1.0',
      message: 'Webhook subscription deleted successfully'
    })
    
  } catch (error) {
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
      return generateErrorResponse('Rate limit exceeded', 429)
    }
    return generateErrorResponse('Internal server error', 500)
  }
}

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:'
  } catch {
    return false
  }
}

async function testWebhook(url: string, secret: string): Promise<any> {
  try {
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'Webhook endpoint test'
      }
    }
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(testPayload))
      .digest('hex')
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature
      },
      body: JSON.stringify(testPayload)
    })
    
    return {
      success: response.ok,
      statusCode: response.status,
      message: response.ok ? 'Webhook test successful' : 'Webhook test failed'
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to reach webhook endpoint'
    }
  }
}