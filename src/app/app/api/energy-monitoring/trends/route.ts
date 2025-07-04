import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const facilityId = searchParams.get('facilityId');
    const range = searchParams.get('range') || 'month';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'quarter':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get energy readings from database
    const energyReadings = await prisma.energyReading.findMany({
      where: {
        facilityId: facilityId || userId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    // Get baseline data
    const baselineData = await prisma.energyBaseline.findFirst({
      where: {
        facilityId: facilityId || userId
      }
    });

    // Group readings by day and calculate daily totals
    const dailyData = new Map<string, {
      date: string;
      totalKwh: number;
      peakDemand: number;
      readings: number;
    }>();

    energyReadings.forEach(reading => {
      const dateKey = reading.timestamp.toISOString().split('T')[0];
      
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, {
          date: dateKey,
          totalKwh: 0,
          peakDemand: 0,
          readings: 0
        });
      }
      
      const day = dailyData.get(dateKey)!;
      day.totalKwh += reading.powerKw * (reading.intervalMinutes || 15) / 60; // Convert to kWh
      day.peakDemand = Math.max(day.peakDemand, reading.powerKw);
      day.readings++;
    });

    // Fill in missing days and calculate trends
    const data = [];
    const electricityRate = 0.12; // $ per kWh - should come from facility settings
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const dayData = dailyData.get(dateKey);
      
      if (dayData) {
        // Calculate baseline for this day
        let baselineKwh = baselineData?.dailyAverage || 1200;
        
        // Adjust baseline based on day of week and season
        const dayOfWeek = d.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        if (isWeekend) {
          baselineKwh *= 0.85; // 15% lower on weekends
        }
        
        // Seasonal adjustment
        const month = d.getMonth();
        const isWinter = month >= 11 || month <= 2;
        const isSummer = month >= 5 && month <= 8;
        if (isWinter) {
          baselineKwh *= 1.15; // 15% higher in winter (heating)
        } else if (isSummer) {
          baselineKwh *= 1.1; // 10% higher in summer (cooling)
        }
        
        const actualKwh = dayData.totalKwh;
        const savings = Math.max(0, baselineKwh - actualKwh);
        
        data.push({
          date: d.toLocaleDateString(),
          baseline: Math.round(baselineKwh * 100) / 100,
          actual: Math.round(actualKwh * 100) / 100,
          savings: Math.round(savings * 100) / 100,
          cost: Math.round(actualKwh * electricityRate * 100) / 100,
          peakDemand: Math.round(dayData.peakDemand * 100) / 100,
          dataPoints: dayData.readings
        });
      } else {
        // No data for this day - estimate based on nearby days
        const prevDay = data[data.length - 1];
        if (prevDay) {
          data.push({
            date: d.toLocaleDateString(),
            baseline: prevDay.baseline,
            actual: null, // Indicate missing data
            savings: 0,
            cost: null,
            peakDemand: null,
            dataPoints: 0
          });
        }
      }
    }

    // Calculate summary statistics
    const validData = data.filter(d => d.actual !== null);
    const totalBaseline = validData.reduce((sum, d) => sum + d.baseline, 0);
    const totalActual = validData.reduce((sum, d) => sum + (d.actual || 0), 0);
    const totalSavings = validData.reduce((sum, d) => sum + d.savings, 0);
    const totalCost = validData.reduce((sum, d) => sum + (d.cost || 0), 0);
    
    const summary = {
      totalBaseline: Math.round(totalBaseline * 100) / 100,
      totalActual: Math.round(totalActual * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      averageDailySavings: Math.round(totalSavings / validData.length * 100) / 100,
      savingsPercentage: totalBaseline > 0 ? Math.round(totalSavings / totalBaseline * 1000) / 10 : 0,
      dataCompleteness: Math.round(validData.length / data.length * 100)
    };

    return NextResponse.json({
      data,
      summary,
      range,
      facilityId: facilityId || userId
    });

  } catch (error) {
    console.error('Error fetching energy trends:', error);
    
    // Return minimal data on error
    return NextResponse.json({
      data: [],
      summary: {
        totalBaseline: 0,
        totalActual: 0,
        totalSavings: 0,
        totalCost: 0,
        averageDailySavings: 0,
        savingsPercentage: 0,
        dataCompleteness: 0
      },
      error: 'Failed to fetch energy trends'
    });
  }
}