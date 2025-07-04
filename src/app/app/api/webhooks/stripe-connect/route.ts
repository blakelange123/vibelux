import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
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

const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET!;

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

    // Handle the event
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        
        // Update affiliate account status
        // TODO: Update database when schema is applied
        // await db.affiliates.update({
        //   where: { stripe_account_id: account.id },
        //   data: {
        //     stripe_charges_enabled: account.charges_enabled,
        //     stripe_payouts_enabled: account.payouts_enabled,
        //     stripe_onboarding_complete: account.details_submitted,
        //   }
        // });
        
        break;
      }

      case 'account.application.authorized': {
        const application = event.data.object;
        break;
      }

      case 'account.application.deauthorized': {
        const application = event.data.object;
        
        // Suspend affiliate account
        // TODO: Update database when schema is applied
        // await db.affiliates.update({
        //   where: { stripe_account_id: application.account },
        //   data: { status: 'suspended' }
        // });
        
        break;
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer;
        
        // Record payout initiation
        // TODO: Update database when schema is applied
        // await db.affiliatePayouts.update({
        //   where: { stripe_transfer_id: transfer.id },
        //   data: { 
        //     status: 'processing',
        //     processed_at: new Date()
        //   }
        // });
        
        break;
      }

      case 'transfer.paid': {
        const transfer = event.data.object as Stripe.Transfer;
        
        // Mark payout as completed
        // TODO: Update database when schema is applied
        // await db.affiliatePayouts.update({
        //   where: { stripe_transfer_id: transfer.id },
        //   data: { 
        //     status: 'paid',
        //     paid_at: new Date()
        //   }
        // });
        
        // Mark associated commissions as paid
        // const payout = await db.affiliatePayouts.findUnique({
        //   where: { stripe_transfer_id: transfer.id }
        // });
        // if (payout) {
        //   await db.affiliateCommissions.updateMany({
        //     where: { id: { in: payout.commission_ids } },
        //     data: { status: 'paid' }
        //   });
        // }
        
        break;
      }

      case 'transfer.failed': {
        const transfer = event.data.object as Stripe.Transfer;
        
        // Mark payout as failed
        // TODO: Update database when schema is applied
        // await db.affiliatePayouts.update({
        //   where: { stripe_transfer_id: transfer.id },
        //   data: { 
        //     status: 'failed',
        //     failure_reason: transfer.failure_message || 'Unknown error'
        //   }
        // });
        
        break;
      }

      case 'payout.created':
      case 'payout.paid':
      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout;
        
        // Track payout status for affiliate accounts
        // This helps us know when affiliates actually receive their money
        break;
      }

      case 'person.created':
      case 'person.updated': {
        // Handle identity verification for affiliate accounts
        const person = event.data.object;
        break;
      }

      case 'capability.updated': {
        // Handle capability updates (transfers, payouts, etc)
        const capability = event.data.object;
        break;
      }

      default:
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Stripe Connect webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Helper function to send notification emails
async function sendAffiliateNotification(
  affiliateId: string,
  type: string,
  subject: string,
  message: string
) {
  try {
    // Get affiliate email
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      select: { email: true, name: true }
    });
    
    if (!affiliate) {
      console.error('Affiliate not found:', affiliateId);
      return;
    }
    
    // Send email notification
    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: affiliate.email,
        subject,
        html: `
          <h2>Hi ${affiliate.name},</h2>
          <p>${message}</p>
          <hr>
          <p>Best regards,<br>VibeLux Team</p>
        `
      })
    });
    
    // Save notification to database
    await prisma.affiliateNotification.create({
      data: {
        affiliateId,
        type,
        subject,
        message,
        sentAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error sending affiliate notification:', error);
  }
}