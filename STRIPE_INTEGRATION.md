# Stripe Payment Integration

This document describes the Stripe integration for Vibelux subscription management.

## Overview

The Vibelux app uses Stripe for handling subscription payments with three tiers:
- **Free**: $0/month - Basic features for hobbyists
- **Professional**: $49/month or $470/year - Full features for growing operations
- **Enterprise**: $199/month or $1,910/year - Advanced features for commercial facilities

## Setup Instructions

### 1. Environment Variables

Copy the `.env.example` file to `.env.local` and add your Stripe keys:

```bash
# Stripe Keys (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_PRO_MONTHLY_PRICE_ID="price_..."
STRIPE_PRO_ANNUAL_PRICE_ID="price_..."
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID="price_..."
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID="price_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Create Products and Prices in Stripe

1. Go to [Stripe Dashboard > Products](https://dashboard.stripe.com/test/products)
2. Create products for Professional and Enterprise plans
3. For each product, create two prices:
   - Monthly recurring price
   - Annual recurring price (with 20% discount)
4. Copy the price IDs to your `.env.local` file

### 3. Set Up Webhook Endpoint

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 4. Configure Customer Portal

1. Go to [Stripe Dashboard > Customer Portal](https://dashboard.stripe.com/test/settings/billing/portal)
2. Enable the customer portal
3. Configure available features:
   - Update payment method
   - Cancel subscription
   - View invoices
   - Update billing address

## Implementation Details

### Key Files

- `/src/lib/stripe.ts` - Stripe configuration and pricing plans
- `/src/app/api/stripe/create-checkout-session/route.ts` - Creates checkout sessions
- `/src/app/api/stripe/webhook/route.ts` - Handles Stripe webhooks
- `/src/app/api/stripe/customer-portal/route.ts` - Creates customer portal sessions
- `/src/components/StripeCheckout.tsx` - Checkout button component
- `/src/components/SubscriptionManager.tsx` - Subscription management UI

### User Flow

1. **Sign Up/Subscribe**:
   - User clicks "Start Free Trial" on pricing page
   - Redirected to Stripe Checkout with 14-day trial
   - After completion, redirected back to dashboard

2. **Manage Subscription**:
   - User clicks "Manage Subscription" in settings
   - Redirected to Stripe Customer Portal
   - Can update payment, cancel, or view invoices

3. **Webhook Processing**:
   - Stripe sends events to webhook endpoint
   - App updates user subscription status in database
   - User access is granted/revoked based on status

## Testing

### Test Cards

Use these test card numbers in Stripe Checkout:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### Webhook Testing

Use the [Stripe CLI](https://stripe.com/docs/stripe-cli) to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

## Database Integration

The webhook handler includes TODO comments for database operations. Implement these based on your database schema:

```typescript
// Example Prisma schema
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  stripeCustomerId  String?   @unique
  subscription      Subscription?
}

model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  stripeSubscriptionId  String   @unique
  stripePriceId     String
  status            String
  currentPeriodEnd  DateTime
  cancelAtPeriodEnd Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

## Security Considerations

1. **Webhook Verification**: Always verify webhook signatures to ensure requests come from Stripe
2. **Authentication**: Require user authentication for all subscription endpoints
3. **HTTPS**: Always use HTTPS in production for secure communication
4. **API Keys**: Never commit API keys to version control
5. **Access Control**: Implement proper feature gating based on subscription status

## Troubleshooting

### Common Issues

1. **"No such price" error**:
   - Ensure price IDs in `.env.local` match your Stripe dashboard
   - Check you're using the correct environment (test vs live)

2. **Webhook signature verification failed**:
   - Ensure `STRIPE_WEBHOOK_SECRET` is correct
   - Check request body is raw (not parsed)

3. **Customer portal not opening**:
   - Enable customer portal in Stripe dashboard
   - Ensure customer has active subscription

## Next Steps

1. Implement database operations in webhook handler
2. Add subscription status checks to protected routes
3. Create admin dashboard for subscription management
4. Set up email notifications for subscription events
5. Implement usage-based billing for AI features