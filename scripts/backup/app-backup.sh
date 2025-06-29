#!/bin/bash

# Application backup script for VibeLux
set -e

echo "🔄 Starting application backup..."

# Get timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="vibelux_app_${TIMESTAMP}.tar.gz"
ENCRYPTED_FILE="${BACKUP_FILE}.enc"

# Create backup directory
mkdir -p /backup/data

# Create application backup (exclude node_modules and build artifacts)
echo "📦 Creating application backup..."
tar -czf /backup/data/$BACKUP_FILE \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='logs' \
    --exclude='*.log' \
    /app

# Encrypt the backup
echo "🔒 Encrypting backup..."
openssl enc -aes-256-cbc -salt -in /backup/data/$BACKUP_FILE -out /backup/data/$ENCRYPTED_FILE -k $BACKUP_ENCRYPTION_KEY

# Upload to S3
echo "☁️ Uploading to S3..."
aws s3 cp /backup/data/$ENCRYPTED_FILE s3://$BACKUP_S3_BUCKET/application/ --storage-class STANDARD_IA

# Verify upload
if aws s3 ls s3://$BACKUP_S3_BUCKET/application/$ENCRYPTED_FILE > /dev/null 2>&1; then
    echo "✅ Application backup uploaded successfully: $ENCRYPTED_FILE"
    
    # Clean up local files
    rm -f /backup/data/$BACKUP_FILE /backup/data/$ENCRYPTED_FILE
    
    # Update backup metadata
    echo "{\"timestamp\": \"$TIMESTAMP\", \"file\": \"$ENCRYPTED_FILE\", \"type\": \"application\", \"size\": \"$(aws s3 ls s3://$BACKUP_S3_BUCKET/application/$ENCRYPTED_FILE --summarize --human-readable | grep 'Total Size' | awk '{print $3 $4}')\"}" > /backup/data/last_app_backup.json
    
else
    echo "❌ Application backup upload failed"
    exit 1
fi

echo "✅ Application backup completed successfully"