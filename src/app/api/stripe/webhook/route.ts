import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Handle successful subscription
        console.log('Checkout completed:', {
          customerId: session.customer,
          subscriptionId: session.subscription,
          userId: session.metadata?.userId,
          planId: session.metadata?.planId,
        });

        // TODO: Update user's subscription in database
        // This would typically involve:
        // 1. Finding the user by userId from metadata
        // 2. Updating their subscription status
        // 3. Storing the Stripe customer ID and subscription ID
        
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Handle subscription updates (plan changes, etc.)
        console.log('Subscription updated:', {
          id: subscription.id,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id,
        });
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Handle subscription cancellation
        console.log('Subscription canceled:', {
          id: subscription.id,
          customerId: subscription.customer,
        });
        
        // TODO: Downgrade user to free plan
        
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Handle failed payment
        console.log('Payment failed:', {
          customerId: invoice.customer,
          subscriptionId: invoice.subscription,
        });
        
        // TODO: Send email to customer about failed payment
        
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
}