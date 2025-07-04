import { NextRequest, NextResponse } from 'next/server'
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
  subscription: WebhookSubscription
  createdAt: string
  active: boolean
}>()

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: WebhookSubscription = await req.json()
    
    // Validate webhook subscription
    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400 }
      )
    }
    
    if (!body.url || !isValidUrl(body.url)) {
      return NextResponse.json(
        { error: 'Valid webhook URL is required' },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Generate webhook secret if not provided
    const webhookSecret = body.secret || crypto.randomBytes(32).toString('hex')
    
    // Create subscription
    const subscriptionId = `wh_${crypto.randomBytes(16).toString('hex')}`
    const subscription = {
      id: subscriptionId,
      subscription: {
        ...body,
        secret: webhookSecret
      },
      createdAt: new Date().toISOString(),
      active: true
    }
    
    // Store subscription
    webhookSubscriptions.set(subscriptionId, subscription)
    
    return NextResponse.json({
      data: {
        id: subscriptionId,
        events: body.events,
        url: body.url,
        secret: webhookSecret,
        filters: body.filters,
        status: 'active',
        createdAt: subscription.createdAt
      },
      meta: {
        version: '1.0',
        message: 'Webhook subscription created successfully'
      }
    })
    
  } catch (error) {
    console.error('Webhook subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get all subscriptions
    const subscriptions = Array.from(webhookSubscriptions.values())
      .map(sub => ({
        id: sub.id,
        events: sub.subscription.events,
        url: sub.subscription.url,
        filters: sub.subscription.filters,
        status: sub.active ? 'active' : 'inactive',
        createdAt: sub.createdAt
      }))
    
    return NextResponse.json({
      data: {
        subscriptions,
        total: subscriptions.length
      },
      meta: {
        version: '1.0'
      }
    })
    
  } catch (error) {
    console.error('Get webhooks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Get subscription ID from URL
    const { searchParams } = new URL(req.url)
    const subscriptionId = searchParams.get('id')
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }
    
    // Check if subscription exists
    const subscription = webhookSubscriptions.get(subscriptionId)
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }
    
    // Delete subscription
    webhookSubscriptions.delete(subscriptionId)
    
    return NextResponse.json({
      data: {
        id: subscriptionId,
        status: 'deleted'
      },
      meta: {
        version: '1.0',
        message: 'Webhook subscription deleted successfully'
      }
    })
    
  } catch (error) {
    console.error('Delete webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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