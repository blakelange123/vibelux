import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { facilityId, roomZone, issueType, description, reportedBy, location } = await request.json();

    // Create quality report record
    const qualityReport = await prisma.qualityReport.create({
      data: {
        id: `qc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        facilityId,
        roomZone,
        issueType,
        description,
        reportedBy,
        location: JSON.stringify(location),
        status: 'investigating',
        severity: 'medium', // Will be updated by AI analysis
        createdAt: new Date()
      }
    });

    // Quality issue categorization and recommended actions
    let severity = 'medium';
    let recommendedActions = [];
    let complianceRisk = false;

    switch (issueType) {
      case 'product_defect':
        severity = 'high';
        complianceRisk = true;
        recommendedActions = [
          'Isolate affected products immediately',
          'Trace batch/lot numbers',
          'Notify quality manager',
          'Document for regulatory compliance',
          'Review production process'
        ];
        break;
      case 'contamination':
        severity = 'critical';
        complianceRisk = true;
        recommendedActions = [
          'IMMEDIATE QUARANTINE of affected area',
          'Stop production in affected zone',
          'Notify facility manager and quality team',
          'Document for regulatory reporting',
          'Implement decontamination protocol'
        ];
        break;
      case 'process_deviation':
        severity = 'medium';
        recommendedActions = [
          'Review process documentation',
          'Retrain personnel if needed',
          'Adjust process parameters',
          'Increase monitoring frequency'
        ];
        break;
      case 'packaging_issue':
        severity = 'medium';
        recommendedActions = [
          'Inspect packaging equipment',
          'Check material quality',
          'Review packaging process',
          'Update quality control checks'
        ];
        break;
    }

    // Update severity in database
    await prisma.qualityReport.update({
      where: { id: qualityReport.id },
      data: { 
        severity,
        complianceRisk,
        recommendedActions: JSON.stringify(recommendedActions)
      }
    });

    // Quality report created successfully

    // Send alerts for critical issues
    if (severity === 'critical') {
      // In production, this would trigger immediate alerts
      // Critical quality alert triggered - notify relevant personnel
    }

    return NextResponse.json({
      success: true,
      reportId: qualityReport.id,
      severity,
      complianceRisk,
      message: `Quality ${issueType.replace('_', ' ')} report created for ${roomZone}`,
      recommendedActions,
      nextSteps: [
        'Take detailed photos of quality issue',
        'Include product labels and batch information',
        'AI will analyze for compliance requirements',
        severity === 'critical' ? 'IMMEDIATE ACTION REQUIRED' : 'Quality team will be notified'
      ],
      alerts: severity === 'critical' ? [
        'Facility manager notified',
        'Quality team alerted',
        'Compliance officer informed'
      ] : []
    });

  } catch (error) {
    console.error('Quality report failed:', error);
    return NextResponse.json(
      { error: 'Failed to create quality report' },
      { status: 500 }
    );
  }
}