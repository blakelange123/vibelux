// Commercial dehumidifier database for controlled environment agriculture
// Based on industry-leading manufacturers and models

export interface DehumidifierModel {
  id: string;
  manufacturer: string;
  model: string;
  category: 'Portable' | 'Ducted' | 'Desiccant' | 'Split';
  capacity: {
    pintsPerDay: number; // @ 80°F, 60% RH (AHAM standard)
    litersPerDay?: number;
    grainsPer24Hr?: number;
  };
  coverage: {
    sqft: number;
    cuft?: number;
    plantCount?: number; // Estimated based on transpiration
  };
  power: {
    watts: number;
    voltage: number;
    phase: 1 | 3;
    amps: number;
  };
  efficiency: {
    pintsPerKwh: number;
    cop?: number; // Coefficient of Performance
  };
  physical: {
    width: number; // inches
    depth: number;
    height: number;
    weight: number; // lbs
    refrigerant?: string;
  };
  features: string[];
  price?: number;
  specSheet?: string;
}

export const dehumidifierCategories = {
  Portable: {
    name: 'Portable Units',
    description: 'Standalone units for smaller rooms or supplemental dehumidification',
    icon: 'box'
  },
  Ducted: {
    name: 'Ducted Systems',
    description: 'Integrated with HVAC for whole-facility dehumidification',
    icon: 'wind'
  },
  Desiccant: {
    name: 'Desiccant Dehumidifiers',
    description: 'Low-temperature operation, ideal for drying rooms',
    icon: 'droplet-off'
  },
  Split: {
    name: 'Split Systems',
    description: 'Remote condenser units for indoor growing',
    icon: 'split'
  }
};

export const dehumidifierDatabase: Record<string, DehumidifierModel> = {
  // Quest - Industry leader for cannabis cultivation
  'quest-506': {
    id: 'quest-506',
    manufacturer: 'Quest',
    model: '506',
    category: 'Portable',
    capacity: {
      pintsPerDay: 506,
      litersPerDay: 239,
      grainsPer24Hr: 64768
    },
    coverage: {
      sqft: 8000,
      cuft: 64000,
      plantCount: 400 // Flowering cannabis plants
    },
    power: {
      watts: 6800,
      voltage: 240,
      phase: 1,
      amps: 28.3
    },
    efficiency: {
      pintsPerKwh: 3.1,
      cop: 2.85
    },
    physical: {
      width: 29,
      depth: 47,
      height: 48,
      weight: 340,
      refrigerant: 'R410A'
    },
    features: [
      'MERV 11 filtration',
      'Digital humidistat',
      'Auto-restart',
      'Condensate pump included',
      'Ducting collars',
      'Made in USA'
    ],
    price: 6500
  },
  'quest-335': {
    id: 'quest-335',
    manufacturer: 'Quest',
    model: '335',
    category: 'Portable',
    capacity: {
      pintsPerDay: 335,
      litersPerDay: 158
    },
    coverage: {
      sqft: 5500,
      cuft: 44000,
      plantCount: 275
    },
    power: {
      watts: 4300,
      voltage: 240,
      phase: 1,
      amps: 17.9
    },
    efficiency: {
      pintsPerKwh: 3.3
    },
    physical: {
      width: 25,
      depth: 37,
      height: 44,
      weight: 260
    },
    features: [
      'MERV 11 filtration',
      'Digital controls',
      'Automatic defrost',
      'External condensate pump',
      'Stackable design'
    ],
    price: 4800
  },
  'quest-225': {
    id: 'quest-225',
    manufacturer: 'Quest',
    model: '225',
    category: 'Portable',
    capacity: {
      pintsPerDay: 225,
      litersPerDay: 106
    },
    coverage: {
      sqft: 3500,
      cuft: 28000,
      plantCount: 175
    },
    power: {
      watts: 2650,
      voltage: 240,
      phase: 1,
      amps: 11
    },
    efficiency: {
      pintsPerKwh: 3.5
    },
    physical: {
      width: 23,
      depth: 30,
      height: 41,
      weight: 195
    },
    features: [
      'Plug-and-play operation',
      'MERV 11 filter',
      'Epoxy coated coils',
      'Quiet operation',
      'Horizontal or vertical discharge'
    ],
    price: 3200
  },

  // Anden (by Aprilaire) - Premium efficiency
  'anden-a710v': {
    id: 'anden-a710v',
    manufacturer: 'Anden',
    model: 'A710V',
    category: 'Ducted',
    capacity: {
      pintsPerDay: 710,
      litersPerDay: 335
    },
    coverage: {
      sqft: 11000,
      cuft: 88000,
      plantCount: 550
    },
    power: {
      watts: 8150,
      voltage: 240,
      phase: 1,
      amps: 34
    },
    efficiency: {
      pintsPerKwh: 4.3,
      cop: 3.2
    },
    physical: {
      width: 29,
      depth: 57,
      height: 44,
      weight: 380,
      refrigerant: 'R410A'
    },
    features: [
      'Variable speed compressor',
      'MERV 13 filtration',
      'Integrated controls',
      'Remote monitoring capable',
      'Corrosion resistant',
      'Industry-leading efficiency'
    ],
    price: 8900
  },
  'anden-a320v': {
    id: 'anden-a320v',
    manufacturer: 'Anden',
    model: 'A320V',
    category: 'Ducted',
    capacity: {
      pintsPerDay: 320,
      litersPerDay: 151
    },
    coverage: {
      sqft: 5000,
      cuft: 40000,
      plantCount: 250
    },
    power: {
      watts: 3700,
      voltage: 240,
      phase: 1,
      amps: 15.4
    },
    efficiency: {
      pintsPerKwh: 4.1
    },
    physical: {
      width: 21,
      depth: 48,
      height: 36,
      weight: 245
    },
    features: [
      'Variable capacity',
      'Ducted installation',
      'MERV 13 filter',
      'Integrated humidistat',
      'Quiet operation'
    ],
    price: 5200
  },

  // DriEaz - Industrial strength
  'drieaz-lgr7000': {
    id: 'drieaz-lgr7000',
    manufacturer: 'Dri-Eaz',
    model: 'LGR 7000XLi',
    category: 'Portable',
    capacity: {
      pintsPerDay: 235,
      litersPerDay: 111
    },
    coverage: {
      sqft: 3600,
      cuft: 28800,
      plantCount: 180
    },
    power: {
      watts: 2400,
      voltage: 115,
      phase: 1,
      amps: 11.5
    },
    efficiency: {
      pintsPerKwh: 4.0
    },
    physical: {
      width: 20,
      depth: 33,
      height: 36,
      weight: 155
    },
    features: [
      'Low grain refrigerant',
      'Automatic pump-out',
      'Hour meter',
      'Ring air design',
      'Rugged construction'
    ],
    price: 2800
  },

  // Ideal-Air - Budget-friendly options
  'ideal-air-700860': {
    id: 'ideal-air-700860',
    manufacturer: 'Ideal-Air',
    model: '700860',
    category: 'Portable',
    capacity: {
      pintsPerDay: 180,
      litersPerDay: 85
    },
    coverage: {
      sqft: 2800,
      cuft: 22400,
      plantCount: 140
    },
    power: {
      watts: 1900,
      voltage: 115,
      phase: 1,
      amps: 8.7
    },
    efficiency: {
      pintsPerKwh: 2.3
    },
    physical: {
      width: 19,
      depth: 25,
      height: 35,
      weight: 125
    },
    features: [
      'Digital display',
      'Auto-restart',
      'Washable filter',
      'Continuous drain',
      'Budget-friendly'
    ],
    price: 1500
  },

  // Desiccant options for drying rooms
  'munters-mg90': {
    id: 'munters-mg90',
    manufacturer: 'Munters',
    model: 'MG90',
    category: 'Desiccant',
    capacity: {
      pintsPerDay: 190, // @ 60°F, 60% RH
      litersPerDay: 90
    },
    coverage: {
      sqft: 3000,
      cuft: 24000,
      plantCount: 0 // Primarily for drying
    },
    power: {
      watts: 2100,
      voltage: 115,
      phase: 1,
      amps: 18.3
    },
    efficiency: {
      pintsPerKwh: 2.2
    },
    physical: {
      width: 16,
      depth: 24,
      height: 29,
      weight: 97
    },
    features: [
      'Works in cold conditions',
      'No compressor',
      'Continuous operation',
      'Ideal for drying rooms',
      'Low temperature performance'
    ],
    price: 2200
  },

  // Split system for sealed rooms
  'quest-dual-506-split': {
    id: 'quest-dual-506-split',
    manufacturer: 'Quest',
    model: 'Dual 506 Split',
    category: 'Split',
    capacity: {
      pintsPerDay: 506,
      litersPerDay: 239
    },
    coverage: {
      sqft: 8000,
      cuft: 64000,
      plantCount: 400
    },
    power: {
      watts: 6800,
      voltage: 240,
      phase: 1,
      amps: 28.3
    },
    efficiency: {
      pintsPerKwh: 3.1
    },
    physical: {
      width: 30,
      depth: 48,
      height: 50,
      weight: 380,
      refrigerant: 'R410A'
    },
    features: [
      'Remote condenser',
      'Sealed room compatible',
      'No heat added to room',
      'Quiet indoor operation',
      'Premium efficiency'
    ],
    price: 8500
  }
};

// Helper functions for dehumidifier calculations
export function calculateRequiredCapacity(
  roomVolume: number, // cubic feet
  plantCount: number,
  plantStage: 'clone' | 'veg' | 'flower',
  targetRH: number = 50
): number {
  // Transpiration rates per plant per day (gallons)
  const transpirationRates = {
    clone: 0.05,
    veg: 0.25,
    flower: 0.5
  };
  
  // Calculate daily moisture load from plants (convert gallons to pints)
  const plantMoisture = plantCount * transpirationRates[plantStage] * 8;
  
  // Add infiltration and other loads (approximately 20% of plant load)
  const totalMoisture = plantMoisture * 1.2;
  
  // Add safety factor
  return Math.ceil(totalMoisture * 1.25);
}

export function calculateEnergyUsage(
  dehumidifier: DehumidifierModel,
  hoursPerDay: number = 12
): {
  dailyKwh: number;
  monthlyCost: number; // at $0.12/kWh
  yearlyMoisture: number; // gallons removed
} {
  const dailyKwh = (dehumidifier.power.watts / 1000) * hoursPerDay;
  const monthlyCost = dailyKwh * 30 * 0.12;
  const yearlyMoisture = (dehumidifier.capacity.pintsPerDay / 8) * 365 * (hoursPerDay / 24);
  
  return {
    dailyKwh,
    monthlyCost,
    yearlyMoisture
  };
}

export function recommendDehumidifiers(
  roomWidth: number,
  roomLength: number,
  roomHeight: number,
  plantCount: number,
  plantStage: 'clone' | 'veg' | 'flower' = 'flower'
): DehumidifierModel[] {
  const roomVolume = roomWidth * roomLength * roomHeight;
  const requiredCapacity = calculateRequiredCapacity(roomVolume, plantCount, plantStage);
  
  // Filter and sort by suitability
  return Object.values(dehumidifierDatabase)
    .filter(unit => unit.capacity.pintsPerDay >= requiredCapacity * 0.8)
    .sort((a, b) => {
      // Prioritize efficiency and appropriate sizing
      const aScore = a.efficiency.pintsPerKwh * (1 - Math.abs(a.capacity.pintsPerDay - requiredCapacity) / requiredCapacity);
      const bScore = b.efficiency.pintsPerKwh * (1 - Math.abs(b.capacity.pintsPerDay - requiredCapacity) / requiredCapacity);
      return bScore - aScore;
    })
    .slice(0, 5);
}