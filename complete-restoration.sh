#!/bin/bash

# Complete VibeLux Platform Restoration Script
# This ensures we capture EVERYTHING from backups

echo "=== Complete VibeLux Restoration Script ==="
echo "Starting at: $(date)"

# Create backup of current state
echo "1. Creating backup of current state..."
cp -r src src-before-complete-restore

# Count files in backups
echo -e "\n2. Counting backup files..."
BACKUP_APP_COUNT=$(find src-backup-app-full -type f 2>/dev/null | wc -l)
BACKUP_COMP_COUNT=$(find src-backup-components-full -type f 2>/dev/null | wc -l)
BACKUP_LIB_COUNT=$(find src-backup-lib-full -type f 2>/dev/null | wc -l)
BACKUP_PRISMA_COUNT=$(find prisma.backup -type f 2>/dev/null | wc -l)

echo "Backup files to restore:"
echo "  - App: $BACKUP_APP_COUNT files"
echo "  - Components: $BACKUP_COMP_COUNT files"
echo "  - Lib: $BACKUP_LIB_COUNT files"
echo "  - Prisma: $BACKUP_PRISMA_COUNT files"
echo "  - Total: $((BACKUP_APP_COUNT + BACKUP_COMP_COUNT + BACKUP_LIB_COUNT + BACKUP_PRISMA_COUNT)) files"

# Restore app directory
echo -e "\n3. Restoring app directory..."
echo "Copying src-backup-app-full/* to src/app/"
cp -r src-backup-app-full/* src/app/ 2>/dev/null || true
APP_RESTORED=$(find src/app -type f | wc -l)
echo "Restored: $APP_RESTORED files"

# Restore components
echo -e "\n4. Restoring components directory..."
echo "Copying src-backup-components-full/* to src/components/"
# First, move any misplaced components
find src -name "*.tsx" -path "*/components/*" ! -path "*/src/components/*" -exec mv {} src/components/ \; 2>/dev/null || true
# Then copy from backup
cp -r src-backup-components-full/* src/components/ 2>/dev/null || true
COMP_RESTORED=$(find src/components -type f | wc -l)
echo "Restored: $COMP_RESTORED files"

# Restore lib directory
echo -e "\n5. Restoring lib directory..."
echo "Copying src-backup-lib-full/* to src/lib/"
cp -r src-backup-lib-full/* src/lib/ 2>/dev/null || true
LIB_RESTORED=$(find src/lib -type f | wc -l)
echo "Restored: $LIB_RESTORED files"

# Restore Prisma files
echo -e "\n6. Restoring Prisma configuration..."
if [ -d "prisma.backup" ]; then
    cp -r prisma.backup/* prisma/ 2>/dev/null || true
    PRISMA_RESTORED=$(find prisma -type f | wc -l)
    echo "Restored: $PRISMA_RESTORED files"
fi

# Find and report missing files
echo -e "\n7. Checking for missing files..."
echo "Files only in backup (sample):"
diff -rq src-backup-app-full src/app 2>/dev/null | grep "Only in src-backup" | head -10 || true

# Create restoration report
echo -e "\n=== Restoration Report ==="
echo "App: $APP_RESTORED / $BACKUP_APP_COUNT ($(( APP_RESTORED * 100 / BACKUP_APP_COUNT ))%)"
echo "Components: $COMP_RESTORED / $BACKUP_COMP_COUNT ($(( COMP_RESTORED * 100 / BACKUP_COMP_COUNT ))%)"
echo "Lib: $LIB_RESTORED / $BACKUP_LIB_COUNT ($(( LIB_RESTORED * 100 / BACKUP_LIB_COUNT ))%)"
if [ -d "prisma.backup" ]; then
    echo "Prisma: $PRISMA_RESTORED / $BACKUP_PRISMA_COUNT ($(( PRISMA_RESTORED * 100 / BACKUP_PRISMA_COUNT ))%)"
fi

TOTAL_BACKUP=$((BACKUP_APP_COUNT + BACKUP_COMP_COUNT + BACKUP_LIB_COUNT + BACKUP_PRISMA_COUNT))
TOTAL_RESTORED=$((APP_RESTORED + COMP_RESTORED + LIB_RESTORED + ${PRISMA_RESTORED:-0}))
echo -e "\nTotal: $TOTAL_RESTORED / $TOTAL_BACKUP ($(( TOTAL_RESTORED * 100 / TOTAL_BACKUP ))%)"

echo -e "\nCompleted at: $(date)"