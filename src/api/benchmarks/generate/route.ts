import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { BenchmarkReportGenerator } from '@/lib/benchmarks/report-generator';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { facilityId, reportType, period } = body;

    // Validate inputs
    if (!facilityId || !reportType || !period) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check user has access to facility
    const userFacility = await prisma.facilityUser.findFirst({
      where: {
        userId,
        facilityId,
      },
    });

    if (!userFacility) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check user's subscription tier
    const subscription = await prisma.benchmarkSubscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
    });

    const hasAccess = checkReportAccess(reportType, subscription?.tier || 'free');
    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'Upgrade required',
          message: `This report requires a ${getRequiredTier(reportType)} subscription`,
          upgradeUrl: '/settings/billing/benchmarks',
        },
        { status: 403 }
      );
    }

    // Calculate date range based on period
    const { startDate, endDate } = calculateDateRange(period);

    // Generate the report
    const generator = new BenchmarkReportGenerator(
      facilityId,
      reportType,
      startDate,
      endDate
    );

    const reportData = await generator.generateReport();

    // Save report to database
    const report = await prisma.benchmarkReport.create({
      data: {
        facilityId,
        reportType,
        period,
        startDate,
        endDate,
        metrics: reportData.facilityMetrics,
        rankings: reportData.rankings,
        comparisons: {
          topPerformers: reportData.comparisons.topPerformers,
          peerGroup: reportData.comparisons.peerGroup,
        },
        accessTier: subscription?.tier || 'free',
        isPublic: false,
      },
    });

    // Track report access
    if (subscription) {
      await prisma.benchmarkSubscription.update({
        where: { id: subscription.id },
        data: {
          reportsAccessed: { increment: 1 },
          lastAccessedAt: new Date(),
        },
      });
    }

    // Apply data anonymization based on tier
    const anonymizedData = anonymizeData(reportData, subscription?.tier || 'free');

    return NextResponse.json({
      reportId: report.id,
      data: anonymizedData,
      generated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating benchmark report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function checkReportAccess(reportType: string, tier: string): boolean {
  const accessMatrix: Record<string, string[]> = {
    'basic': ['yield', 'energy'],
    'pro': ['yield', 'energy', 'financial', 'quality', 'efficiency'],
    'enterprise': ['yield', 'energy', 'financial', 'quality', 'efficiency', 'custom', 'predictive'],
  };

  const allowedReports = accessMatrix[tier] || [];
  return allowedReports.includes(reportType);
}

function getRequiredTier(reportType: string): string {
  if (['yield', 'energy'].includes(reportType)) return 'basic';
  if (['financial', 'quality', 'efficiency'].includes(reportType)) return 'pro';
  return 'enterprise';
}

function calculateDateRange(period: string): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'monthly':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarterly':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 'annual':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case 'ytd':
      startDate.setMonth(0, 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  return { startDate, endDate };
}

function anonymizeData(data: any, tier: string): any {
  const anonymized = { ...data };

  // Basic tier: Heavy anonymization
  if (tier === 'basic' || tier === 'free') {
    // Remove facility names from comparisons
    if (anonymized.comparisons) {
      anonymized.comparisons.topPerformers = anonymized.comparisons.topPerformers.map((f: any) => ({
        ...f,
        facilityName: `Facility ${f.overallRank}`,
        facilityId: undefined,
      }));
      
      anonymized.comparisons.peerGroup = anonymized.comparisons.peerGroup.map((f: any, idx: number) => ({
        ...f,
        facilityName: `Peer ${idx + 1}`,
        facilityId: undefined,
      }));
    }

    // Limit insights and recommendations
    anonymized.insights = anonymized.insights.slice(0, 3);
    anonymized.recommendations = anonymized.recommendations.slice(0, 2);
  }

  // Pro tier: Moderate anonymization
  else if (tier === 'pro') {
    // Partially anonymize facility names
    if (anonymized.comparisons) {
      anonymized.comparisons.topPerformers = anonymized.comparisons.topPerformers.map((f: any) => ({
        ...f,
        facilityName: f.facilityName.substring(0, 3) + '***',
        facilityId: undefined,
      }));
    }
  }

  // Enterprise tier: Full access
  // No anonymization needed

  return anonymized;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const facilityId = searchParams.get('facilityId');
    const reportType = searchParams.get('reportType');

    // Get user's facilities
    const userFacilities = await prisma.facilityUser.findMany({
      where: { userId },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const facilityIds = userFacilities.map(f => f.facilityId);
    
    // Build query
    const where: any = {
      facilityId: { in: facilityIds },
    };

    if (facilityId && facilityIds.includes(facilityId)) {
      where.facilityId = facilityId;
    }

    if (reportType) {
      where.reportType = reportType;
    }

    // Fetch reports
    const reports = await prisma.benchmarkReport.findMany({
      where,
      select: {
        id: true,
        reportType: true,
        period: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        facility: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      reports,
      facilities: userFacilities.map(f => ({
        id: f.facility.id,
        name: f.facility.name,
      })),
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}