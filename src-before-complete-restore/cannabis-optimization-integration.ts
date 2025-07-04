import { CannabisTerpeneOptimizer, TerpeneProfile, TerpeneTarget } from './cannabis-terpene-optimizer';
import { CannabisUVTHCAnalyzer, UVProtocol, THCPrediction } from './cannabis-uv-thc-analyzer';
import { SpectralMLIntegration } from './spectral-ml-integration';
import { GrowthStage, EnvironmentType, StrainType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Comprehensive cannabis optimization profile
export interface CannabisOptimizationProfile {
  strain: {
    name: string;
    type: StrainType;
    floweringWeeks: number;
    baselineTHC: number;
    baselineCBD: number;
    baselineTerpenes: number;
  };
  targets: {
    thc?: number;
    cbd?: number;
    terpeneProfile?: TerpeneTarget['effect'];
    yieldPriority: 'maximize' | 'maintain' | 'sacrifice';
  };
  currentStage: {
    growthStage: GrowthStage;
    weekNumber: number;
    daysRemaining: number;
  };
  environment: {
    type: EnvironmentType;
    currentSpectrum: any;
    temperature: { day: number; night: number };
    humidity: { day: number; night: number };
    co2: number;
  };
}

export interface OptimizationResult {
  spectrum: {
    immediate: any; // Current week adjustments
    progressive: any[]; // Week-by-week changes
    uvProtocol: UVProtocol;
  };
  environmental: {
    temperature: { day: number; night: number };
    humidity: { day: number; night: number };
    vpd: { day: number; night: number };
    co2: number;
  };
  predictions: {
    thc: { current: number; projected: number; confidence: number };
    cbd: { current: number; projected: number; confidence: number };
    terpenes: { profile: TerpeneProfile; total: number; confidence: number };
    yield: { baseline: number; projected: number; change: number };
  };
  timeline: {
    week: number;
    actions: string[];
    expectedResults: string[];
  }[];
  warnings: string[];
  recommendations: string[];
}

export class CannabisOptimizationIntegration {
  private terpeneOptimizer: CannabisTerpeneOptimizer;
  private uvAnalyzer: CannabisUVTHCAnalyzer;
  private spectralML: SpectralMLIntegration;

  constructor() {
    this.terpeneOptimizer = new CannabisTerpeneOptimizer();
    this.uvAnalyzer = new CannabisUVTHCAnalyzer();
    this.spectralML = new SpectralMLIntegration();
  }

  // Comprehensive optimization for cannabis cultivation
  async optimizeCannabisProduction(
    profile: CannabisOptimizationProfile
  ): Promise<OptimizationResult> {
    // Analyze current status
    const currentAnalysis = await this.analyzeCurrentStatus(profile);

    // Optimize for cannabinoids (THC/CBD)
    const cannabinoidOptimization = await this.optimizeCannabinoids(profile, currentAnalysis);

    // Optimize for terpenes
    const terpeneOptimization = await this.optimizeTerpenes(profile, currentAnalysis);

    // Merge optimizations
    const mergedSpectrum = this.mergeOptimizations(
      cannabinoidOptimization.spectrum,
      terpeneOptimization.recommendedSpectrum,
      profile.targets.yieldPriority
    );

    // Create progressive timeline
    const timeline = this.createOptimizationTimeline(
      profile,
      mergedSpectrum,
      cannabinoidOptimization.uvProtocol
    );

    // Generate predictions
    const predictions = await this.generatePredictions(
      profile,
      mergedSpectrum,
      cannabinoidOptimization,
      terpeneOptimization
    );

    // Generate warnings and recommendations
    const { warnings, recommendations } = this.generateGuidance(
      profile,
      predictions,
      cannabinoidOptimization.uvProtocol
    );

    return {
      spectrum: {
        immediate: mergedSpectrum.immediate,
        progressive: timeline.map(t => t.spectrum),
        uvProtocol: cannabinoidOptimization.uvProtocol
      },
      environmental: terpeneOptimization.environmentalConditions,
      predictions,
      timeline,
      warnings,
      recommendations
    };
  }

  // Analyze current cultivation status
  private async analyzeCurrentStatus(profile: CannabisOptimizationProfile) {
    // Get historical data if available
    const historicalData = await this.getHistoricalData(profile.strain.name);

    // Analyze current spectrum efficiency
    const spectrumAnalysis = await this.spectralML.analyzeSpectrumEfficiency({
      currentSpectrum: profile.environment.currentSpectrum,
      environmentalConditions: {
        temperature: profile.environment.temperature.day,
        humidity: profile.environment.humidity.day,
        co2: profile.environment.co2,
        vpd: this.calculateVPD(
          profile.environment.temperature.day,
          profile.environment.humidity.day
        )
      },
      cropType: 'cannabis',
      growthStage: profile.currentStage.growthStage,
      targetMetric: profile.targets.thc ? 'yield' : 'quality'
    });

    return {
      historicalData,
      spectrumAnalysis,
      currentTHCTrajectory: this.calculateTHCTrajectory(profile),
      currentTerpeneProfile: await this.estimateCurrentTerpenes(profile)
    };
  }

  // Optimize for cannabinoids
  private async optimizeCannabinoids(
    profile: CannabisOptimizationProfile,
    currentAnalysis: any
  ) {
    const uvAnalysis = await this.uvAnalyzer.analyzeStrainUVResponse({
      strainName: profile.strain.name,
      strainType: this.mapStrainType(profile.strain.type),
      baselineTHC: profile.strain.baselineTHC,
      floweringWeeks: profile.strain.floweringWeeks,
      currentWeek: profile.currentStage.weekNumber,
      growthData: currentAnalysis.historicalData
    });

    // Adjust UV protocol based on targets
    let selectedProtocol = uvAnalysis.optimalProtocol;
    
    if (profile.targets.yieldPriority === 'maximize') {
      // Select protocol with minimal yield loss
      const protocols = await this.uvAnalyzer.analyzeExperimentResults([]);
      for (const [_, protocol] of protocols.bestProtocols) {
        if (protocol.yieldImpact > -5 && protocol.expectedTHCIncrease > 15) {
          selectedProtocol = protocol;
          break;
        }
      }
    }

    // Calculate optimal spectrum including UV
    const spectrum = this.addUVToSpectrum(
      profile.environment.currentSpectrum,
      selectedProtocol,
      profile.currentStage.weekNumber
    );

    return {
      spectrum,
      uvProtocol: selectedProtocol,
      predictions: uvAnalysis.predictions,
      recommendations: uvAnalysis.customRecommendations
    };
  }

  // Optimize for terpenes
  private async optimizeTerpenes(
    profile: CannabisOptimizationProfile,
    currentAnalysis: any
  ) {
    const targetEffect = profile.targets.terpeneProfile || 'balanced';
    
    const terpeneOptimization = await this.terpeneOptimizer.optimizeTerpeneProfile({
      targetEffect,
      currentSpectrum: profile.environment.currentSpectrum,
      strain: profile.strain.name,
      growthStage: profile.currentStage.growthStage,
      environmentType: profile.environment.type,
      constraints: {
        maxUVDose: 300, // μmol/m²/day
        maxPower: 350, // W/m²
        preserveYield: profile.targets.yieldPriority !== 'sacrifice'
      }
    });

    return terpeneOptimization;
  }

  // Merge cannabinoid and terpene optimizations
  private mergeOptimizations(
    cannabinoidSpectrum: any,
    terpeneSpectrum: any,
    yieldPriority: string
  ) {
    const merged: any = {};
    
    // Start with cannabinoid spectrum as base
    Object.assign(merged, cannabinoidSpectrum);

    // Blend in terpene optimizations
    Object.keys(terpeneSpectrum).forEach(band => {
      if (merged[band]) {
        // Weight based on priorities
        const cannabinoidWeight = yieldPriority === 'sacrifice' ? 0.7 : 0.5;
        const terpeneWeight = 1 - cannabinoidWeight;
        
        merged[band] = (merged[band] * cannabinoidWeight) + 
                      (terpeneSpectrum[band] * terpeneWeight);
      } else {
        merged[band] = terpeneSpectrum[band];
      }
    });

    // Apply safety limits
    this.applySafetyLimits(merged);

    return {
      immediate: merged,
      weeklyAdjustments: this.calculateWeeklyAdjustments(merged)
    };
  }

  // Create optimization timeline
  private createOptimizationTimeline(
    profile: CannabisOptimizationProfile,
    spectrum: any,
    uvProtocol: UVProtocol
  ) {
    const timeline: any[] = [];
    const currentWeek = profile.currentStage.weekNumber;
    const totalWeeks = profile.strain.floweringWeeks;

    for (let week = currentWeek; week <= totalWeeks; week++) {
      const weekPlan = {
        week,
        actions: [] as string[],
        expectedResults: [] as string[],
        spectrum: { ...spectrum.immediate }
      };

      // UV protocol timing
      if (week === uvProtocol.weekStart) {
        weekPlan.actions.push(`Begin ${uvProtocol.name} UV supplementation`);
        weekPlan.actions.push(`UV: ${uvProtocol.duration} minutes ${uvProtocol.timing}`);
        weekPlan.expectedResults.push('Trichome density increase begins');
      }

      // Spectrum adjustments by week
      if (week <= 4) {
        // Early flower - blue dominant
        weekPlan.spectrum.blue440_480 *= 1.1;
        weekPlan.actions.push('Maintain blue-dominant spectrum for structure');
      } else if (week <= 6) {
        // Mid flower - transition
        weekPlan.spectrum.red620_660 *= 1.15;
        weekPlan.spectrum.blue440_480 *= 0.9;
        weekPlan.actions.push('Shift to red-dominant spectrum');
        weekPlan.expectedResults.push('Flower development acceleration');
      } else {
        // Late flower - ripening
        weekPlan.spectrum.farRed700_730 *= 1.2;
        weekPlan.actions.push('Increase far-red for ripening');
        weekPlan.expectedResults.push('Trichome maturation enhancement');
      }

      // Temperature adjustments for terpenes
      if (week >= totalWeeks - 2) {
        weekPlan.actions.push('Reduce night temperature by 2°C for terpene preservation');
        weekPlan.expectedResults.push('Enhanced terpene retention');
      }

      timeline.push(weekPlan);
    }

    return timeline;
  }

  // Generate comprehensive predictions
  private async generatePredictions(
    profile: CannabisOptimizationProfile,
    spectrum: any,
    cannabinoidOpt: any,
    terpeneOpt: any
  ) {
    // THC prediction
    const thcPrediction = cannabinoidOpt.predictions;

    // CBD prediction (inverse correlation with THC in most cases)
    const cbdProjected = profile.targets.cbd || 
      (profile.strain.baselineCBD * (1 - (thcPrediction.increase / 200)));

    // Yield prediction
    const yieldBaseline = 100; // Baseline 100%
    const yieldImpact = cannabinoidOpt.uvProtocol.yieldImpact + 
                       terpeneOpt.expectedOutcome.yieldImpact;
    const yieldProjected = yieldBaseline + yieldImpact;

    return {
      thc: {
        current: profile.strain.baselineTHC,
        projected: thcPrediction.withUV,
        confidence: thcPrediction.confidence
      },
      cbd: {
        current: profile.strain.baselineCBD,
        projected: cbdProjected,
        confidence: 0.7 // Lower confidence for CBD
      },
      terpenes: {
        profile: terpeneOpt.expectedOutcome.terpeneProfile,
        total: terpeneOpt.expectedOutcome.totalTerpenes,
        confidence: terpeneOpt.expectedOutcome.confidence
      },
      yield: {
        baseline: yieldBaseline,
        projected: yieldProjected,
        change: yieldProjected - yieldBaseline
      }
    };
  }

  // Generate warnings and recommendations
  private generateGuidance(
    profile: CannabisOptimizationProfile,
    predictions: any,
    uvProtocol: UVProtocol
  ) {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // UV warnings
    if (uvProtocol.wavelengths.some(w => w.type === 'UVB')) {
      warnings.push('UVB exposure requires eye protection and careful monitoring');
      warnings.push('Watch for signs of light bleaching on upper canopy');
    }

    // Yield warnings
    if (predictions.yield.change < -10) {
      warnings.push(`Significant yield reduction expected (${predictions.yield.change}%)`);
      recommendations.push('Consider reducing UV intensity to preserve yield');
    }

    // THC warnings
    if (predictions.thc.projected > 30) {
      warnings.push('Extremely high THC may impact terpene production');
      recommendations.push('Monitor terpene levels closely above 30% THC');
    }

    // Environmental recommendations
    if (profile.currentStage.growthStage === GrowthStage.FLOWERING) {
      recommendations.push('Maintain stable environmental conditions during flowering');
      recommendations.push('Avoid temperature fluctuations > 5°C during dark period');
    }

    // Strain-specific recommendations
    if (profile.strain.type === StrainType.INDICA) {
      recommendations.push('Indica strains benefit from cooler night temperatures');
      recommendations.push('Consider 65-70°F nights for optimal terpene preservation');
    } else if (profile.strain.type === StrainType.SATIVA) {
      recommendations.push('Sativa strains can handle higher light intensities');
      recommendations.push('Monitor for excessive stretch with far-red supplementation');
    }

    // Nutrient recommendations
    recommendations.push('Increase calcium by 15% during UV supplementation');
    recommendations.push('Monitor for magnesium deficiency under high UV');
    
    // Harvest timing
    const daysToHarvest = profile.currentStage.daysRemaining;
    if (daysToHarvest <= 14) {
      recommendations.push('Begin flush if using synthetic nutrients');
      recommendations.push('Monitor trichomes daily - harvest at 10-30% amber');
    }

    return { warnings, recommendations };
  }

  // Helper methods
  private calculateVPD(temperature: number, humidity: number): number {
    const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    return svp * (1 - humidity / 100);
  }

  private mapStrainType(type: StrainType): 'indica' | 'sativa' | 'hybrid' {
    switch (type) {
      case StrainType.INDICA:
        return 'indica';
      case StrainType.SATIVA:
        return 'sativa';
      default:
        return 'hybrid';
    }
  }

  private async getHistoricalData(strainName: string) {
    // In production, fetch from database
    return [];
  }

  private calculateTHCTrajectory(profile: CannabisOptimizationProfile) {
    const weeklyIncrease = 2.5; // Average % per week in flower
    const weeksRemaining = profile.strain.floweringWeeks - profile.currentStage.weekNumber;
    return profile.strain.baselineTHC + (weeklyIncrease * weeksRemaining);
  }

  private async estimateCurrentTerpenes(profile: CannabisOptimizationProfile) {
    // Estimate based on growth stage
    const stageMultiplier = profile.currentStage.growthStage === GrowthStage.FLOWERING
      ? profile.currentStage.weekNumber / profile.strain.floweringWeeks
      : 0.1;
    
    return profile.strain.baselineTerpenes * stageMultiplier;
  }

  private addUVToSpectrum(currentSpectrum: any, uvProtocol: UVProtocol, currentWeek: number) {
    const spectrum = { ...currentSpectrum };
    
    if (currentWeek >= uvProtocol.weekStart && currentWeek <= uvProtocol.weekEnd) {
      // Add UV based on protocol
      uvProtocol.wavelengths.forEach(band => {
        const key = `uv${band.rangeStart}_${band.rangeEnd}`;
        spectrum[key] = (spectrum[key] || 0) + (uvProtocol.intensity * band.optimalDose / 100);
      });
    }
    
    return spectrum;
  }

  private calculateWeeklyAdjustments(spectrum: any) {
    // Calculate progressive adjustments
    const adjustments = [];
    for (let i = 0; i < 4; i++) {
      adjustments.push({
        week: i + 1,
        factor: 0.25 * (i + 1) // Ramp up over 4 weeks
      });
    }
    return adjustments;
  }

  private applySafetyLimits(spectrum: any) {
    // Maximum safe intensities
    const limits: Record<string, number> = {
      uvb280_315: 3,
      uva315_340: 10,
      uva340_380: 20,
      uv380_390: 30,
      violet400_420: 60,
      blue440_480: 150,
      green520_560: 50,
      red620_660: 200,
      farRed700_730: 50
    };

    Object.keys(spectrum).forEach(band => {
      if (limits[band] && spectrum[band] > limits[band]) {
        spectrum[band] = limits[band];
      }
    });
  }

  // Save optimization profile for future reference
  async saveOptimizationProfile(
    userId: string,
    profile: CannabisOptimizationProfile,
    result: OptimizationResult
  ) {
    const saved = await prisma.cannabisStrainProfile.create({
      data: {
        strainName: profile.strain.name,
        strainType: profile.strain.type,
        targetTHC: profile.targets.thc || profile.strain.baselineTHC,
        targetCBD: profile.targets.cbd || profile.strain.baselineCBD,
        targetTerpenes: result.predictions.terpenes.profile as any,
        vegetativeSpectrum: {}, // Would be filled based on stage
        floweringSpectrum: result.spectrum.immediate,
        uvProtocol: {
          protocol: result.spectrum.uvProtocol.name,
          timing: result.spectrum.uvProtocol.timing,
          duration: result.spectrum.uvProtocol.duration,
          weeks: `${result.spectrum.uvProtocol.weekStart}-${result.spectrum.uvProtocol.weekEnd}`
        },
        optimalVPD: {
          veg: { min: 0.8, max: 1.0 },
          flower: { min: 1.0, max: 1.2 }
        },
        optimalTemp: result.environmental.temperature
      }
    });

    return saved;
  }
}