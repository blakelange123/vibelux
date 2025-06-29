// Data export service for customer and admin data exports
import { createObjectCsvWriter } from 'csv-writer';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { timeseriesDB } from '../database/timeseries';
import { documentDB } from '../database/mongodb';
import { cacheDB } from '../database/redis';

interface ExportConfig {
  facilityId: string;
  dataTypes: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  format: 'csv' | 'json' | 'pdf' | 'xlsx';
  includePhotos: boolean;
  includePersonalData: boolean;
  requestedBy: string;
}

interface ExportData {
  photoReports?: any[];
  harvestData?: any[];
  environmentalData?: any[];
  ipmScouting?: any[];
  sprayApplications?: any[];
  trainingRecords?: any[];
  userActivity?: any[];
  analytics?: any[];
}

export class ExportService {
  private static instance: ExportService;

  static getInstance(): ExportService {
    if (!this.instance) {
      this.instance = new ExportService();
    }
    return this.instance;
  }

  /**
   * Create a new export request
   */
  async createExportRequest(config: ExportConfig): Promise<string> {
    const exportId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store export request in cache for processing
    await cacheDB.setUserSession(`export:${exportId}`, {
      ...config,
      status: 'pending',
      createdAt: new Date(),
      progress: 0
    }, 86400); // 24 hour expiry

    // Queue export processing
    await this.queueExportProcessing(exportId, config);
    
    return exportId;
  }

  /**
   * Process export request asynchronously
   */
  private async queueExportProcessing(exportId: string, config: ExportConfig): Promise<void> {
    // In production, this would be queued for background processing
    setTimeout(async () => {
      try {
        await this.processExport(exportId, config);
      } catch (error) {
        console.error(`Export ${exportId} failed:`, error);
        await this.updateExportStatus(exportId, 'failed', 100, error.message);
      }
    }, 1000);
  }

  /**
   * Process the actual export
   */
  private async processExport(exportId: string, config: ExportConfig): Promise<void> {
    await this.updateExportStatus(exportId, 'processing', 0);

    // Collect data based on requested types
    const exportData: ExportData = {};
    let progress = 0;
    const totalSteps = config.dataTypes.length;

    for (const dataType of config.dataTypes) {
      await this.updateExportStatus(exportId, 'processing', (progress / totalSteps) * 80);
      
      switch (dataType) {
        case 'photo_reports':
          exportData.photoReports = await this.getPhotoReports(config);
          break;
        case 'harvest_data':
          exportData.harvestData = await this.getHarvestData(config);
          break;
        case 'environmental_data':
          exportData.environmentalData = await this.getEnvironmentalData(config);
          break;
        case 'ipm_scouting':
          exportData.ipmScouting = await this.getIPMScoutingData(config);
          break;
        case 'spray_applications':
          exportData.sprayApplications = await this.getSprayApplications(config);
          break;
        case 'training_records':
          exportData.trainingRecords = await this.getTrainingRecords(config);
          break;
        case 'user_activity':
          exportData.userActivity = await this.getUserActivity(config);
          break;
        case 'analytics':
          exportData.analytics = await this.getAnalyticsData(config);
          break;
      }
      
      progress++;
    }

    await this.updateExportStatus(exportId, 'processing', 80);

    // Generate export file
    const filePath = await this.generateExportFile(exportId, exportData, config);
    
    await this.updateExportStatus(exportId, 'completed', 100, undefined, filePath);
  }

  /**
   * Get photo reports data
   */
  private async getPhotoReports(config: ExportConfig): Promise<any[]> {
    // In production, query from PostgreSQL
    const reports = [
      {
        id: 'report-001',
        type: 'pest_disease',
        title: 'Spider mites detected',
        description: 'Found on lower leaves',
        severity: 'high',
        status: 'resolved',
        location: 'Veg Room 3',
        submittedBy: config.includePersonalData ? 'John Smith' : 'User***',
        submittedAt: new Date('2024-01-15'),
        resolvedAt: new Date('2024-01-16'),
        aiAnalysis: {
          confidence: 0.94,
          detectedIssues: ['spider_mites'],
          recommendedActions: ['Apply neem oil', 'Increase humidity']
        },
        photos: config.includePhotos ? ['photo1.jpg', 'photo2.jpg'] : ['[Photos excluded]']
      }
    ];

    return reports.filter(report => 
      report.submittedAt >= config.dateRange.start && 
      report.submittedAt <= config.dateRange.end
    );
  }

  /**
   * Get harvest data
   */
  private async getHarvestData(config: ExportConfig): Promise<any[]> {
    const harvestData = await timeseriesDB.query(`
      from(bucket: "greenhouse_data")
        |> range(start: ${config.dateRange.start.toISOString()}, stop: ${config.dateRange.end.toISOString()})
        |> filter(fn: (r) => r._measurement == "harvest_metrics")
        |> filter(fn: (r) => r.facility_id == "${config.facilityId}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `);

    return harvestData.map(record => ({
      batchId: record.batch_id,
      strain: record.strain,
      actualYield: record.actual_yield,
      estimatedYield: record.estimated_yield,
      plantCount: record.plant_count,
      yieldPerPlant: record.yield_per_plant,
      yieldVariance: record.yield_variance,
      harvestDate: record._time
    }));
  }

  /**
   * Get environmental data
   */
  private async getEnvironmentalData(config: ExportConfig): Promise<any[]> {
    const envData = await timeseriesDB.query(`
      from(bucket: "greenhouse_data")
        |> range(start: ${config.dateRange.start.toISOString()}, stop: ${config.dateRange.end.toISOString()})
        |> filter(fn: (r) => r._measurement == "environmental_data")
        |> filter(fn: (r) => r.facility_id == "${config.facilityId}")
        |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `);

    return envData.map(record => ({
      zoneId: record.zone_id,
      timestamp: record._time,
      temperature: record.temperature,
      humidity: record.humidity,
      co2: record.co2,
      vpd: record.vpd,
      lightLevel: record.light_level
    }));
  }

  /**
   * Get IPM scouting data
   */
  private async getIPMScoutingData(config: ExportConfig): Promise<any[]> {
    // Mock data - in production, query from database
    return [
      {
        sessionId: 'ipm-001',
        routeName: 'Daily IPM Route - Building A',
        scoutedBy: config.includePersonalData ? 'Jane Doe' : 'Scout***',
        startTime: new Date('2024-01-15T08:00:00'),
        endTime: new Date('2024-01-15T09:30:00'),
        zones: ['Zone 1', 'Zone 2', 'Zone 3'],
        findings: [
          {
            type: 'spider_mites',
            severity: 'medium',
            location: 'Zone 1, Row 3',
            actionTaken: 'Applied neem oil'
          }
        ]
      }
    ];
  }

  /**
   * Get spray applications data
   */
  private async getSprayApplications(config: ExportConfig): Promise<any[]> {
    return [
      {
        applicationId: 'spray-001',
        productName: 'Neem Oil Concentrate',
        activeIngredient: 'Azadirachtin 0.3%',
        targetPest: 'Spider mites',
        zones: ['Veg Room 1', 'Veg Room 2'],
        applicationDate: new Date('2024-01-15'),
        applicator: config.includePersonalData ? 'Mike Johnson' : 'Applicator***',
        reEntryInterval: 4,
        phiDays: 0,
        weatherConditions: {
          temperature: 72,
          humidity: 45,
          windSpeed: 2.1
        }
      }
    ];
  }

  /**
   * Get training records
   */
  private async getTrainingRecords(config: ExportConfig): Promise<any[]> {
    return [
      {
        userId: config.includePersonalData ? 'john.smith@facility.com' : 'user***@***.com',
        userName: config.includePersonalData ? 'John Smith' : 'User***',
        moduleName: 'Visual Operations Basics',
        completedAt: new Date('2024-01-10'),
        score: 92,
        certified: true,
        certificateId: 'CERT-VB-001',
        expiresAt: new Date('2025-01-10')
      }
    ];
  }

  /**
   * Get user activity data
   */
  private async getUserActivity(config: ExportConfig): Promise<any[]> {
    const locationData = await timeseriesDB.query(`
      from(bucket: "greenhouse_data")
        |> range(start: ${config.dateRange.start.toISOString()}, stop: ${config.dateRange.end.toISOString()})
        |> filter(fn: (r) => r._measurement == "location_tracking")
        |> filter(fn: (r) => r.facility_id == "${config.facilityId}")
        |> aggregateWindow(every: 1h, fn: last, createEmpty: false)
    `);

    return locationData.map(record => ({
      userId: config.includePersonalData ? record.user_id : 'user***',
      timestamp: record._time,
      zone: record.zone_id || 'Unknown',
      activityType: 'location_update',
      duration: 60 // minutes - aggregated hourly
    }));
  }

  /**
   * Get analytics data
   */
  private async getAnalyticsData(config: ExportConfig): Promise<any[]> {
    const analyticsReports = await documentDB.getAnalyticsData(
      config.facilityId, 
      'facility_summary', 
      Math.floor((config.dateRange.end.getTime() - config.dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
    );

    return analyticsReports.map(report => ({
      reportType: report.reportType,
      period: report.period,
      metrics: report.metrics,
      insights: report.insights,
      generatedAt: report.generatedAt
    }));
  }

  /**
   * Generate export file in requested format
   */
  private async generateExportFile(exportId: string, data: ExportData, config: ExportConfig): Promise<string> {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `vibelux_export_${config.facilityId}_${timestamp}`;
    const filePath = `/tmp/exports/${filename}`;

    switch (config.format) {
      case 'csv':
        await this.generateCSV(data, `${filePath}.csv`);
        return `${filePath}.csv`;
      
      case 'xlsx':
        await this.generateXLSX(data, `${filePath}.xlsx`);
        return `${filePath}.xlsx`;
      
      case 'json':
        await this.generateJSON(data, `${filePath}.json`);
        return `${filePath}.json`;
      
      case 'pdf':
        await this.generatePDF(data, config, `${filePath}.pdf`);
        return `${filePath}.pdf`;
      
      default:
        throw new Error(`Unsupported format: ${config.format}`);
    }
  }

  /**
   * Generate CSV export
   */
  private async generateCSV(data: ExportData, filePath: string): Promise<void> {
    // Flatten all data into a single CSV with type indicators
    const allRecords: any[] = [];

    Object.entries(data).forEach(([type, records]) => {
      if (records && Array.isArray(records)) {
        records.forEach(record => {
          allRecords.push({
            data_type: type,
            ...this.flattenObject(record)
          });
        });
      }
    });

    if (allRecords.length === 0) {
      throw new Error('No data to export');
    }

    // Get all unique keys for CSV headers
    const headers = [...new Set(allRecords.flatMap(record => Object.keys(record)))];
    
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: headers.map(key => ({ id: key, title: key }))
    });

    await csvWriter.writeRecords(allRecords);
  }

  /**
   * Generate XLSX export using secure ExcelJS
   */
  private async generateXLSX(data: ExportData, filePath: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Vibelux';
    workbook.created = new Date();

    Object.entries(data).forEach(([type, records]) => {
      if (records && Array.isArray(records) && records.length > 0) {
        const worksheet = workbook.addWorksheet(type);
        const flatRecords = records.map(record => this.flattenObject(record));
        
        if (flatRecords.length > 0) {
          // Add headers
          const headers = Object.keys(flatRecords[0]);
          worksheet.addRow(headers);
          
          // Add data rows
          flatRecords.forEach(record => {
            worksheet.addRow(headers.map(header => record[header]));
          });
          
          // Style the header row
          const headerRow = worksheet.getRow(1);
          headerRow.font = { bold: true };
          headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
          };
        }
      }
    });

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Export Date', new Date().toISOString()]);
    summarySheet.addRow(['Total Records', Object.values(data).reduce((sum, records) => sum + (records?.length || 0), 0)]);
    summarySheet.addRow(['Data Types', Object.keys(data).join(', ')]);
    
    // Style summary sheet
    summarySheet.getColumn(1).font = { bold: true };
    summarySheet.getColumn(1).width = 15;
    summarySheet.getColumn(2).width = 30;

    await workbook.xlsx.writeFile(filePath);
  }

  /**
   * Generate JSON export
   */
  private async generateJSON(data: ExportData, filePath: string): Promise<void> {
    const exportPackage = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalRecords: Object.values(data).reduce((sum, records) => sum + (records?.length || 0), 0)
      },
      data
    };

    const fs = require('fs');
    fs.writeFileSync(filePath, JSON.stringify(exportPackage, null, 2));
  }

  /**
   * Generate PDF export
   */
  private async generatePDF(data: ExportData, config: ExportConfig, filePath: string): Promise<void> {
    const doc = new PDFDocument();
    const fs = require('fs');
    doc.pipe(fs.createWriteStream(filePath));

    // PDF Header
    doc.fontSize(20).text('Vibelux Data Export', 50, 50);
    doc.fontSize(12).text(`Facility: ${config.facilityId}`, 50, 80);
    doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 50, 95);
    doc.text(`Date Range: ${config.dateRange.start.toLocaleDateString()} - ${config.dateRange.end.toLocaleDateString()}`, 50, 110);

    let yPosition = 140;

    // Add data sections
    Object.entries(data).forEach(([type, records]) => {
      if (records && Array.isArray(records) && records.length > 0) {
        doc.fontSize(16).text(type.replace('_', ' ').toUpperCase(), 50, yPosition);
        yPosition += 25;

        doc.fontSize(10).text(`Total Records: ${records.length}`, 50, yPosition);
        yPosition += 20;

        // Add first few records as examples
        records.slice(0, 3).forEach((record, index) => {
          doc.fontSize(8);
          const flatRecord = this.flattenObject(record);
          Object.entries(flatRecord).slice(0, 5).forEach(([key, value]) => {
            doc.text(`${key}: ${String(value).slice(0, 50)}${String(value).length > 50 ? '...' : ''}`, 60, yPosition);
            yPosition += 12;
          });
          yPosition += 10;
        });

        yPosition += 20;
      }
    });

    doc.end();
  }

  /**
   * Flatten nested objects for CSV/table export
   */
  private flattenObject(obj: any, prefix = ''): any {
    const flattened: any = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;
      
      if (value === null || value === undefined) {
        flattened[newKey] = '';
      } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        flattened[newKey] = value.join('; ');
      } else {
        flattened[newKey] = value;
      }
    });
    
    return flattened;
  }

  /**
   * Update export status
   */
  private async updateExportStatus(
    exportId: string, 
    status: string, 
    progress: number, 
    error?: string, 
    filePath?: string
  ): Promise<void> {
    const existing = await cacheDB.getUserSession(`export:${exportId}`);
    if (existing) {
      await cacheDB.setUserSession(`export:${exportId}`, {
        ...existing,
        status,
        progress,
        error,
        filePath,
        updatedAt: new Date()
      }, 86400);
    }
  }

  /**
   * Get export status
   */
  async getExportStatus(exportId: string): Promise<any> {
    return await cacheDB.getUserSession(`export:${exportId}`);
  }

  /**
   * Get export file download URL
   */
  async getDownloadUrl(exportId: string, userId: string): Promise<string> {
    const exportData = await this.getExportStatus(exportId);
    
    if (!exportData || exportData.status !== 'completed') {
      throw new Error('Export not ready for download');
    }

    // In production, generate signed URL with expiration
    return `/api/exports/${exportId}/download?token=${userId}`;
  }

  /**
   * Delete expired exports
   */
  async cleanupExpiredExports(): Promise<void> {
    // Implementation would clean up old export files and cache entries
    const fs = require('fs');
    const path = require('path');
    
    const exportsDir = '/tmp/exports';
    if (fs.existsSync(exportsDir)) {
      const files = fs.readdirSync(exportsDir);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      files.forEach((file: string) => {
        const filePath = path.join(exportsDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
        }
      });
    }
  }
}

export const exportService = ExportService.getInstance();