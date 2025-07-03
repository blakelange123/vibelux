/**
 * Advanced Uniformity Analysis Module
 * Based on IES standards and professional lighting metrics
 */

export interface UniformityMetrics {
  iesUniformity: number;          // Min/Average ratio (IES standard)
  cvUniformity: number;           // 1 - Coefficient of Variation
  minMaxRatio: number;            // Min/Max ratio
  uniformityGrade: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable';
  coefficientOfVariation: number; // CV as percentage
}

export interface HotSpotAnalysis {
  moderateExcess: {
    areaPercent: number;
    maxPPFDInZone: number | null;
    meanPPFDInZone: number | null;
    locations: { x: number; y: number }[];
  };
  severeExcess: {
    areaPercent: number;
    maxPPFDInZone: number | null;
    meanPPFDInZone: number | null;
    locations: { x: number; y: number }[];
  };
}

export interface DeficiencyZones {
  severeDeficiency: {
    areaPercent: number;
    minPPFDInZone: number | null;
    meanPPFDInZone: number | null;
    locations: { x: number; y: number }[];
  };
  moderateDeficiency: {
    areaPercent: number;
    minPPFDInZone: number | null;
    meanPPFDInZone: number | null;
    locations: { x: number; y: number }[];
  };
}

export interface SpatialDistribution {
  edgeEffects: {
    meanEdgePPFD: number;
    meanCenterPPFD: number;
    edgeToCenterRatio: number;
  };
  centerUniformity: {
    centerMeanPPFD: number;
    centerUniformity: number;
    centerCV: number;
  };
  gradientAnalysis: {
    maxGradient: number;
    meanGradient: number;
    gradientHotspots: number;
  };
}

export interface UniformityRecommendation {
  type: 'critical' | 'warning' | 'info' | 'success';
  category: string;
  message: string;
  action: string;
}

interface CropThresholds {
  minPPFD: number;
  optimalMinPPFD: number;
  optimalMaxPPFD: number;
  maxPPFD: number;
}

export class UniformityAnalyzer {
  private deficiencyThresholds: { [key: string]: CropThresholds } = {
    cannabis_vegetative: {
      minPPFD: 300,
      optimalMinPPFD: 400,
      optimalMaxPPFD: 600,
      maxPPFD: 800
    },
    cannabis_flowering: {
      minPPFD: 500,
      optimalMinPPFD: 600,
      optimalMaxPPFD: 900,
      maxPPFD: 1000
    },
    lettuce: {
      minPPFD: 100,
      optimalMinPPFD: 150,
      optimalMaxPPFD: 300,
      maxPPFD: 400
    },
    tomatoes: {
      minPPFD: 200,
      optimalMinPPFD: 300,
      optimalMaxPPFD: 500,
      maxPPFD: 700
    },
    herbs: {
      minPPFD: 150,
      optimalMinPPFD: 200,
      optimalMaxPPFD: 400,
      maxPPFD: 500
    }
  };

  /**
   * Analyze PPFD uniformity using multiple metrics
   */
  analyzeUniformity(ppfdGrid: number[][]): UniformityMetrics {
    const flatGrid = ppfdGrid.flat();
    const meanPPFD = this.calculateMean(flatGrid);
    const minPPFD = Math.min(...flatGrid);
    const maxPPFD = Math.max(...flatGrid);
    const stdDev = this.calculateStandardDeviation(flatGrid, meanPPFD);
    
    // Calculate uniformity metrics
    const minMaxRatio = maxPPFD > 0 ? minPPFD / maxPPFD : 0;
    const cvUniformity = meanPPFD > 0 ? 1 - (stdDev / meanPPFD) : 0;
    const iesUniformity = meanPPFD > 0 ? minPPFD / meanPPFD : 0;
    const coefficientOfVariation = meanPPFD > 0 ? (stdDev / meanPPFD) * 100 : 0;
    
    // Calculate uniformity grade
    const uniformityGrade = this.getUniformityGrade(iesUniformity);
    
    return {
      iesUniformity,
      cvUniformity,
      minMaxRatio,
      uniformityGrade,
      coefficientOfVariation
    };
  }

  /**
   * Detect areas with excessive PPFD that could cause stress
   */
  detectHotSpots(ppfdGrid: number[][], cropType: string): HotSpotAnalysis {
    const thresholds = this.deficiencyThresholds[cropType] || this.deficiencyThresholds.cannabis_vegetative;
    const maxThreshold = thresholds.maxPPFD;
    
    const moderateExcessLocations: { x: number; y: number }[] = [];
    const severeExcessLocations: { x: number; y: number }[] = [];
    const moderateExcessValues: number[] = [];
    const severeExcessValues: number[] = [];
    
    const totalPoints = ppfdGrid.length * ppfdGrid[0].length;
    
    ppfdGrid.forEach((row, y) => {
      row.forEach((ppfd, x) => {
        if (ppfd > maxThreshold && ppfd <= maxThreshold * 1.2) {
          moderateExcessLocations.push({ x, y });
          moderateExcessValues.push(ppfd);
        } else if (ppfd > maxThreshold * 1.2) {
          severeExcessLocations.push({ x, y });
          severeExcessValues.push(ppfd);
        }
      });
    });
    
    return {
      moderateExcess: {
        areaPercent: (moderateExcessLocations.length / totalPoints) * 100,
        maxPPFDInZone: moderateExcessValues.length > 0 ? Math.max(...moderateExcessValues) : null,
        meanPPFDInZone: moderateExcessValues.length > 0 ? this.calculateMean(moderateExcessValues) : null,
        locations: moderateExcessLocations
      },
      severeExcess: {
        areaPercent: (severeExcessLocations.length / totalPoints) * 100,
        maxPPFDInZone: severeExcessValues.length > 0 ? Math.max(...severeExcessValues) : null,
        meanPPFDInZone: severeExcessValues.length > 0 ? this.calculateMean(severeExcessValues) : null,
        locations: severeExcessLocations
      }
    };
  }

  /**
   * Identify deficiency zones where PPFD is below optimal
   */
  identifyDeficiencyZones(ppfdGrid: number[][], cropType: string): DeficiencyZones {
    const thresholds = this.deficiencyThresholds[cropType] || this.deficiencyThresholds.cannabis_vegetative;
    
    const severeDeficiencyLocations: { x: number; y: number }[] = [];
    const moderateDeficiencyLocations: { x: number; y: number }[] = [];
    const severeDeficiencyValues: number[] = [];
    const moderateDeficiencyValues: number[] = [];
    
    const totalPoints = ppfdGrid.length * ppfdGrid[0].length;
    
    ppfdGrid.forEach((row, y) => {
      row.forEach((ppfd, x) => {
        if (ppfd < thresholds.minPPFD) {
          severeDeficiencyLocations.push({ x, y });
          severeDeficiencyValues.push(ppfd);
        } else if (ppfd < thresholds.optimalMinPPFD) {
          moderateDeficiencyLocations.push({ x, y });
          moderateDeficiencyValues.push(ppfd);
        }
      });
    });
    
    return {
      severeDeficiency: {
        areaPercent: (severeDeficiencyLocations.length / totalPoints) * 100,
        minPPFDInZone: severeDeficiencyValues.length > 0 ? Math.min(...severeDeficiencyValues) : null,
        meanPPFDInZone: severeDeficiencyValues.length > 0 ? this.calculateMean(severeDeficiencyValues) : null,
        locations: severeDeficiencyLocations
      },
      moderateDeficiency: {
        areaPercent: (moderateDeficiencyLocations.length / totalPoints) * 100,
        minPPFDInZone: moderateDeficiencyValues.length > 0 ? Math.min(...moderateDeficiencyValues) : null,
        meanPPFDInZone: moderateDeficiencyValues.length > 0 ? this.calculateMean(moderateDeficiencyValues) : null,
        locations: moderateDeficiencyLocations
      }
    };
  }

  /**
   * Analyze spatial distribution patterns
   */
  analyzeSpatialDistribution(ppfdGrid: number[][], marginPercent: number = 10): SpatialDistribution {
    const height = ppfdGrid.length;
    const width = ppfdGrid[0].length;
    
    // Analyze edge effects
    const edgeEffects = this.identifyEdgeZones(ppfdGrid, marginPercent);
    
    // Analyze center uniformity
    const centerUniformity = this.identifyCenterZones(ppfdGrid, 60);
    
    // Analyze gradients
    const gradientAnalysis = this.analyzeGradients(ppfdGrid);
    
    return {
      edgeEffects,
      centerUniformity,
      gradientAnalysis
    };
  }

  /**
   * Generate actionable recommendations based on analysis
   */
  generateRecommendations(
    uniformityMetrics: UniformityMetrics,
    deficiencyZones: DeficiencyZones,
    hotSpots: HotSpotAnalysis,
    spatialDistribution: SpatialDistribution
  ): UniformityRecommendation[] {
    const recommendations: UniformityRecommendation[] = [];
    
    // Deficiency recommendations
    if (deficiencyZones.severeDeficiency.areaPercent > 5) {
      recommendations.push({
        type: 'critical',
        category: 'insufficient_light',
        message: `🚨 Critical: ${deficiencyZones.severeDeficiency.areaPercent.toFixed(1)}% of area has severe PPFD deficiency`,
        action: 'Add fixtures or increase fixture power in deficient zones'
      });
    }
    
    if (deficiencyZones.moderateDeficiency.areaPercent > 10) {
      recommendations.push({
        type: 'warning',
        category: 'suboptimal_light',
        message: `⚠️ Warning: ${deficiencyZones.moderateDeficiency.areaPercent.toFixed(1)}% of area below optimal PPFD`,
        action: 'Consider redistributing fixtures or adding supplemental lighting'
      });
    }
    
    // Uniformity recommendations
    if (uniformityMetrics.iesUniformity < 0.7) {
      recommendations.push({
        type: 'warning',
        category: 'poor_uniformity',
        message: `⚠️ Poor uniformity (IES: ${uniformityMetrics.iesUniformity.toFixed(2)})`,
        action: 'Adjust fixture spacing or add edge lighting to improve uniformity'
      });
    }
    
    // Hot spot recommendations
    if (hotSpots.severeExcess.areaPercent > 2) {
      recommendations.push({
        type: 'warning',
        category: 'excessive_light',
        message: `⚠️ Hot spots detected: ${hotSpots.severeExcess.areaPercent.toFixed(1)}% area with excessive PPFD`,
        action: 'Reduce fixture intensity or increase mounting height in bright zones'
      });
    }
    
    // Edge effect recommendations
    if (spatialDistribution.edgeEffects.edgeToCenterRatio < 0.7) {
      recommendations.push({
        type: 'info',
        category: 'edge_effects',
        message: `Edge lighting is ${((1 - spatialDistribution.edgeEffects.edgeToCenterRatio) * 100).toFixed(0)}% lower than center`,
        action: 'Add perimeter fixtures or adjust beam angles for better edge coverage'
      });
    }
    
    // Success messages
    if (uniformityMetrics.uniformityGrade === 'excellent') {
      recommendations.push({
        type: 'success',
        category: 'excellent_uniformity',
        message: '✅ Excellent uniformity achieved',
        action: 'Maintain current fixture configuration'
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate overall severity score (0-100)
   */
  calculateSeverityScore(
    uniformityMetrics: UniformityMetrics,
    deficiencyZones: DeficiencyZones,
    hotSpots: HotSpotAnalysis
  ): number {
    let score = 0;
    
    // Severe deficiency penalty
    score += deficiencyZones.severeDeficiency.areaPercent * 2;
    
    // Moderate deficiency penalty
    score += deficiencyZones.moderateDeficiency.areaPercent * 1;
    
    // Uniformity penalty
    const uniformityPenalty = Math.max(0, (0.8 - uniformityMetrics.iesUniformity) * 50);
    score += uniformityPenalty;
    
    // Hot spot penalty
    score += hotSpots.severeExcess.areaPercent * 1.5;
    
    return Math.min(100, score);
  }

  private getUniformityGrade(iesUniformity: number): UniformityMetrics['uniformityGrade'] {
    if (iesUniformity >= 0.9) return 'excellent';
    else if (iesUniformity >= 0.8) return 'good';
    else if (iesUniformity >= 0.7) return 'acceptable';
    else if (iesUniformity >= 0.6) return 'poor';
    else return 'unacceptable';
  }

  private identifyEdgeZones(ppfdGrid: number[][], marginPercent: number) {
    const height = ppfdGrid.length;
    const width = ppfdGrid[0].length;
    const marginH = Math.floor(height * marginPercent / 100);
    const marginW = Math.floor(width * marginPercent / 100);
    
    const edgeValues: number[] = [];
    const centerValues: number[] = [];
    
    ppfdGrid.forEach((row, y) => {
      row.forEach((ppfd, x) => {
        if (y < marginH || y >= height - marginH || x < marginW || x >= width - marginW) {
          edgeValues.push(ppfd);
        } else {
          centerValues.push(ppfd);
        }
      });
    });
    
    const meanEdgePPFD = edgeValues.length > 0 ? this.calculateMean(edgeValues) : 0;
    const meanCenterPPFD = centerValues.length > 0 ? this.calculateMean(centerValues) : 0;
    
    return {
      meanEdgePPFD,
      meanCenterPPFD,
      edgeToCenterRatio: meanCenterPPFD > 0 ? meanEdgePPFD / meanCenterPPFD : 0
    };
  }

  private identifyCenterZones(ppfdGrid: number[][], centerPercent: number) {
    const height = ppfdGrid.length;
    const width = ppfdGrid[0].length;
    const centerH = Math.floor(height * centerPercent / 100);
    const centerW = Math.floor(width * centerPercent / 100);
    
    const startH = Math.floor((height - centerH) / 2);
    const endH = startH + centerH;
    const startW = Math.floor((width - centerW) / 2);
    const endW = startW + centerW;
    
    const centerValues: number[] = [];
    
    for (let y = startH; y < endH; y++) {
      for (let x = startW; x < endW; x++) {
        if (y >= 0 && y < height && x >= 0 && x < width) {
          centerValues.push(ppfdGrid[y][x]);
        }
      }
    }
    
    const centerMeanPPFD = centerValues.length > 0 ? this.calculateMean(centerValues) : 0;
    const centerMinPPFD = centerValues.length > 0 ? Math.min(...centerValues) : 0;
    const centerStdDev = centerValues.length > 0 ? this.calculateStandardDeviation(centerValues, centerMeanPPFD) : 0;
    
    return {
      centerMeanPPFD,
      centerUniformity: centerMeanPPFD > 0 ? centerMinPPFD / centerMeanPPFD : 0,
      centerCV: centerMeanPPFD > 0 ? (centerStdDev / centerMeanPPFD) * 100 : 0
    };
  }

  private analyzeGradients(ppfdGrid: number[][]) {
    const gradients: number[] = [];
    const height = ppfdGrid.length;
    const width = ppfdGrid[0].length;
    
    // Calculate gradients in both directions
    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const gradX = Math.abs(ppfdGrid[y][x + 1] - ppfdGrid[y][x]);
        const gradY = Math.abs(ppfdGrid[y + 1][x] - ppfdGrid[y][x]);
        const gradientMagnitude = Math.sqrt(gradX * gradX + gradY * gradY);
        gradients.push(gradientMagnitude);
      }
    }
    
    const maxGradient = gradients.length > 0 ? Math.max(...gradients) : 0;
    const meanGradient = gradients.length > 0 ? this.calculateMean(gradients) : 0;
    const threshold95 = this.calculatePercentile(gradients, 95);
    const gradientHotspots = gradients.filter(g => g > threshold95).length;
    
    return {
      maxGradient,
      meanGradient,
      gradientHotspots
    };
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = this.calculateMean(squaredDiffs);
    return Math.sqrt(variance);
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }
}

// Export singleton instance
export const uniformityAnalyzer = new UniformityAnalyzer();