// Enhanced Report Templates with Professional Styling

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'technical' | 'executive' | 'compliance' | 'operational';
  sections: ReportSection[];
  styling: ReportStyling;
  charts: ChartTemplate[];
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'data' | 'chart' | 'table' | 'text' | 'image' | 'kpi';
  content: any;
  styling?: SectionStyling;
}

export interface ReportStyling {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  layout: 'modern' | 'classic' | 'minimal' | 'corporate';
  branding: boolean;
}

export interface SectionStyling {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  headerStyle?: 'gradient' | 'solid' | 'outlined';
}

export interface ChartTemplate {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter' | 'heatmap';
  title: string;
  dataSource: string;
  styling: ChartStyling;
}

export interface ChartStyling {
  colorScheme: string[];
  showLegend: boolean;
  showGrid: boolean;
  animations: boolean;
  responsive: boolean;
}

// Professional Report Templates
export const PROFESSIONAL_TEMPLATES: Record<string, ReportTemplate> = {
  // Investment Due Diligence Report
  investment_due_diligence: {
    id: 'investment_due_diligence',
    name: 'Investment Due Diligence Report',
    description: 'Comprehensive financial analysis for investors and stakeholders',
    category: 'financial',
    styling: {
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      accentColor: '#10b981',
      fontFamily: 'Inter, sans-serif',
      layout: 'corporate',
      branding: true
    },
    sections: [
      {
        id: 'cover',
        title: 'Cover Page',
        type: 'summary',
        content: {
          template: 'executive_cover',
          includeLogos: true,
          confidentialityLevel: 'Confidential'
        }
      },
      {
        id: 'executive_summary',
        title: 'Executive Summary',
        type: 'summary',
        content: {
          keyMetrics: ['roi', 'payback_period', 'irr', 'npv'],
          riskAssessment: true,
          recommendations: true
        },
        styling: {
          headerStyle: 'gradient',
          backgroundColor: '#f8fafc'
        }
      },
      {
        id: 'financial_overview',
        title: 'Financial Performance Overview',
        type: 'kpi',
        content: {
          kpiCards: [
            { metric: 'Total Revenue', format: 'currency', trend: true },
            { metric: 'Net Income', format: 'currency', trend: true },
            { metric: 'EBITDA', format: 'currency', trend: true },
            { metric: 'Operating Margin', format: 'percentage', trend: true }
          ]
        }
      },
      {
        id: 'revenue_analysis',
        title: 'Revenue Analysis',
        type: 'chart',
        content: {
          chartType: 'line',
          title: 'Revenue Trend Analysis',
          dataSource: 'monthly_revenue',
          showProjections: true
        }
      },
      {
        id: 'balance_sheet',
        title: 'Balance Sheet Analysis',
        type: 'table',
        content: {
          tableType: 'financial',
          columns: ['Asset/Liability', 'Current Year', 'Previous Year', 'Change %'],
          formatting: 'currency',
          highlighting: true
        }
      },
      {
        id: 'cash_flow',
        title: 'Cash Flow Analysis',
        type: 'chart',
        content: {
          chartType: 'bar',
          title: 'Operating Cash Flow',
          dataSource: 'cash_flow_data',
          stackedView: true
        }
      },
      {
        id: 'risk_assessment',
        title: 'Risk Assessment Matrix',
        type: 'chart',
        content: {
          chartType: 'heatmap',
          title: 'Risk vs Impact Analysis',
          dataSource: 'risk_matrix',
          colorScale: ['#22c55e', '#eab308', '#ef4444']
        }
      },
      {
        id: 'investment_metrics',
        title: 'Investment Metrics',
        type: 'table',
        content: {
          tableType: 'metrics',
          includeFormulas: true,
          scenarios: ['conservative', 'base', 'optimistic']
        }
      },
      {
        id: 'recommendations',
        title: 'Investment Recommendations',
        type: 'text',
        content: {
          format: 'structured',
          includeActionItems: true,
          priorityLevels: true
        }
      }
    ],
    charts: [
      {
        id: 'revenue_chart',
        type: 'line',
        title: 'Revenue Trend & Projections',
        dataSource: 'financialPerformance.revenue',
        styling: {
          colorScheme: ['#3b82f6', '#10b981', '#f59e0b'],
          showLegend: true,
          showGrid: true,
          animations: true,
          responsive: true
        }
      },
      {
        id: 'profitability_chart',
        type: 'bar',
        title: 'Profitability Analysis',
        dataSource: 'financialPerformance.profitability',
        styling: {
          colorScheme: ['#1e40af', '#3b82f6', '#60a5fa'],
          showLegend: true,
          showGrid: true,
          animations: true,
          responsive: true
        }
      }
    ]
  },

  // TCO Analysis Report
  tco_analysis: {
    id: 'tco_analysis',
    name: 'Total Cost of Ownership Analysis',
    description: 'Comprehensive cost analysis for equipment and infrastructure investments',
    category: 'financial',
    styling: {
      primaryColor: '#7c3aed',
      secondaryColor: '#a855f7',
      accentColor: '#06b6d4',
      fontFamily: 'Inter, sans-serif',
      layout: 'modern',
      branding: true
    },
    sections: [
      {
        id: 'tco_summary',
        title: 'TCO Summary Dashboard',
        type: 'kpi',
        content: {
          kpiCards: [
            { metric: 'Total Cost of Ownership', format: 'currency' },
            { metric: 'Capital Expenses', format: 'currency' },
            { metric: 'Operating Expenses (Annual)', format: 'currency' },
            { metric: 'Payback Period', format: 'time' },
            { metric: 'ROI', format: 'percentage' },
            { metric: 'NPV', format: 'currency' }
          ]
        }
      },
      {
        id: 'cost_breakdown',
        title: 'Cost Breakdown Analysis',
        type: 'chart',
        content: {
          chartType: 'pie',
          title: 'Total Cost Distribution',
          dataSource: 'cost_categories'
        }
      },
      {
        id: 'capex_analysis',
        title: 'Capital Expenditure Analysis',
        type: 'table',
        content: {
          tableType: 'detailed',
          groupBy: 'category',
          totals: true,
          formatting: 'currency'
        }
      },
      {
        id: 'opex_projections',
        title: 'Operating Expense Projections',
        type: 'chart',
        content: {
          chartType: 'line',
          title: '10-Year Operating Cost Projection',
          dataSource: 'opex_projections',
          showTrends: true
        }
      },
      {
        id: 'roi_analysis',
        title: 'Return on Investment Analysis',
        type: 'chart',
        content: {
          chartType: 'line',
          title: 'Cumulative ROI Over Time',
          dataSource: 'roi_timeline'
        }
      }
    ],
    charts: [
      {
        id: 'tco_breakdown',
        type: 'doughnut',
        title: 'TCO Breakdown by Category',
        dataSource: 'tcoData.breakdown',
        styling: {
          colorScheme: ['#7c3aed', '#a855f7', '#c084fc', '#ddd6fe'],
          showLegend: true,
          showGrid: false,
          animations: true,
          responsive: true
        }
      }
    ]
  },

  // Technical Specification Report
  technical_specs: {
    id: 'technical_specs',
    name: 'Technical Specification Report',
    description: 'Detailed technical documentation and specifications',
    category: 'technical',
    styling: {
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      accentColor: '#f59e0b',
      fontFamily: 'Inter, sans-serif',
      layout: 'minimal',
      branding: true
    },
    sections: [
      {
        id: 'system_overview',
        title: 'System Overview',
        type: 'summary',
        content: {
          includeImages: true,
          technicalDiagrams: true
        }
      },
      {
        id: 'specifications',
        title: 'Technical Specifications',
        type: 'table',
        content: {
          tableType: 'specifications',
          groupBy: 'component',
          includeUnits: true
        }
      },
      {
        id: 'performance_metrics',
        title: 'Performance Metrics',
        type: 'chart',
        content: {
          chartType: 'radar',
          title: 'System Performance Profile',
          dataSource: 'performance_data'
        }
      }
    ],
    charts: []
  },

  // Executive Presentation
  executive_presentation: {
    id: 'executive_presentation',
    name: 'Executive Presentation',
    description: 'High-level executive summary for leadership and board presentations',
    category: 'executive',
    styling: {
      primaryColor: '#dc2626',
      secondaryColor: '#ef4444',
      accentColor: '#f97316',
      fontFamily: 'Inter, sans-serif',
      layout: 'corporate',
      branding: true
    },
    sections: [
      {
        id: 'exec_summary',
        title: 'Executive Summary',
        type: 'summary',
        content: {
          bulletPoints: true,
          keyTakeaways: true,
          callToAction: true
        }
      },
      {
        id: 'key_metrics',
        title: 'Key Performance Indicators',
        type: 'kpi',
        content: {
          largeFormat: true,
          comparisons: true,
          targets: true
        }
      },
      {
        id: 'strategic_recommendations',
        title: 'Strategic Recommendations',
        type: 'text',
        content: {
          prioritized: true,
          timeline: true,
          resourceRequirements: true
        }
      }
    ],
    charts: []
  }
};

// Chart Color Schemes
export const COLOR_SCHEMES = {
  corporate: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
  modern: ['#7c3aed', '#a855f7', '#c084fc', '#ddd6fe', '#ede9fe'],
  nature: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  energy: ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca'],
  neutral: ['#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6']
};

// Professional Styling Presets
export const STYLING_PRESETS = {
  corporate: {
    layout: 'corporate' as const,
    typography: {
      headingFont: 'Inter, sans-serif',
      bodyFont: 'Inter, sans-serif',
      headingSize: '24px',
      bodySize: '14px'
    },
    spacing: {
      sectionGap: '32px',
      paragraphGap: '16px',
      lineHeight: '1.6'
    },
    borders: {
      radius: '8px',
      width: '1px',
      style: 'solid'
    }
  },
  modern: {
    layout: 'modern' as const,
    typography: {
      headingFont: 'Inter, sans-serif',
      bodyFont: 'Inter, sans-serif',
      headingSize: '28px',
      bodySize: '15px'
    },
    spacing: {
      sectionGap: '40px',
      paragraphGap: '20px',
      lineHeight: '1.7'
    },
    borders: {
      radius: '12px',
      width: '2px',
      style: 'solid'
    }
  },
  minimal: {
    layout: 'minimal' as const,
    typography: {
      headingFont: 'Inter, sans-serif',
      bodyFont: 'Inter, sans-serif',
      headingSize: '22px',
      bodySize: '13px'
    },
    spacing: {
      sectionGap: '24px',
      paragraphGap: '12px',
      lineHeight: '1.5'
    },
    borders: {
      radius: '4px',
      width: '1px',
      style: 'solid'
    }
  }
};

// Report Generation Helper Functions
export function getTemplateById(templateId: string): ReportTemplate | null {
  return PROFESSIONAL_TEMPLATES[templateId] || null;
}

export function getTemplatesByCategory(category: string): ReportTemplate[] {
  return Object.values(PROFESSIONAL_TEMPLATES).filter(
    template => template.category === category
  );
}

export function generateReportStructure(templateId: string, data: any) {
  const template = getTemplateById(templateId);
  if (!template) return null;

  return {
    template,
    sections: template.sections.map(section => ({
      ...section,
      processedContent: processContentData(section, data)
    })),
    styling: template.styling,
    charts: template.charts.map(chart => ({
      ...chart,
      data: extractChartData(chart.dataSource, data)
    }))
  };
}

function processContentData(section: ReportSection, data: any) {
  switch (section.type) {
    case 'kpi':
      return processKPIData(section.content, data);
    case 'chart':
      return processChartData(section.content, data);
    case 'table':
      return processTableData(section.content, data);
    default:
      return section.content;
  }
}

function processKPIData(content: any, data: any) {
  return content.kpiCards?.map((kpi: any) => ({
    ...kpi,
    value: extractMetricValue(kpi.metric, data),
    trend: kpi.trend ? calculateTrend(kpi.metric, data) : null
  }));
}

function processChartData(content: any, data: any) {
  return {
    ...content,
    data: extractChartData(content.dataSource, data)
  };
}

function processTableData(content: any, data: any) {
  return {
    ...content,
    rows: extractTableData(content.dataSource, data)
  };
}

function extractMetricValue(metric: string, data: any): string {
  // Extract metric value from data based on metric name
  const metricPath = metric.toLowerCase().replace(/\s+/g, '_');
  return getNestedValue(data, metricPath) || 'N/A';
}

function calculateTrend(metric: string, data: any): number {
  // Calculate trend percentage for the metric
  // This would implement trend calculation logic
  return 0;
}

function extractChartData(dataSource: string, data: any): any {
  // Extract chart data from the data source path
  return getNestedValue(data, dataSource) || [];
}

function extractTableData(dataSource: string, data: any): any[] {
  // Extract table data from the data source path
  return getNestedValue(data, dataSource) || [];
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}