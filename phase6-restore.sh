#!/bin/bash

# Phase 6: Comprehensive restoration script

echo "Starting Phase 6: Complete restoration of all remaining files..."

# Function to create directory if it doesn't exist
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo "Created directory: $1"
    fi
}

# Function to copy file with stub dependencies
copy_with_stubs() {
    src_file="$1"
    dest_file="$2"
    
    # Create destination directory
    dest_dir=$(dirname "$dest_file")
    create_dir "$dest_dir"
    
    # Copy the file
    cp "$src_file" "$dest_file"
    echo "Copied: $src_file -> $dest_file"
}

# 1. Copy all missing pages
echo "=== Copying missing pages ==="
while IFS= read -r file; do
    src_file="src-backup-app-full/${file#src/}"
    dest_file="$file"
    
    if [ -f "$src_file" ] && [ ! -f "$dest_file" ]; then
        copy_with_stubs "$src_file" "$dest_file"
    fi
done < <(find src-backup-app-full -type f -name "page.tsx" | sed 's|src-backup-app-full|src|g')

# 2. Copy all missing layouts
echo "=== Copying missing layouts ==="
while IFS= read -r file; do
    src_file="src-backup-app-full/${file#src/}"
    dest_file="$file"
    
    if [ -f "$src_file" ] && [ ! -f "$dest_file" ]; then
        copy_with_stubs "$src_file" "$dest_file"
    fi
done < <(find src-backup-app-full -type f -name "layout.tsx" | sed 's|src-backup-app-full|src|g')

# 3. Copy all missing API routes
echo "=== Copying missing API routes ==="
while IFS= read -r file; do
    src_file="src-backup-app-full/${file#src/}"
    dest_file="$file"
    
    if [ -f "$src_file" ] && [ ! -f "$dest_file" ]; then
        copy_with_stubs "$src_file" "$dest_file"
    fi
done < <(find src-backup-app-full/api -type f -name "route.ts" -o -name "route.tsx" | sed 's|src-backup-app-full|src|g')

# 4. Copy all missing components
echo "=== Copying missing components ==="
while IFS= read -r file; do
    src_file="src-backup-components-full/${file#src/}"
    dest_file="$file"
    
    if [ -f "$src_file" ] && [ ! -f "$dest_file" ]; then
        copy_with_stubs "$src_file" "$dest_file"
    fi
done < <(find src-backup-components-full -type f \( -name "*.tsx" -o -name "*.ts" \) | sed 's|src-backup-components-full|src|g')

# 5. Copy all missing lib files
echo "=== Copying missing lib files ==="
while IFS= read -r file; do
    src_file="src-backup-lib-full/${file#src/}"
    dest_file="$file"
    
    if [ -f "$src_file" ] && [ ! -f "$dest_file" ]; then
        copy_with_stubs "$src_file" "$dest_file"
    fi
done < <(find src-backup-lib-full -type f \( -name "*.ts" -o -name "*.tsx" \) | sed 's|src-backup-lib-full|src|g')

# 6. Copy hooks directory if it exists
if [ -d "src-backup-hooks-full" ]; then
    echo "=== Copying hooks ==="
    create_dir "src/hooks"
    find src-backup-hooks-full -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
        dest_file="src/hooks/$(basename "$file")"
        if [ ! -f "$dest_file" ]; then
            copy_with_stubs "$file" "$dest_file"
        fi
    done
fi

# 7. Copy contexts directory if it exists
if [ -d "src-backup-contexts-full" ]; then
    echo "=== Copying contexts ==="
    create_dir "src/contexts"
    find src-backup-contexts-full -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
        dest_file="src/contexts/$(basename "$file")"
        if [ ! -f "$dest_file" ]; then
            copy_with_stubs "$file" "$dest_file"
        fi
    done
fi

# 8. Copy types directory if it exists
if [ -d "src-backup-types-full" ]; then
    echo "=== Copying types ==="
    create_dir "src/types"
    find src-backup-types-full -type f \( -name "*.ts" -o -name "*.d.ts" \) | while read -r file; do
        dest_file="src/types/$(basename "$file")"
        if [ ! -f "$dest_file" ]; then
            copy_with_stubs "$file" "$dest_file"
        fi
    done
fi

# 9. Look for any other directories in backup that might need restoration
echo "=== Looking for other directories to restore ==="
for dir in src-backup-*; do
    if [ -d "$dir" ] && [[ ! "$dir" =~ (app|components|lib|hooks|contexts|types) ]]; then
        target_dir="src/${dir#src-backup-}"
        target_dir="${target_dir%-full}"
        
        if [ ! -d "$target_dir" ]; then
            echo "Found additional directory to restore: $dir -> $target_dir"
            create_dir "$target_dir"
            find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read -r file; do
                rel_path="${file#$dir/}"
                dest_file="$target_dir/$rel_path"
                dest_dir=$(dirname "$dest_file")
                create_dir "$dest_dir"
                if [ ! -f "$dest_file" ]; then
                    copy_with_stubs "$file" "$dest_file"
                fi
            done
        fi
    fi
done

echo "Phase 6 restoration complete!"

# Count statistics
echo "=== Restoration Statistics ==="
echo "Total pages: $(find src/app -name "page.tsx" | wc -l)"
echo "Total API routes: $(find src/app/api -name "route.ts" -o -name "route.tsx" | wc -l)"
echo "Total components: $(find src/components -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l)"
echo "Total lib files: $(find src/lib -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l)"