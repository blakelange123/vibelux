import { NextRequest } from 'next/server';
import { validateApiKey, checkRateLimit } from '../../_middleware/auth';
import { handleApiError, successResponse } from '../../_middleware/error-handler';
import { rateLimitResponse, getRateLimitHeaders } from '../../_middleware/rate-limit';
import { validateQueryParams, dateRangeSchema } from '../../_middleware/validation';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = dateRangeSchema.extend({
  metrics: z.array(z.enum(['temperature', 'humidity', 'co2', 'vpd', 'dli'])).optional(),
  interval: z.enum(['hour', 'day', 'week', 'month']).default('day')
});

export async function GET(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'environmental:read');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const rateLimitKey = `environmental-metrics:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 1000, 3600);
    }

    const params = validateQueryParams(req.nextUrl.searchParams, querySchema);

    // Default date range if not provided
    const endDate = params.endDate ? new Date(params.endDate) : new Date();
    const startDate = params.startDate 
      ? new Date(params.startDate)
      : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Fetch sensor data
    const sensorData = await prisma.usageRecord.findMany({
      where: {
        userId: user.id,
        feature: 'sensor-data',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Process metrics
    const metricsToCalculate = params.metrics || ['temperature', 'humidity', 'co2', 'vpd', 'dli'];
    const aggregatedMetrics: Record<string, any> = {};

    metricsToCalculate.forEach(metric => {
      const metricData = sensorData
        .filter(d => d.metadata && (d.metadata as any).type === metric)
        .map(d => ({
          value: (d.metadata as any).value as number,
          timestamp: d.createdAt
        }));

      if (metricData.length === 0) {
        aggregatedMetrics[metric] = {
          current: null,
          average: null,
          min: null,
          max: null,
          data: []
        };
        return;
      }

      // Calculate statistics
      const values = metricData.map(d => d.value);
      const average = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const current = values[values.length - 1];

      // Aggregate by interval
      const aggregatedData = aggregateByInterval(metricData, params.interval || '1h');

      aggregatedMetrics[metric] = {
        current: Math.round(current * 10) / 10,
        average: Math.round(average * 10) / 10,
        min: Math.round(min * 10) / 10,
        max: Math.round(max * 10) / 10,
        data: aggregatedData,
        unit: getUnitForMetric(metric)
      };
    });

    // Calculate VPD if temperature and humidity are available
    if (metricsToCalculate.includes('vpd') && !aggregatedMetrics.vpd.current) {
      const tempData = aggregatedMetrics.temperature;
      const humidityData = aggregatedMetrics.humidity;
      
      if (tempData?.current && humidityData?.current) {
        const vpd = calculateVPD(tempData.current, humidityData.current);
        aggregatedMetrics.vpd = {
          current: vpd,
          average: vpd,
          min: vpd,
          max: vpd,
          data: [{ timestamp: new Date(), value: vpd }],
          unit: 'kPa'
        };
      }
    }

    const response = successResponse({
      metrics: aggregatedMetrics,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      interval: params.interval
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

// Helper functions
function aggregateByInterval(
  data: { value: number; timestamp: Date }[],
  interval: string
): { timestamp: string; value: number }[] {
  const grouped: Record<string, number[]> = {};

  data.forEach(item => {
    const key = getIntervalKey(item.timestamp, interval);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item.value);
  });

  return Object.entries(grouped).map(([key, values]) => ({
    timestamp: key,
    value: Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10
  }));
}

function getIntervalKey(date: Date, interval: string): string {
  switch (interval) {
    case 'hour':
      return date.toISOString().substring(0, 13) + ':00:00.000Z';
    case 'day':
      return date.toISOString().substring(0, 10) + 'T00:00:00.000Z';
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().substring(0, 10) + 'T00:00:00.000Z';
    case 'month':
      return date.toISOString().substring(0, 7) + '-01T00:00:00.000Z';
    default:
      return date.toISOString();
  }
}

function getUnitForMetric(metric: string): string {
  const units: Record<string, string> = {
    temperature: '°C',
    humidity: '%',
    co2: 'ppm',
    vpd: 'kPa',
    dli: 'mol/m²/day',
    ph: '',
    ec: 'mS/cm'
  };
  return units[metric] || '';
}

function calculateVPD(temp: number, humidity: number): number {
  // Tetens equation for saturation vapor pressure
  const svp = 0.61078 * Math.exp((17.269 * temp) / (temp + 237.3));
  const avp = (humidity / 100) * svp;
  const vpd = svp - avp;
  return Math.round(vpd * 100) / 100;
}
