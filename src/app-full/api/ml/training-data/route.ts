import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET training data with filters
export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cropType = searchParams.get('cropType');
    const facilityId = searchParams.get('facilityId');
    const verified = searchParams.get('verified');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (cropType) where.cropType = cropType;
    if (facilityId) where.facilityId = facilityId;
    if (verified !== null) where.verified = verified === 'true';

    const [data, total] = await Promise.all([
      prisma.yieldTrainingData.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { recordedAt: 'desc' },
        include: {
          facility: {
            select: {
              id: true,
              name: true,
              location: true,
              facilityType: true
            }
          }
        }
      }),
      prisma.yieldTrainingData.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching training data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training data' },
      { status: 500 }
    );
  }
}

// POST new training data
export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'cropType', 'growthStage', 'temperature', 'humidity', 
      'ppfd', 'co2', 'vpd', 'ec', 'ph', 'dli', 
      'plantDensity', 'waterUsage', 'actualYield', 
      'qualityScore', 'cycleLength', 'cycleStartDate', 'cycleEndDate'
    ];
    
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create training data record
    const trainingData = await prisma.yieldTrainingData.create({
      data: {
        ...body,
        cycleStartDate: new Date(body.cycleStartDate),
        cycleEndDate: new Date(body.cycleEndDate),
        dataSource: body.dataSource || 'manual',
        confidence: body.confidence || 1.0,
        verified: false
      }
    });

    return NextResponse.json({
      success: true,
      data: trainingData
    });
  } catch (error) {
    console.error('Error creating training data:', error);
    return NextResponse.json(
      { error: 'Failed to create training data' },
      { status: 500 }
    );
  }
}

// PATCH to verify training data
export async function PATCH(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, verified, verifiedBy } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing training data ID' },
        { status: 400 }
      );
    }

    const updatedData = await prisma.yieldTrainingData.update({
      where: { id },
      data: {
        verified,
        verifiedBy: verified ? verifiedBy || user.userId : null
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedData
    });
  } catch (error) {
    console.error('Error updating training data:', error);
    return NextResponse.json(
      { error: 'Failed to update training data' },
      { status: 500 }
    );
  }
}

// DELETE training data
export async function DELETE(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing training data ID' },
        { status: 400 }
      );
    }

    await prisma.yieldTrainingData.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Training data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting training data:', error);
    return NextResponse.json(
      { error: 'Failed to delete training data' },
      { status: 500 }
    );
  }
}