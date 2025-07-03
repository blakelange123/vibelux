import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, this would fetch from real utility APIs and IoT sensors
    const currentHour = new Date().getHours();
    
    // Simulate real-time grid data
    const gridPricing = [
      { time: '12AM', price: 0.08, demand: 65 },
      { time: '1AM', price: 0.07, demand: 60 },
      { time: '2AM', price: 0.06, demand: 55 },
      { time: '3AM', price: 0.06, demand: 50 },
      { time: '4AM', price: 0.07, demand: 52 },
      { time: '5AM', price: 0.08, demand: 58 },
      { time: '6AM', price: 0.10, demand: 70 },
      { time: '7AM', price: 0.12, demand: 80 },
      { time: '8AM', price: 0.14, demand: 85 },
      { time: '9AM', price: 0.15, demand: 88 },
      { time: '10AM', price: 0.16, demand: 90 },
      { time: '11AM', price: 0.18, demand: 92 },
      { time: '12PM', price: 0.20, demand: 95 },
      { time: '1PM', price: 0.22, demand: 98 },
      { time: '2PM', price: 0.24, demand: 100 },
      { time: '3PM', price: 0.23, demand: 98 },
      { time: '4PM', price: 0.21, demand: 95 },
      { time: '5PM', price: 0.19, demand: 92 },
      { time: '6PM', price: 0.17, demand: 88 },
      { time: '7PM', price: 0.15, demand: 85 },
      { time: '8PM', price: 0.13, demand: 80 },
      { time: '9PM', price: 0.11, demand: 75 },
      { time: '10PM', price: 0.10, demand: 70 },
      { time: '11PM', price: 0.09, demand: 65 }
    ];

    const currentPrice = gridPricing[currentHour].price;
    const currentDemand = gridPricing[currentHour].demand;
    const isPeakHour = currentPrice > 0.15;

    // Calculate next price change
    const nextHour = (currentHour + 1) % 24;
    const nextPrice = gridPricing[nextHour].price;
    const priceDirection = nextPrice > currentPrice ? 'up' : nextPrice < currentPrice ? 'down' : 'stable';

    return NextResponse.json({
      currentHour,
      currentPrice,
      currentDemand,
      isPeakHour,
      nextPrice,
      priceDirection,
      gridPricing,
      alerts: [
        isPeakHour && {
          type: 'peak',
          message: 'Peak pricing in effect',
          severity: 'warning'
        },
        currentPrice > 0.20 && {
          type: 'high-price',
          message: 'Extremely high prices - maximum optimization active',
          severity: 'error'
        }
      ].filter(Boolean),
      optimizationActive: true,
      estimatedSavingsRate: isPeakHour ? 0.25 : 0.15
    });
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch real-time data' },
      { status: 500 }
    );
  }
}