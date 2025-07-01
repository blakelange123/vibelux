#!/usr/bin/env python3
import os
import glob

def count_lines_and_files():
    extensions = ['*.ts', '*.tsx', '*.js', '*.jsx']
    total_lines = 0
    total_files = 0
    file_details = []
    
    for ext in extensions:
        for filepath in glob.glob(f'**/{ext}', recursive=True):
            # Skip node_modules and .next directories
            if 'node_modules' in filepath or '.next' in filepath:
                continue
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = len(f.readlines())
                    total_lines += lines
                    total_files += 1
                    file_details.append((filepath, lines))
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
    
    # Sort by line count descending
    file_details.sort(key=lambda x: x[1], reverse=True)
    
    print(f"Total files: {total_files}")
    print(f"Total lines of code: {total_lines}")
    print("\nTop 10 largest files:")
    for filepath, lines in file_details[:10]:
        print(f"  {lines:,} lines - {filepath}")
    
    # Count by extension
    ext_counts = {}
    ext_lines = {}
    for filepath, lines in file_details:
        ext = os.path.splitext(filepath)[1]
        ext_counts[ext] = ext_counts.get(ext, 0) + 1
        ext_lines[ext] = ext_lines.get(ext, 0) + lines
    
    print("\nBreakdown by file type:")
    for ext in sorted(ext_counts.keys()):
        print(f"  {ext}: {ext_counts[ext]} files, {ext_lines[ext]:,} lines")

if __name__ == "__main__":
    count_lines_and_files()