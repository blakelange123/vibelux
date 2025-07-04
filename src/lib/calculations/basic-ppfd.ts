import { FixtureModel } from '@/components/FixtureLibrary';

interface Fixture {
  id: string;
  type: 'fixture';
  x: number;
  y: number;
  z: number;
  rotation: number;
  width: number;
  length: number;
  height: number;
  model: FixtureModel;
  enabled: boolean;
  dimmingLevel: number;
}

interface Room {
  width: number;
  length: number;
  height: number;
  reflectances: {
    ceiling: number;
    walls: number;
    floor: number;
  };
}

export interface PPFDCalculationResult {
  grid: number[][];
  averagePPFD: number;
  minPPFD: number;
  maxPPFD: number;
  uniformity: number;
  uniformityMin: number;
}

// Calculate PPFD at a single point from a single fixture
function calculatePPFDAtPoint(
  fixture: Fixture,
  pointX: number,
  pointY: number,
  pointZ: number
): number {
  if (!fixture.enabled) return 0;

  // Get fixture PPF
  const ppf = (fixture.model?.ppf || fixture.model?.ppf_fl || 0) * (fixture.dimmingLevel / 100);
  if (ppf === 0) return 0;

  // Calculate distance from fixture to point
  const dx = pointX - fixture.x;
  const dy = pointY - fixture.y;
  const dz = fixture.z - pointZ;
  
  // Horizontal distance
  const horizontalDistance = Math.sqrt(dx * dx + dy * dy);
  
  // Total distance
  const distance = Math.sqrt(horizontalDistance * horizontalDistance + dz * dz);
  
  // Prevent division by zero
  if (distance < 0.1) return ppf / 0.1; // Very close to fixture
  
  // Simple inverse square law with beam angle consideration
  // Assume 120 degree beam angle for most LED fixtures
  const beamAngle = 120;
  const halfBeamAngle = beamAngle / 2;
  
  // Calculate angle from fixture to point
  const angle = Math.atan2(horizontalDistance, dz) * (180 / Math.PI);
  
  // Light intensity falloff based on angle
  let angleFactor = 1.0;
  if (angle > halfBeamAngle) {
    // Outside main beam - rapid falloff
    angleFactor = Math.max(0, 1 - ((angle - halfBeamAngle) / 30));
  } else {
    // Inside main beam - cosine falloff
    angleFactor = Math.cos(angle * Math.PI / 180);
  }
  
  // PPFD calculation using inverse square law
  // Assuming fixture distributes light over approximately 1 square meter at 1 meter distance
  const ppfd = (ppf / (4 * Math.PI * distance * distance)) * angleFactor * 10000;
  
  return Math.max(0, ppfd);
}

// Calculate PPFD grid for the entire room
export function calculatePPFDGrid(
  room: Room,
  fixtures: Fixture[],
  workingHeight: number = 3, // Height of canopy in feet
  gridResolution: number = 0.5 // Grid point every 0.5 feet
): PPFDCalculationResult {
  const gridCols = Math.ceil(room.width / gridResolution) + 1;
  const gridRows = Math.ceil(room.length / gridResolution) + 1;
  
  // Initialize grid
  const grid: number[][] = Array(gridRows).fill(null).map(() => Array(gridCols).fill(0));
  
  let totalPPFD = 0;
  let minPPFD = Infinity;
  let maxPPFD = 0;
  let pointCount = 0;
  
  // Calculate PPFD at each grid point
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const x = col * gridResolution;
      const y = row * gridResolution;
      
      // Skip points outside room bounds
      if (x > room.width || y > room.length) continue;
      
      let ppfdAtPoint = 0;
      
      // Sum contribution from each fixture
      for (const fixture of fixtures) {
        ppfdAtPoint += calculatePPFDAtPoint(fixture, x, y, workingHeight);
      }
      
      // Apply reflection factor (simplified)
      const reflectionFactor = 1 + (room.reflectances.walls * 0.1 + room.reflectances.ceiling * 0.05);
      ppfdAtPoint *= reflectionFactor;
      
      grid[row][col] = ppfdAtPoint;
      
      totalPPFD += ppfdAtPoint;
      minPPFD = Math.min(minPPFD, ppfdAtPoint);
      maxPPFD = Math.max(maxPPFD, ppfdAtPoint);
      pointCount++;
    }
  }
  
  const averagePPFD = pointCount > 0 ? totalPPFD / pointCount : 0;
  const uniformity = averagePPFD > 0 ? minPPFD / averagePPFD : 0;
  const uniformityMin = maxPPFD > 0 ? minPPFD / maxPPFD : 0;
  
  return {
    grid,
    averagePPFD,
    minPPFD: minPPFD === Infinity ? 0 : minPPFD,
    maxPPFD,
    uniformity,
    uniformityMin
  };
}

// Calculate DLI from PPFD and photoperiod
export function calculateDLI(ppfd: number, photoperiod: number): number {
  // DLI = PPFD × photoperiod × 3600 / 1,000,000
  return (ppfd * photoperiod * 3600) / 1000000;
}

// Get PPFD color for visualization
export function getPPFDColor(ppfd: number, opacity: number = 1): string {
  if (ppfd < 200) {
    // Blue - too low
    return `rgba(59, 130, 246, ${opacity})`;
  } else if (ppfd < 400) {
    // Green - low but acceptable
    return `rgba(34, 197, 94, ${opacity})`;
  } else if (ppfd < 600) {
    // Yellow - good
    return `rgba(251, 191, 36, ${opacity})`;
  } else if (ppfd < 800) {
    // Orange - high
    return `rgba(251, 146, 60, ${opacity})`;
  } else {
    // Red - very high
    return `rgba(239, 68, 68, ${opacity})`;
  }
}

// Calculate recommended fixture count
export function calculateRecommendedFixtures(
  room: Room,
  targetPPFD: number,
  fixtureModel: FixtureModel | null
): number {
  if (!fixtureModel) return 0;
  
  const roomArea = room.width * room.length;
  const fixturePPF = fixtureModel.ppf || fixtureModel.ppf_fl || 0;
  
  // Rough estimate: assume each fixture covers about 16 sq ft effectively
  const coveragePerFixture = 16;
  const fixturesForCoverage = Math.ceil(roomArea / coveragePerFixture);
  
  // Also calculate based on target PPFD
  // Assume 70% efficiency due to wall losses, overlap, etc.
  const totalPPFNeeded = targetPPFD * roomArea * 10.764; // Convert to μmol/s
  const fixturesForPPFD = Math.ceil(totalPPFNeeded / (fixturePPF * 0.7));
  
  // Return the higher of the two estimates
  return Math.max(fixturesForCoverage, fixturesForPPFD);
}