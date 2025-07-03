import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface Product {
  id: string;
  vendorId: string;
  category: 'lighting' | 'hvac' | 'automation' | 'nutrients' | 'media' | 'genetics' | 'equipment' | 'other';
  subcategory?: string;
  name: string;
  brand: string;
  model?: string;
  description: string;
  specifications: Record<string, any>;
  images: string[];
  pricing: {
    list: number;
    wholesale?: number;
    volume?: { quantity: number; price: number }[];
    currency: string;
  };
  availability: 'in-stock' | 'backorder' | 'discontinued';
  leadTime: number;
  warranty: string;
  certifications: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Demo product data store
const demoProducts: Product[] = [
  {
    id: 'PRD-001',
    vendorId: 'VND-001',
    category: 'lighting',
    subcategory: 'LED Fixtures',
    name: 'ProGrow 720W LED',
    brand: 'ProGrow',
    model: 'PG-720',
    description: 'High-efficiency 720W LED grow light with full spectrum and Samsung LM301H diodes',
    specifications: {
      wattage: 720,
      ppf: 1944,
      efficacy: 2.7,
      spectrum: 'Full Spectrum (3000K+5000K+660nm+IR)',
      dimensions: '44" x 44" x 4"',
      coverage: '4x4 ft flowering, 5x5 ft veg',
      diodes: 'Samsung LM301H + Osram 660nm',
      driver: 'Meanwell HLG-320H-54A',
      lifespan: '50,000+ hours'
    },
    images: ['/api/placeholder/400/300'],
    pricing: {
      list: 899,
      wholesale: 719,
      volume: [
        { quantity: 10, price: 679 },
        { quantity: 50, price: 639 },
        { quantity: 100, price: 599 }
      ],
      currency: 'USD'
    },
    availability: 'in-stock',
    leadTime: 3,
    warranty: '5 years',
    certifications: ['DLC', 'UL', 'IP65', 'FCC'],
    tags: ['commercial', 'high-ppfd', 'waterproof', 'dimmable'],
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2024-06-20T15:45:00Z'
  },
  {
    id: 'PRD-002',
    vendorId: 'VND-001',
    category: 'lighting',
    subcategory: 'UV Systems',
    name: 'UVMax Pro 40W',
    brand: 'ProGrow',
    model: 'UV-40',
    description: 'Professional UV-B supplemental lighting system for enhanced trichome production',
    specifications: {
      wattage: 40,
      uvOutput: '285-315nm peak at 305nm',
      coverage: '3x3 ft',
      timer: 'Built-in digital timer',
      mounting: 'Universal mounting bracket',
      protection: 'Safety shutoff sensor'
    },
    images: ['/api/placeholder/400/300'],
    pricing: {
      list: 299,
      wholesale: 239,
      volume: [
        { quantity: 5, price: 219 },
        { quantity: 20, price: 199 }
      ],
      currency: 'USD'
    },
    availability: 'in-stock',
    leadTime: 5,
    warranty: '3 years',
    certifications: ['UL', 'FCC', 'CE'],
    tags: ['uv-b', 'trichome-boost', 'timer'],
    createdAt: '2023-08-22T09:15:00Z',
    updatedAt: '2024-06-18T11:20:00Z'
  },
  {
    id: 'PRD-003',
    vendorId: 'VND-003',
    category: 'nutrients',
    subcategory: 'Base Nutrients',
    name: 'HydroMax Bloom A+B',
    brand: 'HydroTech',
    model: 'HM-BLOOM-5L',
    description: 'Professional 2-part flowering nutrient system for hydroponic cultivation',
    specifications: {
      volume: '5L each (A+B)',
      npk: 'Part A: 4-0-1, Part B: 1-5-4',
      concentration: '1:1000 dilution ratio',
      ph: 'pH stable 5.5-6.5',
      solubility: 'Fully water soluble',
      storage: '2 year shelf life'
    },
    images: ['/api/placeholder/400/300'],
    pricing: {
      list: 89,
      wholesale: 71,
      volume: [
        { quantity: 10, price: 67 },
        { quantity: 50, price: 63 }
      ],
      currency: 'USD'
    },
    availability: 'in-stock',
    leadTime: 2,
    warranty: '6 months',
    certifications: ['OMRI Listed', 'CDFA Approved'],
    tags: ['hydroponic', 'flowering', 'two-part'],
    createdAt: '2023-04-10T14:20:00Z',
    updatedAt: '2024-06-19T16:30:00Z'
  },
  {
    id: 'PRD-004',
    vendorId: 'VND-003',
    category: 'equipment',
    subcategory: 'Climate Control',
    name: 'AeroFlow 12" Circulation Fan',
    brand: 'HydroTech',
    model: 'AF-12',
    description: 'High-velocity circulation fan for optimal air movement and plant strengthening',
    specifications: {
      diameter: '12 inches',
      airflow: '1050 CFM',
      power: '55W',
      noise: '< 35dB',
      speed: 'Variable speed control',
      mounting: 'Clip-on adjustable'
    },
    images: ['/api/placeholder/400/300'],
    pricing: {
      list: 145,
      wholesale: 116,
      volume: [
        { quantity: 5, price: 109 },
        { quantity: 20, price: 102 }
      ],
      currency: 'USD'
    },
    availability: 'in-stock',
    leadTime: 1,
    warranty: '2 years',
    certifications: ['UL', 'Energy Star'],
    tags: ['circulation', 'variable-speed', 'quiet'],
    createdAt: '2023-05-30T11:10:00Z',
    updatedAt: '2024-06-21T09:45:00Z'
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
    const category = searchParams.get('category');
    const vendorId = searchParams.get('vendorId');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const availability = searchParams.get('availability');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let filteredProducts = [...demoProducts];

    // Apply filters
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }
    if (vendorId) {
      filteredProducts = filteredProducts.filter(product => product.vendorId === vendorId);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    if (minPrice) {
      filteredProducts = filteredProducts.filter(product => product.pricing.list >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(product => product.pricing.list <= parseFloat(maxPrice));
    }
    if (availability) {
      filteredProducts = filteredProducts.filter(product => product.availability === availability);
    }

    // Pagination
    const total = filteredProducts.length;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      products: paginatedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters: {
        categories: Array.from(new Set(demoProducts.map(p => p.category))),
        brands: Array.from(new Set(demoProducts.map(p => p.brand))),
        priceRange: {
          min: Math.min(...demoProducts.map(p => p.pricing.list)),
          max: Math.max(...demoProducts.map(p => p.pricing.list))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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

    const productData = await request.json();
    
    // Validate required fields
    const requiredFields = ['vendorId', 'category', 'name', 'brand', 'description', 'pricing'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new product
    const newProduct: Product = {
      id: `PRD-${Date.now()}`,
      vendorId: productData.vendorId,
      category: productData.category,
      subcategory: productData.subcategory,
      name: productData.name,
      brand: productData.brand,
      model: productData.model,
      description: productData.description,
      specifications: productData.specifications || {},
      images: productData.images || [],
      pricing: {
        ...productData.pricing,
        currency: productData.pricing.currency || 'USD'
      },
      availability: productData.availability || 'in-stock',
      leadTime: productData.leadTime || 0,
      warranty: productData.warranty || 'Standard',
      certifications: productData.certifications || [],
      tags: productData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In production, this would save to database
    demoProducts.push(newProduct);

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Product listed successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}