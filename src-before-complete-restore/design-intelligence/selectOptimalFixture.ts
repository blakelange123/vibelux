import { DLCFixture } from '@/types/fixtures';

interface FixtureRequirements {
  targetPPFD: number;
  cropType: string;
  growthStage?: string;
  rackDimensions?: { width: number; length: number; height: number };
  coverageArea: number;
  priorities: string[];
  budget?: number;
  electricalLimit?: number;
  environmentType: 'indoor' | 'greenhouse' | 'vertical-farm';
}

interface FixtureScore {
  fixture: DLCFixture;
  scores: {
    efficiency: number;
    spectrum: number;
    coverage: number;
    cost: number;
    heat: number;
    reliability: number;
    total: number;
  };
  reasoning: string[];
}

// Crop-specific spectrum preferences
const cropSpectrumPreferences: Record<string, Record<string, { red: number; blue: number; green: number; farRed: number; white: number }>> = {
  cannabis: {
    flowering: { red: 0.45, blue: 0.15, green: 0.10, farRed: 0.10, white: 0.20 },
    vegetative: { red: 0.35, blue: 0.25, green: 0.10, farRed: 0.05, white: 0.25 },
    motherPlant: { red: 0.30, blue: 0.30, green: 0.10, farRed: 0.05, white: 0.25 }
  },
  lettuce: {
    production: { red: 0.40, blue: 0.20, green: 0.05, farRed: 0.05, white: 0.30 },
    seedling: { red: 0.30, blue: 0.30, green: 0.05, farRed: 0.05, white: 0.30 }
  },
  tomatoes: {
    fruiting: { red: 0.50, blue: 0.15, green: 0.05, farRed: 0.10, white: 0.20 },
    vegetative: { red: 0.35, blue: 0.25, green: 0.10, farRed: 0.05, white: 0.25 }
  },
  microgreens: {
    production: { red: 0.35, blue: 0.25, green: 0.10, farRed: 0.00, white: 0.30 }
  },
  herbs: {
    production: { red: 0.40, blue: 0.20, green: 0.10, farRed: 0.05, white: 0.25 }
  }
};

// Manufacturer reliability scores (based on warranty, support, track record)
const manufacturerReliability: Record<string, number> = {
  'Fluence': 0.95,
  'Philips': 0.95,
  'Gavita': 0.90,
  'California Lightworks': 0.85,
  'Heliospectra': 0.85,
  'Valoya': 0.85,
  'Kind LED': 0.80,
  'Black Dog LED': 0.80,
  'default': 0.75
};

export function selectOptimalFixture(
  fixtures: DLCFixture[], 
  requirements: FixtureRequirements
): FixtureScore[] {
  const scoredFixtures: FixtureScore[] = [];

  fixtures.forEach(fixture => {
    const score: FixtureScore = {
      fixture,
      scores: {
        efficiency: 0,
        spectrum: 0,
        coverage: 0,
        cost: 0,
        heat: 0,
        reliability: 0,
        total: 0
      },
      reasoning: []
    };

    // 1. Efficiency Score (μmol/J)
    const efficacy = fixture.ppf / fixture.wattage;
    if (efficacy >= 3.0) {
      score.scores.efficiency = 1.0;
      score.reasoning.push(`Excellent efficiency at ${efficacy.toFixed(2)} μmol/J`);
    } else if (efficacy >= 2.7) {
      score.scores.efficiency = 0.85;
      score.reasoning.push(`Very good efficiency at ${efficacy.toFixed(2)} μmol/J`);
    } else if (efficacy >= 2.4) {
      score.scores.efficiency = 0.70;
      score.reasoning.push(`Good efficiency at ${efficacy.toFixed(2)} μmol/J`);
    } else {
      score.scores.efficiency = 0.50;
      score.reasoning.push(`Lower efficiency at ${efficacy.toFixed(2)} μmol/J`);
    }

    // 2. Spectrum Score
    score.scores.spectrum = calculateSpectrumScore(fixture, requirements.cropType, requirements.growthStage);
    
    // 3. Coverage Score
    const coverageScore = calculateCoverageScore(fixture, requirements);
    score.scores.coverage = coverageScore.score;
    score.reasoning.push(coverageScore.reason);

    // 4. Cost Score (TCO - Total Cost of Ownership)
    const tcoScore = calculateTCOScore(fixture, requirements);
    score.scores.cost = tcoScore.score;
    score.reasoning.push(tcoScore.reason);

    // 5. Heat Management Score
    const heatScore = calculateHeatScore(fixture, requirements);
    score.scores.heat = heatScore.score;
    score.reasoning.push(heatScore.reason);

    // 6. Reliability Score
    const reliability = manufacturerReliability[fixture.manufacturer] || manufacturerReliability.default;
    score.scores.reliability = reliability;
    score.reasoning.push(`${fixture.manufacturer} reliability: ${(reliability * 100).toFixed(0)}%`);

    // Calculate weighted total based on priorities
    const weights = calculateWeights(requirements.priorities);
    score.scores.total = 
      score.scores.efficiency * weights.efficiency +
      score.scores.spectrum * weights.spectrum +
      score.scores.coverage * weights.coverage +
      score.scores.cost * weights.cost +
      score.scores.heat * weights.heat +
      score.scores.reliability * weights.reliability;

    scoredFixtures.push(score);
  });

  // Sort by total score
  return scoredFixtures.sort((a, b) => b.scores.total - a.scores.total);
}

function calculateSpectrumScore(fixture: DLCFixture, cropType: string, growthStage?: string): number {
  // If no spectrum data, give neutral score
  if (!fixture.spectrum) return 0.7;

  const stage = growthStage || 'production';
  const preferences = cropSpectrumPreferences[cropType]?.[stage] || 
                     cropSpectrumPreferences[cropType]?.['production'] ||
                     { red: 0.40, blue: 0.20, green: 0.10, farRed: 0.05, white: 0.25 };

  // Calculate spectrum match score
  let matchScore = 0;
  let totalWeight = 0;

  Object.entries(preferences).forEach(([color, targetRatio]) => {
    const actualRatio = fixture.spectrum?.[color as keyof typeof fixture.spectrum] || 0;
    const difference = Math.abs(actualRatio - targetRatio);
    const colorScore = Math.max(0, 1 - (difference * 2)); // Penalty for deviation
    matchScore += colorScore * targetRatio;
    totalWeight += targetRatio;
  });

  return totalWeight > 0 ? matchScore / totalWeight : 0.7;
}

function calculateCoverageScore(
  fixture: DLCFixture, 
  requirements: FixtureRequirements
): { score: number; reason: string } {
  // Estimate coverage area based on mounting height and beam angle
  const typicalMountHeight = requirements.rackDimensions?.height || 2.5; // meters
  const beamAngle = fixture.beamAngle || 120; // degrees
  const coverageRadius = typicalMountHeight * Math.tan((beamAngle / 2) * Math.PI / 180);
  const fixtureFootprint = Math.PI * coverageRadius * coverageRadius;

  // For vertical farms, narrow beam angles are better
  if (requirements.environmentType === 'vertical-farm') {
    if (beamAngle <= 90) {
      return { score: 1.0, reason: 'Ideal narrow beam for vertical farming' };
    } else if (beamAngle <= 120) {
      return { score: 0.8, reason: 'Good beam angle for vertical farming' };
    } else {
      return { score: 0.6, reason: 'Wide beam less ideal for vertical farming' };
    }
  }

  // For greenhouses, wider coverage is often better
  if (requirements.environmentType === 'greenhouse') {
    if (beamAngle >= 120) {
      return { score: 1.0, reason: 'Excellent wide coverage for greenhouse' };
    } else if (beamAngle >= 90) {
      return { score: 0.8, reason: 'Good coverage for greenhouse' };
    } else {
      return { score: 0.6, reason: 'Narrow beam requires more fixtures' };
    }
  }

  // Default indoor scoring
  const coverageRatio = fixtureFootprint / requirements.coverageArea;
  if (coverageRatio >= 0.8 && coverageRatio <= 1.2) {
    return { score: 1.0, reason: 'Optimal coverage for space' };
  } else if (coverageRatio >= 0.6 && coverageRatio <= 1.5) {
    return { score: 0.8, reason: 'Good coverage match' };
  } else {
    return { score: 0.6, reason: 'Coverage mismatch - may need adjustment' };
  }
}

function calculateTCOScore(
  fixture: DLCFixture,
  requirements: FixtureRequirements
): { score: number; reason: string } {
  // Estimate 5-year TCO
  const fixturePrice = fixture.price || estimatePrice(fixture);
  const energyCost = 0.12; // $/kWh average
  const hoursPerYear = 365 * (requirements.cropType === 'cannabis' ? 12 : 16);
  const annualEnergyCost = (fixture.wattage / 1000) * hoursPerYear * energyCost;
  const fiveYearTCO = fixturePrice + (annualEnergyCost * 5);

  // Maintenance costs based on reliability
  const maintenanceFactor = 1.0 + (1.0 - (manufacturerReliability[fixture.manufacturer] || 0.75));
  const adjustedTCO = fiveYearTCO * maintenanceFactor;

  // Score based on $/PPF output over 5 years
  const costPerPPF = adjustedTCO / fixture.ppf;

  if (costPerPPF < 1.0) {
    return { score: 1.0, reason: `Excellent value at $${costPerPPF.toFixed(2)}/PPF over 5 years` };
  } else if (costPerPPF < 1.5) {
    return { score: 0.85, reason: `Good value at $${costPerPPF.toFixed(2)}/PPF over 5 years` };
  } else if (costPerPPF < 2.0) {
    return { score: 0.70, reason: `Fair value at $${costPerPPF.toFixed(2)}/PPF over 5 years` };
  } else {
    return { score: 0.50, reason: `Higher cost at $${costPerPPF.toFixed(2)}/PPF over 5 years` };
  }
}

function calculateHeatScore(
  fixture: DLCFixture,
  requirements: FixtureRequirements
): { score: number; reason: string } {
  // BTU/hr = Watts × 3.412
  const heatOutput = fixture.wattage * 3.412;
  const heatPerPPF = heatOutput / fixture.ppf;

  // Lower heat per PPF is better
  if (heatPerPPF < 3.0) {
    return { score: 1.0, reason: 'Excellent heat management' };
  } else if (heatPerPPF < 3.5) {
    return { score: 0.85, reason: 'Good heat management' };
  } else if (heatPerPPF < 4.0) {
    return { score: 0.70, reason: 'Average heat output' };
  } else {
    return { score: 0.50, reason: 'Higher heat load requires more cooling' };
  }
}

function calculateWeights(priorities: string[]): Record<string, number> {
  const baseWeights = {
    efficiency: 0.20,
    spectrum: 0.20,
    coverage: 0.15,
    cost: 0.20,
    heat: 0.15,
    reliability: 0.10
  };

  // Adjust weights based on priorities
  priorities.forEach(priority => {
    switch (priority) {
      case 'efficiency':
        baseWeights.efficiency *= 1.5;
        baseWeights.cost *= 0.8;
        break;
      case 'yield':
        baseWeights.spectrum *= 1.5;
        baseWeights.coverage *= 1.3;
        break;
      case 'cost':
        baseWeights.cost *= 1.5;
        baseWeights.reliability *= 0.8;
        break;
      case 'quality':
        baseWeights.spectrum *= 1.4;
        baseWeights.reliability *= 1.2;
        break;
      case 'uniformity':
        baseWeights.coverage *= 1.5;
        break;
    }
  });

  // Normalize weights to sum to 1
  const total = Object.values(baseWeights).reduce((sum, w) => sum + w, 0);
  Object.keys(baseWeights).forEach(key => {
    baseWeights[key as keyof typeof baseWeights] /= total;
  });

  return baseWeights;
}

function estimatePrice(fixture: DLCFixture): number {
  // Rough estimation based on wattage and efficiency
  const basePrice = fixture.wattage * 1.5; // $1.50 per watt baseline
  const efficiencyMultiplier = (fixture.ppf / fixture.wattage) / 2.5; // Adjust for efficiency
  const brandMultiplier = manufacturerReliability[fixture.manufacturer] || 0.75;
  
  return basePrice * efficiencyMultiplier * (0.5 + brandMultiplier);
}