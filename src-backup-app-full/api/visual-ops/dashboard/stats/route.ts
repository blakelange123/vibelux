import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const timeframe = searchParams.get('timeframe') || '24h';

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 });
    }

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get total reports across all types
    const [photoReports, qualityReports, inventoryReports, taskCompletions] = await Promise.all([
      prisma.photoReport.count({
        where: {
          facilityId,
          createdAt: { gte: startDate }
        }
      }),
      prisma.qualityReport.count({
        where: {
          facilityId,
          createdAt: { gte: startDate }
        }
      }),
      prisma.inventoryReport.count({
        where: {
          facilityId,
          createdAt: { gte: startDate }
        }
      }),
      prisma.taskCompletion.count({
        where: {
          facilityId,
          completedAt: { gte: startDate }
        }
      })
    ]);

    const totalReports = photoReports + qualityReports + inventoryReports + taskCompletions;

    // Get critical issues
    const [criticalQuality, highPriorityPhoto, highPriorityInventory] = await Promise.all([
      prisma.qualityReport.count({
        where: {
          facilityId,
          severity: { in: ['critical', 'high'] },
          status: { not: 'resolved' },
          createdAt: { gte: startDate }
        }
      }),
      prisma.photoReport.count({
        where: {
          facilityId,
          priority: { in: ['critical', 'high'] },
          status: { not: 'resolved' },
          createdAt: { gte: startDate }
        }
      }),
      prisma.inventoryReport.count({
        where: {
          facilityId,
          priority: { in: ['critical', 'high'] },
          status: { not: 'resolved' },
          createdAt: { gte: startDate }
        }
      })
    ]);

    const criticalIssues = criticalQuality + highPriorityPhoto + highPriorityInventory;

    // Get completed tasks
    const completedTasks = await prisma.taskCompletion.count({
      where: {
        facilityId,
        status: 'completed',
        completedAt: { gte: startDate }
      }
    });

    // Calculate average response time (mock calculation for now)
    const avgResponseTime = 1.2; // hours - would be calculated from actual data

    // Calculate cost savings (based on early detection preventing larger issues)
    const preventedIssues = Math.floor(totalReports * 0.3); // 30% prevention rate
    const avgCostPerIssue = 800; // average cost per prevented issue
    const costSavings = preventedIssues * avgCostPerIssue;

    // Get active alerts count
    const activeAlerts = await prisma.photoReport.count({
      where: {
        facilityId,
        status: { in: ['submitted', 'in_review', 'assigned'] },
        priority: { in: ['high', 'critical'] }
      }
    }) + await prisma.qualityReport.count({
      where: {
        facilityId,
        status: { in: ['investigating', 'contained'] },
        severity: { in: ['high', 'critical'] }
      }
    });

    // Get actual breakdown by report type from database
    const reportBreakdown = await prisma.visualOpsReport.groupBy({
      by: ['type'],
      where: {
        facilityId,
        createdAt: { gte: startDate }
      },
      _count: { id: true }
    });
    
    const breakdownMap = reportBreakdown.reduce((acc, item) => {
      acc[item.type] = item._count.id;
      return acc;
    }, {
      pest_disease: 0,
      equipment: 0,
      safety: 0,
      quality: 0,
      inventory: 0,
      environmental: 0,
      other: 0
    });

    // Calculate AI accuracy from actual analysis results
    const aiAnalysisResults = await prisma.aiAnalysisResult.groupBy({
      by: ['analysisType'],
      where: {
        facilityId,
        createdAt: { gte: startDate },
        humanVerified: true
      },
      _avg: { confidence: true },
      _count: { id: true }
    });
    
    const aiAccuracy = {
      pestDetection: aiAnalysisResults.find(r => r.analysisType === 'pest_detection')?._avg.confidence || 0,
      equipmentIssues: aiAnalysisResults.find(r => r.analysisType === 'equipment_issue')?._avg.confidence || 0,
      safetyHazards: aiAnalysisResults.find(r => r.analysisType === 'safety_hazard')?._avg.confidence || 0,
      qualityIssues: aiAnalysisResults.find(r => r.analysisType === 'quality_issue')?._avg.confidence || 0,
      overallAccuracy: aiAnalysisResults.reduce((sum, r) => sum + (r._avg.confidence || 0), 0) / Math.max(aiAnalysisResults.length, 1)
    };

    const stats = {
      totalReports,
      criticalIssues,
      completedTasks,
      avgResponseTime,
      costSavings,
      activeAlerts,
      reportBreakdown: breakdownMap,
      aiAccuracy,
      timeframe,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}