// HVAC systems database for controlled environment agriculture
// Includes mini-splits, rooftop units, chillers, and heaters

export interface HVACSystem {
  id: string;
  manufacturer: string;
  model: string;
  category: 'MiniSplit' | 'RTU' | 'Chiller' | 'Heater' | 'HeatPump' | 'AHU';
  type: 'Cooling' | 'Heating' | 'Both';
  capacity: {
    cooling?: number; // BTU/hr
    heating?: number; // BTU/hr
    tons?: number; // Cooling tons
    airflow?: number; // CFM
  };
  efficiency: {
    seer?: number; // Cooling efficiency
    eer?: number; // Energy efficiency ratio
    hspf?: number; // Heating efficiency
    cop?: number; // Coefficient of performance
  };
  power: {
    voltage: number;
    phase: 1 | 3;
    mca: number; // Minimum circuit ampacity
    mop: number; // Maximum overcurrent protection
    watts?: number; // Power consumption
  };
  physical: {
    indoor?: { width: number; height: number; depth: number; weight: number };
    outdoor?: { width: number; height: number; depth: number; weight: number };
  };
  features: string[];
  refrigerant: string;
  price?: number;
  coverage?: {
    sqft: number;
    sensibleLoad?: number; // BTU/hr
    latentLoad?: number; // BTU/hr for dehumidification
  };
}

export const hvacCategories = {
  MiniSplit: {
    name: 'Mini-Split Systems',
    description: 'Ductless split systems ideal for grow rooms',
    icon: 'split',
    pros: ['Zone control', 'Energy efficient', 'Quiet operation'],
    cons: ['Limited coverage per unit', 'Multiple units needed']
  },
  RTU: {
    name: 'Rooftop Units',
    description: 'Packaged rooftop units for larger facilities',
    icon: 'building',
    pros: ['High capacity', 'All-in-one', 'Fresh air capable'],
    cons: ['Roof penetration', 'Higher install cost']
  },
  Chiller: {
    name: 'Chilled Water',
    description: 'Central chilled water systems for large facilities',
    icon: 'snowflake',
    pros: ['Scalable', 'Efficient for large loads', 'Precise control'],
    cons: ['Complex installation', 'High upfront cost']
  },
  Heater: {
    name: 'Heaters',
    description: 'Supplemental heating for cold climates',
    icon: 'flame',
    pros: ['Quick heat', 'Lower cost', 'Simple install'],
    cons: ['No cooling', 'Less efficient']
  },
  HeatPump: {
    name: 'Heat Pumps',
    description: 'Efficient heating and cooling',
    icon: 'arrows',
    pros: ['Year-round use', 'Energy efficient', 'Dehumidification'],
    cons: ['Performance drops in extreme cold']
  },
  AHU: {
    name: 'Air Handlers',
    description: 'Air handling units for ducted systems',
    icon: 'fan',
    pros: ['Flexible configuration', 'Good filtration', 'Fresh air mixing'],
    cons: ['Requires ductwork', 'Space requirements']
  }
};

export const hvacDatabase: Record<string, HVACSystem> = {
  // Mini-Split Systems - Popular for grow rooms
  'mitsubishi-puz-a36nka7': {
    id: 'mitsubishi-puz-a36nka7',
    manufacturer: 'Mitsubishi',
    model: 'PUZ-A36NKA7',
    category: 'MiniSplit',
    type: 'Both',
    capacity: {
      cooling: 36000,
      heating: 40000,
      tons: 3,
      airflow: 1200
    },
    efficiency: {
      seer: 19.2,
      eer: 11.5,
      hspf: 10.6,
      cop: 3.4
    },
    power: {
      voltage: 240,
      phase: 1,
      mca: 21,
      mop: 30,
      watts: 3130
    },
    physical: {
      indoor: { width: 43, height: 13, depth: 10, weight: 35 },
      outdoor: { width: 37, height: 34, depth: 13, weight: 134 }
    },
    features: [
      'Hyper-Heating INVERTER',
      'Works to -13°F',
      'Quiet operation',
      'Advanced filtration',
      'WiFi compatible',
      'Dehumidification mode'
    ],
    refrigerant: 'R410A',
    price: 4500,
    coverage: {
      sqft: 1500,
      sensibleLoad: 30000,
      latentLoad: 6000
    }
  },
  'daikin-rmx36tvju': {
    id: 'daikin-rmx36tvju',
    manufacturer: 'Daikin',
    model: 'RMX36TVJU',
    category: 'MiniSplit',
    type: 'Both',
    capacity: {
      cooling: 36000,
      heating: 36000,
      tons: 3
    },
    efficiency: {
      seer: 17,
      eer: 10.5,
      hspf: 9.5
    },
    power: {
      voltage: 240,
      phase: 1,
      mca: 20,
      mop: 30
    },
    physical: {
      outdoor: { width: 37, height: 33, depth: 13, weight: 146 }
    },
    features: [
      'Multi-zone capable',
      'Variable speed compressor',
      'Intelligent eye sensor',
      'Coated coils',
      'Branch selector compatible'
    ],
    refrigerant: 'R410A',
    price: 3800,
    coverage: {
      sqft: 1400,
      sensibleLoad: 32000
    }
  },
  'lg-lmu540hv': {
    id: 'lg-lmu540hv',
    manufacturer: 'LG',
    model: 'LMU540HV',
    category: 'MiniSplit',
    type: 'Both',
    capacity: {
      cooling: 54000,
      heating: 60000,
      tons: 4.5
    },
    efficiency: {
      seer: 18,
      eer: 10.6,
      hspf: 10
    },
    power: {
      voltage: 240,
      phase: 1,
      mca: 35,
      mop: 45
    },
    physical: {
      outdoor: { width: 39, height: 51, depth: 14, weight: 220 }
    },
    features: [
      'LGRED° heat technology',
      'Works to -22°F',
      'Multi-zone up to 8 indoor units',
      'Smart diagnosis',
      'Gold Fin coating'
    ],
    refrigerant: 'R410A',
    price: 6200,
    coverage: {
      sqft: 2200,
      sensibleLoad: 48000
    }
  },

  // Rooftop Units - For larger facilities
  'carrier-48tc-12': {
    id: 'carrier-48tc-12',
    manufacturer: 'Carrier',
    model: '48TC-D12',
    category: 'RTU',
    type: 'Both',
    capacity: {
      cooling: 140000,
      heating: 150000,
      tons: 12,
      airflow: 4000
    },
    efficiency: {
      seer: 14,
      eer: 11.2,
      cop: 3.2
    },
    power: {
      voltage: 460,
      phase: 3,
      mca: 42,
      mop: 50
    },
    physical: {
      outdoor: { width: 88, height: 43, depth: 74, weight: 1450 }
    },
    features: [
      'Economizer ready',
      'VFD compatible',
      'Corrosion resistant cabinet',
      'Low ambient kit available',
      'BAS integration ready'
    ],
    refrigerant: 'R410A',
    price: 18500,
    coverage: {
      sqft: 6000,
      sensibleLoad: 120000
    }
  },
  'trane-voyager-ysc090': {
    id: 'trane-voyager-ysc090',
    manufacturer: 'Trane',
    model: 'Voyager YSC090',
    category: 'RTU',
    type: 'Both',
    capacity: {
      cooling: 90000,
      heating: 110000,
      tons: 7.5,
      airflow: 3000
    },
    efficiency: {
      seer: 15,
      eer: 11.5
    },
    power: {
      voltage: 460,
      phase: 3,
      mca: 28,
      mop: 35
    },
    physical: {
      outdoor: { width: 71, height: 42, depth: 50, weight: 980 }
    },
    features: [
      'Integrated economizer',
      'ReliaTel controls',
      'Variable speed fans',
      'Fault diagnostics',
      'Convertible gas heat'
    ],
    refrigerant: 'R410A',
    price: 14000,
    coverage: {
      sqft: 3750,
      sensibleLoad: 80000
    }
  },

  // Chillers for large operations
  'multistack-ms050': {
    id: 'multistack-ms050',
    manufacturer: 'Multistack',
    model: 'MS050W',
    category: 'Chiller',
    type: 'Cooling',
    capacity: {
      cooling: 600000, // 50 tons
      tons: 50
    },
    efficiency: {
      eer: 12.5,
      cop: 3.7
    },
    power: {
      voltage: 460,
      phase: 3,
      mca: 125,
      mop: 150,
      watts: 48000
    },
    physical: {
      outdoor: { width: 48, height: 78, depth: 96, weight: 3500 }
    },
    features: [
      'Modular design',
      'N+1 redundancy',
      'Variable flow',
      'Free cooling capable',
      'BMS integration',
      'Quiet operation'
    ],
    refrigerant: 'R410A',
    price: 65000,
    coverage: {
      sqft: 20000,
      sensibleLoad: 500000
    }
  },

  // Specialized grow room units
  'surna-vc-60': {
    id: 'surna-vc-60',
    manufacturer: 'Surna',
    model: 'Venti-Cool 60',
    category: 'AHU',
    type: 'Both',
    capacity: {
      cooling: 60000,
      heating: 45000,
      tons: 5,
      airflow: 2000
    },
    efficiency: {
      seer: 16,
      cop: 3.5
    },
    power: {
      voltage: 240,
      phase: 3,
      mca: 35,
      mop: 40
    },
    physical: {
      indoor: { width: 48, height: 48, depth: 24, weight: 450 }
    },
    features: [
      'Designed for grow rooms',
      'Integrated dehumidification',
      'CO2 compatible',
      'Precise temp/humidity control',
      'Sealed room operation',
      'Redundant compressors'
    ],
    refrigerant: 'R410A',
    price: 12000,
    coverage: {
      sqft: 2500,
      sensibleLoad: 50000,
      latentLoad: 10000
    }
  },
  'ideal-air-mega-split': {
    id: 'ideal-air-mega-split',
    manufacturer: 'Ideal-Air',
    model: 'Mega-Split 36,000',
    category: 'MiniSplit',
    type: 'Both',
    capacity: {
      cooling: 36000,
      heating: 36000,
      tons: 3
    },
    efficiency: {
      seer: 15,
      eer: 10
    },
    power: {
      voltage: 240,
      phase: 1,
      mca: 25,
      mop: 35
    },
    physical: {
      indoor: { width: 42, height: 12, depth: 9, weight: 30 },
      outdoor: { width: 35, height: 32, depth: 13, weight: 120 }
    },
    features: [
      'Grow room optimized',
      'Heavy duty construction',
      'Easy maintenance',
      'Pre-charged lines available',
      'Budget-friendly'
    ],
    refrigerant: 'R410A',
    price: 2500,
    coverage: {
      sqft: 1500,
      sensibleLoad: 32000
    }
  },

  // Heaters for cold climate supplementation
  'modine-pdp-200': {
    id: 'modine-pdp-200',
    manufacturer: 'Modine',
    model: 'PDP-200',
    category: 'Heater',
    type: 'Heating',
    capacity: {
      heating: 200000,
      airflow: 3400
    },
    efficiency: {
      cop: 0.82 // 82% efficient
    },
    power: {
      voltage: 115,
      phase: 1,
      mca: 5,
      mop: 15,
      watts: 450 // Fan motor only
    },
    physical: {
      indoor: { width: 26, height: 21, depth: 38, weight: 165 }
    },
    features: [
      'Power vented',
      'Separated combustion',
      'Stainless steel heat exchanger',
      'Propane or natural gas',
      'Horizontal or vertical venting'
    ],
    refrigerant: 'N/A',
    price: 2800,
    coverage: {
      sqft: 4000,
      sensibleLoad: 200000
    }
  }
};

// Helper functions for HVAC calculations
export function calculateCoolingLoad(
  roomWidth: number,
  roomLength: number,
  roomHeight: number,
  lightingWatts: number,
  outsideTemp: number = 95,
  insideTemp: number = 78,
  insulationRValue: number = 13
): {
  sensibleLoad: number; // BTU/hr
  latentLoad: number; // BTU/hr from transpiration
  totalLoad: number;
} {
  const area = roomWidth * roomLength;
  const volume = area * roomHeight;
  
  // Heat from lights (3.41 BTU per watt)
  const lightingLoad = lightingWatts * 3.41;
  
  // Conduction through walls/roof
  const surfaceArea = 2 * (roomWidth + roomLength) * roomHeight + area;
  const deltaT = outsideTemp - insideTemp;
  const conductionLoad = (surfaceArea * deltaT) / insulationRValue;
  
  // Infiltration (1 air change per hour)
  const infiltrationLoad = volume * 1.08 * deltaT;
  
  // Equipment and misc (10% of lighting)
  const equipmentLoad = lightingLoad * 0.1;
  
  const sensibleLoad = lightingLoad + conductionLoad + infiltrationLoad + equipmentLoad;
  
  // Latent load from plants (roughly 50% of sensible from lights)
  const latentLoad = lightingLoad * 0.5;
  
  return {
    sensibleLoad,
    latentLoad,
    totalLoad: sensibleLoad + latentLoad
  };
}

export function recommendHVACSystem(
  roomWidth: number,
  roomLength: number,
  roomHeight: number,
  lightingWatts: number,
  climate: 'hot' | 'moderate' | 'cold' = 'moderate'
): {
  primary: HVACSystem[];
  backupHeat?: HVACSystem;
  notes: string[];
} {
  const coolingLoad = calculateCoolingLoad(roomWidth, roomLength, roomHeight, lightingWatts);
  const requiredTons = coolingLoad.totalLoad / 12000;
  
  const systems: HVACSystem[] = [];
  const notes: string[] = [];
  
  // Small rooms < 5 tons - mini-splits
  if (requiredTons <= 5) {
    systems.push(...Object.values(hvacDatabase).filter(
      s => s.category === 'MiniSplit' && 
           s.capacity.tons >= requiredTons * 0.9 &&
           s.capacity.tons <= requiredTons * 1.3
    ));
    notes.push('Mini-splits recommended for zone control and efficiency');
  }
  // Medium rooms 5-15 tons - RTU or multiple mini-splits
  else if (requiredTons <= 15) {
    systems.push(...Object.values(hvacDatabase).filter(
      s => (s.category === 'RTU' || s.category === 'AHU') && 
           s.capacity.tons >= requiredTons * 0.9
    ));
    notes.push('Consider RTU for simplicity or multiple mini-splits for redundancy');
  }
  // Large facilities > 15 tons - chillers or multiple RTUs
  else {
    systems.push(...Object.values(hvacDatabase).filter(
      s => s.category === 'Chiller'
    ));
    notes.push('Chilled water system recommended for large loads');
  }
  
  // Add backup heat for cold climates
  let backupHeat;
  if (climate === 'cold') {
    backupHeat = hvacDatabase['modine-pdp-200'];
    notes.push('Backup heating recommended for cold climate');
  }
  
  // Sort by efficiency
  systems.sort((a, b) => (b.efficiency.seer || 0) - (a.efficiency.seer || 0));
  
  return {
    primary: systems.slice(0, 3),
    backupHeat,
    notes
  };
}