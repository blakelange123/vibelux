#!/usr/bin/env python3
import os
import glob

def count_lines_in_file(filepath):
    """Count lines in a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            return len(f.readlines())
    except:
        return 0

def main():
    # Define file extensions to count
    extensions = ['ts', 'tsx', 'js', 'jsx']
    
    # Directories to exclude
    exclude_dirs = ['node_modules', '.next', 'dist', 'build', 'temp_disabled', '.git']
    
    # Counters
    total_lines = 0
    file_counts = {ext: 0 for ext in extensions}
    line_counts = {ext: 0 for ext in extensions}
    
    # Walk through directory
    for root, dirs, files in os.walk('.'):
        # Remove excluded directories from dirs to prevent walking into them
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        # Skip if current path contains excluded directories
        if any(exc_dir in root for exc_dir in exclude_dirs):
            continue
            
        for file in files:
            # Get file extension
            ext = file.split('.')[-1]
            if ext in extensions:
                filepath = os.path.join(root, file)
                lines = count_lines_in_file(filepath)
                
                file_counts[ext] += 1
                line_counts[ext] += lines
                total_lines += lines
    
    # Print results
    print("=== Vibelux Application Code Count ===\n")
    print("Breakdown by file type:")
    print("-" * 40)
    
    for ext in extensions:
        if file_counts[ext] > 0:
            print(f".{ext:4} files: {file_counts[ext]:5} | Lines: {line_counts[ext]:8,}")
    
    print("-" * 40)
    print(f"Total files: {sum(file_counts.values()):5} | Total lines: {total_lines:8,}")
    
    # Additional stats
    print("\n=== Directory Breakdown ===")
    main_dirs = ['src/app', 'src/components', 'src/lib', 'src/hooks', 'src/contexts', 'src/services']
    
    for dir_path in main_dirs:
        if os.path.exists(dir_path):
            dir_lines = 0
            dir_files = 0
            for root, dirs, files in os.walk(dir_path):
                dirs[:] = [d for d in dirs if d not in exclude_dirs]
                for file in files:
                    ext = file.split('.')[-1]
                    if ext in extensions:
                        filepath = os.path.join(root, file)
                        dir_lines += count_lines_in_file(filepath)
                        dir_files += 1
            if dir_files > 0:
                print(f"{dir_path:20} | Files: {dir_files:5} | Lines: {dir_lines:8,}")

if __name__ == "__main__":
    main()