import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { facilityId, roomZone, reportType, description, reportedBy, location } = await request.json();

    // Create inventory report record
    const inventoryReport = await prisma.inventoryReport.create({
      data: {
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        facilityId,
        roomZone,
        reportType,
        description,
        reportedBy,
        location: JSON.stringify(location),
        status: 'photo_pending',
        priority: reportType === 'low_stock' ? 'medium' : 'low',
        createdAt: new Date()
      }
    });

    // Determine urgency and actions based on report type
    let urgencyLevel = 'low';
    let recommendedActions = [];

    switch (reportType) {
      case 'low_stock':
        urgencyLevel = 'medium';
        recommendedActions = [
          'Check current inventory levels',
          'Review consumption patterns',
          'Place reorder if needed',
          'Update inventory management system'
        ];
        break;
      case 'damaged_goods':
        urgencyLevel = 'high';
        recommendedActions = [
          'Quarantine damaged items',
          'Document for insurance claim',
          'Identify cause of damage',
          'Implement prevention measures'
        ];
        break;
      case 'missing_items':
        urgencyLevel = 'high';
        recommendedActions = [
          'Conduct thorough search',
          'Review access logs',
          'Check security footage if available',
          'File incident report'
        ];
        break;
    }

    // Inventory report created successfully

    return NextResponse.json({
      success: true,
      reportId: inventoryReport.id,
      urgencyLevel,
      message: `${reportType.replace('_', ' ')} report created for ${roomZone}`,
      recommendedActions,
      nextSteps: [
        'Take clear photos of inventory items',
        'Include wider context shots',
        'AI will analyze for automated categorization',
        'Automatic alerts will be sent to inventory managers'
      ]
    });

  } catch (error) {
    console.error('Inventory report failed:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory report' },
      { status: 500 }
    );
  }
}