import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { creditSystem, CreditProfile } from '@/lib/credit-building-system';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID required' }, { status: 400 });
    }

    // In production, fetch from database
    // For demo, return mock credit profile
    const mockProfile: CreditProfile = {
      id: `credit_${facilityId}`,
      facilityId,
      creditScore: 720,
      paymentHistory: [
        {
          id: '1',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          amount: 5000,
          dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          paidDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
          status: 'on-time',
          daysLate: 0
        },
        {
          id: '2',
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          amount: 4800,
          dueDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
          paidDate: new Date(Date.now() - 54 * 24 * 60 * 60 * 1000),
          status: 'on-time',
          daysLate: 0
        }
      ],
      performanceMetrics: {
        yieldConsistency: 85,
        energyEfficiency: 90,
        qualityMaintenance: 92,
        complianceRecord: 88,
        overallScore: 89
      },
      reportingConsistency: 85,
      verifiedData: true,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(),
      externalReporting: {
        enabled: true,
        bureaus: ['Experian Business', 'Dun & Bradstreet'],
        lastReported: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    };

    return NextResponse.json(mockProfile);
  } catch (error) {
    console.error('Error fetching credit score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { facilityId, paymentHistory, performanceData, reportingConsistency } = body;

    if (!facilityId || !paymentHistory || !performanceData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate credit score
    const creditScore = creditSystem.calculateCreditScore(
      facilityId,
      paymentHistory,
      performanceData,
      reportingConsistency || 85
    );

    // In production, save to database
    const updatedProfile: CreditProfile = {
      id: `credit_${facilityId}`,
      facilityId,
      creditScore,
      paymentHistory,
      performanceMetrics: {
        yieldConsistency: 85,
        energyEfficiency: 90,
        qualityMaintenance: 92,
        complianceRecord: 88,
        overallScore: 89
      },
      reportingConsistency: reportingConsistency || 85,
      verifiedData: true,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(),
      externalReporting: {
        enabled: true,
        bureaus: ['Experian Business', 'Dun & Bradstreet'],
        lastReported: new Date()
      }
    };

    return NextResponse.json({
      success: true,
      creditScore,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating credit score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { facilityId, paymentRecord } = body;

    if (!facilityId || !paymentRecord) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In production, add payment record to database and recalculate score
    // For demo, return success
    return NextResponse.json({
      success: true,
      message: 'Payment record added successfully'
    });
  } catch (error) {
    console.error('Error adding payment record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}