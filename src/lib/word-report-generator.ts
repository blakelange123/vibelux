import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  ShadingType,
  convertInchesToTwip,
  ITableCellOptions,
  IParagraphOptions,
  IImageOptions,
} from 'docx'
import { saveAs } from 'file-saver'
import type { AdvancedFixtureData } from './ppfd-calculations-advanced'
import { calculatePPFDGrid, calculatePPFDStats, calculateDLI } from './ppfd-calculations'

interface ReportData {
  projectName: string
  clientName?: string
  location?: string
  date?: Date
  preparedBy?: string
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
    voltage?: number
    phaseType?: string
  }
  roi?: {
    initialCost: number
    annualSavings: number
    paybackPeriod: number
    energyCostPerKWh?: number
  }
  environmentalSettings?: {
    temperature: number
    humidity: number
    co2: number
    photoperiod: number
  }
  chartImages?: {
    ppfdHeatmap?: string // base64 encoded image
    uniformityChart?: string
    dliChart?: string
    roiChart?: string
  }
}

export class WordReportGenerator {
  private primaryColor = '8B5CF6' // Purple
  private secondaryColor = '22C55E' // Green
  
  constructor(private options?: {
    companyName?: string
    companyLogo?: string
    companyAddress?: string
    primaryColor?: string
    customHeader?: string
    customFooter?: string
    includeTableOfContents?: boolean
  }) {
    if (options?.primaryColor) {
      this.primaryColor = options.primaryColor
    }
  }

  async generateReport(data: ReportData): Promise<void> {
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: this.createHeader(),
        },
        footers: {
          default: this.createFooter(),
        },
        children: [
          ...this.createCoverPage(data),
          new PageBreak(),
          ...(this.options?.includeTableOfContents ? this.createTableOfContents() : []),
          ...this.createExecutiveSummary(data),
          new PageBreak(),
          ...this.createProjectOverview(data),
          new PageBreak(),
          ...this.createRoomSpecifications(data),
          new PageBreak(),
          ...this.createFixtureAnalysis(data),
          new PageBreak(),
          ...this.createPPFDAnalysis(data),
          new PageBreak(),
          ...this.createElectricalAnalysis(data),
          new PageBreak(),
          ...this.createROIAnalysis(data),
          new PageBreak(),
          ...this.createEnvironmentalSettings(data),
          new PageBreak(),
          ...this.createRecommendations(data),
          ...this.createAppendix(data),
        ],
      }],
    })

    const blob = await Packer.toBlob(doc)
    const filename = `${data.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`
    saveAs(blob, filename)
  }

  private createHeader(): Header {
    const companyName = this.options?.companyName || 'Vibelux'
    return new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: companyName,
              size: 20,
              color: this.primaryColor,
            }),
          ],
        }),
      ],
    })
  }

  private createFooter(): Footer {
    return new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'Page ',
              size: 18,
            }),
            new TextRun({
              children: [PageNumber.CURRENT],
              size: 18,
            }),
            new TextRun({
              text: ' of ',
              size: 18,
            }),
            new TextRun({
              children: [PageNumber.TOTAL_PAGES],
              size: 18,
            }),
          ],
        }),
      ],
    })
  }

  private createCoverPage(data: ReportData): Paragraph[] {
    const companyName = this.options?.companyName || 'Vibelux'
    const currentDate = data.date || new Date()
    
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: companyName,
            size: 72,
            bold: true,
            color: this.primaryColor,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
        children: [
          new TextRun({
            text: 'Horticultural Lighting Analysis Report',
            size: 36,
            color: '333333',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: data.projectName,
            size: 48,
            bold: true,
            color: '000000',
          }),
        ],
      }),
      ...(data.clientName ? [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: 'Prepared for: ',
              size: 24,
              color: '666666',
            }),
            new TextRun({
              text: data.clientName,
              size: 24,
              bold: true,
              color: '333333',
            }),
          ],
        }),
      ] : []),
      ...(data.location ? [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: data.location,
              size: 24,
              color: '666666',
            }),
          ],
        }),
      ] : []),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1000 },
        children: [
          new TextRun({
            text: currentDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            size: 24,
            color: '666666',
          }),
        ],
      }),
      ...(data.preparedBy ? [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100 },
          children: [
            new TextRun({
              text: 'Prepared by: ',
              size: 20,
              color: '666666',
            }),
            new TextRun({
              text: data.preparedBy,
              size: 20,
              color: '333333',
            }),
          ],
        }),
      ] : []),
    ]
  }

  private createTableOfContents(): Paragraph[] {
    return [
      new Paragraph({
        text: 'Table of Contents',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: '1. Executive Summary',
        spacing: { after: 200 },
        indent: { left: convertInchesToTwip(0.5) },
      }),
      new Paragraph({
        text: '2. Project Overview',
        spacing: { after: 200 },
        indent: { left: convertInchesToTwip(0.5) },
      }),
      new Paragraph({
        text: '3. Room Specifications',
        spacing: { after: 200 },
        indent: { left: convertInchesToTwip(0.5) },
      }),
      new Paragraph({
        text: '4. Fixture Analysis',
        spacing: { after: 200 },
        indent: { left: convertInchesToTwip(0.5) },
      }),
      new Paragraph({
        text: '5. PPFD Analysis',
        spacing: { after: 200 },
        indent: { left: convertInchesToTwip(0.5) },
      }),
      new Paragraph({
        text: '6. Electrical Analysis',
        spacing: { after: 200 },
        indent: { left: convertInchesToTwip(0.5) },
      }),
      new Paragraph({
        text: '7. ROI Analysis',
        spacing: { after: 200 },
        indent: { left: convertInchesToTwip(0.5) },
      }),
      new Paragraph({
        text: '8. Environmental Settings',
        spacing: { after: 200 },
        indent: { left: convertInchesToTwip(0.5) },
      }),
      new Paragraph({
        text: '9. Recommendations',
        spacing: { after: 200 },
        indent: { left: convertInchesToTwip(0.5) },
      }),
      new Paragraph({
        text: 'Appendix',
        spacing: { after: 200 },
        indent: { left: convertInchesToTwip(0.5) },
      }),
      new PageBreak(),
    ]
  }

  private createExecutiveSummary(data: ReportData): Paragraph[] {
    const totalFixtures = data.fixtures.filter(f => f.enabled).length
    const totalPower = data.electricalAnalysis?.totalPower || 0
    const avgPPFD = data.ppfdAnalysis?.avg || 0
    const dli = data.ppfdAnalysis?.dli || 0
    
    return [
      new Paragraph({
        text: 'Executive Summary',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: `This report provides a comprehensive analysis of the horticultural lighting design for ${data.projectName}. Our analysis includes detailed photometric calculations, electrical requirements, and return on investment projections.`,
        spacing: { after: 300 },
      }),
      new Paragraph({
        text: 'Key Findings',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      this.createBulletPoint(`Total Fixtures: ${totalFixtures} units`),
      this.createBulletPoint(`Total Power Consumption: ${totalPower.toLocaleString()} watts`),
      this.createBulletPoint(`Average PPFD: ${avgPPFD.toFixed(0)} μmol/m²/s`),
      this.createBulletPoint(`Daily Light Integral (DLI): ${dli.toFixed(1)} mol/m²/day`),
      this.createBulletPoint(`Light Uniformity: ${((data.ppfdAnalysis?.uniformity || 0) * 100).toFixed(1)}%`),
      ...(data.roi ? [
        this.createBulletPoint(`Payback Period: ${data.roi.paybackPeriod.toFixed(1)} years`),
      ] : []),
    ]
  }

  private createProjectOverview(data: ReportData): Paragraph[] {
    return [
      new Paragraph({
        text: 'Project Overview',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: 'Project Information',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      this.createInfoTable([
        ['Project Name', data.projectName],
        ['Client', data.clientName || 'N/A'],
        ['Location', data.location || 'N/A'],
        ['Report Date', (data.date || new Date()).toLocaleDateString()],
        ['Prepared By', data.preparedBy || 'Vibelux Team'],
      ]),
    ]
  }

  private createRoomSpecifications(data: ReportData): Paragraph[] {
    const area = data.roomDimensions.width * data.roomDimensions.length
    const volume = area * data.roomDimensions.height
    
    return [
      new Paragraph({
        text: 'Room Specifications',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: 'Dimensions',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      this.createInfoTable([
        ['Width', `${data.roomDimensions.width} ft`],
        ['Length', `${data.roomDimensions.length} ft`],
        ['Height', `${data.roomDimensions.height} ft`],
        ['Floor Area', `${area.toFixed(2)} ft²`],
        ['Volume', `${volume.toFixed(2)} ft³`],
      ]),
      ...(data.chartImages?.ppfdHeatmap ? [
        new Paragraph({
          text: 'Room Layout',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
        new Paragraph({
          children: [
            new ImageRun({
              data: Buffer.from(data.chartImages.ppfdHeatmap.split(',')[1], 'base64'),
              transformation: {
                width: 500,
                height: 400,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ] : []),
    ]
  }

  private createFixtureAnalysis(data: ReportData): Paragraph[] {
    const enabledFixtures = data.fixtures.filter(f => f.enabled)
    const fixturesByModel = enabledFixtures.reduce((acc, f) => {
      const key = `${f.brand} ${f.model}`
      if (!acc[key]) {
        acc[key] = {
          count: 0,
          wattage: f.wattage,
          ppf: f.ppf,
          efficacy: f.efficacy,
        }
      }
      acc[key].count++
      return acc
    }, {} as Record<string, any>)

    return [
      new Paragraph({
        text: 'Fixture Analysis',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: 'Fixture Summary',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      this.createFixtureTable(fixturesByModel),
      new Paragraph({
        text: 'Total System Metrics',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      this.createBulletPoint(`Total Fixtures: ${enabledFixtures.length}`),
      this.createBulletPoint(`Total PPF Output: ${enabledFixtures.reduce((sum, f) => sum + f.ppf, 0).toLocaleString()} μmol/s`),
      this.createBulletPoint(`Average System Efficacy: ${(enabledFixtures.reduce((sum, f) => sum + f.efficacy, 0) / enabledFixtures.length).toFixed(2)} μmol/J`),
    ]
  }

  private createPPFDAnalysis(data: ReportData): Paragraph[] {
    if (!data.ppfdAnalysis) return []
    
    return [
      new Paragraph({
        text: 'PPFD Analysis',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: 'Photosynthetic Photon Flux Density (PPFD) measures the amount of photosynthetically active radiation (PAR) that reaches the plant canopy. This is a critical metric for optimizing plant growth and yield.',
        spacing: { after: 300 },
      }),
      new Paragraph({
        text: 'PPFD Metrics',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      this.createInfoTable([
        ['Minimum PPFD', `${data.ppfdAnalysis.min.toFixed(0)} μmol/m²/s`],
        ['Maximum PPFD', `${data.ppfdAnalysis.max.toFixed(0)} μmol/m²/s`],
        ['Average PPFD', `${data.ppfdAnalysis.avg.toFixed(0)} μmol/m²/s`],
        ['Uniformity', `${(data.ppfdAnalysis.uniformity * 100).toFixed(1)}%`],
        ['Daily Light Integral', `${data.ppfdAnalysis.dli.toFixed(1)} mol/m²/day`],
      ]),
      ...(data.chartImages?.uniformityChart ? [
        new Paragraph({
          text: 'Uniformity Distribution',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
        new Paragraph({
          children: [
            new ImageRun({
              data: Buffer.from(data.chartImages.uniformityChart.split(',')[1], 'base64'),
              transformation: {
                width: 500,
                height: 300,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ] : []),
    ]
  }

  private createElectricalAnalysis(data: ReportData): Paragraph[] {
    if (!data.electricalAnalysis) return []
    
    return [
      new Paragraph({
        text: 'Electrical Analysis',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: 'Power Requirements',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      this.createInfoTable([
        ['Total Power', `${data.electricalAnalysis.totalPower.toLocaleString()} watts`],
        ['Voltage', data.electricalAnalysis.voltage ? `${data.electricalAnalysis.voltage}V` : '480V'],
        ['Phase', data.electricalAnalysis.phaseType || '3-Phase'],
        ['Circuits Required', `${data.electricalAnalysis.circuitsRequired}`],
        ['Estimated Monthly Cost', `$${data.electricalAnalysis.estimatedCost.toFixed(2)}`],
      ]),
      new Paragraph({
        text: 'Electrical Infrastructure Recommendations',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      this.createBulletPoint('Install dedicated circuits for grow light systems'),
      this.createBulletPoint('Implement surge protection on all lighting circuits'),
      this.createBulletPoint('Consider power factor correction for improved efficiency'),
      this.createBulletPoint('Install monitoring systems for real-time power consumption tracking'),
    ]
  }

  private createROIAnalysis(data: ReportData): Paragraph[] {
    if (!data.roi) return []
    
    const monthlyEnergySavings = data.roi.annualSavings / 12
    const fiveYearSavings = data.roi.annualSavings * 5
    
    return [
      new Paragraph({
        text: 'Return on Investment Analysis',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: 'Financial Overview',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      this.createInfoTable([
        ['Initial Investment', `$${data.roi.initialCost.toLocaleString()}`],
        ['Annual Energy Savings', `$${data.roi.annualSavings.toLocaleString()}`],
        ['Monthly Energy Savings', `$${monthlyEnergySavings.toFixed(2)}`],
        ['Payback Period', `${data.roi.paybackPeriod.toFixed(1)} years`],
        ['5-Year Total Savings', `$${fiveYearSavings.toLocaleString()}`],
        ['Energy Rate', data.roi.energyCostPerKWh ? `$${data.roi.energyCostPerKWh}/kWh` : '$0.12/kWh'],
      ]),
      ...(data.chartImages?.roiChart ? [
        new Paragraph({
          text: 'ROI Projection',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
        new Paragraph({
          children: [
            new ImageRun({
              data: Buffer.from(data.chartImages.roiChart.split(',')[1], 'base64'),
              transformation: {
                width: 500,
                height: 300,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ] : []),
    ]
  }

  private createEnvironmentalSettings(data: ReportData): Paragraph[] {
    if (!data.environmentalSettings) return []
    
    return [
      new Paragraph({
        text: 'Environmental Settings',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: 'Recommended Environmental Parameters',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      this.createInfoTable([
        ['Temperature', `${data.environmentalSettings.temperature}°F`],
        ['Relative Humidity', `${data.environmentalSettings.humidity}%`],
        ['CO₂ Concentration', `${data.environmentalSettings.co2} ppm`],
        ['Photoperiod', `${data.environmentalSettings.photoperiod} hours`],
      ]),
      new Paragraph({
        text: 'Environmental Control Integration',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      this.createBulletPoint('Integrate lighting controls with HVAC systems for optimal temperature management'),
      this.createBulletPoint('Implement CO₂ supplementation during photoperiod for enhanced photosynthesis'),
      this.createBulletPoint('Use VPD (Vapor Pressure Deficit) calculations to optimize transpiration rates'),
      this.createBulletPoint('Monitor leaf temperature to ensure optimal photosynthetic efficiency'),
    ]
  }

  private createRecommendations(data: ReportData): Paragraph[] {
    const avgPPFD = data.ppfdAnalysis?.avg || 0
    const uniformity = data.ppfdAnalysis?.uniformity || 0
    
    const recommendations: string[] = []
    
    if (avgPPFD < 600) {
      recommendations.push('Consider increasing fixture density or upgrading to higher output fixtures to achieve optimal PPFD levels (600-900 μmol/m²/s for cannabis)')
    }
    if (uniformity < 0.8) {
      recommendations.push('Improve light uniformity by adjusting fixture spacing or adding supplemental lighting in low-intensity areas')
    }
    if (data.electricalAnalysis && data.electricalAnalysis.totalPower > 50000) {
      recommendations.push('Implement demand response strategies and time-of-use scheduling to reduce energy costs')
    }
    
    recommendations.push(
      'Install light intensity sensors for real-time monitoring and control',
      'Implement spectrum tuning capabilities for different growth phases',
      'Consider UV supplementation for enhanced cannabinoid production',
      'Establish regular maintenance schedules for optimal fixture performance'
    )
    
    return [
      new Paragraph({
        text: 'Recommendations',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: 'Based on our analysis, we recommend the following optimizations:',
        spacing: { after: 300 },
      }),
      ...recommendations.map((rec, index) => 
        new Paragraph({
          numbering: {
            reference: 'recommendations',
            level: 0,
          },
          text: rec,
          spacing: { after: 200 },
        })
      ),
    ]
  }

  private createAppendix(data: ReportData): Paragraph[] {
    return [
      new PageBreak(),
      new Paragraph({
        text: 'Appendix',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      new Paragraph({
        text: 'Glossary of Terms',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      this.createDefinition('PPFD', 'Photosynthetic Photon Flux Density - The amount of PAR light reaching a surface, measured in μmol/m²/s'),
      this.createDefinition('DLI', 'Daily Light Integral - The total amount of PAR received per day, measured in mol/m²/day'),
      this.createDefinition('PAR', 'Photosynthetically Active Radiation - Light wavelengths (400-700nm) used by plants for photosynthesis'),
      this.createDefinition('Efficacy', 'The efficiency of a light fixture, measured in μmol/J (micromoles per joule)'),
      this.createDefinition('Uniformity', 'The ratio of minimum to average light intensity, indicating how evenly light is distributed'),
      new Paragraph({
        text: 'Disclaimer',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: 'This report is based on theoretical calculations and modeling. Actual results may vary based on environmental conditions, fixture maintenance, and other factors. Professional installation and commissioning are recommended to achieve optimal performance.',
        spacing: { after: 200 },
      }),
    ]
  }

  // Helper methods
  private createBulletPoint(text: string): Paragraph {
    return new Paragraph({
      text,
      bullet: {
        level: 0,
      },
      spacing: { after: 100 },
    })
  }

  private createDefinition(term: string, definition: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: `${term}: `,
          bold: true,
        }),
        new TextRun({
          text: definition,
        }),
      ],
      spacing: { after: 150 },
    })
  }

  private createInfoTable(data: string[][]): Table {
    return new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: data.map(([label, value]) => 
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: label, bold: true })],
              width: { size: 40, type: WidthType.PERCENTAGE },
              shading: {
                fill: 'F3F4F6',
                type: ShadingType.SOLID,
              },
            }),
            new TableCell({
              children: [new Paragraph({ text: value })],
              width: { size: 60, type: WidthType.PERCENTAGE },
            }),
          ],
        })
      ),
    })
  }

  private createFixtureTable(fixtureData: Record<string, any>): Table {
    const headers = ['Fixture Model', 'Quantity', 'Wattage', 'PPF', 'Efficacy']
    const rows = [
      new TableRow({
        children: headers.map(header => 
          new TableCell({
            children: [new Paragraph({ text: header, bold: true, color: 'FFFFFF' })],
            shading: {
              fill: this.primaryColor,
              type: ShadingType.SOLID,
            },
          })
        ),
      }),
      ...Object.entries(fixtureData).map(([model, data]) => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: model })] }),
            new TableCell({ children: [new Paragraph({ text: data.count.toString() })] }),
            new TableCell({ children: [new Paragraph({ text: `${data.wattage}W` })] }),
            new TableCell({ children: [new Paragraph({ text: `${data.ppf} μmol/s` })] }),
            new TableCell({ children: [new Paragraph({ text: `${data.efficacy} μmol/J` })] }),
          ],
        })
      ),
    ]

    return new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows,
    })
  }
}

// Export Packer for use in the generator
export { Packer } from 'docx'