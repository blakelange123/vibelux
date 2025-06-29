/**
 * Automated Spectral Optimization Engine
 * 
 * Integrates cultivar data, real-time sensors, and ML models to automatically
 * optimize spectral lighting for maximum yield and quality outcomes.
 */

import { PrismaClient } from '@prisma/client';
import { SpectralLightingData, calculateSpectralLightingImpact } from './weather-normalization';
import CultivarDataCollectionService, { CultivarProfile } from './cultivar-data-collection';
import RealTimeDataPipeline from './real-time-data-pipeline';

const prisma = new PrismaClient();
const cultivarService = new CultivarDataCollectionService();

// Optimization target interface
export interface OptimizationTarget {
  primary: 'yield' | 'thc' | 'cbd' | 'terpenes' | 'quality_score' | 'energy_efficiency';
  secondary?: 'yield' | 'thc' | 'cbd' | 'terpenes' | 'quality_score' | 'energy_efficiency';
  constraints: {
    maxDLI: number;
    maxPowerConsumption: number; // kW
    minEnergyEfficiency: number; // μmol/J
    maxHeatGeneration: number; // BTU/hr
    budgetConstraint?: number; // $/month for electricity
  };
  weights: {
    yieldWeight: number;
    qualityWeight: number;
    energyWeight: number;
    costWeight: number;
  };
}

// Spectral recipe interface
export interface SpectralRecipe {
  id: string;
  name: string;
  cultivarId: string;
  growthStage: 'seedling' | 'vegetative' | 'pre_flower' | 'early_flower' | 'mid_flower' | 'late_flower' | 'ripening';
  spectrum: {
    uv_b: number; // 280-315nm (% of total PPFD)
    uv_a: number; // 315-380nm
    violet: number; // 380-420nm
    blue: number; // 420-490nm
    cyan: number; // 490-520nm
    green: number; // 520-565nm
    yellow: number; // 565-590nm
    orange: number; // 590-625nm
    red: number; // 625-700nm
    far_red: number; // 700-780nm
  };
  timing: {
    dli: number; // mol/m²/day
    photoperiod: number; // hours
    rampUpTime: number; // minutes
    rampDownTime: number; // minutes
    nightBreakEnabled: boolean;
    nightBreakDuration?: number; // minutes
    nightBreakTiming?: number; // hours after lights out
  };
  environmental: {
    targetTemperature: number;
    targetHumidity: number;
    targetCO2: number;
    targetVPD: number;
  };
  predictedOutcomes: {
    yieldIncrease: number; // %
    qualityIncrease: number; // %
    energyEfficiency: number; // μmol/J
    estimatedROI: number; // %
    confidenceScore: number; // %
  };
  validatedResults?: {
    actualYieldIncrease: number;
    actualQualityIncrease: number;
    actualEnergyEfficiency: number;
    actualROI: number;
    validationDate: Date;
  };
}

// Automated optimization engine
export class AutomatedSpectralOptimization {
  private optimizationQueue: Map<string, OptimizationTarget> = new Map();
  private activeRecipes: Map<string, SpectralRecipe> = new Map();
  private optimizationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startOptimizationLoop();
  }

  // Main optimization entry point
  async optimizeFacility(
    facilityId: string,
    cultivarId: string,
    optimizationTarget: OptimizationTarget,
    currentConditions: SpectralLightingData
  ): Promise<SpectralRecipe> {
    

    // Get cultivar profile
    const cultivar = await this.getCultivarProfile(cultivarId);
    if (!cultivar) {
      throw new Error(`Cultivar ${cultivarId} not found`);
    }

    // Get current growth stage
    const growthStage = await this.getCurrentGrowthStage(facilityId);

    // Generate optimization candidates
    const candidates = await this.generateSpectralCandidates(
      cultivar,
      growthStage,
      optimizationTarget,
      currentConditions
    );

    // Evaluate candidates
    const evaluatedCandidates = await this.evaluateCandidates(
      candidates,
      cultivar,
      optimizationTarget,
      currentConditions
    );

    // Select best candidate
    const optimal = this.selectOptimalRecipe(evaluatedCandidates, optimizationTarget);

    // Generate complete recipe
    const recipe = await this.generateCompleteRecipe(
      optimal,
      cultivar,
      growthStage,
      facilityId
    );

    // Store and activate recipe
    await this.storeAndActivateRecipe(facilityId, recipe);


    return recipe;
  }

  // Generate spectral optimization candidates
  private async generateSpectralCandidates(
    cultivar: CultivarProfile,
    growthStage: string,
    target: OptimizationTarget,
    current: SpectralLightingData
  ): Promise<Partial<SpectralRecipe>[]> {
    
    const candidates: Partial<SpectralRecipe>[] = [];
    const baseSpectrum = cultivar.spectralPreferences?.[`${growthStage}Spectrum`] || current.spectral_composition;

    // Strategy 1: Genetic Algorithm Optimization
    candidates.push(...await this.geneticAlgorithmOptimization(baseSpectrum, target, 10));

    // Strategy 2: Research-Based Templates
    candidates.push(...this.getResearchBasedTemplates(growthStage, target.primary));

    // Strategy 3: Historical Performance Optimization
    candidates.push(...await this.getHistoricalBestPerformers(cultivar.id, growthStage));

    // Strategy 4: Machine Learning Predictions
    candidates.push(...await this.mlBasedOptimization(cultivar, growthStage, target));

    // Strategy 5: Incremental Improvements
    candidates.push(...this.generateIncrementalImprovements(current.spectral_composition));

    return candidates;
  }

  // Genetic algorithm for spectrum optimization
  private async geneticAlgorithmOptimization(
    baseSpectrum: any,
    target: OptimizationTarget,
    populationSize: number
  ): Promise<Partial<SpectralRecipe>[]> {
    
    const population: Partial<SpectralRecipe>[] = [];

    for (let i = 0; i < populationSize; i++) {
      const individual: Partial<SpectralRecipe> = {
        spectrum: {
          uv_b: this.mutateValue(0.5, 0.1, 0, 2), // Low UV-B, can be harmful
          uv_a: this.mutateValue(baseSpectrum.uv_a_percent || 2, 1, 0, 8),
          violet: this.mutateValue(baseSpectrum.violet_percent || 5, 2, 2, 12),
          blue: this.mutateValue(baseSpectrum.blue_percent || 18, 5, 10, 30),
          cyan: this.mutateValue(baseSpectrum.cyan_percent || 8, 3, 3, 15),
          green: this.mutateValue(baseSpectrum.green_percent || 12, 4, 5, 25),
          yellow: this.mutateValue(baseSpectrum.yellow_percent || 7, 2, 3, 12),
          orange: this.mutateValue(5, 2, 2, 10),
          red: this.mutateValue(baseSpectrum.red_percent || 42, 8, 25, 60),
          far_red: this.mutateValue(baseSpectrum.far_red_percent || 4, 2, 1, 12)
        }
      };

      // Normalize to 100%
      individual.spectrum = this.normalizeSpectrum(individual.spectrum!);
      population.push(individual);
    }

    // Evolve population through multiple generations
    return this.evolvePopulation(population, target, 5);
  }

  // Research-based spectral templates
  private getResearchBasedTemplates(
    growthStage: string,
    primary: string
  ): Partial<SpectralRecipe>[] {
    
    const templates: Partial<SpectralRecipe>[] = [];

    if (primary === 'thc') {
      // High UV-A for THC production
      templates.push({
        name: 'THC Maximizer',
        spectrum: {
          uv_b: 0.5,
          uv_a: 6.0, // Increased UV-A
          violet: 4.0,
          blue: 15.0, // Reduced blue
          cyan: 6.0,
          green: 10.0,
          yellow: 6.0,
          orange: 8.0,
          red: 40.0,
          far_red: 4.5
        }
      });
    }

    if (primary === 'yield') {
      // Optimized for photosynthesis
      templates.push({
        name: 'Yield Maximizer',
        spectrum: {
          uv_b: 0.2,
          uv_a: 2.0,
          violet: 3.0,
          blue: 12.0,
          cyan: 8.0,
          green: 15.0, // Increased green for penetration
          yellow: 8.0,
          orange: 7.0,
          red: 42.0, // High red for photosynthesis
          far_red: 2.8 // Lower far-red for compact growth
        }
      });
    }

    if (primary === 'quality_score') {
      // Balanced for multiple quality metrics
      templates.push({
        name: 'Quality Optimizer',
        spectrum: {
          uv_b: 1.0,
          uv_a: 4.0,
          violet: 6.0,
          blue: 18.0, // Higher blue for quality
          cyan: 8.0,
          green: 12.0,
          yellow: 7.0,
          orange: 6.0,
          red: 35.0,
          far_red: 3.0
        }
      });
    }

    // Stage-specific adjustments
    if (growthStage === 'vegetative') {
      templates.forEach(template => {
        if (template.spectrum) {
          template.spectrum.blue += 3; // More blue for vegetative
          template.spectrum.red -= 2;
          template.spectrum.far_red -= 1;
          template.spectrum = this.normalizeSpectrum(template.spectrum);
        }
      });
    }

    if (growthStage.includes('flower')) {
      templates.forEach(template => {
        if (template.spectrum) {
          template.spectrum.red += 3; // More red for flowering
          template.spectrum.blue -= 2;
          template.spectrum.uv_a += 1; // UV for terpenes/THC
          template.spectrum = this.normalizeSpectrum(template.spectrum);
        }
      });
    }

    return templates;
  }

  // ML-based optimization using historical data
  private async mlBasedOptimization(
    cultivar: CultivarProfile,
    growthStage: string,
    target: OptimizationTarget
  ): Promise<Partial<SpectralRecipe>[]> {
    
    // Get historical performance data
    const historicalData = await prisma.spectralCorrelation.findMany({
      where: {
        strain_id: cultivar.id,
        growth_stage: growthStage
      },
      orderBy: {
        outcome_score: 'desc'
      },
      take: 10
    });

    const mlCandidates: Partial<SpectralRecipe>[] = [];

    for (const data of historicalData) {
      const spectrum = data.spectral_conditions as any;
      
      // Apply ML-based improvements
      const improved = this.applyMLImprovements(spectrum, target);
      
      mlCandidates.push({
        name: 'ML Optimized',
        spectrum: improved
      });
    }

    return mlCandidates;
  }

  // Get historical best performers
  private async getHistoricalBestPerformers(
    cultivarId: string,
    growthStage: string
  ): Promise<Partial<SpectralRecipe>[]> {
    
    const bestPerformers = await prisma.spectralCorrelation.findMany({
      where: {
        strain_id: cultivarId,
        growth_stage: growthStage,
        outcome_score: { gt: 80 } // Only high-performing recipes
      },
      orderBy: {
        outcome_score: 'desc'
      },
      take: 5
    });

    return bestPerformers.map(performer => ({
      name: 'Historical Best',
      spectrum: performer.spectral_conditions as any
    }));
  }

  // Generate incremental improvements from current spectrum
  private generateIncrementalImprovements(
    currentSpectrum: any
  ): Partial<SpectralRecipe>[] {
    
    const improvements: Partial<SpectralRecipe>[] = [];

    // Small adjustments to each band
    const adjustmentOptions = [
      { band: 'uv_a', delta: 1 },
      { band: 'blue', delta: -2 },
      { band: 'green', delta: 3 },
      { band: 'red', delta: 2 },
      { band: 'far_red', delta: -1 }
    ];

    for (const adjustment of adjustmentOptions) {
      const improved = { ...currentSpectrum };
      improved[adjustment.band] = Math.max(0, improved[adjustment.band] + adjustment.delta);
      
      improvements.push({
        name: `Incremental +${adjustment.delta}% ${adjustment.band}`,
        spectrum: this.normalizeSpectrum(improved)
      });
    }

    return improvements;
  }

  // Evaluate candidates using multi-objective optimization
  private async evaluateCandidates(
    candidates: Partial<SpectralRecipe>[],
    cultivar: CultivarProfile,
    target: OptimizationTarget,
    current: SpectralLightingData
  ): Promise<(Partial<SpectralRecipe> & { score: number; metrics: any })[]> {
    
    const evaluated = [];

    for (const candidate of candidates) {
      if (!candidate.spectrum) continue;

      // Convert to SpectralLightingData format
      const spectralData: SpectralLightingData = {
        ...current,
        spectral_composition: {
          uv_a_percent: candidate.spectrum.uv_a,
          violet_percent: candidate.spectrum.violet,
          blue_percent: candidate.spectrum.blue,
          cyan_percent: candidate.spectrum.cyan,
          green_percent: candidate.spectrum.green,
          yellow_percent: candidate.spectrum.yellow,
          red_percent: candidate.spectrum.red,
          far_red_percent: candidate.spectrum.far_red
        }
      };

      // Calculate impact using enhanced regression model
      const impact = calculateSpectralLightingImpact(
        spectralData,
        current,
        'cannabis'
      );

      // Calculate multi-objective score
      const metrics = await this.calculateOptimizationMetrics(
        spectralData,
        cultivar,
        target
      );

      const score = this.calculateMultiObjectiveScore(metrics, target);

      evaluated.push({
        ...candidate,
        score,
        metrics
      });
    }

    return evaluated.sort((a, b) => b.score - a.score);
  }

  // Calculate optimization metrics
  private async calculateOptimizationMetrics(
    spectralData: SpectralLightingData,
    cultivar: CultivarProfile,
    target: OptimizationTarget
  ): Promise<any> {
    
    const spectrum = spectralData.spectral_composition;
    
    // Yield prediction based on research correlations
    const yieldScore = this.predictYieldImpact(spectrum, spectralData.dli_total);
    
    // THC prediction (UV-A correlation)
    const thcScore = this.predictTHCImpact(spectrum, spectralData.environmental_factors);
    
    // Quality score (multiple factors)
    const qualityScore = this.predictQualityImpact(spectrum, spectralData);
    
    // Energy efficiency
    const energyEfficiency = this.calculateEnergyEfficiency(spectralData);
    
    // Operating cost
    const operatingCost = this.calculateOperatingCost(spectralData, target);

    return {
      yieldScore,
      thcScore,
      qualityScore,
      energyEfficiency,
      operatingCost,
      powerConsumption: spectralData.ppfd_average * 0.5, // Estimated W/m²
      heatGeneration: spectralData.ppfd_average * 0.3 // Estimated BTU/hr/m²
    };
  }

  // Multi-objective scoring function
  private calculateMultiObjectiveScore(metrics: any, target: OptimizationTarget): number {
    let score = 0;

    // Primary objective (50% weight)
    switch (target.primary) {
      case 'yield':
        score += metrics.yieldScore * 0.5;
        break;
      case 'thc':
        score += metrics.thcScore * 0.5;
        break;
      case 'quality_score':
        score += metrics.qualityScore * 0.5;
        break;
      case 'energy_efficiency':
        score += (metrics.energyEfficiency / 3.0) * 50; // Normalize to 0-50
        break;
    }

    // Secondary objective (20% weight)
    if (target.secondary) {
      switch (target.secondary) {
        case 'yield':
          score += metrics.yieldScore * 0.2;
          break;
        case 'energy_efficiency':
          score += (metrics.energyEfficiency / 3.0) * 20;
          break;
      }
    }

    // Weighted factors (30% weight)
    score += metrics.yieldScore * target.weights.yieldWeight * 0.3;
    score += metrics.qualityScore * target.weights.qualityWeight * 0.3;
    score += (metrics.energyEfficiency / 3.0) * target.weights.energyWeight * 30;
    score += (100 - metrics.operatingCost) * target.weights.costWeight * 0.3;

    // Constraint penalties
    if (metrics.powerConsumption > target.constraints.maxPowerConsumption) {
      score *= 0.5; // 50% penalty for exceeding power limit
    }

    if (metrics.energyEfficiency < target.constraints.minEnergyEfficiency) {
      score *= 0.7; // 30% penalty for low efficiency
    }

    return Math.max(0, score);
  }

  // Helper methods for predictions
  private predictYieldImpact(spectrum: any, dli: number): number {
    // Research-based yield prediction
    const redEfficiency = spectrum.red_percent * 0.85; // Red is highly efficient
    const blueBalance = Math.max(0, 25 - Math.abs(spectrum.blue_percent - 15)) * 0.6;
    const greenPenetration = spectrum.green_percent * 0.4;
    const dliBonus = Math.min(dli / 50, 1) * 20; // DLI up to 50 provides linear benefit
    
    return Math.min(100, redEfficiency + blueBalance + greenPenetration + dliBonus);
  }

  private predictTHCImpact(spectrum: any, environment: any): number {
    // UV-A correlation with THC production
    const uvContribution = spectrum.uv_a_percent * 8; // Strong UV-A correlation
    const blueContribution = spectrum.blue_percent * 0.8;
    const stressBonus = environment.vpd_kpa > 1.0 ? 10 : 0; // Mild stress can boost THC
    
    return Math.min(100, uvContribution + blueContribution + stressBonus);
  }

  private predictQualityImpact(spectrum: any, spectralData: SpectralLightingData): number {
    // Multiple quality factors
    const terpeneBonus = spectrum.uv_a_percent * 5 + spectrum.blue_percent * 0.6;
    const morphologyScore = (10 - spectrum.far_red_percent) * 8; // Lower far-red = better structure
    const colorScore = spectrum.blue_percent * 1.2; // Blue affects color quality
    
    return Math.min(100, terpeneBonus + morphologyScore + colorScore);
  }

  private calculateEnergyEfficiency(spectralData: SpectralLightingData): number {
    // Modern LED efficiency estimate (μmol/J)
    const baseEfficiency = 2.8;
    const spectrumEfficiency = this.getSpectrumEfficiencyFactor(spectralData.spectral_composition);
    
    return baseEfficiency * spectrumEfficiency;
  }

  private getSpectrumEfficiencyFactor(spectrum: any): number {
    // Red and blue are most efficient
    const redFactor = spectrum.red_percent * 0.012;
    const blueFactor = spectrum.blue_percent * 0.011;
    const greenFactor = spectrum.green_percent * 0.008; // Less efficient but useful
    const uvPenalty = (spectrum.uv_a_percent + spectrum.violet_percent) * -0.005; // UV is less efficient
    
    return Math.max(0.8, 1 + redFactor + blueFactor + greenFactor + uvPenalty);
  }

  private calculateOperatingCost(spectralData: SpectralLightingData, target: OptimizationTarget): number {
    const powerConsumption = spectralData.ppfd_average * 0.5; // W/m²
    const hoursPerDay = spectralData.photoperiod_hours;
    const dailyCost = (powerConsumption * hoursPerDay * 0.12) / 1000; // $0.12/kWh
    const monthlyCost = dailyCost * 30;
    
    // Normalize to 0-100 scale (higher is more expensive, lower score)
    return Math.min(100, monthlyCost / 10); // $10/month = 100% cost score
  }

  // Utility methods
  private mutateValue(base: number, variation: number, min: number, max: number): number {
    const mutated = base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2 * variation;
    return Math.max(min, Math.min(max, mutated));
  }

  private normalizeSpectrum(spectrum: any): any {
    const total = Object.values(spectrum).reduce((sum: number, val: any) => sum + val, 0);
    const normalized: any = {};
    
    for (const [band, value] of Object.entries(spectrum)) {
      normalized[band] = (value as number) / total * 100;
    }
    
    return normalized;
  }

  private async evolvePopulation(
    population: Partial<SpectralRecipe>[],
    target: OptimizationTarget,
    generations: number
  ): Promise<Partial<SpectralRecipe>[]> {
    // Simple genetic algorithm implementation
    // In production, this would be more sophisticated
    return population.slice(0, 5); // Return top 5 for now
  }

  private applyMLImprovements(spectrum: any, target: OptimizationTarget): any {
    // Apply machine learning improvements
    const improved = { ...spectrum };
    
    // Simple heuristic improvements based on target
    if (target.primary === 'thc') {
      improved.uv_a = Math.min(8, improved.uv_a * 1.2);
    }
    
    if (target.primary === 'yield') {
      improved.red = Math.min(50, improved.red * 1.1);
      improved.green = Math.min(20, improved.green * 1.1);
    }
    
    return this.normalizeSpectrum(improved);
  }

  private selectOptimalRecipe(
    candidates: (Partial<SpectralRecipe> & { score: number })[], 
    target: OptimizationTarget
  ): Partial<SpectralRecipe> & { score: number } {
    // Return highest scoring candidate
    return candidates[0];
  }

  private async generateCompleteRecipe(
    optimal: Partial<SpectralRecipe> & { score: number },
    cultivar: CultivarProfile,
    growthStage: string,
    facilityId: string
  ): Promise<SpectralRecipe> {
    
    const recipe: SpectralRecipe = {
      id: `recipe_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
      name: optimal.name || 'AI Optimized Recipe',
      cultivarId: cultivar.id,
      growthStage: growthStage as any,
      spectrum: optimal.spectrum!,
      timing: {
        dli: cultivar.spectralPreferences?.dliPreferences?.[growthStage] || 40,
        photoperiod: growthStage.includes('flower') ? 12 : 18,
        rampUpTime: 30,
        rampDownTime: 30,
        nightBreakEnabled: false
      },
      environmental: {
        targetTemperature: cultivar.environmentalOptimums?.temperature?.[`${growthStage}DayMax`] || 24,
        targetHumidity: cultivar.environmentalOptimums?.humidity?.[growthStage] || 60,
        targetCO2: cultivar.environmentalOptimums?.co2?.[`${growthStage}Optimal`] || 1000,
        targetVPD: cultivar.environmentalOptimums?.vpd?.[`${growthStage}Optimal`] || 1.0
      },
      predictedOutcomes: {
        yieldIncrease: optimal.metrics?.yieldScore || 0,
        qualityIncrease: optimal.metrics?.qualityScore || 0,
        energyEfficiency: optimal.metrics?.energyEfficiency || 2.5,
        estimatedROI: this.calculateROI(optimal.metrics),
        confidenceScore: optimal.score
      }
    };

    return recipe;
  }

  private calculateROI(metrics: any): number {
    // Simple ROI calculation
    const yieldIncrease = metrics?.yieldScore || 0;
    const energySavings = Math.max(0, metrics?.energyEfficiency - 2.5) * 10; // Baseline 2.5 μmol/J
    
    return yieldIncrease * 0.5 + energySavings; // Simplified ROI estimate
  }

  private async storeAndActivateRecipe(facilityId: string, recipe: SpectralRecipe): Promise<void> {
    // Store recipe in database
    await prisma.spectralLearningProfile.create({
      data: {
        strain_id: recipe.cultivarId,
        growth_stage: recipe.growthStage,
        optimization_target: 'multi_objective',
        spectral_recipe: recipe.spectrum,
        environmental_recipe: recipe.environmental,
        timing_recipe: recipe.timing,
        predicted_outcomes: recipe.predictedOutcomes,
        confidence_score: recipe.predictedOutcomes.confidenceScore,
        active: true,
        created_at: new Date()
      }
    });

    // Activate recipe for facility
    this.activeRecipes.set(facilityId, recipe);

    // Execute recipe through actuator control
    await this.executeSpectralRecipe(facilityId, recipe);
  }

  private async executeSpectralRecipe(facilityId: string, recipe: SpectralRecipe): Promise<void> {
    // This would integrate with the actuator control system
    
    // Commands would be sent to LED controllers to adjust spectrum
    const commands = {
      spectrum: recipe.spectrum,
      dli: recipe.timing.dli,
      photoperiod: recipe.timing.photoperiod,
      environmental: recipe.environmental
    };

    // In production, this would call the autonomous actuator API
  }

  // Placeholder helper methods
  private async getCultivarProfile(cultivarId: string): Promise<CultivarProfile | null> {
    // Get from cultivar service
    const profile = await prisma.cannabisStrainProfile.findUnique({
      where: { id: cultivarId }
    });

    return profile as any; // Convert database model to CultivarProfile
  }

  private async getCurrentGrowthStage(facilityId: string): Promise<string> {
    const activeExperiment = await prisma.experiment.findFirst({
      where: {
        facility_id: facilityId,
        status: 'active'
      }
    });

    return activeExperiment?.growth_stage || 'vegetative';
  }

  private startOptimizationLoop(): void {
    // Run optimization checks every hour
    this.optimizationInterval = setInterval(async () => {
      await this.runScheduledOptimizations();
    }, 60 * 60 * 1000); // 1 hour
  }

  private async runScheduledOptimizations(): Promise<void> {
    // Check all active facilities for optimization opportunities
    const activeFacilities = await prisma.experiment.findMany({
      where: { status: 'active' },
      select: { facility_id: true, cannabis_strain_id: true }
    });

    for (const facility of activeFacilities) {
      try {
        // Check if optimization is needed
        const needsOptimization = await this.checkOptimizationNeeded(facility.facility_id);
        
        if (needsOptimization && facility.cannabis_strain_id) {
          // Run automated optimization
          const currentConditions = await this.getCurrentSpectralConditions(facility.facility_id);
          const defaultTarget: OptimizationTarget = {
            primary: 'yield',
            constraints: {
              maxDLI: 50,
              maxPowerConsumption: 1000,
              minEnergyEfficiency: 2.0,
              maxHeatGeneration: 3000
            },
            weights: {
              yieldWeight: 0.4,
              qualityWeight: 0.3,
              energyWeight: 0.2,
              costWeight: 0.1
            }
          };

          await this.optimizeFacility(
            facility.facility_id,
            facility.cannabis_strain_id,
            defaultTarget,
            currentConditions
          );
        }
      } catch (error) {
        console.error(`Error in scheduled optimization for ${facility.facility_id}:`, error);
      }
    }
  }

  private async checkOptimizationNeeded(facilityId: string): Promise<boolean> {
    // Check if facility needs optimization (placeholder)
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.9; // 10% chance for demo
  }

  private async getCurrentSpectralConditions(facilityId: string): Promise<SpectralLightingData> {
    // Get current spectral conditions (placeholder)
    return {
      dli_total: 40,
      ppfd_average: 800,
      photoperiod_hours: 18,
      spectral_composition: {
        uv_a_percent: 2,
        violet_percent: 5,
        blue_percent: 18,
        cyan_percent: 8,
        green_percent: 12,
        yellow_percent: 7,
        red_percent: 45,
        far_red_percent: 3
      },
      light_quality_metrics: {
        red_far_red_ratio: 15,
        blue_green_ratio: 1.5,
        blue_red_ratio: 0.4,
        uniformity_coefficient: 0.85,
        canopy_penetration_index: 0.75
      },
      environmental_factors: {
        co2_ppm: 1000,
        vpd_kpa: 1.0,
        air_flow_rate: 0.5,
        nutrient_ec: 2.0,
        ph: 6.0,
        root_zone_temp: 21
      },
      plant_architecture: {
        lai: 3.0,
        canopy_height_cm: 100,
        plant_density_per_m2: 6.25,
        growth_stage: 'flowering',
        days_in_stage: 30
      }
    };
  }

  // Public API methods
  public async getActiveRecipe(facilityId: string): Promise<SpectralRecipe | null> {
    return this.activeRecipes.get(facilityId) || null;
  }

  public async validateRecipePerformance(
    facilityId: string, 
    actualResults: any
  ): Promise<void> {
    const recipe = this.activeRecipes.get(facilityId);
    if (!recipe) return;

    // Update recipe with actual results
    recipe.validatedResults = {
      actualYieldIncrease: actualResults.yieldIncrease,
      actualQualityIncrease: actualResults.qualityIncrease,
      actualEnergyEfficiency: actualResults.energyEfficiency,
      actualROI: actualResults.roi,
      validationDate: new Date()
    };

    // Store validation results for ML improvement
    await prisma.spectralCorrelation.create({
      data: {
        strain_id: recipe.cultivarId,
        growth_stage: recipe.growthStage,
        spectral_conditions: recipe.spectrum,
        environmental_conditions: recipe.environmental,
        plant_response: actualResults,
        outcome_score: actualResults.qualityIncrease,
        notes: `Validated recipe ${recipe.id}`
      }
    });
  }

  public disconnect(): void {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
    }
  }
}

export default AutomatedSpectralOptimization;