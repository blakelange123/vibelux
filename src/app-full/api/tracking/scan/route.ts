import { NextRequest, NextResponse } from 'next/server';
import { QRCodeGenerator } from '@/lib/qr-code-generator';

// Initialize QR code generator
const qrGenerator = new QRCodeGenerator(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrCodeUrl, scannedBy, location, timestamp } = body;

    if (!qrCodeUrl) {
      return NextResponse.json(
        { error: 'QR code URL is required' },
        { status: 400 }
      );
    }

    // Parse QR code URL to extract type and ID
    const parsed = qrGenerator.parseQRCodeUrl(qrCodeUrl);
    
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid QR code URL format' },
        { status: 400 }
      );
    }

    const { type, id } = parsed;

    // Record the scan event
    const scanEvent = {
      id: `scan-${Date.now()}`,
      qrCodeId: id,
      qrCodeType: type,
      scannedBy: scannedBy || 'anonymous',
      location: location || 'unknown',
      timestamp: timestamp || new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // Store scan event in database
    await storeScanEvent(scanEvent);

    // Update QR code tracking data
    await updateQRCodeTracking(id, {
      lastScanned: new Date(),
      scanCount: 1, // This would be incremented in the database
      currentLocation: location
    });

    // Fetch full QR code data
    const qrCodeData = await fetchQRCodeData(id);

    return NextResponse.json({
      success: true,
      scanEvent,
      qrCodeData,
      message: 'Scan recorded successfully'
    });
  } catch (error) {
    console.error('QR code scan error:', error);
    return NextResponse.json(
      { error: 'Failed to process QR code scan' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qrCodeId = searchParams.get('qrCodeId');
    const scannedBy = searchParams.get('scannedBy');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Fetch scan history from database
    const scanHistory = await fetchScanHistory({
      qrCodeId,
      scannedBy,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });

    return NextResponse.json({
      success: true,
      count: scanHistory.length,
      scanHistory
    });
  } catch (error) {
    console.error('Scan history fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scan history' },
      { status: 500 }
    );
  }
}

// Database helper functions
async function storeScanEvent(scanEvent: any): Promise<void> {
  const { prisma } = await import('@/lib/prisma');
  
  await prisma.scanEvent.create({
    data: {
      qrCodeId: scanEvent.qrCodeId,
      scannedBy: scanEvent.scannedBy,
      location: scanEvent.location,
      action: scanEvent.action,
      metadata: scanEvent.metadata || {},
      timestamp: scanEvent.timestamp,
      deviceInfo: scanEvent.deviceInfo,
      success: scanEvent.success !== false
    }
  });
}

async function updateQRCodeTracking(
  qrCodeId: string,
  updates: {
    lastScanned: Date;
    scanCount: number;
    currentLocation?: string;
  }
): Promise<void> {
  const { prisma } = await import('@/lib/prisma');
  
  await prisma.qRCode.update({
    where: { code: qrCodeId },
    data: {
      lastScanned: updates.lastScanned,
      scanCount: { increment: 1 },
      currentLocation: updates.currentLocation,
      updatedAt: new Date()
    }
  });
}

async function fetchQRCodeData(qrCodeId: string): Promise<any> {
  const { prisma } = await import('@/lib/prisma');
  
  const qrCode = await prisma.qRCode.findUnique({
    where: { code: qrCodeId },
    include: {
      batch: true,
      plant: true,
      scanEvents: {
        take: 5,
        orderBy: { timestamp: 'desc' }
      }
    }
  });
  
  if (!qrCode) {
    return null;
  }
  
  return {
    id: qrCode.code,
    type: qrCode.type,
    metadata: qrCode.metadata || {},
    tracking: {
      createdAt: qrCode.createdAt,
      lastScanned: qrCode.lastScanned,
      scanCount: qrCode.scanCount || 0,
      currentLocation: qrCode.currentLocation,
      status: qrCode.status
    },
    batch: qrCode.batch,
    plant: qrCode.plant,
    recentScans: qrCode.scanEvents
  };
}

async function fetchScanHistory(filters: {
  qrCodeId?: string | null;
  scannedBy?: string | null;
  startDate?: Date;
  endDate?: Date;
}): Promise<any[]> {
  const { prisma } = await import('@/lib/prisma');
  
  const where: any = {};
  
  if (filters.qrCodeId) {
    where.qrCodeId = filters.qrCodeId;
  }
  
  if (filters.scannedBy) {
    where.scannedBy = filters.scannedBy;
  }
  
  if (filters.startDate || filters.endDate) {
    where.timestamp = {};
    if (filters.startDate) {
      where.timestamp.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.timestamp.lte = filters.endDate;
    }
  }
  
  const scanEvents = await prisma.scanEvent.findMany({
    where,
    include: {
      qrCode: {
        include: {
          batch: true,
          plant: true
        }
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 100 // Limit results
  });
  
  return scanEvents.map(event => ({
    id: event.id,
    qrCodeId: event.qrCodeId,
    scannedBy: event.scannedBy,
    timestamp: event.timestamp,
    location: event.location,
    action: event.action,
    metadata: event.metadata,
    qrCodeType: event.qrCode.type,
    batchInfo: event.qrCode.batch,
    plantInfo: event.qrCode.plant
  }));
}