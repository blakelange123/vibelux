/**
 * Cultivar Data Collection and Management Service
 * 
 * Handles automated collection and integration of plant genetics, 
 * phenotype tracking, and strain-specific optimization data.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Enhanced cultivar interface with comprehensive genetics tracking
export interface CultivarProfile {
  id: string;
  strainName: string;
  genetics: {
    dominantType: 'INDICA' | 'SATIVA' | 'HYBRID' | 'HIGH_CBD' | 'RUDERALIS';
    indicaPercentage: number;
    sativaPercentage: number;
    parentLineage: {
      parent1: string;
      parent2: string;
      generation: number;
    };
    geneticMarkers?: {
      thcSynthase: 'high' | 'medium' | 'low';
      cbdSynthase: 'high' | 'medium' | 'low';
      terpeneProfile: string[];
      floweringTime: number; // days
      stretchFactor: number; // height multiplier during flowering
    };
  };
  phenotype: {
    averageHeight: number; // cm
    averageYield: number; // g/plant
    floweringTimeActual: number; // days
    resistanceTraits: {
      powderyMildew: number; // 1-10 scale
      botrytis: number;
      aphids: number;
      thrips: number;
      heatStress: number;
      coldStress: number;
    };
    morphology: {
      internodeSpacing: number; // cm
      leafSize: 'small' | 'medium' | 'large';
      branchingPattern: 'minimal' | 'moderate' | 'heavy';
      budDensity: 'loose' | 'medium' | 'dense';
      trichomeDensity: number; // 1-10 scale
    };
  };
  spectralPreferences: {
    vegetativeSpectrum: {
      uvA: number; // percentage
      blue: number;
      green: number;
      red: number;
      farRed: number;
    };
    floweringSpectrum: {
      uvA: number;
      blue: number;
      green: number;
      red: number;
      farRed: number;
    };
    dliPreferences: {
      vegetative: number; // mol/m²/day
      flowering: number;
    };
    photoperiodSensitivity: 'low' | 'medium' | 'high';
  };
  environmentalOptimums: {
    temperature: {
      vegetativeDayMin: number;
      vegetativeDayMax: number;
      vegetativeNightMin: number;
      vegetativeNightMax: number;
      floweringDayMin: number;
      floweringDayMax: number;
      floweringNightMin: number;
      floweringNightMax: number;
    };
    humidity: {
      vegetativeMin: number;
      vegetativeMax: number;
      floweringMin: number;
      floweringMax: number;
    };
    vpd: {
      vegetativeOptimal: number; // kPa
      floweringOptimal: number;
    };
    co2: {
      vegetativeOptimal: number; // ppm
      floweringOptimal: number;
    };
  };
  qualityTargets: {
    thcTarget: number; // percentage
    cbdTarget: number;
    terpeneTargets: {
      [terpene: string]: number; // percentage
    };
    yieldTarget: number; // g/plant
  };
  cultivationHistory: {
    totalGrowCycles: number;
    averageYieldActual: number;
    averageQualityScore: number;
    bestPerformingConditions: any;
    commonIssues: string[];
  };
}

// Real-time growing cycle data collection
export interface GrowingCycleData {
  cycleId: string;
  cultivarId: string;
  facilityId: string;
  startDate: Date;
  currentStage: 'GERMINATION' | 'SEEDLING' | 'VEGETATIVE' | 'FLOWERING' | 'HARVEST';
  stageStartDate: Date;
  plantCount: number;
  environmentalData: {
    currentConditions: {
      temperature: number;
      humidity: number;
      co2: number;
      vpd: number;
      dli: number;
      photoperiod: number;
    };
    spectralConditions: {
      uvA: number;
      blue: number;
      green: number;
      red: number;
      farRed: number;
      ppfd: number;
    };
  };
  plantMetrics: {
    averageHeight: number;
    averageWidth: number;
    leafAreaIndex: number;
    biomassEstimate: number;
    healthScore: number; // 1-10
    stressIndicators: {
      lightStress: boolean;
      heatStress: boolean;
      nutrientStress: boolean;
      waterStress: boolean;
      pestPresence: boolean;
    };
  };
  interventions: {
    date: Date;
    type: 'spectrum_adjustment' | 'environmental_change' | 'nutrition_change' | 'pest_treatment' | 'training';
    details: any;
    result: string;
  }[];
}

// Automated data collection service
export class CultivarDataCollectionService {
  
  async createCultivarProfile(data: Partial<CultivarProfile>): Promise<CultivarProfile> {
    // Create new cultivar profile with initial genetics data
    const profile = await prisma.cannabisStrainProfile.create({
      data: {
        strain_name: data.strainName!,
        strain_type: data.genetics?.dominantType || 'HYBRID',
        thc_target: data.qualityTargets?.thcTarget || 0,
        cbd_target: data.qualityTargets?.cbdTarget || 0,
        terpene_profile: data.qualityTargets?.terpeneTargets || {},
        flowering_time: data.genetics?.geneticMarkers?.floweringTime || 60,
        yield_potential: data.phenotype?.averageYield || 0,
        resistance_profile: data.phenotype?.resistanceTraits || {},
        spectral_preferences: {
          vegetative: data.spectralPreferences?.vegetativeSpectrum || {},
          flowering: data.spectralPreferences?.floweringSpectrum || {}
        },
        environmental_optimums: data.environmentalOptimums || {},
        cultivation_notes: data.cultivationHistory?.commonIssues || []
      }
    });

    return this.convertToProfile(profile);
  }

  async updateCultivarFromGrowCycle(
    cultivarId: string, 
    cycleData: GrowingCycleData,
    finalResults: {
      finalYield: number;
      thcActual: number;
      cbdActual: number;
      terpeneProfile: any;
      qualityScore: number;
      totalCycleTime: number;
    }
  ): Promise<void> {
    // Update cultivar profile based on completed grow cycle
    const existing = await prisma.cannabisStrainProfile.findUnique({
      where: { id: cultivarId }
    });

    if (!existing) throw new Error('Cultivar not found');

    // Calculate updated averages
    const totalCycles = (existing.cultivation_history as any)?.totalCycles || 0;
    const newTotalCycles = totalCycles + 1;
    
    const avgYield = ((existing.yield_potential * totalCycles) + finalResults.finalYield) / newTotalCycles;
    const avgQuality = (((existing.cultivation_history as any)?.averageQuality || 0) * totalCycles + finalResults.qualityScore) / newTotalCycles;

    await prisma.cannabisStrainProfile.update({
      where: { id: cultivarId },
      data: {
        yield_potential: avgYield,
        cultivation_history: {
          ...existing.cultivation_history as any,
          totalCycles: newTotalCycles,
          averageYieldActual: avgYield,
          averageQualityScore: avgQuality,
          lastUpdated: new Date(),
          recentResults: {
            yield: finalResults.finalYield,
            thc: finalResults.thcActual,
            cbd: finalResults.cbdActual,
            quality: finalResults.qualityScore,
            cycleTime: finalResults.totalCycleTime
          }
        }
      }
    });
  }

  async collectRealTimeGrowData(
    cycleId: string,
    sensorData: any,
    visionData?: any
  ): Promise<void> {
    // Automated data collection from sensors and vision systems
    const environmentalReading = {
      cycle_id: cycleId,
      timestamp: new Date(),
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      co2: sensorData.co2,
      vpd: this.calculateVPD(sensorData.temperature, sensorData.humidity),
      dli: sensorData.dli,
      ppfd: sensorData.ppfd,
      spectrum_data: sensorData.spectralData,
      plant_metrics: visionData ? {
        height: visionData.averageHeight,
        width: visionData.averageWidth,
        leafArea: visionData.leafAreaIndex,
        healthScore: visionData.healthScore
      } : null
    };

    // Store in time-series database
    await prisma.measurement.create({
      data: environmentalReading
    });

    // Check for automated interventions
    await this.checkAutomatedInterventions(cycleId, environmentalReading);
  }

  async getOptimalConditionsForCultivar(
    cultivarId: string,
    currentStage: string,
    currentConditions: any
  ): Promise<{
    recommendations: any;
    adjustmentPriority: string[];
    predictedImpact: number;
  }> {
    const cultivar = await prisma.cannabisStrainProfile.findUnique({
      where: { id: cultivarId }
    });

    if (!cultivar) throw new Error('Cultivar not found');

    const optimums = cultivar.environmental_optimums as any;
    const spectralPrefs = cultivar.spectral_preferences as any;

    // Generate recommendations based on cultivar preferences
    const recommendations = {
      environmental: {
        temperature: optimums.temperature?.[`${currentStage}Day`] || currentConditions.temperature,
        humidity: optimums.humidity?.[`${currentStage}`] || currentConditions.humidity,
        co2: optimums.co2?.[`${currentStage}Optimal`] || currentConditions.co2,
        vpd: optimums.vpd?.[`${currentStage}Optimal`] || currentConditions.vpd
      },
      spectral: spectralPrefs[currentStage] || spectralPrefs.vegetative,
      lighting: {
        dli: cultivar.spectral_preferences?.[`${currentStage}`]?.dli || 40,
        photoperiod: currentStage === 'flowering' ? 12 : 18
      }
    };

    // Calculate priority adjustments
    const adjustmentPriority = this.calculateAdjustmentPriority(
      currentConditions, 
      recommendations
    );

    // Predict impact of changes
    const predictedImpact = this.predictYieldImpact(
      cultivarId, 
      currentConditions, 
      recommendations
    );

    return {
      recommendations,
      adjustmentPriority,
      predictedImpact
    };
  }

  private calculateVPD(temperature: number, humidity: number): number {
    const svp = 610.7 * Math.exp((17.38 * temperature) / (temperature + 239));
    const avp = svp * (humidity / 100);
    return (svp - avp) / 1000; // kPa
  }

  private async checkAutomatedInterventions(
    cycleId: string, 
    reading: any
  ): Promise<void> {
    // Implement automated intervention logic
    const cycle = await prisma.experiment.findUnique({
      where: { id: cycleId }
    });

    if (!cycle) return;

    // Check for stress conditions and trigger interventions
    const interventions = [];

    // VPD stress
    if (reading.vpd < 0.5 || reading.vpd > 1.5) {
      interventions.push({
        type: 'environmental_adjustment',
        parameter: 'vpd',
        currentValue: reading.vpd,
        targetValue: 1.0,
        priority: 'high'
      });
    }

    // Light stress
    if (reading.ppfd > 1200) {
      interventions.push({
        type: 'light_adjustment',
        parameter: 'ppfd',
        currentValue: reading.ppfd,
        targetValue: 1000,
        priority: 'medium'
      });
    }

    // Execute interventions through actuator control
    for (const intervention of interventions) {
      await this.executeIntervention(cycleId, intervention);
    }
  }

  private async executeIntervention(cycleId: string, intervention: any): Promise<void> {
    // Log intervention
    await prisma.measurement.create({
      data: {
        experiment_id: cycleId,
        measurement_type: 'intervention',
        value: intervention.currentValue,
        target_value: intervention.targetValue,
        notes: `Automated ${intervention.type}: ${intervention.parameter}`,
        timestamp: new Date()
      }
    });

    // Execute through actuator control system
    // This would integrate with the autonomous-actuator-api.ts
  }

  private calculateAdjustmentPriority(
    current: any, 
    optimal: any
  ): string[] {
    const priorities = [];
    
    // Calculate deviations and prioritize
    const vpdDiff = Math.abs(current.vpd - optimal.environmental.vpd);
    const tempDiff = Math.abs(current.temperature - optimal.environmental.temperature);
    const co2Diff = Math.abs(current.co2 - optimal.environmental.co2);

    if (vpdDiff > 0.3) priorities.push('vpd');
    if (tempDiff > 2) priorities.push('temperature');
    if (co2Diff > 200) priorities.push('co2');

    return priorities.sort((a, b) => {
      const deviations = { vpd: vpdDiff, temperature: tempDiff, co2: co2Diff };
      return (deviations as any)[b] - (deviations as any)[a];
    });
  }

  private predictYieldImpact(
    cultivarId: string,
    current: any,
    optimal: any
  ): number {
    // Simple yield impact prediction
    // In production, this would use the ML regression models
    const vpdOptimality = 1 - Math.abs(current.vpd - optimal.environmental.vpd) / 2;
    const tempOptimality = 1 - Math.abs(current.temperature - optimal.environmental.temperature) / 10;
    const co2Optimality = Math.min(current.co2 / optimal.environmental.co2, 1);

    const overallOptimality = (vpdOptimality + tempOptimality + co2Optimality) / 3;
    
    // Return predicted yield multiplier
    return overallOptimality;
  }

  private convertToProfile(dbProfile: any): CultivarProfile {
    // Convert database model to CultivarProfile interface
    return {
      id: dbProfile.id,
      strainName: dbProfile.strain_name,
      genetics: {
        dominantType: dbProfile.strain_type,
        indicaPercentage: dbProfile.indica_percentage || 50,
        sativaPercentage: dbProfile.sativa_percentage || 50,
        parentLineage: dbProfile.parent_lineage || { parent1: '', parent2: '', generation: 1 },
        geneticMarkers: dbProfile.genetic_markers
      },
      phenotype: dbProfile.phenotype || {},
      spectralPreferences: dbProfile.spectral_preferences || {},
      environmentalOptimums: dbProfile.environmental_optimums || {},
      qualityTargets: {
        thcTarget: dbProfile.thc_target,
        cbdTarget: dbProfile.cbd_target,
        terpeneTargets: dbProfile.terpene_profile || {},
        yieldTarget: dbProfile.yield_potential
      },
      cultivationHistory: dbProfile.cultivation_history || {}
    } as CultivarProfile;
  }
}

export default CultivarDataCollectionService;