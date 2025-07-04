// Comprehensive fan database for horticultural facilities
// Based on industry-standard HVAC equipment

export interface FanModel {
  id: string;
  manufacturer: string;
  model: string;
  category: 'VAF' | 'HAF' | 'Exhaust' | 'Intake' | 'Inline' | 'Jet';
  airflow: {
    cfm: number;
    m3h?: number;
    velocity?: number; // ft/min at outlet
  };
  power: {
    watts: number;
    voltage: number;
    phase: 1 | 3;
    amps?: number;
  };
  physical: {
    diameter: number; // inches
    depth?: number; // inches
    weight?: number; // lbs
    mountType: 'ceiling' | 'wall' | 'floor' | 'inline' | 'pedestal';
  };
  performance: {
    staticPressure?: number; // inches water column
    efficiency?: number; // CFM/Watt
    noiseLevel?: number; // dB
    throwDistance?: number; // feet
  };
  features: string[];
  price?: number;
  image?: string;
  specSheet?: string;
}

export interface FanCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  typicalUse: string[];
}

export const fanCategories: Record<string, FanCategory> = {
  VAF: {
    id: 'VAF',
    name: 'Vertical Air Flow (VAF)',
    description: 'Ceiling-mounted fans that push air down through the canopy',
    icon: 'arrow-down',
    typicalUse: ['Cannabis cultivation', 'Vertical farms', 'Greenhouses']
  },
  HAF: {
    id: 'HAF', 
    name: 'Horizontal Air Flow (HAF)',
    description: 'Wall-mounted fans that create horizontal air circulation',
    icon: 'arrow-right',
    typicalUse: ['Greenhouses', 'Large grow rooms', 'Drying rooms']
  },
  Exhaust: {
    id: 'Exhaust',
    name: 'Exhaust Fans',
    description: 'High-volume fans for removing hot, humid air',
    icon: 'arrow-up-right',
    typicalUse: ['Climate control', 'Odor management', 'Heat removal']
  },
  Intake: {
    id: 'Intake',
    name: 'Intake Fans',
    description: 'Filtered fans for bringing in fresh air',
    icon: 'arrow-down-left',
    typicalUse: ['CO2 replenishment', 'Positive pressure', 'Fresh air exchange']
  },
  Inline: {
    id: 'Inline',
    name: 'Inline Duct Fans',
    description: 'In-duct fans for boosting airflow in ventilation systems',
    icon: 'tube',
    typicalUse: ['Duct boosting', 'Carbon filter systems', 'Multi-room distribution']
  },
  Jet: {
    id: 'Jet',
    name: 'Jet Fans',
    description: 'High-velocity fans for long-throw air movement',
    icon: 'zap',
    typicalUse: ['Large facilities', 'Air destratification', 'Spot cooling']
  }
};

export const fanDatabase: Record<string, FanModel> = {
  // VAF Fans - Critical for cannabis and vertical farming
  'quest-vaf-12': {
    id: 'quest-vaf-12',
    manufacturer: 'Quest',
    model: 'VAF-12',
    category: 'VAF',
    airflow: {
      cfm: 850,
      m3h: 1445,
      velocity: 680
    },
    power: {
      watts: 45,
      voltage: 120,
      phase: 1,
      amps: 0.4
    },
    physical: {
      diameter: 12,
      depth: 8,
      weight: 15,
      mountType: 'ceiling'
    },
    performance: {
      efficiency: 18.9,
      noiseLevel: 52,
      throwDistance: 20
    },
    features: ['Variable speed', 'EC motor', 'Daisy-chainable', 'IP65 rated'],
    price: 325
  },
  'quest-vaf-16': {
    id: 'quest-vaf-16',
    manufacturer: 'Quest',
    model: 'VAF-16',
    category: 'VAF',
    airflow: {
      cfm: 1350,
      m3h: 2295,
      velocity: 750
    },
    power: {
      watts: 68,
      voltage: 120,
      phase: 1,
      amps: 0.6
    },
    physical: {
      diameter: 16,
      depth: 10,
      weight: 22,
      mountType: 'ceiling'
    },
    performance: {
      efficiency: 19.9,
      noiseLevel: 58,
      throwDistance: 30
    },
    features: ['Variable speed', 'EC motor', 'Daisy-chainable', 'IP65 rated', 'Remote control'],
    price: 425
  },
  'jd-manufacturing-vaf-20': {
    id: 'jd-manufacturing-vaf-20',
    manufacturer: 'J&D Manufacturing',
    model: 'VDB20',
    category: 'VAF',
    airflow: {
      cfm: 3200,
      m3h: 5440,
      velocity: 900
    },
    power: {
      watts: 140,
      voltage: 120,
      phase: 1,
      amps: 1.2
    },
    physical: {
      diameter: 20,
      depth: 12,
      weight: 35,
      mountType: 'ceiling'
    },
    performance: {
      efficiency: 22.9,
      noiseLevel: 65,
      throwDistance: 45
    },
    features: ['Direct drive', 'Aluminum blades', 'Moisture resistant'],
    price: 550
  },

  // HAF Fans - Essential for greenhouse circulation
  'jd-manufacturing-haf-24': {
    id: 'jd-manufacturing-haf-24',
    manufacturer: 'J&D Manufacturing',
    model: 'POW24',
    category: 'HAF',
    airflow: {
      cfm: 7850,
      m3h: 13345,
      velocity: 1100
    },
    power: {
      watts: 295,
      voltage: 120,
      phase: 1,
      amps: 2.5
    },
    physical: {
      diameter: 24,
      depth: 14,
      weight: 45,
      mountType: 'wall'
    },
    performance: {
      efficiency: 26.6,
      noiseLevel: 72,
      throwDistance: 120
    },
    features: ['Powder coated', 'OSHA guards', 'Ball bearing motor', '5-year warranty'],
    price: 650
  },
  'schaefer-haf-20': {
    id: 'schaefer-haf-20',
    manufacturer: 'Schaefer',
    model: 'F5 HAF',
    category: 'HAF',
    airflow: {
      cfm: 5400,
      m3h: 9180,
      velocity: 950
    },
    power: {
      watts: 180,
      voltage: 120,
      phase: 1,
      amps: 1.5
    },
    physical: {
      diameter: 20,
      depth: 12,
      weight: 38,
      mountType: 'wall'
    },
    performance: {
      efficiency: 30,
      noiseLevel: 68,
      throwDistance: 100
    },
    features: ['Fiberglass housing', 'Stainless hardware', 'Variable pitch blades'],
    price: 525
  },

  // Exhaust Fans - Climate control workhorses
  'vostermans-v-flo-50': {
    id: 'vostermans-v-flo-50',
    manufacturer: 'Vostermans',
    model: 'V-Flo 50',
    category: 'Exhaust',
    airflow: {
      cfm: 23500,
      m3h: 39950
    },
    power: {
      watts: 1100,
      voltage: 230,
      phase: 1,
      amps: 4.8
    },
    physical: {
      diameter: 50,
      depth: 24,
      weight: 110,
      mountType: 'wall'
    },
    performance: {
      staticPressure: 0.2,
      efficiency: 21.4,
      noiseLevel: 78
    },
    features: ['Butterfly shutters', 'Galvanized housing', 'Direct drive', 'VFD compatible'],
    price: 1850
  },
  'canfan-max-12': {
    id: 'canfan-max-12',
    manufacturer: 'Can-Fan',
    model: 'Max-Fan 12"',
    category: 'Inline',
    airflow: {
      cfm: 1709,
      m3h: 2905
    },
    power: {
      watts: 205,
      voltage: 120,
      phase: 1,
      amps: 1.7
    },
    physical: {
      diameter: 12,
      depth: 16,
      weight: 22,
      mountType: 'inline'
    },
    performance: {
      staticPressure: 2.1,
      efficiency: 8.3,
      noiseLevel: 62
    },
    features: ['Mixed flow design', 'Speed controllable', 'Lightweight composite'],
    price: 425
  },
  'hyperfan-10': {
    id: 'hyperfan-10',
    manufacturer: 'Hyper Fan',
    model: 'Stealth 10"',
    category: 'Inline',
    airflow: {
      cfm: 1065,
      m3h: 1810
    },
    power: {
      watts: 115,
      voltage: 120,
      phase: 1,
      amps: 0.96
    },
    physical: {
      diameter: 10,
      depth: 14,
      weight: 18,
      mountType: 'inline'
    },
    performance: {
      staticPressure: 1.8,
      efficiency: 9.3,
      noiseLevel: 49
    },
    features: ['EC motor', 'PWM speed control', 'Acoustic foam lining', 'Digital controller included'],
    price: 389
  },

  // Jet Fans - For large facilities
  'multifan-jetfan-50': {
    id: 'multifan-jetfan-50',
    manufacturer: 'Multifan',
    model: 'JetFan 130',
    category: 'Jet',
    airflow: {
      cfm: 35000,
      m3h: 59500,
      velocity: 3200
    },
    power: {
      watts: 750,
      voltage: 230,
      phase: 3,
      amps: 3.3
    },
    physical: {
      diameter: 50,
      depth: 30,
      weight: 145,
      mountType: 'ceiling'
    },
    performance: {
      efficiency: 46.7,
      noiseLevel: 75,
      throwDistance: 200
    },
    features: ['Conical design', 'Anti-vibration mounts', 'Corrosion resistant', 'IoT enabled'],
    price: 3200
  }
};

// Helper functions for fan calculations
export function calculateAirChangesPerHour(roomVolume: number, totalCFM: number): number {
  return (totalCFM * 60) / roomVolume;
}

export function calculateRequiredCFM(
  roomVolume: number, 
  targetACH: number = 20 // 20-30 ACH typical for grow rooms
): number {
  return (roomVolume * targetACH) / 60;
}

export function calculateFanCoverage(fan: FanModel, roomArea: number): number {
  // Rough estimate based on fan type and throw distance
  const coverageFactors = {
    VAF: 400, // sq ft per fan
    HAF: 2000, // sq ft per fan
    Exhaust: 0, // Not for coverage
    Intake: 0,
    Inline: 0,
    Jet: 5000 // sq ft per fan
  };
  
  const baseCoverage = coverageFactors[fan.category] || 0;
  return baseCoverage * (fan.performance?.efficiency || 20) / 20;
}

export function recommendFanConfiguration(
  roomWidth: number,
  roomLength: number,
  roomHeight: number,
  plantCount?: number
): {
  vafFans: number;
  hafFans: number;
  exhaustCFM: number;
  intakeCFM: number;
} {
  const roomArea = roomWidth * roomLength;
  const roomVolume = roomArea * roomHeight;
  
  // VAF fans - 1 per 400 sq ft for cannabis, less for other crops
  const vafFans = Math.ceil(roomArea / 400);
  
  // HAF fans - 1 per 2000 sq ft, minimum 2 for circulation pattern
  const hafFans = Math.max(2, Math.ceil(roomArea / 2000));
  
  // Exhaust - 20-30 air changes per hour
  const exhaustCFM = calculateRequiredCFM(roomVolume, 25);
  
  // Intake - 80-90% of exhaust for negative pressure
  const intakeCFM = exhaustCFM * 0.85;
  
  return {
    vafFans,
    hafFans,
    exhaustCFM,
    intakeCFM
  };
}