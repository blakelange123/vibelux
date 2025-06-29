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
    const facilityId = searchParams.get('facilityId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    let whereClause: any = {};

    if (facilityId) {
      whereClause.facilityId = facilityId;
    }

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    if (category) {
      whereClause.category = category.toUpperCase().replace(/[^A-Z_]/g, '_');
    }

    if (priority) {
      whereClause.priority = priority.toUpperCase();
    }

    const serviceRequests = await prisma.serviceRequest.findMany({
      where: whereClause,
      include: {
        facility: {
          select: { id: true, name: true, address: true, city: true, state: true },
        },
        requester: {
          select: { id: true, name: true, email: true },
        },
        equipment: {
          select: { id: true, name: true, category: true, manufacturer: true, model: true },
        },
        bids: {
          include: {
            serviceProvider: {
              select: { 
                id: true, 
                companyName: true, 
                contactName: true, 
                rating: true, 
                reviewCount: true,
                completedJobs: true,
              },
            },
          },
          orderBy: { amount: 'asc' },
        },
        workOrder: {
          select: { 
            id: true, 
            workOrderNumber: true, 
            status: true, 
            progress: true,
            scheduledDate: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(serviceRequests);
  } catch (error) {
    console.error('Error fetching service requests:', error);
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

    // Set bidding deadline if bidding is enabled
    let biddingDeadline = null;
    if (data.biddingEnabled) {
      biddingDeadline = new Date();
      biddingDeadline.setDate(biddingDeadline.getDate() + (data.biddingDays || 3));
    }

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        facilityId: data.facilityId,
        requesterId: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || 'MEDIUM',
        urgency: data.urgency || 'STANDARD',
        equipmentId: data.equipmentId,
        location: data.location,
        accessInstructions: data.accessInstructions,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        flexibleTiming: data.flexibleTiming !== false,
        emergencyService: data.emergencyService || false,
        budgetRange: data.budgetRange,
        maxBudget: data.maxBudget,
        biddingEnabled: data.biddingEnabled !== false,
        biddingDeadline: biddingDeadline,
        photos: data.photos || [],
        documents: data.documents || [],
      },
      include: {
        facility: {
          select: { id: true, name: true, address: true, city: true, state: true },
        },
        requester: {
          select: { id: true, name: true, email: true },
        },
        equipment: {
          select: { id: true, name: true, category: true, manufacturer: true, model: true },
        },
      },
    });

    // If this is an emergency request, notify nearby emergency service providers
    if (data.emergencyService) {
      // Find emergency service providers in the area
      const facility = await prisma.facility.findUnique({
        where: { id: data.facilityId },
        select: { zipCode: true },
      });

      if (facility?.zipCode) {
        const emergencyProviders = await prisma.serviceProvider.findMany({
          where: {
            status: 'ACTIVE',
            emergencyService: true,
            serviceAreas: {
              some: {
                zipCode: facility.zipCode,
              },
            },
            specializations: {
              some: {
                category: data.category,
              },
            },
          },
          select: { id: true, email: true, companyName: true },
        });

        // TODO: Send emergency notifications to these providers
      }
    }

    return NextResponse.json(serviceRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating service request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}