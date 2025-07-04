import { NextRequest } from 'next/server';
import { validateApiKey, checkRateLimit } from '../../_middleware/auth';
import { handleApiError, successResponse } from '../../_middleware/error-handler';
import { rateLimitResponse, getRateLimitHeaders } from '../../_middleware/rate-limit';
import { validateRequestBody, growthPredictionSchema } from '../../_middleware/validation';
import { prisma } from '@/lib/prisma';
import { calculateGrowthPrediction, calculateYieldForecast } from '@/lib/growth-prediction-model';

export async function POST(req: NextRequest) {
  try {
    const authResult = await validateApiKey(req, 'plant-biology:read');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    const rateLimitKey = `plant-predictions:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 500, 3600);
    }

    const body = await validateRequestBody(req, growthPredictionSchema);

    // Get crop parameters
    const cropParams = getCropParameters(body.cropType, body.cultivar);
    
    if (!cropParams) {
      return handleApiError(
        new Error(`Unknown crop type: ${body.cropType}`),
        req.nextUrl.pathname
      );
    }

    // Calculate days since planting
    const plantingDate = new Date(body.plantingDate);
    const currentDate = new Date();
    const daysSincePlanting = Math.floor(
      (currentDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Use provided environmental conditions or defaults
    const envConditions = {
      temperature: body.environmentalConditions?.temperature || 24,
      humidity: body.environmentalConditions?.humidity || 65,
      co2_ppm: body.environmentalConditions?.co2 || 800,
      ppfd: body.environmentalConditions?.ppfd || 500,
      dli: body.environmentalConditions?.dli || 20
    };

    // Calculate growth stage
    const currentStage = determineGrowthStage(cropParams, daysSincePlanting);
    
    // Generate predictions
    const predictions = generatePredictions(
      cropParams,
      daysSincePlanting,
      currentStage,
      envConditions
    );

    // Calculate yield forecast
    const yieldForecast = calculateYieldForecast(
      {
        ...envConditions,
        crop_type: body.cropType,
        spectrum_ratio: { red_blue: 3, far_red: 2 },
        duration: 16
      },
      30 - daysSincePlanting // Days remaining to harvest
    );

    // Store prediction request
    await prisma.usageRecord.create({
      data: {
        userId: user.id,
        feature: 'plant-biology',
        action: 'growth-prediction',
        metadata: {
          cropType: body.cropType,
          cultivar: body.cultivar,
          daysSincePlanting,
          environmentalConditions: envConditions,
          predictions
        }
      }
    });

    const response = successResponse({
      crop: {
        type: body.cropType,
        cultivar: body.cultivar || 'standard',
        plantingDate: plantingDate.toISOString(),
        daysSincePlanting
      },
      currentStage: {
        name: currentStage.name,
        progress: currentStage.progress,
        daysRemaining: currentStage.daysRemaining
      },
      predictions: {
        nextStageTransition: predictions.nextStageDate,
        estimatedHarvestDate: predictions.harvestDate,
        currentGrowthRate: predictions.growthRate,
        healthScore: predictions.healthScore
      },
      yieldForecast: {
        expected: yieldForecast,
        minimum: yieldForecast * 0.8, // 20% lower estimate
        maximum: yieldForecast * 1.2, // 20% higher estimate
        unit: 'kg/m²',
        confidence: 0.85
      },
      recommendations: generateRecommendations(
        cropParams,
        currentStage,
        envConditions,
        predictions.healthScore
      )
    });

    const rateLimitHeaders = getRateLimitHeaders(rateLimitKey, 500, 3600);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

// Helper functions
interface CropParameters {
  name: string;
  stages: {
    name: string;
    duration: number;
    optimalTemp: number;
    optimalDLI: number;
    optimalCO2: number;
  }[];
  yieldPotential: number;
  yieldUnit: string;
}

function getCropParameters(cropType: string, cultivar?: string): CropParameters | null {
  const crops: Record<string, CropParameters> = {
    lettuce: {
      name: 'Lettuce',
      stages: [
        { name: 'Germination', duration: 7, optimalTemp: 20, optimalDLI: 12, optimalCO2: 400 },
        { name: 'Seedling', duration: 14, optimalTemp: 22, optimalDLI: 15, optimalCO2: 600 },
        { name: 'Vegetative', duration: 21, optimalTemp: 24, optimalDLI: 20, optimalCO2: 800 },
        { name: 'Mature', duration: 7, optimalTemp: 22, optimalDLI: 18, optimalCO2: 700 }
      ],
      yieldPotential: 150,
      yieldUnit: 'g/plant'
    },
    tomato: {
      name: 'Tomato',
      stages: [
        { name: 'Germination', duration: 10, optimalTemp: 25, optimalDLI: 15, optimalCO2: 400 },
        { name: 'Seedling', duration: 21, optimalTemp: 24, optimalDLI: 18, optimalCO2: 600 },
        { name: 'Vegetative', duration: 30, optimalTemp: 26, optimalDLI: 25, optimalCO2: 1000 },
        { name: 'Flowering', duration: 20, optimalTemp: 24, optimalDLI: 30, optimalCO2: 1200 },
        { name: 'Fruiting', duration: 60, optimalTemp: 22, optimalDLI: 28, optimalCO2: 1000 }
      ],
      yieldPotential: 5000,
      yieldUnit: 'g/plant'
    },
    cannabis: {
      name: 'Cannabis',
      stages: [
        { name: 'Clone/Seedling', duration: 14, optimalTemp: 25, optimalDLI: 20, optimalCO2: 600 },
        { name: 'Vegetative', duration: 28, optimalTemp: 26, optimalDLI: 40, optimalCO2: 1000 },
        { name: 'Flowering', duration: 63, optimalTemp: 24, optimalDLI: 45, optimalCO2: 1200 },
        { name: 'Ripening', duration: 14, optimalTemp: 22, optimalDLI: 35, optimalCO2: 800 }
      ],
      yieldPotential: 500,
      yieldUnit: 'g/plant'
    }
  };

  return crops[cropType.toLowerCase()] || null;
}

function determineGrowthStage(
  cropParams: CropParameters,
  daysSincePlanting: number
): { name: string; progress: number; daysRemaining: number } {
  let totalDays = 0;
  
  for (const stage of cropParams.stages) {
    const stageEnd = totalDays + stage.duration;
    
    if (daysSincePlanting <= stageEnd) {
      const daysInStage = daysSincePlanting - totalDays;
      const progress = (daysInStage / stage.duration) * 100;
      const daysRemaining = stage.duration - daysInStage;
      
      return {
        name: stage.name,
        progress: Math.round(progress),
        daysRemaining: Math.max(0, daysRemaining)
      };
    }
    
    totalDays = stageEnd;
  }

  // Plant is past all stages
  return {
    name: 'Harvest Ready',
    progress: 100,
    daysRemaining: 0
  };
}

function generatePredictions(
  cropParams: CropParameters,
  daysSincePlanting: number,
  currentStage: any,
  envConditions: any
): any {
  // Calculate total cycle duration
  const totalCycleDays = cropParams.stages.reduce((sum, stage) => sum + stage.duration, 0);
  
  // Calculate harvest date
  const plantingDate = new Date();
  plantingDate.setDate(plantingDate.getDate() - daysSincePlanting);
  const harvestDate = new Date(plantingDate);
  harvestDate.setDate(harvestDate.getDate() + totalCycleDays);

  // Calculate next stage transition
  const nextStageDate = new Date();
  nextStageDate.setDate(nextStageDate.getDate() + currentStage.daysRemaining);

  // Calculate growth rate based on environmental conditions
  const currentStageData = cropParams.stages.find(s => s.name === currentStage.name);
  let growthRate = 1.0;
  
  if (currentStageData) {
    // Temperature factor
    const tempDiff = Math.abs(envConditions.temperature - currentStageData.optimalTemp);
    const tempFactor = Math.max(0.5, 1 - (tempDiff * 0.05));
    
    // DLI factor
    const dliFactor = Math.min(1.2, envConditions.dli / currentStageData.optimalDLI);
    
    // CO2 factor
    const co2Factor = Math.min(1.3, envConditions.co2 / currentStageData.optimalCO2);
    
    growthRate = tempFactor * dliFactor * co2Factor;
  }

  // Calculate health score
  const healthScore = Math.round(growthRate * 100);

  return {
    nextStageDate: nextStageDate.toISOString(),
    harvestDate: harvestDate.toISOString(),
    growthRate: Math.round(growthRate * 100) / 100,
    healthScore: Math.min(100, healthScore)
  };
}

function generateRecommendations(
  cropParams: CropParameters,
  currentStage: any,
  envConditions: any,
  healthScore: number
): string[] {
  const recommendations: string[] = [];
  const stage = cropParams.stages.find(s => s.name === currentStage.name);
  
  if (!stage) return recommendations;

  // Temperature recommendations
  if (Math.abs(envConditions.temperature - stage.optimalTemp) > 2) {
    if (envConditions.temperature < stage.optimalTemp) {
      recommendations.push(`Increase temperature to ${stage.optimalTemp}°C for optimal growth`);
    } else {
      recommendations.push(`Decrease temperature to ${stage.optimalTemp}°C for optimal growth`);
    }
  }

  // DLI recommendations
  if (envConditions.dli < stage.optimalDLI * 0.8) {
    recommendations.push(`Increase daily light integral to ${stage.optimalDLI} mol/m²/day`);
  } else if (envConditions.dli > stage.optimalDLI * 1.2) {
    recommendations.push(`Reduce daily light integral to ${stage.optimalDLI} mol/m²/day to prevent stress`);
  }

  // CO2 recommendations
  if (envConditions.co2 < stage.optimalCO2 * 0.8) {
    recommendations.push(`Increase CO2 levels to ${stage.optimalCO2} ppm for enhanced growth`);
  }

  // Health-based recommendations
  if (healthScore < 80) {
    recommendations.push('Review environmental conditions to improve plant health');
  }

  // Stage-specific recommendations
  if (currentStage.progress > 80) {
    recommendations.push(`Prepare for transition to ${cropParams.stages[cropParams.stages.findIndex(s => s.name === currentStage.name) + 1]?.name || 'harvest'}`);
  }

  return recommendations;
}

