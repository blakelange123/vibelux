// Extended fertilizer database with comprehensive nutrient profiles

import { ExtendedFertilizer } from './nutrient-recipe-models'

export const extendedFertilizerDatabase: ExtendedFertilizer[] = [
  // Nitrogen Sources
  {
    id: 'can-4h2o',
    name: 'Calcium Nitrate Tetrahydrate',
    formula: 'Ca(NO3)2·4H2O',
    type: 'salt',
    analysis: {
      N: 11.86,
      NO3: 11.86,
      Ca: 16.97
    },
    solubility: 1290,
    maxConcentration: 800,
    cost: 0.45,
    density: 1.82,
    pH: 6.5,
    ec: 1.2,
    compatibility: {
      incompatibleWith: ['map', 'dap', 'mkp', 'mgso4', 'ksul'],
      warnings: ['Do not mix with phosphates or sulfates in concentrated solutions']
    },
    grade: 'agricultural'
  },
  {
    id: 'kno3',
    name: 'Potassium Nitrate',
    formula: 'KNO3',
    type: 'salt',
    analysis: {
      N: 13.0,
      NO3: 13.0,
      K: 36.5 // as K, not K2O
    },
    solubility: 316,
    maxConcentration: 250,
    cost: 0.95,
    density: 2.11,
    pH: 7.0,
    ec: 1.3,
    compatibility: {
      incompatibleWith: [],
      warnings: []
    },
    grade: 'agricultural'
  },
  {
    id: 'mgno3',
    name: 'Magnesium Nitrate Hexahydrate',
    formula: 'Mg(NO3)2·6H2O',
    type: 'salt',
    analysis: {
      N: 10.9,
      NO3: 10.9,
      Mg: 9.5
    },
    solubility: 1250,
    maxConcentration: 700,
    cost: 0.65,
    density: 1.63,
    pH: 6.0,
    ec: 0.9,
    compatibility: {
      incompatibleWith: ['map', 'dap'],
      warnings: ['Hygroscopic - store in sealed containers']
    },
    grade: 'agricultural'
  },
  {
    id: 'nh4no3',
    name: 'Ammonium Nitrate',
    formula: 'NH4NO3',
    type: 'salt',
    analysis: {
      N: 35.0,
      NH4: 17.5,
      NO3: 17.5
    },
    solubility: 1900,
    maxConcentration: 1000,
    cost: 0.35,
    density: 1.72,
    pH: 5.5,
    ec: 1.8,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Oxidizer - handle with care', 'Regulated in some regions']
    },
    grade: 'agricultural'
  },
  {
    id: 'urea',
    name: 'Urea',
    formula: 'CO(NH2)2',
    type: 'organic',
    analysis: {
      N: 46.0,
      NH4: 46.0 // converts to NH4 in solution
    },
    solubility: 1080,
    maxConcentration: 700,
    cost: 0.30,
    density: 1.32,
    pH: 7.2,
    ec: 0.0, // non-ionic
    compatibility: {
      incompatibleWith: [],
      warnings: ['Converts to ammonia - monitor pH', 'Can cause biuret toxicity if impure']
    },
    grade: 'agricultural'
  },

  // Phosphorus Sources
  {
    id: 'mkp',
    name: 'Monopotassium Phosphate',
    formula: 'KH2PO4',
    type: 'salt',
    analysis: {
      P: 22.7, // as P, not P2O5
      K: 28.2
    },
    solubility: 230,
    maxConcentration: 180,
    cost: 1.20,
    density: 2.34,
    pH: 4.5,
    ec: 0.7,
    compatibility: {
      incompatibleWith: ['can-4h2o', 'cacl2'],
      warnings: ['Acidic - will lower pH significantly']
    },
    grade: 'agricultural'
  },
  {
    id: 'map',
    name: 'Monoammonium Phosphate',
    formula: 'NH4H2PO4',
    type: 'salt',
    analysis: {
      N: 12.0,
      NH4: 12.0,
      P: 26.5
    },
    solubility: 400,
    maxConcentration: 300,
    cost: 0.85,
    density: 1.80,
    pH: 4.0,
    ec: 0.9,
    compatibility: {
      incompatibleWith: ['can-4h2o', 'cacl2', 'mgno3'],
      warnings: ['Very acidic - monitor pH closely']
    },
    grade: 'agricultural'
  },
  {
    id: 'dap',
    name: 'Diammonium Phosphate',
    formula: '(NH4)2HPO4',
    type: 'salt',
    analysis: {
      N: 21.0,
      NH4: 21.0,
      P: 23.0
    },
    solubility: 580,
    maxConcentration: 400,
    cost: 0.75,
    density: 1.62,
    pH: 8.0,
    ec: 1.1,
    compatibility: {
      incompatibleWith: ['can-4h2o', 'cacl2', 'mgno3', 'znso4', 'cuso4'],
      warnings: ['Alkaline - will raise pH', 'Can precipitate micronutrients']
    },
    grade: 'agricultural'
  },
  {
    id: 'phosphoric',
    name: 'Phosphoric Acid 85%',
    formula: 'H3PO4',
    type: 'acid',
    analysis: {
      P: 26.5
    },
    solubility: 9999, // miscible
    maxConcentration: 850,
    cost: 0.95,
    density: 1.88,
    pH: 1.5,
    ec: 2.1,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Corrosive acid - handle with care', 'Use for pH adjustment']
    },
    grade: 'technical'
  },

  // Potassium Sources
  {
    id: 'ksul',
    name: 'Potassium Sulfate',
    formula: 'K2SO4',
    type: 'salt',
    analysis: {
      K: 41.5,
      S: 17.0
    },
    solubility: 120,
    maxConcentration: 100,
    cost: 0.65,
    density: 2.66,
    pH: 7.0,
    ec: 1.5,
    compatibility: {
      incompatibleWith: ['can-4h2o', 'cacl2'],
      warnings: ['Lower solubility - dissolve separately']
    },
    grade: 'agricultural'
  },
  {
    id: 'kcl',
    name: 'Potassium Chloride (Muriate of Potash)',
    formula: 'KCl',
    type: 'salt',
    analysis: {
      K: 50.0,
      Cl: 45.0
    },
    solubility: 340,
    maxConcentration: 260,
    cost: 0.35,
    density: 1.98,
    pH: 7.0,
    ec: 1.9,
    compatibility: {
      incompatibleWith: [],
      warnings: ['High chloride - avoid for chloride-sensitive crops']
    },
    grade: 'agricultural'
  },
  {
    id: 'koh',
    name: 'Potassium Hydroxide',
    formula: 'KOH',
    type: 'base',
    analysis: {
      K: 55.0
    },
    solubility: 1210,
    maxConcentration: 500,
    cost: 1.50,
    density: 2.12,
    pH: 14.0,
    ec: 2.5,
    compatibility: {
      incompatibleWith: ['all-acids'],
      warnings: ['Caustic base - handle with extreme care', 'Use for pH up']
    },
    grade: 'technical'
  },
  {
    id: 'k2co3',
    name: 'Potassium Carbonate',
    formula: 'K2CO3',
    type: 'salt',
    analysis: {
      K: 56.6
    },
    solubility: 1120,
    maxConcentration: 700,
    cost: 0.85,
    density: 2.43,
    pH: 11.5,
    ec: 1.7,
    compatibility: {
      incompatibleWith: ['all-acids'],
      warnings: ['Alkaline - will raise pH significantly']
    },
    grade: 'agricultural'
  },

  // Calcium Sources
  {
    id: 'cacl2',
    name: 'Calcium Chloride Dihydrate',
    formula: 'CaCl2·2H2O',
    type: 'salt',
    analysis: {
      Ca: 27.3,
      Cl: 48.3
    },
    solubility: 745,
    maxConcentration: 500,
    cost: 0.25,
    density: 1.85,
    pH: 6.5,
    ec: 2.1,
    compatibility: {
      incompatibleWith: ['map', 'dap', 'mkp', 'ksul', 'mgso4'],
      warnings: ['High chloride content', 'Exothermic when dissolving']
    },
    grade: 'agricultural'
  },
  {
    id: 'gypsum',
    name: 'Calcium Sulfate (Gypsum)',
    formula: 'CaSO4·2H2O',
    type: 'salt',
    analysis: {
      Ca: 23.3,
      S: 18.6
    },
    solubility: 2.4,
    maxConcentration: 2,
    cost: 0.15,
    density: 2.32,
    pH: 7.0,
    ec: 0.2,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Very low solubility - use for soil amendment only']
    },
    grade: 'agricultural'
  },

  // Magnesium Sources
  {
    id: 'mgso4-7h2o',
    name: 'Magnesium Sulfate Heptahydrate (Epsom Salt)',
    formula: 'MgSO4·7H2O',
    type: 'salt',
    analysis: {
      Mg: 9.9,
      S: 13.0
    },
    solubility: 710,
    maxConcentration: 500,
    cost: 0.35,
    density: 1.68,
    pH: 7.0,
    ec: 0.8,
    compatibility: {
      incompatibleWith: ['can-4h2o', 'cacl2'],
      warnings: ['Can precipitate with calcium at high concentrations']
    },
    grade: 'agricultural'
  },
  {
    id: 'mgso4-1h2o',
    name: 'Magnesium Sulfate Monohydrate (Kieserite)',
    formula: 'MgSO4·H2O',
    type: 'salt',
    analysis: {
      Mg: 17.5,
      S: 23.0
    },
    solubility: 650,
    maxConcentration: 450,
    cost: 0.40,
    density: 2.57,
    pH: 7.0,
    ec: 0.9,
    compatibility: {
      incompatibleWith: ['can-4h2o', 'cacl2'],
      warnings: ['More concentrated than Epsom salt']
    },
    grade: 'agricultural'
  },

  // Sulfur Sources
  {
    id: 'sulfuric',
    name: 'Sulfuric Acid 35%',
    formula: 'H2SO4',
    type: 'acid',
    analysis: {
      S: 11.5
    },
    solubility: 9999, // miscible
    maxConcentration: 350,
    cost: 0.20,
    density: 1.26,
    pH: 0.5,
    ec: 3.5,
    compatibility: {
      incompatibleWith: ['all-bases'],
      warnings: ['Extremely corrosive - handle with maximum care', 'Use for pH down and alkalinity reduction']
    },
    grade: 'technical'
  },
  {
    id: 'ammsul',
    name: 'Ammonium Sulfate',
    formula: '(NH4)2SO4',
    type: 'salt',
    analysis: {
      N: 21.0,
      NH4: 21.0,
      S: 24.0
    },
    solubility: 760,
    maxConcentration: 500,
    cost: 0.25,
    density: 1.77,
    pH: 5.5,
    ec: 1.9,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Acidifying - lowers pH over time']
    },
    grade: 'agricultural'
  },

  // Micronutrient Sources - Iron
  {
    id: 'fe-dtpa',
    name: 'Iron DTPA Chelate',
    formula: 'Fe-DTPA',
    type: 'chelate',
    chelateForm: 'DTPA',
    analysis: {
      Fe: 11.0
    },
    solubility: 240,
    maxConcentration: 120,
    cost: 12.00,
    pH: 7.0,
    ec: 0.1,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Stable at pH 4-7.5', 'Light sensitive - store in dark']
    },
    grade: 'agricultural'
  },
  {
    id: 'fe-edta',
    name: 'Iron EDTA Chelate',
    formula: 'Fe-EDTA',
    type: 'chelate',
    chelateForm: 'EDTA',
    analysis: {
      Fe: 13.0
    },
    solubility: 300,
    maxConcentration: 150,
    cost: 10.00,
    pH: 7.0,
    ec: 0.1,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Stable at pH 4-6.5', 'Less stable than DTPA at high pH']
    },
    grade: 'agricultural'
  },
  {
    id: 'fe-eddha',
    name: 'Iron EDDHA Chelate',
    formula: 'Fe-EDDHA',
    type: 'chelate',
    chelateForm: 'EDDHA',
    analysis: {
      Fe: 6.0
    },
    solubility: 110,
    maxConcentration: 60,
    cost: 25.00,
    pH: 7.0,
    ec: 0.1,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Stable at pH 4-9', 'Best for high pH', 'Red color in solution']
    },
    grade: 'agricultural'
  },
  {
    id: 'feso4-7h2o',
    name: 'Iron Sulfate Heptahydrate',
    formula: 'FeSO4·7H2O',
    type: 'salt',
    analysis: {
      Fe: 20.0,
      S: 11.5
    },
    solubility: 256,
    maxConcentration: 200,
    cost: 0.55,
    density: 1.90,
    pH: 3.5,
    ec: 1.0,
    compatibility: {
      incompatibleWith: ['phosphates', 'high-ph'],
      warnings: ['Oxidizes to Fe3+ in solution', 'Use chelated forms for better stability']
    },
    grade: 'agricultural'
  },

  // Micronutrient Sources - Manganese
  {
    id: 'mn-edta',
    name: 'Manganese EDTA Chelate',
    formula: 'Mn-EDTA',
    type: 'chelate',
    chelateForm: 'EDTA',
    analysis: {
      Mn: 13.0
    },
    solubility: 500,
    maxConcentration: 250,
    cost: 8.00,
    pH: 7.0,
    ec: 0.1,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Stable chelate form']
    },
    grade: 'agricultural'
  },
  {
    id: 'mnso4-h2o',
    name: 'Manganese Sulfate Monohydrate',
    formula: 'MnSO4·H2O',
    type: 'salt',
    analysis: {
      Mn: 32.5,
      S: 18.9
    },
    solubility: 762,
    maxConcentration: 500,
    cost: 1.85,
    density: 2.95,
    pH: 5.0,
    ec: 1.4,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Can oxidize at high pH']
    },
    grade: 'agricultural'
  },

  // Micronutrient Sources - Zinc
  {
    id: 'zn-edta',
    name: 'Zinc EDTA Chelate',
    formula: 'Zn-EDTA',
    type: 'chelate',
    chelateForm: 'EDTA',
    analysis: {
      Zn: 14.0
    },
    solubility: 600,
    maxConcentration: 300,
    cost: 9.00,
    pH: 7.0,
    ec: 0.1,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Stable chelate form']
    },
    grade: 'agricultural'
  },
  {
    id: 'znso4-7h2o',
    name: 'Zinc Sulfate Heptahydrate',
    formula: 'ZnSO4·7H2O',
    type: 'salt',
    analysis: {
      Zn: 22.7,
      S: 11.1
    },
    solubility: 965,
    maxConcentration: 600,
    cost: 1.65,
    density: 1.97,
    pH: 5.0,
    ec: 1.3,
    compatibility: {
      incompatibleWith: ['dap', 'high-ph'],
      warnings: ['Can precipitate at high pH']
    },
    grade: 'agricultural'
  },

  // Micronutrient Sources - Copper
  {
    id: 'cu-edta',
    name: 'Copper EDTA Chelate',
    formula: 'Cu-EDTA',
    type: 'chelate',
    chelateForm: 'EDTA',
    analysis: {
      Cu: 15.0
    },
    solubility: 700,
    maxConcentration: 350,
    cost: 11.00,
    pH: 7.0,
    ec: 0.1,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Stable chelate form']
    },
    grade: 'agricultural'
  },
  {
    id: 'cuso4-5h2o',
    name: 'Copper Sulfate Pentahydrate',
    formula: 'CuSO4·5H2O',
    type: 'salt',
    analysis: {
      Cu: 25.5,
      S: 12.8
    },
    solubility: 317,
    maxConcentration: 250,
    cost: 3.20,
    density: 2.28,
    pH: 4.5,
    ec: 1.2,
    compatibility: {
      incompatibleWith: ['dap', 'high-ph'],
      warnings: ['Can precipitate at high pH', 'Toxic to roots at high concentrations']
    },
    grade: 'agricultural'
  },

  // Micronutrient Sources - Boron
  {
    id: 'boric',
    name: 'Boric Acid',
    formula: 'H3BO3',
    type: 'salt',
    analysis: {
      B: 17.5
    },
    solubility: 47,
    maxConcentration: 40,
    cost: 2.50,
    density: 1.44,
    pH: 5.5,
    ec: 0.0, // very weak acid
    compatibility: {
      incompatibleWith: [],
      warnings: ['Low solubility in cold water', 'Narrow safe range - monitor carefully']
    },
    grade: 'agricultural'
  },
  {
    id: 'borax',
    name: 'Sodium Tetraborate (Borax)',
    formula: 'Na2B4O7·10H2O',
    type: 'salt',
    analysis: {
      B: 11.3,
      Na: 12.0
    },
    solubility: 51,
    maxConcentration: 45,
    cost: 1.20,
    density: 1.73,
    pH: 9.2,
    ec: 0.8,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Contains sodium', 'Alkaline - will raise pH']
    },
    grade: 'agricultural'
  },
  {
    id: 'solubor',
    name: 'Solubor (Sodium Borate)',
    formula: 'Na2B8O13·4H2O',
    type: 'salt',
    analysis: {
      B: 20.5,
      Na: 8.0
    },
    solubility: 88,
    maxConcentration: 70,
    cost: 2.80,
    density: 1.55,
    pH: 8.5,
    ec: 0.6,
    compatibility: {
      incompatibleWith: [],
      warnings: ['More soluble than boric acid', 'Contains less sodium than borax']
    },
    grade: 'agricultural'
  },

  // Micronutrient Sources - Molybdenum
  {
    id: 'namoly',
    name: 'Sodium Molybdate Dihydrate',
    formula: 'Na2MoO4·2H2O',
    type: 'salt',
    analysis: {
      Mo: 39.7,
      Na: 19.0
    },
    solubility: 840,
    maxConcentration: 500,
    cost: 45.00,
    density: 2.37,
    pH: 7.5,
    ec: 1.1,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Very small amounts needed', 'Contains sodium']
    },
    grade: 'agricultural'
  },
  {
    id: 'ammoly',
    name: 'Ammonium Molybdate',
    formula: '(NH4)6Mo7O24·4H2O',
    type: 'salt',
    analysis: {
      Mo: 54.3,
      N: 6.3,
      NH4: 6.3
    },
    solubility: 430,
    maxConcentration: 300,
    cost: 55.00,
    density: 2.50,
    pH: 5.5,
    ec: 0.9,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Higher Mo content than sodium form', 'No sodium']
    },
    grade: 'agricultural'
  },

  // Silicon Sources
  {
    id: 'k2sio3',
    name: 'Potassium Silicate',
    formula: 'K2SiO3',
    type: 'salt',
    analysis: {
      K: 25.0,
      Si: 12.0
    },
    solubility: 184,
    maxConcentration: 150,
    cost: 2.50,
    density: 1.40,
    pH: 12.5,
    ec: 1.8,
    compatibility: {
      incompatibleWith: ['all-acids', 'low-ph'],
      warnings: ['Very alkaline - adjust pH after adding', 'Can precipitate at low pH']
    },
    grade: 'agricultural'
  },
  {
    id: 'na2sio3',
    name: 'Sodium Silicate',
    formula: 'Na2SiO3',
    type: 'salt',
    analysis: {
      Na: 23.0,
      Si: 14.0
    },
    solubility: 350,
    maxConcentration: 250,
    cost: 1.20,
    density: 1.39,
    pH: 13.0,
    ec: 2.1,
    compatibility: {
      incompatibleWith: ['all-acids', 'low-ph'],
      warnings: ['Extremely alkaline', 'High sodium content', 'Forms gel at low pH']
    },
    grade: 'technical'
  },
  {
    id: 'msa',
    name: 'Monosilicic Acid',
    formula: 'Si(OH)4',
    type: 'organic',
    analysis: {
      Si: 20.0
    },
    solubility: 120,
    maxConcentration: 100,
    cost: 35.00,
    density: 1.05,
    pH: 7.0,
    ec: 0.0,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Most bioavailable silicon form', 'Premium product']
    },
    grade: 'agricultural'
  },

  // Additional Specialty Products
  {
    id: 'nh4cl',
    name: 'Ammonium Chloride',
    formula: 'NH4Cl',
    type: 'salt',
    analysis: {
      N: 26.2,
      NH4: 26.2,
      Cl: 66.3
    },
    solubility: 372,
    maxConcentration: 270,
    cost: 0.40,
    density: 1.53,
    pH: 5.0,
    ec: 2.2,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Very high chloride content', 'Acidifying']
    },
    grade: 'agricultural'
  },
  {
    id: 'caso4',
    name: 'Calcium Sulfate Anhydrous',
    formula: 'CaSO4',
    type: 'salt',
    analysis: {
      Ca: 29.4,
      S: 23.5
    },
    solubility: 2.6,
    maxConcentration: 2.5,
    cost: 0.20,
    density: 2.96,
    pH: 7.0,
    ec: 0.2,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Extremely low solubility', 'Use suspension concentrates']
    },
    grade: 'agricultural'
  },
  {
    id: 'nano3',
    name: 'Sodium Nitrate',
    formula: 'NaNO3',
    type: 'salt',
    analysis: {
      N: 16.5,
      NO3: 16.5,
      Na: 27.0
    },
    solubility: 912,
    maxConcentration: 600,
    cost: 0.50,
    density: 2.26,
    pH: 7.0,
    ec: 1.9,
    compatibility: {
      incompatibleWith: [],
      warnings: ['High sodium content', 'Use sparingly']
    },
    grade: 'agricultural'
  },

  // Pre-mixed Micronutrient Blends
  {
    id: 'micro-edta-mix',
    name: 'EDTA Micronutrient Mix',
    formula: 'Custom Blend',
    type: 'chelate',
    chelateForm: 'EDTA',
    analysis: {
      Fe: 7.0,
      Mn: 3.5,
      Zn: 1.5,
      Cu: 0.75,
      B: 1.5,
      Mo: 0.1
    },
    solubility: 250,
    maxConcentration: 150,
    cost: 18.00,
    pH: 7.0,
    ec: 0.2,
    compatibility: {
      incompatibleWith: [],
      warnings: ['Complete micronutrient package', 'Stable chelated forms']
    },
    grade: 'agricultural'
  },
  {
    id: 'micro-sulfate-mix',
    name: 'Sulfate Micronutrient Mix',
    formula: 'Custom Blend',
    type: 'salt',
    analysis: {
      Fe: 7.0,
      Mn: 4.0,
      Zn: 3.0,
      Cu: 1.5,
      B: 1.2,
      Mo: 0.05,
      S: 17.0
    },
    solubility: 450,
    maxConcentration: 300,
    cost: 5.00,
    pH: 5.0,
    ec: 1.3,
    compatibility: {
      incompatibleWith: ['high-ph'],
      warnings: ['Economical option', 'Less stable than chelates at high pH']
    },
    grade: 'agricultural'
  }
]

// Helper functions for fertilizer calculations
export function getFertilizerById(id: string): ExtendedFertilizer | undefined {
  return extendedFertilizerDatabase.find(f => f.id === id)
}

export function getFertilizersByType(type: ExtendedFertilizer['type']): ExtendedFertilizer[] {
  return extendedFertilizerDatabase.filter(f => f.type === type)
}

export function getFertilizersWithElement(element: keyof ExtendedFertilizer['analysis']): ExtendedFertilizer[] {
  return extendedFertilizerDatabase.filter(f => 
    f.analysis[element] !== undefined && f.analysis[element]! > 0
  )
}

export function checkCompatibility(fertIds: string[]): {
  compatible: boolean
  warnings: string[]
  incompatiblePairs: Array<{ fert1: string; fert2: string; reason: string }>
} {
  const warnings: string[] = []
  const incompatiblePairs: Array<{ fert1: string; fert2: string; reason: string }> = []
  let compatible = true

  for (let i = 0; i < fertIds.length; i++) {
    const fert1 = getFertilizerById(fertIds[i])
    if (!fert1) continue

    for (let j = i + 1; j < fertIds.length; j++) {
      const fert2 = getFertilizerById(fertIds[j])
      if (!fert2) continue

      // Check direct incompatibilities
      if (fert1.compatibility.incompatibleWith?.includes(fert2.id)) {
        compatible = false
        incompatiblePairs.push({
          fert1: fert1.name,
          fert2: fert2.name,
          reason: 'Direct incompatibility - risk of precipitation'
        })
      }

      // Check category incompatibilities
      if (fert1.compatibility.incompatibleWith?.includes(`all-${fert2.type}s`)) {
        compatible = false
        incompatiblePairs.push({
          fert1: fert1.name,
          fert2: fert2.name,
          reason: `${fert1.name} incompatible with all ${fert2.type}s`
        })
      }

      // Check calcium-sulfate/phosphate combinations
      if (
        (fert1.analysis.Ca && fert2.analysis.S && fert1.analysis.Ca > 10 && fert2.analysis.S > 10) ||
        (fert1.analysis.S && fert2.analysis.Ca && fert1.analysis.S > 10 && fert2.analysis.Ca > 10)
      ) {
        warnings.push(`${fert1.name} + ${fert2.name}: Risk of calcium sulfate precipitation at high concentrations`)
      }

      if (
        (fert1.analysis.Ca && fert2.analysis.P && fert1.analysis.Ca > 10 && fert2.analysis.P > 10) ||
        (fert1.analysis.P && fert2.analysis.Ca && fert1.analysis.P > 10 && fert2.analysis.Ca > 10)
      ) {
        warnings.push(`${fert1.name} + ${fert2.name}: Risk of calcium phosphate precipitation`)
      }
    }

    // Add individual fertilizer warnings
    if (fert1.compatibility.warnings) {
      warnings.push(...fert1.compatibility.warnings.map(w => `${fert1.name}: ${w}`))
    }
  }

  return { compatible, warnings, incompatiblePairs }
}

// Calculate theoretical EC contribution
export function calculateECContribution(
  fertilizers: Array<{ id: string; amount: number }>, // g/L
): number {
  let totalEC = 0

  fertilizers.forEach(({ id, amount }) => {
    const fert = getFertilizerById(id)
    if (fert && fert.ec) {
      // EC is typically given for 1g/L, so multiply by amount
      totalEC += fert.ec * amount
    }
  })

  return Math.round(totalEC * 100) / 100
}

// Tank separation logic
export function separateFertilizersIntoTanks(
  fertilizers: Array<{ id: string; amount: number }>
): {
  tankA: Array<{ id: string; amount: number }>
  tankB: Array<{ id: string; amount: number }>
  tankC?: Array<{ id: string; amount: number }>
} {
  const tankA: Array<{ id: string; amount: number }> = []
  const tankB: Array<{ id: string; amount: number }> = []
  const tankC: Array<{ id: string; amount: number }> = []

  fertilizers.forEach(({ id, amount }) => {
    const fert = getFertilizerById(id)
    if (!fert) return

    // Tank A: Calcium sources
    if (fert.analysis.Ca && fert.analysis.Ca > 5) {
      tankA.push({ id, amount })
    }
    // Tank B: Phosphates and sulfates
    else if (
      (fert.analysis.P && fert.analysis.P > 5) ||
      (fert.analysis.S && fert.analysis.S > 5 && !fert.analysis.Ca)
    ) {
      tankB.push({ id, amount })
    }
    // Tank C: pH adjusters and special products
    else if (fert.type === 'acid' || fert.type === 'base' || fert.analysis.Si) {
      tankC.push({ id, amount })
    }
    // Default to Tank B for others
    else {
      tankB.push({ id, amount })
    }
  })

  return tankC.length > 0 ? { tankA, tankB, tankC } : { tankA, tankB }
}