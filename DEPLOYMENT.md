# VibeLux Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Deployment Options](#deployment-options)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Services
- Node.js 18+ 
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (for containerized deployment)

### Required API Keys
- OpenWeather API
- NREL API
- OpenAI API
- Claude API
- UtilityAPI.com
- Arcadia API
- Stripe
- SendGrid/SMTP for emails

## Environment Setup

1. **Copy Environment Template**
   ```bash
   cp .env.example .env
   ```

2. **Configure Required Environment Variables**
   - Database credentials
   - API keys for all external services
   - JWT and encryption secrets
   - Email configuration
   - Redis connection

3. **Generate Secure Secrets**
   ```bash
   # Generate JWT secret
   openssl rand -base64 32

   # Generate encryption key (must be 32 bytes)
   openssl rand -base64 32
   ```

## Database Setup

1. **Create Database**
   ```bash
   createdb vibelux_production
   ```

2. **Run Migrations**
   ```bash
   npm run db:migrate:deploy
   ```

3. **Seed Initial Data** (optional)
   ```bash
   npm run db:seed
   ```

## Deployment Options

### Option 1: Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configure Vercel**
   ```bash
   vercel login
   vercel link
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL production
   vercel env add JWT_SECRET production
   # Add all other required variables
   ```

4. **Deploy**
   ```bash
   # Production
   vercel --prod

   # Staging
   vercel
   ```

### Option 2: Docker Deployment

1. **Build and Start Services**
   ```bash
   docker-compose up -d --build
   ```

2. **Run Database Migrations**
   ```bash
   docker-compose exec app npm run db:migrate:deploy
   ```

3. **Check Service Health**
   ```bash
   docker-compose ps
   curl http://localhost:3000/api/health
   ```

### Option 3: Traditional Server Deployment

1. **Install Dependencies**
   ```bash
   npm ci --production
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js --env production
   ```

## Monitoring & Maintenance

### Health Checks
- API Health: `GET /api/health`
- System Metrics: `GET /api/metrics`

### Monitoring Stack
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
- **Alerts**: Configured via Slack/Email

### Regular Maintenance

1. **Database Backups**
   ```bash
   npm run backup:create
   ```

2. **Log Rotation**
   - Logs are automatically rotated daily
   - Retention: 30 days

3. **Security Updates**
   ```bash
   npm audit fix
   npm update
   ```

### Scheduled Jobs
- **Daily at 2 AM**: Sync utility data
- **Monthly on 1st**: Generate invoices
- **Every 6 hours**: Clean up sessions
- **Daily at 3 AM**: Database backup

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check firewall rules

2. **Redis Connection Failed**
   - Verify Redis is running
   - Check REDIS_URL
   - Default: redis://localhost:6379

3. **API Key Errors**
   - Verify all required API keys are set
   - Check API key permissions
   - Monitor rate limits

4. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf .next
   npm run build
   ```

5. **Migration Issues**
   ```bash
   # Reset database (CAUTION: Data loss)
   npm run db:reset
   npm run db:migrate:deploy
   ```

### Performance Optimization

1. **Enable Caching**
   - Redis caching is enabled by default
   - Configure TTL in environment

2. **Database Indexes**
   - Run performance analysis
   - Add indexes as needed

3. **CDN Configuration**
   - Static assets served via Vercel CDN
   - Configure custom CDN if needed

### Security Checklist

- [ ] All secrets are properly configured
- [ ] HTTPS is enforced
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Security headers are set
- [ ] Database backups are automated
- [ ] Monitoring alerts are configured
- [ ] API keys have minimum required permissions

## Support

For deployment issues:
1. Check logs: `docker-compose logs -f app`
2. Review error monitoring dashboard
3. Contact DevOps team

## CI/CD Pipeline

GitHub Actions automatically:
1. Run tests on PR
2. Deploy to staging on develop branch
3. Deploy to production on main branch

Manual deployment override:
```bash
# Force production deployment
vercel --prod --force
```