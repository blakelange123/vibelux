import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/equipment-offers - List offers (for investors to see their offers)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    const investorId = searchParams.get('investorId');
    const status = searchParams.get('status');

    const where: any = {};
    
    if (requestId) {
      where.requestId = requestId;
    }
    
    if (investorId) {
      where.investorId = investorId;
    } else {
      // Default to showing user's own offers
      where.investorId = session.user.id;
    }
    
    if (status) {
      where.status = status;
    }

    const offers = await prisma.equipmentOffer.findMany({
      where,
      include: {
        request: {
          include: {
            facility: {
              select: {
                id: true,
                name: true,
                type: true,
                city: true,
                state: true
              }
            }
          }
        },
        investor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        match: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error('Error fetching equipment offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment offers' },
      { status: 500 }
    );
  }
}

// POST /api/equipment-offers - Create new offer on a request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      requestId,
      equipmentDetails,
      condition,
      age,
      hoursUsed,
      maintenanceHistory,
      equipmentValue,
      proposedRevShare,
      termMonths,
      warranty,
      installation,
      maintenance,
      training,
      message,
      highlights
    } = body;

    // Check if request exists and is open
    const equipmentRequest = await prisma.equipmentRequest.findUnique({
      where: { id: requestId },
      include: {
        facility: true
      }
    });

    if (!equipmentRequest) {
      return NextResponse.json(
        { error: 'Equipment request not found' },
        { status: 404 }
      );
    }

    if (!['OPEN', 'REVIEWING_OFFERS'].includes(equipmentRequest.status)) {
      return NextResponse.json(
        { error: 'This request is no longer accepting offers' },
        { status: 400 }
      );
    }

    // Check if investor already has a pending offer on this request
    const existingOffer = await prisma.equipmentOffer.findFirst({
      where: {
        requestId,
        investorId: session.user.id,
        status: 'PENDING'
      }
    });

    if (existingOffer) {
      return NextResponse.json(
        { error: 'You already have a pending offer on this request' },
        { status: 400 }
      );
    }

    // Create the offer
    const offer = await prisma.equipmentOffer.create({
      data: {
        requestId,
        investorId: session.user.id,
        equipmentDetails,
        condition,
        age,
        hoursUsed,
        maintenanceHistory,
        equipmentValue,
        proposedRevShare,
        termMonths,
        warranty,
        installation,
        maintenance,
        training,
        message,
        highlights,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      },
      include: {
        request: {
          include: {
            facility: true
          }
        },
        investor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Update request status if this is the first offer
    const offerCount = await prisma.equipmentOffer.count({
      where: {
        requestId,
        status: 'PENDING'
      }
    });

    if (offerCount === 1) {
      await prisma.equipmentRequest.update({
        where: { id: requestId },
        data: { status: 'REVIEWING_OFFERS' }
      });
    }

    // TODO: Send notification to requester about new offer

    return NextResponse.json(offer);
  } catch (error) {
    console.error('Error creating equipment offer:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment offer' },
      { status: 500 }
    );
  }
}