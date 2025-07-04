import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET expenses with filters
export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const categoryId = searchParams.get('categoryId');
    const cropType = searchParams.get('cropType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    const where: any = { facilityId };
    if (categoryId) where.categoryId = categoryId;
    if (cropType) where.cropType = cropType;
    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }

    const [expenses, total, categories] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { expenseDate: 'desc' },
        take: limit
      }),
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: true
      }),
      prisma.costCategory.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        expenses,
        summary: {
          totalAmount: total._sum.amount || 0,
          totalCount: total._count,
          averageAmount: total._count > 0 ? (total._sum.amount || 0) / total._count : 0
        },
        categories
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST new expense
export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      facilityId,
      categoryId,
      amount,
      description,
      batchId,
      cropType,
      vendorName,
      invoiceNumber,
      expenseDate,
      isRecurring,
      recurringFrequency,
      recurringEndDate
    } = body;

    // Validate required fields
    if (!facilityId || !categoryId || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        facilityId,
        categoryId,
        amount,
        description,
        batchId,
        cropType,
        vendorName,
        invoiceNumber,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        recordedBy: user.userId,
        isRecurring,
        recurringFrequency,
        recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null
      },
      include: {
        category: true
      }
    });

    // If expense is linked to a batch, update batch costs
    if (batchId) {
      await updateBatchCosts(batchId);
    }

    // If recurring, create future expense records
    if (isRecurring && recurringFrequency) {
      await createRecurringExpenses(expense);
    }

    return NextResponse.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

// Helper function to update batch costs
async function updateBatchCosts(batchId: string) {
  const expenses = await prisma.expense.aggregate({
    where: { batchId },
    _sum: { amount: true }
  });

  const batch = await prisma.productionBatch.findUnique({
    where: { id: batchId }
  });

  if (batch) {
    const totalCosts = expenses._sum.amount || 0;
    const costPerGram = batch.dryWeight ? totalCosts / batch.dryWeight : null;
    const costPerPound = costPerGram ? costPerGram * 453.592 : null;

    await prisma.productionBatch.update({
      where: { id: batchId },
      data: {
        directCosts: totalCosts,
        totalCosts,
        costPerGram,
        costPerPound
      }
    });
  }
}

// Helper function to create recurring expenses
async function createRecurringExpenses(originalExpense: any) {
  // This would be handled by a scheduled job in production
}