import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { stripe, PRICING_PLANS } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { priceId, planId } = await req.json();

    // Find the plan
    const plan = Object.values(PRICING_PLANS).find(p => p.id === planId);
    if (!plan || plan.id === 'free') {
      return new NextResponse('Invalid plan', { status: 400 });
    }

    // Determine the price ID
    let finalPriceId = priceId;
    if (!finalPriceId) {
      // Check if plan has stripePriceId
      const planWithPrice = plan as any;
      if (planWithPrice.stripePriceId) {
        if (typeof planWithPrice.stripePriceId === 'object') {
          finalPriceId = planWithPrice.stripePriceId.monthly;
        } else {
          finalPriceId = planWithPrice.stripePriceId;
        }
      }
    }

    if (!finalPriceId) {
      return new NextResponse('No price ID available for this plan', { status: 400 });
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: session.userId,
        planId: plan.id,
      },
      customer_email: session.sessionClaims?.email as string,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}