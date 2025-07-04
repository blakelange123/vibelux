import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, this would fetch from database and real sensors
    const metrics = {
      currentWeekSavings: 1319,
      lastWeekSavings: 1072,
      monthToDateSavings: 4856,
      yearToDateSavings: 45892,
      
      currentWeekCostSavings: 197.85,
      lastWeekCostSavings: 160.80,
      monthToDateCostSavings: 728.40,
      yearToDateCostSavings: 6883.80,
      
      systemStatus: 'optimizing',
      activeZones: 6,
      totalZones: 8,
      optimizationEfficiency: 88,
      
      connectionStatus: 'connected',
      controlSystem: 'TrolMaster',
      lastSync: new Date().toISOString(),
      
      performanceMetrics: {
        responseTime: { value: 95, target: 90 },
        optimizationRate: { value: 88, target: 85 },
        systemUptime: { value: 99.8, target: 99 },
        dataAccuracy: { value: 97, target: 95 },
        energyEfficiency: { value: 92, target: 90 },
        costReduction: { value: 85, target: 80 }
      },
      
      weeklyConsumption: [
        { date: 'Mon', baseline: 850, actual: 680, savings: 170, percentage: 20 },
        { date: 'Tue', baseline: 860, actual: 645, savings: 215, percentage: 25 },
        { date: 'Wed', baseline: 840, actual: 672, savings: 168, percentage: 20 },
        { date: 'Thu', baseline: 880, actual: 704, savings: 176, percentage: 20 },
        { date: 'Fri', baseline: 900, actual: 675, savings: 225, percentage: 25 },
        { date: 'Sat', baseline: 820, actual: 615, savings: 205, percentage: 25 },
        { date: 'Sun', baseline: 800, actual: 640, savings: 160, percentage: 20 }
      ],
      
      environmentalImpact: {
        co2Saved: 124, // tons
        energyReduced: 285, // MWh
        treesEquivalent: 2976,
        homesEquivalent: 27
      }
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}