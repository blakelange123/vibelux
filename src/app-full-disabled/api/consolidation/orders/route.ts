import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET consolidation orders for user
export async function GET(request: NextRequest) {
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

    const orders = await prisma.consolidationOrder.findMany({
      where: { buyerId: dbUser.id },
      include: {
        consolidationCenter: true,
        sourceOrders: true,
        events: {
          orderBy: { timestamp: 'desc' },
          take: 5
        },
        _count: {
          select: {
            coldChainAlerts: { where: { resolved: false } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consolidation orders' },
      { status: 500 }
    );
  }
}

// POST create consolidation order
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate center exists
    const center = await prisma.consolidationCenter.findUnique({
      where: { id: body.consolidationCenterId }
    });

    if (!center) {
      return NextResponse.json(
        { error: 'Consolidation center not found' },
        { status: 404 }
      );
    }

    // Calculate costs
    const productTotal = body.sourceOrders.reduce((sum: number, order: any) => 
      sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.totalPrice, 0), 0
    );
    
    const consolidationFees = center.consolidationFee * body.sourceOrders.length;
    const estimatedStorageDays = 2;
    const storageFees = center.storageFeePerDay * body.sourceOrders.length * estimatedStorageDays;
    const deliveryFees = body.deliveryFees || 200; // Base delivery fee

    // Create consolidation order
    const order = await prisma.consolidationOrder.create({
      data: {
        buyerId: dbUser.id,
        consolidationCenterId: body.consolidationCenterId,
        deliveryName: body.deliveryName,
        deliveryAddress: body.deliveryAddress,
        deliveryCity: body.deliveryCity,
        deliveryState: body.deliveryState,
        deliveryZipCode: body.deliveryZipCode,
        deliveryInstructions: body.deliveryInstructions,
        requestedDeliveryDate: new Date(body.requestedDeliveryDate),
        deliveryWindowStart: body.deliveryWindowStart || '08:00',
        deliveryWindowEnd: body.deliveryWindowEnd || '17:00',
        tempRequirementMin: body.tempRequirementMin,
        tempRequirementMax: body.tempRequirementMax,
        tempRequirementUnit: body.tempRequirementUnit,
        productTotal,
        consolidationFees,
        storageFees,
        deliveryFees,
        totalAmount: productTotal + consolidationFees + storageFees + deliveryFees,
        sourceOrders: {
          create: body.sourceOrders.map((sourceOrder: any) => ({
            supplierId: sourceOrder.supplierId,
            supplierName: sourceOrder.supplierName,
            pickupLocation: sourceOrder.pickupLocation,
            pickupScheduledDate: new Date(sourceOrder.pickupScheduledDate),
            pickupWindowStart: sourceOrder.pickupWindowStart,
            pickupWindowEnd: sourceOrder.pickupWindowEnd,
            qualityCheckRequired: sourceOrder.qualityCheckRequired || false,
            qualityParameters: sourceOrder.qualityParameters || [],
            items: sourceOrder.items
          }))
        },
        events: {
          create: {
            eventType: 'order-placed',
            description: 'Consolidation order created'
          }
        }
      },
      include: {
        consolidationCenter: true,
        sourceOrders: true,
        events: true
      }
    });

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create consolidation order' },
      { status: 500 }
    );
  }
}