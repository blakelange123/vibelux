import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/equipment-verification/[matchId] - Get verification status
export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId } = params;

    const verification = await prisma.equipmentVerification.findUnique({
      where: { matchId },
      include: {
        match: {
          include: {
            request: {
              select: {
                requesterId: true
              }
            },
            offer: {
              select: {
                investorId: true
              }
            }
          }
        }
      }
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    // Check if user is involved in this match
    const isRequester = verification.match.request.requesterId === session.user.id;
    const isInvestor = verification.match.offer.investorId === session.user.id;

    if (!isRequester && !isInvestor) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(verification);
  } catch (error) {
    console.error('Error fetching verification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification' },
      { status: 500 }
    );
  }
}

// PATCH /api/equipment-verification/[matchId] - Update verification steps
export async function PATCH(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId } = params;
    const body = await request.json();
    const { step, verified, evidence } = body;

    // Get match to verify access
    const match = await prisma.equipmentMatch.findUnique({
      where: { id: matchId },
      include: {
        request: {
          select: {
            requesterId: true
          }
        },
        escrow: true
      }
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Only requester can verify
    if (match.request.requesterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the requester can verify equipment' },
        { status: 403 }
      );
    }

    // Create or update verification
    let verification = await prisma.equipmentVerification.findUnique({
      where: { matchId }
    });

    const updateData: any = {};
    
    // Update specific verification step
    switch (step) {
      case 'received':
        updateData.equipmentReceived = verified;
        if (verified && evidence?.photos) {
          updateData.photos = evidence.photos;
        }
        break;
      case 'specs':
        updateData.specsMet = verified;
        if (evidence?.documents) {
          updateData.documents = evidence.documents;
        }
        break;
      case 'installed':
        updateData.installed = verified;
        break;
      case 'operational':
        updateData.operational = verified;
        if (evidence?.sensorData) {
          updateData.sensorData = evidence.sensorData;
        }
        break;
      case 'iot':
        updateData.iotConnected = verified;
        break;
      case 'performance':
        updateData.performanceVerified = verified;
        break;
    }

    if (evidence?.notes) {
      updateData.notes = evidence.notes;
    }

    // Create or update verification record
    if (!verification) {
      verification = await prisma.equipmentVerification.create({
        data: {
          matchId,
          ...updateData,
          verifiedBy: session.user.id
        }
      });
    } else {
      verification = await prisma.equipmentVerification.update({
        where: { matchId },
        data: {
          ...updateData,
          verifiedBy: session.user.id
        }
      });
    }

    // Check if all steps are complete
    const allStepsComplete = 
      verification.equipmentReceived &&
      verification.specsMet &&
      verification.installed &&
      verification.operational &&
      verification.iotConnected &&
      verification.performanceVerified;

    // If all verified, release escrow and activate agreement
    if (allStepsComplete && !verification.verifiedAt) {
      await prisma.$transaction(async (tx) => {
        // Update verification
        await tx.equipmentVerification.update({
          where: { matchId },
          data: {
            verifiedAt: new Date()
          }
        });

        // Update escrow release conditions
        await tx.equipmentEscrow.update({
          where: { matchId },
          data: {
            conditionsMet: true,
            releaseConditions: {
              equipmentDelivered: true,
              equipmentVerified: true,
              installationComplete: true,
              performanceVerified: true
            }
          }
        });

        // Update match status
        await tx.equipmentMatch.update({
          where: { id: matchId },
          data: {
            status: 'ACTIVE',
            activatedAt: new Date()
          }
        });

        // Update request status
        await tx.equipmentRequest.update({
          where: { id: match.requestId },
          data: { status: 'ACTIVE' }
        });

        // TODO: Trigger escrow release to investor
        // TODO: Activate revenue sharing smart contract
      });
    }

    return NextResponse.json({
      verification,
      allStepsComplete,
      message: allStepsComplete 
        ? 'All verifications complete! Equipment is now active.'
        : `Verification step '${step}' updated.`
    });
  } catch (error) {
    console.error('Error updating verification:', error);
    return NextResponse.json(
      { error: 'Failed to update verification' },
      { status: 500 }
    );
  }
}