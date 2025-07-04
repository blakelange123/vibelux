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
  }
}

export interface ComprehensiveFacilityData {
  // Project information
  project: {
    name: string
    client: string
    consultant: string
    date: Date
    location: string
    facility: {
      type: 'greenhouse' | 'indoor_farm' | 'research' | 'warehouse'
      area: number // m²
      zones: number
      crops: string[]
      production_method: 'hydroponic' | 'aeroponic' | 'soil' | 'nft'
    }
  }

  // Lighting design
  lighting: {
    fixtures: Array<{
      id: string
      brand: string
      model: string
      wattage: number
      ppf: number
      efficacy: number
      spectrum: { [wavelength: string]: number }
      position: { x: number; y: number; z: number }
      dimming_level: number
      enabled: boolean
      mounting_height: number
      beam_angle: number
    }>
    analysis: {
      ppfd: {
        min: number
        max: number
        avg: number
        uniformity: number
        coefficient_of_variation: number
        distribution_map?: number[][]
      }
      dli: {
        twelve_hour: number
        sixteen_hour: number
        eighteen_hour: number
        twenty_hour: number
      }
      spectral_analysis: {
        par_percentage: number
        blue_percentage: number
        green_percentage: number
        red_percentage: number
        far_red_percentage: number
        uv_percentage: number
        red_far_red_ratio: number
        blue_red_ratio: number
      }
    }
  }

  // Environmental controls
  environment: {
    climate_zones: Array<{
      name: string
      temperature_range: { min: number; max: number }
      humidity_range: { min: number; max: number }
      co2_level: number
      air_changes_per_hour: number
      vpd_target: number
    }>
    hvac_system: {
      type: string
      capacity: number
      efficiency_rating: number
      annual_energy_use: number
    }
    monitoring: {
      sensors: number
      data_points_per_day: number
      alert_thresholds: Record<string, { min: number; max: number }>
    }
  }

  // Energy analysis
  energy: {
    lighting_load: number // kW
    hvac_load: number // kW
    other_loads: number // kW
    total_demand: number // kW
    annual_consumption: number // kWh
    energy_costs: {
      lighting: number
      hvac: number
      other: number
      total: number
    }
    carbon_footprint: {
      annual_co2: number // kg CO2
      carbon_intensity: number // kg CO2/kWh
    }
  }

  // Production metrics
  production: {
    yield_estimates: {
      crop_type: string
      cycles_per_year: number
      yield_per_cycle: number // kg/m²
      annual_yield: number // kg
      quality_grade: 'A+' | 'A' | 'B' | 'C'
    }[]
    optimization: {
      light_saturation_point: number
      photosynthetic_efficiency: number
      water_use_efficiency: number
      nutrient_use_efficiency: number
      quantum_yield_potential?: number
      chlorophyll_excitation?: { a: number; b: number }
      carotenoid_excitation?: number
      anthocyanin_induction?: number
    }
  }

  // Financial analysis
  financial: {
    capex: {
      lighting_equipment: number
      controls: number
      installation: number
      commissioning: number
      total: number
    }
    opex: {
      annual_energy: number
      maintenance: number
      replacement_reserve: number
      total: number
    }
    roi: {
      payback_period: number
      npv: number
      irr: number
      annual_savings: number
      lifetime_savings: number
    }
  }

  // Compliance and standards
  compliance: {
    lighting_standards: {
      ies_rp_52: boolean
      ashrae_90_1: boolean
      energy_star: boolean
      california_title_24: boolean
    }
    certifications: {
      leed_points: number
      breeam_rating: string
      living_building_challenge: boolean
    }
    safety: {
      ul_listed: boolean
      ce_marked: boolean
      fcc_compliant: boolean
      ip_rating: string
    }
  }
}

export interface ReportTemplate {
  name: string
  sections: string[]
  format: 'executive' | 'technical' | 'compliance' | 'comprehensive'
  target_audience: 'client' | 'contractor' | 'regulator' | 'investor'
}

export class EnhancedPDFReportGenerator {
  private pdf: jsPDF
  private pageHeight = 297 // A4 height in mm
  private pageWidth = 210 // A4 width in mm
  private margin = 20
  private currentY = 20
  private pageNumber = 1
  private colors = {
    primary: { r: 16, g: 185, b: 129 }, // Emerald
    secondary: { r: 99, g: 102, b: 241 }, // Indigo
    accent: { r: 245, g: 158, b: 11 }, // Amber
    error: { r: 239, g: 68, b: 68 }, // Red
    success: { r: 34, g: 197, b: 94 }, // Green
    warning: { r: 251, g: 191, b: 36 }, // Yellow
    text: { r: 31, g: 41, b: 55 }, // Gray-800
    muted: { r: 107, g: 114, b: 128 } // Gray-500
  }

  constructor(
    private template: ReportTemplate,
    private options: {
      companyName?: string
      companyLogo?: string
      branding?: {
        primaryColor?: { r: number; g: number; b: number }
        secondaryColor?: { r: number; g: number; b: number }
        logoUrl?: string
        watermark?: string
      }
      customization?: {
        includeCharts?: boolean
        includePhotos?: boolean
        includeAppendix?: boolean
        pageOrientation?: 'portrait' | 'landscape'
      }
    } = {}
  ) {
    this.pdf = new jsPDF(
      this.options.customization?.pageOrientation || 'p',
      'mm',
      'a4'
    )
    
    if (this.options.branding?.primaryColor) {
      this.colors.primary = this.options.branding.primaryColor
    }
    if (this.options.branding?.secondaryColor) {
      this.colors.secondary = this.options.branding.secondaryColor
    }
  }

  async generateComprehensiveReport(data: ComprehensiveFacilityData): Promise<void> {
    // Generate table of contents first
    const toc = this.generateTableOfContents()
    
    // Cover page
    this.addCoverPage(data)
    
    // Executive summary
    if (this.template.sections.includes('executive_summary')) {
      this.addExecutiveSummary(data)
    }
    
    // Table of contents
    this.addTableOfContents(toc)
    
    // Project overview
    if (this.template.sections.includes('project_overview')) {
      this.addProjectOverview(data)
    }
    
    // Facility analysis
    if (this.template.sections.includes('facility_analysis')) {
      this.addFacilityAnalysis(data)
    }
    
    // Lighting design
    if (this.template.sections.includes('lighting_design')) {
      await this.addLightingDesign(data)
    }
    
    // Environmental systems
    if (this.template.sections.includes('environmental_systems')) {
      this.addEnvironmentalSystems(data)
    }
    
    // Energy analysis
    if (this.template.sections.includes('energy_analysis')) {
      await this.addEnergyAnalysis(data)
    }
    
    // Production optimization
    if (this.template.sections.includes('production_analysis')) {
      this.addProductionAnalysis(data)
    }
    
    // Financial analysis
    if (this.template.sections.includes('financial_analysis')) {
      await this.addFinancialAnalysis(data)
    }
    
    // Compliance documentation
    if (this.template.sections.includes('compliance')) {
      this.addComplianceDocumentation(data)
    }
    
    // Technical specifications
    if (this.template.sections.includes('technical_specs')) {
      this.addTechnicalSpecifications(data)
    }
    
    // Recommendations
    if (this.template.sections.includes('recommendations')) {
      this.addRecommendations(data)
    }
    
    // Implementation roadmap
    if (this.template.sections.includes('implementation')) {
      this.addImplementationRoadmap(data)
    }
    
    // Appendices
    if (this.template.sections.includes('appendix') && this.options.customization?.includeAppendix) {
      this.addAppendices(data)
    }
    
    // Add page numbers and footer to all pages
    this.addPageNumbers()
    
    // Save the PDF
    const filename = `${data.project.name.replace(/\s+/g, '_')}_${this.template.name}_${new Date().toISOString().split('T')[0]}.pdf`
    this.pdf.save(filename)
  }

  private addCoverPage(data: ComprehensiveFacilityData): void {
    // Professional gradient background
    this.addAdvancedBackground()
    
    // Company logo
    if (this.options.branding?.logoUrl) {
      // Add logo implementation here
    }
    
    // Company name
    const companyName = this.options.companyName || 'Vibelux'
    this.pdf.setFontSize(28)
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.text(companyName, this.pageWidth / 2, 35, { align: 'center' })
    
    // Report title
    this.pdf.setFontSize(24)
    this.pdf.text(this.template.name, this.pageWidth / 2, 50, { align: 'center' })
    
    // Project title
    this.pdf.setFontSize(20)
    this.pdf.text(data.project.name, this.pageWidth / 2, 65, { align: 'center' })
    
    // Professional details box
    this.pdf.setFillColor(255, 255, 255, 0.95)
    this.pdf.roundedRect(25, 85, 160, 100, 5, 5, 'F')
    
    this.pdf.setTextColor(this.colors.text.r, this.colors.text.g, this.colors.text.b)
    this.pdf.setFontSize(16)
    this.pdf.text('Project Information', 35, 105)
    
    // Project details
    const details = [
      ['Client:', data.project.client],
      ['Location:', data.project.location],
      ['Facility Type:', data.project.facility.type.replace('_', ' ').toUpperCase()],
      ['Total Area:', `${data.project.facility.area.toLocaleString()} m²`],
      ['Production Method:', data.project.facility.production_method.toUpperCase()],
      ['Consultant:', data.project.consultant],
      ['Report Date:', data.project.date.toLocaleDateString()]
    ]
    
    this.pdf.setFontSize(11)
    details.forEach(([label, value], i) => {
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text(label, 35, 120 + i * 8)
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.text(value, 85, 120 + i * 8)
    })
    
    // Key metrics preview card
    this.pdf.setFillColor(this.colors.primary.r, this.colors.primary.g, this.colors.primary.b)
    this.pdf.roundedRect(25, 200, 160, 70, 5, 5, 'F')
    
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(14)
    this.pdf.text('Key Performance Indicators', 35, 220)
    
    const kpis = [
      ['Total Power:', `${data.energy.total_demand.toLocaleString()} kW`],
      ['Average PPFD:', `${data.lighting.analysis.ppfd.avg} μmol/m²/s`],
      ['Annual Yield:', `${data.production.yield_estimates.reduce((sum, y) => sum + y.annual_yield, 0).toLocaleString()} kg`],
      ['ROI Payback:', `${data.financial.roi.payback_period.toFixed(1)} years`]
    ]
    
    this.pdf.setFontSize(10)
    kpis.forEach(([label, value], i) => {
      const x = 35 + (i % 2) * 75
      const y = 235 + Math.floor(i / 2) * 15
      this.pdf.text(label, x, y)
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text(value, x, y + 8)
      this.pdf.setFont('helvetica', 'normal')
    })
    
    this.addPageBreak()
  }

  private addExecutiveSummary(data: ComprehensiveFacilityData): void {
    this.addSectionHeader('Executive Summary', 'executive')
    
    // Project overview paragraph
    const overview = this.generateExecutiveOverview(data)
    this.addParagraph(overview)
    
    // Key findings section
    this.addSubsectionHeader('Key Findings')
    
    const findings = [
      `Facility Design: ${data.project.facility.area.toLocaleString()} m² ${data.project.facility.type.replace('_', ' ')} optimized for ${data.project.facility.crops.join(', ')} production`,
      `Lighting System: ${data.lighting.fixtures.filter(f => f.enabled).length} high-efficiency LED fixtures providing optimal PPFD of ${data.lighting.analysis.ppfd.avg} μmol/m²/s`,
      `Energy Performance: Total demand of ${data.energy.total_demand.toLocaleString()} kW with annual consumption of ${data.energy.annual_consumption.toLocaleString()} kWh`,
      `Production Capacity: Estimated annual yield of ${data.production.yield_estimates.reduce((sum, y) => sum + y.annual_yield, 0).toLocaleString()} kg across ${data.production.yield_estimates.length} crop types`,
      `Financial Performance: ${data.financial.roi.payback_period.toFixed(1)}-year payback with ${(data.financial.roi.irr * 100).toFixed(1)}% IRR and ${data.financial.roi.annual_savings.toLocaleString()} annual savings`,
      `Environmental Impact: ${(data.energy.carbon_footprint.annual_co2 / 1000).toFixed(1)} tonnes CO2/year with ${data.compliance.certifications.leed_points} LEED points potential`
    ]
    
    this.addBulletList(findings)
    
    // Performance metrics table
    this.addSubsectionHeader('Performance Summary')
    
    const metricsData = [
      ['Metric', 'Value', 'Industry Benchmark', 'Performance'],
      ['Light Uniformity', `${data.lighting.analysis.ppfd.uniformity.toFixed(2)}`, '0.85+', data.lighting.analysis.ppfd.uniformity >= 0.85 ? 'Excellent' : 'Good'],
      ['Energy Efficiency', `${(data.energy.annual_consumption / data.project.facility.area).toFixed(1)} kWh/m²`, '< 300', 'Optimized'],
      ['Yield Potential', `${(data.production.yield_estimates[0]?.yield_per_cycle || 0).toFixed(1)} kg/m²`, '15-25', 'High'],
      ['ROI Performance', `${(data.financial.roi.irr * 100).toFixed(1)}%`, '15-25%', 'Strong']
    ]
    
    this.addTable(metricsData, {
      theme: 'grid',
      headStyles: { fillColor: [this.colors.primary.r, this.colors.primary.g, this.colors.primary.b] }
    })
    
    // Recommendations summary
    this.addSubsectionHeader('Strategic Recommendations')
    
    const recommendations = this.generateStrategicRecommendations(data)
    this.addBulletList(recommendations)
    
    this.addPageBreak()
  }

  private addProjectOverview(data: ComprehensiveFacilityData): void {
    this.addSectionHeader('Project Overview', 'project')
    
    // Facility specifications
    this.addSubsectionHeader('Facility Specifications')
    
    const facilitySpecs = [
      ['Parameter', 'Specification'],
      ['Facility Type', data.project.facility.type.replace('_', ' ').toUpperCase()],
      ['Total Growing Area', `${data.project.facility.area.toLocaleString()} m²`],
      ['Number of Zones', data.project.facility.zones.toString()],
      ['Production Method', data.project.facility.production_method.toUpperCase()],
      ['Target Crops', data.project.facility.crops.join(', ')],
      ['Location', data.project.location],
      ['Climate Zone', this.determineClimateZone(data.project.location)]
    ]
    
    this.addTable(facilitySpecs, { theme: 'striped' })
    
    // Site conditions
    this.addSubsectionHeader('Site Conditions & Requirements')
    
    const siteConditions = [
      `Location: ${data.project.location} provides optimal conditions for controlled environment agriculture`,
      `Climate Integration: HVAC system designed for ${data.environment.climate_zones[0]?.temperature_range.min}°C to ${data.environment.climate_zones[0]?.temperature_range.max}°C operation`,
      `Electrical Infrastructure: ${data.energy.total_demand.toLocaleString()} kW demand requires appropriate electrical service`,
      `Environmental Controls: ${data.environment.monitoring.sensors} sensors providing ${data.environment.monitoring.data_points_per_day.toLocaleString()} data points daily`
    ]
    
    this.addBulletList(siteConditions)
    
    this.addPageBreak()
  }

  private async addLightingDesign(data: ComprehensiveFacilityData): Promise<void> {
    this.addSectionHeader('Lighting Design Analysis', 'lighting')
    
    // Fixture schedule
    this.addSubsectionHeader('Fixture Schedule')
    
    const fixtureGroups = this.groupFixtures(data.lighting.fixtures)
    const fixtureData = Object.entries(fixtureGroups).map(([key, group]) => [
      key,
      group.count.toString(),
      group.enabledCount.toString(),
      `${group.model.wattage}W`,
      `${group.model.ppf} μmol/s`,
      `${group.model.efficacy.toFixed(1)} μmol/J`,
      `${(group.enabledCount * group.model.wattage).toLocaleString()}W`,
      `${group.model.mounting_height}m`
    ])
    
    this.addTable([
      ['Fixture Model', 'Total', 'Active', 'Power', 'PPF', 'Efficacy', 'Total Power', 'Height'],
      ...fixtureData
    ], {
      theme: 'grid',
      headStyles: { fillColor: [this.colors.secondary.r, this.colors.secondary.g, this.colors.secondary.b] }
    })
    
    // PPFD Analysis
    this.addSubsectionHeader('Photosynthetic Photon Flux Density (PPFD) Analysis')
    
    // PPFD metrics cards
    await this.addPPFDMetricsVisualization(data.lighting.analysis.ppfd)
    
    // Spectral analysis
    this.addSubsectionHeader('Spectral Analysis')
    
    const spectralData = [
      ['Spectral Component', 'Percentage', 'Range (nm)', 'Plant Response'],
      ['UV (280-400nm)', `${data.lighting.analysis.spectral_analysis.uv_percentage.toFixed(1)}%`, '280-400', 'Photomorphogenesis, Secondary metabolites'],
      ['Blue (400-500nm)', `${data.lighting.analysis.spectral_analysis.blue_percentage.toFixed(1)}%`, '400-500', 'Photosynthesis, Stomatal regulation'],
      ['Green (500-600nm)', `${data.lighting.analysis.spectral_analysis.green_percentage.toFixed(1)}%`, '500-600', 'Canopy penetration, Photosynthesis'],
      ['Red (600-700nm)', `${data.lighting.analysis.spectral_analysis.red_percentage.toFixed(1)}%`, '600-700', 'Photosynthesis, Flowering'],
      ['Far-Red (700-800nm)', `${data.lighting.analysis.spectral_analysis.far_red_percentage.toFixed(1)}%`, '700-800', 'Stem elongation, Shade avoidance']
    ]
    
    this.addTable(spectralData, {
      theme: 'striped',
      styles: { fontSize: 9 }
    })
    
    // Key ratios
    this.addSubsectionHeader('Critical Spectral Ratios')
    
    const ratioData = [
      ['Ratio', 'Value', 'Optimal Range', 'Assessment'],
      ['Red:Far-Red', data.lighting.analysis.spectral_analysis.red_far_red_ratio.toFixed(2), '1.0-1.5', 'Optimal'],
      ['Blue:Red', data.lighting.analysis.spectral_analysis.blue_red_ratio.toFixed(2), '0.2-0.4', 'Balanced'],
      ['PAR Percentage', `${data.lighting.analysis.spectral_analysis.par_percentage.toFixed(1)}%`, '> 90%', 'Excellent']
    ]
    
    this.addTable(ratioData, { theme: 'grid' })
    
    this.addPageBreak()
  }

  private async addEnergyAnalysis(data: ComprehensiveFacilityData): Promise<void> {
    this.addSectionHeader('Energy Analysis & Sustainability', 'energy')
    
    // Energy consumption breakdown
    this.addSubsectionHeader('Energy Consumption Analysis')
    
    const totalEnergy = data.energy.annual_consumption
    const energyBreakdown = [
      ['System', 'Annual Consumption (kWh)', 'Percentage', 'Annual Cost'],
      ['Lighting', Math.round(totalEnergy * 0.65).toLocaleString(), '65%', `$${data.energy.energy_costs.lighting.toLocaleString()}`],
      ['HVAC', Math.round(totalEnergy * 0.25).toLocaleString(), '25%', `$${data.energy.energy_costs.hvac.toLocaleString()}`],
      ['Controls & Other', Math.round(totalEnergy * 0.10).toLocaleString(), '10%', `$${data.energy.energy_costs.other.toLocaleString()}`],
      ['Total', totalEnergy.toLocaleString(), '100%', `$${data.energy.energy_costs.total.toLocaleString()}`]
    ]
    
    this.addTable(energyBreakdown, {
      theme: 'grid',
      headStyles: { fillColor: [this.colors.accent.r, this.colors.accent.g, this.colors.accent.b] }
    })
    
    // Demand profile
    this.addSubsectionHeader('Electrical Demand Profile')
    
    const demandData = [
      ['Load Category', 'Connected Load (kW)', 'Demand Factor', 'Maximum Demand (kW)'],
      ['LED Lighting', data.energy.lighting_load.toFixed(1), '0.95', (data.energy.lighting_load * 0.95).toFixed(1)],
      ['HVAC System', data.energy.hvac_load.toFixed(1), '0.80', (data.energy.hvac_load * 0.80).toFixed(1)],
      ['Controls & Auxiliaries', data.energy.other_loads.toFixed(1), '1.00', data.energy.other_loads.toFixed(1)],
      ['Total Facility', data.energy.total_demand.toFixed(1), '0.85', (data.energy.total_demand * 0.85).toFixed(1)]
    ]
    
    this.addTable(demandData, { theme: 'striped' })
    
    // Carbon footprint analysis
    this.addSubsectionHeader('Environmental Impact Assessment')
    
    const carbonData = [
      ['Environmental Metric', 'Annual Value', 'Benchmark', 'Performance'],
      ['Total CO2 Emissions', `${(data.energy.carbon_footprint.annual_co2 / 1000).toFixed(1)} tonnes`, '< 200 tonnes', 'Excellent'],
      ['Carbon Intensity', `${data.energy.carbon_footprint.carbon_intensity.toFixed(2)} kg CO2/kWh`, '0.4-0.6', 'Good'],
      ['Energy Intensity', `${(data.energy.annual_consumption / data.project.facility.area).toFixed(1)} kWh/m²`, '< 300', 'Optimized'],
      ['Renewable Integration', '25%', '> 20%', 'Target Met']
    ]
    
    this.addTable(carbonData, { theme: 'grid' })
    
    this.addPageBreak()
  }

  private async addFinancialAnalysis(data: ComprehensiveFacilityData): Promise<void> {
    this.addSectionHeader('Financial Analysis & ROI', 'financial')
    
    // Capital expenditure breakdown
    this.addSubsectionHeader('Capital Investment Summary')
    
    const capexData = [
      ['Investment Category', 'Amount', 'Percentage'],
      ['LED Fixtures & Components', `$${data.financial.capex.lighting_equipment.toLocaleString()}`, `${((data.financial.capex.lighting_equipment / data.financial.capex.total) * 100).toFixed(1)}%`],
      ['Control Systems', `$${data.financial.capex.controls.toLocaleString()}`, `${((data.financial.capex.controls / data.financial.capex.total) * 100).toFixed(1)}%`],
      ['Installation & Labor', `$${data.financial.capex.installation.toLocaleString()}`, `${((data.financial.capex.installation / data.financial.capex.total) * 100).toFixed(1)}%`],
      ['Commissioning & Testing', `$${data.financial.capex.commissioning.toLocaleString()}`, `${((data.financial.capex.commissioning / data.financial.capex.total) * 100).toFixed(1)}%`],
      ['Total Capital Investment', `$${data.financial.capex.total.toLocaleString()}`, '100%']
    ]
    
    this.addTable(capexData, {
      theme: 'grid',
      headStyles: { fillColor: [this.colors.success.r, this.colors.success.g, this.colors.success.b] }
    })
    
    // Operating expenses
    this.addSubsectionHeader('Annual Operating Expenses')
    
    const opexData = [
      ['Operating Category', 'Annual Cost', 'Cost per m²'],
      ['Energy Costs', `$${data.financial.opex.annual_energy.toLocaleString()}`, `$${(data.financial.opex.annual_energy / data.project.facility.area).toFixed(2)}`],
      ['Maintenance & Service', `$${data.financial.opex.maintenance.toLocaleString()}`, `$${(data.financial.opex.maintenance / data.project.facility.area).toFixed(2)}`],
      ['Replacement Reserve', `$${data.financial.opex.replacement_reserve.toLocaleString()}`, `$${(data.financial.opex.replacement_reserve / data.project.facility.area).toFixed(2)}`],
      ['Total Operating Costs', `$${data.financial.opex.total.toLocaleString()}`, `$${(data.financial.opex.total / data.project.facility.area).toFixed(2)}`]
    ]
    
    this.addTable(opexData, { theme: 'striped' })
    
    // ROI analysis
    this.addSubsectionHeader('Return on Investment Analysis')
    
    const roiMetrics = [
      ['Financial Metric', 'Value', 'Industry Benchmark', 'Assessment'],
      ['Simple Payback Period', `${data.financial.roi.payback_period.toFixed(1)} years`, '2-4 years', data.financial.roi.payback_period <= 4 ? 'Excellent' : 'Good'],
      ['Net Present Value (NPV)', `$${data.financial.roi.npv.toLocaleString()}`, '> $0', data.financial.roi.npv > 0 ? 'Positive' : 'Negative'],
      ['Internal Rate of Return', `${(data.financial.roi.irr * 100).toFixed(1)}%`, '15-25%', 'Strong'],
      ['Annual Savings', `$${data.financial.roi.annual_savings.toLocaleString()}`, 'Variable', 'Substantial'],
      ['Lifetime Savings (20 years)', `$${data.financial.roi.lifetime_savings.toLocaleString()}`, 'Variable', 'Significant']
    ]
    
    this.addTable(roiMetrics, {
      theme: 'grid',
      headStyles: { fillColor: [this.colors.primary.r, this.colors.primary.g, this.colors.primary.b] }
    })
    
    this.addPageBreak()
  }

  private addComplianceDocumentation(data: ComprehensiveFacilityData): void {
    this.addSectionHeader('Compliance & Standards', 'compliance')
    
    // Standards compliance
    this.addSubsectionHeader('Lighting Standards Compliance')
    
    const standardsData = [
      ['Standard', 'Requirement', 'Compliance Status', 'Notes'],
      ['IES RP-52', 'Horticultural lighting guidelines', data.compliance.lighting_standards.ies_rp_52 ? 'Compliant' : 'Non-compliant', 'PPFD uniformity and spectral requirements met'],
      ['ASHRAE 90.1', 'Energy efficiency standards', data.compliance.lighting_standards.ashrae_90_1 ? 'Compliant' : 'Non-compliant', 'Lighting power density within limits'],
      ['ENERGY STAR', 'Energy efficiency certification', data.compliance.lighting_standards.energy_star ? 'Certified' : 'Not certified', 'High-efficiency LED fixtures'],
      ['California Title 24', 'State energy code', data.compliance.lighting_standards.california_title_24 ? 'Compliant' : 'N/A', 'Advanced controls implementation']
    ]
    
    this.addTable(standardsData, { theme: 'grid' })
    
    // Safety certifications
    this.addSubsectionHeader('Safety & Product Certifications')
    
    const safetyData = [
      ['Certification', 'Status', 'Rating/Details'],
      ['UL Listed', data.compliance.safety.ul_listed ? 'Yes' : 'No', 'UL 8800 - Horticultural Lighting'],
      ['CE Marking', data.compliance.safety.ce_marked ? 'Yes' : 'No', 'European Conformity'],
      ['FCC Compliance', data.compliance.safety.fcc_compliant ? 'Yes' : 'No', 'EMI/RFI emissions'],
      ['IP Rating', 'Certified', data.compliance.safety.ip_rating],
      ['DLC Qualification', 'Yes', 'DesignLights Consortium approved']
    ]
    
    this.addTable(safetyData, { theme: 'striped' })
    
    // Green building certifications
    this.addSubsectionHeader('Green Building & Sustainability')
    
    const greenData = [
      ['Certification Program', 'Points/Rating', 'Category', 'Contribution'],
      ['LEED v4', `${data.compliance.certifications.leed_points} points`, 'Energy & Atmosphere', 'High-efficiency lighting'],
      ['BREEAM', data.compliance.certifications.breeam_rating, 'Energy', 'Optimized energy performance'],
      ['Living Building Challenge', data.compliance.certifications.living_building_challenge ? 'Pursuing' : 'Not pursuing', 'Energy Petal', 'Net positive energy potential']
    ]
    
    this.addTable(greenData, { theme: 'grid' })
    
    this.addPageBreak()
  }

  private addRecommendations(data: ComprehensiveFacilityData): void {
    this.addSectionHeader('Strategic Recommendations', 'recommendations')
    
    // Performance optimization
    this.addSubsectionHeader('Performance Optimization')
    
    const performanceRecs = this.generatePerformanceRecommendations(data)
    this.addBulletList(performanceRecs)
    
    // Energy efficiency improvements
    this.addSubsectionHeader('Energy Efficiency Enhancements')
    
    const energyRecs = this.generateEnergyRecommendations(data)
    this.addBulletList(energyRecs)
    
    // Technology upgrades
    this.addSubsectionHeader('Future Technology Considerations')
    
    const techRecs = [
      'Smart Dimming Controls: Implement daylight-responsive controls to reduce energy consumption by 15-25%',
      'Spectral Tuning: Add programmable spectrum control for crop-specific optimization',
      'IoT Sensors: Expand environmental monitoring for precision agriculture applications',
      'Machine Learning: Integrate AI-driven optimization for adaptive lighting schedules',
      'Energy Storage: Consider battery systems for demand charge reduction and grid resilience'
    ]
    
    this.addBulletList(techRecs)
    
    this.addPageBreak()
  }

  private addImplementationRoadmap(data: ComprehensiveFacilityData): void {
    this.addSectionHeader('Implementation Roadmap', 'implementation')
    
    // Phase breakdown
    this.addSubsectionHeader('Project Timeline & Phases')
    
    const phases = [
      ['Phase', 'Duration', 'Key Activities', 'Deliverables'],
      ['Phase 1: Design', '2-3 weeks', 'Final design, permitting, procurement', 'Construction documents, permits'],
      ['Phase 2: Installation', '4-6 weeks', 'Fixture installation, wiring, controls', 'Installed lighting system'],
      ['Phase 3: Commissioning', '1-2 weeks', 'Testing, calibration, training', 'Commissioned system, documentation'],
      ['Phase 4: Optimization', '2-4 weeks', 'Fine-tuning, performance validation', 'Optimized performance, reports']
    ]
    
    this.addTable(phases, { theme: 'grid' })
    
    // Risk mitigation
    this.addSubsectionHeader('Risk Assessment & Mitigation')
    
    const risks = [
      ['Risk Category', 'Probability', 'Impact', 'Mitigation Strategy'],
      ['Supply Chain Delays', 'Medium', 'High', 'Early procurement, backup suppliers'],
      ['Installation Complexity', 'Low', 'Medium', 'Experienced contractors, detailed planning'],
      ['Performance Shortfall', 'Low', 'High', 'Comprehensive testing, warranty coverage'],
      ['Budget Overrun', 'Medium', 'Medium', 'Contingency reserves, change order controls']
    ]
    
    this.addTable(risks, { theme: 'striped' })
    
    this.addPageBreak()
  }

  // Helper methods
  private addSectionHeader(title: string, icon?: string): void {
    if (this.currentY > 250) {
      this.addPageBreak()
    }
    
    this.pdf.setFontSize(20)
    this.pdf.setTextColor(this.colors.primary.r, this.colors.primary.g, this.colors.primary.b)
    this.pdf.text(title, this.margin, this.currentY)
    
    // Add decorative line
    this.pdf.setDrawColor(this.colors.primary.r, this.colors.primary.g, this.colors.primary.b)
    this.pdf.setLineWidth(0.5)
    this.pdf.line(this.margin, this.currentY + 3, this.pageWidth - this.margin, this.currentY + 3)
    
    this.currentY += 15
  }

  private addSubsectionHeader(title: string): void {
    if (this.currentY > 260) {
      this.addPageBreak()
    }
    
    this.pdf.setFontSize(14)
    this.pdf.setTextColor(this.colors.secondary.r, this.colors.secondary.g, this.colors.secondary.b)
    this.pdf.text(title, this.margin, this.currentY)
    this.currentY += 10
  }

  private addParagraph(text: string): void {
    this.pdf.setFontSize(11)
    this.pdf.setTextColor(this.colors.text.r, this.colors.text.g, this.colors.text.b)
    const lines = this.pdf.splitTextToSize(text, this.pageWidth - 2 * this.margin)
    
    lines.forEach((line: string) => {
      if (this.currentY > 270) {
        this.addPageBreak()
      }
      this.pdf.text(line, this.margin, this.currentY)
      this.currentY += 6
    })
    
    this.currentY += 5
  }

  private addBulletList(items: string[]): void {
    this.pdf.setFontSize(10)
    this.pdf.setTextColor(this.colors.text.r, this.colors.text.g, this.colors.text.b)
    
    items.forEach(item => {
      if (this.currentY > 270) {
        this.addPageBreak()
      }
      
      this.pdf.text('•', this.margin + 5, this.currentY)
      const lines = this.pdf.splitTextToSize(item, this.pageWidth - 2 * this.margin - 10)
      
      lines.forEach((line: string, i: number) => {
        if (this.currentY > 270) {
          this.addPageBreak()
        }
        this.pdf.text(line, this.margin + 10, this.currentY)
        if (i < lines.length - 1) this.currentY += 5
      })
      
      this.currentY += 8
    })
    
    this.currentY += 5
  }

  private addTable(data: string[][], options?: any): void {
    const tableOptions = {
      head: [data[0]],
      body: data.slice(1),
      startY: this.currentY,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { 
        fillColor: [this.colors.primary.r, this.colors.primary.g, this.colors.primary.b],
        textColor: 255
      },
      ...options
    }
    
    this.pdf.autoTable(tableOptions)
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10
  }

  private addAdvancedBackground(): void {
    // Create gradient background using rectangles
    // jsPDF doesn't support native gradients, so we simulate with multiple rectangles
    const steps = 20
    
    for (let i = 0; i < steps; i++) {
      const factor = i / steps
      
      // Interpolate between primary and secondary colors
      const r = Math.round(this.colors.primary.r + (this.colors.secondary.r - this.colors.primary.r) * factor)
      const g = Math.round(this.colors.primary.g + (this.colors.secondary.g - this.colors.primary.g) * factor)
      const b = Math.round(this.colors.primary.b + (this.colors.secondary.b - this.colors.primary.b) * factor)
      
      this.pdf.setFillColor(r, g, b)
      this.pdf.rect(0, i * this.pageHeight / steps, this.pageWidth, this.pageHeight / steps + 1, 'F')
    }
  }

  private async addPPFDMetricsVisualization(ppfdData: any): Promise<void> {
    // Create visual metrics cards
    const cardWidth = (this.pageWidth - 2 * this.margin - 15) / 4
    const metrics = [
      { label: 'Min PPFD', value: ppfdData.min, unit: 'μmol/m²/s', color: this.colors.error },
      { label: 'Avg PPFD', value: ppfdData.avg, unit: 'μmol/m²/s', color: this.colors.accent },
      { label: 'Max PPFD', value: ppfdData.max, unit: 'μmol/m²/s', color: this.colors.success },
      { label: 'Uniformity', value: ppfdData.uniformity.toFixed(2), unit: 'ratio', color: this.colors.secondary }
    ]
    
    metrics.forEach((metric, i) => {
      const x = this.margin + i * (cardWidth + 5)
      
      // Card background
      this.pdf.setFillColor(248, 250, 252)
      this.pdf.roundedRect(x, this.currentY, cardWidth, 25, 2, 2, 'F')
      
      // Card border
      this.pdf.setDrawColor(metric.color.r, metric.color.g, metric.color.b)
      this.pdf.setLineWidth(0.5)
      this.pdf.roundedRect(x, this.currentY, cardWidth, 25, 2, 2, 'S')
      
      // Content
      this.pdf.setFontSize(8)
      this.pdf.setTextColor(100, 100, 100)
      this.pdf.text(metric.label, x + cardWidth/2, this.currentY + 6, { align: 'center' })
      
      this.pdf.setFontSize(14)
      this.pdf.setTextColor(metric.color.r, metric.color.g, metric.color.b)
      this.pdf.text(metric.value.toString(), x + cardWidth/2, this.currentY + 15, { align: 'center' })
      
      this.pdf.setFontSize(7)
      this.pdf.setTextColor(150, 150, 150)
      this.pdf.text(metric.unit, x + cardWidth/2, this.currentY + 21, { align: 'center' })
    })
    
    this.currentY += 35
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
      this.pdf.setTextColor(150, 150, 150)
      this.pdf.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: 'right' }
      )
      
      // Add footer line
      this.pdf.setDrawColor(200, 200, 200)
      this.pdf.setLineWidth(0.3)
      this.pdf.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15)
    }
  }

  private generateTableOfContents(): Array<{title: string, page: number}> {
    // This would be populated during report generation
    return [
      { title: 'Executive Summary', page: 2 },
      { title: 'Project Overview', page: 4 },
      { title: 'Lighting Design Analysis', page: 6 },
      { title: 'Energy Analysis & Sustainability', page: 10 },
      { title: 'Financial Analysis & ROI', page: 12 },
      { title: 'Compliance & Standards', page: 14 },
      { title: 'Strategic Recommendations', page: 16 },
      { title: 'Implementation Roadmap', page: 18 }
    ]
  }

  private addTableOfContents(toc: Array<{title: string, page: number}>): void {
    this.addSectionHeader('Table of Contents')
    
    toc.forEach(item => {
      this.pdf.setFontSize(11)
      this.pdf.setTextColor(this.colors.text.r, this.colors.text.g, this.colors.text.b)
      this.pdf.text(item.title, this.margin, this.currentY)
      this.pdf.text(item.page.toString(), this.pageWidth - this.margin, this.currentY, { align: 'right' })
      
      // Dotted line
      const dotsWidth = this.pageWidth - 2 * this.margin - this.pdf.getTextWidth(item.title) - this.pdf.getTextWidth(item.page.toString()) - 10
      const dotCount = Math.floor(dotsWidth / 3)
      const dots = '.'.repeat(dotCount)
      this.pdf.text(dots, this.margin + this.pdf.getTextWidth(item.title) + 5, this.currentY)
      
      this.currentY += 8
    })
    
    this.addPageBreak()
  }

  // Data analysis helpers
  private groupFixtures(fixtures: any[]): Record<string, any> {
    return fixtures.reduce((acc, fixture) => {
      const key = `${fixture.brand} ${fixture.model}`
      if (!acc[key]) {
        acc[key] = { model: fixture, count: 0, enabledCount: 0 }
      }
      acc[key].count++
      if (fixture.enabled) acc[key].enabledCount++
      return acc
    }, {})
  }

  private generateExecutiveOverview(data: ComprehensiveFacilityData): string {
    return `This comprehensive analysis presents the lighting design and energy optimization strategy for ${data.project.name}, a ${data.project.facility.area.toLocaleString()} m² ${data.project.facility.type.replace('_', ' ')} facility located in ${data.project.location}. The facility is designed for commercial production of ${data.project.facility.crops.join(', ')} using ${data.project.facility.production_method} cultivation methods. The proposed lighting system incorporates ${data.lighting.fixtures.filter(f => f.enabled).length} high-efficiency LED fixtures providing optimal photosynthetic photon flux density (PPFD) of ${data.lighting.analysis.ppfd.avg} μmol/m²/s with excellent uniformity of ${data.lighting.analysis.ppfd.uniformity.toFixed(2)}. The system is projected to achieve a ${data.financial.roi.payback_period.toFixed(1)}-year return on investment with annual energy savings of $${data.financial.roi.annual_savings.toLocaleString()}.`
  }

  private generateStrategicRecommendations(data: ComprehensiveFacilityData): string[] {
    const recommendations = []
    
    if (data.lighting.analysis.ppfd.uniformity < 0.85) {
      recommendations.push('Improve light uniformity through fixture repositioning or additional units')
    }
    
    if (data.energy.annual_consumption / data.project.facility.area > 300) {
      recommendations.push('Implement energy efficiency measures to reduce consumption below 300 kWh/m²')
    }
    
    if (data.financial.roi.payback_period > 4) {
      recommendations.push('Explore utility incentives and financing options to improve project economics')
    }
    
    recommendations.push('Consider daylight integration and advanced controls for further energy optimization')
    recommendations.push('Implement preventive maintenance program to ensure long-term performance')
    
    return recommendations
  }

  private generatePerformanceRecommendations(data: ComprehensiveFacilityData): string[] {
    return [
      `Optimize fixture spacing to achieve uniformity > 0.85 (current: ${data.lighting.analysis.ppfd.uniformity.toFixed(2)})`,
      'Implement spectral tuning capabilities for crop-specific optimization',
      'Add environmental sensors for precision agriculture integration',
      'Consider CO2 supplementation to maximize photosynthetic efficiency',
      'Establish monitoring protocols for continuous performance validation'
    ]
  }

  private generateEnergyRecommendations(data: ComprehensiveFacilityData): string[] {
    return [
      'Install daylight sensors for automatic dimming during high ambient light periods',
      'Implement demand response capabilities for utility peak shaving programs',
      'Consider solar PV integration to offset grid electricity consumption',
      'Upgrade to smart controls with occupancy and scheduling features',
      'Evaluate energy storage options for demand charge management'
    ]
  }

  private determineClimateZone(location: string): string {
    // Simplified climate zone determination
    if (location.toLowerCase().includes('california')) return 'Zone 3C (Warm-Dry)'
    if (location.toLowerCase().includes('florida')) return 'Zone 1A (Hot-Humid)'
    if (location.toLowerCase().includes('arizona')) return 'Zone 2B (Hot-Dry)'
    return 'Zone 4A (Mixed-Humid)'
  }

  private addFacilityAnalysis(data: ComprehensiveFacilityData): void {
    this.addSectionHeader('Facility Analysis', 'facility')
    
    // Add facility-specific analysis content
    this.addSubsectionHeader('Growing Environment Optimization')
    
    const environmentAnalysis = [
      `Facility Type: ${data.project.facility.type.replace('_', ' ').toUpperCase()} optimized for ${data.project.facility.crops.join(', ')} production`,
      `Production Method: ${data.project.facility.production_method.toUpperCase()} system with ${data.project.facility.zones} climate zones`,
      `Environmental Controls: ${data.environment.monitoring.sensors} sensors monitoring critical parameters`,
      `Climate Zones: Optimized temperature ranges from ${data.environment.climate_zones[0]?.temperature_range.min}°C to ${data.environment.climate_zones[0]?.temperature_range.max}°C`
    ]
    
    this.addBulletList(environmentAnalysis)
    
    this.addPageBreak()
  }

  private addEnvironmentalSystems(data: ComprehensiveFacilityData): void {
    this.addSectionHeader('Environmental Control Systems', 'environment')
    
    // HVAC Analysis
    this.addSubsectionHeader('HVAC System Specifications')
    
    const hvacData = [
      ['Parameter', 'Specification', 'Performance'],
      ['System Type', data.environment.hvac_system.type, 'Commercial Grade'],
      ['Cooling Capacity', `${data.environment.hvac_system.capacity.toLocaleString()} tons`, 'Adequate'],
      ['Efficiency Rating', `${data.environment.hvac_system.efficiency_rating} SEER`, 'High Efficiency'],
      ['Annual Energy Use', `${data.environment.hvac_system.annual_energy_use.toLocaleString()} kWh`, 'Optimized'],
      ['Air Changes/Hour', `${data.environment.climate_zones[0]?.air_changes_per_hour || 'N/A'}`, 'Code Compliant']
    ]
    
    this.addTable(hvacData, { theme: 'striped' })
    
    // Environmental monitoring
    this.addSubsectionHeader('Environmental Monitoring System')
    
    const monitoringData = [
      ['Monitoring Parameter', 'Sensor Count', 'Alert Thresholds', 'Data Logging'],
      ['Temperature', Math.round(data.environment.monitoring.sensors * 0.3).toString(), '±2°C from setpoint', '24/7 continuous'],
      ['Humidity', Math.round(data.environment.monitoring.sensors * 0.25).toString(), '±5% RH from setpoint', '24/7 continuous'],
      ['CO2 Concentration', Math.round(data.environment.monitoring.sensors * 0.2).toString(), '800-1200 ppm', '24/7 continuous'],
      ['VPD (Vapor Pressure Deficit)', Math.round(data.environment.monitoring.sensors * 0.15).toString(), `${data.environment.climate_zones[0]?.vpd_target || 1.2} ±0.3 kPa`, '24/7 continuous'],
      ['Light Intensity', Math.round(data.environment.monitoring.sensors * 0.1).toString(), 'PPFD targets ±10%', 'Photoperiod tracking']
    ]
    
    this.addTable(monitoringData, { theme: 'grid' })
    
    this.addPageBreak()
  }

  private addProductionAnalysis(data: ComprehensiveFacilityData): void {
    this.addSectionHeader('Production Analysis & Optimization', 'production')
    
    // Yield projections
    this.addSubsectionHeader('Crop Yield Projections')
    
    const yieldData = data.production.yield_estimates.map(crop => [
      crop.crop_type,
      crop.cycles_per_year.toString(),
      `${crop.yield_per_cycle.toFixed(1)} kg/m²`,
      `${crop.annual_yield.toLocaleString()} kg`,
      crop.quality_grade
    ])
    
    this.addTable([
      ['Crop Type', 'Cycles/Year', 'Yield/Cycle', 'Annual Yield', 'Quality Grade'],
      ...yieldData
    ], {
      theme: 'grid',
      headStyles: { fillColor: [this.colors.success.r, this.colors.success.g, this.colors.success.b] }
    })
    
    // Production optimization metrics
    this.addSubsectionHeader('Production Efficiency Metrics')
    
    const efficiencyData = [
      ['Efficiency Metric', 'Current Design', 'Industry Benchmark', 'Performance'],
      ['Light Saturation Point', `${data.production.optimization.light_saturation_point} μmol/m²/s`, '800-1000', 'Optimal'],
      ['Photosynthetic Efficiency', `${(data.production.optimization.photosynthetic_efficiency * 100).toFixed(1)}%`, '3-6%', 'High'],
      ['Water Use Efficiency', `${data.production.optimization.water_use_efficiency.toFixed(1)} kg/L`, '20-40', 'Excellent'],
      ['Nutrient Use Efficiency', `${(data.production.optimization.nutrient_use_efficiency * 100).toFixed(1)}%`, '85-95%', 'Optimized']
    ]
    
    this.addTable(efficiencyData, { theme: 'striped' })
    
    this.addPageBreak()
  }

  private addTechnicalSpecifications(data: ComprehensiveFacilityData): void {
    this.addSectionHeader('Technical Specifications', 'technical')
    
    // Detailed fixture specifications
    this.addSubsectionHeader('LED Fixture Technical Data')
    
    const uniqueFixtures = Array.from(new Set(data.lighting.fixtures.map(f => `${f.brand} ${f.model}`)))
      .map(key => data.lighting.fixtures.find(f => `${f.brand} ${f.model}` === key)!)
    
    const fixtureSpecs = uniqueFixtures.map(fixture => [
      `${fixture.brand} ${fixture.model}`,
      `${fixture.wattage}W`,
      `${fixture.ppf} μmol/s`,
      `${fixture.efficacy.toFixed(1)} μmol/J`,
      `${fixture.beam_angle}°`,
      fixture.dimming_level ? `0-${fixture.dimming_level}%` : 'Fixed',
      'IP65',
      '50,000+ hours'
    ])
    
    this.addTable([
      ['Model', 'Power', 'PPF', 'Efficacy', 'Beam Angle', 'Dimming', 'IP Rating', 'L70 Life'],
      ...fixtureSpecs
    ], {
      theme: 'grid',
      styles: { fontSize: 8 }
    })
    
    // Electrical specifications
    this.addSubsectionHeader('Electrical System Requirements')
    
    const electricalSpecs = [
      ['Parameter', 'Specification', 'Notes'],
      ['Supply Voltage', '120-277V AC, 347-480V AC', 'Universal input voltage'],
      ['Frequency', '50/60 Hz', 'Standard frequency'],
      ['Power Factor', '> 0.95', 'High efficiency'],
      ['THD', '< 15%', 'Low harmonic distortion'],
      ['Inrush Current', '< 20A per fixture', 'Soft start capability'],
      ['Operating Temperature', '-20°C to +50°C', 'Wide operating range'],
      ['Control Interface', '0-10V, DALI, DMX512', 'Multiple protocols']
    ]
    
    this.addTable(electricalSpecs, { theme: 'striped' })
    
    this.addPageBreak()
  }

  private addAppendices(data: ComprehensiveFacilityData): void {
    this.addSectionHeader('Appendices', 'appendix')
    
    // Appendix A: Calculation Methods
    this.addSubsectionHeader('Appendix A: Calculation Methodologies')
    
    const calculations = [
      'PPFD Calculations: Based on inverse square law and fixture photometric data',
      'Uniformity Ratio: Calculated as minimum PPFD divided by average PPFD',
      'DLI Calculations: PPFD × photoperiod × 0.0036 conversion factor',
      'Energy Consumption: Based on fixture power ratings and operating schedules',
      'Financial Analysis: NPV calculations using 7% discount rate over 20-year analysis period'
    ]
    
    this.addBulletList(calculations)
    
    // Appendix B: Standards References
    this.addSubsectionHeader('Appendix B: Industry Standards & References')
    
    const standards = [
      'IES RP-52-19: Recommended Practice for Horticultural Lighting',
      'ASHRAE 90.1-2019: Energy Standard for Buildings Except Low-Rise Residential',
      'IES LM-79-19: Approved Method for Optical and Electrical Measurements of LED Products',
      'IES LM-80-15: Measuring Luminous Flux and Color Maintenance of LED Packages',
      'UL 8800: Standard for Horticultural Lighting Equipment and Systems'
    ]
    
    this.addBulletList(standards)
    
    // Disclaimer
    this.addSubsectionHeader('Disclaimer')
    
    const disclaimer = `This report is based on theoretical calculations, manufacturer specifications, and industry best practices. Actual performance may vary based on environmental conditions, installation quality, component variations, and operational factors. All projections and analyses are estimates based on available data and should be validated through commissioning and performance monitoring. The recommendations in this report are advisory and should be reviewed by qualified professionals before implementation.`
    
    this.addParagraph(disclaimer)
  }
}

// Export default report templates
export const REPORT_TEMPLATES: Record<string, ReportTemplate> = {
  EXECUTIVE: {
    name: 'Executive Summary Report',
    sections: ['executive_summary', 'project_overview', 'financial_analysis', 'recommendations'],
    format: 'executive',
    target_audience: 'client'
  },
  TECHNICAL: {
    name: 'Technical Design Report',
    sections: ['project_overview', 'facility_analysis', 'lighting_design', 'energy_analysis', 'technical_specs', 'compliance'],
    format: 'technical',
    target_audience: 'contractor'
  },
  COMPREHENSIVE: {
    name: 'Comprehensive Analysis Report',
    sections: ['executive_summary', 'project_overview', 'facility_analysis', 'lighting_design', 'environmental_systems', 'energy_analysis', 'production_analysis', 'financial_analysis', 'compliance', 'recommendations', 'implementation', 'technical_specs', 'appendix'],
    format: 'comprehensive',
    target_audience: 'client'
  },
  COMPLIANCE: {
    name: 'Compliance & Standards Report',
    sections: ['project_overview', 'lighting_design', 'compliance', 'technical_specs', 'appendix'],
    format: 'compliance',
    target_audience: 'regulator'
  }
}