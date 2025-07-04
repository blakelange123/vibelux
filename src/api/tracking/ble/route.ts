import { NextRequest, NextResponse } from 'next/server';
import { BLEMeshTracker } from '@/lib/ble-mesh-tracker';

// Store BLE mesh trackers per facility
const bleTrackers = new Map<string, BLEMeshTracker>();

function getBLETracker(facilityId: string): BLEMeshTracker {
  if (!bleTrackers.has(facilityId)) {
    bleTrackers.set(facilityId, new BLEMeshTracker(facilityId));
  }
  return bleTrackers.get(facilityId)!;
}

// Register worker device for BLE tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'registerWorker': {
        const { facilityId, workerId, deviceInfo } = body;
        
        if (!facilityId || !workerId || !deviceInfo) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const tracker = getBLETracker(facilityId);
        const workerDevice = await tracker.registerWorkerDevice(workerId, deviceInfo);

        return NextResponse.json({
          success: true,
          workerDevice
        });
      }

      case 'updateLocation': {
        const { facilityId, workerId, scanResults } = body;
        
        if (!facilityId || !workerId || !scanResults) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const tracker = getBLETracker(facilityId);
        await tracker.updateWorkerLocation(workerId, scanResults);

        return NextResponse.json({
          success: true,
          message: 'Location updated'
        });
      }

      case 'trackAsset': {
        const { facilityId, assetId, beaconId } = body;
        
        if (!facilityId || !assetId || !beaconId) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const tracker = getBLETracker(facilityId);
        const tracking = await tracker.trackAssetMovement(assetId, beaconId);

        return NextResponse.json({
          success: true,
          tracking
        });
      }

      case 'createGeofence': {
        const { facilityId, zoneId, config } = body;
        
        if (!facilityId || !zoneId || !config) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const tracker = getBLETracker(facilityId);
        await tracker.createGeofence(zoneId, config);

        return NextResponse.json({
          success: true,
          message: 'Geofence created'
        });
      }

      case 'checkSafety': {
        const { facilityId, workerId } = body;
        
        if (!facilityId || !workerId) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const tracker = getBLETracker(facilityId);
        const safety = await tracker.monitorWorkerSafety(workerId);

        return NextResponse.json({
          success: true,
          safety
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('BLE tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to process BLE tracking request' },
      { status: 500 }
    );
  }
}

// Get BLE mesh analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    const tracker = getBLETracker(facilityId);
    const analytics = await tracker.generateAnalytics({
      start: startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate) : new Date()
    });

    return NextResponse.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('BLE analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to generate BLE analytics' },
      { status: 500 }
    );
  }
}

// Configure BLE mesh network
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilityId, config } = body;

    if (!facilityId || !config) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tracker = getBLETracker(facilityId);

    if (config.meshNetwork) {
      await tracker.initializeMeshNetwork(config.meshNetwork);
    }

    if (config.atrius) {
      await tracker.configureAtriusIntegration(config.atrius);
    }

    if (config.edgeComputing) {
      await tracker.enableEdgeComputing(config.edgeComputing);
    }

    return NextResponse.json({
      success: true,
      message: 'BLE mesh configuration updated'
    });
  } catch (error) {
    console.error('BLE configuration error:', error);
    return NextResponse.json(
      { error: 'Failed to configure BLE mesh' },
      { status: 500 }
    );
  }
}