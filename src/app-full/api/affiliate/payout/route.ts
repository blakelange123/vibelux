import { NextRequest, NextResponse } from 'next/server';
import { affiliateSystem } from '@/lib/affiliates/affiliate-system';
import StripeAffiliatePayouts from '@/lib/stripe/affiliate-payouts';

/**
 * Process affiliate payout
 * POST /api/affiliate/payout
 */
export async function POST(request: NextRequest) {
  try {
    const { affiliateId, commissionIds, manual = false } = await request.json();

    if (!affiliateId) {
      return NextResponse.json(
        { error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    // Get affiliate account
    const affiliate = await affiliateSystem.getAffiliate(affiliateId);
    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // Get Stripe account
    const stripeAccount = await StripeAffiliatePayouts.getAffiliateAccount(affiliateId);
    if (!stripeAccount || !stripeAccount.payoutsEnabled) {
      return NextResponse.json(
        { error: 'Affiliate payout account not ready' },
        { status: 400 }
      );
    }

    // Get commissions to pay out
    const commissions = commissionIds 
      ? await affiliateSystem.getCommissionsByIds(commissionIds)
      : await affiliateSystem.getPendingCommissions(affiliateId);

    if (commissions.length === 0) {
      return NextResponse.json(
        { error: 'No commissions to pay out' },
        { status: 400 }
      );
    }

    // Process payout through Stripe
    const payout = await StripeAffiliatePayouts.processAffiliatePayout(
      stripeAccount,
      commissions,
      {
        description: manual ? 'Manual affiliate payout' : 'Scheduled affiliate payout',
      }
    );

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amount: payout.amount / 100, // Convert cents to dollars
        currency: payout.currency,
        status: payout.status,
        commissionsCount: payout.commissionIds.length,
      },
    });

  } catch (error) {
    console.error('Affiliate payout error:', error);
    return NextResponse.json(
      { error: 'Failed to process payout' },
      { status: 500 }
    );
  }
}

/**
 * Get payout history
 * GET /api/affiliate/payout
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliateId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!affiliateId) {
      return NextResponse.json(
        { error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    const payouts = await StripeAffiliatePayouts.getPayoutHistory(affiliateId, {
      limit,
    });

    return NextResponse.json({
      payouts: payouts.map(payout => ({
        id: payout.id,
        amount: payout.amount / 100, // Convert cents to dollars
        currency: payout.currency,
        status: payout.status,
        commissionsCount: payout.commissionIds.length,
        period: payout.metadata.period,
        paidAt: payout.paidAt,
        createdAt: payout.createdAt,
      })),
    });

  } catch (error) {
    console.error('Get payout history error:', error);
    return NextResponse.json(
      { error: 'Failed to get payout history' },
      { status: 500 }
    );
  }
}