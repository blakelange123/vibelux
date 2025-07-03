import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { QRRFIDManager } from '@/lib/tracking/qr-rfid-manager';

// Initialize tracking manager
const trackingManager = new QRRFIDManager();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const entityId = searchParams.get('entityId');
    const tagId = searchParams.get('tagId');

    switch (action) {
      case 'generateQR':
        // Generate QR code
        if (!entityId) {
          return NextResponse.json({ error: 'Entity ID required' }, { status: 400 });
        }
        
        const entityType = searchParams.get('entityType') || 'plant';
        const metadata = {
          strain: searchParams.get('strain'),
          plantedDate: new Date()
        };
        
        const qrResult = await trackingManager.generateQRCode(
          entityType as any,
          entityId,
          metadata
        );
        
        return NextResponse.json({
          tagId: qrResult.tagId,
          qrCode: qrResult.qrCodeDataUrl
        });

      case 'scan':
        // Scan tag
        if (!tagId) {
          return NextResponse.json({ error: 'Tag ID required' }, { status: 400 });
        }
        
        const scanResult = await trackingManager.scanTag(
          tagId,
          userId,
          'scan',
          { facility: 'Main', room: 'Flower 1' }
        );
        
        return NextResponse.json(scanResult);

      case 'chainOfCustody':
        // Generate chain of custody report
        if (!entityId) {
          return NextResponse.json({ error: 'Entity ID required' }, { status: 400 });
        }
        
        const report = trackingManager.generateChainOfCustody(entityId);
        return NextResponse.json({ report });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Tracking API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process tracking request' },
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
    const { action, data } = body;

    switch (action) {
      case 'createPlant':
        // Create new plant with tracking
        const plant = await trackingManager.createPlant(
          data.strain,
          data.source,
          data.location,
          data.motherId
        );
        return NextResponse.json({ success: true, plant });

      case 'createBatch':
        // Create batch
        const batch = await trackingManager.createBatch(
          data.name,
          data.strain,
          data.plantIds
        );
        return NextResponse.json({ success: true, batch });

      case 'movePlant':
        // Move plant
        const movedPlant = trackingManager.movePlant(
          data.plantId,
          data.toLocation,
          data.reason,
          userId
        );
        return NextResponse.json({ success: true, plant: movedPlant });

      case 'recordTreatment':
        // Record treatment
        const treatedPlant = trackingManager.recordTreatment(
          data.plantId,
          data.treatment
        );
        return NextResponse.json({ success: true, plant: treatedPlant });

      case 'scan':
        // Detailed scan with action
        const scanResult = await trackingManager.scanTag(
          data.tagId,
          userId,
          data.action,
          data.location,
          data.notes,
          data.images
        );
        return NextResponse.json({ success: true, ...scanResult });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Tracking API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process tracking request' },
      { status: 500 }
    );
  }
}