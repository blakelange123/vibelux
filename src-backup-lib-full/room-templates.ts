export interface RoomTemplate {
  id: string;
  name: string;
  category: 'greenhouse' | 'vertical_farm' | 'indoor_grow' | 'warehouse' | 'retail' | 'office' | 'custom';
  description: string;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  layout: {
    aisleWidth: number;
    benchSpacing: number;
    benchHeight: number;
    fixtureHeight: number;
  };
  lighting: {
    targetPPFD: number;
    targetDLI: number;
    photoperiod: number;
    uniformityTarget: number;
  };
  fixtures: {
    type: string;
    wattage: number;
    ppf: number;
    spacing: { x: number; y: number };
    mountingHeight: number;
  };
  benches?: {
    rows: number;
    columns: number;
    width: number;
    length: number;
  };
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'veg-room-small',
    name: 'Small Vegetative Room',
    category: 'indoor_grow',
    description: 'Optimized for vegetative growth in small spaces',
    dimensions: { width: 3, length: 3, height: 2.5 },
    layout: {
      aisleWidth: 0.6,
      benchSpacing: 1.2,
      benchHeight: 0.9,
      fixtureHeight: 2.2
    },
    lighting: {
      targetPPFD: 400,
      targetDLI: 17,
      photoperiod: 18,
      uniformityTarget: 0.8
    },
    fixtures: {
      type: 'LED Bar 320W',
      wattage: 320,
      ppf: 864,
      spacing: { x: 1.5, y: 1.5 },
      mountingHeight: 2.2
    },
    benches: {
      rows: 2,
      columns: 1,
      width: 1.2,
      length: 2.4
    }
  },
  {
    id: 'flower-room-medium',
    name: 'Medium Flowering Room',
    category: 'indoor_grow',
    description: 'High-intensity flowering room setup',
    dimensions: { width: 6, length: 8, height: 3 },
    layout: {
      aisleWidth: 0.9,
      benchSpacing: 1.5,
      benchHeight: 0.9,
      fixtureHeight: 2.7
    },
    lighting: {
      targetPPFD: 800,
      targetDLI: 35,
      photoperiod: 12,
      uniformityTarget: 0.85
    },
    fixtures: {
      type: 'LED 650W',
      wattage: 650,
      ppf: 1755,
      spacing: { x: 1.5, y: 2 },
      mountingHeight: 2.7
    },
    benches: {
      rows: 3,
      columns: 2,
      width: 1.2,
      length: 2.4
    }
  },
  {
    id: 'vertical-farm-tier',
    name: 'Vertical Farm Stack',
    category: 'vertical_farm',
    description: 'Multi-tier vertical farming setup',
    dimensions: { width: 12, length: 24, height: 6 },
    layout: {
      aisleWidth: 1.2,
      benchSpacing: 0,
      benchHeight: 0.5,
      fixtureHeight: 0.3
    },
    lighting: {
      targetPPFD: 250,
      targetDLI: 14,
      photoperiod: 16,
      uniformityTarget: 0.9
    },
    fixtures: {
      type: 'LED Linear 150W',
      wattage: 150,
      ppf: 405,
      spacing: { x: 0.6, y: 1.2 },
      mountingHeight: 0.3
    },
    benches: {
      rows: 4,
      columns: 8,
      width: 1.2,
      length: 2.4
    }
  },
  {
    id: 'greenhouse-supplement',
    name: 'Greenhouse Supplemental',
    category: 'greenhouse',
    description: 'Supplemental lighting for greenhouse',
    dimensions: { width: 30, length: 100, height: 5 },
    layout: {
      aisleWidth: 1.5,
      benchSpacing: 3,
      benchHeight: 0.9,
      fixtureHeight: 4.5
    },
    lighting: {
      targetPPFD: 200,
      targetDLI: 12,
      photoperiod: 14,
      uniformityTarget: 0.7
    },
    fixtures: {
      type: 'HPS 1000W DE',
      wattage: 1000,
      ppf: 2100,
      spacing: { x: 3, y: 3 },
      mountingHeight: 4.5
    },
    benches: {
      rows: 10,
      columns: 20,
      width: 1.5,
      length: 3
    }
  },
  {
    id: 'clone-propagation',
    name: 'Clone/Propagation Room',
    category: 'indoor_grow',
    description: 'Low-light environment for clones and seedlings',
    dimensions: { width: 2.5, length: 3, height: 2.5 },
    layout: {
      aisleWidth: 0.6,
      benchSpacing: 0,
      benchHeight: 0.9,
      fixtureHeight: 1.5
    },
    lighting: {
      targetPPFD: 150,
      targetDLI: 9,
      photoperiod: 18,
      uniformityTarget: 0.9
    },
    fixtures: {
      type: 'T5 Fluorescent 4ft',
      wattage: 54,
      ppf: 90,
      spacing: { x: 0.3, y: 0.6 },
      mountingHeight: 1.5
    },
    benches: {
      rows: 1,
      columns: 2,
      width: 0.6,
      length: 1.2
    }
  },
  {
    id: 'warehouse-cultivation',
    name: 'Warehouse Scale Cultivation',
    category: 'warehouse',
    description: 'Large-scale commercial cultivation',
    dimensions: { width: 50, length: 100, height: 8 },
    layout: {
      aisleWidth: 2,
      benchSpacing: 2,
      benchHeight: 0.9,
      fixtureHeight: 3
    },
    lighting: {
      targetPPFD: 600,
      targetDLI: 26,
      photoperiod: 12,
      uniformityTarget: 0.8
    },
    fixtures: {
      type: 'LED 800W',
      wattage: 800,
      ppf: 2160,
      spacing: { x: 2, y: 2 },
      mountingHeight: 3
    },
    benches: {
      rows: 20,
      columns: 20,
      width: 1.5,
      length: 3
    }
  }
];

export class RoomTemplateManager {
  static applyTemplate(template: RoomTemplate): any {
    const objects: any[] = [];
    
    // Create benches based on template
    if (template.benches) {
      const { rows, columns, width, length } = template.benches;
      const { aisleWidth, benchHeight } = template.layout;
      
      const totalBenchWidth = columns * width + (columns - 1) * aisleWidth;
      const totalBenchLength = rows * length + (rows - 1) * aisleWidth;
      
      const startX = (template.dimensions.width - totalBenchWidth) / 2;
      const startY = (template.dimensions.length - totalBenchLength) / 2;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          objects.push({
            id: `bench-${row}-${col}`,
            type: 'bench',
            x: startX + col * (width + aisleWidth) + width / 2,
            y: startY + row * (length + aisleWidth) + length / 2,
            z: 0,
            rotation: 0,
            width,
            length,
            height: benchHeight,
            enabled: true,
            tiers: template.category === 'vertical_farm' ? 5 : 1
          });
        }
      }
    }
    
    // Create fixtures based on spacing
    const { spacing, mountingHeight } = template.fixtures;
    const fixtureRows = Math.floor(template.dimensions.length / spacing.y);
    const fixtureCols = Math.floor(template.dimensions.width / spacing.x);
    
    const fixtureStartX = (template.dimensions.width - (fixtureCols - 1) * spacing.x) / 2;
    const fixtureStartY = (template.dimensions.length - (fixtureRows - 1) * spacing.y) / 2;
    
    for (let row = 0; row < fixtureRows; row++) {
      for (let col = 0; col < fixtureCols; col++) {
        objects.push({
          id: `fixture-${row}-${col}`,
          type: 'fixture',
          x: fixtureStartX + col * spacing.x,
          y: fixtureStartY + row * spacing.y,
          z: mountingHeight,
          rotation: 0,
          width: 0.6,
          length: 1.2,
          height: 0.1,
          enabled: true,
          model: {
            name: template.fixtures.type,
            wattage: template.fixtures.wattage,
            ppf: template.fixtures.ppf,
            beamAngle: 120,
            efficacy: template.fixtures.ppf / template.fixtures.wattage
          }
        });
      }
    }
    
    return {
      objects,
      roomDimensions: template.dimensions,
      targetMetrics: template.lighting
    };
  }
  
  static validateTemplate(template: RoomTemplate): string[] {
    const errors: string[] = [];
    
    // Validate dimensions
    if (template.dimensions.width <= 0 || template.dimensions.length <= 0 || template.dimensions.height <= 0) {
      errors.push('Room dimensions must be positive');
    }
    
    // Validate lighting targets
    if (template.lighting.targetPPFD < 0 || template.lighting.targetPPFD > 2000) {
      errors.push('Target PPFD must be between 0 and 2000');
    }
    
    if (template.lighting.photoperiod < 0 || template.lighting.photoperiod > 24) {
      errors.push('Photoperiod must be between 0 and 24 hours');
    }
    
    // Validate fixture spacing
    if (template.fixtures.spacing.x <= 0 || template.fixtures.spacing.y <= 0) {
      errors.push('Fixture spacing must be positive');
    }
    
    return errors;
  }
  
  static calculateTemplateMetrics(template: RoomTemplate): {
    totalFixtures: number;
    totalPower: number;
    totalPPF: number;
    avgPPFD: number;
    powerDensity: number;
  } {
    const fixtureRows = Math.floor(template.dimensions.length / template.fixtures.spacing.y);
    const fixtureCols = Math.floor(template.dimensions.width / template.fixtures.spacing.x);
    const totalFixtures = fixtureRows * fixtureCols;
    
    const totalPower = totalFixtures * template.fixtures.wattage;
    const totalPPF = totalFixtures * template.fixtures.ppf;
    const roomArea = template.dimensions.width * template.dimensions.length;
    const avgPPFD = totalPPF / roomArea;
    const powerDensity = totalPower / roomArea;
    
    return {
      totalFixtures,
      totalPower,
      totalPPF,
      avgPPFD,
      powerDensity
    };
  }
}