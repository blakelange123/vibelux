# VibeLux Production Deployment Guide

## 🚀 Complete Cloud Setup for VibeLux

This guide will help you deploy VibeLux to production with a simplified, cost-effective cloud architecture.

## 📋 Cloud Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Supabase       │    │   Upstash       │
│   (Frontend)    │◄──►│   (Database)     │    │   (Redis Cache) │
│   - Next.js     │    │   - PostgreSQL   │    │   - Session     │
│   - CDN         │    │   - Auth         │    │   - Rate Limit  │
│   - Edge Funcs  │    │   - Realtime     │    │   - Queue       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │              ┌─────────────────┐                │
         └──────────────►│   AWS S3        │◄───────────────┘
                        │   (File Storage)│
                        │   - Images      │
                        │   - Documents   │
                        │   - Backups     │
                        └─────────────────┘
```

## 💰 Cost Breakdown (Monthly)

| Service | Free Tier | Paid Tier | Production Cost |
|---------|-----------|-----------|-----------------|
| **Vercel** | Hobby (Free) | Pro ($20) | $20/month |
| **Supabase** | Free (2 projects) | Pro ($25) | $25/month |
| **Upstash Redis** | Free (10K requests) | Pay-per-use | $10-25/month |
| **AWS S3** | Free (5GB) | Pay-per-use | $5-15/month |
| **Total** | **$0** | **$60-85** | **Scales with usage** |

## 🔧 Step 1: Database Setup (Supabase)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create account → New Project
3. Choose region closest to your users
4. Copy these values:

```bash
# Add to your .env.production
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"
```

### Enable Extensions
In Supabase Dashboard → Settings → Database:
```sql
-- Enable TimescaleDB for time-series data
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location data
CREATE EXTENSION IF NOT EXISTS postgis;
```

## 🌐 Step 2: Website Hosting (Vercel)

### Deploy to Vercel
1. Push your code to GitHub
2. Connect GitHub to [vercel.com](https://vercel.com)
3. Import VibeLux repository
4. Configure build settings:

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

### Environment Variables in Vercel
Add these to Vercel Dashboard → Settings → Environment Variables:

```bash
# Database
DATABASE_URL="[FROM_SUPABASE]"
SUPABASE_URL="[FROM_SUPABASE]"
SUPABASE_ANON_KEY="[FROM_SUPABASE]"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="[YOUR_CLERK_KEY]"
CLERK_SECRET_KEY="[YOUR_CLERK_SECRET]"

# Redis Cache
REDIS_URL="[FROM_UPSTASH]"

# File Storage
AWS_ACCESS_KEY_ID="[FROM_AWS]"
AWS_SECRET_ACCESS_KEY="[FROM_AWS]"
AWS_S3_BUCKET="vibelux-production"
AWS_REGION="us-east-1"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

## ⚡ Step 3: Redis Cache (Upstash)

### Create Upstash Redis
1. Go to [upstash.com](https://upstash.com)
2. Create account → New Database
3. Choose region matching your Vercel deployment
4. Copy connection string:

```bash
REDIS_URL="rediss://default:[PASSWORD]@[ENDPOINT]:6380"
```

## 📁 Step 4: File Storage (AWS S3)

### Create S3 Bucket
1. AWS Console → S3 → Create Bucket
2. Bucket name: `vibelux-production-[random]`
3. Region: Same as other services
4. Block public access: **Keep enabled**
5. Create IAM user with S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::vibelux-production-*",
        "arn:aws:s3:::vibelux-production-*/*"
      ]
    }
  ]
}
```

## 🔒 Step 5: Security & Authentication

### Clerk Authentication Setup
1. [clerk.com](https://clerk.com) → New Application
2. Choose "Next.js"
3. Configure OAuth providers (Google, GitHub)
4. Set redirect URLs:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.vercel.app`

### Environment Security
```bash
# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
```

## 📊 Step 6: Monitoring & Analytics

### Optional: Add monitoring
```bash
# Sentry (Error tracking)
SENTRY_DSN="[YOUR_SENTRY_DSN]"

# Vercel Analytics (Built-in)
# Automatically enabled in production

# Uptime monitoring
# Use Vercel's built-in monitoring
```

## 🚀 Step 7: Custom Domain (Optional)

### Add Custom Domain
1. Vercel Dashboard → Domains
2. Add your domain (e.g., `vibelux.com`)
3. Configure DNS records:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

## 🧪 Step 8: Testing Production

### Pre-deployment Checklist
```bash
# 1. Test build locally
npm run build
npm start

# 2. Validate environment
npm run validate:env

# 3. Run production checks
npm run type-check
npm run lint

# 4. Test database connection
npm run test:db
```

### Post-deployment Verification
1. ✅ Website loads at your domain
2. ✅ User authentication works
3. ✅ Database queries execute
4. ✅ File uploads work
5. ✅ API endpoints respond

## 📈 Scaling Considerations

### When to upgrade:
- **1,000+ users**: Upgrade Supabase to Pro ($25/month)
- **10,000+ users**: Add CDN for static assets
- **100,000+ users**: Consider dedicated database

### Performance optimization:
```typescript
// next.config.ts optimizations already included
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  }
}
```

## 🆘 Troubleshooting

### Common Issues:
1. **Build fails**: Check TypeScript errors
2. **Database connection**: Verify DATABASE_URL format
3. **Auth not working**: Check Clerk domain settings
4. **Files not uploading**: Verify S3 permissions

### Support Resources:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Upstash: [docs.upstash.com](https://docs.upstash.com)

## 🎯 Next Steps

After successful deployment:
1. Set up monitoring dashboards
2. Configure automated backups
3. Implement CI/CD pipeline
4. Add staging environment
5. Set up domain and SSL

---

**Total setup time**: 2-4 hours
**Monthly cost**: $60-85 for production-ready setup
**Scales to**: 100,000+ users before major changes needed