import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deviceConfig = await request.json();
    
    // Validate required fields
    if (!deviceConfig.deviceId || !deviceConfig.deviceName || !deviceConfig.location) {
      return NextResponse.json(
        { error: 'Device ID, name, and location are required' },
        { status: 400 }
      );
    }

    // Store device registration in database
    // For now, we'll create a simple registry
    const registeredDevice = {
      ...deviceConfig,
      userId,
      registeredAt: new Date(),
      status: 'registered',
      lastSeen: null,
      dataPointsReceived: 0
    };

    // In production, this would save to a database
    // For now, we'll return success
    console.log('Device registered:', registeredDevice);

    // Create device entry in InfluxDB with metadata
    try {
      // This would typically initialize the device in InfluxDB
      // with proper tags and metadata for filtering
    } catch (influxError) {
      console.error('InfluxDB device setup error:', influxError);
      // Continue anyway - device can still send data
    }

    return NextResponse.json({
      success: true,
      device: {
        deviceId: deviceConfig.deviceId,
        status: 'registered',
        endpoint: '/api/sensors/readings',
        apiKey: deviceConfig.apiKey,
        samplePayload: {
          deviceId: deviceConfig.deviceId,
          location: deviceConfig.location,
          timestamp: new Date().toISOString(),
          measurements: {
            temperature: 25.5,
            humidity: 60.2,
            // Add other sensor types based on config
            ...generateSampleMeasurements(deviceConfig.sensorTypes)
          }
        }
      }
    });

  } catch (error: any) {
    console.error('Device registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register device', details: error.message },
      { status: 500 }
    );
  }
}

function generateSampleMeasurements(sensorTypes: string[]): Record<string, number> {
  const samples: Record<string, number> = {};
  
  sensorTypes.forEach(sensor => {
    switch (sensor) {
      case 'Temperature/Humidity (DHT22)':
        samples.temperature = 25.5;
        samples.humidity = 60.2;
        break;
      case 'Soil Moisture':
        samples.soilMoisture = 45.8;
        break;
      case 'pH Sensor':
        samples.ph = 6.2;
        break;
      case 'CO2 (MQ135)':
        samples.co2 = 420;
        break;
      case 'Light Intensity (BH1750)':
        samples.lightIntensity = 1200;
        break;
      case 'Water Level':
        samples.waterLevel = 75.5;
        break;
      case 'Motion Detection':
        samples.motionDetected = 0;
        break;
      case 'Door/Window Sensors':
        samples.doorOpen = 0;
        break;
      case 'Current/Power Monitoring':
        samples.current = 2.5;
        samples.power = 125.0;
        break;
      case 'Custom Analog Sensor':
        samples.customSensor = 512;
        break;
    }
  });
  
  return samples;
}