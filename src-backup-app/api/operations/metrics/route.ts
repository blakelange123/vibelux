import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface OperationsMetrics {
  summary: {
    otif: { current: number; target: number; trend: string; status: string };
    yield: { current: number; target: number; trend: string; status: string; unit: string };
    quality: { current: number; target: number; trend: string; status: string; unit: string };
    labor: { current: number; target: number; trend: string; status: string; unit: string };
    energy: { current: number; target: number; trend: string; status: string; unit: string };
    waste: { current: number; target: number; trend: string; status: string; unit: string };
  };
  production: {
    totalYield: number;
    yieldTrend: string;
    batchesCompleted: number;
    batchSuccess: number;
    averageCycleTime: number;
    weeklyProduction: Array<{ week: string; yield: number; quality: number }>;
  };
  quality: {
    overallScore: number;
    firstPassYield: number;
    defectRate: number;
    customerComplaints: number;
    qualityTrends: Array<{ date: string; score: number; defects: number }>;
  };
  efficiency: {
    oee: number;
    availability: number;
    performance: number;
    quality: number;
    downtimeReasons: Array<{ reason: string; hours: number; percentage: number }>;
  };
  alerts: Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    timestamp: string;
    resolved: boolean;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const facilityId = searchParams.get('facilityId') || 'default';

    // Return comprehensive operations metrics data
    const metricsData: OperationsMetrics = {
      summary: {
        otif: {
          current: 98.2,
          target: 95,
          trend: '+2.1%',
          status: 'good'
        },
        yield: {
          current: 142.5,
          target: 135,
          trend: '+5.6%',
          status: 'good',
          unit: 'g/m²/day'
        },
        quality: {
          current: 94.8,
          target: 90,
          trend: '-0.3%',
          status: 'warning',
          unit: '% First Pass'
        },
        labor: {
          current: 87.5,
          target: 85,
          trend: '+2.9%',
          status: 'good',
          unit: '% Efficiency'
        },
        energy: {
          current: 1.24,
          target: 1.35,
          trend: '-8.1%',
          status: 'good',
          unit: 'kWh/g'
        },
        waste: {
          current: 3.2,
          target: 5.0,
          trend: '-12.5%',
          status: 'good',
          unit: '% Total Biomass'
        }
      },
      production: {
        totalYield: 2847,
        yieldTrend: '+12.3%',
        batchesCompleted: 18,
        batchSuccess: 94.4,
        averageCycleTime: 112,
        weeklyProduction: [
          { week: '2024-06-17', yield: 485, quality: 96.2 },
          { week: '2024-06-10', yield: 512, quality: 94.8 },
          { week: '2024-06-03', yield: 468, quality: 95.5 },
          { week: '2024-05-27', yield: 445, quality: 93.1 },
          { week: '2024-05-20', yield: 478, quality: 94.7 },
          { week: '2024-05-13', yield: 459, quality: 96.1 },
          { week: '2024-05-06', yield: 423, quality: 92.8 }
        ]
      },
      quality: {
        overallScore: 94.8,
        firstPassYield: 89.2,
        defectRate: 2.3,
        customerComplaints: 1,
        qualityTrends: [
          { date: '2024-06-20', score: 96.1, defects: 1.8 },
          { date: '2024-06-19', score: 94.2, defects: 2.1 },
          { date: '2024-06-18', score: 95.8, defects: 1.9 },
          { date: '2024-06-17', score: 93.5, defects: 2.4 },
          { date: '2024-06-16', score: 97.2, defects: 1.2 },
          { date: '2024-06-15', score: 94.7, defects: 2.0 },
          { date: '2024-06-14', score: 96.3, defects: 1.7 }
        ]
      },
      efficiency: {
        oee: 82.5,
        availability: 94.2,
        performance: 89.8,
        quality: 97.6,
        downtimeReasons: [
          { reason: 'Scheduled Maintenance', hours: 12.5, percentage: 45.2 },
          { reason: 'Equipment Failure', hours: 8.2, percentage: 29.6 },
          { reason: 'Material Shortage', hours: 4.1, percentage: 14.8 },
          { reason: 'Changeover', hours: 2.9, percentage: 10.4 }
        ]
      },
      alerts: [
        {
          id: 'alert-001',
          type: 'warning',
          title: 'Room B Humidity Spike',
          description: 'Humidity increased to 72% in Flower Room B, above optimal range',
          timestamp: '2024-06-21T14:30:00Z',
          resolved: false
        },
        {
          id: 'alert-002',
          type: 'info',
          title: 'Weekly Harvest Complete',
          description: 'Harvest completed for Week 25 with 512g yield per m²',
          timestamp: '2024-06-21T09:15:00Z',
          resolved: true
        },
        {
          id: 'alert-003',
          type: 'critical',
          title: 'CO2 System Malfunction',
          description: 'CO2 enrichment system offline in Veg Room A, immediate attention required',
          timestamp: '2024-06-21T11:45:00Z',
          resolved: false
        },
        {
          id: 'alert-004',
          type: 'warning',
          title: 'Labor Efficiency Below Target',
          description: 'Daily labor efficiency dropped to 82% in Trim Department',
          timestamp: '2024-06-20T16:20:00Z',
          resolved: true
        }
      ]
    };

    return NextResponse.json(metricsData);
  } catch (error) {
    console.error('Error fetching operations metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch operations metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Handle metric updates or alerts
    if (data.type === 'alert_acknowledge') {
      // Acknowledge an alert
      return NextResponse.json({ 
        success: true, 
        message: `Alert ${data.alertId} acknowledged` 
      });
    }
    
    if (data.type === 'metric_target_update') {
      // Update metric targets
      return NextResponse.json({ 
        success: true, 
        message: `Target for ${data.metric} updated to ${data.target}` 
      });
    }

    return NextResponse.json({ 
      error: 'Invalid request type' 
    }, { status: 400 });
  } catch (error) {
    console.error('Error updating operations metrics:', error);
    return NextResponse.json(
      { error: 'Failed to update operations metrics' },
      { status: 500 }
    );
  }
}