import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { baselineManager } from '@/lib/revenue-sharing-baseline';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const facilityId = searchParams.get('facilityId');
    const investmentId = searchParams.get('investmentId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID required' }, { status: 400 });
    }

    // Get all baselines for the facility
    const baselines = await baselineManager.getFacilityBaselines(facilityId);
    
    // Get the most recent verified baseline
    const activeBaseline = baselines.find(b => b.status === 'verified') || baselines[baselines.length - 1];
    
    if (!activeBaseline) {
      return NextResponse.json({ 
        error: 'No baseline found for facility',
        baselines: []
      }, { status: 404 });
    }

    // Calculate current performance (in production, this would come from real-time data)
    // For now, we'll simulate improvements
    const performanceData = {
      baselineId: activeBaseline.id,
      facilityId,
      investmentId,
      baseline: {
        energy: activeBaseline.metrics.energy.totalKwh,
        yield: activeBaseline.metrics.production.totalYield,
        quality: activeBaseline.metrics.quality.microbialFailRate,
        operationalCost: activeBaseline.metrics.financial.totalOperationalCost
      },
      current: {
        energy: activeBaseline.metrics.energy.totalKwh * 0.8, // 20% reduction
        yield: activeBaseline.metrics.production.totalYield * 1.15, // 15% increase
        quality: Math.max(0, activeBaseline.metrics.quality.microbialFailRate - 2), // 2% improvement
        operationalCost: activeBaseline.metrics.financial.totalOperationalCost * 0.85 // 15% reduction
      },
      improvements: {
        energyReduction: 20, // percentage
        yieldIncrease: 15,
        qualityImprovement: 2,
        costReduction: 15
      },
      revenueSharingMetrics: {
        totalSavings: 0,
        revenueSharePercentage: 20,
        revenueShareAmount: 0,
        paymentStatus: 'pending'
      }
    };

    // Calculate total savings
    const energySavings = (activeBaseline.metrics.energy.totalKwh * 0.2) * activeBaseline.metrics.energy.avgCostPerKwh * 12;
    const yieldValue = (activeBaseline.metrics.production.totalYield * 0.15) * (activeBaseline.metrics.financial.revenuePerPound || 1000);
    const operationalSavings = activeBaseline.metrics.financial.totalOperationalCost * 0.15;
    
    performanceData.revenueSharingMetrics.totalSavings = energySavings + yieldValue + operationalSavings;
    performanceData.revenueSharingMetrics.revenueShareAmount = performanceData.revenueSharingMetrics.totalSavings * 0.2;

    // Extended metrics summary for investors
    const extendedMetrics = {
      compliance: {
        violationsReduction: activeBaseline.metrics.compliance ? 
          Math.max(0, activeBaseline.metrics.compliance.complianceViolationsPerYear - 2) : 0,
        testingCostReduction: activeBaseline.metrics.compliance ? 
          activeBaseline.metrics.compliance.testingCostsPerMonth * 0.1 * 12 : 0
      },
      pestDisease: {
        incidentsReduction: activeBaseline.metrics.pestDisease ?
          Math.max(0, activeBaseline.metrics.pestDisease.pestIncidentsPerMonth - 2) * 12 : 0,
        cropLossPrevented: activeBaseline.metrics.pestDisease ?
          activeBaseline.metrics.pestDisease.cropLossFromPestsDiseasePercent * 0.5 : 0
      },
      technology: {
        automationHoursSaved: activeBaseline.metrics.technology ?
          activeBaseline.metrics.technology.manualDataTransferHours * 0.8 * 12 : 0,
        downtimeReduction: activeBaseline.metrics.technology ?
          activeBaseline.metrics.technology.systemDowntimeHours * 0.7 : 0
      },
      spaceUtilization: {
        utilizationImprovement: activeBaseline.metrics.spaceUtilization ?
          Math.min(95, activeBaseline.metrics.spaceUtilization.utilizationPercent + 10) : 0,
        additionalProductiveSpace: activeBaseline.metrics.spaceUtilization ?
          activeBaseline.metrics.spaceUtilization.productiveSquareFeet * 0.1 : 0
      }
    };

    return NextResponse.json({
      success: true,
      performanceData,
      extendedMetrics,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching revenue sharing performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}

// Calculate savings endpoint
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { baselineId, currentMetrics, periodStart, periodEnd, revenueSharePercentage } = body;

    if (!baselineId || !currentMetrics) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const savings = await baselineManager.calculateSavings(
      baselineId,
      currentMetrics,
      new Date(periodStart),
      new Date(periodEnd),
      revenueSharePercentage || 0.20
    );

    // In production, this would also:
    // 1. Store the savings calculation
    // 2. Update investment performance records
    // 3. Create payment records if applicable
    // 4. Notify relevant parties

    return NextResponse.json({
      success: true,
      savings,
      calculatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating savings:', error);
    return NextResponse.json(
      { error: 'Failed to calculate savings' },
      { status: 500 }
    );
  }
}