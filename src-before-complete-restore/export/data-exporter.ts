// Data Export Service for Vibelux
// Supports CSV, Excel, PDF, and JSON exports

import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import * as ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getTimeSeriesDB } from '../timeseries/influxdb-client';
import { prisma } from '@/lib/db';

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';
export type DataType = 'sensor' | 'yield' | 'environmental' | 'equipment' | 'alerts' | 'cultivation';

export interface ExportOptions {
  format: ExportFormat;
  dataType: DataType;
  dateRange: {
    start: Date;
    end: Date;
  };
  filters?: {
    projectId?: string;
    roomId?: string;
    sensorType?: string;
    strainId?: string;
  };
  includeAggregations?: boolean;
  aggregationInterval?: string; // '1h', '1d', '1w'
  includeCharts?: boolean;
  customFields?: string[];
}

export interface ExportResult {
  success: boolean;
  filename: string;
  data?: Uint8Array | string;
  error?: string;
  recordCount?: number;
  fileSize?: number;
}

export class DataExporter {
  // Main export function
  async exportData(options: ExportOptions): Promise<ExportResult> {
    try {
      // Fetch data based on type
      const data = await this.fetchData(options);
      
      if (!data || data.length === 0) {
        return {
          success: false,
          filename: '',
          error: 'No data found for the specified criteria'
        };
      }
      
      // Generate export based on format
      let result: Uint8Array | string;
      let filename: string;
      
      switch (options.format) {
        case 'csv':
          result = await this.exportToCSV(data, options);
          filename = this.generateFilename(options, 'csv');
          break;
          
        case 'excel':
          result = await this.exportToExcel(data, options);
          filename = this.generateFilename(options, 'xlsx');
          break;
          
        case 'pdf':
          result = await this.exportToPDF(data, options);
          filename = this.generateFilename(options, 'pdf');
          break;
          
        case 'json':
          result = await this.exportToJSON(data, options);
          filename = this.generateFilename(options, 'json');
          break;
          
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }
      
      return {
        success: true,
        filename,
        data: result,
        recordCount: data.length,
        fileSize: result instanceof Uint8Array ? result.length : new Blob([result]).size
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }
  
  // Fetch data based on type and options
  private async fetchData(options: ExportOptions): Promise<any[]> {
    const tsdb = getTimeSeriesDB();
    
    switch (options.dataType) {
      case 'sensor':
        return this.fetchSensorData(options);
        
      case 'yield':
        return this.fetchYieldData(options);
        
      case 'environmental':
        return this.fetchEnvironmentalData(options);
        
      case 'equipment':
        return this.fetchEquipmentData(options);
        
      case 'alerts':
        return this.fetchAlertData(options);
        
      case 'cultivation':
        return this.fetchCultivationData(options);
        
      default:
        throw new Error(`Unsupported data type: ${options.dataType}`);
    }
  }
  
  // Fetch sensor readings from time-series database
  private async fetchSensorData(options: ExportOptions): Promise<any[]> {
    const tsdb = getTimeSeriesDB();
    
    let query = `from(bucket: "sensor_data")
      |> range(start: ${options.dateRange.start.toISOString()}, stop: ${options.dateRange.end.toISOString()})
      |> filter(fn: (r) => r["_measurement"] == "sensor_readings")`;
    
    if (options.filters?.projectId) {
      query += `
      |> filter(fn: (r) => r["project_id"] == "${options.filters.projectId}")`;
    }
    
    if (options.filters?.roomId) {
      query += `
      |> filter(fn: (r) => r["room_id"] == "${options.filters.roomId}")`;
    }
    
    if (options.filters?.sensorType) {
      query += `
      |> filter(fn: (r) => r["sensor_type"] == "${options.filters.sensorType}")`;
    }
    
    if (options.includeAggregations && options.aggregationInterval) {
      query += `
      |> aggregateWindow(every: ${options.aggregationInterval}, fn: mean, createEmpty: false)`;
    }
    
    // For demo, return mock data
    return this.generateMockSensorData(options);
  }
  
  // Fetch yield data
  private async fetchYieldData(options: ExportOptions): Promise<any[]> {
    // In production, fetch from database
    const mockData = [];
    const strains = ['Blue Dream', 'OG Kush', 'Gorilla Glue', 'Purple Haze'];
    
    for (let i = 0; i < 50; i++) {
      const date = new Date(options.dateRange.start);
      date.setDate(date.getDate() + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 90));
      
      mockData.push({
        id: `harvest_${i}`,
        date: date.toISOString(),
        strain: strains[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * strains.length)],
        room: `Room ${Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4) + 1}`,
        plants: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20) + 10,
        wetWeight: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5000 + 3000) * 10) / 10,
        dryWeight: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000 + 600) * 10) / 10,
        quality: ['A+', 'A', 'B+', 'B'][Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4)],
        thc: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 + 15) * 10) / 10,
        cbd: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2) * 10) / 10,
        terpenes: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2 + 1) * 100) / 100
      });
    }
    
    return mockData;
  }
  
  // Fetch environmental summary data
  private async fetchEnvironmentalData(options: ExportOptions): Promise<any[]> {
    const mockData = [];
    const rooms = ['Flower Room A', 'Flower Room B', 'Veg Room', 'Clone Room'];
    
    // Generate daily summaries
    const days = Math.floor((options.dateRange.end.getTime() - options.dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let d = 0; d < days; d++) {
      const date = new Date(options.dateRange.start);
      date.setDate(date.getDate() + d);
      
      for (const room of rooms) {
        mockData.push({
          date: date.toISOString().split('T')[0],
          room,
          avgTemp: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 + 70) * 10) / 10,
          minTemp: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 + 65) * 10) / 10,
          maxTemp: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 + 80) * 10) / 10,
          avgHumidity: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 + 50) * 10) / 10,
          avgCO2: Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400 + 600),
          avgVPD: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4 + 0.8) * 100) / 100,
          lightHours: room.includes('Clone') ? 18 : 12,
          avgPPFD: Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 + 500),
          dli: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 + 15) * 10) / 10
        });
      }
    }
    
    return mockData;
  }
  
  // Fetch equipment usage data
  private async fetchEquipmentData(options: ExportOptions): Promise<any[]> {
    const mockData = [];
    const equipment = [
      { id: 'hvac-1', type: 'HVAC', power: 5000 },
      { id: 'light-1', type: 'LED Array', power: 640 },
      { id: 'fan-1', type: 'Exhaust Fan', power: 200 },
      { id: 'dehu-1', type: 'Dehumidifier', power: 700 }
    ];
    
    const days = Math.floor((options.dateRange.end.getTime() - options.dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let d = 0; d < days; d++) {
      const date = new Date(options.dateRange.start);
      date.setDate(date.getDate() + d);
      
      for (const eq of equipment) {
        const runtime = eq.type === 'LED Array' ? 12 : crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 + 4;
        mockData.push({
          date: date.toISOString().split('T')[0],
          equipmentId: eq.id,
          type: eq.type,
          runtime: Math.round(runtime * 10) / 10,
          energyUsed: Math.round(eq.power * runtime / 1000 * 10) / 10, // kWh
          efficiency: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 + 80) * 10) / 10,
          status: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.95 ? 'maintenance' : 'operational'
        });
      }
    }
    
    return mockData;
  }
  
  // Fetch alert history
  private async fetchAlertData(options: ExportOptions): Promise<any[]> {
    const mockData = [];
    const alertTypes = ['temperature', 'humidity', 'co2', 'ph', 'equipment'];
    const severities = ['low', 'medium', 'high', 'critical'];
    
    for (let i = 0; i < 100; i++) {
      const date = new Date(
        options.dateRange.start.getTime() + 
        crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * (options.dateRange.end.getTime() - options.dateRange.start.getTime())
      );
      
      mockData.push({
        id: `alert_${i}`,
        timestamp: date.toISOString(),
        type: alertTypes[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * alertTypes.length)],
        severity: severities[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * severities.length)],
        title: 'Environmental Alert',
        message: 'Parameter out of range',
        room: `Room ${Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4) + 1}`,
        acknowledged: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.3,
        resolvedAt: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.5 ? new Date(date.getTime() + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3600000).toISOString() : null
      });
    }
    
    return mockData;
  }
  
  // Fetch cultivation cycle data
  private async fetchCultivationData(options: ExportOptions): Promise<any[]> {
    const mockData = [];
    const strains = ['Blue Dream', 'OG Kush', 'Gorilla Glue', 'Purple Haze'];
    
    for (let i = 0; i < 20; i++) {
      const startDate = new Date(options.dateRange.start);
      startDate.setDate(startDate.getDate() + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30));
      
      const cycleLength = 60 + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + cycleLength);
      
      mockData.push({
        id: `cycle_${i}`,
        strain: strains[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * strains.length)],
        room: `Room ${Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4) + 1}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        cycleLength,
        plantCount: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30) + 20,
        totalYield: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2000 + 1000) * 10) / 10,
        avgYieldPerPlant: Math.round((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 + 50) * 10) / 10,
        nutrients: {
          nitrogen: Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000 + 500),
          phosphorus: Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 500 + 200),
          potassium: Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 800 + 400)
        },
        waterUsed: Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5000 + 3000),
        energyUsed: Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3000 + 2000),
        laborHours: Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 + 50)
      });
    }
    
    return mockData;
  }
  
  // Export to CSV
  private async exportToCSV(data: any[], options: ExportOptions): Promise<string> {
    const columns = options.customFields || Object.keys(data[0]);
    
    const csvData = stringify(data, {
      header: true,
      columns: columns,
      cast: {
        date: (value) => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        }
      }
    });
    
    return csvData;
  }
  
  // Export to Excel using secure ExcelJS
  private async exportToExcel(data: any[], options: ExportOptions): Promise<Uint8Array> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Vibelux';
    workbook.created = new Date();
    
    // Main data sheet
    const worksheet = workbook.addWorksheet('Data');
    
    if (data.length > 0) {
      // Add headers
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);
      
      // Add data rows
      data.forEach(row => {
        worksheet.addRow(headers.map(header => row[header]));
      });
      
      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4A5568' }
      };
    }
    
    // Add summary sheet if aggregations included
    if (options.includeAggregations) {
      const summary = this.generateSummary(data, options);
      const summarySheet = workbook.addWorksheet('Summary');
      
      if (summary.length > 0) {
        summarySheet.addRow(['Metric', 'Value']);
        summary.forEach(item => {
          summarySheet.addRow([item.metric, item.value]);
        });
        
        // Style summary header
        const summaryHeader = summarySheet.getRow(1);
        summaryHeader.font = { bold: true };
        summaryHeader.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4A5568' }
        };
      }
    }
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return new Uint8Array(buffer);
  }
  
  // Export to PDF
  private async exportToPDF(data: any[], options: ExportOptions): Promise<Uint8Array> {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text(`Vibelux ${this.getDataTypeTitle(options.dataType)} Report`, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Period: ${options.dateRange.start.toLocaleDateString()} - ${options.dateRange.end.toLocaleDateString()}`, 20, 37);
    
    // Add data table
    const columns = options.customFields || Object.keys(data[0]);
    const rows = data.map(item => columns.map(col => {
      const value = item[col];
      if (value instanceof Date) return value.toLocaleDateString();
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    }));
    
    (doc as any).autoTable({
      head: [columns],
      body: rows,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [124, 58, 237] }
    });
    
    // Add summary if requested
    if (options.includeAggregations) {
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Summary Statistics', 20, finalY);
      
      const summary = this.generateSummary(data, options);
      const summaryText = summary.map(s => `${s.metric}: ${s.value}`).join('\n');
      doc.setFontSize(10);
      doc.text(summaryText, 20, finalY + 10);
    }
    
    return doc.output('arraybuffer') as Uint8Array;
  }
  
  // Export to JSON
  private async exportToJSON(data: any[], options: ExportOptions): Promise<string> {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        dataType: options.dataType,
        dateRange: options.dateRange,
        filters: options.filters,
        recordCount: data.length
      },
      data: data
    };
    
    if (options.includeAggregations) {
      exportData['summary'] = this.generateSummary(data, options);
    }
    
    return JSON.stringify(exportData, null, 2);
  }
  
  // Generate summary statistics
  private generateSummary(data: any[], options: ExportOptions): any[] {
    const summary = [];
    
    // Calculate basic statistics based on data type
    switch (options.dataType) {
      case 'sensor':
        const values = data.map(d => d.value).filter(v => typeof v === 'number');
        summary.push(
          { metric: 'Average', value: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) },
          { metric: 'Min', value: Math.min(...values).toFixed(2) },
          { metric: 'Max', value: Math.max(...values).toFixed(2) },
          { metric: 'Count', value: values.length }
        );
        break;
        
      case 'yield':
        const yields = data.map(d => d.dryWeight || 0);
        summary.push(
          { metric: 'Total Yield', value: yields.reduce((a, b) => a + b, 0).toFixed(2) + ' g' },
          { metric: 'Average Yield', value: (yields.reduce((a, b) => a + b, 0) / yields.length).toFixed(2) + ' g' },
          { metric: 'Harvests', value: data.length }
        );
        break;
        
      // Add more summaries for other data types
    }
    
    return summary;
  }
  
  // Generate mock sensor data
  private generateMockSensorData(options: ExportOptions): any[] {
    const data = [];
    const interval = options.aggregationInterval === '1h' ? 3600000 : 
                    options.aggregationInterval === '1d' ? 86400000 : 300000; // 5 min default
    
    let currentTime = options.dateRange.start.getTime();
    const endTime = options.dateRange.end.getTime();
    
    while (currentTime < endTime) {
      const baseTemp = 75 + Math.sin(currentTime / 86400000) * 5;
      
      data.push({
        timestamp: new Date(currentTime).toISOString(),
        sensorId: 'sensor_temp_1',
        type: 'temperature',
        value: baseTemp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2,
        unit: '°F',
        room: options.filters?.roomId || 'room_1',
        quality: 100
      });
      
      data.push({
        timestamp: new Date(currentTime).toISOString(),
        sensorId: 'sensor_hum_1',
        type: 'humidity',
        value: 55 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
        unit: '%',
        room: options.filters?.roomId || 'room_1',
        quality: 100
      });
      
      currentTime += interval;
    }
    
    return data;
  }
  
  // Generate filename
  private generateFilename(options: ExportOptions, extension: string): string {
    const parts = [
      'vibelux',
      options.dataType,
      options.dateRange.start.toISOString().split('T')[0],
      options.dateRange.end.toISOString().split('T')[0]
    ];
    
    if (options.filters?.roomId) {
      parts.push(options.filters.roomId);
    }
    
    return `${parts.join('_')}.${extension}`;
  }
  
  // Get readable title for data type
  private getDataTypeTitle(dataType: DataType): string {
    const titles = {
      sensor: 'Sensor Data',
      yield: 'Yield Data',
      environmental: 'Environmental Summary',
      equipment: 'Equipment Usage',
      alerts: 'Alert History',
      cultivation: 'Cultivation Cycles'
    };
    
    return titles[dataType] || dataType;
  }
}

// Export singleton instance
export const dataExporter = new DataExporter();