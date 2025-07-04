import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    if (!stripe) {
      return NextResponse.json({
        status: 'unhealthy',
        error: 'Stripe not configured - missing STRIPE_SECRET_KEY',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    // Test Stripe connection by fetching account details
    const account = await stripe.accounts.retrieve();
    
    return NextResponse.json({
      status: 'healthy',
      account: {
        id: account.id,
        country: account.country,
        defaultCurrency: account.default_currency,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stripe health check error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for common Stripe errors
    if (errorMessage.includes('Invalid API Key')) {
      return NextResponse.json({
        status: 'unhealthy',
        error: 'Invalid Stripe API key',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    if (errorMessage.includes('testmode')) {
      return NextResponse.json({
        status: 'healthy',
        mode: 'test',
        warning: 'Stripe is in test mode',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      status: 'unhealthy',
      error: `Stripe connection failed: ${errorMessage}`,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}