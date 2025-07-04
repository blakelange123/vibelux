/**
 * Greenhouse Modeling System
 * Comprehensive modeling of greenhouse structures, materials, and light transmission
 */

// Greenhouse structure types
export type GreenhouseType = 'gable' | 'gothic-arch' | 'sawtooth' | 'venlo' | 'tunnel' | 'lean-to';

// Glazing materials
export type GlazingMaterial = 'glass' | 'polycarbonate' | 'polyethylene' | 'acrylic';

// Shading/screening options
export type ShadingType = 'none' | 'internal' | 'external' | 'retractable' | 'thermal';

// Ventilation types
export type VentilationType = 'roof' | 'side' | 'louvre' | 'continuous' | 'forced';

// Greenhouse structure configuration
export interface GreenhouseStructure {
  id: string;
  type: GreenhouseType;
  dimensions: {
    width: number;      // meters
    length: number;     // meters
    sidewallHeight: number; // meters
    peakHeight: number; // meters
    bayWidth?: number;  // for multi-span structures
    spans?: number;     // number of spans
  };
  orientation: number; // degrees from north (0 = north, 90 = east, etc.)
  glazing: GreenhouseGlazing;
  structure: StructuralElements;
  shading: ShadingSystem;
  ventilation: VentilationSystem;
}

// Glazing system configuration
export interface GreenhouseGlazing {
  roof: {
    material: GlazingMaterial;
    thickness: number; // mm
    transmittance: number; // 0-1
    layers: number; // single, double, triple glazing
    coating?: 'low-e' | 'anti-reflective' | 'diffuse';
  };
  walls: {
    material: GlazingMaterial;
    thickness: number;
    transmittance: number;
    layers: number;
    coating?: 'low-e' | 'anti-reflective' | 'diffuse';
  };
  gables?: {
    material: GlazingMaterial;
    thickness: number;
    transmittance: number;
    layers: number;
    coating?: 'low-e' | 'anti-reflective' | 'diffuse';
  };
}

// Structural elements that affect light transmission
export interface StructuralElements {
  gutters: {
    width: number; // meters
    depth: number; // meters
    spacing: number; // meters (distance between gutters)
  };
  rafters: {
    width: number; // meters
    depth: number; // meters
    spacing: number; // meters
  };
  columns: {
    width: number; // meters
    depth: number; // meters
    spacing: number; // meters
  };
  trusses?: {
    width: number;
    depth: number;
    spacing: number;
  };
}

// Shading system configuration
export interface ShadingSystem {
  type: ShadingType;
  coverage: number; // 0-1 (percentage of greenhouse covered)
  transmittance: number; // 0-1 when deployed
  retractable: boolean;
  automaticControl: boolean;
  deploymentThreshold?: number; // lux threshold for automatic deployment
}

// Ventilation system configuration
export interface VentilationSystem {
  roof: {
    type: VentilationType;
    area: number; // m² of vent opening
    continuousLength?: number; // for continuous vents
  };
  side: {
    type: VentilationType;
    area: number;
    continuousLength?: number;
  };
  naturalVentilation: {
    windDrivenCoefficient: number;
    buoyancyCoefficient: number;
    openingEfficiency: number; // 0-1
  };
}

// Material properties for different glazing materials
export const GLAZING_MATERIALS: Record<GlazingMaterial, {
  baseTransmittance: number;
  thermalProperties: {
    uValue: number; // W/m²K
    gValue: number; // solar heat gain coefficient
  };
  angularTransmittance: (angle: number) => number;
  diffuseTransmittance: number;
  spectralProperties: {
    par: number; // PAR transmittance (400-700nm)
    nearIR: number; // Near-infrared transmittance
    uv: number; // UV transmittance
  };
}> = {
  glass: {
    baseTransmittance: 0.9,
    thermalProperties: { uValue: 5.8, gValue: 0.85 },
    angularTransmittance: (angle) => {
      // Fresnel equations approximation for glass
      const angleRad = (angle * Math.PI) / 180;
      const n = 1.52; // refractive index of glass
      const cosTheta = Math.cos(angleRad);
      const sinTheta = Math.sin(angleRad);
      const cosTheta2 = Math.sqrt(1 - (sinTheta / n) ** 2);
      
      const rs = ((cosTheta - n * cosTheta2) / (cosTheta + n * cosTheta2)) ** 2;
      const rp = ((n * cosTheta - cosTheta2) / (n * cosTheta + cosTheta2)) ** 2;
      
      return 1 - (rs + rp) / 2;
    },
    diffuseTransmittance: 0.85,
    spectralProperties: { par: 0.9, nearIR: 0.8, uv: 0.7 }
  },
  polycarbonate: {
    baseTransmittance: 0.85,
    thermalProperties: { uValue: 3.5, gValue: 0.75 },
    angularTransmittance: (angle) => {
      // Simplified angular dependence for polycarbonate
      const angleRad = (angle * Math.PI) / 180;
      return 0.85 * Math.cos(angleRad) ** 0.5;
    },
    diffuseTransmittance: 0.75,
    spectralProperties: { par: 0.85, nearIR: 0.7, uv: 0.3 }
  },
  polyethylene: {
    baseTransmittance: 0.8,
    thermalProperties: { uValue: 6.5, gValue: 0.8 },
    angularTransmittance: (angle) => {
      // Diffuse material - less angular dependence
      const angleRad = (angle * Math.PI) / 180;
      return 0.8 * Math.cos(angleRad) ** 0.2;
    },
    diffuseTransmittance: 0.9, // Highly diffuse
    spectralProperties: { par: 0.8, nearIR: 0.75, uv: 0.1 }
  },
  acrylic: {
    baseTransmittance: 0.92,
    thermalProperties: { uValue: 5.0, gValue: 0.87 },
    angularTransmittance: (angle) => {
      // Similar to glass but slightly better
      const angleRad = (angle * Math.PI) / 180;
      const n = 1.49; // refractive index of acrylic
      const cosTheta = Math.cos(angleRad);
      const sinTheta = Math.sin(angleRad);
      const cosTheta2 = Math.sqrt(1 - (sinTheta / n) ** 2);
      
      const rs = ((cosTheta - n * cosTheta2) / (cosTheta + n * cosTheta2)) ** 2;
      const rp = ((n * cosTheta - cosTheta2) / (n * cosTheta + cosTheta2)) ** 2;
      
      return 1 - (rs + rp) / 2;
    },
    diffuseTransmittance: 0.88,
    spectralProperties: { par: 0.92, nearIR: 0.85, uv: 0.8 }
  }
};

// Standard greenhouse configurations
export const STANDARD_GREENHOUSES: Record<string, Partial<GreenhouseStructure>> = {
  'gable-glass': {
    type: 'gable',
    glazing: {
      roof: { material: 'glass', thickness: 4, transmittance: 0.9, layers: 1 },
      walls: { material: 'glass', thickness: 4, transmittance: 0.9, layers: 1 }
    },
    structure: {
      gutters: { width: 0.15, depth: 0.2, spacing: 4.0 },
      rafters: { width: 0.05, depth: 0.15, spacing: 0.6 },
      columns: { width: 0.1, depth: 0.1, spacing: 4.0 }
    }
  },
  'venlo-glass': {
    type: 'venlo',
    glazing: {
      roof: { material: 'glass', thickness: 4, transmittance: 0.9, layers: 1 },
      walls: { material: 'glass', thickness: 4, transmittance: 0.9, layers: 1 }
    },
    structure: {
      gutters: { width: 0.12, depth: 0.18, spacing: 3.2 },
      rafters: { width: 0.04, depth: 0.12, spacing: 0.8 },
      columns: { width: 0.08, depth: 0.08, spacing: 3.2 }
    }
  },
  'tunnel-polyethylene': {
    type: 'tunnel',
    glazing: {
      roof: { material: 'polyethylene', thickness: 0.2, transmittance: 0.8, layers: 2 },
      walls: { material: 'polyethylene', thickness: 0.2, transmittance: 0.8, layers: 2 }
    },
    structure: {
      gutters: { width: 0, depth: 0, spacing: 0 }, // No gutters in tunnel houses
      rafters: { width: 0.03, depth: 0.08, spacing: 1.0 },
      columns: { width: 0.05, depth: 0.05, spacing: 2.0 }
    }
  }
};

// Light transmission calculator
export class GreenhouseLightTransmission {
  private greenhouse: GreenhouseStructure;

  constructor(greenhouse: GreenhouseStructure) {
    this.greenhouse = greenhouse;
  }

  /**
   * Calculate transmittance for a given sun angle and position
   */
  calculateTransmittance(
    sunElevation: number, // degrees above horizon
    sunAzimuth: number,   // degrees from north
    position: { x: number; y: number; z: number } // position inside greenhouse
  ): {
    direct: number;
    diffuse: number;
    total: number;
    shadowFactor: number;
  } {
    // Determine which surface the light is hitting
    const surface = this.determineLightPath(sunElevation, sunAzimuth, position);
    
    // Get base material properties
    const material = GLAZING_MATERIALS[surface.material];
    
    // Calculate angle of incidence
    const incidenceAngle = this.calculateIncidenceAngle(sunElevation, sunAzimuth, surface);
    
    // Angular transmittance
    const angularTransmittance = material.angularTransmittance(incidenceAngle);
    
    // Account for multiple layers if present
    const layerTransmittance = Math.pow(angularTransmittance, surface.layers);
    
    // Calculate structural shading
    const shadowFactor = this.calculateStructuralShading(sunElevation, sunAzimuth, position);
    
    // Account for shading systems
    const shadingFactor = this.calculateShadingFactor();
    
    // Direct transmittance
    const directTransmittance = layerTransmittance * shadowFactor * shadingFactor;
    
    // Diffuse transmittance (less affected by angle)
    const diffuseTransmittance = material.diffuseTransmittance * shadingFactor;
    
    return {
      direct: directTransmittance,
      diffuse: diffuseTransmittance,
      total: (directTransmittance + diffuseTransmittance) / 2,
      shadowFactor
    };
  }

  /**
   * Calculate Daily Light Integral (DLI) at a given position
   */
  calculateDLI(
    position: { x: number; y: number; z: number },
    date: Date,
    latitude: number,
    longitude: number,
    outdoorDLI: number // mol/m²/day
  ): number {
    // Simplified DLI calculation - in reality would need hourly calculations
    const averageTransmittance = this.calculateAverageTransmittance(position, date, latitude);
    return outdoorDLI * averageTransmittance;
  }

  /**
   * Determine which greenhouse surface light is hitting
   */
  private determineLightPath(
    sunElevation: number,
    sunAzimuth: number,
    position: { x: number; y: number; z: number }
  ): { material: GlazingMaterial; layers: number; angle: number } {
    // Simplified - assumes roof for high angles, walls for low angles
    if (sunElevation > 30) {
      return {
        material: this.greenhouse.glazing.roof.material,
        layers: this.greenhouse.glazing.roof.layers,
        angle: 90 - sunElevation // roof slope angle from horizontal
      };
    } else {
      return {
        material: this.greenhouse.glazing.walls.material,
        layers: this.greenhouse.glazing.walls.layers,
        angle: sunElevation // wall angle
      };
    }
  }

  /**
   * Calculate angle of incidence on greenhouse surface
   */
  private calculateIncidenceAngle(
    sunElevation: number,
    sunAzimuth: number,
    surface: { angle: number }
  ): number {
    // Simplified calculation - would need full 3D geometry for precision
    return Math.abs(sunElevation - surface.angle);
  }

  /**
   * Calculate shading from structural elements
   */
  private calculateStructuralShading(
    sunElevation: number,
    sunAzimuth: number,
    position: { x: number; y: number; z: number }
  ): number {
    let shadowFactor = 1.0;
    
    // Gutter shading
    const gutterSpacing = this.greenhouse.structure.gutters.spacing;
    const gutterWidth = this.greenhouse.structure.gutters.width;
    const gutterShadowRatio = gutterWidth / gutterSpacing;
    
    // Simplified shadow calculation
    if (sunElevation > 0) {
      const shadowLength = this.greenhouse.structure.gutters.depth / Math.tan(sunElevation * Math.PI / 180);
      shadowFactor *= Math.max(0, 1 - (shadowLength * gutterShadowRatio) / gutterSpacing);
    }
    
    // Rafter shading
    const rafterSpacing = this.greenhouse.structure.rafters.spacing;
    const rafterWidth = this.greenhouse.structure.rafters.width;
    const rafterShadowRatio = rafterWidth / rafterSpacing;
    
    shadowFactor *= Math.max(0, 1 - rafterShadowRatio);
    
    return Math.max(0.1, shadowFactor); // Minimum 10% transmission
  }

  /**
   * Calculate shading system effect
   */
  private calculateShadingFactor(): number {
    const shading = this.greenhouse.shading;
    
    if (shading.type === 'none') {
      return 1.0;
    }
    
    // For deployed shading
    return shading.transmittance;
  }

  /**
   * Calculate average daily transmittance
   */
  private calculateAverageTransmittance(
    position: { x: number; y: number; z: number },
    date: Date,
    latitude: number
  ): number {
    // Simplified - would need integration over daylight hours
    // This is a rough approximation
    const summerTransmittance = 0.7; // High sun angles
    const winterTransmittance = 0.5; // Low sun angles
    
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const seasonalFactor = 0.5 + 0.5 * Math.cos(2 * Math.PI * (dayOfYear - 172) / 365); // Peak at summer solstice
    
    return winterTransmittance + (summerTransmittance - winterTransmittance) * seasonalFactor;
  }
}

// Greenhouse geometry calculator
export class GreenhouseGeometry {
  static calculateRoofProfile(
    type: GreenhouseType,
    width: number,
    sidewallHeight: number,
    peakHeight: number
  ): { x: number; y: number }[] {
    switch (type) {
      case 'gable':
        return [
          { x: 0, y: sidewallHeight },
          { x: width / 2, y: peakHeight },
          { x: width, y: sidewallHeight }
        ];
      
      case 'gothic-arch':
        // Generate gothic arch curve
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          const x = t * width;
          const centerHeight = peakHeight - sidewallHeight;
          const y = sidewallHeight + centerHeight * Math.sin(Math.PI * t);
          points.push({ x, y });
        }
        return points;
      
      case 'tunnel':
        // Semi-circular tunnel
        const tunnelPoints: { x: number; y: number }[] = [];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          const angle = Math.PI * t;
          const x = t * width;
          const radius = width / 2;
          const y = sidewallHeight + radius * Math.sin(angle);
          tunnelPoints.push({ x, y });
        }
        return tunnelPoints;
      
      case 'venlo':
        // Multi-span sawtooth profile
        return [
          { x: 0, y: sidewallHeight },
          { x: width * 0.25, y: peakHeight },
          { x: width * 0.5, y: sidewallHeight + 0.5 },
          { x: width * 0.75, y: peakHeight },
          { x: width, y: sidewallHeight }
        ];
      
      case 'sawtooth':
        return [
          { x: 0, y: sidewallHeight },
          { x: width * 0.3, y: peakHeight },
          { x: width * 0.7, y: sidewallHeight },
          { x: width, y: peakHeight }
        ];
      
      case 'lean-to':
        return [
          { x: 0, y: sidewallHeight },
          { x: width, y: peakHeight }
        ];
      
      default:
        return [
          { x: 0, y: sidewallHeight },
          { x: width / 2, y: peakHeight },
          { x: width, y: sidewallHeight }
        ];
    }
  }

  static calculateFloorArea(greenhouse: GreenhouseStructure): number {
    return greenhouse.dimensions.width * greenhouse.dimensions.length;
  }

  static calculateGlazingArea(greenhouse: GreenhouseStructure): {
    roof: number;
    walls: number;
    total: number;
  } {
    const { width, length, sidewallHeight, peakHeight } = greenhouse.dimensions;
    
    // Roof area calculation (simplified)
    let roofArea = 0;
    switch (greenhouse.type) {
      case 'gable':
      case 'gothic-arch':
        const roofSlope = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(peakHeight - sidewallHeight, 2));
        roofArea = 2 * roofSlope * length;
        break;
      case 'tunnel':
        const radius = width / 2;
        roofArea = Math.PI * radius * length;
        break;
      default:
        roofArea = width * length * 1.2; // Approximation
    }
    
    // Wall area
    const wallArea = 2 * (width + length) * sidewallHeight;
    
    return {
      roof: roofArea,
      walls: wallArea,
      total: roofArea + wallArea
    };
  }
}

// Natural ventilation calculator
export class GreenhouseVentilation {
  static calculateNaturalVentilation(
    greenhouse: GreenhouseStructure,
    outdoorConditions: {
      temperature: number; // °C
      windSpeed: number;   // m/s
      windDirection: number; // degrees
    },
    indoorTemperature: number // °C
  ): {
    windDrivenFlow: number; // m³/s
    buoyancyFlow: number;   // m³/s
    totalFlow: number;      // m³/s
    airChangesPerHour: number;
  } {
    const { roof, side, naturalVentilation } = greenhouse.ventilation;
    const floorArea = GreenhouseGeometry.calculateFloorArea(greenhouse);
    const volume = floorArea * greenhouse.dimensions.peakHeight * 0.7; // Approximate volume
    
    // Wind-driven ventilation
    const windDrivenFlow = naturalVentilation.windDrivenCoefficient * 
                          roof.area * 
                          outdoorConditions.windSpeed * 
                          naturalVentilation.openingEfficiency;
    
    // Buoyancy-driven ventilation
    const temperatureDiff = Math.abs(indoorTemperature - outdoorConditions.temperature);
    const stackHeight = greenhouse.dimensions.peakHeight - greenhouse.dimensions.sidewallHeight;
    const buoyancyFlow = naturalVentilation.buoyancyCoefficient * 
                        side.area * 
                        Math.sqrt(2 * 9.81 * stackHeight * temperatureDiff / (273 + outdoorConditions.temperature));
    
    // Combined flow (simplified)
    const totalFlow = Math.sqrt(windDrivenFlow ** 2 + buoyancyFlow ** 2);
    const airChangesPerHour = (totalFlow * 3600) / volume;
    
    return {
      windDrivenFlow,
      buoyancyFlow,
      totalFlow,
      airChangesPerHour
    };
  }
}

