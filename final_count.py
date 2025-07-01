import os
import json

def count_lines_and_files(directory):
    extensions = ['.ts', '.tsx', '.js', '.jsx']
    exclude_dirs = {'node_modules', '.next', 'dist', 'build', 'temp_disabled', '.git'}
    
    results = {
        'total_files': 0,
        'total_lines': 0,
        'by_extension': {},
        'by_directory': {},
        'largest_files': []
    }
    
    file_data = []
    
    for root, dirs, files in os.walk(directory):
        # Remove excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        # Skip if path contains excluded directories
        if any(exc in root for exc in exclude_dirs):
            continue
        
        relative_dir = root.replace(directory, '').lstrip('/')
        if not relative_dir:
            relative_dir = 'root'
            
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                filepath = os.path.join(root, file)
                ext = os.path.splitext(file)[1]
                
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = len(f.readlines())
                        
                    results['total_files'] += 1
                    results['total_lines'] += lines
                    
                    # Track by extension
                    if ext not in results['by_extension']:
                        results['by_extension'][ext] = {'files': 0, 'lines': 0}
                    results['by_extension'][ext]['files'] += 1
                    results['by_extension'][ext]['lines'] += lines
                    
                    # Track by directory
                    dir_key = relative_dir.split('/')[0] if '/' in relative_dir else relative_dir
                    if dir_key not in results['by_directory']:
                        results['by_directory'][dir_key] = {'files': 0, 'lines': 0}
                    results['by_directory'][dir_key]['files'] += 1
                    results['by_directory'][dir_key]['lines'] += lines
                    
                    # Track largest files
                    file_data.append({
                        'path': filepath.replace(directory, ''),
                        'lines': lines,
                        'extension': ext
                    })
                    
                except:
                    pass
    
    # Get top 10 largest files
    file_data.sort(key=lambda x: x['lines'], reverse=True)
    results['largest_files'] = file_data[:10]
    
    return results

# Run the count
results = count_lines_and_files('.')

# Output results
print("VIBELUX APPLICATION CODE STATISTICS")
print("=" * 60)
print(f"\nTOTAL FILES: {results['total_files']:,}")
print(f"TOTAL LINES OF CODE: {results['total_lines']:,}")

print("\n\nBREAKDOWN BY FILE TYPE:")
print("-" * 40)
for ext, data in sorted(results['by_extension'].items()):
    print(f"{ext:5} files: {data['files']:6,} | Lines: {data['lines']:10,}")

print("\n\nBREAKDOWN BY DIRECTORY:")
print("-" * 40)
for dir_name, data in sorted(results['by_directory'].items(), key=lambda x: x[1]['lines'], reverse=True)[:15]:
    print(f"{dir_name:20} | Files: {data['files']:6,} | Lines: {data['lines']:10,}")

print("\n\nLARGEST FILES:")
print("-" * 60)
for file_info in results['largest_files']:
    print(f"{file_info['lines']:6,} lines | {file_info['path']}")

# Save detailed results
with open('code_statistics.json', 'w') as f:
    json.dump(results, f, indent=2)
    
print("\n\nDetailed results saved to code_statistics.json")