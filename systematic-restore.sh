#!/bin/bash
# Systematic VibeLux Restoration Script
# This will restore EVERYTHING from the backup

BACKUP_DIR="../vibelux-backup-extract/vibelux-app/src"
CURRENT_DIR="src"

echo "=== Systematic VibeLux Restoration ==="
echo "Starting at: $(date)"
echo ""

# Function to count files
count_files() {
    find "$1" -type f 2>/dev/null | wc -l | tr -d ' '
}

# Function to restore a directory
restore_directory() {
    local source="$1"
    local dest="$2"
    local name="$3"
    
    echo "Restoring $name..."
    
    if [ -d "$source" ]; then
        local source_count=$(count_files "$source")
        echo "  Source files: $source_count"
        
        # Create destination if it doesn't exist
        mkdir -p "$dest"
        
        # Use rsync for reliable copying with progress
        rsync -av --progress "$source/" "$dest/" 2>&1 | tail -5
        
        local dest_count=$(count_files "$dest")
        echo "  Restored files: $dest_count"
        
        if [ "$source_count" -eq "$dest_count" ]; then
            echo "  ✅ Restoration complete!"
        else
            echo "  ⚠️  Warning: File count mismatch (source: $source_count, dest: $dest_count)"
        fi
    else
        echo "  ❌ Source directory not found: $source"
    fi
    echo ""
}

# Check if backup exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Error: Backup directory not found at $BACKUP_DIR"
    exit 1
fi

# Show what we're about to restore
echo "=== Pre-restoration Summary ==="
echo "Backup location: $BACKUP_DIR"
echo "Total backup files: $(count_files "$BACKUP_DIR")"
echo ""

# Backup current state
echo "=== Creating safety backup of current state ==="
timestamp=$(date +%Y%m%d_%H%M%S)
tar -czf "src-pre-restore-$timestamp.tar.gz" src/
echo "✅ Current state backed up to: src-pre-restore-$timestamp.tar.gz"
echo ""

# Restore each directory
echo "=== Starting restoration ==="

# Restore app directory
restore_directory "$BACKUP_DIR/app" "$CURRENT_DIR/app" "app directory"

# Restore components
restore_directory "$BACKUP_DIR/components" "$CURRENT_DIR/components" "components"

# Restore lib
restore_directory "$BACKUP_DIR/lib" "$CURRENT_DIR/lib" "lib"

# Restore other directories
restore_directory "$BACKUP_DIR/hooks" "$CURRENT_DIR/hooks" "hooks"
restore_directory "$BACKUP_DIR/store" "$CURRENT_DIR/store" "store"
restore_directory "$BACKUP_DIR/types" "$CURRENT_DIR/types" "types"
restore_directory "$BACKUP_DIR/utils" "$CURRENT_DIR/utils" "utils"

# Restore root files
echo "Restoring root src files..."
cp "$BACKUP_DIR/middleware.ts" "$CURRENT_DIR/middleware.ts" 2>/dev/null && echo "  ✅ middleware.ts restored"

# Final summary
echo ""
echo "=== Restoration Complete ==="
echo "Total files restored: $(count_files "$CURRENT_DIR")"
echo "Backup files: $(count_files "$BACKUP_DIR")"
echo ""

# Verify critical directories
echo "=== Verification ==="
echo "API routes: $(find "$CURRENT_DIR/app/api" -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')"
echo "Pages: $(find "$CURRENT_DIR/app" -name "page.tsx" 2>/dev/null | wc -l | tr -d ' ')"
echo "Components: $(count_files "$CURRENT_DIR/components")"
echo "Lib files: $(count_files "$CURRENT_DIR/lib")"
echo ""

echo "Completed at: $(date)"
echo "✅ Restoration complete!"