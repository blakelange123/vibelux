/**
 * Spectrum Safety Manager
 * Prevents harmful light conditions and cannabis plant stress
 */

interface SpectrumLimits {
  farRed: { min: number; max: number; warning: number };
  white: { min: number; max: number; warning: number };
  red: { min: number; max: number; warning: number };
  blue: { min: number; max: number; warning: number };
  uvb: { min: number; max: number; warning: number };
}

interface PlantStressIndicators {
  leafBleaching: boolean;
  internodeStretching: boolean;
  stunting: boolean;
  chlorosis: boolean;
  purpling: boolean;
  lightBurn: boolean;
}

interface SafetyWarning {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'spectrum' | 'intensity' | 'duration' | 'photoperiod';
  message: string;
  recommendation: string;
  spectrumChannel?: string;
}

export class SpectrumSafetyManager {
  private static cannabisLimits: SpectrumLimits = {
    // Far-red (700-800nm) - Critical for preventing excessive stretch
    farRed: {
      min: 0,
      max: 25, // Maximum 25% to prevent severe stretching
      warning: 15 // Warning at 15% for cannabis
    },
    
    // White light - Can cause tip burn and bleaching at high levels
    white: {
      min: 0,
      max: 70, // Maximum 70% white in spectrum
      warning: 60 // Warning at 60% for dense canopies
    },
    
    // Red (630-700nm) - Primary photosynthetic driver
    red: {
      min: 25,
      max: 85,
      warning: 80
    },
    
    // Blue (400-500nm) - Structure and terpene production
    blue: {
      min: 10,
      max: 40,
      warning: 35
    },
    
    // UV-B (280-315nm) - Trichome production but can damage at high levels
    uvb: {
      min: 0,
      max: 5, // Very low maximum for UV-B
      warning: 2
    }
  };

  /**
   * Validate spectrum safety for cannabis cultivation
   */
  static validateSpectrum(spectrum: {
    farRed?: number;
    white?: number;
    red?: number;
    blue?: number;
    uvb?: number;
  }, intensity: number, cropType: 'cannabis' | 'tomatoes' | 'lettuce' = 'cannabis'): SafetyWarning[] {
    const warnings: SafetyWarning[] = [];
    const limits = this.cannabisLimits; // Use cannabis limits as most restrictive

    // Check far-red levels - Critical for cannabis
    if (spectrum.farRed !== undefined) {
      if (spectrum.farRed > limits.farRed.max) {
        warnings.push({
          severity: 'critical',
          type: 'spectrum',
          spectrumChannel: 'farRed',
          message: `Far-red at ${spectrum.farRed}% exceeds maximum safe level of ${limits.farRed.max}%`,
          recommendation: 'Reduce far-red immediately to prevent severe internodal stretching, weak stems, and potential plant collapse. Cannabis plants are highly sensitive to far-red excess.'
        });
      } else if (spectrum.farRed > limits.farRed.warning) {
        warnings.push({
          severity: 'high',
          type: 'spectrum',
          spectrumChannel: 'farRed',
          message: `Far-red at ${spectrum.farRed}% approaching unsafe levels`,
          recommendation: 'Monitor plants closely for stretching, weak branch structure, and reduced flower density. Consider reducing far-red to below 12% for flowering cannabis.'
        });
      }
    }

    // Check white light levels - Can cause tip burn
    if (spectrum.white !== undefined) {
      if (spectrum.white > limits.white.max) {
        warnings.push({
          severity: 'critical',
          type: 'spectrum',
          spectrumChannel: 'white',
          message: `White light at ${spectrum.white}% exceeds safe maximum of ${limits.white.max}%`,
          recommendation: 'Reduce white light immediately to prevent leaf bleaching, tip burn, and cannabinoid degradation. High white levels can cause photoinhibition in cannabis.'
        });
      } else if (spectrum.white > limits.white.warning && intensity > 800) {
        warnings.push({
          severity: 'high',
          type: 'spectrum',
          spectrumChannel: 'white',
          message: `High white light (${spectrum.white}%) combined with high intensity (${intensity} PPFD) may cause stress`,
          recommendation: 'Monitor leaf tips for bleaching and reduce white percentage or overall intensity. Cannabis tips are highly sensitive to white light burn.'
        });
      }
    }

    // Check total light intensity with spectrum considerations
    if (intensity > 1200) {
      const spectrumRisk = this.calculateSpectrumRisk(spectrum);
      if (spectrumRisk > 0.7) {
        warnings.push({
          severity: 'critical',
          type: 'intensity',
          message: `Extremely high intensity (${intensity} PPFD) with risky spectrum combination`,
          recommendation: 'Immediately reduce intensity below 1000 PPFD and adjust spectrum. Risk of severe light burn, bleaching, and plant damage.'
        });
      }
    }

    // UV-B safety check
    if (spectrum.uvb && spectrum.uvb > limits.uvb.max) {
      warnings.push({
        severity: 'critical',
        type: 'spectrum',
        spectrumChannel: 'uvb',
        message: `UV-B at ${spectrum.uvb}% is dangerously high`,
        recommendation: 'Reduce UV-B immediately to below 2%. High UV-B can cause DNA damage, leaf necrosis, and severely reduced photosynthesis in cannabis.'
      });
    }

    return warnings;
  }

  /**
   * Check for plant stress indicators based on spectrum settings
   */
  static assessPlantStress(observations: {
    leafColor: 'normal' | 'pale' | 'yellow' | 'purple' | 'burnt';
    internodeLength: number; // cm
    leafSize: 'normal' | 'small' | 'large';
    tipCondition: 'normal' | 'brown' | 'bleached' | 'curled';
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  }): { stress: PlantStressIndicators; recommendations: string[] } {
    
    const stress: PlantStressIndicators = {
      leafBleaching: observations.leafColor === 'pale' || observations.tipCondition === 'bleached',
      internodeStretching: observations.internodeLength > 8, // >8cm indicates stretching
      stunting: observations.leafSize === 'small' && observations.overallHealth !== 'excellent',
      chlorosis: observations.leafColor === 'yellow',
      purpling: observations.leafColor === 'purple',
      lightBurn: observations.tipCondition === 'brown' || observations.tipCondition === 'burnt'
    };

    const recommendations: string[] = [];

    if (stress.leafBleaching) {
      recommendations.push('CRITICAL: Reduce white light and overall intensity immediately. Increase distance from canopy. Cannabis bleaching indicates severe light stress.');
    }

    if (stress.internodeStretching) {
      recommendations.push('HIGH: Reduce far-red percentage below 10%. Increase blue light to 20-25%. Add support structures for weak stems.');
    }

    if (stress.lightBurn) {
      recommendations.push('CRITICAL: Reduce intensity by 30-40% immediately. Check for proper ventilation and leaf surface temperature. Cannabis tip burn spreads rapidly.');
    }

    if (stress.stunting) {
      recommendations.push('MEDIUM: Check spectrum balance. May need more red light (660nm) and reduced UV exposure. Ensure adequate nutrition.');
    }

    if (stress.chlorosis && !stress.lightBurn) {
      recommendations.push('LOW: Increase blue light slightly. Check for nutrient deficiencies. May indicate insufficient light in lower canopy.');
    }

    if (stress.purpling && observations.overallHealth === 'good') {
      recommendations.push('INFO: Purple coloration may be normal genetic expression. Monitor for other stress signs.');
    }

    return { stress, recommendations };
  }

  /**
   * Generate safe spectrum recommendations for cannabis phases
   */
  static getRecommendedSpectrum(phase: 'seedling' | 'vegetative' | 'flowering' | 'late-flowering'): {
    spectrum: Record<string, number>;
    intensity: { min: number; max: number; optimal: number };
    warnings: string[];
  } {
    const spectrumRecommendations = {
      seedling: {
        spectrum: { blue: 25, red: 45, white: 25, farRed: 5, uvb: 0 },
        intensity: { min: 150, max: 400, optimal: 250 },
        warnings: ['Seedlings are extremely sensitive to light burn', 'Avoid UV-B completely', 'Monitor closely for stretching']
      },
      vegetative: {
        spectrum: { blue: 30, red: 40, white: 25, farRed: 5, uvb: 0 },
        intensity: { min: 400, max: 700, optimal: 550 },
        warnings: ['Higher blue promotes compact growth', 'Minimal far-red prevents stretching', 'Watch for tip burn above 600 PPFD']
      },
      flowering: {
        spectrum: { blue: 20, red: 55, white: 20, farRed: 5, uvb: 1 },
        intensity: { min: 600, max: 1000, optimal: 800 },
        warnings: ['Increased red drives flower development', 'Low UV-B boosts trichomes but monitor stress', 'High intensity increases burn risk']
      },
      'late-flowering': {
        spectrum: { blue: 15, red: 60, white: 15, farRed: 8, uvb: 2 },
        intensity: { min: 700, max: 1200, optimal: 900 },
        warnings: ['CRITICAL: Monitor tip burn daily', 'Slightly higher far-red aids final ripening', 'Reduce intensity if bleaching occurs']
      }
    };

    return spectrumRecommendations[phase];
  }

  /**
   * Calculate overall spectrum risk factor (0-1, higher = more risky)
   */
  private static calculateSpectrumRisk(spectrum: Record<string, number | undefined>): number {
    let risk = 0;

    // Far-red risk (high weight)
    if (spectrum.farRed) {
      risk += Math.max(0, (spectrum.farRed - 10) / 15) * 0.4;
    }

    // White light risk
    if (spectrum.white) {
      risk += Math.max(0, (spectrum.white - 50) / 30) * 0.3;
    }

    // UV-B risk (very high weight)
    if (spectrum.uvb) {
      risk += Math.max(0, (spectrum.uvb - 1) / 4) * 0.3;
    }

    return Math.min(1, risk);
  }

  /**
   * Generate daily safety report
   */
  static generateSafetyReport(roomData: {
    currentSpectrum: Record<string, number>;
    currentIntensity: number;
    plantObservations?: any;
    phase: string;
  }): {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    warnings: SafetyWarning[];
    recommendations: string[];
    safetyScore: number; // 0-100
  } {
    const warnings = this.validateSpectrum(roomData.currentSpectrum, roomData.currentIntensity);
    const risk = this.calculateSpectrumRisk(roomData.currentSpectrum);
    
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (risk > 0.8) overallRisk = 'critical';
    else if (risk > 0.6) overallRisk = 'high';
    else if (risk > 0.3) overallRisk = 'medium';

    const safetyScore = Math.max(0, 100 - (risk * 100));

    const recommendations = [
      'Monitor plants daily for signs of light stress',
      'Maintain leaf surface temperatures below 80°F (27°C)',
      'Ensure adequate airflow across canopy',
      'Keep detailed cultivation logs for optimization'
    ];

    return {
      overallRisk,
      warnings,
      recommendations,
      safetyScore
    };
  }
}

export default SpectrumSafetyManager;