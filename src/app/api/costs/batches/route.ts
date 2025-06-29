import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET production batches with cost data
export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const cropType = searchParams.get('cropType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    const where: any = { facilityId };
    if (cropType) where.cropType = cropType;
    if (status) where.status = status;

    const batches = await prisma.productionBatch.findMany({
      where,
      orderBy: { startDate: 'desc' },
      take: limit
    });

    // Calculate aggregated metrics
    const metrics = await prisma.productionBatch.aggregate({
      where: {
        ...where,
        status: 'harvested',
        costPerGram: { not: null }
      },
      _avg: {
        costPerGram: true,
        costPerPound: true,
        yieldPerSqft: true
      },
      _sum: {
        dryWeight: true,
        totalCosts: true
      },
      _count: true
    });

    return NextResponse.json({
      success: true,
      data: {
        batches,
        metrics: {
          avgCostPerGram: metrics._avg.costPerGram || 0,
          avgCostPerPound: metrics._avg.costPerPound || 0,
          avgYieldPerSqft: metrics._avg.yieldPerSqft || 0,
          totalYield: metrics._sum.dryWeight || 0,
          totalCosts: metrics._sum.totalCosts || 0,
          batchCount: metrics._count
        }
      }
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

// POST new production batch
export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      facilityId,
      cropType,
      strain,
      plantCount,
      squareFootage,
      startDate
    } = body;

    // Generate unique batch number
    const batchNumber = `${cropType.substring(0, 3).toUpperCase()}-${Date.now()}`;

    const batch = await prisma.productionBatch.create({
      data: {
        facilityId,
        batchNumber,
        cropType,
        strain,
        plantCount,
        squareFootage,
        startDate: new Date(startDate),
        status: 'active'
      }
    });

    return NextResponse.json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    );
  }
}

// PATCH update batch (harvest, costs, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { batchId, ...updateData } = body;

    if (!batchId) {
      return NextResponse.json(
        { error: 'batchId is required' },
        { status: 400 }
      );
    }

    // If harvesting, calculate final metrics
    if (updateData.status === 'harvested' && updateData.dryWeight) {
      // Get all expenses for this batch
      const expenses = await prisma.expense.aggregate({
        where: { batchId },
        _sum: { amount: true }
      });

      const totalCosts = expenses._sum.amount || 0;
      updateData.totalCosts = totalCosts;
      updateData.costPerGram = totalCosts / updateData.dryWeight;
      updateData.costPerPound = updateData.costPerGram * 453.592;
      
      if (updateData.squareFootage) {
        updateData.yieldPerSqft = updateData.dryWeight / updateData.squareFootage;
      }
    }

    const batch = await prisma.productionBatch.update({
      where: { id: batchId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    return NextResponse.json(
      { error: 'Failed to update batch' },
      { status: 500 }
    );
  }
}