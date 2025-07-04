import { NextRequest } from 'next/server';
import { validateApiKey, checkRateLimit } from '../../_middleware/auth';
import { handleApiError, successResponse } from '../../_middleware/error-handler';
import { rateLimitResponse, getRateLimitHeaders } from '../../_middleware/rate-limit';
import { validateRequestBody, validateQueryParams, webhookSubscriptionSchema, paginationSchema } from '../../_middleware/validation';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// GET - List webhook subscriptions
export async function GET(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'webhooks:read');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const rateLimitKey = `webhooks-list:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 1000, 3600);
    }

    const params = validateQueryParams(req.nextUrl.searchParams, paginationSchema);

    // Fetch webhook subscriptions
    const [subscriptions, total] = await Promise.all([
      prisma.usageRecord.findMany({
        where: {
          userId: user.id,
          feature: 'webhook',
          action: 'subscription'
        },
        orderBy: { createdAt: 'desc' },
        skip: ((params.page ?? 1) - 1) * (params.limit ?? 20),
        take: params.limit ?? 20
      }),
      prisma.usageRecord.count({
        where: {
          userId: user.id,
          feature: 'webhook',
          action: 'subscription'
        }
      })
    ]);

    const webhooks = subscriptions.map(sub => ({
      id: sub.id,
      ...(sub.metadata as Record<string, any>),
      createdAt: sub.createdAt
    }));

    const response = successResponse(
      { webhooks },
      {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        total,
        hasMore: (params.page ?? 1) * (params.limit ?? 20) < total
      }
    );

    const rateLimitHeaders = getRateLimitHeaders(rateLimitKey, 1000, 3600);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

// POST - Create webhook subscription
export async function POST(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'webhooks:write');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const rateLimitKey = `webhooks-create:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 50, 3600);
    }

    const body = await validateRequestBody(req, webhookSubscriptionSchema);

    // Generate webhook secret if not provided
    const secret = body.secret || crypto.randomBytes(32).toString('hex');

    // Validate webhook URL (test connection)
    try {
      const testPayload = {
        event: 'webhook.test',
        data: { message: 'Webhook subscription test' },
        timestamp: new Date().toISOString()
      };

      const signature = generateWebhookSignature(testPayload, secret);
      
      const testResponse = await fetch(body.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature
        },
        body: JSON.stringify(testPayload)
      });

      if (!testResponse.ok) {
        return handleApiError(
          new Error(`Webhook URL returned ${testResponse.status}`),
          req.nextUrl.pathname
        );
      }
    } catch (error) {
      return handleApiError(
        new Error('Failed to validate webhook URL'),
        req.nextUrl.pathname
      );
    }

    // Create subscription
    const subscription = await prisma.usageRecord.create({
      data: {
        userId: user.id,
        feature: 'webhook',
        action: 'subscription',
        metadata: {
          id: crypto.randomUUID(),
          url: body.url,
          events: body.events,
          secret: secret,
          enabled: body.enabled,
          createdAt: new Date().toISOString()
        }
      }
    });

    const response = successResponse({
      id: (subscription.metadata as any)?.id || subscription.id,
      url: body.url,
      events: body.events,
      secret: secret,
      enabled: body.enabled,
      createdAt: subscription.createdAt
    });

    const rateLimitHeaders = getRateLimitHeaders(rateLimitKey, 50, 3600);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

// PUT - Update webhook subscription
export async function PUT(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'webhooks:write');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const webhookId = req.nextUrl.searchParams.get('id');
    if (!webhookId) {
      return handleApiError(new Error('Webhook ID required'), req.nextUrl.pathname);
    }

    const rateLimitKey = `webhooks-update:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 100, 3600);
    }

    const body = await validateRequestBody(req, webhookSubscriptionSchema.partial());

    // Find existing webhook
    const existingWebhook = await prisma.usageRecord.findFirst({
      where: {
        userId: user.id,
        feature: 'webhook',
        action: 'subscription',
        metadata: {
          path: ['id'],
          equals: webhookId
        }
      }
    });

    if (!existingWebhook) {
      return handleApiError(new Error('Webhook not found'), req.nextUrl.pathname);
    }

    // Update webhook
    const updatedMetadata = {
      ...(existingWebhook.metadata as Record<string, any>),
      ...body,
      updatedAt: new Date().toISOString()
    };

    await prisma.usageRecord.update({
      where: { id: existingWebhook.id },
      data: { metadata: updatedMetadata }
    });

    const response = successResponse(updatedMetadata);

    const rateLimitHeaders = getRateLimitHeaders(rateLimitKey, 100, 3600);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

// DELETE - Delete webhook subscription
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'webhooks:write');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const webhookId = req.nextUrl.searchParams.get('id');
    if (!webhookId) {
      return handleApiError(new Error('Webhook ID required'), req.nextUrl.pathname);
    }

    const rateLimitKey = `webhooks-delete:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 100, 3600);
    }

    // Find and delete webhook
    const webhook = await prisma.usageRecord.findFirst({
      where: {
        userId: user.id,
        feature: 'webhook',
        action: 'subscription',
        metadata: {
          path: ['id'],
          equals: webhookId
        }
      }
    });

    if (!webhook) {
      return handleApiError(new Error('Webhook not found'), req.nextUrl.pathname);
    }

    await prisma.usageRecord.delete({
      where: { id: webhook.id }
    });

    const response = successResponse({ deleted: true });

    const rateLimitHeaders = getRateLimitHeaders(rateLimitKey, 100, 3600);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

// Helper function to generate webhook signature
function generateWebhookSignature(payload: any, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

