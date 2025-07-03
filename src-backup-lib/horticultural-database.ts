/**
 * Comprehensive Horticultural Crop Database
 * Professional-grade crop information for lighting design
 */

export interface CropVariety {
  id: string;
  name: string;
  scientificName: string;
  category: 'leafy-greens' | 'herbs' | 'fruiting' | 'root-vegetables' | 'microgreens' | 'cannabis' | 'flowers' | 'vines' | 'trees';
  subCategory: string;
  
  // Growth characteristics
  growthHabit: 'determinate' | 'indeterminate' | 'semi-determinate';
  matureHeight: [number, number]; // cm [min, max]
  matureSpread: [number, number]; // cm [min, max]
  leafAreaIndex: number; // LAI at maturity
  canopyDensity: 'light' | 'medium' | 'dense';
  
  // Growth timeline
  seedToTransplant: number; // days
  transplantToFirstHarvest: number; // days
  harvestWindow: number; // days of continuous harvest
  totalCropCycle: number; // days from seed to final harvest
  
  // Light requirements
  lightRequirements: {
    seedling: {
      ppfd: [number, number]; // µmol/m²/s [min, max]
      dli: [number, number]; // mol/m²/day [min, max]
      photoperiod: number; // hours
      spectrum: {
        blue: number; // % (400-500nm)
        green: number; // % (500-600nm)
        red: number; // % (600-700nm)
        farRed: number; // % (700-800nm)
        uv: number; // % (280-400nm)
      };
    };
    vegetative: {
      ppfd: [number, number];
      dli: [number, number];
      photoperiod: number;
      spectrum: {
        blue: number;
        green: number;
        red: number;
        farRed: number;
        uv: number;
      };
    };
    reproductive: {
      ppfd: [number, number];
      dli: [number, number];
      photoperiod: number;
      spectrum: {
        blue: number;
        green: number;
        red: number;
        farRed: number;
        uv: number;
      };
    };
  };
  
  // Environmental requirements
  environmentalRequirements: {
    temperature: {
      optimal: [number, number]; // °C [day, night]
      minimum: number; // °C
      maximum: number; // °C
    };
    humidity: {
      seedling: [number, number]; // % RH [min, max]
      vegetative: [number, number];
      reproductive: [number, number];
    };
    co2: {
      ambient: number; // ppm
      enriched: number; // ppm
    };
    airflow: {
      minimum: number; // m/s
      optimal: number; // m/s
    };
  };
  
  // Spacing and density
  spacing: {
    inRow: number; // cm
    betweenRows: number; // cm
    plantsPerSqFt: number;
    plantsPerSqM: number;
  };
  
  // Nutritional profile (for market analysis)
  nutrition: {
    calories: number; // per 100g
    protein: number; // g per 100g
    carbs: number; // g per 100g
    fiber: number; // g per 100g
    vitamins: string[]; // key vitamins
    minerals: string[]; // key minerals
  };
  
  // Market data
  market: {
    averagePrice: number; // $ per lb wholesale
    retailPrice: number; // $ per lb retail
    shelfLife: number; // days
    demandTrend: 'growing' | 'stable' | 'declining';
    seasonality: string; // peak demand months
  };
  
  // Disease/pest susceptibility
  commonIssues: {
    diseases: string[];
    pests: string[];
    nutritionalDeficiencies: string[];
    environmentalStresses: string[];
  };
  
  // Companion planting
  companions: {
    beneficial: string[]; // crop IDs that grow well together
    antagonistic: string[]; // crop IDs to avoid
  };
  
  // Special requirements
  specialRequirements: {
    pruning: boolean;
    staking: boolean;
    trellising: boolean;
    pollination: 'self' | 'wind' | 'insect' | 'hand';
    vernalization: boolean; // cold treatment required
  };
}

export const HORTICULTURAL_CROP_DATABASE: CropVariety[] = [
  // LEAFY GREENS
  {
    id: 'lettuce-butterhead',
    name: 'Butterhead Lettuce',
    scientificName: 'Lactuca sativa var. capitata',
    category: 'leafy-greens',
    subCategory: 'lettuce',
    growthHabit: 'determinate',
    matureHeight: [15, 25],
    matureSpread: [20, 30],
    leafAreaIndex: 2.5,
    canopyDensity: 'medium',
    seedToTransplant: 21,
    transplantToFirstHarvest: 35,
    harvestWindow: 7,
    totalCropCycle: 63,
    lightRequirements: {
      seedling: {
        ppfd: [50, 150],
        dli: [6, 12],
        photoperiod: 16,
        spectrum: { blue: 25, green: 25, red: 45, farRed: 3, uv: 2 }
      },
      vegetative: {
        ppfd: [200, 350],
        dli: [14, 20],
        photoperiod: 16,
        spectrum: { blue: 30, green: 25, red: 42, farRed: 2, uv: 1 }
      },
      reproductive: {
        ppfd: [250, 400],
        dli: [16, 22],
        photoperiod: 14,
        spectrum: { blue: 35, green: 20, red: 40, farRed: 3, uv: 2 }
      }
    },
    environmentalRequirements: {
      temperature: { optimal: [18, 22], minimum: 4, maximum: 28 },
      humidity: { seedling: [70, 85], vegetative: [60, 75], reproductive: [50, 70] },
      co2: { ambient: 400, enriched: 800 },
      airflow: { minimum: 0.1, optimal: 0.3 }
    },
    spacing: { inRow: 20, betweenRows: 25, plantsPerSqFt: 2.3, plantsPerSqM: 25 },
    nutrition: {
      calories: 13, protein: 1.4, carbs: 2.3, fiber: 1.0,
      vitamins: ['Vitamin A', 'Vitamin K', 'Folate'],
      minerals: ['Iron', 'Potassium', 'Manganese']
    },
    market: {
      averagePrice: 2.50, retailPrice: 4.99, shelfLife: 10,
      demandTrend: 'stable', seasonality: 'Year-round'
    },
    commonIssues: {
      diseases: ['Downy mildew', 'Bacterial leaf spot', 'Bottom rot'],
      pests: ['Aphids', 'Thrips', 'Whitefly'],
      nutritionalDeficiencies: ['Tipburn (Calcium)', 'Iron deficiency'],
      environmentalStresses: ['Bolting from heat', 'Cold damage']
    },
    companions: { beneficial: ['basil', 'spinach', 'arugula'], antagonistic: ['broccoli'] },
    specialRequirements: {
      pruning: false, staking: false, trellising: false,
      pollination: 'wind', vernalization: false
    }
  },
  
  {
    id: 'kale-curly',
    name: 'Curly Kale',
    scientificName: 'Brassica oleracea var. acephala',
    category: 'leafy-greens',
    subCategory: 'brassica',
    growthHabit: 'indeterminate',
    matureHeight: [30, 60],
    matureSpread: [40, 60],
    leafAreaIndex: 3.2,
    canopyDensity: 'dense',
    seedToTransplant: 28,
    transplantToFirstHarvest: 45,
    harvestWindow: 60,
    totalCropCycle: 133,
    lightRequirements: {
      seedling: {
        ppfd: [100, 200],
        dli: [8, 14],
        photoperiod: 16,
        spectrum: { blue: 35, green: 20, red: 40, farRed: 3, uv: 2 }
      },
      vegetative: {
        ppfd: [300, 500],
        dli: [18, 28],
        photoperiod: 16,
        spectrum: { blue: 40, green: 20, red: 35, farRed: 3, uv: 2 }
      },
      reproductive: {
        ppfd: [400, 600],
        dli: [22, 32],
        photoperiod: 14,
        spectrum: { blue: 35, green: 25, red: 35, farRed: 3, uv: 2 }
      }
    },
    environmentalRequirements: {
      temperature: { optimal: [15, 20], minimum: -6, maximum: 25 },
      humidity: { seedling: [70, 85], vegetative: [60, 75], reproductive: [55, 70] },
      co2: { ambient: 400, enriched: 900 },
      airflow: { minimum: 0.2, optimal: 0.5 }
    },
    spacing: { inRow: 30, betweenRows: 40, plantsPerSqFt: 1.2, plantsPerSqM: 13 },
    nutrition: {
      calories: 35, protein: 2.9, carbs: 4.4, fiber: 4.1,
      vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K'],
      minerals: ['Calcium', 'Iron', 'Potassium']
    },
    market: {
      averagePrice: 3.25, retailPrice: 6.99, shelfLife: 14,
      demandTrend: 'growing', seasonality: 'Fall/Winter peak'
    },
    commonIssues: {
      diseases: ['Black rot', 'Clubroot', 'White rust'],
      pests: ['Cabbage worm', 'Flea beetles', 'Aphids'],
      nutritionalDeficiencies: ['Boron deficiency', 'Molybdenum deficiency'],
      environmentalStresses: ['Heat stress', 'Drought stress']
    },
    companions: { beneficial: ['spinach', 'lettuce', 'chard'], antagonistic: ['tomatoes', 'strawberries'] },
    specialRequirements: {
      pruning: true, staking: false, trellising: false,
      pollination: 'insect', vernalization: false
    }
  },

  {
    id: 'spinach-flat-leaf',
    name: 'Flat Leaf Spinach',
    scientificName: 'Spinacia oleracea',
    category: 'leafy-greens',
    subCategory: 'spinach',
    growthHabit: 'determinate',
    matureHeight: [15, 30],
    matureSpread: [20, 35],
    leafAreaIndex: 2.8,
    canopyDensity: 'medium',
    seedToTransplant: 14,
    transplantToFirstHarvest: 35,
    harvestWindow: 21,
    totalCropCycle: 70,
    lightRequirements: {
      seedling: {
        ppfd: [75, 175],
        dli: [7, 13],
        photoperiod: 16,
        spectrum: { blue: 30, green: 25, red: 40, farRed: 3, uv: 2 }
      },
      vegetative: {
        ppfd: [250, 400],
        dli: [16, 24],
        photoperiod: 14,
        spectrum: { blue: 35, green: 25, red: 35, farRed: 3, uv: 2 }
      },
      reproductive: {
        ppfd: [300, 450],
        dli: [18, 26],
        photoperiod: 12,
        spectrum: { blue: 30, green: 25, red: 40, farRed: 3, uv: 2 }
      }
    },
    environmentalRequirements: {
      temperature: { optimal: [12, 18], minimum: -9, maximum: 24 },
      humidity: { seedling: [75, 85], vegetative: [65, 75], reproductive: [60, 70] },
      co2: { ambient: 400, enriched: 800 },
      airflow: { minimum: 0.1, optimal: 0.3 }
    },
    spacing: { inRow: 15, betweenRows: 20, plantsPerSqFt: 4.0, plantsPerSqM: 43 },
    nutrition: {
      calories: 23, protein: 2.9, carbs: 3.6, fiber: 2.2,
      vitamins: ['Vitamin A', 'Vitamin C', 'Folate', 'Vitamin K'],
      minerals: ['Iron', 'Calcium', 'Potassium', 'Magnesium']
    },
    market: {
      averagePrice: 2.75, retailPrice: 5.49, shelfLife: 7,
      demandTrend: 'stable', seasonality: 'Spring/Fall peak'
    },
    commonIssues: {
      diseases: ['Downy mildew', 'White rust', 'Anthracnose'],
      pests: ['Leaf miners', 'Aphids', 'Spinach flea beetle'],
      nutritionalDeficiencies: ['Manganese deficiency', 'Iron chlorosis'],
      environmentalStresses: ['Bolting from heat/long days', 'Cold damage']
    },
    companions: { beneficial: ['lettuce', 'radish', 'strawberries'], antagonistic: ['fennel'] },
    specialRequirements: {
      pruning: false, staking: false, trellising: false,
      pollination: 'wind', vernalization: false
    }
  },

  // HERBS
  {
    id: 'basil-sweet',
    name: 'Sweet Basil',
    scientificName: 'Ocimum basilicum',
    category: 'herbs',
    subCategory: 'culinary',
    growthHabit: 'indeterminate',
    matureHeight: [30, 60],
    matureSpread: [25, 40],
    leafAreaIndex: 2.0,
    canopyDensity: 'medium',
    seedToTransplant: 21,
    transplantToFirstHarvest: 28,
    harvestWindow: 90,
    totalCropCycle: 139,
    lightRequirements: {
      seedling: {
        ppfd: [100, 200],
        dli: [8, 14],
        photoperiod: 16,
        spectrum: { blue: 30, green: 20, red: 45, farRed: 3, uv: 2 }
      },
      vegetative: {
        ppfd: [300, 500],
        dli: [18, 28],
        photoperiod: 16,
        spectrum: { blue: 25, green: 20, red: 50, farRed: 3, uv: 2 }
      },
      reproductive: {
        ppfd: [400, 600],
        dli: [22, 32],
        photoperiod: 14,
        spectrum: { blue: 20, green: 15, red: 55, farRed: 5, uv: 5 }
      }
    },
    environmentalRequirements: {
      temperature: { optimal: [20, 26], minimum: 10, maximum: 35 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 1000 },
      airflow: { minimum: 0.2, optimal: 0.4 }
    },
    spacing: { inRow: 20, betweenRows: 30, plantsPerSqFt: 2.5, plantsPerSqM: 27 },
    nutrition: {
      calories: 22, protein: 3.2, carbs: 2.6, fiber: 1.6,
      vitamins: ['Vitamin A', 'Vitamin K', 'Vitamin C'],
      minerals: ['Calcium', 'Iron', 'Magnesium', 'Potassium']
    },
    market: {
      averagePrice: 8.50, retailPrice: 16.99, shelfLife: 7,
      demandTrend: 'growing', seasonality: 'Summer peak'
    },
    commonIssues: {
      diseases: ['Fusarium wilt', 'Bacterial leaf spot', 'Downy mildew'],
      pests: ['Aphids', 'Spider mites', 'Whitefly', 'Japanese beetles'],
      nutritionalDeficiencies: ['Magnesium deficiency', 'Nitrogen deficiency'],
      environmentalStresses: ['Cold damage', 'Excessive heat']
    },
    companions: { beneficial: ['tomatoes', 'peppers', 'lettuce'], antagonistic: ['rue', 'sage'] },
    specialRequirements: {
      pruning: true, staking: false, trellising: false,
      pollination: 'insect', vernalization: false
    }
  },

  // FRUITING CROPS
  {
    id: 'tomato-cherry',
    name: 'Cherry Tomato',
    scientificName: 'Solanum lycopersicum var. cerasiforme',
    category: 'fruiting',
    subCategory: 'solanaceae',
    growthHabit: 'indeterminate',
    matureHeight: [120, 250],
    matureSpread: [60, 90],
    leafAreaIndex: 4.5,
    canopyDensity: 'dense',
    seedToTransplant: 35,
    transplantToFirstHarvest: 65,
    harvestWindow: 120,
    totalCropCycle: 220,
    lightRequirements: {
      seedling: {
        ppfd: [150, 250],
        dli: [10, 16],
        photoperiod: 16,
        spectrum: { blue: 25, green: 20, red: 50, farRed: 3, uv: 2 }
      },
      vegetative: {
        ppfd: [400, 600],
        dli: [20, 30],
        photoperiod: 16,
        spectrum: { blue: 20, green: 20, red: 55, farRed: 3, uv: 2 }
      },
      reproductive: {
        ppfd: [600, 900],
        dli: [25, 40],
        photoperiod: 12,
        spectrum: { blue: 15, green: 15, red: 60, farRed: 5, uv: 5 }
      }
    },
    environmentalRequirements: {
      temperature: { optimal: [22, 26], minimum: 13, maximum: 32 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 1200 },
      airflow: { minimum: 0.3, optimal: 0.6 }
    },
    spacing: { inRow: 45, betweenRows: 60, plantsPerSqFt: 0.4, plantsPerSqM: 4.3 },
    nutrition: {
      calories: 18, protein: 0.9, carbs: 3.9, fiber: 1.2,
      vitamins: ['Vitamin C', 'Vitamin A', 'Vitamin K'],
      minerals: ['Potassium', 'Folate', 'Lycopene']
    },
    market: {
      averagePrice: 4.50, retailPrice: 8.99, shelfLife: 10,
      demandTrend: 'growing', seasonality: 'Summer peak'
    },
    commonIssues: {
      diseases: ['Early blight', 'Late blight', 'Fusarium wilt', 'Bacterial speck'],
      pests: ['Hornworms', 'Whitefly', 'Aphids', 'Spider mites'],
      nutritionalDeficiencies: ['Calcium deficiency (blossom end rot)', 'Magnesium deficiency'],
      environmentalStresses: ['Temperature fluctuations', 'Water stress']
    },
    companions: { beneficial: ['basil', 'carrots', 'lettuce'], antagonistic: ['fennel', 'corn'] },
    specialRequirements: {
      pruning: true, staking: true, trellising: true,
      pollination: 'self', vernalization: false
    }
  },

  // CANNABIS VARIETIES
  {
    id: 'cannabis-gorilla-glue-4',
    name: 'Gorilla Glue #4',
    scientificName: 'Cannabis sativa L.',
    category: 'cannabis',
    subCategory: 'hybrid',
    growthHabit: 'indeterminate',
    matureHeight: [90, 150],
    matureSpread: [60, 100],
    leafAreaIndex: 3.8,
    canopyDensity: 'dense',
    seedToTransplant: 14,
    transplantToFirstHarvest: 119, // 63 days flowering + 56 veg
    harvestWindow: 7,
    totalCropCycle: 140,
    lightRequirements: {
      seedling: {
        ppfd: [100, 300],
        dli: [8, 15],
        photoperiod: 18,
        spectrum: { blue: 35, green: 15, red: 45, farRed: 3, uv: 2 }
      },
      vegetative: {
        ppfd: [400, 600],
        dli: [25, 35],
        photoperiod: 18,
        spectrum: { blue: 30, green: 20, red: 45, farRed: 3, uv: 2 }
      },
      reproductive: {
        ppfd: [700, 900],
        dli: [40, 50],
        photoperiod: 12,
        spectrum: { blue: 15, green: 15, red: 60, farRed: 5, uv: 5 }
      }
    },
    environmentalRequirements: {
      temperature: { optimal: [24, 27], minimum: 18, maximum: 30 },
      humidity: { seedling: [65, 75], vegetative: [60, 70], reproductive: [45, 55] },
      co2: { ambient: 400, enriched: 1200 },
      airflow: { minimum: 0.5, optimal: 1.0 }
    },
    spacing: { inRow: 120, betweenRows: 120, plantsPerSqFt: 0.1, plantsPerSqM: 1.0 },
    nutrition: {
      calories: 0, protein: 0, carbs: 0, fiber: 0,
      vitamins: ['CBD', 'THC', 'CBG'],
      minerals: ['Terpenes', 'Flavonoids']
    },
    market: {
      averagePrice: 2000, retailPrice: 4000, shelfLife: 365,
      demandTrend: 'growing', seasonality: 'Year-round'
    },
    commonIssues: {
      diseases: ['Powdery mildew', 'Botrytis', 'Root rot'],
      pests: ['Spider mites', 'Thrips', 'Aphids', 'Fungus gnats'],
      nutritionalDeficiencies: ['Nitrogen deficiency', 'Phosphorus deficiency', 'Potassium deficiency'],
      environmentalStresses: ['Light burn', 'Heat stress', 'Humidity fluctuations']
    },
    companions: { beneficial: [], antagonistic: [] },
    specialRequirements: {
      pruning: true, staking: true, trellising: true,
      pollination: 'wind', vernalization: false
    }
  },

  // MICROGREENS
  {
    id: 'microgreens-pea-shoots',
    name: 'Pea Shoot Microgreens',
    scientificName: 'Pisum sativum',
    category: 'microgreens',
    subCategory: 'legume',
    growthHabit: 'determinate',
    matureHeight: [5, 12],
    matureSpread: [2, 4],
    leafAreaIndex: 1.5,
    canopyDensity: 'dense',
    seedToTransplant: 0, // Direct sown
    transplantToFirstHarvest: 10,
    harvestWindow: 3,
    totalCropCycle: 13,
    lightRequirements: {
      seedling: {
        ppfd: [50, 150],
        dli: [4, 10],
        photoperiod: 16,
        spectrum: { blue: 40, green: 20, red: 35, farRed: 3, uv: 2 }
      },
      vegetative: {
        ppfd: [200, 400],
        dli: [12, 20],
        photoperiod: 16,
        spectrum: { blue: 35, green: 25, red: 35, farRed: 3, uv: 2 }
      },
      reproductive: {
        ppfd: [300, 500],
        dli: [16, 24],
        photoperiod: 16,
        spectrum: { blue: 30, green: 25, red: 40, farRed: 3, uv: 2 }
      }
    },
    environmentalRequirements: {
      temperature: { optimal: [18, 22], minimum: 10, maximum: 25 },
      humidity: { seedling: [80, 90], vegetative: [70, 80], reproductive: [65, 75] },
      co2: { ambient: 400, enriched: 600 },
      airflow: { minimum: 0.1, optimal: 0.2 }
    },
    spacing: { inRow: 1, betweenRows: 1, plantsPerSqFt: 144, plantsPerSqM: 1550 },
    nutrition: {
      calories: 42, protein: 2.8, carbs: 7.5, fiber: 2.6,
      vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K'],
      minerals: ['Iron', 'Calcium', 'Potassium']
    },
    market: {
      averagePrice: 25.00, retailPrice: 45.00, shelfLife: 5,
      demandTrend: 'growing', seasonality: 'Year-round'
    },
    commonIssues: {
      diseases: ['Damping off', 'Root rot'],
      pests: ['Fungus gnats', 'Aphids'],
      nutritionalDeficiencies: ['Nitrogen deficiency'],
      environmentalStresses: ['Overwatering', 'Poor air circulation']
    },
    companions: { beneficial: [], antagonistic: [] },
    specialRequirements: {
      pruning: false, staking: false, trellising: false,
      pollination: 'self', vernalization: false
    }
  },

  // ADDITIONAL LEAFY GREENS
  {
    id: 'arugula-wild',
    name: 'Wild Arugula',
    scientificName: 'Diplotaxis tenuifolia',
    category: 'leafy-greens',
    subCategory: 'brassica',
    growthHabit: 'indeterminate',
    matureHeight: [20, 40],
    matureSpread: [25, 35],
    leafAreaIndex: 2.2,
    canopyDensity: 'medium',
    seedToTransplant: 14,
    transplantToFirstHarvest: 28,
    harvestWindow: 45,
    totalCropCycle: 87,
    lightRequirements: {
      seedling: { ppfd: [75, 175], dli: [7, 13], photoperiod: 16, spectrum: { blue: 35, green: 20, red: 40, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [250, 400], dli: [16, 24], photoperiod: 16, spectrum: { blue: 40, green: 20, red: 35, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [300, 450], dli: [18, 26], photoperiod: 14, spectrum: { blue: 35, green: 25, red: 35, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [16, 22], minimum: 2, maximum: 28 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 800 },
      airflow: { minimum: 0.2, optimal: 0.4 }
    },
    spacing: { inRow: 15, betweenRows: 20, plantsPerSqFt: 4.0, plantsPerSqM: 43 },
    nutrition: { calories: 25, protein: 2.6, carbs: 3.7, fiber: 1.6, vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K'], minerals: ['Calcium', 'Iron', 'Potassium'] },
    market: { averagePrice: 6.50, retailPrice: 12.99, shelfLife: 7, demandTrend: 'growing', seasonality: 'Spring/Fall peak' },
    commonIssues: {
      diseases: ['Black rot', 'Downy mildew'], pests: ['Flea beetles', 'Aphids'], nutritionalDeficiencies: ['Iron deficiency'], environmentalStresses: ['Heat stress', 'Bolting']
    },
    companions: { beneficial: ['lettuce', 'spinach'], antagonistic: ['strawberries'] },
    specialRequirements: { pruning: false, staking: false, trellising: false, pollination: 'insect', vernalization: false }
  },

  {
    id: 'chard-rainbow',
    name: 'Rainbow Chard',
    scientificName: 'Beta vulgaris subsp. cicla',
    category: 'leafy-greens',
    subCategory: 'chard',
    growthHabit: 'indeterminate',
    matureHeight: [30, 60],
    matureSpread: [25, 40],
    leafAreaIndex: 3.0,
    canopyDensity: 'dense',
    seedToTransplant: 21,
    transplantToFirstHarvest: 45,
    harvestWindow: 90,
    totalCropCycle: 156,
    lightRequirements: {
      seedling: { ppfd: [100, 200], dli: [8, 14], photoperiod: 16, spectrum: { blue: 30, green: 25, red: 40, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [300, 500], dli: [18, 28], photoperiod: 16, spectrum: { blue: 35, green: 25, red: 35, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [350, 550], dli: [20, 30], photoperiod: 14, spectrum: { blue: 30, green: 25, red: 40, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [15, 25], minimum: -2, maximum: 30 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 900 },
      airflow: { minimum: 0.2, optimal: 0.4 }
    },
    spacing: { inRow: 25, betweenRows: 30, plantsPerSqFt: 1.9, plantsPerSqM: 20 },
    nutrition: { calories: 19, protein: 1.8, carbs: 3.7, fiber: 1.6, vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K'], minerals: ['Magnesium', 'Potassium', 'Iron'] },
    market: { averagePrice: 4.25, retailPrice: 8.99, shelfLife: 10, demandTrend: 'growing', seasonality: 'Fall/Winter peak' },
    commonIssues: {
      diseases: ['Cercospora leaf spot', 'Downy mildew'], pests: ['Leaf miners', 'Aphids'], nutritionalDeficiencies: ['Magnesium deficiency'], environmentalStresses: ['Heat stress', 'Cold damage']
    },
    companions: { beneficial: ['kale', 'lettuce'], antagonistic: ['corn'] },
    specialRequirements: { pruning: true, staking: false, trellising: false, pollination: 'wind', vernalization: false }
  },

  {
    id: 'bok-choy-baby',
    name: 'Baby Bok Choy',
    scientificName: 'Brassica rapa subsp. chinensis',
    category: 'leafy-greens',
    subCategory: 'asian-greens',
    growthHabit: 'determinate',
    matureHeight: [15, 25],
    matureSpread: [15, 25],
    leafAreaIndex: 2.8,
    canopyDensity: 'dense',
    seedToTransplant: 21,
    transplantToFirstHarvest: 35,
    harvestWindow: 14,
    totalCropCycle: 70,
    lightRequirements: {
      seedling: { ppfd: [100, 200], dli: [8, 14], photoperiod: 16, spectrum: { blue: 35, green: 20, red: 40, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [300, 500], dli: [18, 28], photoperiod: 16, spectrum: { blue: 40, green: 20, red: 35, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [350, 550], dli: [20, 30], photoperiod: 14, spectrum: { blue: 35, green: 25, red: 35, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [15, 20], minimum: 4, maximum: 25 },
      humidity: { seedling: [75, 85], vegetative: [65, 75], reproductive: [60, 70] },
      co2: { ambient: 400, enriched: 800 },
      airflow: { minimum: 0.2, optimal: 0.4 }
    },
    spacing: { inRow: 15, betweenRows: 20, plantsPerSqFt: 4.0, plantsPerSqM: 43 },
    nutrition: { calories: 13, protein: 1.5, carbs: 2.2, fiber: 1.0, vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K'], minerals: ['Calcium', 'Iron', 'Potassium'] },
    market: { averagePrice: 3.75, retailPrice: 7.49, shelfLife: 7, demandTrend: 'growing', seasonality: 'Year-round' },
    commonIssues: {
      diseases: ['Black rot', 'White rust'], pests: ['Flea beetles', 'Cabbage worm'], nutritionalDeficiencies: ['Boron deficiency'], environmentalStresses: ['Bolting from heat', 'Cold damage']
    },
    companions: { beneficial: ['lettuce', 'spinach'], antagonistic: ['strawberries'] },
    specialRequirements: { pruning: false, staking: false, trellising: false, pollination: 'insect', vernalization: false }
  },

  // ADDITIONAL HERBS
  {
    id: 'cilantro-slow-bolt',
    name: 'Slow Bolt Cilantro',
    scientificName: 'Coriandrum sativum',
    category: 'herbs',
    subCategory: 'culinary',
    growthHabit: 'determinate',
    matureHeight: [20, 40],
    matureSpread: [15, 25],
    leafAreaIndex: 1.8,
    canopyDensity: 'light',
    seedToTransplant: 14,
    transplantToFirstHarvest: 28,
    harvestWindow: 45,
    totalCropCycle: 87,
    lightRequirements: {
      seedling: { ppfd: [75, 175], dli: [7, 13], photoperiod: 16, spectrum: { blue: 30, green: 25, red: 40, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [250, 400], dli: [16, 24], photoperiod: 16, spectrum: { blue: 35, green: 25, red: 35, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [300, 450], dli: [18, 26], photoperiod: 12, spectrum: { blue: 25, green: 20, red: 50, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [16, 22], minimum: 2, maximum: 28 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 800 },
      airflow: { minimum: 0.2, optimal: 0.4 }
    },
    spacing: { inRow: 10, betweenRows: 15, plantsPerSqFt: 9.6, plantsPerSqM: 103 },
    nutrition: { calories: 23, protein: 2.1, carbs: 3.7, fiber: 2.8, vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K'], minerals: ['Potassium', 'Calcium', 'Magnesium'] },
    market: { averagePrice: 12.00, retailPrice: 24.99, shelfLife: 7, demandTrend: 'stable', seasonality: 'Spring/Fall peak' },
    commonIssues: {
      diseases: ['Bacterial leaf spot', 'Powdery mildew'], pests: ['Aphids', 'Whitefly'], nutritionalDeficiencies: ['Iron deficiency'], environmentalStresses: ['Bolting from heat', 'Cold damage']
    },
    companions: { beneficial: ['spinach', 'lettuce'], antagonistic: ['fennel'] },
    specialRequirements: { pruning: false, staking: false, trellising: false, pollination: 'insect', vernalization: false }
  },

  {
    id: 'parsley-flat-leaf',
    name: 'Flat Leaf Parsley',
    scientificName: 'Petroselinum crispum var. neapolitanum',
    category: 'herbs',
    subCategory: 'culinary',
    growthHabit: 'indeterminate',
    matureHeight: [30, 50],
    matureSpread: [25, 35],
    leafAreaIndex: 2.2,
    canopyDensity: 'medium',
    seedToTransplant: 28,
    transplantToFirstHarvest: 42,
    harvestWindow: 120,
    totalCropCycle: 190,
    lightRequirements: {
      seedling: { ppfd: [100, 200], dli: [8, 14], photoperiod: 16, spectrum: { blue: 35, green: 20, red: 40, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [300, 500], dli: [18, 28], photoperiod: 16, spectrum: { blue: 40, green: 20, red: 35, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [400, 600], dli: [22, 32], photoperiod: 14, spectrum: { blue: 30, green: 25, red: 40, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [18, 24], minimum: -6, maximum: 30 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 900 },
      airflow: { minimum: 0.2, optimal: 0.4 }
    },
    spacing: { inRow: 20, betweenRows: 25, plantsPerSqFt: 2.9, plantsPerSqM: 31 },
    nutrition: { calories: 36, protein: 3.0, carbs: 6.3, fiber: 3.3, vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K'], minerals: ['Iron', 'Potassium', 'Calcium'] },
    market: { averagePrice: 10.50, retailPrice: 19.99, shelfLife: 10, demandTrend: 'stable', seasonality: 'Year-round' },
    commonIssues: {
      diseases: ['Bacterial leaf blight', 'Crown rot'], pests: ['Parsley worm', 'Aphids'], nutritionalDeficiencies: ['Iron deficiency'], environmentalStresses: ['Overwatering', 'Heat stress']
    },
    companions: { beneficial: ['tomatoes', 'carrots'], antagonistic: ['lettuce'] },
    specialRequirements: { pruning: true, staking: false, trellising: false, pollination: 'insect', vernalization: true }
  },

  {
    id: 'oregano-greek',
    name: 'Greek Oregano',
    scientificName: 'Origanum vulgare subsp. hirtum',
    category: 'herbs',
    subCategory: 'mediterranean',
    growthHabit: 'indeterminate',
    matureHeight: [25, 45],
    matureSpread: [30, 50],
    leafAreaIndex: 1.5,
    canopyDensity: 'light',
    seedToTransplant: 21,
    transplantToFirstHarvest: 35,
    harvestWindow: 150,
    totalCropCycle: 206,
    lightRequirements: {
      seedling: { ppfd: [100, 200], dli: [8, 14], photoperiod: 16, spectrum: { blue: 25, green: 20, red: 50, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [300, 500], dli: [18, 28], photoperiod: 16, spectrum: { blue: 20, green: 20, red: 55, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [400, 600], dli: [22, 32], photoperiod: 14, spectrum: { blue: 15, green: 15, red: 60, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [20, 28], minimum: 10, maximum: 35 },
      humidity: { seedling: [65, 75], vegetative: [55, 65], reproductive: [50, 60] },
      co2: { ambient: 400, enriched: 1000 },
      airflow: { minimum: 0.3, optimal: 0.5 }
    },
    spacing: { inRow: 25, betweenRows: 30, plantsPerSqFt: 1.9, plantsPerSqM: 20 },
    nutrition: { calories: 265, protein: 9.0, carbs: 69, fiber: 42.5, vitamins: ['Vitamin K', 'Vitamin E'], minerals: ['Iron', 'Manganese', 'Calcium'] },
    market: { averagePrice: 15.00, retailPrice: 29.99, shelfLife: 14, demandTrend: 'stable', seasonality: 'Summer peak' },
    commonIssues: {
      diseases: ['Root rot', 'Fungal leaf spot'], pests: ['Spider mites', 'Aphids'], nutritionalDeficiencies: ['Iron deficiency'], environmentalStresses: ['Overwatering', 'Cold damage']
    },
    companions: { beneficial: ['tomatoes', 'peppers'], antagonistic: ['cucumber'] },
    specialRequirements: { pruning: true, staking: false, trellising: false, pollination: 'insect', vernalization: false }
  },

  // MORE FRUITING CROPS
  {
    id: 'pepper-bell-red',
    name: 'Red Bell Pepper',
    scientificName: 'Capsicum annuum',
    category: 'fruiting',
    subCategory: 'solanaceae',
    growthHabit: 'indeterminate',
    matureHeight: [60, 120],
    matureSpread: [40, 60],
    leafAreaIndex: 3.5,
    canopyDensity: 'dense',
    seedToTransplant: 42,
    transplantToFirstHarvest: 75,
    harvestWindow: 90,
    totalCropCycle: 207,
    lightRequirements: {
      seedling: { ppfd: [150, 250], dli: [10, 16], photoperiod: 16, spectrum: { blue: 25, green: 20, red: 50, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [400, 600], dli: [20, 30], photoperiod: 16, spectrum: { blue: 20, green: 20, red: 55, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [600, 800], dli: [25, 35], photoperiod: 12, spectrum: { blue: 15, green: 15, red: 60, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [24, 28], minimum: 15, maximum: 32 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 1200 },
      airflow: { minimum: 0.3, optimal: 0.6 }
    },
    spacing: { inRow: 40, betweenRows: 50, plantsPerSqFt: 0.7, plantsPerSqM: 7.5 },
    nutrition: { calories: 31, protein: 1.0, carbs: 7.3, fiber: 2.5, vitamins: ['Vitamin C', 'Vitamin A', 'Vitamin B6'], minerals: ['Potassium', 'Folate'] },
    market: { averagePrice: 3.50, retailPrice: 6.99, shelfLife: 14, demandTrend: 'stable', seasonality: 'Summer peak' },
    commonIssues: {
      diseases: ['Bacterial spot', 'Anthracnose', 'Phytophthora'], pests: ['Aphids', 'Thrips', 'Hornworms'], nutritionalDeficiencies: ['Calcium deficiency', 'Magnesium deficiency'], environmentalStresses: ['Temperature fluctuations', 'Water stress']
    },
    companions: { beneficial: ['basil', 'tomatoes'], antagonistic: ['fennel'] },
    specialRequirements: { pruning: true, staking: true, trellising: false, pollination: 'self', vernalization: false }
  },

  {
    id: 'cucumber-mini',
    name: 'Mini Cucumber',
    scientificName: 'Cucumis sativus',
    category: 'fruiting',
    subCategory: 'cucurbits',
    growthHabit: 'indeterminate',
    matureHeight: [150, 300],
    matureSpread: [30, 50],
    leafAreaIndex: 4.0,
    canopyDensity: 'dense',
    seedToTransplant: 21,
    transplantToFirstHarvest: 50,
    harvestWindow: 60,
    totalCropCycle: 131,
    lightRequirements: {
      seedling: { ppfd: [150, 250], dli: [10, 16], photoperiod: 16, spectrum: { blue: 20, green: 25, red: 50, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [400, 600], dli: [20, 30], photoperiod: 16, spectrum: { blue: 15, green: 25, red: 55, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [600, 800], dli: [25, 35], photoperiod: 14, spectrum: { blue: 10, green: 20, red: 60, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [22, 28], minimum: 16, maximum: 35 },
      humidity: { seedling: [75, 85], vegetative: [65, 75], reproductive: [60, 70] },
      co2: { ambient: 400, enriched: 1000 },
      airflow: { minimum: 0.4, optimal: 0.8 }
    },
    spacing: { inRow: 30, betweenRows: 100, plantsPerSqFt: 0.5, plantsPerSqM: 5.4 },
    nutrition: { calories: 16, protein: 0.7, carbs: 4.0, fiber: 0.5, vitamins: ['Vitamin K', 'Vitamin C'], minerals: ['Potassium', 'Magnesium'] },
    market: { averagePrice: 4.00, retailPrice: 7.99, shelfLife: 7, demandTrend: 'growing', seasonality: 'Summer peak' },
    commonIssues: {
      diseases: ['Powdery mildew', 'Downy mildew', 'Bacterial wilt'], pests: ['Cucumber beetles', 'Aphids', 'Spider mites'], nutritionalDeficiencies: ['Magnesium deficiency', 'Potassium deficiency'], environmentalStresses: ['Temperature stress', 'Water stress']
    },
    companions: { beneficial: ['radish', 'lettuce'], antagonistic: ['tomatoes'] },
    specialRequirements: { pruning: true, staking: false, trellising: true, pollination: 'insect', vernalization: false }
  },

  // ROOT VEGETABLES
  {
    id: 'radish-french-breakfast',
    name: 'French Breakfast Radish',
    scientificName: 'Raphanus sativus',
    category: 'root-vegetables',
    subCategory: 'brassica',
    growthHabit: 'determinate',
    matureHeight: [15, 25],
    matureSpread: [10, 15],
    leafAreaIndex: 1.5,
    canopyDensity: 'light',
    seedToTransplant: 0,
    transplantToFirstHarvest: 25,
    harvestWindow: 7,
    totalCropCycle: 32,
    lightRequirements: {
      seedling: { ppfd: [100, 200], dli: [8, 14], photoperiod: 16, spectrum: { blue: 30, green: 25, red: 40, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [250, 400], dli: [16, 24], photoperiod: 16, spectrum: { blue: 35, green: 25, red: 35, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [300, 450], dli: [18, 26], photoperiod: 14, spectrum: { blue: 30, green: 25, red: 40, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [10, 18], minimum: -2, maximum: 25 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 600 },
      airflow: { minimum: 0.1, optimal: 0.3 }
    },
    spacing: { inRow: 5, betweenRows: 10, plantsPerSqFt: 28.8, plantsPerSqM: 310 },
    nutrition: { calories: 16, protein: 0.7, carbs: 3.4, fiber: 1.6, vitamins: ['Vitamin C'], minerals: ['Potassium', 'Folate'] },
    market: { averagePrice: 8.00, retailPrice: 15.99, shelfLife: 14, demandTrend: 'stable', seasonality: 'Spring/Fall peak' },
    commonIssues: {
      diseases: ['Black root', 'Clubroot'], pests: ['Flea beetles', 'Root maggots'], nutritionalDeficiencies: ['Boron deficiency'], environmentalStresses: ['Heat stress', 'Cracking from irregular watering']
    },
    companions: { beneficial: ['lettuce', 'spinach'], antagonistic: ['grapes'] },
    specialRequirements: { pruning: false, staking: false, trellising: false, pollination: 'insect', vernalization: false }
  },

  {
    id: 'carrot-paris-market',
    name: 'Paris Market Carrot',
    scientificName: 'Daucus carota subsp. sativus',
    category: 'root-vegetables',
    subCategory: 'umbelliferae',
    growthHabit: 'determinate',
    matureHeight: [20, 30],
    matureSpread: [8, 12],
    leafAreaIndex: 2.0,
    canopyDensity: 'light',
    seedToTransplant: 0,
    transplantToFirstHarvest: 65,
    harvestWindow: 14,
    totalCropCycle: 79,
    lightRequirements: {
      seedling: { ppfd: [75, 175], dli: [7, 13], photoperiod: 16, spectrum: { blue: 25, green: 30, red: 40, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [200, 350], dli: [14, 22], photoperiod: 16, spectrum: { blue: 20, green: 30, red: 45, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [250, 400], dli: [16, 24], photoperiod: 14, spectrum: { blue: 15, green: 25, red: 55, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [15, 20], minimum: -4, maximum: 25 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 700 },
      airflow: { minimum: 0.1, optimal: 0.3 }
    },
    spacing: { inRow: 5, betweenRows: 15, plantsPerSqFt: 19.2, plantsPerSqM: 207 },
    nutrition: { calories: 41, protein: 0.9, carbs: 9.6, fiber: 2.8, vitamins: ['Vitamin A', 'Vitamin K'], minerals: ['Potassium', 'Biotin'] },
    market: { averagePrice: 5.50, retailPrice: 10.99, shelfLife: 21, demandTrend: 'stable', seasonality: 'Fall/Winter peak' },
    commonIssues: {
      diseases: ['Alternaria leaf blight', 'Cavity spot'], pests: ['Carrot fly', 'Wireworms'], nutritionalDeficiencies: ['Boron deficiency'], environmentalStresses: ['Forking from obstacles', 'Cracking']
    },
    companions: { beneficial: ['lettuce', 'onions'], antagonistic: ['dill'] },
    specialRequirements: { pruning: false, staking: false, trellising: false, pollination: 'insect', vernalization: false }
  },

  // MORE CANNABIS STRAINS
  {
    id: 'cannabis-blue-dream',
    name: 'Blue Dream',
    scientificName: 'Cannabis sativa L.',
    category: 'cannabis',
    subCategory: 'sativa-hybrid',
    growthHabit: 'indeterminate',
    matureHeight: [120, 180],
    matureSpread: [80, 120],
    leafAreaIndex: 4.2,
    canopyDensity: 'dense',
    seedToTransplant: 14,
    transplantToFirstHarvest: 126, // 70 days flowering + 56 veg
    harvestWindow: 7,
    totalCropCycle: 147,
    lightRequirements: {
      seedling: { ppfd: [100, 300], dli: [8, 15], photoperiod: 18, spectrum: { blue: 35, green: 15, red: 45, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [400, 650], dli: [25, 38], photoperiod: 18, spectrum: { blue: 30, green: 20, red: 45, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [700, 950], dli: [40, 55], photoperiod: 12, spectrum: { blue: 15, green: 15, red: 60, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [22, 26], minimum: 16, maximum: 30 },
      humidity: { seedling: [65, 75], vegetative: [55, 65], reproductive: [40, 50] },
      co2: { ambient: 400, enriched: 1200 },
      airflow: { minimum: 0.5, optimal: 1.0 }
    },
    spacing: { inRow: 150, betweenRows: 150, plantsPerSqFt: 0.06, plantsPerSqM: 0.6 },
    nutrition: { calories: 0, protein: 0, carbs: 0, fiber: 0, vitamins: ['CBD', 'THC', 'CBG'], minerals: ['Terpenes', 'Flavonoids'] },
    market: { averagePrice: 1800, retailPrice: 3600, shelfLife: 365, demandTrend: 'growing', seasonality: 'Year-round' },
    commonIssues: {
      diseases: ['Powdery mildew', 'Botrytis', 'Root rot'], pests: ['Spider mites', 'Thrips', 'Aphids'], nutritionalDeficiencies: ['Nitrogen deficiency', 'Calcium deficiency'], environmentalStresses: ['Light burn', 'Heat stress']
    },
    companions: { beneficial: [], antagonistic: [] },
    specialRequirements: { pruning: true, staking: true, trellising: true, pollination: 'wind', vernalization: false }
  },

  {
    id: 'cannabis-og-kush',
    name: 'OG Kush',
    scientificName: 'Cannabis sativa L.',
    category: 'cannabis',
    subCategory: 'indica-hybrid',
    growthHabit: 'semi-determinate',
    matureHeight: [90, 130],
    matureSpread: [70, 100],
    leafAreaIndex: 3.6,
    canopyDensity: 'dense',
    seedToTransplant: 14,
    transplantToFirstHarvest: 112, // 56 days flowering + 56 veg
    harvestWindow: 7,
    totalCropCycle: 133,
    lightRequirements: {
      seedling: { ppfd: [100, 300], dli: [8, 15], photoperiod: 18, spectrum: { blue: 40, green: 15, red: 40, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [400, 600], dli: [25, 35], photoperiod: 18, spectrum: { blue: 35, green: 20, red: 40, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [650, 850], dli: [35, 45], photoperiod: 12, spectrum: { blue: 20, green: 15, red: 55, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [20, 24], minimum: 16, maximum: 28 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [45, 55] },
      co2: { ambient: 400, enriched: 1100 },
      airflow: { minimum: 0.4, optimal: 0.8 }
    },
    spacing: { inRow: 120, betweenRows: 120, plantsPerSqFt: 0.1, plantsPerSqM: 1.1 },
    nutrition: { calories: 0, protein: 0, carbs: 0, fiber: 0, vitamins: ['CBD', 'THC', 'CBG'], minerals: ['Terpenes', 'Flavonoids'] },
    market: { averagePrice: 2200, retailPrice: 4400, shelfLife: 365, demandTrend: 'growing', seasonality: 'Year-round' },
    commonIssues: {
      diseases: ['Powdery mildew', 'Bud rot'], pests: ['Spider mites', 'Fungus gnats'], nutritionalDeficiencies: ['Potassium deficiency', 'Phosphorus deficiency'], environmentalStresses: ['Humidity fluctuations', 'Temperature stress']
    },
    companions: { beneficial: [], antagonistic: [] },
    specialRequirements: { pruning: true, staking: true, trellising: false, pollination: 'wind', vernalization: false }
  },

  // MORE MICROGREENS
  {
    id: 'microgreens-sunflower',
    name: 'Sunflower Microgreens',
    scientificName: 'Helianthus annuus',
    category: 'microgreens',
    subCategory: 'composite',
    growthHabit: 'determinate',
    matureHeight: [8, 15],
    matureSpread: [3, 6],
    leafAreaIndex: 2.0,
    canopyDensity: 'dense',
    seedToTransplant: 0,
    transplantToFirstHarvest: 12,
    harvestWindow: 3,
    totalCropCycle: 15,
    lightRequirements: {
      seedling: { ppfd: [50, 150], dli: [4, 10], photoperiod: 16, spectrum: { blue: 40, green: 20, red: 35, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [200, 400], dli: [12, 20], photoperiod: 16, spectrum: { blue: 35, green: 25, red: 35, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [300, 500], dli: [16, 24], photoperiod: 16, spectrum: { blue: 30, green: 25, red: 40, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [20, 24], minimum: 15, maximum: 28 },
      humidity: { seedling: [80, 90], vegetative: [70, 80], reproductive: [65, 75] },
      co2: { ambient: 400, enriched: 600 },
      airflow: { minimum: 0.1, optimal: 0.2 }
    },
    spacing: { inRow: 1, betweenRows: 1, plantsPerSqFt: 100, plantsPerSqM: 1076 },
    nutrition: { calories: 36, protein: 2.8, carbs: 7.4, fiber: 1.4, vitamins: ['Vitamin E', 'Vitamin B1'], minerals: ['Magnesium', 'Phosphorus'] },
    market: { averagePrice: 22.00, retailPrice: 39.99, shelfLife: 5, demandTrend: 'growing', seasonality: 'Year-round' },
    commonIssues: {
      diseases: ['Damping off', 'Root rot'], pests: ['Fungus gnats'], nutritionalDeficiencies: ['Nitrogen deficiency'], environmentalStresses: ['Overwatering', 'Poor drainage']
    },
    companions: { beneficial: [], antagonistic: [] },
    specialRequirements: { pruning: false, staking: false, trellising: false, pollination: 'self', vernalization: false }
  },

  {
    id: 'microgreens-radish-pink',
    name: 'Pink Radish Microgreens',
    scientificName: 'Raphanus sativus',
    category: 'microgreens',
    subCategory: 'brassica',
    growthHabit: 'determinate',
    matureHeight: [6, 12],
    matureSpread: [2, 4],
    leafAreaIndex: 1.8,
    canopyDensity: 'dense',
    seedToTransplant: 0,
    transplantToFirstHarvest: 8,
    harvestWindow: 2,
    totalCropCycle: 10,
    lightRequirements: {
      seedling: { ppfd: [75, 175], dli: [6, 12], photoperiod: 16, spectrum: { blue: 45, green: 15, red: 35, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [250, 450], dli: [14, 22], photoperiod: 16, spectrum: { blue: 40, green: 20, red: 35, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [350, 550], dli: [18, 26], photoperiod: 16, spectrum: { blue: 35, green: 25, red: 35, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [18, 22], minimum: 12, maximum: 26 },
      humidity: { seedling: [85, 95], vegetative: [75, 85], reproductive: [70, 80] },
      co2: { ambient: 400, enriched: 600 },
      airflow: { minimum: 0.1, optimal: 0.2 }
    },
    spacing: { inRow: 1, betweenRows: 1, plantsPerSqFt: 200, plantsPerSqM: 2153 },
    nutrition: { calories: 43, protein: 3.8, carbs: 8.1, fiber: 5.1, vitamins: ['Vitamin C', 'Vitamin K'], minerals: ['Calcium', 'Iron'] },
    market: { averagePrice: 30.00, retailPrice: 54.99, shelfLife: 4, demandTrend: 'growing', seasonality: 'Year-round' },
    commonIssues: {
      diseases: ['Damping off'], pests: ['Fungus gnats', 'Aphids'], nutritionalDeficiencies: ['Iron deficiency'], environmentalStresses: ['Overwatering', 'Heat stress']
    },
    companions: { beneficial: [], antagonistic: [] },
    specialRequirements: { pruning: false, staking: false, trellising: false, pollination: 'self', vernalization: false }
  },

  // FLOWERS & ORNAMENTALS
  {
    id: 'petunia-wave',
    name: 'Wave Petunia',
    scientificName: 'Petunia × atkinsiana',
    category: 'flowers',
    subCategory: 'annual',
    growthHabit: 'indeterminate',
    matureHeight: [15, 25],
    matureSpread: [30, 90],
    leafAreaIndex: 2.5,
    canopyDensity: 'medium',
    seedToTransplant: 49,
    transplantToFirstHarvest: 70,
    harvestWindow: 120,
    totalCropCycle: 239,
    lightRequirements: {
      seedling: { ppfd: [100, 200], dli: [8, 14], photoperiod: 16, spectrum: { blue: 25, green: 20, red: 50, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [300, 500], dli: [18, 28], photoperiod: 16, spectrum: { blue: 20, green: 20, red: 55, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [400, 600], dli: [22, 32], photoperiod: 14, spectrum: { blue: 15, green: 15, red: 60, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [18, 24], minimum: 10, maximum: 30 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 800 },
      airflow: { minimum: 0.2, optimal: 0.4 }
    },
    spacing: { inRow: 20, betweenRows: 25, plantsPerSqFt: 2.9, plantsPerSqM: 31 },
    nutrition: { calories: 0, protein: 0, carbs: 0, fiber: 0, vitamins: [], minerals: [] },
    market: { averagePrice: 12.00, retailPrice: 24.99, shelfLife: 90, demandTrend: 'stable', seasonality: 'Spring/Summer peak' },
    commonIssues: {
      diseases: ['Botrytis', 'Verticillium wilt'], pests: ['Aphids', 'Whitefly', 'Caterpillars'], nutritionalDeficiencies: ['Iron deficiency', 'Magnesium deficiency'], environmentalStresses: ['Heat stress', 'Overwatering']
    },
    companions: { beneficial: ['marigold', 'alyssum'], antagonistic: [] },
    specialRequirements: { pruning: true, staking: false, trellising: false, pollination: 'insect', vernalization: false }
  },

  // VINING CROPS
  {
    id: 'strawberry-alpine',
    name: 'Alpine Strawberry',
    scientificName: 'Fragaria vesca',
    category: 'vines',
    subCategory: 'rosaceae',
    growthHabit: 'indeterminate',
    matureHeight: [15, 25],
    matureSpread: [25, 40],
    leafAreaIndex: 2.8,
    canopyDensity: 'medium',
    seedToTransplant: 42,
    transplantToFirstHarvest: 120,
    harvestWindow: 180,
    totalCropCycle: 342,
    lightRequirements: {
      seedling: { ppfd: [100, 200], dli: [8, 14], photoperiod: 16, spectrum: { blue: 25, green: 25, red: 45, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [300, 500], dli: [18, 28], photoperiod: 16, spectrum: { blue: 20, green: 25, red: 50, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [400, 600], dli: [22, 32], photoperiod: 12, spectrum: { blue: 15, green: 20, red: 55, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [18, 22], minimum: -10, maximum: 28 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 900 },
      airflow: { minimum: 0.2, optimal: 0.4 }
    },
    spacing: { inRow: 30, betweenRows: 40, plantsPerSqFt: 1.2, plantsPerSqM: 13 },
    nutrition: { calories: 32, protein: 0.7, carbs: 7.7, fiber: 2.0, vitamins: ['Vitamin C', 'Folate'], minerals: ['Potassium', 'Manganese'] },
    market: { averagePrice: 18.00, retailPrice: 34.99, shelfLife: 3, demandTrend: 'growing', seasonality: 'Summer peak' },
    commonIssues: {
      diseases: ['Gray mold', 'Powdery mildew', 'Verticillium wilt'], pests: ['Spider mites', 'Aphids', 'Thrips'], nutritionalDeficiencies: ['Iron deficiency', 'Potassium deficiency'], environmentalStresses: ['Crown rot', 'Heat stress']
    },
    companions: { beneficial: ['garlic', 'chives'], antagonistic: ['brassicas'] },
    specialRequirements: { pruning: true, staking: false, trellising: false, pollination: 'insect', vernalization: true }
  },

  // ADDITIONAL COMPREHENSIVE VARIETIES

  // MORE LEAFY GREENS
  {
    id: 'mizuna-japanese',
    name: 'Japanese Mizuna',
    scientificName: 'Brassica rapa var. nipposinica',
    category: 'leafy-greens',
    subCategory: 'asian-greens',
    growthHabit: 'indeterminate',
    matureHeight: [20, 35],
    matureSpread: [30, 45],
    leafAreaIndex: 2.4,
    canopyDensity: 'medium',
    seedToTransplant: 14,
    transplantToFirstHarvest: 35,
    harvestWindow: 60,
    totalCropCycle: 109,
    lightRequirements: {
      seedling: { ppfd: [75, 175], dli: [7, 13], photoperiod: 16, spectrum: { blue: 35, green: 20, red: 40, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [250, 400], dli: [16, 24], photoperiod: 16, spectrum: { blue: 40, green: 20, red: 35, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [300, 450], dli: [18, 26], photoperiod: 14, spectrum: { blue: 35, green: 25, red: 35, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [12, 20], minimum: -5, maximum: 25 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 800 },
      airflow: { minimum: 0.2, optimal: 0.4 }
    },
    spacing: { inRow: 15, betweenRows: 20, plantsPerSqFt: 4.0, plantsPerSqM: 43 },
    nutrition: { calories: 16, protein: 1.6, carbs: 2.8, fiber: 1.8, vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K'], minerals: ['Calcium', 'Iron'] },
    market: { averagePrice: 7.50, retailPrice: 14.99, shelfLife: 7, demandTrend: 'growing', seasonality: 'Fall/Winter peak' },
    commonIssues: {
      diseases: ['Black rot', 'Clubroot'], pests: ['Flea beetles', 'Aphids'], nutritionalDeficiencies: ['Boron deficiency'], environmentalStresses: ['Heat stress', 'Bolting']
    },
    companions: { beneficial: ['lettuce', 'carrots'], antagonistic: ['strawberries'] },
    specialRequirements: { pruning: false, staking: false, trellising: false, pollination: 'insect', vernalization: false }
  },

  {
    id: 'watercress-upland',
    name: 'Upland Watercress',
    scientificName: 'Barbarea verna',
    category: 'leafy-greens',
    subCategory: 'brassica',
    growthHabit: 'indeterminate',
    matureHeight: [15, 30],
    matureSpread: [20, 30],
    leafAreaIndex: 2.0,
    canopyDensity: 'medium',
    seedToTransplant: 21,
    transplantToFirstHarvest: 45,
    harvestWindow: 90,
    totalCropCycle: 156,
    lightRequirements: {
      seedling: { ppfd: [50, 150], dli: [6, 12], photoperiod: 16, spectrum: { blue: 40, green: 20, red: 35, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [200, 350], dli: [14, 22], photoperiod: 16, spectrum: { blue: 45, green: 20, red: 30, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [250, 400], dli: [16, 24], photoperiod: 14, spectrum: { blue: 40, green: 25, red: 30, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [10, 18], minimum: -8, maximum: 22 },
      humidity: { seedling: [80, 90], vegetative: [70, 80], reproductive: [65, 75] },
      co2: { ambient: 400, enriched: 600 },
      airflow: { minimum: 0.1, optimal: 0.3 }
    },
    spacing: { inRow: 12, betweenRows: 15, plantsPerSqFt: 8.0, plantsPerSqM: 86 },
    nutrition: { calories: 11, protein: 2.3, carbs: 1.3, fiber: 0.5, vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K'], minerals: ['Calcium', 'Iron', 'Iodine'] },
    market: { averagePrice: 18.00, retailPrice: 34.99, shelfLife: 5, demandTrend: 'growing', seasonality: 'Winter peak' },
    commonIssues: {
      diseases: ['White rust', 'Downy mildew'], pests: ['Aphids', 'Leaf miners'], nutritionalDeficiencies: ['Iron deficiency'], environmentalStresses: ['Heat stress', 'Drought stress']
    },
    companions: { beneficial: ['lettuce', 'spinach'], antagonistic: ['fennel'] },
    specialRequirements: { pruning: false, staking: false, trellising: false, pollination: 'insect', vernalization: false }
  },

  // MORE HERBS
  {
    id: 'rosemary-upright',
    name: 'Upright Rosemary',
    scientificName: 'Rosmarinus officinalis',
    category: 'herbs',
    subCategory: 'mediterranean',
    growthHabit: 'indeterminate',
    matureHeight: [60, 120],
    matureSpread: [40, 80],
    leafAreaIndex: 1.8,
    canopyDensity: 'light',
    seedToTransplant: 42,
    transplantToFirstHarvest: 90,
    harvestWindow: 365,
    totalCropCycle: 497,
    lightRequirements: {
      seedling: { ppfd: [100, 200], dli: [8, 14], photoperiod: 16, spectrum: { blue: 20, green: 15, red: 60, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [300, 500], dli: [18, 28], photoperiod: 16, spectrum: { blue: 15, green: 15, red: 65, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [400, 600], dli: [22, 32], photoperiod: 14, spectrum: { blue: 10, green: 10, red: 70, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [18, 28], minimum: 5, maximum: 40 },
      humidity: { seedling: [60, 70], vegetative: [50, 60], reproductive: [45, 55] },
      co2: { ambient: 400, enriched: 800 },
      airflow: { minimum: 0.3, optimal: 0.6 }
    },
    spacing: { inRow: 45, betweenRows: 60, plantsPerSqFt: 0.5, plantsPerSqM: 5.4 },
    nutrition: { calories: 131, protein: 3.3, carbs: 21, fiber: 14.1, vitamins: ['Vitamin A', 'Vitamin C'], minerals: ['Calcium', 'Iron', 'Manganese'] },
    market: { averagePrice: 20.00, retailPrice: 39.99, shelfLife: 21, demandTrend: 'stable', seasonality: 'Year-round' },
    commonIssues: {
      diseases: ['Root rot', 'Powdery mildew'], pests: ['Spider mites', 'Scale insects'], nutritionalDeficiencies: ['Iron deficiency'], environmentalStresses: ['Overwatering', 'Cold damage']
    },
    companions: { beneficial: ['carrots', 'beans'], antagonistic: ['cucumber'] },
    specialRequirements: { pruning: true, staking: false, trellising: false, pollination: 'insect', vernalization: false }
  },

  {
    id: 'thyme-english',
    name: 'English Thyme',
    scientificName: 'Thymus vulgaris',
    category: 'herbs',
    subCategory: 'mediterranean',
    growthHabit: 'indeterminate',
    matureHeight: [20, 30],
    matureSpread: [25, 40],
    leafAreaIndex: 1.2,
    canopyDensity: 'light',
    seedToTransplant: 28,
    transplantToFirstHarvest: 75,
    harvestWindow: 180,
    totalCropCycle: 283,
    lightRequirements: {
      seedling: { ppfd: [75, 175], dli: [7, 13], photoperiod: 16, spectrum: { blue: 25, green: 15, red: 55, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [250, 400], dli: [16, 24], photoperiod: 16, spectrum: { blue: 20, green: 15, red: 60, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [350, 550], dli: [20, 30], photoperiod: 14, spectrum: { blue: 15, green: 10, red: 65, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [15, 25], minimum: -10, maximum: 35 },
      humidity: { seedling: [65, 75], vegetative: [55, 65], reproductive: [50, 60] },
      co2: { ambient: 400, enriched: 800 },
      airflow: { minimum: 0.2, optimal: 0.4 }
    },
    spacing: { inRow: 20, betweenRows: 25, plantsPerSqFt: 2.9, plantsPerSqM: 31 },
    nutrition: { calories: 101, protein: 5.6, carbs: 24, fiber: 14, vitamins: ['Vitamin C', 'Vitamin A'], minerals: ['Iron', 'Manganese', 'Calcium'] },
    market: { averagePrice: 16.00, retailPrice: 31.99, shelfLife: 14, demandTrend: 'stable', seasonality: 'Summer peak' },
    commonIssues: {
      diseases: ['Root rot', 'Gray mold'], pests: ['Spider mites', 'Aphids'], nutritionalDeficiencies: ['Iron deficiency'], environmentalStresses: ['Overwatering', 'Humidity stress']
    },
    companions: { beneficial: ['tomatoes', 'eggplant'], antagonistic: ['cucumber'] },
    specialRequirements: { pruning: true, staking: false, trellising: false, pollination: 'insect', vernalization: false }
  },

  {
    id: 'sage-common',
    name: 'Common Sage',
    scientificName: 'Salvia officinalis',
    category: 'herbs',
    subCategory: 'mediterranean',
    growthHabit: 'indeterminate',
    matureHeight: [30, 60],
    matureSpread: [30, 60],
    leafAreaIndex: 1.6,
    canopyDensity: 'medium',
    seedToTransplant: 35,
    transplantToFirstHarvest: 75,
    harvestWindow: 240,
    totalCropCycle: 350,
    lightRequirements: {
      seedling: { ppfd: [100, 200], dli: [8, 14], photoperiod: 16, spectrum: { blue: 25, green: 15, red: 55, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [300, 500], dli: [18, 28], photoperiod: 16, spectrum: { blue: 20, green: 15, red: 60, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [400, 600], dli: [22, 32], photoperiod: 14, spectrum: { blue: 15, green: 10, red: 65, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [18, 24], minimum: -5, maximum: 32 },
      humidity: { seedling: [65, 75], vegetative: [55, 65], reproductive: [50, 60] },
      co2: { ambient: 400, enriched: 900 },
      airflow: { minimum: 0.3, optimal: 0.5 }
    },
    spacing: { inRow: 30, betweenRows: 40, plantsPerSqFt: 1.2, plantsPerSqM: 13 },
    nutrition: { calories: 315, protein: 10.6, carbs: 61, fiber: 40.3, vitamins: ['Vitamin K', 'Vitamin A'], minerals: ['Calcium', 'Iron', 'Manganese'] },
    market: { averagePrice: 18.00, retailPrice: 34.99, shelfLife: 14, demandTrend: 'stable', seasonality: 'Fall peak' },
    commonIssues: {
      diseases: ['Powdery mildew', 'Root rot'], pests: ['Spider mites', 'Whitefly'], nutritionalDeficiencies: ['Iron deficiency'], environmentalStresses: ['Overwatering', 'High humidity']
    },
    companions: { beneficial: ['tomatoes', 'carrots'], antagonistic: ['cucumber', 'onions'] },
    specialRequirements: { pruning: true, staking: false, trellising: false, pollination: 'insect', vernalization: false }
  },

  // MORE FRUITING VEGETABLES
  {
    id: 'eggplant-japanese',
    name: 'Japanese Eggplant',
    scientificName: 'Solanum melongena',
    category: 'fruiting',
    subCategory: 'solanaceae',
    growthHabit: 'indeterminate',
    matureHeight: [60, 100],
    matureSpread: [45, 75],
    leafAreaIndex: 3.8,
    canopyDensity: 'dense',
    seedToTransplant: 56,
    transplantToFirstHarvest: 70,
    harvestWindow: 90,
    totalCropCycle: 216,
    lightRequirements: {
      seedling: { ppfd: [150, 250], dli: [10, 16], photoperiod: 16, spectrum: { blue: 25, green: 20, red: 50, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [400, 600], dli: [20, 30], photoperiod: 16, spectrum: { blue: 20, green: 20, red: 55, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [600, 800], dli: [25, 35], photoperiod: 12, spectrum: { blue: 15, green: 15, red: 60, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [24, 30], minimum: 18, maximum: 35 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 1200 },
      airflow: { minimum: 0.3, optimal: 0.6 }
    },
    spacing: { inRow: 45, betweenRows: 60, plantsPerSqFt: 0.5, plantsPerSqM: 5.4 },
    nutrition: { calories: 25, protein: 1.0, carbs: 6.0, fiber: 3.0, vitamins: ['Vitamin K', 'Vitamin C'], minerals: ['Potassium', 'Manganese'] },
    market: { averagePrice: 4.50, retailPrice: 8.99, shelfLife: 7, demandTrend: 'growing', seasonality: 'Summer peak' },
    commonIssues: {
      diseases: ['Verticillium wilt', 'Bacterial wilt'], pests: ['Flea beetles', 'Colorado potato beetle'], nutritionalDeficiencies: ['Magnesium deficiency', 'Calcium deficiency'], environmentalStresses: ['Temperature stress', 'Water stress']
    },
    companions: { beneficial: ['tomatoes', 'peppers'], antagonistic: ['fennel'] },
    specialRequirements: { pruning: true, staking: true, trellising: false, pollination: 'self', vernalization: false }
  },

  {
    id: 'okra-clemson',
    name: 'Clemson Spineless Okra',
    scientificName: 'Abelmoschus esculentus',
    category: 'fruiting',
    subCategory: 'malvaceae',
    growthHabit: 'indeterminate',
    matureHeight: [120, 200],
    matureSpread: [60, 90],
    leafAreaIndex: 4.5,
    canopyDensity: 'dense',
    seedToTransplant: 21,
    transplantToFirstHarvest: 60,
    harvestWindow: 90,
    totalCropCycle: 171,
    lightRequirements: {
      seedling: { ppfd: [150, 250], dli: [10, 16], photoperiod: 16, spectrum: { blue: 20, green: 25, red: 50, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [400, 650], dli: [20, 32], photoperiod: 16, spectrum: { blue: 15, green: 25, red: 55, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [600, 900], dli: [25, 40], photoperiod: 14, spectrum: { blue: 10, green: 20, red: 60, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [26, 32], minimum: 20, maximum: 40 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 1000 },
      airflow: { minimum: 0.4, optimal: 0.8 }
    },
    spacing: { inRow: 30, betweenRows: 90, plantsPerSqFt: 0.5, plantsPerSqM: 5.4 },
    nutrition: { calories: 33, protein: 1.9, carbs: 7.5, fiber: 3.2, vitamins: ['Vitamin C', 'Vitamin K'], minerals: ['Folate', 'Magnesium'] },
    market: { averagePrice: 6.00, retailPrice: 11.99, shelfLife: 3, demandTrend: 'stable', seasonality: 'Summer peak' },
    commonIssues: {
      diseases: ['Fusarium wilt', 'Powdery mildew'], pests: ['Aphids', 'Corn earworm'], nutritionalDeficiencies: ['Potassium deficiency'], environmentalStresses: ['Cold damage', 'Water stress']
    },
    companions: { beneficial: ['tomatoes', 'peppers'], antagonistic: ['fennel'] },
    specialRequirements: { pruning: true, staking: true, trellising: false, pollination: 'insect', vernalization: false }
  },

  // MORE ROOT VEGETABLES
  {
    id: 'beet-detroit-dark-red',
    name: 'Detroit Dark Red Beet',
    scientificName: 'Beta vulgaris',
    category: 'root-vegetables',
    subCategory: 'chenopodiaceae',
    growthHabit: 'determinate',
    matureHeight: [25, 40],
    matureSpread: [15, 25],
    leafAreaIndex: 2.5,
    canopyDensity: 'medium',
    seedToTransplant: 0,
    transplantToFirstHarvest: 55,
    harvestWindow: 14,
    totalCropCycle: 69,
    lightRequirements: {
      seedling: { ppfd: [75, 175], dli: [7, 13], photoperiod: 16, spectrum: { blue: 30, green: 25, red: 40, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [200, 350], dli: [14, 22], photoperiod: 16, spectrum: { blue: 25, green: 30, red: 40, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [250, 400], dli: [16, 24], photoperiod: 14, spectrum: { blue: 20, green: 25, red: 50, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [15, 20], minimum: -2, maximum: 25 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 700 },
      airflow: { minimum: 0.1, optimal: 0.3 }
    },
    spacing: { inRow: 8, betweenRows: 15, plantsPerSqFt: 12.0, plantsPerSqM: 129 },
    nutrition: { calories: 43, protein: 1.6, carbs: 10, fiber: 2.8, vitamins: ['Folate', 'Vitamin C'], minerals: ['Potassium', 'Manganese'] },
    market: { averagePrice: 4.50, retailPrice: 8.99, shelfLife: 28, demandTrend: 'stable', seasonality: 'Fall peak' },
    commonIssues: {
      diseases: ['Cercospora leaf spot', 'Downy mildew'], pests: ['Leaf miners', 'Flea beetles'], nutritionalDeficiencies: ['Boron deficiency'], environmentalStresses: ['Heat stress', 'Zoning from temperature fluctuations']
    },
    companions: { beneficial: ['lettuce', 'onions'], antagonistic: ['pole beans'] },
    specialRequirements: { pruning: false, staking: false, trellising: false, pollination: 'wind', vernalization: false }
  },

  {
    id: 'turnip-purple-top',
    name: 'Purple Top White Globe Turnip',
    scientificName: 'Brassica rapa subsp. rapa',
    category: 'root-vegetables',
    subCategory: 'brassica',
    growthHabit: 'determinate',
    matureHeight: [20, 30],
    matureSpread: [15, 25],
    leafAreaIndex: 2.2,
    canopyDensity: 'medium',
    seedToTransplant: 0,
    transplantToFirstHarvest: 45,
    harvestWindow: 14,
    totalCropCycle: 59,
    lightRequirements: {
      seedling: { ppfd: [100, 200], dli: [8, 14], photoperiod: 16, spectrum: { blue: 35, green: 20, red: 40, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [250, 400], dli: [16, 24], photoperiod: 16, spectrum: { blue: 40, green: 20, red: 35, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [300, 450], dli: [18, 26], photoperiod: 14, spectrum: { blue: 35, green: 25, red: 35, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [10, 18], minimum: -6, maximum: 24 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [55, 65] },
      co2: { ambient: 400, enriched: 700 },
      airflow: { minimum: 0.1, optimal: 0.3 }
    },
    spacing: { inRow: 10, betweenRows: 15, plantsPerSqFt: 9.6, plantsPerSqM: 103 },
    nutrition: { calories: 28, protein: 0.9, carbs: 6.4, fiber: 1.8, vitamins: ['Vitamin C', 'Vitamin K'], minerals: ['Potassium', 'Calcium'] },
    market: { averagePrice: 3.50, retailPrice: 6.99, shelfLife: 21, demandTrend: 'stable', seasonality: 'Fall/Winter peak' },
    commonIssues: {
      diseases: ['Clubroot', 'Black rot'], pests: ['Flea beetles', 'Root maggots'], nutritionalDeficiencies: ['Boron deficiency'], environmentalStresses: ['Heat stress', 'Bolting']
    },
    companions: { beneficial: ['peas', 'lettuce'], antagonistic: ['strawberries'] },
    specialRequirements: { pruning: false, staking: false, trellising: false, pollination: 'insect', vernalization: false }
  },

  // MORE CANNABIS VARIETIES
  {
    id: 'cannabis-white-widow',
    name: 'White Widow',
    scientificName: 'Cannabis sativa L.',
    category: 'cannabis',
    subCategory: 'balanced-hybrid',
    growthHabit: 'indeterminate',
    matureHeight: [100, 150],
    matureSpread: [80, 120],
    leafAreaIndex: 3.9,
    canopyDensity: 'dense',
    seedToTransplant: 14,
    transplantToFirstHarvest: 119, // 63 days flowering + 56 veg
    harvestWindow: 7,
    totalCropCycle: 140,
    lightRequirements: {
      seedling: { ppfd: [100, 300], dli: [8, 15], photoperiod: 18, spectrum: { blue: 35, green: 15, red: 45, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [400, 600], dli: [25, 35], photoperiod: 18, spectrum: { blue: 30, green: 20, red: 45, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [700, 900], dli: [40, 50], photoperiod: 12, spectrum: { blue: 15, green: 15, red: 60, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [22, 26], minimum: 16, maximum: 30 },
      humidity: { seedling: [65, 75], vegetative: [55, 65], reproductive: [40, 50] },
      co2: { ambient: 400, enriched: 1200 },
      airflow: { minimum: 0.5, optimal: 1.0 }
    },
    spacing: { inRow: 120, betweenRows: 120, plantsPerSqFt: 0.1, plantsPerSqM: 1.1 },
    nutrition: { calories: 0, protein: 0, carbs: 0, fiber: 0, vitamins: ['CBD', 'THC', 'CBG'], minerals: ['Terpenes', 'Flavonoids'] },
    market: { averagePrice: 2000, retailPrice: 4000, shelfLife: 365, demandTrend: 'growing', seasonality: 'Year-round' },
    commonIssues: {
      diseases: ['Powdery mildew', 'Botrytis'], pests: ['Spider mites', 'Thrips'], nutritionalDeficiencies: ['Nitrogen deficiency', 'Potassium deficiency'], environmentalStresses: ['Light burn', 'Temperature stress']
    },
    companions: { beneficial: [], antagonistic: [] },
    specialRequirements: { pruning: true, staking: true, trellising: true, pollination: 'wind', vernalization: false }
  },

  {
    id: 'cannabis-northern-lights',
    name: 'Northern Lights',
    scientificName: 'Cannabis sativa L.',
    category: 'cannabis',
    subCategory: 'indica',
    growthHabit: 'semi-determinate',
    matureHeight: [80, 120],
    matureSpread: [60, 90],
    leafAreaIndex: 3.4,
    canopyDensity: 'dense',
    seedToTransplant: 14,
    transplantToFirstHarvest: 105, // 49 days flowering + 56 veg
    harvestWindow: 7,
    totalCropCycle: 126,
    lightRequirements: {
      seedling: { ppfd: [100, 300], dli: [8, 15], photoperiod: 18, spectrum: { blue: 40, green: 15, red: 40, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [350, 550], dli: [22, 32], photoperiod: 18, spectrum: { blue: 35, green: 20, red: 40, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [600, 800], dli: [35, 45], photoperiod: 12, spectrum: { blue: 20, green: 15, red: 55, farRed: 5, uv: 5 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [20, 24], minimum: 16, maximum: 28 },
      humidity: { seedling: [70, 80], vegetative: [60, 70], reproductive: [45, 55] },
      co2: { ambient: 400, enriched: 1100 },
      airflow: { minimum: 0.4, optimal: 0.8 }
    },
    spacing: { inRow: 100, betweenRows: 100, plantsPerSqFt: 0.14, plantsPerSqM: 1.5 },
    nutrition: { calories: 0, protein: 0, carbs: 0, fiber: 0, vitamins: ['CBD', 'THC', 'CBG'], minerals: ['Terpenes', 'Flavonoids'] },
    market: { averagePrice: 2100, retailPrice: 4200, shelfLife: 365, demandTrend: 'growing', seasonality: 'Year-round' },
    commonIssues: {
      diseases: ['Bud rot', 'Root rot'], pests: ['Fungus gnats', 'Spider mites'], nutritionalDeficiencies: ['Phosphorus deficiency', 'Magnesium deficiency'], environmentalStresses: ['Humidity fluctuations', 'Cold stress']
    },
    companions: { beneficial: [], antagonistic: [] },
    specialRequirements: { pruning: true, staking: true, trellising: false, pollination: 'wind', vernalization: false }
  },

  // MORE MICROGREENS
  {
    id: 'microgreens-broccoli',
    name: 'Broccoli Microgreens',
    scientificName: 'Brassica oleracea var. italica',
    category: 'microgreens',
    subCategory: 'brassica',
    growthHabit: 'determinate',
    matureHeight: [5, 10],
    matureSpread: [2, 4],
    leafAreaIndex: 1.6,
    canopyDensity: 'dense',
    seedToTransplant: 0,
    transplantToFirstHarvest: 10,
    harvestWindow: 2,
    totalCropCycle: 12,
    lightRequirements: {
      seedling: { ppfd: [75, 175], dli: [6, 12], photoperiod: 16, spectrum: { blue: 45, green: 15, red: 35, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [250, 450], dli: [14, 22], photoperiod: 16, spectrum: { blue: 40, green: 20, red: 35, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [350, 550], dli: [18, 26], photoperiod: 16, spectrum: { blue: 35, green: 25, red: 35, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [18, 22], minimum: 12, maximum: 26 },
      humidity: { seedling: [85, 95], vegetative: [75, 85], reproductive: [70, 80] },
      co2: { ambient: 400, enriched: 600 },
      airflow: { minimum: 0.1, optimal: 0.2 }
    },
    spacing: { inRow: 1, betweenRows: 1, plantsPerSqFt: 180, plantsPerSqM: 1938 },
    nutrition: { calories: 28, protein: 3.0, carbs: 5.5, fiber: 3.8, vitamins: ['Vitamin C', 'Vitamin K'], minerals: ['Calcium', 'Iron'] },
    market: { averagePrice: 28.00, retailPrice: 49.99, shelfLife: 5, demandTrend: 'growing', seasonality: 'Year-round' },
    commonIssues: {
      diseases: ['Damping off'], pests: ['Fungus gnats'], nutritionalDeficiencies: ['Iron deficiency'], environmentalStresses: ['Overwatering', 'Heat stress']
    },
    companions: { beneficial: [], antagonistic: [] },
    specialRequirements: { pruning: false, staking: false, trellising: false, pollination: 'self', vernalization: false }
  },

  {
    id: 'microgreens-amaranth',
    name: 'Red Amaranth Microgreens',
    scientificName: 'Amaranthus tricolor',
    category: 'microgreens',
    subCategory: 'amaranthaceae',
    growthHabit: 'determinate',
    matureHeight: [6, 12],
    matureSpread: [2, 4],
    leafAreaIndex: 1.4,
    canopyDensity: 'medium',
    seedToTransplant: 0,
    transplantToFirstHarvest: 14,
    harvestWindow: 3,
    totalCropCycle: 17,
    lightRequirements: {
      seedling: { ppfd: [100, 200], dli: [8, 14], photoperiod: 16, spectrum: { blue: 35, green: 20, red: 40, farRed: 3, uv: 2 } },
      vegetative: { ppfd: [300, 500], dli: [16, 24], photoperiod: 16, spectrum: { blue: 30, green: 25, red: 40, farRed: 3, uv: 2 } },
      reproductive: { ppfd: [400, 600], dli: [20, 28], photoperiod: 16, spectrum: { blue: 25, green: 25, red: 45, farRed: 3, uv: 2 } }
    },
    environmentalRequirements: {
      temperature: { optimal: [20, 25], minimum: 15, maximum: 30 },
      humidity: { seedling: [80, 90], vegetative: [70, 80], reproductive: [65, 75] },
      co2: { ambient: 400, enriched: 600 },
      airflow: { minimum: 0.1, optimal: 0.2 }
    },
    spacing: { inRow: 1, betweenRows: 1, plantsPerSqFt: 120, plantsPerSqM: 1291 },
    nutrition: { calories: 23, protein: 2.5, carbs: 4.2, fiber: 2.1, vitamins: ['Vitamin A', 'Vitamin C'], minerals: ['Iron', 'Calcium'] },
    market: { averagePrice: 32.00, retailPrice: 59.99, shelfLife: 5, demandTrend: 'growing', seasonality: 'Year-round' },
    commonIssues: {
      diseases: ['Damping off', 'Root rot'], pests: ['Fungus gnats'], nutritionalDeficiencies: ['Iron deficiency'], environmentalStresses: ['Overwatering', 'Cold stress']
    },
    companions: { beneficial: [], antagonistic: [] },
    specialRequirements: { pruning: false, staking: false, trellising: false, pollination: 'wind', vernalization: false }
  }
];

// Helper functions for database queries
export function getCropsByCategory(category: CropVariety['category']): CropVariety[] {
  return HORTICULTURAL_CROP_DATABASE.filter(crop => crop.category === category);
}

export function getCropById(id: string): CropVariety | undefined {
  return HORTICULTURAL_CROP_DATABASE.find(crop => crop.id === id);
}

export function searchCrops(query: string): CropVariety[] {
  const lowercaseQuery = query.toLowerCase();
  return HORTICULTURAL_CROP_DATABASE.filter(crop => 
    crop.name.toLowerCase().includes(lowercaseQuery) ||
    crop.scientificName.toLowerCase().includes(lowercaseQuery) ||
    crop.category.toLowerCase().includes(lowercaseQuery) ||
    crop.subCategory.toLowerCase().includes(lowercaseQuery)
  );
}

export function getCropsByGrowthTime(maxDays: number): CropVariety[] {
  return HORTICULTURAL_CROP_DATABASE.filter(crop => crop.totalCropCycle <= maxDays);
}

export function getCropsBySpacing(plantsPerSqFt: number, tolerance: number = 0.5): CropVariety[] {
  return HORTICULTURAL_CROP_DATABASE.filter(crop => 
    Math.abs(crop.spacing.plantsPerSqFt - plantsPerSqFt) <= tolerance
  );
}