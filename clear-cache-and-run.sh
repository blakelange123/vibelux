#\!/bin/bash
echo "🧹 Clearing Next.js cache and rebuilding..."

# Kill any running dev servers
echo "Stopping any running dev servers..."
pkill -f "next dev" || true

# Clear Next.js cache
echo "Clearing .next cache..."
rm -rf .next

# Clear node_modules cache (optional, uncomment if needed)
# rm -rf node_modules/.cache

# Start fresh dev server
echo "Starting development server..."
npm run dev
