interface EnvironmentalData {
  temperature: number // °C
  humidity: number // %
  leafWetness: number // hours
  co2: number // ppm
  airflow: number // m/s
  timestamp: Date
}

interface CropData {
  cropType: string
  variety: string
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting'
  plantAge: number // days
  density: number // plants per m²
}

interface HistoricalDiseaseData {
  diseaseType: string
  severity: number // 0-100
  environmentalConditions: EnvironmentalData
  cropInfo: CropData
  treatment: string
  outcome: 'resolved' | 'spread' | 'contained'
}

interface DiseasePrediction {
  diseaseType: string
  probability: number // 0-100
  risk: 'low' | 'medium' | 'high' | 'critical'
  confidence: number // 0-100
  timeframe: number // days until potential outbreak
  preventiveMeasures: string[]
  monitoringPoints: string[]
}

interface WeatherForecast {
  date: Date
  temperature: { min: number; max: number }
  humidity: number
  precipitation: number
  windSpeed: number
}

export class DiseasePredictionEngine {
  private diseaseModels: Map<string, any> = new Map()
  private historicalData: HistoricalDiseaseData[] = []
  private cropSusceptibility: Map<string, Record<string, number>> = new Map()

  constructor() {
    this.initializeDiseaseModels()
    this.initializeCropSusceptibility()
  }

  private initializeDiseaseModels() {
    // Powdery Mildew Model
    this.diseaseModels.set('powdery_mildew', {
      name: 'Powdery Mildew',
      optimalConditions: {
        temperature: { min: 20, max: 25 },
        humidity: { min: 40, max: 70 },
        leafWetness: { max: 4 },
        airflow: { max: 0.5 }
      },
      incubationPeriod: 7, // days
      spreadRate: 0.8,
      seasonality: [0.3, 0.4, 0.7, 0.9, 0.9, 0.7, 0.5, 0.4, 0.6, 0.8, 0.6, 0.4], // monthly factors
      severity: {
        low: { yield_loss: 5, treatment_cost: 50 },
        medium: { yield_loss: 15, treatment_cost: 150 },
        high: { yield_loss: 30, treatment_cost: 300 },
        critical: { yield_loss: 50, treatment_cost: 500 }
      }
    })

    // Botrytis (Gray Mold) Model
    this.diseaseModels.set('botrytis', {
      name: 'Botrytis (Gray Mold)',
      optimalConditions: {
        temperature: { min: 15, max: 23 },
        humidity: { min: 85, max: 100 },
        leafWetness: { min: 6, max: 24 },
        airflow: { max: 0.3 }
      },
      incubationPeriod: 3,
      spreadRate: 1.2,
      seasonality: [0.8, 0.9, 0.7, 0.5, 0.3, 0.2, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9],
      severity: {
        low: { yield_loss: 10, treatment_cost: 75 },
        medium: { yield_loss: 25, treatment_cost: 200 },
        high: { yield_loss: 45, treatment_cost: 400 },
        critical: { yield_loss: 70, treatment_cost: 800 }
      }
    })

    // Downy Mildew Model
    this.diseaseModels.set('downy_mildew', {
      name: 'Downy Mildew',
      optimalConditions: {
        temperature: { min: 10, max: 20 },
        humidity: { min: 80, max: 100 },
        leafWetness: { min: 4, max: 12 },
        airflow: { max: 0.4 }
      },
      incubationPeriod: 5,
      spreadRate: 0.9,
      seasonality: [0.7, 0.8, 0.9, 0.7, 0.4, 0.2, 0.1, 0.2, 0.4, 0.6, 0.7, 0.8],
      severity: {
        low: { yield_loss: 8, treatment_cost: 60 },
        medium: { yield_loss: 20, treatment_cost: 180 },
        high: { yield_loss: 40, treatment_cost: 350 },
        critical: { yield_loss: 60, treatment_cost: 600 }
      }
    })

    // Root Rot Model
    this.diseaseModels.set('root_rot', {
      name: 'Root Rot',
      optimalConditions: {
        temperature: { min: 20, max: 30 },
        humidity: { min: 90, max: 100 },
        waterlogged: true,
        oxygen: { max: 15 } // % dissolved oxygen
      },
      incubationPeriod: 10,
      spreadRate: 0.6,
      seasonality: [0.4, 0.3, 0.4, 0.6, 0.8, 0.9, 0.9, 0.8, 0.6, 0.5, 0.4, 0.3],
      severity: {
        low: { yield_loss: 15, treatment_cost: 100 },
        medium: { yield_loss: 35, treatment_cost: 250 },
        high: { yield_loss: 60, treatment_cost: 500 },
        critical: { yield_loss: 90, treatment_cost: 1000 }
      }
    })

    // Aphid Infestation Model
    this.diseaseModels.set('aphids', {
      name: 'Aphid Infestation',
      optimalConditions: {
        temperature: { min: 18, max: 26 },
        humidity: { min: 60, max: 80 },
        co2: { min: 400, max: 800 },
        nitrogen: 'high' // high nitrogen levels
      },
      incubationPeriod: 2,
      spreadRate: 1.5,
      seasonality: [0.3, 0.4, 0.7, 0.9, 1.0, 0.8, 0.6, 0.5, 0.7, 0.8, 0.5, 0.3],
      severity: {
        low: { yield_loss: 5, treatment_cost: 30 },
        medium: { yield_loss: 12, treatment_cost: 80 },
        high: { yield_loss: 25, treatment_cost: 150 },
        critical: { yield_loss: 40, treatment_cost: 300 }
      }
    })

    // Spider Mites Model
    this.diseaseModels.set('spider_mites', {
      name: 'Spider Mites',
      optimalConditions: {
        temperature: { min: 25, max: 35 },
        humidity: { min: 30, max: 60 },
        leafWetness: { max: 2 },
        drought_stress: true
      },
      incubationPeriod: 4,
      spreadRate: 1.3,
      seasonality: [0.2, 0.3, 0.5, 0.7, 0.9, 1.0, 1.0, 0.9, 0.7, 0.5, 0.3, 0.2],
      severity: {
        low: { yield_loss: 8, treatment_cost: 40 },
        medium: { yield_loss: 18, treatment_cost: 100 },
        high: { yield_loss: 35, treatment_cost: 200 },
        critical: { yield_loss: 55, treatment_cost: 400 }
      }
    })
  }

  private initializeCropSusceptibility() {
    // Cannabis susceptibility
    this.cropSusceptibility.set('cannabis', {
      powdery_mildew: 0.9,
      botrytis: 0.8,
      downy_mildew: 0.6,
      root_rot: 0.7,
      aphids: 0.8,
      spider_mites: 0.9
    })

    // Lettuce susceptibility
    this.cropSusceptibility.set('lettuce', {
      powdery_mildew: 0.6,
      botrytis: 0.7,
      downy_mildew: 0.9,
      root_rot: 0.8,
      aphids: 0.7,
      spider_mites: 0.4
    })

    // Tomato susceptibility
    this.cropSusceptibility.set('tomato', {
      powdery_mildew: 0.7,
      botrytis: 0.9,
      downy_mildew: 0.8,
      root_rot: 0.6,
      aphids: 0.6,
      spider_mites: 0.7
    })

    // Basil susceptibility
    this.cropSusceptibility.set('basil', {
      powdery_mildew: 0.8,
      botrytis: 0.5,
      downy_mildew: 0.9,
      root_rot: 0.7,
      aphids: 0.5,
      spider_mites: 0.6
    })
  }

  // Main prediction method
  async predictDiseaseRisk(
    currentConditions: EnvironmentalData,
    cropInfo: CropData,
    forecast?: WeatherForecast[],
    historicalContext?: HistoricalDiseaseData[]
  ): Promise<DiseasePrediction[]> {
    const predictions: DiseasePrediction[] = []

    for (const [diseaseKey, model] of this.diseaseModels) {
      const prediction = this.calculateDiseaseProbability(
        diseaseKey,
        model,
        currentConditions,
        cropInfo,
        forecast,
        historicalContext
      )
      
      if (prediction.probability > 10) { // Only include significant risks
        predictions.push(prediction)
      }
    }

    return predictions.sort((a, b) => b.probability - a.probability)
  }

  private calculateDiseaseProbability(
    diseaseKey: string,
    model: any,
    conditions: EnvironmentalData,
    cropInfo: CropData,
    forecast?: WeatherForecast[],
    historical?: HistoricalDiseaseData[]
  ): DiseasePrediction {
    let baseProbability = 0
    let confidence = 70 // Base confidence

    // Environmental factor (40% weight)
    const envFactor = this.calculateEnvironmentalFactor(model, conditions)
    baseProbability += envFactor * 0.4

    // Crop susceptibility factor (25% weight)
    const cropSusceptibility = this.cropSusceptibility.get(cropInfo.cropType.toLowerCase())?.[diseaseKey] || 0.5
    baseProbability += cropSusceptibility * 0.25

    // Seasonal factor (15% weight)
    const month = conditions.timestamp.getMonth()
    const seasonalFactor = model.seasonality[month]
    baseProbability += seasonalFactor * 0.15

    // Growth stage factor (10% weight)
    const stageFactor = this.getGrowthStageFactor(diseaseKey, cropInfo.growthStage)
    baseProbability += stageFactor * 0.1

    // Historical context (10% weight)
    if (historical && historical.length > 0) {
      const historicalFactor = this.calculateHistoricalFactor(diseaseKey, historical, conditions)
      baseProbability += historicalFactor * 0.1
      confidence += 20 // Increase confidence with historical data
    }

    // Weather forecast factor (if available)
    if (forecast && forecast.length > 0) {
      const forecastFactor = this.calculateForecastFactor(model, forecast)
      baseProbability = baseProbability * (1 + forecastFactor * 0.2)
      confidence += 10 // Increase confidence with forecast data
    }

    // Normalize probability to 0-100
    const probability = Math.min(100, Math.max(0, baseProbability * 100))
    
    // Calculate risk level
    const risk = this.calculateRiskLevel(probability)
    
    // Calculate timeframe
    const timeframe = this.calculateTimeframe(model, probability, conditions)
    
    // Generate preventive measures
    const preventiveMeasures = this.generatePreventiveMeasures(diseaseKey, model, risk)
    
    // Generate monitoring points
    const monitoringPoints = this.generateMonitoringPoints(diseaseKey, model)

    return {
      diseaseType: model.name,
      probability: Math.round(probability),
      risk,
      confidence: Math.min(100, Math.round(confidence)),
      timeframe,
      preventiveMeasures,
      monitoringPoints
    }
  }

  private calculateEnvironmentalFactor(model: any, conditions: EnvironmentalData): number {
    let factor = 0
    const optimal = model.optimalConditions

    // Temperature factor
    if (optimal.temperature) {
      if (conditions.temperature >= optimal.temperature.min && 
          conditions.temperature <= optimal.temperature.max) {
        factor += 0.3 // High contribution if in optimal range
      } else {
        const deviation = Math.min(
          Math.abs(conditions.temperature - optimal.temperature.min),
          Math.abs(conditions.temperature - optimal.temperature.max)
        )
        factor += Math.max(0, 0.3 - (deviation / 20) * 0.3) // Decrease with deviation
      }
    }

    // Humidity factor
    if (optimal.humidity) {
      if (conditions.humidity >= optimal.humidity.min && 
          conditions.humidity <= optimal.humidity.max) {
        factor += 0.3
      } else {
        const deviation = Math.min(
          Math.abs(conditions.humidity - optimal.humidity.min),
          Math.abs(conditions.humidity - optimal.humidity.max)
        )
        factor += Math.max(0, 0.3 - (deviation / 30) * 0.3)
      }
    }

    // Leaf wetness factor
    if (optimal.leafWetness) {
      if (optimal.leafWetness.min && conditions.leafWetness >= optimal.leafWetness.min) {
        factor += 0.2
      } else if (optimal.leafWetness.max && conditions.leafWetness <= optimal.leafWetness.max) {
        factor += 0.2
      }
    }

    // Airflow factor
    if (optimal.airflow && optimal.airflow.max) {
      if (conditions.airflow <= optimal.airflow.max) {
        factor += 0.2
      }
    }

    return Math.min(1, factor)
  }

  private getGrowthStageFactor(diseaseKey: string, growthStage: string): number {
    // Different diseases are more likely at different growth stages
    const stageFactors: Record<string, Record<string, number>> = {
      powdery_mildew: {
        seedling: 0.3,
        vegetative: 0.7,
        flowering: 0.9,
        fruiting: 0.8
      },
      botrytis: {
        seedling: 0.4,
        vegetative: 0.6,
        flowering: 1.0,
        fruiting: 0.9
      },
      downy_mildew: {
        seedling: 0.8,
        vegetative: 0.9,
        flowering: 0.6,
        fruiting: 0.4
      },
      root_rot: {
        seedling: 1.0,
        vegetative: 0.7,
        flowering: 0.5,
        fruiting: 0.4
      },
      aphids: {
        seedling: 0.6,
        vegetative: 1.0,
        flowering: 0.8,
        fruiting: 0.7
      },
      spider_mites: {
        seedling: 0.4,
        vegetative: 0.8,
        flowering: 1.0,
        fruiting: 0.9
      }
    }

    return stageFactors[diseaseKey]?.[growthStage] || 0.5
  }

  private calculateHistoricalFactor(
    diseaseKey: string, 
    historical: HistoricalDiseaseData[], 
    currentConditions: EnvironmentalData
  ): number {
    const relevantHistory = historical.filter(h => h.diseaseType === diseaseKey)
    
    if (relevantHistory.length === 0) return 0.5

    // Look for similar environmental conditions in history
    let similarityScore = 0
    let count = 0

    for (const record of relevantHistory) {
      const tempSimilarity = 1 - Math.abs(record.environmentalConditions.temperature - currentConditions.temperature) / 30
      const humiditySimilarity = 1 - Math.abs(record.environmentalConditions.humidity - currentConditions.humidity) / 50
      
      const overallSimilarity = (tempSimilarity + humiditySimilarity) / 2
      
      if (overallSimilarity > 0.7) { // Only consider highly similar conditions
        similarityScore += record.severity / 100
        count++
      }
    }

    return count > 0 ? similarityScore / count : 0.5
  }

  private calculateForecastFactor(model: any, forecast: WeatherForecast[]): number {
    let favorableConditions = 0
    
    for (const day of forecast.slice(0, 7)) { // Look at next 7 days
      const avgTemp = (day.temperature.min + day.temperature.max) / 2
      const optimal = model.optimalConditions
      
      let dayScore = 0
      
      // Temperature check
      if (optimal.temperature && 
          avgTemp >= optimal.temperature.min && 
          avgTemp <= optimal.temperature.max) {
        dayScore += 0.4
      }
      
      // Humidity check
      if (optimal.humidity && 
          day.humidity >= optimal.humidity.min && 
          day.humidity <= optimal.humidity.max) {
        dayScore += 0.4
      }
      
      // Precipitation (affects leaf wetness)
      if (day.precipitation > 0) {
        dayScore += 0.2
      }
      
      favorableConditions += dayScore
    }
    
    return favorableConditions / 7 // Average daily favorability
  }

  private calculateRiskLevel(probability: number): 'low' | 'medium' | 'high' | 'critical' {
    if (probability < 25) return 'low'
    if (probability < 50) return 'medium'
    if (probability < 75) return 'high'
    return 'critical'
  }

  private calculateTimeframe(model: any, probability: number, conditions: EnvironmentalData): number {
    // Base timeframe from model
    let timeframe = model.incubationPeriod
    
    // Adjust based on probability (higher probability = faster onset)
    const probabilityFactor = 1 - (probability / 100) * 0.5
    timeframe *= probabilityFactor
    
    // Adjust based on environmental favorability
    const envOptimal = this.calculateEnvironmentalFactor(model, conditions)
    const envFactor = 1 - envOptimal * 0.3
    timeframe *= envFactor
    
    return Math.max(1, Math.round(timeframe))
  }

  private generatePreventiveMeasures(diseaseKey: string, model: any, risk: string): string[] {
    const baseMeasures: Record<string, string[]> = {
      powdery_mildew: [
        'Increase air circulation and reduce humidity below 60%',
        'Apply preventive sulfur or potassium bicarbonate spray',
        'Remove affected plant material immediately',
        'Ensure proper plant spacing for airflow'
      ],
      botrytis: [
        'Reduce humidity below 85% and improve ventilation',
        'Remove dead or dying plant material promptly',
        'Apply preventive biologicals (Bacillus subtilis)',
        'Avoid overhead watering and leaf wetness'
      ],
      downy_mildew: [
        'Improve air circulation and reduce leaf wetness',
        'Apply copper-based preventive treatments',
        'Avoid overhead watering, especially in evening',
        'Monitor temperature and humidity closely'
      ],
      root_rot: [
        'Improve drainage and reduce watering frequency',
        'Increase oxygen levels in hydroponic systems',
        'Apply beneficial microorganisms to root zone',
        'Monitor pH and nutrient levels'
      ],
      aphids: [
        'Release beneficial insects (ladybugs, lacewings)',
        'Apply neem oil or insecticidal soap',
        'Remove heavily infested plant material',
        'Monitor nitrogen levels (reduce if excessive)'
      ],
      spider_mites: [
        'Increase humidity above 60%',
        'Apply predatory mites (Phytoseiulus persimilis)',
        'Use miticide rotation to prevent resistance',
        'Ensure adequate plant hydration'
      ]
    }

    const measures = baseMeasures[diseaseKey] || []
    
    // Add risk-specific measures
    if (risk === 'critical') {
      measures.unshift('IMMEDIATE ACTION REQUIRED - Implement emergency protocols')
    } else if (risk === 'high') {
      measures.unshift('Increase monitoring frequency to daily inspections')
    }
    
    return measures
  }

  private generateMonitoringPoints(diseaseKey: string, model: any): string[] {
    const baseMonitoring: Record<string, string[]> = {
      powdery_mildew: [
        'Check leaf surfaces for white powdery spots',
        'Monitor humidity levels hourly',
        'Inspect new growth areas regularly',
        'Check air circulation patterns'
      ],
      botrytis: [
        'Look for brown/gray fuzzy growth on flowers/stems',
        'Monitor humidity and air movement',
        'Check for water droplets on leaves',
        'Inspect pruning sites and wounds'
      ],
      downy_mildew: [
        'Check undersides of leaves for fuzzy growth',
        'Monitor for yellow/brown leaf spots',
        'Track temperature and humidity patterns',
        'Inspect during early morning hours'
      ],
      root_rot: [
        'Monitor root color and firmness',
        'Check water pH and dissolved oxygen',
        'Look for wilting despite adequate moisture',
        'Inspect drainage and water flow'
      ],
      aphids: [
        'Check undersides of young leaves',
        'Look for sticky honeydew deposits',
        'Monitor for curled or distorted leaves',
        'Use yellow sticky traps for early detection'
      ],
      spider_mites: [
        'Look for fine webbing on leaves',
        'Check for stippled/bronzed leaf appearance',
        'Monitor leaf undersides with magnification',
        'Track humidity and temperature levels'
      ]
    }

    return baseMonitoring[diseaseKey] || ['Regular visual inspection', 'Monitor environmental conditions']
  }

  // Utility method to add historical data for better predictions
  addHistoricalData(data: HistoricalDiseaseData[]) {
    this.historicalData.push(...data)
  }

  // Method to get disease impact assessment
  assessDiseaseImpact(diseaseKey: string, severity: string, cropInfo: CropData): {
    yieldLoss: number
    treatmentCost: number
    economicImpact: number
  } {
    const model = this.diseaseModels.get(diseaseKey)
    if (!model || !model.severity[severity]) {
      return { yieldLoss: 0, treatmentCost: 0, economicImpact: 0 }
    }

    const impact = model.severity[severity]
    const estimatedYield = cropInfo.density * 0.5 // kg per m²
    const cropValue = 850 // USD per kg (estimated)
    
    const yieldLoss = impact.yield_loss
    const treatmentCost = impact.treatment_cost
    const economicImpact = (estimatedYield * (yieldLoss / 100) * cropValue) + treatmentCost

    return {
      yieldLoss,
      treatmentCost,
      economicImpact: Math.round(economicImpact)
    }
  }
}