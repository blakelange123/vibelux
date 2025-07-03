import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { fluorescenceDataService } from '@/services/database/fluorescence-data.service';
import { pamFluorometer } from '@/services/sensors/pam-fluorometer.service';
import { sensorWebSocket } from '@/services/websocket/sensor-websocket.service';

// POST - Record fluorescence measurement
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      plantId, 
      projectId, 
      protocolName, 
      experimentId,
      notes,
      tags,
      readings 
    } = body;

    // Validate required fields
    if (!plantId) {
      return NextResponse.json(
        { error: 'Plant ID is required' },
        { status: 400 }
      );
    }

    // Handle single reading or batch
    if (readings && Array.isArray(readings)) {
      // Batch save
      const saved = await fluorescenceDataService.saveBatch(
        session.userId,
        readings.map(reading => ({
          reading: {
            ...reading,
            timestamp: new Date(reading.timestamp || Date.now())
          },
          metadata: {
            plantId,
            projectId,
            protocolName,
            experimentId
          }
        }))
      );

      // Send to WebSocket for real-time updates
      readings.forEach(reading => {
        sensorWebSocket.sendSensorData({
          sensorId: `pam_${plantId}`,
          type: 'fluorescence',
          value: reading.fvFm,
          timestamp: new Date(reading.timestamp || Date.now()),
          metadata: {
            ...reading,
            plantId,
            protocolName
          }
        });
      });

      return NextResponse.json({
        success: true,
        count: saved.length,
        data: saved
      });
    } else {
      // Single reading from request body
      const reading = {
        f0: body.f0,
        fm: body.fm,
        fv: body.fv || (body.fm - body.f0),
        fvFm: body.fvFm || ((body.fm - body.f0) / body.fm),
        fvF0: body.fvF0,
        fmF0: body.fmF0,
        phi2: body.phi2,
        qP: body.qP,
        qN: body.qN,
        npq: body.npq,
        etr: body.etr,
        rfd: body.rfd,
        timestamp: new Date(body.timestamp || Date.now()),
        metadata: {
          lightIntensity: body.lightIntensity,
          temperature: body.temperature,
          leafPosition: body.leafPosition,
          plantId
        }
      };

      const saved = await fluorescenceDataService.saveReading(
        session.userId,
        reading,
        {
          plantId,
          projectId,
          protocolName,
          experimentId,
          notes,
          tags
        }
      );

      // Send to WebSocket
      sensorWebSocket.sendSensorData({
        sensorId: `pam_${plantId}`,
        type: 'fluorescence',
        value: reading.fvFm,
        timestamp: reading.timestamp,
        metadata: reading
      });

      return NextResponse.json({
        success: true,
        data: saved
      });
    }
  } catch (error) {
    console.error('Fluorescence measurement error:', error);
    return NextResponse.json(
      { error: 'Failed to save fluorescence measurement' },
      { status: 500 }
    );
  }
}

// GET - Retrieve fluorescence data
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const query = {
      userId: session.userId,
      plantId: searchParams.get('plantId') || undefined,
      projectId: searchParams.get('projectId') || undefined,
      experimentId: searchParams.get('experimentId') || undefined,
      protocolName: searchParams.get('protocolName') || undefined,
      startDate: searchParams.get('startDate') 
        ? new Date(searchParams.get('startDate')!) 
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined,
      limit: parseInt(searchParams.get('limit') || '100'),
      offset: parseInt(searchParams.get('offset') || '0'),
      orderBy: (searchParams.get('orderBy') as any) || 'timestamp',
      orderDirection: (searchParams.get('orderDirection') as any) || 'desc'
    };

    // Get statistics if requested
    if (searchParams.get('stats') === 'true') {
      const stats = await fluorescenceDataService.getStatistics({
        userId: session.userId,
        plantId: query.plantId,
        experimentId: query.experimentId,
        startDate: query.startDate,
        endDate: query.endDate
      });

      return NextResponse.json({
        success: true,
        stats
      });
    }

    // Get health history if requested
    if (searchParams.get('healthHistory') === 'true' && query.plantId) {
      const days = parseInt(searchParams.get('days') || '30');
      const history = await fluorescenceDataService.getPlantHealthHistory(
        session.userId,
        query.plantId,
        days
      );

      return NextResponse.json({
        success: true,
        history
      });
    }

    // Export data if requested
    if (searchParams.get('export') === 'true') {
      const format = (searchParams.get('format') as 'json' | 'csv') || 'json';
      const exportData = await fluorescenceDataService.exportData(query, format);
      
      const contentType = format === 'csv' ? 'text/csv' : 'application/json';
      const filename = `fluorescence-data-${new Date().toISOString().split('T')[0]}.${format}`;
      
      return new NextResponse(exportData, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    // Regular query
    const result = await fluorescenceDataService.queryReadings(query);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Fluorescence data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fluorescence data' },
      { status: 500 }
    );
  }
}

// DELETE - Remove old data
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const daysToKeep = parseInt(searchParams.get('daysToKeep') || '90');

    const deletedCount = await fluorescenceDataService.deleteOldData(
      session.userId,
      daysToKeep
    );

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} records older than ${daysToKeep} days`
    });
  } catch (error) {
    console.error('Fluorescence data deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete old data' },
      { status: 500 }
    );
  }
}

// Special endpoint for device control
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, params } = body;

    switch (action) {
      case 'connect':
        const connected = await pamFluorometer.connect(params?.deviceType);
        return NextResponse.json({
          success: connected,
          status: pamFluorometer.getStatus()
        });

      case 'disconnect':
        pamFluorometer.disconnect();
        return NextResponse.json({
          success: true,
          status: pamFluorometer.getStatus()
        });

      case 'startMeasurement':
        if (!params?.protocol) {
          return NextResponse.json(
            { error: 'Protocol is required' },
            { status: 400 }
          );
        }
        
        await pamFluorometer.startMeasurement(params.protocol, params.metadata);
        
        // Set up real-time streaming
        pamFluorometer.on('reading', async (reading) => {
          // Save to database
          await fluorescenceDataService.saveReading(
            session.userId,
            reading,
            {
              plantId: params.metadata?.plantId || 'unknown',
              protocolName: params.protocol.name,
              experimentId: params.metadata?.experimentId
            }
          );
          
          // Stream via WebSocket
          sensorWebSocket.sendSensorData({
            sensorId: `pam_${params.metadata?.plantId || 'unknown'}`,
            type: 'fluorescence',
            value: reading.fvFm,
            timestamp: reading.timestamp,
            metadata: reading
          });
        });
        
        return NextResponse.json({
          success: true,
          message: 'Measurement started',
          status: pamFluorometer.getStatus()
        });

      case 'stopMeasurement':
        pamFluorometer.stopMeasurement();
        return NextResponse.json({
          success: true,
          message: 'Measurement stopped',
          status: pamFluorometer.getStatus()
        });

      case 'generateLightCurve':
        const lightLevels = params?.lightLevels || [0, 25, 50, 100, 200, 400, 600, 800, 1000, 1200, 1500];
        const readings = await pamFluorometer.generateLightCurve(lightLevels);
        
        // Save all readings
        const saved = await fluorescenceDataService.saveBatch(
          session.userId,
          readings.map(reading => ({
            reading,
            metadata: {
              plantId: params?.metadata?.plantId || 'unknown',
              protocolName: 'Light Curve',
              experimentId: params?.metadata?.experimentId
            }
          }))
        );
        
        return NextResponse.json({
          success: true,
          data: saved,
          curveData: readings
        });

      case 'calibrate':
        const calibrated = await pamFluorometer.calibrate();
        return NextResponse.json({
          success: calibrated,
          message: calibrated ? 'Calibration complete' : 'Calibration failed'
        });

      case 'status':
        return NextResponse.json({
          success: true,
          status: pamFluorometer.getStatus()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('PAM device control error:', error);
    return NextResponse.json(
      { error: 'Device control error' },
      { status: 500 }
    );
  }
}