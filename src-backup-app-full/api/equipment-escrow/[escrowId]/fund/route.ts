import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/equipment-escrow/[escrowId]/fund - Fund escrow (simulate for now)
export async function POST(
  request: NextRequest,
  { params }: { params: { escrowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { escrowId } = params;
    const body = await request.json();
    const { transactionHash, amount, fromAddress } = body;

    // Get escrow with match details
    const escrow = await prisma.equipmentEscrow.findUnique({
      where: { id: escrowId },
      include: {
        match: {
          include: {
            offer: {
              include: {
                investor: true
              }
            }
          }
        }
      }
    });

    if (!escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    // Verify the user is the investor
    if (escrow.match.offer.investorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the investor can fund the escrow' },
        { status: 403 }
      );
    }

    // Check escrow status
    if (escrow.status !== 'PENDING' && escrow.status !== 'PARTIALLY_FUNDED') {
      return NextResponse.json(
        { error: 'Escrow is not accepting funds' },
        { status: 400 }
      );
    }

    // Create transaction record
    const transaction = await prisma.escrowTransaction.create({
      data: {
        escrowId,
        transactionHash,
        type: 'FUND',
        amount,
        fromAddress,
        toAddress: escrow.escrowAddress
      }
    });

    // Check if escrow is fully funded
    const totalFunded = await prisma.escrowTransaction.aggregate({
      where: {
        escrowId,
        type: 'FUND'
      },
      _sum: {
        amount: true
      }
    });

    const fundedAmount = totalFunded._sum.amount || 0;
    const isFullyFunded = fundedAmount >= escrow.totalAmount;

    // Update escrow and match status
    const result = await prisma.$transaction(async (tx) => {
      // Update escrow status
      const updatedEscrow = await tx.equipmentEscrow.update({
        where: { id: escrowId },
        data: {
          status: isFullyFunded ? 'FUNDED' : 'PARTIALLY_FUNDED',
          fundedAt: isFullyFunded ? new Date() : undefined
        }
      });

      // If fully funded, update match status
      if (isFullyFunded) {
        await tx.equipmentMatch.update({
          where: { id: escrow.matchId },
          data: {
            status: 'IN_ESCROW',
            escrowedAt: new Date()
          }
        });

        // Update request status
        await tx.equipmentRequest.update({
          where: { id: escrow.match.requestId },
          data: { status: 'IN_ESCROW' }
        });
      }

      return updatedEscrow;
    });

    return NextResponse.json({
      transaction,
      escrow: result,
      fundedAmount,
      remainingAmount: escrow.totalAmount - fundedAmount,
      isFullyFunded,
      message: isFullyFunded 
        ? 'Escrow fully funded! Equipment can now be shipped.'
        : `Escrow partially funded. ${escrow.totalAmount - fundedAmount} remaining.`
    });
  } catch (error) {
    console.error('Error funding escrow:', error);
    return NextResponse.json(
      { error: 'Failed to fund escrow' },
      { status: 500 }
    );
  }
}