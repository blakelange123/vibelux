/**
 * Enhanced Canopy Penetration Calculations
 * Implements Beer-Lambert law and advanced light attenuation modeling
 */

import { Fixture } from '@/components/designer/context/types';

export interface CanopyProperties {
  species: string;
  leafAreaIndex: number; // LAI - m²/m²
  leafAngleDistribution: 'spherical' | 'planophile' | 'erectophile' | 'plagiophile' | 'extremophile';
  leafOpticalProperties: {
    absorptance: number; // 0-1, typically 0.85-0.95 for PAR
    reflectance: number; // 0-1, typically 0.05-0.10 for PAR
    transmittance: number; // 0-1, typically 0.05-0.10 for PAR
  };
  canopyHeight: number; // meters
  plantDensity: number; // plants per m²
  averageLeafThickness: number; // mm
}

export interface LightPenetrationResult {
  depthProfile: Array<{
    depth: number; // meters from canopy top
    ppfd: number; // µmol/m²/s
    attenuationFactor: number; // 0-1
    scatteredLight: number; // µmol/m²/s from scattering
    directLight: number; // µmol/m²/s direct beam
  }>;
  totalInterception: number; // fraction of light intercepted
  bottomCanopyPPFD: number; // µmol/m²/s at canopy bottom
  averageCanopyPPFD: number; // µmol/m²/s average through canopy
  lightUseEfficiency: number; // 0-1, fraction of useful light
}

export interface WavelengthSpecificProperties {
  wavelength: number; // nm
  extinctionCoefficient: number; // m²/m² LAI
  scatteringCoefficient: number; // m²/m² LAI
  absorptionCoefficient: number; // m²/m² LAI
}

// Species-specific canopy properties database
export const CANOPY_PROPERTIES_DATABASE: Record<string, CanopyProperties> = {
  lettuce: {
    species: 'lettuce',
    leafAreaIndex: 3.5,
    leafAngleDistribution: 'planophile',
    leafOpticalProperties: {
      absorptance: 0.88,
      reflectance: 0.08,
      transmittance: 0.04
    },
    canopyHeight: 0.15,
    plantDensity: 16,
    averageLeafThickness: 0.3
  },
  tomato: {
    species: 'tomato',
    leafAreaIndex: 4.2,
    leafAngleDistribution: 'plagiophile',
    leafOpticalProperties: {
      absorptance: 0.90,
      reflectance: 0.07,
      transmittance: 0.03
    },
    canopyHeight: 2.0,
    plantDensity: 2.5,
    averageLeafThickness: 0.4
  },
  cannabis: {
    species: 'cannabis',
    leafAreaIndex: 6.8,
    leafAngleDistribution: 'erectophile',
    leafOpticalProperties: {
      absorptance: 0.92,
      reflectance: 0.06,
      transmittance: 0.02
    },
    canopyHeight: 1.5,
    plantDensity: 1.0,
    averageLeafThickness: 0.5
  },
  basil: {
    species: 'basil',
    leafAreaIndex: 2.8,
    leafAngleDistribution: 'spherical',
    leafOpticalProperties: {
      absorptance: 0.85,
      reflectance: 0.10,
      transmittance: 0.05
    },
    canopyHeight: 0.25,
    plantDensity: 9,
    averageLeafThickness: 0.2
  },
  strawberry: {
    species: 'strawberry',
    leafAreaIndex: 4.0,
    leafAngleDistribution: 'planophile',
    leafOpticalProperties: {
      absorptance: 0.87,
      reflectance: 0.09,
      transmittance: 0.04
    },
    canopyHeight: 0.20,
    plantDensity: 6,
    averageLeafThickness: 0.3
  }
};

// Wavelength-specific extinction coefficients for PAR region
export const WAVELENGTH_EXTINCTION_COEFFICIENTS: WavelengthSpecificProperties[] = [
  // Blue region (higher extinction due to chlorophyll absorption)
  { wavelength: 450, extinctionCoefficient: 0.95, scatteringCoefficient: 0.25, absorptionCoefficient: 0.70 },
  { wavelength: 470, extinctionCoefficient: 0.85, scatteringCoefficient: 0.20, absorptionCoefficient: 0.65 },
  // Green region (lower extinction, higher scattering)
  { wavelength: 520, extinctionCoefficient: 0.45, scatteringCoefficient: 0.35, absorptionCoefficient: 0.10 },
  { wavelength: 550, extinctionCoefficient: 0.40, scatteringCoefficient: 0.30, absorptionCoefficient: 0.10 },
  // Red region (high extinction due to chlorophyll absorption)
  { wavelength: 660, extinctionCoefficient: 0.90, scatteringCoefficient: 0.15, absorptionCoefficient: 0.75 },
  { wavelength: 680, extinctionCoefficient: 0.85, scatteringCoefficient: 0.10, absorptionCoefficient: 0.75 },
  // Far-red region (lower extinction)
  { wavelength: 730, extinctionCoefficient: 0.25, scatteringCoefficient: 0.15, absorptionCoefficient: 0.10 }
];

/**
 * Calculate extinction coefficient based on leaf angle distribution
 */
export function calculateExtinctionCoefficient(
  leafAngleDistribution: CanopyProperties['leafAngleDistribution'],
  solarElevation: number = 90 // degrees, 90 = overhead
): number {
  const solarElevationRad = (solarElevation * Math.PI) / 180;
  
  switch (leafAngleDistribution) {
    case 'spherical':
      return 0.5; // Uniform distribution
    case 'planophile': // Horizontal leaves
      return 1.0 / Math.sin(solarElevationRad);
    case 'erectophile': // Vertical leaves
      return Math.cos(solarElevationRad);
    case 'plagiophile': // 45-degree leaves
      return 0.75;
    case 'extremophile': // Extreme angles
      return 0.9;
    default:
      return 0.5;
  }
}

/**
 * Beer-Lambert law implementation for light attenuation
 */
export function calculateLightAttenuation(
  incidentPPFD: number,
  leafAreaIndex: number,
  extinctionCoefficient: number,
  depth: number // cumulative LAI from top
): number {
  // Beer-Lambert law: I = I₀ * e^(-k * LAI * depth)
  const cumulativeLAI = leafAreaIndex * (depth / 1.0); // Assuming 1m reference depth
  return incidentPPFD * Math.exp(-extinctionCoefficient * cumulativeLAI);
}

/**
 * Calculate multiple scattering within canopy
 */
export function calculateMultipleScattering(
  directLight: number,
  scatteringCoefficient: number,
  canopyDepth: number,
  numScatteringEvents: number = 3
): number {
  let scatteredLight = 0;
  let currentLight = directLight;
  
  for (let i = 0; i < numScatteringEvents; i++) {
    const scatteredContribution = currentLight * scatteringCoefficient * 
                                (1 - Math.exp(-canopyDepth * 0.1));
    scatteredLight += scatteredContribution;
    currentLight *= (1 - scatteringCoefficient);
  }
  
  return scatteredLight;
}

/**
 * Enhanced canopy penetration calculation with wavelength-specific modeling
 */
export function calculateEnhancedCanopyPenetration(
  fixtures: Fixture[],
  canopyProperties: CanopyProperties,
  position: { x: number; y: number },
  resolution: number = 50, // depth resolution steps
  wavelengthWeighting: boolean = true
): LightPenetrationResult {
  const depthProfile: LightPenetrationResult['depthProfile'] = [];
  const depthStep = canopyProperties.canopyHeight / resolution;
  
  // Calculate incident PPFD at canopy top from all fixtures
  let totalIncidentPPFD = 0;
  
  fixtures.forEach(fixture => {
    if (!fixture.enabled) return;
    
    const distance = Math.sqrt(
      Math.pow(position.x - fixture.x, 2) + 
      Math.pow(position.y - fixture.y, 2) + 
      Math.pow(0 - fixture.z, 2)
    );
    
    // Inverse square law with fixture-specific parameters
    const fixtureContribution = (fixture.model?.ppf || 1000) / (4 * Math.PI * Math.max(distance, 0.1) ** 2);
    totalIncidentPPFD += fixtureContribution;
  });
  
  // Base extinction coefficient
  const baseExtinctionCoeff = calculateExtinctionCoefficient(
    canopyProperties.leafAngleDistribution,
    90 // Assume overhead lighting
  );
  
  let totalInterception = 0;
  let cumulativeAbsorption = 0;
  
  // Calculate light penetration at each depth
  for (let i = 0; i <= resolution; i++) {
    const depth = i * depthStep;
    const relativeDepth = depth / canopyProperties.canopyHeight;
    
    let averageAttenuationFactor = 0;
    let averageDirectLight = 0;
    let averageScatteredLight = 0;
    
    if (wavelengthWeighting) {
      // Wavelength-specific calculations
      let totalWeight = 0;
      
      WAVELENGTH_EXTINCTION_COEFFICIENTS.forEach(wlData => {
        const weight = 1.0; // Could be weighted by fixture spectrum
        const effectiveExtinction = baseExtinctionCoeff * wlData.extinctionCoefficient;
        
        const directLight = calculateLightAttenuation(
          totalIncidentPPFD,
          canopyProperties.leafAreaIndex,
          effectiveExtinction,
          depth
        );
        
        const scatteredLight = calculateMultipleScattering(
          directLight,
          wlData.scatteringCoefficient,
          depth,
          3
        );
        
        averageDirectLight += directLight * weight;
        averageScatteredLight += scatteredLight * weight;
        totalWeight += weight;
      });
      
      averageDirectLight /= totalWeight;
      averageScatteredLight /= totalWeight;
    } else {
      // Simplified calculation using average properties
      averageDirectLight = calculateLightAttenuation(
        totalIncidentPPFD,
        canopyProperties.leafAreaIndex,
        baseExtinctionCoeff,
        depth
      );
      
      averageScatteredLight = calculateMultipleScattering(
        averageDirectLight,
        0.2, // Average scattering coefficient
        depth
      );
    }
    
    const totalPPFD = averageDirectLight + averageScatteredLight;
    averageAttenuationFactor = totalPPFD / Math.max(totalIncidentPPFD, 1);
    
    depthProfile.push({
      depth,
      ppfd: totalPPFD,
      attenuationFactor: averageAttenuationFactor,
      scatteredLight: averageScatteredLight,
      directLight: averageDirectLight
    });
    
    // Calculate interception for this layer
    if (i > 0) {
      const layerInterception = (depthProfile[i-1].ppfd - totalPPFD) / Math.max(totalIncidentPPFD, 1);
      totalInterception += layerInterception;
      cumulativeAbsorption += layerInterception * canopyProperties.leafOpticalProperties.absorptance;
    }
  }
  
  // Calculate summary statistics
  const bottomCanopyPPFD = depthProfile[depthProfile.length - 1]?.ppfd || 0;
  const averageCanopyPPFD = depthProfile.reduce((sum, point) => sum + point.ppfd, 0) / depthProfile.length;
  
  // Light use efficiency based on how much light is actually absorbed vs transmitted/reflected
  const lightUseEfficiency = cumulativeAbsorption / Math.max(totalInterception, 0.001);
  
  return {
    depthProfile,
    totalInterception: Math.min(totalInterception, 1.0),
    bottomCanopyPPFD,
    averageCanopyPPFD,
    lightUseEfficiency
  };
}

/**
 * Calculate optimal canopy management recommendations
 */
export function calculateCanopyOptimizationRecommendations(
  penetrationResult: LightPenetrationResult,
  canopyProperties: CanopyProperties,
  targetBottomCanopyPPFD: number = 50 // µmol/m²/s minimum
): {
  recommendations: string[];
  optimalLAI: number;
  suggestedActions: Array<{
    action: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
  }>;
} {
  const recommendations: string[] = [];
  const suggestedActions: Array<{ action: string; impact: string; priority: 'high' | 'medium' | 'low' }> = [];
  
  // Analyze light penetration efficiency
  if (penetrationResult.bottomCanopyPPFD < targetBottomCanopyPPFD) {
    recommendations.push(
      `Bottom canopy PPFD (${penetrationResult.bottomCanopyPPFD.toFixed(0)} µmol/m²/s) below target (${targetBottomCanopyPPFD} µmol/m²/s)`
    );
    
    if (canopyProperties.leafAreaIndex > 5.0) {
      suggestedActions.push({
        action: 'Selective leaf removal or pruning',
        impact: `Could increase bottom PPFD by 20-40%`,
        priority: 'high'
      });
    }
    
    suggestedActions.push({
      action: 'Add inter-canopy or under-canopy lighting',
      impact: 'Direct supplementation of lower canopy layers',
      priority: 'medium'
    });
  }
  
  // Analyze light use efficiency
  if (penetrationResult.lightUseEfficiency < 0.7) {
    recommendations.push(
      `Light use efficiency (${(penetrationResult.lightUseEfficiency * 100).toFixed(0)}%) could be improved`
    );
    
    suggestedActions.push({
      action: 'Optimize leaf angle distribution through training',
      impact: 'Improve light penetration by 10-25%',
      priority: 'medium'
    });
  }
  
  // Calculate optimal LAI
  const currentLAI = canopyProperties.leafAreaIndex;
  let optimalLAI = currentLAI;
  
  if (penetrationResult.totalInterception > 0.95) {
    // Too much canopy, reducing efficiency
    optimalLAI = currentLAI * 0.85;
    suggestedActions.push({
      action: 'Reduce plant density or canopy thickness',
      impact: `Target LAI of ${optimalLAI.toFixed(1)} for better light distribution`,
      priority: 'low'
    });
  } else if (penetrationResult.totalInterception < 0.85) {
    // Could support more canopy
    optimalLAI = currentLAI * 1.15;
    recommendations.push('Canopy could support additional leaf area for increased productivity');
  }
  
  return {
    recommendations,
    optimalLAI,
    suggestedActions
  };
}

/**
 * Real-time canopy penetration monitoring
 */
export class CanopyPenetrationMonitor {
  private penetrationHistory: Array<{
    timestamp: Date;
    result: LightPenetrationResult;
  }> = [];
  
  constructor(
    private canopyProperties: CanopyProperties,
    private updateInterval: number = 60000 // 1 minute
  ) {}
  
  addMeasurement(fixtures: Fixture[], position: { x: number; y: number }): LightPenetrationResult {
    const result = calculateEnhancedCanopyPenetration(fixtures, this.canopyProperties, position);
    
    this.penetrationHistory.push({
      timestamp: new Date(),
      result
    });
    
    // Keep only last 24 hours of data
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.penetrationHistory = this.penetrationHistory.filter(h => h.timestamp > cutoff);
    
    return result;
  }
  
  getTrends(): {
    bottomCanopyTrend: 'increasing' | 'decreasing' | 'stable';
    averageChange: number;
    recommendations: string[];
  } {
    if (this.penetrationHistory.length < 2) {
      return {
        bottomCanopyTrend: 'stable',
        averageChange: 0,
        recommendations: ['Insufficient data for trend analysis']
      };
    }
    
    const recent = this.penetrationHistory.slice(-10);
    const changes = recent.slice(1).map((curr, i) => 
      curr.result.bottomCanopyPPFD - recent[i].result.bottomCanopyPPFD
    );
    
    const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    
    let bottomCanopyTrend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(averageChange) < 1) {
      bottomCanopyTrend = 'stable';
    } else if (averageChange > 0) {
      bottomCanopyTrend = 'increasing';
    } else {
      bottomCanopyTrend = 'decreasing';
    }
    
    const recommendations: string[] = [];
    if (bottomCanopyTrend === 'decreasing' && Math.abs(averageChange) > 5) {
      recommendations.push('Bottom canopy light levels declining - check for excessive canopy growth');
    }
    
    return {
      bottomCanopyTrend,
      averageChange,
      recommendations
    };
  }
}