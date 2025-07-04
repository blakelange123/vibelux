import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for market data submission
const marketDataSchema = z.object({
  cropType: z.string().min(1),
  strain: z.string().optional(),
  productCategory: z.enum(['flower', 'trim', 'extract', 'pre-roll', 'edible', 'other']),
  quality: z.enum(['A', 'B', 'C', 'D']),
  pricePerUnit: z.number().positive(),
  unitType: z.enum(['lb', 'kg', 'gram', 'oz']),
  quantity: z.number().positive(),
  buyerType: z.enum(['dispensary', 'processor', 'wholesale', 'direct']).optional(),
  buyerLocation: z.string().optional(),
  contractType: z.enum(['spot', 'contract', 'futures']).optional(),
  harvestDate: z.string().datetime().optional(),
  saleDate: z.string().datetime(),
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const facilityId = searchParams.get('facilityId');
    const cropType = searchParams.get('cropType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query filters
    const where: any = {};
    
    if (facilityId) {
      // Check user has access to facility
      const userFacility = await prisma.facilityUser.findFirst({
        where: {
          userId,
          facilityId,
        },
      });
      
      if (!userFacility) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      
      where.facilityId = facilityId;
    } else {
      // Get all facilities user has access to
      const userFacilities = await prisma.facilityUser.findMany({
        where: { userId },
        select: { facilityId: true },
      });
      
      where.facilityId = { in: userFacilities.map(f => f.facilityId) };
    }

    if (cropType) where.cropType = cropType;
    if (startDate && endDate) {
      where.saleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const marketData = await prisma.marketData.findMany({
      where,
      include: {
        facility: {
          select: {
            name: true,
            city: true,
            state: true,
          },
        },
        reporter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { saleDate: 'desc' },
      take: 100,
    });

    // Calculate summary statistics
    const stats = {
      averagePrice: marketData.reduce((sum, d) => sum + d.pricePerUnit, 0) / marketData.length || 0,
      totalVolume: marketData.reduce((sum, d) => sum + d.quantity, 0),
      totalRevenue: marketData.reduce((sum, d) => sum + d.totalRevenue, 0),
      dataPoints: marketData.length,
    };

    return NextResponse.json({
      data: marketData,
      stats,
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { facilityId, ...data } = body;

    // Validate input
    const validatedData = marketDataSchema.parse(data);

    // Check user has access to facility
    const userFacility = await prisma.facilityUser.findFirst({
      where: {
        userId,
        facilityId,
        role: { in: ['OWNER', 'ADMIN', 'MANAGER'] },
      },
    });

    if (!userFacility) {
      return NextResponse.json(
        { error: 'Access denied or invalid facility' },
        { status: 403 }
      );
    }

    // Calculate total revenue
    const totalRevenue = validatedData.pricePerUnit * validatedData.quantity;

    // Create market data entry
    const marketData = await prisma.marketData.create({
      data: {
        facilityId,
        ...validatedData,
        totalRevenue,
        reportedBy: userId,
        harvestDate: validatedData.harvestDate ? new Date(validatedData.harvestDate) : null,
        saleDate: new Date(validatedData.saleDate),
      },
      include: {
        facility: {
          select: {
            name: true,
          },
        },
      },
    });

    // Update data contribution tracking
    await updateDataContribution(facilityId, 'market_price');

    // Check if this unlocks any benchmark reports
    const unlockedReports = await checkUnlockedReports(facilityId);

    return NextResponse.json({
      data: marketData,
      message: 'Market data submitted successfully',
      unlockedReports,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating market data:', error);
    return NextResponse.json(
      { error: 'Failed to submit market data' },
      { status: 500 }
    );
  }
}

// Helper function to update data contribution tracking
async function updateDataContribution(facilityId: string, dataType: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const contribution = await prisma.dataContribution.findFirst({
    where: {
      facilityId,
      dataType,
      createdAt: { gte: today },
    },
  });

  if (contribution) {
    await prisma.dataContribution.update({
      where: { id: contribution.id },
      data: {
        recordCount: { increment: 1 },
        qualityScore: 0.9, // TODO: Calculate based on data completeness
      },
    });
  } else {
    await prisma.dataContribution.create({
      data: {
        facilityId,
        dataType,
        recordCount: 1,
        qualityScore: 0.9,
        creditsEarned: 10, // 10 credits per contribution
      },
    });
  }
}

// Helper function to check if facility has unlocked new reports
async function checkUnlockedReports(facilityId: string) {
  const contributions = await prisma.dataContribution.findMany({
    where: { facilityId },
    select: {
      dataType: true,
      recordCount: true,
    },
  });

  const totalContributions = contributions.reduce((sum, c) => sum + c.recordCount, 0);
  const unlockedReports = [];

  // Unlock basic report after 10 contributions
  if (totalContributions >= 10) {
    unlockedReports.push('basic_benchmark');
  }

  // Unlock pro report after 50 contributions
  if (totalContributions >= 50) {
    unlockedReports.push('pro_benchmark');
  }

  // Unlock enterprise report after 100 contributions
  if (totalContributions >= 100) {
    unlockedReports.push('enterprise_benchmark');
  }

  return unlockedReports;
}