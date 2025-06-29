import { NextRequest } from 'next/server'
import { validateAPIKey, generateAPIResponse, generateErrorResponse, trackAPIUsage } from '@/middleware/api-auth'
import { predictYield } from '@/lib/ml-yield-predictor'
import { enhancedYieldPredictor } from '@/lib/ml-yield-predictor-enhanced'

export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const apiContext = await validateAPIKey(req)
    if (!apiContext) {
      return generateErrorResponse('Invalid or missing API key', 401)
    }
    
    // Track usage
    await trackAPIUsage(apiContext.apiKey, '/api/v1/biology/predictions', 'GET')
    
    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const zone = searchParams.get('zone') || 'zone-1'
    const model = searchParams.get('model') || 'enhanced'
    const includeRecommendations = searchParams.get('recommendations') === 'true'
    
    // Mock current conditions (in production, fetch from sensors)
    const currentConditions = {
      ppfd: 450,
      dli: 25.9,
      temperature: 24.2,
      humidity: 65,
      co2: 1200,
      vpd: 0.95,
      spectrum: {
        red: 65,
        blue: 25,
        green: 5,
        farRed: 5,
        uv: 0,
        white: 0
      },
      waterAvailability: 0.95,
      substrateMoisture: 65,
      ec: 1.8,
      ph: 6.0,
      nutrients: {
        nitrogen: 150,
        phosphorus: 50,
        potassium: 200,
        calcium: 150,
        magnesium: 50,
        sulfur: 60,
        iron: 3.0,
        manganese: 0.5,
        zinc: 0.3,
        copper: 0.1,
        boron: 0.5,
        molybdenum: 0.05,
        chloride: 50
      },
      rootZoneTemp: 22.5,
      oxygenLevel: 8.2,
      airFlow: 0.3,
      growthStage: 'vegetative' as const,
      plantAge: 21,
      photoperiod: 16,
      leafAreaIndex: 3.5
    }
    
    let predictions: any = {}
    
    if (model === 'simple' || model === 'both') {
      const simplePrediction = predictYield({
        crop: 'lettuce',
        ppfd: currentConditions.ppfd,
        dli: currentConditions.dli,
        temperature: currentConditions.temperature,
        co2: currentConditions.co2,
        vpd: currentConditions.vpd,
        spectrum: currentConditions.spectrum
      })
      
      predictions.simple = {
        model: 'simple',
        yield: {
          value: simplePrediction.predicted,
          unit: 'g/m²/day',
          confidence: simplePrediction.confidence
        },
        factors: (simplePrediction as any).factors
      }
    }
    
    if (model === 'enhanced' || model === 'both') {
      const enhancedPrediction = enhancedYieldPredictor.predictYieldEnhanced({
        ...currentConditions,
        relativeHumidity: currentConditions.humidity
      })
      
      predictions.enhanced = {
        model: 'enhanced',
        yield: {
          value: enhancedPrediction.predictedYield,
          unit: 'kg/m²/cycle',
          dailyRate: enhancedPrediction.predictedYield / 35, // 35 day cycle
          confidence: enhancedPrediction.confidence
        },
        physiological: {
          photosynthesisRate: enhancedPrediction.photosynthesisRate,
          transpirationRate: enhancedPrediction.transpirationRate,
          waterUseEfficiency: enhancedPrediction.waterUseEfficiency,
          nutrientUptakeRate: enhancedPrediction.nutrientUptakeRate
        },
        stressFactors: enhancedPrediction.stressFactors,
        limitingFactors: enhancedPrediction.limitingFactors
      }
    }
    
    // Add recommendations if requested
    if (includeRecommendations) {
      predictions.recommendations = generateRecommendations(currentConditions, predictions)
    }
    
    // Add growth tracking
    predictions.growthTracking = {
      currentStage: currentConditions.growthStage,
      daysInStage: currentConditions.plantAge,
      projectedHarvestDate: new Date(Date.now() + 14 * 86400000).toISOString(), // 14 days
      growthRate: 'optimal',
      healthScore: 95
    }
    
    return generateAPIResponse(predictions, {
      version: '1.0',
      zone,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
      return generateErrorResponse('Rate limit exceeded', 429)
    }
    return generateErrorResponse('Internal server error', 500)
  }
}

function generateRecommendations(conditions: any, predictions: any) {
  const recommendations: any[] = []
  
  // Check stress factors from enhanced model
  if (predictions.enhanced?.stressFactors) {
    Object.entries(predictions.enhanced.stressFactors).forEach(([factor, value]) => {
      if (typeof value === 'number' && value < 0.9) {
        recommendations.push({
          type: factor,
          severity: value < 0.7 ? 'high' : 'medium',
          action: getRecommendationForFactor(factor, conditions),
          impact: `Could improve yield by ${((1 - value) * 100).toFixed(0)}%`
        })
      }
    })
  }
  
  // Sort by severity
  recommendations.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 }
    return severityOrder[a.severity as keyof typeof severityOrder] - 
           severityOrder[b.severity as keyof typeof severityOrder]
  })
  
  return recommendations.slice(0, 5) // Top 5 recommendations
}

function getRecommendationForFactor(factor: string, conditions: any): string {
  const recommendations: { [key: string]: string } = {
    temperature: conditions.temperature > 25 ? 
      'Lower temperature to 22-24°C for optimal growth' : 
      'Increase temperature to 22-24°C range',
    light: conditions.dli < 20 ? 
      'Increase DLI to 20-25 mol/m²/day' : 
      'Current light levels are adequate',
    water: 'Check irrigation schedule and substrate moisture',
    nutrients: `Adjust EC to 1.5-2.0 mS/cm (current: ${conditions.ec})`,
    co2: conditions.co2 < 1000 ? 
      'Increase CO2 to 1000-1500 ppm' : 
      'CO2 levels are optimal'
  }
  
  return recommendations[factor] || 'Monitor and adjust as needed'
}