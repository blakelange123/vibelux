import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface Vendor {
  id: string;
  name: string;
  type: 'equipment' | 'genetics' | 'supplies' | 'services';
  verified: boolean;
  rating: number;
  reviewCount: number;
  specialties: string[];
  certifications: string[];
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  businessInfo: {
    taxId: string;
    yearEstablished: number;
    insuranceExpiry: string;
  };
  paymentTerms: string;
  minimumOrder: number;
  shippingZones: string[];
  createdAt: string;
  lastActive: string;
}

// Demo vendor data store (in production, this would be a database)
const demoVendors: Vendor[] = [
  {
    id: 'VND-001',
    name: 'Premium Grow Lights Co.',
    type: 'equipment',
    verified: true,
    rating: 4.8,
    reviewCount: 245,
    specialties: ['LED Lighting', 'Supplemental Lighting', 'UV Systems'],
    certifications: ['DLC Certified', 'UL Listed', 'Energy Star'],
    contact: {
      email: 'sales@premiumgrowlights.com',
      phone: '+1-800-555-0100',
      address: '123 Industrial Way, Portland, OR 97201'
    },
    businessInfo: {
      taxId: 'XX-XXXXXXX',
      yearEstablished: 2015,
      insuranceExpiry: '2025-12-31'
    },
    paymentTerms: 'Net 30',
    minimumOrder: 500,
    shippingZones: ['US', 'CA'],
    createdAt: '2023-01-15T10:30:00Z',
    lastActive: '2024-06-21T15:45:00Z'
  },
  {
    id: 'VND-002',
    name: 'Elite Genetics Lab',
    type: 'genetics',
    verified: true,
    rating: 4.9,
    reviewCount: 189,
    specialties: ['Premium Strains', 'Tissue Culture', 'Custom Breeding'],
    certifications: ['Virus-Free Certified', 'Organic', 'ISO 9001'],
    contact: {
      email: 'info@elitegenetics.com',
      phone: '+1-800-555-0200',
      address: '456 Genetics Dr, Denver, CO 80201'
    },
    businessInfo: {
      taxId: 'XX-XXXXXXX',
      yearEstablished: 2018,
      insuranceExpiry: '2025-12-31'
    },
    paymentTerms: 'Prepaid',
    minimumOrder: 100,
    shippingZones: ['US'],
    createdAt: '2023-03-22T09:15:00Z',
    lastActive: '2024-06-21T11:20:00Z'
  },
  {
    id: 'VND-003',
    name: 'HydroTech Supplies',
    type: 'supplies',
    verified: true,
    rating: 4.6,
    reviewCount: 312,
    specialties: ['Hydroponic Systems', 'Nutrients', 'Growing Media'],
    certifications: ['OMRI Listed', 'CDFA Approved'],
    contact: {
      email: 'orders@hydrotech.com',
      phone: '+1-800-555-0300',
      address: '789 Hydro St, Sacramento, CA 95814'
    },
    businessInfo: {
      taxId: 'XX-XXXXXXX',
      yearEstablished: 2012,
      insuranceExpiry: '2025-12-31'
    },
    paymentTerms: 'Net 15',
    minimumOrder: 250,
    shippingZones: ['US', 'CA', 'MX'],
    createdAt: '2023-02-10T14:20:00Z',
    lastActive: '2024-06-21T16:30:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const verified = searchParams.get('verified');
    const specialty = searchParams.get('specialty');
    const minRating = searchParams.get('minRating');

    let filteredVendors = [...demoVendors];

    // Apply filters
    if (type) {
      filteredVendors = filteredVendors.filter(vendor => vendor.type === type);
    }
    if (verified === 'true') {
      filteredVendors = filteredVendors.filter(vendor => vendor.verified);
    }
    if (specialty) {
      filteredVendors = filteredVendors.filter(vendor => 
        vendor.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
      );
    }
    if (minRating) {
      const rating = parseFloat(minRating);
      filteredVendors = filteredVendors.filter(vendor => vendor.rating >= rating);
    }

    return NextResponse.json({
      vendors: filteredVendors,
      total: filteredVendors.length,
      filters: {
        types: ['equipment', 'genetics', 'supplies', 'services'],
        specialties: Array.from(new Set(demoVendors.flatMap(v => v.specialties))),
        certifications: Array.from(new Set(demoVendors.flatMap(v => v.certifications)))
      }
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const vendorData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'type', 'contact', 'businessInfo'];
    for (const field of requiredFields) {
      if (!vendorData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new vendor
    const newVendor: Vendor = {
      id: `VND-${Date.now()}`,
      name: vendorData.name,
      type: vendorData.type,
      verified: false, // New vendors start unverified
      rating: 0,
      reviewCount: 0,
      specialties: vendorData.specialties || [],
      certifications: vendorData.certifications || [],
      contact: vendorData.contact,
      businessInfo: {
        ...vendorData.businessInfo,
        insuranceExpiry: vendorData.businessInfo.insuranceExpiry
      },
      paymentTerms: vendorData.paymentTerms || 'Net 30',
      minimumOrder: vendorData.minimumOrder || 0,
      shippingZones: vendorData.shippingZones || ['US'],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    // In production, this would save to database
    demoVendors.push(newVendor);

    return NextResponse.json({
      success: true,
      vendor: newVendor,
      message: 'Vendor registration submitted for review'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { vendorId, ...updateData } = await request.json();
    
    const vendorIndex = demoVendors.findIndex(v => v.id === vendorId);
    if (vendorIndex === -1) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Update vendor
    demoVendors[vendorIndex] = {
      ...demoVendors[vendorIndex],
      ...updateData,
      lastActive: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      vendor: demoVendors[vendorIndex],
      message: 'Vendor updated successfully'
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}