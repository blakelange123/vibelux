#!/bin/bash

# Production Setup Script for Vibelux Visual Operations Platform
# This script sets up the complete production environment

set -e

echo "🚀 Starting Vibelux Production Setup..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="vibelux"
DOMAIN="${DOMAIN:-vibelux.yourdomain.com}"
ENVIRONMENT="${ENVIRONMENT:-production}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if kubectl is installed (for Kubernetes deployment)
    if ! command -v kubectl &> /dev/null; then
        print_warning "kubectl is not installed. Kubernetes deployment will be skipped."
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    print_success "Prerequisites check completed"
}

# Generate environment file
generate_env_file() {
    print_status "Generating environment configuration..."
    
    if [ ! -f .env.production ]; then
        cat > .env.production << EOF
# Vibelux Production Environment Configuration
NODE_ENV=production
DOMAIN=${DOMAIN}

# Database Configuration
DATABASE_URL=postgresql://vibelux:\${POSTGRES_PASSWORD}@postgres:5432/vibelux_prod
POSTGRES_PASSWORD=\$(openssl rand -base64 32)
MONGODB_URI=mongodb://vibelux:\${MONGODB_PASSWORD}@mongodb:27017/vibelux_docs
MONGODB_PASSWORD=\$(openssl rand -base64 32)

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=\$(openssl rand -base64 32)

# InfluxDB Configuration
INFLUXDB_URL=http://influxdb:8086
INFLUXDB_TOKEN=\$(openssl rand -base64 32)
INFLUXDB_ORG=vibelux
INFLUXDB_BUCKET=greenhouse_data
INFLUXDB_PASSWORD=\$(openssl rand -base64 32)

# Kafka Configuration
KAFKA_BROKERS=kafka:9092
KAFKA_CLIENT_ID=vibelux-app

# Authentication
NEXTAUTH_URL=https://${DOMAIN}
NEXTAUTH_SECRET=\$(openssl rand -base64 32)
CLERK_SECRET_KEY=your_clerk_secret_key_here

# AI Services
OPENAI_API_KEY=your_openai_api_key_here

# Real-time Services
PUSHER_APP_ID=your_pusher_app_id_here
PUSHER_KEY=your_pusher_key_here
PUSHER_SECRET=your_pusher_secret_here
PUSHER_CLUSTER=your_pusher_cluster_here

# Monitoring
GRAFANA_PASSWORD=\$(openssl rand -base64 32)

# SSL/TLS
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/private.key
EOF
        print_success "Environment file created: .env.production"
        print_warning "Please update the placeholder values in .env.production with your actual API keys and secrets"
    else
        print_status ".env.production already exists, skipping generation"
    fi
}

# Setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    mkdir -p nginx/ssl
    
    if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/private.key ]; then
        print_status "Generating self-signed certificates for development..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/private.key \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=${DOMAIN}"
        
        print_success "Self-signed certificates generated"
        print_warning "For production, replace with certificates from a trusted CA"
    else
        print_status "SSL certificates already exist"
    fi
}

# Setup Nginx configuration
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    mkdir -p nginx
    
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name _;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/private.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

        client_max_body_size 100M;

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Auth endpoints with stricter rate limiting
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /_next/static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://app;
        }

        # All other requests
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
EOF
    
    print_success "Nginx configuration created"
}

# Setup monitoring configuration
setup_monitoring() {
    print_status "Setting up monitoring configuration..."
    
    mkdir -p monitoring/{prometheus,grafana/provisioning/datasources,grafana/provisioning/dashboards,grafana/dashboards}
    
    # Prometheus configuration
    cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'vibelux-app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb:27017']

  - job_name: 'influxdb'
    static_configs:
      - targets: ['influxdb:8086']

  - job_name: 'kafka'
    static_configs:
      - targets: ['kafka:9092']
EOF

    # Grafana datasource configuration
    cat > monitoring/grafana/provisioning/datasources/datasources.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
  
  - name: InfluxDB
    type: influxdb
    access: proxy
    url: http://influxdb:8086
    database: greenhouse_data
    user: vibelux
    secureJsonData:
      password: INFLUXDB_PASSWORD
EOF

    print_success "Monitoring configuration created"
}

# Build and deploy with Docker Compose
deploy_docker() {
    print_status "Building and deploying with Docker Compose..."
    
    # Build the application image
    print_status "Building application image..."
    docker build -f Dockerfile.production -t vibelux/app:latest .
    
    # Deploy with Docker Compose
    print_status "Starting services with Docker Compose..."
    docker-compose -f docker-compose.production.yml --env-file .env.production up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Run database migrations
    print_status "Running database migrations..."
    docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy
    
    print_success "Docker deployment completed"
}

# Deploy to Kubernetes (optional)
deploy_kubernetes() {
    if command -v kubectl &> /dev/null; then
        print_status "Deploying to Kubernetes..."
        
        # Apply Kubernetes manifests
        kubectl apply -f k8s/
        
        # Wait for deployment
        kubectl rollout status deployment/vibelux-app -n vibelux-production
        
        print_success "Kubernetes deployment completed"
    else
        print_warning "kubectl not found, skipping Kubernetes deployment"
    fi
}

# Setup database initialization scripts
setup_database_init() {
    print_status "Setting up database initialization scripts..."
    
    mkdir -p database/{init,mongo-init,influxdb-init}
    
    # PostgreSQL initialization
    cat > database/init/01-init.sql << 'EOF'
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_photo_reports_facility_created ON photo_reports(facility_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_history_user_timestamp ON location_history(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_harvest_batches_facility_status ON harvest_batches(facility_id, status);
CREATE INDEX IF NOT EXISTS idx_environmental_readings_zone_timestamp ON environmental_readings(zone_id, timestamp DESC);
EOF

    # MongoDB initialization
    cat > database/mongo-init/01-init.js << 'EOF'
// MongoDB initialization script
db = db.getSiblingDB('vibelux_docs');

// Create collections with validation
db.createCollection('ai_analysis', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['reportId', 'facilityId', 'analysisType', 'results'],
      properties: {
        reportId: { bsonType: 'string' },
        facilityId: { bsonType: 'string' },
        analysisType: { enum: ['pest_detection', 'quality_assessment', 'equipment_inspection'] },
        results: { bsonType: 'object' }
      }
    }
  }
});

// Create indexes
db.ai_analysis.createIndex({ reportId: 1 });
db.ai_analysis.createIndex({ facilityId: 1, timestamp: -1 });
db.pest_knowledge.createIndex({ commonName: 'text', scientificName: 'text', symptoms: 'text' });
EOF

    print_success "Database initialization scripts created"
}

# Health check function
health_check() {
    print_status "Performing health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost/health > /dev/null 2>&1; then
            print_success "Application is healthy and responding"
            return 0
        fi
        
        print_status "Waiting for application to be ready... (attempt $attempt/$max_attempts)"
        sleep 10
        attempt=$((attempt + 1))
    done
    
    print_error "Application health check failed after $max_attempts attempts"
    return 1
}

# Backup setup
setup_backup() {
    print_status "Setting up backup scripts..."
    
    mkdir -p scripts/backup
    
    cat > scripts/backup/backup.sh << 'EOF'
#!/bin/bash
# Automated backup script for Vibelux production data

BACKUP_DIR="/opt/vibelux/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# PostgreSQL backup
docker-compose exec -T postgres pg_dump -U vibelux vibelux_prod > "$BACKUP_DIR/postgres_$DATE.sql"

# MongoDB backup
docker-compose exec -T mongodb mongodump --db vibelux_docs --archive > "$BACKUP_DIR/mongodb_$DATE.archive"

# InfluxDB backup
docker-compose exec -T influxdb influx backup /tmp/backup_$DATE
docker cp $(docker-compose ps -q influxdb):/tmp/backup_$DATE "$BACKUP_DIR/influxdb_$DATE"

# Compress backups
tar -czf "$BACKUP_DIR/vibelux_backup_$DATE.tar.gz" -C "$BACKUP_DIR" postgres_$DATE.sql mongodb_$DATE.archive influxdb_$DATE

# Clean up individual files
rm -f "$BACKUP_DIR/postgres_$DATE.sql" "$BACKUP_DIR/mongodb_$DATE.archive"
rm -rf "$BACKUP_DIR/influxdb_$DATE"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "vibelux_backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: vibelux_backup_$DATE.tar.gz"
EOF

    chmod +x scripts/backup/backup.sh
    
    print_success "Backup scripts created"
}

# Main execution
main() {
    echo "🌱 Vibelux Visual Operations Platform - Production Setup"
    echo "=================================================="
    
    check_prerequisites
    generate_env_file
    setup_ssl
    setup_nginx
    setup_monitoring
    setup_database_init
    setup_backup
    
    echo ""
    echo "📋 Setup Options:"
    echo "1. Deploy with Docker Compose (recommended)"
    echo "2. Deploy to Kubernetes"
    echo "3. Both"
    echo ""
    read -p "Choose deployment option (1-3): " choice
    
    case $choice in
        1)
            deploy_docker
            ;;
        2)
            deploy_kubernetes
            ;;
        3)
            deploy_docker
            deploy_kubernetes
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    echo ""
    print_status "Performing health checks..."
    if health_check; then
        echo ""
        print_success "🎉 Vibelux Production Setup Completed Successfully!"
        echo ""
        echo "📊 Access URLs:"
        echo "   Application: https://${DOMAIN}"
        echo "   Monitoring: http://${DOMAIN}:3001 (Grafana)"
        echo "   Metrics: http://${DOMAIN}:9090 (Prometheus)"
        echo ""
        echo "🔧 Next Steps:"
        echo "   1. Update .env.production with your actual API keys"
        echo "   2. Replace self-signed certificates with trusted CA certificates"
        echo "   3. Configure domain DNS to point to your server"
        echo "   4. Set up automated backups with: crontab -e"
        echo "      Add: 0 2 * * * /path/to/scripts/backup/backup.sh"
        echo "   5. Configure monitoring alerts in Grafana"
        echo ""
    else
        print_error "Setup completed but health check failed. Please check the logs."
        echo "Debug with: docker-compose -f docker-compose.production.yml logs"
    fi
}

# Run main function
main "$@"