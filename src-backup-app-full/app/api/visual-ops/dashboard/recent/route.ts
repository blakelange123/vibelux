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
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 });
    }

    // Fetch recent reports from all tables and combine them
    const [photoReports, qualityReports, inventoryReports, maintenanceReports] = await Promise.all([
      prisma.photoReport.findMany({
        where: { facilityId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          title: true,
          category: true,
          roomZone: true,
          status: true,
          priority: true,
          reportedBy: true,
          createdAt: true,
          aiAnalysis: true,
          description: true
        }
      }),
      prisma.qualityReport.findMany({
        where: { facilityId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          issueType: true,
          roomZone: true,
          status: true,
          severity: true,
          reportedBy: true,
          createdAt: true,
          aiAnalysis: true,
          description: true
        }
      }),
      prisma.inventoryReport.findMany({
        where: { facilityId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          reportType: true,
          roomZone: true,
          status: true,
          priority: true,
          reportedBy: true,
          createdAt: true,
          aiAnalysis: true,
          description: true
        }
      }),
      // Get maintenance reports from equipment photos table if it exists
      prisma.$queryRaw`
        SELECT id, 'Equipment Issue' as title, equipment_type, room_zone, status, priority, 
               user_id as reported_by, timestamp as created_at, ai_analysis, description
        FROM equipment_photos 
        WHERE facility_id = ${facilityId}
        ORDER BY timestamp DESC 
        LIMIT ${limit}
      `.catch(() => []) // Fallback if table doesn't exist
    ]);

    // Transform and combine all reports into unified format
    const combinedReports = [
      // Photo Reports
      ...photoReports.map(report => ({
        id: report.id,
        type: report.category as string,
        title: report.title,
        roomZone: report.roomZone,
        severity: report.priority,
        status: report.status,
        reportedBy: report.reportedBy,
        timestamp: new Date(report.createdAt),
        aiConfidence: extractAIConfidence(report.aiAnalysis),
        estimatedCost: extractEstimatedCost(report.aiAnalysis),
        description: report.description
      })),
      
      // Quality Reports
      ...qualityReports.map(report => ({
        id: report.id,
        type: 'quality' as const,
        title: `Quality: ${report.issueType.replace('_', ' ')}`,
        roomZone: report.roomZone,
        severity: report.severity,
        status: report.status,
        reportedBy: report.reportedBy,
        timestamp: new Date(report.createdAt),
        aiConfidence: extractAIConfidence(report.aiAnalysis),
        estimatedCost: extractEstimatedCost(report.aiAnalysis),
        description: report.description
      })),
      
      // Inventory Reports
      ...inventoryReports.map(report => ({
        id: report.id,
        type: 'inventory' as const,
        title: `Inventory: ${report.reportType.replace('_', ' ')}`,
        roomZone: report.roomZone,
        severity: report.priority,
        status: report.status,
        reportedBy: report.reportedBy,
        timestamp: new Date(report.createdAt),
        aiConfidence: extractAIConfidence(report.aiAnalysis),
        estimatedCost: extractEstimatedCost(report.aiAnalysis),
        description: report.description
      })),
      
      // Maintenance Reports (if any)
      ...(Array.isArray(maintenanceReports) ? maintenanceReports.map((report: any) => ({
        id: report.id,
        type: 'maintenance' as const,
        title: report.title || `${report.equipment_type} Issue`,
        roomZone: report.room_zone,
        severity: report.priority,
        status: report.status,
        reportedBy: report.reported_by,
        timestamp: new Date(report.created_at),
        aiConfidence: extractAIConfidence(report.ai_analysis),
        estimatedCost: extractEstimatedCost(report.ai_analysis),
        description: report.description
      })) : [])
    ];

    // Sort by timestamp and limit results
    const recentReports = combinedReports
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return NextResponse.json(recentReports);

  } catch (error) {
    console.error('Failed to fetch recent reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent reports' },
      { status: 500 }
    );
  }
}

// Helper functions to extract data from AI analysis JSON
function extractAIConfidence(aiAnalysis: string | null): number | undefined {
  if (!aiAnalysis) return undefined;
  
  try {
    const analysis = JSON.parse(aiAnalysis);
    return analysis.confidence || analysis.aiConfidence;
  } catch {
    return undefined;
  }
}

function extractEstimatedCost(aiAnalysis: string | null): number | undefined {
  if (!aiAnalysis) return undefined;
  
  try {
    const analysis = JSON.parse(aiAnalysis);
    return analysis.estimatedCost?.max || analysis.estimatedCost || analysis.cost;
  } catch {
    return undefined;
  }
}