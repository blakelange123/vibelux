#!/bin/bash

echo "Starting component restoration..."

# Copy all root level components
echo "Copying root level components..."
find src-backup-components-full -maxdepth 1 -name "*.tsx" -type f | while read file; do
    filename=$(basename "$file")
    if [ ! -f "src/components/$filename" ]; then
        echo "Copying component: $filename"
        cp "$file" "src/components/"
    fi
done

# Copy component subdirectories
comp_dirs=(
    "admin"
    "affiliates"
    "ai"
    "alerts"
    "analytics"
    "architecture"
    "auth"
    "automation"
    "benchmarks"
    "biotechnology"
    "bms"
    "business"
    "collaboration"
    "common"
    "config"
    "controls"
    "cultivation"
    "dashboard"
    "demo"
    "design"
    "designer"
    "diagrams"
    "digital-twin"
    "disease"
    "energy"
    "enterprise"
    "equipment"
    "examples"
    "facility"
    "farm"
    "finance"
    "fixtures"
    "food-safety"
    "forms"
    "harvest"
    "hmi"
    "home"
    "insurance"
    "integration"
    "integrations"
    "intelligence"
    "investment"
    "maintenance"
    "manufacturer"
    "market-data"
    "marketplace"
    "mobile"
    "monitoring"
    "operations"
    "packaging"
    "plant-monitoring"
    "pricing"
    "production"
    "purchasing"
    "recipes"
    "reports"
    "revenue-sharing"
    "scouting"
    "sensors"
    "service"
    "settings"
    "shared"
    "simulation"
    "supply-chain"
    "sustainability"
    "timelapse"
    "tracking"
    "training"
    "ui"
    "unified"
    "visual-ops"
    "water"
)

# Copy each component directory
for dir in "${comp_dirs[@]}"; do
    if [ -d "src-backup-components-full/$dir" ]; then
        echo "Copying component directory: $dir..."
        mkdir -p "src/components/$dir"
        cp -r "src-backup-components-full/$dir"/* "src/components/$dir/" 2>/dev/null || true
    fi
done

# Copy special files
echo "Copying special component files..."
cp src-backup-components-full/index.ts src/components/ 2>/dev/null || true
cp src-backup-components-full/platform-data-share.tsx src/components/ 2>/dev/null || true
cp src-backup-components-full/weather-normalization-widget.tsx src/components/ 2>/dev/null || true

echo "Component restoration complete!"