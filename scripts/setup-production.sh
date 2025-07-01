#!/bin/bash

# Production Setup Script for Vibelux
# This script sets up all required services and configurations for production deployment

set -e  # Exit on error

echo "🚀 Vibelux Production Setup Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate secure random strings
generate_secret() {
    openssl rand -base64 32
}

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command_exists psql; then
    echo -e "${YELLOW}PostgreSQL client not found. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install postgresql
    else
        sudo apt-get update && sudo apt-get install -y postgresql-client
    fi
fi

# 1. Generate secure secrets
echo -e "\n${YELLOW}Generating secure secrets...${NC}"

if [ ! -f .env.production ]; then
    cp .env.example .env.production
    
    # Generate secrets
    JWT_SECRET=$(generate_secret)
    SESSION_SECRET=$(generate_secret)
    ENCRYPTION_KEY=$(generate_secret)
    NEXTAUTH_SECRET=$(generate_secret)
    
    # Update .env.production with generated secrets
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env.production
    sed -i.bak "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env.production
    sed -i.bak "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env.production
    
    # Add NEXTAUTH_SECRET if not present
    if ! grep -q "NEXTAUTH_SECRET" .env.production; then
        echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> .env.production
    fi
    
    echo -e "${GREEN}✓ Secrets generated${NC}"
else
    echo -e "${YELLOW}! .env.production already exists. Skipping secret generation.${NC}"
fi

# 2. Set up PostgreSQL
echo -e "\n${YELLOW}Setting up PostgreSQL...${NC}"

# Check if PostgreSQL is already running
if docker ps | grep -q vibelux-postgres; then
    echo -e "${YELLOW}PostgreSQL container already running${NC}"
else
    docker run -d \
        --name vibelux-postgres \
        -e POSTGRES_USER=vibelux \
        -e POSTGRES_PASSWORD=vibelux_secure_password_$(openssl rand -hex 16) \
        -e POSTGRES_DB=vibelux_production \
        -p 5432:5432 \
        -v vibelux_postgres_data:/var/lib/postgresql/data \
        postgres:15-alpine
    
    echo -e "${GREEN}✓ PostgreSQL started${NC}"
    
    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
fi

# Get PostgreSQL container details
POSTGRES_PASSWORD=$(docker exec vibelux-postgres printenv POSTGRES_PASSWORD)
DATABASE_URL="postgresql://vibelux:${POSTGRES_PASSWORD}@localhost:5432/vibelux_production"

# Update DATABASE_URL in .env.production
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env.production

# 3. Set up Redis
echo -e "\n${YELLOW}Setting up Redis...${NC}"

if docker ps | grep -q vibelux-redis; then
    echo -e "${YELLOW}Redis container already running${NC}"
else
    docker run -d \
        --name vibelux-redis \
        -p 6379:6379 \
        -v vibelux_redis_data:/data \
        redis:7-alpine \
        redis-server --appendonly yes --requirepass vibelux_redis_$(openssl rand -hex 16)
    
    echo -e "${GREEN}✓ Redis started${NC}"
fi

# Get Redis password
REDIS_PASSWORD=$(docker exec vibelux-redis redis-cli CONFIG GET requirepass | tail -1)
REDIS_URL="redis://default:${REDIS_PASSWORD}@localhost:6379"

# Add Redis URL to .env.production
if ! grep -q "REDIS_URL" .env.production; then
    echo "REDIS_URL=$REDIS_URL" >> .env.production
fi

# 4. Set up InfluxDB
echo -e "\n${YELLOW}Setting up InfluxDB...${NC}"

if docker ps | grep -q vibelux-influxdb; then
    echo -e "${YELLOW}InfluxDB container already running${NC}"
else
    # Generate InfluxDB credentials
    INFLUX_PASSWORD=$(openssl rand -hex 16)
    INFLUX_TOKEN=$(openssl rand -base64 32)
    
    docker run -d \
        --name vibelux-influxdb \
        -p 8086:8086 \
        -v vibelux_influxdb_data:/var/lib/influxdb2 \
        -e DOCKER_INFLUXDB_INIT_MODE=setup \
        -e DOCKER_INFLUXDB_INIT_USERNAME=vibelux \
        -e DOCKER_INFLUXDB_INIT_PASSWORD=$INFLUX_PASSWORD \
        -e DOCKER_INFLUXDB_INIT_ORG=vibelux \
        -e DOCKER_INFLUXDB_INIT_BUCKET=vibelux_metrics \
        -e DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=$INFLUX_TOKEN \
        influxdb:2.7-alpine
    
    echo -e "${GREEN}✓ InfluxDB started${NC}"
    
    # Add InfluxDB configuration to .env.production
    if ! grep -q "INFLUXDB_URL" .env.production; then
        cat >> .env.production << EOF

# InfluxDB Configuration
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=$INFLUX_TOKEN
INFLUXDB_ORG=vibelux
INFLUXDB_BUCKET=vibelux_metrics
EOF
    fi
fi

# 5. Run database migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

echo -e "${GREEN}✓ Database migrations completed${NC}"

# 6. Create initial admin user (optional)
echo -e "\n${YELLOW}Database setup complete!${NC}"

# 7. Display important information
echo -e "\n${GREEN}=== Setup Complete ===${NC}"
echo -e "\n${YELLOW}Important: Save these credentials securely:${NC}"
echo -e "PostgreSQL Password: ${POSTGRES_PASSWORD}"
echo -e "Redis Password: ${REDIS_PASSWORD}"
echo -e "InfluxDB Token: ${INFLUX_TOKEN}"

echo -e "\n${YELLOW}Services running:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep vibelux

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Update .env.production with your Clerk API keys"
echo "2. Update .env.production with your Stripe API keys"
echo "3. Update .env.production with any other API keys (OpenAI, etc.)"
echo "4. Run: npm run build:production"
echo "5. Run: npm start"

echo -e "\n${GREEN}Production environment is ready! 🎉${NC}"

# Save service information
cat > docker-services.json << EOF
{
  "postgres": {
    "container": "vibelux-postgres",
    "url": "$DATABASE_URL",
    "password": "$POSTGRES_PASSWORD"
  },
  "redis": {
    "container": "vibelux-redis",
    "url": "$REDIS_URL",
    "password": "$REDIS_PASSWORD"
  },
  "influxdb": {
    "container": "vibelux-influxdb",
    "url": "http://localhost:8086",
    "token": "$INFLUX_TOKEN",
    "password": "$INFLUX_PASSWORD"
  }
}
EOF

echo -e "\n${YELLOW}Service credentials saved to docker-services.json${NC}"