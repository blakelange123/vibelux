/**
 * Scientific PPFD calculation utilities based on photometric principles
 */

interface Fixture {
  ppf: number; // μmol/s
  beamAngle: number; // degrees
  wattage: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculate PPFD at a point using inverse square law with beam angle consideration
 * Based on: IES LM-79 and LM-80 standards
 */
export function calculatePPFDAtPoint(
  fixture: Fixture & Point3D,
  targetPoint: Point3D,
  reflectanceCoefficient: number = 0.1 // 10% wall reflectance typical
): number {
  // Calculate distance between fixture and target point
  const distance = Math.sqrt(
    Math.pow(fixture.x - targetPoint.x, 2) +
    Math.pow(fixture.y - targetPoint.y, 2) +
    Math.pow(fixture.z - targetPoint.z, 2)
  );

  // Prevent division by zero
  if (distance === 0) return 0;

  // Calculate angle from fixture to point
  const verticalDistance = fixture.z - targetPoint.z;
  const horizontalDistance = Math.sqrt(
    Math.pow(fixture.x - targetPoint.x, 2) +
    Math.pow(fixture.y - targetPoint.y, 2)
  );
  const angleFromNormal = Math.atan2(horizontalDistance, verticalDistance) * (180 / Math.PI);

  // Apply beam angle cutoff (lambertian distribution approximation)
  const halfBeamAngle = fixture.beamAngle / 2;
  if (angleFromNormal > halfBeamAngle) {
    // Outside main beam - apply cosine falloff
    const falloffFactor = Math.cos((angleFromNormal - halfBeamAngle) * (Math.PI / 180));
    if (falloffFactor <= 0) return 0;
  }

  // Base PPFD calculation using inverse square law
  // PPFD = PPF / (4π × distance²)
  const basePPFD = fixture.ppf / (4 * Math.PI * distance * distance);

  // Apply cosine correction for angle of incidence
  const cosineCorrection = verticalDistance / distance;
  
  // Add reflectance contribution (simplified)
  const reflectedPPFD = basePPFD * reflectanceCoefficient;

  return (basePPFD * cosineCorrection) + reflectedPPFD;
}

/**
 * Calculate uniformity ratio (min/avg) based on IES standards
 */
export function calculateUniformity(ppfdValues: number[]): number {
  if (ppfdValues.length === 0) return 0;
  
  const validValues = ppfdValues.filter(v => v > 0);
  if (validValues.length === 0) return 0;

  const min = Math.min(...validValues);
  const avg = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  
  return avg > 0 ? min / avg : 0;
}

/**
 * Calculate DLI (Daily Light Integral) from PPFD and photoperiod
 * DLI (mol·m⁻²·d⁻¹) = PPFD × hours × 0.0036
 */
export function calculateDLI(ppfd: number, photoperiodHours: number): number {
  return ppfd * photoperiodHours * 0.0036;
}

/**
 * Calculate required PPF for target PPFD based on coverage area
 * Accounts for fixture efficiency and distribution
 */
export function calculateRequiredPPF(
  targetPPFD: number,
  coverageArea: number, // m²
  fixtureEfficiency: number = 0.85, // typical fixture efficiency
  uniformityTarget: number = 0.7
): number {
  // Account for non-uniform distribution
  const distributionFactor = 1 / uniformityTarget;
  
  // PPF = PPFD × Area × 4π × distribution factor / efficiency
  return (targetPPFD * coverageArea * 4 * Math.PI * distributionFactor) / fixtureEfficiency;
}

/**
 * Calculate optimal fixture spacing for uniform coverage
 * Based on Dialux/AGi32 photometric principles
 */
export function calculateOptimalSpacing(
  fixtureHeight: number,
  beamAngle: number,
  uniformityTarget: number = 0.7
): number {
  // Calculate beam radius at canopy level
  const beamRadius = fixtureHeight * Math.tan((beamAngle / 2) * (Math.PI / 180));
  
  // Spacing factor based on uniformity requirement
  // Higher uniformity requires more overlap
  const spacingFactor = uniformityTarget > 0.8 ? 1.2 : uniformityTarget > 0.7 ? 1.5 : 1.8;
  
  return beamRadius * 2 / spacingFactor;
}

/**
 * Calculate heat load from LED fixtures
 * ~3.41 BTU/hr per watt (assuming 40% photon efficiency)
 */
export function calculateHeatLoad(totalWattage: number): {
  btuPerHour: number;
  tons: number;
} {
  const photonEfficiency = 0.4; // 40% of power becomes PAR
  const heatPercentage = 1 - photonEfficiency;
  const btuPerHour = totalWattage * heatPercentage * 3.41;
  const tons = btuPerHour / 12000; // 12,000 BTU/hr = 1 ton
  
  return { btuPerHour, tons };
}

/**
 * Validate PPFD for crop type based on scientific literature
 */
export function validatePPFDForCrop(
  cropType: string,
  ppfd: number
): {
  isValid: boolean;
  message: string;
  optimal: { min: number; max: number };
} {
  const cropRequirements: Record<string, { min: number; max: number; optimal: number }> = {
    microgreens: { min: 100, max: 200, optimal: 150 },
    lettuce: { min: 150, max: 300, optimal: 200 },
    herbs: { min: 250, max: 350, optimal: 300 },
    'cannabis-veg': { min: 400, max: 600, optimal: 500 },
    'cannabis-flower': { min: 700, max: 1000, optimal: 850 },
    tomatoes: { min: 400, max: 600, optimal: 500 },
    strawberries: { min: 300, max: 400, optimal: 350 }
  };

  const req = cropRequirements[cropType] || cropRequirements.lettuce;
  
  if (ppfd < req.min) {
    return {
      isValid: false,
      message: `PPFD too low. ${cropType} requires minimum ${req.min} μmol·m⁻²·s⁻¹`,
      optimal: req
    };
  }
  
  if (ppfd > req.max) {
    return {
      isValid: false,
      message: `PPFD too high. ${cropType} maximum is ${req.max} μmol·m⁻²·s⁻¹ to prevent photoinhibition`,
      optimal: req
    };
  }
  
  return {
    isValid: true,
    message: `PPFD is within optimal range for ${cropType}`,
    optimal: req
  };
}