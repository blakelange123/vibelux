import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { rateLimit } from './rate-limit';
import crypto from 'crypto';

export interface AuthContext {
  apiKey: {
    id: string;
    userId: string;
    name: string;
    permissions: string[];
  };
  user: {
    id: string;
    email: string;
    subscriptionTier: string;
  };
}

export async function validateApiKey(
  req: NextRequest,
  requiredPermission?: string
): Promise<AuthContext | NextResponse> {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json(
      { 
        error: 'Missing API key',
        message: 'Please provide an API key in the x-api-key header'
      },
      { status: 401 }
    );
  }

  // Hash the API key for comparison (keys are stored hashed)
  const hashedKey = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: hashedKey },
      include: {
        user: true
      }
    });

    if (!keyRecord) {
      return NextResponse.json(
        { 
          error: 'Invalid API key',
          message: 'The provided API key is invalid or has been revoked'
        },
        { status: 401 }
      );
    }

    // Check if key has expired
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { 
          error: 'API key expired',
          message: 'Your API key has expired. Please generate a new one.'
        },
        { status: 401 }
      );
    }

    // Check permissions
    const permissions = keyRecord.permissions as string[];
    if (requiredPermission && !permissions.includes(requiredPermission) && !permissions.includes('*')) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          message: `This endpoint requires the '${requiredPermission}' permission`
        },
        { status: 403 }
      );
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() }
    });

    // Track API usage
    await prisma.usageRecord.create({
      data: {
        userId: keyRecord.userId,
        feature: 'api',
        action: req.nextUrl.pathname,
        metadata: {
          method: req.method,
          apiKeyId: keyRecord.id
        }
      }
    });

    return {
      apiKey: {
        id: keyRecord.id,
        userId: keyRecord.userId,
        name: keyRecord.name,
        permissions
      },
      user: {
        id: keyRecord.user.id,
        email: keyRecord.user.email,
        subscriptionTier: keyRecord.user.subscriptionTier
      }
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An error occurred while validating your API key'
      },
      { status: 500 }
    );
  }
}

// Helper to check rate limits based on subscription tier
export async function checkRateLimit(
  userId: string,
  subscriptionTier: string
): Promise<boolean> {
  const limits = {
    FREE: { requests: 100, window: 3600 }, // 100 requests per hour
    PROFESSIONAL: { requests: 1000, window: 3600 }, // 1000 requests per hour
    ENTERPRISE: { requests: 10000, window: 3600 } // 10000 requests per hour
  };

  const limit = limits[subscriptionTier as keyof typeof limits] || limits.FREE;
  
  return rateLimit(userId, limit.requests, limit.window);
}