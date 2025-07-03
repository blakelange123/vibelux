import { NextRequest, NextResponse } from 'next/server';
import { googleVisionService } from '@/lib/vision/google-vision-service';
import { plantVisionAI } from '@/lib/plant-vision-ai';

export async function POST(request: NextRequest) {
  try {
    const { 
      imageUrl, 
      imageBase64,
      facilityId,
      zoneId,
      plantId,
      plantStage,
      strainName,
      plantAge, // days since germination
      environmentalData
    } = await request.json();

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Either imageUrl or imageBase64 is required' },
        { status: 400 }
      );
    }

    // Parallel analysis using both Google Vision and our plant vision AI
    const [phenotype, diseases, pests] = await Promise.all([
      googleVisionService.analyzePlantPhenotype(imageUrl || Buffer.from(imageBase64, 'base64')),
      googleVisionService.detectPlantDiseases(imageUrl || Buffer.from(imageBase64, 'base64')),
      googleVisionService.identifyPests(imageUrl || Buffer.from(imageBase64, 'base64'))
    ]);

    // Calculate comprehensive health metrics
    const healthMetrics = calculateHealthMetrics(phenotype, diseases, pests);
    
    // Generate growth projections
    const growthProjections = generateGrowthProjections(
      phenotype,
      plantStage,
      plantAge
    );
    
    // Create actionable insights
    const insights = generateActionableInsights(
      phenotype,
      diseases,
      pests,
      environmentalData
    );
    
    // Build comprehensive health report
    const healthReport = {
      // Basic info
      facilityId,
      zoneId,
      plantId,
      strainName,
      timestamp: new Date(),
      
      // Health summary
      overallHealth: {
        score: healthMetrics.overallScore,
        status: healthMetrics.status,
        trend: healthMetrics.trend,
        criticalIssues: healthMetrics.criticalIssues
      },
      
      // Detailed phenotyping
      phenotype: {
        ...phenotype,
        // Enhanced metrics
        growthRate: calculateGrowthRate(phenotype, plantAge),
        developmentStage: determineDevelopmentStage(phenotype, plantAge),
        stressIndicators: identifyStressIndicators(phenotype)
      },
      
      // Issues and treatments
      issues: {
        diseases: diseases.map(d => ({
          ...d,
          urgency: calculateUrgency(d),
          spreadRisk: assessSpreadRisk(d, environmentalData)
        })),
        pests: pests.map(p => ({
          ...p,
          populationTrend: estimatePopulationTrend(p),
          economicThreshold: calculateEconomicThreshold(p)
        })),
        deficiencies: extractDeficiencies(phenotype)
      },
      
      // Predictions and projections
      projections: {
        ...growthProjections,
        harvestWindow: calculateHarvestWindow(phenotype, plantStage, plantAge),
        yieldEstimate: estimateYield(phenotype, healthMetrics),
        qualityForecast: forecastQuality(phenotype, healthMetrics)
      },
      
      // Actionable recommendations
      recommendations: {
        immediate: insights.immediate,
        shortTerm: insights.shortTerm,
        longTerm: insights.longTerm,
        preventive: generatePreventiveActions(diseases, pests, environmentalData)
      },
      
      // Integration with other systems
      integrations: {
        alertsTriggered: generateAlerts(healthMetrics, diseases, pests),
        automationCommands: generateAutomationCommands(phenotype, environmentalData),
        complianceNotes: generateComplianceNotes(diseases, pests)
      }
    };

    // Log analysis for ML training
    await logHealthAnalysis(healthReport);

    return NextResponse.json(healthReport);

  } catch (error: any) {
    console.error('Plant health analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze plant health', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function calculateHealthMetrics(phenotype: any, diseases: any[], pests: any[]): any {
  let score = 100;
  const criticalIssues: string[] = [];
  
  // Deduct for diseases
  diseases.forEach(disease => {
    const penalty = disease.severity === 'critical' ? 25 :
                   disease.severity === 'severe' ? 15 :
                   disease.severity === 'moderate' ? 8 : 3;
    score -= penalty * disease.confidence;
    
    if (disease.severity === 'critical' || disease.severity === 'severe') {
      criticalIssues.push(disease.name);
    }
  });
  
  // Deduct for pests
  pests.forEach(pest => {
    const penalty = pest.infestationLevel === 'critical' ? 20 :
                   pest.infestationLevel === 'high' ? 12 :
                   pest.infestationLevel === 'medium' ? 6 : 2;
    score -= penalty * pest.confidence;
    
    if (pest.infestationLevel === 'critical' || pest.infestationLevel === 'high') {
      criticalIssues.push(pest.commonName);
    }
  });
  
  // Deduct for nutrient deficiencies
  if (phenotype.advancedPhenotyping) {
    Object.entries(phenotype.advancedPhenotyping.nutrientDeficiencyScore).forEach(([nutrient, defScore]) => {
      if (defScore > 0.3) {
        score -= defScore * 10;
        if (defScore > 0.6) {
          criticalIssues.push(`${nutrient} deficiency`);
        }
      }
    });
  }
  
  // Environmental stress
  if (phenotype.advancedPhenotyping?.environmentalResponse) {
    if (phenotype.advancedPhenotyping.environmentalResponse.temperatureStress !== 'optimal') {
      score -= 5;
    }
    if (phenotype.advancedPhenotyping.environmentalResponse.vpgStress !== 'optimal') {
      score -= 5;
    }
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    overallScore: Math.round(score),
    status: score >= 85 ? 'Excellent' :
            score >= 70 ? 'Good' :
            score >= 55 ? 'Fair' : 'Poor',
    trend: 'stable', // Would need historical data to determine
    criticalIssues
  };
}

function generateGrowthProjections(phenotype: any, plantStage: string, plantAge: number): any {
  const currentHeight = phenotype.canopyMetrics.height;
  const growthRate = currentHeight / plantAge; // cm per day
  
  // Stage-based projections
  const stageTimelines = {
    seedling: { duration: 14, nextStage: 'vegetative' },
    vegetative: { duration: 28, nextStage: 'pre-flower' },
    'pre-flower': { duration: 14, nextStage: 'flowering' },
    flowering: { duration: 56, nextStage: 'harvest' },
    harvest: { duration: 0, nextStage: null }
  };
  
  const currentStageInfo = stageTimelines[plantStage as keyof typeof stageTimelines];
  const daysInCurrentStage = plantAge % currentStageInfo.duration;
  const daysToNextStage = currentStageInfo.duration - daysInCurrentStage;
  
  return {
    currentGrowthRate: growthRate,
    projectedHeight: currentHeight + (growthRate * 30), // 30 days projection
    daysToNextStage,
    nextStage: currentStageInfo.nextStage,
    estimatedMaturityDate: new Date(Date.now() + (calculateDaysToMaturity(plantStage, plantAge) * 24 * 60 * 60 * 1000))
  };
}

function generateActionableInsights(phenotype: any, diseases: any[], pests: any[], envData: any): any {
  const immediate: string[] = [];
  const shortTerm: string[] = [];
  const longTerm: string[] = [];
  
  // Immediate actions for critical issues
  diseases.filter(d => d.severity === 'critical').forEach(disease => {
    immediate.push(...disease.treatmentSuggestions.slice(0, 2));
  });
  
  pests.filter(p => p.infestationLevel === 'critical').forEach(pest => {
    immediate.push(...pest.controlMethods.mechanical.slice(0, 1));
    immediate.push(...pest.controlMethods.biological.slice(0, 1));
  });
  
  // Short-term optimizations
  if (phenotype.canopyMetrics.density < 0.6) {
    shortTerm.push('Implement canopy management techniques (LST, topping, or defoliation)');
  }
  
  if (phenotype.advancedPhenotyping?.chlorophyllIndex < 35) {
    shortTerm.push('Increase nitrogen levels in feeding schedule');
  }
  
  // Long-term improvements
  if (envData && envData.averageVPD > 1.4) {
    longTerm.push('Consider upgrading humidity control systems');
  }
  
  if (diseases.length > 2 || pests.length > 2) {
    longTerm.push('Review and enhance IPM protocols');
    longTerm.push('Consider beneficial insect introduction program');
  }
  
  return { immediate, shortTerm, longTerm };
}

function calculateGrowthRate(phenotype: any, plantAge: number): number {
  return phenotype.canopyMetrics.height / plantAge;
}

function determineDevelopmentStage(phenotype: any, plantAge: number): string {
  if (phenotype.flowerMetrics && phenotype.flowerMetrics.count > 0) {
    return `Flowering - Week ${Math.floor((plantAge - 42) / 7)}`;
  }
  if (plantAge < 14) return `Seedling - Day ${plantAge}`;
  if (plantAge < 42) return `Vegetative - Week ${Math.floor(plantAge / 7)}`;
  return `Pre-flower - Day ${plantAge - 42}`;
}

function identifyStressIndicators(phenotype: any): string[] {
  const indicators: string[] = [];
  
  if (phenotype.leafMetrics.colorHealth < 60) {
    indicators.push('Leaf discoloration detected');
  }
  
  if (phenotype.advancedPhenotyping?.waterStressIndex > 0.5) {
    indicators.push('Water stress detected');
  }
  
  if (phenotype.advancedPhenotyping?.environmentalResponse.lightSaturation) {
    indicators.push('Light saturation reached');
  }
  
  return indicators;
}

function calculateUrgency(disease: any): 'immediate' | 'high' | 'medium' | 'low' {
  if (disease.severity === 'critical') return 'immediate';
  if (disease.severity === 'severe') return 'high';
  if (disease.severity === 'moderate') return 'medium';
  return 'low';
}

function assessSpreadRisk(disease: any, envData: any): number {
  let risk = 0.5; // Base risk
  
  // Increase risk based on environmental conditions
  if (envData) {
    if (envData.humidity > 65 && disease.diseaseType === 'fungal') risk += 0.3;
    if (envData.temperature > 80 && disease.diseaseType === 'bacterial') risk += 0.2;
    if (envData.airflow < 0.5) risk += 0.2; // Poor airflow increases spread
  }
  
  return Math.min(1, risk);
}

function estimatePopulationTrend(pest: any): 'increasing' | 'stable' | 'decreasing' {
  // Would need historical data for real trend
  // For now, base on life cycle stage
  if (pest.lifeCycleStage === 'egg' || pest.lifeCycleStage === 'larva') {
    return 'increasing';
  }
  return 'stable';
}

function calculateEconomicThreshold(pest: any): boolean {
  // Simplified economic threshold
  return pest.infestationLevel === 'high' || pest.infestationLevel === 'critical';
}

function extractDeficiencies(phenotype: any): any[] {
  const deficiencies: any[] = [];
  
  if (phenotype.advancedPhenotyping?.nutrientDeficiencyScore) {
    Object.entries(phenotype.advancedPhenotyping.nutrientDeficiencyScore).forEach(([nutrient, score]) => {
      if (score > 0.2) {
        deficiencies.push({
          nutrient: nutrient.charAt(0).toUpperCase() + nutrient.slice(1),
          severity: score > 0.6 ? 'severe' : score > 0.4 ? 'moderate' : 'mild',
          score,
          symptoms: getNutrientDeficiencySymptoms(nutrient),
          treatment: getNutrientDeficiencyTreatment(nutrient)
        });
      }
    });
  }
  
  return deficiencies;
}

function calculateDaysToMaturity(stage: string, age: number): number {
  const totalCycle = 98; // ~14 weeks total
  const stageStart = {
    seedling: 0,
    vegetative: 14,
    'pre-flower': 42,
    flowering: 56,
    harvest: 98
  };
  
  const currentStart = stageStart[stage as keyof typeof stageStart] || 0;
  return totalCycle - age;
}

function calculateHarvestWindow(phenotype: any, stage: string, age: number): any {
  const daysToMaturity = calculateDaysToMaturity(stage, age);
  
  return {
    earliest: new Date(Date.now() + ((daysToMaturity - 7) * 24 * 60 * 60 * 1000)),
    optimal: new Date(Date.now() + (daysToMaturity * 24 * 60 * 60 * 1000)),
    latest: new Date(Date.now() + ((daysToMaturity + 7) * 24 * 60 * 60 * 1000)),
    confidence: 0.8
  };
}

function estimateYield(phenotype: any, healthMetrics: any): any {
  const baseYield = phenotype.canopyMetrics.coverage * 1.5; // grams
  const healthMultiplier = healthMetrics.overallScore / 100;
  const densityBonus = phenotype.canopyMetrics.density * 50;
  
  return {
    estimated: Math.round((baseYield + densityBonus) * healthMultiplier),
    range: {
      min: Math.round((baseYield + densityBonus) * healthMultiplier * 0.8),
      max: Math.round((baseYield + densityBonus) * healthMultiplier * 1.2)
    },
    unit: 'grams'
  };
}

function forecastQuality(phenotype: any, healthMetrics: any): any {
  let qualityScore = healthMetrics.overallScore;
  
  // Bonus for good trichome development
  if (phenotype.flowerMetrics && phenotype.flowerMetrics.trichomeDensity > 70) {
    qualityScore += 10;
  }
  
  // Penalty for stress
  if (phenotype.advancedPhenotyping?.waterStressIndex > 0.3) {
    qualityScore -= 5;
  }
  
  qualityScore = Math.min(100, qualityScore);
  
  return {
    expectedGrade: qualityScore >= 90 ? 'A' : qualityScore >= 80 ? 'B' : 'C',
    score: qualityScore,
    factors: {
      trichomeDevelopment: phenotype.flowerMetrics?.trichomeDensity || 50,
      colorVibrancy: phenotype.leafMetrics?.colorHealth || 70,
      budDensity: phenotype.canopyMetrics.density * 100
    }
  };
}

function generatePreventiveActions(diseases: any[], pests: any[], envData: any): string[] {
  const actions: string[] = [];
  
  // Disease prevention
  if (diseases.some(d => d.diseaseType === 'fungal')) {
    actions.push('Maintain humidity below 60% during flowering');
    actions.push('Ensure adequate air circulation between plants');
  }
  
  // Pest prevention
  if (pests.length > 0) {
    actions.push('Install yellow sticky traps for early detection');
    actions.push('Regular inspection of lower leaves and stem joints');
  }
  
  // Environmental optimization
  if (envData) {
    if (envData.vpd < 0.8 || envData.vpd > 1.2) {
      actions.push('Optimize VPD to 0.8-1.2 kPa range');
    }
  }
  
  return actions;
}

function generateAlerts(healthMetrics: any, diseases: any[], pests: any[]): any[] {
  const alerts: any[] = [];
  
  if (healthMetrics.overallScore < 60) {
    alerts.push({
      type: 'health_critical',
      message: 'Plant health critically low',
      severity: 'high'
    });
  }
  
  diseases.filter(d => d.severity === 'critical').forEach(disease => {
    alerts.push({
      type: 'disease_outbreak',
      message: `Critical ${disease.name} detected`,
      severity: 'critical'
    });
  });
  
  pests.filter(p => p.infestationLevel === 'critical').forEach(pest => {
    alerts.push({
      type: 'pest_infestation',
      message: `Critical ${pest.commonName} infestation`,
      severity: 'critical'
    });
  });
  
  return alerts;
}

function generateAutomationCommands(phenotype: any, envData: any): any[] {
  const commands: any[] = [];
  
  // Environmental adjustments
  if (phenotype.advancedPhenotyping?.environmentalResponse.temperatureStress === 'heat') {
    commands.push({
      system: 'hvac',
      action: 'decrease_temperature',
      value: 2,
      unit: 'degrees'
    });
  }
  
  if (phenotype.advancedPhenotyping?.environmentalResponse.vpgStress === 'high') {
    commands.push({
      system: 'humidity',
      action: 'increase_humidity',
      value: 10,
      unit: 'percent'
    });
  }
  
  return commands;
}

function generateComplianceNotes(diseases: any[], pests: any[]): string[] {
  const notes: string[] = [];
  
  if (diseases.some(d => d.severity === 'critical')) {
    notes.push('Document disease treatment for compliance records');
  }
  
  if (pests.some(p => p.infestationLevel === 'critical')) {
    notes.push('Log pesticide application if chemical control used');
  }
  
  return notes;
}

function getNutrientDeficiencySymptoms(nutrient: string): string[] {
  const symptoms: Record<string, string[]> = {
    nitrogen: ['Yellowing of lower leaves', 'Stunted growth', 'Pale green color'],
    phosphorus: ['Purple or red stems', 'Dark green leaves', 'Delayed flowering'],
    potassium: ['Brown leaf edges', 'Weak stems', 'Poor bud development'],
    calcium: ['Brown spots on leaves', 'Curled leaf tips', 'Weak cell walls'],
    magnesium: ['Interveinal chlorosis', 'Yellow between veins', 'Leaf curl']
  };
  
  return symptoms[nutrient] || ['General nutrient stress symptoms'];
}

function getNutrientDeficiencyTreatment(nutrient: string): string[] {
  const treatments: Record<string, string[]> = {
    nitrogen: ['Increase N in nutrient solution', 'Check pH (5.5-6.5)', 'Foliar feed with N'],
    phosphorus: ['Add P supplement', 'Ensure pH below 6.5', 'Check for lockout'],
    potassium: ['Increase K during flowering', 'Flush and reset nutrients', 'Check EC levels'],
    calcium: ['Add Cal-Mag supplement', 'Check water hardness', 'Ensure proper pH'],
    magnesium: ['Apply Epsom salts', 'Add Cal-Mag', 'Foliar spray with Mg']
  };
  
  return treatments[nutrient] || ['Adjust nutrient solution', 'Check pH and EC'];
}

async function logHealthAnalysis(report: any): Promise<void> {
  try {
    await fetch('/api/analytics/health-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityId: report.facilityId,
        plantId: report.plantId,
        healthScore: report.overallHealth.score,
        issueCount: report.issues.diseases.length + report.issues.pests.length,
        timestamp: report.timestamp
      })
    });
  } catch (error) {
    console.error('Failed to log health analysis:', error);
  }
}