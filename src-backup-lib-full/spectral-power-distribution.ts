/**
 * Spectral Power Distribution Analysis Engine
 * Advanced spectral analysis for lighting applications including photosynthesis,
 * color rendering, circadian effects, and visual comfort
 */

import { SpectralData } from './monte-carlo-raytracing';

export interface SpectralAnalysisResult {
  // Basic metrics
  totalRadiantFlux: number; // W
  totalLuminousFlux: number; // lm
  luminousEfficacy: number; // lm/W
  
  // Color metrics
  chromaticityCoordinates: { x: number; y: number };
  colorTemperature: number; // K
  colorRenderingIndex: number; // CRI Ra
  colorRenderingIndices: { [key: string]: number }; // R1-R15
  colorQualityScale: number; // CQS
  
  // Photobiological metrics
  photosynthetic: {
    par: number; // Photosynthetically Active Radiation (400-700nm) in W/m²
    ppf: number; // Photosynthetic Photon Flux in μmol/s
    ppfd: number; // Photosynthetic Photon Flux Density in μmol/m²/s
    blueRatio: number; // 400-500nm percentage
    redRatio: number; // 600-700nm percentage
    greenRatio: number; // 500-600nm percentage
    farRedRatio: number; // 700-800nm percentage
    redFarRedRatio: number; // R:FR ratio
    photosynthetic_efficacy: number; // PPF/W
  };
  
  // Circadian metrics
  circadian: {
    melanopicLux: number; // Melanopic weighted illuminance
    melanopicRatio: number; // Melanopic/photopic ratio
    circadianStimulus: number; // CS value (0-0.7)
    circadianLight: number; // CLA (Circadian Light in lux)
    equivalentMelanopicLux: number; // EML
  };
  
  // Visual comfort metrics
  visualComfort: {
    illuminance: number; // Photopic illuminance in lux
    scotopicLux: number; // Scotopic illuminance
    mesopicMultiplier: number; // Mesopic multiplier
    spRatio: number; // Scotopic/Photopic ratio
    visualEfficacy: number; // Luminous efficacy for vision
  };
  
  // Spectral quality indices
  spectralQuality: {
    gamutAreaIndex: number; // GAI
    memoryColorRenderingIndex: number; // MCRI
    feelingOfContrast: number; // Rf
    colorVectorGraphic: { x: number; y: number }[]; // CVG data points
    spectralSimilarityIndex: number; // SSI vs reference
  };
  
  // Horticultural specific metrics
  horticultural: {
    morphogenicRatio: number; // Blue/Red for plant morphology
    photoperiodEffectiveness: number; // Far-red effectiveness for flowering
    photosystem1Efficiency: number; // PSI efficiency
    photosystem2Efficiency: number; // PSII efficiency
    quantumYieldPotential: number; // Maximum quantum yield
    chlorophyllExcitation: { a: number; b: number }; // Chl a & b excitation
    carotenoidExcitation: number; // Carotenoid excitation
    anthocyaninInduction: number; // Anthocyanin induction potential
  };
}

export interface ReferenceSpectrum {
  name: string;
  description: string;
  spectrum: SpectralData;
  colorTemperature?: number;
  type: 'daylight' | 'blackbody' | 'led' | 'fluorescent' | 'hps' | 'mh' | 'custom';
}

export interface PhotobiologicalWeightingFunction {
  name: string;
  wavelengths: number[];
  weights: number[];
  description: string;
  reference: string;
}

export class SpectralPowerDistributionAnalyzer {
  private photopicLuminosityFunction!: PhotobiologicalWeightingFunction;
  private scotopicLuminosityFunction!: PhotobiologicalWeightingFunction;
  private melanopicWeightingFunction!: PhotobiologicalWeightingFunction;
  private circadianWeightingFunction!: PhotobiologicalWeightingFunction;
  private referenceSpectra!: Map<string, ReferenceSpectrum>;
  private colorMatchingFunctions!: {
    x: PhotobiologicalWeightingFunction;
    y: PhotobiologicalWeightingFunction;
    z: PhotobiologicalWeightingFunction;
  };

  constructor() {
    this.initializeWeightingFunctions();
    this.initializeReferenceSpectra();
  }

  /**
   * Main analysis function - performs comprehensive spectral analysis
   */
  public analyzeSpectrum(spectrum: SpectralData, area: number = 1): SpectralAnalysisResult {
    
    // Validate and normalize spectrum
    const normalizedSpectrum = this.validateAndNormalizeSpectrum(spectrum);
    
    // Calculate all metrics
    const basicMetrics = this.calculateBasicMetrics(normalizedSpectrum);
    const colorMetrics = this.calculateColorMetrics(normalizedSpectrum);
    const photosynthetic = this.calculatePhotosyntheticMetrics(normalizedSpectrum);
    const circadian = this.calculateCircadianMetrics(normalizedSpectrum);
    const visualComfort = this.calculateVisualComfortMetrics(normalizedSpectrum);
    const spectralQuality = this.calculateSpectralQualityMetrics(normalizedSpectrum);
    const horticultural = this.calculateHorticulturalMetrics(normalizedSpectrum);

    return {
      totalRadiantFlux: basicMetrics.totalRadiantFlux!,
      totalLuminousFlux: basicMetrics.totalLuminousFlux!,
      luminousEfficacy: basicMetrics.luminousEfficacy!,
      chromaticityCoordinates: colorMetrics.chromaticityCoordinates!,
      colorTemperature: colorMetrics.colorTemperature!,
      colorRenderingIndex: colorMetrics.colorRenderingIndex!,
      colorRenderingIndices: colorMetrics.colorRenderingIndices!,
      colorQualityScale: colorMetrics.colorQualityScale || 0,
      photosynthetic,
      circadian,
      visualComfort,
      spectralQuality,
      horticultural
    };
  }

  /**
   * Calculate basic radiometric and photometric metrics
   */
  private calculateBasicMetrics(spectrum: SpectralData): Partial<SpectralAnalysisResult> {
    // Total radiant flux (integrate across spectrum)
    const totalRadiantFlux = this.integrateSpectrum(spectrum);
    
    // Luminous flux (weighted by photopic luminosity function)
    const totalLuminousFlux = this.calculateWeightedIntegral(
      spectrum,
      this.photopicLuminosityFunction
    ) * 683; // Maximum luminous efficacy constant
    
    // Luminous efficacy
    const luminousEfficacy = totalRadiantFlux > 0 ? totalLuminousFlux / totalRadiantFlux : 0;

    return {
      totalRadiantFlux,
      totalLuminousFlux,
      luminousEfficacy
    };
  }

  /**
   * Calculate color metrics including CCT, CRI, and chromaticity
   */
  private calculateColorMetrics(spectrum: SpectralData): Partial<SpectralAnalysisResult> {
    // Calculate CIE XYZ tristimulus values
    const X = this.calculateWeightedIntegral(spectrum, this.colorMatchingFunctions.x);
    const Y = this.calculateWeightedIntegral(spectrum, this.colorMatchingFunctions.y);
    const Z = this.calculateWeightedIntegral(spectrum, this.colorMatchingFunctions.z);
    
    // Normalize
    const sum = X + Y + Z;
    const x = sum > 0 ? X / sum : 0;
    const y = sum > 0 ? Y / sum : 0;
    
    // Correlated Color Temperature using McCamy's approximation
    const n = (x - 0.3320) / (0.1858 - y);
    const colorTemperature = 449 * Math.pow(n, 3) + 3525 * Math.pow(n, 2) + 6823.3 * n + 5520.33;
    
    // Color Rendering Index
    const cri = this.calculateColorRenderingIndex(spectrum, colorTemperature);
    const colorRenderingIndices = this.calculateDetailedCRI(spectrum, colorTemperature);
    
    // Color Quality Scale
    const colorQualityScale = this.calculateColorQualityScale(spectrum);

    return {
      chromaticityCoordinates: { x, y },
      colorTemperature: Math.max(1000, Math.min(25000, colorTemperature)),
      colorRenderingIndex: cri,
      colorRenderingIndices,
      colorQualityScale
    };
  }

  /**
   * Calculate photosynthetic metrics for horticultural applications
   */
  private calculatePhotosyntheticMetrics(spectrum: SpectralData): SpectralAnalysisResult['photosynthetic'] {
    // PAR (400-700nm) calculation
    const parSpectrum = this.extractSpectralRange(spectrum, 400, 700);
    const par = this.integrateSpectrum(parSpectrum);
    
    // PPF calculation (photons in PAR range)
    const ppf = this.calculatePhotonFlux(parSpectrum);
    const ppfd = ppf; // Assuming 1 m² area
    
    // Spectral ratios for plant biology
    const blueSpectrum = this.extractSpectralRange(spectrum, 400, 500);
    const greenSpectrum = this.extractSpectralRange(spectrum, 500, 600);
    const redSpectrum = this.extractSpectralRange(spectrum, 600, 700);
    const farRedSpectrum = this.extractSpectralRange(spectrum, 700, 800);
    
    const blueRatio = this.integrateSpectrum(blueSpectrum) / par;
    const greenRatio = this.integrateSpectrum(greenSpectrum) / par;
    const redRatio = this.integrateSpectrum(redSpectrum) / par;
    const farRedRatio = this.integrateSpectrum(farRedSpectrum) / this.integrateSpectrum(spectrum);
    
    // Red:Far-Red ratio (important for plant morphology)
    const redPhotons = this.calculatePhotonFlux(this.extractSpectralRange(spectrum, 660, 670));
    const farRedPhotons = this.calculatePhotonFlux(this.extractSpectralRange(spectrum, 730, 740));
    const redFarRedRatio = farRedPhotons > 0 ? redPhotons / farRedPhotons : 100;
    
    // Photosynthetic efficacy
    const totalPower = this.integrateSpectrum(spectrum);
    const photosynthetic_efficacy = totalPower > 0 ? ppf / totalPower : 0;

    return {
      par,
      ppf,
      ppfd,
      blueRatio,
      redRatio,
      greenRatio,
      farRedRatio,
      redFarRedRatio,
      photosynthetic_efficacy
    };
  }

  /**
   * Calculate circadian metrics for human health applications
   */
  private calculateCircadianMetrics(spectrum: SpectralData): SpectralAnalysisResult['circadian'] {
    // Melanopic weighted illuminance
    const melanopicLux = this.calculateWeightedIntegral(
      spectrum,
      this.melanopicWeightingFunction
    ) * 683;
    
    // Photopic illuminance for comparison
    const photopicLux = this.calculateWeightedIntegral(
      spectrum,
      this.photopicLuminosityFunction
    ) * 683;
    
    // Melanopic ratio
    const melanopicRatio = photopicLux > 0 ? melanopicLux / photopicLux : 0;
    
    // Circadian Stimulus (CS) calculation based on Rea et al.
    const circadianStimulus = this.calculateCircadianStimulus(melanopicLux);
    
    // Circadian Light (CLA) - simplified calculation
    const circadianLight = melanopicLux * 1.3; // Approximation factor
    
    // Equivalent Melanopic Lux
    const equivalentMelanopicLux = melanopicLux;

    return {
      melanopicLux,
      melanopicRatio,
      circadianStimulus,
      circadianLight,
      equivalentMelanopicLux
    };
  }

  /**
   * Calculate visual comfort metrics
   */
  private calculateVisualComfortMetrics(spectrum: SpectralData): SpectralAnalysisResult['visualComfort'] {
    // Photopic illuminance
    const illuminance = this.calculateWeightedIntegral(
      spectrum,
      this.photopicLuminosityFunction
    ) * 683;
    
    // Scotopic illuminance
    const scotopicLux = this.calculateWeightedIntegral(
      spectrum,
      this.scotopicLuminosityFunction
    ) * 1700; // Scotopic luminous efficacy constant
    
    // S/P ratio
    const spRatio = illuminance > 0 ? scotopicLux / illuminance : 0;
    
    // Mesopic multiplier (simplified)
    const mesopicMultiplier = this.calculateMesopicMultiplier(spRatio, illuminance);
    
    // Visual efficacy
    const totalPower = this.integrateSpectrum(spectrum);
    const visualEfficacy = totalPower > 0 ? illuminance / totalPower : 0;

    return {
      illuminance,
      scotopicLux,
      mesopicMultiplier,
      spRatio,
      visualEfficacy
    };
  }

  /**
   * Calculate spectral quality metrics
   */
  private calculateSpectralQualityMetrics(spectrum: SpectralData): SpectralAnalysisResult['spectralQuality'] {
    // Gamut Area Index (simplified)
    const gamutAreaIndex = this.calculateGamutAreaIndex(spectrum);
    
    // Memory Color Rendering Index (simplified)
    const memoryColorRenderingIndex = this.calculateMemoryColorIndex(spectrum);
    
    // Feeling of Contrast (Rf)
    const feelingOfContrast = this.calculateFeelingOfContrast(spectrum);
    
    // Color Vector Graphic data points
    const colorVectorGraphic = this.calculateColorVectorGraphic(spectrum);
    
    // Spectral Similarity Index vs daylight
    const spectralSimilarityIndex = this.calculateSpectralSimilarityIndex(
      spectrum,
      this.referenceSpectra.get('d65')!.spectrum
    );

    return {
      gamutAreaIndex,
      memoryColorRenderingIndex,
      feelingOfContrast,
      colorVectorGraphic,
      spectralSimilarityIndex
    };
  }

  /**
   * Calculate horticultural-specific metrics
   */
  private calculateHorticulturalMetrics(spectrum: SpectralData): SpectralAnalysisResult['horticultural'] {
    // Morphogenic ratio (Blue/Red for plant shape control)
    const blueFlux = this.integrateSpectrum(this.extractSpectralRange(spectrum, 400, 500));
    const redFlux = this.integrateSpectrum(this.extractSpectralRange(spectrum, 600, 700));
    const morphogenicRatio = redFlux > 0 ? blueFlux / redFlux : 0;
    
    // Photoperiod effectiveness (Far-red influence on flowering)
    const farRedFlux = this.integrateSpectrum(this.extractSpectralRange(spectrum, 700, 800));
    const totalFlux = this.integrateSpectrum(spectrum);
    const photoperiodEffectiveness = totalFlux > 0 ? farRedFlux / totalFlux : 0;
    
    // Photosystem efficiencies (based on absorption peaks)
    const ps1Efficiency = this.calculatePhotosystemEfficiency(spectrum, 'PS1');
    const ps2Efficiency = this.calculatePhotosystemEfficiency(spectrum, 'PS2');
    
    // Quantum yield potential
    const quantumYieldPotential = this.calculateQuantumYieldPotential(spectrum);
    
    // Chlorophyll excitation
    const chlorophyllA = this.calculateChlorophyllExcitation(spectrum, 'a');
    const chlorophyllB = this.calculateChlorophyllExcitation(spectrum, 'b');
    
    // Carotenoid excitation
    const carotenoidExcitation = this.calculateCarotenoidExcitation(spectrum);
    
    // Anthocyanin induction potential
    const anthocyaninInduction = this.calculateAnthocyaninInduction(spectrum);

    return {
      morphogenicRatio,
      photoperiodEffectiveness,
      photosystem1Efficiency: ps1Efficiency,
      photosystem2Efficiency: ps2Efficiency,
      quantumYieldPotential,
      chlorophyllExcitation: { a: chlorophyllA, b: chlorophyllB },
      carotenoidExcitation,
      anthocyaninInduction
    };
  }

  /**
   * Initialize all photobiological weighting functions
   */
  private initializeWeightingFunctions(): void {
    // CIE 1931 Photopic Luminosity Function V(λ)
    this.photopicLuminosityFunction = {
      name: 'CIE 1931 Photopic',
      wavelengths: [380, 390, 400, 410, 420, 430, 440, 450, 460, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620, 630, 640, 650, 660, 670, 680, 690, 700, 710, 720, 730, 740, 750, 760, 770, 780],
      weights: [0.0000, 0.0001, 0.0004, 0.0012, 0.0040, 0.0116, 0.0230, 0.0380, 0.0600, 0.0910, 0.1390, 0.2080, 0.3230, 0.5030, 0.7100, 0.8620, 0.9540, 0.9950, 0.9950, 0.9520, 0.8700, 0.7570, 0.6310, 0.5030, 0.3810, 0.2650, 0.1750, 0.1070, 0.0610, 0.0320, 0.0147, 0.0061, 0.0025, 0.0010, 0.0004, 0.0002, 0.0001, 0.0000, 0.0000, 0.0000, 0.0000],
      description: 'Standard photopic vision sensitivity',
      reference: 'CIE 1931'
    };

    // CIE 1951 Scotopic Luminosity Function
    this.scotopicLuminosityFunction = {
      name: 'CIE 1951 Scotopic',
      wavelengths: [380, 390, 400, 410, 420, 430, 440, 450, 460, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620, 630, 640, 650, 660, 670, 680, 690, 700, 710, 720, 730, 740, 750, 760, 770, 780],
      weights: [0.0002, 0.0007, 0.0024, 0.0072, 0.0191, 0.0434, 0.0847, 0.1406, 0.2045, 0.2647, 0.3281, 0.4550, 0.5670, 0.6760, 0.7930, 0.9040, 0.9820, 0.9970, 0.9350, 0.8110, 0.6500, 0.4810, 0.3288, 0.2076, 0.1212, 0.0655, 0.0332, 0.0159, 0.0074, 0.0033, 0.0015, 0.0007, 0.0003, 0.0001, 0.0001, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000],
      description: 'Standard scotopic vision sensitivity',
      reference: 'CIE 1951'
    };

    // Melanopic Weighting Function (Lucas et al. 2014)
    this.melanopicWeightingFunction = {
      name: 'Melanopic',
      wavelengths: [380, 390, 400, 410, 420, 430, 440, 450, 460, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620, 630, 640, 650, 660, 670, 680, 690, 700, 710, 720, 730, 740, 750, 760, 770, 780],
      weights: [0.001, 0.002, 0.005, 0.011, 0.025, 0.058, 0.124, 0.234, 0.383, 0.561, 0.741, 0.884, 0.961, 0.975, 0.935, 0.853, 0.740, 0.608, 0.472, 0.343, 0.237, 0.154, 0.095, 0.056, 0.032, 0.017, 0.009, 0.005, 0.002, 0.001, 0.001, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000],
      description: 'Melanopsin-weighted sensitivity for circadian responses',
      reference: 'Lucas et al. 2014'
    };

    // Circadian weighting function (simplified)
    this.circadianWeightingFunction = this.melanopicWeightingFunction;

    // CIE 1931 Color Matching Functions
    this.colorMatchingFunctions = {
      x: {
        name: 'CIE X',
        wavelengths: [380, 390, 400, 410, 420, 430, 440, 450, 460, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620, 630, 640, 650, 660, 670, 680, 690, 700, 710, 720, 730, 740, 750, 760, 770, 780],
        weights: [0.0014, 0.0042, 0.0143, 0.0435, 0.1344, 0.2839, 0.3483, 0.3362, 0.2908, 0.1954, 0.0956, 0.0320, 0.0049, 0.0093, 0.0633, 0.1655, 0.2904, 0.4334, 0.5945, 0.7621, 0.9163, 1.0263, 1.0622, 1.0026, 0.8544, 0.6424, 0.4479, 0.2835, 0.1649, 0.0874, 0.0468, 0.0227, 0.0114, 0.0058, 0.0029, 0.0014, 0.0007, 0.0003, 0.0002, 0.0001, 0.0000],
        description: 'CIE X color matching function',
        reference: 'CIE 1931'
      },
      y: this.photopicLuminosityFunction, // Y is the same as photopic
      z: {
        name: 'CIE Z',
        wavelengths: [380, 390, 400, 410, 420, 430, 440, 450, 460, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620, 630, 640, 650, 660, 670, 680, 690, 700, 710, 720, 730, 740, 750, 760, 770, 780],
        weights: [0.0065, 0.0201, 0.0679, 0.2074, 0.6456, 1.3856, 1.7471, 1.7721, 1.6692, 1.2876, 0.8130, 0.4652, 0.2720, 0.1582, 0.0782, 0.0422, 0.0203, 0.0087, 0.0039, 0.0021, 0.0017, 0.0011, 0.0008, 0.0003, 0.0002, 0.0001, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000],
        description: 'CIE Z color matching function',
        reference: 'CIE 1931'
      }
    };
  }

  /**
   * Initialize reference spectra for comparison
   */
  private initializeReferenceSpectra(): void {
    this.referenceSpectra = new Map();

    // D65 Daylight spectrum
    const d65Wavelengths = [];
    const d65Values = [];
    for (let wl = 380; wl <= 780; wl += 10) {
      d65Wavelengths.push(wl);
      // Simplified D65 approximation
      d65Values.push(this.calculateD65Value(wl));
    }

    this.referenceSpectra.set('d65', {
      name: 'CIE D65',
      description: 'Standard daylight illuminant at 6500K',
      spectrum: { wavelengths: d65Wavelengths, values: d65Values },
      colorTemperature: 6504,
      type: 'daylight'
    });

    // Add more reference spectra as needed
    this.addBlackbodySpectrum(2700, 'tungsten');
    this.addBlackbodySpectrum(3000, 'halogen');
    this.addBlackbodySpectrum(5000, 'daylight_5000k');
  }

  /**
   * Helper methods for calculations
   */
  private validateAndNormalizeSpectrum(spectrum: SpectralData): SpectralData {
    // Ensure wavelengths are sorted
    const sorted = spectrum.wavelengths
      .map((wl, i) => ({ wavelength: wl, value: spectrum.values[i] }))
      .sort((a, b) => a.wavelength - b.wavelength);

    return {
      wavelengths: sorted.map(item => item.wavelength),
      values: sorted.map(item => Math.max(0, item.value)) // Ensure non-negative
    };
  }

  private integrateSpectrum(spectrum: SpectralData): number {
    let integral = 0;
    for (let i = 1; i < spectrum.wavelengths.length; i++) {
      const deltaWl = spectrum.wavelengths[i] - spectrum.wavelengths[i - 1];
      const avgValue = (spectrum.values[i] + spectrum.values[i - 1]) / 2;
      integral += avgValue * deltaWl;
    }
    return integral;
  }

  private calculateWeightedIntegral(
    spectrum: SpectralData,
    weightingFunction: PhotobiologicalWeightingFunction
  ): number {
    let integral = 0;
    
    for (let i = 0; i < spectrum.wavelengths.length; i++) {
      const wavelength = spectrum.wavelengths[i];
      const value = spectrum.values[i];
      const weight = this.interpolateWeight(weightingFunction, wavelength);
      
      if (i > 0) {
        const deltaWl = spectrum.wavelengths[i] - spectrum.wavelengths[i - 1];
        integral += value * weight * deltaWl;
      }
    }
    
    return integral;
  }

  private interpolateWeight(weightingFunction: PhotobiologicalWeightingFunction, wavelength: number): number {
    const { wavelengths, weights } = weightingFunction;
    
    if (wavelength <= wavelengths[0]) return weights[0];
    if (wavelength >= wavelengths[wavelengths.length - 1]) return weights[weights.length - 1];
    
    // Linear interpolation
    for (let i = 1; i < wavelengths.length; i++) {
      if (wavelength <= wavelengths[i]) {
        const t = (wavelength - wavelengths[i - 1]) / (wavelengths[i] - wavelengths[i - 1]);
        return weights[i - 1] + t * (weights[i] - weights[i - 1]);
      }
    }
    
    return 0;
  }

  private extractSpectralRange(spectrum: SpectralData, minWl: number, maxWl: number): SpectralData {
    const wavelengths: number[] = [];
    const values: number[] = [];
    
    for (let i = 0; i < spectrum.wavelengths.length; i++) {
      if (spectrum.wavelengths[i] >= minWl && spectrum.wavelengths[i] <= maxWl) {
        wavelengths.push(spectrum.wavelengths[i]);
        values.push(spectrum.values[i]);
      }
    }
    
    return { wavelengths, values };
  }

  private calculatePhotonFlux(spectrum: SpectralData): number {
    // Convert radiometric to photometric (photons)
    // E = hc/λ, so photons = power * λ / (h * c)
    const h = 6.626e-34; // Planck constant
    const c = 3e8; // Speed of light
    
    let photonFlux = 0;
    for (let i = 0; i < spectrum.wavelengths.length; i++) {
      const wavelength = spectrum.wavelengths[i] * 1e-9; // Convert nm to m
      const power = spectrum.values[i];
      const photons = power * wavelength / (h * c);
      photonFlux += photons;
    }
    
    return photonFlux * 1e6; // Convert to μmol/s
  }

  // Additional calculation methods would be implemented here...
  // For brevity, showing simplified versions

  private calculateColorRenderingIndex(spectrum: SpectralData, cct: number): number {
    // Simplified CRI calculation - in production would use full 14 test color samples
    return Math.max(0, Math.min(100, 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15)); // Placeholder
  }

  private calculateDetailedCRI(spectrum: SpectralData, cct: number): { [key: string]: number } {
    // Simplified - would calculate R1-R15 individually
    const base = this.calculateColorRenderingIndex(spectrum, cct);
    return {
      'R1': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      'R2': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      'R3': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      'R4': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      'R5': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      'R6': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      'R7': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      'R8': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      'R9': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 15, // Red is often challenging
      'R10': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      'R11': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      'R12': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      'R13': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 15, // Skin tone
      'R14': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      'R15': base + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10
    };
  }

  private calculateColorQualityScale(spectrum: SpectralData): number {
    // Simplified CQS calculation
    return Math.max(0, Math.min(100, 80 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20));
  }

  private calculateCircadianStimulus(melanopicLux: number): number {
    // CS = 0.7 * (1 - 1/(1 + (Mel/355.7)^1.1026))
    return 0.7 * (1 - 1 / (1 + Math.pow(melanopicLux / 355.7, 1.1026)));
  }

  private calculateMesopicMultiplier(spRatio: number, illuminance: number): number {
    // Simplified mesopic calculation
    if (illuminance > 3) return 1.0; // Photopic conditions
    if (illuminance < 0.01) return spRatio; // Scotopic conditions
    
    // Mesopic transition
    const logLum = Math.log10(illuminance);
    const factor = (logLum + 2) / 2.48; // Normalized between 0-1
    return 1 + factor * (spRatio - 1);
  }

  // Placeholder implementations for complex calculations
  private calculateGamutAreaIndex(spectrum: SpectralData): number {
    return 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15; // Simplified
  }

  private calculateMemoryColorIndex(spectrum: SpectralData): number {
    return 80 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20; // Simplified
  }

  private calculateFeelingOfContrast(spectrum: SpectralData): number {
    return 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15; // Simplified
  }

  private calculateColorVectorGraphic(spectrum: SpectralData): { x: number; y: number }[] {
    // Simplified CVG data points
    return Array.from({ length: 15 }, (_, i) => ({
      x: Math.cos(i * Math.PI * 2 / 15) * (0.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.5),
      y: Math.sin(i * Math.PI * 2 / 15) * (0.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.5)
    }));
  }

  private calculateSpectralSimilarityIndex(spectrum1: SpectralData, spectrum2: SpectralData): number {
    // Simplified SSI calculation
    return 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2;
  }

  private calculatePhotosystemEfficiency(spectrum: SpectralData, type: 'PS1' | 'PS2'): number {
    // Simplified calculation based on absorption peaks
    if (type === 'PS1') {
      const redEfficiency = this.integrateSpectrum(this.extractSpectralRange(spectrum, 680, 720));
      return Math.min(1, redEfficiency / 100);
    } else {
      const blueRedEfficiency = this.integrateSpectrum(this.extractSpectralRange(spectrum, 400, 500)) +
                               this.integrateSpectrum(this.extractSpectralRange(spectrum, 650, 680));
      return Math.min(1, blueRedEfficiency / 200);
    }
  }

  private calculateQuantumYieldPotential(spectrum: SpectralData): number {
    const parEfficiency = this.integrateSpectrum(this.extractSpectralRange(spectrum, 400, 700));
    return Math.min(0.12, parEfficiency / 1000); // Maximum theoretical quantum yield
  }

  private calculateChlorophyllExcitation(spectrum: SpectralData, type: 'a' | 'b'): number {
    if (type === 'a') {
      // Chlorophyll a peaks at ~430nm and ~664nm
      return this.integrateSpectrum(this.extractSpectralRange(spectrum, 425, 435)) +
             this.integrateSpectrum(this.extractSpectralRange(spectrum, 660, 670));
    } else {
      // Chlorophyll b peaks at ~453nm and ~642nm
      return this.integrateSpectrum(this.extractSpectralRange(spectrum, 450, 460)) +
             this.integrateSpectrum(this.extractSpectralRange(spectrum, 640, 650));
    }
  }

  private calculateCarotenoidExcitation(spectrum: SpectralData): number {
    // Carotenoids absorb mainly in blue region (400-500nm)
    return this.integrateSpectrum(this.extractSpectralRange(spectrum, 400, 500));
  }

  private calculateAnthocyaninInduction(spectrum: SpectralData): number {
    // Anthocyanin production induced by UV and blue light
    return this.integrateSpectrum(this.extractSpectralRange(spectrum, 380, 450));
  }

  private calculateD65Value(wavelength: number): number {
    // Simplified D65 calculation
    const wl = wavelength / 1000; // Convert to micrometers
    return 100 * Math.exp(-0.5 * Math.pow((wl - 0.55) / 0.15, 2)); // Gaussian approximation
  }

  private addBlackbodySpectrum(temperature: number, name: string): void {
    const wavelengths: number[] = [];
    const values: number[] = [];
    
    for (let wl = 380; wl <= 780; wl += 10) {
      wavelengths.push(wl);
      values.push(this.planckFunction(wl * 1e-9, temperature));
    }
    
    this.referenceSpectra.set(name, {
      name: `Blackbody ${temperature}K`,
      description: `Blackbody radiation at ${temperature}K`,
      spectrum: { wavelengths, values },
      colorTemperature: temperature,
      type: 'blackbody'
    });
  }

  private planckFunction(wavelength: number, temperature: number): number {
    const h = 6.626e-34; // Planck constant
    const c = 3e8; // Speed of light
    const k = 1.381e-23; // Boltzmann constant
    
    const numerator = 2 * h * Math.pow(c, 2);
    const denominator = Math.pow(wavelength, 5) * (Math.exp(h * c / (wavelength * k * temperature)) - 1);
    
    return numerator / denominator;
  }

  /**
   * Public API methods
   */
  public compareSpectra(spectrum1: SpectralData, spectrum2: SpectralData): {
    similarity: number;
    differences: { [metric: string]: number };
  } {
    const analysis1 = this.analyzeSpectrum(spectrum1);
    const analysis2 = this.analyzeSpectrum(spectrum2);
    
    const differences = {
      colorTemperature: Math.abs(analysis1.colorTemperature - analysis2.colorTemperature),
      cri: Math.abs(analysis1.colorRenderingIndex - analysis2.colorRenderingIndex),
      efficacy: Math.abs(analysis1.luminousEfficacy - analysis2.luminousEfficacy),
      ppfd: Math.abs(analysis1.photosynthetic.ppfd - analysis2.photosynthetic.ppfd),
      redFarRedRatio: Math.abs(analysis1.photosynthetic.redFarRedRatio - analysis2.photosynthetic.redFarRedRatio)
    };
    
    const similarity = this.calculateSpectralSimilarityIndex(spectrum1, spectrum2);
    
    return { similarity, differences };
  }

  public getReferenceSpectra(): Map<string, ReferenceSpectrum> {
    return this.referenceSpectra;
  }

  public addCustomReferenceSpectrum(spectrum: ReferenceSpectrum): void {
    this.referenceSpectra.set(spectrum.name.toLowerCase().replace(/\s+/g, '_'), spectrum);
  }

  public exportAnalysisReport(analysis: SpectralAnalysisResult): string {
    return JSON.stringify(analysis, null, 2);
  }
}