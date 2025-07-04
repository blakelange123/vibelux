import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple yield prediction endpoint without authentication for internal use
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cropType = searchParams.get('cropType') || 'Lettuce';
    const zone = searchParams.get('zone') || 'zone-1';
    const facilityId = searchParams.get('facilityId');

    // Try to get real sensor data if facilityId is provided
    let environmentalData;
    
    if (facilityId) {
      // Get latest sensor readings
      const latestReadings = await getLatestSensorData(facilityId);
      if (latestReadings) {
        environmentalData = latestReadings;
      }
    }
    
    // Fallback to mock data if no real data available
    if (!environmentalData) {
      environmentalData = {
        temperature: 22 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4 - 2), // 20-24°C
        humidity: 65 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 - 5), // 60-70%
        ppfd: 450 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 - 50), // 400-500 μmol/m²/s
        co2: 900 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 - 100), // 800-1000 ppm
        vpd: 1.0 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4 - 0.2), // 0.8-1.2 kPa
        ec: 1.8 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4 - 0.2), // 1.6-2.0
        ph: 6.0 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4 - 0.2), // 5.8-6.2
        dli: 25 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4 - 2) // 23-27 mol/m²/day
      };
    }

    // Calculate yield based on crop type and conditions
    let baseYield = 2.5; // Default for lettuce (kg/m²)
    let unit = 'kg/m²';

    switch (cropType.toLowerCase()) {
      case 'lettuce':
        baseYield = 2.5;
        unit = 'kg/m²';
        break;
      case 'tomato':
      case 'tomatoes':
        baseYield = 45;
        unit = 'kg/m²';
        break;
      case 'cannabis':
        baseYield = 1.5;
        unit = 'kg/m²';
        break;
      case 'herbs':
        baseYield = 1.8;
        unit = 'kg/m²';
        break;
      default:
        baseYield = 2.0;
        unit = 'kg/m²';
    }

    // Apply environmental factors to yield
    const factors = {
      temperature: calculateFactorImpact(environmentalData.temperature, 22, 2),
      humidity: calculateFactorImpact(environmentalData.humidity, 65, 5),
      ppfd: calculateFactorImpact(environmentalData.ppfd, 450, 50),
      co2: calculateFactorImpact(environmentalData.co2, 1000, 100),
      vpd: calculateFactorImpact(environmentalData.vpd, 1.0, 0.2),
      nutrients: calculateFactorImpact(environmentalData.ec, 1.8, 0.2)
    };

    // Calculate overall yield multiplier
    const yieldMultiplier = Object.values(factors).reduce((sum, factor) => sum + factor, 0) / Object.keys(factors).length;
    const adjustedYield = baseYield * (1 + yieldMultiplier / 100);

    // Calculate confidence based on how close conditions are to optimal
    const confidence = Math.max(75, Math.min(95, 85 + yieldMultiplier * 0.3));

    // Estimated harvest date (21 days for lettuce, 90 for tomatoes, 70 for cannabis)
    const harvestDays = cropType.toLowerCase() === 'tomato' ? 90 : 
                       cropType.toLowerCase() === 'cannabis' ? 70 : 21;
    const estimatedHarvest = new Date(Date.now() + harvestDays * 24 * 60 * 60 * 1000);

    const prediction = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        cropType,
        zone,
        yield: {
          estimated: Number(adjustedYield.toFixed(2)),
          unit,
          confidence: Math.round(confidence)
        },
        estimatedHarvest: estimatedHarvest.toISOString(),
        environmentalFactors: {
          temperature: Math.round(environmentalData.temperature * 10) / 10,
          humidity: Math.round(environmentalData.humidity),
          lighting: {
            ppfd: Math.round(environmentalData.ppfd),
            dli: Math.round(environmentalData.dli * 10) / 10
          },
          co2: Math.round(environmentalData.co2),
          vpd: Math.round(environmentalData.vpd * 100) / 100
        },
        nutritionFactors: {
          ec: Math.round(environmentalData.ec * 100) / 100,
          ph: Math.round(environmentalData.ph * 100) / 100
        },
        irrigationFactors: {
          waterUsage: 3.5 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1 - 0.5)
        },
        factors,
        recommendations: generateRecommendations(environmentalData, factors),
        confidence: Math.round(confidence)
      }
    };

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Yield prediction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate yield prediction',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate factor impact (-100 to +100)
function calculateFactorImpact(current: number, optimal: number, tolerance: number): number {
  const difference = Math.abs(current - optimal);
  const maxDifference = tolerance * 2; // Beyond this is very bad
  
  if (difference <= tolerance) {
    // Within tolerance range - positive impact
    return 90 - (difference / tolerance) * 40; // 50-90% impact
  } else {
    // Outside tolerance - negative impact
    const excessDifference = difference - tolerance;
    return Math.max(-50, -10 - (excessDifference / maxDifference) * 40); // -10 to -50% impact
  }
}

// Generate recommendations based on current conditions
function generateRecommendations(conditions: any, factors: any): string[] {
  const recommendations: string[] = [];

  if (factors.temperature < -10) {
    recommendations.push(`Adjust temperature to 22°C (currently ${conditions.temperature.toFixed(1)}°C)`);
  }
  
  if (factors.humidity < -10) {
    recommendations.push(`Optimize humidity to 65% (currently ${conditions.humidity.toFixed(0)}%)`);
  }
  
  if (factors.ppfd < -10) {
    recommendations.push(`Increase light intensity to 450 μmol/m²/s (currently ${conditions.ppfd.toFixed(0)})`);
  }
  
  if (factors.co2 < -10) {
    recommendations.push(`Increase CO2 to 1000 ppm (currently ${conditions.co2.toFixed(0)} ppm)`);
  }

  if (factors.nutrients < -10) {
    recommendations.push(`Adjust nutrient EC to 1.8 (currently ${conditions.ec.toFixed(2)})`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Environmental conditions are optimal - maintain current settings');
  }

  return recommendations;
}

// Get latest sensor data for a facility
async function getLatestSensorData(facilityId: string) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // Get latest readings for each sensor type
    const readings = await prisma.sensorReading.groupBy({
      by: ['sensorType'],
      where: {
        facilityId,
        timestamp: { gte: oneHourAgo },
        quality: 'good'
      },
      _avg: {
        value: true
      }
    });

    if (readings.length === 0) return null;

    // Convert to environmental data format
    const data: any = {};
    readings.forEach(reading => {
      switch (reading.sensorType) {
        case 'temperature':
          data.temperature = reading._avg.value || 22;
          break;
        case 'humidity':
          data.humidity = reading._avg.value || 65;
          break;
        case 'ppfd':
          data.ppfd = reading._avg.value || 450;
          break;
        case 'co2':
          data.co2 = reading._avg.value || 1000;
          break;
        case 'ec':
          data.ec = reading._avg.value || 1.8;
          break;
        case 'ph':
          data.ph = reading._avg.value || 6.0;
          break;
      }
    });

    // Calculate derived values
    if (data.temperature && data.humidity) {
      data.vpd = calculateVPD(data.temperature, data.humidity);
    }
    if (data.ppfd) {
      data.dli = (data.ppfd * 3600 * 16) / 1000000; // 16 hour photoperiod
    }

    return data;
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return null;
  }
}

function calculateVPD(temp: number, humidity: number): number {
  const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  const avp = (humidity / 100) * svp;
  return svp - avp;
}