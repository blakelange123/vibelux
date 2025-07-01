#!/bin/bash

# Production Readiness Checker for Vibelux
# This script verifies all requirements for production deployment

echo "🔍 Vibelux Production Readiness Check"
echo "===================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

READY=true

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variable
check_env() {
    if [ -f .env.production ]; then
        grep -q "^$1=" .env.production && ! grep -q "^$1=.*your_\|^$1=.*change_this\|^$1=$" .env.production
    else
        return 1
    fi
}

echo -e "\n${YELLOW}1. Checking Dependencies...${NC}"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not installed${NC}"
    READY=false
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not installed${NC}"
    READY=false
fi

# Check Docker
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ Docker installed: $DOCKER_VERSION${NC}"
else
    echo -e "${RED}✗ Docker not installed (required for databases)${NC}"
    READY=false
fi

echo -e "\n${YELLOW}2. Checking Environment Configuration...${NC}"

# Check for .env.production
if [ -f .env.production ]; then
    echo -e "${GREEN}✓ .env.production exists${NC}"
    
    # Check critical environment variables
    CRITICAL_VARS=(
        "DATABASE_URL"
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
        "CLERK_SECRET_KEY"
        "STRIPE_PUBLISHABLE_KEY"
        "STRIPE_SECRET_KEY"
        "STRIPE_WEBHOOK_SECRET"
        "JWT_SECRET"
        "SESSION_SECRET"
        "ENCRYPTION_KEY"
        "NEXTAUTH_SECRET"
    )
    
    for var in "${CRITICAL_VARS[@]}"; do
        if check_env "$var"; then
            echo -e "${GREEN}✓ $var is set${NC}"
        else
            echo -e "${RED}✗ $var is not set or contains placeholder${NC}"
            READY=false
        fi
    done
else
    echo -e "${RED}✗ .env.production not found${NC}"
    echo -e "${YELLOW}  Run: ./scripts/setup-production.sh${NC}"
    READY=false
fi

echo -e "\n${YELLOW}3. Checking Database Services...${NC}"

# Check PostgreSQL
if docker ps | grep -q vibelux-postgres; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
    READY=false
fi

# Check Redis
if docker ps | grep -q vibelux-redis; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${RED}✗ Redis is not running${NC}"
    READY=false
fi

# Check InfluxDB
if docker ps | grep -q vibelux-influxdb; then
    echo -e "${GREEN}✓ InfluxDB is running${NC}"
else
    echo -e "${RED}✗ InfluxDB is not running${NC}"
    READY=false
fi

echo -e "\n${YELLOW}4. Checking TypeScript Compilation...${NC}"

# Run type check
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✓ TypeScript compilation successful${NC}"
else
    echo -e "${RED}✗ TypeScript compilation errors found${NC}"
    echo -e "${YELLOW}  Run: npm run type-check${NC}"
    READY=false
fi

echo -e "\n${YELLOW}5. Checking Database Migrations...${NC}"

# Check if migrations are up to date
if npx prisma migrate status > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database migrations are up to date${NC}"
else
    echo -e "${YELLOW}⚠ Database migrations may need to be run${NC}"
    echo -e "${YELLOW}  Run: npx prisma migrate deploy${NC}"
fi

echo -e "\n${YELLOW}6. Checking Build...${NC}"

# Check if .next directory exists
if [ -d ".next" ]; then
    echo -e "${GREEN}✓ Build directory exists${NC}"
else
    echo -e "${YELLOW}⚠ No build found${NC}"
    echo -e "${YELLOW}  Run: npm run build:production${NC}"
fi

echo -e "\n${YELLOW}7. Optional Services Check...${NC}"

# Check for optional API keys
OPTIONAL_VARS=(
    "OPENAI_API_KEY"
    "ANTHROPIC_API_KEY"
    "SENTRY_DSN"
    "GOOGLE_VISION_API_KEY"
    "SENDGRID_API_KEY"
)

for var in "${OPTIONAL_VARS[@]}"; do
    if check_env "$var"; then
        echo -e "${GREEN}✓ $var is set (optional)${NC}"
    else
        echo -e "${YELLOW}⚠ $var is not set (optional)${NC}"
    fi
done

# Final verdict
echo -e "\n=================================="
if [ "$READY" = true ]; then
    echo -e "${GREEN}✅ PRODUCTION READY!${NC}"
    echo -e "\nNext steps:"
    echo -e "1. Run: ${YELLOW}npm run build:production${NC}"
    echo -e "2. Run: ${YELLOW}npm start${NC}"
    echo -e "3. Visit: ${YELLOW}http://localhost:3000${NC}"
else
    echo -e "${RED}❌ NOT READY FOR PRODUCTION${NC}"
    echo -e "\nPlease fix the issues above before deploying."
    echo -e "\nQuick fix:"
    echo -e "1. Run: ${YELLOW}./scripts/setup-production.sh${NC}"
    echo -e "2. Update ${YELLOW}.env.production${NC} with your API keys"
    echo -e "3. Run this check again"
fi

echo -e "\n${YELLOW}For detailed logs, check:${NC}"
echo "- TypeScript errors: npm run type-check"
echo "- Build errors: npm run build:production"
echo "- Database status: docker ps"