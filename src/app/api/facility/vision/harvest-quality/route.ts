import { NextRequest, NextResponse } from 'next/server';
import { googleVisionService } from '@/lib/vision/google-vision-service';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, imageBase64, facilityId, zoneId, strainName } = await request.json();

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Either imageUrl or imageBase64 is required' },
        { status: 400 }
      );
    }

    // Analyze harvest quality using Google Vision
    const qualityAnalysis = await googleVisionService.gradeHarvestQuality(
      imageUrl || Buffer.from(imageBase64, 'base64')
    );

    // Enhanced response with facility context
    const enhancedAnalysis = {
      ...qualityAnalysis,
      facilityId,
      zoneId,
      strainName,
      timestamp: new Date(),
      
      // Market value estimation based on grade
      marketValue: {
        gradeMultiplier: 
          qualityAnalysis.overallGrade === 'A+' ? 1.3 :
          qualityAnalysis.overallGrade === 'A' ? 1.15 :
          qualityAnalysis.overallGrade === 'B' ? 1.0 : 0.85,
        priceCategory:
          qualityAnalysis.overallGrade === 'A+' ? 'Premium' :
          qualityAnalysis.overallGrade === 'A' ? 'Top Shelf' :
          qualityAnalysis.overallGrade === 'B' ? 'Mid Shelf' : 'Budget'
      },
      
      // Compliance notes
      compliance: {
        passesVisualInspection: 
          !qualityAnalysis.colorProfile.hasDefects && 
          qualityAnalysis.budStructure.trimQuality > 70,
        requiresRemediation: 
          qualityAnalysis.colorProfile.hasDefects ||
          qualityAnalysis.recommendations.some(r => 
            r.toLowerCase().includes('mold') || 
            r.toLowerCase().includes('pest')
          )
      },
      
      // Storage recommendations based on analysis
      storageRecommendations: generateStorageRecommendations(qualityAnalysis),
      
      // Processing suggestions
      processingOptions: generateProcessingOptions(qualityAnalysis)
    };

    // Log analysis for tracking
    console.log(`Harvest quality analysis:`, {
      facilityId,
      zoneId,
      strainName,
      grade: qualityAnalysis.overallGrade,
      trichomeMaturity: qualityAnalysis.trichomeAnalysis.maturity,
      hasDefects: qualityAnalysis.colorProfile.hasDefects
    });

    return NextResponse.json(enhancedAnalysis);

  } catch (error: any) {
    console.error('Harvest quality analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze harvest quality', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function generateStorageRecommendations(analysis: any): string[] {
  const recommendations: string[] = [];
  
  // Moisture content based on trichome state
  if (analysis.trichomeAnalysis.maturity === 'amber') {
    recommendations.push('Store at 58-62% RH to preserve terpenes');
    recommendations.push('Use humidity packs for long-term storage');
  } else {
    recommendations.push('Ensure proper drying before storage (55-62% RH)');
  }
  
  // Temperature recommendations
  recommendations.push('Store in cool, dark place below 70°F');
  
  // Container recommendations based on quality
  if (analysis.overallGrade === 'A+' || analysis.overallGrade === 'A') {
    recommendations.push('Use airtight glass containers to preserve quality');
    recommendations.push('Consider vacuum sealing for premium preservation');
  } else {
    recommendations.push('Use airtight containers to prevent further degradation');
  }
  
  // Light protection
  if (analysis.colorProfile.vibrancy > 80) {
    recommendations.push('Use UV-protected containers to maintain color vibrancy');
  }
  
  return recommendations;
}

function generateProcessingOptions(analysis: any): string[] {
  const options: string[] = [];
  
  // Grade-based processing
  if (analysis.overallGrade === 'A+' || analysis.overallGrade === 'A') {
    options.push('Suitable for premium flower sales');
    options.push('Ideal for top-shelf pre-rolls');
    
    if (analysis.trichomeAnalysis.coverage > 80) {
      options.push('Excellent for ice water hash production');
      options.push('Premium rosin press material');
    }
  } else if (analysis.overallGrade === 'B') {
    options.push('Suitable for mid-tier flower sales');
    options.push('Good for standard pre-rolls');
    options.push('Consider for extraction (BHO/CO2)');
  } else {
    options.push('Best suited for extraction');
    options.push('Consider for edibles production');
    options.push('Suitable for trim processing');
  }
  
  // Trichome-based suggestions
  if (analysis.trichomeAnalysis.density > 100) {
    options.push('High-yield extraction potential');
  }
  
  // Size-based suggestions
  if (analysis.budStructure.size === 'small') {
    options.push('Consider for pre-ground products');
  } else if (analysis.budStructure.size === 'large') {
    options.push('Showcase buds for display jars');
  }
  
  return options;
}