/**
 * PPFD (Photosynthetic Photon Flux Density) calculation utilities
 * Based on inverse square law and fixture specifications
 */

export interface PPFDPoint {
  x: number;
  y: number;
  value: number;
}

export interface FixtureData {
  x: number; // position in meters
  y: number; // position in meters
  z: number; // height in meters
  ppf: number; // μmol/s
  beamAngle: number; // degrees
  enabled: boolean;
  // Optional spectral data for advanced calculations
  spectrum?: {
    wavelengths: number[]; // nm
    intensities: number[]; // relative intensity 0-1
  };
}

/**
 * Calculate PPFD at a specific point from a single fixture
 * Using inverse square law with beam angle consideration
 */
export function calculatePPFD(
  fixture: FixtureData,
  pointX: number,
  pointY: number,
  canopyHeight: number
): number {
  return calculatePPFDFromFixture(fixture, pointX, pointY, canopyHeight);
}

/**
 * Calculate uniformity ratio from PPFD grid
 */
export function calculateUniformity(grid: number[][]): number {
  const stats = calculatePPFDStats(grid);
  return stats.uniformity;
}

/**
 * Internal function to calculate PPFD from a single fixture
 */
function calculatePPFDFromFixture(
  fixture: FixtureData,
  pointX: number,
  pointY: number,
  canopyHeight: number
): number {
  if (!fixture.enabled) return 0;

  // Calculate distance from fixture to point
  const dx = fixture.x - pointX;
  const dy = fixture.y - pointY;
  const dz = fixture.z - canopyHeight;
  
  // Minimum distance to avoid division by zero
  if (dz <= 0) return 0;
  
  const horizontalDistance = Math.sqrt(dx * dx + dy * dy);
  const totalDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  // Calculate angle from fixture to point (in degrees)
  const angle = Math.atan2(horizontalDistance, dz) * (180 / Math.PI);
  
  // Apply beam angle falloff using a more realistic cosine-based model
  const halfBeamAngle = fixture.beamAngle / 2;
  let intensityFactor = 1;
  
  if (angle <= halfBeamAngle) {
    // Within beam angle - use cosine falloff for more realistic distribution
    intensityFactor = Math.pow(Math.cos(angle * Math.PI / 180), 2);
  } else {
    // Outside beam angle - smooth falloff to zero
    const falloffAngle = halfBeamAngle * 1.2; // 20% extension for soft edge
    if (angle < falloffAngle) {
      const falloffRatio = (angle - halfBeamAngle) / (falloffAngle - halfBeamAngle);
      intensityFactor = Math.pow(Math.cos(halfBeamAngle * Math.PI / 180), 2) * (1 - falloffRatio);
    } else {
      intensityFactor = 0;
    }
  }
  
  // Correct PPFD calculation using solid angle
  // The fixture PPF is distributed over a solid angle, not a flat circle
  // For a cone with half-angle θ, the solid angle is 2π(1 - cos(θ))
  const halfBeamAngleRad = halfBeamAngle * Math.PI / 180;
  const solidAngle = 2 * Math.PI * (1 - Math.cos(halfBeamAngleRad));
  
  // PPFD = (PPF / solid angle) * (intensity factor) / (distance²)
  // The division by distance² accounts for the inverse square law
  // Note: solid angle is in steradians, and we're working with the point source approximation
  const ppfd = (fixture.ppf / solidAngle) * intensityFactor / (totalDistance * totalDistance);
  
  return Math.max(0, ppfd);
}

/**
 * Calculate PPFD grid for a room with multiple fixtures
 */
export function calculatePPFDGrid(
  fixtures: FixtureData[],
  roomWidth: number, // meters
  roomLength: number, // meters
  canopyHeight: number, // meters
  gridResolution: number = 50 // points per dimension
): number[][] {
  const grid: number[][] = [];
  const cellWidth = roomWidth / gridResolution;
  const cellLength = roomLength / gridResolution;
  
  for (let y = 0; y < gridResolution; y++) {
    const row: number[] = [];
    const pointY = y * cellLength + cellLength / 2;
    
    for (let x = 0; x < gridResolution; x++) {
      const pointX = x * cellWidth + cellWidth / 2;
      let totalPPFD = 0;
      
      // Sum contributions from all fixtures
      for (const fixture of fixtures) {
        totalPPFD += calculatePPFDFromFixture(fixture, pointX, pointY, canopyHeight);
      }
      
      row.push(totalPPFD);
    }
    grid.push(row);
  }
  
  return grid;
}

/**
 * Calculate PPFD statistics from a grid
 */
export function calculatePPFDStats(grid: number[][]) {
  let min = Infinity;
  let max = 0;
  let sum = 0;
  let count = 0;
  const values: number[] = [];
  
  for (const row of grid) {
    for (const value of row) {
      if (value > 0) {
        min = Math.min(min, value);
        max = Math.max(max, value);
        sum += value;
        count++;
        values.push(value);
      }
    }
  }
  
  const avg = count > 0 ? sum / count : 0;
  
  // Calculate standard deviation
  let stdDev = 0;
  if (count > 0) {
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / count;
    stdDev = Math.sqrt(variance);
  }
  
  // Calculate different uniformity metrics
  const uniformityAvgMax = max > 0 ? avg / max : 0; // Primary metric (avg/max)
  const uniformityMinAvg = avg > 0 ? min / avg : 0; // Secondary metric (min/avg)
  const uniformityMinMax = max > 0 ? min / max : 0; // Tertiary metric (min/max)
  const cv = avg > 0 ? stdDev / avg : 0; // Coefficient of variation
  
  return {
    min: min === Infinity ? 0 : Math.round(min),
    max: Math.round(max),
    avg: Math.round(avg),
    stdDev: Math.round(stdDev),
    uniformity: Number(uniformityAvgMax.toFixed(2)), // Primary uniformity metric
    uniformityMetrics: {
      avgMax: Number(uniformityAvgMax.toFixed(2)), // avg/max (0.7-0.9 is good)
      minAvg: Number(uniformityMinAvg.toFixed(2)), // min/avg (0.7-0.9 is good)
      minMax: Number(uniformityMinMax.toFixed(2)), // min/max (0.5-0.8 is typical)
      cv: Number(cv.toFixed(2)) // coefficient of variation (lower is better, <0.3 is good)
    }
  };
}

/**
 * Calculate DLI (Daily Light Integral) from PPFD
 */
export function calculateDLI(ppfd: number, photoperiod: number): number {
  // DLI (mol/m²/day) = PPFD (μmol/m²/s) × photoperiod (hours) × 3600 (s/hour) / 1,000,000 (μmol/mol)
  // Simplified: DLI = PPFD × photoperiod × 0.0036
  return Number((ppfd * photoperiod * 0.0036).toFixed(1));
}

/**
 * Generate heatmap data for visualization
 */
export function generateHeatmapData(
  grid: number[][],
  maxValue?: number
): { x: number; y: number; value: number }[] {
  const data: { x: number; y: number; value: number }[] = [];
  const actualMax = maxValue || Math.max(...grid.flat());
  
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      data.push({
        x,
        y,
        value: grid[y][x] / actualMax // Normalize to 0-1
      });
    }
  }
  
  return data;
}

/**
 * Calculate spectrum mix from multiple fixtures
 */
export function calculateSpectrumMix(fixtures: FixtureData[] & { spectrumData?: any }[]) {
  const totalSpectrum = {
    blue: 0,
    green: 0,
    red: 0,
    farRed: 0,
    total: 0
  };
  
  for (const fixture of fixtures) {
    if (fixture.enabled && fixture.spectrumData) {
      const fixturePPF = fixture.ppf;
      totalSpectrum.blue += (fixture.spectrumData.blue / 100) * fixturePPF;
      totalSpectrum.green += (fixture.spectrumData.green / 100) * fixturePPF;
      totalSpectrum.red += (fixture.spectrumData.red / 100) * fixturePPF;
      totalSpectrum.farRed += (fixture.spectrumData.farRed / 100) * fixturePPF;
      totalSpectrum.total += fixturePPF;
    }
  }
  
  // Convert to percentages
  if (totalSpectrum.total > 0) {
    return {
      blue: Math.round((totalSpectrum.blue / totalSpectrum.total) * 100),
      green: Math.round((totalSpectrum.green / totalSpectrum.total) * 100),
      red: Math.round((totalSpectrum.red / totalSpectrum.total) * 100),
      farRed: Math.round((totalSpectrum.farRed / totalSpectrum.total) * 100)
    };
  }
  
  return { blue: 0, green: 0, red: 0, farRed: 0 };
}

/**
 * Calculate PPFD with canopy penetration using Beer-Lambert law
 * This is a simplified version for integration with existing PPFD calculations
 */
export function calculatePPFDWithCanopy(
  fixtures: FixtureData[],
  pointX: number,
  pointY: number,
  measurementHeight: number, // height where we want to measure PPFD
  canopyTopHeight: number, // height of canopy top
  leafAreaIndex: number = 3.0, // LAI
  extinctionCoeff: number = 0.5 // k value, 0.5 for spherical leaf distribution
): number {
  // First calculate PPFD at canopy top
  let ppfdAtCanopyTop = 0;
  for (const fixture of fixtures) {
    ppfdAtCanopyTop += calculatePPFDFromFixture(fixture, pointX, pointY, canopyTopHeight);
  }
  
  // If measurement point is above canopy, no attenuation
  if (measurementHeight >= canopyTopHeight) {
    let ppfdAtPoint = 0;
    for (const fixture of fixtures) {
      ppfdAtPoint += calculatePPFDFromFixture(fixture, pointX, pointY, measurementHeight);
    }
    return ppfdAtPoint;
  }
  
  // Calculate canopy depth from top to measurement point
  const canopyDepth = canopyTopHeight - measurementHeight;
  const canopyTotalDepth = canopyTopHeight; // Assuming canopy starts at ground
  
  // Calculate cumulative LAI from canopy top to measurement point
  const cumulativeLAI = leafAreaIndex * (canopyDepth / canopyTotalDepth);
  
  // Apply Beer-Lambert law: I = I₀ * e^(-k * LAI)
  const attenuationFactor = Math.exp(-extinctionCoeff * cumulativeLAI);
  const ppfdAtMeasurementHeight = ppfdAtCanopyTop * attenuationFactor;
  
  return ppfdAtMeasurementHeight;
}

/**
 * Calculate PPFD grid with canopy penetration
 */
export function calculatePPFDGridWithCanopy(
  fixtures: FixtureData[],
  roomWidth: number,
  roomLength: number,
  measurementHeight: number,
  canopyTopHeight: number,
  leafAreaIndex: number = 3.0,
  extinctionCoeff: number = 0.5,
  gridResolution: number = 50
): number[][] {
  const grid: number[][] = [];
  const cellWidth = roomWidth / gridResolution;
  const cellLength = roomLength / gridResolution;
  
  for (let y = 0; y < gridResolution; y++) {
    const row: number[] = [];
    const pointY = y * cellLength + cellLength / 2;
    
    for (let x = 0; x < gridResolution; x++) {
      const pointX = x * cellWidth + cellWidth / 2;
      const ppfd = calculatePPFDWithCanopy(
        fixtures,
        pointX,
        pointY,
        measurementHeight,
        canopyTopHeight,
        leafAreaIndex,
        extinctionCoeff
      );
      row.push(ppfd);
    }
    grid.push(row);
  }
  
  return grid;
}

/**
 * Calculate canopy light interception and distribution
 */
export function calculateCanopyLightDistribution(
  fixtures: FixtureData[],
  roomWidth: number,
  roomLength: number,
  canopyTopHeight: number,
  canopyLayers: number = 5,
  leafAreaIndex: number = 3.0,
  extinctionCoeff: number = 0.5
): {
  layers: Array<{
    height: number;
    avgPPFD: number;
    minPPFD: number;
    maxPPFD: number;
    interceptedPPFD: number;
  }>;
  totalInterception: number;
  canopyEfficiency: number;
} {
  const layerHeight = canopyTopHeight / canopyLayers;
  const layers: Array<{
    height: number;
    avgPPFD: number;
    minPPFD: number;
    maxPPFD: number;
    interceptedPPFD: number;
  }> = [];
  
  let previousLayerAvg = 0;
  let totalInterceptedLight = 0;
  
  // Calculate from top to bottom
  for (let i = 0; i < canopyLayers; i++) {
    const currentHeight = canopyTopHeight - (i * layerHeight);
    const grid = calculatePPFDGridWithCanopy(
      fixtures,
      roomWidth,
      roomLength,
      currentHeight,
      canopyTopHeight,
      leafAreaIndex,
      extinctionCoeff,
      20 // Lower resolution for performance
    );
    
    const stats = calculatePPFDStats(grid);
    const intercepted = i === 0 ? 0 : previousLayerAvg - stats.avg;
    
    layers.push({
      height: currentHeight,
      avgPPFD: stats.avg,
      minPPFD: stats.min,
      maxPPFD: stats.max,
      interceptedPPFD: Math.max(0, intercepted)
    });
    
    totalInterceptedLight += Math.max(0, intercepted);
    previousLayerAvg = stats.avg;
  }
  
  // Calculate total light at canopy top
  const topLayerGrid = calculatePPFDGrid(fixtures, roomWidth, roomLength, canopyTopHeight, 20);
  const topStats = calculatePPFDStats(topLayerGrid);
  
  const totalInterception = topStats.avg > 0 ? totalInterceptedLight / topStats.avg : 0;
  const canopyEfficiency = totalInterception * 0.85; // Assuming 85% of intercepted light is used for photosynthesis
  
  return {
    layers,
    totalInterception: Math.min(totalInterception, 0.95), // Cap at 95% interception
    canopyEfficiency: Math.min(canopyEfficiency, 0.80) // Cap at 80% efficiency
  };
}