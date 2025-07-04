import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Order, OrderStatus } from '@/lib/marketplace-types';

// Mock orders data
const mockOrders: Order[] = [];

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'buyer' or 'seller'
    const status = searchParams.get('status');
    
    let filteredOrders = [...mockOrders];
    
    // Filter by user role
    if (role === 'buyer') {
      filteredOrders = filteredOrders.filter(o => o.buyerId === userId);
    } else if (role === 'seller') {
      filteredOrders = filteredOrders.filter(o => o.sellerId === userId);
    }
    
    // Filter by status
    if (status) {
      filteredOrders = filteredOrders.filter(o => o.status === status as OrderStatus);
    }
    
    // Sort by creation date (newest first)
    filteredOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return NextResponse.json({
      orders: filteredOrders,
      total: filteredOrders.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['sellerId', 'items', 'deliveryMethod'];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Calculate total amount
    const totalAmount = body.items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.pricePerUnit);
    }, 0);
    
    // Create new order
    const newOrder: Order = {
      id: Date.now().toString(),
      buyerId: userId,
      buyer: {
        id: userId,
        email: body.buyerEmail || '',
        name: body.buyerName || '',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      sellerId: body.sellerId,
      seller: {
        id: body.sellerId,
        email: body.sellerEmail || '',
        name: body.sellerName || '',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      items: body.items.map((item: any) => ({
        id: Date.now().toString() + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF,
        orderId: Date.now().toString(),
        listingId: item.listingId,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        totalPrice: item.quantity * item.pricePerUnit
      })),
      status: 'PENDING',
      totalAmount: totalAmount + (body.deliveryFee || 0),
      deliveryMethod: body.deliveryMethod,
      deliveryAddress: body.deliveryAddress,
      deliveryDate: new Date(body.deliveryDate),
      notes: body.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // In a real app, save to database
    mockOrders.push(newOrder);
    
    // Send notification to seller (in real app)
    
    return NextResponse.json({
      order: newOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}