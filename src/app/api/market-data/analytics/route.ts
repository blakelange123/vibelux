import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const cropType = searchParams.get('cropType');
    const region = searchParams.get('region');
    const period = searchParams.get('period') || '30'; // days
    const groupBy = searchParams.get('groupBy') || 'day';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Build base query
    const where: any = {
      saleDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (cropType) where.cropType = cropType;

    // Get user's accessible facilities
    const userFacilities = await prisma.facilityUser.findMany({
      where: { userId },
      include: {
        facility: {
          select: {
            id: true,
            state: true,
            city: true,
          },
        },
      },
    });

    const facilityIds = userFacilities.map(f => f.facilityId);
    
    if (region) {
      // Filter facilities by region
      const regionalFacilityIds = userFacilities
        .filter(f => f.facility.state === region || f.facility.city?.includes(region))
        .map(f => f.facilityId);
      
      where.facilityId = { in: regionalFacilityIds };
    } else {
      where.facilityId = { in: facilityIds };
    }

    // Fetch market data
    const marketData = await prisma.marketData.findMany({
      where,
      select: {
        pricePerUnit: true,
        quantity: true,
        quality: true,
        productCategory: true,
        saleDate: true,
        cropType: true,
        buyerType: true,
        facility: {
          select: {
            state: true,
            city: true,
          },
        },
      },
      orderBy: { saleDate: 'asc' },
    });

    // Calculate analytics
    const analytics = {
      priceHistory: calculatePriceHistory(marketData, groupBy),
      volumeByQuality: calculateVolumeByQuality(marketData),
      priceByQuality: calculatePriceByQuality(marketData),
      volumeByCategory: calculateVolumeByCategory(marketData),
      buyerTypeDistribution: calculateBuyerDistribution(marketData),
      regionalComparison: calculateRegionalComparison(marketData),
      marketTrends: calculateMarketTrends(marketData),
    };

    // Calculate summary statistics
    const summary = {
      averagePrice: marketData.reduce((sum, d) => sum + d.pricePerUnit, 0) / marketData.length || 0,
      totalVolume: marketData.reduce((sum, d) => sum + d.quantity, 0),
      dataPoints: marketData.length,
      dateRange: { startDate, endDate },
    };

    return NextResponse.json({
      analytics,
      summary,
    });
  } catch (error) {
    console.error('Error calculating market analytics:', error);
    return NextResponse.json(
      { error: 'Failed to calculate analytics' },
      { status: 500 }
    );
  }
}

function calculatePriceHistory(data: any[], groupBy: string) {
  const grouped = new Map<string, { prices: number[], volume: number }>();

  data.forEach(d => {
    const date = new Date(d.saleDate);
    let key: string;

    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const week = Math.floor(date.getDate() / 7);
        key = `${date.getFullYear()}-W${week}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped.has(key)) {
      grouped.set(key, { prices: [], volume: 0 });
    }

    const group = grouped.get(key)!;
    group.prices.push(d.pricePerUnit);
    group.volume += d.quantity;
  });

  return Array.from(grouped.entries()).map(([date, data]) => ({
    date,
    averagePrice: data.prices.reduce((a, b) => a + b, 0) / data.prices.length,
    minPrice: Math.min(...data.prices),
    maxPrice: Math.max(...data.prices),
    volume: data.volume,
    transactions: data.prices.length,
  }));
}

function calculateVolumeByQuality(data: any[]) {
  const byQuality = new Map<string, number>();

  data.forEach(d => {
    const current = byQuality.get(d.quality) || 0;
    byQuality.set(d.quality, current + d.quantity);
  });

  return Array.from(byQuality.entries())
    .map(([quality, volume]) => ({ quality, volume }))
    .sort((a, b) => a.quality.localeCompare(b.quality));
}

function calculatePriceByQuality(data: any[]) {
  const byQuality = new Map<string, number[]>();

  data.forEach(d => {
    if (!byQuality.has(d.quality)) {
      byQuality.set(d.quality, []);
    }
    byQuality.get(d.quality)!.push(d.pricePerUnit);
  });

  return Array.from(byQuality.entries())
    .map(([quality, prices]) => ({
      quality,
      averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      sampleSize: prices.length,
    }))
    .sort((a, b) => a.quality.localeCompare(b.quality));
}

function calculateVolumeByCategory(data: any[]) {
  const byCategory = new Map<string, number>();

  data.forEach(d => {
    const current = byCategory.get(d.productCategory) || 0;
    byCategory.set(d.productCategory, current + d.quantity);
  });

  return Array.from(byCategory.entries())
    .map(([category, volume]) => ({ category, volume }))
    .sort((a, b) => b.volume - a.volume);
}

function calculateBuyerDistribution(data: any[]) {
  const byBuyer = new Map<string, { count: number, volume: number }>();

  data.forEach(d => {
    const buyerType = d.buyerType || 'unknown';
    if (!byBuyer.has(buyerType)) {
      byBuyer.set(buyerType, { count: 0, volume: 0 });
    }
    const buyer = byBuyer.get(buyerType)!;
    buyer.count++;
    buyer.volume += d.quantity;
  });

  return Array.from(byBuyer.entries())
    .map(([type, data]) => ({
      buyerType: type,
      transactions: data.count,
      volume: data.volume,
    }))
    .sort((a, b) => b.volume - a.volume);
}

function calculateRegionalComparison(data: any[]) {
  const byRegion = new Map<string, { prices: number[], volume: number }>();

  data.forEach(d => {
    const region = d.facility.state || 'Unknown';
    if (!byRegion.has(region)) {
      byRegion.set(region, { prices: [], volume: 0 });
    }
    const regional = byRegion.get(region)!;
    regional.prices.push(d.pricePerUnit);
    regional.volume += d.quantity;
  });

  return Array.from(byRegion.entries())
    .map(([region, data]) => ({
      region,
      averagePrice: data.prices.reduce((a, b) => a + b, 0) / data.prices.length,
      volume: data.volume,
      transactions: data.prices.length,
    }))
    .sort((a, b) => b.volume - a.volume);
}

function calculateMarketTrends(data: any[]) {
  if (data.length < 2) return null;

  // Sort by date
  const sorted = [...data].sort((a, b) => 
    new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
  );

  // Calculate price trend
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

  const firstAvg = firstHalf.reduce((sum, d) => sum + d.pricePerUnit, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.pricePerUnit, 0) / secondHalf.length;

  const priceChange = ((secondAvg - firstAvg) / firstAvg) * 100;

  // Calculate volume trend
  const firstVolume = firstHalf.reduce((sum, d) => sum + d.quantity, 0);
  const secondVolume = secondHalf.reduce((sum, d) => sum + d.quantity, 0);
  const volumeChange = ((secondVolume - firstVolume) / firstVolume) * 100;

  return {
    priceChange: Math.round(priceChange * 100) / 100,
    volumeChange: Math.round(volumeChange * 100) / 100,
    priceTrend: priceChange > 0 ? 'increasing' : priceChange < 0 ? 'decreasing' : 'stable',
    volumeTrend: volumeChange > 0 ? 'increasing' : volumeChange < 0 ? 'decreasing' : 'stable',
  };
}