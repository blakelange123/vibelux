/**
 * Cultivation Database Service
 * Provides detailed growing conditions and lighting parameters for identified plants
 * This would typically connect to a commercial plant database API or internal database
 */

import { LightingRequirements, GrowthParameters } from './plantnet-api'

export interface CultivationData {
  scientificName: string
  commonNames: string[]
  category: 'leafy-greens' | 'herbs' | 'fruiting' | 'flowers' | 'cannabis' | 'ornamental'
  lighting: LightingRequirements
  growth: GrowthParameters
  notes: string[]
  sources: string[]
}

// Sample cultivation database
// In production, this would be fetched from a proper database or API service
const cultivationDatabase: { [key: string]: CultivationData } = {
  'Lactuca sativa': {
    scientificName: 'Lactuca sativa',
    commonNames: ['Lettuce', 'Garden Lettuce'],
    category: 'leafy-greens',
    lighting: {
      minPPFD: 150,
      maxPPFD: 400,
      optimalPPFD: 250,
      photoperiod: 16,
      dli: 14.4,
      spectrum: {
        blue: 20,
        green: 10,
        red: 65,
        farRed: 5,
        uv: 0
      }
    },
    growth: {
      temperature: {
        min: 7,
        max: 24,
        optimal: 18
      },
      humidity: {
        min: 50,
        max: 70,
        optimal: 60
      },
      co2: 1000,
      growthStages: ['germination', 'seedling', 'vegetative', 'harvest']
    },
    notes: [
      'Tip burn can occur above 300 PPFD without proper calcium management',
      'Red:Blue ratio of 3:1 promotes compact growth',
      'Increase far-red for stem elongation in romaine varieties'
    ],
    sources: ['Cornell CEA', 'Philips Horticulture', 'Internal trials']
  },
  
  'Solanum lycopersicum': {
    scientificName: 'Solanum lycopersicum',
    commonNames: ['Tomato', 'Garden Tomato'],
    category: 'fruiting',
    lighting: {
      minPPFD: 300,
      maxPPFD: 600,
      optimalPPFD: 400,
      photoperiod: 14,
      dli: 20.2,
      spectrum: {
        blue: 15,
        green: 10,
        red: 70,
        farRed: 5,
        uv: 0
      }
    },
    growth: {
      temperature: {
        min: 18,
        max: 27,
        optimal: 24
      },
      humidity: {
        min: 60,
        max: 80,
        optimal: 70
      },
      co2: 1200,
      growthStages: ['germination', 'seedling', 'vegetative', 'flowering', 'fruiting']
    },
    notes: [
      'Requires higher PPFD during fruiting stage (500-600)',
      'UV-A can improve fruit flavor and color',
      'DLI of 25-30 optimal for greenhouse production'
    ],
    sources: ['Wageningen University', 'Fluence Bioengineering']
  },
  
  'Cannabis sativa': {
    scientificName: 'Cannabis sativa',
    commonNames: ['Cannabis', 'Hemp'],
    category: 'cannabis',
    lighting: {
      minPPFD: 400,
      maxPPFD: 1200,
      optimalPPFD: 800,
      photoperiod: 18, // vegetative
      dli: 51.8,
      spectrum: {
        blue: 18,
        green: 12,
        red: 65,
        farRed: 5,
        uv: 0
      }
    },
    growth: {
      temperature: {
        min: 20,
        max: 30,
        optimal: 25
      },
      humidity: {
        min: 40,
        max: 70,
        optimal: 55
      },
      co2: 1500,
      growthStages: ['clone', 'vegetative', 'flowering']
    },
    notes: [
      'Flowering photoperiod: 12 hours',
      'PPFD can exceed 1000 with CO2 supplementation',
      'UV-B in final weeks can increase cannabinoid production',
      'Far-red during flowering can increase yield'
    ],
    sources: ['Fluence Bioengineering', 'Utah State University']
  },
  
  'Ocimum basilicum': {
    scientificName: 'Ocimum basilicum',
    commonNames: ['Basil', 'Sweet Basil'],
    category: 'herbs',
    lighting: {
      minPPFD: 200,
      maxPPFD: 500,
      optimalPPFD: 300,
      photoperiod: 16,
      dli: 17.3,
      spectrum: {
        blue: 22,
        green: 8,
        red: 65,
        farRed: 5,
        uv: 0
      }
    },
    growth: {
      temperature: {
        min: 18,
        max: 27,
        optimal: 24
      },
      humidity: {
        min: 40,
        max: 60,
        optimal: 50
      },
      co2: 1000,
      growthStages: ['germination', 'seedling', 'vegetative', 'harvest']
    },
    notes: [
      'Higher blue light increases essential oil content',
      'Avoid excessive PPFD to prevent photobleaching',
      'Continuous harvest possible with proper pruning'
    ],
    sources: ['Purdue University', 'LED Horticulture Consortium']
  }
}

export class CultivationDatabaseService {
  /**
   * Look up cultivation data by scientific name
   */
  async lookup(scientificName: string): Promise<CultivationData | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Try exact match first
    if (cultivationDatabase[scientificName]) {
      return cultivationDatabase[scientificName]
    }
    
    // Try genus-level match as fallback
    const genus = scientificName.split(' ')[0]
    const genusMatch = Object.keys(cultivationDatabase).find(
      key => key.startsWith(genus + ' ')
    )
    
    if (genusMatch) {
      // Return genus match with a note
      const data = { ...cultivationDatabase[genusMatch] }
      data.notes.unshift(`Note: Data based on ${genusMatch}, may vary for ${scientificName}`)
      return data
    }
    
    return null
  }
  
  /**
   * Search cultivation database by common name
   */
  async searchByCommonName(commonName: string): Promise<CultivationData[]> {
    const results: CultivationData[] = []
    const searchTerm = commonName.toLowerCase()
    
    for (const data of Object.values(cultivationDatabase)) {
      if (data.commonNames.some(name => name.toLowerCase().includes(searchTerm))) {
        results.push(data)
      }
    }
    
    return results
  }
  
  /**
   * Get all plants in a category
   */
  async getByCategory(category: CultivationData['category']): Promise<CultivationData[]> {
    return Object.values(cultivationDatabase).filter(
      data => data.category === category
    )
  }
  
  /**
   * Calculate lighting cost estimate
   */
  calculateLightingCost(
    cultivationData: CultivationData,
    area: number, // m²
    electricityRate: number, // $/kWh
    fixtureEfficacy: number // μmol/J
  ): {
    dailyCost: number
    monthlyCost: number
    annualCost: number
    dailyEnergy: number // kWh
  } {
    const { optimalPPFD, photoperiod } = cultivationData.lighting
    
    // Calculate power needed (W)
    const powerNeeded = (optimalPPFD * area) / fixtureEfficacy
    
    // Calculate daily energy (kWh)
    const dailyEnergy = (powerNeeded * photoperiod) / 1000
    
    // Calculate costs
    const dailyCost = dailyEnergy * electricityRate
    const monthlyCost = dailyCost * 30
    const annualCost = dailyCost * 365
    
    return {
      dailyCost,
      monthlyCost,
      annualCost,
      dailyEnergy
    }
  }
  
  /**
   * Generate stage-specific lighting schedule
   */
  generateLightingSchedule(
    cultivationData: CultivationData
  ): Array<{
    stage: string
    duration: string
    ppfd: number
    photoperiod: number
    spectrum: typeof cultivationData.lighting.spectrum
  }> {
    const { growthStages } = cultivationData.growth
    const { optimalPPFD, spectrum } = cultivationData.lighting
    
    // Generate stage-specific recommendations
    const schedule = growthStages.map(stage => {
      let stagePPFD = optimalPPFD
      let stagePhotoperiod = cultivationData.lighting.photoperiod
      const stageSpectrum = { ...spectrum }
      let duration = '14 days' // default
      
      switch (stage) {
        case 'germination':
          stagePPFD = Math.round(optimalPPFD * 0.3)
          duration = '5-7 days'
          break
        case 'seedling':
          stagePPFD = Math.round(optimalPPFD * 0.5)
          duration = '14 days'
          stageSpectrum.blue += 5
          stageSpectrum.red -= 5
          break
        case 'vegetative':
          stagePPFD = Math.round(optimalPPFD * 0.8)
          duration = '21-28 days'
          break
        case 'flowering':
          stagePhotoperiod = 12
          stageSpectrum.red += 5
          stageSpectrum.blue -= 5
          duration = '45-60 days'
          break
        case 'fruiting':
          stagePPFD = optimalPPFD
          stageSpectrum.farRed += 2
          duration = '30-45 days'
          break
      }
      
      return {
        stage,
        duration,
        ppfd: stagePPFD,
        photoperiod: stagePhotoperiod,
        spectrum: stageSpectrum
      }
    })
    
    return schedule
  }
}

// Export singleton instance
export const cultivationDB = new CultivationDatabaseService()