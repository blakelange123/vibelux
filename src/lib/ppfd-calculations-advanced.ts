/**
 * Advanced PPFD calculation with distributed light sources and IES support
 * Handles linear and area light sources, not just point sources
 */

import type { ParsedIESFile } from './ies-parser';

export interface AdvancedFixtureData {
  x: number; // position in meters
  y: number; // position in meters
  z: number; // height in meters
  rotation: number; // degrees
  ppf: number; // μmol/s
  beamAngle: number; // degrees
  enabled: boolean;
  // Physical dimensions
  length?: number; // meters (for linear fixtures)
  width?: number; // meters
  height?: number; // meters
  // Optional IES data
  iesData?: ParsedIESFile;
  // Spectrum data
  spectrumData?: {
    blue: number;
    green: number;
    red: number;
    farRed: number;
  };
}

/**
 * Calculate PPFD from a distributed light source (linear or area)
 * Uses multiple sample points along the fixture for accurate distribution
 */
function calculatePPFDFromDistributedFixture(
  fixture: AdvancedFixtureData,
  pointX: number,
  pointY: number,
  canopyHeight: number
): number {
  if (!fixture.enabled) return 0;

  // For linear fixtures, sample along the length
  const samples = fixture.length && fixture.length > 0.5 ? Math.ceil(fixture.length * 10) : 1;
  let totalPPFD = 0;

  for (let i = 0; i < samples; i++) {
    // Calculate sample position along fixture
    const t = samples > 1 ? i / (samples - 1) : 0.5;
    const offset = (t - 0.5) * (fixture.length || 0);
    
    // Apply rotation to offset
    const rad = (fixture.rotation || 0) * Math.PI / 180;
    const sampleX = fixture.x + offset * Math.cos(rad);
    const sampleY = fixture.y + offset * Math.sin(rad);
    
    // Calculate distance from this sample point
    const dx = sampleX - pointX;
    const dy = sampleY - pointY;
    const dz = fixture.z - canopyHeight;
    
    const horizontalDistance = Math.sqrt(dx * dx + dy * dy);
    const totalDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Calculate angle from fixture to point
    const angle = Math.atan2(horizontalDistance, dz) * (180 / Math.PI);
    
    // Apply beam angle falloff
    let intensityFactor = 1;
    
    if (fixture.iesData) {
      // Use IES photometric data if available
      const maxCandela = fixture.iesData.photometry?.maxCandela || 1;
      intensityFactor = getIESIntensity(fixture.iesData, angle, 0) / maxCandela;
    } else {
      // Use simple beam angle model
      const halfBeamAngle = fixture.beamAngle / 2;
      if (angle > halfBeamAngle) {
        const falloffAngle = halfBeamAngle * 1.5;
        if (angle < falloffAngle) {
          intensityFactor = 1 - (angle - halfBeamAngle) / (falloffAngle - halfBeamAngle);
        } else {
          intensityFactor = 0;
        }
      }
    }
    
    // Distribute PPF across samples
    const samplePPF = fixture.ppf / samples;
    
    // Modified inverse square law for distributed sources
    const ppfd = (samplePPF * intensityFactor) / (4 * Math.PI * totalDistance * totalDistance);
    
    // Convert to μmol/m²/s (multiply by typical conversion factor)
    totalPPFD += ppfd * 4.6;
  }
  
  return Math.max(0, totalPPFD);
}

/**
 * Get intensity from IES data at specific angles
 */
function getIESIntensity(iesData: ParsedIESFile, verticalAngle: number, horizontalAngle: number): number {
  const photometry = iesData.photometry;
  
  // Find nearest vertical angle in data
  let vIndex = 0;
  for (let i = 0; i < photometry.verticalAngles.length; i++) {
    if (Math.abs(photometry.verticalAngles[i] - verticalAngle) < 
        Math.abs(photometry.verticalAngles[vIndex] - verticalAngle)) {
      vIndex = i;
    }
  }
  
  // Find nearest horizontal angle
  let hIndex = 0;
  for (let i = 0; i < photometry.horizontalAngles.length; i++) {
    if (Math.abs(photometry.horizontalAngles[i] - horizontalAngle) < 
        Math.abs(photometry.horizontalAngles[hIndex] - horizontalAngle)) {
      hIndex = i;
    }
  }
  
  return photometry.candela[hIndex][vIndex];
}

/**
 * Enhanced PPFD grid calculation with distributed light sources
 */
export function calculateAdvancedPPFDGrid(
  fixtures: AdvancedFixtureData[],
  roomWidth: number,
  roomLength: number,
  canopyHeight: number,
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
      let totalPPFD = 0;
      
      // Sum contributions from all fixtures
      for (const fixture of fixtures) {
        totalPPFD += calculatePPFDFromDistributedFixture(fixture, pointX, pointY, canopyHeight);
      }
      
      row.push(totalPPFD);
    }
    grid.push(row);
  }
  
  return grid;
}

/**
 * Get fixture dimensions from DLC data or model specifications
 */
export function getFixtureDimensions(fixtureModel: string): { length: number; width: number; height: number } {
  // Common fixture dimension patterns
  const dimensionPatterns = {
    'linear': { length: 1.2, width: 0.1, height: 0.08 },
    'compact': { length: 0.6, width: 0.6, height: 0.15 },
    'force': { length: 1.0, width: 0.3, height: 0.12 },
    'module': { length: 0.3, width: 0.3, height: 0.08 },
    'bar': { length: 1.2, width: 0.08, height: 0.06 },
    'panel': { length: 0.6, width: 0.6, height: 0.1 }
  };
  
  // Check model name for patterns
  const modelLower = fixtureModel.toLowerCase();
  
  if (modelLower.includes('linear') || modelLower.includes('tlf')) {
    return dimensionPatterns.linear;
  } else if (modelLower.includes('compact')) {
    return dimensionPatterns.compact;
  } else if (modelLower.includes('force')) {
    return dimensionPatterns.force;
  } else if (modelLower.includes('module')) {
    return dimensionPatterns.module;
  } else if (modelLower.includes('bar')) {
    return dimensionPatterns.bar;
  }
  
  // Default to panel
  return dimensionPatterns.panel;
}

/**
 * Get beam angle from model specifications
 */
export function getBeamAngle(fixtureModel: string): number {
  const modelLower = fixtureModel.toLowerCase();
  
  // Specific beam angles mentioned by user
  if (modelLower.includes('wb') || modelLower.includes('wide beam')) {
    return 140; // Wide beam
  } else if (modelLower.includes('production module')) {
    return 140; // Philips production module
  } else if (modelLower.includes('quadro')) {
    return 90; // TLF Force Quadro has different beam angle
  }
  
  // Default beam angles by type
  if (modelLower.includes('linear')) {
    return 120;
  } else if (modelLower.includes('compact')) {
    return 120;
  }
  
  return 120; // Default
}