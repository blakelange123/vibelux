import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { DataRetentionService, runScheduledDataRetention } from '@/lib/privacy-controls';
import { validateApiAccess } from '@/middleware/security';

// Run data retention cleanup (for scheduled jobs)
export async function POST(request: NextRequest) {
  try {
    // Check for API key for automated jobs
    const apiKeyHeader = request.headers.get('x-api-key');
    const cronApiKey = process.env.CRON_API_KEY;
    
    if (apiKeyHeader && cronApiKey && apiKeyHeader === cronApiKey) {
      // Automated job - run retention cleanup
      const result = await runScheduledDataRetention();
      return NextResponse.json(result);
    }

    // Manual execution - check admin authentication
    const { isAuthenticated, userId } = await authenticateRequest(request);
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user has admin privileges
    // This would need to be implemented based on your admin system

    const result = await runScheduledDataRetention();
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Data retention cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to run data retention cleanup' },
      { status: 500 }
    );
  }
}

// Get facility data retention policy
export async function GET(request: NextRequest) {
  try {
    const { isAuthenticated, userId } = await authenticateRequest(request);
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    const policy = await DataRetentionService.getFacilityPolicy(facilityId);

    return NextResponse.json({
      success: true,
      policy
    });
  } catch (error) {
    console.error('Data retention policy fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data retention policy' },
      { status: 500 }
    );
  }
}