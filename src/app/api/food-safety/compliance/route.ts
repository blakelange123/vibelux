import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FoodSafetyComplianceService } from '@/lib/food-safety/compliance-service';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const facilityId = searchParams.get('facilityId');
    const action = searchParams.get('action');

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID required' }, { status: 400 });
    }

    const complianceService = new FoodSafetyComplianceService();

    switch (action) {
      case 'dashboard':
        const dashboardData = await complianceService.getComplianceDashboard(facilityId);
        return NextResponse.json(dashboardData);

      case 'monitor-ccps':
        const ccpStatus = await complianceService.monitorCCPs(facilityId);
        return NextResponse.json(ccpStatus);

      case 'profiles':
        const profiles = await prisma.complianceProfile.findMany({
          where: { facilityId },
          include: {
            requirements: true,
            certifications: true
          }
        });
        return NextResponse.json(profiles);

      case 'haccp':
        const haccp = await prisma.haccpPlan.findFirst({
          where: {
            facilityId,
            status: 'approved'
          },
          include: {
            hazardAnalysis: true,
            criticalControlPoints: true,
            monitoringProcedures: true,
            correctiveActions: true,
            verificationActivities: true
          },
          orderBy: {
            effectiveDate: 'desc'
          }
        });
        return NextResponse.json(haccp);

      case 'alerts':
        const alerts = await prisma.complianceAlert.findMany({
          where: {
            facilityId,
            resolvedAt: null
          },
          orderBy: [
            { severity: 'asc' },
            { createdAt: 'desc' }
          ]
        });
        return NextResponse.json(alerts);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Food safety compliance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, facilityId, data } = body;

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID required' }, { status: 400 });
    }

    const complianceService = new FoodSafetyComplianceService();

    switch (action) {
      case 'create-profile':
        const profile = await complianceService.createComplianceProfile(
          facilityId,
          data.buyerType,
          data.customRequirements
        );
        return NextResponse.json(profile);

      case 'create-haccp':
        const haccp = await complianceService.createHACCPPlan(
          facilityId,
          data
        );
        return NextResponse.json(haccp);

      case 'mock-recall':
        const recallResult = await complianceService.performMockRecall(
          facilityId,
          data
        );
        return NextResponse.json(recallResult);

      case 'acknowledge-alert':
        await prisma.complianceAlert.update({
          where: { id: data.alertId },
          data: { acknowledgedAt: new Date() }
        });
        return NextResponse.json({ success: true });

      case 'resolve-alert':
        await prisma.complianceAlert.update({
          where: { id: data.alertId },
          data: { 
            resolvedAt: new Date(),
            resolutionNotes: data.notes
          }
        });
        return NextResponse.json({ success: true });

      case 'update-certification':
        await prisma.certification.upsert({
          where: {
            facilityId_type: {
              facilityId,
              type: data.type
            }
          },
          update: {
            certificateNumber: data.certificateNumber,
            issueDate: new Date(data.issueDate),
            expiryDate: new Date(data.expiryDate),
            certifyingBody: data.certifyingBody,
            documentUrl: data.documentUrl,
            status: data.status || 'valid'
          },
          create: {
            facilityId,
            type: data.type,
            subType: data.subType,
            certificateNumber: data.certificateNumber,
            issueDate: new Date(data.issueDate),
            expiryDate: new Date(data.expiryDate),
            certifyingBody: data.certifyingBody,
            documentUrl: data.documentUrl,
            status: data.status || 'valid'
          }
        });
        return NextResponse.json({ success: true });

      case 'record-ccp-monitoring':
        await prisma.ccpMonitoringRecord.create({
          data: {
            facilityId,
            ccpId: data.ccpId,
            value: data.value,
            withinLimit: data.withinLimit,
            recordedBy: data.recordedBy || userId,
            recordedAt: new Date(),
            notes: data.notes
          }
        });
        return NextResponse.json({ success: true });

      case 'generate-report':
        const report = await complianceService.generateComplianceReport(
          facilityId,
          data.buyerType,
          data.reportType
        );
        
        // Return report as downloadable file
        return new NextResponse(report, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="compliance-report-${new Date().toISOString().split('T')[0]}.pdf"`
          }
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Food safety compliance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, facilityId, data } = body;

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID required' }, { status: 400 });
    }

    switch (action) {
      case 'update-requirement-status':
        await prisma.complianceRequirement.update({
          where: { id: data.requirementId },
          data: {
            currentStatus: data.status,
            lastVerified: new Date(),
            evidence: data.evidence ? {
              create: data.evidence
            } : undefined
          }
        });
        return NextResponse.json({ success: true });

      case 'update-haccp-status':
        await prisma.haccpPlan.update({
          where: { id: data.haccpId },
          data: { status: data.status }
        });
        return NextResponse.json({ success: true });

      case 'update-ccp-limits':
        await prisma.criticalControlPoint.update({
          where: { id: data.ccpId },
          data: {
            criticalLimit: data.criticalLimit,
            monitoringFrequency: data.monitoringFrequency
          }
        });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Food safety compliance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// WebSocket endpoint for real-time monitoring
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { facilityId } = body;

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID required' }, { status: 400 });
    }

    const complianceService = new FoodSafetyComplianceService();
    
    // Run compliance monitoring
    await complianceService.runComplianceMonitoring(facilityId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Compliance monitoring error:', error);
    return NextResponse.json(
      { error: 'Monitoring failed' },
      { status: 500 }
    );
  }
}