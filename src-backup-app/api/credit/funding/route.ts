import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { creditSystem, MilestoneFunding } from '@/lib/credit-building-system';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID required' }, { status: 400 });
    }

    // In production, fetch from database
    // For demo, return mock funding data
    const mockFunding: MilestoneFunding[] = [
      {
        id: 'funding_1',
        facilityId,
        totalAmount: 100000,
        releasedAmount: 25000,
        milestones: [
          {
            id: 'initial',
            name: 'Initial Disbursement',
            description: 'Upfront funding upon approval',
            amount: 25000,
            releasePercentage: 25,
            criteria: {
              type: 'compliance',
              metric: 'baseline_verified',
              target: 1,
              operator: 'equal',
              verificationRequired: true
            },
            status: 'released',
            achievedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            releasedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'performance_1',
            name: '30-Day Performance',
            description: 'First month performance targets',
            amount: 25000,
            releasePercentage: 25,
            criteria: {
              type: 'performance',
              metric: 'energy_reduction',
              target: 5,
              operator: 'greater',
              verificationRequired: true
            },
            status: 'pending'
          },
          {
            id: 'performance_2',
            name: '60-Day Performance',
            description: 'Second month targets',
            amount: 25000,
            releasePercentage: 25,
            criteria: {
              type: 'performance',
              metric: 'yield_improvement',
              target: 5,
              operator: 'greater',
              verificationRequired: true
            },
            status: 'pending'
          },
          {
            id: 'final',
            name: 'Final Milestone',
            description: '90-day combined metrics',
            amount: 25000,
            releasePercentage: 25,
            criteria: {
              type: 'revenue',
              metric: 'revenue_increase',
              target: 10,
              operator: 'greater',
              verificationRequired: true
            },
            status: 'pending'
          }
        ],
        status: 'active',
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        terms: {
          interestRate: 0.12,
          repaymentType: 'revenue-share',
          maxTerm: 36
        }
      }
    ];

    return NextResponse.json(mockFunding);
  } catch (error) {
    console.error('Error fetching funding data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { facilityId, requestedAmount, creditScore } = body;

    if (!facilityId || !requestedAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate amount
    if (requestedAmount < 10000 || requestedAmount > 500000) {
      return NextResponse.json({ 
        error: 'Funding amount must be between $10,000 and $500,000' 
      }, { status: 400 });
    }

    // Create milestone funding
    const funding = creditSystem.createMilestoneFunding(
      facilityId,
      requestedAmount,
      { creditScore: creditScore || 650 }
    );

    // In production, save to database
    return NextResponse.json({
      success: true,
      funding,
      message: 'Funding request created successfully'
    });
  } catch (error) {
    console.error('Error creating funding request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fundingId, milestoneId, currentMetrics, baselineMetrics } = body;

    if (!fundingId || !milestoneId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In production, check milestone achievement and update status
    // For demo, simulate milestone check
    const milestone = {
      id: milestoneId,
      criteria: {
        type: 'performance',
        metric: 'energy_reduction',
        target: 5,
        operator: 'greater'
      }
    };

    const achieved = await creditSystem.checkMilestoneAchievement(
      milestone as any,
      currentMetrics,
      baselineMetrics
    );

    return NextResponse.json({
      success: true,
      achieved,
      milestone: {
        ...milestone,
        status: achieved ? 'achieved' : 'pending',
        achievedAt: achieved ? new Date() : undefined
      }
    });
  } catch (error) {
    console.error('Error checking milestone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}