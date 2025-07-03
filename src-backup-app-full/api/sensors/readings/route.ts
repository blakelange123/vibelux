import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// POST sensor readings (batch support)
export async function POST(request: NextRequest) {
  try {
    // For IoT devices, use API key authentication
    const apiKey = request.headers.get('x-api-key');
    const user = await auth();
    
    if (!apiKey && !user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { readings, facilityId } = body;

    if (!readings || !Array.isArray(readings) || !facilityId) {
      return NextResponse.json(
        { error: 'Invalid request. Expected: { facilityId, readings: [...] }' },
        { status: 400 }
      );
    }

    // Validate facility exists
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId }
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Process readings
    const sensorReadings = readings.map((reading: any) => ({
      facilityId,
      sensorId: reading.sensorId,
      sensorType: reading.sensorType,
      zone: reading.zone || null,
      value: reading.value,
      unit: reading.unit,
      quality: reading.quality || 'good',
      calibrated: reading.calibrated !== false,
      timestamp: reading.timestamp ? new Date(reading.timestamp) : new Date()
    }));

    // Batch insert
    const created = await prisma.sensorReading.createMany({
      data: sensorReadings
    });

    // Trigger data aggregation for ML training (async)
    if (created.count > 0) {
      aggregateSensorData(facilityId);
    }

    return NextResponse.json({
      success: true,
      data: {
        count: created.count,
        message: `Successfully stored ${created.count} sensor readings`
      }
    });
  } catch (error) {
    console.error('Error storing sensor readings:', error);
    return NextResponse.json(
      { error: 'Failed to store sensor readings' },
      { status: 500 }
    );
  }
}

// GET sensor readings with aggregation
export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const sensorType = searchParams.get('sensorType');
    const zone = searchParams.get('zone');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const aggregation = searchParams.get('aggregation') || 'raw'; // raw, hourly, daily

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    const where: any = { facilityId };
    if (sensorType) where.sensorType = sensorType;
    if (zone) where.zone = zone;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    if (aggregation === 'raw') {
      const readings = await prisma.sensorReading.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 1000 // Limit raw data
      });

      return NextResponse.json({
        success: true,
        data: readings
      });
    }

    // Aggregate data
    const aggregatedData = await aggregateReadings(where, aggregation);

    return NextResponse.json({
      success: true,
      data: aggregatedData
    });
  } catch (error) {
    console.error('Error fetching sensor readings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensor readings' },
      { status: 500 }
    );
  }
}

// Aggregate sensor readings
async function aggregateReadings(where: any, aggregation: string) {
  // Group by sensor type and time bucket
  const readings = await prisma.sensorReading.findMany({
    where,
    orderBy: { timestamp: 'asc' }
  });

  const aggregated: any = {};
  const bucketSize = aggregation === 'hourly' ? 3600000 : 86400000; // ms

  readings.forEach((reading) => {
    const bucket = Math.floor(reading.timestamp.getTime() / bucketSize) * bucketSize;
    const key = `${reading.sensorType}_${bucket}`;

    if (!aggregated[key]) {
      aggregated[key] = {
        sensorType: reading.sensorType,
        timestamp: new Date(bucket),
        values: [],
        count: 0,
        min: Infinity,
        max: -Infinity,
        sum: 0
      };
    }

    aggregated[key].values.push(reading.value);
    aggregated[key].count++;
    aggregated[key].sum += reading.value;
    aggregated[key].min = Math.min(aggregated[key].min, reading.value);
    aggregated[key].max = Math.max(aggregated[key].max, reading.value);
  });

  // Calculate averages and format results
  return Object.values(aggregated).map((agg: any) => ({
    sensorType: agg.sensorType,
    timestamp: agg.timestamp,
    avg: agg.sum / agg.count,
    min: agg.min,
    max: agg.max,
    count: agg.count,
    stdDev: calculateStdDev(agg.values)
  }));
}

function calculateStdDev(values: number[]): number {
  const avg = values.reduce((a, b) => a + b) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / values.length;
  return Math.sqrt(avgSquareDiff);
}

// Async function to aggregate sensor data for ML training
async function aggregateSensorData(facilityId: string) {
  try {
    // Get latest readings for all sensor types
    const latestReadings = await prisma.$queryRaw`
      SELECT DISTINCT ON (sensor_type) 
        sensor_type, value, unit, timestamp
      FROM sensor_reading
      WHERE facility_id = ${facilityId}
        AND quality = 'good'
        AND timestamp > NOW() - INTERVAL '1 hour'
      ORDER BY sensor_type, timestamp DESC
    `;

    // Check if we have enough data to create a training record
    const readingMap: any = {};
    (latestReadings as any[]).forEach(r => {
      readingMap[r.sensor_type] = r.value;
    });

    // Required sensors for training data
    const requiredSensors = ['temperature', 'humidity', 'ppfd', 'co2'];
    const hasAllRequired = requiredSensors.every(s => readingMap[s] !== undefined);

    if (hasAllRequired) {
      // Calculate derived metrics
      const vpd = calculateVPD(readingMap.temperature, readingMap.humidity);
      const dli = (readingMap.ppfd * 3600 * 16) / 1000000; // 16 hour photoperiod

      // Check if we should create a daily summary
      const lastSummary = await prisma.yieldTrainingData.findFirst({
        where: { 
          facilityId,
          recordedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      if (!lastSummary) {
        // This would be expanded to create actual training records
        // when a growth cycle completes
      }
    }
  } catch (error) {
    console.error('Error aggregating sensor data:', error);
  }
}

function calculateVPD(temp: number, humidity: number): number {
  // Saturated vapor pressure
  const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  // Actual vapor pressure
  const avp = (humidity / 100) * svp;
  // VPD in kPa
  return svp - avp;
}