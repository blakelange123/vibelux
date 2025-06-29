import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe, PRICING_PLANS } from '@/lib/stripe';
import { db, prisma } from '@/lib/db';
import Stripe from 'stripe';
import { sendSubscriptionCancellationEmail, sendPaymentFailedEmail } from '@/lib/email/payment-notifications';
import { ConsultationEmailService } from '@/lib/email/consultation-notifications';

// Webhook event tracking for idempotency
const processedEvents = new Map<string, Date>();
const EVENT_RETENTION_HOURS = 24;

// Clean up old processed events periodically
setInterval(() => {
  const cutoffTime = new Date(Date.now() - EVENT_RETENTION_HOURS * 60 * 60 * 1000);
  for (const [eventId, processedAt] of processedEvents.entries()) {
    if (processedAt < cutoffTime) {
      processedEvents.delete(eventId);
    }
  }
}, 60 * 60 * 1000); // Clean up hourly

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;

  if (!signature) {
    console.error('Missing stripe-signature header');
    return new NextResponse('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    // Log potential attack
    await logSecurityEvent('stripe_webhook_invalid_signature', {
      error: error.message,
      ip: headersList.get('x-forwarded-for') || 'unknown'
    });
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Idempotency check
  if (processedEvents.has(event.id)) {
    console.log(`Duplicate webhook event ${event.id} - skipping`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Mark event as processed
  processedEvents.set(event.id, new Date());

  // Log webhook event
  console.log(`Processing webhook event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Handle both subscriptions and consultations
        if (session.metadata?.type === 'consultation') {
          await handleConsultationCheckoutCompleted(session);
        } else {
          await handleCheckoutSessionCompleted(session);
        }
        break;
      }

      case 'customer.subscription.created': {
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      }

      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      }

      case 'invoice.payment_failed': {
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      }

      case 'customer.subscription.trial_will_end': {
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;
      }

      case 'payment_method.attached': {
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
        break;
      }

      case 'payment_method.detached': {
        await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    // Log successful processing
    await logWebhookEvent(event.id, event.type, 'success');

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error);
    
    // Log failed processing
    await logWebhookEvent(event.id, event.type, 'failed', error);

    // Don't return 500 for non-critical errors to prevent Stripe retries
    if (isCriticalError(error)) {
      return new NextResponse('Webhook handler failed', { status: 500 });
    }

    // Return success for non-critical errors
    return NextResponse.json({ 
      received: true, 
      warning: 'Processing completed with errors' 
    });
  }
}

// Handler functions with comprehensive error handling

async function handleConsultationCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const consultationId = session.metadata?.consultationId;
    
    if (!consultationId) {
      console.error('No consultation ID in session metadata');
      return;
    }

    // Update consultation status and payment
    await retryOperation(async () => {
      await prisma.consultation.update({
        where: { id: consultationId },
        data: {
          paymentStatus: 'CAPTURED',
          paidAt: new Date(),
          status: 'APPROVED' // Auto-approve after payment
        }
      });
    }, 3, 1000);

    // Get full consultation data for emails and stats
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        expert: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        },
        client: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (consultation) {
      await retryOperation(async () => {
        await prisma.expert.update({
          where: { id: consultation.expertId },
          data: {
            totalEarnings: {
              increment: consultation.expertEarnings
            }
          }
        });
      }, 3, 1000);

      // Log consultation payment
      await prisma.auditLog.create({
        data: {
          userId: consultation.clientId,
          action: 'CONSULTATION_PAID',
          resourceType: 'consultation',
          resourceId: consultationId,
          metadata: {
            expertId: consultation.expertId,
            amount: consultation.totalAmount,
            expertEarnings: consultation.expertEarnings,
            platformFee: consultation.platformFee
          },
          createdAt: new Date()
        }
      });

      // Send confirmation email to client
      try {
        await ConsultationEmailService.sendConsultationConfirmation({
          id: consultation.id,
          scheduledStart: consultation.scheduledStart,
          duration: consultation.duration,
          objectives: consultation.objectives,
          totalAmount: consultation.totalAmount,
          expert: {
            displayName: consultation.expert.displayName,
            email: consultation.expert.user.email
          },
          client: {
            name: consultation.client.name || 'Client',
            email: consultation.client.email || ''
          }
        });

        // Schedule reminder emails
        await ConsultationEmailService.scheduleReminders({
          id: consultation.id,
          scheduledStart: consultation.scheduledStart,
          duration: consultation.duration,
          objectives: consultation.objectives,
          totalAmount: consultation.totalAmount,
          expert: {
            displayName: consultation.expert.displayName,
            email: consultation.expert.user.email
          },
          client: {
            name: consultation.client.name || 'Client',
            email: consultation.client.email || ''
          }
        });
      } catch (emailError) {
        console.error('Failed to send consultation confirmation emails:', emailError);
      }
    }

    console.log(`Payment completed for consultation ${consultationId}`);
    
  } catch (error) {
    console.error('Error handling consultation checkout completed:', error);
    throw error;
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    if (!session.metadata?.userId || !session.metadata?.planId) {
      console.error('Missing required metadata in checkout session', session.id);
      return;
    }

    const planId = session.metadata.planId;
    const subscriptionTier = planId.toUpperCase();
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    // Get subscription details from Stripe
    let subscription: Stripe.Subscription | null = null;
    if (subscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(subscriptionId);
      } catch (error) {
        console.error('Failed to retrieve subscription:', error);
      }
    }

    // Update user with retry logic
    await retryOperation(async () => {
      await db.users.update(session.metadata!.userId, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionTier: subscriptionTier,
        subscriptionStatus: 'active',
        subscriptionPeriodEnd: subscription?.current_period_end 
          ? new Date(subscription.current_period_end * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }, 3, 1000);

    // Log subscription creation
    await prisma.auditLog.create({
      data: {
        userId: session.metadata.userId,
        action: 'SUBSCRIPTION_CREATED',
        resourceType: 'subscription',
        resourceId: subscriptionId,
        metadata: {
          planId,
          customerId,
          amount: session.amount_total,
          currency: session.currency
        },
        createdAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const user = await db.users.findByStripeCustomerId(subscription.customer as string);
    if (!user) {
      console.warn(`User not found for customer ${subscription.customer}`);
      return;
    }

    // Log subscription creation
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SUBSCRIPTION_STARTED',
        resourceType: 'subscription',
        resourceId: subscription.id,
        metadata: {
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id
        },
        createdAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error handling subscription creation:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const user = await db.users.findByStripeCustomerId(subscription.customer as string);
    if (!user) {
      console.warn(`User not found for customer ${subscription.customer}`);
      return;
    }

    // Determine new tier from price ID
    const priceId = subscription.items.data[0]?.price.id;
    const newTier = getPlanFromPriceId(priceId);

    await retryOperation(async () => {
      await db.users.update(user.id, {
        subscriptionTier: newTier,
        subscriptionStatus: subscription.status,
        subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000)
      });
    }, 3, 1000);

    // Log plan change
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SUBSCRIPTION_UPDATED',
        resourceType: 'subscription',
        resourceId: subscription.id,
        metadata: {
          oldTier: user.subscriptionTier,
          newTier,
          status: subscription.status
        },
        createdAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error handling subscription update:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const user = await db.users.findByStripeCustomerId(subscription.customer as string);
    if (!user) {
      console.warn(`User not found for customer ${subscription.customer}`);
      return;
    }

    await retryOperation(async () => {
      await db.users.update(user.id, {
        subscriptionTier: 'FREE',
        subscriptionStatus: 'canceled',
        stripeSubscriptionId: null,
        subscriptionPeriodEnd: new Date()
      });
    }, 3, 1000);

    // Send cancellation email with error handling
    try {
      await sendSubscriptionCancellationEmail(user.email, user.name || 'Customer');
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Don't throw - email failure shouldn't break the webhook
    }

    // Log cancellation
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SUBSCRIPTION_CANCELED',
        resourceType: 'subscription',
        resourceId: subscription.id,
        metadata: {
          reason: subscription.cancellation_details?.reason || 'user_initiated'
        },
        createdAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error handling subscription deletion:', error);
    throw error;
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const user = await db.users.findByStripeCustomerId(invoice.customer as string);
    if (!user) {
      console.warn(`User not found for customer ${invoice.customer}`);
      return;
    }

    // Send payment failed email with error handling
    try {
      await sendPaymentFailedEmail(
        user.email,
        user.name || 'Customer',
        {
          amount: (invoice.amount_due / 100).toFixed(2),
          currency: invoice.currency.toUpperCase(),
          attemptCount: invoice.attempt_count,
          nextRetryDate: invoice.next_payment_attempt 
            ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString() 
            : null
        }
      );
    } catch (emailError) {
      console.error('Failed to send payment failed email:', emailError);
    }

    // Update subscription status based on retry count
    const newStatus = invoice.attempt_count >= 3 ? 'past_due' : 'active';
    
    await retryOperation(async () => {
      await db.users.update(user.id, {
        subscriptionStatus: newStatus
      });
    }, 3, 1000);

    // Log payment failure
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PAYMENT_FAILED',
        resourceType: 'invoice',
        resourceId: invoice.id,
        metadata: {
          amount: invoice.amount_due,
          currency: invoice.currency,
          attemptCount: invoice.attempt_count,
          error: invoice.last_finalization_error?.message
        },
        createdAt: new Date()
      }
    });

    // If final attempt failed, schedule downgrade
    if (invoice.attempt_count >= 4 && !invoice.next_payment_attempt) {
      await scheduleSubscriptionDowngrade(user.id, 7); // Downgrade in 7 days
    }

  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const user = await db.users.findByStripeCustomerId(invoice.customer as string);
    if (!user) {
      console.warn(`User not found for customer ${invoice.customer}`);
      return;
    }

    // Clear any past_due status
    if (user.subscriptionStatus === 'past_due') {
      await retryOperation(async () => {
        await db.users.update(user.id, {
          subscriptionStatus: 'active'
        });
      }, 3, 1000);
    }

    // Cancel any pending downgrades
    await cancelScheduledDowngrade(user.id);

  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    const user = await db.users.findByStripeCustomerId(subscription.customer as string);
    if (!user) return;

    // Send trial ending reminder email
    const daysRemaining = Math.ceil(
      (subscription.trial_end! * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
    );

    // TODO: Implement sendTrialEndingEmail
    console.log(`Trial ending in ${daysRemaining} days for user ${user.email}`);

  } catch (error) {
    console.error('Error handling trial will end:', error);
    // Non-critical error - don't throw
  }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  // Log payment method attachment for security
  console.log(`Payment method ${paymentMethod.id} attached to customer ${paymentMethod.customer}`);
}

async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  // Log payment method detachment for security
  console.log(`Payment method ${paymentMethod.id} detached`);
}

// Helper functions

async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }
  
  throw lastError;
}

function getPlanFromPriceId(priceId: string): string {
  // Map Stripe price IDs to plan tiers
  const priceMap: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENTIAL!]: 'ESSENTIAL',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL!]: 'PROFESSIONAL',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE!]: 'ENTERPRISE'
  };
  
  return priceMap[priceId] || 'FREE';
}

function isCriticalError(error: any): boolean {
  // Determine if error should trigger webhook retry
  if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
    return true; // Database connection errors
  }
  
  if (error?.message?.includes('duplicate key')) {
    return false; // Idempotency issue, not critical
  }
  
  return false; // Default to non-critical
}

async function logWebhookEvent(
  eventId: string,
  eventType: string,
  status: 'success' | 'failed',
  error?: any
) {
  try {
    await prisma.webhookEvent.create({
      data: {
        eventId,
        eventType,
        status,
        error: error ? JSON.stringify(error) : null,
        processedAt: new Date()
      }
    });
  } catch (logError) {
    console.error('Failed to log webhook event:', logError);
  }
}

async function logSecurityEvent(eventType: string, metadata: any) {
  try {
    await prisma.securityEvent.create({
      data: {
        eventType,
        severity: 'medium',
        metadata,
        createdAt: new Date()
      }
    });
  } catch (logError) {
    console.error('Failed to log security event:', logError);
  }
}

async function scheduleSubscriptionDowngrade(userId: string, daysDelay: number) {
  // TODO: Implement job scheduling for subscription downgrade
  console.log(`Scheduling downgrade for user ${userId} in ${daysDelay} days`);
}

async function cancelScheduledDowngrade(userId: string) {
  // TODO: Cancel any scheduled downgrade jobs
  console.log(`Canceling scheduled downgrade for user ${userId}`);
}