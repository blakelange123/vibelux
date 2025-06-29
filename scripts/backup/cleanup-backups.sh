#!/bin/bash

# Backup cleanup script for VibeLux
set -e

echo "🧹 Starting backup cleanup..."

# Delete database backups older than 30 days
echo "🗑️ Cleaning up old database backups..."
aws s3 ls s3://$BACKUP_S3_BUCKET/database/ | while read -r line; do
    createDate=$(echo $line | awk '{print $1" "$2}')
    createDate=$(date -d "$createDate" +%s)
    olderThan=$(date -d "30 days ago" +%s)
    
    if [[ $createDate -lt $olderThan ]]; then
        fileName=$(echo $line | awk '{print $4}')
        if [[ -n $fileName ]]; then
            echo "Deleting old database backup: $fileName"
            aws s3 rm s3://$BACKUP_S3_BUCKET/database/$fileName
        fi
    fi
done

# Delete application backups older than 15 days
echo "🗑️ Cleaning up old application backups..."
aws s3 ls s3://$BACKUP_S3_BUCKET/application/ | while read -r line; do
    createDate=$(echo $line | awk '{print $1" "$2}')
    createDate=$(date -d "$createDate" +%s)
    olderThan=$(date -d "15 days ago" +%s)
    
    if [[ $createDate -lt $olderThan ]]; then
        fileName=$(echo $line | awk '{print $4}')
        if [[ -n $fileName ]]; then
            echo "Deleting old application backup: $fileName"
            aws s3 rm s3://$BACKUP_S3_BUCKET/application/$fileName
        fi
    fi
done

# Clean up local backup directory
echo "🧹 Cleaning up local backup files..."
find /backup/data -name "*.sql" -mtime +1 -delete
find /backup/data -name "*.tar.gz" -mtime +1 -delete
find /backup/data -name "*.enc" -mtime +1 -delete

echo "✅ Backup cleanup completed successfully"