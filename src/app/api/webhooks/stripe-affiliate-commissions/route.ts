import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { trackAffiliateConversion } from '@/middleware/affiliate-tracking';
import { getSmartCommissionRate } from '@/lib/affiliates/smart-commission-structure';

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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle commission-triggering events
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleNewSubscription(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleSuccessfulPayment(invoice);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const previousAttributes = event.data.previous_attributes as any;
        
        // Check if this is an upgrade
        if (previousAttributes?.items) {
          await handleSubscriptionUpgrade(subscription, previousAttributes);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription);
        break;
      }

      default:
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Stripe affiliate webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleNewSubscription(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionAmount = subscription.items.data[0].price.unit_amount! / 100;
  
  // Get customer metadata to check for affiliate attribution
  const customer = await getStripe().customers.retrieve(customerId) as Stripe.Customer;
  const affiliateId = customer.metadata?.affiliate_id;
  
  if (!affiliateId) {
    return;
  }
  
  // Track subscription conversion
  // Track subscription conversion
  // Analytics would be sent here
  
  // Calculate commission
  const commissionRate = getSmartCommissionRate('subscription', 0);
  const commissionAmount = (subscriptionAmount * commissionRate) / 100;
  
  // TODO: Create commission record in database
  // await db.affiliateCommissions.create({
  //   data: {
  //     affiliate_id: affiliateId,
  //     commission_type: 'recurring',
  //     base_amount: subscriptionAmount,
  //     commission_rate: commissionRate,
  //     commission_amount: commissionAmount,
  //     customer_months_active: 0,
  //     current_rate_tier: 'months1to6',
  //     commission_month: new Date().toISOString().slice(0, 7),
  //     metadata: {
  //       stripe_subscription_id: subscription.id,
  //       stripe_customer_id: customerId,
  //       subscription_tier: subscription.metadata?.tier || 'unknown'
  //     }
  //   }
  // });
  
  // Send notification to affiliate
  // await sendAffiliateNotification(
  //   affiliateId,
  //   'new_referral',
  //   'New Customer Referral! 🎉',
  //   `Great news! A customer you referred just subscribed. You've earned a ${commissionRate}% commission ($${commissionAmount.toFixed(2)}).`
  // );
}

async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return; // One-time payment, not recurring
  
  const customerId = invoice.customer as string;
  const customer = await getStripe().customers.retrieve(customerId) as Stripe.Customer;
  const affiliateId = customer.metadata?.affiliate_id;
  
  if (!affiliateId) return;
  
  // Calculate how long customer has been active
  const subscription = await getStripe().subscriptions.retrieve(invoice.subscription as string);
  const monthsActive = Math.floor(
    (Date.now() - subscription.created * 1000) / (30 * 24 * 60 * 60 * 1000)
  );
  
  // Get appropriate commission rate based on customer age
  const commissionRate = getSmartCommissionRate('subscription', monthsActive);
  const paymentAmount = invoice.amount_paid / 100;
  const commissionAmount = (paymentAmount * commissionRate) / 100;
  
  // Analytics would be sent here
  
  // TODO: Create commission record
  // await db.affiliateCommissions.create({
  //   data: {
  //     affiliate_id: affiliateId,
  //     commission_type: 'recurring',
  //     base_amount: paymentAmount,
  //     commission_rate: commissionRate,
  //     commission_amount: commissionAmount,
  //     customer_months_active: monthsActive,
  //     current_rate_tier: getRateTier(monthsActive),
  //     commission_month: new Date().toISOString().slice(0, 7),
  //     metadata: {
  //       stripe_invoice_id: invoice.id,
  //       stripe_subscription_id: subscription.id,
  //     }
  //   }
  // });
}

async function handleSubscriptionUpgrade(
  subscription: Stripe.Subscription,
  previousAttributes: any
) {
  const customerId = subscription.customer as string;
  const customer = await getStripe().customers.retrieve(customerId) as Stripe.Customer;
  const affiliateId = customer.metadata?.affiliate_id;
  
  if (!affiliateId) return;
  
  const oldAmount = previousAttributes.items.data[0]?.price.unit_amount || 0;
  const newAmount = subscription.items.data[0].price.unit_amount!;
  const upgradeDifference = (newAmount - oldAmount) / 100;
  
  if (upgradeDifference <= 0) return; // Not an upgrade
  
  // Upgrades get a bonus commission
  const upgradeBonus = upgradeDifference * 0.5; // 50% of the upgrade value
  
  // Analytics would be sent here
  
  // TODO: Create bonus commission
  // await db.affiliateCommissions.create({
  //   data: {
  //     affiliate_id: affiliateId,
  //     commission_type: 'growth_bonus',
  //     base_amount: upgradeDifference,
  //     commission_rate: 50,
  //     commission_amount: upgradeBonus,
  //     commission_month: new Date().toISOString().slice(0, 7),
  //     description: 'Customer upgrade bonus',
  //   }
  // });
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Analytics would be sent here
  
  // TODO: Update customer status in affiliate tracking
  // This affects active referral counts and tier status
}

function getRateTier(monthsActive: number): string {
  if (monthsActive <= 6) return 'months1to6';
  if (monthsActive <= 18) return 'months7to18';
  if (monthsActive <= 36) return 'months19to36';
  return 'months37plus';
}