import os

exclude_dirs = {'node_modules', '.next', 'dist', 'build', 'temp_disabled', '.git'}
extensions = {'.ts', '.tsx', '.js', '.jsx'}

total_lines = 0
total_files = 0
lines_by_ext = {}
files_by_ext = {}

for root, dirs, files in os.walk('.'):
    # Skip excluded directories
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    if any(exc in root for exc in exclude_dirs):
        continue
    
    for file in files:
        if any(file.endswith(ext) for ext in extensions):
            filepath = os.path.join(root, file)
            ext = os.path.splitext(file)[1]
            
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    line_count = sum(1 for line in f)
                    total_lines += line_count
                    total_files += 1
                    
                    lines_by_ext[ext] = lines_by_ext.get(ext, 0) + line_count
                    files_by_ext[ext] = files_by_ext.get(ext, 0) + 1
            except:
                pass

print("Vibelux Application Code Statistics:")
print("=" * 50)
for ext in sorted(extensions):
    if ext in files_by_ext:
        print(f"{ext}: {files_by_ext[ext]} files, {lines_by_ext[ext]:,} lines")
print("=" * 50)
print(f"Total: {total_files} files, {total_lines:,} lines")