import type { Tier } from '@/components/MultiLayerCanopyPanel';

export interface FixtureAssignment {
  fixtureId: string;
  assignedTiers: string[];
  mountingHeight: number; // Height of fixture above ground
  intensity: number; // PPF output
  beamAngle: number;
  position: { x: number; y: number };
}

export interface TierLightingAnalysis {
  tierId: string;
  tierName: string;
  benchHeight: number;
  canopyHeight: number;
  targetPPFD: number;
  actualPPFD: number;
  uniformity: number;
  coveragePercent: number;
  ppfReceived: number;
  shadowingFactor: number; // How much light is blocked by upper tiers
  energyEfficiency: number; // PPFD per watt
  recommendedFixtures: number;
  lightingGaps: Array<{ x: number; y: number; deficitPPFD: number }>;
}

export interface MultiTierLightingResult {
  tiers: TierLightingAnalysis[];
  totalEnergyConsumption: number;
  overallEfficiency: number;
  systemUniformity: number;
  recommendations: string[];
  fixturePlacements: Array<{
    position: { x: number; y: number; z: number };
    targetTiers: string[];
    intensity: number;
    beamAngle: number;
  }>;
}

/**
 * Get current number of fixtures assigned to a tier
 */
function getCurrentFixtureCount(tierId: string, fixtures: FixtureAssignment[]): number {
  return fixtures.filter(f => f.assignedTiers.includes(tierId)).length;
}

/**
 * Get total wattage of fixtures assigned to a tier
 */
function getCurrentFixtureWattage(tierId: string, fixtures: FixtureAssignment[]): number {
  return fixtures
    .filter(f => f.assignedTiers.includes(tierId))
    .reduce((sum, f) => sum + (f.intensity / 2.5), 0); // Convert PPF to watts
}

/**
 * Calculate light distribution and shadowing effects for multi-tier systems
 */
export function calculateMultiTierLighting(
  tiers: Tier[],
  fixtures: FixtureAssignment[],
  roomDimensions: { width: number; height: number; depth: number },
  gridResolution: number = 50
): MultiTierLightingResult {
  // Sort tiers from top to bottom for shadowing calculations
  const sortedTiers = [...tiers].sort((a, b) => b.height - a.height);
  
  const tierAnalyses: TierLightingAnalysis[] = [];
  const recommendations: string[] = [];

  // Calculate lighting for each tier
  for (const tier of sortedTiers) {
    const tierAnalysis = calculateTierLighting(
      tier,
      fixtures,
      sortedTiers,
      roomDimensions,
      gridResolution
    );
    tierAnalyses.push(tierAnalysis);

    // Generate recommendations for this tier
    if (tierAnalysis.actualPPFD < tier.targetPPFD * 0.8) {
      recommendations.push(
        `${tier.name}: Increase lighting by ${Math.ceil(tierAnalysis.recommendedFixtures - getCurrentFixtureCount(tier.id, fixtures))} fixtures`
      );
    }

    if (tierAnalysis.uniformity < 0.7) {
      recommendations.push(
        `${tier.name}: Poor uniformity (${(tierAnalysis.uniformity * 100).toFixed(0)}%). Consider repositioning fixtures.`
      );
    }

    if (tierAnalysis.shadowingFactor > 0.3) {
      recommendations.push(
        `${tier.name}: Significant shadowing from upper tiers (${(tierAnalysis.shadowingFactor * 100).toFixed(0)}% light loss)`
      );
    }
  }

  // Calculate system-wide metrics
  const totalEnergyConsumption = fixtures.reduce((sum, fixture) => {
    // Assume 2.5 μmol/J efficiency and convert PPF to watts
    return sum + (fixture.intensity / 2.5);
  }, 0);

  const totalPPFDelivered = tierAnalyses.reduce((sum, tier) => sum + tier.ppfReceived, 0);
  const overallEfficiency = totalPPFDelivered / Math.max(totalEnergyConsumption, 1);

  const systemUniformity = tierAnalyses.reduce((sum, tier) => sum + tier.uniformity, 0) / tierAnalyses.length;

  // Generate optimal fixture placements
  const fixturePlacements = generateOptimalFixturePlacements(
    sortedTiers,
    roomDimensions
  );

  return {
    tiers: tierAnalyses,
    totalEnergyConsumption,
    overallEfficiency,
    systemUniformity,
    recommendations,
    fixturePlacements
  };
}

/**
 * Calculate lighting analysis for a single tier considering shadowing
 */
function calculateTierLighting(
  tier: Tier,
  fixtures: FixtureAssignment[],
  allTiers: Tier[],
  roomDimensions: { width: number; height: number; depth: number },
  gridResolution: number
): TierLightingAnalysis {
  const grid: number[][] = [];
  const tiersAbove = allTiers.filter(t => t.height > tier.height);
  
  // Create PPFD grid for this tier
  for (let y = 0; y < gridResolution; y++) {
    const row: number[] = [];
    for (let x = 0; x < gridResolution; x++) {
      const worldX = (x / gridResolution) * roomDimensions.width;
      const worldY = (y / gridResolution) * roomDimensions.height;
      
      let totalPPFD = 0;
      let shadowingFactor = 0;
      
      // Calculate contribution from each fixture
      for (const fixture of fixtures) {
        if (fixture.assignedTiers.includes(tier.id)) {
          const distance = Math.sqrt(
            Math.pow(worldX - fixture.position.x, 2) +
            Math.pow(worldY - fixture.position.y, 2) +
            Math.pow((tier.height + tier.canopyHeight/24) - fixture.mountingHeight, 2)
          );
          
          // Calculate base PPFD using inverse square law with beam angle consideration
          const beamRadius = Math.tan((fixture.beamAngle * Math.PI / 180) / 2) * fixture.mountingHeight;
          const beamFactor = Math.exp(-Math.pow(distance / beamRadius, 2));
          const basePPFD = (fixture.intensity * beamFactor) / Math.max(Math.pow(distance, 2), 1);
          
          // Calculate shadowing from upper tiers
          const shadows = calculateShadowing(
            { x: worldX, y: worldY, z: tier.height + tier.canopyHeight/24 },
            fixture,
            tiersAbove
          );
          
          shadowingFactor = Math.max(shadowingFactor, shadows.shadowFactor);
          totalPPFD += basePPFD * (1 - shadows.shadowFactor);
        }
      }
      
      row.push(totalPPFD);
    }
    grid.push(row);
  }
  
  // Calculate metrics from grid
  const flatGrid = grid.flat();
  const actualPPFD = flatGrid.reduce((sum, val) => sum + val, 0) / flatGrid.length;
  const minPPFD = Math.min(...flatGrid);
  const maxPPFD = Math.max(...flatGrid);
  const uniformity = maxPPFD > 0 ? minPPFD / maxPPFD : 0;
  
  const targetThreshold = tier.targetPPFD * 0.8;
  const coveragePercent = flatGrid.filter(val => val >= targetThreshold).length / flatGrid.length;
  
  // Calculate total PPF received by this tier
  const tierArea = tier.benchDepth * roomDimensions.width;
  const ppfReceived = actualPPFD * tierArea * 0.092903; // Convert ft² to m²
  
  // Estimate required fixtures
  const deficitPPFD = Math.max(0, tier.targetPPFD - actualPPFD);
  const recommendedFixtures = Math.ceil((deficitPPFD * tierArea * 0.092903) / 1600); // Assuming 1600 PPF per fixture
  
  // Find lighting gaps
  const lightingGaps: Array<{ x: number; y: number; deficitPPFD: number }> = [];
  for (let y = 0; y < gridResolution; y += 5) {
    for (let x = 0; x < gridResolution; x += 5) {
      if (grid[y][x] < targetThreshold) {
        lightingGaps.push({
          x: (x / gridResolution) * roomDimensions.width,
          y: (y / gridResolution) * roomDimensions.height,
          deficitPPFD: targetThreshold - grid[y][x]
        });
      }
    }
  }
  
  const averageShadowing = flatGrid.reduce((sum, val, idx) => {
    const maxPossible = calculateMaxPossiblePPFD(
      idx % gridResolution,
      Math.floor(idx / gridResolution),
      fixtures.filter(f => f.assignedTiers.includes(tier.id)),
      tier,
      roomDimensions,
      gridResolution
    );
    return sum + (maxPossible > 0 ? 1 - (val / maxPossible) : 0);
  }, 0) / flatGrid.length;
  
  return {
    tierId: tier.id,
    tierName: tier.name,
    benchHeight: tier.height,
    canopyHeight: tier.canopyHeight,
    targetPPFD: tier.targetPPFD,
    actualPPFD,
    uniformity,
    coveragePercent,
    ppfReceived,
    shadowingFactor: averageShadowing,
    energyEfficiency: actualPPFD / Math.max(getCurrentFixtureWattage(tier.id, fixtures), 1),
    recommendedFixtures,
    lightingGaps
  };
}

/**
 * Calculate shadowing effects from upper tiers
 */
function calculateShadowing(
  point: { x: number; y: number; z: number },
  fixture: FixtureAssignment,
  upperTiers: Tier[]
): { shadowFactor: number; blockedBy: string[] } {
  let maxShadowFactor = 0;
  const blockedBy: string[] = [];
  
  for (const upperTier of upperTiers) {
    // Check if light ray from fixture to point passes through this upper tier
    const rayDirection = {
      x: point.x - fixture.position.x,
      y: point.y - fixture.position.y,
      z: point.z - fixture.mountingHeight
    };
    
    const rayLength = Math.sqrt(
      rayDirection.x * rayDirection.x +
      rayDirection.y * rayDirection.y +
      rayDirection.z * rayDirection.z
    );
    
    if (rayLength === 0) continue;
    
    // Normalize ray direction
    rayDirection.x /= rayLength;
    rayDirection.y /= rayLength;
    rayDirection.z /= rayLength;
    
    // Check intersection with upper tier plane
    const tierZ = upperTier.height + upperTier.canopyHeight/12;
    if (tierZ > point.z && tierZ < fixture.mountingHeight) {
      const t = (tierZ - point.z) / rayDirection.z;
      const intersectionX = point.x + rayDirection.x * t;
      const intersectionY = point.y + rayDirection.y * t;
      
      // Check if intersection is within the tier bounds
      const tierBounds = getTierBounds(upperTier);
      if (intersectionX >= tierBounds.minX && intersectionX <= tierBounds.maxX &&
          intersectionY >= tierBounds.minY && intersectionY <= tierBounds.maxY) {
        
        // Calculate shadow factor based on canopy density and transmittance
        const transmittance = upperTier.transmittance ?? 0.1; // Default 10% transmittance
        const canopyDensity = upperTier.canopyDensity ?? 80; // Default 80% density
        const shadowFactor = (1 - transmittance) * (canopyDensity / 100);
        if (shadowFactor > maxShadowFactor) {
          maxShadowFactor = shadowFactor;
          blockedBy.push(upperTier.name);
        }
      }
    }
  }
  
  return { shadowFactor: maxShadowFactor, blockedBy };
}

/**
 * Get the 2D bounds of a tier in the room
 */
function getTierBounds(tier: Tier): { minX: number; maxX: number; minY: number; maxY: number } {
  // For now, assume tier spans the full width of the room
  // In a real implementation, you might have more specific tier positioning
  return {
    minX: 0,
    maxX: 10, // This should come from room dimensions
    minY: 0,
    maxY: tier.benchDepth
  };
}

/**
 * Calculate maximum possible PPFD at a point without shadowing
 */
function calculateMaxPossiblePPFD(
  gridX: number,
  gridY: number,
  fixtures: FixtureAssignment[],
  tier: Tier,
  roomDimensions: { width: number; height: number; depth: number },
  gridResolution: number
): number {
  const worldX = (gridX / gridResolution) * roomDimensions.width;
  const worldY = (gridY / gridResolution) * roomDimensions.height;
  
  let totalPPFD = 0;
  
  for (const fixture of fixtures) {
    const distance = Math.sqrt(
      Math.pow(worldX - fixture.position.x, 2) +
      Math.pow(worldY - fixture.position.y, 2) +
      Math.pow((tier.height + tier.canopyHeight/24) - fixture.mountingHeight, 2)
    );
    
    const beamRadius = Math.tan((fixture.beamAngle * Math.PI / 180) / 2) * fixture.mountingHeight;
    const beamFactor = Math.exp(-Math.pow(distance / beamRadius, 2));
    totalPPFD += (fixture.intensity * beamFactor) / Math.max(Math.pow(distance, 2), 1);
  }
  
  return totalPPFD;
}

/**
 * Generate optimal fixture placements for multi-tier system
 */
function generateOptimalFixturePlacements(
  tiers: Tier[],
  roomDimensions: { width: number; height: number; depth: number }
): Array<{
  position: { x: number; y: number; z: number };
  targetTiers: string[];
  intensity: number;
  beamAngle: number;
}> {
  const placements: Array<{
    position: { x: number; y: number; z: number };
    targetTiers: string[];
    intensity: number;
    beamAngle: number;
  }> = [];
  
  // Sort tiers by height
  const sortedTiers = [...tiers].sort((a, b) => a.height - b.height);
  
  for (let i = 0; i < sortedTiers.length; i++) {
    const tier = sortedTiers[i];
    const nextTier = sortedTiers[i + 1];
    
    // Calculate optimal mounting height for this tier
    const maxCanopyHeight = tier.height + tier.canopyHeight/12;
    const minNextTierHeight = nextTier ? nextTier.height : roomDimensions.depth;
    const optimalHeight = maxCanopyHeight + Math.min(3, (minNextTierHeight - maxCanopyHeight) * 0.7);
    
    // Calculate fixture spacing based on tier area and target PPFD
    const tierArea = tier.benchDepth * roomDimensions.width;
    const requiredPPF = tier.targetPPFD * tierArea * 0.092903;
    const fixturesNeeded = Math.ceil(requiredPPF / 1600); // Assuming 1600 PPF per fixture
    
    // Distribute fixtures evenly across the tier
    const fixturesPerRow = Math.ceil(Math.sqrt(fixturesNeeded));
    const spacing = roomDimensions.width / (fixturesPerRow + 1);
    
    for (let row = 0; row < Math.ceil(fixturesNeeded / fixturesPerRow); row++) {
      for (let col = 0; col < fixturesPerRow && (row * fixturesPerRow + col) < fixturesNeeded; col++) {
        placements.push({
          position: {
            x: spacing * (col + 1),
            y: tier.benchDepth / 2,
            z: optimalHeight
          },
          targetTiers: [tier.id],
          intensity: 1600,
          beamAngle: 120
        });
      }
    }
  }
  
  return placements;
}

/**
 * Calculate inter-tier spacing requirements
 */
export function calculateTierSpacing(
  lowerTier: Tier,
  upperTier: Tier,
  fixtureHeight: number = 6 // inches
): {
  minimumSpacing: number;
  recommendedSpacing: number;
  clearanceIssues: string[];
} {
  const clearanceIssues: string[] = [];
  
  // Minimum clearance for maintenance access
  const maintenanceClearance = 18; // inches
  
  // Clearance needed for plant growth
  const plantClearance = lowerTier.canopyHeight;
  
  // Clearance for fixtures
  const fixtureClearance = fixtureHeight + 6; // 6" buffer
  
  const minimumSpacing = Math.max(
    maintenanceClearance,
    plantClearance + fixtureClearance
  );
  
  const actualSpacing = (upperTier.height - lowerTier.height) * 12; // Convert to inches
  
  if (actualSpacing < minimumSpacing) {
    clearanceIssues.push(
      `Insufficient spacing: ${actualSpacing}" < ${minimumSpacing}" minimum`
    );
  }
  
  if (actualSpacing < plantClearance + 6) {
    clearanceIssues.push(
      `Risk of plant damage: Only ${actualSpacing - plantClearance}" clearance above canopy`
    );
  }
  
  const recommendedSpacing = minimumSpacing + 12; // Add 12" buffer
  
  return {
    minimumSpacing,
    recommendedSpacing,
    clearanceIssues
  };
}

/**
 * Calculate photosynthetic photon flux density (PPFD) considering spectral quality
 */
export function calculateSpectralPPFD(
  basePPFD: number,
  spectrum: { red: number; blue: number; green: number; farRed: number },
  cropType: string,
  growthStage: string
): {
  effectivePPFD: number;
  spectralQuality: number;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  
  // Crop-specific spectral response curves
  const spectralWeights = getSpectralWeights(cropType, growthStage);
  
  // Calculate effective PPFD based on spectral composition
  const effectivePPFD = basePPFD * (
    (spectrum.red / 100) * spectralWeights.red +
    (spectrum.blue / 100) * spectralWeights.blue +
    (spectrum.green / 100) * spectralWeights.green +
    (spectrum.farRed / 100) * spectralWeights.farRed
  );
  
  // Calculate overall spectral quality score
  const idealSpectrum = getIdealSpectrum(cropType, growthStage);
  const spectralQuality = calculateSpectralMatch(spectrum, idealSpectrum);
  
  // Generate recommendations
  if (spectrum.blue < idealSpectrum.blue * 0.8) {
    recommendations.push('Increase blue light for better leaf development');
  }
  
  if (spectrum.red < idealSpectrum.red * 0.8) {
    recommendations.push('Increase red light for enhanced photosynthesis');
  }
  
  if (spectrum.farRed > idealSpectrum.farRed * 1.2) {
    recommendations.push('Consider reducing far-red to prevent stem elongation');
  }
  
  return {
    effectivePPFD,
    spectralQuality,
    recommendations
  };
}

function getSpectralWeights(cropType: string, growthStage: string) {
  // Simplified spectral response weights
  const baseWeights = { red: 1.0, blue: 0.8, green: 0.5, farRed: 0.3 };
  
  if (growthStage === 'seedling') {
    return { ...baseWeights, blue: 1.0, red: 0.8 };
  } else if (growthStage === 'flowering') {
    return { ...baseWeights, red: 1.2, farRed: 0.4 };
  }
  
  return baseWeights;
}

function getIdealSpectrum(cropType: string, growthStage: string) {
  // Simplified ideal spectrum percentages
  const defaults = { red: 65, blue: 20, green: 10, farRed: 5 };
  
  if (cropType.toLowerCase().includes('lettuce') || cropType.toLowerCase().includes('leafy')) {
    return { red: 60, blue: 25, green: 12, farRed: 3 };
  } else if (cropType.toLowerCase().includes('tomato')) {
    return { red: 70, blue: 15, green: 10, farRed: 5 };
  }
  
  return defaults;
}

function calculateSpectralMatch(
  actual: { red: number; blue: number; green: number; farRed: number },
  ideal: { red: number; blue: number; green: number; farRed: number }
): number {
  const differences = [
    Math.abs(actual.red - ideal.red) / ideal.red,
    Math.abs(actual.blue - ideal.blue) / ideal.blue,
    Math.abs(actual.green - ideal.green) / ideal.green,
    Math.abs(actual.farRed - ideal.farRed) / ideal.farRed
  ];
  
  const averageDifference = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
  return Math.max(0, 1 - averageDifference);
}