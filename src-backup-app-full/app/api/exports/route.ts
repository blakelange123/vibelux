// API endpoints for data exports
import { NextRequest, NextResponse } from 'next/server';
import { exportService } from '@/lib/api/export-service';
import { authenticateRequest } from '@/lib/auth';

// POST /api/exports - Create new export request
export async function POST(request: NextRequest) {
  try {
    const { user, facility } = await authenticateRequest(request);
    
    const body = await request.json();
    const {
      dataTypes,
      dateRange,
      format = 'xlsx',
      includePhotos = false,
      includePersonalData = false
    } = body;

    // Validate request
    if (!dataTypes || !Array.isArray(dataTypes) || dataTypes.length === 0) {
      return NextResponse.json(
        { error: 'Data types are required' },
        { status: 400 }
      );
    }

    if (!dateRange?.start || !dateRange?.end) {
      return NextResponse.json(
        { error: 'Date range is required' },
        { status: 400 }
      );
    }

    // Check permissions for personal data
    if (includePersonalData && user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Insufficient permissions for personal data export' },
        { status: 403 }
      );
    }

    // Create export request
    const exportId = await exportService.createExportRequest({
      facilityId: facility.id,
      dataTypes,
      dateRange: {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      },
      format,
      includePhotos,
      includePersonalData,
      requestedBy: user.id
    });

    return NextResponse.json({
      exportId,
      status: 'pending',
      message: 'Export request created successfully'
    });

  } catch (error) {
    console.error('Export creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create export request' },
      { status: 500 }
    );
  }
}

// GET /api/exports - List export requests
export async function GET(request: NextRequest) {
  try {
    const { user, facility } = await authenticateRequest(request);
    
    const { searchParams } = new URL(request.url);
    const facilityFilter = searchParams.get('facility');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Admin can view all exports, others only their facility
    const facilityIds = user.role === 'ADMIN' 
      ? (facilityFilter ? [facilityFilter] : ['all'])
      : [facility.id];

    // In production, query from database
    const mockExports = [
      {
        id: 'exp-001',
        facilityId: facility.id,
        facilityName: facility.name,
        requestedBy: user.id,
        requestedByName: user.name,
        exportType: 'full',
        dataTypes: ['photo_reports', 'harvest_data', 'environmental_data'],
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        format: 'xlsx',
        status: 'completed',
        fileSize: 15728640,
        downloadUrl: `/api/exports/exp-001/download`,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      }
    ];

    const filteredExports = mockExports.filter(exp => {
      if (status && exp.status !== status) return false;
      if (facilityFilter && facilityFilter !== 'all' && exp.facilityId !== facilityFilter) return false;
      if (user.role !== 'ADMIN' && exp.facilityId !== facility.id) return false;
      return true;
    });

    return NextResponse.json({
      exports: filteredExports.slice(0, limit),
      total: filteredExports.length,
      hasMore: filteredExports.length > limit
    });

  } catch (error) {
    console.error('Export listing error:', error);
    return NextResponse.json(
      { error: 'Failed to list exports' },
      { status: 500 }
    );
  }
}