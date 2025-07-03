import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { PerformanceDrivenOptimizer } from '@/lib/design/performance-driven-optimizer';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { facilityId, performanceGoals = {}, constraints = {} } = body;

    // Validate facility access
    const userFacility = await prisma.facilityUser.findFirst({
      where: {
        userId,
        facilityId,
      },
    });

    if (!userFacility) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if facility has recent benchmark data
    const recentBenchmark = await prisma.benchmarkReport.findFirst({
      where: {
        facilityId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!recentBenchmark) {
      return NextResponse.json(
        { 
          error: 'No recent performance data',
          message: 'Generate a benchmark report first to enable performance-driven optimization',
          action: 'generate_benchmark',
        },
        { status: 400 }
      );
    }

    // Initialize optimizer
    const optimizer = new PerformanceDrivenOptimizer(facilityId);
    
    // Run optimization analysis
    const optimization = await optimizer.optimize();

    // Apply user constraints and goals
    const filteredOptimization = applyUserConstraints(optimization, constraints, performanceGoals);

    // Save optimization recommendations
    const optimizationRecord = await prisma.designOptimization.create({
      data: {
        facilityId,
        userId,
        type: 'performance_driven',
        currentMetrics: optimization.currentPerformance,
        targetMetrics: optimization.targetPerformance,
        recommendations: optimization.optimizations,
        projectedImpact: optimization.predictedImpact,
        implementationPlan: optimization.implementationPlan,
        constraints,
        goals: performanceGoals,
        status: 'pending_review',
        confidence: calculateOverallConfidence(optimization.optimizations),
      },
    });

    // Generate summary insights
    const insights = generateOptimizationInsights(optimization);

    return NextResponse.json({
      optimizationId: optimizationRecord.id,
      optimization: filteredOptimization,
      insights,
      metadata: {
        basedOnReport: recentBenchmark.id,
        generatedAt: new Date().toISOString(),
        totalRecommendations: optimization.optimizations.length,
        estimatedROI: optimization.predictedImpact.netROI,
        paybackPeriod: optimization.predictedImpact.paybackPeriod,
      },
    });
  } catch (error) {
    console.error('Error generating performance-driven optimization:', error);
    return NextResponse.json(
      { error: 'Failed to generate optimization' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    // Validate facility access
    const userFacility = await prisma.facilityUser.findFirst({
      where: {
        userId,
        facilityId,
      },
    });

    if (!userFacility) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get recent optimizations
    const optimizations = await prisma.designOptimization.findMany({
      where: {
        facilityId,
        type: 'performance_driven',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        status: true,
        confidence: true,
        projectedImpact: true,
        recommendations: true,
      },
    });

    // Get performance trends
    const performanceTrends = await getPerformanceTrends(facilityId);

    // Get implementation status
    const implementationStatus = await getImplementationStatus(facilityId);

    return NextResponse.json({
      optimizations,
      performanceTrends,
      implementationStatus,
      canOptimize: optimizations.length === 0 || 
        (optimizations[0]?.createdAt && 
         new Date(optimizations[0].createdAt).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error('Error fetching optimization data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch optimization data' },
      { status: 500 }
    );
  }
}

function applyUserConstraints(optimization: any, constraints: any, goals: any) {
  // Filter recommendations based on constraints
  let filteredRecommendations = optimization.optimizations;

  if (constraints.maxInvestment) {
    filteredRecommendations = filteredRecommendations.filter(
      (rec: any) => rec.investmentRequired <= constraints.maxInvestment
    );
  }

  if (constraints.maxPaybackMonths) {
    filteredRecommendations = filteredRecommendations.filter(
      (rec: any) => rec.paybackMonths <= constraints.maxPaybackMonths
    );
  }

  if (constraints.excludeCategories) {
    filteredRecommendations = filteredRecommendations.filter(
      (rec: any) => !constraints.excludeCategories.includes(rec.category)
    );
  }

  if (constraints.difficultyLevel) {
    const allowedDifficulties = {
      'easy_only': ['easy'],
      'easy_medium': ['easy', 'medium'],
      'all': ['easy', 'medium', 'hard'],
    };
    const allowed = allowedDifficulties[constraints.difficultyLevel] || ['easy', 'medium', 'hard'];
    filteredRecommendations = filteredRecommendations.filter(
      (rec: any) => allowed.includes(rec.difficulty)
    );
  }

  // Prioritize based on goals
  if (goals.primaryGoal) {
    const goalWeights = {
      'yield': 'yield',
      'efficiency': 'energy',
      'quality': 'quality',
      'cost': 'cost',
      'roi': 'expectedROI',
    };
    
    const goalMetric = goalWeights[goals.primaryGoal];
    if (goalMetric) {
      filteredRecommendations = filteredRecommendations.sort((a: any, b: any) => {
        if (goalMetric === 'expectedROI') {
          return b[goalMetric] - a[goalMetric];
        } else {
          return (b.performanceImpact[goalMetric] || 0) - (a.performanceImpact[goalMetric] || 0);
        }
      });
    }
  }

  return {
    ...optimization,
    optimizations: filteredRecommendations,
    predictedImpact: recalculateImpact(filteredRecommendations),
  };
}

function recalculateImpact(recommendations: any[]) {
  let totalYieldIncrease = 0;
  let energySavings = 0;
  let qualityImprovement = 0;
  let costReduction = 0;
  let investmentRequired = 0;

  recommendations.forEach(rec => {
    totalYieldIncrease += rec.performanceImpact.yield || 0;
    energySavings += rec.performanceImpact.energy || 0;
    qualityImprovement += rec.performanceImpact.quality || 0;
    costReduction += rec.performanceImpact.cost || 0;
    investmentRequired += rec.investmentRequired;
  });

  const revenueIncrease = 250000 * (totalYieldIncrease / 100); // Estimate
  const netROI = investmentRequired > 0 ? (revenueIncrease - investmentRequired) / investmentRequired : 0;
  const paybackPeriod = revenueIncrease > 0 ? investmentRequired / (revenueIncrease / 12) : 0;

  return {
    totalYieldIncrease,
    energySavings,
    qualityImprovement,
    costReduction,
    revenueIncrease,
    investmentRequired,
    netROI,
    paybackPeriod,
  };
}

function calculateOverallConfidence(recommendations: any[]): number {
  if (recommendations.length === 0) return 0;
  
  const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length;
  return Math.round(avgConfidence * 100) / 100;
}

function generateOptimizationInsights(optimization: any) {
  const insights = [];
  
  // ROI insights
  if (optimization.predictedImpact.netROI > 2) {
    insights.push({
      type: 'success',
      title: 'Excellent ROI Potential',
      message: `Implementing these recommendations could generate ${(optimization.predictedImpact.netROI * 100).toFixed(0)}% ROI`,
      priority: 'high',
    });
  }

  // Quick wins
  const quickWins = optimization.optimizations.filter((rec: any) => 
    rec.difficulty === 'easy' && rec.paybackMonths <= 6
  );
  
  if (quickWins.length > 0) {
    insights.push({
      type: 'opportunity',
      title: 'Quick Wins Available',
      message: `${quickWins.length} low-effort improvements with fast payback`,
      priority: 'medium',
    });
  }

  // High-impact opportunities
  const highImpact = optimization.optimizations.filter((rec: any) => 
    rec.performanceImpact.yield > 15 || rec.expectedROI > 3
  );
  
  if (highImpact.length > 0) {
    insights.push({
      type: 'opportunity',
      title: 'High-Impact Opportunities',
      message: `${highImpact.length} recommendations could significantly boost performance`,
      priority: 'high',
    });
  }

  // Performance gaps
  const current = optimization.currentPerformance;
  const target = optimization.targetPerformance;
  
  if (target.yieldPerSqFt > current.yieldPerSqFt * 1.2) {
    insights.push({
      type: 'info',
      title: 'Significant Yield Potential',
      message: `Your facility could increase yield by ${((target.yieldPerSqFt - current.yieldPerSqFt) / current.yieldPerSqFt * 100).toFixed(0)}%`,
      priority: 'medium',
    });
  }

  return insights;
}

async function getPerformanceTrends(facilityId: string) {
  const benchmarks = await prisma.benchmarkReport.findMany({
    where: { facilityId },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: {
      createdAt: true,
      metrics: true,
    },
  });

  return benchmarks.map(b => ({
    date: b.createdAt,
    yield: b.metrics?.yieldPerSqFt || 0,
    energy: b.metrics?.energyPerGram || 0,
    revenue: b.metrics?.revenuePerSqFt || 0,
    quality: b.metrics?.qualityScore || 0,
  }));
}

async function getImplementationStatus(facilityId: string) {
  // Get recent optimization implementations
  const implementations = await prisma.designOptimization.findMany({
    where: {
      facilityId,
      status: { in: ['implementing', 'completed'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      status: true,
      recommendations: true,
      createdAt: true,
    },
  });

  return {
    active: implementations.filter(i => i.status === 'implementing').length,
    completed: implementations.filter(i => i.status === 'completed').length,
    recentImplementations: implementations,
  };
}