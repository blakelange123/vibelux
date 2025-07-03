// Electrical infrastructure database for controlled environment agriculture
// Includes panels, PDUs, generators, and electrical distribution equipment

export interface ElectricalEquipment {
  id: string;
  manufacturer: string;
  model: string;
  category: 'Panel' | 'PDU' | 'Generator' | 'Transformer' | 'UPS' | 'Meter' | 'Disconnect';
  type: string;
  capacity: {
    voltage?: number;
    amperage?: number;
    phases?: 1 | 3;
    kva?: number;
    kw?: number;
    circuits?: number;
    outlets?: number;
  };
  specifications: {
    inputVoltage?: number;
    outputVoltage?: number;
    frequency?: number; // Hz
    efficiency?: number; // percentage
    powerFactor?: number;
    thd?: number; // Total Harmonic Distortion %
  };
  protection: {
    mainBreaker?: number; // amps
    groundFault?: boolean;
    arcFault?: boolean;
    surgeProtection?: boolean;
    shortCircuit?: number; // kAIC rating
  };
  physical: {
    width: number; // inches
    height: number;
    depth: number;
    weight: number; // lbs
    mounting: 'Surface' | 'Flush' | 'Rack' | 'Floor' | 'Pad';
    nema?: string; // enclosure rating
  };
  features: string[];
  certifications: string[];
  price?: number;
  runtime?: {
    halfLoad?: number; // minutes
    fullLoad?: number; // minutes
  };
}

export const electricalCategories = {
  Panel: {
    name: 'Electrical Panels',
    description: 'Main and sub-panel distribution',
    icon: 'panel',
    pros: ['Central distribution', 'Circuit protection', 'Code compliance'],
    cons: ['Installation cost', 'Space requirements']
  },
  PDU: {
    name: 'Power Distribution',
    description: 'Rack-mount and floor PDUs',
    icon: 'plug',
    pros: ['Multiple outlets', 'Power monitoring', 'Remote switching'],
    cons: ['Limited capacity', 'Single point of failure']
  },
  Generator: {
    name: 'Backup Generators',
    description: 'Emergency power systems',
    icon: 'power',
    pros: ['Power reliability', 'Extended runtime', 'Full facility backup'],
    cons: ['Fuel requirements', 'Maintenance', 'Noise']
  },
  Transformer: {
    name: 'Transformers',
    description: 'Voltage transformation',
    icon: 'transformer',
    pros: ['Voltage matching', 'Isolation', 'Power quality'],
    cons: ['Heat generation', 'Size', 'Cost']
  },
  UPS: {
    name: 'UPS Systems',
    description: 'Uninterruptible power supplies',
    icon: 'battery',
    pros: ['Instant backup', 'Power conditioning', 'Surge protection'],
    cons: ['Battery replacement', 'Limited runtime']
  },
  Meter: {
    name: 'Power Meters',
    description: 'Energy monitoring systems',
    icon: 'gauge',
    pros: ['Usage tracking', 'Cost allocation', 'Efficiency monitoring'],
    cons: ['Additional cost', 'Installation complexity']
  },
  Disconnect: {
    name: 'Disconnects',
    description: 'Safety disconnects and switches',
    icon: 'switch',
    pros: ['Safety compliance', 'Service isolation', 'Lockout capability'],
    cons: ['Additional components', 'Space requirements']
  }
};

export const electricalDatabase: Record<string, ElectricalEquipment> = {
  // Electrical Panels
  'square-d-qo442l400': {
    id: 'square-d-qo442l400',
    manufacturer: 'Square D',
    model: 'QO442L400',
    category: 'Panel',
    type: 'Main Panel',
    capacity: {
      voltage: 240,
      amperage: 400,
      phases: 3,
      circuits: 42
    },
    specifications: {
      inputVoltage: 240,
      outputVoltage: 240,
      frequency: 60
    },
    protection: {
      mainBreaker: 400,
      groundFault: true,
      arcFault: true,
      shortCircuit: 22000
    },
    physical: {
      width: 20,
      height: 44,
      depth: 7,
      weight: 95,
      mounting: 'Surface',
      nema: '1'
    },
    features: [
      'Copper bus bars',
      'Plug-on neutral',
      'AFCI/GFCI compatible',
      'QO breakers only',
      'Convertible main',
      'Factory installed ground bar'
    ],
    certifications: ['UL', 'CSA', 'NEC 2020'],
    price: 1850
  },
  'siemens-p5': {
    id: 'siemens-p5',
    manufacturer: 'Siemens',
    model: 'P5 Panelboard',
    category: 'Panel',
    type: 'Sub Panel',
    capacity: {
      voltage: 480,
      amperage: 600,
      phases: 3,
      circuits: 84
    },
    specifications: {
      inputVoltage: 480,
      outputVoltage: 480,
      frequency: 60
    },
    protection: {
      mainBreaker: 600,
      shortCircuit: 65000
    },
    physical: {
      width: 24,
      height: 60,
      depth: 8,
      weight: 250,
      mounting: 'Surface',
      nema: '1'
    },
    features: [
      'Bolt-on breakers',
      'High interrupting capacity',
      'Aluminum bus',
      'Top or bottom feed',
      'Hinged trim',
      'Padlockable door'
    ],
    certifications: ['UL 67', 'CSA', 'NEMA PB1'],
    price: 4200
  },

  // Power Distribution Units
  'tripp-lite-pdu3vsr6g50': {
    id: 'tripp-lite-pdu3vsr6g50',
    manufacturer: 'Tripp Lite',
    model: 'PDU3VSR6G50',
    category: 'PDU',
    type: 'Switched PDU',
    capacity: {
      voltage: 240,
      amperage: 50,
      phases: 3,
      outlets: 36
    },
    specifications: {
      inputVoltage: 208,
      outputVoltage: 120,
      frequency: 60,
      efficiency: 98
    },
    protection: {
      surgeProtection: true
    },
    physical: {
      width: 2,
      height: 70,
      depth: 4,
      weight: 35,
      mounting: 'Rack',
      nema: '1'
    },
    features: [
      'Remote switching',
      'Current monitoring',
      'Network interface',
      'Environmental monitoring',
      'Sequential startup',
      'Overload protection',
      'SNMP/Web interface'
    ],
    certifications: ['UL', 'CSA', 'CE'],
    price: 2400
  },
  'apc-ap8959': {
    id: 'apc-ap8959',
    manufacturer: 'APC',
    model: 'AP8959NA3',
    category: 'PDU',
    type: 'Metered PDU',
    capacity: {
      voltage: 240,
      amperage: 30,
      phases: 3,
      outlets: 42
    },
    specifications: {
      inputVoltage: 208,
      outputVoltage: 120,
      frequency: 60
    },
    protection: {
      surgeProtection: false
    },
    physical: {
      width: 2,
      height: 71,
      depth: 3,
      weight: 25,
      mounting: 'Rack'
    },
    features: [
      'Current metering',
      'LED display',
      'Branch circuit protection',
      'Low profile design',
      'Toolless mounting',
      'Local display'
    ],
    certifications: ['UL', 'CSA', 'FCC Part 15'],
    price: 950
  },

  // Backup Generators
  'generac-rg04854': {
    id: 'generac-rg04854',
    manufacturer: 'Generac',
    model: 'RG04854',
    category: 'Generator',
    type: 'Standby Generator',
    capacity: {
      kw: 48,
      voltage: 240,
      phases: 3,
      amperage: 200
    },
    specifications: {
      outputVoltage: 240,
      frequency: 60,
      powerFactor: 0.8
    },
    protection: {
      mainBreaker: 200,
      groundFault: true
    },
    physical: {
      width: 48,
      height: 29,
      depth: 25,
      weight: 850,
      mounting: 'Pad',
      nema: '3R'
    },
    features: [
      'Liquid cooled engine',
      'Automatic transfer',
      'Weekly self-test',
      'Natural gas/propane',
      'Sound attenuated',
      'Remote monitoring',
      'Mobile Link compatible'
    ],
    certifications: ['UL 2200', 'EPA', 'CSA'],
    price: 14500,
    runtime: {
      halfLoad: 999999, // continuous on gas
      fullLoad: 999999
    }
  },
  'kohler-150reozjf': {
    id: 'kohler-150reozjf',
    manufacturer: 'Kohler',
    model: '150REOZJF',
    category: 'Generator',
    type: 'Industrial Generator',
    capacity: {
      kw: 150,
      voltage: 480,
      phases: 3,
      amperage: 180
    },
    specifications: {
      outputVoltage: 480,
      frequency: 60,
      powerFactor: 0.8,
      efficiency: 95
    },
    protection: {
      mainBreaker: 200,
      groundFault: true
    },
    physical: {
      width: 74,
      height: 51,
      depth: 33,
      weight: 3850,
      mounting: 'Pad',
      nema: '3R'
    },
    features: [
      'John Deere engine',
      'Sound enclosure',
      'Digital controller',
      'Load management',
      '500 hour intervals',
      'Remote monitoring',
      'Paralleling capable'
    ],
    certifications: ['UL 2200', 'EPA Tier 3', 'CSA'],
    price: 42000
  },

  // Transformers
  'acme-t3530k': {
    id: 'acme-t3530k',
    manufacturer: 'Acme',
    model: 'T3530K',
    category: 'Transformer',
    type: 'Dry Type',
    capacity: {
      kva: 30,
      voltage: 480,
      phases: 3
    },
    specifications: {
      inputVoltage: 480,
      outputVoltage: 208,
      frequency: 60,
      efficiency: 98.5
    },
    protection: {
      surgeProtection: false
    },
    physical: {
      width: 20,
      height: 27,
      depth: 12,
      weight: 280,
      mounting: 'Floor',
      nema: '2'
    },
    features: [
      'K-factor rated',
      '115°C rise',
      'Copper windings',
      'Electrostatic shield',
      '2.5% taps',
      'Low noise design'
    ],
    certifications: ['UL', 'CSA', 'DOE 2016'],
    price: 3200
  },

  // UPS Systems
  'eaton-9px6k': {
    id: 'eaton-9px6k',
    manufacturer: 'Eaton',
    model: '9PX6K',
    category: 'UPS',
    type: 'Online Double-Conversion',
    capacity: {
      kva: 6,
      kw: 5.4,
      voltage: 240
    },
    specifications: {
      inputVoltage: 240,
      outputVoltage: 240,
      frequency: 60,
      efficiency: 95,
      powerFactor: 0.9,
      thd: 3
    },
    protection: {
      surgeProtection: true
    },
    physical: {
      width: 17,
      height: 17,
      depth: 26,
      weight: 185,
      mounting: 'Rack',
      nema: '1'
    },
    features: [
      'Double conversion',
      'Hot-swappable batteries',
      'Network card included',
      'LCD display',
      'Energy Star certified',
      'ABM technology',
      'Load segments'
    ],
    certifications: ['UL', 'CSA', 'Energy Star'],
    price: 4800,
    runtime: {
      halfLoad: 18,
      fullLoad: 7
    }
  },
  'apc-symmetra-lx': {
    id: 'apc-symmetra-lx',
    manufacturer: 'APC',
    model: 'Symmetra LX 16kVA',
    category: 'UPS',
    type: 'Modular UPS',
    capacity: {
      kva: 16,
      kw: 16,
      voltage: 240,
      phases: 3
    },
    specifications: {
      inputVoltage: 240,
      outputVoltage: 240,
      frequency: 60,
      efficiency: 96,
      powerFactor: 1.0
    },
    protection: {
      surgeProtection: true,
      shortCircuit: 25000
    },
    physical: {
      width: 19,
      height: 74,
      depth: 30,
      weight: 950,
      mounting: 'Floor'
    },
    features: [
      'N+1 redundancy',
      'Scalable runtime',
      'Hot-swappable everything',
      'Predictive failure',
      'Network management',
      'Maintenance bypass',
      'Power modules'
    ],
    certifications: ['UL', 'CSA', 'CE'],
    price: 28000,
    runtime: {
      halfLoad: 34,
      fullLoad: 13
    }
  },

  // Power Meters
  'accuenergy-acuvim-ii': {
    id: 'accuenergy-acuvim-ii',
    manufacturer: 'AccuEnergy',
    model: 'AcuVIM II',
    category: 'Meter',
    type: 'Multi-function Meter',
    capacity: {
      voltage: 600,
      amperage: 5000,
      phases: 3
    },
    specifications: {
      frequency: 60,
      powerFactor: 1.0
    },
    physical: {
      width: 4,
      height: 4,
      depth: 3,
      weight: 1,
      mounting: 'Surface'
    },
    features: [
      'Revenue grade accuracy',
      'Modbus RTU/TCP',
      'Data logging',
      'Harmonics analysis',
      'Demand tracking',
      'Web interface',
      'Multi-tariff'
    ],
    certifications: ['ANSI C12.20', 'IEC 62053-22'],
    price: 850
  },

  // Safety Disconnects
  'square-d-hu364': {
    id: 'square-d-hu364',
    manufacturer: 'Square D',
    model: 'HU364',
    category: 'Disconnect',
    type: 'Safety Switch',
    capacity: {
      voltage: 600,
      amperage: 200,
      phases: 3
    },
    specifications: {
      frequency: 60
    },
    protection: {
      shortCircuit: 200000
    },
    physical: {
      width: 14,
      height: 24,
      depth: 8,
      weight: 45,
      mounting: 'Surface',
      nema: '3R'
    },
    features: [
      'Heavy duty rated',
      'Visible blades',
      'Lockable handle',
      'Arc flash reduction',
      'Quick-make/quick-break',
      'Defeatable interlock'
    ],
    certifications: ['UL 98', 'CSA', 'NEMA KS-1'],
    price: 650
  }
};

// Helper functions for electrical calculations
export function calculateElectricalLoad(
  fixtures: number,
  fixtureWattage: number,
  hvacLoad: number, // watts
  otherLoads: number = 0,
  powerFactor: number = 0.9
): {
  totalLoad: number; // watts
  totalAmps: number; // at 240V
  recommended3PhaseAmps: number;
  requiredCircuits: number;
  demandFactor: number;
} {
  const lightingLoad = fixtures * fixtureWattage;
  const totalConnectedLoad = lightingLoad + hvacLoad + otherLoads;
  
  // Apply demand factors per NEC
  const demandFactor = totalConnectedLoad > 100000 ? 0.85 : 0.9;
  const totalLoad = totalConnectedLoad * demandFactor;
  
  // Calculate amperage
  const totalAmps = totalLoad / (240 * powerFactor);
  const recommended3PhaseAmps = totalLoad / (480 * Math.sqrt(3) * powerFactor);
  
  // Circuit requirements (80% continuous load rule)
  const requiredCircuits = Math.ceil(totalAmps / (20 * 0.8));
  
  return {
    totalLoad,
    totalAmps,
    recommended3PhaseAmps,
    requiredCircuits,
    demandFactor
  };
}

export function recommendElectricalInfrastructure(
  totalLoad: number,
  phases: 1 | 3 = 3,
  backupRequired: boolean = true,
  redundancy: boolean = false
): {
  panel: ElectricalEquipment | null;
  pdus: ElectricalEquipment[];
  generator: ElectricalEquipment | null;
  ups: ElectricalEquipment | null;
  notes: string[];
} {
  const recommendations: any = {
    panel: null,
    pdus: [],
    generator: null,
    ups: null,
    notes: []
  };
  
  // Calculate required amperage with 25% safety margin
  const voltage = phases === 3 ? 480 : 240;
  const requiredAmps = (totalLoad * 1.25) / (voltage * (phases === 3 ? Math.sqrt(3) : 1));
  
  // Select panel
  const panels = Object.values(electricalDatabase).filter(
    item => item.category === 'Panel' && 
            item.capacity.amperage! >= requiredAmps &&
            item.capacity.phases === phases
  );
  
  if (panels.length > 0) {
    recommendations.panel = panels.sort((a, b) => a.capacity.amperage! - b.capacity.amperage!)[0];
  }
  
  // Select PDUs for distribution
  const pduCount = Math.ceil(totalLoad / 50000); // 50kW per PDU max
  const pdus = Object.values(electricalDatabase)
    .filter(item => item.category === 'PDU' && item.capacity.phases === phases)
    .sort((a, b) => (b.price || 0) - (a.price || 0));
  
  recommendations.pdus = pdus.slice(0, pduCount);
  
  // Backup power
  if (backupRequired) {
    const generators = Object.values(electricalDatabase).filter(
      item => item.category === 'Generator' && 
              item.capacity.kw! >= totalLoad / 1000
    );
    
    if (generators.length > 0) {
      recommendations.generator = generators[0];
      recommendations.notes.push('Generator sized for full facility backup');
    }
    
    // UPS for critical loads (10% of total)
    const criticalLoad = totalLoad * 0.1;
    const upsSystems = Object.values(electricalDatabase).filter(
      item => item.category === 'UPS' && 
              item.capacity.kw! >= criticalLoad / 1000
    );
    
    if (upsSystems.length > 0) {
      recommendations.ups = upsSystems[0];
      recommendations.notes.push('UPS sized for critical controls and emergency lighting');
    }
  }
  
  // Additional recommendations
  if (requiredAmps > 600) {
    recommendations.notes.push('Consider multiple panels for load distribution');
  }
  
  if (redundancy) {
    recommendations.notes.push('N+1 redundancy recommended for critical systems');
  }
  
  return recommendations;
}