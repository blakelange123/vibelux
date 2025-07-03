/**
 * Advanced Scientific Calculations for Horticultural Lighting
 * Based on peer-reviewed research and physics models
 */

interface PhotomorphogenicModels {
  phytochrome: {
    pfr_pr_ratio: number;
    red_sensitivity: number;
    far_red_sensitivity: number;
  };
  cryptochrome: {
    blue_sensitivity: number;
    uv_sensitivity: number;
  };
  phototropin: {
    blue_response: number;
    directionality: boolean;
  };
}

interface McCreeCoefficients {
  [wavelength: number]: number;
}

interface RegionalFactor {
  lat_min: number;
  lat_max: number;
  lon_min: number;
  lon_max: number;
  factor: number;
}

interface PhotobleachingWarning {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  recommendation: string;
  research?: string;
}

interface PhotobleachingRiskResult {
  risk_level: 'low' | 'medium' | 'high';
  warnings: PhotobleachingWarning[];
  safe_red_ppfd_max: number;
  safe_total_ppfd_max: number;
}

interface PhytochromeResult {
  pfr_pr_ratio: number;
  morphological_response: string;
  stem_elongation_index: number;
  red_far_red_ratio: number;
}

interface SpectrumQualityResult {
  overall_quality: number;
  photosynthetic_efficiency: number;
  morphological_suitability: number;
  blue_light_quality: number;
  red_far_red_ratio: number;
  recommendations: string[];
}

interface HeatLoadResult {
  lighting_heat_btu: number;
  transpiration_load_btu: number;
  envelope_load_btu: number;
  ventilation_load_btu: number;
  total_sensible_btu: number;
  total_latent_btu: number;
  total_cooling_btu: number;
  cooling_tons_required: number;
  recommended_unit_size_tons: number;
}

interface TranspirationResult {
  transpiration_kg_hr: number;
  latent_load: number;
}

interface EnvelopeLoadResult {
  sensible_load: number;
}

interface VentilationLoadResult {
  sensible_load: number;
  latent_load: number;
}

export class AdvancedScientificCalculations {
  private photomorphogenicModels!: PhotomorphogenicModels;
  private mccreeCoefficients!: McCreeCoefficients;
  private regionalFactors!: RegionalFactor[];
  
  constructor() {
    this.initializeModels();
  }
  
  private initializeModels(): void {
    this.photomorphogenicModels = {
      phytochrome: { 
        pfr_pr_ratio: 0.87, 
        red_sensitivity: 660, 
        far_red_sensitivity: 730 
      },
      cryptochrome: { 
        blue_sensitivity: 450, 
        uv_sensitivity: 280 
      },
      phototropin: { 
        blue_response: 470, 
        directionality: true 
      }
    };
    
    // McCree curve coefficients for photosynthetic action spectrum
    this.mccreeCoefficients = {
      400: 0.00, 425: 0.83, 450: 0.87, 475: 0.93, 500: 0.90,
      525: 0.85, 550: 0.75, 575: 0.70, 600: 0.98, 625: 1.00,
      650: 0.96, 675: 0.89, 700: 0.06
    };
    
    // Regional climate factors
    this.regionalFactors = [
      // US Southwest (high solar radiation)
      { lat_min: 30, lat_max: 40, lon_min: -125, lon_max: -100, factor: 1.15 },
      // US Southeast (humid, more clouds)
      { lat_min: 25, lat_max: 35, lon_min: -95, lon_max: -75, factor: 0.85 },
      // US Pacific Northwest (cloudy)
      { lat_min: 42, lat_max: 49, lon_min: -125, lon_max: -115, factor: 0.70 },
      // Default
      { lat_min: -90, lat_max: 90, lon_min: -180, lon_max: 180, factor: 1.0 }
    ];
  }

  /**
   * Calculate outdoor DLI using advanced atmospheric and solar radiation models
   * Based on Bird & Hulstrom clear sky model and NREL solar data
   */
  calculateResearchBasedDLI(
    latitude: number, 
    longitude: number, 
    month: string, 
    elevation: number = 0
  ): number {
    // Month to day of year (approximate middle of month)
    const monthToDay: { [key: string]: number } = {
      "January": 15, "February": 45, "March": 75, "April": 105,
      "May": 135, "June": 165, "July": 195, "August": 225,
      "September": 255, "October": 285, "November": 315, "December": 345
    };
    const dayOfYear = monthToDay[month] || 135;
    
    // Solar declination angle (degrees) - precise astronomical calculation
    const declination = 23.45 * Math.sin((Math.PI / 180) * (360 * (284 + dayOfYear) / 365));
    
    // Convert to radians
    const latRad = latitude * Math.PI / 180;
    const declRad = declination * Math.PI / 180;
    
    // Hour angle at sunrise/sunset
    let hourAngle: number;
    try {
      const cosHourAngle = -Math.tan(latRad) * Math.tan(declRad);
      // Check for polar day/night conditions
      if (cosHourAngle > 1) {
        hourAngle = 0; // Polar night
      } else if (cosHourAngle < -1) {
        hourAngle = Math.PI; // Polar day
      } else {
        hourAngle = Math.acos(cosHourAngle);
      }
    } catch {
      hourAngle = Math.PI / 2; // Default to ~12 hours
    }
    
    // Daylight hours
    const daylightHours = 2 * hourAngle * 12 / Math.PI;
    
    // Solar constant and Earth-Sun distance correction
    const solarConstant = 1367; // W/m² (extraterrestrial)
    const distanceFactor = 1 + 0.033 * Math.cos(2 * Math.PI * dayOfYear / 365);
    
    // Atmospheric transmission using Bird & Hulstrom model (simplified)
    const baseTransmission = 0.75;
    
    // Elevation correction (Rayleigh scattering decreases with altitude)
    const elevationFactor = 1 + (elevation / 8500) * 0.1;
    
    // Regional climate factors based on meteorological data
    const regionalFactor = this.getRegionalClimateFactor(latitude, longitude);
    
    // Seasonal cloud cover adjustments
    const seasonalCloudFactors: { [key: string]: number } = {
      "January": 0.85, "February": 0.88, "March": 0.92, "April": 0.90,
      "May": 0.95, "June": 0.98, "July": 1.00, "August": 0.98,
      "September": 0.95, "October": 0.92, "November": 0.88, "December": 0.82
    };
    const cloudFactor = seasonalCloudFactors[month] || 0.90;
    
    // Calculate solar zenith angle (average for the day)
    const cosZenith = (Math.sin(latRad) * Math.sin(declRad) + 
                      Math.cos(latRad) * Math.cos(declRad));
    
    let dli = 0;
    
    if (cosZenith > 0) {
      // Air mass calculation
      const zenithDegrees = Math.acos(cosZenith) * 180 / Math.PI;
      const airMass = 1 / (cosZenith + 0.15 * Math.pow(93.885 - zenithDegrees, -1.253));
      
      // Direct normal irradiance using Beer's law
      const directBeam = solarConstant * distanceFactor * cosZenith * Math.pow(baseTransmission, airMass);
      
      // Diffuse irradiance (approximately 15% of direct on clear days)
      const diffuse = directBeam * 0.15;
      
      // Total horizontal irradiance
      const totalIrradiance = (directBeam + diffuse) * elevationFactor * 
                            regionalFactor * cloudFactor;
      
      if (daylightHours > 0) {
        // Average irradiance over daylight hours (40% of peak for realistic daily average)
        const avgIrradiance = totalIrradiance * 0.4;
        const dailyIrradianceMJ = (avgIrradiance * daylightHours * 3600) / 1000000; // MJ/m²/day
        
        // Convert to mol/m²/day using quantum efficiency for PAR
        // PAR fraction of solar radiation (~45%) and photon energy conversion (2.3 mol/MJ)
        dli = dailyIrradianceMJ * 0.45 * 2.3;
      }
    }
    
    // Apply latitude-based maximum constraints
    const maxDli = this.getLatitudeMaxDLI(latitude);
    dli = Math.max(0.5, Math.min(dli, maxDli));
    
    return dli;
  }

  private getRegionalClimateFactor(latitude: number, longitude: number): number {
    for (const region of this.regionalFactors) {
      if (latitude >= region.lat_min && latitude <= region.lat_max &&
          longitude >= region.lon_min && longitude <= region.lon_max) {
        return region.factor;
      }
    }
    return 1.0;
  }

  private getLatitudeMaxDLI(latitude: number): number {
    const absLat = Math.abs(latitude);
    if (absLat < 25) return 50;      // Tropical
    else if (absLat < 35) return 55; // Subtropical
    else if (absLat < 45) return 45; // Temperate
    else return 35;                  // High latitude
  }

  /**
   * Scientific photobleaching risk assessment for cannabis
   * Based on Rodriguez-Morrison et al. (2021) and Westmoreland et al. (2021)
   */
  checkCannabisPhotobleachingRisk(
    cropType: string,
    totalPPFD: number,
    redRatio?: number,
    growthStage: string = "flowering"
  ): PhotobleachingRiskResult {
    const warnings: PhotobleachingWarning[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (cropType.toLowerCase().includes("cannabis")) {
      const redPPFD = redRatio ? totalPPFD * redRatio : totalPPFD * 0.7;
      
      // Critical thresholds based on peer-reviewed research
      if (cropType.toLowerCase().includes("flowering") || growthStage.toLowerCase() === "flowering") {
        if (redPPFD > 600) { // Hawley et al. (2023) threshold
          riskLevel = 'high';
          warnings.push({
            type: 'error',
            title: '⚠️ CRITICAL: Cannabis Photobleaching Risk',
            message: `Red light PPFD (${redPPFD.toFixed(0)} μmol/m²/s) exceeds safe threshold for flowering cannabis.`,
            recommendation: 'Reduce red light to <600 μmol/m²/s or increase blue/green ratio to prevent photobleaching.',
            research: 'Rodriguez-Morrison et al. (2021), Westmoreland et al. (2021)'
          });
        } else if (redPPFD > 500) {
          riskLevel = 'medium';
          warnings.push({
            type: 'warning',
            title: '⚠️ Cannabis Light Stress Warning',
            message: `Red light PPFD (${redPPFD.toFixed(0)} μmol/m²/s) approaching stress threshold.`,
            recommendation: 'Monitor plants for bleaching symptoms. Consider reducing intensity.',
            research: 'Hawley et al. (2023)'
          });
        }
      }
      
      // General high light warnings
      if (totalPPFD > 1200) {
        riskLevel = 'high';
        warnings.push({
          type: 'error',
          title: '⚠️ CRITICAL: Excessive Total PPFD',
          message: `Total PPFD (${totalPPFD.toFixed(0)} μmol/m²/s) exceeds cannabis photosynthetic capacity.`,
          recommendation: 'Reduce total PPFD to 800-1000 μmol/m²/s range for optimal growth.',
          research: 'Rodriguez-Morrison et al. (2021)'
        });
      } else if (totalPPFD > 1000) {
        if (riskLevel !== 'high') {
          riskLevel = 'medium';
        }
        warnings.push({
          type: 'warning',
          title: '⚠️ High Light Warning',
          message: `Total PPFD (${totalPPFD.toFixed(0)} μmol/m²/s) in stress range.`,
          recommendation: 'Ensure adequate CO₂ (1000-1500 ppm) and optimal VPD (0.8-1.2 kPa).',
          research: 'Chandra et al. (2008)'
        });
      }
    }
    
    return {
      risk_level: riskLevel,
      warnings: warnings,
      safe_red_ppfd_max: cropType.toLowerCase().includes("flowering") ? 600 : 800,
      safe_total_ppfd_max: 1000
    };
  }

  /**
   * Calculate Pfr/Pr ratio for stem elongation predictions
   * Based on Sager et al. (1988) and Mazzella et al. (2000)
   */
  calculatePhytochromePhotoequilibrium(redPPFD: number, farRedPPFD: number): PhytochromeResult {
    if (redPPFD + farRedPPFD === 0) {
      return {
        pfr_pr_ratio: 0.5,
        morphological_response: "Dark equilibrium",
        stem_elongation_index: 1.0,
        red_far_red_ratio: 0
      };
    }
    
    // Photoequilibrium calculation with action spectrum weighting
    // Far-red is ~3.5x more effective than red at phytochrome conversion
    const pfrPrRatio = redPPFD / (redPPFD + farRedPPFD * 3.5);
    
    // Morphological response predictions
    let response: string;
    if (pfrPrRatio > 0.7) {
      response = "Compact growth, short internodes";
    } else if (pfrPrRatio > 0.4) {
      response = "Normal growth";
    } else {
      response = "Shade avoidance, elongated internodes";
    }
    
    return {
      pfr_pr_ratio: pfrPrRatio,
      morphological_response: response,
      stem_elongation_index: pfrPrRatio > 0 ? 1.0 / pfrPrRatio : 2.0,
      red_far_red_ratio: farRedPPFD > 0 ? redPPFD / farRedPPFD : Infinity
    };
  }

  /**
   * Farquhar-von Caemmerer-Berry model for C3 photosynthesis
   * Includes VPD effects on stomatal conductance
   */
  estimatePhotosyntheticRate(
    ppfd: number,
    co2PPM: number,
    temperature: number,
    vpd: number
  ): number {
    // Model parameters for typical horticultural crops
    const vcmax25 = 85;  // Maximum Rubisco capacity at 25°C (μmol CO2/m²/s)
    const jmax25 = 150;  // Maximum electron transport rate at 25°C
    const rd25 = 1.5;    // Dark respiration at 25°C
    
    // Temperature response functions (Arrhenius)
    const tempK = temperature + 273.15;
    
    // Vcmax temperature response
    const haVcmax = 65330; // Activation energy (J/mol)
    const vcmax = vcmax25 * Math.exp((haVcmax * (tempK - 298.15)) / (298.15 * 8.314 * tempK));
    
    // Jmax temperature response
    const haJmax = 43540;
    const jmax = jmax25 * Math.exp((haJmax * (tempK - 298.15)) / (298.15 * 8.314 * tempK));
    
    // Dark respiration
    const haRd = 46390;
    const rd = rd25 * Math.exp((haRd * (tempK - 298.15)) / (298.15 * 8.314 * tempK));
    
    // Light-limited rate (RuBP regeneration)
    const alpha = 0.24; // Quantum yield of electron transport
    const theta = 0.7;  // Curvature factor
    
    // Solve quadratic for J
    const a = theta;
    const b = -(alpha * ppfd + jmax);
    const c = alpha * ppfd * jmax;
    const j = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    
    // Rubisco-limited rate
    const kc25 = 404.9; // Michaelis constant for CO2 at 25°C (μmol/mol)
    const ko25 = 278.4; // Michaelis constant for O2 at 25°C (mmol/mol)
    const o2 = 210;     // O2 concentration (mmol/mol)
    
    // Temperature dependencies
    const kc = kc25 * Math.exp((79430 * (tempK - 298.15)) / (298.15 * 8.314 * tempK));
    const ko = ko25 * Math.exp((36380 * (tempK - 298.15)) / (298.15 * 8.314 * tempK));
    
    const km = kc * (1 + o2 / ko);
    const wc = vcmax * co2PPM / (co2PPM + km);
    
    // Light-limited rate
    const wj = j * co2PPM / (4 * co2PPM + 8 * 210); // Simplified
    
    // Minimum of Rubisco and light limited rates
    const grossAssimilation = Math.min(wc, wj);
    
    // VPD effect on stomatal conductance (Ball-Berry model simplified)
    const vpdFactor = vpd > 1.0 ? Math.max(0.2, 1.0 - (vpd - 1.0) * 0.3) : 1.0;
    
    // Net assimilation
    const netAssimilation = (grossAssimilation - rd) * vpdFactor;
    
    return Math.max(0, netAssimilation);
  }

  /**
   * Calculate comprehensive spectrum quality index using McCree curve
   * and photomorphogenic responses
   */
  calculateSpectrumQualityIndex(spectrumData: { [key: string]: number }): SpectrumQualityResult {
    if (!spectrumData || Object.keys(spectrumData).length === 0) {
      return {
        overall_quality: 0,
        photosynthetic_efficiency: 0,
        morphological_suitability: 0,
        blue_light_quality: 0,
        red_far_red_ratio: 0,
        recommendations: ["No spectrum data provided"]
      };
    }
    
    const totalPPFD = Object.values(spectrumData).reduce((sum, val) => sum + val, 0);
    
    if (totalPPFD === 0) {
      return {
        overall_quality: 0,
        photosynthetic_efficiency: 0,
        morphological_suitability: 0,
        blue_light_quality: 0,
        red_far_red_ratio: 0,
        recommendations: ["No light detected - check fixture operation"]
      };
    }
    
    // Photosynthetic efficiency using McCree curve
    let photosyntheticSum = 0;
    for (const [wavelength, ppfd] of Object.entries(spectrumData)) {
      let wl: number;
      
      if (isNaN(Number(wavelength))) {
        // Handle named bands
        switch (wavelength) {
          case 'blue': wl = 450; break;
          case 'green': wl = 550; break;
          case 'red': wl = 660; break;
          case 'far_red': wl = 730; break;
          default: continue;
        }
      } else {
        wl = Number(wavelength);
      }
      
      // Interpolate McCree coefficient
      const mccreeWeight = this.interpolateMcCree(wl);
      photosyntheticSum += ppfd * mccreeWeight;
    }
    
    const photosyntheticEfficiency = photosyntheticSum / totalPPFD;
    
    // Morphological quality (R:FR ratio)
    const redPPFD = spectrumData.red || spectrumData['660'] || 0;
    const farRedPPFD = spectrumData.far_red || spectrumData['730'] || 0;
    
    let morphologicalQuality: number;
    let rfrRatio: number;
    
    if (farRedPPFD > 0) {
      rfrRatio = redPPFD / farRedPPFD;
      // Optimal R:FR around 10:1 for most crops
      morphologicalQuality = Math.min(1.0, rfrRatio / 10);
    } else {
      morphologicalQuality = 1.0;
      rfrRatio = Infinity;
    }
    
    // Blue light fraction (optimal 15-25%)
    const bluePPFD = spectrumData.blue || spectrumData['450'] || 0;
    const blueFraction = bluePPFD / totalPPFD;
    let blueQuality = 1.0 - Math.abs(blueFraction - 0.20) * 2; // Penalty for deviation from 20%
    blueQuality = Math.max(0, Math.min(1.0, blueQuality));
    
    // Combined quality index
    const overallQuality = (photosyntheticEfficiency * 0.5 + 
                           morphologicalQuality * 0.3 + 
                           blueQuality * 0.2) * 100;
    
    return {
      overall_quality: overallQuality,
      photosynthetic_efficiency: photosyntheticEfficiency * 100,
      morphological_suitability: morphologicalQuality * 100,
      blue_light_quality: blueQuality * 100,
      red_far_red_ratio: rfrRatio,
      recommendations: this.getSpectrumRecommendations(spectrumData, totalPPFD)
    };
  }

  private interpolateMcCree(wavelength: number): number {
    const wavelengths = Object.keys(this.mccreeCoefficients)
      .map(Number)
      .sort((a, b) => a - b);
    
    if (wavelength <= wavelengths[0]) {
      return this.mccreeCoefficients[wavelengths[0]];
    } else if (wavelength >= wavelengths[wavelengths.length - 1]) {
      return this.mccreeCoefficients[wavelengths[wavelengths.length - 1]];
    }
    
    // Linear interpolation
    for (let i = 0; i < wavelengths.length - 1; i++) {
      if (wavelength >= wavelengths[i] && wavelength <= wavelengths[i + 1]) {
        const w1 = wavelengths[i];
        const w2 = wavelengths[i + 1];
        const v1 = this.mccreeCoefficients[w1];
        const v2 = this.mccreeCoefficients[w2];
        return v1 + (v2 - v1) * (wavelength - w1) / (w2 - w1);
      }
    }
    
    return 0.5; // Default value
  }

  private getSpectrumRecommendations(spectrumData: { [key: string]: number }, totalPPFD: number): string[] {
    const recommendations: string[] = [];
    
    const bluePct = (spectrumData.blue || 0) / totalPPFD * 100;
    const redPct = (spectrumData.red || 0) / totalPPFD * 100;
    const greenPct = (spectrumData.green || 0) / totalPPFD * 100;
    const farRedPct = (spectrumData.far_red || 0) / totalPPFD * 100;
    
    if (bluePct < 15) {
      recommendations.push("Increase blue light (15-25%) for compact growth and stomatal regulation");
    } else if (bluePct > 30) {
      recommendations.push("Reduce blue light - excessive blue may inhibit growth and waste energy");
    }
    
    if (redPct < 50) {
      recommendations.push("Increase red light (60-70%) for optimal photosynthetic efficiency");
    } else if (redPct > 80) {
      recommendations.push("Add green light (10-15%) for better canopy penetration and photosynthesis");
    }
    
    if (greenPct < 5) {
      recommendations.push("Consider adding green light for improved canopy penetration");
    }
    
    const redPPFD = spectrumData.red || 0;
    const farRedPPFD = spectrumData.far_red || 0;
    if (farRedPPFD > 0) {
      const rfrRatio = redPPFD / farRedPPFD;
      if (rfrRatio < 5) {
        recommendations.push("High far-red may cause excessive stem elongation - consider reducing");
      } else if (rfrRatio > 15) {
        recommendations.push("Low far-red may limit leaf expansion - consider small increase");
      }
    }
    
    return recommendations;
  }

  /**
   * Calculate total heat load for HVAC sizing including all sources
   */
  calculateComprehensiveHeatLoad(
    totalPowerWatts: number,
    growAreaSqft: number,
    cropType: string,
    ppfd: number,
    roomDimensions: [number, number, number], // [length, width, height]
    outdoorTemp: number = 85,
    indoorTemp: number = 75
  ): HeatLoadResult {
    // Lighting heat load (physics-based)
    const photosyntheticEfficiency = 0.05; // ~5% of light energy used for photosynthesis
    const ledEfficiency = 0.50; // ~50% electrical efficiency for modern LEDs
    
    // Heat from fixtures (W)
    const fixtureHeat = totalPowerWatts * (1 - photosyntheticEfficiency);
    const driverHeat = totalPowerWatts * 0.10; // Driver losses
    const totalLightingHeat = fixtureHeat + driverHeat;
    
    // Plant transpiration load
    const transpirationData = this.calculateTranspirationLoad(growAreaSqft, cropType, ppfd);
    
    // Building envelope load
    const [roomLength, roomWidth, ceilingHeight] = roomDimensions;
    const envelopeData = this.calculateEnvelopeLoad(
      roomLength, roomWidth, ceilingHeight,
      outdoorTemp, indoorTemp
    );
    
    // Ventilation load (assume 6 ACH for grow rooms)
    const roomVolume = roomLength * roomWidth * ceilingHeight;
    const ventilationData = this.calculateVentilationLoad(
      roomVolume, 6, outdoorTemp, indoorTemp
    );
    
    // Total sensible heat (BTU/hr)
    const totalSensibleBtu = (totalLightingHeat * 3.412 + // Convert W to BTU/hr
                             envelopeData.sensible_load +
                             ventilationData.sensible_load);
    
    // Total latent heat (BTU/hr)
    const totalLatentBtu = (transpirationData.latent_load +
                           ventilationData.latent_load);
    
    // Total cooling load with safety factor
    const safetyFactor = 1.2;
    const totalCoolingBtu = (totalSensibleBtu + totalLatentBtu) * safetyFactor;
    const coolingTons = totalCoolingBtu / 12000; // Convert to tons
    
    return {
      lighting_heat_btu: totalLightingHeat * 3.412,
      transpiration_load_btu: transpirationData.latent_load,
      envelope_load_btu: envelopeData.sensible_load,
      ventilation_load_btu: ventilationData.sensible_load + ventilationData.latent_load,
      total_sensible_btu: totalSensibleBtu,
      total_latent_btu: totalLatentBtu,
      total_cooling_btu: totalCoolingBtu,
      cooling_tons_required: coolingTons,
      recommended_unit_size_tons: Math.ceil(coolingTons * 2) / 2 // Round up to nearest 0.5 ton
    };
  }

  private calculateTranspirationLoad(growAreaSqft: number, cropType: string, ppfd: number): TranspirationResult {
    // Transpiration rates (g/m²/hr) based on research
    const baseRates: { [key: string]: number } = {
      'cannabis': 300,
      'tomatoes': 250,
      'lettuce': 150,
      'herbs': 180
    };
    
    const cropKey = Object.keys(baseRates).find(k => cropType.toLowerCase().includes(k)) || 'lettuce';
    const baseRate = baseRates[cropKey];
    
    // PPFD adjustment (higher light = more transpiration)
    let lightFactor = 1 + (ppfd - 400) * 0.0003; // 30% increase per 1000 PPFD above 400
    lightFactor = Math.max(0.5, Math.min(2.0, lightFactor));
    
    // Calculate total transpiration
    const growAreaM2 = growAreaSqft * 0.092903;
    const transpirationRate = baseRate * lightFactor; // g/m²/hr
    const totalTranspirationKgHr = (transpirationRate * growAreaM2) / 1000;
    
    // Convert to latent heat (BTU/hr)
    // Latent heat of vaporization = 970 BTU/lb
    const latentHeatBtu = totalTranspirationKgHr * 2.20462 * 970; // kg to lb to BTU
    
    return {
      transpiration_kg_hr: totalTranspirationKgHr,
      latent_load: latentHeatBtu
    };
  }

  private calculateEnvelopeLoad(
    length: number,
    width: number,
    height: number,
    outdoorTemp: number,
    indoorTemp: number
  ): EnvelopeLoadResult {
    // Surface areas
    const wallArea = 2 * (length + width) * height;
    const ceilingArea = length * width;
    
    // U-values (BTU/hr·ft²·°F) for typical construction
    const wallU = 0.10; // Well-insulated wall
    const ceilingU = 0.05; // Insulated ceiling
    
    // Temperature difference
    const tempDiff = Math.abs(outdoorTemp - indoorTemp);
    
    // Heat transfer (BTU/hr)
    const wallLoad = wallArea * wallU * tempDiff;
    const ceilingLoad = ceilingArea * ceilingU * tempDiff;
    
    return {
      sensible_load: wallLoad + ceilingLoad
    };
  }

  private calculateVentilationLoad(
    roomVolume: number,
    airChangesPerHour: number,
    outdoorTemp: number,
    indoorTemp: number
  ): VentilationLoadResult {
    // Air flow rate (CFM)
    const cfm = roomVolume * airChangesPerHour / 60;
    
    // Sensible heat (BTU/hr)
    const tempDiff = Math.abs(outdoorTemp - indoorTemp);
    const sensibleLoad = cfm * 1.08 * tempDiff; // 1.08 = sensible heat factor
    
    // Latent load (assume 30 grains/lb humidity difference)
    const humidityDiff = 30; // grains/lb
    const latentLoad = cfm * 0.68 * humidityDiff; // 0.68 = latent heat factor
    
    return {
      sensible_load: sensibleLoad,
      latent_load: latentLoad
    };
  }
}

// Export singleton instance
export const advancedCalculations = new AdvancedScientificCalculations();