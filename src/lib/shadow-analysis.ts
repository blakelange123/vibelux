/**
 * Real-time Shadow Analysis with Dynamic Sun Positioning
 * Professional solar path calculation and shadow simulation
 */

import { Vector3D } from './monte-carlo-raytracing';

export interface SolarPosition {
  azimuth: number; // degrees from North (0-360)
  elevation: number; // degrees above horizon (0-90)
  zenith: number; // degrees from vertical (0-90)
  x: number; // unit vector component
  y: number; // unit vector component
  z: number; // unit vector component
}

export interface Location {
  latitude: number; // degrees (-90 to 90)
  longitude: number; // degrees (-180 to 180)
  timezone: number; // UTC offset in hours
  elevation?: number; // meters above sea level
}

export interface SolarPath {
  date: Date;
  positions: (SolarPosition & { time: Date; isDaylight: boolean })[];
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  dayLength: number; // hours
}

export interface ShadowGeometry {
  id: string;
  vertices: Vector3D[];
  height: number;
  type: 'building' | 'tree' | 'structure' | 'equipment';
  name?: string;
}

export interface ShadowResult {
  time: Date;
  solarPosition: SolarPosition;
  shadows: {
    geometry: ShadowGeometry;
    shadowVertices: Vector3D[];
    area: number;
    length: number;
  }[];
  shadedArea: number;
  totalArea: number;
  shadingPercentage: number;
}

export interface SolarAnalysisSettings {
  location: Location;
  analysisDate: Date;
  timeStep: number; // minutes
  includeReflectedLight: boolean;
  atmosphericConditions: {
    clearness: number; // 0-1 (0=overcast, 1=clear)
    turbidity: number; // atmospheric turbidity factor
  };
}

export class SolarShadowAnalyzer {
  private location: Location;
  private geometries: ShadowGeometry[];
  private groundPlane: { z: number; bounds: { minX: number; maxX: number; minY: number; maxY: number } };

  constructor(location: Location) {
    this.location = location;
    this.geometries = [];
    this.groundPlane = {
      z: 0,
      bounds: { minX: -50, maxX: 50, minY: -50, maxY: 50 }
    };
  }

  /**
   * Calculate solar position for a given date and time
   */
  public calculateSolarPosition(dateTime: Date): SolarPosition {
    const lat = this.degreesToRadians(this.location.latitude);
    const lon = this.degreesToRadians(this.location.longitude);
    
    // Julian day number
    const julianDay = this.getJulianDay(dateTime);
    
    // Number of days since J2000.0
    const n = julianDay - 2451545.0;
    
    // Mean longitude of the sun
    const L = this.normalizeAngle(280.460 + 0.9856474 * n);
    
    // Mean anomaly of the sun
    const g = this.degreesToRadians(this.normalizeAngle(357.528 + 0.9856003 * n));
    
    // Ecliptic longitude of the sun
    const lambda = this.degreesToRadians(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
    
    // Obliquity of the ecliptic
    const epsilon = this.degreesToRadians(23.439 - 0.0000004 * n);
    
    // Right ascension and declination
    const alpha = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));
    const delta = Math.asin(Math.sin(epsilon) * Math.sin(lambda));
    
    // Local hour angle
    const localTime = dateTime.getHours() + dateTime.getMinutes() / 60.0 + dateTime.getSeconds() / 3600.0;
    const timeCorrection = this.getTimeCorrection(dateTime, lon);
    const solarTime = localTime + timeCorrection;
    const hourAngle = this.degreesToRadians(15 * (solarTime - 12));
    
    // Solar elevation and azimuth
    const elevation = Math.asin(
      Math.sin(lat) * Math.sin(delta) + 
      Math.cos(lat) * Math.cos(delta) * Math.cos(hourAngle)
    );
    
    const azimuth = Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin(lat) - Math.tan(delta) * Math.cos(lat)
    );
    
    // Convert to degrees and normalize
    const elevationDeg = this.radiansToDegrees(elevation);
    const azimuthDeg = this.normalizeAngle(this.radiansToDegrees(azimuth) + 180);
    const zenithDeg = 90 - elevationDeg;
    
    // Convert to unit vector (sun direction)
    const x = Math.sin(azimuth) * Math.cos(elevation);
    const y = Math.cos(azimuth) * Math.cos(elevation);
    const z = Math.sin(elevation);
    
    return {
      azimuth: azimuthDeg,
      elevation: elevationDeg,
      zenith: zenithDeg,
      x,
      y,
      z
    };
  }

  /**
   * Generate complete solar path for a given date
   */
  public generateSolarPath(date: Date, timeStepMinutes: number = 15): SolarPath {
    const positions: (SolarPosition & { time: Date; isDaylight: boolean })[] = [];
    let sunrise: Date | null = null;
    let sunset: Date | null = null;
    let solarNoon: Date | null = null;
    let maxElevation = -90;
    
    // Generate positions for entire day
    for (let hour = 0; hour < 24; hour += timeStepMinutes / 60) {
      const time = new Date(date);
      time.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
      
      const position = this.calculateSolarPosition(time);
      const isDaylight = position.elevation > 0;
      
      positions.push({
        ...position,
        time,
        isDaylight
      });
      
      // Find sunrise (first positive elevation)
      if (!sunrise && position.elevation > 0) {
        sunrise = new Date(time);
      }
      
      // Find sunset (last positive elevation)
      if (position.elevation > 0) {
        sunset = new Date(time);
      }
      
      // Find solar noon (maximum elevation)
      if (position.elevation > maxElevation) {
        maxElevation = position.elevation;
        solarNoon = new Date(time);
      }
    }
    
    const dayLength = sunrise && sunset ? (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60) : 0;
    
    return {
      date,
      positions,
      sunrise: sunrise || new Date(date),
      sunset: sunset || new Date(date),
      solarNoon: solarNoon || new Date(date),
      dayLength
    };
  }

  /**
   * Add shadow-casting geometry
   */
  public addGeometry(geometry: ShadowGeometry): void {
    this.geometries.push(geometry);
  }

  /**
   * Remove geometry
   */
  public removeGeometry(id: string): void {
    this.geometries = this.geometries.filter(g => g.id !== id);
  }

  /**
   * Set ground plane for shadow projection
   */
  public setGroundPlane(z: number, bounds: { minX: number; maxX: number; minY: number; maxY: number }): void {
    this.groundPlane = { z, bounds };
  }

  /**
   * Calculate shadows for a specific time
   */
  public calculateShadows(dateTime: Date): ShadowResult {
    const solarPosition = this.calculateSolarPosition(dateTime);
    const shadows: ShadowResult['shadows'] = [];
    
    // If sun is below horizon, no shadows
    if (solarPosition.elevation <= 0) {
      return {
        time: dateTime,
        solarPosition,
        shadows: [],
        shadedArea: 0,
        totalArea: this.calculateTotalArea(),
        shadingPercentage: 0
      };
    }
    
    // Calculate shadow for each geometry
    for (const geometry of this.geometries) {
      const shadowVertices = this.projectShadowVertices(geometry, solarPosition);
      const shadowArea = this.calculatePolygonArea(shadowVertices);
      const shadowLength = this.calculateShadowLength(geometry, solarPosition);
      
      shadows.push({
        geometry,
        shadowVertices,
        area: shadowArea,
        length: shadowLength
      });
    }
    
    // Calculate total shaded area (accounting for overlaps)
    const totalShadedArea = this.calculateTotalShadedArea(shadows.map(s => s.shadowVertices));
    const totalArea = this.calculateTotalArea();
    const shadingPercentage = totalArea > 0 ? (totalShadedArea / totalArea) * 100 : 0;
    
    return {
      time: dateTime,
      solarPosition,
      shadows,
      shadedArea: totalShadedArea,
      totalArea,
      shadingPercentage
    };
  }

  /**
   * Analyze shadows over time period
   */
  public analyzeShadowsOverTime(
    startTime: Date,
    endTime: Date,
    timeStepMinutes: number = 30
  ): ShadowResult[] {
    const results: ShadowResult[] = [];
    const current = new Date(startTime);
    
    while (current <= endTime) {
      const shadowResult = this.calculateShadows(current);
      results.push(shadowResult);
      
      current.setMinutes(current.getMinutes() + timeStepMinutes);
    }
    
    return results;
  }

  /**
   * Calculate seasonal shadow analysis
   */
  public analyzeSeasonalShadows(year: number): {
    winter: ShadowResult[];
    spring: ShadowResult[];
    summer: ShadowResult[];
    fall: ShadowResult[];
  } {
    const winterSolstice = new Date(year, 11, 21); // December 21
    const springEquinox = new Date(year, 2, 20);   // March 20
    const summerSolstice = new Date(year, 5, 21);  // June 21
    const fallEquinox = new Date(year, 8, 22);     // September 22
    
    const analyzeDay = (date: Date): ShadowResult[] => {
      const startTime = new Date(date);
      startTime.setHours(6, 0, 0, 0);
      const endTime = new Date(date);
      endTime.setHours(18, 0, 0, 0);
      
      return this.analyzeShadowsOverTime(startTime, endTime, 60); // Every hour
    };
    
    return {
      winter: analyzeDay(winterSolstice),
      spring: analyzeDay(springEquinox),
      summer: analyzeDay(summerSolstice),
      fall: analyzeDay(fallEquinox)
    };
  }

  /**
   * Project shadow vertices onto ground plane
   */
  private projectShadowVertices(geometry: ShadowGeometry, solarPosition: SolarPosition): Vector3D[] {
    const shadowVertices: Vector3D[] = [];
    
    // Project each vertex and top vertices to ground plane
    for (const vertex of geometry.vertices) {
      // Project base vertex
      const baseProjection = this.projectPointToGround(vertex, solarPosition);
      if (baseProjection) shadowVertices.push(baseProjection);
      
      // Project top vertex (vertex + height)
      const topVertex: Vector3D = { ...vertex, z: vertex.z + geometry.height };
      const topProjection = this.projectPointToGround(topVertex, solarPosition);
      if (topProjection) shadowVertices.push(topProjection);
    }
    
    // Remove duplicates and sort to form proper polygon
    return this.sortVerticesClockwise(this.removeDuplicateVertices(shadowVertices));
  }

  /**
   * Project a point to the ground plane along sun ray
   */
  private projectPointToGround(point: Vector3D, solarPosition: SolarPosition): Vector3D | null {
    if (solarPosition.elevation <= 0) return null;
    
    // Ray from point in opposite direction of sun
    const rayDirection: Vector3D = {
      x: -solarPosition.x,
      y: -solarPosition.y,
      z: -solarPosition.z
    };
    
    // Calculate intersection with ground plane
    if (Math.abs(rayDirection.z) < 0.001) return null; // Ray parallel to ground
    
    const t = (this.groundPlane.z - point.z) / rayDirection.z;
    if (t < 0) return null; // Point is below ground
    
    const projectedPoint: Vector3D = {
      x: point.x + t * rayDirection.x,
      y: point.y + t * rayDirection.y,
      z: this.groundPlane.z
    };
    
    // Check if projection is within bounds
    if (projectedPoint.x < this.groundPlane.bounds.minX || projectedPoint.x > this.groundPlane.bounds.maxX ||
        projectedPoint.y < this.groundPlane.bounds.minY || projectedPoint.y > this.groundPlane.bounds.maxY) {
      return null;
    }
    
    return projectedPoint;
  }

  /**
   * Calculate shadow length for a geometry
   */
  private calculateShadowLength(geometry: ShadowGeometry, solarPosition: SolarPosition): number {
    if (solarPosition.elevation <= 0) return 0;
    
    // Shadow length = height / tan(elevation)
    return geometry.height / Math.tan(this.degreesToRadians(solarPosition.elevation));
  }

  /**
   * Calculate area of a polygon using shoelace formula
   */
  private calculatePolygonArea(vertices: Vector3D[]): number {
    if (vertices.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      area += vertices[i].x * vertices[j].y;
      area -= vertices[j].x * vertices[i].y;
    }
    
    return Math.abs(area) / 2;
  }

  /**
   * Calculate total area of ground plane
   */
  private calculateTotalArea(): number {
    const bounds = this.groundPlane.bounds;
    return (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
  }

  /**
   * Calculate total shaded area accounting for overlaps
   */
  private calculateTotalShadedArea(shadowPolygons: Vector3D[][]): number {
    if (shadowPolygons.length === 0) return 0;
    if (shadowPolygons.length === 1) return this.calculatePolygonArea(shadowPolygons[0]);
    
    // For simplicity, use union of bounding rectangles
    // In production, would use proper polygon union algorithms
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const polygon of shadowPolygons) {
      for (const vertex of polygon) {
        minX = Math.min(minX, vertex.x);
        maxX = Math.max(maxX, vertex.x);
        minY = Math.min(minY, vertex.y);
        maxY = Math.max(maxY, vertex.y);
      }
    }
    
    return isFinite(minX) ? (maxX - minX) * (maxY - minY) : 0;
  }

  /**
   * Remove duplicate vertices
   */
  private removeDuplicateVertices(vertices: Vector3D[]): Vector3D[] {
    const unique: Vector3D[] = [];
    const tolerance = 0.001;
    
    for (const vertex of vertices) {
      const exists = unique.some(existing => 
        Math.abs(existing.x - vertex.x) < tolerance &&
        Math.abs(existing.y - vertex.y) < tolerance &&
        Math.abs(existing.z - vertex.z) < tolerance
      );
      
      if (!exists) {
        unique.push(vertex);
      }
    }
    
    return unique;
  }

  /**
   * Sort vertices clockwise to form proper polygon
   */
  private sortVerticesClockwise(vertices: Vector3D[]): Vector3D[] {
    if (vertices.length < 3) return vertices;
    
    // Find centroid
    const centroid = vertices.reduce(
      (acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y, z: acc.z + v.z }),
      { x: 0, y: 0, z: 0 }
    );
    centroid.x /= vertices.length;
    centroid.y /= vertices.length;
    centroid.z /= vertices.length;
    
    // Sort by angle from centroid
    return vertices.sort((a, b) => {
      const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
      const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
      return angleA - angleB;
    });
  }

  /**
   * Utility functions
   */
  private degreesToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  private radiansToDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }

  private normalizeAngle(angle: number): number {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }

  private getJulianDay(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    
    const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    const jd = jdn + (hour - 12) / 24 + minute / 1440 + second / 86400;
    
    return jd;
  }

  private getTimeCorrection(date: Date, longitude: number): number {
    const julianDay = this.getJulianDay(date);
    const n = julianDay - 2451545.0;
    
    // Equation of time (simplified)
    const L = this.normalizeAngle(280.460 + 0.9856474 * n);
    const g = this.degreesToRadians(this.normalizeAngle(357.528 + 0.9856003 * n));
    const eot = 4 * (L - 0.0057183 - this.radiansToDegrees(Math.atan2(Math.tan(this.degreesToRadians(L)), Math.cos(this.degreesToRadians(23.44)))));
    
    // Longitude correction
    const lonCorrection = 4 * (longitude - this.location.timezone * 15);
    
    return (eot + lonCorrection) / 60; // Convert to hours
  }

  /**
   * Get shadow analysis summary
   */
  public getShadowSummary(results: ShadowResult[]): {
    maxShadingPercentage: number;
    minShadingPercentage: number;
    averageShadingPercentage: number;
    totalShadowedTime: number; // hours
    peakShadowTime: Date | null;
    shadowFreeHours: number;
  } {
    if (results.length === 0) {
      return {
        maxShadingPercentage: 0,
        minShadingPercentage: 0,
        averageShadingPercentage: 0,
        totalShadowedTime: 0,
        peakShadowTime: null,
        shadowFreeHours: 0
      };
    }
    
    const percentages = results.map(r => r.shadingPercentage);
    const maxShadingPercentage = Math.max(...percentages);
    const minShadingPercentage = Math.min(...percentages);
    const averageShadingPercentage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    
    const peakResult = results.find(r => r.shadingPercentage === maxShadingPercentage);
    const peakShadowTime = peakResult ? peakResult.time : null;
    
    const shadowedResults = results.filter(r => r.shadingPercentage > 5); // Consider 5% threshold
    const totalShadowedTime = shadowedResults.length * 0.5; // Assuming 30-minute intervals
    
    const shadowFreeResults = results.filter(r => r.shadingPercentage < 5);
    const shadowFreeHours = shadowFreeResults.length * 0.5;
    
    return {
      maxShadingPercentage,
      minShadingPercentage,
      averageShadingPercentage,
      totalShadowedTime,
      peakShadowTime,
      shadowFreeHours
    };
  }

  /**
   * Export shadow data for visualization
   */
  public exportShadowData(results: ShadowResult[]): {
    timeData: { time: string; shadingPercentage: number; solarElevation: number; solarAzimuth: number }[];
    geometryData: { id: string; type: string; vertices: Vector3D[]; height: number }[];
    shadowPaths: { time: string; shadows: { geometryId: string; vertices: Vector3D[] }[] }[];
  } {
    const timeData = results.map(result => ({
      time: result.time.toISOString(),
      shadingPercentage: result.shadingPercentage,
      solarElevation: result.solarPosition.elevation,
      solarAzimuth: result.solarPosition.azimuth
    }));
    
    const geometryData = this.geometries.map(geom => ({
      id: geom.id,
      type: geom.type,
      vertices: geom.vertices,
      height: geom.height
    }));
    
    const shadowPaths = results.map(result => ({
      time: result.time.toISOString(),
      shadows: result.shadows.map(shadow => ({
        geometryId: shadow.geometry.id,
        vertices: shadow.shadowVertices
      }))
    }));
    
    return {
      timeData,
      geometryData,
      shadowPaths
    };
  }
}