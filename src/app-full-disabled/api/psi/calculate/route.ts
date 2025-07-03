import { NextRequest, NextResponse } from 'next/server';
import { calculateRealTimePSI } from '@/lib/photobiology-stress-index';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { sendNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required data
    if (!body.sensorData || !body.plantData) {
      return NextResponse.json(
        { error: 'Missing required sensor or plant data' },
        { status: 400 }
      );
    }

    // Calculate PSI
    const psiResult = calculateRealTimePSI(body.sensorData, body.plantData);

    // Store in database if provided
    if (body.storeResult && body.zoneId) {
      const { userId } = await auth();
      
      // Store PSI result in database
      await prisma.pSIReading.create({
        data: {
          zoneId: body.zoneId,
          userId: userId || 'system',
          overallPSI: psiResult.overallPSI,
          stressCategory: psiResult.stressCategory,
          primaryStressor: psiResult.primaryStressor,
          components: psiResult.components as any,
          recommendations: psiResult.recommendations,
          timestamp: new Date()
        }
      });
    }

    // Check for critical stress and trigger alerts
    if (psiResult.stressCategory === 'severe' || psiResult.stressCategory === 'critical') {
      const { userId } = await auth();
      
      // Create alert in database
      await prisma.alert.create({
        data: {
          userId: userId || 'system',
          type: 'PSI_CRITICAL',
          severity: psiResult.stressCategory === 'critical' ? 'CRITICAL' : 'HIGH',
          title: `Critical Plant Stress Detected in Zone ${body.zoneId}`,
          message: `PSI value of ${psiResult.overallPSI.toFixed(1)} indicates ${psiResult.stressCategory} stress. Primary stressor: ${psiResult.primaryStressor}`,
          metadata: {
            zoneId: body.zoneId,
            psiValue: psiResult.overallPSI,
            stressCategory: psiResult.stressCategory,
            primaryStressor: psiResult.primaryStressor,
            recommendations: psiResult.recommendations
          },
          isRead: false,
          createdAt: new Date()
        }
      });
      
      // Send real-time notification
      if (userId) {
        await sendNotification({
          userId,
          type: 'alert',
          title: 'Critical Plant Stress Alert',
          message: `Zone ${body.zoneId}: ${psiResult.primaryStressor} causing ${psiResult.stressCategory} stress (PSI: ${psiResult.overallPSI.toFixed(1)})`,
          priority: 'high',
          data: {
            zoneId: body.zoneId,
            psiResult
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: psiResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('PSI calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate PSI' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const zoneId = searchParams.get('zoneId');
  const timeRange = searchParams.get('timeRange') || '24h';

  try {
    const { userId } = await auth();
    
    // Calculate time range
    const hoursMap: { [key: string]: number } = {
      '1h': 1,
      '6h': 6,
      '12h': 12,
      '24h': 24,
      '7d': 168,
      '30d': 720
    };
    
    const hours = hoursMap[timeRange] || 24;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Retrieve historical PSI data from database
    const historicalData = await prisma.pSIReading.findMany({
      where: {
        ...(zoneId && { zoneId }),
        ...(userId && { userId }),
        timestamp: {
          gte: startTime
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 1000 // Limit to prevent too much data
    });

    // Calculate summary statistics
    const psiValues = historicalData.map(d => d.overallPSI);
    const averagePSI = psiValues.reduce((a, b) => a + b, 0) / psiValues.length || 0;
    const minPSI = Math.min(...psiValues) || 0;
    const maxPSI = Math.max(...psiValues) || 0;
    
    // Calculate trend (comparing first half to second half)
    const midPoint = Math.floor(psiValues.length / 2);
    const firstHalfAvg = psiValues.slice(0, midPoint).reduce((a, b) => a + b, 0) / midPoint || 0;
    const secondHalfAvg = psiValues.slice(midPoint).reduce((a, b) => a + b, 0) / (psiValues.length - midPoint) || 0;
    
    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    if (secondHalfAvg < firstHalfAvg - 5) trend = 'improving';
    else if (secondHalfAvg > firstHalfAvg + 5) trend = 'worsening';

    // Group by stress category for distribution
    const stressDistribution = historicalData.reduce((acc, reading) => {
      acc[reading.stressCategory] = (acc[reading.stressCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        zoneId,
        timeRange,
        history: historicalData.map(d => ({
          timestamp: d.timestamp.toISOString(),
          overallPSI: d.overallPSI,
          stressCategory: d.stressCategory,
          primaryStressor: d.primaryStressor
        })),
        summary: {
          averagePSI: parseFloat(averagePSI.toFixed(1)),
          minPSI: parseFloat(minPSI.toFixed(1)),
          maxPSI: parseFloat(maxPSI.toFixed(1)),
          trend,
          totalReadings: historicalData.length,
          stressDistribution
        }
      }
    });
  } catch (error) {
    console.error('PSI history retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve PSI history' },
      { status: 500 }
    );
  }
}