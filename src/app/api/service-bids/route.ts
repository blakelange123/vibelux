import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceRequestId = searchParams.get('serviceRequestId');
    const serviceProviderId = searchParams.get('serviceProviderId');
    const status = searchParams.get('status');

    let whereClause: any = {};

    if (serviceRequestId) {
      whereClause.serviceRequestId = serviceRequestId;
    }

    if (serviceProviderId) {
      whereClause.serviceProviderId = serviceProviderId;
    }

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const bids = await prisma.serviceBid.findMany({
      where: whereClause,
      include: {
        serviceProvider: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
            email: true,
            rating: true,
            reviewCount: true,
            completedJobs: true,
            verified: true,
            certifications: {
              where: { verified: true },
              select: {
                certificationType: true,
                certificationBody: true,
                expirationDate: true,
              },
            },
            specializations: {
              select: {
                category: true,
                skillLevel: true,
                experienceYears: true,
              },
            },
          },
        },
        serviceRequest: {
          select: {
            id: true,
            title: true,
            category: true,
            priority: true,
            facilityId: true,
            biddingDeadline: true,
            maxBudget: true,
          },
        },
      },
      orderBy: [
        { amount: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json(bids);
  } catch (error) {
    console.error('Error fetching service bids:', error);
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

    const data = await request.json();

    // Check if service provider exists and is verified
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { id: data.serviceProviderId },
    });

    if (!serviceProvider || serviceProvider.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Service provider not found or not active' },
        { status: 400 }
      );
    }

    // Check if service request exists and is still accepting bids
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: data.serviceRequestId },
    });

    if (!serviceRequest) {
      return NextResponse.json(
        { error: 'Service request not found' },
        { status: 404 }
      );
    }

    if (!serviceRequest.biddingEnabled) {
      return NextResponse.json(
        { error: 'Bidding is not enabled for this request' },
        { status: 400 }
      );
    }

    if (serviceRequest.biddingDeadline && serviceRequest.biddingDeadline < new Date()) {
      return NextResponse.json(
        { error: 'Bidding deadline has passed' },
        { status: 400 }
      );
    }

    if (serviceRequest.status !== 'OPEN' && serviceRequest.status !== 'BIDDING') {
      return NextResponse.json(
        { error: 'Service request is no longer accepting bids' },
        { status: 400 }
      );
    }

    // Check if service provider already submitted a bid
    const existingBid = await prisma.serviceBid.findFirst({
      where: {
        serviceRequestId: data.serviceRequestId,
        serviceProviderId: data.serviceProviderId,
      },
    });

    if (existingBid) {
      return NextResponse.json(
        { error: 'Service provider has already submitted a bid' },
        { status: 400 }
      );
    }

    // Set validity period (default 7 days)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (data.validityDays || 7));

    const bid = await prisma.serviceBid.create({
      data: {
        serviceRequestId: data.serviceRequestId,
        serviceProviderId: data.serviceProviderId,
        amount: data.amount,
        description: data.description,
        estimatedDuration: data.estimatedDuration,
        proposedDate: data.proposedDate ? new Date(data.proposedDate) : null,
        warrantyOffered: data.warrantyOffered || false,
        warrantyTerms: data.warrantyTerms,
        paymentTerms: data.paymentTerms,
        laborCost: data.laborCost,
        materialsCost: data.materialsCost,
        travelCost: data.travelCost,
        breakdown: data.breakdown,
        validUntil: validUntil,
        questions: data.questions,
      },
      include: {
        serviceProvider: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
            email: true,
            rating: true,
            reviewCount: true,
            completedJobs: true,
            verified: true,
          },
        },
        serviceRequest: {
          select: {
            id: true,
            title: true,
            category: true,
            priority: true,
          },
        },
      },
    });

    // Update service request status to BIDDING if it was OPEN
    if (serviceRequest.status === 'OPEN') {
      await prisma.serviceRequest.update({
        where: { id: data.serviceRequestId },
        data: { status: 'BIDDING' },
      });
    }

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error('Error creating service bid:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}