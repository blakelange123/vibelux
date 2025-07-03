/**
 * AI-Powered Lighting Optimization Engine
 * Provides intelligent suggestions for fixture placement and configuration
 */

import { calculatePPFDGrid, calculatePPFDStats } from './ppfd-calculations';

export interface OptimizationGoal {
  type: 'uniformity' | 'efficiency' | 'coverage' | 'cost';
  weight: number;
}

export interface OptimizationConstraints {
  minPPFD: number;
  maxPPFD: number;
  targetPPFD: number;
  minUniformity: number;
  maxPowerDensity: number; // W/m²
  budget?: number;
}

export interface OptimizationSuggestion {
  type: 'placement' | 'power' | 'spectrum' | 'fixture' | 'spacing' | 'efficiency';
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  implementation: string;
  estimatedImprovement: number; // percentage
}

export interface OptimizationResult {
  suggestions: OptimizationSuggestion[];
  predictedMetrics: {
    avgPPFD: number;
    uniformity: number;
    powerDensity: number;
    efficacy: number;
  };
  score: number; // 0-100
}

/**
 * Analyze current lighting design and generate optimization suggestions
 */
export function optimizeLightingDesign(
  fixtures: any[],
  roomDimensions: { width: number; length: number; height: number },
  constraints: OptimizationConstraints,
  goals: OptimizationGoal[] = [{ type: 'uniformity', weight: 1 }]
): OptimizationResult {
  const suggestions: OptimizationSuggestion[] = [];
  
  // Calculate current metrics
  const fixtureData = fixtures.map(f => ({
    x: (f.x / 100) * roomDimensions.width,
    y: (f.y / 100) * roomDimensions.length,
    z: roomDimensions.height - 0.5,
    ppf: f.model.ppf,
    beamAngle: 120,
    enabled: f.enabled,
    wattage: f.model.wattage
  }));
  
  const ppfdGrid = calculatePPFDGrid(
    fixtureData,
    roomDimensions.width,
    roomDimensions.length,
    1.0,
    30 // Lower resolution for faster calculation
  );
  
  const currentStats = calculatePPFDStats(ppfdGrid);
  const roomArea = roomDimensions.width * roomDimensions.length;
  const totalPower = fixtures.reduce((sum, f) => sum + (f.enabled ? f.model.wattage : 0), 0);
  const powerDensity = totalPower / roomArea;
  
  // Analyze spacing uniformity
  const spacing = analyzeFixtureSpacing(fixtures, roomDimensions);
  if (spacing.cv > 0.2) {
    suggestions.push({
      type: 'spacing',
      priority: 'high',
      description: 'Improve fixture spacing uniformity',
      impact: `Current spacing variation: ${(spacing.cv * 100).toFixed(0)}%`,
      implementation: 'Redistribute fixtures in a uniform grid pattern for better coverage',
      estimatedImprovement: 15
    });
  }
  
  // Check PPFD levels
  if (currentStats.avg < constraints.minPPFD) {
    const deficit = ((constraints.minPPFD - currentStats.avg) / constraints.minPPFD * 100).toFixed(0);
    suggestions.push({
      type: 'power',
      priority: 'high',
      description: 'Increase light intensity',
      impact: `Current average PPFD is ${deficit}% below target`,
      implementation: 'Add more fixtures or increase fixture power',
      estimatedImprovement: Number(deficit)
    });
  } else if (currentStats.avg > constraints.maxPPFD) {
    const excess = ((currentStats.avg - constraints.maxPPFD) / constraints.maxPPFD * 100).toFixed(0);
    suggestions.push({
      type: 'power',
      priority: 'medium',
      description: 'Reduce light intensity to save energy',
      impact: `Current PPFD is ${excess}% above maximum`,
      implementation: 'Dim fixtures or remove some units',
      estimatedImprovement: Number(excess) * 0.5 // Energy savings
    });
  }
  
  // Check uniformity
  if (currentStats.uniformity < constraints.minUniformity) {
    suggestions.push({
      type: 'placement',
      priority: 'high',
      description: 'Improve light uniformity',
      impact: `Current uniformity: ${currentStats.uniformity}, target: ${constraints.minUniformity}`,
      implementation: 'Adjust fixture positions to eliminate dark spots',
      estimatedImprovement: 20
    });
  }
  
  // Check power density
  if (powerDensity > constraints.maxPowerDensity) {
    const excess = ((powerDensity - constraints.maxPowerDensity) / constraints.maxPowerDensity * 100).toFixed(0);
    suggestions.push({
      type: 'efficiency',
      priority: 'medium',
      description: 'Reduce power density',
      impact: `Power density ${excess}% above limit`,
      implementation: 'Use more efficient fixtures or reduce quantity',
      estimatedImprovement: 10
    });
  }
  
  // Spectrum optimization
  const spectrumScore = analyzeSpectrum(fixtures);
  if (spectrumScore < 0.8) {
    suggestions.push({
      type: 'spectrum',
      priority: 'low',
      description: 'Optimize light spectrum',
      impact: 'Current spectrum may not be optimal for plant growth',
      implementation: 'Adjust red:blue ratio to 3:1 for vegetative growth',
      estimatedImprovement: 8
    });
  }
  
  // Calculate optimization score
  const uniformityScore = Math.min(currentStats.uniformity / constraints.minUniformity, 1) * 30;
  const ppfdScore = Math.min(currentStats.avg / constraints.targetPPFD, 1) * 40;
  const efficiencyScore = Math.min(constraints.maxPowerDensity / powerDensity, 1) * 30;
  const totalScore = uniformityScore + ppfdScore + efficiencyScore;
  
  return {
    suggestions: suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }),
    predictedMetrics: {
      avgPPFD: currentStats.avg,
      uniformity: currentStats.uniformity,
      powerDensity: Math.round(powerDensity),
      efficacy: totalPower > 0 ? Number((currentStats.avg * roomArea / totalPower).toFixed(2)) : 0
    },
    score: Math.round(totalScore)
  };
}

/**
 * Analyze fixture spacing uniformity
 */
function analyzeFixtureSpacing(
  fixtures: any[],
  roomDimensions: { width: number; length: number }
): { mean: number; cv: number } {
  if (fixtures.length < 2) return { mean: 0, cv: 0 };
  
  const distances: number[] = [];
  
  // Calculate nearest neighbor distances
  for (let i = 0; i < fixtures.length; i++) {
    let minDistance = Infinity;
    for (let j = 0; j < fixtures.length; j++) {
      if (i !== j) {
        const dx = (fixtures[i].x - fixtures[j].x) * roomDimensions.width / 100;
        const dy = (fixtures[i].y - fixtures[j].y) * roomDimensions.length / 100;
        const distance = Math.sqrt(dx * dx + dy * dy);
        minDistance = Math.min(minDistance, distance);
      }
    }
    if (minDistance < Infinity) {
      distances.push(minDistance);
    }
  }
  
  const mean = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const variance = distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / distances.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean; // Coefficient of variation
  
  return { mean, cv };
}

/**
 * Analyze spectrum quality
 */
function analyzeSpectrum(fixtures: any[]): number {
  const activeFixtures = fixtures.filter(f => f.enabled);
  if (activeFixtures.length === 0) return 0;
  
  // Calculate average spectrum
  const avgSpectrum = activeFixtures.reduce((acc, f) => {
    if (f.model.spectrumData) {
      acc.red += f.model.spectrumData.red;
      acc.blue += f.model.spectrumData.blue;
    }
    return acc;
  }, { red: 0, blue: 0 });
  
  avgSpectrum.red /= activeFixtures.length;
  avgSpectrum.blue /= activeFixtures.length;
  
  // Ideal R:B ratio is around 3:1 for most crops
  const rbRatio = avgSpectrum.red / avgSpectrum.blue;
  const idealRatio = 3;
  
  // Score based on how close to ideal
  const score = 1 - Math.abs(rbRatio - idealRatio) / idealRatio;
  return Math.max(0, Math.min(1, score));
}

/**
 * Generate optimal fixture layout
 */
export function generateOptimalLayout(
  roomDimensions: { width: number; length: number; height: number },
  targetPPFD: number,
  fixtureModel: any
): { x: number; y: number }[] {
  // Calculate coverage area per fixture at mounting height
  const mountingHeight = roomDimensions.height - 0.5;
  const beamAngle = 120; // degrees
  const coverageRadius = mountingHeight * Math.tan((beamAngle / 2) * Math.PI / 180);
  
  // Calculate optimal spacing
  const overlap = 0.15; // 15% overlap for uniformity
  const spacing = coverageRadius * 2 * (1 - overlap);
  
  // Generate grid layout
  const layout: { x: number; y: number }[] = [];
  const cols = Math.ceil(roomDimensions.width / spacing);
  const rows = Math.ceil(roomDimensions.length / spacing);
  
  // Center the grid
  const xOffset = (roomDimensions.width - (cols - 1) * spacing) / 2;
  const yOffset = (roomDimensions.length - (rows - 1) * spacing) / 2;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = (xOffset + col * spacing) / roomDimensions.width * 100;
      const y = (yOffset + row * spacing) / roomDimensions.length * 100;
      layout.push({ x, y });
    }
  }
  
  return layout;
}