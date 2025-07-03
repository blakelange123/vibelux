// Advanced Water Chemistry Calculations for Irrigation Management

export interface IonConcentrations {
  // Cations (meq/L)
  calcium: number;      // Ca2+
  magnesium: number;    // Mg2+
  potassium: number;    // K+
  sodium: number;       // Na+
  ammonium: number;     // NH4+
  iron: number;         // Fe2+/Fe3+
  manganese: number;    // Mn2+
  zinc: number;         // Zn2+
  copper: number;       // Cu2+
  
  // Anions (meq/L)
  nitrate: number;      // NO3-
  phosphate: number;    // PO43-
  sulfate: number;      // SO42-
  chloride: number;     // Cl-
  bicarbonate: number;  // HCO3-
  carbonate: number;    // CO32-
  hydroxide: number;    // OH-
}

export interface WaterQualityMetrics {
  ph: number;
  ec: number;           // mS/cm
  tds: number;          // ppm
  temperature: number;  // °C
  cationSum: number;    // meq/L
  anionSum: number;     // meq/L
  ionBalance: number;   // %
  sar: number;          // Sodium Adsorption Ratio
  adjustedSAR: number;  // pH-adjusted SAR
  rsc: number;          // Residual Sodium Carbonate (meq/L)
  hardness: number;     // ppm CaCO3
  alkalinity: number;   // ppm CaCO3
  langelier: number;    // Langelier Saturation Index
  stability: number;    // Ryznar Stability Index
  aggressiveness: number; // Aggressive Index
}

// Molecular weights and charge factors for conversions
export const ionProperties = {
  // Cations
  calcium: { mw: 40.08, charge: 2, symbol: 'Ca²⁺' },
  magnesium: { mw: 24.31, charge: 2, symbol: 'Mg²⁺' },
  potassium: { mw: 39.10, charge: 1, symbol: 'K⁺' },
  sodium: { mw: 22.99, charge: 1, symbol: 'Na⁺' },
  ammonium: { mw: 18.04, charge: 1, symbol: 'NH₄⁺' },
  iron: { mw: 55.85, charge: 2, symbol: 'Fe²⁺' }, // Can be 3+
  manganese: { mw: 54.94, charge: 2, symbol: 'Mn²⁺' },
  zinc: { mw: 65.38, charge: 2, symbol: 'Zn²⁺' },
  copper: { mw: 63.55, charge: 2, symbol: 'Cu²⁺' },
  
  // Anions
  nitrate: { mw: 62.00, charge: 1, symbol: 'NO₃⁻' },
  phosphate: { mw: 94.97, charge: 3, symbol: 'PO₄³⁻' },
  sulfate: { mw: 96.06, charge: 2, symbol: 'SO₄²⁻' },
  chloride: { mw: 35.45, charge: 1, symbol: 'Cl⁻' },
  bicarbonate: { mw: 61.02, charge: 1, symbol: 'HCO₃⁻' },
  carbonate: { mw: 60.01, charge: 2, symbol: 'CO₃²⁻' },
  hydroxide: { mw: 17.01, charge: 1, symbol: 'OH⁻' }
};

// Convert ppm to meq/L
export function ppmToMeqL(ion: keyof typeof ionProperties, ppm: number): number {
  const props = ionProperties[ion];
  return (ppm * props.charge) / props.mw;
}

// Convert meq/L to ppm
export function meqLToPpm(ion: keyof typeof ionProperties, meqL: number): number {
  const props = ionProperties[ion];
  return (meqL * props.mw) / props.charge;
}

// Calculate total cations
export function calculateCationSum(ions: Partial<IonConcentrations>): number {
  return (ions.calcium || 0) + (ions.magnesium || 0) + (ions.potassium || 0) + 
         (ions.sodium || 0) + (ions.ammonium || 0) + (ions.iron || 0) + 
         (ions.manganese || 0) + (ions.zinc || 0) + (ions.copper || 0);
}

// Calculate total anions
export function calculateAnionSum(ions: Partial<IonConcentrations>): number {
  return (ions.nitrate || 0) + (ions.phosphate || 0) + (ions.sulfate || 0) + 
         (ions.chloride || 0) + (ions.bicarbonate || 0) + (ions.carbonate || 0) + 
         (ions.hydroxide || 0);
}

// Calculate ion balance error
export function calculateIonBalance(cationSum: number, anionSum: number): number {
  if (cationSum + anionSum === 0) return 0;
  return ((cationSum - anionSum) / (cationSum + anionSum)) * 100;
}

// Calculate Sodium Adsorption Ratio (SAR)
export function calculateSAR(na: number, ca: number, mg: number): number {
  const denominator = Math.sqrt((ca + mg) / 2);
  return denominator > 0 ? na / denominator : 0;
}

// Calculate Adjusted SAR (considers pH and bicarbonate)
export function calculateAdjustedSAR(na: number, ca: number, mg: number, hco3: number, ph: number): number {
  const sar = calculateSAR(na, ca, mg);
  const pHc = calculatePHc(ca, hco3);
  const adjustmentFactor = 1 + (8.4 - pHc);
  return sar * adjustmentFactor;
}

// Calculate pHc for adjusted SAR
function calculatePHc(ca: number, hco3: number): number {
  const caPpm = meqLToPpm('calcium', ca);
  const hco3Ppm = meqLToPpm('bicarbonate', hco3);
  const pCa = 3 - Math.log10(caPpm);
  const pAlk = 3 - Math.log10(hco3Ppm);
  return 11.4 - pCa - pAlk;
}

// Calculate Residual Sodium Carbonate (RSC)
export function calculateRSC(hco3: number, co3: number, ca: number, mg: number): number {
  return (hco3 + co3) - (ca + mg);
}

// Calculate water hardness as CaCO3
export function calculateHardness(ca: number, mg: number): number {
  return (ca + mg) * 50; // Convert meq/L to ppm CaCO3
}

// Calculate alkalinity as CaCO3
export function calculateAlkalinity(hco3: number, co3: number, oh: number = 0): number {
  return (hco3 + 2 * co3 + oh) * 50; // Convert meq/L to ppm CaCO3
}

// Estimate EC from ion concentrations
export function estimateEC(cationSum: number, anionSum: number): number {
  // Rough approximation: 1 meq/L ≈ 0.1 mS/cm
  return (cationSum + anionSum) * 0.1 / 2;
}

// Estimate TDS from EC
export function estimateTDS(ec: number): number {
  // Common conversion factor: TDS (ppm) = EC (mS/cm) × 640
  return ec * 640;
}

// Calculate Langelier Saturation Index (LSI)
export function calculateLSI(ph: number, temp: number, tds: number, ca: number, alkalinity: number): number {
  const A = (Math.log10(tds - 1) / 10) || 0;
  const B = -13.12 * Math.log10(temp + 273) + 34.55;
  const C = Math.log10(meqLToPpm('calcium', ca)) - 0.4;
  const D = Math.log10(alkalinity);
  const pHs = (9.3 + A + B) - (C + D);
  return ph - pHs;
}

// Calculate Ryznar Stability Index (RSI)
export function calculateRSI(ph: number, pHs: number): number {
  return 2 * pHs - ph;
}

// Calculate Aggressive Index (AI)
export function calculateAI(ph: number, ca: number, alkalinity: number): number {
  return ph + Math.log10(meqLToPpm('calcium', ca) * alkalinity);
}

// Interpret water quality indices
export function interpretLSI(lsi: number): { status: string; description: string; risk: 'low' | 'medium' | 'high' } {
  if (lsi < -2) return { status: 'Highly Aggressive', description: 'Severe corrosion potential', risk: 'high' };
  if (lsi < -0.5) return { status: 'Moderately Aggressive', description: 'Moderate corrosion potential', risk: 'medium' };
  if (lsi < 0.5) return { status: 'Balanced', description: 'No scaling or corrosion tendency', risk: 'low' };
  if (lsi < 2) return { status: 'Scale Forming', description: 'Moderate scaling potential', risk: 'medium' };
  return { status: 'Highly Scale Forming', description: 'Severe scaling potential', risk: 'high' };
}

export function interpretSAR(sar: number, ec: number): { status: string; risk: string; recommendation: string } {
  // Based on USDA irrigation water classification
  if (sar < 10) {
    if (ec < 0.7) return { status: 'Low sodium hazard', risk: 'Low salinity', recommendation: 'Suitable for most crops' };
    if (ec < 3) return { status: 'Low sodium hazard', risk: 'Medium salinity', recommendation: 'Suitable for salt-tolerant crops' };
    return { status: 'Low sodium hazard', risk: 'High salinity', recommendation: 'Only for very salt-tolerant crops' };
  } else if (sar < 18) {
    if (ec < 1.2) return { status: 'Medium sodium hazard', risk: 'Low salinity', recommendation: 'Use with caution on fine-textured soils' };
    if (ec < 3) return { status: 'Medium sodium hazard', risk: 'Medium salinity', recommendation: 'Requires good drainage and leaching' };
    return { status: 'Medium sodium hazard', risk: 'High salinity', recommendation: 'Generally unsuitable' };
  } else if (sar < 26) {
    if (ec < 2.9) return { status: 'High sodium hazard', risk: 'Medium salinity', recommendation: 'Requires special management' };
    return { status: 'High sodium hazard', risk: 'High salinity', recommendation: 'Generally unsuitable' };
  }
  return { status: 'Very high sodium hazard', risk: 'Very high', recommendation: 'Unsuitable for irrigation' };
}

// Calculate irrigation water quality index
export function calculateIWQI(params: {
  ec: number;
  na: number;
  cl: number;
  hco3: number;
  sar: number;
}): number {
  // Weighted quality index based on key parameters
  const weights = { ec: 0.25, na: 0.2, cl: 0.2, hco3: 0.15, sar: 0.2 };
  
  // Rating functions (0-100 scale, higher is better)
  const ratings = {
    ec: params.ec < 0.7 ? 100 : params.ec < 3 ? 100 - (params.ec - 0.7) * 30 : 0,
    na: params.na < 3 ? 100 : params.na < 9 ? 100 - (params.na - 3) * 15 : 0,
    cl: params.cl < 4 ? 100 : params.cl < 10 ? 100 - (params.cl - 4) * 15 : 0,
    hco3: params.hco3 < 1.5 ? 100 : params.hco3 < 8.5 ? 100 - (params.hco3 - 1.5) * 12 : 0,
    sar: params.sar < 3 ? 100 : params.sar < 9 ? 100 - (params.sar - 3) * 15 : 0
  };
  
  // Calculate weighted average
  return Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + ratings[key as keyof typeof ratings] * weight;
  }, 0);
}

// Calculate recommended leaching fraction
export function calculateLeachingFraction(ecw: number, ect: number): number {
  // ecw = EC of irrigation water, ect = EC threshold for crop
  return ecw / (5 * ect - ecw);
}

// Predict soil EC from irrigation water
export function predictSoilEC(ecw: number, lf: number): number {
  // ecw = EC of irrigation water, lf = leaching fraction
  return ecw / (2 * lf);
}

// Calculate gypsum requirement for sodium remediation
export function calculateGypsumRequirement(sar: number, desiredSAR: number, cec: number, depth: number): number {
  // Returns kg/ha of gypsum needed
  const meqReduction = (sar - desiredSAR) * cec * 0.01;
  const gypsumFactor = 86; // kg/ha per meq/100g
  return meqReduction * gypsumFactor * depth / 15;
}

// Generate water treatment recommendations
export function generateWaterTreatmentRecommendations(
  ions: IonConcentrations,
  metrics: WaterQualityMetrics
): string[] {
  const recommendations: string[] = [];
  
  // pH adjustment
  if (metrics.ph > 7.5) {
    recommendations.push('Consider acid injection to lower pH (sulfuric or phosphoric acid)');
  } else if (metrics.ph < 5.5) {
    recommendations.push('Consider adding potassium hydroxide or calcium carbonate to raise pH');
  }
  
  // Sodium management
  if (metrics.sar > 6) {
    recommendations.push('High SAR: Consider gypsum injection or calcium chloride to improve Ca:Na ratio');
  }
  
  // Bicarbonate issues
  if (ions.bicarbonate > 2) {
    recommendations.push('High bicarbonate: Use acid injection to neutralize excess alkalinity');
  }
  
  // Iron and manganese
  if (meqLToPpm('iron', ions.iron) > 1.5) {
    recommendations.push('High iron: Consider oxidation and filtration or chelation');
  }
  if (meqLToPpm('manganese', ions.manganese) > 0.5) {
    recommendations.push('High manganese: Consider oxidation and filtration');
  }
  
  // Chloride sensitivity
  if (meqLToPpm('chloride', ions.chloride) > 70) {
    recommendations.push('High chloride: Consider reverse osmosis or blending with better quality water');
  }
  
  // Scale prevention
  if (metrics.langelier > 0.5) {
    recommendations.push('Scaling potential: Consider anti-scalant injection or acid treatment');
  }
  
  return recommendations;
}