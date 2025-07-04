// Enhanced Photometric Calculation Engine
// Inspired by Visual3D's contour rendering and automatic surface subdivision

export interface PPFDPoint {
  x: number;
  y: number;
  ppfd: number;
  dli: number;
}

export interface ContourLine {
  level: number;
  points: { x: number; y: number }[];
  color: string;
}

export interface PhotometricGrid {
  points: PPFDPoint[];
  width: number;
  height: number;
  resolution: number;
  contours: ContourLine[];
  statistics: {
    min: number;
    max: number;
    average: number;
    uniformity: number;
    coverage: number;
  };
}

export class ContourRenderingEngine {
  private adaptiveSubdivision = true;
  private maxSubdivisionLevel = 4;
  private uniformityThreshold = 0.1; // 10% variation triggers subdivision

  constructor(options: {
    adaptiveSubdivision?: boolean;
    maxSubdivisionLevel?: number;
    uniformityThreshold?: number;
  } = {}) {
    this.adaptiveSubdivision = options.adaptiveSubdivision ?? true;
    this.maxSubdivisionLevel = options.maxSubdivisionLevel ?? 4;
    this.uniformityThreshold = options.uniformityThreshold ?? 0.1;
  }

  /**
   * Calculate PPFD grid with automatic surface subdivision like Visual3D
   */
  public calculatePPFDGrid(
    fixtures: any[],
    room: { width: number; length: number; height: number },
    baseResolution: number = 24,
    photoperiod: number = 18
  ): PhotometricGrid {
    const startTime = performance.now();

    // Start with base grid
    let grid = this.createBaseGrid(room, baseResolution);
    
    // Calculate initial PPFD values
    grid = this.calculateInitialPPFD(grid, fixtures, room);

    // Apply adaptive subdivision if enabled
    if (this.adaptiveSubdivision) {
      grid = this.applyAdaptiveSubdivision(grid, fixtures, room, 0);
    }

    // Calculate DLI values
    grid.points = grid.points.map(point => ({
      ...point,
      dli: (point.ppfd * photoperiod * 3600) / 1000000 // Convert to mol·m⁻²·d⁻¹
    }));

    // Generate contour lines
    const contours = this.generateContourLines(grid);
    
    // Calculate statistics
    const statistics = this.calculateStatistics(grid.points);

    const endTime = performance.now();

    return {
      ...grid,
      contours,
      statistics
    };
  }

  /**
   * Create initial calculation grid
   */
  private createBaseGrid(
    room: { width: number; length: number; height: number },
    resolution: number
  ): PhotometricGrid {
    const points: PPFDPoint[] = [];
    const stepX = room.width / resolution;
    const stepY = room.length / resolution;

    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        points.push({
          x: i * stepX,
          y: j * stepY,
          ppfd: 0,
          dli: 0
        });
      }
    }

    return {
      points,
      width: room.width,
      height: room.length,
      resolution,
      contours: [],
      statistics: { min: 0, max: 0, average: 0, uniformity: 0, coverage: 0 }
    };
  }

  /**
   * Calculate PPFD for all grid points using fixture photometry
   */
  private calculateInitialPPFD(
    grid: PhotometricGrid,
    fixtures: any[],
    room: { width: number; length: number; height: number }
  ): PhotometricGrid {
    const updatedPoints = grid.points.map(point => {
      let totalPPFD = 0;

      for (const fixture of fixtures) {
        if (fixture.type !== 'fixture' || !fixture.enabled) continue;

        // Calculate distance from fixture to point
        const dx = point.x - fixture.x;
        const dy = point.y - fixture.y;
        const dz = (fixture.z || room.height - 3) - 0; // Assume canopy at ground level
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance === 0) continue;

        // Get fixture PPF (photosynthetic photon flux)
        const fixturePPF = this.getFixturePPF(fixture);
        if (fixturePPF <= 0) continue;

        // Calculate angle from fixture to point
        const horizontalDistance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(horizontalDistance, dz) * (180 / Math.PI);

        // Apply cosine law and angular distribution
        const cosineEffect = Math.abs(dz) / distance;
        const angularMultiplier = this.getAngularMultiplier(angle, fixture);
        
        // Calculate PPFD contribution using inverse square law
        const ppfdContribution = (fixturePPF * cosineEffect * angularMultiplier * (fixture.dimmingLevel || 100) / 100) / (distance * distance);
        
        totalPPFD += Math.max(0, ppfdContribution);
      }

      return {
        ...point,
        ppfd: totalPPFD
      };
    });

    return {
      ...grid,
      points: updatedPoints
    };
  }

  /**
   * Apply adaptive subdivision to areas with high PPFD gradients
   */
  private applyAdaptiveSubdivision(
    grid: PhotometricGrid,
    fixtures: any[],
    room: { width: number; length: number; height: number },
    level: number
  ): PhotometricGrid {
    if (level >= this.maxSubdivisionLevel) return grid;

    const newPoints: PPFDPoint[] = [...grid.points];
    const gridSize = Math.sqrt(grid.points.length);
    
    // Analyze grid for areas needing subdivision
    for (let i = 0; i < gridSize - 1; i++) {
      for (let j = 0; j < gridSize - 1; j++) {
        const indices = [
          i * gridSize + j,           // Bottom-left
          i * gridSize + (j + 1),     // Bottom-right
          (i + 1) * gridSize + j,     // Top-left
          (i + 1) * gridSize + (j + 1) // Top-right
        ];

        const cellPoints = indices.map(idx => grid.points[idx]).filter(Boolean);
        if (cellPoints.length !== 4) continue;

        // Check if this cell needs subdivision
        if (this.needsSubdivision(cellPoints)) {
          const subdivisionPoints = this.subdivideCell(cellPoints, fixtures, room);
          newPoints.push(...subdivisionPoints);
        }
      }
    }

    return {
      ...grid,
      points: newPoints,
      resolution: grid.resolution * 1.5 // Increased effective resolution
    };
  }

  /**
   * Determine if a cell needs subdivision based on PPFD variation
   */
  private needsSubdivision(cellPoints: PPFDPoint[]): boolean {
    const ppfdValues = cellPoints.map(p => p.ppfd);
    const min = Math.min(...ppfdValues);
    const max = Math.max(...ppfdValues);
    const avg = ppfdValues.reduce((a, b) => a + b, 0) / ppfdValues.length;
    
    if (avg === 0) return false;
    
    const variation = (max - min) / avg;
    return variation > this.uniformityThreshold;
  }

  /**
   * Subdivide a cell into smaller calculation points
   */
  private subdivideCell(
    cellPoints: PPFDPoint[],
    fixtures: any[],
    room: { width: number; length: number; height: number }
  ): PPFDPoint[] {
    const [bottomLeft, bottomRight, topLeft, topRight] = cellPoints;
    const subdivisionPoints: PPFDPoint[] = [];

    // Create 4 intermediate points
    const centerX = (bottomLeft.x + topRight.x) / 2;
    const centerY = (bottomLeft.y + topRight.y) / 2;
    
    const points = [
      { x: (bottomLeft.x + bottomRight.x) / 2, y: bottomLeft.y }, // Bottom center
      { x: bottomRight.x, y: (bottomRight.y + topRight.y) / 2 }, // Right center
      { x: (topLeft.x + topRight.x) / 2, y: topRight.y },        // Top center
      { x: bottomLeft.x, y: (bottomLeft.y + topLeft.y) / 2 },   // Left center
      { x: centerX, y: centerY }                                 // Cell center
    ];

    // Calculate PPFD for each subdivision point
    for (const point of points) {
      let totalPPFD = 0;

      for (const fixture of fixtures) {
        if (fixture.type !== 'fixture' || !fixture.enabled) continue;

        const dx = point.x - fixture.x;
        const dy = point.y - fixture.y;
        const dz = (fixture.z || room.height - 3) - 0;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance === 0) continue;

        const fixturePPF = this.getFixturePPF(fixture);
        if (fixturePPF <= 0) continue;

        const horizontalDistance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(horizontalDistance, dz) * (180 / Math.PI);
        const cosineEffect = Math.abs(dz) / distance;
        const angularMultiplier = this.getAngularMultiplier(angle, fixture);
        
        const ppfdContribution = (fixturePPF * cosineEffect * angularMultiplier * (fixture.dimmingLevel || 100) / 100) / (distance * distance);
        totalPPFD += Math.max(0, ppfdContribution);
      }

      subdivisionPoints.push({
        x: point.x,
        y: point.y,
        ppfd: totalPPFD,
        dli: 0
      });
    }

    return subdivisionPoints;
  }

  /**
   * Generate contour lines for visualization
   */
  private generateContourLines(grid: PhotometricGrid): ContourLine[] {
    const contours: ContourLine[] = [];
    const ppfdValues = grid.points.map(p => p.ppfd);
    const min = Math.min(...ppfdValues);
    const max = Math.max(...ppfdValues);
    
    // Define contour levels (every 100 PPFD)
    const levels = [];
    for (let level = Math.ceil(min / 100) * 100; level <= max; level += 100) {
      levels.push(level);
    }

    // Generate contour lines using marching squares algorithm (simplified)
    for (const level of levels) {
      const contourPoints = this.marchingSquares(grid, level);
      if (contourPoints.length > 0) {
        contours.push({
          level,
          points: contourPoints,
          color: this.getContourColor(level, min, max)
        });
      }
    }

    return contours;
  }

  /**
   * Simplified marching squares for contour generation
   */
  private marchingSquares(grid: PhotometricGrid, level: number): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const gridSize = Math.sqrt(grid.points.length);
    
    for (let i = 0; i < gridSize - 1; i++) {
      for (let j = 0; j < gridSize - 1; j++) {
        const indices = [
          i * gridSize + j,
          i * gridSize + (j + 1),
          (i + 1) * gridSize + j,
          (i + 1) * gridSize + (j + 1)
        ];

        const cellPoints = indices.map(idx => grid.points[idx]).filter(Boolean);
        if (cellPoints.length !== 4) continue;

        // Check if contour line passes through this cell
        const above = cellPoints.filter(p => p.ppfd >= level).length;
        const below = cellPoints.filter(p => p.ppfd < level).length;
        
        if (above > 0 && below > 0) {
          // Contour passes through this cell - add interpolated points
          const [bl, br, tl, tr] = cellPoints;
          
          // Simple interpolation for contour points
          if ((bl.ppfd >= level) !== (br.ppfd >= level)) {
            const t = (level - bl.ppfd) / (br.ppfd - bl.ppfd);
            points.push({ x: bl.x + t * (br.x - bl.x), y: bl.y });
          }
          
          if ((br.ppfd >= level) !== (tr.ppfd >= level)) {
            const t = (level - br.ppfd) / (tr.ppfd - br.ppfd);
            points.push({ x: br.x, y: br.y + t * (tr.y - br.y) });
          }
        }
      }
    }

    return points;
  }

  /**
   * Calculate grid statistics
   */
  private calculateStatistics(points: PPFDPoint[]) {
    const ppfdValues = points.map(p => p.ppfd);
    const min = Math.min(...ppfdValues);
    const max = Math.max(...ppfdValues);
    const average = ppfdValues.reduce((a, b) => a + b, 0) / ppfdValues.length;
    
    // Calculate uniformity (min/max ratio)
    const uniformity = max > 0 ? min / max : 0;
    
    // Calculate coverage (percentage of area above 200 PPFD)
    const coverageThreshold = 200;
    const coveredPoints = ppfdValues.filter(ppfd => ppfd >= coverageThreshold).length;
    const coverage = (coveredPoints / ppfdValues.length) * 100;

    return {
      min: Math.round(min),
      max: Math.round(max),
      average: Math.round(average),
      uniformity: Math.round(uniformity * 100) / 100,
      coverage: Math.round(coverage)
    };
  }

  /**
   * Get fixture PPF from fixture data
   */
  private getFixturePPF(fixture: any): number {
    // Try to get PPF from fixture properties
    if (fixture.ppf) return fixture.ppf;
    if (fixture.model?.ppf) return fixture.model.ppf;
    
    // Estimate from wattage if PPF not available
    const wattage = fixture.wattage || fixture.model?.wattage || 0;
    const efficacy = fixture.efficacy || fixture.model?.efficacy || 2.5; // μmol/J
    
    return wattage * efficacy;
  }

  /**
   * Get angular light distribution multiplier
   */
  private getAngularMultiplier(angle: number, fixture: any): number {
    // Simplified Lambertian distribution
    // Real fixtures would use IES photometric data
    const beamAngle = fixture.beamAngle || 120;
    
    if (angle > beamAngle / 2) {
      return Math.max(0, Math.cos((angle - beamAngle / 2) * Math.PI / 180) ** 2);
    }
    
    return Math.cos(angle * Math.PI / 180);
  }

  /**
   * Get color for contour line based on PPFD level
   */
  private getContourColor(level: number, min: number, max: number): string {
    const normalized = (level - min) / (max - min);
    
    if (normalized < 0.2) return '#3b82f6'; // Blue (low)
    if (normalized < 0.4) return '#10b981'; // Green
    if (normalized < 0.6) return '#f59e0b'; // Yellow
    if (normalized < 0.8) return '#ef4444'; // Red
    return '#8b5cf6'; // Purple (high)
  }
}