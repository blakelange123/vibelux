#!/bin/bash
# Complete VibeLux Restoration from ALL backup sources
# This will restore EVERYTHING properly

echo "=== Complete VibeLux Platform Restoration ==="
echo "Starting at: $(date)"
echo ""

# Function to count files
count_files() {
    find "$1" -type f 2>/dev/null | wc -l | tr -d ' '
}

# Show what we have
echo "=== Backup Sources Found ==="
echo "1. src-backup-app-full: $(count_files src-backup-app-full) files"
echo "2. src-backup-components-full: $(count_files src-backup-components-full) files"
echo "3. src-backup-lib-full: $(count_files src-backup-lib-full) files"
echo "4. vibelux-backup-extract: $(count_files ../vibelux-backup-extract/vibelux-app/src) files"
echo ""
echo "Total backup files: $(( $(count_files src-backup-app-full) + $(count_files src-backup-components-full) + $(count_files src-backup-lib-full) )) files"
echo ""

# Create clean src directory
echo "=== Preparing for clean restoration ==="
echo "Creating backup of current mixed state..."
tar -czf "src-mixed-state-$(date +%Y%m%d_%H%M%S).tar.gz" src/
echo "✅ Current state backed up"
echo ""

# Remove current src to start fresh
echo "Removing current src directory for clean restoration..."
rm -rf src
mkdir -p src
echo "✅ Clean src directory created"
echo ""

# Restore from the main backup directories
echo "=== Starting restoration from main backups ==="
echo ""

# 1. Restore app directory
echo "1. Restoring app directory..."
if [ -d "src-backup-app-full" ]; then
    mkdir -p src/app
    cp -R src-backup-app-full/* src/app/ 2>/dev/null || true
    echo "   ✅ Restored $(count_files src/app) files to src/app"
else
    echo "   ❌ src-backup-app-full not found"
fi
echo ""

# 2. Restore components
echo "2. Restoring components..."
if [ -d "src-backup-components-full" ]; then
    mkdir -p src/components
    cp -R src-backup-components-full/* src/components/ 2>/dev/null || true
    echo "   ✅ Restored $(count_files src/components) files to src/components"
else
    echo "   ❌ src-backup-components-full not found"
fi
echo ""

# 3. Restore lib
echo "3. Restoring lib..."
if [ -d "src-backup-lib-full" ]; then
    mkdir -p src/lib
    cp -R src-backup-lib-full/* src/lib/ 2>/dev/null || true
    echo "   ✅ Restored $(count_files src/lib) files to src/lib"
else
    echo "   ❌ src-backup-lib-full not found"
fi
echo ""

# 4. Restore any missing items from vibelux-backup-extract
echo "4. Checking for additional files in vibelux-backup-extract..."
EXTRACT_DIR="../vibelux-backup-extract/vibelux-app/src"

if [ -d "$EXTRACT_DIR" ]; then
    # Copy any directories that don't exist yet
    for dir in hooks store types utils contexts; do
        if [ -d "$EXTRACT_DIR/$dir" ] && [ ! -d "src/$dir" ]; then
            echo "   Found $dir in extract backup, restoring..."
            cp -R "$EXTRACT_DIR/$dir" "src/$dir"
            echo "   ✅ Restored $dir ($(count_files src/$dir) files)"
        fi
    done
    
    # Copy root files
    if [ -f "$EXTRACT_DIR/middleware.ts" ] && [ ! -f "src/middleware.ts" ]; then
        cp "$EXTRACT_DIR/middleware.ts" "src/middleware.ts"
        echo "   ✅ Restored middleware.ts"
    fi
fi
echo ""

# Final summary
echo "=== Restoration Complete ==="
echo "Total files restored: $(count_files src)"
echo ""
echo "Breakdown:"
echo "- App pages/routes: $(count_files src/app)"
echo "- Components: $(count_files src/components)"
echo "- Library files: $(count_files src/lib)"
echo "- Hooks: $(count_files src/hooks)"
echo "- Store: $(count_files src/store)"
echo "- Types: $(count_files src/types)"
echo "- Utils: $(count_files src/utils)"
echo "- Contexts: $(count_files src/contexts)"
echo ""

# Verification
echo "=== Verification ==="
echo "API endpoints: $(find src/app/api -name "route.ts" -o -name "route.tsx" 2>/dev/null | wc -l | tr -d ' ')"
echo "Pages: $(find src/app -name "page.tsx" 2>/dev/null | wc -l | tr -d ' ')"
echo "Layout files: $(find src/app -name "layout.tsx" 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# Check for any files we might have missed
echo "=== Checking for missing files ==="
total_backup=$(( $(count_files src-backup-app-full) + $(count_files src-backup-components-full) + $(count_files src-backup-lib-full) ))
total_restored=$(count_files src)

if [ $total_restored -lt $total_backup ]; then
    echo "⚠️  Warning: Restored $total_restored files but backups contain $total_backup files"
    echo "   Missing: $(( $total_backup - $total_restored )) files"
else
    echo "✅ All files restored successfully!"
fi

echo ""
echo "Completed at: $(date)"
echo ""
echo "Next steps:"
echo "1. Run 'npm install' to ensure all dependencies are installed"
echo "2. Run 'npm run build' to check for any build errors"
echo "3. Fix any missing imports or dependencies"
echo "4. Deploy to Vercel"