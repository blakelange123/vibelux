#!/bin/bash

# Development Database Setup Script for Vibelux
# This script sets up PostgreSQL, Redis, and InfluxDB for local development

set -e  # Exit on error

echo "🚀 Vibelux Development Database Setup"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# 1. Set up PostgreSQL
echo -e "\n${YELLOW}Setting up PostgreSQL...${NC}"

if docker ps -a | grep -q vibelux-postgres-dev; then
    echo "Stopping existing PostgreSQL container..."
    docker stop vibelux-postgres-dev 2>/dev/null || true
    docker rm vibelux-postgres-dev 2>/dev/null || true
fi

docker run -d \
    --name vibelux-postgres-dev \
    -e POSTGRES_USER=vibelux \
    -e POSTGRES_PASSWORD=vibelux_dev \
    -e POSTGRES_DB=vibelux_development \
    -p 5432:5432 \
    -v vibelux_postgres_dev_data:/var/lib/postgresql/data \
    postgres:15-alpine

echo -e "${GREEN}✓ PostgreSQL started on port 5432${NC}"

# 2. Set up Redis
echo -e "\n${YELLOW}Setting up Redis...${NC}"

if docker ps -a | grep -q vibelux-redis-dev; then
    echo "Stopping existing Redis container..."
    docker stop vibelux-redis-dev 2>/dev/null || true
    docker rm vibelux-redis-dev 2>/dev/null || true
fi

docker run -d \
    --name vibelux-redis-dev \
    -p 6379:6379 \
    -v vibelux_redis_dev_data:/data \
    redis:7-alpine

echo -e "${GREEN}✓ Redis started on port 6379${NC}"

# 3. Set up InfluxDB
echo -e "\n${YELLOW}Setting up InfluxDB...${NC}"

if docker ps -a | grep -q vibelux-influxdb-dev; then
    echo "Stopping existing InfluxDB container..."
    docker stop vibelux-influxdb-dev 2>/dev/null || true
    docker rm vibelux-influxdb-dev 2>/dev/null || true
fi

docker run -d \
    --name vibelux-influxdb-dev \
    -p 8086:8086 \
    -v vibelux_influxdb_dev_data:/var/lib/influxdb2 \
    -e DOCKER_INFLUXDB_INIT_MODE=setup \
    -e DOCKER_INFLUXDB_INIT_USERNAME=admin \
    -e DOCKER_INFLUXDB_INIT_PASSWORD=vibelux_dev \
    -e DOCKER_INFLUXDB_INIT_ORG=vibelux \
    -e DOCKER_INFLUXDB_INIT_BUCKET=vibelux_metrics \
    -e DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=vibelux_dev_token_123456789 \
    influxdb:2.7-alpine

echo -e "${GREEN}✓ InfluxDB started on port 8086${NC}"

# 4. Create/Update .env.local
echo -e "\n${YELLOW}Creating .env.local file...${NC}"

cat > .env.local << 'EOF'
# Development Database Configuration
DATABASE_URL=postgresql://vibelux:vibelux_dev@localhost:5432/vibelux_development

# Redis Configuration
REDIS_URL=redis://localhost:6379

# InfluxDB Configuration
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=vibelux_dev_token_123456789
INFLUXDB_ORG=vibelux
INFLUXDB_BUCKET=vibelux_metrics

# Development Secrets (DO NOT USE IN PRODUCTION)
JWT_SECRET=dev_jwt_secret_key_change_in_production
SESSION_SECRET=dev_session_secret_key_change_in_production
ENCRYPTION_KEY=dev_encryption_key_change_in_production
NEXTAUTH_SECRET=dev_nextauth_secret_key_change_in_production

# Add your API keys here:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
EOF

echo -e "${GREEN}✓ Created .env.local file${NC}"

# 5. Wait for services to be ready
echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 5

# 6. Run database migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

echo -e "${GREEN}✓ Database migrations completed${NC}"

# 7. Display status
echo -e "\n${GREEN}=== Development Environment Ready ===${NC}"
echo -e "\n${YELLOW}Services running:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep vibelux

echo -e "\n${YELLOW}Connection details:${NC}"
echo "PostgreSQL: postgresql://vibelux:vibelux_dev@localhost:5432/vibelux_development"
echo "Redis: redis://localhost:6379"
echo "InfluxDB: http://localhost:8086 (user: admin, pass: vibelux_dev)"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Update .env.local with your API keys (Clerk, Stripe, etc.)"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"

echo -e "\n${GREEN}Happy coding! 🚀${NC}"

# Create stop script
cat > scripts/stop-dev-databases.sh << 'STOP_SCRIPT'
#!/bin/bash
echo "Stopping development databases..."
docker stop vibelux-postgres-dev vibelux-redis-dev vibelux-influxdb-dev
echo "Done! Containers stopped (data is preserved)."
echo "To remove containers and data, run:"
echo "  docker rm vibelux-postgres-dev vibelux-redis-dev vibelux-influxdb-dev"
echo "  docker volume rm vibelux_postgres_dev_data vibelux_redis_dev_data vibelux_influxdb_dev_data"
STOP_SCRIPT

chmod +x scripts/stop-dev-databases.sh

echo -e "\n${YELLOW}Created scripts/stop-dev-databases.sh to stop services${NC}"