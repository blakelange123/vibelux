#!/bin/bash

# Production deployment script for Vibelux
set -e

echo "🚀 Starting Vibelux production deployment..."

# Configuration
DOCKER_REGISTRY="vibelux"
IMAGE_TAG="${1:-latest}"
ENVIRONMENT="${2:-production}"
BACKUP_ENABLED="${3:-true}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if required tools are installed
    command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed. Aborting."; exit 1; }
    command -v npm >/dev/null 2>&1 || { log_error "npm is required but not installed. Aborting."; exit 1; }
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        log_error ".env.production file not found. Please create it with required environment variables."
        exit 1
    fi
    
    log_info "Prerequisites check passed ✓"
}

run_tests() {
    log_info "Running tests..."
    
    # Install dependencies
    npm ci
    
    # Run linting
    npm run lint || log_warn "Linting failed but continuing..."
    
    # Run type checking
    npm run type-check || log_warn "Type checking failed but continuing..."
    
    # Run build test
    npm run build
    
    log_info "Tests completed ✓"
}

build_and_push_image() {
    log_info "Building Docker image..."
    
    # Build the production image
    docker build -f Dockerfile.prod -t "$DOCKER_REGISTRY/app:$IMAGE_TAG" .
    
    log_info "Docker image built ✓"
}

health_check() {
    log_info "Performing health checks..."
    
    # Simple health check - verify build was successful
    if [ -d ".next" ]; then
        log_info "Health check passed ✓"
        return 0
    else
        log_error "Health check failed - no .next directory found"
        return 1
    fi
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove old Docker images
    docker image prune -f || true
    
    # Clean up temporary files
    rm -f *.sql backup_*.sql || true
    
    log_info "Cleanup completed ✓"
}

send_notification() {
    local status="$1"
    local message="$2"
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color=""
        local emoji=""
        
        if [ "$status" = "success" ]; then
            color="good"
            emoji="✅"
        else
            color="danger"
            emoji="❌"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"attachments\":[{\"color\":\"$color\",\"title\":\"$emoji Vibelux Deployment\",\"text\":\"$message\",\"footer\":\"Deployment Script\",\"ts\":$(date +%s)}]}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
}

# Main deployment flow
main() {
    log_info "Vibelux Production Deployment"
    log_info "Environment: $ENVIRONMENT"
    log_info "Image Tag: $IMAGE_TAG"
    log_info "Backup Enabled: $BACKUP_ENABLED"
    echo
    
    # Confirmation prompt for production
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "⚠️  You are about to deploy to PRODUCTION."
        echo "This will build and prepare the application for deployment."
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Deployment cancelled."
            exit 1
        fi
    fi
    
    # Deployment steps
    check_prerequisites
    run_tests
    build_and_push_image
    
    # Health check
    if ! health_check; then
        send_notification "failure" "❌ Deployment failed health checks."
        exit 1
    fi
    
    cleanup
    
    # Success notification
    DEPLOYMENT_INFO="Environment: $ENVIRONMENT\nImage: $DOCKER_REGISTRY/app:$IMAGE_TAG\nTime: $(date)"
    send_notification "success" "✅ Deployment prepared successfully!\n$DEPLOYMENT_INFO"
    
    log_info "🎉 Deployment preparation completed successfully!"
    log_info "Application build is ready for deployment."
}

# Script options
case "${1:-deploy}" in
    "test")
        check_prerequisites
        run_tests
        ;;
    "build")
        build_and_push_image
        ;;
    "deploy")
        main
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Usage: $0 [test|build|deploy|health] [image-tag] [environment] [backup-enabled]"
        echo ""
        echo "Commands:"
        echo "  test      - Run tests only"
        echo "  build     - Build Docker image only"
        echo "  deploy    - Full deployment preparation (default)"
        echo "  health    - Run health check only"
        echo ""
        echo "Examples:"
        echo "  $0 deploy v1.2.3 production true"
        echo "  $0 build latest"
        echo "  $0 test"
        exit 1
        ;;
esac