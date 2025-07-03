/**
 * Hyperspectral Imaging Analyzer
 * Processes hyperspectral data for plant health monitoring,
 * stress detection, and nutrient deficiency analysis
 */

export interface SpectralBand {
  wavelength: number // nm
  reflectance: number // 0-1
  absorbance: number // 0-1
}

export interface HyperspectralData {
  bands: SpectralBand[]
  timestamp: Date
  temperature: number // °C
  humidity: number // %
  coordinates?: { x: number; y: number }
}

export interface VegetationIndex {
  name: string
  value: number
  interpretation: string
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
}

export interface StressIndicator {
  type: 'water' | 'nutrient' | 'disease' | 'pest' | 'light' | 'temperature'
  severity: number // 0-100
  confidence: number // 0-100
  recommendation: string
}

export interface NutrientStatus {
  nitrogen: { level: number; status: string }
  phosphorus: { level: number; status: string }
  potassium: { level: number; status: string }
  calcium: { level: number; status: string }
  magnesium: { level: number; status: string }
  iron: { level: number; status: string }
}

export class HyperspectralAnalyzer {
  /**
   * Calculate vegetation indices from spectral data
   */
  calculateVegetationIndices(data: HyperspectralData): VegetationIndex[] {
    const indices: VegetationIndex[] = []
    
    // Get reflectance values at specific wavelengths
    const getReflectance = (wavelength: number): number => {
      const band = data.bands.find(b => Math.abs(b.wavelength - wavelength) < 5)
      return band?.reflectance || 0
    }
    
    // NDVI (Normalized Difference Vegetation Index)
    const nir = getReflectance(800) // Near-infrared
    const red = getReflectance(670) // Red
    const ndvi = (nir - red) / (nir + red)
    
    indices.push({
      name: 'NDVI',
      value: ndvi,
      interpretation: this.interpretNDVI(ndvi),
      healthStatus: this.getHealthStatus(ndvi, 0.8, 0.6, 0.4, 0.2)
    })
    
    // EVI (Enhanced Vegetation Index)
    const blue = getReflectance(480)
    const evi = 2.5 * ((nir - red) / (nir + 6 * red - 7.5 * blue + 1))
    
    indices.push({
      name: 'EVI',
      value: evi,
      interpretation: this.interpretEVI(evi),
      healthStatus: this.getHealthStatus(evi, 0.6, 0.4, 0.3, 0.2)
    })
    
    // SAVI (Soil Adjusted Vegetation Index)
    const L = 0.5 // Soil brightness correction factor
    const savi = ((nir - red) / (nir + red + L)) * (1 + L)
    
    indices.push({
      name: 'SAVI',
      value: savi,
      interpretation: this.interpretSAVI(savi),
      healthStatus: this.getHealthStatus(savi, 0.6, 0.4, 0.3, 0.2)
    })
    
    // PRI (Photochemical Reflectance Index)
    const r531 = getReflectance(531)
    const r570 = getReflectance(570)
    const pri = (r531 - r570) / (r531 + r570)
    
    indices.push({
      name: 'PRI',
      value: pri,
      interpretation: this.interpretPRI(pri),
      healthStatus: this.getHealthStatus(pri, 0.1, 0.05, 0, -0.05)
    })
    
    // WBI (Water Band Index)
    const r900 = getReflectance(900)
    const r970 = getReflectance(970)
    const wbi = r900 / r970
    
    indices.push({
      name: 'WBI',
      value: wbi,
      interpretation: this.interpretWBI(wbi),
      healthStatus: this.getHealthStatus(wbi, 1.2, 1.1, 1.0, 0.9)
    })
    
    // MCARI (Modified Chlorophyll Absorption Ratio Index)
    const r700 = getReflectance(700)
    const r550 = getReflectance(550)
    const mcari = ((r700 - red) - 0.2 * (r700 - r550)) * (r700 / red)
    
    indices.push({
      name: 'MCARI',
      value: mcari,
      interpretation: this.interpretMCARI(mcari),
      healthStatus: this.getHealthStatus(mcari, 2.0, 1.5, 1.0, 0.5)
    })
    
    return indices
  }
  
  /**
   * Detect plant stress from spectral signatures
   */
  detectStress(data: HyperspectralData): StressIndicator[] {
    const stressIndicators: StressIndicator[] = []
    const indices = this.calculateVegetationIndices(data)
    
    // Water stress detection
    const wbi = indices.find(i => i.name === 'WBI')
    if (wbi && wbi.value < 1.0) {
      stressIndicators.push({
        type: 'water',
        severity: (1.0 - wbi.value) * 100,
        confidence: 85,
        recommendation: 'Increase irrigation frequency or volume. Check soil moisture levels.'
      })
    }
    
    // Nutrient stress detection (using red edge analysis)
    const redEdgePosition = this.calculateRedEdgePosition(data)
    if (redEdgePosition < 700) {
      stressIndicators.push({
        type: 'nutrient',
        severity: (700 - redEdgePosition) / 2,
        confidence: 75,
        recommendation: 'Check nitrogen levels. Consider foliar application or fertigation adjustment.'
      })
    }
    
    // Light stress detection (using PRI)
    const pri = indices.find(i => i.name === 'PRI')
    if (pri && pri.value < -0.05) {
      stressIndicators.push({
        type: 'light',
        severity: Math.abs(pri.value) * 200,
        confidence: 70,
        recommendation: 'Reduce light intensity or adjust photoperiod. Check for photoinhibition.'
      })
    }
    
    // Disease detection (spectral anomalies)
    const spectralAnomalies = this.detectSpectralAnomalies(data)
    if (spectralAnomalies > 0.3) {
      stressIndicators.push({
        type: 'disease',
        severity: spectralAnomalies * 100,
        confidence: 65,
        recommendation: 'Inspect plants for visible symptoms. Consider preventive fungicide application.'
      })
    }
    
    // Temperature stress (if environmental data available)
    if (data.temperature < 18 || data.temperature > 30) {
      const severity = data.temperature < 18 
        ? (18 - data.temperature) * 5 
        : (data.temperature - 30) * 5
      
      stressIndicators.push({
        type: 'temperature',
        severity: Math.min(severity, 100),
        confidence: 90,
        recommendation: data.temperature < 18 
          ? 'Increase ambient temperature or add heating' 
          : 'Improve ventilation or add cooling'
      })
    }
    
    return stressIndicators
  }
  
  /**
   * Analyze nutrient status from spectral data
   */
  analyzeNutrientStatus(data: HyperspectralData): NutrientStatus {
    // Spectral indices correlating with nutrient levels
    const indices = this.calculateVegetationIndices(data)
    const ndvi = indices.find(i => i.name === 'NDVI')?.value || 0
    const mcari = indices.find(i => i.name === 'MCARI')?.value || 0
    
    // Red edge position for nitrogen
    const redEdgePosition = this.calculateRedEdgePosition(data)
    const nitrogenLevel = this.estimateNitrogenLevel(redEdgePosition, ndvi)
    
    // Phosphorus estimation (using blue/green ratio)
    const blueGreenRatio = this.calculateBlueGreenRatio(data)
    const phosphorusLevel = this.estimatePhosphorusLevel(blueGreenRatio)
    
    // Potassium estimation (using NIR/red ratio)
    const nirRedRatio = this.calculateNIRRedRatio(data)
    const potassiumLevel = this.estimatePotassiumLevel(nirRedRatio)
    
    // Secondary nutrients (simplified estimation)
    const calciumLevel = ndvi > 0.7 ? 80 : ndvi * 100
    const magnesiumLevel = mcari > 1.5 ? 85 : mcari * 50
    const ironLevel = this.estimateIronLevel(data)
    
    return {
      nitrogen: {
        level: nitrogenLevel,
        status: this.getNutrientStatus(nitrogenLevel)
      },
      phosphorus: {
        level: phosphorusLevel,
        status: this.getNutrientStatus(phosphorusLevel)
      },
      potassium: {
        level: potassiumLevel,
        status: this.getNutrientStatus(potassiumLevel)
      },
      calcium: {
        level: calciumLevel,
        status: this.getNutrientStatus(calciumLevel)
      },
      magnesium: {
        level: magnesiumLevel,
        status: this.getNutrientStatus(magnesiumLevel)
      },
      iron: {
        level: ironLevel,
        status: this.getNutrientStatus(ironLevel)
      }
    }
  }
  
  /**
   * Generate hyperspectral map for visualization
   */
  generateHyperspectralMap(
    dataPoints: HyperspectralData[],
    width: number,
    height: number,
    index: 'NDVI' | 'EVI' | 'WBI' | 'PRI' = 'NDVI'
  ): number[][] {
    const map: number[][] = Array(height).fill(null).map(() => Array(width).fill(0))
    
    // Process each data point
    for (const data of dataPoints) {
      if (!data.coordinates) continue
      
      const indices = this.calculateVegetationIndices(data)
      const value = indices.find(i => i.name === index)?.value || 0
      
      const x = Math.floor(data.coordinates.x)
      const y = Math.floor(data.coordinates.y)
      
      if (x >= 0 && x < width && y >= 0 && y < height) {
        map[y][x] = value
      }
    }
    
    // Apply spatial interpolation for smooth visualization
    return this.spatialInterpolation(map)
  }
  
  /**
   * Machine learning classification of plant conditions
   */
  classifyPlantCondition(data: HyperspectralData): {
    condition: string
    confidence: number
    features: string[]
  } {
    const indices = this.calculateVegetationIndices(data)
    const stress = this.detectStress(data)
    
    // Feature extraction
    const features: string[] = []
    
    // NDVI-based classification
    const ndvi = indices.find(i => i.name === 'NDVI')?.value || 0
    if (ndvi > 0.8) features.push('high-vigor')
    else if (ndvi > 0.6) features.push('healthy')
    else if (ndvi > 0.4) features.push('moderate-stress')
    else features.push('severe-stress')
    
    // Stress-based features
    if (stress.some(s => s.type === 'water')) features.push('water-stressed')
    if (stress.some(s => s.type === 'nutrient')) features.push('nutrient-deficient')
    if (stress.some(s => s.type === 'disease')) features.push('possible-disease')
    
    // Determine overall condition
    let condition = 'Healthy'
    let confidence = 90
    
    if (features.includes('severe-stress')) {
      condition = 'Critical - Immediate attention required'
      confidence = 85
    } else if (features.includes('water-stressed') && features.includes('nutrient-deficient')) {
      condition = 'Multiple stresses detected'
      confidence = 75
    } else if (features.includes('moderate-stress')) {
      condition = 'Moderate stress - Monitor closely'
      confidence = 80
    } else if (features.includes('possible-disease')) {
      condition = 'Disease risk - Inspect plants'
      confidence = 70
    }
    
    return { condition, confidence, features }
  }
  
  // Helper methods
  private interpretNDVI(value: number): string {
    if (value > 0.8) return 'Very healthy, dense vegetation'
    if (value > 0.6) return 'Healthy vegetation'
    if (value > 0.4) return 'Moderate vegetation'
    if (value > 0.2) return 'Sparse vegetation'
    return 'Very sparse or stressed vegetation'
  }
  
  private interpretEVI(value: number): string {
    if (value > 0.6) return 'Excellent canopy structure'
    if (value > 0.4) return 'Good canopy density'
    if (value > 0.3) return 'Moderate canopy'
    return 'Poor canopy development'
  }
  
  private interpretSAVI(value: number): string {
    if (value > 0.6) return 'Dense vegetation with minimal soil influence'
    if (value > 0.4) return 'Moderate vegetation cover'
    return 'Sparse vegetation with high soil visibility'
  }
  
  private interpretPRI(value: number): string {
    if (value > 0.1) return 'High photosynthetic efficiency'
    if (value > 0.05) return 'Good light use efficiency'
    if (value > 0) return 'Moderate efficiency'
    return 'Light stress detected'
  }
  
  private interpretWBI(value: number): string {
    if (value > 1.2) return 'High water content'
    if (value > 1.1) return 'Adequate water status'
    if (value > 1.0) return 'Moderate water stress'
    return 'Severe water stress'
  }
  
  private interpretMCARI(value: number): string {
    if (value > 2.0) return 'High chlorophyll content'
    if (value > 1.5) return 'Good chlorophyll levels'
    if (value > 1.0) return 'Moderate chlorophyll'
    return 'Low chlorophyll - possible deficiency'
  }
  
  private getHealthStatus(
    value: number,
    excellent: number,
    good: number,
    fair: number,
    poor: number
  ): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (value >= excellent) return 'excellent'
    if (value >= good) return 'good'
    if (value >= fair) return 'fair'
    if (value >= poor) return 'poor'
    return 'critical'
  }
  
  private calculateRedEdgePosition(data: HyperspectralData): number {
    // Find the wavelength of maximum slope in red edge region (680-750nm)
    let maxSlope = 0
    let redEdgePosition = 700
    
    for (let i = 1; i < data.bands.length; i++) {
      const band = data.bands[i]
      const prevBand = data.bands[i - 1]
      
      if (band.wavelength >= 680 && band.wavelength <= 750) {
        const slope = (band.reflectance - prevBand.reflectance) / 
                     (band.wavelength - prevBand.wavelength)
        if (slope > maxSlope) {
          maxSlope = slope
          redEdgePosition = band.wavelength
        }
      }
    }
    
    return redEdgePosition
  }
  
  private detectSpectralAnomalies(data: HyperspectralData): number {
    // Simple anomaly detection using spectral curve smoothness
    let anomalyScore = 0
    const expectedCurve = this.generateExpectedSpectralCurve(data.bands[0].wavelength)
    
    for (let i = 0; i < data.bands.length; i++) {
      const expected = expectedCurve[i]
      const actual = data.bands[i].reflectance
      const deviation = Math.abs(expected - actual) / expected
      anomalyScore += deviation
    }
    
    return anomalyScore / data.bands.length
  }
  
  private generateExpectedSpectralCurve(startWavelength: number): number[] {
    // Simplified healthy vegetation spectral curve
    const curve: number[] = []
    for (let wl = startWavelength; wl <= 1000; wl += 10) {
      let reflectance = 0
      if (wl < 500) reflectance = 0.05 // Low in blue
      else if (wl < 600) reflectance = 0.10 + (wl - 500) * 0.001 // Rising in green
      else if (wl < 700) reflectance = 0.05 // Low in red
      else if (wl < 750) reflectance = 0.05 + (wl - 700) * 0.008 // Red edge
      else reflectance = 0.45 // High in NIR
      
      curve.push(reflectance)
    }
    return curve
  }
  
  private calculateBlueGreenRatio(data: HyperspectralData): number {
    const blue = data.bands.find(b => Math.abs(b.wavelength - 480) < 10)?.reflectance || 0
    const green = data.bands.find(b => Math.abs(b.wavelength - 550) < 10)?.reflectance || 0
    return green > 0 ? blue / green : 0
  }
  
  private calculateNIRRedRatio(data: HyperspectralData): number {
    const nir = data.bands.find(b => Math.abs(b.wavelength - 800) < 10)?.reflectance || 0
    const red = data.bands.find(b => Math.abs(b.wavelength - 670) < 10)?.reflectance || 0
    return red > 0 ? nir / red : 0
  }
  
  private estimateNitrogenLevel(redEdgePosition: number, ndvi: number): number {
    // Empirical relationship between red edge position and N content
    const repContribution = (redEdgePosition - 680) / 70 * 50 // 0-50%
    const ndviContribution = ndvi * 50 // 0-50%
    return Math.min(100, repContribution + ndviContribution)
  }
  
  private estimatePhosphorusLevel(blueGreenRatio: number): number {
    // Empirical estimation
    return Math.min(100, blueGreenRatio * 120)
  }
  
  private estimatePotassiumLevel(nirRedRatio: number): number {
    // Empirical estimation
    return Math.min(100, nirRedRatio * 15)
  }
  
  private estimateIronLevel(data: HyperspectralData): number {
    // Iron deficiency shows in specific wavelengths
    const r550 = data.bands.find(b => Math.abs(b.wavelength - 550) < 10)?.reflectance || 0
    const r700 = data.bands.find(b => Math.abs(b.wavelength - 700) < 10)?.reflectance || 0
    const ratio = r700 > 0 ? r550 / r700 : 0
    return Math.min(100, ratio * 150)
  }
  
  private getNutrientStatus(level: number): string {
    if (level >= 80) return 'Optimal'
    if (level >= 60) return 'Adequate'
    if (level >= 40) return 'Low'
    if (level >= 20) return 'Deficient'
    return 'Severely deficient'
  }
  
  private spatialInterpolation(map: number[][]): number[][] {
    // Simple bilinear interpolation for smoother visualization
    const height = map.length
    const width = map[0].length
    const interpolated = map.map(row => [...row])
    
    // Fill in gaps using neighboring values
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (map[y][x] === 0) {
          const neighbors = [
            map[y - 1][x], map[y + 1][x],
            map[y][x - 1], map[y][x + 1]
          ].filter(v => v !== 0)
          
          if (neighbors.length > 0) {
            interpolated[y][x] = neighbors.reduce((a, b) => a + b) / neighbors.length
          }
        }
      }
    }
    
    return interpolated
  }
}