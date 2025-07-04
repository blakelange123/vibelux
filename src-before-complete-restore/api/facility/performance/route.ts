import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface FacilityPerformance {
  overview: {
    totalYield: number;
    yieldVariance: number;
    qualityScore: number;
    energyEfficiency: number;
    operationalUptime: number;
    costPerGram: number;
  };
  production: {
    yieldData: Array<{
      month: string;
      yield: number;
      target: number;
      quality: number;
    }>;
    cycleTime: Array<{
      stage: string;
      current: number;
      optimal: number;
      variance: number;
    }>;
    batchMetrics: Array<{
      batchId: string;
      strain: string;
      yield: number;
      quality: number;
      cycleTime: number;
      status: 'completed' | 'in-progress' | 'harvested';
    }>;
  };
  environmental: {
    temperatureData: Array<{
      time: string;
      temp: number;
      humidity: number;
      vpd: number;
    }>;
    lightingMetrics: {
      averagePPFD: number;
      uniformity: number;
      efficiency: number;
      spectrumOptimization: number;
    };
    climateControl: {
      hvacEfficiency: number;
      co2Utilization: number;
      airflowOptimization: number;
    };
  };
  energy: {
    totalConsumption: number;
    costPerKwh: number;
    efficiency: Array<{
      category: string;
      consumption: number;
      percentage: number;
      efficiency: number;
    }>;
    peakDemand: Array<{
      hour: string;
      demand: number;
      cost: number;
    }>;
  };
  quality: {
    testResults: Array<{
      batchId: string;
      thc: number;
      cbd: number;
      moisture: number;
      terpenes: number;
      grade: 'A+' | 'A' | 'B+' | 'B' | 'C';
    }>;
    defectAnalysis: Array<{
      defectType: string;
      count: number;
      impact: number;
      trendDirection: 'up' | 'down' | 'stable';
    }>;
  };
  financial: {
    revenuePerSqFt: number;
    operatingMargin: number;
    costBreakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    roi: {
      monthly: number;
      quarterly: number;
      annual: number;
    };
  };
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
    const facilityId = searchParams.get('facilityId') || 'default';
    const timeRange = searchParams.get('timeRange') || '30d';

    // Return comprehensive facility performance data
    const performanceData: FacilityPerformance = {
      overview: {
        totalYield: 8280,
        yieldVariance: 12.4,
        qualityScore: 93.2,
        energyEfficiency: 1.24,
        operationalUptime: 97.8,
        costPerGram: 1.85
      },
      production: {
        yieldData: [
          { month: 'Jan', yield: 1200, target: 1300, quality: 92 },
          { month: 'Feb', yield: 1350, target: 1300, quality: 94 },
          { month: 'Mar', yield: 1280, target: 1300, quality: 89 },
          { month: 'Apr', yield: 1450, target: 1400, quality: 96 },
          { month: 'May', yield: 1520, target: 1400, quality: 93 },
          { month: 'Jun', yield: 1480, target: 1400, quality: 95 }
        ],
        cycleTime: [
          { stage: 'Germination', current: 7, optimal: 7, variance: 0 },
          { stage: 'Vegetative', current: 28, optimal: 25, variance: 12 },
          { stage: 'Flowering', current: 63, optimal: 60, variance: 5 },
          { stage: 'Drying', current: 14, optimal: 12, variance: 17 },
          { stage: 'Curing', current: 21, optimal: 21, variance: 0 }
        ],
        batchMetrics: [
          {
            batchId: 'BTH-2024-067',
            strain: 'Blue Dream',
            yield: 487,
            quality: 94.2,
            cycleTime: 98,
            status: 'completed'
          },
          {
            batchId: 'BTH-2024-068',
            strain: 'OG Kush',
            yield: 512,
            quality: 96.8,
            cycleTime: 95,
            status: 'completed'
          },
          {
            batchId: 'BTH-2024-069',
            strain: 'Purple Haze',
            yield: 468,
            quality: 89.5,
            cycleTime: 102,
            status: 'harvested'
          },
          {
            batchId: 'BTH-2024-070',
            strain: 'White Widow',
            yield: 0,
            quality: 0,
            cycleTime: 45,
            status: 'in-progress'
          }
        ]
      },
      environmental: {
        temperatureData: [
          { time: '06:00', temp: 22.5, humidity: 65, vpd: 0.8 },
          { time: '12:00', temp: 24.2, humidity: 58, vpd: 1.2 },
          { time: '18:00', temp: 23.8, humidity: 62, vpd: 1.0 },
          { time: '00:00', temp: 21.8, humidity: 68, vpd: 0.7 }
        ],
        lightingMetrics: {
          averagePPFD: 847,
          uniformity: 92.4,
          efficiency: 2.7,
          spectrumOptimization: 89.2
        },
        climateControl: {
          hvacEfficiency: 87.5,
          co2Utilization: 94.2,
          airflowOptimization: 91.8
        }
      },
      energy: {
        totalConsumption: 12847,
        costPerKwh: 0.12,
        efficiency: [
          { category: 'Lighting', consumption: 7280, percentage: 56.7, efficiency: 91.2 },
          { category: 'HVAC', consumption: 3210, percentage: 25.0, efficiency: 87.5 },
          { category: 'Irrigation', consumption: 1240, percentage: 9.7, efficiency: 94.8 },
          { category: 'Monitoring', consumption: 847, percentage: 6.6, efficiency: 96.2 },
          { category: 'Other', consumption: 270, percentage: 2.1, efficiency: 82.1 }
        ],
        peakDemand: [
          { hour: '12:00', demand: 24.8, cost: 142.50 },
          { hour: '13:00', demand: 26.2, cost: 158.20 },
          { hour: '14:00', demand: 25.9, cost: 152.80 },
          { hour: '15:00', demand: 24.1, cost: 138.90 }
        ]
      },
      quality: {
        testResults: [
          {
            batchId: 'BTH-2024-067',
            thc: 23.4,
            cbd: 0.8,
            moisture: 11.2,
            terpenes: 2.8,
            grade: 'A+'
          },
          {
            batchId: 'BTH-2024-068',
            thc: 21.8,
            cbd: 1.2,
            moisture: 10.9,
            terpenes: 3.1,
            grade: 'A+'
          },
          {
            batchId: 'BTH-2024-069',
            thc: 19.2,
            cbd: 0.6,
            moisture: 12.1,
            terpenes: 2.4,
            grade: 'A'
          }
        ],
        defectAnalysis: [
          { defectType: 'Mold', count: 2, impact: 12.4, trendDirection: 'down' },
          { defectType: 'Nutrient Burn', count: 5, impact: 3.2, trendDirection: 'stable' },
          { defectType: 'Light Burn', count: 1, impact: 1.8, trendDirection: 'down' },
          { defectType: 'Pest Damage', count: 0, impact: 0, trendDirection: 'stable' }
        ]
      },
      financial: {
        revenuePerSqFt: 284.50,
        operatingMargin: 42.8,
        costBreakdown: [
          { category: 'Labor', amount: 18500, percentage: 35.2 },
          { category: 'Energy', amount: 12400, percentage: 23.6 },
          { category: 'Materials', amount: 8200, percentage: 15.6 },
          { category: 'Facilities', amount: 6500, percentage: 12.4 },
          { category: 'Compliance', amount: 4200, percentage: 8.0 },
          { category: 'Insurance', amount: 2800, percentage: 5.3 }
        ],
        roi: {
          monthly: 8.4,
          quarterly: 24.7,
          annual: 102.8
        }
      }
    };

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Error fetching facility performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facility performance data' },
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
    
    // Handle facility performance actions
    if (data.action === 'update_target') {
      return NextResponse.json({ 
        success: true, 
        message: `Target updated for ${data.metric} to ${data.value}` 
      });
    }
    
    if (data.action === 'optimize_schedule') {
      return NextResponse.json({ 
        success: true, 
        scheduleId: `schedule_${Date.now()}`,
        message: `Optimization schedule created for ${data.parameters.join(', ')}` 
      });
    }

    if (data.action === 'flag_issue') {
      return NextResponse.json({ 
        success: true, 
        issueId: `issue_${Date.now()}`,
        message: `Issue flagged: ${data.description}` 
      });
    }

    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 });
  } catch (error) {
    console.error('Error processing facility performance request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}