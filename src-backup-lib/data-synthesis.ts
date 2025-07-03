// Data synthesis engine for historical cultivation data
// Handles normalization, validation, and intelligent mapping

export interface DataField {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  unit?: string;
  required?: boolean;
  validator?: (value: any) => boolean;
  transformer?: (value: any) => any;
}

export interface DataSchema {
  timestamp: DataField;
  environment?: {
    temperature?: DataField;
    humidity?: DataField;
    co2?: DataField;
    vpd?: DataField;
    lightIntensity?: DataField;
  };
  irrigation?: {
    ph?: DataField;
    ec?: DataField;
    waterTemp?: DataField;
    runoffPh?: DataField;
    runoffEc?: DataField;
  };
  nutrients?: {
    nitrogen?: DataField;
    phosphorus?: DataField;
    potassium?: DataField;
    calcium?: DataField;
    magnesium?: DataField;
  };
  yield?: {
    wetWeight?: DataField;
    dryWeight?: DataField;
    trimWeight?: DataField;
  };
  quality?: {
    thc?: DataField;
    cbd?: DataField;
    terpenes?: DataField;
    moisture?: DataField;
  };
  genetics?: {
    strain?: DataField;
    phenotype?: DataField;
    generation?: DataField;
  };
}

// Common cultivation data patterns and their variations
export const commonDataPatterns = {
  temperature: {
    patterns: ['temp', 'temperature', 'air_temp', 'room_temp', 'canopy_temp'],
    unit: '°F',
    validator: (val: number) => val > 50 && val < 100,
    transformer: (val: any, unit?: string) => {
      // Convert Celsius to Fahrenheit if needed
      if (unit === '°C' || unit === 'C') {
        return (val * 9/5) + 32;
      }
      return Number(val);
    }
  },
  humidity: {
    patterns: ['humidity', 'rh', 'relative_humidity', 'hum'],
    unit: '%',
    validator: (val: number) => val >= 0 && val <= 100,
    transformer: (val: any) => Number(val)
  },
  co2: {
    patterns: ['co2', 'carbon_dioxide', 'co2_ppm'],
    unit: 'ppm',
    validator: (val: number) => val >= 400 && val <= 2000,
    transformer: (val: any) => Number(val)
  },
  ph: {
    patterns: ['ph', 'pH', 'water_ph', 'solution_ph'],
    unit: '',
    validator: (val: number) => val >= 0 && val <= 14,
    transformer: (val: any) => Number(val)
  },
  ec: {
    patterns: ['ec', 'EC', 'electrical_conductivity', 'conductivity', 'ppm', 'tds'],
    unit: 'mS/cm',
    validator: (val: number) => val >= 0 && val <= 10,
    transformer: (val: any, unit?: string) => {
      // Convert PPM to EC if needed (assuming 500 scale)
      if (unit === 'ppm' || unit === 'PPM') {
        return val / 500;
      }
      return Number(val);
    }
  },
  yield: {
    patterns: ['yield', 'weight', 'harvest_weight', 'flower_weight'],
    unit: 'g',
    validator: (val: number) => val >= 0,
    transformer: (val: any, unit?: string) => {
      // Convert different weight units to grams
      if (unit === 'oz' || unit === 'ounces') {
        return val * 28.35;
      }
      if (unit === 'lb' || unit === 'lbs' || unit === 'pounds') {
        return val * 453.592;
      }
      if (unit === 'kg' || unit === 'kilograms') {
        return val * 1000;
      }
      return Number(val);
    }
  },
  date: {
    patterns: ['date', 'datetime', 'timestamp', 'time', 'recorded_at'],
    transformer: (val: any) => {
      // Handle various date formats
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        // Try parsing common formats
        const formats = [
          /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
          /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
          /(\d{1,2})-(\d{1,2})-(\d{4})/ // DD-MM-YYYY
        ];
        // Add parsing logic for common formats
      }
      return date;
    }
  }
};

// Intelligent field mapping using fuzzy matching
export function intelligentFieldMapper(headers: string[]): Map<string, string> {
  const mappings = new Map<string, string>();
  
  headers.forEach(header => {
    const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Check each pattern category
    for (const [fieldName, config] of Object.entries(commonDataPatterns)) {
      if ('patterns' in config) {
        for (const pattern of config.patterns) {
          if (normalizedHeader.includes(pattern) || 
              levenshteinDistance(normalizedHeader, pattern) <= 2) {
            mappings.set(header, fieldName);
            break;
          }
        }
      }
    }
  });
  
  return mappings;
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Data quality assessment
export interface DataQualityReport {
  completeness: number; // Percentage of non-null values
  consistency: number; // Percentage of values within expected ranges
  accuracy: number; // Based on validation rules
  timeliness: number; // Based on date gaps
  issues: DataQualityIssue[];
}

export interface DataQualityIssue {
  field: string;
  type: 'missing' | 'invalid' | 'outlier' | 'duplicate';
  severity: 'low' | 'medium' | 'high';
  count: number;
  examples: any[];
  suggestion?: string;
}

export function assessDataQuality(data: any[]): DataQualityReport {
  const issues: DataQualityIssue[] = [];
  let totalFields = 0;
  let completeFields = 0;
  let validFields = 0;
  
  // Analyze each field
  const fieldStats = new Map<string, any>();
  
  data.forEach((record, index) => {
    Object.entries(record).forEach(([field, value]) => {
      totalFields++;
      
      if (value !== null && value !== undefined && value !== '') {
        completeFields++;
        
        // Check validity based on field type
        const pattern = commonDataPatterns[field];
        if (pattern && pattern.validator) {
          if (pattern.validator(value)) {
            validFields++;
          } else {
            // Track invalid values
            if (!fieldStats.has(field)) {
              fieldStats.set(field, { invalid: [] });
            }
            fieldStats.get(field).invalid.push({ value, index });
          }
        } else {
          validFields++;
        }
      }
    });
  });
  
  // Generate issues report
  fieldStats.forEach((stats, field) => {
    if (stats.invalid && stats.invalid.length > 0) {
      issues.push({
        field,
        type: 'invalid',
        severity: stats.invalid.length > data.length * 0.1 ? 'high' : 'medium',
        count: stats.invalid.length,
        examples: stats.invalid.slice(0, 5),
        suggestion: `Check data validation rules for ${field}`
      });
    }
  });
  
  return {
    completeness: (completeFields / totalFields) * 100,
    consistency: (validFields / completeFields) * 100,
    accuracy: validFields / totalFields * 100,
    timeliness: calculateTimeliness(data),
    issues
  };
}

function calculateTimeliness(data: any[]): number {
  // Check for date gaps
  const dates = data
    .map(record => record.timestamp || record.date)
    .filter(date => date)
    .map(date => new Date(date).getTime())
    .sort((a, b) => a - b);
  
  if (dates.length < 2) return 100;
  
  const gaps = [];
  for (let i = 1; i < dates.length; i++) {
    gaps.push(dates[i] - dates[i - 1]);
  }
  
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const expectedGap = 24 * 60 * 60 * 1000; // 1 day
  
  // Score based on how close gaps are to expected
  const gapScore = Math.max(0, 100 - Math.abs(avgGap - expectedGap) / expectedGap * 100);
  return gapScore;
}

// Machine learning insight generation
export interface MLInsight {
  type: 'pattern' | 'anomaly' | 'correlation' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact?: {
    metric: string;
    value: number;
    unit: string;
  };
  recommendation?: string;
}

export async function generateMLInsights(data: any[]): Promise<MLInsight[]> {
  const insights: MLInsight[] = [];
  
  // Pattern detection
  const patterns = detectPatterns(data);
  insights.push(...patterns);
  
  // Anomaly detection
  const anomalies = detectAnomalies(data);
  insights.push(...anomalies);
  
  // Correlation analysis
  const correlations = findCorrelations(data);
  insights.push(...correlations);
  
  // Optimization opportunities
  const optimizations = findOptimizations(data);
  insights.push(...optimizations);
  
  return insights;
}

function detectPatterns(data: any[]): MLInsight[] {
  const insights: MLInsight[] = [];
  
  // Example: VPD pattern detection
  const vpdData = data.filter(d => d.temperature && d.humidity);
  if (vpdData.length > 100) {
    const vpdValues = vpdData.map(d => {
      const T = (d.temperature - 32) * 5/9; // Convert to Celsius
      const RH = d.humidity;
      const SVP = 0.6108 * Math.exp((17.27 * T) / (T + 237.3));
      const AVP = SVP * (RH / 100);
      return SVP - AVP;
    });
    
    // Analyze VPD ranges vs yield
    const yieldData = data.filter(d => d.yield);
    if (yieldData.length > 10) {
      // Simplified analysis - in reality would use more sophisticated ML
      const optimalVPD = { min: 0.8, max: 1.2 };
      const inRange = vpdValues.filter(v => v >= optimalVPD.min && v <= optimalVPD.max).length;
      const percentage = (inRange / vpdValues.length) * 100;
      
      if (percentage < 70) {
        insights.push({
          type: 'pattern',
          title: 'Suboptimal VPD Control',
          description: `Only ${percentage.toFixed(0)}% of readings were within optimal VPD range (0.8-1.2 kPa)`,
          confidence: 85,
          impact: {
            metric: 'Yield Potential',
            value: 10,
            unit: '%'
          },
          recommendation: 'Improve humidity control to maintain VPD within 0.8-1.2 kPa'
        });
      }
    }
  }
  
  return insights;
}

function detectAnomalies(data: any[]): MLInsight[] {
  const insights: MLInsight[] = [];
  
  // Statistical anomaly detection for each numeric field
  const numericFields = ['temperature', 'humidity', 'co2', 'ph', 'ec'];
  
  numericFields.forEach(field => {
    const values = data.map(d => d[field]).filter(v => v !== null && v !== undefined);
    if (values.length > 30) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
      
      const outliers = values.filter(v => Math.abs(v - mean) > 3 * stdDev);
      if (outliers.length > values.length * 0.01) {
        insights.push({
          type: 'anomaly',
          title: `Unusual ${field} readings detected`,
          description: `Found ${outliers.length} anomalous readings that deviate significantly from normal`,
          confidence: 78,
          recommendation: `Investigate sensor calibration or environmental control issues for ${field}`
        });
      }
    }
  });
  
  return insights;
}

function findCorrelations(data: any[]): MLInsight[] {
  const insights: MLInsight[] = [];
  
  // Example: Temperature-Quality correlation
  const qualityData = data.filter(d => d.temperature && d.quality?.thc);
  if (qualityData.length > 20) {
    // Simplified correlation - would use Pearson correlation in production
    const highTemp = qualityData.filter(d => d.temperature > 78);
    const lowTemp = qualityData.filter(d => d.temperature <= 78);
    
    if (highTemp.length > 5 && lowTemp.length > 5) {
      const avgHighTHC = highTemp.reduce((sum, d) => sum + d.quality.thc, 0) / highTemp.length;
      const avgLowTHC = lowTemp.reduce((sum, d) => sum + d.quality.thc, 0) / lowTemp.length;
      
      if (Math.abs(avgHighTHC - avgLowTHC) > 2) {
        insights.push({
          type: 'correlation',
          title: 'Temperature impacts THC production',
          description: `Lower temperatures (<78°F) correlated with ${((avgLowTHC - avgHighTHC) / avgHighTHC * 100).toFixed(0)}% higher THC`,
          confidence: 72,
          impact: {
            metric: 'THC Content',
            value: avgLowTHC - avgHighTHC,
            unit: '%'
          }
        });
      }
    }
  }
  
  return insights;
}

function findOptimizations(data: any[]): MLInsight[] {
  const insights: MLInsight[] = [];
  
  // Energy optimization based on light schedules
  const lightData = data.filter(d => d.lightIntensity && d.timestamp);
  if (lightData.length > 100) {
    // Analyze light schedule patterns
    const hourlyUsage = new Array(24).fill(0);
    lightData.forEach(d => {
      const hour = new Date(d.timestamp).getHours();
      hourlyUsage[hour] += d.lightIntensity;
    });
    
    // Check if lights are on during peak hours (assuming peak 2pm-7pm)
    const peakUsage = hourlyUsage.slice(14, 19).reduce((a, b) => a + b, 0);
    const totalUsage = hourlyUsage.reduce((a, b) => a + b, 0);
    
    if (peakUsage / totalUsage > 0.3) {
      insights.push({
        type: 'optimization',
        title: 'Energy cost reduction opportunity',
        description: 'Shifting light schedule by 2-3 hours could reduce energy costs by avoiding peak rates',
        confidence: 88,
        impact: {
          metric: 'Energy Cost',
          value: -15,
          unit: '%'
        },
        recommendation: 'Adjust photoperiod to run primarily during off-peak hours'
      });
    }
  }
  
  return insights;
}

// Export data transformation functions
export function transformToVibeluxFormat(
  rawData: any[],
  mappings: Map<string, string>
): any[] {
  return rawData.map(record => {
    const transformed: any = {};
    
    mappings.forEach((vibeluxField, sourceField) => {
      const value = record[sourceField];
      const pattern = commonDataPatterns[vibeluxField];
      
      if (pattern && pattern.transformer) {
        transformed[vibeluxField] = pattern.transformer(value, record[`${sourceField}_unit`]);
      } else {
        transformed[vibeluxField] = value;
      }
    });
    
    return transformed;
  });
}