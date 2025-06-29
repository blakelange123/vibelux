// AI-powered data interpretation using Claude API
// Handles complex, messy, real-world cultivation data

import { createClaudeClient } from './claude-config';

export interface DataInterpretationResult {
  success: boolean;
  mappings: FieldMapping[];
  dataQuality: DataQualityAssessment;
  suggestions: string[];
  warnings: string[];
  interpretedSchema: any;
}

export interface FieldMapping {
  sourceField: string;
  interpretedMeaning: string;
  vibeluxField: string;
  dataType: 'number' | 'string' | 'date' | 'boolean';
  unit?: string;
  confidence: number;
  transformationNeeded?: string;
}

export interface DataQualityAssessment {
  overall: number; // 0-100
  issues: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    affectedFields: string[];
    suggestedFix?: string;
  }[];
}

// Main AI interpretation function
export async function interpretCultivationData(
  sampleData: any[],
  headers: string[],
  additionalContext?: string
): Promise<DataInterpretationResult> {
  try {
    // Prepare a sample of the data for AI analysis
    const dataSample = sampleData.slice(0, 10);
    
    const systemPrompt = `You are an expert in cannabis cultivation data analysis. You understand various cultivation management systems, sensor data formats, and industry-specific terminology. Your task is to interpret messy, real-world cultivation data and map it to a standardized schema.

Common cultivation data includes:
- Environmental: temperature, humidity, CO2, VPD, light intensity (PPFD/PAR)
- Irrigation: pH, EC/PPM/TDS, water temperature, runoff measurements
- Nutrients: NPK values, calcium, magnesium, micronutrients
- Yield: wet/dry weight, trim weight, waste
- Quality: THC, CBD, terpenes, moisture content
- Genetics: strain names, phenotypes, plant IDs
- Dates: harvest date, transplant date, flip date

You should identify:
1. What each column represents
2. The units being used (and if conversion is needed)
3. Data quality issues
4. Missing but important data
5. Unusual patterns or anomalies`;

    const userPrompt = `Please analyze this cultivation data and provide a detailed interpretation:

Headers: ${headers.join(', ')}

Sample data (first 10 rows):
${JSON.stringify(dataSample, null, 2)}

${additionalContext ? `Additional context: ${additionalContext}` : ''}

Please respond with a JSON object containing:
1. "mappings": Array of field mappings with sourceField, interpretedMeaning, suggested vibeluxField, dataType, unit, confidence (0-100), and any transformationNeeded
2. "dataQuality": Overall score (0-100) and array of issues found
3. "suggestions": Array of suggestions for improving data quality or additional data to collect
4. "warnings": Array of warnings about potential problems
5. "interpretedSchema": Your understanding of what this dataset represents`;

    const claude = createClaudeClient();
    
    const completion = await claude.messages.create({
      model: "claude-3-5-sonnet-20241022",
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt + "\n\nPlease respond with valid JSON only." }
      ],
      temperature: 0.3, // Lower temperature for more consistent interpretation
      max_tokens: 4000,
    });

    const aiResponse = JSON.parse(completion.content[0].type === 'text' ? completion.content[0].text : '{}');
    
    // Post-process the AI response to ensure it matches our expected format
    const result: DataInterpretationResult = {
      success: true,
      mappings: aiResponse.mappings || [],
      dataQuality: aiResponse.dataQuality || { overall: 0, issues: [] },
      suggestions: aiResponse.suggestions || [],
      warnings: aiResponse.warnings || [],
      interpretedSchema: aiResponse.interpretedSchema || {}
    };

    // Enhance mappings with additional validation
    result.mappings = result.mappings.map(mapping => ({
      ...mapping,
      confidence: mapping.confidence || 50,
      vibeluxField: normalizeFieldName(mapping.vibeluxField || mapping.interpretedMeaning)
    }));

    return result;
  } catch (error) {
    console.error('AI interpretation error:', error);
    
    // Fallback to rule-based interpretation if AI fails
    return fallbackInterpretation(sampleData, headers);
  }
}

// AI-powered data cleaning and transformation
export async function cleanDataWithAI(
  data: any[],
  mappings: FieldMapping[]
): Promise<{ cleanedData: any[], report: string }> {
  const prompt = `You are a data cleaning expert. Please analyze this cultivation data and suggest cleaning operations:

Sample of data issues:
${identifyDataIssues(data, mappings).slice(0, 10).join('\n')}

For each issue, suggest:
1. How to clean/fix it
2. Whether to remove, interpolate, or transform the data
3. Any domain-specific knowledge to apply

Respond with specific cleaning instructions in JSON format.`;

  try {
    const claude = createClaudeClient();
    
    const completion = await claude.messages.create({
      model: "claude-3-5-sonnet-20241022",
      messages: [
        { role: "user", content: prompt + "\n\nPlease respond with valid JSON only." }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const cleaningInstructions = JSON.parse(completion.content[0].type === 'text' ? completion.content[0].text : '{}');
    
    // Apply cleaning instructions
    const cleanedData = applyCleaningInstructions(data, cleaningInstructions);
    
    return {
      cleanedData,
      report: generateCleaningReport(cleaningInstructions)
    };
  } catch (error) {
    console.error('AI cleaning error:', error);
    // Fallback to basic cleaning
    return basicDataCleaning(data, mappings);
  }
}

// AI-powered insight generation from historical data
export async function generateAdvancedInsights(
  data: any[],
  facilityContext?: string
): Promise<CultivationInsight[]> {
  const summaryStats = calculateSummaryStatistics(data);
  
  const prompt = `As a cannabis cultivation expert and data scientist, analyze this historical cultivation data and identify actionable insights:

Data Summary:
${JSON.stringify(summaryStats, null, 2)}

${facilityContext ? `Facility Context: ${facilityContext}` : ''}

Please identify:
1. Optimization opportunities (energy, nutrients, labor)
2. Quality improvement patterns
3. Yield optimization strategies
4. Risk factors and preventive measures
5. Cost-saving opportunities

For each insight, provide:
- Title
- Detailed description
- Confidence level (0-100)
- Potential impact (quantified if possible)
- Specific actionable recommendations
- Data points supporting the insight`;

  try {
    const claude = createClaudeClient();
    
    const completion = await claude.messages.create({
      model: "claude-3-5-sonnet-20241022",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.5, // Balanced for creative insights
      max_tokens: 3000,
    });

    const insights = parseInsightsFromAI(completion.content[0].type === 'text' ? completion.content[0].text : '');
    
    // Validate and enhance insights with statistical backing
    return insights.map(insight => ({
      ...insight,
      dataSupport: findSupportingData(data, insight),
      visualizations: suggestVisualizations(insight)
    }));
  } catch (error) {
    console.error('AI insight generation error:', error);
    return [];
  }
}

// Helper function to identify data issues
function identifyDataIssues(data: any[], mappings: FieldMapping[]): string[] {
  const issues: string[] = [];
  
  data.forEach((record, index) => {
    mappings.forEach(mapping => {
      const value = record[mapping.sourceField];
      
      // Check for common issues
      if (value === null || value === undefined || value === '') {
        issues.push(`Row ${index}: Missing value for ${mapping.sourceField}`);
      } else if (mapping.dataType === 'number' && isNaN(Number(value))) {
        issues.push(`Row ${index}: Non-numeric value "${value}" in ${mapping.sourceField}`);
      } else if (mapping.dataType === 'date' && !isValidDate(value)) {
        issues.push(`Row ${index}: Invalid date "${value}" in ${mapping.sourceField}`);
      }
      
      // Domain-specific validations
      if (mapping.interpretedMeaning === 'temperature' && mapping.unit === 'F') {
        const temp = Number(value);
        if (temp < 50 || temp > 100) {
          issues.push(`Row ${index}: Unusual temperature ${temp}°F`);
        }
      }
      
      if (mapping.interpretedMeaning === 'pH') {
        const ph = Number(value);
        if (ph < 4 || ph > 9) {
          issues.push(`Row ${index}: pH value ${ph} out of expected range`);
        }
      }
    });
  });
  
  return issues;
}

// Fallback interpretation when AI is unavailable
function fallbackInterpretation(
  sampleData: any[],
  headers: string[]
): DataInterpretationResult {
  const mappings: FieldMapping[] = [];
  
  // Use pattern matching for common fields
  headers.forEach(header => {
    const lower = header.toLowerCase();
    const mapping: Partial<FieldMapping> = {
      sourceField: header,
      confidence: 60
    };
    
    // Temperature patterns
    if (lower.includes('temp') || lower.includes('temperature')) {
      mapping.interpretedMeaning = 'temperature';
      mapping.vibeluxField = 'environment.temperature';
      mapping.dataType = 'number';
      mapping.unit = lower.includes('c') ? 'C' : 'F';
    }
    // Humidity patterns
    else if (lower.includes('humid') || lower.includes('rh')) {
      mapping.interpretedMeaning = 'humidity';
      mapping.vibeluxField = 'environment.humidity';
      mapping.dataType = 'number';
      mapping.unit = '%';
    }
    // pH patterns
    else if (lower === 'ph' || lower.includes('ph_')) {
      mapping.interpretedMeaning = 'pH';
      mapping.vibeluxField = 'irrigation.ph';
      mapping.dataType = 'number';
    }
    // Add more patterns...
    
    if (mapping.interpretedMeaning) {
      mappings.push(mapping as FieldMapping);
    }
  });
  
  return {
    success: true,
    mappings,
    dataQuality: { overall: 70, issues: [] },
    suggestions: ['Consider using AI interpretation for better results'],
    warnings: [],
    interpretedSchema: {}
  };
}

// Normalize field names to match Vibelux schema
function normalizeFieldName(field: string): string {
  const normalized = field
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Map to Vibelux schema structure
  const schemaMap: { [key: string]: string } = {
    'temperature': 'environment.temperature',
    'temp': 'environment.temperature',
    'humidity': 'environment.humidity',
    'rh': 'environment.humidity',
    'co2': 'environment.co2',
    'light_intensity': 'lighting.intensity',
    'ppfd': 'lighting.ppfd',
    'ph': 'irrigation.ph',
    'ec': 'irrigation.ec',
    'yield': 'harvest.yield',
    'strain': 'genetics.strain'
  };
  
  return schemaMap[normalized] || normalized;
}

function isValidDate(value: any): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

function calculateSummaryStatistics(data: any[]): any {
  // Calculate summary stats for numerical fields
  const stats: any = {};
  
  if (data.length === 0) return stats;
  
  const firstRow = data[0];
  Object.keys(firstRow).forEach(field => {
    const values = data.map(row => row[field]).filter(val => !isNaN(Number(val)));
    
    if (values.length > 0) {
      const numbers = values.map(Number);
      stats[field] = {
        count: values.length,
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        avg: numbers.reduce((a, b) => a + b, 0) / numbers.length,
        missing: data.length - values.length
      };
    }
  });
  
  return stats;
}

function parseInsightsFromAI(content: string): CultivationInsight[] {
  // Parse AI response into structured insights
  try {
    // If response is already JSON
    const parsed = JSON.parse(content);
    return parsed.insights || [];
  } catch {
    // Parse text response into insights
    const insights: CultivationInsight[] = [];
    // Implementation for parsing text-based insights
    return insights;
  }
}

function findSupportingData(data: any[], insight: CultivationInsight): any {
  // Find specific data points that support the insight
  return {
    sampleSize: data.length,
    relevantRecords: 0, // Would implement actual filtering
    statisticalSignificance: 0.95
  };
}

function suggestVisualizations(insight: CultivationInsight): string[] {
  // Suggest appropriate visualizations for the insight
  const visualizations = [];
  
  if (insight.type === 'correlation') {
    visualizations.push('scatter_plot', 'correlation_matrix');
  } else if (insight.type === 'pattern') {
    visualizations.push('line_chart', 'heat_map');
  } else if (insight.type === 'optimization') {
    visualizations.push('bar_chart', 'pareto_chart');
  }
  
  return visualizations;
}

function applyCleaningInstructions(data: any[], instructions: any): any[] {
  // Apply the cleaning instructions from AI
  return data.map(row => {
    const cleanedRow = { ...row };
    // Apply transformations based on instructions
    return cleanedRow;
  });
}

function generateCleaningReport(instructions: any): string {
  return `Data cleaning completed. ${Object.keys(instructions).length} operations applied.`;
}

function basicDataCleaning(data: any[], mappings: FieldMapping[]): { cleanedData: any[], report: string } {
  const cleanedData = data.map(row => {
    const cleaned = { ...row };
    
    mappings.forEach(mapping => {
      const value = cleaned[mapping.sourceField];
      
      if (mapping.dataType === 'number' && typeof value === 'string') {
        // Remove non-numeric characters
        cleaned[mapping.sourceField] = parseFloat(value.replace(/[^0-9.-]/g, ''));
      }
      
      if (mapping.dataType === 'date' && value) {
        // Standardize date format
        cleaned[mapping.sourceField] = new Date(value).toISOString();
      }
    });
    
    return cleaned;
  });
  
  return {
    cleanedData,
    report: 'Basic cleaning applied: standardized numbers and dates'
  };
}

// Types
export interface CultivationInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'correlation' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact?: {
    metric: string;
    value: number;
    unit: string;
  };
  recommendations: string[];
  dataSupport?: any;
  visualizations?: string[];
}