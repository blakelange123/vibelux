import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { InvestmentService } from '@/lib/db/investment';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    
    if (!userId) {
      // In development, return a non-OK status to trigger mock data on frontend
      // but not a 500 error that shows in console
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if InvestmentService exists and is properly initialized
    if (!InvestmentService || !InvestmentService.getInvestorDashboard) {
      return NextResponse.json(
        { message: 'Service not available' },
        { status: 503 }
      );
    }

    // Get investor dashboard data
    const dashboardData = await InvestmentService.getInvestorDashboard(userId);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error in portfolio API:', error);
    
    // In development, return a response that triggers mock data
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { message: 'Using mock data in development' },
        { status: 503 } // Service unavailable, not server error
      );
    }
    
    if (error instanceof Error && error.message === 'Investor not found') {
      return NextResponse.json(
        { error: 'Investor profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}

// Update investor profile
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Update investor profile
    const investor = await InvestmentService.getOrCreateInvestor(userId, {
      companyName: data.companyName,
      investorType: data.investorType,
      accreditedStatus: data.accreditedStatus,
      targetIRR: data.targetIRR,
      riskTolerance: data.riskTolerance,
      investmentFocus: data.investmentFocus
    });

    return NextResponse.json(investor);
  } catch (error) {
    console.error('Error updating investor profile:', error);
    return NextResponse.json(
      { error: 'Failed to update investor profile' },
      { status: 500 }
    );
  }
}