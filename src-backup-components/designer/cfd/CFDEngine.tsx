'use client';

import { useMemo } from 'react';

// CFD Constants
const CFD_CONSTANTS = {
  AIR_DENSITY: 1.225, // kg/m³ at 20°C
  AIR_VISCOSITY: 1.81e-5, // Pa·s
  AIR_THERMAL_CONDUCTIVITY: 0.026, // W/(m·K)
  SPECIFIC_HEAT_AIR: 1005, // J/(kg·K)
  PRANDTL_NUMBER: 0.71,
  GRAVITY: 9.81, // m/s²
  BETA_EXPANSION: 0.00343, // 1/K thermal expansion coefficient
  CONVERGENCE_TOLERANCE: 1e-4,
  RELAXATION_FACTOR: 0.7
};

interface CFDGrid {
  u: number[][][]; // x-velocity
  v: number[][][]; // y-velocity
  w: number[][][]; // z-velocity
  p: number[][][]; // pressure
  T: number[][][]; // temperature
  rho: number[][][]; // density
}

interface BoundaryCondition {
  type: 'inlet' | 'outlet' | 'wall' | 'symmetry';
  value?: number;
  temperature?: number;
  velocity?: { x: number; y: number; z: number };
}

interface HeatSource {
  x: number;
  y: number;
  z: number;
  power: number; // Watts
  width: number;
  length: number;
  height: number;
}

export interface CFDConfig {
  roomDimensions: { width: number; length: number; height: number };
  gridResolution: { x: number; y: number; z: number };
  ambientTemp: number; // °C
  inletVelocity: number; // m/s
  heatSources: HeatSource[];
  boundaries: {
    north?: BoundaryCondition;
    south?: BoundaryCondition;
    east?: BoundaryCondition;
    west?: BoundaryCondition;
    floor?: BoundaryCondition;
    ceiling?: BoundaryCondition;
  };
  turbulenceModel: 'laminar' | 'k-epsilon' | 'k-omega';
  iterations: number;
}

export interface CFDResults {
  velocityField: { u: number[][][]; v: number[][][]; w: number[][][]; magnitude: number[][][] };
  temperatureField: number[][][];
  pressureField: number[][][];
  streamlines: Array<{ points: Array<{ x: number; y: number; z: number }> }>;
  metrics: {
    maxVelocity: number;
    avgVelocity: number;
    maxTemperature: number;
    minTemperature: number;
    avgTemperature: number;
    pressureDrop: number;
    airChangeRate: number;
    mixingEfficiency: number;
    thermalComfort: {
      pmv: number; // Predicted Mean Vote
      ppd: number; // Predicted Percentage Dissatisfied
    };
  };
  convergenceHistory: number[];
}

export class CFDEngine {
  private config: CFDConfig;
  private grid: CFDGrid;
  private dx: number;
  private dy: number;
  private dz: number;
  private dt: number;

  constructor(config: CFDConfig) {
    this.config = config;
    
    // Calculate grid spacing
    this.dx = config.roomDimensions.width / (config.gridResolution.x - 1);
    this.dy = config.roomDimensions.length / (config.gridResolution.y - 1);
    this.dz = config.roomDimensions.height / (config.gridResolution.z - 1);
    
    // Calculate time step (CFL condition)
    const maxVelocity = Math.max(config.inletVelocity, 2.0); // m/s
    this.dt = 0.5 * Math.min(this.dx, this.dy, this.dz) / maxVelocity;
    
    // Initialize grid
    this.grid = this.initializeGrid();
  }

  private initializeGrid(): CFDGrid {
    const { x: nx, y: ny, z: nz } = this.config.gridResolution;
    
    // Create 3D arrays
    const create3DArray = (value: number) => 
      Array(nx).fill(0).map(() => 
        Array(ny).fill(0).map(() => 
          Array(nz).fill(value)
        )
      );
    
    return {
      u: create3DArray(0),
      v: create3DArray(0),
      w: create3DArray(0),
      p: create3DArray(101325), // Atmospheric pressure in Pa
      T: create3DArray(this.config.ambientTemp + 273.15), // Convert to Kelvin
      rho: create3DArray(CFD_CONSTANTS.AIR_DENSITY)
    };
  }

  public solve(): CFDResults {
    const convergenceHistory: number[] = [];
    
    // Apply initial conditions
    this.applyBoundaryConditions();
    this.applyHeatSources();
    
    // Main solver loop
    for (let iter = 0; iter < this.config.iterations; iter++) {
      const residual = this.solveStep();
      convergenceHistory.push(residual);
      
      if (residual < CFD_CONSTANTS.CONVERGENCE_TOLERANCE) {
        break;
      }
    }
    
    // Calculate results
    return this.calculateResults(convergenceHistory);
  }

  private solveStep(): number {
    // Store old values for residual calculation
    const oldU = this.deepCopy3D(this.grid.u);
    
    // Step 1: Solve momentum equations (simplified SIMPLE algorithm)
    this.solveMomentum();
    
    // Step 2: Solve pressure correction
    this.solvePressureCorrection();
    
    // Step 3: Correct velocities
    this.correctVelocities();
    
    // Step 4: Solve energy equation
    this.solveEnergy();
    
    // Step 5: Update density based on temperature
    this.updateDensity();
    
    // Apply boundary conditions
    this.applyBoundaryConditions();
    
    // Calculate residual
    return this.calculateResidual(oldU, this.grid.u);
  }

  private solveMomentum(): void {
    const { x: nx, y: ny, z: nz } = this.config.gridResolution;
    const { u, v, w, p, T, rho } = this.grid;
    
    // Temporary arrays for new velocities
    const newU = this.deepCopy3D(u);
    const newV = this.deepCopy3D(v);
    const newW = this.deepCopy3D(w);
    
    // Solve for each interior point
    for (let i = 1; i < nx - 1; i++) {
      for (let j = 1; j < ny - 1; j++) {
        for (let k = 1; k < nz - 1; k++) {
          // X-momentum equation
          const convectionX = 
            u[i][j][k] * (u[i+1][j][k] - u[i-1][j][k]) / (2 * this.dx) +
            v[i][j][k] * (u[i][j+1][k] - u[i][j-1][k]) / (2 * this.dy) +
            w[i][j][k] * (u[i][j][k+1] - u[i][j][k-1]) / (2 * this.dz);
          
          const diffusionX = CFD_CONSTANTS.AIR_VISCOSITY / rho[i][j][k] * (
            (u[i+1][j][k] - 2*u[i][j][k] + u[i-1][j][k]) / (this.dx * this.dx) +
            (u[i][j+1][k] - 2*u[i][j][k] + u[i][j-1][k]) / (this.dy * this.dy) +
            (u[i][j][k+1] - 2*u[i][j][k] + u[i][j][k-1]) / (this.dz * this.dz)
          );
          
          const pressureGradientX = -(p[i+1][j][k] - p[i-1][j][k]) / (2 * this.dx * rho[i][j][k]);
          
          // Buoyancy force (Boussinesq approximation)
          const buoyancyX = 0; // No buoyancy in x-direction
          
          newU[i][j][k] = u[i][j][k] + this.dt * (
            -convectionX + diffusionX + pressureGradientX + buoyancyX
          );
          
          // Y-momentum equation (similar structure)
          const convectionY = 
            u[i][j][k] * (v[i+1][j][k] - v[i-1][j][k]) / (2 * this.dx) +
            v[i][j][k] * (v[i][j+1][k] - v[i][j-1][k]) / (2 * this.dy) +
            w[i][j][k] * (v[i][j][k+1] - v[i][j][k-1]) / (2 * this.dz);
          
          const diffusionY = CFD_CONSTANTS.AIR_VISCOSITY / rho[i][j][k] * (
            (v[i+1][j][k] - 2*v[i][j][k] + v[i-1][j][k]) / (this.dx * this.dx) +
            (v[i][j+1][k] - 2*v[i][j][k] + v[i][j-1][k]) / (this.dy * this.dy) +
            (v[i][j][k+1] - 2*v[i][j][k] + v[i][j][k-1]) / (this.dz * this.dz)
          );
          
          const pressureGradientY = -(p[i][j+1][k] - p[i][j-1][k]) / (2 * this.dy * rho[i][j][k]);
          const buoyancyY = 0;
          
          newV[i][j][k] = v[i][j][k] + this.dt * (
            -convectionY + diffusionY + pressureGradientY + buoyancyY
          );
          
          // Z-momentum equation (includes buoyancy)
          const convectionZ = 
            u[i][j][k] * (w[i+1][j][k] - w[i-1][j][k]) / (2 * this.dx) +
            v[i][j][k] * (w[i][j+1][k] - w[i][j-1][k]) / (2 * this.dy) +
            w[i][j][k] * (w[i][j][k+1] - w[i][j][k-1]) / (2 * this.dz);
          
          const diffusionZ = CFD_CONSTANTS.AIR_VISCOSITY / rho[i][j][k] * (
            (w[i+1][j][k] - 2*w[i][j][k] + w[i-1][j][k]) / (this.dx * this.dx) +
            (w[i][j+1][k] - 2*w[i][j][k] + w[i][j-1][k]) / (this.dy * this.dy) +
            (w[i][j][k+1] - 2*w[i][j][k] + w[i][j][k-1]) / (this.dz * this.dz)
          );
          
          const pressureGradientZ = -(p[i][j][k+1] - p[i][j][k-1]) / (2 * this.dz * rho[i][j][k]);
          
          // Buoyancy force using Boussinesq approximation
          const T0 = this.config.ambientTemp + 273.15;
          const buoyancyZ = CFD_CONSTANTS.GRAVITY * CFD_CONSTANTS.BETA_EXPANSION * (T[i][j][k] - T0);
          
          newW[i][j][k] = w[i][j][k] + this.dt * (
            -convectionZ + diffusionZ + pressureGradientZ + buoyancyZ
          );
        }
      }
    }
    
    // Apply relaxation
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        for (let k = 0; k < nz; k++) {
          this.grid.u[i][j][k] = CFD_CONSTANTS.RELAXATION_FACTOR * newU[i][j][k] + 
                                 (1 - CFD_CONSTANTS.RELAXATION_FACTOR) * this.grid.u[i][j][k];
          this.grid.v[i][j][k] = CFD_CONSTANTS.RELAXATION_FACTOR * newV[i][j][k] + 
                                 (1 - CFD_CONSTANTS.RELAXATION_FACTOR) * this.grid.v[i][j][k];
          this.grid.w[i][j][k] = CFD_CONSTANTS.RELAXATION_FACTOR * newW[i][j][k] + 
                                 (1 - CFD_CONSTANTS.RELAXATION_FACTOR) * this.grid.w[i][j][k];
        }
      }
    }
  }

  private solvePressureCorrection(): void {
    const { x: nx, y: ny, z: nz } = this.config.gridResolution;
    const { u, v, w, p, rho } = this.grid;
    
    // Solve Poisson equation for pressure correction
    // Using Gauss-Seidel iteration
    for (let iter = 0; iter < 20; iter++) {
      for (let i = 1; i < nx - 1; i++) {
        for (let j = 1; j < ny - 1; j++) {
          for (let k = 1; k < nz - 1; k++) {
            // Calculate divergence of velocity field
            const divergence = 
              (u[i+1][j][k] - u[i-1][j][k]) / (2 * this.dx) +
              (v[i][j+1][k] - v[i][j-1][k]) / (2 * this.dy) +
              (w[i][j][k+1] - w[i][j][k-1]) / (2 * this.dz);
            
            // Pressure correction
            const avg_rho = rho[i][j][k];
            const coeff = 2 * (1/(this.dx*this.dx) + 1/(this.dy*this.dy) + 1/(this.dz*this.dz));
            
            p[i][j][k] = (1/coeff) * (
              (p[i+1][j][k] + p[i-1][j][k]) / (this.dx * this.dx) +
              (p[i][j+1][k] + p[i][j-1][k]) / (this.dy * this.dy) +
              (p[i][j][k+1] + p[i][j][k-1]) / (this.dz * this.dz) -
              avg_rho * divergence / this.dt
            );
          }
        }
      }
    }
  }

  private correctVelocities(): void {
    const { x: nx, y: ny, z: nz } = this.config.gridResolution;
    const { u, v, w, p, rho } = this.grid;
    
    // Correct velocities based on pressure gradient
    for (let i = 1; i < nx - 1; i++) {
      for (let j = 1; j < ny - 1; j++) {
        for (let k = 1; k < nz - 1; k++) {
          u[i][j][k] -= this.dt * (p[i+1][j][k] - p[i-1][j][k]) / (2 * this.dx * rho[i][j][k]);
          v[i][j][k] -= this.dt * (p[i][j+1][k] - p[i][j-1][k]) / (2 * this.dy * rho[i][j][k]);
          w[i][j][k] -= this.dt * (p[i][j][k+1] - p[i][j][k-1]) / (2 * this.dz * rho[i][j][k]);
        }
      }
    }
  }

  private solveEnergy(): void {
    const { x: nx, y: ny, z: nz } = this.config.gridResolution;
    const { u, v, w, T, rho } = this.grid;
    
    const newT = this.deepCopy3D(T);
    const alpha = CFD_CONSTANTS.AIR_THERMAL_CONDUCTIVITY / 
                  (CFD_CONSTANTS.AIR_DENSITY * CFD_CONSTANTS.SPECIFIC_HEAT_AIR);
    
    for (let i = 1; i < nx - 1; i++) {
      for (let j = 1; j < ny - 1; j++) {
        for (let k = 1; k < nz - 1; k++) {
          // Convection terms
          const convection = 
            u[i][j][k] * (T[i+1][j][k] - T[i-1][j][k]) / (2 * this.dx) +
            v[i][j][k] * (T[i][j+1][k] - T[i][j-1][k]) / (2 * this.dy) +
            w[i][j][k] * (T[i][j][k+1] - T[i][j][k-1]) / (2 * this.dz);
          
          // Diffusion terms
          const diffusion = alpha * (
            (T[i+1][j][k] - 2*T[i][j][k] + T[i-1][j][k]) / (this.dx * this.dx) +
            (T[i][j+1][k] - 2*T[i][j][k] + T[i][j-1][k]) / (this.dy * this.dy) +
            (T[i][j][k+1] - 2*T[i][j][k] + T[i][j][k-1]) / (this.dz * this.dz)
          );
          
          newT[i][j][k] = T[i][j][k] + this.dt * (-convection + diffusion);
        }
      }
    }
    
    // Apply relaxation
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        for (let k = 0; k < nz; k++) {
          this.grid.T[i][j][k] = CFD_CONSTANTS.RELAXATION_FACTOR * newT[i][j][k] + 
                                 (1 - CFD_CONSTANTS.RELAXATION_FACTOR) * this.grid.T[i][j][k];
        }
      }
    }
  }

  private updateDensity(): void {
    const { x: nx, y: ny, z: nz } = this.config.gridResolution;
    const { T, rho } = this.grid;
    const T0 = this.config.ambientTemp + 273.15;
    const rho0 = CFD_CONSTANTS.AIR_DENSITY;
    
    // Update density using ideal gas law
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        for (let k = 0; k < nz; k++) {
          rho[i][j][k] = rho0 * T0 / T[i][j][k];
        }
      }
    }
  }

  private applyBoundaryConditions(): void {
    const { x: nx, y: ny, z: nz } = this.config.gridResolution;
    const { boundaries } = this.config;
    
    // Apply inlet boundary conditions
    if (boundaries.west?.type === 'inlet') {
      const velocity = boundaries.west.velocity || { x: this.config.inletVelocity, y: 0, z: 0 };
      const temp = (boundaries.west.temperature || this.config.ambientTemp) + 273.15;
      
      for (let j = 0; j < ny; j++) {
        for (let k = 0; k < nz; k++) {
          this.grid.u[0][j][k] = velocity.x;
          this.grid.v[0][j][k] = velocity.y;
          this.grid.w[0][j][k] = velocity.z;
          this.grid.T[0][j][k] = temp;
        }
      }
    }
    
    // Apply outlet boundary conditions (zero gradient)
    if (boundaries.east?.type === 'outlet') {
      for (let j = 0; j < ny; j++) {
        for (let k = 0; k < nz; k++) {
          this.grid.u[nx-1][j][k] = this.grid.u[nx-2][j][k];
          this.grid.v[nx-1][j][k] = this.grid.v[nx-2][j][k];
          this.grid.w[nx-1][j][k] = this.grid.w[nx-2][j][k];
          this.grid.p[nx-1][j][k] = 101325; // Atmospheric pressure
          this.grid.T[nx-1][j][k] = this.grid.T[nx-2][j][k];
        }
      }
    }
    
    // Apply wall boundary conditions (no-slip)
    // Floor
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        this.grid.u[i][j][0] = 0;
        this.grid.v[i][j][0] = 0;
        this.grid.w[i][j][0] = 0;
        if (boundaries.floor?.temperature) {
          this.grid.T[i][j][0] = boundaries.floor.temperature + 273.15;
        }
      }
    }
    
    // Ceiling
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        this.grid.u[i][j][nz-1] = 0;
        this.grid.v[i][j][nz-1] = 0;
        this.grid.w[i][j][nz-1] = 0;
        if (boundaries.ceiling?.temperature) {
          this.grid.T[i][j][nz-1] = boundaries.ceiling.temperature + 273.15;
        }
      }
    }
    
    // North and South walls
    for (let i = 0; i < nx; i++) {
      for (let k = 0; k < nz; k++) {
        // North wall
        this.grid.u[i][ny-1][k] = 0;
        this.grid.v[i][ny-1][k] = 0;
        this.grid.w[i][ny-1][k] = 0;
        
        // South wall
        this.grid.u[i][0][k] = 0;
        this.grid.v[i][0][k] = 0;
        this.grid.w[i][0][k] = 0;
      }
    }
  }

  private applyHeatSources(): void {
    const { x: nx, y: ny, z: nz } = this.config.gridResolution;
    
    for (const source of this.config.heatSources) {
      // Find grid indices for heat source
      const i_start = Math.floor((source.x - source.width/2) / this.dx);
      const i_end = Math.ceil((source.x + source.width/2) / this.dx);
      const j_start = Math.floor((source.y - source.length/2) / this.dy);
      const j_end = Math.ceil((source.y + source.length/2) / this.dy);
      const k_start = Math.floor((source.z - source.height/2) / this.dz);
      const k_end = Math.ceil((source.z + source.height/2) / this.dz);
      
      // Apply heat source
      const volumetricHeat = source.power / (source.width * source.length * source.height);
      const tempIncrease = volumetricHeat * this.dt / 
                          (CFD_CONSTANTS.AIR_DENSITY * CFD_CONSTANTS.SPECIFIC_HEAT_AIR);
      
      for (let i = Math.max(0, i_start); i < Math.min(nx, i_end); i++) {
        for (let j = Math.max(0, j_start); j < Math.min(ny, j_end); j++) {
          for (let k = Math.max(0, k_start); k < Math.min(nz, k_end); k++) {
            this.grid.T[i][j][k] += tempIncrease;
          }
        }
      }
    }
  }

  private calculateResidual(oldField: number[][][], newField: number[][][]): number {
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < oldField.length; i++) {
      for (let j = 0; j < oldField[0].length; j++) {
        for (let k = 0; k < oldField[0][0].length; k++) {
          sum += Math.abs(newField[i][j][k] - oldField[i][j][k]);
          count++;
        }
      }
    }
    
    return sum / count;
  }

  private calculateResults(convergenceHistory: number[]): CFDResults {
    const { x: nx, y: ny, z: nz } = this.config.gridResolution;
    const { u, v, w, T, p } = this.grid;
    
    // Calculate velocity magnitude
    const magnitude = this.create3DArray(nx, ny, nz, 0);
    let maxVelocity = 0;
    let totalVelocity = 0;
    
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        for (let k = 0; k < nz; k++) {
          const mag = Math.sqrt(u[i][j][k]**2 + v[i][j][k]**2 + w[i][j][k]**2);
          magnitude[i][j][k] = mag;
          maxVelocity = Math.max(maxVelocity, mag);
          totalVelocity += mag;
        }
      }
    }
    
    // Temperature statistics
    let maxTemp = -Infinity;
    let minTemp = Infinity;
    let totalTemp = 0;
    
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        for (let k = 0; k < nz; k++) {
          const tempC = T[i][j][k] - 273.15;
          maxTemp = Math.max(maxTemp, tempC);
          minTemp = Math.min(minTemp, tempC);
          totalTemp += tempC;
        }
      }
    }
    
    const numCells = nx * ny * nz;
    
    // Calculate air change rate (simplified)
    const roomVolume = this.config.roomDimensions.width * 
                      this.config.roomDimensions.length * 
                      this.config.roomDimensions.height;
    const avgInletVelocity = this.config.inletVelocity;
    const inletArea = this.config.roomDimensions.height * this.config.roomDimensions.length * 0.1; // 10% of wall
    const volumetricFlowRate = avgInletVelocity * inletArea;
    const airChangeRate = (volumetricFlowRate / roomVolume) * 3600; // ACH
    
    // Calculate thermal comfort indices (simplified PMV/PPD)
    const avgTemp = totalTemp / numCells;
    const avgVel = totalVelocity / numCells;
    
    // Simplified PMV calculation (Fanger's equation)
    const metabolicRate = 1.2; // met (office work)
    const clothingInsulation = 0.5; // clo (light clothing)
    const relativeHumidity = 50; // %
    
    const pmv = this.calculatePMV(avgTemp, avgVel, relativeHumidity, metabolicRate, clothingInsulation);
    const ppd = 100 - 95 * Math.exp(-0.03353 * Math.pow(pmv, 4) - 0.2179 * Math.pow(pmv, 2));
    
    // Generate streamlines
    const streamlines = this.generateStreamlines(20);
    
    return {
      velocityField: { u, v, w, magnitude },
      temperatureField: T,
      pressureField: p,
      streamlines,
      metrics: {
        maxVelocity,
        avgVelocity: totalVelocity / numCells,
        maxTemperature: maxTemp,
        minTemperature: minTemp,
        avgTemperature: avgTemp,
        pressureDrop: Math.abs(p[nx-1][ny/2][nz/2] - p[0][ny/2][nz/2]),
        airChangeRate,
        mixingEfficiency: this.calculateMixingEfficiency(),
        thermalComfort: { pmv, ppd }
      },
      convergenceHistory
    };
  }

  private generateStreamlines(numStreamlines: number): Array<{ points: Array<{ x: number; y: number; z: number }> }> {
    const streamlines = [];
    const { x: nx, y: ny, z: nz } = this.config.gridResolution;
    
    for (let s = 0; s < numStreamlines; s++) {
      const points = [];
      
      // Random starting point
      let x = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * this.config.roomDimensions.width;
      let y = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * this.config.roomDimensions.length;
      let z = this.config.roomDimensions.height * (0.3 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4);
      
      // Trace streamline
      for (let step = 0; step < 100; step++) {
        points.push({ x, y, z });
        
        // Interpolate velocity at current position
        const i = x / this.dx;
        const j = y / this.dy;
        const k = z / this.dz;
        
        if (i < 0 || i >= nx-1 || j < 0 || j >= ny-1 || k < 0 || k >= nz-1) break;
        
        const vel = this.interpolateVelocity(i, j, k);
        const speed = Math.sqrt(vel.u**2 + vel.v**2 + vel.w**2);
        
        if (speed < 0.01) break; // Stop if velocity is too low
        
        // Update position
        const dt = 0.1;
        x += vel.u * dt;
        y += vel.v * dt;
        z += vel.w * dt;
      }
      
      if (points.length > 1) {
        streamlines.push({ points });
      }
    }
    
    return streamlines;
  }

  private interpolateVelocity(i: number, j: number, k: number): { u: number; v: number; w: number } {
    const i0 = Math.floor(i);
    const j0 = Math.floor(j);
    const k0 = Math.floor(k);
    
    const fx = i - i0;
    const fy = j - j0;
    const fz = k - k0;
    
    // Trilinear interpolation
    const u = 
      this.grid.u[i0][j0][k0] * (1-fx) * (1-fy) * (1-fz) +
      this.grid.u[i0+1][j0][k0] * fx * (1-fy) * (1-fz) +
      this.grid.u[i0][j0+1][k0] * (1-fx) * fy * (1-fz) +
      this.grid.u[i0][j0][k0+1] * (1-fx) * (1-fy) * fz +
      this.grid.u[i0+1][j0+1][k0] * fx * fy * (1-fz) +
      this.grid.u[i0+1][j0][k0+1] * fx * (1-fy) * fz +
      this.grid.u[i0][j0+1][k0+1] * (1-fx) * fy * fz +
      this.grid.u[i0+1][j0+1][k0+1] * fx * fy * fz;
    
    const v = 
      this.grid.v[i0][j0][k0] * (1-fx) * (1-fy) * (1-fz) +
      this.grid.v[i0+1][j0][k0] * fx * (1-fy) * (1-fz) +
      this.grid.v[i0][j0+1][k0] * (1-fx) * fy * (1-fz) +
      this.grid.v[i0][j0][k0+1] * (1-fx) * (1-fy) * fz +
      this.grid.v[i0+1][j0+1][k0] * fx * fy * (1-fz) +
      this.grid.v[i0+1][j0][k0+1] * fx * (1-fy) * fz +
      this.grid.v[i0][j0+1][k0+1] * (1-fx) * fy * fz +
      this.grid.v[i0+1][j0+1][k0+1] * fx * fy * fz;
    
    const w = 
      this.grid.w[i0][j0][k0] * (1-fx) * (1-fy) * (1-fz) +
      this.grid.w[i0+1][j0][k0] * fx * (1-fy) * (1-fz) +
      this.grid.w[i0][j0+1][k0] * (1-fx) * fy * (1-fz) +
      this.grid.w[i0][j0][k0+1] * (1-fx) * (1-fy) * fz +
      this.grid.w[i0+1][j0+1][k0] * fx * fy * (1-fz) +
      this.grid.w[i0+1][j0][k0+1] * fx * (1-fy) * fz +
      this.grid.w[i0][j0+1][k0+1] * (1-fx) * fy * fz +
      this.grid.w[i0+1][j0+1][k0+1] * fx * fy * fz;
    
    return { u, v, w };
  }

  private calculatePMV(temp: number, velocity: number, rh: number, met: number, clo: number): number {
    // Simplified PMV calculation
    // Full equation is quite complex; this is a reasonable approximation
    const pa = rh * 10 * Math.exp(16.6536 - 4030.183 / (temp + 235)); // Water vapor pressure
    
    // Heat transfer coefficients
    const hc = Math.max(2.38 * Math.pow(Math.abs(temp - 34), 0.25), 12.1 * Math.sqrt(velocity));
    const fcl = clo <= 0.078 ? 1 + 1.29 * clo : 1.05 + 0.645 * clo;
    
    // Thermal sensation
    const pmv = (0.303 * Math.exp(-0.036 * met * 58.15) + 0.028) * (
      (met * 58.15 - 3.05e-3 * (5733 - 6.99 * met * 58.15 - pa)) -
      0.42 * (met * 58.15 - 58.15) -
      1.7e-5 * met * 58.15 * (5867 - pa) -
      0.0014 * met * 58.15 * (34 - temp) -
      3.96e-8 * fcl * (Math.pow(35.7 - 0.028 * met * 58.15, 4) - Math.pow(temp + 273, 4)) -
      fcl * hc * (35.7 - 0.028 * met * 58.15 - temp)
    );
    
    return Math.max(-3, Math.min(3, pmv)); // Clamp to [-3, 3]
  }

  private calculateMixingEfficiency(): number {
    // Calculate coefficient of variation of temperature
    const temps: number[] = [];
    const { x: nx, y: ny, z: nz } = this.config.gridResolution;
    
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        for (let k = 0; k < nz; k++) {
          temps.push(this.grid.T[i][j][k]);
        }
      }
    }
    
    const mean = temps.reduce((a, b) => a + b) / temps.length;
    const variance = temps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / temps.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;
    
    // Lower CV means better mixing
    return Math.max(0, Math.min(1, 1 - cv * 10));
  }

  private deepCopy3D(arr: number[][][]): number[][][] {
    return arr.map(plane => plane.map(row => [...row]));
  }

  private create3DArray(x: number, y: number, z: number, value: number): number[][][] {
    return Array(x).fill(0).map(() => 
      Array(y).fill(0).map(() => 
        Array(z).fill(value)
      )
    );
  }
}

// Export a React hook for easier use
export function useCFDAnalysis(config: CFDConfig) {
  return useMemo(() => {
    const engine = new CFDEngine(config);
    return engine.solve();
  }, [
    config.roomDimensions,
    config.gridResolution,
    config.ambientTemp,
    config.inletVelocity,
    config.heatSources,
    config.iterations
  ]);
}