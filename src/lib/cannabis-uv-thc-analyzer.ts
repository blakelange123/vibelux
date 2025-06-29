import { SpectralRegressionEngine } from './spectral-regression-engine';
import { prisma } from '@/lib/prisma';
import * as tf from '@tensorflow/tfjs';

// UV wavelength bands and their effects
export interface UVBand {
  name: string;
  rangeStart: number;
  rangeEnd: number;
  type: 'UVB' | 'UVA' | 'Violet';
  thcCorrelation: number;
  cbdCorrelation: number;
  stressLevel: 'high' | 'medium' | 'low';
  optimalDose: number; // μmol/m²/day
}

export interface UVProtocol {
  id: string;
  name: string;
  description: string;
  timing: 'continuous' | 'end-of-day' | 'pulsed' | 'night-break';
  duration: number; // minutes per day
  intensity: number; // μmol/m²/s
  wavelengths: UVBand[];
  weekStart: number; // week of flowering to start
  weekEnd: number; // week of flowering to end
  expectedTHCIncrease: number; // percentage
  yieldImpact: number; // percentage (negative = loss)
  trichomeDensityIncrease: number; // percentage
}

export interface THCPrediction {
  baseline: number;
  withUV: number;
  increase: number;
  confidence: number;
  optimalProtocol: UVProtocol;
  riskFactors: string[];
}

export interface UVExperimentResult {
  strainName: string;
  protocol: UVProtocol;
  startTHC: number;
  finalTHC: number;
  thcIncrease: number;
  yieldChange: number;
  trichomeDensity: number;
  plantStress: 'none' | 'mild' | 'moderate' | 'severe';
  notes: string;
}

export class CannabisUVTHCAnalyzer {
  private regressionEngine: SpectralRegressionEngine;
  private uvBands: UVBand[];
  private protocols: Map<string, UVProtocol>;
  private strainDatabase: Map<string, any>;

  constructor() {
    this.regressionEngine = new SpectralRegressionEngine();
    this.uvBands = this.initializeUVBands();
    this.protocols = this.initializeProtocols();
    this.strainDatabase = new Map();
  }

  // Initialize UV wavelength bands with known correlations
  private initializeUVBands(): UVBand[] {
    return [
      {
        name: 'UVB Deep',
        rangeStart: 280,
        rangeEnd: 295,
        type: 'UVB',
        thcCorrelation: 0.92,
        cbdCorrelation: -0.15,
        stressLevel: 'high',
        optimalDose: 50
      },
      {
        name: 'UVB Standard',
        rangeStart: 295,
        rangeEnd: 315,
        type: 'UVB',
        thcCorrelation: 0.87,
        cbdCorrelation: -0.12,
        stressLevel: 'high',
        optimalDose: 80
      },
      {
        name: 'UVA Lower',
        rangeStart: 315,
        rangeEnd: 340,
        type: 'UVA',
        thcCorrelation: 0.65,
        cbdCorrelation: -0.08,
        stressLevel: 'medium',
        optimalDose: 150
      },
      {
        name: 'UVA Mid',
        rangeStart: 340,
        rangeEnd: 380,
        type: 'UVA',
        thcCorrelation: 0.72,
        cbdCorrelation: -0.05,
        stressLevel: 'medium',
        optimalDose: 200
      },
      {
        name: 'UVA Upper (Critical)',
        rangeStart: 380,
        rangeEnd: 390,
        type: 'UVA',
        thcCorrelation: 0.78,
        cbdCorrelation: -0.03,
        stressLevel: 'low',
        optimalDose: 250
      },
      {
        name: 'UVA/Violet Boundary',
        rangeStart: 390,
        rangeEnd: 400,
        type: 'UVA',
        thcCorrelation: 0.68,
        cbdCorrelation: 0.05,
        stressLevel: 'low',
        optimalDose: 300
      },
      {
        name: 'Deep Violet',
        rangeStart: 400,
        rangeEnd: 420,
        type: 'Violet',
        thcCorrelation: 0.55,
        cbdCorrelation: 0.12,
        stressLevel: 'low',
        optimalDose: 400
      }
    ];
  }

  // Initialize UV protocols
  private initializeProtocols(): Map<string, UVProtocol> {
    const protocols = new Map<string, UVProtocol>();

    protocols.set('uvb-eod', {
      id: 'uvb-eod',
      name: 'UVB End-of-Day',
      description: 'Traditional UVB supplementation during last 2-3 hours of light cycle',
      timing: 'end-of-day',
      duration: 150, // 2.5 hours
      intensity: 2.0, // μmol/m²/s
      wavelengths: this.uvBands.filter(band => band.type === 'UVB'),
      weekStart: 5,
      weekEnd: 8,
      expectedTHCIncrease: 25,
      yieldImpact: -8,
      trichomeDensityIncrease: 35
    });

    protocols.set('380-390-eod', {
      id: '380-390-eod',
      name: '380-390nm End-of-Day',
      description: 'Lower stress alternative using 380-390nm range only',
      timing: 'end-of-day',
      duration: 180, // 3 hours
      intensity: 5.0,
      wavelengths: this.uvBands.filter(band => 
        band.rangeStart >= 380 && band.rangeEnd <= 390
      ),
      weekStart: 4,
      weekEnd: 8,
      expectedTHCIncrease: 20,
      yieldImpact: -3,
      trichomeDensityIncrease: 28
    });

    protocols.set('pulsed-uv', {
      id: 'pulsed-uv',
      name: 'Pulsed UV Protocol',
      description: '15-minute pulses every 2 hours during light cycle',
      timing: 'pulsed',
      duration: 120, // total minutes
      intensity: 3.0,
      wavelengths: this.uvBands.filter(band => 
        band.type === 'UVB' || (band.rangeStart >= 380 && band.rangeEnd <= 400)
      ),
      weekStart: 5,
      weekEnd: 8,
      expectedTHCIncrease: 28,
      yieldImpact: -10,
      trichomeDensityIncrease: 40
    });

    protocols.set('progressive-uv', {
      id: 'progressive-uv',
      name: 'Progressive UV',
      description: 'Start with violet, progressively add UV wavelengths',
      timing: 'continuous',
      duration: 240,
      intensity: 1.5,
      wavelengths: this.uvBands,
      weekStart: 3,
      weekEnd: 8,
      expectedTHCIncrease: 22,
      yieldImpact: -5,
      trichomeDensityIncrease: 32
    });

    protocols.set('violet-continuous', {
      id: 'violet-continuous',
      name: 'Violet Enhancement',
      description: 'Continuous 400-420nm throughout flowering',
      timing: 'continuous',
      duration: 720, // 12 hours
      intensity: 8.0,
      wavelengths: this.uvBands.filter(band => band.type === 'Violet'),
      weekStart: 1,
      weekEnd: 8,
      expectedTHCIncrease: 12,
      yieldImpact: 2, // Slight increase from enhanced photosynthesis
      trichomeDensityIncrease: 18
    });

    return protocols;
  }

  // Analyze UV-THC correlations for a strain
  async analyzeStrainUVResponse(params: {
    strainName: string;
    strainType: 'indica' | 'sativa' | 'hybrid';
    baselineTHC: number;
    floweringWeeks: number;
    currentWeek: number;
    growthData?: any[];
  }): Promise<{
    correlations: Map<string, number>;
    optimalProtocol: UVProtocol;
    predictions: THCPrediction;
    customRecommendations: string[];
  }> {
    // Calculate strain-specific correlations
    const correlations = await this.calculateStrainCorrelations(params);

    // Find optimal protocol based on strain characteristics
    const optimalProtocol = this.selectOptimalProtocol(
      params.strainType,
      params.baselineTHC,
      params.floweringWeeks
    );

    // Generate predictions
    const predictions = await this.predictTHCIncrease(
      params.baselineTHC,
      optimalProtocol,
      params.currentWeek,
      correlations
    );

    // Generate custom recommendations
    const recommendations = this.generateRecommendations(
      params,
      correlations,
      optimalProtocol
    );

    return {
      correlations,
      optimalProtocol,
      predictions,
      customRecommendations: recommendations
    };
  }

  // Calculate strain-specific UV correlations
  private async calculateStrainCorrelations(params: any): Promise<Map<string, number>> {
    const correlations = new Map<string, number>();

    // Base correlations from UV bands
    for (const band of this.uvBands) {
      let correlation = band.thcCorrelation;

      // Strain type modifiers
      if (params.strainType === 'sativa') {
        // Sativas generally respond better to UV
        correlation *= 1.1;
      } else if (params.strainType === 'indica') {
        // Indicas are more sensitive, lower correlation but less stress
        correlation *= 0.95;
      }

      // Baseline THC modifiers
      if (params.baselineTHC > 20) {
        // High THC strains have diminishing returns
        correlation *= 0.9;
      } else if (params.baselineTHC < 15) {
        // Low THC strains show greater improvement
        correlation *= 1.15;
      }

      correlations.set(band.name, Math.min(1.0, correlation));
    }

    // Add interaction effects
    correlations.set('UV-Blue-Synergy', 0.82); // UV + Blue light synergy
    correlations.set('UV-Temperature', -0.45); // High temp reduces UV effectiveness
    correlations.set('UV-VPD', 0.65); // Proper VPD enhances UV response

    return correlations;
  }

  // Select optimal protocol based on strain
  private selectOptimalProtocol(
    strainType: string,
    baselineTHC: number,
    floweringWeeks: number
  ): UVProtocol {
    let bestProtocol: UVProtocol | null = null;
    let bestScore = 0;

    for (const protocol of this.protocols.values()) {
      let score = 0;

      // Score based on expected THC increase
      score += protocol.expectedTHCIncrease * 2;

      // Penalty for yield loss
      score += protocol.yieldImpact; // Negative values reduce score

      // Strain type preferences
      if (strainType === 'sativa' && protocol.timing === 'pulsed') {
        score += 10; // Sativas handle stress better
      } else if (strainType === 'indica' && protocol.id === '380-390-eod') {
        score += 15; // Indicas prefer gentler approach
      }

      // Timing considerations
      if (floweringWeeks <= 8 && protocol.weekEnd > 8) {
        score -= 20; // Protocol too long for strain
      }

      // High baseline THC strains need more aggressive protocols
      if (baselineTHC > 20 && protocol.expectedTHCIncrease < 20) {
        score -= 10;
      }

      if (score > bestScore) {
        bestScore = score;
        bestProtocol = protocol;
      }
    }

    return bestProtocol || this.protocols.get('380-390-eod')!;
  }

  // Predict THC increase with UV supplementation
  private async predictTHCIncrease(
    baselineTHC: number,
    protocol: UVProtocol,
    currentWeek: number,
    correlations: Map<string, number>
  ): Promise<THCPrediction> {
    // Calculate base increase from protocol
    let increase = protocol.expectedTHCIncrease;

    // Adjust for timing
    if (currentWeek < protocol.weekStart) {
      increase = 0; // Too early
    } else if (currentWeek > protocol.weekEnd) {
      increase *= 0.7; // Diminishing returns
    }

    // Apply correlation modifiers
    const avgCorrelation = Array.from(correlations.values())
      .reduce((sum, val) => sum + val, 0) / correlations.size;
    
    increase *= avgCorrelation;

    // Calculate final THC
    const withUV = baselineTHC * (1 + increase / 100);

    // Identify risk factors
    const riskFactors: string[] = [];
    
    if (protocol.yieldImpact < -5) {
      riskFactors.push(`Yield reduction of ${Math.abs(protocol.yieldImpact)}% expected`);
    }
    
    if (protocol.timing === 'pulsed' || protocol.timing === 'continuous') {
      riskFactors.push('Higher risk of light stress and bleaching');
    }
    
    if (withUV > 30) {
      riskFactors.push('THC levels above 30% may reduce terpene production');
    }

    return {
      baseline: baselineTHC,
      withUV: Math.min(35, withUV), // Cap at 35%
      increase: increase,
      confidence: 0.75 + (correlations.size * 0.02), // More data = higher confidence
      optimalProtocol: protocol,
      riskFactors
    };
  }

  // Generate strain-specific recommendations
  private generateRecommendations(
    params: any,
    correlations: Map<string, number>,
    protocol: UVProtocol
  ): string[] {
    const recommendations: string[] = [];

    // Timing recommendations
    if (params.currentWeek < protocol.weekStart) {
      recommendations.push(
        `Wait until week ${protocol.weekStart} to begin UV supplementation for optimal results`
      );
    }

    // Wavelength recommendations
    const uv380390Correlation = correlations.get('UVA Upper (Critical)') || 0;
    if (uv380390Correlation > 0.75) {
      recommendations.push(
        '380-390nm shows exceptional correlation with THC for this strain - prioritize this range'
      );
    }

    // Strain-specific advice
    if (params.strainType === 'indica') {
      recommendations.push(
        'As an indica, use lower UV intensities and monitor for stress closely'
      );
      recommendations.push(
        'Consider starting with violet (400-420nm) and gradually introduce UV'
      );
    } else if (params.strainType === 'sativa') {
      recommendations.push(
        'Sativa strains can handle more aggressive UV protocols - consider pulsed delivery'
      );
    }

    // Environmental considerations
    recommendations.push(
      'Maintain temperatures below 26°C (78°F) during UV exposure to prevent stress'
    );
    recommendations.push(
      'Increase calcium and magnesium by 15% when using UV to support trichome production'
    );

    // Protocol-specific tips
    if (protocol.timing === 'end-of-day') {
      recommendations.push(
        'Apply UV during last 2-3 hours of light cycle when stomata are closing'
      );
    } else if (protocol.timing === 'pulsed') {
      recommendations.push(
        'Start with 10-minute pulses and gradually increase to prevent shock'
      );
    }

    return recommendations;
  }

  // Analyze historical experiment data
  async analyzeExperimentResults(
    experiments: UVExperimentResult[]
  ): Promise<{
    bestProtocols: Map<string, UVProtocol>;
    averageResults: Map<string, any>;
    insights: string[];
  }> {
    const bestProtocols = new Map<string, UVProtocol>();
    const protocolResults = new Map<string, any[]>();

    // Group results by protocol
    for (const exp of experiments) {
      const key = exp.protocol.id;
      if (!protocolResults.has(key)) {
        protocolResults.set(key, []);
      }
      protocolResults.get(key)!.push(exp);
    }

    // Calculate averages and find best protocols
    const averageResults = new Map<string, any>();
    
    for (const [protocolId, results] of protocolResults.entries()) {
      const avg = {
        thcIncrease: results.reduce((sum, r) => sum + r.thcIncrease, 0) / results.length,
        yieldChange: results.reduce((sum, r) => sum + r.yieldChange, 0) / results.length,
        trichomeDensity: results.reduce((sum, r) => sum + r.trichomeDensity, 0) / results.length,
        successRate: results.filter(r => r.plantStress === 'none' || r.plantStress === 'mild').length / results.length
      };
      
      averageResults.set(protocolId, avg);
      
      // Track best protocol for each metric
      if (!bestProtocols.has('thc') || avg.thcIncrease > averageResults.get(bestProtocols.get('thc')!.id)!.thcIncrease) {
        bestProtocols.set('thc', this.protocols.get(protocolId)!);
      }
    }

    // Generate insights
    const insights = this.generateInsights(experiments, averageResults);

    return {
      bestProtocols,
      averageResults,
      insights
    };
  }

  // Generate insights from experiment data
  private generateInsights(
    experiments: UVExperimentResult[],
    averageResults: Map<string, any>
  ): string[] {
    const insights: string[] = [];

    // Find optimal timing patterns
    const weeklyResults = new Map<number, number[]>();
    experiments.forEach(exp => {
      const week = exp.protocol.weekStart;
      if (!weeklyResults.has(week)) {
        weeklyResults.set(week, []);
      }
      weeklyResults.get(week)!.push(exp.thcIncrease);
    });

    let bestWeek = 0;
    let bestAvg = 0;
    for (const [week, increases] of weeklyResults.entries()) {
      const avg = increases.reduce((sum, val) => sum + val, 0) / increases.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestWeek = week;
      }
    }

    insights.push(
      `Starting UV supplementation in week ${bestWeek} shows the highest average THC increase (${bestAvg.toFixed(1)}%)`
    );

    // Strain-specific patterns
    const strainGroups = new Map<string, UVExperimentResult[]>();
    experiments.forEach(exp => {
      if (!strainGroups.has(exp.strainName)) {
        strainGroups.set(exp.strainName, []);
      }
      strainGroups.get(exp.strainName)!.push(exp);
    });

    for (const [strain, results] of strainGroups.entries()) {
      if (results.length >= 3) {
        const avgIncrease = results.reduce((sum, r) => sum + r.thcIncrease, 0) / results.length;
        const bestProtocol = results.reduce((best, current) => 
          current.thcIncrease > best.thcIncrease ? current : best
        ).protocol;
        
        insights.push(
          `${strain} responds best to ${bestProtocol.name} with average ${avgIncrease.toFixed(1)}% THC increase`
        );
      }
    }

    // Wavelength insights
    const has380390 = experiments.filter(exp => 
      exp.protocol.wavelengths.some(w => w.rangeStart === 380 && w.rangeEnd === 390)
    );
    
    if (has380390.length > 0) {
      const avg380390 = has380390.reduce((sum, exp) => sum + exp.thcIncrease, 0) / has380390.length;
      const avgOthers = experiments.filter(exp => !has380390.includes(exp))
        .reduce((sum, exp) => sum + exp.thcIncrease, 0) / (experiments.length - has380390.length);
      
      if (avg380390 > avgOthers * 0.8) {
        insights.push(
          `380-390nm protocols achieve ${((avg380390 / avgOthers - 1) * 100).toFixed(0)}% of traditional UVB effectiveness with significantly less plant stress`
        );
      }
    }

    return insights;
  }

  // Create custom UV protocol
  createCustomProtocol(params: {
    name: string;
    wavelengths: Array<{ start: number; end: number; intensity: number }>;
    timing: UVProtocol['timing'];
    duration: number;
    weekStart: number;
    weekEnd: number;
  }): UVProtocol {
    // Select UV bands based on wavelength ranges
    const selectedBands = this.uvBands.filter(band => 
      params.wavelengths.some(w => 
        (band.rangeStart >= w.start && band.rangeStart < w.end) ||
        (band.rangeEnd > w.start && band.rangeEnd <= w.end)
      )
    );

    // Calculate expected outcomes based on selected bands
    let expectedTHC = 0;
    let stressLevel = 0;
    
    selectedBands.forEach(band => {
      expectedTHC += band.thcCorrelation * 25; // Base 25% increase potential
      stressLevel += band.stressLevel === 'high' ? 3 : 
                     band.stressLevel === 'medium' ? 2 : 1;
    });
    
    expectedTHC = expectedTHC / selectedBands.length;
    const avgStress = stressLevel / selectedBands.length;
    
    // Calculate yield impact based on stress
    const yieldImpact = -avgStress * 3; // Higher stress = more yield loss

    return {
      id: `custom-${Date.now()}`,
      name: params.name,
      description: 'Custom UV protocol',
      timing: params.timing,
      duration: params.duration,
      intensity: params.wavelengths.reduce((sum, w) => sum + w.intensity, 0) / params.wavelengths.length,
      wavelengths: selectedBands,
      weekStart: params.weekStart,
      weekEnd: params.weekEnd,
      expectedTHCIncrease: expectedTHC,
      yieldImpact: yieldImpact,
      trichomeDensityIncrease: expectedTHC * 1.5 // Rough estimate
    };
  }

  // Real-time monitoring and adjustment
  async monitorUVResponse(params: {
    currentProtocol: UVProtocol;
    plantMetrics: {
      leafTemperature: number;
      stomatalConductance: number;
      photosynthesisRate: number;
      visibleStress: boolean;
    };
    dayOfProtocol: number;
  }): Promise<{
    continueProtocol: boolean;
    adjustments: any;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    let continueProtocol = true;
    const adjustments: any = {};

    // Check for stress indicators
    if (params.plantMetrics.leafTemperature > 28) {
      warnings.push('Leaf temperature too high during UV exposure - reduce intensity or ambient temperature');
      adjustments.intensity = params.currentProtocol.intensity * 0.8;
    }

    if (params.plantMetrics.stomatalConductance < 100) {
      warnings.push('Stomata closing due to stress - consider reducing UV duration');
      adjustments.duration = params.currentProtocol.duration * 0.75;
    }

    if (params.plantMetrics.photosynthesisRate < 10) {
      warnings.push('Photosynthesis significantly impaired - UV stress may be too high');
      continueProtocol = false;
    }

    if (params.plantMetrics.visibleStress) {
      warnings.push('Visible stress detected - immediately reduce or discontinue UV');
      continueProtocol = false;
    }

    // Progressive intensity ramping
    if (params.dayOfProtocol <= 3) {
      adjustments.intensity = (params.currentProtocol.intensity * params.dayOfProtocol) / 3;
      warnings.push(`Ramping period: UV at ${(params.dayOfProtocol / 3 * 100).toFixed(0)}% intensity`);
    }

    return {
      continueProtocol,
      adjustments,
      warnings
    };
  }
}