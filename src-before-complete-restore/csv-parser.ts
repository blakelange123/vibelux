// Robust CSV parsing utilities for cultivation data

export interface ParseOptions {
  delimiter?: string;
  headers?: boolean;
  skipEmptyLines?: boolean;
  trim?: boolean;
  maxRows?: number;
}

export function parseCSV(content: string, options: ParseOptions = {}): any[] {
  const {
    delimiter = ',',
    headers = true,
    skipEmptyLines = true,
    trim = true,
    maxRows
  } = options;

  const lines = content.split(/\r?\n/);
  const result: any[] = [];
  let headerRow: string[] = [];

  // Parse each line
  for (let i = 0; i < lines.length; i++) {
    if (maxRows && result.length >= maxRows) break;
    
    const line = trim ? lines[i].trim() : lines[i];
    
    // Skip empty lines if requested
    if (skipEmptyLines && !line) continue;

    const values = parseCSVLine(line, delimiter);

    if (i === 0 && headers) {
      headerRow = values.map(v => trim ? v.trim() : v);
    } else {
      if (headers && headerRow.length > 0) {
        // Create object with headers as keys
        const obj: any = {};
        headerRow.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        result.push(obj);
      } else {
        // Return as array
        result.push(values);
      }
    }
  }

  return result;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current);
      current = '';
      i++;
      continue;
    }

    current += char;
    i++;
  }

  // Don't forget the last value
  values.push(current);

  return values;
}

// Auto-detect delimiter
export function detectDelimiter(content: string): string {
  const firstLine = content.split(/\r?\n/)[0];
  const delimiters = [',', ';', '\t', '|'];
  
  let maxCount = 0;
  let bestDelimiter = ',';

  for (const delimiter of delimiters) {
    const count = (firstLine.match(new RegExp(delimiter, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
}

// Validate CSV structure
export function validateCSV(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const lines = content.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    errors.push('CSV file is empty');
    return { valid: false, errors };
  }

  const delimiter = detectDelimiter(content);
  const headerCount = parseCSVLine(lines[0], delimiter).length;

  // Check consistency
  for (let i = 1; i < Math.min(lines.length, 10); i++) {
    const valueCount = parseCSVLine(lines[i], delimiter).length;
    if (valueCount !== headerCount) {
      errors.push(`Row ${i + 1} has ${valueCount} columns, expected ${headerCount}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}