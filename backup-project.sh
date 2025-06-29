#!/bin/bash

# Vibelux App Backup Script
# Created: January 6, 2025

echo "🚀 Starting Vibelux App Backup..."
echo "================================="

# Set backup directory with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="vibelux_backup_$TIMESTAMP"

# Create backup directory
mkdir -p "../$BACKUP_DIR"

echo "📁 Creating backup in: ../$BACKUP_DIR"

# Core files to backup
echo "📄 Backing up configuration files..."
cp package.json "../$BACKUP_DIR/"
cp package-lock.json "../$BACKUP_DIR/" 2>/dev/null || echo "No package-lock.json found"
cp tsconfig.json "../$BACKUP_DIR/"
cp tailwind.config.ts "../$BACKUP_DIR/"
cp next.config.ts "../$BACKUP_DIR/"
cp .env.local "../$BACKUP_DIR/" 2>/dev/null || echo "⚠️  No .env.local found - remember to backup environment variables!"
cp BACKUP_MANIFEST.md "../$BACKUP_DIR/"

# Create directory structure
echo "📂 Creating directory structure..."
mkdir -p "../$BACKUP_DIR/src"
mkdir -p "../$BACKUP_DIR/public"

# Backup source code
echo "💾 Backing up source code..."
cp -r src/* "../$BACKUP_DIR/src/"

# Backup public assets
echo "🖼️  Backing up public assets..."
cp -r public/* "../$BACKUP_DIR/public/" 2>/dev/null || echo "No public files to backup"

# Create a quick restore script
echo "📝 Creating restore script..."
cat > "../$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash
echo "🔄 Restoring Vibelux App from backup..."
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in backup directory"
    echo "Please run this script from within the backup directory"
    exit 1
fi

# Ask for target directory
read -p "Enter target directory path (or press Enter for current directory): " TARGET_DIR
TARGET_DIR=${TARGET_DIR:-.}

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy all files
echo "📁 Copying files to $TARGET_DIR..."
cp -r ./* "$TARGET_DIR/"

echo "✅ Restore complete!"
echo ""
echo "Next steps:"
echo "1. cd $TARGET_DIR"
echo "2. Create .env.local with your environment variables"
echo "3. npm install"
echo "4. npm run dev"
EOF

chmod +x "../$BACKUP_DIR/restore.sh"

# Create environment template
echo "🔐 Creating environment template..."
cat > "../$BACKUP_DIR/.env.local.template" << 'EOF'
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Add other environment variables as needed
EOF

# Create README for the backup
echo "📖 Creating backup README..."
cat > "../$BACKUP_DIR/README.md" << EOF
# Vibelux App Backup
Created: $TIMESTAMP

## Quick Restore Instructions

1. **Restore files:**
   \`\`\`bash
   chmod +x restore.sh
   ./restore.sh
   \`\`\`

2. **Setup environment:**
   - Copy \`.env.local.template\` to \`.env.local\`
   - Fill in your API keys and secrets

3. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

4. **Run the application:**
   \`\`\`bash
   npm run dev
   \`\`\`

## What's Included

- All source code from \`/src\`
- Configuration files (package.json, tsconfig.json, etc.)
- Public assets
- Backup manifest with full project documentation

## Important Notes

- Remember to set up your environment variables
- Check BACKUP_MANIFEST.md for detailed project information
- Ensure Node.js 18+ is installed
EOF

# Create a compressed archive
echo "🗜️  Creating compressed archive..."
cd ..
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"

echo ""
echo "✅ Backup completed successfully!"
echo "================================="
echo "📁 Backup directory: ../$BACKUP_DIR"
echo "📦 Compressed archive: ../$BACKUP_DIR.tar.gz"
echo ""
echo "💡 Don't forget to:"
echo "   - Store your environment variables securely"
echo "   - Push changes to git: git add . && git commit -m 'Backup' && git push"
echo "   - Keep the compressed archive in a safe location"