import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Mock data - same as in parent route
const mockListings = [
  {
    id: '1',
    growerId: 'grower-1',
    growerName: 'Green Valley Farms',
    growerLocation: {
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      deliveryRadius: 50
    },
    product: {
      type: 'lettuce',
      variety: 'Buttercrunch Lettuce',
      certifications: ['USDA Organic', 'GAP Certified'],
      growingMethod: 'hydroponic'
    },
    availability: {
      currentStock: 500,
      unit: 'heads',
      harvestDate: new Date('2024-01-20'),
      availableFrom: new Date('2024-01-21'),
      availableUntil: new Date('2024-01-28'),
      recurring: true,
      frequency: 'weekly'
    },
    pricing: {
      price: 2.50,
      unit: 'head',
      bulkDiscounts: [
        { minQuantity: 100, discountPercent: 10 },
        { minQuantity: 500, discountPercent: 20 }
      ],
      contractPricing: true
    },
    quality: {
      grade: 'A',
      shelfLife: 14,
      packagingType: 'Clamshell containers',
      coldChainRequired: true,
      images: []
    },
    logistics: {
      deliveryAvailable: true,
      deliveryFee: 50,
      minimumOrder: 50,
      pickupAvailable: true,
      packagingIncluded: true
    },
    sustainability: {
      carbonFootprint: 0.5,
      waterUsage: 2,
      renewableEnergy: true,
      locallyGrown: true,
      pesticideFree: true
    },
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = mockListings.find(l => l.id === params.id);
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
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
    
    const listingIndex = mockListings.findIndex(l => l.id === params.id);
    
    if (listingIndex === -1) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the listing
    if (mockListings[listingIndex].growerId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Update listing
    mockListings[listingIndex] = {
      ...mockListings[listingIndex],
      ...body,
      updatedAt: new Date()
    };
    
    return NextResponse.json({
      listing: mockListings[listingIndex],
      message: 'Listing updated successfully'
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    const listingIndex = mockListings.findIndex(l => l.id === params.id);
    
    if (listingIndex === -1) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the listing
    if (mockListings[listingIndex].growerId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Remove listing
    mockListings.splice(listingIndex, 1);
    
    return NextResponse.json({
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}