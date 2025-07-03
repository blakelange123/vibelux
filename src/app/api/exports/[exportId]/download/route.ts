// API endpoint for downloading export files
import { NextRequest, NextResponse } from 'next/server';
import { exportService } from '@/lib/api/export-service';
import { authenticateRequest } from '@/lib/auth';
import { readFileSync, existsSync, statSync } from 'fs';
import { basename } from 'path';

interface RouteParams {
  params: {
    exportId: string;
  };
}

// GET /api/exports/[exportId]/download - Download export file
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

    // Check permissions
    if (user.role !== 'ADMIN' && exportStatus.facilityId !== facility.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if export is completed
    if (exportStatus.status !== 'completed') {
      return NextResponse.json(
        { error: 'Export not ready for download' },
        { status: 400 }
      );
    }

    // Check if file exists
    const filePath = exportStatus.filePath;
    if (!filePath || !existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Export file not found' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = readFileSync(filePath);
    const fileStats = statSync(filePath);
    const fileName = basename(filePath);

    // Determine content type based on file extension
    const contentType = getContentType(fileName);

    // Create response with file
    const response = new NextResponse(fileBuffer);

    // Set headers for file download
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    response.headers.set('Content-Length', fileStats.size.toString());
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Log download for audit
    console.log(`Export downloaded: ${exportId} by user ${user.id} (${user.email})`);

    return response;

  } catch (error) {
    console.error('Export download error:', error);
    return NextResponse.json(
      { error: 'Failed to download export' },
      { status: 500 }
    );
  }
}

function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'csv':
      return 'text/csv';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'json':
      return 'application/json';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}