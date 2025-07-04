import { NextRequest } from 'next/server';
import { validateApiKey, checkRateLimit } from '../../_middleware/auth';
import { handleApiError, successResponse } from '../../_middleware/error-handler';
import { rateLimitResponse, getRateLimitHeaders } from '../../_middleware/rate-limit';
import { validateRequestBody, validateQueryParams, lightingScheduleSchema, paginationSchema } from '../../_middleware/validation';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const querySchema = paginationSchema.extend({
  projectId: z.string().optional(),
  enabled: z.coerce.boolean().optional()
});

// GET - List schedules
export async function GET(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'lighting:read');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const rateLimitKey = `lighting-schedules-list:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 1000, 3600);
    }

    const params = validateQueryParams(req.nextUrl.searchParams, querySchema);

    // For this example, we'll store schedules in usage records
    // In production, create a dedicated Schedule model
    const schedules = await prisma.usageRecord.findMany({
      where: {
        userId: user.id,
        feature: 'lighting-schedule',
        action: 'create-schedule',
        ...(params.enabled !== undefined && {
          metadata: {
            path: ['enabled'],
            equals: params.enabled
          }
        })
      },
      orderBy: { createdAt: 'desc' },
      skip: ((params.page ?? 1) - 1) * (params.limit ?? 20),
      take: params.limit ?? 20
    });

    const total = await prisma.usageRecord.count({
      where: {
        userId: user.id,
        feature: 'lighting-schedule',
        action: 'create-schedule'
      }
    });

    const response = successResponse(
      {
        schedules: schedules.map(s => ({
          id: s.id,
          ...(s.metadata as Record<string, any>)
        }))
      },
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

// POST - Create schedule
export async function POST(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'lighting:control');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const rateLimitKey = `lighting-schedules-create:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 100, 3600);
    }

    const body = await validateRequestBody(req, lightingScheduleSchema);

    // Verify fixtures belong to user
    const projectFixtures = await prisma.projectFixture.findMany({
      where: {
        id: { in: body.fixtures },
        project: {
          userId: user.id
        }
      }
    });

    if (projectFixtures.length !== body.fixtures.length) {
      return handleApiError(
        new Error('One or more fixtures not found or access denied'),
        req.nextUrl.pathname
      );
    }

    // Store schedule
    const schedule = await prisma.usageRecord.create({
      data: {
        userId: user.id,
        feature: 'lighting-schedule',
        action: 'create-schedule',
        metadata: {
          ...body,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        }
      }
    });

    const response = successResponse({
      id: (schedule.metadata as any)?.id || schedule.id,
      ...body,
      createdAt: schedule.createdAt
    });

    const rateLimitHeaders = getRateLimitHeaders(rateLimitKey, 100, 3600);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

// PUT - Update schedule
export async function PUT(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'lighting:control');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const scheduleId = req.nextUrl.searchParams.get('id');
    if (!scheduleId) {
      return handleApiError(new Error('Schedule ID required'), req.nextUrl.pathname);
    }

    const rateLimitKey = `lighting-schedules-update:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 100, 3600);
    }

    const body = await validateRequestBody(req, lightingScheduleSchema.partial());

    // Find existing schedule
    const existingSchedule = await prisma.usageRecord.findFirst({
      where: {
        userId: user.id,
        feature: 'lighting-schedule',
        action: 'create-schedule',
        metadata: {
          path: ['id'],
          equals: scheduleId
        }
      }
    });

    if (!existingSchedule) {
      return handleApiError(new Error('Schedule not found'), req.nextUrl.pathname);
    }

    // Update schedule
    const updatedMetadata = {
      ...(existingSchedule.metadata as Record<string, any>),
      ...body,
      updatedAt: new Date().toISOString()
    };

    await prisma.usageRecord.update({
      where: { id: existingSchedule.id },
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

// DELETE - Delete schedule
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'lighting:control');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const scheduleId = req.nextUrl.searchParams.get('id');
    if (!scheduleId) {
      return handleApiError(new Error('Schedule ID required'), req.nextUrl.pathname);
    }

    const rateLimitKey = `lighting-schedules-delete:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 100, 3600);
    }

    // Find and delete schedule
    const schedule = await prisma.usageRecord.findFirst({
      where: {
        userId: user.id,
        feature: 'lighting-schedule',
        action: 'create-schedule',
        metadata: {
          path: ['id'],
          equals: scheduleId
        }
      }
    });

    if (!schedule) {
      return handleApiError(new Error('Schedule not found'), req.nextUrl.pathname);
    }

    await prisma.usageRecord.delete({
      where: { id: schedule.id }
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

