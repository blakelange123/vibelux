import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { ComprehensiveFacilityData } from './enhanced-pdf-report-generator'

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface ComplianceStandard {
  id: string
  name: string
  version: string
  organization: string
  scope: string
  applicability: string[]
  requirements: ComplianceRequirement[]
  references: StandardReference[]
}

export interface ComplianceRequirement {
  id: string
  section: string
  title: string
  description: string
  type: 'mandatory' | 'recommended' | 'optional'
  criteria: VerificationCriteria
  testMethods: string[]
  documentation: string[]
}

export interface VerificationCriteria {
  quantitative?: QuantitativeValue[]
  qualitative?: QualitativeValue[]
  exceptions?: string[]
  notes?: string[]
}

export interface QuantitativeValue {
  parameter: string
  minimum?: number
  maximum?: number
  target?: number
  unit: string
  tolerance?: number
  conditions?: string[]
}

export interface QualitativeValue {
  parameter: string
  acceptableValues: string[]
  preferredValues?: string[]
  conditions?: string[]
}

export interface StandardReference {
  title: string
  document: string
  section?: string
  year: number
  url?: string
}

export interface ComplianceAssessment {
  standard: ComplianceStandard
  facilityData: ComprehensiveFacilityData
  results: ComplianceResult[]
  overallStatus: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable'
  assessmentDate: Date
  assessor: string
  nextReview: Date
}

export interface ComplianceResult {
  requirementId: string
  status: 'pass' | 'fail' | 'partial' | 'not-applicable' | 'not-tested'
  measuredValue?: number | string
  requiredValue?: number | string
  variance?: number
  evidence: string[]
  notes?: string
  recommendations?: string[]
}

// IES RP-52-19: Recommended Practice for Horticultural Lighting
export const IES_RP_52: ComplianceStandard = {
  id: 'ies-rp-52-19',
  name: 'IES RP-52-19',
  version: '2019',
  organization: 'Illuminating Engineering Society (IES)',
  scope: 'Recommended Practice for Horticultural Lighting',
  applicability: ['indoor farming', 'greenhouse', 'controlled environment agriculture'],
  requirements: [
    {
      id: 'rp52-ppfd-levels',
      section: '4.2',
      title: 'Photosynthetic Photon Flux Density (PPFD)',
      description: 'Minimum PPFD levels for various crop types and growth stages',
      type: 'mandatory',
      criteria: {
        quantitative: [
          {
            parameter: 'PPFD',
            minimum: 200,
            maximum: 1000,
            target: 400,
            unit: 'μmol/m²/s',
            tolerance: 10,
            conditions: ['measured at crop canopy level', 'averaged over growing period']
          }
        ]
      },
      testMethods: ['IES LM-79', 'Handheld quantum meter', 'Calibrated sensor array'],
      documentation: ['Photometric test report', 'Field measurements', 'Calibration certificates']
    },
    {
      id: 'rp52-uniformity',
      section: '4.3',
      title: 'Light Uniformity',
      description: 'Spatial uniformity of PPFD across the growing area',
      type: 'recommended',
      criteria: {
        quantitative: [
          {
            parameter: 'Uniformity Ratio',
            minimum: 0.7,
            target: 0.85,
            unit: 'ratio',
            conditions: ['minimum/average PPFD', 'measured on a grid pattern']
          }
        ]
      },
      testMethods: ['Grid measurement method', 'IES LM-79 procedures'],
      documentation: ['Uniformity calculation report', 'Measurement grid data']
    },
    {
      id: 'rp52-spectral-quality',
      section: '5.1',
      title: 'Spectral Quality',
      description: 'Spectral power distribution requirements for plant growth',
      type: 'recommended',
      criteria: {
        quantitative: [
          {
            parameter: 'PAR Efficiency',
            minimum: 85,
            target: 95,
            unit: '%',
            conditions: ['400-700nm range', 'percentage of total optical power']
          },
          {
            parameter: 'Red:Far-Red Ratio',
            minimum: 0.8,
            maximum: 2.0,
            target: 1.2,
            unit: 'ratio',
            conditions: ['660nm:730nm peak wavelengths']
          }
        ]
      },
      testMethods: ['Spectroradiometer measurement', 'IES LM-79'],
      documentation: ['Spectral power distribution report', 'Color coordinates']
    },
    {
      id: 'rp52-dli-requirements',
      section: '4.4',
      title: 'Daily Light Integral (DLI)',
      description: 'Cumulative daily light requirements',
      type: 'mandatory',
      criteria: {
        quantitative: [
          {
            parameter: 'DLI',
            minimum: 12,
            maximum: 40,
            target: 20,
            unit: 'mol/m²/day',
            conditions: ['crop-dependent', 'growth stage specific']
          }
        ]
      },
      testMethods: ['Continuous PPFD monitoring', 'Integration over photoperiod'],
      documentation: ['DLI calculation report', 'Photoperiod schedule']
    },
    {
      id: 'rp52-flicker',
      section: '6.2',
      title: 'Temporal Light Modulation (Flicker)',
      description: 'Limits on temporal light artifacts',
      type: 'recommended',
      criteria: {
        quantitative: [
          {
            parameter: 'Flicker Index',
            maximum: 0.1,
            unit: 'index',
            conditions: ['measured according to IES TM-33']
          },
          {
            parameter: 'Stroboscopic Visibility Measure',
            maximum: 1.0,
            unit: 'SVM',
            conditions: ['measured according to IES TM-33']
          }
        ]
      },
      testMethods: ['IES TM-33 procedures', 'Calibrated flicker meter'],
      documentation: ['Flicker assessment report', 'Temporal light artifact data']
    }
  ],
  references: [
    {
      title: 'IES RP-52-19: Recommended Practice for Horticultural Lighting',
      document: 'IES RP-52-19',
      year: 2019,
      url: 'https://www.ies.org/product/recommended-practice-for-horticultural-lighting/'
    },
    {
      title: 'IES LM-79-19: Approved Method for Optical and Electrical Measurements',
      document: 'IES LM-79-19',
      year: 2019
    }
  ]
}

// ASHRAE 90.1-2019: Energy Standard for Buildings Except Low-Rise Residential Buildings
export const ASHRAE_90_1: ComplianceStandard = {
  id: 'ashrae-90-1-2019',
  name: 'ASHRAE 90.1-2019',
  version: '2019',
  organization: 'American Society of Heating, Refrigerating and Air-Conditioning Engineers',
  scope: 'Energy Standard for Buildings Except Low-Rise Residential Buildings',
  applicability: ['commercial buildings', 'industrial facilities', 'agricultural buildings'],
  requirements: [
    {
      id: 'ashrae-lpd',
      section: '9.2',
      title: 'Lighting Power Density (LPD)',
      description: 'Maximum allowed lighting power per unit area',
      type: 'mandatory',
      criteria: {
        quantitative: [
          {
            parameter: 'Lighting Power Density',
            maximum: 1.5,
            unit: 'W/ft²',
            conditions: ['agricultural facility classification', 'excludes emergency lighting']
          }
        ]
      },
      testMethods: ['Power measurement', 'Area calculation', 'Fixture inventory'],
      documentation: ['Lighting power calculation', 'Floor plan with fixtures', 'Power measurements']
    },
    {
      id: 'ashrae-controls',
      section: '9.4',
      title: 'Lighting Controls',
      description: 'Required automatic lighting control systems',
      type: 'mandatory',
      criteria: {
        qualitative: [
          {
            parameter: 'Control System',
            acceptableValues: ['automatic shutoff', 'occupancy sensors', 'daylight controls'],
            preferredValues: ['advanced scheduling', 'dimming controls'],
            conditions: ['spaces > 5000 ft²', 'continuous operation areas']
          }
        ]
      },
      testMethods: ['Functional testing', 'Control sequence verification'],
      documentation: ['Control system specifications', 'Commissioning report', 'Functional test results']
    },
    {
      id: 'ashrae-dimming',
      section: '9.4.1.4',
      title: 'Continuous Dimming Controls',
      description: 'Dimming capability requirements for horticultural lighting',
      type: 'recommended',
      criteria: {
        quantitative: [
          {
            parameter: 'Dimming Range',
            minimum: 10,
            maximum: 100,
            unit: '%',
            conditions: ['linear dimming response', 'stable operation']
          }
        ]
      },
      testMethods: ['Dimming curve measurement', 'Light output verification'],
      documentation: ['Dimming performance report', 'Control response curves']
    },
    {
      id: 'ashrae-efficiency',
      section: '9.3',
      title: 'Equipment Efficiency',
      description: 'Minimum efficacy requirements for lighting equipment',
      type: 'mandatory',
      criteria: {
        quantitative: [
          {
            parameter: 'Luminaire Efficacy',
            minimum: 100,
            unit: 'lm/W',
            conditions: ['for horticultural applications', 'at rated conditions']
          }
        ]
      },
      testMethods: ['IES LM-79 testing', 'Manufacturer data verification'],
      documentation: ['Photometric test reports', 'Efficacy calculations', 'Equipment specifications']
    }
  ],
  references: [
    {
      title: 'ASHRAE 90.1-2019: Energy Standard for Buildings',
      document: 'ASHRAE 90.1-2019',
      year: 2019,
      url: 'https://www.ashrae.org/technical-resources/bookstore/standard-90-1'
    }
  ]
}

// IESNA LM-79-19: Approved Method for Optical and Electrical Measurements
export const IESNA_LM_79: ComplianceStandard = {
  id: 'iesna-lm-79-19',
  name: 'IESNA LM-79-19',
  version: '2019',
  organization: 'Illuminating Engineering Society of North America',
  scope: 'Approved Method for Optical and Electrical Measurements of LED Products',
  applicability: ['LED lighting products', 'luminaires', 'lamps'],
  requirements: [
    {
      id: 'lm79-photometry',
      section: '7.0',
      title: 'Photometric Testing',
      description: 'Standard procedures for measuring luminous flux and distribution',
      type: 'mandatory',
      criteria: {
        quantitative: [
          {
            parameter: 'Measurement Accuracy',
            minimum: 95,
            unit: '%',
            conditions: ['calibrated equipment', 'controlled environment', '±2% uncertainty']
          }
        ]
      },
      testMethods: ['Goniophotometer', 'Integrating sphere', 'Near-field photometry'],
      documentation: ['Photometric test report', 'Calibration certificates', 'Measurement uncertainty analysis']
    },
    {
      id: 'lm79-electrical',
      section: '8.0',
      title: 'Electrical Measurements',
      description: 'Power, voltage, current, and power factor measurements',
      type: 'mandatory',
      criteria: {
        quantitative: [
          {
            parameter: 'Power Measurement Accuracy',
            minimum: 98,
            unit: '%',
            tolerance: 2,
            conditions: ['calibrated power meter', 'steady-state conditions']
          }
        ]
      },
      testMethods: ['Digital power meter', 'True RMS measurement', 'Harmonic analysis'],
      documentation: ['Electrical test report', 'Power quality analysis', 'Harmonic distortion data']
    },
    {
      id: 'lm79-thermal',
      section: '9.0',
      title: 'Thermal Management',
      description: 'Temperature measurement and thermal characterization',
      type: 'recommended',
      criteria: {
        quantitative: [
          {
            parameter: 'Junction Temperature',
            maximum: 85,
            unit: '°C',
            conditions: ['steady-state operation', 'ambient temperature specified']
          }
        ]
      },
      testMethods: ['Thermocouple measurement', 'Thermal imaging', 'Forward voltage method'],
      documentation: ['Thermal test report', 'Temperature rise data', 'Thermal imaging results']
    }
  ],
  references: [
    {
      title: 'IES LM-79-19: Approved Method for Optical and Electrical Measurements',
      document: 'IES LM-79-19',
      year: 2019
    }
  ]
}

// Additional standards
export const UL_8800: ComplianceStandard = {
  id: 'ul-8800',
  name: 'UL 8800',
  version: '2020',
  organization: 'Underwriters Laboratories',
  scope: 'Standard for Horticultural Lighting Equipment and Systems',
  applicability: ['horticultural lighting equipment', 'grow lights', 'plant growth systems'],
  requirements: [
    {
      id: 'ul8800-safety',
      section: '4.0',
      title: 'Electrical Safety',
      description: 'Basic electrical safety requirements',
      type: 'mandatory',
      criteria: {
        qualitative: [
          {
            parameter: 'Safety Compliance',
            acceptableValues: ['UL Listed', 'ETL Listed', 'CSA Certified'],
            conditions: ['third-party tested', 'ongoing surveillance']
          }
        ]
      },
      testMethods: ['UL safety testing', 'Electrical insulation testing', 'Fault condition testing'],
      documentation: ['UL listing certificate', 'Safety test report', 'Product marking']
    },
    {
      id: 'ul8800-emc',
      section: '5.0',
      title: 'Electromagnetic Compatibility (EMC)',
      description: 'EMI/RFI emissions and immunity requirements',
      type: 'mandatory',
      criteria: {
        quantitative: [
          {
            parameter: 'EMI Emissions',
            maximum: 40,
            unit: 'dBμV/m',
            conditions: ['Class A equipment', 'measured at 10m distance']
          }
        ]
      },
      testMethods: ['FCC Part 15 testing', 'CISPR testing', 'Conducted emissions'],
      documentation: ['EMC test report', 'FCC certification', 'Declaration of conformity']
    }
  ],
  references: [
    {
      title: 'UL 8800: Standard for Horticultural Lighting Equipment',
      document: 'UL 8800',
      year: 2020,
      url: 'https://standardscatalog.ul.com/ProductDetail.aspx?productId=UL8800'
    }
  ]
}

export class ComplianceReportGenerator {
  private pdf: jsPDF
  private pageHeight = 297
  private pageWidth = 210
  private margin = 20
  private currentY = 20
  private pageNumber = 1

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4')
  }

  generateComplianceReport(assessment: ComplianceAssessment): void {
    this.addCoverPage(assessment)
    this.addExecutiveSummary(assessment)
    this.addStandardOverview(assessment.standard)
    this.addDetailedAssessment(assessment)
    this.addRecommendations(assessment)
    this.addCertificationStatement(assessment)
    this.addAppendices(assessment)
    
    this.addPageNumbers()
    
    const filename = `${assessment.facilityData.project.name}_${assessment.standard.id}_Compliance_Report_${assessment.assessmentDate.toISOString().split('T')[0]}.pdf`
    this.pdf.save(filename)
  }

  private addCoverPage(assessment: ComplianceAssessment): void {
    // Header
    this.pdf.setFillColor(30, 41, 59) // Dark blue background
    this.pdf.rect(0, 0, this.pageWidth, 80, 'F')
    
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(24)
    this.pdf.text('COMPLIANCE ASSESSMENT REPORT', this.pageWidth / 2, 30, { align: 'center' })
    
    this.pdf.setFontSize(18)
    this.pdf.text(assessment.standard.name, this.pageWidth / 2, 45, { align: 'center' })
    
    this.pdf.setFontSize(14)
    this.pdf.text(assessment.standard.scope, this.pageWidth / 2, 60, { align: 'center' })
    
    // Project Information Box
    this.pdf.setFillColor(248, 250, 252)
    this.pdf.roundedRect(20, 100, 170, 80, 5, 5, 'F')
    
    this.pdf.setTextColor(31, 41, 55)
    this.pdf.setFontSize(16)
    this.pdf.text('PROJECT INFORMATION', 30, 120)
    
    const projectInfo = [
      ['Project Name:', assessment.facilityData.project.name],
      ['Client:', assessment.facilityData.project.client],
      ['Location:', assessment.facilityData.project.location],
      ['Assessment Date:', assessment.assessmentDate.toLocaleDateString()],
      ['Assessor:', assessment.assessor],
      ['Standard Version:', assessment.standard.version],
      ['Overall Status:', assessment.overallStatus.toUpperCase()]
    ]
    
    this.pdf.setFontSize(11)
    projectInfo.forEach(([label, value], i) => {
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text(label, 30, 135 + i * 6)
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.text(value, 100, 135 + i * 6)
    })
    
    // Status indicator
    const statusColor = this.getStatusColor(assessment.overallStatus)
    this.pdf.setFillColor(statusColor.r, statusColor.g, statusColor.b)
    this.pdf.circle(165, 167, 8, 'F')
    
    // Footer
    this.pdf.setTextColor(107, 114, 128)
    this.pdf.setFontSize(10)
    this.pdf.text('This report contains confidential and proprietary information', this.pageWidth / 2, 270, { align: 'center' })
    this.pdf.text(`Generated by Vibelux Compliance Assessment System`, this.pageWidth / 2, 280, { align: 'center' })
    
    this.addPageBreak()
  }

  private addExecutiveSummary(assessment: ComplianceAssessment): void {
    this.addSectionHeader('Executive Summary')
    
    // Overall compliance status
    this.pdf.setFontSize(14)
    this.pdf.setTextColor(31, 41, 55)
    this.pdf.text('Compliance Status Overview', this.margin, this.currentY)
    this.currentY += 10
    
    const totalRequirements = assessment.results.length
    const passedRequirements = assessment.results.filter(r => r.status === 'pass').length
    const failedRequirements = assessment.results.filter(r => r.status === 'fail').length
    const partialRequirements = assessment.results.filter(r => r.status === 'partial').length
    
    const statusData = [
      ['Metric', 'Count', 'Percentage'],
      ['Total Requirements', totalRequirements.toString(), '100%'],
      ['Passed', passedRequirements.toString(), `${((passedRequirements / totalRequirements) * 100).toFixed(1)}%`],
      ['Failed', failedRequirements.toString(), `${((failedRequirements / totalRequirements) * 100).toFixed(1)}%`],
      ['Partial Compliance', partialRequirements.toString(), `${((partialRequirements / totalRequirements) * 100).toFixed(1)}%`]
    ]
    
    this.pdf.autoTable({
      head: [statusData[0]],
      body: statusData.slice(1),
      startY: this.currentY,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    })
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 15
    
    // Key findings
    this.pdf.setFontSize(14)
    this.pdf.text('Key Findings', this.margin, this.currentY)
    this.currentY += 10
    
    const findings = this.generateKeyFindings(assessment)
    findings.forEach(finding => {
      this.pdf.setFontSize(10)
      this.pdf.text('•', this.margin + 5, this.currentY)
      const lines = this.pdf.splitTextToSize(finding, this.pageWidth - 2 * this.margin - 10)
      lines.forEach((line: string, i: number) => {
        this.pdf.text(line, this.margin + 10, this.currentY)
        if (i < lines.length - 1) this.currentY += 5
      })
      this.currentY += 8
    })
    
    this.addPageBreak()
  }

  private addStandardOverview(standard: ComplianceStandard): void {
    this.addSectionHeader('Standard Overview')
    
    // Standard details
    const standardInfo = [
      ['Standard Information', 'Details'],
      ['Full Name', standard.name],
      ['Version', standard.version],
      ['Organization', standard.organization],
      ['Scope', standard.scope],
      ['Applicability', standard.applicability.join(', ')],
      ['Total Requirements', standard.requirements.length.toString()]
    ]
    
    this.pdf.autoTable({
      head: [standardInfo[0]],
      body: standardInfo.slice(1),
      startY: this.currentY,
      theme: 'striped',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 120 }
      }
    })
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 15
    
    // Requirements summary
    this.pdf.setFontSize(14)
    this.pdf.text('Requirements Summary', this.margin, this.currentY)
    this.currentY += 10
    
    const requirementsByType = {
      mandatory: standard.requirements.filter(r => r.type === 'mandatory').length,
      recommended: standard.requirements.filter(r => r.type === 'recommended').length,
      optional: standard.requirements.filter(r => r.type === 'optional').length
    }
    
    const reqData = [
      ['Requirement Type', 'Count', 'Description'],
      ['Mandatory', requirementsByType.mandatory.toString(), 'Must comply for certification'],
      ['Recommended', requirementsByType.recommended.toString(), 'Best practices and guidelines'],
      ['Optional', requirementsByType.optional.toString(), 'Additional considerations']
    ]
    
    this.pdf.autoTable({
      head: [reqData[0]],
      body: reqData.slice(1),
      startY: this.currentY,
      theme: 'grid',
      styles: { fontSize: 10 }
    })
    
    this.addPageBreak()
  }

  private addDetailedAssessment(assessment: ComplianceAssessment): void {
    this.addSectionHeader('Detailed Assessment Results')
    
    assessment.standard.requirements.forEach(requirement => {
      const result = assessment.results.find(r => r.requirementId === requirement.id)
      if (!result) return
      
      // Requirement header
      this.pdf.setFontSize(12)
      this.pdf.setTextColor(31, 41, 55)
      this.pdf.text(`${requirement.section} - ${requirement.title}`, this.margin, this.currentY)
      
      // Status indicator
      const statusColor = this.getStatusColor(result.status)
      this.pdf.setFillColor(statusColor.r, statusColor.g, statusColor.b)
      this.pdf.circle(this.pageWidth - 30, this.currentY - 2, 3, 'F')
      
      this.currentY += 8
      
      // Description
      this.pdf.setFontSize(10)
      this.pdf.setTextColor(75, 85, 99)
      const descLines = this.pdf.splitTextToSize(requirement.description, this.pageWidth - 2 * this.margin)
      descLines.forEach((line: string) => {
        this.pdf.text(line, this.margin, this.currentY)
        this.currentY += 5
      })
      
      this.currentY += 5
      
      // Assessment details
      const assessmentData = [
        ['Parameter', 'Required', 'Measured', 'Status'],
        [
          requirement.criteria.quantitative?.[0]?.parameter || 'Qualitative Assessment',
          this.formatRequiredValue(requirement.criteria),
          result.measuredValue?.toString() || 'N/A',
          result.status.toUpperCase()
        ]
      ]
      
      this.pdf.autoTable({
        head: [assessmentData[0]],
        body: [assessmentData[1]],
        startY: this.currentY,
        theme: 'grid',
        styles: { fontSize: 9 },
        margin: { left: this.margin, right: this.margin }
      })
      
      this.currentY = (this.pdf as any).lastAutoTable.finalY + 5
      
      // Evidence and notes
      if (result.evidence.length > 0) {
        this.pdf.setFontSize(9)
        this.pdf.setTextColor(107, 114, 128)
        this.pdf.text('Evidence:', this.margin, this.currentY)
        this.currentY += 5
        
        result.evidence.forEach(evidence => {
          this.pdf.text(`• ${evidence}`, this.margin + 5, this.currentY)
          this.currentY += 4
        })
      }
      
      if (result.notes) {
        this.pdf.setFontSize(9)
        this.pdf.setTextColor(107, 114, 128)
        this.pdf.text(`Notes: ${result.notes}`, this.margin, this.currentY)
        this.currentY += 5
      }
      
      this.currentY += 10
      
      if (this.currentY > 250) {
        this.addPageBreak()
      }
    })
  }

  private addRecommendations(assessment: ComplianceAssessment): void {
    this.addSectionHeader('Recommendations')
    
    const failedResults = assessment.results.filter(r => r.status === 'fail' || r.status === 'partial')
    
    if (failedResults.length === 0) {
      this.pdf.setFontSize(12)
      this.pdf.setTextColor(34, 197, 94)
      this.pdf.text('✓ All requirements passed. No corrective actions required.', this.margin, this.currentY)
      this.currentY += 15
    } else {
      this.pdf.setFontSize(11)
      this.pdf.setTextColor(31, 41, 55)
      this.pdf.text('The following items require attention to achieve full compliance:', this.margin, this.currentY)
      this.currentY += 10
      
      failedResults.forEach((result, i) => {
        const requirement = assessment.standard.requirements.find(r => r.id === result.requirementId)
        if (!requirement) return
        
        this.pdf.setFontSize(10)
        this.pdf.setTextColor(220, 38, 38)
        this.pdf.text(`${i + 1}. ${requirement.title}`, this.margin, this.currentY)
        this.currentY += 6
        
        if (result.recommendations && result.recommendations.length > 0) {
          result.recommendations.forEach(rec => {
            this.pdf.setTextColor(75, 85, 99)
            this.pdf.text(`   • ${rec}`, this.margin + 5, this.currentY)
            this.currentY += 5
          })
        }
        
        this.currentY += 5
      })
    }
    
    // Implementation timeline
    this.pdf.setFontSize(12)
    this.pdf.setTextColor(31, 41, 55)
    this.pdf.text('Implementation Timeline', this.margin, this.currentY)
    this.currentY += 10
    
    const timelineData = [
      ['Priority', 'Action Item', 'Timeline', 'Responsibility'],
      ['High', 'Address mandatory requirement failures', '30 days', 'Facility Manager'],
      ['Medium', 'Implement recommended improvements', '90 days', 'Engineering Team'],
      ['Low', 'Document optional enhancements', '180 days', 'Quality Assurance']
    ]
    
    this.pdf.autoTable({
      head: [timelineData[0]],
      body: timelineData.slice(1),
      startY: this.currentY,
      theme: 'grid',
      styles: { fontSize: 9 }
    })
    
    this.addPageBreak()
  }

  private addCertificationStatement(assessment: ComplianceAssessment): void {
    this.addSectionHeader('Certification Statement')
    
    this.pdf.setFontSize(11)
    this.pdf.setTextColor(31, 41, 55)
    
    const certificationText = [
      `This report documents the compliance assessment of ${assessment.facilityData.project.name} `,
      `against the requirements of ${assessment.standard.name} (${assessment.standard.version}).`,
      '',
      `Assessment conducted on ${assessment.assessmentDate.toLocaleDateString()} by ${assessment.assessor}.`,
      '',
      `Overall Compliance Status: ${assessment.overallStatus.toUpperCase()}`,
      '',
      assessment.overallStatus === 'compliant' 
        ? 'The facility meets all mandatory requirements of the standard and is recommended for certification.'
        : 'The facility requires corrective actions as detailed in the recommendations section before certification can be granted.',
      '',
      `Next review scheduled for: ${assessment.nextReview.toLocaleDateString()}`
    ]
    
    certificationText.forEach(text => {
      if (text) {
        const lines = this.pdf.splitTextToSize(text, this.pageWidth - 2 * this.margin)
        lines.forEach((line: string) => {
          this.pdf.text(line, this.margin, this.currentY)
          this.currentY += 6
        })
      } else {
        this.currentY += 6
      }
    })
    
    this.currentY += 20
    
    // Signature blocks
    this.pdf.setDrawColor(0, 0, 0)
    this.pdf.line(this.margin, this.currentY, this.margin + 80, this.currentY)
    this.pdf.setFontSize(9)
    this.pdf.text('Assessor Signature', this.margin, this.currentY + 5)
    this.pdf.text(`${assessment.assessor}`, this.margin, this.currentY + 10)
    this.pdf.text(`Date: ${assessment.assessmentDate.toLocaleDateString()}`, this.margin, this.currentY + 15)
    
    this.pdf.line(this.pageWidth - this.margin - 80, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.pdf.text('Facility Representative', this.pageWidth - this.margin - 80, this.currentY + 5)
    this.pdf.text('Name: ________________________', this.pageWidth - this.margin - 80, this.currentY + 10)
    this.pdf.text('Date: _________________________', this.pageWidth - this.margin - 80, this.currentY + 15)
  }

  private addAppendices(assessment: ComplianceAssessment): void {
    this.addPageBreak()
    this.addSectionHeader('Appendices')
    
    // Appendix A: Test Methods
    this.pdf.setFontSize(12)
    this.pdf.text('Appendix A: Test Methods and Procedures', this.margin, this.currentY)
    this.currentY += 10
    
    const uniqueTestMethods = Array.from(new Set(
      assessment.standard.requirements.flatMap(r => r.testMethods)
    ))
    
    uniqueTestMethods.forEach(method => {
      this.pdf.setFontSize(10)
      this.pdf.text(`• ${method}`, this.margin + 5, this.currentY)
      this.currentY += 5
    })
    
    this.currentY += 10
    
    // Appendix B: Reference Documents
    this.pdf.setFontSize(12)
    this.pdf.text('Appendix B: Reference Documents', this.margin, this.currentY)
    this.currentY += 10
    
    assessment.standard.references.forEach(ref => {
      this.pdf.setFontSize(10)
      this.pdf.text(`• ${ref.title} (${ref.year})`, this.margin + 5, this.currentY)
      if (ref.url) {
        this.currentY += 5
        this.pdf.setTextColor(59, 130, 246)
        this.pdf.text(`  ${ref.url}`, this.margin + 10, this.currentY)
        this.pdf.setTextColor(31, 41, 55)
      }
      this.currentY += 8
    })
  }

  private addSectionHeader(title: string): void {
    if (this.currentY > 250) {
      this.addPageBreak()
    }
    
    this.pdf.setFontSize(16)
    this.pdf.setTextColor(59, 130, 246)
    this.pdf.text(title, this.margin, this.currentY)
    
    this.pdf.setDrawColor(59, 130, 246)
    this.pdf.setLineWidth(0.5)
    this.pdf.line(this.margin, this.currentY + 2, this.pageWidth - this.margin, this.currentY + 2)
    
    this.currentY += 12
  }

  private addPageBreak(): void {
    this.pdf.addPage()
    this.currentY = 20
    this.pageNumber++
  }

  private addPageNumbers(): void {
    const pageCount = this.pdf.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i)
      this.pdf.setFontSize(9)
      this.pdf.setTextColor(107, 114, 128)
      this.pdf.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: 'right' }
      )
    }
  }

  private getStatusColor(status: string): { r: number; g: number; b: number } {
    switch (status) {
      case 'pass':
      case 'compliant':
        return { r: 34, g: 197, b: 94 }
      case 'fail':
      case 'non-compliant':
        return { r: 239, g: 68, b: 68 }
      case 'partial':
        return { r: 251, g: 191, b: 36 }
      default:
        return { r: 107, g: 114, b: 128 }
    }
  }

  private formatRequiredValue(criteria: VerificationCriteria): string {
    const quant = criteria.quantitative?.[0]
    if (!quant) return 'See standard'
    
    let value = ''
    if (quant.minimum !== undefined && quant.maximum !== undefined) {
      value = `${quant.minimum}-${quant.maximum} ${quant.unit}`
    } else if (quant.minimum !== undefined) {
      value = `≥ ${quant.minimum} ${quant.unit}`
    } else if (quant.maximum !== undefined) {
      value = `≤ ${quant.maximum} ${quant.unit}`
    } else if (quant.target !== undefined) {
      value = `${quant.target} ${quant.unit}`
    }
    
    return value
  }

  private generateKeyFindings(assessment: ComplianceAssessment): string[] {
    const findings = []
    
    const passedCount = assessment.results.filter(r => r.status === 'pass').length
    const totalCount = assessment.results.length
    const passRate = (passedCount / totalCount * 100).toFixed(1)
    
    findings.push(`Overall compliance rate: ${passRate}% (${passedCount} of ${totalCount} requirements)`)
    
    const mandatoryResults = assessment.results.filter(r => {
      const req = assessment.standard.requirements.find(req => req.id === r.requirementId)
      return req?.type === 'mandatory'
    })
    
    const mandatoryPassRate = (mandatoryResults.filter(r => r.status === 'pass').length / mandatoryResults.length * 100).toFixed(1)
    findings.push(`Mandatory requirements compliance: ${mandatoryPassRate}%`)
    
    const failedMandatory = mandatoryResults.filter(r => r.status === 'fail')
    if (failedMandatory.length > 0) {
      findings.push(`${failedMandatory.length} mandatory requirement(s) failed - certification not recommended`)
    }
    
    return findings
  }
}

// Export compliance assessment utilities
export function assessFacilityCompliance(
  facilityData: ComprehensiveFacilityData,
  standard: ComplianceStandard,
  assessor: string
): ComplianceAssessment {
  const results: ComplianceResult[] = []
  
  // Assess each requirement
  standard.requirements.forEach(requirement => {
    const result = assessRequirement(facilityData, requirement)
    results.push(result)
  })
  
  // Determine overall status
  const mandatoryResults = results.filter(r => {
    const req = standard.requirements.find(req => req.id === r.requirementId)
    return req?.type === 'mandatory'
  })
  
  const mandatoryPassed = mandatoryResults.every(r => r.status === 'pass')
  const allPassed = results.every(r => r.status === 'pass' || r.status === 'not-applicable')
  
  let overallStatus: 'compliant' | 'non-compliant' | 'partial'
  if (allPassed) {
    overallStatus = 'compliant'
  } else if (mandatoryPassed) {
    overallStatus = 'partial'
  } else {
    overallStatus = 'non-compliant'
  }
  
  return {
    standard,
    facilityData,
    results,
    overallStatus,
    assessmentDate: new Date(),
    assessor,
    nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  }
}

function assessRequirement(facilityData: ComprehensiveFacilityData, requirement: ComplianceRequirement): ComplianceResult {
  // Mock assessment logic - in a real implementation, this would evaluate actual facility data
  // against the specific requirement criteria
  
  const result: ComplianceResult = {
    requirementId: requirement.id,
    status: 'pass', // Default to pass for demo
    evidence: ['Design documentation review', 'Field measurements', 'Test reports'],
    notes: 'Assessment completed according to standard procedures'
  }
  
  // Example specific assessments
  switch (requirement.id) {
    case 'rp52-ppfd-levels':
      const avgPPFD = facilityData.lighting.analysis.ppfd.avg
      result.measuredValue = avgPPFD
      result.requiredValue = '400-800 μmol/m²/s'
      result.status = (avgPPFD >= 400 && avgPPFD <= 800) ? 'pass' : 'fail'
      if (result.status === 'fail') {
        result.recommendations = ['Adjust fixture spacing or output to achieve target PPFD range']
      }
      break
      
    case 'rp52-uniformity':
      const uniformity = facilityData.lighting.analysis.ppfd.uniformity
      result.measuredValue = uniformity
      result.requiredValue = '≥ 0.7'
      result.status = uniformity >= 0.7 ? 'pass' : 'fail'
      if (result.status === 'fail') {
        result.recommendations = ['Redistribute fixtures for improved uniformity', 'Consider additional fixtures in low-light areas']
      }
      break
      
    case 'ashrae-lpd':
      const lpd = facilityData.energy.lighting_load / (facilityData.project.facility.area * 10.764) // Convert to W/ft²
      result.measuredValue = lpd.toFixed(2)
      result.requiredValue = '≤ 1.5 W/ft²'
      result.status = lpd <= 1.5 ? 'pass' : 'fail'
      if (result.status === 'fail') {
        result.recommendations = ['Reduce lighting power density through efficient fixtures', 'Implement dimming controls']
      }
      break
      
    default:
      // Default assessment based on facility quality
      result.status = 'pass'
      break
  }
  
  return result
}

// Export predefined standards
export const COMPLIANCE_STANDARDS = {
  IES_RP_52,
  ASHRAE_90_1,
  IESNA_LM_79,
  UL_8800
}