'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Zap, Play, Pause, Download, Settings, Info, 
  Activity, BarChart3, Eye, Gauge, Sun, X
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';

// Ray tracing types
interface Ray {
  origin: Vector3;
  direction: Vector3;
  wavelength: number;
  intensity: number;
  bounces: number;
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Surface {
  id: string;
  type: 'diffuse' | 'specular' | 'mixed';
  reflectance: number;
  transmittance: number;
  absorption: number;
  normal: Vector3;
  vertices: Vector3[];
}

interface LightSource {
  id: string;
  position: Vector3;
  spectrum: { [wavelength: number]: number };
  distribution: 'lambertian' | 'gaussian' | 'uniform';
  beamAngle: number;
  power: number; // Watts
}

interface RayTracingConfig {
  raysPerSource: number;
  maxBounces: number;
  wavelengthBands: number[];
  gridResolution: { x: number; y: number; z: number };
  convergenceThreshold: number;
  russianRouletteProbability: number;
  importanceSampling: boolean;
  spectralSampling: 'uniform' | 'weighted';
}

interface RayTracingResults {
  irradianceMap: number[][][]; // 3D grid of irradiance values
  spectralIrradiance: { [wavelength: number]: number[][][] };
  ppfdMap: number[][][];
  statistics: {
    totalRays: number;
    averagePathLength: number;
    convergenceRate: number;
    computationTime: number;
    photonEfficiency: number;
  };
  uniformity: {
    min: number;
    max: number;
    avg: number;
    cv: number; // Coefficient of variation
  };
}

class MonteCarloRayTracer {
  private config: RayTracingConfig;
  private surfaces: Surface[];
  private lights: LightSource[];
  private room: { width: number; length: number; height: number };
  private results: RayTracingResults;
  private isRunning: boolean = false;
  private progress: number = 0;

  constructor(
    config: RayTracingConfig,
    surfaces: Surface[],
    lights: LightSource[],
    room: { width: number; length: number; height: number }
  ) {
    this.config = config;
    this.surfaces = surfaces;
    this.lights = lights;
    this.room = room;
    this.results = this.initializeResults();
  }

  private initializeResults(): RayTracingResults {
    const { x, y, z } = this.config.gridResolution;
    
    return {
      irradianceMap: this.create3DArray(x, y, z, 0),
      spectralIrradiance: this.config.wavelengthBands.reduce((acc, wl) => {
        acc[wl] = this.create3DArray(x, y, z, 0);
        return acc;
      }, {} as { [wavelength: number]: number[][][] }),
      ppfdMap: this.create3DArray(x, y, z, 0),
      statistics: {
        totalRays: 0,
        averagePathLength: 0,
        convergenceRate: 0,
        computationTime: 0,
        photonEfficiency: 0
      },
      uniformity: {
        min: 0,
        max: 0,
        avg: 0,
        cv: 0
      }
    };
  }

  private create3DArray(x: number, y: number, z: number, value: number): number[][][] {
    return Array(x).fill(0).map(() =>
      Array(y).fill(0).map(() =>
        Array(z).fill(value)
      )
    );
  }

  public async trace(progressCallback?: (progress: number) => void): Promise<RayTracingResults> {
    this.isRunning = true;
    const startTime = performance.now();
    
    let totalPathLength = 0;
    let totalRays = 0;

    // Trace rays from each light source
    for (let lightIndex = 0; lightIndex < this.lights.length; lightIndex++) {
      const light = this.lights[lightIndex];
      
      // Sample wavelengths based on spectrum
      const wavelengths = this.sampleWavelengths(light.spectrum);
      
      for (let rayIndex = 0; rayIndex < this.config.raysPerSource; rayIndex++) {
        if (!this.isRunning) break;
        
        // Generate random ray from light source
        const wavelength = wavelengths[rayIndex % wavelengths.length];
        const ray = this.generateRayFromLight(light, wavelength);
        
        // Trace ray through scene
        const pathLength = this.traceRay(ray);
        totalPathLength += pathLength;
        totalRays++;
        
        // Update progress
        this.progress = ((lightIndex * this.config.raysPerSource + rayIndex) / 
                        (this.lights.length * this.config.raysPerSource)) * 100;
        
        if (progressCallback && rayIndex % 1000 === 0) {
          progressCallback(this.progress);
          await new Promise(resolve => setTimeout(resolve, 0)); // Yield to UI
        }
      }
    }

    // Calculate final statistics
    const computationTime = performance.now() - startTime;
    this.results.statistics = {
      totalRays,
      averagePathLength: totalPathLength / totalRays,
      convergenceRate: this.calculateConvergence(),
      computationTime,
      photonEfficiency: this.calculatePhotonEfficiency()
    };

    // Convert spectral irradiance to PPFD
    this.calculatePPFD();
    
    // Calculate uniformity metrics
    this.calculateUniformity();

    this.isRunning = false;
    return this.results;
  }

  private generateRayFromLight(light: LightSource, wavelength: number): Ray {
    // Generate ray direction based on light distribution
    let direction: Vector3;
    
    switch (light.distribution) {
      case 'lambertian':
        direction = this.sampleLambertian();
        break;
      case 'gaussian':
        direction = this.sampleGaussian(light.beamAngle);
        break;
      default: // uniform
        direction = this.sampleUniform(light.beamAngle);
    }

    // Calculate initial intensity based on spectrum and power
    const spectralPower = light.spectrum[wavelength] || 0;
    const intensity = (light.power * spectralPower) / this.config.raysPerSource;

    return {
      origin: { ...light.position },
      direction: this.normalize(direction),
      wavelength,
      intensity,
      bounces: 0
    };
  }

  private traceRay(ray: Ray): number {
    let currentRay = { ...ray };
    let pathLength = 0;
    
    while (currentRay.bounces < this.config.maxBounces && currentRay.intensity > 0.001) {
      // Find intersection with surfaces
      const intersection = this.findIntersection(currentRay);
      
      if (!intersection) {
        // Ray escaped the scene
        break;
      }

      // Update path length
      pathLength += intersection.distance;
      
      // Deposit energy at intersection point
      this.depositEnergy(intersection.point, currentRay.wavelength, currentRay.intensity * intersection.surface.absorption);
      
      // Russian roulette termination
      if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > this.config.russianRouletteProbability) {
        break;
      }

      // Calculate new ray direction based on surface properties
      if (intersection.surface.type === 'specular') {
        currentRay.direction = this.reflect(currentRay.direction, intersection.normal);
      } else if (intersection.surface.type === 'diffuse') {
        currentRay.direction = this.sampleHemisphere(intersection.normal);
      } else { // mixed
        if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.5) {
          currentRay.direction = this.reflect(currentRay.direction, intersection.normal);
        } else {
          currentRay.direction = this.sampleHemisphere(intersection.normal);
        }
      }

      // Update ray properties
      currentRay.origin = intersection.point;
      currentRay.intensity *= intersection.surface.reflectance / this.config.russianRouletteProbability;
      currentRay.bounces++;
    }

    return pathLength;
  }

  private findIntersection(ray: Ray): { 
    point: Vector3; 
    distance: number; 
    surface: Surface; 
    normal: Vector3;
  } | null {
    let closestIntersection = null;
    let minDistance = Infinity;

    // Check room boundaries
    const roomSurfaces = this.getRoomSurfaces();
    for (const surface of [...this.surfaces, ...roomSurfaces]) {
      const intersection = this.rayTriangleIntersection(ray, surface);
      if (intersection && intersection.distance < minDistance) {
        minDistance = intersection.distance;
        closestIntersection = {
          ...intersection,
          surface,
          normal: surface.normal
        };
      }
    }

    return closestIntersection;
  }

  private getRoomSurfaces(): Surface[] {
    // Generate room boundary surfaces
    const surfaces: Surface[] = [];
    
    // Floor
    surfaces.push({
      id: 'floor',
      type: 'diffuse',
      reflectance: 0.3,
      transmittance: 0,
      absorption: 0.7,
      normal: { x: 0, y: 0, z: 1 },
      vertices: [
        { x: 0, y: 0, z: 0 },
        { x: this.room.width, y: 0, z: 0 },
        { x: this.room.width, y: this.room.length, z: 0 },
        { x: 0, y: this.room.length, z: 0 }
      ]
    });

    // Ceiling
    surfaces.push({
      id: 'ceiling',
      type: 'diffuse',
      reflectance: 0.8,
      transmittance: 0,
      absorption: 0.2,
      normal: { x: 0, y: 0, z: -1 },
      vertices: [
        { x: 0, y: 0, z: this.room.height },
        { x: this.room.width, y: 0, z: this.room.height },
        { x: this.room.width, y: this.room.length, z: this.room.height },
        { x: 0, y: this.room.length, z: this.room.height }
      ]
    });

    // Walls
    const wallReflectance = 0.5;
    surfaces.push(
      // North wall
      {
        id: 'wall-north',
        type: 'diffuse',
        reflectance: wallReflectance,
        transmittance: 0,
        absorption: 1 - wallReflectance,
        normal: { x: 0, y: -1, z: 0 },
        vertices: [
          { x: 0, y: this.room.length, z: 0 },
          { x: this.room.width, y: this.room.length, z: 0 },
          { x: this.room.width, y: this.room.length, z: this.room.height },
          { x: 0, y: this.room.length, z: this.room.height }
        ]
      },
      // South wall
      {
        id: 'wall-south',
        type: 'diffuse',
        reflectance: wallReflectance,
        transmittance: 0,
        absorption: 1 - wallReflectance,
        normal: { x: 0, y: 1, z: 0 },
        vertices: [
          { x: 0, y: 0, z: 0 },
          { x: this.room.width, y: 0, z: 0 },
          { x: this.room.width, y: 0, z: this.room.height },
          { x: 0, y: 0, z: this.room.height }
        ]
      },
      // East wall
      {
        id: 'wall-east',
        type: 'diffuse',
        reflectance: wallReflectance,
        transmittance: 0,
        absorption: 1 - wallReflectance,
        normal: { x: -1, y: 0, z: 0 },
        vertices: [
          { x: this.room.width, y: 0, z: 0 },
          { x: this.room.width, y: this.room.length, z: 0 },
          { x: this.room.width, y: this.room.length, z: this.room.height },
          { x: this.room.width, y: 0, z: this.room.height }
        ]
      },
      // West wall
      {
        id: 'wall-west',
        type: 'diffuse',
        reflectance: wallReflectance,
        transmittance: 0,
        absorption: 1 - wallReflectance,
        normal: { x: 1, y: 0, z: 0 },
        vertices: [
          { x: 0, y: 0, z: 0 },
          { x: 0, y: this.room.length, z: 0 },
          { x: 0, y: this.room.length, z: this.room.height },
          { x: 0, y: 0, z: this.room.height }
        ]
      }
    );

    return surfaces;
  }

  private rayTriangleIntersection(ray: Ray, surface: Surface): { point: Vector3; distance: number } | null {
    // Möller-Trumbore algorithm for ray-triangle intersection
    // Simplified for rectangular surfaces (2 triangles)
    const v0 = surface.vertices[0];
    const v1 = surface.vertices[1];
    const v2 = surface.vertices[2];

    const edge1 = this.subtract(v1, v0);
    const edge2 = this.subtract(v2, v0);
    const h = this.cross(ray.direction, edge2);
    const a = this.dot(edge1, h);

    if (a > -0.00001 && a < 0.00001) return null;

    const f = 1.0 / a;
    const s = this.subtract(ray.origin, v0);
    const u = f * this.dot(s, h);

    if (u < 0.0 || u > 1.0) return null;

    const q = this.cross(s, edge1);
    const v = f * this.dot(ray.direction, q);

    if (v < 0.0 || u + v > 1.0) return null;

    const t = f * this.dot(edge2, q);

    if (t > 0.00001) {
      const point = this.add(ray.origin, this.scale(ray.direction, t));
      return { point, distance: t };
    }

    return null;
  }

  private depositEnergy(point: Vector3, wavelength: number, energy: number): void {
    // Find grid cell
    const i = Math.floor((point.x / this.room.width) * this.config.gridResolution.x);
    const j = Math.floor((point.y / this.room.length) * this.config.gridResolution.y);
    const k = Math.floor((point.z / this.room.height) * this.config.gridResolution.z);

    if (i >= 0 && i < this.config.gridResolution.x &&
        j >= 0 && j < this.config.gridResolution.y &&
        k >= 0 && k < this.config.gridResolution.z) {
      
      // Add energy to total irradiance
      this.results.irradianceMap[i][j][k] += energy;
      
      // Add to spectral irradiance
      if (this.results.spectralIrradiance[wavelength]) {
        this.results.spectralIrradiance[wavelength][i][j][k] += energy;
      }
    }
  }

  private calculatePPFD(): void {
    const { x, y, z } = this.config.gridResolution;
    
    // Convert spectral irradiance to PPFD
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        for (let k = 0; k < z; k++) {
          let ppfd = 0;
          
          // Sum contributions from all wavelengths
          for (const wavelength of this.config.wavelengthBands) {
            if (wavelength >= 400 && wavelength <= 700) { // PAR range
              const irradiance = this.results.spectralIrradiance[wavelength]?.[i][j][k] || 0;
              // Convert W/m² to μmol/m²/s
              // E = hc/λ, 1 W/m² = λ/119.3 μmol/m²/s for each wavelength
              ppfd += irradiance * (wavelength / 119.3);
            }
          }
          
          this.results.ppfdMap[i][j][k] = ppfd;
        }
      }
    }
  }

  private calculateUniformity(): void {
    // Calculate uniformity at canopy height (typically z = 1)
    const canopyLevel = Math.floor(this.config.gridResolution.z * 0.2); // 20% height
    const values: number[] = [];
    
    for (let i = 0; i < this.config.gridResolution.x; i++) {
      for (let j = 0; j < this.config.gridResolution.y; j++) {
        values.push(this.results.ppfdMap[i][j][canopyLevel]);
      }
    }
    
    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const cv = avg > 0 ? (stdDev / avg) * 100 : 0;
      
      this.results.uniformity = { min, max, avg, cv };
    }
  }

  private calculateConvergence(): number {
    // Simple convergence metric based on variance reduction
    return 1 - (this.results.uniformity.cv / 100);
  }

  private calculatePhotonEfficiency(): number {
    // Ratio of absorbed photons to emitted photons
    const totalAbsorbed = this.results.irradianceMap.flat().flat().reduce((a, b) => a + b, 0);
    const totalEmitted = this.lights.reduce((sum, light) => sum + light.power, 0);
    return totalEmitted > 0 ? totalAbsorbed / totalEmitted : 0;
  }

  // Vector operations
  private normalize(v: Vector3): Vector3 {
    const mag = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return mag > 0 ? { x: v.x / mag, y: v.y / mag, z: v.z / mag } : v;
  }

  private add(a: Vector3, b: Vector3): Vector3 {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  }

  private subtract(a: Vector3, b: Vector3): Vector3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  }

  private scale(v: Vector3, s: number): Vector3 {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
  }

  private dot(a: Vector3, b: Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  private cross(a: Vector3, b: Vector3): Vector3 {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  private reflect(incident: Vector3, normal: Vector3): Vector3 {
    const dotProduct = this.dot(incident, normal);
    return this.subtract(incident, this.scale(normal, 2 * dotProduct));
  }

  // Sampling functions
  private sampleWavelengths(spectrum: { [wavelength: number]: number }): number[] {
    const wavelengths: number[] = [];
    const totalPower = Object.values(spectrum).reduce((a, b) => a + b, 0);
    
    if (this.config.spectralSampling === 'weighted') {
      // Importance sampling based on spectral power
      for (const [wl, power] of Object.entries(spectrum)) {
        const count = Math.round((power / totalPower) * this.config.wavelengthBands.length);
        for (let i = 0; i < count; i++) {
          wavelengths.push(Number(wl));
        }
      }
    } else {
      // Uniform sampling
      return this.config.wavelengthBands;
    }
    
    return wavelengths;
  }

  private sampleLambertian(): Vector3 {
    // Cosine-weighted hemisphere sampling
    const u1 = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
    const u2 = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
    
    const r = Math.sqrt(u1);
    const theta = 2 * Math.PI * u2;
    
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const z = Math.sqrt(Math.max(0, 1 - u1));
    
    return { x, y, z };
  }

  private sampleGaussian(beamAngle: number): Vector3 {
    // Gaussian distribution for beam angle
    const sigma = beamAngle / (2 * Math.PI);
    const theta = this.gaussianRandom() * sigma;
    const phi = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2 * Math.PI;
    
    const sinTheta = Math.sin(theta);
    return {
      x: sinTheta * Math.cos(phi),
      y: sinTheta * Math.sin(phi),
      z: Math.cos(theta)
    };
  }

  private sampleUniform(beamAngle: number): Vector3 {
    // Uniform distribution within cone
    const cosAngle = Math.cos(beamAngle / 2);
    const u1 = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
    const u2 = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
    
    const cosTheta = 1 - u1 * (1 - cosAngle);
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
    const phi = 2 * Math.PI * u2;
    
    return {
      x: sinTheta * Math.cos(phi),
      y: sinTheta * Math.sin(phi),
      z: cosTheta
    };
  }

  private sampleHemisphere(normal: Vector3): Vector3 {
    const local = this.sampleLambertian();
    
    // Create orthonormal basis
    const up = Math.abs(normal.z) < 0.999 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 };
    const tangent = this.normalize(this.cross(up, normal));
    const bitangent = this.cross(normal, tangent);
    
    // Transform to world space
    return {
      x: local.x * tangent.x + local.y * bitangent.x + local.z * normal.x,
      y: local.x * tangent.y + local.y * bitangent.y + local.z * normal.y,
      z: local.x * tangent.z + local.y * bitangent.z + local.z * normal.z
    };
  }

  private gaussianRandom(): number {
    // Box-Muller transform
    const u1 = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
    const u2 = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  public stop(): void {
    this.isRunning = false;
  }
}

interface MonteCarloRayTracingProps {
  onClose?: () => void;
}

export function MonteCarloRayTracing({ onClose }: MonteCarloRayTracingProps) {
  const { state } = useDesigner();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<RayTracingResults | null>(null);
  const [config, setConfig] = useState<RayTracingConfig>({
    raysPerSource: 100000,
    maxBounces: 5,
    wavelengthBands: [450, 500, 550, 600, 650, 700],
    gridResolution: { x: 50, y: 50, z: 20 },
    convergenceThreshold: 0.01,
    russianRouletteProbability: 0.8,
    importanceSampling: true,
    spectralSampling: 'weighted'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [visualizationHeight, setVisualizationHeight] = useState(1); // meters
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rayTracerRef = useRef<MonteCarloRayTracer | null>(null);

  // Convert fixtures to light sources
  const getLightSources = (): LightSource[] => {
    return state.objects
      .filter(obj => obj.type === 'fixture' && obj.enabled)
      .map(fixture => ({
        id: fixture.id,
        position: {
          x: fixture.x,
          y: fixture.y,
          z: fixture.z || state.room.height - 0.5
        },
        spectrum: (fixture as any).model?.spectrum || {
          450: 0.15, // Blue
          500: 0.05, // Green
          550: 0.05, // Yellow-green
          600: 0.10, // Orange
          650: 0.60, // Red
          700: 0.05  // Far red
        },
        distribution: 'lambertian',
        beamAngle: (((fixture as any).model?.beamAngle || 120) * Math.PI) / 180,
        power: (fixture as any).model?.wattage || 600
      }));
  };

  // Run ray tracing simulation
  const runSimulation = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const lights = getLightSources();
    if (lights.length === 0) {
      alert('No active fixtures found!');
      setIsRunning(false);
      return;
    }

    // Create ray tracer instance
    const rayTracer = new MonteCarloRayTracer(
      config,
      [], // Additional surfaces can be added here
      lights,
      state.room
    );
    rayTracerRef.current = rayTracer;

    try {
      const results = await rayTracer.trace((p) => setProgress(p));
      setResults(results);
      renderResults(results);
    } catch (error) {
      console.error('Ray tracing failed:', error);
    } finally {
      setIsRunning(false);
      rayTracerRef.current = null;
    }
  };

  // Stop simulation
  const stopSimulation = () => {
    if (rayTracerRef.current) {
      rayTracerRef.current.stop();
    }
    setIsRunning(false);
  };

  // Render results on canvas
  const renderResults = useCallback((results: RayTracingResults) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get slice at specified height
    const zIndex = Math.floor((visualizationHeight / state.room.height) * config.gridResolution.z);
    const slice = results.ppfdMap.map(row => row.map(col => col[zIndex]));

    // Find min/max for normalization
    const flatData = slice.flat();
    const minValue = Math.min(...flatData);
    const maxValue = Math.max(...flatData);

    // Draw heatmap
    const cellWidth = canvas.width / config.gridResolution.x;
    const cellHeight = canvas.height / config.gridResolution.y;

    for (let i = 0; i < config.gridResolution.x; i++) {
      for (let j = 0; j < config.gridResolution.y; j++) {
        const value = slice[i][j];
        const normalized = (value - minValue) / (maxValue - minValue);
        
        // Color mapping (blue to green to yellow to red)
        let r, g, b;
        if (normalized < 0.25) {
          r = 0;
          g = normalized * 4 * 255;
          b = 255;
        } else if (normalized < 0.5) {
          r = 0;
          g = 255;
          b = (1 - (normalized - 0.25) * 4) * 255;
        } else if (normalized < 0.75) {
          r = (normalized - 0.5) * 4 * 255;
          g = 255;
          b = 0;
        } else {
          r = 255;
          g = (1 - (normalized - 0.75) * 4) * 255;
          b = 0;
        }

        ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
      }
    }

    // Draw fixture positions
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    state.objects
      .filter(obj => obj.type === 'fixture')
      .forEach(fixture => {
        const x = (fixture.x / state.room.width) * canvas.width;
        const y = (fixture.y / state.room.length) * canvas.height;
        
        ctx.beginPath();
        ctx.rect(x - 5, y - 10, 10, 20);
        ctx.stroke();
      });

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= config.gridResolution.x; i++) {
      const x = i * cellWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j <= config.gridResolution.y; j++) {
      const y = j * cellHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, [config, state, visualizationHeight]);

  // Export results
  const exportResults = () => {
    if (!results) return;

    const report = {
      timestamp: new Date().toISOString(),
      configuration: config,
      room: state.room,
      fixtures: getLightSources().length,
      results: {
        statistics: results.statistics,
        uniformity: results.uniformity,
        ppfdSlice: results.ppfdMap.map(row => 
          row.map(col => col[Math.floor(config.gridResolution.z * 0.2)])
        )
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ray-tracing-results-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (results) {
      renderResults(results);
    }
  }, [results, visualizationHeight, renderResults]);

  return (
    <div className="bg-gray-900 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Monte Carlo Ray Tracing</h2>
            <p className="text-sm text-gray-400">Physically accurate light simulation</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
          >
            <Settings className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-medium text-white mb-3">Simulation Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Rays per Source</label>
              <select
                value={config.raysPerSource}
                onChange={(e) => setConfig({ ...config, raysPerSource: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                disabled={isRunning}
              >
                <option value={10000}>10,000 (Fast)</option>
                <option value={100000}>100,000 (Normal)</option>
                <option value={1000000}>1,000,000 (Accurate)</option>
                <option value={10000000}>10,000,000 (High Quality)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Max Bounces</label>
              <input
                type="number"
                value={config.maxBounces}
                onChange={(e) => setConfig({ ...config, maxBounces: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                min="1"
                max="10"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Grid Resolution</label>
              <select
                value={config.gridResolution.x}
                onChange={(e) => {
                  const res = Number(e.target.value);
                  setConfig({ 
                    ...config, 
                    gridResolution: { x: res, y: res, z: Math.floor(res / 2.5) }
                  });
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                disabled={isRunning}
              >
                <option value={25}>25×25×10 (Coarse)</option>
                <option value={50}>50×50×20 (Normal)</option>
                <option value={100}>100×100×40 (Fine)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Spectral Sampling</label>
              <select
                value={config.spectralSampling}
                onChange={(e) => setConfig({ ...config, spectralSampling: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                disabled={isRunning}
              >
                <option value="uniform">Uniform</option>
                <option value="weighted">Weighted by Power</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={config.importanceSampling}
                onChange={(e) => setConfig({ ...config, importanceSampling: e.target.checked })}
                className="rounded border-gray-600"
                disabled={isRunning}
              />
              Importance Sampling
            </label>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={runSimulation}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Run Simulation
          </button>
        ) : (
          <button
            onClick={stopSimulation}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
          >
            <Pause className="w-4 h-4" />
            Stop
          </button>
        )}
        {results && (
          <button
            onClick={exportResults}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Results
          </button>
        )}
      </div>

      {/* Progress */}
      {isRunning && (
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Tracing rays...</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visualization */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-white">PPFD Distribution</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Height:</label>
              <input
                type="range"
                min="0"
                max={state.room.height}
                step="0.1"
                value={visualizationHeight}
                onChange={(e) => setVisualizationHeight(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-white">{visualizationHeight.toFixed(1)}m</span>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={500}
              height={400}
              className="w-full h-auto bg-gray-900 rounded"
            />
            {results && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex gap-4">
                  <span className="text-gray-400">Min: <span className="text-white">{results.uniformity.min.toFixed(0)} µmol</span></span>
                  <span className="text-gray-400">Max: <span className="text-white">{results.uniformity.max.toFixed(0)} µmol</span></span>
                  <span className="text-gray-400">Avg: <span className="text-white">{results.uniformity.avg.toFixed(0)} µmol</span></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        {results && (
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Simulation Results</h3>
            <div className="space-y-4">
              {/* Performance Metrics */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Total Rays:</span>
                    <span className="text-white ml-2">{results.statistics.totalRays.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Computation Time:</span>
                    <span className="text-white ml-2">{(results.statistics.computationTime / 1000).toFixed(2)}s</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Avg Path Length:</span>
                    <span className="text-white ml-2">{results.statistics.averagePathLength.toFixed(2)}m</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Photon Efficiency:</span>
                    <span className="text-white ml-2">{(results.statistics.photonEfficiency * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Uniformity Analysis */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Uniformity Analysis
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Coefficient of Variation</span>
                      <span className={`font-medium ${
                        results.uniformity.cv < 10 ? 'text-green-400' :
                        results.uniformity.cv < 20 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {results.uniformity.cv.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          results.uniformity.cv < 10 ? 'bg-green-600' :
                          results.uniformity.cv < 20 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(100, results.uniformity.cv * 2)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {results.uniformity.cv < 10 ? 'Excellent uniformity' :
                     results.uniformity.cv < 20 ? 'Good uniformity' : 'Poor uniformity - consider adjusting fixture layout'}
                  </div>
                </div>
              </div>

              {/* Convergence Status */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Convergence Status
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${results.statistics.convergenceRate * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-white">{(results.statistics.convergenceRate * 100).toFixed(0)}%</span>
                </div>
                {results.statistics.convergenceRate < 0.9 && (
                  <p className="text-xs text-yellow-400 mt-2">
                    Consider increasing ray count for better convergence
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">About Monte Carlo Ray Tracing</p>
            <p>
              This simulation uses physically accurate ray tracing to calculate light distribution. 
              It accounts for surface reflections, spectral power distribution, and multiple bounces 
              to provide the most accurate photometric predictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}