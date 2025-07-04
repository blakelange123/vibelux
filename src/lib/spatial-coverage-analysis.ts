/**
 * Spatial Coverage Analysis for Lighting Uniformity
 * Implements advanced algorithms for light distribution analysis
 */

interface Point3D {
  x: number;
  y: number;
  z: number;
  ppfd?: number;
}

interface LightSource {
  id: string;
  position: Point3D;
  ppf: number;           // μmol/s
  beamAngle: number;     // degrees
  efficiency: number;    // 0-1
}

interface CoverageResult {
  uniformity: number;              // 0-100%
  averagePPFD: number;            // μmol/m²/s
  minPPFD: number;
  maxPPFD: number;
  coverageRatio: number;          // % of area meeting minimum PPFD
  hotspots: Point3D[];            // Areas with excessive light
  darkSpots: Point3D[];           // Areas with insufficient light
  variationCoefficient: number;   // Statistical measure of uniformity
}

interface GridCell {
  x: number;
  y: number;
  ppfd: number;
  sources: Map<string, number>;   // Contribution from each light source
}

export class SpatialCoverageAnalysis {
  private gridResolution: number = 0.1; // 10cm grid cells
  private minimumPPFD: number = 200;    // Minimum acceptable PPFD
  private targetPPFD: number = 400;     // Target PPFD
  
  /**
   * Analyze spatial coverage and uniformity
   */
  analyzeCoverage(
    roomDimensions: { width: number; length: number; height: number },
    lightSources: LightSource[],
    canopyHeight: number = 1.0,
    options?: {
      gridResolution?: number;
      minimumPPFD?: number;
      targetPPFD?: number;
    }
  ): CoverageResult {
    // Apply options
    if (options?.gridResolution) this.gridResolution = options.gridResolution;
    if (options?.minimumPPFD) this.minimumPPFD = options.minimumPPFD;
    if (options?.targetPPFD) this.targetPPFD = options.targetPPFD;
    
    // Generate grid at canopy level
    const grid = this.generateGrid(roomDimensions, canopyHeight);
    
    // Calculate PPFD at each grid point
    this.calculatePPFDDistribution(grid, lightSources, canopyHeight);
    
    // Analyze uniformity and coverage
    return this.analyzeGrid(grid);
  }
  
  /**
   * Generate measurement grid
   */
  private generateGrid(
    dimensions: { width: number; length: number; height: number },
    canopyHeight: number
  ): GridCell[][] {
    const cols = Math.ceil(dimensions.width / this.gridResolution);
    const rows = Math.ceil(dimensions.length / this.gridResolution);
    
    const grid: GridCell[][] = [];
    
    for (let i = 0; i < rows; i++) {
      grid[i] = [];
      for (let j = 0; j < cols; j++) {
        grid[i][j] = {
          x: j * this.gridResolution,
          y: i * this.gridResolution,
          ppfd: 0,
          sources: new Map()
        };
      }
    }
    
    return grid;
  }
  
  /**
   * Calculate PPFD distribution using inverse square law with beam angle
   */
  private calculatePPFDDistribution(
    grid: GridCell[][],
    sources: LightSource[],
    canopyHeight: number
  ): void {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const cell = grid[i][j];
        
        for (const source of sources) {
          // Calculate distance from source to grid point
          const dx = cell.x - source.position.x;
          const dy = cell.y - source.position.y;
          const dz = source.position.z - canopyHeight;
          
          const horizontalDistance = Math.sqrt(dx * dx + dy * dy);
          const totalDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          // Calculate angle from source to point
          const angle = Math.atan2(horizontalDistance, dz) * 180 / Math.PI;
          
          // Check if point is within beam angle
          if (angle <= source.beamAngle / 2) {
            // Calculate intensity using inverse square law
            const distanceFactor = 1 / (totalDistance * totalDistance);
            
            // Apply beam angle intensity profile (cosine distribution)
            const angleFactor = Math.cos((angle / (source.beamAngle / 2)) * Math.PI / 2);
            
            // Calculate PPFD contribution from this source
            const ppfdContribution = source.ppf * source.efficiency * 
                                   distanceFactor * angleFactor / (Math.PI * 2);
            
            cell.ppfd += ppfdContribution;
            cell.sources.set(source.id, ppfdContribution);
          }
        }
      }
    }
  }
  
  /**
   * Analyze grid for uniformity metrics
   */
  private analyzeGrid(grid: GridCell[][]): CoverageResult {
    const allCells = grid.flat();
    const ppfdValues = allCells.map(cell => cell.ppfd);
    
    // Basic statistics
    const avgPPFD = ppfdValues.reduce((a, b) => a + b, 0) / ppfdValues.length;
    const minPPFD = Math.min(...ppfdValues);
    const maxPPFD = Math.max(...ppfdValues);
    
    // Uniformity calculation (min/avg ratio)
    const uniformity = (minPPFD / avgPPFD) * 100;
    
    // Coverage ratio (cells meeting minimum PPFD)
    const cellsMeetingMinimum = ppfdValues.filter(ppfd => ppfd >= this.minimumPPFD).length;
    const coverageRatio = (cellsMeetingMinimum / ppfdValues.length) * 100;
    
    // Coefficient of variation
    const variance = ppfdValues.reduce((sum, ppfd) => {
      return sum + Math.pow(ppfd - avgPPFD, 2);
    }, 0) / ppfdValues.length;
    const stdDev = Math.sqrt(variance);
    const variationCoefficient = (stdDev / avgPPFD) * 100;
    
    // Find hotspots and dark spots
    const hotspots: Point3D[] = [];
    const darkSpots: Point3D[] = [];
    
    allCells.forEach(cell => {
      if (cell.ppfd > this.targetPPFD * 1.5) {
        hotspots.push({
          x: cell.x,
          y: cell.y,
          z: 0, // Canopy level
          ppfd: cell.ppfd
        });
      } else if (cell.ppfd < this.minimumPPFD) {
        darkSpots.push({
          x: cell.x,
          y: cell.y,
          z: 0,
          ppfd: cell.ppfd
        });
      }
    });
    
    return {
      uniformity: Number(uniformity.toFixed(1)),
      averagePPFD: Number(avgPPFD.toFixed(1)),
      minPPFD: Number(minPPFD.toFixed(1)),
      maxPPFD: Number(maxPPFD.toFixed(1)),
      coverageRatio: Number(coverageRatio.toFixed(1)),
      hotspots,
      darkSpots,
      variationCoefficient: Number(variationCoefficient.toFixed(1))
    };
  }
  
  /**
   * Generate Voronoi tessellation for hotspot detection
   */
  generateVoronoiMap(
    roomDimensions: { width: number; length: number },
    lightSources: LightSource[]
  ): {
    cells: Array<{
      source: LightSource;
      polygon: Point3D[];
      area: number;
    }>;
  } {
    // Simplified Voronoi implementation
    // In production, use a proper computational geometry library
    
    const cells = lightSources.map(source => {
      // Find region closer to this source than any other
      const polygon: Point3D[] = [];
      
      // Generate boundary points
      for (let angle = 0; angle < 360; angle += 30) {
        const rad = angle * Math.PI / 180;
        let distance = 0;
        let found = false;
        
        // Find boundary by stepping outward
        while (!found && distance < Math.max(roomDimensions.width, roomDimensions.length)) {
          distance += 0.1;
          const testX = source.position.x + distance * Math.cos(rad);
          const testY = source.position.y + distance * Math.sin(rad);
          
          // Check if this point is closer to another source
          for (const other of lightSources) {
            if (other.id === source.id) continue;
            
            const distToThis = Math.sqrt(
              Math.pow(testX - source.position.x, 2) + 
              Math.pow(testY - source.position.y, 2)
            );
            const distToOther = Math.sqrt(
              Math.pow(testX - other.position.x, 2) + 
              Math.pow(testY - other.position.y, 2)
            );
            
            if (distToOther < distToThis) {
              found = true;
              break;
            }
          }
        }
        
        polygon.push({
          x: source.position.x + distance * Math.cos(rad),
          y: source.position.y + distance * Math.sin(rad),
          z: source.position.z
        });
      }
      
      // Calculate area using shoelace formula
      let area = 0;
      for (let i = 0; i < polygon.length; i++) {
        const j = (i + 1) % polygon.length;
        area += polygon[i].x * polygon[j].y;
        area -= polygon[j].x * polygon[i].y;
      }
      area = Math.abs(area) / 2;
      
      return { source, polygon, area };
    });
    
    return { cells };
  }
  
  /**
   * Ray tracing for shadow analysis
   */
  traceShadows(
    lightSource: LightSource,
    targetPoint: Point3D,
    obstacles: Array<{
      position: Point3D;
      dimensions: { width: number; height: number; depth: number };
    }>
  ): boolean {
    // Ray from light to target
    const ray = {
      origin: lightSource.position,
      direction: {
        x: targetPoint.x - lightSource.position.x,
        y: targetPoint.y - lightSource.position.y,
        z: targetPoint.z - lightSource.position.z
      }
    };
    
    // Normalize direction
    const length = Math.sqrt(
      ray.direction.x ** 2 + 
      ray.direction.y ** 2 + 
      ray.direction.z ** 2
    );
    ray.direction.x /= length;
    ray.direction.y /= length;
    ray.direction.z /= length;
    
    // Check intersection with each obstacle
    for (const obstacle of obstacles) {
      // Simplified AABB (Axis-Aligned Bounding Box) intersection
      const tMin = {
        x: (obstacle.position.x - ray.origin.x) / ray.direction.x,
        y: (obstacle.position.y - ray.origin.y) / ray.direction.y,
        z: (obstacle.position.z - ray.origin.z) / ray.direction.z
      };
      
      const tMax = {
        x: (obstacle.position.x + obstacle.dimensions.width - ray.origin.x) / ray.direction.x,
        y: (obstacle.position.y + obstacle.dimensions.height - ray.origin.y) / ray.direction.y,
        z: (obstacle.position.z + obstacle.dimensions.depth - ray.origin.z) / ray.direction.z
      };
      
      // Check if ray intersects the box
      const tEnter = Math.max(
        Math.min(tMin.x, tMax.x),
        Math.min(tMin.y, tMax.y),
        Math.min(tMin.z, tMax.z)
      );
      
      const tExit = Math.min(
        Math.max(tMin.x, tMax.x),
        Math.max(tMin.y, tMax.y),
        Math.max(tMin.z, tMax.z)
      );
      
      if (tEnter < tExit && tEnter > 0 && tEnter < length) {
        return true; // Shadow detected
      }
    }
    
    return false; // No shadow
  }
  
  /**
   * Calculate gradient for optimization
   */
  calculatePPFDGradient(
    grid: GridCell[][],
    targetPPFD: number
  ): {
    maxGradient: number;
    gradientDirection: { x: number; y: number };
    smoothness: number;
  } {
    let maxGradient = 0;
    let gradientDirection = { x: 0, y: 0 };
    let totalGradient = 0;
    let gradientCount = 0;
    
    for (let i = 1; i < grid.length - 1; i++) {
      for (let j = 1; j < grid[i].length - 1; j++) {
        // Calculate gradient using central differences
        const dx = (grid[i][j + 1].ppfd - grid[i][j - 1].ppfd) / (2 * this.gridResolution);
        const dy = (grid[i + 1][j].ppfd - grid[i - 1][j].ppfd) / (2 * this.gridResolution);
        
        const gradientMagnitude = Math.sqrt(dx * dx + dy * dy);
        totalGradient += gradientMagnitude;
        gradientCount++;
        
        if (gradientMagnitude > maxGradient) {
          maxGradient = gradientMagnitude;
          gradientDirection = { x: dx, y: dy };
        }
      }
    }
    
    const avgGradient = totalGradient / gradientCount;
    const smoothness = 1 / (1 + avgGradient / targetPPFD);
    
    return {
      maxGradient: Number(maxGradient.toFixed(2)),
      gradientDirection,
      smoothness: Number(smoothness.toFixed(3))
    };
  }
  
  /**
   * Optimize light placement for uniformity
   */
  optimizePlacement(
    roomDimensions: { width: number; length: number; height: number },
    numberOfLights: number,
    fixtureSpecs: {
      ppf: number;
      beamAngle: number;
      efficiency: number;
    },
    canopyHeight: number = 1.0
  ): LightSource[] {
    // Calculate optimal grid arrangement
    const aspectRatio = roomDimensions.width / roomDimensions.length;
    let cols = Math.round(Math.sqrt(numberOfLights * aspectRatio));
    let rows = Math.round(numberOfLights / cols);
    
    // Adjust for exact count
    while (cols * rows < numberOfLights) {
      if (aspectRatio > 1) cols++;
      else rows++;
    }
    
    // Calculate spacing
    const xSpacing = roomDimensions.width / (cols + 1);
    const ySpacing = roomDimensions.length / (rows + 1);
    
    // Generate light positions
    const lights: LightSource[] = [];
    let lightIndex = 0;
    
    for (let row = 1; row <= rows && lightIndex < numberOfLights; row++) {
      for (let col = 1; col <= cols && lightIndex < numberOfLights; col++) {
        lights.push({
          id: `light_${lightIndex}`,
          position: {
            x: col * xSpacing,
            y: row * ySpacing,
            z: roomDimensions.height - 0.3 // 30cm from ceiling
          },
          ppf: fixtureSpecs.ppf,
          beamAngle: fixtureSpecs.beamAngle,
          efficiency: fixtureSpecs.efficiency
        });
        lightIndex++;
      }
    }
    
    return lights;
  }
}

// Export singleton instance
export const spatialAnalysis = new SpatialCoverageAnalysis();