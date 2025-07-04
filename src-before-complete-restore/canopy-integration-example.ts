/**
 * Example of using the integrated canopy penetration model with PPFD calculations
 */

import { 
  calculatePPFDWithCanopy, 
  calculatePPFDGridWithCanopy,
  calculateCanopyLightDistribution,
  FixtureData 
} from './ppfd-calculations';

// Example 1: Calculate PPFD at a specific point within canopy
export function examplePointCalculation() {
  // Define fixtures
  const fixtures: FixtureData[] = [
    {
      x: 5,      // 5 meters from origin
      y: 5,      // 5 meters from origin  
      z: 3,      // 3 meters high (fixture height)
      ppf: 1800, // 1800 μmol/s PPF output
      beamAngle: 120, // 120 degree beam angle
      enabled: true
    }
  ];
  
  // Calculate PPFD at different canopy depths
  const canopyTopHeight = 2.0; // 2 meter tall canopy
  const leafAreaIndex = 4.0;   // LAI of 4 (dense canopy)
  const extinctionCoeff = 0.5;  // Spherical leaf distribution
  
  // At canopy top
  const ppfdAtTop = calculatePPFDWithCanopy(
    fixtures, 5, 5, canopyTopHeight, canopyTopHeight, leafAreaIndex, extinctionCoeff
  );
  
  // At mid-canopy (1 meter)
  const ppfdAtMid = calculatePPFDWithCanopy(
    fixtures, 5, 5, 1.0, canopyTopHeight, leafAreaIndex, extinctionCoeff
  );
  
  // At bottom of canopy (0.2 meters)
  const ppfdAtBottom = calculatePPFDWithCanopy(
    fixtures, 5, 5, 0.2, canopyTopHeight, leafAreaIndex, extinctionCoeff
  );
  
  
  return { ppfdAtTop, ppfdAtMid, ppfdAtBottom };
}

// Example 2: Calculate PPFD grid for entire room at specific canopy depth
export function exampleGridCalculation() {
  const fixtures: FixtureData[] = [
    { x: 2, y: 2, z: 3, ppf: 1800, beamAngle: 120, enabled: true },
    { x: 8, y: 2, z: 3, ppf: 1800, beamAngle: 120, enabled: true },
    { x: 2, y: 8, z: 3, ppf: 1800, beamAngle: 120, enabled: true },
    { x: 8, y: 8, z: 3, ppf: 1800, beamAngle: 120, enabled: true }
  ];
  
  const roomWidth = 10;  // 10 meters
  const roomLength = 10; // 10 meters
  const measurementHeight = 1.0; // Measure at 1 meter (mid-canopy)
  const canopyTopHeight = 2.0;   // 2 meter canopy
  const leafAreaIndex = 3.5;     // Moderate density
  
  const grid = calculatePPFDGridWithCanopy(
    fixtures,
    roomWidth,
    roomLength,
    measurementHeight,
    canopyTopHeight,
    leafAreaIndex
  );
  
  return grid;
}

// Example 3: Analyze light distribution through canopy layers
export function exampleCanopyAnalysis() {
  const fixtures: FixtureData[] = [
    { x: 5, y: 5, z: 3, ppf: 2000, beamAngle: 120, enabled: true }
  ];
  
  const distribution = calculateCanopyLightDistribution(
    fixtures,
    10,    // room width
    10,    // room length
    2.0,   // canopy top height
    5,     // number of layers to analyze
    4.0,   // LAI
    0.5    // extinction coefficient
  );
  
  // Display results
  distribution.layers.forEach((layer, i) => {
  });
  
  
  return distribution;
}

// Example 4: Compare different canopy densities
export function compareCanopyDensities() {
  const fixtures: FixtureData[] = [
    { x: 5, y: 5, z: 3, ppf: 1800, beamAngle: 120, enabled: true }
  ];
  
  const densities = [
    { name: 'Sparse', lai: 2.0 },
    { name: 'Moderate', lai: 3.5 },
    { name: 'Dense', lai: 5.0 },
    { name: 'Very Dense', lai: 7.0 }
  ];
  
  const results = densities.map(density => {
    const ppfdBottom = calculatePPFDWithCanopy(
      fixtures, 5, 5, 0.2, 2.0, density.lai, 0.5
    );
    
    const distribution = calculateCanopyLightDistribution(
      fixtures, 10, 10, 2.0, 5, density.lai, 0.5
    );
    
    return {
      name: density.name,
      lai: density.lai,
      bottomPPFD: ppfdBottom,
      interception: distribution.totalInterception,
      efficiency: distribution.canopyEfficiency
    };
  });
  
  results.forEach(r => {
  });
  
  return results;
}