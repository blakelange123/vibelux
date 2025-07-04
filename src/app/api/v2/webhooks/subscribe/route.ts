import { NextRequest, NextResponse } from 'next/server'
import { validateAPIKey, generateAPIResponse, generateErrorResponse } from '@/middleware/api-auth'
import PublicAPIService from '@/services/public-api-service'
import WebhookManager from '@/services/webhook-manager'
import { z } from 'zod'

const apiService = new PublicAPIService()
const webhookManager = new WebhookManager()

const SubscribeSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()),
  filters: z.object({
    facilityIds: z.array(z.string()).optional(),
    severity: z.array(z.string()).optional(),
    cultivars: z.array(z.string()).optional()
  }).optional(),
  headers: z.record(z.string()).optional()
})

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiKey = req.headers.get('X-API-Key')
    if (!apiKey) {
      return generateErrorResponse('API key required', 401)
    }

    const validation = await apiService.validateRequest(apiKey, '/api/v2/webhooks/subscribe')
    if (!validation.valid) {
      return generateErrorResponse(validation.error || 'Invalid API key', 401)
    }

    // Check webhook permission
    if (!validation.keyData?.permissions.includes('webhook:subscribe')) {
      return generateErrorResponse('Insufficient permissions for webhook subscription', 403)
    }

    // Parse and validate request body
    const body = await req.json()
    const validated = SubscribeSchema.parse(body)

    // Subscribe to webhook
    const subscription = await webhookManager.subscribe(
      validation.keyData.id, // Use API key ID as user ID for API access
      {
        url: validated.url,
        events: validated.events as any,
        filters: validated.filters,
        headers: validated.headers
      }
    )

    return generateAPIResponse({
      id: subscription.id,
      url: subscription.url,
      events: subscription.events,
      secret: subscription.secret,
      active: subscription.active,
      filters: subscription.filters,
      verificationRequired: true,
      verificationEndpoint: `/api/v2/webhooks/${subscription.id}/verify`
    }, {
      endpoint: '/api/v2/webhooks/subscribe',
      rateLimitRemaining: validation.remaining
    })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return generateErrorResponse(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400)
    }
    console.error('Webhook subscribe error:', error)
    return generateErrorResponse(error.message || 'Internal server error', 500)
  }
}