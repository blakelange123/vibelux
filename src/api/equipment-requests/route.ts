import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Mock data for development
const mockRequests = [
  {
    id: '1',
    title: 'LED Grow Lights for Expansion',
    equipmentType: 'Lighting',
    estimatedValue: 50000,
    proposedRevShare: 15,
    termMonths: 36,
    neededBy: '2024-03-15',
    status: 'OPEN',
    viewCount: 42,
    facility: {
      id: 'fac-1',
      name: 'Green Valley Hydroponics',
      type: 'Indoor Farm',
      city: 'Denver',
      state: 'CO'
    },
    requester: {
      id: 'user-1',
      name: 'John Farmer'
    },
    _count: {
      offers: 3,
      questions: 2
    },
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Climate Control System',
    equipmentType: 'HVAC',
    estimatedValue: 75000,
    proposedRevShare: 18,
    termMonths: 48,
    neededBy: '2024-04-01',
    status: 'REVIEWING_OFFERS',
    viewCount: 28,
    facility: {
      id: 'fac-2',
      name: 'Sunshine Cannabis Co',
      type: 'Greenhouse',
      city: 'Phoenix',
      state: 'AZ'
    },
    requester: {
      id: 'user-2',
      name: 'Sarah Grower'
    },
    _count: {
      offers: 7,
      questions: 1
    },
    createdAt: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    title: 'Automated Irrigation System',
    equipmentType: 'Irrigation',
    estimatedValue: 25000,
    proposedRevShare: 12,
    termMonths: 24,
    neededBy: '2024-05-01',
    status: 'OPEN',
    viewCount: 15,
    facility: {
      id: 'fac-3',
      name: 'Desert Bloom Farms',
      type: 'Vertical Farm',
      city: 'Las Vegas',
      state: 'NV'
    },
    requester: {
      id: 'user-3',
      name: 'Mike Hydro'
    },
    _count: {
      offers: 1,
      questions: 3
    },
    createdAt: '2024-01-20T09:15:00Z'
  }
];

// GET /api/equipment-requests - List equipment requests with filtering
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const equipmentType = searchParams.get('equipmentType');
    const minValue = searchParams.get('minValue');
    const maxValue = searchParams.get('maxValue');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Filter mock data
    let filteredRequests = [...mockRequests];

    if (status) {
      filteredRequests = filteredRequests.filter(r => r.status === status);
    }

    if (equipmentType) {
      filteredRequests = filteredRequests.filter(r => 
        r.equipmentType.toLowerCase().includes(equipmentType.toLowerCase())
      );
    }

    if (minValue) {
      filteredRequests = filteredRequests.filter(r => r.estimatedValue >= parseFloat(minValue));
    }

    if (maxValue) {
      filteredRequests = filteredRequests.filter(r => r.estimatedValue <= parseFloat(maxValue));
    }

    const total = filteredRequests.length;
    const skip = (page - 1) * limit;
    const paginatedRequests = filteredRequests.slice(skip, skip + limit);

    return NextResponse.json({
      requests: paginatedRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching equipment requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment requests' },
      { status: 500 }
    );
  }
}

// POST /api/equipment-requests - Create new equipment request
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Mock response for development
    const mockRequest = {
      id: `req-${Date.now()}`,
      ...body,
      requesterId: userId,
      status: 'OPEN',
      viewCount: 0,
      createdAt: new Date().toISOString(),
      facility: {
        id: 'fac-1',
        name: 'Demo Facility',
        type: 'Indoor Farm'
      },
      requester: {
        id: userId,
        name: 'Current User',
        email: 'user@example.com'
      }
    };

    return NextResponse.json(mockRequest);
  } catch (error) {
    console.error('Error creating equipment request:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment request' },
      { status: 500 }
    );
  }
}