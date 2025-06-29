# Vibelux Visual Operations Platform - Production Setup Guide

This guide provides comprehensive instructions for deploying the Vibelux Visual Operations Platform to production with your specified data layer infrastructure.

## 🏗️ Infrastructure Overview

### Data Layer Components
- **InfluxDB** - Time-series data (sensor readings, location tracking, performance metrics)
- **PostgreSQL** - Operational data (users, reports, batches, equipment)
- **MongoDB** - Document storage (photos, AI analysis, configurations)
- **Redis** - Caching and session management
- **Apache Kafka** - Real-time event streaming

### Infrastructure Layer
- **Kubernetes** - Container orchestration
- **AWS/Azure Cloud** - Cloud infrastructure
- **Edge Computing** - Local data processing
- **Monitoring & Observability** - Prometheus, Grafana, Jaeger

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Clone and navigate to the project
cd vibelux-app

# Run the automated setup script
./scripts/production-setup.sh
```

### Option 2: Manual Setup

#### 1. Prerequisites
```bash
# Install required tools
sudo apt update
sudo apt install -y docker.io docker-compose kubectl

# For macOS
brew install docker docker-compose kubectl
```

#### 2. Environment Configuration
```bash
# Copy and configure environment
cp .env.example .env.production

# Generate secure passwords
export POSTGRES_PASSWORD=$(openssl rand -base64 32)
export MONGODB_PASSWORD=$(openssl rand -base64 32)
export REDIS_PASSWORD=$(openssl rand -base64 32)
export INFLUXDB_TOKEN=$(openssl rand -base64 32)
export NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

#### 3. SSL Certificates
```bash
# For development (self-signed)
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/private.key \
  -out nginx/ssl/cert.pem

# For production, use Let's Encrypt or your CA
```

#### 4. Deploy with Docker Compose
```bash
# Build and deploy
docker build -f Dockerfile.production -t vibelux/app:latest .
docker-compose -f docker-compose.production.yml up -d

# Run database migrations
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy
```

#### 5. Deploy to Kubernetes (Optional)
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Wait for deployment
kubectl rollout status deployment/vibelux-app -n vibelux-production
```

## 📊 Database Integration

### InfluxDB Time-Series Data
```typescript
// Location tracking
await timeseriesDB.writeLocationData({
  userId: 'user-123',
  facilityId: 'facility-456',
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 5,
  battery: 85,
  timestamp: new Date()
});

// Environmental sensors
await timeseriesDB.writeEnvironmentalData({
  facilityId: 'facility-456',
  zoneId: 'zone-789',
  sensorId: 'sensor-001',
  temperature: 75.2,
  humidity: 65.8,
  co2: 1200,
  vpd: 0.95,
  lightLevel: 800,
  timestamp: new Date()
});
```

### PostgreSQL Operational Data
```typescript
// Using Prisma ORM
const report = await prisma.photoReport.create({
  data: {
    type: 'PEST_DISEASE',
    title: 'Spider mites detected',
    description: 'Found on lower leaves',
    severity: 'HIGH',
    facilityId: 'facility-456',
    userId: 'user-123',
    photos: {
      create: [{
        url: 'https://storage/photo.jpg',
        filename: 'pest-detection.jpg',
        size: 1024000,
        mimeType: 'image/jpeg'
      }]
    }
  }
});
```

### MongoDB Document Storage
```typescript
// AI analysis results
await documentDB.storeAIAnalysis({
  reportId: 'report-123',
  facilityId: 'facility-456',
  analysisType: 'pest_detection',
  results: {
    confidence: 0.94,
    detectedItems: ['spider_mites'],
    recommendations: ['Apply neem oil', 'Increase humidity'],
    metadata: { model_version: '1.2.3' }
  },
  modelVersion: '1.2.3',
  processingTime: 2340
});

// Store training content
await documentDB.storeTrainingContent('module-123', {
  lessons: [...],
  resources: [...],
  quizzes: [...]
});
```

### Redis Caching
```typescript
// Session management
await cacheDB.setUserSession('user-123', {
  facilityId: 'facility-456',
  role: 'CULTIVATION_TECH',
  permissions: ['read_reports', 'create_reports'],
  language: 'en',
  lastActive: new Date()
});

// Real-time location
await cacheDB.setUserLocation('user-123', {
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 5,
  timestamp: new Date(),
  facilityId: 'facility-456'
});
```

### Kafka Event Streaming
```typescript
// Photo report events
await eventProducer.publishPhotoReport({
  reportId: 'report-123',
  userId: 'user-123',
  facilityId: 'facility-456',
  type: 'pest_disease',
  severity: 'high',
  location: 'Veg Room 3',
  status: 'pending_review',
  timestamp: new Date()
});

// Harvest events
await eventProducer.publishHarvestEvent({
  batchId: 'batch-123',
  facilityId: 'facility-456',
  eventType: 'harvest_completed',
  strain: 'Purple Punch',
  actualYield: 2280,
  estimatedYield: 2400,
  timestamp: new Date()
});
```

## 🔧 Configuration

### Environment Variables
```bash
# Database URLs
DATABASE_URL=postgresql://user:pass@host:5432/dbname
MONGODB_URI=mongodb://user:pass@host:27017/dbname
REDIS_HOST=redis-host
INFLUXDB_URL=http://influxdb-host:8086

# Authentication
NEXTAUTH_SECRET=your-secret
CLERK_SECRET_KEY=your-clerk-key

# External Services
OPENAI_API_KEY=your-openai-key
PUSHER_APP_ID=your-pusher-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
```

### Kubernetes Secrets
```bash
# Create secrets
kubectl create secret generic vibelux-secrets \
  --from-literal=DATABASE_URL=postgresql://... \
  --from-literal=MONGODB_URI=mongodb://... \
  --from-literal=REDIS_PASSWORD=... \
  --from-literal=INFLUXDB_TOKEN=... \
  -n vibelux-production
```

## 📈 Monitoring & Observability

### Prometheus Metrics
- Application performance metrics
- Database connection pools
- Request rates and latencies
- Error rates
- Business metrics (reports created, harvests completed)

### Grafana Dashboards
- **Operational Dashboard** - Real-time facility metrics
- **Performance Dashboard** - Application performance
- **Business Dashboard** - KPIs and business metrics
- **Infrastructure Dashboard** - System health

### Distributed Tracing
- Jaeger integration for request tracing
- Track performance across microservices
- Identify bottlenecks and optimize

### Log Aggregation
- Filebeat → Elasticsearch → Kibana
- Centralized logging across all services
- Structured logging with correlation IDs

## 🛡️ Security

### Network Security
- TLS 1.3 encryption
- Rate limiting on API endpoints
- CORS configuration
- Security headers (HSTS, CSP, etc.)

### Authentication & Authorization
- Clerk authentication integration
- Role-based access control (RBAC)
- JWT token validation
- Session management

### Data Protection
- Encryption at rest (database level)
- Photo storage with access controls
- PII data handling compliance
- GDPR compliance features

## 📦 Backup & Recovery

### Automated Backups
```bash
# Set up daily backups
crontab -e
# Add: 0 2 * * * /opt/vibelux/scripts/backup/backup.sh

# Manual backup
./scripts/backup/backup.sh
```

### Disaster Recovery
- Multi-AZ deployment
- Database replication
- Point-in-time recovery
- Recovery time objective (RTO): < 1 hour
- Recovery point objective (RPO): < 15 minutes

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy
        run: |
          docker build -t vibelux/app:${{ github.sha }} .
          kubectl set image deployment/vibelux-app app=vibelux/app:${{ github.sha }}
```

### Blue-Green Deployment
- Zero-downtime deployments
- Automatic rollback on failure
- Health checks before traffic switch

## 📱 Edge Computing

### Edge Deployment
- Local processing for offline capabilities
- Reduced latency for real-time operations
- Data synchronization with central cloud

### Edge Architecture
- Lightweight containers
- Local database replicas
- Intelligent data sync

## 🚨 Alerting

### Alert Rules
- High error rates
- Database connection issues
- High memory/CPU usage
- Failed backup jobs
- Security incidents

### Notification Channels
- Slack integration
- Email alerts
- PagerDuty integration
- SMS for critical alerts

## 📋 Maintenance

### Regular Tasks
- Database maintenance and optimization
- Log rotation and cleanup
- Security patches and updates
- Performance tuning
- Backup verification

### Health Checks
```bash
# Application health
curl -f https://your-domain.com/api/health

# Database health
docker-compose exec postgres pg_isready

# Service status
kubectl get pods -n vibelux-production
```

## 🎯 Performance Optimization

### Database Optimization
- Query optimization and indexing
- Connection pooling
- Read replicas for analytics
- Partitioning for large tables

### Application Optimization
- Redis caching strategy
- CDN for static assets
- Image optimization
- API response caching

### Infrastructure Scaling
- Horizontal pod autoscaling
- Database auto-scaling
- Load balancer configuration
- CDN optimization

## 📞 Support

### Troubleshooting
```bash
# Check logs
docker-compose logs app
kubectl logs -f deployment/vibelux-app -n vibelux-production

# Database connections
docker-compose exec app npx prisma db pull

# Clear cache
docker-compose exec redis redis-cli FLUSHALL
```

### Common Issues
1. **Database Migration Errors** - Check connection strings
2. **Authentication Issues** - Verify Clerk configuration
3. **Performance Issues** - Check Redis and database connections
4. **Storage Issues** - Verify MongoDB GridFS setup

This production setup provides a robust, scalable infrastructure for the Vibelux Visual Operations Platform, ready to handle enterprise greenhouse operations with high availability and performance.