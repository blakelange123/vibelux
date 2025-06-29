/**
 * Computational Fluid Dynamics (CFD) Engine for HVAC Airflow Modeling
 * Implements simplified Navier-Stokes equations for incompressible flow
 */

export interface CFDConfig {
  // Grid resolution
  gridSizeX: number
  gridSizeY: number
  gridSizeZ: number
  cellSize: number // meters
  
  // Fluid properties
  airDensity: number // kg/m³
  airViscosity: number // Pa·s
  thermalDiffusivity: number // m²/s
  
  // Simulation parameters
  timeStep: number // seconds
  iterations: number
  convergenceTolerance: number
  
  // Boundary conditions
  ambientTemperature: number // °C
  ambientPressure: number // Pa
}

export interface BoundaryCondition {
  type: 'wall' | 'inlet' | 'outlet' | 'obstacle'
  position: { x: number; y: number; z: number }
  size: { width: number; height: number; depth: number }
  properties: {
    velocity?: { x: number; y: number; z: number } // m/s
    temperature?: number // °C
    pressure?: number // Pa
    flowRate?: number // m³/s
  }
}

export interface HeatSource {
  position: { x: number; y: number; z: number }
  size: { width: number; height: number; depth: number }
  power: number // Watts
  type: 'fixture' | 'equipment' | 'plant'
}

export interface CFDResult {
  velocityField: Float32Array // 3D vector field (u, v, w)
  temperatureField: Float32Array // 3D scalar field
  pressureField: Float32Array // 3D scalar field
  convergenceHistory: number[]
  maxVelocity: number
  minTemperature: number
  maxTemperature: number
  avgTemperature: number
  uniformityIndex: number // 0-1, how uniform the temperature distribution is
}

export class CFDEngine {
  private config: CFDConfig
  private boundaries: BoundaryCondition[] = []
  private heatSources: HeatSource[] = []
  
  // Grid data - using flat arrays for performance
  private u!: Float32Array // x-velocity
  private v!: Float32Array // y-velocity  
  private w!: Float32Array // z-velocity
  private p!: Float32Array // pressure
  private T!: Float32Array // temperature
  private div!: Float32Array // divergence
  
  // Previous timestep values
  private u0!: Float32Array
  private v0!: Float32Array
  private w0!: Float32Array
  private T0!: Float32Array
  
  constructor(config: CFDConfig) {
    this.config = config
    this.initializeGrids()
  }
  
  private initializeGrids() {
    const size = this.config.gridSizeX * this.config.gridSizeY * this.config.gridSizeZ
    
    // Current values
    this.u = new Float32Array(size)
    this.v = new Float32Array(size)
    this.w = new Float32Array(size)
    this.p = new Float32Array(size)
    this.T = new Float32Array(size).fill(this.config.ambientTemperature)
    this.div = new Float32Array(size)
    
    // Previous values
    this.u0 = new Float32Array(size)
    this.v0 = new Float32Array(size)
    this.w0 = new Float32Array(size)
    this.T0 = new Float32Array(size)
  }
  
  // Convert 3D coordinates to 1D array index
  private idx(i: number, j: number, k: number): number {
    return i + j * this.config.gridSizeX + k * this.config.gridSizeX * this.config.gridSizeY
  }
  
  // Add boundary conditions
  addBoundary(boundary: BoundaryCondition) {
    this.boundaries.push(boundary)
  }
  
  // Add heat sources
  addHeatSource(source: HeatSource) {
    this.heatSources.push(source)
  }
  
  // Main simulation step
  simulate(): CFDResult {
    const convergenceHistory: number[] = []
    
    for (let iter = 0; iter < this.config.iterations; iter++) {
      // Store previous values
      this.u0.set(this.u)
      this.v0.set(this.v)
      this.w0.set(this.w)
      this.T0.set(this.T)
      
      // Apply boundary conditions
      this.applyBoundaryConditions()
      
      // Solve velocity field (simplified Navier-Stokes)
      this.advectVelocity()
      this.diffuseVelocity()
      this.projectVelocity()
      
      // Solve temperature field
      this.advectTemperature()
      this.diffuseTemperature()
      this.applyHeatSources()
      
      // Check convergence
      const residual = this.calculateResidual()
      convergenceHistory.push(residual)
      
      if (residual < this.config.convergenceTolerance) {
        break
      }
    }
    
    return this.extractResults(convergenceHistory)
  }
  
  // Apply boundary conditions to the grid
  private applyBoundaryConditions() {
    for (const boundary of this.boundaries) {
      const { position, size, type, properties } = boundary
      
      // Convert world coordinates to grid indices
      const i0 = Math.floor(position.x / this.config.cellSize)
      const j0 = Math.floor(position.y / this.config.cellSize)
      const k0 = Math.floor(position.z / this.config.cellSize)
      
      const i1 = Math.ceil((position.x + size.width) / this.config.cellSize)
      const j1 = Math.ceil((position.y + size.height) / this.config.cellSize)
      const k1 = Math.ceil((position.z + size.depth) / this.config.cellSize)
      
      for (let i = i0; i < i1; i++) {
        for (let j = j0; j < j1; j++) {
          for (let k = k0; k < k1; k++) {
            if (this.isValidCell(i, j, k)) {
              const idx = this.idx(i, j, k)
              
              switch (type) {
                case 'wall':
                case 'obstacle':
                  // No-slip condition
                  this.u[idx] = 0
                  this.v[idx] = 0
                  this.w[idx] = 0
                  break
                  
                case 'inlet':
                  if (properties.velocity) {
                    this.u[idx] = properties.velocity.x
                    this.v[idx] = properties.velocity.y
                    this.w[idx] = properties.velocity.z
                  }
                  if (properties.temperature !== undefined) {
                    this.T[idx] = properties.temperature
                  }
                  break
                  
                case 'outlet':
                  // Neumann boundary condition (zero gradient)
                  // Handled in projection step
                  break
              }
            }
          }
        }
      }
    }
  }
  
  // Advection step using semi-Lagrangian method
  private advectVelocity() {
    const dt = this.config.timeStep
    const { gridSizeX, gridSizeY, gridSizeZ } = this.config
    
    for (let i = 1; i < gridSizeX - 1; i++) {
      for (let j = 1; j < gridSizeY - 1; j++) {
        for (let k = 1; k < gridSizeZ - 1; k++) {
          const idx = this.idx(i, j, k)
          
          // Backtrace particle
          const x = i - dt * this.u0[idx]
          const y = j - dt * this.v0[idx]
          const z = k - dt * this.w0[idx]
          
          // Trilinear interpolation
          this.u[idx] = this.interpolate(x, y, z, this.u0)
          this.v[idx] = this.interpolate(x, y, z, this.v0)
          this.w[idx] = this.interpolate(x, y, z, this.w0)
        }
      }
    }
  }
  
  // Diffusion step using implicit method
  private diffuseVelocity() {
    const visc = this.config.airViscosity
    const dt = this.config.timeStep
    const a = dt * visc
    
    // Gauss-Seidel relaxation
    for (let iter = 0; iter < 20; iter++) {
      this.gaussSeidelVelocity(this.u, this.u0, a)
      this.gaussSeidelVelocity(this.v, this.v0, a)
      this.gaussSeidelVelocity(this.w, this.w0, a)
    }
  }
  
  // Pressure projection to ensure incompressibility
  private projectVelocity() {
    const { gridSizeX, gridSizeY, gridSizeZ } = this.config
    
    // Calculate divergence
    for (let i = 1; i < gridSizeX - 1; i++) {
      for (let j = 1; j < gridSizeY - 1; j++) {
        for (let k = 1; k < gridSizeZ - 1; k++) {
          const idx = this.idx(i, j, k)
          
          this.div[idx] = -0.5 * (
            this.u[this.idx(i + 1, j, k)] - this.u[this.idx(i - 1, j, k)] +
            this.v[this.idx(i, j + 1, k)] - this.v[this.idx(i, j - 1, k)] +
            this.w[this.idx(i, j, k + 1)] - this.w[this.idx(i, j, k - 1)]
          )
          
          this.p[idx] = 0
        }
      }
    }
    
    // Solve Poisson equation for pressure
    for (let iter = 0; iter < 20; iter++) {
      this.gaussSeidelPressure()
    }
    
    // Subtract pressure gradient from velocity
    for (let i = 1; i < gridSizeX - 1; i++) {
      for (let j = 1; j < gridSizeY - 1; j++) {
        for (let k = 1; k < gridSizeZ - 1; k++) {
          const idx = this.idx(i, j, k)
          
          this.u[idx] -= 0.5 * (this.p[this.idx(i + 1, j, k)] - this.p[this.idx(i - 1, j, k)])
          this.v[idx] -= 0.5 * (this.p[this.idx(i, j + 1, k)] - this.p[this.idx(i, j - 1, k)])
          this.w[idx] -= 0.5 * (this.p[this.idx(i, j, k + 1)] - this.p[this.idx(i, j, k - 1)])
        }
      }
    }
  }
  
  // Temperature advection
  private advectTemperature() {
    const dt = this.config.timeStep
    const { gridSizeX, gridSizeY, gridSizeZ } = this.config
    
    for (let i = 1; i < gridSizeX - 1; i++) {
      for (let j = 1; j < gridSizeY - 1; j++) {
        for (let k = 1; k < gridSizeZ - 1; k++) {
          const idx = this.idx(i, j, k)
          
          // Backtrace particle
          const x = i - dt * this.u[idx]
          const y = j - dt * this.v[idx]
          const z = k - dt * this.w[idx]
          
          // Interpolate temperature
          this.T[idx] = this.interpolate(x, y, z, this.T0)
        }
      }
    }
  }
  
  // Temperature diffusion
  private diffuseTemperature() {
    const diff = this.config.thermalDiffusivity
    const dt = this.config.timeStep
    const a = dt * diff
    
    // Gauss-Seidel relaxation
    for (let iter = 0; iter < 20; iter++) {
      this.gaussSeidelScalar(this.T, this.T0, a)
    }
  }
  
  // Apply heat sources
  private applyHeatSources() {
    const dt = this.config.timeStep
    const cellVolume = Math.pow(this.config.cellSize, 3)
    const specificHeat = 1005 // J/(kg·K) for air
    
    for (const source of this.heatSources) {
      const { position, size, power } = source
      
      // Convert to grid coordinates
      const i0 = Math.floor(position.x / this.config.cellSize)
      const j0 = Math.floor(position.y / this.config.cellSize)
      const k0 = Math.floor(position.z / this.config.cellSize)
      
      const i1 = Math.ceil((position.x + size.width) / this.config.cellSize)
      const j1 = Math.ceil((position.y + size.height) / this.config.cellSize)
      const k1 = Math.ceil((position.z + size.depth) / this.config.cellSize)
      
      const numCells = (i1 - i0) * (j1 - j0) * (k1 - k0)
      const powerPerCell = power / numCells
      
      for (let i = i0; i < i1; i++) {
        for (let j = j0; j < j1; j++) {
          for (let k = k0; k < k1; k++) {
            if (this.isValidCell(i, j, k)) {
              const idx = this.idx(i, j, k)
              const mass = this.config.airDensity * cellVolume
              const deltaT = (powerPerCell * dt) / (mass * specificHeat)
              this.T[idx] += deltaT
            }
          }
        }
      }
    }
  }
  
  // Helper functions
  private isValidCell(i: number, j: number, k: number): boolean {
    return i >= 0 && i < this.config.gridSizeX &&
           j >= 0 && j < this.config.gridSizeY &&
           k >= 0 && k < this.config.gridSizeZ
  }
  
  private interpolate(x: number, y: number, z: number, field: Float32Array): number {
    // Trilinear interpolation
    const i0 = Math.floor(x)
    const j0 = Math.floor(y)
    const k0 = Math.floor(z)
    
    const i1 = i0 + 1
    const j1 = j0 + 1
    const k1 = k0 + 1
    
    const sx = x - i0
    const sy = y - j0
    const sz = z - k0
    
    // Clamp to grid boundaries
    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))
    
    const i0c = clamp(i0, 0, this.config.gridSizeX - 1)
    const i1c = clamp(i1, 0, this.config.gridSizeX - 1)
    const j0c = clamp(j0, 0, this.config.gridSizeY - 1)
    const j1c = clamp(j1, 0, this.config.gridSizeY - 1)
    const k0c = clamp(k0, 0, this.config.gridSizeZ - 1)
    const k1c = clamp(k1, 0, this.config.gridSizeZ - 1)
    
    return (1 - sx) * (1 - sy) * (1 - sz) * field[this.idx(i0c, j0c, k0c)] +
           sx * (1 - sy) * (1 - sz) * field[this.idx(i1c, j0c, k0c)] +
           (1 - sx) * sy * (1 - sz) * field[this.idx(i0c, j1c, k0c)] +
           sx * sy * (1 - sz) * field[this.idx(i1c, j1c, k0c)] +
           (1 - sx) * (1 - sy) * sz * field[this.idx(i0c, j0c, k1c)] +
           sx * (1 - sy) * sz * field[this.idx(i1c, j0c, k1c)] +
           (1 - sx) * sy * sz * field[this.idx(i0c, j1c, k1c)] +
           sx * sy * sz * field[this.idx(i1c, j1c, k1c)]
  }
  
  private gaussSeidelVelocity(x: Float32Array, x0: Float32Array, a: number) {
    const { gridSizeX, gridSizeY, gridSizeZ } = this.config
    
    for (let i = 1; i < gridSizeX - 1; i++) {
      for (let j = 1; j < gridSizeY - 1; j++) {
        for (let k = 1; k < gridSizeZ - 1; k++) {
          const idx = this.idx(i, j, k)
          
          x[idx] = (x0[idx] + a * (
            x[this.idx(i - 1, j, k)] + x[this.idx(i + 1, j, k)] +
            x[this.idx(i, j - 1, k)] + x[this.idx(i, j + 1, k)] +
            x[this.idx(i, j, k - 1)] + x[this.idx(i, j, k + 1)]
          )) / (1 + 6 * a)
        }
      }
    }
  }
  
  private gaussSeidelScalar(x: Float32Array, x0: Float32Array, a: number) {
    this.gaussSeidelVelocity(x, x0, a) // Same implementation
  }
  
  private gaussSeidelPressure() {
    const { gridSizeX, gridSizeY, gridSizeZ } = this.config
    
    for (let i = 1; i < gridSizeX - 1; i++) {
      for (let j = 1; j < gridSizeY - 1; j++) {
        for (let k = 1; k < gridSizeZ - 1; k++) {
          const idx = this.idx(i, j, k)
          
          this.p[idx] = (
            this.div[idx] +
            this.p[this.idx(i - 1, j, k)] + this.p[this.idx(i + 1, j, k)] +
            this.p[this.idx(i, j - 1, k)] + this.p[this.idx(i, j + 1, k)] +
            this.p[this.idx(i, j, k - 1)] + this.p[this.idx(i, j, k + 1)]
          ) / 6
        }
      }
    }
  }
  
  private calculateResidual(): number {
    let maxDiff = 0
    
    for (let i = 0; i < this.u.length; i++) {
      maxDiff = Math.max(maxDiff, Math.abs(this.u[i] - this.u0[i]))
      maxDiff = Math.max(maxDiff, Math.abs(this.v[i] - this.v0[i]))
      maxDiff = Math.max(maxDiff, Math.abs(this.w[i] - this.w0[i]))
    }
    
    return maxDiff
  }
  
  private extractResults(convergenceHistory: number[]): CFDResult {
    // Calculate statistics
    let maxVelocity = 0
    let minTemp = Infinity
    let maxTemp = -Infinity
    let sumTemp = 0
    let count = 0
    
    for (let i = 0; i < this.u.length; i++) {
      const vel = Math.sqrt(this.u[i]**2 + this.v[i]**2 + this.w[i]**2)
      maxVelocity = Math.max(maxVelocity, vel)
      
      if (this.T[i] > 0) { // Exclude boundary cells
        minTemp = Math.min(minTemp, this.T[i])
        maxTemp = Math.max(maxTemp, this.T[i])
        sumTemp += this.T[i]
        count++
      }
    }
    
    const avgTemp = sumTemp / count
    
    // Calculate temperature uniformity
    let variance = 0
    for (let i = 0; i < this.T.length; i++) {
      if (this.T[i] > 0) {
        variance += Math.pow(this.T[i] - avgTemp, 2)
      }
    }
    variance /= count
    
    const stdDev = Math.sqrt(variance)
    const uniformityIndex = 1 - (stdDev / avgTemp)
    
    return {
      velocityField: new Float32Array(this.u.length * 3), // Combine u, v, w
      temperatureField: this.T,
      pressureField: this.p,
      convergenceHistory,
      maxVelocity,
      minTemperature: minTemp,
      maxTemperature: maxTemp,
      avgTemperature: avgTemp,
      uniformityIndex: Math.max(0, Math.min(1, uniformityIndex))
    }
  }
}