/**
 * Total Harmonic Distortion (THD) Analyzer
 * For DLC Premium compliance (THD < 20%)
 */

export interface HarmonicData {
  frequency: number
  magnitude: number
  phase: number
}

export interface THDAnalysis {
  thdVoltage: number
  thdCurrent: number
  powerFactor: number
  harmonics: HarmonicData[]
  dlcCompliant: boolean
  recommendations: string[]
}

export class THDAnalyzer {
  private readonly DLC_THD_LIMIT = 20 // DLC Premium requirement: THD < 20%
  private readonly IEEE_THD_LIMIT = 5 // IEEE 519 voltage THD limit
  
  /**
   * Calculate THD from harmonic magnitudes
   */
  calculateTHD(fundamentalMagnitude: number, harmonicMagnitudes: number[]): number {
    if (fundamentalMagnitude === 0) return 0
    
    const harmonicSum = harmonicMagnitudes.reduce((sum, mag) => sum + mag * mag, 0)
    const thd = (Math.sqrt(harmonicSum) / fundamentalMagnitude) * 100
    
    return Number(thd.toFixed(2))
  }
  
  /**
   * Analyze fixture THD based on driver characteristics
   */
  analyzeFixtureTHD(
    driverType: 'constant-current' | 'constant-voltage' | 'programmable',
    powerRating: number,
    dimmingLevel: number = 100,
    hasActivePFC: boolean = true
  ): THDAnalysis {
    // Base THD values by driver type
    const baseTHD = {
      'constant-current': 8,
      'constant-voltage': 12,
      'programmable': 6
    }
    
    let currentTHD = baseTHD[driverType]
    
    // Adjust for power factor correction
    if (!hasActivePFC) {
      currentTHD *= 2.5 // No PFC significantly increases THD
    }
    
    // Adjust for dimming (THD typically increases at lower dim levels)
    if (dimmingLevel < 100) {
      const dimmingFactor = 1 + (100 - dimmingLevel) / 100
      currentTHD *= dimmingFactor
    }
    
    // Generate harmonic spectrum
    const harmonics = this.generateHarmonicSpectrum(currentTHD, powerRating)
    
    // Calculate power factor
    const powerFactor = this.calculatePowerFactor(currentTHD, hasActivePFC)
    
    // Check DLC compliance
    const dlcCompliant = currentTHD < this.DLC_THD_LIMIT
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      currentTHD,
      powerFactor,
      hasActivePFC,
      dimmingLevel
    )
    
    return {
      thdVoltage: currentTHD * 0.3, // Voltage THD is typically lower
      thdCurrent: currentTHD,
      powerFactor,
      harmonics,
      dlcCompliant,
      recommendations
    }
  }
  
  /**
   * Generate harmonic spectrum based on THD
   */
  private generateHarmonicSpectrum(thd: number, powerRating: number): HarmonicData[] {
    const harmonics: HarmonicData[] = []
    const fundamental = powerRating
    
    // Typical harmonic distribution for LED drivers
    const harmonicFactors = [
      { order: 3, factor: 0.7 },   // 3rd harmonic is typically dominant
      { order: 5, factor: 0.5 },
      { order: 7, factor: 0.3 },
      { order: 9, factor: 0.2 },
      { order: 11, factor: 0.15 },
      { order: 13, factor: 0.1 },
      { order: 15, factor: 0.08 },
      { order: 17, factor: 0.06 },
      { order: 19, factor: 0.04 }
    ]
    
    // Distribute THD across harmonics
    const thdRatio = thd / 100
    
    harmonicFactors.forEach(({ order, factor }) => {
      const magnitude = fundamental * thdRatio * factor
      const frequency = 60 * order // 60Hz fundamental
      const phase = -order * 30 // Typical phase shift pattern
      
      harmonics.push({
        frequency,
        magnitude,
        phase
      })
    })
    
    return harmonics
  }
  
  /**
   * Calculate power factor based on THD
   */
  private calculatePowerFactor(thd: number, hasActivePFC: boolean): number {
    // Displacement power factor
    const dpf = hasActivePFC ? 0.99 : 0.85
    
    // Distortion power factor
    const distortionFactor = 1 / Math.sqrt(1 + Math.pow(thd / 100, 2))
    
    // True power factor
    const pf = dpf * distortionFactor
    
    return Number(pf.toFixed(3))
  }
  
  /**
   * Generate recommendations for THD reduction
   */
  private generateRecommendations(
    thd: number,
    powerFactor: number,
    hasActivePFC: boolean,
    dimmingLevel: number
  ): string[] {
    const recommendations: string[] = []
    
    if (thd > this.DLC_THD_LIMIT) {
      recommendations.push('THD exceeds DLC Premium limit of 20%')
    }
    
    if (!hasActivePFC && thd > 15) {
      recommendations.push('Consider drivers with active power factor correction (PFC)')
    }
    
    if (dimmingLevel < 50 && thd > 25) {
      recommendations.push('THD increases significantly at low dimming levels - consider raising minimum dim level')
    }
    
    if (powerFactor < 0.9) {
      recommendations.push('Power factor below 0.9 - may require power factor correction')
    }
    
    if (thd > 30) {
      recommendations.push('Consider installing harmonic filters or line reactors')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('System meets DLC Premium THD requirements')
    }
    
    return recommendations
  }
  
  /**
   * Analyze system-wide THD with multiple fixtures
   */
  analyzeSystemTHD(
    fixtures: {
      quantity: number
      powerRating: number
      thd: number
      powerFactor: number
    }[],
    transformerRating: number
  ): {
    systemTHD: number
    totalPower: number
    avgPowerFactor: number
    dlcCompliant: boolean
    mitigationOptions: string[]
  } {
    // Calculate total load
    const totalPower = fixtures.reduce((sum, f) => sum + f.quantity * f.powerRating, 0)
    
    // Calculate weighted average THD
    let thdNumerator = 0
    let pfNumerator = 0
    
    fixtures.forEach(fixture => {
      const power = fixture.quantity * fixture.powerRating
      thdNumerator += power * fixture.thd
      pfNumerator += power * fixture.powerFactor
    })
    
    const systemTHD = thdNumerator / totalPower
    const avgPowerFactor = pfNumerator / totalPower
    
    // Check transformer derating
    const transformerDerating = this.calculateTransformerDerating(systemTHD)
    const effectiveTransformerCapacity = transformerRating * (1 - transformerDerating)
    
    const mitigationOptions: string[] = []
    
    if (systemTHD > this.DLC_THD_LIMIT) {
      mitigationOptions.push('Install active harmonic filter at main panel')
      mitigationOptions.push('Use drivers with lower THD ratings')
      mitigationOptions.push('Implement phase shifting between fixture groups')
    }
    
    if (totalPower > effectiveTransformerCapacity) {
      mitigationOptions.push(`Transformer derating required: ${(transformerDerating * 100).toFixed(1)}%`)
      mitigationOptions.push('Consider upsizing transformer or reducing harmonic load')
    }
    
    if (avgPowerFactor < 0.9) {
      mitigationOptions.push('Install power factor correction capacitors')
    }
    
    return {
      systemTHD: Number(systemTHD.toFixed(2)),
      totalPower,
      avgPowerFactor: Number(avgPowerFactor.toFixed(3)),
      dlcCompliant: systemTHD < this.DLC_THD_LIMIT,
      mitigationOptions
    }
  }
  
  /**
   * Calculate transformer derating due to harmonics
   */
  private calculateTransformerDerating(thd: number): number {
    // K-factor calculation for transformer derating
    const kFactor = 1 + 0.5 * Math.pow(thd / 100, 2)
    
    // Derating percentage
    const derating = (kFactor - 1) * 0.5
    
    return Math.min(derating, 0.3) // Cap at 30% derating
  }
  
  /**
   * Recommend harmonic filter sizing
   */
  recommendHarmonicFilter(
    systemTHD: number,
    totalLoad: number,
    targetTHD: number = 15
  ): {
    filterType: 'passive' | 'active' | 'hybrid'
    rating: number
    expectedTHD: number
    cost: number
  } {
    const thdReduction = systemTHD - targetTHD
    
    let filterType: 'passive' | 'active' | 'hybrid'
    let filterEfficiency: number
    let costPerKW: number
    
    if (thdReduction < 10) {
      filterType = 'passive'
      filterEfficiency = 0.6
      costPerKW = 50
    } else if (thdReduction < 20) {
      filterType = 'hybrid'
      filterEfficiency = 0.8
      costPerKW = 150
    } else {
      filterType = 'active'
      filterEfficiency = 0.95
      costPerKW = 250
    }
    
    const requiredFilterCapacity = totalLoad * (thdReduction / systemTHD) / filterEfficiency
    const rating = Math.ceil(requiredFilterCapacity / 10) * 10 // Round up to nearest 10kW
    
    const expectedTHD = systemTHD - (thdReduction * filterEfficiency)
    const cost = rating * costPerKW
    
    return {
      filterType,
      rating,
      expectedTHD: Number(expectedTHD.toFixed(2)),
      cost
    }
  }
  
  /**
   * Calculate harmonic losses
   */
  calculateHarmonicLosses(
    thd: number,
    fundamentalCurrent: number,
    resistance: number
  ): {
    fundamentalLosses: number
    harmonicLosses: number
    totalLosses: number
    lossIncrease: number
  } {
    // I²R losses at fundamental frequency
    const fundamentalLosses = Math.pow(fundamentalCurrent, 2) * resistance
    
    // Additional losses due to harmonics
    // Harmonics cause increased losses due to skin effect and proximity effect
    const harmonicLossFactor = 1 + Math.pow(thd / 100, 2) * 1.5
    const totalLosses = fundamentalLosses * harmonicLossFactor
    const harmonicLosses = totalLosses - fundamentalLosses
    
    const lossIncrease = ((totalLosses / fundamentalLosses) - 1) * 100
    
    return {
      fundamentalLosses: Number(fundamentalLosses.toFixed(2)),
      harmonicLosses: Number(harmonicLosses.toFixed(2)),
      totalLosses: Number(totalLosses.toFixed(2)),
      lossIncrease: Number(lossIncrease.toFixed(1))
    }
  }
}