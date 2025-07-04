// Vertical Farming Optimization Engine
// Applies AI-generated optimizations to farm systems

export interface FarmConfiguration {
  lighting: {
    intensity: number; // PPFD
    photoperiod: number; // hours
    spectrum: {
      red: number;
      blue: number;
      farRed: number;
      white: number;
    };
  };
  environment: {
    temperature: number; // °C
    humidity: number; // %
    co2: number; // ppm
    airflow: number; // m/s
  };
  irrigation: {
    frequency: number; // times per day
    duration: number; // minutes
    ec: number; // mS/cm
    ph: number;
  };
  racking: {
    tiers: number;
    spacing: number; // cm between tiers
    depth: number; // cm
  };
}

export interface OptimizationChange {
  system: string;
  parameter: string;
  currentValue: any;
  newValue: any;
  impact: string;
}

export class OptimizationEngine {
  private currentConfig: FarmConfiguration;
  private appliedChanges: OptimizationChange[] = [];

  constructor(initialConfig: FarmConfiguration) {
    this.currentConfig = { ...initialConfig };
  }

  // Apply light intensity optimization
  applyLightOptimization(targetPPFD: number): OptimizationChange {
    const change: OptimizationChange = {
      system: 'lighting',
      parameter: 'intensity',
      currentValue: this.currentConfig.lighting.intensity,
      newValue: targetPPFD,
      impact: `${Math.round(((targetPPFD - this.currentConfig.lighting.intensity) / this.currentConfig.lighting.intensity) * 100)}% change`
    };

    this.currentConfig.lighting.intensity = targetPPFD;
    this.appliedChanges.push(change);
    return change;
  }

  // Apply spectrum optimization
  applySpectrumOptimization(redFarRedRatio: number): OptimizationChange {
    const currentRatio = this.currentConfig.lighting.spectrum.red / this.currentConfig.lighting.spectrum.farRed;
    
    // Adjust spectrum to achieve target ratio
    const newSpectrum = {
      ...this.currentConfig.lighting.spectrum,
      red: 45,
      farRed: 45 / redFarRedRatio,
      blue: 25,
      white: 30 - (45 / redFarRedRatio - 10) // Adjust white to maintain total
    };

    const change: OptimizationChange = {
      system: 'lighting',
      parameter: 'spectrum',
      currentValue: currentRatio,
      newValue: redFarRedRatio,
      impact: 'Optimized red:far-red ratio for flowering'
    };

    this.currentConfig.lighting.spectrum = newSpectrum;
    this.appliedChanges.push(change);
    return change;
  }

  // Apply photoperiod optimization
  applyPhotoperiodOptimization(vegetativeHours: number, floweringHours: number, currentStage: 'vegetative' | 'flowering'): OptimizationChange {
    const targetHours = currentStage === 'vegetative' ? vegetativeHours : floweringHours;
    
    const change: OptimizationChange = {
      system: 'lighting',
      parameter: 'photoperiod',
      currentValue: this.currentConfig.lighting.photoperiod,
      newValue: targetHours,
      impact: `${currentStage} stage photoperiod`
    };

    this.currentConfig.lighting.photoperiod = targetHours;
    this.appliedChanges.push(change);
    return change;
  }

  // Apply CO2 optimization
  applyCO2Optimization(targetPPM: number): OptimizationChange {
    const change: OptimizationChange = {
      system: 'environment',
      parameter: 'co2',
      currentValue: this.currentConfig.environment.co2,
      newValue: targetPPM,
      impact: `${Math.round(((targetPPM - this.currentConfig.environment.co2) / this.currentConfig.environment.co2) * 100)}% increase`
    };

    this.currentConfig.environment.co2 = targetPPM;
    this.appliedChanges.push(change);
    return change;
  }

  // Apply rack spacing optimization
  applyRackOptimization(spacingReduction: number): OptimizationChange {
    const newSpacing = this.currentConfig.racking.spacing - spacingReduction;
    const additionalTiers = Math.floor(spacingReduction * this.currentConfig.racking.tiers / this.currentConfig.racking.spacing);
    
    const change: OptimizationChange = {
      system: 'racking',
      parameter: 'configuration',
      currentValue: `${this.currentConfig.racking.tiers} tiers @ ${this.currentConfig.racking.spacing}cm`,
      newValue: `${this.currentConfig.racking.tiers + additionalTiers} tiers @ ${newSpacing}cm`,
      impact: `+${additionalTiers} growing tiers`
    };

    this.currentConfig.racking.spacing = newSpacing;
    this.currentConfig.racking.tiers += additionalTiers;
    this.appliedChanges.push(change);
    return change;
  }

  // Apply fertigation optimization
  applyFertigationOptimization(ecTarget: number, phTarget: number): OptimizationChange {
    const change: OptimizationChange = {
      system: 'irrigation',
      parameter: 'nutrient_solution',
      currentValue: `EC: ${this.currentConfig.irrigation.ec}, pH: ${this.currentConfig.irrigation.ph}`,
      newValue: `EC: ${ecTarget}, pH: ${phTarget}`,
      impact: 'Optimized for current growth stage'
    };

    this.currentConfig.irrigation.ec = ecTarget;
    this.currentConfig.irrigation.ph = phTarget;
    this.appliedChanges.push(change);
    return change;
  }

  // Get all applied changes
  getAppliedChanges(): OptimizationChange[] {
    return [...this.appliedChanges];
  }

  // Get current configuration
  getCurrentConfig(): FarmConfiguration {
    return { ...this.currentConfig };
  }

  // Calculate estimated improvements
  calculateImprovements() {
    return {
      yieldIncrease: this.appliedChanges.length * 5, // Rough estimate: 5% per optimization
      energySavings: this.appliedChanges.filter(c => c.system === 'lighting').length * 8,
      spaceUtilization: this.appliedChanges.filter(c => c.system === 'racking').length * 15,
      cycleTimeReduction: Math.min(this.appliedChanges.length * 2, 10)
    };
  }

  // Generate control system commands
  generateControlCommands(): string[] {
    const commands: string[] = [];
    
    this.appliedChanges.forEach(change => {
      switch (change.system) {
        case 'lighting':
          if (change.parameter === 'intensity') {
            commands.push(`SET_LIGHT_INTENSITY:${change.newValue}`);
          } else if (change.parameter === 'photoperiod') {
            commands.push(`SET_PHOTOPERIOD:${change.newValue}`);
          } else if (change.parameter === 'spectrum') {
            commands.push(`SET_SPECTRUM:RED=${this.currentConfig.lighting.spectrum.red},BLUE=${this.currentConfig.lighting.spectrum.blue}`);
          }
          break;
        case 'environment':
          if (change.parameter === 'co2') {
            commands.push(`SET_CO2_TARGET:${change.newValue}`);
          }
          break;
        case 'irrigation':
          if (change.parameter === 'nutrient_solution') {
            commands.push(`SET_EC:${this.currentConfig.irrigation.ec}`);
            commands.push(`SET_PH:${this.currentConfig.irrigation.ph}`);
          }
          break;
      }
    });
    
    return commands;
  }
}