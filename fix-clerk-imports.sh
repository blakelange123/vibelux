#!/bin/bash

# Fix auth imports in API routes
echo "Fixing Clerk auth imports in API routes..."

# Find all route.ts files in api directories that import from @clerk/nextjs
find src -path "*/api/*" -name "route.ts" | while read file; do
  if grep -q "from '@clerk/nextjs'" "$file"; then
    echo "Fixing: $file"
    # Replace the import
    sed -i '' "s/from '@clerk\/nextjs'/from '@clerk\/nextjs\/server'/g" "$file"
  fi
done

echo "Done fixing Clerk imports!"