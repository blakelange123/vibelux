import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { workOrderId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workOrderId } = params;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        serviceRequest: {
          include: {
            facility: {
              select: { id: true, name: true, address: true, city: true, state: true, zipCode: true },
            },
            equipment: {
              select: { 
                id: true, 
                name: true, 
                category: true, 
                manufacturer: true, 
                model: true,
                installLocation: true,
              },
            },
            requester: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        serviceProvider: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
            email: true,
            rating: true,
            address: true,
            city: true,
            state: true,
          },
        },
        timeEntries: {
          orderBy: { date: 'desc' },
        },
        expenses: {
          orderBy: { createdAt: 'desc' },
        },
        review: true,
      },
    });

    if (!workOrder) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    return NextResponse.json(workOrder);
  } catch (error) {
    console.error('Error fetching work order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { workOrderId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workOrderId } = params;
    const data = await request.json();

    // Get existing work order to check permissions
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        serviceRequest: true,
        serviceProvider: true,
      },
    });

    if (!existingWorkOrder) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    // Check permissions - only service provider or facility admin can update
    const hasPermission = existingWorkOrder.serviceRequest.requesterId === userId ||
      await prisma.facilityUser.findFirst({
        where: {
          facilityId: existingWorkOrder.serviceRequest.facilityId,
          userId: userId,
          role: { in: ['OWNER', 'ADMIN', 'MANAGER'] },
        },
      });

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Not authorized to update this work order' },
        { status: 403 }
      );
    }

    // Update work order
    const updateData: any = {};

    if (data.status) updateData.status = data.status;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.workPerformed) updateData.workPerformed = data.workPerformed;
    if (data.materialsUsed) updateData.materialsUsed = data.materialsUsed;
    if (data.hoursWorked !== undefined) updateData.hoursWorked = data.hoursWorked;
    if (data.additionalCosts !== undefined) updateData.additionalCosts = data.additionalCosts;
    if (data.beforePhotos) updateData.beforePhotos = data.beforePhotos;
    if (data.afterPhotos) updateData.afterPhotos = data.afterPhotos;
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);
    if (data.qualityCheck !== undefined) updateData.qualityCheck = data.qualityCheck;
    if (data.customerApproval !== undefined) updateData.customerApproval = data.customerApproval;
    if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus;

    // If completing the work order
    if (data.status === 'COMPLETED' && existingWorkOrder.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.progress = 100;

      // Calculate total cost
      const totalCost = (existingWorkOrder.laborCost || 0) + 
                       (existingWorkOrder.materialsCost || 0) + 
                       (data.additionalCosts || 0);
      updateData.totalCost = totalCost;

      // Update service request status
      await prisma.serviceRequest.update({
        where: { id: existingWorkOrder.serviceRequestId },
        data: { status: 'COMPLETED' },
      });

      // Update service provider stats
      await prisma.serviceProvider.update({
        where: { id: existingWorkOrder.serviceProviderId },
        data: {
          completedJobs: { increment: 1 },
        },
      });
    }

    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: updateData,
      include: {
        serviceRequest: {
          include: {
            facility: {
              select: { id: true, name: true },
            },
            equipment: {
              select: { id: true, name: true, category: true },
            },
          },
        },
        serviceProvider: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            rating: true,
          },
        },
        timeEntries: true,
        expenses: true,
      },
    });

    return NextResponse.json(updatedWorkOrder);
  } catch (error) {
    console.error('Error updating work order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}