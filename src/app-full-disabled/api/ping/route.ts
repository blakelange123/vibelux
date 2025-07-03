import { NextRequest, NextResponse } from 'next/server';

// Simple ping endpoint for connection monitoring
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}