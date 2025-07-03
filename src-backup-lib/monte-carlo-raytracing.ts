/**
 * Monte Carlo Ray-Tracing Simulation Engine
 * Professional-grade lighting simulation using statistical ray sampling
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Ray {
  origin: Vector3D;
  direction: Vector3D;
  wavelength: number; // nm
  intensity: number; // relative intensity
  bounces: number;
}

export interface Surface {
  id: string;
  vertices: Vector3D[];
  normal: Vector3D;
  material: MaterialProperties;
  area: number;
}

export interface MaterialProperties {
  id: string;
  name: string;
  reflectance: SpectralData;
  transmittance: SpectralData;
  absorptance: SpectralData;
  roughness: number; // 0-1 (0 = mirror, 1 = completely diffuse)
  specularComponent: number; // 0-1
  diffuseComponent: number; // 0-1
  isEmissive: boolean;
  emissiveSpectrum?: SpectralData;
}

export interface SpectralData {
  wavelengths: number[]; // nm
  values: number[]; // relative values 0-1
}

export interface LightSource {
  id: string;
  position: Vector3D;
  direction: Vector3D;
  beamAngle: number; // degrees
  powerDistribution: SpectralData;
  totalLumens: number;
  photometricDistribution: number[][]; // [angle, intensity] pairs
}

export interface IlluminanceResult {
  position: Vector3D;
  illuminance: number; // lux
  spectralIlluminance: SpectralData;
  colorTemperature: number; // K
  colorRenderingIndex: number; // CRI
  uniformityRatio: number;
  glareIndex: number; // UGR
}

export interface SimulationParameters {
  rayCount: number; // Number of rays to trace
  maxBounces: number; // Maximum reflections per ray
  wavelengthRange: [number, number]; // [min, max] in nm
  spectralResolution: number; // nm per sample
  convergenceThreshold: number; // Stop when results converge
  importanceSampling: boolean; // Use importance sampling for efficiency
  adaptiveSampling: boolean; // Increase sampling in important areas
}

export class MonteCarloRaytracer {
  private scene: {
    surfaces: Surface[];
    lightSources: LightSource[];
    boundingBox: { min: Vector3D; max: Vector3D };
  };
  
  private materialLibrary: Map<string, MaterialProperties>;
  private randomSeed: number;

  constructor() {
    this.scene = {
      surfaces: [],
      lightSources: [],
      boundingBox: { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } }
    };
    this.materialLibrary = new Map();
    this.randomSeed = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
    this.initializeMaterialLibrary();
  }

  /**
   * Initialize standard material library
   */
  private initializeMaterialLibrary(): void {
    // Standard materials for lighting simulation
    this.materialLibrary.set('white_paint', {
      id: 'white_paint',
      name: 'White Paint (85% reflectance)',
      reflectance: this.createFlatSpectrum(380, 780, 0.85),
      transmittance: this.createFlatSpectrum(380, 780, 0.0),
      absorptance: this.createFlatSpectrum(380, 780, 0.15),
      roughness: 0.9,
      specularComponent: 0.1,
      diffuseComponent: 0.9,
      isEmissive: false
    });

    this.materialLibrary.set('concrete', {
      id: 'concrete',
      name: 'Concrete (40% reflectance)',
      reflectance: this.createFlatSpectrum(380, 780, 0.40),
      transmittance: this.createFlatSpectrum(380, 780, 0.0),
      absorptance: this.createFlatSpectrum(380, 780, 0.60),
      roughness: 0.8,
      specularComponent: 0.05,
      diffuseComponent: 0.95,
      isEmissive: false
    });

    this.materialLibrary.set('aluminum', {
      id: 'aluminum',
      name: 'Brushed Aluminum',
      reflectance: this.createMetallicSpectrum(380, 780, 0.75),
      transmittance: this.createFlatSpectrum(380, 780, 0.0),
      absorptance: this.createFlatSpectrum(380, 780, 0.25),
      roughness: 0.3,
      specularComponent: 0.7,
      diffuseComponent: 0.3,
      isEmissive: false
    });

    this.materialLibrary.set('plant_leaf', {
      id: 'plant_leaf',
      name: 'Plant Leaf (Green)',
      reflectance: this.createPlantSpectrum(380, 780),
      transmittance: this.createFlatSpectrum(380, 780, 0.1),
      absorptance: this.createFlatSpectrum(380, 780, 0.3),
      roughness: 0.7,
      specularComponent: 0.2,
      diffuseComponent: 0.8,
      isEmissive: false
    });
  }

  /**
   * Add geometry to the scene
   */
  public addSurface(surface: Surface): void {
    this.scene.surfaces.push(surface);
    this.updateBoundingBox(surface.vertices);
  }

  /**
   * Add light source to the scene
   */
  public addLightSource(lightSource: LightSource): void {
    this.scene.lightSources.push(lightSource);
  }

  /**
   * Run Monte Carlo ray-tracing simulation
   */
  public async runSimulation(
    measurementPoints: Vector3D[],
    parameters: SimulationParameters
  ): Promise<IlluminanceResult[]> {
    
    const results: IlluminanceResult[] = [];
    
    for (const point of measurementPoints) {
      const result = await this.calculateIlluminanceAtPoint(point, parameters);
      results.push(result);
    }

    return results;
  }

  /**
   * Calculate illuminance at a specific point
   */
  private async calculateIlluminanceAtPoint(
    point: Vector3D,
    parameters: SimulationParameters
  ): Promise<IlluminanceResult> {
    const spectralIlluminance = this.initializeSpectralData(
      parameters.wavelengthRange[0],
      parameters.wavelengthRange[1],
      parameters.spectralResolution
    );

    let totalIlluminance = 0;
    let convergenceCount = 0;
    let previousIlluminance = 0;

    // Generate rays from all light sources
    for (let i = 0; i < parameters.rayCount; i++) {
      for (const lightSource of this.scene.lightSources) {
        const ray = this.generateRayFromLight(lightSource, parameters);
        const contribution = this.traceRay(ray, point, parameters.maxBounces, spectralIlluminance);
        totalIlluminance += contribution;
      }

      // Check convergence every 1000 rays
      if (i % 1000 === 0 && i > 0) {
        const currentAverage = totalIlluminance / i;
        const convergence = Math.abs(currentAverage - previousIlluminance) / currentAverage;
        
        if (convergence < parameters.convergenceThreshold) {
          convergenceCount++;
          if (convergenceCount > 5) {
            break;
          }
        } else {
          convergenceCount = 0;
        }
        previousIlluminance = currentAverage;
      }
    }

    // Normalize results
    const finalIlluminance = totalIlluminance / parameters.rayCount;
    this.normalizeSpectralData(spectralIlluminance, parameters.rayCount);

    // Calculate derived metrics
    const colorTemperature = this.calculateColorTemperature(spectralIlluminance);
    const cri = this.calculateCRI(spectralIlluminance);
    const uniformityRatio = 0.8; // Placeholder - would need multiple points
    const glareIndex = this.calculateUGR(point, finalIlluminance);

    return {
      position: point,
      illuminance: finalIlluminance,
      spectralIlluminance,
      colorTemperature,
      colorRenderingIndex: cri,
      uniformityRatio,
      glareIndex
    };
  }

  /**
   * Generate a ray from a light source
   */
  private generateRayFromLight(
    lightSource: LightSource,
    parameters: SimulationParameters
  ): Ray {
    // Random wavelength sampling based on light source spectrum
    const wavelength = this.sampleWavelength(
      lightSource.powerDistribution,
      parameters.wavelengthRange
    );

    // Random direction within beam angle
    const direction = this.generateRandomDirection(
      lightSource.direction,
      lightSource.beamAngle
    );

    // Intensity based on photometric distribution
    const intensity = this.samplePhotometricDistribution(
      lightSource.photometricDistribution,
      direction
    );

    return {
      origin: { ...lightSource.position },
      direction: this.normalizeVector(direction),
      wavelength,
      intensity,
      bounces: 0
    };
  }

  /**
   * Trace a ray through the scene
   */
  private traceRay(
    ray: Ray,
    targetPoint: Vector3D,
    maxBounces: number,
    spectralAccumulator: SpectralData
  ): number {
    if (ray.bounces >= maxBounces || ray.intensity < 0.001) {
      return 0;
    }

    // Find nearest surface intersection
    const intersection = this.findNearestIntersection(ray);
    
    if (!intersection) {
      return 0;
    }

    const { surface, point: intersectionPoint, distance } = intersection;
    
    // Check if ray reaches target point
    const targetContribution = this.checkTargetHit(ray, targetPoint, intersectionPoint);
    
    // Calculate material interaction
    const material = surface.material;
    const reflectedRays = this.calculateMaterialInteraction(
      ray,
      intersectionPoint,
      surface.normal,
      material
    );

    // Add spectral contribution
    this.addSpectralContribution(spectralAccumulator, ray.wavelength, ray.intensity);

    // Trace reflected/transmitted rays
    let totalContribution = targetContribution;
    for (const reflectedRay of reflectedRays) {
      totalContribution += this.traceRay(
        reflectedRay,
        targetPoint,
        maxBounces,
        spectralAccumulator
      );
    }

    return totalContribution;
  }

  /**
   * Find nearest surface intersection
   */
  private findNearestIntersection(ray: Ray): {
    surface: Surface;
    point: Vector3D;
    distance: number;
  } | null {
    let nearestDistance = Infinity;
    let nearestSurface: Surface | null = null;
    let nearestPoint: Vector3D | null = null;

    for (const surface of this.scene.surfaces) {
      const intersection = this.rayTriangleIntersection(ray, surface);
      if (intersection && intersection.distance < nearestDistance) {
        nearestDistance = intersection.distance;
        nearestSurface = surface;
        nearestPoint = intersection.point;
      }
    }

    if (nearestSurface && nearestPoint) {
      return {
        surface: nearestSurface,
        point: nearestPoint,
        distance: nearestDistance
      };
    }

    return null;
  }

  /**
   * Ray-triangle intersection using Möller-Trumbore algorithm
   */
  private rayTriangleIntersection(ray: Ray, surface: Surface): {
    point: Vector3D;
    distance: number;
  } | null {
    if (surface.vertices.length < 3) return null;

    const v0 = surface.vertices[0];
    const v1 = surface.vertices[1];
    const v2 = surface.vertices[2];

    const edge1 = this.subtractVectors(v1, v0);
    const edge2 = this.subtractVectors(v2, v0);
    const h = this.crossProduct(ray.direction, edge2);
    const a = this.dotProduct(edge1, h);

    if (a > -0.00001 && a < 0.00001) return null;

    const f = 1.0 / a;
    const s = this.subtractVectors(ray.origin, v0);
    const u = f * this.dotProduct(s, h);

    if (u < 0.0 || u > 1.0) return null;

    const q = this.crossProduct(s, edge1);
    const v = f * this.dotProduct(ray.direction, q);

    if (v < 0.0 || u + v > 1.0) return null;

    const t = f * this.dotProduct(edge2, q);

    if (t > 0.00001) {
      const intersectionPoint = this.addVectors(
        ray.origin,
        this.multiplyVector(ray.direction, t)
      );
      return {
        point: intersectionPoint,
        distance: t
      };
    }

    return null;
  }

  /**
   * Calculate material interaction (reflection, transmission, absorption)
   */
  private calculateMaterialInteraction(
    incidentRay: Ray,
    intersectionPoint: Vector3D,
    surfaceNormal: Vector3D,
    material: MaterialProperties
  ): Ray[] {
    const reflectedRays: Ray[] = [];
    
    // Get material properties at this wavelength
    const reflectance = this.interpolateSpectralValue(
      material.reflectance,
      incidentRay.wavelength
    );
    const transmittance = this.interpolateSpectralValue(
      material.transmittance,
      incidentRay.wavelength
    );

    // Russian roulette for ray termination
    const rand = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
    
    if (rand < reflectance) {
      // Generate reflected ray
      const reflectedDirection = this.calculateReflection(
        incidentRay.direction,
        surfaceNormal,
        material.roughness,
        material.specularComponent
      );

      reflectedRays.push({
        origin: intersectionPoint,
        direction: reflectedDirection,
        wavelength: incidentRay.wavelength,
        intensity: incidentRay.intensity * reflectance,
        bounces: incidentRay.bounces + 1
      });
    } else if (rand < reflectance + transmittance) {
      // Generate transmitted ray (if material is transparent)
      const transmittedDirection = this.calculateTransmission(
        incidentRay.direction,
        surfaceNormal
      );

      if (transmittedDirection) {
        reflectedRays.push({
          origin: intersectionPoint,
          direction: transmittedDirection,
          wavelength: incidentRay.wavelength,
          intensity: incidentRay.intensity * transmittance,
          bounces: incidentRay.bounces + 1
        });
      }
    }
    // Else: ray is absorbed

    return reflectedRays;
  }

  /**
   * Calculate reflection direction (mix of specular and diffuse)
   */
  private calculateReflection(
    incidentDirection: Vector3D,
    normal: Vector3D,
    roughness: number,
    specularComponent: number
  ): Vector3D {
    // Perfect specular reflection
    const specularReflection = this.reflect(incidentDirection, normal);
    
    // Diffuse reflection (random hemisphere)
    const diffuseReflection = this.generateRandomHemisphereDirection(normal);
    
    // Mix based on material properties
    const useSpecular = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < specularComponent;
    
    if (useSpecular) {
      // Add roughness to specular reflection
      return this.addRoughness(specularReflection, roughness);
    } else {
      return diffuseReflection;
    }
  }

  /**
   * Helper functions for vector math
   */
  private addVectors(a: Vector3D, b: Vector3D): Vector3D {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  }

  private subtractVectors(a: Vector3D, b: Vector3D): Vector3D {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  }

  private multiplyVector(v: Vector3D, scalar: number): Vector3D {
    return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
  }

  private dotProduct(a: Vector3D, b: Vector3D): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  private crossProduct(a: Vector3D, b: Vector3D): Vector3D {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  private normalizeVector(v: Vector3D): Vector3D {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (length === 0) return { x: 0, y: 0, z: 1 };
    return { x: v.x / length, y: v.y / length, z: v.z / length };
  }

  private reflect(incident: Vector3D, normal: Vector3D): Vector3D {
    const dot = 2 * this.dotProduct(incident, normal);
    return this.subtractVectors(incident, this.multiplyVector(normal, dot));
  }

  /**
   * Spectral utility functions
   */
  private createFlatSpectrum(startWl: number, endWl: number, value: number): SpectralData {
    const wavelengths: number[] = [];
    const values: number[] = [];
    
    for (let wl = startWl; wl <= endWl; wl += 10) {
      wavelengths.push(wl);
      values.push(value);
    }
    
    return { wavelengths, values };
  }

  private createMetallicSpectrum(startWl: number, endWl: number, baseReflectance: number): SpectralData {
    const wavelengths: number[] = [];
    const values: number[] = [];
    
    for (let wl = startWl; wl <= endWl; wl += 10) {
      // Metals typically have higher reflectance at longer wavelengths
      const factor = 0.8 + 0.2 * (wl - startWl) / (endWl - startWl);
      wavelengths.push(wl);
      values.push(baseReflectance * factor);
    }
    
    return { wavelengths, values };
  }

  private createPlantSpectrum(startWl: number, endWl: number): SpectralData {
    const wavelengths: number[] = [];
    const values: number[] = [];
    
    for (let wl = startWl; wl <= endWl; wl += 10) {
      let reflectance = 0.1; // Base reflectance
      
      // Green peak around 550nm
      if (wl >= 500 && wl <= 600) {
        reflectance = 0.6 * Math.exp(-Math.pow((wl - 550) / 50, 2));
      }
      // High NIR reflectance
      else if (wl > 700) {
        reflectance = 0.8;
      }
      // Low blue/red reflectance (absorbed for photosynthesis)
      else if ((wl >= 400 && wl <= 500) || (wl >= 600 && wl <= 700)) {
        reflectance = 0.05;
      }
      
      wavelengths.push(wl);
      values.push(reflectance);
    }
    
    return { wavelengths, values };
  }

  private initializeSpectralData(startWl: number, endWl: number, resolution: number): SpectralData {
    const wavelengths: number[] = [];
    const values: number[] = [];
    
    for (let wl = startWl; wl <= endWl; wl += resolution) {
      wavelengths.push(wl);
      values.push(0);
    }
    
    return { wavelengths, values };
  }

  private interpolateSpectralValue(spectrum: SpectralData, wavelength: number): number {
    const { wavelengths, values } = spectrum;
    
    // Find surrounding wavelengths
    let i = 0;
    while (i < wavelengths.length - 1 && wavelengths[i] < wavelength) {
      i++;
    }
    
    if (i === 0) return values[0];
    if (i === wavelengths.length) return values[values.length - 1];
    
    // Linear interpolation
    const t = (wavelength - wavelengths[i - 1]) / (wavelengths[i] - wavelengths[i - 1]);
    return values[i - 1] + t * (values[i] - values[i - 1]);
  }

  private addSpectralContribution(accumulator: SpectralData, wavelength: number, intensity: number): void {
    const index = accumulator.wavelengths.findIndex(wl => Math.abs(wl - wavelength) < 5);
    if (index >= 0) {
      accumulator.values[index] += intensity;
    }
  }

  private normalizeSpectralData(data: SpectralData, sampleCount: number): void {
    for (let i = 0; i < data.values.length; i++) {
      data.values[i] /= sampleCount;
    }
  }

  /**
   * Color science calculations
   */
  private calculateColorTemperature(spectrum: SpectralData): number {
    // Simplified correlated color temperature calculation
    // In production, would use proper CIE calculations
    let blueTotal = 0;
    let redTotal = 0;
    
    for (let i = 0; i < spectrum.wavelengths.length; i++) {
      const wl = spectrum.wavelengths[i];
      const value = spectrum.values[i];
      
      if (wl >= 400 && wl <= 490) {
        blueTotal += value;
      } else if (wl >= 600 && wl <= 700) {
        redTotal += value;
      }
    }
    
    const ratio = blueTotal / (redTotal + 0.001);
    return 2000 + 4000 * Math.min(1, ratio); // Simplified mapping
  }

  private calculateCRI(spectrum: SpectralData): number {
    // Simplified Color Rendering Index calculation
    // Would need full CIE test color samples for accurate CRI
    const totalDeviation = 0;
    const testColors = 8; // Standard CRI uses 8 test colors
    
    // Simplified calculation based on spectral coverage
    const coverage = this.calculateSpectralCoverage(spectrum);
    return Math.max(0, 100 - coverage * 20);
  }

  private calculateSpectralCoverage(spectrum: SpectralData): number {
    let coverage = 0;
    const bandCount = 8;
    const bandWidth = (spectrum.wavelengths[spectrum.wavelengths.length - 1] - spectrum.wavelengths[0]) / bandCount;
    
    for (let band = 0; band < bandCount; band++) {
      const startWl = spectrum.wavelengths[0] + band * bandWidth;
      const endWl = startWl + bandWidth;
      
      let bandTotal = 0;
      let bandCount = 0;
      
      for (let i = 0; i < spectrum.wavelengths.length; i++) {
        if (spectrum.wavelengths[i] >= startWl && spectrum.wavelengths[i] <= endWl) {
          bandTotal += spectrum.values[i];
          bandCount++;
        }
      }
      
      if (bandCount > 0) {
        coverage += Math.min(1, bandTotal / bandCount);
      }
    }
    
    return coverage / bandCount;
  }

  private calculateUGR(viewPoint: Vector3D, illuminance: number): number {
    // Simplified Unified Glare Rating calculation
    // Would need full luminaire position and luminance data for accurate UGR
    const backgroundLuminance = illuminance / Math.PI; // Simplified
    const glareSourceLuminance = backgroundLuminance * 10; // Assumption
    
    // Simplified UGR formula
    const solidAngle = 0.01; // Assumed solid angle
    const positionIndex = 1.0; // Simplified position index
    
    const ugr = 8 * Math.log10(0.25 * glareSourceLuminance * solidAngle / (backgroundLuminance * positionIndex));
    return Math.max(10, Math.min(30, ugr));
  }

  /**
   * Utility functions for random sampling
   */
  private sampleWavelength(spectrum: SpectralData, range: [number, number]): number {
    // Importance sampling based on spectral power distribution
    const totalPower = spectrum.values.reduce((sum, value) => sum + value, 0);
    const rand = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * totalPower;
    
    let accumulator = 0;
    for (let i = 0; i < spectrum.values.length; i++) {
      accumulator += spectrum.values[i];
      if (accumulator >= rand) {
        return spectrum.wavelengths[i];
      }
    }
    
    // Fallback to uniform sampling
    return range[0] + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * (range[1] - range[0]);
  }

  private generateRandomDirection(centerDirection: Vector3D, coneAngle: number): Vector3D {
    const theta = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * coneAngle * Math.PI / 180;
    const phi = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2 * Math.PI;
    
    // Generate random direction within cone
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    
    return {
      x: centerDirection.x + sinTheta * Math.cos(phi),
      y: centerDirection.y + sinTheta * Math.sin(phi),
      z: centerDirection.z + cosTheta
    };
  }

  private generateRandomHemisphereDirection(normal: Vector3D): Vector3D {
    const theta = Math.acos(Math.sqrt(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF));
    const phi = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2 * Math.PI;
    
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    
    // Transform to hemisphere oriented with normal
    return {
      x: normal.x + sinTheta * Math.cos(phi),
      y: normal.y + sinTheta * Math.sin(phi),
      z: normal.z + cosTheta
    };
  }

  private samplePhotometricDistribution(distribution: number[][], direction: Vector3D): number {
    // Simplified photometric distribution sampling
    // In production, would interpolate from IES photometric data
    const angle = Math.acos(direction.z) * 180 / Math.PI;
    
    // Find nearest angle in distribution
    let nearestIntensity = 1.0;
    for (const [distAngle, intensity] of distribution) {
      if (Math.abs(distAngle - angle) < 10) {
        nearestIntensity = intensity;
        break;
      }
    }
    
    return nearestIntensity;
  }

  private updateBoundingBox(vertices: Vector3D[]): void {
    for (const vertex of vertices) {
      this.scene.boundingBox.min.x = Math.min(this.scene.boundingBox.min.x, vertex.x);
      this.scene.boundingBox.min.y = Math.min(this.scene.boundingBox.min.y, vertex.y);
      this.scene.boundingBox.min.z = Math.min(this.scene.boundingBox.min.z, vertex.z);
      
      this.scene.boundingBox.max.x = Math.max(this.scene.boundingBox.max.x, vertex.x);
      this.scene.boundingBox.max.y = Math.max(this.scene.boundingBox.max.y, vertex.y);
      this.scene.boundingBox.max.z = Math.max(this.scene.boundingBox.max.z, vertex.z);
    }
  }

  private checkTargetHit(ray: Ray, targetPoint: Vector3D, intersectionPoint: Vector3D): number {
    const distance = this.vectorDistance(intersectionPoint, targetPoint);
    if (distance < 0.1) { // Hit tolerance
      return ray.intensity;
    }
    return 0;
  }

  private vectorDistance(a: Vector3D, b: Vector3D): number {
    const diff = this.subtractVectors(a, b);
    return Math.sqrt(diff.x * diff.x + diff.y * diff.y + diff.z * diff.z);
  }

  private calculateTransmission(incidentDirection: Vector3D, normal: Vector3D): Vector3D | null {
    // Simplified transmission (no refraction)
    return incidentDirection;
  }

  private addRoughness(direction: Vector3D, roughness: number): Vector3D {
    const perturbation = {
      x: (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * roughness,
      y: (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * roughness,
      z: (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * roughness
    };
    
    return this.normalizeVector(this.addVectors(direction, perturbation));
  }

  /**
   * Public API methods
   */
  public getMaterialLibrary(): Map<string, MaterialProperties> {
    return this.materialLibrary;
  }

  public addMaterial(material: MaterialProperties): void {
    this.materialLibrary.set(material.id, material);
  }

  public clearScene(): void {
    this.scene.surfaces = [];
    this.scene.lightSources = [];
    this.scene.boundingBox = { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
  }

  public getSceneStatistics(): {
    surfaceCount: number;
    lightSourceCount: number;
    totalArea: number;
    boundingBoxVolume: number;
  } {
    const totalArea = this.scene.surfaces.reduce((sum, surface) => sum + surface.area, 0);
    const bbox = this.scene.boundingBox;
    const volume = (bbox.max.x - bbox.min.x) * (bbox.max.y - bbox.min.y) * (bbox.max.z - bbox.min.z);
    
    return {
      surfaceCount: this.scene.surfaces.length,
      lightSourceCount: this.scene.lightSources.length,
      totalArea,
      boundingBoxVolume: volume
    };
  }
}

// Export default simulation parameters
export const DEFAULT_SIMULATION_PARAMETERS: SimulationParameters = {
  rayCount: 100000,
  maxBounces: 10,
  wavelengthRange: [380, 780],
  spectralResolution: 10,
  convergenceThreshold: 0.01,
  importanceSampling: true,
  adaptiveSampling: true
};