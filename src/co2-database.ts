// CO2 supplementation equipment database for controlled environment agriculture
// Based on industry-standard CO2 generators, tanks, and monitoring systems

export interface CO2System {
  id: string;
  manufacturer: string;
  model: string;
  category: 'Generator' | 'Tank' | 'Controller' | 'Monitor' | 'Regulator';
  type?: 'Natural Gas' | 'Propane' | 'Liquid CO2' | 'Compressed CO2';
  capacity: {
    output?: number; // cu ft/hr for generators, lbs for tanks
    btu?: number; // BTU/hr for generators
    coverage?: number; // cubic feet
  };
  power?: {
    watts?: number;
    voltage?: number;
    gasConnection?: string; // For generators
  };
  physical: {
    width: number; // inches
    height: number;
    depth: number;
    weight: number; // lbs
  };
  features: string[];
  safety: string[];
  price?: number;
  consumables?: {
    type: string;
    consumption: string;
    costPerUnit?: number;
  };
}

export const co2Categories = {
  Generator: {
    name: 'CO2 Generators',
    description: 'Burn natural gas or propane to produce CO2',
    icon: 'flame',
    pros: ['Low operating cost', 'High output', 'No tanks needed'],
    cons: ['Produces heat & humidity', 'Requires gas line', 'Safety concerns']
  },
  Tank: {
    name: 'CO2 Tanks',
    description: 'Compressed or liquid CO2 storage',
    icon: 'cylinder',
    pros: ['No heat/humidity', 'Precise control', 'Clean'],
    cons: ['Higher operating cost', 'Tank refills needed', 'Storage space']
  },
  Controller: {
    name: 'Controllers',
    description: 'Automated CO2 injection control',
    icon: 'cpu',
    pros: ['Maintains PPM setpoint', 'Data logging', 'Integration'],
    cons: ['Requires sensor', 'Setup complexity']
  },
  Monitor: {
    name: 'Monitors & Sensors',
    description: 'CO2 level monitoring and safety',
    icon: 'gauge',
    pros: ['Real-time monitoring', 'Safety alarms', 'Data logging'],
    cons: ['Calibration needed', 'Sensor replacement']
  },
  Regulator: {
    name: 'Regulators & Valves',
    description: 'Flow control for tank systems',
    icon: 'valve',
    pros: ['Precise flow control', 'Safety features'],
    cons: ['Tank system only']
  }
};

export const co2Database: Record<string, CO2System> = {
  // CO2 Generators - Natural Gas
  'titan-ares-24': {
    id: 'titan-ares-24',
    manufacturer: 'Titan Controls',
    model: 'Ares 24 NG',
    category: 'Generator',
    type: 'Natural Gas',
    capacity: {
      output: 59, // cu ft/hr
      btu: 59500,
      coverage: 15000 // cu ft room
    },
    power: {
      gasConnection: '3/4" NPT'
    },
    physical: {
      width: 18,
      height: 22,
      depth: 18,
      weight: 55
    },
    features: [
      '24 burner brass burner',
      'Electronic ignition',
      'Tip-over safety switch',
      'Solenoid valve included',
      'Wall mountable',
      'Low NOx emissions'
    ],
    safety: [
      'Tip-over switch',
      'High temp shutoff',
      'Safety pilot',
      'CSA certified'
    ],
    price: 650,
    consumables: {
      type: 'Natural gas',
      consumption: '59,500 BTU/hr',
      costPerUnit: 0.01 // per cubic foot
    }
  },
  'autopilot-apcg8lp': {
    id: 'autopilot-apcg8lp',
    manufacturer: 'Autopilot',
    model: 'APCG8LP',
    category: 'Generator',
    type: 'Propane',
    capacity: {
      output: 22, // cu ft/hr  
      btu: 22000,
      coverage: 5500
    },
    power: {
      gasConnection: 'Propane regulator'
    },
    physical: {
      width: 14,
      height: 18,
      depth: 14,
      weight: 35
    },
    features: [
      '8 burner design',
      'Electronic ignition',
      'Powder coated steel',
      'Includes regulator & hose',
      'Ceiling mountable'
    ],
    safety: [
      'Tip-over protection',
      'Flame safety valve',
      'ETL listed'
    ],
    price: 420,
    consumables: {
      type: 'Propane',
      consumption: '1 lb/hr at full',
      costPerUnit: 3.00 // per gallon
    }
  },

  // CO2 Tanks
  'co2-tank-50lb': {
    id: 'co2-tank-50lb',
    manufacturer: 'Generic',
    model: '50lb Aluminum',
    category: 'Tank',
    type: 'Compressed CO2',
    capacity: {
      output: 50, // lbs
      coverage: 2000 // cu ft per fill
    },
    physical: {
      width: 8,
      height: 48,
      depth: 8,
      weight: 35 // empty
    },
    features: [
      'Aluminum construction',
      'CGA-320 valve',
      'DOT certified',
      'Siphon tube option',
      'Carrying handle'
    ],
    safety: [
      'Pressure relief valve',
      'DOT/TC certified',
      'Hydro test required'
    ],
    price: 250,
    consumables: {
      type: 'CO2 refill',
      consumption: '50 lbs per fill',
      costPerUnit: 30 // per refill
    }
  },
  'co2-tank-20lb': {
    id: 'co2-tank-20lb',
    manufacturer: 'Generic',
    model: '20lb Aluminum',
    category: 'Tank',
    type: 'Compressed CO2',
    capacity: {
      output: 20,
      coverage: 800
    },
    physical: {
      width: 8,
      height: 27,
      depth: 8,
      weight: 20
    },
    features: [
      'Lightweight aluminum',
      'CGA-320 valve',
      'Portable size',
      'Indoor/outdoor use'
    ],
    safety: [
      'Safety relief valve',
      'DOT approved'
    ],
    price: 180,
    consumables: {
      type: 'CO2 refill',
      consumption: '20 lbs per fill',
      costPerUnit: 20
    }
  },

  // CO2 Controllers
  'titan-atlas-3': {
    id: 'titan-atlas-3',
    manufacturer: 'Titan Controls',
    model: 'Atlas 3',
    category: 'Controller',
    capacity: {
      coverage: 20000
    },
    power: {
      watts: 5,
      voltage: 120
    },
    physical: {
      width: 7,
      height: 5,
      depth: 3,
      weight: 2
    },
    features: [
      'Digital CO2 controller',
      'Fuzzy logic control',
      'Photocell day/night',
      'PPM range 0-5000',
      'Remote sensor probe',
      'Generator or tank compatible'
    ],
    safety: [
      'High CO2 alarm',
      'Sensor failure alarm',
      'ETL listed'
    ],
    price: 280
  },
  'autopilot-apc8200': {
    id: 'autopilot-apc8200',
    manufacturer: 'Autopilot',
    model: 'APC8200',
    category: 'Controller',
    capacity: {
      coverage: 15000
    },
    power: {
      watts: 10,
      voltage: 120
    },
    physical: {
      width: 8,
      height: 6,
      depth: 3,
      weight: 3
    },
    features: [
      'Digital display',
      'Dual outlet control',
      'Built-in photocell',
      'Data logging',
      'Min/max memory',
      'Calibration mode'
    ],
    safety: [
      'High/low alarms',
      'Sensor diagnostic'
    ],
    price: 350
  },

  // CO2 Monitors
  'titan-atlas-8': {
    id: 'titan-atlas-8',
    manufacturer: 'Titan Controls',
    model: 'Atlas 8',
    category: 'Monitor',
    capacity: {
      coverage: 10000
    },
    power: {
      watts: 3,
      voltage: 120
    },
    physical: {
      width: 6,
      height: 4,
      depth: 2,
      weight: 1
    },
    features: [
      'Digital CO2 monitor',
      'NDIR sensor',
      '0-10,000 PPM range',
      'Min/max recording',
      'Calibration reminder',
      'Wall mountable'
    ],
    safety: [
      'Self-diagnostic',
      'Sensor life indicator'
    ],
    price: 180
  },
  'co2meter-rah-50d': {
    id: 'co2meter-rah-50d',
    manufacturer: 'CO2Meter',
    model: 'RAH-50D',
    category: 'Monitor',
    capacity: {
      coverage: 5000
    },
    power: {
      watts: 2,
      voltage: 120
    },
    physical: {
      width: 4,
      height: 3,
      depth: 1,
      weight: 0.5
    },
    features: [
      'Desktop monitor',
      'Real-time display',
      '0-5000 PPM',
      'USB data logging',
      'Audible alarm',
      'Battery backup'
    ],
    safety: [
      'OSHA compliance',
      'Adjustable alarms'
    ],
    price: 220
  },

  // Regulators
  'titan-702-hp': {
    id: 'titan-702-hp',
    manufacturer: 'Titan Controls',
    model: '702-HP',
    category: 'Regulator',
    capacity: {
      output: 50 // CFH max flow
    },
    physical: {
      width: 6,
      height: 8,
      depth: 4,
      weight: 5
    },
    features: [
      'High pressure regulator',
      'Solenoid valve',
      'Flow meter 0-50 CFH',
      'CGA-320 connection',
      'Precision needle valve',
      'Industrial grade'
    ],
    safety: [
      'Pressure relief',
      'Check valve',
      'UL listed solenoid'
    ],
    price: 195
  },
  'grozone-co2r-1': {
    id: 'grozone-co2r-1',
    manufacturer: 'Grozone',
    model: 'CO2R-1',
    category: 'Regulator',
    capacity: {
      output: 15
    },
    physical: {
      width: 5,
      height: 6,
      depth: 3,
      weight: 3
    },
    features: [
      'Single stage regulator',
      'Built-in solenoid',
      'Flow gauge',
      'Barbed fitting',
      'Preset 15 CFH',
      'Plug-and-play'
    ],
    safety: [
      'Safety relief valve',
      'CE certified'
    ],
    price: 125
  }
};

// Helper functions for CO2 calculations
export function calculateCO2Requirement(
  roomVolume: number, // cubic feet
  targetPPM: number = 1200,
  airChangesPerHour: number = 1
): {
  initialCharge: number; // cubic feet
  maintenanceRate: number; // cu ft/hr
} {
  // Initial charge to reach target PPM
  const ambientPPM = 400;
  const ppmIncrease = targetPPM - ambientPPM;
  const initialCharge = (roomVolume * ppmIncrease) / 1000000;
  
  // Maintenance rate to compensate for air exchange
  const maintenanceRate = initialCharge * airChangesPerHour;
  
  return {
    initialCharge,
    maintenanceRate
  };
}

export function calculateGeneratorRuntime(
  generator: CO2System,
  roomVolume: number,
  targetPPM: number = 1200
): {
  chargeTime: number; // minutes
  dutyCycle: number; // percentage
  dailyRuntime: number; // hours
} {
  const requirement = calculateCO2Requirement(roomVolume, targetPPM);
  const chargeTime = (requirement.initialCharge / (generator.capacity.output || 1)) * 60;
  
  // Assuming 12 hour photoperiod, 15 min on/off cycles
  const cyclesPerHour = 2; // Every 30 minutes
  const dutyCycle = (requirement.maintenanceRate / (generator.capacity.output || 1)) * 100;
  const dailyRuntime = 12 * (dutyCycle / 100);
  
  return {
    chargeTime: Math.ceil(chargeTime),
    dutyCycle: Math.min(dutyCycle, 100),
    dailyRuntime
  };
}

export function calculateTankDuration(
  tankSize: number, // lbs
  roomVolume: number,
  targetPPM: number = 1200,
  hoursPerDay: number = 12
): number { // days
  const requirement = calculateCO2Requirement(roomVolume, targetPPM);
  const dailyUsage = requirement.maintenanceRate * hoursPerDay;
  
  // 1 lb CO2 = 8.7 cubic feet
  const tankCapacity = tankSize * 8.7;
  
  return Math.floor(tankCapacity / dailyUsage);
}

export function recommendCO2System(
  roomWidth: number,
  roomLength: number,
  roomHeight: number,
  hasGasLine: boolean = false,
  preferNoHeat: boolean = false
): {
  primary: CO2System;
  alternatives: CO2System[];
  tankSize?: number;
  refillsPerMonth?: number;
} {
  const roomVolume = roomWidth * roomLength * roomHeight;
  const roomArea = roomWidth * roomLength;
  
  let primary: CO2System;
  let alternatives: CO2System[] = [];
  
  // Small rooms < 1000 sq ft - tanks preferred
  if (roomArea < 1000 || preferNoHeat) {
    primary = co2Database['co2-tank-50lb'];
    alternatives = [
      co2Database['co2-tank-20lb'],
      co2Database['autopilot-apcg8lp']
    ];
    
    const tankDuration = calculateTankDuration(50, roomVolume);
    return {
      primary,
      alternatives: alternatives.filter(Boolean),
      tankSize: 50,
      refillsPerMonth: Math.ceil(30 / tankDuration)
    };
  }
  
  // Large rooms with gas - generator preferred
  if (hasGasLine && roomArea > 1000) {
    primary = co2Database['titan-ares-24'];
    alternatives = [
      co2Database['autopilot-apcg8lp'],
      co2Database['co2-tank-50lb']
    ];
  } else {
    // Large rooms without gas - propane generator
    primary = co2Database['autopilot-apcg8lp'];
    alternatives = [
      co2Database['co2-tank-50lb'],
      co2Database['titan-ares-24']
    ];
  }
  
  return {
    primary,
    alternatives: alternatives.filter(Boolean)
  };
}