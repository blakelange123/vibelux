// DLC Certified Fixtures Database
export interface DLCFixture {
  id: string;
  brand: string;
  model: string;
  wattage: number;
  ppf: number;
  efficacy: number;
  spectrum: string;
  dlcQualified: boolean;
  price?: number;
  mountingType?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  beamAngle?: number;
  category?: string;
}

export const dlcFixturesDatabase: DLCFixture[] = [
  // Signify (Philips) Fixtures
  {
    id: 'signify-gp-toplighting-compact-1000',
    brand: 'Signify',
    model: 'GreenPower LED toplighting compact 1000',
    wattage: 1000,
    ppf: 3000,
    efficacy: 3.0,
    spectrum: 'Full Spectrum',
    dlcQualified: true,
    price: 1200,
    mountingType: 'overhead',
    dimensions: { length: 44, width: 12, height: 4 }, // inches
    beamAngle: 120,
    category: 'toplighting'
  },
  {
    id: 'signify-gp-toplighting-force-320',
    brand: 'Signify',
    model: 'GreenPower LED toplighting force 320',
    wattage: 320,
    ppf: 896,
    efficacy: 2.8,
    spectrum: 'Full Spectrum',
    dlcQualified: true,
    price: 450,
    mountingType: 'overhead',
    dimensions: { length: 24, width: 6, height: 3 }, // inches
    beamAngle: 120,
    category: 'toplighting'
  },
  {
    id: 'signify-gp-interlighting-250',
    brand: 'Signify',
    model: 'GreenPower LED interlighting 250',
    wattage: 250,
    ppf: 625,
    efficacy: 2.5,
    spectrum: 'Vegetative',
    dlcQualified: true,
    price: 350,
    mountingType: 'vertical',
    dimensions: { length: 48, width: 2, height: 2 }, // inches
    beamAngle: 150,
    category: 'interlighting'
  },
  
  // Fluence Fixtures
  {
    id: 'fluence-spydr-2p',
    brand: 'Fluence',
    model: 'SPYDR 2p',
    wattage: 645,
    ppf: 1700,
    efficacy: 2.64,
    spectrum: 'Full Spectrum',
    dlcQualified: true,
    price: 1099,
    mountingType: 'overhead',
    dimensions: { length: 47, width: 43, height: 3.7 }, // inches
    beamAngle: 120,
    category: 'toplighting'
  },
  {
    id: 'fluence-razr-modular',
    brand: 'Fluence',
    model: 'RAZR Modular',
    wattage: 320,
    ppf: 896,
    efficacy: 2.8,
    spectrum: 'Full Spectrum',
    dlcQualified: true,
    price: 650,
    mountingType: 'rack',
    dimensions: { length: 48, width: 4, height: 2 }, // inches
    beamAngle: 110,
    category: 'vertical-farming'
  },
  {
    id: 'fluence-vyne',
    brand: 'Fluence',
    model: 'VYNE',
    wattage: 150,
    ppf: 405,
    efficacy: 2.7,
    spectrum: 'Propagation',
    dlcQualified: true,
    price: 299,
    mountingType: 'rack',
    dimensions: { length: 48, width: 4, height: 2 },
    beamAngle: 120,
    category: 'vertical-farming'
  },
  
  // Gavita Fixtures
  {
    id: 'gavita-1700e-led',
    brand: 'Gavita',
    model: 'Pro 1700e LED',
    wattage: 645,
    ppf: 1700,
    efficacy: 2.64,
    spectrum: 'Full Spectrum',
    dlcQualified: true,
    price: 1150,
    mountingType: 'overhead',
    dimensions: { length: 44, width: 44, height: 6 },
    beamAngle: 120,
    category: 'toplighting'
  },
  {
    id: 'gavita-1000e-led',
    brand: 'Gavita',
    model: 'Pro 1000e LED',
    wattage: 380,
    ppf: 1000,
    efficacy: 2.63,
    spectrum: 'Full Spectrum',
    dlcQualified: true,
    price: 750,
    mountingType: 'overhead',
    dimensions: { length: 30, width: 30, height: 5 },
    beamAngle: 120,
    category: 'toplighting'
  },
  
  // Growers Choice
  {
    id: 'growers-choice-roi-e680',
    brand: 'Growers Choice',
    model: 'ROI-E680',
    wattage: 680,
    ppf: 1836,
    efficacy: 2.7,
    spectrum: 'Full Spectrum + Far Red',
    dlcQualified: true,
    price: 1099,
    mountingType: 'overhead',
    dimensions: { length: 42, width: 42, height: 4 },
    beamAngle: 120,
    category: 'toplighting'
  },
  {
    id: 'growers-choice-roi-e420',
    brand: 'Growers Choice',
    model: 'ROI-E420',
    wattage: 420,
    ppf: 1134,
    efficacy: 2.7,
    spectrum: 'Full Spectrum + Far Red',
    dlcQualified: true,
    price: 799,
    mountingType: 'overhead',
    dimensions: { length: 36, width: 36, height: 4 },
    beamAngle: 120,
    category: 'toplighting'
  },
  
  // Vertical Farming Specific
  {
    id: 'signify-gp-production-module',
    brand: 'Signify',
    model: 'GreenPower LED production module',
    wattage: 400,
    ppf: 1120,
    efficacy: 2.8,
    spectrum: 'Full Spectrum',
    dlcQualified: true,
    price: 599,
    mountingType: 'rack',
    dimensions: { length: 48, width: 6, height: 2 },
    beamAngle: 120,
    category: 'vertical-farming'
  },
  {
    id: 'fluence-razr-x',
    brand: 'Fluence',
    model: 'RAZR X',
    wattage: 165,
    ppf: 445,
    efficacy: 2.7,
    spectrum: 'Vegetative',
    dlcQualified: true,
    price: 349,
    mountingType: 'rack',
    dimensions: { length: 48, width: 4, height: 2 },
    beamAngle: 115,
    category: 'vertical-farming'
  }
];

// Helper function to get fixtures by category
export function getFixturesByCategory(category: string): DLCFixture[] {
  return dlcFixturesDatabase.filter(f => f.category === category);
}

// Helper function to get fixtures by brand
export function getFixturesByBrand(brand: string): DLCFixture[] {
  return dlcFixturesDatabase.filter(f => f.brand.toLowerCase() === brand.toLowerCase());
}

// Helper function to get fixtures by wattage range
export function getFixturesByWattageRange(minWattage: number, maxWattage: number): DLCFixture[] {
  return dlcFixturesDatabase.filter(f => f.wattage >= minWattage && f.wattage <= maxWattage);
}

// Helper function to get fixtures suitable for vertical farming
export function getVerticalFarmingFixtures(): DLCFixture[] {
  return dlcFixturesDatabase.filter(f => 
    f.category === 'vertical-farming' || 
    f.mountingType === 'rack' ||
    (f.dimensions && f.dimensions.width <= 6) // Narrow fixtures suitable for racks
  );
}