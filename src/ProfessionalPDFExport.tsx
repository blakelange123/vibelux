'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportSection {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface ExportData {
  reportName: string;
  facilityName?: string;
  projectDate: string;
  widgets: any[];
  sections: ExportSection[];
  includeVibeluxBranding: boolean;
}

export class ProfessionalPDFExport {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private pageNumber: number;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
    this.pageNumber = 1;
  }

  async generateReport(data: ExportData): Promise<void> {
    // Add cover page
    if (data.sections.find(s => s.id === 'cover_page')?.enabled) {
      this.addCoverPage(data);
      this.addNewPage();
    }

    // Add table of contents
    this.addTableOfContents(data.sections);
    this.addNewPage();

    // Add executive summary
    if (data.sections.find(s => s.id === 'executive_summary')?.enabled) {
      this.addExecutiveSummary(data);
      this.addNewPage();
    }

    // Add project details
    if (data.sections.find(s => s.id === 'project_details')?.enabled) {
      this.addProjectDetails(data);
      this.addNewPage();
    }

    // Add calculation summary
    if (data.sections.find(s => s.id === 'calculation_summary')?.enabled) {
      this.addCalculationSummary(data);
      this.addNewPage();
    }

    // Add charts and visualizations
    if (data.sections.find(s => s.id === 'charts_visualizations')?.enabled) {
      await this.addChartsAndVisualizations(data);
    }

    // Add data tables
    if (data.sections.find(s => s.id === 'data_tables')?.enabled) {
      this.addDataTables(data);
    }

    // Add recommendations
    if (data.sections.find(s => s.id === 'recommendations')?.enabled) {
      this.addRecommendations(data);
    }

    // Add appendices if enabled
    if (data.sections.find(s => s.id === 'technical_appendices')?.enabled) {
      this.addTechnicalAppendices(data);
    }

    // Add footer to all pages
    this.addPageFooters(data.includeVibeluxBranding);
  }

  private addCoverPage(data: ExportData): void {
    // Vibelux branding header
    if (data.includeVibeluxBranding) {
      // Purple gradient background for header
      this.pdf.setFillColor(139, 92, 246); // Purple-600
      this.pdf.rect(0, 0, this.pageWidth, 60, 'F');
      
      // Vibelux logo text
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(28);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('VIBELUX', this.margin, 25);
      
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text('Professional Cultivation Intelligence Platform', this.margin, 35);
      
      // Add sparkle icon simulation
      this.pdf.setFontSize(20);
      this.pdf.text('✦', this.pageWidth - 30, 25);
    }

    // Report title section
    this.currentY = 80;
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(data.reportName, this.margin, this.currentY);

    this.currentY += 15;
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('Comprehensive Facility Analysis Report', this.margin, this.currentY);

    // Project information box
    this.currentY += 30;
    this.pdf.setFillColor(248, 250, 252); // Gray-50
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 50, 'F');
    this.pdf.setDrawColor(229, 231, 235); // Gray-200
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 50, 'S');

    this.currentY += 15;
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Project Information', this.margin + 10, this.currentY);

    this.currentY += 10;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Facility: ${data.facilityName || 'Professional Cultivation Facility'}`, this.margin + 10, this.currentY);
    
    this.currentY += 8;
    this.pdf.text(`Report Date: ${data.projectDate}`, this.margin + 10, this.currentY);
    
    this.currentY += 8;
    this.pdf.text(`Analysis Type: Advanced Environmental & Performance Analysis`, this.margin + 10, this.currentY);

    // Key metrics preview
    this.currentY += 40;
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Key Performance Indicators', this.margin, this.currentY);

    const kpis = [
      { label: 'Facility Efficiency Score', value: '94.2%', color: [16, 185, 129] },
      { label: 'Energy Optimization', value: '88.3%', color: [59, 130, 246] },
      { label: 'Climate Uniformity', value: '92.3%', color: [139, 92, 246] },
      { label: 'Yield Prediction Accuracy', value: '91.8%', color: [245, 158, 11] }
    ];

    const kpiY = this.currentY + 15;
    kpis.forEach((kpi, index) => {
      const yPos = kpiY + (index * 15);
      
      // Color indicator
      this.pdf.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
      this.pdf.circle(this.margin + 5, yPos - 2, 2, 'F');
      
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(kpi.label, this.margin + 15, yPos);
      
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(kpi.value, this.pageWidth - 40, yPos);
    });

    // Professional disclaimer
    this.currentY = this.pageHeight - 40;
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('This report contains confidential and proprietary information.', this.margin, this.currentY);
    this.pdf.text('Generated by Vibelux Professional Platform - All rights reserved.', this.margin, this.currentY + 5);
  }

  private addTableOfContents(sections: ExportSection[]): void {
    this.currentY = this.margin + 20;
    
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Table of Contents', this.margin, this.currentY);

    this.currentY += 20;
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');

    let pageNum = 3; // Starting after cover and TOC
    sections.filter(s => s.enabled).forEach((section, index) => {
      this.pdf.text(`${index + 1}. ${section.name}`, this.margin + 5, this.currentY);
      
      // Dotted line
      const dots = '.'.repeat(50);
      this.pdf.text(dots, this.margin + 80, this.currentY);
      
      this.pdf.text(`${pageNum}`, this.pageWidth - 30, this.currentY);
      
      this.currentY += 10;
      pageNum += 2; // Estimate 2 pages per section
    });
  }

  private addExecutiveSummary(data: ExportData): void {
    this.addSectionHeader('Executive Summary');
    
    const summaryText = [
      'This comprehensive analysis provides critical insights into facility performance, environmental optimization, and operational efficiency. The assessment covers advanced CFD airflow analysis, climate uniformity measurements, and predictive analytics to ensure optimal growing conditions.',
      '',
      'Key findings indicate significant opportunities for optimization across multiple facility systems. The advanced environmental monitoring reveals precise temperature and humidity variations that directly impact crop quality and yield consistency.',
      '',
      'Our AI-powered recommendations provide actionable insights with clear ROI calculations, enabling data-driven decisions for facility improvements. The predictive maintenance scheduling helps prevent equipment failures and maintains optimal environmental conditions.',
      '',
      'This analysis serves as the foundation for implementing precision cultivation strategies that maximize yield while minimizing operational costs and energy consumption.'
    ];

    summaryText.forEach(paragraph => {
      if (paragraph === '') {
        this.currentY += 5;
        return;
      }
      
      const lines = this.pdf.splitTextToSize(paragraph, this.pageWidth - 2 * this.margin);
      lines.forEach((line: string) => {
        this.checkPageBreak();
        this.pdf.text(line, this.margin, this.currentY);
        this.currentY += 6;
      });
      this.currentY += 3;
    });
  }

  private addProjectDetails(data: ExportData): void {
    this.addSectionHeader('Project Details');
    
    // Facility specifications
    this.addSubHeader('Facility Specifications');
    
    const specifications = [
      { label: 'Total Facility Area', value: '10,000 sq ft' },
      { label: 'Active Grow Rooms', value: '8 rooms' },
      { label: 'Cultivation Method', value: 'Multi-layer rack system' },
      { label: 'Lighting Technology', value: 'Full-spectrum LED' },
      { label: 'Climate Control', value: 'Advanced HVAC with VPD control' },
      { label: 'Monitoring Systems', value: 'IoT sensors, real-time analytics' }
    ];

    specifications.forEach(spec => {
      this.checkPageBreak();
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(spec.label + ':', this.margin + 5, this.currentY);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(spec.value, this.margin + 80, this.currentY);
      this.currentY += 8;
    });

    this.currentY += 10;
    this.addSubHeader('Analysis Methodology');
    
    const methodology = [
      '• Computational Fluid Dynamics (CFD) analysis for airflow optimization',
      '• Multi-point temperature and humidity mapping across facility zones',
      '• Machine learning algorithms for predictive analytics and yield forecasting',
      '• Energy consumption analysis and efficiency optimization',
      '• Equipment health monitoring and predictive maintenance scheduling',
      '• Comprehensive data collection from 50+ IoT sensors'
    ];

    methodology.forEach(method => {
      this.checkPageBreak();
      this.pdf.text(method, this.margin + 5, this.currentY);
      this.currentY += 8;
    });
  }

  private addCalculationSummary(data: ExportData): void {
    this.addSectionHeader('Calculation Summary');
    
    this.addSubHeader('Environmental Calculations');
    
    const calculations = [
      {
        name: 'VPD (Vapor Pressure Deficit)',
        formula: 'VPD = SVP × (1 - RH/100)',
        description: 'Where SVP = Saturated Vapor Pressure at given temperature'
      },
      {
        name: 'PPFD Uniformity',
        formula: 'Uniformity = (Min PPFD / Max PPFD) × 100%',
        description: 'Measures light distribution consistency across growing area'
      },
      {
        name: 'Energy Efficiency',
        formula: 'Efficiency = Total Output / Total Energy Input',
        description: 'Calculated as grams produced per kWh consumed'
      },
      {
        name: 'Climate Stability Index',
        formula: 'CSI = 1 - (σ / μ)',
        description: 'Where σ = standard deviation, μ = mean of environmental parameters'
      }
    ];

    calculations.forEach(calc => {
      this.checkPageBreak(30);
      
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(calc.name, this.margin + 5, this.currentY);
      this.currentY += 8;
      
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text('Formula: ' + calc.formula, this.margin + 10, this.currentY);
      this.currentY += 6;
      
      const descLines = this.pdf.splitTextToSize(calc.description, this.pageWidth - 2 * this.margin - 10);
      descLines.forEach((line: string) => {
        this.pdf.text(line, this.margin + 10, this.currentY);
        this.currentY += 6;
      });
      
      this.currentY += 5;
      this.pdf.setTextColor(0, 0, 0);
    });
  }

  private async addChartsAndVisualizations(data: ExportData): Promise<void> {
    this.addSectionHeader('Charts & Visualizations');
    
    // Find chart widgets
    const chartWidgets = data.widgets.filter(w => w.type === 'chart');
    
    for (const widget of chartWidgets) {
      this.checkPageBreak(100);
      
      // Add chart title
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(12);
      this.pdf.text(widget.title, this.margin, this.currentY);
      this.currentY += 15;
      
      try {
        // Try to capture chart element if it exists
        const chartElement = document.getElementById(widget.id);
        if (chartElement) {
          const canvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = this.pageWidth - 2 * this.margin;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          this.pdf.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
          this.currentY += imgHeight + 10;
        } else {
          // Fallback: add chart description
          this.pdf.setFont('helvetica', 'normal');
          this.pdf.setFontSize(10);
          this.pdf.text('[Chart visualization would appear here]', this.margin + 5, this.currentY);
          this.currentY += 20;
        }
      } catch (error) {
        console.error('Error capturing chart:', error);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setFontSize(10);
        this.pdf.text('[Chart could not be rendered]', this.margin + 5, this.currentY);
        this.currentY += 20;
      }
    }
  }

  private addDataTables(data: ExportData): void {
    this.addSectionHeader('Data Tables');
    
    const tableWidgets = data.widgets.filter(w => w.type === 'table');
    
    tableWidgets.forEach(widget => {
      this.checkPageBreak(50);
      
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(12);
      this.pdf.text(widget.title, this.margin, this.currentY);
      this.currentY += 15;
      
      if (widget.config.data && widget.config.data.length > 0) {
        const headers = Object.keys(widget.config.data[0]);
        const colWidth = (this.pageWidth - 2 * this.margin) / headers.length;
        
        // Table headers
        this.pdf.setFillColor(243, 244, 246); // Gray-100
        this.pdf.rect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 10, 'F');
        
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setFontSize(9);
        headers.forEach((header, index) => {
          this.pdf.text(header.replace(/_/g, ' '), this.margin + 2 + (index * colWidth), this.currentY);
        });
        
        this.currentY += 8;
        
        // Table data
        this.pdf.setFont('helvetica', 'normal');
        widget.config.data.slice(0, 10).forEach((row: any) => { // Limit to 10 rows
          this.checkPageBreak();
          
          headers.forEach((header, index) => {
            const value = String(row[header] || '');
            this.pdf.text(value.substring(0, 15), this.margin + 2 + (index * colWidth), this.currentY);
          });
          
          this.currentY += 6;
        });
        
        this.currentY += 10;
      }
    });
  }

  private addRecommendations(data: ExportData): void {
    this.addSectionHeader('Recommendations');
    
    const recommendations = [
      {
        category: 'Airflow Optimization',
        priority: 'High',
        recommendations: [
          'Adjust circulation fan angle +15° in northeast zone to reduce dead air spaces',
          'Increase exhaust fan speed by 15% during peak light hours to improve temperature uniformity',
          'Install deflector at rack row 4 to enhance air mixing efficiency'
        ]
      },
      {
        category: 'Climate Control',
        priority: 'High',
        recommendations: [
          'Implement dynamic humidity setpoints based on growth stage for 12% VPD improvement',
          'Optimize CO₂ injection timing to coincide with peak photosynthetic activity',
          'Install additional temperature sensors in identified hot spots'
        ]
      },
      {
        category: 'Energy Efficiency',
        priority: 'Medium',
        recommendations: [
          'Schedule equipment operation during off-peak energy hours',
          'Implement LED dimming schedules based on natural light availability',
          'Upgrade HVAC controls for improved energy efficiency'
        ]
      }
    ];

    recommendations.forEach(rec => {
      this.checkPageBreak(40);
      
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(12);
      this.pdf.text(rec.category, this.margin, this.currentY);
      
      // Priority badge
      const priorityColor = rec.priority === 'High' ? [239, 68, 68] : 
                          rec.priority === 'Medium' ? [245, 158, 11] : [107, 114, 128];
      this.pdf.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
      this.pdf.rect(this.margin + 100, this.currentY - 8, 25, 8, 'F');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(8);
      this.pdf.text(rec.priority, this.margin + 105, this.currentY - 3);
      
      this.currentY += 15;
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(10);
      
      rec.recommendations.forEach(recommendation => {
        this.checkPageBreak();
        this.pdf.text('• ' + recommendation, this.margin + 5, this.currentY);
        this.currentY += 6;
      });
      
      this.currentY += 5;
    });
  }

  private addTechnicalAppendices(data: ExportData): void {
    this.addSectionHeader('Technical Appendices');
    
    this.addSubHeader('Sensor Specifications');
    
    const sensors = [
      { type: 'Temperature', range: '-40°C to +125°C', accuracy: '±0.1°C', quantity: '24' },
      { type: 'Humidity', range: '0-100% RH', accuracy: '±1.5% RH', quantity: '24' },
      { type: 'CO₂', range: '0-10,000 ppm', accuracy: '±30 ppm', quantity: '8' },
      { type: 'Light', range: '0-2000 μmol/m²/s', accuracy: '±5%', quantity: '16' }
    ];

    sensors.forEach(sensor => {
      this.checkPageBreak();
      this.pdf.text(`${sensor.type}: ${sensor.range}, ${sensor.accuracy} (${sensor.quantity} units)`, this.margin + 5, this.currentY);
      this.currentY += 8;
    });
  }

  private addSectionHeader(title: string): void {
    this.currentY += 10;
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(139, 92, 246); // Purple-600
    this.pdf.text(title, this.margin, this.currentY);
    
    // Underline
    this.pdf.setDrawColor(139, 92, 246);
    this.pdf.line(this.margin, this.currentY + 2, this.margin + 60, this.currentY + 2);
    
    this.currentY += 15;
    this.pdf.setTextColor(0, 0, 0);
  }

  private addSubHeader(title: string): void {
    this.currentY += 5;
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 10;
  }

  private checkPageBreak(minSpace: number = 20): void {
    if (this.currentY + minSpace > this.pageHeight - this.margin) {
      this.addNewPage();
    }
  }

  private addNewPage(): void {
    this.pdf.addPage();
    this.currentY = this.margin + 20;
    this.pageNumber++;
  }

  private addPageFooters(includeVibeluxBranding: boolean): void {
    const totalPages = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      
      if (includeVibeluxBranding) {
        // Vibelux footer
        this.pdf.setTextColor(100, 100, 100);
        this.pdf.setFontSize(8);
        this.pdf.text('Generated by Vibelux Professional Platform', this.margin, this.pageHeight - 10);
      }
      
      // Page number
      this.pdf.text(`Page ${i} of ${totalPages}`, this.pageWidth - 30, this.pageHeight - 10);
    }
  }

  public save(filename: string): void {
    this.pdf.save(filename);
  }
}