import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { affiliateId, email, country = 'US' } = await request.json();
    
    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        affiliate_id: affiliateId,
        user_id: userId,
      },
    });
    
    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/affiliate/dashboard?onboarding=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/affiliate/dashboard?onboarding=complete`,
      type: 'account_onboarding',
    });
    
    // TODO: Update affiliate record with Stripe account ID
    // await db.affiliates.update({
    //   where: { id: affiliateId },
    //   data: { 
    //     stripe_account_id: account.id,
    //     status: 'pending' // Will be updated to 'active' after onboarding
    //   }
    // });
    
    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
    
  } catch (error) {
    console.error('Failed to create Connect account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id');
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID required' },
        { status: 400 }
      );
    }
    
    // Get account status
    const account = await stripe.accounts.retrieve(accountId);
    
    const status = {
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
    };
    
    // If onboarding is incomplete, generate new link
    let onboardingUrl = null;
    if (!account.details_submitted) {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/affiliate/dashboard?onboarding=refresh`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/affiliate/dashboard?onboarding=complete`,
        type: 'account_onboarding',
      });
      onboardingUrl = accountLink.url;
    }
    
    return NextResponse.json({
      status,
      onboardingUrl,
    });
    
  } catch (error) {
    console.error('Failed to get account status:', error);
    return NextResponse.json(
      { error: 'Failed to get account status' },
      { status: 500 }
    );
  }
}