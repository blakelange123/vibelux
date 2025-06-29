# VibeLux Financial Automation Setup Guide

## Overview

This guide covers the complete setup and configuration of VibeLux's automated financial processing system, which eliminates manual processes for invoice generation, payment collection, utility verification, and revenue sharing.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Configuration](#database-configuration)
5. [Third-Party Service Setup](#third-party-service-setup)
6. [Cron Job Configuration](#cron-job-configuration)
7. [Testing & Validation](#testing--validation)
8. [Monitoring & Alerts](#monitoring--alerts)
9. [Troubleshooting](#troubleshooting)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Financial Automation System               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Invoice   │  │   Payment   │  │ Collection  │       │
│  │ Generation  │  │ Processing  │  │  Manager    │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                 │                 │               │
│  ┌──────┴─────────────────┴─────────────────┴──────┐      │
│  │              Core Automation Engine              │      │
│  └──────┬─────────────────┬─────────────────┬──────┘      │
│         │                 │                 │               │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐       │
│  │   Utility   │  │   Weather   │  │ Third-Party │       │
│  │Integration  │  │Normalization│  │ Validation  │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Redis (for job queuing)
- AWS Account (S3, SES)
- Stripe Account
- Plaid Account
- Twilio Account (for SMS)
- NOAA API Key (weather data)

## Environment Setup

### 1. Clone and Install

```bash
git clone https://github.com/vibelux/vibelux-app.git
cd vibelux-app
npm install
```

### 2. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vibelux"

# Encryption
ENCRYPTION_KEY="64-character-hex-string" # Generate with: openssl rand -hex 32

# AWS
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="vibelux-invoices"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Plaid
PLAID_CLIENT_ID="your-client-id"
PLAID_SECRET="your-secret"
PLAID_ENV="production"

# Utility APIs
UTILITYAPI_KEY="your-key"
UTILITYAPI_SECRET="your-secret"
ARCADIA_API_KEY="your-key"
ARCADIA_API_SECRET="your-secret"
URJANET_API_KEY="your-key"
URJANET_API_SECRET="your-secret"

# Twilio
TWILIO_ACCOUNT_SID="your-sid"
TWILIO_AUTH_TOKEN="your-token"
TWILIO_PHONE_NUMBER="+1234567890"

# NOAA Weather
NOAA_API_KEY="your-key"

# Admin & Security
ADMIN_API_KEY="secure-admin-key"
WEBHOOK_SECRET="webhook-signing-secret"

# Email
EMAIL_FROM="noreply@vibelux.com"
SENDGRID_API_KEY="your-sendgrid-key"

# Monitoring
SLACK_CRON_WEBHOOK="https://hooks.slack.com/..."
CRON_ALERT_EMAIL="alerts@vibelux.com"
HEALTHCHECK_URL="https://hc-ping.com/..."

# Application
NEXT_PUBLIC_APP_URL="https://app.vibelux.com"
```

### 3. Generate Encryption Key

```bash
# Generate a secure encryption key
openssl rand -hex 32
```

## Database Configuration

### 1. Update Prisma Schema

Add the financial automation models to your `prisma/schema.prisma`:

```bash
# Copy the schema extensions
cat prisma/schema-financial-automation.prisma >> prisma/schema.prisma
```

### 2. Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name add-financial-automation

# Seed initial data (optional)
npx prisma db seed
```

### 3. Create Indexes

For optimal performance, create these indexes:

```sql
-- Invoices
CREATE INDEX idx_invoice_status_due ON "Invoice"(status, "dueDate");
CREATE INDEX idx_invoice_customer_date ON "Invoice"("customerId", "createdAt");

-- Payments
CREATE INDEX idx_payment_schedule_date ON "PaymentSchedule"("scheduledDate", status);

-- Utility Connections
CREATE INDEX idx_utility_conn_sync ON "UtilityConnection"(status, "lastSyncAt");

-- Collections
CREATE INDEX idx_collection_invoice ON "CollectionActivity"("invoiceId", "createdAt");
```

## Third-Party Service Setup

### 1. Stripe Configuration

1. Log into Stripe Dashboard
2. Create webhook endpoint: `https://app.vibelux.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.failed`
   - `customer.subscription.updated`
4. Copy webhook signing secret to `.env.local`

### 2. Plaid Setup

1. Create Plaid application
2. Enable products:
   - Auth (for ACH)
   - Transactions
   - Balance
3. Configure webhook: `https://app.vibelux.com/api/webhooks/plaid`
4. Add redirect URI: `https://app.vibelux.com/api/utility/callback`

### 3. Utility API Configuration

#### UtilityAPI.com
1. Register at https://utilityapi.com
2. Configure OAuth redirect
3. Set up webhook notifications
4. Test with sandbox credentials first

#### Arcadia
1. Sign up for Arcadia Connect
2. Configure API credentials
3. Set up data sync webhooks

### 4. Twilio Setup

1. Purchase phone number for SMS
2. Configure messaging service
3. Set up webhook for delivery receipts
4. Create message templates

### 5. AWS Configuration

```bash
# Create S3 bucket for invoices
aws s3 mb s3://vibelux-invoices --region us-east-1

# Set bucket policy for public read of PDFs
aws s3api put-bucket-policy --bucket vibelux-invoices --policy file://s3-policy.json

# Configure SES for email sending
aws ses verify-email-identity --email-address noreply@vibelux.com
```

## Cron Job Configuration

### 1. Vercel Deployment

If using Vercel, cron jobs are configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/automation/invoice",
      "schedule": "0 7 1 * *"
    }
  ]
}
```

### 2. Self-Hosted Setup

For self-hosted deployments, use crontab:

```bash
# Edit crontab
crontab -e

# Add cron jobs
0 7 1 * * curl -X POST https://app.vibelux.com/api/automation/invoice -H "x-webhook-signature: $WEBHOOK_SECRET"
0 19 * * * curl -X POST https://app.vibelux.com/api/automation/payment -H "x-webhook-signature: $WEBHOOK_SECRET"
0 15 * * * curl -X POST https://app.vibelux.com/api/automation/collection -H "x-webhook-signature: $WEBHOOK_SECRET"
```

### 3. Alternative: Node-Cron

For development or small deployments:

```javascript
// server.js
const cron = require('node-cron');
const { cronJobs } = require('./src/lib/cron/cron-config');

cronJobs.forEach(job => {
  cron.schedule(job.schedule, async () => {
    try {
      await fetch(`http://localhost:3000${job.endpoint}`, {
        method: job.method,
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': process.env.WEBHOOK_SECRET
        },
        body: JSON.stringify(job.body)
      });
    } catch (error) {
      console.error(`Cron job ${job.name} failed:`, error);
    }
  });
});
```

## Testing & Validation

### 1. Test Invoice Generation

```bash
# Manually trigger invoice generation
curl -X GET https://app.vibelux.com/api/automation/invoice \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

### 2. Test Payment Processing

```javascript
// test-payment.js
const { AutomatedPaymentProcessor } = require('./src/lib/financial-automation/payment-processor');

async function testPayment() {
  const processor = new AutomatedPaymentProcessor();
  await processor.processScheduledPayments();
}

testPayment();
```

### 3. Verify Utility Integration

```bash
# Check utility connection status
psql $DATABASE_URL -c "SELECT * FROM \"UtilityConnection\" WHERE status = 'ACTIVE';"
```

### 4. Validate Weather Normalization

```javascript
// test-weather.js
const { WeatherNormalizationService } = require('./src/lib/energy/weather-normalization');

async function testWeather() {
  const service = new WeatherNormalizationService();
  const result = await service.normalizeEnergyUsage(
    'facility-id',
    1000, // kWh
    new Date('2024-01-01'),
    new Date('2024-01-31')
  );
  console.log('Normalization result:', result);
}
```

## Monitoring & Alerts

### 1. Set Up Monitoring Dashboard

Access the monitoring dashboard at: `/automation/dashboard`

### 2. Configure Alerts

```javascript
// monitoring-config.js
module.exports = {
  alerts: {
    invoiceGenerationFailure: {
      threshold: 2,
      channel: 'slack',
      severity: 'high'
    },
    paymentFailureRate: {
      threshold: 0.05, // 5%
      channel: 'email',
      severity: 'medium'
    },
    utilityConnectionLoss: {
      threshold: 10, // connections
      channel: 'slack',
      severity: 'high'
    }
  }
};
```

### 3. Health Checks

```bash
# Add health check endpoint
curl https://app.vibelux.com/api/health/financial-automation
```

### 4. Metrics to Monitor

- **Invoice Generation**
  - Success rate (target: >99%)
  - Generation time (target: <5 min)
  - PDF creation errors

- **Payment Processing**
  - Success rate (target: >97%)
  - Failed payment reasons
  - Retry success rate

- **Utility Integration**
  - Connected accounts percentage
  - Sync failure rate
  - Data quality score

- **Collections**
  - Days sales outstanding (DSO)
  - Collection effectiveness
  - Escalation rates

## Troubleshooting

### Common Issues

#### 1. Invoice Generation Fails

```bash
# Check logs
tail -f logs/invoice-generation.log

# Verify S3 permissions
aws s3 ls s3://vibelux-invoices/

# Test PDF generation
node scripts/test-pdf-generation.js
```

#### 2. Payment Processing Errors

```bash
# Check Stripe webhook logs
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Verify payment method
psql $DATABASE_URL -c "SELECT * FROM \"PaymentMethod\" WHERE status = 'ACTIVE';"
```

#### 3. Utility Sync Issues

```bash
# Check connection status
psql $DATABASE_URL -c "SELECT * FROM \"UtilityConnection\" WHERE status = 'ERROR';"

# Test API connectivity
curl -H "Authorization: Bearer $UTILITYAPI_KEY" https://utilityapi.com/api/v2/accounts
```

#### 4. Collection Failures

```bash
# Check Twilio logs
tail -f logs/twilio-sms.log

# Verify phone numbers
psql $DATABASE_URL -c "SELECT * FROM \"User\" WHERE phone IS NOT NULL;"
```

### Error Recovery

1. **Failed Cron Jobs**: Check `/api/automation/retry` endpoint
2. **Stuck Payments**: Run manual payment processor
3. **Missing Invoices**: Use invoice regeneration tool
4. **Data Inconsistencies**: Run data validation scripts

### Support Contacts

- **Technical Issues**: tech-support@vibelux.com
- **Payment Issues**: billing@vibelux.com
- **API Support**: api-support@vibelux.com
- **Emergency**: +1-800-VIBELUX

## Security Considerations

1. **API Keys**: Rotate every 90 days
2. **Webhooks**: Always verify signatures
3. **PCI Compliance**: Never store card details
4. **Data Encryption**: Use AES-256 for sensitive data
5. **Access Control**: Implement role-based permissions
6. **Audit Logs**: Maintain comprehensive logs
7. **Backup**: Daily automated backups

## Performance Optimization

1. **Database**: Use connection pooling
2. **Caching**: Redis for frequently accessed data
3. **Batch Processing**: Process payments in batches
4. **Rate Limiting**: Respect API rate limits
5. **Async Operations**: Use job queues for heavy tasks

## Next Steps

1. Complete third-party service registrations
2. Run test transactions in sandbox mode
3. Set up monitoring and alerts
4. Train staff on new automated system
5. Plan phased rollout to customers
6. Document standard operating procedures

---

For additional support or questions, contact the VibeLux engineering team.