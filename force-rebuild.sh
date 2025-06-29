#\!/bin/bash
echo "🔄 Force rebuilding Vibelux app..."

# Kill any running Next.js processes
echo "Stopping all Next.js processes..."
pkill -f "next" || true

# Clear all caches
echo "Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache

# Clear browser cache hint
echo "📌 Remember to clear your browser cache too\!"
echo "   Chrome/Edge: Cmd+Shift+R (Mac) or Ctrl+Shift+R (PC)"

# Start fresh
echo "Starting fresh development server..."
npm run dev -- -p 3002
