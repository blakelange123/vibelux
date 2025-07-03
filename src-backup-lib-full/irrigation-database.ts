// Irrigation and fertigation systems database for controlled environment agriculture
// Includes drip, ebb & flow, NFT, DWC, and automated dosing systems

export interface IrrigationSystem {
  id: string;
  manufacturer: string;
  model: string;
  category: 'Drip' | 'EbbFlow' | 'NFT' | 'DWC' | 'Aeroponic' | 'Dosing' | 'Controller' | 'WaterTreatment';
  type?: 'Distribution' | 'Monitoring' | 'Treatment' | 'Storage';
  capacity: {
    flowRate?: number; // GPH or GPM
    coverage?: number; // number of plants or sq ft
    tankSize?: number; // gallons
    channels?: number; // for controllers
    zones?: number; // irrigation zones
  };
  specifications: {
    pressure?: { min: number; max: number; unit: 'PSI' };
    accuracy?: number; // percentage
    ecRange?: { min: number; max: number };
    phRange?: { min: number; max: number };
  };
  power?: {
    watts?: number;
    voltage?: number;
    phase?: 1 | 3;
  };
  physical: {
    width?: number; // inches
    height?: number;
    depth?: number;
    weight?: number; // lbs
  };
  features: string[];
  connectivity?: string[];
  price?: number;
  consumables?: {
    type: string;
    lifespan: string;
    cost?: number;
  }[];
}

export const irrigationCategories = {
  Drip: {
    name: 'Drip Irrigation',
    description: 'Precise water delivery to individual plants',
    icon: 'droplet',
    pros: ['Water efficient', 'Precise delivery', 'Reduces disease'],
    cons: ['Can clog', 'Installation time', 'Maintenance required']
  },
  EbbFlow: {
    name: 'Ebb & Flow',
    description: 'Flood and drain hydroponic systems',
    icon: 'waves',
    pros: ['Simple operation', 'Good oxygenation', 'Versatile'],
    cons: ['Pump dependency', 'Disease spread risk', 'Timer critical']
  },
  NFT: {
    name: 'NFT Systems',
    description: 'Nutrient Film Technique for continuous flow',
    icon: 'stream',
    pros: ['Water efficient', 'Good oxygenation', 'No medium needed'],
    cons: ['Power outage risk', 'Clogging issues', 'Limited to small plants']
  },
  DWC: {
    name: 'Deep Water Culture',
    description: 'Roots suspended in oxygenated nutrient solution',
    icon: 'pool',
    pros: ['Fast growth', 'Simple setup', 'Low maintenance'],
    cons: ['Temperature sensitive', 'Power dependency', 'Disease risk']
  },
  Aeroponic: {
    name: 'Aeroponic Systems',
    description: 'Misting roots with nutrient solution',
    icon: 'spray',
    pros: ['Maximum oxygenation', 'Water efficient', 'Fast growth'],
    cons: ['Complex', 'Expensive', 'Power critical']
  },
  Dosing: {
    name: 'Dosing Systems',
    description: 'Automated nutrient injection',
    icon: 'syringe',
    pros: ['Precise control', 'Automated', 'Consistent EC/pH'],
    cons: ['Expensive', 'Calibration needed', 'Complex setup']
  },
  Controller: {
    name: 'Controllers',
    description: 'Irrigation automation and monitoring',
    icon: 'cpu',
    pros: ['Automation', 'Data logging', 'Remote access'],
    cons: ['Learning curve', 'Cost', 'Sensor maintenance']
  },
  WaterTreatment: {
    name: 'Water Treatment',
    description: 'RO, UV, filtration systems',
    icon: 'filter',
    pros: ['Clean water', 'Pathogen control', 'Consistent quality'],
    cons: ['Water waste (RO)', 'Maintenance', 'Operating cost']
  }
};

export const irrigationDatabase: Record<string, IrrigationSystem> = {
  // Drip Irrigation Systems
  'netafim-netbow': {
    id: 'netafim-netbow',
    manufacturer: 'Netafim',
    model: 'NetBow',
    category: 'Drip',
    type: 'Distribution',
    capacity: {
      flowRate: 0.5, // GPH per dripper
      coverage: 1000 // plants
    },
    specifications: {
      pressure: { min: 10, max: 60, unit: 'PSI' },
      accuracy: 5
    },
    physical: {
      weight: 0.1
    },
    features: [
      'Pressure compensating',
      'Anti-drain mechanism',
      'Self-flushing',
      'UV resistant',
      'Clog resistant',
      'Color coded flow rates'
    ],
    price: 0.45, // per dripper
    consumables: [{
      type: 'Dripper',
      lifespan: '5-10 years',
      cost: 0.45
    }]
  },
  'rainbird-xfs-cv': {
    id: 'rainbird-xfs-cv',
    manufacturer: 'Rain Bird',
    model: 'XFS-CV Dripline',
    category: 'Drip',
    type: 'Distribution',
    capacity: {
      flowRate: 0.6,
      coverage: 500 // linear feet
    },
    specifications: {
      pressure: { min: 15, max: 60, unit: 'PSI' }
    },
    features: [
      'Copper oxide root barrier',
      'Check valve in every emitter',
      'Flexible tubing',
      'Self-flushing',
      'Subsurface compatible'
    ],
    price: 0.65 // per foot
  },

  // Ebb & Flow Systems
  'botanicare-ebb-4x4': {
    id: 'botanicare-ebb-4x4',
    manufacturer: 'Botanicare',
    model: '4x4 Ebb & Flow',
    category: 'EbbFlow',
    type: 'Distribution',
    capacity: {
      coverage: 16, // sq ft
      tankSize: 40
    },
    specifications: {
      pressure: { min: 0, max: 10, unit: 'PSI' }
    },
    power: {
      watts: 25,
      voltage: 120
    },
    physical: {
      width: 48,
      height: 7,
      depth: 48,
      weight: 35
    },
    features: [
      'Complete tray system',
      'Overflow fitting',
      'Heavy-duty pump',
      'Timer included',
      'Expandable design'
    ],
    price: 380
  },
  'active-aqua-grow-flow': {
    id: 'active-aqua-grow-flow',
    manufacturer: 'Active Aqua',
    model: 'Grow Flow 2x4',
    category: 'EbbFlow',
    type: 'Distribution',
    capacity: {
      coverage: 8,
      tankSize: 25
    },
    power: {
      watts: 18,
      voltage: 120
    },
    physical: {
      width: 48,
      height: 7,
      depth: 24,
      weight: 25
    },
    features: [
      'Modular system',
      'Extension kits available',
      'Premium pump',
      'Digital timer',
      'Drain kit included'
    ],
    price: 250
  },

  // NFT Systems
  'cropking-nft-4-6': {
    id: 'cropking-nft-4-6',
    manufacturer: 'CropKing',
    model: 'NFT 4-6',
    category: 'NFT',
    type: 'Distribution',
    capacity: {
      coverage: 24, // plant sites
      channels: 4
    },
    specifications: {
      pressure: { min: 0, max: 5, unit: 'PSI' }
    },
    power: {
      watts: 35,
      voltage: 120
    },
    physical: {
      width: 72,
      height: 36,
      depth: 24,
      weight: 45
    },
    features: [
      'Food-grade channels',
      'Adjustable slope',
      'Complete nutrient delivery',
      'End caps included',
      'Commercial grade'
    ],
    price: 650
  },

  // DWC Systems
  'current-culture-uc-solo': {
    id: 'current-culture-uc-solo',
    manufacturer: 'Current Culture',
    model: 'Under Current Solo',
    category: 'DWC',
    type: 'Distribution',
    capacity: {
      coverage: 1, // plant
      tankSize: 13
    },
    specifications: {
      pressure: { min: 0, max: 0, unit: 'PSI' }
    },
    power: {
      watts: 10, // air pump
      voltage: 120
    },
    physical: {
      width: 20,
      height: 16,
      depth: 20,
      weight: 15
    },
    features: [
      'Patented Sub-Current',
      'Premium air diffuser',
      'Light-proof design',
      'Bulkhead fittings',
      'Scalable system'
    ],
    price: 180
  },
  'oxypot-xl': {
    id: 'oxypot-xl',
    manufacturer: 'OxyPot',
    model: 'XL System',
    category: 'DWC',
    type: 'Distribution',
    capacity: {
      coverage: 1,
      tankSize: 19
    },
    power: {
      watts: 5,
      voltage: 120
    },
    physical: {
      width: 15,
      height: 15,
      depth: 15,
      weight: 10
    },
    features: [
      'Mesh pot included',
      'Quiet air pump',
      'Easy access lid',
      'pH stable plastic',
      'Complete kit'
    ],
    price: 95
  },

  // Dosing Systems
  'dosatron-d14mz2': {
    id: 'dosatron-d14mz2',
    manufacturer: 'Dosatron',
    model: 'D14MZ2',
    category: 'Dosing',
    type: 'Monitoring',
    capacity: {
      flowRate: 40, // GPM max
      coverage: 10000 // sq ft
    },
    specifications: {
      pressure: { min: 4.5, max: 85, unit: 'PSI' },
      accuracy: 3
    },
    physical: {
      width: 8,
      height: 24,
      depth: 8,
      weight: 15
    },
    features: [
      'No electricity required',
      'Proportional injection',
      '1:500 to 1:50 ratio',
      'External adjustment',
      'Chemical resistant',
      'NSF certified'
    ],
    price: 850
  },
  'bluelab-dosetronic': {
    id: 'bluelab-dosetronic',
    manufacturer: 'Bluelab',
    model: 'Dosetronic',
    category: 'Dosing',
    type: 'Monitoring',
    capacity: {
      channels: 6,
      zones: 1
    },
    specifications: {
      ecRange: { min: 0, max: 10 },
      phRange: { min: 0, max: 14 },
      accuracy: 2
    },
    power: {
      watts: 15,
      voltage: 120
    },
    physical: {
      width: 12,
      height: 10,
      depth: 4,
      weight: 8
    },
    features: [
      'Peristaltic pumps',
      'pH/EC control',
      'Data logging',
      'Alarm functions',
      'Connect app compatible',
      'Wall mountable'
    ],
    connectivity: ['Bluetooth', 'WiFi'],
    price: 1950
  },

  // Controllers
  'netafim-netbeat': {
    id: 'netafim-netbeat',
    manufacturer: 'Netafim',
    model: 'NetBeat',
    category: 'Controller',
    type: 'Monitoring',
    capacity: {
      zones: 50,
      coverage: 50000
    },
    power: {
      watts: 20,
      voltage: 120
    },
    features: [
      'Cloud-based control',
      'Weather integration',
      'Fertigation control',
      'Flow monitoring',
      'Mobile app',
      'Multi-site management'
    ],
    connectivity: ['Cellular', 'WiFi', 'Ethernet'],
    price: 2500
  },
  'galcon-8056s': {
    id: 'galcon-8056s',
    manufacturer: 'Galcon',
    model: '8056S',
    category: 'Controller',
    type: 'Monitoring',
    capacity: {
      zones: 24
    },
    power: {
      watts: 10,
      voltage: 120
    },
    physical: {
      width: 14,
      height: 10,
      depth: 4,
      weight: 5
    },
    features: [
      'Weekly programming',
      'Manual override',
      'Rain delay',
      'Battery backup',
      'Sensor inputs',
      'Expandable'
    ],
    price: 450
  },

  // Water Treatment
  'hydrologic-evolution-1000': {
    id: 'hydrologic-evolution-1000',
    manufacturer: 'HydroLogic',
    model: 'Evolution RO1000',
    category: 'WaterTreatment',
    type: 'Treatment',
    capacity: {
      flowRate: 1000 // GPD
    },
    specifications: {
      pressure: { min: 40, max: 100, unit: 'PSI' }
    },
    physical: {
      width: 24,
      height: 48,
      depth: 12,
      weight: 65
    },
    features: [
      '2:1 waste ratio',
      'KDF85 pre-filter',
      'Membrane flush kit',
      'Pressure gauge',
      'TDS meter included',
      'Wall mountable'
    ],
    price: 850,
    consumables: [
      {
        type: 'Sediment filter',
        lifespan: '6 months',
        cost: 25
      },
      {
        type: 'Carbon filter',
        lifespan: '6 months',
        cost: 35
      },
      {
        type: 'RO membrane',
        lifespan: '2-3 years',
        cost: 150
      }
    ]
  },
  'ideal-h2o-premium': {
    id: 'ideal-h2o-premium',
    manufacturer: 'Ideal H2O',
    model: 'Premium 2000',
    category: 'WaterTreatment',
    type: 'Treatment',
    capacity: {
      flowRate: 2000
    },
    specifications: {
      pressure: { min: 45, max: 90, unit: 'PSI' }
    },
    physical: {
      width: 30,
      height: 60,
      depth: 16,
      weight: 95
    },
    features: [
      'Coconut carbon filter',
      'Catalytic carbon',
      'De-ionization stage',
      '1:1 waste ratio',
      'Automatic shutoff',
      'Premium fittings'
    ],
    price: 1450,
    consumables: [
      {
        type: 'Pre-filter set',
        lifespan: '6 months',
        cost: 65
      },
      {
        type: 'RO membrane',
        lifespan: '2 years',
        cost: 200
      }
    ]
  }
};

// Helper functions for irrigation calculations
export function calculateWaterRequirement(
  plantCount: number,
  plantStage: 'seedling' | 'vegetative' | 'flowering',
  growthMedium: 'soil' | 'coco' | 'rockwool' | 'hydro',
  environmentTemp: number = 78
): {
  dailyWaterPerPlant: number; // gallons
  totalDailyWater: number;
  irrigationFrequency: string;
  runoffPercentage: number;
} {
  // Base water requirements (gallons per day)
  const baseWater = {
    seedling: { soil: 0.1, coco: 0.15, rockwool: 0.2, hydro: 0.25 },
    vegetative: { soil: 0.5, coco: 0.75, rockwool: 1.0, hydro: 1.5 },
    flowering: { soil: 1.0, coco: 1.5, rockwool: 2.0, hydro: 2.5 }
  };

  // Temperature adjustment factor
  const tempFactor = environmentTemp > 80 ? 1.2 : 1.0;
  
  const dailyWaterPerPlant = baseWater[plantStage][growthMedium] * tempFactor;
  const runoffPercentage = growthMedium === 'hydro' ? 0 : growthMedium === 'coco' ? 20 : 10;
  
  // Irrigation frequency recommendations
  const frequencies = {
    soil: { seedling: 'Every 2-3 days', vegetative: 'Daily', flowering: 'Daily' },
    coco: { seedling: '2x daily', vegetative: '3-4x daily', flowering: '4-6x daily' },
    rockwool: { seedling: '2x daily', vegetative: '4x daily', flowering: '6x daily' },
    hydro: { seedling: 'Continuous', vegetative: 'Continuous', flowering: 'Continuous' }
  };

  return {
    dailyWaterPerPlant,
    totalDailyWater: dailyWaterPerPlant * plantCount * (1 + runoffPercentage / 100),
    irrigationFrequency: frequencies[growthMedium][plantStage],
    runoffPercentage
  };
}

export function calculateDosingRequirements(
  waterVolume: number, // gallons per day
  targetEC: number = 1.5,
  stockSolutionRatio: number = 100 // 100:1 concentrated
): {
  nutrientADaily: number; // ml
  nutrientBDaily: number; // ml
  phAdjustDaily: number; // ml estimate
  monthlyNutrientCost: number;
} {
  // Rough calculations for 2-part nutrients
  const nutrientConcentration = targetEC * 700; // PPM estimate
  const stockSolutionNeeded = (waterVolume * 3.785 * nutrientConcentration) / (stockSolutionRatio * 1000);
  
  return {
    nutrientADaily: stockSolutionNeeded * 500, // ml
    nutrientBDaily: stockSolutionNeeded * 500, // ml
    phAdjustDaily: waterVolume * 2, // ml rough estimate
    monthlyNutrientCost: stockSolutionNeeded * 30 * 20 // $20/L estimate
  };
}

export function recommendIrrigationSystem(
  roomWidth: number,
  roomLength: number,
  plantCount: number,
  growthMedium: 'soil' | 'coco' | 'rockwool' | 'hydro' = 'coco',
  automationLevel: 'basic' | 'advanced' = 'advanced'
): {
  distribution: IrrigationSystem;
  controller?: IrrigationSystem;
  dosing?: IrrigationSystem;
  waterTreatment?: IrrigationSystem;
  totalCost: number;
  notes: string[];
} {
  const area = roomWidth * roomLength;
  const recommendations: any = {};
  const notes: string[] = [];
  let totalCost = 0;

  // Distribution system based on medium
  if (growthMedium === 'hydro') {
    if (plantCount <= 50) {
      recommendations.distribution = irrigationDatabase['current-culture-uc-solo'];
      notes.push('DWC recommended for small hydro operations');
    } else {
      recommendations.distribution = irrigationDatabase['cropking-nft-4-6'];
      notes.push('NFT system for larger hydro operations');
    }
  } else {
    recommendations.distribution = irrigationDatabase['netafim-netbow'];
    notes.push('Drip irrigation recommended for coco/soil');
    totalCost += plantCount * 0.45; // dripper cost
  }

  // Controller for automation
  if (automationLevel === 'advanced') {
    if (area > 5000) {
      recommendations.controller = irrigationDatabase['netafim-netbeat'];
      notes.push('Cloud-based control for large operations');
    } else {
      recommendations.controller = irrigationDatabase['galcon-8056s'];
      notes.push('Zone controller for smaller facilities');
    }
    totalCost += recommendations.controller.price;
  }

  // Dosing system
  if (plantCount > 100 || automationLevel === 'advanced') {
    if (plantCount > 500) {
      recommendations.dosing = irrigationDatabase['dosatron-d14mz2'];
      notes.push('Proportional dosing for consistent EC');
    } else {
      recommendations.dosing = irrigationDatabase['bluelab-dosetronic'];
      notes.push('Precision dosing with pH/EC control');
    }
    totalCost += recommendations.dosing.price;
  }

  // Water treatment
  const dailyWater = calculateWaterRequirement(plantCount, 'flowering', growthMedium).totalDailyWater;
  if (dailyWater > 100) {
    recommendations.waterTreatment = dailyWater > 200 
      ? irrigationDatabase['ideal-h2o-premium']
      : irrigationDatabase['hydrologic-evolution-1000'];
    notes.push('RO system recommended for consistent water quality');
    totalCost += recommendations.waterTreatment.price;
  }

  return {
    ...recommendations,
    totalCost,
    notes
  };
}