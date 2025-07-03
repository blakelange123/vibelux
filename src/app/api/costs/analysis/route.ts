import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET cost analysis
export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const period = searchParams.get('period') || 'monthly';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    // Get date range
    const now = new Date();
    let dateRange: { start: Date; end: Date };
    
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    } else {
      // Default to current period
      dateRange = getDateRange(period, now);
    }

    // Get expenses by category
    const expensesByCategory = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        facilityId,
        expenseDate: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      _sum: {
        amount: true
      }
    });

    // Get category details
    const categoryIds = expensesByCategory.map(e => e.categoryId);
    const categories = await prisma.costCategory.findMany({
      where: { id: { in: categoryIds } }
    });

    // Create category map
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    // Calculate category breakdowns
    const categoryBreakdown = expensesByCategory.map(e => ({
      categoryId: e.categoryId,
      categoryName: categoryMap.get(e.categoryId) || 'Unknown',
      amount: e._sum.amount || 0
    }));

    // Get production data
    const batches = await prisma.productionBatch.findMany({
      where: {
        facilityId,
        harvestDate: {
          gte: dateRange.start,
          lte: dateRange.end
        },
        status: 'harvested'
      }
    });

    // Calculate totals
    const totalExpenses = categoryBreakdown.reduce((sum, c) => sum + c.amount, 0);
    const totalYield = batches.reduce((sum, b) => sum + (b.dryWeight || 0), 0);
    const avgCostPerGram = totalYield > 0 ? totalExpenses / totalYield : 0;
    const avgCostPerPound = avgCostPerGram * 453.592;

    // Get previous period for comparison
    const previousRange = getPreviousDateRange(period, dateRange.start);
    const previousExpenses = await prisma.expense.aggregate({
      where: {
        facilityId,
        expenseDate: {
          gte: previousRange.start,
          lte: previousRange.end
        }
      },
      _sum: { amount: true }
    });

    const periodComparison = previousExpenses._sum.amount 
      ? ((totalExpenses - previousExpenses._sum.amount) / previousExpenses._sum.amount) * 100
      : 0;

    // Industry benchmarks (mock data - in production, pull from external source)
    const industryBenchmarks = getIndustryBenchmarks(
      batches.map(b => b.cropType).filter((v, i, a) => a.indexOf(v) === i)
    );

    return NextResponse.json({
      success: true,
      data: {
        period: {
          start: dateRange.start,
          end: dateRange.end,
          name: period
        },
        summary: {
          totalExpenses,
          totalYield,
          avgCostPerGram,
          avgCostPerPound,
          batchCount: batches.length
        },
        categoryBreakdown,
        comparison: {
          previousPeriod: previousExpenses._sum.amount || 0,
          percentageChange: periodComparison,
          trend: periodComparison > 0 ? 'increasing' : periodComparison < 0 ? 'decreasing' : 'stable'
        },
        industryBenchmarks,
        batches: batches.map(b => ({
          id: b.id,
          batchNumber: b.batchNumber,
          cropType: b.cropType,
          yield: b.dryWeight,
          costPerGram: b.costPerGram,
          costPerPound: b.costPerPound
        }))
      }
    });
  } catch (error) {
    console.error('Error generating cost analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate cost analysis' },
      { status: 500 }
    );
  }
}

// Helper functions
function getDateRange(period: string, date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  const end = new Date(date);
  
  switch (period) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      start.setDate(date.getDate() - date.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(date.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'quarterly':
      const quarter = Math.floor(date.getMonth() / 3);
      start.setMonth(quarter * 3, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth((quarter + 1) * 3, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'annually':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }
  
  return { start, end };
}

function getPreviousDateRange(period: string, currentStart: Date): { start: Date; end: Date } {
  const start = new Date(currentStart);
  const end = new Date(currentStart);
  end.setDate(end.getDate() - 1);
  
  switch (period) {
    case 'daily':
      start.setDate(start.getDate() - 1);
      break;
    case 'weekly':
      start.setDate(start.getDate() - 7);
      end.setDate(start.getDate() + 6);
      break;
    case 'monthly':
      start.setMonth(start.getMonth() - 1);
      end.setMonth(end.getMonth() - 1);
      end.setDate(new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate());
      break;
    case 'quarterly':
      start.setMonth(start.getMonth() - 3);
      end.setMonth(end.getMonth() - 3);
      break;
    case 'annually':
      start.setFullYear(start.getFullYear() - 1);
      end.setFullYear(end.getFullYear() - 1);
      break;
  }
  
  return { start, end };
}

function getIndustryBenchmarks(cropTypes: string[]): any {
  // Mock industry benchmarks - in production, fetch from external API
  const benchmarks: { [key: string]: { costPerGram: number; costPerPound: number } } = {
    cannabis: { costPerGram: 2.75, costPerPound: 1247.38 },
    lettuce: { costPerGram: 0.013, costPerPound: 5.89 },
    tomatoes: { costPerGram: 0.016, costPerPound: 7.26 },
    herbs: { costPerGram: 0.025, costPerPound: 11.34 },
    strawberries: { costPerGram: 0.018, costPerPound: 8.16 }
  };
  
  return cropTypes.map(crop => ({
    cropType: crop,
    industry: benchmarks[crop.toLowerCase()] || { costPerGram: 0, costPerPound: 0 }
  }));
}