import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Mock webhook storage (in production, use database)
const webhookSubscriptions = new Map<string, {
  id: string
  url: string
  events: string[]
  secret: string
  enabled: boolean
  createdAt: string
  updatedAt?: string
}>()

// GET - List all webhook subscriptions
export async function GET(req: NextRequest) {
  try {
    const subscriptions = Array.from(webhookSubscriptions.values())
    
    return NextResponse.json({
      data: {
        webhooks: subscriptions,
        total: subscriptions.length
      },
      meta: {
        version: '1.0'
      }
    })
  } catch (error) {
    console.error('Get webhook subscriptions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new webhook subscription
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate required fields
    if (!body.url || !body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'URL and events array are required' },
        { status: 400 }
      )
    }
    
    // Generate webhook ID and secret
    const webhookId = `wh_${crypto.randomBytes(16).toString('hex')}`
    const secret = body.secret || crypto.randomBytes(32).toString('hex')
    
    // Create subscription
    const subscription = {
      id: webhookId,
      url: body.url,
      events: body.events,
      secret: secret,
      enabled: body.enabled !== false,
      createdAt: new Date().toISOString()
    }
    
    webhookSubscriptions.set(webhookId, subscription)
    
    return NextResponse.json({
      data: subscription,
      meta: {
        version: '1.0',
        message: 'Webhook subscription created successfully'
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Create webhook subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update webhook subscription
export async function PUT(req: NextRequest) {
  try {
    const webhookId = req.nextUrl.searchParams.get('id')
    if (!webhookId) {
      return NextResponse.json(
        { error: 'Webhook ID required' },
        { status: 400 }
      )
    }
    
    const subscription = webhookSubscriptions.get(webhookId)
    if (!subscription) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }
    
    const body = await req.json()
    
    // Update subscription
    const updated = {
      ...subscription,
      ...(body.url && { url: body.url }),
      ...(body.events && { events: body.events }),
      ...(body.enabled !== undefined && { enabled: body.enabled }),
      updatedAt: new Date().toISOString()
    }
    
    webhookSubscriptions.set(webhookId, updated)
    
    return NextResponse.json({
      data: updated,
      meta: {
        version: '1.0',
        message: 'Webhook subscription updated successfully'
      }
    })
  } catch (error) {
    console.error('Update webhook subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete webhook subscription
export async function DELETE(req: NextRequest) {
  try {
    const webhookId = req.nextUrl.searchParams.get('id')
    if (!webhookId) {
      return NextResponse.json(
        { error: 'Webhook ID required' },
        { status: 400 }
      )
    }
    
    const subscription = webhookSubscriptions.get(webhookId)
    if (!subscription) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }
    
    webhookSubscriptions.delete(webhookId)
    
    return NextResponse.json({
      data: { deleted: true },
      meta: {
        version: '1.0',
        message: 'Webhook subscription deleted successfully'
      }
    })
  } catch (error) {
    console.error('Delete webhook subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}