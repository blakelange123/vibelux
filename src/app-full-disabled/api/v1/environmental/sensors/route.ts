import { NextRequest } from 'next/server';
import { validateApiKey, checkRateLimit } from '../../_middleware/auth';
import { handleApiError, successResponse } from '../../_middleware/error-handler';
import { rateLimitResponse, getRateLimitHeaders } from '../../_middleware/rate-limit';
import { validateRequestBody, validateQueryParams, sensorDataSchema, environmentalQuerySchema } from '../../_middleware/validation';
import { prisma } from '@/lib/prisma';

// GET - Retrieve sensor data
export async function GET(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'environmental:read');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const rateLimitKey = `environmental-sensors:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 2000, 3600);
    }

    const params = validateQueryParams(req.nextUrl.searchParams, environmentalQuerySchema);

    // Build query filters
    const where: any = {
      userId: user.id,
      feature: 'sensor-data'
    };

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    if (params.sensorTypes && params.sensorTypes.length > 0) {
      where.metadata = {
        path: ['type'],
        in: params.sensorTypes
      };
    }

    // Fetch sensor data
    const sensorData = await prisma.usageRecord.findMany({
      where,
      orderBy: { createdAt: params.sortOrder },
      skip: ((params.page ?? 1) - 1) * (params.limit ?? 20),
      take: params.limit ?? 20
    });

    const total = await prisma.usageRecord.count({ where });

    // Process and aggregate data if requested
    let processedData = sensorData.map(record => ({
      id: record.id,
      ...(record.metadata as any),
      timestamp: record.createdAt
    }));

    if (params.includeStats && processedData.length > 0) {
      // Group by sensor type
      const stats: Record<string, any> = {};
      
      params.sensorTypes?.forEach(type => {
        const typeData = processedData
          .filter(d => d['type' as keyof typeof d] === type)
          .map(d => d['value' as keyof typeof d] as number);
        
        if (typeData.length > 0) {
          stats[type] = {
            count: typeData.length,
            average: typeData.reduce((a, b) => a + b, 0) / typeData.length,
            min: Math.min(...typeData),
            max: Math.max(...typeData),
            latest: typeData[typeData.length - 1]
          };
        }
      });

      processedData = {
        data: processedData,
        statistics: stats
      } as any;
    }

    const response = successResponse(
      processedData,
      {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        total,
        hasMore: (params.page ?? 1) * (params.limit ?? 20) < total
      }
    );

    const rateLimitHeaders = getRateLimitHeaders(rateLimitKey, 2000, 3600);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

// POST - Submit sensor data
export async function POST(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'environmental:write');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const rateLimitKey = `environmental-sensors-write:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 1000, 3600);
    }

    const body = await validateRequestBody(req, sensorDataSchema);

    // Store sensor data
    const sensorRecord = await prisma.usageRecord.create({
      data: {
        userId: user.id,
        feature: 'sensor-data',
        action: 'record',
        metadata: {
          ...body,
          timestamp: body.timestamp || new Date().toISOString()
        }
      }
    });

    // Check for threshold violations
    const thresholds = {
      temperature: { min: 18, max: 28 },
      humidity: { min: 40, max: 70 },
      co2: { min: 400, max: 1500 },
      ph: { min: 5.5, max: 6.5 },
      ec: { min: 1.0, max: 3.0 }
    };

    const threshold = thresholds[body.type as keyof typeof thresholds];
    if (threshold && (body.value < threshold.min || body.value > threshold.max)) {
      // Create alert
      await prisma.usageRecord.create({
        data: {
          userId: user.id,
          feature: 'alert',
          action: 'threshold-violation',
          metadata: {
            sensorId: body.sensorId,
            type: body.type,
            value: body.value,
            threshold,
            timestamp: new Date().toISOString()
          }
        }
      });
    }

    const response = successResponse({
      id: sensorRecord.id,
      accepted: true,
      timestamp: sensorRecord.createdAt
    });

    const rateLimitHeaders = getRateLimitHeaders(rateLimitKey, 1000, 3600);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

