import { NextRequest, NextResponse } from 'next/server';

// Mock energy verification data for testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const facilityId = searchParams.get('facilityId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const baselineId = searchParams.get('baselineId');

  // Mock verification data
  const mockVerification = {
    facilityId,
    baselinePeriod: {
      start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      avgDailyKWh: 1200,
      avgPeakDemand: 250,
      totalCost: 36000,
      weatherNormalized: true
    },
    currentPeriod: {
      start: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(endDate || Date.now()),
      avgDailyKWh: 960,
      avgPeakDemand: 200,
      totalCost: 28800
    },
    savings: {
      energySaved: 7200,
      costSaved: 7200,
      percentageReduction: 20,
      co2Avoided: 2779,
      confidence: 94
    },
    adjustments: {
      weather: 0.98,
      production: 1.05,
      schedule: 1.0
    },
    verificationMethod: 'IPMVP',
    certificationDate: new Date()
  };

  return NextResponse.json(mockVerification);
}