import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get investor profile
    const investor = await prisma.investor.findUnique({
      where: { userId },
      include: {
        investments: {
          include: {
            facility: {
              include: {
                metrics: {
                  orderBy: { createdAt: 'desc' },
                  take: 1
                }
              }
            },
            payments: true,
            alerts: {
              where: { resolved: false }
            }
          }
        }
      }
    });

    if (!investor) {
      return NextResponse.json(
        { error: 'Investor profile not found' },
        { status: 404 }
      );
    }

    // Calculate portfolio metrics
    const totalInvested = investor.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalReturns = investor.investments.reduce((sum, inv) => {
      const returns = inv.payments
        .filter(p => p.status === 'completed')
        .reduce((pSum, p) => pSum + p.amount, 0);
      return sum + returns;
    }, 0);
    const roi = totalInvested > 0 ? ((totalReturns - totalInvested) / totalInvested) * 100 : 0;

    // Map investments to facilities
    const facilities = investor.investments.map(inv => {
      const latestMetrics = inv.facility.metrics[0];
      const monthlyRevenue = inv.payments
        .filter(p => {
          const paymentDate = new Date(p.dueDate);
          const now = new Date();
          return paymentDate.getMonth() === now.getMonth() && 
                 paymentDate.getFullYear() === now.getFullYear() &&
                 p.status === 'completed';
        })
        .reduce((sum, p) => sum + p.amount, 0);
      
      const facilityReturns = inv.payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      const facilityRoi = inv.amount > 0 ? ((facilityReturns - inv.amount) / inv.amount) * 100 : 0;

      return {
        id: inv.facilityId,
        name: inv.facility.name,
        location: `${inv.facility.city}, ${inv.facility.state}`,
        size: inv.facility.size,
        status: inv.status,
        investmentAmount: inv.amount,
        monthlyRevenue,
        roi: facilityRoi,
        energySavings: latestMetrics?.energySavings || 0,
        yieldImprovement: latestMetrics?.yieldImprovement || 0,
        operationalEfficiency: latestMetrics?.efficiency || 0
      };
    });

    // Calculate revenue sharing data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyPayouts = await prisma.payment.groupBy({
      by: ['dueDate', 'paymentType'],
      where: {
        investment: {
          investorId: investor.id
        },
        status: 'completed',
        dueDate: {
          gte: sixMonthsAgo
        }
      },
      _sum: {
        amount: true
      }
    });

    const payoutsByMonth = monthlyPayouts.reduce((acc: any[], payout) => {
      const month = new Date(payout.dueDate).toISOString().slice(0, 7);
      const existing = acc.find(p => p.month === month);
      
      if (existing) {
        existing.amount += payout._sum.amount || 0;
      } else {
        acc.push({
          month,
          amount: payout._sum.amount || 0,
          source: payout.paymentType === 'service_fee' ? 'ENERGY_SAVINGS' :
                  payout.paymentType === 'yield_share' ? 'YIELD_IMPROVEMENT' :
                  'EFFICIENCY_GAINS'
        });
      }
      
      return acc;
    }, []).sort((a, b) => a.month.localeCompare(b.month));

    const projectedAnnualReturn = payoutsByMonth.length > 0
      ? (payoutsByMonth.reduce((sum, p) => sum + p.amount, 0) / payoutsByMonth.length) * 12
      : 0;

    // Calculate quarterly performance
    const quarterlyData = await prisma.payment.groupBy({
      by: ['dueDate'],
      where: {
        investment: {
          investorId: investor.id
        },
        status: 'completed'
      },
      _sum: {
        amount: true
      }
    });

    const quarterlyReturns = quarterlyData.reduce((acc: any[], payment) => {
      const date = new Date(payment.dueDate);
      const quarter = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
      const existing = acc.find(q => q.quarter === quarter);
      
      if (existing) {
        existing.returns += payment._sum.amount || 0;
      } else {
        acc.push({
          quarter,
          returns: payment._sum.amount || 0,
          energySavings: (payment._sum.amount || 0) * 0.45, // Approximate split
          yieldGains: (payment._sum.amount || 0) * 0.55
        });
      }
      
      return acc;
    }, []).sort((a, b) => b.quarter.localeCompare(a.quarter)).slice(0, 4);

    // Calculate KPIs from facility metrics
    const activeMetrics = investor.investments
      .filter(inv => inv.status === 'active' && inv.facility.metrics.length > 0)
      .map(inv => inv.facility.metrics[0]);

    const kpis = {
      avgEnergyReduction: activeMetrics.length > 0
        ? activeMetrics.reduce((sum, m) => sum + (m.energySavings || 0), 0) / activeMetrics.length
        : 0,
      avgYieldIncrease: activeMetrics.length > 0
        ? activeMetrics.reduce((sum, m) => sum + (m.yieldImprovement || 0), 0) / activeMetrics.length
        : 0,
      avgCostReduction: activeMetrics.length > 0
        ? activeMetrics.reduce((sum, m) => sum + (m.costReduction || 0), 0) / activeMetrics.length
        : 0,
      customerSatisfaction: 4.7 // This would come from a separate satisfaction tracking system
    };

    // Get upcoming opportunities
    const opportunities = await prisma.investmentOpportunity.findMany({
      where: {
        status: 'open',
        minimumInvestment: {
          lte: investor.investmentCapacity || 5000000
        }
      },
      orderBy: {
        projectedROI: 'desc'
      },
      take: 3
    });

    const portfolioData = {
      investor: {
        id: investor.id,
        companyName: investor.companyName,
        investorType: investor.investorType,
        totalInvested,
        totalReturns,
        roi,
        investmentDate: investor.createdAt.toISOString().split('T')[0],
        riskTolerance: investor.riskTolerance
      },
      facilities,
      revenueSharing: {
        totalRevenue: totalReturns,
        monthlyPayouts: payoutsByMonth,
        projectedAnnualReturn
      },
      performance: {
        quarterlyReturns,
        kpis
      },
      upcomingOpportunities: opportunities.map(opp => ({
        id: opp.id,
        facilityName: opp.facilityName,
        location: opp.location,
        investmentRequired: opp.minimumInvestment,
        projectedROI: opp.projectedROI,
        timeline: opp.timeline,
        riskLevel: opp.riskLevel
      }))
    };

    return NextResponse.json(portfolioData);
  } catch (error) {
    console.error('Error in portfolio API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Update investor preferences
    const investor = await prisma.investor.findUnique({
      where: { userId }
    });

    if (!investor) {
      return NextResponse.json(
        { error: 'Investor profile not found' },
        { status: 404 }
      );
    }

    await prisma.investor.update({
      where: { id: investor.id },
      data: {
        riskTolerance: data.riskTolerance,
        investmentCapacity: data.investmentCapacity,
        preferences: {
          notificationPreferences: data.notificationPreferences,
          investmentFocus: data.investmentFocus,
          autoReinvest: data.autoReinvest
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating portfolio settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}