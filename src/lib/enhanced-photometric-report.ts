import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Chart as ChartJS, registerables } from 'chart.js'
import html2canvas from 'html2canvas'

// Register Chart.js components
ChartJS.register(...registerables)

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: { finalY: number }
  }
}

export interface PhotometricReportData {
  // Project Information
  project: {
    name: string
    client: {
      name: string
      contact: string
      company: string
    }
    consultant: {
      name: string
      company: string
      license?: string
    }
    location: {
      address: string
      city: string
      state: string
      country: string
      latitude?: number
      longitude?: number
    }
    date: Date
    version: string
  }

  // Facility Details
  facility: {
    type: 'greenhouse' | 'indoor_farm' | 'warehouse' | 'research'
    dimensions: {
      length: number
      width: number
      height: number
      area: number
      volume: number
      canopyArea: number
      canopyHeight: number
    }
    environment: {
      ambientLight: boolean
      glazingTransmittance?: number
      reflectance: {
        ceiling: number
        walls: number
        floor: number
      }
    }
  }

  // Crop Information
  crops: Array<{
    name: string
    scientificName?: string
    growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting'
    ppfdRequirements: {
      min: number
      target: number
      max: number
    }
    dliRequirements: {
      min: number
      target: number
      max: number
    }
    photoperiod: number
    specialRequirements?: string[]
  }>

  // Lighting System
  lighting: {
    fixtures: Array<{
      id: string
      brand: string
      model: string
      quantity: number
      specifications: {
        wattage: number
        ppf: number
        efficacy: number
        inputVoltage: string
        powerFactor: number
        thd: number
        lifetime: number
        warranty: number
        certifications: string[]
      }
      photometry: {
        distribution: 'lambertian' | 'batwing' | 'narrow' | 'wide'
        beamAngle: number
        fieldAngle: number
        iesFile?: string
        customIES?: boolean
      }
      spectrum: {
        data: { [wavelength: string]: number }
        metrics: {
          parPercentage: number
          bluePercentage: number
          greenPercentage: number
          redPercentage: number
          farRedPercentage: number
          uvPercentage?: number
          redFarRedRatio: number
          blueRedRatio: number
          blueGreenRatio: number
        }
        quality: {
          cri?: number
          r9?: number
          tm30?: {
            rf: number
            rg: number
          }
        }
      }
      mounting: {
        height: number
        tilt: number
        orientation: number
        spacing: {
          x: number
          y: number
        }
      }
      controls: {
        dimmable: boolean
        dimmingProtocol?: string
        currentDimLevel: number
        zones?: string[]
      }
    }>
    
    layout: {
      pattern: 'grid' | 'staggered' | 'custom'
      rows: number
      columns: number
      totalFixtures: number
      fixtureGroups: Array<{
        name: string
        fixtures: string[]
        control: 'independent' | 'grouped'
      }>
    }

    electrical: {
      totalConnectedLoad: number
      demandFactor: number
      totalDemand: number
      voltage: number
      phases: 1 | 3
      circuitBreakers: Array<{
        size: number
        quantity: number
        fixtures: number
      }>
      cableSchedule: Array<{
        run: string
        length: number
        size: string
        voltageDrop: number
      }>
      panels: Array<{
        name: string
        capacity: number
        utilization: number
      }>
    }
  }

  // Photometric Calculations
  calculations: {
    method: 'point-by-point' | 'zonal-cavity' | 'coefficient'
    gridSpacing: number
    calculationHeight: number
    maintenanceFactor: number
    
    results: {
      ppfd: {
        average: number
        minimum: number
        maximum: number
        standardDeviation: number
        cv: number // Coefficient of Variation
        uniformity: {
          minToAvg: number
          minToMax: number
          avgToMax: number
        }
        distribution: number[][]
        histogram: Array<{
          range: string
          count: number
          percentage: number
        }>
      }
      
      dli: {
        values: { [hours: string]: number }
        distribution: { [hours: string]: number[][] }
      }
      
      coverage: {
        totalArea: number
        coveredArea: number
        percentage: number
        areasBelow: Array<{
          threshold: number
          area: number
          percentage: number
        }>
      }
      
      powerMetrics: {
        installedPowerDensity: number // W/sq ft
        effectivePowerDensity: number // W/sq ft at dimmed levels
        ppfdPerWatt: number
        annualEnergyUse: number // kWh
        energyPerMol: number // kWh/mol
      }
    }

    compliance: {
      standards: Array<{
        name: string
        organization: string
        requirements: Array<{
          parameter: string
          required: string | number
          actual: string | number
          status: 'pass' | 'fail' | 'warning'
          notes?: string
        }>
      }>
      overallStatus: 'compliant' | 'non-compliant' | 'conditional'
    }
  }

  // Environmental Integration
  environmental: {
    hvacIntegration: {
      heatLoad: number // BTU/hr
      sensibleHeat: number
      latentHeat: number
      coolingRequired: number // tons
      airflowRequired: number // CFM
    }
    
    sustainability: {
      carbonFootprint: {
        annual: number // kg CO2
        perUnit: number // kg CO2 per unit produced
      }
      renewableEnergy: {
        percentage: number
        source?: string
      }
      waterUsage?: {
        condensate: number // gallons/year
        savings: number
      }
    }
  }

  // Financial Analysis
  financial: {
    capital: {
      fixtures: number
      installation: number
      electrical: number
      controls: number
      design: number
      total: number
    }
    
    operating: {
      energyCost: {
        daily: number
        monthly: number
        annual: number
        rate: number // $/kWh
      }
      maintenance: {
        annual: number
        lampReplacement?: number
        cleaning: number
      }
      total: number
    }
    
    roi: {
      simplePayback: number // years
      npv: number
      irr: number
      lcoe: number // $/mol
      comparison?: {
        baseline: string
        savings: number
        percentImprovement: number
      }
    }
  }

  // Quality Assurance
  qa: {
    measurements?: Array<{
      location: string
      measured: number
      calculated: number
      deviation: number
    }>
    calibration: {
      meter: string
      date: Date
      certificate?: string
    }
    validation: {
      method: string
      date: Date
      technician: string
    }
  }

  // Recommendations
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    optimization: Array<{
      parameter: string
      current: string | number
      recommended: string | number
      benefit: string
      cost?: string
    }>
  }

  // Appendices
  appendices: {
    calculations?: string[]
    datasheets?: string[]
    certificates?: string[]
    photos?: Array<{
      title: string
      data: string // base64
      caption?: string
    }>
  }
}

export class EnhancedPhotometricReportGenerator {
  private doc: jsPDF
  private data: PhotometricReportData
  private pageNumber: number = 1
  private readonly margins = { top: 20, right: 20, bottom: 30, left: 20 }
  private readonly pageWidth = 210 // A4 width in mm
  private readonly pageHeight = 297 // A4 height in mm
  private readonly contentWidth: number
  private currentY: number = this.margins.top

  constructor(data: PhotometricReportData) {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    this.data = data
    this.contentWidth = this.pageWidth - this.margins.left - this.margins.right
  }

  async generate(): Promise<Blob> {
    // Cover Page
    this.generateCoverPage()
    
    // Table of Contents
    this.addPage()
    this.generateTableOfContents()
    
    // Executive Summary
    this.addPage()
    this.generateExecutiveSummary()
    
    // 1. Project Overview
    this.addPage()
    this.generateProjectOverview()
    
    // 2. Facility & Crop Requirements
    this.addPage()
    this.generateFacilityDetails()
    
    // 3. Lighting System Design
    this.addPage()
    this.generateLightingSystemDesign()
    
    // 4. Photometric Analysis
    this.addPage()
    await this.generatePhotometricAnalysis()
    
    // 5. Uniformity & Distribution
    this.addPage()
    await this.generateUniformityAnalysis()
    
    // 6. Spectral Analysis
    this.addPage()
    this.generateSpectralAnalysis()
    
    // 7. Energy Analysis
    this.addPage()
    this.generateEnergyAnalysis()
    
    // 8. Environmental Impact
    this.addPage()
    this.generateEnvironmentalAnalysis()
    
    // 9. Financial Analysis
    this.addPage()
    this.generateFinancialAnalysis()
    
    // 10. Compliance & Standards
    this.addPage()
    this.generateComplianceSection()
    
    // 11. Quality Assurance
    this.addPage()
    this.generateQASection()
    
    // 12. Recommendations
    this.addPage()
    this.generateRecommendations()
    
    // Appendices
    if (this.data.appendices) {
      this.addPage()
      this.generateAppendices()
    }
    
    return this.doc.output('blob')
  }

  private addPage() {
    this.doc.addPage()
    this.pageNumber++
    this.currentY = this.margins.top
    this.addHeader()
    this.addFooter()
  }

  private addHeader() {
    this.doc.setFontSize(10)
    this.doc.setTextColor(128, 128, 128)
    this.doc.text(
      `${this.data.project.name} - Photometric Analysis Report`,
      this.margins.left,
      10
    )
    this.doc.line(
      this.margins.left,
      12,
      this.pageWidth - this.margins.right,
      12
    )
  }

  private addFooter() {
    this.doc.setFontSize(10)
    this.doc.setTextColor(128, 128, 128)
    this.doc.text(
      `Page ${this.pageNumber}`,
      this.pageWidth / 2,
      this.pageHeight - 10,
      { align: 'center' }
    )
    this.doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      this.margins.left,
      this.pageHeight - 10
    )
    this.doc.text(
      'VibeLux Professional',
      this.pageWidth - this.margins.right,
      this.pageHeight - 10,
      { align: 'right' }
    )
  }

  private generateCoverPage() {
    // Company Logo/Title
    this.doc.setFontSize(32)
    this.doc.setTextColor(75, 0, 130) // Indigo
    this.doc.text('VibeLux', this.pageWidth / 2, 50, { align: 'center' })
    
    this.doc.setFontSize(16)
    this.doc.setTextColor(100, 100, 100)
    this.doc.text('Professional Lighting Solutions', this.pageWidth / 2, 60, { align: 'center' })
    
    // Report Title
    this.doc.setFontSize(24)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('Photometric Analysis Report', this.pageWidth / 2, 100, { align: 'center' })
    
    // Project Name
    this.doc.setFontSize(20)
    this.doc.setTextColor(50, 50, 50)
    this.doc.text(this.data.project.name, this.pageWidth / 2, 120, { align: 'center' })
    
    // Client Information Box
    this.doc.setFillColor(245, 245, 245)
    this.doc.rect(40, 140, 130, 40, 'F')
    this.doc.setFontSize(12)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('Prepared for:', 45, 150)
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(this.data.project.client.company, 45, 160)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(12)
    this.doc.text(this.data.project.client.name, 45, 167)
    this.doc.text(this.data.project.location.city + ', ' + this.data.project.location.state, 45, 174)
    
    // Consultant Information
    this.doc.setFontSize(12)
    this.doc.text('Prepared by:', 45, 195)
    this.doc.text(this.data.project.consultant.company, 45, 202)
    this.doc.text(this.data.project.consultant.name, 45, 209)
    if (this.data.project.consultant.license) {
      this.doc.text(`License: ${this.data.project.consultant.license}`, 45, 216)
    }
    
    // Date and Version
    this.doc.setFontSize(12)
    this.doc.text(`Date: ${new Date(this.data.project.date).toLocaleDateString()}`, 45, 235)
    this.doc.text(`Version: ${this.data.project.version}`, 45, 242)
    
    // Certification Statement
    this.doc.setFontSize(10)
    this.doc.setTextColor(100, 100, 100)
    const certText = 'This report contains proprietary calculations and recommendations based on industry standards and best practices.'
    this.doc.text(certText, this.pageWidth / 2, 270, { 
      align: 'center',
      maxWidth: this.contentWidth - 20
    })
  }

  private generateTableOfContents() {
    this.doc.setFontSize(20)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('Table of Contents', this.margins.left, this.currentY)
    this.currentY += 15

    const sections = [
      { title: 'Executive Summary', page: 3 },
      { title: '1. Project Overview', page: 4 },
      { title: '2. Facility & Crop Requirements', page: 5 },
      { title: '3. Lighting System Design', page: 6 },
      { title: '4. Photometric Analysis', page: 7 },
      { title: '5. Uniformity & Distribution', page: 8 },
      { title: '6. Spectral Analysis', page: 9 },
      { title: '7. Energy Analysis', page: 10 },
      { title: '8. Environmental Impact', page: 11 },
      { title: '9. Financial Analysis', page: 12 },
      { title: '10. Compliance & Standards', page: 13 },
      { title: '11. Quality Assurance', page: 14 },
      { title: '12. Recommendations', page: 15 },
      { title: 'Appendices', page: 16 }
    ]

    this.doc.setFontSize(12)
    sections.forEach(section => {
      this.doc.setTextColor(0, 0, 0)
      this.doc.text(section.title, this.margins.left + 5, this.currentY)
      
      // Dotted line
      const titleWidth = this.doc.getTextWidth(section.title)
      const dotsStart = this.margins.left + 5 + titleWidth + 2
      const dotsEnd = this.pageWidth - this.margins.right - 15
      this.doc.setLineDashPattern([1, 1], 0)
      this.doc.line(dotsStart, this.currentY - 1, dotsEnd, this.currentY - 1)
      this.doc.setLineDashPattern([], 0)
      
      // Page number
      this.doc.text(section.page.toString(), this.pageWidth - this.margins.right - 10, this.currentY, { align: 'right' })
      
      this.currentY += 8
    })
  }

  private generateExecutiveSummary() {
    this.addSectionTitle('Executive Summary')
    
    // Key Metrics Box
    this.doc.setFillColor(240, 240, 255)
    this.doc.rect(this.margins.left, this.currentY, this.contentWidth, 50, 'F')
    
    this.doc.setFontSize(14)
    this.doc.setTextColor(75, 0, 130)
    this.doc.text('Key Performance Indicators', this.margins.left + 5, this.currentY + 8)
    
    this.doc.setFontSize(11)
    this.doc.setTextColor(0, 0, 0)
    const kpis = [
      { label: 'Average PPFD:', value: `${this.data.calculations.results.ppfd.average.toFixed(0)} μmol/m²/s` },
      { label: 'Uniformity:', value: `${this.data.calculations.results.ppfd.uniformity.minToAvg.toFixed(2)}` },
      { label: 'Power Density:', value: `${this.data.calculations.results.powerMetrics.installedPowerDensity.toFixed(1)} W/ft²` },
      { label: 'System Efficacy:', value: `${this.data.calculations.results.powerMetrics.ppfdPerWatt.toFixed(2)} μmol/J` }
    ]
    
    const kpiY = this.currentY + 18
    kpis.forEach((kpi, index) => {
      const x = this.margins.left + 5 + (index % 2) * 80
      const y = kpiY + Math.floor(index / 2) * 12
      this.doc.text(kpi.label, x, y)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(kpi.value, x + 35, y)
      this.doc.setFont('helvetica', 'normal')
    })
    
    this.currentY += 55

    // Summary Text
    this.doc.setFontSize(11)
    const summaryText = `This photometric analysis evaluates the proposed lighting system for ${this.data.project.name}, ` +
      `a ${this.data.facility.type.replace('_', ' ')} facility located in ${this.data.project.location.city}, ${this.data.project.location.state}. ` +
      `The design utilizes ${this.data.lighting.layout.totalFixtures} ${this.data.lighting.fixtures[0].brand} ${this.data.lighting.fixtures[0].model} fixtures ` +
      `to achieve an average PPFD of ${this.data.calculations.results.ppfd.average.toFixed(0)} μmol/m²/s across ${this.data.facility.dimensions.canopyArea.toFixed(0)} sq ft of canopy area.`
    
    this.addParagraph(summaryText)
    
    // Compliance Status
    this.currentY += 10
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Compliance Status:', this.margins.left, this.currentY)
    
    const status = this.data.calculations.compliance.overallStatus
    const statusColor = status === 'compliant' ? [0, 128, 0] : status === 'conditional' ? [255, 140, 0] : [255, 0, 0]
    this.doc.setTextColor(...statusColor as [number, number, number])
    this.doc.text(status.toUpperCase(), this.margins.left + 40, this.currentY)
    this.doc.setTextColor(0, 0, 0)
    this.doc.setFont('helvetica', 'normal')
    
    this.currentY += 10
    
    // Key Findings
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Key Findings:', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const findings = [
      `The lighting system provides ${this.data.calculations.results.coverage.percentage.toFixed(0)}% coverage of the target area`,
      `Uniformity ratio of ${this.data.calculations.results.ppfd.uniformity.minToAvg.toFixed(2)} ${this.data.calculations.results.ppfd.uniformity.minToAvg >= 0.7 ? 'exceeds' : 'does not meet'} industry standards`,
      `Estimated annual energy consumption: ${(this.data.calculations.results.powerMetrics.annualEnergyUse / 1000).toFixed(0)} MWh`,
      `Simple payback period: ${this.data.financial.roi.simplePayback.toFixed(1)} years`
    ]
    
    this.doc.setFontSize(11)
    findings.forEach(finding => {
      this.doc.text(`• ${finding}`, this.margins.left + 5, this.currentY)
      this.currentY += 7
    })
  }

  private generateProjectOverview() {
    this.addSectionTitle('1. Project Overview')
    
    // Project Information Table
    const projectData = [
      ['Project Name', this.data.project.name],
      ['Client', this.data.project.client.company],
      ['Location', `${this.data.project.location.address}, ${this.data.project.location.city}, ${this.data.project.location.state}`],
      ['Facility Type', this.data.facility.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())],
      ['Total Area', `${this.data.facility.dimensions.area.toFixed(0)} sq ft`],
      ['Canopy Area', `${this.data.facility.dimensions.canopyArea.toFixed(0)} sq ft`],
      ['Mounting Height', `${this.data.lighting.fixtures[0].mounting.height.toFixed(1)} ft`]
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Parameter', 'Value']],
      body: projectData,
      theme: 'striped',
      headStyles: { fillColor: [75, 0, 130] },
      margin: { left: this.margins.left, right: this.margins.right }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Scope of Work
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Scope of Work', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const scope = [
      'Photometric analysis and lighting layout design',
      'PPFD distribution and uniformity calculations',
      'Energy consumption and efficiency analysis',
      'Spectral analysis and crop-specific optimization',
      'Electrical load calculations and circuit design',
      'ROI and financial analysis',
      'Compliance verification with industry standards'
    ]
    
    this.doc.setFontSize(11)
    scope.forEach(item => {
      this.doc.text(`• ${item}`, this.margins.left + 5, this.currentY)
      this.currentY += 6
    })
  }

  private generateFacilityDetails() {
    this.addSectionTitle('2. Facility & Crop Requirements')
    
    // Facility Dimensions
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Facility Dimensions', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const dimensions = [
      ['Length', `${this.data.facility.dimensions.length.toFixed(1)} ft`],
      ['Width', `${this.data.facility.dimensions.width.toFixed(1)} ft`],
      ['Height', `${this.data.facility.dimensions.height.toFixed(1)} ft`],
      ['Total Area', `${this.data.facility.dimensions.area.toFixed(0)} sq ft`],
      ['Volume', `${this.data.facility.dimensions.volume.toFixed(0)} cu ft`],
      ['Canopy Height', `${this.data.facility.dimensions.canopyHeight.toFixed(1)} ft`],
      ['Canopy Area', `${this.data.facility.dimensions.canopyArea.toFixed(0)} sq ft`]
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      body: dimensions,
      theme: 'plain',
      margin: { left: this.margins.left + 5, right: this.pageWidth / 2 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Environmental Parameters
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Environmental Parameters', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const environmental = [
      ['Ambient Light', this.data.facility.environment.ambientLight ? 'Yes' : 'No'],
      ['Ceiling Reflectance', `${(this.data.facility.environment.reflectance.ceiling * 100).toFixed(0)}%`],
      ['Wall Reflectance', `${(this.data.facility.environment.reflectance.walls * 100).toFixed(0)}%`],
      ['Floor Reflectance', `${(this.data.facility.environment.reflectance.floor * 100).toFixed(0)}%`]
    ]
    
    if (this.data.facility.environment.glazingTransmittance) {
      environmental.push(['Glazing Transmittance', `${(this.data.facility.environment.glazingTransmittance * 100).toFixed(0)}%`])
    }
    
    this.doc.autoTable({
      startY: this.currentY,
      body: environmental,
      theme: 'plain',
      margin: { left: this.margins.left + 5, right: this.pageWidth / 2 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Crop Requirements
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Crop Requirements', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    this.data.crops.forEach((crop, index) => {
      if (index > 0) this.currentY += 5
      
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(crop.name, this.margins.left + 5, this.currentY)
      if (crop.scientificName) {
        this.doc.setFont('helvetica', 'italic')
        this.doc.setFontSize(11)
        this.doc.text(`(${crop.scientificName})`, this.margins.left + 5 + this.doc.getTextWidth(crop.name) + 3, this.currentY)
      }
      this.doc.setFont('helvetica', 'normal')
      this.currentY += 6
      
      const cropData = [
        ['Growth Stage', crop.growthStage.replace(/\b\w/g, l => l.toUpperCase())],
        ['PPFD Target', `${crop.ppfdRequirements.target} μmol/m²/s (${crop.ppfdRequirements.min}-${crop.ppfdRequirements.max})`],
        ['DLI Target', `${crop.dliRequirements.target} mol/m²/day (${crop.dliRequirements.min}-${crop.dliRequirements.max})`],
        ['Photoperiod', `${crop.photoperiod} hours`]
      ]
      
      this.doc.autoTable({
        startY: this.currentY,
        body: cropData,
        theme: 'plain',
        margin: { left: this.margins.left + 10, right: this.pageWidth / 2 },
        styles: { fontSize: 10 }
      })
      
      this.currentY = this.doc.lastAutoTable.finalY + 5
    })
  }

  private generateLightingSystemDesign() {
    this.addSectionTitle('3. Lighting System Design')
    
    // Fixture Selection
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Fixture Selection', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const fixture = this.data.lighting.fixtures[0]
    const fixtureSpecs = [
      ['Manufacturer', fixture.brand],
      ['Model', fixture.model],
      ['Quantity', fixture.quantity.toString()],
      ['Input Power', `${fixture.specifications.wattage}W`],
      ['PPF Output', `${fixture.specifications.ppf} μmol/s`],
      ['Efficacy', `${fixture.specifications.efficacy.toFixed(2)} μmol/J`],
      ['Input Voltage', fixture.specifications.inputVoltage],
      ['Power Factor', fixture.specifications.powerFactor.toFixed(2)],
      ['THD', `${fixture.specifications.thd}%`],
      ['Lifetime', `${fixture.specifications.lifetime.toLocaleString()} hours`],
      ['Warranty', `${fixture.specifications.warranty} years`]
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Specification', 'Value']],
      body: fixtureSpecs,
      theme: 'striped',
      headStyles: { fillColor: [75, 0, 130] },
      margin: { left: this.margins.left, right: this.pageWidth / 2 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Layout Configuration
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Layout Configuration', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const layoutData = [
      ['Pattern', this.data.lighting.layout.pattern.replace(/\b\w/g, l => l.toUpperCase())],
      ['Rows', this.data.lighting.layout.rows.toString()],
      ['Columns', this.data.lighting.layout.columns.toString()],
      ['Total Fixtures', this.data.lighting.layout.totalFixtures.toString()],
      ['Mounting Height', `${fixture.mounting.height.toFixed(1)} ft`],
      ['Row Spacing', `${fixture.mounting.spacing.y.toFixed(1)} ft`],
      ['Column Spacing', `${fixture.mounting.spacing.x.toFixed(1)} ft`]
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      body: layoutData,
      theme: 'plain',
      margin: { left: this.margins.left + 5 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Electrical Requirements
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Electrical Requirements', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const electrical = this.data.lighting.electrical
    const electricalData = [
      ['Total Connected Load', `${electrical.totalConnectedLoad.toFixed(1)} kW`],
      ['Demand Factor', `${(electrical.demandFactor * 100).toFixed(0)}%`],
      ['Total Demand', `${electrical.totalDemand.toFixed(1)} kW`],
      ['Voltage', `${electrical.voltage}V`],
      ['Phases', electrical.phases === 3 ? '3-Phase' : 'Single Phase'],
      ['Main Breaker Required', `${Math.ceil(electrical.totalDemand * 1000 / electrical.voltage / (electrical.phases === 3 ? 1.732 : 1) * 1.25 / 10) * 10}A`]
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      body: electricalData,
      theme: 'plain',
      margin: { left: this.margins.left + 5 }
    })
  }

  private async generatePhotometricAnalysis() {
    this.addSectionTitle('4. Photometric Analysis')
    
    // Calculation Parameters
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Calculation Parameters', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const calcParams = [
      ['Calculation Method', this.data.calculations.method.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())],
      ['Grid Spacing', `${this.data.calculations.gridSpacing} ft`],
      ['Calculation Height', `${this.data.calculations.calculationHeight} ft`],
      ['Maintenance Factor', this.data.calculations.maintenanceFactor.toFixed(2)]
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      body: calcParams,
      theme: 'plain',
      margin: { left: this.margins.left + 5, right: this.pageWidth / 2 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // PPFD Results Summary
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('PPFD Analysis Results', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const ppfdResults = this.data.calculations.results.ppfd
    const ppfdData = [
      ['Average PPFD', `${ppfdResults.average.toFixed(1)} μmol/m²/s`],
      ['Minimum PPFD', `${ppfdResults.minimum.toFixed(1)} μmol/m²/s`],
      ['Maximum PPFD', `${ppfdResults.maximum.toFixed(1)} μmol/m²/s`],
      ['Standard Deviation', `${ppfdResults.standardDeviation.toFixed(1)} μmol/m²/s`],
      ['Coefficient of Variation', `${(ppfdResults.cv * 100).toFixed(1)}%`]
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Metric', 'Value']],
      body: ppfdData,
      theme: 'striped',
      headStyles: { fillColor: [75, 0, 130] },
      margin: { left: this.margins.left, right: this.pageWidth / 2 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // DLI Calculations
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Daily Light Integral (DLI)', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const dliData = Object.entries(this.data.calculations.results.dli.values).map(([hours, value]) => [
      `${hours} hours`,
      `${value.toFixed(1)} mol/m²/day`
    ])
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Photoperiod', 'DLI']],
      body: dliData,
      theme: 'plain',
      margin: { left: this.margins.left + 5, right: this.pageWidth / 2 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Coverage Analysis
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Coverage Analysis', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const coverage = this.data.calculations.results.coverage
    const coverageText = `The lighting system provides coverage to ${coverage.percentage.toFixed(1)}% of the target area ` +
      `(${coverage.coveredArea.toFixed(0)} sq ft out of ${coverage.totalArea.toFixed(0)} sq ft). `
    
    this.addParagraph(coverageText)
    
    if (coverage.areasBelow.length > 0) {
      this.currentY += 5
      this.doc.setFontSize(12)
      this.doc.text('Areas Below Threshold:', this.margins.left + 5, this.currentY)
      this.currentY += 6
      
      const belowData = coverage.areasBelow.map(area => [
        `< ${area.threshold} μmol/m²/s`,
        `${area.area.toFixed(0)} sq ft (${area.percentage.toFixed(1)}%)`
      ])
      
      this.doc.autoTable({
        startY: this.currentY,
        body: belowData,
        theme: 'plain',
        margin: { left: this.margins.left + 10, right: this.pageWidth / 2 },
        styles: { fontSize: 10 }
      })
      
      this.currentY = this.doc.lastAutoTable.finalY
    }
  }

  private async generateUniformityAnalysis() {
    this.addSectionTitle('5. Uniformity & Distribution')
    
    // Uniformity Metrics
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Uniformity Metrics', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const uniformity = this.data.calculations.results.ppfd.uniformity
    const uniformityData = [
      ['Min/Avg Ratio', uniformity.minToAvg.toFixed(3), uniformity.minToAvg >= 0.7 ? 'PASS' : 'FAIL'],
      ['Min/Max Ratio', uniformity.minToMax.toFixed(3), uniformity.minToMax >= 0.5 ? 'PASS' : 'FAIL'],
      ['Avg/Max Ratio', uniformity.avgToMax.toFixed(3), uniformity.avgToMax >= 0.8 ? 'PASS' : 'FAIL']
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Metric', 'Value', 'Status']],
      body: uniformityData,
      theme: 'striped',
      headStyles: { fillColor: [75, 0, 130] },
      margin: { left: this.margins.left },
      columnStyles: {
        2: { 
          cellWidth: 30,
          halign: 'center',
          fontStyle: 'bold'
        }
      },
      didParseCell: (data: any) => {
        if (data.column.index === 2 && data.cell.section === 'body') {
          if (data.cell.raw === 'PASS') {
            data.cell.styles.textColor = [0, 128, 0]
          } else if (data.cell.raw === 'FAIL') {
            data.cell.styles.textColor = [255, 0, 0]
          }
        }
      }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // PPFD Distribution Histogram
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('PPFD Distribution', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const histogram = this.data.calculations.results.ppfd.histogram
    const histogramData = histogram.map(h => [
      h.range,
      h.count.toString(),
      `${h.percentage.toFixed(1)}%`
    ])
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [['PPFD Range', 'Points', 'Percentage']],
      body: histogramData,
      theme: 'plain',
      margin: { left: this.margins.left + 5 },
      styles: { fontSize: 10 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Distribution Assessment
    this.doc.setFontSize(12)
    this.doc.setTextColor(0, 0, 0)
    
    const cv = this.data.calculations.results.ppfd.cv
    let assessment = ''
    if (cv < 0.1) {
      assessment = 'Excellent uniformity with very low variation across the growing area.'
    } else if (cv < 0.2) {
      assessment = 'Good uniformity with acceptable variation for most crops.'
    } else if (cv < 0.3) {
      assessment = 'Moderate uniformity. Consider adjusting fixture spacing or height for sensitive crops.'
    } else {
      assessment = 'Poor uniformity. Significant adjustments to the lighting design are recommended.'
    }
    
    this.addParagraph(`Distribution Assessment: ${assessment}`)
  }

  private generateSpectralAnalysis() {
    this.addSectionTitle('6. Spectral Analysis')
    
    const fixture = this.data.lighting.fixtures[0]
    const spectrum = fixture.spectrum
    
    // Spectral Distribution
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Spectral Distribution', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const spectralData = [
      ['UV (280-400nm)', `${spectrum.metrics.uvPercentage?.toFixed(1) || '0.0'}%`],
      ['Blue (400-500nm)', `${spectrum.metrics.bluePercentage.toFixed(1)}%`],
      ['Green (500-600nm)', `${spectrum.metrics.greenPercentage.toFixed(1)}%`],
      ['Red (600-700nm)', `${spectrum.metrics.redPercentage.toFixed(1)}%`],
      ['Far Red (700-800nm)', `${spectrum.metrics.farRedPercentage.toFixed(1)}%`],
      ['PAR (400-700nm)', `${spectrum.metrics.parPercentage.toFixed(1)}%`]
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Wavelength Range', 'Percentage']],
      body: spectralData,
      theme: 'striped',
      headStyles: { fillColor: [75, 0, 130] },
      margin: { left: this.margins.left, right: this.pageWidth / 2 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Critical Ratios
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Critical Spectral Ratios', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const ratios = [
      ['Red:Far-Red (R:FR)', spectrum.metrics.redFarRedRatio.toFixed(2), 'Influences stem elongation and flowering'],
      ['Blue:Red (B:R)', spectrum.metrics.blueRedRatio.toFixed(2), 'Affects morphology and stomatal opening'],
      ['Blue:Green (B:G)', spectrum.metrics.blueGreenRatio.toFixed(2), 'Impacts canopy penetration']
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Ratio', 'Value', 'Significance']],
      body: ratios,
      theme: 'plain',
      margin: { left: this.margins.left + 5 },
      styles: { fontSize: 10 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Spectral Quality Metrics
    if (spectrum.quality) {
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Spectral Quality Metrics', this.margins.left, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.currentY += 7
      
      const qualityData: string[][] = []
      if (spectrum.quality.cri !== undefined) {
        qualityData.push(['Color Rendering Index (CRI)', spectrum.quality.cri.toString()])
      }
      if (spectrum.quality.r9 !== undefined) {
        qualityData.push(['R9 (Deep Red)', spectrum.quality.r9.toString()])
      }
      if (spectrum.quality.tm30) {
        qualityData.push(['TM-30 Rf (Fidelity)', spectrum.quality.tm30.rf.toString()])
        qualityData.push(['TM-30 Rg (Gamut)', spectrum.quality.tm30.rg.toString()])
      }
      
      if (qualityData.length > 0) {
        this.doc.autoTable({
          startY: this.currentY,
          body: qualityData,
          theme: 'plain',
          margin: { left: this.margins.left + 5, right: this.pageWidth / 2 }
        })
        
        this.currentY = this.doc.lastAutoTable.finalY + 10
      }
    }
    
    // Crop Suitability Assessment
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Crop Suitability Assessment:', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 6
    
    this.data.crops.forEach(crop => {
      let suitability = 'Suitable'
      const reasons: string[] = []
      
      if (crop.growthStage === 'flowering' && spectrum.metrics.redFarRedRatio < 5) {
        suitability = 'Conditional'
        reasons.push('Low R:FR ratio may delay flowering')
      }
      if (crop.growthStage === 'vegetative' && spectrum.metrics.bluePercentage < 15) {
        suitability = 'Conditional'
        reasons.push('Low blue content may cause stretching')
      }
      
      this.doc.setFontSize(11)
      this.doc.text(`• ${crop.name}: ${suitability}`, this.margins.left + 5, this.currentY)
      if (reasons.length > 0) {
        this.doc.setFontSize(10)
        this.doc.setTextColor(100, 100, 100)
        this.doc.text(reasons.join('; '), this.margins.left + 10, this.currentY + 5)
        this.doc.setTextColor(0, 0, 0)
        this.currentY += 5
      }
      this.currentY += 6
    })
  }

  private generateEnergyAnalysis() {
    this.addSectionTitle('7. Energy Analysis')
    
    const powerMetrics = this.data.calculations.results.powerMetrics
    const energyCost = this.data.financial.operating.energyCost
    
    // Power Consumption Summary
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Power Consumption Summary', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const powerData = [
      ['Installed Power Density', `${powerMetrics.installedPowerDensity.toFixed(2)} W/sq ft`, 'At 100% output'],
      ['Effective Power Density', `${powerMetrics.effectivePowerDensity.toFixed(2)} W/sq ft`, 'At operating levels'],
      ['Total Connected Load', `${this.data.lighting.electrical.totalConnectedLoad.toFixed(1)} kW`, ''],
      ['Operating Load', `${this.data.lighting.electrical.totalDemand.toFixed(1)} kW`, 'With dimming'],
      ['PPFD per Watt', `${powerMetrics.ppfdPerWatt.toFixed(3)} μmol/m²/s/W`, 'System efficiency']
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Metric', 'Value', 'Notes']],
      body: powerData,
      theme: 'striped',
      headStyles: { fillColor: [75, 0, 130] },
      margin: { left: this.margins.left }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Energy Consumption & Costs
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Energy Consumption & Costs', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const photoperiod = this.data.crops[0].photoperiod
    const dailyEnergy = this.data.lighting.electrical.totalDemand * photoperiod
    const annualEnergy = powerMetrics.annualEnergyUse
    
    const energyData = [
      ['Daily Energy Use', `${dailyEnergy.toFixed(0)} kWh`, `${photoperiod} hour photoperiod`],
      ['Monthly Energy Use', `${(dailyEnergy * 30).toFixed(0)} kWh`, '30 days'],
      ['Annual Energy Use', `${(annualEnergy / 1000).toFixed(1)} MWh`, '365 days'],
      ['Energy per Mol', `${powerMetrics.energyPerMol.toFixed(3)} kWh/mol`, 'Photon efficiency'],
      ['', '', ''],
      ['Energy Rate', `$${energyCost.rate.toFixed(3)}/kWh`, ''],
      ['Daily Cost', `$${energyCost.daily.toFixed(2)}`, ''],
      ['Monthly Cost', `$${energyCost.monthly.toFixed(0)}`, ''],
      ['Annual Cost', `$${energyCost.annual.toFixed(0)}`, '']
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      body: energyData,
      theme: 'plain',
      margin: { left: this.margins.left + 5 },
      didParseCell: (data: any) => {
        if (data.row.index === 4) {
          data.cell.styles.fillColor = [240, 240, 240]
        }
      }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Efficiency Comparison
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Industry Comparison:', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 6
    
    const avgIndustryPPE = 2.5
    const systemPPE = this.data.lighting.fixtures[0].specifications.efficacy
    const improvement = ((systemPPE - avgIndustryPPE) / avgIndustryPPE * 100).toFixed(0)
    
    this.addParagraph(
      `This system achieves ${systemPPE.toFixed(2)} μmol/J, which is ${improvement}% ` +
      `${systemPPE > avgIndustryPPE ? 'better' : 'worse'} than the industry average of ${avgIndustryPPE} μmol/J. ` +
      `This translates to ${Math.abs(parseInt(improvement))}% ${systemPPE > avgIndustryPPE ? 'lower' : 'higher'} energy costs compared to typical installations.`
    )
  }

  private generateEnvironmentalAnalysis() {
    this.addSectionTitle('8. Environmental Impact')
    
    const hvac = this.data.environmental.hvacIntegration
    const sustainability = this.data.environmental.sustainability
    
    // Heat Load Analysis
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Heat Load Analysis', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const heatData = [
      ['Total Heat Load', `${hvac.heatLoad.toLocaleString()} BTU/hr`, `${(hvac.heatLoad / 12000).toFixed(1)} tons`],
      ['Sensible Heat', `${hvac.sensibleHeat.toLocaleString()} BTU/hr`, `${(hvac.sensibleHeat / hvac.heatLoad * 100).toFixed(0)}%`],
      ['Latent Heat', `${hvac.latentHeat.toLocaleString()} BTU/hr`, `${(hvac.latentHeat / hvac.heatLoad * 100).toFixed(0)}%`],
      ['Cooling Required', `${hvac.coolingRequired.toFixed(1)} tons`, ''],
      ['Airflow Required', `${hvac.airflowRequired.toLocaleString()} CFM`, '']
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Parameter', 'Value', 'Notes']],
      body: heatData,
      theme: 'striped',
      headStyles: { fillColor: [75, 0, 130] },
      margin: { left: this.margins.left }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Carbon Footprint
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Carbon Footprint', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const carbonData = [
      ['Annual CO₂ Emissions', `${(sustainability.carbonFootprint.annual / 1000).toFixed(1)} metric tons`, ''],
      ['CO₂ per Unit Produced', `${sustainability.carbonFootprint.perUnit.toFixed(2)} kg CO₂/unit`, ''],
      ['Grid Carbon Intensity', '0.92 lbs CO₂/kWh', 'Regional average']
    ]
    
    if (sustainability.renewableEnergy.percentage > 0) {
      carbonData.push([
        'Renewable Energy',
        `${sustainability.renewableEnergy.percentage}%`,
        sustainability.renewableEnergy.source || ''
      ])
    }
    
    this.doc.autoTable({
      startY: this.currentY,
      body: carbonData,
      theme: 'plain',
      margin: { left: this.margins.left + 5 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Sustainability Features
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Sustainability Features:', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 6
    
    const features = [
      `High efficacy fixtures (${this.data.lighting.fixtures[0].specifications.efficacy.toFixed(1)} μmol/J) reduce energy consumption`,
      `${this.data.lighting.fixtures[0].specifications.lifetime.toLocaleString()} hour lifetime minimizes replacement waste`,
      'Dimmable controls enable demand response participation',
      'Low heat output reduces HVAC requirements'
    ]
    
    if (sustainability.waterUsage) {
      features.push(`Condensate recovery potential: ${sustainability.waterUsage.condensate.toLocaleString()} gallons/year`)
    }
    
    this.doc.setFontSize(11)
    features.forEach(feature => {
      this.doc.text(`• ${feature}`, this.margins.left + 5, this.currentY)
      this.currentY += 6
    })
  }

  private generateFinancialAnalysis() {
    this.addSectionTitle('9. Financial Analysis')
    
    const capital = this.data.financial.capital
    const operating = this.data.financial.operating
    const roi = this.data.financial.roi
    
    // Capital Investment
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Capital Investment Breakdown', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const capitalData = [
      ['Fixtures', `$${capital.fixtures.toLocaleString()}`, `${(capital.fixtures / capital.total * 100).toFixed(0)}%`],
      ['Installation Labor', `$${capital.installation.toLocaleString()}`, `${(capital.installation / capital.total * 100).toFixed(0)}%`],
      ['Electrical Infrastructure', `$${capital.electrical.toLocaleString()}`, `${(capital.electrical / capital.total * 100).toFixed(0)}%`],
      ['Controls System', `$${capital.controls.toLocaleString()}`, `${(capital.controls / capital.total * 100).toFixed(0)}%`],
      ['Design & Engineering', `$${capital.design.toLocaleString()}`, `${(capital.design / capital.total * 100).toFixed(0)}%`],
      ['', '', ''],
      ['Total Investment', `$${capital.total.toLocaleString()}`, '100%']
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Category', 'Amount', 'Percentage']],
      body: capitalData,
      theme: 'striped',
      headStyles: { fillColor: [75, 0, 130] },
      margin: { left: this.margins.left },
      didParseCell: (data: any) => {
        if (data.row.index === 5) {
          data.cell.styles.fillColor = [240, 240, 240]
        }
        if (data.row.index === 6) {
          data.cell.styles.fontStyle = 'bold'
        }
      }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Operating Expenses
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Annual Operating Expenses', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const opexData = [
      ['Energy Costs', `$${operating.energyCost.annual.toLocaleString()}`, `${(operating.energyCost.annual / operating.total * 100).toFixed(0)}%`],
      ['Maintenance', `$${operating.maintenance.annual.toLocaleString()}`, `${(operating.maintenance.annual / operating.total * 100).toFixed(0)}%`],
      ['Total Annual OpEx', `$${operating.total.toLocaleString()}`, '100%']
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      body: opexData,
      theme: 'plain',
      margin: { left: this.margins.left + 5 },
      didParseCell: (data: any) => {
        if (data.row.index === 2) {
          data.cell.styles.fontStyle = 'bold'
        }
      }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // ROI Analysis
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Return on Investment Analysis', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const roiData = [
      ['Simple Payback Period', `${roi.simplePayback.toFixed(1)} years`],
      ['Net Present Value (10 yr)', `$${roi.npv.toLocaleString()}`],
      ['Internal Rate of Return', `${roi.irr.toFixed(1)}%`],
      ['Levelized Cost of Light', `$${roi.lcoe.toFixed(3)}/mol`]
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [['Metric', 'Value']],
      body: roiData,
      theme: 'striped',
      headStyles: { fillColor: [75, 0, 130] },
      margin: { left: this.margins.left, right: this.pageWidth / 2 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Comparison to Baseline
    if (roi.comparison) {
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Baseline Comparison:', this.margins.left, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.currentY += 6
      
      this.addParagraph(
        `Compared to ${roi.comparison.baseline}, this system provides ` +
        `${roi.comparison.percentImprovement}% improvement in efficiency, resulting in ` +
        `annual savings of $${roi.comparison.savings.toLocaleString()}.`
      )
    }
  }

  private generateComplianceSection() {
    this.addSectionTitle('10. Compliance & Standards')
    
    const compliance = this.data.calculations.compliance
    
    // Overall Compliance Status
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Overall Compliance Status: ', this.margins.left, this.currentY)
    
    const statusColors = {
      'compliant': [0, 128, 0],
      'non-compliant': [255, 0, 0],
      'conditional': [255, 140, 0]
    }
    
    this.doc.setTextColor(...statusColors[compliance.overallStatus] as [number, number, number])
    this.doc.text(compliance.overallStatus.toUpperCase(), this.margins.left + 65, this.currentY)
    this.doc.setTextColor(0, 0, 0)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 10
    
    // Standards Compliance Details
    compliance.standards.forEach((standard, index) => {
      if (index > 0) this.currentY += 5
      
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`${standard.name} (${standard.organization})`, this.margins.left, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.currentY += 7
      
      const requirementData = standard.requirements.map(req => [
        req.parameter,
        req.required.toString(),
        req.actual.toString(),
        req.status.toUpperCase()
      ])
      
      this.doc.autoTable({
        startY: this.currentY,
        head: [['Parameter', 'Required', 'Actual', 'Status']],
        body: requirementData,
        theme: 'plain',
        margin: { left: this.margins.left + 5 },
        styles: { fontSize: 10 },
        columnStyles: {
          3: { halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data: any) => {
          if (data.column.index === 3 && data.cell.section === 'body') {
            const status = data.cell.raw.toLowerCase()
            if (status === 'pass') {
              data.cell.styles.textColor = [0, 128, 0]
            } else if (status === 'fail') {
              data.cell.styles.textColor = [255, 0, 0]
            } else if (status === 'warning') {
              data.cell.styles.textColor = [255, 140, 0]
            }
          }
        }
      })
      
      this.currentY = this.doc.lastAutoTable.finalY + 5
    })
    
    // Certifications
    this.currentY += 5
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Product Certifications:', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 6
    
    const certifications = this.data.lighting.fixtures[0].specifications.certifications
    this.doc.setFontSize(11)
    certifications.forEach(cert => {
      this.doc.text(`• ${cert}`, this.margins.left + 5, this.currentY)
      this.currentY += 5
    })
  }

  private generateQASection() {
    this.addSectionTitle('11. Quality Assurance')
    
    const qa = this.data.qa
    
    // Calibration Information
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Measurement Equipment Calibration', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const calibrationData = [
      ['PAR Meter', qa.calibration.meter],
      ['Calibration Date', new Date(qa.calibration.date).toLocaleDateString()],
      ['Certificate', qa.calibration.certificate || 'On file'],
      ['Next Calibration Due', new Date(new Date(qa.calibration.date).setFullYear(new Date(qa.calibration.date).getFullYear() + 1)).toLocaleDateString()]
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      body: calibrationData,
      theme: 'plain',
      margin: { left: this.margins.left + 5, right: this.pageWidth / 2 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Validation Method
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Calculation Validation', this.margins.left, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 7
    
    const validationData = [
      ['Validation Method', qa.validation.method],
      ['Validation Date', new Date(qa.validation.date).toLocaleDateString()],
      ['Performed By', qa.validation.technician]
    ]
    
    this.doc.autoTable({
      startY: this.currentY,
      body: validationData,
      theme: 'plain',
      margin: { left: this.margins.left + 5, right: this.pageWidth / 2 }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    
    // Field Measurements vs Calculations
    if (qa.measurements && qa.measurements.length > 0) {
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Field Verification Results', this.margins.left, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.currentY += 7
      
      const measurementData = qa.measurements.map(m => [
        m.location,
        `${m.measured.toFixed(0)} μmol/m²/s`,
        `${m.calculated.toFixed(0)} μmol/m²/s`,
        `${m.deviation > 0 ? '+' : ''}${m.deviation.toFixed(1)}%`
      ])
      
      this.doc.autoTable({
        startY: this.currentY,
        head: [['Location', 'Measured', 'Calculated', 'Deviation']],
        body: measurementData,
        theme: 'striped',
        headStyles: { fillColor: [75, 0, 130] },
        margin: { left: this.margins.left },
        columnStyles: {
          3: { halign: 'center' }
        },
        didParseCell: (data: any) => {
          if (data.column.index === 3 && data.cell.section === 'body') {
            const deviation = parseFloat(data.cell.raw)
            if (Math.abs(deviation) > 10) {
              data.cell.styles.textColor = [255, 0, 0]
            } else if (Math.abs(deviation) > 5) {
              data.cell.styles.textColor = [255, 140, 0]
            } else {
              data.cell.styles.textColor = [0, 128, 0]
            }
          }
        }
      })
      
      this.currentY = this.doc.lastAutoTable.finalY + 5
      
      // Statistical summary
      const avgDeviation = qa.measurements.reduce((sum, m) => sum + Math.abs(m.deviation), 0) / qa.measurements.length
      this.doc.setFontSize(11)
      this.doc.text(`Average Deviation: ${avgDeviation.toFixed(1)}%`, this.margins.left + 5, this.currentY)
    }
  }

  private generateRecommendations() {
    this.addSectionTitle('12. Recommendations')
    
    const recommendations = this.data.recommendations
    
    // Immediate Actions
    if (recommendations.immediate.length > 0) {
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setTextColor(255, 0, 0)
      this.doc.text('Immediate Actions Required', this.margins.left, this.currentY)
      this.doc.setTextColor(0, 0, 0)
      this.doc.setFont('helvetica', 'normal')
      this.currentY += 7
      
      this.doc.setFontSize(11)
      recommendations.immediate.forEach(rec => {
        this.doc.text(`• ${rec}`, this.margins.left + 5, this.currentY)
        this.currentY += 6
      })
      this.currentY += 5
    }
    
    // Short-term Recommendations
    if (recommendations.shortTerm.length > 0) {
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setTextColor(255, 140, 0)
      this.doc.text('Short-term Recommendations (1-3 months)', this.margins.left, this.currentY)
      this.doc.setTextColor(0, 0, 0)
      this.doc.setFont('helvetica', 'normal')
      this.currentY += 7
      
      this.doc.setFontSize(11)
      recommendations.shortTerm.forEach(rec => {
        this.doc.text(`• ${rec}`, this.margins.left + 5, this.currentY)
        this.currentY += 6
      })
      this.currentY += 5
    }
    
    // Long-term Recommendations
    if (recommendations.longTerm.length > 0) {
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setTextColor(0, 128, 0)
      this.doc.text('Long-term Opportunities (6+ months)', this.margins.left, this.currentY)
      this.doc.setTextColor(0, 0, 0)
      this.doc.setFont('helvetica', 'normal')
      this.currentY += 7
      
      this.doc.setFontSize(11)
      recommendations.longTerm.forEach(rec => {
        this.doc.text(`• ${rec}`, this.margins.left + 5, this.currentY)
        this.currentY += 6
      })
      this.currentY += 5
    }
    
    // Optimization Opportunities
    if (recommendations.optimization.length > 0) {
      this.currentY += 5
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Optimization Opportunities', this.margins.left, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.currentY += 7
      
      const optData = recommendations.optimization.map(opt => [
        opt.parameter,
        opt.current.toString(),
        opt.recommended.toString(),
        opt.benefit,
        opt.cost || 'Minimal'
      ])
      
      this.doc.autoTable({
        startY: this.currentY,
        head: [['Parameter', 'Current', 'Recommended', 'Benefit', 'Cost']],
        body: optData,
        theme: 'striped',
        headStyles: { fillColor: [75, 0, 130] },
        margin: { left: this.margins.left },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 40 },
          3: { cellWidth: 50 },
          4: { cellWidth: 25 }
        }
      })
    }
  }

  private generateAppendices() {
    this.addSectionTitle('Appendices')
    
    const appendices = this.data.appendices
    
    // List of appendices
    this.doc.setFontSize(12)
    this.doc.text('The following supplementary documents are included:', this.margins.left, this.currentY)
    this.currentY += 10
    
    if (appendices.calculations && appendices.calculations.length > 0) {
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('A. Detailed Calculations', this.margins.left, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.currentY += 6
      appendices.calculations.forEach(calc => {
        this.doc.setFontSize(11)
        this.doc.text(`• ${calc}`, this.margins.left + 5, this.currentY)
        this.currentY += 5
      })
      this.currentY += 5
    }
    
    if (appendices.datasheets && appendices.datasheets.length > 0) {
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(12)
      this.doc.text('B. Product Datasheets', this.margins.left, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.currentY += 6
      appendices.datasheets.forEach(sheet => {
        this.doc.setFontSize(11)
        this.doc.text(`• ${sheet}`, this.margins.left + 5, this.currentY)
        this.currentY += 5
      })
      this.currentY += 5
    }
    
    if (appendices.certificates && appendices.certificates.length > 0) {
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(12)
      this.doc.text('C. Certificates & Test Reports', this.margins.left, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.currentY += 6
      appendices.certificates.forEach(cert => {
        this.doc.setFontSize(11)
        this.doc.text(`• ${cert}`, this.margins.left + 5, this.currentY)
        this.currentY += 5
      })
    }
  }

  private addSectionTitle(title: string) {
    this.doc.setFontSize(18)
    this.doc.setTextColor(75, 0, 130)
    this.doc.text(title, this.margins.left, this.currentY)
    this.doc.setTextColor(0, 0, 0)
    this.currentY += 12
  }

  private addParagraph(text: string, fontSize: number = 11) {
    this.doc.setFontSize(fontSize)
    const lines = this.doc.splitTextToSize(text, this.contentWidth)
    lines.forEach((line: string) => {
      this.doc.text(line, this.margins.left, this.currentY)
      this.currentY += fontSize * 0.5
    })
  }
}