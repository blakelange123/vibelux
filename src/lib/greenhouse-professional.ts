import { GLAZING_MATERIALS, type GlazingMaterial } from './greenhouse-modeling';

export interface GreenhouseBay {
  width: number;
  length: number;
  quantity: number;
}

export interface GreenhouseGutter {
  type: 'venlo' | 'widespan' | 'polytunnel';
  height: number;
  width: number;
  material: 'aluminum' | 'steel' | 'galvanized';
}

export interface GreenhouseTruss {
  type: 'fink' | 'warren' | 'howe' | 'arch';
  spacing: number;
  height: number;
  material: 'aluminum' | 'steel';
}

export interface GreenhouseVent {
  type: 'ridge' | 'side' | 'gable';
  width: number;
  length: number;
  openingAngle: number;
  motorized: boolean;
  controller: 'climate' | 'manual' | 'weather';
}

export interface HeatingSystem {
  type: 'hot_water' | 'forced_air' | 'radiant_floor' | 'infrared';
  capacity: number; // BTU/hr
  fuel: 'natural_gas' | 'propane' | 'electricity' | 'biomass';
  distribution: 'overhead' | 'perimeter' | 'under_bench' | 'floor';
}

export interface CoolingSystem {
  type: 'pad_fan' | 'fog' | 'hvac' | 'natural';
  capacity: number; // CFM or BTU/hr
  stages: number;
}

export interface ScreenSystem {
  type: 'shade' | 'thermal' | 'blackout' | 'photoperiod';
  material: 'aluminum' | 'polyester' | 'acrylic';
  shadingPercentage: number;
  energySaving: number; // percentage
  position: 'horizontal' | 'vertical';
  zones: number;
}

export interface IrrigationSystem {
  type: 'drip' | 'ebb_flow' | 'nft' | 'overhead' | 'boom';
  zones: number;
  flowRate: number; // GPM
  automation: 'timer' | 'sensor' | 'climate' | 'ai';
}

export interface EnvironmentalControl {
  heating: HeatingSystem;
  cooling: CoolingSystem;
  screens: ScreenSystem[];
  ventilation: {
    naturalVentArea: number; // percentage of floor area
    forcedVentilation: number; // air changes per hour
    horizontalAirflow: boolean;
    hafFans: number;
  };
  co2: {
    enrichment: boolean;
    targetPPM: number;
    source: 'tanks' | 'burner' | 'liquid';
  };
  humidity: {
    humidification: 'fog' | 'pad' | 'none';
    dehumidification: 'ventilation' | 'hvac' | 'none';
    targetRH: { min: number; max: number };
  };
}

export interface GreenhouseStructure {
  type: 'venlo' | 'widespan' | 'gothic_arch' | 'quonset' | 'sawtooth' | 'cabrio';
  bays: GreenhouseBay[];
  gutterHeight: number;
  ridgeHeight: number;
  roofPitch: number; // degrees
  orientation: number; // degrees from north
  foundation: 'concrete' | 'ground_posts' | 'floating';
  framework: {
    material: 'aluminum' | 'steel' | 'galvanized_steel';
    truss: GreenhouseTruss;
    purlinSpacing: number;
    columnSpacing: number;
  };
  covering: {
    roof: {
      material: GlazingMaterial;
      thickness: number; // mm
      layers: number;
      uValue: number; // W/m²K
      treatment: 'ar' | 'diffuse' | 'clear' | 'ir_block';
    };
    sidewall: {
      material: GlazingMaterial;
      thickness: number;
      layers: number;
      height: number;
    };
    endwall: {
      material: GlazingMaterial | 'polycarbonate' | 'insulated_metal';
      insulation: boolean;
    };
  };
  ventilation: {
    ridge: GreenhouseVent[];
    side: GreenhouseVent[];
    gable: GreenhouseVent[];
    totalVentArea: number; // percentage
  };
}

export interface GreenhouseBenchingSystem {
  type: 'fixed' | 'rolling' | 'ebb_flow' | 'trough';
  material: 'aluminum' | 'steel' | 'expanded_metal' | 'plastic';
  width: number;
  length: number;
  height: number;
  aisleWidth: number;
  loadCapacity: number; // kg/m²
  slope: number; // degrees for drainage
}

export interface SupplementalLighting {
  type: 'hps' | 'led' | 'hybrid' | 'plasma';
  fixtures: Array<{
    model: string;
    wattage: number;
    ppf: number;
    quantity: number;
    mounting: 'overhead' | 'intracanopy' | 'vertical';
    height: number;
  }>;
  control: 'photoperiod' | 'dli_target' | 'dynamic' | 'spectrum_control';
  zones: number;
}

export interface ProfessionalGreenhouse {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
    climateZone: string;
  };
  structure: GreenhouseStructure;
  environmental: EnvironmentalControl;
  benching: GreenhouseBenchingSystem;
  irrigation: IrrigationSystem;
  supplementalLighting?: SupplementalLighting;
  automation: {
    climateComputer: string;
    sensors: string[];
    integration: 'standalone' | 'cloud' | 'enterprise';
  };
  certifications: string[]; // e.g., 'GlobalGAP', 'Organic', 'MPS'
}

export class GreenhouseDesigner {
  static calculateNaturalLight(
    greenhouse: ProfessionalGreenhouse,
    date: Date,
    hour: number
  ): {
    transmitted: number;
    uniformity: number;
    shadedArea: number;
  } {
    // Complex calculation including:
    // - Sun position
    // - Structural shading
    // - Glazing transmission
    // - Screen positions
    const sunAngle = this.calculateSunAngle(
      greenhouse.location.latitude,
      greenhouse.location.longitude,
      date,
      hour
    );

    const structuralShading = this.calculateStructuralShading(
      greenhouse.structure,
      sunAngle
    );

    const glazingTransmission = this.calculateGlazingTransmission(
      greenhouse.structure.covering.roof,
      sunAngle.elevation
    );

    const screenReduction = greenhouse.environmental.screens.reduce(
      (acc, screen) => acc * (1 - screen.shadingPercentage / 100),
      1
    );

    const transmitted = 
      1000 * // Assume 1000 W/m² peak
      glazingTransmission *
      (1 - structuralShading) *
      screenReduction;

    return {
      transmitted,
      uniformity: 0.8, // Simplified
      shadedArea: structuralShading * 100
    };
  }

  static calculateHeatingRequirement(
    greenhouse: ProfessionalGreenhouse,
    outsideTemp: number,
    insideTarget: number,
    windSpeed: number
  ): number {
    // Calculate heat loss through covering
    const area = this.calculateSurfaceArea(greenhouse.structure);
    const uValue = greenhouse.structure.covering.roof.uValue;
    const deltaT = insideTarget - outsideTemp;
    
    // Basic heat loss calculation
    const heatLoss = area * uValue * deltaT;
    
    // Add infiltration losses
    const infiltration = area * 0.5 * deltaT; // Simplified
    
    // Add wind factor
    const windFactor = 1 + (windSpeed / 10) * 0.2;
    
    return (heatLoss + infiltration) * windFactor;
  }

  static calculateVentilationRate(
    greenhouse: ProfessionalGreenhouse,
    insideTemp: number,
    outsideTemp: number,
    solarRadiation: number
  ): number {
    // Natural ventilation calculation
    const ventArea = this.calculateVentilationArea(greenhouse.structure);
    const stackEffect = Math.sqrt(
      Math.abs(insideTemp - outsideTemp) * greenhouse.structure.ridgeHeight
    );
    
    // Simplified natural ventilation rate
    const naturalVent = ventArea * stackEffect * 0.5;
    
    // Add forced ventilation if present
    const forcedVent = greenhouse.environmental.ventilation.forcedVentilation || 0;
    
    return naturalVent + forcedVent;
  }

  static designOptimalLayout(
    dimensions: { width: number; length: number },
    cropType: string,
    climate: string
  ): ProfessionalGreenhouse {
    // Intelligent greenhouse design based on inputs
    const bays = this.calculateOptimalBays(dimensions);
    const structure = this.selectStructureType(climate, cropType);
    const environmental = this.designEnvironmentalSystems(climate, cropType);
    
    return {
      id: `greenhouse-${Date.now()}`,
      name: 'Optimized Design',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        elevation: 10,
        climateZone: climate
      },
      structure,
      environmental,
      benching: this.designBenchingSystem(cropType, dimensions),
      irrigation: this.selectIrrigationSystem(cropType),
      automation: {
        climateComputer: 'Priva Connext',
        sensors: ['temperature', 'humidity', 'co2', 'light', 'ec', 'ph'],
        integration: 'cloud'
      },
      certifications: []
    };
  }

  // Helper methods
  private static calculateSunAngle(
    latitude: number,
    longitude: number,
    date: Date,
    hour: number
  ): { azimuth: number; elevation: number } {
    // Simplified sun position calculation
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
    );
    
    const declination = 23.45 * Math.sin((360 * (284 + dayOfYear)) / 365 * Math.PI / 180);
    const hourAngle = 15 * (hour - 12);
    
    const elevation = Math.asin(
      Math.sin(latitude * Math.PI / 180) * Math.sin(declination * Math.PI / 180) +
      Math.cos(latitude * Math.PI / 180) * Math.cos(declination * Math.PI / 180) * 
      Math.cos(hourAngle * Math.PI / 180)
    ) * 180 / Math.PI;
    
    return { azimuth: 180, elevation: Math.max(0, elevation) };
  }

  private static calculateStructuralShading(
    structure: GreenhouseStructure,
    sunAngle: { elevation: number }
  ): number {
    // Calculate shading from trusses, gutters, etc.
    const trussShading = structure.framework.truss.spacing > 0 ? 
      0.05 / Math.sin(Math.max(sunAngle.elevation * Math.PI / 180, 0.1)) : 0;
    
    return Math.min(0.3, trussShading); // Max 30% structural shading
  }

  private static calculateGlazingTransmission(
    covering: {
      material: GlazingMaterial;
      thickness: number;
      layers: number;
      uValue: number;
      treatment: 'ar' | 'diffuse' | 'clear' | 'ir_block';
    },
    sunElevation: number
  ): number {
    const material = GLAZING_MATERIALS[covering.material];
    const baseTransmission = material?.baseTransmittance || 0.9;
    
    // Angle-dependent transmission
    const angleEffect = Math.cos((90 - sunElevation) * Math.PI / 180);
    
    return baseTransmission * angleEffect;
  }

  private static calculateSurfaceArea(structure: GreenhouseStructure): number {
    const totalWidth = structure.bays.reduce(
      (acc, bay) => acc + bay.width * bay.quantity, 0
    );
    const totalLength = structure.bays[0]?.length || 0;
    
    // Roof area (accounting for pitch)
    const roofArea = totalWidth * totalLength / Math.cos(structure.roofPitch * Math.PI / 180);
    
    // Wall areas
    const sidewallArea = 2 * totalLength * structure.gutterHeight;
    const endwallArea = 2 * totalWidth * (structure.gutterHeight + structure.ridgeHeight) / 2;
    
    return roofArea + sidewallArea + endwallArea;
  }

  private static calculateVentilationArea(structure: GreenhouseStructure): number {
    const totalVentArea = 
      structure.ventilation.ridge.reduce((acc, vent) => acc + vent.width * vent.length, 0) +
      structure.ventilation.side.reduce((acc, vent) => acc + vent.width * vent.length, 0) +
      structure.ventilation.gable.reduce((acc, vent) => acc + vent.width * vent.length, 0);
    
    return totalVentArea;
  }

  private static calculateOptimalBays(dimensions: { width: number; length: number }): GreenhouseBay[] {
    // Standard bay widths for different greenhouse types
    const standardBayWidths = [9.6, 8.0, 6.4, 4.0]; // meters
    
    // Find best fit
    for (const bayWidth of standardBayWidths) {
      if (dimensions.width % bayWidth < 1) {
        return [{
          width: bayWidth,
          length: dimensions.length,
          quantity: Math.floor(dimensions.width / bayWidth)
        }];
      }
    }
    
    // Default single bay
    return [{
      width: dimensions.width,
      length: dimensions.length,
      quantity: 1
    }];
  }

  private static selectStructureType(climate: string, cropType: string): GreenhouseStructure {
    // Intelligent structure selection based on climate and crop
    const structureType = climate === 'tropical' ? 'sawtooth' : 
                         climate === 'arid' ? 'gothic_arch' :
                         cropType === 'vine_crops' ? 'venlo' : 'widespan';
    
    return {
      type: structureType as any,
      bays: [{ width: 9.6, length: 100, quantity: 1 }],
      gutterHeight: cropType === 'vine_crops' ? 6 : 4,
      ridgeHeight: 8,
      roofPitch: 25,
      orientation: 0,
      foundation: 'concrete',
      framework: {
        material: 'galvanized_steel',
        truss: {
          type: 'fink',
          spacing: 4,
          height: 2,
          material: 'steel'
        },
        purlinSpacing: 1.5,
        columnSpacing: 4
      },
      covering: {
        roof: {
          material: 'glass',
          thickness: 4,
          layers: 1,
          uValue: 5.8,
          treatment: 'ar'
        },
        sidewall: {
          material: 'glass',
          thickness: 4,
          layers: 1,
          height: 4
        },
        endwall: {
          material: 'polycarbonate',
          insulation: true
        }
      },
      ventilation: {
        ridge: [{
          type: 'ridge',
          width: 1.5,
          length: 100,
          openingAngle: 62,
          motorized: true,
          controller: 'climate'
        }],
        side: [],
        gable: [],
        totalVentArea: 25
      }
    };
  }

  private static designEnvironmentalSystems(climate: string, cropType: string): EnvironmentalControl {
    return {
      heating: {
        type: 'hot_water',
        capacity: 3000000, // BTU/hr
        fuel: 'natural_gas',
        distribution: 'perimeter'
      },
      cooling: {
        type: climate === 'arid' ? 'pad_fan' : 'natural',
        capacity: 50000, // CFM
        stages: 3
      },
      screens: [{
        type: 'shade',
        material: 'aluminum',
        shadingPercentage: 50,
        energySaving: 25,
        position: 'horizontal',
        zones: 1
      }],
      ventilation: {
        naturalVentArea: 25,
        forcedVentilation: 1,
        horizontalAirflow: true,
        hafFans: 10
      },
      co2: {
        enrichment: true,
        targetPPM: 1000,
        source: 'liquid'
      },
      humidity: {
        humidification: 'fog',
        dehumidification: 'ventilation',
        targetRH: { min: 60, max: 80 }
      }
    };
  }

  private static designBenchingSystem(
    cropType: string,
    dimensions: { width: number; length: number }
  ): GreenhouseBenchingSystem {
    return {
      type: cropType === 'potted_plants' ? 'rolling' : 'fixed',
      material: 'expanded_metal',
      width: 1.8,
      length: dimensions.length,
      height: 0.8,
      aisleWidth: 0.6,
      loadCapacity: 50,
      slope: 0.5
    };
  }

  private static selectIrrigationSystem(cropType: string): IrrigationSystem {
    return {
      type: cropType === 'leafy_greens' ? 'ebb_flow' : 'drip',
      zones: 4,
      flowRate: 100,
      automation: 'climate'
    };
  }
}

// Export standard greenhouse configurations
export const PROFESSIONAL_GREENHOUSE_TYPES = {
  venlo: {
    name: 'Venlo Greenhouse',
    description: 'Dutch-style with small roof sections, excellent for high-tech cultivation',
    bayWidth: 9.6,
    typicalHeight: 6,
    advantages: ['Excellent light transmission', 'Easy maintenance', 'Modular expansion'],
    suitable: ['Tomatoes', 'Cucumbers', 'Peppers', 'Cannabis']
  },
  widespan: {
    name: 'Widespan Greenhouse',
    description: 'Large clear spans, ideal for mechanization',
    bayWidth: 12.8,
    typicalHeight: 5,
    advantages: ['Less structural shading', 'Easy equipment access', 'Cost effective'],
    suitable: ['Ornamentals', 'Bedding plants', 'Hemp']
  },
  gothic_arch: {
    name: 'Gothic Arch Greenhouse',
    description: 'Pointed arch design for snow shedding',
    bayWidth: 9.0,
    typicalHeight: 4.5,
    advantages: ['Superior snow load', 'Good condensation control', 'Strong structure'],
    suitable: ['Northern climates', 'Year-round production']
  },
  sawtooth: {
    name: 'Sawtooth Greenhouse',
    description: 'Natural ventilation design for tropical climates',
    bayWidth: 8.0,
    typicalHeight: 5,
    advantages: ['Excellent natural ventilation', 'No power required', 'Lower temperatures'],
    suitable: ['Tropical crops', 'Orchids', 'Foliage plants']
  },
  cabrio: {
    name: 'Cabrio Greenhouse',
    description: 'Retractable roof for climate control',
    bayWidth: 9.6,
    typicalHeight: 5.5,
    advantages: ['Natural rainfall', 'Hardening capability', 'Energy efficient'],
    suitable: ['Nursery stock', 'Seasonal crops', 'Organic production']
  }
};