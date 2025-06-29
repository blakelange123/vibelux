/**
 * Tomato-Specific IPM Thresholds and Pest Management
 * Based on Advanced Dutch Research greenhouse production standards
 */

export interface IPMThreshold {
  pestName: string;
  scientificName?: string;
  thresholdValue: number;
  thresholdUnit: string;
  monitoringMethod: string;
  actionTrigger: string;
  controlMeasures: string[];
  targetLevel: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  seasonalAdjustments?: {
    winter?: Partial<IPMThreshold>;
    summer?: Partial<IPMThreshold>;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  economicThreshold: number;
  actionThreshold: number;
}

export interface IPMScoutingRecord {
  date: Date;
  pestType: string;
  count: number;
  location: string;
  plantsScouted: number;
  scoutingMethod: string;
  severity: 'none' | 'light' | 'moderate' | 'heavy';
  notes?: string;
  actionTaken?: string;
  followUpRequired: boolean;
}

export interface IPMAlert {
  id: string;
  pestType: string;
  alertLevel: 'watch' | 'warning' | 'action' | 'emergency';
  currentCount: number;
  thresholdExceeded: number;
  recommendedActions: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  resolved: boolean;
}

/**
 * Advanced Dutch Research IPM Thresholds for Tomato Production
 */
export const TOMATO_IPM_THRESHOLDS: Record<string, IPMThreshold> = {
  whitefly: {
    pestName: 'White Fly',
    scientificName: 'Bemisia tabaci',
    thresholdValue: 10,
    thresholdUnit: 'per sticky card per week',
    monitoringMethod: 'Yellow sticky cards',
    actionTrigger: 'When 10 whitefly per sticky card per week are counted',
    controlMeasures: [
      'Trigger spray program immediately',
      'Increase monitoring frequency to twice weekly',
      'Check for resistant populations',
      'Implement biological controls (Encarsia formosa)',
      'Review environmental conditions (humidity, temperature)'
    ],
    targetLevel: 'Below 10 whitefly per sticky card per week',
    frequency: 'weekly',
    severity: 'high',
    economicThreshold: 15,
    actionThreshold: 10
  },
  
  thrips: {
    pestName: 'Thrips',
    scientificName: 'Frankliniella occidentalis',
    thresholdValue: 6,
    thresholdUnit: 'per sticky card per week',
    monitoringMethod: 'Blue sticky cards',
    actionTrigger: 'When 6 thrips per sticky card per week are counted',
    controlMeasures: [
      'Trigger spray program immediately',
      'Target: Less than 1000 spotted wilt plants per GH per year',
      'Implement predatory mites (Amblyseius cucumeris)',
      'Check for TSWV symptoms',
      'Increase ventilation to reduce humidity'
    ],
    targetLevel: 'Below 6 thrips per sticky card per week',
    frequency: 'weekly',
    severity: 'critical',
    economicThreshold: 10,
    actionThreshold: 6
  },
  
  russetMite: {
    pestName: 'Russet Mite',
    scientificName: 'Aculops lycopersici',
    thresholdValue: 0,
    thresholdUnit: 'any presence',
    monitoringMethod: 'Visual scouting with magnifying glass',
    actionTrigger: 'When any russet mites are found',
    controlMeasures: [
      'Trigger spray program immediately - zero tolerance',
      'Target: Less than 100 plants pulled out per GH per year',
      'Use sulfur-based miticides',
      'Increase humidity to 70-80%',
      'Remove heavily infested plants',
      'Weekly monitoring until elimination'
    ],
    targetLevel: 'Zero tolerance - no russet mites',
    frequency: 'weekly',
    severity: 'critical',
    economicThreshold: 1,
    actionThreshold: 0
  },
  
  spiderMite: {
    pestName: 'Spider Mite',
    scientificName: 'Tetranychus urticae',
    thresholdValue: 0,
    thresholdUnit: 'any presence',
    monitoringMethod: 'Visual scouting for webbing and stippling',
    actionTrigger: 'When any spider mites are found',
    controlMeasures: [
      'Trigger spray program immediately',
      'Target: Less than 100 plants pulled out per GH per year',
      'Implement predatory mites (Phytoseiulus persimilis)',
      'Increase humidity above 60%',
      'Remove heavily infested leaves',
      'Check for hot spots and improve air circulation'
    ],
    targetLevel: 'Less than 10 plants affected per week',
    frequency: 'weekly',
    severity: 'high',
    economicThreshold: 5,
    actionThreshold: 0
  },
  
  botrytis: {
    pestName: 'Botrytis',
    scientificName: 'Botrytis cinerea',
    thresholdValue: 10,
    thresholdUnit: 'infected plants per week',
    monitoringMethod: 'Visual scouting for gray mold on stems and fruit',
    actionTrigger: 'When 10 botrytis infections are found in one week',
    controlMeasures: [
      'Trigger spray program immediately',
      'Target: Less than 1000 plants pulled out per GH per year',
      'Improve ventilation and reduce humidity',
      'Remove infected plant material immediately',
      'Apply fungicide spray',
      'Maintain humidity deficit at 5 g/m³'
    ],
    targetLevel: 'Less than 10 plants affected per week',
    frequency: 'weekly',
    severity: 'high',
    economicThreshold: 20,
    actionThreshold: 10
  },
  
  powderyMildew: {
    pestName: 'Powdery Mildew',
    scientificName: 'Oidium neolycopersici',
    thresholdValue: 0,
    thresholdUnit: 'any presence',
    monitoringMethod: 'Visual scouting for white powdery growth on leaves',
    actionTrigger: 'When any powdery mildew is found',
    controlMeasures: [
      'Trigger spray program immediately - zero tolerance',
      'Target: Less than 10,000 kg degraded to seconds or waste',
      'Apply sulfur or bicarbonate sprays',
      'Improve air circulation',
      'Reduce relative humidity below 85%',
      'Remove infected leaves immediately'
    ],
    targetLevel: 'Zero tolerance - no powdery mildew',
    frequency: 'weekly',
    severity: 'critical',
    economicThreshold: 1,
    actionThreshold: 0
  },
  
  bacterialCanker: {
    pestName: 'Bacterial Canker',
    scientificName: 'Clavibacter michiganensis',
    thresholdValue: 0,
    thresholdUnit: 'any presence',
    monitoringMethod: 'Visual scouting for wilting and cankers',
    actionTrigger: 'When bacterial canker is found',
    controlMeasures: [
      'Quarantine affected rows immediately',
      'Target: Less than 100 plants pulled out per GH per year',
      'Remove and destroy infected plants',
      'Disinfect tools and hands frequently',
      'Apply copper-based bactericides',
      'Improve sanitation protocols',
      'Isolate affected area from healthy plants'
    ],
    targetLevel: 'Zero tolerance - immediate quarantine',
    frequency: 'weekly',
    severity: 'critical',
    economicThreshold: 1,
    actionThreshold: 0
  },
  
  fusarium: {
    pestName: 'Fusarium',
    scientificName: 'Fusarium oxysporum f. sp. lycopersici',
    thresholdValue: 1000,
    thresholdUnit: 'plants affected per year',
    monitoringMethod: 'Visual scouting for yellowing and wilting',
    actionTrigger: 'When more than 1000 Fusarium plants are found',
    controlMeasures: [
      'Graft susceptible varieties onto resistant rootstock',
      'Target: Less than 1000 plants pulled out per GH per year',
      'Improve soil drainage and aeration',
      'Maintain optimal soil pH (6.0-6.8)',
      'Remove infected plants and surrounding soil',
      'Apply beneficial microorganisms'
    ],
    targetLevel: 'Less than 1000 plants affected per year',
    frequency: 'weekly',
    severity: 'medium',
    economicThreshold: 1500,
    actionThreshold: 1000
  }
};

/**
 * Nursery Quality Standards from Advanced Dutch Research
 */
export const NURSERY_QUALITY_STANDARDS = {
  whitefly: {
    threshold: 2,
    unit: 'per sticky card per week',
    action: 'Reject delivery if exceeded'
  },
  thrips: {
    threshold: 6,
    unit: 'per sticky card per week', 
    action: 'Reject delivery if exceeded'
  },
  diseases: {
    threshold: 0,
    unit: 'visible diseases',
    action: 'Zero tolerance - reject any diseased plants'
  },
  rejectionRate: {
    target: '<1%',
    scoring: 'Less than 1% rejected = 100 points, every 1% = -25 points'
  }
};

/**
 * Tomato IPM Manager Class
 */
export class TomatoIPMManager {
  static readonly SCORING_SYSTEM = {
    excellent: 100,
    good: 75,
    fair: 50,
    poor: 25,
    critical: 0
  };

  /**
   * Evaluate pest levels against Advanced Dutch Research thresholds
   */
  static evaluatePestLevel(pestType: string, currentCount: number, monitoringMethod: string): {
    status: 'safe' | 'watch' | 'action' | 'critical';
    score: number;
    recommendations: string[];
    threshold: IPMThreshold;
  } {
    const threshold = TOMATO_IPM_THRESHOLDS[pestType];
    if (!threshold) {
      throw new Error(`Unknown pest type: ${pestType}`);
    }

    let status: 'safe' | 'watch' | 'action' | 'critical';
    let score: number;
    const recommendations: string[] = [];

    // Determine status based on current count vs thresholds
    if (currentCount === 0) {
      status = 'safe';
      score = this.SCORING_SYSTEM.excellent;
    } else if (currentCount < threshold.actionThreshold) {
      status = 'watch';
      score = this.SCORING_SYSTEM.good;
      recommendations.push('Monitor closely - approaching action threshold');
    } else if (currentCount >= threshold.actionThreshold && currentCount < threshold.economicThreshold) {
      status = 'action';
      score = this.SCORING_SYSTEM.fair;
      recommendations.push(...threshold.controlMeasures);
    } else {
      status = 'critical';
      score = this.SCORING_SYSTEM.critical;
      recommendations.push('IMMEDIATE ACTION REQUIRED');
      recommendations.push(...threshold.controlMeasures);
    }

    // Apply Advanced Dutch Research scoring penalties
    if (pestType === 'whitefly' && currentCount > 11) {
      score -= (currentCount - 11) * 10; // -10 points for every whitefly above 11
    } else if (pestType === 'thrips' && currentCount > 6) {
      score -= (currentCount - 6) * 10; // -10 points for every thrips above 6
    } else if (['russetMite', 'spiderMite', 'botrytis', 'powderyMildew', 'bacterialCanker'].includes(pestType)) {
      const plantsAffected = currentCount;
      if (plantsAffected > 10) {
        score -= (plantsAffected - 10) * 10; // -10 for every extra plant
      }
    }

    score = Math.max(0, score); // Ensure score doesn't go negative

    return {
      status,
      score,
      recommendations,
      threshold
    };
  }

  /**
   * Generate IPM alerts based on current scouting data
   */
  static generateIPMAlerts(scoutingRecords: IPMScoutingRecord[]): IPMAlert[] {
    const alerts: IPMAlert[] = [];
    
    // Group records by pest type
    const pestGroups = scoutingRecords.reduce((groups, record) => {
      if (!groups[record.pestType]) {
        groups[record.pestType] = [];
      }
      groups[record.pestType].push(record);
      return groups;
    }, {} as Record<string, IPMScoutingRecord[]>);

    Object.entries(pestGroups).forEach(([pestType, records]) => {
      const threshold = TOMATO_IPM_THRESHOLDS[pestType];
      if (!threshold) return;

      const totalCount = records.reduce((sum, record) => sum + record.count, 0);
      const evaluation = this.evaluatePestLevel(pestType, totalCount, records[0]?.scoutingMethod || '');

      if (evaluation.status === 'action' || evaluation.status === 'critical') {
        alerts.push({
          id: `${pestType}-${Date.now()}`,
          pestType,
          alertLevel: evaluation.status === 'critical' ? 'emergency' : 'action',
          currentCount: totalCount,
          thresholdExceeded: totalCount - threshold.actionThreshold,
          recommendedActions: evaluation.recommendations,
          urgency: evaluation.status === 'critical' ? 'critical' : 'high',
          createdAt: new Date(),
          resolved: false
        });
      }
    });

    return alerts;
  }

  /**
   * Calculate overall IPM score based on all pest evaluations
   */
  static calculateOverallIPMScore(scoutingRecords: IPMScoutingRecord[]): {
    overallScore: number;
    pestScores: Record<string, number>;
    status: 'excellent' | 'good' | 'needs_attention' | 'critical';
    recommendations: string[];
  } {
    const pestGroups = scoutingRecords.reduce((groups, record) => {
      if (!groups[record.pestType]) {
        groups[record.pestType] = [];
      }
      groups[record.pestType].push(record);
      return groups;
    }, {} as Record<string, IPMScoutingRecord[]>);

    const pestScores: Record<string, number> = {};
    let totalScore = 0;
    let pestCount = 0;
    const recommendations: string[] = [];

    Object.entries(pestGroups).forEach(([pestType, records]) => {
      const totalCount = records.reduce((sum, record) => sum + record.count, 0);
      const evaluation = this.evaluatePestLevel(pestType, totalCount, records[0]?.scoutingMethod || '');
      
      pestScores[pestType] = evaluation.score;
      totalScore += evaluation.score;
      pestCount++;

      if (evaluation.recommendations.length > 0) {
        recommendations.push(`${pestType}: ${evaluation.recommendations[0]}`);
      }
    });

    const overallScore = pestCount > 0 ? Math.round(totalScore / pestCount) : 100;
    
    let status: 'excellent' | 'good' | 'needs_attention' | 'critical';
    if (overallScore >= 90) status = 'excellent';
    else if (overallScore >= 75) status = 'good';
    else if (overallScore >= 50) status = 'needs_attention';
    else status = 'critical';

    return {
      overallScore,
      pestScores,
      status,
      recommendations: recommendations.slice(0, 5) // Top 5 priorities
    };
  }

  /**
   * Get monitoring schedule based on Advanced Dutch Research protocols
   */
  static getMonitoringSchedule(): Record<string, { frequency: string; method: string; target: string }> {
    const schedule: Record<string, { frequency: string; method: string; target: string }> = {};
    
    Object.entries(TOMATO_IPM_THRESHOLDS).forEach(([pestType, threshold]) => {
      schedule[pestType] = {
        frequency: threshold.frequency,
        method: threshold.monitoringMethod,
        target: threshold.targetLevel
      };
    });

    return schedule;
  }

  /**
   * Validate nursery plant quality against Advanced Dutch Research standards
   */
  static validateNurseryQuality(whitefly: number, thrips: number, hasVisibleDiseases: boolean): {
    passed: boolean;
    score: number;
    issues: string[];
    rejectionRate: number;
  } {
    const issues: string[] = [];
    let passed = true;
    let rejectionRate = 0;

    // Check whitefly levels
    if (whitefly > NURSERY_QUALITY_STANDARDS.whitefly.threshold) {
      issues.push(`Whitefly count (${whitefly}) exceeds threshold (${NURSERY_QUALITY_STANDARDS.whitefly.threshold})`);
      passed = false;
      rejectionRate += 25; // 25% rejection for whitefly issues
    }

    // Check thrips levels
    if (thrips > NURSERY_QUALITY_STANDARDS.thrips.threshold) {
      issues.push(`Thrips count (${thrips}) exceeds threshold (${NURSERY_QUALITY_STANDARDS.thrips.threshold})`);
      passed = false;
      rejectionRate += 25; // 25% rejection for thrips issues
    }

    // Check for visible diseases
    if (hasVisibleDiseases) {
      issues.push('Visible diseases detected - zero tolerance policy');
      passed = false;
      rejectionRate += 50; // 50% rejection for diseases
    }

    const score = passed ? 100 : Math.max(0, 100 - (rejectionRate / 100) * 25);

    return {
      passed,
      score,
      issues,
      rejectionRate: Math.min(100, rejectionRate)
    };
  }
}