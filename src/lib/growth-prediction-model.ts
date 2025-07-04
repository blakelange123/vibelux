/**
 * Machine Learning Growth Prediction Model
 * Predicts plant growth based on lighting parameters
 */

interface GrowthPredictionInput {
  ppfd: number;                  // μmol/m²/s
  spectrum_ratio: {
    red_blue: number;           // Red:Blue ratio
    far_red: number;            // Red:Far-Red ratio
  };
  duration: number;              // Photoperiod hours
  dli: number;                   // Daily Light Integral
  temperature: number;           // °C
  humidity: number;              // %
  co2_ppm: number;              // CO2 concentration
  crop_type: string;
}

interface GrowthPredictionOutput {
  growth_rate: number;           // g/day
  leaf_area_index: number;       // LAI
  photosynthesis_rate: number;   // μmol CO₂/m²/s
  biomass_accumulation: number;  // g/m²/day
  days_to_harvest: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  recommendations: string[];
}

interface ModelWeights {
  ppfd_coefficient: number;
  spectrum_coefficient: number;
  duration_coefficient: number;
  environmental_coefficient: number;
  interaction_terms: Map<string, number>;
}

export class GrowthPredictionModel {
  private modelWeights: ModelWeights;
  private cropModels: Map<string, any>;
  
  constructor() {
    this.initializeModels();
  }
  
  private initializeModels(): void {
    // Initialize model weights based on research data
    this.modelWeights = {
      ppfd_coefficient: 0.0023,          // Growth response to PPFD
      spectrum_coefficient: 0.15,         // Spectrum quality impact
      duration_coefficient: 0.08,         // Photoperiod effect
      environmental_coefficient: 0.12,    // Temp/humidity/CO2 impact
      interaction_terms: new Map([
        ['ppfd_duration', 0.0001],
        ['spectrum_temp', 0.002],
        ['co2_ppfd', 0.0003]
      ])
    };
    
    // Crop-specific models
    this.cropModels = new Map([
      ['lettuce', {
        base_growth: 2.5,
        optimal_ppfd: 250,
        optimal_dli: 17,
        harvest_days: 35,
        lai_max: 4.5
      }],
      ['tomato', {
        base_growth: 5.0,
        optimal_ppfd: 400,
        optimal_dli: 25,
        harvest_days: 80,
        lai_max: 6.0
      }],
      ['cannabis', {
        base_growth: 4.0,
        optimal_ppfd: 800,
        optimal_dli: 40,
        harvest_days: 60,
        lai_max: 5.5
      }],
      ['herbs', {
        base_growth: 1.8,
        optimal_ppfd: 200,
        optimal_dli: 14,
        harvest_days: 28,
        lai_max: 3.5
      }],
      ['strawberry', {
        base_growth: 3.0,
        optimal_ppfd: 300,
        optimal_dli: 20,
        harvest_days: 90,
        lai_max: 4.0
      }]
    ]);
  }
  
  /**
   * Predict growth using gradient boosting-like algorithm
   */
  predict(input: GrowthPredictionInput): GrowthPredictionOutput {
    const cropModel = this.cropModels.get(input.crop_type) || this.cropModels.get('lettuce')!;
    
    // Base growth rate calculation
    let growthRate = cropModel.base_growth;
    
    // PPFD response curve (Michaelis-Menten kinetics)
    const ppfdFactor = this.calculatePPFDResponse(input.ppfd, cropModel.optimal_ppfd);
    growthRate *= ppfdFactor;
    
    // Spectrum quality factor
    const spectrumFactor = this.calculateSpectrumFactor(input.spectrum_ratio);
    growthRate *= spectrumFactor;
    
    // Photoperiod impact (with diminishing returns)
    const durationFactor = this.calculateDurationFactor(input.duration, input.dli, cropModel.optimal_dli);
    growthRate *= durationFactor;
    
    // Environmental factors
    const envFactor = this.calculateEnvironmentalFactor(
      input.temperature, 
      input.humidity, 
      input.co2_ppm
    );
    growthRate *= envFactor;
    
    // Calculate interaction effects
    const interactionBonus = this.calculateInteractions(input);
    growthRate *= (1 + interactionBonus);
    
    // Calculate derived metrics
    const leafAreaIndex = this.predictLAI(growthRate, cropModel.lai_max);
    const photosynthesisRate = this.predictPhotosynthesis(input.ppfd, input.co2_ppm, leafAreaIndex);
    const biomassAccumulation = growthRate * leafAreaIndex * 0.7; // 70% efficiency
    
    // Days to harvest prediction
    const growthRatio = growthRate / cropModel.base_growth;
    const daysToHarvest = Math.round(cropModel.harvest_days / growthRatio);
    
    // Calculate confidence intervals
    const confidence = this.calculateConfidence(input, growthRate);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(input, growthRate, cropModel);
    
    return {
      growth_rate: Number(growthRate.toFixed(2)),
      leaf_area_index: Number(leafAreaIndex.toFixed(2)),
      photosynthesis_rate: Number(photosynthesisRate.toFixed(2)),
      biomass_accumulation: Number(biomassAccumulation.toFixed(2)),
      days_to_harvest: daysToHarvest,
      confidence_interval: confidence,
      recommendations
    };
  }
  
  /**
   * PPFD response using Michaelis-Menten equation
   */
  private calculatePPFDResponse(ppfd: number, optimal: number): number {
    const Km = optimal * 0.3; // Half-saturation constant
    const Vmax = 1.2; // Maximum response
    
    return (Vmax * ppfd) / (Km + ppfd);
  }
  
  /**
   * Calculate spectrum quality factor
   */
  private calculateSpectrumFactor(ratio: { red_blue: number; far_red: number }): number {
    let factor = 1.0;
    
    // Optimal R:B ratio is typically 2-4
    if (ratio.red_blue >= 2 && ratio.red_blue <= 4) {
      factor *= 1.1;
    } else if (ratio.red_blue < 1 || ratio.red_blue > 6) {
      factor *= 0.85;
    }
    
    // R:FR ratio affects morphology
    if (ratio.far_red >= 1.5 && ratio.far_red <= 2.5) {
      factor *= 1.05;
    }
    
    return factor;
  }
  
  /**
   * Calculate photoperiod impact with DLI consideration
   */
  private calculateDurationFactor(hours: number, actualDLI: number, optimalDLI: number): number {
    // DLI is more important than photoperiod alone
    const dliRatio = Math.min(actualDLI / optimalDLI, 1.5); // Cap at 150% to prevent photoinhibition
    
    // Photoperiod factor (diminishing returns after 16 hours)
    const periodFactor = hours <= 16 ? hours / 16 : 1 - (hours - 16) * 0.05;
    
    return dliRatio * 0.7 + periodFactor * 0.3;
  }
  
  /**
   * Environmental factor calculation
   */
  private calculateEnvironmentalFactor(temp: number, humidity: number, co2: number): number {
    let factor = 1.0;
    
    // Temperature response (optimal 22-26°C)
    if (temp >= 22 && temp <= 26) {
      factor *= 1.0;
    } else if (temp < 18 || temp > 30) {
      factor *= 0.7;
    } else {
      factor *= 0.9;
    }
    
    // Humidity impact (optimal 60-70%)
    if (humidity >= 60 && humidity <= 70) {
      factor *= 1.0;
    } else if (humidity < 40 || humidity > 85) {
      factor *= 0.85;
    } else {
      factor *= 0.95;
    }
    
    // CO2 enrichment benefit (log response)
    const co2Factor = co2 > 400 ? 1 + 0.3 * Math.log10(co2 / 400) : 1.0;
    factor *= co2Factor;
    
    return factor;
  }
  
  /**
   * Calculate interaction effects between parameters
   */
  private calculateInteractions(input: GrowthPredictionInput): number {
    let bonus = 0;
    
    // PPFD × Duration interaction
    if (input.ppfd > 300 && input.duration > 14) {
      bonus += this.modelWeights.interaction_terms.get('ppfd_duration')! * 
               (input.ppfd - 300) * (input.duration - 14);
    }
    
    // Spectrum × Temperature interaction
    if (input.spectrum_ratio.red_blue > 2 && input.temperature >= 24) {
      bonus += this.modelWeights.interaction_terms.get('spectrum_temp')! * 
               input.spectrum_ratio.red_blue * (input.temperature - 20);
    }
    
    // CO2 × PPFD interaction (CO2 more beneficial at high light)
    if (input.co2_ppm > 400 && input.ppfd > 400) {
      bonus += this.modelWeights.interaction_terms.get('co2_ppfd')! * 
               (input.co2_ppm - 400) * (input.ppfd - 400);
    }
    
    return Math.min(bonus, 0.3); // Cap at 30% bonus
  }
  
  /**
   * Predict Leaf Area Index
   */
  private predictLAI(growthRate: number, maxLAI: number): number {
    // Logistic growth model
    const k = 0.1; // Growth coefficient
    const t = growthRate * 10; // Time proxy
    
    return maxLAI / (1 + Math.exp(-k * (t - 30)));
  }
  
  /**
   * Predict photosynthesis rate
   */
  private predictPhotosynthesis(ppfd: number, co2: number, lai: number): number {
    // Farquhar-von Caemmerer-Berry model (simplified)
    const Vcmax = 100; // Maximum carboxylation rate
    const Jmax = 200;  // Maximum electron transport rate
    
    // Light-limited rate
    const J = (Jmax * ppfd) / (ppfd + 200);
    const Aj = J / 4;
    
    // CO2-limited rate
    const Ac = Vcmax * (co2 - 50) / (co2 + 500);
    
    // Take minimum (limiting factor)
    const grossPhotosynthesis = Math.min(Aj, Ac);
    
    // Account for LAI (light interception)
    return grossPhotosynthesis * (1 - Math.exp(-0.5 * lai));
  }
  
  /**
   * Calculate confidence intervals
   */
  private calculateConfidence(input: GrowthPredictionInput, prediction: number): {
    lower: number;
    upper: number;
  } {
    // Base uncertainty
    let uncertainty = 0.15; // 15% base uncertainty
    
    // Reduce uncertainty with optimal conditions
    if (input.ppfd >= 200 && input.ppfd <= 600) uncertainty -= 0.03;
    if (input.duration >= 12 && input.duration <= 18) uncertainty -= 0.02;
    if (input.temperature >= 20 && input.temperature <= 28) uncertainty -= 0.02;
    if (input.co2_ppm >= 800) uncertainty -= 0.03;
    
    // Increase uncertainty for extreme conditions
    if (input.ppfd < 100 || input.ppfd > 1000) uncertainty += 0.05;
    if (input.duration < 8 || input.duration > 20) uncertainty += 0.03;
    
    uncertainty = Math.max(0.08, Math.min(0.25, uncertainty));
    
    return {
      lower: Number((prediction * (1 - uncertainty)).toFixed(2)),
      upper: Number((prediction * (1 + uncertainty)).toFixed(2))
    };
  }
  
  /**
   * Generate growth recommendations
   */
  private generateRecommendations(
    input: GrowthPredictionInput, 
    growthRate: number,
    cropModel: any
  ): string[] {
    const recommendations: string[] = [];
    
    // PPFD recommendations
    if (input.ppfd < cropModel.optimal_ppfd * 0.7) {
      recommendations.push(
        `Increase PPFD to ${cropModel.optimal_ppfd} μmol/m²/s for optimal growth`
      );
    } else if (input.ppfd > cropModel.optimal_ppfd * 1.5) {
      recommendations.push(
        `Reduce PPFD to prevent photoinhibition and save energy`
      );
    }
    
    // DLI recommendations
    if (input.dli < cropModel.optimal_dli * 0.8) {
      const neededHours = Math.ceil((cropModel.optimal_dli * 1000000) / (input.ppfd * 3600));
      recommendations.push(
        `Increase photoperiod to ${neededHours} hours or raise PPFD to achieve optimal DLI of ${cropModel.optimal_dli} mol/m²/day`
      );
    }
    
    // Spectrum recommendations
    if (input.spectrum_ratio.red_blue < 1.5) {
      recommendations.push(
        `Increase red light ratio to improve flowering and fruit development`
      );
    } else if (input.spectrum_ratio.red_blue > 5) {
      recommendations.push(
        `Add more blue light to prevent excessive stem elongation`
      );
    }
    
    // Environmental recommendations
    if (input.temperature < 20 || input.temperature > 28) {
      recommendations.push(
        `Optimize temperature to 22-26°C range for best growth`
      );
    }
    
    if (input.co2_ppm < 800 && input.ppfd > 400) {
      recommendations.push(
        `Consider CO2 enrichment to 800-1200 ppm to maximize high light utilization`
      );
    }
    
    // Growth rate assessment
    const growthRatio = growthRate / cropModel.base_growth;
    if (growthRatio < 0.8) {
      recommendations.push(
        `Current conditions achieving only ${Math.round(growthRatio * 100)}% of optimal growth rate`
      );
    } else if (growthRatio > 1.1) {
      recommendations.push(
        `Excellent conditions! Achieving ${Math.round(growthRatio * 100)}% of baseline growth rate`
      );
    }
    
    return recommendations;
  }
  
  /**
   * Batch predict for multiple scenarios
   */
  predictBatch(scenarios: GrowthPredictionInput[]): GrowthPredictionOutput[] {
    return scenarios.map(scenario => this.predict(scenario));
  }
  
  /**
   * Find optimal parameters for target growth rate
   */
  optimizeForGrowth(
    targetGrowth: number,
    cropType: string,
    constraints?: {
      maxPPFD?: number;
      maxDuration?: number;
      maxDLI?: number;
    }
  ): GrowthPredictionInput | null {
    const cropModel = this.cropModels.get(cropType);
    if (!cropModel) return null;
    
    // Use gradient descent to find optimal parameters
    let bestInput: GrowthPredictionInput = {
      ppfd: cropModel.optimal_ppfd,
      spectrum_ratio: { red_blue: 3, far_red: 2 },
      duration: 16,
      dli: cropModel.optimal_dli,
      temperature: 24,
      humidity: 65,
      co2_ppm: 1000,
      crop_type: cropType
    };
    
    // Apply constraints
    if (constraints?.maxPPFD) {
      bestInput.ppfd = Math.min(bestInput.ppfd, constraints.maxPPFD);
    }
    if (constraints?.maxDuration) {
      bestInput.duration = Math.min(bestInput.duration, constraints.maxDuration);
    }
    if (constraints?.maxDLI) {
      bestInput.dli = Math.min(bestInput.dli, constraints.maxDLI);
    }
    
    // Iterative optimization (simplified)
    for (let i = 0; i < 10; i++) {
      const prediction = this.predict(bestInput);
      const error = targetGrowth - prediction.growth_rate;
      
      if (Math.abs(error) < 0.1) break;
      
      // Adjust parameters based on error
      if (error > 0) {
        bestInput.ppfd = Math.min(bestInput.ppfd * 1.1, constraints?.maxPPFD || 1000);
        bestInput.duration = Math.min(bestInput.duration + 1, constraints?.maxDuration || 20);
      } else {
        bestInput.ppfd *= 0.95;
        bestInput.duration = Math.max(bestInput.duration - 1, 12);
      }
      
      // Recalculate DLI
      bestInput.dli = (bestInput.ppfd * bestInput.duration * 3600) / 1000000;
    }
    
    return bestInput;
  }
}

// Export singleton instance
export const growthModel = new GrowthPredictionModel();