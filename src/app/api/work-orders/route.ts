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
    const serviceProviderId = searchParams.get('serviceProviderId');
    const status = searchParams.get('status');
    const scheduled = searchParams.get('scheduled') === 'true';

    let whereClause: any = {};

    if (facilityId) {
      whereClause.serviceRequest = {
        facilityId: facilityId,
      };
    }

    if (serviceProviderId) {
      whereClause.serviceProviderId = serviceProviderId;
    }

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    if (scheduled) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      whereClause.scheduledDate = {
        gte: new Date(),
        lte: tomorrow,
      };
    }

    const workOrders = await prisma.workOrder.findMany({
      where: whereClause,
      include: {
        serviceRequest: {
          include: {
            facility: {
              select: { id: true, name: true, address: true, city: true, state: true },
            },
            equipment: {
              select: { id: true, name: true, category: true, manufacturer: true, model: true },
            },
            requester: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        serviceProvider: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
            email: true,
            rating: true,
          },
        },
        timeEntries: {
          orderBy: { date: 'desc' },
        },
        expenses: {
          orderBy: { createdAt: 'desc' },
        },
        review: {
          select: {
            id: true,
            overallRating: true,
            comment: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(workOrders);
  } catch (error) {
    console.error('Error fetching work orders:', error);
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

    // Generate work order number
    const workOrderNumber = `WO-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 5).toUpperCase()}`;

    const workOrder = await prisma.workOrder.create({
      data: {
        serviceRequestId: data.serviceRequestId,
        serviceProviderId: data.serviceProviderId,
        workOrderNumber: workOrderNumber,
        title: data.title,
        description: data.description,
        scheduledDate: new Date(data.scheduledDate),
        estimatedDuration: data.estimatedDuration,
        agreedAmount: data.agreedAmount,
        laborCost: data.laborCost,
        materialsCost: data.materialsCost,
      },
      include: {
        serviceRequest: {
          include: {
            facility: {
              select: { id: true, name: true, address: true, city: true, state: true },
            },
            equipment: {
              select: { id: true, name: true, category: true, manufacturer: true, model: true },
            },
          },
        },
        serviceProvider: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(workOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating work order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}