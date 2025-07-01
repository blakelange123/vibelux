# Vibelux Database Setup Guide

## Quick Start

### For Development
```bash
# Run this to set up all databases for local development
./scripts/setup-dev-databases.sh

# This will:
# - Start PostgreSQL on port 5432
# - Start Redis on port 6379
# - Start InfluxDB on port 8086
# - Create .env.local with connection strings
# - Run database migrations
```

### For Production
```bash
# Run this to set up production environment
./scripts/setup-production.sh

# This will:
# - Generate secure secrets
# - Start all database services with production configs
# - Create .env.production with secure credentials
# - Run database migrations
# - Save credentials to docker-services.json
```

## Database Services

### 1. PostgreSQL (Main Database)
- **Purpose**: Stores all application data (users, projects, designs, etc.)
- **Port**: 5432
- **Connection**: `postgresql://vibelux:password@localhost:5432/vibelux_db`

### 2. Redis (Cache & Sessions)
- **Purpose**: Session storage, caching, real-time features
- **Port**: 6379
- **Connection**: `redis://localhost:6379`

### 3. InfluxDB (Time-Series Data)
- **Purpose**: Stores sensor data, metrics, and time-series analytics
- **Port**: 8086
- **Web UI**: http://localhost:8086

## Environment Variables

### Required for Production
```env
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Payments
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Security
JWT_SECRET=<generated>
SESSION_SECRET=<generated>
ENCRYPTION_KEY=<generated>
NEXTAUTH_SECRET=<generated>

# Cache
REDIS_URL=redis://...

# Time-Series
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=<generated>
INFLUXDB_ORG=vibelux
INFLUXDB_BUCKET=vibelux_metrics
```

### Optional Services
```env
# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Monitoring
SENTRY_DSN=https://...

# Email
SENDGRID_API_KEY=SG...

# Other APIs
GOOGLE_VISION_API_KEY=...
UTILITYAPI_TOKEN=...
```

## Management Commands

### Check Production Readiness
```bash
./scripts/check-production-readiness.sh
```

### Stop Development Databases
```bash
./scripts/stop-dev-databases.sh
```

### View Running Services
```bash
docker ps | grep vibelux
```

### Access Database Logs
```bash
# PostgreSQL logs
docker logs vibelux-postgres-dev

# Redis logs
docker logs vibelux-redis-dev

# InfluxDB logs
docker logs vibelux-influxdb-dev
```

### Database Migrations
```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset
```

### Backup Databases
```bash
# PostgreSQL backup
docker exec vibelux-postgres-dev pg_dump -U vibelux vibelux_development > backup.sql

# Redis backup
docker exec vibelux-redis-dev redis-cli SAVE

# InfluxDB backup
docker exec vibelux-influxdb-dev influx backup /backup
```

## Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8086  # InfluxDB

# Kill the process
kill -9 <PID>
```

### Container Won't Start
```bash
# Remove old container
docker rm vibelux-postgres-dev

# Remove old volume (WARNING: deletes data)
docker volume rm vibelux_postgres_dev_data
```

### Connection Refused
1. Check if Docker is running
2. Check if containers are running: `docker ps`
3. Check firewall settings
4. Verify connection string in .env file

### Migration Errors
```bash
# Generate Prisma client
npx prisma generate

# Check migration status
npx prisma migrate status

# Force reset (development only!)
npx prisma migrate reset --force
```

## Security Notes

1. **Never commit .env files** - They contain secrets
2. **Change all default passwords** in production
3. **Use strong passwords** - The setup script generates them automatically
4. **Backup credentials** - Save the docker-services.json file securely
5. **Rotate secrets regularly** in production
6. **Use SSL/TLS** for database connections in production

## Next Steps

After database setup:
1. Configure your API keys in `.env.production`
2. Run `npm run build:production`
3. Deploy to your hosting platform
4. Set up SSL certificates
5. Configure backups
6. Set up monitoring