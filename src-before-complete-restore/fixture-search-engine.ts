/**
 * Advanced Fixture Search & Recommendation Engine
 * AI-powered fixture discovery with compatibility scoring
 */

import { db } from './db'
import { cropDatabase } from './crop-database'

export interface SearchFilters {
  // Basic filters
  wattageRange?: [number, number]
  efficacyRange?: [number, number] // umol/J
  coverageArea?: number // sq ft
  mountingHeight?: number // inches
  priceRange?: [number, number]
  
  // Spectrum filters
  spectrumType?: 'full-spectrum' | 'red-blue' | 'white-supplemented' | 'custom'
  redContent?: [number, number] // percentage
  blueContent?: [number, number]
  farRedContent?: [number, number]
  greenContent?: [number, number]
  uvContent?: [number, number]
  
  // Application filters
  growthStage?: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'all'
  cropType?: string
  indoorType?: 'greenhouse' | 'vertical-farm' | 'grow-tent' | 'warehouse'
  
  // Performance filters
  dimmable?: boolean
  lifespan?: number // hours
  thermalManagement?: 'passive' | 'active' | 'any'
  certification?: 'dlc' | 'etl' | 'ul' | 'ce' | 'any'
  
  // Brand preferences
  manufacturer?: string[]
  excludeManufacturers?: string[]
  
  // Sustainability
  energyStarRated?: boolean
  recyclable?: boolean
  
  // Advanced
  ppfdTarget?: number // umol/m²/s
  dliTarget?: number // mol/m²/day
  sortBy?: 'relevance' | 'price' | 'efficacy' | 'ppfd' | 'wattage' | 'newest'
  limit?: number
}

export interface CompatibilityScore {
  overall: number // 0-100
  spectrum: number
  efficiency: number
  coverage: number
  growthStage: number
  cost: number
  breakdown: {
    spectrumMatch: number
    efficacyRating: number
    coverageRating: number
    stageOptimization: number
    costEffectiveness: number
    thermalPerformance: number
  }
  recommendations: string[]
  warnings: string[]
}

export interface FixtureRecommendation {
  fixture: any
  score: CompatibilityScore
  reasoning: string
  alternatives: any[]
  estimatedCoverage: {
    area: number // sq ft
    ppfd: number // umol/m²/s
    dli: number // mol/m²/day
  }
  costAnalysis: {
    initialCost: number
    operatingCostPerYear: number
    totalCostOfOwnership: number
    paybackPeriod?: number
  }
}

export interface CropRequirements {
  crop: string
  ppfdRange: [number, number]
  dliRange: [number, number]
  spectrumPreferences: {
    red: [number, number]
    blue: [number, number]
    farRed: [number, number]
    green: [number, number]
    uv?: [number, number]
  }
  growthStages: {
    seedling?: { ppfd: number; spectrum: any }
    vegetative?: { ppfd: number; spectrum: any }
    flowering?: { ppfd: number; spectrum: any }
    fruiting?: { ppfd: number; spectrum: any }
  }
  environmentalNeeds: {
    temperature: [number, number]
    humidity: [number, number]
    co2: [number, number]
  }
}

class FixtureSearchEngine {
  private fixtures: any[] = []
  private cropRequirements: Map<string, CropRequirements> = new Map()
  
  async initialize() {
    // Load fixtures from database
    this.fixtures = await db.fixtures.findMany()
    
    // Parse crop requirements from crop database
    this.loadCropRequirements()
    
  }

  private loadCropRequirements() {
    try {
      Object.entries(cropDatabase).forEach(([category, crops]) => {
        // Ensure crops is an array
        if (!Array.isArray(crops)) {
          console.warn(`Skipping category ${category}: crops is not an array`)
          return
        }
        
        crops.forEach(crop => {
          if (!crop || !crop.name) {
            console.warn(`Skipping invalid crop in category ${category}`)
            return
          }
          
          // Extract PPFD and DLI from growth requirements
          const ppfdRange = this.extractPPFDRange(crop.growthRequirements)
          const dliRange = this.extractDLIRange(crop.growthRequirements)
          const spectrum = this.extractSpectrumPreferences(crop.lightingRequirements)
          
          this.cropRequirements.set(crop.name.toLowerCase(), {
            crop: crop.name,
            ppfdRange,
            dliRange,
            spectrumPreferences: spectrum,
            growthStages: this.extractGrowthStages(crop),
            environmentalNeeds: {
              temperature: [65, 80], // Default ranges
              humidity: [50, 70],
              co2: [400, 1200]
            }
          })
        })
      })
    } catch (error) {
      console.error('Error loading crop requirements:', error)
      // Initialize with some default crop requirements
      this.initializeDefaultCropRequirements()
    }
  }

  private initializeDefaultCropRequirements() {
    // Add some default crop requirements as fallback
    const defaults = [
      { name: 'Lettuce', ppfd: [150, 300], dli: [12, 20] },
      { name: 'Tomatoes', ppfd: [300, 600], dli: [20, 30] },
      { name: 'Herbs', ppfd: [200, 400], dli: [15, 25] },
      { name: 'Microgreens', ppfd: [100, 250], dli: [10, 15] }
    ]
    
    defaults.forEach(crop => {
      this.cropRequirements.set(crop.name.toLowerCase(), {
        crop: crop.name,
        ppfdRange: crop.ppfd as [number, number],
        dliRange: crop.dli as [number, number],
        spectrumPreferences: {
          red: [30, 50],
          blue: [20, 30],
          farRed: [5, 10],
          green: [10, 20]
        },
        growthStages: {},
        environmentalNeeds: {
          temperature: [65, 80],
          humidity: [50, 70],
          co2: [400, 1200]
        }
      })
    })
  }

  private extractPPFDRange(requirements: any): [number, number] {
    // Parse PPFD requirements from text
    const text = JSON.stringify(requirements).toLowerCase()
    
    if (text.includes('high light') || text.includes('full sun')) return [400, 800]
    if (text.includes('medium light') || text.includes('partial sun')) return [200, 400]
    if (text.includes('low light') || text.includes('shade')) return [50, 200]
    if (text.includes('leafy green') || text.includes('lettuce')) return [150, 300]
    if (text.includes('tomato') || text.includes('pepper') || text.includes('fruiting')) return [300, 600]
    if (text.includes('herb') || text.includes('basil')) return [200, 400]
    if (text.includes('microgreen')) return [100, 250]
    
    return [200, 400] // Default
  }

  private extractDLIRange(requirements: any): [number, number] {
    const text = JSON.stringify(requirements).toLowerCase()
    
    if (text.includes('high light')) return [20, 40]
    if (text.includes('medium light')) return [12, 20]
    if (text.includes('low light')) return [6, 12]
    if (text.includes('leafy green')) return [12, 18]
    if (text.includes('fruiting')) return [20, 35]
    if (text.includes('herb')) return [14, 22]
    if (text.includes('microgreen')) return [8, 16]
    
    return [12, 20] // Default
  }

  private extractSpectrumPreferences(requirements: any): any {
    const text = JSON.stringify(requirements).toLowerCase()
    
    // Default full spectrum
    const spectrum = {
      red: [25, 35],
      blue: [15, 25],
      farRed: [5, 15],
      green: [20, 30]
    }

    // Adjust for specific crops
    if (text.includes('flowering') || text.includes('fruiting')) {
      spectrum.red = [30, 40]
      spectrum.farRed = [10, 20]
    }
    
    if (text.includes('leafy') || text.includes('vegetative')) {
      spectrum.blue = [20, 30]
      spectrum.red = [20, 30]
    }

    return spectrum
  }

  private extractGrowthStages(crop: any): any {
    return {
      seedling: { ppfd: 100, spectrum: { blue: 30, red: 20 } },
      vegetative: { ppfd: 250, spectrum: { blue: 25, red: 25 } },
      flowering: { ppfd: 400, spectrum: { red: 35, farRed: 15 } },
      fruiting: { ppfd: 500, spectrum: { red: 30, farRed: 10 } }
    }
  }

  async searchFixtures(filters: SearchFilters): Promise<FixtureRecommendation[]> {
    let filteredFixtures = [...this.fixtures]

    // Apply basic filters
    if (filters.wattageRange) {
      filteredFixtures = filteredFixtures.filter(f => 
        f.specifications.wattage >= filters.wattageRange![0] && 
        f.specifications.wattage <= filters.wattageRange![1]
      )
    }

    if (filters.efficacyRange) {
      filteredFixtures = filteredFixtures.filter(f => 
        f.specifications.efficacy >= filters.efficacyRange![0] && 
        f.specifications.efficacy <= filters.efficacyRange![1]
      )
    }

    if (filters.priceRange) {
      filteredFixtures = filteredFixtures.filter(f => 
        f.pricing.msrp >= filters.priceRange![0] && 
        f.pricing.msrp <= filters.priceRange![1]
      )
    }

    if (filters.manufacturer) {
      filteredFixtures = filteredFixtures.filter(f => 
        filters.manufacturer!.includes(f.manufacturer)
      )
    }

    if (filters.excludeManufacturers) {
      filteredFixtures = filteredFixtures.filter(f => 
        !filters.excludeManufacturers!.includes(f.manufacturer)
      )
    }

    if (filters.dimmable !== undefined) {
      filteredFixtures = filteredFixtures.filter(f => 
        f.features.dimmable === filters.dimmable
      )
    }

    if (filters.certification && filters.certification !== 'any') {
      filteredFixtures = filteredFixtures.filter(f => 
        f.certifications.includes(filters.certification)
      )
    }

    // Calculate compatibility scores
    const recommendations = await Promise.all(
      filteredFixtures.map(async fixture => {
        const score = await this.calculateCompatibilityScore(fixture, filters)
        const reasoning = this.generateReasoning(fixture, score, filters)
        const alternatives = await this.findAlternatives(fixture, filters)
        const estimatedCoverage = this.calculateCoverage(fixture, filters)
        const costAnalysis = this.calculateCostAnalysis(fixture, filters)

        return {
          fixture,
          score,
          reasoning,
          alternatives,
          estimatedCoverage,
          costAnalysis
        }
      })
    )

    // Sort by score and filters
    recommendations.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          return a.fixture.pricing.msrp - b.fixture.pricing.msrp
        case 'efficacy':
          return b.fixture.specifications.efficacy - a.fixture.specifications.efficacy
        case 'ppfd':
          return b.fixture.specifications.ppfd - a.fixture.specifications.ppfd
        case 'wattage':
          return a.fixture.specifications.wattage - b.fixture.specifications.wattage
        default:
          return b.score.overall - a.score.overall
      }
    })

    return recommendations.slice(0, filters.limit || 20)
  }

  async calculateCompatibilityScore(fixture: any, filters: SearchFilters): Promise<CompatibilityScore> {
    let spectrumScore = 100
    let efficiencyScore = 100
    let coverageScore = 100
    let growthStageScore = 100
    let costScore = 100

    const breakdown = {
      spectrumMatch: 100,
      efficacyRating: 100,
      coverageRating: 100,
      stageOptimization: 100,
      costEffectiveness: 100,
      thermalPerformance: 100
    }

    const recommendations: string[] = []
    const warnings: string[] = []

    // Spectrum compatibility
    if (filters.cropType) {
      const cropReqs = this.cropRequirements.get(filters.cropType.toLowerCase())
      if (cropReqs) {
        spectrumScore = this.calculateSpectrumMatch(fixture, cropReqs)
        breakdown.spectrumMatch = spectrumScore
        
        if (spectrumScore < 70) {
          warnings.push(`Spectrum may not be optimal for ${filters.cropType}`)
        } else if (spectrumScore > 90) {
          recommendations.push(`Excellent spectrum match for ${filters.cropType}`)
        }
      }
    }

    // Efficiency scoring
    const efficacy = fixture.specifications.efficacy
    if (efficacy > 2.8) {
      efficiencyScore = 100
      recommendations.push('High efficiency fixture - excellent energy savings')
    } else if (efficacy > 2.5) {
      efficiencyScore = 85
    } else if (efficacy > 2.2) {
      efficiencyScore = 70
    } else {
      efficiencyScore = 50
      warnings.push('Lower efficiency - higher operating costs')
    }
    breakdown.efficacyRating = efficiencyScore

    // Coverage assessment
    if (filters.coverageArea) {
      const maxCoverage = this.calculateMaxCoverage(fixture)
      if (maxCoverage >= filters.coverageArea) {
        coverageScore = 100
        recommendations.push('Adequate coverage for specified area')
      } else {
        coverageScore = Math.max(50, (maxCoverage / filters.coverageArea) * 100)
        warnings.push('May need multiple fixtures for desired coverage')
      }
    }
    breakdown.coverageRating = coverageScore

    // Growth stage optimization
    if (filters.growthStage && filters.cropType) {
      growthStageScore = this.calculateGrowthStageMatch(fixture, filters.growthStage, filters.cropType)
      breakdown.stageOptimization = growthStageScore
    }

    // Cost effectiveness
    const pricePerUmol = fixture.pricing.msrp / fixture.specifications.ppfd
    if (pricePerUmol < 1.0) {
      costScore = 100
      recommendations.push('Excellent value for light output')
    } else if (pricePerUmol < 1.5) {
      costScore = 85
    } else if (pricePerUmol < 2.0) {
      costScore = 70
    } else {
      costScore = 50
      warnings.push('Higher cost per unit of light output')
    }
    breakdown.costEffectiveness = costScore

    // Thermal performance
    const thermalScore = this.calculateThermalScore(fixture)
    breakdown.thermalPerformance = thermalScore
    
    if (thermalScore < 70) {
      warnings.push('May require additional cooling')
    }

    // Calculate overall score (weighted average)
    const overall = Math.round(
      spectrumScore * 0.25 +
      efficiencyScore * 0.20 +
      coverageScore * 0.20 +
      growthStageScore * 0.15 +
      costScore * 0.15 +
      thermalScore * 0.05
    )

    return {
      overall,
      spectrum: spectrumScore,
      efficiency: efficiencyScore,
      coverage: coverageScore,
      growthStage: growthStageScore,
      cost: costScore,
      breakdown,
      recommendations,
      warnings
    }
  }

  private calculateSpectrumMatch(fixture: any, cropReqs: CropRequirements): number {
    const spectrum = fixture.specifications.spectrum
    const prefs = cropReqs.spectrumPreferences
    
    let score = 100
    
    // Check red content
    if (spectrum.red < prefs.red[0] || spectrum.red > prefs.red[1]) {
      score -= 15
    }
    
    // Check blue content
    if (spectrum.blue < prefs.blue[0] || spectrum.blue > prefs.blue[1]) {
      score -= 15
    }
    
    // Check far-red content
    if (spectrum.farRed < prefs.farRed[0] || spectrum.farRed > prefs.farRed[1]) {
      score -= 10
    }
    
    // Check green content
    if (spectrum.green < prefs.green[0] || spectrum.green > prefs.green[1]) {
      score -= 10
    }
    
    return Math.max(0, score)
  }

  private calculateMaxCoverage(fixture: any): number {
    // Calculate coverage based on PPFD and mounting height
    const ppfd = fixture.specifications.ppfd
    const wattage = fixture.specifications.wattage
    
    // Approximate coverage calculation
    // Higher PPFD fixtures can cover larger areas at reduced intensity
    return Math.round(wattage * 0.8) // sq ft approximation
  }

  private calculateGrowthStageMatch(fixture: any, stage: string, cropType: string): number {
    const cropReqs = this.cropRequirements.get(cropType.toLowerCase())
    if (!cropReqs || !cropReqs.growthStages[stage]) return 80
    
    const stageReqs = cropReqs.growthStages[stage]
    const fixturePPFD = fixture.specifications.ppfd
    const targetPPFD = stageReqs.ppfd
    
    // Score based on PPFD match
    const ppfdRatio = Math.min(fixturePPFD, targetPPFD) / Math.max(fixturePPFD, targetPPFD)
    return Math.round(ppfdRatio * 100)
  }

  private calculateThermalScore(fixture: any): number {
    const efficiency = fixture.specifications.efficacy
    const wattage = fixture.specifications.wattage
    
    // Higher efficiency = less heat generation
    let score = Math.min(100, efficiency * 35)
    
    // Penalize high wattage fixtures
    if (wattage > 1000) score -= 20
    else if (wattage > 500) score -= 10
    
    return Math.max(50, score)
  }

  private generateReasoning(fixture: any, score: CompatibilityScore, filters: SearchFilters): string {
    const reasons = []
    
    if (score.overall >= 90) {
      reasons.push('Excellent overall match for your requirements')
    } else if (score.overall >= 75) {
      reasons.push('Good match with minor considerations')
    } else {
      reasons.push('Adequate option with some limitations')
    }
    
    if (score.spectrum >= 90) {
      reasons.push('Optimal spectrum for selected crop')
    }
    
    if (score.efficiency >= 90) {
      reasons.push('High efficiency reduces operating costs')
    }
    
    return reasons.join('. ') + '.'
  }

  private async findAlternatives(fixture: any, filters: SearchFilters): Promise<any[]> {
    // Find similar fixtures from same manufacturer or similar specs
    const alternatives = this.fixtures.filter(f => 
      f.id !== fixture.id &&
      (f.manufacturer === fixture.manufacturer ||
       Math.abs(f.specifications.wattage - fixture.specifications.wattage) < 100) &&
      Math.abs(f.pricing.msrp - fixture.pricing.msrp) < fixture.pricing.msrp * 0.3
    ).slice(0, 3)
    
    return alternatives
  }

  private calculateCoverage(fixture: any, filters: SearchFilters): any {
    const ppfd = fixture.specifications.ppfd
    const area = filters.coverageArea || 100
    const mountingHeight = filters.mountingHeight || 18
    
    // Adjust PPFD based on mounting height and coverage area
    const adjustedPPFD = ppfd * Math.pow(18 / mountingHeight, 2) * (100 / area)
    const dli = (adjustedPPFD * 12 * 3600) / 1000000 // 12 hour photoperiod
    
    return {
      area: area,
      ppfd: Math.round(adjustedPPFD),
      dli: Math.round(dli * 10) / 10
    }
  }

  private calculateCostAnalysis(fixture: any, filters: SearchFilters): any {
    const initialCost = fixture.pricing.msrp
    const wattage = fixture.specifications.wattage
    const hoursPerDay = 12 // Typical photoperiod
    const electricityRate = 0.12 // $/kWh
    const lifespan = fixture.specifications.lifespan || 50000
    
    const dailyEnergyCost = (wattage / 1000) * hoursPerDay * electricityRate
    const operatingCostPerYear = dailyEnergyCost * 365
    const lifespanYears = lifespan / (hoursPerDay * 365)
    const totalOperatingCost = operatingCostPerYear * lifespanYears
    const totalCostOfOwnership = initialCost + totalOperatingCost
    
    return {
      initialCost,
      operatingCostPerYear: Math.round(operatingCostPerYear),
      totalCostOfOwnership: Math.round(totalCostOfOwnership),
      paybackPeriod: lifespanYears
    }
  }

  async getRecommendationsForCrop(
    cropName: string, 
    growthStage: string = 'all',
    additionalFilters: Partial<SearchFilters> = {}
  ): Promise<FixtureRecommendation[]> {
    const filters: SearchFilters = {
      cropType: cropName,
      growthStage: growthStage === 'all' ? undefined : growthStage as any,
      sortBy: 'relevance',
      limit: 10,
      ...additionalFilters
    }
    
    return this.searchFixtures(filters)
  }

  getAvailableCrops(): string[] {
    return Array.from(this.cropRequirements.keys())
  }

  getManufacturers(): string[] {
    return [...new Set(this.fixtures.map(f => f.manufacturer))].sort()
  }

  getSpectrumTypes(): string[] {
    return ['full-spectrum', 'red-blue', 'white-supplemented', 'custom']
  }

  getStats() {
    return {
      totalFixtures: this.fixtures.length,
      manufacturers: this.getManufacturers().length,
      crops: this.cropRequirements.size,
      avgEfficacy: this.fixtures.reduce((sum, f) => sum + f.specifications.efficacy, 0) / this.fixtures.length,
      priceRange: [
        Math.min(...this.fixtures.map(f => f.pricing.msrp)),
        Math.max(...this.fixtures.map(f => f.pricing.msrp))
      ]
    }
  }
}

export const fixtureSearchEngine = new FixtureSearchEngine()

// Auto-initialize
if (typeof window === 'undefined') {
  fixtureSearchEngine.initialize().catch(console.error)
}

export default fixtureSearchEngine