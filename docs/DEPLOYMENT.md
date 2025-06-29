# VibeLux Deployment Guide

This guide covers deploying VibeLux to production environments.

## Prerequisites

- Node.js 18+ installed locally
- PostgreSQL database
- Redis instance
- Domain name with SSL certificate
- Accounts for required services (Clerk, Stripe, etc.)

## Environment Setup

### 1. Database Setup

#### PostgreSQL
```bash
# Create database
CREATE DATABASE vibelux;
CREATE USER vibelux_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE vibelux TO vibelux_user;

# Run migrations
npx prisma migrate deploy
```

#### Redis
- Use Redis 7.0+
- Configure with password authentication
- Set maxmemory-policy to `allkeys-lru`

### 2. Environment Variables

1. Copy `.env.production.template` to `.env.production.local`
2. Fill in all required values
3. Generate secure random strings for secrets:
   ```bash
   openssl rand -base64 32
   ```

### 3. Required API Keys

#### Clerk Authentication
1. Sign up at https://clerk.com
2. Create a new application
3. Copy publishable and secret keys
4. Configure OAuth providers if needed

#### Stripe Payments
1. Sign up at https://stripe.com
2. Get API keys from dashboard
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Copy webhook signing secret

#### External APIs
- **OpenWeather**: https://openweathermap.org/api
- **NREL**: https://developer.nrel.gov/
- **Google Cloud**: Enable Vision API and Maps API

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Add environment variables in Vercel dashboard

4. Configure custom domain in Vercel settings

### Option 2: Railway

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Deploy:
   ```bash
   railway up
   ```

3. Services are auto-configured from `railway.json`

### Option 3: Render

1. Connect GitHub repository
2. Use `render.yaml` for automatic configuration
3. Add environment variables in dashboard

### Option 4: Self-Hosted (Docker)

1. Build Docker image:
   ```bash
   docker build -t vibelux .
   ```

2. Run with docker-compose:
   ```bash
   docker-compose up -d
   ```

## Post-Deployment

### 1. Database Seeding
```bash
# Seed DLC fixtures data
npx prisma db seed
```

### 2. Health Checks
- Main app: `https://your-domain.com/api/health`
- Database: `https://your-domain.com/api/health/db`
- Redis: `https://your-domain.com/api/health/redis`

### 3. Configure Webhooks

#### Stripe
1. Add webhook endpoint in Stripe dashboard
2. Select events: `checkout.session.completed`, `payment_intent.succeeded`

#### Clerk
1. Add webhook endpoint in Clerk dashboard
2. Select events: `user.created`, `user.updated`

### 4. SSL Certificate
- Vercel/Railway/Render: Automatic SSL
- Self-hosted: Use Let's Encrypt with Certbot

### 5. DNS Configuration
```
Type  Name    Value
A     @       YOUR_SERVER_IP
A     www     YOUR_SERVER_IP
CNAME api     YOUR_API_DOMAIN
```

## Security Checklist

- [ ] All environment variables set
- [ ] Database uses SSL
- [ ] Redis password configured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Error monitoring active
- [ ] Backups configured

## Monitoring

### 1. Application Monitoring
- Sentry for error tracking
- Vercel Analytics for performance
- Custom dashboard at `/admin/monitoring`

### 2. Infrastructure Monitoring
- Database: Monitor connections and query performance
- Redis: Monitor memory usage and hit rate
- API: Monitor response times and error rates

### 3. Alerts
Configure alerts for:
- Error rate > 1%
- Response time > 2s
- Database connections > 80%
- Redis memory > 90%

## Scaling Considerations

### Database
- Enable connection pooling
- Add read replicas for scaling
- Regular VACUUM and ANALYZE

### Redis
- Use Redis Cluster for high availability
- Monitor memory usage
- Implement cache warming

### Application
- Enable Next.js ISR for static pages
- Use CDN for assets
- Implement API response caching

## Troubleshooting

### Build Failures
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues
- Check DATABASE_URL format
- Verify SSL settings
- Check connection limits

### Redis Connection Issues
- Verify REDIS_URL format
- Check password authentication
- Monitor memory usage

## Rollback Procedure

1. Keep previous build artifacts
2. Database migrations are reversible:
   ```bash
   npx prisma migrate resolve --rolled-back
   ```
3. Use deployment platform's rollback feature

## Support

- Documentation: `/docs`
- API Reference: `/api-reference`
- GitHub Issues: https://github.com/your-org/vibelux
- Email: support@your-domain.com