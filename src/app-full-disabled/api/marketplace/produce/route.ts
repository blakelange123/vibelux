import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ProduceListing } from '@/lib/marketplace-types';
import { RevenueShareService } from '@/services/revenue-sharing/RevenueShareService';

// Mock data for now - would connect to database
const mockListings: ProduceListing[] = [
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
      // Enhanced dual unit pricing for lettuce
      pricePerGram: 0.01, // $0.01 per gram (estimated 250g per head)
      pricePerPound: 4.54, // $4.54 per pound
      weightPerUnit: 250, // grams per head
      productType: 'lettuce',
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
  },
  {
    id: '2',
    growerId: 'grower-2',
    growerName: 'Urban Harvest Co',
    growerLocation: {
      city: 'Oakland',
      state: 'CA',
      zipCode: '94612',
      deliveryRadius: 30
    },
    product: {
      type: 'tomatoes',
      variety: 'Cherry Tomatoes',
      certifications: ['Non-GMO Project', 'SQF Level 2'],
      growingMethod: 'aeroponic'
    },
    availability: {
      currentStock: 200,
      unit: 'lbs',
      harvestDate: new Date('2024-01-19'),
      availableFrom: new Date('2024-01-20'),
      availableUntil: new Date('2024-01-27'),
      recurring: true,
      frequency: 'biweekly'
    },
    pricing: {
      price: 4.99,
      unit: 'lb',
      // Enhanced dual unit pricing for tomatoes
      pricePerGram: 0.011, // $0.011 per gram
      pricePerPound: 4.99, // $4.99 per pound
      weightPerUnit: 453.592, // grams per pound
      productType: 'tomatoes',
      bulkDiscounts: [
        { minQuantity: 50, discountPercent: 15 }
      ],
      contractPricing: false
    },
    quality: {
      grade: 'A',
      shelfLife: 10,
      packagingType: 'Vented containers',
      coldChainRequired: true,
      images: []
    },
    logistics: {
      deliveryAvailable: true,
      deliveryFee: 0,
      minimumOrder: 20,
      pickupAvailable: true,
      packagingIncluded: true
    },
    sustainability: {
      carbonFootprint: 0.3,
      waterUsage: 1.5,
      renewableEnergy: true,
      locallyGrown: true,
      pesticideFree: true
    },
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Helper functions for dual unit pricing calculations
function calculatePricePerGram(price: number, unit: string, weightPerUnit?: number): number {
  switch (unit) {
    case 'gram':
    case 'g':
      return price;
    case 'pound':
    case 'lb':
      return price / RevenueShareService.GRAMS_PER_POUND;
    case 'head':
    case 'piece':
      if (weightPerUnit) {
        return price / weightPerUnit;
      }
      return 0; // Cannot calculate without weight
    default:
      return 0;
  }
}

function calculatePricePerPound(price: number, unit: string, weightPerUnit?: number): number {
  switch (unit) {
    case 'gram':
    case 'g':
      return price * RevenueShareService.GRAMS_PER_POUND;
    case 'pound':
    case 'lb':
      return price;
    case 'head':
    case 'piece':
      if (weightPerUnit) {
        const pricePerGram = price / weightPerUnit;
        return pricePerGram * RevenueShareService.GRAMS_PER_POUND;
      }
      return 0; // Cannot calculate without weight
    default:
      return 0;
  }
}

function getDefaultWeightPerUnit(unit: string): number {
  // Default weights in grams
  switch (unit) {
    case 'head':
      return 250; // Average lettuce head
    case 'piece':
      return 100; // Average piece
    case 'gram':
    case 'g':
      return 1;
    case 'pound':
    case 'lb':
      return RevenueShareService.GRAMS_PER_POUND;
    default:
      return 1;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filter parameters
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const certification = searchParams.get('certification');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    let filteredListings = [...mockListings];
    
    // Apply filters
    if (category) {
      filteredListings = filteredListings.filter(l => l.product.type === category);
    }
    
    if (city) {
      filteredListings = filteredListings.filter(l => 
        l.growerLocation.city.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    if (state) {
      filteredListings = filteredListings.filter(l => l.growerLocation.state === state);
    }
    
    if (certification) {
      filteredListings = filteredListings.filter(l => 
        l.product.certifications.includes(certification)
      );
    }
    
    if (minPrice) {
      filteredListings = filteredListings.filter(l => l.pricing.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      filteredListings = filteredListings.filter(l => l.pricing.price <= parseFloat(maxPrice));
    }
    
    return NextResponse.json({
      listings: filteredListings,
      total: filteredListings.length,
      page: 1,
      pageSize: 20
    });
  } catch (error) {
    console.error('Error fetching produce listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
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
    const requiredFields = [
      'productType', 'variety', 'growingMethod', 
      'currentStock', 'unit', 'price', 'grade'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Create new listing
    const newListing: ProduceListing = {
      id: Date.now().toString(),
      growerId: userId,
      growerName: body.growerName || 'Unknown Grower',
      growerLocation: {
        city: body.city || '',
        state: body.state || '',
        zipCode: body.zipCode || '',
        deliveryRadius: body.deliveryRadius || 50
      },
      product: {
        type: body.productType,
        variety: body.variety,
        certifications: body.certifications || [],
        growingMethod: body.growingMethod
      },
      availability: {
        currentStock: body.currentStock,
        unit: body.unit,
        harvestDate: new Date(body.harvestDate),
        availableFrom: new Date(body.availableFrom),
        availableUntil: new Date(body.availableUntil),
        recurring: body.recurring || false,
        frequency: body.frequency
      },
      pricing: {
        price: body.price,
        unit: body.priceUnit || body.unit,
        // Calculate dual unit pricing automatically
        pricePerGram: body.pricePerGram || calculatePricePerGram(body.price, body.priceUnit || body.unit, body.weightPerUnit),
        pricePerPound: body.pricePerPound || calculatePricePerPound(body.price, body.priceUnit || body.unit, body.weightPerUnit),
        weightPerUnit: body.weightPerUnit || getDefaultWeightPerUnit(body.unit),
        productType: body.productType || 'other',
        bulkDiscounts: body.bulkDiscounts || [],
        contractPricing: body.contractPricing || false
      },
      quality: {
        grade: body.grade,
        shelfLife: body.shelfLife || 7,
        packagingType: body.packagingType || '',
        coldChainRequired: body.coldChainRequired || true,
        images: body.images || []
      },
      logistics: {
        deliveryAvailable: body.deliveryAvailable || true,
        deliveryFee: body.deliveryFee || 0,
        minimumOrder: body.minimumOrder || 1,
        pickupAvailable: body.pickupAvailable || true,
        packagingIncluded: body.packagingIncluded || true
      },
      sustainability: {
        carbonFootprint: body.carbonFootprint,
        waterUsage: body.waterUsage,
        renewableEnergy: body.renewableEnergy || false,
        locallyGrown: body.locallyGrown || true,
        pesticideFree: body.pesticideFree || false
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // In a real app, save to database
    mockListings.push(newListing);
    
    return NextResponse.json({
      listing: newListing,
      message: 'Listing created successfully'
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}