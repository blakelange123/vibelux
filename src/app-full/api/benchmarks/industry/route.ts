import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const metricType = searchParams.get('metricType') || 'yield_per_sqft';
    const cropType = searchParams.get('cropType') || 'Cannabis';
    const facilityType = searchParams.get('facilityType') || 'all';
    const region = searchParams.get('region') || 'all';

    // Check if user has access to industry benchmarks
    const subscription = await prisma.benchmarkSubscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
    });

    const hasAccess = subscription && ['pro', 'enterprise'].includes(subscription.tier);
    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'Pro subscription required',
          message: 'Industry benchmarks require a Pro or Enterprise subscription',
        },
        { status: 403 }
      );
    }

    // Fetch or calculate industry benchmarks
    let benchmark = await prisma.industryBenchmark.findFirst({
      where: {
        metricType,
        cropType,
        facilityType: facilityType === 'all' ? undefined : facilityType,
        region: region === 'all' ? undefined : region,
        periodStart: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: { lastUpdated: 'desc' },
    });

    // If no recent benchmark, calculate it
    if (!benchmark) {
      benchmark = await calculateIndustryBenchmark(
        metricType,
        cropType,
        facilityType,
        region
      );
    }

    // Get historical trend
    const historicalBenchmarks = await prisma.industryBenchmark.findMany({
      where: {
        metricType,
        cropType,
        facilityType: facilityType === 'all' ? undefined : facilityType,
        region: region === 'all' ? undefined : region,
      },
      orderBy: { periodStart: 'asc' },
      take: 12, // Last 12 periods
    });

    return NextResponse.json({
      current: benchmark,
      historical: historicalBenchmarks,
      metadata: {
        lastUpdated: benchmark?.lastUpdated || new Date(),
        dataPoints: benchmark?.sampleSize || 0,
        confidence: benchmark?.confidence || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching industry benchmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benchmarks' },
      { status: 500 }
    );
  }
}

async function calculateIndustryBenchmark(
  metricType: string,
  cropType: string,
  facilityType: string,
  region: string
) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  // Build facility filter
  const facilityWhere: any = {};
  if (facilityType !== 'all') {
    facilityWhere.type = facilityType;
  }
  if (region !== 'all') {
    facilityWhere.state = region;
  }

  // Fetch relevant data based on metric type
  let dataPoints: number[] = [];

  switch (metricType) {
    case 'yield_per_sqft':
      const yieldData = await prisma.facility.findMany({
        where: facilityWhere,
        include: {
          harvestBatches: {
            where: {
              harvestDate: { gte: startDate, lte: endDate },
              cropType,
            },
            include: {
              harvests: true,
            },
          },
        },
      });

      dataPoints = yieldData
        .filter(f => f.size && f.harvestBatches.length > 0)
        .map(f => {
          const totalYield = f.harvestBatches.reduce((sum, batch) => 
            sum + batch.harvests.reduce((hSum, h) => hSum + h.weight, 0), 0
          );
          return totalYield / f.size!;
        });
      break;

    case 'energy_per_gram':
      // Fetch energy usage data
      const energyData = await prisma.sensorReading.findMany({
        where: {
          sensorType: 'energy_meter',
          timestamp: { gte: startDate, lte: endDate },
          facility: facilityWhere,
        },
        include: {
          facility: {
            include: {
              harvestBatches: {
                where: {
                  harvestDate: { gte: startDate, lte: endDate },
                  cropType,
                },
                include: {
                  harvests: true,
                },
              },
            },
          },
        },
      });

      // Group by facility and calculate energy per gram
      const facilityEnergy = new Map<string, { energy: number; yield: number }>();
      
      energyData.forEach(reading => {
        const facilityId = reading.facilityId;
        if (!facilityEnergy.has(facilityId)) {
          facilityEnergy.set(facilityId, { energy: 0, yield: 0 });
        }
        const data = facilityEnergy.get(facilityId)!;
        data.energy += reading.value;
        
        // Add yield if not already counted
        if (data.yield === 0) {
          data.yield = reading.facility.harvestBatches.reduce((sum, batch) => 
            sum + batch.harvests.reduce((hSum, h) => hSum + h.weight, 0), 0
          ) * 453.592; // Convert to grams
        }
      });

      dataPoints = Array.from(facilityEnergy.values())
        .filter(d => d.yield > 0)
        .map(d => d.energy / d.yield);
      break;

    case 'revenue_per_sqft':
      const revenueData = await prisma.facility.findMany({
        where: facilityWhere,
        include: {
          marketData: {
            where: {
              saleDate: { gte: startDate, lte: endDate },
              cropType,
            },
          },
        },
      });

      dataPoints = revenueData
        .filter(f => f.size && f.marketData.length > 0)
        .map(f => {
          const totalRevenue = f.marketData.reduce((sum, m) => sum + m.totalRevenue, 0);
          return totalRevenue / f.size!;
        });
      break;
  }

  // Calculate statistics
  if (dataPoints.length === 0) {
    return null;
  }

  dataPoints.sort((a, b) => a - b);
  
  const average = dataPoints.reduce((sum, val) => sum + val, 0) / dataPoints.length;
  const median = dataPoints[Math.floor(dataPoints.length / 2)];
  const percentile25 = dataPoints[Math.floor(dataPoints.length * 0.25)];
  const percentile75 = dataPoints[Math.floor(dataPoints.length * 0.75)];
  const percentile90 = dataPoints[Math.floor(dataPoints.length * 0.90)];
  
  const variance = dataPoints.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / dataPoints.length;
  const standardDev = Math.sqrt(variance);

  // Calculate confidence based on sample size
  const confidence = Math.min(dataPoints.length / 100, 1); // 100 samples = 100% confidence

  // Save to database
  const benchmark = await prisma.industryBenchmark.create({
    data: {
      metricType,
      cropType,
      facilityType: facilityType === 'all' ? 'all' : facilityType,
      region: region === 'all' ? null : region,
      sampleSize: dataPoints.length,
      average,
      median,
      percentile25,
      percentile75,
      percentile90,
      standardDev,
      periodStart: startDate,
      periodEnd: endDate,
      confidence,
    },
  });

  return benchmark;
}