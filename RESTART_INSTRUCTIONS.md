# Next.js Server Restart Instructions

## The Issue
The Next.js development server is in a stale state after clearing the build cache. The browser is still connected to the old server instance.

## Steps to Fix

1. **In your terminal where Next.js is running:**
   - Press `Ctrl+C` to stop the server
   - Wait for it to fully stop

2. **Close all browser tabs** that are showing the error

3. **Start a fresh server:**
   ```bash
   npm run dev
   ```

4. **Wait for the server to fully start**
   - You should see: "Ready on http://localhost:3000"

5. **Open a new browser tab** and navigate to:
   ```
   http://localhost:3000/design/advanced
   ```

## Testing the Greenhouse Fix

Once the server is running:

1. Click "Room Configuration" or use the room tool
2. Create a room with dimensions:
   - Width: 30 ft
   - Length: 96 ft
   - Height: 14 ft

3. The 3D view should now show a detailed greenhouse structure with:
   - Glass-like transparent panels
   - Metal framework structure
   - Proper roof geometry
   - No black box

## If Issues Persist

Run these commands in order:
```bash
# 1. Stop any Node processes
pkill -f node

# 2. Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# 3. Install dependencies fresh
npm install

# 4. Start the dev server
npm run dev
```

## Summary of Greenhouse Improvements

✅ Automatic greenhouse detection for large rooms
✅ Proper structure type assignment (single-span/gutter-connect)
✅ Realistic glass material rendering
✅ Detailed structural framework
✅ Proper lighting and shadows
✅ No more black box appearance