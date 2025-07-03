import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { InvestmentService } from '@/lib/db/investment';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    investmentId: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get investor to verify ownership
    const investor = await prisma.investor.findUnique({
      where: { userId }
    });

    if (!investor) {
      return NextResponse.json(
        { error: 'Investor profile not found' },
        { status: 404 }
      );
    }

    // Get investment performance data
    const performance = await InvestmentService.getInvestmentPerformance(
      params.investmentId,
      investor.id
    );

    return NextResponse.json(performance);
  } catch (error) {
    console.error('Error fetching performance:', error);
    
    if (error instanceof Error && error.message === 'Investment not found') {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}

// Record new performance data (for IoT integration or manual entry)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has admin role or is facility operator
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Verify investment exists
    const investment = await prisma.investment.findUnique({
      where: { id: params.investmentId },
      include: { facility: true }
    });

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    // Record performance
    const performanceRecord = await InvestmentService.recordPerformance({
      investmentId: params.investmentId,
      facilityId: investment.facilityId,
      ...data
    });

    return NextResponse.json(performanceRecord);
  } catch (error) {
    console.error('Error recording performance:', error);
    return NextResponse.json(
      { error: 'Failed to record performance data' },
      { status: 500 }
    );
  }
}