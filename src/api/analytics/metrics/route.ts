import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { metricsService } from '@/lib/analytics/real-time-metrics';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const facilityId = searchParams.get('facilityId');
    const period = searchParams.get('period') || 'month';
    const detailed = searchParams.get('detailed') === 'true';

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID required' }, { status: 400 });
    }

    // Verify user has access to this facility
    const facilityUser = await prisma.facilityUser.findFirst({
      where: {
        facilityId,
        userId,
      },
    });

    if (!facilityUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }

    // Get metrics
    if (detailed) {
      const metrics = await metricsService.getDetailedMetrics(facilityId, startDate, endDate);
      return NextResponse.json(metrics);
    } else {
      const metrics = await metricsService.calculateFacilityMetrics(facilityId, startDate, endDate);
      return NextResponse.json(metrics);
    }
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// Manual data entry endpoint
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { facilityId, type, data } = body;

    if (!facilityId || !type || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user has access to this facility
    const facilityUser = await prisma.facilityUser.findFirst({
      where: {
        facilityId,
        userId,
        role: { in: ['OWNER', 'ADMIN', 'MANAGER'] }
      },
    });

    if (!facilityUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Handle different types of manual data entry
    switch (type) {
      case 'harvest':
        // Create harvest batch with sales data
        const harvest = await prisma.harvestBatch.create({
          data: {
            facilityId,
            batchNumber: data.batchNumber || `BATCH-${Date.now()}`,
            strain: data.strain,
            zoneId: data.zoneId,
            harvestDate: new Date(data.harvestDate),
            plantCount: data.plantCount,
            actualYield: data.actualYield, // in kg
            qualityGrade: data.qualityGrade || 'A',
            status: 'COMPLETED',
            notes: data.notes,
            sales: data.revenue ? {
              create: {
                quantity: data.actualYield,
                pricePerUnit: data.revenue / data.actualYield,
                totalPrice: data.revenue,
                customer: data.customer || 'Direct Sale',
                saleDate: new Date(data.harvestDate),
              }
            } : undefined
          },
        });
        return NextResponse.json({ success: true, harvestId: harvest.id });

      case 'energy':
        // Create power reading
        const powerReading = await prisma.sensorReading.create({
          data: {
            facilityId,
            sensorType: 'POWER',
            value: data.powerKw,
            unit: 'kW',
            timestamp: new Date(data.timestamp || Date.now()),
            zoneId: data.zoneId,
            metadata: {
              source: 'manual',
              enteredBy: userId,
              meterReading: data.meterReading,
            }
          },
        });
        return NextResponse.json({ success: true, readingId: powerReading.id });

      case 'facility':
        // Update facility square footage
        const facility = await prisma.facility.update({
          where: { id: facilityId },
          data: {
            totalSquareFeet: data.totalSquareFeet,
            cultivationSquareFeet: data.cultivationSquareFeet,
          },
        });
        return NextResponse.json({ success: true, facility });

      case 'expense':
        // Create expense record
        const expense = await prisma.expense.create({
          data: {
            facilityId,
            category: data.category,
            amount: data.amount,
            description: data.description,
            date: new Date(data.date || Date.now()),
            metadata: {
              source: 'manual',
              enteredBy: userId,
            }
          },
        });
        return NextResponse.json({ success: true, expenseId: expense.id });

      default:
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error saving manual data:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}