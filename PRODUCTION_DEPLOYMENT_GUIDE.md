# Production Deployment Guide

## Overview

This guide covers deploying Vibelux's AI-powered horticultural lighting platform to production with enterprise-grade scalability, monitoring, and cost optimization.

## Architecture Overview

```
Internet → Load Balancer → Next.js App Servers → Database Cluster
                       ↓
                  AI Gateway → Claude API
                       ↓
                  Monitoring Stack
```

## Environment Setup

### 1. Required Environment Variables

Create `.env.production`:

```bash
# Database
DATABASE_URL="postgresql://user:password@db-cluster.region.rds.amazonaws.com:5432/vibelux_prod"
SHADOW_DATABASE_URL="postgresql://user:password@db-shadow.region.rds.amazonaws.com:5432/vibelux_shadow"

# Authentication
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# AI Services
CLAUDE_API_KEY="sk-ant-api03-..."
OPENAI_API_KEY="sk-..."  # Fallback for specific features

# Payment Processing
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Infrastructure
REDIS_URL="redis://redis-cluster.region.cache.amazonaws.com:6379"
INFLUXDB_URL="https://influxdb.vibelux.com"
INFLUXDB_TOKEN="..."
INFLUXDB_ORG="vibelux"
INFLUXDB_BUCKET="metrics"

# Security
NEXTAUTH_SECRET="..."
ENCRYPTION_KEY="..."  # 32-character key for sensitive data
JWT_SECRET="..."

# External APIs
SALESFORCE_CLIENT_ID="..."
SALESFORCE_CLIENT_SECRET="..."
PLANTNET_API_KEY="..."
WEATHER_API_KEY="..."

# Monitoring
SENTRY_DSN="https://..."
NEW_RELIC_LICENSE_KEY="..."
PROMETHEUS_ENDPOINT="https://prometheus.vibelux.com"

# Feature Flags
FEATURE_ENTERPRISE_ENABLED="true"
FEATURE_MOBILE_APP_ENABLED="true"
FEATURE_ADVANCED_CFD_ENABLED="true"
```

### 2. Database Migration

```bash
# Production migration script
#!/bin/bash

echo "Starting production database migration..."

# Backup existing database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run Prisma migrations
npx prisma migrate deploy

# Seed production data
npx prisma db seed

# Verify migration
npx prisma migrate status

echo "Migration completed successfully"
```

### 3. Docker Configuration

**Dockerfile.prod**:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

**docker-compose.prod.yml**:
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 2G
          cpus: '1.0'

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: vibelux_prod
      POSTGRES_USER: vibelux
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## Kubernetes Deployment

### 1. Application Deployment

**k8s/deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vibelux-app
  labels:
    app: vibelux
spec:
  replicas: 5
  selector:
    matchLabels:
      app: vibelux
  template:
    metadata:
      labels:
        app: vibelux
    spec:
      containers:
      - name: vibelux
        image: vibelux/app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: vibelux-secrets
              key: database-url
        - name: CLAUDE_API_KEY
          valueFrom:
            secretKeyRef:
              name: vibelux-secrets
              key: claude-api-key
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: vibelux-service
spec:
  selector:
    app: vibelux
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### 2. AI Gateway Service

**k8s/ai-gateway.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-gateway
  template:
    metadata:
      labels:
        app: ai-gateway
    spec:
      containers:
      - name: ai-gateway
        image: vibelux/ai-gateway:latest
        ports:
        - containerPort: 8080
        env:
        - name: CLAUDE_API_KEY
          valueFrom:
            secretKeyRef:
              name: vibelux-secrets
              key: claude-api-key
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

### 3. Monitoring Stack

**k8s/monitoring.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: prometheus-config
          mountPath: /etc/prometheus
      volumes:
      - name: prometheus-config
        configMap:
          name: prometheus-config
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:latest
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: grafana-secrets
              key: admin-password
```

## Load Testing Configuration

### 1. Artillery Load Test

**load-test.yml**:
```yaml
config:
  target: 'https://api.vibelux.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Normal load"
    - duration: 120
      arrivalRate: 100
      name: "Peak load"
    - duration: 60
      arrivalRate: 200
      name: "Stress test"
  environments:
    production:
      target: 'https://app.vibelux.com'
      phases:
        - duration: 600
          arrivalRate: 100

scenarios:
  - name: "AI Assistant Requests"
    weight: 40
    flow:
      - post:
          url: "/api/ai-assistant"
          headers:
            Authorization: "Bearer {{ $randomString() }}"
          json:
            query: "Design a 10x20 room for cannabis flowering"
            userTier: "professional"

  - name: "Design Canvas Operations"
    weight: 30
    flow:
      - get:
          url: "/api/fixtures?category=led"
      - post:
          url: "/api/design/calculate"
          json:
            room: { width: 10, length: 20, height: 8 }
            fixtures: [{ id: "fixture-1", x: 5, y: 10, quantity: 4 }]

  - name: "Dashboard Analytics"
    weight: 20
    flow:
      - get:
          url: "/dashboard"
      - get:
          url: "/api/analytics/usage"

  - name: "Calculator Tools"
    weight: 10
    flow:
      - post:
          url: "/api/calculators/ppfd"
          json:
            fixtures: [{ wattage: 600, ppfd: 800, distance: 24 }]
            area: { width: 4, length: 4 }
```

### 2. Performance Benchmarks

**Expected Performance Targets**:
- API Response Time: < 200ms (95th percentile)
- AI Assistant Response: < 5 seconds
- Design Canvas Load: < 1 second
- Database Queries: < 50ms average
- Concurrent Users: 1000+ 
- Requests/Second: 500+

## Monitoring & Alerting

### 1. Health Check Endpoints

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    claude: await checkClaude(),
    timestamp: new Date().toISOString()
  }
  
  const healthy = Object.values(checks).every(check => 
    typeof check === 'boolean' ? check : true
  )
  
  return Response.json(checks, { 
    status: healthy ? 200 : 503 
  })
}
```

### 2. Prometheus Metrics

**prometheus.yml**:
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'vibelux-app'
    static_configs:
      - targets: ['vibelux-service:80']
    metrics_path: '/api/metrics'
    scrape_interval: 10s

  - job_name: 'ai-gateway'
    static_configs:
      - targets: ['ai-gateway-service:8080']
    metrics_path: '/metrics'
    scrape_interval: 10s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### 3. Alert Rules

**alert_rules.yml**:
```yaml
groups:
- name: vibelux.rules
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"

  - alert: AIResponseTimeTooHigh
    expr: histogram_quantile(0.95, rate(ai_request_duration_seconds_bucket[5m])) > 10
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "AI response time too high"

  - alert: DatabaseConnectionFailure
    expr: up{job="postgres"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Database connection failed"
```

## Security Configuration

### 1. SSL/TLS Setup

**nginx.prod.conf**:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name vibelux.com www.vibelux.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name vibelux.com www.vibelux.com;

        ssl_certificate /etc/nginx/ssl/vibelux.crt;
        ssl_certificate_key /etc/nginx/ssl/vibelux.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!SHA1:!WEAK;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Rate limiting
        limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
        limit_req_zone $binary_remote_addr zone=ai:10m rate=10r/m;

        location /api/ai-assistant {
            limit_req zone=ai burst=5 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_timeout 30s;
        }

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 2. Security Scanning

**security-scan.sh**:
```bash
#!/bin/bash

echo "Running security scans..."

# Container vulnerability scanning
docker scan vibelux/app:latest

# Dependencies audit
npm audit --audit-level high

# OWASP ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://vibelux.com

# SSL configuration test
testssl.sh vibelux.com

echo "Security scan completed"
```

## Backup & Recovery

### 1. Database Backup Strategy

```bash
#!/bin/bash
# backup-script.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
S3_BUCKET="vibelux-backups"

# Create backup
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/vibelux_backup_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/vibelux_backup_$DATE.sql.gz s3://$S3_BUCKET/database/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "vibelux_backup_*.sql.gz" -mtime +30 -delete

# Test restore capability
echo "Testing backup restore..."
gunzip -c $BACKUP_DIR/vibelux_backup_$DATE.sql.gz | head -n 10
```

### 2. Disaster Recovery Plan

1. **RTO (Recovery Time Objective)**: 15 minutes
2. **RPO (Recovery Point Objective)**: 5 minutes
3. **Backup Frequency**: Every 4 hours
4. **Cross-region replication**: Enabled
5. **Failover automation**: Kubernetes handles pod failures
6. **Database point-in-time recovery**: Enabled

## Cost Optimization

### 1. AI Usage Optimization

- **Cache Hit Rate Target**: 70%
- **Model Selection Automation**: 85% cost reduction for simple queries
- **Request Batching**: Reduce API calls by 40%
- **Geographic Optimization**: Route to nearest AI endpoints

### 2. Infrastructure Scaling

```yaml
# HorizontalPodAutoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vibelux-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vibelux-app
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Go-Live Checklist

### Pre-Launch (1 week before)
- [ ] Database migration tested in staging
- [ ] Load testing completed with expected performance
- [ ] Security audit completed
- [ ] SSL certificates installed and tested
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery procedures tested
- [ ] Team trained on production procedures

### Launch Day
- [ ] DNS updated to production environment
- [ ] SSL certificates verified
- [ ] All health checks passing
- [ ] Monitoring dashboards active
- [ ] Team on standby for issues
- [ ] Rollback procedure ready

### Post-Launch (first week)
- [ ] Daily monitoring review
- [ ] Performance metrics validation
- [ ] User feedback collection
- [ ] Cost monitoring and optimization
- [ ] Security monitoring active
- [ ] Documentation updates

## Support & Maintenance

### 1. On-Call Procedures
- **Primary**: DevOps Engineer
- **Secondary**: Full-Stack Developer
- **Escalation**: CTO
- **Response Time**: 15 minutes for critical issues

### 2. Maintenance Windows
- **Scheduled**: Sundays 2-4 AM UTC
- **Emergency**: Anytime with approval
- **Notification**: 48 hours advance notice

### 3. Runbook Links
- Database procedures: `/docs/database-runbook.md`
- AI service troubleshooting: `/docs/ai-troubleshooting.md`
- Performance optimization: `/docs/performance-guide.md`

---

This production deployment guide ensures enterprise-grade reliability, scalability, and security for the Vibelux platform while maintaining cost efficiency through intelligent AI routing and caching strategies.