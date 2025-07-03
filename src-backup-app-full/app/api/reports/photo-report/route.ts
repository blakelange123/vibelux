import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      facilityId, 
      reportType, 
      category, 
      title, 
      roomZone, 
      description, 
      reportedBy, 
      location 
    } = await request.json();

    // Create generic photo report record
    const photoReport = await prisma.photoReport.create({
      data: {
        id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        facilityId,
        reportType,
        category,
        title,
        roomZone,
        description,
        reportedBy,
        location: JSON.stringify(location),
        status: 'submitted',
        priority: 'medium',
        createdAt: new Date()
      }
    });

    // Categorize and prioritize based on report type
    let priority = 'medium';
    let urgency = 'normal';
    let recommendedActions = [];

    switch (reportType) {
      case 'qr_asset':
        priority = 'low';
        recommendedActions = [
          'Verify asset location in system',
          'Update asset database',
          'Check asset condition'
        ];
        break;
      case 'custom_issue':
        priority = 'medium';
        urgency = 'review_needed';
        recommendedActions = [
          'Facility manager review required',
          'Categorize issue appropriately',
          'Assign to relevant department'
        ];
        break;
      case 'compliance_doc':
        priority = 'high';
        urgency = 'regulatory';
        recommendedActions = [
          'Add to compliance documentation',
          'Ensure regulatory requirements met',
          'File in appropriate audit trail'
        ];
        break;
      case 'environmental_issue':
        priority = 'high';
        urgency = 'environmental';
        recommendedActions = [
          'Assess environmental impact',
          'Check HVAC and climate systems',
          'Monitor for recurring patterns'
        ];
        break;
    }

    // Update priority in database
    await prisma.photoReport.update({
      where: { id: photoReport.id },
      data: { 
        priority,
        urgency,
        recommendedActions: JSON.stringify(recommendedActions)
      }
    });

    // Photo report created successfully

    return NextResponse.json({
      success: true,
      reportId: photoReport.id,
      priority,
      urgency,
      message: `${title} report created for ${roomZone}`,
      recommendedActions,
      nextSteps: [
        'Take comprehensive photos of the situation',
        'Include context and detail shots',
        'AI will analyze and categorize automatically',
        'Appropriate team members will be notified'
      ],
      workflow: {
        'qr_asset': 'Asset tracking workflow initiated',
        'custom_issue': 'Management review workflow started',
        'compliance_doc': 'Compliance documentation workflow triggered',
        'environmental_issue': 'Environmental monitoring workflow activated'
      }[reportType] || 'Standard reporting workflow initiated'
    });

  } catch (error) {
    console.error('Photo report failed:', error);
    return NextResponse.json(
      { error: 'Failed to create photo report' },
      { status: 500 }
    );
  }
}