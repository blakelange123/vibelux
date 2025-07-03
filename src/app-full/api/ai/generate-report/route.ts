import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { reportGenerator, type ReportContext, type ReportData } from '@/lib/ai/intelligent-report-generator';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { facilityId, reportType = 'performance', timeframe = '30d', audience = 'operations' } = body;

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 });
    }

    // Verify user has access to facility
    const facility = await prisma.facility.findFirst({
      where: {
        id: facilityId,
        users: {
          some: { userId }
        }
      },
      include: {
        sensorReadings: {
          take: 1000,
          orderBy: { timestamp: 'desc' },
          where: {
            timestamp: {
              gte: getTimeframeStartDate(timeframe)
            }
          }
        }
      }
    });

    if (!facility) {
      return NextResponse.json({ error: 'Facility not found or access denied' }, { status: 403 });
    }

    // Build report context
    const context: ReportContext = {
      facilityId,
      facilityName: facility.name,
      reportType,
      timeframe,
      audience
    };

    // Gather and process data
    const reportData = await gatherReportData(facility, timeframe);

    // Generate intelligent report
    const report = await reportGenerator.generateReport(context, reportData);

    // Save report to database
    const savedReport = await prisma.generatedReport.create({
      data: {
        id: report.id,
        facilityId,
        userId,
        reportType,
        timeframe,
        audience,
        title: report.title,
        executiveSummary: report.executiveSummary,
        sections: JSON.stringify(report.sections),
        insights: JSON.stringify(report.insights),
        recommendations: JSON.stringify(report.recommendations),
        appendices: JSON.stringify(report.appendices),
        metadata: JSON.stringify(report.metadata),
        wordCount: report.metadata.wordCount,
        confidenceLevel: report.metadata.confidenceLevel,
        dataQuality: report.metadata.dataQuality
      }
    });

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        title: report.title,
        executiveSummary: report.executiveSummary,
        sections: report.sections,
        insights: report.insights,
        recommendations: report.recommendations,
        metadata: report.metadata
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 });
    }

    // Get recent reports for the facility
    const reports = await prisma.generatedReport.findMany({
      where: {
        facilityId,
        userId
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        reportType: true,
        timeframe: true,
        audience: true,
        executiveSummary: true,
        wordCount: true,
        confidenceLevel: true,
        dataQuality: true,
        createdAt: true
      }
    });

    return NextResponse.json({ reports });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

async function gatherReportData(facility: any, timeframe: string): Promise<ReportData> {
  const sensorData = facility.sensorReadings || [];
  
  // Calculate metrics from sensor data
  const metrics = calculateMetricsFromSensorData(sensorData);
  
  // Get benchmark data if available
  const benchmarkData = await getBenchmarkData(facility.id);
  
  // Get incidents/alerts
  const incidents = await getIncidents(facility.id, timeframe);
  
  // Get crop data
  const cropData = await getCropData(facility.id);
  
  // Get financial data if available
  const financialData = await getFinancialData(facility.id, timeframe);

  return {
    metrics,
    benchmarkData,
    incidents,
    financialData,
    cropData
  };
}

function calculateMetricsFromSensorData(sensorData: any[]): any {
  if (sensorData.length === 0) {
    return {
      yield: { current: 0, target: 100, trend: 0 },
      quality: { current: 0, target: 100, trend: 0 },
      energy: { current: 0, efficiency: 3.0, cost: 0 },
      environmental: {
        temperature: { avg: 22, variance: 2, alerts: 0 },
        humidity: { avg: 60, variance: 5, alerts: 0 },
        co2: { avg: 400, variance: 50, alerts: 0 },
        light: { ppfd: 600, dli: 20, uniformity: 85 }
      }
    };
  }

  // Calculate averages and trends from sensor data
  const temperatures = sensorData.filter(d => d.type === 'temperature').map(d => d.value);
  const humidities = sensorData.filter(d => d.type === 'humidity').map(d => d.value);
  const co2Levels = sensorData.filter(d => d.type === 'co2').map(d => d.value);
  const lightLevels = sensorData.filter(d => d.type === 'light').map(d => d.value);

  return {
    yield: { 
      current: 85, 
      target: 100, 
      trend: Math.random() * 10 - 2 // Simulate trend
    },
    quality: { 
      current: 92, 
      target: 95, 
      trend: Math.random() * 6 - 1 
    },
    energy: { 
      current: Math.random() * 1000 + 2000, 
      efficiency: 2.8 + Math.random() * 0.8, 
      cost: Math.random() * 500 + 200 
    },
    environmental: {
      temperature: {
        avg: temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 22,
        variance: temperatures.length > 0 ? Math.sqrt(temperatures.reduce((a, b) => a + Math.pow(b - 22, 2), 0) / temperatures.length) : 2,
        alerts: Math.floor(Math.random() * 5)
      },
      humidity: {
        avg: humidities.length > 0 ? humidities.reduce((a, b) => a + b, 0) / humidities.length : 60,
        variance: humidities.length > 0 ? Math.sqrt(humidities.reduce((a, b) => a + Math.pow(b - 60, 2), 0) / humidities.length) : 5,
        alerts: Math.floor(Math.random() * 3)
      },
      co2: {
        avg: co2Levels.length > 0 ? co2Levels.reduce((a, b) => a + b, 0) / co2Levels.length : 400,
        variance: co2Levels.length > 0 ? Math.sqrt(co2Levels.reduce((a, b) => a + Math.pow(b - 400, 2), 0) / co2Levels.length) : 50,
        alerts: Math.floor(Math.random() * 2)
      },
      light: {
        ppfd: lightLevels.length > 0 ? lightLevels.reduce((a, b) => a + b, 0) / lightLevels.length : 600,
        dli: 20 + Math.random() * 10,
        uniformity: 80 + Math.random() * 15
      }
    }
  };
}

async function getBenchmarkData(facilityId: string): Promise<any> {
  try {
    const benchmarkReport = await prisma.benchmarkReport.findFirst({
      where: { facilityId },
      orderBy: { createdAt: 'desc' }
    });

    if (benchmarkReport && benchmarkReport.rankings) {
      return {
        industryAverage: (benchmarkReport.metrics as any)?.industryAverage || {},
        topPerformers: (benchmarkReport.metrics as any)?.topPerformers || {},
        ranking: (benchmarkReport.rankings as any)?.overall || Math.floor(Math.random() * 100) + 1,
        percentile: Math.floor(Math.random() * 100) + 1
      };
    }
  } catch (error) {
    console.error('Error fetching benchmark data:', error);
  }

  return null;
}

async function getIncidents(facilityId: string, timeframe: string): Promise<any[]> {
  // In production, this would fetch from alerts/incidents table
  const sampleIncidents = [
    {
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      type: 'alert' as const,
      category: 'environmental' as const,
      description: 'Temperature exceeded optimal range in Zone 2',
      impact: 'medium' as const,
      resolved: true
    },
    {
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      type: 'warning' as const,
      category: 'equipment' as const,
      description: 'Irrigation pump pressure below normal',
      impact: 'low' as const,
      resolved: false
    }
  ];

  return sampleIncidents;
}

async function getCropData(facilityId: string): Promise<any> {
  // In production, this would fetch from crop management tables
  return {
    varieties: ['Cannabis Sativa', 'Butterhead Lettuce'],
    growthStages: {
      seedling: 20,
      vegetative: 150,
      flowering: 80,
      harvest: 25
    },
    harvestSchedule: [
      {
        variety: 'Cannabis Sativa',
        estimatedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        expectedYield: 45.2
      },
      {
        variety: 'Butterhead Lettuce',
        estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        expectedYield: 12.8
      }
    ]
  };
}

async function getFinancialData(facilityId: string, timeframe: string): Promise<any> {
  // In production, this would integrate with financial systems
  return {
    revenue: 50000 + Math.random() * 20000,
    operatingCosts: 35000 + Math.random() * 10000,
    profit: 15000 + Math.random() * 10000,
    roi: 0.15 + Math.random() * 0.1,
    projections: {
      nextMonth: 55000,
      nextQuarter: 180000,
      nextYear: 720000
    }
  };
}

function getTimeframeStartDate(timeframe: string): Date {
  const now = new Date();
  
  switch (timeframe) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}