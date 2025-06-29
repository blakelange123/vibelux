import type { Fixture, Room } from '../context/types';

// Grid resolution for PPFD calculations (points per foot)
const GRID_RESOLUTION = 2;

// Debug flag - set to true to enable calculation logging
const DEBUG_CALCULATIONS = false; // Enable this to debug PPFD calculations

export function calculatePPFDGrid(fixtures: Fixture[], room: Room): number[][] {
  if (!room?.width || !room?.length || !room?.height) {
    return [[]];
  }
  
  const gridWidth = Math.ceil(room.width * GRID_RESOLUTION);
  const gridHeight = Math.ceil(room.length * GRID_RESOLUTION);
  
  // Initialize grid with zeros
  const grid: number[][] = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(0));
  
  // Debug logging
  const enabledFixtures = fixtures.filter(f => f.enabled);
  if (DEBUG_CALCULATIONS && enabledFixtures.length > 0) {
    enabledFixtures.forEach((f, i) => {
    });
  }
  
  // Calculate contribution from each fixture
  fixtures.forEach(fixture => {
    if (!fixture.enabled) return;
    
    const fixtureX = fixture.x;
    const fixtureY = fixture.y;
    const mountingHeight = fixture.z || room.height - 2; // Default 2 feet below ceiling
    
    // Calculate PPFD at each grid point
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const pointX = x / GRID_RESOLUTION;
        const pointY = y / GRID_RESOLUTION;
        
        // Calculate distance from fixture to point
        const horizontalDistance = Math.sqrt(
          Math.pow(pointX - fixtureX, 2) + 
          Math.pow(pointY - fixtureY, 2)
        );
        
        // Calculate vertical distance from fixture to working height
        const verticalDistance = mountingHeight - (room.workingHeight || 3);
        
        const totalDistance = Math.sqrt(
          Math.pow(horizontalDistance, 2) + 
          Math.pow(Math.abs(verticalDistance), 2)
        );
        
        // Calculate angle from fixture to point
        const angle = Math.atan(horizontalDistance / Math.abs(verticalDistance)) * (180 / Math.PI);
        
        // Get beam angle from fixture model
        const beamAngle = fixture.model?.beamAngle || 120;
        
        // Simple inverse square law with beam angle consideration
        if (angle <= beamAngle / 2) {
          // Use PPF value from fixture model with validation
          let ppfToUse = fixture.model?.ppf || 1000;
          
          // Validate PPF is reasonable for the wattage
          // Typical LED efficacy is 1.5-3.5 μmol/J
          const wattage = fixture.model?.wattage || 600;
          const efficacy = ppfToUse / wattage;
          
          // If efficacy is unreasonable, calculate PPF from wattage
          if (efficacy < 0.5 || efficacy > 4.0) {
            // Use a conservative 2.3 μmol/J for unknown fixtures
            ppfToUse = wattage * 2.3;
            console.warn(`Fixture PPF/Wattage ratio unrealistic. Using calculated PPF: ${ppfToUse} for ${wattage}W fixture`);
          }
          
          // Apply dimming level if set
          const dimmingFactor = (fixture.dimmingLevel || 100) / 100;
          
          // Calculate PPFD using corrected formula for LED grow lights
          // Convert distance from feet to meters first
          const distanceInMeters = totalDistance * 0.3048;
          
          // For LED grow lights with directional output, we use a modified formula
          // that accounts for the concentrated beam pattern
          // Beam angle factor: converts full sphere (4π) to actual coverage area
          const beamAngleRadians = (beamAngle * Math.PI) / 180;
          const solidAngle = 2 * Math.PI * (1 - Math.cos(beamAngleRadians / 2));
          
          // PPFD = (PPF × beam concentration factor) / area
          // For a more accurate calculation, we use the actual illuminated area
          const illuminatedArea = Math.PI * Math.pow(distanceInMeters * Math.tan(beamAngleRadians / 2), 2);
          
          // Calculate PPFD
          const ppfd = (ppfToUse * dimmingFactor) / illuminatedArea;
          
          // Apply cosine correction for angle (Lambert's cosine law)
          const cosineCorrection = Math.cos(angle * Math.PI / 180);
          
          // Apply edge falloff based on beam pattern
          // More realistic falloff for LED fixtures
          const normalizedAngle = angle / (beamAngle / 2);
          const beamEfficiency = Math.pow(Math.cos(normalizedAngle * Math.PI / 2), 2);
          
          const finalPPFD = ppfd * cosineCorrection * beamEfficiency;
          
          // Debug first few calculations
          if (DEBUG_CALCULATIONS && x === Math.floor(gridWidth / 2) && y === Math.floor(gridHeight / 2)) {
          }
          
          grid[y][x] += finalPPFD;
        }
      }
    }
  });
  
  // Debug summary
  if (DEBUG_CALCULATIONS && enabledFixtures.length > 0) {
    let totalPPFD = 0;
    let maxPPFD = 0;
    let minPPFD = Infinity;
    let pointCount = 0;
    
    grid.forEach(row => {
      row.forEach(value => {
        if (value > 0) {
          totalPPFD += value;
          maxPPFD = Math.max(maxPPFD, value);
          minPPFD = Math.min(minPPFD, value);
          pointCount++;
        }
      });
    });
    
    const avgPPFD = pointCount > 0 ? totalPPFD / pointCount : 0;
  }
  
  return grid;
}

export function calculateUniformity(grid: number[][]): {
  minAvgRatio: number;
  avgMaxRatio: number;
  minMaxRatio: number;
  cv: number; // Coefficient of Variation
} {
  const flatGrid = grid.flat();
  const nonZeroValues = flatGrid.filter(v => v > 0);
  
  if (nonZeroValues.length === 0) {
    return { minAvgRatio: 0, avgMaxRatio: 0, minMaxRatio: 0, cv: 0 };
  }
  
  const min = Math.min(...nonZeroValues);
  const max = Math.max(...nonZeroValues);
  const avg = nonZeroValues.reduce((a, b) => a + b, 0) / nonZeroValues.length;
  
  // Calculate standard deviation for CV
  const variance = nonZeroValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / nonZeroValues.length;
  const stdDev = Math.sqrt(variance);
  const cv = avg > 0 ? (stdDev / avg) * 100 : 0;
  
  return {
    minAvgRatio: avg > 0 ? min / avg : 0,
    avgMaxRatio: max > 0 ? avg / max : 0,
    minMaxRatio: max > 0 ? min / max : 0,
    cv: cv
  };
}

export function calculateDLI(avgPPFD: number, photoperiod: number): number {
  // DLI = PPFD × photoperiod × 3600 / 1,000,000
  return (avgPPFD * photoperiod * 3600) / 1000000;
}

export function calculatePowerDensity(fixtures: Fixture[], roomArea: number): number {
  const totalPower = fixtures
    .filter(f => f.enabled && f.model)
    .reduce((sum, f) => sum + (f.model?.wattage || 0), 0);
  
  return totalPower / roomArea;
}

export function calculateEfficacy(fixtures: Fixture[]): number {
  const totalPPF = fixtures
    .filter(f => f.enabled && f.model)
    .reduce((sum, f) => sum + (f.model?.ppf || 0), 0);
  
  const totalPower = fixtures
    .filter(f => f.enabled && f.model)
    .reduce((sum, f) => sum + (f.model?.wattage || 0), 0);
  
  return totalPower > 0 ? totalPPF / totalPower : 0;
}

// Calculate optimal fixture spacing
export function calculateOptimalSpacing(
  fixture: Fixture,
  targetPPFD: number,
  mountingHeight: number
): { x: number; y: number } {
  // Simplified calculation based on fixture output and target PPFD
  const effectiveHeight = mountingHeight - 3; // Assume 3 ft working height
  const coverageArea = (fixture.model.ppf / targetPPFD) * 10.764; // Convert to sq ft
  const spacing = Math.sqrt(coverageArea);
  
  return {
    x: Math.round(spacing * 10) / 10,
    y: Math.round(spacing * 10) / 10
  };
}

// Check if a point is inside the room (for non-rectangular rooms)
export function isPointInRoom(x: number, y: number, room: Room): boolean {
  // For now, assume rectangular rooms
  if (!room?.width || !room?.length) return false;
  return x >= 0 && x <= room.width && y >= 0 && y <= room.length;
}

// Calculate coverage percentage
export function calculateCoverage(grid: number[][], targetPPFD: number): number {
  const flatGrid = grid.flat();
  const totalPoints = flatGrid.length;
  const pointsMeetingTarget = flatGrid.filter(v => v >= targetPPFD).length;
  
  return totalPoints > 0 ? (pointsMeetingTarget / totalPoints) * 100 : 0;
}

// Calculate PPFD at a specific point from a fixture
export function calculatePPFDAtPoint(
  point: { x: number; y: number; z: number },
  fixture: Fixture
): number {
  if (!fixture.enabled || !fixture.model) return 0;
  
  const fixtureX = fixture.x;
  const fixtureY = fixture.y;
  const fixtureZ = fixture.z;
  
  // Calculate distance from fixture to point
  const horizontalDistance = Math.sqrt(
    Math.pow(point.x - fixtureX, 2) + 
    Math.pow(point.y - fixtureY, 2)
  );
  
  const verticalDistance = Math.abs(fixtureZ - point.z);
  const totalDistance = Math.sqrt(
    Math.pow(horizontalDistance, 2) + 
    Math.pow(verticalDistance, 2)
  );
  
  // Calculate angle from fixture to point
  const angle = Math.atan(horizontalDistance / verticalDistance) * (180 / Math.PI);
  
  const beamAngle = fixture.model.beamAngle || 120;
  
  // If outside beam angle, reduce intensity
  if (angle > beamAngle / 2) {
    const angleFactor = Math.max(0, 1 - ((angle - beamAngle / 2) / (beamAngle / 2)));
    const ppf = fixture.model.ppf || 1000;
    const ppfd = (ppf / (4 * Math.PI * Math.pow(totalDistance, 2))) * 10.764 * angleFactor;
    return Math.max(0, ppfd * (fixture.dimmingLevel || 1));
  }
  
  // Within beam angle - full intensity with inverse square law
  const ppf = fixture.model.ppf || 1000;
  const ppfd = (ppf / (4 * Math.PI * Math.pow(totalDistance, 2))) * 10.764;
  
  return Math.max(0, ppfd * (fixture.dimmingLevel || 1));
}