import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/equipment-offers/[offerId]/accept - Accept an offer and create a match
export async function POST(
  request: NextRequest,
  { params }: { params: { offerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offerId } = params;
    const body = await request.json();
    const { finalTerms } = body; // Optional negotiated final terms

    // Get offer with request details
    const offer = await prisma.equipmentOffer.findUnique({
      where: { id: offerId },
      include: {
        request: {
          include: {
            facility: true,
            requester: true
          }
        }
      }
    });

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Verify the user is the requester
    if (offer.request.requesterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the requester can accept offers' },
        { status: 403 }
      );
    }

    // Check offer status
    if (offer.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This offer is no longer available' },
        { status: 400 }
      );
    }

    // Check request status
    if (!['OPEN', 'REVIEWING_OFFERS'].includes(offer.request.status)) {
      return NextResponse.json(
        { error: 'This request is no longer accepting offers' },
        { status: 400 }
      );
    }

    // Use final terms if provided, otherwise use offer terms
    const finalRevShare = finalTerms?.revShare || offer.proposedRevShare;
    const finalTermMonths = finalTerms?.termMonths || offer.termMonths;
    const finalValue = finalTerms?.value || offer.equipmentValue;

    // Calculate platform fee (15% of equipment value)
    const platformFee = finalValue * 0.15;

    // Start transaction to create match and update statuses
    const result = await prisma.$transaction(async (tx) => {
      // Create the match
      const match = await tx.equipmentMatch.create({
        data: {
          requestId: offer.requestId,
          offerId: offer.id,
          finalRevShare,
          finalTermMonths,
          finalValue,
          platformFee,
          status: 'PENDING_ESCROW'
        }
      });

      // Update offer status
      await tx.equipmentOffer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED' }
      });

      // Reject all other pending offers
      await tx.equipmentOffer.updateMany({
        where: {
          requestId: offer.requestId,
          id: { not: offerId },
          status: 'PENDING'
        },
        data: { status: 'REJECTED' }
      });

      // Update request status
      await tx.equipmentRequest.update({
        where: { id: offer.requestId },
        data: { status: 'MATCHED' }
      });

      // Create initial escrow record
      const escrow = await tx.equipmentEscrow.create({
        data: {
          matchId: match.id,
          totalAmount: finalValue + platformFee,
          platformFeeAmount: platformFee,
          releaseConditions: {
            equipmentDelivered: false,
            equipmentVerified: false,
            installationComplete: false,
            performanceVerified: false
          },
          status: 'PENDING'
        }
      });

      return { match, escrow };
    });

    // TODO: 
    // 1. Send notifications to both parties
    // 2. Generate agreement documents
    // 3. Create smart contract for escrow

    return NextResponse.json({
      match: result.match,
      escrow: result.escrow,
      platformFee,
      nextSteps: [
        'Fund escrow account',
        'Ship equipment to facility',
        'Complete installation',
        'Verify performance',
        'Activate revenue sharing'
      ]
    });
  } catch (error) {
    console.error('Error accepting equipment offer:', error);
    return NextResponse.json(
      { error: 'Failed to accept equipment offer' },
      { status: 500 }
    );
  }
}