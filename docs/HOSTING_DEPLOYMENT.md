# Hosting & Deployment Guide for Visual Operations Intelligence

## Overview
This guide explains how to deploy your Next.js Visual Operations Intelligence platform to various hosting providers and manage updates.

## 🚀 Recommended Hosting Options

### 1. **Vercel (Recommended - Easiest)**
Vercel is made by the Next.js team and provides seamless deployment.

#### Setup:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy for the first time
vercel

# Follow the prompts:
# - Link to your GitHub repo
# - Set environment variables
# - Deploy!
```

#### Environment Variables in Vercel:
```bash
# In Vercel dashboard > Settings > Environment Variables
DATABASE_URL=postgresql://user:pass@host:port/dbname
NEXTAUTH_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_live_...
CLERK_SECRET_KEY=sk_...
# etc.
```

#### Auto-deployment:
- **Push to main branch** → Automatic production deployment
- **Push to other branches** → Preview deployments
- **Zero downtime** - automatic

#### Update Process:
```bash
# Make changes locally
git add .
git commit -m "feat: add new feature"
git push origin main
# 🎉 Vercel automatically deploys!
```

### 2. **Netlify (Great Alternative)**
Similar to Vercel with great CI/CD.

#### Setup:
```bash
# Build command: npm run build
# Publish directory: .next
# Node version: 18.x
```

### 3. **AWS / DigitalOcean / VPS (More Control)**
For when you need more control over the infrastructure.

#### Deployment with Docker:
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose for Production:
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: vibelux
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 📁 File Update Methods

### Method 1: Git-based Deployment (Recommended)

#### With Vercel/Netlify:
```bash
# 1. Make changes locally
code src/components/MyComponent.tsx

# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "feat: improve user dashboard"
git push origin main

# 4. Automatic deployment happens!
# You get a notification when it's live
```

#### With VPS/Server:
```bash
# On your server
cd /var/www/vibelux-app

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Build the app
npm run build

# Restart the app (with PM2)
pm2 restart vibelux-app
```

### Method 2: Direct File Upload (Not Recommended)
Only for emergencies or small static sites.

```bash
# Using SCP to copy files
scp -r dist/ user@yourserver.com:/var/www/html/

# Using FTP client like FileZilla
# Upload changed files manually
```

## 🔄 Complete Deployment Workflow

### Step 1: Prepare for Deployment
```bash
# 1. Run all tests
npm run test

# 2. Check types
npm run type-check

# 3. Build locally to catch errors
npm run build

# 4. Run security audit
npm audit --audit-level=high
```

### Step 2: Database Migrations
```bash
# For production database
npm run migrate:production

# Or if using Vercel
# Add to package.json scripts:
# "vercel-build": "npx prisma generate && npx prisma migrate deploy && next build"
```

### Step 3: Deploy the Update
```bash
# Method A: Git push (Vercel/Netlify)
git push origin main

# Method B: Direct deployment (VPS)
./scripts/deploy.sh

# Method C: Docker deployment
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🛠 Environment-Specific Deployments

### Development Environment
```bash
# .env.development
DATABASE_URL=postgresql://localhost:5432/vibelux_dev
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Staging Environment
```bash
# .env.staging
DATABASE_URL=postgresql://staging-db:5432/vibelux_staging
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=https://staging.vibelux.com
```

### Production Environment
```bash
# .env.production
DATABASE_URL=postgresql://prod-db:5432/vibelux_prod
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_APP_URL=https://vibelux.com
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint
Your app already has `/api/health` - monitor this!

### Deployment Monitoring
```bash
# Check if deployment succeeded
curl -f https://yoursite.com/api/health

# If health check fails, auto-rollback
if [ $? -ne 0 ]; then
  echo "Health check failed, rolling back..."
  git revert HEAD --no-edit
  git push origin main --force
fi
```

## 🚨 Emergency Procedures

### Quick Hotfix Deployment
```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-fix

# 2. Make minimal fix
# Edit only the necessary files

# 3. Fast deployment
git add .
git commit -m "hotfix: critical security patch"
git push origin hotfix/critical-fix

# 4. Merge to main
git checkout main
git merge hotfix/critical-fix
git push origin main
```

### Rollback to Previous Version
```bash
# Method A: Git revert (Recommended)
git revert HEAD --no-edit
git push origin main

# Method B: Reset to previous commit
git reset --hard HEAD~1
git push origin main --force

# Method C: Redeploy previous version (Docker)
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d previous-tag
```

## 📋 Pre-Deployment Checklist

- [ ] **Tests passing** (`npm run test`)
- [ ] **Types checking** (`npm run type-check`)
- [ ] **Security audit clean** (`npm audit`)
- [ ] **Environment variables updated**
- [ ] **Database migrations ready**
- [ ] **Dependencies updated** (`npm install`)
- [ ] **Build succeeds locally** (`npm run build`)
- [ ] **Feature flags configured**
- [ ] **Monitoring alerts set up**
- [ ] **Rollback plan documented**

## 🎯 Deployment Scripts

### Simple Deploy Script
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Run database migrations
npm run migrate:production

# Build the application
npm run build

# Restart the application
pm2 restart vibelux-app

echo "✅ Deployment complete!"
```

### Advanced Deploy with Health Checks
```bash
#!/bin/bash
# scripts/deploy-with-health-check.sh

set -e

HEALTH_URL="https://yoursite.com/api/health"
TIMEOUT=300  # 5 minutes

echo "🚀 Starting deployment with health checks..."

# Deploy
./scripts/deploy.sh

echo "⏳ Waiting for health check..."

# Wait for health check to pass
for i in $(seq 1 $TIMEOUT); do
  if curl -f $HEALTH_URL > /dev/null 2>&1; then
    echo "✅ Health check passed!"
    exit 0
  fi
  sleep 1
done

echo "❌ Health check failed after $TIMEOUT seconds"
echo "🔄 Rolling back..."

# Rollback
git revert HEAD --no-edit
git push origin main
./scripts/deploy.sh

exit 1
```

## 📱 Mobile App Updates

### Progressive Web App (PWA)
```javascript
// src/app/layout.tsx - PWA updates
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Show "App updated" notification
      showUpdateNotification();
    });
  }
}, []);
```

### Push Notifications for Updates
```javascript
// Notify users of new features
await sendPushNotification({
  title: "New Features Available!",
  body: "Update your app to access enhanced Visual Operations",
  icon: "/icon-192x192.png",
  url: "/changelog"
});
```

## 💡 Best Practices

1. **Always use staging** - Test in staging before production
2. **Gradual rollouts** - Use feature flags for big changes
3. **Monitor everything** - Watch metrics during deployment
4. **Quick rollback** - Be ready to revert if needed
5. **Communicate changes** - Notify users of major updates
6. **Database backups** - Always backup before migrations
7. **Zero downtime** - Use blue-green or rolling deployments
8. **Automate testing** - CI/CD pipeline with automated tests

## 🎉 Quick Start Commands

```bash
# One-time setup (Vercel)
npm i -g vercel
vercel login
vercel

# Regular updates
git add .
git commit -m "feat: new feature"
git push origin main
# ✅ Auto-deployed!

# Emergency rollback
git revert HEAD --no-edit
git push origin main
```

Your Visual Operations Intelligence platform is now ready for professional deployment with safe, automated updates! 🚀