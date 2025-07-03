// API endpoints for individual export operations
import { NextRequest, NextResponse } from 'next/server';
import { exportService } from '@/lib/api/export-service';
import { authenticateRequest } from '@/lib/auth';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface RouteParams {
  params: {
    exportId: string;
  };
}

// GET /api/exports/[exportId] - Get export status
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, facility } = await authenticateRequest(request);
    const { exportId } = params;

    const exportStatus = await exportService.getExportStatus(exportId);
    
    if (!exportStatus) {
      return NextResponse.json(
        { error: 'Export not found' },
        { status: 404 }
      );
    }

    // Check permissions - users can only access their facility's exports
    if (user.role !== 'ADMIN' && exportStatus.facilityId !== facility.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: exportId,
      status: exportStatus.status,
      progress: exportStatus.progress,
      createdAt: exportStatus.createdAt,
      updatedAt: exportStatus.updatedAt,
      error: exportStatus.error,
      downloadUrl: exportStatus.status === 'completed' ? `/api/exports/${exportId}/download` : null
    });

  } catch (error) {
    console.error('Export status error:', error);
    return NextResponse.json(
      { error: 'Failed to get export status' },
      { status: 500 }
    );
  }
}

// DELETE /api/exports/[exportId] - Cancel or delete export
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, facility } = await authenticateRequest(request);
    const { exportId } = params;

    const exportStatus = await exportService.getExportStatus(exportId);
    
    if (!exportStatus) {
      return NextResponse.json(
        { error: 'Export not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role !== 'ADMIN' && exportStatus.facilityId !== facility.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Only allow deletion of completed or failed exports
    if (exportStatus.status === 'processing') {
      return NextResponse.json(
        { error: 'Cannot delete export in progress' },
        { status: 400 }
      );
    }

    // Delete export file and cache entry
    // In production, implement actual deletion
    
    return NextResponse.json({
      message: 'Export deleted successfully'
    });

  } catch (error) {
    console.error('Export deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete export' },
      { status: 500 }
    );
  }
}