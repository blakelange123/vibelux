#!/usr/bin/env python3
import os
import glob

# Initialize counters
file_counts = {'.ts': 0, '.tsx': 0, '.js': 0, '.jsx': 0}
line_counts = {'.ts': 0, '.tsx': 0, '.js': 0, '.jsx': 0}
total_files = 0
total_lines = 0

# Directories to exclude
exclude_dirs = ['node_modules', '.next', 'dist', 'build', 'temp_disabled', '.git']

# Walk through all files
for root, dirs, files in os.walk('.'):
    # Remove excluded directories from search
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    
    # Skip if path contains excluded directories
    if any(exc in root for exc in exclude_dirs):
        continue
    
    for file in files:
        ext = os.path.splitext(file)[1]
        if ext in file_counts:
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = len(f.readlines())
                    file_counts[ext] += 1
                    line_counts[ext] += lines
                    total_files += 1
                    total_lines += lines
            except Exception as e:
                pass

# Print results
print("EXACT COUNT FOR VIBELUX APPLICATION")
print("=" * 50)
print(f"\nTOTAL FILES: {total_files:,}")
print(f"TOTAL LINES OF CODE: {total_lines:,}")
print("\nBreakdown by file type:")
print("-" * 30)
for ext in ['.ts', '.tsx', '.js', '.jsx']:
    if file_counts[ext] > 0:
        print(f"{ext:5} | Files: {file_counts[ext]:6,} | Lines: {line_counts[ext]:10,}")