// AI-powered spectrum recommendations based on crop science research

export interface SpectrumRecommendation {
  blue: number      // 400-500nm percentage
  green: number     // 500-600nm percentage
  red: number       // 600-700nm percentage
  farRed: number    // 700-800nm percentage
  rationale: string
  efficiency: number // Expected efficiency score 0-100
  references: string[]
}

export interface CropSpectrumProfile {
  crop: string
  stage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting'
  dli: number
  ppfd: number
  photoperiod: number
  spectrum: SpectrumRecommendation
}

// Research-based spectrum recommendations
const SPECTRUM_DATABASE: CropSpectrumProfile[] = [
  // Lettuce profiles
  {
    crop: 'lettuce',
    stage: 'seedling',
    dli: 12,
    ppfd: 200,
    photoperiod: 16,
    spectrum: {
      blue: 25,
      green: 10,
      red: 60,
      farRed: 5,
      rationale: 'Higher blue promotes compact growth and root development in seedlings',
      efficiency: 85,
      references: ['Snowden et al. 2016', 'Cope & Bugbee 2013']
    }
  },
  {
    crop: 'lettuce',
    stage: 'vegetative',
    dli: 17,
    ppfd: 250,
    photoperiod: 18,
    spectrum: {
      blue: 15,
      green: 10,
      red: 70,
      farRed: 5,
      rationale: 'Reduced blue and increased red maximizes leaf expansion and biomass',
      efficiency: 92,
      references: ['Son & Oh 2013', 'Pennisi et al. 2019']
    }
  },
  
  // Tomato profiles
  {
    crop: 'tomato',
    stage: 'seedling',
    dli: 15,
    ppfd: 300,
    photoperiod: 16,
    spectrum: {
      blue: 20,
      green: 10,
      red: 65,
      farRed: 5,
      rationale: 'Balanced blue:red prevents excessive stretching while promoting healthy development',
      efficiency: 88,
      references: ['Hernández & Kubota 2016', 'Liu et al. 2018']
    }
  },
  {
    crop: 'tomato',
    stage: 'vegetative',
    dli: 20,
    ppfd: 400,
    photoperiod: 16,
    spectrum: {
      blue: 15,
      green: 10,
      red: 68,
      farRed: 7,
      rationale: 'Optimized for stem strength and leaf development before flowering',
      efficiency: 90,
      references: ['Kaiser et al. 2019', 'Paponov et al. 2020']
    }
  },
  {
    crop: 'tomato',
    stage: 'flowering',
    dli: 22,
    ppfd: 500,
    photoperiod: 14,
    spectrum: {
      blue: 12,
      green: 8,
      red: 70,
      farRed: 10,
      rationale: 'Increased far-red triggers flowering, reduced photoperiod enhances fruit set',
      efficiency: 94,
      references: ['Demotes-Mainard et al. 2016', 'Ji et al. 2020']
    }
  },
  {
    crop: 'tomato',
    stage: 'fruiting',
    dli: 25,
    ppfd: 600,
    photoperiod: 12,
    spectrum: {
      blue: 10,
      green: 5,
      red: 75,
      farRed: 10,
      rationale: 'Maximum red for fruit development and ripening, far-red for size',
      efficiency: 95,
      references: ['Dzakovich et al. 2015', 'Fanwoua et al. 2019']
    }
  },
  
  // Cannabis profiles
  {
    crop: 'cannabis',
    stage: 'seedling',
    dli: 18,
    ppfd: 300,
    photoperiod: 18,
    spectrum: {
      blue: 25,
      green: 10,
      red: 60,
      farRed: 5,
      rationale: 'Higher blue spectrum encourages shorter internodes and stronger stems',
      efficiency: 86,
      references: ['Chandra et al. 2017', 'Eichhorn Bilodeau et al. 2019']
    }
  },
  {
    crop: 'cannabis',
    stage: 'vegetative',
    dli: 35,
    ppfd: 600,
    photoperiod: 18,
    spectrum: {
      blue: 20,
      green: 10,
      red: 65,
      farRed: 5,
      rationale: 'Balanced spectrum for optimal vegetative growth and cannabinoid precursors',
      efficiency: 91,
      references: ['Magagnini et al. 2018', 'Westmoreland et al. 2021']
    }
  },
  {
    crop: 'cannabis',
    stage: 'flowering',
    dli: 40,
    ppfd: 800,
    photoperiod: 12,
    spectrum: {
      blue: 15,
      green: 5,
      red: 70,
      farRed: 10,
      rationale: 'Enhanced red and far-red promotes flower development and trichome production',
      efficiency: 96,
      references: ['Namdar et al. 2019', 'Rodriguez-Morrison et al. 2021']
    }
  },
  
  // Herbs (Basil) profiles
  {
    crop: 'herbs',
    stage: 'seedling',
    dli: 10,
    ppfd: 150,
    photoperiod: 16,
    spectrum: {
      blue: 30,
      green: 10,
      red: 55,
      farRed: 5,
      rationale: 'High blue content enhances essential oil production in young herbs',
      efficiency: 84,
      references: ['Pennisi et al. 2020', 'Hammock et al. 2020']
    }
  },
  {
    crop: 'herbs',
    stage: 'vegetative',
    dli: 15,
    ppfd: 250,
    photoperiod: 16,
    spectrum: {
      blue: 25,
      green: 10,
      red: 60,
      farRed: 5,
      rationale: 'Maintains high blue for continued essential oil and flavor compound synthesis',
      efficiency: 89,
      references: ['Dou et al. 2019', 'Larsen et al. 2020']
    }
  },
  
  // Strawberry profiles
  {
    crop: 'strawberry',
    stage: 'vegetative',
    dli: 17,
    ppfd: 300,
    photoperiod: 16,
    spectrum: {
      blue: 20,
      green: 10,
      red: 65,
      farRed: 5,
      rationale: 'Promotes runner development and crown formation',
      efficiency: 87,
      references: ['Yoshida et al. 2016', 'Nadalini et al. 2017']
    }
  },
  {
    crop: 'strawberry',
    stage: 'flowering',
    dli: 20,
    ppfd: 350,
    photoperiod: 14,
    spectrum: {
      blue: 15,
      green: 10,
      red: 65,
      farRed: 10,
      rationale: 'Far-red addition improves flowering and fruit yield',
      efficiency: 92,
      references: ['Zahedi et al. 2019', 'Magar et al. 2022']
    }
  },
  
  // Cucumber profiles
  {
    crop: 'cucumber',
    stage: 'seedling',
    dli: 12,
    ppfd: 200,
    photoperiod: 16,
    spectrum: {
      blue: 20,
      green: 10,
      red: 65,
      farRed: 5,
      rationale: 'Moderate blue prevents hypocotyl elongation while supporting growth',
      efficiency: 86,
      references: ['Hernández & Kubota 2014', 'Song et al. 2020']
    }
  },
  {
    crop: 'cucumber',
    stage: 'flowering',
    dli: 22,
    ppfd: 400,
    photoperiod: 14,
    spectrum: {
      blue: 12,
      green: 8,
      red: 70,
      farRed: 10,
      rationale: 'Optimized for fruit development and continuous flowering',
      efficiency: 93,
      references: ['Savvides et al. 2016', 'Ji et al. 2019']
    }
  }
]

// Environmental factors that affect spectrum recommendations
interface EnvironmentalFactors {
  temperature: number
  humidity: number
  co2: number
  growthDensity: 'low' | 'medium' | 'high'
}

// AI recommendation engine
export class SpectrumAI {
  static getRecommendation(
    crop: string,
    stage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting',
    environmental?: EnvironmentalFactors
  ): SpectrumRecommendation {
    // Find base recommendation
    let profile = SPECTRUM_DATABASE.find(
      p => p.crop === crop && p.stage === stage
    )
    
    // Fallback to similar crops if exact match not found
    if (!profile) {
      if (crop === 'microgreens') {
        profile = SPECTRUM_DATABASE.find(p => p.crop === 'lettuce' && p.stage === 'seedling')
      } else if (crop === 'peppers') {
        profile = SPECTRUM_DATABASE.find(p => p.crop === 'tomato' && p.stage === stage)
      } else {
        // Default profile
        profile = SPECTRUM_DATABASE[0]
      }
    }
    
    if (!profile) {
      return {
        blue: 20,
        green: 10,
        red: 65,
        farRed: 5,
        rationale: 'General purpose spectrum suitable for most crops',
        efficiency: 80,
        references: ['NASA Technical Reports']
      }
    }
    
    // Adjust based on environmental factors
    const recommendation = { ...profile.spectrum }
    
    if (environmental) {
      // High temperature adjustment
      if (environmental.temperature > 28) {
        recommendation.blue += 5
        recommendation.red -= 5
        recommendation.rationale += '. Increased blue to mitigate heat stress.'
        recommendation.efficiency -= 5
      }
      
      // Low humidity adjustment for transpiration
      if (environmental.humidity < 50) {
        recommendation.green += 2
        recommendation.red -= 2
        recommendation.rationale += '. Added green light for better canopy penetration in dry conditions.'
      }
      
      // High CO2 adjustment
      if (environmental.co2 > 1000) {
        recommendation.red += 5
        recommendation.blue -= 3
        recommendation.green -= 2
        recommendation.rationale += '. Optimized for high CO2 photosynthesis.'
        recommendation.efficiency += 5
      }
      
      // High density adjustment
      if (environmental.growthDensity === 'high') {
        recommendation.farRed += 3
        recommendation.blue -= 3
        recommendation.rationale += '. Increased far-red for shade avoidance response management.'
      }
    }
    
    // Normalize percentages
    const total = recommendation.blue + recommendation.green + recommendation.red + recommendation.farRed
    if (total !== 100) {
      const factor = 100 / total
      recommendation.blue = Math.round(recommendation.blue * factor)
      recommendation.green = Math.round(recommendation.green * factor)
      recommendation.red = Math.round(recommendation.red * factor)
      recommendation.farRed = Math.round(recommendation.farRed * factor)
    }
    
    return recommendation
  }
  
  static getDLIRecommendation(crop: string, stage: string): number {
    const profile = SPECTRUM_DATABASE.find(
      p => p.crop === crop && p.stage === stage
    )
    return profile?.dli || 20
  }
  
  static getPPFDRecommendation(crop: string, stage: string): number {
    const profile = SPECTRUM_DATABASE.find(
      p => p.crop === crop && p.stage === stage
    )
    return profile?.ppfd || 400
  }
  
  static getPhotoperiodRecommendation(crop: string, stage: string): number {
    const profile = SPECTRUM_DATABASE.find(
      p => p.crop === crop && p.stage === stage
    )
    return profile?.photoperiod || 16
  }
  
  // Analyze current spectrum and provide improvement suggestions
  static analyzeSpectrum(
    currentSpectrum: { blue: number; green: number; red: number; farRed: number },
    crop: string,
    stage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting'
  ): {
    score: number
    suggestions: string[]
    potentialImprovement: number
  } {
    const recommended = this.getRecommendation(crop, stage)
    
    // Calculate deviation score
    const blueDeviation = Math.abs(currentSpectrum.blue - recommended.blue)
    const greenDeviation = Math.abs(currentSpectrum.green - recommended.green)
    const redDeviation = Math.abs(currentSpectrum.red - recommended.red)
    const farRedDeviation = Math.abs(currentSpectrum.farRed - recommended.farRed)
    
    const totalDeviation = blueDeviation + greenDeviation + redDeviation + farRedDeviation
    const score = Math.max(0, 100 - totalDeviation * 2)
    
    const suggestions: string[] = []
    
    if (blueDeviation > 5) {
      if (currentSpectrum.blue > recommended.blue) {
        suggestions.push(`Reduce blue spectrum by ${blueDeviation}% to prevent stunted growth`)
      } else {
        suggestions.push(`Increase blue spectrum by ${blueDeviation}% for better morphology`)
      }
    }
    
    if (redDeviation > 5) {
      if (currentSpectrum.red > recommended.red) {
        suggestions.push(`Reduce red spectrum by ${redDeviation}% to improve energy efficiency`)
      } else {
        suggestions.push(`Increase red spectrum by ${redDeviation}% for enhanced photosynthesis`)
      }
    }
    
    if (farRedDeviation > 3 && stage === 'flowering') {
      if (currentSpectrum.farRed < recommended.farRed) {
        suggestions.push(`Add ${farRedDeviation}% far-red to trigger flowering response`)
      }
    }
    
    const potentialImprovement = recommended.efficiency - (recommended.efficiency * score / 100)
    
    return {
      score,
      suggestions,
      potentialImprovement
    }
  }
}