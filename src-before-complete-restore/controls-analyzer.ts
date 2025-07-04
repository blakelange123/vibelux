// Professional-grade lighting controls analysis for horticultural applications
// Based on the Python ControlsAnalyzer class

export interface ControlType {
  efficiencyImpact: number
  thdImpact: number
  costFactor: number
}

export interface SchedulingType {
  energySavings: number
  complexity: 'low' | 'medium' | 'high' | 'very_high'
}

export interface DimmingOption {
  type: string
  compatibility: number
  efficiencyImpact: number
  thdImpact: number
  estimatedCost: number
}

export interface SchedulingRecommendation {
  type: string
  energySavings: number
  complexity: string
}

export interface ControlAnalysisResult {
  dimmingOptions: DimmingOption[]
  schedulingRecommendations: SchedulingRecommendation[]
  energySavingsPotential: number
  controlCostEstimate: number
  implementationComplexity: string
}

export interface FixtureData {
  'Reported Input Wattage'?: number
  'Input Voltage'?: string
  'Lamp Technology'?: string
  wattage?: number
  voltage?: string
  technology?: string
  [key: string]: any
}

export class ControlsAnalyzer {
  private controlTypes: {
    dimming: Record<string, ControlType>
    scheduling: Record<string, SchedulingType>
  }

  constructor() {
    this.controlTypes = {
      dimming: {
        analog_0_10v: { efficiencyImpact: 0.98, thdImpact: 1.05, costFactor: 1.1 },
        pwm: { efficiencyImpact: 0.99, thdImpact: 1.15, costFactor: 1.2 },
        digital_dali: { efficiencyImpact: 0.97, thdImpact: 1.02, costFactor: 1.4 },
        wireless_zigbee: { efficiencyImpact: 0.96, thdImpact: 1.03, costFactor: 1.6 }
      },
      scheduling: {
        basic_timer: { energySavings: 0.15, complexity: 'low' },
        astronomical_clock: { energySavings: 0.25, complexity: 'medium' },
        daylight_harvesting: { energySavings: 0.35, complexity: 'high' },
        ai_optimization: { energySavings: 0.45, complexity: 'very_high' }
      }
    }
  }

  analyzeControlCompatibility(fixtureData: FixtureData): ControlAnalysisResult {
    const results: ControlAnalysisResult = {
      dimmingOptions: [],
      schedulingRecommendations: [],
      energySavingsPotential: 0,
      controlCostEstimate: 0,
      implementationComplexity: 'medium'
    }

    // Extract fixture power and specifications
    const fixturePower = fixtureData['Reported Input Wattage'] || fixtureData.wattage || 100
    const fixtureVoltage = fixtureData['Input Voltage'] || fixtureData.voltage || '120-277V'

    // Dimming analysis
    Object.entries(this.controlTypes.dimming).forEach(([controlType, specs]) => {
      const compatibilityScore = this.calculateCompatibilityScore(fixtureData, controlType)
      results.dimmingOptions.push({
        type: controlType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        compatibility: compatibilityScore,
        efficiencyImpact: specs.efficiencyImpact,
        thdImpact: specs.thdImpact,
        estimatedCost: fixturePower * specs.costFactor
      })
    })

    // Scheduling recommendations
    Object.entries(this.controlTypes.scheduling).forEach(([scheduleType, specs]) => {
      results.schedulingRecommendations.push({
        type: scheduleType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        energySavings: specs.energySavings,
        complexity: specs.complexity
      })
    })

    // Calculate overall energy savings potential
    results.energySavingsPotential = this.calculateEnergySavings(fixtureData)

    // Calculate control cost estimate (average of top 2 dimming options)
    const sortedDimming = results.dimmingOptions
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 2)
    
    results.controlCostEstimate = sortedDimming.reduce((sum, option) => sum + option.estimatedCost, 0) / sortedDimming.length

    // Determine implementation complexity based on fixture technology
    results.implementationComplexity = this.determineImplementationComplexity(fixtureData)

    return results
  }

  private calculateCompatibilityScore(fixtureData: FixtureData, controlType: string): number {
    // Check if fixture is LED (required for modern controls)
    const lampTechnology = fixtureData['Lamp Technology'] || fixtureData.technology || ''
    const isLED = lampTechnology.toUpperCase().includes('LED')
    
    if (!isLED) {
      // Legacy fixtures have limited compatibility
      if (controlType === 'analog_0_10v') return 0.7
      if (controlType === 'pwm') return 0.3
      return 0.1
    }

    // LED fixtures - analyze compatibility based on control type
    const voltage = fixtureData['Input Voltage'] || fixtureData.voltage || '120V'
    const hasWideVoltage = voltage.includes('-') || voltage.includes('/')
    
    let compatibilityScore = 1.0

    switch (controlType) {
      case 'analog_0_10v':
        // Most common and compatible
        compatibilityScore = 0.95
        break
      case 'pwm':
        // Good for most LED drivers
        compatibilityScore = 0.85
        break
      case 'digital_dali':
        // Requires DALI-compatible driver
        compatibilityScore = hasWideVoltage ? 0.8 : 0.6
        break
      case 'wireless_zigbee':
        // Requires wireless-ready driver or controller
        compatibilityScore = 0.7
        break
      default:
        compatibilityScore = 0.5
    }

    return Math.round(compatibilityScore * 100) / 100
  }

  private calculateEnergySavings(fixtureData: FixtureData): number {
    const lampTechnology = fixtureData['Lamp Technology'] || fixtureData.technology || ''
    const isLED = lampTechnology.toUpperCase().includes('LED')
    const fixturePower = fixtureData['Reported Input Wattage'] || fixtureData.wattage || 100

    // Base energy savings potential
    let baseSavings = 0.25 // 25% base savings from controls

    if (isLED) {
      // LED fixtures can achieve higher savings
      baseSavings = 0.35
    }

    // Adjust based on fixture power (larger fixtures benefit more from controls)
    if (fixturePower > 200) {
      baseSavings += 0.1
    } else if (fixturePower < 50) {
      baseSavings -= 0.05
    }

    // Add potential savings from advanced scheduling
    const maxSchedulingSavings = Math.max(...Object.values(this.controlTypes.scheduling).map(s => s.energySavings))
    
    return Math.min(0.6, baseSavings + maxSchedulingSavings * 0.5) // Cap at 60% total savings
  }

  private determineImplementationComplexity(fixtureData: FixtureData): string {
    const lampTechnology = fixtureData['Lamp Technology'] || fixtureData.technology || ''
    const isLED = lampTechnology.toUpperCase().includes('LED')
    const voltage = fixtureData['Input Voltage'] || fixtureData.voltage || '120V'
    const hasWideVoltage = voltage.includes('-') || voltage.includes('/')

    if (!isLED) {
      return 'high' // Legacy fixtures require more work
    }

    if (hasWideVoltage && isLED) {
      return 'low' // Modern LED with wide voltage range is easiest
    }

    return 'medium' // Standard implementation
  }

  // Additional utility methods for control system design

  calculateControlSystemCost(
    fixtureCount: number,
    averageFixturePower: number,
    controlType: string = 'analog_0_10v'
  ): {
    controllerCost: number
    wiringCost: number
    installationCost: number
    totalCost: number
    costPerFixture: number
  } {
    const specs = this.controlTypes.dimming[controlType] || this.controlTypes.dimming.analog_0_10v

    // Base controller cost depends on system complexity
    let controllerCost = 0
    if (fixtureCount <= 10) {
      controllerCost = 500 * specs.costFactor
    } else if (fixtureCount <= 50) {
      controllerCost = 1500 * specs.costFactor
    } else {
      controllerCost = 3000 * specs.costFactor + (fixtureCount - 50) * 20
    }

    // Wiring cost (varies by control type)
    const wiringCostPerFixture = controlType.includes('wireless') ? 25 : 75
    const wiringCost = fixtureCount * wiringCostPerFixture

    // Installation cost (labor)
    const installationCostPerFixture = controlType.includes('wireless') ? 100 : 150
    const installationCost = fixtureCount * installationCostPerFixture

    const totalCost = controllerCost + wiringCost + installationCost
    const costPerFixture = totalCost / fixtureCount

    return {
      controllerCost: Math.round(controllerCost),
      wiringCost: Math.round(wiringCost),
      installationCost: Math.round(installationCost),
      totalCost: Math.round(totalCost),
      costPerFixture: Math.round(costPerFixture)
    }
  }

  generateControlRecommendations(
    fixtureData: FixtureData[],
    operatingHours: number = 12,
    electricityRate: number = 0.12
  ): {
    recommendedControlType: string
    estimatedAnnualSavings: number
    paybackPeriod: number
    implementation: string[]
  } {
    if (fixtureData.length === 0) {
      return {
        recommendedControlType: 'basic_timer',
        estimatedAnnualSavings: 0,
        paybackPeriod: 999,
        implementation: ['No fixtures to analyze']
      }
    }

    // Analyze average fixture characteristics
    const totalPower = fixtureData.reduce((sum, fixture) => 
      sum + (fixture['Reported Input Wattage'] || fixture.wattage || 100), 0
    )
    const averagePower = totalPower / fixtureData.length

    // Determine best control type based on fixture analysis
    const analysisResults = fixtureData.map(fixture => this.analyzeControlCompatibility(fixture))
    const avgCompatibility = analysisResults.reduce((sum, result) => {
      const bestDimming = result.dimmingOptions.sort((a, b) => b.compatibility - a.compatibility)[0]
      return sum + (bestDimming?.compatibility || 0)
    }, 0) / analysisResults.length

    let recommendedControlType = 'analog_0_10v'
    if (avgCompatibility > 0.8) {
      recommendedControlType = 'digital_dali'
    } else if (avgCompatibility > 0.6) {
      recommendedControlType = 'analog_0_10v'
    } else {
      recommendedControlType = 'basic_timer'
    }

    // Calculate cost-benefit analysis
    const avgEnergySavings = analysisResults.reduce((sum, result) => 
      sum + result.energySavingsPotential, 0
    ) / analysisResults.length

    const annualEnergyKWh = totalPower * operatingHours * 365 / 1000
    const estimatedAnnualSavings = annualEnergyKWh * electricityRate * avgEnergySavings

    const controlSystemCost = this.calculateControlSystemCost(
      fixtureData.length,
      averagePower,
      recommendedControlType
    )

    const paybackPeriod = controlSystemCost.totalCost / estimatedAnnualSavings

    // Generate implementation recommendations
    const implementation = [
      `Install ${recommendedControlType.replace(/_/g, ' ')} dimming system`,
      `Configure ${fixtureData.length} fixtures with compatible drivers`,
      `Implement daylight harvesting for additional 20% savings`,
      `Set up automated scheduling based on crop requirements`,
      `Install occupancy sensors in maintenance areas`
    ]

    return {
      recommendedControlType: recommendedControlType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      estimatedAnnualSavings: Math.round(estimatedAnnualSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      implementation
    }
  }
}