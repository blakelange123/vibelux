#!/bin/bash

# Database backup script for VibeLux
set -e

echo "🔄 Starting database backup..."

# Get timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="vibelux_db_${TIMESTAMP}.sql"
ENCRYPTED_FILE="${BACKUP_FILE}.enc"

# Create backup directory
mkdir -p /backup/data

# Perform database dump
echo "📦 Creating database dump..."
pg_dump $DATABASE_URL > /backup/data/$BACKUP_FILE

# Compress the backup
echo "🗜️ Compressing backup..."
gzip /backup/data/$BACKUP_FILE
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Encrypt the backup
echo "🔒 Encrypting backup..."
openssl enc -aes-256-cbc -salt -in /backup/data/$COMPRESSED_FILE -out /backup/data/$ENCRYPTED_FILE -k $BACKUP_ENCRYPTION_KEY

# Upload to S3
echo "☁️ Uploading to S3..."
aws s3 cp /backup/data/$ENCRYPTED_FILE s3://$BACKUP_S3_BUCKET/database/ --storage-class STANDARD_IA

# Verify upload
if aws s3 ls s3://$BACKUP_S3_BUCKET/database/$ENCRYPTED_FILE > /dev/null 2>&1; then
    echo "✅ Database backup uploaded successfully: $ENCRYPTED_FILE"
    
    # Clean up local files
    rm -f /backup/data/$COMPRESSED_FILE /backup/data/$ENCRYPTED_FILE
    
    # Update backup metadata
    echo "{\"timestamp\": \"$TIMESTAMP\", \"file\": \"$ENCRYPTED_FILE\", \"type\": \"database\", \"size\": \"$(aws s3 ls s3://$BACKUP_S3_BUCKET/database/$ENCRYPTED_FILE --summarize --human-readable | grep 'Total Size' | awk '{print $3 $4}')\"}" > /backup/data/last_db_backup.json
    
else
    echo "❌ Database backup upload failed"
    exit 1
fi

echo "✅ Database backup completed successfully"