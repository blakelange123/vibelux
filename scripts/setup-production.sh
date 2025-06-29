#!/bin/bash

# =================================================================
# VibeLux Production Setup Script
# =================================================================
# This script helps you set up VibeLux for production deployment
# =================================================================

set -e

echo "🚀 VibeLux Production Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_step "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Generate secure secrets
generate_secrets() {
    print_step "Generating secure secrets..."
    
    JWT_SECRET=$(openssl rand -base64 32)
    SESSION_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    
    print_success "Secrets generated"
}

# Validate environment
validate_environment() {
    print_step "Validating environment configuration..."
    
    if [ ! -f ".env.production" ]; then
        print_error ".env.production file not found"
        exit 1
    fi
    
    # Check if required environment variables are set
    required_vars=(
        "DATABASE_URL"
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
        "CLERK_SECRET_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env.production; then
            print_warning "$var not found in .env.production"
        fi
    done
    
    print_success "Environment validation complete"
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Build application
build_application() {
    print_step "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Run tests
run_tests() {
    print_step "Running tests..."
    npm run test:unit
    npm run type-check
    npm run lint
    print_success "All tests passed"
}

# Setup database
setup_database() {
    print_step "Setting up database..."
    npm run db:generate
    print_success "Database setup complete"
}

# Deployment checklist
deployment_checklist() {
    echo ""
    print_step "Deployment Checklist"
    echo "=================================="
    
    checklist_items=(
        "✅ Supabase project created and configured"
        "✅ Vercel account set up and repository connected"
        "✅ Upstash Redis database created"
        "✅ AWS S3 bucket created with proper permissions"
        "✅ Clerk authentication configured"
        "✅ Environment variables added to Vercel"
        "✅ Custom domain configured (optional)"
        "✅ SSL certificate enabled"
    )
    
    for item in "${checklist_items[@]}"; do
        echo "$item"
    done
    
    echo ""
    print_warning "Make sure all items above are completed before deploying"
}

# Service setup instructions
service_instructions() {
    echo ""
    print_step "Service Setup Instructions"
    echo "=================================="
    
    echo -e "${BLUE}1. Supabase Setup:${NC}"
    echo "   • Go to https://supabase.com"
    echo "   • Create new project"
    echo "   • Copy DATABASE_URL, SUPABASE_URL, and keys"
    echo ""
    
    echo -e "${BLUE}2. Vercel Setup:${NC}"
    echo "   • Go to https://vercel.com"
    echo "   • Import your GitHub repository"
    echo "   • Add environment variables"
    echo ""
    
    echo -e "${BLUE}3. Upstash Redis Setup:${NC}"
    echo "   • Go to https://upstash.com"
    echo "   • Create new Redis database"
    echo "   • Copy REDIS_URL"
    echo ""
    
    echo -e "${BLUE}4. AWS S3 Setup:${NC}"
    echo "   • Go to AWS Console → S3"
    echo "   • Create bucket: vibelux-production-[random]"
    echo "   • Create IAM user with S3 permissions"
    echo "   • Copy access keys"
    echo ""
    
    echo -e "${BLUE}5. Clerk Setup:${NC}"
    echo "   • Go to https://clerk.com"
    echo "   • Create new application"
    echo "   • Configure OAuth providers"
    echo "   • Copy publishable and secret keys"
}

# Cost estimation
cost_estimation() {
    echo ""
    print_step "Monthly Cost Estimation"
    echo "=================================="
    
    echo "🆓 Development (Free Tier):"
    echo "   • Vercel: $0 (Hobby plan)"
    echo "   • Supabase: $0 (Free tier - 2 projects)"
    echo "   • Upstash: $0 (Free tier - 10K requests)"
    echo "   • AWS S3: $0 (Free tier - 5GB)"
    echo "   Total: $0/month"
    echo ""
    
    echo "💰 Production (Paid Tiers):"
    echo "   • Vercel Pro: $20/month"
    echo "   • Supabase Pro: $25/month"
    echo "   • Upstash Redis: $10-25/month"
    echo "   • AWS S3: $5-15/month"
    echo "   Total: $60-85/month"
    echo ""
    
    echo "📈 Scale (High Traffic):"
    echo "   • Vercel Team: $50/month"
    echo "   • Supabase Team: $100/month"
    echo "   • Upstash: $50+/month"
    echo "   • AWS S3: $20+/month"
    echo "   Total: $220+/month"
}

# Main execution
main() {
    clear
    echo "🌱 Welcome to VibeLux Production Setup!"
    echo "======================================"
    echo ""
    
    check_dependencies
    generate_secrets
    install_dependencies
    validate_environment
    setup_database
    build_application
    run_tests
    
    echo ""
    print_success "Setup completed successfully!"
    
    deployment_checklist
    service_instructions
    cost_estimation
    
    echo ""
    print_step "Next Steps:"
    echo "1. Review the PRODUCTION_SETUP_GUIDE.md for detailed instructions"
    echo "2. Set up your cloud services (Supabase, Vercel, etc.)"
    echo "3. Add environment variables to Vercel"
    echo "4. Deploy your application"
    echo ""
    
    print_success "You're ready to deploy VibeLux to production! 🚀"
}

# Run the main function
main "$@"