import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET import status and insights
export async function GET(
  request: NextRequest,
  { params }: { params: { importId: string } }
) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const importId = params.importId;

    // Get import with insights
    const dataImport = await prisma.dataImport.findUnique({
      where: { id: importId },
      include: {
        dataInsights: {
          orderBy: { priority: 'desc' }
        },
        _count: {
          select: {
            historicalData: true
          }
        }
      }
    });

    if (!dataImport) {
      return NextResponse.json(
        { error: 'Import not found' },
        { status: 404 }
      );
    }

    // Get summary statistics
    const summary = await prisma.historicalData.aggregate({
      where: { importId },
      _count: true,
      _min: { timestamp: true },
      _max: { timestamp: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        import: {
          id: dataImport.id,
          fileName: dataImport.fileName,
          fileType: dataImport.fileType,
          status: dataImport.status,
          progress: dataImport.progress,
          totalRecords: dataImport.totalRecords,
          processedRecords: dataImport.processedRecords,
          failedRecords: dataImport.failedRecords,
          errors: dataImport.errors,
          warnings: dataImport.warnings,
          createdAt: dataImport.createdAt,
          completedAt: dataImport.completedAt
        },
        insights: dataImport.dataInsights.map(insight => ({
          id: insight.id,
          type: insight.insightType,
          category: insight.category,
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence,
          impact: {
            metric: insight.impactMetric,
            value: insight.impactValue,
            unit: insight.impactUnit
          },
          dataPoints: insight.dataPoints,
          dateRange: {
            start: insight.dateRangeStart,
            end: insight.dateRangeEnd
          },
          recommendations: insight.recommendations,
          priority: insight.priority,
          acknowledged: insight.acknowledged
        })),
        summary: {
          totalDataPoints: summary._count,
          dateRange: {
            start: summary._min.timestamp,
            end: summary._max.timestamp
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching import:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import data' },
      { status: 500 }
    );
  }
}

// PATCH to acknowledge insights
export async function PATCH(
  request: NextRequest,
  { params }: { params: { importId: string } }
) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { insightId, acknowledged, implementedAt, resultNotes } = body;

    if (!insightId) {
      return NextResponse.json(
        { error: 'insightId is required' },
        { status: 400 }
      );
    }

    const insight = await prisma.dataInsight.update({
      where: { id: insightId },
      data: {
        acknowledged,
        implementedAt: implementedAt ? new Date(implementedAt) : null,
        resultNotes
      }
    });

    return NextResponse.json({
      success: true,
      data: insight
    });
  } catch (error) {
    console.error('Error updating insight:', error);
    return NextResponse.json(
      { error: 'Failed to update insight' },
      { status: 500 }
    );
  }
}