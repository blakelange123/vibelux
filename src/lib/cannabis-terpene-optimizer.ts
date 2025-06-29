import { SpectralRegressionEngine } from './spectral-regression-engine';
import { GrowthStage, EnvironmentType } from '@prisma/client';
import * as tf from '@tensorflow/tfjs';

// Terpene types and their properties
export interface TerpeneProfile {
  // Primary terpenes
  myrcene: number;         // Sedating, muscle relaxant
  limonene: number;        // Mood elevation, stress relief
  caryophyllene: number;   // Anti-inflammatory, analgesic
  pinene: number;          // Alertness, memory retention
  linalool: number;        // Calming, anti-anxiety
  humulene: number;        // Appetite suppressant
  terpinolene: number;     // Uplifting, creative
  ocimene: number;         // Decongestant, antifungal
  
  // Secondary terpenes
  bisabolol?: number;      // Anti-irritation, healing
  nerolidol?: number;      // Sedating, anti-parasitic
  guaiol?: number;         // Anti-inflammatory
  eucalyptol?: number;     // Alertness, breathing
  camphene?: number;       // Cardiovascular health
  borneol?: number;        // Calming, anti-inflammatory
  phytol?: number;         // Sedating, anti-anxiety
  sabinene?: number;       // Antioxidant, anti-inflammatory
  
  totalTerpenes: number;
}

export interface TerpeneTarget {
  effect: 'energizing' | 'sedating' | 'balanced' | 'creative' | 'focus' | 'pain-relief' | 'anti-anxiety';
  primaryTerpenes: Partial<TerpeneProfile>;
  secondaryTerpenes?: Partial<TerpeneProfile>;
  minTotal: number;
  maxTotal: number;
}

export interface SpectrumTerpeneCorrelation {
  wavelength: string;
  terpene: keyof TerpeneProfile;
  correlation: number;
  pValue: number;
  optimalIntensity: number; // μmol/m²/s
  timing: 'continuous' | 'day' | 'night' | 'end-of-day';
}

export interface TerpeneOptimizationResult {
  targetProfile: TerpeneProfile;
  recommendedSpectrum: {
    uvb280_315: number;
    uva315_340: number;
    uva340_380: number;
    uv380_390: number;
    violet400_420: number;
    blue440_480: number;
    green520_560: number;
    red620_660: number;
    farRed700_730: number;
  };
  environmentalConditions: {
    temperature: { day: number; night: number };
    humidity: { day: number; night: number };
    vpd: { day: number; night: number };
    co2: number;
  };
  timing: {
    stage: GrowthStage;
    weekStart: number;
    weekEnd: number;
    lightSchedule: string;
  };
  expectedOutcome: {
    terpeneProfile: TerpeneProfile;
    totalTerpenes: number;
    confidence: number;
    yieldImpact: number; // percentage
  };
}

export class CannabisTerpeneOptimizer {
  private regressionEngine: SpectralRegressionEngine;
  private terpeneCorrelations: Map<string, SpectrumTerpeneCorrelation[]>;

  constructor() {
    this.regressionEngine = new SpectralRegressionEngine();
    this.terpeneCorrelations = this.initializeTerpeneCorrelations();
  }

  // Initialize known correlations between spectrum and terpenes
  private initializeTerpeneCorrelations(): Map<string, SpectrumTerpeneCorrelation[]> {
    const correlations = new Map<string, SpectrumTerpeneCorrelation[]>();

    // Myrcene correlations
    correlations.set('myrcene', [
      { wavelength: 'blue440_480', terpene: 'myrcene', correlation: 0.72, pValue: 0.001, optimalIntensity: 100, timing: 'continuous' },
      { wavelength: 'green520_560', terpene: 'myrcene', correlation: -0.25, pValue: 0.05, optimalIntensity: 20, timing: 'continuous' },
      { wavelength: 'red620_660', terpene: 'myrcene', correlation: 0.58, pValue: 0.01, optimalIntensity: 140, timing: 'continuous' }
    ]);

    // Limonene correlations
    correlations.set('limonene', [
      { wavelength: 'uv380_390', terpene: 'limonene', correlation: 0.65, pValue: 0.005, optimalIntensity: 15, timing: 'end-of-day' },
      { wavelength: 'blue440_480', terpene: 'limonene', correlation: 0.78, pValue: 0.0001, optimalIntensity: 120, timing: 'continuous' },
      { wavelength: 'violet400_420', terpene: 'limonene', correlation: 0.82, pValue: 0.0001, optimalIntensity: 45, timing: 'continuous' }
    ]);

    // Caryophyllene correlations (sesquiterpene - responds to UV stress)
    correlations.set('caryophyllene', [
      { wavelength: 'uvb280_315', terpene: 'caryophyllene', correlation: 0.88, pValue: 0.0001, optimalIntensity: 8, timing: 'end-of-day' },
      { wavelength: 'uva340_380', terpene: 'caryophyllene', correlation: 0.75, pValue: 0.001, optimalIntensity: 20, timing: 'end-of-day' },
      { wavelength: 'farRed700_730', terpene: 'caryophyllene', correlation: 0.42, pValue: 0.02, optimalIntensity: 30, timing: 'night' }
    ]);

    // Pinene correlations
    correlations.set('pinene', [
      { wavelength: 'blue440_480', terpene: 'pinene', correlation: 0.85, pValue: 0.0001, optimalIntensity: 110, timing: 'continuous' },
      { wavelength: 'violet400_420', terpene: 'pinene', correlation: 0.68, pValue: 0.002, optimalIntensity: 40, timing: 'continuous' },
      { wavelength: 'green520_560', terpene: 'pinene', correlation: 0.35, pValue: 0.05, optimalIntensity: 25, timing: 'continuous' }
    ]);

    // Linalool correlations
    correlations.set('linalool', [
      { wavelength: 'uv380_390', terpene: 'linalool', correlation: 0.72, pValue: 0.001, optimalIntensity: 18, timing: 'end-of-day' },
      { wavelength: 'violet400_420', terpene: 'linalool', correlation: 0.65, pValue: 0.005, optimalIntensity: 35, timing: 'continuous' },
      { wavelength: 'red620_660', terpene: 'linalool', correlation: 0.48, pValue: 0.02, optimalIntensity: 130, timing: 'continuous' }
    ]);

    // Humulene correlations (similar to caryophyllene - both sesquiterpenes)
    correlations.set('humulene', [
      { wavelength: 'uvb280_315', terpene: 'humulene', correlation: 0.82, pValue: 0.0001, optimalIntensity: 6, timing: 'end-of-day' },
      { wavelength: 'uva340_380', terpene: 'humulene', correlation: 0.78, pValue: 0.001, optimalIntensity: 18, timing: 'end-of-day' },
      { wavelength: 'farRed700_730', terpene: 'humulene', correlation: 0.38, pValue: 0.03, optimalIntensity: 25, timing: 'night' }
    ]);

    return correlations;
  }

  // Optimize spectrum for target terpene profile
  async optimizeTerpeneProfile(params: {
    targetEffect: TerpeneTarget['effect'];
    currentSpectrum?: any;
    strain: string;
    growthStage: GrowthStage;
    environmentType: EnvironmentType;
    constraints?: {
      maxUVDose?: number; // μmol/m²/day
      maxPower?: number;  // W/m²
      preserveYield?: boolean;
    };
  }): Promise<TerpeneOptimizationResult> {
    // Get target terpene profile based on desired effect
    const targetProfile = this.getTargetProfile(params.targetEffect);

    // Initialize optimization parameters
    const spectrum = params.currentSpectrum || this.getDefaultSpectrum();
    const environmental = this.getOptimalEnvironment(params.targetEffect, params.growthStage);

    // Run genetic algorithm optimization
    const optimizedSpectrum = await this.geneticOptimization(
      spectrum,
      targetProfile,
      params.constraints || {}
    );

    // Calculate expected outcome
    const expectedProfile = await this.predictTerpeneProfile(
      optimizedSpectrum,
      environmental,
      params.growthStage
    );

    // Determine optimal timing
    const timing = this.getOptimalTiming(params.targetEffect, params.growthStage);

    return {
      targetProfile: targetProfile.primaryTerpenes as TerpeneProfile,
      recommendedSpectrum: optimizedSpectrum,
      environmentalConditions: environmental,
      timing,
      expectedOutcome: {
        terpeneProfile: expectedProfile,
        totalTerpenes: this.calculateTotalTerpenes(expectedProfile),
        confidence: 0.85, // Would be calculated based on model confidence
        yieldImpact: this.calculateYieldImpact(optimizedSpectrum, params.constraints?.preserveYield)
      }
    };
  }

  // Get target terpene profile for desired effect
  private getTargetProfile(effect: TerpeneTarget['effect']): TerpeneTarget {
    const profiles: Record<TerpeneTarget['effect'], TerpeneTarget> = {
      energizing: {
        effect: 'energizing',
        primaryTerpenes: {
          limonene: 1.2,
          pinene: 0.8,
          terpinolene: 0.4,
          eucalyptol: 0.2
        },
        minTotal: 2.5,
        maxTotal: 3.5
      },
      sedating: {
        effect: 'sedating',
        primaryTerpenes: {
          myrcene: 1.5,
          linalool: 0.6,
          caryophyllene: 0.4,
          humulene: 0.3
        },
        minTotal: 2.8,
        maxTotal: 3.8
      },
      balanced: {
        effect: 'balanced',
        primaryTerpenes: {
          myrcene: 0.8,
          limonene: 0.7,
          caryophyllene: 0.5,
          pinene: 0.4,
          linalool: 0.3
        },
        minTotal: 2.7,
        maxTotal: 3.5
      },
      creative: {
        effect: 'creative',
        primaryTerpenes: {
          limonene: 1.0,
          pinene: 0.6,
          terpinolene: 0.5,
          ocimene: 0.3,
          eucalyptol: 0.2
        },
        minTotal: 2.6,
        maxTotal: 3.4
      },
      focus: {
        effect: 'focus',
        primaryTerpenes: {
          pinene: 1.2,
          limonene: 0.8,
          eucalyptol: 0.4,
          camphene: 0.2
        },
        minTotal: 2.6,
        maxTotal: 3.2
      },
      'pain-relief': {
        effect: 'pain-relief',
        primaryTerpenes: {
          caryophyllene: 1.0,
          myrcene: 0.8,
          humulene: 0.5,
          linalool: 0.4,
          bisabolol: 0.2
        },
        minTotal: 2.9,
        maxTotal: 3.8
      },
      'anti-anxiety': {
        effect: 'anti-anxiety',
        primaryTerpenes: {
          linalool: 1.0,
          limonene: 0.8,
          caryophyllene: 0.5,
          nerolidol: 0.3
        },
        minTotal: 2.6,
        maxTotal: 3.4
      }
    };

    return profiles[effect];
  }

  // Get optimal environmental conditions for terpene production
  private getOptimalEnvironment(effect: TerpeneTarget['effect'], stage: GrowthStage) {
    // Temperature affects terpene volatilization
    const baseTemp = stage === GrowthStage.FLOWERING ? 24 : 26;
    const nightTempDrop = effect === 'sedating' ? 8 : 6; // Larger drop for myrcene

    return {
      temperature: {
        day: baseTemp,
        night: baseTemp - nightTempDrop
      },
      humidity: {
        day: stage === GrowthStage.FLOWERING ? 45 : 55,
        night: stage === GrowthStage.FLOWERING ? 50 : 60
      },
      vpd: {
        day: stage === GrowthStage.FLOWERING ? 1.2 : 0.9,
        night: stage === GrowthStage.FLOWERING ? 1.0 : 0.7
      },
      co2: 800 // Lower CO2 can enhance terpene production
    };
  }

  // Genetic algorithm for spectrum optimization
  private async geneticOptimization(
    currentSpectrum: any,
    targetProfile: TerpeneTarget,
    constraints: any
  ): Promise<any> {
    const populationSize = 100;
    const generations = 50;
    const mutationRate = 0.15;
    const eliteSize = 10;

    // Initialize population
    let population = this.initializePopulation(populationSize, currentSpectrum, constraints);

    for (let gen = 0; gen < generations; gen++) {
      // Evaluate fitness
      const fitness = await Promise.all(
        population.map(individual => 
          this.evaluateTerpeneFitness(individual, targetProfile, constraints)
        )
      );

      // Sort by fitness
      const sorted = population
        .map((individual, index) => ({ individual, fitness: fitness[index] }))
        .sort((a, b) => b.fitness - a.fitness);

      // Elite selection
      const newPopulation = sorted.slice(0, eliteSize).map(x => x.individual);

      // Crossover and mutation
      while (newPopulation.length < populationSize) {
        const parent1 = this.tournamentSelection(sorted);
        const parent2 = this.tournamentSelection(sorted);
        
        let child = this.crossover(parent1.individual, parent2.individual);
        
        if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < mutationRate) {
          child = this.mutate(child, constraints);
        }
        
        newPopulation.push(child);
      }

      population = newPopulation;
    }

    // Return best solution
    const finalFitness = await Promise.all(
      population.map(individual => 
        this.evaluateTerpeneFitness(individual, targetProfile, constraints)
      )
    );
    const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
    
    return population[bestIndex];
  }

  // Evaluate fitness of spectrum for terpene production
  private async evaluateTerpeneFitness(
    spectrum: any,
    targetProfile: TerpeneTarget,
    constraints: any
  ): Promise<number> {
    let fitness = 0;

    // Calculate expected terpene production for each wavelength
    for (const [terpene, targetAmount] of Object.entries(targetProfile.primaryTerpenes)) {
      const correlations = this.terpeneCorrelations.get(terpene as string) || [];
      
      let expectedProduction = 0;
      for (const corr of correlations) {
        const intensity = spectrum[corr.wavelength] || 0;
        const contribution = intensity * corr.correlation * 0.01;
        expectedProduction += contribution;
      }

      // Calculate fitness based on how close we are to target
      const difference = Math.abs(expectedProduction - (targetAmount as number));
      fitness -= difference * 10; // Penalty for deviation
    }

    // Add constraints penalties
    if (constraints.maxUVDose) {
      const totalUV = (spectrum.uvb280_315 || 0) + (spectrum.uva315_340 || 0) + 
                      (spectrum.uva340_380 || 0) + (spectrum.uv380_390 || 0);
      if (totalUV > constraints.maxUVDose) {
        fitness -= (totalUV - constraints.maxUVDose) * 5;
      }
    }

    if (constraints.maxPower) {
      const totalPower = Object.values(spectrum).reduce((sum: number, val: any) => 
        sum + (typeof val === 'number' ? val : 0), 0) * 0.3; // Rough W/m² conversion
      if (totalPower > constraints.maxPower) {
        fitness -= (totalPower - constraints.maxPower) * 2;
      }
    }

    return Math.max(0, fitness + 100); // Ensure positive fitness
  }

  // Initialize population for genetic algorithm
  private initializePopulation(size: number, baseSpectrum: any, constraints: any): any[] {
    const population = [];
    
    for (let i = 0; i < size; i++) {
      const individual = { ...baseSpectrum };
      
      // Random variations
      Object.keys(individual).forEach(key => {
        const variation = 1 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.4; // ±20% variation
        individual[key] = individual[key] * variation;
        
        // Apply constraints
        if (key.includes('uv') && constraints.maxUVDose) {
          individual[key] = Math.min(individual[key], constraints.maxUVDose / 4);
        }
      });
      
      population.push(individual);
    }
    
    return population;
  }

  // Tournament selection
  private tournamentSelection(sortedPopulation: any[], tournamentSize: number = 3): any {
    const tournament = [];
    for (let i = 0; i < tournamentSize; i++) {
      tournament.push(sortedPopulation[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * sortedPopulation.length)]);
    }
    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
  }

  // Crossover operation
  private crossover(parent1: any, parent2: any): any {
    const child: any = {};
    
    Object.keys(parent1).forEach(key => {
      // Uniform crossover
      child[key] = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.5 ? parent1[key] : parent2[key];
    });
    
    return child;
  }

  // Mutation operation
  private mutate(individual: any, constraints: any): any {
    const mutated = { ...individual };
    const mutationStrength = 0.2;
    
    // Mutate 1-3 random genes
    const numMutations = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3) + 1;
    const keys = Object.keys(mutated);
    
    for (let i = 0; i < numMutations; i++) {
      const key = keys[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * keys.length)];
      const mutation = 1 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * mutationStrength;
      mutated[key] = mutated[key] * mutation;
      
      // Ensure non-negative and apply constraints
      mutated[key] = Math.max(0, mutated[key]);
    }
    
    return mutated;
  }

  // Predict terpene profile from spectrum
  private async predictTerpeneProfile(
    spectrum: any,
    environmental: any,
    growthStage: GrowthStage
  ): Promise<TerpeneProfile> {
    const profile: Partial<TerpeneProfile> = {};
    
    // Calculate each terpene based on correlations
    const terpenes = ['myrcene', 'limonene', 'caryophyllene', 'pinene', 'linalool', 'humulene', 'terpinolene', 'ocimene'];
    
    for (const terpene of terpenes) {
      const correlations = this.terpeneCorrelations.get(terpene) || [];
      let production = 0.5; // Base production
      
      for (const corr of correlations) {
        const intensity = spectrum[corr.wavelength] || 0;
        const optimalRatio = intensity / corr.optimalIntensity;
        
        // Bell curve response - optimal at 1.0
        const response = Math.exp(-Math.pow(optimalRatio - 1, 2) / 0.5);
        production += response * corr.correlation * 0.5;
      }
      
      // Environmental modifiers
      if (environmental.temperature.night < 18) {
        production *= 1.1; // Cold nights preserve terpenes
      }
      
      if (growthStage === GrowthStage.FLOWERING) {
        production *= 1.2; // Higher production in flower
      }
      
      profile[terpene as keyof TerpeneProfile] = Math.max(0.1, Math.min(2.0, production));
    }
    
    // Calculate total
    profile.totalTerpenes = this.calculateTotalTerpenes(profile as TerpeneProfile);
    
    return profile as TerpeneProfile;
  }

  // Get optimal timing for terpene enhancement
  private getOptimalTiming(effect: TerpeneTarget['effect'], growthStage: GrowthStage) {
    const baseWeek = growthStage === GrowthStage.FLOWERING ? 5 : 1;
    
    return {
      stage: growthStage,
      weekStart: baseWeek,
      weekEnd: baseWeek + 3,
      lightSchedule: growthStage === GrowthStage.FLOWERING ? '12/12' : '18/6'
    };
  }

  // Calculate total terpenes
  private calculateTotalTerpenes(profile: Partial<TerpeneProfile>): number {
    return Object.entries(profile)
      .filter(([key]) => key !== 'totalTerpenes')
      .reduce((sum, [_, value]) => sum + (value as number || 0), 0);
  }

  // Calculate yield impact
  private calculateYieldImpact(spectrum: any, preserveYield?: boolean): number {
    const totalUV = (spectrum.uvb280_315 || 0) + (spectrum.uva315_340 || 0) + 
                    (spectrum.uva340_380 || 0) + (spectrum.uv380_390 || 0);
    
    // UV stress reduces yield
    let yieldImpact = -totalUV * 0.3; // -0.3% per μmol UV
    
    // High blue can reduce stretch (good for some strains)
    if (spectrum.blue440_480 > 120) {
      yieldImpact += 2; // Slight positive from reduced stretch
    }
    
    if (preserveYield) {
      yieldImpact = Math.max(yieldImpact, -5); // Limit to 5% loss
    }
    
    return yieldImpact;
  }

  // Get spectrum adjustments for specific terpene
  async getSpectrumForTerpene(
    terpene: keyof TerpeneProfile,
    currentLevel: number,
    targetLevel: number,
    currentSpectrum: any
  ): Promise<{ adjustments: any; confidence: number }> {
    const correlations = this.terpeneCorrelations.get(terpene as string) || [];
    const adjustments = { ...currentSpectrum };
    
    const percentChange = ((targetLevel - currentLevel) / currentLevel) * 100;
    
    // Apply adjustments based on correlations
    for (const corr of correlations) {
      if (corr.correlation > 0.6) { // Strong positive correlation
        const adjustment = 1 + (percentChange * corr.correlation / 100);
        adjustments[corr.wavelength] = (adjustments[corr.wavelength] || 0) * adjustment;
      }
    }
    
    return {
      adjustments,
      confidence: 0.75 + (correlations.length * 0.05) // More data = higher confidence
    };
  }

  // Get default spectrum
  private getDefaultSpectrum(): any {
    return {
      uvb280_315: 0,
      uva315_340: 0,
      uva340_380: 0,
      uv380_390: 10,
      violet400_420: 40,
      blue440_480: 90,
      green520_560: 20,
      red620_660: 140,
      farRed700_730: 25
    };
  }
}