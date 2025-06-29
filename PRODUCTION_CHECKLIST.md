# VibeLux Production Deployment Checklist

## 🚀 Required Services & Costs

### Core Infrastructure (~$150-300/month)
- [ ] **Hosting**: Vercel Pro ($20/mo) or AWS (~$50-200/mo)
- [ ] **PostgreSQL**: Supabase/Neon ($25/mo)
- [ ] **Redis**: Redis Cloud ($30/mo) or Upstash ($10/mo)
- [ ] **InfluxDB**: InfluxDB Cloud ($50/mo)
- [ ] **File Storage**: AWS S3 ($5-20/mo) or Cloudflare R2 ($5/mo)

### Essential Services (Already configured)
- [x] **AI (AWS Bedrock)**: ~$50-200/mo (usage-based)
- [x] **Payments (Stripe)**: 2.9% + 30¢ per transaction
- [x] **Auth (Clerk)**: Free < 5k users, then $25/mo

### Additional Production Services (~$75-125/month)
- [ ] **Email**: SendGrid ($20/mo) or Resend ($20/mo)
- [ ] **Monitoring**: Sentry ($26/mo)
- [ ] **Analytics**: PostHog ($0-50/mo)
- [ ] **Background Jobs**: Trigger.dev ($29/mo)
- [ ] **CDN**: Cloudflare ($20/mo)

### Optional But Recommended (~$50-100/month)
- [ ] **Backup Service**: AWS Backup or similar ($20/mo)
- [ ] **Log Management**: Datadog or LogDNA ($30/mo)
- [ ] **Uptime Monitoring**: Better Uptime ($10/mo)
- [ ] **SSL Certificate**: Free with Vercel/Cloudflare

## 💵 Total Monthly Costs
- **Minimum**: ~$275/month
- **Recommended**: ~$400-500/month
- **Enterprise**: ~$1000+/month

## 🔧 Environment Variables for Production

```bash
# Add these to your production environment

# Email Service (SendGrid example)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@vibelux.com

# File Storage (AWS S3)
AWS_S3_BUCKET=vibelux-production
AWS_S3_REGION=us-east-1
AWS_S3_ACCESS_KEY=AKIA...
AWS_S3_SECRET_KEY=...

# Monitoring
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=...

# Analytics
POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
POSTHOG_HOST=https://app.posthog.com

# Background Jobs
TRIGGER_API_KEY=tr_dev_xxxxxxxxxxxxx
TRIGGER_API_URL=https://api.trigger.dev

# Production Database URLs
DATABASE_URL=postgres://user:pass@host:5432/vibelux
REDIS_URL=redis://user:pass@host:6379
INFLUXDB_URL=https://us-east-1-1.aws.cloud2.influxdata.com

# Production App URL
NEXT_PUBLIC_APP_URL=https://vibelux.com
NODE_ENV=production
```

## 📝 Setup Steps

### 1. Email Service (SendGrid)
1. Sign up at https://sendgrid.com
2. Verify your domain
3. Create API key
4. Update environment variables

### 2. File Storage (AWS S3)
1. Create S3 bucket in AWS Console
2. Set up IAM user with S3 access
3. Configure CORS for image uploads
4. Update environment variables

### 3. Monitoring (Sentry)
1. Sign up at https://sentry.io
2. Create Next.js project
3. Install Sentry SDK: `npm install @sentry/nextjs`
4. Run setup wizard: `npx @sentry/wizard@latest -i nextjs`

### 4. Database Migration
1. Export local data: `pg_dump vibelux > backup.sql`
2. Create production database
3. Import data to production
4. Update DATABASE_URL

### 5. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
# ... add all production env vars
```

## 🔒 Security Checklist
- [ ] Rotate all API keys and secrets
- [ ] Enable 2FA on all service accounts
- [ ] Set up IP whitelisting where possible
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up DDoS protection (Cloudflare)
- [ ] Regular automated backups
- [ ] SSL certificates configured

## 📊 Performance Optimization
- [ ] Enable Redis caching
- [ ] Set up CDN for static assets
- [ ] Optimize images with Next.js Image
- [ ] Enable database connection pooling
- [ ] Configure auto-scaling

## 🚨 Monitoring Setup
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Performance monitoring
- [ ] Log aggregation
- [ ] Alert notifications
- [ ] Custom dashboards

## 🎯 Launch Checklist
- [ ] All environment variables set
- [ ] Database migrated and backed up
- [ ] SSL certificate active
- [ ] Email sending verified
- [ ] Payment processing tested
- [ ] AI services working
- [ ] Background jobs running
- [ ] Monitoring active
- [ ] Load testing completed
- [ ] Security scan passed