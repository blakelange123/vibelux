import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Validation schemas
const createFacilitySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(['GREENHOUSE', 'INDOOR', 'VERTICAL_FARM', 'RESEARCH', 'HYBRID']),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  size: z.number().positive().optional(),
  settings: z.any().optional()
});

const updateFacilitySchema = createFacilitySchema.partial();

// GET /api/facility - Get user's facilities
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get facility for user
    const facility = await db.facilities.findByUserId(userId);
    
    if (!facility) {
      return NextResponse.json({ facility: null });
    }
    
    // Get user's role in the facility
    const facilityUser = await db.prisma.facilityUser.findFirst({
      where: {
        userId,
        facilityId: facility.id
      }
    });
    
    // Get facility stats
    const stats = {
      totalProjects: await db.prisma.facilityProject.count({
        where: { facilityId: facility.id }
      }),
      activeInvestments: await db.prisma.investmentOpportunity.count({
        where: { 
          facilityId: facility.id,
          status: 'ACTIVE'
        }
      }),
      totalInvestors: await db.prisma.investment.count({
        where: {
          opportunity: {
            facilityId: facility.id
          },
          status: 'COMPLETED'
        }
      }),
      totalFunding: await db.prisma.investmentOpportunity.aggregate({
        where: { facilityId: facility.id },
        _sum: { currentAmount: true }
      })
    };
    
    return NextResponse.json({
      facility: {
        ...facility,
        userRole: facilityUser?.role,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching facility:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facility' },
      { status: 500 }
    );
  }
}

// POST /api/facility - Create a new facility
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Validate request body
    const validationResult = createFacilitySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Check if user already has a facility
    const existingFacility = await db.facilities.findByUserId(userId);
    if (existingFacility) {
      return NextResponse.json(
        { error: 'User already belongs to a facility' },
        { status: 400 }
      );
    }
    
    // Create facility and add user as owner
    const facility = await db.facilities.create(data);
    await db.facilities.addUser(facility.id, userId, 'OWNER');
    
    // Get user to add name
    const user = await db.users.findByClerkId(userId);
    
    return NextResponse.json({
      facility: {
        ...facility,
        userRole: 'OWNER',
        users: [{
          userId,
          name: user?.name,
          email: user?.email,
          role: 'OWNER',
          joinedAt: new Date()
        }]
      }
    });
  } catch (error) {
    console.error('Error creating facility:', error);
    return NextResponse.json(
      { error: 'Failed to create facility' },
      { status: 500 }
    );
  }
}

// PUT /api/facility - Update facility
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Validate request body
    const validationResult = updateFacilitySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Get facility and verify permissions
    const facility = await db.facilities.findByUserId(userId);
    if (!facility) {
      return NextResponse.json({ error: 'No facility found' }, { status: 404 });
    }
    
    // Check user role
    const facilityUser = await db.prisma.facilityUser.findFirst({
      where: {
        userId,
        facilityId: facility.id,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });
    
    if (!facilityUser) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update facility' },
        { status: 403 }
      );
    }
    
    // Update facility
    const updated = await db.prisma.facility.update({
      where: { id: facility.id },
      data
    });
    
    return NextResponse.json({ facility: updated });
  } catch (error) {
    console.error('Error updating facility:', error);
    return NextResponse.json(
      { error: 'Failed to update facility' },
      { status: 500 }
    );
  }
}

// DELETE /api/facility - Delete facility (owner only)
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get facility and verify ownership
    const facility = await db.facilities.findByUserId(userId);
    if (!facility) {
      return NextResponse.json({ error: 'No facility found' }, { status: 404 });
    }
    
    // Check user is owner
    const facilityUser = await db.prisma.facilityUser.findFirst({
      where: {
        userId,
        facilityId: facility.id,
        role: 'OWNER'
      }
    });
    
    if (!facilityUser) {
      return NextResponse.json(
        { error: 'Only facility owner can delete facility' },
        { status: 403 }
      );
    }
    
    // Check for active investments
    const activeInvestments = await db.prisma.investmentOpportunity.count({
      where: {
        facilityId: facility.id,
        status: { in: ['ACTIVE', 'FUNDED'] }
      }
    });
    
    if (activeInvestments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete facility with active investments' },
        { status: 400 }
      );
    }
    
    // Delete facility (cascades to related records)
    await db.prisma.facility.delete({
      where: { id: facility.id }
    });
    
    return NextResponse.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    console.error('Error deleting facility:', error);
    return NextResponse.json(
      { error: 'Failed to delete facility' },
      { status: 500 }
    );
  }
}