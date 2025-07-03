import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Calculate plant health based on environmental factors and growth patterns
function calculatePlantHealth(batch: any, latestEnv: any, daysPlanted: number): number {
  let healthScore = 100
  
  // Environmental conditions impact
  if (latestEnv) {
    // Temperature stress
    if (latestEnv.temperature < 18 || latestEnv.temperature > 30) {
      healthScore -= 15
    } else if (latestEnv.temperature < 20 || latestEnv.temperature > 28) {
      healthScore -= 8
    }
    
    // Humidity stress
    if (latestEnv.humidity < 30 || latestEnv.humidity > 70) {
      healthScore -= 12
    } else if (latestEnv.humidity < 40 || latestEnv.humidity > 65) {
      healthScore -= 6
    }
    
    // CO2 levels
    if (latestEnv.co2 < 300) {
      healthScore -= 20
    } else if (latestEnv.co2 < 400) {
      healthScore -= 10
    } else if (latestEnv.co2 > 1500) {
      healthScore -= 5
    }
    
    // VPD stress (if available)
    if (latestEnv.vpd !== undefined) {
      if (latestEnv.vpd < 0.4 || latestEnv.vpd > 1.6) {
        healthScore -= 10
      } else if (latestEnv.vpd < 0.8 || latestEnv.vpd > 1.4) {
        healthScore -= 5
      }
    }
  }
  
  // Growth stage considerations
  const expectedMaturityDays = {
    'Cannabis': 120,
    'Lettuce': 45,
    'Basil': 60,
    'Tomato': 90
  }[batch.cropType] || 90
  
  const growthProgress = daysPlanted / expectedMaturityDays
  
  // Check if growth is on track
  if (batch.estimatedYield && batch.yieldData.length > 0) {
    const latestYield = batch.yieldData[batch.yieldData.length - 1]
    const expectedWeight = batch.estimatedYield * growthProgress * 0.8 // 80% of final yield by maturity
    const actualWeight = latestYield.weight || 0
    
    if (actualWeight < expectedWeight * 0.7) {
      healthScore -= 15 // Significantly under target
    } else if (actualWeight < expectedWeight * 0.85) {
      healthScore -= 8 // Slightly under target
    }
  }
  
  // Disease or pest issues (would come from scouting records in real implementation)
  if (batch.notes?.toLowerCase().includes('pest') || batch.notes?.toLowerCase().includes('disease')) {
    healthScore -= 20
  }
  
  return Math.max(40, Math.min(100, healthScore))
}

// Calculate historical yield performance for crop type
async function calculateHistoricalYield(userId: string, cropType: string, variety?: string): Promise<number> {
  try {
    // Get completed batches for this crop type
    const historicalBatches = await prisma.productionBatch.findMany({
      where: {
        userId,
        cropType,
        ...(variety && { variety }),
        status: 'completed',
        actualYield: { not: null },
        estimatedYield: { not: null }
      },
      orderBy: { completedDate: 'desc' },
      take: 10 // Last 10 batches
    })
    
    if (historicalBatches.length === 0) {
      return 75 // Default for new crops
    }
    
    // Calculate average yield performance
    const performances = historicalBatches.map(batch => {
      const performance = (batch.actualYield! / batch.estimatedYield!) * 100
      return Math.min(150, performance) // Cap at 150% to avoid outliers
    })
    
    // Weighted average - recent batches have more weight
    let weightedSum = 0
    let weightSum = 0
    
    performances.forEach((perf, index) => {
      const weight = 1 / (index + 1) // More recent = higher weight
      weightedSum += perf * weight
      weightSum += weight
    })
    
    const avgPerformance = weightedSum / weightSum
    
    // Convert to 0-100 scale where 100% yield = 85 score
    return Math.min(100, Math.max(50, avgPerformance * 0.85))
  } catch (error) {
    console.error('Error calculating historical yield:', error)
    return 75 // Default on error
  }
}

// ML model for yield prediction - simplified version
function calculateYieldPrediction(data: any) {
  const {
    currentWeight,
    daysPlanted,
    environmentalScore,
    plantHealth,
    historicalYield,
    cropType
  } = data

  // Crop-specific growth curves
  const growthCurves = {
    'Cannabis': { maturityDays: 120, peakGrowthRate: 0.15 },
    'Lettuce': { maturityDays: 45, peakGrowthRate: 0.22 },
    'Basil': { maturityDays: 60, peakGrowthRate: 0.18 },
    'Tomato': { maturityDays: 90, peakGrowthRate: 0.12 }
  }

  const curve = growthCurves[cropType as keyof typeof growthCurves] || growthCurves['Cannabis']
  const daysRemaining = Math.max(0, curve.maturityDays - daysPlanted)
  
  // Environmental factor (0.7 - 1.3 multiplier)
  const envFactor = 0.7 + (environmentalScore / 100) * 0.6
  
  // Plant health factor (0.5 - 1.2 multiplier) 
  const healthFactor = 0.5 + (plantHealth / 100) * 0.7
  
  // Historical performance factor (0.8 - 1.2 multiplier)
  const historyFactor = 0.8 + (historicalYield / 100) * 0.4
  
  // Growth rate calculation
  const growthRate = curve.peakGrowthRate * envFactor * healthFactor * historyFactor
  
  // Predicted additional growth
  const additionalGrowth = currentWeight * growthRate * (daysRemaining / 7)
  
  const predictedYield = currentWeight + additionalGrowth
  
  // Confidence calculation
  const confidence = Math.min(95, 
    70 + 
    (environmentalScore > 85 ? 10 : 0) +
    (plantHealth > 90 ? 10 : 0) +
    (historicalYield > 80 ? 5 : 0)
  )
  
  return {
    predictedYield: Math.round(predictedYield * 10) / 10,
    daysToHarvest: daysRemaining,
    confidence: Math.round(confidence),
    factors: {
      environmentalScore,
      plantHealth,
      historicalPerformance: historicalYield
    }
  }
}

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get active crops/batches that haven't been harvested yet
    const activeBatches = await prisma.productionBatch.findMany({
      where: {
        userId,
        status: { in: ['active', 'flowering', 'ripening'] }
      },
      include: {
        yieldData: true,
        environmentalData: true
      }
    })

    // Generate predictions for each batch
    const predictions = await Promise.all(activeBatches.map(async batch => {
      const latestYield = batch.yieldData[batch.yieldData.length - 1]
      const latestEnv = batch.environmentalData[batch.environmentalData.length - 1]
      
      const currentWeight = latestYield?.weight || batch.estimatedYield * 0.3
      const daysPlanted = Math.floor(
        (new Date().getTime() - batch.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      // Calculate environmental score based on recent conditions
      const environmentalScore = latestEnv ? 
        ((latestEnv.temperature >= 20 && latestEnv.temperature <= 26 ? 100 : 70) +
         (latestEnv.humidity >= 40 && latestEnv.humidity <= 60 ? 100 : 70) +
         (latestEnv.co2 >= 400 && latestEnv.co2 <= 1000 ? 100 : 70)) / 3 : 85
      
      // Calculate plant health based on environmental conditions and growth rate
      const plantHealth = calculatePlantHealth(batch, latestEnv, daysPlanted)
      
      // Historical performance based on previous batches
      const historicalYield = await calculateHistoricalYield(userId, batch.cropType, batch.variety)
      
      const prediction = calculateYieldPrediction({
        currentWeight,
        daysPlanted,
        environmentalScore,
        plantHealth,
        historicalYield,
        cropType: batch.cropType
      })
      
      return {
        batchId: batch.id,
        zone: batch.zone || 'Unknown',
        crop: batch.cropType,
        variety: batch.variety || 'Unknown',
        currentWeight,
        ...prediction
      }
    }))

    return NextResponse.json(predictions)
  } catch (error) {
    console.error('Error generating yield predictions:', error)
    return NextResponse.json(
      { error: 'Failed to generate yield predictions' },
      { status: 500 }
    )
  }
}

// Update yield data for improved predictions
export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { batchId, weight, notes } = await request.json()
    
    const yieldData = await prisma.yieldData.create({
      data: {
        batchId,
        weight,
        notes,
        recordedAt: new Date(),
        recordedBy: userId
      }
    })

    return NextResponse.json(yieldData, { status: 201 })
  } catch (error) {
    console.error('Error recording yield data:', error)
    return NextResponse.json(
      { error: 'Failed to record yield data' },
      { status: 500 }
    )
  }
}