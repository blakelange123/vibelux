import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'data-imports');

export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const facilityId = formData.get('facilityId') as string;
    const sourceSystem = formData.get('sourceSystem') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.userId }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create upload directory
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Save file
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const filename = `import-${uniqueId}.${fileExtension}`;
    const filepath = join(UPLOAD_DIR, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create import record
    const dataImport = await prisma.dataImport.create({
      data: {
        userId: dbUser.id,
        facilityId,
        fileName: file.name,
        fileType: fileExtension || 'unknown',
        fileSize: file.size,
        sourceSystem,
        status: 'processing',
        fieldMappings: {},
        totalRecords: 0
      }
    });

    // Start processing in background
    processImportFile(dataImport.id, filepath, fileExtension || '');

    return NextResponse.json({
      success: true,
      data: {
        importId: dataImport.id,
        status: 'processing',
        message: 'File uploaded successfully. Processing will begin shortly.'
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

async function processImportFile(importId: string, filepath: string, fileType: string) {
  try {
    let data: any[] = [];
    let headers: string[] = [];

    // Parse file based on type
    if (fileType === 'csv') {
      const fileContent = await require('fs').promises.readFile(filepath, 'utf-8');
      data = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      headers = Object.keys(data[0] || {});
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      const workbook = XLSX.readFile(filepath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
      headers = Object.keys(data[0] || {});
    } else if (fileType === 'json') {
      const fileContent = await require('fs').promises.readFile(filepath, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      data = Array.isArray(jsonData) ? jsonData : [jsonData];
      headers = Object.keys(data[0] || {});
    }

    // Update import with preview and field detection
    await prisma.dataImport.update({
      where: { id: importId },
      data: {
        totalRecords: data.length,
        dataPreview: data.slice(0, 5), // First 5 rows as preview
        fieldMappings: detectFieldMappings(headers),
        status: 'analyzing'
      }
    });

    // Process data and generate insights
    await analyzeAndImportData(importId, data);

  } catch (error) {
    console.error('Import processing error:', error);
    await prisma.dataImport.update({
      where: { id: importId },
      data: {
        status: 'failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    });
  }
}

function detectFieldMappings(headers: string[]): any {
  const mappings: any = {};
  
  // Common field mappings
  const fieldMap: { [key: string]: string } = {
    'date': 'timestamp',
    'datetime': 'timestamp',
    'time': 'timestamp',
    'temp': 'temperature',
    'temperature': 'temperature',
    'humidity': 'humidity',
    'rh': 'humidity',
    'co2': 'co2',
    'carbon dioxide': 'co2',
    'ppfd': 'lightPpfd',
    'light': 'lightPpfd',
    'par': 'lightPpfd',
    'ph': 'waterPh',
    'ec': 'waterEc',
    'conductivity': 'waterEc',
    'yield': 'dryWeight',
    'weight': 'dryWeight',
    'strain': 'strain',
    'cultivar': 'strain',
    'variety': 'strain'
  };

  headers.forEach(header => {
    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [pattern, field] of Object.entries(fieldMap)) {
      if (normalized.includes(pattern.replace(/\s/g, ''))) {
        mappings[header] = field;
        break;
      }
    }
  });

  return mappings;
}

async function analyzeAndImportData(importId: string, data: any[]) {
  try {
    const dataImport = await prisma.dataImport.findUnique({
      where: { id: importId },
      include: { facility: true }
    });

    if (!dataImport) return;

    const mappings = dataImport.fieldMappings as any;
    const errors: string[] = [];
    const warnings: string[] = [];
    let processedCount = 0;

    // Import historical data records
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const records = [];

      for (const row of batch) {
        try {
          const record: any = {
            importId,
            facilityId: dataImport.facilityId
          };

          // Map fields
          for (const [sourceField, targetField] of Object.entries(mappings)) {
            const value = row[sourceField];
            if (value !== undefined && value !== null && value !== '') {
              if (targetField === 'timestamp') {
                record.timestamp = new Date(value);
              } else if (typeof value === 'string' && !isNaN(Number(value))) {
                record[targetField as string] = parseFloat(value);
              } else {
                record[targetField as string] = value;
              }
            }
          }

          // Ensure we have a timestamp
          if (!record.timestamp) {
            warnings.push(`Row ${i + 1}: Missing timestamp`);
            continue;
          }

          records.push(record);
          processedCount++;
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
        }
      }

      // Batch insert
      if (records.length > 0) {
        await prisma.historicalData.createMany({
          data: records,
          skipDuplicates: true
        });
      }

      // Update progress
      await prisma.dataImport.update({
        where: { id: importId },
        data: {
          processedRecords: processedCount,
          progress: Math.round((processedCount / data.length) * 100)
        }
      });
    }

    // Generate insights
    await generateDataInsights(importId);

    // Mark as complete
    await prisma.dataImport.update({
      where: { id: importId },
      data: {
        status: 'complete',
        completedAt: new Date(),
        processedRecords: processedCount,
        failedRecords: data.length - processedCount,
        progress: 100,
        errors: errors.length > 0 ? errors : null,
        warnings: warnings.length > 0 ? warnings : null
      }
    });

  } catch (error) {
    console.error('Data analysis error:', error);
    throw error;
  }
}

async function generateDataInsights(importId: string) {
  // This would use ML/statistical analysis in production
  // For now, we'll generate some basic insights

  const historicalData = await prisma.historicalData.findMany({
    where: { importId },
    orderBy: { timestamp: 'asc' }
  });

  if (historicalData.length === 0) return;

  const insights = [];

  // Temperature analysis
  const temps = historicalData.filter(d => d.temperature).map(d => d.temperature!);
  if (temps.length > 0) {
    const avgTemp = temps.reduce((a, b) => a + b) / temps.length;
    const optimalTemp = 22; // °C
    
    if (Math.abs(avgTemp - optimalTemp) > 2) {
      insights.push({
        importId,
        insightType: 'optimization',
        category: 'environment',
        title: 'Temperature Optimization Opportunity',
        description: `Average temperature of ${avgTemp.toFixed(1)}°C deviates from optimal range. Adjusting to 22°C could improve yields.`,
        confidence: 85,
        impactMetric: 'Yield',
        impactValue: 5,
        impactUnit: '%',
        dataPoints: temps.length,
        dateRangeStart: historicalData[0].timestamp,
        dateRangeEnd: historicalData[historicalData.length - 1].timestamp,
        statistics: {
          mean: avgTemp,
          min: Math.min(...temps),
          max: Math.max(...temps)
        },
        recommendations: ['Adjust HVAC setpoints to maintain 22°C', 'Monitor temperature variance'],
        priority: 'high'
      });
    }
  }

  // Yield pattern analysis
  const yields = historicalData.filter(d => d.dryWeight).map(d => ({ 
    timestamp: d.timestamp, 
    yield: d.dryWeight! 
  }));
  
  if (yields.length > 2) {
    // Simple trend detection
    const firstHalf = yields.slice(0, Math.floor(yields.length / 2));
    const secondHalf = yields.slice(Math.floor(yields.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b.yield, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b.yield, 0) / secondHalf.length;
    
    const trend = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (Math.abs(trend) > 10) {
      insights.push({
        importId,
        insightType: trend > 0 ? 'pattern' : 'anomaly',
        category: 'yield',
        title: trend > 0 ? 'Positive Yield Trend Detected' : 'Yield Decline Detected',
        description: `Yields have ${trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trend).toFixed(1)}% over the analysis period.`,
        confidence: 75,
        impactMetric: 'Yield',
        impactValue: trend,
        impactUnit: '%',
        dataPoints: yields.length,
        dateRangeStart: yields[0].timestamp,
        dateRangeEnd: yields[yields.length - 1].timestamp,
        statistics: {
          firstPeriodAvg: firstAvg,
          secondPeriodAvg: secondAvg,
          trend
        },
        recommendations: trend > 0 
          ? ['Continue current practices', 'Document successful changes']
          : ['Review recent operational changes', 'Check for equipment issues'],
        priority: Math.abs(trend) > 20 ? 'high' : 'medium'
      });
    }
  }

  // Insert insights
  if (insights.length > 0) {
    await prisma.dataInsight.createMany({
      data: insights
    });
  }
}