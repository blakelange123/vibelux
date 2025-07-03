import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET /api/facility/investment - Get all investment opportunities for a facility
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Get facility ID from user's profile
    // const facility = await db.facility.findFirst({
    //   where: { ownerId: userId }
    // });

    // Mock data for now
    const opportunities = [
      {
        id: 'opp-1',
        facilityId: 'facility-1',
        title: 'LED Lighting Upgrade - Phase 2',
        type: 'GAAS',
        status: 'active',
        targetAmount: 1000000,
        raisedAmount: 750000,
        investors: 12,
        createdAt: new Date('2024-03-15'),
        closingDate: new Date('2024-07-15'),
      },
      {
        id: 'opp-2',
        facilityId: 'facility-1',
        title: 'Vertical Farming Expansion',
        type: 'YEP',
        status: 'draft',
        targetAmount: 500000,
        raisedAmount: 0,
        investors: 0,
        createdAt: new Date('2024-05-01'),
        closingDate: null,
      },
    ];

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error('Error fetching facility opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}

// POST /api/facility/investment - Create a new investment opportunity
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'type', 'description', 'targetAmount', 'minimumInvestment'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // TODO: Create opportunity in database
    // const opportunity = await db.investmentOpportunity.create({
    //   data: {
    //     ...body,
    //     facilityId: facility.id,
    //     status: 'draft',
    //     createdBy: userId,
    //   }
    // });

    // Mock response
    const opportunity = {
      id: 'new-opp-id',
      ...body,
      status: 'draft',
      createdAt: new Date(),
      raisedAmount: 0,
      investors: 0,
    };

    return NextResponse.json({ opportunity }, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    );
  }
}

// PUT /api/facility/investment - Update an investment opportunity
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      );
    }

    // TODO: Verify ownership and update in database
    // const opportunity = await db.investmentOpportunity.update({
    //   where: { 
    //     id,
    //     facility: { ownerId: userId }
    //   },
    //   data: updateData
    // });

    // Mock response
    const opportunity = {
      id,
      ...updateData,
      updatedAt: new Date(),
    };

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to update opportunity' },
      { status: 500 }
    );
  }
}