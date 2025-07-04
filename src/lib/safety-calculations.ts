// Workplace safety calculations and risk assessments for vertical farming

export interface SafetyRiskFactors {
  electricalHazards: number; // 0-10 scale
  chemicalExposure: number;
  ergonomicRisk: number;
  slipFallRisk: number;
  equipmentSafety: number;
  fireRisk: number;
  biologicalHazards: number;
  noiseLevel: number; // dB
  lightingAdequacy: number; // lux
  airQuality: number; // AQI
}

export interface WorkstationErgonomics {
  workstationId: string;
  workHeight: number; // inches
  reachDistance: number; // inches
  liftingWeight: number; // pounds
  repetitionRate: number; // actions per minute
  postureScore: number; // RULA/REBA score
  vibrationExposure: number; // m/s²
  workDuration: number; // hours
}

export interface SafetyCompliance {
  oshaCompliance: number; // percentage
  trainingCompliance: number;
  ppeCompliance: number;
  incidentReportingRate: number;
  inspectionFrequency: number; // per month
  correctiveActionCompletion: number; // percentage
}

// Calculate overall safety score
export function calculateSafetyScore(riskFactors: SafetyRiskFactors): number {
  const weights = {
    electricalHazards: 0.2,
    chemicalExposure: 0.15,
    ergonomicRisk: 0.15,
    slipFallRisk: 0.1,
    equipmentSafety: 0.15,
    fireRisk: 0.1,
    biologicalHazards: 0.05,
    noiseLevel: 0.05,
    lightingAdequacy: 0.025,
    airQuality: 0.025
  };

  // Convert risk factors to safety scores (10 - risk = safety)
  const safetyFactors = {
    electricalHazards: 10 - riskFactors.electricalHazards,
    chemicalExposure: 10 - riskFactors.chemicalExposure,
    ergonomicRisk: 10 - riskFactors.ergonomicRisk,
    slipFallRisk: 10 - riskFactors.slipFallRisk,
    equipmentSafety: 10 - riskFactors.equipmentSafety,
    fireRisk: 10 - riskFactors.fireRisk,
    biologicalHazards: 10 - riskFactors.biologicalHazards,
    noiseLevel: Math.max(0, 10 - (riskFactors.noiseLevel - 50) / 5), // OSHA limit ~85dB
    lightingAdequacy: Math.min(10, riskFactors.lightingAdequacy / 50), // 500 lux = good
    airQuality: Math.max(0, 10 - riskFactors.airQuality / 15) // AQI 150 = unhealthy
  };

  const weightedScore = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (safetyFactors[key as keyof typeof safetyFactors] * weight);
  }, 0);

  return Math.round(weightedScore * 10); // Scale to 0-100
}

// Ergonomic risk assessment using RULA methodology
export function calculateErgonomicRisk(workstation: WorkstationErgonomics): {
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  score: number;
  recommendations: string[];
} {
  let score = 0;
  const recommendations: string[] = [];

  // Work height assessment
  const optimalHeight = 36; // inches for standing work
  const heightDeviation = Math.abs(workstation.workHeight - optimalHeight);
  if (heightDeviation > 6) {
    score += 3;
    recommendations.push('Adjust work surface height to 30-42 inches');
  } else if (heightDeviation > 3) {
    score += 2;
    recommendations.push('Consider adjustable work surface');
  }

  // Reach distance
  if (workstation.reachDistance > 24) {
    score += 3;
    recommendations.push('Reduce reach distance to less than 24 inches');
  } else if (workstation.reachDistance > 18) {
    score += 2;
    recommendations.push('Optimize tool and material placement');
  }

  // Lifting weight
  if (workstation.liftingWeight > 50) {
    score += 4;
    recommendations.push('Implement mechanical lifting aids');
  } else if (workstation.liftingWeight > 25) {
    score += 2;
    recommendations.push('Consider team lifting or lifting aids');
  }

  // Repetition rate
  if (workstation.repetitionRate > 30) {
    score += 3;
    recommendations.push('Implement job rotation or automation');
  } else if (workstation.repetitionRate > 20) {
    score += 2;
    recommendations.push('Schedule regular breaks every 30 minutes');
  }

  // Posture score (RULA/REBA)
  if (workstation.postureScore > 7) {
    score += 4;
    recommendations.push('Immediate workstation redesign required');
  } else if (workstation.postureScore > 5) {
    score += 3;
    recommendations.push('Investigate and change workstation setup');
  } else if (workstation.postureScore > 3) {
    score += 2;
    recommendations.push('Further investigation and possible changes needed');
  }

  // Vibration exposure
  if (workstation.vibrationExposure > 5) {
    score += 3;
    recommendations.push('Reduce vibration exposure with dampening');
  } else if (workstation.vibrationExposure > 2.5) {
    score += 2;
    recommendations.push('Monitor vibration exposure levels');
  }

  // Work duration
  if (workstation.workDuration > 8) {
    score += 2;
    recommendations.push('Limit continuous work to 8 hours');
  } else if (workstation.workDuration > 6) {
    score += 1;
    recommendations.push('Ensure adequate rest breaks');
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  if (score <= 5) riskLevel = 'low';
  else if (score <= 10) riskLevel = 'medium';
  else if (score <= 15) riskLevel = 'high';
  else riskLevel = 'very-high';

  return { riskLevel, score, recommendations };
}

// Calculate incident rate metrics
export function calculateIncidentRates(
  incidents: number,
  nearMisses: number,
  totalHours: number,
  employees: number
): {
  incidentRate: number; // per 100 employees per year
  nearMissRate: number;
  safetyRatio: number; // near misses to incidents
  ltir: number; // Lost Time Injury Rate
} {
  const hoursPerYear = 2080;
  const totalEmployeeHours = employees * hoursPerYear;

  const incidentRate = (incidents / totalEmployeeHours) * 200000; // OSHA standard
  const nearMissRate = (nearMisses / totalEmployeeHours) * 200000;
  const safetyRatio = incidents > 0 ? nearMisses / incidents : 0;
  
  // Assuming 30% of incidents result in lost time (industry average)
  const lostTimeIncidents = incidents * 0.3;
  const ltir = (lostTimeIncidents / totalEmployeeHours) * 200000;

  return {
    incidentRate: Number(incidentRate.toFixed(2)),
    nearMissRate: Number(nearMissRate.toFixed(2)),
    safetyRatio: Number(safetyRatio.toFixed(1)),
    ltir: Number(ltir.toFixed(2))
  };
}

// Safety training effectiveness assessment
export function assessTrainingEffectiveness(
  trainingHours: number,
  completionRate: number,
  incidentsBefore: number,
  incidentsAfter: number,
  knowledgeScoreBefore: number,
  knowledgeScoreAfter: number
): {
  effectiveness: number; // percentage
  roi: number; // return on investment
  knowledgeImprovement: number;
  incidentReduction: number;
  recommendations: string[];
} {
  const recommendations: string[] = [];

  const knowledgeImprovement = 
    ((knowledgeScoreAfter - knowledgeScoreBefore) / knowledgeScoreBefore) * 100;

  const incidentReduction = incidentsBefore > 0 ? 
    ((incidentsBefore - incidentsAfter) / incidentsBefore) * 100 : 0;

  // Calculate effectiveness based on multiple factors
  let effectiveness = 0;
  effectiveness += completionRate * 0.3; // 30% weight on completion
  effectiveness += Math.min(100, knowledgeImprovement) * 0.4; // 40% weight on knowledge
  effectiveness += Math.min(100, incidentReduction) * 0.3; // 30% weight on incident reduction

  // Calculate ROI (simplified)
  const trainingCost = trainingHours * 50; // $50 per hour average cost
  const incidentCostSavings = (incidentsBefore - incidentsAfter) * 10000; // $10k per incident
  const roi = trainingCost > 0 ? ((incidentCostSavings - trainingCost) / trainingCost) * 100 : 0;

  // Generate recommendations
  if (completionRate < 90) {
    recommendations.push('Improve training participation through scheduling and incentives');
  }
  if (knowledgeImprovement < 20) {
    recommendations.push('Enhance training content and delivery methods');
  }
  if (incidentReduction < 10) {
    recommendations.push('Focus on practical application and behavior change');
  }
  if (roi < 200) {
    recommendations.push('Optimize training cost-effectiveness');
  }

  return {
    effectiveness: Math.round(effectiveness),
    roi: Number(roi.toFixed(1)),
    knowledgeImprovement: Number(knowledgeImprovement.toFixed(1)),
    incidentReduction: Number(incidentReduction.toFixed(1)),
    recommendations
  };
}

// Environmental safety assessment for vertical farms
export function assessEnvironmentalSafety(
  temperature: number, // Celsius
  humidity: number, // percentage
  co2Level: number, // ppm
  lightIntensity: number, // lux
  noiseLevel: number, // dB
  airflow: number // m/s
): {
  overallScore: number;
  riskFactors: string[];
  recommendations: string[];
} {
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Temperature assessment
  if (temperature < 18 || temperature > 26) {
    score -= 15;
    riskFactors.push('Temperature outside comfort zone');
    recommendations.push('Maintain temperature between 18-26°C');
  }

  // Humidity assessment
  if (humidity < 40 || humidity > 70) {
    score -= 10;
    riskFactors.push('Humidity levels may cause discomfort');
    recommendations.push('Maintain humidity between 40-70%');
  }

  // CO2 levels
  if (co2Level > 5000) {
    score -= 25;
    riskFactors.push('Dangerous CO2 levels');
    recommendations.push('Improve ventilation immediately');
  } else if (co2Level > 1000) {
    score -= 10;
    riskFactors.push('Elevated CO2 levels');
    recommendations.push('Increase fresh air ventilation');
  }

  // Light intensity
  if (lightIntensity < 300) {
    score -= 15;
    riskFactors.push('Insufficient lighting for safe work');
    recommendations.push('Increase lighting to minimum 300 lux');
  }

  // Noise levels
  if (noiseLevel > 85) {
    score -= 20;
    riskFactors.push('Noise levels may cause hearing damage');
    recommendations.push('Provide hearing protection and reduce noise sources');
  } else if (noiseLevel > 75) {
    score -= 10;
    riskFactors.push('Elevated noise levels');
    recommendations.push('Monitor noise exposure and consider mitigation');
  }

  // Air flow
  if (airflow < 0.1) {
    score -= 10;
    riskFactors.push('Poor air circulation');
    recommendations.push('Improve air circulation systems');
  }

  return {
    overallScore: Math.max(0, score),
    riskFactors,
    recommendations
  };
}

// PPE compliance assessment
export function assessPPECompliance(
  requiredPPE: string[],
  observedCompliance: Record<string, number>, // percentage compliance per PPE type
  incidentsByPPEType: Record<string, number>
): {
  overallCompliance: number;
  riskAreas: string[];
  costOfNonCompliance: number;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  const riskAreas: string[] = [];

  // Calculate overall compliance
  const totalCompliance = Object.values(observedCompliance).reduce((sum, rate) => sum + rate, 0);
  const overallCompliance = totalCompliance / requiredPPE.length;

  // Identify risk areas
  requiredPPE.forEach(ppe => {
    const compliance = observedCompliance[ppe] || 0;
    const incidents = incidentsByPPEType[ppe] || 0;

    if (compliance < 90) {
      riskAreas.push(ppe);
      recommendations.push(`Improve ${ppe} compliance through training and enforcement`);
    }

    if (incidents > 2) {
      recommendations.push(`Investigate ${ppe} effectiveness and usage patterns`);
    }
  });

  // Estimate cost of non-compliance
  const totalIncidents = Object.values(incidentsByPPEType).reduce((sum, count) => sum + count, 0);
  const costOfNonCompliance = totalIncidents * 15000; // Average cost per incident

  return {
    overallCompliance: Number(overallCompliance.toFixed(1)),
    riskAreas,
    costOfNonCompliance,
    recommendations
  };
}