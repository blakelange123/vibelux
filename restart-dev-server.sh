#!/bin/bash

# Script to cleanly restart Next.js development server after cache clearing

echo "🔄 Restarting Next.js development server..."
echo ""

# Kill any existing Next.js processes
echo "📍 Stopping any running Next.js processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Clear additional caches
echo "🧹 Clearing additional caches..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next 2>/dev/null || true

echo ""
echo "✅ Cache cleared successfully!"
echo ""
echo "📝 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "The greenhouse 3D rendering improvements are ready and will work once the server is restarted."