import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { bidId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bidId } = params;

    // Get the bid with related data
    const bid = await prisma.serviceBid.findUnique({
      where: { id: bidId },
      include: {
        serviceRequest: {
          include: {
            facility: true,
            requester: true,
          },
        },
        serviceProvider: true,
      },
    });

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // Check if user has permission to accept this bid
    const hasPermission = bid.serviceRequest.requesterId === userId ||
      await prisma.facilityUser.findFirst({
        where: {
          facilityId: bid.serviceRequest.facilityId,
          userId: userId,
          role: { in: ['OWNER', 'ADMIN', 'MANAGER'] },
        },
      });

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Not authorized to accept this bid' },
        { status: 403 }
      );
    }

    if (bid.status !== 'SUBMITTED') {
      return NextResponse.json(
        { error: 'Bid cannot be accepted in its current status' },
        { status: 400 }
      );
    }

    if (bid.validUntil && bid.validUntil < new Date()) {
      return NextResponse.json(
        { error: 'Bid has expired' },
        { status: 400 }
      );
    }

    // Start transaction to accept bid and create work order
    const result = await prisma.$transaction(async (tx) => {
      // Accept the bid
      const acceptedBid = await tx.serviceBid.update({
        where: { id: bidId },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });

      // Reject all other bids for this service request
      await tx.serviceBid.updateMany({
        where: {
          serviceRequestId: bid.serviceRequestId,
          id: { not: bidId },
          status: 'SUBMITTED',
        },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReason: 'Another bid was selected',
        },
      });

      // Update service request status
      await tx.serviceRequest.update({
        where: { id: bid.serviceRequestId },
        data: {
          status: 'ASSIGNED',
          assignedTo: bid.serviceProviderId,
          assignedAt: new Date(),
        },
      });

      // Generate work order number
      const workOrderNumber = `WO-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 5).toUpperCase()}`;

      // Create work order
      const workOrder = await tx.workOrder.create({
        data: {
          serviceRequestId: bid.serviceRequestId,
          serviceProviderId: bid.serviceProviderId,
          workOrderNumber: workOrderNumber,
          title: bid.serviceRequest.title,
          description: bid.description,
          scheduledDate: bid.proposedDate || new Date(),
          estimatedDuration: bid.estimatedDuration,
          agreedAmount: bid.amount,
          laborCost: bid.laborCost,
          materialsCost: bid.materialsCost,
          status: 'SCHEDULED',
        },
        include: {
          serviceRequest: {
            include: {
              facility: true,
              equipment: true,
            },
          },
          serviceProvider: true,
        },
      });

      return { acceptedBid, workOrder };
    });

    // TODO: Send notifications to service provider and customer
    // TODO: Send email confirmations
    // TODO: Create calendar events

    return NextResponse.json({
      bid: result.acceptedBid,
      workOrder: result.workOrder,
      message: 'Bid accepted successfully and work order created',
    });
  } catch (error) {
    console.error('Error accepting bid:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}