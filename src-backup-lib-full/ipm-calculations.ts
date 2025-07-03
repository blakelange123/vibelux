// IPM (Integrated Pest Management) calculations and risk assessments

export interface PestRiskFactors {
  temperature: number; // Celsius
  humidity: number; // percentage
  leafWetness: number; // hours per day
  plantDensity: number; // plants per m²
  airCirculation: number; // m/s
  lightIntensity: number; // µmol/m²/s
  co2Level: number; // ppm
  plantStress: number; // 0-10 scale
  previousInfections: number; // number in last 30 days
  adjacentInfections: boolean; // nearby infected areas
}

export interface PestProfile {
  id: string;
  name: string;
  category: 'insect' | 'fungal' | 'bacterial' | 'viral' | 'nematode' | 'mite';
  optimalTemp: { min: number; max: number };
  optimalHumidity: { min: number; max: number };
  generationTime: number; // days
  dispersalRate: number; // 0-10 scale
  hostRange: string[];
  economicThreshold: number; // pests per plant or % damage
  seasonalPattern: string[];
}

export interface TreatmentOption {
  id: string;
  name: string;
  type: 'biological' | 'chemical' | 'cultural' | 'mechanical' | 'physical';
  targetPests: string[];
  effectiveness: number; // 0-100%
  speed: number; // days to effect
  persistence: number; // days effective
  cost: number; // $ per application
  preharvest_interval: number; // days
  resistanceRisk: number; // 0-10 scale
  beneficialImpact: number; // 0-10 scale (higher = more harmful)
  applicationRequirements: string[];
}

export interface MonitoringProtocol {
  method: 'visual' | 'trap' | 'sensor' | 'molecular' | 'pheromone';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  location: string;
  threshold: number;
  actionLevel: number;
  equipment: string[];
  dataPoints: string[];
}

// Calculate pest risk score based on environmental conditions
export function calculatePestRisk(
  pestProfile: PestProfile,
  conditions: PestRiskFactors
): {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: Array<{ factor: string; impact: number; description: string }>;
  recommendations: string[];
} {
  let riskScore = 0;
  const factors: Array<{ factor: string; impact: number; description: string }> = [];
  const recommendations: string[] = [];

  // Temperature factor
  const tempOptimal = (pestProfile.optimalTemp.min + pestProfile.optimalTemp.max) / 2;
  const tempDeviation = Math.abs(conditions.temperature - tempOptimal);
  const tempRange = pestProfile.optimalTemp.max - pestProfile.optimalTemp.min;
  
  let tempRisk = 0;
  if (conditions.temperature >= pestProfile.optimalTemp.min && conditions.temperature <= pestProfile.optimalTemp.max) {
    tempRisk = 30 - (tempDeviation / tempRange) * 30; // Max 30 points
  } else {
    tempRisk = Math.max(0, 15 - tempDeviation * 2); // Reduced risk outside optimal range
  }
  
  riskScore += tempRisk;
  factors.push({
    factor: 'Temperature',
    impact: tempRisk,
    description: `Current ${conditions.temperature}°C, optimal ${pestProfile.optimalTemp.min}-${pestProfile.optimalTemp.max}°C`
  });

  // Humidity factor
  const humidityOptimal = (pestProfile.optimalHumidity.min + pestProfile.optimalHumidity.max) / 2;
  const humidityDeviation = Math.abs(conditions.humidity - humidityOptimal);
  const humidityRange = pestProfile.optimalHumidity.max - pestProfile.optimalHumidity.min;
  
  let humidityRisk = 0;
  if (conditions.humidity >= pestProfile.optimalHumidity.min && conditions.humidity <= pestProfile.optimalHumidity.max) {
    humidityRisk = 25 - (humidityDeviation / humidityRange) * 25; // Max 25 points
  } else {
    humidityRisk = Math.max(0, 10 - humidityDeviation * 0.2);
  }
  
  riskScore += humidityRisk;
  factors.push({
    factor: 'Humidity',
    impact: humidityRisk,
    description: `Current ${conditions.humidity}%, optimal ${pestProfile.optimalHumidity.min}-${pestProfile.optimalHumidity.max}%`
  });

  // Plant density factor
  let densityRisk = 0;
  if (conditions.plantDensity > 40) {
    densityRisk = 15;
    recommendations.push('Consider reducing plant density to improve air circulation');
  } else if (conditions.plantDensity > 30) {
    densityRisk = 10;
  } else {
    densityRisk = 5;
  }
  
  riskScore += densityRisk;
  factors.push({
    factor: 'Plant Density',
    impact: densityRisk,
    description: `${conditions.plantDensity} plants/m²`
  });

  // Air circulation factor
  let airflowRisk = 0;
  if (conditions.airCirculation < 0.3) {
    airflowRisk = 15;
    recommendations.push('Increase air circulation to reduce pest-favorable microclimates');
  } else if (conditions.airCirculation < 0.5) {
    airflowRisk = 10;
  } else {
    airflowRisk = 2;
  }
  
  riskScore += airflowRisk;
  factors.push({
    factor: 'Air Circulation',
    impact: airflowRisk,
    description: `${conditions.airCirculation} m/s`
  });

  // Plant stress factor
  const stressRisk = conditions.plantStress * 1.5; // Max 15 points
  riskScore += stressRisk;
  factors.push({
    factor: 'Plant Stress',
    impact: stressRisk,
    description: `Stress level ${conditions.plantStress}/10`
  });

  if (conditions.plantStress > 6) {
    recommendations.push('Address plant stress factors (nutrition, watering, environment)');
  }

  // Previous infections factor
  const infectionRisk = Math.min(conditions.previousInfections * 2, 10); // Max 10 points
  riskScore += infectionRisk;
  factors.push({
    factor: 'Previous Infections',
    impact: infectionRisk,
    description: `${conditions.previousInfections} infections in last 30 days`
  });

  // Adjacent infections factor
  if (conditions.adjacentInfections) {
    riskScore += 5;
    factors.push({
      factor: 'Adjacent Infections',
      impact: 5,
      description: 'Infected areas nearby increase risk'
    });
    recommendations.push('Implement quarantine protocols for affected areas');
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (riskScore < 25) riskLevel = 'low';
  else if (riskScore < 50) riskLevel = 'medium';
  else if (riskScore < 75) riskLevel = 'high';
  else riskLevel = 'critical';

  // Add recommendations based on risk level
  if (riskLevel === 'high' || riskLevel === 'critical') {
    recommendations.push('Increase monitoring frequency');
    recommendations.push('Prepare treatment options');
  }
  if (riskLevel === 'critical') {
    recommendations.push('Consider immediate preventive treatment');
    recommendations.push('Implement emergency protocols');
  }

  return {
    riskScore: Math.min(100, Math.round(riskScore)),
    riskLevel,
    factors,
    recommendations
  };
}

// Calculate treatment effectiveness and selection
export function selectOptimalTreatment(
  pestId: string,
  severity: 'trace' | 'light' | 'moderate' | 'heavy',
  plantStage: string,
  previousTreatments: string[],
  sustainabilityPreference: 'biological' | 'integrated' | 'conventional'
): {
  recommendedTreatments: Array<{
    treatment: TreatmentOption;
    score: number;
    rationale: string[];
  }>;
  strategy: string;
  timing: string;
  precautions: string[];
} {
  // Sample treatment options (would be loaded from database)
  const treatments: TreatmentOption[] = [
    {
      id: 'ladybugs',
      name: 'Ladybugs (Hippodamia convergens)',
      type: 'biological',
      targetPests: ['aphids'],
      effectiveness: 85,
      speed: 3,
      persistence: 14,
      cost: 150,
      preharvest_interval: 0,
      resistanceRisk: 1,
      beneficialImpact: 1,
      applicationRequirements: ['Release during evening', 'Minimum temperature 18°C']
    },
    {
      id: 'predatory_mites',
      name: 'Predatory Mites (Phytoseiulus persimilis)',
      type: 'biological',
      targetPests: ['spider_mites'],
      effectiveness: 90,
      speed: 5,
      persistence: 21,
      cost: 200,
      preharvest_interval: 0,
      resistanceRisk: 1,
      beneficialImpact: 1,
      applicationRequirements: ['Humidity >60%', 'Temperature 20-26°C']
    },
    {
      id: 'insecticidal_soap',
      name: 'Insecticidal Soap',
      type: 'chemical',
      targetPests: ['aphids', 'thrips', 'spider_mites'],
      effectiveness: 75,
      speed: 1,
      persistence: 3,
      cost: 50,
      preharvest_interval: 1,
      resistanceRisk: 3,
      beneficialImpact: 4,
      applicationRequirements: ['Apply to underside of leaves', 'Avoid during hot conditions']
    },
    {
      id: 'neem_oil',
      name: 'Neem Oil',
      type: 'chemical',
      targetPests: ['aphids', 'thrips', 'powdery_mildew'],
      effectiveness: 70,
      speed: 2,
      persistence: 7,
      cost: 75,
      preharvest_interval: 1,
      resistanceRisk: 2,
      beneficialImpact: 3,
      applicationRequirements: ['Apply during evening', 'Test on small area first']
    }
  ];

  const applicableTreatments = treatments.filter(t => t.targetPests.includes(pestId));
  const scoredTreatments = applicableTreatments.map(treatment => {
    let score = 0;
    const rationale: string[] = [];

    // Effectiveness score
    score += treatment.effectiveness * 0.3;
    rationale.push(`${treatment.effectiveness}% effectiveness`);

    // Speed score (faster is better for heavy infestations)
    const speedScore = severity === 'heavy' ? (10 - treatment.speed) * 5 : (10 - treatment.speed) * 2;
    score += speedScore;
    if (treatment.speed <= 2) rationale.push('Fast acting');

    // Sustainability preference
    if (sustainabilityPreference === 'biological' && treatment.type === 'biological') {
      score += 20;
      rationale.push('Preferred biological control');
    } else if (sustainabilityPreference === 'integrated') {
      if (treatment.type === 'biological') score += 15;
      else if (treatment.beneficialImpact <= 3) score += 10;
    }

    // Resistance risk (lower is better)
    score += (10 - treatment.resistanceRisk) * 2;
    if (treatment.resistanceRisk <= 2) rationale.push('Low resistance risk');

    // Previous treatment consideration
    if (previousTreatments.includes(treatment.id)) {
      score -= 15;
      rationale.push('Recently used - rotation recommended');
    }

    // Plant stage consideration
    if (plantStage === 'harvest' && treatment.preharvest_interval > 3) {
      score -= 20;
      rationale.push('Long preharvest interval');
    }

    // Cost consideration
    if (treatment.cost <= 100) {
      score += 5;
      rationale.push('Cost effective');
    }

    return {
      treatment,
      score: Math.round(score),
      rationale
    };
  });

  // Sort by score
  const recommendedTreatments = scoredTreatments.sort((a, b) => b.score - a.score);

  // Determine strategy
  let strategy = '';
  if (severity === 'trace' || severity === 'light') {
    strategy = 'Preventive approach with biological controls and cultural practices';
  } else if (severity === 'moderate') {
    strategy = 'Integrated approach combining biological and low-impact chemical controls';
  } else {
    strategy = 'Immediate intervention with fastest effective treatment available';
  }

  // Determine timing
  let timing = '';
  if (severity === 'heavy') {
    timing = 'Immediate application required';
  } else {
    timing = 'Apply within 24-48 hours during optimal conditions';
  }

  // Precautions
  const precautions = [
    'Test treatment on small area before full application',
    'Monitor weather conditions and avoid application before rain',
    'Wear appropriate protective equipment',
    'Document treatment for resistance management',
    'Plan follow-up monitoring'
  ];

  if (plantStage === 'harvest') {
    precautions.push('Verify preharvest interval compliance');
  }

  return {
    recommendedTreatments: recommendedTreatments.slice(0, 3),
    strategy,
    timing,
    precautions
  };
}

// Economic threshold calculations
export function calculateEconomicThreshold(
  pestDensity: number,
  cropValue: number, // $ per plant or kg
  treatmentCost: number,
  yieldLoss: number, // % loss per pest unit
  marketPrice: number // $ per kg
): {
  threshold: number;
  actionRequired: boolean;
  potentialLoss: number;
  treatmentBenefit: number;
  recommendation: string;
} {
  // Calculate potential yield loss
  const potentialYieldLoss = (pestDensity * yieldLoss) / 100;
  const potentialLoss = potentialYieldLoss * cropValue * marketPrice;

  // Calculate treatment benefit
  const treatmentBenefit = potentialLoss - treatmentCost;

  // Economic threshold = Treatment cost / (Crop value × Market price × Yield loss per pest)
  const threshold = treatmentCost / (cropValue * marketPrice * (yieldLoss / 100));

  const actionRequired = pestDensity >= threshold;

  let recommendation = '';
  if (actionRequired) {
    if (treatmentBenefit > treatmentCost * 2) {
      recommendation = 'Immediate treatment strongly recommended - high economic benefit';
    } else if (treatmentBenefit > 0) {
      recommendation = 'Treatment recommended - positive economic return';
    } else {
      recommendation = 'Monitor closely - treatment may not be economically justified';
    }
  } else {
    recommendation = 'Continue monitoring - below economic threshold';
  }

  return {
    threshold: Number(threshold.toFixed(2)),
    actionRequired,
    potentialLoss: Number(potentialLoss.toFixed(2)),
    treatmentBenefit: Number(treatmentBenefit.toFixed(2)),
    recommendation
  };
}

// IPM program effectiveness assessment
export function assessIPMEffectiveness(
  detectionRate: number, // detections per week
  treatmentSuccessRate: number, // % successful treatments
  costPerDetection: number,
  preventionScore: number, // 0-100
  resistanceIncidents: number,
  beneficialImpact: number // 0-10, lower is better
): {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
} {
  let score = 100;
  const strengths: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];

  // Detection rate assessment
  if (detectionRate < 1) {
    strengths.push('Low pest pressure indicates good prevention');
  } else if (detectionRate > 3) {
    score -= 20;
    improvements.push('High detection rate suggests prevention gaps');
    recommendations.push('Review and strengthen preventive measures');
  }

  // Treatment success rate
  if (treatmentSuccessRate >= 90) {
    strengths.push('Excellent treatment success rate');
  } else if (treatmentSuccessRate >= 80) {
    strengths.push('Good treatment effectiveness');
  } else {
    score -= 25;
    improvements.push('Low treatment success rate');
    recommendations.push('Review treatment selection and application methods');
  }

  // Cost effectiveness
  if (costPerDetection <= 50) {
    strengths.push('Cost-effective detection and treatment');
  } else if (costPerDetection > 100) {
    score -= 15;
    improvements.push('High cost per detection');
    recommendations.push('Optimize monitoring protocols and treatment selection');
  }

  // Prevention score
  if (preventionScore >= 85) {
    strengths.push('Strong preventive measures in place');
  } else if (preventionScore < 70) {
    score -= 20;
    improvements.push('Weak prevention program');
    recommendations.push('Strengthen environmental controls and cultural practices');
  }

  // Resistance management
  if (resistanceIncidents === 0) {
    strengths.push('No resistance issues detected');
  } else {
    score -= resistanceIncidents * 10;
    improvements.push('Resistance management concerns');
    recommendations.push('Implement strict rotation protocols and resistance monitoring');
  }

  // Beneficial impact
  if (beneficialImpact <= 3) {
    strengths.push('Low impact on beneficial organisms');
  } else if (beneficialImpact > 6) {
    score -= 15;
    improvements.push('High impact on beneficial organisms');
    recommendations.push('Shift toward more selective and biological treatments');
  }

  return {
    overallScore: Math.max(0, score),
    strengths,
    improvements,
    recommendations
  };
}

// Generate monitoring schedule based on risk factors
export function generateMonitoringSchedule(
  cropType: string,
  riskLevel: 'low' | 'medium' | 'high' | 'critical',
  seasonalFactors: string[],
  previousHistory: string[]
): MonitoringProtocol[] {
  const baseProtocols: MonitoringProtocol[] = [];

  // Visual inspection frequency based on risk
  let visualFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' = 'weekly';
  if (riskLevel === 'critical') visualFrequency = 'daily';
  else if (riskLevel === 'high') visualFrequency = 'daily';
  else if (riskLevel === 'medium') visualFrequency = 'weekly';
  else visualFrequency = 'biweekly';

  baseProtocols.push({
    method: 'visual',
    frequency: visualFrequency,
    location: 'All growing areas',
    threshold: 1, // 1 pest per plant
    actionLevel: 5, // 5 pests per plant
    equipment: ['Hand lens', 'Flashlight', 'Recording sheets'],
    dataPoints: ['Pest count', 'Life stage', 'Location', 'Plant condition']
  });

  // Sticky traps
  baseProtocols.push({
    method: 'trap',
    frequency: 'weekly',
    location: 'Strategic points throughout facility',
    threshold: 10, // 10 insects per trap per week
    actionLevel: 50,
    equipment: ['Yellow sticky traps', 'Blue sticky traps', 'Magnifying glass'],
    dataPoints: ['Trap counts', 'Species identification', 'Trap location', 'Weather conditions']
  });

  // Environmental monitoring
  baseProtocols.push({
    method: 'sensor',
    frequency: 'daily',
    location: 'All growing areas',
    threshold: 0, // Continuous monitoring
    actionLevel: 0,
    equipment: ['Temperature sensors', 'Humidity sensors', 'Data loggers'],
    dataPoints: ['Temperature', 'Humidity', 'Leaf wetness', 'Air circulation']
  });

  // High-risk additions
  if (riskLevel === 'high' || riskLevel === 'critical') {
    baseProtocols.push({
      method: 'pheromone',
      frequency: 'weekly',
      location: 'High-risk areas',
      threshold: 5,
      actionLevel: 20,
      equipment: ['Pheromone traps', 'Lures'],
      dataPoints: ['Trap counts', 'Male moth activity', 'Flight patterns']
    });
  }

  return baseProtocols;
}