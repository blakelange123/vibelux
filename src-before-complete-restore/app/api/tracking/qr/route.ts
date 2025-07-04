import { NextRequest, NextResponse } from 'next/server';
import { QRCodeGenerator, QRCodeData, generateUniqueId } from '@/lib/qr-code-generator';

// Initialize QR code generator
const qrGenerator = new QRCodeGenerator(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, facilityId, metadata, quantity = 1, options } = body;

    if (!type || !facilityId) {
      return NextResponse.json(
        { error: 'Missing required fields: type and facilityId' },
        { status: 400 }
      );
    }

    const results = [];

    for (let i = 0; i < quantity; i++) {
      const id = metadata?.id || generateUniqueId();
      let result;

      switch (type) {
        case 'container':
          result = await qrGenerator.generateContainerQR(id, facilityId, metadata || {}, options);
          break;
        case 'inventory':
          result = await qrGenerator.generateInventoryQR(id, facilityId, metadata || {}, options);
          break;
        case 'asset':
          result = await qrGenerator.generateAssetQR(id, facilityId, metadata || {}, options);
          break;
        case 'location':
          result = await qrGenerator.generateLocationQR(id, facilityId, metadata || {}, options);
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid type. Must be: container, inventory, asset, or location' },
            { status: 400 }
          );
      }

      // Store QR code data in database (implement based on your database)
      await storeQRCodeData(result.data);

      results.push(result);
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      qrCodes: results
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR codes' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    // Fetch QR codes from database (implement based on your database)
    const qrCodes = await fetchQRCodes({ facilityId, type, status });

    return NextResponse.json({
      success: true,
      count: qrCodes.length,
      qrCodes
    });
  } catch (error) {
    console.error('QR code fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR codes' },
      { status: 500 }
    );
  }
}

// Database helper functions
async function storeQRCodeData(data: QRCodeData): Promise<void> {
  const { prisma } = await import('@/lib/prisma');
  
  await prisma.qRCode.create({
    data: {
      code: data.code,
      batchId: data.batchId,
      plantId: data.plantId,
      type: data.type || 'batch',
      status: data.status || 'active',
      metadata: data.metadata,
      createdAt: data.createdAt,
      lastScanned: data.lastScanned,
      facilityId: data.facilityId,
      generatedBy: data.generatedBy
    }
  });
}

async function fetchQRCodes(filters: {
  facilityId: string;
  type?: string | null;
  status?: string | null;
}): Promise<QRCodeData[]> {
  const { prisma } = await import('@/lib/prisma');
  
  const where: any = {
    facilityId: filters.facilityId
  };
  
  if (filters.type) {
    where.type = filters.type;
  }
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  const qrCodes = await prisma.qRCode.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    },
    take: 100 // Limit to prevent large responses
  });
  
  return qrCodes.map(qr => ({
    code: qr.code,
    batchId: qr.batchId || undefined,
    plantId: qr.plantId || undefined,
    type: qr.type as 'batch' | 'plant' | 'harvest' | 'shipment',
    status: qr.status as 'active' | 'inactive' | 'archived',
    metadata: qr.metadata as any || {},
    createdAt: qr.createdAt,
    lastScanned: qr.lastScanned || undefined,
    facilityId: qr.facilityId,
    generatedBy: qr.generatedBy
  }));
}