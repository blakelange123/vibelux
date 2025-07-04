import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const facilityId = searchParams.get('facilityId');

  // Mock alerts
  const alerts = [
    {
      id: 1,
      type: 'success',
      message: 'Energy savings target exceeded by 5%',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 2,
      type: 'warning',
      message: 'Power factor below optimal range (0.82)',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];

  return NextResponse.json(alerts);
}