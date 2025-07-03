import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { controlSystem } = await request.json();

    // Control system compatibility database
    const compatibility = {
      argus: {
        compatible: true,
        features: ['Full API access', 'Real-time monitoring', 'Zone control', 'Sensor integration'],
        limitations: [],
        requiredVersion: '7.0+',
        connectionType: 'Cloud API',
        setupTime: '10-15 minutes'
      },
      priva: {
        compatible: true,
        features: ['Climate control', 'Energy monitoring', 'Multi-zone support', 'Data logging'],
        limitations: ['Some legacy models require firmware update'],
        requiredVersion: '8.0+',
        connectionType: 'Local API + Cloud',
        setupTime: '15-20 minutes'
      },
      trolmaster: {
        compatible: true,
        features: ['Wireless sensors', 'Mobile app integration', 'Multi-room control', 'Data export'],
        limitations: [],
        requiredVersion: 'Hydro-X or newer',
        connectionType: 'Cloud API',
        setupTime: '5-10 minutes'
      },
      growlink: {
        compatible: true,
        features: ['Environmental control', 'Irrigation integration', 'Alert system', 'Historical data'],
        limitations: ['Basic tier has limited API calls'],
        requiredVersion: '3.0+',
        connectionType: 'REST API',
        setupTime: '10-15 minutes'
      },
      autogrow: {
        compatible: true,
        features: ['IntelliClimate integration', 'Dosing control', 'Multi-facility support'],
        limitations: ['Requires IntelliDose for full features'],
        requiredVersion: 'IntelliClimate 2.0+',
        connectionType: 'Cloud API',
        setupTime: '15-20 minutes'
      },
      other: {
        compatible: 'partial',
        features: ['Basic monitoring via Modbus', 'Manual configuration required'],
        limitations: ['Limited automation', 'No direct API', 'Requires gateway device'],
        requiredVersion: 'Modbus RTU/TCP support',
        connectionType: 'Modbus Gateway',
        setupTime: '30-60 minutes'
      }
    };

    const systemInfo = compatibility[controlSystem as keyof typeof compatibility] || compatibility.other;

    return NextResponse.json({
      controlSystem,
      ...systemInfo,
      energyOptimizationFeatures: {
        peakShaving: systemInfo.compatible === true,
        demandResponse: systemInfo.compatible === true,
        realTimeAdjustment: systemInfo.compatible === true,
        zoneControl: systemInfo.compatible === true,
        scheduling: true,
        reporting: true
      },
      requirements: {
        internet: 'Stable broadband connection',
        power: 'Uninterrupted power supply recommended',
        account: 'Admin access to control system',
        zones: 'Minimum 1 zone, recommended 4+ zones'
      }
    });
  } catch (error) {
    console.error('Compatibility check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check compatibility' },
      { status: 500 }
    );
  }
}