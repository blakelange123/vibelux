import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OrderStatus } from '@/lib/marketplace-types';

// Mock orders - same as parent route
const mockOrders: any[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const order = mockOrders.find(o => o.id === params.id);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if user is buyer or seller
    if (order.buyerId !== userId && order.sellerId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const orderIndex = mockOrders.findIndex(o => o.id === params.id);
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    const order = mockOrders[orderIndex];
    
    // Check permissions
    if (order.buyerId !== userId && order.sellerId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Validate status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_TRANSIT', 'CANCELLED'],
      IN_TRANSIT: ['DELIVERED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: []
    };
    
    if (body.status) {
      const currentStatus = order.status as OrderStatus;
      const newStatus = body.status as OrderStatus;
      
      if (!validTransitions[currentStatus]?.includes(newStatus)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${currentStatus} to ${newStatus}` },
          { status: 400 }
        );
      }
      
      // Only sellers can confirm/ship, only buyers can mark delivered
      if (newStatus === 'CONFIRMED' || newStatus === 'IN_TRANSIT') {
        if (order.sellerId !== userId) {
          return NextResponse.json(
            { error: 'Only sellers can update order status' },
            { status: 403 }
          );
        }
      }
      
      if (newStatus === 'DELIVERED') {
        if (order.buyerId !== userId) {
          return NextResponse.json(
            { error: 'Only buyers can confirm delivery' },
            { status: 403 }
          );
        }
      }
    }
    
    // Update order
    mockOrders[orderIndex] = {
      ...order,
      ...body,
      updatedAt: new Date()
    };
    
    return NextResponse.json({
      order: mockOrders[orderIndex],
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}