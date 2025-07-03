import { EventEmitter } from 'events';

export interface CropSteeringProfile {
  id: string;
  name: string;
  description: string;
  cropType: 'cannabis' | 'tomatoes' | 'lettuce' | 'herbs' | 'custom';
  phases: SteeringPhase[];
  triggers: SteeringTrigger[];
  targets: EnvironmentalTargets;
  createdAt: Date;
  updatedAt: Date;
}

export interface SteeringPhase {
  id: string;
  name: string;
  duration: number; // days
  order: number;
  objectives: string[];
  environmentalTargets: {
    temperature: { day: Range; night: Range };
    humidity: { day: Range; night: Range };
    vpd: { day: Range; night: Range };
    co2: { day: number; night: number };
    ppfd: { peak: number; photoperiod: number };
    irrigation: {
      frequency: string;
      volumePerEvent: number;
      ecTarget: number;
      phTarget: number;
      drybackTarget: number; // percentage
      runoffTarget: number; // percentage
    };
  };
  transitions: {
    toGenerative?: SteeringStrategy;
    toVegetative?: SteeringStrategy;
  };
}

export interface SteeringTrigger {
  id: string;
  type: 'time' | 'sensor' | 'manual' | 'morphology';
  condition: string;
  action: 'shift-generative' | 'shift-vegetative' | 'maintain' | 'custom';
  parameters: Record<string, any>;
}

export interface SteeringStrategy {
  name: string;
  description: string;
  adjustments: {
    temperature?: { dayShift: number; nightShift: number };
    humidity?: { dayShift: number; nightShift: number };
    irrigation?: {
      frequencyChange: number; // percentage
      volumeChange: number; // percentage
      firstIrrigationDelay: number; // minutes after lights on
      lastIrrigationAdvance: number; // minutes before lights off
    };
    lighting?: {
      intensityChange: number; // percentage
      photoperiodChange: number; // hours
      spectrumShift?: Record<string, number>;
    };
    nutrients?: {
      ecChange: number;
      ratioAdjustments: Record<string, number>;
    };
  };
  duration: number; // days to apply
  monitoring: string[];
}

interface Range {
  min: number;
  max: number;
  optimal: number;
}

interface EnvironmentalTargets {
  waterContentRange: Range;
  ecRange: Range;
  phRange: Range;
  rootZoneTemp: Range;
}

interface SteeringMetrics {
  currentPhase: string;
  steeringDirection: 'generative' | 'vegetative' | 'balanced';
  steeringIntensity: number; // 0-100
  environmentalStress: number; // 0-100
  waterStress: number; // 0-100
  nutrientStress: number; // 0-100
  morphologyIndex: number; // -100 (vegetative) to +100 (generative)
}

export class CropSteeringEngine extends EventEmitter {
  private profiles: Map<string, CropSteeringProfile> = new Map();
  private activeProfiles: Map<string, { profile: CropSteeringProfile; startDate: Date; currentPhase: number }> = new Map();
  private sensorData: Map<string, any> = new Map();
  private metrics: Map<string, SteeringMetrics> = new Map();

  constructor() {
    super();
    this.initializeDefaultProfiles();
  }

  // Profile Management
  public createProfile(profile: Omit<CropSteeringProfile, 'id' | 'createdAt' | 'updatedAt'>): CropSteeringProfile {
    const newProfile: CropSteeringProfile = {
      ...profile,
      id: `CSP-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.profiles.set(newProfile.id, newProfile);
    this.emit('profileCreated', newProfile);
    return newProfile;
  }

  public activateProfile(roomId: string, profileId: string): void {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error('Profile not found');

    this.activeProfiles.set(roomId, {
      profile,
      startDate: new Date(),
      currentPhase: 0
    });

    this.initializeMetrics(roomId);
    this.emit('profileActivated', { roomId, profile });
  }

  // Real-time Steering
  public updateSensorData(roomId: string, data: {
    temperature: number;
    humidity: number;
    co2: number;
    ppfd: number;
    waterContent?: number;
    ec?: number;
    ph?: number;
  }): void {
    this.sensorData.set(roomId, {
      ...this.sensorData.get(roomId),
      ...data,
      timestamp: new Date()
    });

    this.evaluateSteering(roomId);
  }

  private evaluateSteering(roomId: string): void {
    const active = this.activeProfiles.get(roomId);
    if (!active) return;

    const currentData = this.sensorData.get(roomId);
    if (!currentData) return;

    const phase = active.profile.phases[active.currentPhase];
    const metrics = this.calculateMetrics(currentData, phase);

    this.metrics.set(roomId, metrics);

    // Check triggers
    for (const trigger of active.profile.triggers) {
      if (this.evaluateTrigger(trigger, currentData, metrics)) {
        this.executeTriggerAction(roomId, trigger, phase);
      }
    }

    this.emit('metricsUpdated', { roomId, metrics });
  }

  private calculateMetrics(data: any, phase: SteeringPhase): SteeringMetrics {
    // Calculate VPD
    const vpd = this.calculateVPD(data.temperature, data.humidity);
    
    // Determine steering direction based on environmental conditions
    let morphologyIndex = 0;
    
    // Temperature differential (DIF) - positive DIF = vegetative
    const isDaytime = new Date().getHours() >= 6 && new Date().getHours() <= 18;
    const tempTarget = isDaytime ? phase.environmentalTargets.temperature.day : phase.environmentalTargets.temperature.night;
    const tempDeviation = data.temperature - tempTarget.optimal;
    morphologyIndex += tempDeviation * 2; // Weight temperature heavily

    // VPD - higher VPD = generative
    const vpdTarget = isDaytime ? phase.environmentalTargets.vpd.day : phase.environmentalTargets.vpd.night;
    const vpdDeviation = vpd - vpdTarget.optimal;
    morphologyIndex += vpdDeviation * 10;

    // Water content - lower = generative
    if (data.waterContent) {
      const wcDeviation = data.waterContent - 65; // 65% as baseline
      morphologyIndex -= wcDeviation * 2;
    }

    // EC - higher = generative
    if (data.ec) {
      const ecDeviation = data.ec - phase.environmentalTargets.irrigation.ecTarget;
      morphologyIndex += ecDeviation * 5;
    }

    // Clamp morphology index
    morphologyIndex = Math.max(-100, Math.min(100, morphologyIndex));

    return {
      currentPhase: phase.name,
      steeringDirection: morphologyIndex > 20 ? 'generative' : morphologyIndex < -20 ? 'vegetative' : 'balanced',
      steeringIntensity: Math.abs(morphologyIndex),
      environmentalStress: this.calculateStress(data, phase.environmentalTargets),
      waterStress: data.waterContent ? Math.abs(data.waterContent - 65) / 35 * 100 : 0,
      nutrientStress: data.ec ? Math.abs(data.ec - phase.environmentalTargets.irrigation.ecTarget) / phase.environmentalTargets.irrigation.ecTarget * 100 : 0,
      morphologyIndex
    };
  }

  private calculateVPD(temp: number, rh: number): number {
    // Convert to Celsius for calculation
    const tempC = (temp - 32) * 5/9;
    const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
    const avp = svp * (rh / 100);
    return svp - avp;
  }

  private calculateStress(data: any, targets: any): number {
    let stressScore = 0;
    let factorCount = 0;

    // Temperature stress
    const tempTarget = targets.temperature.day;
    if (data.temperature < tempTarget.min || data.temperature > tempTarget.max) {
      stressScore += Math.abs(data.temperature - tempTarget.optimal) / 10 * 100;
      factorCount++;
    }

    // Add other stress factors...
    
    return factorCount > 0 ? stressScore / factorCount : 0;
  }

  private evaluateTrigger(trigger: SteeringTrigger, data: any, metrics: SteeringMetrics): boolean {
    switch (trigger.type) {
      case 'sensor':
        return eval(trigger.condition.replace(/\${(\w+)}/g, (_, key) => data[key] || metrics[key]));
      case 'morphology':
        return eval(trigger.condition.replace(/\${(\w+)}/g, (_, key) => metrics[key]));
      default:
        return false;
    }
  }

  private executeTriggerAction(roomId: string, trigger: SteeringTrigger, phase: SteeringPhase): void {
    let strategy: SteeringStrategy | undefined;

    switch (trigger.action) {
      case 'shift-generative':
        strategy = phase.transitions.toGenerative;
        break;
      case 'shift-vegetative':
        strategy = phase.transitions.toVegetative;
        break;
    }

    if (strategy) {
      this.applySteeringStrategy(roomId, strategy);
    }
  }

  private applySteeringStrategy(roomId: string, strategy: SteeringStrategy): void {
    // Safety validation before applying strategy
    const safetyWarnings = this.validateStrategySafety(strategy);
    if (safetyWarnings.length > 0) {
      this.emit('safetyWarning', {
        roomId,
        warnings: safetyWarnings,
        strategy: strategy.name
      });
      
      // Block critical safety violations
      const criticalWarnings = safetyWarnings.filter(w => w.severity === 'critical');
      if (criticalWarnings.length > 0) {
        console.error('CRITICAL SAFETY VIOLATION: Strategy blocked', criticalWarnings);
        return;
      }
    }

    const recommendations = {
      roomId,
      strategy: strategy.name,
      adjustments: strategy.adjustments,
      duration: strategy.duration,
      timestamp: new Date(),
      safetyWarnings
    };

    this.emit('steeringRecommendation', recommendations);
  }

  private validateStrategySafety(strategy: SteeringStrategy): Array<{severity: string, message: string, channel?: string}> {
    const warnings = [];
    
    if (strategy.adjustments.lighting?.spectrumShift) {
      const spectrum = strategy.adjustments.lighting.spectrumShift;
      
      // Far-red safety check
      if (spectrum.farRed && spectrum.farRed > 15) {
        warnings.push({
          severity: spectrum.farRed > 25 ? 'critical' : 'high',
          message: `Far-red at ${spectrum.farRed}% ${spectrum.farRed > 25 ? 'EXCEEDS SAFE MAXIMUM' : 'approaching unsafe levels'}. Risk of severe stretching and structural damage.`,
          channel: 'farRed'
        });
      }
      
      // White light safety check  
      if (spectrum.white && spectrum.white > 60) {
        warnings.push({
          severity: spectrum.white > 70 ? 'critical' : 'high',
          message: `White light at ${spectrum.white}% ${spectrum.white > 70 ? 'EXCEEDS SAFE MAXIMUM' : 'may cause tip burn'}. Monitor for bleaching and reduce if stress observed.`,
          channel: 'white'
        });
      }
      
      // UV-B safety check
      if (spectrum.uvb && spectrum.uvb > 2) {
        warnings.push({
          severity: spectrum.uvb > 5 ? 'critical' : 'high',
          message: `UV-B at ${spectrum.uvb}% ${spectrum.uvb > 5 ? 'DANGEROUSLY HIGH' : 'elevated'}. Risk of DNA damage and leaf necrosis.`,
          channel: 'uvb'
        });
      }
    }
    
    // Intensity safety check
    if (strategy.adjustments.lighting?.intensityChange) {
      const intensityChange = strategy.adjustments.lighting.intensityChange;
      if (intensityChange > 20) {
        warnings.push({
          severity: intensityChange > 50 ? 'critical' : 'medium',
          message: `Intensity increase of ${intensityChange}% ${intensityChange > 50 ? 'EXTREMELY HIGH' : 'significant'}. Monitor closely for light burn.`
        });
      }
    }
    
    return warnings;
  }

  // Morphology Tracking
  public recordMorphology(roomId: string, observations: {
    internodeLength: number;
    leafSize: number;
    stemThickness: number;
    plantHeight: number;
    flowerDevelopment?: number; // 0-100
  }): void {
    const metrics = this.metrics.get(roomId);
    if (!metrics) return;

    // Calculate morphology index from physical observations
    let morphologyIndex = 0;
    
    // Shorter internodes = generative
    morphologyIndex += (3 - observations.internodeLength) * 10; // 3cm as baseline
    
    // Smaller leaves = generative
    morphologyIndex += (15 - observations.leafSize) * 2; // 15cm as baseline
    
    // Thicker stems = vegetative
    morphologyIndex -= (observations.stemThickness - 1) * 20; // 1cm as baseline
    
    // Flower development strongly indicates generative
    if (observations.flowerDevelopment) {
      morphologyIndex += observations.flowerDevelopment * 0.5;
    }

    metrics.morphologyIndex = Math.max(-100, Math.min(100, morphologyIndex));
    this.emit('morphologyUpdated', { roomId, observations, morphologyIndex });
  }

  // Reporting
  public getSteeringReport(roomId: string): {
    profile: CropSteeringProfile | null;
    metrics: SteeringMetrics | null;
    recommendations: any[];
    history: any[];
  } {
    const active = this.activeProfiles.get(roomId);
    const metrics = this.metrics.get(roomId);

    return {
      profile: active?.profile || null,
      metrics: metrics || null,
      recommendations: [], // Would fetch from history
      history: [] // Would fetch from database
    };
  }

  private initializeMetrics(roomId: string): void {
    this.metrics.set(roomId, {
      currentPhase: 'Initializing',
      steeringDirection: 'balanced',
      steeringIntensity: 0,
      environmentalStress: 0,
      waterStress: 0,
      nutrientStress: 0,
      morphologyIndex: 0
    });
  }

  private initializeDefaultProfiles(): void {
    // Cannabis Flowering Profile
    this.createProfile({
      name: 'Cannabis Flowering - Balanced',
      description: 'Balanced generative/vegetative steering for cannabis flowering',
      cropType: 'cannabis',
      phases: [
        {
          id: 'transition',
          name: 'Transition (Week 1-2)',
          duration: 14,
          order: 1,
          objectives: ['Initiate flowering', 'Maintain stretch control'],
          environmentalTargets: {
            temperature: { 
              day: { min: 75, max: 82, optimal: 78 },
              night: { min: 65, max: 72, optimal: 68 }
            },
            humidity: {
              day: { min: 45, max: 65, optimal: 55 },
              night: { min: 45, max: 65, optimal: 55 }
            },
            vpd: {
              day: { min: 0.8, max: 1.2, optimal: 1.0 },
              night: { min: 0.6, max: 1.0, optimal: 0.8 }
            },
            co2: { day: 1000, night: 400 },
            ppfd: { peak: 800, photoperiod: 12 },
            irrigation: {
              frequency: '4-6 times/day',
              volumePerEvent: 100,
              ecTarget: 2.0,
              phTarget: 6.0,
              drybackTarget: 15,
              runoffTarget: 20
            }
          },
          transitions: {
            toGenerative: {
              name: 'Push Generative',
              description: 'Increase stress to promote flowering',
              adjustments: {
                temperature: { dayShift: 2, nightShift: -2 },
                humidity: { dayShift: -5, nightShift: -5 },
                irrigation: {
                  frequencyChange: -20,
                  volumeChange: -10,
                  firstIrrigationDelay: 120,
                  lastIrrigationAdvance: 120
                }
              },
              duration: 3,
              monitoring: ['flower-sites', 'stretch-rate']
            },
            toVegetative: {
              name: 'Push Vegetative',
              description: 'Reduce stress to promote growth',
              adjustments: {
                temperature: { dayShift: -2, nightShift: 2 },
                humidity: { dayShift: 5, nightShift: 5 },
                irrigation: {
                  frequencyChange: 20,
                  volumeChange: 10,
                  firstIrrigationDelay: -30,
                  lastIrrigationAdvance: -30
                }
              },
              duration: 3,
              monitoring: ['plant-height', 'leaf-size']
            }
          }
        }
      ],
      triggers: [
        {
          id: 'high-stress',
          type: 'sensor',
          condition: '${environmentalStress} > 70',
          action: 'shift-vegetative',
          parameters: { priority: 'high' }
        },
        {
          id: 'low-morphology',
          type: 'morphology',
          condition: '${morphologyIndex} < -50',
          action: 'shift-generative',
          parameters: { priority: 'medium' }
        }
      ],
      targets: {
        waterContentRange: { min: 45, max: 75, optimal: 65 },
        ecRange: { min: 1.5, max: 3.5, optimal: 2.5 },
        phRange: { min: 5.5, max: 6.5, optimal: 6.0 },
        rootZoneTemp: { min: 65, max: 75, optimal: 70 }
      }
    });

    // Tomato Production Profile
    this.createProfile({
      name: 'Tomato Production - High Yield',
      description: 'Optimized for maximum fruit production',
      cropType: 'tomatoes',
      phases: [
        {
          id: 'vegetative',
          name: 'Vegetative Growth',
          duration: 28,
          order: 1,
          objectives: ['Establish strong root system', 'Build plant structure'],
          environmentalTargets: {
            temperature: {
              day: { min: 72, max: 79, optimal: 75 },
              night: { min: 62, max: 68, optimal: 65 }
            },
            humidity: {
              day: { min: 60, max: 80, optimal: 70 },
              night: { min: 60, max: 80, optimal: 70 }
            },
            vpd: {
              day: { min: 0.5, max: 0.9, optimal: 0.7 },
              night: { min: 0.4, max: 0.7, optimal: 0.5 }
            },
            co2: { day: 800, night: 400 },
            ppfd: { peak: 600, photoperiod: 16 },
            irrigation: {
              frequency: '8-12 times/day',
              volumePerEvent: 80,
              ecTarget: 2.5,
              phTarget: 5.8,
              drybackTarget: 10,
              runoffTarget: 30
            }
          },
          transitions: {
            toGenerative: {
              name: 'Fruit Initiation',
              description: 'Trigger fruit development',
              adjustments: {
                temperature: { dayShift: 3, nightShift: -3 },
                lighting: { photoperiodChange: -2, intensityChange: 20 }
              },
              duration: 7,
              monitoring: ['flower-clusters', 'fruit-set']
            }
          }
        }
      ],
      triggers: [],
      targets: {
        waterContentRange: { min: 50, max: 80, optimal: 70 },
        ecRange: { min: 2.0, max: 4.0, optimal: 3.0 },
        phRange: { min: 5.5, max: 6.2, optimal: 5.8 },
        rootZoneTemp: { min: 65, max: 72, optimal: 68 }
      }
    });
  }
}