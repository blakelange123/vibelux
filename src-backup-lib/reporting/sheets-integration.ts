import { z } from 'zod';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Configuration schemas
const SheetsConfigSchema = z.object({
  region: z.string(),
  credentials: z.object({
    client_email: z.string().optional(),
    private_key: z.string().optional(),
    project_id: z.string().optional(),
  }).optional(),
  scopes: z.array(z.string()).default([
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ]),
  defaultFolder: z.string().optional(),
});

type SheetsConfig = z.infer<typeof SheetsConfigSchema>;

// Report templates
const ReportTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['dashboard', 'financial', 'operational', 'compliance', 'custom']),
  structure: z.object({
    sheets: z.array(z.object({
      name: z.string(),
      headers: z.array(z.string()),
      dataMapping: z.record(z.string()),
      formatting: z.object({
        headerStyle: z.record(z.any()).optional(),
        dataStyle: z.record(z.any()).optional(),
        conditionalFormatting: z.array(z.any()).optional(),
      }).optional(),
    })),
    charts: z.array(z.object({
      title: z.string(),
      type: z.enum(['line', 'bar', 'pie', 'scatter', 'area']),
      dataRange: z.string(),
      position: z.object({
        sheet: z.string(),
        row: z.number(),
        column: z.number(),
      }),
    })).optional(),
  }),
  automation: z.object({
    schedule: z.string().optional(),
    triggers: z.array(z.string()).optional(),
    recipients: z.array(z.string()).optional(),
  }).optional(),
});

type ReportTemplate = z.infer<typeof ReportTemplateSchema>;

export class SheetsIntegration {
  private auth: JWT;
  private sheets: any;
  private drive: any;
  private config: SheetsConfig;
  private templates: Map<string, ReportTemplate> = new Map();
  private reportCache: Map<string, any> = new Map();

  constructor(config: SheetsConfig) {
    this.config = SheetsConfigSchema.parse(config);
    this.initializeAuth();
    this.setupDefaultTemplates();
  }

  private initializeAuth(): void {
    const credentials = {
      client_email: this.config.credentials?.client_email || process.env.GOOGLE_CLIENT_EMAIL,
      private_key: this.config.credentials?.private_key?.replace(/\\n/g, '\n') || process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      project_id: this.config.credentials?.project_id || process.env.GOOGLE_PROJECT_ID,
    };

    if (!credentials.client_email || !credentials.private_key) {
      throw new Error('Google Sheets credentials not configured');
    }

    this.auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: this.config.scopes,
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  private setupDefaultTemplates(): void {
    // Financial report template
    const financialTemplate: ReportTemplate = {
      id: 'financial-summary',
      name: 'Financial Summary Report',
      description: 'Monthly financial performance report',
      type: 'financial',
      structure: {
        sheets: [
          {
            name: 'Revenue Summary',
            headers: ['Month', 'Revenue', 'Expenses', 'Profit', 'Margin %'],
            dataMapping: {
              'Month': 'period',
              'Revenue': 'totalRevenue',
              'Expenses': 'totalExpenses',
              'Profit': 'netProfit',
              'Margin %': 'profitMargin',
            },
            formatting: {
              headerStyle: {
                backgroundColor: { red: 0.2, green: 0.6, blue: 0.9 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
              },
            },
          },
          {
            name: 'Expense Breakdown',
            headers: ['Category', 'Amount', 'Percentage', 'Budget', 'Variance'],
            dataMapping: {
              'Category': 'category',
              'Amount': 'amount',
              'Percentage': 'percentage',
              'Budget': 'budgetAmount',
              'Variance': 'variance',
            },
          },
        ],
        charts: [
          {
            title: 'Revenue vs Expenses Trend',
            type: 'line',
            dataRange: 'Revenue Summary!A:E',
            position: { sheet: 'Revenue Summary', row: 20, column: 1 },
          },
        ],
      },
    };

    // Operational report template
    const operationalTemplate: ReportTemplate = {
      id: 'operational-dashboard',
      name: 'Operational Dashboard',
      description: 'Real-time operational metrics',
      type: 'operational',
      structure: {
        sheets: [
          {
            name: 'KPI Summary',
            headers: ['Metric', 'Current Value', 'Target', 'Status', 'Trend'],
            dataMapping: {
              'Metric': 'name',
              'Current Value': 'currentValue',
              'Target': 'targetValue',
              'Status': 'status',
              'Trend': 'trend',
            },
          },
          {
            name: 'Production Data',
            headers: ['Date', 'Units Produced', 'Quality Score', 'Efficiency %', 'Downtime (hrs)'],
            dataMapping: {
              'Date': 'date',
              'Units Produced': 'unitsProduced',
              'Quality Score': 'qualityScore',
              'Efficiency %': 'efficiency',
              'Downtime (hrs)': 'downtime',
            },
          },
        ],
      },
    };

    this.templates.set(financialTemplate.id, financialTemplate);
    this.templates.set(operationalTemplate.id, operationalTemplate);
  }

  // Core export functionality
  public async exportData(params: {
    spreadsheetId: string;
    sheetName: string;
    data: any[];
    headers?: string[];
    range?: string;
    formatting?: any;
    clearExisting?: boolean;
  }): Promise<{ success: boolean; rowsAdded: number; range: string }> {
    try {
      // Prepare data with headers
      const sheetData = [];
      if (params.headers) {
        sheetData.push(params.headers);
      }
      sheetData.push(...params.data);

      // Clear existing data if requested
      if (params.clearExisting) {
        await this.clearSheet(params.spreadsheetId, params.sheetName);
      }

      // Determine range
      const range = params.range || `${params.sheetName}!A1`;

      // Write data
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: params.spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: sheetData,
        },
      });

      // Apply formatting if provided
      if (params.formatting) {
        await this.applyFormatting(params.spreadsheetId, params.sheetName, params.formatting);
      }

      return {
        success: true,
        rowsAdded: sheetData.length,
        range: response.data.updatedRange || range,
      };
    } catch (error) {
      throw new Error(`Failed to export data: ${error.message}`);
    }
  }

  // Create comprehensive reports
  public async createReport(params: {
    templateId: string;
    data: Record<string, any>;
    title?: string;
    format: 'sheets' | 'pdf' | 'csv';
    recipients?: string[];
    schedule?: string;
  }): Promise<{ reportId: string; url: string; exportUrls?: Record<string, string> }> {
    const template = this.templates.get(params.templateId);
    if (!template) {
      throw new Error(`Template not found: ${params.templateId}`);
    }

    const reportId = `report_${Date.now()}`;
    const title = params.title || `${template.name} - ${new Date().toISOString().split('T')[0]}`;

    // Create new spreadsheet
    const spreadsheet = await this.sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
        sheets: template.structure.sheets.map(sheet => ({
          properties: {
            title: sheet.name,
          },
        })),
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;

    // Populate each sheet with data
    for (const sheetConfig of template.structure.sheets) {
      const sheetData = this.mapDataToSheet(params.data, sheetConfig);
      
      await this.exportData({
        spreadsheetId,
        sheetName: sheetConfig.name,
        data: sheetData.rows,
        headers: sheetConfig.headers,
        formatting: sheetConfig.formatting,
      });
    }

    // Add charts if defined
    if (template.structure.charts) {
      await this.addCharts(spreadsheetId, template.structure.charts);
    }

    // Generate export URLs for different formats
    const exportUrls: Record<string, string> = {};
    
    if (params.format === 'pdf' || params.format === 'csv') {
      exportUrls.pdf = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf`;
      exportUrls.csv = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
    }

    // Share with recipients if specified
    if (params.recipients?.length) {
      await this.shareReport(spreadsheetId, params.recipients);
    }

    // Cache report info
    this.reportCache.set(reportId, {
      spreadsheetId,
      templateId: params.templateId,
      createdAt: new Date(),
      title,
      format: params.format,
    });

    return {
      reportId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      exportUrls,
    };
  }

  // Template management
  public async createTemplate(template: Omit<ReportTemplate, 'id'>): Promise<string> {
    const templateId = `template_${Date.now()}`;
    const fullTemplate: ReportTemplate = {
      id: templateId,
      ...template,
    };

    this.templates.set(templateId, fullTemplate);
    return templateId;
  }

  public getTemplate(templateId: string): ReportTemplate | undefined {
    return this.templates.get(templateId);
  }

  public listTemplates(): Array<{ id: string; name: string; type: string }> {
    return Array.from(this.templates.values()).map(template => ({
      id: template.id,
      name: template.name,
      type: template.type,
    }));
  }

  // Automated reporting
  public async scheduleReport(params: {
    templateId: string;
    schedule: string; // cron format
    dataSource: string;
    recipients: string[];
    format: 'sheets' | 'pdf' | 'csv';
  }): Promise<{ scheduleId: string }> {
    const scheduleId = `schedule_${Date.now()}`;
    
    // In a real implementation, this would integrate with a job scheduler
    
    return { scheduleId };
  }

  // Data visualization
  private async addCharts(spreadsheetId: string, charts: any[]): Promise<void> {
    const requests = charts.map(chart => ({
      addChart: {
        chart: {
          spec: {
            title: chart.title,
            [chart.type + 'Chart']: this.buildChartSpec(chart),
          },
          position: {
            overlayPosition: {
              anchorCell: {
                sheetId: 0, // This should be dynamic based on sheet
                rowIndex: chart.position.row,
                columnIndex: chart.position.column,
              },
            },
          },
        },
      },
    }));

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests,
      },
    });
  }

  private buildChartSpec(chart: any): any {
    // Build chart specification based on type
    switch (chart.type) {
      case 'line':
        return {
          basicChart: {
            chartType: 'LINE',
            axis: [
              { position: 'BOTTOM_AXIS', title: 'Time' },
              { position: 'LEFT_AXIS', title: 'Value' },
            ],
          },
        };
      case 'bar':
        return {
          basicChart: {
            chartType: 'COLUMN',
          },
        };
      case 'pie':
        return {
          pieChart: {},
        };
      default:
        return {
          basicChart: {
            chartType: 'LINE',
          },
        };
    }
  }

  // Data transformation utilities
  private mapDataToSheet(data: Record<string, any>, sheetConfig: any): { rows: any[][] } {
    const rows: any[][] = [];

    // Extract and transform data based on mapping
    if (Array.isArray(data[sheetConfig.name.toLowerCase().replace(' ', '_')])) {
      const sheetData = data[sheetConfig.name.toLowerCase().replace(' ', '_')];
      
      for (const item of sheetData) {
        const row = sheetConfig.headers.map(header => {
          const mapping = sheetConfig.dataMapping[header];
          return item[mapping] || '';
        });
        rows.push(row);
      }
    }

    return { rows };
  }

  // Formatting and styling
  private async applyFormatting(spreadsheetId: string, sheetName: string, formatting: any): Promise<void> {
    const sheetId = await this.getSheetId(spreadsheetId, sheetName);
    
    const requests = [];

    // Apply header formatting
    if (formatting.headerStyle) {
      requests.push({
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: formatting.headerStyle,
          },
          fields: 'userEnteredFormat',
        },
      });
    }

    // Apply conditional formatting
    if (formatting.conditionalFormatting) {
      for (const rule of formatting.conditionalFormatting) {
        requests.push({
          addConditionalFormatRule: {
            rule,
            index: 0,
          },
        });
      }
    }

    if (requests.length > 0) {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests,
        },
      });
    }
  }

  // Utility methods
  private async getSheetId(spreadsheetId: string, sheetName: string): Promise<number> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
    return sheet?.properties?.sheetId || 0;
  }

  private async clearSheet(spreadsheetId: string, sheetName: string): Promise<void> {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: sheetName,
    });
  }

  private async shareReport(spreadsheetId: string, recipients: string[]): Promise<void> {
    for (const email of recipients) {
      await this.drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          role: 'reader',
          type: 'user',
          emailAddress: email,
        },
        sendNotificationEmail: true,
      });
    }
  }

  // Batch operations
  public async exportMultipleReports(reports: Array<{
    templateId: string;
    data: Record<string, any>;
    title?: string;
    recipients?: string[];
  }>): Promise<Array<{ reportId: string; url: string; success: boolean; error?: string }>> {
    const results = [];

    for (const reportConfig of reports) {
      try {
        const result = await this.createReport({
          ...reportConfig,
          format: 'sheets',
        });
        results.push({
          reportId: result.reportId,
          url: result.url,
          success: true,
        });
      } catch (error) {
        results.push({
          reportId: `failed_${Date.now()}`,
          url: '',
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  // Real-time updates
  public async enableRealTimeUpdates(params: {
    spreadsheetId: string;
    dataSource: string;
    refreshInterval: number; // in minutes
  }): Promise<{ updateId: string }> {
    const updateId = `update_${Date.now()}`;
    
    // In a real implementation, this would set up webhooks or polling
    
    return { updateId };
  }

  // Analytics and monitoring
  public async getMetrics(): Promise<{
    totalReports: number;
    reportsThisMonth: number;
    templates: number;
    scheduledReports: number;
    apiUsage: {
      requests: number;
      quotaRemaining: number;
    };
  }> {
    return {
      totalReports: this.reportCache.size,
      reportsThisMonth: Array.from(this.reportCache.values()).filter(
        report => report.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      templates: this.templates.size,
      scheduledReports: 0, // Would track from scheduler
      apiUsage: {
        requests: 0, // Would track API calls
        quotaRemaining: 1000, // Would check Google API quotas
      },
    };
  }

  public async healthCheck(): Promise<boolean> {
    try {
      // Test authentication and API access
      await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'Health Check Test',
          },
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  // Data import from Sheets
  public async importData(params: {
    spreadsheetId: string;
    range: string;
    hasHeaders?: boolean;
  }): Promise<{ headers?: string[]; data: any[][] }> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: params.spreadsheetId,
      range: params.range,
    });

    const values = response.data.values || [];
    
    if (params.hasHeaders && values.length > 0) {
      return {
        headers: values[0],
        data: values.slice(1),
      };
    }

    return {
      data: values,
    };
  }

  // Collaboration features
  public async addCollaborator(params: {
    spreadsheetId: string;
    email: string;
    role: 'reader' | 'writer' | 'owner';
    notify?: boolean;
  }): Promise<{ permissionId: string }> {
    const permission = await this.drive.permissions.create({
      fileId: params.spreadsheetId,
      requestBody: {
        role: params.role,
        type: 'user',
        emailAddress: params.email,
      },
      sendNotificationEmail: params.notify !== false,
    });

    return { permissionId: permission.data.id };
  }
}

// Export types
export type {
  SheetsConfig,
  ReportTemplate,
};