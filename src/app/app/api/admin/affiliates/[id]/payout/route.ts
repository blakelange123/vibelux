import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

// Initialize Stripe lazily to avoid build-time errors
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
    });
  }
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }
  return stripe;
}

// Admin check middleware
async function isAdmin(userId: string): Promise<boolean> {
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  return adminIds.includes(userId);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { 
      amount, 
      reason = 'Manual payout', 
      notes,
      commissionIds = []
    } = await request.json();

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid payout amount' },
        { status: 400 }
      );
    }

    // TODO: Get affiliate from database
    // const affiliate = await db.affiliates.findUnique({
    //   where: { id: params.id }
    // });

    // Mock affiliate data
    const affiliate = {
      id: params.id,
      stripeAccountId: 'acct_1234567890',
      email: 'affiliate@example.com',
      name: 'Test Affiliate'
    };

    if (!affiliate.stripeAccountId) {
      return NextResponse.json(
        { error: 'Affiliate has not completed Stripe onboarding' },
        { status: 400 }
      );
    }

    // Create Stripe transfer
    const transfer = await getStripe().transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: affiliate.stripeAccountId,
      description: `${reason} - Admin: ${userId}`,
      metadata: {
        affiliate_id: params.id,
        admin_id: userId,
        reason,
        notes: notes || '',
        commission_ids: commissionIds.join(',')
      }
    });

    // Log admin action
    const payoutRecord = {
      affiliateId: params.id,
      amount,
      currency: 'USD',
      stripeTransferId: transfer.id,
      reason,
      notes,
      processedBy: userId,
      processedAt: new Date().toISOString(),
      commissionIds
    };


    // TODO: Create payout record in database
    // const payout = await db.affiliatePayouts.create({
    //   data: {
    //     affiliate_id: params.id,
    //     amount,
    //     currency: 'USD',
    //     stripe_transfer_id: transfer.id,
    //     commission_ids: commissionIds,
    //     status: 'processing',
    //     payout_method: 'stripe',
    //     notes: `${reason}${notes ? ': ' + notes : ''} (Admin: ${userId})`,
    //     period_start: new Date(),
    //     period_end: new Date(),
    //   }
    // });

    // Update commission statuses if provided
    // if (commissionIds.length > 0) {
    //   await db.affiliateCommissions.updateMany({
    //     where: { id: { in: commissionIds } },
    //     data: { status: 'paid' }
    //   });
    // }

    // Send notification email
    // await affiliateEmailNotifications.sendPayoutEmail({
    //   affiliateName: affiliate.name,
    //   affiliateEmail: affiliate.email,
    //   affiliateCode: affiliate.code,
    //   payoutAmount: amount,
    //   payoutPeriod: 'Manual payout',
    //   commissionsCount: commissionIds.length,
    //   nextPayoutDate: 'N/A'
    // });

    return NextResponse.json({ 
      success: true,
      payout: {
        id: transfer.id,
        amount,
        status: 'processing',
        processedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Failed to process manual payout:', error);
    return NextResponse.json(
      { error: 'Failed to process payout' },
      { status: 500 }
    );
  }
}