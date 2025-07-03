import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { creditSystem, RegionalPool } from '@/lib/credit-building-system';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'Pacific Northwest';

    // In production, fetch from database
    // For demo, return mock pools data
    const mockPools: RegionalPool[] = [
      {
        id: 'pool_1',
        name: 'Pacific Northwest Growers Fund',
        region: 'Pacific Northwest',
        totalCapital: 2500000,
        availableCapital: 875000,
        participants: [
          { userId: 'user_1', investmentAmount: 50000, votingPower: 2, joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), earnings: 12500 },
          { userId: 'user_2', investmentAmount: 100000, votingPower: 4, joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), earnings: 18000 },
          { userId: 'user_3', investmentAmount: 75000, votingPower: 3, joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), earnings: 9500 },
          { userId: 'user_4', investmentAmount: 150000, votingPower: 6, joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), earnings: 15000 }
        ],
        investments: [
          {
            facilityId: 'facility_1',
            amount: 250000,
            approvalVotes: 75,
            status: 'active',
            proposedBy: 'user_2',
            terms: { interestRate: 0.12, duration: 24 }
          },
          {
            facilityId: 'facility_2',
            amount: 175000,
            approvalVotes: 82,
            status: 'active',
            proposedBy: 'user_1',
            terms: { interestRate: 0.10, duration: 18 }
          }
        ],
        rules: {
          minInvestment: 10000,
          maxInvestment: 250000,
          votingThreshold: 0.51,
          managementFee: 0.02
        },
        performance: {
          avgROI: 18.5,
          defaultRate: 2.1,
          activeFacilities: 8
        }
      },
      {
        id: 'pool_2',
        name: 'West Coast Cannabis Collective',
        region: 'Pacific Northwest',
        totalCapital: 1500000,
        availableCapital: 450000,
        participants: [
          { userId: 'user_5', investmentAmount: 25000, votingPower: 2, joinedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), earnings: 4500 },
          { userId: 'user_6', investmentAmount: 50000, votingPower: 3, joinedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), earnings: 6800 }
        ],
        investments: [
          {
            facilityId: 'facility_3',
            amount: 150000,
            approvalVotes: 68,
            status: 'proposed',
            proposedBy: 'user_5',
            terms: { interestRate: 0.14, duration: 24 }
          }
        ],
        rules: {
          minInvestment: 5000,
          maxInvestment: 100000,
          votingThreshold: 0.66,
          managementFee: 0.025
        },
        performance: {
          avgROI: 22.3,
          defaultRate: 3.5,
          activeFacilities: 5
        }
      }
    ];

    return NextResponse.json(mockPools);
  } catch (error) {
    console.error('Error fetching pools data:', error);
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
    const { action, poolId, investmentAmount, poolData } = body;

    switch (action) {
      case 'create':
        if (!poolData || !poolData.name || !poolData.region || !poolData.initialCapital) {
          return NextResponse.json({ error: 'Missing pool data' }, { status: 400 });
        }

        // Validate initial capital
        if (poolData.initialCapital < 25000) {
          return NextResponse.json({ 
            error: 'Minimum initial capital is $25,000' 
          }, { status: 400 });
        }

        // Create new pool
        const newPool = creditSystem.createRegionalPool(
          poolData.name,
          poolData.region,
          poolData.initialCapital,
          {
            minInvestment: poolData.minInvestment || 5000,
            maxInvestment: poolData.maxInvestment || 100000,
            votingThreshold: poolData.votingThreshold || 0.51,
            managementFee: poolData.managementFee || 0.02
          }
        );

        // Add creator as first participant
        newPool.participants.push({
          userId,
          investmentAmount: poolData.initialCapital,
          votingPower: Math.floor(poolData.initialCapital / 25000),
          joinedAt: new Date(),
          earnings: 0
        });

        return NextResponse.json({
          success: true,
          pool: newPool,
          message: 'Pool created successfully'
        });

      case 'join':
        if (!poolId || !investmentAmount) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate investment amount (would normally check against pool rules)
        if (investmentAmount < 5000) {
          return NextResponse.json({ 
            error: 'Minimum investment is $5,000' 
          }, { status: 400 });
        }

        // In production, add participant to pool in database
        const newParticipant = {
          userId,
          investmentAmount,
          votingPower: Math.floor(investmentAmount / 25000),
          joinedAt: new Date(),
          earnings: 0
        };

        return NextResponse.json({
          success: true,
          participant: newParticipant,
          message: 'Successfully joined pool'
        });

      case 'vote':
        const { investmentId, vote } = body;
        
        if (!poolId || !investmentId || !vote) {
          return NextResponse.json({ error: 'Missing vote data' }, { status: 400 });
        }

        // In production, record vote and update approval percentage
        return NextResponse.json({
          success: true,
          message: 'Vote recorded successfully'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing pool request:', error);
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
    const { poolId, facilityId, investmentAmount, terms } = body;

    if (!poolId || !facilityId || !investmentAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In production, create investment proposal
    const proposal = {
      facilityId,
      amount: investmentAmount,
      approvalVotes: 0,
      status: 'proposed',
      proposedBy: userId,
      terms: terms || { interestRate: 0.12, duration: 24 }
    };

    return NextResponse.json({
      success: true,
      proposal,
      message: 'Investment proposal created successfully'
    });
  } catch (error) {
    console.error('Error creating investment proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}