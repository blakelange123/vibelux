import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { handleApiError, successResponse } from '../_middleware/error-handler';
import { validateRequestBody, paginationSchema } from '../_middleware/validation';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { z } from 'zod';

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.enum([
    '*', // All permissions
    'lighting:read',
    'lighting:control',
    'environmental:read',
    'environmental:write',
    'plant-biology:read',
    'plant-biology:write',
    'compliance:read',
    'compliance:write',
    'webhooks:read',
    'webhooks:write'
  ])),
  expiresAt: z.string().datetime().optional()
});

// GET - List API keys
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return handleApiError(new Error('Unauthorized'), req.nextUrl.pathname);
    }

    const params = validateQueryParams(req.nextUrl.searchParams, paginationSchema);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return handleApiError(new Error('User not found'), req.nextUrl.pathname);
    }

    // Fetch API keys
    const [keys, total] = await Promise.all([
      prisma.apiKey.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          name: true,
          permissions: true,
          lastUsed: true,
          expiresAt: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: ((params.page ?? 1) - 1) * (params.limit ?? 20),
        take: params.limit ?? 20
      }),
      prisma.apiKey.count({ where: { userId: user.id } })
    ]);

    return successResponse(
      { keys },
      {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        total,
        hasMore: (params.page ?? 1) * (params.limit ?? 20) < total
      }
    );
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

// POST - Create new API key
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return handleApiError(new Error('Unauthorized'), req.nextUrl.pathname);
    }

    const body = await validateRequestBody(req, createKeySchema);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return handleApiError(new Error('User not found'), req.nextUrl.pathname);
    }

    // Check API key limits based on subscription
    const keyCount = await prisma.apiKey.count({
      where: { userId: user.id }
    });

    const limits = {
      FREE: 1,
      PROFESSIONAL: 5,
      ENTERPRISE: -1 // Unlimited
    };

    const limit = limits[user.subscriptionTier as keyof typeof limits];
    if (limit !== -1 && keyCount >= limit) {
      return handleApiError(
        new Error(`API key limit reached. ${user.subscriptionTier} plan allows ${limit} keys.`),
        req.nextUrl.pathname
      );
    }

    // Generate API key
    const rawKey = `vb_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = crypto
      .createHash('sha256')
      .update(rawKey)
      .digest('hex');

    // Create API key record
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: body.name,
        key: hashedKey,
        permissions: body.permissions,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null
      }
    });

    return successResponse({
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, // Only returned once
      permissions: apiKey.permissions,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      message: 'Store this API key securely. It will not be shown again.'
    });
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

// DELETE - Revoke API key
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return handleApiError(new Error('Unauthorized'), req.nextUrl.pathname);
    }

    const keyId = req.nextUrl.searchParams.get('id');
    if (!keyId) {
      return handleApiError(new Error('API key ID required'), req.nextUrl.pathname);
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return handleApiError(new Error('User not found'), req.nextUrl.pathname);
    }

    // Delete API key
    const deleted = await prisma.apiKey.deleteMany({
      where: {
        id: keyId,
        userId: user.id
      }
    });

    if (deleted.count === 0) {
      return handleApiError(new Error('API key not found'), req.nextUrl.pathname);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

// Helper function
function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  const params = Object.fromEntries(searchParams.entries());
  return schema.parse(params);
}