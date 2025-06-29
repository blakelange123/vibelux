import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({
        plan: 'free',
        usage: {},
        features: {}
      });
    }

    // Get user's subscription from database
    const user = await db.users.findUnique(userId);
    
    // Get usage records for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Mock usage data - in production, query from UsageRecord table
    const usage = {
      apiCalls: 150,
      aiQueries: 23,
      exports: 5,
      roomsCreated: 3,
      fixturesAdded: 45
    };

    return NextResponse.json({
      plan: (user as any)?.subscriptionTier?.toLowerCase() || 'free',
      usage,
      customerId: (user as any)?.stripeCustomerId || null,
      subscriptionId: (user as any)?.stripeSubscriptionId || null,
      currentPeriodEnd: (user as any)?.subscriptionPeriodEnd || null
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json({
      plan: 'free',
      usage: {},
      error: 'Failed to fetch subscription'
    }, { status: 500 });
  }
}