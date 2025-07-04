#!/bin/bash
echo "Checking for potentially missing imports..."

grep -r "from '@/" src/app | grep -E "@/(hooks|contexts|lib|components|types|utils)" | cut -d: -f2 | grep -o "'@/[^']*'" | sort | uniq | while read import; do
    # Remove quotes and @ prefix
    path=$(echo $import | sed "s/'@/src/g" | sed "s/'//g")
    
    # Check if the file exists with various extensions
    if [ ! -e "$path.ts" ] && [ ! -e "$path.tsx" ] && [ ! -e "$path/index.ts" ] && [ ! -e "$path/index.tsx" ] && [ ! -e "$path" ]; then
        echo "Missing: $import"
    fi
done