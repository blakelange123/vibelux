import { NextRequest } from 'next/server';
import { validateApiKey, checkRateLimit } from '../../_middleware/auth';
import { handleApiError, successResponse } from '../../_middleware/error-handler';
import { rateLimitResponse, getRateLimitHeaders } from '../../_middleware/rate-limit';
import { validateQueryParams, paginationSchema, dateRangeSchema } from '../../_middleware/validation';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = paginationSchema.merge(dateRangeSchema).extend({
  category: z.enum(['water', 'pesticide', 'fertilizer', 'harvest', 'storage', 'all']).default('all'),
  includeDocuments: z.coerce.boolean().default(false)
});

export async function GET(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'compliance:read');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const rateLimitKey = `audit-trail:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 1000, 3600);
    }

    const params = validateQueryParams(req.nextUrl.searchParams, querySchema);

    // Build query
    const where: any = {
      userId: user.id,
      feature: 'globalgap-compliance'
    };

    if (params.category !== 'all') {
      where.action = `check-${params.category}`;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    // Fetch audit records
    const [records, total] = await Promise.all([
      prisma.usageRecord.findMany({
        where,
        orderBy: { createdAt: params.sortOrder },
        skip: ((params.page ?? 1) - 1) * (params.limit ?? 20),
        take: params.limit ?? 20
      }),
      prisma.usageRecord.count({ where })
    ]);

    // Process records
    const auditTrail = records.map(record => {
      const metadata = record.metadata as any;
      return {
        id: record.id,
        timestamp: record.createdAt,
        category: record.action.replace('check-', ''),
        checkType: metadata.checkType,
        result: metadata.result,
        data: params.includeDocuments ? metadata.data : undefined,
        operator: user.email, // In production, track actual operator
        signature: generateDigitalSignature(record) // Simulated digital signature
      };
    });

    // Generate summary statistics
    const summary = {
      totalChecks: total,
      compliantChecks: auditTrail.filter(r => r.result?.compliant === true).length,
      categories: [...new Set(auditTrail.map(r => r.category))],
      lastCheck: auditTrail[0]?.timestamp || null
    };

    const response = successResponse(
      {
        auditTrail,
        summary
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

// Helper function to generate digital signature (simulated)
function generateDigitalSignature(record: any): string {
  // In production, use proper cryptographic signing
  const crypto = require('crypto');
  const data = JSON.stringify({
    id: record.id,
    timestamp: record.createdAt,
    metadata: record.metadata
  });
  
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
    .substring(0, 16);
}

