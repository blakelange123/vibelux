# VibeLux Production Deployment Checklist 🚀

## Pre-Deployment Requirements

### 1. Environment Setup ✓
- [ ] Staging environment configured and tested
- [ ] Production environment variables set
- [ ] SSL certificates configured
- [ ] Domain names pointed correctly
- [ ] CDN configured (if using Vercel/Cloudflare)

### 2. Database Preparation ✓
- [ ] Production database provisioned
- [ ] Connection strings configured
- [ ] Migrations tested on staging
- [ ] Backup strategy implemented
- [ ] Connection pooling optimized

### 3. Security Audit ✓
- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] Rate limiting configured
- [ ] CORS settings verified
- [ ] Security headers implemented
- [ ] SSL/TLS enforced

### 4. Monitoring Setup ✓
- [ ] Prometheus configured
- [ ] Grafana dashboards imported
- [ ] Sentry project created
- [ ] Health check endpoints verified
- [ ] Alert rules configured

## Deployment Steps

### Step 1: Configure Production Environment

```bash
# Create production .env file
cp .env.example .env.production

# Required environment variables:
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
NEXTAUTH_URL="https://app.vibelux.com"
NEXTAUTH_SECRET="[generate-secret]"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
SENTRY_DSN="https://..."
INFLUXDB_URL="https://..."
INFLUXDB_TOKEN="..."
```

### Step 2: Database Setup

```bash
# Run migrations on production database
npx prisma migrate deploy

# Verify migrations
npx prisma migrate status

# Seed initial data (if needed)
npx prisma db seed
```

### Step 3: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env pull
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
# ... add all required env vars
```

### Step 4: Alternative Docker Deployment

```bash
# Build production image
docker build -f Dockerfile.prod -t vibelux:latest .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 5: Post-Deployment Verification

```bash
# Check health endpoint
curl https://app.vibelux.com/api/health

# Run E2E tests against production
npm run test:e2e:prod

# Monitor error rates in Sentry
# Check Grafana dashboards
```

## Feature Flag Configuration

### Enable Features Gradually

```typescript
// 1. Start with internal testing
await setFeatureFlag('new-robotic-integration', {
  enabled: true,
  percentage: 0,
  allowedUsers: ['admin@vibelux.com']
});

// 2. Beta rollout (10% enterprise)
await setFeatureFlag('new-robotic-integration', {
  enabled: true,
  percentage: 10,
  tiers: ['enterprise']
});

// 3. Gradual rollout
// 25% -> 50% -> 100%
```

## Customer Communication

### 1. Pre-Launch Email
```
Subject: VibeLux Platform Going Live - What to Expect

Dear [Customer Name],

We're excited to announce that VibeLux is transitioning to production! 

What this means for you:
- Enhanced performance and reliability
- New features rolling out gradually
- 24/7 monitoring and support
- Regular updates via our changelog

No action required on your part. Your account and data will seamlessly transition.

Best regards,
The VibeLux Team
```

### 2. Update In-App Banner
```typescript
// Add to main layout
<UpdateBanner 
  message="Welcome to the new VibeLux platform! Check out our latest features."
  link="/changelog"
/>
```

## Monitoring Checklist

### Real-Time Monitoring
- [ ] Database connections < 80% capacity
- [ ] API response times < 200ms (p95)
- [ ] Error rate < 0.1%
- [ ] CPU usage < 70%
- [ ] Memory usage < 80%

### Alerts Configuration
```yaml
# Prometheus alerts
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
  annotations:
    summary: "High error rate detected"

- alert: DatabaseConnectionPool
  expr: pg_connections_active / pg_connections_max > 0.8
  annotations:
    summary: "Database connection pool near capacity"
```

## Rollback Plan

### Quick Rollback Steps
```bash
# 1. Revert deployment (Vercel)
vercel rollback

# 2. Revert database migration
npx prisma migrate resolve --rolled-back

# 3. Clear Redis cache
redis-cli FLUSHALL

# 4. Notify customers of temporary rollback
```

## Support Preparation

### 1. Documentation
- [ ] User guides updated
- [ ] API documentation current
- [ ] FAQ section prepared
- [ ] Video tutorials recorded

### 2. Support Team
- [ ] Support team trained on new features
- [ ] Escalation procedures documented
- [ ] On-call schedule set
- [ ] Support tickets monitored

## Performance Benchmarks

### Expected Metrics
- Page load time: < 2s
- API response time: < 100ms (p50)
- Time to Interactive: < 3s
- Lighthouse score: > 90

### Load Testing
```bash
# Run load tests before going live
npm run test:load

# Expected capacity:
# - 10,000 concurrent users
# - 100,000 API requests/minute
# - 1M database queries/hour
```

## Launch Day Checklist

### Morning of Launch
- [ ] Final staging tests passed
- [ ] Team standup completed
- [ ] Support team ready
- [ ] Monitoring dashboards open
- [ ] Communication channels ready

### Deploy Sequence
1. [ ] Enable maintenance mode
2. [ ] Deploy application
3. [ ] Run database migrations
4. [ ] Warm up caches
5. [ ] Verify health checks
6. [ ] Disable maintenance mode
7. [ ] Monitor for 30 minutes

### Post-Launch
- [ ] Send launch confirmation email
- [ ] Monitor error rates closely
- [ ] Check customer feedback
- [ ] Update status page
- [ ] Team retrospective (end of day)

## Success Metrics

### Day 1
- Zero critical errors
- < 5 support tickets
- All health checks passing
- No performance degradation

### Week 1
- 95%+ uptime
- Positive customer feedback
- Feature adoption starting
- No data integrity issues

### Month 1
- 99.9% uptime achieved
- Feature flags fully rolled out
- Customer satisfaction maintained
- Performance SLAs met

---

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs app.vibelux.com

# Run migrations
npx prisma migrate deploy

# Check system health
curl https://app.vibelux.com/api/health

# Monitor in real-time
docker-compose -f docker-compose.prod.yml logs -f
```

## Emergency Contacts

- Lead Developer: [contact]
- DevOps Engineer: [contact]
- Customer Success: [contact]
- On-Call Engineer: [contact]

---

Ready to deploy? Let's make VibeLux live! 🚀