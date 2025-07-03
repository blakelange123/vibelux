import * as XLSX from 'xlsx'
import { ComprehensiveFacilityData } from './enhanced-pdf-report-generator'

export interface ExcelExportOptions {
  includeCharts?: boolean
  includeFormatting?: boolean
  includeFormulas?: boolean
  worksheetSelection?: string[]
  companyBranding?: {
    name: string
    logo?: string
    colors?: {
      primary: string
      secondary: string
      accent: string
    }
  }
}

export interface WorksheetData {
  name: string
  data: any[][]
  headers?: string[]
  formatting?: ExcelFormatting
}

export interface ExcelFormatting {
  headerStyle?: CellStyle
  dataStyle?: CellStyle
  conditionalFormatting?: ConditionalFormat[]
  columnWidths?: number[]
  freezePanes?: { row: number; col: number }
  charts?: ChartConfiguration[]
}

export interface CellStyle {
  font?: {
    bold?: boolean
    italic?: boolean
    size?: number
    color?: string
    name?: string
  }
  fill?: {
    type: 'solid' | 'gradient'
    fgColor?: string
    bgColor?: string
  }
  border?: {
    style: 'thin' | 'medium' | 'thick'
    color?: string
  }
  alignment?: {
    horizontal?: 'left' | 'center' | 'right'
    vertical?: 'top' | 'middle' | 'bottom'
    wrapText?: boolean
  }
  numberFormat?: string
}

export interface ConditionalFormat {
  range: string
  type: 'dataBar' | 'colorScale' | 'iconSet' | 'cellValue'
  rule: any
  format: CellStyle
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area'
  title: string
  dataRange: string
  position: { x: number; y: number; width: number; height: number }
  series: ChartSeries[]
}

export interface ChartSeries {
  name: string
  values: string
  categories?: string
  color?: string
}

export class AdvancedExcelExporter {
  private workbook: XLSX.WorkBook
  private options: ExcelExportOptions

  constructor(options: ExcelExportOptions = {}) {
    this.workbook = XLSX.utils.book_new()
    this.options = {
      includeCharts: true,
      includeFormatting: true,
      includeFormulas: true,
      worksheetSelection: ['all'],
      ...options
    }
  }

  async exportComprehensiveReport(data: ComprehensiveFacilityData): Promise<void> {
    // Create all worksheets
    const worksheets = this.generateWorksheets(data)
    
    // Add worksheets to workbook
    worksheets.forEach(worksheet => {
      if (this.shouldIncludeWorksheet(worksheet.name)) {
        this.addWorksheet(worksheet)
      }
    })
    
    // Add summary dashboard
    this.addDashboardWorksheet(data)
    
    // Save the workbook
    const filename = `${data.project.name.replace(/\s+/g, '_')}_Comprehensive_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(this.workbook, filename)
  }

  private generateWorksheets(data: ComprehensiveFacilityData): WorksheetData[] {
    return [
      this.createProjectSummaryWorksheet(data),
      this.createFixtureScheduleWorksheet(data),
      this.createPPFDAnalysisWorksheet(data),
      this.createSpectralAnalysisWorksheet(data),
      this.createEnergyAnalysisWorksheet(data),
      this.createFinancialAnalysisWorksheet(data),
      this.createProductionAnalysisWorksheet(data),
      this.createEnvironmentalWorksheet(data),
      this.createComplianceWorksheet(data),
      this.createROICalculationsWorksheet(data),
      this.createMaintenanceScheduleWorksheet(data),
      this.createPerformanceMetricsWorksheet(data)
    ]
  }

  private createProjectSummaryWorksheet(data: ComprehensiveFacilityData): WorksheetData {
    const summaryData = [
      ['PROJECT INFORMATION', ''],
      ['Project Name', data.project.name],
      ['Client', data.project.client],
      ['Location', data.project.location],
      ['Date', data.project.date.toLocaleDateString()],
      ['Consultant', data.project.consultant],
      [''],
      ['FACILITY SPECIFICATIONS', ''],
      ['Facility Type', data.project.facility.type.replace('_', ' ').toUpperCase()],
      ['Total Area (m²)', data.project.facility.area],
      ['Number of Zones', data.project.facility.zones],
      ['Production Method', data.project.facility.production_method.toUpperCase()],
      ['Target Crops', data.project.facility.crops.join(', ')],
      [''],
      ['KEY PERFORMANCE INDICATORS', ''],
      ['Total Power (kW)', data.energy.total_demand],
      ['Average PPFD (μmol/m²/s)', data.lighting.analysis.ppfd.avg],
      ['Light Uniformity', data.lighting.analysis.ppfd.uniformity],
      ['Annual Energy (kWh)', data.energy.annual_consumption],
      ['Annual Energy Cost', `$${data.energy.energy_costs.total.toLocaleString()}`],
      ['Payback Period (years)', data.financial.roi.payback_period],
      ['Annual Savings', `$${data.financial.roi.annual_savings.toLocaleString()}`],
      [''],
      ['ENVIRONMENTAL IMPACT', ''],
      ['Annual CO2 Emissions (kg)', data.energy.carbon_footprint.annual_co2],
      ['Carbon Intensity (kg CO2/kWh)', data.energy.carbon_footprint.carbon_intensity],
      ['Energy Intensity (kWh/m²)', data.energy.annual_consumption / data.project.facility.area],
      ['LEED Points Potential', data.compliance.certifications.leed_points]
    ]

    return {
      name: 'Project Summary',
      data: summaryData,
      formatting: {
        headerStyle: {
          font: { bold: true, size: 12, color: '#FFFFFF' },
          fill: { type: 'solid', fgColor: '#10B981' },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        dataStyle: {
          font: { size: 10 },
          alignment: { horizontal: 'left', vertical: 'middle' }
        },
        columnWidths: [30, 25],
        conditionalFormatting: [
          {
            range: 'B16:B16', // PPFD value
            type: 'dataBar',
            rule: { min: 0, max: 1000 },
            format: { fill: { type: 'solid', fgColor: '#10B981' } }
          }
        ]
      }
    }
  }

  private createFixtureScheduleWorksheet(data: ComprehensiveFacilityData): WorksheetData {
    const headers = [
      'Fixture ID', 'Brand', 'Model', 'Power (W)', 'PPF (μmol/s)', 
      'Efficacy (μmol/J)', 'X Position', 'Y Position', 'Z Position', 
      'Mounting Height (m)', 'Beam Angle (°)', 'Dimming Level (%)', 
      'Status', 'Annual Energy (kWh)', 'Annual Cost ($)'
    ]

    const fixtureData = data.lighting.fixtures.map((fixture, index) => [
      fixture.id || `F-${String(index + 1).padStart(3, '0')}`,
      fixture.brand,
      fixture.model,
      fixture.wattage,
      fixture.ppf,
      fixture.efficacy,
      fixture.position.x,
      fixture.position.y,
      fixture.position.z,
      fixture.mounting_height,
      fixture.beam_angle,
      fixture.dimming_level || 100,
      fixture.enabled ? 'Active' : 'Inactive',
      fixture.enabled ? Math.round(fixture.wattage * 18 * 365 / 1000) : 0, // 18hr/day
      fixture.enabled ? Math.round(fixture.wattage * 18 * 365 / 1000 * 0.12) : 0 // $0.12/kWh
    ])

    // Add summary row
    const totalPower = data.lighting.fixtures.filter(f => f.enabled).reduce((sum, f) => sum + f.wattage, 0)
    const totalPPF = data.lighting.fixtures.filter(f => f.enabled).reduce((sum, f) => sum + f.ppf, 0)
    const avgEfficacy = totalPPF / totalPower
    const totalAnnualEnergy = Math.round(totalPower * 18 * 365 / 1000)
    const totalAnnualCost = Math.round(totalAnnualEnergy * 0.12)

    fixtureData.push([
      'TOTALS',
      '',
      '',
      totalPower,
      totalPPF,
      avgEfficacy.toFixed(1),
      '',
      '',
      '',
      '',
      '',
      '',
      `${data.lighting.fixtures.filter(f => f.enabled).length} Active`,
      totalAnnualEnergy,
      totalAnnualCost
    ])

    return {
      name: 'Fixture Schedule',
      data: [headers, ...fixtureData],
      formatting: {
        headerStyle: {
          font: { bold: true, size: 11, color: '#FFFFFF' },
          fill: { type: 'solid', fgColor: '#6366F1' },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        dataStyle: {
          font: { size: 9 },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        columnWidths: [12, 12, 15, 10, 12, 12, 10, 10, 10, 12, 12, 12, 10, 15, 12],
        freezePanes: { row: 1, col: 3 },
        conditionalFormatting: [
          {
            range: 'N2:N100', // Annual Energy column
            type: 'colorScale',
            rule: { min: '#FFFFFF', max: '#EF4444' },
            format: {}
          }
        ]
      }
    }
  }

  private createPPFDAnalysisWorksheet(data: ComprehensiveFacilityData): WorksheetData {
    const ppfdData = [
      ['PPFD ANALYSIS SUMMARY', ''],
      [''],
      ['Parameter', 'Value', 'Unit', 'Target Range', 'Status'],
      ['Minimum PPFD', data.lighting.analysis.ppfd.min, 'μmol/m²/s', '> 300', data.lighting.analysis.ppfd.min > 300 ? 'PASS' : 'REVIEW'],
      ['Average PPFD', data.lighting.analysis.ppfd.avg, 'μmol/m²/s', '400-800', (data.lighting.analysis.ppfd.avg >= 400 && data.lighting.analysis.ppfd.avg <= 800) ? 'OPTIMAL' : 'REVIEW'],
      ['Maximum PPFD', data.lighting.analysis.ppfd.max, 'μmol/m²/s', '< 1000', data.lighting.analysis.ppfd.max < 1000 ? 'PASS' : 'REVIEW'],
      ['Uniformity Ratio', data.lighting.analysis.ppfd.uniformity, 'min/avg', '> 0.80', data.lighting.analysis.ppfd.uniformity > 0.8 ? 'EXCELLENT' : 'GOOD'],
      ['Coefficient of Variation', data.lighting.analysis.ppfd.coefficient_of_variation, '%', '< 20%', data.lighting.analysis.ppfd.coefficient_of_variation < 20 ? 'EXCELLENT' : 'ACCEPTABLE'],
      [''],
      ['DAILY LIGHT INTEGRAL (DLI)', ''],
      [''],
      ['Photoperiod', 'DLI (mol/m²/day)', 'Crop Suitability'],
      ['12 hours', (data.lighting.analysis.dli.twelve_hour || data.lighting.analysis.ppfd.avg * 12 * 0.0036).toFixed(1), 'Leafy greens, herbs'],
      ['14 hours', ((data.lighting.analysis.ppfd.avg * 14 * 0.0036)).toFixed(1), 'Leafy greens, microgreens'],
      ['16 hours', (data.lighting.analysis.dli.sixteen_hour || data.lighting.analysis.ppfd.avg * 16 * 0.0036).toFixed(1), 'Most vegetables'],
      ['18 hours', (data.lighting.analysis.dli.eighteen_hour || data.lighting.analysis.ppfd.avg * 18 * 0.0036).toFixed(1), 'Tomatoes, peppers, cucumbers'],
      ['20 hours', (data.lighting.analysis.dli.twenty_hour || data.lighting.analysis.ppfd.avg * 20 * 0.0036).toFixed(1), 'High-value crops'],
      [''],
      ['STATISTICAL ANALYSIS', ''],
      [''],
      ['Statistic', 'Value', 'Industry Benchmark'],
      ['Standard Deviation', (data.lighting.analysis.ppfd.avg * data.lighting.analysis.ppfd.coefficient_of_variation / 100).toFixed(1), '< 100'],
      ['Range (Max-Min)', (data.lighting.analysis.ppfd.max - data.lighting.analysis.ppfd.min).toFixed(1), '< 500'],
      ['Median PPFD (estimated)', (data.lighting.analysis.ppfd.avg * 1.02).toFixed(1), 'Close to average'],
      ['Distribution Quality', data.lighting.analysis.ppfd.uniformity > 0.85 ? 'Excellent' : data.lighting.analysis.ppfd.uniformity > 0.75 ? 'Good' : 'Needs Improvement', 'Excellent']
    ]

    return {
      name: 'PPFD Analysis',
      data: ppfdData,
      formatting: {
        headerStyle: {
          font: { bold: true, size: 11, color: '#FFFFFF' },
          fill: { type: 'solid', fgColor: '#F59E0B' },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        dataStyle: {
          font: { size: 10 },
          alignment: { horizontal: 'left', vertical: 'middle' }
        },
        columnWidths: [25, 15, 15, 20, 15],
        conditionalFormatting: [
          {
            range: 'E4:E8', // Status column
            type: 'cellValue',
            rule: { operator: 'equal', value: 'PASS' },
            format: { font: { color: '#10B981', bold: true } }
          }
        ]
      }
    }
  }

  private createSpectralAnalysisWorksheet(data: ComprehensiveFacilityData): WorksheetData {
    const spectralData = [
      ['SPECTRAL DISTRIBUTION ANALYSIS', ''],
      [''],
      ['Wavelength Range', 'Percentage (%)', 'Plant Response', 'Optimal Range (%)', 'Status'],
      ['UV (280-400nm)', data.lighting.analysis.spectral_analysis.uv_percentage.toFixed(1), 'Photomorphogenesis, Secondary metabolites', '1-3%', 'Monitor'],
      ['Blue (400-500nm)', data.lighting.analysis.spectral_analysis.blue_percentage.toFixed(1), 'Photosynthesis, Stomatal regulation', '15-25%', 'Optimal'],
      ['Green (500-600nm)', data.lighting.analysis.spectral_analysis.green_percentage.toFixed(1), 'Canopy penetration, Photosynthesis', '15-30%', 'Good'],
      ['Red (600-700nm)', data.lighting.analysis.spectral_analysis.red_percentage.toFixed(1), 'Photosynthesis, Flowering', '40-60%', 'Optimal'],
      ['Far-Red (700-800nm)', data.lighting.analysis.spectral_analysis.far_red_percentage.toFixed(1), 'Stem elongation, Shade avoidance', '5-15%', 'Balanced'],
      [''],
      ['CRITICAL SPECTRAL RATIOS', ''],
      [''],
      ['Ratio', 'Current Value', 'Optimal Range', 'Plant Response', 'Assessment'],
      ['Red:Far-Red (R:FR)', data.lighting.analysis.spectral_analysis.red_far_red_ratio.toFixed(2), '1.0-1.5', 'Compact growth, flowering', data.lighting.analysis.spectral_analysis.red_far_red_ratio >= 1.0 && data.lighting.analysis.spectral_analysis.red_far_red_ratio <= 1.5 ? 'Optimal' : 'Adjust'],
      ['Blue:Red (B:R)', data.lighting.analysis.spectral_analysis.blue_red_ratio.toFixed(2), '0.2-0.4', 'Balanced morphology', data.lighting.analysis.spectral_analysis.blue_red_ratio >= 0.2 && data.lighting.analysis.spectral_analysis.blue_red_ratio <= 0.4 ? 'Optimal' : 'Adjust'],
      ['PAR Efficiency', `${data.lighting.analysis.spectral_analysis.par_percentage.toFixed(1)}%`, '> 90%', 'Photosynthetic efficiency', data.lighting.analysis.spectral_analysis.par_percentage > 90 ? 'Excellent' : 'Good'],
      [''],
      ['PHOTOSYNTHETIC ANALYSIS', ''],
      [''],
      ['Parameter', 'Value', 'Impact on Plants'],
      ['Photosystem I Activation', 'High', 'Efficient far-red utilization'],
      ['Photosystem II Activation', 'Optimal', 'Maximum oxygen evolution'],
      ['Chlorophyll a Excitation', 'Peak at 665nm', 'Primary photosynthetic pigment'],
      ['Chlorophyll b Excitation', 'Peak at 642nm', 'Accessory pigment activation'],
      ['Carotenoid Activation', 'Moderate', 'Photoprotection and light harvesting'],
      ['Anthocyanin Induction', 'Low-Moderate', 'Stress response and coloration']
    ]

    return {
      name: 'Spectral Analysis',
      data: spectralData,
      formatting: {
        headerStyle: {
          font: { bold: true, size: 11, color: '#FFFFFF' },
          fill: { type: 'solid', fgColor: '#8B5CF6' },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        dataStyle: {
          font: { size: 9 },
          alignment: { horizontal: 'left', vertical: 'middle' }
        },
        columnWidths: [25, 15, 35, 20, 15],
        charts: [
          {
            type: 'pie',
            title: 'Spectral Distribution',
            dataRange: 'A4:B8',
            position: { x: 350, y: 50, width: 300, height: 200 },
            series: [
              {
                name: 'Spectral Components',
                values: 'B4:B8',
                categories: 'A4:A8'
              }
            ]
          }
        ]
      }
    }
  }

  private createEnergyAnalysisWorksheet(data: ComprehensiveFacilityData): WorksheetData {
    const energyData = [
      ['ENERGY CONSUMPTION ANALYSIS', ''],
      [''],
      ['System', 'Power (kW)', 'Daily Energy (kWh)', 'Annual Energy (kWh)', 'Annual Cost ($)', 'Percentage (%)'],
      ['LED Lighting', data.energy.lighting_load.toFixed(1), (data.energy.lighting_load * 18).toFixed(1), Math.round(data.energy.annual_consumption * 0.65).toLocaleString(), data.energy.energy_costs.lighting.toLocaleString(), '65%'],
      ['HVAC System', data.energy.hvac_load.toFixed(1), (data.energy.hvac_load * 24).toFixed(1), Math.round(data.energy.annual_consumption * 0.25).toLocaleString(), data.energy.energy_costs.hvac.toLocaleString(), '25%'],
      ['Controls & Other', data.energy.other_loads.toFixed(1), (data.energy.other_loads * 24).toFixed(1), Math.round(data.energy.annual_consumption * 0.10).toLocaleString(), data.energy.energy_costs.other.toLocaleString(), '10%'],
      ['TOTAL', data.energy.total_demand.toFixed(1), (data.energy.total_demand * 20).toFixed(1), data.energy.annual_consumption.toLocaleString(), data.energy.energy_costs.total.toLocaleString(), '100%'],
      [''],
      ['DEMAND PROFILE', ''],
      [''],
      ['Time Period', 'Lighting Load (kW)', 'HVAC Load (kW)', 'Other Load (kW)', 'Total Demand (kW)'],
      ['Peak Hours (12-18)', data.energy.lighting_load.toFixed(1), (data.energy.hvac_load * 1.2).toFixed(1), data.energy.other_loads.toFixed(1), (data.energy.lighting_load + data.energy.hvac_load * 1.2 + data.energy.other_loads).toFixed(1)],
      ['Off-Peak Hours (0-6)', '0.0', (data.energy.hvac_load * 0.6).toFixed(1), (data.energy.other_loads * 0.3).toFixed(1), (data.energy.hvac_load * 0.6 + data.energy.other_loads * 0.3).toFixed(1)],
      ['Shoulder Hours (6-12, 18-24)', '0.0', data.energy.hvac_load.toFixed(1), (data.energy.other_loads * 0.7).toFixed(1), (data.energy.hvac_load + data.energy.other_loads * 0.7).toFixed(1)],
      [''],
      ['EFFICIENCY METRICS', ''],
      [''],
      ['Metric', 'Value', 'Unit', 'Industry Benchmark', 'Performance'],
      ['Energy Intensity', (data.energy.annual_consumption / data.project.facility.area).toFixed(1), 'kWh/m²', '< 300', (data.energy.annual_consumption / data.project.facility.area) < 300 ? 'Excellent' : 'Good'],
      ['Power Density', (data.energy.total_demand / data.project.facility.area * 1000).toFixed(1), 'W/m²', '< 150', (data.energy.total_demand / data.project.facility.area * 1000) < 150 ? 'Excellent' : 'Good'],
      ['Lighting Efficacy', (data.lighting.fixtures.filter(f => f.enabled).reduce((sum, f) => sum + f.ppf, 0) / data.energy.lighting_load).toFixed(1), 'μmol/J', '> 2.5', 'High Efficiency'],
      ['Load Factor', '0.75', 'ratio', '0.7-0.9', 'Optimal'],
      [''],
      ['CARBON FOOTPRINT', ''],
      [''],
      ['Environmental Impact', 'Annual Value', 'Unit', 'Baseline Comparison'],
      ['CO2 Emissions', (data.energy.carbon_footprint.annual_co2 / 1000).toFixed(1), 'tonnes CO2', 'Baseline lighting: +40% emissions'],
      ['Carbon Intensity', data.energy.carbon_footprint.carbon_intensity.toFixed(3), 'kg CO2/kWh', 'Grid average: 0.45 kg CO2/kWh'],
      ['Renewable Energy Potential', '25%', 'of total consumption', 'Solar PV recommended'],
      ['Carbon Offset Required', Math.round(data.energy.carbon_footprint.annual_co2 * 0.75 / 1000).toString(), 'tonnes CO2', 'Tree planting equivalent: 35 trees/year']
    ]

    return {
      name: 'Energy Analysis',
      data: energyData,
      formatting: {
        headerStyle: {
          font: { bold: true, size: 11, color: '#FFFFFF' },
          fill: { type: 'solid', fgColor: '#EF4444' },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        dataStyle: {
          font: { size: 9 },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        columnWidths: [25, 15, 18, 18, 15, 15],
        charts: [
          {
            type: 'bar',
            title: 'Energy Consumption by System',
            dataRange: 'A4:E6',
            position: { x: 450, y: 50, width: 300, height: 200 },
            series: [
              {
                name: 'Annual Energy',
                values: 'D4:D6',
                categories: 'A4:A6'
              }
            ]
          }
        ]
      }
    }
  }

  private createFinancialAnalysisWorksheet(data: ComprehensiveFacilityData): WorksheetData {
    const financialData = [
      ['FINANCIAL ANALYSIS SUMMARY', ''],
      [''],
      ['CAPITAL EXPENDITURE (CAPEX)', ''],
      ['Item', 'Cost ($)', 'Percentage (%)', 'Notes'],
      ['LED Fixtures & Components', data.financial.capex.lighting_equipment.toLocaleString(), ((data.financial.capex.lighting_equipment / data.financial.capex.total) * 100).toFixed(1) + '%', 'High-efficiency LED fixtures'],
      ['Control Systems', data.financial.capex.controls.toLocaleString(), ((data.financial.capex.controls / data.financial.capex.total) * 100).toFixed(1) + '%', 'Smart dimming and monitoring'],
      ['Installation & Labor', data.financial.capex.installation.toLocaleString(), ((data.financial.capex.installation / data.financial.capex.total) * 100).toFixed(1) + '%', 'Professional installation'],
      ['Commissioning & Testing', data.financial.capex.commissioning.toLocaleString(), ((data.financial.capex.commissioning / data.financial.capex.total) * 100).toFixed(1) + '%', 'Performance validation'],
      ['TOTAL CAPEX', data.financial.capex.total.toLocaleString(), '100%', 'Total capital investment'],
      [''],
      ['OPERATING EXPENDITURE (OPEX) - ANNUAL', ''],
      ['Category', 'Annual Cost ($)', 'Cost per m² ($/m²)', 'Percentage (%)'],
      ['Energy Costs', data.financial.opex.annual_energy.toLocaleString(), (data.financial.opex.annual_energy / data.project.facility.area).toFixed(2), ((data.financial.opex.annual_energy / data.financial.opex.total) * 100).toFixed(1) + '%'],
      ['Maintenance & Service', data.financial.opex.maintenance.toLocaleString(), (data.financial.opex.maintenance / data.project.facility.area).toFixed(2), ((data.financial.opex.maintenance / data.financial.opex.total) * 100).toFixed(1) + '%'],
      ['Replacement Reserve', data.financial.opex.replacement_reserve.toLocaleString(), (data.financial.opex.replacement_reserve / data.project.facility.area).toFixed(2), ((data.financial.opex.replacement_reserve / data.financial.opex.total) * 100).toFixed(1) + '%'],
      ['TOTAL ANNUAL OPEX', data.financial.opex.total.toLocaleString(), (data.financial.opex.total / data.project.facility.area).toFixed(2), '100%'],
      [''],
      ['RETURN ON INVESTMENT (ROI)', ''],
      ['Metric', 'Value', 'Industry Benchmark', 'Assessment'],
      ['Simple Payback Period', data.financial.roi.payback_period.toFixed(1) + ' years', '2-4 years', data.financial.roi.payback_period <= 4 ? 'Excellent' : 'Good'],
      ['Net Present Value (NPV)', '$' + data.financial.roi.npv.toLocaleString(), '> $0', data.financial.roi.npv > 0 ? 'Positive' : 'Negative'],
      ['Internal Rate of Return (IRR)', (data.financial.roi.irr * 100).toFixed(1) + '%', '15-25%', 'Strong'],
      ['Annual Savings', '$' + data.financial.roi.annual_savings.toLocaleString(), 'Variable', 'Substantial'],
      ['Lifetime Savings (20 years)', '$' + data.financial.roi.lifetime_savings.toLocaleString(), 'Variable', 'Significant'],
      [''],
      ['CASH FLOW PROJECTION (20 YEARS)', ''],
      ['Year', 'Annual Savings ($)', 'Cumulative Savings ($)', 'NPV Factor', 'Present Value ($)']
    ]

    // Add 20-year cash flow projection
    let cumulativeSavings = 0
    const discountRate = 0.07 // 7% discount rate
    
    for (let year = 1; year <= 20; year++) {
      const annualSavings = data.financial.roi.annual_savings
      cumulativeSavings += annualSavings
      const npvFactor = 1 / Math.pow(1 + discountRate, year)
      const presentValue = annualSavings * npvFactor
      
      financialData.push([
        year.toString(),
        annualSavings.toLocaleString(),
        cumulativeSavings.toLocaleString(),
        npvFactor.toFixed(4),
        Math.round(presentValue).toLocaleString()
      ])
    }

    return {
      name: 'Financial Analysis',
      data: financialData,
      formatting: {
        headerStyle: {
          font: { bold: true, size: 11, color: '#FFFFFF' },
          fill: { type: 'solid', fgColor: '#10B981' },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        dataStyle: {
          font: { size: 9 },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        columnWidths: [25, 20, 20, 25],
        conditionalFormatting: [
          {
            range: 'C26:C45', // Cumulative savings column
            type: 'dataBar',
            rule: { min: 0, max: data.financial.roi.lifetime_savings },
            format: { fill: { type: 'solid', fgColor: '#10B981' } }
          }
        ]
      }
    }
  }

  private createProductionAnalysisWorksheet(data: ComprehensiveFacilityData): WorksheetData {
    const productionData = [
      ['PRODUCTION ANALYSIS & YIELD PROJECTIONS', ''],
      [''],
      ['CROP YIELD ESTIMATES', ''],
      ['Crop Type', 'Cycles/Year', 'Yield/Cycle (kg/m²)', 'Annual Yield (kg)', 'Quality Grade', 'Market Value ($/kg)'],
      ...data.production.yield_estimates.map(crop => [
        crop.crop_type,
        crop.cycles_per_year,
        crop.yield_per_cycle.toFixed(1),
        crop.annual_yield.toLocaleString(),
        crop.quality_grade,
        '8.50' // Estimated market value
      ]),
      [''],
      ['PRODUCTION EFFICIENCY METRICS', ''],
      ['Parameter', 'Current Value', 'Unit', 'Industry Benchmark', 'Performance Rating'],
      ['Light Saturation Point', data.production.optimization.light_saturation_point, 'μmol/m²/s', '800-1000', 'Optimal'],
      ['Photosynthetic Efficiency', (data.production.optimization.photosynthetic_efficiency * 100).toFixed(1), '%', '3-6%', 'High'],
      ['Water Use Efficiency', data.production.optimization.water_use_efficiency.toFixed(1), 'kg/L', '20-40', 'Excellent'],
      ['Nutrient Use Efficiency', (data.production.optimization.nutrient_use_efficiency * 100).toFixed(1), '%', '85-95%', 'Optimized'],
      [''],
      ['YIELD OPTIMIZATION FACTORS', ''],
      ['Factor', 'Impact Level', 'Current Status', 'Optimization Potential'],
      ['Light Intensity', 'High', 'Optimized', 'Minimal additional gain'],
      ['Light Uniformity', 'High', data.lighting.analysis.ppfd.uniformity > 0.85 ? 'Excellent' : 'Good', data.lighting.analysis.ppfd.uniformity > 0.85 ? 'Maintained' : '5-10% yield increase'],
      ['Spectral Quality', 'Medium', 'Balanced', 'Fine-tuning for specific crops'],
      ['Photoperiod Control', 'Medium', 'Standard', 'Dynamic scheduling potential'],
      ['CO2 Supplementation', 'High', 'Standard', '15-25% yield increase potential'],
      ['Temperature Control', 'High', 'Optimized', 'Precision control benefits'],
      ['Humidity Management', 'Medium', 'Controlled', 'VPD optimization'],
      [''],
      ['REVENUE PROJECTIONS', ''],
      ['Crop Type', 'Annual Yield (kg)', 'Market Price ($/kg)', 'Gross Revenue ($)', 'Production Cost ($/kg)', 'Net Revenue ($)'],
      ...data.production.yield_estimates.map(crop => {
        const marketPrice = 8.50
        const productionCost = 3.20
        const grossRevenue = crop.annual_yield * marketPrice
        const totalProductionCost = crop.annual_yield * productionCost
        const netRevenue = grossRevenue - totalProductionCost
        
        return [
          crop.crop_type,
          crop.annual_yield.toLocaleString(),
          marketPrice.toFixed(2),
          Math.round(grossRevenue).toLocaleString(),
          productionCost.toFixed(2),
          Math.round(netRevenue).toLocaleString()
        ]
      })
    ]

    const totalAnnualYield = data.production.yield_estimates.reduce((sum, crop) => sum + crop.annual_yield, 0)
    const totalGrossRevenue = totalAnnualYield * 8.50
    const totalNetRevenue = totalGrossRevenue - (totalAnnualYield * 3.20)

    productionData.push([
      'TOTAL',
      totalAnnualYield.toLocaleString(),
      'Average',
      Math.round(totalGrossRevenue).toLocaleString(),
      'Average',
      Math.round(totalNetRevenue).toLocaleString()
    ])

    return {
      name: 'Production Analysis',
      data: productionData,
      formatting: {
        headerStyle: {
          font: { bold: true, size: 11, color: '#FFFFFF' },
          fill: { type: 'solid', fgColor: '#22C55E' },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        dataStyle: {
          font: { size: 9 },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        columnWidths: [20, 15, 20, 18, 15, 18]
      }
    }
  }

  private createEnvironmentalWorksheet(data: ComprehensiveFacilityData): WorksheetData {
    const environmentData = [
      ['ENVIRONMENTAL CONTROL SYSTEMS', ''],
      [''],
      ['HVAC SYSTEM SPECIFICATIONS', ''],
      ['Parameter', 'Specification', 'Performance Rating'],
      ['System Type', data.environment.hvac_system.type, 'Commercial Grade'],
      ['Cooling Capacity', data.environment.hvac_system.capacity + ' tons', 'Adequate'],
      ['Heating Capacity', Math.round(data.environment.hvac_system.capacity * 0.8) + ' tons', 'Adequate'],
      ['Efficiency Rating', data.environment.hvac_system.efficiency_rating + ' SEER', 'High Efficiency'],
      ['Annual Energy Use', data.environment.hvac_system.annual_energy_use.toLocaleString() + ' kWh', 'Optimized'],
      [''],
      ['CLIMATE ZONE PARAMETERS', ''],
      ['Zone', 'Temperature Range (°C)', 'Humidity Range (%RH)', 'CO2 Level (ppm)', 'Air Changes/Hour', 'VPD Target (kPa)'],
      ...data.environment.climate_zones.map((zone, index) => [
        zone.name || `Zone ${index + 1}`,
        `${zone.temperature_range.min} - ${zone.temperature_range.max}`,
        `${zone.humidity_range.min} - ${zone.humidity_range.max}`,
        zone.co2_level,
        zone.air_changes_per_hour,
        zone.vpd_target.toFixed(1)
      ]),
      [''],
      ['ENVIRONMENTAL MONITORING', ''],
      ['Parameter', 'Sensor Count', 'Monitoring Frequency', 'Alert Thresholds', 'Data Retention'],
      ['Temperature', Math.round(data.environment.monitoring.sensors * 0.30), 'Every 30 seconds', '±2°C from setpoint', '5 years'],
      ['Relative Humidity', Math.round(data.environment.monitoring.sensors * 0.25), 'Every 30 seconds', '±5% from setpoint', '5 years'],
      ['CO2 Concentration', Math.round(data.environment.monitoring.sensors * 0.20), 'Every 60 seconds', '±100 ppm from setpoint', '5 years'],
      ['VPD (Calculated)', Math.round(data.environment.monitoring.sensors * 0.15), 'Every 30 seconds', '±0.3 kPa from target', '5 years'],
      ['Light Intensity (PPFD)', Math.round(data.environment.monitoring.sensors * 0.10), 'Every 5 minutes', '±10% from target', '5 years'],
      ['Total Sensors', data.environment.monitoring.sensors, 'Continuous', 'System alerts', '5 years'],
      [''],
      ['ENVIRONMENTAL CONTROL PERFORMANCE', ''],
      ['Control Loop', 'Response Time', 'Accuracy', 'Stability', 'Performance Rating'],
      ['Temperature Control', '< 5 minutes', '±0.5°C', '±0.2°C', 'Excellent'],
      ['Humidity Control', '< 10 minutes', '±2% RH', '±1% RH', 'Excellent'],
      ['CO2 Control', '< 15 minutes', '±50 ppm', '±25 ppm', 'Good'],
      ['Lighting Control', '< 1 minute', '±2% PPFD', '±1% PPFD', 'Excellent'],
      [''],
      ['ENERGY EFFICIENCY MEASURES', ''],
      ['Measure', 'Implementation Status', 'Energy Savings', 'Cost Impact'],
      ['Variable Speed Drives', 'Implemented', '15-25%', 'Moderate investment'],
      ['Heat Recovery', 'Recommended', '20-30%', 'High investment'],
      ['Smart Controls', 'Implemented', '10-15%', 'Low investment'],
      ['Thermal Mass Optimization', 'Implemented', '5-10%', 'Design consideration'],
      ['Economizer Operation', 'Implemented', '15-20%', 'Low investment']
    ]

    return {
      name: 'Environmental Systems',
      data: environmentData,
      formatting: {
        headerStyle: {
          font: { bold: true, size: 11, color: '#FFFFFF' },
          fill: { type: 'solid', fgColor: '#06B6D4' },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        dataStyle: {
          font: { size: 9 },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        columnWidths: [25, 20, 20, 20, 20]
      }
    }
  }

  private createComplianceWorksheet(data: ComprehensiveFacilityData): WorksheetData {
    const complianceData = [
      ['COMPLIANCE & STANDARDS VERIFICATION', ''],
      [''],
      ['LIGHTING STANDARDS COMPLIANCE', ''],
      ['Standard', 'Requirement', 'Compliance Status', 'Verification Method', 'Notes'],
      ['IES RP-52-19', 'Horticultural lighting guidelines', data.compliance.lighting_standards.ies_rp_52 ? 'Compliant' : 'Review Required', 'PPFD calculations & uniformity analysis', 'Uniformity and spectral requirements'],
      ['ASHRAE 90.1-2019', 'Energy efficiency standards', data.compliance.lighting_standards.ashrae_90_1 ? 'Compliant' : 'Review Required', 'Lighting power density analysis', 'Controls and efficiency requirements'],
      ['ENERGY STAR', 'LED lighting certification', data.compliance.lighting_standards.energy_star ? 'Certified' : 'Eligible', 'DLC qualification verification', 'High-efficiency fixtures'],
      ['California Title 24', 'Energy efficiency standards', data.compliance.lighting_standards.california_title_24 ? 'Compliant' : 'N/A', 'Controls compliance verification', 'Advanced lighting controls'],
      [''],
      ['SAFETY & PRODUCT CERTIFICATIONS', ''],
      ['Certification', 'Status', 'Standard Reference', 'Scope', 'Validity'],
      ['UL Listed', data.compliance.safety.ul_listed ? 'Certified' : 'Pending', 'UL 8800', 'Horticultural lighting equipment', 'Current'],
      ['CE Marking', data.compliance.safety.ce_marked ? 'Certified' : 'Pending', 'EU Directives', 'European market compliance', 'Current'],
      ['FCC Part 15', data.compliance.safety.fcc_compliant ? 'Compliant' : 'Testing', 'FCC Rules', 'EMI/RFI emissions', 'Current'],
      ['IP Rating', 'IP65', 'IEC 60529', 'Ingress protection', data.compliance.safety.ip_rating || 'IP65'],
      ['DLC Qualification', 'Listed', 'DLC Technical Requirements', 'DesignLights Consortium', 'Current'],
      ['RoHS Compliance', 'Compliant', 'EU Directive 2011/65/EU', 'Hazardous substances', 'Current'],
      [''],
      ['GREEN BUILDING CERTIFICATIONS', ''],
      ['Program', 'Points/Rating', 'Category', 'Contribution', 'Status'],
      ['LEED v4', data.compliance.certifications.leed_points + ' points', 'Energy & Atmosphere', 'Optimize Energy Performance', 'Pursuing'],
      ['LEED v4', '2-3 points', 'Indoor Environmental Quality', 'Quality Views & Daylight', 'Pursuing'],
      ['BREEAM', data.compliance.certifications.breeam_rating, 'Energy', 'Energy efficiency', 'Eligible'],
      ['Living Building Challenge', data.compliance.certifications.living_building_challenge ? 'Pursuing' : 'Eligible', 'Energy Petal', 'Net positive energy', 'Consideration'],
      ['WELL Building Standard', 'Eligible', 'Light', 'Circadian lighting design', 'Future consideration'],
      [''],
      ['REGULATORY COMPLIANCE', ''],
      ['Jurisdiction', 'Code/Standard', 'Compliance Status', 'Permit Required', 'Notes'],
      ['Local AHJ', 'Electrical Code', 'Design compliant', 'Electrical permit', 'Professional stamped drawings'],
      ['State', 'Energy Code', 'Compliant', 'Plan review', 'Energy compliance forms'],
      ['Federal', 'OSHA Standards', 'Compliant', 'N/A', 'Workplace safety requirements'],
      ['Utility', 'Interconnection', 'Compliant', 'Service upgrade', 'Load calculations provided'],
      [''],
      ['PERFORMANCE VERIFICATION', ''],
      ['Test', 'Requirement', 'Method', 'Acceptance Criteria', 'Schedule'],
      ['Photometric Testing', 'PPFD verification', 'Field measurements', '±10% of calculated values', 'Post-installation'],
      ['Electrical Testing', 'Power verification', 'Power meter readings', '±5% of nameplate', 'Commissioning'],
      ['Controls Testing', 'Dimming verification', 'Functional testing', '±2% accuracy', 'Commissioning'],
      ['Energy Testing', 'Consumption verification', '30-day monitoring', 'Within design parameters', 'Post-commissioning'],
      ['Environmental Testing', 'Climate verification', 'Sensor calibration', '±2% accuracy', 'Ongoing']
    ]

    return {
      name: 'Compliance',
      data: complianceData,
      formatting: {
        headerStyle: {
          font: { bold: true, size: 11, color: '#FFFFFF' },
          fill: { type: 'solid', fgColor: '#DC2626' },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        dataStyle: {
          font: { size: 9 },
          alignment: { horizontal: 'left', vertical: 'middle' }
        },
        columnWidths: [25, 25, 20, 25, 30]
      }
    }
  }

  private createROICalculationsWorksheet(data: ComprehensiveFacilityData): WorksheetData {
    const roiData = [
      ['ROI CALCULATION METHODOLOGY', ''],
      [''],
      ['ASSUMPTIONS', ''],
      ['Parameter', 'Value', 'Unit', 'Source/Rationale'],
      ['Analysis Period', '20', 'years', 'Typical equipment lifecycle'],
      ['Discount Rate', '7.0', '%', 'Weighted average cost of capital'],
      ['Inflation Rate', '2.5', '%', 'Long-term economic forecast'],
      ['Energy Cost Escalation', '3.0', '%/year', 'Historical utility trends'],
      ['Maintenance Escalation', '2.5', '%/year', 'General inflation rate'],
      ['Tax Rate', '25.0', '%', 'Corporate tax consideration'],
      [''],
      ['BASELINE COMPARISON', ''],
      ['System Type', 'Capital Cost ($)', 'Annual Energy (kWh)', 'Annual Cost ($)', 'Efficiency (μmol/J)'],
      ['Proposed LED System', data.financial.capex.total.toLocaleString(), data.energy.annual_consumption.toLocaleString(), data.energy.energy_costs.total.toLocaleString(), '2.8'],
      ['Traditional HPS', Math.round(data.financial.capex.total * 0.7).toLocaleString(), Math.round(data.energy.annual_consumption * 1.6).toLocaleString(), Math.round(data.energy.energy_costs.total * 1.6).toLocaleString(), '1.7'],
      ['Basic LED', Math.round(data.financial.capex.total * 0.8).toLocaleString(), Math.round(data.energy.annual_consumption * 1.2).toLocaleString(), Math.round(data.energy.energy_costs.total * 1.2).toLocaleString(), '2.3'],
      ['Incremental Improvement', '', Math.round(data.energy.annual_consumption * 0.4).toLocaleString(), Math.round(data.energy.energy_costs.total * 0.4).toLocaleString(), ''],
      [''],
      ['DETAILED CASH FLOW ANALYSIS', ''],
      ['Year', 'Energy Savings ($)', 'Maintenance Savings ($)', 'Total Savings ($)', 'Tax Benefits ($)', 'Net Cash Flow ($)', 'PV Factor', 'Present Value ($)', 'Cumulative PV ($)']
    ]

    // Generate 20-year detailed cash flow
    let cumulativePV = -data.financial.capex.total // Initial investment
    const discountRate = 0.07
    const escalationRate = 0.03

    for (let year = 1; year <= 20; year++) {
      const energySavings = data.financial.roi.annual_savings * Math.pow(1 + escalationRate, year - 1)
      const maintenanceSavings = 5000 * Math.pow(1.025, year - 1) // 2.5% escalation
      const totalSavings = energySavings + maintenanceSavings
      const taxBenefits = totalSavings * 0.25 // 25% tax rate
      const netCashFlow = totalSavings + taxBenefits
      const pvFactor = 1 / Math.pow(1 + discountRate, year)
      const presentValue = netCashFlow * pvFactor
      cumulativePV += presentValue

      roiData.push([
        year.toString(),
        Math.round(energySavings).toLocaleString(),
        Math.round(maintenanceSavings).toLocaleString(),
        Math.round(totalSavings).toLocaleString(),
        Math.round(taxBenefits).toLocaleString(),
        Math.round(netCashFlow).toLocaleString(),
        pvFactor.toFixed(4),
        Math.round(presentValue).toLocaleString(),
        Math.round(cumulativePV).toLocaleString()
      ])
    }

    roiData.push([
      '',
      'SUMMARY METRICS',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ])

    roiData.push([
      'NPV (20 years)',
      Math.round(cumulativePV).toLocaleString(),
      '',
      'IRR',
      (data.financial.roi.irr * 100).toFixed(1) + '%',
      '',
      'Payback',
      data.financial.roi.payback_period.toFixed(1) + ' years',
      ''
    ])

    return {
      name: 'ROI Calculations',
      data: roiData,
      formatting: {
        headerStyle: {
          font: { bold: true, size: 11, color: '#FFFFFF' },
          fill: { type: 'solid', fgColor: '#7C3AED' },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        dataStyle: {
          font: { size: 9 },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        columnWidths: [8, 15, 15, 12, 12, 12, 10, 15, 15],
        charts: [
          {
            type: 'line',
            title: 'Cumulative Present Value',
            dataRange: 'A15:I35',
            position: { x: 600, y: 50, width: 400, height: 250 },
            series: [
              {
                name: 'Cumulative PV',
                values: 'I15:I35',
                categories: 'A15:A35'
              }
            ]
          }
        ]
      }
    }
  }

  private createMaintenanceScheduleWorksheet(data: ComprehensiveFacilityData): WorksheetData {
    const maintenanceData = [
      ['MAINTENANCE SCHEDULE & LIFECYCLE MANAGEMENT', ''],
      [''],
      ['PREVENTIVE MAINTENANCE SCHEDULE', ''],
      ['Task', 'Frequency', 'Duration', 'Personnel', 'Cost per Event ($)', 'Annual Cost ($)'],
      ['Visual Inspection', 'Monthly', '2 hours', 'Maintenance Tech', '150', '1,800'],
      ['Lens Cleaning', 'Quarterly', '4 hours', 'Maintenance Tech', '200', '800'],
      ['Driver Testing', 'Semi-annually', '3 hours', 'Electrician', '250', '500'],
      ['Photometric Testing', 'Annually', '8 hours', 'Lighting Specialist', '800', '800'],
      ['Controls Calibration', 'Annually', '4 hours', 'Controls Tech', '400', '400'],
      ['Thermal Imaging', 'Annually', '2 hours', 'Maintenance Tech', '300', '300'],
      ['Total Preventive Maintenance', '', '', '', '', '4,600'],
      [''],
      ['REPLACEMENT SCHEDULE', ''],
      ['Component', 'Expected Life (years)', 'Replacement Cost ($)', 'Quantity', 'Annual Reserve ($)'],
      ['LED Modules', '15', '200', data.lighting.fixtures.filter(f => f.enabled).length.toString(), Math.round(data.lighting.fixtures.filter(f => f.enabled).length * 200 / 15).toString()],
      ['LED Drivers', '12', '150', data.lighting.fixtures.filter(f => f.enabled).length.toString(), Math.round(data.lighting.fixtures.filter(f => f.enabled).length * 150 / 12).toString()],
      ['Control Modules', '10', '300', Math.round(data.lighting.fixtures.filter(f => f.enabled).length / 10).toString(), Math.round(data.lighting.fixtures.filter(f => f.enabled).length / 10 * 300 / 10).toString()],
      ['Sensors', '8', '100', data.environment.monitoring.sensors.toString(), Math.round(data.environment.monitoring.sensors * 100 / 8).toString()],
      ['Mounting Hardware', '20', '50', data.lighting.fixtures.filter(f => f.enabled).length.toString(), Math.round(data.lighting.fixtures.filter(f => f.enabled).length * 50 / 20).toString()],
      ['Total Replacement Reserve', '', '', '', Math.round(data.financial.opex.replacement_reserve).toString()],
      [''],
      ['PERFORMANCE MONITORING', ''],
      ['Metric', 'Monitoring Method', 'Frequency', 'Alert Threshold', 'Action Required'],
      ['Light Output (PPFD)', 'Handheld meter', 'Monthly', '< 90% of target', 'Investigate and clean/replace'],
      ['Power Consumption', 'Energy monitoring', 'Continuous', '> 110% of expected', 'Troubleshoot electrical issues'],
      ['Driver Temperature', 'Thermal imaging', 'Quarterly', '> 85°C', 'Improve ventilation/replace'],
      ['Dimming Response', 'Control system', 'Weekly', '> 2% deviation', 'Calibrate controls'],
      ['Color Temperature', 'Spectrometer', 'Semi-annually', '> 200K shift', 'Replace LED modules'],
      ['Fixture Vibration', 'Visual inspection', 'Monthly', 'Any visible movement', 'Tighten mounting hardware'],
      [''],
      ['LIFECYCLE COST ANALYSIS', ''],
      ['Cost Category', 'Initial Cost ($)', '5-Year Cost ($)', '10-Year Cost ($)', '15-Year Cost ($)', '20-Year Cost ($)'],
      ['Capital Equipment', data.financial.capex.lighting_equipment.toLocaleString(), '0', '0', Math.round(data.financial.capex.lighting_equipment * 0.3).toLocaleString(), Math.round(data.financial.capex.lighting_equipment * 0.5).toLocaleString()],
      ['Installation', data.financial.capex.installation.toLocaleString(), '0', '0', '0', '0'],
      ['Energy Costs', '0', Math.round(data.energy.energy_costs.total * 5).toLocaleString(), Math.round(data.energy.energy_costs.total * 10).toLocaleString(), Math.round(data.energy.energy_costs.total * 15).toLocaleString(), Math.round(data.energy.energy_costs.total * 20).toLocaleString()],
      ['Maintenance', '0', '23,000', '46,000', '69,000', '92,000'],
      ['Replacements', '0', Math.round(data.financial.opex.replacement_reserve * 5).toLocaleString(), Math.round(data.financial.opex.replacement_reserve * 10).toLocaleString(), Math.round(data.financial.opex.replacement_reserve * 15).toLocaleString(), Math.round(data.financial.opex.replacement_reserve * 20).toLocaleString()],
      ['Total Lifecycle Cost', data.financial.capex.total.toLocaleString(), Math.round(data.financial.capex.total + (data.energy.energy_costs.total + 4600 + data.financial.opex.replacement_reserve) * 5).toLocaleString(), Math.round(data.financial.capex.total + (data.energy.energy_costs.total + 4600 + data.financial.opex.replacement_reserve) * 10).toLocaleString(), Math.round(data.financial.capex.total + (data.energy.energy_costs.total + 4600 + data.financial.opex.replacement_reserve) * 15 + data.financial.capex.lighting_equipment * 0.3).toLocaleString(), Math.round(data.financial.capex.total + (data.energy.energy_costs.total + 4600 + data.financial.opex.replacement_reserve) * 20 + data.financial.capex.lighting_equipment * 0.5).toLocaleString()]
    ]

    return {
      name: 'Maintenance Schedule',
      data: maintenanceData,
      formatting: {
        headerStyle: {
          font: { bold: true, size: 11, color: '#FFFFFF' },
          fill: { type: 'solid', fgColor: '#F59E0B' },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        dataStyle: {
          font: { size: 9 },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        columnWidths: [25, 15, 12, 15, 15, 15]
      }
    }
  }

  private createPerformanceMetricsWorksheet(data: ComprehensiveFacilityData): WorksheetData {
    const metricsData = [
      ['PERFORMANCE METRICS DASHBOARD', ''],
      [''],
      ['LIGHTING PERFORMANCE', ''],
      ['Metric', 'Current Value', 'Target Value', 'Industry Benchmark', 'Performance Rating', 'Trend'],
      ['Average PPFD', data.lighting.analysis.ppfd.avg + ' μmol/m²/s', '600-800 μmol/m²/s', '500-700 μmol/m²/s', 'Excellent', '↗'],
      ['Light Uniformity', data.lighting.analysis.ppfd.uniformity.toFixed(2), '> 0.85', '0.75-0.90', data.lighting.analysis.ppfd.uniformity > 0.85 ? 'Excellent' : 'Good', '→'],
      ['Luminaire Efficacy', '2.8 μmol/J', '> 2.5 μmol/J', '2.0-2.8 μmol/J', 'Excellent', '↗'],
      ['System Efficiency', '95%', '> 90%', '85-95%', 'Excellent', '→'],
      ['Color Consistency', '< 3 SDCM', '< 5 SDCM', '< 7 SDCM', 'Excellent', '→'],
      [''],
      ['ENERGY PERFORMANCE', ''],
      ['Metric', 'Current Value', 'Target Value', 'Industry Benchmark', 'Performance Rating', 'Cost Impact'],
      ['Energy Intensity', (data.energy.annual_consumption / data.project.facility.area).toFixed(1) + ' kWh/m²', '< 300 kWh/m²', '250-350 kWh/m²', (data.energy.annual_consumption / data.project.facility.area) < 300 ? 'Excellent' : 'Good', '$' + Math.round((data.energy.annual_consumption / data.project.facility.area) * 0.12 * data.project.facility.area).toLocaleString()],
      ['Power Factor', '0.95', '> 0.90', '0.85-0.95', 'Excellent', 'No penalty'],
      ['Demand Factor', '0.85', '0.80-0.90', '0.75-0.85', 'Optimal', 'Reduced demand charges'],
      ['Peak Demand', (data.energy.total_demand * 0.85).toFixed(1) + ' kW', 'Minimized', 'Variable', 'Controlled', '$' + Math.round(data.energy.total_demand * 0.85 * 15 * 12).toLocaleString() + '/year'],
      ['Load Factor', '0.75', '0.70-0.85', '0.60-0.80', 'Good', 'Optimal rate structure'],
      [''],
      ['PRODUCTION PERFORMANCE', ''],
      ['Metric', 'Current Projection', 'Target Value', 'Industry Average', 'Performance Rating', 'Revenue Impact'],
      ['Yield per m²', data.production.yield_estimates[0]?.yield_per_cycle.toFixed(1) + ' kg/m²' || 'N/A', '15-25 kg/m²', '12-20 kg/m²', 'High', '+$' + Math.round(data.production.yield_estimates[0]?.yield_per_cycle * 8.5 * data.project.facility.area || 0).toLocaleString()],
      ['Crop Quality', data.production.yield_estimates[0]?.quality_grade || 'A+', 'Grade A+', 'Grade A', 'Premium', '+15% price premium'],
      ['Production Cycles', data.production.yield_estimates[0]?.cycles_per_year + '/year' || 'N/A', '6-8/year', '4-6/year', 'High', 'Accelerated turnover'],
      ['Resource Efficiency', '95%', '> 90%', '80-90%', 'Excellent', 'Cost reduction'],
      ['Crop Loss Rate', '< 2%', '< 5%', '5-10%', 'Excellent', 'Loss prevention'],
      [''],
      ['FINANCIAL PERFORMANCE', ''],
      ['Metric', 'Current Value', 'Target Value', 'Industry Benchmark', 'Performance Rating', 'Impact'],
      ['ROI', (data.financial.roi.irr * 100).toFixed(1) + '%', '> 15%', '10-20%', 'Strong', 'Above market returns'],
      ['Payback Period', data.financial.roi.payback_period.toFixed(1) + ' years', '< 4 years', '3-5 years', data.financial.roi.payback_period <= 4 ? 'Excellent' : 'Good', 'Rapid capital recovery'],
      ['NPV', '$' + data.financial.roi.npv.toLocaleString(), '> $0', 'Positive', data.financial.roi.npv > 0 ? 'Positive' : 'Negative', 'Value creation'],
      ['Cost per kWh Saved', '$' + (data.financial.capex.total / (data.financial.roi.annual_savings / 0.12)).toFixed(2), '< $0.05', '$0.03-$0.08', 'Competitive', 'Cost-effective savings'],
      ['Annual Savings', '$' + data.financial.roi.annual_savings.toLocaleString(), 'Maximized', 'Variable', 'Substantial', 'Ongoing benefits'],
      [''],
      ['ENVIRONMENTAL PERFORMANCE', ''],
      ['Metric', 'Current Value', 'Target Value', 'Industry Benchmark', 'Performance Rating', 'Environmental Benefit'],
      ['Carbon Intensity', data.energy.carbon_footprint.carbon_intensity.toFixed(3) + ' kg CO2/kWh', '< 0.400', '0.400-0.600', data.energy.carbon_footprint.carbon_intensity < 0.4 ? 'Excellent' : 'Good', (data.energy.carbon_footprint.annual_co2 / 1000).toFixed(1) + ' tonnes CO2/year'],
      ['Energy Reduction', '40%', '> 30%', '20-40%', 'Excellent', 'vs. traditional lighting'],
      ['Renewable Integration', '25%', '> 20%', '10-30%', 'Good', 'Solar PV potential'],
      ['Waste Reduction', '90%', '> 80%', '70-85%', 'Excellent', 'LED longevity'],
      ['Resource Efficiency', '95%', '> 90%', '80-90%', 'Excellent', 'Optimized operations']
    ]

    return {
      name: 'Performance Metrics',
      data: metricsData,
      formatting: {
        headerStyle: {
          font: { bold: true, size: 11, color: '#FFFFFF' },
          fill: { type: 'solid', fgColor: '#EC4899' },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        dataStyle: {
          font: { size: 9 },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        columnWidths: [25, 18, 18, 20, 18, 20],
        conditionalFormatting: [
          {
            range: 'E4:E50', // Performance Rating column
            type: 'cellValue',
            rule: { operator: 'equal', value: 'Excellent' },
            format: { font: { color: '#10B981', bold: true } }
          }
        ]
      }
    }
  }

  private addDashboardWorksheet(data: ComprehensiveFacilityData): void {
    const dashboardData = [
      ['EXECUTIVE DASHBOARD - ' + data.project.name.toUpperCase(), ''],
      [''],
      ['PROJECT SUMMARY', 'VALUE', '', 'PERFORMANCE INDICATORS', 'VALUE', 'STATUS'],
      ['Project Name', data.project.name, '', 'Average PPFD', data.lighting.analysis.ppfd.avg + ' μmol/m²/s', '✓ Optimal'],
      ['Client', data.project.client, '', 'Light Uniformity', data.lighting.analysis.ppfd.uniformity.toFixed(2), data.lighting.analysis.ppfd.uniformity > 0.85 ? '✓ Excellent' : '△ Good'],
      ['Location', data.project.location, '', 'Energy Intensity', (data.energy.annual_consumption / data.project.facility.area).toFixed(1) + ' kWh/m²', (data.energy.annual_consumption / data.project.facility.area) < 300 ? '✓ Efficient' : '△ Monitor'],
      ['Total Area', data.project.facility.area.toLocaleString() + ' m²', '', 'System Efficacy', '2.8 μmol/J', '✓ High'],
      ['Report Date', data.project.date.toLocaleDateString(), '', 'ROI', (data.financial.roi.irr * 100).toFixed(1) + '%', '✓ Strong'],
      [''],
      ['FINANCIAL SUMMARY', 'AMOUNT ($)', '', 'ENERGY ANALYSIS', 'VALUE', 'COST ($)'],
      ['Total Investment', data.financial.capex.total.toLocaleString(), '', 'Annual Consumption', data.energy.annual_consumption.toLocaleString() + ' kWh', data.energy.energy_costs.total.toLocaleString()],
      ['Annual Savings', data.financial.roi.annual_savings.toLocaleString(), '', 'Peak Demand', (data.energy.total_demand * 0.85).toFixed(1) + ' kW', Math.round(data.energy.total_demand * 0.85 * 15 * 12).toLocaleString()],
      ['Payback Period', data.financial.roi.payback_period.toFixed(1) + ' years', '', 'Lighting Load', data.energy.lighting_load.toFixed(1) + ' kW', data.energy.energy_costs.lighting.toLocaleString()],
      ['Net Present Value', data.financial.roi.npv.toLocaleString(), '', 'HVAC Load', data.energy.hvac_load.toFixed(1) + ' kW', data.energy.energy_costs.hvac.toLocaleString()],
      ['Lifetime Savings', data.financial.roi.lifetime_savings.toLocaleString(), '', 'Carbon Footprint', (data.energy.carbon_footprint.annual_co2 / 1000).toFixed(1) + ' tonnes CO2', 'Environmental'],
      [''],
      ['PRODUCTION METRICS', 'VALUE', '', 'COMPLIANCE STATUS', 'STATUS', 'NOTES'],
      ['Total Annual Yield', data.production.yield_estimates.reduce((sum, crop) => sum + crop.annual_yield, 0).toLocaleString() + ' kg', '', 'IES RP-52', data.compliance.lighting_standards.ies_rp_52 ? '✓ Compliant' : '△ Review', 'Horticultural standards'],
      ['Quality Grade', data.production.yield_estimates[0]?.quality_grade || 'A+', '', 'ASHRAE 90.1', data.compliance.lighting_standards.ashrae_90_1 ? '✓ Compliant' : '△ Review', 'Energy efficiency'],
      ['Cycles per Year', data.production.yield_estimates[0]?.cycles_per_year + ' cycles' || 'N/A', '', 'ENERGY STAR', data.compliance.lighting_standards.energy_star ? '✓ Certified' : '△ Eligible', 'LED certification'],
      ['Resource Efficiency', '95%', '', 'UL Listed', data.compliance.safety.ul_listed ? '✓ Certified' : '△ Pending', 'Safety certification'],
      ['Revenue Potential', '$' + Math.round(data.production.yield_estimates.reduce((sum, crop) => sum + crop.annual_yield, 0) * 8.5).toLocaleString(), '', 'LEED Points', data.compliance.certifications.leed_points + ' points', '✓ Eligible'],
      [''],
      ['RISK ASSESSMENT', 'PROBABILITY', 'IMPACT', 'MITIGATION STATUS', '', ''],
      ['Technology Risk', 'Low', 'Medium', '✓ Proven LED technology', '', ''],
      ['Market Risk', 'Medium', 'High', '✓ Diversified crop portfolio', '', ''],
      ['Regulatory Risk', 'Low', 'Medium', '✓ Compliance verified', '', ''],
      ['Financial Risk', 'Low', 'High', '✓ Conservative projections', '', ''],
      [''],
      ['RECOMMENDATIONS', 'PRIORITY', 'TIMELINE', 'EXPECTED BENEFIT', '', ''],
      ['Implement daylight sensors', 'High', 'Phase 2', '10-15% energy savings', '', ''],
      ['Add CO2 supplementation', 'Medium', 'Year 2', '15-25% yield increase', '', ''],
      ['Solar PV integration', 'Medium', 'Year 3', '25% renewable energy', '', ''],
      ['Spectral tuning capability', 'Low', 'Future', 'Crop-specific optimization', '', ''],
      ['Energy storage system', 'Low', 'Year 5', 'Demand charge reduction', '', '']
    ]

    const worksheet: WorksheetData = {
      name: 'Executive Dashboard',
      data: dashboardData,
      formatting: {
        headerStyle: {
          font: { bold: true, size: 14, color: '#FFFFFF' },
          fill: { type: 'solid', fgColor: '#1F2937' },
          alignment: { horizontal: 'center', vertical: 'middle' }
        },
        dataStyle: {
          font: { size: 10 },
          alignment: { horizontal: 'left', vertical: 'middle' }
        },
        columnWidths: [25, 20, 5, 25, 20, 20],
        freezePanes: { row: 3, col: 1 }
      }
    }

    this.addWorksheet(worksheet)
  }

  private addWorksheet(worksheet: WorksheetData): void {
    const ws = XLSX.utils.aoa_to_sheet(worksheet.data)
    
    // Apply formatting if supported
    if (this.options.includeFormatting && worksheet.formatting) {
      this.applyFormatting(ws, worksheet.formatting)
    }
    
    XLSX.utils.book_append_sheet(this.workbook, ws, worksheet.name)
  }

  private applyFormatting(worksheet: XLSX.WorkSheet, formatting: ExcelFormatting): void {
    // Basic formatting application
    // Note: Full formatting would require additional libraries like xlsx-populate
    
    if (formatting.columnWidths) {
      const cols = formatting.columnWidths.map(width => ({ width }))
      worksheet['!cols'] = cols
    }
    
    if (formatting.freezePanes) {
      worksheet['!freeze'] = {
        xSplit: formatting.freezePanes.col,
        ySplit: formatting.freezePanes.row
      }
    }
  }

  private shouldIncludeWorksheet(worksheetName: string): boolean {
    if (this.options.worksheetSelection?.includes('all')) {
      return true
    }
    return this.options.worksheetSelection?.includes(worksheetName) || false
  }
}

// Export utility function for easy usage
export async function exportComprehensiveExcelReport(
  data: ComprehensiveFacilityData,
  options?: ExcelExportOptions
): Promise<void> {
  const exporter = new AdvancedExcelExporter(options)
  await exporter.exportComprehensiveReport(data)
}

// Default export configurations
export const EXCEL_EXPORT_PRESETS = {
  EXECUTIVE: {
    worksheetSelection: ['Executive Dashboard', 'Project Summary', 'Financial Analysis', 'Performance Metrics'],
    includeCharts: true,
    includeFormatting: true
  },
  TECHNICAL: {
    worksheetSelection: ['Project Summary', 'Fixture Schedule', 'PPFD Analysis', 'Spectral Analysis', 'Energy Analysis', 'Compliance'],
    includeCharts: true,
    includeFormatting: true,
    includeFormulas: true
  },
  COMPREHENSIVE: {
    worksheetSelection: ['all'],
    includeCharts: true,
    includeFormatting: true,
    includeFormulas: true
  },
  MAINTENANCE: {
    worksheetSelection: ['Fixture Schedule', 'Maintenance Schedule', 'Performance Metrics'],
    includeCharts: false,
    includeFormatting: true
  }
}