// Electrical infrastructure database for controlled environment agriculture
// Includes panels, transformers, generators, and power distribution

export interface ElectricalEquipment {
  id: string;
  manufacturer: string;
  model: string;
  category: 'Panel' | 'Transformer' | 'Generator' | 'UPS' | 'PDU' | 'Switchgear' | 'Meter';
  type: string;
  capacity: {
    voltage?: number | number[]; // Can be array for multi-voltage
    amperage?: number;
    kva?: number;
    kw?: number;
    phases: 1 | 3;
    frequency?: number; // Hz
  };
  specifications: {
    breakerSpaces?: number;
    circuitBreakers?: number;
    efficiency?: number; // percentage
    powerFactor?: number;
    thd?: number; // Total harmonic distortion
    transferTime?: number; // ms for UPS
    runtime?: number; // minutes for UPS/Generator
  };
  connections: {
    input?: string;
    output?: string;
    neutral?: boolean;
    ground?: boolean;
  };
  physical: {
    width: number; // inches
    height: number;
    depth: number;
    weight: number; // lbs
    mounting: 'Wall' | 'Floor' | 'Pad' | 'Rack';
    nema?: string; // NEMA rating
  };
  safety: {
    ul?: string;
    nema?: string;
    ip?: string;
    arcFlash?: boolean;
  };
  features: string[];
  price?: number;
  leadTime?: string;
}

export const electricalCategories = {
  Panel: {
    name: 'Electrical Panels',
    description: 'Main and sub panels for power distribution',
    icon: 'electric-panel',
    pros: ['Organized distribution', 'Safety features', 'Expandable'],
    cons: ['Professional installation', 'Space requirements']
  },
  Transformer: {
    name: 'Transformers',
    description: 'Step up/down voltage transformation',
    icon: 'transformer',
    pros: ['Voltage flexibility', 'Isolation', 'Efficiency'],
    cons: ['Heat generation', 'Size/weight', 'Cost']
  },
  Generator: {
    name: 'Generators',
    description: 'Backup power generation',
    icon: 'generator',
    pros: ['Power reliability', 'Grid independence', 'Emergency backup'],
    cons: ['Fuel costs', 'Maintenance', 'Noise']
  },
  UPS: {
    name: 'UPS Systems',
    description: 'Uninterruptible power supplies',
    icon: 'battery',
    pros: ['Instant backup', 'Power conditioning', 'Surge protection'],
    cons: ['Battery replacement', 'Limited runtime', 'Heat']
  },
  PDU: {
    name: 'Power Distribution',
    description: 'Rack and remote power distribution',
    icon: 'power-strip',
    pros: ['Flexible distribution', 'Monitoring', 'Remote control'],
    cons: ['Additional failure point', 'Cost per outlet']
  },
  Switchgear: {
    name: 'Switchgear',
    description: 'High voltage switching and protection',
    icon: 'switch',
    pros: ['Safety', 'Control', 'Protection'],
    cons: ['Complex', 'Expensive', 'Large footprint']
  },
  Meter: {
    name: 'Power Meters',
    description: 'Energy monitoring and submetering',
    icon: 'gauge',
    pros: ['Energy tracking', 'Cost allocation', 'Optimization'],
    cons: ['Installation cost', 'Additional complexity']
  }
};

export const electricalDatabase: Record<string, ElectricalEquipment> = {
  // Main Panels
  'square-d-qo142m200pc': {
    id: 'square-d-qo142m200pc',
    manufacturer: 'Square D',
    model: 'QO142M200PC',
    category: 'Panel',
    type: 'Main Breaker Load Center',
    capacity: {
      voltage: [120, 240],
      amperage: 200,
      phases: 1,
      frequency: 60
    },
    specifications: {
      breakerSpaces: 42,
      circuitBreakers: 42
    },
    connections: {
      input: 'Top/Bottom',
      output: 'Breakers',
      neutral: true,
      ground: true
    },
    physical: {
      width: 14.25,
      height: 39,
      depth: 4.5,
      weight: 45,
      mounting: 'Wall',
      nema: 'NEMA 1'
    },
    safety: {
      ul: 'UL 67',
      nema: 'NEMA PB1',
      arcFlash: false
    },
    features: [
      'Plug-on neutral',
      'Convertible main lug',
      'Ground bar included',
      'QO breakers only',
      'Indoor rated',
      'Copper bus'
    ],
    price: 350
  },
  'eaton-ch42b225r': {
    id: 'eaton-ch42b225r',
    manufacturer: 'Eaton',
    model: 'CH42B225R',
    category: 'Panel',
    type: 'Main Breaker Panel',
    capacity: {
      voltage: [120, 240],
      amperage: 225,
      phases: 1
    },
    specifications: {
      breakerSpaces: 42,
      circuitBreakers: 42
    },
    connections: {
      input: 'Top',
      output: 'CH Breakers',
      neutral: true,
      ground: true
    },
    physical: {
      width: 20,
      height: 44,
      depth: 5.75,
      weight: 68,
      mounting: 'Wall',
      nema: 'NEMA 3R'
    },
    safety: {
      ul: 'UL 67',
      nema: 'NEMA 3R',
      arcFlash: false
    },
    features: [
      'Outdoor rated',
      'Rainproof',
      'Aluminum bus',
      'BR breakers compatible',
      'Factory installed main',
      'Galvanized box'
    ],
    price: 450
  },

  // Sub Panels
  'ge-tm3220ccu': {
    id: 'ge-tm3220ccu',
    manufacturer: 'GE',
    model: 'TM3220CCU',
    category: 'Panel',
    type: 'Sub Panel',
    capacity: {
      voltage: [120, 240],
      amperage: 200,
      phases: 1
    },
    specifications: {
      breakerSpaces: 32,
      circuitBreakers: 20
    },
    connections: {
      input: 'Main lugs',
      output: 'Breakers',
      neutral: true,
      ground: true
    },
    physical: {
      width: 14.25,
      height: 29.5,
      depth: 3.88,
      weight: 25,
      mounting: 'Wall'
    },
    safety: {
      ul: 'UL 67'
    },
    features: [
      'Main lug only',
      'Copper bus',
      'Indoor use',
      'Expandable',
      'THQL breakers',
      'White powder coat'
    ],
    price: 180
  },

  // Transformers
  'square-d-75kva-480-208': {
    id: 'square-d-75kva-480-208',
    manufacturer: 'Square D',
    model: '75T3H',
    category: 'Transformer',
    type: 'Dry Type Step Down',
    capacity: {
      voltage: [480, 208],
      kva: 75,
      phases: 3,
      frequency: 60
    },
    specifications: {
      efficiency: 98.3,
      powerFactor: 0.95,
      thd: 5
    },
    connections: {
      input: 'Delta',
      output: 'Wye',
      neutral: true,
      ground: true
    },
    physical: {
      width: 26,
      height: 37,
      depth: 21,
      weight: 650,
      mounting: 'Floor',
      nema: 'NEMA 2'
    },
    safety: {
      ul: 'UL 1561',
      nema: 'NEMA ST-20'
    },
    features: [
      '150°C temperature rise',
      'Aluminum windings',
      'NEMA TP-1 efficient',
      'Sound level 50dB',
      'Indoor/outdoor',
      '10 year warranty'
    ],
    price: 4500
  },
  'jefferson-45kva': {
    id: 'jefferson-45kva',
    manufacturer: 'Jefferson Electric',
    model: '423-7231-000',
    category: 'Transformer',
    type: 'Buck Boost',
    capacity: {
      voltage: [240, 208],
      kva: 45,
      phases: 3
    },
    specifications: {
      efficiency: 97.5
    },
    connections: {
      input: 'Wye',
      output: 'Wye'
    },
    physical: {
      width: 20,
      height: 24,
      depth: 16,
      weight: 380,
      mounting: 'Wall'
    },
    safety: {
      ul: 'UL 1561',
      nema: 'NEMA 3R'
    },
    features: [
      'Buck or boost',
      'Weatherproof',
      'Copper windings',
      'Low noise',
      'Multiple taps'
    ],
    price: 2800
  },

  // Generators
  'generac-rg04854': {
    id: 'generac-rg04854',
    manufacturer: 'Generac',
    model: 'RG04854ANAX',
    category: 'Generator',
    type: 'Standby Generator',
    capacity: {
      kw: 48,
      voltage: [120, 240],
      phases: 1,
      frequency: 60
    },
    specifications: {
      runtime: 999, // Continuous with NG
      transferTime: 10000 // 10 seconds
    },
    connections: {
      output: 'Terminal block',
      neutral: true,
      ground: true
    },
    physical: {
      width: 48,
      height: 29,
      depth: 25,
      weight: 875,
      mounting: 'Pad',
      nema: 'NEMA 3R'
    },
    safety: {
      ul: 'UL 2200',
      nema: 'NEMA 3R'
    },
    features: [
      'Liquid cooled',
      'Natural gas/propane',
      'Automatic transfer',
      'Remote monitoring',
      'Quiet operation',
      'All weather enclosure',
      '5 year warranty'
    ],
    price: 15000
  },
  'kohler-150rzg': {
    id: 'kohler-150rzg',
    manufacturer: 'Kohler',
    model: '150RZGC',
    category: 'Generator',
    type: 'Industrial Generator',
    capacity: {
      kw: 150,
      voltage: [208, 240, 480],
      phases: 3
    },
    specifications: {
      runtime: 999,
      efficiency: 95
    },
    connections: {
      output: '4-wire',
      neutral: true,
      ground: true
    },
    physical: {
      width: 91,
      height: 51,
      depth: 42,
      weight: 3880,
      mounting: 'Pad'
    },
    safety: {
      ul: 'UL 2200',
      nema: 'NEMA 3R'
    },
    features: [
      'John Deere engine',
      'Sound attenuated',
      'Digital controller',
      'Remote start',
      'Load management',
      'Paralleling capable'
    ],
    price: 45000
  },

  // UPS Systems
  'apc-srt10krmxlt': {
    id: 'apc-srt10krmxlt',
    manufacturer: 'APC',
    model: 'SRT10KRMXLT',
    category: 'UPS',
    type: 'Online Double Conversion',
    capacity: {
      kva: 10,
      kw: 10,
      voltage: [208, 240],
      phases: 1
    },
    specifications: {
      efficiency: 96,
      transferTime: 0,
      runtime: 6 // At full load
    },
    connections: {
      input: 'Hardwire',
      output: 'Hardwire',
      neutral: true,
      ground: true
    },
    physical: {
      width: 17,
      height: 17.5, // 10U
      depth: 25,
      weight: 370,
      mounting: 'Rack'
    },
    safety: {
      ul: 'UL 1778',
      ip: 'IP20'
    },
    features: [
      'Pure sine wave',
      'Network card included',
      'LCD display',
      'Hot-swappable batteries',
      'ECO mode',
      'Parallel capable',
      'Extended runtime capable'
    ],
    price: 8500
  },
  'eaton-9px6k': {
    id: 'eaton-9px6k',
    manufacturer: 'Eaton',
    model: '9PX6K',
    category: 'UPS',
    type: 'Online Double Conversion',
    capacity: {
      kva: 6,
      kw: 5.4,
      voltage: [208, 240],
      phases: 1
    },
    specifications: {
      efficiency: 95,
      transferTime: 0,
      runtime: 9
    },
    connections: {
      input: 'L6-30P',
      output: '(2) L6-30R, (2) L6-20R'
    },
    physical: {
      width: 17,
      height: 5.25, // 3U
      depth: 26,
      weight: 84,
      mounting: 'Rack'
    },
    safety: {
      ul: 'UL 1778'
    },
    features: [
      'Unity power factor',
      'Graphical LCD',
      'ABM battery management',
      'Load segments',
      'Network card optional',
      'Parallel redundancy'
    ],
    price: 4200
  },

  // PDUs
  'tripp-lite-pdu3vsr6g60': {
    id: 'tripp-lite-pdu3vsr6g60',
    manufacturer: 'Tripp Lite',
    model: 'PDU3VSR6G60',
    category: 'PDU',
    type: '3-Phase Switched PDU',
    capacity: {
      voltage: 208,
      amperage: 60,
      phases: 3,
      kw: 21.6
    },
    specifications: {
      circuitBreakers: 6
    },
    connections: {
      input: 'CS8365C',
      output: '(42) C13, (6) C19'
    },
    physical: {
      width: 2.05,
      height: 70.9,
      depth: 4.65,
      weight: 38,
      mounting: 'Rack'
    },
    safety: {
      ul: 'UL 60950'
    },
    features: [
      'Per outlet switching',
      'Network interface',
      'Current monitoring',
      'Environmental sensors',
      'Sequential startup',
      'Outlet grouping'
    ],
    price: 2400
  },
  'servertech-cs-84vye': {
    id: 'servertech-cs-84vye',
    manufacturer: 'Server Technology',
    model: 'CS-84VYE-C20',
    category: 'PDU',
    type: 'Smart PDU',
    capacity: {
      voltage: [208, 240],
      amperage: 30,
      phases: 1
    },
    specifications: {
      efficiency: 99
    },
    connections: {
      input: 'L6-30P',
      output: '(40) C13, (2) C19'
    },
    physical: {
      width: 2.2,
      height: 70,
      depth: 3.5,
      weight: 25,
      mounting: 'Rack'
    },
    features: [
      'Per outlet metering',
      'Network monitoring',
      'Environmental probes',
      'Hot-swap controller',
      'SNMP/Web interface',
      'Daisy chain capable'
    ],
    price: 1800
  },

  // Power Meters
  'accuenergy-acuvim-ii': {
    id: 'accuenergy-acuvim-ii',
    manufacturer: 'AccuEnergy',
    model: 'AcuVIM II',
    category: 'Meter',
    type: 'Power Quality Meter',
    capacity: {
      voltage: [600],
      phases: 3
    },
    specifications: {
      accuracy: 0.2,
      thd: 63
    },
    connections: {
      input: 'CT/PT',
      neutral: true
    },
    physical: {
      width: 3.78,
      height: 3.78,
      depth: 2.95,
      weight: 1,
      mounting: 'Wall'
    },
    safety: {
      ul: 'UL 61010-1'
    },
    features: [
      'Revenue grade',
      'Harmonics analysis',
      'Data logging',
      'Modbus RTU/TCP',
      'Web interface',
      'Waveform capture',
      'Multi-tariff'
    ],
    price: 850
  }
};

// Helper functions for electrical calculations
export function calculateElectricalLoad(
  fixtures: number,
  fixtureWattage: number,
  hvacKw: number,
  otherLoadsKw: number = 0,
  powerFactor: number = 0.9
): {
  lightingLoad: number; // kW
  totalLoad: number; // kW
  totalKva: number;
  recommendedService: number; // Amps
  voltage: number;
} {
  const lightingLoad = (fixtures * fixtureWattage) / 1000;
  const totalLoad = lightingLoad + hvacKw + otherLoadsKw;
  const totalKva = totalLoad / powerFactor;
  
  // Add 25% safety factor
  const designKva = totalKva * 1.25;
  
  // Determine service size
  let recommendedService: number;
  let voltage: number;
  
  if (designKva < 50) {
    voltage = 240;
    recommendedService = Math.ceil(designKva * 1000 / voltage / 0.8); // 80% rule
  } else if (designKva < 150) {
    voltage = 208;
    recommendedService = Math.ceil(designKva * 1000 / voltage / 1.732 / 0.8);
  } else {
    voltage = 480;
    recommendedService = Math.ceil(designKva * 1000 / voltage / 1.732 / 0.8);
  }
  
  // Round to standard sizes
  const standardSizes = [100, 125, 150, 200, 225, 400, 600, 800, 1000, 1200, 1600, 2000];
  recommendedService = standardSizes.find(size => size >= recommendedService) || 2000;
  
  return {
    lightingLoad,
    totalLoad,
    totalKva,
    recommendedService,
    voltage
  };
}

export function calculateUPSRequirements(
  criticalLoadKw: number,
  runtimeMinutes: number = 10,
  powerFactor: number = 0.9
): {
  requiredKva: number;
  batteryAh: number; // Amp-hours at typical voltage
  recommendedModels: ElectricalEquipment[];
} {
  const requiredKva = criticalLoadKw / powerFactor * 1.2; // 20% headroom
  
  // Rough battery calculation (12V per battery, typical string voltage 240V)
  const batteryVoltage = 240;
  const batteryAh = (criticalLoadKw * 1000 * runtimeMinutes / 60) / batteryVoltage / 0.85; // 85% inverter efficiency
  
  const recommendedModels = Object.values(electricalDatabase).filter(
    item => item.category === 'UPS' && 
           item.capacity.kva && 
           item.capacity.kva >= requiredKva &&
           item.specifications.runtime && 
           item.specifications.runtime >= runtimeMinutes * 0.8 // 80% of required
  ).slice(0, 3);
  
  return {
    requiredKva,
    batteryAh,
    recommendedModels
  };
}

export function recommendElectricalInfrastructure(
  totalLoadKw: number,
  criticalLoadKw: number,
  rooms: number = 1,
  redundancy: boolean = false
): {
  mainPanel?: ElectricalEquipment;
  subPanels?: ElectricalEquipment[];
  transformer?: ElectricalEquipment;
  generator?: ElectricalEquipment;
  ups?: ElectricalEquipment;
  pdus?: ElectricalEquipment[];
  notes: string[];
} {
  const recommendations: any = {};
  const notes: string[] = [];
  const load = calculateElectricalLoad(0, 0, totalLoadKw);
  
  // Main panel selection
  const panels = Object.values(electricalDatabase).filter(
    item => item.category === 'Panel' && 
           item.capacity.amperage && 
           item.capacity.amperage >= load.recommendedService
  );
  
  if (panels.length > 0) {
    recommendations.mainPanel = panels[0];
    notes.push(`${load.recommendedService}A service recommended at ${load.voltage}V`);
  }
  
  // Sub panels for multiple rooms
  if (rooms > 1) {
    const subPanels = Object.values(electricalDatabase).filter(
      item => item.category === 'Panel' && 
             item.type === 'Sub Panel'
    );
    recommendations.subPanels = subPanels.slice(0, Math.min(rooms, 3));
    notes.push(`${rooms} sub-panels recommended for room distribution`);
  }
  
  // Transformer if needed
  if (load.voltage === 480 || totalLoadKw > 150) {
    const transformers = Object.values(electricalDatabase).filter(
      item => item.category === 'Transformer' &&
             item.capacity.kva && 
             item.capacity.kva >= load.totalKva
    );
    if (transformers.length > 0) {
      recommendations.transformer = transformers[0];
      notes.push('Step-down transformer recommended for equipment voltage');
    }
  }
  
  // Generator for backup
  if (redundancy || criticalLoadKw > 50) {
    const generators = Object.values(electricalDatabase).filter(
      item => item.category === 'Generator' &&
             item.capacity.kw && 
             item.capacity.kw >= criticalLoadKw * 1.25
    );
    if (generators.length > 0) {
      recommendations.generator = generators[0];
      notes.push('Backup generator sized for critical loads');
    }
  }
  
  // UPS for critical loads
  if (criticalLoadKw > 0) {
    const upsReq = calculateUPSRequirements(criticalLoadKw);
    if (upsReq.recommendedModels.length > 0) {
      recommendations.ups = upsReq.recommendedModels[0];
      notes.push('UPS recommended for critical lighting/controls');
    }
  }
  
  // PDUs for rack distribution
  if (totalLoadKw > 20) {
    const pdus = Object.values(electricalDatabase).filter(
      item => item.category === 'PDU'
    ).slice(0, 2);
    recommendations.pdus = pdus;
    notes.push('Smart PDUs for monitoring and control');
  }
  
  return {
    ...recommendations,
    notes
  };
}