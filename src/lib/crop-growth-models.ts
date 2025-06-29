// Comprehensive crop growth models and light recipes for professional greenhouse operations

export interface CropGrowthStage {
  name: string;
  duration: number; // days
  dliTarget: number; // mol/m²/day
  ppfdTarget: number; // μmol/m²/s
  photoperiod: number; // hours
  temperature: { day: number; night: number }; // °C
  humidity: { min: number; max: number }; // %
  co2Target: number; // ppm
  vpd: { min: number; max: number }; // kPa
  spectrum: {
    blue: number; // %
    green: number; // %
    red: number; // %
    farRed: number; // %
    uv: number; // %
  };
  wateringFrequency: number; // times per day
  ecTarget: number; // mS/cm
  phTarget: number;
}

export interface CropModel {
  id: string;
  name: string;
  scientificName: string;
  category: 'leafy_greens' | 'vine_crops' | 'herbs' | 'cannabis' | 'ornamentals' | 'berries' | 'microgreens';
  totalCycleDays: number;
  stages: CropGrowthStage[];
  yieldPotential: number; // kg/m²
  plantDensity: number; // plants/m²
  heightAtMaturity: number; // meters
  specialRequirements: string[];
  economicValue: number; // $/kg
  marketDemand: 'high' | 'medium' | 'low';
}

export interface LightRecipe {
  id: string;
  name: string;
  description: string;
  cropIds: string[];
  stages: {
    stageName: string;
    schedule: {
      startHour: number;
      endHour: number;
      intensity: number; // % of max
      spectrum: 'full' | 'vegetative' | 'flowering' | 'custom';
      customSpectrum?: {
        blue: number;
        green: number;
        red: number;
        farRed: number;
        uv: number;
      };
    }[];
  }[];
  energySaving: number; // % compared to constant lighting
  yieldImprovement: number; // % compared to standard recipe
}

// Professional crop models database
export const CROP_MODELS: Record<string, CropModel> = {
  // Leafy Greens
  lettuce_butterhead: {
    id: 'lettuce_butterhead',
    name: 'Butterhead Lettuce',
    scientificName: 'Lactuca sativa var. capitata',
    category: 'leafy_greens',
    totalCycleDays: 35,
    stages: [
      {
        name: 'Germination',
        duration: 7,
        dliTarget: 6,
        ppfdTarget: 100,
        photoperiod: 16,
        temperature: { day: 20, night: 18 },
        humidity: { min: 70, max: 85 },
        co2Target: 400,
        vpd: { min: 0.4, max: 0.8 },
        spectrum: { blue: 30, green: 20, red: 45, farRed: 5, uv: 0 },
        wateringFrequency: 2,
        ecTarget: 0.8,
        phTarget: 5.8
      },
      {
        name: 'Seedling',
        duration: 7,
        dliTarget: 10,
        ppfdTarget: 150,
        photoperiod: 18,
        temperature: { day: 22, night: 19 },
        humidity: { min: 65, max: 75 },
        co2Target: 600,
        vpd: { min: 0.6, max: 1.0 },
        spectrum: { blue: 25, green: 20, red: 50, farRed: 5, uv: 0 },
        wateringFrequency: 3,
        ecTarget: 1.2,
        phTarget: 5.8
      },
      {
        name: 'Vegetative',
        duration: 14,
        dliTarget: 17,
        ppfdTarget: 250,
        photoperiod: 18,
        temperature: { day: 23, night: 20 },
        humidity: { min: 60, max: 70 },
        co2Target: 800,
        vpd: { min: 0.8, max: 1.2 },
        spectrum: { blue: 20, green: 20, red: 55, farRed: 5, uv: 0 },
        wateringFrequency: 4,
        ecTarget: 1.6,
        phTarget: 5.8
      },
      {
        name: 'Head Formation',
        duration: 7,
        dliTarget: 15,
        ppfdTarget: 220,
        photoperiod: 16,
        temperature: { day: 21, night: 18 },
        humidity: { min: 55, max: 65 },
        co2Target: 1000,
        vpd: { min: 0.9, max: 1.3 },
        spectrum: { blue: 15, green: 20, red: 60, farRed: 5, uv: 0 },
        wateringFrequency: 4,
        ecTarget: 1.8,
        phTarget: 5.9
      }
    ],
    yieldPotential: 5.5,
    plantDensity: 25,
    heightAtMaturity: 0.20,
    specialRequirements: ['Calcium supplementation', 'Cool night temperatures'],
    economicValue: 8.50,
    marketDemand: 'high'
  },

  // Vine Crops
  tomato_indeterminate: {
    id: 'tomato_indeterminate',
    name: 'Indeterminate Tomato',
    scientificName: 'Solanum lycopersicum',
    category: 'vine_crops',
    totalCycleDays: 120,
    stages: [
      {
        name: 'Germination',
        duration: 7,
        dliTarget: 8,
        ppfdTarget: 150,
        photoperiod: 16,
        temperature: { day: 25, night: 22 },
        humidity: { min: 75, max: 85 },
        co2Target: 400,
        vpd: { min: 0.4, max: 0.6 },
        spectrum: { blue: 30, green: 15, red: 50, farRed: 5, uv: 0 },
        wateringFrequency: 2,
        ecTarget: 1.0,
        phTarget: 6.0
      },
      {
        name: 'Seedling',
        duration: 14,
        dliTarget: 13,
        ppfdTarget: 200,
        photoperiod: 18,
        temperature: { day: 24, night: 20 },
        humidity: { min: 65, max: 75 },
        co2Target: 600,
        vpd: { min: 0.6, max: 0.9 },
        spectrum: { blue: 25, green: 15, red: 55, farRed: 5, uv: 0 },
        wateringFrequency: 3,
        ecTarget: 1.5,
        phTarget: 6.0
      },
      {
        name: 'Vegetative',
        duration: 21,
        dliTarget: 20,
        ppfdTarget: 300,
        photoperiod: 18,
        temperature: { day: 24, night: 19 },
        humidity: { min: 60, max: 70 },
        co2Target: 1000,
        vpd: { min: 0.8, max: 1.2 },
        spectrum: { blue: 20, green: 15, red: 60, farRed: 5, uv: 0 },
        wateringFrequency: 4,
        ecTarget: 2.0,
        phTarget: 6.0
      },
      {
        name: 'Flowering',
        duration: 14,
        dliTarget: 25,
        ppfdTarget: 400,
        photoperiod: 16,
        temperature: { day: 25, night: 18 },
        humidity: { min: 55, max: 65 },
        co2Target: 1200,
        vpd: { min: 1.0, max: 1.4 },
        spectrum: { blue: 15, green: 15, red: 62, farRed: 7, uv: 1 },
        wateringFrequency: 5,
        ecTarget: 2.5,
        phTarget: 6.0
      },
      {
        name: 'Fruiting',
        duration: 64,
        dliTarget: 30,
        ppfdTarget: 500,
        photoperiod: 16,
        temperature: { day: 26, night: 18 },
        humidity: { min: 50, max: 60 },
        co2Target: 1200,
        vpd: { min: 1.1, max: 1.5 },
        spectrum: { blue: 12, green: 13, red: 65, farRed: 8, uv: 2 },
        wateringFrequency: 6,
        ecTarget: 3.0,
        phTarget: 6.1
      }
    ],
    yieldPotential: 60,
    plantDensity: 2.5,
    heightAtMaturity: 3.0,
    specialRequirements: ['Support structures', 'Regular pruning', 'Pollination assistance'],
    economicValue: 4.50,
    marketDemand: 'high'
  },

  // Cannabis
  cannabis_hybrid: {
    id: 'cannabis_hybrid',
    name: 'Cannabis (Hybrid)',
    scientificName: 'Cannabis sativa × indica',
    category: 'cannabis',
    totalCycleDays: 84,
    stages: [
      {
        name: 'Clone/Seedling',
        duration: 14,
        dliTarget: 15,
        ppfdTarget: 250,
        photoperiod: 18,
        temperature: { day: 25, night: 22 },
        humidity: { min: 65, max: 75 },
        co2Target: 800,
        vpd: { min: 0.6, max: 0.9 },
        spectrum: { blue: 30, green: 20, red: 45, farRed: 5, uv: 0 },
        wateringFrequency: 2,
        ecTarget: 1.2,
        phTarget: 5.8
      },
      {
        name: 'Vegetative',
        duration: 28,
        dliTarget: 35,
        ppfdTarget: 600,
        photoperiod: 18,
        temperature: { day: 26, night: 22 },
        humidity: { min: 55, max: 65 },
        co2Target: 1200,
        vpd: { min: 0.9, max: 1.3 },
        spectrum: { blue: 25, green: 18, red: 52, farRed: 5, uv: 0 },
        wateringFrequency: 3,
        ecTarget: 1.8,
        phTarget: 5.9
      },
      {
        name: 'Pre-Flowering',
        duration: 7,
        dliTarget: 40,
        ppfdTarget: 800,
        photoperiod: 12,
        temperature: { day: 26, night: 20 },
        humidity: { min: 50, max: 60 },
        co2Target: 1200,
        vpd: { min: 1.0, max: 1.4 },
        spectrum: { blue: 20, green: 15, red: 58, farRed: 6, uv: 1 },
        wateringFrequency: 4,
        ecTarget: 2.0,
        phTarget: 6.0
      },
      {
        name: 'Flowering',
        duration: 35,
        dliTarget: 45,
        ppfdTarget: 900,
        photoperiod: 12,
        temperature: { day: 25, night: 19 },
        humidity: { min: 45, max: 55 },
        co2Target: 1000,
        vpd: { min: 1.2, max: 1.6 },
        spectrum: { blue: 15, green: 12, red: 63, farRed: 8, uv: 2 },
        wateringFrequency: 4,
        ecTarget: 2.2,
        phTarget: 6.1
      }
    ],
    yieldPotential: 0.6, // kg/m² dried flower
    plantDensity: 4,
    heightAtMaturity: 1.2,
    specialRequirements: ['Strict photoperiod control', 'Odor management', 'Security measures'],
    economicValue: 3000,
    marketDemand: 'high'
  },

  // Herbs
  basil_genovese: {
    id: 'basil_genovese',
    name: 'Genovese Basil',
    scientificName: 'Ocimum basilicum',
    category: 'herbs',
    totalCycleDays: 28,
    stages: [
      {
        name: 'Germination',
        duration: 7,
        dliTarget: 8,
        ppfdTarget: 120,
        photoperiod: 16,
        temperature: { day: 24, night: 21 },
        humidity: { min: 70, max: 80 },
        co2Target: 400,
        vpd: { min: 0.5, max: 0.8 },
        spectrum: { blue: 30, green: 20, red: 45, farRed: 5, uv: 0 },
        wateringFrequency: 2,
        ecTarget: 1.0,
        phTarget: 6.0
      },
      {
        name: 'Vegetative',
        duration: 21,
        dliTarget: 18,
        ppfdTarget: 300,
        photoperiod: 16,
        temperature: { day: 25, night: 21 },
        humidity: { min: 60, max: 70 },
        co2Target: 800,
        vpd: { min: 0.8, max: 1.2 },
        spectrum: { blue: 20, green: 20, red: 55, farRed: 5, uv: 0 },
        wateringFrequency: 3,
        ecTarget: 1.6,
        phTarget: 6.0
      }
    ],
    yieldPotential: 3.5,
    plantDensity: 30,
    heightAtMaturity: 0.40,
    specialRequirements: ['Prevent flowering', 'Regular harvesting'],
    economicValue: 25.00,
    marketDemand: 'high'
  },

  // Strawberries
  strawberry_everbearing: {
    id: 'strawberry_everbearing',
    name: 'Everbearing Strawberry',
    scientificName: 'Fragaria × ananassa',
    category: 'berries',
    totalCycleDays: 90,
    stages: [
      {
        name: 'Establishment',
        duration: 30,
        dliTarget: 15,
        ppfdTarget: 250,
        photoperiod: 16,
        temperature: { day: 22, night: 16 },
        humidity: { min: 60, max: 70 },
        co2Target: 600,
        vpd: { min: 0.7, max: 1.1 },
        spectrum: { blue: 25, green: 20, red: 50, farRed: 5, uv: 0 },
        wateringFrequency: 3,
        ecTarget: 1.4,
        phTarget: 6.0
      },
      {
        name: 'Vegetative',
        duration: 20,
        dliTarget: 20,
        ppfdTarget: 350,
        photoperiod: 16,
        temperature: { day: 23, night: 17 },
        humidity: { min: 55, max: 65 },
        co2Target: 800,
        vpd: { min: 0.9, max: 1.3 },
        spectrum: { blue: 20, green: 18, red: 57, farRed: 5, uv: 0 },
        wateringFrequency: 4,
        ecTarget: 1.6,
        phTarget: 6.0
      },
      {
        name: 'Flowering',
        duration: 14,
        dliTarget: 22,
        ppfdTarget: 400,
        photoperiod: 14,
        temperature: { day: 22, night: 15 },
        humidity: { min: 50, max: 60 },
        co2Target: 1000,
        vpd: { min: 1.0, max: 1.4 },
        spectrum: { blue: 15, green: 15, red: 62, farRed: 7, uv: 1 },
        wateringFrequency: 4,
        ecTarget: 1.8,
        phTarget: 6.1
      },
      {
        name: 'Fruiting',
        duration: 26,
        dliTarget: 25,
        ppfdTarget: 450,
        photoperiod: 14,
        temperature: { day: 24, night: 16 },
        humidity: { min: 45, max: 55 },
        co2Target: 1000,
        vpd: { min: 1.1, max: 1.5 },
        spectrum: { blue: 12, green: 13, red: 65, farRed: 8, uv: 2 },
        wateringFrequency: 5,
        ecTarget: 2.0,
        phTarget: 6.1
      }
    ],
    yieldPotential: 8.0,
    plantDensity: 10,
    heightAtMaturity: 0.25,
    specialRequirements: ['Pollination assistance', 'Runner management'],
    economicValue: 15.00,
    marketDemand: 'high'
  }
};

// Advanced light recipes
export const LIGHT_RECIPES: LightRecipe[] = [
  {
    id: 'lettuce_energy_saver',
    name: 'Lettuce Energy Saver',
    description: 'Optimized for energy efficiency while maintaining quality',
    cropIds: ['lettuce_butterhead'],
    stages: [
      {
        stageName: 'Germination',
        schedule: [
          { startHour: 6, endHour: 22, intensity: 60, spectrum: 'vegetative' }
        ]
      },
      {
        stageName: 'Seedling',
        schedule: [
          { startHour: 5, endHour: 11, intensity: 80, spectrum: 'vegetative' },
          { startHour: 11, endHour: 17, intensity: 100, spectrum: 'full' },
          { startHour: 17, endHour: 23, intensity: 80, spectrum: 'vegetative' }
        ]
      },
      {
        stageName: 'Vegetative',
        schedule: [
          { startHour: 4, endHour: 10, intensity: 100, spectrum: 'full' },
          { startHour: 10, endHour: 14, intensity: 80, spectrum: 'vegetative' },
          { startHour: 14, endHour: 20, intensity: 100, spectrum: 'full' },
          { startHour: 20, endHour: 22, intensity: 60, spectrum: 'vegetative' }
        ]
      }
    ],
    energySaving: 25,
    yieldImprovement: -5
  },
  {
    id: 'cannabis_maximum_yield',
    name: 'Cannabis Maximum Yield',
    description: 'Focused on maximizing yield and cannabinoid production',
    cropIds: ['cannabis_hybrid'],
    stages: [
      {
        stageName: 'Vegetative',
        schedule: [
          { startHour: 0, endHour: 6, intensity: 0, spectrum: 'full' },
          { startHour: 6, endHour: 10, intensity: 100, spectrum: 'vegetative' },
          { startHour: 10, endHour: 14, intensity: 100, spectrum: 'full' },
          { startHour: 14, endHour: 20, intensity: 100, spectrum: 'vegetative' },
          { startHour: 20, endHour: 24, intensity: 80, spectrum: 'vegetative' }
        ]
      },
      {
        stageName: 'Flowering',
        schedule: [
          { startHour: 0, endHour: 12, intensity: 0, spectrum: 'full' },
          { startHour: 12, endHour: 14, intensity: 100, spectrum: 'custom', 
            customSpectrum: { blue: 10, green: 10, red: 65, farRed: 13, uv: 2 } },
          { startHour: 14, endHour: 22, intensity: 100, spectrum: 'flowering' },
          { startHour: 22, endHour: 24, intensity: 100, spectrum: 'custom',
            customSpectrum: { blue: 5, green: 5, red: 70, farRed: 18, uv: 2 } }
        ]
      }
    ],
    energySaving: -15,
    yieldImprovement: 20
  },
  {
    id: 'tomato_flavor_enhancer',
    name: 'Tomato Flavor Enhancer',
    description: 'Enhances flavor compounds and sugar content',
    cropIds: ['tomato_indeterminate'],
    stages: [
      {
        stageName: 'Fruiting',
        schedule: [
          { startHour: 4, endHour: 8, intensity: 80, spectrum: 'custom',
            customSpectrum: { blue: 15, green: 10, red: 60, farRed: 10, uv: 5 } },
          { startHour: 8, endHour: 16, intensity: 100, spectrum: 'full' },
          { startHour: 16, endHour: 20, intensity: 90, spectrum: 'custom',
            customSpectrum: { blue: 10, green: 15, red: 65, farRed: 8, uv: 2 } }
        ]
      }
    ],
    energySaving: 0,
    yieldImprovement: 5
  }
];

// Crop growth calculator
export class CropGrowthCalculator {
  static calculateCurrentStage(crop: CropModel, daysSincePlanting: number): {
    stage: CropGrowthStage;
    daysInStage: number;
    daysRemaining: number;
  } {
    let cumulativeDays = 0;
    
    for (const stage of crop.stages) {
      if (daysSincePlanting <= cumulativeDays + stage.duration) {
        return {
          stage,
          daysInStage: daysSincePlanting - cumulativeDays,
          daysRemaining: stage.duration - (daysSincePlanting - cumulativeDays)
        };
      }
      cumulativeDays += stage.duration;
    }
    
    // If beyond all stages, return last stage
    const lastStage = crop.stages[crop.stages.length - 1];
    return {
      stage: lastStage,
      daysInStage: lastStage.duration,
      daysRemaining: 0
    };
  }

  static calculateExpectedYield(
    crop: CropModel,
    actualDLI: number,
    targetDLI: number,
    growArea: number
  ): number {
    // Calculate yield reduction factor based on DLI deficit
    const dliRatio = Math.min(actualDLI / targetDLI, 1.2); // Cap at 120% to prevent unrealistic yields
    const yieldFactor = 0.3 + (0.7 * dliRatio); // Minimum 30% yield at 0 DLI
    
    return crop.yieldPotential * yieldFactor * growArea;
  }

  static calculateWaterUsage(
    crop: CropModel,
    stage: CropGrowthStage,
    plantCount: number
  ): number {
    // Base water usage per plant (liters/day)
    const baseWater = 0.1; // 100ml base
    
    // Adjust for plant size and stage
    const stageFactor = stage.wateringFrequency / 3; // Normalize to average
    const sizeFactor = crop.heightAtMaturity / 0.5; // Normalize to 0.5m
    
    return baseWater * stageFactor * sizeFactor * plantCount;
  }

  static calculateNutrientRequirements(
    crop: CropModel,
    stage: CropGrowthStage,
    waterVolume: number // liters
  ): {
    nitrogen: number; // mg/L
    phosphorus: number; // mg/L
    potassium: number; // mg/L
    calcium: number; // mg/L
    magnesium: number; // mg/L
    sulfur: number; // mg/L
  } {
    // Base nutrient concentrations from EC target
    const ecToTDS = 500; // Conversion factor
    const totalTDS = stage.ecTarget * ecToTDS;
    
    // Nutrient ratios vary by stage
    let npkRatio = { n: 1, p: 1, k: 1 };
    
    if (stage.name.includes('Vegetative') || stage.name.includes('Seedling')) {
      npkRatio = { n: 3, p: 1, k: 2 };
    } else if (stage.name.includes('Flowering') || stage.name.includes('Fruiting')) {
      npkRatio = { n: 1, p: 2, k: 3 };
    }
    
    const totalRatio = npkRatio.n + npkRatio.p + npkRatio.k + 2; // +2 for Ca and Mg
    
    return {
      nitrogen: (totalTDS * npkRatio.n / totalRatio) * 0.7,
      phosphorus: (totalTDS * npkRatio.p / totalRatio) * 0.7,
      potassium: (totalTDS * npkRatio.k / totalRatio) * 0.7,
      calcium: (totalTDS * 1 / totalRatio) * 0.7,
      magnesium: (totalTDS * 0.5 / totalRatio) * 0.7,
      sulfur: (totalTDS * 0.5 / totalRatio) * 0.7
    };
  }

  static optimizeLightRecipe(
    crop: CropModel,
    stage: CropGrowthStage,
    energyCost: number, // $/kWh
    cropValue: number // $/kg
  ): {
    recommendedPPFD: number;
    photoperiod: number;
    spectrum: CropGrowthStage['spectrum'];
    estimatedROI: number;
  } {
    // Calculate optimal PPFD based on economic factors
    const lightCostPerDay = (stage.ppfdTarget / 1000) * stage.photoperiod * energyCost;
    const expectedYieldPerDay = crop.yieldPotential / crop.totalCycleDays;
    const revenuePerDay = expectedYieldPerDay * cropValue;
    
    // Adjust PPFD for ROI optimization
    let ppfdMultiplier = 1;
    if (revenuePerDay > lightCostPerDay * 10) {
      ppfdMultiplier = 1.1; // Increase light for high-value crops
    } else if (revenuePerDay < lightCostPerDay * 3) {
      ppfdMultiplier = 0.9; // Decrease light for low margins
    }
    
    return {
      recommendedPPFD: Math.round(stage.ppfdTarget * ppfdMultiplier),
      photoperiod: stage.photoperiod,
      spectrum: stage.spectrum,
      estimatedROI: (revenuePerDay - lightCostPerDay) / lightCostPerDay * 100
    };
  }
}