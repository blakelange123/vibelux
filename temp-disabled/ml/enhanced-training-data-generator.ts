/**
 * Enhanced Training Data Generator for Yield Prediction
 * Addresses limitations in current synthetic data generation
 * Incorporates more sophisticated plant science and real-world variability
 */

export interface EnhancedTrainingData {
  inputs: {
    // Environmental - Primary
    ppfd: number;
    dli: number;
    temperature_day: number;
    temperature_night: number;
    humidity_day: number;
    humidity_night: number;
    co2_day: number;
    co2_night: number;
    vpd_day: number;
    vpd_night: number;
    
    // Lighting - Enhanced
    spectrum_ratios: {
      uv_percent: number; // 280-400nm
      blue_percent: number; // 400-500nm  
      green_percent: number; // 500-600nm
      red_percent: number; // 600-700nm
      far_red_percent: number; // 700-800nm
    };
    photoperiod: number;
    light_schedule_type: 'continuous' | '12_12' | '18_6' | '20_4' | 'natural';
    
    // Nutrients - Detailed
    ec: number;
    ph: number;
    nutrient_ratios: {
      n_ppm: number;
      p_ppm: number;
      k_ppm: number;
      ca_ppm: number;
      mg_ppm: number;
      s_ppm: number;
    };
    
    // Growth stage and timing
    growth_stage: number; // 1-10 scale (seedling to harvest)
    weeks_from_seed: number;
    days_in_current_stage: number;
    
    // Physical parameters
    plant_density: number; // plants per m²
    leaf_area_index: number;
    canopy_penetration: number; // light penetration percentage
    
    // Environmental controls
    air_circulation: number; // m/s
    root_zone_temp: number;
    substrate_moisture: number; // percentage
    
    // Cultivation method
    growing_method: 'hydroponic' | 'soil' | 'coco' | 'rockwool' | 'aeroponic';
    training_method: 'none' | 'lst' | 'scrog' | 'sog' | 'topping' | 'fimming';
    
    // Genetic factors
    strain_category: 'indica' | 'sativa' | 'hybrid_indica' | 'hybrid_sativa' | 'ruderalis';
    flowering_time: number; // weeks
    stretch_factor: number; // height increase during flower
    
    // Historical context
    previous_cycle_yield: number; // kg/m² from previous cycle
    facility_experience: number; // months of operation
    season: 'spring' | 'summer' | 'fall' | 'winter';
    
    // Stress factors
    pest_pressure: number; // 0-10 scale
    disease_pressure: number; // 0-10 scale
    environmental_stress_days: number; // days with suboptimal conditions
    power_outage_hours: number; // total hours of power interruption
  };
  
  outputs: {
    // Primary yield metrics
    total_yield: number; // grams per plant
    yield_per_m2: number; // kg per m²
    
    // Quality metrics
    quality_grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'trim';
    moisture_content: number; // percentage
    
    // Secondary metrics
    flower_to_trim_ratio: number;
    harvest_efficiency: number; // percentage of expected yield
    
    // Timing
    actual_harvest_days: number;
    peak_terpene_window: number; // days before/after optimal harvest
    
    // Resource efficiency
    grams_per_kwh: number;
    water_efficiency: number; // grams per liter
  };
  
  metadata: {
    data_source: 'synthetic' | 'real_cultivation' | 'research_study';
    confidence_score: number; // 0-1
    validation_status: 'unverified' | 'expert_reviewed' | 'empirically_validated';
    generated_at: Date;
    facility_type: 'commercial' | 'research' | 'home' | 'university';
  };
}

export class EnhancedTrainingDataGenerator {
  
  // Comprehensive strain database with realistic genetics
  private static readonly STRAIN_DATABASE = {
    'Blue Dream': {
      category: 'hybrid_sativa' as const,
      flowering_time: 9,
      stretch_factor: 1.8,
      base_yield: 65,
      optimal_temp: 76,
      optimal_humidity: 55,
      co2_response: 1.2,
      light_tolerance: 'high' as const,
      nutrient_sensitivity: 'medium' as const
    },
    'OG Kush': {
      category: 'hybrid_indica' as const,
      flowering_time: 8,
      stretch_factor: 1.4,
      base_yield: 55,
      optimal_temp: 74,
      optimal_humidity: 50,
      co2_response: 1.0,
      light_tolerance: 'medium' as const,
      nutrient_sensitivity: 'high' as const
    },
    'Gorilla Glue #4': {
      category: 'hybrid_indica' as const,
      flowering_time: 9,
      stretch_factor: 1.6,
      base_yield: 75,
      optimal_temp: 75,
      optimal_humidity: 52,
      co2_response: 1.3,
      light_tolerance: 'high' as const,
      nutrient_sensitivity: 'low' as const
    },
    'White Widow': {
      category: 'hybrid_sativa' as const,
      flowering_time: 8,
      stretch_factor: 1.5,
      base_yield: 60,
      optimal_temp: 77,
      optimal_humidity: 48,
      co2_response: 1.1,
      light_tolerance: 'high' as const,
      nutrient_sensitivity: 'medium' as const
    },
    'Northern Lights': {
      category: 'indica' as const,
      flowering_time: 7,
      stretch_factor: 1.2,
      base_yield: 50,
      optimal_temp: 72,
      optimal_humidity: 55,
      co2_response: 0.9,
      light_tolerance: 'medium' as const,
      nutrient_sensitivity: 'low' as const
    }
  };

  /**
   * Generate realistic training data with sophisticated plant science modeling
   */
  static generateEnhancedData(count: number = 2000): EnhancedTrainingData[] {
    const data: EnhancedTrainingData[] = [];
    const strains = Object.keys(this.STRAIN_DATABASE);
    
    for (let i = 0; i < count; i++) {
      // Select random strain
      const strainName = strains[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * strains.length)];
      const strain = this.STRAIN_DATABASE[strainName as keyof typeof this.STRAIN_DATABASE];
      
      // Generate sophisticated environmental conditions
      const envData = this.generateEnvironmentalConditions(strain);
      const lightData = this.generateLightingConditions();
      const nutrientData = this.generateNutrientProfile();
      const cultivationData = this.generateCultivationParameters();
      const stressData = this.generateStressFactors();
      
      // Calculate realistic yield using advanced plant science models
      const yieldData = this.calculateRealisticYield(
        envData, lightData, nutrientData, cultivationData, stressData, strain
      );
      
      // Generate quality metrics
      const qualityData = this.calculateQualityMetrics(
        envData, lightData, nutrientData, stressData, strain
      );
      
      data.push({
        inputs: {
          ...envData,
          ...lightData,
          ...nutrientData,
          ...cultivationData,
          strain_category: strain.category,
          flowering_time: strain.flowering_time,
          stretch_factor: strain.stretch_factor,
          ...stressData
        },
        outputs: {
          ...yieldData,
          ...qualityData
        },
        metadata: {
          data_source: 'synthetic',
          confidence_score: 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2,
          validation_status: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.7 ? 'expert_reviewed' : 'unverified',
          generated_at: new Date(),
          facility_type: ['commercial', 'research', 'home'][Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3)] as any
        }
      });
    }
    
    return data;
  }
  
  private static generateEnvironmentalConditions(strain: any) {
    // Base temperatures with strain preferences
    const day_temp = strain.optimal_temp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 12;
    const night_temp = day_temp - 8 - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 6;
    
    // Humidity with realistic day/night variation
    const base_humidity = strain.optimal_humidity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20;
    const humidity_day = base_humidity - 5 - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10;
    const humidity_night = base_humidity + 5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15;
    
    // CO2 with day/night cycling
    const co2_enrichment = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.3;
    const co2_day = co2_enrichment ? 800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 600 : 400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200;
    const co2_night = 400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100;
    
    // Calculate VPD using proper saturation vapor pressure formula
    const calculateVPD = (temp: number, rh: number) => {
      const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
      return svp * (1 - rh / 100);
    };
    
    return {
      ppfd: 300 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 700,
      dli: 20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40,
      temperature_day: day_temp,
      temperature_night: night_temp,
      humidity_day: Math.max(30, Math.min(70, humidity_day)),
      humidity_night: Math.max(40, Math.min(80, humidity_night)),
      co2_day,
      co2_night,
      vpd_day: calculateVPD(day_temp, humidity_day),
      vpd_night: calculateVPD(night_temp, humidity_night)
    };
  }
  
  private static generateLightingConditions() {
    // Realistic spectrum distributions
    const lightType = ['full_spectrum_led', 'hps', 'cmh', 'fluorescent'][Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4)];
    
    let spectrum;
    switch (lightType) {
      case 'full_spectrum_led':
        spectrum = {
          uv_percent: 1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3,
          blue_percent: 15 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
          green_percent: 20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
          red_percent: 35 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
          far_red_percent: 8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 7
        };
        break;
      case 'hps':
        spectrum = {
          uv_percent: 0.5,
          blue_percent: 5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3,
          green_percent: 25 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5,
          red_percent: 55 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
          far_red_percent: 12 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3
        };
        break;
      default:
        spectrum = {
          uv_percent: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
          blue_percent: 10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
          green_percent: 15 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
          red_percent: 30 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 25,
          far_red_percent: 5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10
        };
    }
    
    return {
      spectrum_ratios: spectrum,
      photoperiod: 12 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 6,
      light_schedule_type: ['continuous', '12_12', '18_6', '20_4'][Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4)] as any
    };
  }
  
  private static generateNutrientProfile() {
    const ec = 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1.4; // 0.8-2.2 EC
    const ph = 5.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1.3; // 5.5-6.8 pH
    
    // Realistic nutrient ratios based on growth stage
    const growth_stage = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
    const isVeg = growth_stage < 0.4;
    
    return {
      ec,
      ph,
      nutrient_ratios: {
        n_ppm: isVeg ? 150 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 : 100 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50,
        p_ppm: isVeg ? 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30 : 80 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40,
        k_ppm: isVeg ? 200 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 : 250 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 150,
        ca_ppm: 150 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
        mg_ppm: 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30,
        s_ppm: 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40
      }
    };
  }
  
  private static generateCultivationParameters() {
    return {
      growth_stage: 1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 9,
      weeks_from_seed: 1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
      days_in_current_stage: 1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 35,
      plant_density: 1 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15, // plants per m²
      leaf_area_index: 2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 6,
      canopy_penetration: 40 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50,
      air_circulation: 0.2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.8,
      root_zone_temp: 68 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      substrate_moisture: 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 25,
      growing_method: ['hydroponic', 'soil', 'coco', 'rockwool', 'aeroponic'][Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5)] as any,
      training_method: ['none', 'lst', 'scrog', 'sog', 'topping', 'fimming'][Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 6)] as any,
      previous_cycle_yield: 0.3 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1.2,
      facility_experience: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 60,
      season: ['spring', 'summer', 'fall', 'winter'][Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4)] as any
    };
  }
  
  private static generateStressFactors() {
    // Most cycles have minimal stress, but some have significant issues
    const hasStress = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.3;
    
    return {
      pest_pressure: hasStress ? 3 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 7 : crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3,
      disease_pressure: hasStress ? 2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 6 : crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2,
      environmental_stress_days: hasStress ? 5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15 : crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5,
      power_outage_hours: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.1 ? crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 24 : crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2
    };
  }
  
  private static calculateRealisticYield(
    env: any, light: any, nutrients: any, cultivation: any, stress: any, strain: any
  ) {
    let baseYield = strain.base_yield;
    
    // Advanced yield modeling using multiple factors
    
    // 1. Light response (DLI-based with spectrum effects)
    const dli = env.dli;
    const lightEffect = Math.min(1.5, dli / 35); // Saturation at 35 DLI
    const spectrumBonus = (light.spectrum_ratios.red_percent * 0.02) + 
                         (light.spectrum_ratios.far_red_percent * 0.01);
    baseYield *= lightEffect * (1 + spectrumBonus);
    
    // 2. Temperature optimization (bell curve)
    const avgTemp = (env.temperature_day + env.temperature_night) / 2;
    const tempOptimal = strain.optimal_temp;
    const tempEffect = Math.exp(-Math.pow((avgTemp - tempOptimal) / 8, 2));
    baseYield *= tempEffect;
    
    // 3. VPD effects (critical for transpiration)
    const avgVPD = (env.vpd_day + env.vpd_night) / 2;
    const vpdOptimal = strain.category.includes('indica') ? 0.9 : 1.1;
    const vpdEffect = Math.exp(-Math.pow((avgVPD - vpdOptimal) / 0.4, 2));
    baseYield *= vpdEffect;
    
    // 4. CO2 enhancement (logarithmic response)
    const co2Effect = Math.log(env.co2_day / 400) * strain.co2_response * 0.3;
    baseYield *= (1 + co2Effect);
    
    // 5. Nutrient optimization
    const nutrientBalance = this.calculateNutrientEffect(nutrients, cultivation.growth_stage);
    baseYield *= nutrientBalance;
    
    // 6. Training method effects
    const trainingMultiplier = {
      'none': 1.0,
      'lst': 1.15,
      'scrog': 1.25,
      'sog': 0.8,
      'topping': 1.1,
      'fimming': 1.05
    }[cultivation.training_method] || 1.0;
    baseYield *= trainingMultiplier;
    
    // 7. Stress penalties
    const stressPenalty = 1 - (stress.pest_pressure * 0.05) - 
                         (stress.disease_pressure * 0.06) - 
                         (stress.environmental_stress_days * 0.01);
    baseYield *= Math.max(0.2, stressPenalty);
    
    // 8. Density effects (diminishing returns)
    const densityEffect = cultivation.plant_density > 8 ? 
      1 - (cultivation.plant_density - 8) * 0.03 : 1;
    baseYield *= densityEffect;
    
    // Add realistic variability
    const geneticVariability = 0.85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.3;
    baseYield *= geneticVariability;
    
    // Calculate yield per m²
    const yieldPerPlant = Math.max(10, baseYield);
    const yieldPerM2 = (yieldPerPlant * cultivation.plant_density) / 1000; // Convert to kg
    
    return {
      total_yield: yieldPerPlant,
      yield_per_m2: yieldPerM2,
      actual_harvest_days: strain.flowering_time * 7 + cultivation.weeks_from_seed * 7,
      peak_terpene_window: -2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
      grams_per_kwh: yieldPerPlant / (env.dli * 0.1 * 16), // Simplified efficiency calc
      water_efficiency: yieldPerPlant / (cultivation.substrate_moisture * 0.5)
    };
  }
  
  private static calculateQualityMetrics(env: any, light: any, nutrients: any, stress: any, strain: any) {
    // Quality scoring based on environmental optimization
    let qualityScore = 80; // Base quality
    
    // Temperature stability bonus
    const tempVariation = Math.abs(env.temperature_day - env.temperature_night);
    qualityScore += tempVariation < 10 ? 5 : 0;
    
    // VPD optimization bonus
    const avgVPD = (env.vpd_day + env.vpd_night) / 2;
    qualityScore += (avgVPD > 0.8 && avgVPD < 1.2) ? 5 : 0;
    
    // Spectrum quality (UV and far-red for secondary metabolites)
    qualityScore += light.spectrum_ratios.uv_percent > 2 ? 3 : 0;
    qualityScore += light.spectrum_ratios.far_red_percent > 8 ? 2 : 0;
    
    // Stress penalties
    qualityScore -= stress.pest_pressure * 2;
    qualityScore -= stress.disease_pressure * 2.5;
    qualityScore -= stress.environmental_stress_days * 0.5;
    
    // Nutrient balance
    const phOptimal = nutrients.ph > 5.8 && nutrients.ph < 6.5;
    qualityScore += phOptimal ? 3 : -2;
    
    const ecOptimal = nutrients.ec > 1.2 && nutrients.ec < 1.8;
    qualityScore += ecOptimal ? 2 : -1;
    
    // Convert to grade
    const grade = qualityScore >= 95 ? 'A+' :
                  qualityScore >= 85 ? 'A' :
                  qualityScore >= 75 ? 'B+' :
                  qualityScore >= 65 ? 'B' :
                  qualityScore >= 50 ? 'C' : 'trim';
    
    return {
      quality_grade: grade as any,
      moisture_content: 10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8,
      flower_to_trim_ratio: 0.7 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.25,
      harvest_efficiency: Math.min(100, qualityScore + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10)
    };
  }
  
  private static calculateNutrientEffect(nutrients: any, growthStage: number) {
    // Simplified nutrient balance calculation
    const isFlowering = growthStage > 6;
    const npkRatio = nutrients.nutrient_ratios.n_ppm / nutrients.nutrient_ratios.k_ppm;
    
    const optimalRatio = isFlowering ? 0.5 : 1.2;
    const ratioEffect = Math.exp(-Math.pow((npkRatio - optimalRatio) / 0.3, 2));
    
    const ecEffect = nutrients.ec > 0.8 && nutrients.ec < 2.0 ? 1 : 0.8;
    const phEffect = nutrients.ph > 5.5 && nutrients.ph < 6.8 ? 1 : 0.85;
    
    return ratioEffect * ecEffect * phEffect;
  }
}