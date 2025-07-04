/**
 * Advanced Photometric Calculation Engine
 * Supports both IES file data and estimated distributions
 */

import { IESPhotometricData, IESParser } from './ies-parser-advanced';

export interface PhotometricFixture {
  id: string;
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number }; // Euler angles in degrees
  iesData?: IESPhotometricData;
  fallbackData?: {
    ppf: number; // μmol/s
    wattage: number;
    beamAngle?: number; // degrees
    distributionType?: 'lambertian' | 'focused' | 'wide' | 'asymmetric';
  };
}

export interface PPFDCalculationPoint {
  x: number;
  y: number;
  z: number;
  ppfd: number; // μmol/m²/s
  contributions: Map<string, number>; // Fixture ID -> PPFD contribution
}

export interface PhotometricCalculationOptions {
  gridResolution: number; // Points per meter
  calculationHeight: number; // Height above floor (meters)
  reflectance?: {
    walls: number; // 0-1
    ceiling: number;
    floor: number;
  };
  includeInterReflection?: boolean;
  ppfPerLumen?: number; // Conversion factor for IES lumens to PPF
}

export class PhotometricEngine {
  private fixtures: Map<string, PhotometricFixture> = new Map();
  private roomDimensions: { width: number; length: number; height: number };
  
  constructor(roomDimensions: { width: number; length: number; height: number }) {
    this.roomDimensions = roomDimensions;
  }
  
  /**
   * Add or update a fixture
   */
  addFixture(fixture: PhotometricFixture): void {
    this.fixtures.set(fixture.id, fixture);
  }
  
  /**
   * Remove a fixture
   */
  removeFixture(fixtureId: string): void {
    this.fixtures.delete(fixtureId);
  }
  
  /**
   * Calculate PPFD grid for entire room
   */
  calculatePPFDGrid(options: PhotometricCalculationOptions): PPFDCalculationPoint[][] {
    const { gridResolution, calculationHeight } = options;
    const { width, length } = this.roomDimensions;
    
    const gridWidth = Math.ceil(width * gridResolution);
    const gridLength = Math.ceil(length * gridResolution);
    const grid: PPFDCalculationPoint[][] = [];
    
    // Calculate direct illumination
    for (let y = 0; y < gridLength; y++) {
      const row: PPFDCalculationPoint[] = [];
      
      for (let x = 0; x < gridWidth; x++) {
        const worldX = (x / gridResolution);
        const worldY = (y / gridResolution);
        const point = this.calculatePointPPFD(
          worldX, 
          worldY, 
          calculationHeight, 
          options
        );
        row.push(point);
      }
      
      grid.push(row);
    }
    
    // Add inter-reflection if enabled
    if (options.includeInterReflection && options.reflectance) {
      this.addInterReflection(grid, options);
    }
    
    return grid;
  }
  
  /**
   * Calculate PPFD at a specific point
   */
  calculatePointPPFD(
    x: number, 
    y: number, 
    z: number,
    options: PhotometricCalculationOptions
  ): PPFDCalculationPoint {
    const contributions = new Map<string, number>();
    let totalPPFD = 0;
    
    // Calculate contribution from each fixture
    for (const [fixtureId, fixture] of this.fixtures) {
      let ppfd = 0;
      
      if (fixture.iesData) {
        ppfd = this.calculateIESContribution(fixture, { x, y, z }, options);
      } else if (fixture.fallbackData) {
        ppfd = this.calculateEstimatedContribution(fixture, { x, y, z });
      }
      
      if (ppfd > 0) {
        contributions.set(fixtureId, ppfd);
        totalPPFD += ppfd;
      }
    }
    
    return {
      x,
      y,
      z,
      ppfd: totalPPFD,
      contributions
    };
  }
  
  /**
   * Calculate contribution from fixture with IES data
   */
  private calculateIESContribution(
    fixture: PhotometricFixture,
    point: { x: number; y: number; z: number },
    options: PhotometricCalculationOptions
  ): number {
    if (!fixture.iesData) return 0;
    
    // Calculate vector from fixture to point
    const dx = point.x - fixture.position.x;
    const dy = point.y - fixture.position.y;
    const dz = point.z - fixture.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance === 0) return 0;
    
    // Calculate angles relative to fixture
    let theta = Math.atan2(Math.sqrt(dx * dx + dy * dy), -dz) * 180 / Math.PI; // Vertical angle
    let phi = Math.atan2(dy, dx) * 180 / Math.PI; // Horizontal angle
    
    // Apply fixture rotation if specified
    if (fixture.rotation) {
      // Simplified rotation - would need full 3D rotation matrix for accuracy
      phi -= fixture.rotation.z;
    }
    
    // Normalize angles
    if (phi < 0) phi += 360;
    if (theta < 0) theta = 0;
    if (theta > 180) theta = 180;
    
    // Get candela value from IES data
    const candela = this.interpolateIESValue(fixture.iesData, theta, phi);
    
    // Convert candela to PPFD
    // PPFD = (candela × PPF/lumen factor) / distance²
    const ppfPerLumen = options.ppfPerLumen || 0.015; // Default for typical grow light spectrum
    const ppfd = (candela * ppfPerLumen) / (distance * distance);
    
    return ppfd;
  }
  
  /**
   * Interpolate IES candela value for given angles
   */
  private interpolateIESValue(
    iesData: IESPhotometricData,
    theta: number,
    phi: number
  ): number {
    const { measurements } = iesData;
    const { verticalAngles, horizontalAngles, candelaValues } = measurements;
    
    // Find surrounding angle indices
    let vLower = 0, vUpper = 0;
    for (let i = 0; i < verticalAngles.length - 1; i++) {
      if (theta >= verticalAngles[i] && theta <= verticalAngles[i + 1]) {
        vLower = i;
        vUpper = i + 1;
        break;
      }
    }
    
    let hLower = 0, hUpper = 0;
    for (let i = 0; i < horizontalAngles.length - 1; i++) {
      if (phi >= horizontalAngles[i] && phi <= horizontalAngles[i + 1]) {
        hLower = i;
        hUpper = i + 1;
        break;
      }
    }
    
    // Handle wrap-around for horizontal angles
    if (hUpper === 0 && horizontalAngles.length > 1) {
      hLower = horizontalAngles.length - 1;
      hUpper = 0;
    }
    
    // Bilinear interpolation
    const vFraction = (theta - verticalAngles[vLower]) / 
                     (verticalAngles[vUpper] - verticalAngles[vLower] || 1);
    const hFraction = (phi - horizontalAngles[hLower]) / 
                     (horizontalAngles[hUpper] - horizontalAngles[hLower] || 1);
    
    const c00 = candelaValues[vLower]?.[hLower] || 0;
    const c01 = candelaValues[vLower]?.[hUpper] || 0;
    const c10 = candelaValues[vUpper]?.[hLower] || 0;
    const c11 = candelaValues[vUpper]?.[hUpper] || 0;
    
    const c0 = c00 * (1 - hFraction) + c01 * hFraction;
    const c1 = c10 * (1 - hFraction) + c11 * hFraction;
    
    return c0 * (1 - vFraction) + c1 * vFraction;
  }
  
  /**
   * Calculate contribution using estimated distribution
   */
  private calculateEstimatedContribution(
    fixture: PhotometricFixture,
    point: { x: number; y: number; z: number }
  ): number {
    if (!fixture.fallbackData) return 0;
    
    const { ppf, distributionType = 'lambertian', beamAngle = 120 } = fixture.fallbackData;
    
    // Calculate distance and angle
    const dx = point.x - fixture.position.x;
    const dy = point.y - fixture.position.y;
    const dz = point.z - fixture.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance === 0) return 0;
    
    // Calculate angle from fixture normal (pointing down)
    const angle = Math.acos(-dz / distance) * 180 / Math.PI;
    
    // Apply distribution pattern
    let intensity = 0;
    
    switch (distributionType) {
      case 'lambertian':
        // Cosine distribution
        intensity = Math.max(0, Math.cos(angle * Math.PI / 180));
        break;
        
      case 'focused':
        // Narrow beam
        if (angle <= beamAngle / 2) {
          intensity = Math.cos((angle / (beamAngle / 2)) * Math.PI / 2);
        }
        break;
        
      case 'wide':
        // Wide distribution
        if (angle <= 85) {
          intensity = Math.cos((angle / 85) * Math.PI / 2.5);
        }
        break;
        
      case 'asymmetric':
        // Simplified asymmetric - stronger in +Y direction
        const asymmetryFactor = 1 + (dy / distance) * 0.3;
        if (angle <= beamAngle / 2) {
          intensity = Math.cos((angle / (beamAngle / 2)) * Math.PI / 2) * asymmetryFactor;
        }
        break;
    }
    
    // Calculate PPFD using inverse square law
    // Total PPF distributed over a hemisphere (2π steradians)
    const ppfd = (ppf * intensity) / (2 * Math.PI * distance * distance);
    
    return ppfd;
  }
  
  /**
   * Add inter-reflection calculations (simplified)
   */
  private addInterReflection(
    grid: PPFDCalculationPoint[][],
    options: PhotometricCalculationOptions
  ): void {
    if (!options.reflectance) return;
    
    const { walls, ceiling } = options.reflectance;
    const reflectionFactor = 0.1; // Simplified - typically 10-20% increase
    
    // Add simplified inter-reflection
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const point = grid[y][x];
        const wallProximityFactor = this.calculateWallProximity(
          point.x, 
          point.y, 
          this.roomDimensions
        );
        
        const interReflection = point.ppfd * reflectionFactor * 
                               (walls * wallProximityFactor + ceiling * 0.5);
        
        point.ppfd += interReflection;
      }
    }
  }
  
  /**
   * Calculate proximity to walls (0-1)
   */
  private calculateWallProximity(
    x: number, 
    y: number, 
    room: { width: number; length: number }
  ): number {
    const distToWalls = Math.min(
      x,
      y,
      room.width - x,
      room.length - y
    );
    
    // Normalize to 0-1 (1 = very close to wall)
    return Math.max(0, 1 - distToWalls / 2);
  }
  
  /**
   * Get calculation statistics
   */
  getStatistics(grid: PPFDCalculationPoint[][]): {
    average: number;
    min: number;
    max: number;
    uniformity: number;
    cv: number; // Coefficient of variation
  } {
    const values: number[] = [];
    let sum = 0;
    let min = Infinity;
    let max = 0;
    
    for (const row of grid) {
      for (const point of row) {
        values.push(point.ppfd);
        sum += point.ppfd;
        min = Math.min(min, point.ppfd);
        max = Math.max(max, point.ppfd);
      }
    }
    
    const average = sum / values.length;
    
    // Calculate standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      average,
      min,
      max,
      uniformity: min / average,
      cv: (stdDev / average) * 100
    };
  }
}