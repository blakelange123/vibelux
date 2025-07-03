/**
 * VPD (Vapor Pressure Deficit) Integration for Lighting Design
 * Integrates temperature, humidity, and lighting for optimal plant growth
 */

export interface VPDData {
  temperature: number; // °C
  humidity: number; // %
  leafTemperature?: number; // °C
  vpd: number; // kPa
  optimal: boolean;
  stress: 'none' | 'low' | 'moderate' | 'high';
}

/**
 * Calculate leaf temperature offset based on PPFD and spectrum
 * Higher PPFD and more red light increase leaf temperature
 */
export function calculateLeafTemperatureOffset(
  ppfd: number,
  spectrumData?: { blue: number; red: number; farRed: number }
): number {
  // Base offset from PPFD (approximately 0.5°C per 100 μmol/m²/s)
  let offset = ppfd * 0.005;
  
  // Spectrum adjustment - red light heats more than blue
  if (spectrumData) {
    const redRatio = (spectrumData.red + spectrumData.farRed) / 100;
    offset *= (0.8 + 0.4 * redRatio); // 80-120% based on red content
  }
  
  // Cap at reasonable values
  return Math.min(offset, 5); // Max 5°C offset
}

/**
 * Calculate VPD with lighting considerations
 */
export function calculateVPDWithLighting(
  airTemp: number,
  humidity: number,
  ppfd: number,
  spectrumData?: any
): VPDData {
  // Calculate leaf temperature
  const leafTempOffset = calculateLeafTemperatureOffset(ppfd, spectrumData);
  const leafTemp = airTemp + leafTempOffset;
  
  // Saturation vapor pressure (Tetens equation)
  const svpAir = 0.6108 * Math.exp((17.27 * airTemp) / (airTemp + 237.3));
  const svpLeaf = 0.6108 * Math.exp((17.27 * leafTemp) / (leafTemp + 237.3));
  
  // Actual vapor pressure
  const avp = svpAir * (humidity / 100);
  
  // VPD calculation
  const vpd = svpLeaf - avp;
  
  // Determine if VPD is optimal for growth stage
  const { optimal, stress } = evaluateVPD(vpd, ppfd);
  
  return {
    temperature: airTemp,
    humidity,
    leafTemperature: leafTemp,
    vpd: Number(vpd.toFixed(2)),
    optimal,
    stress
  };
}

/**
 * Evaluate if VPD is optimal based on growth conditions
 */
function evaluateVPD(vpd: number, ppfd: number): { optimal: boolean; stress: 'none' | 'low' | 'moderate' | 'high' } {
  // Optimal VPD ranges vary with light intensity
  let optimalMin: number, optimalMax: number;
  
  if (ppfd < 200) {
    // Low light - seedlings/propagation
    optimalMin = 0.4;
    optimalMax = 0.8;
  } else if (ppfd < 600) {
    // Medium light - vegetative growth
    optimalMin = 0.8;
    optimalMax = 1.2;
  } else {
    // High light - flowering/fruiting
    optimalMin = 1.0;
    optimalMax = 1.5;
  }
  
  const optimal = vpd >= optimalMin && vpd <= optimalMax;
  
  let stress: 'none' | 'low' | 'moderate' | 'high' = 'none';
  if (vpd < optimalMin * 0.5 || vpd > optimalMax * 2) {
    stress = 'high';
  } else if (vpd < optimalMin * 0.75 || vpd > optimalMax * 1.5) {
    stress = 'moderate';
  } else if (!optimal) {
    stress = 'low';
  }
  
  return { optimal, stress };
}

/**
 * Get recommended environmental adjustments
 */
export function getVPDRecommendations(vpdData: VPDData): string[] {
  const recommendations: string[] = [];
  
  if (vpdData.vpd < 0.4) {
    recommendations.push('VPD too low - Increase temperature or decrease humidity');
    recommendations.push('Risk of fungal diseases and poor transpiration');
    if (vpdData.leafTemperature && vpdData.leafTemperature > vpdData.temperature + 3) {
      recommendations.push('Consider reducing light intensity to lower leaf temperature');
    }
  } else if (vpdData.vpd > 1.5) {
    recommendations.push('VPD too high - Decrease temperature or increase humidity');
    recommendations.push('Risk of excessive transpiration and stomatal closure');
    recommendations.push('Consider misting or fogging to increase humidity');
  }
  
  if (vpdData.stress === 'high') {
    recommendations.push('⚠️ Critical: Environmental stress is limiting photosynthesis');
  }
  
  return recommendations;
}

/**
 * Calculate target environmental conditions for desired VPD
 */
export function calculateTargetEnvironment(
  targetVPD: number,
  ppfd: number,
  currentTemp: number
): { temperature: number; humidity: number } {
  // Calculate expected leaf temperature
  const leafTempOffset = calculateLeafTemperatureOffset(ppfd);
  const leafTemp = currentTemp + leafTempOffset;
  
  // Calculate required humidity for target VPD
  const svpLeaf = 0.6108 * Math.exp((17.27 * leafTemp) / (leafTemp + 237.3));
  const svpAir = 0.6108 * Math.exp((17.27 * currentTemp) / (currentTemp + 237.3));
  
  const requiredAVP = svpLeaf - targetVPD;
  const requiredHumidity = (requiredAVP / svpAir) * 100;
  
  return {
    temperature: currentTemp,
    humidity: Math.max(30, Math.min(80, requiredHumidity)) // Keep within reasonable bounds
  };
}

/**
 * Integration with lighting design - adjust PPFD based on VPD
 */
export function adjustPPFDForVPD(
  targetPPFD: number,
  currentVPD: number,
  optimalVPD: number
): number {
  // If VPD is far from optimal, reduce PPFD to prevent stress
  const vpdRatio = currentVPD / optimalVPD;
  
  if (vpdRatio < 0.5 || vpdRatio > 2.0) {
    // Severe VPD stress - reduce light by 30%
    return targetPPFD * 0.7;
  } else if (vpdRatio < 0.7 || vpdRatio > 1.5) {
    // Moderate stress - reduce by 15%
    return targetPPFD * 0.85;
  }
  
  return targetPPFD;
}