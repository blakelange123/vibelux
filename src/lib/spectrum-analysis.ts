export interface SpectralPowerDistribution {
  wavelengths: number[]; // nm
  intensities: number[]; // relative or absolute
  normalized: boolean;
}

export interface SpectrumMetrics {
  cct: number; // Correlated Color Temperature (K)
  cri: number; // Color Rendering Index (0-100)
  r9: number; // Deep red rendering
  duv: number; // Distance from blackbody locus
  efficacy: number; // Photosynthetic efficacy (μmol/J)
  par: number; // PAR percentage (400-700nm)
  blue: number; // Blue percentage (400-500nm)
  green: number; // Green percentage (500-600nm)
  red: number; // Red percentage (600-700nm)
  farRed: number; // Far red percentage (700-800nm)
  uv: number; // UV percentage (<400nm)
  ppf: number; // Total PPF
  ypf: number; // Yield Photon Flux
  // New metrics
  rbRatio: number; // Red:Blue ratio
  rfrRatio: number; // Red:Far-red ratio
  pfrPtotal: number; // Pfr/Ptotal phytochrome photoequilibrium
  uvA: number; // UV-A percentage (315-400nm)
  uvB: number; // UV-B percentage (280-315nm)
  parPPFD: number; // PAR PPFD (μmol/m²/s)
  farRedPPFD: number; // Far-red PPFD (μmol/m²/s)
  uvPPFD: number; // UV PPFD (μmol/m²/s)
  dliByBand: {
    uv: number;
    blue: number;
    green: number;
    red: number;
    farRed: number;
  };
}

export interface PlantResponse {
  photosynthesis: number; // 0-100%
  morphology: number; // 0-100%
  flowering: number; // 0-100%
  quality: number; // 0-100%
}

export class SpectrumAnalyzer {
  // Standard illuminants
  static readonly STANDARD_ILLUMINANTS = {
    D65: { cct: 6504, name: 'Daylight' },
    A: { cct: 2856, name: 'Incandescent' },
    F12: { cct: 3000, name: 'Fluorescent 3000K' },
    LED_3000K: { cct: 3000, name: 'LED 3000K' },
    LED_4000K: { cct: 4000, name: 'LED 4000K' },
    LED_5000K: { cct: 5000, name: 'LED 5000K' },
    HPS: { cct: 2100, name: 'High Pressure Sodium' },
    MH: { cct: 4200, name: 'Metal Halide' },
    CMH: { cct: 3100, name: 'Ceramic Metal Halide' }
  };

  // Plant photosynthesis action spectrum (McCree curve)
  private static readonly MCCREE_CURVE: SpectralPowerDistribution = {
    wavelengths: [400, 425, 450, 475, 500, 525, 550, 575, 600, 625, 650, 675, 700],
    intensities: [0.65, 0.85, 0.93, 0.95, 0.88, 0.75, 0.60, 0.55, 0.72, 0.88, 0.95, 0.95, 0.75],
    normalized: true
  };

  // Photomorphogenic action spectra
  private static readonly PHYTOCHROME_PR: SpectralPowerDistribution = {
    wavelengths: [400, 450, 500, 550, 600, 650, 660, 670, 700, 730, 750, 800],
    intensities: [0.1, 0.2, 0.15, 0.1, 0.3, 0.85, 1.0, 0.95, 0.4, 0.05, 0.02, 0.01],
    normalized: true
  };

  private static readonly PHYTOCHROME_PFR: SpectralPowerDistribution = {
    wavelengths: [400, 450, 500, 550, 600, 650, 700, 730, 740, 750, 800],
    intensities: [0.05, 0.1, 0.08, 0.05, 0.1, 0.15, 0.4, 1.0, 0.95, 0.3, 0.05],
    normalized: true
  };

  static analyzeSpectrum(spd: SpectralPowerDistribution, area: number = 1): SpectrumMetrics {
    // Calculate color metrics
    const cct = this.calculateCCT(spd);
    const cri = this.calculateCRI(spd);
    const duv = this.calculateDuv(spd);

    // Calculate photosynthetic metrics
    const parData = this.calculatePAR(spd);
    const efficacy = this.calculatePhotosynthethicEfficacy(spd);
    
    // Calculate spectral regions
    const regions = this.calculateSpectralRegions(spd);
    const detailedRegions = this.calculateDetailedSpectralRegions(spd);
    
    // Calculate ratios
    const rbRatio = regions.blue > 0 ? regions.red / regions.blue : 0;
    const rfrRatio = regions.farRed > 0 ? regions.red / regions.farRed : 0;
    
    // Calculate phytochrome photoequilibrium
    const pfrPtotal = this.calculatePhytochromePhotoequilibrium(spd);
    
    // Calculate PPFD by band (assuming area in m²)
    const parPPFD = parData.ppf / area;
    const farRedPPFD = (detailedRegions.farRed.ppf || 0) / area;
    const uvPPFD = (detailedRegions.uv.ppf || 0) / area;
    
    // Calculate DLI by band (assuming 12 hour photoperiod)
    const photoperiod = 12; // hours
    const dliByBand = {
      uv: uvPPFD * photoperiod * 3600 / 1000000,
      blue: (detailedRegions.blue.ppf || 0) / area * photoperiod * 3600 / 1000000,
      green: (detailedRegions.green.ppf || 0) / area * photoperiod * 3600 / 1000000,
      red: (detailedRegions.red.ppf || 0) / area * photoperiod * 3600 / 1000000,
      farRed: farRedPPFD * photoperiod * 3600 / 1000000
    };

    return {
      cct,
      cri: cri.general,
      r9: cri.r9,
      duv,
      efficacy,
      par: parData.percentage,
      blue: regions.blue,
      green: regions.green,
      red: regions.red,
      farRed: regions.farRed,
      uv: regions.uv,
      ppf: parData.ppf,
      ypf: this.calculateYPF(spd),
      rbRatio,
      rfrRatio,
      pfrPtotal,
      uvA: detailedRegions.uvA?.percentage || 0,
      uvB: detailedRegions.uvB?.percentage || 0,
      parPPFD,
      farRedPPFD,
      uvPPFD,
      dliByBand
    };
  }

  static calculatePlantResponse(spd: SpectralPowerDistribution): PlantResponse {
    // Photosynthesis efficiency based on McCree curve
    const photosynthesis = this.calculateActionSpectrumMatch(spd, this.MCCREE_CURVE) * 100;

    // Morphology based on blue/red ratio
    const regions = this.calculateSpectralRegions(spd);
    const blueRedRatio = regions.blue / (regions.red || 1);
    const morphology = Math.min(100, Math.max(0, 50 + (blueRedRatio - 0.3) * 100));

    // Flowering based on R:FR ratio
    const rfrRatio = regions.red / (regions.farRed || 1);
    const flowering = Math.min(100, Math.max(0, (rfrRatio - 1) * 20));

    // Overall quality
    const quality = (photosynthesis * 0.4 + morphology * 0.3 + flowering * 0.3);

    return {
      photosynthesis,
      morphology,
      flowering,
      quality
    };
  }

  private static calculateCCT(spd: SpectralPowerDistribution): number {
    // Calculate CIE 1931 chromaticity coordinates
    const { x, y } = this.calculateChromaticity(spd);

    // McCamy's approximation for CCT
    const n = (x - 0.3320) / (0.1858 - y);
    const cct = 437 * Math.pow(n, 3) + 3601 * Math.pow(n, 2) + 6861 * n + 5517;

    return Math.round(cct);
  }

  private static calculateCRI(spd: SpectralPowerDistribution): { general: number; r9: number } {
    // Simplified CRI calculation
    // In production, use full CIE 13.3-1995 method with 14 test color samples
    
    // For now, return estimated values based on spectrum characteristics
    const regions = this.calculateSpectralRegions(spd);
    const balance = 1 - Math.abs(regions.blue - regions.red) / 100;
    const coverage = (regions.blue + regions.green + regions.red) / 100;
    
    return {
      general: Math.round(50 + balance * 30 + coverage * 20),
      r9: Math.round(regions.red * 0.8) // Deep red rendering
    };
  }

  private static calculateDuv(spd: SpectralPowerDistribution): number {
    // Distance from blackbody locus
    const { u, v } = this.calculateUV(spd);
    
    // Simplified calculation
    // In production, calculate actual distance from Planckian locus
    return Math.round((v - 0.3) * 1000) / 1000;
  }

  private static calculatePAR(spd: SpectralPowerDistribution): { ppf: number; percentage: number } {
    let totalPower = 0;
    let parPower = 0;

    for (let i = 0; i < spd.wavelengths.length - 1; i++) {
      const wavelength = spd.wavelengths[i];
      const intensity = spd.intensities[i];
      const dWavelength = spd.wavelengths[i + 1] - wavelength;
      
      const power = intensity * dWavelength;
      totalPower += power;
      
      if (wavelength >= 400 && wavelength <= 700) {
        parPower += power;
      }
    }

    return {
      ppf: parPower * 4.6, // Conversion factor to μmol/s
      percentage: totalPower > 0 ? (parPower / totalPower) * 100 : 0
    };
  }

  private static calculatePhotosynthethicEfficacy(spd: SpectralPowerDistribution): number {
    const { ppf } = this.calculatePAR(spd);
    const totalPower = spd.intensities.reduce((sum, i) => sum + i, 0);
    
    return totalPower > 0 ? ppf / totalPower : 0;
  }

  private static calculateSpectralRegions(spd: SpectralPowerDistribution): {
    uv: number;
    blue: number;
    green: number;
    red: number;
    farRed: number;
  } {
    const regions = {
      uv: 0,
      blue: 0,
      green: 0,
      red: 0,
      farRed: 0
    };

    let total = 0;

    for (let i = 0; i < spd.wavelengths.length; i++) {
      const wavelength = spd.wavelengths[i];
      const intensity = spd.intensities[i];
      
      total += intensity;
      
      if (wavelength < 400) {
        regions.uv += intensity;
      } else if (wavelength >= 400 && wavelength < 500) {
        regions.blue += intensity;
      } else if (wavelength >= 500 && wavelength < 600) {
        regions.green += intensity;
      } else if (wavelength >= 600 && wavelength < 700) {
        regions.red += intensity;
      } else if (wavelength >= 700 && wavelength < 800) {
        regions.farRed += intensity;
      }
    }

    // Convert to percentages
    if (total > 0) {
      regions.uv = (regions.uv / total) * 100;
      regions.blue = (regions.blue / total) * 100;
      regions.green = (regions.green / total) * 100;
      regions.red = (regions.red / total) * 100;
      regions.farRed = (regions.farRed / total) * 100;
    }

    return regions;
  }

  private static calculateYPF(spd: SpectralPowerDistribution): number {
    // Yield Photon Flux - weighted by plant response
    let ypf = 0;

    for (let i = 0; i < spd.wavelengths.length; i++) {
      const wavelength = spd.wavelengths[i];
      const intensity = spd.intensities[i];
      
      // Get McCree curve value at this wavelength
      const mccreeValue = this.interpolateValue(
        wavelength,
        this.MCCREE_CURVE.wavelengths,
        this.MCCREE_CURVE.intensities
      );
      
      ypf += intensity * mccreeValue;
    }

    return ypf * 4.6; // Convert to μmol/s
  }

  private static calculateActionSpectrumMatch(
    spd: SpectralPowerDistribution,
    actionSpectrum: SpectralPowerDistribution
  ): number {
    let totalMatch = 0;
    let totalAction = 0;

    for (let i = 0; i < actionSpectrum.wavelengths.length; i++) {
      const wavelength = actionSpectrum.wavelengths[i];
      const actionValue = actionSpectrum.intensities[i];
      
      const spdValue = this.interpolateValue(
        wavelength,
        spd.wavelengths,
        spd.intensities
      );
      
      totalMatch += Math.min(spdValue, actionValue);
      totalAction += actionValue;
    }

    return totalAction > 0 ? totalMatch / totalAction : 0;
  }

  private static interpolateValue(
    x: number,
    xArray: number[],
    yArray: number[]
  ): number {
    if (x <= xArray[0]) return yArray[0];
    if (x >= xArray[xArray.length - 1]) return yArray[yArray.length - 1];

    for (let i = 0; i < xArray.length - 1; i++) {
      if (x >= xArray[i] && x <= xArray[i + 1]) {
        const t = (x - xArray[i]) / (xArray[i + 1] - xArray[i]);
        return yArray[i] + t * (yArray[i + 1] - yArray[i]);
      }
    }

    return 0;
  }

  private static calculateChromaticity(spd: SpectralPowerDistribution): { x: number; y: number } {
    // CIE 1931 color matching functions (simplified)
    // In production, use full tables
    const X = spd.intensities.reduce((sum, i) => sum + i * 0.3, 0);
    const Y = spd.intensities.reduce((sum, i) => sum + i * 0.6, 0);
    const Z = spd.intensities.reduce((sum, i) => sum + i * 0.1, 0);
    
    const total = X + Y + Z;
    
    return {
      x: total > 0 ? X / total : 0,
      y: total > 0 ? Y / total : 0
    };
  }

  private static calculateUV(spd: SpectralPowerDistribution): { u: number; v: number } {
    const { x, y } = this.calculateChromaticity(spd);
    
    const denominator = -2 * x + 12 * y + 3;
    
    return {
      u: denominator !== 0 ? 4 * x / denominator : 0,
      v: denominator !== 0 ? 9 * y / denominator : 0
    };
  }

  private static calculateDetailedSpectralRegions(spd: SpectralPowerDistribution): any {
    const regions: any = {
      uvB: { ppf: 0, percentage: 0 }, // 280-315nm
      uvA: { ppf: 0, percentage: 0 }, // 315-400nm
      uv: { ppf: 0, percentage: 0 },  // <400nm total
      blue: { ppf: 0, percentage: 0 }, // 400-500nm
      green: { ppf: 0, percentage: 0 }, // 500-600nm
      red: { ppf: 0, percentage: 0 }, // 600-700nm
      farRed: { ppf: 0, percentage: 0 } // 700-800nm
    };

    let total = 0;

    for (let i = 0; i < spd.wavelengths.length - 1; i++) {
      const wavelength = spd.wavelengths[i];
      const intensity = spd.intensities[i];
      const dWavelength = spd.wavelengths[i + 1] - wavelength;
      const ppf = intensity * dWavelength * 4.6; // Conversion to μmol/s
      
      total += intensity;
      
      if (wavelength >= 280 && wavelength < 315) {
        regions.uvB.ppf += ppf;
      } else if (wavelength >= 315 && wavelength < 400) {
        regions.uvA.ppf += ppf;
      }
      
      if (wavelength < 400) {
        regions.uv.ppf += ppf;
      } else if (wavelength >= 400 && wavelength < 500) {
        regions.blue.ppf += ppf;
      } else if (wavelength >= 500 && wavelength < 600) {
        regions.green.ppf += ppf;
      } else if (wavelength >= 600 && wavelength < 700) {
        regions.red.ppf += ppf;
      } else if (wavelength >= 700 && wavelength < 800) {
        regions.farRed.ppf += ppf;
      }
    }

    // Calculate percentages
    if (total > 0) {
      Object.keys(regions).forEach(key => {
        regions[key].percentage = (regions[key].ppf / (total * 4.6)) * 100;
      });
    }

    return regions;
  }

  private static calculatePhytochromePhotoequilibrium(spd: SpectralPowerDistribution): number {
    // Calculate phytochrome photoequilibrium (Pfr/Ptotal)
    // Based on Sager et al. (1988) photoequilibrium model
    
    let prAbsorption = 0;
    let pfrAbsorption = 0;
    
    for (let i = 0; i < spd.wavelengths.length; i++) {
      const wavelength = spd.wavelengths[i];
      const intensity = spd.intensities[i];
      
      // Get absorption values for Pr and Pfr forms
      const prValue = this.interpolateValue(
        wavelength,
        this.PHYTOCHROME_PR.wavelengths,
        this.PHYTOCHROME_PR.intensities
      );
      
      const pfrValue = this.interpolateValue(
        wavelength,
        this.PHYTOCHROME_PFR.wavelengths,
        this.PHYTOCHROME_PFR.intensities
      );
      
      prAbsorption += intensity * prValue;
      pfrAbsorption += intensity * pfrValue;
    }
    
    // Calculate photoequilibrium
    const total = prAbsorption + pfrAbsorption;
    return total > 0 ? pfrAbsorption / total : 0;
  }

  // Cryptochrome action spectrum (blue light receptor)
  private static readonly CRYPTOCHROME_CURVE: SpectralPowerDistribution = {
    wavelengths: [350, 375, 400, 425, 450, 475, 500, 525, 550],
    intensities: [0.3, 0.5, 0.8, 0.95, 1.0, 0.85, 0.4, 0.1, 0.05],
    normalized: true
  };

  // UVR8 action spectrum (UV-B receptor)
  private static readonly UVR8_CURVE: SpectralPowerDistribution = {
    wavelengths: [280, 290, 300, 310, 320, 330, 340, 350],
    intensities: [1.0, 0.95, 0.85, 0.7, 0.4, 0.15, 0.05, 0.01],
    normalized: true
  };

  // Spectrum presets
  static readonly SPECTRUM_PRESETS = {
    vegetative: {
      name: 'Vegetative Growth',
      description: 'High blue content for compact growth',
      params: { blue: 35, green: 20, red: 35, farRed: 8, uv: 2 }
    },
    flowering: {
      name: 'Flowering/Fruiting',
      description: 'High red content for flower development',
      params: { blue: 20, green: 15, red: 50, farRed: 12, uv: 3 }
    },
    fullSpectrum: {
      name: 'Full Spectrum',
      description: 'Balanced spectrum for all growth stages',
      params: { blue: 25, green: 25, red: 40, farRed: 8, uv: 2 }
    },
    supplementalFarRed: {
      name: 'Supplemental Far-Red',
      description: 'Enhanced far-red for stem elongation',
      params: { blue: 15, green: 10, red: 35, farRed: 35, uv: 5 }
    },
    uvEnhanced: {
      name: 'UV Enhanced',
      description: 'Increased UV for secondary metabolites',
      params: { blue: 25, green: 15, red: 40, farRed: 10, uv: 10 }
    },
    seedling: {
      name: 'Seedling/Clone',
      description: 'Gentle spectrum for young plants',
      params: { blue: 30, green: 25, red: 35, farRed: 5, uv: 5 }
    }
  };

  // Get action spectrum data for visualization
  static getActionSpectra() {
    return {
      mccree: this.MCCREE_CURVE,
      phytochromePr: this.PHYTOCHROME_PR,
      phytochromePfr: this.PHYTOCHROME_PFR,
      cryptochrome: this.CRYPTOCHROME_CURVE,
      uvr8: this.UVR8_CURVE
    };
  }

  // Generate spectrum visualization data
  static generateSpectrumVisualizationData(spd: SpectralPowerDistribution): {
    wavelengths: number[];
    intensities: number[];
    bands: {
      uvB: { start: number; end: number; color: string; label: string };
      uvA: { start: number; end: number; color: string; label: string };
      blue: { start: number; end: number; color: string; label: string };
      green: { start: number; end: number; color: string; label: string };
      red: { start: number; end: number; color: string; label: string };
      farRed: { start: number; end: number; color: string; label: string };
    };
  } {
    return {
      wavelengths: spd.wavelengths,
      intensities: spd.intensities,
      bands: {
        uvB: { start: 280, end: 315, color: '#8B00FF', label: 'UV-B' },
        uvA: { start: 315, end: 400, color: '#6A0DAD', label: 'UV-A' },
        blue: { start: 400, end: 500, color: '#0000FF', label: 'Blue' },
        green: { start: 500, end: 600, color: '#00FF00', label: 'Green' },
        red: { start: 600, end: 700, color: '#FF0000', label: 'Red' },
        farRed: { start: 700, end: 800, color: '#8B0000', label: 'Far-Red' }
      }
    };
  }

  // Mix multiple spectra
  static mixSpectra(spectra: Array<{ spd: SpectralPowerDistribution; weight: number }>): SpectralPowerDistribution {
    if (spectra.length === 0) {
      throw new Error('No spectra provided for mixing');
    }

    // Find common wavelength range
    const minWavelength = Math.max(...spectra.map(s => Math.min(...s.spd.wavelengths)));
    const maxWavelength = Math.min(...spectra.map(s => Math.max(...s.spd.wavelengths)));
    
    // Generate wavelength array (5nm steps)
    const wavelengths: number[] = [];
    for (let wl = minWavelength; wl <= maxWavelength; wl += 5) {
      wavelengths.push(wl);
    }
    
    // Mix intensities
    const intensities = wavelengths.map(wl => {
      let totalIntensity = 0;
      let totalWeight = 0;
      
      spectra.forEach(({ spd, weight }) => {
        const intensity = this.interpolateValue(wl, spd.wavelengths, spd.intensities);
        totalIntensity += intensity * weight;
        totalWeight += weight;
      });
      
      return totalWeight > 0 ? totalIntensity / totalWeight : 0;
    });
    
    return {
      wavelengths,
      intensities,
      normalized: false
    };
  }

  // Generate custom spectrum
  static createCustomSpectrum(params: {
    blue: number; // 0-100
    green: number; // 0-100
    red: number; // 0-100
    farRed: number; // 0-100
    uv: number; // 0-100
  }): SpectralPowerDistribution {
    const wavelengths: number[] = [];
    const intensities: number[] = [];

    // Generate spectrum from 350nm to 800nm in 5nm steps
    for (let wl = 350; wl <= 800; wl += 5) {
      wavelengths.push(wl);
      
      let intensity = 0;
      
      // UV (350-400nm)
      if (wl >= 350 && wl < 400) {
        intensity += params.uv * Math.exp(-Math.pow((wl - 375) / 25, 2));
      }
      
      // Blue (400-500nm)
      if (wl >= 400 && wl < 500) {
        intensity += params.blue * Math.exp(-Math.pow((wl - 450) / 50, 2));
      }
      
      // Green (500-600nm)
      if (wl >= 500 && wl < 600) {
        intensity += params.green * Math.exp(-Math.pow((wl - 550) / 50, 2));
      }
      
      // Red (600-700nm)
      if (wl >= 600 && wl < 700) {
        intensity += params.red * Math.exp(-Math.pow((wl - 660) / 40, 2));
      }
      
      // Far Red (700-800nm)
      if (wl >= 700 && wl <= 800) {
        intensity += params.farRed * Math.exp(-Math.pow((wl - 730) / 30, 2));
      }
      
      intensities.push(intensity);
    }

    return {
      wavelengths,
      intensities,
      normalized: false
    };
  }
}