import { NextRequest, NextResponse } from 'next/server';
import { EmissionsCalculator, FacilityData } from '@/lib/esg/emissions-calculator';
import { SustainabilityCalculator } from '@/lib/esg/sustainability-metrics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilityData, resourceMetrics, socialMetrics, governanceMetrics } = body;

    if (!facilityData) {
      return NextResponse.json(
        { error: 'Facility data is required' },
        { status: 400 }
      );
    }

    // Initialize calculators
    const emissionsCalc = new EmissionsCalculator();
    const sustainabilityCalc = new SustainabilityCalculator();

    // Calculate emissions
    const emissionsReport = emissionsCalc.calculateEmissions(facilityData);

    // Calculate ESG score if all metrics provided
    let esgScore = null;
    if (resourceMetrics && socialMetrics && governanceMetrics) {
      esgScore = sustainabilityCalc.calculateESGScore(
        emissionsReport,
        resourceMetrics,
        socialMetrics,
        governanceMetrics
      );
    }

    // Generate GHG Protocol report
    const ghgReport = emissionsCalc.generateGHGProtocolReport(facilityData, emissionsReport);

    // Generate recommendations
    let recommendations = null;
    if (resourceMetrics && socialMetrics && governanceMetrics) {
      recommendations = sustainabilityCalc.generateRecommendations({
        period: { start: new Date(), end: new Date() },
        emissions: emissionsReport,
        resources: resourceMetrics,
        social: socialMetrics,
        governance: governanceMetrics,
        score: esgScore!,
        improvements: [],
        certifications: []
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        emissions: emissionsReport,
        esgScore,
        ghgReport,
        recommendations,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error calculating emissions:', error);
    return NextResponse.json(
      { error: 'Failed to calculate emissions' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Return emission factors and benchmarks
  const emissionsCalc = new EmissionsCalculator();
  
  return NextResponse.json({
    success: true,
    data: {
      emissionFactors: {
        grid: {
          'US-CA': 0.239,
          'US-TX': 0.397,
          'US-FL': 0.417,
          'US-NY': 0.374,
          'US-Average': 0.455
        },
        fuel: {
          naturalGas: 1.885, // kg CO2e per cubic meter
          propane: 1.51, // kg CO2e per liter
          diesel: 2.68 // kg CO2e per liter
        }
      },
      benchmarks: {
        traditional: {
          emissionsIntensity: 1.2, // kg CO2e per sq ft
          energyIntensity: 50, // kWh per sq ft
          waterIntensity: 20 // gallons per sq ft
        },
        efficient: {
          emissionsIntensity: 0.5,
          energyIntensity: 35,
          waterIntensity: 10
        },
        bestInClass: {
          emissionsIntensity: 0.3,
          energyIntensity: 25,
          waterIntensity: 5
        }
      },
      certifications: [
        'B-Corp',
        'LEED',
        'USDA Organic',
        'Fair Trade',
        'Energy Star',
        'GLOBALG.A.P.'
      ]
    }
  });
}