#!/bin/bash

echo "🚀 Testing database connection and deploying schema..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set. Please set it first:"
    echo "export DATABASE_URL='your_neon_connection_string'"
    exit 1
fi

echo "✅ DATABASE_URL is set"

# Test connection
echo "Testing Prisma connection..."
npx prisma db pull --force --preview-feature

# Deploy schema
echo "Deploying schema to Neon..."
npx prisma db push --accept-data-loss

# Generate client
echo "Generating Prisma client..."
npx prisma generate

echo "✅ Database setup complete!"
echo "Now push to git to deploy: git push"