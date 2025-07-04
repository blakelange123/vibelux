import { NextRequest, NextResponse } from 'next/server';
import { ThirdPartyValidationService } from '@/lib/verification/third-party-validator';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const {
      facilityId,
      claimedSavings,
      startDate,
      endDate,
      validationLevel = 'automated'
    } = data;
    
    // Validate input
    if (!facilityId || !claimedSavings || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const validator = new ThirdPartyValidationService();
    const result = await validator.validateSavingsClaims(
      facilityId,
      claimedSavings,
      new Date(startDate),
      new Date(endDate),
      validationLevel
    );
    
    return NextResponse.json({
      success: true,
      validation: result,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Validation request error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}