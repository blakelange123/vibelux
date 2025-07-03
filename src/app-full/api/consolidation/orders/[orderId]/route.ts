import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET specific order details
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const order = await prisma.consolidationOrder.findFirst({
      where: {
        id: params.orderId,
        buyerId: dbUser.id
      },
      include: {
        consolidationCenter: true,
        sourceOrders: true,
        events: {
          orderBy: { timestamp: 'desc' }
        },
        temperatureReadings: {
          orderBy: { timestamp: 'desc' },
          take: 100
        },
        coldChainAlerts: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}

// PATCH update order status/add event
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventType, location, description, temperature, photos } = body;

    // Verify order exists
    const order = await prisma.consolidationOrder.findUnique({
      where: { id: params.orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create event
    const event = await prisma.consolidationEvent.create({
      data: {
        consolidationOrderId: params.orderId,
        eventType,
        location,
        description,
        temperature,
        photos: photos || []
      }
    });

    // Update order status based on event type
    let newStatus = order.status;
    switch (eventType) {
      case 'pickup-scheduled':
        newStatus = 'collecting';
        break;
      case 'consolidation-started':
        newStatus = 'consolidating';
        break;
      case 'shipped':
        newStatus = 'in-transit';
        break;
      case 'delivered':
        newStatus = 'delivered';
        break;
    }

    if (newStatus !== order.status) {
      await prisma.consolidationOrder.update({
        where: { id: params.orderId },
        data: { status: newStatus }
      });
    }

    return NextResponse.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}