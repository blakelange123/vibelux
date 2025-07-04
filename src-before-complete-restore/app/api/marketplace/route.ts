import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { marketplaceDB } from '@/lib/marketplace/marketplace-db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const resource = searchParams.get('resource');

    switch (resource) {
      case 'products':
        const products = await marketplaceDB.searchProducts({
          category: searchParams.get('category') || undefined,
          vendorId: searchParams.get('vendorId') || undefined,
          search: searchParams.get('search') || undefined,
          minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
          maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
          availability: searchParams.get('availability') || undefined
        });
        return NextResponse.json({ products });

      case 'vendors':
        const vendors = await marketplaceDB.searchVendors({
          type: searchParams.get('type') || undefined,
          specialty: searchParams.get('specialty') || undefined,
          minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
          verified: searchParams.get('verified') === 'true' ? true : undefined
        });
        return NextResponse.json({ vendors });

      case 'genetics':
        const genetics = await marketplaceDB.searchGenetics({
          type: searchParams.get('type') || undefined,
          thcMin: searchParams.get('thcMin') ? Number(searchParams.get('thcMin')) : undefined,
          cbdMin: searchParams.get('cbdMin') ? Number(searchParams.get('cbdMin')) : undefined,
          floweringTimeMax: searchParams.get('floweringTimeMax') ? Number(searchParams.get('floweringTimeMax')) : undefined,
          licensingType: searchParams.get('licensingType') || undefined
        });
        return NextResponse.json({ genetics });

      case 'stats':
        const stats = await marketplaceDB.getMarketplaceStats();
        return NextResponse.json({ stats });

      case 'recommendations':
        const recommendations = await marketplaceDB.getRecommendedProducts(
          userId,
          searchParams.get('category') || undefined
        );
        return NextResponse.json({ recommendations });

      default:
        return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
    }
  } catch (error) {
    console.error('Marketplace API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process marketplace request' },
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

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'registerVendor':
        const vendor = await marketplaceDB.registerVendor(data);
        return NextResponse.json({ success: true, vendor });

      case 'listProduct':
        const product = await marketplaceDB.listProduct(data);
        return NextResponse.json({ success: true, product });

      case 'listGenetics':
        const geneticsListing = await marketplaceDB.listGenetics(data);
        return NextResponse.json({ success: true, genetics: geneticsListing });

      case 'createOrder':
        // Calculate platform fee (15%)
        const subtotal = data.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const platformFee = subtotal * 0.15;
        
        const order = await marketplaceDB.createPurchaseOrder(
          userId,
          data.vendorId,
          data.items
        );
        
        // Add platform fee information
        const orderWithFee = {
          ...order,
          platformFee,
          vendorPayout: subtotal - platformFee,
          commissionRate: 0.15
        };
        
        return NextResponse.json({ success: true, order: orderWithFee });

      case 'updateOrderStatus':
        await marketplaceDB.updatePurchaseOrderStatus(data.orderId, data.status);
        return NextResponse.json({ success: true });

      case 'createRFQ':
        const rfq = await marketplaceDB.createRFQ({
          buyerId: userId,
          ...data
        });
        return NextResponse.json({ success: true, rfq });

      case 'submitQuote':
        const quote = await marketplaceDB.submitQuote(data);
        return NextResponse.json({ success: true, quote });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Marketplace API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process marketplace request' },
      { status: 500 }
    );
  }
}