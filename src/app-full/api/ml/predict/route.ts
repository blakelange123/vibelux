import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { YieldPredictionModel as MLModel } from '@/lib/ml/yield-prediction-model';

// POST to make a prediction
export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cropType, facilityId, features, modelVersion } = body;

    if (!cropType || !features) {
      return NextResponse.json(
        { error: 'Missing required fields: cropType, features' },
        { status: 400 }
      );
    }

    // Find the best model for this crop type
    const where: any = {
      cropTypes: { has: cropType },
      status: 'ready'
    };
    
    if (modelVersion) {
      where.version = modelVersion;
    }

    const model = await prisma.yieldPredictionModel.findFirst({
      where,
      orderBy: { accuracy: 'desc' }
    });

    if (!model) {
      return NextResponse.json(
        { error: `No trained model found for crop type: ${cropType}` },
        { status: 404 }
      );
    }

    // Load and use the ML model
    const mlModel = new MLModel();
    const loaded = await mlModel.loadModel(model.version);

    if (!loaded) {
      // Fallback to mathematical model if ML model fails to load
      return fallbackPrediction(features, cropType);
    }

    // Make prediction
    const prediction = await mlModel.predict(features);

    // Store prediction in database
    const predictionRecord = await prisma.yieldPrediction.create({
      data: {
        modelId: model.id,
        facilityId,
        requestData: features,
        cropType,
        predictedYield: prediction.yield,
        confidence: prediction.confidence,
        predictionRange: {
          min: prediction.yield * 0.9,
          max: prediction.yield * 1.1
        },
        featureImpacts: prediction.factors.reduce((acc: any, f: any) => {
          acc[f.name] = f.impact;
          return acc;
        }, {}),
        recommendations: generateRecommendations(features, prediction.factors),
        requestedBy: user.userId
      }
    });

    // Cleanup
    mlModel.dispose();

    return NextResponse.json({
      success: true,
      data: {
        predictionId: predictionRecord.id,
        predictedYield: prediction.yield,
        confidence: prediction.confidence,
        unit: 'kg/m²',
        predictionRange: {
          min: prediction.yield * 0.9,
          max: prediction.yield * 1.1
        },
        factors: prediction.factors,
        recommendations: predictionRecord.recommendations,
        modelInfo: {
          id: model.id,
          version: model.version,
          accuracy: model.accuracy,
          lastTrained: model.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Error making prediction:', error);
    return NextResponse.json(
      { error: 'Failed to make prediction' },
      { status: 500 }
    );
  }
}

// Fallback to mathematical prediction
function fallbackPrediction(features: any, cropType: string) {
  // Base yields by crop type
  const baseYields: { [key: string]: number } = {
    lettuce: 2.5,
    tomato: 45,
    tomatoes: 45,
    cannabis: 1.5,
    herbs: 1.8,
    strawberries: 3.0,
    peppers: 35,
    cucumbers: 40
  };

  const baseYield = baseYields[cropType.toLowerCase()] || 2.0;

  // Calculate factors
  const factors = [
    {
      name: 'Temperature',
      impact: calculateImpact(features.temperature, 22, 2),
      optimal: 22,
      current: features.temperature
    },
    {
      name: 'Humidity',
      impact: calculateImpact(features.humidity, 65, 5),
      optimal: 65,
      current: features.humidity
    },
    {
      name: 'Light (PPFD)',
      impact: calculateImpact(features.ppfd, 450, 50),
      optimal: 450,
      current: features.ppfd
    },
    {
      name: 'CO2',
      impact: calculateImpact(features.co2, 1000, 100),
      optimal: 1000,
      current: features.co2
    },
    {
      name: 'VPD',
      impact: calculateImpact(features.vpd, 1.0, 0.2),
      optimal: 1.0,
      current: features.vpd
    }
  ];

  const avgImpact = factors.reduce((sum, f) => sum + f.impact, 0) / factors.length;
  const predictedYield = baseYield * (1 + avgImpact / 100);
  const confidence = Math.max(60, Math.min(85, 75 + avgImpact * 0.2));

  return NextResponse.json({
    success: true,
    data: {
      predictedYield: Number(predictedYield.toFixed(2)),
      confidence: Math.round(confidence),
      unit: 'kg/m²',
      predictionRange: {
        min: Number((predictedYield * 0.85).toFixed(2)),
        max: Number((predictedYield * 1.15).toFixed(2))
      },
      factors: factors.map(f => ({
        name: f.name,
        impact: Number(f.impact.toFixed(1))
      })),
      recommendations: generateRecommendations(features, factors),
      modelInfo: {
        type: 'mathematical',
        message: 'Using fallback model. Train ML model for better accuracy.'
      }
    }
  });
}

function calculateImpact(current: number, optimal: number, tolerance: number): number {
  const difference = Math.abs(current - optimal);
  if (difference <= tolerance) {
    return 90 - (difference / tolerance) * 40;
  } else {
    const excess = difference - tolerance;
    return Math.max(-50, -10 - (excess / (tolerance * 2)) * 40);
  }
}

function generateRecommendations(features: any, factors: any[]): string[] {
  const recommendations: string[] = [];
  
  // Sort factors by impact (most negative first)
  const sortedFactors = factors.sort((a, b) => a.impact - b.impact);
  
  for (const factor of sortedFactors.slice(0, 3)) {
    if (factor.impact < -10) {
      switch (factor.name.toLowerCase()) {
        case 'temperature':
          if (features.temperature < 20) {
            recommendations.push(`Increase temperature to 22°C (currently ${features.temperature.toFixed(1)}°C)`);
          } else if (features.temperature > 26) {
            recommendations.push(`Decrease temperature to 22°C (currently ${features.temperature.toFixed(1)}°C)`);
          }
          break;
        case 'humidity':
          if (features.humidity < 60) {
            recommendations.push(`Increase humidity to 65% (currently ${features.humidity.toFixed(0)}%)`);
          } else if (features.humidity > 70) {
            recommendations.push(`Decrease humidity to 65% (currently ${features.humidity.toFixed(0)}%)`);
          }
          break;
        case 'light (ppfd)':
          recommendations.push(`Optimize light intensity to 450 μmol/m²/s (currently ${features.ppfd.toFixed(0)})`);
          break;
        case 'co2':
          recommendations.push(`Adjust CO2 to 1000 ppm (currently ${features.co2.toFixed(0)} ppm)`);
          break;
        case 'vpd':
          recommendations.push(`Optimize VPD to 1.0 kPa (currently ${features.vpd.toFixed(2)} kPa)`);
          break;
      }
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Environmental conditions are near optimal. Maintain current settings.');
  }

  return recommendations;
}

// GET prediction history
export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const cropType = searchParams.get('cropType');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};
    if (facilityId) where.facilityId = facilityId;
    if (cropType) where.cropType = cropType;

    const predictions = await prisma.yieldPrediction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        model: {
          select: {
            version: true,
            name: true,
            accuracy: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}

// PATCH to add actual yield feedback
export async function PATCH(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { predictionId, actualYield } = body;

    if (!predictionId || actualYield === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: predictionId, actualYield' },
        { status: 400 }
      );
    }

    const prediction = await prisma.yieldPrediction.findUnique({
      where: { id: predictionId }
    });

    if (!prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }

    // Calculate accuracy
    const accuracy = 100 - Math.abs((actualYield - prediction.predictedYield) / actualYield) * 100;

    const updated = await prisma.yieldPrediction.update({
      where: { id: predictionId },
      data: {
        actualYield,
        feedbackDate: new Date(),
        accuracy: Math.max(0, accuracy)
      }
    });

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating prediction:', error);
    return NextResponse.json(
      { error: 'Failed to update prediction' },
      { status: 500 }
    );
  }
}