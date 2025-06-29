# Energy Optimization System Deployment Guide

## Overview
This guide covers deploying the VibeLux Energy Optimization System, which includes:
- Smart optimization algorithms with adaptive learning
- Claude Opus AI integration for advanced decisions
- Real-time monitoring and alerts
- Emergency stop system with multiple fail-safes
- Background job processing
- PostgreSQL database for tracking and analytics

## Prerequisites

1. **PostgreSQL Database** (v14+)
2. **Node.js** (v18+)
3. **Redis** (optional, for job queuing)
4. **Environment Variables**:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/vibelux
   ANTHROPIC_API_KEY=your-claude-api-key
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

## Deployment Steps

### 1. Database Setup

Run the automated setup script:
```bash
cd /path/to/vibelux-app
./scripts/setup-energy-database.sh
```

Or manually execute the SQL:
```bash
psql $DATABASE_URL -f prisma/migrations/energy_savings_schema.sql
```

### 2. Environment Configuration

Create/update `.env.production`:
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/vibelux_production

# Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# App URLs
NEXT_PUBLIC_APP_URL=https://app.vibelux.com
NEXTAUTH_URL=https://app.vibelux.com

# Optional: Email/SMS for alerts
SENDGRID_API_KEY=your-key
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Build and Deploy

#### Option A: Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Start services
CMD ["npm", "run", "start:production"]
```

#### Option B: Direct Deployment
```bash
# Install dependencies
npm ci --only=production

# Build application
npm run build

# Start production server
npm run start
```

### 4. Start Background Services

Create a `start:production` script in package.json:
```json
{
  "scripts": {
    "start:production": "node scripts/start-energy-services.js && next start"
  }
}
```

Create `scripts/start-energy-services.js`:
```javascript
const { energySystemStartup } = require('../dist/services/energy-system-startup');
const { startEnergyOptimizationJob } = require('../dist/jobs/energy-optimization-job');

async function startServices() {
  console.log('Starting energy optimization services...');
  
  try {
    // Initialize the energy system
    await energySystemStartup.initialize();
    
    // Start the optimization job (runs every 5 minutes)
    startEnergyOptimizationJob();
    
    console.log('✅ Energy services started successfully');
  } catch (error) {
    console.error('Failed to start energy services:', error);
    process.exit(1);
  }
}

startServices();
```

### 5. Configure Process Manager

#### Using PM2:
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
pm2 init
```

Edit `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'vibelux-web',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }, {
    name: 'vibelux-energy',
    script: './dist/jobs/energy-optimization-job.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Set Up Monitoring

#### Health Check Endpoint
Create `/api/health/energy`:
```typescript
export async function GET() {
  const status = {
    service: 'energy-optimization',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabase(),
      claude: await checkClaude(),
      hardware: await checkHardware(),
      jobs: await checkJobs()
    }
  };
  
  return Response.json(status);
}
```

#### Monitoring with Datadog/New Relic
```javascript
// Add to energy-optimization-job.ts
import { StatsD } from 'node-statsd';
const stats = new StatsD();

// Track metrics
stats.increment('energy.optimization.cycle');
stats.gauge('energy.savings.percentage', savingsPercent);
stats.timing('energy.claude.response', responseTime);
```

### 7. Security Checklist

- [ ] Encrypt `ANTHROPIC_API_KEY` using secrets manager
- [ ] Set up database connection pooling
- [ ] Enable SSL for PostgreSQL connections
- [ ] Implement rate limiting for API endpoints
- [ ] Set up firewall rules for hardware communication
- [ ] Enable audit logging for all optimization events
- [ ] Configure backup retention (90 days recommended)

### 8. Post-Deployment Verification

Run these checks after deployment:

```bash
# Check database tables
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"

# Test emergency stop
curl -X POST https://app.vibelux.com/api/emergency-stop/test

# Verify job scheduler
curl https://app.vibelux.com/api/health/energy

# Check Claude integration
curl -X POST https://app.vibelux.com/api/test-claude
```

### 9. Maintenance Tasks

#### Daily:
- Monitor error logs
- Check optimization success rate
- Verify savings calculations

#### Weekly:
- Review Claude API usage
- Analyze optimization patterns
- Update facility baselines

#### Monthly:
- Generate savings reports
- Reset Claude API counter
- Archive old power readings
- Review and tune optimization parameters

### 10. Troubleshooting

#### Common Issues:

**1. Database Connection Errors**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check connection pool
SELECT count(*) FROM pg_stat_activity;
```

**2. Claude API Errors**
```bash
# Check API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

**3. Hardware Communication Issues**
```bash
# Test Modbus connection
node scripts/test-modbus.js

# Check device status
curl http://localhost:3000/api/hardware/status
```

**4. Job Processing Stopped**
```bash
# Restart PM2 process
pm2 restart vibelux-energy

# Check job logs
pm2 logs vibelux-energy --lines 100
```

## Performance Optimization

### Database Indexes
Already created by setup script, but verify:
```sql
\d power_readings
\d optimization_events
```

### Caching Strategy
- Claude responses: 30-minute cache
- Historical patterns: 1-hour cache
- Device status: 30-second cache

### Scaling Considerations
- Partition `power_readings` table by month for large deployments
- Use read replicas for analytics queries
- Consider time-series database (InfluxDB) for >1M readings/day

## Support

For deployment assistance:
- Documentation: https://docs.vibelux.com/energy-optimization
- Support: support@vibelux.com
- Emergency: +1-xxx-xxx-xxxx (24/7 for enterprise)

## Compliance Notes

- Energy savings calculations follow IPMVP standards
- Data retention complies with utility rebate requirements (7 years)
- Claude AI usage complies with Anthropic's terms of service
- All optimization events are logged for audit trails