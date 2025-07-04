import type { ParsedIESFile } from './ies-parser';

export interface MaterialProperties {
  name: string;
  reflectance: number; // 0-1
  specularity: number; // 0-1 (0 = diffuse, 1 = mirror)
  transmittance: number; // 0-1
  color: { r: number; g: number; b: number };
}

export interface CalculationSurface {
  id: string;
  name: string;
  type: 'workplane' | 'wall' | 'ceiling' | 'floor' | 'custom';
  height: number; // meters from floor
  points: { x: number; y: number; z: number }[];
  material: MaterialProperties;
  gridSpacing: number; // meters
}

export interface CalculationPoint {
  x: number;
  y: number;
  z: number;
  illuminance: number; // lux
  ppfd: number; // μmol/m²/s
  uniformity: number;
  direct: number;
  indirect: number;
}

export interface UniformityMetrics {
  average: number;
  minimum: number;
  maximum: number;
  minToAvg: number; // Min/Avg ratio
  minToMax: number; // Min/Max ratio
  avgToMax: number; // Avg/Max ratio
  cv: number; // Coefficient of Variation
}

export interface DaylightData {
  latitude: number;
  longitude: number;
  timezone: number;
  date: Date;
  skyCondition: 'clear' | 'partly_cloudy' | 'overcast';
  solarAzimuth: number;
  solarAltitude: number;
  directNormalIrradiance: number;
  diffuseHorizontalIrradiance: number;
  globalHorizontalIrradiance: number;
}

export const STANDARD_MATERIALS: Record<string, MaterialProperties> = {
  concrete: {
    name: 'Concrete',
    reflectance: 0.25,
    specularity: 0.1,
    transmittance: 0,
    color: { r: 180, g: 180, b: 180 }
  },
  whiteWall: {
    name: 'White Wall',
    reflectance: 0.85,
    specularity: 0.15,
    transmittance: 0,
    color: { r: 250, g: 250, b: 250 }
  },
  carpet: {
    name: 'Carpet',
    reflectance: 0.15,
    specularity: 0.05,
    transmittance: 0,
    color: { r: 80, g: 80, b: 80 }
  },
  glass: {
    name: 'Glass',
    reflectance: 0.08,
    specularity: 0.9,
    transmittance: 0.88,
    color: { r: 240, g: 240, b: 240 }
  },
  metal: {
    name: 'Metal',
    reflectance: 0.7,
    specularity: 0.85,
    transmittance: 0,
    color: { r: 200, g: 200, b: 200 }
  },
  mylar: {
    name: 'Mylar (Reflective)',
    reflectance: 0.95,
    specularity: 0.9,
    transmittance: 0,
    color: { r: 255, g: 255, b: 255 }
  }
};

export class AdvancedCalculationEngine {
  private maxReflections = 5;
  private rayCount = 1000;
  
  calculateIlluminance(
    fixtures: any[],
    surfaces: CalculationSurface[],
    roomDimensions: { width: number; length: number; height: number },
    daylightData?: DaylightData
  ): Map<string, CalculationPoint[]> {
    const results = new Map<string, CalculationPoint[]>();
    
    surfaces.forEach(surface => {
      const points = this.generateCalculationGrid(surface);
      const calculatedPoints: CalculationPoint[] = [];
      
      points.forEach(point => {
        let totalIlluminance = 0;
        let totalPPFD = 0;
        let directComponent = 0;
        let indirectComponent = 0;
        
        // Direct illumination from fixtures
        fixtures.forEach(fixture => {
          if (fixture.enabled) {
            const { illuminance, ppfd } = this.calculateDirectLight(
              fixture,
              point,
              surfaces
            );
            totalIlluminance += illuminance;
            totalPPFD += ppfd;
            directComponent += illuminance;
          }
        });
        
        // Indirect illumination (inter-reflections)
        const indirect = this.calculateIndirectLight(
          fixtures,
          point,
          surfaces,
          roomDimensions
        );
        totalIlluminance += indirect;
        indirectComponent = indirect;
        
        // Daylight contribution
        if (daylightData) {
          const daylight = this.calculateDaylight(point, daylightData, surfaces);
          totalIlluminance += daylight;
          indirectComponent += daylight;
        }
        
        calculatedPoints.push({
          ...point,
          illuminance: totalIlluminance,
          ppfd: totalPPFD,
          uniformity: 0, // Will be calculated after all points
          direct: directComponent,
          indirect: indirectComponent
        });
      });
      
      // Calculate uniformity metrics
      const uniformity = this.calculateUniformity(calculatedPoints);
      calculatedPoints.forEach(point => {
        point.uniformity = uniformity.minToAvg;
      });
      
      results.set(surface.id, calculatedPoints);
    });
    
    return results;
  }
  
  private generateCalculationGrid(surface: CalculationSurface): CalculationPoint[] {
    const points: CalculationPoint[] = [];
    
    if (surface.type === 'workplane') {
      // Generate regular grid on horizontal plane
      const bounds = this.getBounds(surface.points);
      
      for (let x = bounds.minX; x <= bounds.maxX; x += surface.gridSpacing) {
        for (let y = bounds.minY; y <= bounds.maxY; y += surface.gridSpacing) {
          if (this.isPointInPolygon(x, y, surface.points)) {
            points.push({
              x,
              y,
              z: surface.height,
              illuminance: 0,
              ppfd: 0,
              uniformity: 0,
              direct: 0,
              indirect: 0
            });
          }
        }
      }
    } else {
      // For walls, ceilings, etc., generate points on the surface
      // Simplified - in production, use proper surface triangulation
      const center = this.getCenter(surface.points);
      points.push({
        ...center,
        illuminance: 0,
        ppfd: 0,
        uniformity: 0,
        direct: 0,
        indirect: 0
      });
    }
    
    return points;
  }
  
  private calculateDirectLight(
    fixture: any,
    point: CalculationPoint,
    surfaces: CalculationSurface[]
  ): { illuminance: number; ppfd: number } {
    // Vector from fixture to point
    const dx = point.x - fixture.x;
    const dy = point.y - fixture.y;
    const dz = point.z - fixture.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance === 0) return { illuminance: 0, ppfd: 0 };
    
    // Check for obstructions
    const obstructed = this.isObstructed(
      { x: fixture.x, y: fixture.y, z: fixture.z },
      point,
      surfaces
    );
    
    if (obstructed) return { illuminance: 0, ppfd: 0 };
    
    // Calculate angle from fixture normal
    const angle = Math.acos(-dz / distance) * 180 / Math.PI;
    
    // Get intensity from photometric data
    let intensity = fixture.model.ppf || 1000; // Default candela
    
    if (fixture.photometricData) {
      intensity = this.interpolatePhotometricData(
        fixture.photometricData,
        angle,
        0 // Horizontal angle - simplified
      );
    }
    
    // Apply dimming
    const dimmingFactor = (fixture.dimmingLevel || 100) / 100;
    intensity *= dimmingFactor;
    
    // Inverse square law
    const illuminance = intensity / (distance * distance);
    
    // Convert to PPFD (rough approximation)
    const ppfd = illuminance * 0.02; // Varies by spectrum
    
    return { illuminance, ppfd };
  }
  
  private calculateIndirectLight(
    fixtures: any[],
    point: CalculationPoint,
    surfaces: CalculationSurface[],
    roomDimensions: any
  ): number {
    // Simplified radiosity calculation
    // In production, use proper radiosity or ray tracing
    
    let totalIndirect = 0;
    const samples = 100;
    
    for (let i = 0; i < samples; i++) {
      // Random ray direction
      const theta = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * Math.PI * 2;
      const phi = Math.acos(2 * crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 1);
      
      const dir = {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi)
      };
      
      // Trace ray and accumulate bounces
      let rayIntensity = 0;
      let currentPoint = { ...point };
      let currentDir = { ...dir };
      let bounces = 0;
      
      while (bounces < this.maxReflections) {
        const hit = this.rayIntersectSurfaces(currentPoint, currentDir, surfaces);
        
        if (!hit) break;
        
        // Add contribution from this surface
        const surfaceLuminance = this.getSurfaceLuminance(hit.surface, hit.point, fixtures);
        rayIntensity += surfaceLuminance * hit.surface.material.reflectance;
        
        // Setup for next bounce
        currentPoint = hit.point;
        currentDir = this.reflectRay(currentDir, hit.normal);
        bounces++;
      }
      
      totalIndirect += rayIntensity;
    }
    
    return totalIndirect / samples;
  }
  
  private calculateDaylight(
    point: CalculationPoint,
    daylightData: DaylightData,
    surfaces: CalculationSurface[]
  ): number {
    // Simplified daylight calculation
    // Direct sunlight component
    const sunDir = this.getSunDirection(daylightData.solarAzimuth, daylightData.solarAltitude);
    const directSun = this.isObstructed(point, sunDir, surfaces) 
      ? 0 
      : daylightData.directNormalIrradiance * Math.max(0, sunDir.z);
    
    // Sky component (diffuse)
    const skyComponent = daylightData.diffuseHorizontalIrradiance * 0.5; // Simplified
    
    return (directSun + skyComponent) * 0.0079; // Convert W/m² to lux (rough)
  }
  
  calculateUniformity(points: CalculationPoint[]): UniformityMetrics {
    if (points.length === 0) {
      return {
        average: 0,
        minimum: 0,
        maximum: 0,
        minToAvg: 0,
        minToMax: 0,
        avgToMax: 0,
        cv: 0
      };
    }
    
    const values = points.map(p => p.illuminance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Calculate standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = avg > 0 ? stdDev / avg : 0;
    
    return {
      average: avg,
      minimum: min,
      maximum: max,
      minToAvg: avg > 0 ? min / avg : 0,
      minToMax: max > 0 ? min / max : 0,
      avgToMax: max > 0 ? avg / max : 0,
      cv
    };
  }
  
  // Utility methods
  private getBounds(points: { x: number; y: number }[]) {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  }
  
  private getCenter(points: { x: number; y: number; z: number }[]) {
    const sum = points.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z }),
      { x: 0, y: 0, z: 0 }
    );
    return {
      x: sum.x / points.length,
      y: sum.y / points.length,
      z: sum.z / points.length
    };
  }
  
  private isPointInPolygon(x: number, y: number, polygon: { x: number; y: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      
      const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }
  
  private isObstructed(from: any, to: any, surfaces: CalculationSurface[]): boolean {
    // Simplified obstruction check
    // In production, implement proper ray-surface intersection
    return false;
  }
  
  private interpolatePhotometricData(data: ParsedIESFile, verticalAngle: number, horizontalAngle: number): number {
    // Bilinear interpolation of photometric data
    // Simplified - in production, use proper interpolation
    return data.photometry.maxCandela || 1000;
  }
  
  private rayIntersectSurfaces(origin: any, direction: any, surfaces: CalculationSurface[]): any {
    // Simplified ray-surface intersection
    // In production, implement proper ray tracing
    return null;
  }
  
  private getSurfaceLuminance(surface: CalculationSurface, point: any, fixtures: any[]): number {
    // Calculate luminance at a point on a surface
    return 0;
  }
  
  private reflectRay(incoming: any, normal: any): any {
    // Reflect ray direction based on surface normal
    return incoming;
  }
  
  private getSunDirection(azimuth: number, altitude: number): any {
    const azRad = azimuth * Math.PI / 180;
    const altRad = altitude * Math.PI / 180;
    
    return {
      x: Math.cos(altRad) * Math.sin(azRad),
      y: Math.cos(altRad) * Math.cos(azRad),
      z: Math.sin(altRad)
    };
  }
}