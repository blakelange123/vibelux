import jsPDF from 'jspdf'
import 'jspdf-autotable'
import type { AdvancedFixtureData } from './ppfd-calculations-advanced'
import { calculatePPFDGrid, calculatePPFDStats, calculateDLI } from './ppfd-calculations'

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface ReportData {
  projectName: string
  clientName?: string
  location?: string
  roomDimensions: {
    width: number
    length: number
    height: number
  }
  fixtures: Array<{
    brand: string
    model: string
    wattage: number
    ppf: number
    efficacy: number
    position: { x: number; y: number }
    enabled: boolean
    dimensions?: { length: number; width: number; height: number }
  }>
  ppfdAnalysis?: {
    min: number
    max: number
    avg: number
    uniformity: number
    dli: number
  }
  electricalAnalysis?: {
    totalPower: number
    circuitsRequired: number
    estimatedCost: number
  }
  roi?: {
    initialCost: number
    annualSavings: number
    paybackPeriod: number
  }
}

export class PDFReportGenerator {
  private pdf: jsPDF
  private pageHeight = 297 // A4 height in mm
  private pageWidth = 210 // A4 width in mm
  private margin = 20
  private currentY = 20
  private primaryColor = { r: 139, g: 92, b: 246 } // Purple
  private secondaryColor = { r: 34, g: 197, b: 94 } // Green

  constructor(private options?: {
    companyName?: string
    companyLogo?: string
    hideBranding?: boolean
    primaryColor?: { r: number; g: number; b: number }
    customHeader?: string
    customFooter?: string
  }) {
    this.pdf = new jsPDF('p', 'mm', 'a4')
    if (options?.primaryColor) {
      this.primaryColor = options.primaryColor
    }
  }

  generateReport(data: ReportData): void {
    this.addCoverPage(data)
    this.addExecutiveSummary(data)
    this.addRoomLayout(data)
    this.addFixtureDetails(data)
    this.addPPFDAnalysis(data)
    this.addElectricalAnalysis(data)
    this.addROIAnalysis(data)
    this.addAppendix(data)
    
    // Save the PDF
    const filename = `${data.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    this.pdf.save(filename)
  }

  private addCoverPage(data: ReportData): void {
    // Background gradient
    this.addGradientBackground()
    
    // Company branding
    const companyName = this.options?.companyName || 'Vibelux'
    this.pdf.setFontSize(32)
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.text(companyName, this.pageWidth / 2, 40, { align: 'center' })
    
    // Report title
    this.pdf.setFontSize(24)
    this.pdf.text('Professional Lighting Design Report', this.pageWidth / 2, 60, { align: 'center' })
    
    // Project details box
    this.pdf.setFillColor(255, 255, 255)
    this.pdf.roundedRect(30, 90, 150, 80, 3, 3, 'F')
    
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(14)
    this.pdf.text('Project Details', 40, 105)
    
    this.pdf.setFontSize(12)
    this.pdf.text(`Project: ${data.projectName}`, 40, 120)
    if (data.clientName) {
      this.pdf.text(`Client: ${data.clientName}`, 40, 130)
    }
    if (data.location) {
      this.pdf.text(`Location: ${data.location}`, 40, 140)
    }
    this.pdf.text(`Date: ${new Date().toLocaleDateString()}`, 40, 150)
    
    // Key metrics preview
    this.pdf.setFillColor(this.primaryColor.r, this.primaryColor.g, this.primaryColor.b)
    this.pdf.roundedRect(30, 190, 150, 60, 3, 3, 'F')
    
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(14)
    this.pdf.text('Key Metrics', 40, 205)
    
    this.pdf.setFontSize(12)
    const totalPower = data.fixtures.reduce((sum, f) => sum + (f.enabled ? f.wattage : 0), 0)
    const totalPPF = data.fixtures.reduce((sum, f) => sum + (f.enabled ? f.ppf : 0), 0)
    this.pdf.text(`Total Power: ${totalPower.toLocaleString()}W`, 40, 220)
    this.pdf.text(`Total PPF: ${totalPPF.toLocaleString()} μmol/s`, 40, 230)
    if (data.ppfdAnalysis) {
      this.pdf.text(`Average PPFD: ${data.ppfdAnalysis.avg} μmol/m²/s`, 40, 240)
    }
    
    this.pdf.addPage()
  }

  private addExecutiveSummary(data: ReportData): void {
    this.currentY = 20
    this.addSectionHeader('Executive Summary')
    
    const summaryText = [
      `This lighting design report provides a comprehensive analysis for ${data.projectName}.`,
      `The design includes ${data.fixtures.filter(f => f.enabled).length} fixtures covering a ${data.roomDimensions.width}m × ${data.roomDimensions.length}m growing area.`,
      '',
      'Key Findings:',
      `• Total installed power: ${data.fixtures.reduce((sum, f) => sum + (f.enabled ? f.wattage : 0), 0).toLocaleString()}W`,
      `• Average PPFD at canopy: ${data.ppfdAnalysis?.avg || 'N/A'} μmol/m²/s`,
      `• Light uniformity: ${data.ppfdAnalysis?.uniformity || 'N/A'}`,
      `• Daily Light Integral (18hr): ${data.ppfdAnalysis?.dli || 'N/A'} mol/m²/day`
    ]
    
    this.pdf.setFontSize(11)
    this.pdf.setTextColor(60, 60, 60)
    summaryText.forEach(line => {
      if (line) {
        this.pdf.text(line, this.margin, this.currentY)
      }
      this.currentY += 8
    })
    
    // Add recommendation box
    this.currentY += 10
    this.pdf.setFillColor(245, 245, 245)
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 40, 3, 3, 'F')
    
    this.pdf.setFontSize(12)
    this.pdf.setTextColor(this.primaryColor.r, this.primaryColor.g, this.primaryColor.b)
    this.pdf.text('Recommendation', this.margin + 5, this.currentY + 10)
    
    this.pdf.setFontSize(10)
    this.pdf.setTextColor(60, 60, 60)
    const recommendation = this.getRecommendation(data)
    this.wrapText(recommendation, this.margin + 5, this.currentY + 20, this.pageWidth - 2 * this.margin - 10)
    
    this.pdf.addPage()
  }

  private addRoomLayout(data: ReportData): void {
    this.currentY = 20
    this.addSectionHeader('Room Layout & Fixture Placement')
    
    // Room dimensions info
    this.pdf.setFontSize(11)
    this.pdf.setTextColor(60, 60, 60)
    this.pdf.text(`Room Dimensions: ${data.roomDimensions.width}m × ${data.roomDimensions.length}m × ${data.roomDimensions.height}m`, this.margin, this.currentY)
    this.currentY += 10
    
    // Draw room layout (top view)
    const scale = Math.min(
      (this.pageWidth - 2 * this.margin) / data.roomDimensions.width,
      100 / data.roomDimensions.length
    ) * 0.8
    
    const roomWidth = data.roomDimensions.width * scale
    const roomLength = data.roomDimensions.length * scale
    const offsetX = (this.pageWidth - roomWidth) / 2
    
    // Room outline
    this.pdf.setDrawColor(100, 100, 100)
    this.pdf.setLineWidth(0.5)
    this.pdf.rect(offsetX, this.currentY, roomWidth, roomLength)
    
    // Grid lines
    this.pdf.setDrawColor(200, 200, 200)
    this.pdf.setLineWidth(0.1)
    for (let i = 1; i < data.roomDimensions.width; i++) {
      const x = offsetX + i * scale
      this.pdf.line(x, this.currentY, x, this.currentY + roomLength)
    }
    for (let i = 1; i < data.roomDimensions.length; i++) {
      const y = this.currentY + i * scale
      this.pdf.line(offsetX, y, offsetX + roomWidth, y)
    }
    
    // Draw fixtures
    data.fixtures.forEach(fixture => {
      if (fixture.enabled) {
        const x = offsetX + (fixture.position.x / 100) * roomWidth
        const y = this.currentY + (fixture.position.y / 100) * roomLength
        
        // Fixture rectangle
        this.pdf.setFillColor(this.primaryColor.r, this.primaryColor.g, this.primaryColor.b)
        const fixtureWidth = (fixture.dimensions?.length || 1) * scale
        const fixtureHeight = (fixture.dimensions?.width || 0.3) * scale
        this.pdf.rect(x - fixtureWidth/2, y - fixtureHeight/2, fixtureWidth, fixtureHeight, 'F')
      }
    })
    
    this.currentY += roomLength + 20
    
    // Add scale reference
    this.pdf.setFontSize(10)
    this.pdf.setTextColor(100, 100, 100)
    this.pdf.text(`Scale: 1:${Math.round(1/scale * 10)}`, offsetX, this.currentY)
    
    this.pdf.addPage()
  }

  private addFixtureDetails(data: ReportData): void {
    this.currentY = 20
    this.addSectionHeader('Fixture Specifications')
    
    // Group fixtures by model
    const fixtureGroups = data.fixtures.reduce((acc, fixture) => {
      const key = `${fixture.brand} ${fixture.model}`
      if (!acc[key]) {
        acc[key] = {
          model: fixture,
          count: 0,
          enabledCount: 0
        }
      }
      acc[key].count++
      if (fixture.enabled) acc[key].enabledCount++
      return acc
    }, {} as Record<string, { model: any; count: number; enabledCount: number }>)
    
    // Create fixture table
    const tableData: string[][] = Object.entries(fixtureGroups).map(([key, group]) => [
      key,
      group.count.toString(),
      group.enabledCount.toString(),
      `${group.model.wattage}W`,
      `${group.model.ppf} μmol/s`,
      `${group.model.efficacy} μmol/J`,
      `${(group.enabledCount * group.model.wattage).toLocaleString()}W`
    ]);
    
    (this.pdf as any).autoTable({
      head: [['Fixture Model', 'Qty', 'Active', 'Power/Unit', 'PPF/Unit', 'Efficacy', 'Total Power']],
      body: tableData,
      startY: this.currentY,
      theme: 'grid',
      headStyles: {
        fillColor: [this.primaryColor.r, this.primaryColor.g, this.primaryColor.b],
        textColor: 255
      },
      styles: {
        fontSize: 10
      }
    })
    
    this.pdf.addPage()
  }

  private addPPFDAnalysis(data: ReportData): void {
    this.currentY = 20
    this.addSectionHeader('PPFD Analysis')
    
    if (!data.ppfdAnalysis) {
      this.pdf.setFontSize(11)
      this.pdf.setTextColor(100, 100, 100)
      this.pdf.text('PPFD analysis data not available', this.margin, this.currentY)
      return
    }
    
    // PPFD metrics cards
    const cardWidth = (this.pageWidth - 2 * this.margin - 20) / 4
    const cards = [
      { label: 'Min PPFD', value: `${data.ppfdAnalysis.min}`, unit: 'μmol/m²/s', color: { r: 239, g: 68, b: 68 } },
      { label: 'Avg PPFD', value: `${data.ppfdAnalysis.avg}`, unit: 'μmol/m²/s', color: { r: 251, g: 191, b: 36 } },
      { label: 'Max PPFD', value: `${data.ppfdAnalysis.max}`, unit: 'μmol/m²/s', color: { r: 34, g: 197, b: 94 } },
      { label: 'Uniformity', value: `${data.ppfdAnalysis.uniformity}`, unit: 'min/avg', color: { r: 139, g: 92, b: 246 } }
    ]
    
    cards.forEach((card, i) => {
      const x = this.margin + i * (cardWidth + 5)
      
      // Card background
      this.pdf.setFillColor(245, 245, 245)
      this.pdf.roundedRect(x, this.currentY, cardWidth, 30, 3, 3, 'F')
      
      // Card content
      this.pdf.setFontSize(9)
      this.pdf.setTextColor(100, 100, 100)
      this.pdf.text(card.label, x + cardWidth/2, this.currentY + 8, { align: 'center' })
      
      this.pdf.setFontSize(16)
      this.pdf.setTextColor(card.color.r, card.color.g, card.color.b)
      this.pdf.text(card.value, x + cardWidth/2, this.currentY + 18, { align: 'center' })
      
      this.pdf.setFontSize(8)
      this.pdf.setTextColor(150, 150, 150)
      this.pdf.text(card.unit, x + cardWidth/2, this.currentY + 25, { align: 'center' })
    })
    
    this.currentY += 40
    
    // DLI calculation
    this.pdf.setFontSize(12)
    this.pdf.setTextColor(60, 60, 60)
    this.pdf.text('Daily Light Integral (DLI)', this.margin, this.currentY)
    this.currentY += 10
    
    const dliData: string[][] = [
      ['12 hours', `${(data.ppfdAnalysis.dli * 12/18).toFixed(1)} mol/m²/day`],
      ['16 hours', `${(data.ppfdAnalysis.dli * 16/18).toFixed(1)} mol/m²/day`],
      ['18 hours', `${data.ppfdAnalysis.dli} mol/m²/day`],
      ['20 hours', `${(data.ppfdAnalysis.dli * 20/18).toFixed(1)} mol/m²/day`]
    ];
    
    (this.pdf as any).autoTable({
      head: [['Photoperiod', 'DLI']],
      body: dliData,
      startY: this.currentY,
      theme: 'striped',
      styles: { fontSize: 10 }
    })
    
    this.pdf.addPage()
  }

  private addElectricalAnalysis(data: ReportData): void {
    this.currentY = 20
    this.addSectionHeader('Electrical Requirements')
    
    const totalPower = data.fixtures.reduce((sum, f) => sum + (f.enabled ? f.wattage : 0), 0)
    const voltage = 240 // Assume 240V
    const totalAmps = totalPower / voltage
    const circuitsRequired = Math.ceil(totalAmps / 20) // 20A circuits
    
    const electricalData: string[][] = [
      ['Total Connected Load', `${totalPower.toLocaleString()}W`],
      ['Voltage', `${voltage}V`],
      ['Total Current', `${totalAmps.toFixed(1)}A`],
      ['20A Circuits Required', circuitsRequired.toString()],
      ['Power Factor', '0.95 (typical LED)'],
      ['Recommended Panel Size', `${Math.ceil(circuitsRequired * 1.25 * 20)}A`]
    ];
    
    (this.pdf as any).autoTable({
      body: electricalData,
      startY: this.currentY,
      theme: 'plain',
      styles: { fontSize: 11 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 60 }
      }
    })
    
    // Add energy cost estimate
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 20
    this.pdf.setFontSize(12)
    this.pdf.setTextColor(60, 60, 60)
    this.pdf.text('Energy Cost Estimate', this.margin, this.currentY)
    this.currentY += 10
    
    const kwhPerDay = totalPower * 18 / 1000 // 18hr photoperiod
    const costPerKwh = 0.12 // $0.12/kWh average
    const dailyCost = kwhPerDay * costPerKwh
    
    const costData: string[][] = [
      ['Daily Energy (18hr)', `${kwhPerDay.toFixed(1)} kWh`],
      ['Daily Cost', `$${dailyCost.toFixed(2)}`],
      ['Monthly Cost', `$${(dailyCost * 30).toFixed(2)}`],
      ['Annual Cost', `$${(dailyCost * 365).toFixed(2)}`]
    ];
    
    (this.pdf as any).autoTable({
      body: costData,
      startY: this.currentY,
      theme: 'plain',
      styles: { fontSize: 11 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 60 }
      }
    })
  }

  private addROIAnalysis(data: ReportData): void {
    if (!data.roi) return
    
    this.pdf.addPage()
    this.currentY = 20
    this.addSectionHeader('Return on Investment Analysis')
    
    // ROI metrics
    const roiData: string[][] = [
      ['Initial Investment', `$${data.roi.initialCost.toLocaleString()}`],
      ['Annual Energy Savings', `$${data.roi.annualSavings.toLocaleString()}`],
      ['Simple Payback Period', `${data.roi.paybackPeriod.toFixed(1)} years`],
      ['10-Year Net Savings', `$${(data.roi.annualSavings * 10 - data.roi.initialCost).toLocaleString()}`]
    ];
    
    (this.pdf as any).autoTable({
      body: roiData,
      startY: this.currentY,
      theme: 'plain',
      styles: { fontSize: 11 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 60 }
      }
    })
  }

  private addAppendix(data: ReportData): void {
    this.pdf.addPage()
    this.currentY = 20
    this.addSectionHeader('Appendix')
    
    // Disclaimer
    this.pdf.setFontSize(10)
    this.pdf.setTextColor(100, 100, 100)
    const disclaimer = [
      'Disclaimer:',
      'This report is based on theoretical calculations and manufacturer specifications.',
      'Actual performance may vary based on environmental conditions, installation quality,',
      'and other factors. Professional installation and commissioning recommended.'
    ]
    
    disclaimer.forEach(line => {
      this.pdf.text(line, this.margin, this.currentY)
      this.currentY += 6
    })
    
    // Footer
    if (!this.options?.hideBranding) {
      this.currentY = this.pageHeight - 30
      this.pdf.setFontSize(9)
      this.pdf.setTextColor(150, 150, 150)
      const footer = this.options?.customFooter || 
        `Generated by ${this.options?.companyName || 'Vibelux'} - Professional Horticultural Lighting Platform`
      this.pdf.text(footer, this.pageWidth / 2, this.currentY, { align: 'center' })
    }
  }

  private addSectionHeader(title: string): void {
    this.pdf.setFontSize(18)
    this.pdf.setTextColor(this.primaryColor.r, this.primaryColor.g, this.primaryColor.b)
    this.pdf.text(title, this.margin, this.currentY)
    this.currentY += 15
  }

  private addGradientBackground(): void {
    // Simple gradient effect with rectangles using color lightening
    for (let i = 0; i < 10; i++) {
      const factor = 1 - (i / 10) * 0.9 // Keep some color
      this.pdf.setFillColor(
        Math.min(255, this.primaryColor.r + (255 - this.primaryColor.r) * (1 - factor)),
        Math.min(255, this.primaryColor.g + (255 - this.primaryColor.g) * (1 - factor)),
        Math.min(255, this.primaryColor.b + (255 - this.primaryColor.b) * (1 - factor))
      )
      this.pdf.rect(0, i * 30, this.pageWidth, 30, 'F')
    }
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number): void {
    const lines = this.pdf.splitTextToSize(text, maxWidth)
    lines.forEach((line: string, i: number) => {
      this.pdf.text(line, x, y + i * 5)
    })
  }

  private getRecommendation(data: ReportData): string {
    const avgPPFD = data.ppfdAnalysis?.avg || 0
    const uniformity = data.ppfdAnalysis?.uniformity || 0
    
    if (avgPPFD < 400) {
      return 'Light levels are below optimal for most crops. Consider adding more fixtures or using higher output models.'
    } else if (avgPPFD > 1000) {
      return 'Light levels exceed requirements for most crops. Consider reducing fixture count or implementing dimming controls.'
    } else if (uniformity < 0.7) {
      return 'Light uniformity needs improvement. Redistribute fixtures for more even coverage.'
    } else {
      return 'The lighting design meets industry standards for commercial cultivation. System is well-optimized for crop production.'
    }
  }
}