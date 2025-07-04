// Benching and racking systems database for controlled environment agriculture
// Includes rolling benches, vertical racks, mobile carriages, and grow tables

export interface BenchingSystem {
  id: string;
  manufacturer: string;
  model: string;
  category: 'RollingBench' | 'StaticBench' | 'VerticalRack' | 'MobileCarriage' | 'GrowTable' | 'PropagationBench';
  type: string;
  dimensions: {
    width: number; // inches
    length: number; // inches
    height?: number; // inches (for tables)
    workHeight?: number; // inches (working surface height)
    tiers?: number; // for vertical systems
    tierSpacing?: number; // inches between tiers
  };
  capacity: {
    weightPerSqFt: number; // lbs
    totalWeight: number; // lbs
    trays?: { // tray capacity
      size: string; // "10x20", "10x10", etc.
      count: number;
    };
    pots?: { // pot capacity
      size: string; // "1gal", "3gal", etc.
      count: number;
    };
  };
  features: string[];
  materials: {
    frame: string;
    surface: string;
    coating?: string;
  };
  mobility?: {
    type: 'Fixed' | 'Rolling' | 'Mobile' | 'Motorized';
    clearance?: number; // inches for rolling
    aisleWidth?: number; // minimum aisle width needed
  };
  accessories?: string[];
  price?: number;
  pricePerSqFt?: number;
}

export const benchingCategories = {
  RollingBench: {
    name: 'Rolling Benches',
    description: 'Mobile benches that maximize space efficiency',
    icon: 'bench',
    pros: ['Space saving', 'Easy access', 'Flexible layout'],
    cons: ['Higher cost', 'Installation required', 'Weight limits']
  },
  StaticBench: {
    name: 'Static Benches',
    description: 'Fixed position growing benches',
    icon: 'table',
    pros: ['Lower cost', 'Simple setup', 'Sturdy'],
    cons: ['Fixed aisles', 'Less space efficient']
  },
  VerticalRack: {
    name: 'Vertical Racks',
    description: 'Multi-tier growing systems',
    icon: 'layers',
    pros: ['Maximum density', 'Vertical space use', 'Modular'],
    cons: ['Lighting complexity', 'Access challenges', 'Load considerations']
  },
  MobileCarriage: {
    name: 'Mobile Carriages',
    description: 'High-density mobile racking systems',
    icon: 'train',
    pros: ['Maximum density', 'One aisle system', 'Heavy duty'],
    cons: ['High cost', 'Complex installation', 'Maintenance']
  },
  GrowTable: {
    name: 'Grow Tables',
    description: 'Ebb and flow compatible tables',
    icon: 'water',
    pros: ['Irrigation ready', 'Drainage built-in', 'Easy cleaning'],
    cons: ['Specific to hydro', 'Higher cost', 'Fixed height']
  },
  PropagationBench: {
    name: 'Propagation Benches',
    description: 'Specialized for cloning and seedlings',
    icon: 'seedling',
    pros: ['Heat cable ready', 'Misting compatible', 'Optimal height'],
    cons: ['Specialized use', 'Limited flexibility']
  }
};

export const benchingDatabase: Record<string, BenchingSystem> = {
  // Rolling Benches
  'growtainer-rb-4x8': {
    id: 'growtainer-rb-4x8',
    manufacturer: 'GrowTainer',
    model: 'RB-4x8',
    category: 'RollingBench',
    type: 'Standard Rolling Bench',
    dimensions: {
      width: 48,
      length: 96,
      workHeight: 30
    },
    capacity: {
      weightPerSqFt: 100,
      totalWeight: 3200,
      trays: {
        size: '10x20',
        count: 16
      }
    },
    features: [
      'Aluminum frame',
      'Expanded metal top',
      'Side-to-side rolling',
      'Adjustable height',
      'Modular design',
      'ADA compliant option'
    ],
    materials: {
      frame: 'Aluminum',
      surface: 'Expanded metal',
      coating: 'Powder coated'
    },
    mobility: {
      type: 'Rolling',
      clearance: 18,
      aisleWidth: 24
    },
    accessories: ['Trellis supports', 'End panels', 'Irrigation manifolds'],
    price: 850,
    pricePerSqFt: 26.5
  },
  'botanicare-rb-4x6': {
    id: 'botanicare-rb-4x6',
    manufacturer: 'Botanicare',
    model: 'Rolling Bench 4x6',
    category: 'RollingBench',
    type: 'Premium Rolling Bench',
    dimensions: {
      width: 48,
      length: 72,
      workHeight: 32
    },
    capacity: {
      weightPerSqFt: 125,
      totalWeight: 3000,
      trays: {
        size: '10x20',
        count: 12
      },
      pots: {
        size: '1gal',
        count: 72
      }
    },
    features: [
      'Heavy-duty aluminum',
      'Wire mesh top',
      'Smooth rolling system',
      'Leveling feet',
      'Drain channels',
      'UV resistant'
    ],
    materials: {
      frame: 'Aluminum',
      surface: 'Galvanized wire mesh'
    },
    mobility: {
      type: 'Rolling',
      clearance: 20,
      aisleWidth: 24
    },
    price: 750
  },
  'montel-mobilex': {
    id: 'montel-mobilex',
    manufacturer: 'Montel',
    model: 'MOBILEX 3D',
    category: 'MobileCarriage',
    type: 'High-Density Mobile System',
    dimensions: {
      width: 60,
      length: 240,
      workHeight: 30,
      tiers: 1
    },
    capacity: {
      weightPerSqFt: 150,
      totalWeight: 15000
    },
    features: [
      'Electric drive option',
      'Safety sensors',
      'Smooth operation',
      'Modular rails',
      'Zero maintenance bearings',
      'Seismic rated'
    ],
    materials: {
      frame: 'Steel',
      surface: 'Custom options',
      coating: 'Powder coated'
    },
    mobility: {
      type: 'Mobile',
      aisleWidth: 36
    },
    accessories: ['Safety locks', 'Remote control', 'LED indicators'],
    price: 12000
  },

  // Static Benches
  'growers-supply-sb-4x8': {
    id: 'growers-supply-sb-4x8',
    manufacturer: 'Growers Supply',
    model: 'Static Bench 4x8',
    category: 'StaticBench',
    type: 'Standard Fixed Bench',
    dimensions: {
      width: 48,
      length: 96,
      workHeight: 30
    },
    capacity: {
      weightPerSqFt: 75,
      totalWeight: 2400,
      trays: {
        size: '10x20',
        count: 16
      }
    },
    features: [
      'Galvanized steel frame',
      'Expanded metal top',
      'Cross bracing',
      'Adjustable legs',
      'Bolt-together design'
    ],
    materials: {
      frame: 'Galvanized steel',
      surface: 'Expanded metal'
    },
    mobility: {
      type: 'Fixed'
    },
    price: 450,
    pricePerSqFt: 14
  },
  'greenhouse-megastore-wb': {
    id: 'greenhouse-megastore-wb',
    manufacturer: 'Greenhouse Megastore',
    model: 'Wire Bench 4x8',
    category: 'StaticBench',
    type: 'Wire Top Bench',
    dimensions: {
      width: 48,
      length: 96,
      workHeight: 32
    },
    capacity: {
      weightPerSqFt: 50,
      totalWeight: 1600,
      trays: {
        size: '10x20',
        count: 16
      }
    },
    features: [
      'Welded wire top',
      'Aluminum frame',
      'Corrosion resistant',
      'Easy assembly',
      'Lightweight'
    ],
    materials: {
      frame: 'Aluminum',
      surface: 'Welded wire'
    },
    mobility: {
      type: 'Fixed'
    },
    price: 325,
    pricePerSqFt: 10
  },

  // Vertical Racks
  'pipp-mobile-vertical': {
    id: 'pipp-mobile-vertical',
    manufacturer: 'Pipp Horticulture',
    model: 'Mobile Vertical Grow Rack',
    category: 'VerticalRack',
    type: 'Mobile Multi-Tier System',
    dimensions: {
      width: 48,
      length: 96,
      height: 84,
      tiers: 3,
      tierSpacing: 24
    },
    capacity: {
      weightPerSqFt: 100,
      totalWeight: 9600,
      trays: {
        size: '10x20',
        count: 48
      }
    },
    features: [
      'Mobile carriages',
      'Integrated lighting',
      'Airflow design',
      'Quick adjust tiers',
      'Seismic certified',
      'Modular expansion'
    ],
    materials: {
      frame: 'Steel',
      surface: 'Wire mesh trays',
      coating: 'Powder coated'
    },
    mobility: {
      type: 'Mobile',
      aisleWidth: 42
    },
    accessories: ['LED light bars', 'Irrigation lines', 'Trellis nets'],
    price: 8500
  },
  'vertical-grow-vgs': {
    id: 'vertical-grow-vgs',
    manufacturer: 'Vertical Grow Systems',
    model: 'VGS-5T',
    category: 'VerticalRack',
    type: 'Static Vertical System',
    dimensions: {
      width: 60,
      length: 120,
      height: 120,
      tiers: 5,
      tierSpacing: 18
    },
    capacity: {
      weightPerSqFt: 75,
      totalWeight: 18750,
      trays: {
        size: '10x20',
        count: 100
      }
    },
    features: [
      'Heavy-duty construction',
      'Anti-microbial coating',
      'Integrated drainage',
      'Cable management',
      'Forklift accessible',
      'Custom configurations'
    ],
    materials: {
      frame: 'Galvanized steel',
      surface: 'Food-grade ABS trays',
      coating: 'Anti-microbial'
    },
    mobility: {
      type: 'Fixed'
    },
    price: 12000
  },
  'spacesaver-activrac': {
    id: 'spacesaver-activrac',
    manufacturer: 'Spacesaver',
    model: 'ActivRAC 3-Tier',
    category: 'VerticalRack',
    type: 'Mobile Vertical Storage',
    dimensions: {
      width: 48,
      length: 240,
      height: 96,
      tiers: 3,
      tierSpacing: 28
    },
    capacity: {
      weightPerSqFt: 125,
      totalWeight: 36000
    },
    features: [
      'Powered mobile system',
      'Touch screen controls',
      'Zone lighting control',
      'Environmental monitoring',
      'Remote access',
      'Safety features'
    ],
    materials: {
      frame: 'Heavy-duty steel',
      surface: 'Custom options'
    },
    mobility: {
      type: 'Motorized',
      aisleWidth: 36
    },
    price: 45000
  },

  // Grow Tables
  'botanicare-4x8-table': {
    id: 'botanicare-4x8-table',
    manufacturer: 'Botanicare',
    model: '4x8 Grow Table',
    category: 'GrowTable',
    type: 'Ebb & Flow Table',
    dimensions: {
      width: 48,
      length: 96,
      height: 7,
      workHeight: 30
    },
    capacity: {
      weightPerSqFt: 50,
      totalWeight: 1600,
      trays: {
        size: '10x20',
        count: 16
      }
    },
    features: [
      'ABS plastic construction',
      'Built-in drainage',
      'Raised channels',
      'UV resistant',
      'Chemical resistant',
      'Smooth surface'
    ],
    materials: {
      frame: 'Sold separately',
      surface: 'ABS plastic'
    },
    mobility: {
      type: 'Fixed'
    },
    accessories: ['Drain fittings', 'Overflow kit', 'Support stands'],
    price: 380
  },
  'active-aqua-4x4': {
    id: 'active-aqua-4x4',
    manufacturer: 'Active Aqua',
    model: 'Premium 4x4 Table',
    category: 'GrowTable',
    type: 'Flood Table',
    dimensions: {
      width: 48,
      length: 48,
      height: 7,
      workHeight: 32
    },
    capacity: {
      weightPerSqFt: 45,
      totalWeight: 720,
      pots: {
        size: '3gal',
        count: 16
      }
    },
    features: [
      'Premium white ABS',
      'Rounded corners',
      'Center drain',
      'Fill fitting included',
      'Made in USA'
    ],
    materials: {
      surface: 'Premium ABS'
    },
    mobility: {
      type: 'Fixed'
    },
    price: 220
  },

  // Propagation Benches
  'stuppy-prop-bench': {
    id: 'stuppy-prop-bench',
    manufacturer: 'Stuppy',
    model: 'Propagation Bench System',
    category: 'PropagationBench',
    type: 'Heated Propagation Bench',
    dimensions: {
      width: 60,
      length: 120,
      workHeight: 36
    },
    capacity: {
      weightPerSqFt: 60,
      totalWeight: 3000,
      trays: {
        size: '10x20',
        count: 30
      }
    },
    features: [
      'Integrated heat cables',
      'Mist system ready',
      'Perimeter lip',
      'Thermostat control',
      'Bottom heat zones',
      'Drainage system'
    ],
    materials: {
      frame: 'Galvanized steel',
      surface: 'Expanded metal with liner'
    },
    mobility: {
      type: 'Fixed'
    },
    accessories: ['Heat cables', 'Thermostats', 'Mist nozzles', 'Timers'],
    price: 2200
  },
  'growers-solution-mist': {
    id: 'growers-solution-mist',
    manufacturer: 'Growers Solution',
    model: 'MistBench Pro',
    category: 'PropagationBench',
    type: 'Misting Propagation System',
    dimensions: {
      width: 48,
      length: 96,
      workHeight: 34
    },
    capacity: {
      weightPerSqFt: 50,
      totalWeight: 1600,
      trays: {
        size: '10x10',
        count: 32
      }
    },
    features: [
      'Overhead mist rail',
      'Bottom heat compatible',
      'Sloped drainage',
      'Timer included',
      'Fine mist nozzles',
      'Humidity dome option'
    ],
    materials: {
      frame: 'Aluminum',
      surface: 'Polycarbonate liner'
    },
    mobility: {
      type: 'Fixed'
    },
    price: 1850
  }
};

// Helper functions for benching calculations
export function calculateBenchingEfficiency(
  roomWidth: number,
  roomLength: number,
  benchType: 'static' | 'rolling' | 'mobile' = 'rolling',
  aisleWidth: number = 36
): {
  usableArea: number;
  totalArea: number;
  efficiency: number;
  benchCount: number;
  aisleCount: number;
} {
  const totalArea = roomWidth * roomLength;
  let usableArea = 0;
  let benchCount = 0;
  let aisleCount = 0;
  
  // Standard bench dimensions (4x8 feet = 48x96 inches)
  const benchWidth = 48;
  const benchLength = 96;
  
  if (benchType === 'static') {
    // Fixed aisles between each bench
    const benchesPerRow = Math.floor(roomLength / benchLength);
    const rowsWithAisles = Math.floor(roomWidth / (benchWidth + aisleWidth));
    benchCount = benchesPerRow * rowsWithAisles;
    aisleCount = rowsWithAisles - 1;
    usableArea = benchCount * (benchWidth * benchLength / 144); // Convert to sq ft
  } else if (benchType === 'rolling') {
    // Rolling benches share aisles
    const totalBenchWidth = roomWidth - aisleWidth;
    const benchesPerRow = Math.floor(totalBenchWidth / benchWidth);
    const rowCount = Math.floor(roomLength / benchLength);
    benchCount = benchesPerRow * rowCount;
    aisleCount = 1; // Single movable aisle
    usableArea = benchCount * (benchWidth * benchLength / 144);
  } else if (benchType === 'mobile') {
    // Mobile systems maximize space with single aisle
    const totalBenchWidth = roomWidth - aisleWidth;
    const benchesPerRow = Math.floor(totalBenchWidth / benchWidth);
    const rowCount = Math.floor(roomLength / benchLength);
    benchCount = benchesPerRow * rowCount;
    aisleCount = 1;
    usableArea = benchCount * (benchWidth * benchLength / 144);
  }
  
  const efficiency = (usableArea / totalArea) * 100;
  
  return {
    usableArea,
    totalArea,
    efficiency,
    benchCount,
    aisleCount
  };
}

export function calculateVerticalCapacity(
  roomHeight: number,
  tiers: number,
  tierSpacing: number = 24,
  topClearance: number = 24
): {
  maxTiers: number;
  totalHeight: number;
  growSpace: number;
  feasible: boolean;
} {
  const totalHeight = (tiers * tierSpacing) + topClearance;
  const maxTiers = Math.floor((roomHeight - topClearance) / tierSpacing);
  const growSpace = tierSpacing - 8; // Assuming 8" for lights and structure
  
  return {
    maxTiers,
    totalHeight,
    growSpace,
    feasible: totalHeight <= roomHeight
  };
}

export function recommendBenchingSystem(
  roomWidth: number,
  roomLength: number,
  roomHeight: number,
  cropType: 'cannabis' | 'leafygreens' | 'propagation' = 'cannabis',
  budget?: number
): {
  primary: BenchingSystem[];
  alternative: BenchingSystem[];
  efficiency: any;
  notes: string[];
} {
  const benchingSystems = Object.values(benchingDatabase);
  const recommendations: any = {
    primary: [],
    alternative: [],
    notes: []
  };
  
  // Calculate efficiency for different systems
  const staticEfficiency = calculateBenchingEfficiency(roomWidth, roomLength, 'static');
  const rollingEfficiency = calculateBenchingEfficiency(roomWidth, roomLength, 'rolling');
  const mobileEfficiency = calculateBenchingEfficiency(roomWidth, roomLength, 'mobile');
  
  // Filter based on room size and crop type
  let suitable = benchingSystems.filter(system => {
    const fits = system.dimensions.width <= roomWidth && 
                 system.dimensions.length <= roomLength;
    
    if (cropType === 'propagation') {
      return fits && system.category === 'PropagationBench';
    } else if (cropType === 'leafygreens' && roomHeight > 12 * 12) {
      return fits && (system.category === 'VerticalRack' || system.category === 'RollingBench');
    } else {
      return fits && (system.category !== 'PropagationBench');
    }
  });
  
  // Apply budget filter if provided
  if (budget) {
    const maxPricePerSqFt = budget / (roomWidth * roomLength / 144);
    suitable = suitable.filter(s => !s.pricePerSqFt || s.pricePerSqFt <= maxPricePerSqFt);
  }
  
  // Sort by efficiency and features
  suitable.sort((a, b) => {
    // Prioritize based on space efficiency
    if (rollingEfficiency.efficiency > staticEfficiency.efficiency * 1.1) {
      if (a.category === 'RollingBench' && b.category !== 'RollingBench') return -1;
      if (b.category === 'RollingBench' && a.category !== 'RollingBench') return 1;
    }
    
    // Then by features
    return b.features.length - a.features.length;
  });
  
  recommendations.primary = suitable.slice(0, 3);
  recommendations.alternative = suitable.slice(3, 6);
  recommendations.efficiency = {
    static: staticEfficiency,
    rolling: rollingEfficiency,
    mobile: mobileEfficiency
  };
  
  // Add notes
  if (rollingEfficiency.efficiency > staticEfficiency.efficiency * 1.15) {
    recommendations.notes.push(`Rolling benches increase space efficiency by ${(rollingEfficiency.efficiency - staticEfficiency.efficiency).toFixed(0)}%`);
  }
  
  if (roomHeight > 14 * 12 && cropType === 'leafygreens') {
    recommendations.notes.push('Vertical systems recommended for maximum density');
  }
  
  if (mobileEfficiency.benchCount > 20) {
    recommendations.notes.push('Mobile carriage systems ideal for large-scale operations');
  }
  
  return recommendations;
}