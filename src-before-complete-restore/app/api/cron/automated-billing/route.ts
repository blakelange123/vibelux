import { NextRequest, NextResponse } from 'next/server';
import { processAutomatedBilling } from '@/services/invoice-generation';
import { processDisputesAutomatically } from '@/services/dispute-resolution';

export async function GET(req: NextRequest) {
  try {
    // Verify this is a valid cron request (in production, verify with a secret)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    // Process automated billing
    await processAutomatedBilling();
    
    // Process any pending disputes
    await processDisputesAutomatically();
    

    return NextResponse.json({ 
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Automated billing and dispute resolution completed'
    });

  } catch (error) {
    console.error('Error in automated billing cron job:', error);
    return NextResponse.json({ 
      error: 'Failed to process automated billing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// This endpoint can be called by:
// 1. Vercel Cron Jobs
// 2. External cron services
// 3. GitHub Actions
// 4. Manual trigger from admin panel