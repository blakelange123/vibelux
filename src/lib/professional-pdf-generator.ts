import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Chart as ChartJS, registerables, ChartConfiguration } from 'chart.js';

ChartJS.register(...registerables);

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ProfessionalReportData {
  project: {
    name: string;
    client: string;
    consultant: string;
    date: string;
    location: string;
    type: string;
    version: string;
  };
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    companyName: string;
    website: string;
    email: string;
    phone: string;
  };
  executiveSummary: {
    overview: string;
    keyFindings: Array<{
      metric: string;
      value: string;
      status: 'excellent' | 'good' | 'adequate' | 'needs_attention';
      description: string;
    }>;
    recommendations: string[];
    investmentSummary: {
      totalCost: number;
      roi: number;
      paybackPeriod: number;
      energySavings: number;
    };
  };
  technicalData: any;
  financialData: any;
  chartData: any;
}

export class ProfessionalPDFGenerator {
  private pdf: jsPDF;
  private data: ProfessionalReportData;
  private pageNumber: number = 1;
  private margin = 20;
  private pageWidth: number;
  private pageHeight: number;
  private primaryColor: string;
  private secondaryColor: string;
  private accentColor: string;

  constructor(data: ProfessionalReportData) {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.data = data;
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.primaryColor = data.branding.primaryColor;
    this.secondaryColor = data.branding.secondaryColor;
    this.accentColor = data.branding.accentColor;
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  }

  private addPageHeader(title: string = '') {
    // Header background
    const [r, g, b] = this.hexToRgb(this.primaryColor);
    this.pdf.setFillColor(r, g, b);
    this.pdf.rect(0, 0, this.pageWidth, 25, 'F');

    // Company logo area
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(this.margin, 5, 60, 15, 'F');

    // Company name
    this.pdf.setTextColor(33, 37, 41);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(this.data.branding.companyName, this.margin + 2, 15);

    // Page title
    if (title) {
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(14);
      this.pdf.text(title, this.margin + 70, 15);
    }

    // Page number
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(10);
    this.pdf.text(`Page ${this.pageNumber}`, this.pageWidth - 30, 15);
  }

  private addPageFooter() {
    const footerY = this.pageHeight - 15;
    
    // Footer line
    const [r, g, b] = this.hexToRgb(this.secondaryColor);
    this.pdf.setDrawColor(r, g, b);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, footerY, this.pageWidth - this.margin, footerY);

    // Footer text
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.setFontSize(8);
    this.pdf.text(`${this.data.branding.companyName} | ${this.data.branding.website} | ${this.data.branding.phone}`, 
                  this.margin, footerY + 5);

    // Confidential notice
    this.pdf.text('CONFIDENTIAL - This report contains proprietary information', 
                  this.pageWidth - 80, footerY + 5);
  }

  private addCoverPage() {
    // Cover background gradient effect
    const [r1, g1, b1] = this.hexToRgb(this.primaryColor);
    const [r2, g2, b2] = this.hexToRgb(this.secondaryColor);
    
    // Create gradient background
    for (let i = 0; i < 200; i++) {
      const ratio = i / 200;
      const r = Math.round(r1 + (r2 - r1) * ratio);
      const g = Math.round(g1 + (g2 - g1) * ratio);
      const b = Math.round(b1 + (b2 - b1) * ratio);
      
      this.pdf.setFillColor(r, g, b);
      this.pdf.rect(0, i, this.pageWidth, 1, 'F');
    }

    // Company logo area (large)
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.roundedRect(this.margin, 30, this.pageWidth - 2 * this.margin, 40, 5, 5, 'F');
    
    // Company name (large)
    this.pdf.setTextColor(33, 37, 41);
    this.pdf.setFontSize(28);
    this.pdf.setFont('helvetica', 'bold');
    const companyNameWidth = this.pdf.getTextWidth(this.data.branding.companyName);
    this.pdf.text(this.data.branding.companyName, (this.pageWidth - companyNameWidth) / 2, 55);

    // Report title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    const titleWidth = this.pdf.getTextWidth(this.data.project.name);
    this.pdf.text(this.data.project.name, (this.pageWidth - titleWidth) / 2, 120);

    // Subtitle
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'normal');
    const subtitleText = `${this.data.project.type} Analysis Report`;
    const subtitleWidth = this.pdf.getTextWidth(subtitleText);
    this.pdf.text(subtitleText, (this.pageWidth - subtitleWidth) / 2, 135);

    // Project details box
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.roundedRect(this.margin, 160, this.pageWidth - 2 * this.margin, 60, 5, 5, 'F');
    
    this.pdf.setTextColor(33, 37, 41);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    
    const details = [
      ['Client:', this.data.project.client],
      ['Location:', this.data.project.location],
      ['Date:', this.data.project.date],
      ['Consultant:', this.data.project.consultant],
      ['Version:', this.data.project.version]
    ];

    details.forEach(([label, value], index) => {
      const y = 175 + index * 10;
      this.pdf.text(label, this.margin + 10, y);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(value, this.margin + 50, y);
      this.pdf.setFont('helvetica', 'bold');
    });

    // Professional disclaimer
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.setFontSize(8);
    this.pdf.text('This report has been prepared by qualified professionals using industry-standard methods and software.',
                  this.margin, this.pageHeight - 20);
  }

  private addExecutiveSummary() {
    this.pdf.addPage();
    this.pageNumber++;
    this.addPageHeader('Executive Summary');

    let yPos = 40;

    // Overview section
    this.pdf.setTextColor(33, 37, 41);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Project Overview', this.margin, yPos);
    yPos += 10;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    const overviewLines = this.pdf.splitTextToSize(this.data.executiveSummary.overview, this.pageWidth - 2 * this.margin);
    this.pdf.text(overviewLines, this.margin, yPos);
    yPos += overviewLines.length * 4 + 15;

    // Key Performance Indicators
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Key Performance Indicators', this.margin, yPos);
    yPos += 15;

    // KPI Cards
    this.data.executiveSummary.keyFindings.forEach((finding, index) => {
      const cardX = this.margin + (index % 2) * 85;
      const cardY = yPos + Math.floor(index / 2) * 35;
      
      // Status color
      let statusColor: [number, number, number];
      switch (finding.status) {
        case 'excellent': statusColor = [34, 197, 94]; break;
        case 'good': statusColor = [59, 130, 246]; break;
        case 'adequate': statusColor = [251, 191, 36]; break;
        case 'needs_attention': statusColor = [239, 68, 68]; break;
      }

      // Card background
      this.pdf.setFillColor(248, 250, 252);
      this.pdf.roundedRect(cardX, cardY, 80, 30, 3, 3, 'F');

      // Status indicator
      this.pdf.setFillColor(...statusColor);
      this.pdf.roundedRect(cardX + 2, cardY + 2, 4, 26, 2, 2, 'F');

      // Metric name
      this.pdf.setTextColor(33, 37, 41);
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(finding.metric, cardX + 10, cardY + 8);

      // Value
      this.pdf.setFontSize(14);
      this.pdf.setTextColor(...statusColor);
      this.pdf.text(finding.value, cardX + 10, cardY + 18);

      // Description
      this.pdf.setFontSize(7);
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.setFont('helvetica', 'normal');
      const descLines = this.pdf.splitTextToSize(finding.description, 65);
      this.pdf.text(descLines, cardX + 10, cardY + 24);
    });

    yPos += Math.ceil(this.data.executiveSummary.keyFindings.length / 2) * 35 + 15;

    // Investment Summary
    this.pdf.setTextColor(33, 37, 41);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Investment Summary', this.margin, yPos);
    yPos += 15;

    const investmentData = [
      ['Total Investment', `$${this.data.executiveSummary.investmentSummary.totalCost.toLocaleString()}`],
      ['Return on Investment', `${this.data.executiveSummary.investmentSummary.roi}%`],
      ['Payback Period', `${this.data.executiveSummary.investmentSummary.paybackPeriod} years`],
      ['Annual Energy Savings', `$${this.data.executiveSummary.investmentSummary.energySavings.toLocaleString()}`]
    ];

    this.pdf.autoTable({
      startY: yPos,
      head: [['Metric', 'Value']],
      body: investmentData,
      theme: 'grid',
      headStyles: {
        fillColor: this.hexToRgb(this.primaryColor),
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [33, 37, 41]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.addPageFooter();
  }

  private addVisualizationPage(title: string, chartConfig: ChartConfiguration) {
    this.pdf.addPage();
    this.pageNumber++;
    this.addPageHeader(title);

    // Create a canvas for the chart
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const chart = new ChartJS(ctx, {
        ...chartConfig,
        options: {
          ...chartConfig.options,
          responsive: false,
          animation: false,
          plugins: {
            ...chartConfig.options?.plugins,
            legend: {
              display: true,
              position: 'bottom'
            }
          }
        }
      });

      // Convert chart to image and add to PDF
      setTimeout(() => {
        const imgData = canvas.toDataURL('image/png');
        this.pdf.addImage(imgData, 'PNG', this.margin, 50, 
                         this.pageWidth - 2 * this.margin, 
                         (this.pageWidth - 2 * this.margin) * 0.5);
        chart.destroy();
      }, 100);
    }

    this.addPageFooter();
  }

  private addTechnicalSpecifications() {
    this.pdf.addPage();
    this.pageNumber++;
    this.addPageHeader('Technical Specifications');

    const yPos = 40;

    // Technical data table
    if (this.data.technicalData && this.data.technicalData.specifications) {
      this.pdf.autoTable({
        startY: yPos,
        head: [['Parameter', 'Value', 'Unit', 'Notes']],
        body: this.data.technicalData.specifications.map((spec: any) => [
          spec.parameter,
          spec.value,
          spec.unit || '',
          spec.notes || ''
        ]),
        theme: 'striped',
        headStyles: {
          fillColor: this.hexToRgb(this.primaryColor),
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [33, 37, 41]
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30, halign: 'right' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 60 }
        },
        margin: { left: this.margin, right: this.margin }
      });
    }

    this.addPageFooter();
  }

  private addRecommendations() {
    this.pdf.addPage();
    this.pageNumber++;
    this.addPageHeader('Recommendations');

    let yPos = 40;

    this.pdf.setTextColor(33, 37, 41);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Professional Recommendations', this.margin, yPos);
    yPos += 15;

    this.data.executiveSummary.recommendations.forEach((recommendation, index) => {
      // Recommendation number
      const [r, g, b] = this.hexToRgb(this.accentColor);
      this.pdf.setFillColor(r, g, b);
      this.pdf.circle(this.margin + 5, yPos + 2, 3, 'F');
      
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text((index + 1).toString(), this.margin + 3.5, yPos + 3);

      // Recommendation text
      this.pdf.setTextColor(33, 37, 41);
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      const recLines = this.pdf.splitTextToSize(recommendation, this.pageWidth - this.margin - 20);
      this.pdf.text(recLines, this.margin + 15, yPos + 3);
      
      yPos += recLines.length * 4 + 8;
    });

    this.addPageFooter();
  }

  private addAppendix() {
    this.pdf.addPage();
    this.pageNumber++;
    this.addPageHeader('Appendix');

    let yPos = 40;

    // Methodology section
    this.pdf.setTextColor(33, 37, 41);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Methodology & Standards', this.margin, yPos);
    yPos += 10;

    const methodology = [
      'This analysis was conducted using industry-standard calculation methods.',
      'All photometric calculations comply with IES (Illuminating Engineering Society) standards.',
      'Energy calculations are based on local utility rates and operating schedules.',
      'Financial projections use standard accounting principles and industry benchmarks.',
      'All recommendations are based on best practices and professional experience.'
    ];

    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    methodology.forEach(line => {
      this.pdf.text(`• ${line}`, this.margin, yPos);
      yPos += 6;
    });

    yPos += 10;

    // Contact information
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Contact Information', this.margin, yPos);
    yPos += 10;

    const contactInfo = [
      `Company: ${this.data.branding.companyName}`,
      `Email: ${this.data.branding.email}`,
      `Phone: ${this.data.branding.phone}`,
      `Website: ${this.data.branding.website}`
    ];

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    contactInfo.forEach(line => {
      this.pdf.text(line, this.margin, yPos);
      yPos += 6;
    });

    this.addPageFooter();
  }

  public generateReport(): jsPDF {
    this.addCoverPage();
    this.addExecutiveSummary();
    
    // Add technical sections
    this.addTechnicalSpecifications();
    
    // Add visualizations if chart data is available
    if (this.data.chartData) {
      Object.entries(this.data.chartData).forEach(([title, config]) => {
        this.addVisualizationPage(title, config as ChartConfiguration);
      });
    }
    
    this.addRecommendations();
    this.addAppendix();

    return this.pdf;
  }

  public save(filename: string = 'professional-report.pdf') {
    this.generateReport();
    this.pdf.save(filename);
  }

  public getBlob(): Blob {
    this.generateReport();
    return this.pdf.output('blob');
  }

  public getBase64(): string {
    this.generateReport();
    return this.pdf.output('datauristring');
  }
}